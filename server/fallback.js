// Pre-written story content used when the AI API is unavailable or out of credits.
// Enough variation per world and emotional arc to feel different on replay.

const MOOD_RESPONSES = {
  low: {
    mood_value: 2,
    mood_label: 'Low',
    response: 'Something heavy is with you right now. That weight is real, and you brought it here — that alone takes courage.',
  },
  okay: {
    mood_value: 3,
    mood_label: 'Okay',
    response: 'Somewhere between heavy and light. There\'s room for all of that here — whatever you\'re carrying.',
  },
  good: {
    mood_value: 4,
    mood_label: 'Good',
    response: 'There\'s a warmth in what you\'re bringing today. The story ahead has space for that too.',
  },
}

export function fallbackMoodResponse(userWords) {
  const w = userWords.toLowerCase()
  if (/tired|exhaust|drain|sad|hard|rough|bad|awful|terrible|overwhelm/.test(w)) return MOOD_RESPONSES.low
  if (/good|great|happy|excite|hopeful|well|fine|okay/.test(w)) return MOOD_RESPONSES.good
  return MOOD_RESPONSES.okay
}

// ─── Scenes by world ────────────────────────────────────────────────────────────

const SCENES = {
  city: [
    // Scene 1
    {
      scene: 'The morning commute swallows you whole. Shoulders press in from every side, and the underground air smells of coffee and steel. An unopened message sits on your phone — from someone you\'ve been avoiding for three weeks.\n\nThe train slows. Your stop is next. Or you could ride further, buy yourself one more stop of not deciding.',
      companion_message: 'I notice the weight of that message — not just in your hands, but somewhere deeper.',
      choices: [
        { text: 'Step off now. Walk to the coffee shop where they\'re waiting.', emotion: 'brave' },
        { text: 'Stay on the train. Think through what you\'d actually say first.', emotion: 'reflective' },
        { text: 'Pocket the phone. Today isn\'t the day for this.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    // Scene 2
    {
      scene: 'You surface into pale morning light. The city moves around you with indifferent efficiency — taxis, pigeons, someone arguing into a headset. Ahead, the café window glows amber.\n\nYour reflection catches in a shop window. For a moment you don\'t quite recognise yourself.',
      companion_message: 'Something in you is searching for something — even if you can\'t name it yet.',
      choices: [
        { text: 'Push open the café door. Whatever happens, happens.', emotion: 'brave' },
        { text: 'Find a bench. Sit with this feeling before it passes.', emotion: 'reflective' },
        { text: 'Walk the long way around. Just a few more minutes.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    // Scene 3
    {
      scene: 'The city hums. A street musician plays something quiet and unresolved that stops people mid-stride. One woman drops a coin and walks away faster, like the music said something she wasn\'t ready to hear.\n\nYou know that feeling.',
      companion_message: 'There is something here that belongs to you — if you let yourself have it.',
      choices: [
        { text: 'Stand and listen until the song ends.', emotion: 'reflective' },
        { text: 'Drop something in the case and keep moving.', emotion: 'compassionate' },
        { text: 'Cross the street. You have somewhere to be.', emotion: 'avoidant' },
      ],
      emotion_tag: 'brave',
    },
    // Scene 4 (final)
    {
      scene: 'The afternoon light softens the glass towers into something almost gentle. You\'ve walked further than you meant to. Your feet ache in a way that feels earned.\n\nThere\'s a bench at the edge of a small park. Just enough space between the city and the sky.',
      companion_message: 'You made it here. That\'s not nothing — that\'s the whole thing.',
      emotion_tag: 'reflective',
    },
  ],

  village: [
    {
      scene: 'The market square smells of bread and turned earth. Old stone underfoot, worn smooth by a thousand years of ordinary days. Someone waves from across the square — your neighbour, the one you owe a conversation to.\n\nYour basket is light. Your chest is not.',
      companion_message: 'I notice the pull in two directions — toward and away from the same place.',
      choices: [
        { text: 'Wave back and walk over. Whatever comes, comes.', emotion: 'brave' },
        { text: 'Lift your hand but take the long path around the stalls first.', emotion: 'reflective' },
        { text: 'Turn into the bakery. Surely you need bread.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'The baker hands you something still warm without asking. Through the window, the square is all colour and motion — a child chasing a dog, two old men playing cards.\n\nA quiet place is being offered to you. You could take it.',
      companion_message: 'Something in the ordinary is asking you to slow down long enough to feel it.',
      choices: [
        { text: 'Sit outside with your bread and just watch.', emotion: 'reflective' },
        { text: 'Go and find your neighbour. Enough avoiding.', emotion: 'brave' },
        { text: 'Head home early. You\'re not quite ready.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'The afternoon bell sounds once, loose and warm. The square empties the way it always does — quickly, then quietly. A cat crosses in no particular hurry.\n\nYou\'re still here.',
      companion_message: 'There is something about staying when you could have left.',
      choices: [
        { text: 'Walk to the edge of the village and look at the fields.', emotion: 'reflective' },
        { text: 'Go knock on your neighbour\'s door now.', emotion: 'brave' },
        { text: 'Start for home. Tomorrow is another chance.', emotion: 'avoidant' },
      ],
      emotion_tag: 'compassionate',
    },
    {
      scene: 'The light golds at the edges of the day. A swallow cuts low across the lane. You\'ve been in your own company for a while now, and it has been — surprisingly — enough.\n\nThe village holds you gently. It always has.',
      companion_message: 'You gave yourself space today. That\'s a form of kindness.',
      emotion_tag: 'reflective',
    },
  ],

  forest: [
    {
      scene: 'The trees accept you without ceremony. Light arrives in columns through the canopy and hits the ground in small bright coins. The path ahead forks without a sign.\n\nFrom the left, the sound of water. From the right, birdsong.',
      companion_message: 'I notice that you came here — to this quiet, on purpose.',
      choices: [
        { text: 'Follow the water. Let it lead you somewhere new.', emotion: 'brave' },
        { text: 'Sit at the fork. No hurry. Just breathe.', emotion: 'reflective' },
        { text: 'Turn back. The forest feels bigger than expected.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'A stream runs over smooth stones, unhurried. You crouched here once as a child — or someone did, in a life that feels close but unreachable. The cold off the water reaches your face.\n\nTime moves differently here.',
      companion_message: 'Something in you is remembering something.',
      choices: [
        { text: 'Wade in. The cold is the point.', emotion: 'brave' },
        { text: 'Sit on the bank. Let the sound do its work.', emotion: 'reflective' },
        { text: 'Keep moving. This feeling is too much.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'An old tree has fallen across the path, its roots exposed to the sky like an open hand. Moss has already started to claim it back. Life working quietly, without drama.\n\nYou rest your hand on the bark.',
      companion_message: 'There is something about endings that become beginnings — you feel it here.',
      choices: [
        { text: 'Climb over. Continue into the deeper forest.', emotion: 'brave' },
        { text: 'Sit on the fallen trunk and look up.', emotion: 'reflective' },
        { text: 'Find a way around. Stay on easier ground.', emotion: 'avoidant' },
      ],
      emotion_tag: 'compassionate',
    },
    {
      scene: 'The light shifts — afternoon pulling toward something softer. The trees hold their stillness around you and you feel, for a moment, genuinely held.\n\nWhatever you came here looking for may not have a name. That might be fine.',
      companion_message: 'You stayed long enough to arrive somewhere.',
      emotion_tag: 'reflective',
    },
  ],

  digital: [
    {
      scene: 'The feed scrolls past your eyes faster than you can feel any of it. Somewhere in the noise is the message you sent last night — the honest one, the one you regretted the moment it delivered.\n\nThe read receipt appeared at 2am. No reply since.',
      companion_message: 'I notice the vulnerability of having sent something real and now waiting.',
      choices: [
        { text: 'Send a follow-up. Don\'t leave it to silence.', emotion: 'brave' },
        { text: 'Close the app. Think about what you actually meant.', emotion: 'reflective' },
        { text: 'Open something else. Distract the waiting away.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'You draft the follow-up three times and delete it twice. Outside, rain. The glow of the screen is the only light in the room.\n\nYour phone buzzes. Not them — a notification from something you forgot you followed.',
      companion_message: 'Something in you is still hoping. That hope is information.',
      choices: [
        { text: 'Send the third draft. Done.', emotion: 'brave' },
        { text: 'Voice-note instead. Your actual voice.', emotion: 'compassionate' },
        { text: 'Leave it. If they want to respond, they will.', emotion: 'avoidant' },
      ],
      emotion_tag: 'brave',
    },
    {
      scene: 'The screen dims. You\'ve been here longer than you meant to be. Outside the window, the street lamp has come on — you didn\'t notice the light change.\n\nThere\'s a version of you that exists beyond all this scrolling. You remember that now.',
      companion_message: 'There is something pulling you back to yourself — away from the screen.',
      choices: [
        { text: 'Put the phone face-down. One hour without it.', emotion: 'brave' },
        { text: 'Open your camera. Take a photo of just the rain.', emotion: 'reflective' },
        { text: 'Check one more time. Then you\'ll stop.', emotion: 'avoidant' },
      ],
      emotion_tag: 'reflective',
    },
    {
      scene: 'The room is still. Your phone, wherever you put it, is quiet. The rain has softened to something you can almost ignore.\n\nYou\'re here — actually here — in a way you haven\'t been all day.',
      companion_message: 'You came back to yourself. That\'s worth noticing.',
      emotion_tag: 'reflective',
    },
  ],
}

const ENDINGS = {
  city: {
    ending: 'The city kept moving, the way cities do. But something in you shifted — a small degree, like a compass needle finally finding north.\n\nYou carried a weight into the morning and you moved with it anyway. That is not a small thing. The streets, the noise, the impossible pace — none of it asked you to be okay. You just kept going.\n\nGrowth often looks like this: ordinary, undramatic, a little tired. You showed up.',
    companion_reflection: 'I was with you through every turn. There\'s more courage in this story than you might believe right now.',
    growth_insight: 'You are more capable of sitting with discomfort than you give yourself credit for.',
  },
  village: {
    ending: 'The village doesn\'t ask much of you. It just keeps being there — the bread, the bells, the slow light of afternoon.\n\nToday you moved through it imperfectly and honestly, which is the only way any of us ever do. You stayed when it was hard to stay, moved when you could.\n\nSomewhere in the ordinary, you found something that was yours.',
    companion_reflection: 'Something in you reached toward connection today, even when it was difficult.',
    growth_insight: 'You are allowed to take your time — and you are allowed to arrive.',
  },
  forest: {
    ending: 'The forest didn\'t need you to be okay. It just needed you to show up, which you did.\n\nYou walked into something unfamiliar and you stayed long enough to be changed by it — even slightly, even quietly. The cold of the water, the weight of the fallen tree, the light coming through the canopy.\n\nNature holds a kind of wisdom that doesn\'t need explaining. You felt it today.',
    companion_reflection: 'You gave yourself the gift of stillness. Not everyone can do that.',
    growth_insight: 'You are learning to be present — and that is the whole practice.',
  },
  digital: {
    ending: 'The screen goes dark eventually. All of them do.\n\nYou sent something honest into the world and then had to wait — which is one of the bravest, most human things there is. The connection you want is real. The vulnerability it takes is real.\n\nYou reached out. Whatever comes next, you showed up as yourself.',
    companion_reflection: 'I saw you be brave in the quiet, invisible way that rarely gets witnessed. I witnessed it.',
    growth_insight: 'Real connection starts with honesty — you practised that today.',
  },
}

const GENERIC_ENDING = {
  ending: 'You moved through something today. It may not look like much from the outside — just choices, just moments. But inside, something shifted.\n\nYou showed up. You sat with what was hard. You kept going even when a part of you wanted to stop.\n\nThat is the whole journey. Not the destination — the willingness to take the next step.',
  companion_reflection: 'I was here for every turn you took. You did something real today.',
  growth_insight: 'You are braver than you know — and today is evidence of that.',
}

// ─── Public API ──────────────────────────────────────────────────────────────────

export function fallbackScene(sceneNumber, worldId) {
  const worldScenes = SCENES[worldId] ?? SCENES.forest
  const idx = Math.min(sceneNumber - 1, worldScenes.length - 1)
  return { ...worldScenes[idx] }
}

export function fallbackEnding(worldId) {
  return ENDINGS[worldId] ?? GENERIC_ENDING
}
