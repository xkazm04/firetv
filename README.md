# Study Desk: homework on the TV, with the phone as the pen

## Quickstart (5 minutes, no Fire TV)

A desktop browser tab plays the TV, and your phone (or a second tab) plays the phone.

**You need:**

- **Node.js 24** (`node -v`). CI uses 24.
- **The Claude Code CLI, signed in**, for hints, Linga's dialogue and essay readings. Install it with
  `npm install -g @anthropic-ai/claude-code`, run `claude` once and log in, then quit it. No API key is needed:
  the desk calls `claude -p` on your own sign-in. Without the CLI the desk still opens, but those features fail.
- Nothing else. No Ollama, no keys, no Android tools.

**1. Install and start the desk.**

```sh
git clone https://github.com/xkazm04/firetv
cd firetv/desk
npm ci
cp .env.example .env.local      # cmd.exe: copy .env.example .env.local
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

`.env.local` from the example sets `DESK_VISION_ENGINE=claude-cli`, so Math Buddy reads a photographed page with
the Claude CLI too, and you do not need Ollama. If port 3000 is busy, use another (`-p 3640`); every address
below follows it. On Windows, allow Node.js on private networks when the firewall asks, or a phone cannot connect.

The terminal prints the TV link:

```
TV: http://<your-ip>:3000/tv?key=...
```

**2. Open the TV.** Open that exact link in a desktop browser and make the window full screen (F11). The key
makes this browser the desk's TV (a cookie), and then leaves the address. If you open `/tv` without the key, it
says "Not this desk's TV": open the printed link again. The keyboard is the remote: arrows are the D-pad, Enter is
Select, Backspace or Escape is Back, M is Menu, Space is Play/Pause.

**3. Pair a phone.** The TV shows a 4-digit code and an address.

- **A real phone** on the same Wi-Fi: open `http://<your-ip>:3000/phone` (or scan the QR code on the TV) and type
  the code.
- **No phone:** open a second tab at `http://localhost:3000/phone` and type the code there. Use `localhost` for
  this tab, not the IP in the TV link: cookies are kept per host name, so the two tabs stay two devices.

The phone says "Joined" and the TV says "Paired".

**4. Try it.** On the TV, Select "Choose who is studying" and add a learner (you type the name on the phone).
Then open Math Buddy, Linga or Essay Master from the TV. When the TV asks for a photo, the phone's Capture screen
offers three sample pages, so no camera is needed. A real phone on plain http cannot use its camera or
microphone; see "Camera and microphone on a phone" below.

**5. Check the engines.** In the TV tab, open `http://<your-ip>:3000/api/smoke`. It lists the five engines, the
provider each would use, whether it answers and what to fix, in about two seconds with no model call. With the
quickstart setup, `text` and `vision` say ok, and the other three say what is missing. That is fine: see below.

**What works with what.**

| Feature | Needs |
|---|---|
| Opening every screen, pairing, the Adult-mode Workroom and Twin Card | nothing |
| Hints, Linga's dialogue and coaching, essay readings, writing coaching | the Claude CLI, signed in |
| Reading a photographed page | `DESK_VISION_ENGINE=claude-cli` (the quickstart), or Ollama with `ollama pull qwen3.8:27b` (17 GB) |
| Picking a lesson video for a mistake | Ollama with `ollama pull nomic-embed-text`. The lesson transcripts are not in the repository (Khan Academy licence), so a picked lesson opens at 0:00 with no captions |
| The TV's voice | nothing: the browser's own speech. Piper or an ElevenLabs key sound better |
| Speech to text | nothing on the phone (browser recognition, needs https on a real phone) |

**Where your data goes.** The desk keeps learners, sessions and the TV key in `desk/data/` (gitignored), created
on the first start. Set `DESK_DATA_DIR` to keep them elsewhere. Delete that folder to start from scratch; the
desk then mints a new TV key.

**Camera and microphone on a phone.** A phone browser allows them only over https. `npm run dev:https` starts
the desk in dev mode with a local certificate for your LAN address ([docs/DESK-HTTPS-ON-THE-LAN.md](docs/DESK-HTTPS-ON-THE-LAN.md)).

**Development.** `npm run dev` runs the same app with hot reload. If a page opened by IP never comes alive in dev
mode, add your LAN pattern to `allowedDevOrigins` in `desk/next.config.ts`.

**Tests.** Once, install the test tools: `npm --prefix tools ci` (one suite needs `ws` and `playwright` from
there). Then `npm --prefix desk test` runs the type check and every rules suite, with no live model call, in
about five minutes ([AGENTS.md](AGENTS.md)).

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
  | vision: reading a captured page | Ollama, `qwen3.8:27b`; or the Claude CLI with `DESK_VISION_ENGINE=claude-cli` | Ollama running, or the `claude` CLI signed in; optional `OLLAMA_HOST`, `OLLAMA_VISION_MODEL`, `CLAUDE_VISION_MODEL` |
  | embed: lesson retrieval | Ollama, `nomic-embed-text` | Ollama running; optional `OLLAMA_EMBED_MODEL` |
  | speak: the TV's voice | Piper on the machine, else ElevenLabs, else the browser's own speech | `PIPER_BIN` + `PIPER_VOICE`, or `ELEVENLABS_API_KEY` |
  | listen: speech to text | a local faster-whisper server, or ElevenLabs | `STT_URL`; the phone also listens in the browser |

## On a real Fire TV

Start the desk as in the quickstart, on port 3000 (the stick looks for the desk on 3000, 3001, 3107, 8080 and 80;
on any other port, type the address on its setup screen). The Fire TV and the computer must be on the same
network, and that port must be reachable from it.

**Why an APK.** The Fire TV's Silk browser can open `/tv`, but it passes only Play/Pause to a web page and keeps
the D-pad, Select, Back and Menu for its own cursor, so you cannot drive the desk with the remote there. The stick
APK (`stick-app/`, package `dev.studydesk.stick`) is one fullscreen WebView on `/tv` that hands every remote
button to the page. There is no prebuilt APK in the repository: you build it.

**1. Build the APK.** You need JDK 17 and the Android SDK, with `local.properties` at the repository root holding
`sdk.dir=<path to the Android SDK>`. `gradle.properties` pins the author's JBR, so on another machine pass
`-Dorg.gradle.java.home=<a JDK 17>` ([CONTRIBUTING.md](CONTRIBUTING.md)). From the repository root:

```sh
node tools/gradlew.cjs :stick-app:assembleDebug
```

**2. Install it.** On the stick, turn on ADB debugging (Settings, My Fire TV, Developer options) and read its
address (Settings, My Fire TV, About, Network). Then:

```sh
adb connect <stick-ip>:5555
adb -s <stick-ip>:5555 install -r stick-app/build/outputs/apk/debug/stick-app-debug.apk
```

**3. Make the stick the desk's TV.** Pair it once with the `TV:` link the desk printed:

```sh
adb -s <stick-ip>:5555 shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://<your-ip>:3000/tv?key=<key>'"
```

The stick keeps only `host:port`, never the key. From then on, open "Study Desk" from the stick's launcher. If it
cannot find the desk, it asks for the address on a setup screen driven by the remote.

**4. Pair the phone** as in the quickstart, and check the engines at `http://<your-ip>:3000/api/smoke` from a
browser that has opened the TV link. A paired phone gets 403 there, and any other browser 401.

The walk on a real stick: [docs/concepts/STICK-APK-WALK-2026-10-20.md](docs/concepts/STICK-APK-WALK-2026-10-20.md).

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
