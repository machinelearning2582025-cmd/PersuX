import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store';

export default function Layout() {
  const location = useLocation();
  const tasks = useStore((state) => state.tasks);
  const pendingTasks = tasks.filter(t => !t.completed && t.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto shadow-xl overflow-hidden relative border-x border-slate-200">
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        <Outlet />
      </main>

      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-50">
        <Link to="/" className={cn("flex flex-col items-center gap-1", location.pathname === '/' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600")}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/tasks" className={cn("flex flex-col items-center gap-1 relative", location.pathname === '/tasks' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600")}>
          <div className="relative">
            <CheckSquare className="w-6 h-6" />
            {pendingTasks > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {pendingTasks}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Tasks</span>
        </Link>
        <Link to="/profile" className={cn("flex flex-col items-center gap-1", location.pathname === '/profile' ? "text-indigo-600" : "text-slate-400 hover:text-slate-600")}>
          <UserIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
