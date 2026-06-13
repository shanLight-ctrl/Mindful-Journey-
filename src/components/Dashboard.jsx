import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { getDashboardStats, isConfigured } from '../lib/supabase'
import { EMOTION_META, EMOTION_COLORS } from '../lib/emotions'
import { MOODS } from '../data/story'
import JourneyTimeline from './ui/JourneyTimeline'
import MoodAnim from './ui/MoodAnim'
import { getMLWeights, predictMood } from '../lib/ai'

const MOOD_NAMES = ['', 'Rough', 'Low', 'Okay', 'Good', 'Great']

const EMOTION_WEIGHT_LABELS = {
  brave: 'Brave',
  reflective: 'Reflective',
  avoidant: 'Hesitant',
  compassionate: 'Compassionate',
  impulsive: 'Impulsive',
  self_critical: 'Self-critical',
  mood_before: 'Starting mood',
}

function MLInsightsCard({ mlData, mlPrediction, actualDelta, accent }) {
  const hasWeights = mlData?.weights && Object.values(mlData.weights).some(w => w !== 0)

  const weightEntries = hasWeights
    ? Object.entries(mlData.weights)
        .filter(([k]) => k !== 'mood_before')
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    : []

  const maxAbs = weightEntries.length
    ? Math.max(...weightEntries.map(([, v]) => Math.abs(v)), 0.01)
    : 1

  return (
    <div className="chart-card fade-up" style={{ '--card-accent': accent }}>
      <div className="label" style={{ marginBottom: '0.25rem' }}>
        ML Model · Mood Predictor
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
        Linear regression trained with gradient descent
        {mlData?.trainingSessions ? ` · ${mlData.trainingSessions} sessions` : ''}
        {mlData?.loss != null ? ` · loss ${mlData.loss.toFixed(3)}` : ''}
      </div>

      {!hasWeights && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '0.75rem 0' }}>
          Model not yet trained — complete a journey with Supabase configured to collect training data.
        </div>
      )}

      {hasWeights && (
        <>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem', letterSpacing: '0.08em' }}>
            EMOTION WEIGHTS <span style={{ opacity: 0.55 }}>(+ predicts mood lift · − predicts decline)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.1rem' }}>
            {weightEntries.map(([emotion, weight]) => {
              const pct = Math.round((Math.abs(weight) / maxAbs) * 100)
              const isPos = weight >= 0
              const color = isPos
                ? (EMOTION_COLORS[emotion] || '#3dbb6a')
                : '#e8455c'
              return (
                <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '100px', fontSize: '0.73rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                    {EMOTION_WEIGHT_LABELS[emotion] ?? emotion}
                  </span>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: '3px',
                      transition: 'width 1s var(--ease-out-expo)',
                      boxShadow: `0 0 8px ${color}55`,
                    }} />
                  </div>
                  <span style={{ width: '44px', fontSize: '0.7rem', color: isPos ? '#3dbb6a' : '#e8455c', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>
                    {isPos ? '+' : ''}{weight.toFixed(3)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Loss curve */}
      {mlData?.lossHistory?.length > 1 && (
        <div style={{ marginBottom: '1.1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
            TRAINING LOSS (MSE over 500 epochs)
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={mlData.lossHistory} margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="epoch" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={CHART_STYLE.contentStyle}
                formatter={v => [v.toFixed(4), 'Loss']}
                labelFormatter={l => `Epoch ${l}`}
              />
              <Line type="monotone" dataKey="loss" stroke={accent} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Prediction vs actual */}
      {mlPrediction && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: accent }}>
              {mlPrediction.predictedDelta > 0 ? `+${mlPrediction.predictedDelta}` : mlPrediction.predictedDelta}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Predicted shift</div>
          </div>
          {actualDelta != null && (
            <div style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-display)',
                color: actualDelta > 0 ? '#3dbb6a' : actualDelta < 0 ? '#e8455c' : '#8a9ab8',
              }}>
                {actualDelta > 0 ? `+${actualDelta}` : actualDelta}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Actual shift</div>
            </div>
          )}
          {actualDelta != null && (
            <div style={{ flex: 1, minWidth: '120px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                {Math.abs(mlPrediction.predictedDelta - actualDelta).toFixed(0)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Error</div>
            </div>
          )}
          <div style={{ width: '100%', fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            {mlPrediction.confidence === 'model' ? '◈ Trained model prediction' : '◌ Baseline (no training data yet)'}
          </div>
        </div>
      )}
    </div>
  )
}

const CHART_STYLE = {
  contentStyle: {
    background: 'rgba(8,8,20,0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.82)',
    fontSize: '0.8rem',
  },
  cursor: { fill: 'rgba(255,255,255,0.035)' },
}

function formatEmotionName(name) {
  return EMOTION_META[name]?.label ?? name?.replace(/_/g, ' ') ?? name
}

export default function Dashboard({ world, currentMoodBefore, currentMoodAfter, currentEmotions, onRestart }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mlData, setMlData] = useState(null)
  const [mlPrediction, setMlPrediction] = useState(null)
  const accent = world?.accent ?? '#8a9ab8'

  useEffect(() => {
    getDashboardStats()
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => { setStats(null); setLoading(false) })

    getMLWeights()
      .then(setMlData)
      .catch(() => {})

    if (currentEmotions?.length && currentMoodBefore != null) {
      predictMood(currentEmotions, currentMoodBefore)
        .then(setMlPrediction)
        .catch(() => {})
    }
  }, [])

  const sessions = stats?.sessions ?? []
  const choices = stats?.choices ?? []

  const complete = sessions.filter(s => s.mood_after != null)
  const totalJourneys = sessions.length
  const avgDelta = complete.length
    ? (complete.reduce((s, r) => s + (r.mood_after - r.mood_before), 0) / complete.length)
    : null
  const pctBetter = complete.length
    ? Math.round((complete.filter(r => r.mood_after > r.mood_before).length / complete.length) * 100)
    : null

  const moodBeforeChart = [1, 2, 3, 4, 5].map(v => ({
    name: MOOD_NAMES[v],
    Before: sessions.filter(s => s.mood_before === v).length,
    After: complete.filter(s => s.mood_after === v).length,
  }))

  const emotionCounts = {}
  choices.forEach(c => {
    const key = c.emotion_tag?.replace('-', '_') ?? c.emotion_tag
    emotionCounts[key] = (emotionCounts[key] || 0) + 1
  })
  const emotionTotal = choices.length || 1
  const emotionData = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      pct: Math.round((value / emotionTotal) * 100),
    }))

  const personalDelta = currentMoodAfter != null ? currentMoodAfter - currentMoodBefore : null
  const personalDominant = currentEmotions?.length
    ? (() => {
        const c = {}
        currentEmotions.forEach(e => { c[e] = (c[e] || 0) + 1 })
        return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]
      })()
    : null

  const beforeMood = MOODS.find(m => m.value === currentMoodBefore)
  const afterMood = MOODS.find(m => m.value === currentMoodAfter)

  return (
    <div className="screen" style={{ padding: '1.5rem', justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div className="scroll-box" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2.5rem' }}>

          <div className="dashboard-hero fade-up">
            <div className="label" style={{ marginBottom: '0.5rem' }}>Community Insights</div>
            <h1 className="dashboard-hero__title" style={{ color: accent }}>
              {world ? world.name : 'Your Journey'}
            </h1>
            <p className="story" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              {isConfigured()
                ? loading
                  ? 'Loading community data…'
                  : `${totalJourneys} ${totalJourneys === 1 ? 'journey' : 'journeys'} taken so far`
                : 'Connect Supabase to track community journeys'}
            </p>
          </div>

          <div
            className="chart-card fade-up delay-1 personal-card"
            style={{ '--card-accent': accent, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="label">Your journey</div>

            {currentEmotions?.length > 0 && (
              <JourneyTimeline emotions={currentEmotions} accent={accent} animate={false} />
            )}

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
              {beforeMood && (
                <div style={{ textAlign: 'center' }}>
                  <div className="label" style={{ marginBottom: '0.35rem' }}>Arrived</div>
                  <MoodAnim value={beforeMood.value} accent={beforeMood.accent} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {beforeMood.label}
                  </div>
                </div>
              )}
              {afterMood && personalDelta != null && (
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: accent, opacity: 0.7 }}>→</div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="label" style={{ marginBottom: '0.35rem' }}>Now</div>
                    <MoodAnim value={afterMood.value} accent={afterMood.accent} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {afterMood.label}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="stat-grid" style={{ marginTop: '0.5rem' }}>
              <div className="stat stat--highlight">
                <div className="stat__value stat__value--animated">
                  {personalDelta != null
                    ? (personalDelta > 0 ? `+${personalDelta}` : personalDelta === 0 ? '±0' : personalDelta)
                    : '—'}
                </div>
                <div className="stat__label">Mood shift</div>
              </div>
              <div className="stat">
                <div className="stat__value stat__value--animated" style={{ fontSize: '1.15rem', textTransform: 'capitalize' }}>
                  {personalDominant ? formatEmotionName(personalDominant) : '—'}
                </div>
                <div className="stat__label">Top pattern</div>
              </div>
              <div className="stat">
                <div className="stat__value stat__value--animated">
                  {currentEmotions?.length ?? '—'}
                </div>
                <div className="stat__label">Choices</div>
              </div>
            </div>
          </div>

          {isConfigured() && !loading && stats && (
            <>
              <div className="stat-grid fade-up delay-1">
                <div className="stat stat--highlight" style={{ '--card-accent': accent }}>
                  <div className="stat__value">{totalJourneys}</div>
                  <div className="stat__label">Journeys</div>
                </div>
                <div className="stat">
                  <div className="stat__value">{pctBetter != null ? `${pctBetter}%` : '—'}</div>
                  <div className="stat__label">Felt better</div>
                </div>
                <div className="stat">
                  <div className="stat__value">
                    {avgDelta != null ? (avgDelta > 0 ? `+${avgDelta.toFixed(1)}` : avgDelta.toFixed(1)) : '—'}
                  </div>
                  <div className="stat__label">Avg mood lift</div>
                </div>
              </div>

              {sessions.length > 0 && (
                <div className="chart-card fade-up delay-2">
                  <div className="label" style={{ marginBottom: '1rem' }}>Mood before vs. after (community)</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={moodBeforeChart} barGap={3} barCategoryGap="30%">
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip {...CHART_STYLE} />
                      <Bar dataKey="Before" fill="rgba(255,255,255,0.18)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="After" fill={accent} fillOpacity={0.65} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.18)', display: 'inline-block' }} />
                      Before
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: accent, opacity: 0.65, display: 'inline-block' }} />
                      After
                    </span>
                  </div>
                </div>
              )}

              {emotionData.length > 0 && (
                <div className="chart-card fade-up delay-3">
                  <div className="label" style={{ marginBottom: '1.1rem' }}>Emotional patterns across all journeys</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {emotionData.map(({ name, pct }) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: '96px',
                          textAlign: 'right',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-ui)',
                        }}>
                          {formatEmotionName(name)}
                        </span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: EMOTION_COLORS[name] || EMOTION_COLORS[name?.replace('-', '_')] || accent,
                            borderRadius: '3px',
                            transition: 'width 1.2s var(--ease-out-expo)',
                            boxShadow: `0 0 12px ${(EMOTION_COLORS[name] || accent)}44`,
                          }} />
                        </div>
                        <span style={{ width: '34px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!isConfigured() && (
            <div className="chart-card fade-up delay-2" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="label" style={{ marginBottom: '0.75rem' }}>Community data disabled</div>
              <div style={{ fontFamily: 'var(--font-story)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Add <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.85rem' }}>VITE_SUPABASE_URL</code> and{' '}
                <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.85rem' }}>VITE_SUPABASE_ANON_KEY</code>{' '}
                to your .env file, then run the SQL in <em>supabase-schema.sql</em> to track journeys across all players.
              </div>
            </div>
          )}

          {/* ── ML Insights card ────────────────────────────────────── */}
          <MLInsightsCard
            mlData={mlData}
            mlPrediction={mlPrediction}
            actualDelta={currentMoodAfter != null ? currentMoodAfter - currentMoodBefore : null}
            accent={accent}
          />

          <div className="fade-up" style={{ textAlign: 'center' }}>
            <button
              className="cta"
              onClick={onRestart}
              style={{ borderColor: `${accent}55`, boxShadow: `0 8px 28px ${accent}33` }}
            >
              Begin a new journey →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
