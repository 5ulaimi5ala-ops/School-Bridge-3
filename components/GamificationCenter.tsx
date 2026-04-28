import React from 'react';
import { motion } from 'motion/react';
import { Award, Trophy, Star, Zap, Target, Flame } from 'lucide-react';
import { useData } from '../DataContext';

export const GamificationCenter: React.FC = () => {
  const { currentUser } = useData();

  if (!currentUser || currentUser.role !== 'student') return null;

  const badgeIcons: Record<string, React.ReactNode> = {
    'First Inquiry': <Sparkles className="w-6 h-6 text-yellow-500" />,
    'Curiosity Catalyst': <Zap className="w-6 h-6 text-blue-500" />,
    'Steady Learner': <Flame className="w-6 h-6 text-orange-500" />,
    'Class Hero': <Trophy className="w-6 h-6 text-indigo-500" />,
  };

  const level = Math.floor(currentUser.points / 100) + 1;
  const progress = (currentUser.points % 100);

  return (
    <div className="space-y-6">
      {/* Levels & Points */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Star className="w-3 h-3 fill-white" />
              Level {level} Student
            </div>
            <h2 className="text-4xl font-black">{currentUser.points} <span className="text-indigo-200 text-xl font-medium">Points</span></h2>
            <p className="text-indigo-100/80 text-sm">You're doing great! {100 - progress} more to Level {level + 1}</p>
          </div>

          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-indigo-200">
              <span>Next Level Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-4 bg-indigo-900/40 rounded-full p-1 border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentUser.badges.length === 0 ? (
          <div className="col-span-full py-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No badges yet. Start learning to unlock!</p>
          </div>
        ) : (
          currentUser.badges.map((badge, idx) => (
            <motion.div
              key={badge}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all cursor-default"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                {badgeIcons[badge] || <Trophy className="w-8 h-8 text-indigo-400" />}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 leading-tight">{badge}</h4>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Achieved</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Challenge Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Current Challenges</h3>
            <p className="text-gray-500 text-sm">Earn massive points today</p>
          </div>
          <Target className="w-10 h-10 text-indigo-100" />
        </div>

        <div className="space-y-4">
          {[
            { name: "First Reply of the Day", reward: 25, progress: 1, total: 1, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "3 AI Chat Sessions", reward: 50, progress: 1, total: 3, icon: <Bot className="w-4 h-4" /> },
            { name: "Check-in Mood 5 Days", reward: 100, progress: 2, total: 5, icon: <Flame className="w-4 h-4" /> },
          ].map((challenge) => (
            <div key={challenge.name} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                {challenge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-800 truncate">{challenge.name}</span>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+{challenge.reward} XP</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500"
                    style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs font-bold text-gray-400">
                {challenge.progress}/{challenge.total}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { MessageSquare, Bot, Sparkles } from 'lucide-react';
