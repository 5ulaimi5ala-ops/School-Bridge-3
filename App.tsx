import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataProvider, useData } from './DataContext';
import { Role } from './types';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { AIChatBuddy } from './components/AIChatBuddy';
import { GraduationCap, Users, Heart, ChevronRight, Sparkles, BrainCircuit } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { login } = useData();
  const [role, setRole] = React.useState<Role | null>(null);
  const [name, setName] = React.useState('');
  const [childId, setChildId] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const roles = [
    { id: 'student', title: 'Student', icon: <GraduationCap className="w-8 h-8" />, desc: 'Learn, grow & earn XP' },
    { id: 'teacher', title: 'Teacher', icon: <Users className="w-8 h-8" />, desc: 'Guide & support classes' },
    { id: 'parent', title: 'Parent', icon: <Heart className="w-8 h-8" />, desc: 'Monitor family progress' }
  ];

  const handleFinish = async () => {
    if (name.trim()) {
      setIsLoggingIn(true);
      try {
        await login(role!, name, role === 'parent' ? childId : undefined);
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
        <Sparkles className="w-96 h-96 text-indigo-900" />
      </div>
      <div className="absolute bottom-0 left-0 p-24 opacity-5 pointer-events-none">
        <BrainCircuit className="w-96 h-96 text-indigo-900 rotate-45" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl relative z-10 border border-gray-100"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-indigo-100 mx-auto mb-8">
            SB
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Welcome to SchoolBridge</h1>
          <p className="text-gray-500 font-medium mt-2">The future of collaborative learning.</p>
        </div>

        {!role ? (
          <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-gray-400 mb-8 p-1 bg-gray-50 rounded-full inline-block mx-auto relative left-1/2 -translate-x-1/2 px-4 shadow-sm">Pick Your Role</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as Role)}
                  className="p-8 bg-gray-50 border-2 border-transparent hover:border-indigo-100 rounded-[2.5rem] transition-all group flex flex-col items-center text-center gap-4 hover:bg-indigo-50/50"
                >
                  <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform group-hover:text-white group-hover:bg-indigo-600">
                    {r.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{r.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 ml-4">Full Name</label>
              <input
                autoFocus
                placeholder="How should we call you?"
                className="w-full text-2xl font-bold p-8 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-100/50 rounded-[2rem] outline-none transition-all placeholder:text-gray-300 shadow-inner"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {role === 'parent' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 ml-4">Child's Student ID</label>
                <input
                  placeholder="Enter Student ID..."
                  className="w-full text-xl font-bold p-6 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-rose-100/50 rounded-2xl outline-none transition-all placeholder:text-gray-300"
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                />
              </motion.div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setRole(null)}
                className="px-8 py-5 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                Back
              </button>
              <button
                disabled={!name.trim() || (role === 'parent' && !childId.trim()) || isLoggingIn}
                onClick={handleFinish}
                className="flex-1 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoggingIn ? 'Signing in...' : 'Explore SchoolBridge'} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentUser, loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentUser) return <Onboarding />;


  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUser.role}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
        >
          {currentUser.role === 'student' && <StudentDashboard />}
          {currentUser.role === 'teacher' && <TeacherDashboard />}
          {currentUser.role === 'parent' && <ParentDashboard />}
        </motion.div>
      </AnimatePresence>
      
      {currentUser.role === 'student' && <AIChatBuddy />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <MainContent />
  );
};

export default App;
