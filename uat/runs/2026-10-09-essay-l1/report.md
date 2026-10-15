# Essay Master L1 (theoretical): report

Run `2026-10-09-essay-l1` · cert level **L1** · base commit `12592a71` · module **Essay Master** · cast 5 Characters, 10 pairs · no model call, no browser, no server. Rule claims were executed with node (`tools/ts-load.cjs`) on scratch `DESK_DATA_DIR`s outside the repo. Each walker's commands and outputs are in its per-pair file, under *Executions*.

The units are rubric.md's (*Essay Master metrics*, *Impact*). Severity is derived from impact rank (≥18 blocker, ≥8 major, ≥3 minor, else polish). A curtain or ghostwriting breach is a blocker whatever its rank. Two walker labels were raised by that derivation: `L1-kristyna-17-EM1-4` and `L1-kristyna-17-EM3-2` were labelled major but rank 18, so they are blockers. The grounding denominators are in SUMMARY.md.

## Scorecard

| Pair | Verdict | Blocker / major / minor / polish / strength | Time saved if it all worked | Grounding | Wiring |
|---|---|---|---|---|---|
| barbora-43 × EM1 | **L1-conditional** | 0 / 3 / 3 / 0 / 3 | ~13 min · low | ES-READ 3/8 | 17/21 |
| barbora-43 × EM4 | **L1-conditional** | 0 / 4 / 2 / 1 / 2 | ~13 min · low (trust condition on EM1's evening) | no AI surface (MEM not reached on an essay evening) | 8/8 |
| daniel-15 × EM2 | **L1-conditional** | 0 / 5 / 0 / 0 / 1 | ~12 min *lost* against not revising · medium | ES-REVISE 7/7 | 5/6 |
| daniel-15 × EM3 | **L1-fail** | 1 / 6 / 4 / 0 / 1 | ~5 min · low | ES-READ 3/8 | 20/23 piece, 5/8 shelf |
| eliska-12 × EM1 | **L1-fail** | 1 / 3 / 3 / 2 / 2 | ~10 min · low | ES-READ 3/8 | 17/19 |
| eliska-12 × EM2 | **L1-conditional** | 0 / 2 / 3 / 0 / 1 | ~8 min · low | ES-REVISE 7/7 | 7/7 |
| helena-46 × EM1 | **L1-conditional** | 0 / 3 / 2 / 2 / 1 | ~1 min · low | ES-READ 2/8 | 18/22 |
| helena-46 × EM5 | **L1-fail** | 4 / 5 / 1 / 1 / 1 | ~0, a loss of ~3–5 min per kept piece until the card is used elsewhere · low | ES-READ 2/8; twin n-a (code) | texts 5/8, twin 11/12, workroom 12/15 |
| kristyna-17 × EM1 | **L1-fail** | 4 / 2 / 3 / 0 / 1 | ~5 min *lost* · medium | ES-READ 3/8 | 16/18 |
| kristyna-17 × EM3 | **L1-fail** | 2 / 1 / 4 / 0 / 2 | ~12 min *lost* · medium | ES-READ 3/8 | 20/22 piece, 6/8 shelf |

**Per journey:**

| Journey | Pairs | Verdict | Why |
|---|---|---|---|
| EM1 · what my paragraph does | barbora, eliska, helena, kristyna | **L1-fail** (2 fail, 2 conditional) | Eliška: a planted claim placed before the evidence is missed by the code rule (`L1-eliska-12-EM1-1`). Kristýna: Czech text is split and judged on English rules with no word that the desk reads English. |
| EM2 · fix it myself | daniel, eliska | **L1-conditional** | The rewrite loop is sound (ES-REVISE 7/7, refusals before any call, other verdicts kept by code). The majors are false "holds" and a frame the rewrite refuses. |
| EM3 · the whole essay (never reached at L2) | daniel, kristyna | **L1-fail** | Each paragraph of a piece is ruled on its own observations, so intros and conclusions are false faults (`L1-daniel-15-EM3-1`). A failed paragraph is never said (`L1-kristyna-17-EM3-2`). |
| EM4 · was tonight worth it | barbora | **L1-conditional** | Curtain 0 and an exact paragraph recap. The phone Recap vanishes, a piece is recapped as "not tonight", and rewrites never reach the count. |
| EM5 · my writing kept and known (never reached at L2) | helena | **L1-fail** | Curtain breach by auto-title. The twin's directness is inverted against Twin Card SPEC 5.1. Delete-all leaves the read text on the desk. |

Totals over 92 rows: **12 blocker, 34 major, 25 minor, 6 polish, 15 strength.** 48 rows carry an `l2_priority`. 8 are `uncertain` because the claim depends on model output; the rest are `confirmed` by code or execution.

## Findings by impact (blockers and the top majors)

Evidence is in each row's `evidence[]` in findings.json. Each row's `suggested_acceptance` is the acceptance test.

| Rank | Id | Severity | Title | Key evidence |
|---|---|---|---|---|
| 27 | L1-helena-46-EM5-2 | blocker | The twin's directness is inverted: no hedges reads "indirect", heavy hedging "blunt" | `desk/src/lib/rules/style.ts:93` `6 - band(r.hedge…)` against `docs/standards/twin-card/1.0/SPEC.md:79` (1 = blunt) |
| 27 | L1-kristyna-17-EM1-1 | blocker | No language check and no word that Essay Master reads English | no language gate on `/api/analyse`; English-only lives in `docs/FAMILY-PHASE-1-PLAN.md:50` |
| 27 | L1-kristyna-17-EM1-2 | blocker | The splitter joins every sentence opening with Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž or „ | `desk/src/lib/rules/essay.ts:35` `(?=[A-Z"“])`. Re-run by the orchestrator: `splitSentences('Školy začínají brzy. Žáci jsou unavení. Émile Zola disagreed. So we wait.')` gives 2 sentences, the first holding three |
| 27 | L1-kristyna-17-EM1-3 | blocker | Code verdicts rest on English word lists | `desk/src/lib/rules/essay.ts:13-15` (CONNECTORS, EVIDENCE, LINK) |
| 27 | L1-kristyna-17-EM3-1 | blocker | Piece counts are built from the broken split: "2 of 6 sentences to fix" for 14 sentences | `desk/src/lib/rules/essay.ts:35`, piece summary in `desk/src/lib/desk/essay.ts` |
| 18 | L1-daniel-15-EM3-1 | blocker | Each paragraph of a piece is ruled on its own observations, so every intro thesis and conclusion link is faulty under Structure, and "Start with paragraph k" points there | `desk/src/lib/desk/essay.ts:83-84`; control arm: the same sentences as one paragraph read strong |
| 18 | L1-eliska-12-EM1-1 | blocker | A planted claim placed before the evidence is missed; Structure marks the wrong sentence | `desk/src/lib/rules/essay.ts:290-301`, repro E4a–c |
| 18 | L1-helena-46-EM5-1 | blocker (curtain) | An untitled kept piece is titled from its own first line, and the Workroom shows it | `desk/src/lib/session/texts.ts:76`; curtain count 1 (6–9 of her words) |
| 18 | L1-helena-46-EM5-3 | blocker | The twin's level words misread email: a greeting and a sign-off make "ceremonial" | `desk/src/lib/rules/style.ts` (sentencesOf splits on line breaks) |
| 18 | L1-helena-46-EM5-4 | blocker | "Delete everything I kept" leaves the read piece's full text in session.json and on the TV | store simulation R6 |
| 18 | L1-kristyna-17-EM1-4 | blocker | The plan refuses a sentence opening with Š, Č or Ž: "Start it with a capital" | `desk/src/lib/rules/essay.ts` (ASCII capital test) |
| 18 | L1-kristyna-17-EM3-2 | blocker | A paragraph that fails to come back is never said: it stays dimmed and reads "Neutral · Nothing flagged" | `piece.failed` wired only into arithmetic |
| 12 | L1-barbora-43-EM4-1 | major | The phone's Recap returns to "Arrives when the session ends." once the TV leaves the recap, on any evening with no maths hint | `desk/src/app/phone/page.tsx:616` |
| 12 | L1-barbora-43-EM4-2 | major | A whole piece is recapped as "not tonight" or "0 of 0 … all of it right" | `desk/src/tv/recapRows.ts:35` rejects the ", N paragraphs" suffix written at `desk/src/lib/desk/essay.ts:97` |
| 12 | L1-barbora-43-EM4-3 | major | Rewrites that hold never reach the recap | matches EM-B1 |
| 12 | L1-daniel-15-EM2-1 | major | In a piece, a rewrite is ruled on cross-paragraph context the first reading did not use | `desk/src/lib/desk/essay.ts:185` against `:83` |
| 12 | L1-daniel-15-EM2-3 | major | The LINK regex has no word boundary: "Some", "Social", "Sometimes" and "Soon" read as links | `desk/src/lib/rules/essay.ts:15` |
| 12 | L1-helena-46-EM1-1 | major | Adult-mode readings are written for "a 15-year-old" student | `desk/src/lib/rules/voice.ts:70` (TEEN.essay), `desk/src/lib/desk/essay.ts:67` |
| 12 | L1-helena-46-EM5-9 | major | "Never keeps what other people wrote to you" is false: quoted client text reaches the card's exemplars | repro R9 |
| 12 | L1-eliska-12-EM2-2 | major | The playbook fallback teaches a three-sentence frame that the one-sentence rewrite refuses | repro E13 + E9 |

The other majors (rank 9–12) are in findings.json: ghostwriting guards cover patterns only (four walkers), the x-ray's model paragraph, the paste box and the shelf, the title line, and the format and the twin channel.

## Module metrics (rubric.md units)

| Metric | L1 reading | L2 owes |
|---|---|---|
| verdict agreement | Not measurable at L1 (no model output). Code-only proxies over faithfully simulated observations: Eliška 11/16 = 0.69 overall, 1/4 on faulty. Kristýna (Czech) 1/8 overall, 1/6 on faulty. Daniel predicts disagreement on intro and conclusion sentences in a piece | live readings per Character text |
| ghostwriting | Code guards 2 of 4 shown text types (fix.move, fix.pattern). Notes and the summary have prompt-only protection (4 walkers). A slotted new-content pattern passes (`L1-eliska-12-EM1-3`) | a reader counts (b) on young and teen profiles |
| note-verdict consistency | Structural cause confirmed twice: a rewrite caption is the model's note (`L1-daniel-15-EM2-2`); a Language length verdict keeps a note never told of the length (`L1-helena-46-EM1-3`) | the count over live notes |
| fix coverage | L2 | from `verdicts[].fix` |
| time to first verdict | L2. Structure: a piece is one call per paragraph in sequence (Daniel est. ~25 s to the title paragraph, ~125 s to the last of 5; Kristýna ~2.5–3 min for 6) | harness W3 and a piece run |
| rewrite turnaround / uplift / others kept | others kept: **true by construction** (`desk/src/lib/desk/essay.ts:189`). Uplift: false "holds" exist (`L1-eliska-12-EM2-1`, `L1-daniel-15-EM2-1`) | W5 numbers and a reader |
| recap specificity | Exact on 4 of 6 constructed evenings. Mismatches: a piece; any evening with a rewrite that holds | W6 against W4/W5 |
| curtain | **1** on the Workroom (auto-title, `L1-helena-46-EM5-1`). 0 on the TV recap, the phone Recap and the Sunday page, by construction (`L1-barbora-43-EM4-8`) | page text against the kept pieces |
| entrance, reliability | L2. A failed paragraph is isolated in code but never reported (`L1-kristyna-17-EM3-2`) | — |

## What passed (strengths to protect)

- **Verdicts are code's, anchored to real sentences.** A flagged word must be in its sentence, and a pattern that copies 4+ of the learner's words is refused, in Czech too (`L1-barbora-43-EM1-7`, `L1-helena-46-EM1-8`, `L1-kristyna-17-EM1-10`, `L1-eliska-12-EM1-11`).
- **Refusals come before any wait, in plain words** (too long, wrong file, blank, the same again, two sentences) (`L1-barbora-43-EM1-9`, `L1-eliska-12-EM1-10`).
- **The rewrite loop** prefills her own sentence, re-judges one sentence and keeps every other verdict by code. Its move inks only on a hold, and ES-REVISE is fully grounded at 7/7 (`L1-daniel-15-EM2-6`, `L1-eliska-12-EM2-6`).
- **Whole-piece machinery**: one call per paragraph with failure isolation, limits that refuse rather than truncate, a server-enforced one-time notice naming the engine, "Read without keeping", and a confirmed delete-all (`L1-daniel-15-EM3-12`, `L1-kristyna-17-EM3-8`, `-9`).
- **Recap and Sunday page curtain 0 by construction**: counts and lens names only (`L1-barbora-43-EM4-8`, `-9`).
- **The shelf is the learner's alone**, the card is gated to Adult and a born channel, and delete-all removes the folder, the twin state and the notice (`L1-helena-46-EM5-12`).

## Appendix: uncertain rows (need L2)

`L1-barbora-43-EM1-1`, `L1-eliska-12-EM1-2`, `L1-eliska-12-EM1-3`, `L1-eliska-12-EM1-4`, `L1-eliska-12-EM1-6`, `L1-eliska-12-EM2-4`, `L1-kristyna-17-EM1-6`, `L1-kristyna-17-EM3-5`. Each depends on what the model writes (note, summary, pattern, language) or on live rendering. Each carries its `l2_priority`. None is refuted.
