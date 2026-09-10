import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronRight, Edit3 } from 'lucide-react-native';
import { SectionHeading } from '../types/workout';

interface GroupSectionProps {
  heading: SectionHeading;
  exerciseCount: number;
  setCount: number;
  onToggleCollapse: () => void;
  onEditGroup?: () => void;
  children?: React.ReactNode;
}

export const GROUP_COLOR_MAP: Record<
  SectionHeading['color'],
  {
    containerBg: string;
    containerBorder: string;
    headerBg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  blue: {
    containerBg: 'bg-blue-50/60',
    containerBorder: 'border-blue-200',
    headerBg: 'bg-blue-100/70',
    text: 'text-blue-900',
    badgeBg: 'bg-blue-200/80',
    badgeText: 'text-blue-950',
  },
  purple: {
    containerBg: 'bg-purple-50/60',
    containerBorder: 'border-purple-200',
    headerBg: 'bg-purple-100/70',
    text: 'text-purple-900',
    badgeBg: 'bg-purple-200/80',
    badgeText: 'text-purple-950',
  },
  emerald: {
    containerBg: 'bg-emerald-50/60',
    containerBorder: 'border-emerald-200',
    headerBg: 'bg-emerald-100/70',
    text: 'text-emerald-900',
    badgeBg: 'bg-emerald-200/80',
    badgeText: 'text-emerald-950',
  },
  amber: {
    containerBg: 'bg-amber-50/60',
    containerBorder: 'border-amber-200',
    headerBg: 'bg-amber-100/70',
    text: 'text-amber-900',
    badgeBg: 'bg-amber-200/80',
    badgeText: 'text-amber-950',
  },
  rose: {
    containerBg: 'bg-rose-50/60',
    containerBorder: 'border-rose-200',
    headerBg: 'bg-rose-100/70',
    text: 'text-rose-900',
    badgeBg: 'bg-rose-200/80',
    badgeText: 'text-rose-950',
  },
  cyan: {
    containerBg: 'bg-cyan-50/60',
    containerBorder: 'border-cyan-200',
    headerBg: 'bg-cyan-100/70',
    text: 'text-cyan-900',
    badgeBg: 'bg-cyan-200/80',
    badgeText: 'text-cyan-950',
  },
  indigo: {
    containerBg: 'bg-indigo-50/60',
    containerBorder: 'border-indigo-200',
    headerBg: 'bg-indigo-100/70',
    text: 'text-indigo-900',
    badgeBg: 'bg-indigo-200/80',
    badgeText: 'text-indigo-950',
  },
  zinc: {
    containerBg: 'bg-slate-100/70',
    containerBorder: 'border-slate-300',
    headerBg: 'bg-slate-200/80',
    text: 'text-slate-900',
    badgeBg: 'bg-slate-300/80',
    badgeText: 'text-slate-950',
  },
};

export const GroupSection: React.FC<GroupSectionProps> = ({
  heading,
  exerciseCount,
  setCount,
  onToggleCollapse,
  onEditGroup,
  children,
}) => {
  const theme = GROUP_COLOR_MAP[heading.color] || GROUP_COLOR_MAP.blue;
  const isCollapsed = Boolean(heading.isCollapsed);

  return (
    <View
      className={`mt-5 rounded-3xl border ${theme.containerBorder} ${
        isCollapsed ? theme.headerBg : theme.containerBg
      } overflow-hidden`}
    >
      {/* Group Header Bar */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onToggleCollapse}
        className={`flex-row items-center justify-between px-4 py-3.5 ${
          !isCollapsed ? theme.headerBg : ''
        }`}
      >
        <View className="flex-row items-center flex-1 space-x-2">
          {isCollapsed ? (
            <ChevronRight size={18} color="#475569" />
          ) : (
            <ChevronDown size={18} color="#475569" />
          )}
          <Text className={`font-black text-base tracking-wide ${theme.text} ml-1`}>
            {heading.title}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <View className={`px-2.5 py-1 rounded-full ${theme.badgeBg}`}>
            <Text className={`text-xs font-bold ${theme.badgeText}`}>
              {exerciseCount} Excs • {setCount} {setCount === 1 ? 'Set' : 'Sets'}
            </Text>
          </View>

          {/* Change / Edit Group Icon */}
          {onEditGroup && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onEditGroup();
              }}
              className="p-1.5 ml-1 rounded-lg bg-white/60"
            >
              <Edit3 size={15} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Nested Exercise Cards Container */}
      {!isCollapsed && (
        <View className="p-3">
          {exerciseCount === 0 ? (
            <View className="p-4 bg-white/80 border border-dashed border-slate-300 rounded-2xl items-center">
              <Text className="text-slate-500 text-xs font-medium">
                No exercises in {heading.title}. Tap "Add Exercise" to add one here.
              </Text>
            </View>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};
