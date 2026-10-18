# Open LT findings

Derived from every run under uat/runs/ by uat/driver/ledger.cjs (`node uat/driver/linga-text.cjs --status`), rewritten after every ledger recertify. Do not edit: the findings.json of each run is the record. Ids are run-qualified, `<run>/<id>`, since a finding id is positional within its run. One section per module that has open rows.

296 open across 13 runs
drained 9 of 13 runs
undrained: 2026-10-14-lt, 2026-10-16-lt-a2b1-tightening, 2026-10-17-lt-swap, 2026-10-17-lt-swap-2 (home: docs/uat-insights/<run-id>.md, uat/README.md)

# Linga

234 open in 40 pairs across 26 runs
234 open: 57 seen on the current product, 177 seen before a product change

recurring 127 · unasked by a later run of their pair 22

Next: `node uat/driver/linga-text.cjs --recertify` reruns every pair below; each judge answers all of its pair's open rows, and each answer is stamped into the run that owns the row.

## petra-38 J2 · 8 open · top rank 27

- `2026-10-14-lt/LT-petra-38-J2-1` blocker · rank 27 · Swap replaces the wrong topic · product: 54 of 93 files changed since
- `2026-09-15-lt-recert/LT-petra-38-J2-2` blocker · rank 18 · Swaps recycle rejected scenarios · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/LT-petra-38-J2-2` major · rank 12 · Swaps bring near-duplicates and off-brief topics · product: 54 of 93 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J2-3` major · rank 12 · Plan build failed on the first try · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J2-1` major · rank 9 · Swap never exercised; plan still grows past six · recurrence 3, first seen 2026-10-17-lt-swap-2 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J2-2` major · rank 9 · Skill labels do not describe the situation · recurrence 3, first seen 2026-10-17-lt-swap-2 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J2-2` minor · rank 6 · Adding grows plan from 5 to 6; skill labels mismatch · recurrence 3, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J2-3` minor · rank 6 · Swap not exercised · recurrence 3, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since

## viktor-67 J2 · 7 open · top rank 27

- `2026-09-15-lt-recert/LT-viktor-67-J2-2` blocker · rank 27 · Seven swaps keep returning unwanted transactions · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/LT-viktor-67-J2-1` blocker · rank 27 · Swap replaces the wrong topic · product: 54 of 93 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J2-3` blocker · rank 18 · Jargon and above-A1 labels in the plan · recurrence 2, first seen 2026-09-15-lt · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-viktor-67-J2-3` major · rank 12 · Jargon and above-A1 wording in topic goals · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J2-4` major · rank 12 · Add-topic needs typing; no voice or tap route · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-viktor-67-J2-4` major · rank 12 · Swap and own-topic never exercised · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J2-5` minor · rank 6 · Swap not exercised; plan grew from six to seven · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since

## viktor-67 J3 · 7 open · top rank 27

- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-1` blocker · rank 27 · Repeated Czech requests do not produce understandable explanations · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J3-3` minor · rank 6 · "I have garden" on the first reply got no stop and no recap line · recurrence 4, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J3-4` minor · rank 6 · Mission closes after six replies, not about eight · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-5
- `2026-09-15-lt-recert/LT-viktor-67-J3-2` minor · rank 6 · One clarification remains too difficult · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt/LT-viktor-67-J3-2` minor · rank 6 · A Czech vocabulary question requires a second request · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J3-6` polish · rank 2 · Plural correction of 'My apple is red' is arguable · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J3-5` polish · rank 2 · Recap model sentence differs from what he said again

## adela-17 J1 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J1-1` blocker · rank 27 · 'eventually' misused for 'possibly' not flagged, and praised · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-1 · product: 9 of 105 files changed since
- `2026-10-14-lt/recert-5/LT-adela-17-J1-2` blocker · rank 18 · Her direct question 'Was that correct?' is never answered · recurrence 2, first seen 2026-09-15-lt · product: 32 of 105 files changed since
- `2026-10-14-lt/recert-6/LT-adela-17-J1-1` blocker · rank 18 · Headline correction 'similar to some episodes' is wrong in meaning · product: 32 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J1-2` major · rank 12 · "for their own choice" slip missed · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J1-2` major · rank 12 · Held-back reasons for C2 tasks are dubious or vague · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J1-3` minor · rank 6 · Next focus tells a speaker to 'say it out loud' and cites writing she never showed · product: 9 of 105 files changed since

## adela-17 J2 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J2-1` blocker · rank 27 · Proposed and replacement topics are mostly transactional, not exam discussion · recurrence 6, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J2-2` blocker · rank 18 · No mock interview or technology/education topic proposed · recurrence 6, first seen 2026-09-15-lt-recert2-goal · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-adela-17-J2-1` blocker · rank 18 · Initial plan is mostly everyday/transactional, not B2 exam discussion · recurrence 4, first seen 2026-09-15-lt-recert · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-adela-17-J2-3` major · rank 12 · Added topic appended last with a generic skill label · recurrence 3, first seen 2026-10-17-lt-swap · product: 9 of 105 files changed since
- `2026-10-14-lt/recert-5/LT-adela-17-J2-5` major · rank 12 · Her direct question 'Was that correct?' not answered plainly · product: 32 of 105 files changed since
- `2026-10-17-lt-swap/LT-adela-17-J2-2` minor · rank 6 · Two of seven topics are not exam discussion · recurrence 3, first seen 2026-10-17-lt-swap · product: 9 of 105 files changed since

## adela-17 J4 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J4-3` blocker · rank 27 · Supported/independent counts are wrong; reply 3 flagged as helped · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-1` blocker · rank 18 · Cue only simplifies the question; quiz is about a different prompt · recurrence 9, first seen 2026-10-14-lt
- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J4-1` blocker · rank 18 · Cue gives a simplified question and a gloss; the B2 frame came on the third press · recurrence 8, first seen 2026-09-15-lt-recert
- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J4-2` blocker · rank 18 · Partner drifts off the careers brief into personal social-media questions and gives generic praise · recurrence 3, first seen 2026-10-17-lt-swap-2/recert-2
- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J4-4` major · rank 8 · No coach note or replay of the stuck moment
- `2026-10-17-lt-swap-2/recert-4/LT-adela-17-J4-5` minor · rank 6 · Rule given is thin for an exam learner · product: 1 of 105 files changed since

## ondrej-16 J1 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J1-1` blocker · rank 27 · B1 connected answer marked partial, level pushed to A2 · recurrence 2, first seen 2026-09-15-lt-j1b · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J1-2` blocker · rank 18 · Next focus ignores the repeated error · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J1-3` major · rank 12 · Summary generic and mismatched to level · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J1-4` major · rank 9 · Easy choice tasks low-information · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-09-15-lt/LT-ondrej-16-J1-3` major · rank 9 · Repeated clear errors yield no useful feedback · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt/LT-ondrej-16-J1-2` minor · rank 6 · The mission stays elementary after he engages · product: 24 of 25 files changed since · 81 paths held by one side only

## petra-38 J4 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-1` blocker · rank 27 · Cue shows the same irrelevant line for every question · recurrence 3, first seen 2026-10-17-lt-swap-2/recert-2
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-3` blocker · rank 18 · Moment screen gives only Back, no retry of the fix · recurrence 5, first seen 2026-09-15-lt
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-2` blocker · rank 18 · Replay question is a rephrase, not a fresh question practising the coaching
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-4` major · rank 12 · Coach quotes an earlier turn, not where she was stuck · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-4/LT-petra-38-J4-6` minor · rank 6 · Moment screen offers no fresh-question replay · recurrence 6, first seen 2026-10-14-lt
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J4-5` minor · rank 6 · Clear learner errors got no moment

## tomas-9 J1 · 6 open · top rank 27

- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J1-3` blocker · rank 27 · Feedback frames skip and one-word answers as shortfall · recurrence 4, first seen 2026-10-14-lt/recert-5 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J1-4` blocker · rank 18 · About-you questions long and about learning history · recurrence 6, first seen 2026-10-14-lt/recert-2 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J1-1` blocker · rank 18 · About-you questions long and abstract for a 9-year-old · recurrence 6, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J1-2` blocker · rank 18 · Listening line too long and fast · recurrence 6, first seen 2026-09-15-lt-j1b · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J1-4` major · rank 12 · A2 rests on guessable two-option choices · recurrence 3, first seen 2026-10-14-lt/recert-6 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J1-5` major · rank 12 · Summary and focus generic, miss what he said · product: 9 of 105 files changed since

## martin-45 J2 · 5 open · top rank 27

- `2026-10-14-lt/recert-5/LT-martin-45-J2-1` blocker · rank 27 · Swap button does nothing; unwanted topic stays and is agreed · recurrence 4, first seen 2026-10-14-lt · product: 32 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J2-5` major · rank 12 · Swap not exercised in this run · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J2-3` minor · rank 6 · Plan grows from 6 to 7 without explanation · recurrence 5, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-5/LT-martin-45-J2-4` minor · rank 4 · 'team have' corrected to 'team has' as an error · product: 32 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J2-4` minor · rank 4 · Doubtful correction 'the customer trust' · product: 14 of 105 files changed since

## oksana-34 J3 · 5 open · top rank 27

- `2026-10-17-lt-swap-2/recert-6/LT-oksana-34-J3-1` blocker · rank 27 · Interviewer calls the candidate 'Priya', the interviewer's own name
- `2026-10-17-lt-swap-2/recert-6/LT-oksana-34-J3-2` blocker · rank 18 · Key B1 errors 'responsible about' and 'I work' never coached · recurrence 5, first seen 2026-10-14-lt
- `2026-10-17-lt-swap-2/recert-6/LT-oksana-34-J3-4` blocker · rank 18 · Recap has no interview phrases to keep; the mission line is generic · recurrence 5, first seen 2026-10-14-lt/recert-1
- `2026-10-17-lt-swap-2/recert-6/LT-oksana-34-J3-3` major · rank 12 · 'Mission done' appears while the interviewer is still asking, and a question repeats · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-4/LT-oksana-34-J3-4` major · rank 9 · 'Mission done' banner appears from #10 while interviewer keeps asking · recurrence 5, first seen 2026-10-14-lt/recert-3

## jana-29 J1 · 4 open · top rank 27

- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J1-1` blocker · rank 27 · Next focus is a synonym swap, not a slip · recurrence 4, first seen 2026-10-14-lt · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J1-2` blocker · rank 18 · Per-task notes are generic praise · recurrence 3, first seen 2026-10-14-lt/recert-3 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J1-3` major · rank 12 · C2 tasks passed easily · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J1-4` major · rank 9 · Starter situations are half irrelevant · recurrence 3, first seen 2026-09-15-lt · product: 9 of 105 files changed since

## martin-45 J3 · 4 open · top rank 27

- `2026-10-17-lt-swap-2/recert-6/LT-martin-45-J3-2` blocker · rank 27 · B1 level shown without any evidence · recurrence 5, first seen 2026-10-14-lt/recert-6
- `2026-10-17-lt-swap-2/recert-6/LT-martin-45-J3-3` major · rank 12 · Stops dense, each with a retry loop · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-6/LT-martin-45-J3-4` major · rank 12 · 'Customer don't accept' went uncorrected
- `2026-10-17-lt-swap-2/recert-6/LT-martin-45-J3-5` polish · rank 2 · Retry marked 'You fixed' while the slip stayed partly wrong

## adela-17 J3 · 3 open · top rank 27

- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J3-1` blocker · rank 27 · Fix for 'interested about' changes the sentence and gives no rule
- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J3-2` major · rank 12 · False friend 'eventually' not noted · recurrence 3, first seen 2026-10-17-lt-swap-2/recert-3
- `2026-10-17-lt-swap-2/recert-6/LT-adela-17-J3-3` major · rank 12 · Partner corrects in the scene and uses generic praise · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4

## klara-13 J3 · 14 open · top rank 18

- `2026-10-14-lt/recert-1/LT-klara-13-J3-2` blocker · rank 18 · Mission declared done after 3 replies; recap never reached · recurrence 2, first seen 2026-10-14-lt · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J3-2` blocker · rank 18 · Repeated missing-'it' error not caught after being named · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-1/LT-klara-13-J3-5` major · rank 12 · Partner repeats and ignores her question · recurrence 2, first seen 2026-10-14-lt · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J3-1` major · rank 12 · Fourth moment gives an unnatural, wrong model sentence · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J3-3` major · rank 12 · Each moment takes about 3 steps and the scene stops · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J3-4` major · rank 12 · No natural end or recap in a long conversation · product: 34 of 105 files changed since
- `2026-09-15-lt/LT-klara-13-J3-1` major · rank 9 · The later conversation exceeds her A2 band · unasked since 2026-09-15-lt-recert (5 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-3/LT-klara-13-J3-5` minor · rank 6 · Level shown as B1 for an A2 learner · recurrence 3, first seen 2026-10-14-lt · product: 34 of 105 files changed since
- `2026-09-15-lt/LT-klara-13-J3-3` minor · rank 6 · The recap records activity without consolidating learning · unasked since 2026-09-15-lt-recert (5 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt-recert/LT-klara-13-J3-1` minor · rank 6 · The recap records counts without consolidating learning · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt-recert2-beginners/LT-klara-13-J3-1` minor · rank 6 · The recap counts learning without reviewing it · unasked since 2026-10-14-lt (3 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-1/LT-klara-13-J3-4` minor · rank 6 · Missed clear errors after the first moment · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair) · product: 34 of 105 files changed since
- `2026-09-15-lt-recert/LT-klara-13-J3-2` minor · rank 3 · Correction density exceeds the rubric's target · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt-recert2-beginners/LT-klara-13-J3-2` minor · rank 3 · One question stretches beyond supportive A2 · unasked since 2026-10-14-lt (3 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only

## klara-13 J1 · 10 open · top rank 18

- `2026-10-14-lt/recert-1/LT-klara-13-J1-2` blocker · rank 18 · Headline band and 'wrote A2' disagree on the verdict screen · unasked since 2026-10-14-lt/recert-3 (2 later runs of this pair) · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J1-1` major · rank 12 · B1 placement slightly generous again · recurrence 3, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair) · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J1-3` major · rank 12 · Verdict focus quotes a phrase she never typed as a single error · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair) · product: 34 of 105 files changed since
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-2` major · rank 12 · Verdict hedges: 'What you said at the start pointed elsewhere' · product: 34 of 105 files changed since
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-4` major · rank 12 · Her erroneous sentence shown on the family TV · product: 34 of 105 files changed since
- `2026-09-15-lt/LT-klara-13-J1-2` minor · rank 6 · The next focus misidentifies her missing word · unasked since 2026-10-14-lt (4 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt/LT-klara-13-J1-3` minor · rank 6 · B2 failure has an overly narrow explanation · unasked since 2026-10-14-lt (4 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-1/LT-klara-13-J1-3` minor · rank 6 · Task 3 note is muddled · unasked since 2026-10-14-lt/recert-3 (2 later runs of this pair) · product: 34 of 105 files changed since
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-3` minor · rank 4 · B1 slightly generous given repeated missing subjects · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J1-2` polish · rank 2 · Listen task answered with a mishearing, still passed · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair) · product: 34 of 105 files changed since

## oksana-34 J1 · 10 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J1-2` blocker · rank 18 · Check tasks are generic workplace, not interview · recurrence 5, first seen 2026-10-16-lt-placement-oos · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J1-1` blocker · rank 18 · Next focus is one trivial slip, not interview language · recurrence 3, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-oksana-34-J1-3` major · rank 9 · Next focus is a single phrase, not tied to interview goal · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-09-15-lt/LT-oksana-34-J1-2` major · rank 9 · Clear interview-language errors receive no coaching · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-3/LT-oksana-34-J1-2` minor · rank 6 · Task 5 verdict 'partial' at C1 is lenient · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-3` minor · rank 6 · Summary and focus are thin · recurrence 2, first seen 2026-10-16-lt-placement-oos/recert-1 · product: 14 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-3/LT-oksana-34-J1-5` minor · rank 6 · Next focus is one trivial slip, not interview language · recurrence 2, first seen 2026-10-16-lt-placement-oos/recert-3 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J1-3` minor · rank 6 · C1 partial and slips noticed only partially · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-09-15-lt/LT-oksana-34-J1-3` minor · rank 6 · Follow-up questions keep extending one scenario · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-16-lt-placement-oos/recert-2/LT-oksana-34-J1-4` polish · rank 2 · Last tasks overlap, and the grading is lenient · recurrence 4, first seen 2026-10-16-lt-placement-oos · product: 14 of 105 files changed since

## tomas-9 J2 · 9 open · top rank 18

- `2026-10-14-lt/recert-5/LT-tomas-9-J2-1` blocker · rank 18 · Abstract skill labels and long why lines for a 9-year-old · recurrence 6, first seen 2026-09-15-lt-recert · product: 9 of 105 files changed since
- `2026-10-14-lt/recert-6/LT-tomas-9-J2-2` blocker · rank 18 · Abstract skill labels for a 9-year-old · recurrence 6, first seen 2026-09-15-lt-recert2-goal · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J2-1` blocker · rank 18 · Abstract skill labels and long why lines for a 9-year-old · recurrence 6, first seen 2026-10-14-lt/recert-2 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J2-1` blocker · rank 18 · Abstract skill labels and long why lines for a 9-year-old · recurrence 6, first seen 2026-09-15-lt · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J2-2` blocker · rank 18 · Default six include shopping and a decline topic for a child who wants games · recurrence 3, first seen 2026-10-14-lt/recert-6 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J2-2` blocker · rank 18 · Shopping topic proposed again to a child who wants games · recurrence 3, first seen 2026-10-17-lt-swap-2 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J2-3` major · rank 12 · Goals demand past tense beyond like/is · recurrence 6, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap/LT-tomas-9-J2-4` major · rank 12 · Why-lines and screen text too long for a 9-year-old · recurrence 3, first seen 2026-10-17-lt-swap · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-tomas-9-J2-4` minor · rank 6 · Goals use grammar jargon beyond like/is · recurrence 6, first seen 2026-10-14-lt/recert-2 · product: 9 of 105 files changed since

## tomas-9 J4 · 9 open · top rank 18

- `2026-10-17-lt-swap-2/recert-2/LT-tomas-9-J4-1` blocker · rank 18 · No fresh question after the moment · recurrence 9, first seen 2026-09-15-lt
- `2026-10-17-lt-swap-2/recert-3/LT-tomas-9-J4-1` blocker · rank 18 · No replay with a fresh question after the moment · recurrence 9, first seen 2026-09-15-lt-recert
- `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J4-2` blocker · rank 18 · No replay with a fresh question after the moment · recurrence 9, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-5` blocker · rank 18 · Situation list long and mixed · recurrence 9, first seen 2026-09-15-lt
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-1` blocker · rank 18 · No fresh question after the moment · recurrence 8, first seen 2026-10-14-lt/recert-2
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-2` blocker · rank 18 · Cue is generic and repeated · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-3` blocker · rank 18 · Supported flag inconsistent
- `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J4-3` major · rank 12 · Partner turns drift above A1 · recurrence 9, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J4-4` minor · rank 6 · Grammar note too abstract and fix changes sentence

## ondrej-16 J5 · 8 open · top rank 18

- `2026-09-15-lt-recert/LT-ondrej-16-J5-3` blocker · rank 18 · Accurate corrections interrupt too often · recurrence 2, first seen 2026-09-15-lt-recert · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J5-3` major · rank 12 · 'more better' and 'party with alcohol' phrasing got no coaching · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J5-2` major · rank 12 · Redirect is vague and steps out of the scene · recurrence 2, first seen 2026-09-15-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J5-4` minor · rank 6 · 'Mission done' shown while the scene continues · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-1/LT-ondrej-16-J5-5` minor · rank 6 · Refusals are curt and give him nothing to push on · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-09-15-lt-recert/LT-ondrej-16-J5-4` minor · rank 6 · The initial topic selection only partly earns his interest · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J5-5` minor · rank 6 · Partner pitched at A2 and stays simple for a B1 speaker · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-ondrej-16-J5-5` polish · rank 2 · Fix accepted though the retry carried injected text · product: 34 of 105 files changed since

## viktor-67 J4 · 8 open · top rank 18

- `2026-10-17-lt-swap-2/recert-4/LT-viktor-67-J4-1` blocker · rank 18 · Phrase quiz shows a line Leo never said · recurrence 6, first seen 2026-10-14-lt
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-1` blocker · rank 18 · Replay hands back the model, no fresh question · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-2` blocker · rank 18 · Phrase quiz asks a question Leo never asked · recurrence 3, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-3` blocker · rank 18 · Help button repeats the same cue · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-4/LT-viktor-67-J4-2` blocker · rank 18 · No coaching or moment after a supported scene · product: 1 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J4-3` major · rank 12 · Phrase quiz mismatches the scene · recurrence 3, first seen 2026-10-17-lt-swap-2/recert-1
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-4` minor · rank 6 · Clear A1 errors got no moment, only an article fix · recurrence 6, first seen 2026-10-14-lt
- `2026-10-17-lt-swap-2/recert-6/LT-viktor-67-J4-5` minor · rank 6 · Past-tense question above his band

## hana-41 J1 · 7 open · top rank 18

- `2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-2` blocker · rank 18 · Question 3 repeats question 2 · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-3` major · rank 12 · Confidence caveat and task notes are vague or contradictory · recurrence 4, first seen 2026-10-16-lt-placement-oos · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-1` major · rank 12 · B2 task graded fail where partial fits · recurrence 2, first seen 2026-10-16-lt-placement-oos · unasked since 2026-10-16-lt-placement-oos/recert-3 (1 later run of this pair) · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-1` major · rank 12 · Next focus is a trivial phrase, not the real pattern · unasked since 2026-10-16-lt-placement-oos/recert-3 (1 later run of this pair) · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-3/LT-hana-41-J1-1` major · rank 12 · Focus targets a trivial slip and mislabels it · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-3` minor · rank 6 · Next focus is narrow and one-sided · unasked since 2026-10-16-lt-placement-oos/recert-2 (2 later runs of this pair) · product: 32 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-2/LT-hana-41-J1-2` minor · rank 6 · Task 4 judged partial for a small slip · unasked since 2026-10-16-lt-placement-oos/recert-3 (1 later run of this pair) · product: 32 of 105 files changed since

## klara-13 J2 · 7 open · top rank 18

- `2026-09-15-lt-recert/LT-klara-13-J2-1` blocker · rank 18 · Topic selection remains too generic and sometimes childish · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-3/LT-klara-13-J2-4` major · rank 12 · Placed B1 although typed errors suggest A2 · recurrence 3, first seen 2026-10-14-lt · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-1/LT-klara-13-J2-4` major · rank 12 · Level shown differently on TV and phone · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair) · product: 34 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-klara-13-J2-3` minor · rank 6 · Swap never exercised again · recurrence 3, first seen 2026-10-14-lt · product: 34 of 105 files changed since
- `2026-09-15-lt-recert2-goal/LT-klara-13-J2-3` minor · rank 6 · The recorded preview does not establish full-plan visibility · unasked since 2026-10-14-lt (3 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt/LT-klara-13-J2-4` minor · rank 3 · Dance activities are a weaker interest match · unasked since 2026-09-15-lt-recert (5 later runs of this pair) · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-3/LT-klara-13-J2-5` polish · rank 2 · Added topic reuses partner Mina and sits last · product: 34 of 105 files changed since

## lukas-24 J5 · 6 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J5-3` blocker · rank 18 · Only one moment; no social phrasing taught · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J5-2` major · rank 9 · Redirect wording is formulaic across the three pushes · recurrence 2, first seen 2026-09-15-lt-recert · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-lukas-24-J5-2` major · rank 8 · Redirect wording identical three times · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J5-5` minor · rank 6 · No injection or level-change push tried · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J5-4` minor · rank 6 · Recap shows a taught line from another scene · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-09-15-lt-recert/LT-lukas-24-J5-3` minor · rank 3 · Visible topic proposals offer limited direct fit · product: 24 of 25 files changed since · 81 paths held by one side only

## ondrej-16 J2 · 6 open · top rank 18

- `2026-09-15-lt-recert/LT-ondrej-16-J2-2` blocker · rank 18 · Swaps repeatedly return rejected subject matter · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J2-3` minor · rank 6 · Swap was not exercised; the dull-looking cards were kept · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-09-15-lt/LT-ondrej-16-J2-2` minor · rank 6 · Repeated swaps stay close to the rejected interests · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/recert-3/LT-ondrej-16-J2-3` minor · rank 6 · Refusal is a form error, and a legitimate add was never tried · product: 34 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-ondrej-16-J2-4` minor · rank 6 · Seven topics, but no cars or football in the first six · product: 14 of 105 files changed since
- `2026-09-15-lt-recert2-goal/LT-ondrej-16-J2-4` minor · rank 3 · The first swap repeats the unwanted role theme · product: 24 of 25 files changed since · 81 paths held by one side only

## jana-29 J3 · 5 open · top rank 18

- `2026-10-17-lt-swap-2/recert-6/LT-jana-29-J3-1` blocker · rank 18 · Scene ends at logistics; no nuance pressure for a C1 · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-6/LT-jana-29-J3-3` blocker · rank 18 · Recap counts '1 with help' with no help used · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-4/LT-jana-29-J3-1` blocker · rank 18 · Clear slip "on the picture" got no moment and no recap fix · product: 1 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-6/LT-jana-29-J3-4` major · rank 12 · Recap hidden line is below the learner's level
- `2026-10-17-lt-swap-2/recert-6/LT-jana-29-J3-2` minor · rank 6 · Goal chip lags: asks for a reason after it was given

## petra-38 J1 · 5 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-petra-38-J1-2` blocker · rank 18 · Two B2 opinion tasks for an anxious A2 receptionist · recurrence 4, first seen 2026-10-14-lt · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J1-2` blocker · rank 18 · B2 social opinion task for an anxious A2 receptionist · recurrence 3, first seen 2026-10-16-lt-a2b1-tightening · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J1-3` blocker · rank 18 · Next focus generic and not desk-shaped · recurrence 3, first seen 2026-09-15-lt-j1b · product: 9 of 105 files changed since
- `2026-09-15-lt/LT-petra-38-J1-3` minor · rank 6 · The booking choice misses her hospitality practice · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-2/LT-petra-38-J1-4` polish · rank 2 · Confidence shown low though the evidence was consistent · product: 9 of 105 files changed since

## sofie-11 J1 · 5 open · top rank 18

- `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-3` blocker · rank 18 · TV headline shows her error as 'Your words' · recurrence 2, first seen 2026-10-16-lt-placement-oos/recert-1 · product: 31 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-4/LT-sofie-11-J1-2` blocker · rank 18 · TV headline shows her error as 'Your words' · recurrence 2, first seen 2026-10-16-lt-a2b1-tightening · product: 31 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-4/LT-sofie-11-J1-3` blocker · rank 18 · Level explanation abstract for an 11-year-old · recurrence 2, first seen 2026-10-16-lt-placement-oos/recert-1 · product: 31 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-4/LT-sofie-11-J1-1` major · rank 12 · B2 task marked fail though answer has idea and reason · recurrence 2, first seen 2026-10-16-lt-a2b1-tightening · product: 31 of 105 files changed since
- `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-5` polish · rank 2 · B2 task 5 marked fail though the answer is partial · recurrence 2, first seen 2026-10-16-lt-placement-oos/recert-1 · product: 31 of 105 files changed since

## tomas-9 J3 · 5 open · top rank 18

- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J3-1` blocker · rank 18 · Recap mission line is generic · recurrence 5, first seen 2026-10-17-lt-swap-2/recert-1
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J3-2` major · rank 12 · Adult situations still offered to a nine-year-old · recurrence 9, first seen 2026-10-14-lt/recert-2
- `2026-10-17-lt-swap-2/recert-4/LT-tomas-9-J3-2` major · rank 12 · 'Jmenuje se' glossed as 'name' · product: 1 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J3-3` major · rank 9 · Telegraphic errors get no stop and no held fix
- `2026-10-17-lt-swap-2/recert-6/LT-tomas-9-J3-5` polish · rank 2 · 'What is your house from?' is unnatural English

## viktor-67 J1 · 5 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J1-2` blocker · rank 18 · Interview questions padded and multi-part · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J1-1` blocker · rank 18 · B1 listening task sits far above an A1 senior; Show the words doesn't help · recurrence 2, first seen 2026-09-15-lt · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J1-4` major · rank 9 · No slow replay for listening · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-14-lt/recert-3/LT-viktor-67-J1-4` minor · rank 6 · Skipped task logged as 'fail' internally · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-viktor-67-J1-3` minor · rank 6 · Task 1 addresses a grandfather as 'Grandma' · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since

## martin-45 J1 · 4 open · top rank 18

- `2026-10-17-lt-swap-2/recert-3/LT-martin-45-J1-2` blocker · rank 18 · Fossilised errors went unremarked · recurrence 8, first seen 2026-10-14-lt · product: 5 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-martin-45-J1-2` blocker · rank 18 · B2 generous; Task 2 praised as accurate despite slips · recurrence 6, first seen 2026-10-14-lt/recert-3 · product: 5 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-3/LT-martin-45-J1-1` blocker · rank 18 · B2 is generous: tasks with repeated agreement slips passed · recurrence 6, first seen 2026-10-14-lt/recert-1 · product: 5 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-3/LT-martin-45-J1-3` blocker · rank 18 · A correction offers a non-idiomatic alternative and flags an acceptable phrase · product: 5 of 105 files changed since

## petra-38 J3 · 4 open · top rank 18

- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J3-1` blocker · rank 18 · Conversation ended after three replies · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J3-2` major · rank 12 · Petra plays the guest, not the receptionist
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J3-3` minor · rank 6 · Same error missed on its first appearance
- `2026-10-17-lt-swap-2/recert-6/LT-petra-38-J3-5` polish · rank 2 · Partner asked about heat in a noise complaint

## lukas-24 J3 · 3 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J3-1` blocker · rank 18 · Mission done after three replies with Dana's question open · recurrence 2, first seen 2026-10-14-lt/recert-3 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J3-2` major · rank 12 · Moment needs three repeats of one sentence · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J3-3` minor · rank 6 · Model fix is slightly unnatural and misses other slips · product: 14 of 105 files changed since

## oksana-34 J2 · 3 open · top rank 18

- `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J2-1` blocker · rank 18 · Interview not proposed; she must add it herself · recurrence 4, first seen 2026-10-14-lt · product: 14 of 105 files changed since
- `2026-09-15-lt-recert2-goal/LT-oksana-34-J2-3` minor · rank 6 · An explicit carrier-call request needs repeating · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-1/LT-oksana-34-J2-5` minor · rank 6 · Interview labelled 'Share your world' · product: 14 of 105 files changed since

## ondrej-16 J3 · 3 open · top rank 18

- `2026-10-17-lt-swap-2/recert-6/LT-ondrej-16-J3-2` blocker · rank 18 · Recap mission line still generic · recurrence 5, first seen 2026-10-14-lt/recert-3
- `2026-10-17-lt-swap-2/recert-6/LT-ondrej-16-J3-3` minor · rank 6 · Partner repeats the 'Turbo Rift ... right?' tag · recurrence 2, first seen 2026-10-17-lt-swap-2/recert-4
- `2026-10-17-lt-swap-2/recert-6/LT-ondrej-16-J3-4` minor · rank 6 · Mission closes after only three replies

## dominik-17 J1 · 2 open · top rank 18

- `2026-10-16-lt-placement-oos/LT-dominik-17-J1-3` blocker · rank 18 · Summary generic and focus thin · product: 34 of 105 files changed since
- `2026-10-16-lt-placement-oos/LT-dominik-17-J1-4` major · rank 12 · Down-shift note unexplained · product: 34 of 105 files changed since

## lukas-24 J2 · 7 open · top rank 12

- `2026-09-15-lt-recert/LT-lukas-24-J2-4` major · rank 12 · Three swaps end with another unwanted topic queued first · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-14-lt/LT-lukas-24-J2-1` major · rank 12 · Swap fails on model schema error · product: 54 of 93 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J2-3` minor · rank 6 · Too-basic 'Repeating a name' topic stays for a B2 learner · recurrence 2, first seen 2026-10-17-lt-swap-2 · product: 14 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J2-4` minor · rank 6 · Added topic is appended, so the plan grows to seven · recurrence 2, first seen 2026-10-14-lt/recert-1 · product: 14 of 105 files changed since
- `2026-09-15-lt-recert/LT-lukas-24-J2-3` minor · rank 6 · Ending a date politely disappears from the plan · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt-recert2-goal/LT-lukas-24-J2-3` minor · rank 3 · The requested tech interview never enters the plan · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J2-5` polish · rank 2 · Coffee topic drops the 'after a date or meetup' context · product: 14 of 105 files changed since

## ivana-33 J1 · 3 open · top rank 12

- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-2` major · rank 12 · Verdict says placed one level lower to be safe, with low confidence · product: 34 of 105 files changed since
- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-4` minor · rank 6 · Next focus is a generic template line · product: 34 of 105 files changed since
- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-3` polish · rank 2 · Task 3 marked partial for a correct reasoned answer · product: 34 of 105 files changed since

## jana-29 J2 · 5 open · top rank 6

- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J2-2` minor · rank 6 · Room booking is a basic register task for a C1 · recurrence 3, first seen 2026-10-14-lt/recert-1 · product: 9 of 105 files changed since
- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J2-3` minor · rank 6 · Her stated wants still had to be added by hand · recurrence 3, first seen 2026-09-15-lt-recert2-goal · product: 9 of 105 files changed since
- `2026-09-15-lt-recert/LT-jana-29-J2-2` minor · rank 6 · The critique topic loses its requested source of difficulty · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-09-15-lt/LT-jana-29-J2-2` minor · rank 6 · Recovery preserves pressure resistance but loses awkward questions · product: 24 of 25 files changed since · 81 paths held by one side only
- `2026-10-17-lt-swap-2/recert-2/LT-jana-29-J2-4` minor · rank 3 · Plan grows to seven, though the screen says six · product: 9 of 105 files changed since

## lukas-24 J1 · 2 open · top rank 6

- `2026-10-17-lt-swap-2/recert-1/LT-lukas-24-J1-3` minor · rank 6 · Next focus is one slip, not tied to his dating goal · recurrence 2, first seen 2026-09-15-lt-j1b · product: 14 of 105 files changed since
- `2026-09-15-lt/LT-lukas-24-J1-2` minor · rank 6 · The partner does not provide a realistic B2 challenge · product: 24 of 25 files changed since · 81 paths held by one side only

# Essay Master

43 open in 10 pairs across 7 runs
43 open: 0 seen on the current product, 43 seen before a product change

recurring 42 · unasked by a later run of their pair 0

Next: these rows are re-checked by an L1 re-walk through the /uat skill. The Linga driver does not rerun them.

## helena-46 EM5 · 7 open · top rank 12

- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-1` major · rank 12 · Reading a kept email puts every sentence on the TV and its first words on the lens home · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-2` major · rank 9 · After the first reading, no remote path leads back to the Workroom · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-3` major · rank 9 · A kept piece can be read only from the phone; the PC page cannot ask for a reading and the Workroom's piece rows do nothing on OK · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-6` major · rank 9 · A piece kept from the phone cannot be named, so the Workroom and shelf show its first line or a column of 'Untitled essay' rows · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-4` minor · rank 3 · On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf says pieces arrive from the TV · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-5` polish · rank 2 · Leaving a piece out of the exemplars still lets its text shape the dims and count toward birth · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM5-7` polish · rank 2 · .docx text: table cells become separate paragraphs and a non-breaking hyphen is dropped and glues the words · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since

## daniel-15 EM3 · 6 open · top rank 9

- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-1` major · rank 9 · The forensic page he is moved to shows neither 'paragraph k of n' nor the summary; the first wait says 'your paragraph' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-2` major · rank 9 · The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay Master reopens there · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-3` major · rank 9 · A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the prompt as a task · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-6` major · rank 9 · No verdict lands until the last paragraph is read (C3 second clause fails by design) · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-4` minor · rank 6 · Nothing says grammar and spelling are not checked; 'Well done' lands on sentences with errors · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM3-5` minor · rank 3 · Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts noticed and notice · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## eliska-12 EM1 · 6 open · top rank 9

- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-1` major · rank 9 · Every faulty note is a code line not in the young voice: 'asserts', 'checkable'; planFit prints 'That reads as claim.' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-4` major · rank 9 · The planted-claim fix depends on the model naming links (supports / backs): when it omits them, Structure marks the true topic sentence and Evidence marks nothing · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-2` minor · rank 6 · The forensic crumb, 'Its job' and the table show the regex first-pass role, which can contradict the verdict · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-5` minor · rank 6 · PEEL's Explain is still marked faulty when it has no connector or linker opener: closesAfterEvidence needs "because", "this means", "so" ... in the sentence · recurrence 4, first seen 2026-10-09-essay-l1/recert-3 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-6` minor · rank 6 · cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenagers sleep [how many] hours.') still states content and is kept · recurrence 3, first seen 2026-10-09-essay-l1/recert-4 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM1-3` polish · rank 2 · stats.links (PEEL's L) and stats.words are computed for every reading and shown nowhere · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## kristyna-17 EM1 · 6 open · top rank 9

- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-1` major · rank 9 · A Czech paragraph that passes the language check is still ruled on English word lists, with English advice · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-2` major · rank 9 · ES-READ: kind and mode now reach the reading, a task has no sender and no history or memory reaches it · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-5` major · rank 9 · The language check lets some Czech through: a paragraph whose shared function words (my, a, to, do) reach 15% is read as English, under English rules, with no word about language · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-3` minor · rank 6 · A Czech paragraph that passes the language check gets notes in whatever language the model picks; the prompt names none · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-6` minor · rank 6 · Nothing says before the first send that Essay Master reads English; on the plan she writes and inks three Czech slots before the refusal · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM1-4` minor · rank 3 · stats.links and stats.words are computed for every reading and shown nowhere · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## kristyna-17 EM3 · 4 open · top rank 9

- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM3-1` major · rank 9 · The forensic page never names the paragraph; 'Start with paragraph p, sentence n' is on the lens home only, cut from the landing, and means 'earliest' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM3-2` minor · rank 6 · A plain title line becomes paragraph 1 of the piece, costs a model call, and can become 'Start with paragraph 1' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM3-3` minor · rank 3 · While the first paragraph of a first piece is read, the TV says 'The desk is reading your paragraph' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-kristyna-17-EM3-4` minor · rank 3 · GET /api/texts returns noticed and notice that no screen reads · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## barbora-43 EM1 · 2 open · top rank 9

- `2026-10-09-essay-l1/recert-6/L1-barbora-43-EM1-1` major · rank 9 · The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample paragraph · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-barbora-43-EM1-2` major · rank 9 · ES-READ grounding: the reading still never sees her earlier readings or notes, and no client sends the assignment · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## barbora-43 EM4 · 2 open · top rank 8

- `2026-10-09-essay-l1/recert-6/L1-barbora-43-EM4-1` major · rank 8 · A paragraph-only evening's delete is out of reach when the TV is on a sentence or the plan: the shelf, and 'Forget tonight's paragraph' with it, shows only on the paragraph panel · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-barbora-43-EM4-2` polish · rank 2 · A piece is 'one reading' on the recap but 'one piece' on the Sunday page · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since

## helena-46 EM1 · 5 open · top rank 6

- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-1` minor · rank 6 · Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-5` minor · rank 6 · An email read on its own, or a piece read with Keep off, is still judged as an essay: the kind of writing is asked and sent only for a kept piece · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-2` minor · rank 3 · Four reading fields are computed and never shown (provider, stats.links, stats.words, sentences[].connectors) · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-3` polish · rank 2 · The phone refuses a .docx that the PC page accepts · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-helena-46-EM1-4` polish · rank 2 · A language the desk does not read is refused only when it is clearly Czech; short Czech, Czech without diacritics and German go to the model · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## eliska-12 EM2 · 3 open · top rank 6

- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM2-1` minor · rank 6 · Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no evidence' · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM2-2` minor · rank 6 · After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next faulty sentence; the 'Rewrite on my phone' instruction lands only on the bench status bar · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-eliska-12-EM2-3` minor · rank 3 · Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dictated mid-paragraph rewrite is always refused · recurrence 7, first seen 2026-10-09-essay-l1 · product: 2 of 31 files changed since

## daniel-15 EM2 · 2 open · top rank 6

- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM2-1` minor · rank 6 · Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learner, but the desk reads English · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since
- `2026-10-09-essay-l1/recert-6/L1-daniel-15-EM2-2` minor · rank 4 · A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty: 'Rewrite · not yet' · recurrence 6, first seen 2026-10-09-essay-l1/recert-1 · product: 2 of 31 files changed since

# Math Buddy

19 open in 9 pairs across 6 runs
19 open: 0 seen on the current product, 19 seen before a product change

recurring 19 · unasked by a later run of their pair 0

Next: these rows are re-checked by an L1 re-walk through the /uat skill. The Linga driver does not rerun them.

## matyas-19 MB3 · 5 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-1` minor · rank 6 · Calculus 2: by-parts working (and the other technique topics) is read as nothing; the pen never lands and no line is ticked · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-2` minor · rank 6 · Word-problem parts with an irrational answer accept only the exact form or about 6 figures, and the printed line never says 'exact' · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-4` minor · rank 3 · Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequences 33) · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-3` polish · rank 2 · Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left outside the superscript ('∫_1^∞') · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB3-5` polish · rank 1 · question(spec).tex is computed for every Calculus spec and read by no screen · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since

## vojtech-18 MB4 · 3 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-1` minor · rank 6 · The TV never shows which statement led a question to a topic (topics[].codes unwired) · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-2` minor · rank 6 · Back from an off-desk row of the recovery list lands on Equivalent fractions · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-vojtech-18-MB4-3` minor · rank 6 · The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick · recurrence 2, first seen 2026-10-09-maths-l1/recert-4 · product: 7 of 62 files changed since

## matyas-19 MB1 · 2 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB1-1` minor · rank 6 · His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question sets are marked · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-matyas-19-MB1-2` polish · rank 2 · A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n->∞) are · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since

## nela-12 MB2 · 2 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-nela-12-MB2-1` minor · rank 6 · Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-nela-12-MB2-2` minor · rank 6 · Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since

## owen-17 MB2 · 2 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-owen-17-MB2-1` minor · rank 6 · The three linear-equation units have no worked lesson: 'See how first' is offered on 14 of 17 school units · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-owen-17-MB2-2` minor · rank 4 · The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the Prepare fix stops there) · recurrence 5, first seen 2026-10-09-maths-l1/recert-1 · product: 7 of 62 files changed since

## radka-41 MB5 · 2 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-radka-41-MB5-1` minor · rank 6 · Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the silent UK default is closed) · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since
- `2026-10-09-maths-l1/recert-5/L1-radka-41-MB5-2` minor · rank 6 · The recap and the week cover only the child seated now · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since

## owen-17 MB4 · 1 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-owen-17-MB4-1` minor · rank 6 · 31 typed paper rows live only in React state: a phone reload or tab discard loses them · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since

## radka-41 MB4 · 1 open · top rank 6

- `2026-10-09-maths-l1/recert-5/L1-radka-41-MB4-1` minor · rank 6 · A cz parent picks Czech statements, but the TV and the Prepare line echo the English statement text and the '· a harder statement' flag · recurrence 2, first seen 2026-10-09-maths-l1/recert-4 · product: 7 of 62 files changed since

## nela-12 MB5 · 1 open · top rank 3

- `2026-10-09-maths-l1/recert-5/L1-nela-12-MB5-1` minor · rank 3 · A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) · recurrence 6, first seen 2026-10-09-maths-l1 · product: 7 of 62 files changed since
