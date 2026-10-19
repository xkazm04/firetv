# daniel-15 × EM2 · (recert-9)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head b7fca776
- Recertifies: 2026-10-09-essay-l1/recert-8 at 318bbea4
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a… (minor) | recurs → L1-daniel-15-EM2-1 | cited lines re-found at b7fca776; no commit since 318bbea4 touched phone/recogniserLang.ts, phone/page.tsx | none |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported cl… (minor) | recurs → L1-daniel-15-EM2-2 | cited lines re-found at b7fca776; rules/essay.ts changed since 318bbea4 (48c75157) and the cite moved +17 (same line content); no commit since 318bbea4 touched desk/essay.ts | none |

## New findings

None.

## Notes

- Evidence check at b7fca776: every cited line was re-mapped through `git diff -U0 318bbea4 b7fca776` per file (only desk/src/lib/rules/essay.ts changed in Essay code, by 48c75157; a cite inside a rewritten hunk was re-read by hand). No row is fixed, so no fixing commit is claimed; 48c75157, the commit that narrows three rows, was checked with `git merge-base --is-ancestor 48c75157 b7fca776`. Model-dependent behaviour stays with L2.
