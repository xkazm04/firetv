# Linga correctness answer: meaning and L1 false friends, decision record of 2026-10-17

State described: main at c3ea7baa. Source files: `desk/src/lib/english/slip.ts`, `desk/src/lib/english/review.ts`, `desk/src/lib/english/conversation.ts`. Commits: ce4ee3b3 (code), 9b23ab28 (tests), cc409af8 (backlog), c3ea7baa (test fix). The decision is **not live-verified**. Where the repo records no reason or no alternative, this record says "none recorded" or marks the reasoning as the author's reading.

## 1. Constraint that forced the choice

LG-51 (`docs/BACKLOG.md:335`) found that a direct "was that correct?" got vague praise or a wrong yes. The first rule (branch autopilot/accepted-idea-delivery-0f535fc6, `docs/BACKLOG.md:339`) made the partner quote the line and say yes or no. A yes could still pass a word that is grammatical but means something else to the learner, which is what a Czech or Slavic false friend does.

Two facts bound the fix:

- **The turn input carries no home-language (L1) field.** The `slip.ts` comment says it: "the input holds no L1, so this list is assumed, never detected". The backlog line says the same: "No new learner field, no home-language field" (`docs/BACKLOG.md:342`).
- **The operator's boundary keeps learner records untouched** (task brief for this record). A new L1 field would be a change to the stored learner record.

## 2. Decision

| id | decision | constraint | status |
|---|---|---|---|
| a | `KNOWN_FALSE_FRIENDS` (`slip.ts:46`) is a fixed list of Czech/Slavic false friends, each with the sense meant and the English that says it: eventually, actual/actually, sympathetic, concurrence, become (`slip.ts:46-52`). A teacher widens it the way `KNOWN_SLIPS` is widened. It is read by the partner prompt only (`slip.ts` comment). | No L1 in the input; no new learner field. | built, ce4ee3b3 |
| b | The partner prompt (`tutorSystem`, `conversation.ts:109`) says: before a yes, each word must mean what the learner meant in the scene, not only be grammatical; a common Czech or Slavic false friend used in its home-language sense makes the answer no; the list is interpolated into the prompt (`KNOWN_FALSE_FRIENDS.join("; ")`); the line or words are quoted on a yes as well as a no. | The model has to be told which words to distrust. | built, ce4ee3b3 |
| c | A no names the corrected words themselves (the prompt's example is "'compensate for'"), "never only the category" such as "needs a preposition". | A learner cannot act on a category label. (Reason is the author's reading; the backlog states the rule, not its reason.) | built, ce4ee3b3 |
| d | Code half. `asksCorrectness` (`review.ts:245`) is a pure English-pattern detector (`CORRECTNESS_ASKED`, three regexes). `askedAboutFor` (`review.ts:252`) returns `undefined` unless the reply asks a correctness question and the learner has an earlier line. Otherwise it returns `askedAbout {line, slips}`: the learner's previous own line, and the taught slips it holds, found by `slipsAgain` over this scene's moments and the taught fixes the learner may be shown. `englishCommand` computes it before the call (`conversation.ts:439`) and adds it to the turn input only when set. | A yes must not contradict a slip Linga already taught. | built, ce4ee3b3 |
| e | The prompt says: if `input.askedAbout.slips` is not empty, the answer is no and the change is that slip's `better`. A non-empty slips list therefore forces a no. | Same as d. | built, ce4ee3b3 |
| f | The 230-character, one-question reply limit is unchanged (`docs/BACKLOG.md:342`). | Existing turn limits. | kept |

## 3. Alternatives that lost

- **A learner L1 field.** It would let the prompt use the learner's own language instead of an assumed one. It lost because the decision adds "no new learner field, no home-language field" (`docs/BACKLOG.md:342`) and the operator's boundary keeps learner records untouched. The backlog gives no reason beyond that.
- **A model-only judgement with no code half.** The model alone would decide yes or no from the prompt. The repo records no stated reason for rejecting it. Author's reading: a slip Linga already taught is known to code before the call, so leaving that to the model would let a yes contradict Linga's own teaching; `askedAboutFor` removes that case from the model's judgement (d, e).
- **A per-learner false-friend list.** A list built per learner would need stored per-learner data, which the boundary rules out, and with no L1 there is nothing to key it on. No reason is recorded in the backlog; this is the author's reading. The chosen list is shared and teacher-widenable.

## 4. Evidence

Tests in `tools/linga-rules-test.cjs`, added in 9b23ab28 (red on HEAD before ce4ee3b3, green after, per `docs/BACKLOG.md:342`):

- `LG-51 meaning` pins the prompt text: the meaning check, the false-friend-makes-no rule, every one of the five list entries present in the prompt, "a no names the corrected words themselves", the quote on a yes, "askedAbout.slips is not empty, the answer is no", and the 230-character limit.
- `LG-51 detector` pins `asksCorrectness`: it fires on "Is my sentence correct?", "was that right?", "Did I say it well?", "Is it correct?", "Am I saying it right?" and stays quiet on "I need a room for Friday.", "The right door is on the left.", "Can you repeat that?", "I will correct the booking tomorrow."
- `LG-51 askedAbout` pins that an ordinary reply carries no `askedAbout`, that a correctness question after "Tomatoes is green. And red." carries the line and the slip `{said:'Tomatoes is', better:'tomatoes are'}`, and that a clean line gives empty slips.

c3ea7baa made the earlier LG-51 rule test read "If no" case-insensitively, since the sentence now starts with it.

These tests pin the prompt sent to the model and the code half. They do not pin what the model then answers.

## 5. Not verified

- **Not live-verified.** The backlog marks the 2026-10-17 entry "not live-verified" (`docs/BACKLOG.md:342`). No UAT run has measured a correctness answer after ce4ee3b3. That the model then answers accurately is a hypothesis, as the first LG-51 entry says (`docs/BACKLOG.md:339`).
- No test checks that the model, given a false friend off or on the list, answers no.

## 6. Open ceiling

From the backlog's ceiling line (`docs/BACKLOG.md:343`):

- A model yes is still one reading of the learner's English. Outside the list and outside the taught slips, the model decides meaning.
- The false-friend list is finite and lives in the prompt only. A false friend off the list is not caught by code.
- A Czech or Slavic first language is assumed, not known. A learner with another L1 gets a list that may not apply, and code does not detect it.
- The question detector is English patterns only (`CORRECTNESS_ASKED`).

## 7. What would reopen it

- A learner L1 other than Czech or Slavic on the desk. The fixed list then no longer fits, and the constraint on a home-language field would need a new look.
- A recert (UAT) showing false-friend misses: a yes on a false-friend word, or a no that does not name the corrected words. That would argue for widening the list, or for a code check beyond `askedAboutFor`.
