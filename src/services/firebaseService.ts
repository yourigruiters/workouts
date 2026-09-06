import { auth, db, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { TrainingSplit, Workout } from '../types/workout';

export const firebaseService = {
  isConfigured: isFirebaseConfigured,

  // Auth Helpers
  async login(email: string, pass: string): Promise<FirebaseUser | null> {
    if (!auth) throw new Error('Firebase Auth is not configured. Please set your .env credentials.');
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  async register(email: string, pass: string): Promise<FirebaseUser | null> {
    if (!auth) throw new Error('Firebase Auth is not configured. Please set your .env credentials.');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  async logout(): Promise<void> {
    if (!auth) return;
    await fbSignOut(auth);
  },

  onAuthChanged(callback: (user: FirebaseUser | null) => void) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // Firestore Sync Helpers
  async syncSplitToCloud(userId: string, split: TrainingSplit) {
    if (!db) return;
    const splitRef = doc(db, `users/${userId}/splits`, split.id);
    await setDoc(splitRef, split, { merge: true });
  },

  async syncWorkoutToCloud(userId: string, workout: Workout) {
    if (!db) return;
    const workoutRef = doc(db, `users/${userId}/workouts`, workout.id);
    await setDoc(workoutRef, workout, { merge: true });
  },

  async fetchSplitsFromCloud(userId: string): Promise<TrainingSplit[]> {
    if (!db) return [];
    const q = query(collection(db, `users/${userId}/splits`));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TrainingSplit);
  },

  async fetchWorkoutsFromCloud(userId: string): Promise<Workout[]> {
    if (!db) return [];
    const q = query(collection(db, `users/${userId}/workouts`));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Workout);
  },
};
