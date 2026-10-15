# nela-12 × MB5 · Is it worth keeping?

- Character: nela-12, with Mum (Radka) beside her. Profile `elementary`, 12, `cz`, School maths, Family.
- Journey: MB5 · Is it worth keeping? (setup → an evening → recap → the week)
- Cert level: L1
- Base commit: 12592a71
- **Verdict: L1-fail.** Setup and the typed evening loop hold. The evening's end does not:
  - The recap's caption says "Good evening's work - all of it right." on an evening where nothing was marked (a homework sheet with hints, or a Linga talk). This is a blocker by impact rank, confirmed by execution.
  - The hint counts and the "Needed a second hint" list carry every earlier evening.
  - The week page cannot see homework evenings at all.

## Reachable surface set

- Fresh desk, nobody seated → landing "place" → learner switcher → "add" → profile draft (`desk/src/tv/keys.ts:275-277`, `:314`, `:317-333`).
- Profile rows (`desk/src/tv/profileRows.ts:66-77`):
  - Type: the draft starts as `high-school` (`store.ts:517`).
  - Age, 6–14 for Elementary.
  - No Mode row under 18 (`profileRows.ts:71`).
  - School system: none chosen means UK (`profileRows.ts:24-25`, `:31`).
  - Interested in.
  - Maths course: School maths is first and the default.
  - Save / Back.
- The name is typed on the phone's Profile panel, which works unjoined (`desk/src/app/phone/panelFor.ts:23`).
- Pairing: Tonight Down → pair (`keys.ts:297`), or the QR's `?pin=` (`app/phone/page.tsx:110-118`).
- The evening: MB1 and MB2 surfaces (see those reports).
- End: Menu on the landing (`keys.ts:273`), or phone Tonight → End session (`page.tsx:354-358`, `:611`). The TV recap (`tv/screens.tsx:303-345`) and the phone Recap tab (`page.tsx:615-626`); only the phone tab carries "This week" (`page.tsx:644-650`, `lib/rules/week.ts`).
- Not hers: the Adult mode row (hidden under 18) and the Calculus courses on the profile row.

## Surface model

| # | Affordance | file:line | Route / pipeline | AI sources |
|---|---|---|---|---|
| 1 | Landing: "Someone else" → switcher → add | `keys.ts:269-288`, `:309-316` | events only | none |
| 2 | Profile picks on the TV, name on the phone | `profileRows.ts:66-77`, `keys.ts:317-333`; phone `profile` panel | `profile.draft` / `profile.save` (`store.ts:517-522`) | none |
| 3 | Pair the phone | `keys.ts:289`, `:297`; `page.tsx` join | `join` | none |
| 4 | Tonight → one MB1 or MB2 loop | see MB1 and MB2 | `/api/read`, `/api/hint`, `/api/practice`, `/api/mark` | MB-READ, MB-HINT, MB-MARK, MB-EXPLAIN |
| 5 | End: Menu on the landing / End session | `keys.ts:273`, `page.tsx:354-358` | `session.end` (`store.ts:620`) + `/api/memory` | MEM |
| 6 | TV recap: one tile per app, one caption | `tv/screens.tsx:305-345`, `tv/recapRows.ts:44-89` | pure rows | none |
| 7 | Phone Recap: a line per tile, caption, "Needed a second hint: …", This week | `page.tsx:615-626`, `:644-650`; `recapRows.ts:98-125`; `week.ts:118-217` | `s.week` (`store.ts:744`) | none |

## The walk (in character, Nela with Mum)

**Step 1, setup.**
- The desk asks who sits there. Mum presses "Someone else", then "add a learner".
- The type is preset to High school, so they move to Elementary ("About 6 to 14 years old. The desk keeps it simple and careful…"), then Age 12.
- School system: the "Czech Republic" cell's blurb says only "Progress is shown against Czech ročníky." Nothing says this choice decides that "0,5" is read as a half. If Mum skips the row, the desk reads every comma as unsure (E7: `£22,74` → cz right, uk unsure) and the card says "I got something different" (nela-12-MB5-4).
- Nela types her name on the phone, then Save. Back on the desk, Math Buddy is lit.

1–4: yes for a parent who reads the blurbs. No manual is needed, which is DoD 1.

**Step 2, first piece of maths.** Math Buddy → Tonight shows three doors. The homework door is lit, and there are 2 presses to a first hint (MB1).

**Step 3, across the evening, can Mum see it hold back and mark honestly?**
- Hints: on a task the code reads, the hint is checked and re-asked. On her Czech-notation items there is no code check (nela-12-MB1-1). Whether a hint states the answer is L2.
- Marking: the typed set is code-marked, 0 false ticks in 5,039 answers (MB2, E7). Ticks are honest.
- "Not sure": the dashed ring and the title "The desk is not sure" are honest. The card under them says "I got something different for number N", which tells Mum the opposite (nela-12-MB2-1).

**Step 4, end of evening.** Mum presses Menu on the desk, or End session on the phone. The TV recap draws the Math Buddy tile (pages, hint lamps, sets) and one caption. The phone shows the same lines, then "Needed a second hint: 3/4 + 1/6", then "This week".
- **Evening of homework only** (a snapped sheet, 3 hints, nothing marked): the caption is **"Good evening's work - all of it right."** (E6, E5). Branches of `recapCaption` (`recapRows.ts:84-89`):

  | Evening | Caption | Correct? |
  |---|---|---|
  | All empty | "A quiet evening." | correct |
  | Set slips or unsure, or essay sentences | "N to look at together" | correct |
  | A set all right | "all of it right" | correct |
  | Homework and hints only, nothing marked | "all of it right" | **wrong** |
  | A Linga talk only | "all of it right" | **wrong** (nothing graded) |
  | An essay reading with 0 to fix | "all of it right" | correct |

  `toLook` counts only sets and readings (`recapRows.ts:75-82`). nela-12-MB5-1.
- **Second evening, before any work:** the recap already reads "Math Buddy - 1 hint", "Needed a second hint: 3/4 + 1/6" (yesterday's) and "all of it right" (E5). `log.hints`, `log.problems` and `log.hard` are never reset at `session.end` (`store.ts:620`); only the bench's Reset clears them (`app/tv/page.tsx:148`, `store.ts:461-482`). The memory route then tells the model "Hints asked for: N" with the cumulative N (`app/api/memory/route.ts:30-34`). nela-12-MB5-2.

1–4: Mum knows what she is looking at. The words are short, counts only. But she cannot tell a checked evening from an unchecked one.

**Step 5, the week page.** A week of three homework sheets with hints and no practice set gives "Nothing this week." (E6). The page is built only from the digest (`week.ts:118-123`), and only marked sets, essay readings and Linga talks write to it (`mark.ts:282`, `essay.ts:101`, `conversation.ts:124`). The homework read writes a history line only (`app/api/read/route.ts:31-34`). DoD 3 ("a page for the week shows the pattern") fails for Nela's main use. nela-12-MB5-3.

On a week that has a set, the page has one line per unit, "the most common slip" by name (e.g. "Added the tops and the bottoms") and one thing to try together. That is good. The fractions activity is "how much half a cup and a quarter cup make", a non-Czech kitchen measure (polish, not filed).

**Step 6, can Mum say what it covers?**
- What it covers: the hint door, the Topics ruler of school units, and "No lesson in tonight's library covers this one" for what it doesn't.
- What she cannot say is how far the recap covers her child's evening, given the "all of it right" and the "Nothing this week".
- Would she keep it? Her one blocker is "it told me all right when nobody checked".

## Scored criteria touched

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) | uncertain (L2) | Inherited from MB1-1 (no code check on Czech notation) and MB2 (explain reply checked) |
| C2 (BLOCKER) no false tick | **pass (typed)**, photo L2 | E7: 0 / 4,881 decided |
| C3 decimal comma | **pass when the profile says cz**; silently unsure when the system row is skipped | E7 (`cz` right, `uk` unsure); `profileRows.ts:24-31` |
| C4 ≤25 words | fail (inherited) | 46/58 fixed lines. The recap lines are short: phone lines are counts. The caption is ≤8 words |
| C6 "not sure", no guessed verdict | **fail** | E8, the "I got something different" card on unsure items |
| C7 ≤4 presses to the first hint | **pass** | 2 presses (MB1) |
| C8 | pass (with note) | MB2 E3 |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| presses to first hint | 2 |
| false ticks / false rings | 0 / 0 (typed, cz), photo L2 |
| unsure rate | 0.03 battery; 0.33 on the walked six |
| line length | 0.79 (fixed lines) |
| answer leak | code lines 0; model lines L2 |
| page read rate, handwriting read, time to marked sheet (photo) | L2 (vision host) |

## Wiring audit

| Route / rows | User-facing computed fields | Wired | Unwired |
|---|---|---|---|
| `recapRows` → TV recap | sets, pages, hints, second, empty | 5/5 (`tv/screens.tsx:305-345`) | none |
| `recapLine` / `recapCaption` / `tasksLine` → phone | lines, caption, list | 3/3 (`page.tsx:619-624`) | none |
| `sundayWords` → `s.week` → phone | lines | 1/1 (`page.tsx:626`, `:644-650`) | none |
| `SundayPage.evenings`, `.units`, `.slip`, `.tryIt` | all through `linesOf` (`week.ts:168-197`) | 4/4 | none |

Wiring is complete. The defects are in what the wired values count.

## Grounding audit

- This journey reuses MB1 and MB2's AI surfaces: MB-READ 2/5, MB-HINT 4/8, MB-PICK 2/3, MB-SET n-a (code), MB-WORKED 3/5, MB-MARK 2/6, MB-EXPLAIN 3/8.
- **MEM, no score** (`lib/desk/memory.ts`):
  - topic;
  - "Marked: r right, w wrong, u the desk could not call";
  - "Hints asked for: N", which is cumulative (MB5-2);
  - the set's rows: question, verdict, slip id and line, working;
  - the notes already kept.
  - The homework sheet's problems are not sent. A homework-only evening reaches memory only as a hint count.

## Executions

All were run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/nela-12`. The scripts are in `…/data/nela-12/scripts/`.

- **E5** `node …/scripts/e5.cjs`: reducer (`store.reduce`), two evenings, then `recapRows` / `recapLine` / `recapCaption`.
  ```
  evening 1 recap: Math Buddy - 1 page; 1 hint | Linga - not tonight | Essay Master - not tonight | hard: ["3/4 + 1/6"]
  evening 2 tonight stops: ["continue","homework","teach","prepare"] focus 0 = continue
  Select on "I have homework" evening 2 -> [{"type":"subject","subject":"maths"},{"type":"page.select","pageIx":0},{"type":"nav","screen":"page","focus":0}]
  evening 2 recap before any work: Math Buddy - 1 hint | … | hard still: ["3/4 + 1/6"] | caption: Good evening's work - all of it right.
  ```
- **E6** `node …/scripts/e6.cjs`:
  ```
  week page, homework-only learner (no digest): [{"section":"week","text":"Nothing this week."}]
  recap caption, homework sheet + 3 hints, nothing marked: Good evening's work - all of it right. | Math Buddy - 1 page; 3 hints
  recap caption, set 4 right 2 unsure: Good evening's work - two to look at together. | Math Buddy - one set: 4 right, 2 the desk was not sure of
  recap caption, Linga talk only: Good evening's work - all of it right.
  ```
- **E7** (MB2): `£22,74` → `cz` right, `uk` (the default when the row is skipped) unsure.
- **E3** (MB2): `learnerYear=7` for age 12 in cz. She is in 6. ročník; `schoolYear` ignores the cut-off (`library/syllabus.ts:296-304`).

## Findings

| Key | Sev | Title |
|---|---|---|
| nela-12-MB5-1 | **blocker** (27) | Recap says "Good evening's work - all of it right." on an evening where nothing was marked |
| nela-12-MB5-2 | **blocker** (18) | The evening log never resets: hint counts, "Needed a second hint" and the memory's hint count carry earlier evenings |
| nela-12-MB5-3 | major (12) | The week page cannot see homework evenings ("Nothing this week." after three sheets) |
| nela-12-MB5-4 | minor (6) | School system defaults silently to UK, and the row's blurb does not say it decides how 0,5 is read |
| nela-12-MB5-5 | minor (3) | A 12-year-old in 6. ročník is taken for 7. ročník (`schoolYear` ignores the cut-off) |
| nela-12-MB5-6 | strength | Setup is D-pad plus one name on the phone, with no Mode row under 18; recap lines and the week page are counts, slip names and one thing to try, never an answer |

## Time saved and grounding

- **~30 min saved a week · confidence low** (the file promises ~45). The evening's work is real. What the parent is told about it is not trustworthy enough yet to replace "nobody checks until the teacher does".
- Grounding: inherited (MB-READ 2/5, MB-HINT 4/8, MB-MARK 2/6, MB-EXPLAIN 3/8, MB-WORKED 3/5, MB-SET n-a); MEM listed.

## Voice — Nela, first person (Mum beside me)

Setting it up was easy. Mum clicked Elementary and 12, and I typed "Nela" on the phone. Mum didn't know what "School system" was for. She clicked Czech because we're Czech, not because it said anything about commas.

At the end it said "Good evening's work - all of it right." Mum smiled. But we only did the homework sheet with hints; nothing was checked. Tomorrow the teacher will mark two red, and Mum will say "but the TV said all right". To je přesně to, co nesnáším: being told it's fine when it isn't.

The next evening, before we did anything, it already said one hint and "needed a second hint" on yesterday's problem. Mum asked "did you already start?" No.

The week page said "Nothing this week." We did three sheets!

Would Mum keep it? She says yes for the practice sets, because the ticks are right. But she won't trust the recap until it stops saying "all right" about things nobody checked. That's the one thing.
