# Helena, 46 — "I write to clients in English every day"

module: Essay Master · journeys: EM1, EM5

## Background / lived experience

Account manager at a Brno software house, writing ten to twenty English emails a day to clients in Germany and the Netherlands; her English is a confident B2 learned at work. Her emails are correct and long; a client once replied "TL;DR?" and she has not forgotten it. Has used Grammarly's free tier and hated how its rewrites stopped sounding like her (ref 30); pays a proofreader at 100-180 CZK a page for the important ones (ref 25). The family desk is her teenage son's, and she set up her own profile when she saw "Adult" on the profile screen. She is the user Essay Master's Adult mode was designed for (the twin, `docs/concepts/STUDY-DESK-V2-PLAN.md:25-29`), but the four lenses were built for school paragraphs, not emails.

## Voice

Brisk and polite, in full sentences: "Fine. Show me what it would change, and then let me decide." Writes on the PC, reads on the TV with her coffee, never dictates.

## Jobs to be done

- Get shorter, clearer client emails without losing her voice.
- See whether a "twin" of how she writes is worth having, and what it keeps about her.

## What good looks like

Her own pieces, kept privately, read for what makes them long or unclear, with the TV showing titles and marks but never her clients' business. A twin that describes her writing in words she recognises.

## Pet peeves

Being addressed like a schoolgirl. A tool that keeps her client emails somewhere she cannot see. Advice built for essays ("add evidence") on a two-line email.

## Motivation (time saved)

- Traditional: about 5 minutes re-reading and trimming each important email, and a paid proofread at 100-180 CZK a page (ref 25) for a handful a month.
- With Essay Master: 3-5 minutes to keep a piece on the PC page and look at its reading on the TV; the twin is born after three pieces of one kind (`docs/DESIGN-ESSAY-MASTER.md:193`).
- Expected: little or nothing saved on the first three pieces; a payoff only if the Twin Card makes another tool draft emails she would send as her own (the product's own success line, `docs/concepts/STUDY-DESK-V2-PLAN.md:29`). Mark the number *uncertain* until that is tried.

## Senior-quality bar

A business-writing trainer would accept the Language lens's flags (vague and repeated words, sentences over 35 words) as fair for client email, and would say the twin's level words describe her style accurately.

## Scored acceptance criteria

- C1 — BLOCKER: the TV never shows a sentence of a kept piece on the Workroom; only titles, format, counts, change pips and level words.
- C2 — Opening Essay Master in Adult mode with nothing on the desk lands on the Workroom, and "The lenses" reaches the lens home.
- C3 — No note or summary addresses her as a child or a student of 15.
- C4 — The Language lens flags at least one vague or repeated word she agrees is padding, and every flagged word is really in the sentence.
- C5 — After three kept emails the email channel shows "Born" and the level words; before that it shows how many more to keep.
- C6 — She can delete one kept piece, or everything she kept, and the Workroom then shows it gone.

## Surface binding

Profile type `other`, no age (the type has no age row, `desk/src/tv/profileRows.ts:13`), Mode `Adult (18+)` chosen on the profile's Mode row, which `other` is offered (`desk/src/tv/profileRows.ts:74`, `desk/src/lib/rules/mode.ts:44`). With no age, the essay prompt calls her "a 15-year-old" (`desk/src/lib/rules/voice.ts:37`, `:70`; the age comes from the profile, `desk/src/lib/rules/voice.ts:84`): a surface fact her C3 checks.

Routes: `/tv`, `/phone` and `/drop` (the PC page, `desk/src/app/drop/page.tsx:1-7`).

- Landing: Select on Essay Master opens the Workroom in Adult mode when no paragraph of hers is on the desk (`desk/src/tv/keys.ts:259`); with one on the desk it opens the forensic page first (`desk/src/tv/keys.ts:257`).
- TV screens: `workroom` (`desk/src/essay/Workroom.tsx:20`; empty state pointing to /drop at `:38`, twin panel at `:40-48`), then by "The lenses" or Menu the lens home (`desk/src/tv/keys.ts:419`) and every Family screen after it (`desk/src/tv/keys.ts:45`). No specimen cabinet: collections are Family only (`desk/src/lib/rules/collect.ts:53`).
- Phone: the Essay tab with the shelf (`desk/src/app/phone/page.tsx:588`, `:605`).
- PC page: keep a message, email or essay by paste or .txt/.md/.docx (`desk/src/app/drop/page.tsx:14`), and the Twin Card download, Adult only (`desk/src/app/drop/page.tsx:100`; `desk/src/app/api/twin/card/route.ts:23`).

Unreachable for her: the specimen cabinet (Family only).

## References

`uat/references.md` 25 (proofreading prices), 30 (Grammarly rewrites and Authorship). Business-email length norms from training data, *unverified*.
