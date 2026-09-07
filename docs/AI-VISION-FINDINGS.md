# Sports AI on local hardware — what the eye can and cannot do

**Date:** 2026-09-07
**Question asked:** before committing to AWS, a tracking pipeline or any Fire TV integration, what
can we actually extract from sports frames using only what is on this machine — and which use case
is worth chasing?

**Verdict: the local model is an excellent *describer* and a poor *measurer*. That is not a
limitation to engineer around; it selects the use case.**

Everything below was measured today. Nothing here needs a TV, an AWS account, or a network.

---

## 1. What we have, measured

| Resource | Detail |
|---|---|
| Vision model | `qwen3.8:27b` (27.3 B, Q4_K_M, 17.7 GB) via Ollama at `127.0.0.1:11434` |
| GPU | RTX 4090, 24 GB — the model fits entirely in VRAM |
| Also available | `GOOGLE_AI_API_KEY` (Gemini) in `gravitone-gcloud`, if a cloud eye is ever wanted |
| Video tooling | `yt-dlp` 2026.08.19, `ffmpeg` 7.x |
| Orchestration | Claude Code CLI (this) for the reasoning layer |

### Latency, and the one number that governs everything

| Input | Prompt tokens | Warm latency |
|---|---|---|
| 1920×1080, simple scene | 2061 | **1–3 s** |
| 960 px wide | 531 | 2.5 s |
| 640 px wide | 241 | 1.8 s |
| 1280×720 **broadcast wide shot**, full frame | — | **19–194 s** ⚠️ |
| Same frame, cropped to the player band | — | **4.8–5.7 s** |

First call after idle costs **25 s** — that is loading 17 GB into VRAM, once, not per frame.

**Two consequences, and they decide the shape of the product:**

1. **Real-time video analysis is off the table locally.** 25 fps needs 40 ms/frame; we have
   seconds. Anything live must be sparse-sampled or run in the cloud.
2. **Paused-frame analysis is comfortably interactive** — which is exactly the moment a
   telestrator already creates. The product we built pauses on a frame and waits for a human.
   That is precisely where a 2-second answer is invisible.

**Scene complexity costs more than resolution.** A 1080p test pattern answers in 1 s; a 720p
broadcast frame full of small players and a crowd took up to 194 s and returned nothing usable.
Cropping to the horizontal band the players occupy took it to 5 s — a **~35× speed-up** — because
it removes thousands of crowd faces the model would otherwise try to account for.

---

## 2. The four primitives, scored against known truth

`vision/synth_pitch.py` generates a football scene from a spec, so the answer is known exactly:
12 players, 7 red and 5 blue, known shirt numbers and positions, and one scripted event — red 10
passes to red 11 between frames 2 and 3. Five frames, one second apart.

It is deliberately *easier* than reality — flat colours, no occlusion, numbers face-on. **Read
these as a ceiling, not a prediction.**

| Primitive | Prompt | Result |
|---|---|---|
| **count** | "how many red players?" | **1/5** ❌ |
| **roster** | "list every player: team, number, x, y" | **60/60 shirt numbers, mean position error 5 px** ✅ |
| **ball** | "who is in possession?" | **5/5**, including the change ✅ |
| **burst** | "what happened across these 5 frames?" | **wrong** — invented a duel, missed the pass ❌ |

### Finding 1 — never ask for a number, ask for a list

The same model, on the same image, scored **1/5 counting** and **60/60 enumerating**. Counting is
a single token it has to guess; enumeration makes it attend to each object in turn, and then *we*
take `len()`. This is free accuracy and it applies to every "how many" question we will ever want.

### Finding 2 — the model is a good eye and an unreliable narrator

Asked to narrate five frames, it produced a fluent account of a duel between red 11 and blue 7
that never happened, and missed the pass that did. Asked what is in *one* frame, it was essentially
perfect, five times in a row.

So the architecture writes itself, and `vision/sequence.py` implements it:

```
per frame:  VLM  →  structured observation (who, where, who has the ball)
across time: code →  differences, possession changes, events
```

Run against the same sequence, that pipeline reports:

```
PASS: red 10 -> red 11  (between frame 2 and 3)     ← exactly the ground truth
counts from the roster: {'red': 7, 'blue': 5}        ← exact
```

The model's own narration got this wrong. Arithmetic over its per-frame observations gets it right,
and **arithmetic cannot hallucinate.** Identity comes free from the shirt number, so players are
tracked across frames with no tracking algorithm at all.

---

## 3. What survives real footage

Source: a Creative Commons Attribution clip of a Rapid Wien match (`artifacts/vision/` — gitignored;
footage is never committed).

**What held up.** Scene reading is genuinely good. From one frame, unprompted, it returned sport,
camera framing, `phase: "stoppage"`, both kits with counts, and:

> "A flare is burning in the crowd, emitting bright orange light and thick white smoke. The stands
> are packed with fans waving green and white flags."

All correct. On a basketball clip it also correctly reported **0 players** rather than inventing
any, and read a swishing net as a completed shot. It does not fabricate objects.

**What broke.**

- **Enumeration degrades badly.** On the uncropped wide shot it returned zero players after 194 s.
  Cropped, it found 10–13 players and separated red from white — plus a black-shirted referee and
  a blue goalkeeper, both plausible.
- **Shirt numbers are mostly unreadable**: 3–5 legible out of ~13. On a broadcast wide shot a
  player is a few dozen pixels tall and the number is a handful. **Do not design anything that
  depends on reading a number off a wide shot.**
- **Cropping trades understanding for detection.** The cropped frame lost the crowd, and the model
  changed `phase` from the correct "stoppage" to "goal celebration". Context is what made the first
  answer right.
- **It confabulates into a vacuum.** Asked openly what happened across five frames of a stoppage,
  it described a free kick, a goalkeeper diving left, and a ball heading for the top corner. None
  of it occurred. The clip is twelve seconds of players standing around a burning flare.

### Finding 3 — confabulation is a prompt bug, and it is fixable

The invention happens when we ask "what happened" and nothing did. The model treats the question as
a premise. Give it an explicit way to say nothing happened, and demand evidence:

| Prompt | Answer |
|---|---|
| "What is happening?" (open) | narrates a free kick that does not exist |
| "Decide whether a significant event occurs. **Most 5-second windows contain none.** Only claim one if you can point to what visibly changed. State that evidence." | `significant_event: false`, `event_type: "none"`, confidence **high**, with correct reasoning: *"players standing relatively still… the primary activity is in the stands… this is an off-pitch event"* |

**Three rules, then, for every prompt we write:** enumerate instead of counting; always offer the
null answer; require evidence naming what changed.

### Finding 4 — a drawn circle is a working pointer, and we already build them

This is the result the recommendation rests on, so it was tested rather than assumed.

Visual question answering falls over on *reference*: "why is HE offside" is unanswerable unless the
model and the viewer agree on who "he" is. Text cannot fix it — "the player on the left" is
ambiguous with eleven of them — and coordinates are not something a viewer can express. So the
question is whether burning an annotation into the pixels changes what the model attends to.

Controlled test, synthetic scene, circle drawn on blue 7:

| | Answer |
|---|---|
| **Without** the circle | *"Red, number 11"* — it read "the circle" as the pitch's **centre circle** and answered about a different player entirely |
| **With** the circle drawn | *"The player inside the yellow circle is wearing a blue shirt with the number 7"* ✅ |

On real broadcast footage it also discriminates between two players about 50 px apart — a circle on
one returns "dark red or maroon kit… standing, possibly waiting for play to resume" (correct, it is
a stoppage), and a circle 40 px to the right returns "white kit" (also correct).

**So the telestrator's circle tool is the pointing device for the AI, and we built it last week
without knowing it.** The viewer draws where they are already drawing; the annotation is both the
question and the grounding. Nothing else in this document is as load-bearing as this, and nothing
else would have been as easy to assume.

Mechanically: draw the ring several pixels thick. A hairline vanishes when the model downscales the
frame, and a pointer the model cannot see is worse than no pointer, because the prompt still claims
one is there.

---

## 3b. Basketball is the right sport, by a wide margin

Repeating §3 on an NCAA broadcast (Kansas vs Colorado) against the soccer wide shot:

| | soccer wide shot | basketball broadcast |
|---|---|---|
| roster latency | 19–194 s | **2.7–4.4 s** |
| shirt numbers legible | 3–5 of ~13 | **8 of 9** |
| sequence narration | confabulated a free kick | **correct**, no invention |

Plus something soccer never gave us: it **reads the scorebug**. Unprompted, from one frame —
*"the scoreboard shows Kansas leading Colorado 33-32 with 2:25 left in the first half"*, correct.
Score, clock and period arrive free, with no integration and no data feed.

The reason is pixels per player. A basketball court is small enough that a broadcast frame gives
each player several hundred pixels of height where soccer gives a few dozen. **Every limit in §3
was a resolution limit wearing a costume.**

## 3c. Commentary transcripts — a real asset, and a real trap

YouTube carries an enormous library of tactical explainers, and `yt-dlp` gets their captions with
word-level timestamps. `gravitone-gcloud`'s `parse_vtt.py` de-overlaps YouTube's rolling captions
(692 words / 274 s = 152 wpm — the skill's rule is that over ~280 wpm means the de-overlap failed,
so this is clean). What comes out is expert analysis aligned to the second:

```
[00:22] Curry sets a cross
[00:24] screen for Draymond Maxi Kleber goes
[00:37] and now this is screening the screener
```

Named players, named tactical concepts, frame-aligned. That is exactly the labelled data this
whole problem is short of.

### Finding 5 — a single frame cannot see a tactical action, and it says so

Asked what basketball action was occurring in the frame at 00:24, with no commentary:

> *"The image is too blurry and the players are too far away to definitively identify specific
> actions like who is setting a screen or cutting… specific roles cannot be determined from this
> single, low-resolution frame."*

Correct, and **honest** — it declined rather than inventing, which is the §3 confabulation failure
not happening. A screen is an event over time, and one frame does not contain it. Any feature
phrased as "what play is this" needs either several frames or the commentary.

### Finding 6 — fusing the transcript naively produces confident wrong answers ⚠️

Given the same frame *plus* the commentary above, and asked to point out where each named player is:

| Model said | Actually |
|---|---|
| "Draymond: dark jersey **#42**" | #42 is **Kleber, on Dallas**. Draymond is a Warrior, in white/gold #23 |
| "Kleber: dark jersey **#11**" | #11 is Hardaway Jr |
| "Wiggins: white #22" | ✅ correct |

It put a Golden State player in a Dallas jersey. And the failure is **not** perception — asked
separately to read the numbers and kits, it returned #23 white/gold, #42 dark blue, #11 dark blue,
#22 white/gold, all correct. It can see fine. What it cannot do is *bind* a name from the text to a
body in the picture, and it does not know that it cannot, so it answers with the same fluency as
when it is right.

**So do not use a transcript as a grounding source.** Its right uses are:

1. **Labels.** Expert ground truth for scoring a pipeline, which is what §2 had to build a
   synthetic scene to get.
2. **A retrieval corpus.** A library of tactical concepts with worked examples — what a cross
   screen is, what "screening the screener" means — for a model to draw on when explaining.
3. **The explanation itself.** For a *prepared* clip, the commentary already says what is
   happening, better than we will. The AI's job there is retrieval and presentation, not
   perception — and that path cannot hallucinate a player onto the wrong team.

---

## 3d. What the broadcasters actually do — and why we cannot copy it

Researched 2026-09-07. The short version: **almost every advanced graphic you see on an NHL or NBA
broadcast is driven by tracking data from an instrumented venue, not by analysing the picture.**

| League | How it tracks | Consequence for us |
|---|---|---|
| **NHL** | **Sensors.** 14–16 infrared cameras above every rink, plus chips embedded in the puck and in players' shoulder pads. Data goes to teams, the NHLPA and broadcast partners (ESPN, Turner, Rogers); the pipeline runs on AWS with SMT building the graphics | ❌ **Unreplicable from video at any quality.** The information is not in the pixels |
| **NBA** | **Optical.** Sony Hawk-Eye since 2023-24 — 3D, sub-second latency, pose tracking, replacing Second Spectrum's centre-of-mass system. Second Spectrum still does broadcast augmentation for League Pass alternate telecasts | ⚠️ In principle camera-derived, but from a calibrated multi-camera rig, not a single broadcast feed |

The NHL EDGE graphics are then just presentation of that data: max skating speed bucketed (18–20,
20–22, 22+ mph), shot speed with a 100+ mph tier, shot and save location across 16 zones, time on
ice, distance skated, faceoff probability.

**This is the most strategically important thing in this document.** The reason ESPN's hockey
coverage looks advanced is not clever computer vision — it is a chip in the puck. We are not
behind them on algorithms; we are on the other side of a hardware boundary, and no amount of model
quality crosses it.

The telestration vocabulary itself is the part that *is* ours: broadcast tools (Chyron PAINT, RT
Software Tactic) offer arrows including **predictive** arrows projecting a hypothetical run,
circles, labels, spotlights, cursors, trails, 3D columns, and zone highlights with the outside
blurred. Our P0 palette — freehand, arrow, circle, spotlight, name tag — is already most of that
list. The gap is that theirs *stick to a moving player*, which needs tracking.

## 3e. The clip library, and a negative result

`vision/library.py` ingests coach-breakdown videos as timestamped transcripts (gitignored:
third-party content). Ten clips, **16,332 words** of expert commentary, all between 149 and 217 wpm
so the de-overlap is sound. `vision/patterns.py` extracts the tactical vocabulary: **154 concept
mentions, 131 distinct concepts**, each with a definition and — the field that matters — what it
*looks like* on screen.

Ranking by how many **independent channels** use a term separates domain vocabulary from one
presenter's habit:

| channels | concept |
|---|---|
| 4 | pick and roll, drop coverage |
| 3 | hedge, switch |
| 2 | slip, flare screen, drag screen, pick and pop, help defense, transition, double team |

The cues are genuinely concrete. Drop coverage: *"The defender guarding the screener stays deep in
the paint near the free-throw line or baseline, not coming up to the ball handler."*

### Finding 7 — the vocabulary does not make the model see, and a menu removes its honesty

`vision/analyse.py` gives the model five frames of a known play — the transcript says Curry sets a
cross screen for Draymond, then a back screen for Wiggins, then "screening the screener" — and asks
which concept is occurring.

| Condition | Answer | Correct? |
|---|---|---|
| **Blind**, no vocabulary | "pick and roll", `confident: true` | ❌ it is off-ball screening, not a ball screen |
| **Shared vocabulary** (right answer *absent*, so "none" was correct) | "slip", `confident: true` | ❌ and it should have said none |
| **Full 90-concept vocabulary** (right answer present) | "slip", `confident: true` | ❌ |

Three conditions, three confident wrong answers, and the escape hatch never used.

**This inverts Finding 3.** There, an explicit "none" option made the model correctly decline. Here
the same option is present and ignored — because a menu of plausible concepts is itself a
suggestion. Offering the null answer works when the alternative is open-ended; it stops working
when you also hand over a list of attractive things to pick. **A closed vocabulary buys accuracy
on perception questions and costs honesty on interpretation questions.**

So the knowledge base does **not** unlock tactical recognition. Its value is real but different:
labels, retrieval, and explanation — the three uses named in §3c — none of which require the model
to perceive the tactic.

### Finding 4, confirmed by accident

The model's answers kept referring to "the player circled". That looked like a hallucinated detail
until the frame was checked: **the breakdown video has its own red telestrator circle drawn around
#22**, and the model had latched onto it unprompted to decide who the play was about — correctly.

An independent confirmation of Finding 4, from a circle we did not draw and did not mention. Drawn
annotations steer this model's attention reliably enough that it uses them without being told they
are there.

---

## 4. Which sports-studio features are actually reachable

The honest split is between features that need **measurement** and features that need **description**.

| Feature | Needs | Local verdict |
|---|---|---|
| Offside line | calibrated pitch homography, precise feet positions | ❌ not with a VLM at any prompt |
| Player tracers / heat maps / distance covered | frame-rate detection + multi-object tracking | ❌ VLM far too slow; ✅ *a YOLO-class detector on this 4090 would do it* |
| Speed / distance between players | metric calibration | ❌ pixels ≠ metres without homography |
| Name tags pinned to players | per-player identity on a wide shot | ⚠️ shirt numbers unreadable; needs detection + tracking, not a VLM |
| Formation / shape ("the back line is flat, 4-3-3") | approximate positions only | ✅ reachable — positions were 5 px accurate on clean input |
| Possession and passes | who is nearest the ball, per frame | ✅ 5/5 synthetic; needs real-footage validation |
| Event / highlight detection | "did anything happen in this window" | ✅ with the closed-prompt discipline |
| **Explaining a paused frame in plain language** | scene understanding | ✅ **the model's strongest output by a distance** |
| **Answering a viewer's question about the frame** | scene understanding + dialogue | ✅ same strength, and nothing else we could build has this |

**The pattern:** everything in the ❌ column is a *geometry* problem that computer vision solved
years ago with detectors and homography, and that a language model is the wrong tool for. Everything
in the ✅ column is a *language* problem, where the VLM is the only thing we have that can do it at
all.

Chasing the ❌ column means rebuilding second-rate Hawk-Eye. Chasing the ✅ column means building
something the broadcast studios largely do **not** have, because it only makes sense with one
viewer and a remote in their hand.

---

## 5. The strongest case, and why

> **The viewer pauses on a frame and asks the television a question about it.**

*"Why is that offside?" · "What should the defence have done here?" · "Who is the free man?"*

It is the strongest case for four independent reasons:

1. **It sits exactly where our latency is invisible.** The telestrator already pauses and waits for
   a human. Two seconds is nothing there; the same two seconds is fatal in anything live.
2. **It uses the model's best output and avoids its worst.** Description and dialogue, not
   measurement and narration-over-time.
3. **It composes with what already works, and this is now measured, not hoped for** (Finding 4).
   The phone is a pen *and* a keyboard; the overlay is already the answer surface; and a drawn
   circle demonstrably redirects the model to the right player, on real footage, between players
   50 px apart. The grounding problem that sinks most visual Q&A is solved by a gesture the viewer
   was making anyway.
4. **The failure mode is survivable.** A wrong answer to "why is that offside" is a bad
   explanation. A wrong offside *line* is a broadcast-grade error on screen.

**Second-strongest:** auto-highlight detection over a whole clip — sample a frame per second,
closed-prompt each window, keep the windows with events. It is unglamorous and the local box can
do it overnight for a full match.

---

## 6. What I need from you

**1. Real tactical footage — the blocker.** ⚠️
Free stock sports footage is b-roll: a hoop against the sky, a flare in the stands. It is not the
elevated wide tactical shot every analysis feature assumes. Options, best first:

- **SoccerNet** — the research dataset built for exactly this: broadcast footage with player,
  ball, action and camera-calibration annotations. Free for research, needs a signed licence
  agreement. It would give us *labelled ground truth*, which is what turns opinion into a score.
- Footage you own or can record — a local match filmed from a stand is ideal and rights-free.
- A specific match you want to demo on, and confirmation of how we may use it.

Tell me which and I will build the ingest around it.

**2. Which sport.** Soccer is the best-supported by public datasets. Hockey is hardest (fastest
puck, most occlusion). Basketball has the smallest pitch and clearest kits. Pick one to go deep on
rather than three shallow.

**3. Does the demo need per-player identity?** This is the fork in the road. "The left back is
stepping up" needs only *positions*. "Number 6 is stepping up" needs *identity*, which the wide
shot does not give us and which changes the pipeline from one model to a detector + tracker + OCR
stack. My recommendation: **no** for the demo.

**4. What counts as good enough?** For a hackathon: does one convincing explanation on one prepared
clip win, or does it need to hold up on arbitrary footage? These are very different projects.

**5. Cloud budget, later not now.** Nothing so far needs it. When we do want frame-rate detection
or a hosted eye, the question becomes real.

---

## 7. What I would do next

1. **Get footage.** Everything else is blocked on it, and nothing else is.
2. **Build the smallest end-to-end thing**: a paused frame plus a circled region plus a typed
   question, answered locally. No TV, no cloud. It either feels like magic or it does not, and we
   will know within a day.
3. **Only then** decide whether it earns a detector, AWS, and the Fire TV integration.

The tooling for 1 and 2 is written and in `vision/`.

---

## 8. The retrieval prototype — what it can and cannot answer

`vision/coach.py`. Three steps, and the split is the whole design: the model **sees** (describes
the frame, no tactical vocabulary allowed), the index **finds** (semantic search over the library),
and the model **writes** using only what was found. No step asks it to know basketball.

`vision/retrieve.py` embeds 733 passages — 579 overlapping transcript windows that keep their
timestamps, plus 154 concept definitions — with `nomic-embed-text` on the local Ollama.

### Finding 8 — dense retrieval alone cannot bridge fan language to coach language

A viewer says *"the big man is hanging back near the rim instead of stepping out"*. A coach says
**drop coverage**. Those are the same thing, and the embedding model does not know it: the correct
concept scored **0.65**, *below* several rambling near-misses at 0.75, and never appeared in the
top five.

Expanding the question first — having the model write the answer it thinks is right, and searching
with *that* — puts drop coverage top at **0.90, 0.88 and 0.87 from three independent channels**.

This is not Finding 7 returning. The model is guessing a *word*, not reading the picture; the guess
is never shown to the viewer, only used to steer the search. A wrong guess costs a retrieval, not a
false answer — the passages it finds score low and the floor catches them.

### Finding 9 — the same trick becomes citation laundering when pointed at a frame ⚠️

Asked *"what is happening in this play right now?"* on a frame that is plainly a **free throw** —
shooter at the line, players along the key, referee, fouls on the scorebug — the expansion invented
a pick and roll, retrieval confirmed the invention at **0.905**, and the answer explained the frame
as "typical for setting up a high pick-and-roll", **with citations**.

Every component worked. Retrieval found genuinely relevant passages about a genuinely real concept,
and the model quoted them accurately. The failure is that the question was never about that concept
— expansion answers the hypothetical it just wrote, so aiming it at a specific moment converts a
guess into a *sourced* claim. **Citations made a wrong answer more convincing, not less.**

The fix is to route on the question, not to tune the retrieval:

| Question | Route | Behaviour |
|---|---|---|
| *"why would a defence switch every screen?"* | general → expand | drop coverage / switching found at 0.87–0.90, answered and cited ✅ |
| *"what is happening in this play?"* | specific → **no expansion** | best match 0.64, under the floor, refuses ✅ |

Both layers are needed. The similarity floor sits at 0.68 because *"what is the best way to cook a
risotto?"* still scored **0.643** against a basketball library — embeddings of jargon are never
that far apart. The model's own refusal is the second layer, and it caught the risotto question
even when the floor let it through.

### What the answers actually look like

Asked why a big man sits back near the rim, from four corroborating channels:

> "That positioning is called *drop coverage*. It's a defensive strategy where the big man stays
> back near the paint to protect the rim [1]. By retreating toward the basket, the defender stays
> between the ball handler and the rim, preventing easy drives or lobs [1]. This forces the ball
> handler to shoot over them rather than driving into the paint [2]."

Correct, sourced, traceable to a timestamp in a named video. That is genuinely useful content.

Asked what is happening on a specific frame, it says it does not know. That is also correct, and
it is the answer the whole design exists to make possible.

### 8.1 What this means for the product

The prototype answers **questions about the sport**, reliably and with sources. It cannot answer
**questions about the moment**, and now declines rather than pretending.

So the pitch is not "the AI explains this play". It is **an expert on the game, always available,
that never bluffs** — with the broadcast supplying the occasion to ask and the circle supplying
*who* the viewer means, while the tactical content comes from a human who already said it on
camera.

That is a narrower product than the one implied at the start of this document, and it is the one
the measurements support. The gap between them is exactly the perception problem in §3–§4, and
every attempt to close it with cleverer prompting has made it worse rather than better.

**What would widen it, in order of expected value:**

1. **More library coverage.** Every refusal above was a coverage failure, not a reasoning failure.
   Ten clips is nothing; a few hundred would answer most of what a viewer asks.
2. **A detector.** Positions at frame rate would make "specific" questions answerable — who is
   open, who is closest, how the shape changed — none of which needs the model to name a tactic.
3. **Prepared clips.** For footage already in the library, the commentary *is* the answer, aligned
   to the second. No perception at all, and it cannot be wrong.

## Reproducing any of this

```bash
python vision/synth_pitch.py --out artifacts/vision/seq1   # scene with known ground truth
python vision/probe.py       --seq artifacts/vision/seq1   # four primitives, scored
python vision/sequence.py    --seq artifacts/vision/seq1   # per-frame VLM + events in code
python vision/look.py --dir artifacts/vision/soccer_cc --crop 0.50,0.75   # real footage

# does a drawn circle point the model at the right player? (--compare runs it both ways)
python vision/ask_frame.py --frame artifacts/vision/seq1/frame_0.jpg   --at 0.632,0.406 --radius 0.035 --compare   --ask "Which player is inside the circle? Give their team colour and shirt number."
```
