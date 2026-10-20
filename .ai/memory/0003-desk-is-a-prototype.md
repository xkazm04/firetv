---
id: 0003
kind: decision
scope: path:desk/
date: 2026-10-05
supersedes: null
refs: [path:docs/DESK-PROTOTYPE-PLAN.md]
---

`desk/` (Study Desk: Linga, Math Buddy, Essay Master) is a **functional prototype and design
document**, not the shipping app. Every page, flow, prompt and rule table in it is meant to be
rebuilt natively on Fire TV with AWS behind it. **Why it matters for a change:** optimise for a
clear, portable rule or flow (decisions in `src/lib/rules/`, engines behind `src/lib/engines/`)
over web-only production hardening. A behaviour that only exists because it is a web app should
not become product law. Source: `desk/README.md` (opening paragraph).
