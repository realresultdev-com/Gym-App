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
    <div className="min-h-screen bg-white text-slate-900 flex justify-center selection:bg-amber-400 selection:text-black">
      {/* Mobile-Inspired Web Frame */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl border-x border-slate-100 relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img
              src={
                role === 'MEMBER'
                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
                  : role === 'TRAINER'
                  ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
                  : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
              }
              alt="Avatar"
              className="w-11 h-11 rounded-full border border-slate-200 object-cover"
            />
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">
                {role === 'MEMBER' ? 'Hello, Martin' : role === 'TRAINER' ? 'Coach Alex' : 'Admin Sarah'}
              </h1>
              <p className="text-xs font-semibold text-slate-500">Today, 25 Jan</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Role Switcher Pill */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className={`px-3 py-1 rounded-full text-xs font-black border transition-all cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : role === 'TRAINER'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-lime-50 text-lime-800 border-lime-300'
              }`}
            >
              {role}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => alert('No pending payment reminders or alerts.')}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 transition"
            >
              <span className="text-base">🔔</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-lime-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto">
          {/* =========================================
              ROLE 1: ADMIN DASHBOARD
          ========================================== */}
          {role === 'ADMIN' ? (
            <div className="p-5 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Admin Command Center</h2>
                <p className="text-xs font-semibold text-slate-500">Cloudflare Serverless Management</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Active Members</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">120</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 14% this month</p>
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Active Subscriptions</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">98</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">98% Retention</p>
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Today Check-Ins</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">42</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">Peak: 18:00 - 20:00</p>
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">Monthly Revenue</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">$8,450</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">All-Access & Pro</p>
                </div>
              </div>

              {/* Cloudflare Free Tier Optimization Health */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>⚡</span>
                    <h3 className="text-sm font-black text-slate-900">Cloudflare Free-Tier Health</h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    100% Free Tier
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Edge compute runs inside Cloudflare Workers. Relational data is indexed in D1 SQLite with KV caching.
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Workers Daily Requests</span>
                      <span className="text-slate-800 font-mono font-bold">&lt; 1% of 100,000</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 rounded-full w-[2%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">D1 SQLite Storage</span>
                      <span className="text-slate-800 font-mono font-bold">&lt; 1MB of 500MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[1%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-900">Quick Management</h3>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50" onClick={() => alert('Dynamic 120s rotating front-desk QR token generated!')}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎟</span>
                    <div>
                      <p className="text-xs font-black text-slate-900">Generate Reception QR Code</p>
                      <p className="text-[10px] text-slate-500 font-semibold">120s rotating front-desk dynamic token</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">→</span>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50" onClick={() => alert('Gym announcement broadcasted to all active members!')}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📢</span>
                    <div>
                      <p className="text-xs font-black text-slate-900">Send Gym Broadcast</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Instant notification to all active members</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">→</span>
                </div>
              </div>
            </div>
          ) : role === 'TRAINER' ? (
            /* =========================================
                ROLE 2: TRAINER DASHBOARD
            ========================================== */
            <div className="p-5 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Trainer Studio</h2>
                <p className="text-xs font-semibold text-slate-500">Coach Alex Hunter • Certified CSCS</p>
              </div>

              {/* Summary Banner */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">Assigned Athletes</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">1</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">All programs active</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl">
                  💪
                </div>
              </div>

              {/* Assigned Athletes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">My Assigned Members</h3>
                  <span className="text-xs font-semibold text-slate-500">Active Roster</span>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                      alt="Martin Vance"
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">Martin Vance</p>
                      <p className="text-xs font-semibold text-slate-500">Quarterly Pro Athlete</p>
                      <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                        Goal: Build lean muscle and core stability
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => alert("Reviewing Martin Vance's workout progress")}
                      className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => alert('Custom workout builder opened for Martin Vance')}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition cursor-pointer"
                    >
                      Assign Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================
                ROLE 3: MEMBER DASHBOARD
            ========================================== */
            <div>
              {activeTab === 'home' && (
                <div className="space-y-4">
                  {/* Hero Challenge Card (Matching Image 1 Right) */}
                  <div
                    onClick={() => setActiveTab('workout')}
                    className="mx-5 my-3 rounded-3xl p-5 relative overflow-hidden shadow-lg shadow-amber-500/20 cursor-pointer"
                    style={{ backgroundColor: '#fbbf24' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-black/80 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        Today
                      </span>
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm">
                        🔖
                      </div>
                    </div>

                    <div className="max-w-[65%] mt-1">
                      <h2 className="text-2xl font-black text-black leading-7 tracking-tight">
                        Full Body<br />Challenge
                      </h2>
                      <p className="text-xs font-bold text-neutral-900 mt-1.5 mb-4">
                        Complete daily program • 35 min
                      </p>

                      {/* Stacked Member Avatars */}
                      <div className="flex items-center -space-x-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <div className="w-7 h-7 rounded-full bg-black/80 flex items-center justify-center border-2 border-white text-white text-[10px] font-bold">
                          +12
                        </div>
                      </div>
                    </div>

                    <img
                      src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400"
                      className="absolute -right-3 -bottom-5 w-36 h-44 rounded-2xl object-cover pointer-events-none"
                    />
                  </div>

                  {/* 12 Days Streak Card (Image 1 Right) */}
                  <div className="mx-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-300 text-xs font-bold text-emerald-700">
                        ⚡
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">12 Days Active Streak</p>
                        <p className="text-[11px] font-semibold text-slate-500">Keep it up! 3 days to gold badge</p>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-sm">›</span>
                  </div>

                  {/* Weekday Strip */}
                  <div className="px-5 flex items-center justify-between overflow-x-auto space-x-2 pb-1">
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
                          className={`w-12 py-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {item.day}
                          </span>
                          <span className="text-sm font-black mt-1">{item.date}</span>
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-amber-400' : 'bg-transparent'}`}></span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Daily Program Header & Pills */}
                  <div className="px-5 pt-2 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Daily Program</h3>
                    <span className="text-xs font-bold text-slate-400 cursor-pointer">See All</span>
                  </div>

                  <div className="px-5 flex items-center space-x-2 overflow-x-auto pb-1">
                    {['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-black border transition cursor-pointer shrink-0 ${
                          cat === selectedCategory
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Horizontal Program Cards */}
                  <div className="px-5 flex items-center space-x-3.5 overflow-x-auto pb-2">
                    <div
                      onClick={() => setActiveTab('workout')}
                      className="w-44 rounded-3xl bg-white p-3 border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:shadow-md transition"
                    >
                      <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                        <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                            <span className="text-slate-900 text-xs ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-900 font-black text-sm truncate">Chest Program</p>
                      <p className="text-slate-500 text-[11px] font-semibold truncate mb-2.5">Focus on proper form</p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">⏱ 12 min</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">3 x 16 reps</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('workout')}
                      className="w-44 rounded-3xl bg-white p-3 border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:shadow-md transition"
                    >
                      <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                        <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                            <span className="text-slate-900 text-xs ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-900 font-black text-sm truncate">Arms Program</p>
                      <p className="text-slate-500 text-[11px] font-semibold truncate mb-2.5">Progressive overload</p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">⏱ 10 min</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">3 x 12 reps</span>
                      </div>
                    </div>
                  </div>

                  {/* FITPULSE Studio Check-In Card (Image 2 Left) */}
                  <div
                    className="mx-5 p-5 rounded-3xl shadow-md transition-all relative overflow-hidden"
                    style={{ backgroundColor: isCheckedIn ? '#ffffff' : '#f43f5e' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${isCheckedIn ? 'bg-slate-100' : 'bg-white/20'}`}>
                        📱
                      </div>
                      {isCheckedIn ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Session Active</span>
                        </div>
                      ) : (
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          FITPULSE Studio
                        </span>
                      )}
                    </div>

                    <h3 className={`text-2xl font-black tracking-tight ${isCheckedIn ? 'text-slate-900' : 'text-white'}`}>
                      {isCheckedIn ? 'Checked In' : 'Studio Check-In'}
                    </h3>
                    <p className={`text-xs font-semibold mt-1 mb-5 ${isCheckedIn ? 'text-slate-500' : 'text-white/90'}`}>
                      {isCheckedIn
                        ? `Workout duration: ${formatCheckInDuration(checkInSeconds)}`
                        : 'Schnell einchecken und Training starten'}
                    </p>

                    <button
                      onClick={() => setIsCheckedIn(!isCheckedIn)}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-sm transition cursor-pointer ${
                        isCheckedIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {isCheckedIn ? 'Session Beenden / Check-Out' : 'QR Check-In öffnen'}
                    </button>
                  </div>

                  {/* Peak Hours Timeline (Stoßzeiten) */}
                  <div className="mx-5 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900">Stoßzeiten</h4>
                      <span className="text-xs font-semibold text-slate-400">Peak Hours</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPeakDay(d)}
                          className={`w-9 h-9 rounded-full text-[11px] font-black transition cursor-pointer ${
                            d === peakDay
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-slate-800 flex-1">Live: Nicht zu stark besucht</span>
                      <span className="font-mono font-bold text-slate-500">14 / 120 (12%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Workout Tab (Image 2 Right: 1 Pull-Ups, Timer, Posture Cues, Set Logger) */}
              {activeTab === 'workout' && (
                <div className="p-5 space-y-4">
                  {/* Hero Image with Overlays */}
                  <div className="h-64 w-full rounded-3xl overflow-hidden bg-slate-100 relative border border-slate-200 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-black text-slate-900">
                      Quick Exercise
                    </div>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="absolute bottom-4 left-4 bg-white/95 px-4 py-2 rounded-2xl border border-slate-200 flex items-center space-x-2 shadow-md cursor-pointer hover:bg-white transition"
                    >
                      <span className="text-amber-500 text-xs font-bold">{isTimerRunning ? '⏸' : '▶'}</span>
                      <span className="text-slate-900 text-sm font-mono font-black tracking-wider">
                        ⏱ {formatTimer(workoutTimer)}
                      </span>
                    </button>
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">1 Pull-Ups</h2>
                      <p className="text-xs font-bold text-slate-500">Target: Latissimus Dorsi & Biceps</p>
                    </div>
                    <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-xs font-black text-slate-900">
                      Set 3 of 4
                    </span>
                  </div>

                  {/* Form Cues (Badges 1 and 2 from Image 2) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Posture & Form Cues</h3>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        1
                      </span>
                      <p className="text-xs font-bold text-slate-700 leading-4">
                        Grip the bar: Hold the pull-up bar with an overhand grip, shoulder-width apart.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        2
                      </span>
                      <p className="text-xs font-bold text-slate-700 leading-4">
                        Hang with control: Start off the ground with your arms fully extended.
                      </p>
                    </div>
                  </div>

                  {/* Set Performance Table */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex justify-between pb-2 border-b border-slate-100 px-2 text-xs font-black text-slate-400">
                      <span className="w-12">SET</span>
                      <span className="w-16 text-center">REPS</span>
                      <span className="w-20 text-center">WEIGHT</span>
                      <span className="w-16 text-right">STATUS</span>
                    </div>

                    {sets.map((s, idx) => (
                      <div key={s.set} className="flex items-center justify-between py-2 px-2 border-b border-slate-50 text-xs">
                        <span className="w-12 font-black text-slate-900">#{s.set}</span>
                        <span className="w-16 text-center font-bold text-slate-700">{s.reps} reps</span>
                        <span className="w-20 text-center font-bold text-slate-700">{s.weight}</span>
                        <button
                          onClick={() => toggleSetCompleted(idx)}
                          className={`w-16 py-1 rounded-lg font-black text-[11px] text-center cursor-pointer transition ${
                            s.completed
                              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {s.completed ? '✓ Done' : 'Log'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      alert('Workout session finished! Great job!');
                      setActiveTab('home');
                    }}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    Complete Workout
                  </button>
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="p-5 space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Studio Attendance</h2>
                  {/* Reuse check-in card and peak hours */}
                  <div
                    className="p-5 rounded-3xl shadow-md transition-all relative overflow-hidden"
                    style={{ backgroundColor: isCheckedIn ? '#ffffff' : '#f43f5e' }}
                  >
                    <h3 className={`text-2xl font-black tracking-tight ${isCheckedIn ? 'text-slate-900' : 'text-white'}`}>
                      {isCheckedIn ? 'Checked In' : 'Studio Check-In'}
                    </h3>
                    <p className={`text-xs font-semibold mt-1 mb-5 ${isCheckedIn ? 'text-slate-500' : 'text-white/90'}`}>
                      {isCheckedIn
                        ? `Workout duration: ${formatCheckInDuration(checkInSeconds)}`
                        : 'Schnell einchecken und Training starten'}
                    </p>
                    <button
                      onClick={() => setIsCheckedIn(!isCheckedIn)}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-sm transition cursor-pointer ${
                        isCheckedIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-slate-900 hover:bg-slate-50'
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

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex items-center justify-around z-20 shadow-md">
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

        {/* Role Switcher Modal */}
        {roleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-md bg-white rounded-t-3xl p-6 border-t border-slate-200 shadow-2xl space-y-4 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Switch Role / User</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Active role: <span className="text-slate-900 font-bold">{role}</span>
                  </p>
                </div>
                <button onClick={() => setRoleModalOpen(false)} className="text-slate-400 font-bold text-lg p-2 cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                <div
                  onClick={() => { setRole('MEMBER'); setRoleModalOpen(false); }}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition ${
                    role === 'MEMBER' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">🏋️</span>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${role === 'MEMBER' ? 'text-white' : 'text-slate-900'}`}>
                      Martin Vance (Member)
                    </p>
                    <p className={`text-xs ${role === 'MEMBER' ? 'text-slate-300' : 'text-slate-500'}`}>
                      White Dashboard, Challenge, Exercise Tracking, Check-In
                    </p>
                  </div>
                  {role === 'MEMBER' && <span className="text-amber-400 font-black">✓</span>}
                </div>

                <div
                  onClick={() => { setRole('TRAINER'); setRoleModalOpen(false); }}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition ${
                    role === 'TRAINER' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">💪</span>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${role === 'TRAINER' ? 'text-white' : 'text-slate-900'}`}>
                      Alex Hunter (Trainer)
                    </p>
                    <p className={`text-xs ${role === 'TRAINER' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Assigned clients, workout plan assignment, athlete attendance
                    </p>
                  </div>
                  {role === 'TRAINER' && <span className="text-amber-400 font-black">✓</span>}
                </div>

                <div
                  onClick={() => { setRole('ADMIN'); setRoleModalOpen(false); }}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition ${
                    role === 'ADMIN' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">👑</span>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${role === 'ADMIN' ? 'text-white' : 'text-slate-900'}`}>
                      Sarah Connor (Admin)
                    </p>
                    <p className={`text-xs ${role === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Revenue, Cloudflare Free-Tier monitor, members & reception QR
                    </p>
                  </div>
                  {role === 'ADMIN' && <span className="text-amber-400 font-black">✓</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
