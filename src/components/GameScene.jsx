import { useState, useRef } from 'react'
import { getNextScene, predictMood } from '../lib/ai'
import { saveChoice } from '../lib/supabase'
import { EMOTION_META } from '../lib/emotions'
import Typewriter from './ui/Typewriter'

const TOTAL_SCENES = 4

export default function GameScene({ sessionId, moodBefore, world, onComplete, onEmotionChange }) {
  const [sceneNumber, setSceneNumber] = useState(1)
  const [sceneText, setSceneText] = useState(world.openingScene)
  const [companion, setCompanion] = useState(null)
  const [choices, setChoices] = useState(world.openingChoices)
  const [phase, setPhase] = useState('reading') // reading | choices | loading | final
  const [error, setError] = useState('')
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [choicesExiting, setChoicesExiting] = useState(false)
  const [pickedIndex, setPickedIndex] = useState(null)
  const [captionKey, setCaptionKey] = useState(0)
  const [mlPrediction, setMlPrediction] = useState(null)
  const [agentInsight, setAgentInsight] = useState(null)

  const convHistoryRef = useRef([])
  const emotionHistoryRef = useRef([])

  async function handleChoice(choice, index) {
    if (choicesExiting) return
    setPickedIndex(index)
    setChoicesExiting(true)
    setCurrentEmotion(choice.emotion)
    onEmotionChange?.(choice.emotion)

    const newEmotions = [...emotionHistoryRef.current, choice.emotion]
    emotionHistoryRef.current = newEmotions

    // Live ML prediction — fire-and-forget, never blocks the story
    predictMood(newEmotions, moodBefore)
      .then(p => setMlPrediction(p))
      .catch(() => {})

    saveChoice(sessionId, sceneNumber, choice.text, choice.emotion)

    await new Promise(r => setTimeout(r, 380))

    setPhase('loading')
    setError('')
    setChoicesExiting(false)
    setPickedIndex(null)

    const nextNum = sceneNumber + 1

    try {
      const result = await getNextScene(
        nextNum,
        choice.text,
        convHistoryRef.current,
        moodBefore,
        newEmotions,
        world.context,
        sessionId,
      )

      if (result.agent_insight?.reasoning) {
        setAgentInsight(result.agent_insight)
      }

      convHistoryRef.current = [
        ...convHistoryRef.current,
        { role: 'user', content: `Scene ${sceneNumber} choice: "${choice.text}"` },
        { role: 'assistant', content: JSON.stringify(result) },
      ]

      setSceneText(result.scene || '')
      setCompanion(result.companion_message || null)
      setChoices(result.choices || [])
      setSceneNumber(nextNum)
      setCaptionKey(k => k + 1)
      setPhase('reading')
    } catch (err) {
      console.error(err)
      setError('Something went wrong generating the next scene. Please try again.')
      setPhase('choices')
    }
  }

  function handleTextDone() {
    if (sceneNumber >= TOTAL_SCENES) {
      setPhase('final')
      setTimeout(() => onComplete(emotionHistoryRef.current, convHistoryRef.current), 4000)
    } else {
      setPhase('choices')
    }
  }

  const progress = (sceneNumber / TOTAL_SCENES) * 100
  const isFinal = sceneNumber >= TOTAL_SCENES
  const emotionMeta = EMOTION_META[currentEmotion] ?? EMOTION_META.neutral

  return (
    <div
      className="screen game-scene"
      style={{ padding: 0, background: 'none', '--world-accent': world.accent }}
    >

      {/* HUD */}
      <header className="game-hud">
        <div className="game-hud__row">
          <span className="game-hud__chapter" style={{ color: world.accent }}>
            {world.tag}
          </span>
          <div className="progress progress--game" style={{ color: world.accent }}>
            <div
              className="progress__fill"
              style={{ width: `${progress}%`, background: world.accent }}
            />
          </div>
          <span
            className="label"
            style={{ whiteSpace: 'nowrap', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
          >
            {isFinal ? 'Finale' : `${sceneNumber}/${TOTAL_SCENES}`}
          </span>
        </div>
        {currentEmotion !== 'neutral' && phase !== 'reading' && (
          <div style={{ marginTop: '0.55rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="emotion-badge" style={{ color: emotionMeta.color, borderColor: `${emotionMeta.color}66` }}>
              <span>{emotionMeta.emoji}</span>
              {emotionMeta.label}
            </span>
            {mlPrediction?.confidence === 'model' && (
              <span className="emotion-badge" style={{
                color: mlPrediction.predictedDelta > 0 ? '#3dbb6a' : mlPrediction.predictedDelta < 0 ? '#e8455c' : '#8a9ab8',
                borderColor: mlPrediction.predictedDelta > 0 ? '#3dbb6a44' : mlPrediction.predictedDelta < 0 ? '#e8455c44' : '#8a9ab844',
                fontSize: '0.68rem',
              }}>
                ◈ Model: {mlPrediction.predictedDelta > 0 ? `+${mlPrediction.predictedDelta}` : mlPrediction.predictedDelta} mood
              </span>
            )}
          </div>
        )}
      </header>

      {/* Narration */}
      <div
        key={captionKey}
        className={`caption-box${captionKey > 0 ? ' caption-box--scene-change' : ''}`}
        style={{
          position: 'fixed',
          top: 'clamp(4.5rem, 12vh, 5.5rem)',
          left: 'clamp(1rem, 3vw, 1.75rem)',
          width: 'min(360px, 42vw)',
          maxHeight: 'calc(100vh - clamp(4.5rem, 12vh, 5.5rem) - 2rem)',
          zIndex: 4,
          borderLeft: `3px solid ${world.accent}`,
        }}
      >
        <div className="caption-box__label" style={{ color: world.accent }}>
          Scene {sceneNumber} · {world.name}
        </div>
        <div className="story" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)', lineHeight: 1.82 }}>
          {phase === 'loading' ? (
            <span style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
              {sceneText.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <><br /><br /></>}</span>
              ))}
            </span>
          ) : (
            <Typewriter
              key={`scene-${sceneNumber}-${captionKey}`}
              text={sceneText}
              speed={8}
              onComplete={handleTextDone}
            />
          )}
        </div>
        {phase === 'reading' && (
          <div className="skip-hint">Tap text to skip ·</div>
        )}
      </div>

      {/* Loading */}
      {phase === 'loading' && (
        <div className="thought-wrap thought-wrap--bounce fade-up" style={{
          position: 'fixed',
          bottom: '46vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}>
          <div className="thought-cloud">
            <span /><span /><span />
          </div>
          <div className="thought-rise">
            <span style={{ width: 9, height: 9 }} />
            <span style={{ width: 6, height: 6 }} />
            <span style={{ width: 4, height: 4 }} />
          </div>
          <div className="label" style={{ marginTop: '0.5rem', textShadow: '0 1px 8px #000' }}>
            The story shifts…
          </div>
        </div>
      )}

      {/* Choices */}
      {phase === 'choices' && choices.length > 0 && (
        <div className={`choices-panel fade-up${choicesExiting ? ' choices-panel--exit' : ''}`}>
          <div className="label choices-panel__prompt" style={{
            textAlign: 'center',
            marginBottom: '0.15rem',
            textShadow: '0 1px 8px rgba(0,0,0,1)',
            letterSpacing: '0.22em',
          }}>
            What do you do?
          </div>
          <div className="choices-panel__list">
          {choices.map((choice, i) => {
            const hint = EMOTION_META[choice.emotion]
            return (
              <button
                key={i}
                className={`speech-bubble-btn${pickedIndex === i ? ' speech-bubble-btn--picked' : ''}`}
                onClick={() => handleChoice(choice, i)}
                disabled={choicesExiting}
              >
                {choice.text}
                {hint && (
                  <span className="choice-emotion-hint" style={{ color: hint.color }}>
                    {hint.emoji} {hint.label}
                  </span>
                )}
                {i === choices.length - 1 && <span className="bubble-tail" />}
              </button>
            )
          })}
          </div>
        </div>
      )}

      {/* Agent Insight */}
      {agentInsight && agentInsight.action !== 'no_action' && (phase === 'choices' || phase === 'final') && (
        <div className="fade-up" style={{
          position: 'fixed',
          bottom: 'clamp(5.5rem, 12vh, 7rem)',
          right: 'clamp(1rem, 3vw, 1.75rem)',
          maxWidth: 'min(280px, 34vw)',
          zIndex: 4,
        }}>
          <div style={{
            background: 'rgba(8,8,24,0.72)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '0.55rem 0.75rem',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>
              ◈ WELLNESS AGENT · {agentInsight.action.replace('_', ' ').toUpperCase()}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.52)', fontFamily: 'var(--font-story)', fontStyle: 'italic', lineHeight: 1.5 }}>
              {agentInsight.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Companion */}
      {companion && (phase === 'choices' || phase === 'final') && (
        <div className="fade-up" style={{
          position: 'fixed',
          bottom: 'clamp(1rem, 3vh, 1.75rem)',
          right: 'clamp(1rem, 3vw, 1.75rem)',
          maxWidth: 'min(320px, 36vw)',
          zIndex: 4,
        }}>
          <div className="companion companion--whisper">
            <span className="companion__icon">🌿</span>
            <span>{companion}</span>
          </div>
        </div>
      )}

      {/* Finale */}
      {phase === 'final' && (
        <div className="thought-wrap thought-wrap--bounce fade-up" style={{
          position: 'fixed',
          bottom: '46vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
          alignItems: 'center',
        }}>
          <div className="thought-cloud">
            <span /><span /><span />
          </div>
          <div className="thought-rise">
            <span style={{ width: 9, height: 9 }} />
            <span style={{ width: 6, height: 6 }} />
            <span style={{ width: 4, height: 4 }} />
          </div>
          <div className="label" style={{ marginTop: '0.6rem', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            Chapter complete…
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  )
}
