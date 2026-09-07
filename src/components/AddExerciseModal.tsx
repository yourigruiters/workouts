import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { X, Plus, AlertTriangle, Layers, Settings2 } from 'lucide-react-native';
import { ExerciseItem, SectionHeading } from '../types/workout';

interface AddExerciseModalProps {
  visible: boolean;
  headings: SectionHeading[];
  defaultHeadingId?: string;
  onClose: () => void;
  onAdd: (exercise: Omit<ExerciseItem, 'id'>) => void;
  onOpenAddGroup?: () => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  headings,
  defaultHeadingId,
  onClose,
  onAdd,
  onOpenAddGroup,
}) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [machineDetails, setMachineDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [isRiskExercise, setIsRiskExercise] = useState(false);
  const [headingId, setHeadingId] = useState<string | undefined>(
    defaultHeadingId || (headings.length > 0 ? headings[0].id : undefined)
  );

  useEffect(() => {
    if (defaultHeadingId) {
      setHeadingId(defaultHeadingId);
    } else if (headings.length > 0 && !headingId) {
      setHeadingId(headings[0].id);
    }
  }, [defaultHeadingId, headings]);

  const handleSubmit = () => {
    if (!name.trim() || !headingId) return;

    onAdd({
      name: name.trim(),
      details: details.trim() || undefined,
      machineDetails: machineDetails.trim() || undefined,
      notes: notes.trim() || undefined,
      isRiskExercise,
      headingId,
      sets: [], 
      history: [],
    });

    setName('');
    setDetails('');
    setMachineDetails('');
    setNotes('');
    setIsRiskExercise(false);
    onClose();
  };

  const isAddDisabled = !name.trim() || !headingId || headings.length === 0;

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
            <Text className="text-slate-900 text-lg font-bold">Add Exercise</Text>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-full bg-slate-100">
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {/* Group Selector */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-700 text-xs font-bold uppercase">
                  Select Group *
                </Text>
                {headings.length === 0 && (
                  <Text className="text-rose-600 text-xs font-semibold">
                    No groups created
                  </Text>
                )}
              </View>

              {headings.length === 0 ? (
                <View className="p-4 bg-rose-50 border border-rose-200 rounded-2xl items-center">
                  <Layers size={22} color="#E11D48" />
                  <Text className="text-rose-700 text-xs font-bold mt-1 text-center">
                    A group is required before adding exercises.
                  </Text>
                  {onOpenAddGroup && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onOpenAddGroup();
                      }}
                      className="mt-2.5 bg-rose-600 px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white font-bold text-xs">
                        + Create Group First
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
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
              )}
            </View>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5">
                Exercise Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Incline Dumbbell Press, Cable Row"
                placeholderTextColor="#94A3B8"
                autoFocus
                style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined}
                className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined}
                className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined}
                className="bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm"
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
                style={Platform.OS === 'web' ? ({ outline: 'none' } as any) : undefined}
                className="bg-amber-50 border border-amber-300 focus:border-amber-500 text-amber-900 rounded-xl px-4 py-2.5 font-medium text-sm"
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
                  Flags exercise for extra caution on movement and form.
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

            {/* Actions */}
            <View className="flex-row space-x-3 mb-6">
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
                disabled={isAddDisabled}
                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                  !isAddDisabled ? 'bg-blue-600' : 'bg-blue-200'
                }`}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm ml-1">
                  Add Exercise
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
