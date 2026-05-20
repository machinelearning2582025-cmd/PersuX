import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { Task } from '../types';

export default function Tasks() {
  const tasks = useStore((state) => state.tasks);
  const completeTaskStore = useStore((state) => state.completeTask);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => !t.completed && t.date === todayStr);
  const historicTasks = tasks.filter(t => t.completed || t.date !== todayStr);

  const openReflection = (id: string) => {
    setActiveTaskId(id);
    setReflection('');
  };

  const submitReflection = async () => {
    if (!activeTaskId || !reflection.trim()) return;
    setIsSubmitting(true);
    
    try {
      const taskObj = tasks.find(t => t.id === activeTaskId);
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskObj?.text, reflection })
      });
      const data = await res.json();
      
      completeTaskStore(activeTaskId, reflection, data.reply);
      setActiveTaskId(null);
    } catch (e) {
       // fallback
       completeTaskStore(activeTaskId, reflection, "Great job taking action today! Keep it up. 💪");
       setActiveTaskId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Today's Tasks</h1>

      {pendingTasks.length === 0 ? (
        <div className="bg-slate-100 p-8 rounded-3xl text-center border border-slate-200 border-dashed">
           <div className="text-4xl mb-4">🏆</div>
           <h3 className="font-bold text-slate-700">All caught up!</h3>
           <p className="text-slate-500 text-sm mt-2 font-medium">You completed your real-world tasks for today. See you tomorrow!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((t) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-indigo-50 p-5 rounded-3xl shadow-sm relative overflow-hidden"
            >
              {activeTaskId === t.id ? (
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-800 text-sm">Reflection</h4>
                   <p className="text-xs text-slate-500">Kya hua? Kaisa laga? (1-2 lines)</p>
                   <textarea
                     value={reflection}
                     onChange={(e) => setReflection(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                     placeholder="Pehle thoda awkward laga, but wo smile back kiya..."
                   />
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setActiveTaskId(null)}
                       className="flex-1 py-3 font-semibold text-slate-500 bg-slate-100 rounded-xl"
                     >Cancel</button>
                     <button 
                        onClick={submitReflection}
                        disabled={isSubmitting || !reflection.trim()}
                        className="flex-2 flex-grow py-3 font-semibold text-white bg-indigo-600 rounded-xl flex items-center justify-center gap-2"
                     >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Complete</span>}
                     </button>
                   </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => openReflection(t.id)}
                    className="mt-1 w-7 h-7 rounded-full border-2 border-slate-300 flex-shrink-0 hover:border-indigo-500 transition-colors"
                  ></button>
                  <p className="font-medium text-slate-800 leading-snug pt-1 flex-1">{t.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {historicTasks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Completed</h2>
          <div className="space-y-4">
            {historicTasks.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm opacity-80">
                <div className="flex gap-3 items-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-slate-500 line-through truncate">{t.text}</p>
                </div>
                {t.reflection && (
                  <div className="bg-slate-50 p-4 rounded-2xl mb-3">
                    <p className="text-xs text-slate-500 mb-1 font-bold">Your Reflection:</p>
                    <p className="text-sm text-slate-700 italic">"{t.reflection}"</p>
                  </div>
                )}
                {t.aiReply && (
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 items-start">
                    <div className="bg-indigo-100 p-1.5 rounded-xl shrink-0">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400 font-bold mb-1">AI Coach</p>
                      <p className="text-sm text-indigo-900 font-medium">{t.aiReply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
