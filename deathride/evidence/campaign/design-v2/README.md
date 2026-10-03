# Campaign design pass 2 evidence

Open the offline [owner review](../../../campaign/design-v2/index.html), or use the full file URL in the design status document.

## Provenance and scope

- `before/diagnosis.json`: retained consolidated release; both 2,000-career policies exactly reproduced before any production change. Replayed rows are not independent samples.
- `candidate-v1`: first complete redesigned campaign, before class ceilings. Preserve it as an intermediate result, not the final candidate.
- `dv2/ceiling-experiments`: calibration studies, legal-shop equivalence, and failed candidates. Rejected launch, synthetic-horizon and overlapping-build probes remain separate.
- `dv2/runtime-provenance`: frozen runtime digests and the final data snapshot. `final-runtime-audit.json` compares the executing final runtime with the compiled checkout byte for byte.
- `candidate-v5`: complete first bounded-class acceptance, including the developed-Line 56.11% failure.
- `after`: final ordinary library, boss supplement, 3,072 paired duels and two conditional 2,000-ledger policies. The final 8.125 Line ceiling recomputes 456 affected rows and explicitly retains unchanged v5 observations; `dv3/reuse-audit.json` proves the scope. Raw CSV bytes are retained as deterministic gzip with hashes in the archive indexes.
- `review-data.json`: final class winner shares, complete difficulty cross, timing-order controls, cohort censoring, cash and PR measurements.
- `review-browser`: static file-page browser checks and screenshots. Simulated review choices use an isolated temporary browser context and do not create an owner approval.

The ordinary career library has 7,488 rows plus 4,032 boss-supplement rows. Each ledger reuses held-out physical observations from a sparse library, three upgrade bands and a reference rival garage. Therefore 2,000 ledgers are not 2,000 independent full-physics campaigns. Fixed-Club opponents are retained for comparability; the separate difficulty cross varies actual opponents. Funded diagnostic garages are not earned careers.

## Reproduction entry points

From `deathride`, run `gradlew.bat :core:reportClasspath`, then `python -X utf8 tools/freeze-campaign-runtime.py <new-tag>`. Use that copied classpath for long runs. Report drivers refuse to overwrite physical diagnostic CSV files; use a new output tag for a new experiment.

- `dev.deathride.core.CampaignReportKt physical 4 <tag>` with `-DcampaignPhysicalSeedNamespace=103118209`.
- `dev.deathride.core.CampaignReportKt boss 16 <tag>` with the same physical namespace. The supplement uses samples 4 through 19.
- `dev.deathride.core.CampaignReportKt duel 512 <tag>` with `-DcampaignSeed=103090001`. Both lead slots and three decision proxies are crossed.
- After those complete: `dev.deathride.core.CampaignReportKt careers 2000 <tag>`, once with `-DcampaignBuyer=race` and once with `-DcampaignBuyer=pr`.
- `dev.deathride.core.CampaignReportKt verify 1 <tag>` on final compiled core: 34 exact event witnesses.
- `dev.deathride.core.CampaignDesignReportKt roster 334 <directory>` and `rotation 128 <directory>`, with `-DdesignSeedNamespace=103171119` for the v5 acceptance. Final Rookie acceptance uses `-DstudyTier=0` and `-DdesignSeedNamespace=103371557`; the unchanged other four tier pairs and stock homogeneous control are retained. The paired control uses 103070003. `dv3/control-reuse.json` records the assembly counts.
- `dev.deathride.core.CampaignDesignReportKt difficulty 32 <directory>` with `-DdesignSeedNamespace=103070003`, paired with the frozen baseline diagnostic adapter.
- `python -X utf8 -m unittest discover -s tools -p test_*metrics.py` and `python -X utf8 tools/campaign-v2-instrument-audit.py` demonstrate reachable alarms.
- The checked-in report generator names the retained run directories explicitly. Rehydrate the gzipped raw CSVs into those directories, or change its path constants when reproducing a new run. Run `tools/summarize-campaign.py` before `tools/campaign-v2-report.py`; then `node tools/campaign-v2-review-check.mjs`.

On PowerShell, quote Java system-property arguments containing dots, for example `'-Djava.util.concurrent.ForkJoinPool.common.parallelism=4'`. Run Gradle test tasks serially to avoid Windows test-output locking.

All Stick checks and human pacing, fairness and enjoyment judgments remain pending. No art was changed and nothing was pushed.


## Final limits and witnesses

The final physical tag is `design-v2-final-v6b`; probes are `design-v2-final-v6-probes`. The final frozen runtime is `candidate-v6-final`. `campaign-v2-runtime-audit.py` checks its complete recorded digests against current compiled classes/resources. Freeze commit IDs are source-base IDs before the wave commit; byte manifests identify the executed build.

The owner recommendation is now **4-6 typical hours**, superseding the earlier 3-5 proposal, and is explicitly flagged against the old 5-8-hour target. Campaign censoring, three proposed ratio misses, the Frostline recovery jam and the long-straight all-resolved failure remain open. See the DV3 note; this packet is not a release acceptance.

`tools/CampaignTimeoutWitness.java` and `tools/RosterTimeoutWitness.java` compile with the report classpath into a separate build directory. They first assert the exact accepted hash, then extend time only for diagnosis. Neither extension replaces an accepted row or changes a game limit. `dv3/timeout-witness.json` and `dv3/roster-timeout-witness.json` retain the distinction. The former stays stuck; the latter two cars finish around 393 seconds.
