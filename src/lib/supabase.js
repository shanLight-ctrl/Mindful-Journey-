import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

let _client = null
function client() {
  if (!_client && url && key) _client = createClient(url, key)
  return _client
}

export function isConfigured() {
  return Boolean(url && key)
}

export async function createSession(moodBefore) {
  const db = client()
  if (!db) return null
  const { data, error } = await db
    .from('sessions')
    .insert({ mood_before: moodBefore })
    .select()
    .single()
  if (error) console.warn('Supabase createSession:', error.message)
  return data?.id ?? null
}

export async function saveChoice(sessionId, sceneNumber, choiceText, emotionTag) {
  const db = client()
  if (!db || !sessionId) return
  const { error } = await db.from('choices').insert({
    session_id: sessionId,
    scene_number: sceneNumber,
    choice_text: choiceText,
    emotion_tag: emotionTag,
  })
  if (error) console.warn('Supabase saveChoice:', error.message)
}

export async function completeSession(sessionId, moodAfter, dominantEmotion, durationSeconds, moodBefore) {
  const db = client()
  if (!db || !sessionId) return
  const { error } = await db
    .from('sessions')
    .update({
      mood_after: moodAfter,
      mood_delta: moodAfter - moodBefore,
      dominant_emotion: dominantEmotion,
      duration_seconds: durationSeconds,
    })
    .eq('id', sessionId)
  if (error) console.warn('Supabase completeSession:', error.message)
}

export async function getDashboardStats() {
  const db = client()
  if (!db) return null

  const [sessionsRes, choicesRes] = await Promise.all([
    db.from('sessions').select('mood_before,mood_after,mood_delta,dominant_emotion,duration_seconds'),
    db.from('choices').select('emotion_tag,scene_number'),
  ])

  if (sessionsRes.error || choicesRes.error) return null
  return { sessions: sessionsRes.data, choices: choicesRes.data }
}
