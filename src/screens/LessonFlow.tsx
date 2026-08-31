import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Loader2, WifiOff, RefreshCw, CheckSquare, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Lesson } from '../types';
import { useOnlineStatus } from '../components/NetworkStatus';

export default function LessonFlow() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const whyStatement = useStore((state) => state.whyStatement);
  const completedLessonsCount = useStore((state) => state.completedLessonsCount);
  const language = useStore((state) => state.language);
  const incrementLessonCount = useStore((state) => state.incrementLessonCount);
  const addTask = useStore((state) => state.addTask);
  const tasks = useStore((state) => state.tasks);

  const [step, setStep] = useState(0); // 0=Loading, -1=Offline Notice, 1=Hook, 2=Content, 3=Task Added
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [offlineError, setOfflineError] = useState('');
  
  const hasFetched = useRef(false);

  const fetchLesson = async () => {
    // If client is already detected offline
    if (!navigator.onLine) {
      setOfflineError('Internet connection offline hai. Gemini AI lesson generate karne ke liye cloud connection zaroori hai.');
      setStep(-1);
      return;
    }

    try {
      setStep(0);
      setOfflineError('');
      const response = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          whyStatement, 
          completedLessonsCount,
          coveredTopics: tasks.map(t => t.text),
          language
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.offline || response.status === 503) {
          throw new Error('OFFLINE_NETWORK');
        }
        throw new Error('API_ERROR');
      }

      const data = await response.json();
      setLessonData({ ...data, id: Date.now().toString() });
      setStep(1); // Moving to Hook
    } catch (err: any) {
      console.warn('Lesson fetch failed:', err);
      setOfflineError('Internet connection nahi mil pa raha hai. Gemini AI online work karta hai.');
      setStep(-1); // Show offline state
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchLesson();
  }, [whyStatement, completedLessonsCount]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchLesson();
  };

  const handleUseOfflineDrill = () => {
    // Curated offline fallback drill so user never gets stuck without practice
    const fallbackLessons = [
      {
        id: 'offline-drill-1',
        hook: 'Kya tumhe pata hai, 7 seconds mein first impression ban jaata hai?',
        title: 'The Power of First Impressions (Offline Drill)',
        content: 'Pehli baar kisi se milte waqt body language aur tone of voice sabse pehle notice hoti hai. Agar aapke shoulders relaxed hain aur aap genuine eye contact ke saath halki si smile dete hain, toh saamne wala naturally open feel karta hai.\n\nPractice Principle: Apni presence ko warm aur approachable banayein.',
        reflectionPoint: 'Pichli baar jab aap kisi se mile the, toh aapki body language kaisi thi?',
        task: 'Aaj kisi ek vyakti (neighbor, coworker, ya shopkeeper) ko warm smile aur pleasant greeting dekar interact karein.'
      },
      {
        id: 'offline-drill-2',
        hook: 'Kyun acche listeners sabke favorite ban jaate hain?',
        title: 'Active Listening & Validation (Offline Drill)',
        content: 'Log aksar unhe yaad rakhte hain jo unki baat bina judge kiye dhyan se sunte hain. Kisi ki baat ke dauran beech me interrupt karne ke bajaye unke aakhri 2-3 words ko acknowledge karein.\n\nPractice Principle: Sunna sirf reply dene ke liye nahi, samajhne ke liye hota hai.',
        reflectionPoint: 'Kya aap aksar saamne wale ki baat khatam hone se pehle apna counter-argument sochte hain?',
        task: 'Aaj ki kisi ek conversation mein saamne wale ki baat poori hone tak 2 seconds ka pause lein aur fir reply karein.'
      }
    ];

    const index = completedLessonsCount % fallbackLessons.length;
    setLessonData(fallbackLessons[index]);
    setStep(1);
  };

  const handleNext = () => {
    if (step === 2 && lessonData) {
      // Add task on complete
      addTask(lessonData.task);
      incrementLessonCount();
    }
    setStep((s) => s + 1);
  };

  const handleDone = () => {
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1C1917] flex flex-col p-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400"
          >
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="font-bold text-slate-800 dark:text-slate-200">Crafting personalized AI lesson with Gemini...</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">Tailoring insights to your communication goal</p>
          </motion.div>
        )}

        {step === -1 && (
          <motion.div 
            key="offline-screen"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6"
          >
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center shadow-sm">
              <WifiOff className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-900/50 inline-block mb-3">
                Offline Mode
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                Internet Connection Required
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {offlineError || 'PersuX AI dynamically generates fresh lessons using Gemini API. App offline open ho sakta hai, par naya AI lesson generate karne ke liye internet chahiye.'}
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Check Connection & Retry</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => navigate('/tasks')}
                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-sm"
              >
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>Practice Saved Tasks</span>
              </button>

              <button 
                onClick={handleUseOfflineDrill}
                className="w-full py-3 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Or practice an Offline Micro-Drill</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && lessonData && (
          <motion.div 
            key="hook"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto"
          >
             <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl shadow-sm">
                🤔
             </div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
               {lessonData.hook}
             </h2>
             <button 
               onClick={handleNext}
               className="mt-8 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
             >
               Let's Find Out <ArrowRight className="w-5 h-5" />
             </button>
          </motion.div>
        )}

        {step === 2 && lessonData && (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col pt-4 pb-20 max-w-md mx-auto w-full"
          >
             <div className="mb-6">
               <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wider uppercase mb-1 block">
                 Lesson {completedLessonsCount + 1}
               </span>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lessonData.title}</h1>
             </div>

             <div className="prose prose-slate dark:prose-invert bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 font-medium text-[16px]">
               {lessonData.content}
               
               <div className="my-6 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-400 dark:border-orange-500 p-4 rounded-r-2xl">
                 <p className="text-orange-900 dark:text-orange-200 font-medium italic m-0 text-sm">
                  Reflect: {lessonData.reflectionPoint}
                 </p>
               </div>
             </div>

             <button 
               onClick={handleNext}
               className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
             >
               I Understand The Principle
             </button>
          </motion.div>
        )}

        {step === 3 && lessonData && (
          <motion.div 
            key="task"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-sm mx-auto"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lesson Complete!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">Your micro-task for today has been added to the tracker.</p>
            
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-200 dark:border-slate-600 p-5 rounded-3xl w-full mb-8 text-indigo-900 dark:text-indigo-100 font-semibold shadow-sm text-sm leading-relaxed">
              {lessonData.task}
            </div>

            <button 
               onClick={handleDone}
               className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all"
             >
               See My Tasks
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
