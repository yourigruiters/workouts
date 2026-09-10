import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react-native';
import { SectionHeading } from '../types/workout';

interface SectionDividerProps {
  heading: SectionHeading;
  exerciseCount: number;
  setCount: number;
  onToggleCollapse: () => void;
  onDelete?: () => void;
}

const COLOR_MAP: Record<
  SectionHeading['color'],
  { bg: string; text: string; border: string; badgeBg: string; badgeText: string }
> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
    border: 'border-cyan-200',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
  },
  zinc: {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-200',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
  },
};

export const SectionDivider: React.FC<SectionDividerProps> = ({
  heading,
  exerciseCount,
  setCount,
  onToggleCollapse,
  onDelete,
}) => {
  const theme = COLOR_MAP[heading.color] || COLOR_MAP.blue;
  const isCollapsed = Boolean(heading.isCollapsed);

  return (
    <View className="mt-6 mb-3">
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onToggleCollapse}
        className={`flex-row items-center justify-between px-4 py-3 rounded-2xl border ${theme.bg} ${theme.border}`}
      >
        <View className="flex-row items-center flex-1 space-x-2">
          {isCollapsed ? (
            <ChevronRight size={18} color="#475569" />
          ) : (
            <ChevronDown size={18} color="#475569" />
          )}
          <Text className={`font-bold text-sm tracking-wide ${theme.text} ml-1`}>
            {heading.title}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <View className={`px-2.5 py-1 rounded-full ${theme.badgeBg}`}>
            <Text className={`text-xs font-bold ${theme.badgeText}`}>
              {exerciseCount} Excs • {setCount} {setCount === 1 ? 'Set' : 'Sets'}
            </Text>
          </View>

          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onDelete();
              }}
              className="p-1 ml-1.5"
            >
              <Trash2 size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
