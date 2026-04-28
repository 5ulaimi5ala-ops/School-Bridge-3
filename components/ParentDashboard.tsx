import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../DataContext';
import { Heart, ShieldCheck, Zap, ArrowRight, UserCheck, LayoutDashboard, Search, Bell, AlertTriangle, LogOut, Settings, Trash2 } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { currentUser, classes, logout, deleteAccount } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
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
      alert("Failed to delete account. Re-authentication may be required.");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Find the classes the child is in
  const childClasses = classes.filter(c => (c.studentIds || []).includes(currentUser?.childId || ''));

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      {/* Mini Sidebar */}
      <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-10 gap-8">
        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100 italic font-black text-xl">
          SB
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`p-4 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-rose-50 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`p-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-rose-50 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Settings className="w-6 h-6" />
        </button>
        <button 
          onClick={logout}
          className="mt-auto p-4 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
          title="Switch Role"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto">
        <header className="p-12 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Family Portal</h1>
            <p className="text-gray-500 font-medium mt-2">Monitoring progress for <span className="text-rose-600 font-bold uppercase tracking-wider text-xs px-2 py-1 bg-rose-50 rounded-md">ID: {currentUser?.childId}</span></p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 p-4 hover:text-gray-600 transition-colors">
            <ShieldCheck className="w-5 h-5" /> Parent Lock Active
          </button>
        </header>

        <div className="p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-3 gap-12"
              >
                <div className="lg:col-span-2 space-y-12">
                  {/* Child's Engagement */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform">
                        <Zap className="w-48 h-48 text-amber-500" />
                     </div>
                     
                     <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                          <h3 className="text-2xl font-black text-gray-900">Learning Engagement</h3>
                          <div className="flex items-center gap-2 text-green-500 font-black text-sm">
                             <ShieldCheck className="w-5 h-5" /> All systems normal
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Participation</span>
                                 <span className="text-2xl font-black text-gray-900">92%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-indigo-500 rounded-full" />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Growth Points Earned</span>
                                 <span className="text-2xl font-black text-amber-500">240 XP</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-amber-500 rounded-full" />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100">🏅</div>
                              <div>
                                 <p className="font-bold text-gray-900 text-sm">Latest Achievement</p>
                                 <p className="text-xs text-gray-500">"Steady Learner" - Focus session completed</p>
                              </div>
                           </div>
                           <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-white p-3 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors">Notify Me</button>
                        </div>
                     </div>
                  </div>

                  {/* Class Updates */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-gray-900 ml-4">Child's Classes</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       {childClasses.map(c => (
                          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-rose-100 transition-all">
                             <div className="w-16 h-16 bg-gray-50 text-gray-400 flex items-center justify-center text-2xl font-black rounded-2xl mb-6 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                {c.name[0]}
                             </div>
                             <h4 className="font-bold text-gray-900">{c.name}</h4>
                             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Teacher: {c.teacherName}</p>
                             <button className="mt-8 text-[10px] font-black uppercase text-indigo-600 tracking-tighter hover:underline">View Subject Progress <ArrowRight className="w-3 h-3 inline-block" /></button>
                          </div>
                       ))}
                       <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                          <button className="font-bold text-sm hover:text-indigo-600 transition-colors">+ Add Course Monitor</button>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Emotional Insight */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Heart className="w-48 h-48 text-rose-500 fill-rose-50" />
                     </div>
                     <div className="relative z-10 space-y-6">
                        <h3 className="text-xl font-black text-gray-900">Emotional Insight</h3>
                        <div className="flex flex-col items-center text-center py-4 bg-rose-50/50 rounded-3xl border border-rose-50">
                           <span className="text-6xl mb-4">😊</span>
                           <p className="text-xl font-bold text-gray-900 italic">"Feeling Great"</p>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Reported 2 hours ago</p>
                        </div>
                        <div className="space-y-4">
                           <p className="text-sm text-gray-500 leading-relaxed">Your child consistently reports positive check-ins this week. This is an optimal time for new learning challenges!</p>
                           <div className="flex items-center gap-2 p-3 bg-indigo-50/50 text-indigo-700 rounded-2xl border border-indigo-50">
                              <UserCheck className="w-4 h-4 flex-shrink-0" />
                              <p className="text-[10px] font-bold leading-tight">TIP: Celebrate the effort with positive reinforcement tonight.</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Attendance & Deadlines */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                     <h3 className="text-xl font-black text-gray-900 mb-8">Alert Center</h3>
                     <div className="space-y-6">
                        {[
                          { label: "Math Quiz Due", val: "Tomorrow", color: "text-amber-500", icon: <AlertTriangle className="w-4 h-4" /> },
                          { label: "Science Lab Report", val: "Missed", color: "text-rose-500", icon: <AlertTriangle className="w-4 h-4" /> },
                          { label: "Attendance Streak", val: "12 Days", color: "text-green-500", icon: <ShieldCheck className="w-4 h-4" /> },
                        ].map((alert, i) => (
                          <div key={i} className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gray-50 ${alert.color}`}>
                                   {alert.icon}
                                </div>
                                <span className="text-sm font-bold text-gray-700">{alert.label}</span>
                             </div>
                             <span className={`text-[10px] font-black uppercase ${alert.color}`}>{alert.val}</span>
                          </div>
                        ))}
                     </div>
                     <button className="w-full mt-10 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-100">Send Encouragement</button>
                  </div>
                </div>
              </motion.div>
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
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Parent Profile</h3>
                  <p className="text-gray-500 font-medium mb-8">Manage your family account settings.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-black italic">
                        {currentUser?.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{currentUser?.name}</h4>
                        <p className="text-gray-500 text-sm">{currentUser?.email}</p>
                        <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full mt-2 inline-block">
                          Guardian Role
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100 shadow-sm">
                  <div className="flex items-center gap-3 text-rose-600 mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-black tracking-tight">Danger Zone</h3>
                  </div>
                  
                  <div className="p-8 bg-white rounded-3xl border border-rose-100 space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900">Delete Family Account</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        Permanently delete your profile. This action cannot be undone. 
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
                          <p className="text-rose-600 font-bold text-sm">Are you sure? You will lose monitoring access for child ID: {currentUser?.childId}.</p>
                          <div className="flex gap-4">
                            <button 
                              disabled={isDeleting}
                              onClick={handleDeleteAccount}
                              className="px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
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
    </div>
  );
};
