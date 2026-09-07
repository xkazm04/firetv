# Study Desk — the functional prototype

The homework desk on the TV, as a working Next.js app on this PC. It is the design document for
the real thing: every page, flow, prompt and rule table here is meant to be rebuilt natively on
Fire TV with AWS behind it. Plan and page map: [../docs/DESK-PROTOTYPE-PLAN.md](../docs/DESK-PROTOTYPE-PLAN.md).
Design rules: [../docs/DESIGN-ON-AIR.md](../docs/DESIGN-ON-AIR.md).

## Run

```
npm run dev              # http://localhost:3000
```

- **/tv** — the television. Open at 1920×1080 (or let it scale). Keyboard is the D-pad: arrows,
  Enter = Select, Backspace/Escape = Back, M = Menu, Space = Play/Pause.
- **/phone** — the phone. Open on a real phone on the same Wi-Fi at `http://<this PC's IP>:3000/phone`
  (the landing page prints the address), or in a second browser window. Without a camera, the
  Capture screen offers three sample pages.
- **/api/smoke** — one call per engine, so a broken engine is found here and not on the TV.

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

## Where things are

```
src/app/tv, src/app/phone     the two surfaces
src/tv/screens.tsx            every TV screen, composed on On Air; src/tv/useSession.ts the stream
src/design/on-air.css         the design system as CSS
src/lib/engines/              text · vision · voice · embed — one function each, `provider` says which ran
src/lib/desk/                 read a page · hint · pick a lesson · analyse a sentence · analyse a paragraph
src/lib/rules/                decisions made in code: English tenses, essay sentence roles
src/lib/session/store.ts      the one session, its reducer, SSE fan-out, JSON persistence
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
