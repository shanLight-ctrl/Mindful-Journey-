import { useState } from 'react'
import { setMuted, isMuted } from '../../lib/audio'

export default function MusicToggle() {
  const [muted, setMutedState] = useState(isMuted())

  function toggle() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <button
      onClick={toggle}
      className="music-toggle"
      title={muted ? 'Unmute music' : 'Mute music'}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  )
}
