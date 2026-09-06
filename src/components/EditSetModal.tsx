import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Check, Trash2, Clock, Dumbbell, Flame } from 'lucide-react-native';
import { SetItem, SetType } from '../types/workout';

interface EditSetModalProps {
  visible: boolean;
  set: SetItem | null;
  setLabel: string;
  onClose: () => void;
  onSave: (updated: SetItem) => void;
  onDelete: (setId: string) => void;
}

export const EditSetModal: React.FC<EditSetModalProps> = ({
  visible,
  set,
  setLabel,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<SetType>('active');
  const [repRange, setRepRange] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [restTime, setRestTime] = useState('');

  useEffect(() => {
    if (set) {
      setType(set.type || 'active');
      setRepRange(set.repRange || '');
      setWeightKg(set.weightKg !== undefined ? String(set.weightKg) : '');
      setRestTime(set.restTime || '1:30');
    }
  }, [set]);

  if (!set) return null;

  const handleSave = () => {
    onSave({
      ...set,
      type,
      repRange: repRange.trim() || '8-10',
      weightKg: weightKg.trim() !== '' ? parseFloat(weightKg.trim()) || 0 : undefined,
      restTime: restTime.trim() || '1:30',
    });
    onClose();
  };

  const REST_PRESETS = ['0:45', '1:00', '1:30', '2:00', '3:00'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl bg-blue-50 border border-blue-100 mr-2.5">
                <Dumbbell size={18} color="#2563EB" />
              </View>
              <Text className="text-slate-900 text-lg font-bold">
                Edit {setLabel}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-slate-100">
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            {/* Set Type Selector */}
            <View className="mb-4">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">
                Set Type
              </Text>
              <View className="flex-row bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setType('active')}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    type === 'active' ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs ${
                      type === 'active' ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    Active Set
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setType('warmup')}
                  className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${
                    type === 'warmup' ? 'bg-amber-100 shadow-sm' : 'bg-transparent'
                  }`}
                >
                  <Flame size={13} color={type === 'warmup' ? '#B45309' : '#94A3B8'} />
                  <Text
                    className={`font-bold text-xs ml-1 ${
                      type === 'warmup' ? 'text-amber-800' : 'text-slate-500'
                    }`}
                  >
                    Warmup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reps & Weight Inputs Row */}
            <View className="flex-row space-x-3 mb-4">
              {/* Reps */}
              <View className="flex-1 mr-2">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                  Reps / Range
                </Text>
                <TextInput
                  value={repRange}
                  onChangeText={setRepRange}
                  placeholder="e.g. 8-10, 12"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 font-bold text-sm"
                />
              </View>

              {/* Weight */}
              <View className="flex-1">
                <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                  Weight (kg)
                </Text>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="e.g. 34, 0"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 font-bold text-sm"
                />
              </View>
            </View>

            {/* Rest Timer (Format e.g. 1:30) */}
            <View className="mb-5">
              <View className="flex-row items-center mb-1.5">
                <Clock size={13} color="#64748B" />
                <Text className="text-slate-700 text-xs font-bold uppercase ml-1">
                  Rest Time
                </Text>
              </View>
              <TextInput
                value={restTime}
                onChangeText={setRestTime}
                placeholder="1:30"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 font-bold text-sm mb-2"
              />

              {/* Quick Rest Presets */}
              <View className="flex-row space-x-2">
                {REST_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setRestTime(p)}
                    className={`px-2.5 py-1 rounded-lg border mr-1.5 ${
                      restTime === p
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        restTime === p ? 'text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
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
                className="flex-1 bg-blue-600 py-3.5 rounded-xl flex-row items-center justify-center shadow-sm"
              >
                <Check size={16} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm ml-1.5">
                  Save Set
                </Text>
              </TouchableOpacity>
            </View>

            {/* Delete Set Action */}
            <View className="pt-3 border-t border-slate-100">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onDelete(set.id);
                  onClose();
                }}
                className="py-2.5 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center justify-center"
              >
                <Trash2 size={15} color="#E11D48" />
                <Text className="text-rose-600 font-bold text-xs ml-1.5">
                  Delete set
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
