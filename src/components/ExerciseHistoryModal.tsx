import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, TrendingUp, Calendar, Trophy, BarChart3 } from 'lucide-react-native';
import { ExerciseItem } from '../types/workout';

interface ExerciseHistoryModalProps {
  visible: boolean;
  exercise: ExerciseItem | null;
  onClose: () => void;
}

export const ExerciseHistoryModal: React.FC<ExerciseHistoryModalProps> = ({
  visible,
  exercise,
  onClose,
}) => {
  if (!exercise) return null;

  const history = exercise.history || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[85%]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
            <View className="flex-1 pr-3">
              <Text className="text-slate-900 text-xl font-bold">
                {exercise.name}
              </Text>
              <Text className="text-blue-600 text-xs font-bold mt-0.5">
                Progress & Performance History
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full bg-slate-100"
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {/* Quick Stats Summary */}
            <View className="flex-row space-x-3 mb-5">
              <View className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl mr-2">
                <View className="flex-row items-center">
                  <Trophy size={14} color="#D97706" />
                  <Text className="text-slate-500 text-[11px] font-bold ml-1.5 uppercase">
                    Personal Best
                  </Text>
                </View>
                <Text className="text-slate-900 font-bold text-base mt-1">
                  {history[0]?.bestSet || '34kg x 8'}
                </Text>
              </View>

              <View className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <View className="flex-row items-center">
                  <TrendingUp size={14} color="#16A34A" />
                  <Text className="text-slate-500 text-[11px] font-bold ml-1.5 uppercase">
                    Total Logs
                  </Text>
                </View>
                <Text className="text-slate-900 font-bold text-base mt-1">
                  {history.length || 3} Sessions
                </Text>
              </View>
            </View>

            {/* History Entries */}
            <Text className="text-slate-800 font-bold text-sm mb-3">
              Past Workout Logs
            </Text>

            {history.length === 0 ? (
              <View className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl items-center my-2">
                <BarChart3 size={32} color="#94A3B8" />
                <Text className="text-slate-500 text-xs mt-2 text-center font-medium">
                  No historical entries yet.
                </Text>
              </View>
            ) : (
              history.map((entry, idx) => (
                <View
                  key={`hist-${idx}`}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl mb-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Calendar size={13} color="#64748B" />
                      <Text className="text-slate-700 text-xs font-bold ml-1.5">
                        {entry.date}
                      </Text>
                    </View>
                    <View className="bg-blue-100 px-2 py-0.5 rounded-md">
                      <Text className="text-blue-800 text-[11px] font-bold">
                        {entry.bestSet}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-200">
                    <Text className="text-slate-500 text-xs font-medium">
                      Total Volume:
                    </Text>
                    <Text className="text-slate-900 font-bold text-xs">
                      {entry.totalVolumeKg} kg
                    </Text>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="bg-slate-100 py-3.5 rounded-xl items-center mt-4 mb-6"
            >
              <Text className="text-slate-700 font-bold text-sm">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
