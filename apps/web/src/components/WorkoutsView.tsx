import { useState } from 'react';
import { FOUNDATIONAL_EXERCISES } from '../data/exerciseGuides';
import { ExerciseGraphic } from './ExerciseGraphic';
import { TrainingSummaryView } from './TrainingSummaryView';

export interface WorkoutItem {
  id: string;
  tag: string;
  title: string;
  durationMin: number;
  caloriesKcal: number;
  category: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY';
  imageSrc: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialExerciseId?: string;
}

export const WORKOUT_ITEMS: WorkoutItem[] = [
  {
    id: 'w1',
    tag: 'ADVANCED STRENGTH',
    title: 'Full Body Power',
    durationMin: 45,
    caloriesKcal: 520,
    category: 'STRENGTH',
    imageSrc: '/workouts/full-body-power.jpg',
    difficulty: 'Advanced',
    initialExerciseId: 'ex-01-pushup',
  },
  {
    id: 'w2',
    tag: 'INTERMEDIATE HIIT',
    title: 'Burn & Sweat',
    durationMin: 20,
    caloriesKcal: 310,
    category: 'HIIT',
    imageSrc: '/workouts/burn-and-sweat.jpg',
    difficulty: 'Intermediate',
    initialExerciseId: 'ex-08-goblet-squat',
  },
  {
    id: 'w3',
    tag: 'BEGINNER FLOW',
    title: 'Morning Flow',
    durationMin: 15,
    caloriesKcal: 140,
    category: 'MOBILITY',
    imageSrc: '/workouts/morning-flow.jpg',
    difficulty: 'Beginner',
    initialExerciseId: 'ex-10-plank',
  },
];

interface WorkoutsViewProps {
  onSelectWorkout: (workout: WorkoutItem) => void;
  onSelectExercise: (exerciseId: string) => void;
}

export function WorkoutsView({ onSelectWorkout, onSelectExercise }: WorkoutsViewProps) {
  const [viewMode, setViewMode] = useState<'SCHEDULE' | 'LIBRARY'>('SCHEDULE');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'>('ALL');
  const [exerciseCategory, setExerciseCategory] = useState<'ALL' | 'Push' | 'Pull' | 'Legs & Core'>('ALL');

  const filteredWorkouts = activeCategory === 'ALL'
    ? WORKOUT_ITEMS
    : WORKOUT_ITEMS.filter((w) => w.category === activeCategory);

  const filteredExercises = exerciseCategory === 'ALL'
    ? FOUNDATIONAL_EXERCISES
    : FOUNDATIONAL_EXERCISES.filter((ex) => ex.category === exerciseCategory);

  const categories: Array<{ id: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'; label: string }> = [
    { id: 'ALL', label: 'ALL' },
    { id: 'STRENGTH', label: 'STRENGTH' },
    { id: 'HIIT', label: 'HIIT' },
    { id: 'MOBILITY', label: 'MOBILITY' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#EEF3F9] min-h-[640px] pb-16 flex flex-col antialiased">
      {/* Top Experience Switcher (Today Schedule / Summary vs Workout Library) */}
      <div className="px-4 sm:px-6 pt-3 pb-2">
        <div className="max-w-md mx-auto sm:max-w-lg lg:max-w-md grid grid-cols-2 p-1.5 rounded-2xl bg-[#E2E8F0] border border-slate-200/80 shadow-xs mb-3">
          <button
            type="button"
            onClick={() => setViewMode('SCHEDULE')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'SCHEDULE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📊 Today Schedule & Summary
          </button>
          <button
            type="button"
            onClick={() => setViewMode('LIBRARY')}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'LIBRARY'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🏋️ Programs & Exercise Guide
          </button>
        </div>
      </div>

      {viewMode === 'SCHEDULE' ? (
        <TrainingSummaryView
          onStartLesson={(_lesson) => {
            const ex = FOUNDATIONAL_EXERCISES.find((e) => e.name.toLowerCase().includes('plank')) || FOUNDATIONAL_EXERCISES[0];
            onSelectExercise(ex.id);
          }}
        />
      ) : (
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Title Header */}
          <div className="pt-1 pb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              Workout Library & Training Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Structured progressive programs and foundational exercise mastery
            </p>
          </div>

          {/* Category Pills Strip */}
          <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30'
                      : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Responsive Photographic Workout Cards Grid (1 col on mobile, 2 col on tablet, 3 col on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className="group relative w-full h-56 sm:h-60 rounded-[32px] overflow-hidden bg-slate-950 cursor-pointer shadow-card-soft hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 select-none"
              >
                {/* Background Image */}
                <img
                  src={workout.imageSrc}
                  alt={workout.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for razor-sharp typography */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent"
                />

                {/* Bottom Content */}
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  {/* Category Tag */}
                  <div className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1">
                    {workout.tag}
                  </div>

                  {/* Title */}
                  <div className="text-white text-2xl font-black tracking-tight mb-2 leading-none">
                    {workout.title}
                  </div>

                  {/* Meta Row: Duration & Calories */}
                  <div className="flex items-center space-x-4">
                    {/* Duration */}
                    <div className="flex items-center space-x-1.5 text-white text-xs font-bold tracking-wide">
                      <svg className="w-3.5 h-3.5 text-[#FF5A36] fill-current" viewBox="0 0 24 24">
                        <path d="M12 23c6.075 0 11-4.925 11-11 0-5.045-3.407-9.308-8.03-10.638a1 1 0 0 0-1.196 1.258c.277 1.05.426 2.15.426 3.28 0 2.209-.895 4.209-2.343 5.657A8.003 8.003 0 0 1 1 12c0 6.075 4.925 11 11 11z" />
                      </svg>
                      <span>{workout.durationMin} MIN</span>
                    </div>

                    {/* Calories */}
                    <div className="flex items-center space-x-1.5 text-white text-xs font-bold tracking-wide">
                      <svg className="w-3.5 h-3.5 text-[#FF5A36] fill-current" viewBox="0 0 24 24">
                        <path d="M12 23c6.075 0 11-4.925 11-11 0-5.045-3.407-9.308-8.03-10.638a1 1 0 0 0-1.196 1.258c.277 1.05.426 2.15.426 3.28 0 2.209-.895 4.209-2.343 5.657A8.003 8.003 0 0 1 1 12c0 6.075 4.925 11 11 11z" />
                      </svg>
                      <span>{workout.caloriesKcal} KCAL</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================
              EXERCISE MOVEMENTS DIRECTLY INSIDE WORKOUT
          ======================================================== */}
          <div className="mt-12 pt-6 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Foundational Exercise Movement Library
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                  10 core movements with animated form guides, muscle activations & set targets
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-black text-[#FF5A36] bg-[#FF5A36]/10 border border-[#FF5A36]/20 px-3.5 py-1 rounded-full">
                {FOUNDATIONAL_EXERCISES.length} Core Exercises
              </span>
            </div>

            {/* Exercise Category Selector */}
            <div className="flex items-center space-x-2 mb-5 overflow-x-auto no-scrollbar pb-1">
              {(['ALL', 'Push', 'Pull', 'Legs & Core'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExerciseCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    exerciseCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All (10)' : cat}
                </button>
              ))}
            </div>

            {/* Responsive Grid of Exercises (1 col on mobile, 2 col on tablet, 3-4 col on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => onSelectExercise(exercise.id)}
                  className="group p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-[#FF5A36]/60 shadow-2xs hover:shadow-card-soft transition-all duration-200 cursor-pointer flex items-center space-x-3.5"
                >
                  {/* Exercise Thumbnail Graphic */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform flex-shrink-0">
                    <ExerciseGraphic
                      slug={exercise.slug}
                      frame="START"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  {/* Title & Target Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {exercise.category}
                      </span>
                      <span className="text-[10px] font-bold text-[#FF5A36]">
                        {exercise.recommendedSetsReps}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#FF5A36] transition-colors truncate">
                      {exercise.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {exercise.targetMusclesPrimary.join(', ')}
                    </p>
                  </div>

                  <div className="text-slate-300 group-hover:text-[#FF5A36] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
