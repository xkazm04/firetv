# LT run 2026-10-16-lt-placement-oos/recert-1 — Linga

Engine: claude-cli/haiku for tutor, claude-cli/sonnet for character, claude-cli/sonnet for judge · 3 Characters · 2 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

The verdict is decided in code (uat/driver/verdict.cjs) from the checks each judge answered: the journey's definition of done (D1…), the Character's criteria (a BLOCKER one fails), the journey's metric gates, breaches and how the journey ended. The judge's own verdict stands beside it.

judge verdicts no recorded check explains: 2 of 3

| Character | Journey | Verdict | Judge | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|---|
| hana-41 | J1 | fail - D5 failed: #10 summary is specific, but the focus 'what the real number is' is a single n… | conditional | 4/4 | B1 vs B1 · exact |  |  | 0 | 10 | 1.9 | done |
| oksana-34 | J1 | fail - D5 failed: #9 summary 'practise speaking more smoothly for phone calls and your job inter…; C3 failed: She named the interview in #2 and #4, but the tasks (#5-#8) were carrier phone…; C4 failed: #6-#8 are carrier delay and dropped-call tasks; none is a logistics interview … | conditional | 3/5 | B1 vs B1 · exact |  |  | 0 | 9 | 1.7 | done |
| sofie-11 | J1 | pass | pass | 3/3 | A2 vs A2 · exact |  |  | 0 | 10 | 1.7 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 3 · near 0 · miss 0
- **judge agreement:** 12/14 (86%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **moment recall:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 41 calls, 0 failed, avg 5s · character 29 calls, 0 failed, avg 4s · judge 3 calls, 0 failed, avg 21s
- **driver coverage:** 26 screens read from the rendered TV and phone · unmapped controls 0 · view actions with no control 0 · phone-only actions 0 · not-offered picks 0

## Findings by impact

- **blocker · rank 18** `LT-oksana-34-J1-1` (senior-quality) · recurs `LT-oksana-34-J1-4`, recurrence 2 — Check never asks a real interview question
  - expected: At least one task such as 'Tell me about a problem you solved', since she said she needs it on Friday
  - got: All tasks are carrier phone or app scenarios
  - evidence: #4 she says 'I must explain my experience and one problem which I solved'; #5-#8 tasks are about network down, delay and dropped calls. · task generator prompt
  - acceptance: When the learner states an interview goal, at least one check task is an interview question.
- **blocker · rank 18** `LT-sofie-11-J1-3` (clarity) — TV headline shows her error as 'Your words'
  - expected: A praise-first headline for a child on the family TV
  - got: 'Your words: “take long time”' under the band
  - evidence: #10 TV 'Your words\nYour words: “take long time”.' · verdict screen
  - acceptance: The TV headline quotes something she did well; the error stays in the slips list.
- **major · rank 12** `LT-hana-41-J1-1` (senior-quality) · recurs `LT-hana-41-J1-1`, recurrence 2 — B2 task graded fail where partial fits
  - expected: Task 4 with a clear comparison and reason and only article/word-order slips should be partial, like task 3.
  - got: Task 4 'not yet' and 'Your English read as A2 here', while the note says 'You answered the question and gave a reason.'
  - evidence: #10: 'Your English read as A2 here, and this task was B2.' Task 3 with similar slips got 'nearly there'. · placement judge prompt
  - acceptance: Similar slips in same-band answers get the same verdict; an answer with reason and connected sentences is not read as A2.
- **major · rank 12** `LT-oksana-34-J1-2` (clarity) · recurs `LT-oksana-34-J1-3`, recurrence 2 — Tasks 3 and 4 are near duplicates
  - expected: Varied B2 probes
  - got: Both ask app versus phone with a person, and she gave nearly the same answer
  - evidence: #7 and #8 prompts; answers share 'get the answer immediately... nobody is responsible about'. · task generator prompt
  - acceptance: Consecutive tasks must differ in topic or function.
- **minor · rank 6** `LT-hana-41-J1-2` (clarity) · recurs `LT-hana-41-J1-2`, recurrence 2 — Confidence caveat is vague
  - expected: A clear reason for the uncertainty.
  - got: 'Only a few strong answers showed this level, so it may be a little off.'
  - evidence: #10 phone verdict. · placement summary prompt
  - acceptance: The caveat names which evidence was thin, e.g. the B2 tasks were mixed.
- **minor · rank 6** `LT-hana-41-J1-3` (senior-quality) — Next focus is narrow and one-sided
  - expected: A focus covering the main recurring slips (articles) with a practical workplace use.
  - got: Focus is only word order in the indirect question; articles, the commonest slip, appear only under 'usual slips'.
  - evidence: #10: 'Practise word order in questions: "what is the real number" should be "what the real number is".' · placement focus prompt
  - acceptance: Next focus targets the most frequent error pattern across tasks.
- **minor · rank 6** `LT-oksana-34-J1-3` (senior-quality) — Summary and focus are thin
  - expected: Next focus on interview vocabulary and the recurring slips
  - got: The focus is one phrase pair, and the summary is generic
  - evidence: #9 'Practise "responsible about"...'; summary mentions the interview only in passing. · verdict summary prompt
  - acceptance: Summary names her stated goal and one concrete interview-relevant drill.
- **minor · rank 6** `LT-sofie-11-J1-4` (clarity) — Verdict text is long and abstract for an 11-year-old
  - expected: Short sentences and clear praise
  - got: 'Linga's read from your answers, not a certificate. B1 was close, but a harder task fell short and what you said pointed lower...'
  - evidence: #10 phone verdict · verdict summary prompt
  - acceptance: Child-profile verdict lines of at most 12 words each, with one sentence of praise.
- **polish · rank 2** `LT-sofie-11-J1-5` (senior-quality) — B2 task 5 marked fail though the answer is partial
  - expected: Partial for a clear choice with two reasons and only verb-form slips
  - got: Verdict fail, 'B2 · Say it · not yet'
  - evidence: #9/#10 'i choose play game someone else made. because building game is hard and take long time.' · task judge prompt
  - acceptance: Task 5's verdict agrees with a teacher's partial, or the note says why it fails.

## What passed

- `LT-hana-41-J1-4` Workplace-relevant tasks and specific corrections — Tasks about slides, stand-ups, tables vs charts; corrections quote her own words ('she want' → 'she wants').
- `LT-oksana-34-J1-4` Exact B1 placement with specific, correct slips — B1, with a correct 'responsible for' fix and article slips
- `LT-oksana-34-J1-5` Neutral, own-language framing — 'English or your own language'; the greeting uses her name
- `LT-sofie-11-J1-2` Tasks and corrections use her own world — Roblox tasks and 'try “in Roblox there is only chat”' corrections
- `LT-sofie-11-J1-1` A2 placement is exact and the reasoning is honest — A2, with 'B1 was close, but a harder task fell short and what you said pointed lower'

## Voices

**Hana · J1** (time saved: 20 min · low)

> Overall I would use it again. The questions were about my real work, such as slides, meetings and presenting numbers, so I did not feel like a student. B1 "getting by" is honest and I accept it. I liked that the corrections quoted my own sentences, like "she wants" and "In a table". That is something I can use on Monday in emails.
> I did not understand why my table answer was marked "not yet" and read as A2. It said I answered and gave a reason, and then it said A2. That felt unfair, and the line "it may be a little off" does not tell me anything. The next focus, about word order, is only a small part of my mistakes, because articles are much more common. Still, it was fast and about seven minutes, and much cheaper than a course. I would tell a colleague, with that small reservation.

**Oksana · J1** (time saved: 10 min · low)

> The level, B1, is right, and I was glad that it did not talk to me as a Czech learner. It caught my "responsible about" slip, which is real. But I told it twice that my Friday interview is the point, and the tasks were still about a carrier's dropped calls. Nobody asked me "tell me about a problem you solved". The last two questions were almost the same. The summary says "your job interview" in a template way. For seven minutes it is fine, and I trust the level. But I would want interview questions before I come back tomorrow. I would tell a friend it finds your level, not that it prepares you for an interview yet.

**Sofie · J1** (time saved: 10 min · low)

> I pressed the big button and it asked me about Roblox and YouTube, so that was fun. The cat answer made me laugh. The choosing tasks were easy, and the listening one was okay. The last two were harder, but I could still write something. It said A2, and I think that is right. I liked that it told me how to say things, like "in Roblox there is only chat". But the TV showing "take long time" as my words felt a bit like it was catching me out. The long text about B1 being close was too much to read. I would use it again after school. I want it to give me points or a game and to tell me more about what I did well. I would tell my cousin.
