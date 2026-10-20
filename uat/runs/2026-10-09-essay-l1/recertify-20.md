# Recertify, round 20 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-20`, **level L1 only (code re-walk on main bf036c94, 2026-10-20)**; no model, no vision, no browser, no device, no push, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-19/findings.json` (4 rows) was answered `recurs` (none `fixed`) with current file:line evidence at bf036c94; every desk/src/lib/rules/essay.ts line was re-derived, none copied from recert-19. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-19`; 20 runs, 80 rows stamped recurs, 0 fixed): a recurring row stays open with `recurrence` + 1 and `recertify_run: 2026-10-09-essay-l1/recert-20`. Its restatement is in `recert-20/findings.json` (`recurs: 2026-10-09-essay-l1/recert-19/<id>`). OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

## Reconcile

Head of this round: **bf036c94** (the worktree branch was cut from the local main tip, `git rev-parse HEAD main` both bf036c9482f33de1125cefd6eb468ff51600e003).

```
git merge-base --is-ancestor 8c273798 main: true
git merge-base --is-ancestor 2da37c3b main: true
git merge-base --is-ancestor bf036c94 main: true
2da37c3b 2026-10-20 06:22:56 +0200  tools/essay-heldout-czech-short-r3.json (new, 115 insertions, the only file of that commit)
bf036c94 2026-10-20 06:28:11 +0200  desk/src/lib/rules/essay.ts (+4 -2), tools/essay-rules-test.cjs (+20 -1)
git log -- tools/essay-heldout-czech-short-r3.json: 2da37c3b only
```

The blind set was committed alone (2da37c3b, 06:22:56) before the rule (bf036c94, 06:28:11), and no later commit edited it. `git show --stat bf036c94`: the rule commit touched only desk/src/lib/rules/essay.ts and tools/essay-rules-test.cjs. Whole-file sha256 of tools/essay-heldout-czech-short-r3.json: **e90edcb74df70140cb383d3199cbefafc167db6a7d6c709472aea9af054a0c84**. The sha256 pinned inside it (of `JSON.stringify({czech, english})`) is ad2017a6678efe1a906d5949ea66e5e1b6e83daf1f29f2baa5622496c82488ab; it equals the recomputed hash and equals the value the r3 test pins in tools/essay-rules-test.cjs (2286-2287, the `assert.equal(sha,'ad2017a6...')` line).

Files that moved since the last walk (`git diff --stat 2bdbdee8 bf036c94`, desk only): desk/src/lib/rules/essay.ts (4 insertions, 2 deletions; the only desk file). `git diff -U0` hunks: `-245 +245,3` (CZECH_SHORT_SHAPE gains four endings, +2 lines: the round-3 comment and CZECH_SHORT_WORDS) and `-247 +249` (czechShortShape also reads CZECH_SHORT_WORDS). Every essay.ts line from :248 is +2.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 4 | 0 blocker, 1 major, 2 minor, 1 polish |
| Fixed | 0 | – |
| Recurs | 4 | 0 blocker, 1 major, 2 minor, 1 polish |
| of which narrowed | 2 | L1-kristyna-17-EM1-1 (major, refusal arm only), L1-helena-46-EM1-4 (polish) |
| New | 0 | – |
| Open after | 4 | 0 blocker, 1 major, 2 minor, 1 polish |

OPEN.md: Essay 4 -> 4; total open 236 -> 236; Math 6 -> 6 (not run, see Math); Linga unchanged: the Linga section of OPEN.md (the text from "# Linga" up to "# Essay Master") hashes to sha256 `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` after, **equal**, and equal to the recert-19 value.

## Pair verdicts now

| Pair | At previous round | Now | Walk |
| --- | --- | --- | --- |
| eliska-12 EM2 | L1-conditional | L1-conditional | [eliska-12--EM2.md](recert-20/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional (one polish row left, narrowed) | [helena-46--EM1.md](recert-20/helena-46--EM1.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional (two rows left; EM1-1 narrowed) | [kristyna-17--EM1.md](recert-20/kristyna-17--EM1.md) |

## The short-Czech figures, measured here, labelled honestly

Scratch scripts outside the repo (`rc20/measure20.cjs`, `rc20/prov20.cjs` under the OS temp directory; tools/ts-load.cjs; essay.ts at bf036c94 and, for "before", `git show bf036c94^:desk/src/lib/rules/essay.ts`; a temp DESK_DATA_DIR; no model). They print counts only. Verbatim (whole-file sha256 and pinned inner sha256 each shown, the inner one recomputed equal on every set):

```
r3 BLIND essay-heldout-czech-short-r3.json: after bf036c94 Czech refused 57/60, English refused 0/45; before (bf036c94^) Czech 55/60, English 0/45; leaks now 3; file sha256 e90edcb74df70140cb383d3199cbefafc167db6a7d6c709472aea9af054a0c84; pinned inner ad2017a6678efe1a906d5949ea66e5e1b6e83daf1f29f2baa5622496c82488ab recomputed-equal true
r2 TUNED essay-heldout-czech-short-r2.json: after bf036c94 Czech refused 60/60, English refused 0/44; before (bf036c94^) Czech 52/60, English 0/44; leaks now 0; file sha256 8ebcdc0cb1fcadae7aa812f6b7ffa1e21fa1f0c30d0e1fd19e49654f6739128b; pinned inner 1701dd066610d6c68db0940e66346a5217f0a3ae00f52e20411a5d750e6e0c56 recomputed-equal true
first held-out TUNED essay-heldout-czech-short.json: after bf036c94 Czech refused 53/53, English refused 0/42; before (bf036c94^) Czech 53/53, English 0/42; leaks now 0; file sha256 186557498a86e047aa22aca36583fd51c7a3e20c98c69895de9a034fe1aa1116; pinned inner 35a43d2aa348fa6d23a6ef79d5453af32805602a638eb544c5f87b268b252900 recomputed-equal true
tuning set TUNED essay-tuning-czech-short.json: after bf036c94 Czech refused 56/56, English refused 0/44; before (bf036c94^) Czech 56/56, English 0/44; leaks now 0; file sha256 414b77f76d59987b8bc5e6f24a85d879c2ea3d18d992cdc4aaf9a2b3252cdab7; pinned inner ea9d8fff385d8abdfab93e52ced8c15024e2807bd7f266d4a9a4575aaafa1c9b recomputed-equal true
CZECH_SHORT_WORDS: 40 words, 25 beyond the r2 leak words; r3 Czech lines holding a word beyond the r2 leak words: 4; r3 English lines holding any listed word: 0
baseline leaks 5 gained by the rule 2 of which hold a word from CZECH_SHORT_WORDS 2 of which hold a word beyond the r2 leak words 1 | lines newly refused by the shape regexes alone (no listed word) 0
```

| Set | Czech refused | English refused | What the figure is |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r3.json | **57 / 60 (95.0%)**, 55/60 before the rule | 0 / 45 | **BLIND.** Written by an author who had not seen the leaks, pinned (2da37c3b) before the rule (bf036c94), measured once after it. |
| tools/essay-heldout-czech-short-r2.json | 60 / 60 | 0 / 44 | **TUNED.** Its 8 leaks were tuned on in bf036c94; this 60/60 is **not** blind evidence and is not cited as such anywhere in this round. |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED** (its leaks were tuned on in 534ba3e0). |
| tools/essay-tuning-czech-short.json | 56 / 56 | 0 / 44 | **TUNED** by construction. |

My r3 measurement equals the builder's 57/60 and 0/45, so the ruling below stands as given.

### L1-helena-46-EM1-4: ruling

The App Master's ruling, recorded with its reasons: **blind 57/60 (95%, 3 leaks) does NOT meet the bar; the row stays OPEN as narrowed (recurs).**

- The expected text, "A Czech message is refused in a plain sentence before the wait", is a universal claim about a Czech message. One short Czech message in twenty still goes to the wait, which is exactly the failure the row names.
- The baseline on that same blind set was already 55/60, so the rule earned +2 blind lines. Most of that coverage predates the rule, and the rule was tuned only on r2.
- The row's claim, restated: **3 of 60 blind short plain-letter Czech lines still go to the model.**
- The 3 leaking r3 lines are not printed, quoted or analysed anywhere in the repo (counts only), so r3 keeps its value until a builder deliberately spends it.
- A provenance note, counts only: of the 5 r3 lines the baseline missed, 2 are now refused, and both hold a word of CZECH_SHORT_WORDS (1 of them a word beyond the 15 words of the r2 leaks; none was refused by the shape endings alone). The list has 40 words, 25 beyond the r2 leak words; 4 r3 Czech lines hold one of those 25, and no r3 English line holds any listed word. This is context for the next builder, not a change of label: the r3 author's blindness is the commit order and the brief, which this walk checked.
- **Next step.** A fix aimed at the 3 r3 leaks turns r3 into a tuned set. A fresh, never-seen **r4** set must be pinned (committed alone, sha256 inside) BEFORE that fix and measured once after it. Closure needs **zero blind leaks with 0 English refused**.

### L1-kristyna-17-EM1-1: stays open on its L arm

Rule on Czech word lists, or say we do not rule Czech: the decision is the operator's. CONNECTORS (desk/src/lib/rules/essay.ts:14), LINK (:16), CONTRAST (:435), wordIn (:448) and noTurn (ADULT_CHECKS :500, YOUNG_CHECKS :513) are English-only and byte-identical to 2bdbdee8 apart from their line numbers. The refusal figures (57/60 blind, 0/45 English) narrow this row; they never fix it.

## Rows still open (4)

| Finding | Sev. | Answer | Evidence at bf036c94 |
| --- | --- | --- | --- |
| `L1-kristyna-17-EM1-1` | major · rank 9 | recurs, narrowed (refusal arm 57/60 blind, 0/45 English; L arm untouched, operator-owned) | rules/essay.ts:245, :247-249, :265, :280-291 (refusal); :14, :16, :435, :448, :500, :513 (English-only lists) |
| `L1-kristyna-17-EM1-3` | minor · rank 6 | recurs | desk/essay.ts:113-136 (no language line, file byte-identical since 2bdbdee8); rules/essay.ts:497, :510 (English CHECKS) |
| `L1-eliska-12-EM2-1` | minor · rank 6 | recurs (declined under R6) | desk/essay.ts:271, :304, :308 (reviseSentence copies the other verdicts; byte-identical) |
| `L1-helena-46-EM1-4` | polish · rank 2 | recurs, narrowed (3 of 60 blind leaks) | rules/essay.ts:245-249, :265, :279-291 (:286 the short arm); desk/src/app/api/analyse/route.ts:173, :201 |

## Regressed

None. The rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate; eliska EM1-4's refusal arm is pinned by tools/essay-rules-test.cjs and still passes).

## New findings for the next drain

None filed. No English line is refused by bf036c94 (0 of 45 on r3, 0 of 44 on r2, 0 of 42, 0 of 44). Observed again, not a row: `reviseSentence` (desk/src/lib/desk/essay.ts:303) checks `observationOk` only, not `linkMissing` (rules/essay.ts:475). It waits until this recert merges, then is executed and filed if a rewrite with no supports/backs is ruled.

## Math: why recert-10 was not run

`git diff 2bdbdee8 bf036c94 -- desk/src/app/phone/page.tsx` is **empty** (0 bytes; `--stat` also empty). The page did not move, so no Math-cited line moved. Math recert was not run: **Math 6 -> 6, not run**.

## Cite re-mapping

`git diff -U0 2bdbdee8 bf036c94 -- desk/src/lib/rules/essay.ts` has the two hunks above; every cited line from :248 on is +2 (czPlain :263 -> :265, paragraphIsEnglish :278-290 -> :280-291 with its doc at :279, CONTRAST :433 -> :435, wordIn :446 -> :448, ADULT_CHECKS :495 -> :497, YOUNG_CHECKS :508 -> :510, noTurn :498/:511 -> :500/:513, linkMissing :473 -> :475, unanswered :485 -> :487); :14 and :16 do not move. desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical, so their cites keep their numbers (the line numbers shown were re-read in the file at bf036c94, not copied).

## Suites run at bf036c94

tools/essay-rules-test.cjs 176/0 (176 tests; includes the r3 test), tools/essay-piece-test.cjs 54/0, tools/phone-panel-test.cjs 120/0, tools/voice-rules-test.cjs 8/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0 (pass/fail).

`cd desk && npm run test:rules` (FULL, run once, from the worktree through the junctioned node_modules; nothing installed): totals 89 green, 0 red; tests 2336, pass 2336, fail 0; duration_ms sum 139349; wall 154551 ms. The r3 builder had run only the narrowed essay suite after its test edit; this full run is the one that was owed. (The suites were run before the stamps were written; the merge gate runs the full suite again on the committed branch.)

## Method

Every row open in recert-19 (4) was re-walked at bf036c94. The refusal figures were re-measured in this round on all four sets, each with its own label and each also on bf036c94^. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-19 (an L1 code walk by the builder session); the product moved in one fix commit (bf036c94) and one test commit (2da37c3b). The executions are written by the walker, not held out from it. The r3 Czech file was written by a fresh author before the rule; r2 was tuned on in bf036c94 and is no longer a held-out figure. | all rows | 2026-10-09-essay-l1/recert-19 -> 2026-10-09-essay-l1/recert-20 |
