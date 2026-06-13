# Mindful Journey — AI Mental Wellness Storytelling Game

An interactive web game where players navigate branching stories about personal growth and overcoming fear. An AI companion reads your emotional choices and generates a unique story path — no two journeys are the same.

Built for the **ML Empowerment Build Challenge**.

---

## Quick Start

### 1. Set up environment variables

```bash
copy .env.example .env
```

Open `.env` and fill in:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...        # Required — get at console.anthropic.com
VITE_SUPABASE_URL=https://...            # Optional — for community data
VITE_SUPABASE_ANON_KEY=eyJ...           # Optional — for community data
```

### 2. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Setting up Supabase (optional but recommended for the dashboard)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** and paste the contents of `supabase-schema.sql`
3. Click **Run**
4. Copy your project URL and anon key into `.env`

---

## How it works

```
Welcome Screen          Game Scenes (4)         End Screen          Dashboard
──────────────          ───────────────         ──────────          ─────────
Mood check-in     →     Story + choices   →     AI ending     →     Community
AI greeting             Claude generates        Mood after          insights
Atmosphere shift        next scene +            Save to DB          Charts
                        emotion tag                                 Stats
```

### The AI / ML layer

Every choice goes through **Claude** doing 3 tasks simultaneously:

| Task | What it does | Example |
|------|-------------|---------|
| Natural Language Understanding | Reads the emotional signal in your choice | "I'll avoid it" → detects avoidant pattern |
| Contextual Reasoning | Maintains the full story arc across scenes | Adapts narrative based on your emotional history |
| Natural Language Generation | Writes the next scene + wellness insight | Produces warm, literary, empathetic prose |

Choices are labeled with emotion tags (`brave`, `reflective`, `avoidant`, `compassionate`, `impulsive`, `self-critical`). These are stored in Supabase and visualized in the community dashboard.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| AI Engine | Claude (Anthropic API) |
| Database | Supabase |
| Charts | Recharts |
| Fonts | Crimson Pro + Inter |
| Hosting | Vercel / Netlify |

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your env vars in the Vercel dashboard under **Settings → Environment Variables**.

---

## Project structure

```
src/
├── App.jsx                   # Screen routing + atmosphere
├── components/
│   ├── WelcomeScreen.jsx     # Mood check-in + AI greeting
│   ├── GameScene.jsx         # Branching story gameplay
│   ├── EndScreen.jsx         # AI ending + mood after
│   ├── Dashboard.jsx         # Community analytics
│   └── ui/
│       └── Typewriter.jsx    # Animated text with italic support
├── lib/
│   ├── claude.js             # Claude API wrapper (greeting, scenes, ending)
│   └── supabase.js           # Database helpers
└── data/
    └── story.js              # Opening scene, choices, mood themes
```

---

## Problem & Impact

Many people struggle with processing difficult emotions in isolation. Traditional support is expensive or inaccessible. Mindful Journey makes emotional exploration engaging, personalized, and free — while generating real data about collective emotional patterns.

**Measurable impact**: The community dashboard tracks mood before vs. after, showing whether the game helps. Every session contributes to a growing dataset of human emotional patterns.
