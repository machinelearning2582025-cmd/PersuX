import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { OfflineBanner } from './NetworkStatus';

export default function Layout() {
  const location = useLocation();
  const tasks = useStore((state) => state.tasks);
  const pendingTasks = tasks.filter(t => !t.completed && t.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="flex flex-col h-dvh bg-[#FAF8F5] dark:bg-[#1C1917] border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-sans w-full max-w-md mx-auto shadow-2xl overflow-hidden relative border-x">
      <OfflineBanner />
      
      <main className="flex-1 overflow-y-auto w-full h-full pb-24 scroll-smooth">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-[#FAF8F5]/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex justify-between items-center z-50">
        <Link to="/" className={cn("flex flex-col items-center gap-1 transition-colors py-1 px-3 rounded-2xl active:scale-95", location.pathname === '/' ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}>
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium">Home</span>
        </Link>
        <Link to="/tasks" className={cn("flex flex-col items-center gap-1 relative transition-colors py-1 px-3 rounded-2xl active:scale-95", location.pathname === '/tasks' ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}>
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingTasks > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-extrabold shadow-sm">
                {pendingTasks}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium">Tasks</span>
        </Link>
        <Link to="/profile" className={cn("flex flex-col items-center gap-1 transition-colors py-1 px-3 rounded-2xl active:scale-95", location.pathname === '/profile' ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}>
          <UserIcon className="w-5 h-5" />
          <span className="text-[11px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
