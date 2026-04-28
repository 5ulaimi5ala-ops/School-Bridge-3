import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../DataContext';

const MOODS = [
  { emoji: '😊', label: 'Great', color: 'bg-green-100 text-green-600 border-green-200' },
  { emoji: '😐', label: 'Okay', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { emoji: '😞', label: 'Sad', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { emoji: '😫', label: 'Stressed', color: 'bg-red-100 text-red-600 border-red-200' },
  { emoji: '🥱', label: 'Tired', color: 'bg-purple-100 text-purple-600 border-purple-200' },
];

export const EmotionalTrack: React.FC = () => {
  const { currentUser, updateMood, awardPoints } = useData();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Check if already checked in today
  const lastMood = currentUser?.moods[0];
  const isToday = lastMood && new Date(lastMood.timestamp).toDateString() === new Date().toDateString();

  const handleSubmit = () => {
    if (!selectedMood) return;
    updateMood(selectedMood, note);
    awardPoints(10);
    setSubmitted(true);
  };

  if (isToday || submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Feeling checked!</h3>
        <p className="text-gray-500 text-sm">Thanks for sharing how you feel, {currentUser?.name}. It helps us support you better.</p>
        
        {lastMood?.emoji === '😫' && (
          <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-bold">Stressed? Take a breather.</p>
              <p className="text-red-700 text-xs mt-1">Try the 4-7-8 breathing technique, or reach out to your teacher privately. You're not alone!</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Heart className="w-24 h-24 text-rose-500" />
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900">How are you today?</h3>
          <p className="text-gray-500 text-sm">A quick check-in to make sure you're doing okay.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m.emoji)}
              className={`flex-1 min-w-[100px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedMood === m.emoji 
                  ? `${m.color} ring-4 ring-offset-2 ring-indigo-100` 
                  : 'bg-gray-50 border-transparent hover:border-gray-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <span className="text-4xl">{m.emoji}</span>
              <span className="font-bold text-xs uppercase tracking-wider">{m.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4 overflow-hidden"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything on your mind? (Optional)"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] transition-all"
              />
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Submit Check-in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
