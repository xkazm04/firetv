---
id: 0021
kind: decision
scope: path:.github/workflows/
date: 2026-10-05
supersedes: null
refs: [0013, path:.github/workflows/sbom.yml, path:tools/gradle-sbom.cjs, path:tools/gradle-sbom-test.cjs, path:CONTRIBUTING.md]
---

**The TV APK's SBOM is built from Gradle's own resolved dependency report, not from a Gradle plugin.** This settles the
"still owed" SBOM in 0013. The pinning half of 0013 still stands.

How it works:

- `.github/workflows/sbom.yml` runs after each green `supply-chain` run on main.
- It downloads the APK that run built and checks it against `SHA256SUMS`.
- At the same commit, it prints `:tv-app:dependencies --configuration debugRuntimeClasspath`.
- `tools/gradle-sbom.cjs` turns that report into CycloneDX 1.5. Each component gets a Maven purl at the version Gradle
  selected, and the tree becomes the dependency graph.
- `actions/attest-sbom` attests the SBOM against the APK's digest, next to its build provenance.

**Why not `org.cyclonedx.bom`:**

- The plugin would edit `tv-app/build.gradle.kts` and every local build, for an output only CI needs.
- Its version would have to be resolved from the Plugin Portal.
- `anchore/sbom-action` (syft) cannot catalogue an APK at all.
- Gradle's report is the resolver's own answer, needs no extra dependency, and fails loudly: the converter exits 1 on a
  `FAILED` row or an empty report.

**Not covered:**

- The desk ships no artifact, so its `npm sbom` output is uploaded as an inventory and not attested.
- Death Ride has no CI-built APK, so it has no SBOM yet.
