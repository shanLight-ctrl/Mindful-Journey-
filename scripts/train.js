/**
 * Backend ML training script — run once with: npm run train
 *
 * Trains the mood prediction model using GoEmotions-inspired synthetic data,
 * then saves the weights to public/ml-weights.json.
 *
 * The browser loads these pre-trained weights instead of training from scratch,
 * cutting startup time from ~10 seconds to near zero.
 */

import * as tf from '@tensorflow/tfjs'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Same architecture as src/lib/ml.js ────────────────────────────────────────
const GAME_EMOTIONS = ['neutral', 'brave', 'reflective', 'avoidant', 'compassionate', 'impulsive', 'self_critical']

function encodeEmotion(e) {
  return GAME_EMOTIONS.map(g => (g === e ? 1 : 0))
}

function buildFeatures(emotionHistory, moodBefore) {
  const feats = [moodBefore / 5]
  const pad = [...emotionHistory.slice(0, 4)]
  while (pad.length < 4) pad.push('neutral')
  pad.forEach(e => feats.push(...encodeEmotion(e)))
  return feats // 29 features
}

// ── GoEmotions-inspired training patterns (same as ml.js) ─────────────────────
const PATTERNS = [
  { weights: { brave: 0.6, compassionate: 0.3 },   moodRange: [2, 5], delta: +0.45 },
  { weights: { avoidant: 0.7, self_critical: 0.3 }, moodRange: [1, 4], delta: -0.25 },
  { weights: { reflective: 0.6, compassionate: 0.4 },moodRange: [1, 5], delta: +0.20 },
  { weights: { brave: 0.4, reflective: 0.4 },       moodRange: [2, 5], delta: +0.35 },
  { weights: { avoidant: 0.5, self_critical: 0.5 }, moodRange: [1, 3], delta: -0.35 },
  { weights: { compassionate: 0.6, brave: 0.4 },    moodRange: [2, 5], delta: +0.40 },
  { weights: { impulsive: 0.6, avoidant: 0.4 },     moodRange: [1, 4], delta: -0.15 },
  { weights: { reflective: 0.8 },                   moodRange: [1, 5], delta: +0.15 },
  { weights: { neutral: 1.0 },                      moodRange: [1, 5], delta:  0.00 },
]

function generateData(n = 1500) {
  const xs = [], ys = []
  for (let i = 0; i < n; i++) {
    const p = PATTERNS[i % PATTERNS.length]
    const moodBefore = p.moodRange[0] + Math.random() * (p.moodRange[1] - p.moodRange[0])
    const choices = Array.from({ length: 4 }, () => {
      const r = Math.random()
      let cum = 0
      for (const [e, w] of Object.entries(p.weights)) {
        cum += w
        if (r < cum) return e
      }
      return 'neutral'
    })
    const expected =
      moodBefore / 5 +
      p.delta * (0.8 + Math.random() * 0.4) +
      (Math.random() - 0.5) * 0.12
    xs.push(buildFeatures(choices, moodBefore))
    ys.push(Math.max(0.1, Math.min(1, expected)))
  }
  return { xs, ys }
}

// ── Build model ───────────────────────────────────────────────────────────────
function buildModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [29], units: 64, activation: 'relu', kernelInitializer: 'glorotUniform' }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 16, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }),
    ],
  })
  model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError', metrics: ['mae'] })
  return model
}

// ── Train and save ────────────────────────────────────────────────────────────
async function run() {
  console.log('Mindful Journey — ML weight generator')
  console.log('======================================')

  const model = buildModel()
  console.log(`Model params: ${model.countParams().toLocaleString()}`)

  console.log('\nGenerating GoEmotions training data (1500 samples)...')
  const { xs, ys } = generateData(1500)
  const x = tf.tensor2d(xs)
  const y = tf.tensor1d(ys)

  console.log('Training (50 epochs)...\n')
  await model.fit(x, y, {
    epochs: 50,
    batchSize: 32,
    shuffle: true,
    validationSplit: 0.1,
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0) {
          console.log(`  Epoch ${String(epoch + 1).padStart(2)} / 50  loss: ${logs.loss.toFixed(4)}  mae: ${logs.mae.toFixed(4)}`)
        }
      },
    },
  })

  x.dispose()
  y.dispose()

  // Serialize weights to plain arrays so the browser can load them.
  // Read data first, then dispose each tensor individually — don't call
  // model.dispose() after, as that would try to free already-freed tensors.
  const serialized = model.getWeights().map(w => {
    const obj = { data: Array.from(w.dataSync()), shape: w.shape }
    w.dispose()
    return obj
  })

  const outDir = join(__dirname, '../public')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'ml-weights.json')
  writeFileSync(outPath, JSON.stringify({ weights: serialized, version: 1 }))

  const sizeKB = Math.round(JSON.stringify({ weights: serialized }).length / 1024)
  console.log(`\n✓ Weights saved → public/ml-weights.json (${sizeKB} KB)`)
  console.log('  Browser will load these instantly — no in-browser training needed.\n')
}

run().catch(err => { console.error(err); process.exit(1) })
