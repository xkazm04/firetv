# Study Desk v2: the plan (three apps, Family and Adult)

Written 2026-10-07 from the owner's scope sessions ([decisions](STUDY-DESK-V2-OWNER-DECISIONS-2026-10-07.md), sessions 1
and 2). Paths are under `desk/src/` unless they start with `tools/`, `docs/` or `desk/`. This plan supersedes the adult
plan's ordering ([ADULT-MODE-IMPLEMENTATION-PLAN.md](ADULT-MODE-IMPLEMENTATION-PLAN.md)). That file's slice cards stay the
spec for the slices named here by their old ids (A1, A2, C1, D2...), except where a row below says otherwise.

## a. How to use this file

1. Read the decisions doc, then the status table (section c), then the last session log entry (section j).
2. Work by **batch**: a batch is a set of slices that ship as one draft PR, which the owner reviews and merges.
3. Inside a batch, take the slices in table order. Build each one by its card (section d), commit it on its own, and
   keep the gate green at every commit.
4. End a batch by updating the status rows, appending a log entry, and opening the draft PR.
5. Stop and ask the owner when section f says so. Never build past a kill criterion (section g).

## b. The briefs (one per app and mode)

**Essay Master, Family.** For 11-15-year-olds who want their writing to improve at any level. The four lenses stay the
scope (V3). v2 reads a **whole piece**, not one paragraph (E1). The learner sends a full essay; the TV shows a piece map
with the lenses across paragraphs; the forensic page stays one sentence at a time. Collectible: a specimen in the
Specimen world for each lens mastered (S1). Success: a learner sends a whole essay and leaves knowing which paragraph
needs which move, with nothing rewritten for them.

**Essay Master, Adult: the Twin.** For adults who want an AI that writes like them. The product is a **portable profile**
(E2), exported as a **Twin Card 1.0** (`docs/standards/twin-card/1.0/`). MVP channels are **email and chat** (S4). The
twin is **earned** (E3): it is born after three pieces worked through the Workroom, on a PC page with the TV as the stage
(E4). It writes in-app only as proof (E5): Sittings and "Spot yourself". Adult reward: the twin's growth and its export,
never points (X2). Success: the exported card makes another tool write a message the user would send as their own.

**Linga, Family.** For 11-13 first, aiming at a globally respected standard: **Cambridge A2 Key and B1 Preliminary for
Schools** (V2, L1), **Speaking first** (L2), as a **practice mode only** with no simulated examiner (S3). The free scenes
stay the core. Every Speaking-paper task type gets practice that maps onto the 8 skills. Claims stay honest: "mapped to
the published specification", never "certified" (X5). Collectible: a door or object in the Open Door world when a skill
goes independent. Success: a learner can say which Key/PET speaking tasks they can already do.

**Linga, Adult: The Company.** Wild but non-explicit (L3): absurd, comedic, high-stakes, rude characters,
flirting/nightlife at 18+. Learning through **Cut & Take Two** (L4). The never-list holds at every age. Success: an
adult plays a scene they pitched, gets three notes quoted from their own lines, and wants a second take.

**Math Buddy, Family.** For 11-13 learning ahead of school: "Teach me something" **actually teaches** (M1), with a worked
lesson before practice. For 14-16: **GCSE Foundation, Pearson Edexcel 1MA1** (M2, S2), including recovery from a failed
paper. Collectible: a lamp-lit object in the Lamplight world per topic secured, plus a mark for the extra mile
(step-up). Success: a learner meets a topic for the first time on the desk, is taught it, practises it, and secures it.

**Math Buddy, Adult.** Not Field Work: the owner's direction overrides it (V4). Late high school and early university:
**Calculus 1 to 2** (M3), with **function graphs, multi-step worked problems with checked working, and proper
typesetting** (M4). The CX stays the desk's: hints not answers, code decides every mark. Success: an adult works a
multi-part calculus problem with a graph on the TV and every working line checked.

## c. Status table (sessions update this)

| # | Id | Slice | Batch | Depends on | Status | Commit | Date |
|---|---|---|---|---|---|---|---|
| 1 | G1 | Linga audience keyword gate (adult A1, safety half) | 1 | - | done | af47204 | 2026-10-07 |
| 2 | E0 | Essay: the reading core keeps paragraphs (adult D1) | 1 | - | done | 307d2ec | 2026-10-07 |
| 3 | P1 | Platform: the mode switch and the 18+ gate (adult A5) | 1 | - | done | b160c50 | 2026-10-07 |
| 4 | P2 | Platform: the text store and /api/texts (adult A6, store half) | 1 | - | done | e9271eb | 2026-10-07 |
| 5 | P3 | Platform: phone shelf, TV piece map, the engine notice, the curtain (adult A6, UI half) | 2 | P2 | done (the curtain: the shelf is phone-only, the TV never lists kept texts) | f8d64f1 | 2026-10-07 |
| 6 | E1 | Essay Family: a whole piece, sent at once, read paragraph by paragraph | 2 | E0, P3 | done | f8d64f1 | 2026-10-07 |
| 7 | R1 | Rewards: the collectible engine (pure) and one collectible per app | 2 | - | done | e162e4d | 2026-10-07 |
| 8 | L1 | Linga: the Cambridge A2 Key / B1 PET for Schools map (data and coverage) | 2 | - | done (unverified table; claim off) | ce795b1 | 2026-10-07 |
| 9 | M1 | Math: teach a new topic, worked lessons for the 12 school units | 3 | - | done | f49b234 | 2026-10-07 |
| 10 | M4a | Math: function graphs on the TV (pure SVG plotter) | 3 | - | done | 4e0ec70 | 2026-10-07 |
| 11 | M4b | Math: typesetting coverage: the custom typesetter extended for `cases` and small matrices (KaTeX deferred, [concept](KATEX-TYPESETTING.md)) | 3 | - | done (cases, matrices, aligned, array) | b9c6e77 | 2026-10-07 |
| 12 | T1 | Twin: the style meter and the **simulated** twin probe on email/chat (adult A4; V2-O1) | 3 | - | built; the probe's live run awaits the owner's PC | dba30f8 | 2026-10-07 |
| 13 | L2 | Linga: Speaking practice mode, Key/PET task shapes | 4 | L1 | done (six practice scenes, one per part; no exam named) | f6aa6a8 | 2026-10-07 |
| 14 | M2a | Math: GCSE Foundation 1MA1 map and coverage | 4 | - | done (unverified table; 19 of 86 statements touched; claim off) | 3b6768a | 2026-10-07 |
| 15 | T2 | Twin: the Workroom for messages and emails, versions and diff (adult D2, D3) | 4 | P3, T1 pass | done, ahead of the T1 live pass (deviation, see the batch 4 log) | c108f63 | 2026-10-07 |
| 16 | P4 | Platform: PC drop page and .docx text (adult A7) | 4 | P2 | done | c108f63 | 2026-10-07 |
| 17 | L3 | Linga Adult: pitch a scene, Cut and three notes (adult A1 rest, A2) | 5 | G1, P1 | done, built locally on main (no PR, nothing pushed); captures and the company sim's live run owed to the owner's batch review | d29111c9..aa5ac64d | 2026-10-07 |
| 18 | M4c | Math: multi-step problems, the chain checker (adult B1) and checked working lines | 5 | - | done (built locally on main; kill test passed: clean chains rung 0 of 50, slips rung at their own line 50, left null 0, rung at another line 0; TV captures owed) | 1a00ec08, aaaee240, 1e33a656 | 2026-10-07 |
| 19 | T3 | Twin: habit detectors (adult D5) | 5 | E0 | done (built locally on main; 6 of 6 detectors pass the zero-false-positive gate; wired to nothing, no capture owed) | 267694f5, 79da4106 | 2026-10-08 |
| 20 | M2b | Math: the first GCSE Foundation units beyond the school path (generators, code-checked) | 5 | M2a | done (built locally on main; kill test passed for both units: 0 not well formed, 0 not fair, 0 of 4000 worked answers not right, every slip reachable and detected; the path is 17 topics; 23 of 86 statements touched, claim off; TV captures owed) | f0f59399, 79777e2a, 510759b6, 1206a4ca, 667102a3 | 2026-10-08 |
| 21 | L4 | Linga Adult: Take Two (adult C1) | 6 | L3 | done (built locally on main, no PR, nothing pushed; heldOf table 41 rows: held 14, not held 12, null 15; a take writes nothing to the learner record; the TV and phone captures and one live take owed) | 6d90c429, fc9a1433, 23e11639, b2870aab | 2026-10-08 |
| 22 | T4 | Twin: born, the Sitting, Spot yourself (adult D6, D7, D8) | 6 | T2, T3, T1 pass | not started | | |
| 23 | T5 | Twin: the Twin Card 1.0 export (adult E5, retargeted) | 6 | T4 | a slice pulled forward in batch 4 (T5-lite: export from the Workroom's portrait, adult only); the full T5 still follows T4 | c108f63 | 2026-10-07 |
| 24 | M3a | Math: Calculus 1 completed (word problems, multi-part) | 6 | M4a, M4c | done (built locally on main, no PR, nothing pushed; the sweep 0 / 0 / 0 / 0 for all three templates over 500 seeds, all shipped; a calc1 set on related rates, optimisation or extrema ends with one code-drawn word problem in two parts; 13 of 31 corpus questions read into a spec, 0 into parts; TV and phone captures owed) | 3dc0693a (step 0), f5d21d3a, 61aca774, 309c52ee, 29e86cda, 3772c23b, 81924e24, and the finish record | 2026-10-08 |
| 25 | M5 | Math: recovery from a failed GCSE paper | 7 | M2b | built in three slices: M5a (row 34), M5b (row 35), M5c (row 36); the probe's live run awaits the owner's PC; see the M5 card (cut in three by the App Master, 2026-10-08) | | |
| 26 | L5 | Linga Adult: genres and twist decks; 18+ romance and nightlife (adult C3, C4) | 7 | L4, P6 | not started | | |
| 27 | M3b | Math: the Calculus 2 spine | 7 | M3a | cut in three by the App Master (2026-10-08): M3b-1 (row 37), M3b-2 (row 38), M3b-3 (row 39); see the M3b card | | |
| 28 | L6 | Linga: Listening practice | 8 | L2 | not started | | |
| 29 | P5 | Platform: the guest view is an allowlist (review card 1) | 6 | - | done (built locally on main, no PR, nothing pushed; essayPlan, worked and workroom no longer reach an unjoined phone; focus, view and timer moved out of the guest view) | 85446973 | 2026-10-08 |
| 30 | H1 | Harness: the test:rules runner and a shared loader (review card 2) | 6 | - | done (built locally on main, no PR, nothing pushed; test:rules is tools/run-rules.cjs over `rulesSuites`, every suite runs and a table names the red ones; 57 suites load through tools/ts-load.cjs) | b2c1fccf, 664fb809, 735dd0c2, 4c2bcfbe, 0669b708, 7c85a360, 7dbaa42c, cf0170ed (fallback), the finish record | 2026-10-08 |
| 31 | P6 | Platform: one adultContent() in rules/mode.ts; mode decides adult content (review card 4) | 7 | - | done (built locally on main, no PR, nothing pushed; adultContent() in rules/mode.ts, read by audienceAllowed, the tutor prompt, the level check and audiencesAt) | c5a6e081, and the finish record | 2026-10-08 |
| 32 | M3a-2 | Math: a part is called by its paper name on every surface | 6 | M3a | done (built locally, no PR, nothing pushed; the TV voice, the second go's sentences and the explain reply name a part 5(b); stored lines unchanged) | 6f533814 (step 0), ffbc577e, and the finish record | 2026-10-08 |
| 33 | L4b | Linga Adult: the take's last cast line is heard; the take stays on linga-talk until Back to the notes | 6 | L4 | done (built locally, no PR, nothing pushed; e6e6a569 and the docs commit) | e6e6a569, 4df2d091 | |
| 34 | M5a | Math: the recovery core, pure (a failed paper's lost marks, by desk topic, in an order the prerequisites allow) | 7 | M2b | done (built locally, no PR, nothing pushed; lib/rules/recovery.ts cleanPaper and recovery, wired to nothing; 8 rows in tools/recovery-rules-test.cjs; both kill tests red; no capture owed) | be9d2faf (step 0), 45632b1b, and the finish record | 2026-10-08 |
| 35 | M5b | Math: the recovery surfaces (typed entry on the phone, the recovery list on the TV, the result on the learner record) | 7 | M5a | done (built locally, no PR, nothing pushed; `papers` on the learner record, the phone's Paper panel and `paper.enter`, screen `paper` on the TV, the M3a-2 leftover; rows in learners-save, phone-panel and maths-tv tests; the kill test red; the owner's captures and the caps check owed) | e6472a1a (step 0), b0bf1e10, 21c988de, acc9f062, 36ab1056, and the finish record | 2026-10-08 |
| 36 | M5c | Math: the photo path and its probe (20 rendered marked papers; the live run on the owner's PC) | 7 | M5a, M5b | built; the probe's live run awaits the owner's PC (built locally, no PR, nothing pushed; lib/desk/paperRead.ts and lib/rules/paperScore.ts wired to nothing, tools/paper-probe.cjs with --stub, 9 rows in tools/paper-probe-test.cjs, the ruling-11 status; the kill test red; the photo path not offered) | 9b76fc0a (step 0), d26ad5c5, baa062d9, 1177441c, and the finish record | 2026-10-08 |
| 37 | M3b-1 | Math: the path's judge on the PATHS record (architecture card 5 part a; no behaviour or screen change) | 7 | M3a | done (built locally, no PR, nothing pushed; `PathInfo.judge` ('school' or 'calc') and a Calculus topic's `shapes` on its PathTopic; every 'calc1' site asks the record; 7 rows in tools/maths-paths-test.cjs; the kill test red; no capture owed) | 830ad522 (step 0), 08149848, and the finish record | 2026-10-08 |
| 38 | M3b-2 | Math: the Calculus 2 path, integration techniques on the nine shapes (`school: false`, no lessons) | 7 | M3b-1 | done (built locally, no PR, nothing pushed; `calc2` judged 'calc', five topics, `PathInfo.calcWords`; suite `tools/calc2-path-test.cjs`, 7 rows; the kill test red; owed to the owner: the Maths course row with three cells at 1920 x 1080 and 1280 x 720, and one live calc2 set) | 18845498 (step 0), 6565c0f5, and the finish record | 2026-10-08 |
| 39 | M3b-3 | Math: sequences and series (a design change: a second variable, n) | 7 | M3b-2 | card completed (step A); the build waits for the App Master's ruling (five candidate shapes: sequence-limit, series-sum (two families), series-verdict (five families), improper-integral (three families) and approx-integral buildable; free terms in n, free improper integrands and power series not buildable, descoped to the owner; n is never read by the engine; cut into M3b-3a to M3b-3g, rows 40-46) | 8132e184 (step 0), and the card with its finish record | 2026-10-09 |
| 40 | M3b-3a | Math: the Calculus 2 shapes seam (rules/calc2.ts, rules/calc-read.ts, the dispatch; no behaviour change) | 7 | M3b-3 card | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 41 | M3b-3b | Math: approximate integration (approx-integral; calc2-approx, Stewart 7.7) | 7 | M3b-3a | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 42 | M3b-3c | Math: the limit of a sequence (sequence-limit, the alias guard; calc2-sequences, Stewart 11.1) | 7 | M3b-3a | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 43 | M3b-3d | Math: the convergence verdict (series-verdict, five families; six topics, Stewart 11.2-11.7) | 7 | M3b-3a | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 44 | M3b-3e | Math: the sum of a series (series-sum, geometric and telescoping; on calc2-series) | 7 | M3b-3d | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 45 | M3b-3f | Math: improper integrals (improper-integral, three families; calc2-improper, Stewart 7.8) | 7 | M3b-3d | not started (cut by M3b-3 step A; built after the App Master's ruling) | | |
| 46 | M3b-3g | Math: absolute or conditional convergence (optional; the alternating p family's three-word verdict) | 7 | M3b-3d | not ruled in (ruling 18); revisited after M3b-3f | | |
| 47 | M3b-3h | Math: the alias guard on Calculus 1's limit at infinity (a correctness fix: cos(pi x) at infinity is refused) | 7 | M3b-3a | not started (ruling 19; built second, after M3b-3a) | | |

**Retired by V4:** adult A3, B2-B7 (Field Work jobs, Beyond, the mock paper as a job). B1 (the chain checker) lives
on as M4c. E1/E2 (the step line, Talk it through) stay in the backlog as experiments. **Answered:** O1 = 18+ (V5),
O3 = loosen for confirmed 18+ (L3), O5 = yes, as proof (E5).

## d. The slice cards (batches 2-3; later batches get their cards when their batch starts)

Every slice: the gate is `cd desk && npm test`, green at its commit. A new suite goes just before harness-rules-test.cjs in `rulesSuites` in desk/package.json (harness-rules-test stays last: it spawns runs of its own) (run by `test:rules`, `node ../tools/run-rules.cjs`).
No live model call in a gate (stub at the provider seam). Never touch `desk/data/`. A screen change updates
`docs/STUDY-DESK-SCREENS.md` and the app's `docs/DESIGN-*.md` in the same commit.

**P3. Phone shelf, TV piece map, the engine notice, the curtain** (M)
- Goal: the learner keeps a piece from the phone's Essay tab, sees their shelf, and deletes one piece or all. The TV
  shows the piece map (title, paragraph count), never the text, unless "show on TV" is chosen for this piece. Before the
  first send, a one-time notice says where the text goes (the text engine: Claude through the CLI on this computer).
- Tests: phone-panel rows (the notice shows once per learner); the piece map shows no text by default.

**E1. A whole piece, sent at once** (M)
- Goal: the phone's Essay tab sends the whole text (a file or a paste) as one piece. The desk reads it paragraph by
  paragraph (one call each, per V2-O5), and the TV's piece map fills in as paragraphs come back. Forensic walks the
  piece across paragraphs. The paragraph cap moves to a per-paragraph check; a piece is capped by the text store.
- Tests: an engine stubbed per paragraph; verdicts anchored across paragraphs; a failed paragraph does not lose the
  others; history records one reading per piece.

**R1. Rewards: collectibles** (M)
- Goal: a pure `lib/rules/collect.ts` derives each learner's collectibles from records that exist: a Math topic
  `secure`, a Math `stretch` secure (the extra mile), an Essay lens Secure, a Linga skill `independent` or `transfer`.
  Each app draws its own (Lamplight object, Open Door object, Specimen). No points, no streak, no count printed (S1, X1).
  Adult mode shows progress only (X2).
- Tests: a collectible appears only when its latch is set; a latch never unset means a collectible never lost; nothing
  is earned by volume.

**L1. The Cambridge map** (M)
- Goal: `lib/english/cambridge.ts` holds the published A2 Key and B1 Preliminary for Schools Speaking descriptors
  (parts, functions, grammar and vocabulary areas) as data, each mapped to Linga skills and scenes. A coverage report
  (a tool) says which descriptors have practice and which do not. The band tables marked "A TEACHER MUST READ" are
  checked against it.
- Tests: every descriptor names a source section; coverage computed by code.
- Honest limit: the descriptors are transcribed from the public specifications and must be checked against them by a
  person before any claim is printed.

**M1. Teach a new topic** (M)
- Goal: "Teach me something" opens a worked lesson for the topic before practice: an explanation and 2-3 worked
  examples generated from the topic's own code generator, each example's answer and steps checked by code
  (`lib/rules/school.ts`). Only the explanation's words come from a model; every number comes from code. Lamplight look.
- Tests: an example whose answer code does not confirm is never shown; the lesson for each of the 12 units renders with
  the engine stubbed.

**M4a. Function graphs** (M)
- Goal: a pure SVG plotter (`maths/plot.ts`) samples a function through `lib/rules/calc-expr.ts` and draws axes, the
  curve, a tangent and a shaded area, in the Lamplight hand. It is used first on Calculus derivative and integral items.
- Tests: sampling avoids discontinuities (no line drawn across a pole); the tangent at x matches the derivative numerically.

**M4b. Typesetting coverage** (M)
- Goal: `cases` as rows and matrices up to 3 x 3 in the custom typesetter (`maths/typeset.ts`), tested in
  `tools/maths-type-test.cjs`. KaTeX is deferred until the checks in [KATEX-TYPESETTING.md](KATEX-TYPESETTING.md) section 4 pass.

**T1. Style meter and the twin probe, email and chat** (M; the kill test for T2-T5)
- Goal: adult A4 retargeted to short messages. `lib/rules/style.ts` measures a writer's messages and maps onto Twin
  Card's 8 `style.dims` (integers 1-5) with the raw measures in `extensions`. `tools/twin-probe.cjs` runs the protocol
  of section g.

**L3. Linga Adult: pitch a scene, Cut and three notes** (M; adult A1 rest and A2, amended for v2; batch 5, built
locally per the owner's 2026-10-07 evening ruling)
- Goal, the pitch: in Adult mode only (`modeOf(profile, prefs) === "adult"`, `lib/rules/mode.ts`), the learner types a
  premise (at most 400 characters) and plays it at once. Code refuses before any model call: a Family profile, and a
  premise on the never-list (`keywordAudience` null, `lib/english/gate.ts`). Otherwise one shaping call (fast, thinking
  off) through the plan's own `learnerAsked` seam (`lib/english/check.ts`, exported, not copied) returns one scene
  contract in the PlanTopic shape that keeps the learner's premise, absurd, comedic or high-stakes. It passes
  `cleanTopic`, then `audienceOf(premise, label)` (the stricter wins; null refuses, it never becomes "adult"), then
  `audienceAllowed`; a dropped topic is refused with a plain reason. Kept in `EnglishLearning.pitches` (ids `pitch-`,
  the newest 12, optional and read as `?? []`, in `cleanEnglish`), offered by `eligibleScenes` in Adult mode only, and
  started through `start` with `replace`. No safety line loosens: the tutor's never-lines (`conversation.ts`), the
  planning system's "no explicit content, no humiliation, threats or manipulation", and `gate.ts` (which may only gain
  words). Tone (C3) and 18+ romance and nightlife (C4) stay in L5, behind the red-team.
- Goal, Cut: a turn action `cut`, accepted only in Adult mode and only where a reply exists (your-turn, quiz, paused,
  with the coach's `hasReply` guard). One fast call over this take's learner turns asks for at most 3 notes (turnId,
  quote, kind meaning|form|word|register, one-sentence note, optional better). A pure `lib/english/notes.ts`
  `cleanNotes(raw, turns)` keeps a note only when its quote is an exact substring of that learner turn (never a partner
  line), drops a duplicate quote and a fourth note, and keeps "form" only where `resolveEnglish` finds a conflict in
  that turn's sentence (else "meaning", labelled a reading). On success the take ends as `finish` does (session,
  digest, certificate) with the notes on the conversation (`Conversation.cut`, their turnIds kept for L4), and
  `linga-recap` shows them as a tape strip: three pins, one caption slot, one sentence per caption. A failed or empty
  call makes up no note: the take stays, with the error line, and Cut can be pressed again. Notes never write
  evidence or achievements. No new Screen.
- Files: `lib/english/{check,conversation,curriculum,notes,rules,turn,types,view}.ts`, `english/LingaTV.tsx`,
  `english/LingaPhone.tsx`, `tools/adult-rules-test.cjs`, `tools/linga-rules-test.cjs`, a new operator tool
  `tools/linga-company-sim.cjs` (not in `test:rules`; the A2 protocol: 20 pitched scenes at B1 over four genres, read
  by a person; a stub mode), `docs/DESIGN-LINGA.md`, `docs/STUDY-DESK-SCREENS.md`.
- Tests: adult-rules (a Family pitch and a never-list pitch are refused with no call; at least 10 pitch rows in the
  `audienceOf` table, romance labelled "all" coming out "adult"); linga-rules (the stubbed pitch starts a scene; pitches
  capped at 12; `cleanEnglish` keeps and trims them; `cleanNotes` drops a misquote, a partner quote, a fourth note and
  a duplicate, and turns a conflict-free "form" into "meaning"; `turnState`/`accepts` rows for `cut` in every state;
  Family refuses `cut`).
- Accept: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit` clean. Owed to the owner's batch review:
  the TV capture of `linga-scenes` with a pitched card and of the recap tape, the phone capture (390 px) of the pitch
  field, and the company sim's live run.

**M4c. Multi-step Calculus working: the chain checker (adult B1) and checked working lines** (M; batch 5, built locally
per the owner's 2026-10-07 evening ruling; carries the owner's M4 decision, "long problems with checked working lines")
- Goal: a pure `lib/rules/chain.ts` `checkChain(lines: {tag, text}[], {letter})` rings the first line of a Calculus
  working that stops holding. Tags `=` (the same function, or equal values for constants), `d/dx`, `int` (+C required on
  the last indefinite line), `at` (the value at a point), `lim` (`limitAt`, `limitInf`), `solve0` (a line `x = c`
  where the line before is zero at c). A two-sided equation line is null; each line is `true | false | null`. Built only
  on the primitives of `calc-expr.ts`; that file, its SAMPLES and every tolerance stay as they are. Measured first on
  50 clean and 50 planted chains. Then a pure tagger in the same file reads a Calculus item's working lines (the one
  `workingLines` split), line 0 anchored to the item's own spec, a line whose relation it cannot tell tagged so it is
  null (it never guesses). A wrong Calculus item with working gets `slipAt` at the first line the chain rings; the
  paper ticks a Calculus line only where the chain is true. Multi-part and word problems stay with M3a (row 24).
- Files: new `lib/rules/chain.ts`; `lib/rules/kinds.ts` (`judgeItem` places the pen); `maths/working.ts` (the ticks);
  new `tools/chain-rules-test.cjs`, appended at the end of `test:rules`; `tools/maths-judge-test.cjs`,
  `tools/maths-type-test.cjs`; `docs/DESIGN-MATH-BUDDY.md`, `docs/STUDY-DESK-SCREENS.md`.
- Tests: the fixture suite (zero clean chains rung; each planted slip rung at its own line or null, never at another
  line; under 5 ms a chain; it prints the counts); judge rows (a planted-slip item's `slipAt` lands on the line that
  slipped, a wrong answer whose working holds on every line gets no chain pen, a line in words is null, every existing
  Calculus verdict unchanged); type rows (chain-true lines ticked, null lines bare, school and linear papers unchanged).
- Accept: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit` clean. Calculus is a course path, not a
  mode: the pen applies in either mode. The verdict stays `checkAnswer`'s; no field is added to `store.ts`, no event
  changes shape. Owed to the owner's batch review: TV captures of a ticked and penned Calculus paper (1920 x 1080,
  1280 x 720).
- Kill: one clean chain rung that cannot be fixed in the checker, or a planted slip rung at another line: the checked
  lines are withheld (the checker stays, nothing draws it). More than 5 of 50 slips missed (null): narrow the tags and
  record which.

**T3. Twin: habit detectors (adult D5)** (M; batch 5, built locally per the owner's 2026-10-07 evening ruling)
- Goal: a pure `lib/rules/habits.ts` of six detectors that find a writer's habits, so a planted habit and a proven move
  are code's, not the model's. Each returns hits `{habit, n: number[], para, quote}` anchored to `splitSentences`
  numbering (a hit always names its sentence, because D6 plants and D7 `proven` need it). The six: vague-opener (a
  sentence opening with a vague This or It), hedge-stack (several hedges in one sentence), repeated-opener (one opener
  used three times or more in a paragraph), long-run (a run of long sentences past the writer's own band from
  `styleSheet` wps; no band or too few sentences measured gives nothing, it never guesses), filler (filler words), two-claims
  (a paragraph with two claims by the first-pass roles; the roles tag every non-link, non-evidence sentence a claim,
  so this one may not reach zero). Each states its exact rule beside it. English only. `SHIPPED` lists the detectors that
  pass the gate; `openHabits(pieces, band?)` is the shipped habits seen in at least two different pieces, each with
  the piece ids.
- Files: new `lib/rules/habits.ts`; new `tools/habits-fixtures.cjs` (committed first, alone), `tools/habits-rules-test.cjs`
  (appended at the end of `test:rules`).
- Tests: at least 30 rows per detector, at least half clean, with the near-misses ('This essay argues', 'It is raining',
  one hedge, an opener twice, one long sentence in the band, one claim with its evidence); chat messages, emails and
  essay paragraphs mixed. The suite prints, per detector: planted rows found at their sentence, planted rows missed,
  planted rows found at another sentence, clean rows flagged. `openHabits` rows: one piece is not open; two pieces are,
  with both ids; the same id twice counts once; a withheld detector never opens a habit; long-run with no band is no hit.
- Accept: the gate is zero false positives (a clean row flagged, or a planted row found at another sentence). A missed
  planted row is recorded and does not fail. A detector that cannot reach zero is out of `SHIPPED`, its rows kept. After
  the fixture commit a row changes only when it is wrong as English. Wired to nothing: no screen, route, store, event or
  card constraints (open habits become constraints at the full T5). No model call. No capture is owed.
- Kill: fewer than 3 detectors ship: stop after the table; row 19 says "N of 6 pass the gate".

**M2b. Math: the first GCSE Foundation units beyond the school path (generators, code-checked)** (M; batch 5, built locally per the owner's 2026-10-07 evening ruling; the last slice of the batch)
- Goal: two new units, each its own shape, set and marked by code with no model call, and a path that grows only by the units that pass the sweep. U1 Pythagoras' theorem (shape `pythagoras`; 1MA1 G20, the Pythagoras part only, no trig): tier 1 the longest side from the two shorter, tier 2 a shorter side from the longest and the other; all sides whole numbers (a scaled Pythagorean triple, sides at most 100), unit mm, cm or m; one plain sentence, no diagram; the truth recomputed from the spec with exact integer arithmetic (a bigint integer square root); slips: the two sides added, the squares added but the root not taken, for a shorter side the squares added instead of subtracted. U2 probability of an event (shape `probability`; 1MA1 P3, P4, P7, a single experiment): tier 1 one bag of 2-4 colours, at most 20 counters, the probability of a named colour; tier 2 by the seed: NOT a colour, one of two colours, or the complement of a stated probability given as a decimal or a percent; 0 and 1 are drawn again; any equal fraction, decimal (the system's mark) or percent is right; a ratio or words are unsure, never wrong; a value outside 0..1 is wrong; slips: the count alone, the part over the rest, one over the number of colours, for NOT the event's own probability, each used only where its value differs from the answer and from every other slip.
- Files: `lib/rules/school.ts` (shapes, wellFormed, question, slips, check, leakProfile, generators, specFromQuestion, unitOf, withheld, SCHOOL_UNIT_SLIPS), `maths/typeset.ts` only if the tex needs it, `lib/library/syllabus.ts`, `paths.ts`, `worked.ts`, `lib/rules/week.ts`, `lib/library/gcse.ts` (touches), `tv/rulerRows.ts` only if a ruler test shows a clipped label; new `tools/gcse-units-test.cjs` appended at the end of `test:rules`; the three docs that list the school units.
- Tests: rows in the school-* suites for each unit (spellings, slips, leaks, legit hints, printed questions, bad specs, the task reader); the sweep `tools/gcse-units-test.cjs`: each unit over tiers 1 and 2, systems uk, us, cz, de, at least 500 seeds, counting specs not well formed, specs not fair (the question prints its answer, or leaksSchool fails on the question), worked answers `check` does not mark right, and per slip the seeds where it is reachable and those where `check` returns it for its own value. It prints the table. Path pins revised openly, each with its old and new value.
- Accept: the first three counts are 0 for a unit and every listed slip is reachable and detected; `cd desk && npm run test:rules` green at every commit; `tsc --noEmit` clean; no verdict of the fifteen existing units changes. A slip without an exact value is dropped and said. The path unit has honest prerequisites (Pythagoras needs area; probability needs frac-equivalent and dec-convert), years from memory with a teacher-must-check comment, no lessonId, no learner-visible string naming GCSE, 1MA1 or Edexcel (X5: 'mapped to', never 'certified'); VERIFIED stays false. Captures owed to the owner's batch 5 review: Topics with the new units, Tonight's ruler, a Pythagoras paper and a probability paper, each at 1920 x 1080 and 1280 x 720.
- Kill: a unit with a non-zero count that cannot be fixed in its generator or check is withheld: it stays out of `SCHOOL_GENERATORS` and off the path, its code and rows kept, recorded in row 20 and the log. Both units fail: stop after the table.

**L4. Linga Adult: Take Two (adult C1)** (M; batch 6, built locally per the owner's 2026-10-08 10:05 ruling: one slice per
run through the gate, L4 first, then M3a)
- Goal: from the recap of a take ended by Cut (`Conversation.cut`), in Adult mode only, the learner picks one note and
  plays its beat again. A new turn action `take-two` (`{ note }`, the note's index in `cut.notes`) forks inside the same
  conversation, never through `start` (which keeps no link to the cut): the scene goes back to the partner line just
  before the noted turn (`forkOf`), that same line is re-delivered (its stored text, no model call, the audio by
  bumping `audioNonce`), the learner re-delivers their line with `turn`, and up to two cast turns follow, each one fast,
  thinking-off call in `conversation.ts` (the replay schema: a reply, no observations, no moment). After the second
  cast turn the take ends by itself; `take-end` ("Back to the notes") ends it earlier. Both end on `linga-recap`. (L4b: after the second cast turn the take stays on linga-talk until Back to the notes.) The
  name is not `replay`, which is already a turn action, a phase and a view id.
- The record: `Conversation.takes?: Take[]`, `Take { note, from, turns, held, at, endedAt? }` (types.ts): the note it
  came from, the partner turnId of the first take it forked at, its own turns (the re-delivered line first), `held`
  (`boolean | null`) and when. The first take's `turns` and `cut.notes` are never rewritten. At most one take per note.
  A running take is the last one with no `endedAt`.
- The turn table: a new state `take-two` (a finished conversation with a take running; a reply in flight inside it is
  `waiting`). `finished` takes `repeat` and `take-two`; `take-two` takes `turn`, `capture`, `repeat` and `take-end`;
  `waiting` keeps `leave` (inside a take it cancels the reply and stays on the take) and `repeat`. `accepts(c,
  "take-two", mode, note)` reads the mode and the note. Refused with a plain reason and no call: Family mode, no cut, a
  note out of range, a note that already had its take, a take already running, a reply in flight. Inside a take Cut,
  the coach, replay, the quiz, the help ladder, pause and finish are not offered, and no moment is asked for.
- Never evidence: a take writes no `EnglishEvidence`, no session entry, no digest, no certificate, no review reuse
  (`markReused`), no collectible, and leaves `c.evidence` and `c.supported` alone; `endTake` is not called. (C1's
  "stored as supported" is not enough: `rules.ts:51` still moves not-tried to with-help on supported evidence.)
- `heldOf(note, line)` in a pure `lib/english/take.ts` (no model call; `conversation.ts` keeps every call, so the
  thinking:false caller pin at `linga-rules-test.cjs:693` is unchanged): form, held when the sentences of the
  re-delivered line that carry the noted sentence's time marker have a verb form and `resolveEnglish` finds no conflict
  in any of them, not held when a conflict against that marker is still there, null when no sentence carries the marker
  or none has a verb form; word, held when the quote is gone (`findPhrase`, outside the better phrase where the better
  phrase says it) and the better phrase is contained, not held while the quote is still there, else null; meaning,
  held when the better phrase is contained, else null; register, a word or meaning note with no better phrase, an
  empty line, anything else: null. It never guesses. It is decided on the learner's first line of the take.
- Screens: no new Screen, no Session field (the conversation travels whole through `linga.changed`). `linga-talk`
  during a take: the partner's line, "Take Two" over it, Back to the notes (Cancel while a reply is on its way). The
  recap's tape: a held note's quote struck, an open one plain, a null one says "Not decided"; the fork drawn as a
  branch from the noted pin (the partner line it forked at, then the learner's line again). No count anywhere. Phone: a
  Take Two button per note on the recap, disabled with the refusal text when refused; during a take, the take panel.
- Files: new `lib/english/take.ts`; `lib/english/{types,turn,conversation,view}.ts`, `english/LingaTV.tsx`,
  `english/LingaPhone.tsx`; `tools/linga-rules-test.cjs`, `tools/adult-rules-test.cjs`; `docs/DESIGN-LINGA.md`,
  `docs/STUDY-DESK-SCREENS.md`; this plan and the adult plan's row C1.
- Tests: linga-rules, the heldOf table (at least 30 rows over the four kinds, at least 8 null, one where the better
  phrase is parroted inside a line that still carries the form conflict: not held) and forkOf rows; `turnState`,
  `accepts` and `refusal` for `take-two` and `take-end` in every state; one full stubbed run (a scene, learner turns,
  Cut, Take Two on one note, the re-delivery, two cast turns, the end) in which the learner record's english and the
  first take's turns and notes are deep-equal before and after, the re-delivered line is the stored text with no call,
  and the take makes at most 3 calls; view rows (the take on linga-talk, the struck, open and undecided pins, the
  branch, the phone's Take Two disabled with its refusal). adult-rules: Family mode refuses `take-two` with no call.
- Accept: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit` clean; no existing assertion changes;
  no Family behaviour or event shape changes. Owed to the owner's batch 5+6 review: the TV take (the branch, a struck
  note and an open one) at 1920 x 1080 and 1280 x 720, the phone recap at 390 px, one live take on the real engine.
- Kill: a take that writes to the learner record, or a held note code cannot back with a rule or a contained phrase:
  the take is withheld (the action refused), its code and rows kept.

**M3a. Math: Calculus 1 completed - word problems and multi-part questions** (M; batch 6, built locally per the owner's
2026-10-08 08:41Z order: the guest fix, then the runner, then M3a; one slice per run through the gate. The App Master's
eight rulings stand as written; one change the code requires is the chain tagger's capital label, under Goal, the chain)
- Step 0, first (architecture card 5 part b, no behaviour change): every suite that pinned a path length as a literal
  derives it from the path's topic list in `paths.ts`; one explicit length pin per path stays in
  `tools/maths-paths-test.cjs`; ruler geometry rows compute from N. Card 5 part a (the judge field) is M3b's.
- Goal, parts: a multi-part question travels as consecutive `PracticeItem`s, one per part, each with its own `n`, its
  own `CalcSpec` of the existing nine shapes and its own printed line (`question`), and two new optional fields shared
  by the parts: `stem` (the situation, printed once) and `part` (`a`, `b`, `c`). Marking, typed answers, the snap read,
  attempts, the leak check, `slipAt` and the chain pen work per part as on a single item; no nested item type (the flat
  one is not wrong anywhere in the code). The word problem is the last question of its set, so the paper's numbers run
  on: four single items, then question 5 with parts (a) and (b) (items 5 and 6).
- Goal, the mark: code decides every mark, each part by `checkAnswer(part.spec, answer)`. No new shape, kind of truth or
  tolerance; `calc-expr.ts`, `SAMPLES`, `TOLERANCE`, `FUNCTION_TOL` and `ROUNDED_CLOSE` are untouched. A word problem's
  answers are numbers, so a rounded decimal is still 'unsure' (the desk asks for the exact value) and an answer written
  with its unit does not read ('unsure', as any unreadable answer); each part line names its unit so the learner writes
  the number alone.
- Goal, templates: a new pure `lib/rules/calc-word.ts` draws a problem from a seed with no model call: the stem and part
  lines are plain sentences the template writes, with their own units. Every number they print is one the code drew
  (`drawn`) or sits inside the function the stem prints, which must be the parts' own `f` (`fn`); no number word
  (`undrawn`, a tested rule). A draw is kept only when well formed and fair (`fairWord`: no part's answer in the stem,
  in its own line or in another part's line, by `leaksCalc`); otherwise the template draws again. Three templates:
  `sphere-rates` (calc1-related-rates, derivative-at, after c12-q1: air into a sphere at q cm^3/s; (a) dr/dt when r =
  r0, (b) dS/dt then; each spec's f is the radius or the area as a function of the time since that moment, at 0);
  `rectangle-perimeter` (calc1-optimisation, extremum, after c15-q1: (a) the largest area, (b) the shortest diagonal, of
  a side x on [0, P/2]); `cubic-max-min` (calc1-extrema, extremum, after c13-q1 with no story: a cubic whose critical
  points are four or six apart on an interval chosen so both extrema are strictly inside). The story's letter (r) is
  printed; every part's answer is a number, so no part needs the letter. `SHIPPED` lists the templates whose sweep is
  clean.
- Goal, the chain (the change the code requires): `chain.ts` tagged a one-capital label (`A = x(14 - x)`) as an
  antiderivative on every shape, so a right first line of a story's working (A for area, D for diagonal) rang false on a
  wrong part. The tagger reads a capital label as an antiderivative only on the two integral shapes; on any other shape
  it names the function, as `f(x) =` does. Every existing chain row keeps its result.
- Goal, the reader: `partsFromQuestion` in `rules/calc.ts` reads "the (absolute) maximum and minimum of f on [a, b]" (in
  either order) into two extremum specs, null unless both are well formed; `readQuestion` (rules/kinds) carries the parts
  so a page task's hint is leak-checked against every part. `specFromQuestion` is unchanged: no question that reads today
  changes its spec. The syllabus table is re-measured by a committed test that prints it.
- Goal, the set (wired last): on the three topics, a calc1 set asked for by the practice route carries one code-drawn
  word problem beside the model's single items, its parts counted toward n (6: four single items and two parts). The
  model's prompt (still n + 3 specs), the single items and their order are unchanged; the first n - parts are taken. A
  set with no single item carries no word problem (it fails as before). The route asks with `word: true`; a direct
  `makeItems` call without it writes the set as before (the existing practice rows keep their meaning). Built: the route
  takes `word: false` (or `0`) in its body and then writes the model's set alone; no screen sends it, and the course walk
  (`tools/calc-course-test.cjs`) does, so its 22-topic rows keep pinning the model's set unchanged.
- Screens: no new Screen, no Session field. The TV paper (Practice, Sheet, Walk) prints the stem once as prose, through
  `prose()` in the wrapping row (`mb-row q wrap`), never in the nowrap question row; the parts sit below it labelled
  (a), (b), each line wrapped, each with its own answer line, tick and pen; the tally and the side card name a part
  5(a); a part whose function the stem does not print draws no graph. The phone's typed route shows the stem once and
  one labelled field per part. The read prompt shows the stem once and reports each part by its own item number; a
  single-item set's prompt is byte for byte as before. No new count is printed (X1, X2); one attempt per part.
- Files: new `lib/rules/calc-word.ts`; `lib/rules/{calc,chain,kinds}.ts`, `lib/desk/{items,mark,explain,memory,hint}.ts`,
  `lib/session/store.ts` (`stem`, `part`, kept by `shown`), `maths/MathsTV.tsx`, `app/phone/page.tsx`,
  `app/api/practice/route.ts`; new `tools/calc-word-test.cjs` (appended to `rulesSuites`, just before `harness-rules-test.cjs`,
  which pins itself last at `harness-rules-test.cjs:97`); rows in the calc-*,
  chain-rules, maths-judge, maths-tv and tv-sheet suites; `docs/CALCULUS-1-SYLLABUS.md`, `docs/MATH-COURSE-PATHS.md`
  (section 10), `docs/DESIGN-MATH-BUDDY.md`, `docs/STUDY-DESK-SCREENS.md`.
- Tests: the sweep `tools/calc-word-test.cjs`, per template 500 seeds, prints four counts: specs not well formed, items
  not fair, worked answers `checkAnswer` does not mark right (the template's own and, for the two stories, the sweep's
  own arithmetic), stem numbers the code did not draw; controls prove each count can fail; a right working on a part
  rings nothing. Rows: a stubbed set with a word problem marked part by part on the typed path and on a stubbed snap
  read (the read prompt shows the stem once); the paper's stem row and part labels; a single-item set unchanged; the
  corpus table (13 of 31 single questions, and what reads into parts).
- Accept: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit --incremental false` clean; the sweep's
  four counts 0 for every shipped template; no existing assertion changes its meaning; path pins move only in step 0.
  Owed to the owner's batch 5+6 review: the TV paper with a word problem at 1920 x 1080 and 1280 x 720, and the phone's
  part fields at 390 px.
- Kill: a template with a non-zero count its generator or check cannot fix is withheld (out of `SHIPPED`, off the set,
  its code and rows kept; row 24 and the log record it). No template passes: stop after the table. The screens not
  finished in the run: the set stays unwired, row M3a-2 holds the rest, and the run reports partial.

**M5. Math: recovery from a failed paper** (batch 7, after P6; cut in three by the App Master on 2026-10-08, one slice per
run through the gate, M5a first and alone, because M5b and M5c read its contract)
- Why three: the kill row (section g) is 20 rendered marked papers read by a live vision model, and no builder may make a
  live model call. So the pure core lands first (M5a), the surfaces on typed entry follow (M5b), and the photo path and
  its probe come last (M5c), with the live run owed to the owner's PC, as T1's was.
- App Master's rulings (2026-10-08):
  (1) Typed entry is the door that ships until M5c's probe passes the kill row. The photo path never ships on a
  simulated pass.
  (2) The paper decides, not the desk. A topic the desk calls secure that lost marks on the paper is still in the
  recovery: M5a reads no learner record, and M5b may mark a topic as secure on the desk beside it, never drop it.
  (3) M5 does not build review card 6 (the `SchoolUnit` contract,
  `.claude/scan-sweep/runs/architecture-2026-10-08-desk/REVIEW.md`). M5 adds no unit, so card 6 waits for the first
  slice that adds a GCSE unit.
  (4) M5b folds in the M3a-2 leftover: `maths/MathsTV.tsx` (about line 745) calls `deskLine` instead of `namedLine` +
  `itemName`.
  (5) Order: a prerequisite is pulled forward by the heaviest listed topic that needs it, as `recovery()` does. M5b draws
  the list in `recovery()`'s order and never re-sorts it (the learner meets the base of the biggest loss first).
  (6) A topic's lost marks sum the distinct items behind it: one item reaching a topic through two codes counts once
  there, while each statement takes the item in full (one question must not count twice on one topic).
  (7) The drop reason `label-names-the-board` stays; M5b shows it like every other drop, in words that do not name the board.
  (8) The caps (MAX_OUT_OF 6, MAX_ITEMS 80, PAPER_MARKS 80) stay as named, unverified constants. The check against the
  specification is owed to the owner and does not block M5b. The out-of-over-cap drop tells the learner to enter the
  parts one by one.
- App Master's rulings on M5b's questions (2026-10-08):
  (9) The TV door into the recovery list: the phone stays the only door for now (the Paper panel's send and "Show the
  last paper on the TV"). A TV stop on Get ready for school would revise `tv-keys-test` 'W8 2'; it waits for the owner's
  look at the list at 1920 x 1080 and 1280 x 720, so one review settles the list and its door together.
  (10) `lib/rules/paperEntry.ts` stays where it is: it is pure and imports only `library/gcse` and `rules/recovery`, as
  rules/ modules do. Its rows are in `phone-panel-test`.
  (11) A paper that could not be saved is reported as not saved. `dispatch`'s `paper.enter` caught `addPaper`'s throw and
  said "The desk kept no question from that paper.", which tells the learner their rows were all wrong when the disk
  failed. M5c step 1 fixes it: a status of its own, distinct from the no-row-left one, and the TV stays put.
- App Master's rulings on M5c's questions (2026-10-08):
  (12) A mixed item (one desk-topic statement and one gap statement) counts as mapped only when the read reaches the same
  topics AND the same notOnDesk statements. The builder's choice stands: a read that missed the gap statement would leave
  it off the Not on the desk yet list.
  (13) The probe papers are samples of a failed paper (10 to 13 items, 16 to 31 marks), drawn as clean renders, not phone
  photos of handwriting. A live pass is an upper bound on what a real photo gives, and the owner reads the live figure as
  that.
- Every M5 slice: no string a screen shows says "GCSE" or "1MA1" while `gcseClaimAllowed()` is false (gcse.ts HONEST
  LIMITS); the screens say "a paper", "your paper". gcse.ts, paths.ts, syllabus.ts, school.ts and the generators are
  unchanged.

**M5a. The recovery core** (S; row 34)
- Goal: a new pure `lib/rules/recovery.ts` (types and data from `library/gcse.ts` and `library/paths.ts`; no store, no
  engine, no fs, no model). A paper is a list of items `{ q, marks, outOf, codes }`: `q` a label as the paper prints it
  ('5(b)'), `marks` and `outOf` integers, `codes` statement codes from gcse.ts.
- `cleanPaper(raw)` is the one validation, and it never guesses. An item is dropped, with a reason, when its label is
  empty or too long, `marks` or `outOf` is not an integer, `outOf` is under 1 or over the cap, `marks` is under 0 or over
  `outOf`, or its label repeats an earlier one; items past the item cap or past the paper's mark total are dropped too.
  Codes: only codes found in `STATEMENTS` are kept, duplicates collapsed, at most 3 per item; every code not kept is
  reported. An item left with no valid code goes to `unmapped`, and its lost marks still count in the paper's lost
  total. The caps (marks per item, items, the paper's total) are what a Foundation paper allows; the JSDoc names their
  source and marks them unverified, as gcse.ts is.
- `recovery(paper)`: an item's lost marks are `outOf - marks` (a full-marks item adds nothing), counted in full against
  every code it names (a question that tests two statements was lost on both). Each statement leads to the desk topics
  its `touches` names on the school path; each topic appears once, with its summed lost marks, the item labels and the
  codes behind it. Order: most lost marks first, except that a topic never comes before one of its own prerequisites
  (`prereq`, followed through) that is also in the list; ties by path order. A statement with no desk topic goes to
  `notOnDesk` with its code, its `can` text, its lost marks and its item labels, by lost marks; a `foundation: false`
  statement is flagged there, never dropped. The paper's totals: marks, outOf, lost.
- Files: new `lib/rules/recovery.ts`; new `tools/recovery-rules-test.cjs` (in `rulesSuites` just before
  `harness-rules-test.cjs`); `desk/package.json`; this plan.
- Tests: validation (every drop reason; an unknown code dropped, not guessed; an item with only unknown codes in
  `unmapped`, its lost marks in the total); a full-marks item adds nothing; two codes on one item count against both;
  two statements on one topic give one entry with the sum; the prerequisite rule (a later topic with more lost marks
  still comes after its own prerequisite; unrelated topics by lost marks); `notOnDesk` (a gap statement with its `can`
  text, never linked to a topic; a `foundation: false` statement flagged); a sweep over every Foundation statement (a
  one-item paper gives a school-path topic or a `notOnDesk` entry, and the counts agree with `gcseCoverage()`); no
  returned string matches /GCSE|1MA1/ over a sweep of papers. Two kill tests, not committed: the prerequisite rule
  dropped (sort by lost marks only) turns the prerequisite row red; `cleanPaper` keeping an unknown code turns a
  validation row red.
- Accept: `cd desk && npm run test:rules` green at every commit; `npx tsc --noEmit --incremental false` clean; no
  existing assertion changes. No screen, route, phone, TV or learner-record change.

**M5b. The recovery surfaces** (M; row 35; reads M5a's contract unchanged)
- Goal: typed entry of a paper's results on the phone (one row per item: the label, marks, out of, and the statements
  picked from a list that shows each statement's `can` text, never a code alone), sent through `cleanPaper`, every drop
  shown with its reason; the recovery list on the TV (topics in M5a's order with their lost marks and item labels, the
  `notOnDesk` statements apart and plainly "not on the desk yet"); the result kept on the learner record (the cleaned
  paper and the date; the recovery recomputed from it, never stored). A secure topic stays in the list (ruling 2). The
  M3a-2 leftover in `MathsTV.tsx` (ruling 4).
- Proves done by: phone-panel and maths-tv rows (the entry, the drops, the list, no /GCSE|1MA1/ on any new surface),
  a learners-save row (the paper round-trips, a malformed stored paper is read as none); `tsc` clean; the screens docs
  and `docs/DESIGN-MATH-BUDDY.md` in the same commit. Owed to the owner: the TV list at 1920 x 1080 and 1280 x 720, the
  phone entry at 390 px.

**M5c. The photo path and its probe** (M; row 36; the kill row in section g)
- Goal: a photo of a marked paper read by the vision engine into the same raw paper `cleanPaper` takes (the label, the
  marks, out of; the statements by the question text), behind typed entry. The probe: 20 rendered marked papers with a
  known answer key, read, cleaned and scored by code (an item is right when its codes reach the key's desk topics, or
  its `notOnDesk` statements).
- Proves done by: the renderer, the stubbed read and the scorer committed with rows (a stubbed read of a rendered paper
  scores 100%, a wrong code scores it down); the live run of the 20 papers on the owner's PC, recorded with its figure.
  Under 85% of items mapped to the right unit: the photo path is not offered and typed entry stays the door (ruling 1).
  A simulated or stubbed pass is recorded as such and never ships the photo path.

**M3b. Math: the Calculus 2 spine** (batch 7; cut in three by the App Master on 2026-10-08, one slice per run through
the gate. M3b-1 goes first and alone, because M3b-2 builds on its seam)
- Why three: the owner's pick (decisions M3) is "integration techniques, sequences and series". Integration fits the nine
  `CalcShape`s. Sequences and series do not: they need a second variable, n ([MATH-COURSE-PATHS.md](../MATH-COURSE-PATHS.md)
  section 9). Today the string 'calc1' decides Calculus at 8 sites in 6 files (architecture review card 5,
  `.claude/scan-sweep/runs/architecture-2026-10-08-desk/REVIEW.md`), so a third path would be judged as linear and dropped
  on load. The seam comes first (M3b-1, card 5 part a; M3a step 0 built part b, the path lengths). The integration path
  follows on it (M3b-2), and sequences and series get a card of their own (M3b-3).
- Order (a deliberate deviation, recorded in the batch 7 M3b-1 log entry): M3b-1 runs before L5. L5's 18+ content waits
  for the owner's review at 09:00 on 2026-10-09, and M3b-1 needs no owner.
- App Master's rulings (2026-10-08):
  (1) M3b-1 is the judge field: no behaviour change, no screen change. M3b-2 is the Calculus 2 path. It takes only the
  topics whose questions fit the nine existing shapes (the owner's integration techniques), wired as a third path with
  `school: false`. M3b-3 is sequences and series. Section 9 calls them a design change (a second variable, n), so they
  get their own card. They are built only if that card names their kind of truth, comparison, leak rule and marking
  prompt. Otherwise they are listed in the honest limits, and the descope goes to the owner, because he picked them.
  (2) M3b-2 adds no new `CalcShape`. A topic that needs one goes to M3b-3, or is listed out with its reason.
  (3) A Calculus 2 topic's prerequisites point only at earlier Calculus 2 topics (`PathTopic`'s rule). The path's blurb
  says it follows Calculus 1. A cross-path prerequisite would be a design change.
  (4) M3b-2 has no Calculus 2 lessons. The honest limits say so, as they do for Calculus 1.
- App Master's rulings on M3b-1's questions (2026-10-08):
  (5) The course row's third cell: its captures at 1920x1080 and 1280x720 are owed to the owner at the batch review. They do
  not gate M3b-2. The row lays out as '220px auto' with flowing cells, like the interests row.
  (6) Prompt words: Calculus 2 gets its own words, chosen by the path record, and Calculus 1's text stays byte-identical. The
  course name in `CALC_SYSTEM` and the Calculus stance (`CALC_STANCE`: the course name and its methods) are read off the record
  of the set's or the learner's path. A path judged 'calc' carries its prompt name and its methods as data on `PathInfo`, so no
  site names a path id. A 'calc'-kind question on the school path uses the first path judged 'calc', which gives today's words.
  The words for calc2 name Calculus II and its methods: integration by parts, trigonometric integrals, trigonometric
  substitution, partial fractions.
  (7) Improper integrals (7.8) and approximate integration (7.7) move to the M3b-3 card as candidate shapes, beside sequences
  and series. They raise the design question M3b-3 must answer anyway: an improper integral's answer is a value or a 'diverges'
  verdict, as a series' convergence is; an approximation is a rule applied with n steps, a second variable as in a sequence.
  They are built only if that card names their truth, comparison, leak rule and prompt. Otherwise they go to section 10, and
  the descope goes to the owner with sequences and series.
  (8) Volumes, arc length and surface area (6.2, 6.3, 8.1, 8.2) are listed out in section 10, and M3b-2 adds no word templates
  for them. They are applications of integration, not the techniques the owner picked.
  (9) The source: no example corpus is required. Cite one public, openly licensed syllabus for the topic list: OpenStax Calculus
  Volume 2, chapter 3, sections 3.1-3.5. Keep the Stewart 9e numbers beside it. Each fixture names its section. If the OpenStax
  sections cannot be verified, cite Stewart alone and say so in questions.
  (10) No new slip. `CALC_AS_SLIPS` tags a slip by shape, so a new antiderivative slip would join every Calculus 1 antiderivative
  topic's closed list, and that is a Calculus 1 change. calc2 topics get the existing antiderivative and definite-integral slips.
  A technique slip needs slips keyed by topic: a design change, noted in section 10 as a follow-up.
  (11) The live tool: `tools/maths-calculus-live.cjs --path` takes every path judged 'calc' (calc1 and calc2). An unknown path is
  still refused before anything starts. No live call in the build run; one live calc2 set is owed to the owner's PC.
  (12) `explain.ts` `calcCourse`'s non-null assertion stays as it is. It holds while one path is judged 'calc', and row 17 guards it.
- App Master's rulings on M3b-2's questions (2026-10-09):
  (13) The assertion edits beyond test 1's three are accepted: maths-paths 12 (the requires regex admits `calculus[12].spine`),
  maths-paths 14 and 18 (the junk value 'calc2' became 'calc3'), maths-course 6 (three cells). Each was forced by calc2 becoming a
  path, and none is weaker: row 12 admits one more library file and nothing else, rows 14 and 18 keep the same count of junk
  values, and row 6 still pins the school and calc1 cells. The brief's "rows 13-19 need no edit" did not foresee junk lists that
  named calc2.
  (14) Sources: calc2-parts, calc2-trig-integrals, calc2-trig-sub and calc2-partial-fractions keep OpenStax Calculus Volume 2
  sections 3.1-3.4 beside Stewart 9e 7.1-7.4. OpenStax 3.5 is "Other Strategies for Integration": tables of integrals and computer
  algebra, Stewart 7.6's matter. It is a partial match for calc2-strategy, so Stewart 7.5 is that topic's source of record
  (recorded in MATH-COURSE-PATHS section 10). The spine data and its pins (calc2-path-test line 70 and the fixture refs) stay as
  they are. Checked by the M3b-3 step A run on 2026-10-09 against openstax.org (the chapter 3 navigation and the 3.5 page): 3.1
  Integration by Parts, 3.2 Trigonometric Integrals, 3.3 Trigonometric Substitution, 3.4 Partial Fractions, 3.5 Other Strategies
  for Integration (objectives: use a table of integrals; use a computer algebra system), 3.6 Numerical Integration, 3.7 Improper
  Integrals. The App Master's recall agrees with the source.
  (15) `maths-calculus-live --path calc2` walking the rulers only is accepted. Per-topic screens for calc2 wait for an example
  set. Owed to the owner: the three-cell course row captures and one live calc2 set.
  (16) The App Master checked the calc1 pins in calc2-path-test against items.ts and hint.ts at 37880327: byte-identical.
  The App Master's rulings on M3b-3 step A's questions (2026-10-09):
  (17) The M3b-3 card is accepted as complete: rulings (13)-(16) are in; every shape has its truth, comparison, leak rule,
  marking prompt and n, with file:line, or a reason; the diff against 2db4d800 touched the two docs only; rows 40-46 are not
  started; the not-buildable list is in MATH-COURSE-PATHS section 10. The App Master spot-checked the citations at 15937370 and
  they hold: calc-expr.ts 139, 148, 478, 516 and 587-591; calc.ts 38, 50-58, 166-173, 227-236, 389-392, 433 and 529-566;
  maths.ts 138-139; store.ts 156 and 176; paths.ts 39; calculus2.spine.ts 18.
  (18) Order. One run at a time, each ruled after the previous one settles: M3b-3a (the seam), M3b-3h (row 47, ruling 19),
  M3b-3b (approx-integral), M3b-3c (sequence-limit), M3b-3d (series-verdict), M3b-3e (series-sum), M3b-3f (improper-integral).
  M3b-3a, 3h and 3b hold under any answer the owner gives on the descope (ruling 22); 3c-3f wait for that answer. M3b-3g is not
  ruled in; it is revisited after 3f merges, if the 2026-10-23 deadline leaves room.
  (19) The Calculus 1 aliasing defect gets its own slice, M3b-3h (row 47), built second. The rule: a Calculus 1 'limit' at inf or
  -inf is well formed only if its limit along x*sqrt(2), with the sign kept, is the same value to LIMIT_SIDES, or the same
  infinity; otherwise the spec is refused as dne. Today the desk marks 1 right for cos(pi x) at infinity, a limit that does not
  exist. The guard refuses only specs whose truth is false: no word on a kept spec changes, so the every-M3b-slice rule holds.
  The proof: the frozen table from 3a stays equal; if any corpus or sweep spec changes, the edit is made openly (OLD/NEW, with
  the reason), as P6's line-50 pin was. One guard function, which 3c reuses. Rows: cos(pi*x), sin(pi*x)+1 and cos(2*pi*x) at
  inf are refused; every corpus limit at infinity is kept.
  (20) approx-integral's tolerance is accepted with one change: it is absolute. A decimal answer is right if and only if
  abs(answer - value) <= 5e-5 (+1e-12 for floating point), at any size of value. An exact form (a fraction) is right to 1e-6,
  relative. The degenerate rule is absolute at 1e-4, against the exact integral and against the other rules' values with the
  same pieces. There is no 'unsure' band. Why: 'to four decimal places' means half a unit in the fourth place, whatever the
  size; a tolerance relative to max(1, |value|) would accept a three-place answer once the value passes 1 (T_4 of x^2 on
  [0, 4] is 22, so the band would be 1.1e-3). M3b-3b adds that row.
  (21) Confirmed: the family lists, the verdict leak words, and the conditional verdict line on the reading and explain
  prompts. One correction: the telescoping condition (k+p)(k+q) > 0 admits p = -5, q = -3, k = 0, whose terms at n = 3 and
  n = 5 are undefined. The condition is k + p >= 1, so every n + p and n + q is positive for n >= k; and c != 0. M3b-3e adds
  the refused spec as a row. The verdict leak table in M3b-3d carries two lines: a hint that names a test without its outcome
  (not a leak), and a hint that states the deciding number against its threshold, such as '|r| = 1/2, which is less than 1'
  (a leak).
  (22) The not-buildable list goes to the owner as a descope (asked 2026-10-09; the answer is expected at 09:00): free terms
  in n; sequences with no real extension; sums outside the two families; free improper integrands; power series (11.8-11.11).
  Stewart 9e's section numbers stay cited from the book's structure and are unverified. The OpenStax numbers are verified.
  (23) A gap in the card: it did not name every consumer of the shape lists. MathsTV.tsx:23 keeps its own CALC_SHAPES check and
  draws a Plot at 825; maths/working.ts:49 sends every isCalcSpec item to chainChecks (chain.ts:303). M3b-3a lists every
  importer of CALC_SHAPES and isCalcSpec in the card, with what each does with a calc2 spec and the slice that handles it.
  M3b-3b makes chainChecks return no tick for a calc2 spec, with a row, and states that a calc2 item draws no plot on the TV
  (owed in its captures). The seam does not change MathsTV.
- Every M3b slice: no live model call in a gate; `desk/data/` untouched; no school or Calculus 1 screen or prompt text
  changes (a Calculus 1 learner sees and is sent byte-identical words).

**M3b-1. The path's judge** (S; row 37; architecture card 5 part a)
- Goal: one field on `PathInfo` in `library/paths.ts`, `judge: PathJudge` (`'school' | 'calc'`): the kind of truth a
  path's items are judged by. school is 'school' (a unit with a generator is a school item, any other topic a linear
  one) and calc1 is 'calc'. A Calculus topic's practice shapes ride on its `PathTopic` (`shapes`, on a 'calc' path only,
  the spine's own list), so no site reads `CALC1_SPINE` past `paths.ts`. Every site that decides Calculus by the string
  'calc1', or by reading `CALC1_SPINE` directly, asks the record instead: `rules/kinds.ts` kindOfTopic,
  `session/store.ts` pathChecked (any key of PATHS), `paths.ts` pathOf (any key of PATHS), `tv/profileRows.ts` COURSES
  (the PATHS keys in their declared order), `desk/hint.ts` (the stance and the voice), `app/api/hint/route.ts` (the
  lesson skip), `desk/items.ts` shapesOf, `rules/maths.ts` isCalcTopic and CALC_AS_SLIPS (every path judged 'calc'),
  and `desk/explain.ts` (the topic's path's name, not `PATHS.calc1`'s).
- `paths.ts` stays client-safe: types and library data only. After the change, the quoted 'calc1' literal appears in
  `desk/src` only in `paths.ts`, `calculus1.ts` and `calculus1.spine.ts`.
- Tests: rows added to `tools/maths-paths-test.cjs`, no existing assertion changed: every path has a judge; for every
  topic of every path, kindOfTopic, the Calculus slips, shapesOf, the hint stance and pathOf agree with the record; the
  store keeps a mathPath that is a PATHS key and drops anything else; COURSES equals the PATHS keys in order; a sweep
  finds no quoted 'calc1' in `desk/src` outside the three files. Kill test, not committed: calc1's judge set to
  'school' turns a Calculus row red.
- Accept: `cd desk && npm run test:rules` green at every commit; `npx tsc --noEmit --incremental false` clean; no
  existing assertion changes; no screen or prompt text changes for school or calc1.

**M3b-2. The Calculus 2 path: integration techniques** (M; row 38; a draft, dispatched after the App Master rules on
its questions)
- Goal: a new `library/calculus2.spine.ts` (plain data, no import, `CalcSpineTopic`s) and a `calc2` entry in PATHS:
  `judge: 'calc'`, `school: false`, a blurb that says it follows Calculus 1. Proposed topics (Stewart 9e chapter 7),
  each on `antiderivative` and `definite-integral` only: `calc2-parts` (7.1, integration by parts),
  `calc2-trig-integrals` (7.2), `calc2-trig-sub` (7.3, trigonometric substitution), `calc2-partial-fractions` (7.4) and
  `calc2-strategy` (7.5, choosing the technique). Prerequisites point only at earlier calc2 topics (ruling 3).
- Listed out (rulings 7 and 8): volumes, arc length and surface area (6.2, 6.3, 8.1, 8.2: applications of integration, and a
  `definite-integral` spec prints only the integral; no word templates). Approximate integration (7.7) and improper integrals
  (7.8) move to M3b-3 as candidate shapes (ruling 7). Differential equations, parametric and polar curves are not in the
  owner's pick. Source (ruling 9): OpenStax Calculus Volume 2 chapter 3 (3.1-3.5), with Stewart 9e numbers beside it.
- Wiring, by section 9 steps 1-8: MathPath, the spine, the record. The judge carries the rest (M3b-1): kindOfTopic,
  the slips, shapesOf, the hint stance, the store's check and the course row all follow it. The course row gets a third
  cell, which is a screen change, so its captures are owed. The length pin is in `maths-paths-test` (one per path).
  `maths-calculus-live.cjs --path` takes calc2.
- Tests: a fixture per topic, hand-written specs with their worked antiderivative or value (a by-parts x e^x and
  x sin(x), ln(x); a partial-fraction 1/(x^2 - 1); a trig substitution with sqrt(4 - x^2)). Each spec is well formed, and
  `checkAnswer` marks its own worked answer right and a named slip's answer wrong. The M3b-1 rows extend to calc2 with
  no edit. A stubbed calc2 set is judged 'calc', and its prompt asks only for the topic's shapes.
- Accept: the gate green at every commit; tsc clean; no school or Calculus 1 text changes; the honest limits name what is
  listed out, and that Calculus 2 has no lessons (ruling 4). Owed to the owner: the Maths course row with three cells at
  1920 x 1080 and 1280 x 720, and one live calc2 set.
- Kill: a topic whose fixtures `checkAnswer` cannot mark (a right answer not 'right', a slip not 'wrong') is withheld
  from the spine, listed in the honest limits with its reason, and its fixtures are kept. Under three topics left: the
  path is not wired, row 38 records it, and the owner is told.

**M3b-3. Sequences and series** (row 39; card completed by M3b-3 step A on 2026-10-09; the build waits for the App
Master's ruling on the slices M3b-3a to M3b-3f below)
- Goal: the owner's "sequences and series" (Stewart 9e chapter 11), and the two shapes M3b-2 moved here (ruling 7): improper
  integrals (7.8; a value or a 'diverges' verdict) and approximate integration (7.7; a rule applied with n steps). They are
  built only if this card names their truth, comparison, leak rule and prompt; otherwise they go to section 10 and the
  descope goes to the owner. The engine reads x only, so the card must first name,
  for each proposed shape: its kind of truth (a sequence's limit as n grows; a series' sum, a number; whether a series
  converges, a verdict and not a number), its comparison (a number within a tolerance, or a verdict matched exactly), its
  leak rule (`leaksCalc` reads numbers and functions in x, not a verdict word), its marking prompt, and how n is read
  (n! and (-1)^n have no x reading).
- Accept: as M3b-2, with the shape checklist of section 9 step 5 done for every new shape.
- Kill: the card cannot name all four for a shape: that shape is not built. With no shape left, sequences and series
  go into MATH-COURSE-PATHS section 10 with the reason, and the descope goes to the owner (ruling 1).
- Sources: Stewart 9e chapter 11, sections 11.1-11.7 (sequences; series; the integral test; the comparison tests;
  alternating series; absolute convergence and the ratio and root tests; the strategy for testing series), and 7.7 and
  7.8. OpenStax Calculus Volume 2, checked against openstax.org on 2026-10-09: chapter 5 is 5.1 Sequences, 5.2 Infinite
  Series, 5.3 The Divergence and Integral Tests, 5.4 Comparison Tests, 5.5 Alternating Series, 5.6 Ratio and Root Tests;
  chapter 3 has 3.6 Numerical Integration and 3.7 Improper Integrals. Topic names are our own words. **Power series
  (Stewart 11.8-11.11) are out**: their answers are an interval of convergence (an interval whose two ends each carry a
  verdict, which is a set answer, section 9's design-change list), a power series as a function (a sum of infinitely many
  terms in x, so `sameFunction` has no closed form to sample), or a Taylor polynomial (needs derivatives of every order;
  `derivativeAt` gives only the first, calc-expr.ts:433). The radius of convergence alone is one number and could become a
  family shape later. That needs a card of its own and is not cut here. The descope goes to the owner (questions).

**M3b-3 step A: the engine as it stands** (read and probed on 2026-10-09 at 2db4d800; a scratch script outside the repo
loaded the TypeScript through `tools/ts-load.cjs`; no code changed)
- The expression engine reads one variable, x. A letter outside its words is null (calc-expr.ts:139; the words at
  101-111), and so is any other character, `!` included (calc-expr.ts:148). Probed: `compile` returns null for `n`, `2n`,
  `n!`, `x!`, `(-1)^n`, `2^n`, `n^2+1` and `3^x/x!`. `(-1)^x` reads: `Math.pow` (calc-expr.ts:349) gives -1 at 3, 1 at
  100 and NaN at 2.5. `r^x` reads for r > 0 on every real, and for r < 0 only at whole numbers.
- `read()` requires a function in x on every shape: no `f`, a `+C` or no x is refused (calc.ts:170-173).
- `limitInf` samples f at x = 1/t for t from 1e-2 down to 1e-8 (calc-expr.ts:516, 587-591): x = 100, 1000, ..., 1e8,
  each a whole number (one is 99999.99999999999). A function of period 1 or 2 is therefore read only at its whole-number
  points. **Probed, a latent Calculus 1 defect**: `wellFormed({shape:'limit', f:'cos(pi*x)', at:'inf'})` is ok,
  `limitInf` says the value is 1, and `checkAnswer` marks `1` right, though the limit does not exist. The same holds for
  `sin(pi*x)+1` (truth 1) and `cos(2*pi*x)`, while `x*sin(pi*x)` gives a value near 0. Nothing in this run changes it
  (questions).
- `integrate` returns null for an infinite bound (calc-expr.ts:478) and for an integrand that is not finite at a sample
  (calc-expr.ts:484, 508). Calculus 1 therefore refuses every improper integral: `b: 'inf'` is "not a finite number"
  (calc.ts:137-144, 215), and `1/sqrt(x)` on [0, 1] is "not finite on this interval" (calc.ts:218). Probed:
  `limitInf(t -> integrate(f, 1, t))` is `dne` for 1/x^2, e^(-x), 1/x, 1/x^1.01 and 1/x^1.1 alike, because `integrate`
  fails at t = 1e8. The partial integrals that do come back cannot tell a slowly convergent integral from a divergent one:
  at t = 100 and 1e4, 1/x^1.01 gives 4.50 and 8.80, and 1/x gives 4.61 and 9.21, but the first converges to 100 and the
  second diverges.
- `checkAnswer` reads a verdict word as unreadable: "converges" on a limit spec is 'unsure' (calc.ts:433). `leaksCalc`
  reads "it converges" as no leak, and "it converges to zero" as a leak only by the zero (calc.ts:549-554).
- The typesetter already sets `\sum` with its limits (maths/typeset.ts:62, 353-354). The Fire TV glyph for ∑ is
  unverified (MATH-COURSE-PATHS section 10).

**M3b-3 step A: one rule for every shape.** n is never read by the expression engine. Each shape below takes one of two
roads:
- A function in x the engine already reads, which code prints with n in place of x. This is the sequence-limit shape.
- A family: a closed list of term forms whose parameters are whole numbers or fractions. Code prints the term in n from
  a template, and decides the truth by a rule on those numbers. This covers the series sum, the convergence verdict and
  the improper integral.
So `(-1)^n`, `n!` and `r^n` are printed by code and never parsed or evaluated. calc-expr.ts stays as it is, apart from
one additive printer (slice c), and every comparison against a threshold (|r| < 1, p > 1, a degree gap of 2) is between
whole numbers, with no floating-point edge. Reading n would need:
- `n` as a second word and Node (calc-expr.ts:34-45, 101-111);
- a postfix `!` (calc-expr.ts:148);
- an `at(x, n)`;
- a decision at every `usesX` site (calc.ts:141, 173, 305, 447, 550).
That would change Calculus 1: a learner's answer or a prose window holding a lone n, unreadable today, would start to
read and change which windows `leaksCalc` takes (calc.ts:555-566). The card does not propose it.

**M3b-3 step A: where the new shapes live.** A new module, `rules/calc2.ts`, holds the five shapes below as
`CALC2_SHAPES`, separate from `CALC_SHAPES` (calc.ts:38). The nine shapes therefore stay nine, and so do:
- the `sign` and `arithmetic-slip` slips, whose shapes are `CALC_SHAPES` (calc.ts:580, 591);
- `TOLERANCE` (calc.ts:50-58);
- `CALC_WITHHELD` (calc.ts:889-899);
- maths-paths-test line 86 (every one of the nine is practised on Calculus 1).
calc.ts's public functions (`wellFormed`, `question`, `checkAnswer`, `leaksCalc`, `slipsFor`, `withheldCalc`,
`specFromQuestion`) send a `CALC2_SHAPES` spec to calc2.ts on their first line. A Calculus 1 spec runs today's lines.
`isCalcSpec` (maths.ts:138-139) and `specShown` (store.ts:176) accept both lists, so a calc2 spec is a 'calc' item
(`kindOfSpec`, kinds.ts:32) and survives `shown()`. The shared reading helpers move out of calc.ts into `rules/calc-read.ts`
so that calc2.ts can use them without a cycle:
- `cleanAnswer` (calc.ts:378);
- `infinityOf` (385);
- `DNE` (389);
- `isDecimal` (391);
- `withinRel` (392);
- `spoken` (476);
- `piecePattern` (488);
- the window reader (555-566).

**The five candidate shapes** (each with its kind of truth, comparison, leak rule, marking prompt and how n is read; the
tolerances named are the ones a build would add, none is added by this run)

(i) **sequence-limit** - the limit of a sequence a_n = f(n) (Stewart 11.1, OpenStax 5.1). Spec `{shape, f}`, f in x.
- Truth: `limitInf(f, 1)` (calc-expr.ts:587), as Calculus 1's limit at infinity does (calc.ts:227-229), because Stewart
  11.1 Theorem 3 says: if f(x) -> L as x -> infinity and a_n = f(n), then a_n -> L. That theorem runs one way only, so
  two guards apply:
  - `dne` is refused (as calc.ts:236 does), since f may have no limit while a_n does (sin(pi x));
  - the alias guard: the limit must also exist and agree, to `LIMIT_SIDES` (calc-expr.ts:520), along x·√2. That second
    run is `limitInf` on `x -> f.raw(x·√2)`, with infinities kept (calc-expr.ts:56); `at` turns an overflow into NaN, and
    the probe saw 2^x/x^3 come back null.
  Probed: cos(pi x) gives 1, then `dne` under the guard (refused); sin(pi x)+1 gives 1, then `dne`; x·sin(pi x) gives 0,
  then `dne`. These agree under the guard: (3x^2+1)/(x^2-4) at 3 and 3, (1+1/x)^x at e and e, x^(1/x) at 1 and 1,
  (1/2)^x at 0 and 0, ln(x)/x at about 2e-8 both times (truth 0, inside 1e-6). `(-1)^x` is NaN off the whole numbers,
  so the guard refuses it. An infinite limit is an infinity (2^x/x^3 gives inf).
- Comparison: the `limit` row's numbers, `{exact: 1e-6, rounded: 5e-3}` (calc.ts:56), with the same reason. An infinite
  limit is answered inf, infinity or ∞ with its sign (calc.ts:424-429), and "dne" is wrong (calc.ts:430).
- Leak: the `limit` shape's rule (calc.ts:529, 549-554). Its own pieces (calc.ts:497-501) are printed in n:
  `lim_(n->infinity)`, `n->infinity`, "n approaches infinity" (and tends to, goes to). On an infinite truth, any word for
  infinity leaks (calc.ts:529), as on Calculus 1.
- Marking prompt: the reading prompt (mark.ts:110-121) is unchanged, because the answer is a number or an infinity. The
  set prompt's line: "sequence-limit: f, a function of x that the desk prints with n in place of x. The question is the
  limit of a_n = f(n) as n grows. Pick one that is defined for every real x >= 1 and that has a limit or grows without
  bound." The model is never told the limit, and no result key reaches the schema (items.ts:261, calc.ts:169).
- How n is read: it never is. f is in x. A new printer writes it in n: a `v` argument on calc-expr's `tex()` (the x case
  at calc-expr.ts:741), and a new node-to-plain printer that always writes n as a token of its own. `toTex(e)`
  (calc-expr.ts:769) keeps its output. The page reader turns the desk's own printed question back into x by renaming only
  an n that stands between non-letters, so `ln(n)` becomes `ln(x)`. An n inside a letter run ("en") is left as it is, and
  the term then fails to read (null, conservative). Out of reach: a_n written with `(-1)^n` or `n!` (no real extension).
  Those sequences (squeeze examples such as (-1)^n/n, and n!/n^n) go to the honest limits.
- Kill: drop the alias guard, and `{f:'cos(pi*x)'}` becomes well formed with truth 1. The row that asserts it is refused
  goes red.
- Verdict: **buildable**.

(ii) **series-sum** - the sum of a convergent series (Stewart 11.2, OpenStax 5.2). Spec `{shape, family, ...}`, two
families.
- Truth, by closed form:
  - `geometric`: a·r^n from n = k (k is 0 or 1; a is a non-zero whole number or fraction; r is a fraction with
    0 < |r| < 1, compared on its numerator and denominator). The sum is a·r^k/(1 - r).
  - `telescoping`: c/((n+p)(n+q)) from n = k (whole numbers with p < q, q - p <= 6, and (k+p)(k+q) > 0 so that no term
    is undefined). The sum is c/(q-p) · (1/(k+p) + ... + 1/(k+q-1)).
  The desk decides every spec the schema allows: the parameters are whole numbers (JSON `integer`) or a fraction string
  that `read()` takes apart into two whole numbers, and |r| = 1, a zero factor and q - p out of range are each refused.
  Probed against partial sums: geometric (3, 1/2, 0) is 6 by both; (1, -1/3, 1) -0.25 by both; (5, 2/3, 1) 10 by both.
  Telescoping (1, 0, 1, 1) is 1 against 0.999999 at 1e6 terms; (2, -1, 1, 2) 1.5; (3, 0, 3, 1) 11/6; (1, 1, 3, 0) 0.75.
  Stewart's 1/(n(n+1)) is (1, 0, 1, 1).
- Comparison: a number. The tolerance a build adds is `{exact: 1e-6, rounded: 5e-3}`, the definite-integral row's reason
  (calc.ts:47): a learner who rounds to three figures lands within 5e-3. `judgeNumber` (calc.ts:396-402) rules, the sign
  slip included.
- Leak: the number rule (calc.ts:549-554). Its own pieces are the printed term, `sum_(n=k)^infinity`, and "n = k".
- Marking prompt: the reading prompt is unchanged (a number). The set line names the families and their fields only:
  "series-sum: family (geometric or telescoping) and its numbers. The question is the sum; pick one that converges." The
  model is never told the sum or the formula. `sum` joins the refused result keys (items.ts:261, calc.ts:169).
- How n is read: never. The term is printed from the template (`3(1/2)^n`, `1/(n(n+1))`). `r^n` and the alternating
  sign of a negative r appear only in the printed text.
- Kill: drop the 1/(q-p) factor, and Stewart's 3/(n(n+3)) (truth 11/6) goes red. Read the geometric sum from n = 0 when
  k is 1, and (1, -1/3, 1) goes red.
- Verdict: **buildable** for these two families. A free term in n is not, because the desk has no sum for it: partial
  sums cannot tell a slowly convergent series from a divergent one (the probe in (iv) shows this for integrals).

(iii) **series-verdict** - whether a series converges or diverges (Stewart 11.2-11.7, OpenStax 5.2-5.6). Spec
`{shape, family, ...}`. Each family is decided by one textbook rule, on whole numbers:
| family | term printed | parameters | the rule (Stewart) | why every allowed spec is decided |
|---|---|---|---|---|
| `geometric` | a·r^n | a != 0; r = u/v, u != 0, v > 0 | converges iff \|u\| < v (11.2) | a comparison of two whole numbers; r = ±1 is decided (diverges) |
| `p` | c/n^p, or (-1)^n·c/n^p with `alt` | c != 0; p = u/v, v > 0 | plain: iff u > v (the p-series, 11.3); alternating: iff u > 0 (the alternating series test 11.5, else the divergence test 11.2) | whole numbers; p = 1 exactly is the harmonic series |
| `rational` | P(n)/Q(n) from n = k | integer coefficients, degree 0-3 each, leading terms != 0, Q(n) != 0 for every whole n >= k | iff deg Q - deg P >= 2 (the limit comparison test with 1/n^(deg Q - deg P), 11.4; deg P >= deg Q fails the divergence test) | the terms keep one sign from some n on; Q has at most three whole roots, found exactly by the rational root theorem on its integer coefficients |
| `ratio` | n^j·c^n·(n!)^m | j in 0..3; c = u/v != 0; m in {-1, 0, 1} | m = -1: converges; m = 1: diverges; m = 0: iff \|u\| < v (the ratio test, 11.6; for \|c\| >= 1 the term does not go to 0) | whole numbers and a three-valued m |
| `root` | ((a·n + b)/(c·n + d))^n | whole numbers, c != 0, c·n + d != 0 for n >= 1 | iff \|a\| < \|c\| (the root test, 11.6; at \|a\| = \|c\| the term tends to e^((b-d)/c) or its sign-alternating twin, not 0: diverges) | whole numbers |
- Comparison: a verdict matched exactly. The answer is read by a closed list: converges, convergent, it converges, the
  series converges, conv; and the same for diverges. Anything else is 'unsure' (a number written for a verdict
  included), never wrong, as an unreadable answer is today (calc.ts:433). A wrong verdict is 'wrong' with no slip of
  code's own (`sign` does not apply). No tolerance.
- Leak: a verdict shape leaks when the line names a verdict at all, either way, as an infinite limit leaks by naming
  infinity (calc.ts:529). That covers any form of converg- or diverg-, "has a sum", "adds up to", "finite sum", "blows
  up", "grows without bound", "goes to infinity", "infinite sum". It also leaks when one sentence states the deciding
  comparison as a fact: the family's deciding number (|r|, p, the degree gap, |c|, |a|/|c|) beside a comparison word or
  sign (<, >, less than, greater than, more than, at most, at least, smaller, bigger) and the threshold (1, or 2 for the
  degree gap). Naming the test ("try the ratio test", "compare with a p-series") does not leak: it is the method, not
  the outcome. The question's own pieces (the printed term, `sum_(n=k)^infinity`) are set aside first.
- Marking prompt: the set line gives the families and their fields, and asks for a mix that converges and diverges. It
  never says which spec does which, and never names a rule's threshold per spec. On the reading prompt (mark.ts:116) and
  the explain prompt (explain.ts:161-164), a sheet or item with a verdict item gets one more line: "For a question that
  asks whether a series converges, copy the word the student wrote (converges or diverges), as written." A sheet without
  one is asked byte for byte as today. The model is never told the verdict, and `verdict`, `converges` and `diverges`
  join the refused result keys.
- How n is read: never. `(-1)^n`, `n!`, `r^n` and `((an+b)/(cn+d))^n` are printed from the family's template, and the
  verdict comes from the rule on the parameters, so nothing in n is evaluated.
- Absolute or conditional: **proposed as an optional slice** (M3b-3g, below), not in the first verdict slice. For the
  alternating `p` family it is decided (absolutely iff u > v; conditionally iff 0 < u <= v), and it is a three-word
  verdict matched exactly. It adds "absolute" and "conditional" to the leak words.
- Kill: flip the `p` rule to u >= v, and the harmonic fixture (Σ 1/n, diverges) goes red. Flip the `rational` gap to
  >= 1, and Σ n/(n^2+1) (diverges) goes red.
- Verdict: **buildable** for the five families. A free term in n is not buildable (no decision procedure).

(iv) **improper-integral** - a value or 'diverges' (Stewart 7.8, OpenStax 3.7). Spec `{shape, family, ...}`. The
integrand is a function in x, printed by code from the family.
- Truth, by closed form (c != 0; p = u/v, v > 0; a, b > 0 whole or fractions; k = u/v):
  - `tail-power`: ∫_a^∞ c/x^p dx = c·a^(1-p)/(p-1) iff u > v, else it diverges;
  - `end-power`: ∫_0^b c/x^p dx with 0 < p (p <= 0 is a proper integral and is refused) = c·b^(1-p)/(1-p) iff u < v,
    else it diverges;
  - `tail-exp`: ∫_a^∞ c·e^(-kx) dx = c·e^(-ka)/k iff k > 0, else it diverges.
  Free integrands are **not buildable**, as probed above: `integrate` returns null on an infinite bound (calc-expr.ts:478),
  and no partial-integral limit separates 1/x^1.01 (converges to 100) from 1/x (diverges) at any t the engine reaches.
  Parts-based integrals (∫_0^∞ x e^(-x) dx) and 1/(1+x^2) on the whole line are out with them.
- Comparison: a number to the definite-integral row's `{exact: 1e-6, rounded: 5e-3}`, or a verdict matched exactly as in
  (iii). "diverges" (the closed list) is the verdict, and so is an infinity with the integral's sign, since every
  divergent spec here diverges to c's sign times infinity. A number for a divergent integral, or a verdict for a
  convergent one, is wrong.
- Leak: a convergent spec uses the number rule. A divergent spec uses the verdict rule of (iii) plus any word for
  infinity, applied after the question's own pieces (`int_a^infinity`, "from a to infinity") are set aside. Calculus 1's
  infinite limit checks before its pieces (calc.ts:529, 536), and that order would make the question's own bound a leak.
- Marking prompt: the set line gives the families. The reading and explain prompts get the verdict line of (iii) when
  the sheet has such an item. The model is never told the value or the verdict.
- How n is read: there is no n. x is the engine's own variable. The integrand is printed from the template, so `x^p`
  and `e^(-kx)` print, and `wellFormed`'s Calculus 1 definite-integral path is untouched (it still refuses an improper
  interval).
- Kill: flip the tail-power rule to u >= v, and ∫_1^∞ 1/x dx (diverges) goes red. Drop the 1/k, and ∫_0^∞ e^(-2x) dx
  (1/2) goes red.
- Verdict: **buildable as the three families**. With free integrands it is not buildable (the reason above, which goes
  in section 10).

(v) **approx-integral** - a rule applied with n steps (Stewart 7.7, OpenStax 3.6). Spec
`{shape, f, a, b, pieces, rule}`: f in x, `rule` is trapezoid, midpoint or simpson, and `pieces` is a whole number from
2 to 10, even for Simpson. The parameter is `pieces`, not `n`, so it never meets the item's `n`.
- Truth: the rule's finite sum over `f.at` at the grid points. That is pieces + 1 evaluations at most, all finite, and an
  undefined point refuses the spec. Probed for 1/x on [1, 2] (Stewart's 7.7 example): T_5 = 0.6956349, M_5 = 0.6919079,
  T_4 = 0.6970238, M_4 = 0.6912199, S_4 = 0.6932540, S_10 = 0.6931502; ln 2 = 0.6931472.
- Comparison: a number. The tolerance a build adds is `{exact: 1e-6, rounded: 5e-5}`, with this reason: the question
  asks for four decimal places, and 5e-5 is half a unit in the fourth place. Calculus 1's 5e-3 cannot work here: T_5's
  error is 2.5e-3, so a learner who gave ln 2 would be marked right. The degenerate rule (as Newton's, calc.ts:265)
  refuses a spec whose value is within 2 × 5e-5 (relative to max(1, |value|)) of the exact integral (`integrate`) or of
  another rule's value with the same pieces. Measured: S_10 (error 3e-6) is refused, S_4 (error 1.1e-4) is kept,
  T_5 and M_5 are kept. This shape has no 'unsure' band (calc.ts:400's 5e-3 would cover the exact integral): within
  5e-5 is right, anything else that reads as a number is wrong, as the question asks for four decimal places.
- Leak: the number rule (calc.ts:549-554) at 5e-5 for this shape. Its own pieces: `int_a^b`, "n = pieces", the rule's
  name and [a, b]. The exact integral stated in a hint does not leak, because the degenerate rule keeps it more than
  1e-4 away.
- Marking prompt: the reading prompt is unchanged (a number). The set line: "approx-integral: f, a, b, pieces (2 to 10,
  even for simpson) and rule (trapezoid, midpoint or simpson). The question is that rule with that many subintervals,
  given to four decimal places." The model is never told the value. The printed question names the rule, "n = pieces"
  and "to four decimal places".
- How n is read: n is a whole-number parameter (JSON `integer`), printed as "n = 4" and never parsed. The word "n" in the
  question is prose; a lone n token does not compile (calc-expr.ts:139), so it changes no leak window.
- Kill: compute T_n as a left Riemann sum (dropping the half weights at the ends), and the T_5 fixture (0.6956) goes red.
- Verdict: **buildable**.

**What every build slice may change in Calculus 1, and the row that pins it unchanged.** These are the only Calculus 1
files a slice touches. calc.ts gets the dispatch and the moved helpers (a). items.ts gets per-shape tables and the
schema's `f` (b). calc-expr.ts gets the printer's variable (c). mark.ts and explain.ts get a conditional verdict line
(d). store.ts gets keys. calculus1.spine.ts, calculus1.ts, calc-word.ts and kinds.ts are not touched. The pins:
- calc-rules-test 1-9: checkAnswer, the tolerances, wellFormed, question(), leaksCalc, the slips, the sweep, the
  mutations;
- calc-expr-test 1-15, with 12 for toTex;
- calc-hint-test 1-8: the readers and the fixed sentences;
- calc-marking-test M3a 2: the reading prompt byte for byte;
- school-marking-test line 304 and voice-rules-test line 44: the explain system;
- calc2-path-test 6: calc1's set prompt and stance whole;
- maths-paths-test 13-19;
- calc-course-test: the whole course;
- calc-practice-test;
- a new frozen table in slice a: every Calculus 1 corpus spec and sweep spec through question(), checkAnswer on its
  worked, wrong and slip answers, and leaksCalc on its question and its fixed sentence, written at the base and compared
  byte for byte at every later slice.
Assertions a build must edit, all forced by calc2 growing (as M3b-2's were):
- calc2-path-test 1 (the five topic ids, the sections, the OpenStax numbers);
- maths-paths-test 1 (calc2's length 5);
- maths-paths-test 23 (`SHAPES`, the contract), with 82 and 215: a calc2 topic's shapes are checked against
  `SHAPES ∪ CALC2_SHAPES`, while 86 (all nine practised on Calculus 1) is unchanged.

**The build slices** (one shape of change each, in this order, each a run through the gate, built only after the App
Master's ruling; the calc2 topics follow Stewart's order in `calculus2.spine.ts`, with prerequisites only on earlier calc2
topics per ruling 3, and each new topic is a screen change on the calc2 ruler whose captures are owed)

**M3b-3a. The Calculus 2 shapes seam** (S; row 40; no behaviour change, like M3b-1)
- Goal: `rules/calc-read.ts` (the helpers moved out of calc.ts, unchanged); `rules/calc2.ts` with `CALC2_SHAPES = []`
  and the dispatch API; calc.ts's public functions dispatch a `CALC2_SHAPES` spec on their first line; `isCalcSpec`
  (maths.ts:139) and `specShown` (store.ts:176) read both lists; `PathTopic.shapes` (paths.ts:39) and `Calc2Shape`
  (calculus2.spine.ts:18) take either list's ids.
- Rows: the new suite `tools/calc2-seam-test.cjs` - the frozen Calculus 1 table (above), written at the base; calc.ts
  imports only calc-expr.ts, calc-read.ts and calc2.ts; calc2.ts imports no store, engine or TV module. Existing
  assertions: none changed.
- Kill: route one Calculus 1 shape (`limit`) to calc2.ts, and the frozen table goes red.
- Files: rules/calc.ts, rules/calc-read.ts (new), rules/calc2.ts (new), rules/maths.ts, session/store.ts,
  library/paths.ts, library/calculus2.spine.ts, tools/calc2-seam-test.cjs (new), desk/package.json (`rulesSuites`), docs.

**M3b-3b. Approximate integration** (M; row 41; shape (v); topic `calc2-approx`, Stewart 7.7 / OpenStax 3.6, after
`calc2-strategy`, prerequisites none)
- Goal: `approx-integral` in calc2.ts (read, truth, the degenerate rule, question, checkAnswer, the leak rule, the fixed
  sentence, a reader for its own printed phrasing, the slips `arithmetic-slip` and `sign` by id); items.ts `PARAMS`,
  `PARAM_SCHEMA` (`pieces` integer 2-10, `rule` enum) and `SHAPE_LINES` widened to both lists, and `calcSchema` adding
  `f` only for a shape that has one (items.ts:215; calc1 topics' schemas unchanged, pinned by a frozen copy); store.ts
  `SPEC_KEYS` (store.ts:156) gains `pieces` and `rule`; calc2's `calcWords.methods` (paths.ts:97) names the numerical
  rules; the spine gains the topic.
- Rows: `tools/calc2-approx-test.cjs` - Stewart's 7.7 figures as hand fixtures (T_5, M_5, S_4 on 1/x over [1, 2]; T_4
  of x^2 over [0, 2] is 2.75), right at 4 decimal places, the exact integral 'wrong', the other rule's value 'wrong', S_10
  refused as degenerate; the leak rows; the reader round trip; a stubbed set.
- Kill: the left-Riemann trapezoid (above).

**M3b-3c. The limit of a sequence** (M; row 42; shape (i); topic `calc2-sequences`, Stewart 11.1 / OpenStax 5.1)
- Goal: `sequence-limit` in calc2.ts with the alias guard; calc-expr.ts gets the printer's variable (the `tex()` x case)
  and a plain printer, both additive; the reader renames a lone n. No `n` word, no `!`.
- Rows: `tools/calc2-sequence-test.cjs` - fixtures n/(n+1) at 1, ln(n)/n at 0, (1+1/n)^n at e, (n^2+1)/(2n^2) at 1/2,
  2^n/n^3 at inf; cos(pi n), sin(pi n)+1 and (-1)^n refused; the printed n round trip; ln(n) not mangled; calc-expr-test
  12 unchanged.
- Kill: the alias guard dropped (above).

**M3b-3d. The convergence verdict** (L; row 43; shape (iii); topics `calc2-series` 11.2/5.2, `calc2-integral-test`
11.3/5.3, `calc2-comparison` 11.4/5.4, `calc2-alternating` 11.5/5.5, `calc2-ratio-root` 11.6/5.6, `calc2-series-strategy`
11.7, each on the families its test decides)
- Goal: the verdict kind of truth in calc2.ts (the answer reader, the exact match, the verdict leak rule); the five
  families; the conditional verdict line in mark.ts `calcPrompt` and explain.ts; the refused result keys.
- Rows: `tools/calc2-verdict-test.cjs` - hand fixtures per family from Stewart 11.2-11.6 (Σ 1/n diverges, Σ 1/n^2
  converges, Σ (-1)^(n-1)/n converges, Σ n/(n^2+1) diverges, Σ 1/2^n converges, Σ ((2n+3)/(3n+2))^n
  converges, Σ 2^n/n! converges (m = -1), Σ n!·2^n diverges (m = 1), Σ n^2(1/3)^n converges (m = 0)); for every convergent fixture, partial sums at 1e4 and 1e5 agree to the third figure (a sanity row, not
  the truth); the leak table (either verdict word leaks, the test's name does not); the reading prompt byte for byte on a
  sheet with no verdict item.
- Kill: the `p` and `rational` flips (above).
- Owed: the ∑ glyph on a real Fire TV.

**M3b-3e. The sum of a series** (M; row 44; shape (ii); on `calc2-series`)
- Rows: `tools/calc2-sum-test.cjs` - the geometric and telescoping fixtures with their partial-sum cross-checks (above).
- Kill: the 1/(q-p) factor, and the k index (above).

**M3b-3f. Improper integrals** (M; row 45; shape (iv) as three families; topic `calc2-improper`, Stewart 7.8 / OpenStax
3.7, after `calc2-approx`; `calc2-integral-test` gains it as a prerequisite)
- Rows: `tools/calc2-improper-test.cjs` - ∫_1^∞ 1/x^2 = 1, ∫_1^∞ 1/x diverges, ∫_0^1 1/sqrt(x) = 2, ∫_0^1 1/x diverges,
  ∫_0^∞ e^(-2x) = 1/2; an infinity answer counts as the verdict; Calculus 1's definite integral still refuses `b: 'inf'`.
- Kill: the tail-power flip and the 1/k (above).

**M3b-3g. Absolute or conditional** (S; row 46; optional, only if the App Master rules it in) - the alternating `p`
family's three-word verdict.

Not buildable, listed in MATH-COURSE-PATHS section 10 with the reason (the descope goes to the owner):
- a sequence or series term written freely in n;
- a sequence with no real extension ((-1)^n/n, n!/n^n);
- the sum of a series outside the two families;
- improper integrals of free integrands;
- power series (11.8-11.11).

## e. Batches

- **Batch 1 (this PR):** G1, E0, P1, P2, the decisions doc, this plan, Twin Card 1.0 vendored.
- **Batch 2:** P3, E1, R1, L1. **Batch 3:** M1, M4a, M4b, T1. **Batch 4:** L2, M2a, T2, P4.
- **Batch 5:** L3, M4c, T3, M2b. **Batch 6:** L4, P5, H1, M3a, T4, T5 (the first four run in that order). **Batch 7:** P6 first, before L5; then M5, L5, M3b. **Batch 8:** L6.

## f. Session protocol

- One branch per batch, one draft PR per batch; the owner merges. Commits are scoped (pathspec, never `-a`).
- Validation is stubbed in the cloud. Live engine checks (`/api/smoke?live=1`, a dev-server walk) are the owner's, at
  each batch's review.
- The cloud container runs as root, so `tools/maths-rules-test.cjs` "learners case 3" (a read-only file) cannot fail
  the write there. Run that suite on the owner's PC. Every other suite runs green in the cloud.
- **Stop and ask** when a slice needs an unanswered decision with no default, a kill criterion is hit, a learner's text
  would go anywhere new, or a Family behaviour would change beyond what its slice says.

## g. Kill criteria (approved approach, S5; the numbers are proposals for the owner to edit)

| Risk | Cheapest test | Result that drops or reshapes |
|---|---|---|
| The twin is a costume (T1) | the **simulated** probe (V2-O1): 8 synthetic writers with distinct measured styles, about 20 messages each, 3 trials; a held-out message and two drafts (twin, plain model) on the same subject and length; scored by the code style distance and a blind judge model | the twin's drafts are not closer to the writer than the plain model's in at least 6 of 8 writers, on both scores: T2-T5 are not built; the Workroom ships alone and the export becomes a "how you write" portrait. A simulated pass is recorded as simulated, never as proof with real people |
| A worked lesson teaches a wrong step (M1) | every example checked by code | any shown example code does not confirm: the lesson is withheld for that topic, never shown "mostly right" |
| The Cambridge claim (L1) | the coverage report | under 90% of A2 Key for Schools Speaking descriptors with at least one practice: no "mapped to Cambridge" wording anywhere |
| Collectibles reward volume (R1) | the invariant test | any collectible reachable without its latch: R1 does not ship |
| Graphs too slow or unreadable at ten feet (M4a) | a 60-plot render on the owner's PC; a capture at 1280 x 720 | over 50 ms a plot, or a curve under the 3 px stroke floor: fewer samples, then a static image |
| GCSE paper reading (M5) | 20 rendered marked papers | under 85% of items mapped to the right unit: typed entry of the paper's results instead of a photo |
| Adult role-play safety (L5) | the red-team (adult plan section g) | any explicit line, any minor reaching an adult scene, or coercion played as success: C4 does not ship |

## h. Owner decisions open

| # | Question | Recommendation | Built if unanswered | Blocks |
|---|---|---|---|---|
| V2-O1 | ~~The twin probe needs real writers~~ **Answered: simulated** (decisions section 7) | | | |
| V2-O2 | ~~KaTeX or the custom typesetter?~~ **Answered: KaTeX deferred to a concept until verified; custom typesetter extended** | | | |
| V2-O3 | ~~Mode Adult as Linga's confirmation?~~ **Answered: yes** (built in batch 2) | | | |
| V2-O4 | Collectible art: SVG drawn in each app's language, or generated images? | SVG (ten-foot crisp, no assets to host) | SVG | R1 |
| V2-O5 | Whole-piece reading: one call per paragraph, or one call per piece? | per paragraph (verdicts stay anchored; a failure loses one paragraph); measure the time | per paragraph | E1 |
| V2-O6 | GCSE board | Pearson Edexcel 1MA1 (S2) | Edexcel | M2a |
| V2-O7 | ~~Who sees adult-audience scenes, age or mode?~~ **Answered 2026-10-08: mode decides.** One `adultContent()` in `rules/mode.ts`, which every audience decision calls: `curriculum.ts:75` audienceAllowed, the tutor's "an adult" at `conversation.ts:68`, and `cambridge.ts:101`. Family mode hides adult-audience scenes at any age. Built as P6 before L5; L5's red-team tests against it. **Built as P6 (c5a6e081).** | | | P6, L5 |

## i. Stance check

Unchanged from the adult plan section i, with three changes. Rewards are collectibles (D3 reversed; never points or
printed counts). The adult Math stance is the desk's own CX, not Field Work. The twin's purpose is export (Twin Card),
and in-app drafts are proof only.

## j. Session log

Entry format: `### <date> · <batch> · <slice ids> · <branch> <commit>`, then `Gate:`, `Surprises:`, `Next:`.

### 2026-10-07 · batch 1 · G1 E0 P1 P2 · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean. Every suite green when run one by one, except `maths-rules-test` "learners case 3", which
fails only as root (a read-only file is still writable for root) and is unchanged by this batch. New suites:
`tools/adult-rules-test.cjs` (11 tests, a 66-row keyword table), `tools/texts-rules-test.cjs` (7).
Surprises: the A5 gate first ran before the age was cleared on a type change, so a drafted Adult survived a switch to a
school type; the new test caught it, and the gate now runs last. `mode-rules-test` rows that pinned "adult is never
honoured" were revised on purpose. The essay-on-a-learner-change leak (adult plan finding 6) was already fixed on
2026-10-05 and is now pinned again in the texts suite.
Next: batch 2 (P3, E1, R1, L1). Owner: V2-O1 to V2-O6 (defaults stand if not answered).

### 2026-10-07 · batch 2 · V2-O3 P3 E1 R1 L1 (+ two layout fixes) · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean, `next build` succeeds. Every suite is green when run one by one, except `maths-rules-test`
"learners case 3" (root-only, as in batch 1). New suites: `essay-piece-test` (7), `collect-rules-test` (5),
`cambridge-rules-test` (3); `texts-rules-test` gained the notice rows, and `adult-rules-test` gained V2-O3 and the Mode-row
rows.
Captures: for the first time, a dev server with a scratch `DESK_DATA_DIR` and Playwright from `tools/node_modules`, at
1920 x 1080 and 1280 x 720. The essay piece was captured mid-reading, with a stand-in `CLAUDE_BIN` that answers fixed
verdicts and holds paragraph 2 back; no model was called.
Surprises: the profile caption ran into Save/Back on every profile, a problem from before this batch (on-air pins
`.actions` to the bottom); fixed by putting them in the flow. The Mode row now shows only where there is a choice. The
first cabinet layout overflowed four-across, so it is now two rows. Cambridge coverage at skill level reads high (A2 Key
94% at 12) while two real gaps remain for children (narrating the past, feelings). The claim stays off until a person
verifies the table.
Next: batch 3 (M1 lessons, M4a graphs, M4b typesetting, T1 the simulated twin probe). Owner: nothing blocking.

### 2026-10-07 · batch 3 · M1 M4a M4b T1 · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean, `next build` succeeds. Every suite is green when run one by one, except `maths-rules-test`
"learners case 3" (root-only, as before). New suites: `worked-rules-test` (7, covering 14,000+ generated items),
`plot-rules-test` (5), `style-rules-test` (5, including the probe's stub run); `maths-type-test` gained three M4b rows.
Captures: the worked lesson at 1920 x 1080 and 1280 x 720 on the dev server (stand-in `CLAUDE_BIN`). Graphs and tables
were rendered statically and looked at.
Surprises: the worked answers first came out as "156/5 litres", "128,0" and "£70.2". They now follow the question's form:
decimals where it speaks in decimals, units kept, money to the cent, a decimal comma in cz/de. Measured over 19,200 items,
every answer `check` confirms. Long area questions overran the paper; they now wrap and use a smaller face. M4b retired a
declared degrade: Calculus c06-q1's TeX renders now, re-declared in the ratchet. Pins revised openly: tv-keys case 3, the
Math screen list, and the thinking-off allowlist (lib/desk/worked.ts, whose idea is code-checked).
Next: batch 4 (L2 Speaking practice, M2a the GCSE Foundation map, T2 the Workroom for messages, P4 the PC drop page). The
T1 probe's live run waits on the owner's PC; T2 is built behind its result.

### 2026-10-07 · batch 4 · P4 T2 T5-lite L2 M2a · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean, `next build` succeeds. Every suite is green when run one by one, except `maths-rules-test`
"learners case 3" (root-only, as before). New suites: `docx-rules-test` (4: .docx built in memory, the zip-bomb cap, the
diff), `twin-rules-test` (7: the portrait, the card checked against the vendored schema with a small validator, the
spec's own examples reproduced, the routes, the keys), `gcse-rules-test` (4); `cambridge-rules-test` gained the L2 case and
`texts-rules-test` the title rule.
Captures: the whole twin flow on the dev server (stand-in `CLAUDE_BIN`): an adult profile, `/drop` joined, four messages
kept, the twin born, the card downloaded with a valid header, the Workroom on the TV at 1920 x 1080.
Deviation, deliberate: T2 was built before the T1 probe's live pass, and a slice of T5 (the card export) was pulled
forward. The reason is the owner's ask for a twin to try after batch 4. If the live probe fails its kill criterion, the
Workroom and the export stay; T3 and T4 (Sittings, Spot yourself) are what stop.
Surprises: the twin suite found a curtain leak from batch 2. An untitled piece took its first line as its title, and
titles show on the TV, so a chat message's title was its own text. Derived titles are now a heading or "Untitled
<format>". The docx reader dropped tabs and line breaks (fixed). The vendored schema allows exemplars up to 8,000
characters; the 500 cap is the renderer's (RENDERER.md) and is ours too. L2 closes the two children's gaps L1 found
(past events, feelings) at age 12. The claim stays off: unverified. GCSE: 19 of 86 Foundation statements are touched by
the school path; probability and most geometry are gaps, for M2b.
Pins revised openly: tv-keys "essay 1" (the Workroom is a fifth Essay Master screen), the L1 "gap for L2 to fill" row
(now filled), and linga's school-situation helper (Speaking practice is school-audience too, with its own suite).
Next: batch 5 (L3 pitch a scene and Cut, M4c multi-step problems, T3 habit detectors, M2b the first GCSE units). Owner:
the merge and the hands-on twin test (desk/README "Trying the twin"); the T1 probe's live run on the owner's PC.

### 2026-10-07 · batch 5 · L3 · autopilot/accepted-idea-delivery-9d230b69 aa5ac64d
Built locally on main per the owner's 2026-10-07 evening ruling: batch 5 one slice per run in table order (L3, M4c, T3,
M2b), each merged into local main through the gate; no PR, nothing pushed. Commits: 6a12bd2a (the card), d29111c9 (the
pitch, server), 83445c98 (the pitch, phone and TV), c3649e60 (notes.ts and Cut in the turn table), 123ea27c (Cut and the
recap tape), aa5ac64d (the company sim).
Gate: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit --incremental false` clean. New rows:
`adult-rules-test` the L3 pitch table (15 rows) and four pitch command rows; `linga-rules-test` pitch cases 1-5, notes
cases 1-3, cut cases 1-6. No existing assertion changed. `tools/linga-company-sim.cjs` ran once, `--stub` only: 20 of
20 scenes played through Cut.
Surprises: plan-add's `audienceOf(asked, label) ?? "adult"` (check.ts) cannot be reached by a never-list ask, which is
refused before the call; the pitch refuses on null at both gates instead of carrying it as adult. The shaping call needed
thinking off, and the thinking allowlist pins thinking:false to conversation.ts, so check.ts exports the request
(`pitchAsk`) and conversation.ts makes the call. The tape has no style of its own: `design/linga.css` was outside this
slice, so it borrows the topics' row of doors.
Owed to the owner's batch review: the TV captures of `linga-scenes` with a pitched card and of the Cut recap's tape
(1920 x 1080, 1280 x 720), the phone's pitch field at 390 px, a tape style in `design/linga.css` if the capture asks for
one, and the company sim's live run read by a person (counts into this log).
Next: M4c (row 18), then T3, then M2b, one slice per run.

### 2026-10-07 · batch 5 · M4c · autopilot/accepted-idea-delivery-857aadd8 1e33a656
Built locally on main per the owner's 2026-10-07 evening ruling: batch 5 one slice per run in table order (L3 done, M4c now,
then T3, M2b), each merged into local main through the gate; no PR, nothing pushed. Commits: 92004a98 (the card), 1a00ec08
(chain.ts, the 100-chain fixture, the tagger), aaaee240 (the pen on a wrong Calculus item, server), 1e33a656 (the paper's
ticks, DESIGN-MATH-BUDDY and STUDY-DESK-SCREENS).
Chain counts (tools/chain-rules-test.cjs, the kill test): clean chains rung 0 of 50; planted slips rung at their own line
50 of 50, left null 0, rung at another line 0; slowest chain 0.13 ms (best of three). The kill criterion passed; no tag was
narrowed. The bounds-swapped slip has no chain expression (it is a value of F at both ends) and is not in the 50.
Gate: `cd desk && npm run test:rules` green; `tsc --noEmit --incremental false` clean. New rows: chain-rules-test 9 (fixture,
clean, slips, null cases, rounding, tagger 4); maths-judge-test M4c-1 to M4c-3; maths-type-test M4c. No existing assertion changed.
The tagger reads: derivative, derivative-at, evaluate, antiderivative (F(x) = ..., the integral sign), definite integral
(an F line, no +C), limit (lim x->a, at the spec's own point) and critical-point (f'(x) = ..., x = c). A bare expression, a
two-sided equation, a second derivative or a limit at another point is null. A line in words is skipped: the next line
follows the last line that asserted something.
Owed to the owner's batch review: TV captures of a ticked and penned Calculus paper at 1920 x 1080 and 1280 x 720.
Next: T3 (row 19), then M2b.
### 2026-10-08 · batch 5 · T3 · autopilot/accepted-idea-delivery-23b57e2b 79da4106
Built locally on main per the owner's 2026-10-07 evening ruling: batch 5 one slice per run in table order (L3 and M4c done,
T3 now, then M2b), each merged into local main through the gate; no PR, nothing pushed. Commits: 056e7019 (the T3 card),
267694f5 (tools/habits-fixtures.cjs alone, before any detector), 79da4106 (habits.ts, SHIPPED, openHabits, the suite and its
rows, the package.json append).
Precision table (tools/habits-rules-test.cjs; 16 planted and 16 clean rows a detector, 192 in all):
| detector | found at its sentence | missed | found at another sentence | clean flagged |
| vague-opener | 16 | 0 | 0 | 0 |
| hedge-stack | 16 | 0 | 0 | 0 |
| repeated-opener | 12 | 4 | 0 | 0 |
| long-run | 16 | 0 | 0 | 0 |
| filler | 16 | 0 | 0 | 0 |
| two-claims | 13 | 3 | 0 | 0 |
SHIPPED: all six. Withheld: none. No fixture row was changed after its commit; the detectors were fixed, never the rows.
Caveats, stated rather than hidden: the rows are the author's own, so zero false positives is zero on this fixture, not a
proof; the fixture is small. The 7 misses: the English-only guard (under 15% common function words reads as not English)
silences terse texts such as "Dogs bark. Cats purr. Dogs run." and "Homework should be banned. ..." (4 repeated-opener, and
2 two-claims); "Tax is too high" has no stance word. two-claims is NOT the card's plain "two claims by the first-pass roles":
that rule tags every non-link, non-evidence sentence a claim, so it would flag "We went to the museum. The tickets were
free." The shipped rule also asks for a statement (no question) with a stance word (should, must, better, wrong, ...). It is
the narrowest of the six and the likeliest to miss in real prose. long-run reads no band under 20 sentences or without one.
Nothing is on screen (no route, store, event or card constraints), so no capture is owed. T3 is built ahead of the T1
probe's live pass, like T2; the batch 4 entry names T3 among the slices that stop if that pass fails, and the adult plan's
kill row keeps D1-D5 either way.
Gate: `cd desk && npm run test:rules` green (habits-rules-test 12 rows: fixture, precision table, SHIPPED, hit shape, English
only, long-run band, openHabits 5, detectAll); `tsc --noEmit --incremental false` clean. No existing assertion changed.
Next: M2b (row 20).

### 2026-10-08 · batch 5 · M2b · autopilot/accepted-idea-delivery-660977f0
Built locally on main per the owner's 2026-10-07 evening ruling: batch 5 one slice per run in table order (L3, M4c and T3
done, M2b now, the last), merged into local main through the gate; no PR, nothing pushed. Commits: f0f59399 (the card), 79777e2a
(U1 Pythagoras' theorem, not yet on the path), 510759b6 (U2 the probability of an event), 1206a4ca (tools/gcse-units-test.cjs, the
sweep, appended to test:rules), 667102a3 (the path grows to 17 topics, the pins, three docs).
Sweep table (tools/gcse-units-test.cjs; seeds 1..500, tiers 1 and 2, systems uk us cz de; counts by the sweep's own integer
arithmetic; 1000 specs a unit and 4000 worked answers a unit):
| unit | not well formed | not fair | worked answer not right | slips, reachable / detected |
| pythagoras | 0 | 0 | 0 of 4000 | pyth-sides-added 1000/1000, pyth-no-root 1000/1000, pyth-squares-added 500/500 |
| probability | 0 | 0 | 0 of 4000 | prob-count-alone 833/833, prob-part-over-rest 833/833, prob-one-over-colours 833/833, prob-own 333/333 |
Both units shipped (neither was killed). The counts were zero at the first run because the generators draw again for the
conditions the sweep counts (an item whose slips are not all reachable is never drawn); controls in the same file prove the
counts can fail. Reachable is 1000 of 1000 for the first two Pythagoras slips and 500 of 500 for the third (tier 2 only), 833 of
1000 for probability's three bag slips (tier 1 and the NOT and either-of-two kinds), 333 for the fourth (the NOT kind and a stated
probability's own).
gcse-coverage before and after (node ../tools/gcse-coverage.cjs): 19 of 86 (22%) became 23 of 86 (27%), VERIFIED=false. By
area: Number 6 of 16 and 6 of 16; Algebra 4 of 21 and 4 of 21; Ratio, proportion and rates of change 6 of 15 and 6 of 15; Geometry and
measures 2 of 21 became 3 of 21 (G20, the Pythagoras part only); Probability 0 of 8 became 3 of 8 (P3, P4, P7); Statistics 1 of
5 and 1 of 5. Still gaps in probability: P1, P2, P5, P6, P8 (P9 is higher tier). G6 also names Pythagoras' theorem ("use angle
and shape facts, including Pythagoras") and is NOT claimed: the unit practises no angle facts (a question for the owner).
Deviations and choices, stated: (1) tier 1 Pythagoras uses triples with the longest side at most 50 (tier 2 up to 100): easier
numbers first, still inside the card's "at most 100". (2) The third Pythagoras slip, "squares added instead of subtracted", has
no exact value when the root is taken (it is irrational on every item), so only its unrooted value, c squared plus b squared, is
listed; the rooted version is dropped. (3) typeset.ts changed: a hyphen between two English words ("right-angled") stays a
hyphen; it was set as a minus sign. (4) The bag and Pythagoras sentences are 80 to 110 characters: the single-line fit
estimate is 19 px for Pythagoras and 17 px for probability (the earlier rows hold 35 px or more), so the sheet wraps them at
its 28 px floor; the owner's captures decide whether to shorten them. (5) Probability is held later than usual in three systems
(US 8, UK 9, DE 8; the comment on the unit says so); Pythagoras in none. Years are from memory and a teacher must check them.
(6) Strand: both units are in "Geometry and data", a second bar after Equations (seven bars; three held at 189 px by their
labels; "Decimals and percent" now wraps to two lines); rulerRows.ts is untouched.
Pins revised openly, old -> new (no verdict of the fifteen existing units changed):
- school-rules-test: the 'W7 SLIPS' unit list 12 units -> 14 (+ pythagoras, probability); 13 new rows.
- maths-rules-test: path ids 15 -> 17; nextTopic after every old topic: undefined -> pythagoras, then probability, then undefined (+ a missing-area row); expectedIndex uk 13 and us 13: 15 -> 17 (added de 13 = 17, cz 13 = 16, cz 14 = 17).
- tv-keys-test: Get ready for school stops 15 -> 17.
- maths-tv-test: path ids 15 -> 17; 'One of 15 topics secure' -> 'One of 17'; Get ready for school groups and cards 15 -> 17 (the last strand group gains the two units), last card 14 -> 16; the strip segments 6 -> 7.
- maths-paths-test: school topics 15 -> 17, unique ids 37 -> 39.
- maths-course-test: school stops 15 -> 17, Right presses 16 -> 18, last focus 14 -> 16; the last stop's Select event gains stay:true (probability has a generator, so Select writes its set and stays on Topics).
- maths-ruler-test: N 15 -> 17, strands 6 -> 7, span 111.7 -> 98.6 px.
- school-ruler-test: path ids 15 -> 17; the all-secure ruler index 14 -> 16; the 'last topic secure' row (linear-both-sides: nothing after, 14, 0) -> pythagoras, 15, 15 (+ two rows); Tonight bars 6 -> 7; de's tick pill no longer turned inward (15 of 17 is mid-strip; a uk 13-year-old at 17 is); 'One of 15' -> 'One of 17'; strip widths now the measured 370, 189, 369, 189, 185, 189, 185 px; 'Decimals and percent' two lines (was one in 425 px); step-up ink list +1; names matched HTML-escaped (the apostrophe); 'Two of 15' -> 'Two of 17'.
- school-practice-test: path ids 15 -> 17; the path blurb 'School maths from equivalent fractions to equations with brackets and x on both sides.' -> '... from equivalent fractions through equations to Pythagoras' theorem and the probability of an event.'; 1 new row.
- week-rules-test: DO_IT for 15 school topics -> 17.
- maths-aim-test: units with a generator 12 -> 14, slips 46 -> 53 (all show on a drawn spec). maths-like-test: units 12 -> 14.
- gcse-rules-test: touched 19 -> 23, share bound 0.25 -> 0.3, probability touched 0 -> 3 (added G20, P4 and the probability gaps).
New rows: school-rules-test 'M2b SPELLINGS Pythagoras' (81 written answers), 'M2b LEAKS Pythagoras' (23 leaks, 32 legit), 'M2b question and wellFormed Pythagoras',
'M2b GENERATOR Pythagoras' (seeds 1..300), 'M2b Pythagoras' (withheld line, slips, slipValue), 'M2b PURITY Pythagoras', 'M2b typeset' (the hyphen);
'M2b SPELLINGS probability' (133), 'M2b LEAKS probability' (34 leaks, 32 legit), 'M2b question and wellFormed probability' (28 bad specs, 13
unreadable tasks), 'M2b GENERATOR probability', 'M2b probability', 'M2b PURITY probability'; school-practice-test 'M2b 1' (the path, years,
prerequisites, worked method, act, sets, no exam named); gcse-units-test 'controls', 'sweep pythagoras', 'sweep probability', 'the table'.
Owed to the owner's batch 5 review (captures, not made here): Topics with the new units, Tonight's ruler (seven bars), a Pythagoras
paper and a probability paper, each at 1920 x 1080 and 1280 x 720; and a maths teacher's read of the two years, the three slip
lines per unit, the worked methods and the two acts.
Gate: `cd desk && npm run test:rules` green; `tsc --noEmit --incremental false` clean. This closes batch 5 (L3, M4c, T3, M2b).
Next: the owner's batch 5 review, then batch 6 (L4, T4, T5, M3a). M5 (a failed paper read against the map) reads these units on
School maths; whether they stay there or move to a path of their own is a question for the owner.

### 2026-10-08 · batch 6 · L4 · autopilot/accepted-idea-delivery-9ca5af6e
Built locally on main per the owner's 2026-10-08 10:05 ruling: batch 6 one slice per run through the gate, L4 first, then
M3a; merged into local main through the gate; no PR, nothing pushed. T4 and the full T5 wait for the T1 live probe.
Commits: 6d90c429 (the card; the duplicate M2b card removed), fc9a1433 (take.ts heldOf and forkOf, the table), 23e11639
(the Take record, the take-two state, take-two and take-end in the turn table and conversation.ts), b2870aab (the view,
LingaTV, LingaPhone, DESIGN-LINGA.md, STUDY-DESK-SCREENS.md), and this entry.
Gate: `cd desk && npm run test:rules` green at every commit; `tsc --noEmit --incremental false` clean. No existing
assertion changed; the thinking:false caller list (`linga-rules-test.cjs`, thinking case 2) is unchanged: every call of a
take is in conversation.ts and take.ts is pure. New rows: `linga-rules-test` take cases 1-8 (1 the heldOf table, 2 forkOf,
3 turnState/accepts/refusal for take-two and take-end in every state, 4 the full stubbed run, 5 refusals inside a take and
Leave over a reply in flight, 6 the recap's marks and branch, 7 the phone's Take Two per note, 8 the take on linga-talk);
`adult-rules-test` 'L4: Take Two in Family mode is refused ...' (a 13-year-old, a 16-year-old, an adult who chose Family).
heldOf table (41 rows; held / not held / null): form 6 / 6 / 6, word 5 / 6 / 3, meaning 3 / 0 / 3, register 0 / 0 / 3;
15 null in all. The parrot row: "Yesterday I booked a room, as you say. Yesterday I go to the bank." on the form note
"Yesterday I book" is not held. The full run: two calls for the take (one per cast turn, fast, thinking off, the replay
schema), none to start or end it; the learner record's english, the first take's turns and its cut notes deep-equal
before and after.
Choices, stated: (1) the names are `take-two` (action and state) and `take-end`; `replay` is untouched. (2) heldOf takes
a third, optional argument, the noted turn's text, because the form rule needs the noted sentence's time marker; it is
`heldOf(note, line, noted?)`. (3) A form note is decided by the tense rule with or without a better phrase; "a note with
no better phrase: null" is applied to word and meaning notes (a question below). (4) C1's "take turns stored as
supported" is replaced by the brief's rule: a take's lines never reach the evidence at all. (5) C1's `noteId` is `note`,
the index in `cut.notes` (notes have no id). (6) The take ends by itself after the second cast turn and lands on the
recap, so that last cast line is shown in the phone's transcript of the take while it runs but never spoken on the TV (a
question below). (7) Inside a take the help ladder is not offered either, and Leave over a reply in flight cancels the
reply and stays on the take; Back on the remote is Back to the notes. Leave outside a take is unchanged. (8)
`design/linga.css` is outside this slice: the struck quote is an `<s>`, the branch borrows the data line's style.
(9) phone-panel-test and linga-ui-test do not pin the Linga recap, so the UI rows are in linga-rules-test, read through
the uat surface (no stray, nothing unrendered).
Owed to the owner's batch 5+6 review: the TV take (the branch, a struck note and an open one) at 1920 x 1080 and 1280 x
720; the phone recap at 390 px; one live take on the real engine; a branch and struck-note style in `design/linga.css` if
the capture asks for one.
Next: M3a (row 24), one slice per run.

### 2026-10-08 · batch 6 · P5 · autopilot/accepted-idea-delivery-7596fca6
Built locally on main per the owner's 2026-10-08 ruling: one slice per run, merged through the gate, no PR, nothing pushed.
Order after L4: this guest fix, the test runner (H1), then M3a.
Commits: 85446973 (pairing.ts view(), desk-pairing-test.cjs), and this entry (rows 29-31, batch 6 and 7, V2-O7, the
review's rank-1 finding marked built).
What: view(s, 'guest') copied the whole Session and blanked a hand-written list, so essayPlan (the learner's dictated
sentences), worked and workroom reached a phone that had opened /phone without joining, by GET /api/session and by the
stream. Now `LOBBY` (viewer, pin, joined, phoneUrl, learner, subject, screen, updatedAt, draft) is copied, draft only
while the TV is on profile, and every other key takes its value from `GUEST_BLANK`, typed so tsc fails on a Session key in
neither. The tv and phone branches, guestMay, roleFrom, liveRole and the cookies are unchanged.
Moved out of the guest view: focus, view and timer (the unjoined page, page.tsx:377-410, reads none of them; its one read
of timer is the joined Tonight panel, :598), and essayPlan, worked, workroom. A guest now sees the blank for each (0, "band",
the 25-minute timer at rest).
Gate: `cd desk && npm run test:rules` green; `tsc --noEmit --incremental false` clean. No existing assertion changed.
New rows in desk-pairing-test.cjs: GUARD (P5) (Session's keys read from store.ts source, at least 40 found, essayPlan,
worked and workroom among them, each in exactly one of LOBBY and GUEST_BLANK); case 8 (a session with every key filled,
read as a guest by GET and by the stream: every non-LOBBY key deep-equals its GUEST_BLANK value, essayPlan, worked and
workroom absent by name); case 9 (a joined phone and the TV still receive essayPlan, worked and workroom). Kill test, not
committed: essayPlan removed from GUEST_BLANK failed "Session.essayPlan must be in exactly one of LOBBY and GUEST_BLANK
(pairing.ts)" and tsc TS1360. A guest's absent keys are deleted, not sent as undefined, because tv-sheet-test case 12
asserts `'away' in view(...)` is false.
Owed to the owner's batch 5+6 review: only a glance at the unjoined phone at 390 px.
Next: H1 (row 30), then M3a (row 24).

### 2026-10-08 · batch 6 · H1 · autopilot/accepted-idea-delivery-44200e26
Built locally on main per the owner's 2026-10-08 ruling: one slice per run, merged through the gate, no PR, nothing pushed.
Commits: b2c1fccf (the runner: `rulesSuites` in desk/package.json, tools/run-rules.cjs, tools/harness-rules-test.cjs), 664fb809
(tools/ts-load.cjs and its loader rows), 735dd0c2, 4c2bcfbe, 0669b708, 7c85a360, 7dbaa42c (the swap: 13, 13, 13, 13, 5 suites),
cf0170ed (the fallback), and this entry (row 30, the append rule, the review's rank-2 card marked built).
What: test:rules is `node ../tools/run-rules.cjs`. It runs the 64 suites of `rulesSuites` in list order, one at a time, each as
`node --test-reporter=tap <suite>`, and never stops at the first red one. A suite is green only when it exits 0 by itself and its
last TAP summary shows tests >= 1, fail 0, cancelled 0; a non-zero exit, a signal, a throw, no summary (an early process.exit(0)),
0 tests, a missing file and a timeout (RULES_SUITE_TIMEOUT_MS, 600000) are red. A missing, empty or duplicated list is refused
before anything runs. One table at the end: suite, verdict, tests, pass, fail, ms, why; then the totals and the wall time.
tools/ts-load.cjs is the one loader: the '@/' alias, .ts and .tsx hooks (fileName = the real file), transpile() through a disk cache
in os.tmpdir()/desk-ts-load (DESK_TS_CACHE_DIR, DESK_TS_CACHE=0), TypeScript required only on a miss. The 57 copies are gone.
Equivalence: the 63 old suites show identical tests and pass counts before and after (1067 tests, 1067 pass); harness-rules-test
is new, 9 rows for the runner at b2c1fccf and 15 with the six loader rows. Totals: 1076 before, 1082 after, 0 fail.
No suite changed because of the fileName change (maths-aim, maths-like, collect-rules, plot-rules all green, same counts).
Wall (test:rules, this machine, back to back): old && chain at 8a88b411 106 s (171 s on an earlier, busier run); the runner with
the old loaders 133 s (111 s without harness-rules-test, which spawns its own runs); the runner with ts-load, cache emptied 98 s,
warm 94 s. Sum of the suites' duration_ms 74 to 79 s after, 77 s before. The cache helps little cold because the first suite to
transpile school.ts fills it for the 38 others in the same run.
Left alone: the loader inside the child-process template of learners-save-test.cjs (lines 49-51; a separate node process); the six
suites without a loader; every tools file outside rulesSuites.
Finish run (autopilot/accepted-idea-delivery-7ed05d75, a re-dispatch on the kept branch, fast-forwarded from 503d967b): cf0170ed adds
the resolution fallback to tools/ts-load.cjs - desk/node_modules/typescript first; only if its package.json cannot be read,
require.resolve('typescript/package.json', { paths: [desk] }) and that package's folder; the cache key's version and the module ts()
requires both come from the folder found; still lazy; neither found prints the same message and exits 1. harness-rules-test gains 2
rows (fallback with a stub typescript under an os.mkdtemp folder, neither), 17 in all; the gate is 64 suites, 1084 tests (1082 + 2).
The proofs the first run owed, all on the final tree: (1) the old && chain from 8a88b411's package.json, run by hand from desk/, exit 0,
184 s wall (the machine was busy; the runner's own wall times are below). (2) Kill tests in the worktree only: a failing assertion
planted in maths-ruler-test (the middle of the list) and a top-level throw in school-ruler-test; test:rules exit 1, all 64 rows still
printed, table lines "maths-ruler-test.cjs RED 8 7 1 240 exit 1" and "school-ruler-test.cjs RED - - - 713 exit 7", totals
"62 green, 2 red; tests 1073, pass 1072, fail 1", "RED: maths-ruler-test.cjs (exit 1), school-ruler-test.cjs (exit 7)"; suites after
them (school-stretch, school-marking, calc-marking...) ran green; both files put back with git restore, git status --short clean.
(3) node tools/school-rules-test.cjs from the repo root, exit 0. (4) desk: npx tsc --noEmit --incremental false, exit 0. (5) Wall:
test:rules with DESK_TS_CACHE_DIR at a fresh folder 115 s (duration_ms sum 91.5 s), warm 85 s (sum 67.4 s), 1084 tests, 64 green;
the first-run tree before the fallback was 134 s (sum 109 s, 1082 tests). Wall times on this machine swing by 30 s with load.
App Master's rulings: (1) the first run was right to install nothing - the Director restored desk/node_modules; builders do not
create or remove worktrees. (2) The owed proofs are delivered by this run. (3) harness-rules-test's own ~22 s stays; no row is trimmed
(a trim would be a separate card if the wall time ever matters). (4) The loader inside learners-save-test's child-process template
stays; ts-load's extra options and jsxOptions exports stay.
Nothing is pushed.
Next: M3a (row 24).

### 2026-10-08 · batch 6 · M3a · autopilot/accepted-idea-delivery-e731d8c2
Built locally per the owner's 2026-10-08 08:41Z order (the guest fix, then the runner, then M3a), one slice per run through
the gate; no PR, nothing pushed. Commits: 3dc0693a (step 0, card 5 part b), f5d21d3a (the card), 61aca774 (calc-word.ts, the
three templates, the sweep, the chain's capital label), 309c52ee (partsFromQuestion, the hint over every part, the corpus table),
29e86cda (stem and part on PracticeItem, the read prompt), 3772c23b (the TV paper and the phone), 81924e24 (the set wired), and
this entry.
Sweep table (tools/calc-word-test.cjs, seeds 1..500; the story templates' answers checked twice, the template's own and the
sweep's own arithmetic):
| template | topic | drawn | not well formed | not fair | worked answers not right | stem numbers not drawn |
| sphere-rates | calc1-related-rates | 500 of 500 | 0 | 0 | 0 of 2000 | 0 |
| rectangle-perimeter | calc1-optimisation | 500 of 500 | 0 | 0 | 0 of 2000 | 0 |
| cubic-max-min | calc1-extrema | 500 of 500 | 0 | 0 | 0 of 1000 | 0 |
All three ship (none withheld). The counts were zero at the first run because a template draws again for every condition the
sweep counts; the controls in the same file prove each count can fail.
The corpus table (calc-word-test 'M3a corpus', printed and pinned): 31 questions, 13 read into a spec (the same 13 ids as before;
no spec changed), 0 into parts; 33 page lines 0 and 0; 64 TeX forms 0 and 0. c13-q1 is the multi-part phrasing, read and refused
whole: its maximum, 65, is at the end x = 5 (an extremum at an endpoint is not well formed). On [-3, 3] the same text reads.
Step 0, pins moved (old -> derived; NS = PATHS.school.topics.length, NC = PATHS.calc1.topics.length; the full list is in
3dc0693a's message): maths-paths 22 -> NC, 39 -> NS + NC; maths-course 22/21 -> NC/NC-1, 17/18/16 -> NS/NS+1/NS-1; maths-ruler 17
-> NS, 22 -> NC, the focus lists and the tick list from N, focus 21 -> N-1, the all-secure row from N; maths-tv the 22 totals and
'7 of 22' -> NC, 'One of 17' -> NS, 17/16 -> NS/NS-1; school-ruler 16 -> length-1, 'One of 17' and 'Two of 17' and the past-all
tick from the length; maths-rules expectedIndex past-all 17 -> NS; tv-keys 17 -> NS; week-rules 17 -> NS; calc-course 22 -> NC;
maths-calculus 22 -> NC. The two pins kept, in maths-paths-test: calc1 22 and school 17. The ruler span was already computed
from N (98.6 px was a comment). Gate before and after step 0: 64 suites green, 1084 tests.
Choices and deviations, stated: (1) chain.ts tagged a one-capital label (A = ..., F(x) = ...) an antiderivative on every shape,
so a right first line of a story's working rang false on a wrong part; it is an antiderivative only on the two integral shapes,
and elsewhere names the function as f(x) = does. Every existing chain row kept its result (fixture: clean chains rung 0 of 50,
slips at their own line 50, at another line 0). (2) calc-word-test sits just before harness-rules-test in rulesSuites, not after
it: harness-rules-test.cjs:97 pins itself last. (3) The practice route takes word: false (or 0) and then writes the model's set
alone. No screen sends it; the course walk's two practice posts do, so calc-course-test's assertions are unchanged. The default
(every screen's post) carries the word problem. (4) The word problem is the last question of its set, so the paper's numbers run
on (four items, then 5 with (a) and (b)). (5) A related-rates part's spec is the radius (or the area) as a function of the time
since the moment asked about, at 0: derivative-at stays the only shape on that topic. (6) The TV's card and tally name a part 5(b)
and 5a; the stored said line keeps its item number ('Number 6 is right.'), which the TV rewrites for display only (namedLine).
The phone's second-go label does the same. (7) A part whose function the stem does not print (the two stories) draws no graph;
the cubic keeps its graph. (8) A part's answer written with its unit does not read ('unsure'); each part line names its unit
instead of a new reading rule. (9) The Calculus read prompt lists the stem once and each part by its item number; a set with no
parts is asked byte for byte as before. explain.ts and memory.ts give the model a part with its stem.
Gate: `cd desk && npm run test:rules` green at every commit (65 suites, 1108 tests at 81924e24); `npx tsc --noEmit --incremental
false` clean at every code commit. New rows: calc-word-test (9 tests: controls, the draw's rules, three sweeps, the parts as
items, a right working rings nothing, the table, the corpus), chain-rules-test 'tagger (M3a)', calc-hint-test 'M3a',
calc-marking-test 'M3a 1-3', maths-judge-test 'M3a', maths-tv-test 'M3a 1-3', tv-sheet-test 'M3a', phone-panel-test 'M3a',
calc-practice-test 'M3a 1-4'. No existing assertion changed its meaning; path pins moved only in step 0.
Owed to the owner's batch 5+6 review (captures, not made here): the TV paper with a word problem on practice, sheet and walk at
1920 x 1080 and 1280 x 720 (the stem wraps in the 52 px print row; usePaper fits the paper), and the phone's part fields at 390 px;
a maths teacher's read of the three templates' wording and units; one live set on a word topic (the model's four single items
beside the parts).
Next: T4 and T5 wait for the T1 live probe; batch 7 starts with P6.

App Master's rulings on M3a's questions (2026-10-08):
(1) The chain tagger change stands. A one-capital label is an antiderivative only on antiderivative and definite-integral; on
every other shape it names the function. Reason: every existing chain row kept its result (clean chains rung 0 of 50, slips at
their own line 50).
(2) The append rule changes and the harness pin stays. A new suite goes just before harness-rules-test.cjs, which stays last
because it spawns runs of its own. Section d's sentence is changed to say so.
(3) word: false stays, as a test seam for the course walk only. No screen may send it, and the default carries the word problem.
(4) No unit-stripping reading rule now. Each part line names its unit. The owner's live set on a word topic and a teacher's read
decide whether learners write units; if they do, that is a reading card of its own.
(5) A part is named as the paper names it wherever the learner sees or hears it. M3a-2 builds this (row 32).
(6) The captures, the teacher's read and one live set stay owed to the owner's batch 5+6 review.

### 2026-10-08 · batch 6 · M3a-2 · autopilot/accepted-idea-delivery-fd1b53c7
Built locally; the App Master's ruling (5) on M3a's questions. A part is named as the paper names it (5(b)) on every exit the
learner sees or hears; the stored said and reply, the attempt record, the read prompt, the numbering n and the verdicts are
unchanged, and a single item's lines are byte for byte as before.
What changed, by exit: calc-word.ts `deskLine(items, i, line)` (namedLine + itemName) is the one rewrite. (1) The TV voice:
the speak effect's choice of line moved out of app/tv/page.tsx into the pure `spokenLine(session)` in lib/desk/spoken.ts; on walk
it returns deskLine of items[walkIx].said, every other branch returns what it returned. (2) rules/maths.ts `secondProblem(item,
name)` names the part in its three sentences; app/api/second/route.ts passes itemName. (3) lib/desk/explain.ts `explainItem(...,
name)` returns `shown` (the reply, whether the model's or the said/ASK fallback, through namedLine) beside the stored `reply`;
app/api/explain/route.ts passes itemName and answers with `shown` (the phone shows it as it comes; the job's done line too).
The TV card (MathsTV namedLine at the card) already used namedLine and itemName and is unchanged. docs/STUDY-DESK-SCREENS.md says so.
New rows: tools/part-names-test.cjs (4 tests: the voice on part (b) equals the card's line, has 5(b), not Number 6; single item
and hint/sentence/forensic/break/no-set unchanged; secondProblem in its three states on a part and on a single item; explain
reply from a model reply and from the said/ASK fallback, stored reply untouched), in rulesSuites just before harness-rules-test.
Kill test (not committed): spokenLine's walk branch returning the stored said made test 1 red; restored, green.
Gate: `cd desk && npm run test:rules` green (66 suites, 1112 tests); `npx tsc --noEmit --incremental false` clean.
Not covered: the routes' wiring is read, not driven (the new rows call the pure functions; no marked set is seeded through
/api/second or /api/explain); no screenshot.

### 2026-10-08 · batch 6 · L4b · autopilot/accepted-idea-delivery-d5bb5783

What changed, by file: lib/english/take.ts adds `takeSpent(take)` (partner lines > TAKE_CAST_TURNS). conversation.ts takeTurn no
longer sets endedAt or goes to linga-recap after the second cast turn: it stores turns and held and stays on linga-talk, so the new
partner line changes the spoken key and plays. turn.ts: a spent take stays in state take-two (no new TurnState); accepts refuses
'turn' and 'capture' on it by a data guard (like hasReply), 'repeat' and 'take-end' stay; refusal() says "That was the take. Go
back to the notes." (exported SPENT); the server's existing accepts guard gives it as a 409 with no model call; stopping the
microphone is still never refused. view.ts: on a spent take the caption is "That was the take. Go back to the notes when you are
ready.", captionTag "Take done", the action Back to the notes; the spoken line is the cast's last line, not blocked, audible.
english/LingaPhone.tsx: the TakePanel's ReplyBox is ready only while accepts(c,'turn'). take-end, heldOf, forkOf, TAKE_CAST_TURNS,
the 2 calls, prompts, schemas and the recap are unchanged.
Rows (tools/linga-rules-test.cjs, no new suite): take case 4's tail changed to the new rule (endedAt undefined, take-two, linga-talk,
spoken 'Cast 2. And then?' not blocked and audible, a third turn and capture 409 with the sentence and the call count unmoved, repeat
bumps audioNonce, then take-end sets endedAt and lands on the recap with calls still before+2); take case 3 gains the spent rows
(state, accepts per action, refusal); new take case 9 (hero.said, caption, captionTag, Back to the notes, answer null, repeat
offered, surface has no strays).
Kill tests (not committed): (a) endedAt and linga-recap put back at the second cast turn: take case 4 red. (b) the spent guard
removed from accepts: take cases 3, 4 and 9 red. Both restored.
Gate: `cd desk && npm run test:rules` green; `npx tsc --noEmit --incremental false` clean. Not covered: no screenshot; the TV audio
is not device-played.

### 2026-10-08 · batch 7 · P6 · autopilot/accepted-idea-delivery-b0c53a6f
One `adultContent()` in `rules/mode.ts`; mode decides adult content (row 31, review card 4, V2-O7). Built locally, nothing pushed.
Commits: c5a6e081 (code and tests), and this entry.
What changed, by file:
- `rules/mode.ts`: `adultContent(p, prefs?)` = `modeOf(p, prefs) === "adult"`, with the V2-O7 JSDoc. The paragraph saying audienceAllowed is not re-expressed through modeOf is rewritten: it now is, through adultContent. `isAdult` stays the age fact modeOf and adultAllowed read. No second mode concept, no new stored field.
- `curriculum.ts`: audienceAllowed's 'adult' row calls adultContent; 'school' and 'older' unchanged; eligibleScenes and the plan filter inherit.
- `conversation.ts`: tutorSystem's "The learner is ..." and the never-line read adultContent. An 18+ learner in Family mode is told "an adult in Family mode; keep every exchange appropriate for a family audience", and the never-line opens "This desk is in Family mode." then the unchanged sentence. Under 18 ("This learner is not an adult. Never propose ...") and Adult mode are byte-identical to before. pitchAsk takes adultContent (value unchanged: pitch is refused outside Adult mode).
- `check.ts`: ctx.adult reads adultContent; who() gives a Family-mode adult "an adult in Family mode; keep everything appropriate for a family audience" (stored mode family and adultAllowed), never "age N" alone. Under 18 and Adult mode unchanged.
- `cambridge.ts`: audiencesAt(age) goes through audienceAllowed with the synthetic profile (other at 18+, high-school 15-17, elementary under 15, no stored mode, default preferences); output equal for ages 0..99, coverage numbers did not move.
Every other isAdult caller in desk/src: `rules/mode.ts` modeOf and adultContent's inputs (age fact); `curriculum.ts` re-export (age fact); `conversation.ts` tutorSystem, chooses only which Family wording an adultContent-false learner gets, 18+ or not (age fact); `tv/keys.ts` isAdultHere (feature gate, reads modeOf, untouched). No content decision calls isAdult directly any more.
Revised pin (M2b, openly): mode-rules-test 'mode ${mode} is not read by audienceAllowed'. OLD: a stored mode 'family' or 'adult' on a 25-year-old 'other' answered every audience as the frozen unset profile. NEW: stored 'adult' still equals the frozen value; stored 'family' equals it except the 'adult' audience, which is refused. The 240-row parity rows are unchanged (no stored mode).
New rows: mode-rules-test (stored Family at 25; adultContent = modeOf === adult over the grids and false under 18 for every stored mode), adult-rules-test (an adult who chose Family: no date scene, start 'date' 403 with no model call, tutor prompt has the Family clause and the never-line and no "not an adult", level check has the family line, Adult mode brings the date scene back), cambridge-rules-test (audiencesAt 0..99 equals the frozen table). linga-rules-test ~207-215 unchanged and green.
Kill tests (not committed): (a) adultContent returns isAdult: the mode-rules stored-Family and adultContent rows and the adult-rules Family 18+ row red. (b) isAdult back in audienceAllowed's adult row: the mode-rules stored-Family row and the adult-rules Family 18+ row red. Both restored. In both the 240-row parity test also reads red, because the revised stored-mode rows sit inside it.
Note: a profile of type "other" stores no age, so the Family fixtures there are 18+ by the type, through the adult box.
Gate: `cd desk && npm run test:rules` green (66 suites, 1117 tests); `npx tsc --noEmit --incremental false` clean. Not covered: no screenshot; no device run.

### 2026-10-08 · batch 7 · M5a · autopilot/accepted-idea-delivery-35ac7024
M5's step 0 and its first slice (rows 25 and 34; the M5 card). Built locally, nothing pushed. Commits: be9d2faf (step 0: the M5
card cut into M5a, M5b and M5c, the App Master's four rulings, rows 34-36, row 33's commits), 45632b1b (code and tests), and this entry.
What changed, by file:
- `lib/rules/recovery.ts` (new, pure: gcse.ts STATEMENTS and gcseClaimAllowed, paths.ts topicsOf; no store, engine, fs or model).
  `cleanPaper(raw)` drops a row with a reason (`not-an-item`, `no-label`, `label-too-long`, `label-names-the-board`,
  `marks-not-whole`, `out-of-not-whole`, `out-of-under-one`, `out-of-over-cap`, `marks-under-zero`, `marks-over-out-of`,
  `repeated-label`, `too-many-items`, `over-paper-total`), each with its row and a plain why; keeps only codes found in STATEMENTS
  (trimmed, duplicates collapsed, the first 3), reports every other in `droppedCodes`; an item with no code left is in `unmapped`.
  `recovery(raw)` returns the clean paper, `topics` (id, name, lost, items, codes), `notOnDesk` (code, can, lost, items,
  foundation) and `totals` (marks, outOf, lost; `unmapped` included).
- `tools/recovery-rules-test.cjs` (new), in `rulesSuites` just before `harness-rules-test.cjs`; `desk/package.json`.
The caps and their source (JSDoc, unverified as gcse.ts is): the 1MA1 Foundation assessment overview, three papers of 80 marks
each. PAPER_MARKS 80; MAX_OUT_OF 6 (the host believes no Foundation question or part is worth more than 5; 6 so a low guess never
drops a real item); MAX_ITEMS 80 (every item is worth at least 1 mark); MAX_LABEL 12 characters.
Choices, stated: (1) a topic's `lost` sums the distinct items behind it: an item reaching one topic through two of its codes counts
once there, while each statement takes the item's lost marks in full (so the statements' sums can exceed the paper's loss; the
JSDoc says so). (2) The order: a topic is placed once its listed prerequisites (followed through) are; of the free topics the
heaviest goes next, a topic weighing its own lost marks or the most lost by any listed topic that needs it, then its own lost
marks, then path order. So a prerequisite is pulled forward by the heaviest topic that needs it, and unrelated topics go by lost
marks. (3) A label is compared to earlier kept labels without case or spaces ('5(b)', '5 (B)'); a repeat is dropped, the first
kept. (4) A label or a code naming the board (/gcse|1ma1|edexcel/i) is never echoed while the claim is off: the label's row is
dropped (`label-names-the-board`), and a dropped label or code that cannot be shown is "" (the row number stays). (5) Topics are the
school path's: a `touches` id not on it would read as no desk topic, as gcseCoverage() does.
Rows (8): validation, every drop reason and the caps (80 one-mark items, the 81st dropped; 14 six-mark items, the 14th past 80
dropped and a 2-mark one after it kept); unknown codes ('n2', 'N 2', 'N99') dropped, not guessed, only-unknown items in `unmapped`
with their lost marks in the total; a full-marks item adds nothing, two codes count against both; three statements on ratio-share
give one entry with the sum; the prerequisite rule (frac-equivalent before unit-rate through ratio-share, area before pythagoras,
dec-convert pulled forward by pct-of-amount; unrelated topics by lost marks, ties by path order; a 400-paper sweep never puts a
topic before a listed prerequisite); notOnDesk (A13 flagged foundation false, P8 and N3 with their can text, no gap code on a topic,
every higher-only statement flagged); the sweep over the 86 Foundation statements (topics equal gcseCoverage().topics, touched 23
and gaps 63 in its order); no string /GCSE|1MA1|Edexcel/i over 300 noisy papers and every statement.
Kill tests (not committed, run on 45632b1b): (a) the prerequisite rule dropped (sort by lost marks only, ties by path order): the
prerequisite row red. (b) cleanPaper keeping an unknown code: the unknown-code validation row red, and the board row red too (an
unknown code reaches recovery and throws). Both restored with git restore; the suite green after.
Gate: `cd desk && npm run test:rules` green (67 suites, 1125 tests); `npx tsc --noEmit --incremental false` clean. Not covered: no
screen, route or learner-record field (M5b); the photo path and its probe (M5c); the caps are not checked against the specification.
Next: M5b (row 35), then L5 and M3b; M5c's live run is the owner's.

### 2026-10-08 · batch 7 · M5b · autopilot/accepted-idea-delivery-772f5628
M5's second slice (rows 25 and 35; the M5 card). Built locally, nothing pushed. Commits: e6472a1a (step 0: the App Master's rulings
(5)-(8) in the card), b0bf1e10 (the M3a-2 leftover), 21c988de (the record), acc9f062 (typed entry), 36ab1056 (the TV list), and this entry.
What changed, by file:
- `lib/session/learners.ts`: `Learner.papers?: StoredPaper[]` (`{ at, items, unmapped }`, the cleaned paper and its date; newest
  last, at most 5; absent with none, so a learners.json written before M5b loads, and `getLearner` returns, exactly as before).
  `cleanStoredPaper` reads a stored paper back through `cleanPaper` and accepts it only if nothing is dropped and the items match
  what was stored; anything else is read as none, never guessed. `addPaper(id, raw)` cleans, stores, and returns null (writing nothing)
  when no row survives. The recovery is recomputed from the paper, never stored or sent.
- `lib/session/store.ts`, `pairing.ts`: Screen `paper`; `Session.paper` (the latest, hydrated like `skills`; never sent to a guest);
  Event `paper.enter { rows }` (in `NEEDS_LEARNER` and `REHYDRATE`): `dispatch` keeps the paper through `addPaper` BEFORE the reducer
  runs, so a paper with no row left, or no one at the desk, changes nothing but the status line. No new route: the phone posts it on
  `/api/session` as it does its other actions.
- `lib/rules/paperEntry.ts` (new, pure): the draft rows, `rawOf` (a whole number is a number, anything else stays text for
  `cleanPaper` to drop; an empty box is not 0), `entryOf` (drops worded as "Question 5(b) is left out: ..." or "Row 3 ...", dropped
  codes, unmapped notes), `statementChoices` (every statement with its can text).
- `app/phone/PaperPanel.tsx` (new), `page.tsx`, `panelFor.ts`, `globals.css`: the Paper tab; `panelFor` hands the TV's `paper` to it.
- `tv/paperRows.ts` (new), `maths/MathsTV.tsx`, `tv/keys.ts`, `app/tv/page.tsx`, `design/maths-lamplight.css`: the list. Ruling (5):
  `paperView` takes `recovery()`'s `topics` as they come. Ruling (6): `recovery()` already sums distinct items per topic; the view adds
  nothing. Ruling (7): the board-name drop is shown as "A question number is the number the paper prints, like 5(b)." Ruling (8): the
  caps are untouched; the out-of-over-cap drop says "Enter its parts one by one."
- Step 4: `SlipSide` takes `items` and `ix` and says its line through `deskLine`. `deskLine(items, i, line)` is
  `namedLine(line, items[i].n, itemName(items, i))` by its definition, so the text is identical for every case; no row pinned the old
  call, so there is no OLD/NEW; a new row (`M5b step 4`) pins the new one.
Choices, stated: (1) `MATHS_SCREENS` is pinned exactly by `tv-keys-test` 'maths 1', and `mathsOwns` is pinned for every screen, so
`paper` is not in that list: `paperOwns` (keys.ts) is asked beside `mathsOwns` on the TV page. (2) Every key of Get ready for school's
list is pinned by `tv-keys-test` 'W8 2' (Down "does nothing"), so the TV has NO key into the list; the phone is its door (the Paper panel's
send and its "Show the last paper on the TV", which posts `nav`). Opening it from the TV would change an existing assertion: owed to the
App Master. (3) The phone cleans the rows as they are typed and the server cleans them again; the TV never sees a drop (it shows the stored,
clean paper), the phone shows every drop with its reason. (4) A secure topic is read from `Session.skills`; the paper still decides.
Rows: `learners-save-test` papers 1-4 (round trip and cap; malformed read as none over a dozen malformed shapes; an older record has no
`papers` key at all; the paper through `dispatch`), `phone-panel-test` paper 1-5 plus the `paper` hand-off fixture (every drop reason
in words, text read as a whole number or left for the desk to drop, can text and never a code alone, no /GCSE|1MA1/ over a sweep, the
panel's door), `maths-tv-test` paper 1-8 and `M5b step 4` (recovery()'s order with a pair that pulls a prerequisite forward, lost marks and
item labels and the paper's marks, secure marked not dropped, notOnDesk apart, empty paper, no board name over one paper per statement,
the window, the D-pad). Existing assertions: none changed. (`learners-save-test`'s `after` also stops the store's ticker, as
`week-digest-test`'s does, now that the suite loads the store.)
Kill test (run on committed code, then `git restore`): `cleanStoredPaper` returning the stored paper as it is turned `papers 2` (a
malformed stored paper is read as none) red; restored, green.
Gate: `cd desk && npm run test:rules` 67 green, 0 red (1143 tests) at the last code commit; `npx tsc --noEmit --incremental false` clean.
No `desk/data/` touched, no model call, no push; recovery.ts, gcse.ts, paths.ts, syllabus.ts, school.ts and the generators unchanged.
Owed to the owner: the TV list at 1920 x 1080 and 1280 x 720 (a paper with more than five topics, one with a secure topic, one with
Not on the desk yet, and the empty screen), the phone's Paper panel at 390 px (a row of three boxes and the picker open, the Left out
list), and the caps check (8): MAX_OUT_OF 6, MAX_ITEMS 80, PAPER_MARKS 80 against the specification. Nothing was captured or looked at in a browser.

### 2026-10-08 · batch 7 · M5c · autopilot/accepted-idea-delivery-cb26ec0f
M5's third slice (rows 25 and 36; the M5 card). Built locally, nothing pushed. Commits: 9b76fc0a (step 0: the App Master's rulings
(9)-(11) in the card), d26ad5c5 (ruling 11), baa062d9 (the reader), 1177441c (the probe, the scorer and their rows), and this entry.
What changed, by file:
- `lib/session/store.ts` (ruling 11): `dispatch`'s `paper.enter` no longer swallows `addPaper`'s throw into the no-row status. A
  failed write or an unreadable learners.json gives `PAPER_NOT_SAVED` ("That paper was not saved: the desk could not write it to the
  learner file, so progress was not saved. Send it again."); a paper with no row left still gives `PAPER_NO_ROW` (the same words as
  before). Nothing is kept and the TV stays put in both; the error is logged.
- `lib/desk/paperRead.ts` (new, wired to nothing): `readPaper(imageBase64)` makes one vision call with `PAPER_SCHEMA` (items of
  `{ q, marks, outOf, codes }`) and `paperPrompt()` = `PAPER_ASK` + the list (every STATEMENTS line as `code: can`, foundation false
  included). It returns the rows raw. The ask copies numbers ("in 2/3 it is the 2") and chooses at most MAX_CODES codes by the
  question's words; it asks for no sum, count, total or comparison, and the prompt names no board.
- `lib/rules/paperScore.ts` (new, pure): `unitsOf(codes)` (the school-path topics and notOnDesk statements, from `recovery()` on a
  one-item paper), `scorePaper(key, cleanRead)` (per key item: label, mapped, marks, codes; the paper's drops and extras), `scoreRun`
  (sums, whole percents rounded down, `pass` = mapped x 100 >= 85 x items, `marksQuestion`), `KILL_PERCENT` 85.
- `tools/paper-probe.cjs` (new): POOL (93 stems in 84 questions, 8 of them with parts), `makePapers(seed)`, `renderSvg`, `echoRun`,
  `runProbe`. Live: sharp from desk/node_modules (loaded lazily; missing, it stops with a plain message), the vision engine's probe
  first, then each PNG read, cleaned and scored; the SVGs and PNGs are kept in <out>/papers. `--stub`: the read is fed from each key
  at the provider seam (`useProvider('vision')`), no image is made, and report.md's first line says STUBBED.
- `tools/paper-probe-test.cjs` (new), in `rulesSuites` just before `harness-rules-test.cjs`; `desk/package.json`; `learners-save-test`
  'papers 5'.
Choices, stated: (1) A mixed item (a desk-topic statement and a gap one) is mapped only when the read reaches both the same topics and
the same notOnDesk statements: missing the gap statement would leave it off the Not on the desk yet list. For an item of one kind
this is the card's "or". (2) Units come from `recovery()` itself, so two codes reaching the same topics (R7, R10) are one unit; the
codes-read figure tells them apart. (3) The schema puts no enum on the codes and no cap on any list: an unknown or a fourth code is
cleanPaper's to drop, never a failed read. `marks` and `outOf` are integers in the schema (the validator has no union types), so an
illegible mark comes back as a number; marks-read is what shows it. (4) A paper the engine fails on scores 0 of its items; the error
is in the report. (5) Labels match without case or spaces, as cleanPaper compares them. (6) The papers keep 10 to 13 items and 16 to
31 marks, so each fits one A4 page at a legible size; a key is a sample of a failed paper, not a whole one.
The stubbed run (seed 1729): 234 items over 20 papers, all mapped (STUBBED, not a result).
Rows (9): the keys deterministic, clean whole, within the caps, with the mix on every paper; no echo over every stem (and the check
catches a stem that quotes A22); a stubbed read 100%; one code moved to another topic scores only that item down (the run loses one),
while R7 for R10 stays mapped; one mark misread leaves the kill figure as it is and moves marks read down, and every mark misread
puts the question to the owner; one label misread scores that item down (case and spaces do not); paperRead's request (schema, every
statement line, no arithmetic words in the ask, no board in the prompt, the rows raw); each SVG's labels, allocations and marks, no
code on the page; the --stub CLI run.
Kill test (run on 1177441c, not committed): `scorePaper` counting an item mapped on its label alone turned 'paper probe 4' (the
wrong-code row) red; restored with `git restore`, green. The ruling-11 row was red on the old `dispatch` and green on the new one.
Gate: `cd desk && npm run test:rules` 68 green, 0 red (1153 tests) at 1177441c; 67 green (1144) at baa062d9 and d26ad5c5;
`npx tsc --noEmit --incremental false` clean. No `desk/data/` touched, no model call, the probe never run without --stub, no push;
recovery.ts, gcse.ts, paths.ts, syllabus.ts, school.ts, read.ts, the engines and the generators unchanged.
Owed to the owner: the live run from desk/ (`node ../tools/paper-probe.cjs`) with Ollama and the vision model up, and its figure
recorded here and in row 36 (under 85% mapped: the photo path is not offered and typed entry stays the door); the M5b items still
owed: the captures (the TV list at 1920 x 1080 and 1280 x 720, the Paper panel at 390 px), the caps check (8), and the TV door (9).

### 2026-10-08 · batch 7 · M3b-1 · autopilot/accepted-idea-delivery-94f77512
M3b's first slice (rows 27 and 37; the M3b card), architecture card 5 part a. Built locally, nothing pushed. Commits: 830ad522 (step 0:
the App Master's rulings (12)-(13) on M5c's questions in the M5 card, row 25 built in three slices, the M3b card cut in three with
rulings (1)-(4), rows 37-39), 08149848 (the judge and its rows), and this entry.
Order, a deliberate deviation: batch 7's order is M5, L5, M3b (section e). M3b-1 ran ahead of L5 because L5's 18+ content waits for
the owner's review at 09:00 on 2026-10-09, and M3b-1 needs no owner (a seam change with no behaviour or screen change).
What changed, by file:
- `lib/library/paths.ts`: `PathJudge` (`'school' | 'calc'`) and `PathInfo.judge` (school 'school', calc1 'calc'). A topic of a path
  judged 'calc' carries its practice `shapes` on its `PathTopic` (a copy of the spine's list), so no site past paths.ts reads
  `CALC1_SPINE`. New helpers: `isPath` (an own key of PATHS, never an inherited one such as `toString`), `judgeOf(path)` (the school
  path's judge with no path), `judgeOfTopic(id)`, `calcTopics()` (every topic of every path judged 'calc', in path order) and
  `shapesOfTopic(id)` (empty off a 'calc' path). `pathOf` accepts any key of PATHS. Still client-safe: the only runtime imports are
  `./syllabus` and `./calculus1.spine` (test 12 unchanged and green).
- `rules/kinds.ts` kindOfTopic reads `judgeOfTopic`; `rules/maths.ts` `CALC_AS_SLIPS` tags `calcTopics()` and `isCalcTopic` is
  `judgeOfTopic(id) === 'calc'`; `desk/items.ts` `shapesOf` is `shapesOfTopic`; `desk/hint.ts` the stance and the voice read
  `judgeOf(path)`; `app/api/hint/route.ts` the lesson skip reads `judgeOf(path)`; `session/store.ts` `pathChecked` keeps any
  `isPath` value; `tv/profileRows.ts` `COURSES` is `Object.keys(PATHS)` (school, then calc1); `desk/explain.ts` names
  `calcCourse(topicId)`: the topic's own path when it is judged 'calc', else the first path judged 'calc', so every Calculus 1
  prompt is byte for byte as before (a Calculus item on a school topic still says Calculus 1).
Choices, stated: (1) The field is `judge`, a string union, because the brief's rows read "school is 'school', calc1 is 'calc'" and
`kindOfTopic` needs only the two values; a third kind of truth (M3b-3) would add a member, not a shape. (2) The shapes ride on
`PathTopic` (optional, like `year`), not in a second record keyed by path, so a new path is one PATHS entry. (3) `isPath` uses an own-key
check: `in` would have let `mathPath: 'toString'` through.
Rows (7, tests 13-19 in `tools/maths-paths-test.cjs`, after test 12 so the client-safe cache check still sees no server module): every
path has a judge (school 'school', calc1 'calc'), only a 'calc' path's topics carry shapes, and they are the spine's; for every topic of
every path, kindOfTopic, the slips in their judge's own words, pathOf and pathOfTopic agree with the record; a stubbed set asks a
Calculus topic for the record's shapes and a school topic for none; the hint's stance, voice and the route's lesson skip per path;
explain names the topic's Calculus path, Calculus 1's words unchanged; the store keeps every PATHS key and drops junk (toString,
constructor, __proto__, calc2, CALC1, '', 1, null, an object, an array), COURSES is the PATHS keys in order and the course row has one
cell per path; the sweep finds no quoted 'calc1' in desk/src outside paths.ts, calculus1.ts and calculus1.spine.ts. Existing assertions:
none changed.
Kill test (run on 08149848, not committed): calc1's judge set to 'school' turned maths-paths 13 (the judge pin) and 17 (explain finds
no Calculus course) red, and outside the suite calc-practice (1-7 and M3a 1 among its reds), calc-hint 8 (the route) and calc-course 3 (the whole
course); restored with `git restore`, 19 of 19 green. Rows 14-16 stay green under the flip by design: they check that every site
agrees with the record, and the flipped record is followed everywhere.
Gate: `cd desk && npm run test:rules` 68 green, 0 red (1160 tests) at 08149848 (1153 at eb4d6750); `npx tsc --noEmit --incremental
false` clean. No `desk/data/` touched, no model call, no push; calculus1.spine.ts, calculus1.ts, calc.ts, calc-expr.ts, the
generators, syllabus.ts, school.ts, recovery.ts, paperRead.ts, paperScore.ts and the engines unchanged.
Next: M3b-2 waits for the App Master's rulings on its questions (in the run's result.json): the third course cell and its captures,
whether a Calculus 2 prompt names its own course (`CALC_SYSTEM` in items.ts says "a university Calculus 1 desk", and the hint's
`CALC_STANCE` names Calculus I's rules), improper integrals and volumes or arc length (out, or M3b-3), the corpus or syllabus Calculus 2
follows, and whether a slip new to integration techniques may be added. L5 runs after the owner's 09:00 review on 2026-10-09.

### 2026-10-08 · batch 7 · M3b-2 · autopilot/accepted-idea-delivery-c2af55db
M3b's second slice (rows 27 and 38; the M3b card), the Calculus 2 path: integration techniques on the two integral shapes. Built locally,
nothing pushed. Commits: 18845498 (step 0: the App Master's rulings (5)-(12) on M3b-1's questions in the M3b card, the M3b-2 and M3b-3
drafts updated to rulings 7 and 8, row 37's garbled cell fixed), 6565c0f5 (the path, its prompt words and its rows), and this entry with
the docs.
Order, a deliberate deviation: batch 7's order is M5, L5, M3b (section e). M3b-2 ran ahead of L5, as M3b-1 did, because L5's 18+ content
waits for the owner's review at 09:00 on 2026-10-09 and M3b-2 needs no owner.
What changed, by file:
- `lib/library/calculus2.spine.ts` (new, plain data, no import): `CALC2_SPINE`, five topics - `calc2-parts` (Stewart 9e 7.1 / OpenStax
  Volume 2 3.1), `calc2-trig-integrals` (7.2 / 3.2), `calc2-trig-sub` (7.3 / 3.3), `calc2-partial-fractions` (7.4 / 3.4),
  `calc2-strategy` (7.5 / 3.5) - each with name, strand, one-sentence blurb, prerequisites only on earlier calc2 topics (ruling 3) and
  the shapes `antiderivative` and `definite-integral`. The OpenStax section numbers were NOT verified in this run (no fetch was made): 3.1-3.5 are cited from the
  author's recall of chapter 3 (3.6 numerical integration and 3.7 improper integrals follow it), and the Stewart numbers are the anchor. The App Master
  should confirm them (ruling 9: otherwise cite Stewart alone).
- `lib/library/paths.ts`: `MathPath` gains `'calc2'`; the `calc2` entry (name "Calculus 2", `judge: 'calc'`, `school: false`, a blurb that
  says it follows Calculus 1); `PathInfo.calcWords` ({ desk, course, methods }, ruling 6) on both Calculus paths, calc1's values
  reproducing today's words; `calcWordsOf(path)` (the path's own words when judged 'calc', else the first path judged 'calc').
- `desk/hint.ts`: `calcStance(path)` replaces the constant `CALC_STANCE`; `desk/items.ts`: `calcSystem(topicId)` replaces `CALC_SYSTEM`,
  naming the topic's own path. No site names a path id.
- `tools/maths-calculus-live.cjs`: `--path` takes every path judged 'calc' (read off the record; an unknown path is refused before
  anything starts); the Tonight stops follow the path's length; with calc2 (no example corpus) it walks the rulers alone. Dry run: calc1
  22 topics x 7 screens + rulers, 0 failed; calc2 rulers, 0 failed. No live call.
- Not touched: kinds.ts, maths.ts, store.ts, profileRows.ts, explain.ts, the hint route, screens.tsx (all follow the judge).
Choices, stated: (1) `calcWords` has three fields because the set's prompt says "Calculus 1" while the stance says "Calculus I". (2) The
spine imports nothing, so `Calc2Shape` is a local two-member union, not `CalcShape`; its ids are rules/calc.ts' own and the suite checks
them against `CALC_SHAPES`. (3) No new slip (ruling 10): calc2 topics use the antiderivative and definite-integral slips.
Rows: the new suite `tools/calc2-path-test.cjs` (registered before harness-rules-test.cjs; 7 rows): the spine; the record; 20 hand-worked
fixtures (by parts on x e^x, x sin(x), ln(x); sin^2, cos^3; sqrt(4 - x^2), 1/(x^2 + 4); 1/(x^2 - 1), 1/(x(x+1)); x e^(x^2), x^2 ln(x)),
each well formed, each with its section named, `checkAnswer` marking its worked answer 'right', a wrong answer 'wrong', and the
lost-constant and sign slips as those slips; a stubbed calc2 set judged 'calc' whose prompt asks only for the topic's shapes in
Calculus 2's words; Calculus 1's set prompt and stance pinned whole (text at 37880327) with Calculus 2 naming Calculus II and its methods; the
sweep for the quoted 'calc2'. `tools/maths-course-test.cjs` rows 10-11 (a calc2 learner saved and surviving a load; the course row has
three cells, calc2 third, posting its patch). The kill's fixtures: no shape or topic was withheld, every fixture marked.
Edited existing assertions (the brief allowed test 1 only; the others were forced by calc2 becoming a path, and are listed for review):
- maths-paths 1: `deepEqual(keys.sort(),['calc1','school'])` -> `['calc1','calc2','school']`; added `PATHS.calc2.topics.length === 5`; the three
  uniqueness lines (ids of school + calc1; their count; "school topic not in calc1") -> over every path (never weaker).
- maths-paths 12 (forced): the transpiled-require pattern `(syllabus|calculus1.spine)` -> `(syllabus|calculus[12].spine)` (paths.ts now requires both spines).
- maths-paths 14 and 18 (forced): the junk `mathPath` lists named 'calc2' as no path; 'calc2' -> 'calc3' in both.
- maths-course 6 (forced): "two cells" and the expected cell list gained `['path','Calculus 2',P.PATHS.calc2.blurb,'calc2']`; the session.json fixture gained a
  `course-calc2` profile (added, nothing edited).
Rows 13-19 of maths-paths-test pass for calc2 with no edit.
Kill test (run on 6565c0f5, not committed): calc2's judge set to 'school' turned calc2-path 2-6 red (5 of 7) and maths-paths 13 (the judge pin)
red, restored with `git restore`; maths-course stays green under the flip by design (it checks the row and the save, not the judge).
Gate: `cd desk && npm run test:rules` 69 green, 0 red (1169 tests; 68 / 1160 before) at 6565c0f5; `npx tsc --noEmit --incremental false` clean.
No `desk/data/` touched, no model call, no push; calculus1.spine.ts, calculus1.ts, calc.ts, calc-expr.ts, calc-word.ts, the generators,
syllabus.ts, school.ts, recovery.ts, paperRead.ts, paperScore.ts, screens.tsx and the engines unchanged.
Owed to the owner: the Maths course row with three cells at 1920 x 1080 and 1280 x 720 (ruling 5), and one live calc2 set on the PC
(`node tools/maths-calculus-live.cjs --path calc2` for the rulers, a live set for the model's yield on the five topics).
Next, M3b-3 (row 39) needs its card completed: for each of sequences and series, improper integrals (7.8) and approximate integration (7.7),
the kind of truth, the comparison, the leak rule and the marking prompt, and how n is read. Otherwise the descope goes to the owner. Also open:
a technique slip needs slips keyed by topic (a design change; ruling 10). L5 runs after the owner's 09:00 review on 2026-10-09.

### 2026-10-09 · batch 7 · M3b-3 step A · autopilot/accepted-idea-delivery-b2f94ab8
The third part of M3b (rows 27 and 39; the M3b card): the M3b-3 card completed. This is design only, and nothing is built.
Local, nothing pushed. Commits: 8132e184 (step 0: the App Master's rulings (13)-(16) on M3b-2's questions in the M3b card,
and ruling 14's source note in MATH-COURSE-PATHS section 10), then this entry with the card, the rows and section 10.
Order, a deliberate deviation: batch 7's order is M5, L5, M3b (section e). M3b-3 step A ran ahead of L5, as M3b-1 and M3b-2
did. L5's 18+ content waits for the owner's review at 09:00 on 2026-10-09, and a design card needs no owner. T4 and T5 wait
for the T1 live probe.
What changed, by file (docs only; no code, test, spine or package.json touched):
- `docs/concepts/STUDY-DESK-V2-PLAN.md`:
  - the M3b card: rulings (13)-(16); the M3b-3 card completed (sources, the engine as it stands, one rule for every shape,
    where the shapes live, the five shapes with their truth, comparison, leak rule, marking prompt, how n is read, kill
    test and verdict, what a build may change in Calculus 1 and the pins, the forced assertion edits);
  - the slices M3b-3a to M3b-3g;
  - row 39 card completed; rows 40-46 not started.
- `docs/MATH-COURSE-PATHS.md`:
  - section 10: ruling 14's source note, the sequences and series item (what is buildable, the five not buildable with
    their reasons) and the measured aliasing of a limit at infinity;
  - section 9: a pointer to the card.
Sources checked against openstax.org (WebFetch, 2026-10-09):
- chapter 3: 3.1 Integration by Parts to 3.7 Improper Integrals;
- 3.5, Other Strategies for Integration: objectives are a table of integrals and a computer algebra system;
- chapter 5: 5.1 Sequences, 5.2 Infinite Series, 5.3 The Divergence and Integral Tests, 5.4 Comparison Tests, 5.5
  Alternating Series, 5.6 Ratio and Root Tests.
The App Master's recall of 3.5 agrees with the source. The Stewart 9e numbers are cited from the book's known sections,
not fetched.
Probes (a scratch script under the OS temp directory, loading the TypeScript with `tools/ts-load.cjs`; not committed):
- `compile` returns null for n, n!, (-1)^n, 2^n and x!;
- `(-1)^x` is -1 at 3 and NaN at 2.5;
- `limitInf` samples at x = 100 ... 1e8 and calls cos(pi x) 1, a latent Calculus 1 defect: the limit spec is well formed
  and checkAnswer marks 1 right;
- the x·√2 guard refuses cos(pi x), sin(pi x)+1 and x·sin(pi x), and keeps (3x^2+1)/(x^2-4), (1+1/x)^x, x^(1/x), (1/2)^x
  and ln(x)/x;
- every improper partial-integral limit is dne, and 1/x^1.01 cannot be told from 1/x at t = 100 or 1e4;
- the geometric and telescoping closed forms agree with partial sums to 1e-6;
- T_5, M_5, S_4 and S_10 for 1/x on [1, 2], with their errors against ln 2.
Choices, stated:
(1) n is never read by the engine. Families are printed from templates and decided on whole numbers, and the sequence
shape is a function in x printed in n. Reading n would change which prose windows `leaksCalc` takes for Calculus 1.
(2) The new shapes live in `rules/calc2.ts` as `CALC2_SHAPES`, apart from the nine. The `sign` and `arithmetic-slip`
shape lists, `TOLERANCE`, `CALC_WITHHELD` and maths-paths 86 are unchanged.
(3) A seam slice comes first (M3b-3a, no behaviour change, a frozen Calculus 1 table), as M3b-1 came before M3b-2.
(4) Approximate integration gets 5e-5 at four decimal places and no 'unsure' band. Calculus 1's 5e-3 would mark ln 2
right for T_5.
(5) Absolute or conditional is an optional slice (M3b-3g).
(6) Power series are out (a set answer, a function with no closed form to sample, higher derivatives).
Verdicts:
- sequence-limit: buildable;
- series-sum: buildable as the geometric and telescoping families;
- series-verdict: buildable as five families;
- improper-integral: buildable as three families;
- approx-integral: buildable;
- not buildable: free terms in n, sequences with no real extension, sums outside the two families, free improper
  integrands and power series. They are in section 10, and their descope goes to the owner.
Kill test (the brief's): a shape the card could not name all four for would not be built. No candidate shape failed
whole. The parts that failed are the not-buildable list. Each shape's own kill test is named in the card, for its build
run.
Gate: `cd desk && npm run test:rules` gave 69 green, 0 red (1169 tests) at the base 2db4d800, at 8132e184 and at this
commit; `npx tsc --noEmit --incremental false` from desk/ was clean. `git diff --stat 2db4d800` shows the two docs only.
No `desk/data/` touched, no model call, no push.
Next: the App Master rules on the card: the slices and their order; the tolerance of 5e-5 at four decimal places; the
family lists; the leak words; whether M3b-3g is in; whether the x·√2 guard also goes onto Calculus 1's limit at infinity
(the aliasing defect); and the descope that goes to the owner. L5 runs after the owner's review.
