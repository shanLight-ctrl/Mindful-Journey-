import { useState } from 'react'
import { inferMoodFromWords, analyzeEmotionProfile, recommendGenre } from '../lib/ai'
import { MOODS } from '../data/story'
import Typewriter from './ui/Typewriter'
import StepIndicator from './ui/StepIndicator'
import MoodFromWords from './ui/MoodFromWords'
import { setMoodLevel } from '../lib/audio'

const GREETING = 'Hello. I\'m glad you found your way here today.'
const STEPS = 3

const PLUTCHIK_COLORS = {
  joy: '#f0c040', trust: '#2ecc71', fear: '#8855cc', surprise: '#f08030',
  sadness: '#4488cc', disgust: '#88aa33', anger: '#e8455c', anticipation: '#e8a020',
}

export default function WelcomeScreen({ world, onBegin, onMoodSelect, onGenreRecommend }) {
  const [step, setStep] = useState(1)
  const [aiGreeting, setAiGreeting] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emotionProfile, setEmotionProfile] = useState(null)
  const [recommendation, setRecommendation] = useState(null)

  const accent = world?.accent ?? '#8a9ab8'

  async function handleWordsSubmit(userWords) {
    setLoading(true)
    setError('')

    // Run ML analysis instantly (no API call needed)
    const profile = analyzeEmotionProfile(userWords)
    const rec = recommendGenre(profile)
    setEmotionProfile(profile)
    setRecommendation(rec)
    onGenreRecommend?.(rec)

    try {
      const result = await inferMoodFromWords(userWords, 'arrival')
      const mood = MOODS.find(m => m.value === result.mood_value) ?? MOODS[2]
      onMoodSelect({ ...mood, label: result.mood_label || mood.label })
      setAiGreeting(result.response)
      setMoodLevel(result.mood_value)
      setStep(3)
    } catch (err) {
      console.error(err)
      const fallback = MOODS[2]
      onMoodSelect(fallback)
      setAiGreeting(
        'Thank you for sharing that. Whatever you are carrying, there is room for it here. When you are ready, we can begin your story together.',
      )
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Meet', 'Share', 'Begin']
  const topEmotions = emotionProfile
    ? Object.entries(emotionProfile.scores).filter(([, v]) => v > 0.15).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : []

  return (
    <div
      className="screen welcome-screen"
      style={{ gap: '1.5rem', maxWidth: 'min(560px, 96vw)', margin: '0 auto', textAlign: 'center' }}
    >
      <StepIndicator current={step} total={STEPS} label={stepLabels[step - 1]} accent={accent} />

      <div className="fade-up">
        <div className="label" style={{ marginBottom: '0.35rem' }}>Mindful Journey</div>
        {world && (
          <div className="title-display" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.65rem)', color: accent, marginBottom: '0.25rem' }}>
            {world.name}
          </div>
        )}
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-story)', fontSize: '0.95rem', fontStyle: 'italic' }}>
          {world ? world.desc : 'an AI wellness story'}
        </div>
      </div>

      {step === 1 && (
        <div className="story fade-up delay-1" style={{ fontSize: '1.2rem' }}>
          <Typewriter text={GREETING} speed={40} onComplete={() => setTimeout(() => setStep(2), 500)} />
        </div>
      )}

      {step === 2 && !loading && (
        <MoodFromWords
          phase="arrival"
          accent={accent}
          prompt="In your own words — how are you arriving today? There is no wrong answer."
          onSubmit={handleWordsSubmit}
        />
      )}

      {step === 2 && loading && (
        <div className="fade-up" style={{ padding: '2rem 0' }}>
          <div className="label" style={{ marginBottom: '1rem' }}>Listening…</div>
          <div className="thought-wrap thought-wrap--bounce" style={{ margin: '0 auto', width: 'fit-content' }}>
            <div className="thought-cloud"><span /><span /><span /></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          {/* Emotion profile from NRC/AFINN analysis */}
          {topEmotions.length > 0 && (
            <div className="chart-card fade-up" style={{ '--card-accent': accent, textAlign: 'left' }}>
              <div className="label" style={{ marginBottom: '0.6rem' }}>
                Emotion pattern detected · NRC + AFINN analysis
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {topEmotions.map(([emotion, strength]) => (
                  <span key={emotion} style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 99,
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    textTransform: 'capitalize',
                    background: `${PLUTCHIK_COLORS[emotion]}22`,
                    border: `1px solid ${PLUTCHIK_COLORS[emotion]}55`,
                    color: PLUTCHIK_COLORS[emotion],
                  }}>
                    {emotion} {Math.round(strength * 100)}%
                  </span>
                ))}
              </div>
              {recommendation && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem' }}>
                  <span className="label" style={{ display: 'block', marginBottom: '0.2rem' }}>
                    Recommended genre · GoEmotions model
                  </span>
                  <span style={{ fontFamily: 'var(--font-story)', fontSize: '1rem', color: accent }}>
                    {recommendation.genre}
                  </span>
                  <span style={{ fontFamily: 'var(--font-story)', fontStyle: 'italic', fontSize: '0.85rem',
                    color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                    {recommendation.desc}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="story fade-up" style={{ fontSize: '1.15rem', textAlign: 'left' }}>
            <Typewriter key={aiGreeting} text={aiGreeting} speed={26} onComplete={() => {}} />
          </div>

          <button
            className="cta fade-up delay-2"
            onClick={onBegin}
            style={{ borderColor: `${accent}55`, boxShadow: `0 8px 32px ${accent}33` }}
          >
            Enter the story →
          </button>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  )
}
