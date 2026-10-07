# Study Desk — the functional prototype

The homework desk on the TV, as a working Next.js app on this PC. It is the design document for
the real thing: every page, flow, prompt and rule table here is meant to be rebuilt natively on
Fire TV with AWS behind it. Plan and page map: [../docs/DESK-PROTOTYPE-PLAN.md](../docs/DESK-PROTOTYPE-PLAN.md).
Design rules: [../docs/DESIGN-ON-AIR.md](../docs/DESIGN-ON-AIR.md).

## Run

```
npm run dev              # http://localhost:3000
npm test                 # the gate: type check, then the rules suites
npm run measure          # the KPI readings, as numbers (--json for a machine)
```

- **/tv** — the television. Open at 1920×1080 (or let it scale). Keyboard is the D-pad: arrows,
  Enter = Select, Backspace/Escape = Back, M = Menu, Space = Play/Pause. The first time, open the
  address the desk prints at start, `TV: http://<ip>:3000/tv?key=...`: the key makes that browser the
  TV (a cookie; the key leaves the address). Without it /tv says "Not this desk's TV". The key is kept
  in `data/pairing.json` (under `DESK_DATA_DIR` when set), so a scripted capture reads it from there.
- **/phone** — the phone. Open on a real phone on the same Wi-Fi at `http://<this PC's IP>:3000/phone`
  (the landing page prints the address), or in a second browser window. Without a camera, the
  Capture screen offers three sample pages. A phone joins by giving the server the code the TV shows
  (scan the QR, or type it); the server checks it and remembers that phone until the session is reset.
  Until then the phone sees only the lobby, and every API route but the session's own answers 401
  (`src/proxy.ts`; who is who is `src/lib/session/pairing.ts`).
- **/tv?module=english** — Linga's conversation entrance. Choose a situation, respond on the
  phone's Linga tab, ask for a cue or coaching, replay the moment, and finish with saved progress.
- **/english/print** — the current learner's printable English learning map.
- **/api/smoke** — the engine check, so a broken engine is found here and not on the TV. Five rows (text, vision, embed, speak, listen),
  each with the provider that would run, whether it answers and what to fix (`ollama pull qwen3.8:27b`, `ollama serve`, a missing key),
  in about two seconds and with no model call. Add `?live=1` to run text, vision (needs `data/sample.jpg`), embed and speak for real,
  side by side. The TV may ask; a paired phone gets 403.

- **/api/texts** — the seated learner's own texts, kept with versions (`src/lib/session/texts.ts`; adult plan A6). Phone or
  PC; every call acts on the learner at the desk, never on an id the client sends. One file per piece under
  `DESK_DATA_DIR/texts/<learner>/`, never in `learners.json`; `DELETE ?all=1` removes the learner's folder (the twin's
  state with it). Caps: a version 100 KB, 20 versions, 50 pieces, refused with a sentence. `{docx: base64}` keeps the text
  of a Word file (`src/lib/rules/docx.ts`, no dependency); the file itself is not kept.
- **/drop** — the PC page (v2 P4): the same join code as a phone, a big keyboard and real files (.txt, .md, .docx up to
  150 KB). Keep a message, an email or an essay; see the shelf; review your twin; download its Twin Card.
- **/api/twin** — the twin (v2 T2): GET from a phone or PC is the portrait (per channel: pieces, born, level words, the
  exemplars with an include box); GET from the TV, or POST `{open: true}`, puts the Workroom on the TV (titles, counts,
  change marks and level words, never a sentence); POST `{exclude, on}` leaves a piece out of the exemplars.
- **/api/twin/card** — the Twin Card 1.0 download (`docs/standards/twin-card/1.0/`), phone or PC only, Adult mode only,
  once a channel is born (three pieces). Built by code (`src/lib/twin/card.ts`): RFC 8785 + SHA-256 per part.

## Trying the twin (Adult mode, v2 batch 4)

No model is needed for any of this: keeping pieces, the portrait, the Workroom and the card are all code. (The Claude
CLI is needed only if you also want Essay Master's lens readings of a piece.)

1. In `desk/`: `npm install`, then `npm run dev`. The terminal prints `TV: http://<ip>:3000/tv?key=...`.
2. **The TV:** open that address in a browser window at 1920×1080 (or the Fire TV's browser). Arrows move, Enter
   selects, Backspace is Back, M is Menu.
3. **A phone to name the learner:** in a second window (or a phone on the same Wi-Fi) open `http://<ip>:3000/phone`
   and type the 4-digit code the TV shows.
4. **An adult profile:** on the TV, the learner chip, then **Add a learner**; type the name on the phone; on the TV pick
   *Type of student* **Other**, then *Mode* **Adult (18+)** (the row appears only when Adult is allowed: type Other, or
   an age of 18 or more), then **Save**. That pick is the one 18+ confirmation.
5. **The PC page:** on a computer open `http://<ip>:3000/drop` and join with the same code. Pick **Message (chat)** or
   **Email**, paste something you wrote (or choose a .txt/.md/.docx file), **Keep it**. The first time, accept the
   notice (your texts stay on this desk; Claude reads them only when you ask for a reading).
6. **Keep three** of one kind (three messages, or three emails). Under *Your twin* the channel turns **born** and
   shows how you write in level words (formality, warmth, humour, energy, length, directness, expressiveness, detail).
   Untick any exemplar you would not share; it stays listed so it can go back.
7. **Download your Twin Card** (`<name>.twin.json`). Any tool that reads Twin Card 1.0 can load it; it validates
   against `docs/standards/twin-card/1.0/twin-card.schema.json`.
8. **The TV stage:** **Show the Workroom on the TV** on the PC page, or open Essay Master from the TV landing: an adult
   lands in the Workroom. Up/Down walk your pieces (format, version, paragraphs, and change pips once a piece has a
   second version: *Open* it from the shelf, edit, keep it again), Right goes to **The lenses**, Back returns to the
   desk. The TV never shows your sentences.
9. **Forget it all:** the shelf's *Delete everything I kept* removes the pieces, the twin's state and the notice.

The twin probe (`node ../tools/twin-probe.cjs`, needs the Claude CLI) is the twin's kill test, simulated: eight
synthetic writers, and for each the twin's draft against the plain model's, scored by the style meter and a blind
judge. `--stub` runs the plumbing without a model.

## Linga conversations

Eight authored situations cover introductions, interests, a children's adventure, teamwork,
bookings, interviews, adult dates, and ordinary disagreements. The existing Claude CLI generates
the actual dialogue and coaching. Set English comfort, interests, creativity, challenge and
teaching notes on the phone. Adult dating is explicitly selected and excluded from child profiles.

Speech starts only when requested. The phone displays the recognised transcript before sending;
editing it changes the observation to written practice. Browser recognition support varies and
may use the browser vendor's service. A physical phone needs a secure context (HTTPS) for this
voice path; typing works on the ordinary LAN HTTP page. Raw audio is not stored by the app.
TV audio uses the configured speech engine and falls back to browser synthesis; Repeat audio is
also available when autoplay needs user interaction. See [MDN's recognition documentation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

English evidence and settings live alongside Math in `data/learners.json`, under a separate
namespace. Session reset does not erase that learning record. The transcript belongs to the
active saved session and is replaced when a new episode starts; learning evidence retains short
quoted examples. Model assessment is provisional, not a pronunciation score or certified level.

Linga's CLI calls disable unrelated coding customisations while retaining normal authentication
and managed policies. They generate JSON directly and validate it in the service. Calls time out
after 60 seconds; failures keep the phone draft available for retry. This is a turn-based web
prototype, not a streaming speech engine.

Plan and verification: [Linga implementation](../docs/LINGA-IMPLEMENTATION-PLAN.md).
The isolated logic/service checks run as part of `npm test` in `desk/` (`npm run test:rules` alone,
or `node tools/linga-rules-test.cjs` from the repository root).
For the browser integration check, start a separate server with `DESK_DATA_DIR` pointing to a
scratch directory, then set `LINGA_TEST_ALLOW_WRITES=1` and `LINGA_TEST_URL` before running
`node tools/linga-ui-test.cjs`, with `DESK_DATA_DIR` set to the server's directory too (the test
opens the TV with the key kept there). That check makes real model calls and simulates recognition events;
it does not test microphone hardware. Other engine caches keep their existing locations.

## Engines (all local, all swappable)

| engine | today | env |
|---|---|---|
| text — hints, lesson pick, explanations, essay verdicts | Claude Code CLI, headless (`claude -p`) | `CLAUDE_BIN`, `CLAUDE_FAST_MODEL`, `CLAUDE_BEST_MODEL` |
| vision — reading a captured page | `qwen3.8:27b` on Ollama | `OLLAMA_HOST`, `OLLAMA_VISION_MODEL` |
| embeddings — lesson segment retrieval | `nomic-embed-text` on Ollama | `OLLAMA_EMBED_MODEL` |
| voice out — the TV speaks | ElevenLabs | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` |
| voice in — the phone listens | browser speech recognition | — |

`.env.local` holds the keys and is not committed. Timings measured 2026-09-07: a page read ~25 s
(the vision model is 17 GB and loads on first use, ~45 s once), a hint 2–8 s, a lesson pick a few
seconds plus a one-time ~1 min to embed the transcripts (cached in `data/embeddings.json`).

**Age-fit voice** (`src/lib/rules/voice.ts`, Family mode W2). The text engine's tutor prompts (maths hints and
explanations, essay readings, the English caption) speak in one of two voices by the seated profile's age, which
`api/hint`, `api/explain` and `api/analyse` read from the session. A learner of 14 or over, or with no age, gets the
prompt that shipped before, byte for byte; a known age of 13 or under gets short sentences and everyday words, wrapped
around the same rules (the withholding clauses are shared constants, never copied). The young voice is validated for
ages 11-13 only, and a Calculus learner is not age-voiced. Tone is not test-decidable: a person reads it (`tools/voice-rules-test.cjs`).

**Mode** (`src/lib/rules/mode.ts`, Family mode W4; v2 A5). A profile is in `family` or `adult` mode. `modeOf(profile, prefs?)` says
"adult" for a learner of 18 or over, or type "other" with Adult picked on the profile's Mode row (the one 18+ confirmation, V2-O3).
The Mode row shows only when Adult is allowed (`adultAllowed`); a draft under 18 loses "adult" on every edit. Adult mode opens
Essay Master on the Workroom and makes the Twin Card downloadable (`tools/mode-rules-test.cjs`, `tools/twin-rules-test.cjs`).

## Where things are

```
src/app/tv, src/app/phone     the two surfaces
src/tv/screens.tsx            every TV screen, composed on On Air; src/tv/useSession.ts the stream
src/design/on-air.css         the design system as CSS
src/lib/engines/              text · vision · voice · embed — one function each, `provider` says which ran
src/lib/desk/                 read a page · hint · pick a lesson · analyse a sentence · analyse a paragraph
src/lib/rules/                decisions made in code: English tenses, essay sentence roles
src/lib/session/store.ts      the one session, its reducer, SSE fan-out, JSON persistence
src/lib/session/pairing.ts    the TV key, the phone cookie, and each caller's view of the session
src/proxy.ts                  the gate: every API request classified TV / phone / guest
src/lib/library/              the syllabus, transcripts, windowing, embedding cache
data/                         session.json, lessons/*.vtt, embeddings.json, sample pages (local only)
```

## Two things learned building it

- **`allowedDevOrigins`.** Next 16 silently blocks dev-mode requests from any origin it was not
  told about — including the client's own hydration — so a page opened by IP renders as server
  HTML and never comes alive, with no error anywhere. `next.config.ts` lists this machine's LAN
  patterns; add yours if the phone shows "connecting…" forever.
- **The CLI as an engine.** `--bare` never reaches the API; an inline `--system-prompt` with
  `--tools ""` costs ~1.2k input tokens per call against ~18k with the default system prompt, and
  `--json-schema` puts the parsed answer in `structured_output`.
