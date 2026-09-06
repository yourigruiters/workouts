import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { X, AlertTriangle, Trash2, Check, Settings2 } from 'lucide-react-native';
import { ExerciseItem, SectionHeading } from '../types/workout';

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
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [machineDetails, setMachineDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [isRiskExercise, setIsRiskExercise] = useState(false);
  const [headingId, setHeadingId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name || '');
      setDetails(exercise.details || '');
      setMachineDetails(exercise.machineDetails || '');
      setNotes(exercise.notes || '');
      setIsRiskExercise(Boolean(exercise.isRiskExercise));
      setHeadingId(
        exercise.headingId || (headings.length > 0 ? headings[0].id : undefined)
      );
    }
  }, [exercise, headings]);

  if (!exercise) return null;

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
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[90%] shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
            <Text className="text-slate-900 text-lg font-bold">Edit Exercise</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
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
                            ? 'bg-blue-50 border-blue-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-blue-700' : 'text-slate-600'
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
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                placeholder="e.g. Pin #7, Seat #3, Cable stack 2"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                placeholder="e.g. Right side or Use rope attachment"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-4 py-2.5 font-medium text-sm"
              />
            </View>

            {/* Risk Exercise Switch (Red card styling with Blue toggle) */}
            <View className="flex-row items-center justify-between bg-rose-50 border border-rose-200 p-3.5 rounded-2xl mb-6">
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
                  isRiskExercise ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <View className="w-6 h-6 rounded-full bg-white shadow-sm" />
              </TouchableOpacity>
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
                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center shadow-sm ${
                  !isSaveDisabled ? 'bg-blue-600' : 'bg-blue-200'
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
      </View>
    </Modal>
  );
};
