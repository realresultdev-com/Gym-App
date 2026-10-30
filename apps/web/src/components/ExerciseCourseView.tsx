import { useState, useEffect } from 'react';
import type { ExerciseGuide } from '../types/gym';
import { FOUNDATIONAL_EXERCISES } from '../data/exerciseGuides';
import {
  IconPlay,
  IconPause,
  IconCheckCircle,
  IconAlertCircle,
  IconDumbbell,
} from './Icons';

interface ExerciseCourseViewProps {
  onLogCompletedSession?: (exerciseName: string, sets: number, reps: number) => void;
}

export function ExerciseCourseView({ onLogCompletedSession }: ExerciseCourseViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseGuide>(FOUNDATIONAL_EXERCISES[0]);
  const [activeStepTab, setActiveStepTab] = useState<'ANIMATION' | 'STEP_1' | 'STEP_2' | 'STEP_3'>('ANIMATION');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [animationFrame, setAnimationFrame] = useState<'UP' | 'DOWN'>('UP');
  const [repCount, setRepCount] = useState(0);

  // Practice Mode State
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceSets, setPracticeSets] = useState(1);
  const [practiceRepsCompleted, setPracticeRepsCompleted] = useState(0);
  const [feedbackToast, setFeedbackToast] = useState('');

  // Looping animation ticker simulating Spotebi gif / video demonstration
  useEffect(() => {
    if (!isPlaying || activeStepTab !== 'ANIMATION') return;

    const intervalTime = (2400 / playbackSpeed);
    const interval = setInterval(() => {
      setAnimationFrame((prev) => {
        if (prev === 'UP') {
          return 'DOWN';
        } else {
          setRepCount((r) => r + 1);
          return 'UP';
        }
      });
    }, intervalTime / 2);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeStepTab]);

  const handleFinishPracticeSet = () => {
    const reps = practiceRepsCompleted + 10;
    setPracticeRepsCompleted(reps);
    if (practiceSets < 3) {
      setPracticeSets((s) => s + 1);
      setFeedbackToast(`Set ${practiceSets} completed! 45s rest timer started.`);
    } else {
      setPracticeActive(false);
      setFeedbackToast(`Exercise Completed! 3 sets of ${selectedExercise.name} logged.`);
      if (onLogCompletedSession) {
        onLogCompletedSession(selectedExercise.name, 3, reps);
      }
    }
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  return (
    <div className="space-y-6 antialiased">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3 border border-slate-700">
          <IconCheckCircle className="w-4 h-4 text-amber-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Course Selection Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-amber-400">
              Exercise Academy
            </span>
            <span className="text-xs text-slate-500 font-medium">Course 01 • Step-by-Step Technique</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {selectedExercise.name} Guide
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spotebi-style biomechanical breakdown with visual animations, movement cues & muscle anatomy
          </p>
        </div>

        {/* Exercise Quick Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          {FOUNDATIONAL_EXERCISES.map((ex) => {
            const isSelected = selectedExercise.id === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  setSelectedExercise(ex);
                  setActiveStepTab('ANIMATION');
                  setRepCount(0);
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

      {/* =========================================================
          HERO ANIMATED VISUAL PLAYER (Spotebi Style Loop / Steps)
      ========================================================== */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Visual Viewport Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Visual Demonstration
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800">
              {activeStepTab === 'ANIMATION' ? 'Looping Repetition' : activeStepTab.replace('_', ' ')}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveStepTab('ANIMATION')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeStepTab === 'ANIMATION'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Animated Video Loop
            </button>
            <button
              onClick={() => setActiveStepTab('STEP_1')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeStepTab === 'STEP_1'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 1: Setup
            </button>
            <button
              onClick={() => setActiveStepTab('STEP_2')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeStepTab === 'STEP_2'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step 2: Lowered
            </button>
          </div>
        </div>

        {/* Visual Stage */}
        <div className="relative p-6 sm:p-10 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center min-h-[340px] select-none">
          
          {/* Animated Video Simulation Mode */}
          {activeStepTab === 'ANIMATION' && (
            <div className="flex flex-col items-center justify-center space-y-4 max-w-lg w-full">
              
              <div className="relative w-full aspect-[16/10] max-h-72 bg-white rounded-3xl border border-slate-200/80 shadow-md p-4 flex items-center justify-center overflow-hidden">
                
                {/* Visual Position Graphic */}
                <div className={`transition-all duration-500 ease-in-out transform flex flex-col items-center justify-center w-full h-full ${
                  animationFrame === 'DOWN' ? 'translate-y-4 scale-95' : 'translate-y-0 scale-100'
                }`}>
                  <img
                    src={animationFrame === 'DOWN' ? '/exercises/pushup-steps-guide.png' : '/exercises/pushup-step1.png'}
                    alt="Push-Up Visual"
                    className="max-h-56 max-w-full object-contain filter contrast-105"
                  />
                </div>

                {/* Real-time Breathing & Tempo Prompt Overlay */}
                <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-semibold flex items-center space-x-2 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${animationFrame === 'DOWN' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span>
                    {animationFrame === 'DOWN' ? 'Phase: Inhale on Descent (Hold 1s)' : 'Phase: Exhale Forcefully & Push'}
                  </span>
                </div>

                {/* Rep Counter Badge */}
                <div className="absolute top-4 right-4 bg-white/95 text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm">
                  Demonstration Reps: <span className="text-amber-600 font-extrabold">{repCount}</span>
                </div>

                {/* Floor Guideline */}
                <div className="absolute bottom-6 left-12 right-12 h-0.5 bg-slate-200/80 rounded-full" />
              </div>

              {/* Player Controls */}
              <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <IconPause className="w-3.5 h-3.5" />
                      <span>Pause Demo</span>
                    </>
                  ) : (
                    <>
                      <IconPlay className="w-3.5 h-3.5" />
                      <span>Play Animation</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Speed:</span>
                  {[0.5, 1, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-slate-100 text-slate-950 border border-slate-300'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Still Frame Step 1 */}
          {activeStepTab === 'STEP_1' && (
            <div className="flex flex-col items-center max-w-lg w-full space-y-4">
              <div className="w-full aspect-[16/10] max-h-72 bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 flex items-center justify-center">
                <img
                  src="/exercises/pushup-step1.png"
                  alt="Push-Up Step 1 Plank Position"
                  className="max-h-56 max-w-full object-contain"
                />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Step 1: Starting High Plank Alignment</h4>
                <p className="text-xs text-slate-500">
                  Palms flat under shoulders, spine in neutral alignment, core braced, toes gripping the floor.
                </p>
              </div>
            </div>
          )}

          {/* Still Frame Step 2 */}
          {activeStepTab === 'STEP_2' && (
            <div className="flex flex-col items-center max-w-lg w-full space-y-4">
              <div className="w-full aspect-[16/10] max-h-72 bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 flex items-center justify-center">
                <img
                  src="/exercises/pushup-steps-guide.png"
                  alt="Push-Up Step 2 Chest to Ground"
                  className="max-h-56 max-w-full object-contain"
                />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Step 2: The Lowering (Chest to Floor)</h4>
                <p className="text-xs text-slate-500">
                  Elbows tucked at a 45-degree angle, chest hovering 1 to 2 inches off the ground without sagging the lower back.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Quick Specs Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Difficulty</p>
            <p className="font-bold text-white mt-0.5">{selectedExercise.difficulty}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Equipment</p>
            <p className="font-bold text-white mt-0.5">{selectedExercise.equipment}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Cadence / Tempo</p>
            <p className="font-bold text-amber-400 mt-0.5">{selectedExercise.tempo}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Recommended Volume</p>
            <p className="font-bold text-white mt-0.5">{selectedExercise.recommendedSetsReps}</p>
          </div>
        </div>

      </div>

      {/* =========================================================
          STEP-BY-STEP DETAILED INSTRUCTIONS (Spotebi Guide Style)
      ========================================================== */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Step-by-Step Exercise Instructions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedExercise.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Step Image Thumbnail */}
                <div className="w-full h-36 bg-slate-50 rounded-2xl border border-slate-200/70 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    className="max-h-full max-w-full object-contain filter contrast-105"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{step.instruction}</p>
              </div>

              {/* Coach Cue Badge */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium space-y-0.5">
                <span className="font-bold text-amber-950 uppercase tracking-wider text-[9px] block">Trainer Cue:</span>
                <p>{step.cue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          ANATOMY & MUSCLES TARGETED
      ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Primary & Secondary Muscles */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconDumbbell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Muscles Targeted & Anatomy</h4>
              <p className="text-[11px] text-slate-500">Biomechanical muscle recruitment profile</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Drivers</p>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.targetMusclesPrimary.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secondary Stabilizers</p>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.targetMusclesSecondary.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits & Functional Transfer */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IconCheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Key Exercise Benefits</h4>
              <p className="text-[11px] text-slate-500">Why this foundational movement is essential</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {selectedExercise.benefits.map((b, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* =========================================================
          FORM TIPS & COMMON MISTAKES (DO'S AND DON'TS)
      ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* DO: Proper Form Checklist */}
        <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <IconCheckCircle className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">Form Do's (Proper Mechanics)</h4>
          </div>
          <ul className="space-y-2 text-xs text-emerald-900 font-medium">
            {selectedExercise.formTips.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DON'T: Common Mistakes to Avoid */}
        <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <IconAlertCircle className="w-4 h-4 text-rose-600" />
            <h4 className="text-sm font-bold text-rose-950 uppercase tracking-wide">Common Mistakes (What to Avoid)</h4>
          </div>
          <ul className="space-y-2 text-xs text-rose-900 font-medium">
            {selectedExercise.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold shrink-0">✕</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* =========================================================
          PROGRESSIVE VARIATIONS & COURSE ROADMAP
      ========================================================== */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Difficulty Progression & Roadmap</h3>
          <p className="text-xs text-slate-500">From baseline progressions to advanced variations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedExercise.variations.map((v) => {
            const isCurrent = v.name === selectedExercise.name || v.name.includes('Standard Floor');
            return (
              <div
                key={v.name}
                className={`p-4 rounded-2xl border text-xs space-y-1 transition ${
                  isCurrent
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{v.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {v.level}
                  </span>
                </div>
                <p className={`text-[11px] ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          INTERACTIVE PRACTICE SESSION LAUNCHER
      ========================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Guided Workout Practice
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Ready to test your {selectedExercise.name} technique?
          </h3>
          <p className="text-xs text-slate-300">
            Log your sets, lock in your tempo, and build upper-body strength.
          </p>
        </div>

        {!practiceActive ? (
          <button
            onClick={() => setPracticeActive(true)}
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shrink-0 flex items-center space-x-2"
          >
            <IconPlay className="w-4 h-4 fill-slate-950" />
            <span>Start Practice Session</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-300">Active Set</p>
              <p className="text-lg font-extrabold text-amber-400">{practiceSets} / 3 Sets</p>
            </div>
            <button
              onClick={handleFinishPracticeSet}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Complete Set {practiceSets} (+10 Reps)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
