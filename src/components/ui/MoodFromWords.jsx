import { useState } from 'react'
import { setTypingMood } from '../../lib/audio'
import { analyzeSentiment } from '../../lib/ai'

const PLACEHOLDERS = {
  arrival: 'e.g. I feel tired and unsure, but I showed up anyway…',
  departure: 'e.g. Lighter than when I started, still a little nervous…',
}

export default function MoodFromWords({
  phase = 'arrival',
  prompt,
  onSubmit,
  disabled = false,
  accent = '#8a9ab8',
}) {
  const [text, setText] = useState('')
  const [sentiment, setSentiment] = useState(null)

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    setTypingMood(val)           // real-time audio shift
    if (val.trim().length > 8) {
      setSentiment(analyzeSentiment(val))   // live sentiment indicator
    } else {
      setSentiment(null)
    }
  }

  function handleSubmit(e) {
    e?.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length < 3 || disabled) return
    onSubmit(trimmed)
  }

  const sentimentColor = sentiment
    ? sentiment.score > 0.3 ? '#2ecc71'
    : sentiment.score < -0.3 ? '#e8455c'
    : '#8a9ab8'
    : null

  return (
    <form className="mood-words fade-up" onSubmit={handleSubmit}>
      <p className="story mood-words__prompt">{prompt}</p>
      <textarea
        className="mood-words__input"
        value={text}
        onChange={handleChange}
        placeholder={PLACEHOLDERS[phase]}
        rows={4}
        disabled={disabled}
        maxLength={600}
        style={{ borderColor: sentiment ? `${sentimentColor}66` : `${accent}44`,
          transition: 'border-color 0.8s ease' }}
      />
      <div className="mood-words__footer">
        <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{text.trim().length}/600</span>
          {sentiment && (
            <span style={{ color: sentimentColor, transition: 'color 0.6s ease', fontSize: '0.65rem' }}>
              ● {sentiment.label}
            </span>
          )}
        </span>
        <button
          type="submit"
          className="cta"
          disabled={disabled || text.trim().length < 3}
          style={{ borderColor: `${accent}55` }}
        >
          Continue →
        </button>
      </div>
    </form>
  )
}
