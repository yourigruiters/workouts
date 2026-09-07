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
  const [splits, setSplits] = useState<TrainingSplit[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedSplits, loadedWorkouts] = await Promise.all([
          storageService.getSplits(),
          storageService.getWorkouts(),
        ]);
        setSplits(loadedSplits);
        setWorkouts(loadedWorkouts);
      } catch (e) {
        console.error('Failed loading workout data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveSplitsState = async (newSplits: TrainingSplit[]) => {
    setSplits(newSplits);
    await storageService.saveSplits(newSplits);
  };

  const saveWorkoutsState = async (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    await storageService.saveWorkouts(newWorkouts);
  };

  const createSplit = async (name: string, description?: string): Promise<TrainingSplit> => {
    const newSplit: TrainingSplit = {
      id: 'split-' + Date.now(),
      name: name.trim() || 'New Training Split',
      description: description?.trim() || undefined,
      createdAt: Date.now(),
    };
    const updated = [newSplit, ...splits];
    await saveSplitsState(updated);
    return newSplit;
  };

  const updateSplit = async (id: string, name: string, description?: string) => {
    const updated = splits.map((s) =>
      s.id === id
        ? {
            ...s,
            name: name.trim() || s.name,
            description: description?.trim() || undefined,
          }
        : s
    );
    await saveSplitsState(updated);
  };

  const deleteSplit = async (id: string) => {
    const updatedSplits = splits.filter((s) => s.id !== id);
    const updatedWorkouts = workouts.filter((w) => w.splitId !== id);
    await Promise.all([
      saveSplitsState(updatedSplits),
      saveWorkoutsState(updatedWorkouts),
    ]);
  };

  const createWorkout = async (
    splitId: string,
    name: string,
    focus?: string
  ): Promise<Workout> => {
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
    return newWorkout;
  };

  const updateWorkoutDetails = async (id: string, name: string, focus?: string) => {
    const updated = workouts.map((w) =>
      w.id === id
        ? {
            ...w,
            name: name.trim() || w.name,
            focus: focus !== undefined ? focus.trim() : w.focus,
          }
        : w
    );
    await saveWorkoutsState(updated);
  };

  const deleteWorkout = async (id: string) => {
    const updated = workouts.filter((w) => w.id !== id);
    await saveWorkoutsState(updated);
  };

  const updateWorkout = async (updatedWorkout: Workout) => {
    const updated = workouts.map((w) =>
      w.id === updatedWorkout.id ? updatedWorkout : w
    );
    await saveWorkoutsState(updated);
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
  };

  const updateHeading = async (
    workoutId: string,
    headingId: string,
    title: string,
    color: SectionHeading['color']
  ) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedHeadings = workout.headings.map((h) =>
      h.id === headingId
        ? { ...h, title: title.trim() || h.title, color: color || h.color }
        : h
    );

    await updateWorkout({ ...workout, headings: updatedHeadings });
  };

  const deleteHeading = async (workoutId: string, headingId: string) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedHeadings = workout.headings.filter((h) => h.id !== headingId);
    const updatedExercises = workout.exercises.filter((ex) => ex.headingId !== headingId);

    await updateWorkout({
      ...workout,
      headings: updatedHeadings,
      exercises: updatedExercises,
    });
  };

  const addExercise = async (
    workoutId: string,
    exerciseData: Omit<ExerciseItem, 'id'>
  ): Promise<ExerciseItem> => {
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
  };

  const updateExercise = async (workoutId: string, exercise: ExerciseItem) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === exercise.id ? exercise : ex
    );
    await updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const deleteExercise = async (workoutId: string, exerciseId: string) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.filter((ex) => ex.id !== exerciseId);
    await updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const addSet = async (
    workoutId: string,
    exerciseId: string,
    setData: Omit<SetItem, 'id'>
  ): Promise<SetItem> => {
    const workout = getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');

    const newSet: SetItem = {
      ...setData,
      id: 's-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };

    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        if (newSet.type === 'warmup') {
          // Warmup sets when added should always be at the top
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
  };

  const deleteSet = async (
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
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      }
      return ex;
    });

    await updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const reorderSplits = async (newSplits: TrainingSplit[]) => {
    await saveSplitsState(newSplits);
  };

  const reorderWorkouts = async (splitId: string, orderedSplitWorkouts: Workout[]) => {
    let splitIndex = 0;
    const updated = workouts.map((w) => {
      if (w.splitId === splitId) {
        const next = orderedSplitWorkouts[splitIndex];
        splitIndex++;
        return next || w;
      }
      return w;
    });
    await saveWorkoutsState(updated);
  };

  const reorderExercises = async (workoutId: string, orderedExercises: ExerciseItem[]) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return;
    await updateWorkout({ ...workout, exercises: orderedExercises });
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
