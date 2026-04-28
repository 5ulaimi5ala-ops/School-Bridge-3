import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, ListTodo, ShieldCheck, Zap } from 'lucide-react';
import { useData } from '../DataContext';

export const FocusMode: React.FC = () => {
  const { awardPoints } = useData();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      setSessionCount(prev => prev + 1);
      awardPoints(50, 'Steady Learner');
      alert("Session complete! Time for a short break.");
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, awardPoints]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      awardPoints(5);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Immersive Timer Section */}
      <div className="bg-gray-900 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#4f46e5_0%,transparent_50%)]" />
          {isActive && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]" 
            />
          )}
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <Timer className={`w-8 h-8 ${isActive ? 'text-indigo-400 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-400">Focus Session</h2>
          </div>

          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10rem] font-black leading-none tracking-tighter tabular-nums select-none"
          >
            {formatTime(timeLeft)}
          </motion.div>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={resetTimer}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 active:scale-90"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button 
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                isActive 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/40' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40'
              }`}
            >
              {isActive ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-2" />}
            </button>
            <div className="p-6 bg-transparent w-18" /> {/* Spacer */}
          </div>

          <div className="flex gap-4 justify-center">
            <div className="px-5 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              Sessions: {sessionCount}
            </div>
            <div className="px-5 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Focus Score: {sessionCount * 10}
            </div>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Task List</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="What are we focusing on?"
                className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <button 
                onClick={addTask}
                className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      task.completed 
                        ? 'border-green-100 bg-green-50 text-green-700 opacity-60' 
                        : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      task.completed ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform lg:block hidden">
              <ShieldCheck className="w-32 h-32 text-indigo-900" />
            </div>
            <h4 className="text-xl font-bold text-indigo-900 mb-2">Deep Work Protocol</h4>
            <p className="text-indigo-700/80 text-sm leading-relaxed">
              When Focus Mode is active, all notifications are suppressed. 
              The Pomodoro technique helps you maintain high concentration in 25-minute bursts.
            </p>
            <div className="mt-6 flex items-center gap-2 text-indigo-900 font-bold text-sm">
              Learn More <Play className="w-3 h-3 fill-indigo-900" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-6">Expert Tips</h4>
            <div className="space-y-4">
              {[
                "Turn your phone upside down",
                "Have a glass of water ready",
                "Choose one single main task",
                "Take a 5min walk after"
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
