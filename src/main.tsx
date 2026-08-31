import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, checkDailyNotificationSchedule } from './lib/pwa';

// Register PWA Service Worker
if (typeof window !== 'undefined') {
  registerServiceWorker();
  checkDailyNotificationSchedule();

  // Periodically check for scheduled daily notification every 15 minutes when app is open
  setInterval(checkDailyNotificationSchedule, 15 * 60 * 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
