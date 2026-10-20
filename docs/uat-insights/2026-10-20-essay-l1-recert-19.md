# L1 recertify, round 19, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 5 rows of `uat/runs/2026-10-09-essay-l1` that were open in recert-18, on 2bdbdee8, after the three commits that landed since 8a739027: 82905fd2 (the second short-Czech held-out set, pinned before the rule), 534ba3e0 (the second refusal round) and 2bdbdee8 (a first-pass reading with no supports / backs link is refused as unanswered). `git merge-base --is-ancestor` against main: all three true; the r2 file was committed before the rule and never edited since (whole-file sha256 `8ebcdc0c…128b`, pinned inner sha256 `1701dd06…0c56`, both re-checked). No model call (engine.text stubbed in the scratch script), no vision, no browser, no device, no push; desk/data and everything under desk/ and tools/ untouched. The round doc, with the full scratch output and the commands, is `uat/runs/2026-10-09-essay-l1/recertify-19.md`. Stamps went through `uat/driver/recertify.cjs` `writeBack()` (19 runs: 18 rows fixed, 76 recurs) and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-18) | 0 | 2 | 2 | 1 | **5** |
| Fixed (code clause only) | 0 | 1 | 0 | 0 | **1** |
| Recur (2 of them narrowed) | 0 | 1 | 2 | 1 | **4** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 1 | 2 | 1 | **4** |

OPEN.md Essay 5 -> 4; total open 237 -> 236; Math 6 -> 6 (`git diff 8a739027 2bdbdee8 -- desk/src/app/phone/page.tsx` is empty, so no Math round was run); Linga 226 -> 226, its section of OPEN.md is byte for byte unchanged (sha256 `2a273aab…6a15` before and after, equal).

## What moved

**L1-eliska-12-EM1-4 is stamped fixed, on the code clause only.** On the P2-shaped paragraph, for both Structure and Evidence, a first-pass reading whose evidence / checkable sentence carries no integer link (absent, null, the string "3", 2.5) is rejected with exactly the NOT_EVERY_SENTENCE line: `unanswered()` names sentence 2, the learner store is written 0 times and is byte-unchanged. An explicit 0 (backs nothing) is accepted and ruled; a real link gives the linked path (sentence 1 faulty). The refusal sits in `unanswered`/`judge`, not in `decideVerdicts`, which on its own still returns a ruling for the unlinked reading (sentence 1 not faulty); the proof ran the real `analyseEssay`. **Remainder: L2 is owed**, a live P2 x5 per lens through the claude CLI. Not run here.

**The short-Czech figures (measured this round, not taken from the builder):**

| Set | Czech refused | English refused | Label |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r2.json | 52 / 60 (86.7%) | 0 / 44 | **SEMI-BLIND**: the baseline misses were printed before the rule was written |
| tools/essay-heldout-czech-short.json | 53 / 53 | 0 / 42 | **TUNED**: its 8 leaks were tuned on; not evidence |

The 8 r2 leaks: "Mama uklizi pokoj.", "Deda sekal drevo.", "Nechapu ten priklad.", "Boli me noha.", "Nebavi me to.", "Mrzne a fouka.", "Pojedu k babicce.", "Neumim plavat.". Fifteen short English lines with names are all kept; no new row.

- **L1-kristyna-17-EM1-1 stays open** on its L arm (rule on Czech word lists, or say we do not rule Czech): the English-only lists (rules/essay.ts:14, :16, :433, :446, :498, :511) are unchanged. The refusal figures narrow the row and never fix it.
- **L1-helena-46-EM1-4 recurs, narrowed** (84.9% held out at the last round, 86.7% semi-blind now). It may close only on blind evidence; semi-blind 52/60 with 8 leaks is not that.
- **L1-kristyna-17-EM1-3** and **L1-eliska-12-EM2-1** recur unchanged (desk/src/lib/desk/essay.ts is byte-identical to 8a739027; EM2-1 stays declined under R6).

## What remains open, ranked

Score = severity weight (major 3, minor 2, polish 1) x the row's rank, as in recert-18. Essay rows are the 4 open ones plus the fixed-on-code rows that still owe L2; Math rows are the 6 in OPEN.md (read from it; their severity, rank and suggested acceptance from `uat/runs/2026-10-09-maths-l1/recert-10/findings.json`). Effort: XS a line, S one file and a test, M a few files or a rule change with fixtures, L new content or only L2 can confirm. Deadline 2026-10-23.

### (a) BUILDER-ALONE: a builder can do it without the operator or a paid model

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-radka-41-MB5-2` (Math) | minor · 12 · M | The acceptance is plain and code-checkable: the phone Recap lists every learner with work tonight. No ruling needed. | Make the phone Recap list each learner with work tonight, one block each (the Recap and week code path in desk/src/app/phone/), with a phone-panel test. |
| 2 | `L1-vojtech-18-MB4-3` (Math) | minor · 12 · S-M | Content, not policy: the only inequality statement is the linear A22. L2: none. | Add statements for a quadratic inequality, a logarithmic expression and a function's domain, each mapped to the units that teach them, with a kinds/statements test. |
| 3 | `L1-helena-46-EM1-4` (Essay) | polish · 2 · M | The 8 r2 leaks are a lexicon / shape question; no ruling is needed and no model. It is also the only builder-alone step that moves the refusal arm of the major `L1-kristyna-17-EM1-1`, so it is first among the Essay rows despite the low score. | Write and commit `tools/essay-heldout-czech-short-r3.json` FIRST (a fresh set of short plain-letter Czech and English lines, nothing shared with any earlier corpus, its sha256 pinned inside, an author who has not read the r2 leaks or the word lists), then change the rule, then measure it once; 0 English refused. Close the row only on that blind figure. |
| 4 | `L1-matyas-19-MB3-5` (Math) | polish · 1 · XS | `question(spec).tex` is computed and read by no screen; L2: none. | Drop the field and its code (or store tex for the typesetter), with the kinds test updated. |
| – | unfiled observation (no row) | not rated | `reviseSentence` (desk/src/lib/desk/essay.ts:303) checks `observationOk` only, not `linkMissing`, so a rewritten evidence sentence with no link is not refused the way a first-pass reading now is. Read in code; not executed this round. | Execute it with the stubbed engine; if a rewrite with no supports/backs is ruled, file it as a row, then reuse `linkMissing` in that check. |

### (b) OPERATOR: his ruling, or a live paid L2 run

| # | Row | Severity · score | Why it is in this list | The one next step |
| --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` L arm (Essay) | major · 27 · M-L | A product decision: does the desk read Czech texts at all? Either the verdict rules take the text's language (CONNECTORS, LINK, CONTRAST, wordIn, noTurn) or the desk says it does not rule Czech. A builder cannot choose. | Operator picks: rule on Czech word lists, or refuse Czech and say so. The refusal figures never fix this row. |
| 2 | `L1-eliska-12-EM1-4` L2 (Essay, fixed on code) | major · 27 before the stamp · L | The code clause is stamped fixed; whether the real model names the links often enough that the refusal is rare is a live model run (P2 x5 per lens through the claude CLI). It spends subscription time and is not a gate. | Operator authorizes the live P2 x5 per lens (Structure, Evidence) through the claude CLI; the run reports how many readings were refused and whether the retry succeeds. |
| 3 | `L1-barbora-43-EM1-2` and `L1-kristyna-17-EM1-2` L2 (Essay, fixed on code) | major · L | Fixed on the sender's code clause at the last round; the ES-READ grounding score (>= 5/8) and how far the model obeys the assignment row are live. | Operator authorizes the ES-READ re-measure with and without an open task. |
| 4 | `L1-kristyna-17-EM1-3` (Essay) | minor · 12 · S | The note language for a Czech text is a choice (Czech, English, or the page's language), and the prompt has no language line to build around until it is made. | Operator names the language; a builder then adds the one language line to the reading prompt (desk/src/lib/desk/essay.ts:113-136), whether the model obeys is L2. |
| 5 | `L1-eliska-12-EM2-1` (Essay) | minor · 12 · M | **Stays DECLINED under R6** (docs/BACKLOG.md): its return condition is a learner's or the owner's reading that the kept note misleads, or a lens that judges links. It is not builder-alone. | None until the return condition is met; the operator or a learner's reading re-opens it. |
| 6 | `L1-nela-12-MB2-2` (Math) | minor · 12 · S | An owner ruling: the add/sub questions say "simplest form", or the lesson drops "then simplify". | Operator rules; a builder applies it. |
| 7 | `L1-nela-12-MB2-1` (Math) | minor · 12 | A Czech maths teacher must sign off the tier-2 denominator range for 6. ročník (L2: 3 drawn sets). | Operator brings the teacher's read of three drawn sets. |
| 8 | `L1-matyas-19-MB1-1` (Math) | minor · 12 · L | Needs the vision host (env.md) that does not exist until built, then a page read on a real MA1 sheet. | Operator decides whether the vision path is built before 2026-10-23. |

The builder-alone list is short and low-score: the Essay rows that matter most for the Education UAT goal (due 10-23) sit in (b), items 1 and 2.
