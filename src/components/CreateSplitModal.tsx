import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { X, Plus, Dumbbell } from "lucide-react-native";

interface CreateSplitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateSplitModal: React.FC<CreateSplitModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/40 px-6"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="w-full max-w-md">
            <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full shadow-xl">
              {/* Header */}
              <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                <View className="flex-row items-center">
                  <View className="p-2 rounded-xl bg-blue-50 border border-blue-100 mr-2.5">
                    <Dumbbell size={18} color="#2563EB" />
                  </View>
                  <Text className="text-slate-900 text-lg font-bold">
                    Add split
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-1.5 rounded-full bg-slate-100"
                >
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <View className="mt-4 mb-3">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                  Split Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Full Body"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="sentences"
                  autoFocus
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
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl font-semibold"
                  returnKeyType="next"
                />
              </View>

              {/* Description Input (Optional) */}
              <View className="mb-5">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                  Description / Notes (Optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. 4-day hypertrophy routine"
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
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl font-medium"
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                />
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
                  disabled={!name.trim()}
                  className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                    name.trim() ? "bg-blue-600" : "bg-blue-200"
                  }`}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm ml-1">
                    Add split
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
