# radka-41 × MB5 · Is it worth keeping?

- Character: radka-41 (decides over two or three evenings; Nela `elementary` 12 `cz` and Šimon `elementary` 14 `cz`, School maths)
- Journey: MB5 (promotion: discovery)
- Cert level: L1 (code walk + node executions of the store reducer, `tv/keys`, `tv/recapRows`, `rules/week`, `desk/mark.markTyped`, `rules/school`)
- Base commit: 12592a71
- **Verdict: L1-fail**. The evening loop works structurally, and typed marking is honest: 0 false ticks in 18 executed answers, and "The desk is not sure" exists. But the things a deciding parent reads are wrong across evenings:
  - The recap's hint counts and "Needed a second hint" list are never reset, so a night with nothing done still reads "Good evening's work - all of it right." and "Math Buddy - 1 hint" (radka-41-MB5-1).
  - The Sunday page reads only marked sets, so a week of homework with hints reads "Nothing this week." (radka-41-MB5-2).

## Reachable surface set

- Landing → "Someone else" → learner switcher → add → profile picks on the TV: type, age, (no Mode row under 18), system, interests, Maths course, Save (`desk/src/tv/keys.ts:275-278,309-331`, `desk/src/tv/profileRows.ts:71-82`). The name is typed on the phone (`desk/src/app/phone/page.tsx:403-409`).
- Tonight: three doors for a school path (`keys.ts:106-109`). One loop: MB1 (homework) or MB2 (Teach me something / Get ready → practice → typed or snapped answers → sheet → walk).
- End: phone End session (`page.tsx:354-359,611`) or Menu on the landing (`keys.ts:273`) → `session.end` (`desk/src/lib/session/store.ts:620`) → TV recap (`desk/src/tv/screens.tsx:303`).
- Phone Recap (Parent) and This week (`page.tsx:615-627,640-650`).
- By design: no parent lock (`page.tsx:642-644`).

## Surface model

| # | Affordance | file:line | Pipeline | AI |
|---|---|---|---|---|
| 1 | Profile picks on the TV, name on the phone | `keys.ts:316-331`, `page.tsx:403-409` | `profile.draft`/`profile.save` | — |
| 2 | Tonight's three doors | `maths/MathsTV.tsx:421-432` | — | — |
| 3 | A set: Get ready → The usual (or Teach me) | `keys.ts:465-478` | `/api/practice` → `makeItems` | MB-SET (code for most units) |
| 4 | Type my answers → Send | `page.tsx:476-500` | `/api/mark` → `markTyped` (code) | — |
| 5 | Sheet / walk: tick, ring, "The desk is not sure" | `MathsTV.tsx:503-507,805-816` | — | — |
| 6 | Hold to explain (unsure/wrong) | `page.tsx:545-560` | `/api/explain` | MB-EXPLAIN (not walked here; MB2) |
| 7 | End session | `page.tsx:611` | `session.end`, `/api/memory` | MEM |
| 8 | TV recap "Tonight, done" | `tv/screens.tsx:303-319` | `tv/recapRows.ts` (code) | — |
| 9 | Phone Recap + This week | `page.tsx:615-627`, `:645-650` | `recapRows`, `rules/week.ts` (code) | — |

## The walk (in character)

1. **Setting up Šimon (evening 1).** Down to "Someone else", Select, Right twice to the add card, Select. The draft starts as High school with the lamp on Elementary school. Select, Down, Right ×8 to 14, Select, Down (lands on Germany), Left to Czech Republic, Select, then Down ×3 (Down from Interests lands on "Calculus 2", then on "Back"), Left to Save, Select. **24 presses** (repro 4), plus the name on the phone. Nela is another 22. Q1/Q2 yes; each row has a blurb. Q4 yes. But it's configuring on a TV with a remote, my pet peeve (radka-41-MB5-4). The system row defaults to United Kingdom. If I skip it, Nela's "0,5" reads as nothing (`readNumber` uk → null, repro 3), so the answer goes to "not sure" rather than wrong. That is a safe default.
2. **First maths (Šimon).** Get ready for school → a unit → "The usual" → six questions on the TV. On the phone, "Type my answers". The desk marks them in code at once (`mark/route.ts:61-63`). Repro 3: 3/2 ✓, 2/24 for 1/12 ✓ (equivalent accepted), "4/10" ✗, "£104,40" ✓, "8,7" ✓. A blank and "idk" become **"The desk is not sure"**, so C7's state exists and is visible (`MathsTV.tsx:816`). But a question Šimon simply skipped is presented as the desk's doubt (radka-41-MB5-6). The questions print "£28.85 + £23.19" and "Find 87% of £120" with decimal points for a Czech boy, while his answers are expected with commas (radka-41-MB5-5).
3. **End of evening 1.** The phone recap says "Math Buddy - one set: 4 right, 1 slip, 1 the desk was not sure of", then "Needed a second hint: …" and the TV caption "Good evening's work - two to look at together." That is a sentence a parent reads in seconds (C5 ✓ for this night, but see MB1-2 for a homework-only night). The "Good evening's work" praise sits on every non-empty night.
4. **Evening 2: nothing done** (repro 1, second block). Nobody touched maths. The phone Recap tab still opens, because `log.problems` is non-empty, and says "Math Buddy - 1 hint" with yesterday's "Needed a second hint". The TV caption says "Good evening's work - all of it right." `session.end` never clears the log (`store.ts:620`); only the bench bar's "Reset session" does (`store.ts:621`, `app/tv/page.tsx:148`), and that is not on the remote. The minutes on task keep growing the same way. I can't tell tonight from last night.
5. **Sunday: This week** (repro 2). A week of Nela's homework evenings with hints: "Nothing this week." Only a marked set writes the week's digest (`desk/mark.ts:282`, `desk/essay.ts:101`, `english/conversation.ts:124`). A homework read or a paper writes none. With one set: "Simon worked on one evening. / One-step equations: 4 of 6 right, last set. / One thing to try together: Think of a number, add seven…" (27 words). That is short, plain and kind. The set's "1 not sure" never reaches the week (`notSure` is read nowhere outside `rules/digest.ts`).
6. **Can I say what it covers?** Get ready for school lists 17 units with Czech ročník labels, 5. to 9. ročník. The paper's "Not on the desk yet" (MB4) shows what is missing. There is no single statement of coverage. Q4 for D4: partly.

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER (no answer before the child answers) | **uncertain (L2)** | Code sets never print answers (`items.ts:374,401` drop a question whose print leaks). Hints → see radka-41-MB1-1 (guard gap on Czech notation). |
| C5 recap in sentences: sets, right counts, hints, second hints | **fail** | One night: pass (repro 1, line with set counts). Across nights: stale hints, a stale second-hint list and false praise (MB5-1). Homework nights claim "all of it right" (MB1-2). Only the seated child is covered (MB5-7). |
| C6 no unbacked board/grade/pass | pass | The ročník labels come from the desk's own path data (`prepareRows.ts:15-17`). No board or pass prediction. |
| C7 the source of a tick visible; "not sure" exists and visible | **pass** (minor) | "The desk is not sure", the dashed ring, "the desk was not sure of" (`recapRows.ts:110`). A skipped question shows as not sure (MB5-6). The week page drops not-sure (MB5-8). Who decided a tick (code vs model) is never said (`provider` unwired, MB1). |
| C2, C3, C4 | n-a | MB4. |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| false ticks | **0** in 18 executed typed answers over 3 code sets (frac-add-sub, pct-of-amount, dec-arith; cz) |
| false rings | **0** (3 "wrong" verdicts, all on "4/10", all genuinely wrong) |
| marking agreement | **11/11** decided items agree with the walker's arithmetic (8 right, 3 wrong); 7 unsure counted apart |
| unsure rate | 0.5 / 0.33 / 0.33 per sheet. Informative only: the inputs deliberately held 2 blank or nonsense answers per sheet. |
| line length | static TV lines on this path **6/6 ≤ 25 words** (max 20) |
| time to marked sheet (typed) | L2 (code path, no model: expected ≪ 5 s) |

## Wiring audit

| Route / view | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `recapRows` MathsTile | empty, sets.right/.of/.unsure, pages, hints, second | **7/7** (TV `screens.tsx:334-347`; phone `recapLine` + `log.hard` list) | — |
| `sundayPage` / `sundayWords` | name, evenings, units.name/.right/.total/.sets, stepUps, slip.name/.times, english, essay, tryIt, digest `notSure` | **11/13** | `units[].sets` (ordering only), digest `notSure` (0 hits outside `rules/digest.ts`) |
| `log` | problems, hints, hard, minutes | 4/4 | — (wired, but never reset: MB5-1) |

## Grounding audit

- **MB-SET**: n-a (code) for the school units with generators (`items.ts:136`, `rules/school.ts:2813`); 2/7 for the equations units (see MB4).
- **MB-HINT**: 4/8 if the evening's loop is homework (see MB1).
- **MEM** (`app/api/memory/route.ts:31-35`, `lib/desk/memory.ts:41-55`): topic, the practice items (question, verdict, slip, working), `hintsUsed` = the never-reset `s.log.hints`, and the existing memory notes.
- The recap and the week are code: no model.

## Executions

From ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/radka-41`.

**1. The log across two evenings** (`node .../scripts/recap.cjs`: real `reduce` from `lib/session/store.ts`):
```
EVENING 1 (homework + hints only, nothing marked)
 TV caption: Good evening's work - all of it right.
 log after session.end: {"problems":["k1"],"hints":1,"hard":["3(x - 2) = 2x + 5"],"minutes":0,"started":null}
EVENING 2 (next day, nothing done) - log never reset by session.end
 tile {"app":"maths","empty":null,"sets":[],"pages":0,"hints":1,"second":1}
 TV caption: Good evening's work - all of it right.
 phone line: Math Buddy - 1 hint
set with 1 unsure: Good evening's work - two to look at together. | Math Buddy - one set: 4 right, 1 slip, 1 the desk was not sure of
```

**2. The Sunday page** (same script, `rules/week`):
```
WEEK of homework-only evenings: [{"section":"week","text":"Nothing this week."}]
WEEK with one set: "Simon worked on one evening." / "One-step equations: 4 of 6 right, last set." / "Think of a number, add seven, say the result, and let them find it." words 27
```

**3. Typed marking, cz** (`node .../scripts/mark.cjs`: `makeSchoolItems` seed 12345, `markTyped(..., 'cz')`):
```
readNumber "0,5" cz -> 1/2 decimal | "0,5" uk -> null | "1,000" cz -> 1 (decimal, 3 places)
frac-add-sub: "3/2"->right  "2/24"(1/12)->right  "4/10"(1/9)->wrong  ""->unsure  "0,5303…"(35/66)->unsure  "idk"->unsure
pct-of-amount: Q "Find 87% of £120." expected "£104,40": "36"->right "110"->right "4/10"->wrong ""->unsure "£104,40"->right "idk"->unsure
dec-arith: Q "Work out £28.85 + £23.19." expected "£52,04": "£52,04"->right "63,44"->right "4/10"->wrong ""->unsure "8,7"->right "idk"->unsure
```

**4. Setting up Šimon with the remote** (`node .../scripts/setup.cjs "<keys>"`: real `tvKey` + `reduce`): 24 presses from the landing to Save with elementary / 14 / Czech Republic. The draft opens as `{"type":"high-school"}`. Down from Interests lands on "Maths course / Calculus 2", then on "Back".

## Findings

- **radka-41-MB5-1** (blocker, 27, confirmed). The recap's hint count, the "Needed a second hint" list and the minutes are never reset at the end of a session or day. A night with nothing done shows yesterday's hints, and the TV says "Good evening's work - all of it right."
- **radka-41-MB5-2** (blocker, 18, confirmed). The Sunday page reads only marked sets, Linga and Essay digests. Homework evenings with hints (and papers) write none, so a week of homework help reads "Nothing this week."
- **radka-41-MB5-4** (minor, 6, confirmed). Setting up a child takes 24 remote presses (22 for Nela) through rows that land on "Calculus 2" and "Back". The system silently defaults to United Kingdom.
- **radka-41-MB5-5** (minor, 6, confirmed). Code-written questions print UK decimal points and £/€ for a cz learner ("Work out £28.85 + £23.19"), while the answer is expected with a comma.
- **radka-41-MB5-6** (minor, 6, confirmed). A typed answer left blank (the phone says "Leave one empty if you skipped it") is shown as "The desk is not sure" and counted in the recap as "the desk was not sure of".
- **radka-41-MB5-7** (minor, 6, confirmed). The recap and week cover only the child seated now. To see both children's evening, she switches learners on the TV.
- **radka-41-MB5-8** (polish, 2, confirmed). The digest records `notSure`, but the Sunday page never shows it: "4 of 6 right, last set" hides the item the desk could not decide.
- **radka-41-MB5-9** (strength). Typed marking is code, with no false tick in 18 answers. Comma decimals, unit-suffixed money and equivalent fractions are read correctly for cz. A visible "The desk is not sure" state. A Sunday page in short, plain, code-written sentences with one concrete thing to try together.
- Cross-ref radka-41-MB1-2 (a homework night claims "all of it right") and radka-41-MB1-1 (the leak guard is blind on Czech notation).

## Time saved and grounding

- If it all worked: **~60 min a week saved (Nela) plus one tutor hour a week for Šimon (~500 CZK) · confidence low**. Low because the two parent-facing summaries she would decide on (recap and week) are currently untrue on common evenings. Her file says: if the ticks can't be trusted, the value is negative. The ticks can be trusted; the summaries can't.
- Grounding: MB-SET n-a (code) / 2/7 (equations) · MB-HINT 4/8 · recap and week: code.

## Voice — Radka, first person

I was ready to be won over, and the marking nearly did it. Šimon typed his six answers, and the desk ticked the right ones, rang the wrong one, and said "The desk is not sure" when he left one empty. That's honest, and honest is what I wanted. I can't check the maths myself, so a machine that admits doubt is worth more to me than one that's always confident.

Then I look at what I actually read as the parent. Setting him up took twenty-odd clicks on the remote, and it suggested "Calculus 2" for my fourteen-year-old on the way past. On the second night nobody did any maths, and the TV still congratulated us: "Good evening's work - all of it right," with yesterday's hint still listed on my phone. On Sunday, after three evenings of Nela's homework, the week said "Nothing this week." So the two sentences meant to tell me the truth are the two I can't believe.

Would I keep it? I can name the one thing: make the recap about tonight only, and make the week count the homework evenings. Fix that, and I'd cancel the second tutor hour and tell my colleagues at work. Until then it's a clever gadget that grades itself generously.
