import { auth, db, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { TrainingSplit, Workout } from '../types/workout';
import { UserProfile } from '../types/user';

/**
 * Strips out `undefined` properties recursively because Firestore throws an error
 * when encountering `undefined` in payload objects.
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

export const firebaseService = {
  isConfigured: isFirebaseConfigured,

  // ==========================================
  // AUTHENTICATION HELPERS
  // ==========================================
  async login(email: string, pass: string): Promise<FirebaseUser | null> {
    if (!auth) throw new Error('Firebase Auth is not configured. Please check your configuration.');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  },

  async register(email: string, pass: string, displayName?: string): Promise<FirebaseUser | null> {
    if (!auth) throw new Error('Firebase Auth is not configured. Please check your configuration.');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;

    const name = displayName?.trim() || email.split('@')[0];
    try {
      await updateProfile(user, { displayName: name });
    } catch (e) {
      console.warn('Could not update Firebase user profile name:', e);
    }

    // Create user profile document in Firestore
    await this.saveUserProfile(user.uid, {
      uid: user.uid,
      email: user.email || email,
      displayName: name,
    });

    return user;
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

  // ==========================================
  // USER PROFILE FIRESTORE HELPERS
  // ==========================================
  async saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    if (!db) return;
    const userRef = doc(db, 'users', userId);
    const sanitized = sanitizeForFirestore({ ...profile, updatedAt: Date.now() });
    await setDoc(userRef, sanitized, { merge: true });
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!db) return null;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching user profile:', e);
    }
    return null;
  },

  // ==========================================
  // SPLITS FIRESTORE HELPERS
  // ==========================================
  async fetchSplitsFromCloud(userId: string): Promise<TrainingSplit[]> {
    const firestore = db;
    if (!firestore) return [];
    try {
      const splitsCol = collection(firestore, 'users', userId, 'splits');
      const snap = await getDocs(splitsCol);
      if (snap.empty) return [];

      const splitsWithOrder = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          description: data.description,
          createdAt: data.createdAt || Date.now(),
          orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : 9999,
        } as TrainingSplit & { orderIndex: number };
      });

      // Sort by orderIndex ascending, then createdAt descending
      splitsWithOrder.sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return b.createdAt - a.createdAt;
      });

      return splitsWithOrder.map(({ orderIndex, ...s }) => s as TrainingSplit);
    } catch (e) {
      console.error('Error fetching splits from Firestore:', e);
      return [];
    }
  },

  async syncSplitToCloud(userId: string, split: TrainingSplit, orderIndex?: number): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const splitRef = doc(firestore, 'users', userId, 'splits', split.id);
      const payload: any = { ...split, updatedAt: Date.now() };
      if (typeof orderIndex === 'number') {
        payload.orderIndex = orderIndex;
      }
      const sanitized = sanitizeForFirestore(payload);
      await setDoc(splitRef, sanitized, { merge: true });
    } catch (e) {
      console.error('Error saving split to Firestore:', e);
    }
  },

  async deleteSplitFromCloud(userId: string, splitId: string): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const splitRef = doc(firestore, 'users', userId, 'splits', splitId);
      await deleteDoc(splitRef);

      // Also clean up all workouts in this split
      const workoutsCol = collection(firestore, 'users', userId, 'workouts');
      const q = query(workoutsCol, where('splitId', '==', splitId));
      const snap = await getDocs(q);
      const batch = writeBatch(firestore);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {
      console.error('Error deleting split from Firestore:', e);
    }
  },

  async syncSplitsOrderToCloud(userId: string, orderedSplits: TrainingSplit[]): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      orderedSplits.forEach((split, index) => {
        const splitRef = doc(firestore, 'users', userId, 'splits', split.id);
        const payload = sanitizeForFirestore({ ...split, orderIndex: index, updatedAt: Date.now() });
        batch.set(splitRef, payload, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Error updating splits order in Firestore:', e);
    }
  },

  // ==========================================
  // WORKOUTS FIRESTORE HELPERS
  // ==========================================
  async fetchWorkoutsFromCloud(userId: string): Promise<Workout[]> {
    const firestore = db;
    if (!firestore) return [];
    try {
      const workoutsCol = collection(firestore, 'users', userId, 'workouts');
      const snap = await getDocs(workoutsCol);
      if (snap.empty) return [];

      const workoutsWithOrder = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          splitId: data.splitId,
          name: data.name,
          focus: data.focus,
          headings: data.headings || [],
          exercises: data.exercises || [],
          createdAt: data.createdAt || Date.now(),
          orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : 9999,
        } as Workout & { orderIndex: number };
      });

      // Sort by orderIndex ascending, then createdAt descending
      workoutsWithOrder.sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        }
        return b.createdAt - a.createdAt;
      });

      return workoutsWithOrder.map(({ orderIndex, ...w }) => w as Workout);
    } catch (e) {
      console.error('Error fetching workouts from Firestore:', e);
      return [];
    }
  },

  async syncWorkoutToCloud(userId: string, workout: Workout, orderIndex?: number): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const workoutRef = doc(firestore, 'users', userId, 'workouts', workout.id);
      const payload: any = { ...workout, updatedAt: Date.now() };
      if (typeof orderIndex === 'number') {
        payload.orderIndex = orderIndex;
      }
      const sanitized = sanitizeForFirestore(payload);
      await setDoc(workoutRef, sanitized, { merge: true });
    } catch (e) {
      console.error('Error saving workout to Firestore:', e);
    }
  },

  async deleteWorkoutFromCloud(userId: string, workoutId: string): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const workoutRef = doc(firestore, 'users', userId, 'workouts', workoutId);
      await deleteDoc(workoutRef);
    } catch (e) {
      console.error('Error deleting workout from Firestore:', e);
    }
  },

  async syncWorkoutsOrderToCloud(userId: string, orderedWorkouts: Workout[]): Promise<void> {
    const firestore = db;
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      orderedWorkouts.forEach((w, index) => {
        const workoutRef = doc(firestore, 'users', userId, 'workouts', w.id);
        const payload = sanitizeForFirestore({ ...w, orderIndex: index, updatedAt: Date.now() });
        batch.set(workoutRef, payload, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Error updating workouts order in Firestore:', e);
    }
  },
};
