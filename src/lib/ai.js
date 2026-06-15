// Zero network calls — everything runs in the browser.
//
// Mood inference  → NRC + AFINN lexicons  (ml.js, instant)
// Scene selection → pre-written branches  (storyBranches.js, instant)
// Companion msgs  → ML dominant emotion picks the most resonant line per scene
// Endings         → dominant game emotion arc (brave / reflective / avoidant)
// ML prediction   → TF.js on WebGL — faster than server-side Node.js

import {
  analyzeEmotionProfile,
  predictMood as mlPredictMood,
  recommendGenre,
  analyzeSentiment,
  warmModel,
  PLUTCHIK,
  getMLWeights as mlGetWeights,
  trainML as mlTrain,
} from './ml.js'

import { MOOD_RESPONSES, GREETINGS, SCENES, ENDINGS } from '../data/storyBranches.js'

// ── Re-exports (client-side ML, no server needed) ─────────────────────────────
export { analyzeEmotionProfile, recommendGenre, analyzeSentiment, warmModel, PLUTCHIK }
export { mlPredictMood as predictMood }

// ── Backend stub — always returns healthy so no error banners show ─────────────
export function checkBackend() {
  return Promise.resolve({ ok: true, configured: true, mode: 'client-only' })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getDominantEmotion(history = []) {
  if (!history.length) return 'reflective'
  const counts = {}
  history.forEach(e => { counts[e] = (counts[e] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function detectWorldId(worldContext = '') {
  const c = worldContext.toLowerCase()
  if (c.includes('city') || c.includes('urban') || c.includes('skyscraper')) return 'city'
  if (c.includes('village') || c.includes('rural') || c.includes('chapel')) return 'village'
  if (c.includes('forest') || c.includes('wilderness') || c.includes('stream')) return 'forest'
  if (c.includes('digital') || c.includes('nexus') || c.includes('2048')) return 'digital'
  return 'forest'
}

// Picks the companion message that best matches the player's current emotion.
// Priority: game emotion → Plutchik equivalent → mood-level fallback → default.
function pickCompanion(scene, emotionHistory, moodBefore) {
  const dominant = getDominantEmotion(emotionHistory)
  const toPlutchik = {
    brave: 'anticipation', reflective: 'trust', avoidant: 'fear',
    compassionate: 'trust', self_critical: 'sadness', impulsive: 'surprise',
  }
  const c = scene.companions
  if (c[dominant]) return c[dominant]
  const mapped = toPlutchik[dominant]
  if (mapped && c[mapped]) return c[mapped]
  if (moodBefore <= 2 && c.sadness) return c.sadness
  if (moodBefore >= 4 && c.joy) return c.joy
  return c.default
}

// ── Mood inference — runs NRC + AFINN in the browser, picks template ───────────
export async function inferMoodFromWords(userWords, _phase = 'arrival') {
  const profile = analyzeEmotionProfile(userWords)
  const LABELS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great']
  const mood_value = profile.mood
  const mood_label = LABELS[mood_value] ?? 'Okay'
  const dominantEmotion = profile.dominant[0] ?? 'default'
  const tier = MOOD_RESPONSES[mood_value] ?? MOOD_RESPONSES[3]
  const response = tier[dominantEmotion] ?? tier.default
  return { mood_value, mood_label, response }
}

// ── Welcome greeting ───────────────────────────────────────────────────────────
export async function getWelcomeGreeting(_moodLabel, moodValue) {
  return GREETINGS[moodValue] ?? GREETINGS[3]
}

// ── Scene — instant lookup, no spinner needed ──────────────────────────────────
export async function getNextScene(
  sceneNumber,
  _playerChoice,
  _conversationHistory,
  moodBefore,
  emotionHistory,
  worldContext = '',
  _sessionId = null,
) {
  const worldId = detectWorldId(worldContext)
  const worldScenes = SCENES[worldId] ?? SCENES.forest
  // sceneNumber 2 → index 0, 3 → index 1, 4 → index 2
  const idx = Math.max(0, Math.min(sceneNumber - 2, worldScenes.length - 1))
  const scene = worldScenes[idx]
  return {
    scene: scene.scene,
    companion_message: pickCompanion(scene, emotionHistory, moodBefore),
    choices: scene.choices ?? [],
    emotion_tag: getDominantEmotion(emotionHistory),
    agent_insight: { action: 'no_action', reasoning: '' },
  }
}

// ── Ending — instant lookup ────────────────────────────────────────────────────
export async function getEnding(emotionHistory, _moodBefore, _conversationHistory, worldContext = '') {
  const worldId = detectWorldId(worldContext)
  const worldEndings = ENDINGS[worldId] ?? ENDINGS.forest
  const dominant = getDominantEmotion(emotionHistory)
  const key = ['brave', 'reflective', 'avoidant'].includes(dominant) ? dominant : 'default'
  return worldEndings[key] ?? worldEndings.default
}

// ── ML passthrough ─────────────────────────────────────────────────────────────
export async function getMLWeights() {
  return mlGetWeights()
}

export async function trainML() {
  return mlTrain([])
}

export async function getAgentLog() {
  return []
}
