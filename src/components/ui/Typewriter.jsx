import { useState, useEffect, useRef } from 'react'

function renderMarkdown(text) {
  const parts = text.split(/(\*[^*\n]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    const lines = part.split('\n')
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < lines.length - 1 && <><br /><br /></>}
      </span>
    ))
  })
}

// Uses requestAnimationFrame instead of setInterval so React renders at 60fps
// max (not 125+), keeping the UI thread smooth.
export default function Typewriter({ text, speed = 28, onComplete, className = '' }) {
  const [charCount, setCharCount] = useState(0)
  const [done, setDone] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setCharCount(0)
    setDone(false)
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(ts) {
      if (!startRef.current) startRef.current = ts
      const target = Math.min(Math.floor((ts - startRef.current) / speed), text.length)
      setCharCount(target)
      if (target >= text.length) { setDone(true); return }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [text, speed])

  useEffect(() => {
    if (done) onCompleteRef.current?.()
  }, [done])

  function handleClick() {
    if (done) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setCharCount(text.length)
    setDone(true)
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      style={{ cursor: done ? 'default' : 'pointer' }}
      title={done ? '' : 'Click to skip'}
    >
      {renderMarkdown(text.slice(0, charCount))}
      {!done && <span className="cursor" />}
    </span>
  )
}
