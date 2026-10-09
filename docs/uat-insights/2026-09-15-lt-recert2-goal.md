# UAT drain — 2026-09-15-lt-recert2-goal

This was the second re-certification's planning half: all ten Characters on J2 (*Agree my topics*), on bc71cb98 code (*ask what to practise before cutting topics*). Codex `gpt-6-astra` played every role. Verdicts: six pass, three conditional, one fail. **Findings are leads.** Drained 2026-10-09 from `SUMMARY.md`, `report.md`, `findings.json`, the ten per-Character reports with their voices, and the parent's `recertify.md`. Gaps were checked against main b8558e80. Paths are relative to `desk/src/`.

12 rows are open. One gap is first raised here and written up in full (LG-25). The rest cross-reference `2026-09-15-lt.md`.

## 1. Confirmed-and-fixed

**What this run proved fixed. Reconstructed, because this run's `findings.json` carries no `fixed` rows and the result lives in `recertify.md`.** Once Linga asked *What would you like to practise?* before cutting topics (bc71cb98, `lib/english/check.ts:256-260`), **topic fit rose from 34% to 92%** (73 of 79 topics, all safe). All ten answered in their own words and languages ("Minecraft! A pejsky a fotbal.", Viktor in Czech). Seven agreed without a single swap. Martin and Oksana, who never agreed a plan in `-lt-recert`, both agreed. This closes the 15 generic-topic rows of `-lt` and `-lt-recert` (`2026-09-15-lt.md` §1, `2026-09-15-lt-recert.md` §1). Voices: *"The first topics are about my actual logistics experience, delivery problems, salary and shifts."* (Oksana). *"It understood that I wanted actual first-date practice, including saying kindly that I don't want another date. That felt useful and adult."* (Lukáš).

**Ceilings:** situations named in the goal still go missing from the first plan (LG-25, six Characters). A swap can still repeat an unwanted theme (LG-1). For Tomáš the plan screen is still wordy: a 25-word question and abstract skill labels (`recertify.md`; LG-6).

**Driver fix found in this run:** the judge read each screen cut to 900 characters, so four Characters were marked down for topics it could not see. f3542b5a raised the cap to 3,000 (LG-3, declined).

Nothing raised here has been closed on main since.

## 2. Design opportunities

| Global rank | LG | Opportunity | Recurrence | This run's rows | Recommendation |
|---|---|---|---|---|---|
| 1 | LG-1 | Swaps forget what the learner turned down | 3 runs · 5 Characters | 1 | build |
| 3 | LG-3 | "The plan is not fully visible before agreeing" | 3 runs · 5 Characters | 4 | decline-with-reason |
| 6 | LG-6 | Planning screens assume an adult reader of English | 3 runs · 2 Characters | 1 | build |
| 24 | **LG-25** | **Situations named in the goal are dropped from the first plan: the goal is cut at 160 characters** (new) | 1 run · 6 Characters | 6 | build |

### LG-25 · Situations named in the goal are dropped from the first plan: the goal is cut at 160 characters — build (new)
- **Evidence:** 1 run, 6 of 10 Characters, 6 rows: `LT-adela-17-J2-3`, `LT-jana-29-J2-1`, `LT-lukas-24-J2-3`, `LT-martin-45-J2-2`, `LT-oksana-34-J2-3`, `LT-petra-38-J2-3`. This is the most frequent problem on a path all ten reach. It ranks below the multi-run gaps only because it was first seen here, after the goal question existed.
- **Voices:** *"I asked for stakeholder disagreement at the start, and I still had to reject two suggestions and type it again."* (Martin). *"I'd already asked for the landlord and Irish banter, so repeating both was mildly annoying."* (Jana). *"I still never got the tech interview I mentioned."* (Lukáš). *"I had already asked for that, so repeating myself was unnecessary."* (Petra).
- **Root cause, verified against the stored artifacts and the code:** **the goal is cut at 160 characters before the plan reads it.** The goal question accepts up to 400 characters (`TOPIC_ASK_MAX`, `lib/english/check.ts:346`). It saves the answer as the learner's preference with `said.slice(0, 160)` (`check.ts:349`). The plan call then reads `goal: prefs.goal || k.goal` (`check.ts:192`): the truncated preference wins over the full answer the check still holds. The code was the same at bc71cb98, the run's code. The stored answers (`<character>.json`, the `goal` step) show that every situation a Character had to ask for again sits **after character 160**:

  | Character | Goal length | Asked again for | Where it starts in the answer |
  |---|---|---|---|
  | Adéla | 342 | a mock interview | after 160 ("…Could we include a mock interview…") |
  | Jana | 265 | Irish office banter, a pushy landlord | after 160 |
  | Lukáš | 289 | a tech job interview (ending a date politely) | after 160 |
  | Martin | 233 | disagreeing when stakeholders don't agree | after 160 |
  | Oksana | 215 | a phone call with a carrier | after 160 |
  | Petra | 179 | small talk with her child's teacher | straddles 160 ("…small talk with t") |

  The four whose goals fit in 160 characters (Klára 76, Ondřej 112, Tomáš 29) repeated nothing. Viktor (200, in Czech) lost "that I miss them" from the tail and added it himself as an own-words topic (`LT-viktor-67-J2-1`). The interest check (ef1dcb40, `check.ts:190-191`) never sees the goal, and the goal reaches the plan only as the prompt line "put the two closest to their goal first" (`check.ts:164`).
- **Cost/value:** XS, plus an optional S. The plan should read the whole answer: prefer `k.goal` for the check in hand, or keep the preference at the 400 the question accepts (`lib/english/rules.ts:15` and the phone's Set up field, `english/LingaPhone.tsx:51`, both cap it at 160). Optionally extend the ef1dcb40 pattern so each situation the goal names reaches a topic, with one re-ask. Value: being heard the first time is what the planning step is for. Repeating oneself *"weakens confidence that Linga listened, even when the finished topics are useful"* (`SUMMARY.md`).
- **Hypothesis left:** whether the full goal alone fixes all six, or whether the model also drops situations from a long goal. Re-run the six after the XS fix and before building the coverage check.
- **Guardrail:** the goal question itself works (fit 92%) and its answer may be in any language. The check must not turn the goal into a form.
- **Ceiling:** a situation can be present in a title and still be practised thinly. Coverage is not fit.

### What this run adds to the earlier gaps
- **LG-1.** The swap recycling survives the goal fix: *"Swapping the role topic gave me another role topic, so that needed two goes."* (Ondřej, `LT-ondrej-16-J2-4`). Lukáš, who gave no preference, calls swapping easy. Both verdicts are kept: successful mechanics and a useful replacement are separate questions.
- **LG-6.** *"There were lots of English words. 'Understand and repair' — nevím. Mum would need to help me read."* (Tomáš, `LT-tomas-9-J2-1`). The only Character who cannot plan alone, despite the best topic fit (*"my plan got 'Creeper goes boom'. I like that."*).
- **LG-3.** All four visibility rows here (`LT-viktor-67-J2-1`, `LT-klara-13-J2-3`, `LT-petra-38-J2-4`, `LT-tomas-9-J2-2`) are the 900-character cut. The stored last plan screens run 1,076–1,218 characters, with 5–6 of 7 topics inside the cut. Viktor's *"As a former signalling technician, I like a clear confirmation that an action worked"* is a fair ask of the real UI. The phone does list every topic with its reason, so it returns only with L2 evidence.

**Strengths, as constraints:** personal intent survives an own-words addition for all ten, including awkward interpersonal details, operational requirements and family feelings (`SUMMARY.md`, *Strengths*). LG-25's re-ask must not rewrite what the learner said. Tomáš and Viktor express their goals in Czech (`LT-tomas-9-J2-3`, `LT-viktor-67-J2-3`), so the goal check must read any language. Ondřej's alcohol prompt became a usable party topic with no lecture (`LT-ondrej-16-J2-2`).

### Accounting: every open row of 2026-09-15-lt-recert2-goal

| Open row (2026-09-15-lt-recert2-goal/…) | Severity · rank | Title | Disposition |
|---|---|---|---|
| `LT-viktor-67-J2-1` | major · 9 | The added topic is saved but absent from the agreement screen | declined, LG-3 (driver artefact) |
| `LT-jana-29-J2-1` | minor · 6 | Initial suggestions omit two explicitly requested situations | LG-25 |
| `LT-klara-13-J2-3` | minor · 6 | The recorded preview does not establish full-plan visibility | declined, LG-3 (driver artefact) |
| `LT-martin-45-J2-2` | minor · 6 | An explicit stakeholder goal required repeated steering | LG-25 |
| `LT-oksana-34-J2-3` | minor · 6 | An explicit carrier-call request needs repeating | LG-25 |
| `LT-petra-38-J2-4` | minor · 6 | The transcript does not establish full topic review | declined, LG-3 (driver artefact) |
| `LT-tomas-9-J2-1` | minor · 6 | Planning language is too demanding for this beginner | LG-6 |
| `LT-tomas-9-J2-2` | minor · 6 | The supplied display does not visibly confirm the added topic | declined, LG-3 (driver artefact) |
| `LT-adela-17-J2-3` | minor · 3 | Initial proposals omit an explicitly requested interview | LG-25 |
| `LT-lukas-24-J2-3` | minor · 3 | The requested tech interview never enters the plan | LG-25 |
| `LT-ondrej-16-J2-4` | minor · 3 | The first swap repeats the unwanted role theme | LG-1 |
| `LT-petra-38-J2-3` | minor · 3 | An explicit initial request needed repeating | LG-25 |

**Total: 12 open rows** = 8 to an LG build/concept/method entry + 0 closed-on-main + 4 declined (LG-3). The run's open count is 12.

## 3. Methodology lessons

- **A driver cap was found mid-run, and the run's own rows show it.** Four of the twelve open rows are the judge reading a 900-character cut of each screen. The fix landed in the same commit (f3542b5a), but the rows stayed `open`. Every earlier plan-visibility row (`-lt`, `-lt-recert`) is the same artefact, verified here against the stored screens (LG-3). **Lesson:** a driver change that invalidates rows should stamp them in the same change, as `VERIFY.md` did for J1.
- **All criteria met, yet only six passes.** All ten scorecards meet their listed criteria, and the verdicts are six pass, three conditional and one fail (`SUMMARY.md`, *Honest ceilings*). The verdicts carried what the criteria did not: having to repeat oneself, and needing Mum to read. **Proposal (overlay, not applied):** the J2 rubric gets a criterion for *nothing asked for had to be repeated*. LG-25 is the product side.
- **A single-journey run measures one fix well, and nothing else.** Every voice withholds judgement on teaching (*"I haven't heard the partner or seen a correction"*). The synthesis's own `method-commitment` (test conversation, feedback and level trust in a separate journey) is met by the other four runs. Its `decline-with-reason` (no tutor-replacement, travel-saving or wait-value claims from two low-confidence estimates of 2 and 3 minutes) is recorded here as a decline of a *claim*, not of a product idea, so it enters no backlog entry.
- **Schema miss, a third time:** the 92% result closes rows in two other runs, and none was stamped `fixed`.
