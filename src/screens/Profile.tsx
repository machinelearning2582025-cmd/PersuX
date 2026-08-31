import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, LogOut, Check, Copy, Flame, BookOpen, Shield, CloudLightning, Moon, Sun, Monitor } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useStore } from '../store';
import { User } from '../types';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PWAPracticeReminder from '../components/PWAPracticeReminder';

export default function Profile() {
  const user = useStore((state) => state.user);
  const streak = useStore((state) => state.streak);
  const completedLessonsCount = useStore((state) => state.completedLessonsCount);
  const tasks = useStore((state) => state.tasks);
  const badges = useStore((state) => state.badges) || [];
  const logout = useStore((state) => state.logout);
  const loginSynced = useStore((state) => state.loginSynced);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalXP = completedLessonsCount * 10 + completedTasksCount * 10;
  const currentLevel = Math.floor(totalXP / 100) + 1;

  const levelMedals = [];
  for (let i = 1; i < currentLevel; i++) {
    levelMedals.push(`Level ${i} Medal`);
  }
  const allBadges = [...badges, ...levelMedals];

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSyncWithGoogle = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const syncedUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Learner',
        email: fbUser.email || undefined,
        photoURL: fbUser.photoURL || undefined,
        synced: true,
      };

      await loginSynced(syncedUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Google login fail ho gaya. Kripya dubaara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
    logout();
  };

  const handleCopy = () => {
    if (!user) return;
    const shareUrl = `${window.location.origin}/buddy/${user.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-6 pb-24 dark:text-slate-100"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile</h1>
        {user?.synced && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Synced
          </span>
        )}
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6 flex items-center gap-4">
        {user?.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.name} 
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg truncate leading-snug">{user?.name}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
            {user?.synced ? user.email : 'Local Guest Account'}
          </p>
        </div>
      </div>

      {/* Cloud Sync Promotion Card if not logged in */}
      {!user?.synced && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6 border border-slate-800">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-3">
            <CloudLightning className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Real-time Cloud Sync</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium mb-5">
            Apne lessons, active streak aur unlocked rewards ko cloud par hamesha safe rakhne ke liye apne unique Google account se connect karein.
          </p>

          <button
            onClick={handleSyncWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.535 10.793-10.985 0-.74-.08-1.305-.175-1.78l-10.618-.43z" />
              </svg>
            )}
            <span className="font-extrabold tracking-wide uppercase">Google Sync Connect</span>
          </button>
          {errorMsg && <p className="text-[11px] text-rose-400 font-bold mt-3 text-center">{errorMsg}</p>}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/10" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold block mb-1">Active Streak</span>
          <span className="text-xl font-black text-slate-800 dark:text-white">{streak} Days</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-5 shadow-sm text-center">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold block mb-1">Lessons Done</span>
          <span className="text-xl font-black text-slate-800 dark:text-white">{completedLessonsCount} Done</span>
        </div>
      </div>

      {/* Appearance / Theme Selector */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              theme === 'system' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Auto</span>
          </button>
        </div>
      </div>

      {/* Share / Buddy Section (only if synced so we have persistent URLs) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Accountability Buddy</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium leading-relaxed mb-4">
          Buddy Link share karke kisi dost ko invite karein, jo aapki daily completion status par nazar rakh sake aur aapko motivate kare!
        </p>
        <button 
          onClick={handleCopy}
          className="w-full py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-xs flex justify-center items-center gap-2 border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Link Copied!' : 'Copy Shareable Link'}
        </button>
      </div>

      {/* PWA App Install Banner */}
      <div className="mb-6">
        <PWAInstallPrompt />
      </div>

      {/* Notification Preferences */}
      <div className="mb-6">
        <PWAPracticeReminder />
      </div>

      {/* Badges Earned */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Unlocked Rewards</h4>
        </div>
        
        {allBadges.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 font-medium leading-relaxed">
            Abhi koi badge unlocked nahi hai. Lessons lene pe rewards milenge! 🚀
          </p>
        ) : (
          <div className="space-y-3">
            {allBadges.map((badgeName) => (
              <div 
                key={badgeName}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-700"
              >
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm rounded-xl">
                  {badgeName.includes('Level') ? '🏅' : '🏆'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{badgeName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{badgeName.includes('Level') ? 'Unlocked by gaining skill levels' : 'Unlocked through communication streak'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs transition-colors shadow-sm active:scale-95 border border-rose-100 dark:border-rose-900/50"
      >
        <LogOut className="w-4 h-4" />
        <span>LOGOUT FROM PROGRESS</span>
      </button>

    </motion.div>
  );
}
