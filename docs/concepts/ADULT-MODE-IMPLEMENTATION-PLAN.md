# Adult mode "Take Two": the implementation plan

Written 2026-09-30 on branch `adult-mode-plan` (cut from main 4f0fc8e). No product code was changed to write it.
Paths are under `desk/src/` unless they start with `tools/`, `docs/` or `desk/`. Baseline: `cd desk && npm test` was
green in this worktree before the plan (exit 0: `tsc --noEmit`, then 30 suites, 502 tests passing). "Probe" means a
throwaway script run against the real modules on 2026-09-30, not committed. "1u" = one authored, tested item (a job
template with its test rows, a twist deck, a format card, a habit detector with its fixture table). Sizes S and M are
relative, not measured; nothing here is L (anything L was split).

## a. How to use this file

1. Every session starts by reading [ADULT-MODE-TAKE-TWO.md](ADULT-MODE-TAKE-TWO.md), then this file's status table
   (section b) and the last entry of the session log (section j).
2. Take the first `not started` row in the status table whose depends-on rows are `done` and whose owner decision
   (section h) is answered or has a stated default. The table is in execution order, not id order.
3. Build exactly one slice by its card in section e, in its own worktree (section f). Split it if it will not finish.
4. End by updating the slice's status row (status, branch, commit, date) and appending a session log entry.
5. Stop and ask the owner when section f says so; never guess past a kill criterion (section g).

## b. Status table (sessions update this)

| # | Id | Slice | Size | Depends on | Status | Branch | Commit | Date |
|---|---|---|---|---|---|---|---|---|
| 1 | A1 | Linga: pitch a scene, played now (+ mode read, keyword gate) | M | - | not started | | | |
| 2 | A2 | Linga: Cut and three notes | M | A1 | not started | | | |
| 3 | A3 | Math: Field Work, the first job | M | A1 (mode.ts) | not started | | | |
| 4 | A4 | Essay: style meter and the twin probe (riskiest test) | M | - | not started | | | |
| 5 | C1 | Linga: Take Two | M | A2 | not started | | | |
| 6 | B1 | Math: the chain checker and the 100-chain fixture | S | - | not started | | | |
| 7 | A5 | Platform: the mode switch and the Adult gate | M | A1, O1 | not started | | | |
| 8 | A6 | Platform: learner text store, delete, curtain, phone file | M | A5 | not started | | | |
| 9 | D1 | Essay: the reading core keeps paragraphs | M | - | not started | | | |
| 10 | D2 | Essay: the Workroom, a whole piece | M | A6, D1 | not started | | | |
| 11 | B2 | Math: jobs for the derivative strand | M | A3 | not started | | | |
| 12 | A8 | Platform: voice on the LAN, a voice per speaker | M | - | not started | | | |
| 13 | C2 | Linga: a cast with motives, secrets, voices | M | C1, A8 | not started | | | |
| 14 | A7 | Platform: PC drop page and .docx text | M | A6, O6 | not started | | | |
| 15 | D3 | Essay: versions and the diff | M | D2 | not started | | | |
| 16 | B3 | Math: jobs for applications of derivatives | M | B2 | not started | | | |
| 17 | C3 | Linga: genres, twist decks, Kind and Real | M | A1 | not started | | | |
| 18 | D4 | Essay: the format lens, first format card | S | D2 | not started | | | |
| 19 | D5 | Essay: habit detectors | M | D1 | not started | | | |
| 20 | B4 | Math: jobs for the other 12 topics (two batches) | M | B2 | not started | | | |
| 21 | B5 | Math: Beyond and the course map | M | B2 | not started | | | |
| 22 | B6 | Math: the mock paper, sealed and re-sat | M | A3 | not started | | | |
| 23 | D6 | Essay: the twin is born | M | A4 pass, D3, D5, O5 | not started | | | |
| 24 | D7 | Essay: the Sitting and the rulebook | M | D6 | not started | | | |
| 25 | C4 | Linga: romance and nightlife, 18+ | M | C3, A5, O3 | not started | | | |
| 26 | C5 | Linga: Mischief | S | C3, O4 | not started | | | |
| 27 | C6 | Linga: playbill, note strip, cold open | M | C1 | not started | | | |
| 28 | B7 | Math: bring your course | M | A6, B6 | not started | | | |
| 29 | B8 | Math: the sister problem | M | B1, B2 | not started | | | |
| 30 | D8 | Essay: Spot yourself and First read | S | D6 | not started | | | |
| 31 | E1 | Math: the step line (EXPERIMENTAL, flag off) | M | B1, A3, O2 | not started | | | |
| 32 | E2 | Math: Talk it through (EXPERIMENTAL, flag off) | M | E1, A8 | not started | | | |
| 33 | E3 | Together: the Read-Through | M | C2, D3 | not started | | | |
| 34 | E4 | The adult week and the recap curtain | S | A6, C6 | not started | | | |
| 35 | E5 | Essay: the twin's export card, 18+ | S | D7, O8 | not started | | | |

Backlog, not sliced (each needs its own plan): Improv night and the two-hander (several learner phones: session roles),
the Series bible and Opening Night, stage art (about twelve sets), a streaming or faster engine (O7), Essay phase 2
topic scout, a hosted twin (phase 3), photo marking for adults, PDF text (O6).

## c. Reconciliation with the code

The report was written from a digest. Each dependency below was read in the code (main 4f0fc8e) or probed. Facts the
Family plan already verified are cited as "Family c.N" (`firetv-family-p1/docs/FAMILY-PHASE-1-PLAN.md`, section c)
and not re-verified.

**Decisive findings (what the report assumed that is false or thinner)**

1. **No calculus working is checked line by line, and nothing is symbolic.** `locate` rings the first broken line of a
   linear equation only (`lib/rules/maths.ts:93,281-295`); a Calculus item has no pen position (`lib/desk/mark.ts:20`).
   Equivalence is numeric: ten fixed irrational samples, relative 1e-7 (`lib/rules/calc-expr.ts:690-715`). The engine
   reads the letter `x` only (`calc-expr.ts:15-29`). Probe: a tag checker built from `sameFunction`, `derivativeAt` and
   `integrate` got all eight hand-made cases right (the lost inner factor, the product rule skipped, a false expansion),
   ran 200 derivative checks in 30 ms, and returned "cannot read" for `T(t) = ...`, `V = pi r^2 h` and `T(x) = ...` with
   its left side. The step line is new code, cheap, and must alias a job's letter to `x` and strip left sides.
2. **Code does not choose a Calculus item's numbers today.** A set is one model call proposing specs, 7-14 s
   (`lib/desk/items.ts:180-203`), filtered by code (`items.ts:264-276`); its `difficulty` is the model's own
   (`items.ts:173,234-235`; Family c.19). Job templates and code-drawn values are new; Beyond must be a code tier.
3. **The twin's honesty lock rests on a model reading.** "Holds" is `rewriteState` over the model's new verdict
   (`lib/rules/essay.ts:125-129`, `lib/desk/essay.ts:91-110`). Only length, connectors and a first-pass role are rules
   (`essay.ts:12-47`); no habit detector exists. The lock becomes code's only where a detector is built (D5).
4. **Linga's audience gate trusts the model's label.** Probe: a romance premise labelled `all` passes `cleanTopic`
   (`lib/english/placement.ts:129-135`) and `all` is allowed for a 13-year-old (`lib/english/curriculum.ts:48-50`). The
   guards are a prompt asking for an honest label (`check.ts:155`) and the tutor's non-adult rule (`conversation.ts:57`).
   A keyword backstop is a safety fix for today's Family learners too (A1).
5. **Coach and replay are not Cut and Take Two.** The coach gives one note on the latest reply only
   (`conversation.ts:193,209`); replay asks a *new* question (`conversation.ts:193`, "Return to the scene with a new
   short question"); nothing forks the transcript. The scene contract forces a two-option quiz (`types.ts:22`; probe: a
   topic without one fails `cleanTopic`). One partner per scene (`conversation.ts:49`).
6. **There is no file path, no text store and no deletion, and a text already leaks across learners.** No route takes a
   file except `/api/listen` (audio, `app/api/listen/route.ts:8-11`). The proxy buffers every `/api` body and passes only
   the first 10 MB (`desk/node_modules/next/dist/server/config-shared.js:279`, `body-streams.js:98-102`), so the listen
   route's 25 MB cap is unreachable and a larger upload arrives cut. The essay route has no length cap
   (`app/api/analyse/route.ts:14-16`). A reading lives on the session, is sent to the TV and every phone
   (`store.ts:160,178`; `lib/session/pairing.ts:102-107`) and stays when another learner sits down (probe;
   `store.ts:373` clears only Linga state). No event deletes a learner or a profile (`store.ts:205-228`).
7. **Voice in does not work on a real phone today.** Speech needs a secure context (`english/ReplyBox.tsx:35`) and the
   phone is served on `http://` (`store.ts:234-237`). Voice out has one voice: `/api/speak` passes no voice id
   (`app/api/speak/route.ts:8`), Piper has one voice (`lib/engines/voice.ts:29-32`).
8. **Dating as the report plays it bends a written rule.** The tutor may never flirt explicitly, express attraction or
   agree to a romance, in any scene (`conversation.ts:57`); the design doc says success never requires pleasing the
   other person (`docs/LINGA-CONVERSATION-DESIGN.md:71`). "Flirting in words" and "whether the date says yes" need O3.

**The dependency table**

| # | Report dependency | Verdict | Evidence |
|---|---|---|---|
| 1 | The expression engine: derivative, integral, limit, roots, extrema, same function | true | `calc-expr.ts:433,477,574,620-690,712-723`; bounded, never throws (`:10-13`) |
| 2 | "Every relation the step line checks exists as an engine call, except solve = 0" | partly true | the primitives exist (row 1); no chain checker exists; a line that is an equation (`x^2 = 1`) is not a function relation and has no check; probe above |
| 3 | Symbolic equivalence of two working lines | false | numeric sampling only (`calc-expr.ts:690-723`) |
| 4 | "The engine reads x only" | true | `calc-expr.ts:15-29`; probe: `t`, `r h`, `2xy` do not compile |
| 5 | Set-up check: "their T is the job's function at the samples" | true, with an alias | `sameFunction` (`calc-expr.ts:712`); `cleanAnswer` strips a left side for answers only (`calc.ts:378-383`) |
| 6 | Exam cards: "checkAnswer marks them today" | true | `calc.ts:417-452`; typed answers have no route (`app/api/mark` takes an image; Family W6 adds `answers[]`) |
| 7 | "Code picks the numbers" of a job | false today | finding 2 |
| 8 | Two-stage hint with a leak check | true | `hint.ts:44-81`, `calc.ts:523-568`; Calculus stance "first-year university student" (`hint.ts:38-42`) |
| 9 | Spoken reasoning exists | true, after a photo | the Walk: `explain.ts:67-98,126-148`, settles by `checkAnswer` |
| 10 | Course paper reads 13 of 31 questions | true | `docs/CALCULUS-1-SYLLABUS.md:139-147`; 17 phrasings (`docs/MATH-COURSE-PATHS.md:220`) |
| 11 | Latch: 30% toward each result, secure at 0.85 after four | true | `learners.ts:47-52,203-214`; a new field is dropped unless whitelisted (`learners.ts:108-124`; Family c.18) |
| 12 | Phone speech recognition, transcript editable | true on localhost, false on a LAN phone | `ReplyBox.tsx:35,48-50`; `store.ts:234-237`; server STT exists (`lib/engines/listen.ts:1-13`, used only by a test bar) |
| 13 | Voice out, a delivery note per character | partly true | one voice (finding 7); ElevenLabs takes a voice id (`voice.ts:67`) if the route passed one |
| 14 | "The plan writes contracts today" (pitch to contract) | partly true | own-words topic, 400 chars (`placement.ts:15`, `check.ts:315-329`), only inside the level check's plan stage, at most 8 (`placement.ts:12`) |
| 15 | A model-invented premise passes the validators | true, too easily | `cleanTopic` checks shape and lengths only (`placement.ts:129-135`); finding 4 |
| 16 | Scene contract fields | partly true | forced two-option quiz, one partner string of 60 chars (`types.ts:19-23`, `placement.ts:132-133`) |
| 17 | Moments, quote-checked | true | gap and cap in code (`conversation.ts:77-83`), a fix must quote the reply (`:89`) |
| 18 | Notes quote the learner | true for the coach's one note | `conversation.ts:209`; observations must quote too (`rules.ts:46`) |
| 19 | "A Take is not evidence" | true in effect | replay turns are recorded as supported (`conversation.ts:213,199`); progress counts spoken, unsupported evidence (`rules.ts:28-34`) |
| 20 | Phrase contained, "as review's reusedAt" | true | `lib/english/review.ts:43-77` |
| 21 | Turn latency 2-8 s, not streaming | true: 4-6 s measured with thinking off | `text.ts:27-31`; the CLI answer is read on process close (`text.ts:55-67`); older runs 17-52 s (`docs/LINGA-IMPLEMENTATION-PLAN.md:52`) |
| 22 | A scene holds a long improvisation | partly | 24 learner turns at most (`conversation.ts:176`); lines of 230 chars, one or two sentences (`:58`) |
| 23 | Adult and older gates | true | `curriculum.ts:44-50`; the non-adult prompt rule (`conversation.ts:57`) |
| 24 | Essay: per-sentence verdicts, fix contract, rewrite re-judged | true | `lib/rules/essay.ts:63-122`, `lib/desk/essay.ts:28-112` |
| 25 | A whole piece can be read per paragraph | false today | paragraph breaks destroyed (`essay.ts:25,117`; Family c.16) |
| 26 | The style sheet "measured by code" | partly | only words per sentence, connectors, roles (`essay.ts:12-47`); `CONNECTORS` is not exported (`:12`) |
| 27 | Adult tutor voice | false | "a 15-year-old" (`lib/desk/essay.ts:34,92`; Family c.8, W2 `voiceOf`) |
| 28 | A store for the learner's texts, with versions | false | one `learners.json`, the whole book rewritten on each write (`learners.ts:98-104`); memory 40, history 20 (`:47-48`); finding 6 |
| 29 | Essay texts reach the model's memory lines | false (good) | `writeMemory` takes Math items only (`lib/desk/memory.ts:21-44`) |
| 30 | A PC pairs like a phone | true, coarsely | any device with the pin is a "phone" (`pairing.ts:59-63`); the pin lapses only on reset; not bound to a learner, no expiry |
| 31 | The text engine, whole-file reads | partly | `claude -p`, one call, 90 s default (`text.ts:44-67`); the system prompt is an argv entry (`text.ts:46`): long learner text must go in the prompt (stdin), never the system prompt ([framework] Windows limits a command line to about 32k characters) |
| 32 | Retrieval of the learner's own passages | possible locally | `lib/engines/embed.ts:1-13` (nomic-embed-text on Ollama) |
| 33 | "Fine-tune" a twin | false | no fine-tuning anywhere in `lib/engines/*`; the twin is a prompt-held profile (concept section 6) |
| 34 | Gates stub a model | true | `useProvider("text", ...)` (`lib/engines/registry.ts:1-33`) |
| 35 | One job record per kind | true, a constraint | `JobKind` union and one record each (`store.ts:136-141`); a many-paragraph read needs its own kind |

**What the twin can and cannot be, and what code can decide**

| Question | Code can decide | Only a model or a person can say |
|---|---|---|
| Is the draft "in their style"? | sentence-length and paragraph-length bands, connector and opener rates, a function-word profile distance to the learner's pieces against the plain model's distance (A4 builds these) | whether it sounds like them: Spot yourself, a person's pick, code keeping the answer |
| Does it plant their habits? | a planted habit is present, where a detector exists (D5) | a structural or argument habit (labelled a reading) |
| Is it the twin's own prose? | no 8-word run copied from the learner's corpus; no digit, statistic or proper name absent from the learner's own material | nothing more |
| Did the learner prove a move? | the sentence changed; the detector no longer fires in the learner's own new version; that version holds no 8-word run from any twin draft | "the rewrite holds" (a model reading, as today) |
| Who wrote a pasted text? | nothing | nothing: stated as a limit on screen |

## d. Prerequisites and the seam

- **Profile.mode lives in Family W4**, on branch `family-phase-1`, not merged, and not built yet (that branch has W1
  only, 6901cf9). Its spec after owner decision D1: `Profile.mode?: "family" | "adult"`, `modeOf(p)` in
  `lib/rules/mode.ts`, a `profile.draft` patch cannot set mode, the edit copy list at `tv/keys.ts:242` keeps it, age
  default (Family under 18, and for "other" until confirmed), no parent code.
- **If W4 is not merged when Adult starts**: A1 creates only the read, `lib/rules/mode.ts` `modeOf(p, prefs)`, with
  W4's names and W4's age default and no stored field. Every adult door reads it. A5 then either adopts merged W4 or
  builds W4's stored field exactly as specified above, so the second branch to merge meets a trivial conflict. Record
  in the log which happened. Never build a second mode concept.
- **The Adult gate** (O1). Today: "older" = age 15+ or type "other"; "adult" = age 18+, or "other" and confirmed
  (`curriculum.ts:44-50`). Recommended for the first release: Adult mode reachable at 18+ or "other" confirmed only,
  because Family D1 removed the only parent mechanism; 15-17 returns with a parent code (W4's shelved design) as its
  own later slice. Features needing more than the mode: romance and nightlife scenes, Mischief (O4), exporting the twin
  (E5) at 18+ confirmed even if the floor is later lowered; the twin never writes a school-essay format at any age.
- **Shared platform, built once, before the slices that need it**: the mode read (A1) and switch (A5); the learner
  text store with deletion and a TV curtain (A6); the PC drop and .docx text (A7); voice on the LAN and a voice per
  speaker (A8). Family's Essay (W3) and a later Family text path use A6/A7 too. If Family W2 (`voiceOf`) or W3
  (`paragraphsOf`) or W6 (typed answers) is merged first, adopt it and do not duplicate it.

## e. The slices

Every slice: the gate is `cd desk && npm test`, green at the slice's commit; a new suite is appended at the END of
`test:rules` in `desk/package.json`; no live model call in a gate (stub at the `provider` seam, `registry.ts:1-33`);
never touch `desk/data/` (a temp `DESK_DATA_DIR`); a screen change gets a capture by the recipe in section f and the
screen doc (`docs/STUDY-DESK-SCREENS.md` and the module's `docs/DESIGN-*.md`) updated in the same commit.

### Phase A: first things a learner can do, the seam, the riskiest test

**A1. Linga: pitch a scene, played now** (M)
- Goal: an adult types or says a premise (400 chars) and plays it at once, gated by the stricter of a keyword list and the model's label.
- Why now: the owner's "no hard-coded topics" in its smallest true form; closes finding 4 for every age.
- Files: new `lib/rules/mode.ts` (`modeOf`, section d); new pure `lib/english/gate.ts` (`audienceOf(text, label)`: keyword lists per audience plus a never-list; the stricter wins); `lib/english/check.ts` (apply `audienceOf` in `pick`, `:157-163`); `lib/english/conversation.ts` (action `pitch`: one shaping call as `propose` with `asked`, then `start` on it); `types.ts`/`rules.ts` (`EnglishLearning.pitches`, capped 12, added to the `cleanEnglish` whitelist `rules.ts:16-26`); `curriculum.ts` `eligibleScenes` includes pitches; `lib/english/view.ts`, `english/LingaTV.tsx`, phone Linga panel ("Pitch a scene", mic where available).
- Kind: pure (gate, mode) + one model call + UI.
- Tests: new `tools/adult-rules-test.cjs` (`modeOf` table; `audienceOf` table of at least 60 pitches, including the probe's romance-as-`all`, which must come out `adult`); rows in `tools/linga-rules-test.cjs` (a pitch for a 13-year-old never yields `adult`; the pitch action with a stubbed engine starts a scene; the never-list refuses).
- Accept: gate; TV capture of `linga-scenes` with a pitched card and phone capture (390 px) of the pitch field.
- Cost: +1 call per pitch (as plan-add today), then about 1 per turn. Authoring: keyword lists (2u, a person reads).
- Could go wrong: keyword lists over-block ordinary words ("bar" of chocolate): the stricter gate only narrows, so an over-block costs a scene, never safety; log refusals.
- Done: [ ] gate green [ ] every Family-age profile unchanged except the backstop [ ] captures looked at [ ] Linga design doc updated.

**A2. Linga: Cut and three notes** (M)
- Goal: the learner calls Cut (or the scene ends); up to three notes, each quoting their own words, land on the TV tape; a note whose quote is not theirs is dropped.
- Why now: reflection on mistakes, the owner's word, as the theatre's note; builds on the coach (`conversation.ts:193,209`).
- Files: new pure `lib/english/notes.ts` (`cleanNotes`: quote a substring of that learner turn, kind `meaning|form|word|register`, a `form` note only where `resolveEnglish` finds a conflict, `lib/rules/english.ts:73`; at most 3); `turn.ts` (state `notes`, ACCEPTS row); `conversation.ts` (action `cut`: one call over the learner turns); `types.ts` (`Note`); `view.ts`, `LingaTV.tsx` (tape strip, three pins, one caption slot), phone.
- Kind: pure validator + one model call + UI.
- Tests: rows in `tools/linga-rules-test.cjs` (misquote dropped; a fourth note dropped; a `form` note without a rule conflict becomes `meaning`, labelled a reading; `turnState`/`accepts` rows).
- Accept: gate; TV capture of the notes screen (safe zone, type floor, one sentence per caption). Operator run once (not a gate): a new `tools/linga-company-sim.cjs`, after `tools/linga-placement-sim.cjs`, plays 20 pitched scenes at B1 across four genres; a person reads each: in role, in band, every note a real slip. Record the counts in the log.
- Cost: +1 call per scene. Authoring: 0u.
- Could go wrong: notes pile on one slip; the validator dedupes by quote.
- Done: [ ] gate [ ] capture [ ] sim run recorded (or deferred with reason) [ ] docs.

**A3. Math: Field Work, the first job** (M)
- Goal: an adult on the Calculus path does one real job end to end on the phone: guess, type the set-up (checked by code), type the answer (checked by code), then two exam cards typed and marked by `checkAnswer`.
- Why now: the owner's "practical applications" with "pass the exam" as the way out; no photo needed.
- Files: new pure `lib/rules/jobs.ts` (`JobTemplate`, `drawJob(t, seed)` values and `f` and a spec; `storyOk(story, values)`: every number in the story is one code drew, units from the template; `alias(line, letter)` to `x` and left-side strip); one template (calc1-derivative, a cooling cup); new pure `lib/rules/sketch.ts` (a polyline from samples); new `lib/desk/job.ts`-style runner `lib/desk/fieldwork.ts` (one story call, fast, thinking off; a refused story twice falls back to the template's own plain sentence); route `app/api/fieldwork/route.ts` (typed settle through `settleSpec`, `lib/rules/maths.ts:95`, then `recordAttempt` for exam cards only); `store.ts` (Screen `job`, a `job` slot); `tv/keys.ts` (a Field Work door on Tonight for `modeOf(p) === "adult"` and `mathPath === "calc1"`); `maths/MathsTV.tsx` (job screen, two bars: guess and answer); phone panel.
- Kind: pure + one model call + UI.
- Tests: new `tools/jobs-rules-test.cjs` (seeds 1..200 all `wellFormed`; `storyOk` refuses a foreign number, a number word, a spelled answer; alias and strip; the set-up check accepts `T(x) = 20 + 70e^(-0.1x)` in the job's letter); new `tools/fieldwork-test.cjs` (engine stubbed: the story call, the fallback, exam cards typed settle and latch; a wrong set-up records nothing).
- Accept: gate; TV capture of the job screen and phone capture of the set-up field. Five adults do one job and say whether they would do another tomorrow (owner-run, log it).
- Cost: 1 story call per job, exam cards as today (1 call per set) or 0 if drawn from templates. Authoring: 1u.
- Could go wrong: typed maths on a phone keyboard is clumsy (a hint line shows the accepted spellings; the keypad is E1).
- Done: [ ] gate [ ] captures [ ] exam cards move the latch, the job alone never does [ ] DESIGN-MATH-BUDDY updated.

**A4. Essay: the style meter and the twin probe** (M, the riskiest assumption)
- Goal: measure, before any twin is built, whether a prompt-held profile makes the model sound like a writer.
- Why now: the twin is the owner's own idea and the centre of Essay; if it is a costume, D6-D8 are not built.
- Files: new pure `lib/rules/style.ts` (`styleSheet(texts)`: words per sentence and per paragraph as distributions, connector and opener rates, a function-word profile, punctuation; `withinBands(sheet, text)`; `copyRun(a, b, k)`); export `CONNECTORS` from `lib/rules/essay.ts:12`; new operator tool `tools/twin-probe.cjs` (not in the gate): reads a writer's three pieces from a folder outside the repo, builds the sheet, asks the real engine for a twin paragraph (sheet plus two signature passages, in the prompt, never the system prompt) and a plain paragraph on the writer's subject, writes a shuffled trial sheet and a separate key, and scores the picks with the code distances beside them.
- Kind: pure + operator-run model calls.
- Tests: new `tools/style-rules-test.cjs` (fixed fixture texts the builder writes: distributions, bands, copy-run, empty and one-sentence inputs).
- Accept: gate; the protocol in the tool's header; the owner runs it with at least 8 writers x 3 trials (a hackathon is a fit). Pre-registered rule (proposal): the twin passes when writers take the twin for their own, or cannot tell it from their own, more often than the plain model in at least 6 of 8 writers. Result in the log and the status row.
- Cost: about 2-4 calls per writer. Authoring: 0u. Privacy: the pieces stay in the operator's folder; nothing enters `desk/data/` or git.
- Could go wrong: writers recognise their own topic, not their style (the tool gives both model paragraphs the same subject and length).
- Done: [ ] gate [ ] tool runs against a stub and against the real engine once [ ] owner result recorded, or the row says "awaiting owner run".

### Phase C1 and B1 (run early; see the status order)

**C1. Linga: Take Two** (M)
- Goal: from a note, the scene forks at the partner line before the noted turn; the same line is re-delivered; the learner re-delivers; up to two cast turns follow; code says held, not held, or nothing.
- Why now: the second take is the spine of the bet.
- Files: `types.ts` (`Take { from: turnId, turns[], noteId, held: boolean|null }`, on the conversation); `conversation.ts` (action `take`: copy turns to the fork, replay audio with `audioNonce`, `turn` inside a take); pure `lib/english/take.ts` (`heldOf(note, reply)`: rule passes via `resolveEnglish`; phrase contained via `review.ts` `findPhrase`; a `word` note held when the quoted own-language word is gone and the English phrase is contained; else null); `turn.ts` (state `take`); `LingaTV.tsx` (the fork drawn as a branch, the struck note).
- Kind: pure + about 2 calls per take + UI.
- Tests: `tools/linga-rules-test.cjs` rows (`heldOf` table of at least 30 rows including null cases; take turns stored as supported, `rules.ts:28-34`, so progress never moves on a take).
- Accept: gate; TV capture of a take (the branch, the struck or open note).
- Cost: +2-3 calls per take. Authoring: 0u.
- Could go wrong: "held" by containment rewards parroting; the note stays a reading unless a rule or phrase stands behind it, and a take is never evidence.
- Done: [ ] gate [ ] capture [ ] docs.

**B1. Math: the chain checker and the 100-chain fixture** (S)
- Goal: a pure checker that rings the first line of calculus working that stops holding, measured on 50 clean and 50 planted chains before any screen uses it.
- Why now: the cheapest Math test (code only); the sister problem (B8) and the step line (E1) stand on it.
- Files: new pure `lib/rules/chain.ts` (`checkChain(lines: {tag, text}[], {letter})`: tags `=` (`sameFunction`, or equal values for constants), `d/dx`, `int` (+C required on the last indefinite line), `at` (value), `lim` (`limitAt`), `solve0` (a line `x = c` where the previous line is zero within the shape tolerance); an equation line with two sides returns null; per line `true | false | null`).
- Kind: pure.
- Tests: new `tools/chain-rules-test.cjs`: 50 clean chains across the six strands and 50 with one planted slip (after `CALC_SLIPS`, `calc.ts:578-592`); zero clean chains rung; each planted slip rung at its own line or null, never at another line; timing under 5 ms a chain.
- Accept: gate. Kill or bend (section g): one clean chain rung means the step line is not built until fixed; more than 5 planted slips missed narrows the tags.
- Cost: 0 calls. Authoring: 100 fixture chains (about 10u).
- Done: [ ] gate [ ] counts in the log.

### Phase A, continued: the platform

**A5. Platform: the mode switch and the Adult gate** (M)
- Goal: a profile can be switched to Adult where O1 allows, and back to Family always; every adult door reads `modeOf`.
- Files: adopt merged Family W4, or build its stored field (section d): `store.ts` (`Profile.mode`, patch drops mode as `pathChecked` drops a bad path, `:34-37`), `tv/keys.ts:242` copy list, `tv/profileRows.ts` (a Mode row; Adult shows only when allowed, else "Adult is for 18 and over"), `curriculum.ts` audience matrix by mode.
- Tests: `tools/adult-rules-test.cjs` rows (switch allowed or refused by the O1 table; an edit-save keeps mode; reset returns the age default, Family c.4).
- Accept: gate; TV capture of the profile screen in both states.
- Done: [ ] gate [ ] capture [ ] log says "adopted W4" or "built W4 spec".

**A6. Platform: learner text store, delete, curtain, phone file** (M)
- Goal: a learner's pieces live in their own files with versions, can be deleted whole, never ride on the shared session, and never show on the TV unless the learner chooses.
- Files: new server-only `lib/session/texts.ts` (`DESK_DATA_DIR/texts/<learnerId>/<pieceId>.json`: `{ id, format, title, versions: [{ at, source: file|message|paste, text }] }`; caps as constants with a reason: a version 100 KB, 20 versions, 50 pieces, revisit after use; `deleteAll(learnerId)` removes the folder and the twin file of D6); route `app/api/texts/route.ts` (list, add a version, delete one, delete all; phone role only, the proxy already refuses guests, `src/proxy.ts:28-31`; a body over 200 KB refused before parse); `store.ts:373` (a learner change clears `essay`, `essayType`, `essayAt`: finding 6); phone: a file pick for `.txt`/`.md` read in the browser (FileReader), paste, a one-time notice before the first send ("your text is sent to the text engine: Claude, through the CLI on this computer"); TV: the piece map (titles, paragraph count), not the text, unless "show on TV" is chosen for this piece.
- Tests: new `tools/texts-rules-test.cjs` (temp `DESK_DATA_DIR`: add, version, caps, a second learner cannot list the first's, delete-all leaves no file, the essay leaves the session on a learner change).
- Accept: gate; phone capture of the notice and the file pick; TV capture of the piece map with the curtain.
- Cost: 0 calls. Could go wrong: `learners.json` is tempting; it is rewritten whole on every write (`learners.ts:98-104`), so texts never go there.
- Done: [ ] gate [ ] captures [ ] delete verified on disk [ ] docs.

**A7. Platform: PC drop page and .docx text** (M)
- Goal: on a PC browser that joined with the TV's pin, the learner drops a `.txt`, `.md` or `.docx` file into their piece, and can download any version back as `.txt`.
- Files: new page `app/drop/page.tsx` (ten-foot rules do not apply; a PC page); pure `lib/rules/docx.ts` (unzip with `node:zlib` `inflateRawSync` over the zip directory, `word/document.xml` to paragraphs, no new dependency); `app/api/texts/route.ts` (multipart, `Content-Length` checked first, 2 MB file cap, far below the proxy's 10 MB cut); PDF refused with "save it as .docx or .txt" until O6.
- Tests: new `tools/docx-rules-test.cjs` (a .docx built in the test with `deflateRawSync`: paragraphs, a table, a hostile zip entry name, an oversize entry refused).
- Accept: gate; a PC capture at 1280 x 800 of the drop page.
- Done: [ ] gate [ ] capture [ ] no dependency added (or O6 answered).

**A8. Platform: voice on the LAN, a voice per speaker** (M)
- Goal: the phone's microphone works over Wi-Fi, and a line can be spoken in a chosen voice.
- Files: `store.ts:234-237` (`https` phone URL when `DESK_HTTPS=1`); dev HTTPS as the installed Next documents it (read `desk/node_modules/next/dist/docs/` first, `desk/AGENTS.md`); phone fallback when Web Speech is missing: record and post to `/api/listen` (`app/api/listen/route.ts`), the transcript still editable before sending; `app/api/speak/route.ts` takes `voice` from a closed list (`lib/engines/voice.ts`), Piper keeps its one voice.
- Tests: rows in `tools/engines-rules-test.cjs` (voice id whitelist, unknown id falls back) and `tools/phone-panel-test.cjs`.
- Accept: gate; an operator step on a real phone over Wi-Fi: the mic works in Linga; log the browser and phone.
- Could go wrong: a self-signed certificate warning on the phone (state it; the native rebuild is the real answer).
- Done: [ ] gate [ ] real phone checked [ ] docs.

### Phase B: Math, Field Work

**B2. Jobs for the derivative strand** (M): five templates (calc1-derivative, -rules, -trig-derivatives, -chain,
-log-derivative), each with its sketch and letter alias. Files: `lib/rules/jobs.ts` templates (or `lib/rules/jobs/*.ts`).
Tests: `tools/jobs-rules-test.cjs` per template (200 seeds well formed, distinct, story slots, alias). Accept: gate; TV
capture of two new jobs. Cost: 1 call per job. Authoring: 5u, a teacher reads each. Done: [ ] gate [ ] captures [ ] doc.

**B3. Jobs for applications of derivatives** (M): calc1-extrema, -optimisation (the constraint eliminated in the
template: the learner sets up a one-letter function, and a two-letter line gets no verdict), -newton, -shape,
-related-rates (time is the job's letter, aliased). Same files and tests as B2. Authoring: 5u. Could go wrong: a
two-letter constraint line is where adults most need help and the engine cannot check it: say so on the phone ("the
desk checks lines in one letter"). Done: [ ] gate [ ] captures.

**B4. Jobs for the other 12 topics** (M, two batches, each green): functions and limits (6), integrals and averages
(6). Same files and tests. Authoring: 12u. Done: [ ] batch 1 green [ ] batch 2 green [ ] Topics capture.

**B5. Beyond and the course map** (M)
- Goal: a harder variant per job, taken by choice, drawn as a second mark; a TV course map of the learner's own topics.
- Files: `JobTemplate.beyond` (tier computed by code, never a model's `difficulty`); `learners.ts` (`SkillRecord.beyond`, whitelisted in `cleanSkills` `:108-124`); `maths/MathsTV.tsx` course map (latched, job done, Beyond mark); `design/maths-lamplight.css`.
- Tests: `tools/jobs-rules-test.cjs` (a Beyond right answer never unsets the base record; no digit on the map); `tools/maths-tv-test.cjs` rows.
- Accept: gate; TV capture of the course map at 1920 and 1280. Done: [ ] gate [ ] captures [ ] doc.

**B6. The mock paper, sealed and re-sat** (M)
- Goal: on evening one a short paper of bare specs over the learner's topics is sat and sealed; re-sat before the exam; the two shown side by side (right, slip ringed, not sure, not attempted).
- Files: pure `lib/rules/mock.ts` (paper from templates' bare specs, code-drawn, 0 calls); a `course` record per learner (new field, whitelisted) or a file under `DESK_DATA_DIR/adult/<id>.json`; typed answers through `settleSpec`, or a photo through `markCalc` as today; TV side-by-side.
- Tests: new `tools/mock-rules-test.cjs` (same specs on the re-sit; no hint on a paper; marks never a count on screen).
- Accept: gate; TV capture. Done: [ ] gate [ ] capture.

**B7. Bring your course** (M)
- Goal: a topic list or past paper (text, from A6/A7) orders the 22 topics to the learner's exam and date; unread questions are listed "noted, not practised".
- Files: `lib/desk/course.ts` (lines through `specFromQuestion`, `calc.ts:833`; one call proposing a spine topic id for the rest; validator: the id is in `CALC1_SPINE`); the course record of B6; phone and TV.
- Tests: new `tools/course-rules-test.cjs` (stubbed engine: an off-spine id refused; order kept; nothing guessed).
- Cost: 1 call per paper. Blocked by O6 for what may be kept. Done: [ ] gate [ ] captures.

**B8. The sister problem** (M)
- Goal: stuck twice, the learner asks for a sister: code draws other values of the same template, the model writes the working lines, `checkChain` (B1) checks every line, and none of the learner's numbers appears.
- Files: `lib/desk/fieldwork.ts` (one call, one re-ask, then "no sister this time"); TV lines large with ticks.
- Tests: `tools/fieldwork-test.cjs` rows (a line that does not hold refuses the sister; a learner number refuses it).
- Cost: 1-2 calls. Done: [ ] gate [ ] capture.

### Phase C: Linga, The Company

**C2. A cast with motives, secrets and voices** (M)
- Goal: one to three characters with objective, obstacle, subtext, tell and a voice; a secret released only when the learner's turn is a question naming one of its keywords.
- Files: `types.ts` (a cast on the contract, `speaker` on a partner turn); `placement.ts` `cleanTopic` (cast validation; the forced quiz becomes optional for pitched scenes, kept for built-in ones); `conversation.ts` (`tutorSystem` plays the cast; a line naming a hidden secret's keyword before release is re-asked once, then replaced by an in-character pause); pure `lib/english/cast.ts` (`released(turn, secret)`, `leaks(line, secret)`); voices through A8.
- Tests: `tools/linga-rules-test.cjs` rows (release table, leak table, a scene with no quiz passes only for pitches).
- Accept: gate; TV capture with two speakers named on screen. Cost: 0 extra calls; voice-out per character spoken.
- Done: [ ] gate [ ] capture [ ] docs.

**C3. Genres, twist decks, Kind and Real** (M)
- Goal: the seven genres of the concept with their gates; a twist dealt by code at the third beat from the genre's deck; "deal me three" from the learner's interests; temperaments Kind (default) and Real.
- Files: pure `lib/english/company.ts` (genres, decks, `dealTwist(seed, genre, turn)`); `gate.ts` (genre floor); `conversation.ts` prompt lines.
- Tests: rows (a twist never before its beat; a deck never serves an 18+ genre below the gate).
- Cost: +1 call per "deal me three". Authoring: 5 decks for the 15+ genres (5u). Done: [ ] gate [ ] capture.

**C4. Romance and nightlife, 18+** (M, blocked by O3)
- Goal: the two 18+ genres behind the adult confirm, within the line the owner draws in O3.
- Files: `conversation.ts:57` changed only for these genres and only as O3 says; `gate.ts` never-list; `company.ts` two decks; a curtain default on: the TV shows "Linga · a scene" and captions only if chosen.
- Tests: rows (a minor or unconfirmed "other" can never start either genre, by pitch, deal, plan or saved scene); new operator tool `tools/linga-redteam.cjs` (at least 40 adversarial learner lines per genre through the real engine; a person reads every transcript).
- Accept: gate; red-team read with zero explicit lines, zero coercion played as success, zero attraction aimed at the learner outside the role; any failure blocks release.
- Done: [ ] gate [ ] red-team recorded [ ] owner sign-off.

**C5. Mischief** (S, blocked by O4): opt-in temperament; a misreading must carry the exact quote it misreads (a
`misread` field checked as a substring, else the line is re-asked as Kind); never on accent; the note after Cut explains.
Tests: rows. Done: [ ] gate [ ] capture.

**C6. Playbill, note strip, cold open** (M)
- Goal: a poster per scene (title, genre, the learner's quoted slips, held notes struck), the note strip by kind as marks, and the cold open (the run's first scene) beside the latest.
- Files: `types.ts`/`rules.ts` (`EnglishLearning.posters`, whitelisted, capped; `sessions` is capped at 30, `rules.ts:25`); `LingaTV.tsx` wall.
- Tests: rows (no digit printed on a poster or strip; posters survive the evidence cap because they snapshot).
- Done: [ ] gate [ ] capture.

### Phase D: Essay, The Twin

**D1. The reading core keeps paragraphs** (M): `Sentence.para`, a splitter per paragraph (adopt Family W3
`paragraphsOf` if merged), `revise` rebuilds with breaks (`essay.ts:117`), the forensic screen draws the gaps. Tests:
`tools/essay-rules-test.cjs` (a one-paragraph text reads exactly as today; three paragraphs keep their breaks through a
rewrite). Done: [ ] gate [ ] capture [ ] DESIGN-ESSAY-MASTER updated.

**D2. The Workroom, a whole piece** (M)
- Goal: a piece from the text store is read paragraph by paragraph in an adult voice; the TV piece map fills in; code picks at most three hot spots.
- Files: `lib/desk/essay.ts` (an adult stance: adopt Family W2 `voiceOf` with an adult band, or a minimal `voice` argument); a job kind `piece` (`store.ts:136`); pure `hotSpots(readings)` in `lib/rules/essay.ts`; `essay/*` Workroom screen.
- Tests: rows (hot spots at most three, only on faulty verdicts; the 15+ text unchanged for Family; the engine stubbed per paragraph).
- Accept: gate; TV capture of the piece map; measure the real per-paragraph time once and log it (unmeasured today).
- Cost: 1 call per paragraph (the "best" model). Done: [ ] gate [ ] capture [ ] timing logged.

**D3. Versions and the diff** (M): version n+1 from the phone or PC; a pure paragraph and sentence diff; only changed
paragraphs are re-read; a hot spot inks when its rewrite holds (a model reading, labelled). Tests: diff table. Done:
[ ] gate [ ] capture.

**D4. The format lens, first format card** (S): a format card (newsletter first; five more later, 1u each) and one
format-lens note per reading, labelled a reading. Done: [ ] gate [ ] capture.

**D5. Habit detectors** (M)
- Goal: rules that find a writer's habits, so a planted habit and a proven move are code's, not the model's.
- Files: new pure `lib/rules/habits.ts`: a vague "this" or "it" opening a sentence, a hedge stack, a repeated opener in a paragraph, a run of long sentences past the writer's own band, filler words, a paragraph with two claims (first-pass roles); open habits = seen in two pieces.
- Tests: new `tools/habits-rules-test.cjs`: at least 30 rows per detector, zero false positives on the clean rows (a detector that cannot reach that is not shipped).
- Authoring: 6u. Done: [ ] gate [ ] precision table in the log.

**D6. The twin is born** (M, blocked by the A4 result and O5)
- Goal: after the milestone (three pieces, a setting), the twin writes about 400 words on a topic the learner gives, in their bands, with their open habits planted.
- Files: new pure `lib/rules/twin.ts` (validators: `withinBands`; no 8-word run from the corpus; no digit, statistic or proper name absent from the learner's material, else "[fact needed]"; each planted habit found by its D5 detector or its tag dropped); `lib/desk/twin.ts` (prompt: the sheet, the rulebook, two or three signature passages retrieved with `embed`, all in the prompt; one draft, two redrafts at most); the twin file beside the texts (deleted with them, A6); TV: the draft as a specimen in the twin's colour.
- Tests: new `tools/twin-rules-test.cjs` (each validator; stubbed engine: a refused draft redrafts, a third refusal says "the twin could not write tonight").
- Cost: 1-3 calls per draft. Done: [ ] gate [ ] capture.

**D7. The Sitting and the rulebook** (M)
- Goal: the learner marks a sentence of the draft and names the fault; code reveals a planted habit there (else a labelled reading); the learner writes the replacement; the twin smooths only its own neighbours; a rule is "learned" only when later proven in the learner's own piece.
- Files: `lib/rules/twin.ts` (`smoothed(draft, next, learnerSentences)`: code refuses any change to a learner sentence; `proven(rule, version)`: the detector no longer fires in the changed paragraph, the model reading holds, and the version holds no 8-word run from any twin draft); TV twin card (learned, pending, "still has").
- Tests: rows for `smoothed` and `proven`. Done: [ ] gate [ ] capture.

**D8. Spot yourself and First read** (S): the three-paragraph game (code keeps the answer; results are the twin's
record, never a percentage); First read: one call, at most 20 words, refused if it gives advice (an imperative-opening
list). Done: [ ] gate [ ] capture.

### Phase E: experiments, the week, polish

**E1. The step line** (M, EXPERIMENTAL, flag off by default, O2)
- Goal: for a learner who turns it on, a job's working is typed one tagged line at a time; `checkChain` (B1) ticks or rings each line; the TV shows the lines large.
- Files: a profile setting `stepLine` (whitelisted); phone line editor with tag chips (a maths keypad is a later polish); `MathsTV.tsx` lines with ring; a history line per evening "step line on/off" for the within-learner comparison.
- Tests: `tools/fieldwork-test.cjs` rows; `tools/tv-keys-test.cjs` (no typing on the TV).
- Accept: gate; captures; the owner's A/B: the same adults, evenings with it on and off, asked which they would do again. Done: [ ] gate [ ] flag off by default [ ] captures.

**E2. Talk it through** (M, EXPERIMENTAL, flag off): the spoken plan becomes method chips from a closed list (validator:
a chip's trigger words are in the transcript); a pure spoken-maths grammar (`lib/rules/spoken.ts`: "two x times e to
the minus x" to `2x*e^(-x)`) shown for confirmation before it enters a line. Tests: new `tools/spoken-rules-test.cjs`
(60 phrases). Cost: 1 call per plan. Done: [ ] gate [ ] flag off [ ] capture.

**E3. The Read-Through** (M): the Company stages the learner's latest piece: a character who read it reacts in role;
the cast is given only the piece's text; a quote "from the piece" must be in it (substring); "I could not say it"
becomes a hot spot in the next version. Done: [ ] gate [ ] capture.

**E4. The adult week and the recap curtain** (S): the recap tile for adult modules names the module only ("Linga · a
scene"); a week page on the phone from history lines (0 calls); no parent view at 18+. Done: [ ] gate [ ] captures.

**E5. The twin's export card, 18+** (S, O8): a downloaded card (style sheet, rulebook, chosen passages) labelled
"drafted with my twin" when used; 18+ confirmed only; deleted with the texts. Done: [ ] gate [ ] capture.

**Dependency graph** (an arrow leads from a slice to the slices that build on it; O-numbers are owner decisions)

```
A1 --> A2 --> C1 --> C2 --> E3          A4 (probe) ==result==> D6
 |      \            ^  \--> C6 --> E4   D1 --> D2 --> D3 --> D6 --> D7 --> E5
 |       \           A8  C3 --> C4 (O3)        |      \--> D4      \--> D8
 |        \--(sim)       \--> C5 (O4)          D5 -----------------^
 +--> A3 --> B2 --> B3, B4, B5            A5 --> A6 --> A7 (O6)
 |      \--> B6 --> B7 (A6)                      \--> D2, B7, E4
 +--> A5 (O1)   B1 --> B8 (B2), E1 (O2) --> E2 (A8)
```

## f. Session protocol

- **Pick**: section a, rule 2. If the next row is blocked by an owner decision with no default, take the next row and
  say so in the log.
- **Branch**: the integration branch is `adult-mode`, cut from main once the owner has merged this plan (else from
  `adult-mode-plan`). Each slice gets its own worktree and branch: `git worktree add ../firetv-adult-<id> -b adult/<id>
  adult-mode`. When its gate is green, merge it into `adult-mode` with `--no-ff` from a worktree that has `adult-mode`
  checked out and no other session in it. Never touch the main checkout (`C:\Users\kazda\kiro\firetv`): another session
  may be working there. Never push, never merge into main: the owner merges.
- **node_modules**: in a new worktree `npm test` runs `tools/worktree-preflight.cjs` first, which links
  `desk/node_modules` to the main checkout's; link `tools/node_modules` yourself (PowerShell:
  `New-Item -ItemType Junction -Path tools\node_modules -Target ..\firetv\tools\node_modules`). Git-bash `ls` does not
  show a junction. Before `git worktree remove`, remove both junctions with `rmdir` (never `rm -rf`, which follows them).
- **Capture recipe** (any slice that changes a screen): a second dev server from the worktree's `desk/`:
  `DESK_DATA_DIR=<temp dir> npx next dev --webpack -p <free port>` (turbopack rejects the junction); open the TV with
  `/tv?key=` from `<temp dir>/pairing.json`; drive it through `/api/session` events as `tools/tv-landing-live.cjs` does;
  Playwright from `tools/node_modules`; 1920 x 1080 and 1280 x 720 for the TV (safe zone 96/54 px, body type at least
  28 px, 20-22 px uppercase labels only, one sentence per caption slot, no typing asked of the TV), 390 px for the phone,
  1280 x 800 for the PC page. Screenshots go to `artifacts/` (git-ignored) and are looked at, not only asserted.
- **Commits**: `feat(adult): <id> <what changed for the learner>`; `test(adult): ...`, `docs(adult): ...`; docs in the
  same commit as the screen. End with the builder's own line, e.g. `Co-Authored-By: Claude Sonnet 5.5
  <noreply@anthropic.com>`. LF line endings.
- **Stop and ask the owner** when: a slice needs an unanswered decision with no default; a kill criterion is hit; a
  stance must change beyond section i; a change would touch `desk/data/` or send a learner's text anywhere new; Family
  work on `store.ts`, `tv/keys.ts` or the phone page conflicts in a way that changes a Family behaviour.
- **End of session**: update the status row; append to section j:
  `### <date> · <slice id> · <branch> <commit>` then lines `Gate:`, `Captures:`, `Surprises:`, `Next:`.

## g. Risks and kill criteria

| Risk | Cheapest test | Result that drops or reshapes |
|---|---|---|
| **The twin is a costume** (the riskiest assumption) | A4 probe, at least 8 writers x 3 trials | twin taken for the writer's own no more often than the plain model: D6-D8 not built; Essay ships the Workroom (D1-D5); the owner rethinks the twin. Within bands but still picked out: one retry with more retrieved passages, then the same rule |
| The Company is too slow or the cast too thin to be theatre | A2 sim (20 scenes read) and five adults playing one scene | cast out of role or notes misquoting in more than a quarter of scenes: fix prompts before C2; most adults would not play again: shorter scenes, and O7 (streaming) moves to the front |
| The chain checker rings a correct line | B1 fixture | any clean chain rung: no step line until fixed; more than 5 of 50 planted slips missed: fewer tags |
| The step line is slower than a pencil | E1 within-learner evenings | adults prefer paper: it stays an off-by-default experiment (O2) |
| A job is a word problem in a costume | A3, five adults | they skip the story: three lines become one; the set-up stays |
| **Role-play safety**: 18+ scenes, coercion, real people, minors | A1 keyword table; C4 red-team | code can refuse: an audience by keyword and by label, a never-list, a contract above the profile's audience, a line leaking a secret, a quote the learner did not say. Code cannot refuse: tone, subtle pressure, attraction, a real person under a made-up name. Those rest on the prompt, Cut, the red-team and a sampled read. Any explicit line, any minor reaching an adult scene, or coercion played as success in the red-team: C4 does not ship |
| **The learner's own texts** | A6 tests | stored in plain files on the owner's disk under `DESK_DATA_DIR`, deleted whole on request; sent to the text engine: today the Claude CLI on this computer under the owner's account (a vendor model), or Codex when `DESK_TEXT_ENGINE=codex` (`text.ts:76`). Said once before the first send. If the owner will not send personal writing to a vendor, adult Essay waits for a local or contracted engine |
| **A twin that writes in someone's voice** | D6/D7 validators | the twin writes only in Sittings until E5; never a school-essay format; export 18+ confirmed and labelled; a version of the learner's own piece holding an 8-word run from a twin draft proves nothing. The desk cannot stop a learner copying the twin out; the owner accepts this with O5 or the twin is not built |
| The Family build edits the same files | small slices, rebase before merge | a Family behaviour would change: stop and ask |
| Authoring cost (22 templates, 5-7 decks, 6 format cards, 6 detectors, 100 chains) | count per slice | the owner may cut Beyond or the later format cards first |

## h. Owner decisions needed

| # | Question | Recommendation | Built if unanswered | Blocks |
|---|---|---|---|---|
| O1 | Adult floor in the first release | 18+ or "other" confirmed; 15-17 later with a parent code | 18+ | A5 |
| O2 | Is the step line the default Math interface? | No: an experiment, flag off, until the within-learner test (your own "as experimental variant") | flag off | E1 |
| O3 | In 18+ romance, may a character flirt in words and may the date say yes? (loosens `conversation.ts:57`) | Yes between fictional characters, non-explicit, fade at the door, never aimed at the learner as a person, no romance carried across scenes, rejection allowed | today's rule; the genre is not built | C4 |
| O4 | May the cast misread the learner on purpose (Mischief)? | Opt-in, meaning only, quoted, never accent | not built | C5 |
| O5 | May the twin write prose, labelled as the twin's, never in the learner's piece? | Yes, with the validators of D6-D7 | Workroom only | D6 |
| O6 | Files and texts: which formats, how long kept, may a course paper be kept, may a PDF library be added? | .txt/.md/.docx; kept until deleted; papers kept privately; PDF later | .txt/.md/.docx, keep until deleted, no PDF | A7, B7 |
| O7 | Budget for a faster or streaming engine for the cast | decide after A2 and C2 are measured | stay on the CLI with a "preparing" state | backlog |
| O8 | The twin's milestone and "somewhere" for porting | three pieces as a setting; an export card first, publishing later | three pieces; card only | D6, E5 |

## i. Stance check

| Thing | Drawn as | Holds or bends |
|---|---|---|
| Job, exam cards, course map, mock paper | ticks, rings, latched topics, two papers side by side | holds: every mark from `checkAnswer` or the chain checker; the report's guess bars are not graded |
| Beyond | a second mark on the topic | holds: a code tier; no points (the owner's Family "reward points boost" stays a picture here too, as Family D3) |
| Notes and Take Two | quoted notes, a struck note, a branch | holds: a note without the learner's quote is dropped; a take is never evidence |
| Playbill and note strip | posters and marks | **revised against the report**: "2 of 3 notes held" is dropped; no count printed (Family's never-print-the-count rule) |
| Plot in a scene | the model's | **bends "code decides", openly**: a plot event is never a mark and never evidence |
| The twin's prose | a specimen in the twin's colour | **bends "the desk never writes the learner's sentence"**. The report's handling: the twin's piece is shown as the twin's, never enters the learner's piece, is refused if it copies a run of the learner's words, and in a Sitting every sentence the learner repairs is written by the learner while the twin smooths only its own. Kept, with two additions from the code check: a move is "learned" only where a detector proves it (else a labelled reading), and a version with a twin run proves nothing. The owner has to accept that the desk will produce fluent prose in a learner's voice that the learner can copy out, and that it cannot prove who wrote a pasted text |
| Twin card, Spot yourself | learned, pending, "still has"; picks | holds: Spot yourself measures the twin, never shown as a rate |
| Model roles | story, cast, notes, readings, twin, sister lines | each behind a validator in section e; silence (no verdict) where code cannot decide, as today |
| TV | looking only | holds: typing on the phone and the PC; the curtain keeps adult texts and 18+ scenes off the shared TV by default |

## j. Session log

Entry format: `### <date> · <slice id> · <branch> <commit>`, then `Gate:`, `Captures:`, `Surprises:`, `Next:`.

### 2026-09-30 · planning · adult-mode-plan (this commit)
Gate: `cd desk && npm test` green before writing (exit 0, 502 tests); no product code changed.
Captures: none (no screen changed).
Surprises: the essay text stays on the session after a learner change (probe, `store.ts:373`); a romance premise
labelled `all` passes today's topic validator (probe); the proxy passes only the first 10 MB of any `/api` body; "holds"
is a model reading, so the twin's lock needs detectors; Family W4 (Profile.mode) is not built yet on `family-phase-1`.
Next: A1. Owner: answer O1-O8 (defaults stand if not), run the A4 probe when A4 lands.
