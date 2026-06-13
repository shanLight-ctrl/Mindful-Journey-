const STEPS = [
  { id: 'world', label: 'World' },
  { id: 'welcome', label: 'Arrive' },
  { id: 'game', label: 'Story' },
  { id: 'end', label: 'End' },
  { id: 'dashboard', label: 'Insights' },
]

export default function ProgressRail({ screen, accent = 'rgba(255,255,255,0.5)' }) {
  const idx = STEPS.findIndex(s => s.id === screen)
  if (idx < 0) return null

  return (
    <nav className="progress-rail" aria-label="Journey progress">
      {STEPS.map((step, i) => (
        <div
          key={step.id}
          className={`progress-rail__step${i <= idx ? ' progress-rail__step--done' : ''}${i === idx ? ' progress-rail__step--active' : ''}`}
        >
          <span
            className="progress-rail__dot"
            style={i <= idx ? { background: accent, boxShadow: `0 0 10px ${accent}66` } : undefined}
          />
          <span className="progress-rail__label">{step.label}</span>
        </div>
      ))}
    </nav>
  )
}
