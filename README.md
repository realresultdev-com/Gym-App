# FITPULSE – Serverless Gym Management Platform

> **100% Cloudflare Serverless Architecture**
> Built exclusively with Cloudflare Workers, Cloudflare D1 (SQLite), Cloudflare R2, Cloudflare KV, and Cloudflare Cron Triggers.
> Mobile App built with React Native (Expo SDK 58), TypeScript, Tailwind CSS (NativeWind), and Zustand.

---

## 🏗 System Architecture

```text
  React Native Mobile App (Android / iOS / Web)
                      │
                      ▼ HTTPS REST API (JSON)
  ┌───────────────────────────────────────────────────────────┐
  │         Cloudflare Workers (Edge Serverless Runtime)       │
  │                     Powered by Hono                       │
  │  ───────────────────────────────────────────────────────  │
  │  • JWT Auth (WebCrypto)      • Role-Based Access Control  │
  │  • Rate Limiting Middleware  • Multi-Gym Boundary Filter  │
  │  • Usage Health Monitor      • Idempotent Cron Handlers   │
  └───────────────┬───────────────────┬───────────────────┬───┘
                  │                   │                   │
                  ▼                   ▼                   ▼
          Cloudflare D1        Cloudflare R2       Cloudflare KV
        Primary Relational     Object Storage      Fast Caching
        Database (SQLite)     (Avatars, Receipts)  (Settings, Rate)
                  │
                  ▼
          Cloudflare Cron
          (Daily Expiry, Reminders, Data Retention)
```

---

## 📱 Mobile UI Alignment (Matching Provided Design Specs)

The mobile application implements the visual system from the provided design guidelines:

1. **Dark Member Dashboard** (Image 1 Left)
   - Charcoal background (`#0c0d0e` / `#121214`)
   - Signature **Vibrant Lime** (`#bbf451`) hero accents
   - Top profile header with greeting & notification badge
   - **Daily Challenge Hero Card** with stacked member avatars
   - **Week Calendar Strip** (Mon 22 – Sun 28, active day highlighted in lime)
   - **Daily Program Filter Pills** (`All Type`, `Chest`, `Arms`, `Cardio`, `Yoga`)
   - Program cards (`Chest Program 12 min`, `Arms Program 10 min`)

2. **FITPULSE Studio Attendance & Check-In** (Image 2 Left)
   - Crimson/Coral gradient container (`#f43f5e`)
   - Dynamic QR Check-In / Check-Out button
   - Live workout duration timer
   - **Stoßzeiten (Peak Hours Timeline)** with daily attendance distribution
   - Real-time studio capacity gauge: `Live: Nicht zu stark besucht`

3. **Active Workout & Exercise Interface** (Image 2 Right)
   - **1 Pull-Ups** exercise screen
   - Live stopwatch timer (`04:50:05`) with pause/play toggle
   - Numbered posture cue badges (1 & 2) for strict biomechanical form
   - Set-by-set rep and weight logger table with completion status

4. **Multi-Role Experience in One Binary**
   - **Member**: Personal workouts, progress tracking, attendance check-in
   - **Trainer**: Assigned client roster, client attendance, program assignments
   - **Admin**: Revenue metrics, member status, Cloudflare Free-Tier quota monitor

---

## ⚡ Cloudflare Free-Tier Optimization

Designed and verified to operate inside Cloudflare's free limits:
- **Workers**: < 10ms execution time per request (100,000 free req/day)
- **D1 Database**: Indexed queries with zero N+1 lookups (5,000,000 free reads/day, 100,000 writes/day, 500MB storage)
- **KV Namespace**: Static gym settings and categories cached with 1h–24h TTL (100,000 reads/day)
- **R2 Storage**: Zero egress fees, presigned uploads and authenticated media streams (10GB free)
- **Scheduled Cron**: Idempotent single daily run (`0 0 * * *`)

---

## 🗄 Cloudflare D1 Database Schema (23 Tables)

All tables include UUID primary keys, foreign key constraints, `gym_id` multi-tenant boundaries, and performance indexes:

1. `gym_settings`
2. `roles`
3. `users`
4. `user_roles`
5. `trainer_profiles`
6. `member_profiles`
7. `trainer_member_assignments`
8. `membership_plans`
9. `member_subscriptions`
10. `payments`
11. `payment_receipts`
12. `attendance`
13. `exercise_categories`
14. `exercises`
15. `workout_plans`
16. `workout_plan_days`
17. `workout_plan_exercises`
18. `workout_sessions`
19. `workout_exercise_logs`
20. `fitness_measurements`
21. `notifications`
22. `audit_logs`
23. `refresh_tokens`

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Local D1 Database Migrations & Seeds
```bash
npx wrangler d1 migrations apply gym-management-db --local
```

### 3. Start Cloudflare Worker (Local Serverless Runtime)
```bash
npm run worker:dev
```
The Worker starts at `http://localhost:8787`.

### 4. Start the Mobile Application
```bash
npm run mobile:start
```
- Press `w` to open in browser (Web)
- Press `a` for Android Emulator
- Press `i` for iOS Simulator

---

## 🔑 Test Accounts (Ready for Evaluation)

| Role | Email | Password | Features |
|---|---|---|---|
| **Member** | `member@gym.com` | `Password123!` | Dark Member Dashboard, Workout Logger, QR Check-In |
| **Trainer** | `trainer@gym.com` | `Password123!` | Assigned Clients, Workout Builder, Attendance View |
| **Admin** | `admin@gym.com` | `Password123!` | Revenue Metrics, Free-Tier Monitor, Reception QR |

*Tip: In the mobile app, tap the top role badge (`MEMBER` / `TRAINER` / `ADMIN`) to switch instantly between roles!*

---

## ☁️ Cloudflare Production Deployment

### 1. Log in to Cloudflare
```bash
npx wrangler login
```

### 2. Provision Free-Tier Cloudflare Resources
```bash
# Create D1 Database
npx wrangler d1 create gym-management-db

# Create R2 Media Bucket
npx wrangler r2 bucket create gym-management-files

# Create KV Cache Namespace
npx wrangler kv namespace create GYM_CACHE
```

### 3. Update `wrangler.jsonc`
Paste the generated `database_id` and KV `id` into `wrangler.jsonc`.

### 4. Apply Migrations to Remote D1
```bash
npx wrangler d1 migrations apply gym-management-db --remote
```

### 5. Deploy Worker to Cloudflare Global Edge
```bash
npx wrangler deploy
```

---

## 🧪 Verification Commands

```bash
# Typecheck mobile and worker packages
npm run typecheck

# Test worker dry-run production bundle
npx wrangler deploy --dry-run
```
