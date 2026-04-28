import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, Sparkles, BrainCircuit, History, ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';
import { useData } from '../DataContext';
import { chatWithTutor, ExplanationLevel } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AITutor: React.FC = () => {
  const { currentUser, aiChats, saveChat, classes } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState<ExplanationLevel>('intermediate');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(classes[0]?.subjects[0] || 'General');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const geminiMessages = updatedMessages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

      const aiResponse = await chatWithTutor(geminiMessages, level, selectedSubject);

      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'ai',
        text: aiResponse || "I couldn't generate a response. Please try again.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: 'error',
        sender: 'ai',
        text: "Sorry, I'm having trouble connecting. Check your internet or try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      saveChat(messages, selectedSubject);
    }
    setMessages([]);
  };

  const loadPastChat = (chat: any) => {
    setMessages(chat.messages);
    setSelectedSubject(chat.subject || 'General');
    setShowHistory(false);
  };

  return (
    <div className="flex h-full gap-8">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[70vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-[#FDFDFD]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-none">AI Study Tutor</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personalized Learning Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Chat History"
            >
              <History className="w-5 h-5" />
            </button>
            <button 
              onClick={startNewChat}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              New Session
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center">
                <BrainCircuit className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-gray-900">What are we learning today?</h4>
                <p className="text-gray-500 text-sm mt-2 font-medium">Pick a subject and topic, and I'll explain it in a way that makes sense to you.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Photosynthesis', 'Pythagorean Theorem', 'The French Revolution', 'Python Functions'].map(t => (
                  <button 
                    key={t}
                    onClick={() => { setInputText(`Can you explain ${t}?`); }}
                    className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-[2rem] p-6 ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 rounded-tr-none' 
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 px-6 py-4 rounded-[2rem] border border-gray-100 rounded-tl-none flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full" 
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full" 
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Level & Controls */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50 space-y-4">
          <div className="flex items-center gap-4">
             <div className="flex-1 flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl">
               {(['beginner', 'intermediate', 'advanced'] as ExplanationLevel[]).map(l => (
                 <button
                   key={l}
                   onClick={() => setLevel(l)}
                   className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                     level === l 
                       ? 'bg-indigo-600 text-white shadow-md' 
                       : 'text-gray-400 hover:bg-gray-50'
                   }`}
                 >
                   {l}
                 </button>
               ))}
             </div>
             <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-100"
             >
                <option value="General">General</option>
                {classes.flatMap(c => c.subjects).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
             </select>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask the AI to explain a topic..."
              className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <h4 className="font-black text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Previous Sessions
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiChats.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No past chats</p>
                </div>
              ) : (
                aiChats.map(chat => (
                  <button 
                    key={chat.id}
                    onClick={() => loadPastChat(chat)}
                    className="w-full text-left p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase text-indigo-500 tracking-tighter">{chat.subject || 'General'}</span>
                      <span className="text-[9px] font-bold text-gray-400">{new Date(chat.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {chat.messages[0]?.text || 'Empty session'}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
