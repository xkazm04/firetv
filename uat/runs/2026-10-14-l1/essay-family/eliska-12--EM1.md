# eliska-12 × EM1 · What does my paragraph do?

- Cert level: **L1** (theoretical; no browser, no server, no model). Base `main` HEAD `4af25199`. Prior walk: `uat/runs/2026-10-09-essay-l1/eliska-12--EM1.md` (L1-fail), re-derived here from current code.
- **Verdict: L1-conditional.** The prior blocker (a planted claim before the evidence is missed) is fixed for model-correct labels. No blocker remains on this pair; four majors stay open.

## Reachable surface set

Profile `elementary`, 12, `uk`, Family (under 18 has no Mode row, so Adult is unreachable; `desk/src/tv/profileRows.ts:74`). All reachable: landing Essay Master, `essaytype`, `essayplan` (only with nothing read), `forensic`, `playbook`, `xray`, the phone Essay tab (paste panel, rewrite panel, plan slot panel, shelf). Not reachable: `workroom`, the PC page, a photo of handwriting. The phone follows the TV into the Essay tab (`desk/src/app/phone/panelFor.ts:42,46`).

## Surface model, in one paragraph

Phone: lens radio (`page.tsx:684`), a box that starts with the sample "Many students are tired..." (`page.tsx:53,76`), Analyse on the TV (`:699`) posts `kind: essay`. Route (`api/analyse/route.ts:127-137`): length refusal, then **language refusal (new)**, then `analyseEssay` (`desk/essay.ts:132`): split in code, one `best` call with the young voice for 12, observations only, `decideVerdicts` rules, the note under a faulty verdict is the failed check's own line, the summary is `summaryLine`. TV moves to `forensic` on the first faulty sentence.

## Walk (C-by-C)

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, nothing copyable | **uncertain (L2)** | Narrower than last run: the summary (`rules/essay.ts:449-463`) and every faulty note (`:417-418`) are code. A strong or neutral note (`:417`) and a slot frame (`cleanFix`, `:223-243`: "A survey found that [number] of children who walk feel happier." is KEPT) are still unguarded. L1-eliska-12-EM1-3, -4 |
| C2 planted claim marked, page opens on it | **pass with model-correct labels, uncertain on the live model** | Executed P1 and P2 (scratch t2): with `supports` / `backs` named, S2 is the faulty sentence under both lenses. Without them Structure marks S1 and Evidence marks nothing. L1-eliska-12-EM1-1 (fixed), -12 (open) |
| C3 one plain sentence a 12-year-old can act on | **fail on wording** | Every faulty note is now a fixed adult line: "This only asserts; nothing here is checkable." (`rules/essay.ts:294-304`). L1-eliska-12-EM1-7 |
| C4 move + slotted pattern on every fault | **pass** | `taught()` returns the own fix or the playbook frame (`:596-601`); every playbook pattern has a slot (`lessons.data.ts:50-53`) |
| C6 lens and what it looked for, from the TV | **pass** | crumb lens name (`EssayTV.tsx:421`), the lens promise on the lens home (`:151`) |
| C7 under 30 s to first verdict | **uncertain (L2)** | one call; the young manner adds a paragraph to the prompt. W-run: 27.6 s on a 15-year-old |

The clean PEEL paragraph P6 (point, study, "This means they are fitter...", "So walking is better...") under Evidence with the Explain labelled `opinion` gives one false fault on the Explain sentence ("No checkable sentence here backs this opinion."), and under Structure with it labelled `claim` the same (scratch t2, P6 rows). That is the row the walk keeps hitting: L1-eliska-12-EM1-2.

## Metrics (rubric units)

| Metric | L1 |
|---|---|
| verdict agreement | L2. Code-only locator (not the metric), P1, P2, P6 = 12 verdicts with author-written model labels and links named: P1 and P2 read as a KS3 teacher would mark them (8 of 8); P6 differs on its Explain sentence when that is labelled opinion or claim (3 of 4 agree), so 11 of 12 in the worst labelling |
| ghostwriting | L2; code guards the pattern's literal words, the faulty note and the summary |
| note-verdict consistency | faulty: 0 by construction; strong/neutral: L2 reader count |
| fix coverage | pass by construction: a faulty verdict without its own fix gets the lens's playbook move |
| curtain | 0 on this journey |

## Grounding and wiring

ES-READ **3/8** (S1 text, S2 lens, S4 age band) — unchanged from 2026-10-09. Wiring: `stats.links`, `stats.words`, `sentences[].connectors`, `provider` are computed on every reading and drawn nowhere (L1-eliska-12-EM1-8; wiring ratio in `report.md`).

## Time saved

If it all worked: about 18 minutes a paragraph (her file). L1-live: about 12, confidence medium. The reading is same-evening; the C3 wording and the Explain false fault cost her trust in the first reading more than they cost minutes.

## Findings

Fixed: EM1-1 (planted claim), EM1-6 (praise-led notes on faulty sentences), EM1-9 (language refusal). Open, recurrence 2: EM1-2, -3, -4, -5, -7, -8. New: EM1-12 (link-field dependence). Strengths: EM1-10, -11, -13.

## Voice (first person, L1 over the designed experience)

Okay. I typed my walking-to-school paragraph, pressed Analyse, and it went to the TV and picked the sentence about being happier. That is the one Miss would circle, it has no proof. I like that it does not fix it for me; it gives me "Add a number" or something like it and a gap I fill. Mum can see it is mine.

What I do not like: it told me "This only asserts; nothing here is checkable." I had to ask Mum what asserts means and she did not know either. And on my other paragraph, the good one, it put a mark on the sentence where I explain why walking makes you fitter. That sentence is the whole point of PEEL! If it does that to a correct paragraph I will stop believing it on the wrong ones too.

Would I use it? Yes, same evening is so much better than waiting a week. Would I tell a friend? Only if it stops marking my Explain.
