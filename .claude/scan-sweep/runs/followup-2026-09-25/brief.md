# Follow-up drain 2026-09-25 - builder brief

The rules are those of `.claude/scan-sweep/runs/challenge-2026-09-25/builder-brief.md`. Read it in full: tree,
shared checkout, repo law, design languages, TV browser gate, gates, lock and commit form. It binds you. There are
three differences:

- **Your work is a backlog finding, not a card.** Your prompt carries the finding. The full text is in
  `.claude/scan-sweep/runs/challenge-2026-09-25/findings.jsonl` (match on the title).
- **Base:** `main` at ad6c731, already pushed. Commit on main. **Never push.**
- **Result file:** `.claude/scan-sweep/runs/followup-2026-09-25/results/<id>.json`, same shape as the challenge
  result (`cases_red_before`, `cases_green_after`, `cases_total`, `guards_declared`, `gates`, `shas`,
  `deviations_from_card`, `notes`).

Other builders are working in the same checkout at the same time:

| id | write set |
|---|---|
| factor-leak | `desk/src/lib/rules/maths.ts`, `tools/withhold-rules-test.cjs` |
| tv-recap | `desk/src/tv/*`, `desk/src/maths/MathsTV.tsx`, `desk/src/essay/EssayTV.tsx`, `desk/src/landing/LandingTV.tsx`, `desk/src/app/api/memory/route.ts`, `tools/tv-recap-test.cjs` |
| linga-states | `desk/src/lib/english/view.ts`, `desk/src/english/LingaPhone.tsx`, `uat/driver/surface.cjs`, `tools/uat-surface-test.cjs` |
| context-map | `context-map.json` (and a coupled read of `.claude/skills/scan-sweep/scripts/coverage.mjs`, never edited) |

Stay inside your own write set.
