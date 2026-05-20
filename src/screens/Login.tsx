import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { User } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const loginSynced = useStore((state) => state.loginSynced);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
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
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Google Login fail ho gaya. Kripya dubaara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-900 text-center w-full max-w-md mx-auto shadow-xl relative border-x border-slate-200 dark:border-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <div className="mx-auto w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mb-6 transform rotate-3">
          <span className="text-3xl">🚀</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">PersuX</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Practice speaking, every day.</p>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <input
              type="text"
              placeholder="What's your name?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors shadow-md active:scale-95 transition-transform"
          >
            <span>Start Learning Free</span>
            <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="relative my-6 flex py-1 items-center">
          <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or sign in with</span>
          <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 transform transition-transform cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-500 dark:text-slate-400" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 15.01 1 12 1 7.37 1 3.42 3.66 1.48 7.56l3.89 3.02C6.31 7.55 8.94 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.66-2.31 3.48l3.6 2.79c2.1-1.94 3.77-5.18 3.77-8.42z" />
              <path fill="#FBBC05" d="M5.37 10.58c-.24-.72-.37-1.49-.37-2.28 0-.79.13-1.56.37-2.28L1.48 3.02C.53 4.92 0 7.07 0 9.3s.53 4.38 1.48 6.28l3.89-3z" />
              <path fill="#34A853" d="M12 18.96c-3.06 0-5.69-2.51-6.63-5.54l-3.89 3.02c1.94 3.9 5.89 6.56 10.52 6.56 3.12 0 5.92-1.01 7.96-2.82l-3.6-2.79c-1.12.77-2.54 1.25-4.36 1.25z" />
            </svg>
          )}
          <span className="text-slate-700 dark:text-slate-200 text-sm font-bold">Google Sign-In</span>
        </button>

        {errorMsg && <p className="text-xs text-rose-500 font-bold mt-2">{errorMsg}</p>}
        
        <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          Sign up instantly. 100% Free MVP.
        </p>
      </motion.div>
    </div>
  );
}
