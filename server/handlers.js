import { generateContent, parseJSON } from './gemini.js'
import { moodPrompt, welcomePrompt, scenePrompt, endingPrompt, getDominantEmotion } from './prompts.js'
import { runAgent } from './agent.js'
import { fallbackMoodResponse, fallbackScene, fallbackEnding } from './fallback.js'

function isCreditsError(err) {
  return /credit|balance|quota|billing|insufficient/i.test(err.message)
}

export async function inferMoodFromWords(userWords, phase = 'arrival') {
  try {
    const system = moodPrompt(userWords, phase)
    const raw = await generateContent(system, [{ role: 'user', content: userWords }], 280)
    return parseJSON(raw)
  } catch (err) {
    console.warn('[mood] using fallback:', err.message)
    return fallbackMoodResponse(userWords)
  }
}

export async function getWelcomeGreeting(moodLabel, moodValue) {
  try {
    const system = welcomePrompt(moodLabel, moodValue)
    return generateContent(system, [{ role: 'user', content: 'Please greet me.' }], 200)
  } catch (err) {
    console.warn('[greeting] using fallback:', err.message)
    return 'Welcome. Whatever you\'re carrying today, there is space for it here. When you\'re ready, your story is waiting.'
  }
}

export async function getNextScene(
  sceneNumber,
  playerChoice,
  conversationHistory,
  moodBefore,
  emotionHistory,
  worldContext = '',
  sessionId = null,
) {
  // Extract worldId from worldContext string ("city" / "village" / "forest" / "digital")
  const worldId = /city/i.test(worldContext) ? 'city'
    : /village/i.test(worldContext) ? 'village'
    : /forest/i.test(worldContext) ? 'forest'
    : /digital/i.test(worldContext) ? 'digital'
    : 'forest'

  let scene
  try {
    const [agentResult, baseSystem] = await Promise.all([
      runAgent({ sceneNumber, emotionHistory, moodBefore, sessionId }),
      Promise.resolve(scenePrompt(sceneNumber, moodBefore, emotionHistory, worldContext)),
    ])
    const system = agentResult.modifier ? `${baseSystem}\n\n${agentResult.modifier}` : baseSystem
    const messages = [
      ...conversationHistory,
      { role: 'user', content: `Scene ${sceneNumber - 1} choice: "${playerChoice}". Generate scene ${sceneNumber}.` },
    ]
    const raw = await generateContent(system, messages, 900)
    scene = parseJSON(raw)
    scene.agent_insight = { action: agentResult.action, reasoning: agentResult.reasoning }
  } catch (err) {
    console.warn('[scene] using fallback:', err.message)
    scene = fallbackScene(sceneNumber, worldId)
    scene.agent_insight = { action: 'no_action', reasoning: '' }
  }

  return scene
}

export async function getEnding(emotionHistory, moodBefore, conversationHistory, worldContext = '') {
  const worldId = /city/i.test(worldContext) ? 'city'
    : /village/i.test(worldContext) ? 'village'
    : /forest/i.test(worldContext) ? 'forest'
    : /digital/i.test(worldContext) ? 'digital'
    : 'forest'

  try {
    const system = endingPrompt(emotionHistory, moodBefore, worldContext)
    const messages = [
      ...conversationHistory,
      { role: 'user', content: 'Write the final ending and reflection for this journey.' },
    ]
    const raw = await generateContent(system, messages, 1000)
    return parseJSON(raw)
  } catch (err) {
    console.warn('[ending] using fallback:', err.message)
    return fallbackEnding(worldId)
  }
}

export { getDominantEmotion }
