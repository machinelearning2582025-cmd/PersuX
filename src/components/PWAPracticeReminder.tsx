import { useState, useEffect } from 'react';
import { Bell, BellRing, Clock, Check, Sparkles, AlertCircle } from 'lucide-react';
import { 
  getStoredNotificationConfig, 
  saveNotificationConfig, 
  requestNotificationPermission, 
  triggerTestNotification, 
  NotificationSchedule 
} from '../lib/pwa';

export default function PWAPracticeReminder() {
  const [config, setConfig] = useState<NotificationSchedule>(getStoredNotificationConfig);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async () => {
    if (!config.enabled) {
      setErrorMsg('');
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const newConfig = { ...config, enabled: true };
        setConfig(newConfig);
        saveNotificationConfig(newConfig);
      } else if (perm === 'denied') {
        setErrorMsg('Notification permission browser mein blocked hai. Kripya browser settings se notifications enable karein.');
      }
    } else {
      const newConfig = { ...config, enabled: false };
      setConfig(newConfig);
      saveNotificationConfig(newConfig);
    }
  };

  const handleTimeChange = (newTime: string) => {
    const newConfig = { ...config, time: newTime };
    setConfig(newConfig);
    saveNotificationConfig(newConfig);
  };

  const handleTestNotification = async () => {
    setErrorMsg('');
    try {
      await triggerTestNotification(
        'PersuX Daily Practice Alert 👑',
        'Shaandar! Yeh aapka daily communication drill reminder hai. Streak continue rakhne ke liye abhi 3 min practice karein!'
      );
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Notification trigger karne mein dikkat aayi.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Daily Drill Notifications</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Daily practice reminders & streak alerts</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
          role="switch"
          aria-checked={config.enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-normal">
        Rozana sahi samay par 1 micro-drill practice karne se communication habits banti hain. Web Notification API ke zariye reminder prapt karein.
      </p>

      {config.enabled && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Reminder Time:</span>
            </label>
            <input
              type="time"
              value={config.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestNotification}
              className="w-full py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20"
            >
              {testSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Test Notification Sent! 🔔</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Test Notification Abhi Bhejein</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
