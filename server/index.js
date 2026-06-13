import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { isConfigured } from './gemini.js'
import {
  inferMoodFromWords,
  getWelcomeGreeting,
  getNextScene,
  getEnding,
} from './handlers.js'
import { trainModel, predictMood, getMLWeights } from './mlHandlers.js'
import { getAgentLog } from './agent.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function requireConfigured(_req, res, next) {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set on the server' })
  }
  next()
}

function handleRoute(handler) {
  return async (req, res) => {
    try {
      const result = await handler(req.body ?? {})
      res.json(result)
    } catch (err) {
      console.error('[api]', err.message)
      res.status(500).json({ error: err.message || 'Internal server error' })
    }
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: isConfigured() })
})

app.post('/api/mood', requireConfigured, handleRoute(({ userWords, phase }) =>
  inferMoodFromWords(userWords, phase),
))

app.post('/api/greeting', requireConfigured, handleRoute(({ moodLabel, moodValue }) =>
  getWelcomeGreeting(moodLabel, moodValue),
))

app.post('/api/scene', requireConfigured, handleRoute(({
  sceneNumber,
  playerChoice,
  conversationHistory,
  moodBefore,
  emotionHistory,
  worldContext,
  sessionId,
}) => getNextScene(
  sceneNumber,
  playerChoice,
  conversationHistory ?? [],
  moodBefore,
  emotionHistory ?? [],
  worldContext,
  sessionId ?? null,
)))

app.post('/api/ending', requireConfigured, handleRoute(({
  emotionHistory,
  moodBefore,
  conversationHistory,
  worldContext,
}) => getEnding(
  emotionHistory ?? [],
  moodBefore,
  conversationHistory ?? [],
  worldContext,
)))

// ─── Agent log ───────────────────────────────────────────────────────────────

app.get('/api/agent/log', async (_req, res) => {
  try {
    res.json(await getAgentLog(20))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── ML routes (no Gemini key needed — pure math + DB) ──────────────────────

app.post('/api/ml/train', handleRoute(trainModel))

app.post('/api/ml/predict', handleRoute(({ emotionHistory, moodBefore }) =>
  predictMood({ emotionHistory, moodBefore }),
))

app.get('/api/ml/weights', async (_req, res) => {
  try {
    res.json(await getMLWeights())
  } catch (err) {
    console.error('[api/ml/weights]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Mindful Journey API → http://localhost:${PORT}`)
  if (!isConfigured()) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set — AI routes will return 503')
  }
})
