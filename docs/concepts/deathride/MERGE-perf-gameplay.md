# Perf and gameplay merge

2026-10-03, local `deathride/main`, starting at `4b3f65c`. Perf `2e5fea4`
merged as `780be45`; the following merge incorporates gameplay `434ccdf`.
One merge commit per branch. No push or Stick access.

`RaceGame` retains cached road marks alongside story-art loading, shared texture
headroom, menu wiring and disposal. Android pacing, audio mailboxes, HUD deltas
and input diagnostics survive. Natural obstacles retain physical footprints,
weapon obstruction, AI recovery, linter rules and low/tall rendering order.
Both desktop audit entry points and owner-check sections survive; campaign
browser checks retain their configurable isolated port and new reward assertions.
The consolidated package/port remain `dev.deathride.campaign` / 8770.

Production core/data exactly match gameplay's release; Android, link and audio
production code exactly match perf. Campaign, X3 and pending story-art gates
remain intact. N3 is preserved: native resolution, all effects and full features.
The perf frame gates remain failed, and gameplay's late boss ratios/completion
remain partial. This merge does not claim new cohort, device or owner acceptance.

## Verification

[Validation and APK identity](../../../deathride/evidence/merge-perf-gameplay/validation.json)
and [test details](../../../deathride/evidence/merge-perf-gameplay/test-counts.json):

- `:core:test :link:test :game:test :app:assembleDebug :desktop:installDist`:
  150 / 8 / 32 tests, zero failures/errors/skips; both builds pass.
- 28 allocation/determinism cases pass, including active obstacle contact,
  drag and avoidance, combat, abilities, elimination and event observation.
  Two audio allocation tests also pass with `-XX:-DoEscapeAnalysis`.
- 45 art tests, phase2-states `validate_bundle`, story validation and nine
  gameplay metric tests pass. APK story/atlas/audio bytes match the source;
  all 16 story candidates remain unapproved, and all 52 audio clips survive.
- All six controller browser suites pass on the merged desktop host, including
  campaign rewards/persistence and duel seizure/dispatch/spectator/retry.
  Story desktop/mobile, perf, three gameplay galleries and five audio pages pass.
- Real GL story fallback/upload/release/text, obstacle atlas/fallback, atlas
  metadata/budget and native OpenAL checks pass. Road marks have zero differing
  pixels out of 196,608. Original perf raw/install hashes and 235 completed-wave
  evidence files verify after copying.

Initial harness failures are retained: the isolated atlas working directory
lacked the filesystem fixture source; the temporary Gradle init script had a
PowerShell UTF-8 BOM. Correcting those harness inputs produced the passing runs;
no runtime gate was relaxed. Reproduce the additional allocation check with
`gradlew.bat -I evidence/merge-perf-gameplay/no-escape.gradle :game:mergeNoEscapeTest`.
Existing historical reports were preserved; new observations are under
`deathride/evidence/merge-perf-gameplay`.

## Cleanup

Before removal, 2,612 perf and 7,363 gameplay ignored non-cache files were
archived and rehashed, including builds, raw traces, reports, frozen classpaths
and saves. All 50 ignored perf evidence files were also copied into their
original paths in this tree. Only reproducible Gradle/Kotlin/Node/Python caches
and the art virtual environment were excluded.

Local archives: `deathride/build/perf-worktree-archive/ignored-files.zip` and
`deathride/build/gameplay-worktree-archive/ignored-files.zip`. Tracked per-file
hashes: [perf](../../../deathride/evidence/merge-perf-gameplay/perf-archive.json)
and [gameplay](../../../deathride/evidence/merge-perf-gameplay/gameplay-archive.json).
Both clean-worktree and merged-ancestry checks passed immediately before cleanup.
Both worktrees and their directories were removed successfully; both merged
branches were deleted with `git branch -d`. The archives remain in this tree.
[Cleanup receipt](../../../deathride/evidence/merge-perf-gameplay/cleanup.json).
