import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppClass, AppMessage, Role, ClassReply, HelpRequest, AIChatSession, ChatMessage } from './types';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  orderBy, 
  serverTimestamp,
  getDocFromServer,
  deleteDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType, hydrateTimestamps } from './firestoreUtils';

interface DataContextType {
  currentUser: User | null;
  loading: boolean;
  login: (role: Role, name: string, childId?: string) => Promise<void>;
  classes: AppClass[];
  createClass: (name: string, subjects: string[]) => Promise<void>;
  joinClass: (code: string) => Promise<void>;
  addClassStudent: (classId: string, studentName: string) => Promise<void>;
  messages: AppMessage[];
  replies: { [messageId: string]: ClassReply[] };
  postMessage: (classId: string, text: string, type: 'announcement' | 'discussion') => Promise<void>;
  postReply: (messageId: string, text: string) => Promise<void>;
  togglePin: (messageId: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  helpRequests: HelpRequest[];
  createHelpRequest: (classId: string, text?: string, audioUrl?: string, isAnonymous?: boolean) => Promise<void>;
  resolveHelpRequest: (requestId: string) => Promise<void>;
  aiChats: AIChatSession[];
  saveChat: (messages: ChatMessage[], subject?: string) => Promise<void>;
  updateMood: (emoji: string, text: string) => Promise<void>;
  awardPoints: (amount: number, badge?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<AppClass[]>([]);
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [replies, setReplies] = useState<{ [messageId: string]: ClassReply[] }>({});
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [aiChats, setAiChats] = useState<AIChatSession[]>([]);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(hydrateTimestamps(userDoc.data()) as User);
        } else {
          // User exists in Auth but not in Firestore - might happen if onboarding was interrupted
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!currentUser) {
      setClasses([]);
      setMessages([]);
      setHelpRequests([]);
      setAiChats([]);
      return;
    }

    const unsubs: (() => void)[] = [];

    // Classes
    const classesQuery = currentUser.role === 'teacher' 
      ? query(collection(db, 'classes'), where('teacherId', '==', currentUser.id))
      : currentUser.role === 'parent' && currentUser.childId
        ? query(collection(db, 'classes'), where('studentIds', 'array-contains', currentUser.childId))
        : query(collection(db, 'classes'), where('studentIds', 'array-contains', currentUser.id));

    unsubs.push(onSnapshot(classesQuery, (snapshot) => {
      setClasses(snapshot.docs.map(doc => hydrateTimestamps(doc.data()) as AppClass));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'classes')));

    // AI Chats
    if (currentUser.role === 'student') {
      const aiChatQuery = query(collection(db, 'aiChats'), where('studentId', '==', currentUser.id), orderBy('createdAt', 'desc'));
      unsubs.push(onSnapshot(aiChatQuery, (snapshot) => {
        setAiChats(snapshot.docs.map(doc => hydrateTimestamps(doc.data()) as AIChatSession));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'aiChats')));
    }

    return () => unsubs.forEach(unsub => unsub());
  }, [currentUser]);

  // Dependent listeners (Messages & Help Requests)
  useEffect(() => {
    if (!currentUser || classes.length === 0) {
      setMessages([]);
      setHelpRequests([]);
      return;
    }

    const classIds = classes.map(c => c.id);
    const unsubs: (() => void)[] = [];

    // Firestore 'in' query supports up to 30 items
    const chunkedClassIds = [];
    for (let i = 0; i < classIds.length; i += 30) {
      chunkedClassIds.push(classIds.slice(i, i + 30));
    }

    classIds.forEach(id => {
      // Messages Subcollection
      const messagesQuery = query(
        collection(db, 'classes', id, 'messages'), 
        orderBy('timestamp', 'desc')
      );
      unsubs.push(onSnapshot(messagesQuery, (snapshot) => {
        const classMessages = snapshot.docs.map(doc => hydrateTimestamps(doc.data()) as AppMessage);
        
        setMessages(prev => {
          const filteredPrev = prev.filter(m => m.classId !== id);
          return [...filteredPrev, ...classMessages].sort((a, b) => b.timestamp - a.timestamp);
        });

        // Setup listeners for replies of these messages
        classMessages.forEach(msg => {
          const repliesQuery = query(collection(db, 'classes', id, 'messages', msg.id, 'replies'), orderBy('timestamp', 'asc'));
          unsubs.push(onSnapshot(repliesQuery, (replySnap) => {
            setReplies(prev => ({
              ...prev,
              [msg.id]: replySnap.docs.map(rd => hydrateTimestamps(rd.data()) as ClassReply)
            }));
          }));
        });
      }, (err) => handleFirestoreError(err, OperationType.LIST, `classes/${id}/messages`)));

      // Help Requests Subcollection
      const helpQuery = query(
        collection(db, 'classes', id, 'helpRequests'), 
        orderBy('timestamp', 'desc')
      );
      unsubs.push(onSnapshot(helpQuery, (snapshot) => {
        setHelpRequests(prev => {
          const newRequests = snapshot.docs.map(doc => hydrateTimestamps(doc.data()) as HelpRequest);
          const filteredPrev = prev.filter(r => r.classId !== id);
          return [...filteredPrev, ...newRequests].sort((a, b) => b.timestamp - a.timestamp);
        });
      }, (err) => handleFirestoreError(err, OperationType.LIST, `classes/${id}/helpRequests`)));
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [currentUser, classes]);

  const login = async (role: Role, name: string, childId?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUser: User = {
          id: fbUser.uid,
          name: name || fbUser.displayName || 'New User',
          role,
          childId: childId || null,
          points: 0,
          badges: [],
          moods: [],
          email: fbUser.email || '',
          createdAt: serverTimestamp() as any
        };
        await setDoc(userDocRef, newUser);
        const savedDoc = await getDoc(userDocRef);
        setCurrentUser(hydrateTimestamps(savedDoc.data()) as User);
      } else {
        setCurrentUser(hydrateTimestamps(userDoc.data()) as User);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const createClass = async (name: string, subjects: string[]) => {
    if (!currentUser) return;
    try {
      const classId = Math.random().toString(36).substr(2, 9);
      const newClass: AppClass = {
        id: classId,
        name,
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        studentIds: [],
        studentNames: [],
        subjects,
        createdAt: serverTimestamp() as any
      };
      await setDoc(doc(db, 'classes', classId), newClass);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'classes');
    }
  };

  const joinClass = async (code: string) => {
    if (!currentUser) return;
    try {
      // Find class by code
      const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase()));
      onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(async (d) => {
          const classData = d.data() as AppClass;
          if (!classData.studentIds.includes(currentUser.id)) {
            await updateDoc(doc(db, 'classes', d.id), {
              studentIds: arrayUnion(currentUser.id),
              studentNames: arrayUnion(currentUser.name)
            });
          }
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'classes');
    }
  };

  const addClassStudent = async (classId: string, studentName: string) => {
    try {
      await updateDoc(doc(db, 'classes', classId), {
        studentNames: arrayUnion(studentName)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `classes/${classId}`);
    }
  };

  const postMessage = async (classId: string, text: string, type: 'announcement' | 'discussion') => {
    if (!currentUser) return;
    try {
      const messageId = Math.random().toString(36).substr(2, 9);
      const newMessage: AppMessage = {
        id: messageId,
        classId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text,
        timestamp: serverTimestamp() as any,
        type,
        isPinned: false
      };
      await setDoc(doc(db, 'classes', classId, 'messages', messageId), newMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `classes/${classId}/messages`);
    }
  };

  const postReply = async (messageId: string, text: string) => {
    if (!currentUser) return;
    try {
      // We need to find the message to get its classId
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;

      const replyId = Math.random().toString(36).substr(2, 9);
      const reply: ClassReply = {
        id: replyId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        text,
        timestamp: serverTimestamp() as any
      };
      
      const replyRef = doc(db, 'classes', msg.classId, 'messages', messageId, 'replies', replyId);
      await setDoc(replyRef, reply);
      
      if (currentUser.role === 'student') {
        await awardPoints(5);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `messages/${messageId}/replies`);
    }
  };

  const togglePin = async (messageId: string) => {
    try {
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;

      const msgRef = doc(db, 'classes', msg.classId, 'messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (msgSnap.exists()) {
        await updateDoc(msgRef, { isPinned: !msgSnap.data().isPinned });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
    }
  };

  const createHelpRequest = async (classId: string, text?: string, audioUrl?: string, isAnonymous: boolean = false) => {
    if (!currentUser) return;
    try {
      const requestId = Math.random().toString(36).substr(2, 9);
      const request: HelpRequest = {
        id: requestId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        classId,
        text: text || null,
        audioUrl: audioUrl || null,
        timestamp: serverTimestamp() as any,
        isAnonymous,
        status: 'pending'
      };
      await setDoc(doc(db, 'classes', classId, 'helpRequests', requestId), request);
      
      if (currentUser.role === 'student') {
        await awardPoints(10, 'Curiosity Catalyst');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `classes/${classId}/helpRequests`);
    }
  };

  const resolveHelpRequest = async (requestId: string) => {
    try {
      const req = helpRequests.find(r => r.id === requestId);
      if (!req) return;

      await updateDoc(doc(db, 'classes', req.classId, 'helpRequests', requestId), { status: 'resolved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `helpRequests/${requestId}`);
    }
  };

  const saveChat = async (messages: ChatMessage[], subject?: string) => {
    if (!currentUser) return;
    try {
      const chatId = Math.random().toString(36).substr(2, 9);
      const newChat: AIChatSession = {
        id: chatId,
        studentId: currentUser.id,
        messages,
        subject: subject || null,
        createdAt: serverTimestamp() as any
      };
      await setDoc(doc(db, 'aiChats', chatId), newChat);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'aiChats');
    }
  };

  const updateMood = async (emoji: string, text: string) => {
    if (!currentUser) return;
    try {
      const newMood = { emoji, text, timestamp: Date.now() };
      const updatedMoods = [newMood, ...(currentUser.moods || [])].slice(0, 10);
      await updateDoc(doc(db, 'users', currentUser.id), { moods: updatedMoods });
      setCurrentUser({ ...currentUser, moods: updatedMoods });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const awardPoints = async (amount: number, badge?: string) => {
    if (!currentUser) return;
    try {
      const newBadges = [...(currentUser.badges || [])];
      if (badge && !newBadges.includes(badge)) {
        newBadges.push(badge);
      }
      const newPoints = (currentUser.points || 0) + amount;
      await updateDoc(doc(db, 'users', currentUser.id), { 
        points: newPoints,
        badges: newBadges
      });
      setCurrentUser({ ...currentUser, points: newPoints, badges: newBadges });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const fbUser = auth.currentUser;
    if (!fbUser) return;

    try {
      // 1. Delete Firestore user document
      await deleteDoc(doc(db, 'users', currentUser.id));
      
      // 2. Delete Firebase Auth user
      try {
        await deleteUser(fbUser);
      } catch (error: any) {
        // If re-authentication is required
        if (error.code === 'auth/requires-recent-login') {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          // Try deleting again after re-authentication
          const updatedUser = auth.currentUser;
          if (updatedUser) await deleteUser(updatedUser);
        } else {
          throw error;
        }
      }
      
      setCurrentUser(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const deleteClass = async (classId: string) => {
    if (!currentUser || currentUser.role !== 'teacher') return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `classes/${classId}`);
    }
  };

  return (
    <DataContext.Provider value={{ 
      currentUser, login, classes, createClass, joinClass, 
      addClassStudent, messages, replies, postMessage, postReply, togglePin, logout,
      deleteAccount, deleteClass,
      helpRequests, createHelpRequest, resolveHelpRequest, aiChats, saveChat,
      updateMood, awardPoints, loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
