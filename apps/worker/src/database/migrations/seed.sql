-- Seed Data for Cloudflare D1
-- Initial Gym, Admin, Trainer, Member, Plans, Categories, Exercises

-- 1. Gym
INSERT OR IGNORE INTO gym_settings (id, gym_id, name, logo_url, address, phone, email, currency, timezone, opening_time, closing_time, capacity_limit, qr_refresh_interval_sec)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'FITPULSE Studio',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200',
    '742 Evergreen Terrace, Metropolis',
    '+1 555-0199',
    'contact@fitpulse.gym',
    'USD',
    'UTC',
    '06:00',
    '22:00',
    120,
    60
);

-- 2. Roles
INSERT OR IGNORE INTO roles (id, name, description) VALUES
('role-admin', 'ADMIN', 'Gym Administrator with full control'),
('role-trainer', 'TRAINER', 'Certified Gym Trainer managing workouts and assigned members'),
('role-member', 'MEMBER', 'Gym Member tracking progress and attendance');

-- 3. Users (Password is 'Password123!' for all seeded users)
INSERT OR IGNORE INTO users (id, gym_id, email, phone, password_hash, first_name, last_name, role, status, avatar_url) VALUES
(
    'usr-admin-0001',
    '00000000-0000-0000-0000-000000000001',
    'admin@gym.com',
    '+15550001',
    '6283163f0c83c3db20d44303b0d3449f:100000:da5f0a16a1af1a76a9cc76d5b5866b50fe002db48f7788d4012038f8f6024831',
    'Sarah',
    'Connor',
    'ADMIN',
    'ACTIVE',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
),
(
    'usr-trainer-0001',
    '00000000-0000-0000-0000-000000000001',
    'trainer@gym.com',
    '+15550002',
    '6283163f0c83c3db20d44303b0d3449f:100000:da5f0a16a1af1a76a9cc76d5b5866b50fe002db48f7788d4012038f8f6024831',
    'Alex',
    'Hunter',
    'TRAINER',
    'ACTIVE',
    'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
),
(
    'usr-member-0001',
    '00000000-0000-0000-0000-000000000001',
    'member@gym.com',
    '+15550003',
    '6283163f0c83c3db20d44303b0d3449f:100000:da5f0a16a1af1a76a9cc76d5b5866b50fe002db48f7788d4012038f8f6024831',
    'Martin',
    'Vance',
    'MEMBER',
    'ACTIVE',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
);

-- 4. User Roles
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES
('usr-admin-0001', 'role-admin'),
('usr-trainer-0001', 'role-trainer'),
('usr-member-0001', 'role-member');

-- 5. Trainer Profile
INSERT OR IGNORE INTO trainer_profiles (id, user_id, gym_id, specialization, bio, experience_years, certification, hourly_rate)
VALUES (
    'tr-prof-0001',
    'usr-trainer-0001',
    '00000000-0000-0000-0000-000000000001',
    'Strength & Conditioning, Functional HIIT',
    'Certified elite trainer with 8+ years coaching champions and body transformation enthusiasts.',
    8,
    'NASM-CPT, CSCS',
    45.0
);

-- 6. Member Profile
INSERT OR IGNORE INTO member_profiles (id, user_id, gym_id, emergency_contact, date_of_birth, gender, address, height_cm, target_weight_kg, fitness_goal, assigned_trainer_id)
VALUES (
    'mem-prof-0001',
    'usr-member-0001',
    '00000000-0000-0000-0000-000000000001',
    '+1 555-9988',
    '1995-05-14',
    'MALE',
    '12 Baker St, Metropolis',
    182.0,
    78.0,
    'Build lean muscle and improve core stability',
    'usr-trainer-0001'
);

-- 7. Trainer-Member Assignment
INSERT OR IGNORE INTO trainer_member_assignments (id, gym_id, trainer_id, member_id, status, notes)
VALUES (
    'tma-0001',
    '00000000-0000-0000-0000-000000000001',
    'usr-trainer-0001',
    'usr-member-0001',
    'ACTIVE',
    'Focusing on upper body hypertrophy and pulling strength'
);

-- 8. Membership Plans
INSERT OR IGNORE INTO membership_plans (id, gym_id, name, description, duration_days, price, admission_fee, features_json, is_active) VALUES
(
    'plan-monthly-01',
    '00000000-0000-0000-0000-000000000001',
    'Monthly All-Access',
    'Unlimited gym floor access, locker rooms, and standard cardio classes.',
    30,
    49.0,
    15.0,
    '["Gym Floor Access", "Locker Room & Showers", "Mobile App Tracking", "Free Wi-Fi"]',
    1
),
(
    'plan-quarterly-01',
    '00000000-0000-0000-0000-000000000001',
    'Quarterly Pro Athlete',
    'Full access with 2 free 1-on-1 personal trainer sessions and body composition analysis.',
    90,
    129.0,
    0.0,
    '["All Floor Access", "2 PT Sessions", "Quarterly Body Scan", "Sauna Access"]',
    1
),
(
    'plan-annual-01',
    '00000000-0000-0000-0000-000000000001',
    'VIP Elite Annual',
    'Unlimited access, dedicated personal trainer, nutrition counseling, and guest passes.',
    365,
    399.0,
    0.0,
    '["24/7 Access", "Monthly PT Session", "Nutrition Counseling", "Unlimited Guest Passes", "Smoothie Bar Discounts"]',
    1
);

-- 9. Member Subscription for Martin Vance
INSERT OR IGNORE INTO member_subscriptions (id, gym_id, member_id, plan_id, start_date, end_date, status, total_amount, paid_amount, outstanding_balance, auto_renew)
VALUES (
    'sub-0001',
    '00000000-0000-0000-0000-000000000001',
    'usr-member-0001',
    'plan-quarterly-01',
    datetime('now', '-15 days'),
    datetime('now', '+75 days'),
    'ACTIVE',
    129.0,
    129.0,
    0.0,
    1
);

-- 10. Payment Record
INSERT OR IGNORE INTO payments (id, gym_id, subscription_id, member_id, amount, payment_method, payment_status, transaction_ref, receipt_number, paid_at, recorded_by)
VALUES (
    'pay-0001',
    '00000000-0000-0000-0000-000000000001',
    'sub-0001',
    'usr-member-0001',
    129.0,
    'UPI',
    'COMPLETED',
    'UPI-REF-98327189',
    'REC-2026-0001',
    datetime('now', '-15 days'),
    'usr-admin-0001'
);

-- 11. Payment Receipt
INSERT OR IGNORE INTO payment_receipts (id, gym_id, payment_id, receipt_pdf_key, receipt_data_json)
VALUES (
    'rec-0001',
    '00000000-0000-0000-0000-000000000001',
    'pay-0001',
    'receipts/REC-2026-0001.pdf',
    '{"member": "Martin Vance", "plan": "Quarterly Pro Athlete", "amount": 129.0, "paid_at": "2026-10-15"}'
);

-- 12. Exercise Categories
INSERT OR IGNORE INTO exercise_categories (id, gym_id, name, icon_name, description, sort_order) VALUES
('cat-all', '00000000-0000-0000-0000-000000000001', 'All Type', 'layers', 'All workouts and movements', 0),
('cat-chest', '00000000-0000-0000-0000-000000000001', 'Chest', 'fitness', 'Pectorals, chest press, pushups', 1),
('cat-arms', '00000000-0000-0000-0000-000000000001', 'Arms', 'barbell', 'Biceps, triceps, forearm strength', 2),
('cat-cardio', '00000000-0000-0000-0000-000000000001', 'Cardio', 'pulse', 'Heart rate, HIIT, stamina building', 3),
('cat-yoga', '00000000-0000-0000-0000-000000000001', 'Yoga', 'body', 'Flexibility, mobility, mind-body alignment', 4),
('cat-back', '00000000-0000-0000-0000-000000000001', 'Back', 'shield', 'Lats, rhomboids, deadlifts & pull-ups', 5),
('cat-legs', '00000000-0000-0000-0000-000000000001', 'Legs', 'walk', 'Quadriceps, hamstrings, calves', 6);

-- 13. Exercises
INSERT OR IGNORE INTO exercises (id, gym_id, category_id, name, target_muscle, equipment, difficulty, instructions, tips_json) VALUES
(
    'ex-001',
    '00000000-0000-0000-0000-000000000001',
    'cat-back',
    'Pull-Ups',
    'Latissimus Dorsi & Biceps',
    'Pull-Up Bar',
    'INTERMEDIATE',
    'Grip the bar slightly wider than shoulder width. Retract your scapulae and pull chest toward bar.',
    '["1. Grip the bar: Hold the pull-up bar with an overhand grip, shoulder-width apart.", "2. Hang with control: Start off the ground with your arms fully extended."]'
),
(
    'ex-002',
    '00000000-0000-0000-0000-000000000001',
    'cat-chest',
    'Barbell Bench Press',
    'Pectoralis Major & Triceps',
    'Barbell & Flat Bench',
    'INTERMEDIATE',
    'Lie flat, grip bar outside shoulder width, unrack, lower bar smoothly to mid-chest, and press explosively.',
    '["Keep feet flat on floor", "Tuck elbows at 45 degrees", "Breathe in on descent, exhale on drive"]'
),
(
    'ex-003',
    '00000000-0000-0000-0000-000000000001',
    'cat-arms',
    'Dumbbell Bicep Curl',
    'Biceps Brachii',
    'Dumbbells',
    'BEGINNER',
    'Stand tall with dumbbells at sides. Keeping upper arms stationary, curl weights while contracting biceps.',
    '["Do not swing torso", "Squeeze at top peak contraction for 1 sec"]'
),
(
    'ex-004',
    '00000000-0000-0000-0000-000000000001',
    'cat-legs',
    'Barbell Back Squat',
    'Quadriceps & Glutes',
    'Barbell & Squat Rack',
    'ADVANCED',
    'Place bar across upper traps. Sit hips back and down until thighs are parallel with floor, then drive up.',
    '["Maintain neutral spine", "Drive knees out in line with toes"]'
);

-- 14. Workout Plan
INSERT OR IGNORE INTO workout_plans (id, gym_id, created_by, assigned_to_member_id, title, description, difficulty, duration_weeks, is_template)
VALUES (
    'plan-wp-001',
    '00000000-0000-0000-0000-000000000001',
    'usr-trainer-0001',
    'usr-member-0001',
    'Upper Body Hypertrophy & Core',
    'Custom program crafted by Coach Alex for Martin Vance.',
    'INTERMEDIATE',
    6,
    0
);

-- 15. Workout Plan Day
INSERT OR IGNORE INTO workout_plan_days (id, plan_id, day_of_week, title, rest_day, sort_order)
VALUES (
    'wp-day-001',
    'plan-wp-001',
    1, -- Monday
    'Back & Biceps Power',
    0,
    1
);

-- 16. Workout Plan Exercise
INSERT OR IGNORE INTO workout_plan_exercises (id, day_id, exercise_id, sets, target_reps, target_weight_kg, rest_seconds, sort_order)
VALUES (
    'wpe-001',
    'wp-day-001',
    'ex-001',
    4,
    10,
    0.0,
    90,
    1
);

-- 17. Fitness Measurement
INSERT OR IGNORE INTO fitness_measurements (id, gym_id, member_id, recorded_at, weight_kg, height_cm, bmi, body_fat_percentage, muscle_mass_kg, chest_cm, waist_cm)
VALUES (
    'meas-001',
    '00000000-0000-0000-0000-000000000001',
    'usr-member-0001',
    datetime('now', '-7 days'),
    79.5,
    182.0,
    24.0,
    16.8,
    38.2,
    102.0,
    84.0
);

-- 18. Sample Attendance
INSERT OR IGNORE INTO attendance (id, gym_id, member_id, check_in_time, check_out_time, status, duration_minutes, method)
VALUES (
    'att-0001',
    '00000000-0000-0000-0000-000000000001',
    'usr-member-0001',
    datetime('now', '-1 day', '08:30:00'),
    datetime('now', '-1 day', '09:45:00'),
    'CHECKED_OUT',
    75,
    'QR_CODE'
);

