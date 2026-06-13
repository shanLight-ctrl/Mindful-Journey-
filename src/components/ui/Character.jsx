const EASE = 'transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)'

const POSES = {
  neutral:       { whole: 0,   head: 0,   aL: 15,  aR: -15 },
  brave:         { whole: -5,  head: -10, aL: -42, aR: -58 },
  reflective:    { whole: 4,   head: 18,  aL: 22,  aR: -95 },
  avoidant:      { whole: 12,  head: 16,  aL: 60,  aR: 55  },
  compassionate: { whole: -3,  head: -8,  aL: -55, aR: 24  },
  impulsive:     { whole: -8,  head: -16, aL: -48, aR: -70 },
  self_critical: { whole: 16,  head: 24,  aL: 70,  aR: 65  },
}

export default function Character({ emotion = 'neutral', accent = '#ffffff', size = 72 }) {
  const p = POSES[emotion] ?? POSES.neutral
  const height = Math.round(size * (130 / 72))

  return (
    <div style={{ filter: `drop-shadow(0 4px 14px ${accent}50)` }}>
      <svg
        viewBox="0 0 100 180"
        width={size}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Ground shadow */}
        <ellipse cx="50" cy="175" rx="20" ry="4.5" fill={accent} opacity="0.16" />

        {/* Float / breathe animation wrapper */}
        <g style={{ animation: 'charBreathe 4.5s ease-in-out infinite' }}>

          {/* ── Whole body lean ── */}
          <g style={{ transformOrigin: '50px 90px', transform: `rotate(${p.whole}deg)`, transition: EASE }}>

            {/* Head */}
            <g style={{ transformOrigin: '50px 25px', transform: `rotate(${p.head}deg)`, transition: EASE }}>
              <circle cx="50" cy="25" r="20" fill={accent} opacity="0.07" />
              <circle cx="50" cy="25" r="17" fill="rgba(255,255,255,0.03)" stroke="white" strokeWidth="2.3" opacity="0.9" />
              {/* Eyes */}
              <circle cx="43" cy="23" r="2.5" fill="white" opacity="0.82" />
              <circle cx="57" cy="23" r="2.5" fill="white" opacity="0.82" />
              {/* Accent pupils */}
              <circle cx="44" cy="22" r="1.1" fill={accent} opacity="0.95" />
              <circle cx="58" cy="22" r="1.1" fill={accent} opacity="0.95" />
            </g>

            {/* Neck */}
            <line x1="50" y1="42" x2="50" y2="54" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />

            {/* Torso */}
            <path
              d="M37 54 C35 70 35 97 37 108 L63 108 C65 97 65 70 63 54 Z"
              fill="white" fillOpacity="0.04"
              stroke="white" strokeWidth="1.9"
              strokeLinejoin="round" opacity="0.65"
            />

            {/* Heart glow */}
            <circle cx="50" cy="82" r="3.8" fill={accent} opacity="0.55" />
            <circle cx="50" cy="82" r="7" fill={accent} opacity="0.11" />

            {/* Left arm — pivots at shoulder (37, 60) */}
            <g style={{ transformOrigin: '37px 60px', transform: `rotate(${p.aL}deg)`, transition: EASE }}>
              <path d="M37 60 Q26 83 21 101" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.82" />
              <circle cx="20" cy="104" r="3.4" fill={accent} opacity="0.72" />
            </g>

            {/* Right arm — pivots at shoulder (63, 60) */}
            <g style={{ transformOrigin: '63px 60px', transform: `rotate(${p.aR}deg)`, transition: EASE }}>
              <path d="M63 60 Q74 83 79 101" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.82" />
              <circle cx="80" cy="104" r="3.4" fill={accent} opacity="0.72" />
            </g>

            {/* Legs */}
            <path d="M43 108 Q39 134 37 158" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.70" />
            <path d="M57 108 Q61 134 63 158" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.70" />

            {/* Feet */}
            <path d="M33 158 Q37 163 45 160" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.52" />
            <path d="M59 160 Q67 163 67 158" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.52" />

          </g>
        </g>
      </svg>
    </div>
  )
}
