import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  X,
  AlertTriangle,
  Trash2,
  Check,
  Settings2,
  Plus,
  Flame,
  Dumbbell,
  Clock,
} from "lucide-react-native";
import {
  ExerciseItem,
  SectionHeading,
  SetItem,
  SetType,
} from "../types/workout";

interface EditExerciseModalProps {
  visible: boolean;
  exercise: ExerciseItem | null;
  headings: SectionHeading[];
  onClose: () => void;
  onSave: (updated: ExerciseItem) => void;
  onDelete: (exerciseId: string) => void;
}

export const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  visible,
  exercise,
  headings,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [machineDetails, setMachineDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [isRiskExercise, setIsRiskExercise] = useState(false);
  const [headingId, setHeadingId] = useState<string | undefined>(undefined);
  const [sets, setSets] = useState<SetItem[]>([]);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name || "");
      setDetails(exercise.details || "");
      setMachineDetails(exercise.machineDetails || "");
      setNotes(exercise.notes || "");
      setIsRiskExercise(Boolean(exercise.isRiskExercise));
      setHeadingId(
        exercise.headingId ||
          (headings.length > 0 ? headings[0].id : undefined),
      );
      setSets(exercise.sets || []);
    }
  }, [exercise, headings]);

  if (!exercise) return null;

  const handleAddActiveSet = () => {
    const newSet: SetItem = {
      id: "s-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      type: "active",
      repRange: "8-10",
      weightKg: 20,
      restTime: "1:30",
    };
    setSets((prev) => [...prev, newSet]);
  };

  const handleAddWarmupSet = () => {
    const newSet: SetItem = {
      id: "s-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      type: "warmup",
      repRange: "12-15",
      weightKg: 10,
      restTime: "1:00",
    };
    const warmups = sets.filter((s) => s.type === "warmup");
    const actives = sets.filter((s) => s.type !== "warmup");
    setSets([...warmups, newSet, ...actives]);
  };

  const handleToggleSetType = (setId: string) => {
    setSets((prev) => {
      const updated = prev.map((s) =>
        s.id === setId
          ? {
              ...s,
              type: (s.type === "warmup" ? "active" : "warmup") as SetType,
            }
          : s,
      );
      const warmups = updated.filter((s) => s.type === "warmup");
      const actives = updated.filter((s) => s.type !== "warmup");
      return [...warmups, ...actives];
    });
  };

  const handleUpdateSetField = (
    setId: string,
    field: keyof SetItem,
    value: any,
  ) => {
    setSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
    );
  };

  const handleDeleteSet = (setId: string) => {
    setSets((prev) => prev.filter((s) => s.id !== setId));
  };

  const handleSave = () => {
    if (!name.trim() || !headingId) return;
    onSave({
      ...exercise,
      name: name.trim() || exercise.name,
      details: details.trim() || undefined,
      machineDetails: machineDetails.trim() || undefined,
      notes: notes.trim() || undefined,
      isRiskExercise,
      headingId,
      sets,
    });
    onClose();
  };

  const isSaveDisabled = !name.trim() || !headingId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
            <Text className="text-slate-900 text-lg font-bold">
              Edit Exercise
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Group Selection */}
            {headings.length > 0 && (
              <View className="mb-4">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-2">
                  Group *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {headings.map((h) => {
                    const isSelected = headingId === h.id;
                    return (
                      <TouchableOpacity
                        key={h.id}
                        onPress={() => setHeadingId(h.id)}
                        className={`mr-2.5 px-4 py-2 rounded-xl border ${
                          isSelected
                            ? "bg-blue-50 border-blue-600"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? "text-blue-700" : "text-slate-600"
                          }`}
                        >
                          {h.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Name */}
            <View className="mb-4">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                Exercise Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Incline Dumbbell Press"
                placeholderTextColor="#94A3B8"
                autoCapitalize="sentences"
                style={[
                  {
                    height: 48,
                    fontSize: 15,
                    paddingVertical: 0,
                    paddingHorizontal: 16,
                    textAlignVertical: "center",
                    includeFontPadding: false,
                  },
                  Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                ]}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-semibold"
              />
            </View>

            {/* Machine Details (Separate, first) */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <Settings2 size={13} color="#475569" />
                <Text className="text-slate-700 text-xs font-bold uppercase ml-1">
                  Machine Details (Optional)
                </Text>
              </View>
              <TextInput
                value={machineDetails}
                onChangeText={setMachineDetails}
                placeholder="e.g. Small bench, stack 3"
                placeholderTextColor="#94A3B8"
                autoCapitalize="sentences"
                style={[
                  {
                    height: 48,
                    fontSize: 15,
                    paddingVertical: 0,
                    paddingHorizontal: 16,
                    textAlignVertical: "center",
                    includeFontPadding: false,
                  },
                  Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                ]}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-semibold"
              />
            </View>

            {/* Extra Details (Separate, second) */}
            <View className="mb-4">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                Extra Details (Optional)
              </Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="e.g. Rope attachment"
                placeholderTextColor="#94A3B8"
                autoCapitalize="sentences"
                style={[
                  {
                    height: 48,
                    fontSize: 15,
                    paddingVertical: 0,
                    paddingHorizontal: 16,
                    textAlignVertical: "center",
                    includeFontPadding: false,
                  },
                  Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                ]}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-semibold"
              />
            </View>

            {/* Focus Notes */}
            <View className="mb-4">
              <View className="flex-row items-center mb-1.5">
                <AlertTriangle size={13} color="#D97706" />
                <Text className="text-amber-800 text-xs font-bold uppercase ml-1">
                  Focus notes
                </Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                placeholder="Important cue or form reminder..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="sentences"
                style={[
                  {
                    minHeight: 56,
                    fontSize: 14,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    textAlignVertical: "top",
                    includeFontPadding: false,
                  },
                  Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                ]}
                className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl font-medium"
              />
            </View>

            {/* Risk Exercise Switch (Red card styling with Blue toggle) */}
            <View className="flex-row items-center justify-between bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-5">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center">
                  <AlertTriangle size={15} color="#E11D48" />
                  <Text className="text-rose-900 text-sm font-bold ml-1.5">
                    Risk Exercise / Injury Focus
                  </Text>
                </View>
                <Text className="text-rose-700 text-xs mt-0.5 font-medium">
                  Flags exercise for extra care on movement and technique.
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsRiskExercise(!isRiskExercise)}
                className={`w-12 h-7 rounded-full p-0.5 flex-row items-center ${
                  isRiskExercise
                    ? "bg-blue-600 justify-end"
                    : "bg-slate-300 justify-start"
                }`}
              >
                <View className="w-6 h-6 rounded-full bg-white border border-slate-200" />
              </TouchableOpacity>
            </View>

            {/* Sets Management Section */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center">
                  <Dumbbell size={14} color="#334155" />
                  <Text className="text-slate-700 text-xs font-bold uppercase ml-1.5">
                    Sets ({sets.length})
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleAddActiveSet}
                    className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex-row items-center mr-1.5"
                  >
                    <Plus size={13} color="#2563EB" />
                    <Text className="text-blue-700 font-bold text-xs ml-1">
                      Add Set
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleAddWarmupSet}
                    className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex-row items-center"
                  >
                    <Flame size={13} color="#D97706" />
                    <Text className="text-amber-800 font-bold text-xs ml-1">
                      + Warmup
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {sets.length === 0 ? (
                <View className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl items-center">
                  <Text className="text-slate-400 text-xs font-medium text-center">
                    No sets yet. Tap "Add Set" or "+ Warmup" above to add sets.
                  </Text>
                </View>
              ) : (
                <View className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-1.5">
                  <View className="flex-row items-center px-1 pb-1">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase w-24">
                      TYPE
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase flex-1 text-center">
                      REPS
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase flex-1 text-center">
                      KG
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase w-16 text-center">
                      REST
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase w-8" />
                  </View>

                  {(() => {
                    let warmupCount = 0;
                    let activeCount = 0;

                    return sets.map((s) => {
                      const isWarmup = s.type === "warmup";
                      if (isWarmup) warmupCount++;
                      else activeCount++;

                      const label = isWarmup
                        ? `Warmup ${warmupCount}`
                        : `Set ${activeCount}`;

                      return (
                        <View
                          key={s.id}
                          className="flex-row items-center bg-white border border-slate-200 rounded-xl p-2 my-0.5"
                        >
                          {/* Type toggle pill */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleToggleSetType(s.id)}
                            className={`w-24 px-2 py-1.5 rounded-lg flex-row items-center justify-center border ${
                              isWarmup
                                ? "bg-amber-100/80 border-amber-300"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            {isWarmup ? (
                              <Flame size={11} color="#B45309" />
                            ) : (
                              <Dumbbell size={11} color="#2563EB" />
                            )}
                            <Text
                              className={`text-[11px] font-bold ml-1 ${
                                isWarmup ? "text-amber-900" : "text-blue-700"
                              }`}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>

                          {/* Reps input */}
                          <View className="flex-1 mx-1">
                            <TextInput
                              value={s.repRange || ""}
                              onChangeText={(txt) =>
                                handleUpdateSetField(s.id, "repRange", txt)
                              }
                              placeholder="8-10"
                              placeholderTextColor="#94A3B8"
                              autoCapitalize="sentences"
                              style={[
                                {
                                  height: 38,
                                  fontSize: 13,
                                  paddingVertical: 0,
                                  paddingHorizontal: 6,
                                  textAlignVertical: "center",
                                  includeFontPadding: false,
                                },
                                Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                              ]}
                              className="bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-center"
                            />
                          </View>

                          {/* Weight input */}
                          <View className="flex-1 mx-1">
                            <TextInput
                              value={
                                s.weightKg !== undefined
                                  ? String(s.weightKg)
                                  : ""
                              }
                              onChangeText={(txt) =>
                                handleUpdateSetField(
                                  s.id,
                                  "weightKg",
                                  txt !== "" ? parseFloat(txt) || 0 : undefined,
                                )
                              }
                              placeholder="kg"
                              placeholderTextColor="#94A3B8"
                              keyboardType="numeric"
                              style={[
                                {
                                  height: 38,
                                  fontSize: 13,
                                  paddingVertical: 0,
                                  paddingHorizontal: 6,
                                  textAlignVertical: "center",
                                  includeFontPadding: false,
                                },
                                Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                              ]}
                              className="bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-center"
                            />
                          </View>

                          {/* Rest input */}
                          <View className="w-16 mx-1">
                            <TextInput
                              value={s.restTime || ""}
                              onChangeText={(txt) =>
                                handleUpdateSetField(s.id, "restTime", txt)
                              }
                              placeholder="1:30"
                              placeholderTextColor="#94A3B8"
                              style={[
                                {
                                  height: 38,
                                  fontSize: 13,
                                  paddingVertical: 0,
                                  paddingHorizontal: 6,
                                  textAlignVertical: "center",
                                  includeFontPadding: false,
                                },
                                Platform.OS === "web" ? ({ outline: "none" } as any) : undefined,
                              ]}
                              className="bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 text-center"
                            />
                          </View>

                          {/* Delete Set */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleDeleteSet(s.id)}
                            className="w-8 items-center justify-center p-1.5 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 size={14} color="#E11D48" />
                          </TouchableOpacity>
                        </View>
                      );
                    });
                  })()}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-2 mb-6">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onDelete(exercise.id);
                  onClose();
                }}
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl items-center justify-center mr-2"
              >
                <Trash2 size={18} color="#E11D48" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={isSaveDisabled}
                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                  !isSaveDisabled ? "bg-blue-600" : "bg-blue-200"
                }`}
              >
                <Check size={18} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm ml-1.5">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
