# Kristýna, 17 — "Can it check my Czech slohovka?"

module: Essay Master · journeys: EM1, EM3 · **out-of-segment user**

## Background / lived experience

Final-but-one year at the same Prague gymnázium as Adéla (`adela-17`), and her friend; Adéla showed her the desk at her family's flat, where Kristýna now has her own profile. Her maturita worry is not English but Czech: the Czech written paper is a school-set essay of at least 250 words in at least 110 minutes (ref 17), and her teacher says her arguments wander. A Czech tutor costs her family 290-500 CZK an hour (ref 24). Essay Master was built for English writing only (the splitter and the roles are English rules, `docs/FAMILY-PHASE-1-PLAN.md:50`); nobody told her that, and the phone never says it.

## Voice

Articulate, ironic, writes in long Czech sentences with lots of commas and "nicméně", "avšak", "tudíž". Will say "takže to umí jenom anglicky?" out loud the moment the TV answers in English.

## Jobs to be done

- Find out whether her Czech argumentative essay holds together before the mock maturita.
- If the desk cannot do Czech, find that out in the first minute, not after twenty.

## What good looks like

Either a reading of her Czech paragraph that a Czech teacher would accept, or a plain early statement that the desk reads English writing, so she can stop.

## Pet peeves

A tool that answers confidently about something it cannot read. Being made to guess why it went wrong. English feedback on a Czech text.

## Motivation (time saved)

- Traditional: write a practice essay in 110 minutes (ref 17) and wait for her Czech teacher to mark it, or a tutor hour at 290-500 CZK (ref 24).
- With Essay Master: 5 minutes to try one paragraph.
- Expected: near zero by design, and negative if the desk gives her a confident reading of a text it cannot read. The honest number is how many minutes pass before she knows it does not serve her.

## Senior-quality bar

A Czech language teacher who marks the maturita written paper would say either that the reading is sound for a Czech text, or that the tool was right to decline.

## Scored acceptance criteria

- C1 — BLOCKER: the desk never presents a verdict on a Czech sentence as if it had read it under English rules without saying so (for example, a sentence-count or a "1 of 1 sentences to fix" for a paragraph of five Czech sentences, with no word about language).
- C2 — Within her first reading, something on the TV or the phone tells her that Essay Master reads English writing.
- C3 — A Czech paragraph whose sentences begin with Č, Š, Ř, Ž or Ú is split into the same sentences a Czech reader would count.
- C4 — Any feedback she is shown is in a language she can act on and about her text, not about English grammar.
- C5 — No text shown to her rewrites one of her Czech sentences (the withholding rule holds in any language).

## Surface binding

Profile type `high-school`, age 17, school system `cz`, Family mode (under 18, `desk/src/tv/profileRows.ts:74`); the prompt calls her "a 15-year-old" (`desk/src/lib/rules/voice.ts:70`).

Routes: `/tv` and `/phone`, the same screens and panels as Daniel (`desk/src/tv/keys.ts:45`; `desk/src/app/phone/panelFor.ts:42`; `desk/src/app/phone/page.tsx:588`).

The facts that make her out of segment, all in code she will hit: a sentence ends only before an ASCII capital or a quote (`desk/src/lib/rules/essay.ts:35`), so a Czech sentence opening with Č, Š, Ř or Ž joins the one before it; the connector, evidence and link words are English (`desk/src/lib/rules/essay.ts:13-15`); the lens prompts and the move playbook are English (`desk/src/lib/desk/essay.ts:29-34`, `desk/src/lib/rules/essay.ts:155-160`). No code path checks the text's language (the essay route, `desk/src/app/api/analyse/route.ts:78-87`).

Unreachable for her: the Workroom, and any Czech-language reading.

## References

`uat/references.md` 17 (Czech maturita written paper), 24 (Czech tutor prices), 28 (NPI/MŠMT on AI in schools). Czech connective words from training data, *unverified*.
