import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, PlayCircle, Trophy, Users, ShieldAlert, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Dashboard() {
  const user = useStore((state) => state.user);
  const whyStatement = useStore((state) => state.whyStatement);
  const streak = useStore((state) => state.streak);
  const tasks = useStore((state) => state.tasks);
  const badges = useStore((state) => state.badges);
  const pendingStreakRestore = useStore((state) => state.pendingStreakRestore);
  const restoreStreak = useStore((state) => state.restoreStreak);
  const checkStreak = useStore((state) => state.checkStreak);
  const completedLessons = useStore((state) => state.completedLessonsCount);
  const navigate = useNavigate();

  const [restoreReason, setRestoreReason] = useState('');
  const [showRestoreInput, setShowRestoreInput] = useState(false);

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTasks = tasks.filter((t) => !t.completed && t.date === todayStr).length;
  
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalXP = completedLessons * 10 + completedTasksCount * 10;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const skillProgress = totalXP % 100;

  const handleRestore = () => {
     if (restoreReason.trim().length > 5) {
        restoreStreak(restoreReason);
        setShowRestoreInput(false);
     } else {
        alert("Please write a meaningful reason (at least a few words).");
     }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hello, {user?.name}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-full border border-orange-100 dark:border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-orange-600 dark:text-orange-400">{streak} Day Streak</span>
        </div>
      </header>

      {/* Streak Freeze Alert */}
      <AnimatePresence>
         {pendingStreakRestore && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-5 rounded-3xl"
           >
              <div className="flex items-start gap-3">
                 <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                 <div>
                    <h3 className="font-bold text-rose-900 dark:text-rose-400">Streak at risk!</h3>
                    <p className="text-rose-700 dark:text-rose-300 text-sm mt-1 mb-4">
                       You missed yesterday. You can restore your {pendingStreakRestore}-day streak by explaining what happened.
                    </p>
                    {!showRestoreInput ? (
                       <button onClick={() => setShowRestoreInput(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform shadow-sm">
                         Use Streak Freeze
                       </button>
                    ) : (
                       <div className="space-y-3">
                          <textarea 
                             value={restoreReason}
                             onChange={e => setRestoreReason(e.target.value)}
                             placeholder="Why did you miss yesterday? How will you bounce back?"
                             className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-slate-900 dark:text-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-400"
                             rows={2}
                          />
                          <button onClick={handleRestore} className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform shadow-sm">
                            Submit & Restore
                          </button>
                       </div>
                    )}
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Why Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex items-center gap-2 mb-4 text-indigo-300">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Your Why</span>
        </div>
        <p className="text-lg font-medium leading-relaxed mb-4 relative z-10 italic text-slate-100">
          "{whyStatement}"
        </p>
      </motion.div>

      {/* Primary Action */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <button 
          onClick={() => navigate('/lesson')}
          className="w-full group relative bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-3xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <PlayCircle className="w-7 h-7 fill-white text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Start Today's Lesson</h3>
              <p className="text-indigo-100 text-sm">Takes 3 minutes</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
            →
          </div>
        </button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={() => navigate('/tasks')}
          className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <span className="font-bold text-lg">{activeTasks}</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Pending Tasks</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready to complete</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={() => navigate(`/buddy/${user?.id}`)}
          className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Buddy Link</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep accountable</p>
        </motion.div>
      </div>

      {/* Badges Section */}
      {(() => {
        const levelMedals = [];
        for (let i = 1; i < currentLevel; i++) {
          levelMedals.push(`Level ${i} Medal`);
        }
        const allBadges = [...(badges || []), ...levelMedals];
        
        if (allBadges.length === 0) return null;
        return (
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
             className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-x-auto"
          >
             {allBadges.map(b => (
                <div key={b} className="flex flex-col items-center flex-shrink-0 w-24 gap-2">
                   <div className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-800 shadow-sm bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                      {b.includes('Level') ? '🏅' : <Award className="w-6 h-6" />}
                   </div>
                   <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center uppercase tracking-wider">{b}</span>
                </div>
             ))}
          </motion.div>
        );
      })()}

      {/* Mini Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
              L{currentLevel}
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Current Level</h4>
          </div>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{skillProgress}% to Level {currentLevel + 1}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${skillProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
