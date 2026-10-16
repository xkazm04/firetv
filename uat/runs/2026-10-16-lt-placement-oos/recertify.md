# Recertify — LT run 2026-10-16-lt-placement-oos

Rerun: `2026-10-16-lt-placement-oos/recert-1`: hana-41 J1 · oksana-34 J1 · sofie-11 J1. Only the pairs with open findings were rerun; each judge was shown that pair's open finding ids and answered each one.

**Level reached: LT only.** The skill keeps `resolved-verified` for live L2 evidence, so a finding the rerun no longer shows is `fixed` in `2026-10-16-lt-placement-oos/findings.json`, with `recertify_run` and `recertify_evidence`. Rerun finding ids are positional, so they are written `2026-10-16-lt-placement-oos/recert-1/<id>`.

## Fixed (LT evidence)

| Finding | Title | Rerun evidence | Run pair |
|---|---|---|---|
| LT-oksana-34-J1-2 | Verdict B2 is generous; corrections thin | #9 band B1 = trueBand, with three slips listed; no generous B2 this time. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-sofie-11-J1-1 | B1 placement is generous for an A2 child | #10 placement is A2 exact. The text says 'B1 was close, but a harder task fell short', so the B1 over-placement did not happen. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-sofie-11-J1-2 | B2 task marked fail while the note praises the answer | #10 task 5 is 'not yet' and the note names the gap: 'Verb forms held it back'. Praise and gap both appear, and the note matches the verdict. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-sofie-11-J1-3 | Next focus names articles only and skips past tense | #10 focus is 'Practise verb endings: "take long time" becomes "takes a long time"', which matches her actual slips. Past tense was not elicited in these tasks. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-sofie-11-J1-4 | Task 1 and task 2 are the same prompt | #5 'play Roblox' and #6 'What are you doing on Saturday?' are different prompts. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |

## Still open

| Finding | Status | Title | Rerun evidence | Run pair |
|---|---|---|---|---|
| LT-oksana-34-J1-3 | recurs (recurrence 2, as 2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-2) | Last two tasks near duplicates; judged inconsistently | #7 and #8 are near-duplicate app-versus-phone tasks, both graded partial for 'responsible about'. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-oksana-34-J1-4 | recurs (recurrence 2, as 2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-1) | Interview tasks aren't real interview questions | #5-#8 contain no real interview question despite her stating one in #4. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-hana-41-J1-1 | recurs (recurrence 2, as 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-1) | B2 task graded 'fail' where partial fits | #10: task 4 'not yet' with 'Your English read as A2 here' beside a note 'You answered the question and gave a reason', while task 3 with similar slips got 'nearly there'. | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| LT-hana-41-J1-2 | recurs (recurrence 2, as 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-2) | Confidence caveat is vague | #10: 'Only a few strong answers showed this level, so it may be a little off.' | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |

## Regressed

| Finding(s) | What | Run pair |
|---|---|---|
| 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-1, 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-2, 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-3 | hana-41 J1 verdict pass -> fail: D5 failed: #10 summary is specific, but the focus 'what the real number is' is a single narrow fix, and the task 4 note ('A2 here', 'not yet') felt harsh and inconsistent beside the praise; the caveat 'may be a little off' is vague.; product changed in 8 of 105 files: desk/src/english/LingaPhone.tsx, desk/src/english/LingaTV.tsx, desk/src/lib/english/check.ts, desk/src/lib/english/conversation.ts, desk/src/lib/english/line.ts, desk/src/lib/english/placement.ts and 2 more | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |

## Metric deltas

Before is 2026-10-16-lt-placement-oos over the pairs the rerun ran.

| Metric | Before | After | Change | Run pair |
|---|---|---|---|---|
| placement exact | 1/3 (33%) | 3/3 (100%) | +67 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| judge agreement | 11/15 (73%) | 12/14 (86%) | +12 pts | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |

## Confounded - do not read as a regression

None.

## New findings for the next drain

| Finding | Severity | Title | Run pair |
|---|---|---|---|
| 2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-3 | blocker · rank 18 | TV headline shows her error as 'Your words' | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| 2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-3 | minor · rank 6 | Next focus is narrow and one-sided | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| 2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-3 | minor · rank 6 | Summary and focus are thin | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| 2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-4 | minor · rank 6 | Verdict text is long and abstract for an 11-year-old | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
| 2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-5 | polish · rank 2 | B2 task 5 marked fail though the answer is partial | 2026-10-16-lt-placement-oos -> 2026-10-16-lt-placement-oos/recert-1 |
