import { useState, useEffect, useMemo } from 'react'
import { getEnding, inferMoodFromWords, getDominantEmotion, predictMood, trainML } from '../lib/ai'
import { setMoodLevel } from '../lib/audio'
import { completeSession } from '../lib/supabase'
import Typewriter from './ui/Typewriter'
import JourneyTimeline from './ui/JourneyTimeline'
import StepIndicator from './ui/StepIndicator'
import MoodFromWords from './ui/MoodFromWords'

function CelebrateSparks({ active }) {
  const sparks = useMemo(
    () =>
      active
        ? Array.from({ length: 24 }, (_, i) => ({
            id: i,
            left: `${(i * 17 + 5) % 100}%`,
            delay: `${(i % 8) * 0.2}s`,
            color: ['#ffe8a0', '#a8d4ff', '#c8a8ff', '#90ffb8'][i % 4],
          }))
        : [],
    [active],
  )
  if (!active) return null
  return (
    <div className="end-celebrate" aria-hidden>
      {sparks.map(s => (
        <span
          key={s.id}
          className="spark"
          style={{ left: s.left, background: s.color, animationDelay: s.delay }}
        />
      ))}
    </div>
  )
}

export default function EndScreen({
  sessionId,
  moodBefore,
  emotionHistory,
  conversationHistory,
  startTime,
  worldContext,
  worldName,
  worldAccent = '#8a9ab8',
  onShowDashboard,
}) {
  // 1 loading ending | 2 read ending | 3 share feelings | 4 save
  const [step, setStep] = useState(1)
  const [ending, setEnding] = useState(null)
  const [moodAfter, setMoodAfter] = useState(null)
  const [afterResponse, setAfterResponse] = useState('')
  const [saving, setSaving] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [error, setError] = useState('')
  const [mlPrediction, setMlPrediction] = useState(null)

  useEffect(() => {
    // Run ML prediction and ending generation in parallel
    predictMood(emotionHistory, moodBefore).then(setMlPrediction).catch(() => {})
    getEnding(emotionHistory, moodBefore, conversationHistory, worldContext)
      .then(result => {
        setEnding(result)
        setStep(2)
      })
      .catch(err => {
        console.error(err)
        setEnding({
          ending:
            'You stood at the crossroads and you moved — even if just an inch. That quiet motion matters more than you know. Growth rarely announces itself. It arrives in the moment you chose to try, to pause, to feel rather than flee.\n\nThe letter is still on the table. But something in you has shifted. The fear is the same size it was this morning. You, however, are slightly different.\n\nThere is no destination at the end of a journey like this — only the next honest step. And you are already practicing that.',
          companion_reflection:
            'I witnessed every turn you made. There is real courage in this story, even — especially — in the uncertain moments.',
          growth_insight: 'You are more willing to face what is difficult than you give yourself credit for.',
        })
        setStep(2)
      })
  }, [])

  async function handleAfterWords(userWords) {
    setCheckinLoading(true)
    setError('')
    try {
      const result = await inferMoodFromWords(userWords, 'departure')
      setMoodAfter(result.mood_value)
      setAfterResponse(result.response)
      setMoodLevel(result.mood_value)
      setStep(4)
    } catch (err) {
      console.error(err)
      setMoodAfter(3)
      setAfterResponse('Thank you for naming how you feel. That honesty is part of the journey.')
      setStep(4)
    } finally {
      setCheckinLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const dominant = getDominantEmotion(emotionHistory)
    await completeSession(sessionId, moodAfter ?? 3, dominant, duration, moodBefore)
    // Retrain ML model in the background with the new data point
    trainML().catch(() => {})
    setTimeout(() => onShowDashboard(moodAfter ?? 3), 800)
  }

  const moodDelta = moodAfter != null ? moodAfter - moodBefore : null
  const showCelebrate = step >= 3
  const stepLabels = ['Ending', 'Reflect', 'Share', 'Close']

  return (
    <div className="screen" style={{ padding: '1.5rem', justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <CelebrateSparks active={showCelebrate && step === 4} />
      <div className="scroll-box" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2.5rem' }}>

          {step > 1 && (
            <StepIndicator
              current={step - 1}
              total={3}
              label={stepLabels[step - 1]}
              accent={worldAccent}
            />
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
              <div className="label" style={{ marginBottom: '1rem' }}>Step 1 — Weaving your ending…</div>
              <div className="thought-wrap thought-wrap--bounce" style={{ margin: '0 auto', width: 'fit-content' }}>
                <div className="thought-cloud"><span /><span /><span /></div>
              </div>
            </div>
          )}

          {step >= 2 && ending && (
            <>
              <div className="chapter-complete fade-up" style={{ textAlign: 'center', color: worldAccent }}>
                {worldName ? `${worldName} · ` : ''}Chapter Complete
              </div>

              {emotionHistory?.length > 0 && step === 2 && (
                <div className="chart-card fade-up personal-card" style={{ '--card-accent': worldAccent }}>
                  <JourneyTimeline emotions={emotionHistory} accent={worldAccent} />
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="label fade-up" style={{ textAlign: 'center' }}>Your Journey's End</div>
                  <div className="story fade-up delay-1">
                    <Typewriter
                      key="ending"
                      text={ending.ending}
                      speed={18}
                      onComplete={() => setStep(3)}
                    />
                  </div>
                </>
              )}

              {step >= 3 && (
                <>
                  <div className="companion companion--whisper fade-up" style={{ borderLeftColor: worldAccent }}>
                    <span className="companion__icon">🌿</span>
                    <span>{ending.companion_reflection}</span>
                  </div>

                  <div style={{ textAlign: 'center' }} className="fade-up delay-1">
                    <span className="insight-badge">"{ending.growth_insight}"</span>
                  </div>

                  {step === 3 && !checkinLoading && (
                    <MoodFromWords
                      phase="departure"
                      accent={worldAccent}
                      prompt="Now, in your own words — how are you feeling after this journey?"
                      onSubmit={handleAfterWords}
                    />
                  )}

                  {step === 3 && checkinLoading && (
                    <div className="fade-up" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div className="label" style={{ marginBottom: '1rem' }}>Listening…</div>
                      <div className="thought-wrap thought-wrap--bounce" style={{ margin: '0 auto', width: 'fit-content' }}>
                        <div className="thought-cloud"><span /><span /><span /></div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <>
                      <div className="chart-card fade-up personal-card" style={{ '--card-accent': worldAccent }}>
                        <div className="story" style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>
                          {afterResponse}
                        </div>
                        {moodDelta != null && (
                          <span
                            className={`mood-delta mood-delta--${moodDelta > 0 ? 'up' : moodDelta < 0 ? 'down' : 'flat'}`}
                            style={{ display: 'block', textAlign: 'center' }}
                          >
                            {moodDelta > 0 ? `↑ +${moodDelta} from when you arrived` : moodDelta < 0 ? `↓ ${moodDelta} from when you arrived` : '→ similar to when you arrived'}
                          </span>
                        )}
                      </div>

                      {mlPrediction && (
                        <div className="chart-card fade-up delay-1" style={{ '--card-accent': worldAccent }}>
                          <div className="label" style={{ marginBottom: '0.75rem' }}>Neural network prediction</div>
                          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: worldAccent }}>
                                {mlPrediction.predictedMoodAfter.toFixed(1)}
                                <span style={{ fontSize: '1rem', opacity: 0.5 }}>/5</span>
                              </div>
                              <div className="label">Model predicted</div>
                            </div>
                            {moodAfter != null && (
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: worldAccent }}>
                                  {moodAfter}
                                  <span style={{ fontSize: '1rem', opacity: 0.5 }}>/5</span>
                                </div>
                                <div className="label">You reported</div>
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <div className="label" style={{ marginBottom: '0.4rem' }}>Confidence</div>
                              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${Math.round(mlPrediction.confidence * 100)}%`,
                                  background: worldAccent, borderRadius: 3,
                                  transition: 'width 1.2s var(--ease-out-expo)',
                                  boxShadow: `0 0 10px ${worldAccent}66`,
                                }} />
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {Math.round(mlPrediction.confidence * 100)}% confident
                              </div>
                            </div>
                          </div>
                          {mlPrediction.impacts?.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                              <div className="label" style={{ marginBottom: '0.5rem' }}>Emotional impact per choice</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {mlPrediction.impacts.map(({ emotion, impact }, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
                                    <span style={{ width: 90, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                      {emotion.replace('_', ' ')}
                                    </span>
                                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                      <div style={{
                                        height: '100%',
                                        width: `${Math.abs(impact) * 100}%`,
                                        background: impact > 0 ? '#2ecc71' : '#e8455c',
                                        marginLeft: impact < 0 ? 'auto' : 0,
                                        borderRadius: 2,
                                      }} />
                                    </div>
                                    <span style={{ width: 36, textAlign: 'right', color: impact > 0 ? '#2ecc71' : impact < 0 ? '#e8455c' : 'var(--text-muted)' }}>
                                      {impact > 0 ? `+${impact.toFixed(2)}` : impact.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ textAlign: 'center' }} className="fade-up delay-2">
                        <button
                          className="cta"
                          onClick={handleSave}
                          disabled={saving}
                          style={{ borderColor: `${worldAccent}55`, boxShadow: `0 8px 28px ${worldAccent}33` }}
                        >
                          {saving ? 'Saving…' : 'See community insights →'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="error-banner" style={{ position: 'static', transform: 'none' }}>{error}</div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
