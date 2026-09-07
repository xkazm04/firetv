# Study Desk — the functional prototype

**Date:** 2026-09-07 · follows the identity work ([DESIGN-ON-AIR.md](DESIGN-ON-AIR.md)) and the PoCs
([STUDY-DESK-POC-RESULTS.md](STUDY-DESK-POC-RESULTS.md)).

**What it is.** A Next.js app on this PC with the whole feature set composed and *working*, on
three local engines — the Claude Code CLI for text, Qwen on Ollama for images, ElevenLabs for
voice. It is the design document for the real thing: every page, flow, prompt and rule table here
is meant to be read off and rebuilt natively on Fire TV with AWS behind it. Future sessions take it
page by page.

**What it is not.** Not the Fire TV app. Not on the Stick. The TV surface runs in a browser at
1920×1080 with the arrow keys as the D-pad; the phone surface runs in a phone's browser on the
same Wi-Fi, exactly as the eventual PWA would.

---

## 1. Decisions carried in from the review

| decision | consequence |
|---|---|
| **Pickers are guides.** The Units composition (rows, duration, "next") becomes the picker pattern for every subject | one `Guide` component, fed per subject; scales to dozens of lessons and keeps D-pad navigation one-dimensional |
| **Maths "lessons on file" becomes a calendar** with completion state | a `Calendar` view: weeks as rows, lessons as cells, done/next/locked as state; sits behind the guide as the maths "progress" view |
| **Essay chooses the analysis type first**, and says what to expect from each | a chooser with four types — *structure*, *argument*, *evidence*, *language* — each with a one-line promise and a tiny diagram; the forensic view opens with that lens |
| **Essay analysis is forensic**: the extract itself, with what is strong and what is faulty marked on it | the student's text rendered as the hero; highlights drawn on it (strong = channel green, faulty = signal red, each with a margin note); the table of sentences becomes the secondary view |
| Language subject is **English** | the rule table is English tenses; the resolver is a port of the Spanish one with English markers |

## 2. Architecture

```
desk/                          Next.js 15 · TypeScript · App Router · no UI framework
  src/app/tv/                  the television: one 1920×1080 stage, keyboard = D-pad
  src/app/phone/               the phone: camera, pen, keyboard, mic
  src/app/api/                 session events + streams; the engine endpoints
  src/design/                  On Air: tokens.css, and the components the philosophy names
  src/lib/engines/             the three engines behind interfaces (see §4)
  src/lib/rules/               decisions made in code: English tenses, essay sentence roles
  src/lib/session/             one in-memory session, broadcast to the TV over SSE, saved as JSON
  src/lib/library/             lessons: transcripts, concept tags, the syllabus
  data/                        learners, sessions, the mistake journal (JSON files, gitignored)
```

**Two surfaces, one session.** The phone POSTs events (`page.captured`, `point`, `ask`,
`task.done`, `timer.start`…); the server folds them into the session and pushes the new state to
the TV over a Server-Sent Events stream. The TV never asks for typing; the phone never renders
the big view. This is the WebSocket contract from the telestrator, carried over one transport that
Next serves without extra machinery.

**Every engine is a swap.** `text()`, `vision()`, `speak()`, `listen()`, `embed()` each take a
request and return typed JSON, and each carries a `provider` field. Today: Claude CLI, Ollama,
ElevenLabs, browser speech, Ollama. Later: Bedrock, Bedrock vision or Rekognition, Polly,
Transcribe, Bedrock embeddings. The prompts and schemas do not change.

**Decisions stay in code.** The PoCs' hardest lesson: the model explains, it does not decide. The
English tense comes from a marker table; a sentence's role in a paragraph comes from a rule
before the model is asked to comment; retrieval is a choice from the syllabus with "none" kept.

## 3. Page map — the full feature set

### Television

| id | page | pattern | engine |
|---|---|---|---|
| T0 | **Pair** | QR + PIN, nothing else | — |
| T1 | **Tonight** | task row, clock, "point your phone at the page" | — |
| T2 | **Units** (per subject) | *guide*: rows, duration, next/done state, preview against the band | — |
| T2m | **Calendar** (maths) | weeks × lessons, completion state, "next" cell focused | — |
| T3 | **Page** | captured page in problem bands, overview toggle, page strip | vision (read) |
| T4 | **Hint** | problem as lower-third, hint as caption, still-stuck escalation; English shows the rule card | text; rules |
| T5 | **Lesson** | YouTube embed seeked to the segment, "why this", concept card, pause-and-ask | embed + text (pick); vision (frame) |
| T6 | **Your sentence** (English) | the sentence at 92 px, tense and marker tagged, rule lower-third | rules; text (explain) |
| T7 | **Head-to-head** (English theory) | band as divider, two tenses, the question to ask | — |
| T8 | **Analysis type** (essay) | chooser: structure / argument / evidence / language, each with its promise | — |
| T9 | **Forensic** (essay) | the extract as hero, strong and faulty highlighted, margin notes; sentence table behind Menu | rules; text |
| T10 | **Playbook / x-ray** (essay theory) | four structures; a model paragraph with its skeleton | — |
| T11 | **Break** | the clock's other face | — |
| T12 | **Recap** | minutes, problems, hints, "where it was hard", send to parent | text (summary) |
| T13 | **Learner** | switch learner; profiles | — |

### Phone

| id | page | does |
|---|---|---|
| P0 | Join | scan / type the PIN |
| P1 | Capture | real camera, snap, multi-page, document-camera mode |
| P2 | Point & ask | the page mirror, circle, a question box, the mic |
| P3 | Say it (English) | type or speak a sentence; it appears on the TV analysed |
| P4 | Paste it (essay) | paste or dictate a paragraph; picks the analysis type |
| P5 | Tonight | tasks, timer |
| P6 | Parent | the recap, the mistake journal |

## 4. Engine contracts

```ts
text(req: { system: string; prompt: string; schema?: JSONSchema; model?: "fast"|"best" }) → { json, provider, ms }
vision(req: { image: Base64; prompt: string; schema?: JSONSchema })                     → { json, provider, ms }
speak(req: { text: string; voice?: string })                                            → { audio: Buffer, provider, ms }
listen(req: { audio: Blob })                                                            → { text, provider, ms }
embed(req: { texts: string[] })                                                         → { vectors, provider, ms }
```

`text` runs `claude -p --output-format json` with tools disabled and a system prompt, from a
scratch working directory so it loads none of this repo's context. `vision` posts to Ollama's
`/api/chat` with `format: schema`. `speak` calls ElevenLabs; `listen` uses the browser's speech
recognition first and ElevenLabs Scribe when a server-side path is wanted. `embed` uses
`nomic-embed-text` on Ollama; lesson windows are embedded once and cached.

## 5. Milestones

| | scope | done when |
|---|---|---|
| **M0 · foundation** *(this session)* | scaffold; On Air design system as components; D-pad router; session store + SSE; all three engines wired with a smoke route each; every TV and phone page composed; the core flow live: snap → read → page → hint → lesson | the TV shows a real hint from Claude about a real photo read by Qwen and reads it aloud |
| M1 · maths | calendar, retrieval with embeddings, YouTube seek, pause-and-ask on a frame | "watch the bit that explains this" lands on the right segment for the PoC's nine problems |
| M2 · English | tense resolver, sentence analysis, units guide, head-to-head, voice in | the six PoC sentences analysed live from the phone, spoken and typed |
| M3 · essay | analysis-type chooser, forensic view with highlights, playbook, x-ray | the PoC paragraph shows its four claims and the missing evidence *on the text* |
| M4 · memory | learners, recap, mistake journal, syllabus & next practice | a second session knows the first |
| M5 · hardening | voice loop, parent phone, error states, the native/AWS mapping doc | each page has a "how this maps to Fire TV + AWS" note |

## Status — 2026-09-07

**M0 is done.** `desk/` runs; all sixteen TV screens and seven phone screens are composed on On
Air; the session streams to both surfaces; the three engines are wired and smoke-tested through the
app; and the core flow is live end to end — the phone sends a page, Qwen reads its ten items,
Claude (via the CLI) gives a Socratic hint and a second one on request, the lesson pick lands on
the same segment the PoC found, and the TV speaks the hint. Measured through the app: page read
~25 s warm, hint 2–8 s, first lesson pick ~1 min (embedding the transcripts once, then cached).

Known and deliberate for M1+: the YouTube embed autoplays only in a real browser; the English
sentence and essay flows are wired but have had one manual run each, not a set; the calendar's
completion state is static data; the parent phone reads the recap but the mistake journal is not
yet persisted across sessions.

## 6. Running it

```
cd desk && npm run dev          # http://localhost:3000/tv  and  /phone  (same Wi-Fi for a real phone)
```

`.env.local`: `ELEVENLABS_API_KEY`, `OLLAMA_HOST` (default `http://127.0.0.1:11434`),
`CLAUDE_BIN` (default `claude`). Everything else is local.
