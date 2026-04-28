export type Role = 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  role: Role;
  childId: string | null; // For parents
  points: number;
  badges: string[];
  moods: { emoji: string; text: string; timestamp: number }[];
  email: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AIChatSession {
  id: string;
  studentId: string;
  messages: ChatMessage[];
  subject: string | null;
  createdAt: number;
}

export interface HelpRequest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  text: string | null;
  audioUrl: string | null;
  timestamp: number;
  isAnonymous: boolean;
  status: 'pending' | 'resolved';
}

export interface ClassReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface AppMessage {
  id: string;
  classId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: 'announcement' | 'discussion';
  isPinned: boolean;
}

export interface AppClass {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  studentNames: string[];
  subjects: string[];
  createdAt: number;
}
