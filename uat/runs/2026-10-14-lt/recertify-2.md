# Recertify — LT run 2026-10-14-lt

Rerun: `2026-10-14-lt/recert-2`: tomas-9 J1, J2, J3, J4. Only the pairs with open findings were rerun; each judge was shown that pair's open finding ids and answered each one.

**Level reached: LT only.** The skill keeps `resolved-verified` for live L2 evidence, so a finding the rerun no longer shows is `fixed` in `2026-10-14-lt/findings.json`, with `recertify_run` and `recertify_evidence`. Rerun finding ids are positional, so they are written `2026-10-14-lt/recert-2/<id>`.

## Fixed (LT evidence)

**The instrument changed between these runs (see Confounded below).** A gap not seen here may be the new engine, not a fix: read nothing below as a fix until L2 or a rerun on the same instrument shows it.

| Finding | Title | Rerun evidence | Run pair |
|---|---|---|---|
| LT-tomas-9-J3-1 | Moment teaches an unnecessary 'the' | Moments #4 and #9 teach "I'm building a house" / "I'm building", with no unnecessary "the"; "I like creeper" got no stop. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |

## Still open

| Finding | Status | Title | Rerun evidence | Run pair |
|---|---|---|---|---|
| LT-tomas-9-J2-1 | recurs (recurrence 2, as 2026-10-14-lt/recert-2/LT-tomas-9-J2-1) | Swap replaces the wrong topic; unwanted toy shop stays | #2-#4 swapping "What I did after school" three times left it in place; #6 agreed with it still listed. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J1-1 | recurs (recurrence 3, as 2026-10-14-lt/recert-2/LT-tomas-9-J1-1) | Check listening lines too long for a pre-A1 child | #7-#8 still ~22-word past-tense lines; 'Too hard, I only understood Minecraft and creeper.' | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J3-4 | recurs (recurrence 3, as 2026-10-14-lt/recert-2/LT-tomas-9-J3-2) | Missed gaps and no support for Czech answers | #6-#20: Czech and "nevím" turns such as "Dog je se mnou. Dog is... nevím." got no model sentence or coaching; coaching is null. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J4-3 | recurs (recurrence 3, as 2026-10-14-lt/recert-2/LT-tomas-9-J4-2) | Partner turns too long for A1 child | #21 'Ha, dogs are cute! Dogs can help you in Minecraft too. Four o'clock, OK?' and #20 two-clause turn with a present-tense question. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J4-4 | recurs (recurrence 3, as 2026-10-14-lt/recert-2/LT-tomas-9-J4-1) | Help loops without producing a sayable reply | #6-#9 quiz repeated, 'Now use the idea in your own reply on the phone.'; Pause & coach disabled until the first reply (#2-#10). | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J1-2 | recurs (recurrence 3, as 2026-10-14-lt/recert-2/LT-tomas-9-J1-3) | Grammar-form choice pairs reward guessing | #5-#6 'I want play Minecraft' vs 'Do you want...' and 'I am want play' vs 'I want to play'; verdict admits 'chosen from two options'. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| LT-tomas-9-J2-2 | not-evaluable | Check task wording too long for a 9-year-old | No check task is shown on screen in this journey; only the collapsed summary at #1. | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |

## Regressed

None.

## Metric deltas

Before is 2026-10-14-lt over the pairs the rerun ran.

| Metric | Before | After | Change | Run pair |
|---|---|---|---|---|
| placement exact | 1/1 (100%) | 0/1 (0%) | -100 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| judge agreement | 10/10 (100%) | 4/5 (80%) | -20 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| topic fit | 4/6 (67%) | 9/14 (64%) | -2 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| topic safe | 6/6 (100%) | 14/14 (100%) | 0 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| pitch at band | 8/14 (57%) | 14/30 (47%) | -10 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| moment precision | 1/3 (33%) | 3/3 (100%) | +67 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| moment recall | 3/8 (38%) | 3/22 (14%) | -24 pts | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
|---|---|---|
| the instrument changed: driver.linga-text.cjs d816aefada069afb -> 05229633e55bf1b7; driver.surface.cjs 3770da71ab606d17 -> 05535a9f66962fd0 | placement exact 1/1 (100%) -> 0/1 (0%), judge agreement 10/10 (100%) -> 4/5 (80%), topic fit 4/6 (67%) -> 9/14 (64%), topic safe 6/6 (100%) -> 14/14 (100%), pitch at band 8/14 (57%) -> 14/30 (47%), moment precision 1/3 (33%) -> 3/3 (100%), moment recall 3/8 (38%) -> 3/22 (14%) | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |

## New findings for the next drain

| Finding | Severity | Title | Run pair |
|---|---|---|---|
| 2026-10-14-lt/recert-2/LT-tomas-9-J1-2 | blocker · rank 18 | Verdict summary misdescribes the answer | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J3-1 | blocker · rank 18 | Partner English is above a pre-A1 nine-year-old | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J4-4 | blocker · rank 18 | Supported replies mis-recorded | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J1-4 | major · rank 12 | About-you questions too long for a child | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J2-2 | major · rank 12 | Past-simple and 'going to' topics above a near pre-A1 nine-year-old | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J3-4 | major · rank 12 | Conversation drags and loops for a nine-year-old | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J4-3 | major · rank 12 | Moment note uses grammar jargon | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J4-5 | major · rank 12 | Replay is repetition, not a fresh question | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J1-5 | minor · rank 6 | Next focus parrots Czech words | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J2-3 | minor · rank 6 | Plan text too long and school-flavoured for a 9-year-old reader | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J3-3 | minor · rank 6 | Second moment repeats the first | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
| 2026-10-14-lt/recert-2/LT-tomas-9-J3-6 | polish · rank 2 | Situation list includes grown-up situations for a 9-year-old | 2026-10-14-lt -> 2026-10-14-lt/recert-2 |
