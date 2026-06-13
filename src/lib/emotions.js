export const EMOTION_META = {
  neutral:         { label: 'Present',       color: '#8a9ab8', emoji: '○' },
  brave:           { label: 'Brave',         color: '#e8a020', emoji: '⚡' },
  reflective:      { label: 'Reflective',    color: '#7b6ef0', emoji: '◐' },
  avoidant:        { label: 'Hesitant',      color: '#5a6a9a', emoji: '◇' },
  compassionate:   { label: 'Compassionate', color: '#2ecc71', emoji: '♡' },
  impulsive:       { label: 'Impulsive',     color: '#e8455c', emoji: '✦' },
  self_critical:   { label: 'Self-critical', color: '#9a7ab8', emoji: '▼' },
}

export const EMOTION_COLORS = Object.fromEntries(
  Object.entries(EMOTION_META).map(([k, v]) => [k, v.color]),
)
