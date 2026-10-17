# LT recertify of the second passes (2026-10-17)

Two live LT recertifies of the Linga queue's second passes (LG-8 2afda539, LG-51 ce4ee3b3/c3ea7baa, LG-54 066ecf13, LG-55 0c86f327/56bb3f46). Nothing in `desk/` or `tools/` changed. First recert for comparison: `2026-10-17-lt-recert-tonight.md` (faab95c8).

**Engine, from both `run.json`:** claude-cli for every role. Tutor per request (fast haiku, best sonnet). Character `best` = sonnet, thinking off. Judge `best` = sonnet, thinking on. `DESK_TEXT_ENGINE` was unset; no codex call.

**Product commit stamped:** run A 45ec4aca (clean), run B fcd67870 (clean). B's stamp is the commit of run A's own output; `desk/` is identical to 45ec4aca, so both runs saw the same product, second passes included.

- Run A, `2026-10-14-lt/recert-5`: `--recertify adela-17 martin-45 tomas-9`, 11 open pairs and 78 open rows from every run, 12 journeys, all `done`. Driver: "24 fixed (LT), 88 recur, 13 not evaluable (rows)", stamped into 9 runs' `findings.json`. `A/` below.
- Run B, `2026-10-16-lt-placement-oos/recert-2`: `--recertify 2026-10-16-lt-placement-oos sofie-11 hana-41 oksana-34`, hana-41 J1 and oksana-34 J1, both `done`. `B/` below.
- **sofie-11 was not rerun.** The driver started with "recertify 2 open pair(s) of 2026-10-16-lt-placement-oos" and `recertify-2.md` says "Only the pairs with open findings were rerun": the driver names no reason for sofie-11; the likely one is that no open row was left for the pair (the first recert stamped its answers). Nothing was forced. No call failed, no retry.
- Ids: a rerun's finding ids are positional. The ledger answers cite the first recert's rows by their old ids (`recert-4/LT-adela-17-J3-3` is the first doc's A/`LT-adela-17-J3-3`).

"Not-seen" is fixed at LT only; it is not resolved-verified, which takes L2. Each rerun is one transcript per Character, so one not-seen is one sample.

## Result per item

| Item | First recert | Now | Movement |
|---|---|---|---|
| **LG-8** focus follows the first kept slip | recurs (hana-41, martin-45, adela-17); OOS origins not-seen | recurs on hana-41 and martin-45; adela-17 `interested about` not-evaluable | still recurs |
| **LG-51** correctness checks meaning, false friends | recurs (adela-17 J3), not-seen (J4) | adela-17 J3 'eventually' not-seen; 'compensate' no-without-preposition not-seen (by another case) | recurs to not-seen; new wrong-no row (below) |
| **LG-54** verdict names the held-back words | recurs (hana-41), not-seen (sofie-11) | hana-41 task 4 not-seen; sofie-11 not rerun | recurs to not-seen |
| **LG-55** reworded repeat; stated goal gets a say task | recurs (oksana-34 #7/#8 and no interview question) | duplicate: recurs (in a new form); interview: recurs | still recurs |
| **LG-34** TV/phone name the source | recurs (adela-17), not-seen (tomas-9) | adela-17 not-seen; tomas-9 not-seen | recurs to not-seen |
| **LG-50** label of the take-away | not-seen (adela-17, tomas-9); count not evaluable | label not-seen on both; count looks right on adela-17 | not-seen to not-seen |
| **LG-52** choose tasks | not-seen (tomas-9) | tomas-9 task 1 (A1) is a meaning choice; task 2 (A2) is a form pair | not-seen to not-seen at A1 |
| **Lean caveat** (OOS item 1) | recurs (hana-41) | recurs (hana-41) | still recurs |

### LG-8 — recurs
- **hana-41 J1 focus**: B/`LT-hana-41-J1-1` (major, new row, no `recurs` link). The next focus is `Practise "I have not so much time" by saying "I do not have much time" instead.` The judge: the check also showed the missing article and "we are helping each other". The code now picks the first kept slip, as built; the judge calls that slip trivial.
- **martin-45 J1 focus**: A/`LT-martin-45-J1-1` (blocker), ledger answer recurs for `recert-4/LT-martin-45-J1-2`: `Practise verbs after he or she: "he move the supplier call" / "he moves the supplier call"`. The slip came from a listen answer where the line said "I can move"; `we was discussing` (#2) is in neither focus nor slips.
- **adela-17 `interested about`**: not-evaluable, the slip never arose in this transcript (ledger answer for `recert-4/LT-adela-17-J1-2`). adela-17 J1 shows another focus fault, A/`LT-adela-17-J1-1`: `"whereas during explanations they would stay" becomes "whereas during explanations they would have to stay off"` for a correct sentence.

### LG-51 — recurs to not-seen, with caveats
- **'eventually' false friend** (first doc A/`LT-adela-17-J3-3`): ledger answer not-seen. The false friend came up on its own and the moment caught it: `'Eventually' means 'in the end', not 'possibly', so the doubt is unclear here.` Nobody told her it was right. This is a different case from the origin (she did not ask "is it correct?" about 'eventually').
- **'compensate' no without the preposition** (first doc A/`LT-adela-17-J3-4`): ledger answer not-seen, but the evidence is `'interested' is followed by the preposition 'in'` (#4). 'compensate' never arose, so this is weak evidence.
- Direct questions in the same journey still go wrong in other ways: A/`LT-adela-17-J3-3` (minor): asked "Is that sentence correct?", got `No, 'actual technology' should be 'current technology', since 'actual' means real.` and the other slip (`interested about`) was left unnamed. A/`LT-adela-17-J3-2` (major): `Is "possibly" correct here?` and `Is that correct now?` got only the 'Eventually' clue again, then `Try may not`.

### LG-54 — recurs to not-seen
hana-41 task 4: the note now ends in a plain line naming the words, and verdict and note agree: `Your English read as B1 here, and this task was B2. Held back: "we are helping each other in our team".` followed by `You gave a clear reason with 'because'. For usual team habits, try 'we help each other'.` The same `Held back:` line appears on the non-pass say tasks of the other Characters read (oksana-34: `Held back: "if the price stay stable"`; martin-45: `Held back: "many people in my company is cycling"`). One leftover: B/`LT-hana-41-J1-2` (minor) says `Wider word choice would also help.` is vague. sofie-11 not rerun.

### LG-55 — still recurs
- **oksana-34 #7/#8 app-versus-phone repeat**: that pair did not come back. B/`LT-oksana-34-J1-4` (polish, recurs `LT-oksana-34-J1-3`) records a nearby shape: `#8 and #9 are both carrier-call 'Say it' tasks`, one about a habit for a new coworker, one about a carrier raising rates. Different prompts, so I read this as weaker than the origin; the judge counted it as recurs.
- **missing interview question**: B/`LT-oksana-34-J1-1` (major, recurs `LT-oksana-34-J1-4`): `#4 'answer questions on job interview... problem which I solved'; #5-#9 tasks are carrier/shipping only`. She stated the goal three times and no task is an interview question. The goal-gets-a-say-task rule did not fire.

### LG-34, LG-50, LG-52, lean caveat
- **LG-34**: adela-17 ledger answer for `recert-4/LT-adela-17-J4-3` is not-seen: `Partner lines #2 to #16 stay on devices and sleep; no unrelated carry-over.` tomas-9 J4 recap reads `From an earlier scene: Say hi and your name`, `"I don't know", from Say hi and your name` (read in the transcript, not a ledger answer).
- **LG-50**: labels on screen: `From the level check`, `From an earlier scene: Say hi and your name`, `From this rehearsal`. adela-17 J3 recap `10 spoken · 0 written replies`, and she wrote "I got to talk for ten turns", so the count matches. The take-away is still an old line (adela-17 J4: `"whereas during explanations they would have to stay off"`).
- **LG-52**: tomas-9 J1 task 1 (A1): `Hello! Come in.` / `Goodbye, dog.`. Task 2 (A2): `Okay, I will take it.` / `Okay, I will takes it.`, a form pair. Not-seen at A1; the A2 pair is what the band split leaves for A2, as I read the backlog. Guessing: he still wrote `Moc dlouhé, nerozumím, tak hádám` at #6.
- **Lean caveat**: B/`LT-hana-41-J1-3` (minor, recurs `LT-hana-41-J1-2`): `Your B2 answers were close, but none was strong, so Linga starts you at B1.` The judge: caveat still vague, confidence low. The line names the nearly-reached band this time. The other two origins (dominik-17, oksana-34) were not asked.

## Origins named in the brief

| Origin | Item | Now |
|---|---|---|
| hana-41 J1 focus | LG-8 | recurs, B/`LT-hana-41-J1-1` |
| hana-41 task-4 verdict note | LG-54 | not-seen (`Held back: "we are helping each other in our team"`) |
| adela-17 J3 'eventually' | LG-51 | not-seen (another case) |
| adela-17 J3 'compensate' no | LG-51 | not-seen, weak (case did not arise) |
| oksana-34 #7/#8 app-vs-phone | LG-55 | recurs in a new form, B/`LT-oksana-34-J1-4` |
| oksana-34 missing interview question | LG-55 | recurs, B/`LT-oksana-34-J1-1` |
| martin-45 J1 focus | LG-8 | recurs, A/`LT-martin-45-J1-1` |

## LG-53 in martin-45's J3

**Seen.** His try at #4 fixed the taught slip and kept a second error: `Okay, I want to discuss the delay of our last delivery. So, without about. But this is very small mistake, I think.` ('this is very small mistake' lacks 'a'.) The screen at #5 read `You found it` with that whole line under "Your own fix". The earlier try (#3, still `discuss about`) was not accepted. So LG-53 recurs here, where the first recert did not meet the case. Same journey: `we was promised` and `confirm me` got no moment (A/`LT-martin-45-J3-1`, blocker).

## New rows near the second passes

- A/`LT-adela-17-J4-1` (blocker): **wrong "No" after LG-51's rule.** Asked "Was my answer correct?" about an answer with no error, Lena said `No, 'phone than' should be 'phone to': 'I prefer my phone to my laptop.'` That slip belonged to an earlier turn she had already fixed. This looks like the taught-slip-forces-a-no rule firing on the wrong line. The most likely regression of a second pass.
- A/`LT-adela-17-J3-2` and J3-3 above: direct questions answered in part, same family.
- A/`LT-adela-17-J3-6` (minor): nearly every checked phrase is answered `Yes, ... is correct`; she says it "feels like confirmation".
- B/`LT-hana-41-J1-1`, A/`LT-martin-45-J1-1`: LG-8's focus is now the first kept slip, and the judge calls it trivial or misread (above).
- Code verdict, hana-41 J1: pass to fail (D5 and C4 on the focus). `recertify-2.md` lists it under Regressed with 10 changed product files. It is the focus row again, not a new fault.
- A/`LT-tomas-9-J3-5` (major): Sam asks `What is your name?` a second time late in the chat. A repeat in the conversation, not in the level check, so outside LG-55's scope.

## Blocker B/`LT-sofie-11-J1-3` (TV headline 'Your words')

**Not evaluable: sofie-11 was not rerun.** The same headline block is still on screen for the Characters that were: hana-41 `Your words: “I have not so much time”.` and martin-45 `Your words: “he move the supplier call”.` So the form is unchanged. It is the block that pre-dates LG-8, as the first doc said.

## Result

Across the four second passes, of the 8 origins checked: 3 moved to not-seen at LT (hana-41 task-4 note, 'eventually', 'compensate'), 4 still recur (hana-41 focus, martin-45 focus, oksana-34 duplicate, oksana-34 interview), 1 was not evaluable (adela-17 `interested about`).
