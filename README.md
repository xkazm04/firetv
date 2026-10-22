# Study Desk: homework on the TV, with the phone as the pen

## What Study Desk is

Study Desk turns the living-room TV into a homework desk for a family. The TV shows the work, large enough
for a parent and a child to read from the sofa. The phone is the input: it types, speaks, and acts as a document
camera pointed at the page. It has four parts: **Linga** (English conversation), **Math Buddy** (maths practice
and marking), **Essay Master** (essay reading) and **Writing** (a coached paragraph). Its rule is that the desk
withholds the answer. Hints lead the learner toward it, and decisions are made by code, not by the model. It is a
working Next.js app (`desk/`), shown on a Fire TV Stick through a small WebView APK (`stick-app/`).

## Why the TV leads and the phone assists

For a single student who just wants the answer, a phone app is faster, and Study Desk does not compete there
([docs/STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md), section 1). The TV adds what a phone cannot:

- **Two people, one page.** A parent and a child see the same work without crowding a 6-inch screen.
- **The phone becomes a camera and a keyboard, not a viewer.** It stays on the desk, and the TV is where you read.
- **Distance from distraction.** Notifications stay on the phone, not on the surface being studied.
- **Size for what needs it.** A geometry diagram or an essay's structure is legible from a metre away.
- **A Socratic stance.** Hints withhold the answer, inside a syllabus.

So the TV leads: the remote's D-pad drives every screen. The phone assists: it joins with a code the TV
shows, and it carries only what the TV cannot (typing, speech, a photo of the page). The design for this
split is [docs/concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](docs/concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md).

## The modules

The TV landing ([docs/DESIGN-STUDY-DESK.md](docs/DESIGN-STUDY-DESK.md)) shows whose desk it is and which app to open.

- **Linga (English).** Eight written situations: introductions, interests, a children's adventure, teamwork,
  bookings, interviews, adult dates (excluded from child profiles), and everyday disagreements. The learner
  replies on the phone by typing or speaking, asks for a cue or coaching, and replays the moment. A level check
  places the learner from A1 to C2. Design: [docs/DESIGN-LINGA.md](docs/DESIGN-LINGA.md),
  [docs/LINGA-PLACEMENT-DESIGN.md](docs/LINGA-PLACEMENT-DESIGN.md).
- **Math Buddy.** Two course paths: School maths (seventeen topics with school-year bands) and Calculus 1 (a
  first university course). The phone captures a page of working. The desk marks errors inside the line, by
  kind, and gives hints that never state the answer. Calculus items are decided in code by an expression engine
  ([docs/MATH-COURSE-PATHS.md](docs/MATH-COURSE-PATHS.md)). Design: [docs/DESIGN-MATH-BUDDY.md](docs/DESIGN-MATH-BUDDY.md).
- **Essay Master.** Reads a paragraph through lenses such as Structure, Argument and Evidence, and names the move
  that would fix a sentence. In Adult mode it opens on the Workroom: the learner's own texts,
  with versions, and a downloadable Twin Card ([desk/README.md](desk/README.md), "Trying the twin"). Design:
  [docs/DESIGN-ESSAY-MASTER.md](docs/DESIGN-ESSAY-MASTER.md).
- **Writing.** One coached writing episode on a browser page (`/writing`): pick a prompt, write a paragraph,
  read one coaching note, revise once, finish (`desk/src/writing/WritingEpisode.tsx`).

## Architecture

```
 phone browser  ──  /phone ──┐                         ┌── /tv  ──  Fire TV Stick
 (types, speaks,             │   desk/  (Next.js 16)   │          stick-app/ WebView APK
  photographs)               └──▶  one session store ◀─┘          (passes the remote's keys)
                                   rules in code
                                   engines behind one seam
```

- **The desk app** (`desk/`, Next.js 16, React 19). `/tv` is the television and `/phone` is the phone. The
  session (`desk/src/lib/session/store.ts`) is the only state: the phone posts events, and the TV renders the
  session over server-sent events. `desk/src/proxy.ts` classifies every API caller as TV, phone or guest.
  Decisions live in `desk/src/lib/rules/`, the pipelines live in `desk/src/lib/desk/`, and every TV screen is
  drawn to the On Air rules ([docs/DESIGN-ON-AIR.md](docs/DESIGN-ON-AIR.md)).
- **The stick APK** (`stick-app/`, package `dev.studydesk.stick`). The Fire TV's Silk browser passes only
  Play/Pause to a web page, and keeps the D-pad, Select, Back and Menu for its own cursor. The APK is one
  fullscreen WebView on the desk's `/tv` page that hands each remote button to the page as a key event. It finds
  the desk on the local network by itself. See [docs/concepts/STICK-APK-WALK-2026-10-20.md](docs/concepts/STICK-APK-WALK-2026-10-20.md).
- **The engines** (`desk/src/lib/engines/`). Each engine is one function with a `provider` field, chosen in
  `registry.ts`:

  | Engine | Provider | Needs |
  |---|---|---|
  | text: hints, explanations, Linga dialogue, essay readings | Claude Code CLI, headless (`claude -p`) | the `claude` CLI, signed in; optional `CLAUDE_BIN`, `CLAUDE_FAST_MODEL`, `CLAUDE_BEST_MODEL` |
  | vision: reading a captured page | Ollama, `qwen3.8:27b` | Ollama running; optional `OLLAMA_HOST`, `OLLAMA_VISION_MODEL` |
  | embed: lesson retrieval | Ollama, `nomic-embed-text` | Ollama running; optional `OLLAMA_EMBED_MODEL` |
  | speak: the TV's voice | Piper on the machine, else ElevenLabs, else the browser's own speech | `PIPER_BIN` + `PIPER_VOICE`, or `ELEVENLABS_API_KEY` |
  | listen: speech to text | a local faster-whisper server, or ElevenLabs | `STT_URL`; the phone also listens in the browser |

## Set up and run

You need Node.js 24 (the version CI uses, `.github/workflows/quality.yml`). The phone and the TV must be on the
same Wi-Fi as the computer that runs the desk, and port 3000 must be reachable from that network.

**1. Install and start the desk.**

```sh
cd desk
npm ci
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

For development, `npm run dev` runs the same app on :3000 with hot reload. If a page opened by IP never comes
alive in dev mode, add your LAN pattern to `allowedDevOrigins` in `desk/next.config.ts` ([desk/README.md](desk/README.md)).

At every start, the desk prints its TV link: `TV: http://<ip>:3000/tv?key=...`.

**2. Open the TV.** Open that link once in the TV's browser (or in a desktop window at 1920×1080). The key makes
that browser the desk's TV with a cookie. Without it, `/tv` says "Not this desk's TV". On a keyboard, the arrows
are the D-pad, Enter is Select, Backspace or Escape is Back, M is Menu, and Space is Play/Pause.

**3. Pair the phone.** On the phone, open `http://<ip>:3000/phone` (the TV shows the address and a QR code). Then
type the 4-digit code the TV shows. Without a camera, the Capture screen offers three sample pages. A phone
needs https for the camera and the microphone. `npm run dev:https` starts the desk with a local certificate
([docs/DESK-HTTPS-ON-THE-LAN.md](docs/DESK-HTTPS-ON-THE-LAN.md)).

**4. Sideload the stick APK (Fire TV).** You need JDK 17 and the Android SDK (`local.properties` with `sdk.dir`).
`gradle.properties` pins the operator's JBR, so on another machine pass `-Dorg.gradle.java.home=<a JDK 17>`
([CONTRIBUTING.md](CONTRIBUTING.md)). On the stick, turn on ADB debugging (Settings → My Fire TV → Developer
options) and read its address (Settings → My Fire TV → About → Network). Then, from the repository root:

```sh
node tools/gradlew.cjs :stick-app:assembleDebug
adb connect <stick-ip>:5555
adb -s <stick-ip>:5555 install -r stick-app/build/outputs/apk/debug/stick-app-debug.apk
```

Open "Study Desk" from the stick's launcher. It searches its network on :3000 for the desk. If it finds none, it
asks for the address on a setup screen driven by the remote. To make the stick the desk's TV, pair it once with
the `TV:` link the desk printed:

```sh
adb -s <stick-ip>:5555 shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://<ip>:3000/tv?key=<key>'"
```

The stick keeps only `host:port`, never the key. From then on, it opens the TV page from the launcher.

**5. Check the engines.** Open `http://<ip>:3000/api/smoke` from the TV browser. It lists the five engines, the
provider each would use, whether it answers and what to fix, with no model call. Add `?live=1` to run them for real.

**Keys and the no-key path.** No API key is required. The text engine is the Claude Code CLI on its own sign-in.
Vision and embeddings run on a local Ollama. Without Piper or an ElevenLabs key, the TV speaks with the
browser's own speech. Keys go in the gitignored `desk/.env.local`. The Adult-mode Workroom, keeping texts, the
portrait and the Twin Card need no model at all ([desk/README.md](desk/README.md), "Trying the twin"). The desk
keeps its records in a local, gitignored data folder. Set `DESK_DATA_DIR` to keep them somewhere else.

**Tests.** `npm --prefix desk test` runs the type check and then every rules suite, with no live model call
([AGENTS.md](AGENTS.md)).

## Built during the hackathon window

The hackathon window opened on 2026-08-31. The first commit in this repository is `273f4f1f` on 2026-09-06.
The first Study Desk commit is `c6cf8020` on 2026-09-07, and the stick APK is `17a3a854` on 2026-10-20.
Everything here was built inside the window (`git log --reverse`).

## Design docs

- All docs, by product: [docs/README.md](docs/README.md)
- The landing: [docs/DESIGN-STUDY-DESK.md](docs/DESIGN-STUDY-DESK.md). The shell's rules: [docs/DESIGN-ON-AIR.md](docs/DESIGN-ON-AIR.md)
- Linga: [docs/DESIGN-LINGA.md](docs/DESIGN-LINGA.md), [docs/LINGA-CONVERSATION-DESIGN.md](docs/LINGA-CONVERSATION-DESIGN.md)
- Math Buddy: [docs/DESIGN-MATH-BUDDY.md](docs/DESIGN-MATH-BUDDY.md), [docs/MATH-COURSE-PATHS.md](docs/MATH-COURSE-PATHS.md)
- Essay Master: [docs/DESIGN-ESSAY-MASTER.md](docs/DESIGN-ESSAY-MASTER.md)
- Scope and screens: [docs/STUDY-DESK-SCOPE.md](docs/STUDY-DESK-SCOPE.md), [docs/STUDY-DESK-SCREENS.md](docs/STUDY-DESK-SCREENS.md)
- On the stick: [docs/concepts/STICK-APK-WALK-2026-10-20.md](docs/concepts/STICK-APK-WALK-2026-10-20.md),
  [docs/concepts/STICK-DEADLINE-WALK-2026-10-21.md](docs/concepts/STICK-DEADLINE-WALK-2026-10-21.md),
  [docs/concepts/STICK-PERFORMANCE-2026-10-20.md](docs/concepts/STICK-PERFORMANCE-2026-10-20.md)
- The Devpost submission: [docs/devpost/](docs/devpost/)
- How agents work in this repository: [AGENTS.md](AGENTS.md), [docs/AI_HARNESS.md](docs/AI_HARNESS.md). How a
  change is accepted: [CONTRIBUTING.md](CONTRIBUTING.md). What changed: [CHANGELOG.md](CHANGELOG.md)

## Licence

MIT, see [LICENSE](LICENSE). Third-party assets are listed in [docs/licensing/ASSET-AUDIT.md](docs/licensing/ASSET-AUDIT.md).

## Other products in this repository

They share the idea that the TV shows and the phone is the input. Each has its own build and its own gate.

### Telestrator (the original proof of concept)

An Android TV app where a phone draws on a paused video frame. It was built first, to prove that the whole
toolchain runs on one Windows machine and ends in a real UI test. It does
([docs/POC-FINDINGS.md](docs/POC-FINDINGS.md)).

- The phone draws, and the stroke appears over the video on the TV, anchored to the paused frame. Seek away and
  the drawing leaves with its frame; seek back and it returns.
- Tools: freehand, arrow, circle, spotlight, name tag and eraser, in five colours. Undo and redo use an operation
  log. Transport from the phone: play/pause, frame step, slow motion and scrub. Review mode jumps between drawn moments.
- Two transports behind one interface: the TV listens on the LAN, or dials out to a relay
  ([docs/PLATFORM-RISK.md](docs/PLATFORM-RISK.md)). Pairing uses a QR code and a PIN.

| Path | What |
|---|---|
| `core/` | Pure JVM: annotation schema, timeline, pen engine, smoothing, hit-testing, undo, the wire protocol. No Android imports. |
| `tv-app/` | The Android app: Media3 player, Compose overlay, embedded Ktor server, QR pairing, D-pad input. |
| `companion/` | The phone PWA, copied into the APK at build time. |
| `tools/` | Live probes: `live-ui-test.mjs` (Playwright, the real PWA, the real TV, pixel assertions, 29 checks), `relay-test.mjs` (the same APK with no listening socket, 13 checks), `pen-sim.mjs`, `latency-probe.mjs`. |
| `vision/` | The local vision-model client ([docs/FRAME-ANALYSIS-LESSONS.md](docs/FRAME-ANALYSIS-LESSONS.md)). |

```powershell
./scripts/dev.ps1                    # unit, build, boot emulator, deploy, live UI test
./scripts/dev.ps1 -Stage unit        # no device needed
node tools/gradlew.cjs :core:test    # the core's unit tests
```

The build needs `local.properties` and a generated fixture clip ([fixtures/README.md](fixtures/README.md)). The
sports direction it was built for is closed ([docs/USE-CASE-OPTIONS.md](docs/USE-CASE-OPTIONS.md)).
