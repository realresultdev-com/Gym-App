import { useState } from 'react';

export interface WorkoutItem {
  id: string;
  tag: string;
  title: string;
  durationMin: number;
  caloriesKcal: number;
  category: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY';
  imageSrc: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
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
  },
];

interface WorkoutsViewProps {
  onSelectWorkout?: (workout: WorkoutItem) => void;
  onOpenExerciseGuide?: () => void;
}

export function WorkoutsView({ onSelectWorkout, onOpenExerciseGuide }: WorkoutsViewProps) {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'>('ALL');

  const filteredWorkouts = activeCategory === 'ALL'
    ? WORKOUT_ITEMS
    : WORKOUT_ITEMS.filter((w) => w.category === activeCategory);

  const categories: Array<{ id: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'; label: string }> = [
    { id: 'ALL', label: 'ALL' },
    { id: 'STRENGTH', label: 'STRENGTH' },
    { id: 'HIIT', label: 'HIIT' },
    { id: 'MOBILITY', label: 'MOBILITY' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-[640px] pb-12 flex flex-col">
      {/* Title Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
          Workouts
        </h1>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center space-x-2.5 overflow-x-auto px-5 mb-5 no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-[#FF5A36] text-white shadow-md shadow-[#FF5A36]/30'
                  : 'bg-white text-slate-800 border border-slate-100 hover:bg-slate-50 shadow-xs'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Stacked Photographic Workout Cards */}
      <div className="px-5 space-y-4 flex flex-col gap-4">
        {filteredWorkouts.map((workout) => (
          <div
            key={workout.id}
            onClick={() => {
              if (onSelectWorkout) onSelectWorkout(workout);
              else if (onOpenExerciseGuide) onOpenExerciseGuide();
            }}
            className="group relative w-full h-52 rounded-[28px] overflow-hidden bg-slate-950 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 select-none"
          >
            {/* Background Image */}
            <img
              src={workout.imageSrc}
              alt={workout.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Dark Gradient Overlay for razor-sharp typography */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.85) 100%)',
              }}
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
    </div>
  );
}
