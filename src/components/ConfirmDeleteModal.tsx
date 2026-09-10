import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle, Trash2, X } from 'lucide-react-native';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md">
          {/* Header Icon */}
          <View className="flex-row items-center justify-between pb-3">
            <View className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center">
              <AlertTriangle size={24} color="#E11D48" />
            </View>
            <TouchableOpacity
              onPress={onCancel}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Title & Message */}
          <Text className="text-slate-900 text-lg font-black mt-2">
            {title}
          </Text>
          <Text className="text-slate-500 text-xs font-medium mt-1 mb-6 leading-relaxed">
            {message}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center mr-2"
            >
              <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              className="flex-1 bg-rose-600 py-3.5 rounded-xl flex-row items-center justify-center"
            >
              <Trash2 size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-1.5">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
