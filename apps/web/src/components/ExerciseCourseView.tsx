import { useState, useEffect } from 'react';
import type { ExerciseGuide } from '../types/gym';
import { FOUNDATIONAL_EXERCISES } from '../data/exerciseGuides';
import { ExerciseGraphic } from './ExerciseGraphic';
import { IconCheckCircle } from './Icons';

interface ExerciseCourseViewProps {
  onLogCompletedSession?: (exerciseName: string, sets: number, reps: number) => void;
}

type CategoryFilter = 'ALL' | 'Push' | 'Pull' | 'Legs & Core';

export function ExerciseCourseView({ onLogCompletedSession }: ExerciseCourseViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseGuide>(FOUNDATIONAL_EXERCISES[0]);
  const [activeTab, setActiveTab] = useState<'ANIMATION' | 'STEP_1' | 'STEP_2' | 'STEP_3'>('ANIMATION');
  const [animationFrame, setAnimationFrame] = useState<'START' | 'FINISH'>('START');
  const [feedbackToast, setFeedbackToast] = useState('');
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceSets, setPracticeSets] = useState(1);

  // Filter exercises by category
  const filteredExercises = selectedCategory === 'ALL'
    ? FOUNDATIONAL_EXERCISES
    : FOUNDATIONAL_EXERCISES.filter((ex) => ex.category === selectedCategory);

  // Smooth continuous animation cycling between start and finish frames
  useEffect(() => {
    if (activeTab !== 'ANIMATION') return;

    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev === 'START' ? 'FINISH' : 'START'));
    }, 1150);

    return () => clearInterval(interval);
  }, [activeTab, selectedExercise.id]);

  const handleFinishPracticeSet = () => {
    if (practiceSets < 3) {
      setPracticeSets((s) => s + 1);
      setFeedbackToast(`Set ${practiceSets} logged!`);
    } else {
      setPracticeActive(false);
      setPracticeSets(1);
      setFeedbackToast(`3 sets of ${selectedExercise.name} completed!`);
      if (onLogCompletedSession) {
        onLogCompletedSession(selectedExercise.name, 3, 30);
      }
    }
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  return (
    <div className="space-y-6 antialiased">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3 border border-slate-700">
          <IconCheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Exercises (10)' },
              { id: 'Push', label: 'Push (Chest & Shoulders)' },
              { id: 'Pull', label: 'Pull (Back & Biceps)' },
              { id: 'Legs & Core', label: 'Legs & Core' },
            ] as const
          ).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstInCat = cat.id === 'ALL'
                    ? FOUNDATIONAL_EXERCISES[0]
                    : FOUNDATIONAL_EXERCISES.find((ex) => ex.category === cat.id);
                  if (firstInCat) {
                    setSelectedExercise(firstInCat);
                    setActiveTab('ANIMATION');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          Target: <strong className="text-slate-800 font-bold">{selectedExercise.recommendedSetsReps}</strong>
        </span>
      </div>

      {/* Exercise Horizontal Switcher Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filteredExercises.map((ex) => {
          const isSelected = selectedExercise.id === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedExercise(ex);
                setActiveTab('ANIMATION');
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900'
                  : 'bg-white/90 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isSelected ? 'text-amber-500' : 'text-slate-400'
                }`}>
                  {ex.category}
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">{ex.name}</p>
              </div>
              <p className="text-[10px] font-semibold text-slate-500">{ex.recommendedSetsReps}</p>
            </button>
          );
        })}
      </div>

      {/* Hero Motion Animation Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('ANIMATION')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ANIMATION'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Motion Animation
            </button>
            <button
              onClick={() => setActiveTab('STEP_1')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'STEP_1'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 1: Setup
            </button>
            <button
              onClick={() => setActiveTab('STEP_2')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'STEP_2'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 2: Execution
            </button>
            <button
              onClick={() => setActiveTab('STEP_3')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'STEP_3'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 3: Return
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 hidden sm:inline-block">
              {selectedExercise.name}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
              {selectedExercise.recommendedSetsReps}
            </span>
          </div>
        </div>

        {/* Visual Viewport Stage */}
        <div className="relative p-6 sm:p-10 bg-white flex flex-col items-center justify-center min-h-[380px] select-none">
          
          {/* Animated Loop Mode */}
          {activeTab === 'ANIMATION' && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <ExerciseGraphic
                  slug={selectedExercise.slug}
                  frame={animationFrame}
                />
              </div>
            </div>
          )}

          {/* Still Frame: Step 1 Setup */}
          {activeTab === 'STEP_1' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <ExerciseGraphic
                  slug={selectedExercise.slug}
                  frame="START"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                {selectedExercise.steps[0]?.instruction || 'Step 1: Setup starting alignment'}
              </p>
            </div>
          )}

          {/* Still Frame: Step 2 Execution */}
          {activeTab === 'STEP_2' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <ExerciseGraphic
                  slug={selectedExercise.slug}
                  frame="FINISH"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                {selectedExercise.steps[1]?.instruction || 'Step 2: Smooth controlled movement execution'}
              </p>
            </div>
          )}

          {/* Still Frame: Step 3 Lockout */}
          {activeTab === 'STEP_3' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <ExerciseGraphic
                  slug={selectedExercise.slug}
                  frame="START"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                {selectedExercise.steps[2]?.instruction || 'Step 3: Return under control to starting position'}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Step-by-Step Clear Visual Cards (90% Visual, 10% Text) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Movement Steps</h3>
          <span className="text-xs text-slate-500 font-medium">
            Muscles: {selectedExercise.targetMusclesPrimary.join(', ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1 Card */}
          <div
            onClick={() => setActiveTab('STEP_1')}
            className={`p-4 rounded-3xl bg-white border transition cursor-pointer shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-400 ${
              activeTab === 'STEP_1' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/90'
            }`}
          >
            <div className="w-full aspect-[16/10] bg-slate-50/60 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
              <ExerciseGraphic
                slug={selectedExercise.slug}
                frame="START"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-xs font-bold text-slate-900">{selectedExercise.steps[0]?.title || 'Setup Position'}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {selectedExercise.steps[0]?.instruction}
              </p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div
            onClick={() => setActiveTab('STEP_2')}
            className={`p-4 rounded-3xl bg-white border transition cursor-pointer shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-400 ${
              activeTab === 'STEP_2' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/90'
            }`}
          >
            <div className="w-full aspect-[16/10] bg-slate-50/60 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
              <ExerciseGraphic
                slug={selectedExercise.slug}
                frame="FINISH"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-xs font-bold text-slate-900">{selectedExercise.steps[1]?.title || 'Execution Phase'}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {selectedExercise.steps[1]?.instruction}
              </p>
            </div>
          </div>

          {/* Step 3 Card */}
          <div
            onClick={() => setActiveTab('STEP_3')}
            className={`p-4 rounded-3xl bg-white border transition cursor-pointer shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-400 ${
              activeTab === 'STEP_3' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/90'
            }`}
          >
            <div className="w-full aspect-[16/10] bg-slate-50/60 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
              <ExerciseGraphic
                slug={selectedExercise.slug}
                frame="START"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="text-xs font-bold text-slate-900">{selectedExercise.steps[2]?.title || 'Return to Start'}</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {selectedExercise.steps[2]?.instruction}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Workout Practice Logger */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">{selectedExercise.name}</h4>
          <p className="text-xs text-slate-400">Target: {selectedExercise.recommendedSetsReps}</p>
        </div>

        {!practiceActive ? (
          <button
            onClick={() => setPracticeActive(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
          >
            Log Practice
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-amber-400">Set {practiceSets} / 3</span>
            <button
              onClick={handleFinishPracticeSet}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Complete Set {practiceSets}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
