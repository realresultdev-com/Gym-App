import { create } from 'zustand';
import { ApiClient } from '../services/api';

export interface ExerciseSet {
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: boolean;
}

interface WorkoutState {
  isWorkoutActive: boolean;
  sessionId: string | null;
  activeExercise: {
    id: string;
    name: string;
    target_muscle: string;
    sets: number;
    target_reps: number;
    tips: string[];
  };
  timerSeconds: number;
  isTimerRunning: boolean;
  loggedSets: ExerciseSet[];

  startSession: () => Promise<void>;
  toggleTimer: () => void;
  incrementTimer: () => void;
  logSet: (setNumber: number, reps: number, weightKg: number) => Promise<void>;
  finishSession: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isWorkoutActive: true, // Active workout matching image 2
  sessionId: 'sess-active-001',
  activeExercise: {
    id: 'ex-001',
    name: '1 Pull-Ups',
    target_muscle: 'Latissimus Dorsi & Biceps',
    sets: 4,
    target_reps: 10,
    tips: [
      'Grip the bar: Hold the pull-up bar with an overhand grip, shoulder-width apart.',
      'Hang with control: Start off the ground with your arms fully extended.',
      'Drive elbows down: Pull your chest toward the bar by engaging your lats.',
    ],
  },
  timerSeconds: 17405, // 04:50:05 formatted
  isTimerRunning: true,
  loggedSets: [
    { set_number: 1, reps: 10, weight_kg: 0, completed: true },
    { set_number: 2, reps: 10, weight_kg: 0, completed: true },
    { set_number: 3, reps: 8, weight_kg: 0, completed: false },
    { set_number: 4, reps: 8, weight_kg: 0, completed: false },
  ],

  startSession: async () => {
    const res = await ApiClient.post('/api/workouts/sessions/start', {
      notes: 'Upper Body Workout',
    });
    set({
      isWorkoutActive: true,
      sessionId: res.data?.session_id || 'sess-local-1',
      timerSeconds: 0,
      isTimerRunning: true,
    });
  },

  toggleTimer: () => {
    set((state) => ({ isTimerRunning: !state.isTimerRunning }));
  },

  incrementTimer: () => {
    if (get().isTimerRunning) {
      set((state) => ({ timerSeconds: state.timerSeconds + 1 }));
    }
  },

  logSet: async (setNumber, reps, weightKg) => {
    const currentSets = [...get().loggedSets];
    const index = currentSets.findIndex((s) => s.set_number === setNumber);
    if (index >= 0) {
      currentSets[index] = { set_number: setNumber, reps, weight_kg: weightKg, completed: true };
    } else {
      currentSets.push({ set_number: setNumber, reps, weight_kg: weightKg, completed: true });
    }
    set({ loggedSets: currentSets });

    if (get().sessionId) {
      await ApiClient.post('/api/workouts/sessions/log-set', {
        session_id: get().sessionId,
        exercise_id: get().activeExercise.id,
        set_number: setNumber,
        reps_completed: reps,
        weight_kg: weightKg,
      });
    }
  },

  finishSession: async () => {
    if (get().sessionId) {
      await ApiClient.post('/api/workouts/sessions/finish', {
        session_id: get().sessionId,
        calories_burned: Math.round(get().timerSeconds * 0.1),
      });
    }
    set({
      isWorkoutActive: false,
      sessionId: null,
      isTimerRunning: false,
      timerSeconds: 0,
    });
  },
}));

