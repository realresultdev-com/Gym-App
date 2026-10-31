import { useState } from 'react';

interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPartnerDashboard: () => void;
}

const SLIDES = [
  {
    tag: 'PARTNER WITH FIT SQUARE!',
    titleLine1: 'Run Your Gym.',
    titleLine2: 'Smarter.',
    description:
      'Manage members, track performance, and grow your gym - all from one powerful dashboard.',
  },
  {
    tag: 'MEMBER VALUE INCLUDED!',
    titleLine1: 'Free Exercise',
    titleLine2: 'Course.',
    description:
      'Every member gets our 10 foundational movement guides with step-by-step animations - 100% free for your gym.',
  },
  {
    tag: 'ZERO ONBOARDING FEES!',
    titleLine1: 'Instant Payouts &',
    titleLine2: 'QR Check-In.',
    description:
      'Track real-time footfall with staff-friendly QR scans and withdraw session earnings directly to your bank.',
  },
];

export function PartnerOnboardingModal({
  isOpen,
  onClose,
  onLaunchPartnerDashboard,
}: PartnerOnboardingModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [gymName, setGymName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [phone, setPhone] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onLaunchPartnerDashboard();
      onClose();
    }
  };

  const handleRegisterGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName) return;
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setShowRegisterForm(false);
      onLaunchPartnerDashboard();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 antialiased">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-md cursor-pointer transition hover:bg-white"
        >
          ✕
        </button>

        {!showRegisterForm ? (
          <div className="relative flex flex-col h-[640px]">
            {/* Top Brand Header */}
            <div className="absolute top-4 left-5 z-20 flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-[#FF5A36] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-slate-950 font-black tracking-widest text-sm font-sans block leading-none">
                  FIT SQUARE
                </span>
                <span className="text-slate-400 text-[8px] font-bold tracking-widest uppercase">
                  PARTNER PLATFORM
                </span>
              </div>
            </div>

            {/* Gym Photo Hero matching screenshot */}
            <div className="relative h-[360px] w-full overflow-hidden">
              <img
                src="/partner-gym.jpg"
                alt="Gym Partner Studio"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.85) 80%, #FFFFFF 100%)',
                }}
              />
            </div>

            {/* Bottom Content Area */}
            <div className="flex-1 px-6 pb-6 pt-1 flex flex-col justify-between bg-white text-left">
              <div>
                {/* Tag Badge */}
                <div className="text-[#FF5A36] text-[11px] font-black uppercase tracking-wider mb-2">
                  {slide.tag}
                </div>

                {/* Headline with Brush Highlight */}
                <div className="mb-2">
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
                    {slide.titleLine1}
                  </h2>
                  <div className="relative inline-block">
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
                      {slide.titleLine2}
                    </h2>
                    <div className="h-1.5 w-32 bg-[#FF5A36] rounded-full -mt-0.5 opacity-90" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs font-medium leading-relaxed mt-2">
                  {slide.description}
                </p>
              </div>

              <div>
                {/* Carousel Dots */}
                <div className="flex items-center space-x-1.5 mb-5">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === idx
                          ? 'w-6 bg-slate-950'
                          : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Orange CTA Continue Button */}
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl bg-[#FF5A36] hover:bg-[#e04825] text-white font-black text-sm tracking-wide transition shadow-lg shadow-[#FF5A36]/30 cursor-pointer active:scale-95"
                >
                  {currentSlideIndex === SLIDES.length - 1 ? 'Launch Partner Dashboard' : 'Continue'}
                </button>

                <div className="flex items-center justify-between mt-3 text-[11px] font-bold text-slate-400">
                  <button
                    onClick={() => setShowRegisterForm(true)}
                    className="hover:text-slate-800 transition cursor-pointer"
                  >
                    Register New Gym Facility
                  </button>
                  <button
                    onClick={() => {
                      onLaunchPartnerDashboard();
                      onClose();
                    }}
                    className="text-[#FF5A36] hover:underline cursor-pointer"
                  >
                    Demo Gym Owner Mode →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Quick Gym Owner Registration Form */
          <div className="p-6 bg-white min-h-[580px] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center space-x-2 text-xs font-black text-[#FF5A36] uppercase tracking-wider mb-1">
                <span>FitSquare Partner Network</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                List Your Gym with FitSquare
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Zero onboarding cost. Earn ₹120–₹250 per verified member check-in.
              </p>

              {registeredSuccess ? (
                <div className="mt-12 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-black text-emerald-900">Application Approved!</h4>
                  <p className="text-xs text-emerald-700">
                    Welcome to the FitSquare Partner Network. Loading your management dashboard...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterGym} className="mt-5 space-y-3.5 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Gym / Studio Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iron & Pulse Fitness Club"
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#FF5A36]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        <option>Bengaluru</option>
                        <option>Mumbai</option>
                        <option>Navi Mumbai</option>
                        <option>Thane</option>
                        <option>Delhi NCR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Owner Contact
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#FF5A36]"
                      />
                    </div>
                  </div>

                  {/* Bundled Feature Callout */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-2.5">
                    <span className="text-base">🎁</span>
                    <p className="text-[11px] text-amber-900 leading-snug font-medium">
                      <strong className="font-bold">Free Course Included:</strong> Your registered members will get all 10 push/pull/legs exercise guides with motion animations at zero extra fee.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#FF5A36] hover:bg-[#e04825] text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer mt-2"
                  >
                    Submit Gym & Go Live (24h)
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => setShowRegisterForm(false)}
              className="text-xs text-slate-400 font-bold hover:text-slate-700 transition cursor-pointer mt-4"
            >
              ← Back to Overview
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
