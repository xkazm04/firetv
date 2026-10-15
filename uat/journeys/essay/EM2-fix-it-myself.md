# EM2 · Fix it myself

promotion: discovery

## Goal (user's words)

"Let me rewrite the bad sentence on my phone and tell me straight away whether it works now."

## Definition of done

- The Character rewrites a sentence the desk marked, on the phone, in their own words, and the TV judges that one sentence again where it stands in the paragraph.
- A rewrite that does the job is shown as done; one that does not stays open with a reason they understand.
- The rest of the paragraph's verdicts stay as they were.
- At no point does the desk supply the sentence, however they ask for it.
- They finish knowing the name of the move they made.

## Levels

- **L1 (always).** A walker over the forensic page's actions, the phone's rewrite panel, the refusals before any model call and the rule that decides whether a rewrite holds.
- **L2 through `tools/essay-ui-test.cjs`, partly.** Step W5 bears on it directly: the TV walked to sentence 4, Rewrite on my phone, a fixed rewrite sent from the phone, the sentence judged again, every other verdict checked unchanged, the time recorded; W4 records the move and pattern that were taught. It does **not** cover: a rewrite that is still faulty (the run's rewrite turned strong); the refusals (blank, two sentences, the same sentence again); a rewrite sent by dictation; a learner text that asks the desk to rewrite it (Daniel's C1); a sentence other than the fourth; any learner but Sam with the fixed rewrite (`tools/essay-ui-test.cjs:29`). A Character-specific L2 needs the rewrite, the sentence index and the learner made parameters.

## Characters

`eliska-12`, `daniel-15`.
