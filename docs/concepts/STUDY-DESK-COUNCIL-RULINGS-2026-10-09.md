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
the current line is cited. This doc was updated for round 2 on 2026-10-09 (the first version merged at 7041d11d), for round 3 on 2026-10-10 (round 2 merged at f7f24df5), for round 4 on 2026-10-10 (round 3 merged at a5ff6720), for round 5 on 2026-10-10 (round 4 merged at c28380e2), for round 6 on 2026-10-10 (round 5 merged at d24f824d), for round 7 on 2026-10-10 (round 6 merged at 56431416), and for round 8 on 2026-10-10 (round 7 merged at e74340e8). Ids such as run 13cf8526, d2d908e6, f29f363f, eac6191a, 03fa57dd, 18799a66, 57233789, 6d685adf, 12cf4a44, c448db9f, 3922989d, 9fcfac15, 6cf02f5a, c072cd17, d6cc1be4, 9bcde838, ce489ee7, 0f94108c, d6aad5fb, 7a3b0529, f6b73d06, a03b1279, cc346058, 5d52a422, 0a4ec2cd, 3720e29a, 7d7171be, f1df9456, 77dbd15a, 058f9e18, e1fc9eaf and f795a859 name a run, not a commit.

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
| HW4 | The Tonight screen's Back to the sheet card is `continueCard` (`desk/src/tv/mathsRows.ts:118`, its `findIndex` at :132). It opens tonight's sheet by the same answer as the door, `tonightsSheet` (:21). It is offered only when that sheet was read with at least one problem. With no such sheet, the card is not offered. Older pages stay on the desk. | Must-address 1 (value-5). | A deliberate resume of an older sheet. It contradicts HW2, and its caption 'where you were' misleads. | delivered, afcb2714 |
| HW5 | The printed-number sort in `readPage` (`desk/src/lib/desk/read.ts:82`) holds only when no printed number repeats on the page. A number that repeats with the same label, or with no label, means the sheet has sections that restart. Then walk the items top to bottom by band, and left to right inside one band. A new section starts at the first item whose number and label are already in the current section. Sections keep that page order. Inside a section, items sort by printed number, and lettered parts by label. A page with no repeat keeps today's sort, so robustness-2's two-column fix stands. The rule is the same for maths, English and Essay. Known limit: two sections side by side in two columns are not split. It is stated for the full round. | Must-address 2 (craft-8). | (a) Reading order alone, which breaks a two-column section. (b) The model's own order, which is unobserved on a real page. (c) A section field in the read schema, which changes the shared reader, the same reason craft-1's box was left out. | delivered, d147fcb8 |
| HW6 | The failed-read line on the English page (`desk/src/tv/screens.tsx:122`, today 'could not read this page' followed by 'snap it again') points to Try again on the phone, as HW3 did for maths. | Lite r2 found r1 value-2 closed for maths and unchanged for English (robustness-7). | none recorded | delivered, b2c8389e |

Delivery 4a is run b5a6629d (a run id, not a commit), merged at b2c8389e. Notes from its code, checked on `main`:
- HW5 is `orderItems` in `desk/src/lib/desk/read.ts` (:71). A band runs from the first item to its band end, read left to right, and on equal x the upper item comes first.
- The robustness-2 repeat pin moved by ruling, OLD one, two, two again, three -> NEW two, three | one, two again (`tools/desk-jobs-rules-test.cjs` :560-562).
- The Essay failed-read line names the paste panel: 'Paste or type it on the phone.' (`desk/src/tv/pageLines.ts:9`, where HW6's line now lives).
- Side-by-side sections are not split. That is a ruled limit.

Left out of delivery 4a, by ruling:
- (a) robustness-6 (med): the failed-read job is session-global, so a second learner inherits a Try again that answers 409. It joins P2 in delivery 7. The one function that clears per-learner desk state on a learner change also clears this job.
  - Delivered by 7a (4fef0a35, run 3720e29a): `switchedFrom` (`desk/src/lib/session/store.ts:539`) deletes the failed jobs on a change of the seated learner, and clears the status when the status is their error.
- (b) value-6 (med): a sheet snapped at 23:50 is not tonight's at 00:10. The evening's day is the same `dayOf` that M5 uses, so a change would be one rule for both. It is stated as a limit for the full round.
- (c) MB-B3's read-rate acceptance on real pages. Only the owner can run real pages, so it is a stated ceiling for the full round, like HL7.
- (d) craft-1 band plausibility, value-3, craft-3 and craft-4 are unchanged and not in this rework.

After 4a merges, a lite r3 (the last lite round) runs, then the full round.

Superseded by the plan change (Process rulings): no lite r3 ran, and the full round followed.

Full r1 (round 2026-10-10-homework-page-reading-r1, judged at 87ec2049): ready 0.485, coverage 1.0. Scores: value 0.50, craft 0.55, rivalry 0.55, robustness 0.55, economics 0.05. The judges are uncalibrated; under a trusted state the outcome would be fail.

Must-address, verbatim, all high:
1. craft: A partial read is indistinguishable from a complete one: no completeness verdict, no check of the printed numbering
2. robustness: A good read is thrown away and reported as an unreadable page when the learner file cannot be written
3. economics: Every read adds its page photo to the session, and nothing ever removes it, so each later event costs more with no ceiling

The medium findings left open:
- craft-2, the read-state seam: A fails, B is read, and going back to A shows reading.
- craft-3, 0..1 centres against the Qwen-VL box scale (uncertain).
- craft-4 and robustness-2, the non-atomic session write and its bare catch (`desk/src/lib/session/store.ts:805`; the ruling said about :801).
- craft-5, the think:false fallback (`desk/src/lib/engines/vision.ts:48`, with the note at :4).

value-3 ('No marks were lost' while marks sit on unmapped questions, `desk/src/tv/paperRows.ts:54` and `desk/src/maths/MathsTV.tsx:716`) joins delivery 4b. value-1 (a read sheet is hinted, never marked) is BACKLOG MB-B35, and it is with the owner as a scope question. The owner holds the homework Approval until a full r2 runs.

Full r2 (round 2026-10-10-homework-page-reading-r2, run 18799a66, a run, not a commit; judged at c28380e2): ready 0.5125 (r1 0.485), coverage 1.0.
- Scores: value 0.50, craft 0.68, rivalry 0.50 (low confidence), robustness 0.55, economics 0.10.
- The judges are uncalibrated, so the 0.70 bar does not apply.
- No read has run with the real vision model on a real page.
- Round 1's three must-address lines did not recur.

Must-address, verbatim, both high:
1. robustness: The session write that keeps every read swallows its error with no log, and the read still reports success
2. economics: missingNumbers loops once per integer between two printed numbers the model returns, with no ceiling, and the result is stored and logged whole

Medium findings left open:
- value-retake-double-counts: after a partial read, the TV's 'take a new photo' adds a second page, so the week's digest counts a 5-problem sheet as 4 + 5 = 9, and the phone says 'Read: 4 problems' with no word of the gap. Unslotted.
- economics-2: the page photos are rewritten whole on every session event, including the timer's once-a-second tick.
- robustness-4: BUSY, a mid-read reset and the think:false fallback have no case.
- value-core-read-unrun: no real photo has been read. This is a stated ceiling, like MB-B3, because only the owner can run real pages.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HF1 | A read carries a completeness verdict built from the printed numbering. `missingNumbers` in `read.ts` (:121) does it. A number is missing when it is a whole number between two printed numbers of one run. Runs follow `orderItems`' sections: a repeated number and label starts a new run. Lettered parts count once. A run that starts above 1 has no gap before it. An item with no usable number makes the verdict unknown (null), which is not the same as complete. The page record, the route's answer, the job's done line and a server log line carry the verdict. The page screen shows `missingLine` (`desk/src/tv/pageLines.ts:16`, used at `desk/src/tv/screens.tsx:123`), which asks for a new photo and offers no Try again. | Full r1 must-address 1. | none recorded | delivered, 1d7998ff |
| HF2 | A learner-file write failure keeps the read. The page lands with its items, the job ends done, the answer is 200 with saved false, the error is logged, and the status says `READ_NOT_SAVED` (`store.ts:499`). `job.ts` is unchanged. | Must-address 2. | Failing the read, which spends another vision call on every Try again. | delivered, f071828d |
| HF3 | A learner holds at most `PAGES_KEPT` = 8 pages (`store.ts:497`). A new page past the cap drops the oldest page whole, items and photo. The page being read is never dropped. A read in place adds nothing, and `pageIx` stays on the page just read. A retry for a dropped page answers 409. Accepted limit: a saved session or away slot that already holds more than 8 pages is trimmed only when that learner next reads a new page. | Must-address 3. | none recorded | delivered, bd69ff49 |
| HF1b | The Math Buddy page screen also says `missingLine`. Maths pages render in `PageScreen` in `desk/src/maths/MathsTV.tsx` (:935-946), not in `desk/src/tv/screens.tsx`. So after HF1 a maths learner sees the missed numbers only in the bench status bar (`desk/src/app/tv/page.tsx:152`), which is not on the stage. The line shows when the page's missing list has numbers. It does not displace the reading, failed-read or hint captions. | Must-address 1 for maths, the feature's main subject. 4e's builder raised it. | Leaving the maths TV to the status bar. | delivered, 72a4aadf (run eac6191a) |
| HF4 | The session write in `desk/src/lib/session/store.ts` (today :805, `try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(store.session)); } catch {}`) publishes `session.json` through a tmp file and `renameSync`, the way `desk/src/lib/session/learners.ts` does at :145-149 (`writeBook`). A failed write is logged with `console.error` when writes start failing, and once more when they work again, so the timer's once-a-second event cannot flood the log. The store keeps whether its last write landed. The read route (`desk/src/app/api/read/route.ts`) checks it after its `page.read` dispatch (:60). When that write failed, the answer is 200 with saved false, and the done line is one authored line: 'That page was read, but the desk could not save it, so it will be gone if the desk restarts.' When the learner file failed too, `READ_NOT_SAVED` (`store.ts:499`) is said, as today. `load()` (`store.ts:686`) logs why a `session.json` that exists was not used (a parse error or a failed shape check) before it returns `fresh()`. | Full r2 must-address 1 (robustness-1), with the `load()` half of robustness-2 and craft-1. The same write is the :805 half of digest full r1 robustness-8, and the write half of learner-profile lite r1 must-address 1. HF4 delivers that half for both features. | A log line only, which keeps the torn write and still reports saved. | delivered, cfa59088 (run c448db9f) |
| HF5 | `missingNumbers` in `desk/src/lib/desk/read.ts` (:121, its loop at :126) gets a ceiling, `MISSING_SPAN` = 100. A run whose highest and lowest printed numbers are more than 100 apart makes the verdict unknown (null). This is checked before that run's loop. A list that would pass 100 numbers makes the verdict unknown too. So the loop runs at most 100 times a run, and the stored and logged list holds at most 100 numbers. The read schema (`read.ts:13`) is unchanged. | Full r2 must-address 2 (economics-1). A printed number is model output, and the schema sets no maximum on it. | (a) A maximum in the read schema, which changes what the model is asked and still trusts it to obey. (b) Cutting the list short, which would store a partial gap as if it were the whole one. | delivered, 2d794e64 (run c448db9f) |
| HF4a | The read answer carries `learnerSaved` beside `saved`. That lets the route tell a failed learner-file write (`READ_NOT_SAVED`, which wins) from a failed session write (`READ_NOT_KEPT`). Accepted as built. | HF4 said `READ_NOT_SAVED` wins. | none recorded | delivered, cfa59088 |
| HF4b | `load()` reports a throw after the parse as 'could not be read'. Accepted as built. | HF4 asked `load()` to log why a saved session was not used. | none recorded | delivered, cfa59088 |
| HF4c | Each commit carries its own tests. The HF4 commit was tested with the HF5 tests stripped. | A commit must stand alone for bisect. | none recorded | ruled, no change |

Full r3 (round 2026-10-10-homework-page-reading-r3, run f6b73d06, judged at a6e92668, a span of 20 files): ready 0.5867, coverage 0.90, uncalibrated. This was the last round.
- Scores: value 0.52 (low confidence), craft 0.58, rivalry 0.55, robustness 0.78, economics unmeasured.
- Must-address, as the round's result stores it (the line is cut short there): 'economics is unmeasured: A read consumes resources beyond the desk process: one (at most two) HTTP calls per page to a local Ollama vision model (GPU time; vision.ts:46-49) and...'
- That line was judged before EC1. EC1b (b4b4ea8f) now labels the read's vision call 'homework-read' (`desk/src/lib/desk/read.ts:97`). No later homework round exists to measure it.
- Medium findings left open, all unslotted:
  - economics-1 and economics-2;
  - value-resnap-double-count;
  - robustness-1: the read's onFail cleanup error is swallowed silently (`desk/src/lib/desk/job.ts:100`, `try { opts.onFail?.(e); } catch {}`);
  - craft-1 to craft-3;
  - rivalry-1 to rivalry-4.
- The homework Approval is the owner's to decide.

HF4 and HF5, as delivered (checked on `main` at 2d794e64):
- `writeSession` publishes through a tmp file and `renameSync`, and removes the tmp file on failure (`desk/src/lib/session/store.ts` :821 and :842).
- `console.error` fires once when writes start failing (:826) and once when they recover (:822).
- `READ_NOT_KEPT` is at `store.ts:501`. The read route chooses between it and `READ_NOT_SAVED` at `desk/src/app/api/read/route.ts:65`.
- `load()` (`store.ts:688`) logs a parse error or a failed shape check, and logs nothing when there is no file.
- `MISSING_SPAN = 100` is at `desk/src/lib/desk/read.ts:121`, with its checks at :130-131.
- The gate at 2d794e64: 73 suites, 1305 tests, wall time 113.8 s.

HF1b, as delivered (checked on `main` at 72a4aadf):
- The Math Buddy PageScreen caption chain is now: reading, failed read, hint running, hint failed, missing numbers, then under the lamp or nothing read (`desk/src/maths/MathsTV.tsx:942-947`; the missing-numbers branch is :946). It mirrors the `pageLine` chain in `desk/src/tv/screens.tsx:123`. The 'HF1b:' test in `tools/desk-jobs-rules-test.cjs` (:720) pins it.
- Accepted limit: while a page's missing list has numbers, the missing line takes the place of the 'is under the lamp' caption (`MathsTV.tsx:947`) for every problem on that page. In the band view the focused problem still shows its OK Hint chip. The homework full r2 may judge it.

## 3. hint-lesson-discovery

Lite r1: ready, 0.5814.

Must-address:
1. robustness: One failed embedding call leaves the lesson library's vectors empty for the life of the server, so every later lesson opens at 0:00 and the engine is never asked again

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL1 | Rework before the full round. | The process rule below. | none recorded | delivered, part 1 (445c7bad) |
| HL2 | A school task that reads as neither a fractions unit nor Calculus gets a neutral school-maths stance that names no unit. The voice age stays for vojtech-18, who is declared out of segment. | value-1, MB-B8. `STANCE` in `desk/src/lib/desk/hint.ts:44`, chosen at :63-66. | none recorded | delivered, 0599317f |
| HL3 | `leaksCalc` catches a Calculus answer said in words. | robustness-2. `leaksCalc` (`desk/src/lib/rules/calc.ts:512`), called at `desk/src/lib/desk/explain.ts:224`. | none recorded | delivered, 8a568751 |
| HL4 | `embeddings.json` is written atomically and keyed by model and transcript. A truncated cache is rebuilt, not fatal. | robustness-3 and craft-2. | none recorded | delivered, 331107da |
| HL5 | The picker refuses a lesson id outside the menu it offered. | craft-1. | none recorded | delivered, 2be44253 |
| HL6 | The fractions fallback line is 25 words or fewer. | value-3. | none recorded | delivered, e3661325 |
| HL7 | The thin-evidence ceiling on the window goes into the full round as a stated ceiling. Closing it needs a bench on real transcripts, which only the owner can run: `desk/data/` is off limits to builders. | The `desk/data/` boundary. | none recorded | queued, delivery 3 |

The same rework owns MB-B2, MB-B8, MB-B16 and MB-B33. It also carries X1 (section 5).

Delivery 3 was split into two branches on one lane. Lost: one branch. The reason: MB-B2 changes the shared reader (`readQuestion` also feeds `likeTopic`), and the guard is a different shape from lessons and stance.
- Part 1 (lessons, stance and length) is run c75ab4a7, merged 445c7bad. Its commits: HL4 331107da, HL5 2be44253, HL2 0599317f, HL6 e3661325, the MB-B33 length cap d642c422 and Mic 5a2135b9, the MB-B8 grounding c7460599, and the BACKLOG notes 445c7bad.
- Part 2 (the shared leak guard: X1, X1a, X1b, X1c, HL3, MB-B16, MB-B2) is run a1f30e71, merged at 1c38f546. Its commits: X1 0af79dcd, X1a 9def48b2, X1b 42e666f7, X1c 42e666f7 (no code of its own; its guard case shares the table commit), HL3 8a568751, MB-B16 66602171, MB-B2 119988a1 with its fallback c4d9ef75, and the BACKLOG notes 1c38f546.

HL7 stays queued as a stated ceiling for the full round. A lite r2 follows part 2's merge.

Superseded by the plan change: the hint goes to its full round after 4f, with no lite r2.

Part 2 rulings:

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL8 | (part 2 Q1) ':' between two fractions reads as division on every system. | A ratio's value is the quotient, and the checks compare values. | Restricting it to cz and de now. That is one line in `taskText.plainTask` if a real sheet shows harm. | delivered, 119988a1 |
| HL9 | (Q3) The MB-B2 fallback refuses only a line that states a solution. The half that refuses a number the item's own text lacks stays unbuilt, because the full rule refused 5 of 24 real stages. It is a stated ceiling for the hint full round. | MB-B2. | The full rule. | delivered, c4d9ef75 |
| HL10 | (Q4) The leak check reads Czech 'jedna', 'jedno' and 'jeden' as 1. Accepted as a ceiling, because it only causes a refusal, the safe failure, and only when the answer is 1. | X1b. | none recorded | delivered, 42e666f7 |
| HL11 | Flag for the hint full round: tasks the reader newly reads as school (Czech fraction tasks, '3/4 : 1/2') now end as 'no lesson for this' instead of reaching the lesson picker. No test covers it, and it may be a value regression. 'Solve 3x - 7 = 11.' now takes the linear stance. | HL8 and MB-B2 widened the reader. | none recorded | judged in full r1, no change: value-5 (low) reads the school-unit skip as the more useful bridge, because Six like this takes the lesson's place; rivalry-2 (med) reads the same skip as behind on lesson coverage. Neither is a must-address line. |
| HL12 | (D2 Q3) Finding: `leaksCalc` reads windows of at most six tokens (`WINDOW = 6`, `calc.ts:498`). So a right function answer longer than that, said whole in a hint, is not refused. There are two corpus cases: the 11-token derivative of x^2 e^x sin(x), and (x^2 - 2x - 1)/(x - 1)^2 (7 tokens). fb201a90 pins them as they stand (`tools/calc-hint-test.cjs` :254-258). Decision: widen the window in its own delivery, 4f, before the hint full round. | D2 Q3. | Folding it into D2. | delivered, b3e3335e (run 57233789; the first run, 6d685adf, made no commits) |
| HL12a | The long pass also reads the line as it was before the question's own function is stripped from it, and only when the strip changed the line. It can only add refusals. The strip is `text = text.replace(piecePattern(p.toLowerCase()), " ")` (`desk/src/lib/rules/calc.ts:536`), the raw pass is `if (raw !== text && longRight(tokenize(raw))) return true;` (:607), and `raw` is set at :526. | The first 4f run stopped with no commits, because the strip erased the middle term of the 11-token corpus answer. | Leaving a right answer said in full un-refused. | delivered, b3e3335e |

HL12, as delivered (checked on `main` at b3e3335e):
- `LONG_WINDOW = 24` (`desk/src/lib/rules/calc.ts:500`), beside `WINDOW = 6` (:498).
- The D2-3 long list moved from 2 entries to `[]` (`tools/calc-hint-test.cjs`, `assert.deepEqual(long,[],'the long passes read the longer answers (HL12)')`, in the D2-3 test at :228). The old pin was `assert.deepEqual(long,['derivative x^2 e^x sin(x): 2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)','derivative (x^2 + 1)/(x - 1): (x^2 - 2x - 1)/(x - 1)^2'],'the six-token window, pinned as it stands')`. A new 'HL12:' test pins the refusals and the non-refusals.
- At b3e3335e there were 73 suites and 1297 tests.
- The accepted cost was up to +30% gate wall time. The measured change was none: 148.2 s -> 141.2 s.

Full r1 (round 2026-10-10-hint-lesson-discovery-r1, run 6cf02f5a, judged at d24f824d, a span of 31 files): ready 0.5556, coverage 0.90.
- Scores: value 0.50 (low confidence), craft 0.60, rivalry 0.55 (low confidence), robustness 0.60, economics unmeasured.
- The judges are uncalibrated.
- No real text model ran, and no lesson retrieval ran on the real transcripts. HL7 and HL9 stood as stated ceilings.

Must-address, verbatim:
1. craft: The lesson 'why' line reaches the TV past the leak rule on two input classes the hint guard covers
2. robustness: The lesson pick's 'why' skips the leak check on items the hint path does check, and the TV shows it
3. economics is unmeasured: Metered calls exist, but there are no telemetry rows and no declared price book.

Lines 1 and 2 are one defect, found by two members.

Medium findings left open, all unslotted (current lines checked on `main` at 2d794e64):
- value-1: the leak backstop (`leaks`, `desk/src/lib/rules/maths.ts:230`) misses a mixed-number sum, a Czech percent task, a Czech 'derivative of' task and an implicit dy/dx.
- craft-5: an answer written as arithmetic that evaluates to it passes, such as 'x = 2·3' (the same `leaks`, `maths.ts:230`).
- value-2: maturita shapes out of segment get no code leak check (the HL9 ceiling).
- value-3: the hint is not told which language to write in (`hint()`, `desk/src/lib/desk/hint.ts:141`).
- craft-2: nomic-embed-text is called without its search_query and search_document prefixes (`desk/src/lib/engines/embed.ts:14`; the calls are `desk/src/lib/library/lessons.ts:75` and :100).
- craft-3: the window seek has no relevance floor, and an embedder outage loses the chosen lesson (`bestWindow`, `lessons.ts:96`, its embed call at :100).
- craft-4: stage 2's 'one step further' is enforced only by the prompt (`hint.ts:163-164`).
- robustness-2: three errors are dropped with no log. One of them is the re-ask catch in `hint.ts` (:177).
- economics-2: a text call is capped only by its 90 s deadline (`DEADLINE_MS.text = 90000`, `desk/src/lib/engines/call.ts:14`).
- economics-3: `askedQ` has no length cap on the phone (`desk/src/app/phone/page.tsx:271`) or on the server (`desk/src/app/api/hint/route.ts:22`).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL13 | The lesson's why passes the same leak check as every hint line. `pickLesson` takes the learner's school system, and the hint route passes the system it already holds (the call is `desk/src/app/api/hint/route.ts:55`; `pickLesson` is `desk/src/lib/desk/pick.ts:24`). `checkedWhy` (`desk/src/lib/desk/pick.ts:18`, its gate at :19) drops its gate on `equationOf` or `expressionOf`. For every maths item it asks the predicate the hint uses: `leaksLine` in `desk/src/lib/desk/hint.ts` (:105-107). That is `leaks(problem, line, system)`, `leaksCalc` on the calc spec and on each part, and `leaksSchool` on the school spec, with the specs from `readQuestion(problem, system)`. Both paths call that one function, not a copy, so they cannot drift apart again. The built replacement line is checked by the same predicate, and the generic line stays the last resort. English and essay are unchanged. | Full r1 must-address 1 and 2 (craft-1, robustness-1). Stubbed probes got these whys back verbatim: 'The answer is 19.' on 'Sara has some sweets. She gives away 7 and has 12 left. How many did she start with?'; 'Chosen because x = 10 here.' on a cz learner's 'Řeš rovnici: 0,5x + 2 = 7'; 'The answer is 6.' on 'Find the derivative of f(x) = x^2 at x = 3.', for a learner on a school path. The TV shows the why (`desk/src/maths/MathsTV.tsx:1052` and :1064, and `desk/src/tv/screens.tsx:199`). The one suite case on it is `tools/withhold-rules-test.cjs` case 14 (:208), and it uses equation items only. | (a) Adding readers to `checkedWhy`'s own gate. That keeps a second predicate that can drift from the hint's. (b) Never showing the model's why, and always showing the built line. That drops a sentence that is safe on most items. | delivered, ed13a024 (run c072cd17) |

- Must-address 3 is the gap EC1 closes. It gets no hint-only rework. EC1 counts the hint's text calls (up to two per stage) and the lesson pick's call.

HL13, as delivered (checked on `main` at ed13a024):
- `leaksLine` and `Specs` in `hint.ts` (:105, :102) only gained `export`.
- `checkedWhy` in `pick.ts` has no `equationOf` or `expressionOf` gate left. It reads `readQuestion(problem, system)` and calls `leaksLine` on the why and on the built line.
- The hint route passes `system` (`desk/src/app/api/hint/route.ts:55`).
- `tools/withhold-rules-test.cjs` case 14 is unchanged, and case 16 was added.
- 73 suites, 1314 tests.
- All three leaking probes now get the built line.
- Noted, not fixed: the route proof uses the cz probe. If `leaksLine` flags 'x = 10' even without the system, that assertion does not prove the system is passed. The source diff does prove it.

Full r2 (round 2026-10-10-hint-lesson-discovery-r2, run 77dbd15a, finished by resume run 058f9e18). It was judged at e74340e8 on a span of 34 files: full r1's 31 plus `desk/src/lib/engines/meter.ts`, `desk/src/lib/engines/prices.ts` and `tools/econ-rules-test.cjs`. Drift: changed. Result: ready 0.6035, coverage 1.00, uncalibrated.
- Scores: value 0.47, craft 0.60, rivalry 0.60 (low confidence), robustness 0.75, economics 0.80.
- Must-address: none. The council ran `tsc --noEmit`, and it exited 0.
- Medium findings left open, all unslotted:
  - robustness-1: two catches drop their error silently. One is the `embeddings.json` cache write (`desk/src/lib/library/lessons.ts`, :62).
  - robustness-6: a spanned suite holds a 50 ms wall-clock bound that flakes under load.
  - craft-1: the hint and lesson-pick prompts take untrusted text with no fence.
  - craft-2: `askedQ` is neither type-checked nor capped at the route.
  - craft-3: nomic-embed-text is called without its `search_document:` and `search_query:` prefixes.
  - craft-4: two predicates decide 'is this Calculus'.
  - rivalry-2 with value-2: the 8-video library reaches almost none of the declared characters' items.
  - rivalry-3 with value-3: on an item no reader parses, a line can state the answer without 'answer' or 'x =' and pass. That includes the lesson why. This is stated ceiling 2 (`desk/src/lib/rules/maths.ts`, :246-262).
- The hint Approval is the owner's to decide.

Noted, unslotted: the hint's own leak re-ask (`hint.ts:177`) is metered as try 1, not try 2. A fix would edit `hint.ts`, which is in the hint span, so it waits until hint full r2 has run. Hint full r2 has run, so the hint span no longer holds it back. It stays unslotted.

## 4. Marking false ticks and false rings (practice-generation-marking)

Status of the work, checked on `main`:
- Delivery 4 (run c2f1a530, merged b5cd169e): MB-B26 e4dc93f5, MB-B27 ebdddf7c, MB-B28 9c777d5d, BACKLOG b5cd169e.
  - The linear battery judged 12,350 answers, with 0 false rings and 0 false ticks.
  - Pins moved by ruling: 'x^3 - 4ln(x) + C' for 3x^2 - 4/x, right -> not sure. The calc2-path partial-fractions answers, ln(x) -> ln|x|, and 'ln(x) - ln(x+1) + C' is now not sure. calc1-frozen.json: specs 163 -> 166, calls 3690 -> 3756, and one row right -> not sure.
- Lite r2 (2026-10-09-practice-generation-marking-lite-r2, at b2c8389e): ready 0.656, coverage 0.70. Scores: value 0.62, craft 0.72, robustness 0.62 (was 0.82). Must-address, verbatim:
  1. robustness: False ring: the right derivative of ln(1-x) is marked wrong (also ln(2-x), ln(4-x^2))
  2. robustness: False ring: a right 2-place rounding of a halfway limit or integral (0.38 for 3/8) is marked wrong
  Both were already present at b8558e80, the head the full r1 judged. So the full r1 ready does not describe the marking, and the owner was told to hold the marking Approval.
- D2 (run 7f0915e5, merged c62de4fb): D2-1 5a55d9e7, D2-2 f4a56e98, D2-3 fb201a90, D2-4 c62de4fb. 73 suites, 1285 tests. Moved pins, OLD -> NEW:
  - CHECKS x^2 on [0,1], '0.3': wrong -> not sure;
  - (1+1/x)^x, '2.7': wrong -> right;
  - MB-B28 '2.7 for e': wrong -> right;
  - calc2 (1+1/n)^n, '2.7': wrong -> right;
  - the chain fixture 'ln(x) + C' for 1/x: true -> null;
  - two calc1-frozen rows moved the same way.
- Full r2 (round 2026-10-10-practice-generation-marking-r2, run 13cf8526, judged at c62de4fb): ready 0.6433, coverage 0.90. Scores: value 0.58, craft 0.72, rivalry 0.60 (low confidence), robustness 0.70 (0.85 in r1). Economics is unmeasured. The judges are uncalibrated. Must-address, verbatim:
  1. robustness: A photo the vision engine reads as zero items is landed as a marked set, recorded, and locked against a re-snap
  2. economics is unmeasured: Metered calls exist, but there are no telemetry rows and no declared price book.
- Its other findings, and where each one went:
  - robustness-2 (no route case for a failed vision call): delivered by D3-3.
  - robustness-3, low (an empty or non-string image): delivered by D3-2.
  - value-unsure-says-different: an unsure item still tells the learner 'I got something different' (`desk/src/lib/rules/kinds.ts:163`, `desk/src/lib/rules/maths.ts:93`, `desk/src/maths/MathsTV.tsx:808-811`; the said line is built at :811). It joins delivery 4d.
  - value-calc-gaps: there is no implicit differentiation shape, and the 40-character typed cap refuses a correct 45-character answer. Unslotted, for the owner to weigh.
  - craft-1: the linear photo prompt still asks the reader to solve and judge while it copies. Unslotted.
- The owner holds the marking Approval until marking r3, which runs after EC1.
- Full r3 (round 2026-10-10-practice-generation-marking-r3, run cc346058) was judged at f06984ef on a span of 36 files. Drift: changed. Result: ready 0.6885, coverage 1.00, no must-address line, no hard failure. This was the last round.
- Scores: value 0.62, craft 0.74 (low confidence), rivalry 0.60, robustness 0.85, economics 0.70.
- Medium findings:
  - robustness-1: when a read has a duplicate item, the order decides the verdict (`desk/src/lib/desk/mark.ts`, :206; `desk/src/lib/rules/kinds.ts`, :151-152).
  - economics-1: a practice run dropped by a learner change still spends its second round.
  - economics-2: the mark route passes a photo of any size to vision.
  - economics-3: photo marking has no measured row.
  - value-1: every unsure item says 'I got something different'.
  - value-2: Calculus gaps.
  - value-3: the TV never names the typed route.
  - value-4: no MB4 recovery row leads to its practice set (`desk/src/tv/keys.ts`, :484-488).
  - craft-1: there are five decimal-comma readers, and two of them disagree.
  - craft-2: `use` is an optional free string.
  - rivalry-2 and rivalry-3.
- value-1 is the same item as value-unsure-says-different. It joins delivery 4d. The rest are unslotted.
- The marking Approval is the owner's to decide.
- D3. Run d2d908e6 was held on one stale pin, at `tools/maths-rules-test.cjs:101-102`. Resolution run f29f363f added D3-5 and fast-forwarded, and it merged at f9f8276b. The commits:
  - D3-1 0b8b61fc, with its tsc fix fc113ec3;
  - D3-2 95ceb422;
  - D3-3 95d7e462;
  - D3-4 efdcdd54;
  - D3-5 f9f8276b.
  At f9f8276b: 73 suites, 1295 tests. Moved pins, OLD -> NEW:
  - `tools/maths-rules-test.cjs` (:102-104 now): the empty read resolves with 6 unsure -> it rejects EMPTY_MARK, with skill undefined, history length 0 and digest length 0;
  - calc marking tests 4 and 5 in `tools/calc-marking-test.cjs` (:203, :254 and :265): the student's answer is now '?' instead of '', which keeps their unsure purpose.

These are the App Master's rulings, not the owner's.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| MK1 | (MB-B27) An answer undefined where the truth is defined reads not sure, with a domain line in the desk's words, never wrong. The check runs one way only, so 1/x for the derivative of ln x is never refused. | Items state no domain, and on x > 0 the answer is correct. | Wrong, which would be a false ring. | delivered, ebdddf7c |
| MK2 | (MB-B28) A decimal for a limit or a definite integral is right only as the exact value correctly rounded at its own written precision, and only inside today's tolerance. calc2 `judgeLimit` takes the same rule. `ROUNDED_CLOSE` and the leak checks are unchanged. | MB-B28. | none recorded | superseded by MK5 (its tolerance clause). Delivered, 9c777d5d |
| MK3 | `chain.ts:94` is left alone in delivery 4, because it draws a pen, not a tick. | Delivery 4 scope. | none recorded | superseded by MK8 |
| MK4 | (DQ1) '2,718' in a Calculus answer reads not sure today (unreadable), which is a safe failure. The decimal comma is wanted only for an answer that is one number alone (a limit, a definite integral, an evaluation, a derivative at a point), with one comma between digits. It is never read inside an expression, where a comma separates arguments or points. | A decimal comma is a school habit in cz and de. | none recorded | delivered, 0a7c2dd5 (run 12cf4a44); the judge half is 2b1085d8 |
| MK4a | The judge reads that comma only for a learner whose school system uses a decimal comma, cz or de. This is `commaSystem` in `desk/src/lib/rules/taskText.ts` (:32), the rule school marking already applies to a typed answer (`tools/school-marking-test.cjs` :425). For us, uk and no system, the answer stays not sure, because in us and uk '2,718' is two thousand seven hundred and eighteen. | MK4 named no system. | Reading the comma for every learner. | delivered, 0a7c2dd5 (run 12cf4a44); the judge half is 2b1085d8 |
| MK4b | The leak checks stay at least as strict as the judge (the D2-3 rule, `tools/calc-hint-test.cjs` :228). A hint or explanation line that states a number answer with a decimal comma ('The limit is 2,72.') is refused for every learner, with no system needed. An added pass sends the comma-read line through the whole check once. It can only add refusals. | MK4a widens what the judge reads. | none recorded | delivered, 0a7c2dd5 (run 12cf4a44); the leak half is a2421d81 |
| MK5 | (R1a) A correct rounding of a limit or a definite integral at its own written decimals is never wrong. It is right with two or more significant figures (2.7 for e, 0.38 for 3/8, 3.0 for 3). It is not sure with fewer (0.3 for 1/3, 0.0 for 1/32). A decimal that is not a correct rounding keeps the old path: not sure inside `ROUNDED_CLOSE`, wrong outside it. One function in `calc-read.ts` decides it for both judges. D2 Q1, ruled: R1a holds literally, so a one-figure correct rounding reads not sure even inside the old window (0.4 for 0.4012). No corpus case has it. | Lite r2 must-address 2. | The old 5e-3 window running ahead of `roundsTo`. | delivered, 5a55d9e7 |
| MK6 | The judge uses one-direction defined-ness and compares only where both sides are defined. An answer defined where the truth is not is no gap. An answer undefined where the truth is defined stays MK1's not sure. So the right derivatives of ln(1-x), ln(2-x) and ln(4-x^2) are right. -ln(1-x)+C for 1/(1-x) and ln(x-2)+C for 1/(x-2) read not sure. D2 Q2, ruled: a negated answer that differs only in defined-ness now carries the 'sign' slip, and the verdict stays wrong. | Lite r2 must-address 1. | The two-way skip in `pairs()`. | delivered, f4a56e98 |
| MK7 | Accepted ceiling: ln(x+4)+C for 1/(x+4) reads right, because its gap lies outside every sample (`SAMPLES` spans about -3.32 to 4.80). `SAMPLES` is not widened. | The sample set is fixed (`desk/src/lib/rules/calc-expr.ts:704`). | Widening `SAMPLES`. | pinned as a named limit in D2: f4a56e98, `tools/calc-rules-test.cjs` :483-484 |
| MK8 | `chain.ts` takes the one-way rule. A working line that is undefined where the line before it is defined is not a clean step (null, not true). The function is `oneWay` (`desk/src/lib/rules/chain.ts:95`). The line `chain.ts:94` that MK3 named has moved. | MK3 left the pen alone in delivery 4. | none recorded | delivered, c62de4fb |
| MK9 | (DQ2) '1/abs(x)' for the derivative of ln x reads right, because it agrees with 1/x wherever ln x is defined. | The one-way rule (MK6). | none recorded | ruled, no change (no test pins it; none found in `tools/` or `desk/src`) |
| MK10 | (D2 Q4) The unsure reasons reach the learner. Today `settleSpec` in `maths.ts` (:155) drops every unsure reason (it returns null at :158 and :163), so MK1's domain line and the rounded line never reach the screen, which they were meant to. The lite r2's medium findings go with it: the /api/mark vision-failure test and the empty-image refusal. | MK1 and MK5 promised the lines. | none recorded | queued, delivery 4d. Its /api/mark vision-failure test and its empty-image refusal were delivered by D3 (95d7e462, 95ceb422). 4d keeps the unsure reasons, value-unsure-says-different and maybe MK12. |
| MK11 | (D3-1) A photo read with no non-blank answer to any question of the set is a failed mark. That covers no items, numbers outside the set, and every answer blank. `mark.ts` throws `DeskSaid(EMPTY_MARK)` (`desk/src/lib/desk/mark.ts:206`, the message at :211) and the route answers 502. Nothing is recorded: no history line, no digest entry, no attempt. The set stays open, so the next snap marks. Accepted limit: one non-blank matched answer still lands the set, because marking has no completeness check for a partial photo read. Pinned by `tools/calc-marking-test.cjs:368` and `tools/school-marking-test.cjs:1057`. | Full r2 must-address 1. | Landing an empty set as marked. | delivered, 0b8b61fc (tsc fix fc113ec3). Its old pin moved in f9f8276b. |
| MK12 | A candidate, from D3's answer. Finding: a typed set whose every answer is blank lands today, with a history line and a digest entry but no attempt. The phone disables Send until a box has text (`tools/phone-panel-test.cjs:289-290`), so only a raw API body can reach it. Decision: a candidate only, to refuse it 400 before the job. | none (a finding from D3, not a council line) | none recorded | unslotted; it may fold into 4d |
| EC1 | An economics instrument. Per-use rows carry the provider, ms, tries, the CLI envelope's usage, and failed runs. A price book is declared: the claude CLI on the subscription, and Ollama local. A measured sample is committed in the tree. It is measured live only outside any gate, and only through the claude CLI. | Full r2 must-address 2 (economics unmeasured). The homework full r1 also scored economics 0.05. | none recorded | delivered, 0ddf3c43 (run d6cc1be4) |
| MK4c | `calc2.ts` keeps its own two-line `commaSystem` copy and does not import the one in `taskText`. | `calc2-seam-test` pins calc2's imports. calc2 already rewrites `calc.ts` lines at the same seam. The MK4 parity asserts on the SEQ and AP specs catch drift. | Importing `commaSystem`, which moves the seam pin. | delivered, 0a7c2dd5 |
| EC1a | `tools/run-rules.cjs` gives each suite its own `DESK_USAGE_FILE` in a fresh temp dir, unless one is already set. Stub-engine rows then stay out of `desk/data`. | `meter.ts` falls back to `<cwd>/data/usage.jsonl` when neither `DESK_USAGE_FILE` nor `DESK_DATA_DIR` is set. The runner starts every suite with cwd `desk/`. In the main checkout, `desk/data` holds real learners. Against the unchanged runner, a gate run wrote 81 rows, all kind vision and all with no use. Case (i) in `tools/harness-rules-test.cjs` failed before the fix and passes after it. | none recorded | delivered, 90d957a9 (run 9bcde838) |
| EC1b | Labels on the remaining engine calls: 'homework-read' (`desk/src/lib/desk/read.ts:97`), 'paper-read' (`desk/src/lib/desk/paperRead.ts:53`), the three 'explain' calls (`desk/src/lib/desk/explain.ts:76`, :118 and :166), 'memory' (`desk/src/lib/desk/memory.ts:67`), 'worked-idea' (`desk/src/lib/desk/worked.ts:46`), 'english-sentence' (`desk/src/lib/desk/english.ts:33`), 'linga-check' (`desk/src/lib/english/check.ts:75`) and 'speak' (`desk/src/app/api/speak/route.ts:13`). Case i pins five of them behaviourally, and case i2 pins the rest by source. | An unlabelled call writes rows with use null, which are unattributed (`docs/economics/EC1-SAMPLE-2026-10-10.md`). | An ALS {use, job} scope in `job.ts`, which labels by context, not at each call site. It was not built. | delivered, b4b4ea8f (run ce489ee7) |
| EC1c | The seven Essay Master and Linga text calls are labelled: 'essay-read' (`desk/src/lib/desk/essay.ts:78`) and 'essay-revise' (`essay.ts:183`); 'linga-take' (`desk/src/lib/english/conversation.ts:155`), 'linga-pitch' (:214), 'linga-opening' (:235) and 'linga-cut' (:289); and on the turn call (:328) `use:action==="coach"?"linga-coach":action==="replay"?"linga-replay":"linga-turn"`. Case j in `tools/econ-rules-test.cjs` pins each label. It also pins that, in each file, the count of `await text<` equals the count of `use:` (2 in essay.ts, 5 in conversation.ts), so a new unlabelled call fails. | The same as EC1b. Digest full r3 spans essay.ts and conversation.ts, so EC1c had to merge first. | none recorded | delivered, 8583b29b (run 7a3b0529) |
| EC1c-a | Case j keeps source pins only. No ledger-row assertion through a stub provider is required for `analyseEssay` or `reviseSentence`. | Case a already proves that a use label reaches its row for any text call. Case i2 pins explain, the Linga check and speak by source in the same way. | A stub-provider row assertion. It was not attempted, and not shown to be impossible. | ruled, no change |
| EC1d | A candidate only. Two kinds of engine call still write rows with use null. Both need an `engines/` change. (1) The speech-to-text route (`desk/src/app/api/listen/route.ts:12`). `listen()` in `desk/src/lib/engines/listen.ts` (:63) takes only `timeoutMs`, so its `call()` (:64) passes no use. (2) The four live probes in `desk/src/lib/engines/health.ts` (:94-99). They run only on `GET /api/smoke?live=1`. | none (the App Master found them after EC1c) | none recorded | unslotted |

EC1, as delivered:
- Four commits: fdbafce1, 1362af76, 03d2a076 and 0ddf3c43.
- `desk/src/lib/engines/call.ts` writes one row on success (:41) and one on failure (:45).
- `meter.ts` and `prices.ts` are new.
- An unreported token class and an unpriced `marginalUsd` are null, not 0, and no row holds prompt text.
- The sample (`docs/economics/EC1-SAMPLE-2026-10-10.md`): 13 claude CLI calls on haiku, 0 failures, notional total 0.0122 USD. The per-use split is in that doc.
- The gate after EC1: 74 suites, 1323 tests. After EC1c: 74 suites, 1331 tests.

MK4, MK4a, MK4b and MK4c were delivered by run 12cf4a44 in three commits: 2b1085d8 (the judge reads the comma for cz and de), a2421d81 (the leak checks) and 0a7c2dd5 (the calc2 seam). All three are on `main`.

Noted, not fixed: the middle commit a2421d81 alone fails `calc2-seam-test`, so a bisect that lands on it reads red.

Round 4 ruled the economics instrument as E1. Essay section 6 already holds E1, so from round 5 on it is EC1. Its decision is unchanged.

The economics lines of marking full r2 and hint full r1 are the same gap, and EC1 closes both.

EC1 merged at 0ddf3c43, and EC1a to EC1c finished the labels on 2026-10-10. Marking full r3 carries the sample in its economics pack.

## 5. student-working-explanation

Lite r1: ready, 0.5821, coverage 0.70. Tier: major, because it changes a recorded verdict from a model's transcription, on
Math Buddy's marking path.

Must-address:
1. value: The youngest Czech character cannot reach the feature in a language she can use; there is no typed path while a recogniser exists
2. robustness: The explain reply is guarded only by leak checks with reproduced holes; a reply that completes the answer in another form is shown

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| X1 | The leak gap is fixed once, in the hint rework. The explain reply is checked by the same three functions, `leaks`, `leaksCalc` and `leaksSchool`, and the council found the gap is exactly MB-B16's. The hint rework adds tests through `explainItem`, with the model stubbed. | Must-address 2, MB-B16. `desk/src/lib/desk/explain.ts:224`. | An explain-only guard. It would be a second copy of the same check. | delivered, 0af79dcd |
| X1a | On a Pythagoras item, a line that puts the item's squared total under a root is a leak, even when it does not state the root. Examples: 'the square root of 1156', 'the root of 1156', the root sign before 1156, Czech 'odmocnina z 1156'. The squared total on its own stays legitimate. | `tools/school-rules-test.cjs` `PYTH_LEGIT` (:1626) pins 'The sum of the squares is 100.' (:1628). | MB-B16's recommendation to refuse the squared total itself. It reverses a pinned design choice and leaves a second hint nothing to say on a Pythagoras item. | delivered, 9def48b2 |
| X1b | The leak checks read number words as figures before they compare. The words come from one closed table under `desk/src/lib/rules/`. English and Czech cardinals from zero to twenty, and the tens to a hundred. Fraction words from half to twentieths: Czech polovina to dvacetina, with and without diacritics, singular and plural. 'Pravdepodobnost je tri trinactiny.' on a 3/13 item is a leak. | Must-address 2. The leak checks work on figures today (`leaksSchool`, `desk/src/lib/rules/school.ts`). | Telling the model to write figures only. The guard has to hold whatever the model writes. | delivered, 42e666f7 |
| X1c | Settling from words is not widened. 'three quarters' and 'tri ctvrtiny' still settle nothing, which is the safe failure. | Marking path safety. | none recorded | delivered, 42e666f7 (no code of its own) |
| X2 | A 'Type it' control is always beside the hold-to-speak button. Today the textarea appears only when there is no recogniser. The recogniser language follows the learner's school system: cs-CZ for cz. | Must-address 1, MB-B18. `desk/src/app/phone/page.tsx:288` (`r.lang = "en-US"`) and :544-556 (textarea at :550). :288 is also MB-B33's line; whichever rework lands first sets it. | none recorded | queued, delivery 5 |
| X3 | When an explain settles an unsure item, the phone's reply and the TV's item line name the value the desk took from the learner's words, e.g. 'The desk heard 11/12.'. It is the learner's own value, so it is not a leak. When nothing settles, no value is named. | Must-address 1, second half. | none recorded | queued, delivery 5 |
| X4 | The explain prompt also gets the learner's written answer, the transcribed working, and the slip and line the desk found. This comes only after X1 holds. | MB-B10. `desk/src/lib/desk/explain.ts` prompt build (about :100-127). X1 is MB-B10's own ceiling. | none recorded | queued, delivery 5 |

X1 rode the hint rework (delivery 3, part 2, merged at 1c38f546). X2-X4 are their own rework (delivery 5), then a lite r2, then the full round.

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

HF4 (delivery 4h) delivers the write half of must-address 1: tmp and rename, a logged write failure, and a logged load() fallback. The reset to fresh itself, and must-address 2 and 3, stay with delivery 7. HF4's own commit is cfa59088. 2d794e64 is HF5, the tip of delivery 4h.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| P1 | `session.json` is written through a temp file plus rename, as `learners.ts` does. A failed write is logged and shown as status, never swallowed. `load()` validates each profile: a bad profile is dropped and logged, and the rest are kept. An unparseable file is moved aside (`session.json.bad-<stamp>`), logged, and said in a status line. `profile.draft` and `profile.save` check type against `AGE_RANGE`, and the other fields too. They refuse a bad patch in plain words. | Must-address 1. The write is a bare `writeFileSync` inside `try {} catch {}` (`desk/src/lib/session/store.ts:745`). `load()` (:658) falls back to `fresh()` on any error. The temp-plus-rename model is `desk/src/lib/session/learners.ts` (rename imported at :8). `AGE_RANGE` is `desk/src/tv/profileRows.ts:13`. | none recorded | delivered: the write half in cfa59088 (HF4); the load, draft and save halves in 4fef0a35 (7a, run 3720e29a) |
| P2 | One function clears the per-learner desk state on any change of the seated learner, and both `learner.set` and `profile.save` call it. An edit of the seated profile keeps the running conversation. | Must-address 2. `learner.set` (`store.ts:516`) clears state; `profile.save` (:520) does not. | none recorded | delivered, 4fef0a35 (run 3720e29a); its follow-up P2-a in 60d9398c (run f1df9456) |
| P3 | `english.set` carries an owner, as `essay.set` does. One for a learner who is not seated is dropped and logged. The analyse job slot is keyed per learner. | Must-address 3. `english.set` has no owner (`store.ts:561`); `essay.set` checks `e.owner` (:566). | none recorded | delivered, 4fef0a35 (run 3720e29a): the owner half as written; the per-learner slot as P3-a, which supersedes that clause |
| P4 | While a Linga scene or a level check is running, the switcher says in one line that switching ends it. | Switching ends them today. | none recorded | queued, delivery 7b, widened by P4-a |
| P5 | Profile ids are checked unique on draft and save. A patch naming another learner's id is refused. | Must-address 1 family (data path between learners). | none recorded | delivered as P5-a, 4fef0a35 (run 3720e29a) |
| P6 | `reset` joins `SERVER_ONLY`. Profile removal and the demo pair are NOT in this rework: removal deletes a child's data and needs its own design after the full round. | `SERVER_ONLY` (`desk/src/app/api/session/route.ts:12`) does not list `reset` today. | Building removal now. | delivered as P6-a, 4fef0a35 (run 3720e29a); P6-a supersedes the SERVER_ONLY clause |
| P7 | An unreadable `learners.json` reaches the learner as one plain desk sentence, not 'Try again'. | `learners.ts` reports it only through `tell` (:120-129). | none recorded | delivered in part: the switch half in e4b33fb9 (WD14a, run 0a4ec2cd); the rest is P7-a, queued, delivery 7b |
| P1-a | (7a question 3) `load()` drops a profile that is not an object, and a profile whose name is not text. Both are within P1. | 7a's question 3. | none recorded | delivered, 4fef0a35 |
| P2-a | (7a question 1) A switch can happen while a practice run is running. The practice line then builds jobs from the new state, so the failed runs and the running analyse run that `switchedFrom` deleted stay deleted (`desk/src/lib/session/store.ts:708`). | The line rebuilt jobs from `s.jobs`, the state before the switch. That reopened homework robustness-6 and the 409 half of must-address 3. Two of 7a2's three new cases failed on the unchanged line. The third case is a control. | Folding the fix into 7b. 7b's files were in the hint full r2 span, and this fix touched only `store.ts` and the suite. | delivered, 60d9398c (run f1df9456) |
| P3-a | A switch supersedes the running analyse job, as it does a practice run. That meets the per-learner analyse slot. `desk/src/lib/desk/job.ts` is untouched. | Lite r1 must-address 3 asks that the new learner's own request is not refused. Superseding does that with a store-only change, and 7a was store-side. | A per-learner job slot keyed in `job.ts`. | delivered, 4fef0a35 |
| P5-a | With a draft open, another id is refused. With no draft open, an existing id starts an edit from that profile. A desk-made id gets a suffix when it is taken. A phone's id patch is answered 403 (`desk/src/app/api/session/route.ts:43`). | P5. | none recorded | delivered, 4fef0a35 |
| P6-a | `reset` does NOT join `SERVER_ONLY`, because the TV bench's Reset session button posts it (`desk/src/app/tv/page.tsx:148`). A phone's reset is answered 403 instead (`desk/src/app/api/session/route.ts:42`). | P6 as written would break the TV's Reset session button. | P6 as written. | delivered, 4fef0a35 |
| P4-a | P4's line also names a running Sentence reading. A switch drops it (lite r2 robustness-5), and nobody tells the learner who left (lite r2 value-1). | Lite r2 value-1 is the worst-character finding. A parent who switches in the middle of a scene or a reading loses that work, and nothing says so. | Keeping the Sentence reading in the away slot. That is not ruled, and the full round may raise it again. | queued, delivery 7b |
| P7-a | This is the rest of P7. When learners.json cannot be read, two places say one plain desk sentence, never 'Try again', because a retry cannot succeed while the file is unreadable. They are the startup reads in `store.ts` (:795, :800 and :804; they were at about :703-712 before 7a) and the in-run failure sentence in `desk/src/lib/desk/job.ts` (`jobError`, :71). | Lite r2 robustness-7: marking and hint saves still say 'Try again'. WD14a closed the switch half. | none recorded | queued, delivery 7b |
| P8 | When a switch drops a running run, it also clears that run's start status. A case pins this, and it fails before the fix. | Lite r2 robustness-6. After a switch drops a running analyse or practice run, the new learner's status still reads 'reading your sentence…' or 'writing your set…' with nothing running. No case covers it. | none recorded | queued, delivery 7b |

Delivery 7 was split into 7a, 7a2 and 7b, on one lane. Lost: one branch. The reasons: P4's files (`desk/src/app/phone/page.tsx` and `desk/src/tv/keys.ts`) were in the hint full r2 span, and 7a had to merge before digest full r3, whose span holds `store.ts`.

7a, as delivered (one commit, 4fef0a35):
- Five files: `desk/src/lib/session/store.ts`, `desk/src/app/api/session/route.ts`, `desk/src/app/api/analyse/route.ts`, `desk/package.json` and the new `tools/learner-switch-test.cjs`.
- `SESSION_UNREAD` (`store.ts:511`) and the refusal sentences (:512-520) are in `store.ts`.
- `learner.set` (`store.ts:589`) and `profile.save` (:603) both call `switchedFrom`.
- Saving the seated learner's own profile keeps the conversation.
- An `english.set` for a learner who is not seated is dropped and logged (`store.ts:644`), and the analyse route passes `owner: who.id` (`desk/src/app/api/analyse/route.ts:28`).
- The merge gate: 75 suites and 1356 tests at 4fef0a35, and 1359 at 60d9398c after 7a2.

7a's suite order (7a question 2): `tools/learner-switch-test.cjs` runs second to last, because `tools/harness-rules-test.cjs` asserts that it is itself the last entry (`tools/harness-rules-test.cjs:93-97`; the list ends at `desk/package.json:91-92`). Ruled, no change.

Lite r2 (round 2026-10-10-learner-profile-multi-learner-switching-lite-r2, run e1fc9eaf) was judged at 60d9398c on a span of 14 files. Drift against lite r1: changed. Result: ready 0.7036, coverage 0.70, uncalibrated.
- Scores: robustness 0.80, value 0.70 (low confidence), craft 0.65 (low confidence). Rivalry and economics are not judged in lite.
- Must-address: none.
- The council answered each lite r1 line with a reproduction on a temp `DESK_DATA_DIR`, and each line is closed. Line 1: a truncated session.json, a junk one, one with a single bad profile, and a blocked write. Line 2: a new profile saved from a seated learner's desk. Line 3: learner A's Sentence reading landing after B sat down.

Lite r2 mediums:
- In 7b: robustness-5 and value-1 (P4-a), robustness-7 (P7-a), robustness-6 (P8).
- Unslotted:
  - robustness-2: a single bad profile is dropped with only a log line, and the next write erases it;
  - robustness-3: a set-aside roster has no way back;
  - robustness-8 with value-2: no way to remove a profile, and the demo pair is on every fresh desk (the part P6 ruled out);
  - craft-2: `store.ts` carries persistence, load repair and the switching rules inline;
  - craft-4: several refusals reach the learner only through one shared status line;
  - robustness-10: three cases in `tools/learner-switch-test.cjs` would also pass on lite r1's code.

Next, ruled 2026-10-10: 7b lands before the learner-profile full r1. 7b waits for digest full r3 to settle, because `desk/src/app/phone/page.tsx` and `store.ts` are in that span. The full r1 has to wait for digest r3 anyway, because one Opus council runs at a time. Under the plan change no lite r3 runs: 7b reworks the mediums of a lite-ready major, and the full r1 follows its merge.

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

## 10. weekly-digest-for-parents

Lite r1 (2026-10-09-weekly-digest-for-parents-lite-r1): ready 0.633. Scores: robustness 0.78, value 0.52, craft 0.68. Tier: major, because parents rely on what it writes into learners.json and read it as fact.

Must-address, verbatim:
1. value: A homework week and a typed paper read 'Nothing this week.' (MB-B14 / radka-41-MB5-2, nela-12-MB5-3): still in the tree

D1 delivered the rows below (run e395e83f, merged 87ec2049).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD1 | A homework sheet writes a count-only digest entry beside the history line: kind 'homework' with problems, hints and second, and no title, page id or text. Hints are counted at the store's dispatch boundary onto the hint owner's homework entry of the same local day. A hint never writes an entry of its own (`DIGEST_CAP` is 60, `desk/src/lib/rules/digest.ts:46`). | Must-address 1. | none recorded | delivered, 18789175, with the pin fix 6910c64b |
| WD2 | A typed paper writes a count-only entry (kind 'paper', with questions) in `addPaper`'s own save. No marks and no score. | Must-address 1. | none recorded | delivered, 18789175 |
| WD3 | (MB5-8) The unit line names the last set's not-sure count when it is above 0. | MB5-8. | none recorded | delivered, f47b8b41 |
| WD4 | `LINE_WORDS` stays 14 (`desk/src/lib/rules/week.ts:39`) and `PAGE_WORDS` stays 90. A long unit name gets an authored short Sunday name. A long profile name is said by its first word. A last rung drops only the hint counts. The busiest week is 88 words, pinned, and a DST week is pinned. | The Sunday page has a fixed word budget. | Raising `LINE_WORDS`. | delivered, 79cf246c and 5d65293e |
| WD5 | A week refresh that throws is logged, and the page says one authored line. It is never null, which the phone draws as 'Nothing this week.', and never the previous learner's lines. | Lite r1 robustness-1. | none recorded | delivered, 87ec2049 |
| WD6 | (D1 Q1, DQ3) A hint on a page read on an earlier evening, or on a day with no sheet read, writes nothing. Accepted as a limit. | D1 Q1. | none recorded | unslotted |
| WD7 | (D1 Q2) A successful re-read writes a second entry. Accepted, because today a re-read only follows a failed read, which writes neither. | D1 Q2. | none recorded | ruled, no change |
| WD8 | (D1 Q3) A two-stage problem counts 2 hints and 1 'needed a second'. Confirmed. | D1 Q3. | none recorded | delivered, 18789175 |

Left out, by ruling:
- value-3 and EM4-2/EM4-5 join delivery 6.
- value-4 and the EM-B36 lens order join delivery 13.
- The DST and midnight-refresh limits stay open (craft-6).

Next: the full round, under the plan change.

Full r1 (round 2026-10-10-weekly-digest-for-parents-r1, run 03fa57dd, a run, not a commit; judged at f9f8276b): fail 0.40, coverage 0.17.
- The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state).
- So value, craft and rivalry are unmeasured, and economics was not applicable.

Must-address, verbatim:
1. robustness scored 0.4 below its floor of 0.5
2. value is unmeasured: The round exited early on the robustness mechanical floor (robustness 0.40 < 0.50, binding at every trust state), so this judged member was not run.
3. The same line for craft.
4. The same line for rivalry.
5. robustness: A failed settle restate of the digest entry is swallowed with no log and no status (store.ts:797)

Its other findings (current lines checked on `main` at b3e3335e):
- robustness-2: mark.ts, essay.ts and conversation.ts save in separate steps with addDigest last. A mark Try again doubles attempts (4 -> 8) and history, and a conversation retry never writes the english entry.
- robustness-3: 5 of 11 failure paths have no case. They are the hint count write, addDigest throwing in mark, in essay record and in conversation finish, and the settle restate.
- robustness-4, low: `store.ts:796` is logged only.
- robustness-8, low: the empty catches at `store.ts:802` and :805.
- economics-2: each digest write re-reads learners.json twice.

D4 rulings (run 3922989d). Run 9fcfac15 merged D4 to `main` while this round was written, so every site below is cited on `main` at a6e92668. The lines of `store.ts` that D4 moved are given as they were at 2d794e64 and as they are now.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD9 | A failed settle restate (`store.ts` :799 at 2d794e64, :811 now) is logged with `console.error` once per settle event. The store keeps whether the last restate landed. `settleSaved()` reads it. `SETTLE_NOT_SAVED` says: 'That answer was settled, but the desk could not write it to the learner file, so tonight's record and the week still show the old count.' The explain route stays 200 with reply, slip and settled, and gains saved. Its done line is `SETTLE_NOT_SAVED` when the restate failed. | Full r1 must-address 5 (robustness-1). | A log line only. | delivered, 4c89e7c9 (run 3922989d), merged by run 9fcfac15 |
| WD10 | `learners.ts` gets the pure appliers `withAttempt`, `withWriting`, `withHistory` and `withDigest`. Mark land, essay record, Linga `endTake` and the homework read route each apply their changes to one learner and write it with one `saveLearner`. A failed save writes nothing, and a Try again writes each record once. | robustness-2. A mark Try again doubled attempts (4 -> 8), and a conversation retry never wrote its english entry. | An idempotent digest key, which leaves the doubled attempts and history. | delivered, ccd841f4 (run 3922989d), merged by run 9fcfac15 |
| WD10a | The Writing KPI (`tools/kpi-measure.cjs`, `writingPersisted`) counts two shapes: `addHistory(<id>, { kind: 'writing' })`; and `withHistory(<learner>, { kind: 'writing' })`, when `essay.ts` also calls `saveLearner(`. | WD10 moved essay record to one save, and the KPI saw only `addHistory`. Its pin at `tools/essay-rules-test.cjs` :422-423 failed, so the merge gate held run 3922989d. | Keeping `addHistory` in `essay.ts` so that the old regex matched. That brings the separate save back. | delivered, a6e92668 (run 9fcfac15) |
| WD11 | A case for each of the five uncovered failure paths, in `tools/week-digest-test.cjs`. | robustness-3. | none recorded | delivered, bccfac78 (run 3922989d), merged by run 9fcfac15 |
| WD12 | The status half of robustness-4. The hint count write (`store.ts` :798 at 2d794e64, :807 now) is logged only. Its failure is to be said through the hint route's done lines (`desk/src/app/api/hint/route.ts` :42 and :50, the same before and after D4; the line is ruled at its dispatch). It was not built in D4, because the hint full r1 was judging that route. | robustness-4. | none recorded | delivered, f06984ef (run 0f94108c) |
| WD13 | The rehydrate catch (`store.ts` :804 at 2d794e64; `tellRehydrate` is defined at :784 and called at :821 now) logs with `console.error` and the reason, once per distinct failure, never once per event. Accepted limit: `rehydrateTold` is a module-level `let` (`store.ts:782`), not on `g.__desk`. A dev reload resets it, so the failure logs once more. | The :802 half of robustness-8. | none recorded | delivered, bccfac78 (run 3922989d), merged by run 9fcfac15 |
| WD13a | A candidate only. A failed rehydrate after `learner.set` keeps the previous learner's skills and history on the session. It is nearly unreachable, because `getLearner` swallows an unreadable file. | none (a finding from D4's builder) | none recorded | delivered with WD14a, e4b33fb9 (run 0a4ec2cd): on an unreadable file, a switched learner gets blank records, never the previous learner's |

WD12, as ruled at its dispatch and delivered:
- `HINT_NOT_COUNTED` (`desk/src/lib/session/store.ts:505`) reads 'Here is the hint, but the desk could not count it in the learner file, so the week will not show it.'
- The store resets `counted` on `hint.set` (:809) and sets it false when the count throws (:810). `hintCounted()` (:853) reports it.
- The stage 1 and stage 2 done lines say it. The lesson done line is prefixed with it when stage 1's count failed.
- The hint answer gains `counted`.
- `job.ts` is untouched.
- WD6 is pinned as counted true.
- 74 suites, 1329 tests.

D4 (run 3922989d) built WD9, WD10, WD11 and WD13 in three commits: 4c89e7c9, ccd841f4 and bccfac78. They were held on the branch autopilot/accepted-idea-delivery-3922989d, and all three are on `main` now (checked with `git merge-base --is-ancestor`).
- The merge gate held it on one pin, the WD10a one.
- The same gate run showed `tools/calc-rules-test.cjs` red. Its tests 8 and 9 assert a 50 ms bound. On the held tip, with `DESK_TS_CACHE=0`, the suite ran 17 of 17 green (slowest 29.23 ms). D4 touches no calc file, so it was ruled a timing flake under load.
- Resolution run 9fcfac15 fast-forwarded the three commits unchanged and added the WD10a commit a6e92668, the D3 pattern. `main` is at a6e92668.
- Full r2 (round 2026-10-10-weekly-digest-for-parents-r2, run a03b1279, judged at 0ddf3c43, a span of 17 files: full r1's 16 plus `desk/src/app/api/explain/route.ts`): ready 0.5694, coverage 1.00, uncalibrated.
  - Scores: value 0.50, craft 0.66, rivalry 0.50, robustness 0.65, economics unmeasured.
  - Must-address, verbatim: 'robustness: An unreadable learners.json shows the parent "Nothing this week."; the declared WEEK_UNREAD line is never reached'
  - The line is high, so by the process ruling the owner's Approval waits for its rework (WD14) and for full r3, the last round.
  - Medium left open, unslotted: robustness-2, the bare catches at `desk/src/lib/desk/essay.ts:194` and `desk/src/lib/session/store.ts` (:706, :710 and :817).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD14 | `readLearner` (`desk/src/lib/session/learners.ts:283`) throws only when `readBook` returns null. `weekOf` (`store.ts:766`) reads through it. An unreadable learners.json therefore gives `WEEK_UNREAD` (`desk/src/lib/rules/week.ts:37`, 'The week could not be read just now.') instead of 'Nothing this week.'. An absent file still reads as empty, and that is pinned. `readBook` also returns null for invalid JSON and for a value that is not a book, so both of those give `WEEK_UNREAD` too. `weekRead`, its log text and W9-refresh are unchanged. learners.json stays byte-identical after the unreadable refresh. Case 'W9-unread (WD14)' in `tools/week-rules-test.cjs` pins it, on a file truncated by five bytes. | Digest full r2 must-address 1. `readAll` turned an unreadable book into an empty one. | none recorded | delivered, 0d44b28d (run d6aad5fb) |
| WD14a | A candidate only, not ruled. The rehydrate in `dispatch()` (`store.ts:818-825`, its `getLearner` at :821) still reads through `getLearner`. After an unreadable learners.json, a learner's skills, history and memory therefore show empty. It is the failure WD14 fixed for the week, on another reader. It is related to WD13a. | none (the App Master found it while ruling WD14) | none recorded | delivered, e4b33fb9 (run 0a4ec2cd) |

Noted: a blank file reads as empty in the code (`readBook`, `learners.ts:124`), but no case pins it. `weekOf`'s only caller is `weekRead` (`store.ts:777`; the call is at :778).

WD14a, as ruled at its dispatch and delivered (checked on `main` at 60d9398c):
- The rehydrate in `dispatch()` reads through `readLearner` (`desk/src/lib/session/store.ts:915`).
- On a throw, the same learner keeps what it held.
- On a throw after a switch, the new learner gets `blank(id)` fields, paper null and `LEARNER_UNREAD` (`store.ts:507`, 'The learner file could not be read just now, so this learner's progress is not shown.'). The set is at :923.
- A successful rehydrate clears that exact status (:916).
- `blank` gained `export` (`desk/src/lib/session/learners.ts:164`).
- `readLearner`'s text is now 'learners.json could not be read' (`learners.ts:285`), and no pin quoted the old text.
- WD13's stub moved to `readLearner`, and its assertions are unchanged.
- Three files changed: `store.ts`, `learners.ts` and `tools/week-digest-test.cjs`.
- 74 suites, 1332 tests.

The owner holds the digest Approval until full r3 (round 3 of 3, the last). Full r3 runs after hint full r2 on the review lane. Its span holds essay.ts and conversation.ts, so it waited for EC1c, which has merged.

Full r3 (round 3 of 3, the last) is in flight: run f795a859, dispatched 2026-10-10 09:26Z. Its span is full r2's 17 files plus `desk/src/app/api/hint/route.ts` (WD12's door), 18 in all. It waited for WD14a, 7a and 7a2, because its span holds `store.ts`.

## Process rulings

- Every feature passes council-lite.
- A lite-ready feature whose must-address has a high line is reworked before any full round.
- Every rework is followed by a lite r2. A major then gets the full round.
- The council never approves; only the owner does.
- The full round follows for: end-of-session-memory-recap, homework-page-reading, hint-lesson-discovery, tv-phone-pairing, essay-paragraph-analysis, learner-profile-multi-learner-switching and student-working-explanation.
- A harness, environment or measurement item with no product claim is declined in its run's doc only, with no BACKLOG entry.
- Reworks run one at a time, on one delivery lane, so two never edit the same files.
- A mode has three lite rounds. A fourth is refused as stalled, and the owner decides instead.
- Plan change, 2026-10-10: a lite-ready major goes straight to its full round after its rework, with no further lite round. It supersedes the lite r2 and lite r3 steps above for majors. A lite-fail feature still gets its next lite round.
- A full round with a high must-address line is reworked before the owner decides its Approval. Then a full r2 runs.
- A ready whose high line is one defect found by two members gets one rework. Hint full r1: craft-1 and robustness-1, delivered as HL13.
- A second full round that comes back ready with a high must-address line is held the same way. The owner's Approval waits, the rework runs, and the next full round follows. Homework: full r2 ready with two high lines, then 4h, then full r3, the last round.
- One charter is one run. Deliveries run one at a time, and so do council reviews. The second slot takes a review beside a delivery, or another charter.
- A review never runs beside a delivery that edits a file in its span. The marking span holds MathsTV.tsx, rules/calc*.ts, maths.ts and mark.ts, so 4f, 4c and 4d never run beside marking r3.
- A held delivery is resolved by a resolution run on its own branch. It keeps the held commits unchanged and adds only what the hold needs (D3: run d2d908e6, resolved by run f29f363f at f9f8276b; D4: run 3922989d, resolution run 9fcfac15).
- Exception, 2026-10-10: EC1c ran beside marking full r3, although `tools/econ-rules-test.cjs` is in the r3 span. It was found after dispatch and ruled no collision. A review reads its own worktree at its receipt head, and r3 is the last round, so no later round measures drift against that file.
- Amended, 2026-10-10: two reviews may run at once on different features, one lite and one full (the learner-profile lite r2 ran beside digest full r3). Full councils still run one at a time.
- A run released by a usage limit (2026-10-10, released at 07:34Z and 07:51Z):
  - A delivery with no commit is re-dispatched from scratch, and its builder does not read the old worktree (7a2: run 7d7171be, then run f1df9456).
  - A review whose record is complete and valid is finished by a resume run, but only when its span is unchanged since its receipt. The resume copies the round directory and re-validates the result and every verdict. It must find drift none. Then it only renders report.html and writes the vault (hint full r2: run 77dbd15a, resumed by run 058f9e18).
  - Otherwise the round runs again.
- A lite-ready major can get a rework of its mediums, ruled before its full round. That rework takes no lite round, and the full round follows its merge (learner-profile 7b).

## Delivery order

1. memory-recap: done.
2. homework: done, 602410d7.
3. hint, carrying X1: done (part 1 445c7bad, part 2 1c38f546).
4. marking false ticks: done, b5cd169e.
4a. homework HW4-HW6: done, b2c8389e.
D1. digest MB-B14: done, 87ec2049.
D2. marking false rings: done, c62de4fb.
4e. homework HF1-HF3: done, bd69ff49.
D3. marking empty read MK11, plus robustness-2 and robustness-3: done, f9f8276b.
4g. HF1b: done, 72a4aadf.
4f. HL12, the leaksCalc window: done, b3e3335e (run 57233789).
4c. MK4 with MK4a and MK4b, and MK4c: done, 0a7c2dd5 (run 12cf4a44).
4h. homework HF4 and HF5: done, 2d794e64 (run c448db9f).
D4. the digest full r1 rework, WD9-WD13: done, a6e92668 (run 3922989d, held on the WD10a pin; resolution run 9fcfac15 merged it).
HL13. the hint full r1 rework: done, ed13a024 (run c072cd17).
EC1. the economics instrument: done, 0ddf3c43 (run d6cc1be4).
EC1a. the rules runner's usage file: done, 90d957a9 (run 9bcde838).
EC1b. the remaining labels: done, b4b4ea8f (run ce489ee7).
WD12. the status of the hint count write: done, f06984ef (run 0f94108c).
D5. the digest full r2 rework, WD14: done, 0d44b28d (run d6aad5fb).
EC1c. the Essay Master and Linga labels: done, 8583b29b (run 7a3b0529).
WD14a. the rehydrate reads through readLearner, with WD13a: done, e4b33fb9 (run 0a4ec2cd).
4b. MB-B7, plus homework value-3: next. Marking r3 and hint full r2 have settled, and MathsTV.tsx is in neither the digest full r3 span nor the learner-profile span.
4d. MK10, plus value-unsure-says-different, and maybe MK12, plus marking full r3 value-1: next. Marking r3 and hint full r2 have settled, and MathsTV.tsx is in neither the digest full r3 span nor the learner-profile span.
5. explain, X2-X4.
6. essay, plus EM4-2/EM4-5 and digest value-3.
7. learner-profile, plus homework robustness-6. 7a: done, 4fef0a35 (run 3720e29a). 7a2: done, 60d9398c (run f1df9456). 7b (P4 with P4-a, P7-a and P8): next after digest full r3 settles, and before the learner-profile full r1.
8. pairing.
9. CEFR with placement.
10. the W7 overlay.
11. Linga with LG-25, after the owner's Approval.
12. the claude-era Linga LT run.
13. the recap follow-up, EM-B36 and MB-B23, plus digest value-4 and the lens order, after learner-profile.
13a. the recap write-door contract: unchanged (queued; it goes next on the lane when the owner decides the recap Approval, and does not wait for learner-profile).

Unslotted: EM-B11, WD6, MK12, marking value-calc-gaps, marking craft-1, homework value-retake-double-counts, and these hint full r1 mediums: value-1, craft-5, value-3, craft-2, craft-3, craft-4, robustness-2, economics-2 and economics-3. Also these:
- the homework full r3 mediums (economics-1, economics-2, value-resnap-double-count, robustness-1, craft-1 to craft-3, rivalry-1 to rivalry-4);
- digest full r2 robustness-2;
- EC1d;
- the hint re-ask try count;
- the hint full r2 mediums;
- the marking full r3 mediums other than value-1;
- the learner-profile lite r2 mediums that are not in 7b: robustness-2, robustness-3, robustness-8 with value-2, craft-2, craft-4 and robustness-10.

Review lane, in order:
- marking full r2: done, ready 0.6433 (run 13cf8526);
- digest full r1: done, fail 0.40 (run 03fa57dd);
- homework full r2: done, ready 0.5125 (run 18799a66);
- hint full r1: done, ready 0.5556 (run 6cf02f5a);
- homework full r3: done, ready 0.5867 (run f6b73d06), the last round;
- digest full r2: done, ready 0.5694 (run a03b1279), one high line, reworked as WD14;
- marking r3: done, ready 0.6885 (run cc346058), the last round;
- hint full r2: done, ready 0.6035 (run 77dbd15a, finished by resume run 058f9e18);
- digest full r3: in flight (run f795a859), the last round;
- learner-profile lite r2: done, ready 0.7036 (run e1fc9eaf);
- learner-profile full r1: after digest full r3 settles and 7b merges.

## Open contradictions

None open after round 8.

Supersessions that are resolved, not open: MK2 by MK5, MK3 by MK8, the lite r2 and r3 steps by the plan change, P3's per-learner slot by P3-a, and P6's SERVER_ONLY clause by P6-a.

## Resolved contradictions

1. **MB-B28's BACKLOG text against MK5.**
   - Ruling MK5 (delivered, 5a55d9e7): a correct rounding with two or more significant figures is right, so '2.7 for e' is right, and D2 moved the pins that way.
   - `docs/BACKLOG.md` MB-B28 recommended that any other decimal within `ROUNDED_CLOSE` reads 'not sure', and its status note (9c777d5d) predated D2.
   - Resolved by D3-4 (efdcdd54). It added a status note to MB-B28 (`docs/BACKLOG.md:547`) saying that MK5 (5a55d9e7) and D2 (f4a56e98, c62de4fb) supersede that recommendation in part. A reader of BACKLOG alone now sees that 2.7 for e is right.
2. **Hint voice for vojtech-18 (HL2 against MB-B8).**
   - Ruling HL2: the voice age stays ("a 15-year-old") for vojtech-18, who is declared out of segment.
   - `docs/BACKLOG.md` MB-B8: the teen voice names the learner's age or stage (16-19, "a secondary-school student preparing for a school-leaving exam") instead of "15". The code today speaks to "a 15-year-old" through `TEEN.maths` (`desk/src/lib/rules/voice.ts:69`).
   - Ruling: `desk/src/lib/rules/voice.ts` is untouched, and the teen voice stays 'a 15-year-old' for vojtech-18 and every other teen. The teen table is shared with Essay and pinned byte for byte in `tools/voice-rules-test.cjs`, so the age change lands once, for both apps, with EM-B11. Refinement of HL2: a task that `equationOf` or `expressionOf` reads keeps today's stance byte for byte. Only a task no reader reads gets the neutral stance. Delivered: 0599317f, with the BACKLOG note at 445c7bad.
3. **Squared total on Pythagoras (X1a against MB-B16).**
   - Ruling X1a: the squared total on its own stays legitimate; only the squared total under a root is a leak.
   - `docs/BACKLOG.md` MB-B16: "for a Pythagoras spec the leak profile also refuses the squared answer (1156)", and its tests pin lines such as "c squared is 1156." as leaks. The test pin `tools/school-rules-test.cjs:1628` keeps 'The sum of the squares is 100.' legitimate.
   - Ruling: on a Pythagoras item, take the value the root is taken of: x^2+y^2 for the longest side, x^2-y^2 for a shorter side. Stated on its own, that value stays legitimate: 'c squared is 1156.', 'The sum of the squares is 100.' and '36 + 64 = 100' pass. A line leaks when it puts the value under a root ('the square root of 1156', '√1156', 'odmocnina z 1156'). It also leaks when it states the value with a root instruction in the same line ('c² = 16² + 30² = 1156, teď odmocni.'). 'Then take the square root of the total.' stays legitimate. MB-B16's text that refuses the squared total itself is superseded. Delivered: part 2, run a1f30e71, merged at 1c38f546 (X1a 9def48b2, MB-B16 66602171, with the BACKLOG note at 1c38f546).
