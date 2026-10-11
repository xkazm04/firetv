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
the current line is cited. This doc was updated for round 2 on 2026-10-09 (the first version merged at 7041d11d), for round 3 on 2026-10-10 (round 2 merged at f7f24df5), for round 4 on 2026-10-10 (round 3 merged at a5ff6720), for round 5 on 2026-10-10 (round 4 merged at c28380e2), for round 6 on 2026-10-10 (round 5 merged at d24f824d), for round 7 on 2026-10-10 (round 6 merged at 56431416), for round 8 on 2026-10-10 (round 7 merged at e74340e8), and for round 9 on 2026-10-10 (round 8 merged at 2498060d), and for round 10 on 2026-10-10 (round 9 merged at 4edacb54), and for round 11 on 2026-10-10 (round 10 merged at a5a0eb19), and for round 12 on 2026-10-10 (round 11 merged at 50ee1e31), and for round 13 on 2026-10-11 (round 12 merged at d7987408), and for round 14 on 2026-10-11 (round 13 merged at f2645f41), and for round 15 on 2026-10-11 (round 14 merged at 2365ad92). Ids such as run 13cf8526, d2d908e6, f29f363f, eac6191a, 03fa57dd, 18799a66, 57233789, 6d685adf, 12cf4a44, c448db9f, 3922989d, 9fcfac15, 6cf02f5a, c072cd17, d6cc1be4, 9bcde838, ce489ee7, 0f94108c, d6aad5fb, 7a3b0529, f6b73d06, a03b1279, cc346058, 5d52a422, 0a4ec2cd, 3720e29a, 7d7171be, f1df9456, 77dbd15a, 058f9e18, e1fc9eaf, f795a859, 27364288, feedcd76, 8e4ef693, 8704f32e, 56d9271f, af864d93, c916b03c, 036c1dd7, 62a80958, c2a3c969, e8e43454, fa069457 (capture r10), c976c3d8, 908c9d3a, 243b0a17, 38d6db69, e9761c26, 1f8f5ef3 (capture r11), 5ad42cde, a7fb68b4, dab615ba, 1236bd27 (capture r12), 200beb31, 0994cd5c, af69ab78, 73da4bac, 80b15cc1, dff24ac2, 3aa168a3 (capture r13), 1ee1d75f, ffa7f3f0, b4747c7d, 333437c2, 6b308dab, 98ac0359, cf79b2aa, e158c14f (capture r14), a41f6567, 7e1cad00 and 8ed29bf1 name a run, not a commit.

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

4b, as delivered (three commits, run 56d9271f):
- 4b-1 (9875e783; MB-B15, homework full r1 value-3). The paper caption (`paperCaption`, `desk/src/tv/paperRows.ts:52`, its lines :54-57) says 'No marks were lost' only when the paper lost none. So does the TV's list fallback, the pure `paperNone` (`paperRows.ts:64`), which `desk/src/maths/MathsTV.tsx` calls (:717). When marks were lost on questions that name no statement, both name that count instead. The score card and the totals are unchanged.
- 4b-2 (4e779dd2, the MB-B7 wording). The recovery lines (`WHY` in `desk/src/lib/rules/recovery.ts`, :83) state the desk's own limits, never an exam tier. The two lines are `"out-of-over-cap": `The desk takes at most ${MAX_OUT_OF} marks for one question. Enter its parts one by one.`` (:91) and `"over-paper-total": `The desk takes at most ${PAPER_MARKS} marks for one paper.`` (:96). A statement beyond a Foundation paper is flagged 'a harder statement', on the phone (`desk/src/app/phone/PaperPanel.tsx:36`) and on the TV (`MathsTV.tsx:731`). This is a ruled departure from MB-B7. MB-B7 suggests 'harder than this list covers', but a flag on an item inside the list cannot say that the list does not cover it. So the App Master ruled 'a harder statement'.
- 4b-3 (d2276d38, the MB-B7 way in). In the phone's picker, each area is its own collapsed details element. Its summary names the area and its picks. A word box narrows the statements through `choicesMatching` (`desk/src/lib/rules/paperEntry.ts:52`). A hidden pick stays picked and listed, which is pinned by source only.
- The new cases failed on 1245013b and pass after it. The gate: 75 suites, 1374 tests.
- Still open on MB-B7: Czech task-shaped statements, the 'usually tests' list, and naming the units a pick leads to. The picker was not checked in a browser.
- MB-B7's BACKLOG status first cited the deleted branch, not its commits. 1476d461 (4d) fixed that.

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
  - value-unsure-says-different: an unsure item still tells the learner 'I got something different' (`desk/src/lib/rules/kinds.ts:163`, `desk/src/lib/rules/maths.ts:93`, `desk/src/maths/MathsTV.tsx:808-811`; the said line is built at :811). Delivered by 4d-1, 83bbe368 (run af864d93).
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
- value-1 is the same item as value-unsure-says-different. Delivered by 4d-1, 83bbe368 (run af864d93). The rest are unslotted.
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
| MK10 | (D2 Q4) The unsure reasons reach the learner. Today `settleSpec` in `maths.ts` (:155) drops every unsure reason (it returns null at :158 and :163), so MK1's domain line and the rounded line never reach the screen, which they were meant to. The lite r2's medium findings go with it: the /api/mark vision-failure test and the empty-image refusal. | MK1 and MK5 promised the lines. | none recorded | delivered, 83bbe368 (4d-1, run af864d93). Its /api/mark vision-failure test and its empty-image refusal were delivered by D3 (95d7e462, 95ceb422). |
| MK11 | (D3-1) A photo read with no non-blank answer to any question of the set is a failed mark. That covers no items, numbers outside the set, and every answer blank. `mark.ts` throws `DeskSaid(EMPTY_MARK)` (`desk/src/lib/desk/mark.ts:206`, the message at :211) and the route answers 502. Nothing is recorded: no history line, no digest entry, no attempt. The set stays open, so the next snap marks. Accepted limit: one non-blank matched answer still lands the set, because marking has no completeness check for a partial photo read. Pinned by `tools/calc-marking-test.cjs:368` and `tools/school-marking-test.cjs:1057`. | Full r2 must-address 1. | Landing an empty set as marked. | delivered, 0b8b61fc (tsc fix fc113ec3). Its old pin moved in f9f8276b. |
| MK12 | A candidate, from D3's answer. Finding: a typed set whose every answer is blank lands today, with a history line and a digest entry but no attempt. The phone disables Send until a box has text (`tools/phone-panel-test.cjs:289-290`), so only a raw API body can reach it. Decision: a candidate only, to refuse it 400 before the job. | none (a finding from D3, not a council line) | none recorded | delivered, 9a97c509 (4d-2, run af864d93) |
| EC1 | An economics instrument. Per-use rows carry the provider, ms, tries, the CLI envelope's usage, and failed runs. A price book is declared: the claude CLI on the subscription, and Ollama local. A measured sample is committed in the tree. It is measured live only outside any gate, and only through the claude CLI. | Full r2 must-address 2 (economics unmeasured). The homework full r1 also scored economics 0.05. | none recorded | delivered, 0ddf3c43 (run d6cc1be4) |
| MK4c | `calc2.ts` keeps its own two-line `commaSystem` copy and does not import the one in `taskText`. | `calc2-seam-test` pins calc2's imports. calc2 already rewrites `calc.ts` lines at the same seam. The MK4 parity asserts on the SEQ and AP specs catch drift. | Importing `commaSystem`, which moves the seam pin. | delivered, 0a7c2dd5 |
| EC1a | `tools/run-rules.cjs` gives each suite its own `DESK_USAGE_FILE` in a fresh temp dir, unless one is already set. Stub-engine rows then stay out of `desk/data`. | `meter.ts` falls back to `<cwd>/data/usage.jsonl` when neither `DESK_USAGE_FILE` nor `DESK_DATA_DIR` is set. The runner starts every suite with cwd `desk/`. In the main checkout, `desk/data` holds real learners. Against the unchanged runner, a gate run wrote 81 rows, all kind vision and all with no use. Case (i) in `tools/harness-rules-test.cjs` failed before the fix and passes after it. | none recorded | delivered, 90d957a9 (run 9bcde838) |
| EC1b | Labels on the remaining engine calls: 'homework-read' (`desk/src/lib/desk/read.ts:97`), 'paper-read' (`desk/src/lib/desk/paperRead.ts:53`), the three 'explain' calls (`desk/src/lib/desk/explain.ts:76`, :118 and :166), 'memory' (`desk/src/lib/desk/memory.ts:67`), 'worked-idea' (`desk/src/lib/desk/worked.ts:46`), 'english-sentence' (`desk/src/lib/desk/english.ts:33`), 'linga-check' (`desk/src/lib/english/check.ts:75`) and 'speak' (`desk/src/app/api/speak/route.ts:13`). Case i pins five of them behaviourally, and case i2 pins the rest by source. | An unlabelled call writes rows with use null, which are unattributed (`docs/economics/EC1-SAMPLE-2026-10-10.md`). | An ALS {use, job} scope in `job.ts`, which labels by context, not at each call site. It was not built. | delivered, b4b4ea8f (run ce489ee7) |
| EC1c | The seven Essay Master and Linga text calls are labelled: 'essay-read' (`desk/src/lib/desk/essay.ts:78`) and 'essay-revise' (`essay.ts:183`); 'linga-take' (`desk/src/lib/english/conversation.ts:155`), 'linga-pitch' (:214), 'linga-opening' (:235) and 'linga-cut' (:289); and on the turn call (:328) `use:action==="coach"?"linga-coach":action==="replay"?"linga-replay":"linga-turn"`. Case j in `tools/econ-rules-test.cjs` pins each label. It also pins that, in each file, the count of `await text<` equals the count of `use:` (2 in essay.ts, 5 in conversation.ts), so a new unlabelled call fails. | The same as EC1b. Digest full r3 spans essay.ts and conversation.ts, so EC1c had to merge first. | none recorded | delivered, 8583b29b (run 7a3b0529) |
| EC1c-a | Case j keeps source pins only. No ledger-row assertion through a stub provider is required for `analyseEssay` or `reviseSentence`. | Case a already proves that a use label reaches its row for any text call. Case i2 pins explain, the Linga check and speak by source in the same way. | A stub-provider row assertion. It was not attempted, and not shown to be impossible. | ruled, no change |
| EC1d | A candidate only. Two kinds of engine call still write rows with use null. Both need an `engines/` change. (1) The speech-to-text route (`desk/src/app/api/listen/route.ts:12`). `listen()` in `desk/src/lib/engines/listen.ts` (:63) takes only `timeoutMs`, so its `call()` (:64) passes no use. (2) The four live probes in `desk/src/lib/engines/health.ts` (:94-99). They run only on `GET /api/smoke?live=1`. | none (the App Master found them after EC1c) | none recorded | unslotted |
| MK10-a | (4d-1) An unsure item never says 'I got something different'. It says why the desk is not sure, in the engine's own fixed sentence: `NOT_SURE(n, why)` in `maths.ts` (:96), or `NOT_SURE(n)` with 'How did you get there?' when there is no reason. A blank answer says `BLANK(n)` (:98), for every kind. The two builders read: `export const NOT_SURE = (n: number, why?: string) => `The desk is not sure about number ${n}. ${why || "How did you get there?"}`;` and `export const BLANK = (n: number) => `Number ${n} has no answer yet.`;`. `judgeSpec` (:167) returns either the settled verdict or the unsure reason. `settleSpec` (:161) wraps it and keeps its null contract and its pins, so `explain.ts` and `judgeItem` behave as before. `judgeSet`'s unsure line comes from `unsureLine` (`desk/src/lib/rules/kinds.ts:149`). `ASK` stays only on a wrong item with no known slip. The line carries no value, no answer the learner wrote and no model text. | MK10, and value-unsure-says-different (marking full r2). That is the same item as marking full r3 value-1 and as the line half of BACKLOG MB-B1. | none recorded | delivered, 83bbe368 (run af864d93) |

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

4d, as delivered (run af864d93):
- Three commits: 83bbe368 (4d-1), 9a97c509 (4d-2) and 1476d461. The last is BACKLOG only: MB-B1 partly built, the MB-B25 note, and MB-B7 citing its commits. The brief asked for two commits, with the BACKLOG edit in the last one. The BACKLOG edit came as its own commit instead. Ruled harmless, with no rework.
- 4d-2 (MK12): `typedAnswersProblem` in `maths.ts` (:112) refuses a typed set whose every answer is empty, before the job runs. Its sentence is 'Every answer is empty. Type at least one and send again.' (:117). The mark route (`desk/src/app/api/mark/route.ts:50-51`) answers 400 with that sentence as the error. The whitespace pin in `tools/school-marking-test.cjs` moved: the all-spaces set now goes in the test 10 table as a refusal that writes no history line, and test 12's whitespace case sends 'abc' with the blank.
- The gate: 75 suites, 1377 tests.
- Question 1, ruled: the own-line checks accept any 'The desk is not sure about number N. ' prefix. Accepted, because the MK10 (b) cases pin the exact reasons.
- Question 2, ruled: on an all-blank send, the phone already shows the route's sentence (`setMsg(j.error ?? ...)` in `desk/src/app/phone/page.tsx:331`). Disabling Send there would be a nicety, and it is not slotted.
- Accepted limit: a set marked before 4d keeps its stored line.
- Still open on MB-B1: a blank as its own counted 'skipped' state, and a why on a wrong item with no slip. Still open on MB-B25: the names that `readNumber` strips.

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
| X2 | A 'Type it' control is always beside the hold-to-speak button. Today the textarea appears only when there is no recogniser. The recogniser language follows the learner's school system: cs-CZ for cz. | Must-address 1, MB-B18. `desk/src/app/phone/page.tsx:288` (`r.lang = "en-US"`) and :544-556 (textarea at :550). :288 is also MB-B33's line; whichever rework lands first sets it. | none recorded | delivered: the recogniser language in 5a2135b9 (MB-B33); the Type it control in 632287e6 (5b, run e8e43454) |
| X3 | When an explain settles an unsure item, the phone's reply and the TV's item line name the value the desk took from the learner's words, e.g. 'The desk heard 11/12.'. It is the learner's own value, so it is not a leak. When nothing settles, no value is named. | Must-address 1, second half. | none recorded | delivered, 732b8747 (5a, salvage run 62a80958) |
| X4 | The explain prompt also gets the learner's written answer, the transcribed working, and the slip and line the desk found. This comes only after X1 holds. | MB-B10. `desk/src/lib/desk/explain.ts` prompt build (about :100-127). X1 is MB-B10's own ceiling. | none recorded | delivered, 1dfcfdae (5a, salvage run 62a80958) |
| X2-a | (5b) The 'How did you get there?' block is a presentational component, `ExplainTalk` (`desk/src/app/phone/ExplainTalk.tsx`), that takes props only. With a recogniser and nothing heard, a 'Type it' button sits beside the hold button. It opens a labelled textarea, a Send button (disabled while the text is blank) and 'Use the microphone'. Without a recogniser, the textarea shows as before. The typed explanation has its own state (`typedExplain`, `desk/src/app/phone/page.tsx:55`), not Point & ask's q. It clears on a new walk item (:337), when a reply arrives (:350), and when the seated learner changes (:339). What is typed is sent as it is, in any language. The component is rendered at `page.tsx:556`. | Lite r1 must-address 1, and BACKLOG MB-B18. | The shared q state, which the no-recogniser textarea used before. | delivered, 632287e6 (run e8e43454) |
| X4-a | (5a, the builder's X4 choices, accepted) The working block goes into the prompt only when the learner wrote working. A line is named only together with the working. The slip sentence is the topic list's full 'says' text. An item with none of these sends the same prompt as before, byte for byte. | X4 named the inputs, not their shape. | none recorded | delivered, 1dfcfdae (salvage run 62a80958) |
| X5 | Before any settle, code checks the model's value against what the learner said. `saidIn(value, transcript)` (`desk/src/lib/rules/saidValue.ts:34`) folds the transcript to figures through the closed tables: `figuresOfCzech`, and the new `figuresOfEnglish` (`numberWords.ts:94`). Every digit run of the value must be among the transcript's runs. A decimal's two sides are separate runs. 'squared' or 'na druhou' adds a 2, and 'cubed' or 'na treti' adds a 3 (`saidValue.ts:41-42`). A function name in the value must be heard through one alias of its group in the closed table `FUNCTION_ALIASES` (:15; sin, cos, tan, ln or log, sqrt, e or exp, pi). A leading minus must be heard (:54). A value with no digit and no name is heard only when its whole text is in the transcript, so it fails closed when spoken. `explainItem` sets no verdict unless `saidIn` holds (`desk/src/lib/desk/explain.ts:260`): no settle, no learner record and no 'The desk heard'. The reply still shows, and the prompts are unchanged byte for byte. The X1c line in the `numberWords.ts` header (:10) is revised: a gate that can only refuse a settle may read the table. X1c stands: words never settle on their own. | Full r1 must-address 1 and 2. | none recorded | delivered, 473f4f17 and b29e67b1 (run 38d6db69) |
| X5-a | The explain route refuses a transcript that is not a string, is blank, or is longer than `EXPLAIN_TRANSCRIPT_MAX` (1000 characters, `saidValue.ts:12`). It answers 400, before any model call (`desk/src/app/api/explain/route.ts:26`). The textarea in `ExplainTalk.tsx` carries the same maxLength (:18). | Full r1 craft-2, robustness-5 (R16), economics-2 and economics-3. | none recorded | delivered, c4bd192d (run 38d6db69) |
| X5b | A function name is heard only as a whole word. `edge()` in `saidValue.ts` built its alias pattern from a template literal, and there the backslash before p{L} is dropped. So the lookarounds excluded only the characters p, {, L and }. The fix escapes the backslash (`saidValue.ts:27`). | The App Master found it when X5 settled. At c4bd192d, `saidIn` returned true for ('nevim','e^x'), ('no idea, I guessed','e^x + C'), ('I picked the answer from the list','pi') and ('I stand by it','tan x + C'). | none recorded | delivered, 9f6f38d0 (run e9761c26) |
| X5b-a | An area unit is heard when the learner says it. The exponent 2 of cm2 or m2 (also cm^2 and m²) leaves the digit runs that must be heard (`saidValue.ts:45`). The area must be said instead, in one of these ways: a heard 2 (the digit, ², 'squared' or 'na druhou'); 'square' or 'sq' before a word that starts with 'centimet' or 'met', or before 'cm' or 'm'; a folded Czech word that starts with 'ctverecn' (:49). 'square' never adds a 2 to the heard digits. W7c 9 in `tools/school-marking-test.cjs` (:1120-1121) is back to its original transcript, 'twenty-eight square centimetres'. | X5's question 3. 'twenty-eight square centimetres' failed closed on '28 cm2', and X5 had changed that fixture to 'centimetres squared'. | X5's proposal to make 'square' an exponent word that adds a 2. Then 'I took the square root' would ground a 2. | delivered, 0a5a5296 (run e9761c26) |
| X6 | `saidIn` (`desk/src/lib/rules/saidValue.ts:34`) hears a value only as the learner's own answer, in the order it was said. (a) Order. The value's digit runs must be consecutive runs of the folded transcript, in the same order. 'squared', 'cubed', 'na druhou' and 'na treti' count as a figure at the place where they are said. (b) Anchor. Those runs begin at the first figure after the last answer cue in the transcript. When the transcript has no answer cue, its runs must be exactly the value's runs. The cues are a closed table of English and Czech phrases in `saidValue.ts`, beside `FUNCTION_ALIASES` (:15), for example 'I got', 'the answer is', 'that is' and 'vyslo mi'. Bare 'is', 'equals' and '=' are not cues, because a learner who reads the question aloud says them. (c) Letters. Each single letter of the value that is not part of a function name (x, C) must be heard as a whole word. The gate can still only refuse a settle. Every row that X5 and X5b hear is still heard. | Full r2 must-address 1 and 2 (craft-1 and robustness-1). Replay R2c is ('I took five sixths and one quarter and then I got lost', 1/6). robustness-1's probes are ('I got eleven twelfths', 12/11), ('two x plus three equals eleven, I got five', 3) and ('three quarters plus one sixth, I am not sure', 3/6). Part (c) takes known limit (i), ('I am not sure, maybe e', e^x). | craft-1's own proposal, a contiguous figure match alone. It still hears 3 in 'two x plus three equals eleven, I got five'. | delivered, 025d06c3 (run af69ab78, cherry-picked unchanged from held run 0994cd5c) |
| X6-a | An item that stays unsure because its value was not heard gets one fixed line after the reply. In English, the line is X5's proposed sentence: 'The desk did not hear a final answer in that. Say or type what you got, for example: I got ...'. A learner whose school system is cz gets it in Czech. This takes known limit (iv). | X6 refuses more explanations than X5 did, so the learner needs to be told how to be heard. | none recorded | delivered, 92c8bbd1 and db28d070 (run af69ab78) |

X1 rode the hint rework (delivery 3, part 2, merged at 1c38f546). X2-X4 were delivery 5, in two parts. 5a covered X3 (732b8747) and X4 (1dfcfdae). Run 036c1dd7 was released by a usage limit with one commit, 7ef725bf. Salvage run 62a80958 cherry-picked that commit, added its fail-before evidence, fixed the maths-tv suite header and a missed calc-course pin, and then built X4. 5b was X2's Type it (632287e6, with BACKLOG at af73ca72, run e8e43454). X2's language half was already on main (5a2135b9).

The 5b gate: 75 suites, 1405 tests. In 5b, cases (a) to (d) of 'X2 Type it' were red on 7955c66d because ExplainTalk.tsx did not exist, and case (e) was red because page.tsx did not render it. While a recogniser existed, the old page offered no typed path.

A candidate for the full r1 to judge: `explainSchool`'s own format example names 11/12 (`desk/src/lib/desk/explain.ts:136`), which is the right answer of a 3/4 + 1/6 item. Because of it, 5a moved its test 11 fixture to 1/2 + 1/3. The reply's leak check still guards.

Next, ruled 2026-10-10 (round 10): under the plan change, this lite-ready major takes its full r1 after its rework, with no lite r2. The full r1 follows delivery 7d-2, because P12 (section 7) is a switch leak in this feature's own phone panel.

Full r1 (round 2026-10-10-student-working-explanation-r1, run 908c9d3a):
- It was judged at f5a854c0 on a span of 12 files: `desk/src/app/api/explain/route.ts`, `desk/src/app/phone/ExplainTalk.tsx`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/recogniserLang.ts`, `desk/src/lib/desk/explain.ts`, `desk/src/lib/rules/numberWords.ts`, `desk/src/lib/rules/voice.ts`, `desk/src/tv/mathsRows.ts`, `tools/maths-tv-test.cjs`, `tools/phone-panel-test.cjs`, `tools/school-marking-test.cjs` and `tools/voice-rules-test.cjs`.
- Result: ready 0.50, coverage 1.00, round 1 of 3. The judges are uncalibrated.
- Must-address, verbatim:
  1. 'craft: the verdict rides on a model-written value that code never grounds in what the learner said' (craft-1, high).
  2. 'robustness: A model-supplied value settles an unsure item right and writes the learner record with no check that the learner said it' (robustness-1, high).
  Both lines name one defect, and value-2 (med) names it too. In replay R2, no number was said, the stub value was 7/12, the item settled right and the record went from 2 to 3. In replay R18, the learner said 'I got five', the value was 4, and the item settled right.
- A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is X5 and X5b.
- Other findings, med unless marked:
  - robustness-2, craft-6 and value-7: explainLine shows a running job of the learner who left (P14);
  - robustness-3: a late reply on the phone (P15);
  - robustness-4, craft-4 and value-4: a verdict word or praise in a reply passes unchecked (R6);
  - craft-2 and economics-2: no cap on the transcript (X5-a);
  - robustness-5 and economics-3: an empty transcript still makes a model call and returns 200, R16 (X5-a);
  - value-3: nothing tells the model which language to reply in for a Czech learner;
  - craft-9 (low): the 'The desk heard' prefix is English;
  - craft-3: an open response schema;
  - craft-5: hold-to-speak over a recogniser that ends on its own;
  - economics-1: the cost of an explanation has never been measured.
- No member raised the 11/12 candidate (the explainSchool format example in `explain.ts`). X5 keeps it, because the gate defuses it: 11/12 settles only when the learner said 11 and 12.

X5 and X5b, as delivered:
- X5 (run 38d6db69): three commits (473f4f17, b29e67b1 and c4bd192d) and 12 files.
  - On base 1bbf359c, R2, the R2 route case, R18 and the five route refusals failed. The 1000-character control was green.
  - Eight fixtures changed their transcript only, never an assertion: `tools/maths-tv-test.cjs:950`, `tools/school-stretch-test.cjs:287` and :291, `tools/calc-course-test.cjs:312`, `tools/maths-rules-test.cjs` case 12 (:418 and :422), `tools/week-digest-test.cjs:407` (WD9) and `tools/school-marking-test.cjs` W7c 9 (the fixture is at :1120-1121 on main, back to its original transcript after X5b).
  - The gate: 75 suites, 1430 tests.
  - Its rule (v) report: all 22 calc topics pass 'I got ' plus the right answer.
- X5b (run e9761c26): two commits and three files.
  - On base c4bd192d:
    - the 8 whole-word rows that must be false were all true;
    - the 6 controls were already right;
    - of the area rows that must be true, four were false, and 'centimetres squared' and '28 cm2' were already true;
    - the 4 area rows that must be false were already right.
  - No suite relied on the broken boundary.
  - The gate: 75 suites, 1432 tests.
  - The App Master ran tsc --noEmit at 0a5a5296: exit 0.
- Known limits, unslotted:
  (i) A value whose only grounding is a function name is heard on that name alone. 'I am not sure, maybe e' grounds e^x, and 'sin(x) + x cos(x)' is heard from 'sine x plus x cosine x' with no figure to anchor it. The letters of a value (x, C) are not checked, because a spoken-letter fold was ruled out of X5.
  (ii) '+∞' (calc1-continuity) fails closed when spoken as 'infinity', which is the safe failure.
  (iii) Any heard 2 grounds an area unit.
  (iv) X5's proposed not-heard sentence is not built: 'The desk did not hear a final answer in that. Say or type what you got, for example: I got ...'.
  Round 12: X6 (c) takes limit (i), and X6-a takes limit (iv). Limits (ii) and (iii) stay unslotted.

Next, ruled 2026-10-10 (round 11): the full r2 follows 7d-4 (P16, section 7), because `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs` are in this span. The r2 span adds `desk/src/lib/rules/saidValue.ts`. Full councils still run one at a time.

Full r2 (round 2026-10-10-student-working-explanation-r2, run a7fb68b4):
- What was judged: 44cbbca1, a span of 14 files (r1's 12 plus `desk/src/lib/rules/saidValue.ts` and `tools/school-rules-test.cjs`). The App Master derived the span.
- The result: ready 0.5575, coverage 1.00, round 2 of 3. The judges are uncalibrated. There was no hard failure and no floor hit. Scores, with the delta against r1: value 0.50 (+0.05), craft 0.57 (+0.02), rivalry 0.55 (+0.05), robustness 0.70 (+0.15), economics 0.50 (+0.05).
- The gates: the merge gate record of run 5ad42cde was cited (75 suites, 1438 tests, 0 failed). The council's own tsc run exited 0. Lint is unmeasured.
- The evidence: L1 plus 29 stubbed replays. No real voice and no real model reply have been observed.
- r1's two lines: closed as worded. A value with no ground in the transcript no longer settles anything. Replays R2 (no number said, stub 7/12), R18 ('I got five', stub 4), R18c ('I got three', stub -3) and R20b (Calculus 'I am stuck', stub 6x + 2) do not settle. Controls R1, R2b, R18b, R20, R21 and R21b settle when the value is said.
- The must-address lines, verbatim:
  1. craft: The grounding gate checks the value's digits as an unordered set, so a value pieced together from numbers the learner said settles and is recorded
  2. robustness: saidIn grounds a model-written value on its digits as a set, so a value assembled from numbers the learner said but did not give as their answer settles the item and writes the learner...
  robustness-1's full title (`verdict-robustness.json`): 'saidIn grounds a model-written value on its digits as a set, so a value assembled from numbers the learner said but did not give as their answer settles the item and writes the learner record'.
- The defect: both lines name one defect in `desk/src/lib/rules/saidValue.ts`. The value's digit runs are checked as an unordered set (the transcript's runs at :40, the value's runs at :48, the membership test at :50). Replay R2c: 'I took five sixths and one quarter and then I got lost' with stub value 1/6 settled wrong, with slip top-not-scaled, and the record went from 8 to 9. robustness-1's pure probes of `saidIn` returned true for ('I got eleven twelfths', 12/11), ('two x plus three equals eleven, I got five', 3) and ('three quarters plus one sixth, I am not sure', 3/6).
- The line: A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is X6 and X6-a.
- The findings below the must-address, one line each:
  - a reply that says the answer is right, or praises, passes unchecked (R6): robustness-2 (med), value-2 (med), craft-2 (med), rivalry-2 (low);
  - the reply language for a Czech learner, and the English fixed lines: value-1 (med), craft-8 (low);
  - the economics findings: economics-1 (med, no measured row for an explanation), economics-2 (med, the most expensive call shape), economics-3 to economics-6 (low);
  - craft-3 (med, the forgeable prompt fence), craft-4 (med, hand-concatenated prompt families), craft-5 (med, Chrome's server recogniser by default), craft-6 (med, the value is read back after the commit) and craft-7 (med, `n` means two things);
  - rivalry-1 (med): behind Khan Academy Explain Your Thinking, because each explain send is one stateless turn;
  - robustness-3 (med): the gate was cited, not run.
- Correction: the App Master's r2 brief said that a second try is another model call. It is not: `sendSecond` posts to /api/second, which code judges with no model call (economics-3). Only re-sending an explanation makes another explain call.
- The value member proposed three branches (czech-learner-explains, spoken-calculus-expression, blank-item-explained). They are unmeasured, and no `.personas/council/state.json` declares them.
- Correction (round 13): the r2 brief named the four known limits and told the council to judge each on the evidence, only not to seed them into a pack. Round 12 said they were kept out of every pack, which was wrong.

Next, ruled 2026-10-10 (round 12): X6 and X6-a are one delivery after 7d-5 (P17, section 7), because the delivery lane carries one branch at a time and 7d-5 was ruled first. The full r3, the last full round, follows its merge. Full councils still run one at a time.

X6 and X6-a, as delivered (three commits, run af69ab78):
- Held run 0994cd5c (status partial). Its gate was red only on `tools/calc-marking-test.cjs` test 4, which asserted the bare reply on an unsure item where X6-a now adds `NOT_HEARD_LINE`. That file was outside the run's declared paths. It was a paths miss in the App Master's brief, not a flake.
- Fix run af69ab78. 025d06c3 and 92c8bbd1 are 0994cd5c's 458f4112 and 34dcddbf, with equal git patch-ids (3e12ea2c0be6 and ce92a0a5f65c). db28d070 adds the line to calc-marking test 4's assertions, plus one import. On main the import is at `tools/calc-marking-test.cjs:27`, and the two assertions are at :252 (the route reply and `items[3].reply`) and :261 (the 'no idea' reply). Each now expects `M.NOT_SURE(...)+' '+NOT_HEARD_LINE.en`.
- Refinements ruled at dispatch:
  - 'got' is a whole-word cue;
  - (c) checks only the letters x, y, z, t, n and C, never unit letters;
  - an area unit's 2 or 'squared' belongs to the unit.
  Kept at settlement: a leading 'x =' in a value needs no spoken x. This was the builder's own judgement.
- The builder's report-only answers, from the run results:
  - 'I got five, that is it' is refused, because the last cue has no figure after it;
  - 'the derivative of x squared is 2x' is refused, because it has no cue and more figures than the value;
  - Czech letter names ('iks', 'ce') are not heard as letters;
  - two fixtures changed 'the first one gets...' to 'I got...': `tools/school-rules-test.cjs` (:1970) and `tools/school-marking-test.cjs` (W7c 9, :1114).
- The gate: 75 suites, 1472 tests. The merge gate skipped typecheck, and the App Master ran tsc at db28d070: exit 0.

Full r3 (round 2026-10-10-student-working-explanation-r3, run dff24ac2), the last full round:
- What was judged: db28d070, a span of 16 files (r2's 14 plus `tools/maths-rules-test.cjs` and `tools/calc-marking-test.cjs`). The App Master derived the span.
- The result: ready 0.5805, coverage 1.00, round 3 of 3. The judges are uncalibrated. There was no hard failure and no floor hit. Scores, with the delta against r2: value 0.55 (+0.05), craft 0.55 (-0.02), rivalry 0.60 (+0.05), robustness 0.72 (+0.02), economics 0.50 (0.00).
- The gates: the merge gate record of run af69ab78 was cited (75 suites, 1472 tests, 0 failed). The council's own tsc run exited 0. Lint is unmeasured.
- The evidence: L1 plus 44 stubbed replays. No real voice and no real model reply have been observed.
- r2's two lines: the mechanism is closed, and the defect is open. Replays A1 to A5 are refused. A6, A7 and A8 settle wrong and write the record. Their transcripts: A6 'I got stuck on five sixths' and A7 'that is five sixths take away a quarter and I do not know' (both quoted in the report); A8 'three x squared plus two x' on a Calculus item (`Differentiate f(x) = 3x^2 + 2x.`), with stub value `3x^2 + 2x` (the report names A8 only as a Calculus function read aloud; the transcript is in the round's `evidence/replays/README.md`).
- The must-address line, verbatim from result.json: 'craft: A model-written value enters the learner record on a lexical figure match, with no quoted span and no confirmation'.
- Craft files it as high (craft-1), and robustness files it as med (robustness-1). Craft's direction: derive the value from an exactly aligned quoted span of the learner's words, or ask for a one-tap confirm on the phone before a settle.
- The not-heard line: replays C1 (cz) and I3 (en) show it, with nothing settled and the record unchanged. A wrong item gets no line (C3).
- The findings below the must-address, one line each:
  - robustness-1 (med): `saidIn` fails open when figures follow an answer cue but are not the answer, or when a read-aloud expression is the whole transcript, and no test row covers it;
  - value-false-settle (med): an unsure item can still be settled wrong on numbers that were not the learner's answer;
  - value-worst-branch (med): a learner who narrates the working first is not heard on the first send;
  - value-verdict-words (med): a reply that praises or judges is not caught in code (D4);
  - value-cz-reply-language (med): the model is never told which language to reply in for a Czech 12-year-old, and the desk's own lines around the reply are English (craft-2 med, C4, D2);
  - craft-3 (med): the never-a-verdict rule lives only in the prompt; craft-4 (low): the guillemet fence can be closed by the learner's text; craft-5 (low): the late-reply guard is a hand-copied closure; craft-6 (low): no test names the false admissions in craft-1; craft-7 and craft-8 (low);
  - rivalry-1 (med): one stateless turn where the rivals hold a conversation; rivalry-2 (med): Mathspace grades every line of working in code; rivalry-3 and rivalry-4 (low);
  - economics-1 (med): no measured price for an explanation; economics-2 (med): the reply has no length cap; economics-7 (med): the usage ledger cannot show what a failed explanation spent; economics-3 to economics-6, economics-8 and economics-9 (low);
  - robustness-2 to robustness-5 (low).
- The value member proposed five branches (`cz-young-voice` 0.50, `working-first-narration` 0.40, `en-teen` 0.60, `calc1-university` 0.50 and `parent-beside`, unmeasured). They are unmeasured, and no `.personas/council/state.json` declares them.
- This was the last full round. A fourth is refused, so the high line goes to the owner as a decision beside the Approval, not to a rework round.

Next, ruled 2026-10-11 (round 13): the owner decides craft-1 beside the r3 Approval. The App Master asked the owner to choose between a confirm on the phone before a settle, never settling from an explanation, and accepting it as a known limit. No rework is slotted until he answers.

## 6. essay-paragraph-analysis

Lite r1: ready, 0.5179. Tier: major (key goal 5).

Must-address:
1. value: Under Structure, a planted unsupported claim before the evidence is passed and the wrong sentence is marked
2. value: A whole piece is ruled paragraph by paragraph: every intro thesis and conclusion link comes back faulty, and 'Start with paragraph k' points at it
3. value: Out-of-segment text (Czech) is read with full confidence: the desk never says it reads English before it rules
4. robustness: A paragraph of a piece that fails to come back is never said on the TV

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| E1 | Under Structure, an evidence observation names the claim it backs (`supports: n`). Code checks that n is a claim, and rules a claim strong only on evidence that names it. With no link the verdict is neutral, never strong by position. | Must-address 1. `desk/src/lib/rules/essay.ts`: the claim branch (:297-302) takes any marked evidence after the claim, up to the next claim, as support. | Position as the only link. | dispatched 2026-10-11, delivery 6a |
| E2 | A piece is ruled once, over the observations of all its paragraphs, after they all come back. The per-paragraph model calls stay. 'Start with paragraph k' shows only after that ruling. Case 9 of `tools/essay-piece-test.cjs` (:99) changes openly, with the reason. | Must-address 2. Case 9 pins "Structure runs per judged paragraph". | none recorded | dispatched 2026-10-11, delivery 6a |
| E3 | Before any verdict or count, code (no model) decides whether a paragraph is English. A paragraph that is not is said to be so plainly, on the TV and on the phone, and is not ruled (W6 R4). In the same branch, the splitter and the plan accept a sentence that opens with a capital outside A-Z. | Must-address 3. | none recorded | queued, delivery 6b |
| E4 | A failed paragraph is drawn as 'not read', with a way to send it again, never as pending. Its sentences leave the summary's count, and the summary names it. | Must-address 4. | none recorded | queued, delivery 6b |
| E1-a | The Structure observation gains an optional integer `supports`. It counts on a sentence observed as evidence, and on a sentence observed as a claim that backs an earlier claim (a body paragraph's point backing the thesis). Code accepts n only when n is another sentence of the reading that the model observed as a claim. Anything else is no link. A claim is strong when a marked evidence observation names it, or when a claim that is strong that way names it (one level). A claim that nothing names is neutral when an evidence observation between it and the next claim carries no accepted link, because code cannot tell what that evidence backs. Otherwise it is unsupported, and the first unsupported claim is faulty, as now. The evidence and link rules are unchanged. | Must-address 1. E1 as the App Master reads it, ruled at the dispatch of 6a. | none recorded | dispatched 2026-10-11, delivery 6a |
| E1-b | A verdict keeps the link its observation carried (`supports` on Verdict and VerdictLike, set only for an accepted link). A Structure rewrite is ruled against the kept links: contextObservations returns each sentence's kept link with its job. | E1. A rewrite is ruled on regex roles (contextObservations), so without the kept link a rewritten claim could never be strong. Lite r1 value-4 names the same seam. | none recorded | dispatched 2026-10-11, delivery 6a |
| E2-a | analysePiece keeps each paragraph's observations. It calls decideVerdicts once, after the last paragraph, over every paragraph that came back, with the whole piece as context. While the piece is being read, its progress has no verdicts and its summary names no paragraph to start with, and the TV draws every paragraph of it as pending. The one-paragraph path and record() keep their shape. | Must-address 2. E2, ruled at the dispatch of 6a. | none recorded | dispatched 2026-10-11, delivery 6a |

Ruled 2026-10-11 (round 15): delivery 6 is split by shape. 6a rules the reading (E1, E1-a, E1-b, E2 and E2-a). 6b draws a paragraph that is not ruled, on the TV and on the phone (E3 with EM-B21, and E4). The essay full r1 follows 6b, with no lite r2, by the plan change.

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
| P4 | While a Linga scene or a level check is running, the switcher says in one line that switching ends it. | Switching ends them today. | none recorded | delivered, 3a0a70f8 (7b, run 27364288); corrected by P4-b, f0524369 (7c, run 8704f32e) |
| P5 | Profile ids are checked unique on draft and save. A patch naming another learner's id is refused. | Must-address 1 family (data path between learners). | none recorded | delivered as P5-a, 4fef0a35 (run 3720e29a) |
| P6 | `reset` joins `SERVER_ONLY`. Profile removal and the demo pair are NOT in this rework: removal deletes a child's data and needs its own design after the full round. | `SERVER_ONLY` (`desk/src/app/api/session/route.ts:12`) does not list `reset` today. | Building removal now. | delivered as P6-a, 4fef0a35 (run 3720e29a); P6-a supersedes the SERVER_ONLY clause |
| P7 | An unreadable `learners.json` reaches the learner as one plain desk sentence, not 'Try again'. | `learners.ts` reports it only through `tell` (:120-129). | none recorded | delivered: the switch half in e4b33fb9 (WD14a, run 0a4ec2cd); the rest in 3ad55a23 (P7-a) and 21a3e500 (P7-b), run 27364288 |
| P1-a | (7a question 3) `load()` drops a profile that is not an object, and a profile whose name is not text. Both are within P1. | 7a's question 3. | none recorded | delivered, 4fef0a35 |
| P2-a | (7a question 1) A switch can happen while a practice run is running. The practice line then builds jobs from the new state, so the failed runs and the running analyse run that `switchedFrom` deleted stay deleted (`desk/src/lib/session/store.ts:708`). | The line rebuilt jobs from `s.jobs`, the state before the switch. That reopened homework robustness-6 and the 409 half of must-address 3. Two of 7a2's three new cases failed on the unchanged line. The third case is a control. | Folding the fix into 7b. 7b's files were in the hint full r2 span, and this fix touched only `store.ts` and the suite. | delivered, 60d9398c (run f1df9456) |
| P3-a | A switch supersedes the running analyse job, as it does a practice run. That meets the per-learner analyse slot. `desk/src/lib/desk/job.ts` is untouched. | Lite r1 must-address 3 asks that the new learner's own request is not refused. Superseding does that with a store-only change, and 7a was store-side. | A per-learner job slot keyed in `job.ts`. | delivered, 4fef0a35 |
| P5-a | With a draft open, another id is refused. With no draft open, an existing id starts an edit from that profile. A desk-made id gets a suffix when it is taken. A phone's id patch is answered 403 (`desk/src/app/api/session/route.ts:43`). | P5. | none recorded | delivered, 4fef0a35 |
| P6-a | `reset` does NOT join `SERVER_ONLY`, because the TV bench's Reset session button posts it (`desk/src/app/tv/page.tsx:148`). A phone's reset is answered 403 instead (`desk/src/app/api/session/route.ts:42`). | P6 as written would break the TV's Reset session button. | P6 as written. | delivered, 4fef0a35 |
| P4-a | P4's line also names a running Sentence reading. A switch drops it (lite r2 robustness-5), and nobody tells the learner who left (lite r2 value-1). | Lite r2 value-1 is the worst-character finding. A parent who switches in the middle of a scene or a reading loses that work, and nothing says so. | Keeping the Sentence reading in the away slot. That is not ruled, and the full round may raise it again. | delivered, 3a0a70f8 (run 27364288); widened by P4-b, f0524369 (7c, run 8704f32e) |
| P7-a | This is the rest of P7. When learners.json cannot be read, two places say one plain desk sentence, never 'Try again', because a retry cannot succeed while the file is unreadable. They are the startup reads in `store.ts` (:795, :800 and :804; they were at about :703-712 before 7a) and the in-run failure sentence in `desk/src/lib/desk/job.ts` (`jobError`, :71). | Lite r2 robustness-7: marking and hint saves still say 'Try again'. WD14a closed the switch half. | none recorded | delivered, 3ad55a23 (run 27364288) |
| P8 | When a switch drops a running run, it also clears that run's start status. A case pins this, and it fails before the fix. | Lite r2 robustness-6. After a switch drops a running analyse or practice run, the new learner's status still reads 'reading your sentence…' or 'writing your set…' with nothing running. No case covers it. | none recorded | delivered, be3ac14d (run 27364288) |
| P7-b | The hint-save half of P7-a. `addHints` reads through `readLearner` (`desk/src/lib/session/learners.ts:420`, the read at :421). On an unreadable learners.json it throws into the store's count write, so the hint door says `HINT_NOT_COUNTED` and answers counted false. An absent or empty file still reads as an empty book. A day with no sheet still answers counted true, as WD12's pin in `tools/week-digest-test.cjs` holds. `desk/src/app/api/hint/route.ts` is unchanged. | Digest full r3 robustness-1 (med). `addHints` read through `getLearner`, which reads an unreadable file as an empty book, so the door answered counted:true while nothing was counted. | none recorded | delivered, 21a3e500 (run 27364288); its byte check corrected by P7-c, 1245013b (7c, run 8704f32e) |
| P4-b | `switchEndsLine` (`desk/src/tv/keys.ts:120`) names the Linga scene only while `turnState` (`desk/src/lib/english/turn.ts:34`) does not read it as finished. A finished scene is not named. A finished scene with a Take Two running is named. A running analyse run whose key is not 'english' is named as 'the Essay Master reading'. | P4 says the line shows only while something is running. At 3a0a70f8 any kept conversation is named, so after a finished scene the switcher still says a switch ends it. A switch also drops a running Essay Master reading, because `switchedFrom` (`store.ts:541`) deletes a running analyse run whatever its key, and P4-a's constraint covers any reading. 7b's question 4 raised the second half. | 7b's reading, which names any kept conversation and leaves the Essay Master reading unnamed. | delivered, f0524369 (7c, run 8704f32e) |
| P7-c | P7-b's case checks that learners.json still holds its truncated bytes after the hint, before the case restores the file. | At 21a3e500 the case restores the whole file in finally and then compares the file with the bytes it restored, so that check cannot fail. | none recorded | delivered, 1245013b (7c, run 8704f32e) |
| P9 | (7d) `runJob` (`desk/src/lib/desk/job.ts`) writes its done line and its failure line only while the run is current and the learner who started it is still seated. It records that learner at the start (`asker` and `seated`, :88-89; the writes are at :97 and :107). `switchedFrom` (`desk/src/lib/session/store.ts:541`) also clears a surviving run's start line while the status still reads that line (:548). `job.done`, `job.failed`, `onFail`, and the routing of a late result to the away slot are unchanged. | Full r1 must-address 1, verbatim: 'robustness: A run that outlives a switch writes its status line onto the next learner's desk (observed, untested)'. `switchedFrom` dropped only failed runs and a running analyse or practice run. So a running read, hint, lesson, mark or explain survived a switch and wrote its line on the next learner's desk. | none recorded | delivered, 7955c66d (run c2a3c969) |
| P10 | (7d-2) The hint route starts its lesson run only while the learner who asked for the hint is still seated. A hint that outlives a switch starts no lesson pick, so no lesson.set and no done line land on the next learner. | P9's residual, found by its builder and checked by the App Master. `desk/src/app/api/hint/route.ts` (:53-58) starts the lesson run after the hint returns, so the lesson run starts with the next learner seated. 'no lesson covers this one' is the second line of the full r1's own replay. P9's case (c) does not assert it. | Sending the lesson to the away slot of the learner who left, although nobody asked to see it. | superseded by P10-a, c50e69cc (7d-2, run c976c3d8) |
| P11 | (7f) Two findings from P9's report-only questions, both confirmed by the App Master. (i) A failure that lands after a switch leaves the job failed with the old learner's input (`store.ts:641-642`). `switchedFrom` drops failed jobs only at the moment of the switch (:546), so the next learner's Try again re-asks that input (`desk/src/app/api/session/retry/route.ts`, :28 and :35). (ii) A run that survives a switch stays running, so the next learner's request of the same kind is refused with 409 until that run ends (`job.ts:86`, and the hint route's own check). 7d-2 fixes both, and their shape is ruled when 7d-2 is dispatched. | The same family as P9 and full r1 must-address 1. Nothing of the learner who left reaches the next learner. | none recorded | delivered, 5632c7d3 (7d-2, run c976c3d8); its shape is P11-a |
| P12 | (7g) On the phone, a change of the seated learner also clears the explain panel's heard, reply and again (the second-try text), as a new walk item already does. | 5b's report-only answer, checked by the App Master. `desk/src/app/phone/page.tsx` clears heard, reply and again only on `s?.walkIx` (:337). The learner effect (:339) clears only the typed text. A switch restores the next learner's own walkIx (`store.ts:449`; 0 without a practice). So on the same index, the transcript of the learner who left stays on screen, and Send posts it for the next learner. | none recorded | delivered, f5a854c0 (7d-2, run c976c3d8) |
| P10-a | (7d-2) A hint's lesson pick runs with the learner who asked as its learner: `runJob` takes an `askedBy` option (`desk/src/lib/desk/job.ts:38`, read at :93), and the hint route passes `who.id` (`desk/src/app/api/hint/route.ts:68`). Its done line is gated on that learner. The pick lands in that learner's away slot when they are not seated. It never replaces the seated learner's pick: inside `runJob`, a superseding run whose asker is not seated is refused with 409 while the seated learner's run of that kind is running (`job.ts:95-96`). | P10 as written starts no pick after a switch, and no pick leaves the hint stuck on 'Finding the lesson…' (`desk/src/tv/screens.tsx:184`). | P10 as written. | delivered, c50e69cc (run c976c3d8) |
| P11-a | (7d-2, the shape of P11) A Job records who asked: `by`, set by `job.start` (`desk/src/lib/session/store.ts:343`; `runJob` passes it at `job.ts:100`). One exported function in `job.ts`, `blocksRun` (:83), decides whether a running job blocks a new one. It blocks only when it belongs to the seated learner or has no `by`. `runJob` (:94) and the hint route (`hint/route.ts:29`) both call it. The `job.failed` reducer deletes the record when `by` is not seated (`store.ts:643`), so the next learner gets no Try again on the input of the learner who left. The retry route answers MOVED_ON when the failed job's `by` is not seated (`desk/src/app/api/session/retry/route.ts:30`). Accepted beyond the ruled shape: the start status line is written only while the asker is seated, following P9. | P11 (i) and (ii). | none recorded | delivered, 5632c7d3 (run c976c3d8) |
| P13 | (7d-3) A hint's wait for its lesson ends when its pick ends without a lesson.set. It ends in the slot that holds that hint by its key, seated or away. The fix lives in the hint route, and the reducer is unchanged. `landed()` (`hint/route.ts:55`) sends the keyed lesson.set when the pick is no longer current, and a pick that does not end ok lands null (:68). There are three paths: (a) refused at start, by P10-a's refusal; (b) failed after the switch; (c) superseded by another learner's pick. Here the asker's own pick lands in the asker's away slot (the builder's choice, accepted). Guards: a re-ask by the same learner on the same key, and a seated hint with the same key but another owner. | 7d-2's report-only answer, confirmed by the App Master: a learner could come back to a stage-1 hint stuck on 'Finding the lesson…'. The App Master found path (c) at dispatch. | none recorded | delivered, 1aa3d4e8 (run 243b0a17) |
| P14 | (7d-3) `markLine` (`desk/src/tv/mathsRows.ts:284`) and `explainLine` (:300) do not show a running job whose `by` is set and is not the seated learner (`theirs()`, :268). `JobsOf` carries the learner. `MathsTV.tsx` is unchanged. | 7d-2's report-only answer, confirmed: after a switch, the next learner saw 'Marking...' or the explain line until the leaver's run ended. The student-working full r1 found it too (robustness-2, craft-6, value-7). | none recorded | delivered, 12cb1bf6 (run 243b0a17) |
| P15 | (7d-3) The phone's `explain()` drops a reply or an error that returns after the seated learner or the walk item changed. A seat ref is read after the await (`desk/src/app/phone/page.tsx:345`, `moved()` at :350), and busy still clears. The explain route is unchanged. | Student-working full r1 robustness-3. | none recorded | delivered, 1bbf359c (run 243b0a17) |
| P16 | (7d-4) `sendSecond`, the phone's typed second try (`desk/src/app/phone/page.tsx:361`), drops a result or an error that returns after the learner or the walk item changed, by P15's mechanism. | 7d-3's report-only answer 3, confirmed: a late error from `sendSecond` sets msg on the next learner's panel. | none recorded | delivered, 44cbbca1 (run 5ad42cde) |
| P17 | (i) (7d-5) On the phone, a switch to a different learner resets the last learner's work to its load values. A switch is the seated id becoming a defined id other than the last one seen. The reset covers paras, pix, readIx, note, info, source, pieceId, notice, shot, phase, q, msg, paperRows, typed, sentence and memory. A to none and back to A resets nothing. (ii) These handlers drop a reply or an error that returns after the seated learner changed, by P15's mechanism: send, sendSlot, sendRewrite, readPiece, acceptNotice, analyseParagraph, ask, retry, sendWorking, sendTyped, and the Say panel's 'Check it on the TV' button. After a switch, acceptNotice does not call readPiece. endSession is deliberate and unchanged. | 7d-4's report-only answer, which the App Master confirmed at 44cbbca1. After a switch, the next learner saw the last learner's essay. A read of that essay posted it to the new learner's shelf, or was refused with 'That piece is not on your shelf.' (`desk/src/app/api/texts/route.ts:41`; the brief named texts.ts, and this route file holds the text). paperRows, typed, sentence and memory were added at dispatch. | none recorded | delivered, 0edd8b13 (i) and 61d87bfc (ii) (run 200beb31) |
| P17-a | On a switch to a different learner, `clearLastLearnersWork` (`desk/src/app/phone/page.tsx:364`) also sets keep back to true and ring to null, their load values. A P17 (i) case covers it. | The App Master read page.tsx's useState list at 61d87bfc and found that P17 (i) left these two out: `keep` is at :82 and `ring` at :86. It was kept out of P18, because page.tsx and tools/phone-panel-test.cjs were in the student-working-explanation full r3 span. | none recorded | delivered, 5f9a8c67 (run 1ee1d75f) |
| P18 | In `load()` (`desk/src/lib/session/store.ts`, :748): a repair that throws goes through `setAside`: the file is kept as session.json.bad-*, the desk starts with SESSION_UNREAD, and one log line names the repair's error. A saved log that is not an object is repaired to the empty evening log, with one line. `awayShown` drops a slot that is not an object, and gives a pages or tasks field that is not a list the empty list, with one line each. | Full r2 must-address (robustness-2), and its two more shapes, log: null and an away slot with pages: null. | Fixing the data where it throws, in the reducer. | delivered, 84832dfa (run 80b15cc1) |
| P18-a | (i) A session.json that `readFileSync` cannot read goes through `setAside`. (ii) A session.json the desk could not use and could not put aside is never overwritten: each later write tries the aside again, and writes only once it lands. (iii) In a log that is an object, each wrong field is repaired to `fresh()`'s value. (iv) An away slot's log is repaired the same way. | P18's report-only answers 1 and 2, which the App Master confirmed at 84832dfa. `log: {}` and an away slot with `log: null` make every dispatch throw in `stamped` (`store.ts:570-571`), through `loggedIn` (:556), which reads `l.problems.length` and `x.log`. | `setAside` on a read failure alone. When the rename fails too, the next save still overwrites the file. | delivered, 34f7b4bf (run 1ee1d75f) |

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

7b, as delivered (four commits, run 27364288):
- Eight files: `desk/src/app/phone/page.tsx`, `desk/src/lib/desk/job.ts`, `desk/src/lib/session/learners.ts`, `desk/src/lib/session/store.ts`, `desk/src/tv/keys.ts`, `desk/src/tv/screens.tsx`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`.
- P8 (be3ac14d): a Job keeps the status text it set at its start (`Job.start`, `desk/src/lib/session/store.ts:228`). `switchedFrom` (`store.ts:546`) and the practice line (`store.ts:710`) clear the status only while it still reads that text.
- P7-a (3ad55a23): `learners.ts` exports `LearnersUnread` (:157), which `writeLearner` (:162), `readLearner` (:288) and `saveEnglish` (:299) throw. `jobError` (`desk/src/lib/desk/job.ts:72`) recognises it by type (:74) and says `LEARNER_UNREAD_RUN` (`store.ts:509`): 'The learner file could not be read just now, so this was not saved.' The startup reads go through `readLearner` (`store.ts:802-810`), set `LEARNER_UNREAD` once, and show no paper.
- P7-b (21a3e500): as its row says.
- P4 with P4-a (3a0a70f8): the pure `switchEndsLine` in `keys.ts`, shown in the TV Learner caption (`desk/src/tv/screens.tsx:406`) and in the phone's 'Not X?' line (`desk/src/app/phone/page.tsx:418`).
- The merge gate: 75 suites, 1370 tests, all green.

7b's questions, ruled:
1. P8's constraint quotes the practice start status as 'writing your set…'. The code says 'writing a practice set…' (`desk/src/app/api/practice/route.ts:19`). The cases use the real texts. Ruled, no change.
2. The bare catch over `settleOwners` could never fire, because `settleOwners` swallows its own `historyOf` errors. The startup notes an unreadable file through a wrapper around `readLearner`. Accepted as built.
3. `LEARNER_UNREAD_RUN` is the one new sentence, because `LEARNER_UNREAD` says progress is 'not shown', which is wrong for a save. Accepted as built.
4. A running Essay Master reading is dropped by a switch but was not named, because P4-a listed only the Sentence reading. Ruled as P4-b.
5. No screenshot of the TV or the phone was taken, because no dev server was allowed. Noted.

The App Master's check of 7b against its brief: one commit per ruling. The P8, P7-a and P7-b cases were shown failing on 2498060d and passing after, and P4's function did not exist there. `desk/src/app/api/hint/route.ts`, `desk/src/maths/` and `desk/src/lib/rules/` are unchanged. `jobError` matches by type, not by text. WD12's no-sheet pin is unchanged. No em dash was added. Two gaps: P4-b and P7-c.

Next, ruled 2026-10-10 (round 9): delivery 7c (P4-b and P7-c) lands before the learner-profile full r1, because `keys.ts` and `tools/learner-switch-test.cjs` are in that span. The full r1 follows its merge. 4b may run beside the full r1, because its files are outside that span.

7c, as delivered (two commits, run 8704f32e):
- f0524369 (P4-b) and 1245013b (P7-c), rebased from adbd89cc and bf5f2584. Those two are objects in the repo, and neither is an ancestor of `main`.
- Three files: `desk/src/tv/keys.ts`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`.
- `turnState` is imported into `keys.ts`, with no new predicate.
- The old 'essay gives null' assertion was changed and named.
- The P4 essay case and the P4-b case failed on 17ffb8a7.
- The P7-c byte check comes before the restore.
- The gate: 75 suites, 1371 tests.

Full r1 (round 2026-10-10-learner-profile-multi-learner-switching-r1, run c916b03c):
- It was judged at 1245013b on a span of 17 files: lite r2's 14, plus `job.ts`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`. `turn.ts` was read as a dependency.
- Result: ready 0.5585, coverage 1.00. The judges are uncalibrated.
- Must-address, verbatim: 'robustness: A run that outlives a switch writes its status line onto the next learner's desk (observed, untested)'. Ruled as P9. P10 and P11 were found after it.
- Other findings, all unslotted:
  - value: a switch ends a Linga scene, a level check and a running Essay Master reading. The switcher warns about it, but the work is not kept.
  - value and rivalry: the demo learners Ema and Jakub are seeded on every fresh or reset desk, and they cannot be removed.
  - economics-2: a dropped reading is not stopped. It spends its calls and still writes the leaving learner's history.
  - rivalry-1: there is no grown-up gate on making or editing profiles. This is recorded as owner decision D1.
  - craft-1: the switch has four owners and no field-by-field rule, and the field awaiting already leaks across a switch. Candidate 7e.
- Evidence ceiling: no L2 run has put two learners at one desk. Rivalry has low confidence.
- Method incident (economics-5): the economics member's temp cleanup deleted %TEMP%/council-econ-hpr, a directory it had not created. No tracked file and nothing in `desk/data/` was touched. It is with the owner.
- The Report and the Approval reached the owner on 2026-10-10. The Approval is the owner's to decide.

7d, as delivered (one commit, 7955c66d, run c2a3c969):
- Three files: `desk/src/lib/desk/job.ts`, `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs`.
- Cases (a) to (e), where case (c) goes through the real hint route.
- On 1dfcfdae, cases (a), (b), (c) and the (d) start-text case failed, and the (d) left-alone case and the (e) controls were green.
- No pin moved.
- The gate: 75 suites, 1399 tests.

Next, ruled 2026-10-10 (round 10): delivery 7d-2 (P10, P11 and P12) lands before the learner-profile full r2, because the r2 would meet P10 again in its own replay and spend round 2 of 3. The full r2 follows 7d-2's merge. Full councils still run one at a time.

7d-2, as delivered (three commits, run c976c3d8):
- Commits: 5632c7d3 (P11), c50e69cc (P10-a) and f5a854c0 (P12).
- Seven files: `desk/src/app/api/hint/route.ts`, `desk/src/app/api/session/retry/route.ts`, `desk/src/lib/desk/job.ts`, `desk/src/lib/session/store.ts`, `desk/src/app/phone/page.tsx`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs`.
- Seven new cases. The six that are not controls failed on base a5a0eb19, and the P11 control was green there.
- One pin moved, robustness-1 (b): a failed job is now removed after a switch. `tools/desk-jobs-rules-test.cjs` is unchanged.
- The gate: 75 suites, 1412 tests.

7d-3, as delivered (three commits, run 243b0a17):
- Commits: 12cb1bf6 (P14), 1aa3d4e8 (P13) and 1bbf359c (P15).
- Six files: `desk/src/tv/mathsRows.ts`, `desk/src/app/api/hint/route.ts`, `desk/src/app/phone/page.tsx`, `tools/maths-tv-test.cjs`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs`. `store.ts` and `job.ts` are unchanged.
- On base f5a854c0, the P14 case and P13 (a), (b) and (c) failed, and the controls were green. P15's case failed only structurally, because its cut point did not exist there.
- No pin moved. The gate: 75 suites, 1425 tests.
- Its report-only answers, ruled:
  1. memory: a late run of the learner who left writes that learner's own file (`addMemory(learnerId)`, `desk/src/lib/session/learners.ts:373`). teach: a late lesson is dropped (`desk/src/app/api/worked/route.ts:24`, `run.current()` and seated). Both are safe, and no row is added. This closes the memory and teach audit that 7d-2 left open.
  2. Item keys are unique across learners by construction: a page id is the subject plus `Date.now()` (`desk/src/app/api/read/route.ts:27`), and a page has one owner. So P13's guard is safe.
  3. The late sendSecond error is ruled as P16.
  4. P13 (c)'s landing choice is recorded in P13.

Next, ruled 2026-10-10 (round 11): 7d-4 (P16) lands before the learner-profile full r2, because `page.tsx` is in its span. Then the two full r2s, this feature's and student-working-explanation's, one full council at a time.

7d-4, as delivered (one commit, run 5ad42cde):
- Commit 44cbbca1 (337300e8, rebased onto 50ee1e31). It is an ancestor of main.
- Two files: `desk/src/app/phone/page.tsx` (+5/-1; `sendSecond` is at :361) and `tools/phone-panel-test.cjs` (+47).
- The test 'P16 sendSecond()' has five sub-cases. Fail-before on 0a5a5296: (a) green, (b) red, (c) red, (d) red, (e) green.
- The P15 test is unchanged.
- The gate: 75 suites, 1438 tests.
- The merge gate skipped typecheck, and the App Master ran tsc at 44cbbca1: exit 0.
- Its report-only answer is ruled as P17.

Next, ruled 2026-10-10 (round 12): 7d-5 (P17) lands before the learner-profile full r2, because `page.tsx` and `tools/phone-panel-test.cjs` are in its span. The full r2 follows its merge.

7d-5, as delivered (two commits, run 200beb31):
- Commits: 0edd8b13 (P17 i) and 61d87bfc (P17 ii), rebased from a40f78c6 and 15615652. Those two are objects in the repo. Both new commits are ancestors of main.
- Two files: `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs`.
- The test file has 0 removed lines (+116/-0 across the two commits), so P15 and P16 are unchanged.
- Fail-before on f05bd322 (16 red of 70 in phone-panel-test): P17 (i) is a structural red, because the '// P17 (i) begin' marker does not exist there. P17 (ii) is a behavioural red for the switch case of ten handlers (send, sendSlot, sendRewrite, readPiece, acceptNotice, analyseParagraph, ask, retry, sendWorking and sendTyped), and for the readPiece 428 and ok-piece case and the acceptNotice-no-readPiece case. The Say button's two cases are structural reds, because the named handler did not exist. The control cases of the other ten handlers are green before and after.
- The gate: 75 suites, 1470 tests (base 1438).
- The App Master's tsc at 61d87bfc: exit 0.
- Its report-only answer on useState ownership is ruled as P17-a (keep and ring).

Full r2 (round 2026-10-10-learner-profile-multi-learner-switching-r2, run 73da4bac):
- What was judged: 61d87bfc, a span of 21 files (r1's 17 plus `desk/src/app/api/hint/route.ts`, `desk/src/tv/mathsRows.ts`, `tools/maths-tv-test.cjs` and `tools/phone-panel-test.cjs`). The App Master derived the span.
- The result: ready 0.5625, coverage 1.00, round 2 of 3, with uncalibrated judges. Scores, with the delta against r1: value 0.60 (+0.03), craft 0.57 (-0.05), rivalry 0.55 (0.00), robustness 0.60 (+0.05), economics 0.40 (0.00).
- r1's must-address is closed. The stubbed replay (`replay/switch-status.cjs`) records each status event with the learner seated when it was written. Across five switch scenarios no status line landed on the next learner's desk. The report lists A4 (a hint finished after the switch), C2 (a hint failed after the switch), D3 (a reading ended after the switch) and E3 (a page read landed after the switch).
- The must-address line, verbatim from result.json, where it is stored truncated: 'robustness: A session.json that passes the two-field shape check but fails the repair is not put aside: the desk starts fresh, says nothing, and the next event overwrites the file, losing the...'. robustness-2's full title (`verdict-robustness.json`): 'A session.json that passes the two-field shape check but fails the repair is not put aside: the desk starts fresh, says nothing, and the next event overwrites the file, losing the TV-made profiles and every away slot'.
- The defect: in `load()` (`desk/src/lib/session/store.ts`), the shape check at :755 looks only at profiles and learner. Anything else wrong reached the repair's catch, which logged and returned `fresh()` with no `setAside`, so there was no SESSION_UNREAD and no session.json.bad-*. The replay (pages: 'x') ended with only the demo profiles, and one focus event later session.json on disk held neither child and no away slot. The same root has two more shapes: log: null and an away slot with pages: null.
- The line: A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is P18.
- The findings below the must-address, one line each:
  - robustness-3 (med) with value-5 (low): a failure that outlives a switch is told only to the server log;
  - robustness-4 (med): a whole-piece reading that finishes after a switch is lost with no log line;
  - robustness-1 (low, r1's line closed), robustness-5 (low, gates), robustness-6 (low, two empty catches in store.ts), robustness-7 (low, two routes with no body cap) and robustness-8 (low, hard-fail checks);
  - value-1 (med): a practice set being written when the child is moved off the desk is dropped, and the switcher does not warn;
  - value-2 (med): the demo learners cannot be removed; value-3 (low), value-4 (low), value-6 (low);
  - craft-1 to craft-5 (med): four mechanisms for one rule, an enumerated eviction list, a hand-kept setter list on the phone, one job slot per kind with a `by` patch, and tests that slice production source; craft-6 to craft-8 (low);
  - economics-1 (med): a switch does not stop a stranded reading; economics-2 (med): a switch lifts the one-run-per-kind guard; economics-4 (med): away slots have no declared maximum and the whole session is rewritten on every event; economics-6 (med): no measured cost; economics-3 and economics-5 (low);
  - rivalry-1 (med): behind all three rivals on removing a profile; rivalry-2 (med): a switch ends the leaving learner's Linga scene, level check and reading; rivalry-3 to rivalry-5 (low).
- Ruled 2026-10-10: value-1, robustness-3, robustness-4, economics-4 and craft-5 are not slotted before the full r3, which judges them on the evidence. The r3 brief asks for a targeted replay of whether a dropped Essay piece still writes the leaving learner's history.
- The value member proposed five branches (two-children-interleaved, switch-mid-run, sibling-linga-mid-scene, parent-reads-both-children and fresh-desk-demo-learners). They are unmeasured, and no state.json declares them.

P18, as delivered (one commit, run 80b15cc1):
- 84832dfa: `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs` (+40/-4).
- R2-a, R2-b and R2-c were red before and are green after: pages: 'x', log: null, and an away slot with pages: null and tasks: 'x'.
- pages: 'x' makes the repair throw, as the reviewer said (`settleOwners` calls `.every` on it).
- The old P1 cases are unchanged and green, including 'a bad profile alone'.
- The gate: 75 suites, 1475 tests. tsc at 84832dfa: exit 0.
- Its report-only answers:
  1. A read failure in `load()` (`store.ts:751`) returns `fresh()` without `setAside` or SESSION_UNREAD, and the next save overwrites the unread file. Ruled as P18-a (i) and (ii).
  2. A log that is an object but has a field of the wrong type still loads silently. Ruled as P18-a (iii) and (iv), with the confirmed `log: {}` and `log: null` shapes.
  3. The empty catches: `store.ts:816` (the startup settle), :426 (`historyOf`), :911 and :946 (subscriber callbacks), :928 (`logWatched`) and :963 (tmp `rmSync`). Which two r2 robustness-6 meant is not stated. Stays unslotted.

Next, ruled 2026-10-11 (round 13): the pre-r3 rework (P17-a and P18-a, one delivery, two commits) lands before the learner-profile full r3, the last full round, because `desk/src/app/phone/page.tsx`, `tools/phone-panel-test.cjs`, `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs` are in its span. The full r3 follows its merge.

The pre-r3 rework, as delivered (two commits, run 1ee1d75f):
- Both commits are ancestors of `main` (checked with `git cat-file -e` and `git merge-base --is-ancestor`).
- 5f9a8c67 changes `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs`, +4/-3. 34f7b4bf changes `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs`, +98/-5.
- The `store.ts` hunks are the Store type (aside), `load()` (:748), the new `keptLog` (:783) and `badLogFields` (:769), `setAside` (:794), `awayShown` (:823), the store init, and the aside guard at the top of `writeSession` (:987). No reducer changed.
- Fail-before was observed. On the old `page.tsx`, 'A to B' and 'A to none to B' were red. On the old `store.ts`, R3-a to R3-d were red. All were green after.
- The gate: 75 suites, 1480 tests. tsc exited 0.
- Its report-only answers, ruled:
  1. An `essayPlan.slots` that is not a list throws. It throws in `emptyOf` (`desk/src/lib/session/store.ts:376`), and on `essay.plan` (:666) and `essay.slot` (:669, which calls `planFill`). No test exercised it. Ruled as known limit (viii). It was named to the full r3 and is not slotted.
  2. No route reads `session.json` outside `load()` and `writeSession`. Only two comments name the file (`rules/mode.ts:24` and `session/learners.ts:5`). Accepted.

Full r3 (round 2026-10-11-learner-profile-multi-learner-switching-r3, run 333437c2), the last full round:
- What was judged: head f2645f41 and a span of 21 files, from its receipt.json. The App Master derived the span (r2's 21 files, unchanged). Four span files differ from r2: `store.ts`, `phone/page.tsx`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs` (+141/-11). Nothing carried forward.
- The result: ready 0.5525, coverage 1.00, round 3 of 3, with uncalibrated judges. Scores, with the delta against r2: value 0.60 (0.00), craft 0.58 (+0.01), rivalry 0.45 (-0.10), robustness 0.65 (+0.05), economics 0.40 (0.00). No hard failure.
- r2's must-address line is closed (robustness-1, low). The replays are in `replay-aside.md`:
  - Scenario 1: a file with `pages: 5` is renamed `session.json.bad-*` with the same bytes, the desk starts with SESSION_UNREAD, and one log line names the repair failure.
  - Scenario 2: the rename is made to fail, and session.json is not written over until the rename lands.
  - Scenario 3: an unreadable session.json is put aside the same way.
  - Cases R2-a, R3-a and R3-b pass. One residual is recorded, not as a reopening: nothing reads an aside file back, and SESSION_UNREAD does not say where the old file went.
- The Essay answer. Simon's three-paragraph piece was being read when Nela was seated, and the reading was let finish. The route answers 200 with "3 of 6 sentences to fix across 3 paragraphs". The finished reading still writes the leaving learner's history in learners.json: a history line `writing: Structure: 3 of 6 sentences to fix, 3 paragraphs`, a writing-skill step for `structure` (seen 1), and one digest entry `{kind: essay, lens: structure, sentences: 6, faulty: 3}`. Nela's record is unchanged. When Simon is seated again, his desk shows paragraph 1 of 3 and "1 of 6 sentences to fix". Nothing says the reading was cut. So the desk shows 1 of 6 while his record and the parent's digest count 3 of 6. No case in the four span suites covers this path.
- The must-address line, verbatim from result.json, where it is stored truncated: 'robustness: A whole-piece Essay reading that outlives a switch leaves the leaving learner's away slot frozen at its first paragraph while their record says the reading finished; the failure path...'. robustness-2's full title (`verdict-robustness.json`): 'A whole-piece Essay reading that outlives a switch leaves the leaving learner's away slot frozen at its first paragraph while their record says the reading finished; the failure path has no case'.
- The findings below the must-address, one line each:
  - robustness-3 (med): a watched lesson whose history line cannot be written is swallowed with no log line and no status; robustness-4 (low): two routes parse the request body with no catch (`session/route.ts` and `analyse/route.ts`); robustness-7 (low): an essayPlan whose slots is not a list has no case; robustness-1 (low, r2's line closed), robustness-5 (low, hard-fail checks), robustness-6 (low, gate record) and robustness-8 (low, a cross-reference to economics);
  - value-1 (med): the same Essay reading as the must-address; value-2 (med): a sibling's turn ends a Linga scene or a part-way level check, with no Carry on afterwards; value-3 to value-6 (low), and value-time-saved (low);
  - craft-1 (med): the phone resets on a switch from a hand-kept list of 18 setters, and some per-learner state is outside it; craft-2 (med): EssayShelf refetches on a learner change with no stale-response guard; craft-3 (med): a switch drops a run's events instead of cancelling its work; craft-4 to craft-8 (low);
  - economics-1 (med): a dropped piece reading keeps calling the engine, at most 29 calls for a 30-paragraph piece; economics-2 (med): a switch cycle lifts the one-run-per-kind guard on analyse; economics-3 (med): every event rewrites the whole session.json, with no limit on away slots; economics-4 to economics-6 (low);
  - rivalry-1 (med): behind all three named rivals on guarding the switch, the profile edit and the Adult gate; rivalry-2 (med): behind Khan Academy Kids on deleting one learner; rivalry-3 to rivalry-6 (low).
- Four members reach the Essay reading from their own questions (robustness-2 high, value-1, economics-1 and craft-3 med, rivalry-5 low). Only robustness's class, an untested failure path, makes it must-address.
- Value is measured at confidence low. No L2 run has put two learners at one desk.
- This was the last full round. A fourth is refused, so the high line goes to the owner as a decision beside the Approval.

Next, ruled 2026-10-11 (round 14): the owner decides robustness-2 beside the r3 Approval (ask 28b44148). The options are to finish the reading into the away slot, to stop it at the switch, or to accept it as a known limit. No rework is slotted until he answers.

## 8. tv-phone-pairing

Lite r1: ready, 0.5036. Security-sensitive. A full round follows a clean lite r2.

Superseded (round 14): by the plan change of 2026-10-10 in the Process rulings, a lite-ready major goes straight to its full round after its rework. The pairing full r1 followed delivery 8 with no lite r2.

Must-address:
1. value: The QR and the printed addresses point at the host's first network adapter, which on the measured host is not the Wi-Fi
2. craft: A 4-digit code with no failure delay and no attempt budget: any device on the network becomes a phone in seconds

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PR1 | `phoneUrl` and the printed `/tv?key=` address prefer a private LAN IPv4 (192.168/16, 10/8, 172.16/12) over CGNAT 100.64/10 (Tailscale) and link-local. An explicit env override is kept. | Must-address 1. `phoneUrl()` takes the first non-internal IPv4 (`desk/src/lib/session/store.ts:349-352`); `desk/src/app/page.tsx:6` does the same; the key address is built at `desk/src/lib/session/pairing.ts:163`. | none recorded | delivered, 1c32a230, with a type cast at 04d6d002 (run b4747c7d) |
| PR2 | Keep 4 digits, because viktor-67 types badly and the QR carries the pin. Add a fixed delay on every refused join, and a desk-wide budget of failed joins with a cooldown. Never rotate the pin on lockout: that would lapse every joined phone. | Must-address 2. `desk/src/lib/session/pairing.ts`. | A longer code, and rotating the pin on lockout. | delivered, d5a94eff (run b4747c7d) |
| PR3 | A malformed or null POST `/api/session` body gets a 400 (R10). A failed read of `pairing.json` or `session.json` logs one line. | `desk/src/app/api/session/route.ts`. | none recorded | delivered, ae2469bd (run b4747c7d). Its session.json half was already on main (HF4, P18 and P18-a), so nothing was built for it |
| PR1-a | `DESK_PHONE_HOST` wins when it is set and not blank. Otherwise the non-internal IPv4 addresses rank 192.168/16, then 10/8, 172.16/12, CGNAT 100.64/10, link-local, and any other. Within a rank, an adapter named like vEthernet, WSL, Hyper-V, Docker, VirtualBox or VMware comes last, and ties keep adapter order. With no candidate, the answer is localhost. `phoneUrl()` (`desk/src/lib/session/store.ts:351`), `desk/src/app/page.tsx:6` and `tools/desk-dev-https.cjs` all use `lanHost()` (`desk/src/lib/session/lan.ts:24`). | A refinement of PR1, ruled at the dispatch of delivery 8. | none recorded | delivered, 1c32a230 (run b4747c7d) |
| PR2-a | Each refused guarded join waits `DESK_JOIN_DELAY_MS`, 1000 ms by default. Ten wrong codes start a five-minute, desk-wide cooldown. During the cooldown, any guarded join that carries a code is refused with `TOO_MANY_CODES` ('Too many wrong codes. Wait five minutes, then type the code again.', `desk/src/lib/session/pairing.ts:32`). The pin never rotates. The TV and an in-process join are never delayed, counted or held. The count lives in memory, so a restart clears it, and any successful join sets it to zero. | PR2's numbers, ruled at dispatch. | none recorded | delivered, d5a94eff (run b4747c7d) |
| PR4 | `cookiesOf()` never throws. It treats a value it cannot decode the way Next's own parser does, so the proxy and the stream read one Cookie header the same way. The stream draws each message outside the catch that guards the enqueue. A throw while drawing writes one log line and closes the stream. `cancel()` and a failed enqueue also clear the ping. | Full r1 must-address 5 (robustness-1). | none recorded | delivered, 33b91924 (run a41f6567) |
| PR5 | A quiet join is quiet only about the shake. For every refusal, one pure function in `desk/src/app/phone/panelFor.ts` decides the line to show, whether to shake (typed codes only), and whether to forget the stored code. A remembered code refused as not on the TV is forgotten, and the Join panel says 'The TV has a new code. Type the code the TV shows.' A cooldown refusal shows the route's text and keeps the stored code. The server's count does not change, so a phone counts at most once per reset. | Full r1 must-address 6 (robustness-2). | Not counting a former pin on the server, which needs a store of past pins. | delivered, 86df5492 (run a41f6567) |
| PR6 | At most 8 guest streams are open at once, desk-wide, and a ninth closes the oldest guest stream. TV, phone and in-process streams are not counted, and the cap never closes them. Each stream has a high-water mark of 32 messages. A stream whose reader stopped reading is closed and unsubscribed instead of queueing. | Full r1 must-address 7 (economics-1). | Refusing a ninth guest, which would let one device hold the lobby shut. | delivered, bc7b7730 (run a41f6567) |
| PR7 | The pin is drawn with `randomInt` from `node:crypto`, not with `Math.random` (`store.ts` `fresh()`). | Known limit (v) of the full r1. Craft did not judge it, because the round exited early. It is one line, in a security path inside the span. | Leaving it for the full r2 to judge. | delivered, b206d6c5 (run a41f6567) |
| PR8 | A phone's credential is its own. A join with the right code mints a random token for that phone with node:crypto, and the desk-phone cookie carries it. Beside the key, pairing.json keeps each phone's fingerprint (a hash of its token, never the token), when it joined and when it was last seen. A cookie is a phone while its fingerprint is listed. No credential holds the pin. A cookie of the old shape, the HMAC of the key and the pin, is no longer a phone. The TV's key and its address do not change. | Full r2 must-address 1 (craft-2, high). Every phone held the HMAC of the key and the pin (`phoneToken`, `desk/src/lib/session/pairing.ts:90`; `isPhone`, :94), one shared, unbound, non-expiring token. | Keeping the shared cookie and taking craft-2 to the owner as known limit (vi). | queued, delivery 8c |
| PR9 | A phone not seen for 30 days lapses. The desk lists at most 8 phones, and a join over the cap forgets the phone seen least recently. 'Forget this desk' (the leave event) drops this phone's fingerprint, so its cookie is dead wherever it was copied. A TV reset forgets every phone, as today. Last seen is written at most once an hour per phone. pairing.json is written through a temp file and a rename. | craft-2 (no expiry, and no per-phone revoke short of a full reset). Also craft-11 (low): pairing.json is written in place. | none recorded | queued, delivery 8c |
| PR10 | The code on the TV turns over after each phone joins with it, so a code that was seen stops working once it is used. A listed phone never needs the code, so the phone stops remembering it. A code that a phone stored before is cleared on its next open. PR5's remembered-code half is superseded; its typed and QR halves stand. | craft-2 (the display code is also a long-lived secret). Also the r2 stale-code answer: ten stale phones, or three stale phones plus seven typos, trip the cooldown. | A longer code, and a code that turns over on a timer. | queued, delivery 8c |

Left for a later round, by ruling (round 14): expiry and per-phone revoke, a per-device token, and the desk-wide `joined`. Reopened in part (round 15): PR8 to PR10 take the per-device token, expiry and per-phone forgetting. A list of phones on the TV and the desk-wide `joined` stay left.

Delivery 8, as delivered (four commits, run b4747c7d):
- Commits: 1c32a230 (PR1), d5a94eff (PR2), ae2469bd (PR3) and 04d6d002 (a type cast on `lan.ts`, +1/-1). All four are ancestors of `main`.
- Seven files: `desk/src/lib/session/lan.ts` (new), `desk/src/lib/session/store.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/app/page.tsx`, `desk/src/app/api/session/route.ts`, `tools/desk-pairing-test.cjs` and `tools/desk-dev-https.cjs`.
- Fail-before was observed. The 14 new cases were written first and run on 4aa3601f, and all were red except one guard (TV and in-process joins are never counted), which passed before.
- In a cooldown the right code is refused, the pin is unchanged, an earlier phone is still a phone, and the TV and an in-process join get in. The cases are at `tools/desk-pairing-test.cjs:306` (ten wrong codes, then the right code refused with the line, and joined after the cooldown), :320 (the lockout leaves the pin; the TV at :327 and an in-process join at :328 join during it) and :330 (the TV and in-process joins are never counted).
- The gate: 75 suites, 1498 tests. tsc exited 0 at 04d6d002 for the builder, the Director and the App Master. The first tsc run had printed `src/lib/session/lan.ts(31,53): error TS2367`, which the cast fixed.
- Report-only, ruled:
  1. The pin is drawn by `Math.random` (`desk/src/lib/session/store.ts:464`) and compared with `!==` (`desk/src/app/api/session/route.ts:61`). Neither was built. Ruled as PR7 for the draw.
  2. The phone shows the route's error text (`desk/src/app/phone/page.tsx:160`). The cooldown line and WRONG_CODE or NO_CODE appear verbatim. A 1 s wait has no spinner.
- The App Master's reading: `joinSucceeded()` (`desk/src/lib/session/pairing.ts:59`) zeroes the count on every successful join, including the TV's and an in-process one. The phone's quiet rejoin with a remembered code is a guarded join, so a stale code counts toward the budget.

Full r1 (round 2026-10-11-tv-phone-pairing-r1, run cf79b2aa):
- What was judged: 04d6d002 and a span of 17 files: lite r1's 14 plus `desk/src/lib/session/lan.ts`, `desk/src/app/page.tsx` and `tools/desk-dev-https.cjs`. The App Master derived the span.
- The result: fail, overall 0.28, coverage 0.25, round 1 of 3, with uncalibrated judges.
  - Robustness scored 0.40, under its 0.50 mechanical floor, which binds at every trust state. So the round exited early, and value, craft and rivalry are unmeasured.
  - Economics scored 0.10. There was no hard failure.
  - The gates: the merge gate record of run b4747c7d was cited (75 suites, 1498 tests), the council's tsc exited 0, and lint is unmeasured.
- The seven must-address lines, verbatim from result.json:
  1. 'robustness scored 0.4 below its floor of 0.5'
  2. 'value is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  3. 'craft is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  4. 'rivalry is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  5. 'robustness: The session stream's catch {} swallows a throw from liveRole/view: a joined phone carrying one malformed foreign cookie gets a stream that never sends a message, and nothing is logged'
  6. 'robustness: A quiet join refusal is dropped on the phone and the refused remembered code is kept, so stale phones after a reset fill the desk-wide budget and lock out the correct code with no...'
  7. 'economics: A guest can open lobby streams without limit, and every dispatch, a join included, fans out to all of them with no ceiling and no backpressure'
  - Item 6 is stored truncated. robustness-2's full title (`verdict-robustness.json`): 'A quiet join refusal is dropped on the phone and the refused remembered code is kept, so stale phones after a reset fill the desk-wide budget and lock out the correct code with no reason shown'.
  - Items 5 to 7 are robustness-1, robustness-2 and economics-1, all high. Items 2 to 4 are the rows the early exit left unjudged.
  - Item 5, executed in-process: a clean cookie jar got its first message (1349 bytes); with `; other=%E0` added, no message arrived and nothing was logged. `cookiesOf()` decodes with no guard, and the proxy uses Next's tolerant parser.
  - Item 7, run once in-process: with 2000 guest streams, median dispatch went from 0.54 ms to 30.5 ms.
- Lite r1's two lines are both closed at this head.
  - Line 1 (the QR and the printed addresses): closed by replay RA. On the measured host (Tailscale 100.100.134.107, Wi-Fi 2 10.0.0.140, vEthernet (WSL) 172.25.208.1) every surface gives 10.0.0.140.
  - Line 2 (a 4-digit code with no failure delay and no attempt budget): closed as worded, by replay RB. Each refusal waits 1000 ms. 10 codes are checked in the first 5 minutes and 120 in 60 minutes, so finding the pin takes 37.5 h on average and 75 h at worst. A correct guess during the cooldown is refused (403). 200 guesses fired at once: 10 were checked and 190 refused.
  - What still lets a guesser past the budget: when another device's correct join falls between bursts of nine, the count resets. 45 codes were checked in 45 s with no cooldown.
- The remembered-code replay: after a TV reset, ten reopenings of /phone with the old code start the cooldown, and the parent's right code is then refused ('Too many wrong codes. Wait five minutes, then type the code again.'). The phone shows nothing for the quiet refusal, and the stale code stays in localStorage. A phone that joined before a lockout is still a phone (replay RD): the pin is unchanged, and it works as before.
- Known limits (i) to (viii), from report.md section 9:
  - (i) The budget is desk-wide: one device's ten wrong codes, or the family's own stale reopenings, lock every new phone out for five minutes. The TV and already-joined phones are untouched.
  - (ii) The budget lives in memory, so a restart clears it and keeps the pin. Confirmed in code, not replayed, not judged.
  - (iii) Any successful join zeroes the count, including TV and in-process joins (`route.ts:65`). Replayed: nine wrong codes, then a family join, five times over, checked 45 codes in 45 s.
  - (iv) About 120 codes an hour, measured. Not judged.
  - (v) The pin comes from `Math.random` and is compared with `!==` (`store.ts:464`, `route.ts:61`). Not judged. Ruled as PR7.
  - (vi) Expiry, per-phone revoke, a per-device token and the desk-wide `joined` are left for a later round, by ruling. Not judged.
  - (vii) A refused join waits a second, and the phone shows no sign that it is waiting (economics-2).
  - (viii) `tools/desk-dev-https.cjs` loads `lan.ts` through ts-load, and only `--address` has been run. The certificate and next-dev path is unmeasured.
- The findings below the must-address, one line each:
  - robustness-3 (med): several declared or reachable failure paths have no case in the suites; robustness-4 (low): gate composition; robustness-5 (low): `drop/page.tsx` `join()` has no catch around its fetch; robustness-6 (low): `lanHost()` calls `os.networkInterfaces()` unguarded at store module load; robustness-7 (low): per-refusal timers with no concurrency cap; robustness-8 (low): hard-fail checks, none present;
  - economics-2 (med): a refused join holds one 1 s timer and the open request, with no cap on how many are held; economics-3 (med): the client reopens its stream every 1.5 s on error with no attempt cap and no backoff; economics-4 to economics-7 (low).
- Unmeasured, and why: the rivalry member made no web lookups, and craft did not read the device-pairing registry subject. No L2 run: nobody has paired a physical phone, scanned the QR with a camera or paired a second phone.
- A full fail is reworked. The rework is 8b (PR4 to PR7). Full r2 runs all five members after it merges.

Next, ruled 2026-10-11 (round 14): 8b goes first on the delivery lane, ahead of delivery 6. A full fail on a security-sensitive feature that every journey starts with is reworked before new work, and 8b is small. Items 1 to 4 close only when full r2 runs every member; 8b does not answer them. The other findings and known limits are not slotted, and full r2 judges them on the evidence.

Delivery 8b, as delivered (six commits, run a41f6567, merged at 99bcc80e):
- Commits: 33b91924 (PR4), 86df5492 (PR5), bc7b7730 (PR6), b206d6c5 (PR7, with the robustness-3 (a) and (d) pins), and edc5b2bd and 99bcc80e. The last two spell the PR5 em dash check as an escape: edc5b2bd left the class broken and 99bcc80e fixed it. All six, and 63043881, are ancestors of `main` (git cat-file -e and git merge-base --is-ancestor, checked).
- Seven files, +207 -15: `desk/src/app/api/session/stream/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/panelFor.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/lib/session/store.ts` (the pin line and its `randomInt` import only, :9 and :465), `tools/desk-pairing-test.cjs` and `tools/phone-panel-test.cjs`.
- Fail-before was observed: PR4 had 3 red cases, PR5 had 7, PR6 had 3, and PR7 was red on the Math.random check. Guards that passed before:
  - the PR5 route-text check;
  - PR7's range half;
  - robustness-3 (a): 200 concurrent wrong joins, 10 checked and 190 refused;
  - robustness-3 (d): a TV join during the cooldown joins.
- The gate: 75 suites, 1515 tests, 0 failed. tsc exited 0 at 99bcc80e for the builder, the Director and the App Master.
- Report-only, confirmed from that run's result.json and cited on main:
  - Next leaves out an undecodable cookie value and keeps the last of a duplicated name, while `cookiesOf` (`pairing.ts:103`) keeps the first;
  - `cookiesOf` is called only by `liveRole` (`pairing.ts:127`), and `liveRole` only by the stream (`stream/route.ts:37`);
  - the `tvKey` mint (`pairing.ts:79-83`) is outside its try;
  - `drop/page.tsx` opens no stream (it has no EventSource), and the only `EventSource` among the pages is in `desk/src/tv/useSession.ts:19`;
  - there is one stream per TV page and one per phone page.
- Known limits named to full r2 besides (i) to (viii), from the r2 report section 8:
  - (ix) `tvKey` mints outside its try: with an unwritable data dir the proxy throws on every reopen and a right-code join throws, and the phone reopens every 1.5 s (robustness-5, low);
  - (x) a duplicated cookie name: `desk-phone=bad; desk-phone=<good>` gives proxy phone and stream guest; the divergence only downgrades (robustness-2, med; craft-7, low);
  - (xi) the refusal line shows in the shared status bar (`page.tsx:688`), not in the Join panel; no member scored it;
  - (xii) `panelFor.ts` carries copies of the route texts; the copies match and `phone-panel-test.cjs:709` checks them (craft-9, low, suggests 429 with Retry-After);
  - (xiii) a status with no error text reads as a wrong code: a 500 with no JSON forgets a right remembered code (robustness-3, med; robustness-7 and value-7, low);
  - (xiv) eviction churn with more than eight guests: 8 guests make 0 reopens in 60 s, 9 make 40, 20 make 469, 50 make 1639 (economics-5 and craft-12, low).

Full r2 (round 2026-10-11-tv-phone-pairing-r2, run 8ed29bf1):
- What was judged: head 99bcc80e and the 17-file span from started.json. The App Master derived the span. Drift: changed.
- The result: ready 0.5155, coverage 1.00, round 2 of 3, uncalibrated judges, no hard failure. Scores: value 0.50, craft 0.45 and rivalry 0.50, all first measured; robustness 0.62 (0.40 at r1); economics 0.60 (0.10).
- Full r1's lines 5 to 7 at this head:
  - line 5 (robustness-1): closed, replay RF_stream_faults. A malformed foreign cookie no longer silences a phone stream, and a throw while drawing logs one line and ends the stream.
  - line 6 (robustness-2): closed as written, replay RC_remembered_code. Residual: the desk-wide cooldown can still be tripped by the family (10 stale phones, or 3 stale plus 7 typos), and neither a TV join nor a reset lifts it.
  - line 7 (economics-1): closed for guest streams, replay RG_fan_out. Residual: joined-phone and TV streams are uncapped. With 2000 phone streams, the median dispatch is 84.9 ms.
- The stale-code answer (director-answers.json): a stale phone counts once per reset. Ten stale phones alone, or three stale phones plus seven typed mistakes, trip the cooldown. A TV join and a TV reset do not lift it. Each phone shows 'The TV has a new code. Type the code the TV shows.' on its first open after the reset. A right remembered code during the cooldown gets the cooldown line, is not counted and is kept. Server replayed, phone display claimed.
- The must-address line, verbatim from result.json: 'craft: the phone credential is the display code: one shared, unbound, non-expiring token for every phone'. Craft-2 (high): `phoneToken` is the HMAC of the key and the pin, set as desk-phone for 400 days, so every joined phone holds the same cookie, with no per-device record, no cap, no list and no expiry. Revocation is all-or-nothing, 'Forget this desk' revokes nothing, and the 4-digit display code is also a long-lived secret.
- The findings below the must-address, one line each (verdict files):
  - value: value-1 (med) plain http under the documented start; value-2 (med) the TV setup runs through a server terminal; value-3 (med) a child's typos can lock the household out for five minutes; value-time-saved and value-4 to value-8 (low);
  - craft: craft-3 (med) authorization fails open when the role header is absent; craft-4 (med) one desk-wide join brake; craft-5 (med) secrets ride in query strings; craft-6 (med) a phone's writes are a denylist over an unvalidated cast; craft-1 and craft-7 to craft-13 (low);
  - rivalry: rivalry-1 (med) parity on QR plus short code; rivalry-2 (med) the TV never shows which phones are joined; rivalry-3 (med) behind YouTube on TV-side revocation; rivalry-4 to rivalry-7 (low);
  - robustness: robustness-1 (med) stale remembered codes can lock the family out; robustness-2 (med) proxy and stream disagree on a duplicated cookie name; robustness-3 (med) a server fault on a remembered or QR join reads as a wrong code; robustness-4 (med) 'Forget this desk' swallows a failed leave; robustness-5 to robustness-12 (low);
  - economics: economics-1 (med) no ceiling on joined-phone or TV streams; economics-2 (med) no ceiling on refused joins; economics-3 (med) guest-postable events dispatch with no brake; economics-4 to economics-6 (low).

Next, ruled 2026-10-11 (round 15): by the process ruling, a second full round that comes back ready with a high line is held. The owner's Approval waits, rework 8c (PR8 to PR10) runs, and full r3, the last round, follows. Craft-2 overlaps known limit (vi), which round 14 left for a later round. Full r2 made it the round's only high line, so the deferral is reopened as far as craft-2 reaches. 8c runs after 6b on the delivery lane. The other r2 findings and limits are not slotted, and r3 judges them on the evidence.

## 9. linga-placement-check, with cefr-certificate-issuance

Placement lite r1: ready, 0.6329. CEFR lite r1: ready, 0.5964. One rework (featureSlug `linga-placement-check`), then a
lite r2 of both.

Must-address:
- placement (1) value: Placement confidence reads 'high' from skips, guesses and one-keyword passes
- CEFR (1) value: The band a certificate names rests on one check that reads high from a guess and a skip, and no evidence corroborates it

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PC1 | A mark carries its kind and its strength. A skip is recorded as skipped: no evidence, never a fail. A two-option choose pass and a one-keyword listen pass are weak. A spoken say pass is strong. | Placement (1). `desk/src/lib/english/placement.ts` (say tasks at :79-81 per LG-18). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC2 | High confidence needs at least two strong passes at the band, plus a fail or partial above it that is not a skip (or the band is the top one). Skips never count. A band that rests only on weak passes or skips reads low. | Placement (1). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC3 | Two partials at one band end the check at that band, at low confidence. This answers LG-18. | LG-18 (`docs/BACKLOG.md:111`). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC4 | A weak pass climbs one rung at most, and never into a say task by itself. | Placement (1). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC5 | Whenever confidence is not high, the verdict screen says in one line what the band rests on. | Placement (1). | none recorded | delivered, ac266efc (run ffa7f3f0) |
| PC6 | The certificate consumes only high confidence under the new rules. It also needs at least one piece of the learner's own evidence at the band, dated after the check. This closes CEFR craft-1 (R10). | CEFR (1). | none recorded | delivered, 4aa3601f (run ffa7f3f0), with LG-10 marked built in docs/BACKLOG.md |
| PC1-a | A skip is stored with `skipped: true` beside verdict 'fail'. It still moves the ladder down, and no count includes it. A choose pass and a one-word listen pass are weak; every other pass is strong. A mark with no kind reads as a say mark. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC2-a | Two real A1 fails and no pass read medium (the rests floor). | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC3-a | The band of two partials stays that band. These are PC3's words, and lite r1 value-2 named dropping below it as the defect. Confidence is low, so no certificate issues. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC4-a | After a weak pass, the next task holds the band when the next band's task would be a say task. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC6-a | 'At the band' is not built, because evidence carries no band. Any piece of the learner's own evidence after the check corroborates. CEFR craft-1's band half stays open. | The builder's report-only answer, accepted. | none recorded | delivered as reported, 4aa3601f (run ffa7f3f0) |
| PC6-b | `certGap` sets `needsNew` only when it has no blocker and no open skill. That is exactly when `issue()` waits only for a piece after the check. One case pins a high check with nothing after it and open skills, which gets no `needsNew`. | CEFR lite r2 robustness-2 and craft-3, where 24 of 288 built records disagree. `desk/src/lib/english/cert.ts:174` sets `needsNew` whenever `corroborated(...)` is false, without looking at `open`. | One function that returns a certificate or a gap (craft-3's shape), which is a larger change. | delivered, 63043881 (run 7e1cad00) |

This rework is serial with the Linga rework (delivery 11), because they share files.

Delivery 9, as delivered (three commits, run ffa7f3f0):
- Commits: 05192cff (PC1 to PC4, +92/-20), ac266efc (PC5, +22/-4) and 4aa3601f (PC6, +37/-15). All three are ancestors of `main`.
- Nine files, all declared: `desk/src/lib/english/placement.ts`, `check.ts`, `types.ts`, `view.ts` and `cert.ts`, `desk/src/english/LingaPhone.tsx`, `tools/linga-rules-test.cjs`, `tools/cert-rules-test.cjs` and `docs/BACKLOG.md`. Nothing in `session/`, `tv/`, `app/` or `rules/`, and `BAND_NAME` is untouched.
- Fail-before was argued from the source, not run. The App Master confirmed it in the old source.
- The CEFR lite r2 ran cert 23 on f2645f41's `cert.ts`: four assertions fail there ('medium issues nothing', 'medium blocker low', 'high with all evidence older issues nothing' and 'certGap names needsNew'), and three pass as guards.
- The changed expectations each name PC6 or PC2: cert 4 (the step-down fixture, medium to high), cert 11 (a completing check now issues nothing), cert 16 to 18, 20 and 22 (the fixture default, medium to high), and the linga-rules ladder test (`climb('A1', fail)` now reads medium).
- The `view.ts` caption for the 'low' blocker was reworded from 'a mixed read' to 'not firm enough', because it now also stands for medium.
- The gate: 75 suites, 1483 tests. tsc exited 0.
- Its report-only answers, ruled:
  1. Stored confidence is read by `cert.ts` `certBand`, by `view.ts` and `LingaPhone.tsx` (through `restsLine`, which re-derives the reason from the stored tasks), and by `PlacementRecord`. An old stored 'high' from skips still meets `certBand`. A re-read would need a migration decision, and the placements record keeps no tasks. Not built, not slotted.
  2. 'At the band' is not built, because evidence carries no band. Ruled as PC6-a.
  3. PC3 says two partials end the check at that band. The builder places the band at the partial band unless a held band is higher. Ruled as PC3-a.
  4. Two real A1 fails and no pass read medium. Ruled as PC2-a.
  5. `Mark` and `staircase` now return a `rests` field (additive).

Placement lite r2 (round 2026-10-11-linga-placement-check-lite-r2, run 6b308dab):
- The result: lite-ready 0.7186 (r1 0.6329), coverage 0.70, must-address empty, round 2 of 3, judged at 4aa3601f. Scores, with the delta against r1: value 0.67 (+0.12), craft 0.74 (+0.06), robustness 0.78 (+0.06). Rivalry and economics are not judged in lite. The judges are uncalibrated. The App Master derived the span (r1's seven files plus `view.ts`).
- r1's line ('value: Placement confidence reads 'high' from skips, guesses and one-keyword passes') is closed, by reproduction:
  - viktor-67, two skipped A1 tasks: A1, low, and the check is not done (r1: high). Line: "Some tasks were skipped, so this level is a careful guess."
  - tomas-9, a guessed A2 choose pass, a one-word A2 listen pass and a skipped B1 say: A2, low (r1: high).
  - The stored task carries `skipped: true` beside verdict 'fail', and the flag survives the trip to disk. The summary prompt carries `verdict: "skipped"`.
- r1's mediums:
  - value-2, repeated partials drop the band: better. Five A2 partials read A2 low (r1: A1 medium).
  - value-3, upward lean from guessed tasks: better, not closed. Walking tomas-9 through the ladder still ends at B1 low with a B1 say task in task 3 or 4. LG-14 stays open.
  - value-4, the verdict screen does not say how much the band rests on: closed.
  - craft-1, the mark type throws away strength: closed.
  - craft-2, a skip is stored as a spoken fail: better. The verdict stays 'fail' beside the flag.
  - robustness-1, no case for the skip path: better. The pure ladder and every `restsLine` shape are pinned; `check.ts:311`, the summary prompt and both screens' lines have no case.
- The answers on known limits:
  - (i) A placement stored before 05192cff keeps its stored confidence. Confirmed (value-5, low).
  - (ii) Two partials at one band place the learner at that band. Confirmed as a real lean (value-2, med): A2 pass twice then B1 partial twice reads B1 low, where r1's code read A2 medium.
  - (iii) Two real A1 fails and no pass read medium. Better.
  - (iv) A skipped task's stored verdict stays 'fail'. Holds; no reader was found that calls it a fail.
- What the old code (f2645f41) does with the new cases: the PC5 test fails whole, because `restsLine` does not exist. In the PC1 to PC4 test, seven assertions pass on the old code by design (the floor band, a skip stepping B1 to A2, two say passes under a say fail reading high, a longer listen pass climbing to B2, a weak A2 choose pass climbing to B1, and `cleanPlacement` writing no flag when skipped is false). The rest fail there.
- The new findings: value-6 (med): an all-skipped check stores an A1 placement, sets the level and asks the model for what the learner "showed"; craft-3 (med): `restsLine` re-derives the reason from the tasks while the badge uses the stored confidence; robustness-1 (med): no case reaches `check.ts:311`; value-7 (low): the verdict line is not always plain for a 9-year-old; value-8 (low); craft-4 to craft-7 (low); robustness-2 to robustness-4 (low).

CEFR lite r2 (round 2026-10-11-cefr-certificate-issuance-lite-r2, run 98ac0359):
- The result: lite-ready 0.6464 (r1 0.5964), coverage 0.70, must-address empty, round 2 of 3, judged at 04d6d002 on the App Master's 13 files, unchanged from r1. Scores, with the delta against r1: value 0.55 (+0.10), craft 0.70 (+0.02), robustness 0.75 (0.00). The judges are uncalibrated.
- r1's line ('value: The band a certificate names rests on one check that reads high from a guess and a skip, and no evidence corroborates it') is closed, by R9, R10 and the check drive:
  - R9: tomas-9's marks read A2 low, `certBand` is null, and `issue()` issues nothing.
  - R10: a high B2 check completing from replies all older than it issues nothing, and `certGap` shows `needsNew: true`. One typed reply dated after the check issues. A medium check with that reply issues nothing.
  - The `check.ts` drive: a B1 high read leaves certificates at 0 at completion; an all-skipped check reads A1 low.
- r1's mediums:

| r1 finding | now |
|---|---|
| robustness-1, a digit from a topic title | unchanged |
| robustness-2, the gate cited, not observed | better (four span suites and tsc run) |
| value-2, the next scene ignores open skills with no plan | unchanged |
| value-3, no journey or run reaches a certificate | unchanged |
| craft-1, evidence carries no level | unchanged |
| craft-2, BASE_SKILLS unread, the plate silent about it | unchanged |

- The answers on known limits:
  - (i) 'At the band' is not built. The weakest B2 that issues is a high B2 check with all seven B2 skills shown only by later replies and one typed 'Hi.' (medium, value-1).
  - (ii) An old stored 'high' from two plain-fail skips still meets `certBand`; only the corroboration rule stands between it and a plate (medium, value-3).
  - (iii) A held certificate survives a later medium check. Consistent with 'kept for good' (low, value-7).
  - (iv) 'low' also stands for medium. The one text it drives is accurate for both (low, value-7).
  - (v) No screen reads `needsNew`. The TV reads 'Linga issues it when you next finish a conversation.', and the phone shows nothing (medium, value-4).
- The regressions:
  - What held: a high A2 check with every skill shown after it issues; issuing twice is idempotent; the certificate survives 400 newer pieces; self, low and medium never certify.
  - `certGap` and `issue()` do not agree on `needsNew`: 24 of 288 built records set it while 3 to 5 skills are open (robustness-2, craft-3). The reverse never occurred. Ruled as PC6-b.
  - cert 23 on f2645f41's `cert.ts`: four assertions fail and three pass as guards (craft-6).
  - The changed expectations (cert 4, 11, 16 to 18, 20 and 22) are sound. Cert 11 loses its only positive path through a check's completion (craft-5).
- The findings: value-1 to value-5 (med); craft-1 to craft-3 (med); robustness-1 (med, the digit) and robustness-2 (med, `needsNew`); value-6 to value-8 (low); craft-4 to craft-9 (low); robustness-3 to robustness-6 (low). robustness-3: a finished level check cannot issue with the real clock, and the one path that does is a future-dated record.

Next, ruled 2026-10-11 (round 14): neither feature is on the full-round list, so both lanes end at lite-ready. PC6-b is slotted as delivery 9b, because it is a defect in a field that just merged. The other mediums of both lite r2 rounds are not slotted.

Delivery 9b, as delivered (one commit, run 7e1cad00):
- 63043881 changes `desk/src/lib/english/cert.ts`, +3 -2. `certGap` computes `open` first and sets `needsNew` only when `open` is empty and `corroborated(...)` is false (`cert.ts:175`), and the `CertGap.needsNew` comment (:157-158) is reworded.
- It also changes `tools/cert-rules-test.cjs`, +29: cert 24 (:515) and cert 25 (:524).
- Fail-before was observed. On the base, cert 24 was red (needsNew true, expected undefined), and cert 25 was red with 28 disagreements of 288. The council counted 24 with its own record builder; the suite's helpers and a B2 plus describe plan give 28. After the fix there are 0. cert 23 (:335) passes unedited.
- The gate: 75 suites, 1517 tests. tsc exited 0 for the builder, and for the Director at 63043881.
- Report-only, confirmed:
  - `needsNew` is read nowhere outside `cert.ts` (:158 the field, :175 where it is set) and the tests;
  - `tools/linga-cert-live.cjs` asserts on `certGap(l).open` (:72), which this fix does not change;
  - `tools/uat-recertify-test.cjs` references neither.

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
- value-3 and EM4-2/EM4-5 joined delivery 6. Moved to delivery 13 (round 15): EM4-5 is EM-B36's re-read count, and EM4-2's missing paragraph count belongs to the Sunday line, so they sit with EM-B36 and the lens order. Delivery 6 carries only the essay's own must-address lines.
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

Full r3 (round 2026-10-10-weekly-digest-for-parents-r3, run f795a859) was judged at 60d9398c on a span of 18 files. Drift: changed. Result: ready 0.6311, coverage 1.00, no must-address line, no hard failure. This was the last round.
- Scores: robustness 0.80 (0.65 at r2), value 0.56 (0.50), craft 0.72 (0.66), rivalry 0.50 (unchanged). Economics has no score in the result.
- Medium findings:
  - robustness-1: an unreadable learners.json made the hint door answer counted:true while nothing was counted, because `addHints` read through `getLearner`. Ruled as P7-b, delivered 21a3e500.
  - craft-1: the learners.json atomic write skips fsync, and a zero-length file reads as an empty book that the next save writes over.
  - craft-2: write outcomes travel through module-global 'last write landed' flags instead of a return value.
  - value-1: a homework-only week names no topic and no weakness, only volume.
  - value-2: the page covers only the seated learner. A two-child parent reaches the sibling's week only through a learner switch on the TV.
  - rivalry-1: the week is pulled from the paired phone, never pushed.
  - All but robustness-1 are unslotted.
- The value member measured two scenarios: homework-only-week-cz (0.45) and two-child-household (0.40). Declaring them for later rounds is the owner's call. Neither is declared.
- The digest Approval is the owner's to decide.

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
- A delivery that comes before a full round is checked against its brief before the round runs. A gap found there is ruled and delivered first, with no lite round (learner-profile: 7b, then 7c).
- A static-analysis sweep runs beside a delivery only on files outside that delivery's paths. A finding in a delivery's file is filed open for a later pass, not edited (the unused Clock in `desk/src/tv/screens.tsx`).
- A builder's report-only answer that the App Master confirms in the code is ruled as a row and slotted, like a council finding (P11 from 7d, P12 from 5b).
- A delivery released by a usage limit with commits on its branch is finished by a salvage run. The salvage run cherry-picks those commits, verifies them, adds what is missing and builds the rest. The old branch is superseded once the salvage merges (5a: run 036c1dd7, salvaged by run 62a80958).
- Corrected 2026-10-10 (round 10): the plan change applies to student-working-explanation. It is a lite-ready major, so its full r1 follows its rework with no lite r2. From wake 59 to wake 62, the App Master's journal named a lite r2 by mistake.
- A settlement that finds a defect in code that just merged rules a follow-up delivery before the feature's next review (X5b after X5).
- When the merge gate skips typecheck, the App Master runs tsc --noEmit at the merge commit himself before the settlement is recorded (7d-3, X5, X5b).
- A high line left after a feature's last full round goes to the owner as a decision beside the Approval. A fourth full round is refused (student-working-explanation full r3, craft-1).
- A delivery's declared paths include every test that asserts the text it changes. X6 was held on `tools/calc-marking-test.cjs` test 4, which was outside its paths.
- Review runs write their run line to `.ai/skill-runs.local.jsonl`, which git ignores, and never to `.ai/consults.jsonl`, which this repo tracks. There is no gitignore change.
- A council vault lost with its review worktree is scaffolded fresh by the next round, which says so.
- A full round that exits early on a mechanical floor is reworked on the must-address lines that carry a finding. Its unmeasured rows close only when the next full round runs every member (tv-phone-pairing full r1).
- A lite-ready feature that is not on the full-round list ends its lane at lite-ready. A medium found in code that just merged may still get a small follow-up delivery (PC6-b).
- A ruling that left a finding for a later round does not shield it. When a later full round makes it a high line, it is reworked like any other, and the deferral is reopened only as far as the line reaches (tv-phone-pairing full r2, craft-2, as 8c).
- A delivery whose rows are of two shapes is split by shape, one run each, in the lane's order (essay: 6a rules the reading, 6b draws what was not ruled).

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
L1. the first lean sweep of desk/ (ledger lean-2026-10-10-desk): done, 17ffb8a7 (run feedcd76). Five of the seven TS6133 findings were removed, one commit each. Open: read.ts num (a probable missed use, not ruled), screens.tsx Clock (done at 4db57efe, run dab615ba, ledger f05bd322), calculus1.ts and habits.ts (no desk/src importer, test-only), and 560 unused exports, counted and not judged.
4b. MB-B7 wording and way in, plus homework value-3 (MB-B15): done, d2276d38 (run 56d9271f).
4d. MK10 with value-unsure-says-different (marking full r3 value-1), plus MK12: done, 1476d461 (run af864d93).
5. explain, X2-X4: done. 5a (X3, X4): 1dfcfdae (salvage run 62a80958, after run 036c1dd7 was released). 5b (X2's Type it): af73ca72 (run e8e43454). X2's language half: 5a2135b9. 5c, the full r1 rework: X5 (X5, X5-a) done, c4bd192d (run 38d6db69); X5b (X5b, X5b-a) done, 0a5a5296 (run e9761c26).
5d, the full r2 rework (X6 and X6-a): done, 025d06c3, 92c8bbd1 and db28d070 (run af69ab78, after held run 0994cd5c).
6. essay. 6a (E1, E1-a, E1-b, E2 and E2-a): dispatched. 6b (E3 with EM-B21, and E4): queued after 6a. Digest value-3 with EM4-2/EM4-5 moved to 13 (round 15).
7. learner-profile, plus homework robustness-6. 7a: done, 4fef0a35 (run 3720e29a). 7a2: done, 60d9398c (run f1df9456). 7b (P4 with P4-a, P7-a, P7-b and P8): done, 3a0a70f8 (run 27364288). 7c (P4-b and P7-c): done, 1245013b (run 8704f32e). 7d (P9): done, 7955c66d (run c2a3c969). 7d-2 (P10-a, P11-a and P12): done, f5a854c0 (run c976c3d8). 7d-3 (P13, P14 and P15): done, 1bbf359c (run 243b0a17). 7d-4 (P16): done, 44cbbca1 (run 5ad42cde). 7d-5 (P17): done, 0edd8b13 and 61d87bfc (run 200beb31). P18: done, 84832dfa (run 80b15cc1). The pre-r3 rework (P17-a, P18-a): done, 5f9a8c67 and 34f7b4bf (run 1ee1d75f).
8. pairing PR1 to PR3: done, 1c32a230, d5a94eff, ae2469bd and 04d6d002 (run b4747c7d). 8b, the full r1 rework (PR4 to PR7): done, 33b91924, 86df5492, bc7b7730, b206d6c5, edc5b2bd and 99bcc80e (run a41f6567). 8c, the full r2 rework (PR8 to PR10): queued after 6b.
9. CEFR with placement, PC1 to PC6: done, 05192cff, ac266efc and 4aa3601f (run ffa7f3f0). 9b (PC6-b): done, 63043881 (run 7e1cad00).
10. the W7 overlay.
11. Linga with LG-25, after the owner's Approval.
12. the claude-era Linga LT run.
13. the recap follow-up, EM-B36 and MB-B23, plus digest value-4 and the lens order, after learner-profile, and digest value-3 with EM4-2/EM4-5 (moved from 6, round 15).
13a. the recap write-door contract: unchanged (queued; it goes next on the lane when the owner decides the recap Approval, and does not wait for learner-profile).

Ruled 2026-10-11 (round 14): the lane runs 8b, then 6, then 9b. Ruled 2026-10-11 (round 15): 9b ran before 6, beside the pairing full r2, because 6's phone half needs desk/src/app/phone/page.tsx, a file in that round's span. The lane now runs 6a, 6b, then 8c.

Unslotted: EM-B11, WD6, marking value-calc-gaps, marking craft-1, homework value-retake-double-counts, and these hint full r1 mediums: value-1, craft-5, value-3, craft-2, craft-3, craft-4, robustness-2, economics-2 and economics-3. Also these:
- the homework full r3 mediums (economics-1, economics-2, value-resnap-double-count, robustness-1, craft-1 to craft-3, rivalry-1 to rivalry-4);
- digest full r2 robustness-2;
- the digest full r3 mediums other than robustness-1: craft-1, craft-2, value-1, value-2 and rivalry-1;
- EC1d;
- the learner-profile full r1 findings below its must-address (section 7), with craft-1 as candidate 7e;
- the student-working-explanation full r1 findings not delivered, the full r2 findings below its must-address, and the X5 and X5b known limits (ii) and (iii) (section 5); (i) and (iv) are taken by X6 and X6-a; the 11/12 example is kept by X5;
- the student-working-explanation full r3 findings below its must-address (section 5);
- the learner-profile full r2 findings below its must-address (section 7);
- P18's report-only answer 3, the empty catches (section 7);
- the hint re-ask try count;
- the hint full r2 mediums;
- the marking full r3 mediums other than value-1;
- the learner-profile lite r2 mediums that are not in 7b: robustness-2, robustness-3, robustness-8 with value-2, craft-2, craft-4 and robustness-10.
- the learner-profile full r3 findings below its must-address (section 7);
- the tv-phone-pairing full r1 findings below its must-address, and its known limits (section 8);
- the tv-phone-pairing full r2 findings below its must-address, and its known limits (i) to (xiv) other than what PR8 to PR10 take (section 8);
- the placement lite r2 mediums (section 9);
- the CEFR lite r2 mediums other than PC6-b's (section 9).

Review lane, in order:
- marking full r2: done, ready 0.6433 (run 13cf8526);
- digest full r1: done, fail 0.40 (run 03fa57dd);
- homework full r2: done, ready 0.5125 (run 18799a66);
- hint full r1: done, ready 0.5556 (run 6cf02f5a);
- homework full r3: done, ready 0.5867 (run f6b73d06), the last round;
- digest full r2: done, ready 0.5694 (run a03b1279), one high line, reworked as WD14;
- marking r3: done, ready 0.6885 (run cc346058), the last round;
- hint full r2: done, ready 0.6035 (run 77dbd15a, finished by resume run 058f9e18);
- digest full r3: done, ready 0.6311 (run f795a859), the last round;
- learner-profile lite r2: done, ready 0.7036 (run e1fc9eaf);
- learner-profile full r1: done, ready 0.5585 (run c916b03c), one high line, reworked as 7d and 7d-2;
- student-working-explanation full r1: done, ready 0.50 (run 908c9d3a), two high lines naming one defect, reworked as X5 and X5b;
- student-working-explanation full r2: done, ready 0.5575 (run a7fb68b4), two high lines naming one defect, reworked as X6 and X6-a;
- learner-profile full r2: done, ready 0.5625 (run 73da4bac), one high line, reworked as P18;
- student-working-explanation full r3: done, ready 0.5805 (run dff24ac2), the last round, one high line (craft-1), with the owner as a decision;
- learner-profile full r3: done, ready 0.5525 (run 333437c2), the last round, one high line (robustness-2), with the owner as a decision;
- tv-phone-pairing full r1: done, fail 0.28 at coverage 0.25 (run cf79b2aa), on the robustness floor, reworked as 8b;
- placement lite r2: done, ready 0.7186 (run 6b308dab);
- CEFR lite r2: done, ready 0.6464 (run 98ac0359);
- tv-phone-pairing full r2: done, ready 0.5155 (run 8ed29bf1), one high line (craft-2), reworked as 8c;
- essay-paragraph-analysis full r1: after 6b merges;
- tv-phone-pairing full r3: after 8c merges, the last round.

## Open contradictions

None open after round 15. P8's quoted start text is ruled as 7b question 1, so it is not open.

Supersessions that are resolved, not open: MK2 by MK5, MK3 by MK8, the lite r2 and r3 steps by the plan change, P3's per-learner slot by P3-a, P6's SERVER_ONLY clause by P6-a, P10 by P10-a, X1c's line in the numberWords.ts header by X5, and PR5's remembered-code half by PR10 (queued).

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
