import { useState } from 'react';

interface OnboardingWelcomeViewProps {
  onContinueToLogin: () => void;
  onInstantOwnerDemo?: () => void;
}

const ONBOARDING_SLIDES = [
  {
    tag: 'PARTNER WITH REAL FIT!',
    titleLine1: 'Run Your Gym.',
    titleLine2: 'Smarter.',
    description:
      'Manage members, track performance, and grow your gym - all from one powerful dashboard.',
    badge: 'Real Fit Partner Network',
  },
  {
    tag: 'MEMBER PASS & TRAINING',
    titleLine1: 'Train Anywhere.',
    titleLine2: 'Anytime.',
    description:
      'Check in seamlessly across elite partner gyms with QR code passes and track 10 foundational exercise courses.',
    badge: 'Pro Athlete Pass',
  },
  {
    tag: 'COACHING & ANALYTICS',
    titleLine1: 'Coach Clients.',
    titleLine2: 'Better.',
    description:
      'Assign specialized split workouts, monitor real-time member attendance, and automate monthly recurring payouts.',
    badge: 'Certified Coaching Suite',
  },
];

export function OnboardingWelcomeView({
  onContinueToLogin,
  onInstantOwnerDemo,
}: OnboardingWelcomeViewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slide = ONBOARDING_SLIDES[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onContinueToLogin();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans select-none overflow-x-hidden">
      {/* Device Card / Screen Container */}
      <div className="relative w-full max-w-md min-h-screen sm:min-h-[780px] sm:max-h-[860px] bg-white sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col justify-between border-0 sm:border sm:border-slate-200">
        
        {/* Top Floating App Bar */}
        <div className="absolute top-0 inset-x-0 z-30 pt-4 px-6 pb-2 flex items-center justify-between pointer-events-none">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 pointer-events-auto">
            <img
              src="/real-fit-logo.png"
              alt="Real Fit"
              className="w-8 h-8 object-contain drop-shadow"
            />
            <div className="leading-tight">
              <span className="text-slate-950 font-black tracking-wider text-base block font-sans">
                REAL FIT
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                FITNESS PLATFORM
              </span>
            </div>
          </div>

          {/* Skip / Sign In Direct Shortcut */}
          <button
            onClick={onContinueToLogin}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white transition cursor-pointer shadow-sm active:scale-95"
          >
            Sign In →
          </button>
        </div>

        {/* Top Gym Photo Hero Section */}
        <div className="relative h-[48vh] sm:h-[420px] w-full overflow-hidden bg-slate-900">
          <img
            src="/partner-gym.jpg"
            alt="Modern Bright Gym Studio"
            className="w-full h-full object-cover filter brightness-[0.98] contrast-[1.03]"
          />
          {/* Smooth Fading Gradient from Photo to Clean White Card */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0.75) 75%, #FFFFFF 100%)',
            }}
          />
          {/* Subtle Decorative Ambient Lighting */}
          <div className="absolute top-1/4 right-0 w-48 h-48 bg-[#FF5A36]/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Bottom Content Card Section (Matching reference screen) */}
        <div className="flex-1 px-7 pb-8 pt-2 flex flex-col justify-between bg-white text-left z-20">
          <div>
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center space-x-1.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse" />
              <span className="text-[#FF5A36] text-[11px] font-black uppercase tracking-wider">
                {slide.tag}
              </span>
            </div>

            {/* Headline with Hand-Drawn Brush Curve Underline */}
            <div className="mb-3">
              <h1 className="text-3xl sm:text-[34px] font-black text-slate-950 tracking-tight leading-[1.12]">
                {slide.titleLine1}
              </h1>
              <div className="relative inline-block mt-0.5">
                <h1 className="text-3xl sm:text-[34px] font-black text-slate-950 tracking-tight leading-[1.12]">
                  {slide.titleLine2}
                </h1>
                {/* Hand-drawn organic curved underline SVG */}
                <svg
                  className="absolute -bottom-2 left-0 w-32 sm:w-36 h-3 text-[#FF5A36]"
                  viewBox="0 0 140 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8.5C35 4 95 3.5 137 7.5"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 9.8C42 6.2 88 5.8 128 8.8"
                    stroke="#FF8A65"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              </div>
            </div>

            {/* Subtitle Description */}
            <p className="text-slate-600 text-[13px] sm:text-sm font-medium leading-relaxed mt-4 max-w-sm">
              {slide.description}
            </p>
          </div>

          <div className="pt-4">
            {/* Carousel Pagination Dots */}
            <div className="flex items-center space-x-2 mb-5">
              {ONBOARDING_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'w-7 bg-slate-950 shadow-sm'
                      : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* High-Impact Orange Pill Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 rounded-full bg-[#FF5A36] hover:bg-[#ff6c4a] active:bg-[#e04825] text-white font-black text-base tracking-wide transition shadow-lg shadow-[#FF5A36]/30 cursor-pointer active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>{currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Continue'}</span>
              <span>→</span>
            </button>

            {/* Bottom Meta Links */}
            <div className="flex items-center justify-between mt-4 px-1 text-[11px] font-bold text-slate-500">
              <button
                type="button"
                onClick={onContinueToLogin}
                className="hover:text-slate-900 transition cursor-pointer"
              >
                Sign In to Portal
              </button>
              {onInstantOwnerDemo && (
                <button
                  type="button"
                  onClick={onInstantOwnerDemo}
                  className="text-[#FF5A36] hover:underline cursor-pointer"
                >
                  Demo Gym Owner Mode →
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
