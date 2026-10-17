# vojtech-18 × MB2 · Practise a topic and get it marked (recert-1)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB2 · Practise a topic and get it marked
- Cert level: L1 re-walk, code only, no model
- Head: d4f5042a
- Recertifies: 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional**. Typed marking reads his notation, money is in Kč, the path end is stated, and the Czech leak words are read; the photo-marking prompt still carries no system or notation and a Czech percent word still passes the leak check.

## Reachable surface (now)

- Topics and Prepare open on the last topic for him (`desk/src/tv/keys.ts:206-218`); the door line says 'This path ends at 9. ročník; your year is past it.' (`desk/src/tv/prepareRows.ts:108-112`, `desk/src/maths/MathsTV.tsx:435`).
- Sets: `makeSchoolItems` (`desk/src/lib/desk/items.ts:495`); a step up has a top rung on Pythagoras, probability and percent change, with 'still school level' in its line.
- Typed marking: `rules/school check` (`desk/src/lib/rules/school.ts:2163`), `readNumber` (`:323`), units incl. Kč (`:148`).
- Photo marking: `schoolPrompt` (`desk/src/lib/desk/mark.ts:146-158`), `markSet` (`:182-192`).
- Explain: Type it beside hold-to-speak (`desk/src/app/phone/ExplainTalk.tsx:38`), cs-CZ recogniser; reply leak check `leaksSchool` (`school.ts:2656`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB2-2 'c = 34 mm', 'P(A) = 3/13' unsure with 'something different' | fixed | Executed: both right, also 'c=34mm', 'P = 3/13'. 'odpověď: 34' unsure with a neutral why | 69f9bc52 (with 83bbe368) |
| MB2-3 step up sets primary-school items | fixed | Top rung (decimals and rounding, without replacement, repeated changes) and 'still school level' in the step-up line; path-end line. Content is still 8.-9. ročník, stated plainly | 1674fc48, 9a669411, eea3fa97 |
| MB2-4 Topics / Prepare open on Equivalent fractions | fixed | Executed: topicsFocus 16, prepareDoorFocus on the last topic (`keys.ts:206-218, 338`) | 29cdfd86 |
| MB2-5 no line says his year is past the path | fixed | `MathsTV.tsx:435`, `prepareRows.ts:108-112` | 29cdfd86 |
| MB2-6 explain is hold-to-speak en-US only | fixed | `ExplainTalk.tsx:38` Type it; `recogniserLang.ts:7-8` | 632287e6, 5a2135b9 |
| MB2-7 Pythagoras leak lets 'square root of 1156' through | fixed | Executed: root and 'teď odmocni' lines leak; 'c squared is 1156.' passes by ruling | 9def48b2 |
| MB2-8 photo marking prompt carries no system or notation | recurs | `mark.ts:146-158` unchanged in this respect; system reaches the judge only (`:186-192`) | null |
| MB2-9 topic blurbs over 25 words | fixed | Executed: 0 of 17 blurbs over 25; step-up lines 25 | 92889b66 |
| MB2-10 £ money for a cz learner | fixed | Executed: 'Increase 400 Kč by 34 %.'; '536 Kč', '536 korun' right | eb00c8ee |
| MB2-11 Czech number words not read by the leak rule | fixed | Executed: 'tři třináctiny', 'jedna pětina' leak | 42e666f7 |

## New findings

- MB2-12 (from 2026-10-14, still holds), minor 6: 'Je to dvacet procent.' and 'Je to dvacet procent z celku.' pass `leaksSchool` on a 1/5 probability item, while 'Je to 20 %.' and 'It is twenty percent.' are refused (`school.ts:2656`, scratch `p3.cjs`).

## Notes

- Probes: scratch `p2.cjs` (sets), `p3.cjs` (check and leaksSchool), `p4.cjs`/`p5.cjs` (focus, path end, word counts). No model was called.
- '536,- Kč' is unsure; not filed (a price notation, rare in a worked answer).
