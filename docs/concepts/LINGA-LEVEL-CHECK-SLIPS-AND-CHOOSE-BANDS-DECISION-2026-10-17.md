# Linga level check: usual slips and choose-task bands, decision record of 2026-10-17

State described: main at a3ef93f7. Source file: `desk/src/lib/english/check.ts`. Commits: c673be34 (A); 64b57f91, 03f03e09 and a3ef93f7 (B). Neither decision is live-verified. Where the repo records no reason or no alternative, this record says "none recorded".

## 1. Constraint that forced the choice

**(A) Slips.** LG-8 (`docs/BACKLOG.md:64`) found that the verdict's summary never saw the learner's answers, so it read as a generic line. Origins include "I told it three times about my Friday interview, and the final summary talks about generic phone and email phrases" (`docs/BACKLOG.md:295`) and, from the 2026-10-16 placement run, dominik-17, oksana-34 and sofie-11 (`docs/BACKLOG.md:67`). The answers and goal reached the summary in 0a53e75e. c673be34 then added a list of the learner's usual slips. A slip quotes the learner's words next to a model-written fix, so the model could quote words the learner never wrote. The check runs on a shared television (`checkSystem`, `check.ts:43`: "meeting a learner on a shared television").

**(B) Choose bands.** The choose task asked for two replies where "the other has one typical learner error for this band, or does not fit" (the old `KIND_TASK.choose` text, removed in 03f03e09; quoted at `docs/BACKLOG.md:339`), so the model wrote a minimal pair. LG-52 (`docs/BACKLOG.md:337`) records the origin findings (`docs/BACKLOG.md:338`): recert-1/LT-ondrej-16-J1-1 (blocker: "Thank you, good game!" against the same line with a sentence added; "Thank you, I am good game."), recert-1/LT-viktor-67-J1-5 (draw/drew, "unanswerable for a beginner") and lt/LT-tomas-9-J1-2 ("'Yes, I want play.' vs 'Yes, I want to play!' picked by looks"). The entry's own reading is that at A1 the difference is a function word whose point the learner can neither hear nor see (`docs/BACKLOG.md:339`).

## 2. Decision

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| A1 | The summary step asks for up to three slips: "errors the learner made more than once, or the most important ones", the learner's exact words and the corrected form (prompt at `check.ts:177`; schema `maxItems: 3` at `check.ts:36`). | LG-8: a generic summary. | none recorded | built, c673be34 |
| A2 | `keepSlips` (`check.ts:120`) keeps a slip only when its said text occurs, normalised for case, spaces and quote marks, in a non-skipped answer (`check.ts:121`, `:127`). A slip no answer holds is dropped. It also drops a said text under two characters, an empty better form, a better form equal to the said text, and a better form the audience gate `safe` refuses (`check.ts:127`); it skips a repeated said text (`check.ts:128`) and keeps at most three (`check.ts:129`). Fields are cut at 120 characters (`check.ts:126`). | The model must not put words in the learner's mouth. | Showing the model's slips unchecked: not built, and no reason beyond the code check is written down. No other alternative recorded. | built, c673be34 |
| A3 | The list is shown on the phone only. `LingaPhone.tsx:183` renders "Your usual slips" when `!self` and `placement.slips` is non-empty. The type comment reads "phone only, absent on older records" (`types.ts:51`). A test pins that `view.ts` and `LingaTV.tsx` do not mention `slips`. | The TV is shared. The repo records no further reason for phone-only. | Showing slips on the TV: none recorded. | built, c673be34 |
| A3b | The shared family TV never headlines a learner's own error as "Your words". The verdict caption shows the better form under "Try saying", or the plain next step; a model-written summary that quotes the learner's answers falls back to the band line on the TV. The learner's words stay on the phone, beside the better form (`LingaPhone.tsx`: "Next to practise", "Your usual slips"). Extends A3. | Sofie (11): "the TV showing my mistake, \"we build spaceship\", as my words was a bit embarrassing" (`docs/uat-insights/2026-10-17-lt-recert-sofie-11.md` (a); findings `recert-1/LT-sofie-11-J1-3`, `recert-4/LT-sofie-11-J1-2`). | Keeping "Your words" on the TV: refused. | decided by the delegate 2026-10-17; built, 5ed86274, merged 7281241e; rule test red first (section 7) |
| A4 | A stored placement without slips stays valid; `cleanPlacement` keeps at most three well-formed slips (`placement.ts:308`). | Older records exist. | none recorded | built, c673be34 |
| B1 | `chooseTaskFor(band)` (`check.ts:54`) asks A1 and A2 for a meaning choice: "Both replies are correct, simple English; exactly one fits the situation and the other does not fit the situation. The wrong reply must not be a grammar error." | LG-52: a beginner cannot hear a function-word minimal pair (`docs/BACKLOG.md:339`). | The single instruction for all bands, the old `KIND_TASK.choose`, replaced in 03f03e09. | built, 03f03e09 |
| B2 | From B1 up (B1, B2, C1, C2) the instruction keeps the grammar contrast: "Exactly one is natural, correct English that fits the situation; the other has one typical learner error for this band, or does not fit." | LG-52 asks for a grammar contrast only from B1 (`docs/BACKLOG.md:339`). | none recorded | built, 03f03e09 |
| B3 | The task request calls `chooseTaskFor(band)` for the kind `choose` and `KIND_TASK[kind]` for the other kinds (`check.ts:147`). | The band must reach the instruction. | none recorded | built, 03f03e09 |

## 3. Evidence

**(A)** Tests in `tools/linga-rules-test.cjs`:
- `LG-8 slips: keepSlips drops a slip no answer holds, one only in a skipped answer, one that equals its fix, and keeps a valid one` (line 2704) covers a valid slip, a slip in no answer, one only in a skipped answer, an equal fix, case and space blindness, the audience gate and non-array input.
- `LG-8 slips: cleanPlacement accepts none, keeps 3 valid, trims 5 to 3, drops a malformed item` (line 2716).
- `LG-8 slips: the TV never shows them (view.ts and LingaTV.tsx do not reference slips)` (line 2723).

The LG-8 status line (`docs/BACKLOG.md:68`) says "Not screenshot-verified".

**(A3b)** 5ed86274 added the test `recert-4 / LT-sofie-11-J1-2: the shared TV never headlines a learner's own error as "Your words"; ...` (`tools/linga-rules-test.cjs`); its message says "Rule test red first". Shipped: the TV caption is `Try saying: “<line>”.`, and the hero note falls back to the band line when `quotesLearner` matches. Detail in section 7.

**(B)** 64b57f91 added the test `LG-52: a choose task asks for a meaning choice at A1-A2 and a grammar contrast from B1` (`tools/linga-rules-test.cjs:2763`); its message marks it red on HEAD. It asserts that the A1 and A2 text contains "does not fit the situation" and "not a grammar error" and lacks "learner error", and that B1 to C2 contain "typical learner error for this band". 03f03e09 added `chooseTaskFor` and the backlog note. a3ef93f7 tightened the assertion to the instruction's own words ("must not be a grammar error"). The test pins the instruction text sent to the model. It does not pin what the model then writes.

## 4. Not verified

- Neither decision has a live run. No UAT run measured a changed choose task or a slips list after c673be34, 03f03e09 or a3ef93f7. The LG-52 note says "not live-verified; whether it cuts guessing is a hypothesis" (`docs/BACKLOG.md:341`). That a meaning choice cuts guessing is a hypothesis, not a finding.
- The slips prompt asks for errors "made more than once, or the most important ones", but the code checks only that the words were said, not that they were repeated (`check.ts:118`, `docs/BACKLOG.md:69`).
- No screenshot of the phone slips block is recorded (`docs/BACKLOG.md:68`).
- A3b: no recert of sofie-11 since 5ed86274. Recert-4 ran on 31493cc5, which does not contain the fix; the backlog says "Awaiting LT re-observation". No screenshot of the new TV caption is recorded. Section 7.

## 5. Open ceiling

- **Slips:** they rest on the model finding the repeats; the code checks only that the words were said (`docs/BACKLOG.md:69`).
- **Choose tasks:** any two-option task is still a 50/50 guess, the ceiling of LG-10 ("a lucky guess on a choose task still reads as a pass", `docs/BACKLOG.md:82`), observed again in lt/LT-tomas-9-J1-2 and lt/LT-viktor-67-J1-2 (`docs/BACKLOG.md:305`). A meaning choice is easier to guess, which the entry gives as the point at A1 (`docs/BACKLOG.md:342`). The band split changes which wrong reply the model is asked for; it does not remove the guess.
- **What would settle it:** a recert of the learners behind LG-52 (ondrej-16, viktor-67, tomas-9) on a build containing 03f03e09, reading whether the choose passes still look guessed. No such run is filed.

## 6. LG-8 fourth pass: the summary ranks core slips above style slips (3f7d47e0)

Added after the fact from commit 3f7d47e0, `docs/BACKLOG.md` (LG-8 4th pass) and the recert notes. Source file: `desk/src/lib/english/check.ts`. Where they show no reason or no alternative, this section says "not recorded".

**Constraint.** After the third pass (focus follows the first kept slip), the focus followed a trivial slip. Third recert (`docs/uat-insights/2026-10-17-lt-recert-third-pass.md`, section 2): hana-41 `recert-3/LT-hana-41-J1-1` (major): the focus was "so then I would send" -> "so I would send", labelled "linking words", while the judge noted the missed "I am accountant" (#2) and "I learn mostly in my work" (#3). martin-45 `recert-6/LT-martin-45-J1-1` (blocker, recurrence 6): "we was discussing ... about" (#2) never named. Neither slip in hana-41's focus repeated, so "repeated first" gave no help.

**Decision.** Two parts, both in 3f7d47e0.
- The summary step's slips instruction ranks by how much a slip breaks meaning or core grammar: verb agreement ("we was"), a missing article ("I am accountant"), a missing verb, a wrong verb form or a wrong preposition ("interested about") come first; style and word choice ("then" or "which" against "that", an extra "so") come last, even when repeated.
- `keepSlips` ranks in code: a repeated core slip (rank 0), a core slip (rank 1), a style slip (rank 2, last even when repeated), then the three-slip cut. `slipIsStyle` is true when every word that differs between said and better is in `STYLE_WORDS` (then, which, that, so, also, just, really, very, actually, quite, maybe, well). `focusFollowsSlip` is unchanged and so follows the new first slip.

**Alternatives that lost.** None recorded. The commit message and backlog line show no other option considered (for example a model-assigned severity field, a larger list, or a grammar-category classifier). The ceiling line in the backlog names the limit of the word-list choice.

**Evidence.**
- Origins: `recert-3/LT-hana-41-J1-1`, `recert-6/LT-martin-45-J1-1` (third pass, section 2).
- Rule test `LG-8 4th pass: core slips (agreement, article, preposition) lead, a repeated style slip does not` (`tools/linga-rules-test.cjs`, added in 3f7d47e0). It pins that `slipIsStyle` is true for "So then I would send" and false for "I am accountant" and "interested about"; that the kept list is "I am accountant", "we was discussing", "interested about" with the style slip cut by the limit of three; that a repeated style slip yields to a core one; and that the focus is `"I am accountant" becomes "I am an accountant"`. The commit does not say whether the test was red first.
- Recert-4 (`docs/uat-insights/2026-10-17-lt-recert-sofie-11.md`, section (c)) ran on 31493cc5, which contains 3f7d47e0. For sofie-11: "yes, it leads with a core slip"; the focus is the article slip "we build spaceship" -> "we build a spaceship", articles first, the tense slip third.

**Not verified.**
- The cases that forced the change, hana-41 and martin-45, have not been rerun since 3f7d47e0. The one live observation is sofie-11, one sample, a different learner. The backlog says "Not live-verified".
- The style list is a few filler words; any other trivial slip still depends on the model's ranking (backlog ceiling).
- The tests pin the instruction text and the code ranking, not what the model writes.

## 7. Row A3b completed: the TV never headlines a learner's error (5ed86274, merged 7281241e)

Completes the record of row A3b (section 2), from commits 5ed86274 and 7281241e and the recert notes.

- **Decided by:** the delegate, 2026-10-17 (the comment in 5ed86274, `view.ts`: "delegate ruling 2026-10-17, recert-4/LT-sofie-11-J1-2"). Who the delegate is and which alternatives they weighed: not recorded beyond the row's "keeping 'Your words' on the TV: refused".
- **Built and merged:** built in 5ed86274 (`desk/src/lib/english/view.ts`, `tools/linga-rules-test.cjs`); the decision row and backlog line were added in 7281241e. The commit message says "Rule test red first".
- **Shipped behaviour:**
  - The verdict caption is now `Try saying: “<line>”.` with the tag "Try saying", where `<line>` is the better form from `focusParts(placement.focus, placement.tasks).line`. With no better form it falls back to the plain next step (tag "What next"). The old `Your words: “<quote>”.` caption is gone from the TV.
  - The hero note falls back to the band line (`BAND_CAN[band]`) when `quotesLearner(placement.summary, placement.tasks)` is true, that is, when a quoted span of the model-written summary is held in one of the learner's answers. A summary quoting nothing stays.
  - The phone keeps the learner's words beside the better form (`LingaPhone.tsx`: "Next to practise", "“said” → try “better”").
- **Alternatives that lost:** only "keeping 'Your words' on the TV" is recorded. Anything else, for example blurring or truncating the quote: not recorded.
- **Evidence:**
  - Origin: `recert-1/LT-sofie-11-J1-3` (blocker) and its recurrence `recert-4/LT-sofie-11-J1-2` (blocker, rank 18, recurrence 2); `docs/uat-insights/2026-10-17-lt-recert-sofie-11.md` (a). The same headline was seen for hana-41 ("I have not so much time") and martin-45 ("he move the supplier call") in `docs/uat-insights/2026-10-17-lt-recert-second-pass.md`.
  - Rule test `recert-4 / LT-sofie-11-J1-2: the shared TV never headlines a learner's own error as "Your words"; the phone keeps it beside the better form` (`tools/linga-rules-test.cjs`, 5ed86274). It asserts that neither caption, tag nor TV text contains "Your words" or the quoted error, with and without a better form; that the caption is `Try saying: “we build spaceships”.`; that a summary quoting her words yields the band line as hero note while a quote-free summary stays; and that the phone source holds the quote and the better form.
  - The test went red first: the commit message says so. In the same commit the older pin of `Your words: “he need”.` was replaced, and the slips pin that used `\b` inside a string (a backspace, so it could never fail) was fixed to `\bslips\b`; that test now also forbids `Your words:` in `view.ts` and `LingaTV.tsx`.
- **Not verified:**
  - 5ed86274 is not in product commit 31493cc5 (checked with `git merge-base --is-ancestor`), so recert-4 observed the old caption. There is no recert of sofie-11 since the fix; the backlog says "Awaiting LT re-observation".
  - No screenshot of the new TV caption is recorded.
  - `quotesLearner` is a substring test on quoted spans of two or more characters; a summary that paraphrases the error without quotes is not caught. Whether that happens: not recorded.
  - "Try saying" shows the line the model wrote into the focus; that it is always a correct better form is not checked by code.
