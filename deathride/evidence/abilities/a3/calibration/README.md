# Calibration evidence

These are historical diagnostics, not the final accepted matrix. Raw CSVs are losslessly gzip-compressed; `archive-manifest.json` records raw and stored hashes. The auditor accepts `.csv` and `.csv.gz`. The A3 design note records the actual stat/ability candidates and the rejected results.

- `pilot`: 40 on/off races/cell on A2 runtime, before the Rookie Scrambler fix.
- `a2-full-partial`: initial 2,000-on/200-off run, stopped after Rookie and the first Club baseline cell. The old runner's working-directory mistake omitted data from its own fingerprint; A2 commit `8c93a16` identifies this runtime. It is not acceptance provenance.
- `patch-fix`: 200 on races/cell for Elite after separating Scrambler from Rookie's mine restriction.
- `needle-trial`, `needle-rebudget`, `needle-launch-trade`, `needle-speed-trade`, `line-launch-cost`: the named numeric candidates in the A3 trial table. Steel Flick's refined burst is common to these runs.
- `candidate-1`: interrupted initial full-endurance early probe; no completed raw cell and no result claim.
- `matrix-1`, `peer-matrix`: interrupted diagnostics, superseded before completing their requested matrix.
- `signed-seed-failure`: the first separate-seed acceptance attempt, invalidated by the AI lane remainder defect. Its divergent outcomes remain visible. It must not be combined with final rows.

The corrected lane pilot and the final fresh-seed run are separately named. Calibration thresholds were not relaxed. A diverse terminal hash is evidence of varied states, not proof that seed-dependent behavior is unbiased.
