import { EMOTION_META } from '../../lib/emotions'

export default function JourneyTimeline({ emotions = [], accent = '#ffffff', animate = true }) {
  if (!emotions?.length) return null

  return (
    <div className={`journey-timeline${animate ? ' journey-timeline--animate' : ''}`}>
      <div className="label" style={{ marginBottom: '0.85rem' }}>Your path</div>
      <div className="journey-timeline__track">
        {emotions.map((emotion, i) => {
          const meta = EMOTION_META[emotion] ?? EMOTION_META.neutral
          const prev = i > 0 ? (EMOTION_META[emotions[i - 1]] ?? EMOTION_META.neutral) : null
          return (
            <div key={`${emotion}-${i}`} className="journey-timeline__group">
              {i > 0 && (
                <div
                  className="journey-timeline__connector"
                  style={{
                    background: `linear-gradient(90deg, ${prev.color}66, ${meta.color}66)`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              )}
              <div className="journey-timeline__step" style={{ animationDelay: `${i * 0.12}s` }}>
                <div
                  className="journey-timeline__node"
                  style={{
                    borderColor: meta.color,
                    boxShadow: `0 0 20px ${meta.color}44`,
                    background: `${meta.color}22`,
                  }}
                  title={meta.label}
                >
                  <span>{meta.emoji}</span>
                </div>
                <span className="journey-timeline__label" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="journey-timeline__scene-hint" style={{ color: accent }}>
        {emotions.length} choice{emotions.length !== 1 ? 's' : ''} shaped this chapter
      </div>
    </div>
  )
}
