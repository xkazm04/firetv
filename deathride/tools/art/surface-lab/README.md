# Surface laboratory

Isolated libGDX rendering experiment, sharing the exact `SurfaceLab` class between desktop and Android. Android application ID is **dev.deathride.artlab**. It has no game services, networking or save files. Never install a differently named APK through the runner.

From the repository root (PowerShell):

```powershell
deathride/.art-venv/Scripts/python.exe deathride/tools/art/surface_prepare.py
./deathride/gradlew.bat -p deathride/tools/art/surface-lab :android:assembleDebug :desktop:installDist --console=plain
deathride/.art-venv/Scripts/python.exe deathride/tools/art/surface_run.py --run local-check --modes 0,1,13
deathride/.art-venv/Scripts/python.exe deathride/tools/art/surface_run.py --device 10.0.0.139:5555 --run v3-stick-next --wait-idle-seconds 1800
deathride/.art-venv/Scripts/python.exe deathride/tools/art/surface_review.py
```

Preparation requires local ignored exports from the art pipeline and checks their recorded hashes. The committed inputs can instead be copied unchanged to this directory's ignored `assets/` folder to build on a fresh checkout. Review generation needs local PNG captures; portable lossless WebP screenshots, PNG boards, raw timing JSON and source hashes are committed. Earlier development captures are ignored. Do not relabel desktop runs as device measurements.

Mode indices: 0 baseline, 1 painted, 2 macro, 3 decals, 4 baked course, 5 edges, 6 grade/dust, 7 depth, 8 wear, 9 poster/grain, 10 contrast, 11 combined, 12 matched live bake control, 13 restrained stack, 14 narrow-band stack, 15 cached geometry. Styles: 0 Rust and Ink, 1 Bleached Poster (seam failure), 2 Scrap Collage (rejected repeating border). All are unapproved sources. Modes use the same six cars and seeded spline course. No generation is involved.

Revision 1's renderer is preserved in `revisions/v3-1/SurfaceLab.java`: its all-layer and restrained stacks miss the nominal 16.7 ms median target. Revision 2 (`revisions/v3-2/SurfaceLab.java`) adds mode 14: only visible edge bands, 16 decals and 8 dust sprites. This reduces coverage but raises CPU cost, so it is also cut. Revision 3 adds mode 15: cache and bulk-submit the exact same road and edge vertices (201,600 bytes of float payload). Modes 0–14 retain their automated-run behavior. Manual switching also resets startup-bake metadata correctly.

Each follow-up remeasures its control on its own APK. The report uses revision 1 for the initial fourteen experiments, revision 2 for narrow-band versus restrained, and revision 3 for cached versus dynamic geometry. Binary hashes, input hashes, raw samples and archived source are retained. Exact RGB equality is required for the cached/dynamic pair. The initial desktop cache test caught an integer/float colour-overload error and rejected it before any Stick measurement.

The runner verifies APK identity, takes a shared git-directory lease, refuses active integration racing, installs only the lab, aborts if another activity takes foreground and restores the prior activity only if it still owns the foreground. A lease cannot force another independent tool to cooperate; lost foreground invalidates that incomplete run. A separate app ID avoids replacement but does not justify interrupting another test. The runner does not stop, clear, install or change `dev.deathride.tv`.

For manual switching after a safe idle window, launch the installed lab with `--ez auto false`; remote left/right select modes and up selects the style. Each selection warms and samples again, then leaves its comparison frame visible. `--ei mode N`, `--ei style N` and `--es run NAME` select the initial state. Back returns to the prior app.

Timing: 240 warmup frames followed by 900 frame intervals, CPU submission samples and synchronised completion samples. `glFinish` is intentional instrumentation: completion includes CPU + GPU work and blocking, not a hardware GPU timer. It changes normal scheduling. Draw counts are mean actual SpriteBatch flushes across the sample window, including periodic wear updates. Fill is submitted area, including clipped and overlapping geometry; it is not measured GPU fragment count. PSS is one `dumpsys meminfo` sample during rendering, before screenshot encoding. Startup bake completion is reported separately. Raw arrays and repeat ranges support scrutiny; an isolated 19-second renderer run is not integrated game certification or thermal soak.

Research, scope and decisions: `docs/concepts/deathride/V3-surface-lab.md`. Owner review: `deathride/art/surface-lab/review.html`.

## Fusion revision 4

Modes 16/17 compare hard edges and baked natural edges with identical fusion art, seed 713 and fixed capture time. `FusionCourse.java` loads the complete `phase2-fusion` bundle: four atlases, eleven tiles, one backdrop and both 1024-square car pages (one populated with reviewed references, one blank reserve). Mode 17 adds a 512x256 ribbon, totaling 31.25 MiB. Geometry is cached once (28,800 bytes). Six tall/low props use renderer shadows and foot-position sorting; obstacle metadata is not a core physics hook.

On a fresh checkout, copy committed `art/surface-lab/fusion-inputs/*.png` to this project's ignored `assets/fusion/`, run `fusion_lab_bundle.py` to copy the committed packed bundle, and build with `deathride/gradlew.bat -p deathride/tools/art/surface-lab :android:assembleDebug :desktop:installDist`. The generated material recipe is `fusion_lab_prepare.py`; rerunning it requires the local ignored source exports and will alter evidence if any input changes. Use modes `16,17` and reverse `17,16` with a fresh run name and an actually idle device window. Never replace `dev.deathride.tv`.

Committed fusion evidence uses APK version 4, four clean Stick runs and full-residency readback. `fusion_surface_review.py` validates local original PNG capture hashes and builds lossless portable WebP review assets. `fusion-costs.json` retains raw-result hashes and repeat ranges. `surface_validate.py --archived` validates earlier V3 results against `revisions/v3-3/SurfaceLab.java`, without pretending the newer APK produced them. The historical V3 production-budget illustration is not the new measured fusion allocation.
