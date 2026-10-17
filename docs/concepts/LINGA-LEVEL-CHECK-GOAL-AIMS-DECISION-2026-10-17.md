# Linga level check: the goal rule works per aim, decision record of 2026-10-17

State described: main at 5f9edab8. Source files: `desk/src/lib/english/placement.ts`, `desk/src/lib/english/check.ts`. Commits: 4b7ef8fa (LG-55 third pass), 8b8111b7 (LG-8 third pass), 5f9edab8 (backlog lines). The decision is **not live-verified**. Where the commits and the backlog show no reason or no alternative, this record says "not recorded".

## 1. Constraint that forced the choice

LG-55 (`docs/BACKLOG.md`) covers level-check tasks that repeat or ignore what the learner said. The second pass added a rule: when a stated goal is touched by no earlier task, the next say task at B1 or above must be set in that goal (`goalTaskDue`, `check.ts` `advance()`).

On the second recert (2026-10-16-lt-placement-oos/recert-2) the rule never fired for oksana-34. The trace (backlog, LG-55 third pass) found the cause: `goalUntouched` counted the whole goal as touched when **any one stem** of it appeared in **any one task**. Her goal is compound (carrier calls, a job interview, questions to ask about the team). Task 1, "call the carrier", touched only her carrier aim, yet it touched the goal, so no later task was ever due in the interview aim.

Her real goal text is not in the run JSON (the about step's goal is not stored there), so the test uses a stated reconstruction.

## 2. Decision

The goal rule works per aim.

- `goalAims(goal)` (`placement.ts`) splits a goal into aims at sentence ends, semicolons and "also". Each aim keeps its situation stems. Day and month words (`GOAL_STOP`) and framing words such as want, better, answer, question, problem, example (`GOAL_GENERIC`) do not count. An aim left with no stem is dropped.
- `goalAim(goal, earlier)` returns the first aim that no earlier task prompt (or line) touches, or "" when there is no goal or every aim is reached. The touch check is the same word check as `touchesInterest`.
- `goalUntouched` is now `!!goalAim(...)`; `goalTaskDue` is unchanged in shape (say task, band B1 or above, an aim untouched).
- `advance()` names the untouched aim to the tutor (`goalTask(aim)`: "no earlier task touches this aim of it") and in the single re-ask when the answer still misses that aim.

Pinned by the rules test "LG-55 third pass" in `tools/linga-rules-test.cjs`: the reconstructed goal splits into three aims, task 1 leaves the interview aim untouched, the interview aim is the one named, generic framing alone is no aim. `sameTask` is unchanged.

## 3. Alternatives that lost

- **Keep the whole-goal match and add more stems or a stricter threshold.** Not recorded. The commits show only that the any-stem match was the cause (c) and that aims replaced it.
- **Require every stem of the goal to be touched.** Not recorded.
- **Synonym or model-based matching of a task to a goal.** Not recorded as considered. The second pass states the limit: no synonyms, a "meeting" does not touch an "interview". The third pass keeps that limit.
- **Reading the goal from another field.** Checked and ruled out as the cause: the goal lives in `k.goal` and the rule reads it (backlog, LG-55 third pass, item b).

## 4. LG-8 companion rule

The same recert round showed the summary's focus following a trivial or listen-borne slip (hana-41, martin-45). 8b8111b7 changed `keepSlips` (`check.ts`):

- A listen answer is the learner echoing a line they heard, so it is no longer a source of slips. A slip found only in a listen answer is dropped.
- A slip the learner repeated comes first: the same said or better form listed twice by the model, or the said words found in two or more answers. Otherwise the model's order stands. At most three are kept.
- `focusFollowsSlip` follows that first slip.

Alternatives for this rule: not recorded.

## 5. Ceiling and verification

From the backlog's ceiling lines:

- Goal rule: aims that are only fragments ("team, salary and shifts") stay due until a task names one of them. The match is still word overlap, so a synonym is invisible to code.
- Slip rule: the "we was discussing" repeat in the test is a reconstruction, not in martin-45's recorded answers. A trivial slip said once and listed first by the model still leads when nothing is repeated.

Both changes are pinned by rules tests only; neither is recertified live.

A live recert may call this verified only if:

- an LT run with a compound-goal learner like oksana-34 shows a B1+ say task set in an aim that earlier tasks did not touch (for her, the interview), with the aim of the goal readable in the run record;
- the focus of the verdict for hana-41 and martin-45 is no longer a trivial or listen-borne slip.

Until then the status is built, not live-verified.

## 6. LG-55 fourth pass: an aim that is a real situation asks that situation's own question (1ee71f8c)

Added after the fact from commit 1ee71f8c, `docs/BACKLOG.md` (LG-55 4th pass) and the recert notes. Source files: `desk/src/lib/english/check.ts`, `desk/src/lib/english/placement.ts`. Where they show no reason or no alternative, this section says "not recorded".

**Constraint.** The third pass worked: in the third recert (`docs/uat-insights/2026-10-17-lt-recert-third-pass.md`, section 1) a task for the first time carried oksana-34's interview aim. But the task was a hypothetical opinion: "Which impresses an employer more: a big problem fixed quickly, or a small one solved creatively? Why?" The judge, `recert-3/LT-oksana-34-J1-4` (minor, recurrence 4): "not a real interview question". Her own voice: she wanted real questions like "tell me about a time...". The note counts it as "still recurs; the goal now reaches a task, in a wrong shape". The aim-level rule (section 2) decides which aim a task is set in, not what the task asks, so the model was free to write an opinion about the situation.

**Decision.** `goalTask(aim)` (now exported) and the single goal re-ask in `advance()` (`check.ts`) append an instruction when `questionSituation(aim)` is true. The instruction: where the aim is a real situation with its own questions (an interview, an exam, a call, a meeting), the prompt is the question that situation actually asks, worded as the other person would say it (for an interview: "Tell me about a time you solved a problem at work."), never an opinion or comparison about it. `questionSituation` (`placement.ts`) is a word list: interview, exam, test, call, meeting, appointment, presentation, check-in (plural and hyphen forms). An aim with none of these gets today's text unchanged.

**Alternatives that lost.**
- A synonym or model-based test of whether an aim is a real situation: not recorded as considered. The commit says only "a short word list"; the backlog adds "no synonyms".
- Applying the instruction to every aim: not recorded. The commit gates it on the word list and pins that a plain aim keeps today's text.
- A code check that rejects an opinion-shaped prompt after the fact: not recorded. The change is a prompt instruction only.
- Hard-coding the interview question in code: not recorded.

**Evidence.**
- Origin: `recert-3/LT-oksana-34-J1-4` (third pass, section 1), and the earlier `LT-oksana-34-J1-1` (second pass: "no task is an interview question").
- Rule test `LG-55 4th pass: an interview or call aim gets the real-question instruction, an aim with no such situation keeps today's text` (`tools/linga-rules-test.cjs`, added in 1ee71f8c). It asserts that `goalTask` on the interview aim contains "the question that situation actually asks", "Tell me about a time you solved a problem at work" and "never an opinion"; that a calls aim gets the same; that `travel to Spain and order food` yields exactly today's text; and that `questionSituation` is true for "Friday interview" and "an exam", false for "read novels". The commit does not say whether the test was red first.
- Recert-4 (`docs/uat-insights/2026-10-17-lt-recert-sofie-11.md`, section (c)) ran on product commit 31493cc5, which contains 1ee71f8c (checked with `git merge-base --is-ancestor`). For sofie-11, task 5 asks a real situation's question ("They ask, 'What did you do in the game today?'"). The note itself says: "I cannot tell from the transcript that the goal-aim rule produced task 5; it fits the aim either way." It is not evidence that the rule fired.

**Not verified.**
- No recert of oksana-34 since 1ee71f8c, so the interview case that forced the change has not been re-observed. The backlog says "Not live-verified".
- The test pins the instruction text sent to the model, not what the model then writes.
- The word list is closed: an aim phrased without one of those words (for example "a talk with my boss") gets no instruction.
- Whether a real-question prompt costs or helps placement accuracy: not recorded.
