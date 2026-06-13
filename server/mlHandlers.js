import { getDb, isDbConfigured } from './db.js'
import { extractFeatures, train, predict, clampDelta, EMOTIONS, N_FEATURES } from './ml.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function requireDb() {
  if (!isDbConfigured()) {
    throw new Error('Supabase not configured — add SUPABASE_URL + SUPABASE_ANON_KEY to .env')
  }
  return getDb()
}

async function loadLatestWeights(db) {
  const { data } = await db
    .from('ml_weights')
    .select('weights, bias, loss, training_sessions, epochs, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

// ─── /api/ml/train ──────────────────────────────────────────────────────────

export async function trainModel() {
  const db = requireDb()

  // 1. Fetch all completed sessions (mood_after must exist)
  const { data: sessions, error: sessErr } = await db
    .from('sessions')
    .select('id, mood_before, mood_after, mood_delta')
    .not('mood_after', 'is', null)

  if (sessErr) throw new Error(sessErr.message)
  if (!sessions.length) {
    return { trained: false, message: 'No completed sessions yet — play a journey first', sessions: 0 }
  }

  // 2. Fetch all choices and group by session_id
  const { data: choices, error: choicesErr } = await db
    .from('choices')
    .select('session_id, emotion_tag')

  if (choicesErr) throw new Error(choicesErr.message)

  const emotionMap = {}
  choices.forEach(c => {
    if (!emotionMap[c.session_id]) emotionMap[c.session_id] = []
    emotionMap[c.session_id].push(c.emotion_tag)
  })

  // 3. Build feature vectors
  const trainingData = sessions.map(s => ({
    features: extractFeatures(emotionMap[s.id] ?? [], s.mood_before),
    target: s.mood_delta ?? (s.mood_after - s.mood_before),
  }))

  // 4. Warm-start from existing weights if available
  const existing = await loadLatestWeights(db)
  const initWeights = existing?.weights ?? null
  const initBias    = existing?.bias    ?? null

  // 5. Run gradient descent
  const { weights, bias, lossHistory } = train(trainingData, initWeights, initBias, {
    epochs: 500,
    learningRate: 0.01,
  })

  const finalLoss = lossHistory[lossHistory.length - 1]?.loss ?? null

  // 6. Persist weights
  const { error: saveErr } = await db.from('ml_weights').insert({
    weights,
    bias,
    loss: finalLoss,
    training_sessions: trainingData.length,
    epochs: 500,
  })
  if (saveErr) throw new Error(saveErr.message)

  // 7. Persist loss history for visualisation
  if (lossHistory.length) {
    await db.from('ml_training_log').insert(
      lossHistory.map(l => ({ epoch: l.epoch, loss: l.loss })),
    )
  }

  // 8. Return named weights map for readability
  const namedWeights = EMOTIONS.reduce(
    (obj, e, i) => ({ ...obj, [e]: parseFloat(weights[i].toFixed(4)) }),
    { mood_before: parseFloat(weights[N_FEATURES - 1].toFixed(4)) },
  )

  return {
    trained: true,
    sessions: trainingData.length,
    epochs: 500,
    finalLoss,
    weights: namedWeights,
    bias: parseFloat(bias.toFixed(4)),
    lossHistory,
  }
}

// ─── /api/ml/predict ────────────────────────────────────────────────────────

export async function predictMood({ emotionHistory, moodBefore }) {
  if (!emotionHistory || moodBefore == null) {
    throw new Error('emotionHistory and moodBefore are required')
  }

  let weights = null
  let bias    = 0

  // Try to load trained weights — gracefully fall back to zeros
  if (isDbConfigured()) {
    const db = getDb()
    const existing = await loadLatestWeights(db)
    if (existing) {
      weights = existing.weights
      bias    = existing.bias
    }
  }

  const isTrained = weights !== null
  if (!isTrained) {
    weights = new Array(N_FEATURES).fill(0)
  }

  const features   = extractFeatures(emotionHistory, moodBefore)
  const rawDelta   = predict(features, weights, bias)
  const delta      = clampDelta(rawDelta)
  const moodAfter  = Math.max(1, Math.min(5, moodBefore + delta))

  return {
    predictedDelta:    delta,
    predictedMoodAfter: moodAfter,
    rawDelta:          parseFloat(rawDelta.toFixed(4)),
    confidence:        isTrained ? 'model' : 'baseline',
  }
}

// ─── /api/ml/weights ────────────────────────────────────────────────────────

export async function getMLWeights() {
  if (!isDbConfigured()) {
    return { weights: null, bias: null, loss: null, trainingSessions: 0, lossHistory: [] }
  }

  const db = getDb()

  const [weightsRes, lossRes] = await Promise.all([
    loadLatestWeights(db),
    db
      .from('ml_training_log')
      .select('epoch, loss')
      .order('epoch', { ascending: true })
      .limit(20),
  ])

  if (!weightsRes) {
    return { weights: null, bias: null, loss: null, trainingSessions: 0, lossHistory: [] }
  }

  const namedWeights = EMOTIONS.reduce(
    (obj, e, i) => ({ ...obj, [e]: parseFloat(weightsRes.weights[i].toFixed(4)) }),
    { mood_before: parseFloat(weightsRes.weights[N_FEATURES - 1].toFixed(4)) },
  )

  return {
    weights:          namedWeights,
    bias:             parseFloat(weightsRes.bias.toFixed(4)),
    loss:             weightsRes.loss,
    trainingSessions: weightsRes.training_sessions,
    lossHistory:      lossRes.data ?? [],
  }
}
