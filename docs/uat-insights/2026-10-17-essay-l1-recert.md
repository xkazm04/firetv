# L1 recertify of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of all 10 pairs of `uat/runs/2026-10-09-essay-l1` on main 782afdfb. There was no model call, no vision call and no browser, and nothing in `desk/` changed. There was one walker per Character (barbora-43, daniel-15, eliska-12, helena-46, kristyna-17), and every open row was answered `fixed` or `recurs` with current file:line evidence. The full tables are in `uat/runs/2026-10-09-essay-l1/recertify.md`, the per-pair walks in `recert-1/`, and the stamps in the run's `findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified. The 2026-10-16 L2 pass in `2026-10-14-l1/essay-family` drove the harness learner Sam, not these Characters.

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 12 | 34 | 25 | 6 | 77 |
| Fixed (severity as raised) | 7 | 7 | 6 | 2 | **22** |
| Recur (severity now) | 3 | 28 | 20 | 4 | **55** |
| New | 0 | 6 | 3 | 2 | **11** |
| Open now | 3 | 34 | 23 | 6 | **66** |

- Each fixed row names its commit, 22 of 22, and every cited commit is an ancestor of 782afdfb.
- Five recurring rows changed severity on re-derived impact. The reasons are in recertify.md, *Still open*.
  - L1-daniel-15-EM3-1, blocker to major: a backed thesis is no longer faulted under Structure when the model names the supports chain.
  - L1-kristyna-17-EM1-3, blocker to major: the language refusal (803c6075) stops most Czech before the English word lists.
  - L1-kristyna-17-EM1-6, major to minor, for the same reason.
  - L1-helena-46-EM1-1, major to minor: faulty notes and the summary are code's lines since 4158321b.
  - L1-eliska-12-EM1-7, minor to major: the unvoiced CHECKS wording now shows on every fault.
- L1-helena-46-EM5-1 stays blocker at rank 6, because the curtain is a boundary.
- Three walkers raised ghostwriting-guard rows to blocker (L1-barbora-43-EM1-1, -EM1-2, L1-daniel-15-EM2-4). The orchestrator kept them at major 9, as the original walk and the Math recert filed a blind backstop: the boundary is a ghostwriting breach that was seen, and none was seen in a code-only walk.
- The 11 new rows are 9 rows from the 2026-10-14 walk that still hold at 782afdfb, plus 2 seams found in this walk:
  - nothing tells Kristýna before her first send that the desk reads English;
  - a rewrite of a sentence first ruled neutral can be ruled faulty.
- Several rows share a gap. The unwired reading stats (stats.words, stats.links, provider) are filed four times, once per Character. The language check's leaks are filed under kristyna-17 and helena-46.
- What was fixed:
  - the Czech splitter and the missing language refusal (kristyna-17 EM1-1, -2, -4, EM3-1, barbora-43 EM1-5, eliska-12 EM1-9);
  - the claim-before-evidence blocker (eliska-12 EM1-1);
  - the phone Recap vanishing and the recap's wrong counts (barbora-43 EM4-1, -2, -3, -5, -7);
  - the rewrite ruled on different context from the first reading (daniel-15 EM2-1);
  - the failed paragraph drawn as pending (kristyna-17 EM3-2, daniel-15 EM3-8);
  - delete-all leaving the read text on the desk (helena-46 EM5-4);
  - praise-led notes under a faulty verdict (eliska-12 EM1-6, daniel-15 EM2-2, helena-46 EM1-3).

## Pair verdicts

| Pair | 2026-10-09 | Now |
|---|---|---|
| barbora-43 EM1 | L1-conditional | L1-conditional |
| barbora-43 EM4 | L1-conditional | L1-conditional |
| daniel-15 EM2 | L1-conditional | L1-conditional |
| daniel-15 EM3 | L1-fail | L1-conditional |
| eliska-12 EM1 | L1-fail | L1-conditional |
| eliska-12 EM2 | L1-conditional | L1-conditional |
| helena-46 EM1 | L1-conditional | L1-conditional |
| helena-46 EM5 | L1-fail | L1-fail |
| kristyna-17 EM1 | L1-fail | L1-conditional |
| kristyna-17 EM3 | L1-fail | L1-conditional |

The pairs were 5 conditional and 5 fail at 2026-10-09. Now 9 are conditional and 1 fails: helena-46 EM5, the twin, which holds all three remaining blockers. By journey, EM1 to EM4 are L1-conditional and EM5 is L1-fail.

## Top 5 still-open rows, ranked

1. **The twin's directness is inverted** (L1-helena-46-EM5-2, now 2026-10-09-essay-l1/recert-1/L1-helena-46-EM5-1, blocker 27). No hedges reads "indirect" and heavy hedging reads "blunt", against Twin Card SPEC 5.1 (`desk/src/lib/rules/style.ts:95` `6 - band(r.hedge, …)`, shown through `desk/src/lib/twin/card.ts:75`). *Fix direction:* make directness `band(hedge rate)` so more hedging reads more indirect, and pin a blunt set at 1-2 and a hedged set at 4-5 in `tools/style-rules-test.cjs`.
2. **The twin's level words misread email** (L1-helena-46-EM5-3, now 2026-10-09-essay-l1/recert-1/L1-helena-46-EM5-2, blocker 18). A greeting and a sign-off alone push formality to "ceremonial" (`style.ts:89`). Line breaks split sign-off and name lines into sentences, so length and detail read "headline" or "brief" (`style.ts:50-52`, `:94`, `:97`). *Fix direction:* measure greeting, sign-off and signature lines apart from body sentences before the medians. A rules test should read a casual three-email set as casual and a long formal set as formal with full length.
3. **The curtain: an untitled phone keep is titled from its own first line** (L1-helena-46-EM5-1, now 2026-10-09-essay-l1/recert-1/L1-helena-46-EM5-8, blocker, boundary). Every phone keep is format "essay" (`desk/src/lib/session/texts.ts:114`, `desk/src/app/api/analyse/route.ts:115`). An untitled essay takes its first unpunctuated line as its title (`texts.ts:92`), and the TV Workroom prints it (`desk/src/essay/Workroom.tsx:33`). The 0a53e75e fix covered email and message only. *Fix direction:* title an untitled piece "Untitled essay" plus an ordinal, or use only a typed title or `# heading`. Send the phone keep's format. A rules test should assert that no run of 5+ of the text's words reaches `workroomOf().pieces[].title`.
4. **An essay's thesis and conclusion are false faults in a piece** (L1-daniel-15-EM3-1, now 2026-10-09-essay-l1/recert-1/L1-daniel-15-EM3-1, major 12). Under Evidence a paragraph with no checkable sentence faults every opinion in it (`desk/src/lib/rules/essay.ts:398-399`). Under Structure the first unsupported claim is faulty unless the model names its chain (`essay.ts:410-416`), so "Start with" points at the intro. *Fix direction:* when ruling a thesis claim or a conclusion link, let the piece rule read the body paragraphs' checkable sentences as support. Pin a 4-paragraph essay with body evidence that yields no faulty thesis and a "Start with" in a body paragraph.
5. **PEEL's Explain sentence is a false fault** (L1-eliska-12-EM1-2, now 2026-10-09-essay-l1/recert-1/L1-eliska-12-EM1-1, major 12). SUPPORTS has no "explains" label (`essay.ts:263`), so an Explain sentence the model calls opinion is faulty under Evidence (`essay.ts:400-405`) and one it calls a claim is faulty under Structure (`essay.ts:410-416`). *Fix direction:* exempt a sentence after the paragraph's last checkable sentence that explains or links back, or add an `explains` support label, and hold it with a rules test on a clean PEEL paragraph.

Ids are the 2026-10-09 rows; each is restated under `2026-10-09-essay-l1/recert-1/` (see recertify.md, *Still open*).

The next ones are:
- the three-sentence playbook frame that the one-sentence rewrite refuses (L1-eliska-12-EM2-2, major 12, `desk/src/lib/library/lessons.data.ts:51`, `essay.ts:587`);
- rewrites that never reach the phone's text and are wiped by a re-read (L1-daniel-15-EM2-5, major 12);
- the paragraph-only evening with no delete (L1-barbora-43-EM4-4, major 12);
- the unguarded strong and neutral notes, the ghostwriting backstop (L1-barbora-43-EM1-1, L1-eliska-12-EM1-4, L1-daniel-15-EM2-4, major 9, `essay.ts:425-426`). These become blockers the moment an L2 count sees a note supply a sentence.

## Method notes

- `2026-10-14-l1/essay-family` and `essay-adult` had already re-walked these rows on 4af25199, but the ledger never read them. That run has no top-level `findings.json` and no `recert-<k>` folder, so OPEN.md kept listing all 77 rows. Here its answers were leads only, and every row was re-checked at 782afdfb.
- Model-dependent rows were judged on the prompt and the code path, with hand-written model observations in scratch repros. Two counts are owed at L2: how often the model names the supports chain (which decides L1-daniel-15-EM3-1 and the new 2026-10-09-essay-l1/recert-1/L1-eliska-12-EM1-7), and whether a strong or neutral note ever supplies a sentence.
- OPEN.md was regenerated with `node uat/driver/linga-text.cjs --status`. It went from 453 open (Linga 344, Essay 77, Math 32) to 442 (Linga 344, Essay 66, Math 32). The Linga and Math sections are byte-identical before and after, and the 66 Essay rows equal the open rows of `recert-1/findings.json`.
