# Linga supported flag: a reply is "with help" only where the learner used help, decision record of 2026-10-17

State described: main at 1401622e. Source files: `desk/src/lib/english/conversation.ts`, `help.ts`, `credit.ts`, `repair.ts`, `view.ts`, `types.ts`. Commits: 0eafafa6, 1573a4ae, 3d948b1d, 1401622e; earlier step 281da6a6. The decision is **not live-verified**. Where the commits show no reason or no alternative, this record says "not recorded".

## 1. Constraint that forced the choice

The LT recert-1 run of 2026-10-17 (`uat/runs/2026-10-17-lt-swap-2/recert-1/SUMMARY.md`, line 13) found that the "supported" / "with help" counts did not match what four Characters did. Cited rows:

- `LT-tomas-9-J4-2`: unhelped replies counted as "with help", and the reverse. Tomas said he does not trust the count.
- `LT-adela-17-J4-3`: "the progress picture isn't honest".
- `LT-petra-38-J4-3`: does not trust the count.
- `LT-jana-29-J3-3`: unhelped replies counted as "with help".

The summary says all four noticed, and that it also "wipes out the point of the 'on your own' number". Item 1 of its ranked list (line 23) is "Fix the supported / 'with help' flag so it records real help use" (`build`).

The 0eafafa6 message traces each wrong flag to three branches of `conversation.ts`:

1. the opening took the model's `supportProvided` (jana-29 #2);
2. the turn carried the model's `supportProvided` for its own partner line to the next reply (jana-29 #4, tomas-9 #12);
3. a moment set the next reply supported (adela-17 #7, petra-38 #12 #18, tomas-9 #10); coaching and replay did too.

Earlier step 281da6a6 (message cites `recert-6/LT-tomas-9-J4-3` and `recert-6/LT-adela-17-J4-3`, a different run's rows) had narrowed the same rule: an absent `supportProvided` is no longer help (`!==false` became `===true` at the opening and in the moment path), and the recap splits own-words from helped replies (`view.ts`). It still read the model's flag, so the three branches above stayed.

## 2. Decision

A learner reply counts as supported ("with help") only when the learner used help for that reply.

- Any help rung revealed for the line on screen counts: the simpler line, the meaning or the starter (`SUPPORTING_RUNG = 1`, `help.ts:17`; `supportedBy`, `help.ts:71`).
- A cue, an opened or answered quiz, and a starter rung support the reply, as before. The scene flag is reset once a reply is recorded; a replay's new question starts unhelped (0eafafa6 message). The opening is created with `supported:false` (`conversation.ts:333`).
- A reply that reads back a shown line (the partner's line, the cue, a moment's fix, the coached line) is supported by code (`copiesShown(reply, shownLines(c))`, `conversation.ts:475-476`; `credit.ts:26`).
- A moment alone is not help. Neither are coaching or a replay alone.
- The model's `supportProvided` self-report is removed from the opening and turn answers and from the tutor prompt. The schema refuses an answer that still carries it (`additionalProperties` false, 3d948b1d message).

## 3. Alternatives that lost

- **Trust the model's `supportProvided`.** This was the state before. It gave the opening and partner-line errors (branches 1 and 2 above), and 281da6a6's `===true` narrowing still left the model as the judge. 0eafafa6 stopped reading it ("stays in the answer's shape but is never read"); 3d948b1d removed it, because the schemas still required it and the prompt still asked for it though code ignored it. Why the model's word was rejected beyond the traced wrong flags: not recorded.
- **Count only the last rung revealed (the starter).** This was `SUPPORTING_RUNG = 3` before 1573a4ae. The commit's reason: "Certification credits only fully unaided replies", so a reply after the simpler line or the meaning is not unaided. Delegate ruling (a). Whether a partial rung might deserve a lighter count: not recorded.
- **Count a coaching moment as help.** This was the old rule for moments, coaching and replay (branch 3). A moment is not something the learner used for that reply; adela-17, petra-38 and tomas-9 saw unhelped replies counted. Rejected in 0eafafa6.

Ruling (b) is kept as is (1573a4ae message): Show me, a fix revealed after two misses and Pause & coach support only a reply that reads that line back (`credit.ts` `copiesShown`).

## 4. Commits

**0eafafa6, the meaning.** Files: `conversation.ts`, `repair.ts` (`MomentRepair.support` gone), `types.ts`, `view.ts`, `tools/linga-rules-test.cjs`. The scene flag is set only by the learner's acts on the line on screen. `supportProvided` stays in the shape but is never read. Pinned by the rules-test rows `supported flag 1` to `supported flag 5` (`tools/linga-rules-test.cjs`, from line 3194), built from the recert-1 turn sequences. The message says they were red before and green after, and that K2 and moment rows that pinned the old rule were revised on purpose.

**1573a4ae, ruling (a): any revealed rung.** Files: `help.ts` (`SUPPORTING_RUNG` 3 to 1), `conversation.ts`, `duet.ts`, `view.ts`, `tools/linga-duet-test.cjs`, `tools/linga-rules-test.cjs`. Pins changed on purpose: the duet co-star helper (`linga-duet-test.cjs:96`, the simpler rung leaves the flag true); `ladder case 1`, `ladder case 3`, `ladder case 5` in `linga-rules-test.cjs` (lines 752, 768, 788).

**3d948b1d, ruling (c): `supportProvided` leaves the schemas, the prompt and the tool stubs.** Files: `conversation.ts` (`openingProps`, `turnAccept`, `turnProps`, the tutor prompt sentence and the struggles adaptation), and the stubs in `cert-rules-test.cjs`, `linga-company-sim.cjs`, `linga-credit-test.cjs`, `linga-duet-test.cjs`, `linga-lost-test.cjs`, `linga-mission-test.cjs`, `linga-rules-test.cjs`. Pinned by `supported flag 1` (`linga-rules-test.cjs:3194`): no request asks for `supportProvided` (line 3207), every stub answer validates against the narrowed schema, and an answer carrying it is refused as "not in the schema" (line 3209). The instruction to offer a phrase starter stays.

**1401622e, ruling (e): typecheck.** File: `desk/src/lib/english/check.ts` (line 131, an explicit `string[]` return type on the local word splitter in `slipIsStyle`). `match(...) ?? []` inferred `never[]`, so `includes` failed with TS2345 twice. Behaviour unchanged. Note the brief groups this with the flag work; the diff shows it does not touch the supported flag. It is a typecheck cleanup of a separate function, and no rule test pins it (the message names none).

## 5. Open proof

The live recertify of the four Characters (tomas-9, adela-17, petra-38, jana-29) is the open proof. This record does not claim its result. The rows above are the pre-fix findings; the commits are pinned by rule tests with stubbed engines only, and no live model call was made for this record.

## Addendum 2026-10-17: a run the learner already said herself is not a read-back (46db00cc)

State described: main at 011019ff; the code lines below are read there, and `credit.ts` is unchanged since 46db00cc. The addendum is **not live-verified**. Where the commit shows no reason or no alternative, it says "not recorded". The sections above are unchanged.

### A1. The constraint that forced it

`LT-jana-29-J3-2` (`uat/runs/2026-10-17-lt-swap-2/recert-2/`; the recert-2 `SUMMARY.md` line 13 lists it under recaps that are "bare or wrong"). The 46db00cc message gives the cause: reply 2 of jana-29's J3 was stamped `supported:true` with no help action. Owen's line 2 echoed her "hidden promo code field" as "the promo code field", and her saying it again shared a 4-word run with a shown line, so `copiesShown` (section 2 above) took it for a read-back.

### A2. The rule as built

- `copiesShown` takes a new optional third argument `own`, the speaker's own earlier replies in the scene (`desk/src/lib/english/credit.ts:33`). A run found in `own` is her words, not a copy (`credit.ts:37-39`: `copy` is a run found in a shown line and not `hers`).
- Edge tolerance of one joining word: a run of four or more words still counts as hers if dropping its first or its last word, when that word is in `EDGE_WORDS`, leaves a run found in `own` (`credit.ts:18` the list: the, a, an, this, that, my, your, to, of, in, on, and, is, are; `credit.ts:38` the test). Runs under four words need an exact match in `own`.
- `creditOf` takes the same optional arg and passes it to `copiesShown` (`credit.ts:52,55`). `validateObservations` takes `own?: string[]` in its context and passes it to `creditOf` (`rules.ts:66,69`), so certification credit follows the same rule as the flag.
- The helper is `ownLines(c, role = "learner")`: the texts of that role's earlier turns in the scene (`review.ts:108`).
- Callers:
  - `conversation.ts:484` (observations) and `conversation.ts:486` (the turn's flag), with `ownLines(c)`.
  - `duet.ts:112`, `learnerBeat`, with the learner's earlier lines.
  - `duet.ts:144-145`, `coStarEvidence`, with `ownLines(c, "costar")`, the co-star's earlier lines, for both the flag and the observations.

### A3. Alternatives that lost

Not recorded. The 46db00cc message names none. Neither the choice of the edge-word list nor of a tolerance of one word (rather than none or more) is explained there.

### A4. Tests that pin it

`tools/linga-rules-test.cjs`, from line 3306. The commit says no existing pin changed.

- `J3 case 1` (line 3306): replays the J3 turns from jana-29 (`janaScene`, with a moment after reply 2). Expects the learner flags `[false,false,false]` and a recap of 3 "on your own" and 0 "with help". The message says it was red before (reply 2 was true).
- `J3 case 2` (line 3312): pins the teeth. A run of a partner line she never said is still a read-back; a run she said earlier is hers; the part she did not say is still a read-back; a phrase under four words wholly inside a shown line is a read-back unless she said it herself; `creditOf` gives `own` with her earlier words and `helped` without. It also checks that a help rung still supports the next reply.

### A5. Status

Not live-verified. The tests use stubbed engines only. A live recertify (recert-3) is measuring it; this record does not claim its result.
