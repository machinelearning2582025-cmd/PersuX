// PWA and Notification Management Utility

export interface NotificationSchedule {
  enabled: boolean;
  time: string; // e.g. "09:00" or "20:00"
  lastTriggerDate?: string;
}

const NOTIFICATION_STORAGE_KEY = 'persux_daily_notification_config';

export function getStoredNotificationConfig(): NotificationSchedule {
  try {
    const data = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse notification config:', e);
  }
  return {
    enabled: false,
    time: '09:00',
  };
}

export function saveNotificationConfig(config: NotificationSchedule) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save notification config:', e);
  }
}

// Register Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('PersuX ServiceWorker registered:', reg.scope);
      return reg;
    } catch (err) {
      console.error('PersuX ServiceWorker registration failed:', err);
    }
  }
  return null;
}

// Request Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Notification permission request error:', err);
    return 'denied';
  }
}

// Trigger a local immediate test notification
export async function triggerTestNotification(title?: string, body?: string) {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    throw new Error('Notification permission was not granted by user.');
  }

  const notificationTitle = title || 'PersuX Daily Drill 👑';
  const options: NotificationOptions = {
    body: body || 'Time for your 3-minute communication micro-practice! Keep your streak burning 🔥',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    tag: 'daily-reminder',
    data: {
      url: '/lesson',
    },
  };

  // Try Service Worker registration first (standard for mobile PWAs)
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    if (reg && 'showNotification' in reg) {
      await reg.showNotification(notificationTitle, options);
      return;
    }
  }

  // Fallback to standard Notification constructor
  new Notification(notificationTitle, options);
}

// Check and trigger daily scheduled notification if due
export function checkDailyNotificationSchedule() {
  const config = getStoredNotificationConfig();
  if (!config.enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (config.lastTriggerDate === todayStr) {
    return; // Already triggered today
  }

  const [targetHour, targetMinute] = config.time.split(':').map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // If current time is equal or past scheduled time today
  if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
    triggerTestNotification(
      'PersuX Daily Practice Reminder 👑',
      'Aapka aaj ka 3-minute communication micro-lesson ready hai! Apni streak continue karein.'
    ).then(() => {
      config.lastTriggerDate = todayStr;
      saveNotificationConfig(config);
    }).catch((err) => console.log('Notification schedule check:', err));
  }
}
