# Asset licence audit

Written 2026-10-21 for Devpost submission item 1. Read with [LICENSE](../../LICENSE).

**What the licence covers.** The MIT grant in `LICENSE` covers the source code in this repository
and the assets made for this project. Third-party assets keep their own terms, as listed below.
Assets marked DOUBTFUL are not cleared yet. Until the operator rules on one, it may not be ours
to license.

**Method.** Every class of file came from `git ls-files` on the base `main` (a92a201a), grouped by
extension and directory. Sources come only from what the repository records: provenance JSON,
sidecars, generator logs, READMEs and commit messages. Where nothing records a source, the entry
says "source not recorded". No asset was moved, changed or deleted. No provider's terms were
fetched (this audit ran offline), so the repo is not the place to settle a provider's terms.

**Labels.**
- `ours`: written or rendered by this project with nothing outside it in the asset.
- `third-party, compatible`: someone else's, under terms that allow redistribution beside MIT code.
- `DOUBTFUL`: the source is not recorded, or the asset is AI output whose provider terms are not recorded.

## For the operator

Each DOUBTFUL item needs a decision before the submission. None of them blocks the LICENSE itself.

| # | Item | Why it is doubtful | Decision needed |
|---|---|---|---|
| D1 | ElevenLabs output: all 59 shipped Death Ride clips `deathride/assets/audio/clips/*.wav`, the review audio under `deathride/audio/**`, and the desk audition `desk/audio/audition/**` | AI output. The sidecars record the plan tier (`starter`, and `creator` for the 10 voice takes re-recorded on 2026-10-15 and for the desk audition). No file records ElevenLabs' terms for that tier. The voices are ElevenLabs **premade** library voices (Callum, Harry, Adam). The README says the account balance may include another project's use and that it cannot lock "Garden VR's separate tool", so the account appears to be shared with Garden VR (`deathride/tools/audio/README.md`). | Confirm that the tier each clip was made on allows commercial use and redistribution in a public repo. If the Starter tier does not, re-render the Starter clips on a qualifying plan, or ship the game muted. |
| D2 | Grok image output (`grok-cli`, `grok-4.7`): shipped `deathride/assets/{phase2-v1,phase2-fusion,phase2-hud,phase2-states,regions,story-art}/*.png` and most of `deathride/art/**` | AI output. `deathride/art/history.jsonl` records the prompt and model for each image. No file records xAI's output terms. | Confirm that xAI's terms let you own and redistribute Grok images. |
| D3 | Antigravity `agy` image output (`gemini-3.8-flash-high`, "Nano Banana 2"): shipped `deathride/assets/mounts/kit.png`, plus `deathride/art/review/agy`, `deathride/art/regions/agy-candidate-pack`, `deathride/art/mount-pilot`, `deathride/art/audits/agy-extra-call` | AI output. No file records Google's output terms. | Confirm Google's terms for Antigravity image output. |
| D4 | Leonardo AI output (Lucid Origin): `desk/public/brand/*.png` (7) | AI output. Commit 8a292d1d records the tool. The prompts were kept in an untracked `.cx/` vault. No file records Leonardo's plan or terms. | Confirm that the Leonardo plan used gives you ownership and allows commercial use. Some plans make outputs public. |
| D5 | `desk/public/samples/english.jpg` | Source not recorded. Its siblings `maths.jpg` and `essay.jpg` are rendered by `vision/poc_ocr.py`. No tracked script contains this page's text ("English — Unit 6"). | Say where it came from, regenerate it from a script, or replace it. |
| D6 | `deathride/tracks/atlas/library-v1-outline-sheet.png` | Source not recorded. Added in 8c1be252 ("outline diagnosis"), and no tracked file names its generator. | Confirm that it is a render from the track tooling, or remove it. |
| D7 | `desk/public/{next,vercel,file,globe,window}.svg`, `desk/src/app/favicon.ico` | The repo does not say where they came from. Commit c6cf8020 added them with the create-next-app scaffold, and nothing in `desk/src` uses the SVGs. `next.svg` and `vercel.svg` are Vercel's trademark logos. | Keep them (scaffold files, MIT) or delete them. Deleting is cleaner, since they are unused and two are logos. |
| D8 | `deathride/tools/audio/elevenlabs.mjs` | Its README says "Port source: read-only Garden VR `tools/audio/elevenlabs.mjs`, consulted 2026-10-02". This repo does not record who owns Garden VR. | Confirm that Garden VR is your own code. If not, name its licence. |

Two related notes that are not licence questions:
- `artifacts/stick-2026-10-20-white-frame/after/z-final-real-desk.png` has "real desk" in its name. It
  shows only the seeded learner "Ema" (`desk/src/lib/session/store.ts`) and no learner records.
  `docs/concepts/STICK-WHITE-FRAME-2026-10-20.md` says the run used a temporary seeded desk. Before
  using it in demo footage, confirm that it shows no real learner, as the checklist's "IP must be
  ours … learner data" line requires.
- `deathride/art/history.jsonl` line 76: one Grok method test (`p3-method-conditioned-v1`, 2026-10-01)
  was conditioned on `C:\Users\kazda\kiro\firetv\.contest\art-test\cars\car_line.png`. That file is
  outside the repo, and nothing records its origin. No image from that test is tracked, only its
  grading reports in `deathride/art/reports/p3-method-*.json`. This matters only if the reference
  was not your own.

## Audio

| Path or glob | What it is | Source | Licence or terms | Evidence | Label |
|---|---|---|---|---|---|
| `deathride/assets/audio/clips/*.wav` (59) | The shipped Death Ride sound: effects, engines, announcer and Mechanic voices | ElevenLabs output: `/v1/sound-generation` `eleven_text_to_sound_v2` and `/v1/text-to-speech` `eleven_multilingual_v2`, trimmed locally | ElevenLabs plan terms, not recorded | `deathride/assets/audio/cues.json` maps each clip to a `sourceId` and `sourceSha256` that match a raw sidecar. Mix: 5 X2 audition clips + `ui.confirm`, 29 X3 effects, 10 X3 engines, 4 Starter voice takes, 10 Creator voice takes. Commits f4f2f3e8, 7f3b6cf9, 26cc5cf1, 5d22e7cb | DOUBTFUL (D1) |
| `deathride/audio/audition/raw/**`, `matched/*.mp3`, `repeats/*.ogg` | X2 audition kits (diesel, dust, funk, noir) | ElevenLabs sound effects, music (no model recorded) and TTS. `matched` and `repeats` are local normalisations and loops of the raw takes | ElevenLabs plan terms, not recorded (`starter`) | `raw/*.mp3.json` sidecars; `voice-candidates.json` (`"category": "premade"`); `credits-*.json` record only credit balances; commit 529fdbfb | DOUBTFUL (D1) |
| `deathride/audio/x3/effects/**` (wav, mp3, ogg) | X3 effects with first-pass, edited and repeat versions | ElevenLabs sound effects (34 new + 6 reused from X2), edited locally | ElevenLabs plan terms, not recorded | `raw/*.mp3.json`, `acceptance.json`, `deathride/audio/x3/README.md`; commit f4f2f3e8 | DOUBTFUL (D1) |
| `deathride/audio/x3/engines/**` | Two looped engine proofs per car class | ElevenLabs sound effects, `"loop": true` | ElevenLabs plan terms, not recorded | `raw/*.mp3.json`; commit b375f702 | DOUBTFUL (D1) |
| `deathride/audio/x3/voices/**` (including `archive-r0-2026-10-02`, `r1-2026-10-15`) | Announcer (Callum) and Mechanic (Harry) lines | ElevenLabs TTS on premade voices; dialogue written here (`SCRIPT.md`) | ElevenLabs plan terms, not recorded (`starter`; `creator` for r1) | `raw/*.mp3.json`; commits 7f3b6cf9, 5d22e7cb | DOUBTFUL (D1) |
| `deathride/audio/x3/music/*.flac`, `*.mp3` | One full-song proof and its sections | Synthesised in code by `deathride/tools/audio/compose-x3-proof.py` ("No provider or sample inputs", numpy sines and noise) | Ours | X3 README "No paid music in X3"; commit 207bae5b | ours |
| `deathride/audio/owner-2026-10-03/excluded/*.wav` (5) | Clips the owner rejected and removed from `assets/` | ElevenLabs sound effects, edited locally. The hashes match `x3/effects/acceptance.json` and `x3/effects/edited/lap.wav` | ElevenLabs plan terms, not recorded | `owner-2026-10-03/before-cues.json`; commit 26cc5cf1 | DOUBTFUL (D1) |
| `desk/audio/audition/{music,sfx}/*.mp3` (5 + 24) | Study Desk effect and theme audition, not wired into the desk | ElevenLabs `/v1/sound-generation` `eleven_text_to_sound_v2` and `/v1/music` `music_v1`, by `tools/audio/desk-audition.mjs` | ElevenLabs plan terms, not recorded (`"accountTier": "creator"`) | `*.mp3.json` sidecars, `desk/audio/audition/plan.json`, `tools/audio/ledger.jsonl`; commit a92a201a | DOUBTFUL (D1) |
| `deathride/audio/**/*.png`, `deathride/audio/review-evidence/*.png` | Screenshots of the review pages and waveform plots | Rendered by this project's tools | Ours | the review-evidence JSON beside them | ours |

The `credits-before/after/final.json` files the brief names record ElevenLabs **credit balances**
(tier, used, remaining), not attributions. They prove the tier, not the terms.

## Images and textures

| Path or glob | What it is | Source | Licence or terms | Evidence | Label |
|---|---|---|---|---|---|
| `deathride/assets/{phase2-v1,phase2-fusion,phase2-hud,phase2-states}/*.png`, `*.atlas` | Shipped world, car and HUD atlases | Grok image output (`grok-cli`, `grok-4.7`), packed into atlases here. `course-ribbon.png` is baked by `fusion_lab_prepare.py` (numpy, seed 713) | xAI terms, not recorded | `provenance.json`, `cars-provenance.json`, `hud-provenance.json` beside the atlases; `deathride/art/history.jsonl`; commits be5e8e4a, bfd54472 | DOUBTFUL (D2); `course-ribbon.png` ours |
| `deathride/assets/regions/*.png` (16) | Region tints | Grok (g1-*) | xAI terms, not recorded | `history.jsonl`; commit 8f7f7de0 | DOUBTFUL (D2) |
| `deathride/assets/story-art/*.png` (16) | Campaign portraits and story panels | Grok (story-*, rw2-face-*) | xAI terms, not recorded | `deathride/assets/story-art/catalog.json` (`owner_approved: true`); commit bee3457e | DOUBTFUL (D2) |
| `deathride/assets/mounts/kit.png` | Weapon mount kit | agy (Gemini, Nano Banana 2) | Google terms, not recorded | `deathride/assets/mounts/kit.json` ("owner 2026-10-15: proofs approved … (agy, mount-pilot envelope)"); commit 548dc84e | DOUBTFUL (D3) |
| `deathride/tracks/atlas/library-v1-outline-sheet.png` | Track outline contact sheet | Source not recorded | Not recorded | commit 8c1be252 only | DOUBTFUL (D6) |
| `deathride/art/review/{fusion,v2,rework2,story,hud}/**`, `deathride/art/regions/candidate-pack/**`, the Grok part of `deathride/art/review/regions/**` | Review candidates (png, jpg, gif) | Grok. Edit inputs `review/fusion/sources/*.jpg` are earlier Grok output | xAI terms, not recorded | `deathride/art/history.jsonl` (prompt, model, hash for each), `deathride/art/README.md` ("Generation uses the logged-in Grok CLI") | DOUBTFUL (D2) |
| `deathride/art/review/agy/**`, `deathride/art/regions/agy-candidate-pack/**`, `deathride/art/mount-pilot/**`, `deathride/art/audits/agy-extra-call/*.jpg` | agy review candidates. The style references are our own cars (`mount-pilot/ref-*-intact.png`) | agy (Gemini, Nano Banana 2) via `deathride/tools/art/agy_provider.py` | Google terms, not recorded | `history.jsonl` entries with `"provider": "agy"` | DOUBTFUL (D3) |
| `deathride/art/contracts/rework2-face-inputs/*.png` | Crops of Grok portraits used as conditioning | Cropped by `rework2_face_references.py` from Grok output | Follows the Grok source | the script's "unresampled lossless source crop; conditioning input only" | DOUBTFUL (D2) |
| `deathride/art/surface-lab/{inputs,fusion-inputs,review,fusion-pictures}/**` | Surface experiments | Script-built textures (`surface_prepare.py`: "without any paid generation", sine harmonics, seed 713) and thumbnails of Grok assets | Ours for the script output; Grok terms for the thumbnails | the `surface_prepare.py` header | ours / DOUBTFUL (D2) for the Grok thumbnails |
| `deathride/art/device/*.png`, `deathride/art/reports/*.png` | Fire TV Stick captures; browser captures of our review pages | Captured from our own game and pages | Ours, but they show D2/D3 art | logcat and meminfo beside the device captures | ours (they depict D2/D3 art) |
| `deathride/evidence/**/*.png`, `*.svg`; `deathride/campaign/design-v2/*.png` | Game screenshots, Stick screencaps, matplotlib charts | Playwright `page.screenshot`, `adb exec-out screencap`, matplotlib (`tools/campaign-v2-report.py`, `ai-balance-plots.py`) | Ours. Screenshots show the D2/D3 art in context | e.g. `deathride/tools/ability-controller-check.mjs:36`, `deathride/tools/ability-stick-probe.mjs:81` | ours |
| `desk/public/brand/*.png` (7) | Module marks and illustrations (Linga, Math Buddy, Essay Master, lamp, band, telestrator, paired) | Leonardo AI (Lucid Origin) via the `/leonardo` skill; backgrounds keyed out locally | Leonardo terms, not recorded | commit 8a292d1d ("brand assets generated with /leonardo (Lucid Origin)"), 413544b8; `.claude/leonardo/config.md` | DOUBTFUL (D4) |
| `desk/public/samples/maths.jpg`, `essay.jpg` | Synthetic printed worksheets | Rendered by `vision/poc_ocr.py` (PIL, Arial text, simulated photo warp) | Ours | `docs/STUDY-DESK-POC-RESULTS.md:52` ("These pages are rendered, not photographed"); `maths.jpg` matches `prototype/data.json` | ours |
| `desk/public/samples/english.jpg` | Worksheet "English — Unit 6" | Source not recorded | Not recorded | commit c6cf8020 only | DOUBTFUL (D5) |
| `desk/public/{next,vercel,file,globe,window}.svg`, `desk/src/app/favicon.ico` | create-next-app scaffold icons, unused | Not stated in the repo; commit c6cf8020 added them with the scaffold | Next.js scaffold (MIT). `next.svg` and `vercel.svg` are Vercel trademarks | commit c6cf8020 | DOUBTFUL (D7) |
| `tv-app/src/main/res/mipmap-xhdpi/ic_banner.png` | Telestrator TV banner, a plain dark 320×180 fill | Made here | Ours | commit 273f4f1f | ours |
| `artifacts/stick-2026-10-20*/**` (png, jpg, mp4) | Captures of our own app on the Fire TV Stick | `adb` screencap and screenrecord | Ours. They show seeded learners Ema and Jakub (`desk/src/lib/session/store.ts`) | `docs/concepts/STICK-WHITE-FRAME-2026-10-20.md:8`; commits c730ce91, 595b48f9 | ours (see the `z-final-real-desk.png` note above) |
| `uat/runs/**/shots/*.png`, `uat/runs/2026-10-09-essay-w-run/*.png` | Screenshots from the simulated UAT characters' runs | Playwright against our own desk | Ours | the run reports beside them | ours |

`fixture_clip.mp4`, the telestrator test video, is not tracked (`.gitignore`). `fixtures/README.md`
generates it from ffmpeg's synthetic `testsrc2` pattern, so it carries no footage rights.

## Fonts

No font file (`*.ttf`, `*.otf`, `*.woff*`, `*.fnt`) is tracked anywhere.

| Where | What | Source | Licence | Evidence | Label |
|---|---|---|---|---|---|
| `desk/src/{essay,landing,maths}/fonts.ts`, `desk/src/landing/themes/blueprint/fonts.ts` | Bricolage Grotesque, IBM Plex Sans and Mono, Fraunces, DM Sans, DM Mono, Jost, Caveat, Manrope | Google Fonts, fetched by `next/font/google` at build time and self-hosted in the build output | SIL Open Font License 1.1 (Google Fonts catalogue). Not recorded in the repo | the four `fonts.ts` files | third-party, compatible |
| `prototype/identity/on-air.src.html`, `prototype/src/index.html`, `prototype/identity/variants.html` | Barlow, Barlow Condensed, IBM Plex, Fraunces, Sora, Nunito, Plus Jakarta Sans, JetBrains Mono, Manrope | Linked from the Google Fonts CDN, not bundled | SIL OFL 1.1 (Google Fonts catalogue) | the `<link>` tags in those pages | third-party, compatible |
| `deathride/game/.../HandCutFont.kt` | 5×7 bitmap letters stored as bit rows | Written here | Ours | the file header: "Original 5x7 letter construction authored for Death Ride; no external font source" | ours |
| `deathride/game/.../RuntimeFonts.kt`, `deathride/app/.../PhoneFonts.kt`, `deathride/desktop/.../DesktopFonts.kt` | Glyph atlases rasterised at runtime from the platform's font (Android `sans-serif`, AWT `SansSerif`) | The device's system font; nothing bundled | The platform's own font licence; not redistributed by this repo | `RuntimeFonts.kt`: "No font/image files are bundled or downloaded" | third-party, compatible (not redistributed) |

## Code and build files

| Path or glob | What it is | Source | Licence | Evidence | Label |
|---|---|---|---|---|---|
| `gradle/wrapper/gradle-wrapper.jar`, `gradlew`, `gradlew.bat` | Gradle Wrapper (root build) | Gradle | Apache-2.0 | the script headers ("Copyright © 2015-2021 the original authors", `SPDX-License-Identifier: Apache-2.0`); commit 273f4f1f | third-party, compatible |
| `deathride/gradle/wrapper/gradle-wrapper.jar`, `deathride/gradlew*` | Gradle Wrapper (Death Ride build, gradle-8.14) | Gradle | Apache-2.0 | jar manifest "Implementation-Title: Gradle Wrapper"; commit 98d6f90a | third-party, compatible |
| `deathride/tools/audio/elevenlabs.mjs` | The ElevenLabs client with credit guards | Ported here; its README names Garden VR's `tools/audio/elevenlabs.mjs` as the port source | Not recorded | `deathride/tools/audio/README.md`; commit a35287d4 | DOUBTFUL (D8) |
| `deathride/app/src/main/cpp/silent_mmap.cpp`, `CMakeLists.txt` | P15 perf-only AAudio probe | Written here; links only NDK system libraries | Ours | commit 43e547e3 | ours |
| `deathride/tools/**/*.java`, `deathride/art/surface-lab/revisions/**/SurfaceLab.java` | Tools in `dev.deathride.*` packages | Written here. `QrCheck.java` uses ZXing as a dependency (Apache-2.0), not vendored | Ours | no foreign headers; feature commits | ours |
| Everything else: `core/`, `tv-app/`, `companion/`, `desk/src/`, `stick-app/`, `vision/`, `tools/`, `scripts/`, `prototype/` | Project source | Written here | Ours (MIT) | `git grep` finds no third-party copyright or SPDX header outside the Gradle scripts. No `vendor/`, `third_party/` or `*.min.js` is tracked | ours |

Dependencies that npm and Gradle resolve at build time are not in the repository, so they are not
redistributed by it. Their inventory is the SBOM (`sbom.yml`, `.ai/memory/0021`).

## Data files

| Path or glob | What it is | Label |
|---|---|---|
| `deathride/core/src/main/resources/data/*.csv`, `deathride/tracks/**` (csv, zip), `deathride/evidence/**` (csv, gz, zip, sav, json, log), `deathride/art/briefs/*.csv` | Game tables, generated track bundles (the README inside says "Reproduce with TrackCandidateAuthor.compose … then TrackCandidatePack"), soak and test logs, save files, art briefs | ours |
| `uat/**`, `tools/*-fixtures.json`, `prototype/data.json` | UAT reports with simulated characters, test fixtures | ours |

`desk/data/` (real learner records) is not tracked, and this audit did not read it.
