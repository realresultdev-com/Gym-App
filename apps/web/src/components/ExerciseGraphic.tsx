interface ExerciseGraphicProps {
  slug: string;
  frame: 'START' | 'FINISH';
  className?: string;
}

interface GraphicAsset {
  start: string;
  finish: string;
  alt: string;
}

const EXERCISE_ASSETS: Record<string, GraphicAsset> = {
  'push-up': {
    start: '/exercises/pushup-step1-top.jpg',
    finish: '/exercises/pushup-step2-bottom.jpg',
    alt: 'Push-Up Form & Mechanics',
  },
  'seated-dumbbell-shoulder-press': {
    start: '/exercises/shoulder-press-start.jpg',
    finish: '/exercises/shoulder-press-finish.jpg',
    alt: 'Seated Dumbbell Shoulder Press Form',
  },
  'machine-chest-press': {
    start: '/exercises/shoulder-press-start.jpg',
    finish: '/exercises/cable-row-finish.jpg',
    alt: 'Machine Chest Press Form',
  },
  'lat-pulldown': {
    start: '/exercises/lat-pulldown-start.jpg',
    finish: '/exercises/lat-pulldown-finish.jpg',
    alt: 'Lat Pulldown Form & Extension',
  },
  'seated-cable-row': {
    start: '/exercises/cable-row-start.jpg',
    finish: '/exercises/cable-row-finish.jpg',
    alt: 'Seated Cable Row Form & Scapular Retraction',
  },
  'dumbbell-biceps-curl': {
    start: '/exercises/goblet-squat-start.jpg',
    finish: '/exercises/shoulder-press-start.jpg',
    alt: 'Dumbbell Biceps Curl Form',
  },
  'leg-press-machine': {
    start: '/exercises/goblet-squat-start.jpg',
    finish: '/exercises/goblet-squat-finish.jpg',
    alt: 'Leg Press Machine Mechanics',
  },
  'dumbbell-goblet-squat': {
    start: '/exercises/goblet-squat-start.jpg',
    finish: '/exercises/goblet-squat-finish.jpg',
    alt: 'Dumbbell Goblet Squat Depth & Form',
  },
  'romanian-dumbbell-deadlift': {
    start: '/exercises/goblet-squat-start.jpg',
    finish: '/exercises/goblet-squat-finish.jpg',
    alt: 'Romanian Dumbbell Deadlift Hip Hinge',
  },
  'forearm-plank': {
    start: '/exercises/pushup-step1-top.jpg',
    finish: '/exercises/pushup-step2-bottom.jpg',
    alt: 'Forearm Plank Rigidity & Core Bracing',
  },
};

export function ExerciseGraphic({ slug, frame, className = '' }: ExerciseGraphicProps) {
  const asset = EXERCISE_ASSETS[slug] || EXERCISE_ASSETS['push-up'];
  const currentImage = frame === 'START' ? asset.start : asset.finish;

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-white ${className}`}>
      <img
        key={`${slug}-${frame}`}
        src={currentImage}
        alt={asset.alt}
        className="w-full h-full max-h-80 sm:max-h-96 object-contain select-none transition-opacity duration-300 ease-in-out"
        loading="eager"
      />
    </div>
  );
}
