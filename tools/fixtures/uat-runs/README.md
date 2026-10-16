# Frozen UAT run fixtures

Frozen copies of the five `2026-09-15-*` run directories (top-level files only), taken from `uat/runs` at main 414b1414.

- `tools/uat-ledger-test.cjs` and `tools/uat-recertify-test.cjs` read these instead of the live `uat/runs/` tree, so their exact counts (360 rows, 186 open, 36 pairs, 13 open rows for tomas-9 J4) hold whatever a later recert does to the live runs.
- They are fixtures and never get recertified. Both suites assert this directory is byte-identical at the end.
- A new recert must never be copied over them: that would change the pinned pre-recert state the cases prove against.
