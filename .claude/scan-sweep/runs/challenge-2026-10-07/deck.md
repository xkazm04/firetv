# Deck - challenge-2026-10-07 (moonshot, plan M3 / owner goal 2)

Base 27c66e1e. Cohort: math-buddy, linga, essay-master (picker overridden: plan M3 / owner goal 2; essay-master a host, not a rider). Scouts and critic: claude-opus-5-5, critic a separate subagent that saw only the cards and the tree. **Stopped at the deck: unattended, no --go. Nothing built.**

OPEN BACKLOG (section 0, counted from the files): followup-2026-09-25 2 of 3 open (vision-lab single-root leak, phone End session copy); optimize-2026-09-30 1 of 1 (essay rewriteStatus comment); optimize-2026-09-30-landing 1 of 1 and optimize-2026-09-30-linga 1 of 1 (context-map omissions, architecture). None overlaps a card below.

| # | card | size | effort | risk | impact | gate | write_set (+new) | cases | critic A/G/F | mean | rank | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **essay-master-B** Write it on the sofa: fill the Paragraph's three slots, then OK reads it | M | 7 | 6 | 8 | direction | 12 (+0) | 8 | 5/5/5 | 5 | 40 | build |
| 2 | **math-buddy-A** A slip is set again on purpose, and rubbed out of the ruler when it stops | M | 7 | 6 | 8 | direction | 11 (+2) | 8 | 4/5/5 | 4.67 | 37.4 | build |
| 3 | **math-buddy-B** Six like this one: a homework problem's unit, practised in one press | M | 6 | 4 | 8 | direction | 7 (+1) | 7 | 4/5/4 | 4.33 | 34.6 | build |
| 4 | **linga-A** Code decides what counts as the child's own words: credit leaves the prompt | M | 6 | 6 | 8 | policy-tighten | 4 (+2) | 7 | 4/5/4 | 4.33 | 34.6 | revised -> build |
| 5 | **linga-B** Every scene is a mission: steps lit on the TV as the child reaches them | M | 7 | 6 | 8 | contract | 6 (+2) | 8 | 5/4/4 | 4.33 | 34.6 | build |
| 6 | **essay-master-A** The model observes, code rules: every essay verdict decided in rules/essay | M | 7 | 6 | 8 | policy-tighten | 6 (+0) | 8 | 3/5/4 | 4 | 32 | revised -> build |

Rank = impact x critic mean. Ties at 34.6 are broken by build order below, not by rank.

## Critic lines

- **essay-master-B** (direction) - Blank page to a read paragraph in the learner's own words, slots hatched then inked on TV; Phase 1 deferred item, owner direction call.
- **math-buddy-A** (direction) - Six more truly aims at the child's slips in code, and a beaten slip's scratch leaves the ruler; additive learners.json field, owner direction.
- **math-buddy-B** (direction) - On a school-unit homework problem the dead 'No lesson' pill becomes 'Six like this': two presses, code-written set, homework reaches the ruler.
- **linga-A** (policy-tighten) - Certificates stop being reachable by 'Yes, thank you' twice or read-back lines; fix the over-loose repair shape before building. *Revised: critic: bare wh-words dropped from the repair markers; case 5 pins 'Where did Pip go' -> none and adds 'Which bridge do you mean' -> own.*
- **linga-B** (contract) - Scenes get 2-3 code-checked steps lit as dots on the TV and a 'Mission done' end; designed in LINGA-CONVERSATION-DESIGN, writes no evidence.
- **essay-master-A** (policy-tighten) - Moves essay verdicts out of the prompt per repo law; honest Secure seal and ink, little visible to the family. Pin the structure rule first. *Revised: critic: case 1 now states the structure rule it pins.*

## Gates on this deck

- **direction** (essay-master-B, math-buddy-A, math-buddy-B): new capabilities inside each module's scope. Approving the deck is the owner's direction call (references/challenge.md section 6).
- **contract** (linga-B): the scene contract gains steps. In-tree only, and the card lists its consumers.
- **policy-tighten** (linga-A, essay-master-A): move a decision out of a prompt into code, as repo law requires. Builds on deck approval.
- No card is `irreversible`, `policy-loosen` or cross-repo, so none is excluded.

## Overlaps (the critic's list): these set the build order

- essay-master A x B: desk/src/lib/rules/essay.ts, tools/essay-rules-test.cjs, docs/DESIGN-ESSAY-MASTER.md
- linga A x B: desk/src/lib/english/conversation.ts (the turn path near :221-229)
- math-buddy A x B: desk/src/lib/rules/kinds.ts, desk/src/maths/MathsTV.tsx, desk/src/tv/mathsRows.ts, docs/DESIGN-MATH-BUDDY.md
- essay-master B x math-buddy B: desk/src/tv/keys.ts (hot file)
- linga A, linga B, math-buddy A, math-buddy B: desk/package.json (test:rules append, shared-surface lock)
- Signature changes: math-buddy A (kinds.ts Attempt, makeSchoolItems aim), linga A (validateObservations context), essay-master B (store.ts Screen union, ESSAY_SCREENS), essay-master A (model reply schema drops verdict; tools/voice-rules-test.cjs pins it today)

## Build order (one card per run, delivery's slot)

1. **essay-master-B**: the top rank and the biggest change for the family: the blank page becomes a read paragraph in the child's own words. It adds the store.ts and keys.ts changes, so it goes first and every later keys.ts edit builds on top of it.
2. **math-buddy-A**: it changes the kinds.ts Attempt signature that math-buddy-B also edits, so it lands before B.
3. **math-buddy-B**: builds on the kinds.ts change from 2 and the keys.ts change from 1. Small, and homework reaches the ruler.
4. **linga-A**: it changes the signature of the conversation.ts turn path, which linga-B also edits. It also makes a step's credit mean the child's own words before missions are counted.
5. **linga-B**: the most ambitious Linga card (ambition 5). It goes on the turn path once 4 has settled it.
6. **essay-master-A**: lowest ambition. It is plumbing the family does not see. It shares rules/essay.ts with 1, so it goes last.

## Measured

- Tokens, as the agents reported them: scouts 647,876 (math-buddy 262,388, linga 220,318, essay-master 165,170). Critic 124,508. Coordinator: not reported (null).
- Wall clock: 2026-10-07T10:12:35Z (run dir created) to 10:36Z (deck), about 24 min.
- idea_score: ambition 4.17, grounding 4.83, falsifiability 4.33 (mean 4.44). 0 premise false, 0 void, 2 revised.
- No challenge-runs.jsonl row and no section 10 snapshots were written. At a deck stop the skill asks only for the open-backlog register row (section 9). The scorecard row is owed when the cards are built.
