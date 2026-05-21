import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { goalsList } from '../data';

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setWhyStatement = useStore((state) => state.setWhyStatement);
  const setLanguage = useStore((state) => state.setLanguage);
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [language, setLanguageState] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStatement, setGeneratedStatement] = useState('');

  const toggleGoal = (label: string) => {
    setSelectedGoals(prev => 
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const generateWhy = async () => {
    if (selectedGoals.length === 0) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/why', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: selectedGoals, extraInfo, language })
      });
      const data = await response.json();
      setGeneratedStatement(data.statement);
    } catch (e) {
      setGeneratedStatement(`Main ${user?.name || ''} hoon. Main apne communication skills ko better karna chahta hoon taaki confidently aage badh saku.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmWhy = () => {
    setWhyStatement(generatedStatement);
    setLanguage(language);
    navigate('/');
  };

  if (generatedStatement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-sm w-full"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mb-6 text-2xl">
            🎯
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your "Why"</h2>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5 rounded-2xl mb-6">
            <label className="block text-[10px] font-bold text-indigo-400 dark:text-indigo-500 tracking-wider uppercase mb-2">Edit your statement if you'd like:</label>
            <textarea 
              value={generatedStatement}
              onChange={e => setGeneratedStatement(e.target.value)}
              className="w-full bg-transparent text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed italic resize-none focus:outline-none text-sm h-32"
            />
          </div>
          <button 
            onClick={confirmWhy}
            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition-transform"
          >
            Confirm & Save
          </button>
          <button 
            onClick={() => setGeneratedStatement('')}
            className="w-full py-3 mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-200"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 py-12 max-w-md mx-auto relative border-x border-slate-200 dark:border-slate-800">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Hi, {user?.name}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Aap kyun seekhna chahte hain?</p>

        <div className="space-y-3 mb-8">
          {goalsList.map((goal) => {
            const isSelected = selectedGoals.includes(goal.label);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.label)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-50 dark:bg-slate-700'}`}>
                  {goal.icon}
                </div>
                <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}>
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-10">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            Aur kuch specific likhna chahte ho? (Optional)
          </label>
          <textarea
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
            placeholder="e.g., Mujhe boss ke saamne nervous feel hota hai..."
            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
          />
        </div>

        <div className="mb-10">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            AI Content Language:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageState(lang)}
                className={`py-2 px-3 rounded-xl border-2 transition-all ${
                  language === lang
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateWhy}
          disabled={selectedGoals.length === 0 || isGenerating}
          className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
            selectedGoals.length === 0 ? 'bg-slate-300 dark:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Create My "Why"</span>
          )}
        </button>
      </motion.div>
    </div>
  );
}
