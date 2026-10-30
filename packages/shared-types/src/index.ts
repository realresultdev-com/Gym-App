export type UserRole = 'ADMIN' | 'TRAINER' | 'MEMBER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'GATEWAY_ONLINE';

export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type AttendanceMethod = 'MANUAL' | 'QR_CODE' | 'BIOMETRIC' | 'APP_CHECKIN';

export type AttendanceStatus = 'CHECKED_IN' | 'CHECKED_OUT';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// Core User Entity
export interface User {
  id: string;
  gym_id: string;
  email: string;
  phone: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type SafeUser = Omit<User, 'password_hash'>;

// Gym Settings
export interface GymSettings {
  id: string;
  gym_id: string;
  name: string;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  timezone: string;
  opening_time: string;
  closing_time: string;
  capacity_limit: number;
  qr_refresh_interval_sec: number;
  created_at: string;
  updated_at: string;
}

// Member Profile
export interface MemberProfile {
  id: string;
  user_id: string;
  gym_id: string;
  emergency_contact?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  address?: string | null;
  height_cm?: number | null;
  target_weight_kg?: number | null;
  fitness_goal?: string | null;
  medical_conditions?: string | null;
  join_date: string;
  assigned_trainer_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Trainer Profile
export interface TrainerProfile {
  id: string;
  user_id: string;
  gym_id: string;
  specialization: string;
  bio?: string | null;
  experience_years: number;
  certification?: string | null;
  hourly_rate?: number | null;
  created_at: string;
  updated_at: string;
}

// Trainer-Member Assignment
export interface TrainerMemberAssignment {
  id: string;
  gym_id: string;
  trainer_id: string;
  member_id: string;
  assigned_at: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string | null;
}

// Membership Plan
export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  description?: string | null;
  duration_days: number;
  price: number;
  admission_fee: number;
  features_json?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Member Subscription
export interface MemberSubscription {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  total_amount: number;
  paid_amount: number;
  outstanding_balance: number;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan_name?: string;
}

// Payment
export interface Payment {
  id: string;
  gym_id: string;
  subscription_id: string;
  member_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_ref?: string | null;
  receipt_number: string;
  paid_at: string;
  notes?: string | null;
  recorded_by: string;
  created_at: string;
}

// Attendance
export interface Attendance {
  id: string;
  gym_id: string;
  member_id: string;
  check_in_time: string;
  check_out_time?: string | null;
  status: AttendanceStatus;
  duration_minutes?: number | null;
  method: AttendanceMethod;
  notes?: string | null;
  created_at: string;
  // Join fields
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
}

// QR Attendance Token Payload
export interface QRAttendancePayload {
  gym_id: string;
  timestamp: number;
  signature: string;
  nonce: string;
}

// Exercises & Workouts
export interface ExerciseCategory {
  id: string;
  gym_id: string;
  name: string;
  icon_name?: string | null;
  description?: string | null;
  sort_order: number;
}

export interface Exercise {
  id: string;
  gym_id: string;
  category_id: string;
  name: string;
  target_muscle: string;
  equipment?: string | null;
  difficulty: DifficultyLevel;
  instructions?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  tips_json?: string | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  gym_id: string;
  created_by: string;
  assigned_to_member_id?: string | null;
  title: string;
  description?: string | null;
  difficulty: DifficultyLevel;
  duration_weeks: number;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanDay {
  id: string;
  plan_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ... 6=Saturday
  title: string; // e.g. "Chest & Triceps"
  rest_day: boolean;
  sort_order: number;
}

export interface WorkoutPlanExercise {
  id: string;
  day_id: string;
  exercise_id: string;
  sets: number;
  target_reps: number;
  target_weight_kg?: number | null;
  rest_seconds: number;
  sort_order: number;
  notes?: string | null;
  // Join fields
  exercise_name?: string;
  target_muscle?: string;
  image_url?: string | null;
}

export interface WorkoutSession {
  id: string;
  gym_id: string;
  member_id: string;
  plan_day_id?: string | null;
  start_time: string;
  end_time?: string | null;
  total_duration_seconds?: number | null;
  calories_burned?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface WorkoutExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  completed: boolean;
  rest_seconds_taken?: number | null;
  created_at: string;
}

// Fitness Measurements
export interface FitnessMeasurement {
  id: string;
  gym_id: string;
  member_id: string;
  recorded_at: string;
  weight_kg: number;
  height_cm?: number | null;
  bmi?: number | null;
  body_fat_percentage?: number | null;
  muscle_mass_kg?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  biceps_cm?: number | null;
  notes?: string | null;
  created_at: string;
}

// Notifications
export interface Notification {
  id: string;
  gym_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'PAYMENT_REMINDER' | 'MEMBERSHIP_EXPIRY' | 'WORKOUT_ASSIGNED' | 'ATTENDANCE' | 'SYSTEM';
  data_json?: string | null;
  is_read: boolean;
  created_at: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  gym_id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details_json?: string | null;
  ip_address?: string | null;
  created_at: string;
}

// Refresh Token
export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at?: string | null;
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Auth Tokens
export interface AuthSession {
  user: SafeUser;
  token: string;
  refresh_token: string;
  expires_in: number;
}

