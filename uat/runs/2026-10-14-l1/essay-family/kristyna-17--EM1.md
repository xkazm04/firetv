# kristyna-17 × EM1 · What does my paragraph do? (out-of-segment: a Czech text)

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/kristyna-17--EM1.md` (L1-fail, four blockers).
- **Verdict: L1-conditional.** All four prior blockers are fixed (language refusal, Czech sentence splitting, English word lists ruling a Czech text, the plan's false capital reason). One new major keeps C1 from a clean pass: the refusal is a word-list heuristic and lets some Czech through (L1-kristyna-17-EM1-11).

## Reachable surface set

Profile `high-school`, 17, `cz`, Family. Same screens and panels as Daniel. Essay tab, lens radio, box, Analyse, Dictate. The reading prompt still calls her "a 15-year-old" (`rules/voice.ts:68-72`).

## Walk

She pastes a Czech argumentative paragraph of about 25 words per sentence-pair ("Domnívám se, že moderní technologie mají na mládež spíše negativní vliv. Žáci tráví hodiny u telefonů... Nicméně... Tudíž...") and presses Analyse. `route.ts:127-130`: length check, then `paragraphIsEnglish` is false (English share 0.03, Czech share 0.69; scratch t1 CZ#0), so the route answers 400 with "Essay Master reads English writing. This paragraph is not in English, so the desk did not read it." and puts the same line on the TV status (`route.ts:21-24`; `EssayTV.tsx:147` shows it under "Not read"). That is her C2, in the first reading, in under a second, with no model call. **Executed (t6.cjs):** 9 of 10 author-written Czech paragraphs of 18 to 30 words are refused. The one that passes ("Je mi líto, že se do toho nemohu zapojit, ale jak to jen jde, pomáhám doma a ve škole.", English share 0.16) goes to the model and the English rules. A 3-word Czech title and a 15-word Czech sentence rich in "my", "a", "do" also pass (t1 CZ#1, CZ#5). L1-kristyna-17-EM1-11.

**Executed (t1):** the splitter now keeps Š, Č, Ř, Ž, Ú and „ as sentence starts (six Czech sentences → six); `planFill` accepts "Šest z deseti dětí chodí do školy pěšky." (`rules/essay.ts:35,640`).

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, no Czech verdict presented as read under English rules without a word | **pass for the refused cases; fail for the bypass** | EM1-11 (low frequency, high trust cost) |
| C2 something tells her within the first reading that Essay Master reads English | **pass, as a refusal** | nothing on the panel says it in advance (`page.tsx:683`); she learns on the first Analyse |
| C3 Czech sentences starting Č, Š, Ř, Ž, Ú split as a Czech reader counts | **pass** | `rules/essay.ts:35` |
| C4 feedback in a language she can act on | **pass for English text; n-a for Czech (refused)** | |
| C5 nothing rewrites her sentence | **uncertain (L2)** | as the others |

Still open, recurrence 2: ES-READ 3/8 (EM1-5); Dictate listens in cs-CZ and the panel says nothing about language (EM1-7; for her the listening language is right, the text is then refused); the prompt's "a 15-year-old" (EM1-8, voice.ts:69); `stats.links` / `stats.words` unwired (EM1-9).

## Metrics

| Metric | L1 |
|---|---|
| verdict agreement | n-a on Czech: refused. On the bypass: L2 |
| time to know it does not serve her | under 1 s of code plus her own typing: about 1 minute (target of her C2, "the first minute") |
| curtain | 0 |

## Grounding

ES-READ 3/8; her `cz` system and the text's language no longer matter to the call because a Czech paragraph does not reach it.

## Time saved

Her file: near zero by design. L1-live: about +15 minutes against finding out after twenty, confidence medium; it drops to about −5 on the 1 in 10 paragraphs that slips through and gets a confident English-rule reading.

## Findings

Fixed: EM1-1, -2, -3, -4, -6. Open, recurrence 2: EM1-5, -7, -8, -9. New: EM1-11. Strength: EM1-10.

## Voice

Takže to umí jenom anglicky. At least it said so in one line, in the first minute, and did not pretend to read my nicméně and avšak. I would have wasted an evening before. A sentence on the phone before I paste, "reads English writing", would have saved me even the typing.

One of my paragraphs was not refused, though. It read it and gave me English advice about connectors. That is the thing I hate: a confident answer about something it cannot read. If it can say no nine times, it should not say yes the tenth.
