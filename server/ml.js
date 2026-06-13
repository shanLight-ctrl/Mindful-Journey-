/**
 * Linear Regression with Batch Gradient Descent
 *
 * Goal: predict mood_delta (mood_after − mood_before) from a player's
 *       emotion choice pattern and starting mood.
 *
 * Features (7):
 *   brave_frac, reflective_frac, avoidant_frac, compassionate_frac,
 *   impulsive_frac, self_critical_frac  → fraction of choices per emotion (0..1)
 *   mood_before_norm                    → starting mood normalised (0..1)
 *
 * Target: mood_delta ∈ {-4..+4}
 *
 * Model:  ŷ = w · x + b
 * Loss:   MSE = (1/n) Σ (ŷ_i − y_i)²
 * Update: w_j ← w_j − α · (∂L/∂w_j)
 *         b   ← b   − α · (∂L/∂b)
 */

export const EMOTIONS = [
  'brave',
  'reflective',
  'avoidant',
  'compassionate',
  'impulsive',
  'self_critical',
]
export const N_FEATURES = EMOTIONS.length + 1 // +1 for mood_before

/**
 * Convert an emotion history array + mood_before into a normalised feature vector.
 */
export function extractFeatures(emotionHistory, moodBefore) {
  const counts = Object.fromEntries(EMOTIONS.map(e => [e, 0]))
  emotionHistory.forEach(e => {
    const key = e.replace('-', '_')
    if (key in counts) counts[key]++
  })
  const total = emotionHistory.length || 1
  return [
    ...EMOTIONS.map(e => counts[e] / total), // fraction of each emotion
    moodBefore / 5,                           // normalised 0..1
  ]
}

/**
 * Forward pass: dot(weights, features) + bias
 */
export function predict(features, weights, bias) {
  return features.reduce((sum, x, i) => sum + x * weights[i], bias)
}

/**
 * Mean Squared Error over a dataset.
 */
export function computeLoss(data, weights, bias) {
  if (!data.length) return 0
  const total = data.reduce((sum, { features, target }) => {
    const err = predict(features, weights, bias) - target
    return sum + err * err
  }, 0)
  return total / data.length
}

/**
 * One full epoch of batch gradient descent.
 * Returns updated weights, bias, and MSE for this epoch.
 */
export function gradientStep(data, weights, bias, learningRate) {
  const n = data.length
  if (n === 0) return { weights, bias, loss: 0 }

  const gradW = new Array(N_FEATURES).fill(0)
  let gradB = 0

  for (const { features, target } of data) {
    const error = predict(features, weights, bias) - target // (ŷ - y)
    features.forEach((x, j) => {
      gradW[j] += (2 / n) * error * x  // ∂MSE/∂w_j
    })
    gradB += (2 / n) * error            // ∂MSE/∂b
  }

  const newWeights = weights.map((w, j) => w - learningRate * gradW[j])
  const newBias    = bias - learningRate * gradB
  const loss       = computeLoss(data, newWeights, newBias)

  return { weights: newWeights, bias: newBias, loss }
}

/**
 * Full training loop.
 *
 * @param {Array}  data          - Array of { features, target }
 * @param {Array}  initialWeights - Existing weights to warm-start from (or null)
 * @param {number} initialBias    - Existing bias (or null)
 * @param {Object} opts
 * @param {number} opts.epochs       - Number of gradient steps (default 500)
 * @param {number} opts.learningRate - Step size α (default 0.01)
 * @returns {{ weights, bias, lossHistory }}
 */
export function train(
  data,
  initialWeights = null,
  initialBias    = null,
  { epochs = 500, learningRate = 0.01 } = {},
) {
  let weights = initialWeights ? [...initialWeights] : new Array(N_FEATURES).fill(0)
  let bias    = initialBias ?? 0
  const lossHistory = []

  if (!data.length) return { weights, bias, lossHistory }

  for (let epoch = 0; epoch < epochs; epoch++) {
    const step = gradientStep(data, weights, bias, learningRate)
    weights = step.weights
    bias    = step.bias

    // Record every 50 epochs + final epoch
    if (epoch % 50 === 0 || epoch === epochs - 1) {
      lossHistory.push({ epoch, loss: parseFloat(step.loss.toFixed(6)) })
    }
  }

  return { weights, bias, lossHistory }
}

/**
 * Clamp and round a raw predicted delta to a valid mood-shift integer (-4..+4).
 */
export function clampDelta(raw) {
  return Math.round(Math.max(-4, Math.min(4, raw)))
}
