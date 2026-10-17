# Open LT findings

Derived from every run under uat/runs/ by uat/driver/ledger.cjs (`node uat/driver/linga-text.cjs --status`), rewritten after every ledger recertify. Do not edit: the findings.json of each run is the record. Ids are run-qualified, `<run>/<id>`, since a finding id is positional within its run. One section per module that has open rows.

509 open across 11 runs
drained 9 of 11 runs
undrained: 2026-10-14-lt, 2026-10-16-lt-a2b1-tightening (home: docs/uat-insights/<run-id>.md, uat/README.md)

# Linga

343 open in 40 pairs across 14 runs

recurring 105 · unasked by a later run of their pair 171

Next: `node uat/driver/linga-text.cjs --recertify` reruns every pair below; each judge answers all of its pair's open rows, and each answer is stamped into the run that owns the row.

## viktor-67 J3 · 17 open · top rank 27

- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-1` blocker · rank 27 · Repeated Czech requests do not produce understandable explanations · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-2` blocker · rank 27 · Eight replies never deliver the planned school exchange · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J3-1` blocker · rank 18 · Partner drifts above A1 with long, chatty turns · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-viktor-67-J3-2` blocker · rank 18 · Repeated and obvious errors get no moment · recurrence 2, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-viktor-67-J3-1` blocker · rank 18 · Explanations exceed this beginner’s comprehension · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-4` major · rank 12 · The opening models an unnatural tense · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-viktor-67-J3-2` major · rank 12 · Mission ends after three replies, with Mia's question unanswered · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt/LT-viktor-67-J3-2` minor · rank 6 · A Czech vocabulary question requires a second request · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt/LT-viktor-67-J3-3` minor · rank 6 · The recap records activity without reviewing learning · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J3-1` minor · rank 6 · The recommended practice misses his Sunday goal · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J3-2` minor · rank 6 · One clarification remains too difficult · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J3-3` minor · rank 6 · The final teaching interruption is not worth its burden · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-3` minor · rank 6 · The clear garden error receives no repair · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-5` minor · rank 6 · The recap reports counts without usable Sunday language · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J3-5` minor · rank 6 · No family words taught for Sunday; the recap sentence is not his
- `2026-10-14-lt/recert-1/LT-viktor-67-J3-3` minor · rank 4 · Missing article in 'red shirt is nice' got no coaching · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J3-4` minor · rank 3 · The recap records activity without reinforcing learning · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)

## viktor-67 J4 · 15 open · top rank 27

- `2026-10-14-lt/recert-3/LT-viktor-67-J4-2` blocker · rank 27 · Recap shows sentences never said · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-viktor-67-J4-1` blocker · rank 27 · Help repeats the introduction regardless of the current question · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-1` blocker · rank 27 · Repeated cues do not answer the question he is stuck on · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-2` blocker · rank 27 · Coaching improves an old answer instead of resolving the current difficulty · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J4-1` blocker · rank 18 · Phrase help is a loop, no replay or fresh question · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-viktor-67-J4-3` blocker · rank 18 · No moment or coaching on learner errors · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-viktor-67-J4-3` blocker · rank 18 · Friendly acknowledgments leave a beginner without a next step · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J4-4` blocker · rank 18 · Replay instruction stays visible after the replay question · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-3` blocker · rank 18 · Fresh replay questions do not produce a better independent answer · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J4-2` major · rank 12 · Replay does not demonstrate an improved independent answer · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-4` major · rank 12 · Later partner turns exceed this beginner's language needs · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J4-4` major · rank 8 · Phrase help ignores question · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-viktor-67-J4-2` minor · rank 6 · The journey ends before an independent retry · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt/LT-viktor-67-J4-3` minor · rank 6 · The opening overloads a first-time learner · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-viktor-67-J4-5` minor · rank 6 · Partner pitch drifts above A1 · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)

## petra-38 J4 · 14 open · top rank 27

- `2026-09-15-lt-recert2-beginners/LT-petra-38-J4-1` blocker · rank 27 · The guest takes the receptionist's role · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J4-2` blocker · rank 18 · No replay with a fresh question after a moment · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-petra-38-J4-4` blocker · rank 18 · Recurring errors missed · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-petra-38-J4-1` blocker · rank 18 · Partner pitched at B1, above A2
- `2026-10-14-lt/recert-1/LT-petra-38-J4-3` major · rank 12 · Supported flag mismatches help used · recurrence 2, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-petra-38-J4-1` major · rank 9 · Replay does not demonstrate the coached skill or independence · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-petra-38-J4-3` major · rank 9 · The journey ends without an independent replay · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J4-2` minor · rank 6 · The second cue repeats help for the opening complaint · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J4-3` minor · rank 6 · Coaching leaves the current difficulty unresolved · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J4-4` minor · rank 6 · The situation menu poorly matches her reception work · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J4-1` minor · rank 6 · Second help request does not address the current difficulty · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J4-2` minor · rank 6 · Replay instruction promises practice it does not deliver · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J4-3` minor · rank 6 · Work topics are buried under unrelated suggestions · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-petra-38-J4-2` minor · rank 6 · The second cue does not address the current difficulty · unasked since 2026-10-14-lt (2 later runs of this pair)

## oksana-34 J1 · 12 open · top rank 27

- `2026-10-14-lt/recert-1/LT-oksana-34-J1-2` blocker · rank 27 · Notes call answers 'no real mistakes' despite clear errors · unasked since 2026-10-14-lt/recert-3 (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-oksana-34-J1-3` blocker · rank 18 · Next focus is generic and ignores the interview · recurrence 2, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-1` blocker · rank 18 · Check never asks a real interview question · recurrence 2, first seen 2026-10-16-lt-placement-oos
- `2026-10-14-lt/recert-3/LT-oksana-34-J1-1` major · rank 12 · B2 placement generous for a B1 writer with recurrent errors · recurrence 3, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-2` major · rank 12 · Tasks 3 and 4 are near duplicates · recurrence 2, first seen 2026-10-16-lt-placement-oos
- `2026-10-14-lt/recert-1/LT-oksana-34-J1-4` major · rank 12 · Task 4 prompt truncated · unasked since 2026-10-14-lt/recert-3 (3 later runs of this pair)
- `2026-09-15-lt/LT-oksana-34-J1-2` major · rank 9 · Clear interview-language errors receive no coaching · unasked since 2026-09-15-lt-j1b (6 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-oksana-34-J1-3` major · rank 9 · Next focus is a single phrase, not tied to interview goal · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-09-15-lt/LT-oksana-34-J1-3` minor · rank 6 · Follow-up questions keep extending one scenario · unasked since 2026-09-15-lt-j1b (6 later runs of this pair)
- `2026-09-15-lt-j1b/LT-oksana-34-J1-1` minor · rank 6 · The summary overstates the past problem-solving evidence · unasked since 2026-10-14-lt (5 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-oksana-34-J1-2` minor · rank 6 · Task 5 verdict 'partial' at C1 is lenient · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-16-lt-placement-oos/recert-1/LT-oksana-34-J1-3` minor · rank 6 · Summary and focus are thin

## viktor-67 J2 · 12 open · top rank 27

- `2026-09-15-lt-recert/LT-viktor-67-J2-1` blocker · rank 27 · Agreement follows exhaustion, not a suitable plan · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J2-2` blocker · rank 27 · Seven swaps keep returning unwanted transactions · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/LT-viktor-67-J2-1` blocker · rank 27 · Swap replaces the wrong topic
- `2026-10-14-lt/recert-3/LT-viktor-67-J2-2` blocker · rank 18 · Own-topic needs typing; no voice route · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-viktor-67-J2-1` blocker · rank 18 · Added topics cannot be fully reviewed before agreement · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt/LT-viktor-67-J2-2` blocker · rank 18 · Planning language exceeds a first-time beginner's needs · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-viktor-67-J2-3` blocker · rank 18 · The requested topic is cut off in the displayed evidence · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J2-3` major · rank 12 · Jargon and above-A1 wording in topic goals · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-viktor-67-J2-4` major · rank 12 · Swap and own-topic never exercised
- `2026-09-15-lt-recert/LT-viktor-67-J2-4` major · rank 9 · The next activity still ignores his immediate purpose · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert2-goal/LT-viktor-67-J2-1` major · rank 9 · The added topic is saved but absent from the agreement screen · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-viktor-67-J2-5` polish · rank 2 · Swap not exercised; plan grew to seven · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)

## petra-38 J2 · 11 open · top rank 27

- `2026-10-14-lt/LT-petra-38-J2-1` blocker · rank 27 · Swap replaces the wrong topic
- `2026-09-15-lt-recert/LT-petra-38-J2-2` blocker · rank 18 · Swaps recycle rejected scenarios · unasked since 2026-09-15-lt-recert2-goal (3 later runs of this pair)
- `2026-10-14-lt/LT-petra-38-J2-2` major · rank 12 · Swaps bring near-duplicates and off-brief topics
- `2026-09-15-lt/LT-petra-38-J2-1` major · rank 9 · Seven swaps never produce a work-shaped plan · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J2-1` major · rank 9 · The agreed plan still fails her work goal · unasked since 2026-09-15-lt-recert2-goal (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J2-3` major · rank 9 · The next activity ignores her expressed priority · unasked since 2026-09-15-lt-recert2-goal (3 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J2-2` minor · rank 6 · The next recommendation ignores her useful additions · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert2-goal/LT-petra-38-J2-4` minor · rank 6 · The transcript does not establish full topic review · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J2-3` minor · rank 6 · Adding grows the plan to 7 instead of 6
- `2026-09-15-lt-recert2-goal/LT-petra-38-J2-3` minor · rank 3 · An explicit initial request needed repeating · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J2-4` polish · rank 2 · Swap not exercised; 'favourite trip' is not a work topic

## jana-29 J2 · 9 open · top rank 27

- `2026-10-14-lt/recert-3/LT-jana-29-J2-1` blocker · rank 27 · Swap does nothing; unwanted topics stay in the plan · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-jana-29-J2-2` blocker · rank 27 · Proposed topics are almost all films, built from one placement prompt
- `2026-10-14-lt/recert-3/LT-jana-29-J2-3` blocker · rank 18 · Plan grows to 7 and ends with unwanted topics · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-jana-29-J2-1` blocker · rank 18 · Swapping repeatedly produces more generic topics · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt/LT-jana-29-J2-2` minor · rank 6 · Recovery preserves pressure resistance but loses awkward questions · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-jana-29-J2-2` minor · rank 6 · The critique topic loses its requested source of difficulty · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert2-goal/LT-jana-29-J2-1` minor · rank 6 · Initial suggestions omit two explicitly requested situations · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-jana-29-J2-5` minor · rank 3 · Weak picks for a C2 profile, and a repeated partner name · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-jana-29-J2-5` minor · rank 3 · Level read overshoots and the why lines pad

## jana-29 J3 · 9 open · top rank 27

- `2026-10-14-lt/recert-1/LT-jana-29-J3-2` blocker · rank 27 · Recap is inaccurate and generic · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-jana-29-J3-2` blocker · rank 18 · Recap is bare · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-jana-29-J3-1` blocker · rank 18 · No moments: nothing new taught at C1
- `2026-10-14-lt/recert-3/LT-jana-29-J3-3` major · rank 12 · Mission closes after three replies · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-jana-29-J3-4` major · rank 12 · Partner calls the learner 'Owen'
- `2026-09-15-lt/LT-jana-29-J3-1` major · rank 9 · Fluent practice produces no explicit C1 learning · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-jana-29-J3-1` major · rank 9 · Fluent practice produces no new language to keep · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt/LT-jana-29-J3-2` minor · rank 6 · The recap saves the session but does not consolidate it · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-jana-29-J3-2` minor · rank 6 · Recap confirms saving but offers no learning review · unasked since 2026-10-14-lt (3 later runs of this pair)

## tomas-9 J2 · 9 open · top rank 27

- `2026-10-14-lt/recert-2/LT-tomas-9-J2-1` blocker · rank 27 · Swap does nothing; unwanted school topic stays and is agreed · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-4/LT-tomas-9-J2-2` blocker · rank 18 · Skill labels and why lines are too abstract for a 9-year-old · recurrence 3, first seen 2026-09-15-lt
- `2026-10-14-lt/recert-5/LT-tomas-9-J2-1` blocker · rank 18 · Abstract skill labels and long why lines for a 9-year-old · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-tomas-9-J2-2` major · rank 12 · Placement summary tasks and feedback exceed 15 words and A1 level · recurrence 4, first seen 2026-10-14-lt
- `2026-09-15-lt-recert2-goal/LT-tomas-9-J2-1` minor · rank 6 · Planning language is too demanding for this beginner · recurrence 3, first seen 2026-09-15-lt-recert2-goal
- `2026-10-14-lt/recert-1/LT-tomas-9-J2-5` minor · rank 6 · Why lines are too long and abstract for a beginner child · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-10-14-lt/recert-2/LT-tomas-9-J2-3` minor · rank 6 · Plan text too long and school-flavoured for a 9-year-old reader · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-5/LT-tomas-9-J2-3` minor · rank 6 · Narrate and describe goals demand more than like/is · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-5/LT-tomas-9-J2-4` minor · rank 6 · Swap not exercised · recurrence 2, first seen 2026-10-14-lt/recert-4

## adela-17 J2 · 7 open · top rank 27

- `2026-10-14-lt/recert-4/LT-adela-17-J2-1` blocker · rank 27 · Swapping gaming night does not remove it · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-5/LT-adela-17-J2-1` blocker · rank 18 · Plan is half everyday tasks, not exam discussion · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-10-14-lt/recert-5/LT-adela-17-J2-2` blocker · rank 18 · Mock interview not proposed up front · recurrence 3, first seen 2026-09-15-lt-recert2-goal
- `2026-10-14-lt/recert-5/LT-adela-17-J2-3` blocker · rank 18 · Questionable 'usual slip' correction · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-09-15-lt-recert/LT-adela-17-J2-1` blocker · rank 18 · Seven swaps before the plan becomes acceptable
- `2026-09-15-lt/LT-adela-17-J2-1` blocker · rank 18 · Repeated swaps do not deliver the variety she wants
- `2026-10-14-lt/recert-5/LT-adela-17-J2-5` major · rank 12 · Her direct question 'Was that correct?' not answered plainly

## tomas-9 J1 · 5 open · top rank 27

- `2026-10-14-lt/recert-5/LT-tomas-9-J1-1` blocker · rank 27 · Check tasks too long for a nine-year-old beginner · recurrence 3, first seen 2026-09-15-lt-j1b
- `2026-10-14-lt/recert-5/LT-tomas-9-J1-4` blocker · rank 27 · 'Only single words' feedback feels like failing
- `2026-10-14-lt/recert-5/LT-tomas-9-J1-2` blocker · rank 18 · About-you questions too long and about learning history · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-5/LT-tomas-9-J1-3` blocker · rank 18 · Slips and focus beyond his level, stray punctuation · recurrence 3, first seen 2026-09-15-lt-j1b
- `2026-10-14-lt/recert-4/LT-tomas-9-J1-3` major · rank 9 · About-you questions too long and cover learning history · recurrence 3, first seen 2026-10-14-lt/recert-1

## adela-17 J1 · 4 open · top rank 27

- `2026-10-14-lt/recert-5/LT-adela-17-J1-1` blocker · rank 27 · Correct sentence 'corrected' as her next focus and usual slip · recurrence 4, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-4/LT-adela-17-J1-2` blocker · rank 27 · Real slip 'interested about' never corrected
- `2026-10-14-lt/recert-5/LT-adela-17-J1-3` blocker · rank 18 · Notes generic or inaccurate · recurrence 4, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-5/LT-adela-17-J1-2` blocker · rank 18 · Her direct question 'Was that correct?' is never answered · recurrence 2, first seen 2026-09-15-lt

## martin-45 J2 · 4 open · top rank 27

- `2026-10-14-lt/recert-5/LT-martin-45-J2-1` blocker · rank 27 · Swap button does nothing; unwanted topic stays and is agreed · recurrence 4, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-martin-45-J2-1` blocker · rank 27 · Swaps repeatedly ignore the explicit business goal
- `2026-10-14-lt/recert-5/LT-martin-45-J2-2` major · rank 9 · Plan grows from six to seven after an add, unexplained · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-10-14-lt/recert-5/LT-martin-45-J2-4` minor · rank 4 · 'team have' corrected to 'team has' as an error

## martin-45 J1 · 3 open · top rank 27

- `2026-10-14-lt/recert-5/LT-martin-45-J1-1` blocker · rank 27 · Focus built on a misread slip, not his fossilised errors · recurrence 5, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-5/LT-martin-45-J1-2` major · rank 12 · Why B1 not B2 still thin · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-10-14-lt/recert-5/LT-martin-45-J1-3` major · rank 12 · Task 1 passes despite slips; 'team has' note questionable · recurrence 3, first seen 2026-10-14-lt/recert-3

## klara-13 J3 · 14 open · top rank 18

- `2026-10-14-lt/recert-1/LT-klara-13-J3-2` blocker · rank 18 · Mission declared done after 3 replies; recap never reached · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-klara-13-J3-2` blocker · rank 18 · Repeated missing-'it' error not caught after being named
- `2026-10-14-lt/recert-1/LT-klara-13-J3-5` major · rank 12 · Partner repeats and ignores her question · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-klara-13-J3-1` major · rank 12 · Fourth moment gives an unnatural, wrong model sentence
- `2026-10-14-lt/recert-3/LT-klara-13-J3-3` major · rank 12 · Each moment takes about 3 steps and the scene stops
- `2026-10-14-lt/recert-3/LT-klara-13-J3-4` major · rank 12 · No natural end or recap in a long conversation
- `2026-09-15-lt/LT-klara-13-J3-1` major · rank 9 · The later conversation exceeds her A2 band · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J3-5` minor · rank 6 · Level shown as B1 for an A2 learner · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-klara-13-J3-3` minor · rank 6 · The recap records activity without consolidating learning · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-klara-13-J3-1` minor · rank 6 · The recap records counts without consolidating learning · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-klara-13-J3-1` minor · rank 6 · The recap counts learning without reviewing it · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-klara-13-J3-4` minor · rank 6 · Missed clear errors after the first moment · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt-recert/LT-klara-13-J3-2` minor · rank 3 · Correction density exceeds the rubric's target · unasked since 2026-09-15-lt-recert2-beginners (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-klara-13-J3-2` minor · rank 3 · One question stretches beyond supportive A2 · unasked since 2026-10-14-lt (3 later runs of this pair)

## lukas-24 J2 · 12 open · top rank 18

- `2026-10-14-lt/recert-1/LT-lukas-24-J2-1` blocker · rank 18 · Plan built from game/film placement prompts, not his goals · recurrence 2, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-lukas-24-J2-1` blocker · rank 18 · Topic fit falls below the required proportion · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J2-4` major · rank 12 · Three swaps end with another unwanted topic queued first · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-lukas-24-J2-4` major · rank 12 · Placement band C1 vs his B2 slips · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/LT-lukas-24-J2-1` major · rank 12 · Swap fails on model schema error
- `2026-10-14-lt/recert-3/LT-lukas-24-J2-3` major · rank 12 · Level label C1 versus 'Talking today at B2'
- `2026-09-15-lt/LT-lukas-24-J2-1` minor · rank 6 · Topic agreement succeeds, but relevance misses the acceptance threshold · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J2-3` minor · rank 6 · Ending a date politely disappears from the plan · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-lukas-24-J2-3` minor · rank 6 · Plan grows past six and unwanted topics linger · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J2-2` minor · rank 6 · Asking out for coffee dropped from the added topic
- `2026-09-15-lt-recert2-goal/LT-lukas-24-J2-3` minor · rank 3 · The requested tech interview never enters the plan · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J2-4` minor · rank 3 · Plan now meetup and job based, but no date topic until added

## oksana-34 J3 · 12 open · top rank 18

- `2026-10-14-lt/recert-3/LT-oksana-34-J3-2` blocker · rank 18 · Level shown as B2 for a B1 learner · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-oksana-34-J3-1` blocker · rank 18 · Repeated article and collocation errors never coached · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-oksana-34-J3-2` major · rank 12 · Clear errors left unmarked in the same answers · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt/LT-oksana-34-J3-1` major · rank 9 · The recommended practice misses her interview goal · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-oksana-34-J3-1` major · rank 9 · The completed rehearsal misses her interview job · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/LT-oksana-34-J3-4` minor · rank 6 · Unnatural collocations left uncorrected · recurrence 2, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-oksana-34-J3-3` minor · rank 6 · The recap records activity but gives no learning takeaway · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-oksana-34-J3-4` minor · rank 6 · Article interruptions exceed the target density · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-oksana-34-J3-5` minor · rank 6 · The recap supplies counts without a learning summary · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-oksana-34-J3-3` minor · rank 6 · Little interview vocabulary teaching · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-oksana-34-J3-4` minor · rank 6 · Mission shows done mid-conversation and the recap tip is generic
- `2026-10-14-lt/recert-3/LT-oksana-34-J3-3` polish · rank 2 · Partner slips on the customer's gender

## ondrej-16 J3 · 12 open · top rank 18

- `2026-10-14-lt/recert-3/LT-ondrej-16-J3-1` blocker · rank 18 · Most clear errors get no moment or coaching · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-ondrej-16-J3-3` blocker · rank 18 · Mandatory correction stops exceed the target rate · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-ondrej-16-J3-4` blocker · rank 18 · Repeated agreement errors receive no teaching · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J3-2` blocker · rank 18 · Stale 'Say your name and age clearly' goal throughout
- `2026-10-14-lt/recert-3/LT-ondrej-16-J3-3` blocker · rank 18 · Partner repeats 'how often' and re-asks covered topics
- `2026-10-14-lt/recert-1/LT-ondrej-16-J3-2` major · rank 12 · Recap 'used again' line is not from this conversation · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-ondrej-16-J3-1` major · rank 12 · Partner repeats a question already answered · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-1/LT-ondrej-16-J3-4` major · rank 12 · TV start screen showed A2 while the phone showed B1 · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt/LT-ondrej-16-J3-2` minor · rank 6 · The recap records activity without consolidating learning · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-ondrej-16-J3-5` minor · rank 6 · Recap confirms saving but does not consolidate learning · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J3-4` minor · rank 6 · No recap reached; the journey ended on budget
- `2026-10-14-lt/recert-3/LT-ondrej-16-J3-5` minor · rank 6 · Repair loop repeats the same fix three times

## tomas-9 J4 · 12 open · top rank 18

- `2026-10-14-lt/recert-2/LT-tomas-9-J4-2` blocker · rank 18 · Partner turns too long and above A1 for a 9-year-old · recurrence 5, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-4/LT-tomas-9-J4-1` blocker · rank 18 · No replay or independent retry after the moment · recurrence 3, first seen 2026-09-15-lt
- `2026-10-14-lt/recert-4/LT-tomas-9-J4-3` blocker · rank 18 · The only moment is unnecessary and slightly wrong · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-tomas-9-J4-1` blocker · rank 18 · Partner turns too long for A1 nine-year-old · recurrence 3, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-14-lt/recert-5/LT-tomas-9-J4-2` blocker · rank 18 · No replay of the moment · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-tomas-9-J4-3` blocker · rank 18 · Real errors uncoached; trivial moment chosen · recurrence 3, first seen 2026-10-14-lt/recert-1
- `2026-10-14-lt/recert-4/LT-tomas-9-J4-4` major · rank 12 · Partner turns grow long and use 'mob' · recurrence 3, first seen 2026-09-15-lt
- `2026-10-14-lt/recert-5/LT-tomas-9-J4-4` major · rank 12 · Supported flag inaccurate · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-2/LT-tomas-9-J4-5` major · rank 12 · Replay is repetition, not a fresh question · recurrence 2, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-5/LT-tomas-9-J4-5` major · rank 9 · Topic list long and mixed · recurrence 3, first seen 2026-09-15-lt
- `2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-2` minor · rank 6 · No independent retry is demonstrated · recurrence 3, first seen 2026-09-15-lt-recert2-beginners
- `2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-4` minor · rank 3 · Useful help interrupts the scene · recurrence 3, first seen 2026-09-15-lt-recert2-beginners

## petra-38 J3 · 11 open · top rank 18

- `2026-10-14-lt/recert-1/LT-petra-38-J3-1` blocker · rank 18 · A2 speaker labelled B1 'Getting by' again · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-petra-38-J3-2` blocker · rank 18 · Most clear errors passed without coaching · recurrence 2, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-petra-38-J3-1` major · rank 9 · The recommended conversation misses Petra's work goal · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-petra-38-J3-1` major · rank 9 · The role reversal prevents receptionist practice · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J3-3` minor · rank 6 · The recap records activity without consolidating learning · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J3-1` minor · rank 6 · The recommended practice misses her hospitality job · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-petra-38-J3-2` minor · rank 6 · The immediately repeated correction receives no follow-up · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)
- `2026-09-15-lt-recert2-beginners/LT-petra-38-J3-2` minor · rank 6 · The recap records counts without consolidating learning · unasked since 2026-10-14-lt (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J3-3` minor · rank 6 · Partner kept adding requests past the natural close
- `2026-10-14-lt/recert-1/LT-petra-38-J3-4` minor · rank 6 · Recap 'sentence to take with you' is odd
- `2026-09-15-lt-recert/LT-petra-38-J3-3` minor · rank 3 · The recap reports counts without consolidating learning · unasked since 2026-09-15-lt-recert2-beginners (3 later runs of this pair)

## viktor-67 J1 · 11 open · top rank 18

- `2026-10-14-lt/recert-3/LT-viktor-67-J1-1` blocker · rank 18 · Interview questions still long for an A1 senior · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-viktor-67-J1-2` blocker · rank 18 · A2 placement rests on a one-word answer · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-viktor-67-J1-3` blocker · rank 18 · Next focus generic, not about grandchildren · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-1/LT-viktor-67-J1-4` major · rank 12 · Task generation failed twice, needing retries · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-1/LT-viktor-67-J1-5` major · rank 12 · Grammar-minimal-pair task is unanswerable for a beginner · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J1-2` major · rank 12 · No slow replay for listening tasks
- `2026-09-15-lt/LT-viktor-67-J1-1` minor · rank 6 · The final focus drops his grandchildren and garden · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt/LT-viktor-67-J1-2` minor · rank 6 · Revealing the listening line does not make it answerable · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt/LT-viktor-67-J1-3` minor · rank 6 · Confidence exceeds the demonstrated task evidence · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-viktor-67-J1-3` minor · rank 6 · A2 choose task tests grammar a beginner cannot judge
- `2026-10-14-lt/recert-3/LT-viktor-67-J1-4` minor · rank 6 · Skipped task logged as 'fail' internally

## klara-13 J1 · 10 open · top rank 18

- `2026-10-14-lt/recert-1/LT-klara-13-J1-2` blocker · rank 18 · Headline band and 'wrote A2' disagree on the verdict screen · unasked since 2026-10-14-lt/recert-3 (2 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J1-1` major · rank 12 · B1 placement slightly generous again · recurrence 3, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J1-3` major · rank 12 · Verdict focus quotes a phrase she never typed as a single error · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair)
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-2` major · rank 12 · Verdict hedges: 'What you said at the start pointed elsewhere'
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-4` major · rank 12 · Her erroneous sentence shown on the family TV
- `2026-09-15-lt/LT-klara-13-J1-2` minor · rank 6 · The next focus misidentifies her missing word · unasked since 2026-10-14-lt (4 later runs of this pair)
- `2026-09-15-lt/LT-klara-13-J1-3` minor · rank 6 · B2 failure has an overly narrow explanation · unasked since 2026-10-14-lt (4 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-klara-13-J1-3` minor · rank 6 · Task 3 note is muddled · unasked since 2026-10-14-lt/recert-3 (2 later runs of this pair)
- `2026-10-16-lt-placement-oos/LT-klara-13-J1-3` minor · rank 4 · B1 slightly generous given repeated missing subjects
- `2026-10-14-lt/recert-3/LT-klara-13-J1-2` polish · rank 2 · Listen task answered with a mishearing, still passed · unasked since 2026-10-16-lt-placement-oos (1 later run of this pair)

## lukas-24 J3 · 10 open · top rank 18

- `2026-10-14-lt/recert-3/LT-lukas-24-J3-1` blocker · rank 18 · B2 learner labelled C1 Fluent · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-lukas-24-J3-1` minor · rank 6 · The recap records activity without consolidating learning · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J3-1` minor · rank 6 · The recommended scene misses his intended social rehearsal · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J3-2` minor · rank 6 · The recap provides no learning takeaway · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J3-3` minor · rank 6 · Repeated evaluation makes the exchange feel like an oral exam · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-lukas-24-J3-3` minor · rank 6 · Recap's "sentence to take with you" is unrelated · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-1/LT-lukas-24-J3-4` minor · rank 6 · Moment took four steps and mission ended with a question unanswered · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J3-2` minor · rank 6 · Recap sentence to take away is not from Lukáš's speech
- `2026-10-14-lt/recert-3/LT-lukas-24-J3-4` minor · rank 6 · Conversation ended after three replies
- `2026-09-15-lt/LT-lukas-24-J3-3` minor · rank 3 · Scenario disclaimers briefly break the social illusion · unasked since 2026-09-15-lt-recert (4 later runs of this pair)

## ondrej-16 J2 · 9 open · top rank 18

- `2026-09-15-lt-recert/LT-ondrej-16-J2-1` blocker · rank 18 · Topic fit fails across the proposals shown · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-ondrej-16-J2-2` blocker · rank 18 · Swaps repeatedly return rejected subject matter · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-ondrej-16-J2-3` blocker · rank 18 · Level label disagrees: TV says A2, phone says B1 · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J2-4` minor · rank 6 · Swap never used, and the summer-job card is a dull shop-manager interview · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-ondrej-16-J2-1` minor · rank 6 · Agreement does not meet the topic-fit threshold · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt/LT-ondrej-16-J2-2` minor · rank 6 · Repeated swaps stay close to the rejected interests · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J2-3` minor · rank 6 · Refusal is a form error, and a legitimate add was never tried
- `2026-09-15-lt-recert2-goal/LT-ondrej-16-J2-4` minor · rank 3 · The first swap repeats the unwanted role theme · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-ondrej-16-J2-4` minor · rank 3 · Level B1 rests on errors in his own answers · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)

## adela-17 J4 · 8 open · top rank 18

- `2026-10-14-lt/recert-5/LT-adela-17-J4-3` blocker · rank 18 · Help is a simplified restatement or an unrelated quiz · recurrence 4, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-4/LT-adela-17-J4-2` blocker · rank 18 · Help does not match what she is stuck on · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-adela-17-J4-4` blocker · rank 18 · Supported flags and recap misstate independence · recurrence 3, first seen 2026-09-15-lt
- `2026-10-14-lt/recert-5/LT-adela-17-J4-2` blocker · rank 18 · Replay offers no fresh question · recurrence 2, first seen 2026-09-15-lt
- `2026-09-15-lt/LT-adela-17-J4-6` blocker · rank 18 · Replay status persists throughout the remaining conversation
- `2026-10-14-lt/recert-5/LT-adela-17-J4-1` blocker · rank 18 · Tutor marks a correct answer wrong and repeats an old correction
- `2026-10-14-lt/recert-4/LT-adela-17-J4-1` major · rank 12 · Replay never taken, so improvement is unproven · recurrence 2, first seen 2026-10-14-lt/recert-4
- `2026-09-15-lt-recert/LT-adela-17-J4-5` minor · rank 3 · Replay instruction persists after the retry is complete

## ondrej-16 J5 · 8 open · top rank 18

- `2026-10-14-lt/recert-3/LT-ondrej-16-J5-3` blocker · rank 18 · Clear errors not flagged · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-ondrej-16-J5-3` blocker · rank 18 · Accurate corrections interrupt too often · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-ondrej-16-J5-2` major · rank 12 · Partner repeats 'What is your name?' after it was answered · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J5-4` minor · rank 6 · Stale 'Now' task prompts · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-ondrej-16-J5-3` minor · rank 6 · Brief refusals still break character · unasked since 2026-09-15-lt-recert (4 later runs of this pair)
- `2026-09-15-lt-recert/LT-ondrej-16-J5-4` minor · rank 6 · The initial topic selection only partly earns his interest · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-ondrej-16-J5-5` minor · rank 6 · Refusals are curt and give him nothing to push on · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-ondrej-16-J5-5` polish · rank 2 · Fix accepted though the retry carried injected text

## sofie-11 J1 · 8 open · top rank 18

- `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-3` blocker · rank 18 · TV headline shows her error as 'Your words'
- `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-2` major · rank 12 · Listen task refers to 'the first one' that was never said · unasked since 2026-10-16-lt-placement-oos/recert-1 (1 later run of this pair)
- `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-4` major · rank 12 · Note praises the answer while the verdict is fail · unasked since 2026-10-16-lt-placement-oos/recert-1 (1 later run of this pair)
- `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-3` minor · rank 6 · B2 task wording too abstract for an 11-year-old · unasked since 2026-10-16-lt-placement-oos/recert-1 (1 later run of this pair)
- `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-5` minor · rank 6 · Verdict quotes her error as 'Your words' · unasked since 2026-10-16-lt-placement-oos/recert-1 (1 later run of this pair)
- `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-4` minor · rank 6 · Verdict text is long and abstract for an 11-year-old
- `2026-10-16-lt-a2b1-tightening/LT-sofie-11-J1-6` polish · rank 2 · Placement lowered one level 'to be safe', confidence low · unasked since 2026-10-16-lt-placement-oos/recert-1 (1 later run of this pair)
- `2026-10-16-lt-placement-oos/recert-1/LT-sofie-11-J1-5` polish · rank 2 · B2 task 5 marked fail though the answer is partial

## klara-13 J2 · 7 open · top rank 18

- `2026-09-15-lt-recert/LT-klara-13-J2-1` blocker · rank 18 · Topic selection remains too generic and sometimes childish · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J2-4` major · rank 12 · Placed B1 although typed errors suggest A2 · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-klara-13-J2-4` major · rank 12 · Level shown differently on TV and phone · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J2-3` minor · rank 6 · Swap never exercised again · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert2-goal/LT-klara-13-J2-3` minor · rank 6 · The recorded preview does not establish full-plan visibility · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt/LT-klara-13-J2-4` minor · rank 3 · Dance activities are a weaker interest match · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-klara-13-J2-5` polish · rank 2 · Added topic reuses partner Mina and sits last

## lukas-24 J5 · 7 open · top rank 18

- `2026-10-14-lt/recert-3/LT-lukas-24-J5-3` blocker · rank 18 · No moments or coaching for a B2 learner again · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-lukas-24-J5-4` major · rank 12 · Level still shown as C1 for a B2 learner · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-lukas-24-J5-4` major · rank 12 · Recap sentence comes from a different scene · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J5-2` major · rank 8 · Redirect wording identical three times
- `2026-10-14-lt/recert-3/LT-lukas-24-J5-5` minor · rank 6 · No prompt-injection or level-change attempt tried · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt-recert/LT-lukas-24-J5-2` minor · rank 6 · Harmless flirting receives the same distancing language · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-09-15-lt-recert/LT-lukas-24-J5-3` minor · rank 3 · Visible topic proposals offer limited direct fit · unasked since 2026-10-14-lt (3 later runs of this pair)

## tomas-9 J3 · 7 open · top rank 18

- `2026-10-14-lt/recert-2/LT-tomas-9-J3-1` blocker · rank 18 · Partner English is above a pre-A1 nine-year-old · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-4/LT-tomas-9-J3-1` blocker · rank 18 · Alex's turns outgrow a nine-year-old after the first two · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-tomas-9-J3-1` blocker · rank 18 · Several Sam turns use words above a beginner nine-year-old · recurrence 3, first seen 2026-09-15-lt-recert2-beginners
- `2026-10-14-lt/recert-5/LT-tomas-9-J3-3` blocker · rank 18 · Grown-up situations are listed for a nine-year-old · recurrence 3, first seen 2026-10-14-lt/recert-2
- `2026-10-14-lt/recert-5/LT-tomas-9-J3-5` major · rank 12 · Sam asks 'What is your name?' again late in the chat
- `2026-10-14-lt/recert-5/LT-tomas-9-J3-2` major · rank 9 · Moment explanation uses grammar jargon · recurrence 4, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-5/LT-tomas-9-J3-4` minor · rank 6 · Plural slip and 'Rex like' went unmarked until a later repeat · recurrence 2, first seen 2026-10-14-lt/recert-4

## adela-17 J3 · 6 open · top rank 18

- `2026-10-14-lt/LT-adela-17-J3-1` blocker · rank 18 · Partner states a wrong rule about 'used to'
- `2026-10-14-lt/recert-5/LT-adela-17-J3-1` major · rank 12 · Missing article 'for environment' never flagged · recurrence 2, first seen 2026-10-14-lt/recert-4
- `2026-10-14-lt/recert-5/LT-adela-17-J3-2` major · rank 12 · Her question about 'possibly' not answered directly
- `2026-10-14-lt/recert-4/LT-adela-17-J3-5` major · rank 9 · Partner speaks of Owen in the third person
- `2026-10-14-lt/recert-5/LT-adela-17-J3-3` minor · rank 6 · Partial answer to 'Is that sentence correct?'
- `2026-10-14-lt/recert-5/LT-adela-17-J3-6` minor · rank 4 · Near-uniform 'Yes, correct' answers feel like confirmation

## ondrej-16 J1 · 6 open · top rank 18

- `2026-10-14-lt/recert-1/LT-ondrej-16-J1-1` blocker · rank 18 · Choice tasks 1-2 near-duplicate and low-information
- `2026-10-14-lt/recert-1/LT-ondrej-16-J1-2` blocker · rank 18 · Next focus is generic and ignores the tense errors
- `2026-10-14-lt/recert-1/LT-ondrej-16-J1-3` major · rank 12 · B1 shown as exact while every B1 answer was only 'nearly there'
- `2026-09-15-lt/LT-ondrej-16-J1-3` major · rank 9 · Repeated clear errors yield no useful feedback · unasked since 2026-09-15-lt-j1b (3 later runs of this pair)
- `2026-09-15-lt/LT-ondrej-16-J1-2` minor · rank 6 · The mission stays elementary after he engages · unasked since 2026-09-15-lt-j1b (3 later runs of this pair)
- `2026-09-15-lt-j1b/LT-ondrej-16-J1-1` minor · rank 6 · B1 narration receives too little credit · unasked since 2026-10-14-lt (2 later runs of this pair)

## jana-29 J1 · 5 open · top rank 18

- `2026-10-14-lt/recert-1/LT-jana-29-J1-2` blocker · rank 18 · Summary and focus are generic and flattering · recurrence 2, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-jana-29-J1-1` major · rank 12 · C2 over-reads a C1 speaker; tasks 4 and 5 passed too easily · recurrence 3, first seen 2026-10-14-lt
- `2026-09-15-lt/LT-jana-29-J1-1` minor · rank 6 · The C2 conclusion exceeds the breadth of evidence · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-jana-29-J1-3` minor · rank 6 · Per-task notes are generic
- `2026-09-15-lt/LT-jana-29-J1-4` minor · rank 3 · Only half the opening starters clearly match Jana's job · unasked since 2026-10-14-lt (3 later runs of this pair)

## martin-45 J3 · 3 open · top rank 18

- `2026-10-14-lt/recert-5/LT-martin-45-J3-1` blocker · rank 18 · "we was promised" and other fossilised errors get no moment · recurrence 5, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-4/LT-martin-45-J3-1` blocker · rank 18 · Fossilised errors beyond one go uncorrected · recurrence 3, first seen 2026-09-15-lt-recert
- `2026-10-14-lt/recert-5/LT-martin-45-J3-2` minor · rank 6 · Scene closes after five replies · recurrence 3, first seen 2026-10-14-lt/recert-1

## dominik-17 J1 · 2 open · top rank 18

- `2026-10-16-lt-placement-oos/LT-dominik-17-J1-3` blocker · rank 18 · Summary generic and focus thin
- `2026-10-16-lt-placement-oos/LT-dominik-17-J1-4` major · rank 12 · Down-shift note unexplained

## petra-38 J1 · 12 open · top rank 12

- `2026-10-14-lt/recert-1/LT-petra-38-J1-1` major · rank 12 · B2 task judged fail despite clear opinion and reasons · recurrence 2, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J1-2` major · rank 12 · B1 placement is high given repeated third-person -s errors · recurrence 2, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J1-3` major · rank 12 · B2 abstract opinion task too hard for A2 anxious learner · recurrence 2, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-10-16-lt-placement-oos/LT-petra-38-J1-4` major · rank 12 · B1 headline is generous for an A2 speaker with low confidence · unasked since 2026-10-16-lt-a2b1-tightening (1 later run of this pair)
- `2026-10-16-lt-a2b1-tightening/LT-petra-38-J1-1` major · rank 12 · B1 placement rests on one answer and the notes contradict it
- `2026-09-15-lt-j1b/LT-petra-38-J1-1` major · rank 9 · The verdict smooths over mixed evidence · unasked since 2026-10-14-lt (4 later runs of this pair)
- `2026-10-14-lt/recert-1/LT-petra-38-J1-4` minor · rank 6 · Summary is somewhat generic · recurrence 2, first seen 2026-10-14-lt · unasked since 2026-10-16-lt-placement-oos (2 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J1-2` minor · rank 6 · The opening assumes Petra has a guardian · unasked since 2026-09-15-lt-j1b (5 later runs of this pair)
- `2026-09-15-lt/LT-petra-38-J1-3` minor · rank 6 · The booking choice misses her hospitality practice · unasked since 2026-09-15-lt-j1b (5 later runs of this pair)
- `2026-09-15-lt-j1b/LT-petra-38-J1-2` minor · rank 6 · The next focus is too general to act on · unasked since 2026-10-14-lt (4 later runs of this pair)
- `2026-10-16-lt-placement-oos/LT-petra-38-J1-3` minor · rank 6 · Task 3 prompt mixes a scenario and a general question · unasked since 2026-10-16-lt-a2b1-tightening (1 later run of this pair)
- `2026-10-16-lt-a2b1-tightening/LT-petra-38-J1-2` minor · rank 6 · Two B2 opinion tasks are a poor check for an A2 receptionist

## oksana-34 J2 · 8 open · top rank 12

- `2026-10-14-lt/recert-3/LT-oksana-34-J2-1` major · rank 12 · Only one interview topic; rest are carrier calls/emails · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-3/LT-oksana-34-J2-2` major · rank 12 · Placed B2, one above true B1 · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-oksana-34-J2-2` major · rank 12 · TV and phone show different levels · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-09-15-lt/LT-oksana-34-J2-1` major · rank 9 · Repeated swaps never produce a relevant majority · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-oksana-34-J2-1` major · rank 9 · Repeated swaps never produce a relevant majority · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt/LT-oksana-34-J2-3` minor · rank 6 · Team, salary, and shift questions disappear from the plan · unasked since 2026-09-15-lt-recert (5 later runs of this pair)
- `2026-09-15-lt-recert/LT-oksana-34-J2-2` minor · rank 6 · Interview addition loses explicit question targets · unasked since 2026-09-15-lt-recert2-goal (4 later runs of this pair)
- `2026-09-15-lt-recert2-goal/LT-oksana-34-J2-3` minor · rank 6 · An explicit carrier-call request needs repeating · unasked since 2026-10-14-lt (3 later runs of this pair)

## lukas-24 J1 · 6 open · top rank 12

- `2026-10-14-lt/recert-3/LT-lukas-24-J1-1` major · rank 12 · C1 awarded despite two partial C1 tasks and hedged simple lexis · recurrence 3, first seen 2026-10-14-lt
- `2026-10-14-lt/recert-1/LT-lukas-24-J1-2` major · rank 12 · Summary praise contradicts task notes · unasked since 2026-10-14-lt/recert-3 (1 later run of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J1-2` major · rank 12 · Summary and focus contradict the task notes
- `2026-09-15-lt/LT-lukas-24-J1-2` minor · rank 6 · The partner does not provide a realistic B2 challenge · unasked since 2026-09-15-lt-j1b (4 later runs of this pair)
- `2026-09-15-lt-j1b/LT-lukas-24-J1-1` minor · rank 6 · The next focus is plausible but insufficiently personal or actionable · unasked since 2026-10-14-lt (3 later runs of this pair)
- `2026-10-14-lt/recert-3/LT-lukas-24-J1-3` polish · rank 2 · Final verdict call failed on first try

## hana-41 J1 · 3 open · top rank 12

- `2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-1` major · rank 12 · B2 task graded fail where partial fits · recurrence 2, first seen 2026-10-16-lt-placement-oos
- `2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-2` minor · rank 6 · Confidence caveat is vague · recurrence 2, first seen 2026-10-16-lt-placement-oos
- `2026-10-16-lt-placement-oos/recert-1/LT-hana-41-J1-3` minor · rank 6 · Next focus is narrow and one-sided

## ivana-33 J1 · 3 open · top rank 12

- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-2` major · rank 12 · Verdict says placed one level lower to be safe, with low confidence
- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-4` minor · rank 6 · Next focus is a generic template line
- `2026-10-16-lt-a2b1-tightening/LT-ivana-33-J1-3` polish · rank 2 · Task 3 marked partial for a correct reasoned answer

# Essay Master

77 open in 10 pairs across 1 runs

recurring 0 · unasked by a later run of their pair 0

Next: these rows are re-checked by an L1 re-walk through the /uat skill. The Linga driver does not rerun them.

## helena-46 EM5 · 11 open · top rank 27

- `2026-10-09-essay-l1/L1-helena-46-EM5-2` blocker · rank 27 · The twin's directness is inverted against Twin Card SPEC 5.1: no hedges reads 'indirect', heavy hedging 'blunt'
- `2026-10-09-essay-l1/L1-helena-46-EM5-1` blocker · rank 18 · Curtain breach: an untitled kept piece is titled from its own first line, and the Workroom shows it
- `2026-10-09-essay-l1/L1-helena-46-EM5-3` blocker · rank 18 · The twin's level words misread email: greeting + sign-off alone make 'ceremonial'; sign-off and name lines count as sentences ('headline', 'brief')
- `2026-10-09-essay-l1/L1-helena-46-EM5-4` blocker · rank 18 · 'Delete everything I kept' leaves the read piece's full text in session.json and on the TV
- `2026-10-09-essay-l1/L1-helena-46-EM5-7` major · rank 12 · Reading a kept email puts every sentence on the TV and its first words on the lens home
- `2026-10-09-essay-l1/L1-helena-46-EM5-8` major · rank 12 · Emails can grow the wrong twin: phone-kept pieces are always 'essay', /drop defaults to 'Message', the shelf hides the format
- `2026-10-09-essay-l1/L1-helena-46-EM5-9` major · rank 12 · 'Never keeps what other people wrote to you' is false: quoted replies and her client emails go verbatim into the card's exemplars
- `2026-10-09-essay-l1/L1-helena-46-EM5-5` major · rank 9 · After the first reading, no remote path leads back to the Workroom
- `2026-10-09-essay-l1/L1-helena-46-EM5-6` major · rank 9 · A kept piece can be read only from the phone; the PC page cannot ask for a reading and the Workroom's piece rows do nothing on OK
- `2026-10-09-essay-l1/L1-helena-46-EM5-10` minor · rank 3 · On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf says pieces arrive from the TV
- `2026-10-09-essay-l1/L1-helena-46-EM5-11` polish · rank 2 · Leaving a piece out of the exemplars still lets its text shape the dims and count toward birth

## kristyna-17 EM1 · 9 open · top rank 27

- `2026-10-09-essay-l1/L1-kristyna-17-EM1-1` blocker · rank 27 · No language check and no word that Essay Master reads English: a Czech paragraph is read with full confidence
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-2` blocker · rank 27 · The splitter joins every sentence opening with Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž or „: five Czech sentences read as 'Sentence 1 of 1', 70 words
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-3` blocker · rank 27 · Code verdicts rest on English word lists: her Czech evidence, concessions and vague words are mis-ruled, with English advice
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-4` blocker · rank 18 · The plan refuses a sentence opening with Š, Č or Ž with a false reason: 'Start it with a capital and end it with a full stop.'
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-6` major · rank 12 · The language of the notes, moves and summary is left to the model: an English prompt over a Czech text, no instruction
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-5` major · rank 9 · ES-READ 3/8: no task, kind, mode, history or memory reach the reading; her cz system and the text's language never do
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-7` minor · rank 6 · Dictate on the Essay tab is en-US only, and nothing says so
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-8` minor · rank 3 · The reading prompt calls a 17-year-old 'a 15-year-old'
- `2026-10-09-essay-l1/L1-kristyna-17-EM1-9` minor · rank 3 · stats.links and stats.words are computed for every reading and shown nowhere

## kristyna-17 EM3 · 7 open · top rank 27

- `2026-10-09-essay-l1/L1-kristyna-17-EM3-1` blocker · rank 27 · The whole piece's counts are code-built from the broken split: '2 of 6 sentences to fix across 6 paragraphs' for 14 Czech sentences
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-2` blocker · rank 18 · A paragraph that fails to come back is never said: it stays dimmed like one being read, its sentences show 'Neutral · Nothing flagged', and the only retry replaces the piece
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-3` major · rank 9 · The forensic page never names the paragraph; 'Start with paragraph P' lives on one lens-home stop, is cut from the landing, and means 'earliest', not 'most important'
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-4` minor · rank 6 · After Delete the phone keeps the deleted piece's id: the next keep-and-read fails 'That piece is not on your shelf.'; typed text becomes a version of the old piece
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-5` minor · rank 6 · A plain title line becomes paragraph 1 of the piece, costs a model call, and can become 'Start with paragraph 1'
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-6` minor · rank 3 · While the first paragraph of a first piece is read, the TV says 'The desk is reading your paragraph'
- `2026-10-09-essay-l1/L1-kristyna-17-EM3-7` minor · rank 3 · GET /api/texts returns noticed and notice that no screen reads

## daniel-15 EM3 · 11 open · top rank 18

- `2026-10-09-essay-l1/L1-daniel-15-EM3-1` blocker · rank 18 · Each paragraph of a piece is ruled on its own paragraph's observations: every intro thesis and conclusion link is faulty under Structure (and opinion theses under Evidence), and 'Start with paragraph k' points at that false fault
- `2026-10-09-essay-l1/L1-daniel-15-EM3-3` major · rank 12 · The Essay box is pre-filled with a sample paragraph; a paste at the cursor fuses it into his first paragraph
- `2026-10-09-essay-l1/L1-daniel-15-EM3-5` major · rank 12 · After a whole-piece read the phone offers 'Next paragraph (2 of 5)', which leads to 'This paragraph only' and replaces the piece's reading
- `2026-10-09-essay-l1/L1-daniel-15-EM3-2` major · rank 9 · Pasting the revised essay makes a second 'Untitled essay', not a version (C6); a 409-refused read also keeps a duplicate
- `2026-10-09-essay-l1/L1-daniel-15-EM3-4` major · rank 9 · The forensic page he is moved to shows neither 'paragraph k of n' nor the summary; the page jumps as paragraphs land; the first wait says 'your paragraph'
- `2026-10-09-essay-l1/L1-daniel-15-EM3-6` major · rank 9 · The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay Master reopens there
- `2026-10-09-essay-l1/L1-daniel-15-EM3-7` major · rank 9 · A title line is read as its own paragraph (a call, a verdict, '5 paragraphs') or fuses into sentence 1; the task never reaches the prompt as a task
- `2026-10-09-essay-l1/L1-daniel-15-EM3-11` minor · rank 6 · Deleting the open piece leaves the phone pointing at it; the next Read with Keep fails 'That piece is not on your shelf.'
- `2026-10-09-essay-l1/L1-daniel-15-EM3-8` minor · rank 6 · A failed paragraph is drawn exactly like one still being read, the phone says 'on the TV', and only a whole re-read gets it back
- `2026-10-09-essay-l1/L1-daniel-15-EM3-9` minor · rank 6 · Nothing says grammar and spelling are not checked; 'Well done' lands on sentences with errors
- `2026-10-09-essay-l1/L1-daniel-15-EM3-10` minor · rank 3 · Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts noticed and notice

## eliska-12 EM1 · 9 open · top rank 18

- `2026-10-09-essay-l1/L1-eliska-12-EM1-1` blocker · rank 18 · A planted unsupported claim placed before the evidence is missed; under Structure the wrong sentence is marked
- `2026-10-09-essay-l1/L1-eliska-12-EM1-2` major · rank 12 · Evidence lens: PEEL's Explain and Link sentences are marked faulty for lacking evidence when the model calls them opinion
- `2026-10-09-essay-l1/L1-eliska-12-EM1-3` major · rank 9 · The pattern guard admits a new-content sentence with one slot (looser than the prompt's 'none of their words')
- `2026-10-09-essay-l1/L1-eliska-12-EM1-4` major · rank 9 · Notes and the summary carry no code guard against ghostwriting: only the prompt protects C1
- `2026-10-09-essay-l1/L1-eliska-12-EM1-5` minor · rank 6 · The forensic crumb, 'Its job' and the table show the regex first-pass role, which can contradict the verdict
- `2026-10-09-essay-l1/L1-eliska-12-EM1-6` minor · rank 6 · cleanNote strips only 'Label:' / 'Label - ': praise-led notes survive on faulty sentences
- `2026-10-09-essay-l1/L1-eliska-12-EM1-7` minor · rank 3 · Code-written lines are not in the young voice: 'asserts', 'checkable', 'That reads as claim.'
- `2026-10-09-essay-l1/L1-eliska-12-EM1-8` polish · rank 2 · stats.links (PEEL's L) and stats.words are computed for every reading and shown nowhere
- `2026-10-09-essay-l1/L1-eliska-12-EM1-9` polish · rank 2 · No refusal for a language the desk does not read: a Czech paragraph goes to the model

## barbora-43 EM4 · 7 open · top rank 12

- `2026-10-09-essay-l1/L1-barbora-43-EM4-1` major · rank 12 · The phone's Recap goes back to 'Arrives when the session ends.' once the TV leaves the recap, on any evening without a maths hint
- `2026-10-09-essay-l1/L1-barbora-43-EM4-2` major · rank 12 · A whole piece is recapped as 'not tonight' or '0 of 0 … all of it right', and the Sunday page calls it one paragraph reading
- `2026-10-09-essay-l1/L1-barbora-43-EM4-3` major · rank 12 · Rewrites that hold never reach the recap: 'k of n to fix' and 'to look at together' count the first reading only
- `2026-10-09-essay-l1/L1-barbora-43-EM4-4` major · rank 12 · Where the text goes and how to delete it covers kept pieces only; a paragraph evening shows no notice and the paragraph stays in session.json
- `2026-10-09-essay-l1/L1-barbora-43-EM4-5` minor · rank 6 · The same paragraph read twice counts its sentences twice
- `2026-10-09-essay-l1/L1-barbora-43-EM4-6` minor · rank 6 · 'Nothing needed a second hint.' on the parent's recap of a writing evening
- `2026-10-09-essay-l1/L1-barbora-43-EM4-7` polish · rank 2 · TV, phone and Sunday page disagree in small ways

## helena-46 EM1 · 7 open · top rank 12

- `2026-10-09-essay-l1/L1-helena-46-EM1-1` major · rank 12 · Adult mode readings are written for 'a 15-year-old' student; mode and stage never reach the prompt
- `2026-10-09-essay-l1/L1-helena-46-EM1-2` major · rank 12 · The kind of writing never reaches the reading, and the Language lens falls back to the essay move 'Claim, then evidence, then the link back'
- `2026-10-09-essay-l1/L1-helena-46-EM1-3` major · rank 12 · A Language length-faulty sentence keeps the model's own note, which was never told the sentence is long
- `2026-10-09-essay-l1/L1-helena-46-EM1-4` minor · rank 6 · Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs
- `2026-10-09-essay-l1/L1-helena-46-EM1-5` minor · rank 3 · Four reading fields are computed and never shown (provider, stats.links, stats.words, sentences[].connectors)
- `2026-10-09-essay-l1/L1-helena-46-EM1-6` polish · rank 2 · The phone refuses a .docx that the PC page accepts
- `2026-10-09-essay-l1/L1-helena-46-EM1-7` polish · rank 2 · No refusal for a language the desk does not read (EM1 D5, third branch)

## daniel-15 EM2 · 5 open · top rank 12

- `2026-10-09-essay-l1/L1-daniel-15-EM2-1` major · rank 12 · In a piece, a rewrite is ruled against cross-paragraph context while the first reading was paragraph-only, so a near-unchanged thesis or conclusion 'holds' and THE MOVE inks
- `2026-10-09-essay-l1/L1-daniel-15-EM2-2` major · rank 12 · A still-faulty rewrite's caption is the model's note, never the code's reason; it can praise what the code failed (C5)
- `2026-10-09-essay-l1/L1-daniel-15-EM2-3` major · rank 12 · LINK regex lacks a word boundary: sentences opening 'Some', 'Social', 'Sometimes', 'Soon', 'Software' are read as links
- `2026-10-09-essay-l1/L1-daniel-15-EM2-5` major · rank 12 · Rewrites never reach the phone's text or the shelf; reading the piece again re-reads the original and wipes them
- `2026-10-09-essay-l1/L1-daniel-15-EM2-4` major · rank 9 · The ghostwriting backstop checks only the pattern's literal words against the same sentence; notes, the summary, slot contents and neighbour sentences pass (C1)

## eliska-12 EM2 · 5 open · top rank 12

- `2026-10-09-essay-l1/L1-eliska-12-EM2-2` major · rank 12 · The playbook fallback teaches a three-sentence frame that the one-sentence rewrite refuses
- `2026-10-09-essay-l1/L1-eliska-12-EM2-1` major · rank 9 · False 'holds': a rewrite that is still only opinion holds when a later sentence carries a marker word
- `2026-10-09-essay-l1/L1-eliska-12-EM2-3` minor · rank 6 · Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no evidence'
- `2026-10-09-essay-l1/L1-eliska-12-EM2-5` minor · rank 6 · After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next faulty sentence; the 'Rewrite on my phone' instruction lands only on the bench status bar
- `2026-10-09-essay-l1/L1-eliska-12-EM2-4` minor · rank 3 · Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dictated mid-paragraph rewrite is always refused

## barbora-43 EM1 · 6 open · top rank 9

- `2026-10-09-essay-l1/L1-barbora-43-EM1-1` major · rank 9 · Notes and the summary have no code guard against a supplied sentence (new content or the learner's own)
- `2026-10-09-essay-l1/L1-barbora-43-EM1-2` major · rank 9 · The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample paragraph
- `2026-10-09-essay-l1/L1-barbora-43-EM1-3` major · rank 9 · ES-READ grounding 3/8: the reading never sees the assignment, her earlier readings, her notes, the mode or the kind of writing
- `2026-10-09-essay-l1/L1-barbora-43-EM1-4` minor · rank 6 · The Language lens falls back to the Paragraph structure move when the model's fix is dropped
- `2026-10-09-essay-l1/L1-barbora-43-EM1-6` minor · rank 6 · The phone's paragraph box is prefilled with a sample, and reading it files a reading as hers
- `2026-10-09-essay-l1/L1-barbora-43-EM1-5` minor · rank 4 · No language check before the wait: a Czech paragraph goes straight to the model

# Math Buddy

89 open in 13 pairs across 1 runs

recurring 0 · unasked by a later run of their pair 0

Next: these rows are re-checked by an L1 re-walk through the /uat skill. The Linga driver does not rerun them.

## radka-41 MB5 · 7 open · top rank 27

- `2026-10-09-maths-l1/L1-radka-41-MB5-1` blocker · rank 27 · The recap's hints, 'Needed a second hint' list and minutes are never reset: a night with nothing done reads as yesterday's
- `2026-10-09-maths-l1/L1-radka-41-MB5-2` blocker · rank 18 · The Sunday page ignores homework evenings and papers: a week of homework help reads 'Nothing this week.'
- `2026-10-09-maths-l1/L1-radka-41-MB5-4` minor · rank 6 · Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back'; the system silently defaults to UK
- `2026-10-09-maths-l1/L1-radka-41-MB5-5` minor · rank 6 · Code-written questions print UK decimal points and £/€ to a cz learner whose answers are expected with a comma
- `2026-10-09-maths-l1/L1-radka-41-MB5-6` minor · rank 6 · A skipped (blank) typed answer is shown as 'The desk is not sure' and counted as the desk's doubt
- `2026-10-09-maths-l1/L1-radka-41-MB5-7` minor · rank 6 · The recap and the week cover only the child seated now
- `2026-10-09-maths-l1/L1-radka-41-MB5-8` minor · rank 6 · The digest records notSure but the Sunday page never shows it (present-but-unwired)

## nela-12 MB1 · 5 open · top rank 27

- `2026-10-09-maths-l1/L1-nela-12-MB1-1` blocker · rank 27 · Czech sheet notation is not read: the hint loses its code leak check, gets a linear-equations stance, and the picker is asked of a linear library
- `2026-10-09-maths-l1/L1-nela-12-MB1-2` major · rank 9 · The next evening, "I have homework" reopens the first sheet ever snapped and never asks for tonight's
- `2026-10-09-maths-l1/L1-nela-12-MB1-4` minor · rank 6 · MB-READ 2/5: the page read knows neither her school system, her topic nor her age; item numbers must be integers
- `2026-10-09-maths-l1/L1-nela-12-MB1-5` minor · rank 6 · MB-HINT 4/8: the hint sees no method card, none of her working and none of her recorded slips
- `2026-10-09-maths-l1/L1-nela-12-MB1-3` minor · rank 3 · The withheld hint lines for her units are 31–54 words (C4)

## nela-12 MB5 · 5 open · top rank 27

- `2026-10-09-maths-l1/L1-nela-12-MB5-1` blocker · rank 27 · The recap says "Good evening's work - all of it right." on an evening where nothing was marked
- `2026-10-09-maths-l1/L1-nela-12-MB5-2` blocker · rank 18 · The evening log never resets: hint counts, "Needed a second hint" and the memory's hint count carry every earlier evening
- `2026-10-09-maths-l1/L1-nela-12-MB5-3` major · rank 12 · The week page cannot see homework evenings ("Nothing this week." after three sheets)
- `2026-10-09-maths-l1/L1-nela-12-MB5-4` minor · rank 6 · The school system defaults silently to UK, and the row's blurb does not say it decides how 0,5 is read
- `2026-10-09-maths-l1/L1-nela-12-MB5-5` minor · rank 3 · A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off)

## vojtech-18 MB1 · 5 open · top rank 27

- `2026-10-09-maths-l1/L1-vojtech-18-MB1-1` blocker · rank 27 · The code leak guard reads none of his tasks: Czech-printed items, maturita shapes, and 'Solve ...' without a colon
- `2026-10-09-maths-l1/L1-vojtech-18-MB1-2` major · rank 9 · Every maturita task gets the 'factoring and linear-equations unit' stance, for 'a 15-year-old' (C6)
- `2026-10-09-maths-l1/L1-vojtech-18-MB1-3` major · rank 9 · The page read prompt carries no school system or notation (MB-READ 2/5)
- `2026-10-09-maths-l1/L1-vojtech-18-MB1-4` major · rank 9 · Hints, Point & ask presets and speech are English only, with no word cap (C7)
- `2026-10-09-maths-l1/L1-vojtech-18-MB1-5` minor · rank 6 · The recap counts hints and second hints but cannot say which problems

## radka-41 MB1 · 4 open · top rank 27

- `2026-10-09-maths-l1/L1-radka-41-MB1-2` blocker · rank 27 · A homework night with hints and nothing marked ends on 'Good evening's work - all of it right.'
- `2026-10-09-maths-l1/L1-radka-41-MB1-1` blocker · rank 18 · The hint's leak backstop is blind on Czech-printed items and Czech notation
- `2026-10-09-maths-l1/L1-radka-41-MB1-4` major · rank 12 · MB-READ 2/5: the page read knows nothing of the school system, the age or the topic
- `2026-10-09-maths-l1/L1-radka-41-MB1-3` major · rank 9 · MB-HINT 4/8: no school system, no course, no working, no slips; a fixed wrong-unit stance

## matyas-19 MB3 · 11 open · top rank 18

- `2026-10-09-maths-l1/L1-matyas-19-MB3-1` blocker · rank 18 · False tick: a decimal estimate within 0.5% of an exact limit or definite integral is ticked right (2.999, 3.014 for 3; 0.4996 for 1/2; 9.04 for 9)
- `2026-10-09-maths-l1/L1-matyas-19-MB3-2` blocker · rank 18 · False tick: "ln x + C" is ticked right for the antiderivative of 1/x
- `2026-10-09-maths-l1/L1-matyas-19-MB3-3` major · rank 12 · Implicit differentiation cannot be practised: "The chain rule and implicit differentiation" sets only y = f(x) derivatives
- `2026-10-09-maths-l1/L1-matyas-19-MB3-4` major · rank 12 · Typed answers are capped at 40 characters; the phone cuts a quotient-rule answer silently and the item comes back "not sure"
- `2026-10-09-maths-l1/L1-matyas-19-MB3-5` major · rank 12 · An unsure item says "I got something different for number N", and the checker's own reason (why) is computed and dropped
- `2026-10-09-maths-l1/L1-matyas-19-MB3-7` major · rank 12 · No pen for working in prime notation, with a u = substitution line, or with chained lim lines: every line is null
- `2026-10-09-maths-l1/L1-matyas-19-MB3-9` major · rank 12 · A chain-rule set is not required to be composite functions; code keeps any well-formed derivative spec
- `2026-10-09-maths-l1/L1-matyas-19-MB3-10` minor · rank 6 · Topic name "The area-so-far function" is the American course word the Character names as a pet peeve
- `2026-10-09-maths-l1/L1-matyas-19-MB3-11` minor · rank 6 · The explain prompt carries neither his answer, his working nor the slip the desk found (MB-EXPLAIN 3/8)
- `2026-10-09-maths-l1/L1-matyas-19-MB3-6` minor · rank 6 · Czech notation is unreadable on Calculus answers: decimal comma, tg/arctg, + K, + C1 are "not sure"; the profile's cz system is not used
- `2026-10-09-maths-l1/L1-matyas-19-MB3-8` minor · rank 6 · Code never names the chain-rule slip (or an extra +C); on the typed route a dropped chain factor gets the generic line

## owen-17 MB2 · 9 open · top rank 18

- `2026-10-09-maths-l1/L1-owen-17-MB2-1` blocker · rank 18 · False tick: a typed mixed number on a linear item is read as a product, so a wrong "1 3/4" for x = 3/4 is ticked right
- `2026-10-09-maths-l1/L1-owen-17-MB2-2` major · rank 12 · False ring: a correct mixed-number root ("1 1/5" for x = 6/5, "-1 1/2" for -3/2) is ringed wrong on a linear item
- `2026-10-09-maths-l1/L1-owen-17-MB2-7` major · rank 12 · Photo marking (the default "Snap the sheet") rests on what vision reads; the linear photo prompt asks for "a plain number or simple fraction"
- `2026-10-09-maths-l1/L1-owen-17-MB2-3` major · rank 9 · Fraction sets never practise the forms his mock tested: no mixed-number operands, no word problems; "A step up" only shifts the tier mix
- `2026-10-09-maths-l1/L1-owen-17-MB2-4` major · rank 9 · Slip lines on the walk run 26-37 words: line length 0.54 against >= 0.9
- `2026-10-09-maths-l1/L1-owen-17-MB2-5` minor · rank 6 · UK-habit answers read "not sure": £ on a euro item, "cm squared", "sq cm", "pounds"
- `2026-10-09-maths-l1/L1-owen-17-MB2-6` minor · rank 6 · The unsure line says "I got something different for number N" for a rounded right answer and for a blank
- `2026-10-09-maths-l1/L1-owen-17-MB2-8` minor · rank 6 · Get ready for school (the road his paper sends him down) skips the worked lesson
- `2026-10-09-maths-l1/L1-owen-17-MB2-9` minor · rank 6 · An explain reply never sees his answer or the slip code found (MB-EXPLAIN 3/8)

## radka-41 MB4 · 9 open · top rank 18

- `2026-10-09-maths-l1/L1-radka-41-MB4-1` blocker · rank 18 · 'No marks were lost' when the lost marks sit on questions with no statement picked
- `2026-10-09-maths-l1/L1-radka-41-MB4-2` blocker · rank 18 · Full-loss fan-out and the prerequisite pull open a 9th-grader's mock on 'One-step equations · 2 lost', with rows adding up to 30 of 28
- `2026-10-09-maths-l1/L1-radka-41-MB4-3` major · rank 9 · No Select on the recovery list: 7 presses to the first topic's set, via a screen that does not know the paper
- `2026-10-09-maths-l1/L1-radka-41-MB4-4` major · rank 9 · 97 GCSE-worded statements, 41 with specialist or UK-curriculum terms, to map a CERMAT mock
- `2026-10-09-maths-l1/L1-radka-41-MB4-5` minor · rank 6 · A blank 'Scored' (a zero) is refused as 'not a whole number'; dropped rows silently change the TV total
- `2026-10-09-maths-l1/L1-radka-41-MB4-6` minor · rank 6 · GCSE tier facts presented as facts about her paper: 'beyond a Foundation paper', 6-mark and 80-mark caps
- `2026-10-09-maths-l1/L1-radka-41-MB4-7` minor · rank 6 · 'Secure on the desk' printed beside a topic that lost marks on the paper
- `2026-10-09-maths-l1/L1-radka-41-MB4-9` minor · rank 6 · The set the recovery leads to never sees the paper (MB-SET 2/7 for the equations units)
- `2026-10-09-maths-l1/L1-radka-41-MB4-8` minor · rank 4 · The Paper panel never names whose record the paper goes to

## owen-17 MB4 · 7 open · top rank 18

- `2026-10-09-maths-l1/L1-owen-17-MB4-1` blocker · rank 18 · One broad statement spreads a loss over 3 topics: the list shows decimals rows he never lost marks on and holds 14 of the 17 desk topics
- `2026-10-09-maths-l1/L1-owen-17-MB4-2` blocker · rank 18 · 10 of 13 off-desk statements (20 marks, incl. quadratics and rearranging) appear only as "and 10 more", named nowhere
- `2026-10-09-maths-l1/L1-owen-17-MB4-3` major · rank 9 · No step from a recovery row to its practice: Select does nothing, Back lands on Equivalent fractions, the caption does not say how
- `2026-10-09-maths-l1/L1-owen-17-MB4-4` minor · rank 6 · A beyond-Foundation statement is not demoted inside the off card and takes one of its 3 visible slots
- `2026-10-09-maths-l1/L1-owen-17-MB4-5` minor · rank 6 · The statement picker: 97 checkboxes per row, no search, percentages under "Ratio, proportion and rates of change", three fraction statements whose choice changes the rows
- `2026-10-09-maths-l1/L1-owen-17-MB4-6` minor · rank 6 · 31 typed paper rows live only in React state: a phone reload or tab discard loses them
- `2026-10-09-maths-l1/L1-owen-17-MB4-7` minor · rank 6 · Get ready for school labels a 17-year-old's topics "Year 5" to "Year 9"

## vojtech-18 MB4 · 6 open · top rank 18

- `2026-10-09-maths-l1/L1-vojtech-18-MB4-1` blocker · rank 18 · 'No marks were lost on this paper' when every lost mark sits on a question with no statement
- `2026-10-09-maths-l1/L1-vojtech-18-MB4-2` blocker · rank 18 · Partial statement links force maturita questions onto 5.–8. ročník units and lead the list with them (C5)
- `2026-10-09-maths-l1/L1-vojtech-18-MB4-3` major · rank 9 · The list never says that 24 of 32 lost marks are off the desk; the off-desk card shows 3 of 13
- `2026-10-09-maths-l1/L1-vojtech-18-MB4-4` major · rank 9 · No Select on the recovery list; Back lands on Equivalent fractions; 16 presses to a set on the first topic
- `2026-10-09-maths-l1/L1-vojtech-18-MB4-5` major · rank 9 · The statement picker is about 100 English GCSE statements with 'beyond a Foundation paper' flags
- `2026-10-09-maths-l1/L1-vojtech-18-MB4-6` minor · rank 6 · The TV never shows which statement led a question to a topic (topics[].codes unwired)

## vojtech-18 MB2 · 10 open · top rank 12

- `2026-10-09-maths-l1/L1-vojtech-18-MB2-2` major · rank 12 · A right answer in his notation ('c = 34 mm', 'P(A) = 3/13') is unsure, and the desk says 'I got something different'
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-7` major · rank 12 · The Pythagoras leak rule lets 'the square root of 1156' and 'c squared is 1156' through
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-8` major · rank 12 · Photo marking of his handwritten sheet is unverified; the read prompt carries no system or notation
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-3` major · rank 9 · The nearest units to his exam set primary-school items, even as a step up (set fit 0-2 of 6)
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-4` major · rank 9 · Topics and Get ready for school open on Equivalent fractions (5. ročník) for an 18-year-old
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-5` major · rank 9 · No line tells him his year is past the end of the path; the Prepare door promises 'what school is teaching next'
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-6` major · rank 9 · The explain path is hold-to-speak in en-US only; typing appears only without a mic
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-10` minor · rank 6 · Money in percent-change items is £ for a cz learner; '536 liber' is unsure
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-11` minor · rank 6 · Czech number words are not read by the leak rule
- `2026-10-09-maths-l1/L1-vojtech-18-MB2-9` minor · rank 6 · Topic blurbs on the caption exceed 25 words (C7, line length 0.84)

## nela-12 MB2 · 7 open · top rank 12

- `2026-10-09-maths-l1/L1-nela-12-MB2-1` major · rank 12 · An unsure item's card says "I got something different for number N", even when her value is right or the box is blank; the code's own reason is unwired
- `2026-10-09-maths-l1/L1-nela-12-MB2-2` major · rank 12 · Explaining is en-US speech only; there is no typed box while a speech recogniser exists
- `2026-10-09-maths-l1/L1-nela-12-MB2-4` minor · rank 6 · Questions and worked examples print decimal points and £/€ for a cz learner, while the answers print commas
- `2026-10-09-maths-l1/L1-nela-12-MB2-5` minor · rank 6 · The walk card's slip lines for her units run 26–32 words (C4)
- `2026-10-09-maths-l1/L1-nela-12-MB2-6` minor · rank 6 · Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read
- `2026-10-09-maths-l1/L1-nela-12-MB2-7` minor · rank 6 · Unsimplified sums are ticked right, while the worked lesson teaches "then simplify"
- `2026-10-09-maths-l1/L1-nela-12-MB2-3` minor · rank 4 · MB-EXPLAIN 3/8: the reply cannot see her written answer, her working or the slip the code found

## matyas-19 MB1 · 4 open · top rank 12

- `2026-10-09-maths-l1/L1-matyas-19-MB1-1` major · rank 12 · On his Czech-worded sheet the hint's Calculus leak check never runs; the general rule lets "The limit is 3" through
- `2026-10-09-maths-l1/L1-matyas-19-MB1-2` major · rank 12 · A step that completes the answer passes the leak guard ("Multiply cos(x^2) by 2x"), and hint 2 is asked to go one step further
- `2026-10-09-maths-l1/L1-matyas-19-MB1-3` major · rank 9 · His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question sets are marked
- `2026-10-09-maths-l1/L1-matyas-19-MB1-4` minor · rank 6 · The page read prompt carries no course, notation or language (MB-READ 2/5); a LaTeX transcription reads as no Calculus item
