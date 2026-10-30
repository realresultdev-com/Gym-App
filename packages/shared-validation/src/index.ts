import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const createMemberSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(6).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  date_of_birth: z.string().optional(),
  emergency_contact: z.string().optional(),
  address: z.string().optional(),
  height_cm: z.number().positive().optional(),
  target_weight_kg: z.number().positive().optional(),
  fitness_goal: z.string().optional(),
  medical_conditions: z.string().optional(),
  assigned_trainer_id: z.string().uuid().optional(),
  plan_id: z.string().uuid().optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const createTrainerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(15),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(6).optional(),
  specialization: z.string().min(2),
  bio: z.string().optional(),
  experience_years: z.number().nonnegative().default(0),
  certification: z.string().optional(),
  hourly_rate: z.number().nonnegative().optional(),
});

export const checkInSchema = z.object({
  member_id: z.string().uuid().optional(), // Admin/Trainer can pass member_id; member uses their own auth id
  method: z.enum(['MANUAL', 'QR_CODE', 'BIOMETRIC', 'APP_CHECKIN']).default('APP_CHECKIN'),
  qr_token: z.string().optional(),
});

export const checkOutSchema = z.object({
  attendance_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
});

export const createMembershipPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  duration_days: z.number().int().positive(),
  price: z.number().nonnegative(),
  admission_fee: z.number().nonnegative().default(0),
  features_json: z.string().optional(),
});

export const assignSubscriptionSchema = z.object({
  member_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  start_date: z.string().optional(),
  paid_amount: z.number().nonnegative().default(0),
  payment_method: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']).default('CASH'),
});

export const recordPaymentSchema = z.object({
  subscription_id: z.string().uuid(),
  member_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
  transaction_ref: z.string().optional(),
  notes: z.string().optional(),
});

export const createWorkoutPlanSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  duration_weeks: z.number().int().positive().default(4),
  assigned_to_member_id: z.string().uuid().optional(),
  is_template: z.boolean().default(false),
  days: z.array(z.object({
    day_of_week: z.number().int().min(0).max(6),
    title: z.string(),
    rest_day: z.boolean().default(false),
    exercises: z.array(z.object({
      exercise_id: z.string().uuid(),
      sets: z.number().int().positive(),
      target_reps: z.number().int().positive(),
      target_weight_kg: z.number().nonnegative().optional(),
      rest_seconds: z.number().int().default(60),
      notes: z.string().optional(),
    })).default([]),
  })).default([]),
});

export const startWorkoutSessionSchema = z.object({
  plan_day_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const logExerciseSetSchema = z.object({
  session_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  set_number: z.number().int().positive(),
  reps_completed: z.number().int().nonnegative(),
  weight_kg: z.number().nonnegative(),
  completed: z.boolean().default(true),
  rest_seconds_taken: z.number().int().optional(),
});

export const finishWorkoutSessionSchema = z.object({
  session_id: z.string().uuid(),
  calories_burned: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const recordFitnessMeasurementSchema = z.object({
  member_id: z.string().uuid().optional(), // defaults to current user if member
  weight_kg: z.number().positive(),
  height_cm: z.number().positive().optional(),
  body_fat_percentage: z.number().positive().max(100).optional(),
  muscle_mass_kg: z.number().positive().optional(),
  chest_cm: z.number().positive().optional(),
  waist_cm: z.number().positive().optional(),
  hips_cm: z.number().positive().optional(),
  biceps_cm: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateGymSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().min(1).max(5).optional(),
  timezone: z.string().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  capacity_limit: z.number().int().positive().optional(),
  qr_refresh_interval_sec: z.number().int().positive().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

