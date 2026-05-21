import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task } from './types';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './lib/firebase';

interface AppState {
  user: User | null;
  whyStatement: string | null;
  completedLessonsCount: number;
  streak: number;
  lastActiveDate: string | null;
  tasks: Task[];
  badges: string[];
  pendingStreakRestore: number | null; // Stores the lost streak amount
  theme: 'light' | 'dark' | 'system';
  language: 'English' | 'Hindi' | 'Hinglish';
  login: (name: string) => void;
  loginSynced: (firebaseUser: User) => Promise<void>;
  logout: () => void;
  setWhyStatement: (statement: string) => void;
  addTask: (taskText: string) => void;
  completeTask: (taskId: string, reflection: string, aiReply: string) => void;
  incrementLessonCount: () => void;
  updateStreak: () => void;
  restoreStreak: (reason: string) => void;
  checkStreak: () => void;
  setStreak: (val: number) => void;
  setLastActiveDate: (dateStr: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'English' | 'Hindi' | 'Hinglish') => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const updateFirestoreUserField = async (userId: string, fields: Record<string, any>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, fields, { merge: true });
  } catch (err) {
    console.error("Firestore update failed:", err);
  }
};

const writeFirestoreTask = async (userId: string, task: Task) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskRef, task, { merge: true });
  } catch (err) {
    console.error("Firestore task write failed:", err);
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      whyStatement: null,
      completedLessonsCount: 0,
      streak: 0,
      lastActiveDate: null,
      tasks: [],
      badges: [],
      pendingStreakRestore: null,
      theme: 'system',
      language: 'English',

      login: (name) => {
        const id = Math.random().toString(36).substring(2, 9);
        set({ user: { name, id } });
      },

      loginSynced: async (syncedUser: User) => {
        try {
          const userDocRef = doc(db, 'users', syncedUser.id);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            
            // Fetch tasks subcollection
            const tasksSnapshot = await getDocs(collection(db, 'users', syncedUser.id, 'tasks'));
            const loadedTasks: Task[] = [];
            tasksSnapshot.forEach((docSnap) => {
              loadedTasks.push(docSnap.data() as Task);
            });

            // Sort tasks by date descending
            loadedTasks.sort((a, b) => b.date.localeCompare(a.date));

            set({
              user: syncedUser,
              whyStatement: data.whyStatement || null,
              completedLessonsCount: data.completedLessonsCount || 0,
              streak: data.streak || 0,
              lastActiveDate: data.lastActiveDate || null,
              badges: data.badges || [],
              tasks: loadedTasks,
              pendingStreakRestore: data.pendingStreakRestore || null,
              theme: data.theme || 'system',
              language: data.language || 'English'
            });
          } else {
            // First time login - Sync current local state to Firebase so progress is preserved
            const state = get();
            
            await setDoc(userDocRef, {
              name: syncedUser.name,
              whyStatement: state.whyStatement,
              completedLessonsCount: state.completedLessonsCount,
              streak: state.streak,
              lastActiveDate: state.lastActiveDate,
              badges: state.badges || [],
              theme: state.theme || 'system',
              language: state.language || 'English'
            }, { merge: true });

            for (const task of state.tasks) {
              const taskRef = doc(db, 'users', syncedUser.id, 'tasks', task.id);
              await setDoc(taskRef, task, { merge: true });
            }

            set({ user: syncedUser });
          }
        } catch (err) {
          console.error("Firestore loading error:", err);
          set({ user: syncedUser });
        }
      },

      logout: () => {
        set({
           user: null,
           whyStatement: null,
           tasks: [],
           streak: 0,
           completedLessonsCount: 0,
           lastActiveDate: null,
           badges: [],
           pendingStreakRestore: null,
           theme: 'system',
           language: 'English',
        });
      },

      setWhyStatement: (statement) => {
        set({ whyStatement: statement });
        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { whyStatement: statement });
        }
      },

      addTask: (taskText) => {
        const newTask: Task = {
          id: Math.random().toString(36).substring(2, 9),
          text: taskText,
          date: getTodayDateString(),
          completed: false,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        
        const u = get().user;
        if (u && u.synced) {
          writeFirestoreTask(u.id, newTask);
        }
      },

      completeTask: (taskId, reflection, aiReply) => {
        let updatedTask: Task | null = null;
        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.id === taskId) {
              updatedTask = { ...t, completed: true, reflection, aiReply };
              return updatedTask;
            }
            return t;
          });
          return { tasks: updatedTasks };
        });

        const u = get().user;
        if (u && u.synced && updatedTask) {
          writeFirestoreTask(u.id, updatedTask);
        }
      },

      incrementLessonCount: () => {
        set((state) => ({ completedLessonsCount: state.completedLessonsCount + 1 }));
        get().updateStreak();
        
        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { 
            completedLessonsCount: get().completedLessonsCount,
            streak: get().streak,
            lastActiveDate: get().lastActiveDate,
            badges: get().badges,
            pendingStreakRestore: get().pendingStreakRestore
          });
        }
      },

      updateStreak: () => {
        const today = getTodayDateString();
        set((state) => {
          if (state.lastActiveDate === today) return state; // Already active today

          let newStreak = state.streak;
          let newBadges = state.badges ? [...state.badges] : [];
          let pendingRestore = state.pendingStreakRestore || null;

          if (!state.lastActiveDate) {
            newStreak = 1;
          } else {
            const diffDays = getDaysDifference(state.lastActiveDate, today);

            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays === 2 && state.streak > 1) {
              pendingRestore = state.streak; 
              newStreak = 1;
            } else if (diffDays > 1) {
              newStreak = 1;
              pendingRestore = null;
            }
          }

          if (newStreak === 7 && !newBadges.includes('7-Day Starter')) newBadges.push('7-Day Starter');
          if (newStreak === 30 && !newBadges.includes('30-Day Master')) newBadges.push('30-Day Master');

          return { 
            streak: newStreak, 
            lastActiveDate: today,
            badges: newBadges,
            pendingStreakRestore: pendingRestore
          };
        });

        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { 
            streak: get().streak,
            lastActiveDate: get().lastActiveDate,
            badges: get().badges,
            pendingStreakRestore: get().pendingStreakRestore
          });
        }
      },

      restoreStreak: (reason: string) => {
        set((state) => {
          if (state.pendingStreakRestore && reason.trim().length > 5) {
            const restoredStreak = state.pendingStreakRestore;
            let newBadges = state.badges ? [...state.badges] : [];
            if (restoredStreak >= 7 && !newBadges.includes('7-Day Starter')) newBadges.push('7-Day Starter');
            if (restoredStreak >= 30 && !newBadges.includes('30-Day Master')) newBadges.push('30-Day Master');

             const yesterdayDate = new Date();
             yesterdayDate.setDate(yesterdayDate.getDate() - 1);
             const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

             return {
                streak: restoredStreak,
                lastActiveDate: yesterdayStr,
                pendingStreakRestore: null,
                badges: newBadges
             };
          }
          return state;
        });

        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { 
            streak: get().streak,
            lastActiveDate: get().lastActiveDate,
            badges: get().badges,
            pendingStreakRestore: null
          });
        }
      },

      checkStreak: () => {
        const today = getTodayDateString();
        set((state) => {
          if (!state.lastActiveDate) return state;

          const diffDays = getDaysDifference(state.lastActiveDate, today);

          let newStreak = state.streak;
          let pendingRestore = state.pendingStreakRestore;

          if (diffDays === 2) {
            if (state.streak > 1 && !state.pendingStreakRestore) {
              pendingRestore = state.streak;
              newStreak = 0;
            }
          } else if (diffDays > 2) {
            newStreak = 0;
            pendingRestore = null;
          }

          return {
            streak: newStreak,
            pendingStreakRestore: pendingRestore
          };
        });
      },

      setStreak: (val: number) => {
        set((state) => {
          let newBadges = state.badges ? [...state.badges] : [];
          if (val >= 7 && !newBadges.includes('7-Day Starter')) newBadges.push('7-Day Starter');
          if (val >= 30 && !newBadges.includes('30-Day Master')) newBadges.push('30-Day Master');
          
          return {
            streak: val,
            badges: newBadges
          };
        });

        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { 
            streak: get().streak,
            badges: get().badges
          });
        }
      },

      setLastActiveDate: (dateStr: string | null) => {
        set({ lastActiveDate: dateStr });
        get().checkStreak(); // Run check immediately to update visual indicators
        
        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { 
            lastActiveDate: dateStr,
            streak: get().streak,
            pendingStreakRestore: get().pendingStreakRestore
          });
        }
      },

      setTheme: (theme) => {
        set({ theme });
        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { theme });
        }
      },

      setLanguage: (language) => {
        set({ language });
        const u = get().user;
        if (u && u.synced) {
          updateFirestoreUserField(u.id, { language });
        }
      }
    }),
    {
      name: 'persux-storage',
    }
  )
);
