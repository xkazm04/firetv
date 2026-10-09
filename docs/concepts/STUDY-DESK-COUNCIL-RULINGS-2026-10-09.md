# Study Desk: App Master rulings on the council-lite reviews of 2026-10-09

Council-lite rounds ran on 2026-10-09. For each feature with must-address lines, the App Master ruled how its rework fixes
them and what the rework leaves out. This doc puts those rulings in the repo, so later rework briefs can cite them by id
(for example "M4" or "X1b"). The rulings had lived only in the App Master's journal.

**These are the App Master's rulings, not the owner's.** The owner may overrule any of them. An owner decision in
`docs/concepts/STUDY-DESK-V2-OWNER-DECISIONS-2026-10-07.md` wins over a ruling here. The council never approves; only the
owner does.

Inputs: the council-lite round of each feature (round 1, score and must-address lines quoted verbatim below);
`docs/BACKLOG.md` (ids EM-B, MB-B, LG); the App Master's journal rulings of 2026-10-09.

Status is given per row. A delivered ruling cites its commit. "queued, delivery N" refers to the delivery order at the end
of this doc. "in flight, run X" means a builder is working on it. Code sites were checked on `main`; where a site had moved,
the current line is cited. This doc was updated for round 2 on 2026-10-09 (the first version merged at 7041d11d).

---

## 1. end-of-session-memory-recap

Lite r1: ready, 0.5393. Tier: major.

Must-address:
1. value: The Essay recap counts a sentence the student fixed as still to fix (Barbora C2 fails; observed)
2. value: The memory half never fires for a Linga or Essay evening, and the phone then says 'Nothing written down tonight.'
3. craft: The phone's End session holds the evening open on a model call; the TV path does not

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| M1 | After a rewrite, the Essay count follows the reading's last state. The history keeps ONE line per reading, updated in place. | Must-address 1, EM-B1. `desk/src/lib/desk/essay.ts` `record()` (:93) and `reviseSentence` (:158). | Appending a line per rewrite. That is how the count went stale. | delivered, 1637cff6 |
| M2 | Essay and Linga evenings feed the memory. `/api/memory` asks the model when tonight has any Math, Essay or Linga line. The memory gets one section per app. It holds counts, lenses and the closed vocabularies only, never learner text verbatim. | Must-address 2, EM-B2. `desk/src/app/api/memory/route.ts`. | none recorded | delivered, 77c21600 |
| M3 | The phone's 'What the desk noticed' has four states. The lines, when lines were written. 'Nothing new to note tonight.', when the model was asked and wrote none. 'Nothing worked on tonight.', when there was no work and nothing was asked. The desk's failure sentence, when the write failed. A failure never shows an empty-evening line. | Must-address 2, the phone half. The fixed fallback 'Nothing written down tonight.' is at `desk/src/app/phone/page.tsx:613`. | none recorded | delivered, 4d216118 |
| M4 | The phone's End session posts `session.end` first and then writes the memory, as the TV's Menu does. The memory call runs with thinking off. | Must-address 3. Today `endSession` posts `session.end` in a `finally` after the memory call (`desk/src/app/phone/page.tsx:358`, button at :611). | none recorded | delivered, 52f32cd2 |
| M5 | The evening log belongs to one evening. It is stamped with the server's local day, and the first event of a later day clears it, for every learner slot. | MB-B12. The log lives on the session and on each slot (`desk/src/lib/session/store.ts:308`, :364, :373). | Clearing it on `session.end`. The recap still reads it then. | delivered, 9ee12486 |
| M6 | The caption says 'all of it right' only when at least one item was marked and none is wrong or unsure. Hints-only and Linga-only evenings get their own sentence. | MB-B11. `recapCaption` falls to "all of it right" when nothing is to look at (`desk/src/tv/recapRows.ts:84-88`). | none recorded | delivered, 715ce1ef |
| M7 | The phone's Recap shows whenever tonight has a non-empty tile, or a session ended since local midnight, whatever the TV shows. | EM-B19. The Recap body renders only on `s.screen === 'recap'` or a non-empty `s.log.problems` (`desk/src/app/phone/page.tsx` near :616). | none recorded | delivered, 715744b3 |
| M8 | A whole piece is recapped as a piece. The Sunday line says 'reading' or 'piece' by size. | EM-B20. `record()` runs after the last `essay.progress` (`desk/src/lib/desk/essay.ts:93`). | none recorded | delivered, 8f8241fe |

M1-M8 were delivered by run f6077614. The BACKLOG closures are 65b3bc5f.

Later rounds:
- Lite r2: ready, 0.6371, coverage 0.70, must-address empty. All three r1 lines were closed by reproduction.
- Full r1: ready, 0.5283, coverage 0.90, judged at 7041d11d. Scores: value 0.50, craft 0.45, rivalry 0.60, robustness 0.62, economics unmeasured. Its Report and Approval are with the owner.

Full r1 must-address, verbatim. The council cut the second line itself, so its '...' is kept:
1. craft: The memory contract lives in the prompt only: the write door does not enforce it, and the replay shows violating lines persisted
2. economics is unmeasured: The feature makes a metered call: one headless Claude Code CLI spawn per ended evening that has work (desk/src/lib/desk/memory.ts:67, model 'fast' = haiku...

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| 13a | Enforce the memory contract in code at the write door, `desk/src/lib/desk/memory.ts`. Drop a line that carries the learner's name or a score. Keep at most three lines per evening. Cap each line's length. Keep the call's ms and provider. Each of these gets a rule case. | Full r1 must-address 1 and 2. The replay kept a named line and a score. | Leaving the contract in the prompt. | queued, delivery 13a |

Left out, by ruling:
- value-3: the memory shown to the parent. The full r1 raises it again (the memory never reaches the parent), and it stays ruled out.
- craft-2: memory governance (date, source, review, removal).
- craft-3 and craft-4.
- EM-B36 and MB-B23: per-learner blocks, after the learner-profile rework (delivery 13).

## 2. homework-page-reading

Lite r1: ready, 0.56.

Must-address:
1. value: After the first evening, 'I have homework' never asks for tonight's sheet: it opens the oldest maths page on the desk, an empty or failed one included
2. robustness: A read that comes back with zero problems is recorded as a success, so it cannot be retried in place and the only way on is a second page

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HW1 | Rework before the full round. | The process rule below: a high must-address line is reworked first. | none recorded | delivered (run 8c796090, merged 602410d7) |
| HW2 | The door opens a maths page only when one was snapped THIS evening and read with at least one problem. Otherwise it asks for tonight's photo. Older pages are not deleted. | Must-address 1. Pages live on the maths slot (`desk/src/lib/session/store.ts:371`); the read is `readPage` (`desk/src/lib/desk/read.ts:24`). | none recorded | delivered, 3a98790e |
| HW3 | A read with zero problems ends as a failed job with a reason in the desk's words, so Try again works in place on the same page id. The TV's failure line points to Try again, not to a new snap. | Must-address 2. `readPage` (`desk/src/lib/desk/read.ts:24`). | none recorded | delivered, 7e7a0740, with its tsc fix 9d735bd1 |

Implementation notes for the same rework (tasks with no choice in them, not rulings):
- robustness-2: positions are range-checked, items are not sorted by height alone, and a rule case calls `readPage`.
- craft-1, craft-2 and value-2.
- BACKLOG MB-B3, MB-B7 and MB-B43.

The BACKLOG closure is 602410d7.

Rulings at the rework's dispatch:
- (a) MB-B7 leaves the homework rework. It is the practice-paper statement picker (`desk/src/app/phone/PaperPanel.tsx`, `desk/src/lib/rules/recovery.ts`), not the page read. It is its own delivery, 4b.
- (b) craft-1's box, a top and bottom per item in the read schema, is left out. It changes the shared reader for all three subjects, and nothing measures it until vision reads a real page. Lost: building it now.
- (c) craft-6 and robustness-4 are left out as economics. They are the page photos stored as data URLs inside session.json, with no cap.
- (d) A zero-item read is a failure for every subject, not for maths only.

Second round, lite r2: ready, 0.6443, coverage 0.70, judged at 445c7bad. Scores: value 0.56, craft 0.64, robustness 0.82. Rivalry and economics are not judged in lite. Both r1 must-address lines were closed by reproduction. Vision was stubbed throughout, and no read has run with the real model on a real page.

Must-address, verbatim, both high:
1. value: The Tonight screen's first card, Back to the sheet, still opens the OLDEST maths page with problems and says "where you were"
2. craft: The printed-number sort scrambles a sheet whose sections restart their numbering at 1, for maths, English and Essay alike

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HW4 | The Tonight screen's Back to the sheet card is `continueCard` (`desk/src/tv/mathsRows.ts:118`, its `findIndex` at :132). It opens tonight's sheet by the same answer as the door, `tonightsSheet` (:21). It is offered only when that sheet was read with at least one problem. With no such sheet, the card is not offered. Older pages stay on the desk. | Must-address 1 (value-5). | A deliberate resume of an older sheet. It contradicts HW2, and its caption 'where you were' misleads. | queued, delivery 4a |
| HW5 | The printed-number sort in `readPage` (`desk/src/lib/desk/read.ts:82`) holds only when no printed number repeats on the page. A number that repeats with the same label, or with no label, means the sheet has sections that restart. Then walk the items top to bottom by band, and left to right inside one band. A new section starts at the first item whose number and label are already in the current section. Sections keep that page order. Inside a section, items sort by printed number, and lettered parts by label. A page with no repeat keeps today's sort, so robustness-2's two-column fix stands. The rule is the same for maths, English and Essay. Known limit: two sections side by side in two columns are not split. It is stated for the full round. | Must-address 2 (craft-8). | (a) Reading order alone, which breaks a two-column section. (b) The model's own order, which is unobserved on a real page. (c) A section field in the read schema, which changes the shared reader, the same reason craft-1's box was left out. | queued, delivery 4a |
| HW6 | The failed-read line on the English page (`desk/src/tv/screens.tsx:122`, today 'could not read this page' followed by 'snap it again') points to Try again on the phone, as HW3 did for maths. | Lite r2 found r1 value-2 closed for maths and unchanged for English (robustness-7). | none recorded | queued, delivery 4a |

Left out of delivery 4a, by ruling:
- (a) robustness-6 (med): the failed-read job is session-global, so a second learner inherits a Try again that answers 409. It joins P2 in delivery 7. The one function that clears per-learner desk state on a learner change also clears this job.
- (b) value-6 (med): a sheet snapped at 23:50 is not tonight's at 00:10. The evening's day is the same `dayOf` that M5 uses, so a change would be one rule for both. It is stated as a limit for the full round.
- (c) MB-B3's read-rate acceptance on real pages. Only the owner can run real pages, so it is a stated ceiling for the full round, like HL7.
- (d) craft-1 band plausibility, value-3, craft-3 and craft-4 are unchanged and not in this rework.

After 4a merges, a lite r3 (the last lite round) runs, then the full round.

## 3. hint-lesson-discovery

Lite r1: ready, 0.5814.

Must-address:
1. robustness: One failed embedding call leaves the lesson library's vectors empty for the life of the server, so every later lesson opens at 0:00 and the engine is never asked again

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL1 | Rework before the full round. | The process rule below. | none recorded | delivered, part 1 (445c7bad) |
| HL2 | A school task that reads as neither a fractions unit nor Calculus gets a neutral school-maths stance that names no unit. The voice age stays for vojtech-18, who is declared out of segment. | value-1, MB-B8. `STANCE` in `desk/src/lib/desk/hint.ts:44`, chosen at :63-66. | none recorded | delivered, 0599317f |
| HL3 | `leaksCalc` catches a Calculus answer said in words. | robustness-2. `leaksCalc` (`desk/src/lib/rules/calc.ts`), called at `desk/src/lib/desk/explain.ts:224`. | none recorded | in flight, run a1f30e71 |
| HL4 | `embeddings.json` is written atomically and keyed by model and transcript. A truncated cache is rebuilt, not fatal. | robustness-3 and craft-2. | none recorded | delivered, 331107da |
| HL5 | The picker refuses a lesson id outside the menu it offered. | craft-1. | none recorded | delivered, 2be44253 |
| HL6 | The fractions fallback line is 25 words or fewer. | value-3. | none recorded | delivered, e3661325 |
| HL7 | The thin-evidence ceiling on the window goes into the full round as a stated ceiling. Closing it needs a bench on real transcripts, which only the owner can run: `desk/data/` is off limits to builders. | The `desk/data/` boundary. | none recorded | queued, delivery 3 |

The same rework owns MB-B2, MB-B8, MB-B16 and MB-B33. It also carries X1 (section 5).

Delivery 3 was split into two branches on one lane. Lost: one branch. The reason: MB-B2 changes the shared reader (`readQuestion` also feeds `likeTopic`), and the guard is a different shape from lessons and stance.
- Part 1 (lessons, stance and length) is run c75ab4a7, merged 445c7bad. Its commits: HL4 331107da, HL5 2be44253, HL2 0599317f, HL6 e3661325, the MB-B33 length cap d642c422 and Mic 5a2135b9, the MB-B8 grounding c7460599, and the BACKLOG notes 445c7bad.
- Part 2 (the shared leak guard: X1, X1a, X1b, X1c, HL3, MB-B16, MB-B2) is in flight, run a1f30e71.

HL7 stays queued as a stated ceiling for the full round. A lite r2 follows part 2's merge.

## 4. Marking false ticks (practice-generation-marking)

Its full round is ready and its Approval is with the owner. MB-B26, MB-B27 (R2) and MB-B28 (R1) are one fix, already ruled
in `docs/BACKLOG.md`. See those entries; they are not restated here. No new ruling id. Status: queued, delivery 4.

## 5. student-working-explanation

Lite r1: ready, 0.5821, coverage 0.70. Tier: major, because it changes a recorded verdict from a model's transcription, on
Math Buddy's marking path.

Must-address:
1. value: The youngest Czech character cannot reach the feature in a language she can use; there is no typed path while a recogniser exists
2. robustness: The explain reply is guarded only by leak checks with reproduced holes; a reply that completes the answer in another form is shown

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| X1 | The leak gap is fixed once, in the hint rework. The explain reply is checked by the same three functions, `leaks`, `leaksCalc` and `leaksSchool`, and the council found the gap is exactly MB-B16's. The hint rework adds tests through `explainItem`, with the model stubbed. | Must-address 2, MB-B16. `desk/src/lib/desk/explain.ts:224`. | An explain-only guard. It would be a second copy of the same check. | in flight, run a1f30e71 |
| X1a | On a Pythagoras item, a line that puts the item's squared total under a root is a leak, even when it does not state the root. Examples: 'the square root of 1156', 'the root of 1156', the root sign before 1156, Czech 'odmocnina z 1156'. The squared total on its own stays legitimate. | `tools/school-rules-test.cjs` `PYTH_LEGIT` (:1626) pins 'The sum of the squares is 100.' (:1628). | MB-B16's recommendation to refuse the squared total itself. It reverses a pinned design choice and leaves a second hint nothing to say on a Pythagoras item. | in flight, run a1f30e71 |
| X1b | The leak checks read number words as figures before they compare. The words come from one closed table under `desk/src/lib/rules/`. English and Czech cardinals from zero to twenty, and the tens to a hundred. Fraction words from half to twentieths: Czech polovina to dvacetina, with and without diacritics, singular and plural. 'Pravdepodobnost je tri trinactiny.' on a 3/13 item is a leak. | Must-address 2. The leak checks work on figures today (`leaksSchool`, `desk/src/lib/rules/school.ts`). | Telling the model to write figures only. The guard has to hold whatever the model writes. | in flight, run a1f30e71 |
| X1c | Settling from words is not widened. 'three quarters' and 'tri ctvrtiny' still settle nothing, which is the safe failure. | Marking path safety. | none recorded | in flight, run a1f30e71 |
| X2 | A 'Type it' control is always beside the hold-to-speak button. Today the textarea appears only when there is no recogniser. The recogniser language follows the learner's school system: cs-CZ for cz. | Must-address 1, MB-B18. `desk/src/app/phone/page.tsx:288` (`r.lang = "en-US"`) and :544-556 (textarea at :550). :288 is also MB-B33's line; whichever rework lands first sets it. | none recorded | queued, delivery 5 |
| X3 | When an explain settles an unsure item, the phone's reply and the TV's item line name the value the desk took from the learner's words, e.g. 'The desk heard 11/12.'. It is the learner's own value, so it is not a leak. When nothing settles, no value is named. | Must-address 1, second half. | none recorded | queued, delivery 5 |
| X4 | The explain prompt also gets the learner's written answer, the transcribed working, and the slip and line the desk found. This comes only after X1 holds. | MB-B10. `desk/src/lib/desk/explain.ts` prompt build (about :100-127). X1 is MB-B10's own ceiling. | none recorded | queued, delivery 5 |

X1 rides the hint rework (delivery 3, part 2). X2-X4 are their own rework (delivery 5), then a lite r2, then the full round.

## 6. essay-paragraph-analysis

Lite r1: ready, 0.5179. Tier: major (key goal 5).

Must-address:
1. value: Under Structure, a planted unsupported claim before the evidence is passed and the wrong sentence is marked
2. value: A whole piece is ruled paragraph by paragraph: every intro thesis and conclusion link comes back faulty, and 'Start with paragraph k' points at it
3. value: Out-of-segment text (Czech) is read with full confidence: the desk never says it reads English before it rules
4. robustness: A paragraph of a piece that fails to come back is never said on the TV

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| E1 | Under Structure, an evidence observation names the claim it backs (`supports: n`). Code checks that n is a claim, and rules a claim strong only on evidence that names it. With no link the verdict is neutral, never strong by position. | Must-address 1. `desk/src/lib/rules/essay.ts`: the claim branch (:297-302) takes any marked evidence after the claim, up to the next claim, as support. | Position as the only link. | queued, delivery 6 |
| E2 | A piece is ruled once, over the observations of all its paragraphs, after they all come back. The per-paragraph model calls stay. 'Start with paragraph k' shows only after that ruling. Case 9 of `tools/essay-piece-test.cjs` (:99) changes openly, with the reason. | Must-address 2. Case 9 pins "Structure runs per judged paragraph". | none recorded | queued, delivery 6 |
| E3 | Before any verdict or count, code (no model) decides whether a paragraph is English. A paragraph that is not is said to be so plainly, on the TV and on the phone, and is not ruled (W6 R4). In the same branch, the splitter and the plan accept a sentence that opens with a capital outside A-Z. | Must-address 3. | none recorded | queued, delivery 6 |
| E4 | A failed paragraph is drawn as 'not read', with a way to send it again, never as pending. Its sentences leave the summary's count, and the summary names it. | Must-address 4. | none recorded | queued, delivery 6 |

## 7. learner-profile-multi-learner-switching

Lite r1: FAIL, 0.40, coverage 0.15. Robustness was 0.40, under its 0.50 floor, so value and craft are unmeasured. Tier:
major, because it is the data path between learners.

Must-address, verbatim as stored. The third line is cut short at its source; the '...' is kept.
1. robustness: session.json holds every profile, is written without temp+rename, and its write error is swallowed; a half-written or junk-typed file silently resets the desk to the two demo profiles
2. robustness: profile.save does not clear what learner.set clears: a new profile saved from a seated learner's desk inherits that learner's level check, sentence reading, worked lesson and Workroom
3. robustness: english.set carries no owner and the analyse job is one slot per kind: a Sentence reading that lands after a switch is written onto the seated learner's desk, and the new learner's own...

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| P1 | `session.json` is written through a temp file plus rename, as `learners.ts` does. A failed write is logged and shown as status, never swallowed. `load()` validates each profile: a bad profile is dropped and logged, and the rest are kept. An unparseable file is moved aside (`session.json.bad-<stamp>`), logged, and said in a status line. `profile.draft` and `profile.save` check type against `AGE_RANGE`, and the other fields too. They refuse a bad patch in plain words. | Must-address 1. The write is a bare `writeFileSync` inside `try {} catch {}` (`desk/src/lib/session/store.ts:745`). `load()` (:658) falls back to `fresh()` on any error. The temp-plus-rename model is `desk/src/lib/session/learners.ts` (rename imported at :8). `AGE_RANGE` is `desk/src/tv/profileRows.ts:13`. | none recorded | queued, delivery 7 |
| P2 | One function clears the per-learner desk state on any change of the seated learner, and both `learner.set` and `profile.save` call it. An edit of the seated profile keeps the running conversation. | Must-address 2. `learner.set` (`store.ts:516`) clears state; `profile.save` (:520) does not. | none recorded | queued, delivery 7 |
| P3 | `english.set` carries an owner, as `essay.set` does. One for a learner who is not seated is dropped and logged. The analyse job slot is keyed per learner. | Must-address 3. `english.set` has no owner (`store.ts:561`); `essay.set` checks `e.owner` (:566). | none recorded | queued, delivery 7 |
| P4 | While a Linga scene or a level check is running, the switcher says in one line that switching ends it. | Switching ends them today. | none recorded | queued, delivery 7 |
| P5 | Profile ids are checked unique on draft and save. A patch naming another learner's id is refused. | Must-address 1 family (data path between learners). | none recorded | queued, delivery 7 |
| P6 | `reset` joins `SERVER_ONLY`. Profile removal and the demo pair are NOT in this rework: removal deletes a child's data and needs its own design after the full round. | `SERVER_ONLY` (`desk/src/app/api/session/route.ts:12`) does not list `reset` today. | Building removal now. | queued, delivery 7 |
| P7 | An unreadable `learners.json` reaches the learner as one plain desk sentence, not 'Try again'. | `learners.ts` reports it only through `tell` (:120-129). | none recorded | queued, delivery 7 |

## 8. tv-phone-pairing

Lite r1: ready, 0.5036. Security-sensitive. A full round follows a clean lite r2.

Must-address:
1. value: The QR and the printed addresses point at the host's first network adapter, which on the measured host is not the Wi-Fi
2. craft: A 4-digit code with no failure delay and no attempt budget: any device on the network becomes a phone in seconds

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PR1 | `phoneUrl` and the printed `/tv?key=` address prefer a private LAN IPv4 (192.168/16, 10/8, 172.16/12) over CGNAT 100.64/10 (Tailscale) and link-local. An explicit env override is kept. | Must-address 1. `phoneUrl()` takes the first non-internal IPv4 (`desk/src/lib/session/store.ts:349-352`); `desk/src/app/page.tsx:6` does the same; the key address is built at `desk/src/lib/session/pairing.ts:163`. | none recorded | queued, delivery 8 |
| PR2 | Keep 4 digits, because viktor-67 types badly and the QR carries the pin. Add a fixed delay on every refused join, and a desk-wide budget of failed joins with a cooldown. Never rotate the pin on lockout: that would lapse every joined phone. | Must-address 2. `desk/src/lib/session/pairing.ts`. | A longer code, and rotating the pin on lockout. | queued, delivery 8 |
| PR3 | A malformed or null POST `/api/session` body gets a 400 (R10). A failed read of `pairing.json` or `session.json` logs one line. | `desk/src/app/api/session/route.ts`. | none recorded | queued, delivery 8 |

Left for a later round, by ruling: expiry and per-phone revoke, a per-device token, and the desk-wide `joined`.

## 9. linga-placement-check, with cefr-certificate-issuance

Placement lite r1: ready, 0.6329. CEFR lite r1: ready, 0.5964. One rework (featureSlug `linga-placement-check`), then a
lite r2 of both.

Must-address:
- placement (1) value: Placement confidence reads 'high' from skips, guesses and one-keyword passes
- CEFR (1) value: The band a certificate names rests on one check that reads high from a guess and a skip, and no evidence corroborates it

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PC1 | A mark carries its kind and its strength. A skip is recorded as skipped: no evidence, never a fail. A two-option choose pass and a one-keyword listen pass are weak. A spoken say pass is strong. | Placement (1). `desk/src/lib/english/placement.ts` (say tasks at :79-81 per LG-18). | none recorded | queued, delivery 9 |
| PC2 | High confidence needs at least two strong passes at the band, plus a fail or partial above it that is not a skip (or the band is the top one). Skips never count. A band that rests only on weak passes or skips reads low. | Placement (1). | none recorded | queued, delivery 9 |
| PC3 | Two partials at one band end the check at that band, at low confidence. This answers LG-18. | LG-18 (`docs/BACKLOG.md:111`). | none recorded | queued, delivery 9 |
| PC4 | A weak pass climbs one rung at most, and never into a say task by itself. | Placement (1). | none recorded | queued, delivery 9 |
| PC5 | Whenever confidence is not high, the verdict screen says in one line what the band rests on. | Placement (1). | none recorded | queued, delivery 9 |
| PC6 | The certificate consumes only high confidence under the new rules. It also needs at least one piece of the learner's own evidence at the band, dated after the check. This closes CEFR craft-1 (R10). | CEFR (1). | none recorded | queued, delivery 9 |

This rework is serial with the Linga rework (delivery 11), because they share files.

## Process rulings

- Every feature passes council-lite.
- A lite-ready feature whose must-address has a high line is reworked before any full round.
- Every rework is followed by a lite r2. A major then gets the full round.
- The council never approves; only the owner does.
- The full round follows for: end-of-session-memory-recap, homework-page-reading, hint-lesson-discovery, tv-phone-pairing, essay-paragraph-analysis, learner-profile-multi-learner-switching and student-working-explanation.
- A harness, environment or measurement item with no product claim is declined in its run's doc only, with no BACKLOG entry.
- Reworks run one at a time, on one delivery lane, so two never edit the same files.
- A mode has three lite rounds. A fourth is refused as stalled, and the owner decides instead.

## Delivery order

1. memory-recap: done.
2. homework: done, 602410d7.
3. hint, carrying X1. The leak checks are shared with explain and marking, so they are fixed once, early. Part 1 done at 445c7bad; part 2 in flight, run a1f30e71.
4. marking false ticks. It is already ruled, and it edits the same rules files, so it runs after the hint rework.
4a. homework r2 rework, HW4-HW6, then the homework lite r3.
4b. MB-B7, the paper picker.
5. explain, X2-X4. It comes after 3 and 4, because explain settles through the same checks and its reply guard is X1.
6. essay.
7. learner-profile. It goes ahead of pairing, because P6 changes the session door that pairing builds on. It now also clears homework's failed-read job (robustness-6).
8. pairing.
9. CEFR with placement.
10. the `uat/` and `tools/` overlay fix (W7).
11. the Linga rework with LG-25, after the owner's Approval of linga-conversation-turn.
12. the claude-era Linga LT run.
13. the recap follow-up, EM-B36 and MB-B23, after learner-profile.
13a. the recap write-door contract. When the owner decides the recap Approval, it goes next on the lane. A rejection's reason joins it. It does not wait for learner-profile.

Unslotted: EM-B11, the essay voice, which now also carries MB-B8's age line.

## Open contradictions

None open.

## Resolved contradictions

1. **Hint voice for vojtech-18 (HL2 against MB-B8).**
   - Ruling HL2: the voice age stays ("a 15-year-old") for vojtech-18, who is declared out of segment.
   - `docs/BACKLOG.md` MB-B8: the teen voice names the learner's age or stage (16-19, "a secondary-school student preparing for a school-leaving exam") instead of "15". The code today speaks to "a 15-year-old" through `TEEN.maths` (`desk/src/lib/rules/voice.ts:69`).
   - Ruling: `desk/src/lib/rules/voice.ts` is untouched, and the teen voice stays 'a 15-year-old' for vojtech-18 and every other teen. The teen table is shared with Essay and pinned byte for byte in `tools/voice-rules-test.cjs`, so the age change lands once, for both apps, with EM-B11. Refinement of HL2: a task that `equationOf` or `expressionOf` reads keeps today's stance byte for byte. Only a task no reader reads gets the neutral stance. Delivered: 0599317f, with the BACKLOG note at 445c7bad.
2. **Squared total on Pythagoras (X1a against MB-B16).**
   - Ruling X1a: the squared total on its own stays legitimate; only the squared total under a root is a leak.
   - `docs/BACKLOG.md` MB-B16: "for a Pythagoras spec the leak profile also refuses the squared answer (1156)", and its tests pin lines such as "c squared is 1156." as leaks. The test pin `tools/school-rules-test.cjs:1628` keeps 'The sum of the squares is 100.' legitimate.
   - Ruling: on a Pythagoras item, take the value the root is taken of: x^2+y^2 for the longest side, x^2-y^2 for a shorter side. Stated on its own, that value stays legitimate: 'c squared is 1156.', 'The sum of the squares is 100.' and '36 + 64 = 100' pass. A line leaks when it puts the value under a root ('the square root of 1156', '√1156', 'odmocnina z 1156'). It also leaks when it states the value with a root instruction in the same line ('c² = 16² + 30² = 1156, teď odmocni.'). 'Then take the square root of the total.' stays legitimate. MB-B16's text that refuses the squared total itself is superseded. In flight: part 2, run a1f30e71, whose builder also edits MB-B16 in BACKLOG.
