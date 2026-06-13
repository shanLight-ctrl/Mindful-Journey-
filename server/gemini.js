const MODEL = 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'

export function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function generateContent(system, messages, maxTokens = 1024) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set on the server')

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
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — please try again.')
    throw err
  } finally {
    clearTimeout(timeout)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error?.message || `Anthropic API error ${res.status}`)
  }

  const text = data.content?.[0]?.text
  if (!text) throw new Error('No text in Anthropic response')
  return text
}

export function parseJSON(raw) {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in AI response')
  return JSON.parse(match[0])
}
