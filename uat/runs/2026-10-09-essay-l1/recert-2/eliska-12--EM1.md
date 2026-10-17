# eliska-12 × EM1 · What does my paragraph do? (recert-2)

- Character: eliska-12 (12, Year 8, English-medium school in Prague)
- Journey: EM1 What does my paragraph do?
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** The PEEL Explain fix (6b003c59) is partial: it spares an Explain or Link that closes the paragraph, but the four-part PEEL (Explain, then Link) still has its Explain marked faulty. The guard, voice and link-dependence majors are untouched.

## Reachable surface (now)

- Reading: `judge` asks for observations with optional `supports` / `backs` (`desk/src/lib/desk/essay.ts:31,33,46`); `decideVerdicts` rules (`desk/src/lib/rules/essay.ts:354-450`), now with `closesAfterEvidence` (`:387-390`).
- Faulty note = a CHECKS line (`:305-316,444`); strong and neutral keep the model's note (`:443`).
- Forensic page and table (`desk/src/essay/EssayTV.tsx:410-438,476-491`); plan (`rules/essay.ts:645-690`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-eliska-12-EM1-1 PEEL Explain marked faulty (major) | **recurs** (narrowed, major) | `rules/essay.ts:387-390` the exemption needs the sentence to be the paragraph's last. Executed: 4-sentence PEEL, S3 Explain as opinion (Evidence) or claim (Structure) -> S3 faulty; 3-sentence PEEL with Explain last -> neutral | 6b003c59 (partial) |
| L1-eliska-12-EM1-2 pattern guard admits new-content sentence (major) | **recurs** | `rules/essay.ts:227,243` limits unchanged; cleanFix keeps both 'A survey found that [number] ...' and 'Research by [source] shows ...' | — |
| L1-eliska-12-EM1-3 notes carry no ghostwriting guard (major) | **recurs** | `rules/essay.ts:320-323,443-444`; cleanNote returns the 'Write: ...' note unchanged; `EssayTV.tsx:419-420` | — |
| L1-eliska-12-EM1-4 faulty notes not in young voice (major) | **recurs** | `rules/essay.ts:305-316` CHECKS, `:444`, `:687` 'That reads as ...' | — |
| L1-eliska-12-EM1-5 regex role shown, can contradict verdict (minor) | **recurs** | `rules/essay.ts:43`; `EssayTV.tsx:423,432,491`; executed roles claim/evidence/evidence/evidence | — |
| L1-eliska-12-EM1-6 stats.links / words shown nowhere (polish) | **recurs** | `rules/essay.ts:201-207`; `EssayTV.tsx:476` | — |
| L1-eliska-12-EM1-7 planted-claim fix depends on optional links (major) | **recurs** | `desk/src/lib/desk/essay.ts:31,33,46`; `rules/essay.ts:418,431-434` unchanged | — |

## New findings

None.

## Notes

- Executed `decideVerdicts`, `splitSentences`, `cleanFix`, `cleanNote` with `tools/ts-load.cjs` (scratch `w.cjs`, `w2.cjs`); model observations hand-written. Whether the model reads the Explain as opinion/claim is for L2.
- 6b003c59 test only pins the closing-sentence case; the four-part PEEL named in the character's complaint is not covered.
