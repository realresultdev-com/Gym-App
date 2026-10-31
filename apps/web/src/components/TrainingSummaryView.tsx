import { useState } from 'react';

interface TrainingSummaryViewProps {
  onBack?: () => void;
  onCheckRanking?: () => void;
  onStartLesson?: (lessonTitle: string) => void;
}

export function TrainingSummaryView({
  onBack,
  onCheckRanking,
  onStartLesson,
}: TrainingSummaryViewProps) {
  const [mobileTab, setMobileTab] = useState<'SCHEDULE' | 'SUMMARY' | 'LESSONS'>('SCHEDULE');
  const [desktopLayout, setDesktopLayout] = useState<'PANORAMIC' | 'FOCUSED'>('PANORAMIC');
  const [friendsCompare, setFriendsCompare] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState(9);

  // -------------------------------------------------------------
  // SCREEN 1 CARD: TRAINING SUMMARY (LEFT DRIBBLE SCREEN)
  // -------------------------------------------------------------
  const renderSummaryCard = () => (
    <div className="bg-white rounded-[36px] p-6 sm:p-7 shadow-card-soft border border-white text-left relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Bar with Title and Avatar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black tracking-wider uppercase text-slate-400">
            TRAINING SUMMARY
          </span>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FF5A36] shadow-xs"
          />
        </div>

        {/* Wave Calorie Trend Curve */}
        <div className="my-3 py-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1 mb-1">
            <span>2,619 cal</span>
            <span className="text-slate-400">2,585 cal</span>
            <span className="text-[#FF5A36] font-black">2,762 cal</span>
          </div>
          {/* Smooth Spline Curve SVG */}
          <svg className="w-full h-14 text-[#FF5A36]" viewBox="0 0 300 60" fill="none">
            <path
              d="M0 35 C50 15, 100 45, 150 40 C200 35, 250 10, 300 15"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="300" cy="15" r="4.5" fill="#FF5A36" />
          </svg>
        </div>

        {/* Floating Steps Widget */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between mb-4 shadow-2xs">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">STEPS</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">+8%</span>
            </div>
            <span className="text-sm font-black text-slate-900 block mt-0.5">30,918 this week</span>
          </div>
          {/* Mini 5-Bar Steps Graphic */}
          <div className="flex items-end space-x-1 h-8">
            <div className="w-2 h-4 bg-orange-300 rounded-full" />
            <div className="w-2 h-6 bg-orange-400 rounded-full" />
            <div className="w-2 h-3 bg-orange-300 rounded-full" />
            <div className="w-2 h-7 bg-[#FF5A36] rounded-full" />
            <div className="w-2 h-5 bg-orange-300 rounded-full" />
          </div>
        </div>

        {/* Workout Photo Preview Card */}
        <div className="relative h-44 rounded-2xl overflow-hidden mb-4 shadow-sm">
          <img
            src="/workouts/full-body-power.jpg"
            alt="Workout Routine"
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-900 shadow-xs">
            Level 4 - 3Kg
          </span>
        </div>

        {/* Frosted Friends Slider Switch */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between mb-5">
          <span className="text-xs font-bold text-slate-600">
            38 friends in this program • Compare
          </span>
          <button
            type="button"
            onClick={() => setFriendsCompare(!friendsCompare)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              friendsCompare ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                friendsCompare ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Bottom Hero Metric: 2,762 CALORIES BURNED */}
        <div className="text-center pt-1 pb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Share Your Achievement with Friends
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 font-numeric tracking-tight">
              2,762
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-1">
            CALORIES BURNED THIS WEEK
          </p>
        </div>
      </div>

      {/* Purple Floating Podium Button: Check Your Ranking */}
      <div className="flex flex-col items-center justify-center mt-4 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCheckRanking}
          className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer mb-1.5"
        >
          <span className="text-xl">🏆</span>
        </button>
        <span className="text-xs font-bold text-indigo-700">Check Your Ranking</span>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SCREEN 2 CARD: TODAY WORKOUT SCHEDULE (CENTER DRIBBLE SCREEN)
  // -------------------------------------------------------------
  const renderScheduleCard = () => (
    <div className="space-y-4 text-left flex flex-col justify-between h-full">
      {/* Main Hero Card with Jump Rope / Outdoor Athlete */}
      <div className="relative w-full h-[360px] sm:h-[380px] rounded-[36px] overflow-hidden shadow-card-soft bg-slate-900">
        <img
          src="/workouts/burn-and-sweat.jpg"
          alt="Today Workout"
          className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

        {/* Top Back & Avatar Header inside Hero */}
        <div className="absolute top-5 inset-x-6 flex items-center justify-between z-10">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 font-bold shadow-md hover:bg-white transition cursor-pointer"
            >
              ‹
            </button>
          ) : (
            <div className="px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-black text-slate-900 shadow-xs">
              REAL FIT
            </div>
          )}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF5A36] shadow-md"
            />
          </div>
        </div>

        {/* Center All-Caps Hero Typography */}
        <div className="absolute bottom-6 left-6 right-6 text-left text-white">
          <span className="inline-block px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-[10px] font-black tracking-widest uppercase text-white mb-2">
            DAY 08
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] text-white">
            TODAY<br />
            WORKOUT<br />
            SCHEDULE
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-2">
            CASUAL PLAN
          </p>
        </div>
      </div>

      {/* Modern Light Card Container */}
      <div className="bg-white rounded-[36px] p-6 shadow-card-soft border border-white">
        {/* Active Jaydon Rosser Profile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D2D3] animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Active</span>
          </div>

          <div className="flex items-center space-x-2.5 text-right">
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Martin Vance
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block">
                Pro Member • 28 yrs
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
              alt="Jaydon"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
            />
          </div>
        </div>

        {/* 4-Box Health Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
              BLOOD PRESSURE
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-numeric mt-1 block">
              110 / 80 <span className="text-[10px] font-semibold text-slate-400">mmHg</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
              HEART RATE
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-numeric mt-1 block">
              129 <span className="text-[10px] font-semibold text-slate-400">bpm</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
              CARDIO FITNESS
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-numeric mt-1 block">
              37.8 <span className="text-[10px] font-semibold text-slate-400">VO2 max</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
              BODY FAT
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-numeric mt-1 block">
              25.5%
            </span>
          </div>
        </div>

        {/* Floating Dark Stats Widget */}
        <div className="mt-4 p-4 rounded-2xl bg-[#1B2138] text-white shadow-widget-floating flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block">
              WORKOUTS
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black tracking-tight text-white font-numeric">
                89
              </span>
              <span className="text-xs font-bold text-slate-400">Finished</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-full">
            3 finished this week
          </span>
        </div>

      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SCREEN 3 CARD: LESSONS & DIFFICULTY (RIGHT DRIBBLE SCREEN)
  // -------------------------------------------------------------
  const renderLessonsCard = () => (
    <div className="bg-white rounded-[36px] p-6 sm:p-7 shadow-card-soft border border-white text-left flex flex-col justify-between h-full">
      <div>
        {/* Top Header: WELL DONE! Cheyenne */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              WELL DONE!
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Cheyenne
            </h2>
          </div>
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200"
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shadow-xs"
          />
        </div>

        {/* Glowing Segmented Progress Bar: Better Than 95% Active Users */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 mb-5 shadow-2xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-base">🏃</span>
            <div className="flex-1 flex space-x-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < 8 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/40' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="text-slate-400">BENCHMARK</span>
            <span className="text-emerald-600 font-extrabold">95% ACTIVE USERS</span>
          </div>
        </div>

        {/* Floating Recipe Card */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between mb-5 shadow-2xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">
              TODAY RECIPE
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              High-Protein Smoothie Bowl
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Saved by 526 trainers
            </span>
          </div>
          <span className="text-2xl">🥗</span>
        </div>

        {/* Stacked Layered Cards (LESSON 23: Plank Exercise II) */}
        <div className="relative pt-1 pb-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-card-soft border border-slate-100 hover:border-indigo-100 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                  LESSON 23
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  Plank Exercise II
                </h3>
                <span className="text-xs font-bold text-slate-400 block mt-0.5">
                  66 workouts
                </span>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                  A commonly seen exercise, plank helps build strength in the core, shoulders, arms and legs.
                </p>
                <button
                  type="button"
                  onClick={() => onStartLesson && onStartLesson('Plank Exercise II')}
                  className="mt-3 text-xs font-black text-[#FF5A36] hover:underline cursor-pointer inline-flex items-center space-x-1"
                >
                  <span>Get Started</span>
                  <span>→</span>
                </button>
              </div>
              <img
                src="/workouts/morning-flow.jpg"
                alt="Plank exercise"
                className="w-20 h-20 rounded-2xl object-cover shadow-sm flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Difficulty Slider: Level 9 */}
      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 mt-2">
        <div className="flex items-center justify-between text-xs font-black mb-2">
          <span className="text-slate-900">Level {difficultyLevel}</span>
          <span className="text-slate-400 uppercase text-[10px]">Select Difficulty</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={difficultyLevel}
          onChange={(e) => setDifficultyLevel(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#EEF3F9] pb-24 text-slate-900 font-sans select-none">
      
      {/* ========================================================
          DESKTOP VIEW HEADER CONTROLS (lg: and above)
      ======================================================== */}
      <div className="hidden lg:flex items-center justify-between mb-6 px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Athlete Studio Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Full-Screen Responsive Overview • Dribbble Fitness Architecture
          </p>
        </div>

        {/* View Toggle on Desktop */}
        <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl border border-slate-300/60 shadow-xs">
          <button
            type="button"
            onClick={() => setDesktopLayout('PANORAMIC')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              desktopLayout === 'PANORAMIC'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌐</span>
            <span>Panoramic 3-Column Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopLayout('FOCUSED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              desktopLayout === 'FOCUSED'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎯</span>
            <span>Focused Screen</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          DESKTOP: PANORAMIC 3-COLUMN SHOWCASE (Full Width Grid)
      ======================================================== */}
      {desktopLayout === 'PANORAMIC' ? (
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 items-stretch w-full animate-in fade-in duration-300">
          {/* Column 1: Summary & Trends */}
          <div className="w-full">{renderSummaryCard()}</div>
          {/* Column 2: Today Schedule & Metrics */}
          <div className="w-full">{renderScheduleCard()}</div>
          {/* Column 3: Lessons & Rank */}
          <div className="w-full">{renderLessonsCard()}</div>
        </div>
      ) : (
        /* DESKTOP FOCUSED MODE */
        <div className="hidden lg:block w-full max-w-xl mx-auto animate-in fade-in duration-300">
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#E2E8F0] border border-slate-200/80 shadow-xs mb-6">
            <button
              type="button"
              onClick={() => setMobileTab('SCHEDULE')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer ${
                mobileTab === 'SCHEDULE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Today Schedule
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('SUMMARY')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer ${
                mobileTab === 'SUMMARY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('LESSONS')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer ${
                mobileTab === 'LESSONS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Lessons & Rank
            </button>
          </div>

          {mobileTab === 'SCHEDULE' && renderScheduleCard()}
          {mobileTab === 'SUMMARY' && renderSummaryCard()}
          {mobileTab === 'LESSONS' && renderLessonsCard()}
        </div>
      )}

      {/* ========================================================
          MOBILE / TABLET VIEW (< lg screens)
      ======================================================== */}
      <div className="block lg:hidden w-full max-w-md mx-auto">
        {/* Mobile Tab Switcher */}
        <div className="px-2 pt-1 pb-3">
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#E2E8F0] border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTab('SCHEDULE')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mobileTab === 'SCHEDULE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today Schedule
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('SUMMARY')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mobileTab === 'SUMMARY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('LESSONS')}
              className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mobileTab === 'LESSONS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Lessons & Rank
            </button>
          </div>
        </div>

        {/* Mobile Screen Output */}
        <div className="px-2">
          {mobileTab === 'SCHEDULE' && renderScheduleCard()}
          {mobileTab === 'SUMMARY' && renderSummaryCard()}
          {mobileTab === 'LESSONS' && renderLessonsCard()}
        </div>
      </div>

    </div>
  );
}
