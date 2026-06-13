import { useState } from 'react'
import { WORLDS } from '../data/story'

/* ── City: night skyline with blinking windows ── */
function CityIllus() {
  const stars = Array.from({ length: 22 }, (_, i) => ({
    cx: 8 + ((i * 41) % 184),
    cy: 4 + ((i * 19) % 38),
    r: 0.7 + (i % 3) * 0.3,
    dur: 1.5 + (i % 4) * 0.6,
    delay: (i % 6) * 0.35,
  }))
  const wins = [
    [9,50],[16,58],[9,67],[22,44],[33,62],[33,70],[60,36],[67,46],[74,57],[60,66],
    [67,76],[113,48],[120,59],[113,69],[152,64],[159,73],[178,52],[186,63],[178,72],
  ]
  return (
    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04020e"/>
          <stop offset="100%" stopColor="#0e0a28"/>
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#cg)"/>
      {/* Stars */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity="0.5"
          style={{ animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}/>
      ))}
      {/* Moon */}
      <circle cx="172" cy="16" r="9" fill="#e8e0c0" opacity="0.9"/>
      <circle cx="175" cy="13" r="7" fill="#04020e"/>
      {/* Buildings */}
      <rect x="0"   y="48" width="28" height="72" fill="#08061c"/>
      <rect x="5"   y="36" width="18" height="13" fill="#08061c"/>
      <rect x="28"  y="58" width="24" height="62" fill="#0a0825"/>
      <rect x="52"  y="28" width="34" height="92" fill="#07051a"/>
      <rect x="57"  y="18" width="9"  height="11" fill="#07051a"/>
      <rect x="86"  y="52" width="22" height="68" fill="#0a0825"/>
      <rect x="108" y="42" width="38" height="78" fill="#08061c"/>
      <rect x="124" y="30" width="11" height="13" fill="#08061c"/>
      <rect x="146" y="56" width="26" height="64" fill="#0a0825"/>
      <rect x="172" y="42" width="28" height="78" fill="#08061c"/>
      {/* Windows */}
      {wins.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="5" height="3"
          fill={i % 3 === 0 ? '#ffe890' : i % 3 === 1 ? '#99aaff' : '#ffd060'}
          opacity="0.85"
          style={{ animation: `blink ${2.8 + (i % 5) * 0.7}s ease-in-out ${(i % 7) * 0.45}s infinite` }}/>
      ))}
    </svg>
  )
}

/* ── Village: sunrise with hills, house, swaying grass ── */
function VillageIllus() {
  const grass = Array.from({ length: 14 }, (_, i) => ({
    x: 6 + i * 9,
    dur: 1.4 + (i % 3) * 0.55,
    delay: (i % 5) * 0.18,
  }))
  return (
    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a60"/>
          <stop offset="50%" stopColor="#d06030"/>
          <stop offset="100%" stopColor="#b04818"/>
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#vg)"/>
      {/* Sun */}
      <circle cx="168" cy="28" r="14" fill="#ffc840" opacity="0.95"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line key={i}
            x1={168 + Math.cos(rad) * 17} y1={28 + Math.sin(rad) * 17}
            x2={168 + Math.cos(rad) * 24} y2={28 + Math.sin(rad) * 24}
            stroke="#ffc840" strokeWidth="1.8" opacity="0.6"
            style={{ animation: `sunRay ${2.5 + i * 0.2}s ease-in-out ${i * 0.15}s infinite alternate` }}/>
        )
      })}
      {/* Hills */}
      <ellipse cx="70"  cy="120" rx="120" ry="52" fill="#163214"/>
      <ellipse cx="168" cy="120" rx="90"  ry="44" fill="#122a10"/>
      <ellipse cx="10"  cy="120" rx="65"  ry="38" fill="#163214"/>
      {/* House body */}
      <rect x="80" y="72" width="42" height="30" fill="#5a3818" rx="1"/>
      {/* Roof */}
      <polygon points="74,72 101,50 128,72" fill="#7a2020"/>
      {/* Door */}
      <rect x="94" y="86" width="13" height="16" fill="#3a1a08" rx="2"/>
      {/* Windows */}
      <rect x="83" y="77" width="11" height="8" fill="#90ccee" opacity="0.85" rx="1"/>
      <rect x="108" y="77" width="11" height="8" fill="#ffd080" opacity="0.9" rx="1"/>
      {/* Chimney + smoke */}
      <rect x="110" y="52" width="7" height="16" fill="#5a3818"/>
      <circle cx="113" cy="48" r="3.5" fill="#d8cfc8" opacity="0.38"
        style={{ animation: 'smokeUp 2.8s ease-out infinite' }}/>
      <circle cx="115" cy="40" r="5" fill="#d8cfc8" opacity="0.2"
        style={{ animation: 'smokeUp 2.8s ease-out 1s infinite' }}/>
      {/* Trees */}
      <rect x="30" y="78" width="5" height="22" fill="#3a2814"/>
      <ellipse cx="32" cy="72" rx="14" ry="18" fill="#1d5618"/>
      <rect x="54" y="82" width="4" height="18" fill="#3a2814"/>
      <ellipse cx="56" cy="76" rx="10" ry="13" fill="#235c1e"/>
      <rect x="150" y="74" width="5" height="26" fill="#3a2814"/>
      <ellipse cx="152" cy="68" rx="14" ry="18" fill="#1d5618"/>
      <rect x="166" y="78" width="4" height="22" fill="#3a2814"/>
      <ellipse cx="168" cy="72" rx="11" ry="14" fill="#235c1e"/>
      {/* Swaying grass */}
      {grass.map((g, i) => (
        <line key={i} x1={g.x} y1="118" x2={g.x + 2} y2="107"
          stroke="#8a7a28" strokeWidth="1.6" strokeLinecap="round"
          style={{ animation: `sway ${g.dur}s ease-in-out ${g.delay}s infinite alternate`, transformOrigin: `${g.x}px 118px` }}/>
      ))}
    </svg>
  )
}

/* ── Forest: deep canopy, deer silhouette, drifting leaves ── */
function ForestIllus() {
  const leaves = Array.from({ length: 7 }, (_, i) => ({
    cx: 22 + ((i * 49) % 155),
    cy: 28 + ((i * 27) % 65),
    dur: 4 + (i % 3) * 1.6,
    delay: (i % 4) * 1.1,
  }))
  const beams = [30, 68, 106, 144, 178]
  return (
    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#091a09"/>
          <stop offset="100%" stopColor="#030d03"/>
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#fg)"/>
      {/* Light beams */}
      {beams.map((x, i) => (
        <rect key={i} x={x - 5} y="0" width="12" height="120" fill="#90e870" opacity="0.03"
          style={{ animation: `lightBeam ${3.2 + i * 0.7}s ease-in-out ${i * 0.5}s infinite alternate` }}/>
      ))}
      {/* Mid trees */}
      {[5, 45, 90, 130, 168, 192].map((x, i) => (
        <g key={i}>
          <rect x={x} y={42 + (i % 3) * 9} width={5 + i % 3} height="78" fill="#0a1c0a" opacity="0.85"/>
          <ellipse cx={x + 3} cy={42 + (i % 3) * 9} rx={17 + i % 4 * 4} ry={24 + i % 3 * 7} fill="#091609" opacity="0.88"/>
        </g>
      ))}
      {/* Foreground trees (very dark) */}
      <rect x="8"   y="16" width="13" height="104" fill="#050d05"/>
      <ellipse cx="14" cy="18" rx="28" ry="32" fill="#070f07"/>
      <rect x="158" y="12" width="15" height="108" fill="#050d05"/>
      <ellipse cx="165" cy="14" rx="30" ry="34" fill="#070f07"/>
      <rect x="72"  y="0"  width="11" height="120" fill="#060e06"/>
      <ellipse cx="77" cy="2" rx="23" ry="26" fill="#070f07"/>
      {/* Ground */}
      <rect x="0" y="102" width="200" height="18" fill="#050d05"/>
      {/* Mist */}
      <ellipse cx="100" cy="116" rx="115" ry="11" fill="#b8e0a0" opacity="0.07"/>
      <ellipse cx="45"  cy="113" rx="65"  ry="7"  fill="#b8e0a0" opacity="0.05"/>
      {/* Drifting leaves */}
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx="4.5" ry="2.5" fill="#2a6a20" opacity="0.65"
          style={{ animation: `leafDrift ${l.dur}s ease-in-out ${l.delay}s infinite`, transformOrigin: `${l.cx}px ${l.cy}px` }}/>
      ))}
      {/* Deer silhouette */}
      <ellipse cx="122" cy="108" rx="13" ry="6" fill="#09160a"/>
      <rect x="116" y="100" width="3" height="10" fill="#09160a"/>
      <rect x="123" y="100" width="3" height="10" fill="#09160a"/>
      <ellipse cx="132" cy="99" rx="6" ry="5" fill="#09160a"/>
      <line x1="132" y1="94" x2="128" y2="87" stroke="#09160a" strokeWidth="1.5"/>
      <line x1="132" y1="94" x2="136" y2="87" stroke="#09160a" strokeWidth="1.5"/>
      <line x1="128" y1="87" x2="126" y2="83" stroke="#09160a" strokeWidth="1"/>
      <line x1="128" y1="87" x2="130" y2="84" stroke="#09160a" strokeWidth="1"/>
      <line x1="136" y1="87" x2="138" y2="83" stroke="#09160a" strokeWidth="1"/>
    </svg>
  )
}

/* ── Digital: perspective grid, pulse rings, data nodes ── */
function DigitalIllus() {
  const dots = Array.from({ length: 16 }, (_, i) => ({
    cx: 14 + ((i * 45) % 172),
    cy: 8 + ((i * 31) % 104),
    r: 1 + (i % 3) * 0.6,
    color: ['#00ffcc', '#00aaff', '#aa88ff'][i % 3],
    dur: 1.8 + (i % 4) * 0.9,
    delay: (i % 5) * 0.38,
  }))
  const nodes = [
    { cx: 42, cy: 26, col: '#00ffcc' },
    { cx: 158, cy: 32, col: '#00aaff' },
    { cx: 68,  cy: 92, col: '#aa88ff' },
    { cx: 144, cy: 88, col: '#00ffcc' },
  ]
  return (
    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020810"/>
          <stop offset="100%" stopColor="#030c1a"/>
        </linearGradient>
        <radialGradient id="orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00ffee" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#0044bb" stopOpacity="0.6"/>
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="url(#dg)"/>
      {/* Flat grid */}
      {[20,40,60,80,100].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#00ffcc" strokeWidth="0.35" opacity="0.12"/>)}
      {[0,25,50,75,100,125,150,175,200].map(x => <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="#00ffcc" strokeWidth="0.35" opacity="0.08"/>)}
      {/* Perspective grid */}
      {[-80,-40,0,40,80,120,160,200,240,280].map((x, i) => (
        <line key={i} x1={x} y1="120" x2={100 + (x - 100) * 0.08} y2="55" stroke="#00aaff" strokeWidth="0.4" opacity="0.18"/>
      ))}
      {[68,80,92,104].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#00aaff" strokeWidth="0.4" opacity="0.13"/>)}
      {/* Pulse rings */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx="100" cy="56" r="18" fill="none" stroke="#00ffcc" strokeWidth="0.9" opacity="0.5"
          style={{ animation: `ripple 3s ease-out ${i}s infinite`, transformOrigin: '100px 56px' }}/>
      ))}
      {/* Central orb */}
      <circle cx="100" cy="56" r="10" fill="url(#orb)"/>
      <circle cx="100" cy="56" r="6"  fill="#00ffee" opacity="0.9"/>
      <circle cx="97"  cy="53" r="2.5" fill="white" opacity="0.85"/>
      {/* Connection lines */}
      {nodes.map((n, i) => (
        <line key={i} x1="100" y1="56" x2={n.cx} y2={n.cy} stroke={n.col} strokeWidth="0.7" opacity="0.28"
          style={{ animation: `connPulse ${2.2 + i * 0.4}s ease-in-out ${i * 0.5}s infinite` }}/>
      ))}
      {/* Data nodes */}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r="3.5" fill={n.col} opacity="0.85"/>
      ))}
      {/* Floating data dots */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} opacity="0.65"
          style={{ animation: `dataGlow ${d.dur}s ease-in-out ${d.delay}s infinite alternate` }}/>
      ))}
      {/* Binary labels */}
      <text x="8"   y="115" fill="#00ffcc" opacity="0.12" fontSize="6.5" fontFamily="monospace">01101001</text>
      <text x="78"  y="118" fill="#00aaff" opacity="0.12" fontSize="6.5" fontFamily="monospace">10110100</text>
      <text x="148" y="114" fill="#aa88ff" opacity="0.12" fontSize="6.5" fontFamily="monospace">11001011</text>
    </svg>
  )
}

const ILLUS = { city: CityIllus, village: VillageIllus, forest: ForestIllus, digital: DigitalIllus }

export default function WorldSelect({ onSelect, onHover, recommendedWorldId }) {
  const [chosen, setChosen] = useState(null)
  const [enteringName, setEnteringName] = useState(null)

  function pick(world) {
    if (chosen) return
    setChosen(world.id)
    setEnteringName(world.name)
    onHover(null)
    setTimeout(() => onSelect(world), 1100)
  }

  return (
    <div className="screen" style={{ padding: '1.75rem 1.25rem', justifyContent: 'center' }}>
      {enteringName && (
        <div className="world-enter-overlay">
          <span className="world-enter-overlay__text" style={{ color: WORLDS.find(w => w.id === chosen)?.accent }}>
            Entering {enteringName}
          </span>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center' }}>
          <div className="label" style={{ marginBottom: '0.45rem' }}>Mindful Journey</div>
          <div className="title-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.35rem)', marginBottom: '0.35rem' }}>
            Choose Your World
          </div>
          <div style={{ fontFamily: 'var(--font-story)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Where does your story begin?
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {WORLDS.map((world, i) => {
            const Illus = ILLUS[world.id]
            const isChosen = chosen === world.id
            const isRecommended = recommendedWorldId === world.id
            return (
              <button
                key={world.id}
                className={`world-card fade-up${isChosen ? ' chosen' : ''}`}
                style={{
                  animationDelay: `${0.05 + i * 0.1}s`,
                  boxShadow: isChosen
                    ? `0 0 48px ${world.theme.blob}, 0 24px 64px rgba(0,0,0,0.55)`
                    : isRecommended
                    ? `0 0 24px ${world.theme.blob}88, 0 8px 32px rgba(0,0,0,0.35)`
                    : '0 4px 24px rgba(0,0,0,0.35)',
                  borderColor: isChosen ? world.accent + 'aa' : isRecommended ? world.accent + '88' : undefined,
                }}
                onMouseEnter={() => onHover(world.theme)}
                onMouseLeave={() => onHover(null)}
                onClick={() => pick(world)}
                disabled={!!chosen}
              >
                {/* Animated illustration */}
                <div className="world-card__illus">
                  <Illus />
                </div>

                {/* ML recommendation badge */}
                {isRecommended && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 2,
                    padding: '0.18rem 0.5rem', borderRadius: 99,
                    background: `${world.accent}22`, border: `1px solid ${world.accent}88`,
                    color: world.accent, fontSize: '0.6rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', backdropFilter: 'blur(8px)',
                  }}>
                    ✦ Recommended
                  </div>
                )}

                {/* Text info */}
                <div className="world-card__body">
                  <span className="world-card__tag" style={{ color: world.accent }}>{world.tag}</span>
                  <div className="world-card__name">{world.name}</div>
                  <div className="world-card__desc">{world.desc}</div>
                </div>

                <div className="world-card__play" aria-hidden>
                  <span className="world-card__play-icon">▶</span>
                </div>

                <div
                  className="world-card__glow"
                  style={{ background: `radial-gradient(ellipse at 50% 40%, ${world.theme.blob} 0%, transparent 70%)` }}
                />
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
