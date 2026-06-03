# AI Avatar Health Coach — Prototype

A web-based prototype of an AI avatar health coach for patient-centred health
education. A user asks a health question by text or voice, an expressive avatar
reacts through its interaction and emotional states, and the (mocked) response is
displayed clearly and read aloud. Built as a frontend prototype; the RAG/LLM
backend is mocked.

## How to run

Requires Node.js 18+.

```bash
git clone https://github.com/<your-username>/ai_avatar_health_coach.git
cd ai_avatar_health_coach
npm install
npm run dev
```

Open http://localhost:3000. A `/avatar-preview` route renders all six avatar
states side by side for quick inspection.

## Tech stack

- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS** for styling
- **SVG + CSS animations** for the avatar (no external animation libraries)
- **Web Speech API** (`speechSynthesis`) for text-to-speech
- **MediaRecorder API** for microphone capture
- **localStorage** for feedback persistence

Key files: `src/lib/` holds the mock backend (`mockBackend.ts`), guardrail logic
(`guardrails.ts`), shared types (`types.ts`), the avatar state mapping
(`avatarState.ts`), and the speech hook (`useSpeech.ts`). `src/components/` holds
the UI, with `CoachSession.tsx` as the orchestrator that owns shared state.

## How the avatar states work

The avatar has six states, which fall into two groups:

- **Interaction-phase states** 
    Based on where the conversation is: `idle` →
    `listening` (recording) → `thinking` (awaiting response) → speaking.
- **Response-emotion states** 
    Based on the type of response given: `speaking`
    (neutral), `supportive`, and `warning`.

`deriveAvatarState()` maps a backend response to the speaking state: a triggered
guardrail → `warning`, a supportive emotion → `supportive`, otherwise neutral
`speaking`. Each state is an SVG face animated by CSS keyframes, and a
`prefers-reduced-motion` media query calms the animation for users who request it.

## How push-to-talk / voice input works

The push-to-talk button is a click-to-start, click-to-stop toggle (chosen for
keyboard accessibility). On start, the avatar enters `listening` and the
component uses the **Web Speech API** (`SpeechRecognition` /
`webkitSpeechRecognition`) to perform real-time speech-to-text. While recording,
a pulsing red indicator shows the elapsed time and interim transcripts appear
live as the user speaks. Recognition runs in continuous mode with interim
results enabled, accumulating the full transcript until the user stops. On stop,
the final transcript is sent through the same chat flow as a typed message.

**Fallback:** if speech recognition is unavailable (e.g. Firefox, which doesn't
support the Web Speech API) or microphone permission is denied, the component
falls back to a simulated voice flow — cycling through a small set of sample
transcripts (including a high-risk chest-pain question) and showing the notice
"Speech recognition unavailable — using simulated voice input."

## How text-to-speech / speaking works

When a response arrives, the avatar enters its emotion based speaking state
and the answer is spoken via the **Web Speech API**. The `onend`
event returns the avatar to `idle`, so the speaking animation lasts exactly as
long as the audio. If the browser does not support `speechSynthesis`, a
simulated speaking state stands in, timed to the answer's length.

## How the feedback form works

After interacting, the user can open a short research feedback form: four questions
answered on a scale from 1 to 5 (ease of use, avatar clarity, response clarity, trust) 
plus a comment box for other feedback. On submit, the response is saved as a timestamped 
object to `localStorage` and logged to the console. Storage is local to the browser and 
the array is appended as new feedback responses are submitted.

## Main limitations

- The guardrail is **naive keyword matching** — it misses paraphrasing and has
  no clinical nuance.
- **No backend** — responses are a small hardcoded set and feedback is stored
  only in the local browser, so for a large user base or very specific questions this 
  prototype would fall apart.
- Browser TTS voice quality and availability vary by OS/browser as well as no voice
  selection.
- Right now this is just an educational prototype not a medical device.

## What I would improve over a 4-month project

- Right now my app fakes the AI. In the future I would connect it to an actual 
  LLM and RAG, so it gives real answers based on trusted sources, and the answer 
  would stream in live instead of popping up all at once.
- Add real speech-to-text for genuine voice input.
- The keyword guardrail system is a hard coded way of flagging specific words 
  as high risk but it won't raise a flag if something is worded differently. The
  next step would be train a model to recognize danger when it is phrased differently 
  and have it provide feedback and resources that match the users environment.
- Make the interface feel more dynamic and welcoming using an animation library
  (e.g. Framer Motion) so transitions and feedback are smoother and less static.
- Add a simplified, low-motion mode aimed at older or less tech-confident
  patients, with on-screen prompts that guide first-time users through how to
  use the site step by step.
- Move feedback to a database and use an LLM to summarize submissions and
  identify the most common issues and requested improvements.
- Add sessions and multilingual support 
  
## AI Tool Use Disclosure

- **Tools used:** Claude Code (in-IDE coding assistant) for implementation, and
  Claude (chat) as a planning and design partner.
- **What I used them for:** the chat assistant helped me plan the order I built
  things in and think through design choices. Claude Code wrote the repetitive
  starter code for the components, and the trickier parts that connect to the
  browser's microphone and speech features, working from instructions I wrote
  for it.
- **AI-assisted parts:** initial Next.js scaffold, the Avatar SVG/CSS, the
  Chat/MessageBubble components, the MediaRecorder push-to-talk component, the
  `useSpeech` text-to-speech hook, and the feedback form.
- **What I personally designed, reviewed, and validated:** I designed the
  structure of the fake backend responses and wrote the sample health answers
  myself. I decided which kinds of questions should count as emergencies and
  wrote the code that flags them, designed the avatar's different states and the
  logic that picks which one to show, and worked out how each response is laid
  out on screen so the safety warnings can't be missed. I also did the
  accessibility testing by hand, checking that the site works with a keyboard,
  has readable colour contrast, and adapts to different screen sizes. I reviewed
  and made neccesary changes to all the code the tools produced.

## Screenshots

-Screenshot_1:
-Screenshot_2:
-Screenshot_3:
-Screenshot_4: