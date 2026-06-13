/**
 * WellnessAgent — an autonomous AI agent running inside every scene generation.
 *
 * Agent Loop (per scene):
 *
 *   1. PERCEIVE   — read player state (mood, emotion arc, ML prediction, trend)
 *   2. REASON     — call Gemini to decide which tool to use and why
 *   3. ACT        — produce a "modifier" string injected into the scene prompt
 *   4. LOG        — save the decision to Supabase for transparency + replay
 *
 * The agent never blocks the story. If Gemini/DB are unavailable it returns
 * `no_action` silently and the scene generates normally.
 *
 * Available tools:
 *   adjust_tone      — shift narrative warmth / challenge level
 *   add_reflection   — weave a reflective question into the companion message
 *   boost_agency     — emphasise the player's capability and forward motion
 *   mirror_emotion   — deeply reflect the player's dominant feeling back
 *   no_action        — trajectory is healthy; do not intervene
 */

import { generateContent, parseJSON, isConfigured } from './gemini.js'
import { extractFeatures, predict, EMOTIONS, N_FEATURES } from './ml.js'
import { getDb, isDbConfigured } from './db.js'

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = {
  adjust_tone: {
    desc: 'Shift the narrative tone. params: { direction: "warmer"|"grounding"|"challenging" }',
    modifierTemplate: ({ direction }) =>
      `AGENT DIRECTIVE: Adjust narrative tone to be more ${direction}. ` +
      (direction === 'warmer'
        ? 'Add a moment of safety, warmth, or small comfort.'
        : direction === 'grounding'
        ? 'Ground the scene in sensory details — breath, texture, light. Slow the pace.'
        : 'Raise the emotional stakes gently. Invite honest self-examination.'),
  },
  add_reflection: {
    desc: 'Inject a reflective question into the companion message. params: { theme: string }',
    modifierTemplate: ({ theme }) =>
      `AGENT DIRECTIVE: In the companion_message, include a gentle open question about "${theme}". ` +
      'Do not answer it — only plant it quietly.',
  },
  boost_agency: {
    desc: 'Highlight player capability and forward motion. params: { note: string }',
    modifierTemplate: ({ note }) =>
      `AGENT DIRECTIVE: Subtly reinforce the player's sense of agency and capability. ${note} ` +
      'At least one choice should feel genuinely empowering, not just brave.',
  },
  mirror_emotion: {
    desc: 'Deeply reflect the dominant emotion without judgment. params: { emotion: string }',
    modifierTemplate: ({ emotion }) =>
      `AGENT DIRECTIVE: The scene and companion message should quietly acknowledge the player's ` +
      `${emotion} pattern — not to fix it, but to name it with compassion. Awareness is growth.`,
  },
  no_action: {
    desc: 'No intervention needed. Player trajectory is healthy.',
    modifierTemplate: () => '',
  },
}

// ─── Perception ──────────────────────────────────────────────────────────────

function perceive({ sceneNumber, emotionHistory, moodBefore, mlWeights, mlBias }) {
  // Emotion counts
  const counts = Object.fromEntries(EMOTIONS.map(e => [e, 0]))
  emotionHistory.forEach(e => {
    const k = e.replace('-', '_')
    if (k in counts) counts[k]++
  })

  // Emotional trend from last 2 choices
  const positiveSet = new Set(['brave', 'compassionate', 'reflective'])
  const recent = emotionHistory.slice(-2)
  const negCount = recent.filter(e => !positiveSet.has(e.replace('-', '_'))).length
  const trend = negCount >= 2 ? 'struggling' : negCount === 1 ? 'mixed' : 'positive'

  // Dominant emotion
  let dominant = 'neutral'
  if (emotionHistory.length) {
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    dominant = sorted[0][0]
  }

  // ML prediction (if weights exist)
  let predictedDelta = null
  if (mlWeights && mlWeights.length === N_FEATURES) {
    const features = extractFeatures(emotionHistory, moodBefore)
    const raw = predict(features, mlWeights, mlBias ?? 0)
    predictedDelta = Math.round(Math.max(-4, Math.min(4, raw)))
  }

  return { sceneNumber, moodBefore, emotionHistory, counts, trend, dominant, predictedDelta }
}

// ─── Reasoning prompt ────────────────────────────────────────────────────────

function buildReasoningPrompt(obs) {
  const { sceneNumber, moodBefore, emotionHistory, trend, dominant, predictedDelta } = obs
  const arc = emotionHistory.length ? emotionHistory.join(' → ') : 'just starting'

  return `You are the WellnessAgent for "Mindful Journey," an AI companion game.

Your role: observe the player's emotional state and decide ONE gentle narrative intervention for the next scene.

## Current player state
- Scene: ${sceneNumber} of 4
- Starting mood: ${moodBefore}/5
- Emotional arc: ${arc}
- Recent trend: ${trend}
- Dominant pattern: ${dominant}
- ML mood prediction: ${predictedDelta != null ? `${predictedDelta > 0 ? '+' : ''}${predictedDelta} shift predicted` : 'no model data yet'}

## Available tools
${Object.entries(TOOLS).map(([name, t]) => `- ${name}: ${t.desc}`).join('\n')}

## Instructions
1. Assess the player's trajectory in 1 sentence.
2. Decide which single tool would best support them RIGHT NOW.
3. If the player is doing well (positive trend, healthy arc), always choose no_action.
4. Never be heavy-handed — the story must still feel natural.

Respond with ONLY raw valid JSON:
{
  "reasoning": "<1 sentence: your assessment of the player's state>",
  "action": "<one of: adjust_tone | add_reflection | boost_agency | mirror_emotion | no_action>",
  "params": { <tool-specific params, or {} for no_action> }
}`
}

// ─── DB logging ──────────────────────────────────────────────────────────────

async function logDecision(sessionId, obs, decision, modifier) {
  if (!isDbConfigured()) return
  const db = getDb()
  await db.from('agent_decisions').insert({
    session_id: sessionId ?? null,
    scene_number: obs.sceneNumber,
    action: decision.action,
    reasoning: decision.reasoning,
    modifier: modifier || null,
    emotion_history: obs.emotionHistory,
    mood_before: obs.moodBefore,
    predicted_delta: obs.predictedDelta,
  }).then(({ error }) => {
    if (error) console.warn('[agent] log error:', error.message)
  })
}

// ─── Load latest ML weights from DB ─────────────────────────────────────────

async function loadWeightsFromDb() {
  if (!isDbConfigured()) return { weights: null, bias: null }
  const db = getDb()
  const { data } = await db
    .from('ml_weights')
    .select('weights, bias')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return { weights: data?.weights ?? null, bias: data?.bias ?? null }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Run the agent for one scene step.
 *
 * @param {object} state
 * @param {number} state.sceneNumber
 * @param {string[]} state.emotionHistory
 * @param {number}  state.moodBefore
 * @param {string}  state.sessionId   — for DB logging
 * @returns {{ modifier: string, reasoning: string, action: string }}
 */
export async function runAgent(state) {
  // If Gemini not configured, skip silently
  if (!isConfigured()) return { modifier: '', reasoning: '', action: 'no_action' }

  try {
    // 1. Load ML weights for richer perception
    const { weights, bias } = await loadWeightsFromDb()

    // 2. PERCEIVE
    const obs = perceive({ ...state, mlWeights: weights, mlBias: bias })

    // 3. REASON — ask Gemini which tool to use
    const system = buildReasoningPrompt(obs)
    const raw = await generateContent(
      system,
      [{ role: 'user', content: 'Assess the player and decide your action.' }],
      200,
    )
    const decision = parseJSON(raw)

    // 4. ACT — build the modifier string
    const tool = TOOLS[decision.action] ?? TOOLS.no_action
    const modifier = tool.modifierTemplate(decision.params ?? {})

    // 5. LOG (fire-and-forget)
    logDecision(state.sessionId, obs, decision, modifier)

    return {
      modifier,
      reasoning: decision.reasoning ?? '',
      action: decision.action ?? 'no_action',
      params: decision.params ?? {},
    }
  } catch (err) {
    // Agent failures are never surfaced to the player
    console.warn('[agent] failed silently:', err.message)
    return { modifier: '', reasoning: '', action: 'no_action' }
  }
}

/**
 * Fetch the last N agent decisions from DB (for debugging / dashboard).
 */
export async function getAgentLog(limit = 10) {
  if (!isDbConfigured()) return []
  const db = getDb()
  const { data, error } = await db
    .from('agent_decisions')
    .select('scene_number, action, reasoning, modifier, mood_before, predicted_delta, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data ?? []
}
