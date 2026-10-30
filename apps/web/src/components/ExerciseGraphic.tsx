interface ExerciseGraphicProps {
  slug: string;
  frame: 'START' | 'FINISH';
  className?: string;
}

export function ExerciseGraphic({ slug, frame, className = '' }: ExerciseGraphicProps) {
  // Push-up uses custom high-res generated illustrations
  if (slug === 'push-up') {
    return (
      <img
        src={frame === 'START' ? '/exercises/pushup-step1-top.jpg' : '/exercises/pushup-step2-bottom.jpg'}
        alt="Push-Up Position"
        className={`object-contain max-h-full max-w-full transition-all duration-500 ease-in-out ${className}`}
      />
    );
  }

  const isFinish = frame === 'FINISH';

  return (
    <svg
      viewBox="0 0 600 360"
      className={`w-full h-full max-h-80 select-none transition-all duration-500 ease-in-out ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle drop shadow */}
        <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" />
        </filter>
        <linearGradient id="charcoalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Clean floor groundline */}
      <line x1="60" y1="310" x2="540" y2="310" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />

      {/* 2. Seated Dumbbell Shoulder Press */}
      {slug === 'seated-dumbbell-shoulder-press' && (
        <g transform="translate(180, 40)">
          {/* Bench */}
          <rect x="75" y="110" width="16" height="155" rx="8" fill="#475569" />
          <rect x="30" y="245" width="105" height="18" rx="6" fill="#334155" />
          <line x1="83" y1="263" x2="83" y2="270" stroke="#334155" strokeWidth="12" strokeLinecap="round" />

          {/* Athlete Torso & Head */}
          <ellipse cx="120" cy="190" rx="36" ry="55" fill="url(#charcoalGrad)" />
          {/* Head */}
          <circle cx="120" cy="95" r="22" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
          {/* Legs */}
          <path d="M125 240 L195 240 L210 270" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dumbbells & Arms Animation */}
          {isFinish ? (
            /* Overhead Pressed Lockout */
            <g className="transition-all duration-500">
              {/* Left Arm extended */}
              <path d="M90 145 L78 60 L78 30" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Left Dumbbell */}
              <rect x="58" y="22" width="40" height="10" rx="3" fill="#0f172a" />
              <rect x="73" y="16" width="10" height="22" rx="2" fill="#d97706" />

              {/* Right Arm extended */}
              <path d="M150 145 L162 60 L162 30" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Dumbbell */}
              <rect x="142" y="22" width="40" height="10" rx="3" fill="#0f172a" />
              <rect x="157" y="16" width="10" height="22" rx="2" fill="#d97706" />
            </g>
          ) : (
            /* Ear Height Starting Setup */
            <g className="transition-all duration-500">
              {/* Left Arm at ear height */}
              <path d="M90 145 L65 155 L65 105" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Left Dumbbell */}
              <rect x="45" y="98" width="40" height="12" rx="3" fill="#0f172a" />
              <rect x="60" y="92" width="10" height="24" rx="2" fill="#d97706" />

              {/* Right Arm at ear height */}
              <path d="M150 145 L175 155 L175 105" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Dumbbell */}
              <rect x="155" y="98" width="40" height="12" rx="3" fill="#0f172a" />
              <rect x="170" y="92" width="10" height="24" rx="2" fill="#d97706" />
            </g>
          )}
        </g>
      )}

      {/* 3. Machine Chest Press */}
      {slug === 'machine-chest-press' && (
        <g transform="translate(140, 45)">
          {/* Machine Tower */}
          <rect x="30" y="40" width="55" height="225" rx="10" fill="#334155" />
          <rect x="110" y="110" width="14" height="150" rx="6" fill="#475569" />
          <rect x="100" y="235" width="85" height="16" rx="4" fill="#1e293b" />

          {/* Athlete */}
          <ellipse cx="145" cy="180" rx="34" ry="52" fill="url(#charcoalGrad)" />
          <circle cx="145" cy="98" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
          <path d="M150 230 L220 230 L235 265" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />

          {/* Machine Arm & Hand Movement */}
          {isFinish ? (
            /* Arms extended forward */
            <g className="transition-all duration-500">
              <path d="M165 140 L245 140 L285 140" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="280" y="115" width="10" height="50" rx="4" fill="#d97706" />
              <path d="M85 80 L285 115" stroke="#94a3b8" strokeWidth="4" strokeDasharray="3 3" />
            </g>
          ) : (
            /* Handles at mid chest */
            <g className="transition-all duration-500">
              <path d="M165 140 L195 160 L195 140" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="190" y="115" width="10" height="50" rx="4" fill="#d97706" />
              <path d="M85 80 L190 115" stroke="#94a3b8" strokeWidth="4" strokeDasharray="3 3" />
            </g>
          )}
        </g>
      )}

      {/* 4. Lat Pulldown */}
      {slug === 'lat-pulldown' && (
        <g transform="translate(150, 20)">
          {/* Machine Overhead Pulley & Tower */}
          <rect x="140" y="10" width="20" height="280" rx="6" fill="#334155" />
          <path d="M150 20 L240 20" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          <circle cx="240" cy="20" r="10" fill="#475569" />

          {/* Seat & Thigh Pad */}
          <rect x="195" y="225" width="70" height="15" rx="5" fill="#1e293b" />
          <rect x="180" y="180" width="30" height="15" rx="6" fill="#475569" />

          {/* Athlete */}
          <path d="M225 220 L210 180 L240 180 L250 280" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="230" cy="145" rx="30" ry="48" fill="url(#charcoalGrad)" />
          <circle cx="235" cy="85" r="20" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />

          {/* Cable, Bar & Arms */}
          {isFinish ? (
            /* Pulled down to collarbone */
            <g className="transition-all duration-500">
              <line x1="240" y1="20" x2="240" y2="105" stroke="#94a3b8" strokeWidth="3.5" />
              {/* Wide Bar */}
              <path d="M170 100 Q240 112 310 100" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Arms pulling down with elbows bent */}
              <path d="M220 120 L205 140 L180 102" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M245 120 L260 140 L295 102" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : (
            /* Full stretch at top */
            <g className="transition-all duration-500">
              <line x1="240" y1="20" x2="240" y2="45" stroke="#94a3b8" strokeWidth="3.5" />
              {/* Wide Bar */}
              <path d="M170 40 Q240 52 310 40" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Arms reaching upward */}
              <path d="M220 115 L200 65 L180 42" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M245 115 L270 65 L295 42" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
      )}

      {/* 5. Seated Cable Row */}
      {slug === 'seated-cable-row' && (
        <g transform="translate(100, 50)">
          {/* Low Pulley Machine & Footplate */}
          <rect x="50" y="80" width="30" height="180" rx="8" fill="#334155" />
          <circle cx="65" cy="190" r="12" fill="#475569" />
          <rect x="150" y="170" width="15" height="50" rx="4" fill="#475569" />
          <rect x="180" y="225" width="140" height="15" rx="4" fill="#1e293b" />

          {/* Athlete */}
          <circle cx="280" cy="100" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
          <ellipse cx="275" cy="165" rx="30" ry="50" fill="url(#charcoalGrad)" />
          {/* Legs to footplates */}
          <path d="M270 215 L210 195 L165 195" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Cable & Arm Motion */}
          {isFinish ? (
            /* Rowed into lower stomach */
            <g className="transition-all duration-500">
              <line x1="65" y1="190" x2="245" y2="180" stroke="#94a3b8" strokeWidth="3" />
              <rect x="240" y="170" width="10" height="20" rx="2" fill="#d97706" />
              <path d="M265 135 L300 160 L245 180" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          ) : (
            /* Reaching forward */
            <g className="transition-all duration-500">
              <line x1="65" y1="190" x2="165" y2="180" stroke="#94a3b8" strokeWidth="3" />
              <rect x="160" y="170" width="10" height="20" rx="2" fill="#d97706" />
              <path d="M265 135 L215 155 L165 180" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          )}
        </g>
      )}

      {/* 6. Dumbbell Biceps Curl */}
      {slug === 'dumbbell-biceps-curl' && (
        <g transform="translate(180, 30)">
          {/* Athlete Body Standing */}
          <circle cx="120" cy="50" r="22" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
          <ellipse cx="120" cy="130" rx="32" ry="58" fill="url(#charcoalGrad)" />
          {/* Legs standing tall */}
          <path d="M108 185 L108 275" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
          <path d="M132 185 L132 275" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />

          {/* Biceps Curl Arm & Dumbbell */}
          {isFinish ? (
            /* Curled Up to Shoulders */
            <g className="transition-all duration-500">
              {/* Left arm curled */}
              <path d="M95 105 L90 165 L95 110" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="75" y="98" width="38" height="14" rx="4" fill="#0f172a" />
              <rect x="90" y="92" width="8" height="26" rx="2" fill="#d97706" />

              {/* Right arm curled */}
              <path d="M145 105 L150 165 L145 110" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="127" y="98" width="38" height="14" rx="4" fill="#0f172a" />
              <rect x="142" y="92" width="8" height="26" rx="2" fill="#d97706" />
            </g>
          ) : (
            /* Hanging down at hips */
            <g className="transition-all duration-500">
              {/* Left arm straight down */}
              <path d="M95 105 L90 155 L90 195" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="72" y="190" width="38" height="14" rx="4" fill="#0f172a" />
              <rect x="87" y="184" width="8" height="26" rx="2" fill="#d97706" />

              {/* Right arm straight down */}
              <path d="M145 105 L150 155 L150 195" stroke="url(#skinGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="130" y="190" width="38" height="14" rx="4" fill="#0f172a" />
              <rect x="145" y="184" width="8" height="26" rx="2" fill="#d97706" />
            </g>
          )}
        </g>
      )}

      {/* 7. Leg Press Machine */}
      {slug === 'leg-press-machine' && (
        <g transform="translate(120, 40)">
          {/* 45 Degree Angle Rail & Sled */}
          <line x1="80" y1="240" x2="320" y2="60" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
          {/* Backrest */}
          <rect x="60" y="140" width="18" height="90" rx="6" fill="#334155" transform="rotate(-30 60 140)" />

          {/* Athlete Seated */}
          <circle cx="120" cy="115" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
          <ellipse cx="140" cy="170" rx="35" ry="45" fill="url(#charcoalGrad)" transform="rotate(-25 140 170)" />

          {/* Sled Platform & Legs */}
          {isFinish ? (
            /* Extended Legs */
            <g className="transition-all duration-500">
              <path d="M165 190 L235 145 L290 85" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Sled Platform High */}
              <rect x="275" y="65" width="25" height="75" rx="6" fill="#0f172a" transform="rotate(45 275 65)" />
            </g>
          ) : (
            /* Knees Bent to Chest */
            <g className="transition-all duration-500">
              <path d="M165 190 L185 130 L220 140" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Sled Platform Down */}
              <rect x="205" y="120" width="25" height="75" rx="6" fill="#0f172a" transform="rotate(45 205 120)" />
            </g>
          )}
        </g>
      )}

      {/* 8. Dumbbell Goblet Squat */}
      {slug === 'dumbbell-goblet-squat' && (
        <g transform="translate(180, 25)">
          {isFinish ? (
            /* Bottom Deep Squat */
            <g className="transition-all duration-500">
              <circle cx="120" cy="110" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
              <ellipse cx="120" cy="175" rx="34" ry="44" fill="url(#charcoalGrad)" />
              {/* Squatting legs: thighs parallel */}
              <path d="M110 205 L60 215 L80 280" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M130 205 L180 215 L160 280" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Goblet Dumbbell held at chest */}
              <rect x="110" y="145" width="20" height="35" rx="4" fill="#0f172a" />
              <rect x="105" y="140" width="30" height="10" rx="3" fill="#d97706" />
              <rect x="105" y="175" width="30" height="10" rx="3" fill="#d97706" />
            </g>
          ) : (
            /* Standing Tall */
            <g className="transition-all duration-500">
              <circle cx="120" cy="45" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
              <ellipse cx="120" cy="125" rx="32" ry="56" fill="url(#charcoalGrad)" />
              {/* Standing legs */}
              <path d="M108 175 L100 280" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              <path d="M132 175 L140 280" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              {/* Goblet Dumbbell held at chest */}
              <rect x="110" y="95" width="20" height="35" rx="4" fill="#0f172a" />
              <rect x="105" y="90" width="30" height="10" rx="3" fill="#d97706" />
              <rect x="105" y="125" width="30" height="10" rx="3" fill="#d97706" />
            </g>
          )}
        </g>
      )}

      {/* 9. Romanian Dumbbell Deadlift */}
      {slug === 'romanian-dumbbell-deadlift' && (
        <g transform="translate(180, 30)">
          {isFinish ? (
            /* Hip Hinge Descent: Back flat, dumbbells at shins */
            <g className="transition-all duration-500">
              <circle cx="215" cy="110" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
              {/* Torso hinged forward at 45 degrees */}
              <ellipse cx="160" cy="140" rx="55" ry="32" fill="url(#charcoalGrad)" transform="rotate(20 160 140)" />
              {/* Legs soft knees pushed back */}
              <path d="M110 160 L100 275" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              {/* Arms hanging dumbbells down shins */}
              <path d="M190 145 L175 220" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" />
              <rect x="155" y="215" width="40" height="14" rx="4" fill="#0f172a" />
              <rect x="170" y="209" width="10" height="26" rx="2" fill="#d97706" />
            </g>
          ) : (
            /* Standing Tall at Top */
            <g className="transition-all duration-500">
              <circle cx="120" cy="45" r="21" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />
              <ellipse cx="120" cy="125" rx="32" ry="56" fill="url(#charcoalGrad)" />
              {/* Standing legs */}
              <path d="M110 175 L110 275" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              {/* Arms holding dumbbells in front of thighs */}
              <path d="M125 105 L135 180" stroke="url(#skinGrad)" strokeWidth="15" strokeLinecap="round" />
              <rect x="115" y="175" width="40" height="14" rx="4" fill="#0f172a" />
              <rect x="130" y="169" width="10" height="26" rx="2" fill="#d97706" />
            </g>
          )}
        </g>
      )}

      {/* 10. Forearm Plank */}
      {slug === 'forearm-plank' && (
        <g transform="translate(70, 70)">
          {/* Floor ground line */}
          <line x1="20" y1="205" x2="440" y2="205" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

          {/* Forearms planted */}
          <rect x="75" y="195" width="60" height="12" rx="4" fill="#334155" />
          {/* Vertical upper arm */}
          <line x1="85" y1="195" x2="85" y2="135" stroke="url(#skinGrad)" strokeWidth="18" strokeLinecap="round" />

          {/* Head & Neck */}
          <circle cx="45" cy="115" r="22" fill="url(#skinGrad)" stroke="#1e293b" strokeWidth="3" />

          {/* Torso & Legs in Straight Rigid Beam */}
          <path
            d="M85 135 L260 145 L400 190"
            stroke="url(#charcoalGrad)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Feet / Toes on ground */}
          <ellipse cx="400" cy="195" rx="14" ry="10" fill="#0f172a" />

          {/* Core Tension Indicator (Animated Pulse) */}
          <path
            d="M80 170 L395 195"
            stroke={isFinish ? '#f59e0b' : '#10b981'}
            strokeWidth="3.5"
            strokeDasharray="6 4"
            opacity="0.85"
          />
        </g>
      )}
    </svg>
  );
}

