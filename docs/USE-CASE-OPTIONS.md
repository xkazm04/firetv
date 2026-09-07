# Five directions, if "AI & Sports Analytics" cannot be delivered at quality

**Date:** 2026-09-07 · written on a fork of the session, as a fallback plan.

**Premise.** The measurements in [AI-VISION-FINDINGS.md](AI-VISION-FINDINGS.md) say the local
model is a good *describer*, a poor *measurer*, and an unreliable *narrator*; that a drawn circle
reliably steers its attention; that it reads a scorebug correctly; and that tactical recognition
does not work in any prompt condition we tried. Separately, the phone→TV pen stack is solid on real
hardware: 27/27 live checks, p95 21 ms over Wi-Fi, two transports.

A golden use case sits on those facts rather than fighting them. Each option below is scored on
**user pull**, **reuse of what is built**, and **risk given what we measured** — not on how
impressive it sounds.

One constraint applies to anything "pause any content": Fire OS will not let us screencap another
app's DRM-protected video. Frames come only from **our own player** or media the user supplies.
Every option below respects that.

---

## 1. Party games on the TV, phones as the pens — with the AI as the guesser

**Pitch.** Pictionary / "draw the word" on the living-room TV. Everyone scans the QR, draws on
their phone, the TV shows it, and the *AI guesses the drawing* alongside the humans. Quiz rounds
where the host is the model.

**Why users want it.** It is the single most-played thing on a TV with friends present. Zero
install (the TV serves the page), works on any phone, works on the phone your visitor brought.

**What it reuses.** ~90%: pairing, pen engine, smoothing, colours, undo, frame anchoring becomes
round anchoring. The LAN transport is exactly right.

**The AI part is the model's strength, not its weakness.** Guessing a clean line drawing on a
plain background is *description of a simple image* — the case where it answered in 1 s and was
essentially perfect. No measuring, no narrating over time, no tactics.

**What is new.** Multi-pen (today "newest pen wins"), rounds/scoring, word lists. All ordinary.

**Risk.** Low. The only unmeasured piece is 4–6 simultaneous pens; the transport has headroom.

**Demo in one line.** Four phones, one TV, the AI shouts "cat!" before anyone else does.

---

## 2. "Ask the screen" — circle anything on a paused frame and ask, for any content

**Pitch.** Not sports-specific. Pause a cooking video, circle the pan: *"what is that?"* Pause a
documentary, circle the animal. Pause a film, circle a prop. The TV answers, spoken aloud.

**Why users want it.** It is the question people already ask the room, and nobody knows. It doubles
as **accessibility**: "describe what's on screen" for low-vision viewers, which hackathon judges
consistently reward and which is *exactly* the describer capability.

**What it reuses.** The circle tool as the pointer (Finding 4, proven on real footage between
players 50 px apart), the thumbnail path, pairing. ElevenLabs is already keyed in
`gravitone-gcloud` for the voice; Fire OS has TTS built in as the fallback.

**Why it is safer than sports.** General scene description is where the model was strongest on
every clip — flare in the stands, swishing net, the scorebug. It fails at *interpreting sport*,
not at *seeing things*.

**What is new.** A question box on the phone, TTS on the TV, and a content source: our player
with user-supplied media, or a small curated library. The DRM constraint bites here; say so in the
pitch rather than hiding it.

**Risk.** Low–medium. Latency is 1–3 s per answer, invisible on a paused frame. The honesty rules
(offer the null answer, demand evidence) already exist.

**Demo in one line.** Grandmother pauses a nature film, circles a bird, the TV tells her what it is.

---

## 3. Auto-highlights and live score tracker for recorded sport

**Pitch.** Drop a recording on the TV; it builds a timeline of the moments that mattered and a
score-over-time strip, and the remote jumps between them. Sport stays, the *claim* changes: not
"AI understands the game", but "AI finds the moments and reads the score."

**Why users want it.** Nobody rewatches 2½ hours. Everyone wants the 6 minutes.

**What it reuses.** Scorebug reading (correct, unprompted, on the first try), the closed-prompt
event gate (Finding 3 — it said "nothing happened" correctly when nothing did), sparse-frame
extraction, the library's transcript pipeline for any recording that has commentary.

**What is new.** A batch job — one frame a second through the model, ~1–3 s each, so a full game is
an overnight run on the 4090 or a cloud burst. A timeline UI on the TV.

**Risk.** Medium. Event detection was only proven for the *negative* case. Score-change detection
via the scorebug is the reliable signal: a score changed ⇒ something happened just before it.
Build the highlight logic on that, not on the model's opinion.

**Demo in one line.** "Show me every basket in the fourth quarter" and it does.

---

## 4. Software development — "Couch Studio": build a TV experience from your phone, rendered on a thin Fire TV client ★ the dev-focused option

**Pitch.** The Fire TV app is a *thin renderer* — a full-screen WebView that shows whatever HTML it
is sent. The phone is the prompt box. Claude Code on the PC (or in the cloud) generates the
experience — a trivia round for tonight, a countdown board, a kids' spelling game, a dashboard —
and it appears on the TV live, iterated from the couch. *"Make the timer bigger. Add a buzzer
sound. Now make it a two-team game."*

**Why this satisfies the brief.** Two devices, one of them light. The Stick has 1.7 GB RAM and was
already swapping; it should not run a model and does not need to. Rendering HTML is what it is
good at. The heavy compute is wherever the agent lives. The phone contributes text input and a
touch surface. **Every device does the one thing it is cheap at.**

**Why users want it.** It is the vibe-coding moment on the biggest screen in the house, for people
who will never open an IDE. It is also a genuine dev tool: TV app developers get a live-reload
target they drive from a phone, with `adb` never mentioned.

**What it reuses.** More than it looks: the LAN server in the APK already serves a page to a phone
and pushes state to a WebSocket — that *is* the render channel. `dev.ps1 -Device`, the pixel
assertions and the latency probes become the developer's verification loop: the agent can deploy,
screenshot, and check its own work on the real TV, which is what the whole first week built.

**What is new.** A WebView surface in the TV app, a "push HTML" message type, the Claude Code side
(a small MCP tool: `render_on_tv(html)`), and a phone prompt box. Sound via `<audio>` in the page.

**A second flavour, same plumbing — "Mission Control".** The TV shows long agent runs (build
status, test results, what Claude is doing right now); the phone is the approve/deny remote for
permission prompts. Developers watching a 40-minute run from the sofa instead of the desk chair.
Less magical for a demo; more likely to be used daily.

**Risk.** Low on the TV side (WebView is mature on Fire OS), medium on "does generated HTML look
good on a 10-foot UI" — solvable with a house stylesheet the agent must use.

**Demo in one line.** Say "make a buzzer quiz for four teams" into your phone; thirty seconds later
the family is playing it on the TV, and you fix the font size by saying so.

---

## 5. Coach's clipboard — the telestrator for amateur teams, with the knowledge base as the expert

**Pitch.** The recalibrated sports direction. A parent films the youth game on a phone; at home it
plays on the TV; the coach draws on it exactly as we built; and when they circle a player and ask
*"what should the defence do here?"*, the answer comes from the **library of expert breakdowns** —
retrieved, cited, and read out — not from the model looking at the pixels.

**Why users want it.** Every youth coach does this with a laptop and a whiteboard. Nobody has it
on the living-room TV with a phone as the pen.

**Why it works where "AI sports analytics" did not.** The human does the *seeing*; the AI does the
*vocabulary*. That inverts the failed experiment: Finding 7 showed the model cannot recognise a
tactic, and Findings 5–6 showed it cannot bind names to bodies. Retrieval needs neither. The
knowledge base already holds 131 concepts with visual cues, cross-validated across channels, and
it is grounded in transcripts we can quote.

**Own footage fixes two problems at once.** No rights question, and a phone filmed from the stand
gives players hundreds of pixels tall — the resolution that made basketball work and soccer fail.

**What it reuses.** All of the telestrator, the clip library, `patterns.py`, the circle-as-pointer.

**What is new.** A retrieval layer over the transcripts (keyword or a small embedding model —
nothing exotic), a concept-card UI on the TV, and TTS.

**Risk.** Medium. The unproven step is whether retrieved commentary about *someone else's* game
reads as useful on *this* frame. That is the exact question the un-forked branch is testing.

**Demo in one line.** Circle the defender, ask "what is drop coverage?", and the TV shows the
concept card with the expert's own words and a diagram, over the paused frame of your kid's game.

---

## How they compare

| | user pull | reuse | risk | AI on its strengths? |
|---|---|---|---|---|
| 1. Party games + AI guesser | **very high** | ~90% | **low** | ✅ describing a clean drawing |
| 2. Ask the screen / accessibility | high | ~70% | low–med | ✅ scene description |
| 3. Auto-highlights + score strip | high (sport fans) | ~50% | medium | ⚠️ only via the scorebug |
| 4. Couch Studio (dev) ★ | high (a different crowd) | ~60% | low–med | ✅ generation, not perception |
| 5. Coach's clipboard | medium (niche, loyal) | ~85% | medium | ✅ retrieval, not perception |

**If one has to be picked cold:** **1** wins the room and is nearly built. **4** is the one a judge
remembers, and it is the only option whose AI component gets *better* as models improve rather than
being capped by perception. **2** is the safest way to keep the "AI on the TV" story with the
accessibility angle as a moat.

**Pairing that works:** 1 + 4 share the same phone-input, TV-render plumbing; ship the party game
as the *first thing Couch Studio generates*. That tells one story with two demos.

**What to stop claiming, in any option:** that the AI understands the game. Every measurement says
it does not, and the pitch that survives is the one that never needed it to.
