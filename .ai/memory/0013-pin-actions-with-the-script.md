---
id: 0013
kind: reference
scope: path:.github/workflows/
date: 2026-10-05
supersedes: null
refs: [path:scripts/pin-actions.mjs, path:.github/dependabot.yml, 0011]
---

The GitHub Actions in `.github/workflows/` still float on tags, which 0011 records as open because
pinning needs the network. To pin them:

1. From a shell with network access, run `GH_TOKEN=$(gh auth token) node scripts/pin-actions.mjs`.
   It asks GitHub for the commit behind each tag and rewrites the line to `owner/repo@<sha> # vN`.
2. Run `node scripts/pin-actions.mjs --check`, which needs no network. It exits 1 while any ref
   still floats.
3. Commit only the workflow files. Dependabot's github-actions updates move the SHA and the comment
   together afterwards.

**Never type or guess a SHA.** An invented SHA breaks the workflow instead of pinning it. An
offline session cannot pin, so it should say so and leave this item open.

Still owed with this: a CycloneDX SBOM for the tv-app APK, attested next to the provenance in
`supply-chain.yml`. `anchore/sbom-action` (syft) cannot catalogue an Android APK, so the SBOM has
to come from the Gradle graph (`org.cyclonedx.bom` on `debugRuntimeClasspath`). Adding it edits
`tv-app/build.gradle.kts` and that workflow, and it needs Gradle to resolve the plugin.
