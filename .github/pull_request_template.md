## What and why

<!-- One or two sentences: the change, and the problem it solves. Link the card, backlog row or issue. -->

**Product touched:** <!-- telestrator (core / tv-app / companion) · Study Desk (desk / uat) · Death Ride · repo tooling -->

## Gates run

<!-- The gate for every touched surface (AGENTS.md, "Which gate for which change"), run after the last edit. -->

| Command | Exit code |
|---|---|
| `npm --prefix desk test` | |
| `node tools/gradlew.cjs :core:test` | |

## Definition of Done (CONTRIBUTING.md)

- [ ] Every touched surface's gate exits 0 (table above)
- [ ] A behaviour change has a test that fails without it
- [ ] No live model call in a gate; nothing under `desk/data/`; no secret, `.env*` or keystore staged
- [ ] TV surface: screenshot attached, **or** the owed capture is named here: <!-- device / Playwright, which screen -->
- [ ] Docs describing the changed behaviour are updated in this PR
- [ ] A noticeable change has its line under the product's `### Unreleased` in `CHANGELOG.md` (or: not noticeable)
- [ ] A settled decision is recorded in `.ai/memory/` (or: none this time)
- [ ] Commits are pathspec-scoped; AI-written commits carry a `Co-Authored-By` trailer (and `Agent-Lane:` when a loop lane made them)

## AI involvement

<!-- Agent and skill used (see agents: in .ai/manifest.yaml), and what a human reviewed. -->
