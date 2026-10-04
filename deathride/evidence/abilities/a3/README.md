# A3 evidence

Final result: 66,000-race numeric acceptance and the 120/3/3 test build pass. The final 900-second Stick run fails the original frame-tail and zero-loss input gates (p95 20.914 ms, max 48.153 ms; five rejected packets). Memory/texture and all-class activation checks pass. See the A3 design note for the measured limits and H0-H3 handoff.

The final release is identified by `release-installed.json` and `manifest.json`. Only `dev.deathride.abilities` was installed. `build-tests.json` and `junit-results.zip` preserve the green build's test results. The A3 design note explains the protocol, rejected tuning, final results and remaining limits.

- `balance/`: final 0.5 m mine plus recovery-correction matrix, raw rows and independent audit. CSV archives are lossless gzip.
- `pre-n2-balance/`: completed 66,000-race matrix immediately before the owner-directed mine change; identical seed protocol for comparison.
- `n2-recovery-failure/`: complete first N2 matrix; strict audit found two stranded entrants in one Elite seed.
- `calibration/`: diagnostic and failed/interrupted balance runs. Do not combine them with acceptance rows.
- `controller-release/`: six layout/mirror checks against the final APK. Earlier controller folders are historical.
- `release-soak/`: final 15-minute performance/input run, without screen captures, with ordinary gun/mine/ability holds.
- `final-visual-soak/`: separate final-APK screen captures and observed mine/ability activity. Capture traffic is not the final performance run.
- `n2-visual-soak/` and `n2-before-recovery-soak/`: 0.5 m mine APK before the recovery correction.
- `release-visual-soak/`, `release-busy-host-soak/`, `pre-n2-isolated-soak/`: previous APK runs, retained with their input/frame failures and host conditions.
- `stick-soak.json.gz` and root-level `active-*.png`: initial A2 device run; its summary and archive metadata are separate. It is not final-APK acceptance.
- `candidate-inputs.json`: historical pre-N2 content hashes; `runtime-data.zip` and the final manifest identify final inputs.
- `logs/`: console output, normalized to UTF-8/LF for stable Git storage.

Raw device JSON files are losslessly compressed; adjacent archive metadata records raw/stored hashes. Rolling metric windows overlap, so their quantiles and counts are never added or averaged. Each completed report cell replays its first seed; the independent auditor separately checks raw slot facts, sample coverage and diversity. `audit-checks.json` records adversarial checks of that auditor.

Automated evidence does not establish human fairness, physical-phone comfort, sofa readability, optical latency or fun. N1's full HUD art restyle and owner-felt review remain future integration work.

Text reports and console logs normalize UTF-8/LF and trim trailing line whitespace and blank EOF lines for Git. Raw CSV and device JSON gzip archives remain byte-for-byte lossless. Archive manifests distinguish source/raw hashes from stored text hashes.
