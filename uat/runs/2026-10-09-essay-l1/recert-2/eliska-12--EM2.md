# eliska-12 × EM2 · Fix it myself (recert-2)

- Character: eliska-12 (12, Year 8, English-medium school in Prague)
- Journey: EM2 Fix it myself
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** The playbook fallback frame is now one sentence and passes the rewrite check. The false hold on a still-opinion rewrite (major) and three minors remain.

## Reachable surface (now)

- Forensic actions Rewrite on my phone, Next sentence (`desk/src/tv/keys.ts:185-188,468-470`); phone rewrite panel with Dictate (`desk/src/app/phone/page.tsx:694`).
- `revise` (`desk/src/lib/rules/essay.ts:599-613`), `reviseSentence` (`desk/src/lib/desk/essay.ts:260-264`), `rewriteState` (`rules/essay.ts:617-620`).
- Playbook (`desk/src/lib/library/lessons.data.ts:49-55`), `planSlots` (`rules/essay.ts:645`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-eliska-12-EM2-1 playbook fallback frame refused by the one-sentence rewrite (major) | **fixed** | `lessons.data.ts:51` para pattern is one sentence; Order too. Executed `revise` with every PLAYBOOK pattern filled -> ok:true for all; `planSlots` still yields claim, evidence, link | ae2544b5 |
| L1-eliska-12-EM2-2 false 'holds' on still-opinion rewrite (major) | **recurs** | `rules/essay.ts:572` role evidence -> checkable before `:574`; `:617-620`. Executed: rewrite of S2 with S3 'I found out that...' -> neutral, 'holds' | — |
| L1-eliska-12-EM2-3 kept verdicts go stale (minor) | **recurs** | `desk/src/lib/desk/essay.ts:264`; executed: S2 strong, S1 stays faulty | — |
| L1-eliska-12-EM2-4 focus to n+1, instruction only in bench bar (minor) | **recurs** | `keys.ts:185-188,468,470` | — |
| L1-eliska-12-EM2-5 opaque refusal; dictated rewrite refused (minor) | **recurs** | `rules/essay.ts:611`; `page.tsx:694`; executed 'i found it boring' -> the line | — |

## New findings

None.

## Notes

- Executed `revise`, `contextObservations`, `decideVerdicts`, `rewriteState`, `planSlots` via `tools/ts-load.cjs` (scratch `w.cjs`, `w3.cjs`), mirroring `reviseSentence` lines 260-264 without the model call.
