import { useState, useEffect } from 'react';

type UserRole = 'MEMBER' | 'TRAINER' | 'ADMIN';

export default function App() {
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'attendance' | 'admin'>('home');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All Type');
  const [peakDay, setPeakDay] = useState('DO');

  // Attendance Check-In State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInSeconds, setCheckInSeconds] = useState(0);

  // Workout Tracker State
  const [workoutTimer, setWorkoutTimer] = useState(17405); // 04:50:05
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [sets, setSets] = useState([
    { set: 1, reps: 10, weight: 'Bodyweight', completed: true },
    { set: 2, reps: 10, weight: 'Bodyweight', completed: true },
    { set: 3, reps: 8, weight: 'Bodyweight', completed: false },
    { set: 4, reps: 8, weight: 'Bodyweight', completed: false },
  ]);

  // Worker Edge Telemetry
  const [workerLatency, setWorkerLatency] = useState<number | null>(null);
  const [workerStatus, setWorkerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const start = performance.now();
    fetch('https://gym-management-worker.pkaakash007.workers.dev/api/health')
      .then((res) => {
        if (res.ok) {
          setWorkerLatency(Math.round(performance.now() - start));
          setWorkerStatus('online');
        } else {
          setWorkerStatus('offline');
        }
      })
      .catch(() => setWorkerStatus('offline'));
  }, []);

  // Timers
  useEffect(() => {
    let interval: any;
    if (isCheckedIn) {
      interval = setInterval(() => setCheckInSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setWorkoutTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCheckInDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSetCompleted = (index: number) => {
    setSets((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-amber-400 selection:text-black">
      
      {/* =========================================================
          FULL-WIDTH RESPONSIVE NAVIGATION HEADER
      ========================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-400/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900">FITPULSE</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                  STUDIO
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500">
                <span className={`w-2 h-2 rounded-full ${workerStatus === 'online' ? 'bg-emerald-500 animate-pulse' : workerStatus === 'checking' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
                <span>{workerStatus === 'online' ? `Edge API Online (${workerLatency}ms)` : workerStatus === 'checking' ? 'Connecting to Edge...' : 'Edge Offline'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on Tablet & Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'workout'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🏋️</span>
              <span>Workout Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>📱</span>
              <span>Check-In</span>
            </button>

            {role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>👑</span>
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher Pill */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
                role === 'ADMIN'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : role === 'TRAINER'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
              }`}
            >
              <span>{role === 'ADMIN' ? '👑' : role === 'TRAINER' ? '💪' : '🏋️'}</span>
              <span>{role}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => alert('Notifications: All membership payments are up to date. No pending alerts.')}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative cursor-pointer hover:bg-slate-200 transition"
              title="Notifications"
            >
              <span className="text-base">🔔</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-lime-500 ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar & Greeting */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 cursor-pointer" onClick={() => setRoleModalOpen(true)}>
              <img
                src={
                  role === 'MEMBER'
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
                    : role === 'TRAINER'
                    ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
                    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
                }
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {role === 'MEMBER' ? 'Martin Vance' : role === 'TRAINER' ? 'Alex Hunter' : 'Sarah Connor'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {role === 'MEMBER' ? 'All-Access VIP' : role === 'TRAINER' ? 'Head Coach' : 'Gym Director'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN RESPONSIVE CONTENT CONTAINER
      ========================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">

        {/* =========================================================
            VIEW 1: ADMIN COMMAND CENTER
        ========================================================== */}
        {role === 'ADMIN' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Command Center</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Full-tier Cloudflare Workers edge serverless management & live analytics.
              </p>
            </div>

            {/* Metrics Overview Grid (Full-width 4 columns on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Members</p>
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">👥</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">120</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">↑ 14% vs last month</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Plans</p>
                  <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">📋</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">98</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">98% Retention Rate</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Today Check-Ins</p>
                  <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">📱</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">42</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Peak: 18:00 - 20:00</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">💰</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">$8,450</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">100% on Cloudflare D1</p>
              </div>
            </div>

            {/* Cloudflare Free Tier Optimization Health Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Cloudflare Free-Tier Quota Monitor</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Real-time edge compute & storage telemetry (Zero server hosting fees)
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full w-fit">
                  ✓ 100% Free-Tier Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>Workers Daily Requests</span>
                    <span className="font-mono text-slate-900 font-black">&lt; 1% of 100k</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full w-[2%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>D1 SQLite Database Storage</span>
                    <span className="font-mono text-slate-900 font-black">&lt; 1MB of 500MB</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[1%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>KV Cache Hit Ratio</span>
                    <span className="font-mono text-slate-900 font-black">99.4% (Fast Edge)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[99%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => alert('Dynamic 120-second rotating reception QR code token generated and verified!')}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-bold">
                    🎟
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Generate Dynamic Reception QR Code</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Rotates every 120s with cryptographic HMAC token signature
                    </p>
                  </div>
                </div>
                <span className="text-lg text-slate-400 font-bold">→</span>
              </div>

              <div
                onClick={() => alert('Gym announcement broadcasted to all active members via Cloudflare D1!')}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
                    📢
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Send Gym-Wide Broadcast Alert</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Delivers instant in-app notification to all active gym members
                    </p>
                  </div>
                </div>
                <span className="text-lg text-slate-400 font-bold">→</span>
              </div>
            </div>
          </div>
        ) : role === 'TRAINER' ? (
          /* =========================================================
              VIEW 2: TRAINER STUDIO
          ========================================================== */
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trainer Studio</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Coach Alex Hunter • Certified Strength & Conditioning Specialist (CSCS)
              </p>
            </div>

            {/* Trainer Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl">
                  💪
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Assigned Athlete Roster</h3>
                  <p className="text-xs font-semibold text-slate-500">1 Assigned Athlete • Upper Body Hypertrophy Focus</p>
                  <p className="text-xs font-black text-emerald-600 mt-1">✓ All workout plans verified</p>
                </div>
              </div>
              <button
                onClick={() => alert('New program template builder launched')}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition cursor-pointer shadow-md"
              >
                + Create Plan Template
              </button>
            </div>

            {/* Athlete Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                    alt="Martin Vance"
                    className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                  <div>
                    <h4 className="text-base font-black text-slate-900">Martin Vance</h4>
                    <p className="text-xs font-semibold text-slate-500">Quarterly Pro Athlete Plan</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Active Member
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold space-y-1">
                  <p className="text-slate-500">Fitness Goal:</p>
                  <p className="text-slate-900 font-black">Build lean muscle and core stability</p>
                  <p className="text-indigo-600 font-bold mt-1">Height: 182cm • Target: 78kg</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => alert("Viewing Martin Vance's attendance & measurement history")}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => alert('Custom workout builder opened for Martin Vance')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-sm"
                  >
                    Assign Workout
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
              VIEW 3: MEMBER DASHBOARD (EXPANSIVE 2-COLUMN DESKTOP GRID)
          ========================================================== */
          <div>
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ----------------------------------------------------
                    LEFT / MAIN COLUMN (8 of 12 columns on desktop)
                ----------------------------------------------------- */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Hero Challenge Banner (Image 1 Right Style) */}
                  <div
                    onClick={() => setActiveTab('workout')}
                    className="w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-amber-400/20 cursor-pointer transition-transform hover:scale-[1.008]"
                    style={{ backgroundColor: '#fbbf24' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-slate-950 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                        Today's Focus
                      </span>
                      <div className="w-9 h-9 rounded-full bg-slate-950/15 flex items-center justify-center text-base">
                        🔖
                      </div>
                    </div>

                    <div className="max-w-[70%] sm:max-w-[60%]">
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight tracking-tight">
                        Full Body Challenge
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-6">
                        Complete your scheduled program before 09:00 AM • 35 min
                      </p>

                      {/* Stacked Member Avatars */}
                      <div className="flex items-center -space-x-2.5">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center border-2 border-white text-xs font-black">
                          +12
                        </div>
                        <span className="pl-4 text-xs font-black text-slate-900">Members active now</span>
                      </div>
                    </div>

                    <img
                      src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400"
                      className="absolute -right-2 sm:right-6 -bottom-6 w-44 sm:w-56 h-56 sm:h-72 object-cover pointer-events-none opacity-95"
                    />
                  </div>

                  {/* 12 Days Streak Card (Image 1 Right) */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-300 text-lg font-bold text-emerald-700">
                        ⚡
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">12 Days Active Streak</p>
                        <p className="text-xs font-semibold text-slate-500">You're in the top 5% of consistent members this month!</p>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-lg hidden sm:block">›</span>
                  </div>

                  {/* Weekday Strip */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">Weekly Schedule</h3>
                      <span className="text-xs font-semibold text-slate-500">October 2026</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { day: 'Mon', date: 22 },
                        { day: 'Tue', date: 23 },
                        { day: 'Wed', date: 24 },
                        { day: 'Thu', date: 25 },
                        { day: 'Fri', date: 26 },
                        { day: 'Sat', date: 27 },
                        { day: 'Sun', date: 28 },
                      ].map((item) => {
                        const isSelected = item.date === selectedDay;
                        return (
                          <button
                            key={item.date}
                            onClick={() => setSelectedDay(item.date)}
                            className={`py-3 sm:py-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {item.day}
                            </span>
                            <span className="text-sm sm:text-base font-black mt-1">{item.date}</span>
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-amber-400' : 'bg-transparent'}`}></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Programs Header & Filter Pills */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Program</h3>
                        <p className="text-xs font-semibold text-slate-500">Curated training routines for today</p>
                      </div>
                      <span className="text-xs font-black text-slate-400 hover:text-slate-900 cursor-pointer">
                        See All Programs →
                      </span>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      {['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga', 'Strength'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-black border transition cursor-pointer shrink-0 ${
                            cat === selectedCategory
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Responsive Grid of Program Cards (Adapts to screen width) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {/* Card 1 */}
                      <div
                        onClick={() => setActiveTab('workout')}
                        className="rounded-3xl bg-white p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                <span className="text-slate-900 text-sm ml-0.5">▶</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="text-slate-900 font-black text-base truncate">Chest Program</h4>
                          <p className="text-slate-500 text-xs font-semibold truncate mb-3">Focus on proper eccentric control</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">⏱ 12 min</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">3 x 16 reps</span>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div
                        onClick={() => setActiveTab('workout')}
                        className="rounded-3xl bg-white p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                <span className="text-slate-900 text-sm ml-0.5">▶</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="text-slate-900 font-black text-base truncate">Arms Hypertrophy</h4>
                          <p className="text-slate-500 text-xs font-semibold truncate mb-3">Progressive overload on biceps & triceps</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">⏱ 10 min</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">3 x 12 reps</span>
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div
                        onClick={() => setActiveTab('workout')}
                        className="rounded-3xl bg-white p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between sm:col-span-2 xl:col-span-1"
                      >
                        <div>
                          <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                <span className="text-slate-900 text-sm ml-0.5">▶</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="text-slate-900 font-black text-base truncate">Pull-Up Mastery</h4>
                          <p className="text-slate-500 text-xs font-semibold truncate mb-3">Lat engagement & scapular stability</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">⏱ 15 min</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">4 x 10 reps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    RIGHT COLUMN / DESKTOP SIDE PANEL (4 of 12 columns)
                ----------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* FITPULSE Studio Check-In Card (Image 2 Left) */}
                  <div
                    className="p-6 rounded-3xl shadow-md transition-all relative overflow-hidden"
                    style={{ backgroundColor: isCheckedIn ? '#ffffff' : '#f43f5e' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                        isCheckedIn ? 'bg-slate-100 text-slate-900' : 'bg-white/20 text-white'
                      }`}>
                        📱
                      </div>
                      {isCheckedIn ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Session Active</span>
                        </div>
                      ) : (
                        <span className="bg-white/20 text-white text-[11px] font-black px-3 py-1 rounded-full">
                          FITPULSE Studio
                        </span>
                      )}
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isCheckedIn ? 'text-slate-900' : 'text-white'
                    }`}>
                      {isCheckedIn ? 'Checked In' : 'Studio Check-In'}
                    </h3>
                    <p className={`text-xs font-semibold mt-1 mb-6 ${
                      isCheckedIn ? 'text-slate-500' : 'text-white/90'
                    }`}>
                      {isCheckedIn
                        ? `Workout duration: ${formatCheckInDuration(checkInSeconds)}`
                        : 'Schnell einchecken und Training starten'}
                    </p>

                    <button
                      onClick={() => setIsCheckedIn(!isCheckedIn)}
                      className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition cursor-pointer ${
                        isCheckedIn
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isCheckedIn ? 'Session Beenden / Check-Out' : 'QR Check-In öffnen'}
                    </button>
                  </div>

                  {/* Stoßzeiten (Peak Hours Timeline from Image 2) */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Stoßzeiten</h4>
                        <p className="text-xs font-semibold text-slate-500">Peak Occupancy Forecast</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Live Sensor</span>
                    </div>

                    {/* Day selector pills */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPeakDay(d)}
                          className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                            d === peakDay
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    {/* Live Indicator */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-2.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-slate-800 flex-1">Live: Nicht zu stark besucht</span>
                      <span className="font-mono font-bold text-slate-500">14 / 120 (12%)</span>
                    </div>

                    {/* Hourly Distribution Visual Bars */}
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crowd Density Today</p>
                      <div className="flex items-end space-x-1.5 h-20 pt-4 px-1">
                        {[
                          { h: '06h', v: 20 },
                          { h: '09h', v: 45 },
                          { h: '12h', v: 35 },
                          { h: '15h', v: 50 },
                          { h: '18h', v: 85 }, // Peak
                          { h: '20h', v: 65 },
                          { h: '22h', v: 25 },
                        ].map((bar) => (
                          <div key={bar.h} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full rounded-t-lg transition-all ${
                                bar.v > 75 ? 'bg-red-400' : bar.v > 40 ? 'bg-amber-400' : 'bg-slate-300'
                              }`}
                              style={{ height: `${bar.v}%` }}
                            ></div>
                            <span className="text-[10px] font-bold text-slate-400">{bar.h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Member Profile Quick Card */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Membership Status</h4>
                    <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                      <span className="text-slate-500">Current Plan</span>
                      <span className="text-slate-900 font-black">Quarterly Pro Athlete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                      <span className="text-slate-500">Expires In</span>
                      <span className="text-emerald-700 font-black">75 Days (Jan 2027)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold py-1">
                      <span className="text-slate-500">Assigned Coach</span>
                      <span className="text-slate-900 font-black">Alex Hunter (CSCS)</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================
                WORKOUT TRACKER VIEW (Image 2 Right in Full-Screen Layout)
            ========================================================== */}
            {activeTab === 'workout' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Exercise Hero Image & Live Timer */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 relative border border-slate-200 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-black text-slate-900">
                      ⚡ Quick Exercise Active
                    </div>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="absolute bottom-5 left-5 bg-white/95 px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center space-x-2.5 shadow-lg cursor-pointer hover:bg-white transition"
                    >
                      <span className="text-amber-500 text-sm font-bold">{isTimerRunning ? '⏸' : '▶'}</span>
                      <span className="text-slate-900 text-base font-mono font-black tracking-wider">
                        ⏱ {formatTimer(workoutTimer)}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">1 Pull-Ups</h2>
                      <p className="text-sm font-bold text-slate-500 mt-0.5">Target: Latissimus Dorsi & Biceps</p>
                    </div>
                    <span className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black text-slate-900">
                      Set 3 of 4
                    </span>
                  </div>
                </div>

                {/* Right Side: Form Cues & Interactive Set Performance Table */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* Form Cues (Badges 1 and 2 from Image 2) */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Biomechanics & Form Cues</h3>
                    <div className="flex items-start space-x-3.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        1
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Grip the bar: Hold the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        2
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Hang with control: Start off the ground with your arms fully extended and scapulae retracted before driving upward.
                      </p>
                    </div>
                  </div>

                  {/* Set Performance Table */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between pb-2.5 border-b border-slate-100 px-2 text-xs font-black text-slate-400">
                      <span className="w-16">SET</span>
                      <span className="w-20 text-center">REPS</span>
                      <span className="w-24 text-center">WEIGHT</span>
                      <span className="w-20 text-right">ACTION</span>
                    </div>

                    {sets.map((s, idx) => (
                      <div key={s.set} className="flex items-center justify-between py-2.5 px-2 border-b border-slate-50 text-xs sm:text-sm">
                        <span className="w-16 font-black text-slate-900">Set #{s.set}</span>
                        <span className="w-20 text-center font-bold text-slate-700">{s.reps} reps</span>
                        <span className="w-24 text-center font-bold text-slate-700">{s.weight}</span>
                        <button
                          onClick={() => toggleSetCompleted(idx)}
                          className={`w-20 py-1.5 rounded-xl font-black text-xs text-center cursor-pointer transition ${
                            s.completed
                              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {s.completed ? '✓ Done' : 'Log Set'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Complete Workout Button */}
                  <button
                    onClick={() => {
                      alert('Workout session completed! Data synced to Cloudflare D1.');
                      setActiveTab('home');
                    }}
                    className="w-full py-4 rounded-2xl bg-slate-950 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    Finish Workout Session
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                STUDIO CHECK-IN TAB
            ========================================================== */}
            {activeTab === 'attendance' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Studio Attendance</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    Front-desk touchless check-in and occupancy status.
                  </p>
                </div>

                <div
                  className="p-8 rounded-3xl shadow-lg transition-all relative overflow-hidden"
                  style={{ backgroundColor: isCheckedIn ? '#ffffff' : '#f43f5e' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📱</span>
                    {isCheckedIn ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Session Active
                      </span>
                    ) : (
                      <span className="bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full">
                        Touchless Mobile Check-In
                      </span>
                    )}
                  </div>

                  <h3 className={`text-3xl font-black tracking-tight ${isCheckedIn ? 'text-slate-900' : 'text-white'}`}>
                    {isCheckedIn ? 'Currently Checked In' : 'Studio Check-In'}
                  </h3>
                  <p className={`text-sm font-semibold mt-1 mb-6 ${isCheckedIn ? 'text-slate-500' : 'text-white/90'}`}>
                    {isCheckedIn
                      ? `Active gym floor duration: ${formatCheckInDuration(checkInSeconds)}`
                      : 'Schnell einchecken und Training starten'}
                  </p>

                  <button
                    onClick={() => setIsCheckedIn(!isCheckedIn)}
                    className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition cursor-pointer ${
                      isCheckedIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {isCheckedIn ? 'Session Beenden / Check-Out' : 'QR Check-In öffnen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================
          MOBILE-ONLY BOTTOM NAVIGATION BAR (Hidden on md+ screens)
      ========================================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex items-center justify-around z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'home' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>🏠</span>
          {activeTab === 'home' && <span className="font-black text-xs">Home</span>}
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'workout' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>🏋️</span>
          {activeTab === 'workout' && <span className="font-black text-xs">Workout</span>}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'attendance' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>📱</span>
          {activeTab === 'attendance' && <span className="font-black text-xs">Check-In</span>}
        </button>

        <button
          onClick={() => setRoleModalOpen(true)}
          className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <span>👤</span>
        </button>
      </nav>

      {/* =========================================================
          ROLE SWITCHER MODAL
      ========================================================== */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Switch Application Role</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Currently active: <span className="text-slate-950 font-black">{role}</span>
                </p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => { setRole('MEMBER'); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  role === 'MEMBER'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">🏋️</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Martin Vance (Member View)</p>
                  <p className={`text-xs mt-0.5 ${role === 'MEMBER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Full Body Challenge, program cards, attendance QR check-in & workout logger.
                  </p>
                </div>
                {role === 'MEMBER' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>

              <div
                onClick={() => { setRole('TRAINER'); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  role === 'TRAINER'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">💪</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Alex Hunter (Trainer View)</p>
                  <p className={`text-xs mt-0.5 ${role === 'TRAINER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Assigned athletes roster, workout plan custom builder & athlete progress.
                  </p>
                </div>
                {role === 'TRAINER' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>

              <div
                onClick={() => { setRole('ADMIN'); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  role === 'ADMIN'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">👑</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Sarah Connor (Admin View)</p>
                  <p className={`text-xs mt-0.5 ${role === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Revenue metrics, reception dynamic QR generator & Cloudflare Free-Tier monitor.
                  </p>
                </div>
                {role === 'ADMIN' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
