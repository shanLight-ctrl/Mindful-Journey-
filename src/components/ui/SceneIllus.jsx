/* ── Shared back-view character silhouettes (scaled for 1280×720) ─────── */

const EASE = 'transform 1.1s cubic-bezier(0.34,1.2,0.64,1)'

function Seated({ cx, groundY, cloth, hair, boot, s = 2.2 }) {
  const bH = 30 * s, hR = 13 * s, hY = groundY - bH - hR + 2 * s
  const armW = 10 * s, elbowOut = 38 * s, elbowY = 9 * s
  return (
    <g style={{ animation: `charBreatheScene 5s ease-in-out infinite` }}>
      {/* body blob */}
      <path
        d={`M${cx - 23*s} ${groundY} C${cx - 25*s} ${groundY - 16*s} ${cx - 20*s} ${groundY - bH + 3*s} ${cx - 13*s} ${groundY - bH} C${cx - 5*s} ${groundY - bH - 5*s} ${cx + 5*s} ${groundY - bH - 5*s} ${cx + 13*s} ${groundY - bH} C${cx + 20*s} ${groundY - bH + 3*s} ${cx + 25*s} ${groundY - 16*s} ${cx + 23*s} ${groundY} Z`}
        fill={cloth}
      />
      {/* head */}
      <ellipse cx={cx} cy={hY} rx={hR} ry={hR + s} fill={cloth} />
      {/* hair */}
      <ellipse cx={cx} cy={hY - 8*s} rx={10*s} ry={9*s} fill={hair} />
      <circle cx={cx + s} cy={hY - 17*s} r={5*s} fill={hair} />
      {/* left arm/knee */}
      <path d={`M${cx - 21*s} ${groundY - 13*s} Q${cx - 32*s} ${groundY - 5*s} ${cx - elbowOut} ${groundY - elbowY}`}
        stroke={cloth} strokeWidth={armW} strokeLinecap="round" fill="none" />
      <ellipse cx={cx - elbowOut - 2*s} cy={groundY - elbowY + s} rx={7*s} ry={4*s} fill={boot} />
      {/* right arm/knee */}
      <path d={`M${cx + 21*s} ${groundY - 13*s} Q${cx + 32*s} ${groundY - 5*s} ${cx + elbowOut} ${groundY - elbowY}`}
        stroke={cloth} strokeWidth={armW} strokeLinecap="round" fill="none" />
      <ellipse cx={cx + elbowOut + 2*s} cy={groundY - elbowY + s} rx={7*s} ry={4*s} fill={boot} />
      {/* backpack */}
      <rect x={cx - 11*s} y={groundY - bH + 4*s} width={22*s} height={19*s} rx={3*s} fill={boot} opacity="0.75" />
    </g>
  )
}

function Standing({ cx, groundY, cloth, hair, boot, arms = 'sides', s = 2.2 }) {
  const totH = 72 * s, hY = groundY - totH, shY = hY + 26 * s
  const aL = arms === 'raised'
    ? `M${cx - 19*s} ${shY + 5*s} Q${cx - 28*s} ${shY - 10*s} ${cx - 22*s} ${shY - 22*s}`
    : arms === 'open'
    ? `M${cx - 19*s} ${shY + 5*s} Q${cx - 38*s} ${shY + 8*s} ${cx - 46*s} ${shY + 3*s}`
    : `M${cx - 19*s} ${shY + 5*s} Q${cx - 25*s} ${shY + 18*s} ${cx - 23*s} ${shY + 32*s}`
  const aR = arms === 'raised'
    ? `M${cx + 19*s} ${shY + 5*s} Q${cx + 28*s} ${shY - 10*s} ${cx + 22*s} ${shY - 22*s}`
    : arms === 'open'
    ? `M${cx + 19*s} ${shY + 5*s} Q${cx + 38*s} ${shY + 8*s} ${cx + 46*s} ${shY + 3*s}`
    : `M${cx + 19*s} ${shY + 5*s} Q${cx + 25*s} ${shY + 18*s} ${cx + 23*s} ${shY + 32*s}`
  return (
    <g style={{ animation: `charBreatheScene 5s ease-in-out infinite` }}>
      {/* legs */}
      <path d={`M${cx - 11*s} ${groundY - 22*s} Q${cx - 13*s} ${groundY - 9*s} ${cx - 15*s} ${groundY}`}
        stroke={cloth} strokeWidth={13*s} strokeLinecap="round" fill="none" />
      <path d={`M${cx + 11*s} ${groundY - 22*s} Q${cx + 13*s} ${groundY - 9*s} ${cx + 15*s} ${groundY}`}
        stroke={cloth} strokeWidth={13*s} strokeLinecap="round" fill="none" />
      {/* body */}
      <path d={`M${cx - 19*s} ${groundY - 22*s} C${cx - 21*s} ${groundY - 40*s} ${cx - 21*s} ${shY + 10*s} ${cx - 19*s} ${shY} C${cx - 10*s} ${shY - 5*s} ${cx + 10*s} ${shY - 5*s} ${cx + 19*s} ${shY} C${cx + 21*s} ${shY + 10*s} ${cx + 21*s} ${groundY - 40*s} ${cx + 19*s} ${groundY - 22*s} Z`}
        fill={cloth} />
      {/* head */}
      <ellipse cx={cx} cy={hY} rx={13*s} ry={14*s} fill={cloth} />
      {/* hair */}
      <ellipse cx={cx} cy={hY - 8*s} rx={11*s} ry={10*s} fill={hair} />
      {/* arms */}
      <path d={aL} stroke={cloth} strokeWidth={10*s} strokeLinecap="round" fill="none" />
      <path d={aR} stroke={cloth} strokeWidth={10*s} strokeLinecap="round" fill="none" />
      {/* feet */}
      <ellipse cx={cx - 15*s} cy={groundY} rx={9*s} ry={4*s} fill={boot} />
      <ellipse cx={cx + 15*s} cy={groundY} rx={9*s} ry={4*s} fill={boot} />
    </g>
  )
}

/* ── SVG wrapper style: full-screen fill ─── */
const SVG_STYLE = {
  width: '100%',
  height: '100%',
  display: 'block',
  position: 'absolute',
  inset: 0,
}

/* ── Village: sunset cliff under gnarled tree ─────────────────────────── */
function VillageScene({ isSeated, arms }) {
  const cx = 770, gY = 570, s = 2.2
  const cloth = '#1a2010', hair = '#2a1a0a', boot = '#1a1008'
  return (
    <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
      <defs>
        <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1840" />
          <stop offset="38%" stopColor="#b04a1e" />
          <stop offset="72%" stopColor="#e86428" />
          <stop offset="100%" stopColor="#5a1008" />
        </linearGradient>
        <radialGradient id="v-sun" cx="72%" cy="48%" r="18%">
          <stop offset="0%" stopColor="#ffe090" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#ffb840" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff8820" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="v-suncore" cx="72%" cy="48%" r="5%">
          <stop offset="0%" stopColor="#fff4c0" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffcc50" stopOpacity="0.85" />
        </radialGradient>
        <filter id="v-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect width="1280" height="720" fill="url(#v-sky)" />

      {/* Stars (visible in upper dark portion) */}
      {[
        [80,45],[140,88],[220,32],[310,68],[420,22],[510,55],[600,38],[700,70],
        [170,118],[260,95],[350,130],[50,130],[750,44],[830,90],[950,60],[1050,35],
        [1140,78],[1200,120],[1060,110],[900,130]
      ].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={0.7+(i%3)*0.6} fill="white"
          style={{ animation: `starTwinkle ${2+i*0.3}s ease-in-out ${i*0.25}s infinite` }}
        />
      ))}

      {/* Sun glow + core */}
      <rect width="1280" height="720" fill="url(#v-sun)"
        style={{ animation: `sunGlow 5s ease-in-out infinite`, transformOrigin: '922px 346px' }} />
      <circle cx="922" cy="346" r="52" fill="url(#v-suncore)"
        style={{ animation: `sunGlow 5s ease-in-out infinite`, transformOrigin: '922px 346px' }} />

      {/* Clouds */}
      <g style={{ animation: `cloudFloat 28s ease-in-out infinite` }}>
        <ellipse cx="220" cy="130" rx="110" ry="28" fill="#d87838" opacity="0.18" />
        <ellipse cx="280" cy="112" rx="70" ry="20" fill="#e09040" opacity="0.14" />
      </g>
      <g style={{ animation: `cloudFloat2 36s ease-in-out infinite` }}>
        <ellipse cx="680" cy="100" rx="130" ry="22" fill="#c86028" opacity="0.15" />
        <ellipse cx="740" cy="86" rx="80" ry="16" fill="#d87030" opacity="0.12" />
      </g>

      {/* Distant mountains — layered */}
      <path d="M0 440 Q180 310 380 400 Q540 330 720 400 Q850 340 1000 390 Q1120 350 1280 430 L1280 720 L0 720 Z"
        fill="#3a2818" opacity="0.45" />
      <path d="M0 490 Q200 390 430 460 Q620 405 820 468 Q980 420 1180 465 L1280 480 L1280 720 L0 720 Z"
        fill="#2a1c10" opacity="0.58" />
      <path d="M0 540 Q160 490 340 524 Q520 492 700 528 Q880 498 1060 526 L1280 540 L1280 720 L0 720 Z"
        fill="#1e1208" opacity="0.72" />

      {/* River valley in the distance */}
      <path d="M500 520 Q640 500 760 514 Q860 503 960 516"
        stroke="#4a7898" strokeWidth="3" fill="none" opacity="0.22" />
      <path d="M480 528 Q640 510 770 524 Q880 514 980 528"
        stroke="#3a6888" strokeWidth="2" fill="none" opacity="0.15" />

      {/* Cliff ground */}
      <path d="M0 578 Q280 558 560 572 Q720 558 900 572 Q1100 562 1280 578 L1280 720 L0 720 Z"
        fill="#120c06" />
      <path d="M0 600 Q400 586 700 596 Q1000 586 1280 600 L1280 720 L0 720 Z"
        fill="#0e0a04" />

      {/* Blanket/mat under character */}
      <path d={`M${cx-96} ${gY+8} Q${cx} ${gY} ${cx+96} ${gY+8} L${cx+96} ${gY+22} Q${cx} ${gY+14} ${cx-96} ${gY+22} Z`}
        fill="#4a3820" opacity="0.5" />

      {/* ── Gnarled tree (LEFT side, branches arching RIGHT over character) ── */}
      {/* Main trunk */}
      <g style={{ transformOrigin: '320px 720px', animation: `windBranchSlow 8s ease-in-out infinite` }}>
        <path d="M318 720 Q308 650 300 590 Q292 530 305 468 Q316 418 298 352 Q282 295 292 228 Q300 175 285 115 Q272 65 280 20"
          stroke="#241408" strokeWidth="38" strokeLinecap="round" fill="none" />
        <path d="M318 720 Q308 650 300 590 Q292 530 305 468 Q316 418 298 352 Q282 295 292 228 Q300 175 285 115 Q272 65 280 20"
          stroke="#1a0e06" strokeWidth="28" strokeLinecap="round" fill="none" />

        {/* Main branch arching right over character */}
        <g style={{ transformOrigin: '302px 468px', animation: `windBranch 6s ease-in-out infinite` }}>
          <path d="M302 468 Q440 440 580 458 Q680 470 790 448 Q860 436 920 456"
            stroke="#241408" strokeWidth="22" strokeLinecap="round" fill="none" />
          <path d="M302 468 Q440 440 580 458 Q680 470 790 448 Q860 436 920 456"
            stroke="#1e1008" strokeWidth="15" strokeLinecap="round" fill="none" />

          {/* Sub-branches */}
          <g style={{ transformOrigin: '580px 458px', animation: `windBranch 4.5s ease-in-out 0.5s infinite` }}>
            <path d="M580 458 Q600 418 625 388" stroke="#241408" strokeWidth="10" strokeLinecap="round" fill="none" />
          </g>
          <g style={{ transformOrigin: '680px 465px', animation: `windBranch 5s ease-in-out 0.8s infinite` }}>
            <path d="M680 465 Q705 432 720 410" stroke="#241408" strokeWidth="9" strokeLinecap="round" fill="none" />
          </g>
          <g style={{ transformOrigin: '800px 448px', animation: `windBranch 4s ease-in-out 0.3s infinite` }}>
            <path d="M800 448 Q830 412 850 385" stroke="#241408" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M850 385 Q872 358 888 338" stroke="#241408" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* Upper branches */}
        <g style={{ transformOrigin: '292px 352px', animation: `windBranch 5.5s ease-in-out 1s infinite` }}>
          <path d="M292 352 Q248 310 220 280 Q198 256 188 228"
            stroke="#241408" strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
        <g style={{ transformOrigin: '288px 275px', animation: `windBranch 4.8s ease-in-out 0.6s infinite` }}>
          <path d="M288 275 Q340 240 380 208"
            stroke="#241408" strokeWidth="11" strokeLinecap="round" fill="none" />
        </g>
        <g style={{ transformOrigin: '285px 200px', animation: `windBranch 5.2s ease-in-out 0.2s infinite` }}>
          <path d="M285 200 Q248 168 230 138"
            stroke="#241408" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M285 200 Q318 162 340 130"
            stroke="#241408" strokeWidth="9" strokeLinecap="round" fill="none" />
        </g>

        {/* Foliage clusters — animated sway */}
        {[
          [280,20,72,55], [320,55,82,52], [248,105,68,48],
          [375,195,60,42], [220,265,64,44],
          [500,425,76,50],[570,410,68,44],[640,418,60,40],
          [720,400,65,43],[800,405,58,38],[870,395,52,36],
          [626,385,42,30],[724,408,44,32],[854,382,40,28],
          [192,228,52,36],[168,198,44,32],
        ].map(([fx,fy,rx,ry],i)=>(
          <g key={i} style={{ transformOrigin: `${fx}px ${fy}px`, animation: `windBranch ${4+i*0.3}s ease-in-out ${i*0.2}s infinite` }}>
            <ellipse cx={fx} cy={fy} rx={rx} ry={ry} fill={i<4?"#1a3a12":"#163210"} opacity={0.9 - i*0.025} />
            <ellipse cx={fx} cy={fy} rx={rx*0.6} ry={ry*0.6} fill="#1d4214" opacity={0.4} />
          </g>
        ))}
      </g>

      {/* Ground texture */}
      <ellipse cx="620" cy="598" rx="380" ry="18" fill="#1a1208" opacity="0.35" />

      {/* Character */}
      {isSeated
        ? <Seated cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} s={s} />
        : <Standing cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} arms={arms} s={s} />
      }
    </svg>
  )
}

/* ── City: night rooftop skyline ─────────────────────────────────────── */
function CityScene({ isSeated, arms }) {
  const cx = 680, gY = 488, s = 2.0
  const cloth = '#0e1628', hair = '#1a0f0a', boot = '#0a0e18'
  return (
    <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
      <defs>
        <linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#010310" />
          <stop offset="60%" stopColor="#040d28" />
          <stop offset="100%" stopColor="#08183a" />
        </linearGradient>
        <radialGradient id="c-moon" cx="14%" cy="16%" r="7%">
          <stop offset="0%" stopColor="#d8d0a0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d8d0a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#c-sky)" />

      {/* Stars */}
      {[...Array(55)].map((_,i)=>(
        <circle key={i} cx={12+(i*137)%1256} cy={5+(i*31)%240} r={0.5+(i%4)*0.55} fill="white"
          style={{ animation: `starTwinkle ${2.5+i*0.28}s ease-in-out ${i*0.18}s infinite` }}
        />
      ))}

      {/* Moon */}
      <rect width="1280" height="720" fill="url(#c-moon)" />
      <circle cx="180" cy="112" r="42" fill="#d8d0a0" opacity="0.88"
        style={{ animation: `sunGlow 8s ease-in-out infinite`, transformOrigin: '180px 112px' }} />
      <circle cx="198" cy="96" r="34" fill="#010310" />
      {/* Moon glow halo */}
      <circle cx="180" cy="112" r="72" fill="#d8d0a0" opacity="0.06" />

      {/* Left skyline */}
      {[
        [0,205,62,515],[68,248,44,472],[118,168,80,552],[205,220,54,500],
        [265,275,40,445],[312,195,72,525],[392,238,52,482],[452,148,88,572],
        [548,218,60,502],[614,260,46,460],
      ].map(([x,y,w,hh],i)=>(
        <g key={i}>
          <rect x={x} y={y} width={w} height={hh} fill="#050a1c" />
          <rect x={x} y={y} width={w} height={4} fill="#0a1430" />
        </g>
      ))}
      {/* Right skyline */}
      {[
        [750,228,58,492],[814,178,72,542],[892,255,50,465],[948,208,64,512],
        [1018,268,44,452],[1068,188,78,532],[1152,238,52,482],[1208,198,68,522],
      ].map(([x,y,w,hh],i)=>(
        <g key={i+10}>
          <rect x={x} y={y} width={w} height={hh} fill="#050a1c" />
          <rect x={x} y={y} width={w} height={4} fill="#0a1430" />
        </g>
      ))}

      {/* Building windows — warm+cool lights */}
      {[
        [22,222],[22,242],[22,262],[72,258],[72,278],[130,180],[130,200],[130,220],
        [212,235],[212,255],[270,290],[320,208],[320,228],[400,252],[460,162],[460,182],
        [460,202],[558,232],[558,252],[622,275],
      ].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="9" height="6" fill={i%3?'#ffe890':'#88aaff'} opacity={0.5+(i%4)*0.1}
          style={{ animation: `starTwinkle ${3+i*0.4}s ease-in-out ${i*0.22}s infinite` }}
        />
      ))}
      {[
        [758,242],[758,262],[820,190],[820,210],[900,268],[956,222],[956,242],
        [1025,282],[1075,200],[1075,220],[1075,240],[1160,252],[1160,272],[1215,210],[1215,230],
      ].map(([x,y],i)=>(
        <rect key={i+20} x={x} y={y} width="9" height="6" fill={i%2?'#ffd060':'#99aaff'} opacity={0.5+(i%3)*0.1}
          style={{ animation: `starTwinkle ${3.5+i*0.35}s ease-in-out ${i*0.25}s infinite` }}
        />
      ))}

      {/* Rooftop platform */}
      <rect x="0" y="488" width="1280" height="232" fill="#040818" />
      <rect x="0" y="484" width="1280" height="8" fill="#0c1838" />

      {/* Roof details / vents */}
      <rect x="120" y="468" width="52" height="20" rx="3" fill="#060d1e" />
      <rect x="1100" y="472" width="44" height="16" rx="3" fill="#060d1e" />
      <rect x="400" y="476" width="30" height="12" rx="2" fill="#060d1e" />

      {/* City glow on horizon */}
      <ellipse cx="640" cy="488" rx="560" ry="22" fill="#3060d0" opacity="0.08" />

      {/* Character */}
      {isSeated
        ? <Seated cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} s={s} />
        : <Standing cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} arms={arms} s={s} />
      }
    </svg>
  )
}

/* ── Forest: deep bioluminescent clearing ─────────────────────────────── */
function ForestScene({ isSeated, arms }) {
  const cx = 640, gY = 568, s = 2.2
  const cloth = '#1a140a', hair = '#1a0f0a', boot = '#141008'
  return (
    <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
      <defs>
        <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020806" />
          <stop offset="100%" stopColor="#030e04" />
        </linearGradient>
        <radialGradient id="f-glow" cx="50%" cy="20%" r="55%">
          <stop offset="0%" stopColor="#70d850" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#70d850" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="f-groundglow" cx="50%" cy="100%" r="50%">
          <stop offset="0%" stopColor="#90e870" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#90e870" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#f-sky)" />
      <rect width="1280" height="720" fill="url(#f-glow)" />
      <rect width="1280" height="720" fill="url(#f-groundglow)" />

      {/* Light shafts from canopy */}
      {[380,480,640,800,900].map((x,i)=>(
        <rect key={i} x={x-18} y="0" width={36} height="720"
          fill="#90e870" opacity={i===2?0.032:0.016}
          style={{ animation: `lightBeam ${4+i}s ease-in-out ${i*0.7}s infinite alternate` }}
        />
      ))}

      {/* Background forest trees */}
      {[
        [18,42,30,678],[60,28,24,692],[104,50,28,670],[148,18,34,702],
        [192,38,26,682],[238,32,22,688],[282,46,28,674],[328,22,32,698],
        [372,40,24,680],[418,30,26,690],
      ].map(([x,y,w,hh],i)=>(
        <g key={i}>
          <rect x={x} y={y} width={w} height={hh} fill="#081208" opacity="0.88" />
          <ellipse cx={x+w/2} cy={y} rx={44+i%5*8} ry={56+i%4*12} fill="#060e06" opacity="0.92" />
        </g>
      ))}
      {[
        [862,32,28,688],[908,48,24,672],[952,22,30,698],[998,40,26,680],
        [1042,28,32,692],[1088,44,24,676],[1132,18,28,702],[1178,36,26,684],
        [1224,52,22,668],[1256,30,24,690],
      ].map(([x,y,w,hh],i)=>(
        <g key={i+10}>
          <rect x={x} y={y} width={w} height={hh} fill="#081208" opacity="0.88" />
          <ellipse cx={x+w/2} cy={y} rx={44+i%5*8} ry={56+i%4*12} fill="#060e06" opacity="0.92" />
        </g>
      ))}

      {/* Large foreground frame trees */}
      <rect x="0" y="0" width="38" height="720" fill="#040d04" />
      <ellipse cx="18" cy="0" rx="90" ry="80" fill="#050e05" />
      <rect x="1242" y="0" width="38" height="720" fill="#040d04" />
      <ellipse cx="1262" cy="0" rx="85" ry="75" fill="#050e05" />
      <rect x="192" y="0" width="26" height="720" fill="#050e05" />
      <ellipse cx="205" cy="0" rx="68" ry="65" fill="#060f06" />
      <rect x="1062" y="0" width="24" height="720" fill="#050e05" />
      <ellipse cx="1074" cy="0" rx="65" ry="62" fill="#060f06" />

      {/* Ground mist */}
      <ellipse cx="640" cy="680" rx="620" ry="40" fill="#90e870" opacity="0.07"
        style={{ animation: `mistDrift 10s ease-in-out infinite` }} />
      <ellipse cx="300" cy="665" rx="260" ry="22" fill="#90e870" opacity="0.05"
        style={{ animation: `mistDrift 13s ease-in-out 2s infinite` }} />
      <ellipse cx="980" cy="668" rx="240" ry="20" fill="#90e870" opacity="0.05"
        style={{ animation: `mistDrift 11s ease-in-out 1s infinite` }} />

      {/* Ground */}
      <path d="M0 580 Q320 562 640 572 Q960 562 1280 580 L1280 720 L0 720 Z" fill="#030a03" />
      <ellipse cx="440" cy="582" rx="68" ry="12" fill="#1a3a10" opacity="0.28" />
      <ellipse cx="860" cy="585" rx="58" ry="10" fill="#1a3a10" opacity="0.24" />

      {/* Fireflies — scattered */}
      {[
        [320,460],[430,400],[510,500],[560,430],[680,380],[740,490],[800,440],
        [240,520],[900,415],[980,480],[150,485],[1080,460],
      ].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r={3.5} fill="#90e870" opacity="0.5"
            style={{ animation: `dataGlow ${2+i*0.45}s ease-in-out ${i*0.38}s infinite alternate` }} />
          <circle cx={x} cy={y} r={8} fill="#90e870" opacity="0.06"
            style={{ animation: `auraPulse ${2.5+i*0.4}s ease-in-out ${i*0.3}s infinite` }} />
        </g>
      ))}

      {/* Deer silhouette */}
      <g opacity="0.62">
        <ellipse cx="355" cy="560" rx="36" ry="14" fill="#060d06" />
        <rect x="342" y="542" width="9" height="20" fill="#060d06" />
        <rect x="360" y="542" width="9" height="20" fill="#060d06" />
        <ellipse cx="380" cy="536" rx="16" ry="11" fill="#060d06" />
        <line x1="380" y1="525" x2="372" y2="510" stroke="#060d06" strokeWidth="4" />
        <line x1="380" y1="525" x2="388" y2="510" stroke="#060d06" strokeWidth="4" />
        <line x1="372" y1="510" x2="366" y2="500" stroke="#060d06" strokeWidth="3" />
        <line x1="388" y1="510" x2="394" y2="500" stroke="#060d06" strokeWidth="3" />
      </g>

      {/* Character */}
      {isSeated
        ? <Seated cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} s={s} />
        : <Standing cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} arms={arms} s={s} />
      }
    </svg>
  )
}

/* ── Digital: perspective data-grid void ─────────────────────────────── */
function DigitalScene({ isSeated, arms }) {
  const cx = 640, gY = 560, s = 2.0
  const cloth = '#0a0e1e', hair = '#0a0a14', boot = '#060810'
  return (
    <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={SVG_STYLE}>
      <defs>
        <linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#010610" />
          <stop offset="100%" stopColor="#020c1a" />
        </linearGradient>
        <radialGradient id="d-horizon" cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="d-center" cx="50%" cy="50%" r="30%">
          <stop offset="0%" stopColor="#00aaff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#00aaff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#d-sky)" />
      <rect width="1280" height="720" fill="url(#d-horizon)" />
      <rect width="1280" height="720" fill="url(#d-center)" />

      {/* Flat background grid */}
      {[60,120,180,240,300,360,420,480].map(y=>(
        <line key={y} x1="0" y1={y} x2="1280" y2={y} stroke="#00ffcc" strokeWidth="0.5" opacity="0.07" />
      ))}
      {[0,128,256,384,512,640,768,896,1024,1152,1280].map(x=>(
        <line key={x} x1={x} y1="0" x2={x} y2="720" stroke="#00ffcc" strokeWidth="0.5" opacity="0.05" />
      ))}

      {/* Perspective grid converging to center */}
      {[-400,-280,-160,-80,0,80,160,280,400,520,640,760,880,1000,1120,1200,1360,1480].map((x,i)=>(
        <line key={i} x1={x} y1="720" x2={640+(x-640)*0.05} y2="320"
          stroke="#00aaff" strokeWidth="0.6" opacity="0.14" />
      ))}
      {[380,420,460,500,540,580,620,660,700,720].map(y=>(
        <line key={y} x1="0" y1={y} x2="1280" y2={y} stroke="#00aaff" strokeWidth="0.5" opacity="0.10" />
      ))}

      {/* Pulse rings from vanishing point */}
      {[0,1,2,3].map(i=>(
        <ellipse key={i} cx="640" cy="320" rx={48+i*40} ry={14+i*12}
          fill="none" stroke="#00ffcc" strokeWidth="1.2" opacity="0.16"
          style={{ animation: `ripple 3.5s ease-out ${i*0.9}s infinite`, transformOrigin: '640px 320px' }}
        />
      ))}

      {/* Data nodes with connection lines */}
      {[
        [180,140,'#00ffcc'],[1100,110,'#00aaff'],[320,260,'#aa88ff'],
        [960,240,'#00ffcc'],[140,360,'#00aaff'],[1140,340,'#aa88ff'],
        [240,480,'#00ffcc'],[1020,460,'#aa88ff'],[420,520,'#00aaff'],
        [860,510,'#00ffcc'],
      ].map(([x,y,col],i)=>(
        <g key={i}>
          <line x1={x} y1={y} x2="640" y2="320" stroke={col} strokeWidth="0.8" opacity="0.08"
            style={{ animation: `connPulse ${3+i*0.5}s ease-in-out ${i*0.3}s infinite` }} />
          <circle cx={x} cy={y} r={6} fill={col} opacity="0.4"
            style={{ animation: `auraPulse ${2+i*0.4}s ease-in-out ${i*0.28}s infinite` }} />
          <circle cx={x} cy={y} r={14} fill={col} opacity="0.07" />
        </g>
      ))}

      {/* Ground platform */}
      <path d="M0 572 Q640 555 1280 572 L1280 720 L0 720 Z" fill="#010810" />
      <line x1="0" y1="572" x2="1280" y2="572" stroke="#00ffcc" strokeWidth="2" opacity="0.2" />
      <ellipse cx="640" cy="572" rx="520" ry="12" fill="#00ffcc" opacity="0.04" />

      {/* Floating data particles */}
      {[
        [360,280,'#00ffcc'],[480,200,'#00aaff'],[760,220,'#aa88ff'],
        [880,290,'#00ffcc'],[280,400,'#aa88ff'],[1000,380,'#00aaff'],
        [440,460,'#00ffcc'],[820,450,'#00aaff'],[560,340,'#aa88ff'],
        [720,350,'#00ffcc'],
      ].map(([x,y,col],i)=>(
        <circle key={i} cx={x} cy={y} r={2+(i%3)*1.2} fill={col} opacity="0.48"
          style={{ animation: `dataGlow ${2+i*0.55}s ease-in-out ${i*0.32}s infinite alternate` }}
        />
      ))}

      {/* Binary text streaks */}
      <text x="20" y="710" fill="#00ffcc" opacity="0.06" fontSize="11" fontFamily="monospace">
        01101001 10110100 11001011 01110010 00110101 10101011 11001001 01101101
      </text>
      <text x="820" y="710" fill="#00aaff" opacity="0.06" fontSize="11" fontFamily="monospace">
        10011010 01101100 11010110
      </text>

      {/* Character */}
      {isSeated
        ? <Seated cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} s={s} />
        : <Standing cx={cx} groundY={gY} cloth={cloth} hair={hair} boot={boot} arms={arms} s={s} />
      }
    </svg>
  )
}

/* ── Main export ──────────────────────────────────────────────────────── */
const SEATED = new Set(['neutral', 'reflective', 'avoidant', 'self_critical'])
const ARMS   = { brave: 'sides', compassionate: 'open', impulsive: 'raised' }

export default function SceneIllus({ worldId = 'city', emotion = 'neutral', pulse = false }) {
  const isSeated = SEATED.has(emotion)
  const arms     = ARMS[emotion] ?? 'sides'
  const p        = { isSeated, arms }
  return (
    <div className={`scene-stage${pulse ? ' scene-stage--pulse' : ''}`}>
      {worldId === 'city'    && <CityScene    {...p} />}
      {worldId === 'village' && <VillageScene {...p} />}
      {worldId === 'forest'  && <ForestScene  {...p} />}
      {worldId === 'digital' && <DigitalScene {...p} />}
    </div>
  )
}
