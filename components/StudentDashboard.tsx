import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, MessageSquare, Target, Zap, Bot, Users, BookOpen, Search, ArrowRight, Star, Heart, Mic, HelpCircle, LogOut, Settings, Trash2, AlertTriangle, X } from 'lucide-react';
import { useData } from '../DataContext';
import { GamificationCenter } from './GamificationCenter';
import { FocusMode } from './FocusMode';
import { EmotionalTrack } from './EmotionalTrack';
import { AITutor } from './AITutor';

export const StudentDashboard: React.FC = () => {
  const { currentUser, classes, messages, replies, postReply, createHelpRequest, logout, deleteAccount } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'tutor' | 'focus' | 'social' | 'settings'>('overview');
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [helpMode, setHelpMode] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [anonHelp, setAnonHelp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      alert("Failed to delete account. You might need to sign in again to perform this sensitive action.");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const studentClasses = classes.filter(c => c.studentIds?.includes(currentUser?.id || ''));

  const submitHelp = () => {
    if (!helpText.trim() || !selectedClass) return;
    createHelpRequest(selectedClass.id, helpText, undefined, anonHelp);
    setHelpText('');
    setHelpMode(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      {/* Side Rail */}
      <div className="w-24 bg-white border-r border-gray-100 flex flex-col items-center py-10 gap-10">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 italic font-black text-xl">
          SB
        </div>
        
        <nav className="flex flex-col gap-6">
          {[
            { id: 'overview', icon: <LayoutDashboard className="w-6 h-6" /> },
            { id: 'classes', icon: <BookOpen className="w-6 h-6" /> },
            { id: 'tutor', icon: <Bot className="w-6 h-6" /> },
            { id: 'focus', icon: <Target className="w-6 h-6" /> },
            { id: 'social', icon: <Users className="w-6 h-6" /> },
            { id: 'settings', icon: <Settings className="w-6 h-6" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-6">
          <button 
            onClick={logout}
            className="p-4 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
            title="Switch Role"
          >
            <LogOut className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-200 to-violet-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {currentUser?.name[0]}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-h-screen overflow-y-auto">
        <header className="p-8 pb-0 flex justify-between items-center bg-[#FDFDFD]/90 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Welcome back, {currentUser?.name}!</h1>
            <p className="text-gray-500 font-medium mt-1">Ready to start today's learning journey?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setHelpMode(true)}
              className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-all border border-rose-100"
            >
              <HelpCircle className="w-5 h-5" />
              Ask Help
            </button>
            <div className="px-5 py-3 bg-amber-50 text-amber-600 rounded-2xl font-bold flex items-center gap-2 border border-amber-100">
              <Star className="w-4 h-4 fill-amber-600" />
              {currentUser?.points} XP
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-8">
                  <GamificationCenter />
                  
                  {/* Latest Discussions */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-gray-900">Active Discussions</h3>
                      <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                        View All <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {messages.filter(m => m.type === 'discussion').slice(0, 3).map((msg) => (
                        <div key={msg.id} className="p-6 rounded-3xl bg-gray-50 border border-gray-50 hover:border-indigo-100 hover:bg-white transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                              {msg.senderName[0]}
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{msg.senderName}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-full">Discussion</span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">{msg.text}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" /> {(replies[msg.id]?.length || 0)} replies
                            </span>
                            <button className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Join Discussion
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <EmotionalTrack />
                  
                  {/* Quick Class Stats */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Your Classes</h3>
                    <div className="space-y-4">
                      {studentClasses.map((c) => (
                        <button 
                          key={c.id}
                          className="w-full text-left p-4 rounded-2xl border border-gray-50 bg-gray-50 hover:bg-white hover:border-indigo-100 transition-all flex items-center gap-4"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-bold italic border border-gray-100">
                            {c.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">{c.code}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm font-bold hover:border-indigo-100 hover:text-indigo-600 transition-all">
                      + Join Another Class
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'focus' && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <FocusMode />
              </motion.div>
            )}

            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AITutor />
              </motion.div>
            )}
            
            {activeTab === 'classes' && (
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar for classes */}
                <div className="lg:col-span-1 space-y-3">
                  {studentClasses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClass(c)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        selectedClass?.id === c.id 
                          ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' 
                          : 'border-transparent hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <h4 className="font-bold text-sm truncate">{c.name}</h4>
                      <p className="text-[10px] font-bold uppercase text-gray-400">Teacher: {c.teacherName}</p>
                    </button>
                  ))}
                </div>
                
                {/* Main class view */}
                <div className="lg:col-span-3">
                  {selectedClass ? (
                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
                        <div className="flex gap-6 items-center">
                          <div className="w-20 h-20 bg-indigo-600 text-white flex items-center justify-center text-4xl font-black rounded-3xl shadow-xl shadow-indigo-100">
                            {selectedClass.name[0]}
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-gray-900">{selectedClass.name}</h2>
                            <div className="flex gap-2 mt-2">
                              {selectedClass.subjects.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-gray-100 text-[10px] font-black uppercase text-gray-500 rounded-md tracking-tighter">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-1">Class Code</p>
                          <p className="text-2xl font-black text-indigo-600 font-mono tracking-widest">{selectedClass.code}</p>
                        </div>
                      </div>

                      {/* Content Feed */}
                      <div className="space-y-6">
                        {messages.filter(m => m.classId === selectedClass.id).map(msg => (
                          <div key={msg.id} className={`bg-white rounded-3xl border ${msg.isPinned ? 'border-amber-200' : 'border-gray-100'} p-8 shadow-sm overflow-hidden relative`}>
                            {msg.isPinned && (
                              <div className="absolute top-0 right-0 p-2 bg-amber-100 text-amber-600 rounded-bl-xl flex items-center gap-1 text-[10px] font-black uppercase">
                                <Star className="w-3 h-3 fill-amber-600" /> Pinned
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
                                {msg.senderName[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-none">{msg.senderName}</h4>
                                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 inline-block ${msg.type === 'announcement' ? 'text-rose-500' : 'text-indigo-500'}`}>
                                  {msg.type}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{msg.text}</p>
                            
                            {/* Replies */}
                            <div className="space-y-4 pt-6 border-t border-gray-50">
                              {(replies[msg.id] || []).map(reply => (
                                <div key={reply.id} className="flex gap-3 pl-6 border-l-2 border-indigo-100">
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center text-xs font-bold border border-gray-100">
                                    {reply.authorName[0]}
                                  </div>
                                  <div className="bg-gray-50/50 p-4 rounded-2xl flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-xs text-gray-900">{reply.authorName}</span>
                                      <span className="text-[10px] text-gray-400 uppercase font-black">{new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex gap-3 mt-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border border-indigo-500">
                                  {currentUser?.name[0]}
                                </div>
                                <div className="flex-1 relative">
                                  <input 
                                    placeholder="Write a reply..."
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        postReply(msg.id, (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                    className="w-full py-2.5 pl-4 pr-12 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                  />
                                  <div className="absolute right-3 top-2.5 text-[10px] font-black uppercase text-gray-400">Enter</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                      <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-bold">Select a class to view interactions</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Account Settings</h3>
                  <p className="text-gray-500 font-medium mb-8">Manage your profile and account preferences.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black italic">
                        {currentUser?.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{currentUser?.name}</h4>
                        <p className="text-gray-500 text-sm">{currentUser?.email}</p>
                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full mt-2 inline-block">
                          {currentUser?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50/50 rounded-[2.5rem] p-10 border border-rose-100 shadow-sm">
                  <div className="flex items-center gap-3 text-rose-600 mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-black tracking-tight">Danger Zone</h3>
                  </div>
                  
                  <div className="p-8 bg-white rounded-3xl border border-rose-100/50 space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900">Delete Account</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        Permanently delete your account and all your data. This action cannot be undone.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                      {!confirmDelete ? (
                        <button 
                          onClick={() => setConfirmDelete(true)}
                          className="px-8 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete My Account
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-rose-600 font-bold text-sm">Are you absolutely sure? This will remove all your progress, points, and class memberships.</p>
                          <div className="flex gap-4">
                            <button 
                              disabled={isDeleting}
                              onClick={handleDeleteAccount}
                              className="px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                            </button>
                            <button 
                              disabled={isDeleting}
                              onClick={() => setConfirmDelete(false)}
                              className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Help Modal */}
      <AnimatePresence>
        {helpMode && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <HelpCircle className="w-48 h-48 text-indigo-900" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900">Need a Hand?</h3>
                    <p className="text-gray-500 text-sm mt-1">Ask anything to your teacher, without fear.</p>
                  </div>
                  <button onClick={() => setHelpMode(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Pick a Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    {studentClasses.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClass(c)}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          selectedClass?.id === c.id 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-50 bg-gray-50 hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Explain your struggle</label>
                  <div className="relative">
                    <textarea 
                      value={helpText}
                      onChange={(e) => setHelpText(e.target.value)}
                      placeholder="I'm confused about..."
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] transition-all text-sm"
                    />
                    <button className="absolute bottom-4 right-4 p-3 bg-white text-rose-500 rounded-full shadow-lg border border-rose-100 hover:scale-110 active:scale-95 transition-all">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={() => setAnonHelp(!anonHelp)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all flex-1 ${
                      anonHelp 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                        : 'border-gray-50 bg-white text-gray-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${anonHelp ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200'}`}>
                      {anonHelp && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xs leading-none">Ask Anonymously</p>
                      <p className="text-[9px] mt-1 opacity-60 font-black uppercase tracking-tighter">Only teacher sees identity</p>
                    </div>
                  </button>

                  <button 
                    onClick={submitHelp}
                    disabled={!helpText.trim()}
                    className="flex-[1.5] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Send Help Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
