import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Lesson } from '../types';

export default function LessonFlow() {
  const navigate = useNavigate();
  const whyStatement = useStore((state) => state.whyStatement);
  const completedLessonsCount = useStore((state) => state.completedLessonsCount);
  const incrementLessonCount = useStore((state) => state.incrementLessonCount);
  const addTask = useStore((state) => state.addTask);
  const tasks = useStore((state) => state.tasks);

  const [step, setStep] = useState(0); // 0=Loading, 1=Hook, 2=Content, 3=Task Added
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Fetch lesson from API
    const fetchLesson = async () => {
      try {
        const response = await fetch('/api/lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            whyStatement, 
            completedLessonsCount,
            coveredTopics: tasks.map(t => t.text)
          })
        });
        const data = await response.json();
        setLessonData({ ...data, id: Date.now().toString() });
        setStep(1); // Moving to Hook
      } catch (err) {
        console.error(err);
        
        // Comprehensive fallback pool for a reliable dynamic offline experience
        const fallbackLessons = [
          {
            id: 'fallback-1',
            hook: 'Kya tumhe pata hai, 7 seconds mein impression ban jaata hai?',
            title: 'The Magic of 7 Seconds',
            content: 'Pehli baar kisi se milna hamesha thoda awkward lagta hai. Lekin psychology kehti hai ki first impression sirf pehle 7 seconds mein form ho jaata hai. Tumhari smile, body language, aur sabse pehla "Hello" sab decide karte hain.\n\nImagine karo tum kisi room mein enter kar rahe ho aur tumhare shoulders jhuke hue hain. Usse automatically samne wale ko message jaata hai ki tum confident nahi ho.',
            reflectionPoint: 'Socho, aaj subah tumne pehli baar kisse baat ki, aur tumhari body language kaisi thi?',
            task: 'Aaj canteen ya lift mein ek anjaan aadmi ya junior ko halki si smile dekarke greeting karo.'
          },
          {
            id: 'fallback-2',
            hook: 'Kya aapko pta hai, ache listeners logon ke favorite kyu hote hain?',
            title: 'The Art of Active Listening',
            content: 'Log asaliyat mein unhe pasand karte hain jo unki baatein dhyan se sunte hain. Jab koi aapse baat kare, to beech me unhe interrupt na karein aur thoda nod karke "Sahi baat hai" ya "Accha" kahein.\n\nJab aap active listen karte hain, to saamne wale ko lagta hai ki unka opinion aapke liye matter karta hai.',
            reflectionPoint: 'Kya aap aksar log jab baat kar rahe hote hain tab apna reply sochte hain, ya sach me sunte hain?',
            task: 'Aaj kisi dost se baat karte waqt unki baat ke aakhri 3 words ko halka sa repeat kark apne feedback me use karein.'
          },
          {
            id: 'fallback-3',
            hook: 'Kya aapne notice kiya hai, ek chota sa sacha appreciation din bana deta hai?',
            title: 'The Power of Unconditional Praise',
            content: 'Fake taareef sab pakad lete hain, par genuine appreciation sabka dil jeet leta hai. Agar aapko kisi ka clothes, unka smile, ya unka kaam sach me accha lage, to unhe directly boliye bina kisi double meaning ke.\n\nSachhi appreciation se relationships bohot jaldi strong bante hain.',
            reflectionPoint: 'Kya aapne pichle 2 din mein kisi ki dil se taareef ki hai? Kaisa feel hua unhe?',
            task: 'Aaj kisi ek coworker ya family member ko unke kisi achi quality ya help ke liye "Thank you, aap bohot acchi madad karte ho" dil se boliye.'
          }
        ];

        // Selection based on completed index so it remains diverse
        const index = completedLessonsCount % fallbackLessons.length;
        setLessonData(fallbackLessons[index]);
        setStep(1);
      }
    };
    fetchLesson();
  }, [whyStatement, completedLessonsCount]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400"
          >
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 dark:text-indigo-400" />
            <p className="font-medium">Crafting your personalized lesson...</p>
          </motion.div>
        )}

        {step === 1 && lessonData && (
          <motion.div 
            key="hook"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
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
            className="flex-1 flex flex-col pt-4 pb-20"
          >
             <div className="mb-8">
               <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wider uppercase mb-2 block">
                 Lesson {completedLessonsCount + 1}
               </span>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{lessonData.title}</h1>
             </div>

             <div className="prose prose-slate dark:prose-invert bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 font-medium text-[17px]">
               {lessonData.content}
               
               <div className="my-8 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-400 dark:border-orange-500 p-5 rounded-r-2xl">
                 <p className="text-orange-900 dark:text-orange-200 font-medium italic m-0">
                  Reflect: {lessonData.reflectionPoint}
                 </p>
               </div>
             </div>

             <button 
               onClick={handleNext}
               className="mt-8 w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
             >
               I Understand The Principle
             </button>
          </motion.div>
        )}

        {step === 3 && lessonData && (
          <motion.div 
            key="task"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Lesson Complete!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your task for today has been added to the tracker.</p>
            
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-200 dark:border-slate-600 p-6 rounded-3xl w-full mb-10 text-indigo-900 dark:text-indigo-100 font-semibold shadow-sm">
              {lessonData.task}
            </div>

            <button 
               onClick={handleDone}
               className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-all"
             >
               See My Tasks
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
