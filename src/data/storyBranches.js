// All pre-written story content. The ML emotion analysis (NRC + AFINN + TF.js)
// selects which companion message to show — making each run feel personal
// without an API call.
//
// Storage:
//   Session data    → React component state (emotion history, mood, choices)
//   Community data  → Supabase via saveChoice() / completeSession() in supabase.js
//   ML model        → TF.js trains in-browser on startup, refines with session data

// ── Mood response templates ────────────────────────────────────────────────────
// inferMoodFromWords picks by mood value (1–5) + dominant Plutchik emotion

export const MOOD_RESPONSES = {
  1: {
    fear:    "There's something frightening underneath what you shared — an overwhelm that feels bigger than usual. You don't have to have it figured out to begin.",
    sadness: "Something is hurting right now. Really hurting. Carrying that into this story took more than it might seem from the outside.",
    anger:   "There's heat in what you're feeling, and it belongs to something real. You don't have to make it smaller or explain it away.",
    default: "Something heavy is with you right now. That weight is real, and you brought it here — that alone takes courage.",
  },
  2: {
    fear:    "There's an unease in what you're carrying today. You don't need to feel steady before you begin — the story holds unsteady things too.",
    sadness: "Something aches a little. That ache is allowed here — the story has room for it without asking you to fix it.",
    anger:   "There's a frustration in what you brought today. That frustration is telling you something. Let's carry it gently into the story.",
    default: "Somewhere between heavy and light. There's room for all of that here — whatever you're carrying, it's welcome.",
  },
  3: {
    trust:   "There's a quiet steadiness in what you shared. Not perfect, not broken — just present. The story can meet that.",
    fear:    "Something uncertain is in the air for you today. The story can hold that without asking you to resolve it first.",
    joy:     "Something is genuinely okay for you right now. That middle-ground calm is a real place to begin from.",
    default: "In that in-between place — not heavy, not light. Present. That's a better place to start than you might think.",
  },
  4: {
    joy:          "Something warm is in what you shared. A lightness, a sense of things being okay or better than okay. The story has room for that.",
    anticipation: "There's a readiness in you — something moving forward. Let's follow that energy into the story.",
    trust:        "A quiet confidence is coming through. Not loud — but real. The story can go somewhere with that.",
    default:      "There's a warmth in what you're bringing today. The story ahead has space for that too.",
  },
  5: {
    joy:          "Something genuinely bright is here with you. That kind of energy is rarer than people admit — let's carry it into the story.",
    anticipation: "You're ready for something. That aliveness is not small. The story ahead can feel it.",
    default:      "You're bringing real light today. The story is ready to meet that.",
  },
}

// ── Welcome greetings ─────────────────────────────────────────────────────────

export const GREETINGS = {
  1: "Whatever weight you are carrying into this moment, there is space for it here. No part of you needs to be fixed before you begin — you are welcome exactly as you are. When you are ready, your story is waiting.",
  2: "You showed up today, and that is not nothing. The story ahead doesn't ask you to feel okay — it only invites you to be present, exactly as you are. Whenever you're ready, we can begin.",
  3: "You are here, somewhere between settled and searching. The story ahead holds room for both — for what feels steady and for what is still finding its shape. Come in.",
  4: "Something good is already in the room with you. The story ahead can feel that, and it is ready to go somewhere worth going. Whenever you are.",
  5: "You brought something real and bright to this moment. The story is ready to meet you there.",
}

// ── Story scenes ──────────────────────────────────────────────────────────────
// SCENES[worldId][0..2] → scenes 2, 3, 4  (scene 1 = world.openingScene from story.js)
// Each scene has companions: { [plutchik | game emotion | 'default']: message }
// pickCompanion() in ai.js selects the best match from the player's ML emotion state

export const SCENES = {
  city: [
    // Scene 2
    {
      scene: 'You surface into pale morning light. The city moves around you with its indifferent efficiency — taxis, pigeons, someone arguing into a headset. Ahead, the café window glows amber.\n\nYour reflection catches in a shop window. For a moment you don\'t quite recognise yourself.',
      companions: {
        fear:      'I notice the hesitation — the part of you that isn\'t sure what\'s waiting on the other side of that door.',
        sadness:   'Something in that reflection is searching for something it hasn\'t named yet.',
        anger:     'There\'s a tension here — between the version of you that wants to act and the one that wants more time.',
        brave:     'Something moved in you just now. That forward motion is real, even when it doesn\'t feel certain.',
        avoidant:  'There is something in the window that wants to be seen — if you let yourself look.',
        default:   'Something in you is searching for something — even if you can\'t name it yet.',
      },
      choices: [
        { text: 'Push open the café door. Whatever happens, happens.', emotion: 'brave' },
        { text: 'Find a bench. Sit with this feeling before it passes.', emotion: 'reflective' },
        { text: 'Walk the long way around. Just a few more minutes.', emotion: 'avoidant' },
      ],
    },
    // Scene 3
    {
      scene: 'The city hums. A street musician plays something quiet and unresolved that stops people mid-stride. One woman drops a coin and walks away faster, like the music said something she wasn\'t ready to hear.\n\nYou know that feeling.',
      companions: {
        fear:       'That music is touching something you\'ve been avoiding — let it.',
        sadness:    'There is something in this melody that belongs to what you\'re carrying.',
        reflective: 'You\'ve been sitting with something — the music just named it.',
        avoidant:   'Something in you wants to cross the street. Something else doesn\'t.',
        default:    'There is something here that belongs to you — if you let yourself have it.',
      },
      choices: [
        { text: 'Stand and listen until the song ends.', emotion: 'reflective' },
        { text: 'Drop something in the case and keep moving.', emotion: 'compassionate' },
        { text: 'Cross the street. You have somewhere to be.', emotion: 'avoidant' },
      ],
    },
    // Scene 4 (final — no choices)
    {
      scene: 'The afternoon light softens the glass towers into something almost gentle. You\'ve walked further than you meant to. Your feet ache in a way that feels earned.\n\nThere\'s a bench at the edge of a small park — just enough space between the city and the sky. You sit.',
      companions: {
        brave:      'You moved through something today. That motion — small or large — is real.',
        reflective: 'You stayed present through all of it. That\'s harder than it sounds.',
        avoidant:   'Even in the moving away, you showed up. Showing up is where everything starts.',
        default:    'You made it here. That\'s not nothing — that\'s the whole thing.',
      },
    },
  ],

  village: [
    // Scene 2
    {
      scene: 'The baker hands you something still warm without asking. Through the window, the square is all colour and motion — a child chasing a dog, two old men playing cards.\n\nA quiet place is being offered to you. You could take it.',
      companions: {
        sadness:  'Something in the ordinary warmth of this is asking you to soften.',
        fear:     'There\'s safety in this small moment — let yourself feel it.',
        joy:      'The warmth of it is reaching you. That\'s not small.',
        avoidant: 'The quiet is here if you want it. No one is asking anything of you right now.',
        default:  'Something in the ordinary is asking you to slow down long enough to feel it.',
      },
      choices: [
        { text: 'Sit outside with your bread and just watch.', emotion: 'reflective' },
        { text: 'Go and find your neighbour. Enough avoiding.', emotion: 'brave' },
        { text: 'Head home early. You\'re not quite ready.', emotion: 'avoidant' },
      ],
    },
    // Scene 3
    {
      scene: 'The afternoon bell sounds once, loose and warm. The square empties the way it always does — quickly, then quietly. A cat crosses in no particular hurry.\n\nYou\'re still here.',
      companions: {
        reflective: 'You\'ve given yourself space to think. That\'s not idle — that\'s essential.',
        brave:      'Something in you has been building toward a choice. You can feel it.',
        sadness:    'Staying when you could have left is its own kind of courage.',
        default:    'There is something about staying when you could have left.',
      },
      choices: [
        { text: 'Walk to the edge of the village and look at the fields.', emotion: 'reflective' },
        { text: 'Go knock on your neighbour\'s door now.', emotion: 'brave' },
        { text: 'Start for home. Tomorrow is another chance.', emotion: 'avoidant' },
      ],
    },
    // Scene 4 (final)
    {
      scene: 'The light golds at the edges of the day. A swallow cuts low across the lane. You\'ve been in your own company for a while now, and it has been — surprisingly — enough.\n\nThe village holds you gently. It always has, even when you forgot.',
      companions: {
        reflective: 'You took time with yourself today. That\'s a form of respect.',
        brave:      'You moved toward something hard. That takes a particular kind of strength.',
        avoidant:   'You gave yourself room to breathe. Sometimes that is the most honest thing.',
        default:    'You gave yourself space today. That\'s a form of kindness.',
      },
    },
  ],

  forest: [
    // Scene 2
    {
      scene: 'A stream runs over smooth stones, unhurried. You crouched here once as a child — or someone did, in a life that feels close but unreachable. The cold off the water reaches your face.\n\nTime moves differently here.',
      companions: {
        sadness:      'Something in the water is giving you permission to feel what you brought here.',
        fear:         'The forest isn\'t asking you to be brave. Only to be present.',
        trust:        'Something is loosening a little. Let it.',
        anticipation: 'There\'s a quiet curiosity waking up — follow it.',
        default:      'Something in you is remembering something.',
      },
      choices: [
        { text: 'Wade in. The cold is the point.', emotion: 'brave' },
        { text: 'Sit on the bank. Let the sound do its work.', emotion: 'reflective' },
        { text: 'Keep moving. This feeling is too much.', emotion: 'avoidant' },
      ],
    },
    // Scene 3
    {
      scene: 'An old tree has fallen across the path, its roots exposed to the sky like an open hand. Moss has already started to claim it back. Life working quietly, without drama.\n\nYou rest your hand on the bark. It\'s still warm from the afternoon sun.',
      companions: {
        sadness:    'Even what falls becomes something new. You feel that right now.',
        fear:       'The obstacle is real. And so is your capacity to meet it.',
        reflective: 'You\'ve been sitting with something large. This tree is sitting with something large too.',
        default:    'There is something about endings that become beginnings — you feel it here.',
      },
      choices: [
        { text: 'Climb over. Continue into the deeper forest.', emotion: 'brave' },
        { text: 'Sit on the fallen trunk and look up.', emotion: 'reflective' },
        { text: 'Find a way around. Stay on easier ground.', emotion: 'avoidant' },
      ],
    },
    // Scene 4 (final)
    {
      scene: 'The light shifts — afternoon pulling toward something softer. The trees hold their stillness around you and you feel, for a moment, genuinely held.\n\nWhatever you came here looking for may not have a name. That might be fine.',
      companions: {
        fear:    'The forest asked nothing of you — and you stayed anyway. That matters.',
        sadness: 'Something in the stillness has been witnessing you. It hasn\'t looked away.',
        brave:   'You went deeper than you planned to. Something came with you that needed the distance.',
        default: 'You stayed long enough to arrive somewhere.',
      },
    },
  ],

  digital: [
    // Scene 2
    {
      scene: 'You draft the follow-up three times and delete it twice. Outside, rain. The glow of the screen is the only light in the room.\n\nYour phone buzzes. Not them — a notification from something you forgot you followed.',
      companions: {
        fear:    'I notice the fear underneath the waiting — not just of the silence, but of what a reply might mean.',
        sadness: 'Something in you is still hoping. That hope is information worth holding.',
        anger:   'The frustration of waiting for something you can\'t control — that\'s one of the harder feelings to sit with.',
        brave:   'You keep drafting anyway. There\'s something honest in that persistence.',
        default: 'Something in you is still hoping. That hope is information.',
      },
      choices: [
        { text: 'Send the third draft. Done.', emotion: 'brave' },
        { text: 'Voice-note instead. Your actual voice.', emotion: 'compassionate' },
        { text: 'Leave it. If they want to respond, they will.', emotion: 'avoidant' },
      ],
    },
    // Scene 3
    {
      scene: 'The screen dims. You\'ve been here longer than you meant to be. Outside the window, the street lamp has come on — you didn\'t notice the light change.\n\nThere\'s a version of you that exists beyond all this scrolling. You remember that now.',
      companions: {
        sadness:    'The screen has been filling a space that something real needs to fill.',
        fear:       'What you\'re avoiding by staying online — it\'s still there. But it\'s not as large as the avoidance.',
        reflective: 'Something is pulling you back to yourself. That pull is worth trusting.',
        avoidant:   'One more check. And then maybe you\'ll notice you already know what you\'re looking for.',
        default:    'There is something pulling you back to yourself — away from the screen.',
      },
      choices: [
        { text: 'Put the phone face-down. One hour without it.', emotion: 'brave' },
        { text: 'Open your camera. Take a photo of just the rain.', emotion: 'reflective' },
        { text: 'Check one more time. Then you\'ll stop.', emotion: 'avoidant' },
      ],
    },
    // Scene 4 (final)
    {
      scene: 'The room is still. Your phone, wherever you put it, is quiet. The rain has softened to something you can almost ignore.\n\nYou\'re here — actually here — in a way you haven\'t been all day.',
      companions: {
        brave:      'You chose presence. In a world built to keep you scrolling, that takes something real.',
        reflective: 'You turned toward the rain, toward the room, toward yourself. That\'s a meaningful choice.',
        avoidant:   'Even here — in the quiet, after everything — you arrived. That counts.',
        default:    'You came back to yourself. That\'s worth noticing.',
      },
    },
  ],
}

// ── Endings ───────────────────────────────────────────────────────────────────
// Selected by world + dominant game emotion (brave / reflective / avoidant / default)

export const ENDINGS = {
  city: {
    brave: {
      ending: 'The city kept moving, the way cities do. But something in you shifted.\n\nYou moved toward things today — toward discomfort, toward other people, toward the version of yourself that acts rather than waits. That is not the easy path. It is the one that means something.\n\nGrowth rarely announces itself. But today, if you look back, you can see the places where you said yes instead of later.',
      companion_reflection: 'I was with you every step. The courage you showed today — even in small moments — is the real kind.',
      growth_insight: 'You are someone who moves toward what matters, even when it costs you something.',
    },
    reflective: {
      ending: 'The city kept moving. You moved through it differently today — with more attention, more honesty.\n\nYou paused when others rushed. You sat with your reflection when you could have looked away. That kind of presence doesn\'t look like much from outside. Inside, it changes things.\n\nYou are learning to know yourself in motion.',
      companion_reflection: 'Something in you was honest today in quiet ways that nobody else could see. I saw them.',
      growth_insight: 'You are more willing to look at yourself — clearly, kindly — than you used to be.',
    },
    avoidant: {
      ending: 'The city kept moving. And today, you moved through it on your own terms.\n\nSometimes protection is the only option you can access right now — and that is not failure. You showed up. You stayed present even in the moving away. Awareness is the first part of change.\n\nAnd you were aware today.',
      companion_reflection: 'The fact that you felt the pull toward and away — and stayed with that feeling — matters more than you know.',
      growth_insight: 'Awareness is the beginning of everything. You practised it today.',
    },
    default: {
      ending: 'The city kept moving, the way cities do. But something in you shifted — a small degree, like a compass needle finally finding north.\n\nYou carried a weight into the morning and you moved with it anyway. That is not a small thing. The streets, the noise, the impossible pace — none of it asked you to be okay. You just kept going.\n\nGrowth often looks like this: ordinary, undramatic, a little tired. You showed up.',
      companion_reflection: 'I was with you through every turn. There\'s more courage in this story than you might believe right now.',
      growth_insight: 'You are more capable of sitting with discomfort than you give yourself credit for.',
    },
  },

  village: {
    brave: {
      ending: 'The village doesn\'t make it easy to step outside your comfort. Everything here says: stay, be known, be safe.\n\nBut you moved toward the harder thing today. Toward the conversation, toward the connection, toward what you\'d been putting off. That took something specific — not dramatic, but real.\n\nYou didn\'t have to. You did anyway.',
      companion_reflection: 'Something in you reached toward connection today. That reaching is love, even when it\'s imperfect.',
      growth_insight: 'You are someone who can show up for others even when it asks something of you.',
    },
    reflective: {
      ending: 'The village held you today the way it always does — in bread and bells and the ordinary persistence of things.\n\nYou moved through it slowly, with your eyes open. You gave yourself time that the world doesn\'t usually offer. And in that time, something settled.\n\nIn the quiet, you found something worth finding.',
      companion_reflection: 'You gave yourself the gift of your own company today — and you were good company.',
      growth_insight: 'You are learning that stillness is not emptiness — it is where you find yourself.',
    },
    avoidant: {
      ending: 'The village doesn\'t ask much. And today, you gave yourself permission to do the same.\n\nYou moved at your own pace. You protected yourself when you needed to. Not every day is the day for the difficult conversation — and knowing that is a form of wisdom.\n\nYou\'ll return. And maybe next time, a little less will feel impossible.',
      companion_reflection: 'You were gentle with yourself today. That gentleness is the foundation of everything else.',
      growth_insight: 'You are allowed to take your time — and you are allowed to arrive when you are ready.',
    },
    default: {
      ending: 'The village doesn\'t ask much of you. It just keeps being there — the bread, the bells, the slow light of afternoon.\n\nToday you moved through it imperfectly and honestly, which is the only way any of us ever do. You stayed when it was hard to stay, moved when you could.\n\nSomewhere in the ordinary, you found something that was yours.',
      companion_reflection: 'Something in you reached toward connection today, even when it was difficult.',
      growth_insight: 'You are allowed to take your time — and you are allowed to arrive.',
    },
  },

  forest: {
    brave: {
      ending: 'The forest asked you to go deeper — and you did.\n\nYou moved past the places where most people turn back. The cold water, the fallen tree, the silence that had no easy answers. You went through it anyway.\n\nWhat you carried in may be the same size. But you are slightly bigger than when you arrived.',
      companion_reflection: 'You went somewhere difficult today — in the forest and inside yourself. I was watching. It was brave.',
      growth_insight: 'You are capable of moving through hard things without knowing how they will end.',
    },
    reflective: {
      ending: 'The forest didn\'t need you to do anything. It just needed you to stay.\n\nAnd you did. You sat with the stream and the fallen tree and the light coming through the canopy. You let the quiet do what quiet does — show you what\'s already there.\n\nYou arrived somewhere today. Not at a destination. Just — somewhere more true.',
      companion_reflection: 'You gave yourself the rarest gift: unhurried time. Something in you is grateful, even if you can\'t yet name it.',
      growth_insight: 'You are learning that presence is not passive — it is the most honest work there is.',
    },
    avoidant: {
      ending: 'The forest didn\'t ask you to be brave. It asked you to show up.\n\nAnd you did. Even the turning away, the finding the easier path — you were present for it. You felt the pull of the harder thing. That awareness is not nothing. That awareness is everything.\n\nSomething shifted today, even in the gentlest way.',
      companion_reflection: 'You felt the edge of something today — and you were honest about what you could hold. That honesty is growth.',
      growth_insight: 'Knowing your limits with kindness — that is wisdom, not weakness.',
    },
    default: {
      ending: 'The forest didn\'t need you to be okay. It just needed you to show up, which you did.\n\nYou walked into something unfamiliar and stayed long enough to be changed by it — even slightly, even quietly. The cold of the water, the weight of the fallen tree, the light coming through the canopy.\n\nNature holds a kind of wisdom that doesn\'t need explaining. You felt it today.',
      companion_reflection: 'You gave yourself the gift of stillness. Not everyone can do that.',
      growth_insight: 'You are learning to be present — and that is the whole practice.',
    },
  },

  digital: {
    brave: {
      ending: 'The screen goes dark eventually. But before it did, you sent something real.\n\nYou chose honesty over a carefully managed impression. In a world built for highlight reels and perfect timing, that takes something specific — a willingness to be seen as you actually are.\n\nYou reached out. Whatever comes next, that part belongs to you.',
      companion_reflection: 'You chose to be real in a world that rewards the performance. It cost you something, and you did it anyway.',
      growth_insight: 'Authenticity in a curated world is an act of quiet courage — and you practised it today.',
    },
    reflective: {
      ending: 'The screen went dark and you were still there — more present in the quiet than you\'d been in all the noise.\n\nYou took your time today. You didn\'t rush toward action or away from feeling. You let things be what they were — the waiting, the uncertainty, the rain.\n\nThat quality of attention is rare. You brought it.',
      companion_reflection: 'You noticed things today — the light changing, the rain, yourself. That kind of noticing is the beginning of everything.',
      growth_insight: 'You are more capable of presence than you give yourself credit for — and presence is the whole thing.',
    },
    avoidant: {
      ending: 'The screen goes dark eventually. All of them do.\n\nYou stayed online longer than you meant to. But underneath the scrolling, something was happening — a slow reckoning with what you\'re looking for and what you\'re afraid of. That happened. Even in the avoidance.\n\nYou showed up as yourself. That\'s always where it starts.',
      companion_reflection: 'I saw you be honest in a quiet, invisible way that rarely gets witnessed. I witnessed it.',
      growth_insight: 'Real connection starts with honesty — you practised that today.',
    },
    default: {
      ending: 'The screen goes dark eventually. All of them do.\n\nYou sent something honest into the world and then had to wait — which is one of the bravest, most human things there is. The connection you want is real. The vulnerability it takes is real.\n\nYou reached out. Whatever comes next, you showed up as yourself.',
      companion_reflection: 'I saw you be brave in the quiet, invisible way that rarely gets witnessed. I witnessed it.',
      growth_insight: 'Real connection starts with honesty — you practised that today.',
    },
  },
}
