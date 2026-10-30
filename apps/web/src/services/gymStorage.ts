import type {
  UserRole,
  AuthUser,
  WorkoutProgram,
  SetItem,
  WorkoutSessionLog,
  AttendanceRecord,
  GymMember,
  NotificationItem,
  MemberFeeProfile,
  FeePaymentRecord,
} from '../types/gym';

export interface GymAppState {
  auth: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };
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
  feeProfiles: MemberFeeProfile[];
  paymentRecords: FeePaymentRecord[];
}

const STORAGE_KEY = 'FITPULSE_GYM_STATE_V5';

const stripEmojis = (str: string) => str.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '').trim();

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
    title: 'Welcome to FITPULSE Studio',
    message: 'Your Quarterly Pro Athlete membership is active. Locker #42 has been assigned to you.',
    type: 'ANNOUNCEMENT',
    createdAt: 'Today, 09:30 AM',
    read: false,
    author: 'Front Desk',
  },
  {
    id: 'notif-02',
    title: 'New Program: Upper Body Focus',
    message: 'Coach Alex Hunter scheduled your Pull-Up Mastery routine for today.',
    type: 'WORKOUT',
    createdAt: 'Today, 07:15 AM',
    read: false,
    author: 'Alex Hunter',
  },
  {
    id: 'notif-03',
    title: 'Studio Hours Update',
    message: 'Recovery sauna will close at 9:00 PM this Friday for scheduled sanitization.',
    type: 'ANNOUNCEMENT',
    createdAt: 'Yesterday',
    read: true,
    author: 'Management',
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

export const INITIAL_FEE_PROFILES: MemberFeeProfile[] = [
  {
    memberId: 'usr-member-0001',
    memberName: 'Martin Vance',
    memberEmail: 'member@gym.com',
    memberPhone: '+1 555-0003',
    planName: 'Quarterly Pro Athlete',
    feeAmount: 240,
    billingFrequency: 'Quarterly',
    lastPaymentDate: '15 Aug 2026',
    lastPaymentAmount: 240,
    lastPaymentMethod: 'UPI / QR',
    lastInvoiceNumber: 'INV-2026-0815',
    nextDueDate: '15 Nov 2026',
    nextDueAmount: 240,
    status: 'PAID',
    daysRemaining: 15,
    autoRenew: true,
  },
  {
    memberId: 'usr-member-0002',
    memberName: 'Elena Rostova',
    memberEmail: 'elena@example.com',
    memberPhone: '+1 555-0004',
    planName: 'VIP Elite Annual',
    feeAmount: 799,
    billingFrequency: 'Annual',
    lastPaymentDate: '10 Jun 2026',
    lastPaymentAmount: 799,
    lastPaymentMethod: 'Credit Card',
    lastInvoiceNumber: 'INV-2026-0610',
    nextDueDate: '10 Jun 2027',
    nextDueAmount: 799,
    status: 'PAID',
    daysRemaining: 222,
    autoRenew: true,
  },
  {
    memberId: 'usr-member-0003',
    memberName: 'Marcus Brody',
    memberEmail: 'marcus@example.com',
    memberPhone: '+1 555-0005',
    planName: 'Monthly All-Access',
    feeAmount: 89,
    billingFrequency: 'Monthly',
    lastPaymentDate: '01 Oct 2026',
    lastPaymentAmount: 89,
    lastPaymentMethod: 'Cash Desk',
    lastInvoiceNumber: 'INV-2026-1001',
    nextDueDate: '01 Nov 2026',
    nextDueAmount: 89,
    status: 'DUE_SOON',
    daysRemaining: 1,
    autoRenew: false,
  },
  {
    memberId: 'usr-member-0004',
    memberName: "Liam O'Connor",
    memberEmail: 'liam@example.com',
    memberPhone: '+1 555-0006',
    planName: 'Monthly All-Access',
    feeAmount: 89,
    billingFrequency: 'Monthly',
    lastPaymentDate: '18 Sep 2026',
    lastPaymentAmount: 89,
    lastPaymentMethod: 'Credit Card',
    lastInvoiceNumber: 'INV-2026-0918',
    nextDueDate: '18 Oct 2026',
    nextDueAmount: 89,
    status: 'OVERDUE',
    daysRemaining: -12,
    autoRenew: false,
  },
  {
    memberId: 'usr-member-0005',
    memberName: 'Sophie Chen',
    memberEmail: 'sophie@example.com',
    memberPhone: '+1 555-0007',
    planName: 'Quarterly Pro Athlete',
    feeAmount: 240,
    billingFrequency: 'Quarterly',
    lastPaymentDate: '28 Jul 2026',
    lastPaymentAmount: 240,
    lastPaymentMethod: 'Bank Transfer',
    lastInvoiceNumber: 'INV-2026-0728',
    nextDueDate: '28 Oct 2026',
    nextDueAmount: 240,
    status: 'OVERDUE',
    daysRemaining: -2,
    autoRenew: false,
  },
];

export const INITIAL_PAYMENT_RECORDS: FeePaymentRecord[] = [
  {
    id: 'pay-001',
    memberId: 'usr-member-0001',
    memberName: 'Martin Vance',
    planName: 'Quarterly Pro Athlete',
    amount: 240,
    paidDate: '15 Aug 2026',
    nextDueDate: '15 Nov 2026',
    method: 'UPI / QR',
    invoiceNumber: 'INV-2026-0815',
    status: 'PAID',
    notes: 'Quarterly cycle renewal - Verified online payment',
    recordedBy: 'Self-Pay Portal',
  },
  {
    id: 'pay-002',
    memberId: 'usr-member-0001',
    memberName: 'Martin Vance',
    planName: 'Quarterly Pro Athlete',
    amount: 240,
    paidDate: '15 May 2026',
    nextDueDate: '15 Aug 2026',
    method: 'Credit Card',
    invoiceNumber: 'INV-2026-0515',
    status: 'PAID',
    notes: 'Initial registration fee & access card',
    recordedBy: 'Sarah Connor (Admin)',
  },
  {
    id: 'pay-003',
    memberId: 'usr-member-0002',
    memberName: 'Elena Rostova',
    planName: 'VIP Elite Annual',
    amount: 799,
    paidDate: '10 Jun 2026',
    nextDueDate: '10 Jun 2027',
    method: 'Credit Card',
    invoiceNumber: 'INV-2026-0610',
    status: 'PAID',
    notes: 'Annual upfront VIP package with locker & towel service',
    recordedBy: 'Sarah Connor (Admin)',
  },
  {
    id: 'pay-004',
    memberId: 'usr-member-0003',
    memberName: 'Marcus Brody',
    planName: 'Monthly All-Access',
    amount: 89,
    paidDate: '01 Oct 2026',
    nextDueDate: '01 Nov 2026',
    method: 'Cash Desk',
    invoiceNumber: 'INV-2026-1001',
    status: 'PAID',
    notes: 'Front desk cash payment received by desk manager',
    recordedBy: 'Desk Manager',
  },
  {
    id: 'pay-005',
    memberId: 'usr-member-0004',
    memberName: "Liam O'Connor",
    planName: 'Monthly All-Access',
    amount: 89,
    paidDate: '18 Sep 2026',
    nextDueDate: '18 Oct 2026',
    method: 'Credit Card',
    invoiceNumber: 'INV-2026-0918',
    status: 'PAID',
    notes: 'Monthly recurring cycle',
    recordedBy: 'Payment Gateway',
  },
  {
    id: 'pay-006',
    memberId: 'usr-member-0005',
    memberName: 'Sophie Chen',
    planName: 'Quarterly Pro Athlete',
    amount: 240,
    paidDate: '28 Jul 2026',
    nextDueDate: '28 Oct 2026',
    method: 'Bank Transfer',
    invoiceNumber: 'INV-2026-0728',
    status: 'PAID',
    notes: 'Direct NEFT transfer',
    recordedBy: 'Sarah Connor (Admin)',
  },
];

export function loadGymState(): GymAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        auth: parsed.auth || {
          isAuthenticated: true,
          user: {
            id: 'usr-member-0001',
            name: 'Martin Vance',
            email: 'member@gym.com',
            role: parsed.role || 'MEMBER',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
          },
        },
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
          timerSeconds: 17405,
          isRunning: true,
          sets: INITIAL_SETS,
        },
        completedSessions: parsed.completedSessions || [],
        attendanceHistory: parsed.attendanceHistory || INITIAL_ATTENDANCE,
        members: parsed.members || INITIAL_MEMBERS,
        notifications: (parsed.notifications || INITIAL_NOTIFICATIONS).map((n: NotificationItem) => ({
          ...n,
          title: stripEmojis(n.title),
        })),
        feeProfiles: parsed.feeProfiles?.length ? parsed.feeProfiles : INITIAL_FEE_PROFILES,
        paymentRecords: parsed.paymentRecords?.length ? parsed.paymentRecords : INITIAL_PAYMENT_RECORDS,
      };
    }
  } catch (e) {
    console.error('Error loading gym state from localStorage:', e);
  }

  return {
    auth: {
      isAuthenticated: true,
      user: {
        id: 'usr-member-0001',
        name: 'Martin Vance',
        email: 'member@gym.com',
        role: 'MEMBER',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      },
    },
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
    feeProfiles: INITIAL_FEE_PROFILES,
    paymentRecords: INITIAL_PAYMENT_RECORDS,
  };
}

export function saveGymState(state: GymAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving gym state to localStorage:', e);
  }
}
