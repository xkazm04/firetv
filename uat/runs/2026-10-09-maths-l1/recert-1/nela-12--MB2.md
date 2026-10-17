# nela-12 × MB2 · Practise a topic and get it marked (recert-1)

- Character: nela-12 (Nela, 12, 6. ročník; profile `elementary`, age 12, system `cz`, School maths, Family)
- Journey: MB2 · Practise a topic and get it marked
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** The three majors (the unsure card's wording, English-only explaining, the blind explain prompt) are fixed. Two minors still need an owner or teacher ruling: the tier-2 denominator range, and unsimplified sums ticked while the lesson says "then simplify".

## Reachable surface (now)

- A set is printed by code in her system: decimal comma and Kč for cz (`desk/src/lib/rules/school.ts:1417-1436`, `desk/src/lib/desk/items.ts:522,567`, `desk/src/lib/desk/worked.ts:28-32`).
- Marking: `judgeSet` and `unsureLine` (`desk/src/lib/rules/kinds.ts:153-185`). An unsure item gets the checker's own reason; a blank item says it has no answer yet.
- Explaining: hold-to-speak in cs-CZ with a "Type it" button beside it (`desk/src/app/phone/recogniserLang.ts:7-8`, `desk/src/app/phone/page.tsx:373`, `desk/src/app/phone/ExplainTalk.tsx:36-37`). The prompt sees her answer, working and slip (`desk/src/lib/desk/explain.ts:64-71,241-252`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB2-1 unsure card says "I got something different" | fixed | `kinds.ts:153-159`. Repro: '4/22' for 6/33 gives "The desk is not sure about number 5. The value is right; the question asks for it in its simplest form."; a blank gives "Number 6 has no answer yet." | 83bbe368 marking: an unsure item says why, a blank says no answer yet |
| L1-nela-12-MB2-2 explaining is en-US speech only | fixed | `recogniserLang.ts:7-8` gives cs-CZ; `ExplainTalk.tsx:36-37` Type it button | 632287e6 explain: a Type it button beside the hold button... |
| L1-nela-12-MB2-3 MB-EXPLAIN 3/8 | fixed | `explain.ts:241-252` seenOf, `explain.ts:64-71` seenParts | 1dfcfdae explain: the prompt carries the written answer, the working and the slip with its line (X4) |
| L1-nela-12-MB2-4 questions print decimal points and £/€ for cz | fixed | `school.ts:1417-1436`. Scratch `rules.cjs`: 900 cz dec-arith items have 0 decimal points, 0 £, 0 € and 300 Kč; worked 'Work out 78,2 - 3,19.' -> '75,01' | eb00c8ee feat(maths): print code-written questions in the learner's decimals and money |
| L1-nela-12-MB2-5 slip lines 26-32 words | fixed | `school.ts:1610`: 57 lines, max 25 words; pinned at `tools/school-rules-test.cjs:487` | bf466188 school: every slip line the desk says is 25 words or fewer (MB-B6 part 1) |
| L1-nela-12-MB2-6 tier-2 common bottoms up to 132 | recurs | `school.ts:2798` gen(seed, 2). Over 2,000 specs the common bottom has median 36, p90 88 and max 132; printed bottoms stay at 12 or less; no sign-off | null |
| L1-nela-12-MB2-7 unsimplified sums ticked, lesson says "then simplify" | recurs | `desk/src/lib/library/worked.ts:15` still says "then simplify"; `school.ts:1588` adds the simplest-form tail only when the spec asks; 300/300 doubled answers are marked right | null |

## New findings

None. No 2026-10-14 new rows for this pair. No false tick was found in what I ran.

## Notes

- The 2026-10-14 walk had MB2-4 open. It is fixed now (eb00c8ee, 2026-10-14).
- The MB2-6 median comes from my measure (the LCM of every bottom in the spec), so it is not directly comparable with the original median of 12. The max of 132 and the missing sign-off are the substance.
