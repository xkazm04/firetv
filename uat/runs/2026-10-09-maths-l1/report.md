# Math Buddy L1 (theoretical): report

Run `2026-10-09-maths-l1` · cert level **L1** · base commit `12592a71` · module **Math Buddy** · 5 Characters, 13 pairs · no model call, no vision call (Ollama never run), no browser, no server. Rule claims were executed with node (`tools/ts-load.cjs`) on scratch `DESK_DATA_DIR`s outside the repo. The commands and their output are in each pair's *Executions* section.

Units are rubric.md's (*Math Buddy metrics*, *Impact*). Severity is derived from impact rank. A false tick or an answer leak is a blocker whatever its rank. One walker label changed in that derivation: `L1-radka-41-MB5-8` was polish in its pair file but its impact gives rank 6, so it is minor. Ids are the walkers' keys (`L1-<character>-<journey>-<n>`) and match the pair files. `radka-41 × MB5` has no `-3`. Grounding denominators are in SUMMARY.md.

**Vision caveat.** No vision engine has run. The MB1 page read, the marking of a snapped sheet and the handwriting read are uncertain at L1. Each claim that rests on them carries an `l2_priority` with the precondition *vision host (env.md, Math Buddy)* (list in SUMMARY.md).

## Scorecard

| Pair | Verdict | Blocker / major / minor / polish / strength | Time saved if it all worked | Grounding | Wiring |
|---|---|---|---|---|---|
| matyas-19 × MB1 | **L1-conditional** | 0 / 3 / 1 / 0 / 2 | ~5 min per sheet · low | MB-READ 2/5 · MB-HINT 5/8 · MB-PICK n-a (not called on Calculus 1) | 12/16 |
| matyas-19 × MB3 | **L1-fail** | 2 / 5 / 4 / 0 / 2 | ~15 min per set · medium | MB-SET 4/7 · MB-MARK 3/6 · MB-EXPLAIN 3/8 · MB-HINT 5/8 | 13/17 |
| nela-12 × MB1 | **L1-fail** | 1 / 1 / 3 / 0 / 2 | ~15 min · low | MB-READ 2/5 · MB-HINT 4/8 · MB-PICK 2/3 | 17/17 |
| nela-12 × MB2 | **L1-conditional** | 0 / 2 / 5 / 0 / 2 | ~10 min · medium | MB-SET n-a (code) · MB-WORKED 3/5 · MB-MARK 2/6 · MB-EXPLAIN 3/8 | 16/17 |
| nela-12 × MB5 | **L1-fail** | 2 / 1 / 2 / 0 / 1 | ~30 min a week · low | as MB1 and MB2; MEM listed | 13/13 |
| owen-17 × MB2 | **L1-fail** | 1 / 4 / 4 / 0 / 1 | ~5 min per set · low | MB-SET n-a (code) / 2/7 linear · MB-WORKED 3/5 · MB-EXPLAIN 3/8 · MB-MARK 2/6 school, 3/6 linear | 8/8 |
| owen-17 × MB4 | **L1-fail** | 2 / 1 / 4 / 0 / 2 | ~35 min · low | no AI surface (`paperRead.ts` has no caller) | 14/14 + 3/3 |
| radka-41 × MB1 | **L1-fail** | 2 / 2 / 0 / 0 / 1 | ~20 min per homework evening · low | MB-READ 2/5 · MB-HINT 4/8 · MB-PICK 2/3 | 14/16 |
| radka-41 × MB4 | **L1-fail** | 2 / 2 / 5 / 0 / 1 | ~45 min of a tutor lesson per paper · low | recovery is code; MB-SET 2/7 for the equations units it leads to | 17/17 |
| radka-41 × MB5 | **L1-fail** | 2 / 0 / 5 / 0 / 1 | ~60 min a week + one tutor hour · low | MB-SET n-a (code) · MB-HINT 4/8 | recap 7/7, week 11/13 |
| vojtech-18 × MB1 | **L1-fail** | 1 / 3 / 1 / 0 / 1 | ~0–5 min · low | MB-READ 2/5 · MB-HINT 4/8 · MB-PICK 2/3 | 17/17 |
| vojtech-18 × MB2 | **L1-conditional** | 0 / 7 / 3 / 0 / 1 | ~0–5 min · low | MB-SET n-a (code) / 2/7 linear · MB-WORKED 3/5 · MB-MARK 2/6 · MB-EXPLAIN 3/8 | 18/18 |
| vojtech-18 × MB4 | **L1-fail** | 2 / 3 / 1 / 0 / 1 | ~5 min · low (a loss if he follows the caption) | no AI surface | 13/14 |

Two MB-MARK scores were normalised to the shared rule, under which a source counts only when it reaches the prompt. Matyáš reported 4/6 and Vojtěch 5/6 "counting the code verdict"; their prompt-only scores, 3/6 and 2/6, are used. Sources that reach the code judge are listed in SUMMARY.md as named additions.

**Per journey:**

| Journey | Pairs | Verdict | Why |
|---|---|---|---|
| MB1 · tonight's sheet | matyas, nela, radka, vojtech | **L1-fail** (3 fail, 1 conditional) | The code leak guard reads no Czech-printed item and no maturita shape (4 walkers). The recap praises an evening where nothing was marked |
| MB2 · practise and get marked | nela, owen, vojtech | **L1-fail** (1 fail, 2 conditional) | False tick: a typed mixed number on a linear item is read as a product (`L1-owen-17-MB2-1`). Photo marking waits on the vision host |
| MB3 · my Calculus course | matyas | **L1-fail** | False ticks: decimal estimates of exact limits and integrals; `ln x + C` |
| MB4 · where the marks went | owen, radka, vojtech | **L1-fail** | "No marks were lost" beside "28 marks lost". The full loss fans out to every linked topic. Off-desk statements are hidden as "and 10 more" |
| MB5 · is it worth keeping | nela, radka | **L1-fail** | The recap's log never resets and says "all of it right" with nothing marked. The week page cannot see homework evenings |

Totals over 107 rows: **17 blocker, 34 major, 38 minor, 0 polish, 18 strength.** 55 rows carry an `l2_priority`. 13 of them are preconditioned on the vision host, and a 14th, `L1-owen-17-MB2-1`, needs it for its photo arm only (its typed arm needs the text engine). 17 are `uncertain`.

## Findings by impact (blockers and the top majors)

| Rank | Id | Severity | Title | Key evidence |
|---|---|---|---|---|
| 27 | L1-nela-12-MB1-1 | blocker (uncertain) | Czech sheet notation is not read: the hint loses its code leak check | task reader null on `2/3 · 3/4`, `3/4 : 1/2`, `2,5 · 0,4`, "Vypočítej:" |
| 27 | L1-vojtech-18-MB1-1 | blocker | The code leak guard reads none of his tasks: 0 of 16 answer-giving lines caught | `desk/src/lib/rules/kinds.ts:41-46`, `desk/src/lib/rules/maths.ts:362-376` |
| 27 | L1-nela-12-MB5-1 | blocker | "Good evening's work - all of it right." on an evening where nothing was marked | `desk/src/tv/recapRows.ts:84-88` (`toLook` counts only marked sets and readings) |
| 27 | L1-radka-41-MB1-2 | blocker | The same, on a homework night with hints and nothing marked | same; found independently |
| 27 | L1-radka-41-MB5-1 | blocker | The recap's hints, second-hint list and minutes are never reset | `desk/src/lib/session/store.ts:620` (`session.end` stops the timer only) |
| 18 | L1-matyas-19-MB3-1 | blocker (false tick) | A decimal within 0.5% of an exact limit or definite integral is ticked right | `desk/src/lib/rules/calc.ts:53-61` (`rounded: 5e-3`). Documented as deliberate at `:50`; see SUMMARY.md *Questions* |
| 18 | L1-matyas-19-MB3-2 | blocker (false tick) | `ln x + C` is ticked right for ∫1/x dx | `desk/src/lib/rules/calc-expr.ts:716` (negative samples skipped) |
| 18 | L1-owen-17-MB2-1 | blocker (false tick) | A typed mixed number on a linear item is read as a product: a wrong "1 3/4" for x = 3/4 is ticked | `desk/src/lib/desk/verify.ts:66`, `:161` via `desk/src/lib/rules/kinds.ts:123-124` |
| 18 | L1-nela-12-MB5-2 | blocker | The evening log never resets (hint counts, the second-hint list, the memory's hint count) | `desk/src/lib/session/store.ts:620` |
| 18 | L1-owen-17-MB4-1 | blocker | One broad statement spreads a loss over 3 topics: 44 "marks lost" shown for 24 | `desk/src/lib/rules/recovery.ts:189-201` |
| 18 | L1-owen-17-MB4-2 | blocker | 10 of 13 off-desk statements (20 marks) appear only as "and 10 more" | `desk/src/maths/MathsTV.tsx:686`, `:729-732` |
| 18 | L1-radka-41-MB1-1 | blocker | The hint's leak backstop is blind on Czech-printed items and notation | as MB1-1 above |
| 18 | L1-radka-41-MB4-1 | blocker | "No marks were lost" when the lost marks sit on questions with no statement picked | caption check and list fallback, `desk/src/tv/paperRows.ts:54`, `desk/src/maths/MathsTV.tsx:716` |
| 18 | L1-radka-41-MB4-2 | blocker | Full-loss fan-out plus the prerequisite pull open a 9th-grader's mock on "One-step equations · 2 lost" | `desk/src/lib/rules/recovery.ts` |
| 18 | L1-radka-41-MB5-2 | blocker | The Sunday page ignores homework evenings and papers: "Nothing this week." | week digest counts marked sets only |
| 18 | L1-vojtech-18-MB4-1 | blocker | "No marks were lost on this paper" when every lost mark has no statement | same as L1-radka-41-MB4-1, found independently |
| 18 | L1-vojtech-18-MB4-2 | blocker | Partial statement links pull maturita questions onto 5.–8. ročník units, and the caption leads with them | repro on his 25-question paper |
| 12 | L1-matyas-19-MB1-1 | major | On a Czech-worded Calculus sheet the Calculus leak check never runs | — |
| 12 | L1-matyas-19-MB1-2 | major | A step that completes the answer passes the leak guard ("Multiply cos(x^2) by 2x") | — |
| 12 | L1-matyas-19-MB3-3 | major | Implicit differentiation cannot be practised, though the topic name promises it | — |
| 12 | L1-nela-12-MB2-1 / L1-matyas-19-MB3-5 / L1-vojtech-18-MB2-2 | major | An unsure item says "I got something different for number N"; the code's own reason (`why`) is computed and unwired | 4 walkers converge (with L1-owen-17-MB2-6) |
| 12 | L1-owen-17-MB2-2 | major (false ring) | A correct mixed-number root ("1 1/5" for 6/5) is ringed wrong | same cause as MB2-1 |
| 12 | L1-nela-12-MB2-2 / L1-vojtech-18-MB2-6 | major | Explaining is en-US speech only; typing appears only with no microphone | — |

Every other row is in findings.json with its evidence and `suggested_acceptance`.

## Module metrics (rubric.md units)

| Metric | L1 reading | L2 owes |
|---|---|---|
| **false ticks** | **Typed:** Calculus 15 (13 decimal estimates + `ln x + C` twice, Matyáš); linear topics 4 + 1 junk (mixed numbers, Owen); school units **0** (Owen 0 of 106,619 wrong candidates; Nela 0 of 5,039; Vojtěch 0 of 64; Radka 0 of 18). **Photo:** uncertain | photo marking (vision host) |
| **false rings** | Calculus 0 of 84 decided. Linear 2 (mixed-number roots). School units 0 (Owen 0 of 52,030 equivalent forms) | photo |
| **marking agreement** | Calculus 81/84 = 0.964 (realistic probe). Linear battery 22/28 = 0.79. School units 1.00 (Nela, Owen 25/25, Vojtěch 52/52, Radka 11/11) | photo |
| **unsure rate** | 0.03–0.33 by sheet. Calculus 0.12; Owen 0.17 (UK-habit forms); Vojtěch 0.19 (0.35 on Pythagoras with `c = 34 mm`) | — |
| **answer leak** | Code lines **0**. The code backstop fails open: 0 of 16 leaking lines refused on Vojtěch's tasks; Czech notation unread (Nela, Radka, Matyáš); a completing step passes. Model lines are L2 | hint and explain replies, on Czech sheets (vision host for MB1) |
| **hint helpfulness** | L2 | — |
| **slip precision** | Code-named slips exact: Nela 13/13, Vojtěch 8/8, Calculus sign slips. Model picks are L2 | — |
| **set fit** | Vojtěch step-ups 0–2 of 6 at his level (6/6 on topic). Owen ~3/6. Nela 4/6 (walker reading) | judge |
| **recovery fidelity** | Owen 1/1 pass. Radka 1/2 (fails with no statement picked). Vojtěch 8/9. Totals are exact; rows over-count (fan-out) | — |
| **presses to first hint** | **2** (all four MB1 walkers) | — |
| **line length** | Fixed lines: Matyáš 30/30 = 1.0, Radka 1.0, Vojtěch 0.84, Nela 0.79, Owen 0.54 (slip lines 26–37 words). Model lines are L2 | model lines |
| page read rate, handwriting read, time to marked sheet, time to read page | L2 (vision host); typed marking is synchronous code | all |

## What passed (strengths to protect)

- **Typed marking of the school units is exact under the cz system.** Decimal comma and point, unit-suffixed money, unsimplified and equivalent fractions: 0 false ticks and 0 false rings over tens of thousands of generated answers (`L1-owen-17-MB2-10`, `L1-nela-12-MB2-8`, `L1-vojtech-18-MB2-1`, `L1-radka-41-MB5-8`).
- **Calculus equivalent forms:** 39/39 derivative spellings judged right. Sets are specs printed and checked by code with no stored answer (`L1-matyas-19-MB3-12`, `-13`).
- **"Not sure" exists and is visible.** The second go is code-judged once and never shows the answer (`L1-nela-12-MB2-9`).
- **Paper totals are exact; validation never guesses.** Off-desk marks are counted apart, and no board or grade is claimed (`L1-owen-17-MB4-8`, `-9`, `L1-radka-41-MB4-10`, `L1-vojtech-18-MB4-7`).
- **Two presses from Tonight to a first hint.** "No lesson" is said plainly, and the Calculus 1 gating is clean (`L1-matyas-19-MB1-5`, `-6`, `L1-nela-12-MB1-6`, `L1-radka-41-MB1-5`, `L1-vojtech-18-MB1-6`).
- **`leaksSchool` on a task it can read** catches the answer in digits, English words, a decimal comma and a percent (`L1-nela-12-MB1-7`).

## Appendix: uncertain rows (need L2)

17 rows. Those waiting on the vision host are listed in SUMMARY.md. The rest wait on model output: hint and explain replies, set fit, and a chain-rule set's composition (`L1-matyas-19-MB3-9`). None is refuted.
