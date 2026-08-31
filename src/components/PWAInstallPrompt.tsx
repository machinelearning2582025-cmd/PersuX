import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed event
    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsStandalone(true), 1500);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If already running in native standalone PWA mode, show verified badge
  if (isStandalone) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">Native PWA Standalone Active</h4>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">App home screen se launch hui hai with offline caching.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-indigo-800/40">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-300 backdrop-blur-sm shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300 block">
            Add To Home Screen
          </span>
          <h3 className="font-bold text-sm">Install PersuX Mobile App</h3>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
        Browser URL bar hide karein aur native fullscreen app feel paayein with 100% offline support.
      </p>

      {installed ? (
        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span>App Installed Successfully! 🎉</span>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-transform active:scale-95 shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>{isIOS ? 'iOS Safari Install Guide' : 'Install App (1-Click)'}</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs text-slate-200"
          >
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <span>Safari mein bottom bar par <Share className="w-3.5 h-3.5 inline text-indigo-300 mx-0.5" /> <strong>Share</strong> button dabayein.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <span>Niche scroll karke <strong>"Add to Home Screen ➕"</strong> par tap karein.</span>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 text-[11px] text-indigo-300 font-bold hover:underline block text-center w-full"
            >
              Samajh gaya / Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
