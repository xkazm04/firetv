---
id: 0015
kind: decision
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:CHANGELOG.md, path:tools/changelog-test.cjs, path:.github/workflows/changelog.yml, path:CONTRIBUTING.md]
---

**One root `CHANGELOG.md` for all three products, organised by product and dated, not versioned.**

The file has four sections: Study Desk, Telestrator, Death Ride, and the repo and agent harness. Each opens with
`### Unreleased`, followed by `### YYYY-MM-DD: what landed` milestones, newest first. Every line links the doc or
decision record that holds the detail.

A noticeable change adds its line under `Unreleased` in the same pull request (CONTRIBUTING.md, Definition of Done;
the PR template asks for it). `tools/changelog-test.cjs` runs in `.github/workflows/changelog.yml` on every pull request
and push to main. It checks the shape, the date order and that every relative link resolves.

**Why:**
- Nothing ships with a version yet (`0.1-poc`, `0.1-spike`, `0.1.0`), so semver headings would be fiction.
- The only real tags are Death Ride's Phase 2 wave tags (`art-p*`, `integration-*-20261001`).
- Three separate changelogs would rot separately in a repo where one session often touches more than one product.

Before this file, "what landed when" lived only in git history and in the auto-memory of past sessions. The first
entries were written from the dated committed docs; commit SHAs are not cited, because the docs are the record. When
a product starts shipping versions, its dated milestones become version headings. Write a new memory that supersedes
this one when that happens.
