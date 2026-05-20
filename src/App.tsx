import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import Login from './screens/Login';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import LessonFlow from './screens/LessonFlow';
import Tasks from './screens/Tasks';
import Buddy from './screens/Buddy';
import Profile from './screens/Profile';

export default function App() {
  const user = useStore((state) => state.user);
  const whyStatement = useStore((state) => state.whyStatement);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/buddy/:id" element={<Buddy />} />
      
      {!user ? (
        <Route path="*" element={<Login />} />
      ) : !whyStatement ? (
        <Route path="*" element={<Onboarding />} />
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lesson" element={<LessonFlow />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}
