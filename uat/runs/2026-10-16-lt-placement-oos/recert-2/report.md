# LT run 2026-10-16-lt-placement-oos/recert-2 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 2 Characters · 2 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 1 of 2

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| hana-41 | J1 | fail - D5 failed: #9 'Fixing small grammar will help you speak more easily in meetings' is templ…; C4 failed: #9 summary is semi-specific ('why daily chats help you practise') but the focu… | conditional | 3/4 | B1 vs B1 · exact |  |  | 0 | 9 | 1.5 | done |
| oksana-34 | J1 | conditional - C4 failed: #5-#9 tasks are carrier calls and shipping, not interview questions; she asked… | conditional | 3/4 | B1 vs B1 · exact |  |  | 0 | 10 | 2 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 2 · near 0 · miss 0
- **judge agreement:** 8/9 (89%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 24 calls, 0 failed, avg 5s · character 19 calls, 0 failed, avg 4s · judge 2 calls, 0 failed, avg 18s
- **driver coverage:** 17 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **major · rank 12** `LT-oksana-34-J1-1` (senior-quality) · recurs `LT-oksana-34-J1-4`, recurrence 3 — Check tasks are carrier calls, not interview questions
  - expected: At least one real interview question, such as 'Tell me about a problem you solved'
  - got: All five tasks are carrier or shipping scenarios, though she said her goal was the interview (#4)
  - evidence: #4 'answer questions on job interview... problem which I solved'; #5-#9 tasks are carrier/shipping only; the verdict next focus says 'practice will help your interview answers'. · task generator prompt
  - acceptance: When the learner names an interview goal, at least one check task is a real interview question.
- **major · rank 12** `LT-hana-41-J1-1` (senior-quality) — Next focus is a trivial phrase, not the real pattern
  - expected: A focus on a recurring B1 pattern (articles, progressive for habits) useful on Monday.
  - got: Practise "I have not so much time" by saying "I do not have much time".
  - evidence: #9 'Next to practise: Practise "I have not so much time"...' while the check also showed the missing article and 'we are helping each other'. · placement summary prompt
  - acceptance: Focus names a recurring pattern with a work example, not a single phrase.
- **minor · rank 6** `LT-hana-41-J1-3` (clarity) · recurs `LT-hana-41-J1-2`, recurrence 3 — Confidence is low but explained vaguely
  - expected: Clear reason for the uncertainty.
  - got: 'Your B2 answers were close, but none was strong' - confidence low without saying why on the screen.
  - evidence: #9 caveat line. · verdict caveat copy
  - acceptance: Caveat names which evidence is missing.
- **minor · rank 6** `LT-hana-41-J1-2` (trust) — Task 4 judged partial for a small slip
  - expected: Pass or strong partial for a clear B1 answer with reason.
  - got: partial; 'we are helping each other' flagged, 'Wider word choice would also help' is vague.
  - evidence: #8/#9 note: 'Wider word choice would also help.' · placement judge prompt
  - acceptance: Notes name a concrete word or fix.
- **polish · rank 2** `LT-oksana-34-J1-4` (senior-quality) · recurs `LT-oksana-34-J1-3`, recurrence 3 — Last tasks overlap, and the grading is lenient
  - expected: Varied tasks with consistent grading
  - got: Tasks 4 and 5 are both carrier-call scenarios. Task 5 is called 'nearly there' at C1 for a B2-level answer, and the verdict says 'Idioms would add range'.
  - evidence: #8, #9, #10 'Your English read as B2 here, and this task was C1'. · task generator prompt
  - acceptance: Vary the scenarios across the last tasks.

## What passed

- `LT-hana-41-J1-4` Workplace-relevant, adult tasks and exact band — Tasks about colleagues, meetings and a Brazil newcomer; B1 exact in 4 tasks.
- `LT-oksana-34-J1-2` Accurate placement and real slips quoted — B1 exact; slips quoted verbatim with fixes ('not in a hurry', 'price stays')
- `LT-oksana-34-J1-3` Own-language welcome with no Czech assumption — 'in English or in your own language' and a neutral question about how she learned English

## Voices

**Hana · J1** (time saved: 20 min · low)

> Pěkné, it felt like a short business English test, not a game, and I liked that the tasks were about colleagues and meetings. B1 feels right for me, "working, not good". I also liked seeing my slips with a corrected version. But the next step is weak: practising "I do not have much time" is tiny, and I said I want to write emails faster and speak in meetings, and the summary only says "fixing small grammar". It sounds a bit like a template. Still, it took about seven minutes, not weeks to book a course at 800 CZK. I would use it again for evening practice and tell a colleague, if the topics and corrections get more specific to my job.

**Oksana · J1** (time saved: 15 min · low)

> B1 is fair, and I believe it. The corrections were real ones. It quoted "for large order" and "if the price stay" from my own answers, and it didn't treat me as Czech or as a refugee. That is what I wanted. The check took about seven minutes and every task was clear. But I told it three times that I have an interview on Friday. It then gave me only carrier-call tasks, with no "tell me about a problem you solved". That is what the interviewer will ask me. The summary is nice but a bit general. I would come back to try the interview situation, and I would tell a colleague about it. For Friday I need real interview rehearsal, not just a level.
