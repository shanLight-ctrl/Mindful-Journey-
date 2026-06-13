// Procedural ambient soundscapes — pure Web Audio API, no files needed

let ctx = null
let masterGain = null
let masterFilter = null  // global tonal colour — shifts with mood/emotion
let masterLFO = null     // global movement — speed changes with tension
let masterLFOGain = null
let currentWorldId = null
let activeNodes = []
let muted = false
let targetVol = 0.5

// Per-emotion: volume, filter brightness (Hz), LFO speed (Hz)
const EMOTION_AUDIO = {
  neutral:       { vol: 0.45, filter: 2000, lfo: 0.10 },
  brave:         { vol: 0.70, filter: 4200, lfo: 0.16 },
  reflective:    { vol: 0.38, filter: 1400, lfo: 0.06 },
  avoidant:      { vol: 0.30, filter: 850,  lfo: 0.04 },
  compassionate: { vol: 0.58, filter: 3200, lfo: 0.11 },
  impulsive:     { vol: 0.78, filter: 5500, lfo: 0.22 },
  self_critical: { vol: 0.28, filter: 680,  lfo: 0.035 },
}

// Per-mood-level (1-5): overall tonal brightness and energy
const MOOD_AUDIO = [
  { filter: 700,  lfo: 0.04, vol: 0.28 }, // 1 – Rough
  { filter: 1100, lfo: 0.07, vol: 0.35 }, // 2 – Low
  { filter: 2000, lfo: 0.10, vol: 0.45 }, // 3 – Okay
  { filter: 3400, lfo: 0.14, vol: 0.55 }, // 4 – Good
  { filter: 5800, lfo: 0.19, vol: 0.65 }, // 5 – Great
]

// Sentiment lexicon for real-time typing response
const DARK = ['tired','exhausted','sad','anxious','worried','scared','stressed',
  'overwhelmed','depressed','hopeless','awful','terrible','angry','frustrated',
  'upset','hurt','lost','alone','empty','rough','struggling','broken','numb','heavy']
const BRIGHT = ['happy','good','great','excited','hopeful','calm','peaceful',
  'better','okay','fine','grateful','positive','energized','strong','ready',
  'content','lighter','clearer','relieved','proud','confident','joyful','safe']

// ── AudioContext setup ────────────────────────────────────────────────────────

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()

    masterGain = ctx.createGain()
    masterGain.gain.value = 0

    // Tonal filter — colour of the whole soundscape
    masterFilter = ctx.createBiquadFilter()
    masterFilter.type = 'lowpass'
    masterFilter.frequency.value = 2000
    masterFilter.Q.value = 0.8

    // Global slow LFO modulating filter cutoff
    masterLFO = ctx.createOscillator()
    masterLFO.frequency.value = 0.10
    masterLFOGain = ctx.createGain()
    masterLFOGain.gain.value = 200
    masterLFO.connect(masterLFOGain)
    masterLFOGain.connect(masterFilter.frequency)
    masterLFO.start()

    masterGain.connect(masterFilter)
    masterFilter.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// ── DSP helpers ───────────────────────────────────────────────────────────────

function makeReverb(c, decay = 3) {
  const conv = c.createConvolver()
  const len = Math.floor(c.sampleRate * decay)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  }
  conv.buffer = buf
  return conv
}

function makeNoise(c) {
  const len = c.sampleRate * 3
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true
  return src
}

function makeOsc(c, freq, type = 'sine', detune = 0) {
  const o = c.createOscillator(); o.type = type
  o.frequency.value = freq; o.detune.value = detune; return o
}

// ── World soundscapes ─────────────────────────────────────────────────────────

function buildCity(c, out) {
  const nodes = []
  const reverb = makeReverb(c, 2.5); reverb.connect(out); nodes.push(reverb)
  // Low urban drone
  [[55,'sawtooth',0.07,0],[55.4,'sawtooth',0.06,8],[110,'sine',0.04,-3],[165,'sine',0.02,5]]
    .forEach(([freq, type, amp, det]) => {
      const osc = makeOsc(c, freq, type, det)
      const g = c.createGain(); g.gain.value = amp
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380
      osc.connect(f); f.connect(g); g.connect(reverb); osc.start()
      nodes.push(osc, g, f)
    })
  // Traffic noise
  const noise = makeNoise(c)
  const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 200; nf.Q.value = 0.4
  const ng = c.createGain(); ng.gain.value = 0.018
  noise.connect(nf); nf.connect(ng); ng.connect(out); noise.start()
  nodes.push(noise, nf, ng)
  return nodes
}

function buildVillage(c, out) {
  const nodes = []
  const reverb = makeReverb(c, 4); reverb.connect(out); nodes.push(reverb)
  [[65,0.10],[130,0.07],[195,0.04],[260,0.022],[390,0.012]]
    .forEach(([freq, amp]) => {
      const osc = makeOsc(c, freq, 'sine', (Math.random() - 0.5) * 5)
      const g = c.createGain(); g.gain.value = amp
      osc.connect(g); g.connect(reverb); osc.start()
      nodes.push(osc, g)
    })
  // Wind
  const noise = makeNoise(c)
  const nf = c.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 500
  const ng = c.createGain(); ng.gain.value = 0.014
  noise.connect(nf); nf.connect(ng); ng.connect(out); noise.start()
  nodes.push(noise, nf, ng)
  return nodes
}

function buildForest(c, out) {
  const nodes = []
  const reverb = makeReverb(c, 5); reverb.connect(out); nodes.push(reverb)
  [[45,0.12],[67.5,0.08],[90,0.05],[112,0.026]]
    .forEach(([freq, amp]) => {
      const osc = makeOsc(c, freq, 'sine', (Math.random() - 0.5) * 8)
      const g = c.createGain(); g.gain.value = amp
      osc.connect(g); g.connect(reverb); osc.start()
      nodes.push(osc, g)
    })
  // Rustling
  const noise = makeNoise(c)
  const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 700; nf.Q.value = 0.3
  const ng = c.createGain(); ng.gain.value = 0.022
  noise.connect(nf); nf.connect(ng); ng.connect(out); noise.start()
  nodes.push(noise, nf, ng)
  return nodes
}

function buildDigital(c, out) {
  const nodes = []
  const reverb = makeReverb(c, 2); reverb.connect(out); nodes.push(reverb)
  [[110,'square',0.05],[220,'square',0.035],[330,'sine',0.02],[440,'sine',0.012]]
    .forEach(([freq, type, amp]) => {
      const osc = makeOsc(c, freq, type)
      const g = c.createGain(); g.gain.value = amp
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 950
      osc.connect(f); f.connect(g); g.connect(reverb); osc.start()
      nodes.push(osc, g, f)
    })
  // Digital static
  const noise = makeNoise(c)
  const nf = c.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 2500
  const ng = c.createGain(); ng.gain.value = 0.007
  noise.connect(nf); nf.connect(ng); ng.connect(out); noise.start()
  nodes.push(noise, nf, ng)
  return nodes
}

const BUILDERS = { city: buildCity, village: buildVillage, forest: buildForest, digital: buildDigital }

function killNodes(nodes) {
  nodes.forEach(n => { try { n.stop?.() } catch {} })
}

// ── Ramp helpers ──────────────────────────────────────────────────────────────

function rampParam(param, value, duration = 1.5) {
  const t = ctx.currentTime
  param.cancelScheduledValues(t)
  param.setValueAtTime(param.value, t)
  param.linearRampToValueAtTime(value, t + duration)
}

// ── Public API ────────────────────────────────────────────────────────────────

export function playWorld(worldId) {
  if (!BUILDERS[worldId] || currentWorldId === worldId) return
  const c = getCtx()
  const now = c.currentTime

  if (activeNodes.length) {
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.linearRampToValueAtTime(0, now + 1.4)
    const old = activeNodes
    setTimeout(() => killNodes(old), 1600)
  }

  currentWorldId = worldId
  activeNodes = BUILDERS[worldId](c, masterGain)

  masterGain.gain.setValueAtTime(0, now + 1.5)
  if (!muted) masterGain.gain.linearRampToValueAtTime(targetVol, now + 3.5)
}

export function stopMusic() {
  if (!ctx) return
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
  const old = activeNodes
  setTimeout(() => { killNodes(old); activeNodes = []; currentWorldId = null }, 1700)
}

// Called when player makes an emotional choice
export function setEmotion(emotion) {
  const config = EMOTION_AUDIO[emotion] ?? EMOTION_AUDIO.neutral
  targetVol = config.vol
  if (!ctx) return
  rampParam(masterGain.gain, muted ? 0 : targetVol, 0.9)
  rampParam(masterFilter.frequency, config.filter, 1.2)
  rampParam(masterLFO.frequency, config.lfo, 1.5)
}

// Called after Claude infers mood from user's words (1–5)
export function setMoodLevel(value) {
  const idx = Math.max(0, Math.min(4, Math.round(value) - 1))
  const config = MOOD_AUDIO[idx]
  targetVol = config.vol
  if (!ctx) return
  rampParam(masterGain.gain, muted ? 0 : targetVol, 2.0)
  rampParam(masterFilter.frequency, config.filter, 2.5)
  rampParam(masterLFO.frequency, config.lfo, 2.5)
}

// Called on every keystroke in the text input — instant lexicon analysis
export function setTypingMood(text) {
  if (!ctx || !masterFilter) return
  const lower = text.toLowerCase()
  const words = lower.match(/\b\w+\b/g) || []
  let score = 0
  words.forEach(w => {
    if (DARK.includes(w)) score--
    if (BRIGHT.includes(w)) score++
  })
  const filterHz = score <= -3 ? 650
    : score === -2 ? 900
    : score === -1 ? 1300
    : score === 0  ? 2000
    : score === 1  ? 2800
    : score === 2  ? 3800
    : 5200
  rampParam(masterFilter.frequency, filterHz, 1.2)
}

export function setMuted(val) {
  muted = val
  if (!ctx) return
  rampParam(masterGain.gain, muted ? 0 : targetVol, 0.6)
}

export function isMuted() { return muted }
