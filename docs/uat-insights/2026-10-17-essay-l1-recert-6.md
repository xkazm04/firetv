# L1 recertify, round 6, of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on main 46db00cc (`46db00cca414abbdb81997e4d272f4cd5d6b90de`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 50 rows open in `recert-5/findings.json` were each answered fixed or recurs from the code; the report is [recertify-6.md](../../uat/runs/2026-10-09-essay-l1/recertify-6.md) and the per-Character walks are in `recert-6/`.

Commits since recert-5 (c4893c88) that touch Essay code: e3f70d8b, b9647a00, f48ff556 (with its rework c416b952), c72a35ee, efdf070d. The other desk/ commits since (281da6a6, 0eafafa6, 1573a4ae, 3d948b1d, 1401622e, 46db00cc) are Linga only (`desk/src/lib/english/*`) and no Essay row cites those files. Ids below are recert-5 ids unless written `recert-6/`.

## Counts

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before | 0 | 20 | 24 | 6 | **50** |
| Fixed (severity as raised) | 0 | 3 | 5 | 0 | **8** |
| Recur (severity now) | 0 | 17 | 19 | 6 | **42** |
| New | 0 | 0 | 1 | 0 | **1** |
| Open now | 0 | 17 | 20 | 6 | **43** |

- Each fixed row names its commit, 8 of 8, and every cited commit is an ancestor of 46db00cc (checked with `git merge-base --is-ancestor`).
- No blocker is open; none was fixed this round.
- Pair verdicts are the same as at recert-5 (9 conditional and 1 fail, helena-46 EM5); no pair passes yet, every pair still holds an open row.
- OPEN.md Essay 50 -> 43 (whole file 314 -> 307).

## Fixed, with commits

| Row (recert-5 id) | Was | Commit | What the code does now |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-3 | minor 6 | e3f70d8b | e3f70d8b: the Language lens's fallback is no longer the Paragraph structure move. lessons.data.ts:41 now sends language to "split" and playFor("language") returns SPLIT (:60, :65-67): "One idea per sentence", frame "Say [the one idea] and stop."; taught() (rules/essay.ts:692-697) hands it to a faulty sentence with no usable fix of its own and EssayTV teaching() (:310-314) shows it with the label "The move · language" (:427). Executed at 46db00cc (scratch repro.cjs): taught(faulty, fix {move:"", pattern:""}, playbo… |
| L1-daniel-15-EM3-1 | major 9 | efdf070d | efdf070d: a kept read whose text matches a kept piece is a new version of it. matchPiece (texts.ts:130) returns the kept piece with the same "# heading" title or whose last version shares more than half of its paragraphs with the text (a differing format is another piece; the most recently kept match wins), and the route sends the keep to addVersion on it (analyse/route.ts:124; a match that cannot take a version falls back to a new piece when a format was named, :133-134). Executed at 46db00cc (scratch repro.cjs,… |
| L1-daniel-15-EM3-6 | minor 6 | c72a35ee | c72a35ee: deleting the open piece detaches the phone, and a keep that names a missing piece is a new piece. The shelf reports a delete to the page (EssayShelf.tsx:16, :33, onGone with the piece id, or "all") and the page clears pieceId when it is that piece or all (phone/page.tsx:742, setPieceId(cur => id === "all" // cur === id ? undefined : cur)); the route treats a body.pieceId that is no longer on the shelf as no pieceId (analyse/route.ts:122, getPiece) and keeps a new piece, where it used to answer 404 "That… |
| L1-helena-46-EM1-1 | major 12 | e3f70d8b | e3f70d8b: the piece reading carries its format. analysePiece takes the format (desk/essay.ts:178-183, formatOf :153: a kept piece's stored format, else the one the send named, else none) and judge() adds the line "The kind of writing is given beside the sentences: judge the text as that kind of writing ... never by what an essay does (an email is not asked for a thesis or for evidence)" to the system prompt (:107) and the data row "The kind of writing this is" (:114); the route passes body.format (analyse/route.ts… |
| L1-helena-46-EM1-2 | minor 6 | f48ff556, c416b952 | f48ff556 + c416b952: the reading prompt names who is writing. essayReadingVoice(age, mode) (rules/voice.ts:97) returns "an adult writer" in Adult mode (ADULT_WRITER :90), the real age ("a 17-year-old") for a teen, "a teenager" with none, and the young band unchanged; the route reads the seated profile's mode (analyse/route.ts:63) and hands { mode, task } to the reading (:150, :168); desk/essay.ts speaks of "a writer" instead of "a student" in Adult mode (personOf :83, the "can act on" and "to fill" lines of judge(… |
| L1-helena-46-EM5-2 | major 12 | b9647a00 | b9647a00: a keep names its format. The phone asks before it keeps: with Keep on and no open piece it shows the radio group "What is it?" Message / Email / Essay with nothing preselected (phone/page.tsx:737, state :104) and readPiece refuses "Choose message, email or essay before you keep it." until one is chosen (:287), then sends it (:291, ...(pieceFormat ? { format: pieceFormat } : {})). The routes refuse a new piece with no valid format, 400 FORMAT_NEEDED_LINE, before anything is kept (analyse/route.ts:126, tex… |
| L1-kristyna-17-EM1-4 | minor 3 | f48ff556, c416b952 | f48ff556 + c416b952: a teen is named by the age the profile holds. essayReadingVoice (rules/voice.ts:97) returns ageWho(age) for any non-young age, "a teenager" with none; the Essay reading, the piece reads and the rewrite reading all use it (desk/essay.ts:163, :181, :217, :252). Executed at 46db00cc (scratch repro.cjs, engine stubbed): essayReadingVoice(17).who = "a 17-year-old", essayReadingVoice(undefined).who = "a teenager"; analyseEssay at age 17 -> the system prompt says "a 17-year-old" and no "15-year-old";… |
| L1-kristyna-17-EM3-2 | minor 6 | c72a35ee | c72a35ee: after Delete the next keep-and-read makes a new piece. Delete (one or all) clears the phone's pieceId through onGone (EssayShelf.tsx:33, phone/page.tsx:742), and a keep naming a piece that is gone is a new piece, not a 404 (analyse/route.ts:122-126). Executed at 46db00cc (scratch repro.cjs, engine stubbed): a kept piece deleted, then a keep that still names its id -> 200, a new card with a different id, no "not on your shelf". Pinned by tools/essay-piece-test.cjs ('EM3-6 (recert-5)'). |

## Recurs

42 rows recur. Three of them are narrowed by the new commits and stay open:

- **`recert-5/L1-kristyna-17-EM1-2` (recert-6/L1-kristyna-17-EM1-2) and `L1-barbora-43-EM1-2`:** the reading prompt now carries the profile's mode, the real age and the kind of writing, and a task as data. No client sends a task (the phone posts none on the piece call, page.tsx:291, or the paragraph call, :318; the open Essay Master task is not read), and the learner's earlier readings and recurring faults are not in the prompt. f48ff556's subject names kristyna-17-EM1-2; the code closes the mode, the age and the kind, not the task and the history the row asks for.
- **`recert-5/L1-daniel-15-EM3-4`:** the title line is still its own paragraph; the new task parameter has no title detection feeding it.

The rest recur because no commit changed the behaviour their cited lines describe (cites in files that did change were re-mapped hunk by hunk and compared with the old line; seven sit in changed hunks and were re-read by hand). The ones that matter:

- **helena-46 EM5:** reading a kept email still puts every sentence on the TV (`L1-helena-46-EM5-1`), no remote path leads back to the Workroom, the PC page cannot ask for a reading, and a phone piece cannot be named.
- **daniel-15 EM3 and barbora-43 EM1:** the forensic page shows neither "paragraph k of n" nor the summary, the paste box and shelf hide behind it, the x-ray's model paragraph is on the phone sample's topic.
- **eliska-12 EM1 and EM2, kristyna-17 EM1 and EM3:** the faulty note is still the adult CHECKS line, the planted-claim fix depends on the model naming links, kept verdicts go stale, the Czech language check and English word lists.

## New

One row, minor 6: `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-5`. e3f70d8b gives the piece reading its format, but only a kept piece of 2+ paragraphs asks for one (phone/page.tsx:737) and the paragraph path (`kind: "essay"`, page.tsx:318, `analyseEssay` essay.ts:159) has no format at all. Executed at 46db00cc: a send with format "email" on that path makes one call with no kind line in the prompt. An email she reads on its own is still judged for thesis and evidence by the Structure and Evidence lenses; the Language fallback (the fixed row) no longer tells it to add evidence.

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no ghostwriting), to what the learner keeps, and to the piece list.

1. **Reading a kept email puts every sentence on the TV and its first words on the lens home** (`recert-6/L1-helena-46-EM5-1`, major 12).
2. **After the first reading, no remote path leads back to the Workroom** and **a kept piece can be read only from the phone** (`recert-6/L1-helena-46-EM5-2`, `L1-helena-46-EM5-3`, major 9).
3. **The forensic page shows neither "paragraph k of n" nor the summary** (`recert-6/L1-daniel-15-EM3-1` and `L1-kristyna-17-EM3-1`, major 9).
4. **The reading never sees the assignment, earlier readings or notes** (`recert-6/L1-barbora-43-EM1-2`, `L1-kristyna-17-EM1-2`, `L1-daniel-15-EM3-3`, major 9): the task parameter exists and nobody sends it.
5. **A planted unsupported claim before the evidence is missed by both evidence lenses when the model omits links** (`recert-6/L1-eliska-12-EM1-4`, major 9).

Left the list since recert-5: the kind of writing for a kept piece and the Language essay move, the wrong-twin keep, the duplicate "Untitled essay", the stale pieceId after Delete, the "15-year-old" prompt for an adult and for a 17-year-old.

## Method notes

- Rows were answered from the code at 46db00cc with an executed repro in a scratch directory outside the repo (`repro.cjs`: a stubbed engine, the analyse route, the shelf store and the voice rules; the format reaches the prompt as a data row and in the system prompt, the Language fallback, a keep with no format, a keep naming a deleted piece, a revised paste, the adult and the 17-year-old prompts, the task as data). Model-dependent behaviour stays with L2.
- Every cite of recert-5's evidence was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (156 cites in 20 files); moved cites were compared with their old line, and cites inside a changed hunk were re-read by hand and re-written.
- Stamping: `writeBack` ran once through the ledger with the rerun's own rows skipped (parent 39, recert-1 48, recert-2 48, recert-3 49, recert-4 50, recert-5 50 Essay rows stamped); the ledger was read before any stamp was written.
- OPEN.md was regenerated once from the ledger (`writeStatus`, no product annotation, as the committed file is): 314 -> 307. Essay 50 -> 43 is this round; the Linga and Math sections are byte for byte as committed. The Essay section equals the 43 rows of `recert-6/findings.json`, row for row.
- Ids are renumbered in recert-6 (positional within the folder): for example `L1-daniel-15-EM3-2` in recert-6 restates `L1-daniel-15-EM3-3` in recert-5. Each restatement carries `recurs: 2026-10-09-essay-l1/recert-5/<id>`.
- `npm run test:rules` at 46db00cc: 85 suites green, 2088 of 2088 tests.
