export type SetType = 'warmup' | 'active';

export interface SetItem {
  id: string;
  type: SetType;
  repRange: string; // e.g. "8-10", "12", "5"
  weightKg?: number; // e.g. 80, 22.5
  restTime?: string; // e.g. "1:30", "2:00", "0:45"
  completed?: boolean;
}

export interface ExerciseHistoryEntry {
  date: string; // e.g. "2026-08-28"
  bestSet: string; // e.g. "100kg x 8 reps"
  totalVolumeKg: number;
  notes?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  headingId?: string; // Links to SectionHeading id (Group)
  details?: string; // e.g., "Right side first" or "Use rope attachment"
  notes?: string; // Focus notes (looping marquee)
  isRiskExercise?: boolean; // Injury caution / focus extra on strict movement
  machineDetails?: string; // e.g., "Pin #7, Seat #3, Cable stack 2"
  sets: SetItem[];
  history?: ExerciseHistoryEntry[];
}

export interface SectionHeading {
  id: string;
  title: string; // e.g., "Chest", "Triceps", "Finisher"
  color: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'zinc';
  isCollapsed?: boolean;
}

export interface Workout {
  id: string;
  splitId: string;
  name: string; // e.g. "Monday - Push"
  focus: string; // e.g. "Chest / Triceps"
  headings: SectionHeading[];
  exercises: ExerciseItem[];
  createdAt: number;
}

export interface TrainingSplit {
  id: string;
  name: string; // e.g. "Push Pull Legs", "Upper / Lower"
  description?: string;
  createdAt: number;
}
