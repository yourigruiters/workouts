import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plus,
  Dumbbell,
  GripVertical,
  LogOut,
  Layers,
} from 'lucide-react-native';
import { useWorkouts } from '../src/context/WorkoutContext';
import { useAuth } from '../src/context/AuthContext';
import { CreateSplitModal } from '../src/components/CreateSplitModal';
import { DraggableReorderList } from '../src/components/DraggableReorderList';
import { TrainingSplit } from '../src/types/workout';

export default function SplitsScreen() {
  const router = useRouter();
  const { splits, workouts, isLoading, createSplit, reorderSplits } = useWorkouts();
  const { user, logout } = useAuth();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleCreateSplit = async (name: string) => {
    const newSplit = await createSplit(name);
    router.push({
      pathname: '/split/[id]',
      params: { id: newSplit.id },
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const renderSplitItem = ({
    item,
    dragHandleProps,
  }: {
    item: TrainingSplit;
    dragHandleProps: any;
  }) => {
    const splitWorkouts = workouts.filter((w) => w.splitId === item.id);
    const totalExercises = splitWorkouts.reduce(
      (acc, w) => acc + (w.exercises?.length || 0),
      0
    );

    return (
      <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-sm">
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.push({
              pathname: '/split/[id]',
              params: { id: item.id },
            })
          }
          className="flex-row items-center flex-1 pr-3"
        >
          <View className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-4">
            <Dumbbell size={22} color="#2563EB" />
          </View>

          <View className="flex-1">
            <Text className="text-slate-900 text-base font-bold tracking-tight">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1 space-x-2">
              <Text className="text-blue-600 text-xs font-semibold">
                {splitWorkouts.length} {splitWorkouts.length === 1 ? 'Workout' : 'Workouts'}
              </Text>
              <Text className="text-slate-300 text-xs">•</Text>
              <Text className="text-slate-500 text-xs font-medium">
                {totalExercises} Exercises
              </Text>
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
  };

  const userGreeting = user?.displayName || user?.email?.split('@')[0] || 'Athlete';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Bar with 'Hey [user]' and 'Logout' with icon */}
        <View className="flex-row items-center justify-between pb-3">
          <Text className="text-slate-600 text-sm font-bold tracking-wide">
            Hey {userGreeting}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="flex-row items-center px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <Text className="text-slate-700 font-bold text-xs mr-1.5">
              Logout
            </Text>
            <LogOut size={15} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Heading: Training Splits overview */}
        <View className="py-3 mb-2">
          <Text className="text-slate-900 text-2xl font-black tracking-tight">
            Training Splits overview
          </Text>
          <Text className="text-slate-500 text-xs font-medium mt-1">
            Manage and structure your weekly workout routines
          </Text>
        </View>

        {/* Action Button: Add split (On top of content) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}
          className="bg-blue-600 py-3.5 px-4 rounded-xl flex-row items-center justify-center mb-5 shadow-sm"
        >
          <Plus size={18} color="#FFFFFF" />
          <Text className="text-white font-bold text-sm ml-2">Add split</Text>
        </TouchableOpacity>

        {/* Splits List */}
        {isLoading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <DraggableReorderList
            data={splits}
            onReorder={reorderSplits}
            renderItem={({ item, dragHandleProps }) =>
              renderSplitItem({ item, dragHandleProps })
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-3xl mt-2">
                <Layers size={44} color="#94A3B8" />
                <Text className="text-slate-800 font-bold text-base mt-3">
                  No Training Splits Yet
                </Text>
                <Text className="text-slate-400 text-xs text-center mt-1 mb-4">
                  Tap "Add split" above to create your first training split.
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* 1-Input Create Split Modal */}
      <CreateSplitModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateSplit}
      />
    </SafeAreaView>
  );
}
