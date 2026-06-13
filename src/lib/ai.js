const API_BASE = '/api'

async function post(path, body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 35000)

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — please try again.')
    throw new Error('Cannot reach the story server. Run npm run dev to start frontend + backend.')
  } finally {
    clearTimeout(timeout)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) return { ok: false, configured: false }
    return res.json()
  } catch {
    return { ok: false, configured: false }
  }
}

// ─── Story AI ─────────────────────────────────────────────────────────────────

export function inferMoodFromWords(userWords, phase = 'arrival') {
  return post('/mood', { userWords, phase })
}

export function getWelcomeGreeting(moodLabel, moodValue) {
  return post('/greeting', { moodLabel, moodValue })
}

export function getNextScene(
  sceneNumber,
  playerChoice,
  conversationHistory,
  moodBefore,
  emotionHistory,
  worldContext = '',
  sessionId = null,
) {
  return post('/scene', {
    sceneNumber,
    playerChoice,
    conversationHistory,
    moodBefore,
    emotionHistory,
    worldContext,
    sessionId,
  })
}

export function getEnding(emotionHistory, moodBefore, conversationHistory, worldContext = '') {
  return post('/ending', {
    emotionHistory,
    moodBefore,
    conversationHistory,
    worldContext,
  })
}

export function getDominantEmotion(history) {
  if (!history.length) return 'reflective'
  const counts = {}
  history.forEach(e => { counts[e] = (counts[e] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// ─── ML endpoints ─────────────────────────────────────────────────────────────

export function predictMood(emotionHistory, moodBefore) {
  return post('/ml/predict', { emotionHistory, moodBefore })
}

export async function getMLWeights() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`${API_BASE}/ml/weights`, { signal: controller.signal })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
    return data
  } finally {
    clearTimeout(timeout)
  }
}

export function trainML() {
  return post('/ml/train', {})
}

// ─── Client-side ML (TF.js + NRC/AFINN lexicons — no server needed) ──────────
// These run entirely in the browser; re-exported from ml.js for convenience.
export { analyzeEmotionProfile, recommendGenre, analyzeSentiment, warmModel, PLUTCHIK } from './ml.js'

// ─── Agent log ────────────────────────────────────────────────────────────────

export async function getAgentLog() {
  try {
    const res = await fetch(`${API_BASE}/agent/log`)
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
