import { isConfigured } from '../server/gemini.js'
import {
  inferMoodFromWords,
  getWelcomeGreeting,
  getNextScene,
  getEnding,
} from '../server/handlers.js'

function json(res, status, body) {
  res.status(status).json(body)
}

function requireConfigured(req, res) {
  if (!isConfigured()) {
    json(res, 503, { error: 'GEMINI_API_KEY is not set on the server' })
    return false
  }
  return true
}

async function run(handler, req, res) {
  if (!requireConfigured(req, res)) return
  try {
    const result = await handler(req.body ?? {})
    json(res, 200, result)
  } catch (err) {
    console.error('[api]', err.message)
    json(res, 500, { error: err.message || 'Internal server error' })
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, configured: isConfigured() })
  }
  json(res, 405, { error: 'Method not allowed' })
}

export async function moodHandler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  await run(
    ({ userWords, phase }) => inferMoodFromWords(userWords, phase),
    req,
    res,
  )
}

export async function greetingHandler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  await run(
    ({ moodLabel, moodValue }) => getWelcomeGreeting(moodLabel, moodValue),
    req,
    res,
  )
}

export async function sceneHandler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  await run(
    ({
      sceneNumber,
      playerChoice,
      conversationHistory,
      moodBefore,
      emotionHistory,
      worldContext,
    }) => getNextScene(
      sceneNumber,
      playerChoice,
      conversationHistory ?? [],
      moodBefore,
      emotionHistory ?? [],
      worldContext,
    ),
    req,
    res,
  )
}

export async function endingHandler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  await run(
    ({
      emotionHistory,
      moodBefore,
      conversationHistory,
      worldContext,
    }) => getEnding(
      emotionHistory ?? [],
      moodBefore,
      conversationHistory ?? [],
      worldContext,
    ),
    req,
    res,
  )
}
