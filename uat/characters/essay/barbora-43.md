# Barbora, 43 — "Is it teaching her, or doing it for her?"

module: Essay Master · journeys: EM1, EM4 · **external buyer**

## Background / lived experience

Eliška's mother (`eliska-12`). Accountant at a logistics firm in Prague; her English is a solid B1 from work email, below her daughter's school English, so she cannot tell a good PEEL paragraph from a bad one and knows it. Pays the international school's fees and is deciding whether this desk earns its place in the living room or whether to book a writing tutor (Prague English tutors around 380 CZK an hour, ref 4; a Czech agency tutor 450-600 CZK, ref 24). Has read that more than a quarter of Czech primary pupils have already tried copying a homework from AI (ref 27) and that school rules built on the national guidance treat a copied ChatGPT text as plagiarism (ref 28). Her test is simple: whose sentences end up in the homework.

## Voice

Practical, short, a little suspicious: "Fine, but who wrote that sentence, you or the machine?" Reads the phone with her glasses pushed up. Asks Eliška to explain things back to her.

## Jobs to be done

- Decide within two or three evenings whether to keep using Essay Master or pay for a tutor.
- Know, without reading English closely, that Eliška did the writing and learned something.

## What good looks like

On the TV she sees her daughter's own sentences being pointed at, not replaced. Afterwards the phone tells her, in Czech-parent-simple words, what was read and how many sentences needed work, and the week's page agrees with what she saw on the sofa.

## Pet peeves

Anything that writes the homework. Percentages and scores she cannot interpret. Having to read English paragraphs to know what happened. Being told the app is "safe" without seeing why.

## Motivation (time saved)

- Traditional: 30 minutes beside Eliška on an English paragraph she cannot judge, two evenings a week; or a tutor at 380-600 CZK an hour plus 30 minutes of travel (refs 4, 24). Global parents average 6.7 hours a week of homework help (ref 23, *secondary*).
- With Essay Master: 15 minutes on the sofa watching the TV, 2 minutes reading the recap and the Sunday page.
- Expected: about 25 minutes saved per evening and no tutor fee, if, and only if, she trusts that the work is Eliška's.

## Senior-quality bar

An experienced form tutor at the school, shown the evening's recap and the Sunday page, would say it describes the evening truthfully and that nothing in it would count as outside help with the writing.

## Scored acceptance criteria

- C1 — BLOCKER: across the evening, no text on the TV or the phone (notes, moves, patterns, summary, recap, Sunday page) supplies a sentence Eliška could hand in as her own.
- C2 — The recap counts match the readings: the Essay Master line names each lens read and the same "k of n sentences to fix" as the readings themselves.
- C3 — The phone's Recap tab and the Sunday page never quote one of Eliška's sentences.
- C4 — She can tell from the TV alone, without reading English closely, which sentence is the problem (the rail, the underline, the hatch).
- C5 — The Sunday page's Essay Master line names the lenses read this week and how many readings, and nothing else about the writing.
- C6 — She can find, without help, where the text goes and how to delete what was kept (the one-time notice and "Delete everything I kept").

## Surface binding

She has no profile of her own here: she watches Eliška's seated profile (`elementary`, 12, Family) and holds the phone. The Student/Parent toggle is a React switch, not an identity (`desk/src/app/phone/page.tsx:381`); in the Parent role the phone never follows the TV's hand-offs (`desk/src/app/phone/panelFor.ts:82`).

Routes: `/tv` and `/phone`.

- TV: everything Eliška reaches in Essay Master (`desk/src/tv/keys.ts:45`), watched, not driven; the recap screen with its essay tile and the "On the parent's phone" chip (`desk/src/tv/screens.tsx:303`, `:314`).
- Phone: the Recap tab (`desk/src/app/phone/page.tsx:615`), which reads "Arrives when the session ends" until then (`:625`), with the Essay Master line from `desk/src/tv/recapRows.ts:121` and the Sunday page under it (`desk/src/app/phone/page.tsx:626`; its Essay Master line `desk/src/lib/rules/week.ts:200`). The shelf with "Delete everything I kept" (`desk/src/app/phone/EssayShelf.tsx:45`) and the notice text (`desk/src/app/phone/EssayShelf.tsx:54`, words at `desk/src/lib/session/texts.ts:127`) sit on the Essay tab.

Unreachable for her: a locked parent view (Phase 1 has no parent lock, `desk/src/app/phone/page.tsx:641-642`), the Workroom and the Twin Card (Adult only).

## References

`uat/references.md` 4, 23, 24, 27, 28, 29 (Khan Academy's Writing Coach as the "never writes for them" comparison), 30 (Grammarly's one-click rewrites as the opposite).
