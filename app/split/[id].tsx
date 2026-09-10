import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Layers,
  Edit3,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { useWorkouts } from '../../src/context/WorkoutContext';
import { CreateWorkoutModal } from '../../src/components/CreateWorkoutModal';
import { EditWorkoutModal } from '../../src/components/EditWorkoutModal';
import { ConfirmDeleteModal } from '../../src/components/ConfirmDeleteModal';
import { Workout } from '../../src/types/workout';

export default function SplitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getSplitById,
    getWorkoutsForSplit,
    createWorkout,
    updateWorkoutDetails,
    deleteWorkout,
    reorderWorkouts,
  } = useWorkouts();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetWorkout, setEditTargetWorkout] = useState<Workout | null>(null);
  const [deleteTargetWorkout, setDeleteTargetWorkout] = useState<Workout | null>(null);

  const split = getSplitById(id || '');
  const workouts = getWorkoutsForSplit(id || '');
  const [tempWorkouts, setTempWorkouts] = useState<Workout[]>(workouts);

  const handleStartEdit = () => {
    setTempWorkouts(workouts);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setTempWorkouts(workouts);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (id) {
      const removedWorkouts = workouts.filter(
        (w) => !tempWorkouts.some((tw) => tw.id === w.id),
      );
      for (const r of removedWorkouts) {
        await deleteWorkout(r.id);
      }
      await reorderWorkouts(id, tempWorkouts);
    }
    setIsEditMode(false);
  };

  const handleConfirmDeleteWorkout = () => {
    if (!deleteTargetWorkout) return;
    if (isEditMode) {
      setTempWorkouts((prev) =>
        prev.filter((w) => w.id !== deleteTargetWorkout.id),
      );
    } else {
      deleteWorkout(deleteTargetWorkout.id);
    }
    setDeleteTargetWorkout(null);
  };

  const handleMoveWorkout = (fromIndex: number, toIndex: number) => {
    const list = isEditMode ? tempWorkouts : workouts;
    if (
      fromIndex < 0 ||
      fromIndex >= list.length ||
      toIndex < 0 ||
      toIndex >= list.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const updated = [...list];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    if (isEditMode) {
      setTempWorkouts(updated);
    } else if (id) {
      reorderWorkouts(id, updated);
    }
  };

  const handleCreateWorkout = async (name: string, focus?: string) => {
    if (!id) return;
    const newWorkout = await createWorkout(id, name, focus);
    router.push({
      pathname: '/workout/[id]',
      params: { id: newWorkout.id },
    });
  };

  if (!split) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-slate-800 font-bold text-lg mb-3">
          Split Not Found
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/splits')}
          className="bg-blue-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Back to Splits</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentWorkouts = isEditMode ? tempWorkouts : workouts;

  const totalSplitExercises = currentWorkouts.reduce(
    (acc, w) => acc + (w.exercises?.length || 0),
    0
  );
  const totalSplitSets = currentWorkouts.reduce(
    (acc, w) =>
      acc + (w.exercises || []).reduce((sAcc, ex) => sAcc + (ex.sets?.length || 0), 0),
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}
      >
        {/* Header (Clean, only back navigation and Split Title) */}
        <View className="flex-row items-center mb-5 pb-3 border-b border-slate-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 mr-3.5"
          >
            <ArrowLeft size={18} color="#334155" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Training Split
            </Text>
            <Text
              numberOfLines={1}
              className="text-slate-900 text-2xl font-black tracking-tight"
            >
              {split.name}
            </Text>
          </View>
        </View>

        {/* Overview Summary Banner */}
        <View className="bg-white border border-slate-200 p-4 rounded-2xl flex-row items-center justify-around mb-5">
          <View className="items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Workouts
            </Text>
            <Text className="text-slate-900 text-xl font-bold mt-0.5">
              {currentWorkouts.length}
            </Text>
          </View>
          <View className="w-[1px] h-8 bg-slate-200" />
          <View className="items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Exercises
            </Text>
            <Text className="text-blue-600 text-xl font-bold mt-0.5">
              {totalSplitExercises}
            </Text>
          </View>
          <View className="w-[1px] h-8 bg-slate-200" />
          <View className="items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Total Sets
            </Text>
            <Text className="text-emerald-600 text-xl font-bold mt-0.5">
              {totalSplitSets}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Add Workout (or Cancel in edit mode) & Yellow Edit Mode Button */}
        <View className="flex-row items-center mb-5">
          {isEditMode ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancelEdit}
              className="flex-1 bg-slate-200 border border-slate-300 py-3.5 px-4 rounded-xl flex-row items-center justify-center mr-2.5"
            >
              <X size={17} color="#475569" />
              <Text className="text-slate-800 font-bold text-sm ml-1.5">
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCreateModalVisible(true)}
              className="flex-1 bg-blue-600 py-3.5 px-4 rounded-xl flex-row items-center justify-center mr-2.5"
            >
              <Plus size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-2">
                Add workout
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={isEditMode ? handleSaveEdit : handleStartEdit}
            className={`px-4 py-3.5 rounded-xl flex-row items-center justify-center border ${
              isEditMode
                ? 'bg-amber-400/30 border-amber-500/60'
                : 'bg-amber-100/70 border-amber-300/80 hover:bg-amber-200/80'
            }`}
          >
            {isEditMode ? (
              <>
                <Check size={16} color="#78350F" />
                <Text className="text-amber-950 font-black text-sm ml-1.5">
                  Done
                </Text>
              </>
            ) : (
              <>
                <Edit3 size={16} color="#78350F" />
                <Text className="text-amber-950 font-bold text-sm ml-1.5">
                  Edit
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Workouts List Header */}
        <Text className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-3">
          Workouts List
        </Text>

        {/* Workouts List Items with 1-Tap Up/Down Reordering */}
        {currentWorkouts.length === 0 ? (
          <View className="items-center justify-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-2xl mb-8">
            <Layers size={40} color="#94A3B8" />
            <Text className="text-slate-800 font-bold text-base mt-2.5">
              No Workouts Added
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Tap "Add workout" above to add routines to this split.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {currentWorkouts.map((item, index) => {
              const exerciseCount = item.exercises?.length || 0;
              const totalSets = (item.exercises || []).reduce(
                (sum, ex) => sum + (ex.sets?.length || 0),
                0
              );
              const canMoveUp = index > 0;
              const canMoveDown = index < currentWorkouts.length - 1;

              return (
                <View
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <TouchableOpacity
                    disabled={isEditMode}
                    activeOpacity={isEditMode ? 1 : 0.75}
                    onPress={() => {
                      if (isEditMode) return;
                      router.push({
                        pathname: '/workout/[id]',
                        params: { id: item.id },
                      });
                    }}
                    className={`flex-row items-center flex-1 pr-3 ${
                      isEditMode ? 'cursor-default' : ''
                    }`}
                  >
                    <View className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-3.5">
                      <Calendar size={20} color="#2563EB" />
                    </View>

                    <View className="flex-1">
                      {/* Workout Name */}
                      <Text className="text-slate-900 text-base font-bold tracking-tight">
                        {item.name}
                      </Text>

                      {/* Workout Focus Description (Only if provided) */}
                      {Boolean(item.focus) && (
                        <Text className="text-slate-500 text-xs font-medium mt-0.5">
                          {item.focus}
                        </Text>
                      )}

                      {/* X of Exercises, X of Sets */}
                      <View className="flex-row items-center mt-2 space-x-2">
                        <View className="bg-slate-100 px-2.5 py-0.5 rounded-md">
                          <Text className="text-blue-700 text-xs font-bold">
                            {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
                          </Text>
                        </View>

                        <View className="bg-slate-100 px-2.5 py-0.5 rounded-md ml-2">
                          <Text className="text-emerald-700 text-xs font-bold">
                            {totalSets} {totalSets === 1 ? 'Set' : 'Sets'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isEditMode && (
                    <View className="flex-row items-center">
                      {/* 1-Tap Up / Down Stepper for 100% reliable mobile reordering */}
                      <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden mr-2">
                        <TouchableOpacity
                          activeOpacity={0.6}
                          disabled={!canMoveUp}
                          onPress={() => handleMoveWorkout(index, index - 1)}
                          className={`p-2.5 ${canMoveUp ? 'hover:bg-slate-200 active:bg-blue-100' : 'opacity-25'}`}
                        >
                          <ChevronUp size={16} color={canMoveUp ? '#1E293B' : '#94A3B8'} />
                        </TouchableOpacity>
                        <View className="w-[1px] h-4 bg-slate-200" />
                        <TouchableOpacity
                          activeOpacity={0.6}
                          disabled={!canMoveDown}
                          onPress={() => handleMoveWorkout(index, index + 1)}
                          className={`p-2.5 ${canMoveDown ? 'hover:bg-slate-200 active:bg-blue-100' : 'opacity-25'}`}
                        >
                          <ChevronDown size={16} color={canMoveDown ? '#1E293B' : '#94A3B8'} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setEditTargetWorkout(item)}
                        className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200"
                      >
                        <Edit3 size={17} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 1-Input Create Workout Modal */}
      <CreateWorkoutModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateWorkout}
      />

      {/* Edit Workout Modal (Change name/focus and delete in overlay) */}
      <EditWorkoutModal
        visible={Boolean(editTargetWorkout)}
        workout={editTargetWorkout}
        onClose={() => setEditTargetWorkout(null)}
        onSave={(name, focus) => {
          if (editTargetWorkout) {
            updateWorkoutDetails(editTargetWorkout.id, name, focus);
          }
        }}
        onDelete={() => {
          if (editTargetWorkout) {
            const workoutToDelete = editTargetWorkout;
            setDeleteTargetWorkout(workoutToDelete);
            setEditTargetWorkout(null);
          }
        }}
      />

      {/* Delete Confirmation Modal for Workout */}
      <ConfirmDeleteModal
        visible={Boolean(deleteTargetWorkout)}
        title={`Delete ${deleteTargetWorkout?.name || ''}?`}
        message="Are you sure you want to delete this workout? All exercises and sets inside will be permanently removed."
        confirmText="Delete Workout"
        onConfirm={handleConfirmDeleteWorkout}
        onCancel={() => setDeleteTargetWorkout(null)}
      />
    </SafeAreaView>
  );
}
