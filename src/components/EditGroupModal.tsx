import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { X, Check, Layers, Trash2 } from 'lucide-react-native';
import { SectionHeading } from '../types/workout';

interface EditGroupModalProps {
  visible: boolean;
  heading: SectionHeading | null;
  onClose: () => void;
  onSave: (title: string, color: SectionHeading['color']) => void;
  onDelete: () => void;
}

// 6 Clean colors fitting on a single horizontal row
const AVAILABLE_COLORS: { id: SectionHeading['color']; name: string; bgClass: string }[] = [
  { id: 'blue', name: 'Blue', bgClass: 'bg-blue-500' },
  { id: 'emerald', name: 'Emerald', bgClass: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', bgClass: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', bgClass: 'bg-rose-500' },
  { id: 'cyan', name: 'Cyan', bgClass: 'bg-cyan-500' },
  { id: 'zinc', name: 'Slate', bgClass: 'bg-slate-500' },
];

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  visible,
  heading,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<SectionHeading['color']>('blue');

  useEffect(() => {
    if (heading) {
      setTitle(heading.title);
      setSelectedColor(heading.color === 'indigo' ? 'blue' : heading.color);
    }
  }, [heading]);

  if (!heading) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), selectedColor);
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
                Edit Group
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-slate-100">
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
              placeholder="e.g. Chest Compounds, Triceps"
              placeholderTextColor="#94A3B8"
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
                      ? 'border-2 border-white ring-2 ring-blue-600'
                      : 'opacity-85'
                  }`}
                >
                  {selectedColor === c.id && <Check size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>
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
              disabled={!title.trim()}
              className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                title.trim() ? 'bg-blue-600' : 'bg-blue-200'
              }`}
            >
              <Check size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-1">
                Save Group
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete Group in overlay */}
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
                Delete group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
