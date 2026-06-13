// Unique animated character per mood state

const W = 48
const H = 64

export default function MoodAnim({ value, accent = '#9090ff', scale = 1 }) {
  const map = { 1: Rough, 2: Low, 3: Okay, 4: Good, 5: Great }
  const Anim = map[value] ?? Okay
  const w = W * scale
  const h = H * scale
  return (
    <div style={{ width: w, height: h, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <Anim c={accent} w={w} h={h} />
    </div>
  )
}

// ── 1 · Rough ─ curled up, slow pulse, teardrops falling ──────────────────
function Rough({ c, w = W, h = H }) {
  return (
    <svg viewBox="0 0 54 72" width={w} height={h} style={{ overflow: 'visible' }}>
      <style>{`
        @keyframes ra-shrink {
          0%,100%{transform:scale(1) translateY(0)}
          50%{transform:scale(.91) translateY(3px)}
        }
        @keyframes ra-drop {
          0%{transform:translateY(-2px);opacity:.65}
          100%{transform:translateY(22px);opacity:0}
        }
        .ra-b{animation:ra-shrink 3.8s ease-in-out infinite;transform-origin:27px 54px}
        .ra-d1{animation:ra-drop 2.6s ease-in infinite}
        .ra-d2{animation:ra-drop 2.6s ease-in .95s infinite}
        .ra-d3{animation:ra-drop 2.6s ease-in 1.75s infinite}
      `}</style>
      <ellipse className="ra-d1" cx="22" cy="14" rx="1.7" ry="2.8" fill={c} opacity="0.6" />
      <ellipse className="ra-d2" cx="32" cy="10" rx="1.4" ry="2.3" fill={c} opacity="0.45" />
      <ellipse className="ra-d3" cx="27" cy="8"  rx="1.5" ry="2.5" fill={c} opacity="0.35" />
      <g className="ra-b">
        <circle cx="27" cy="42" r="10" fill={c} opacity="0.07" />
        <circle cx="27" cy="42" r="8.5" fill="none" stroke="white" strokeWidth="2" opacity="0.82" />
        {/* drooped sad eyes */}
        <path d="M23 41.5 Q24 43.5 25 41.5" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M29 41.5 Q30 43.5 31 41.5" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <line x1="27" y1="51" x2="27" y2="57" stroke="white" strokeWidth="1.8" opacity="0.45" />
        {/* curled torso */}
        <path d="M18 57 Q15 65 20 68 Q27 72 34 68 Q39 65 36 57" fill="none" stroke="white" strokeWidth="2" opacity="0.6" strokeLinejoin="round" />
        <path d="M18 58 Q15 64 19 68" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
        <path d="M36 58 Q39 64 35 68" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.5" />
      </g>
      <ellipse cx="27" cy="70" rx="13" ry="1.8" fill={c} opacity="0.1" />
    </svg>
  )
}

// ── 2 · Low ─ seated, slow melancholy rock ────────────────────────────────
function Low({ c, w = W, h = H }) {
  return (
    <svg viewBox="0 0 54 72" width={w} height={h} style={{ overflow: 'visible' }}>
      <style>{`
        @keyframes la-rock {
          0%,100%{transform:rotate(-5deg) translateY(0)}
          50%{transform:rotate(5deg) translateY(-2px)}
        }
        .la-b{animation:la-rock 4.2s ease-in-out infinite;transform-origin:27px 58px}
      `}</style>
      <g className="la-b">
        <circle cx="27" cy="26" r="10" fill={c} opacity="0.07" />
        <circle cx="27" cy="26" r="8.5" fill="none" stroke="white" strokeWidth="2" opacity="0.82" />
        {/* half-closed eyes looking down */}
        <circle cx="23.5" cy="25.5" r="1.8" fill="white" opacity="0.6" />
        <circle cx="30.5" cy="25.5" r="1.8" fill="white" opacity="0.6" />
        <circle cx="23.5" cy="26.3" r="0.9" fill={c} opacity="0.9" />
        <circle cx="30.5" cy="26.3" r="0.9" fill={c} opacity="0.9" />
        {/* heavy eyelids */}
        <path d="M21.5 23.5 Q23.5 25 25.5 23.5" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        <path d="M28.5 23.5 Q30.5 25 32.5 23.5" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        <line x1="27" y1="35" x2="27" y2="43" stroke="white" strokeWidth="1.8" opacity="0.45" />
        {/* torso seated */}
        <path d="M19 43 Q18 55 20 59 L34 59 Q36 55 35 43 Z" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="1.8" opacity="0.58" />
        {/* arms resting on knees */}
        <path d="M19 46 Q11 54 13 62" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.58" />
        <path d="M35 46 Q43 54 41 62" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.58" />
        {/* bent legs */}
        <path d="M21 59 Q18 64 13 65" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <path d="M33 59 Q36 64 41 65" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </g>
      <ellipse cx="27" cy="67" rx="15" ry="2" fill={c} opacity="0.1" />
    </svg>
  )
}

// ── 3 · Okay ─ standing, gentle idle float ────────────────────────────────
function Okay({ c, w = W, h = H }) {
  return (
    <svg viewBox="0 0 54 72" width={w} height={h} style={{ overflow: 'visible' }}>
      <style>{`
        @keyframes oa-float {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)}
        }
        .oa-b{animation:oa-float 4s ease-in-out infinite}
      `}</style>
      <g className="oa-b">
        <circle cx="27" cy="14" r="10" fill={c} opacity="0.07" />
        <circle cx="27" cy="14" r="8.5" fill="none" stroke="white" strokeWidth="2" opacity="0.86" />
        <circle cx="23.5" cy="13" r="1.9" fill="white" opacity="0.75" />
        <circle cx="30.5" cy="13" r="1.9" fill="white" opacity="0.75" />
        <circle cx="24"   cy="12.5" r="0.95" fill={c} opacity="0.95" />
        <circle cx="31"   cy="12.5" r="0.95" fill={c} opacity="0.95" />
        {/* flat mouth */}
        <line x1="23.5" y1="18" x2="30.5" y2="18" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
        <line x1="27" y1="23" x2="27" y2="31" stroke="white" strokeWidth="1.8" opacity="0.5" />
        <path d="M19 31 Q18 44 19 50 L35 50 Q36 44 35 31 Z" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="1.8" opacity="0.62" />
        <circle cx="27" cy="41" r="2.8" fill={c} opacity="0.4" />
        <path d="M19 34 Q12 43 10 52" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.68" />
        <path d="M35 34 Q42 43 44 52" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.68" />
        <path d="M22 50 Q20 60 19 68" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.62" />
        <path d="M32 50 Q34 60 35 68" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.62" />
      </g>
      <ellipse cx="27" cy="70" rx="13" ry="2" fill={c} opacity="0.12" />
    </svg>
  )
}

// ── 4 · Good ─ happy hop, sparkles appear ─────────────────────────────────
function Good({ c, w = W, h = H }) {
  return (
    <svg viewBox="0 0 54 72" width={w} height={h} style={{ overflow: 'visible' }}>
      <style>{`
        @keyframes ga-hop {
          0%,100%{transform:translateY(0)}
          38%{transform:translateY(-9px)}
          60%{transform:translateY(-6px)}
        }
        @keyframes ga-star {
          0%,100%{opacity:0;transform:scale(.4)}
          50%{opacity:.85;transform:scale(1)}
        }
        .ga-b{animation:ga-hop 2.3s cubic-bezier(.34,1.5,.64,1) infinite}
        .ga-s1{animation:ga-star 2.3s ease-in-out .25s infinite}
        .ga-s2{animation:ga-star 2.3s ease-in-out .75s infinite}
      `}</style>
      <text className="ga-s1" x="5"  y="28" fontSize="10" fill={c} textAnchor="middle">✦</text>
      <text className="ga-s2" x="48" y="22" fontSize="8"  fill={c} textAnchor="middle">✦</text>
      <g className="ga-b">
        <circle cx="27" cy="14" r="10" fill={c} opacity="0.08" />
        <circle cx="27" cy="14" r="8.5" fill="none" stroke="white" strokeWidth="2" opacity="0.88" />
        {/* happy curved eyes */}
        <path d="M22 12.5 Q23.5 15.5 25 12.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <path d="M29 12.5 Q30.5 15.5 32 12.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        {/* smile */}
        <path d="M23 18 Q27 21.5 31 18" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="27" y1="23" x2="27" y2="31" stroke="white" strokeWidth="1.8" opacity="0.5" />
        <path d="M19 31 Q18 44 19 50 L35 50 Q36 44 35 31 Z" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="1.8" opacity="0.65" />
        <circle cx="27" cy="41" r="3" fill={c} opacity="0.55" />
        {/* arms open wide */}
        <path d="M19 34 Q10 42 8 51" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
        <path d="M35 34 Q44 42 46 51" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
        <path d="M22 50 Q20 60 19 68" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.65" />
        <path d="M32 50 Q34 60 35 68" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.65" />
      </g>
      <ellipse cx="27" cy="70" rx="13" ry="2" fill={c} opacity="0.15" />
    </svg>
  )
}

// ── 5 · Great ─ jumping, arms raised, stars burst ─────────────────────────
function Great({ c, w = W, h = H }) {
  return (
    <svg viewBox="0 0 54 72" width={w} height={h} style={{ overflow: 'visible' }}>
      <style>{`
        @keyframes gra-jump {
          0%,100%{transform:translateY(0)}
          35%{transform:translateY(-15px)}
          55%{transform:translateY(-10px)}
        }
        @keyframes gra-burst {
          0%{opacity:0;transform:scale(0) rotate(0deg)}
          45%{opacity:1;transform:scale(1.2) rotate(18deg)}
          100%{opacity:0;transform:scale(.5) rotate(36deg)}
        }
        @keyframes gra-burst2 {
          0%{opacity:0;transform:scale(0) rotate(0deg)}
          40%{opacity:1;transform:scale(1) rotate(-14deg)}
          100%{opacity:0;transform:scale(.4) rotate(-28deg)}
        }
        .gra-b{animation:gra-jump 1.65s cubic-bezier(.34,1.65,.64,1) infinite}
        .gra-s1{animation:gra-burst  1.65s ease-out .05s infinite}
        .gra-s2{animation:gra-burst2 1.65s ease-out .42s infinite}
        .gra-s3{animation:gra-burst  1.65s ease-out .72s infinite}
        .gra-s4{animation:gra-burst2 1.65s ease-out .18s infinite}
      `}</style>
      <text className="gra-s1" x="2"  y="22" fontSize="11" fill={c}>✦</text>
      <text className="gra-s2" x="42" y="17" fontSize="9"  fill={c}>✦</text>
      <text className="gra-s3" x="5"  y="40" fontSize="8"  fill={c}>✦</text>
      <text className="gra-s4" x="40" y="36" fontSize="10" fill={c}>✦</text>
      <g className="gra-b">
        <circle cx="27" cy="13" r="10" fill={c} opacity="0.1" />
        <circle cx="27" cy="13" r="8.5" fill="none" stroke="white" strokeWidth="2.1" opacity="0.9" />
        <path d="M22 11 Q23.5 14.5 25 11"   fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
        <path d="M29 11 Q30.5 14.5 32 11"   fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
        <path d="M22 17 Q27 22 32 17"        fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
        <line x1="27" y1="22" x2="27" y2="30" stroke="white" strokeWidth="1.9" opacity="0.5" />
        <path d="M19 30 Q18 43 19 49 L35 49 Q36 43 35 30 Z" fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1.9" opacity="0.7" />
        <circle cx="27" cy="40" r="3.5" fill={c} opacity="0.65" />
        <circle cx="27" cy="40" r="6"   fill={c} opacity="0.14" />
        {/* arms raised high */}
        <path d="M19 32 Q10 21 8 13"  fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
        <path d="M35 32 Q44 21 46 13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
        <circle cx="7"  cy="11" r="2.8" fill={c} opacity="0.72" />
        <circle cx="47" cy="11" r="2.8" fill={c} opacity="0.72" />
        <path d="M22 49 Q20 59 19 67" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.65" />
        <path d="M32 49 Q34 59 35 67" fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" opacity="0.65" />
      </g>
      <ellipse cx="27" cy="70" rx="11" ry="1.8" fill={c} opacity="0.08" />
    </svg>
  )
}
