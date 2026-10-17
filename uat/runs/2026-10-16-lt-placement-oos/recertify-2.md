# Recertify — LT run 2026-10-16-lt-placement-oos

Rerun: `2026-10-16-lt-placement-oos/recert-2`: hana-41 J1 · oksana-34 J1. Only the pairs with open findings were rerun; each judge was shown that pair's open finding ids and answered each one.

**Level reached: LT only.** The skill keeps `resolved-verified` for live L2 evidence, so a finding the rerun no longer shows is `fixed` in `2026-10-16-lt-placement-oos/findings.json`, with `recertify_run` and `recertify_evidence`. Rerun finding ids are positional, so they are written `2026-10-16-lt-placement-oos/recert-2/<id>`.

## Fixed (LT evidence)

| Finding | Title | Rerun evidence | Run pair |
|---|---|---|---|
| LT-hana-41-J1-1 | B2 task graded 'fail' where partial fits | #9 both B2 tasks got 'partial' with notes matching the verdict; no fail beside praise. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |

## Still open

| Finding | Status | Title | Rerun evidence | Run pair |
|---|---|---|---|---|
| LT-oksana-34-J1-3 | recurs (recurrence 3, as 2026-10-16-lt-placement-oos/recert-2/LT-oksana-34-J1-4) | Last two tasks near duplicates; judged inconsistently | #8 and #9 are both carrier-call 'Say it' tasks, and #10 says 'Idioms would add range' while both were judged partial or nearly there. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |
| LT-oksana-34-J1-4 | recurs (recurrence 3, as 2026-10-16-lt-placement-oos/recert-2/LT-oksana-34-J1-1) | Interview tasks aren't real interview questions | #5-#9 contain no interview question, even though #4 asked for 'problem which I solved'. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |
| LT-hana-41-J1-2 | recurs (recurrence 3, as 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-3) | Confidence caveat is vague | #9 caveat 'Your B2 answers were close, but none was strong' remains vague; confidence low. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |

## Regressed

| Finding(s) | What | Run pair |
|---|---|---|
| 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-1, 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-3, 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-2 | hana-41 J1 verdict pass -> fail: D5 failed: #9 'Fixing small grammar will help you speak more easily in meetings' is template-like, and the focus is a trivial phrase; the Q3 goal about emails was ignored.; C4 failed: #9 summary is semi-specific ('why daily chats help you practise') but the focus 'I have not so much time' is a minor slip and 'Fixing small grammar' is generic; no mention of her emails/presentation goals from Q3.; product changed in 10 of 105 files: desk/src/english/LingaPhone.tsx, desk/src/english/LingaTV.tsx, desk/src/lib/english/check.ts, desk/src/lib/english/conversation.ts, desk/src/lib/english/line.ts, desk/src/lib/english/placement.ts and 4 more | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |

## Metric deltas

Before is 2026-10-16-lt-placement-oos over the pairs the rerun ran.

| Metric | Before | After | Change | Run pair |
|---|---|---|---|---|
| placement exact | 1/2 (50%) | 2/2 (100%) | +50 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |
| judge agreement | 7/10 (70%) | 8/9 (89%) | +19 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |

## Confounded - do not read as a regression

None.

## New findings for the next drain

| Finding | Severity | Title | Run pair |
|---|---|---|---|
| 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-1 | major · rank 12 | Next focus is a trivial phrase, not the real pattern | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |
| 2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-2 | minor · rank 6 | Task 4 judged partial for a small slip | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-2 |
