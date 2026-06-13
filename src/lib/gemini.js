const MODEL = 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(system, messages, maxTokens = 1024) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set in .env')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  let res
  try {
    res = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — please try again.')
    throw err
  } finally {
    clearTimeout(timeout)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error?.message || `API error ${res.status}`)
  const text = data.content?.[0]?.text
  if (!text) throw new Error('No text in Claude response.')
  return text
}

function parseJSON(raw) {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in AI response')
  return JSON.parse(match[0])
}

export async function inferMoodFromWords(userWords, phase = 'arrival') {
  const isArrival = phase === 'arrival'
  const system = `You are a warm, empathetic AI companion for "Mindful Journey," a mindfulness storytelling game.

The player ${isArrival ? 'is beginning their journey and described how they feel right now' : 'just finished their story and described how they feel now'} in their own words:

"${userWords}"

1. Infer their emotional state on a 1–5 scale:
   - 1 = Rough (crisis, overwhelmed, very low)
   - 2 = Low (sad, drained, struggling)
   - 3 = Okay (neutral, mixed, steady)
   - 4 = Good (hopeful, calmer, positive)
   - 5 = Great (energized, grateful, strong)

2. Write a warm 2–3 sentence response that mirrors their words back with compassion — never clinical. ${isArrival ? 'Invite them gently into the story ahead.' : 'Honor what shifted (or what is still hard) without forcing positivity.'}

Respond with ONLY raw valid JSON:
{
  "mood_value": <integer 1-5>,
  "mood_label": "<Rough|Low|Okay|Good|Great>",
  "response": "<your 2-3 sentences, plain text>"
}`

  const raw = await callClaude(system, [{ role: 'user', content: userWords }], 320)
  return parseJSON(raw)
}

export async function getWelcomeGreeting(moodLabel, moodValue) {
  const system = `You are a warm, empathetic AI companion for a mindfulness storytelling game called "Mindful Journey."
The player just arrived and shared their mood: ${moodLabel} (${moodValue} out of 5).

Write a warm, personal 2–3 sentence greeting that:
1. Gently acknowledges their emotional state with compassion (not pity)
2. Creates a sense of safety and gentle curiosity about the journey ahead
3. Ends with a soft invitation to begin their story

Tone: poetic, grounding, like a wise caring friend — never clinical or therapeutic.
Plain text only. No emojis. No formatting.`

  return callClaude(system, [{ role: 'user', content: 'Please greet me.' }], 256)
}

export async function getNextScene(sceneNumber, playerChoice, conversationHistory, moodBefore, emotionHistory, worldContext = '') {
  const isLastScene = sceneNumber >= 4
  const emotionSummary = emotionHistory.length ? emotionHistory.join(' → ') : 'journey just beginning'

  const system = `You are the narrator and AI companion for "Mindful Journey," an interactive story about personal growth and overcoming fear.

WORLD SETTING: ${worldContext || 'A universal human crossroads — place and time are left atmospheric and open.'}

The story follows a person navigating this specific world, facing a real crossroads. Your writing is literary, warm, and grounded — always rooted in the sensory details of the chosen world.

Context:
- Player's starting mood: ${moodBefore}/5
- Emotional choices so far: ${emotionSummary}
- This is scene ${sceneNumber} of 4

${isLastScene
  ? 'This is the FINAL GAME SCENE. Write a meaningful closing beat — no more choices. The scene should feel like a turning point, not a resolution. End with a moment of stillness or small forward motion.'
  : 'Write the next scene and offer 3 emotionally distinct choices. Keep all details consistent with the world setting.'}

Respond with ONLY raw valid JSON — no markdown, no code fences:
{
  "scene": "2–3 vivid paragraphs (150–200 words). Literary prose, warm, specific sensory details.",
  "companion_message": "1–2 sentences from your AI companion — a gentle emotional mirror. Starts with 'I notice…' or 'There is something…'",
  ${!isLastScene ? `"choices": [
    {"text": "A brave or action-forward choice (15–25 words)", "emotion": "brave"},
    {"text": "A reflective or inward-turning choice (15–25 words)", "emotion": "reflective"},
    {"text": "An avoidant or self-protective choice (15–25 words)", "emotion": "avoidant"}
  ],` : ''}
  "emotion_tag": "emotion for the choice just made — one of: brave, reflective, avoidant, compassionate, impulsive, self_critical"
}`

  const messages = [
    ...conversationHistory,
    { role: 'user', content: `Scene ${sceneNumber - 1} choice: "${playerChoice}". Generate scene ${sceneNumber}.` },
  ]
  const raw = await callClaude(system, messages, 1200)
  return parseJSON(raw)
}

export async function getEnding(emotionHistory, moodBefore, conversationHistory, worldContext = '') {
  const dominant = getDominantEmotion(emotionHistory)
  const arc = emotionHistory.join(' → ')

  const system = `You are writing the final personal reflection for a player who just completed "Mindful Journey."

WORLD SETTING: ${worldContext || 'A universal human crossroads.'}
Their emotional arc: ${arc}
Dominant pattern: ${dominant}
Starting mood: ${moodBefore}/5

Write a deeply personal, uplifting ending that:
1. Reflects their specific emotional journey (honor avoidant choices too — awareness is growth)
2. Weaves in a real insight naturally into the narrative — never as advice
3. Ends with genuine hope and forward motion

Respond with ONLY raw valid JSON:
{
  "ending": "3–4 paragraphs (200–250 words). Literary, warm, specific to their arc.",
  "companion_reflection": "2 warm sentences to the player. Personal and witnessing.",
  "growth_insight": "One sentence: what this journey quietly revealed about them."
}`

  const messages = [
    ...conversationHistory,
    { role: 'user', content: 'Write the final ending and reflection for this journey.' },
  ]
  const raw = await callClaude(system, messages, 1400)
  return parseJSON(raw)
}

function getDominantEmotion(history) {
  if (!history.length) return 'reflective'
  const counts = {}
  history.forEach(e => { counts[e] = (counts[e] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}
