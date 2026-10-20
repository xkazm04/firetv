# L1 recertify, round 20, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 4 rows of `uat/runs/2026-10-09-essay-l1` that were open in recert-19, on bf036c94, after the two commits that landed since 2bdbdee8: 2da37c3b (the blind r3 short-Czech set, pinned alone first) and bf036c94 (the rule that followed). No model call, no browser, no device, no push, desk/ and tools/ untouched. Round doc: `uat/runs/2026-10-09-essay-l1/recertify-20.md`. Nothing is `resolved-verified`.

## Counts: Essay before and after

Essay 4 -> 4: 0 fixed, 4 recur (2 narrowed), 0 new. Math 6 -> 6, not run (`git diff 2bdbdee8 bf036c94 -- desk/src/app/phone/page.tsx` is empty). Linga untouched: its OPEN.md section hashes `2a273aab...6a15` before and after (equal).

**The short-Czech figures (measured this round, not taken from the builder):**

| Set | Czech refused | English refused | Label |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r3.json | **57 / 60 (95.0%)**, 55 / 60 before the rule | 0 / 45 | **BLIND**: written by an author who had not seen the leaks, pinned before the rule, measured once after it |
| tools/essay-heldout-czech-short-r2.json | 60 / 60 | 0 / 44 | **TUNED**: its 8 leaks were tuned on; not blind evidence |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED** |
| tools/essay-tuning-czech-short.json | 56 / 56 | 0 / 44 | **TUNED** by construction |

r3 sha256 `e90edcb74df70140cb383d3199cbefafc167db6a7d6c709472aea9af054a0c84` (pinned inner `ad2017a6...88ab`, equal to the recomputed hash and to the test's pin).

- **L1-helena-46-EM1-4 stays OPEN, narrowed (recurs).** Ruling (App Master; my r3 measurement equals 57/60): blind 57/60 (95%, 3 leaks) does not meet the bar. The expected text, "A Czech message is refused in a plain sentence before the wait", is a universal claim; one short Czech message in twenty still goes to the wait. The baseline on the same blind set was already 55/60, so the rule earned +2 blind lines, most of the coverage predates the rule, and the rule was tuned only on r2. The claim, restated: 3 of 60 blind short plain-letter Czech lines still go to the model. The 3 leaking lines are not printed or analysed anywhere (counts only), so r3 keeps its value. Next step: a fix aimed at the 3 r3 leaks turns r3 into a tuned set, so a fresh never-seen r4 set must be pinned before that fix and measured once after it; closure needs zero blind leaks with 0 English refused.
- **L1-kristyna-17-EM1-1 stays OPEN on its L arm** (rule on Czech word lists, or say we do not rule Czech): the operator's decision. The refusal figures narrow the row and never fix it.
- **L1-kristyna-17-EM1-3** and **L1-eliska-12-EM2-1** recur unchanged (desk/src/lib/desk/essay.ts is byte-identical to 2bdbdee8; EM2-1 stays declined under R6).
- Suites at bf036c94: essay-rules 176/0, essay-piece 54/0, phone-panel 120/0, voice-rules 8/0, uat-recertify 21/0, uat-ledger 18/0; the full `desk npm run test:rules`, owed since the r3 builder ran only the narrowed essay suite, is 89 green, 2336/2336.

## What remains open, ranked

Score = severity weight (major 3, minor 2, polish 1) x the row's rank, as in recert-19. Essay rows are the 4 open ones plus the fixed-on-code rows that still owe L2; Math rows are the 6 in OPEN.md (severity, rank and standing from `uat/runs/2026-10-09-maths-l1/recert-10/findings.json`). Effort: XS a line, S one file and a test, M a few files or a rule change with fixtures, L a new path. No item is in both lists.

### (a) BUILDER-ALONE: a builder can do it without the operator or a paid model

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-helena-46-EM1-4` (Essay) | polish · 2 · M | The only builder-alone step that moves the refusal arm of the major `L1-kristyna-17-EM1-1`. The Czech lexicon question needs no ruling and no model, only an honest sequence. Low score, so first only by leverage. | Write and commit `tools/essay-heldout-czech-short-r4.json` FIRST (a fresh set of short plain-letter Czech and English, by an author who has read neither the r2 nor the r3 leaks nor the word lists, sha256 pinned inside, committed alone). Then, in a later commit, a fix aimed at the 3 r3 leaks (r3 is thereby tuned), and measure r4 once. Closure: zero blind leaks, 0 English refused. |
| – | unfiled observation (no row) | not rated | `reviseSentence` (desk/src/lib/desk/essay.ts:303) checks `observationOk` only, not `linkMissing` (desk/src/lib/rules/essay.ts:475), so a rewritten evidence sentence with no supports/backs link is not refused the way a first-pass reading is. Read in code; not executed. It waited for this recert to merge because it touches desk/src/lib/rules/essay.ts. | Execute it with the stubbed engine; if a rewrite with no supports/backs is ruled, file it as a row, then reuse `unanswered` for the single sentence. |

### (b) OPERATOR: his ruling, or a live paid L2 run

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` L arm (Essay) | major · 27 · M-L | A product decision: does the desk read Czech texts at all? Either the verdict rules take the text's language (CONNECTORS, LINK, CONTRAST, wordIn, noTurn) or the desk says it does not rule Czech. A builder cannot choose. | Operator picks: rule on Czech word lists, or refuse Czech and say so. The refusal figures never fix this row. |
| 2 | `L1-eliska-12-EM1-4` L2 (Essay, fixed on code) | major · L | The code clause is stamped fixed; whether the real model names the links often enough that the refusal is rare is a live model run. | Operator authorizes the live P2 x5 per lens (Structure, Evidence) through the claude CLI. |
| 3 | `L1-kristyna-17-EM1-3` (Essay) | minor · 12 · S | The note language for a Czech text is a choice (Czech, English, or the page's language); the prompt has no language line to build around until it is made. | Operator names the language; a builder then adds the one language line to the reading prompt (desk/src/lib/desk/essay.ts:113-136); whether the model obeys is L2. |
| 4 | `L1-eliska-12-EM2-1` (Essay) | minor · 12 · M | **Stays DECLINED under R6** (docs/BACKLOG.md): its return condition is a learner's or the owner's reading that the kept note misleads, or a lens that judges links. | None until the return condition is met. |
| 5 | `L1-radka-41-MB5-2` (Math) | minor · 12 · M | **BLOCKED** on the open MB5-2 privacy ask with the operator (the recap and week for several learners on one phone); not builder-alone. | Operator answers the privacy ask; a builder then lists each learner with work tonight, with a phone-panel test. |
| 6 | `L1-matyas-19-MB3-5` (Math) | polish · 1 · XS | An owner ruling: `question(spec).tex` is computed for every Calculus spec and read by no screen. | Owner rules (drop the field, or keep it for the typesetter); a builder applies it. |
| 7 | `L1-nela-12-MB2-2` (Math) | minor · 12 · S | An owner ruling: the add/sub questions say "simplest form", or the lesson drops "then simplify". | Operator rules; a builder applies it. |
| 8 | `L1-nela-12-MB2-1` (Math) | minor · 12 | A Czech maths teacher must sign off the tier-2 denominator range for 6. ročník. | Operator brings the teacher's read of three drawn sets. |
| 9 | `L1-matyas-19-MB1-1` (Math) | minor · 12 · L | Needs the vision path (his own weekly sheet marked from a page), then a read on a real sheet. | Operator decides whether the vision path is built before 2026-10-23. |

### Not open building: L1-vojtech-18-MB4-3 (Math)

**DELIVERED at e9c5ee8f (statements A26-A28).** Its standing, quoted from `uat/runs/2026-10-09-maths-l1/recert-10/` as written there: "narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63). They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units." It is owed only a Math recert, not new building, so it is in neither list above; the Math recert is the next run that touches desk/src/app/phone/page.tsx or the library files.

The Essay rows that matter most for the Education UAT goal (due 10-23) sit in (b), items 1 to 3; the one builder-alone step is the r4 set, which prepares a fix but cannot close the polish row by itself.
