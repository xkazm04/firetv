# G2 evidence

Final gates: `owner-approved-build.log`, `commit-build.log`, `final-ui-build.log`, `tests.json`, `content.json`, `candidate-contract.log`, `candidate-lab.log`, `browser-candidates.log`, `browser-tracks/`, `active-bundle.json`, `legacy-bundle.json`. Earlier logs retain development failures and are superseded by the final passing gates.

`render.json` identifies the shipping-renderer capture hashes, fixed course/simulation and active-art residency. `ui/result.json` covers the five actual division menus and zero profile writes. These are **desktop GL** evidence. `stick-status.json` records a read-only 254-host scan and busy device. There is **no measured Stick frame-time delta**. `apk-identity.txt` verifies the isolated package; the APK was not installed.

Reproduce from `deathride/` in PowerShell:

```powershell
.\gradlew.bat :core:test :link:test :game:test :app:assembleDebug '-PappId=dev.deathride.regions' '-PappLabel=Death Ride Regions' '-PracePort=8780'
python tools/regions_export.py --check
python tools/regions_validate.py
node tools/tracks-candidate-contract.mjs
node tools/tracks-candidates-browser-check.mjs
.\gradlew.bat :desktop:run '--args=--hidden --region-check --1080'
.\gradlew.bat :desktop:run '--args=--hidden --region-ui-check --1080'
```

Do not run concurrent Gradle test tasks against this worktree's Windows test-output files. The Track Lab browser integration needs the existing native Lab server; see the R3 tools. `tools/regions_stick_check.py` performs only discovery and foreground inspection; it never installs, launches or force-stops an app.

The final owner-approved capture set uses kept `scrap-1-c` and supersedes the earlier development renders of `scrap-1-a`. Ground variants carry Keep from the 2026-10-04 owner record; missing generated art and new runtime/Stick acceptance remain separate gates.
