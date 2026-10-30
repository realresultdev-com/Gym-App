import type { ExerciseGuide } from '../types/gym';

export const FOUNDATIONAL_EXERCISES: ExerciseGuide[] = [
  {
    id: 'ex-pushup-01',
    slug: 'push-up',
    name: 'Standard Push-Up',
    series: 'Foundational Bodyweight Series',
    lessonNumber: 1,
    category: 'Upper Body',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    targetMusclesPrimary: ['Chest (Pectoralis Major & Minor)', 'Triceps Brachii'],
    targetMusclesSecondary: [
      'Anterior Deltoids (Front Shoulders)',
      'Core (Rectus Abdominis & Transverse)',
      'Serratus Anterior',
    ],
    overview:
      'The push-up is the gold-standard compound bodyweight exercise for building upper body pushing power, chest definition, and core stability without needing any gym equipment.',
    benefits: [
      'Builds functional pressing strength across the chest, shoulders, and triceps',
      'Develops total-body core stiffness and pelvic control',
      'Promotes healthy scapular movement without joint impingement',
      'Can be trained anywhere, anytime, with scalable difficulty progressions',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Starting High Plank Position',
        instruction:
          'Place your hands flat on the floor, slightly wider than shoulder-width apart, fingers pointing forward or slightly outward. Extend your legs straight behind you, balancing on your toes with feet hip-width apart.',
        cue: 'Form a rigid straight line from crown of head to heels. Squeeze your glutes and brace your abs.',
        imageUrl: '/exercises/pushup-step1.png',
      },
      {
        stepNumber: 2,
        title: 'The Controlled Descent (Eccentric Phase)',
        instruction:
          'Inhale as you slowly bend your elbows and lower your chest toward the floor. Maintain a rigid torso without letting your lower back sag or your hips pike up. Lower down until your chest is 1 to 2 inches above the ground.',
        cue: 'Keep your elbows tucked back at a 45-degree angle from your torso (arrow shape, not a T-shape).',
        imageUrl: '/exercises/pushup-steps-guide.png',
      },
      {
        stepNumber: 3,
        title: 'Explosive Press & Lockout (Concentric Phase)',
        instruction:
          'Pause for a brief split-second at the bottom. Exhale forcefully through your mouth as you press through the palms of your hands, contracting your chest and triceps to drive your body back up to the starting plank.',
        cue: 'Spread your shoulder blades at the top (scapular protraction) to fully engage the serratus anterior.',
        imageUrl: '/exercises/pushup-step1.png',
      },
    ],
    formTips: [
      'Maintain an arrow shape: elbows at 45 degrees relative to your torso to protect shoulder joints.',
      'Gaze at the floor roughly 8 inches ahead of your hands to keep your neck neutral.',
      'Brace your core tight as if preparing to take a punch throughout the entire rep.',
      'Inhale on the descent; exhale forcefully on the ascent.',
    ],
    commonMistakes: [
      'Sagging hips / arched lower back: Indicates weak core bracing, placing strain on lumbar spine.',
      'Flaring elbows out at 90 degrees: Causes rotator cuff impingement and decreases chest recruitment.',
      'Half-repetition syndrome: Bouncing before reaching full depth near the floor.',
      'Craning the neck: Reaching with the chin to fake depth instead of moving the chest.',
    ],
    recommendedSetsReps: '3 to 4 Sets x 10 to 15 Repetitions',
    tempo: '2-1-1 (2s descent, 1s bottom pause, 1s explosive push)',
    variations: [
      {
        name: 'Wall Push-Ups',
        level: 'Introductory',
        description: 'Reduced gravitational load to practice wrist and shoulder pressing mechanics.',
      },
      {
        name: 'Incline Bench Push-Ups',
        level: 'Beginner',
        description: 'Hands elevated on a workout bench to build pressing strength while holding full plank.',
      },
      {
        name: 'Knee Push-Ups',
        level: 'Beginner',
        description: 'Shortens the body lever arm to develop chest endurance before full toe push-ups.',
      },
      {
        name: 'Standard Floor Push-Up',
        level: 'Intermediate',
        description: 'Full bodyweight baseline push-up targeting pectorals, triceps, and anterior delts.',
      },
      {
        name: 'Decline Push-Ups',
        level: 'Advanced',
        description: 'Feet elevated on a bench or box to shift high tension onto the clavicular upper chest.',
      },
      {
        name: 'Diamond Push-Ups',
        level: 'Advanced',
        description: 'Hands placed close together forming a diamond to maximize tricep lateral head overload.',
      },
    ],
  },
  {
    id: 'ex-squat-02',
    slug: 'bodyweight-squat',
    name: 'Bodyweight Air Squat',
    series: 'Foundational Bodyweight Series',
    lessonNumber: 2,
    category: 'Lower Body',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    targetMusclesPrimary: ['Quadriceps', 'Gluteus Maximus'],
    targetMusclesSecondary: ['Hamstrings', 'Calves', 'Core / Erector Spinae'],
    overview:
      'The foundational lower-body compound movement that builds functional leg power, hip mobility, and knee resilience.',
    benefits: [
      'Develops quad, hamstring, and glute strength simultaneously',
      'Enhances hip and ankle mobility',
      'Improves athletic jumping and sprinting biomechanics',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Athletic Stance Setup',
        instruction: 'Stand tall with feet shoulder-width apart, toes turned slightly outward at 15 to 30 degrees.',
        cue: 'Keep chest proud, shoulders back, and arms extended forward for balance.',
        imageUrl: '/exercises/pushup-step1.png',
      },
      {
        stepNumber: 2,
        title: 'Hip Hinge & Descent',
        instruction: 'Inhale and initiate the movement by hinging your hips backward as if sitting down into a chair.',
        cue: 'Track knees over middle toes; do not let knees cave inward.',
        imageUrl: '/exercises/pushup-steps-guide.png',
      },
      {
        stepNumber: 3,
        title: 'Drive Out of the Hole',
        instruction: 'Descend until thighs are at least parallel to the floor, then drive through your heels to stand tall.',
        cue: 'Exhale as you stand up and squeeze your glutes at the top.',
        imageUrl: '/exercises/pushup-step1.png',
      },
    ],
    formTips: [
      'Keep weight balanced over mid-foot and heels; heels must never leave the floor.',
      'Maintain an upright torso and look straight ahead.',
    ],
    commonMistakes: [
      'Knees caving inward (valgus collapse).',
      'Heels lifting off the ground due to poor ankle dorsiflexion.',
    ],
    recommendedSetsReps: '3 Sets x 15 to 20 Repetitions',
    tempo: '2-1-1 (2s down, 1s pause at parallel, 1s up)',
    variations: [
      { name: 'Box Squats', level: 'Beginner', description: 'Squatting to a bench to establish safe depth.' },
      { name: 'Air Squat', level: 'Intermediate', description: 'Free-standing full depth bodyweight squat.' },
      { name: 'Jump Squats', level: 'Advanced', description: 'Explosive plyometric squat for power.' },
    ],
  },
];

