# Essay Master L1 — SUMMARY

The first L1 (theoretical) run of Essay Master. 5 Characters, 10 pairs, base `12592a71`. W5 of the /uat adoption. Mode `run`, Phase L1 of the uat skill (v1.11.1). The overlay is `uat/README.md`, `uat/env.md` (*Essay Master, L1: needs nothing*), `uat/rubric.md` and `uat/accepted-gaps.md`.

**Reconcile first:** before this run, `uat/runs/` held no Essay L1 run: no `findings.json` with `cert_level` L1 on an EM journey. The only Essay run is `2026-10-09-essay-w-run`, an L2 run with no findings.json. So both journeys sets were walked in full.

**Method.** One walker subagent per Character, at most 4 at a time, each walking every journey its file binds. Walkers worked **blind**: they were forbidden `docs/BACKLOG.md`, `docs/uat-insights/`, `.personas/` and every run under `uat/runs/`. Each built its surface model from its Character's Surface binding along the import chain, resolved reachability first, ran the wiring audit (field name grep under the UI code) and scored grounding against the shared denominators below. Rule claims were executed with node through `tools/ts-load.cjs`, on scratch `DESK_DATA_DIR`s outside the repo. No model call was made: no desk engine, no Ollama, no codex. The orchestrator assembled `findings.json` and derived each severity from impact. It re-checked the top blockers against the code (the splitter at `desk/src/lib/rules/essay.ts:35` re-run; `style.ts:93` against SPEC 5.1; `texts.ts:76`), then compared every finding with the backlog (*Matches*, below).

## Verdicts

| Journey | Verdict | Pairs |
|---|---|---|
| EM1 | **L1-fail** | barbora conditional · eliska **fail** · helena conditional · kristyna **fail** |
| EM2 | **L1-conditional** | daniel conditional · eliska conditional |
| EM3 | **L1-fail** | daniel **fail** · kristyna **fail** |
| EM4 | **L1-conditional** | barbora conditional |
| EM5 | **L1-fail** | helena **fail** |

No journey is L1-pass. EM2 and EM4 are L2-eligible with their majors carried. EM1, EM3 and EM5 each have a structural gap to fix before L2 time is spent on them. EM3 and EM5 have never been reached at L2 (env.md); this is their first certification of any kind.

## Grounding denominators (fixed once by the orchestrator and applied to every walker)

rubric.md defines no grounding denominator for Essay Master, so the orchestrator defined these once. A source counts only when it enters the prompt or the schema of that call.

- **ES-READ**: the reading of a paragraph or a piece (`/api/analyse` → `lib/desk/essay.ts` analyseEssay / analysePiece). N = 8: S1 the learner's own text; S2 the lens; S3 the kind of writing; S4 the learner's age or stage; S5 the mode (Family / Adult); S6 the task the writing answers; S7 the learner's history on this desk; S8 the learner's kept memory notes.
- **ES-REVISE**: judging a rewrite (`reviseSentence`). N = 7: R1 the rewritten sentence; R2 the original; R3 its verdict and note; R4 the fix shown; R5 the surrounding sentences; R6 the lens; R7 age or stage.

**Scores:** ES-READ **3/8** for Barbora, Daniel, Eliška and Kristýna (S1, S2, S4). It is **2/8** for Helena: her profile has no age, so S4 does not reach (the prompt falls back to "a 15-year-old"). S4 counts when the profile's age is an input to the voice, coarse band or not. Kristýna (17) is still named "a 15-year-old" (`L1-kristyna-17-EM1-8`). ES-REVISE scores **7/7** (Daniel, Eliška). The twin portrait and card are code with no model call: n-a. Named additions outside the score: Kristýna's `cz` school system and the text's language (absent); Helena's email kind and Adult mode (absent, also S3 and S5).

## Cross-cutting themes (deduplicated, impact-ranked)

1. **The reading is English-shaped and says nothing about it.**
   - The splitter's ASCII-capital lookahead, the English word lists behind code verdicts and the plan's capital check all misfire on Czech, and also on any English sentence that opens with an accented capital ("Émile").
   - No surface says Essay Master reads English: there is no language check and no copy that says so.
   - Kristýna's four blockers sit here (rank 27). Barbora, Eliška and Helena all raise the missing refusal independently, as minor or polish, because Czech is off their path: **4 of 5 walkers converge**.
2. **The code rule loses cross-sentence context where the job needs it.**
   - A claim placed before its evidence is missed (Eliška, blocker).
   - Each paragraph of a piece is ruled alone, so intros and conclusions become false faults and "Start with paragraph k" points at them (Daniel, blocker).
   - A rewrite is ruled on regex-guessed context or on cross-paragraph context the first reading never used, so false "holds" appear (Eliška, Daniel).
   - Kept verdicts go stale after a rewrite (Eliška, matches EM-B3).
   - One shared mapping, two directions of error: the first reading is too narrow and the rewrite is too wide.
3. **Ghostwriting is guarded only where a pattern is concerned.** Notes and the summary pass through `cleanNote` (it strips a leading label) and nothing else. A slotted new-content pattern passes. The x-ray shows a hand-in-ready model paragraph on the sample's topic. **4 of 5 walkers converge** (Barbora, Daniel, Eliška ×2). This matches the W-run's accounting #2. It is a boundary metric, so it stays uncertain until a reader counts it at L2.
4. **What the evening and the shelf say is not what happened.**
   - The recap counts the first reading only (EM-B1).
   - A whole piece is recapped as "not tonight" or "0 of 0".
   - The phone Recap vanishes when the TV leaves the recap.
   - Delete-all leaves the read text in `session.json` and on the TV.
   - The notice covers kept pieces only.
   - The twin's "never keeps what other people wrote" is false for quoted replies.
   - Barbora and Helena, the two adults, both land here.
5. **Adult mode is a Family product with a different landing.**
   - The prompt addresses "a 15-year-old" student; the kind of writing never reaches it.
   - The Language lens falls back to the essay move "Claim, then evidence, then the link back".
   - The twin's directness is inverted against SPEC 5.1, and its level words misread email (greeting + sign-off = "ceremonial").
6. **The whole-piece flow loses the learner's place.**
   - The forensic page never names the paragraph.
   - The paste box and the shelf hide behind the forensic page.
   - A revised paste makes a duplicate "Untitled essay".
   - The pre-filled sample fuses with a paste.
   - "Next paragraph (2 of 5)" replaces the piece's reading.
7. **Present-and-correct-but-unwired.** Every walker found `stats.words` and `stats.links` unwired, and four found `provider` unwired too: computed on every reading and drawn nowhere. `/api/texts` `noticed` and `notice` are unwired (3 walkers), as are `sentences[].connectors` and the twin's `words[].level`. *Wiring ratio, `/api/analyse` (paragraph):* 16/18 to 18/22 by walker. They disagree on the denominator: some counted `provider` and `connectors`, some did not. The unwired set is the same.

## Value ledger (promised vs live)

| Journey | Time saved if it all worked (Character minutes) | What is live at L1 |
|---|---|---|
| EM1 | Barbora ~13 · Eliška ~10 · Helena ~1 · Kristýna −5 | A correct sentence-level pointer for English school paragraphs, with the claim-before-evidence and PEEL Explain gaps. Nothing for Czech. Little for email |
| EM2 | Eliška ~8 · Daniel −12 (he would rather not revise) | The loop is sound; the "holds" signal is not yet trustworthy |
| EM3 | Daniel ~5 · Kristýna −12 | The machinery is sound. The verdicts on intros and conclusions are wrong, so the headline answer ("which paragraph first") is unreliable |
| EM4 | Barbora ~13 (the trust condition on EM1's evening) | Exact for one paragraph read once. Wrong after a rewrite, a piece or a Back press |
| EM5 | Helena ~0 (a loss until the card is used elsewhere) | Shelf and delete are good. The twin's words are wrong, and the Workroom shows her words |

Grounding: ES-READ 2–3/8, ES-REVISE 7/7. The reading is the surface where "good machinery fed thin context" applies. The task (S6) is entered on the phone but never reaches `judge()` (`L1-barbora-43-EM1-3`, `L1-daniel-15-EM3-7`).

## Strengths worth protecting (constraints on any build)

- Verdicts stay code's. Any language or cross-paragraph fix must keep `decideVerdicts` the decider and the model an observer.
- The pattern guard (no 4-word run of the learner's words) holds in Czech. Any widened ghostwriting guard must not loosen it.
- Every other verdict is kept by code across a rewrite (`desk/src/lib/desk/essay.ts:189`). A fix to stale verdicts must be a fresh reading, not a silent re-judge.
- The recap and the Sunday page are built from counts and lens names only (curtain 0). EM-B1's count fix must keep that.
- Refusals happen before any model call, in one plain sentence.
- The one-time notice is server-enforced, names the engine, and offers "Read without keeping".

## Honest ceilings

- No live output was judged. Verdict agreement, note quality and ghostwriting in notes are the model's, and L2 owes them.
- The L2 harness reaches only EM1, EM2 and EM4's paragraph path, with a fixed learner. EM3 and EM5 have no L2 until the harness takes a piece, the shelf and Adult mode (env.md).
- Code-only verdict-agreement figures (Eliška 0.69, Kristýna 1/8) assume faithfully simulated observations. They locate a rule defect; they do not measure the live model.

## Reconciliation sweep (cross-surface)

| Shared concept | Surfaces traced | Agree? | Rows |
|---|---|---|---|
| "k of n sentences to fix" | forensic page after a rewrite; history line (`desk/src/lib/desk/essay.ts:97`); recap parser (`desk/src/tv/recapRows.ts:35`); phone Recap; Sunday page; lens home | **No.** The count freezes at the first reading. The piece suffix ", N paragraphs" fails the recap regex. The Sunday page calls a piece "one paragraph reading". `n` comes from a splitter that undercounts accented capitals | L1-barbora-43-EM4-2, -EM4-3, L1-kristyna-17-EM3-1 |
| the learner's age or stage | profile (`desk/src/tv/profileRows.ts`); voice (`desk/src/lib/rules/voice.ts:37`, `:70`); reading and rewrite prompts | **No.** Every age ≥14, and no age, is "a 15-year-old"; Adult mode never reaches the prompt. The same table serves Math Buddy (see the maths run's sweep) | L1-helena-46-EM1-1, L1-kristyna-17-EM1-8 |
| the kind / format of a piece | phone keep (always `essay`); `/drop` (defaults to `message`); shelf list (hides format); twin channel; reading prompt (never sent) | **No** | L1-helena-46-EM5-8, L1-helena-46-EM1-2 |
| "what is kept, and delete" | the notice's text; the shelf; `session.json`; the forensic page after delete-all; twin exemplars | **No.** The notice says the text stays "until you delete them", but the read text survives delete-all and a paragraph evening shows no notice | L1-helena-46-EM5-4, L1-barbora-43-EM4-4, L1-helena-46-EM5-9 |
| "Essay Master reads English" | `docs/FAMILY-PHASE-1-PLAN.md:50`; landing card; phone Essay tab; prompts; rules word lists | **No.** It is decided in a doc and said on no surface | L1-kristyna-17-EM1-1 |
| sentence role | regex first pass (`desk/src/lib/rules/essay.ts:15`, `:60`); the model's observation; the code verdict; the forensic crumb and table | **No.** The crumb shows the regex role, which can contradict the verdict | L1-eliska-12-EM1-5, L1-daniel-15-EM2-3 |

**No new row:** every mismatch the sweep traced is already a walker's row, and those rows are cited. The sweep adds the cross-surface statement: one count, one age, one kind and one deletion promise are each defined in several places, and the places disagree.

## Matches with the existing backlog (orchestrator, after every walk)

Compared with `docs/BACKLOG.md` (*## Essay Master*: EM-B1..EM-B3) and `docs/uat-insights/2026-10-09-essay-w-run.md`. Each match is recorded in its row's `scope_note` as "matches …". No backlog id is assigned here; the drain does that.

| Row | Matches |
|---|---|
| L1-barbora-43-EM4-3 | **EM-B1**: the recap counts a rewritten-to-strong sentence as still to fix |
| L1-eliska-12-EM2-3 | **EM-B3** (declined): a rewrite re-judges only its own sentence. Raised here independently from a learner's walk, which bears on EM-B3's "returns with a learner's reading that the kept note misleads" |
| L1-barbora-43-EM1-1, L1-daniel-15-EM2-4, L1-eliska-12-EM1-3, L1-eliska-12-EM1-4 | essay-w-run accounting #2: the ghostwriting check is a substring test (covered-elsewhere: DESIGN-ESSAY-MASTER.md *Owed*) |
| L1-eliska-12-EM1-6 | essay-w-run accounting #3's ceiling: `cleanNote` strips a leading label only |
| L1-daniel-15-EM2-2, L1-helena-46-EM1-3 | essay-w-run accounting #5: a note contradicting its code verdict (covered-elsewhere: DESIGN-ESSAY-MASTER.md follow-up (b)) |

**Near EM-B2, not a match:** `L1-barbora-43-EM4-6` ("Nothing needed a second hint." on a writing evening) is on the same phone Recap tab as EM-B2's "Nothing written down tonight.", but it is a different line and a different cause. The walkers confirm EM-B2's premise in passing: no memory call on an essay-only evening (barbora-43 × EM4, *Grounding*: MEM not reached).

Every other row is new to the backlog.

## Panel verdict

Four adults and a child agree on one thing. **It points at the right sentence and never writes for you, so far as code can promise. What it says about the sentence, the evening and the shelf is not yet reliable enough to repeat to someone else.**
- Eliška would tell a friend, "but put the evidence straight after the point".
- Barbora would say "it shows the count without the homework", not "it tells you what happened tonight".
- Daniel: "it's weird about intros and conclusions".
- Helena: "the sentence-length check is honest and the rest is homework".
- Kristýna asks for one sentence, "Essay Master reads English writing", before anything else.
