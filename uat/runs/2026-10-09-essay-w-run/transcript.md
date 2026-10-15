# Essay W-run transcript, 2026-10-09 (M5 goal 3)

Learner Sam (essay-browser-teen, high-school, 15). Lens: Evidence. Engine: claude-cli/sonnet. Source: results.json (W4, W5).

## The paragraph (fixed)

1. Schools should start later in the morning.
2. During puberty, teenagers' body clocks shift later, so many cannot fall asleep before 11 pm.
3. When Seattle moved its high-school start from 7:50 to 8:45 in 2016, students slept about 34 minutes more each night.
4. Also it is just better and everyone knows it.
5. That is why a later start would help students learn.

## What the desk showed (first reading, 27551 ms)

| n | verdict | problem (note) | move | pattern |
|---|---|---|---|---|
| 1 | neutral | This is your claim, so it needs no proof itself, but the rest must back it up. | none | none |
| 2 | neutral | You name a mechanism, body clocks shifting in puberty, and a 11 pm figure a reader could look up. | none | none |
| 3 | neutral | Strong: a named place, year, start times and 34 minutes make this easy to check. | none | none |
| 4 | faulty | This only asserts; 'everyone knows it' and 'better' give nothing a reader can check. | Replace assertion with a result | Also, [a specific measured benefit] in [place or study]. |
| 5 | faulty | This links sleep to learning, but gives no grades, test scores or attendance to show learning improved. | Add a learning measurement | After the change, [grades, attendance or test result] [rose or fell] by [amount]. |

Summary: "Sentences 2 and 3 give checkable support, but sentences 4 and 5 only assert, so add a real number linking sleep to learning."

The TV (tv-coached.png) showed sentence 4: the problem, the move as a hatched plate (not yet earned), the pattern with two slots, and the four actions.

## The rewrite (sentence 4)

Sent from the phone: "Also, in the same study, students' grades in their first class of the day went up." (23057 ms, claude-cli/sonnet)

- Before: faulty. After: **strong**. Note: "This names a measurable result (grades in first class went up) and a source (the same study), but gives no size of the change, so a reader can't tell how big it was." No fix. `was` kept the first sentence, its verdict and its fix.
- Every other verdict (1, 2, 3, 5) kept, verdict and note identical (results.json W5 `everyOtherVerdictKept: true`).

## Ghostwriting check (reported, not asserted)

- No note, move, pattern or the summary contains a whole learner sentence (`textsThatContainAWholeLearnerSentence` is empty, results.json W4).
- Both patterns are slotted templates. The one learner word in sentence 4's pattern is "Also,", the sentence's own opening connector; the rest are bracketed slots. Sentence 5's pattern has none of the learner's words.
- I read no text as a rewritten version of the learner's sentence. The harness check is a substring test and cannot see a paraphrase; the table above is what the owner should read.

## Builder's reading (mine, not a finding of the harness)

- The coaching is usable: sentences 4 and 5 are the two a reader would flag, and sentence 4's problem names the exact words ("everyone knows it") that make it unprovable.
- Sentence 3's note starts "Strong:" while its verdict is neutral. On the Evidence lens a checkable sentence appears to land neutral, with strong earned after a rewrite; the wording is the model's, the verdict is code's. A learner reading both may find that odd. I did not trace the rule.
- Sentence 4 came back strong although its own note says the size of the change is missing: the verdict is decided in code from the support type, the note is the model's free comment. Two truths on one screen; worth the owner's eye.
- Sentence 5 stays faulty by design (the other verdicts are kept), even though the rewrite of sentence 4 adds the learning evidence it asked for.
- The rewrite is a student-style sentence that fits the move, so it is a fair, not a hard, test of the re-judging.
