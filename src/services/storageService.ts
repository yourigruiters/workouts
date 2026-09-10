import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingSplit, Workout } from '../types/workout';

const STORAGE_KEYS = {
  SPLITS: '@workouts_splits_v1',
  WORKOUTS: '@workouts_items_v1',
  ACTIVE_USER: '@workouts_user_v1',
};

export const INITIAL_SPLITS: TrainingSplit[] = [];
export const INITIAL_WORKOUTS: Workout[] = [];

export const storageService = {
  async getSplits(): Promise<TrainingSplit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SPLITS);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.error('Error reading splits from storage:', e);
      return [];
    }
  },

  async saveSplits(splits: TrainingSplit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SPLITS, JSON.stringify(splits));
    } catch (e) {
      console.error('Error saving splits:', e);
    }
  },

  async getWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.error('Error reading workouts from storage:', e);
      return [];
    }
  },

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Error saving workouts:', e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.SPLITS, STORAGE_KEYS.WORKOUTS]);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};
