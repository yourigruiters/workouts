import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Edit3,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from 'lucide-react-native';
import { ExerciseItem, SetItem } from '../types/workout';
import { MarqueeText } from './MarqueeText';

interface ExerciseCardProps {
  exercise: ExerciseItem;
  onOpenEdit: () => void;
  onAddSet: (type?: 'warmup' | 'active') => void;
  onOpenEditSet: (set: SetItem, label: string) => void;
  dragHandleProps?: any;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onOpenEdit,
  onAddSet,
  onOpenEditSet,
  dragHandleProps,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalSets = exercise.sets?.length || 0;

  return (
    <View className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-3.5 shadow-sm">
      {/* Exercise Header Row: Left side toggles open/close, right side has actions */}
      <View className="flex-row items-start justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-start flex-1 pr-2"
        >
          <View className="mt-1 mr-2">
            {isExpanded ? (
              <ChevronDown size={18} color="#475569" />
            ) : (
              <ChevronRight size={18} color="#475569" />
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-slate-900 text-base font-bold tracking-tight mr-2">
                {exercise.name}
              </Text>

              {/* Set Count Pill when collapsed */}
              {!isExpanded && (
                <View className="bg-slate-100 px-2 py-0.5 rounded-full my-0.5">
                  <Text className="text-slate-600 text-[11px] font-bold">
                    {totalSets} {totalSets === 1 ? 'set' : 'sets'}
                  </Text>
                </View>
              )}
            </View>

            {/* Machine Details (Shown together with the title, always visible) */}
            {Boolean(exercise.machineDetails) && (
              <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                {exercise.machineDetails}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Top Right Action (Edit & Reorder Handle) */}
        <View className="flex-row items-center ml-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation?.();
              onOpenEdit();
            }}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 mr-1.5 hover:bg-slate-200"
          >
            <Edit3 size={15} color="#475569" />
          </TouchableOpacity>

          <View
            {...(dragHandleProps || {})}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-blue-50 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={15} color="#475569" />
          </View>
        </View>
      </View>

      {/* Elements hidden when not toggled (only shown when expanded) */}
      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          {/* Extra Details (Clean text without whole card styling) */}
          {Boolean(exercise.details) && (
            <View className="mb-3">
              <Text className="text-slate-600 text-xs font-medium leading-relaxed">
                {exercise.details}
              </Text>
            </View>
          )}

          {/* Looping Focus Notes Banner (Visible only when open) */}
          {Boolean(exercise.notes) && (
            <View className="mb-3">
              <MarqueeText text={exercise.notes!} />
            </View>
          )}

          {/* Risk Exercise Badge (Visible only when open) */}
          {exercise.isRiskExercise && (
            <View className="mb-3 flex-row items-center bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              <AlertTriangle size={14} color="#E11D48" />
              <Text className="text-rose-700 text-xs font-bold ml-2">
                Risk Exercise • Focus on movement / Injury caution
              </Text>
            </View>
          )}

          {/* Sets List Table (SET, REPS, WEIGHT, REST, EDIT) */}
          <View className="mt-1">
            <View className="flex-row items-center justify-between pb-2 px-1">
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider w-24">
                SET
              </Text>
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex-1 text-right pr-3">
                REPS
              </Text>
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex-1 text-right pr-3">
                WEIGHT
              </Text>
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider w-14 text-right pr-2">
                REST
              </Text>
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider w-8 text-right" />
            </View>

            {exercise.sets.length === 0 ? (
              <View className="py-3 px-1 items-center">
                <Text className="text-slate-400 text-xs font-medium">
                  No sets added yet. Tap below to add a set.
                </Text>
              </View>
            ) : (
              (() => {
                const warmups = (exercise.sets || []).filter((s) => s.type === 'warmup');
                const actives = (exercise.sets || []).filter((s) => s.type !== 'warmup');
                const orderedSets = [...warmups, ...actives];

                return orderedSets.map((set, index) => {
                  const isWarmup = set.type === 'warmup';
                  const label = isWarmup
                    ? `Warmup ${index + 1}`
                    : `Set ${index - warmups.length + 1}`;

                  return (
                    <View
                      key={set.id || `set-${index}`}
                      className="flex-row items-center justify-between py-2.5 px-1 border-b border-slate-100"
                    >
                      {/* Set Type / Number Badge */}
                      <View className="w-24 flex-row items-center">
                        <View
                          className={`px-2 py-0.5 rounded-md ${
                            isWarmup
                              ? 'bg-amber-100 border border-amber-300'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-bold ${
                              isWarmup ? 'text-amber-800' : 'text-blue-700'
                            }`}
                          >
                            {label}
                          </Text>
                        </View>
                      </View>

                    {/* Rep Range (Right Aligned) */}
                    <View className="flex-1 items-end pr-3">
                      <Text className="text-slate-700 font-bold text-xs">
                        {set.repRange || '—'}
                      </Text>
                    </View>

                    {/* Weight (Smaller kg, Right Aligned) */}
                    <View className="flex-1 items-end pr-3">
                      <Text className="text-slate-900 font-bold text-xs">
                        {set.weightKg !== undefined ? (
                          <>
                            {set.weightKg}{' '}
                            <Text className="text-[10px] font-normal text-slate-400">
                              kg
                            </Text>
                          </>
                        ) : (
                          <Text className="text-[11px] font-medium text-slate-500">
                            BW
                          </Text>
                        )}
                      </Text>
                    </View>

                    {/* Rest Time (Right Aligned) */}
                    <View className="w-14 items-end pr-2">
                      <Text className="text-slate-500 font-medium text-xs">
                        {set.restTime || '1:30'}
                      </Text>
                    </View>

                    {/* Change / Edit Set Icon */}
                    <View className="w-8 items-end">
                      <TouchableOpacity
                        onPress={() => onOpenEditSet(set, label)}
                        className="p-1 rounded-lg bg-slate-100"
                      >
                        <Edit3 size={13} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              });
            })()
          )}

            {/* Add Set / Add Warmup Action Row */}
            <View className="flex-row space-x-2 mt-3">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onAddSet('active')}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 mr-2"
              >
                <Plus size={14} color="#2563EB" />
                <Text className="text-blue-700 font-bold text-xs ml-1">
                  Add Set
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onAddSet('warmup')}
                className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-amber-50/70 border border-amber-200"
              >
                <Text className="text-amber-800 font-bold text-xs">
                  + Warmup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
