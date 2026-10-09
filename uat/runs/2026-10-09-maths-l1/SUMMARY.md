# Math Buddy L1: SUMMARY

This is the first L1 (theoretical) run of Math Buddy, and the first run of any level for the module: Math L2 waits on the vision host. Cast: 5 Characters, 13 pairs, base `12592a71`, W5 of the /uat adoption. Mode `run`, Phase L1 of the uat skill (v1.11.1). The overlay is `uat/README.md`, `uat/env.md` (*Math Buddy, L1: needs nothing*), `uat/rubric.md` and `uat/accepted-gaps.md`.

**Reconcile first:** before this run, `uat/runs/` held no Math Buddy run of any level.

**Method.** The method was the one used for `2026-10-09-essay-l1`:
- One blind walker per Character, at most 4 at a time.
- Each resolved reachability first, ran the wiring and grounding audits, and executed every rule claim with node on scratch data dirs.
- No model call and no vision call were made. Ollama was never run.
- Every claim that depends on what vision returns is `uncertain` and carries `l2_priority: precondition: vision host (env.md, Math Buddy) — …`.

The orchestrator assembled `findings.json`, derived severities from impact and normalised the MB-MARK scores (below). It re-checked the top blockers against the code:
- `recapRows.ts:84-88` and `store.ts:620`, by reading;
- `calc.ts:50-61`, by reading; the tolerance is documented as deliberate (*Questions*);
- `paperRows.ts:54`, `MathsTV.tsx:716`, `recovery.ts:189-192` and `verify.ts:66`.

## Verdicts

| Journey | Verdict | Pairs |
|---|---|---|
| MB1 | **L1-fail** | matyas conditional · nela **fail** · radka **fail** · vojtech **fail** |
| MB2 | **L1-fail** | nela conditional · owen **fail** · vojtech conditional |
| MB3 | **L1-fail** | matyas **fail** |
| MB4 | **L1-fail** | owen **fail** · radka **fail** · vojtech **fail** |
| MB5 | **L1-fail** | nela **fail** · radka **fail** |

No journey is L1-pass, and every journey has at least one pair that fails. The failures are concentrated on two sides of the product:
- **the boundary checks:** false ticks and the leak backstop;
- **what the parent reads:** the recap, the week page and the paper list.

The marking core for the school units is the strongest thing in the module.

## Grounding denominators (fixed once by the orchestrator and applied to every walker)

rubric.md defines none for Math Buddy, so the orchestrator defined them once. A source counts only when it enters the prompt or the schema of that call.

| Surface | N | Sources |
|---|---|---|
| **MB-READ** (page read, vision) | 5 | P1 photo · P2 subject · P3 school system · P4 topic or course in progress · P5 age or stage |
| **MB-MARK** (snapped sheet: vision read + code verdict) | 6 | K1 photo · K2 the set's items · K3 code's expected answer / spec · K4 school system · K5 slip vocabulary · K6 age or stage |
| **MB-HINT** | 8 | H1 problem · H2 previous hint · H3 learner's question · H4 lesson / rule card · H5 course path · H6 age or stage · H7 learner's working · H8 recorded slips |
| **MB-EXPLAIN** | 8 | X1 item · X2 learner's answer · X3 slip code · X4 learner's explanation · X5 working · X6 age · X7 school system · X8 history on topic |
| **MB-SET** (model-made set) | 7 | Q1 topic · Q2 level / stretch · Q3 past results · Q4 school system · Q5 course path · Q6 aim · Q7 age. Code-built set: n-a (code) |
| **MB-WORKED** (idea text) | 5 | W1 topic · W2 method steps · W3 age · W4 school system · W5 earlier errors on the topic |
| **MB-PICK** (lesson pick) | 3 | L1 problem · L2 library · L3 course / topic |
| **MEM** | — | listed, no score |

**Scores across walkers:**
- MB-READ **2/5** (all five).
- MB-HINT **4/8**; **5/8** on the Calculus path, where the course reaches the prompt (Matyáš).
- MB-PICK **2/3**; not called on Calculus 1.
- MB-WORKED **3/5**.
- MB-EXPLAIN **3/8** (all four): the reply never sees the answer, the working or the slip the code found.
- MB-SET: n-a (code) for the school units, **2/7** on the model-made linear units, **4/7** on Calculus sets.
- MB-MARK, prompt only: **2/6** on a school sheet, **3/6** on a linear or Calculus sheet.

**MB-MARK normalisation:** Matyáš (4/6) and Vojtěch (5/6) also counted sources that reach the code judge. Those are recorded here as *named additions*: K3 and K4 reach the code verdict through `settleSpec` / `check`, and K5 reaches the code slip detector. They are not counted in the score.

**Named additions (Character-specific, absent):** the sheet's language (Czech) and notation (`·`, `:`, the decimal comma) on MB-READ and MB-HINT, for Nela, Radka, Vojtěch and Matyáš.

## Cross-cutting themes (deduplicated, impact-ranked)

1. **The leak backstop fails open on Czech sheets.**
   - The code that stops a hint from stating the answer only works when it can read the task.
   - It cannot read Czech-printed items ("Řeš rovnici", "Vypočítej", "Vypočtěte"), the `·` and `:` signs, decimal commas, maturita shapes, or "Solve …" without a colon (`desk/src/lib/rules/kinds.ts:41-46`, `desk/src/lib/rules/maths.ts:362-376`).
   - **4 of 5 walkers converge**: Nela, Radka and Vojtěch as blockers, Matyáš as a major on the Calculus check. On Vojtěch's tasks the guard caught 0 of 16 answer-giving lines.
   - Whether the model actually leaks is L2 on the vision host. The backstop's absence is confirmed in code.
2. **The evening and the week say what did not happen.**
   - "Good evening's work - all of it right." when nothing was marked (`desk/src/tv/recapRows.ts:84-88`).
   - The log is never reset at `session.end` (`desk/src/lib/session/store.ts:620`), so yesterday's hints show tonight.
   - The Sunday page cannot see homework evenings: "Nothing this week."
   - **Nela and Radka converge independently.** It is the same recap builder as Essay's (`2026-10-09-essay-l1`, `L1-barbora-43-EM4-*`).
3. **False ticks in three places.** These are boundary blockers. School units are clean; the false ticks are at the edges:
   - Calculus: decimal estimates of exact limits and integrals, and `ln x + C` (Matyáš);
   - linear topics: a typed mixed number read as a product (Owen), which also gives a false ring on right mixed-number roots.
4. **The paper list does not add up to the paper.** **3 of 3 MB4 walkers converge.**
   - "No marks were lost" sits beside "N marks lost" when no statement is picked.
   - A question's full loss is copied onto every linked topic, so rows add up to more than was lost.
   - Partial links pull a 9th-grader's or a maturita student's paper down to 5.–8. ročník units.
   - Off-desk statements are hidden as "and 10 more".
   - There is no Select from a row to its set.
   - The statement picker is ~97 English GCSE lines.
5. **"I got something different" for "not sure."** An unsure item reads as wrong, while the code computes the reason (`why`) and no screen shows it. **4 walkers converge** (Matyáš, Nela, Owen, Vojtěch).
6. **The cz learner is half-served.**
   - Answers are read with the comma, but questions print decimal points and £/€ (Nela, Radka, Vojtěch).
   - The school system defaults silently to UK.
   - Explaining is en-US speech only.
   - The hint stance is "a factoring and linear-equations unit" for "a 15-year-old" whatever the sheet (Vojtěch 18, Nela 12).
7. **The desk's ceiling is unsaid.** Topics open on Equivalent fractions (5. ročník) for an 18-year-old. Step-up sets fit 0–2 of 6 at his level. Nothing says the path ends at 9. ročník (Vojtěch).

## Value ledger (promised vs live)

| Journey | Time saved if it all worked | What is live at L1 |
|---|---|---|
| MB1 | Matyáš ~5 · Nela ~15 · Radka ~20 · Vojtěch 0–5 min per evening | Two presses to a hint, plain "no lesson". On Czech sheets the hint's honesty rests on the prompt alone. The page read is unverified (vision host) |
| MB2 | Nela ~10 · Owen ~5 · Vojtěch 0–5 per set | Exact typed marking on school units. False tick on linear mixed numbers. Photo marking unverified |
| MB3 | Matyáš ~15 per set | Excellent equivalence on derivatives. False ticks on limits and integrals. No implicit differentiation |
| MB4 | Owen ~35 · Radka ~45 · Vojtěch ~5 per paper | Exact totals and honest off-desk counting. The topic list over-counts and misleads |
| MB5 | Nela ~30 a week · Radka ~60 a week + a tutor hour | The marking is trusted. The recap and the week are not |

## Strengths worth protecting (constraints on any build)

- Typed marking of the school units is code and exact under cz: 0 false ticks and 0 false rings over more than 150,000 generated answers. Any mixed-number fix on linear items must not touch `readNumber` / `check` for school units.
- Calculus equivalence (39/39 derivative forms) and code-printed specs with no stored answer. A tolerance change must keep the equivalence engine.
- "Not sure" is a visible state. A fix to its wording must keep it distinct from wrong.
- Paper totals are exact, validation never guesses, and no board or grade is claimed. A fix to the fan-out must keep the total sacred.
- Two presses to a first hint, and an honest "No lesson".

## Honest ceilings

- No vision call ran. The page read, photo marking and handwriting read are unmeasured, and so is every MB1 claim downstream of what vision transcribes.
- No hint, explain reply or model-made set was judged. Hint helpfulness, answer leak in model lines and set fit are L2.
- There is no Math harness yet (env.md). MB4 and the typed route of MB2 could run at L2 without vision once one exists.

## L2 items waiting on the vision host (precondition: vision host, env.md *Math Buddy*)

`L1-nela-12-MB1-1` (blocker), `L1-radka-41-MB1-1` (blocker), `L1-vojtech-18-MB1-1` (blocker), `L1-matyas-19-MB1-1`, `L1-matyas-19-MB1-3`, `L1-matyas-19-MB3-7`, `L1-owen-17-MB2-7`, `L1-radka-41-MB1-3`, `L1-radka-41-MB1-4`, `L1-vojtech-18-MB1-3`, `L1-vojtech-18-MB2-8` (majors), `L1-matyas-19-MB1-4`, `L1-nela-12-MB1-4` (minors). `L1-owen-17-MB2-1` (blocker) needs the vision host only for its photo arm; its typed arm is confirmed in code.

## Reconciliation sweep (cross-surface)

| Shared concept | Surfaces traced | Agree? | Rows |
|---|---|---|---|
| "what happened tonight" | `session.log` (`desk/src/lib/session/store.ts`); recap caption (`desk/src/tv/recapRows.ts:84-88`); phone Recap; Sunday page (week digest); memory | **No.** The log spans every evening since the last Reset. The caption counts only marked items. The week counts only marked sets | L1-nela-12-MB5-1, -MB5-2, -MB5-3, L1-radka-41-MB1-2, -MB5-1, -MB5-2 |
| marks lost on a paper | score card (total); caption (`desk/src/tv/paperRows.ts:54`); topic list (`desk/src/maths/MathsTV.tsx:716`); off card; recovery rows (`desk/src/lib/rules/recovery.ts:189-201`) | **No.** The total is exact. The caption and list ignore unpicked questions, and the rows double-count fanned-out losses | L1-owen-17-MB4-1, L1-radka-41-MB4-1, -MB4-2, L1-vojtech-18-MB4-1, -MB4-2, -MB4-3 |
| the school system (cz) | profile row; `readNumber` (answers); code-printed questions; page-read, hint and explain prompts; the worked lesson | **No.** Answers are read cz; questions print UK; the prompts never carry the system | L1-nela-12-MB2-4, L1-radka-41-MB5-5, L1-vojtech-18-MB2-10, L1-matyas-19-MB3-6, L1-nela-12-MB5-4 |
| the learner's age or stage | profile; voice (`desk/src/lib/rules/voice.ts:69`, TEEN.maths "a 15-year-old"); hint stance; Get ready for school labels ("Year 5"–"Year 9"); `schoolYear` | **No.** An 18-year-old is "a 15-year-old". A 17-year-old's topics are labelled Year 5–9. A 12-year-old in 6. ročník is taken for 7. ročník. **The same voice table serves Essay** (`2026-10-09-essay-l1`: Helena and Kristýna) | L1-vojtech-18-MB1-2, L1-owen-17-MB4-7, L1-nela-12-MB5-5 |
| "not sure" | verdict `unsure` (code); `why` (computed); the card's line; recap "the desk was not sure of"; Sunday page | **No.** The card says "different", the reason is unwired, a blank counts as the desk's doubt, and the week drops `notSure` | L1-nela-12-MB2-1, L1-matyas-19-MB3-5, L1-owen-17-MB2-6, L1-vojtech-18-MB2-2, L1-radka-41-MB5-6, -MB5-7 |
| the answer a hint must withhold | `leaksSchool` / Calculus leak check; the task reader (`kinds.ts`, `maths.ts` `equationOf`); the hint prompt's rule | **Partly.** Where the reader parses the task, the check is good (`L1-nela-12-MB1-7`). Where it cannot, only the prompt stands | the theme-1 rows |

**No new row:** every mismatch above is already a walker's row. The sweep adds the cross-module fact. Essay and Math share one recap builder and one voice table, and both runs found the same two defects in them from opposite modules.

## Matches with the existing backlog

Compared with `docs/BACKLOG.md` *## Math Buddy*, which is **empty** (no MB-B entry exists), and with `docs/uat-insights/2026-10-09-essay-w-run.md`, which is Essay only. **No Math row matches an existing backlog id.** Cross-run notes are in `scope_note`: L1-nela-12-MB5-1 and L1-radka-41-MB1-2 share the recap builder with Essay's L1-barbora-43-EM4-6. Every row is new to the backlog; the drain assigns ids.

## Questions the run raises (not decided here)

- **The Calculus rounded tolerance is deliberate** (`desk/src/lib/rules/calc.ts:50`: "a learner who rounds to three figures lands within 5e-3"). rubric.md's false-tick unit and Matyáš's senior bar (a university tutor) count 2.999 for a limit of 3 as wrong, so `L1-matyas-19-MB3-1` is a blocker under the rubric. Either the tolerance or the rubric's reading of it is the owner's call.
- **`ln x + C`** (`L1-matyas-19-MB3-2`) is a false tick only if the item does not restrict x > 0. The items state no domain today.

## Panel verdict

**"It marks honestly; it does not yet tell the truth about the evening."**
- Every Character who typed answers trusts the ticks on school units. Nela: "it marks honestly". Vojtěch: "Hezky to opraví". Radka: "a machine that admits doubt is worth more to me".
- The parents' reading and the edges break that trust. Radka: "the two sentences meant to tell me the truth are the two I can't believe". Owen: "if it ticks wrong answers, what's the point?". Matyáš: "don't trust the ticks on limits yet".
- Vojtěch, out of segment: "není to na maturitu".
- The one shared ask, from both parents and both children, is a recap that says what tonight actually was.
