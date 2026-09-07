import React, { useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity } from "react-native";
import { X, Plus, Layers, Check } from "lucide-react-native";
import { SectionHeading } from "../types/workout";

interface AddHeadingModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, color: SectionHeading["color"]) => void;
}

// 6 Clean colors fitting on a single horizontal row
const AVAILABLE_COLORS: {
  id: SectionHeading["color"];
  name: string;
  bgClass: string;
}[] = [
  { id: "blue", name: "Blue", bgClass: "bg-blue-500" },
  { id: "emerald", name: "Emerald", bgClass: "bg-emerald-500" },
  { id: "amber", name: "Amber", bgClass: "bg-amber-500" },
  { id: "rose", name: "Rose", bgClass: "bg-rose-500" },
  { id: "cyan", name: "Cyan", bgClass: "bg-cyan-500" },
  { id: "zinc", name: "Slate", bgClass: "bg-slate-500" },
];

export const AddHeadingModal: React.FC<AddHeadingModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<SectionHeading["color"]>("blue");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), selectedColor);
    setTitle("");
    setSelectedColor("blue");
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
                <Layers size={18} color="#2563EB" />
              </View>
              <Text className="text-slate-900 text-lg font-bold">
                New Group
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View className="mt-4 mb-3.5">
            <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
              Group Name *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Chest Compounds or Triceps"
              placeholderTextColor="#94A3B8"
              autoFocus
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
            />
          </View>

          {/* Color Selector (1 single row) */}
          <View className="mb-5">
            <Text className="text-slate-700 text-xs font-bold uppercase mb-2.5">
              Group Color Badge
            </Text>
            <View className="flex-row justify-between items-center">
              {AVAILABLE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedColor(c.id)}
                  className={`w-9 h-9 rounded-xl items-center justify-center ${c.bgClass} ${
                    selectedColor === c.id
                      ? "border-2 border-white ring-2 ring-blue-600"
                      : "opacity-85"
                  }`}
                >
                  {selectedColor === c.id && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center mr-2"
            >
              <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={!title.trim()}
              className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                title.trim() ? "bg-blue-600" : "bg-blue-200"
              }`}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-1">
                Add group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
