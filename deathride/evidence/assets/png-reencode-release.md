# PNG lossless re-encode: release-only (applied)

Delivers M1 goal 3 (card "Recompress story-art and phase2-states PNGs losslessly") under the owner ruling of 2026-10-07: re-encode at release build only. `deathride/assets/`, `deathride/art/` and every record stay byte-identical; only the packaged copies change. Follows `png-reencode-dryrun.md` (option b: 48 of 55 PNGs).

## How

- `app/build.gradle.kts` task `pngReencode` (custom task, declared inputs and outputs) runs `app/release-assets/reencode_release_assets.py` and writes only the changed files into `app/build/generated/release-assets/`. That dir is wired into the **release variant only** (`variant.sources.assets.addGeneratedSourceDirectory`), where it overrides the same paths from `assets/`. I chose the release-only generated asset dir, not a transform after `mergeReleaseAssets`. Debug, desktop and tests still read `assets/`. The controller assets and `ignoreAssetsPattern` are untouched.
- Settings: `oxipng -o max --zopfli --nx` equivalent (pyoxipng `level=6`, `zopfli(15)`, no reductions, strip none). Per-file checks: smaller, same IHDR, same palette, identical pixels native and RGBA. A file that fails any check ships unchanged and is listed under `png_skipped` in the manifest (none failed).
- Never touched: the 7 owner-approved story-art files (any `approved_export_sha256` hit) and any review-pinned file.
- Packaged catalog JSONs only: every 64-hex value equal to a re-encoded file's source sha256 is replaced textually by its packaged sha256 (formatting preserved). 107 values in 10 catalogs under phase2-states, story-art and regions. The dry run's 223 also counted catalogs in dirs the APK ignores (phase2-v1, phase2-hud, phase2-fusion), which are not packaged.
- Pin: `app/release-assets/requirements.txt` (`pyoxipng==9.1.1`, Pillow for the checks). Missing or different version: the build fails with `PNG re-encode: pyoxipng==9.1.1 is required, found ... or pass -PnoPngReencode=true`. `-PnoPngReencode=true` ships the original bytes and logs `PNG re-encode: -PnoPngReencode set, ...`. `-Ppython=<exe>` picks another interpreter.
- Tool install used: `pip install --user pyoxipng==9.1.1 Pillow` (user site only; no repo dependency).
- Manifest: `app/build/outputs/png-reencode-manifest.json` (per file: source sha256, packaged sha256, bytes before and after, pin fields rewritten; plus the rewritten catalogs).

## Figures

Before = this base (`deathride/main` e170d4e5 tree) built with `-PnoPngReencode=true`, which is the original bytes.

| | before | after | saved |
|---|---|---|---|
| release APK | 35,136,461 | 33,550,861 | 1,585,600 |
| APK `assets/` (stored sizes) | 23,460,644 | 21,875,036 | 1,585,608 |
| 55 PNGs in assets | 18,355,249 | 16,769,662 | 1,585,587 |
| 48 re-encoded PNGs | 16,562,185 | 14,976,598 | 1,585,587 |

Expected about 35,120,077 and 33,534,490. The before figure is 16,384 higher than the dry run because the base tree moved since c4763248 (code in the dex); the PNG saving is exactly the dry run's 1,585,587. The APK-level difference of 13 bytes against that is zip entry overhead and the signature block.

## Acceptance

- Verifier: `cd deathride; python -I app/release-assets/verify_release_apk.py app/build/outputs/apk/release/app-release.apk assets` printed `PNGs: 48 re-encoded, 0 unchanged non-owner, 7 owner-approved byte-identical; 132 JSON pin values name a packaged PNG and match` then `OK`. It checks pixels equal to the source for every packaged PNG, every hash in a packaged JSON that names a packaged PNG equals its sha256 in the APK (so `RegionMaterials.verifiedFile` and `StoryArt.matches` pass), and the 7 owner files byte-identical. The 132 includes the unchanged owner pins.
- `git status` after the release build: no change under `deathride/assets/`, `deathride/art/` or any record.
- Second `assembleRelease`: `> Task :app:pngReencode UP-TO-DATE` (the first run takes about 10 minutes, zopfli).
- `assembleRelease -PnoPngReencode=true`: BUILD SUCCESSFUL, APK 35,136,461 bytes.
- Wrong pinned version: the script exits non-zero with the message above.
- `gradlew.bat :core:test :link:test :game:test --console=plain`: BUILD SUCCESSFUL.

## Commands

```
cd deathride
gradlew.bat :app:assembleRelease                         # re-encodes (about 10 min cold), then UP-TO-DATE
gradlew.bat :app:assembleRelease -PnoPngReencode=true    # original bytes
python -I app/release-assets/verify_release_apk.py app/build/outputs/apk/release/app-release.apk assets
```
