# Recertify — LT run 2026-10-16-lt-placement-oos

Rerun: `2026-10-16-lt-placement-oos/recert-3`: hana-41 J1 · oksana-34 J1. Only the pairs with open findings were rerun; each judge was shown that pair's open finding ids and answered each one.

**Level reached: LT only.** The skill keeps `resolved-verified` for live L2 evidence, so a finding the rerun no longer shows is `fixed` in `2026-10-16-lt-placement-oos/findings.json`, with `recertify_run` and `recertify_evidence`. Rerun finding ids are positional, so they are written `2026-10-16-lt-placement-oos/recert-3/<id>`.

## Fixed (LT evidence)

| Finding | Title | Rerun evidence | Run pair |
|---|---|---|---|
| LT-oksana-34-J1-3 | Last two tasks near duplicates; judged inconsistently | #8 and #9 differ: new-job skill vs lost-parcel complaint; both graded differently (pass vs partial). | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |

## Still open

| Finding | Status | Title | Rerun evidence | Run pair |
|---|---|---|---|---|
| LT-oksana-34-J1-4 | recurs (recurrence 4, as 2026-10-16-lt-placement-oos/recert-3/LT-oksana-34-J1-4) | Interview tasks aren't real interview questions | #7 'Which impresses an employer more: a big problem fixed quickly, or a small one solved creatively?' is not a real interview question; #9 is a parcel complaint. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
| LT-hana-41-J1-2 | recurs (recurrence 4, as 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-3) | Confidence caveat is vague | #10 confidence is 'low' and the notes give no clear reason. The listen note says 'not enough English to show more than A2' beside a pass. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |

## Regressed

| Finding(s) | What | Run pair |
|---|---|---|
| 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-2, 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-3, 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-1 | hana-41 J1 verdict pass -> fail: D5 failed: #4 Q3 'Where did you study English?' repeats Q2, which feels templated. The #10 focus is a trivial slip. 'Correct throughout' for C1 is contradicted by 'partial'. The caveat is vague.; C4 failed: #10 summary names her 'But' and 'so' linking, which is specific. But the focus calls a 'then' slip a linking-word problem. It ignores the C1 task's 'partial' and her one-line listening answer. Confidence 'low' is not explained.; product changed in 10 of 105 files: desk/src/english/LingaPhone.tsx, desk/src/english/LingaTV.tsx, desk/src/lib/english/check.ts, desk/src/lib/english/conversation.ts, desk/src/lib/english/line.ts, desk/src/lib/english/placement.ts and 4 more | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |

## Metric deltas

Before is 2026-10-16-lt-placement-oos over the pairs the rerun ran.

| Metric | Before | After | Change | Run pair |
|---|---|---|---|---|
| placement exact | 1/2 (50%) | 2/2 (100%) | +50 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
| judge agreement | 7/10 (70%) | 8/10 (80%) | +10 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |

## Confounded - do not read as a regression

None.

## New findings for the next drain

| Finding | Severity | Title | Run pair |
|---|---|---|---|
| 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-2 | blocker · rank 18 | Question 3 repeats question 2 | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
| 2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-1 | major · rank 12 | Focus targets a trivial slip and mislabels it | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
| 2026-10-16-lt-placement-oos/recert-3/LT-oksana-34-J1-3 | major · rank 12 | B2 interview answer judged 'fail' and read as A2 | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
| 2026-10-16-lt-placement-oos/recert-3/LT-oksana-34-J1-5 | minor · rank 6 | Next focus is one trivial slip, not interview language | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-3 |
