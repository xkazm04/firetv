# R3 owner proposals

Open `../atlas/candidates.html`. These files do not replace production courses or campaign rows. There are three proposals for each redesigned campaign slot, plus unchanged accepted Runoff in the review. The 35 event IDs remain stable.

- `recipes/`: composer geometry, in car units.
- `drafts/`: actual final CSVs, start grid, race profile, five tier references, shape/quality measurements and proof digest.
- `bundles/`: uniquely named course files and shared-table row fragments. Merge selected rows only after an owner choice; never overwrite whole shared tables with a fragment.
- `proof-12/`: current ordinary race 72-trial evidence and compressed raw trial records. Its earlier arena elimination stress records are historical failures, not the delivered arena proof. A draft may use evidence only when its digest matches. `proof-1` and `proof-4` are obsolete exploratory probes.
- `proof-12-traversal/`: current equal-tier six-car lap rehearsal for the three arenas. `crown-7-*-duel.json` separately measures the actual two-car finale; all three still have unresolved trials and are technically flagged. Six-car traversal does not establish a mastered duel.
- `recovery.csv`, `race-overrides.csv`, `launch-overrides.csv`: explicit authored placement/budget decisions. The recipe alone does not contain these final placements.
- `hunter-evidence.json`: observations with actual intent, attributed hits and replay coordinates; generic proximity heat is not this evidence. `hunter-active-evidence.json` records the stricter negative follow-up: no observed active corner block in 288 trials.
- `visual-rejection*.json`, `manifest-first-pass.csv` and `evidence/tracks/r3/final-revisions`: rejected alternatives and reasons. Earlier failing simulation logs are retained.

`manifest.csv` is the initial search ledger (family, seed, initial scale/reference). Manual pacing/recovery revisions are recorded separately; the current draft's measured reference, CSV and proof digest take precedence over the initial search estimate.

From the project directory, the Gradle report classpath is in `core/build/report-classpath.txt`. Compile test tools with `gradlew :core:compileTestKotlin`. `TrackCandidateAuthorKt 102` resumes missing manifest choices; `TrackCandidateProofKt 12 <comma-separated-id-prefixes> <threads>` proves actual six-car races; `TrackCandidatePackKt` refreshes every draft and bundle. Do not pass an empty argument through PowerShell: use explicit prefixes. Then run `node tools/tracks-candidate-report.mjs`, the candidate contract and browser checks. Current proof includes the start fraction and route engine version; changing geometry, final CSVs, start grid, tier or laps invalidates it.

Technical flags remain visible until corrected. A passing simulation is not a human Keep. The full design, validation, device status and remaining work are in `docs/concepts/deathride/R3-candidate-library.md` at the repository root. The shared Stick was busy with `dev.deathride.perf`; only `dev.deathride.tracks` is an authorized preview target.

For arenas, invoke `TrackCandidateProofKt 12 crown-7 1 --arena-laps`, then `TrackArenaEvidenceKt crown-7-a crown-7-b crown-7-c`. Both outputs are necessary. Shape gates run before proof/cache reuse and before packing; pacing edits must not bypass them. `tracks-final-revisions.mjs` and `tracks-prune-visuals.mjs` are historical authoring utilities, not rebuild commands: rerunning them would rewrite the selected final recipes.
