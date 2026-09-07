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
  GripVertical,
  Layers,
  Trash2,
} from 'lucide-react-native';
import { useWorkouts } from '../../src/context/WorkoutContext';
import { CreateWorkoutModal } from '../../src/components/CreateWorkoutModal';
import { ConfirmDeleteModal } from '../../src/components/ConfirmDeleteModal';
import { DraggableReorderList } from '../../src/components/DraggableReorderList';
import { Workout } from '../../src/types/workout';

export default function SplitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getSplitById,
    getWorkoutsForSplit,
    createWorkout,
    deleteSplit,
    reorderWorkouts,
  } = useWorkouts();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const split = getSplitById(id || '');
  const workouts = getWorkoutsForSplit(id || '');

  const handleCreateWorkout = async (name: string, focus?: string) => {
    if (!id) return;
    const newWorkout = await createWorkout(id, name, focus);
    router.push({
      pathname: '/workout/[id]',
      params: { id: newWorkout.id },
    });
  };

  const handleConfirmDeleteSplit = () => {
    if (!id) return;
    deleteSplit(id);
    setConfirmDeleteVisible(false);
    router.replace('/splits');
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

  const totalSplitExercises = workouts.reduce(
    (acc, w) => acc + (w.exercises?.length || 0),
    0
  );
  const totalSplitSets = workouts.reduce(
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
            className="p-2.5 rounded-xl bg-white border border-slate-200 mr-3.5 shadow-sm"
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
        <View className="bg-white border border-slate-200 p-4 rounded-2xl flex-row items-center justify-around shadow-sm mb-5">
          <View className="items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Workouts
            </Text>
            <Text className="text-slate-900 text-xl font-bold mt-0.5">
              {workouts.length}
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

        {/* Action Button: Add Workout (On top of content) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}
          className="bg-blue-600 py-3.5 px-4 rounded-xl flex-row items-center justify-center mb-5 shadow-sm"
        >
          <Plus size={18} color="#FFFFFF" />
          <Text className="text-white font-bold text-sm ml-2">
            Add workout
          </Text>
        </TouchableOpacity>

        {/* Workouts List Header */}
        <Text className="text-slate-800 text-sm font-bold uppercase tracking-wider mb-3">
          Workouts List
        </Text>

        {/* Workouts List Items with Drag & Hold Reordering */}
        <DraggableReorderList
          data={workouts}
          onReorder={(newWorkouts) => {
            if (id) reorderWorkouts(id, newWorkouts);
          }}
          renderItem={({ item, dragHandleProps }) => {
            const exerciseCount = item.exercises?.length || 0;
            const totalSets = (item.exercises || []).reduce(
              (sum, ex) => sum + (ex.sets?.length || 0),
              0
            );

            return (
              <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3.5 flex-row items-center justify-between shadow-sm">
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({
                      pathname: '/workout/[id]',
                      params: { id: item.id },
                    })
                  }
                  className="flex-row items-center flex-1 pr-3"
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

                <View
                  {...dragHandleProps}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 active:bg-blue-50 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={20} color="#64748B" />
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-2xl mb-8">
              <Layers size={40} color="#94A3B8" />
              <Text className="text-slate-800 font-bold text-base mt-2.5">
                No Workouts Added
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-1">
                Tap "Add workout" above to add routines to this split.
              </Text>
            </View>
          }
        />

        {/* Delete Training Split Button (with confirmation modal) */}
        <View className="mt-8 pt-6 border-t border-slate-200">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setConfirmDeleteVisible(true)}
            className="bg-rose-50 border border-rose-200 py-3.5 rounded-xl flex-row items-center justify-center"
          >
            <Trash2 size={16} color="#E11D48" />
            <Text className="text-rose-600 font-bold text-sm ml-2">
              Delete training split
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 1-Input Create Workout Modal */}
      <CreateWorkoutModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateWorkout}
      />

      {/* Confirmation Modal for Delete Split (No quotes) */}
      <ConfirmDeleteModal
        visible={confirmDeleteVisible}
        title={`Delete ${split.name}?`}
        message="Are you sure you want to delete this training split? All workouts and exercises inside will be permanently removed."
        confirmText="Delete Split"
        onConfirm={handleConfirmDeleteSplit}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </SafeAreaView>
  );
}
