import { useState, useEffect } from 'react';
import type { ExerciseGuide } from '../types/gym';
import { FOUNDATIONAL_EXERCISES } from '../data/exerciseGuides';
import { IconCheckCircle } from './Icons';

interface ExerciseCourseViewProps {
  onLogCompletedSession?: (exerciseName: string, sets: number, reps: number) => void;
}

export function ExerciseCourseView({ onLogCompletedSession }: ExerciseCourseViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseGuide>(FOUNDATIONAL_EXERCISES[0]);
  const [activeTab, setActiveTab] = useState<'ANIMATION' | 'STEP_1' | 'STEP_2' | 'STEP_3'>('ANIMATION');
  const [animationFrame, setAnimationFrame] = useState<'TOP' | 'BOTTOM'>('TOP');
  const [feedbackToast, setFeedbackToast] = useState('');
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceSets, setPracticeSets] = useState(1);

  // Smooth continuous animation cycling between top and bottom positions
  useEffect(() => {
    if (activeTab !== 'ANIMATION') return;

    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev === 'TOP' ? 'BOTTOM' : 'TOP'));
    }, 1100);

    return () => clearInterval(interval);
  }, [activeTab]);

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

      {/* Header & Exercise Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {selectedExercise.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step visual demonstration and motion technique
          </p>
        </div>

        {/* Exercise Quick Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          {FOUNDATIONAL_EXERCISES.map((ex) => {
            const isSelected = selectedExercise.id === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setSelectedExercise(ex);
                  setActiveTab('ANIMATION');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ex.name.split(' ')[1] || ex.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Motion Animation Player */}
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
              Step 2: Lowered
            </button>
            <button
              onClick={() => setActiveTab('STEP_3')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'STEP_3'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 3: Lockout
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">
            {activeTab === 'ANIMATION' ? 'Continuous Movement' : activeTab.replace('_', ' ')}
          </span>
        </div>

        {/* Visual Display Stage */}
        <div className="relative p-6 sm:p-10 bg-white flex flex-col items-center justify-center min-h-[380px] select-none">
          
          {/* Animated Motion Simulation */}
          {activeTab === 'ANIMATION' && (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={animationFrame === 'TOP' ? '/exercises/pushup-step1-top.jpg' : '/exercises/pushup-step2-bottom.jpg'}
                  alt="Push-Up Movement"
                  className="max-h-80 max-w-full object-contain transition-all duration-700 ease-in-out"
                />
              </div>
            </div>
          )}

          {/* Still Frame: Step 1 */}
          {activeTab === 'STEP_1' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/exercises/pushup-step1-top.jpg"
                  alt="Step 1 Setup"
                  className="max-h-80 max-w-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                Step 1: High plank position with palms flat under shoulders and rigid torso.
              </p>
            </div>
          )}

          {/* Still Frame: Step 2 */}
          {activeTab === 'STEP_2' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/exercises/pushup-step2-bottom.jpg"
                  alt="Step 2 Descent"
                  className="max-h-80 max-w-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                Step 2: Lower chest until hovering just above the floor, elbows angled at 45°.
              </p>
            </div>
          )}

          {/* Still Frame: Step 3 */}
          {activeTab === 'STEP_3' && (
            <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
              <div className="w-full aspect-[16/9] max-h-96 bg-white rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/exercises/pushup-step1-top.jpg"
                  alt="Step 3 Lockout"
                  className="max-h-80 max-w-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 text-center">
                Step 3: Press firmly through palms to return to starting high plank.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Step-by-Step Clear Visual Cards (90% Visual, 10% Text) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Movement Steps</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1 Card */}
          <div
            onClick={() => setActiveTab('STEP_1')}
            className={`p-4 rounded-3xl bg-white border transition cursor-pointer shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-400 ${
              activeTab === 'STEP_1' ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200/90'
            }`}
          >
            <div className="w-full aspect-[16/10] bg-slate-50/60 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
              <img
                src="/exercises/pushup-step1-top.jpg"
                alt="Step 1"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-xs font-bold text-slate-900">High Plank Setup</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Hands under shoulders, body in a rigid straight line from head to heels.
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
              <img
                src="/exercises/pushup-step2-bottom.jpg"
                alt="Step 2"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-xs font-bold text-slate-900">Lower Chest to Floor</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Elbows at 45°, lower down until chest hovers just above the ground.
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
              <img
                src="/exercises/pushup-step1-top.jpg"
                alt="Step 3"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-number font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="text-xs font-bold text-slate-900">Press Back to Lockout</h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Drive through palms to return to the top position.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Minimal Action Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Push-Up Routine</h4>
          <p className="text-xs text-slate-400">3 Sets • 10 Repetitions</p>
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
