# Recertify, round 19 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-19`, **level L1 only (code re-walk on main 2bdbdee8, 2026-10-20)**; no model, no vision, no browser, no device, no push, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-18/findings.json` (5 rows) was answered `fixed` or `recurs` with current file:line evidence at 2bdbdee8. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-18`; 19 runs, 18 rows stamped fixed, 76 stamped recurs): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-essay-l1/recert-19` and `recertify_evidence`; a recurring row stays open with `recurrence` + 1. Its restatement is in `recert-19/findings.json` (`recurs: 2026-10-09-essay-l1/recert-18/<id>`; the fixed row is not restated, as in recert-18). OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only. (The brief names tools/recertify.cjs and tools/ledger.cjs; the drivers live in uat/driver/.)

## Reconcile

Head of this round: **2bdbdee8**. Ancestor checks, `git merge-base --is-ancestor <sha> main` (the worktree branch was cut from the local main tip):

```
git merge-base --is-ancestor 82905fd2 main: true
git merge-base --is-ancestor 534ba3e0 main: true
git merge-base --is-ancestor 2bdbdee8 main: true
82905fd2 2026-10-20 05:33:23 +0200 test(essay): pin a second held-out short plain-letter Czech and English corpus before
82905fd2 2026-10-20 05:33:23 +0200
534ba3e0 2026-10-20 05:37:22 +0200
2bdbdee8 2026-10-20 05:56:59 +0200
```

The r2 held-out file was committed (82905fd2, 05:33:23) before the rule (534ba3e0, 05:37:22), and the refusal arm of eliska EM1-4 came last (2bdbdee8, 05:56:59). `git log -- tools/essay-heldout-czech-short-r2.json` lists only 82905fd2, so no later commit edited it. Its whole-file sha256 is **8ebcdc0cb1fcadae7aa812f6b7ffa1e21fa1f0c30d0e1fd19e49654f6739128b**; the sha256 pinned inside it (of `JSON.stringify({czech, english})`) is 1701dd066610d6c68db0940e66346a5217f0a3ae00f52e20411a5d750e6e0c56 and equals the recomputed hash (the scratch output below). `git diff --name-only 82905fd2 2bdbdee8 -- tools/essay-heldout-czech-short-r2.json` is empty. Order: 82905fd2 (r2 set) -> 534ba3e0 (rule) -> 2bdbdee8 (eliska refusal arm).

Files that moved since the last walk (`git diff --stat 8a739027 2bdbdee8`, desk and tools only): desk/src/lib/rules/essay.ts (the only desk file), tools/essay-heldout-czech-short-r2.json (new), tools/essay-rules-test.cjs, tools/essay-piece-test.cjs.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 5 | 0 blocker, 2 major, 2 minor, 1 polish |
| Fixed (L1, code clause only) | 1 | 0 blocker, 1 major, 0 minor, 0 polish |
| Recurs | 4 | 0 blocker, 1 major, 2 minor, 1 polish |
| of which narrowed | 2 | L1-kristyna-17-EM1-1 (major), L1-helena-46-EM1-4 (polish) |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 4 | 0 blocker, 1 major, 2 minor, 1 polish |

The fixed row names its commit (1 of 1: 2bdbdee8). OPEN.md: Essay 5 -> 4; total open 237 -> 236; Math 6 -> 6 (not run, see Math); Linga unchanged: the Linga section of OPEN.md (the text from "# Linga" up to "# Essay Master") hashes to sha256 `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` after, **equal**, and equal to the recert-18 value.

## Pair verdicts now

| Pair | At previous round | Now | Walk |
| --- | --- | --- | --- |
| eliska-12 EM1 | L1-conditional | L1 pass on the code clause (no row open; L2 owed) | [eliska-12--EM1.md](recert-19/eliska-12--EM1.md) |
| eliska-12 EM2 | L1-conditional | L1-conditional | [eliska-12--EM2.md](recert-19/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional (one polish row left, narrowed) | [helena-46--EM1.md](recert-19/helena-46--EM1.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional (two rows left; EM1-1 narrowed) | [kristyna-17--EM1.md](recert-19/kristyna-17--EM1.md) |

barbora-43 EM1 and daniel-15 EM2 and EM3 hold no open row and were not re-walked.

## The scratch output

Run outside the repo (`rc19/exec19.cjs` under the OS temp directory, loaded through tools/ts-load.cjs, engine.text stubbed so no model is called, DESK_DATA_DIR a fresh temp dir). Commands: `node $TMP/rc19/exec19.cjs <worktree>`. Verbatim (the process did not exit by itself after printing, an open handle in the stub; the output is complete and the run was ended by `timeout`):

```
R2 (semi-blind) tools/essay-heldout-czech-short-r2.json: Czech refused 52/60 (86.7%), English refused 0/44
  leaks (8): ["Mama uklizi pokoj.","Deda sekal drevo.","Nechapu ten priklad.","Boli me noha.","Nebavi me to.","Mrzne a fouka.","Pojedu k babicce.","Neumim plavat."]
  pinned inner sha256 equals hash of JSON.stringify({czech,english}): true (1701dd066610d6c68db0940e66346a5217f0a3ae00f52e20411a5d750e6e0c56)
  file sha256 (whole bytes): 8ebcdc0cb1fcadae7aa812f6b7ffa1e21fa1f0c30d0e1fd19e49654f6739128b
  baseline misses were printed before the rule was written: SEMI-BLIND
R1 (tuned) tools/essay-heldout-czech-short.json: Czech refused 53/53 (100.0%), English refused 0/42
  leaks (0): []
  pinned inner sha256 equals hash of JSON.stringify({czech,english}): true (35a43d2aa348fa6d23a6ef79d5453af32805602a638eb544c5f87b268b252900)
  file sha256 (whole bytes): 186557498a86e047aa22aca36583fd51c7a3e20c98c69895de9a034fe1aa1116
  its 8 leaks were tuned on in 534ba3e0: TUNED, not blind evidence
tuning set (tuned on): Czech refused 56/56, English 0/44
recert-12 heldout.json: Czech 48/48, English 0/32, short plain-letter 6/6
recert-11 heldout.json: Czech 72/72, English 0/34
Kamarad line: refused
English short lines with names: "Tim ran home."->kept; "Pan Smith is here."->kept; "Jan and I met Tom."->kept; "Mas is my friend."->kept; "Nas went to Rome."->kept; "Ted sat down."->kept; "Dan and Eva left."->kept; "Kim ate pizza."->kept; "Anna has a dog."->kept; "Mama and Papa came."->kept; "Pavel plays chess."->kept; "Emil ran home."->kept; "Hotel opened."->kept; "April rain."->kept; "Koala sleeps."->kept
P2 sentences: [[1,"Homework takes hours."],[2,"Research found that teenagers sleep less."],[3,"Therefore it should shrink."]]
--- structure (sentence 2 is job:evidence, link field supports) ---
essay structure reading: no readable observation for sentence 2
  link {}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay structure reading: no readable observation for sentence 2
  link {"supports":null}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay structure reading: no readable observation for sentence 2
  link {"supports":"3"}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay structure reading: no readable observation for sentence 2
  link {"supports":2.5}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
  CONTROL link {"supports":0}: unanswered() = []; analyseEssay -> accepted, RULED [[1,"neutral"],[2,"strong"],[3,"neutral"]]; record() writes 1
  CONTROL link {"supports":3}: unanswered() = []; analyseEssay -> accepted, RULED [[1,"faulty"],[2,"strong"],[3,"strong"]]; record() writes 1
--- evidence (sentence 2 is support:checkable, link field backs) ---
essay evidence reading: no readable observation for sentence 2
  link {}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay evidence reading: no readable observation for sentence 2
  link {"backs":null}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay evidence reading: no readable observation for sentence 2
  link {"backs":"3"}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
essay evidence reading: no readable observation for sentence 2
  link {"backs":2.5}: unanswered() = [2]; analyseEssay -> REJECTED "The desk did not get a reading of every sentence, so it counted nothing. Send it again." (is NOT_EVERY_SENTENCE: true); model stub called 1x; learner-store writes 0; store unchanged true
     (decideVerdicts alone on the same reading, the call the refusal sits in front of: [[1,"neutral"],[2,"strong"],[3,"neutral"]])
  CONTROL link {"backs":0}: unanswered() = []; analyseEssay -> accepted, RULED [[1,"neutral"],[2,"strong"],[3,"neutral"]]; record() writes 1
  CONTROL link {"backs":3}: unanswered() = []; analyseEssay -> accepted, RULED [[1,"faulty"],[2,"strong"],[3,"neutral"]]; record() writes 1
```

## The short-Czech figures, labelled honestly

| Set | Czech refused | English refused | What the figure is |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r2.json | **52 / 60 (86.7%)** | 0 / 44 | **SEMI-BLIND.** The baseline misses were printed before the rule (534ba3e0) was written, so the author saw which lines leaked. It is better than tuned and worse than blind. |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED.** Its 8 leaks (recert-18) were tuned on in 534ba3e0. It is not blind evidence and is not cited as such anywhere in this round or in the insight doc. |
| tools/essay-tuning-czech-short.json | 56 / 56 | 0 / 44 | tuned by construction |
| recert-12/heldout.json | Czech 48/48, short plain-letter 6/6 | 0 / 32 | earlier held-out; some of its 6 short lines are in the tuning set, so that 6/6 is a tuned figure |
| recert-11/heldout.json | 72 / 72 | 0 / 34 | earlier held-out corpus |

These are the figures measured in this round (the scratch output above), not the builder's. They agree with the builder's: 52/60 and 0/44, 53/53 and 0/42. The 8 r2 leaks: "Mama uklizi pokoj.", "Deda sekal drevo.", "Nechapu ten priklad.", "Boli me noha.", "Nebavi me to.", "Mrzne a fouka.", "Pojedu k babicce.", "Neumim plavat.". Fifteen short English lines with names (Tim, Pan Smith, Jan, Mas, Nas, Ted, Dan, Kim, Anna, Mama and Papa, Pavel, Emil, Hotel, April, Koala) are all kept: no English line is refused, so no new row.

- **L1-kristyna-17-EM1-1 stays OPEN on its L arm** (rule on Czech word lists, or say we do not rule Czech). The decision is the operator's. CONNECTORS (desk/src/lib/rules/essay.ts:14), LINK (:16), CONTRAST (:433), wordIn (:446) and noTurn (:498, :511) are English-only and byte-identical to 8a739027 apart from their line numbers. The refusal figures narrow this row; they never fix it.
- **L1-helena-46-EM1-4** is **narrowed (recurs)**, not closed. Its expected text, "A Czech message is refused in a plain sentence before the wait", holds only on blind evidence, and 52/60 semi-blind (8 leaks) is not that. What would close it: a fresh, never-seen held-out set, `tools/essay-heldout-czech-short-r3.json`, written and committed before any further change to `paragraphIsEnglish` by an author who has not read the r2 leaks or the word lists, with its sha256 pinned inside it, measured once after the rule is final (0 English refused, Czech at or near all-refused). The shape the r2 leaks suggest (an unlisted everyday noun or verb: "uklizi", "sekal", "priklad", "noha", "plavat"; the negation prefix ne-; the pronouns me/ten) is a hint for the author of the rule, not for the author of r3.

## L1-eliska-12-EM1-4: stamped fixed, on the code clause only

The brief's refusal arm: a P2-shaped first-pass reading whose evidence sentence (Structure) or checkable sentence (Evidence) names no supports / backs link must be refused as unanswered (the NOT_EVERY_SENTENCE path), and no verdict ruled or recorded; an explicit 0 (backs nothing) is accepted.

- **Where the code is.** `linkMissing` (desk/src/lib/rules/essay.ts:473-478): Structure, `job === "evidence"` and no integer `supports`; Evidence, `support === "checkable"` and no integer `backs`. `unanswered` (:485-492) counts it as missing. `judge` (desk/src/lib/desk/essay.ts:143-146) throws `DeskSaid(NOT_EVERY_SENTENCE)` on a non-empty list, before `decideVerdicts` (:148) and before `record()`. `analyseEssay`, every paragraph of `analysePiece` and of `analysePieceAgain` read through `judge`.
- **Layering, said plainly.** The refusal is in `unanswered`/`judge`, not in `decideVerdicts`: `decideVerdicts` itself still returns a ruling for the unlinked reading (the line in parentheses under each case in the output above, `[[1,"neutral"],[2,"strong"],[3,"neutral"]]`, where the planted unsupported sentence 1 is not faulty). The proof therefore runs the real `analyseEssay` (which calls both) with `engine.text` stubbed, and also prints what `decideVerdicts` alone would have ruled.
- **Result, both lenses, link absent / null / the string "3" / the fraction 2.5:** `unanswered()` = [2], `analyseEssay` rejects with exactly the NOT_EVERY_SENTENCE line, the learner store is written 0 times and is byte-unchanged (nothing ruled, nothing recorded). **Control:** `supports: 0` / `backs: 0` is accepted and ruled; `supports: 3` / `backs: 3` gives the linked path (sentence 1 faulty). Eight refusals, four accepts, in the output above.
- **Stamp.** `fixed` on the code clause only (acceptance text: "the planted unsupported sentence is the faulty one whether or not the model names which claim a sentence backs", met here by refusing the reading rather than ruling without the link). tools/essay-rules-test.cjs pins the same cases (175/0).
- **Remainder, named.** **L2 is owed**: a live P2 x5 per lens through the claude CLI (does the real model name the links often enough that the refusal is rare, and does the retry succeed). This round does not run it. Observed, not a row: `reviseSentence` (desk/src/lib/desk/essay.ts:303) checks `observationOk` only, not `linkMissing`, so the single re-judged rewritten sentence is not covered by the refusal.

## Rows still open (4)

| Finding | Sev. | Answer | Evidence at 2bdbdee8 |
| --- | --- | --- | --- |
| `L1-kristyna-17-EM1-1` | major · rank 9 | recurs, narrowed (refusal arm 52/60 semi-blind, 0/44 English; L arm untouched, operator-owned) | rules/essay.ts:245-247, :263, :278-290 (refusal); :14, :16, :433, :446, :498, :511 (English-only lists) |
| `L1-kristyna-17-EM1-3` | minor · rank 6 | recurs | desk/essay.ts:113-136 (no language line, file byte-identical since 8a739027); rules/essay.ts:495, :508 (English CHECKS) |
| `L1-eliska-12-EM2-1` | minor · rank 6 | recurs (declined under R6) | desk/essay.ts:271, :303-308 (reviseSentence copies the other verdicts; byte-identical) |
| `L1-helena-46-EM1-4` | polish · rank 2 | recurs, narrowed (8 of 60 semi-blind leaks) | rules/essay.ts:245-247, :263, :278-290 |

## Regressed

None. The rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate).

## New findings for the next drain

None filed. No English line is refused by 534ba3e0, and the refusal in 2bdbdee8 sits only on a missing link.

## Math: why recert-11 was not run

`git diff 8a739027 2bdbdee8 -- desk/src/app/phone/page.tsx` is **empty** (0 bytes; `--stat` also empty). The page did not move, so no Math-cited line moved. Math recert was not run: **Math 6 -> 6, not run**.

## Cite re-mapping

```
desk/tools files changed 8a739027..2bdbdee8: desk/src/lib/rules/essay.ts, tools/essay-heldout-czech-short-r2.json, tools/essay-piece-test.cjs, tools/essay-rules-test.cjs
desk/src/lib/desk/essay.ts : file byte-identical, 57 cited lines, 0 differ
desk/src/lib/rules/essay.ts : hunks (old->new) -239,0 +240,8  -255,1 +263,1  -459,2 +467,17  -468,1 +491,1
   cited lines 60 : byte-equal after re-map 59 ; differ 0 ; inside a hunk (re-read by hand) 255
   rows citing hunk lines: 255 [L1-eliska-12-EM1-4,L1-eliska-12-EM2-1,L1-helena-46-EM1-4,L1-kristyna-17-EM1-1,L1-kristyna-17-EM1-3]
desk/src/app/api/analyse/route.ts : file byte-identical, 7 cited lines, 0 differ
desk/src/app/phone/page.tsx : file byte-identical, 6 cited lines, 0 differ
total cited lines 130 differ 0 inside hunks 1
```

## Suites run at 2bdbdee8

tools/essay-rules-test.cjs 175/0 (175 tests), tools/essay-piece-test.cjs 54/0 (54 tests), tools/phone-panel-test.cjs 120/0 (120 tests), tools/voice-rules-test.cjs 8/0 (8 tests), tools/uat-recertify-test.cjs 21/0 (21 tests), tools/uat-ledger-test.cjs 18/0 (18 tests) (pass/fail).

`cd desk && npm run test:rules`: totals 89 green, 0 red; tests 2335, pass 2335, fail 0; duration_ms sum 138631; wall 153661 ms. (Run once, from the worktree through the junctioned node_modules; nothing installed.)

## Method

Every row open in recert-18 (5) was re-walked at 2bdbdee8. A cite is a line of recert-18's evidence re-mapped through `git diff -U0 8a739027 2bdbdee8` per file (above), 130 cited line numbers (ranges expanded), 0 differ, 1 inside a hunk re-read by hand. The refusal figures were re-measured in this round on both sets, each with its own label. The eliska EM1-4 refusal was executed on the real analyseEssay. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-18 (an L1 code walk by the builder session); the product moved in two fix commits (534ba3e0, 2bdbdee8) and one test commit (82905fd2). The executions are written by the walker, not held out from it; the r2 Czech file was written by the builder of 534ba3e0, who read the baseline misses before the rule: semi-blind. | all rows | 2026-10-09-essay-l1/recert-18 -> 2026-10-09-essay-l1/recert-19 |