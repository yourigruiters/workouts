import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Plus,
  Dumbbell,
  GripVertical,
  LogOut,
  Layers,
  Edit3,
  Check,
  Trash2,
  X,
} from "lucide-react-native";
import { useWorkouts } from "../src/context/WorkoutContext";
import { useAuth } from "../src/context/AuthContext";
import { CreateSplitModal } from "../src/components/CreateSplitModal";
import { EditSplitModal } from "../src/components/EditSplitModal";
import { ConfirmDeleteModal } from "../src/components/ConfirmDeleteModal";
import { DraggableReorderList } from "../src/components/DraggableReorderList";
import { TrainingSplit } from "../src/types/workout";

export default function SplitsScreen() {
  const router = useRouter();
  const {
    splits,
    workouts,
    isLoading,
    createSplit,
    updateSplit,
    deleteSplit,
    reorderSplits,
  } = useWorkouts();
  const { user, logout } = useAuth();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSplits, setTempSplits] = useState<TrainingSplit[]>(splits);
  const [editTargetSplit, setEditTargetSplit] = useState<TrainingSplit | null>(
    null,
  );
  const [deleteTargetSplit, setDeleteTargetSplit] =
    useState<TrainingSplit | null>(null);

  const handleStartEdit = () => {
    setTempSplits(splits);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setTempSplits(splits);
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    reorderSplits(tempSplits);
    setIsEditMode(false);
  };

  const handleCreateSplit = async (name: string, description?: string) => {
    const newSplit = await createSplit(name, description);
    router.push({
      pathname: "/split/[id]",
      params: { id: newSplit.id },
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
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
      0,
    );

    return (
      <View className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
        <TouchableOpacity
          disabled={isEditMode}
          activeOpacity={isEditMode ? 1 : 0.75}
          onPress={() => {
            if (isEditMode) return;
            router.push({
              pathname: "/split/[id]",
              params: { id: item.id },
            });
          }}
          className={`flex-row items-center flex-1 pr-3 ${
            isEditMode ? "cursor-default" : ""
          }`}
        >
          <View className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center mr-4">
            <Dumbbell size={22} color="#2563EB" />
          </View>

          <View className="flex-1">
            <Text className="text-slate-900 text-base font-bold tracking-tight">
              {item.name}
            </Text>
            {Boolean(item.description) && (
              <Text
                className="text-slate-500 text-xs font-medium mt-0.5"
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
            <View className="flex-row items-center mt-1 space-x-2">
              <Text className="text-blue-600 text-xs font-semibold">
                {splitWorkouts.length}{" "}
                {splitWorkouts.length === 1 ? "Workout" : "Workouts"}
              </Text>
              <Text className="text-slate-300 text-xs">•</Text>
              <Text className="text-slate-500 text-xs font-medium">
                {totalExercises} Exercises
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {isEditMode && (
          <View className="flex-row items-center">
            <View
              {...dragHandleProps}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 active:bg-blue-50 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={20} color="#64748B" />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setEditTargetSplit(item)}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 ml-2 hover:bg-slate-200"
            >
              <Edit3 size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const userGreeting =
    user?.displayName || user?.email?.split("@")[0] || "Athlete";

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
            Manage and structure your workout routines
          </Text>
        </View>

        {/* Action Buttons: Add split (or Cancel in edit mode) & Edit/Done Button */}
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
                Add split
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={isEditMode ? handleSaveEdit : handleStartEdit}
            className={`px-4 py-3.5 rounded-xl flex-row items-center justify-center border ${
              isEditMode
                ? "bg-amber-400/30 border-amber-500/60"
                : "bg-amber-100/70 border-amber-300/80 hover:bg-amber-200/80"
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

        {/* Splits List */}
        {isLoading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <DraggableReorderList
            data={isEditMode ? tempSplits : splits}
            onReorder={isEditMode ? setTempSplits : reorderSplits}
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

      {/* Edit Split Modal (Change name/description and delete in overlay) */}
      <EditSplitModal
        visible={Boolean(editTargetSplit)}
        split={editTargetSplit}
        onClose={() => setEditTargetSplit(null)}
        onSave={(name, desc) => {
          if (editTargetSplit) {
            updateSplit(editTargetSplit.id, name, desc);
          }
        }}
        onDelete={() => {
          if (editTargetSplit) {
            setDeleteTargetSplit(editTargetSplit);
            setEditTargetSplit(null);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={Boolean(deleteTargetSplit)}
        title={`Delete ${deleteTargetSplit?.name || ""}?`}
        message="Are you sure you want to delete this training split? All workouts and exercises inside will be permanently removed."
        confirmText="Delete Split"
        onConfirm={() => {
          if (deleteTargetSplit) {
            deleteSplit(deleteTargetSplit.id);
            setDeleteTargetSplit(null);
          }
        }}
        onCancel={() => setDeleteTargetSplit(null)}
      />
    </SafeAreaView>
  );
}
