# Z2 decision evidence

`first-tests.log` is an intentionally stopped regression run after known targeting-fixture failures. `first-thread.txt` records its actual worker in the ordinary paired-race matrix, not a deadlock. `controlled-tests.log` and `controlled-tests-2.log` retain the new fixture failures. `controlled-tests-3.log` passes the final AI and World tests, including measured active hunting/weakness allocation and both mine-recovery controls.

`release/check-0.log` is the first complete release attempt: 176/177 core tests passed, with the remaining old seed assertion requiring recovery even though the new behavior avoided the jam. The corrected test keeps the legacy recovery assertion and requires all six entrants to resolve under both controls: 51.433 s with legacy recovery, 47.817 s with new behavior and no recovery needed. Neither watchdog nor finish requirement changed.

`release-final/` contains the final required Gradle and browser gate. Its `passed.json`, when present, identifies the commands and suite counts; an absent pass file means the wrapper has not passed.

The runtime AI trace is a fixed 1,024-row ring of 16 integers per decision: tick, car, mode, role, phase, position, visible bit mask, candidate bit mask, target, reason, commitment end tick, weakness row index, tactic, hunt intent, score margin times 10,000, active attackers on target. Modes/roles/reasons/tactics use the explicitly declared enum order in `AiBehaviour.kt`; a negative target/weakness means none. Per-event headless trace exports retain the tail only. Cumulative counters and raw physical outcomes are exported separately in Z3. Debug traffic JSON is serialized outside the fixed step and has no HUD consumer.
