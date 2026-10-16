# LT recertify of tonight's Linga fixes (2026-10-17)

Two live LT recertifies, nothing in `desk/` or `tools/` changed. Engine for every role, from both `run.json`: claude-cli, tutor per request (haiku fast, sonnet best), Character `best` sonnet with thinking off, judge `best` sonnet with thinking on. Product commit 414b1414 (run 1), 111b6f0e (run 2, same `desk/`). All seven fixes are in both.

- Run A, `2026-10-14-lt/recert-4`: adela-17 J1-J4, martin-45 J1-J3, tomas-9 J1-J4. It was a ledger recertify (characters, no run id), so the driver also stamped answers into the runs that hold the same open gaps. Stamps are driver output, not edited.
- Ids below: `A/` is run A (`2026-10-14-lt/recert-4`), `B/` is run B.
- Run B, `2026-10-16-lt-placement-oos/recert-1`: sofie-11, hana-41, oksana-34, J1 each. Not rerun: dominik-17 and petra-38 (no open pair left in that run), so their origins are not-evaluable.
- All 14 journeys ended `done`. No call failed, no retry was needed.

"Not-seen" means fixed at LT only. It is not resolved-verified; that takes L2.

## Result per fix

| Fix | LT result | Evidence |
|---|---|---|
| LG-8 summary and focus see the answers | **recurs** in the focus form; the two OOS origins not-seen | Not-seen on a done journey: oksana-34 J1-2 (B1 exact, "three slips listed") and sofie-11 J1-3 (focus `"take long time" becomes "takes a long time"`). Recurs: B/`LT-hana-41-J1-3` (rerun of the same gap, new row) "Next focus is narrow": focus is `"what the real number is"` only, articles, the commonest slip, appear only under usual slips. Same shape in A/`LT-martin-45-J1-2` (focus only -s; 'we was discussing about', 'more early' unnoted) and A/`LT-adela-17-J1-2` ("interested about" never corrected). dominik-17 not rerun. |
| LG-50 (label of the take-away sentence) | **not-seen** on the two origins rerun; count part not evaluable | adela-17 J3-4: "#10 recap quotes her actual slip ... not an invented sentence"; tomas-9 J3-5: take-away is from this chat. The screens read "From the level check" and "From an earlier scene: <title>". jana-29, lukas-24 and petra-38 not rerun; the "reply count is one short" part was not checked. |
| LG-34 (TV/phone name the source) | **recurs** (adela-17), not-seen (tomas-9) | tomas-9 J4-4 not-seen ("recap quotes 'Čtyři' which he did say"), and the label reads "From an earlier scene: Chat with Alex before the game". adela-17 J4-5 recurs as A/`LT-adela-17-J4-3`: partner line "the carbon from new roads" is material from another topic; the recap now says "From an earlier scene: Is electric transport really greener?". The origin is named, so this is the row's stated ceiling, not a missing label. |
| LG-51 direct "was that correct?" | **recurs** (adela-17 J3), not-seen (adela-17 J4) | Not-seen, origin lt/`LT-adela-17-J4-1`: #8 `"Yes, 'could I send you an email before Friday?' is correct and polite"` (quoted, yes, a reason). Recurs, origin recert-1/`LT-adela-17-J3-2`, as A/`LT-adela-17-J3-3`: she asked "Is my sentence correct?" and got `"Yes, your sentence is correct, and "greener eventually" is clear."` The false friend is confirmed again, and the line is not quoted. The rule held in shape on J4 and failed in substance on J3, which is the ceiling the row named. |
| LG-52 choose tasks | **not-seen** (tomas-9 J1, done) | The two choose tasks were meaning choices: `Yes, let's play!` / `Good morning!` and `Yes, I am going to the shop.` / `Yes, I did.` No "want play" / "want to play" pair. Judge: "choices are meaning-based, not grammar-form pairs". He still guessed once ("Moc dlouhé, nerozumím, tak hádám"), so guessing is not shown to be cut. |
| LG-54 verdict vs note | **recurs** (hana-41), not-seen (sofie-11) | sofie-11 J1-2 not-seen ("task 5 is 'not yet' and the note names the gap: 'Verb forms held it back'"). hana-41 recurs as B/`LT-hana-41-J1-1`: task 4 reads `"Your English read as A2 here"` / 'not yet' beside the note `"You answered the question and gave a reason"`, while task 3 with similar slips got 'nearly there'. |
| LG-55 repeated prompts | **recurs** (oksana-34), not-seen (sofie-11) | sofie-11 J1-4 not-seen (`play Roblox` and `What are you doing on Saturday?` are different). oksana-34 recurs as B/`LT-oksana-34-J1-2`: "#7 and #8 are near-duplicate app-versus-phone tasks" (both 'partial' for 'responsible about'), and as B/`LT-oksana-34-J1-1` no real interview question in #5-#8. petra-38 not rerun. |
| OOS item 1, lean caveat | **recurs** (hana-41); not-evaluable elsewhere | hana-41 J1-2 recurs: verdict text `"Only a few strong answers showed this level, so it may be a little off."`, judged vague. hana was placed B1 exact, so the lean wording (naming the nearly-reached band) may not have been the branch exercised. oksana-34 was placed exact with no caveat quoted; dominik-17 not rerun. |

## Possible regressions or new rows near the fixes

- A/`LT-adela-17-J3-4` (major): "Answer to her question names no preposition". She asked a direct question and got `"No, 'compensate' needs a preposition after it"`, so she asked again. This is LG-51's rule (yes or no and the one change) missed on the "no" side. Same journey, A/`LT-adela-17-J3-2` (blocker): `'concentrate on' is right here`, other slips in the same turn unmentioned.
- B/`LT-sofie-11-J1-3` (blocker): the TV verdict headline shows her error as `Your words: “take long time”`. Near LG-8's slips (the row says the TV never shows them), but the "Your words" line pre-dates the fix (tomas-9 shows the same form), so this is probably old, not caused by LG-8. Not confirmed.
- B/`LT-sofie-11-J1-5` (polish): B2 task 5 marked fail though the answer is partial. Judge-severity, not the LG-54 praise-beside-fail shape.
- B/`LT-oksana-34-J1-3` (minor): summary and focus are thin (focus one phrase pair, interview mentioned in passing). Same shape as LG-8's origins.

## LG-53 in martin-45's J3 rerun

**Not seen, and the case did not arise.** Journey ended done (pass). His first try at #3 and the second at #4 (`The stakeholder don't accepts the delay, so we need the parts more early.`) were not accepted; the held try at #5 was `"The stakeholder doesn't accept the delay, so we need the parts earlier."`, which also fixed 'more early'. No try was held with another error left in it, so LG-53 neither recurred nor was tested. The ledger answer for recert-1/`LT-martin-45-J3-2` was not-seen, with "flawed retries were not accepted". A try that fixes the slip and keeps a second error is still what the origin showed; this run does not rule it out.

## Not answered here

Whether any not-seen holds at L2. Whether the LG-51 yes/no accuracy can be reached by a prompt rule. Those need the owner's ruling or an L2 pass.
