export type UserRole = 'MEMBER' | 'TRAINER' | 'ADMIN';

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

