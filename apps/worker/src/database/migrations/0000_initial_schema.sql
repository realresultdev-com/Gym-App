-- Cloudflare D1 Initial SQLite Schema Migration
-- Migration: 0000_initial_schema.sql

-- 1. Gym Settings
CREATE TABLE IF NOT EXISTS gym_settings (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    opening_time TEXT NOT NULL DEFAULT '06:00',
    closing_time TEXT NOT NULL DEFAULT '22:00',
    capacity_limit INTEGER NOT NULL DEFAULT 100,
    qr_refresh_interval_sec INTEGER NOT NULL DEFAULT 60,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gym_settings_gym_id ON gym_settings(gym_id);

-- 2. Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'TRAINER', 'MEMBER')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_gym_email ON users(gym_id, email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_gym_role ON users(gym_id, role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 4. User Roles (supporting multi-role mapping if needed)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. Trainer Profiles
CREATE TABLE IF NOT EXISTS trainer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    gym_id TEXT NOT NULL,
    specialization TEXT NOT NULL,
    bio TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0,
    certification TEXT,
    hourly_rate REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_gym ON trainer_profiles(gym_id);

-- 6. Member Profiles
CREATE TABLE IF NOT EXISTS member_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    gym_id TEXT NOT NULL,
    emergency_contact TEXT,
    date_of_birth TEXT,
    gender TEXT CHECK(gender IN ('MALE', 'FEMALE', 'OTHER')),
    address TEXT,
    height_cm REAL,
    target_weight_kg REAL,
    fitness_goal TEXT,
    medical_conditions TEXT,
    join_date TEXT NOT NULL DEFAULT (datetime('now')),
    assigned_trainer_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id),
    FOREIGN KEY (assigned_trainer_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_member_profiles_gym ON member_profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_trainer ON member_profiles(assigned_trainer_id);

-- 7. Trainer Member Assignments
CREATE TABLE IF NOT EXISTS trainer_member_assignments (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    trainer_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
    notes TEXT,
    FOREIGN KEY (trainer_id) REFERENCES users(id),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_tma_gym_trainer ON trainer_member_assignments(gym_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_tma_gym_member ON trainer_member_assignments(gym_id, member_id);

-- 8. Membership Plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    price REAL NOT NULL,
    admission_fee REAL NOT NULL DEFAULT 0,
    features_json TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_membership_plans_gym ON membership_plans(gym_id, is_active);

-- 9. Member Subscriptions
CREATE TABLE IF NOT EXISTS member_subscriptions (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED')),
    total_amount REAL NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    outstanding_balance REAL NOT NULL DEFAULT 0,
    auto_renew INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON member_subscriptions(member_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gym_status ON member_subscriptions(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON member_subscriptions(end_date);

-- 10. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'GATEWAY_ONLINE')),
    payment_status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(payment_status IN ('COMPLETED', 'PENDING', 'FAILED', 'REFUNDED')),
    transaction_ref TEXT,
    receipt_number TEXT NOT NULL UNIQUE,
    paid_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    recorded_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (subscription_id) REFERENCES member_subscriptions(id),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_paid ON payments(gym_id, paid_at);

-- 11. Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    payment_id TEXT NOT NULL UNIQUE,
    receipt_pdf_key TEXT,
    receipt_data_json TEXT NOT NULL,
    issued_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);

-- 12. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    status TEXT NOT NULL CHECK(status IN ('CHECKED_IN', 'CHECKED_OUT')),
    duration_minutes INTEGER,
    method TEXT NOT NULL DEFAULT 'APP_CHECKIN' CHECK(method IN ('MANUAL', 'QR_CODE', 'BIOMETRIC', 'APP_CHECKIN')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_status ON attendance(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin ON attendance(gym_id, check_in_time);

-- 13. Exercise Categories
CREATE TABLE IF NOT EXISTS exercise_categories (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon_name TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_exercise_cats_gym ON exercise_categories(gym_id);

-- 14. Exercises
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_muscle TEXT NOT NULL,
    equipment TEXT,
    difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE' CHECK(difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    instructions TEXT,
    image_url TEXT,
    video_url TEXT,
    tips_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES exercise_categories(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(target_muscle);

-- 15. Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    assigned_to_member_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE' CHECK(difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    is_template INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to_member_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_workout_plans_assigned ON workout_plans(assigned_to_member_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_gym_template ON workout_plans(gym_id, is_template);

-- 16. Workout Plan Days
CREATE TABLE IF NOT EXISTS workout_plan_days (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    title TEXT NOT NULL,
    rest_day INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON workout_plan_days(plan_id, day_of_week);

-- 17. Workout Plan Exercises
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id TEXT PRIMARY KEY,
    day_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    target_reps INTEGER NOT NULL DEFAULT 12,
    target_weight_kg REAL DEFAULT 0,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    sort_order INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (day_id) REFERENCES workout_plan_days(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE INDEX IF NOT EXISTS idx_plan_exercises_day ON workout_plan_exercises(day_id);

-- 18. Workout Sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    plan_day_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    total_duration_seconds INTEGER,
    calories_burned INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (plan_day_id) REFERENCES workout_plan_days(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_member ON workout_sessions(member_id, start_time);

-- 19. Workout Exercise Logs
CREATE TABLE IF NOT EXISTS workout_exercise_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_kg REAL NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 1,
    rest_seconds_taken INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON workout_exercise_logs(session_id);

-- 20. Fitness Measurements
CREATE TABLE IF NOT EXISTS fitness_measurements (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    weight_kg REAL NOT NULL,
    height_cm REAL,
    bmi REAL,
    body_fat_percentage REAL,
    muscle_mass_kg REAL,
    chest_cm REAL,
    waist_cm REAL,
    hips_cm REAL,
    biceps_cm REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_measurements_member ON fitness_measurements(member_id, recorded_at);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('PAYMENT_REMINDER', 'MEMBERSHIP_EXPIRY', 'WORKOUT_ASSIGNED', 'ATTENDANCE', 'SYSTEM')),
    data_json TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 22. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES users(id),
    FOREIGN KEY (gym_id) REFERENCES gym_settings(gym_id)
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_gym ON audit_logs(gym_id, created_at);

-- 23. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

