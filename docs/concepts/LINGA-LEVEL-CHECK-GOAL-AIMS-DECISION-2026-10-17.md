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
