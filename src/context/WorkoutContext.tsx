import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  TrainingSplit,
  Workout,
  SectionHeading,
  ExerciseItem,
  SetItem,
  SetType,
} from '../types/workout';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

interface WorkoutContextType {
  splits: TrainingSplit[];
  workouts: Workout[];
  isLoading: boolean;
  createSplit: (name: string, description?: string) => Promise<TrainingSplit>;
  updateSplit: (id: string, name: string, description?: string) => Promise<void>;
  deleteSplit: (id: string) => Promise<void>;
  createWorkout: (splitId: string, name: string, focus?: string) => Promise<Workout>;
  updateWorkoutDetails: (id: string, name: string, focus?: string) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  getSplitById: (id: string) => TrainingSplit | undefined;
  getWorkoutsForSplit: (splitId: string) => Workout[];
  getWorkoutById: (id: string) => Workout | undefined;
  toggleHeadingCollapse: (workoutId: string, headingId: string) => Promise<void>;
  addHeading: (
    workoutId: string,
    title: string,
    color: SectionHeading['color']
  ) => Promise<SectionHeading>;
  updateHeading: (
    workoutId: string,
    headingId: string,
    title: string,
    color: SectionHeading['color']
  ) => Promise<void>;
  deleteHeading: (workoutId: string, headingId: string) => Promise<void>;
  addExercise: (
    workoutId: string,
    exerciseData: Omit<ExerciseItem, 'id'>
  ) => Promise<ExerciseItem>;
  updateExercise: (workoutId: string, exercise: ExerciseItem) => Promise<void>;
  deleteExercise: (workoutId: string, exerciseId: string) => Promise<void>;
  addSet: (
    workoutId: string,
    exerciseId: string,
    setData: Omit<SetItem, 'id'>
  ) => Promise<SetItem>;
  toggleSetCompleted: (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => Promise<void>;
  toggleSetType: (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => Promise<void>;
  updateSet: (
    workoutId: string,
    exerciseId: string,
    set: SetItem
  ) => Promise<void>;
  deleteSet: (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => Promise<void>;
  reorderSplits: (newSplits: TrainingSplit[]) => Promise<void>;
  reorderWorkouts: (splitId: string, orderedSplitWorkouts: Workout[]) => Promise<void>;
  reorderExercises: (workoutId: string, orderedExercises: ExerciseItem[]) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { withLoading, showLoading, hideLoading } = useLoading();
  const [splits, setSplits] = useState<TrainingSplit[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data on start or when user logs in / switches account
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      showLoading('Loading workouts...');
      try {
        if (user && user.uid && firebaseService.isConfigured) {
          // 1. Fetch directly from Cloud Firestore
          const cloudSplits = await firebaseService.fetchSplitsFromCloud(user.uid);
          const cloudWorkouts = await firebaseService.fetchWorkoutsFromCloud(user.uid);

          if (!isCancelled) {
            setSplits(cloudSplits);
            setWorkouts(cloudWorkouts);
            await storageService.saveSplits(cloudSplits);
            await storageService.saveWorkouts(cloudWorkouts);
          }
        } else {
          // Local fallback
          const [loadedSplits, loadedWorkouts] = await Promise.all([
            storageService.getSplits(),
            storageService.getWorkouts(),
          ]);
          if (!isCancelled) {
            setSplits(loadedSplits);
            setWorkouts(loadedWorkouts);
          }
        }
      } catch (e) {
        console.error('Failed loading workout data from Firestore:', e);
        const [cachedSplits, cachedWorkouts] = await Promise.all([
          storageService.getSplits(),
          storageService.getWorkouts(),
        ]);
        if (!isCancelled) {
          setSplits(cachedSplits);
          setWorkouts(cachedWorkouts);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          hideLoading();
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user?.uid]);

  // Save splits state locally
  const saveSplitsState = async (newSplits: TrainingSplit[]) => {
    setSplits(newSplits);
    await storageService.saveSplits(newSplits);
  };

  // Save workouts state locally
  const saveWorkoutsState = async (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    await storageService.saveWorkouts(newWorkouts);
  };

  const createSplit = async (name: string, description?: string): Promise<TrainingSplit> => {
    return withLoading(async () => {
      const newSplit: TrainingSplit = {
        id: 'split-' + Date.now(),
        name: name.trim() || 'New Training Split',
        description: description?.trim() || undefined,
        createdAt: Date.now(),
      };
      const updated = [newSplit, ...splits];
      await saveSplitsState(updated);

      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncSplitToCloud(user.uid, newSplit, 0);
        await firebaseService.syncSplitsOrderToCloud(user.uid, updated);
      }

      return newSplit;
    }, 'Creating split...');
  };

  const updateSplit = async (id: string, name: string, description?: string) => {
    return withLoading(async () => {
      let targetSplit: TrainingSplit | null = null;
      const updated = splits.map((s) => {
        if (s.id === id) {
          targetSplit = {
            ...s,
            name: name.trim() || s.name,
            description: description?.trim() || undefined,
          };
          return targetSplit;
        }
        return s;
      });

      await saveSplitsState(updated);

      if (targetSplit && user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncSplitToCloud(user.uid, targetSplit);
      }
    }, 'Saving split...');
  };

  const deleteSplit = async (id: string) => {
    return withLoading(async () => {
      const updatedSplits = splits.filter((s) => s.id !== id);
      const updatedWorkouts = workouts.filter((w) => w.splitId !== id);
      await Promise.all([
        saveSplitsState(updatedSplits),
        saveWorkoutsState(updatedWorkouts),
      ]);

      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.deleteSplitFromCloud(user.uid, id);
      }
    }, 'Deleting split...');
  };

  const createWorkout = async (
    splitId: string,
    name: string,
    focus?: string
  ): Promise<Workout> => {
    return withLoading(async () => {
      const newWorkout: Workout = {
        id: 'workout-' + Date.now(),
        splitId,
        name: name.trim() || 'New Workout',
        focus: focus?.trim() || '',
        createdAt: Date.now(),
        headings: [],
        exercises: [],
      };
      const updated = [...workouts, newWorkout];
      await saveWorkoutsState(updated);

      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncWorkoutToCloud(user.uid, newWorkout, updated.length - 1);
      }

      return newWorkout;
    }, 'Creating workout...');
  };

  const updateWorkoutDetails = async (id: string, name: string, focus?: string) => {
    return withLoading(async () => {
      let targetWorkout: Workout | null = null;
      const updated = workouts.map((w) => {
        if (w.id === id) {
          targetWorkout = {
            ...w,
            name: name.trim() || w.name,
            focus: focus !== undefined ? focus.trim() : w.focus,
          };
          return targetWorkout;
        }
        return w;
      });

      await saveWorkoutsState(updated);

      if (targetWorkout && user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncWorkoutToCloud(user.uid, targetWorkout);
      }
    }, 'Saving workout...');
  };

  const deleteWorkout = async (id: string) => {
    return withLoading(async () => {
      const updated = workouts.filter((w) => w.id !== id);
      await saveWorkoutsState(updated);

      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.deleteWorkoutFromCloud(user.uid, id);
      }
    }, 'Deleting workout...');
  };

  const updateWorkout = async (updatedWorkout: Workout) => {
    return withLoading(async () => {
      const updated = workouts.map((w) =>
        w.id === updatedWorkout.id ? updatedWorkout : w
      );
      await saveWorkoutsState(updated);

      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncWorkoutToCloud(user.uid, updatedWorkout);
      }
    }, 'Saving changes...');
  };

  const getSplitById = (id: string) => splits.find((s) => s.id === id);

  const getWorkoutsForSplit = (splitId: string) =>
    workouts.filter((w) => w.splitId === splitId);

  const getWorkoutById = (id: string) => workouts.find((w) => w.id === id);

  const toggleHeadingCollapse = async (workoutId: string, headingId: string) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedHeadings = workout.headings.map((h) =>
      h.id === headingId ? { ...h, isCollapsed: !h.isCollapsed } : h
    );

    await updateWorkout({ ...workout, headings: updatedHeadings });
  };

  const addHeading = async (
    workoutId: string,
    title: string,
    color: SectionHeading['color']
  ): Promise<SectionHeading> => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) throw new Error('Workout not found');

      const newHeading: SectionHeading = {
        id: 'heading-' + Date.now(),
        title: title.trim() || 'Group',
        color: color || 'blue',
        isCollapsed: false,
      };

      const updatedHeadings = [...workout.headings, newHeading];
      await updateWorkout({ ...workout, headings: updatedHeadings });
      return newHeading;
    }, 'Adding group...');
  };

  const updateHeading = async (
    workoutId: string,
    headingId: string,
    title: string,
    color: SectionHeading['color']
  ) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedHeadings = workout.headings.map((h) =>
        h.id === headingId
          ? { ...h, title: title.trim() || h.title, color: color || h.color }
          : h
      );

      await updateWorkout({ ...workout, headings: updatedHeadings });
    }, 'Saving group...');
  };

  const deleteHeading = async (workoutId: string, headingId: string) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedHeadings = workout.headings.filter((h) => h.id !== headingId);
      const updatedExercises = workout.exercises.filter((ex) => ex.headingId !== headingId);

      await updateWorkout({
        ...workout,
        headings: updatedHeadings,
        exercises: updatedExercises,
      });
    }, 'Deleting group...');
  };

  const addExercise = async (
    workoutId: string,
    exerciseData: Omit<ExerciseItem, 'id'>
  ): Promise<ExerciseItem> => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) throw new Error('Workout not found');

      const newExercise: ExerciseItem = {
        ...exerciseData,
        id: 'ex-' + Date.now(),
        sets: exerciseData.sets || [],
      };

      const updatedExercises = [...workout.exercises, newExercise];
      await updateWorkout({ ...workout, exercises: updatedExercises });
      return newExercise;
    }, 'Adding exercise...');
  };

  const updateExercise = async (workoutId: string, exercise: ExerciseItem) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedExercises = workout.exercises.map((ex) =>
        ex.id === exercise.id ? exercise : ex
      );
      await updateWorkout({ ...workout, exercises: updatedExercises });
    }, 'Saving exercise...');
  };

  const deleteExercise = async (workoutId: string, exerciseId: string) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedExercises = workout.exercises.filter((ex) => ex.id !== exerciseId);
      await updateWorkout({ ...workout, exercises: updatedExercises });
    }, 'Deleting exercise...');
  };

  const addSet = async (
    workoutId: string,
    exerciseId: string,
    setData: Omit<SetItem, 'id'>
  ): Promise<SetItem> => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) throw new Error('Workout not found');

      const newSet: SetItem = {
        ...setData,
        id: 's-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      };

      const updatedExercises = workout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          if (newSet.type === 'warmup') {
            const lastWarmupIndex = ex.sets.reduce(
              (lastIdx, s, idx) => (s.type === 'warmup' ? idx : lastIdx),
              -1
            );
            const newSets = [...ex.sets];
            newSets.splice(lastWarmupIndex + 1, 0, newSet);
            return { ...ex, sets: newSets };
          } else {
            return { ...ex, sets: [...ex.sets, newSet] };
          }
        }
        return ex;
      });

      await updateWorkout({ ...workout, exercises: updatedExercises });
      return newSet;
    }, 'Adding set...');
  };

  const toggleSetCompleted = async (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s
          ),
        };
      }
      return ex;
    });

    await updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const toggleSetType = async (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId
              ? { ...s, type: (s.type === 'warmup' ? 'active' : 'warmup') as SetType }
              : s
          ),
        };
      }
      return ex;
    });

    await updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const updateSet = async (
    workoutId: string,
    exerciseId: string,
    updatedSet: SetItem
  ) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedExercises = workout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const rawUpdated = ex.sets.map((s) => (s.id === updatedSet.id ? updatedSet : s));
          const warmups = rawUpdated.filter((s) => s.type === 'warmup');
          const actives = rawUpdated.filter((s) => s.type !== 'warmup');
          return {
            ...ex,
            sets: [...warmups, ...actives],
          };
        }
        return ex;
      });

      await updateWorkout({ ...workout, exercises: updatedExercises });
    }, 'Saving set...');
  };

  const deleteSet = async (
    workoutId: string,
    exerciseId: string,
    setId: string
  ) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;

      const updatedExercises = workout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
          };
        }
        return ex;
      });

      await updateWorkout({ ...workout, exercises: updatedExercises });
    }, 'Deleting set...');
  };

  const reorderSplits = async (newSplits: TrainingSplit[]) => {
    return withLoading(async () => {
      await saveSplitsState(newSplits);
      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncSplitsOrderToCloud(user.uid, newSplits);
      }
    }, 'Saving order...');
  };

  const reorderWorkouts = async (splitId: string, orderedSplitWorkouts: Workout[]) => {
    return withLoading(async () => {
      const otherWorkouts = workouts.filter((w) => w.splitId !== splitId);
      const updated = [...otherWorkouts, ...orderedSplitWorkouts];
      await saveWorkoutsState(updated);
      if (user && user.uid && firebaseService.isConfigured) {
        await firebaseService.syncWorkoutsOrderToCloud(user.uid, updated);
      }
    }, 'Saving order...');
  };

  const reorderExercises = async (workoutId: string, orderedExercises: ExerciseItem[]) => {
    return withLoading(async () => {
      const workout = getWorkoutById(workoutId);
      if (!workout) return;
      await updateWorkout({ ...workout, exercises: orderedExercises });
    }, 'Saving order...');
  };

  return (
    <WorkoutContext.Provider
      value={{
        splits,
        workouts,
        isLoading,
        createSplit,
        updateSplit,
        deleteSplit,
        createWorkout,
        updateWorkoutDetails,
        deleteWorkout,
        updateWorkout,
        getSplitById,
        getWorkoutsForSplit,
        getWorkoutById,
        toggleHeadingCollapse,
        addHeading,
        updateHeading,
        deleteHeading,
        addExercise,
        updateExercise,
        deleteExercise,
        addSet,
        toggleSetCompleted,
        toggleSetType,
        updateSet,
        deleteSet,
        reorderSplits,
        reorderWorkouts,
        reorderExercises,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};
