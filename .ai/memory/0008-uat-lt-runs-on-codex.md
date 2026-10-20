---
id: 0008
kind: decision
scope: path:uat/
date: 2026-10-05
supersedes: null
refs: [path:uat/driver/linga-text.cjs]
---

The Linga UAT **LT (text-live)** level runs on codex-cli for all three roles (tutor, Character,
judge). Claude models are kept for manual L2 testing with the owner. Do not switch LT to claude to
"match" the desk's text engine. **Why:** a model judging its own tutor output is a known bias, so every
LT verdict names its engine and anything that matters is re-checked at L2. Source: `uat/README.md`.
