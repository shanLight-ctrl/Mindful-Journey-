import { useMemo } from 'react'

export default function Particles({ count = 28, variant = 'default' }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: variant === 'sparse' ? 2 + (i % 2) : 2 + (i % 4),
        delay: `${(i % 12) * 0.45}s`,
        duration: `${14 + (i % 9) * 2}s`,
        opacity: 0.15 + (i % 5) * 0.06,
      })),
    [count, variant],
  )

  return (
    <div className={`particles particles--${variant}`} aria-hidden>
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
