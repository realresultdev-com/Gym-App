export type UserRole = 'MEMBER' | 'TRAINER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  token?: string;
}

export interface SetItem {
  id: string;
  set: number;
  reps: number;
  weight: string;
  completed: boolean;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  category: 'Chest' | 'Arms' | 'Cardio' | 'Yoga' | 'Strength' | 'Back' | 'Legs';
  durationMin: number;
  setsReps: string;
  description: string;
  imageUrl: string;
  exercises?: string[];
  assignedTo?: string; // member id or 'ALL'
  createdAt: string;
}

export interface WorkoutSessionLog {
  id: string;
  programId: string;
  programTitle: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  setsCompleted: number;
  totalSets: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes?: number;
  status: 'CHECKED_IN' | 'COMPLETED';
  method: 'Touchless QR' | 'Front Desk Manual' | 'Mobile Tap';
}

export interface GymMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'Monthly All-Access' | 'Quarterly Pro Athlete' | 'VIP Elite Annual';
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  joinedDate: string;
  assignedTrainer: string;
  fitnessGoal: string;
  streakDays: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'PAYMENT' | 'WORKOUT' | 'ATTENDANCE';
  createdAt: string;
  read: boolean;
  author: string;
}

export interface ExerciseStep {
  stepNumber: number;
  title: string;
  instruction: string;
  cue: string;
  imageUrl: string;
}

export interface ExerciseGuide {
  id: string;
  slug: string;
  name: string;
  series: string;
  lessonNumber: number;
  category: 'Upper Body' | 'Lower Body' | 'Core' | 'Full Body';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: 'Bodyweight' | 'Dumbbells' | 'Barbell' | 'Cable';
  targetMusclesPrimary: string[];
  targetMusclesSecondary: string[];
  overview: string;
  benefits: string[];
  steps: ExerciseStep[];
  formTips: string[];
  commonMistakes: string[];
  recommendedSetsReps: string;
  tempo: string;
  variations: { name: string; level: string; description: string }[];
}

export type PaymentMethod = 'Credit Card' | 'UPI / QR' | 'Cash Desk' | 'Bank Transfer' | 'Apple Pay';

export type FeeStatus = 'PAID' | 'DUE_SOON' | 'OVERDUE';

export interface FeePaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  planName: string;
  amount: number;
  paidDate: string;
  nextDueDate: string;
  method: PaymentMethod;
  invoiceNumber: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  notes?: string;
  recordedBy?: string;
}

export interface MemberFeeProfile {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  planName: 'Monthly All-Access' | 'Quarterly Pro Athlete' | 'VIP Elite Annual';
  feeAmount: number;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  lastPaymentDate: string;
  lastPaymentAmount: number;
  lastPaymentMethod: PaymentMethod;
  lastInvoiceNumber: string;
  nextDueDate: string;
  nextDueAmount: number;
  status: FeeStatus;
  daysRemaining: number;
  autoRenew: boolean;
}


