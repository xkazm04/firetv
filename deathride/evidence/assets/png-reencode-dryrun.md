# PNG lossless re-encode: dry run (nothing applied)

Measures the 2026-10-06 optimize card "Recompress story-art and phase2-states PNGs losslessly" (lane B, "After: not run, tool unavailable"). No asset, JSON or pin was changed.

## Figures

- Before: release APK `deathride/app/build/outputs/apk/release/app-release.apk` = **35,120,077 bytes** (33.49 MiB). Command: `cd deathride; gradlew.bat :app:assembleRelease` (base `deathride/main` c4763248).
- APK `assets/` = 23,460,638 bytes (22.37 MiB). 55 PNGs = 18,355,249 bytes (17.50 MiB, 78% of assets). All 55 PNG entries are **stored**, none deflated, so the APK saving equals the raw file saving.
- All 55 re-encoded files passed every check (smaller, same IHDR, same palette, pixels identical in native mode and in RGBA). None was left out.

| top-level dir in APK | files | bytes | MiB | PNGs | PNG bytes | stored/deflated |
|---|---|---|---|---|---|---|
| phase2-states | 41 | 14,242,547 | 13.58 | 23 | 14,056,124 | 23/0 |
| audio | 60 | 4,897,374 | 4.67 | 0 | 0 | n/a |
| story-art | 17 | 2,951,871 | 2.82 | 16 | 2,949,429 | 16/0 |
| regions | 17 | 1,351,148 | 1.29 | 16 | 1,349,696 | 16/0 |
| (root: controller) | 3 | 17,480 | 0.02 | 0 | 0 | n/a |
| dexopt | 2 | 218 | 0.00 | 0 | 0 | n/a |

### Totals (projected saving, only accepted files)

| option | files | saved bytes | MiB | % of APK | % of assets | JSON pin values to rewrite |
|---|---|---|---|---|---|---|
| (a) every shipped PNG | 55 | 1,729,850 | 1.65 | 4.93% | 7.37% | 248 |
| (b) no owner-approval or review pin | 48 | 1,585,587 | 1.51 | 4.51% | 6.76% | 223 |
| (c) owner-approved files only | 7 | 144,263 | 0.14 | 0.41% | 0.61% | 25 |

Projected APK after (a): about 33,390,227 bytes. After (b): about 33,534,490.

## Per-class table

| dir | pin class | files | before | saved | pin values |
|---|---|---|---|---|---|
| phase2-states | technical (sha256, processed_sha256, sourceSha256, source_sha256, image_sha256) | 23 | 14,056,124 | 1,176,851 | 198 |
| regions | technical (sha256) | 16 | 1,349,696 | 315,466 | 16 |
| story-art | technical only (sha256) | 9 | 1,156,365 | 93,270 | 9 |
| story-art | owner approval (approved_export_sha256, plus face_visibility_export_sha256 and sha256) | 7 | 1,793,064 | 144,263 | 25 |
| any | review pin only | 0 | 0 | 0 | 0 |
| any | unpinned | 0 | 0 | 0 | 0 |

Per-file rows (pin file, JSON path, field, Kotlin reader) are in `png-reencode-dryrun.json`.

### What reads each pin

- `approved_export_sha256`: `StoryArt.eligible` (StoryArt.kt:75, `== sha256`), `EnvironmentArt.eligible` (EnvironmentArt.kt:15, `export_sha256 == approved_export_sha256`). Tests: StoryArtTest, EnvironmentArtTest (synthetic fixtures only).
- `face_visibility_export_sha256`: `FaceArt.screened` (FaceArt.kt:15-16, must equal `export_sha256`/`sha256`); called from `StoryArt.eligible` and AtlasArt.kt:50. Test: FaceArtTest.
- story-art `sha256`: `StoryArt.eligible` and `StoryArt.matches` (digest of the loaded bytes, runtime); StoryArtTest:48 hashes every catalog file.
- regions `sha256`: `RegionMaterials.verifiedFile` (RegionMaterials.kt:25, `require`, runtime hash check on load).
- phase2-states `sha256`/`processed_sha256`/`sourceSha256`/`image_sha256`: **no Kotlin reader** (AtlasAudit and AtlasArt do not hash the pages). Only Python under `deathride/tools/art/` (owner_art_validation.py, apply-owner-art.py, regions_*.py, rework2_*.py) reads them.

## Findings that change the decision

1. The brief's "16 + 8 approved entries" overstates what re-encoding touches. In story-art/catalog.json only **7 of 16** entries have a non-empty `approved_export_sha256` (mechanic, debt-contract, ending, ally-mica/ox/rook/vex); the other 9 have the field empty, so `StoryArt.eligible` is already false for them. Those 9 are still `sha256`-pinned at runtime via `matches`.
2. The 8 approvals in phase2-states/catalog.json are per-sprite export hashes (asset ids 157-164). Seven match no shipped PNG; one equals story-art/mechanic.png. Re-encoding the atlas pages `world-0`, `cars-*`, `ui-0` does not invalidate any owner approval.
3. So the owner approval question is 7 story-art files and 144,263 bytes (0.41% of the APK). Option (b) takes 92% of the saving and touches no owner pin; its pins are technical and, for phase2-states (1.18 MB of the 1.59 MB), read only by Python tools.
4. Re-encoding the 7 owner files also moves 3 pin fields each (`sha256`, `approved_export_sha256`, `face_visibility_export_sha256`; mechanic has 7 because the phase2-states catalog repeats it).
5. Pixels are unchanged, so texture memory is unchanged. The saving is download/storage size only; load time may differ slightly.
6. Not measured: whether the stored (uncompressed) PNG entries could instead be deflated by the APK packager. That is a different lever and also needs no pin changes.

## Method

- Tool: pyoxipng 9.1.1 (oxipng library 9.x, pip, user site only, no repo dependency). `cargo install oxipng` was not used.
- Flags (`oxipng.optimize_from_memory`): `level=6` (= `-o max`), `deflate=zopfli(15)`, `bit_depth_reduction=False`, `color_type_reduction=False`, `palette_reduction=False`, `grayscale_reduction=False` (= `--nx`), strip none, `fix_errors=False`. Equivalent CLI: `oxipng -o max --zopfli --nx`.
- Input: the PNG entries read from the APK. Each is byte-identical to its source in `assets/` (`apk_matches_source` is true for all 55). Output went to a scratch dir outside the worktree (`%TEMP%\pngscratch`), not kept.
- Acceptance per file: smaller, IHDR bytes (w, h, depth, color type, compression, filter, interlace) equal, palette equal, Pillow decoded pixels equal natively and after `convert("RGBA")`.
- Pin search: every 64-hex string value in every `deathride/assets/**/*.json` equal to the file's current sha256 (path and field recorded). Class: owner = any `approved_export_sha256` hit; review = `face_visibility_export_sha256` only; else technical. Kotlin readers were found by grepping `game/src`, `desktop/src`, `core/src`, `link/src`.
- Reproduce: `cd deathride; python -I evidence/assets/png-reencode-dryrun.py <apk> <scratch>` (about 10 minutes, zopfli).
