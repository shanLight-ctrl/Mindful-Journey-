import { useState, useEffect, useRef } from 'react'
import WorldSelect from './components/WorldSelect'
import WelcomeScreen from './components/WelcomeScreen'
import GameScene from './components/GameScene'
import EndScreen from './components/EndScreen'
import Dashboard from './components/Dashboard'
import SceneIllus from './components/ui/SceneIllus'
import Particles from './components/ui/Particles'
import ScreenWrap from './components/ui/ScreenWrap'
import ProgressRail from './components/ui/ProgressRail'
import { MOOD_THEMES } from './data/story'
import { EMOTION_META } from './lib/emotions'
import { createSession } from './lib/supabase'
import { checkBackend } from './lib/ai'
import MusicToggle from './components/ui/MusicToggle'
import { playWorld, stopMusic, setEmotion } from './lib/audio'

// Each emotion shifts the atmosphere blob while keeping the world's bg identity
const EMOTION_BLOBS = {
  brave:         'rgba(220, 140, 18, 0.65)',
  reflective:    'rgba(75, 55, 215, 0.60)',
  avoidant:      'rgba(38, 38, 105, 0.50)',
  compassionate: 'rgba(22, 155, 85, 0.60)',
  impulsive:     'rgba(200, 38, 58, 0.62)',
  self_critical: 'rgba(55, 42, 80, 0.46)',
}

export default function App() {
  const [screen, setScreen] = useState('world') // world | welcome | game | end | dashboard
  const [world, setWorld] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [emotionHistory, setEmotionHistory] = useState([])
  const [convHistory, setConvHistory] = useState([])
  const [moodAfter, setMoodAfter] = useState(null)

  // Atmosphere layers: hover (world-select) > game emotion > world > mood
  const [hoverTheme, setHoverTheme] = useState(null)
  const [gameEmotion, setGameEmotion] = useState(null)
  const [emotionFlash, setEmotionFlash] = useState(null)
  const [scenePulse, setScenePulse] = useState(0)

  const moodValue = selectedMood?.value ?? 3
  const baseTheme = world?.theme ?? MOOD_THEMES[moodValue]
  // During gameplay, keep world bg but shift blob to match the emotion just chosen
  const gameTheme = (world && gameEmotion && EMOTION_BLOBS[gameEmotion])
    ? { bg: world.theme.bg, blob: EMOTION_BLOBS[gameEmotion] }
    : null
  const theme = hoverTheme ?? gameTheme ?? baseTheme

  const [backendReady, setBackendReady] = useState(null)
  const [genreRec, setGenreRec] = useState(null) // ML genre recommendation

  useEffect(() => {
    checkBackend().then(setBackendReady)
  }, [])

  // No API key required — server uses local ML only
  const apiKeyMissing = false

  function handleWorldSelect(w) {
    setWorld(w)
    setHoverTheme(null)
    setScreen('welcome')
    playWorld(w.id)
  }

  function handleMoodSelect(mood) {
    setSelectedMood(mood)
  }

  async function handleBegin() {
    const id = await createSession(selectedMood.value)
    setSessionId(id)
    setStartTime(Date.now())
    setScreen('game')
  }

  function handleGameComplete(emotions, history) {
    setEmotionHistory(emotions)
    setConvHistory(history)
    setScreen('end')
  }

  function handleShowDashboard(afterMood) {
    setMoodAfter(afterMood)
    setScreen('dashboard')
  }

  function handleRestart() {
    stopMusic()
    setWorld(null)
    setSelectedMood(null)
    setSessionId(null)
    setStartTime(null)
    setEmotionHistory([])
    setConvHistory([])
    setMoodAfter(null)
    setHoverTheme(null)
    setGameEmotion(null)
    setEmotionFlash(null)
    setScenePulse(0)
    setScreen('world')
  }

  function handleEmotionChange(emotion) {
    setGameEmotion(emotion)
    setEmotionFlash(emotion)
    setScenePulse(n => n + 1)
    setTimeout(() => setEmotionFlash(null), 900)
    setEmotion(emotion)
  }

  const isCinematic = screen === 'game'
  const flashColor = emotionFlash ? EMOTION_META[emotionFlash]?.color : null

  return (
    <div className={isCinematic ? 'app--cinematic' : ''}>
      {/* ── Atmosphere ── */}
      <div className="atm" style={{ backgroundColor: theme.bg }}>
        <div className="blob b1" style={{ background: theme.blob }} />
        <div className="blob b2" style={{ background: theme.blob, opacity: 0.5 }} />
        <div className="blob b3" style={{ background: theme.blob, opacity: 0.6 }} />
        <div className="blob b4" style={{ background: theme.blob, opacity: 0.35 }} />
      </div>
      <div className="grain" />
      <div className="vignette" />
      <div className="scanlines" />
      <Particles count={screen === 'game' ? 18 : 32} variant={screen === 'game' ? 'game' : 'default'} />

      <div className="letterbox letterbox--top" />
      <div className="letterbox letterbox--bot" />

      {flashColor && (
        <div
          className="emotion-flash"
          style={{ background: `radial-gradient(ellipse at 50% 60%, ${flashColor}55 0%, transparent 65%)` }}
        />
      )}

      {screen !== 'game' && (
        <ProgressRail screen={screen} accent={world?.accent ?? '#8a9ab8'} />
      )}

      {/* ── Backend warning ── */}
      {apiKeyMissing && screen === 'world' && (
        <div className="error-banner">
          Missing VITE_ANTHROPIC_API_KEY — add your Anthropic key to <strong>.env</strong> and restart the server.
        </div>
      )}

      {/* ── Full-screen scene illustration (game only) ── */}
      {screen === 'game' && world && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}>
          <SceneIllus
            key={`${world.id}-${scenePulse}`}
            worldId={world.id}
            emotion={gameEmotion ?? 'neutral'}
            pulse={scenePulse > 0}
          />
        </div>
      )}

      {/* ── Screens ── */}
      <ScreenWrap screenKey={screen}>
        {screen === 'world' && (
          <WorldSelect
            onSelect={handleWorldSelect}
            onHover={t => setHoverTheme(t)}
            recommendedWorldId={genreRec?.world}
          />
        )}

        {screen === 'welcome' && (
          <WelcomeScreen
            world={world}
            onBegin={handleBegin}
            onGenreRecommend={setGenreRec}
            onMoodSelect={handleMoodSelect}
          />
        )}

        {screen === 'game' && world && (
          <GameScene
            sessionId={sessionId}
            moodBefore={selectedMood?.value ?? 3}
            world={world}
            onComplete={handleGameComplete}
            onEmotionChange={handleEmotionChange}
          />
        )}

        {screen === 'end' && (
          <EndScreen
            sessionId={sessionId}
            moodBefore={selectedMood?.value ?? 3}
            emotionHistory={emotionHistory}
            conversationHistory={convHistory}
            startTime={startTime}
            worldContext={world?.context}
            worldName={world?.name}
            worldAccent={world?.accent}
            onShowDashboard={handleShowDashboard}
          />
        )}

        {screen === 'dashboard' && (
          <Dashboard
            world={world}
            currentMoodBefore={selectedMood?.value ?? 3}
            currentMoodAfter={moodAfter}
            currentEmotions={emotionHistory}
            onRestart={handleRestart}
          />
        )}
      </ScreenWrap>
      <MusicToggle />
    </div>
  )
}
