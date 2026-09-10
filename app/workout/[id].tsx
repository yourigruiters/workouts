import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Layers,
  Edit3,
  Check,
  X,
} from "lucide-react-native";
import { useWorkouts } from "../../src/context/WorkoutContext";
import { GroupSection } from "../../src/components/GroupSection";
import { ExerciseCard } from "../../src/components/ExerciseCard";
import { EditExerciseModal } from "../../src/components/EditExerciseModal";
import { AddExerciseModal } from "../../src/components/AddExerciseModal";
import { AddHeadingModal } from "../../src/components/AddHeadingModal";
import { EditGroupModal } from "../../src/components/EditGroupModal";
import { ConfirmDeleteModal } from "../../src/components/ConfirmDeleteModal";
import { ExerciseItem, SectionHeading } from "../../src/types/workout";

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getWorkoutById,
    addHeading,
    updateHeading,
    deleteHeading,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    updateWorkout,
  } = useWorkouts();

  const workout = getWorkoutById(id || "");

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempExercises, setTempExercises] = useState<ExerciseItem[]>(
    workout?.exercises || [],
  );
  const [tempHeadings, setTempHeadings] = useState<SectionHeading[]>(
    workout?.headings || [],
  );

  // Group Collapsed / Expanded State (Always starts completely closed)
  const [expandedHeadingIds, setExpandedHeadingIds] = useState<
    Record<string, boolean>
  >({});

  // Modal States
  const [editModalExercise, setEditModalExercise] =
    useState<ExerciseItem | null>(null);
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [addGroupVisible, setAddGroupVisible] = useState(false);

  // Edit Group Modal State
  const [editGroupTarget, setEditGroupTarget] = useState<SectionHeading | null>(
    null,
  );

  // Delete Confirmation States
  const [deleteTargetExercise, setDeleteTargetExercise] =
    useState<ExerciseItem | null>(null);
  const [deleteGroupTarget, setDeleteGroupTarget] =
    useState<SectionHeading | null>(null);

  const handleStartEdit = () => {
    setTempExercises(workout?.exercises || []);
    setTempHeadings(workout?.headings || []);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setTempExercises(workout?.exercises || []);
    setTempHeadings(workout?.headings || []);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (workout) {
      await updateWorkout({
        ...workout,
        headings: tempHeadings,
        exercises: tempExercises,
      });
    }
    setIsEditMode(false);
  };

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-slate-800 font-bold text-lg mb-3">
          Workout Not Found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const headings = isEditMode
    ? tempHeadings
    : workout.headings || [];
  const hasGroups = headings.length > 0;

  const currentExercises = isEditMode
    ? tempExercises
    : workout.exercises || [];

  const totalExercises = currentExercises.length;
  const totalSets = currentExercises.reduce(
    (sum, ex) => sum + (ex.sets?.length || 0),
    0,
  );

  const handleConfirmDeleteGroup = () => {
    if (!deleteGroupTarget) return;
    if (isEditMode) {
      const targetId = deleteGroupTarget.id;
      setTempHeadings((prev) => prev.filter((h) => h.id !== targetId));
      setTempExercises((prev) =>
        prev.filter((ex) => ex.headingId !== targetId),
      );
    } else {
      deleteHeading(workout.id, deleteGroupTarget.id);
    }
    setDeleteGroupTarget(null);
  };

  const handleConfirmDeleteExercise = () => {
    if (!deleteTargetExercise) return;
    if (isEditMode) {
      setTempExercises((prev) =>
        prev.filter((ex) => ex.id !== deleteTargetExercise.id),
      );
    } else {
      deleteExercise(workout.id, deleteTargetExercise.id);
    }
    setDeleteTargetExercise(null);
  };

  const handleAddExerciseClick = () => {
    if (!hasGroups) {
      setAddGroupVisible(true);
    } else {
      setAddExerciseVisible(true);
    }
  };

  // Fallback top level exercises
  const topLevelExercises = currentExercises.filter(
    (ex) => !ex.headingId,
  );

  const handleMoveExerciseWithinGroup = (
    headingId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    const baseList = isEditMode ? tempExercises : workout.exercises || [];
    const groupExercises = baseList.filter((ex) => ex.headingId === headingId);
    if (
      fromIndex < 0 ||
      fromIndex >= groupExercises.length ||
      toIndex < 0 ||
      toIndex >= groupExercises.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const reorderedGroup = [...groupExercises];
    const [moved] = reorderedGroup.splice(fromIndex, 1);
    reorderedGroup.splice(toIndex, 0, moved);

    let groupIdx = 0;
    const newExercises = baseList.map((ex) => {
      if (ex.headingId === headingId) {
        const next = reorderedGroup[groupIdx];
        groupIdx++;
        return next || ex;
      }
      return ex;
    });

    if (isEditMode) {
      setTempExercises(newExercises);
    } else {
      reorderExercises(workout.id, newExercises);
    }
  };

  const handleMoveTopLevelExercise = (fromIndex: number, toIndex: number) => {
    const baseList = isEditMode ? tempExercises : workout.exercises || [];
    const topExercises = baseList.filter((ex) => !ex.headingId);
    if (
      fromIndex < 0 ||
      fromIndex >= topExercises.length ||
      toIndex < 0 ||
      toIndex >= topExercises.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const reorderedTop = [...topExercises];
    const [moved] = reorderedTop.splice(fromIndex, 1);
    reorderedTop.splice(toIndex, 0, moved);

    let topIdx = 0;
    const newExercises = baseList.map((ex) => {
      if (!ex.headingId) {
        const next = reorderedTop[topIdx];
        topIdx++;
        return next || ex;
      }
      return ex;
    });

    if (isEditMode) {
      setTempExercises(newExercises);
    } else {
      reorderExercises(workout.id, newExercises);
    }
  };

  const handleMoveGroup = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= headings.length ||
      toIndex < 0 ||
      toIndex >= headings.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const updated = [...headings];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    if (isEditMode) {
      setTempHeadings(updated);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}
      >
        {/* 1. Header (Clean: back navigation, title, focus text with NO icon) */}
        <View className="flex-row items-center mb-5 pb-3 border-b border-slate-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 mr-3.5"
          >
            <ArrowLeft size={18} color="#334155" />
          </TouchableOpacity>

          <View className="flex-1">
            {Boolean(workout.focus) && (
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
                {workout.focus}
              </Text>
            )}
            <Text
              numberOfLines={1}
              className="text-slate-900 text-2xl font-black tracking-tight"
            >
              {workout.name}
            </Text>
          </View>
        </View>

        {/* 2. Top Overview: Directly below header (X Exercises, X Sets) */}
        <View className="bg-white border border-slate-200 p-4 rounded-2xl flex-row items-center justify-around mb-5">
          <View className="flex-1 items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Total Exercises
            </Text>
            <Text className="text-blue-600 text-2xl font-black mt-0.5">
              {totalExercises}
            </Text>
          </View>

          <View className="w-[1px] h-9 bg-slate-200" />

          <View className="flex-1 items-center">
            <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Total Sets
            </Text>
            <Text className="text-emerald-600 text-2xl font-black mt-0.5">
              {totalSets}
            </Text>
          </View>
        </View>

        {/* 3. Action Buttons (Add Exercise & Add group, or Cancel in Edit Mode, and Yellow Edit/Done Button) */}
        <View className="flex-row items-center mb-5">
          {isEditMode ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancelEdit}
              className="flex-1 bg-slate-200 border border-slate-300 py-3.5 rounded-xl flex-row items-center justify-center mr-2"
            >
              <X size={17} color="#475569" />
              <Text className="text-slate-800 font-bold text-sm ml-1.5">
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAddExerciseClick}
                className="flex-1 bg-blue-600 py-3.5 rounded-xl flex-row items-center justify-center mr-2"
              >
                <Plus size={17} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm ml-1.5">
                  Add Exercise
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAddGroupVisible(true)}
                className="bg-white border border-slate-200 px-3.5 py-3.5 rounded-xl flex-row items-center justify-center mr-2"
              >
                <Layers size={17} color="#475569" />
                <Text className="text-slate-700 font-bold text-sm ml-1.5">
                  Add group
                </Text>
              </TouchableOpacity>
            </>
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
                <Text className="text-amber-950 font-black text-sm ml-1">
                  Done
                </Text>
              </>
            ) : (
              <>
                <Edit3 size={16} color="#78350F" />
                <Text className="text-amber-950 font-bold text-sm ml-1">
                  Edit
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 4. Groups with Nested Exercises Inside Tinted Dropdown Container */}

        {/* Fallback top level exercises */}
        {topLevelExercises.length > 0 && (
          <View style={{ gap: 12 }} className="mb-4">
            {topLevelExercises.map((exercise, exIndex) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isEditMode={isEditMode}
                onDeleteExercise={() => setDeleteTargetExercise(exercise)}
                onOpenEdit={() => setEditModalExercise(exercise)}
                onMoveUp={() => handleMoveTopLevelExercise(exIndex, exIndex - 1)}
                onMoveDown={() => handleMoveTopLevelExercise(exIndex, exIndex + 1)}
                canMoveUp={exIndex > 0}
                canMoveDown={exIndex < topLevelExercises.length - 1}
              />
            ))}
          </View>
        )}

        {/* Categorized Groups with Nested Exercise Cards */}
        {headings.map((heading, hIdx) => {
          const sectionExercises = currentExercises.filter(
            (ex) => ex.headingId === heading.id,
          );
          const sectionSetCount = sectionExercises.reduce(
            (sum, ex) => sum + (ex.sets?.length || 0),
            0,
          );
          const isCollapsed = !expandedHeadingIds[heading.id];

          return (
            <GroupSection
              key={heading.id}
              heading={{ ...heading, isCollapsed }}
              exerciseCount={sectionExercises.length}
              setCount={sectionSetCount}
              onToggleCollapse={() =>
                setExpandedHeadingIds((prev) => ({
                  ...prev,
                  [heading.id]: !prev[heading.id],
                }))
              }
              onEditGroup={
                isEditMode ? () => setEditGroupTarget(heading) : undefined
              }
              onMoveUp={isEditMode && headings.length > 1 ? () => handleMoveGroup(hIdx, hIdx - 1) : undefined}
              onMoveDown={isEditMode && headings.length > 1 ? () => handleMoveGroup(hIdx, hIdx + 1) : undefined}
              canMoveUp={hIdx > 0}
              canMoveDown={hIdx < headings.length - 1}
            >
              <View style={{ gap: 12 }}>
                {sectionExercises.map((exercise, exIndex) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isEditMode={isEditMode}
                    onDeleteExercise={() => setDeleteTargetExercise(exercise)}
                    onOpenEdit={() => setEditModalExercise(exercise)}
                    onMoveUp={() => handleMoveExerciseWithinGroup(heading.id, exIndex, exIndex - 1)}
                    onMoveDown={() => handleMoveExerciseWithinGroup(heading.id, exIndex, exIndex + 1)}
                    canMoveUp={exIndex > 0}
                    canMoveDown={exIndex < sectionExercises.length - 1}
                  />
                ))}
              </View>
            </GroupSection>
          );
        })}

        {/* Empty State */}
        {!hasGroups && (
          <View className="items-center justify-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-2xl mb-6">
            <Layers size={44} color="#94A3B8" />
            <Text className="text-slate-800 font-bold text-base mt-2.5">
              No Groups Created Yet
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1 mb-4">
              Create your first group (e.g. Chest or Triceps) before adding
              exercises.
            </Text>
            <TouchableOpacity
              onPress={() => setAddGroupVisible(true)}
              className="bg-blue-600 px-4 py-2.5 rounded-xl flex-row items-center"
            >
              <Plus size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1">
                Add group
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Exercise Modal */}
      <EditExerciseModal
        visible={Boolean(editModalExercise)}
        exercise={editModalExercise}
        headings={headings}
        onClose={() => setEditModalExercise(null)}
        onSave={(updated) => updateExercise(workout.id, updated)}
        onDelete={(exId) => deleteExercise(workout.id, exId)}
      />

      {/* Delete Confirmation Modal for Exercise */}
      <ConfirmDeleteModal
        visible={Boolean(deleteTargetExercise)}
        title={`Delete ${deleteTargetExercise?.name || ""}?`}
        message="Are you sure you want to delete this exercise? All logged sets will be permanently removed."
        confirmText="Delete Exercise"
        onConfirm={handleConfirmDeleteExercise}
        onCancel={() => setDeleteTargetExercise(null)}
      />

      {/* Add Exercise Modal (Mandatory group requirement) */}
      <AddExerciseModal
        visible={addExerciseVisible}
        headings={headings}
        onClose={() => setAddExerciseVisible(false)}
        onAdd={(newEx) => addExercise(workout.id, newEx)}
        onOpenAddGroup={() => setAddGroupVisible(true)}
      />

      {/* Add Group Modal */}
      <AddHeadingModal
        visible={addGroupVisible}
        onClose={() => setAddGroupVisible(false)}
        onAdd={(title, color) => addHeading(workout.id, title, color)}
      />

      {/* Edit Group Modal (Change name/color and delete in overlay) */}
      <EditGroupModal
        visible={Boolean(editGroupTarget)}
        heading={editGroupTarget}
        onClose={() => setEditGroupTarget(null)}
        onSave={(title, color) => {
          if (editGroupTarget) {
            if (isEditMode) {
              setTempHeadings((prev) =>
                prev.map((h) =>
                  h.id === editGroupTarget.id ? { ...h, title, color } : h,
                ),
              );
            } else {
              updateHeading(workout.id, editGroupTarget.id, title, color);
            }
          }
        }}
        onDelete={() => {
          if (editGroupTarget) {
            const groupToDelete = editGroupTarget;
            setDeleteGroupTarget(groupToDelete);
            setEditGroupTarget(null);
          }
        }}
      />

      {/* Confirmation Modal for Delete Group */}
      <ConfirmDeleteModal
        visible={Boolean(deleteGroupTarget)}
        title={`Delete Group ${deleteGroupTarget?.title || ""}?`}
        message="Are you sure you want to delete this group? All exercises inside this group will be deleted."
        confirmText="Delete Group"
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setDeleteGroupTarget(null)}
      />
    </SafeAreaView>
  );
}
