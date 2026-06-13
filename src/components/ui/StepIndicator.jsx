export default function StepIndicator({ current, total, label, accent = '#8a9ab8' }) {
  return (
    <div className="step-indicator" style={{ '--step-accent': accent }}>
      <div className="step-indicator__label">
        <span className="label" style={{ color: accent }}>Step {current} of {total}</span>
        {label && <span className="step-indicator__name">{label}</span>}
      </div>
      <div className="step-indicator__track">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`step-indicator__seg${i < current ? ' step-indicator__seg--done' : ''}${i === current - 1 ? ' step-indicator__seg--active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
