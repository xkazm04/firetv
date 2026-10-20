# Recertify, round 21 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-21`, **level L1 only (code re-walk on main 6e50d7c3, 2026-10-20)**; no model, no vision, no browser, no device, no push, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-20/findings.json` (4 rows) was answered `recurs` (none `fixed`) with current file:line evidence at 6e50d7c3; every desk/src/lib/rules/essay.ts line was re-read, none copied from recert-20. Two rows are new: one open (`L1-helena-46-EM1-9`, the blind r4 English false positive) and one found-and-fixed (`L1-eliska-12-EM2-7`, the reviseSentence observation recert-19 and recert-20 carried). Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-20`; 21 runs, 84 rows stamped recurs, 0 fixed by the 4 gaps): a recurring row stays open with `recurrence` + 1 and `recertify_run: 2026-10-09-essay-l1/recert-21`. Its restatement is in `recert-21/findings.json` (`recurs: 2026-10-09-essay-l1/recert-20/<id>`). The new fixed row `L1-eliska-12-EM2-7` was filed open in `recert-21/findings.json` and closed through `writeBack()` on its own run (`not-seen` -> `fixed`, 1 stamped), never by hand. OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only; no findings.json and no OPEN.md line was edited by hand.

## Reconcile

Head of this round: **6e50d7c3** (the worktree branch was cut from the local main tip, `git rev-parse HEAD main` both 6e50d7c3934ebb98991edaf19193e27a052d3905). Previous head bf036c94.

```
git merge-base --is-ancestor 76523b70 main: true
git merge-base --is-ancestor b490c9d0 main: true
git merge-base --is-ancestor 97141532 main: true
git merge-base --is-ancestor f4aea028 main: true
git merge-base --is-ancestor 6e50d7c3 main: true
76523b70 2026-10-20 06:54:04 +0200  tools/essay-heldout-czech-short-r4.json (new, 114 insertions, the only file of that commit)
b490c9d0 2026-10-20 06:59:21 +0200  desk/src/lib/rules/essay.ts (+2 -2), tools/essay-rules-test.cjs (+20 -2)
97141532 2026-10-20 07:08:21 +0200  tools/essay-rules-test.cjs (+13), the rewrite-link test
f4aea028 2026-10-20 07:10:35 +0200  desk/src/lib/desk/essay.ts (+2 -2), the fix
6e50d7c3 2026-10-20 07:13:41 +0200  tools/essay-rules-test.cjs (+2 -2), two stubs given backs: 0
git log -- tools/essay-heldout-czech-short-r4.json: 76523b70 only
```

The blind r4 set was committed alone (76523b70, 06:54:04) before the rule (b490c9d0, 06:59:21), and no later commit edited it. `git show --stat 76523b70`: one file, 114 insertions; `git show --stat b490c9d0`: only desk/src/lib/rules/essay.ts and tools/essay-rules-test.cjs. Whole-file sha256 of tools/essay-heldout-czech-short-r4.json: **02a9eb1b1fb3696b420580206ebb881bf1a92dd2e7b111ac198a9c99ed8a3461**. The sha256 pinned inside it (of `JSON.stringify({czech, english})`) is **3e4861b694fd72fd4e78fe98c652655d2c6aa3f4ec3d37ef047861dcb18bf3f7**; it equals the recomputed hash (and the value the r4 test checks in tools/essay-rules-test.cjs).

Files that moved since the last walk (`git diff --stat bf036c94 6e50d7c3 -- desk tools`): desk/src/lib/rules/essay.ts (2 insertions, 2 deletions), desk/src/lib/desk/essay.ts (2 and 2), tools/essay-rules-test.cjs (39), tools/essay-heldout-czech-short-r4.json (new). `git diff -U0` on rules/essay.ts: two in-place hunks, `:245` (CZECH_SHORT_SHAPE gains `zte$|ohu$|inach$|^naj.{2,}`) and `:247` (CZECH_SHORT_WORDS gains `snim klice klic`), so **no cited line moves**. On desk/src/lib/desk/essay.ts: `:10` (the import drops `observationOk`) and `:303` (reviseSentence uses `unanswered`), in place, no line moves. desk/src/app/api/analyse/route.ts and desk/src/app/phone/page.tsx are byte-identical.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 4 | 0 blocker, 1 major, 2 minor, 1 polish |
| Fixed | 0 of the 4 | – |
| Recurs | 4 | 0 blocker, 1 major, 2 minor, 1 polish |
| of which narrowed | 1 | L1-helena-46-EM1-4 (polish; the title and figures now name the r4 blind set) |
| New, open | 1 | `L1-helena-46-EM1-9` (minor, rank 4) |
| New, found and fixed | 1 | `L1-eliska-12-EM2-7` (minor, rank 6), closed through writeBack |
| Open after | 5 | 0 blocker, 1 major, 3 minor, 1 polish |

OPEN.md: Essay 4 -> 5; total open 236 -> 237; Math 6 -> 6 (not run, see Math); Linga unchanged: the Linga section of OPEN.md (the text from "# Linga" up to "# Essay Master") hashes to sha256 `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` after, **equal**, and equal to the recert-20 value.

## Pair verdicts now

| Pair | At previous round | Now | Walk |
| --- | --- | --- | --- |
| eliska-12 EM2 | L1-conditional | L1-conditional (EM2-1 recurs, declined; EM2-7 found and fixed) | [eliska-12--EM2.md](recert-21/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional (two rows: EM1-4 narrowed and accepted as a residual; EM1-9 new) | [helena-46--EM1.md](recert-21/helena-46--EM1.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional (two rows left, unchanged) | [kristyna-17--EM1.md](recert-21/kristyna-17--EM1.md) |

## The short-Czech figures, measured here, labelled honestly

Scratch scripts outside the repo (`rc21/measure21.cjs` under the OS temp directory; tools/ts-load.cjs; essay.ts at 6e50d7c3 and, for "before", `git show b490c9d0^:desk/src/lib/rules/essay.ts`; no model). They print counts, and for an English line refused, its array index and sha256 only. Verbatim (whole-file sha256 and pinned inner sha256 each shown, the inner one recomputed equal on every set):

```
r4 BLIND essay-heldout-czech-short-r4.json: after b490c9d0 Czech refused 55/59, English refused 1/45; before (b490c9d0^) Czech 54/59, English 1/45; leaks now 4; file sha256 02a9eb1b1fb3696b420580206ebb881bf1a92dd2e7b111ac198a9c99ed8a3461; pinned inner 3e4861b694fd72fd4e78fe98c652655d2c6aa3f4ec3d37ef047861dcb18bf3f7 recomputed-equal true
  english refused after: en[15] sha256 aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71 | before: en[15] sha256 aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71
r3 TUNED essay-heldout-czech-short-r3.json: after b490c9d0 Czech refused 60/60, English refused 0/45; before (b490c9d0^) Czech 57/60, English 0/45; leaks now 0; file sha256 e90edcb74df70140cb383d3199cbefafc167db6a7d6c709472aea9af054a0c84; pinned inner ad2017a6678efe1a906d5949ea66e5e1b6e83daf1f29f2baa5622496c82488ab recomputed-equal true
r2 TUNED essay-heldout-czech-short-r2.json: after b490c9d0 Czech refused 60/60, English refused 0/44; before (b490c9d0^) Czech 60/60, English 0/44; leaks now 0; file sha256 8ebcdc0cb1fcadae7aa812f6b7ffa1e21fa1f0c30d0e1fd19e49654f6739128b; pinned inner 1701dd066610d6c68db0940e66346a5217f0a3ae00f52e20411a5d750e6e0c56 recomputed-equal true
first held-out TUNED essay-heldout-czech-short.json: after b490c9d0 Czech refused 53/53, English refused 0/42; before (b490c9d0^) Czech 53/53, English 0/42; leaks now 0; file sha256 186557498a86e047aa22aca36583fd51c7a3e20c98c69895de9a034fe1aa1116; pinned inner 35a43d2aa348fa6d23a6ef79d5453af32805602a638eb544c5f87b268b252900 recomputed-equal true
tuning set TUNED essay-tuning-czech-short.json: after b490c9d0 Czech refused 56/56, English refused 0/44; before (b490c9d0^) Czech 56/56, English 0/44; leaks now 0; file sha256 414b77f76d59987b8bc5e6f24a85d879c2ea3d18d992cdc4aaf9a2b3252cdab7; pinned inner ea9d8fff385d8abdfab93e52ced8c15024e2807bd7f266d4a9a4575aaafa1c9b recomputed-equal true
```

| Set | Czech refused | English refused | What the figure is |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r4.json | **55 / 59 (93.2%)**, 54/59 before the rule | **1 / 45** (same line before and after) | **BLIND.** Pinned (76523b70) before the rule (b490c9d0), measured once after it. |
| tools/essay-heldout-czech-short-r3.json | 60 / 60 (57/60 before the rule) | 0 / 45 | **TUNED** now: its 3 leaks were tuned on in b490c9d0. No longer blind evidence. |
| tools/essay-heldout-czech-short-r2.json | 60 / 60 | 0 / 44 | **TUNED** (bf036c94). |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED** (534ba3e0). |
| tools/essay-tuning-czech-short.json | 56 / 56 | 0 / 44 | **TUNED** by construction. |

Every figure equals what the App Master's brief expected (r4 54/59 -> 55/59 with 4 leaks, r3 60/60, r2, the first held-out set and the tuning set 0 leaks, English refused 1/45 on r4 both before and after, 0 elsewhere). One brief claim differs when measured: "each fresh blind set leaks about 5%" holds for r3 (3 of 60 = 5.0%) but r4 is 4 of 59 = **6.8%**; the decision below uses the measured figure.

### L1-helena-46-EM1-4: ruling and the DECISION to stop word-list tuning

- Blind r4 55/59 (93.2%, 4 leaks) does not meet the bar "A Czech message is refused in a plain sentence before the wait". The rule earned +1 blind line (54/59 before it). The row stays OPEN as narrowed (recurs): **4 of 59 blind short plain-letter Czech lines still go to the model.**
- **Decision (App Master's brief, recorded here and on the row):** word-list tuning stops after four rounds. Each fresh blind set leaked about 5 percent (r3 3/60, r4 4/59 = 6.8%), and each fix turns the set it aimed at into a tuned set, so the next blind set leaks again. The residual is **accepted and stated**, not chased further with word lists. The row stays open as the accepted residual; a builder does not add words or shapes for it again.
- **What would reopen it:** a non-word-list approach (for example a character-n-gram or statistical language identifier, or any other signal that is not an enumerated list of Czech words and endings), built and measured on a fresh, never-seen blind set (a new r5 pinned alone before the approach is built). Closure needs zero blind leaks with 0 English refused.
- The 4 leaking r4 lines are not printed, quoted or analysed anywhere in the repo, and no r3 leak is printed either (counts only); r4 keeps its value as the one still-blind Czech set until a builder deliberately spends it.

### L1-helena-46-EM1-9 (new, open): the blind r4 English false positive

1 of 45 English lines of the blind r4 set is refused by `paragraphIsEnglish`, at b490c9d0 and also before it (b490c9d0^): the rule neither caused nor cured it. It is identified by **file, array index and sha256 only**: `tools/essay-heldout-czech-short-r4.json` `english[15]`, line sha256 `aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71`. **The line is not printed anywhere.** Why: the recert record must not leak held-out text, and index plus hash is enough to reproduce it (read `english[15]`, confirm its UTF-8 sha256, call `paragraphIsEnglish`). Filed as a new open row (minor, rank 4 = low frequency x med reachability x med trust erosion) in `recert-21/findings.json`, so it reaches OPEN.md through `writeStatus`, as recert-20's own restated rows did. `tools/essay-rules-test.cjs:2324` pins `en.length<=1`, not 0 (and the comment above it says so: step-2 baseline 1/45). A recert must not edit tools/, so this is only **RECOMMENDED**: once a fix exists, make that pin a failing assertion (0/45). Under the stop-tuning decision the fix is a non-word-list change; it makes r4 a tuned set.

### L1-eliska-12-EM2-7 (new, found and fixed): reviseSentence and a missing link

The observation recert-19 and recert-20 carried is FOUND AND FIXED.

- **Before figures** (on main before f4aea028; the test 97141532 pinned them as "ruled strong on main"): a Structure rewrite with no `supports` and an Evidence rewrite with no `backs` were both ruled **strong**, because `reviseSentence` checked `observationOk` only and not the link (desk/src/lib/desk/essay.ts:303 then; `linkMissing` rules/essay.ts:475, `unanswered` :487).
- **The fix** f4aea028 (desk/src/lib/desk/essay.ts): `reviseSentence` uses the first pass's `unanswered` check (:303; `observationOk` is no longer imported, :10), so a missing link throws "no observation came back for sentence n" and records nothing. **The test** 97141532 added `rewrite link: a rewrite that leaves out the link its lens needs fails the run, like the first pass; 0 and an integer link rule`; **6e50d7c3** gave two stubs `backs: 0` (legitimate: they test the note and the prompt, not the link).
- **Re-run at 6e50d7c3**: that test is green; both missing-link rewrites throw; the controls `supports: 0`, `backs: 0` and integer links `1` still rule. tools/essay-rules-test.cjs 178/0.
- The row was filed with its before figures and closed `fixed` through `writeBack()` (status `not-seen`, LT evidence; never `resolved-verified`).

### L1-kristyna-17-EM1-1: stays open on its L arm

Rule on Czech word lists, or say we do not rule Czech: the decision is the operator's. CONNECTORS (desk/src/lib/rules/essay.ts:14), LINK (:16), CONTRAST (:435), wordIn (:448) and noTurn (ADULT_CHECKS :500, YOUNG_CHECKS :513) are English-only and byte-identical to bf036c94 at the same line numbers. The refusal figures (55/59 blind, 1/45 English) narrow this row; they never fix it.

## Rows still open (5)

| Finding | Sev. | Answer | Evidence at 6e50d7c3 |
| --- | --- | --- | --- |
| `L1-kristyna-17-EM1-1` | major · rank 9 | recurs, narrowed (refusal arm 55/59 blind r4, 1/45 English; L arm untouched, operator-owned) | rules/essay.ts:245, :247, :265, :280-291 (refusal); :14, :16, :435, :448, :500, :513 (English-only lists) |
| `L1-kristyna-17-EM1-3` | minor · rank 6 | recurs | desk/essay.ts:113-136 (no language line); rules/essay.ts:497, :510 (English CHECKS) |
| `L1-eliska-12-EM2-1` | minor · rank 6 | recurs (declined under R6) | desk/essay.ts:271, :304, :308 (reviseSentence copies the other verdicts) |
| `L1-helena-46-EM1-9` | minor · rank 4 | **new**, open | tools/essay-heldout-czech-short-r4.json english[15] (sha256 above); rules/essay.ts:280-291; tools/essay-rules-test.cjs:2324 (pin `<=1`) |
| `L1-helena-46-EM1-4` | polish · rank 2 | recurs, narrowed (4 of 59 blind leaks; word-list tuning stopped, residual accepted) | rules/essay.ts:245-249, :265, :279-291 (:286 the short arm); desk/src/app/api/analyse/route.ts:173, :201 |

## Regressed

None. The rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate).

## Math: why recert-10 was not run

`git diff bf036c94 6e50d7c3 -- desk/src/app/phone/page.tsx` is **empty** (0 bytes; `--stat` also empty). The page did not move, so no Math-cited line moved. Math recert was not run: **Math 6 -> 6, not run**.

## Cite re-mapping

None needed. `git diff -U0 bf036c94 6e50d7c3 -- desk/src/lib/rules/essay.ts` has two in-place hunks (:245, :247), and desk/src/lib/desk/essay.ts two (:10, :303); no line number moves, so every cite of recert-20 keeps its number. The lines cited above were re-read in the file at 6e50d7c3, not copied.

## Suites run at 6e50d7c3

tools/essay-rules-test.cjs 178/0 (178 tests; includes the r4 test and the rewrite-link test), tools/essay-piece-test.cjs 54/0, tools/phone-panel-test.cjs 120/0, tools/voice-rules-test.cjs 8/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0 (pass/fail).

`cd desk && npm run test:rules` (FULL, run once, from the worktree through the junctioned node_modules; nothing installed; no tsc here, the desk gate is the rule suites): totals **89 green, 0 red; tests 2338, pass 2338, fail 0**; duration_ms sum 140001; wall 154878 ms. (The suites were run before the stamps were written; the merge gate runs the full suite again on the committed branch.) typecheck and lint are not configured for this project: skipped, not passed.

## Method

Every row open in recert-20 (4) was re-walked at 6e50d7c3. The refusal figures were re-measured in this round on all five sets, each with its own label and each also on b490c9d0^. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-20 (an L1 code walk by the builder session); the product moved in two fix commits (b490c9d0, f4aea028) and three test commits (76523b70, 97141532, 6e50d7c3). The executions are written by the walker, not held out from it. The r4 Czech file was written by a fresh author before the rule and is the one still-blind set; r3 was tuned on in b490c9d0 and is no longer a held-out figure. | all rows | 2026-10-09-essay-l1/recert-20 -> 2026-10-09-essay-l1/recert-21 |
