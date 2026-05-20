import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, Share2, Copy, Check } from 'lucide-react';
import { useStore } from '../store';

export default function Buddy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  // Real app would fetch this user's data from backend using the `id`.
  // For this MVP, we will use the local store if it matches, else fake it to demonstrate the UI.
  const currentUser = useStore(state => state.user);
  const tasks = useStore(state => state.tasks);
  
  const isOwnProfile = currentUser?.id === id;
  const displayName = isOwnProfile ? currentUser?.name : 'Rahul'; // Fake name for demo
  
  // Fake last 7 days data based on tasks
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    let completed = false;
    if (isOwnProfile) {
       completed = tasks.some(t => t.date === dateStr && t.completed);
    } else {
       // Fake data for preview
       completed = Math.random() > 0.4;
    }
    
    return {
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed
    };
  });

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      {isOwnProfile && (
        <button onClick={() => navigate(-1)} className="mb-6 w-10 h-10 bg-slate-100 flex items-center justify-center rounded-2xl text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
           <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{displayName}'s Accountability</h1>
        <p className="text-slate-400 text-sm font-medium">Tracking daily communication practice.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <h3 className="font-bold text-slate-900 mb-6 text-center">Last 7 Days</h3>
        <div className="flex justify-between items-center">
          {last7Days.map((ds, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{ds.dayName}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
                ds.completed ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-100 text-slate-300'
              }`}>
                {ds.completed ? '✅' : '✖'}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-slate-400 mt-6 font-medium">
          Note: For privacy, only completion status is shared. No task details or reflections are visible.
        </p>
      </div>

      {isOwnProfile ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center">
          <h3 className="font-bold text-indigo-900 mb-2">Invite a Buddy</h3>
          <p className="text-sm text-indigo-600 mb-6 font-medium">
            Share this link with a friend so they can keep you accountable.
          </p>
          <button 
            onClick={handleCopy}
            className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-bold shadow-sm flex justify-center items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-3xl p-6 text-center">
           <h3 className="font-bold text-slate-900 mb-2">Want to build your confidence?</h3>
           <button 
             onClick={() => navigate('/')}
             className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-bold shadow-md"
           >
             Start Your Own Journey
           </button>
        </div>
      )}
    </div>
  );
}
