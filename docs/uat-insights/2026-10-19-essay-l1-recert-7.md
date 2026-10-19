# L1 recertify, round 7, of the Essay Master run 2026-10-09-essay-l1 (2026-10-19)

This was a code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on main 5096c0ce (`5096c0cecc51d8f79594bc9381136a0c800f4b29`). There was no model call, no vision call and no browser, and nothing under `desk/`, `tools/`, `docs/BACKLOG.md` or `desk/data/` changed. The 43 rows open in `recert-6/findings.json` were each answered fixed or recurs from the code; the report is [recertify-7.md](../../uat/runs/2026-10-09-essay-l1/recertify-7.md) and the per-Character walks are in `recert-7/`.

Commits since recert-6 (read at 46db00cc) that touch Essay code and cite an EM row: 70b7d68d, 9a4b8d43, 01327bbe, 6009739d, eabdd019. Two more commits touch `desk/src/tv/` (5e79b0f7, 95abd6a9) and cite Math rows; no Essay row cites their lines. Ids below are recert-6 ids unless written `recert-7/`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-6) | 0 | 17 | 20 | 6 | **43** |
| Fixed (severity as raised) | 0 | 5 | 1 | 0 | **6** |
| Recur (severity now) | 0 | 12 | 19 | 6 | **37** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 12 | 19 | 6 | **37** |

- Each fixed row names its commit, 6 of 6, and every cited commit is an ancestor of 5096c0ce (checked with `git merge-base --is-ancestor`).
- No blocker is open; none was fixed this round.
- OPEN.md Essay 43 -> 37 (whole file 288 -> 282); the Linga and Math sections are byte for byte as committed.

## Fixed, recurs, new, per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| barbora-43 EM1 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| barbora-43 EM4 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM3 | 6 | `daniel-15-EM3-1` | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM1 | 6 | 0 | 6 | 0 | 6 | L1-conditional |
| eliska-12 EM2 | 3 | 0 | 3 | 0 | 3 | L1-conditional |
| helena-46 EM1 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| helena-46 EM5 | 7 | `helena-46-EM5-2`, `helena-46-EM5-3`, `helena-46-EM5-6` | 4 | 0 | 4 | L1-fail |
| kristyna-17 EM1 | 6 | 0 | 6 | 0 | 6 | L1-conditional |
| kristyna-17 EM3 | 4 | `kristyna-17-EM3-1`, `kristyna-17-EM3-3` | 2 | 0 | 2 | L1-conditional |

## Fixed, with commits

| Row (recert-6 id) | Was | Commit | Title |
| --- | --- | --- | --- |
| `L1-daniel-15-EM3-1` | major 9 | 70b7d68d | The forensic page he is moved to shows neither 'paragraph k of n' nor the summary; the first wait says 'your p |
| `L1-kristyna-17-EM3-1` | major 9 | 70b7d68d | The forensic page never names the paragraph; 'Start with paragraph p, sentence n' is on the lens home only, cu |
| `L1-kristyna-17-EM3-3` | minor 3 | 70b7d68d | While the first paragraph of a first piece is read, the TV says 'The desk is reading your paragraph' |
| `L1-helena-46-EM5-2` | major 9 | eabdd019 | After the first reading, no remote path leads back to the Workroom |
| `L1-helena-46-EM5-3` | major 9 | 6009739d | A kept piece can be read only from the phone; the PC page cannot ask for a reading and the Workroom's piece ro |
| `L1-helena-46-EM5-6` | major 9 | 9a4b8d43, 01327bbe | A piece kept from the phone cannot be named, so the Workroom and shelf show its first line or a column of 'Unt |

All six are rows the commits' own subjects name. What each does now, with file:line and the executed repro, is in the row's `recertify_evidence` and in recertify-7.md.

## Recurs

37 rows recur. The ones the new commits touch but do not close:

- **`recert-6/L1-helena-46-EM5-1` (major 12, still the top Essay row):** reading a kept email puts its sentences on the TV. 6009739d makes that one key from the Workroom (OK on a piece), so the reach grew while the curtain, which covers the Workroom, recap and Sunday page only, did not move.
- **`recert-6/L1-barbora-43-EM1-2` and `L1-kristyna-17-EM1-2`:** 9a4b8d43 adds an optional title to the piece call; neither the piece call (phone/page.tsx:293) nor the paragraph call (:320) sends a task, and no history reaches the prompt.
- **`recert-6/L1-helena-46-EM5-4` (the PC page, /drop):** the notice still offers "Read without keeping" and the empty shelf names the TV; 6009739d put the read action on the TV's Workroom, not on /drop.

The rest recur because no commit changed what their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line; four sit in changed hunks and were re-read by hand).

## New

None.

## Top 5 still open, ranked

1. **Reading a kept email puts every sentence on the TV and its first words on the lens home** (`recert-7/L1-helena-46-EM5-1`, major 12).
2. **The x-ray shows a hand-in-ready model paragraph on the phone sample's topic** (`recert-7/L1-barbora-43-EM1-1`, major 9).
3. **The reading never sees the assignment, earlier readings or notes** (`recert-7/L1-barbora-43-EM1-2`, `L1-kristyna-17-EM1-2`, `L1-daniel-15-EM3-2`, major 9): the task parameter exists and nobody sends it.
4. **The paste box and the shelf hide behind the forensic page** (`recert-7/L1-daniel-15-EM3-1`, major 9).
5. **A planted unsupported claim before the evidence is missed by both evidence lenses when the model omits links** (`recert-7/L1-eliska-12-EM1-4`, major 9).

Left the list since recert-6: the forensic page that named neither the paragraph nor where to start, the "your paragraph" wait for a first piece, the Workroom unreachable once a reading is on the desk, the kept piece that only the phone could read, and the phone-kept piece that could not be named.

## Writing slice

**The plan's measure, answered from code at 5096c0ce:** can a learner start one writing episode, get coached and finish it, with the episode's progress in learners.json (a kind `writing` history entry plus the per-lens SkillRecord)? **Yes for the episode and its history line; partly for the SkillRecord, whose one missing step is named below.** The path was also executed in a scratch repro outside the repo (engine stubbed, a disposable data dir): one paragraph read through the Evidence lens, one sentence rewritten, `learners.json` read after each step. Paths are under `desk/src/`.

| Step | What the code does | Where |
| --- | --- | --- |
| 1. Start | On the phone's Essay tab the learner pastes, dictates or picks a file and sends one paragraph (`kind: "essay"`) or, with 2+ paragraphs, the whole piece (`kind: "piece"`, optional Keep, format, name). The route refuses before any run what is too long, not English, or not yet noticed (the one-time notice, 428), then starts a job named "reading your paragraph" or "reading your piece, N paragraphs" and moves the TV to the lens. | app/phone/page.tsx:286-293 (piece), :320 (paragraph); app/api/analyse/route.ts:189-197, :158-184 |
| 2. Read | `analyseEssay` (one paragraph) or `analysePiece` (one call per paragraph, the whole piece as context) asks the model for observations only; the desk decides each verdict in code, and keeps a fix only when it passes `cleanFix`. The reading opens on the TV (`essay.set`, then `essay.progress` per paragraph). | lib/desk/essay.ts:163-169, :183-210; lib/rules/essay.ts:413 (decideVerdicts); app/api/analyse/route.ts:59-79, :198 |
| 3. Record (the episode's first write) | `record()` writes, in one atomic save, a history entry `{ kind: "writing", label: <lens name>, detail: "k of n sentences to fix[, P paragraphs]" }`, applies the reading to the lens's SkillRecord (`withWriting`: one attempt, right when under a quarter of the sentences are faulty), and appends a digest line; a piece records once, after its last paragraph. A reading that fails, or leaves a sentence unanswered, writes nothing. | lib/desk/essay.ts:143-155, :168, :208, :61-62; lib/session/learners.ts:123, :398-417, :426, :442, :167-178 (atomic write to learners.json, `FILE` :114) |
| 4. Coach | The forensic page puts the reading on the TV one sentence at a time: the note, THE MOVE and THE PATTERN (a frame with slots, never her sentence), with the place and the first sentence to fix (70b7d68d). The phone's rewrite panel takes one new sentence; code checks it is one sentence before any model call; `reviseSentence` re-judges that sentence alone, keeps every other verdict, and the TV shows "Rewrite · it holds" or "not yet". | essay/EssayTV.tsx:310, :342, :416-424; lib/rules/essay.ts:717 (taught), :708 (rewriteState); app/phone/page.tsx:710, :256; app/api/analyse/route.ts:107-124; lib/desk/essay.ts:255-295 |
| 5. Finish | The reading's own history line is restated in place with the sentences still to fix and ", k fixed" (`restateReading`; `restatePiece` after a "read again" of failed paragraphs): one line, one episode. The lens home's last-verdict card carries the summary, and the TV's landing, recap, and lens standings read the history and the SkillRecord (`lensStandings`, `writingTotals`). | lib/desk/essay.ts:293, :301-325; essay/EssayTV.tsx:150; tv/landingRows.ts:141; tv/recapRows.ts:56, :98, :329; tv/writingRows.ts:12-26 |

**Executed (scratch repro.cjs):** an Evidence-lens paragraph with one unsupported claim, read -> `learners.json`: `history: [{ kind: "writing", label: "Evidence", detail: "1 of 3 sentences to fix" }]`, `writing.evidence: { seen: 1, right: 0, estimate: 0, secure: false }`, `digest: [{ kind: "essay", lens: "evidence", sentences: 3, faulty: 1 }]`. Then one rewrite that adds a checkable fact: sentence 1 -> strong, `was` faulty, `rewriteState` "holds", and `learners.json` becomes `history[0].detail = "0 of 3 sentences to fix, 1 fixed"`, with `writing.evidence` still `seen 1, right 0, estimate 0`.

**The missing step (named, not filed):** the coaching outcome never reaches the per-lens SkillRecord. `reviseSentence` restates the history line only (lib/desk/essay.ts:293); `withWriting` is called once per reading, with that reading's first count (lib/desk/essay.ts:150), and the code says so on purpose ("no new attempt, the writing estimate and the digest keep the first count, as after a rewrite", :217). So the lens's `estimate` and `secure` measure how clean the first reads are, not whether coaching worked; the evidence that an episode ended well is the ", k fixed" suffix in the history entry (which the recap parses, recapRows.ts:56-58), and the history keeps only the last twenty entries (writingRows.ts:23-25), while the SkillRecord is uncapped. If the plan's measure is "progress in the SkillRecord", this is the one step to decide; a rewrite that holds could count as a second attempt, or not (the double count was the reason it does not).

**Smaller gaps, none a missing step:**
- The episode has no id. The history entry carries the lens name and counts, not the kept piece's id, so a kept piece and its history line are joined only by order (`restateReading` finds the last `writing` line of that lens whose faulty count matches, lib/desk/essay.ts:307). Two readings of one lens with equal counts restate the later one, which is the one just read.
- The start is not recorded, only the read: an episode abandoned before the model answers leaves nothing in learners.json, by design (step 3).
- The learner's rewrite text is not stored anywhere; the TV and session keep the verdict and `was`, and learners.json keeps counts, never a sentence (the digest comment, lib/desk/essay.ts:151).
- A Workroom read of a kept piece (6009739d) is read-only: `noSave` skips `record()` (lib/desk/essay.ts:84, :208), so re-reading the same piece is not a second episode (a rewrite made on that reading goes through the same restate as any rewrite; not walked).

## Method notes

- Rows were answered from the code at 5096c0ce with an executed repro in a scratch directory outside the repo (`repro.cjs`: a stubbed engine, the analyse route, the shelf store and the rules; the forensic place and lead lines, the piece caption, a read -> rewrite episode against learners.json, a phone keep with a title, a 300-character title, a blank title, and a TV read of a kept piece with the shelf and learners.json compared byte for byte). Model-dependent behaviour stays with L2.
- Every cite of recert-6's evidence was re-mapped through `git diff -U0 46db00cc HEAD` per file; moved cites were compared with their old line, and cites inside a changed hunk were re-read by hand and re-written.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped (parent 31, recert-1 40, recert-2 40, recert-3 41, recert-4 42, recert-5 42, recert-6 43 Essay rows stamped; 41 fixed, 238 recurs).
- OPEN.md was regenerated once from the ledger (`writeStatus`, no product annotation, as the committed file is): 288 -> 282. Essay 43 -> 37 is this round; the Linga and Math sections are byte for byte as committed. The Essay section equals the 37 rows of `recert-7/findings.json`, row for row.
- Ids are renumbered in recert-7 (positional within the folder): for example `L1-daniel-15-EM3-1` in recert-7 restates `L1-daniel-15-EM3-2` in recert-6. Each restatement carries `recurs: 2026-10-09-essay-l1/recert-6/<id>`.
- `npm run test:rules` at 5096c0ce: 86 suites green, 2132 of 2132 tests.
