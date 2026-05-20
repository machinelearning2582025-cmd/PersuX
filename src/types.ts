export interface User {
  name: string;
  id: string; // for buddy share link / UID
  email?: string;
  photoURL?: string;
  synced?: boolean;
}

export interface Task {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  reflection?: string;
  aiReply?: string;
}

export interface Lesson {
  id: string;
  hook: string;
  title: string;
  content: string;
  reflectionPoint: string;
  task: string;
}
