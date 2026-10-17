# eliska-12 × EM1 · What does my paragraph do? (recert-3)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 2 fixed, 5 recur, 1 new; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-eliska-12-EM1-1 Evidence lens: PEEL's Explain sentence is marked faulty when the model calls it… (major) | **fixed** | 2d3526b3: closesAfterEvidence (rules/essay.ts:420-425) spares any Explain or Link after the paragraph's LAST marked evidence, not only the closing sentence, and LINK gained "that is why" (:15). Executed decideVerdicts (scratch e2.cjs) on a four-part PEEL ("Cars should be banned near schools." / "A 2021 study found that 40% of pupils ..." / "This means fewer children breathe dirty air ..." / "That is why the council should act now."): Evidence lens with the model naming the link (backs: 1) -> neutral, strong, neutral, neutral; Structure lens (Explain as claim, Link as link) -> strong, strong, neutral, strong; an opinion before any evidence stays faulty. A residual (an Explain with no connector or linker opener) is filed as a new minor row. | 2d3526b3 |
| L1-eliska-12-EM1-2 The pattern guard admits a new-content sentence with one slot (looser than the… (major) | recurs → L1-eliska-12-EM1-1 | Recurs, unchanged. f3b8e4b1 guards notes, not patterns: cleanFix (rules/essay.ts:231-246) differs only by the copied-run helper. Executed (scratch e1.cjs, e3.cjs): "A survey found that [number] of children walk." and "Research by [source] shows that [claim]." are both kept as the pattern for "Walking also makes children happier than going by car." (literalWords 10 allows a clause with a subject and a verb). If L2 shows one on screen it is a ghostwriting blocker. | none |
| L1-eliska-12-EM1-3 Notes on strong and neutral sentences carry no code guard against ghostwriting;… (major) | **fixed** | f3b8e4b1, as for L1-barbora-43-EM1-1: rules/essay.ts:272-283 (suppliesSentence, guardNote) and :484 run every strong and neutral note through one guard, and the EssayTV captions (:419-420) draw the guarded note. Executed (scratch e1.cjs): the "Write: ..." copy of her sentence and a new-content declarative both fall back; a label-only note, an opinion note and a quoted frame pass. L1 part only: the L2 count of how often the real model hands over a sentence on a young-voice reading stays owed. | f3b8e4b1 |
| L1-eliska-12-EM1-4 Every faulty note is a code line not in the young voice: 'asserts', 'checkable'… (major) | recurs → L1-eliska-12-EM1-2 | f3b8e4b1 moved the note line (now :484) but the faulty note is still the CHECKS line in the adult wording ('asserts', 'checkable'); no young-voice variant — desk/src/lib/rules/essay.ts:371-382 — CHECKS (the faulty note's only text) / desk/src/lib/rules/essay.ts:524 — note = guardNote(check ...): on a fault the note is the check, now through the guard | none |
| L1-eliska-12-EM1-5 The forensic crumb, 'Its job' and the table show the regex first-pass role, whi… (minor) | recurs → L1-eliska-12-EM1-3 | desk/src/lib/rules/essay.ts:43 — role from LINK/EVIDENCE regex / desk/src/essay/EssayTV.tsx:423,432,491 — role drawn / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-eliska-12-EM1-6 stats.links (PEEL's L) and stats.words are computed for every reading and shown… (polish) | recurs → L1-eliska-12-EM1-4 | desk/src/lib/rules/essay.ts:201-207 — computed / desk/src/essay/EssayTV.tsx:476 — figs omit links / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-eliska-12-EM1-7 The planted-claim fix depends on the model naming links (supports / backs): whe… (major) | recurs → L1-eliska-12-EM1-5 | b6f0acb7 added a rewrite-only branch at :455-456; a whole-paragraph read with links absent still marks nothing under Evidence and the true topic sentence under Structure — desk/src/lib/desk/essay.ts:31,33,46 — optional supports/backs / desk/src/lib/rules/essay.ts:491-501 — evidence: no accepted link -> neutral when the marks were judged (:494-496), else the blind / unbacked rule | none |

## New findings

- **L1-eliska-12-EM1-6** (minor 6): PEEL's Explain is still marked faulty when it has no connector or linker opener: closesAfterEvidence needs "because", "this means", "so" ... in the sentence

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
