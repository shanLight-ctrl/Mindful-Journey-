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

export default function Typewriter({ text, speed = 28, onComplete, className = '' }) {
  const [charCount, setCharCount] = useState(0)
  const [done, setDone] = useState(false)
  const skipRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  // Keep ref up-to-date without triggering re-renders
  onCompleteRef.current = onComplete

  useEffect(() => {
    skipRef.current = false
    setCharCount(0)
    setDone(false)

    let index = 0
    const timer = setInterval(() => {
      index += 1
      setCharCount(index)
      if (index >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  // Fire onComplete after done flips true — safely outside render
  useEffect(() => {
    if (done) onCompleteRef.current?.()
  }, [done])

  const handleClick = () => {
    if (!done && !skipRef.current) {
      skipRef.current = true
      setCharCount(text.length)
      setDone(true)
    }
  }

  const displayed = text.slice(0, charCount)

  return (
    <span
      className={className}
      onClick={handleClick}
      style={{ cursor: done ? 'default' : 'pointer' }}
      title={done ? '' : 'Click to skip'}
    >
      {renderMarkdown(displayed)}
      {!done && <span className="cursor" />}
    </span>
  )
}
