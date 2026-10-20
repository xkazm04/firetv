# L1 recertify, round 21, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 4 rows of `uat/runs/2026-10-09-essay-l1` that were open in recert-20, on 6e50d7c3, after the five commits that landed since bf036c94: 76523b70 (the blind r4 short-Czech set, pinned alone first), b490c9d0 (the rule that followed), 97141532 + f4aea028 + 6e50d7c3 (the reviseSentence rewrite-link test, fix and stub correction). No model call, no browser, no device, no push, desk/ and tools/ untouched. Round doc: `uat/runs/2026-10-09-essay-l1/recertify-21.md`. Nothing is `resolved-verified`.

## Counts: Essay before and after

Essay 4 -> 5: 0 of the 4 fixed, 4 recur (1 narrowed), 1 new open row (`L1-helena-46-EM1-9`), 1 new row found and fixed (`L1-eliska-12-EM2-7`, closed through `writeBack`). Total open 236 -> 237. Math 6 -> 6, not run (`git diff bf036c94 6e50d7c3 -- desk/src/app/phone/page.tsx` is empty). Linga untouched: its OPEN.md section hashes `2a273aab...6a15` before and after (equal, and equal to the recert-20 value). Stamps by `recertify.cjs` `writeBack()` into 21 runs (84 rows recurs); OPEN.md by `ledger.cjs` `writeStatus()`; no hand edit.

**The short-Czech figures (measured this round, not taken from the builder; scratch outside the repo; counts only):**

| Set | Czech refused | English refused | Label |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r4.json | **55 / 59 (93.2%)**, 54 / 59 before the rule | **1 / 45**, the same line before and after | **BLIND**: committed alone in 76523b70 (06:54:04), before the rule b490c9d0 (06:59:21), measured once after it |
| tools/essay-heldout-czech-short-r3.json | 60 / 60, 57 / 60 before the rule | 0 / 45 | **TUNED** now (its 3 leaks were tuned on) |
| tools/essay-heldout-czech-short-r2.json | 60 / 60 | 0 / 44 | **TUNED** |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED** |
| tools/essay-tuning-czech-short.json | 56 / 56 | 0 / 44 | **TUNED** |

r4 whole-file sha256 `02a9eb1b1fb3696b420580206ebb881bf1a92dd2e7b111ac198a9c99ed8a3461`, pinned inner `3e4861b694fd72fd4e78fe98c652655d2c6aa3f4ec3d37ef047861dcb18bf3f7`, recomputed equal. `git show --stat` proves the order: 76523b70 touches only the r4 file; b490c9d0 only desk/src/lib/rules/essay.ts and tools/essay-rules-test.cjs. All figures match what the brief expected. The one difference: the brief's "about 5% per fresh blind set" is 5.0% for r3 (3 of 60) but **6.8% for r4 (4 of 59)**.

- **L1-helena-46-EM1-4 stays OPEN, narrowed (recurs): 4 of 59 blind short plain-letter Czech lines still go to the model.** **Decision recorded: word-list tuning stops after four rounds.** Each fresh blind set leaks about 5 percent and each fix turns its set into a tuned one, so the residual is accepted and stated, not chased with more words or shapes. What would reopen it: a non-word-list approach (a character-n-gram or statistical language identifier, say), measured on a fresh, never-seen set pinned before it is built. No leaking r3 or r4 Czech line is printed anywhere in the repo.
- **L1-helena-46-EM1-9 (new, open, minor, rank 4): 1 of 45 English lines of the blind r4 set is refused as "not English"**, before b490c9d0 and after it. It is identified by file, index and sha256 only: `tools/essay-heldout-czech-short-r4.json` `english[15]`, `aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71`. The line is not printed: a recert record must not leak held-out text, and index plus hash is enough to reproduce it. `tools/essay-rules-test.cjs:2324` pins `en.length<=1`, not 0. A recert must not edit tools/, so this is a RECOMMENDATION only: once a fix exists, make that pin a failing assertion (0/45).
- **L1-eliska-12-EM2-7 (new, found and fixed, minor, rank 6)** is the reviseSentence observation recert-19 and recert-20 carried. Before f4aea028, a Structure rewrite with no `supports` and an Evidence rewrite with no `backs` were both ruled **strong** (the test 97141532 pinned both as "ruled strong on main"). f4aea028 (desk/src/lib/desk/essay.ts, `reviseSentence` uses the first pass's `unanswered` check) makes both fail the run; 6e50d7c3 gave two note/prompt stubs `backs: 0`, which is legitimate because they test the note and the prompt, not the link. Re-run at 6e50d7c3: the test is green; the controls `supports: 0`, `backs: 0` and integer links still rule.
- **L1-kristyna-17-EM1-1 stays OPEN on its L arm** (rule on Czech word lists, or say we do not rule Czech): the operator's decision. The refusal figures narrow the row and never fix it. **L1-kristyna-17-EM1-3** and **L1-eliska-12-EM2-1** recur unchanged (EM2-1 stays declined under R6).
- Suites at 6e50d7c3: essay-rules 178/0, essay-piece 54/0, phone-panel 120/0, voice-rules 8/0, uat-recertify 21/0, uat-ledger 18/0; the full `desk npm run test:rules` is 89 green, 2338/2338 (typecheck and lint: not configured, skipped).

## What remains open, ranked

Score = severity weight (major 3, minor 2, polish 1) x the row's rank, as in recert-20. Essay rows are the 5 open ones plus the fixed-on-code rows that still owe L2; Math rows are the 6 in OPEN.md (severity, rank and standing from `uat/runs/2026-10-09-maths-l1/recert-10/findings.json`). Effort: XS a line, S one file and a test, M a few files or a rule change with fixtures, L a new path. No item is in both lists.

### (a) BUILDER-ALONE: a builder can do it without the operator or a paid model

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-helena-46-EM1-9` (Essay) | minor · 8 · M | A wrongly refused English line is worse for a learner than a leaked Czech one, and it needs neither the operator nor a model. The decision to stop word-list tuning means the fix is not another list. | Pin a fresh blind set first (an r5, committed alone, sha256 inside, by an author who has seen neither the lists nor any leak), then fix `english[15]` of r4 by a non-word-list signal, then change `tools/essay-rules-test.cjs:2324` from `en.length<=1` to 0/45. The fix makes r4 a tuned set; r5 is the blind one. |
| 2 | `L1-helena-46-EM1-4` (Essay) | polish · 2 · M | The same non-word-list approach is the only thing that reopens the Czech residual (4 of 59). Low score, so it rides on item 1. | Measure the non-word-list approach on r5 as well; closure needs zero blind leaks with 0 English refused. Do not add words or shapes. |

### (b) OPERATOR: his ruling, or a live paid L2 run

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` L arm (Essay) | major · 27 · M-L | A product decision: does the desk read Czech texts at all? Either the verdict rules take the text's language (CONNECTORS, LINK, CONTRAST, wordIn, noTurn) or the desk says it does not rule Czech. A builder cannot choose. | Operator picks: rule on Czech word lists, or refuse Czech and say so. The refusal figures never fix this row. |
| 2 | `L1-helena-46-EM1-4` accepted residual (Essay) | polish · 2 | Whether the 4-of-59 residual is moved to `uat/accepted-gaps.md` (outside the paths this round may touch), or stays open until a non-word-list approach exists. | Operator rules; a recert then records it. |
| 3 | `L1-eliska-12-EM1-4` L2 (Essay, fixed on code) | major · L | The code clause is stamped fixed; whether the real model names the links often enough that the refusal is rare is a live model run. The rewrite path now refuses the same way (EM2-7), so the L2 run covers both. | Operator authorizes the live P2 x5 per lens (Structure, Evidence) through the claude CLI. |
| 4 | `L1-kristyna-17-EM1-3` (Essay) | minor · 12 · S | The note language for a Czech text is a choice (Czech, English, or the page's language); the prompt has no language line to build around until it is made. | Operator names the language; a builder then adds the one language line to the reading prompt (desk/src/lib/desk/essay.ts:113-136); whether the model obeys is L2. |
| 5 | `L1-eliska-12-EM2-1` (Essay) | minor · 12 · M | **Stays DECLINED under R6** (docs/BACKLOG.md): its return condition is a learner's or the owner's reading that the kept note misleads, or a lens that judges links. | None until the return condition is met. |
| 6 | `L1-radka-41-MB5-2` (Math) | minor · 12 · M | **BLOCKED** on the open MB5-2 privacy ask with the operator (the recap and week for several learners on one phone); not builder-alone. | Operator answers the privacy ask; a builder then lists each learner with work tonight, with a phone-panel test. |
| 7 | `L1-matyas-19-MB3-5` (Math) | polish · 1 · XS | An owner ruling: `question(spec).tex` is computed for every Calculus spec and read by no screen. | Owner rules (drop the field, or keep it for the typesetter); a builder applies it. |
| 8 | `L1-nela-12-MB2-2` (Math) | minor · 12 · S | An owner ruling: the add/sub questions say "simplest form", or the lesson drops "then simplify". | Operator rules; a builder applies it. |
| 9 | `L1-nela-12-MB2-1` (Math) | minor · 12 | A Czech maths teacher must sign off the tier-2 denominator range for 6. ročník. | Operator brings the teacher's read of three drawn sets. |
| 10 | `L1-matyas-19-MB1-1` (Math) | minor · 12 · L | Needs the vision path (his own weekly sheet marked from a page), then a read on a real sheet. | Operator decides whether the vision path is built before 2026-10-23. |

### Not open building: L1-vojtech-18-MB4-3 (Math)

**DELIVERED at e9c5ee8f (statements A26-A28).** Its standing, quoted from `uat/runs/2026-10-09-maths-l1/recert-10/` as written there: "narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63). They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units." It is owed only a Math recert, not new building, so it is in neither list above; the Math recert is the next run that touches desk/src/app/phone/page.tsx or the library files.

The Essay rows that matter most for the Education UAT goal (due 10-23) sit in (b), items 1 to 4; the builder-alone work is the English false positive and the non-word-list approach, both measured on a fresh r5 set, and it cannot close the major `L1-kristyna-17-EM1-1` by itself.
