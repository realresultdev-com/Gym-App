import type {
  UserRole,
  WorkoutProgram,
  SetItem,
  WorkoutSessionLog,
  AttendanceRecord,
  GymMember,
  NotificationItem,
} from '../types/gym';

export interface GymAppState {
  role: UserRole;
  activeCheckIn: {
    isCheckedIn: boolean;
    checkInTimestamp: number | null;
    activeRecordId: string | null;
  };
  streakDays: number;
  programs: WorkoutProgram[];
  activeWorkout: {
    programId: string;
    programTitle: string;
    timerSeconds: number;
    isRunning: boolean;
    sets: SetItem[];
  };
  completedSessions: WorkoutSessionLog[];
  attendanceHistory: AttendanceRecord[];
  members: GymMember[];
  notifications: NotificationItem[];
}

const STORAGE_KEY = 'FITPULSE_GYM_STATE_V2';

export const INITIAL_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-chest-01',
    title: 'Chest Hypertrophy & Press',
    category: 'Chest',
    durationMin: 12,
    setsReps: '3 x 16 reps',
    description: 'Focus on proper eccentric control and sternal pectoral recruitment.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400',
    exercises: ['Barbell Incline Press', 'Dumbbell Flat Fly', 'Cable Crossover'],
    assignedTo: 'ALL',
    createdAt: '2026-10-25',
  },
  {
    id: 'prog-arms-01',
    title: 'Arms Peak Hypertrophy',
    category: 'Arms',
    durationMin: 10,
    setsReps: '3 x 12 reps',
    description: 'Progressive overload on biceps brachii and tricep lateral heads.',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400',
    exercises: ['EZ-Bar Preacher Curl', 'Tricep Rope Pushdown', 'Hammer Curls'],
    assignedTo: 'ALL',
    createdAt: '2026-10-25',
  },
  {
    id: 'prog-pullups-01',
    title: 'Pull-Up Mastery & Lat Drive',
    category: 'Back',
    durationMin: 15,
    setsReps: '4 x 10 reps',
    description: 'Full range of motion, dead hang to chin-over-bar lat engagement.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400',
    exercises: ['Strict Wide Pull-Ups', 'Scapular Pulls', 'Isometric Chin Hang'],
    assignedTo: 'ALL',
    createdAt: '2026-10-25',
  },
  {
    id: 'prog-cardio-01',
    title: 'High Intensity Sprint & Metcon',
    category: 'Cardio',
    durationMin: 20,
    setsReps: '5 x 4 min intervals',
    description: 'Maximum aerobic conditioning, assault bike and rower sprints.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400',
    exercises: ['Assault Bike Intervals', 'Rowing Machine Sprints', 'Jump Rope Double Unders'],
    assignedTo: 'ALL',
    createdAt: '2026-10-26',
  },
];

export const INITIAL_MEMBERS: GymMember[] = [
  {
    id: 'usr-member-0001',
    name: 'Martin Vance',
    email: 'member@gym.com',
    phone: '+1 555-0003',
    plan: 'Quarterly Pro Athlete',
    status: 'ACTIVE',
    joinedDate: '2026-08-15',
    assignedTrainer: 'Alex Hunter (CSCS)',
    fitnessGoal: 'Build lean muscle and improve core stability',
    streakDays: 12,
  },
  {
    id: 'usr-member-0002',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    phone: '+1 555-0004',
    plan: 'VIP Elite Annual',
    status: 'ACTIVE',
    joinedDate: '2026-06-10',
    assignedTrainer: 'Alex Hunter (CSCS)',
    fitnessGoal: 'Marathon training & VO2 max boost',
    streakDays: 19,
  },
  {
    id: 'usr-member-0003',
    name: 'Marcus Brody',
    email: 'marcus@example.com',
    phone: '+1 555-0005',
    plan: 'Monthly All-Access',
    status: 'ACTIVE',
    joinedDate: '2026-10-01',
    assignedTrainer: 'Unassigned',
    fitnessGoal: 'General fitness & fat loss',
    streakDays: 4,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: '⚡ Welcome to FITPULSE Studio',
    message: 'Your Cloudflare D1 serverless database connection is active and verified.',
    type: 'ANNOUNCEMENT',
    createdAt: 'Just now',
    read: false,
    author: 'Sarah Connor (Admin)',
  },
  {
    id: 'notif-02',
    title: '🏋️ Workout Assigned by Alex Hunter',
    message: 'New Pull-Up Mastery & Lat Drive routine added to your daily schedule.',
    type: 'WORKOUT',
    createdAt: '2 hours ago',
    read: false,
    author: 'Alex Hunter (Trainer)',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-hist-01',
    memberId: 'usr-member-0001',
    memberName: 'Martin Vance',
    date: 'Yesterday',
    checkInTime: '17:45',
    checkOutTime: '19:05',
    durationMinutes: 80,
    status: 'COMPLETED',
    method: 'Touchless QR',
  },
  {
    id: 'att-hist-02',
    memberId: 'usr-member-0001',
    memberName: 'Martin Vance',
    date: '24 Oct 2026',
    checkInTime: '08:15',
    checkOutTime: '09:20',
    durationMinutes: 65,
    status: 'COMPLETED',
    method: 'Touchless QR',
  },
];

export const INITIAL_SETS: SetItem[] = [
  { id: 'set-1', set: 1, reps: 10, weight: 'Bodyweight', completed: true },
  { id: 'set-2', set: 2, reps: 10, weight: 'Bodyweight', completed: true },
  { id: 'set-3', set: 3, reps: 8, weight: 'Bodyweight', completed: false },
  { id: 'set-4', set: 4, reps: 8, weight: 'Bodyweight', completed: false },
];

export function loadGymState(): GymAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure any newly added keys exist
      return {
        role: parsed.role || 'MEMBER',
        activeCheckIn: parsed.activeCheckIn || {
          isCheckedIn: false,
          checkInTimestamp: null,
          activeRecordId: null,
        },
        streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 12,
        programs: parsed.programs?.length ? parsed.programs : INITIAL_PROGRAMS,
        activeWorkout: parsed.activeWorkout || {
          programId: 'prog-pullups-01',
          programTitle: '1 Pull-Ups',
          timerSeconds: 17405, // 04:50:05
          isRunning: true,
          sets: INITIAL_SETS,
        },
        completedSessions: parsed.completedSessions || [],
        attendanceHistory: parsed.attendanceHistory || INITIAL_ATTENDANCE,
        members: parsed.members || INITIAL_MEMBERS,
        notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
      };
    }
  } catch (e) {
    console.error('Error loading gym state from localStorage:', e);
  }

  return {
    role: 'MEMBER',
    activeCheckIn: {
      isCheckedIn: false,
      checkInTimestamp: null,
      activeRecordId: null,
    },
    streakDays: 12,
    programs: INITIAL_PROGRAMS,
    activeWorkout: {
      programId: 'prog-pullups-01',
      programTitle: '1 Pull-Ups',
      timerSeconds: 17405,
      isRunning: true,
      sets: INITIAL_SETS,
    },
    completedSessions: [],
    attendanceHistory: INITIAL_ATTENDANCE,
    members: INITIAL_MEMBERS,
    notifications: INITIAL_NOTIFICATIONS,
  };
}

export function saveGymState(state: GymAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving gym state to localStorage:', e);
  }
}

