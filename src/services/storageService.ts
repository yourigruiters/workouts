import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingSplit, Workout } from '../types/workout';

const STORAGE_KEYS = {
  SPLITS: '@workouts_splits_v1',
  WORKOUTS: '@workouts_items_v1',
  ACTIVE_USER: '@workouts_user_v1',
};

export const INITIAL_SPLITS: TrainingSplit[] = [
  {
    id: 'split-ppl',
    name: 'Push Pull Legs (PPL)',
    description: 'Classic 3-6 day hypertrophy & strength routine',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'split-upper-lower',
    name: 'Upper / Lower Split',
    description: '4-day power and mass building split',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'split-arnold',
    name: 'Arnold Split',
    description: 'Chest & Back, Shoulders & Arms, Legs',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: 'workout-push-a',
    splitId: 'split-ppl',
    name: 'Monday - Push',
    focus: 'Chest / Triceps / Front Delts',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    headings: [
      {
        id: 'heading-chest',
        title: 'Chest Compounds',
        color: 'blue',
        isCollapsed: false,
      },
      {
        id: 'heading-triceps',
        title: 'Triceps & Shoulders',
        color: 'indigo',
        isCollapsed: false,
      },
    ],
    exercises: [
      {
        id: 'ex-1',
        name: 'Incline Dumbbell Press',
        headingId: 'heading-chest',
        details: 'Bench set at 30° incline',
        notes: 'Keep elbows tucked at 45 degrees. Squeeze chest at peak contraction.',
        isRiskExercise: false,
        machineDetails: 'Dumbbell Rack A • Bench #2',
        sets: [
          { id: 's-1-1', type: 'warmup', repRange: '15', weightKg: 18, restTime: '1:00' },
          { id: 's-1-2', type: 'active', repRange: '8-10', weightKg: 32, restTime: '2:00' },
          { id: 's-1-3', type: 'active', repRange: '8-10', weightKg: 34, restTime: '2:00' },
          { id: 's-1-4', type: 'active', repRange: '6-8', weightKg: 36, restTime: '2:30' },
        ],
        history: [
          { date: '2026-08-30', bestSet: '34kg x 8 reps', totalVolumeKg: 850 },
          { date: '2026-08-23', bestSet: '32kg x 10 reps', totalVolumeKg: 780 },
          { date: '2026-08-16', bestSet: '30kg x 10 reps', totalVolumeKg: 720 },
        ],
      },
      {
        id: 'ex-2',
        name: 'Barbell Flat Bench Press',
        headingId: 'heading-chest',
        details: 'Pause on chest 1 second',
        notes: 'Right shoulder sensitive: maintain tight scapula retraction and slow 3s eccentric!',
        isRiskExercise: true,
        machineDetails: 'Olympic Bench Station #1',
        sets: [
          { id: 's-2-1', type: 'warmup', repRange: '12', weightKg: 60, restTime: '1:30' },
          { id: 's-2-2', type: 'active', repRange: '6-8', weightKg: 90, restTime: '3:00' },
          { id: 's-2-3', type: 'active', repRange: '6-8', weightKg: 90, restTime: '3:00' },
        ],
        history: [
          { date: '2026-08-30', bestSet: '90kg x 6 reps', totalVolumeKg: 1440 },
          { date: '2026-08-23', bestSet: '85kg x 8 reps', totalVolumeKg: 1360 },
        ],
      },
      {
        id: 'ex-3',
        name: 'Cable Tricep Pushdown',
        headingId: 'heading-triceps',
        details: 'Use rope attachment • Spread at bottom',
        notes: 'Lock elbows to torso, do not use momentum from shoulders.',
        isRiskExercise: false,
        machineDetails: 'Dual Cable Pulley #4 (Top Pin)',
        sets: [
          { id: 's-3-1', type: 'warmup', repRange: '15', weightKg: 20, restTime: '1:00' },
          { id: 's-3-2', type: 'active', repRange: '10-12', weightKg: 35, restTime: '1:30' },
          { id: 's-3-3', type: 'active', repRange: '10-12', weightKg: 35, restTime: '1:30' },
          { id: 's-3-4', type: 'active', repRange: '12-15', weightKg: 30, restTime: '1:30' },
        ],
        history: [
          { date: '2026-08-30', bestSet: '35kg x 12 reps', totalVolumeKg: 960 },
        ],
      },
      {
        id: 'ex-4',
        name: 'Dumbbell Lateral Raise',
        headingId: 'heading-triceps',
        details: 'Slight forward lean • Lead with elbows',
        isRiskExercise: false,
        sets: [
          { id: 's-4-1', type: 'active', repRange: '12-15', weightKg: 12, restTime: '1:30' },
          { id: 's-4-2', type: 'active', repRange: '12-15', weightKg: 12, restTime: '1:30' },
          { id: 's-4-3', type: 'active', repRange: '15-20', weightKg: 10, restTime: '1:30' },
        ],
      },
    ],
  },
  {
    id: 'workout-pull-a',
    splitId: 'split-ppl',
    name: 'Wednesday - Pull',
    focus: 'Back / Biceps / Rear Delts',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    headings: [
      {
        id: 'heading-back',
        title: 'Back Compound',
        color: 'emerald',
        isCollapsed: false,
      },
      {
        id: 'heading-biceps',
        title: 'Biceps & Rear Delts',
        color: 'amber',
        isCollapsed: false,
      },
    ],
    exercises: [
      {
        id: 'ex-5',
        name: 'Lat Pulldown',
        headingId: 'heading-back',
        details: 'Wide neutral grip',
        machineDetails: 'Lat Tower #2 • Seat setting 4',
        sets: [
          { id: 's-5-1', type: 'warmup', repRange: '12', weightKg: 45, restTime: '1:00' },
          { id: 's-5-2', type: 'active', repRange: '8-10', weightKg: 75, restTime: '2:00' },
          { id: 's-5-3', type: 'active', repRange: '8-10', weightKg: 75, restTime: '2:00' },
        ],
      },
      {
        id: 'ex-6',
        name: 'Incline Dumbbell Curls',
        headingId: 'heading-biceps',
        details: 'Full stretch at bottom of range',
        notes: 'Focus on slow 2-second eccentric stretch for maximum bicep tension.',
        sets: [
          { id: 's-6-1', type: 'active', repRange: '10-12', weightKg: 14, restTime: '1:30' },
          { id: 's-6-2', type: 'active', repRange: '10-12', weightKg: 14, restTime: '1:30' },
        ],
      },
    ],
  },
  {
    id: 'workout-legs-a',
    splitId: 'split-ppl',
    name: 'Friday - Legs',
    focus: 'Quads / Hamstrings / Calves',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    headings: [
      {
        id: 'heading-quads',
        title: 'Quads & Glutes',
        color: 'rose',
        isCollapsed: false,
      },
    ],
    exercises: [
      {
        id: 'ex-7',
        name: 'Barbell Back Squats',
        headingId: 'heading-quads',
        details: 'High bar position • Olympic shoes',
        notes: 'Keep core braced throughout bottom of squat.',
        isRiskExercise: true,
        sets: [
          { id: 's-7-1', type: 'warmup', repRange: '10', weightKg: 60, restTime: '2:00' },
          { id: 's-7-2', type: 'active', repRange: '6-8', weightKg: 120, restTime: '3:00' },
          { id: 's-7-3', type: 'active', repRange: '6-8', weightKg: 120, restTime: '3:00' },
        ],
      },
    ],
  },
];

export const storageService = {
  async getSplits(): Promise<TrainingSplit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SPLITS);
      if (data) {
        return JSON.parse(data);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.SPLITS, JSON.stringify(INITIAL_SPLITS));
      return INITIAL_SPLITS;
    } catch (e) {
      console.error('Error reading splits from storage:', e);
      return INITIAL_SPLITS;
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
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(INITIAL_WORKOUTS));
      return INITIAL_WORKOUTS;
    } catch (e) {
      console.error('Error reading workouts from storage:', e);
      return INITIAL_WORKOUTS;
    }
  },

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Error saving workouts:', e);
    }
  },
};
