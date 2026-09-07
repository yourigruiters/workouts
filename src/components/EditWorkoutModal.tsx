import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { X, Check, Calendar, Trash2 } from "lucide-react-native";
import { Workout } from "../types/workout";

interface EditWorkoutModalProps {
  visible: boolean;
  workout: Workout | null;
  onClose: () => void;
  onSave: (name: string, focus?: string) => void;
  onDelete: () => void;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({
  visible,
  workout,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");

  useEffect(() => {
    if (workout) {
      setName(workout.name || "");
      setFocus(workout.focus || "");
    }
  }, [workout]);

  if (!workout) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), focus.trim() || undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl bg-blue-50 border border-blue-100 mr-2.5">
                <Calendar size={18} color="#2563EB" />
              </View>
              <Text className="text-slate-900 text-lg font-bold">
                Edit Workout
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Workout Name Input */}
          <View className="mt-4 mb-3.5">
            <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
              Workout Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Monday or Push day"
              placeholderTextColor="#94A3B8"
              style={
                Platform.OS === "web" ? ({ outline: "none" } as any) : undefined
              }
              className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
            />
          </View>

          {/* Focus / Description Input (Optional) */}
          <View className="mb-5">
            <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
              Focus Muscle Groups / Description (Optional)
            </Text>
            <TextInput
              value={focus}
              onChangeText={setFocus}
              placeholder="e.g. Chest & Triceps"
              placeholderTextColor="#94A3B8"
              style={
                Platform.OS === "web" ? ({ outline: "none" } as any) : undefined
              }
              className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 font-medium text-sm"
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />
          </View>

          {/* Actions */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center mr-2"
            >
              <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={!name.trim()}
              className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                name.trim() ? "bg-blue-600" : "bg-blue-200"
              }`}
            >
              <Check size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-1">
                Save Workout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete Workout in overlay */}
          <View className="pt-3 border-t border-slate-100">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onDelete();
              }}
              className="py-2.5 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center justify-center"
            >
              <Trash2 size={15} color="#E11D48" />
              <Text className="text-rose-600 font-bold text-xs ml-1.5">
                Delete workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
