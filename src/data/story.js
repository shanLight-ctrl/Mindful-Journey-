export const MOODS = [
  { value: 1, label: 'Rough', emotion: 'self_critical', accent: '#8b80ff' },
  { value: 2, label: 'Low',   emotion: 'avoidant',      accent: '#b06eef' },
  { value: 3, label: 'Okay',  emotion: 'neutral',       accent: '#5b99e8' },
  { value: 4, label: 'Good',  emotion: 'compassionate', accent: '#3dbb6a' },
  { value: 5, label: 'Great', emotion: 'brave',         accent: '#e8943a' },
]

export const MOOD_THEMES = {
  1: { bg: '#080810', blob: 'rgba(55, 52, 135, 0.55)' },
  2: { bg: '#0c0910', blob: 'rgba(95, 50, 145, 0.5)' },
  3: { bg: '#060c14', blob: 'rgba(25, 65, 115, 0.5)' },
  4: { bg: '#050e09', blob: 'rgba(18, 82, 48, 0.5)' },
  5: { bg: '#0e0804', blob: 'rgba(135, 72, 15, 0.55)' },
}

export const WORLDS = [
  {
    id: 'city',
    name: 'The City',
    tag: 'Modern Life',
    desc: 'Skyscrapers, ambition, and the question of what it all means.',
    accent: '#4d6eff',
    theme: { bg: '#04050f', blob: 'rgba(40, 55, 200, 0.5)' },
    context: 'The story is set in a modern city. The protagonist navigates urban ambition, career crossroads, loneliness, and the tension between a meaningful life and a comfortable one. Sensory details: offices, cafés, apartment windows, neon signs, rain on glass, commutes. Emotional undercurrent: authenticity vs. performance.',
    openingScene: `The city doesn't sleep — and tonight, neither can you.

From the twenty-third floor, you watch the street grid pulse with headlights and advertisement light. Your laptop glows on the table: an email you have drafted twelve times and not yet sent. A message to your manager about the offer from that other company — the one doing work that actually matters. A step down in salary. A step toward something real.

Your phone buzzes. A friend: *"Still overthinking it?"*

The skyline looks back at you, indifferent and bright.`,
    openingChoices: [
      { text: 'You open the email and finally hit send — before you can stop yourself.', emotion: 'brave' },
      { text: 'You close the laptop. Not tonight. You need more data, more certainty.', emotion: 'avoidant' },
      { text: 'You step back from the screen and ask yourself: what am I actually afraid of losing?', emotion: 'reflective' },
    ],
  },
  {
    id: 'village',
    name: 'The Village',
    tag: 'Rural Life',
    desc: 'Old paths, close ties, and the pull between staying and leaving.',
    accent: '#e8943a',
    theme: { bg: '#0d0a04', blob: 'rgba(160, 100, 15, 0.5)' },
    context: 'The story is set in a small, close-knit village. The protagonist wrestles with belonging, roots, and the pull of a wider world. Sensory details: chapel bells, cobblestones, harvest fields, kitchen fires, communal meals, familiar faces. Emotional undercurrent: belonging vs. freedom.',
    openingScene: `The village wakes before dawn, as it always has.

You hear the bells from the old chapel, the sound of your neighbor's cart on the cobblestones, the crow of a rooster two lanes over. The same sounds you have woken to your whole life — and yet this morning they sit differently. Heavier. As if you are hearing them for the last time, or truly for the first.

On the kitchen table: a letter from the city. An opportunity. Your cousin swears it would change everything.

Your mother calls from upstairs. *"Breakfast is ready."* The world outside the window is still and golden.`,
    openingChoices: [
      { text: 'You fold the letter and tuck it away. You will think about it after breakfast — if at all.', emotion: 'avoidant' },
      { text: 'You write back before eating: "I\'ll come. Tell me more."', emotion: 'brave' },
      { text: 'You sit at the table and stare at the letter. What is it you actually want?', emotion: 'reflective' },
    ],
  },
  {
    id: 'forest',
    name: 'The Forest',
    tag: 'Wilderness',
    desc: 'Ancient trees, quiet paths, and the voice within the silence.',
    accent: '#3dbb6a',
    theme: { bg: '#030d05', blob: 'rgba(20, 100, 48, 0.52)' },
    context: 'The story is set in a deep wilderness — a forest the protagonist has retreated to seeking solitude. They carry unresolved questions about a life decision. Nature responds not with answers but with presence and unexpected encounters. Sensory details: streams, canopy light, birdsong, damp earth, mist, wildlife. Emotional undercurrent: escape vs. honest reckoning.',
    openingScene: `You have been here three days now, and the forest has not given up its silence.

You came with questions — the kind that sit in your chest like river stones. About a choice you made or didn't make. About the person you were supposed to become by now. The trees don't answer. But they don't dismiss you either. They simply continue, unbothered and vast.

This morning you found a stream you didn't know was there. You sat beside it for an hour. Maybe two. You watched a deer drink from the far bank and then vanish without urgency.

Your notebook is open. The pen has been in your hand for a long time.`,
    openingChoices: [
      { text: 'You begin to write. Whatever comes out, you will not cross it out.', emotion: 'brave' },
      { text: 'You close the notebook. You came here to rest, not to excavate.', emotion: 'avoidant' },
      { text: 'You set the pen down and just listen. Let the forest tell you what you already know.', emotion: 'reflective' },
    ],
  },
  {
    id: 'digital',
    name: 'Digital Realm',
    tag: 'Virtual World',
    desc: 'Where the real and the virtual blur — and identity is a choice.',
    accent: '#00d4f0',
    theme: { bg: '#02080e', blob: 'rgba(0, 160, 200, 0.45)' },
    context: 'The story is set in 2048, a near-future world where a persistent digital overlay (the "Nexus") coexists with physical reality. Both worlds are equally navigable. The protagonist struggles with identity — who they are in each world, which self is real. Sensory details: interfaces, avatars, data streams, dual-reality moments, AI companions, the texture of physical vs. digital space. Emotional undercurrent: authenticity in a world of infinite reinvention.',
    openingScene: `You have two profiles now — everyone does in 2048.

In the physical world, you sit in a café, rain against the glass, a cold coffee beside you. In the Nexus — the layered digital reality that half of humanity navigates daily — your avatar stands at the edge of a city of light that bends to imagination. Both feel equally real to you. Both, lately, feel equally hollow.

Your AI companion pings you from the Nexus: *"You have been at the crossing point for nine minutes. Do you want to decide, or do you want to talk about it?"*

In the physical world, someone sits down across from you — a stranger. They look at you the way people do when they recognize something. "You look like you're somewhere else," they say.

You are. You are in both places at once, and neither.`,
    openingChoices: [
      { text: 'You disconnect from the Nexus entirely. You will handle this in the real world, with real stakes.', emotion: 'brave' },
      { text: 'You stay in both. You answer the AI companion: "Let\'s just talk."', emotion: 'avoidant' },
      { text: 'You look at the stranger and ask: "How do you know which version of yourself is the real one?"', emotion: 'reflective' },
    ],
  },
]
