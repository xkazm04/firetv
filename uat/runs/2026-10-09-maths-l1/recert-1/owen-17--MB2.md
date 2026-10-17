# owen-17 × MB2 · Practise and get marked (recert-1)

- Character: owen-17 (17, FE college, Foundation resit; UK, Family mode)
- Journey: MB2 Practise and get marked
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** On the typed path no wrong answer is ticked and the mixed-number false ticks and false rings are gone. One major stays open: the photo path on linear items depends on the model's read, and only L2 can measure that.

## Reachable surface (now)

- Paper row -> Get ready for school on that unit, question open on 'See how first' when the unit has a lesson (`desk/src/tv/keys.ts:534-546`, `:528`), then The usual / A step up (`keys.ts:523`).
- A step up on the fractions units draws two tier-3 items with mixed numbers, one of them a word problem (`desk/src/lib/rules/school.ts:3039-3041`, `desk/src/lib/rules/stretch.ts:59`, `desk/src/lib/desk/items.ts:443-450`).
- Typed marking: `desk/src/lib/rules/kinds.ts:103-133` (linear via `desk/src/lib/desk/verify.ts:159-177`), second go and entered go `desk/src/lib/desk/mark.ts:259-270`.
- Photo marking: the school prompt copies answers verbatim (`mark.ts:151-152`); the linear prompt asks for a plain number (`mark.ts:167,170`).
- Topics from Tonight: the big Ruler (`desk/src/maths/MathsTV.tsx:625`, years at `:337`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB2-1 false tick on a typed mixed number (blocker) | fixed | `verify.ts:159-164,175-177`. Executed: 4x+2=5 with '1 3/4' -> wrong (typed and second go); '2 3' -> unsure | e4dc93f5 MB-B26: a mixed number on a linear item is a + b/c on every route |
| MB2-2 false ring on a right mixed number | fixed | Same path. '1 1/5' for 7-2x=3x+1 -> right; '-1 1/2' for 2x+7=4 -> right | e4dc93f5 |
| MB2-3 fraction sets lack mixed numbers and word problems | fixed | Top rung `school.ts:2967,3001,3039-3041`: 1000/1000 mixed, 500/1000 word problems. Residual: The usual still has 0 mixed in 4000 specs, and N2 does not steer the fraction units (`school.ts:3743`) | 129ce63e write a top rung of mixed numbers and word problems for the fractions units |
| MB2-4 slip lines over 25 words | fixed | `school.ts:1610`, pinned at `tools/school-rules-test.cjs:487`; 57 lines, 0 over 25 | bf466188 every slip line the desk says is 25 words or fewer |
| MB2-5 £ / 'cm squared' read as not sure | fixed | `school.ts:3613-3644` money is £ for uk (only £ drawn); `:156-157` cm squared / sq cm / square cm -> right. 'pounds' stays unsure by design (`:172`) | eb00c8ee print code-written questions in the learner's decimals and money |
| MB2-6 'I got something different' on unsure items | fixed | `kinds.ts:153-158`: blank -> 'has no answer yet', rounded -> 'This is a rounded value...' | 83bbe368 an unsure item says why, a blank says no answer yet |
| MB2-7 photo marking rests on the model's read; linear prompt asks for a plain number (major) | **recurs** | `mark.ts:167,170` unchanged; `kinds.ts:118-122`. L2 only | — |
| MB2-8 the paper road skips the worked lesson | fixed | `keys.ts:528,541`, `desk/src/tv/prepareRows.ts:56-59` | 5a45e935 Get ready for school offers a unit's worked lesson first, lit |
| MB2-9 explain never sees his answer or the slip | fixed | `desk/src/lib/desk/explain.ts:56,65-71,242-250,285` | 1dfcfdae explain: the prompt carries the written answer, the working and the slip |

## New findings

- **minor (rank 6), from 2026-10-14 L1-owen-17-MB2-11, still holds:** the three linear-equation units have no worked lesson (`desk/src/lib/library/worked.ts:10-36`), so an equations recovery row goes straight to a model-written set (`keys.ts:541`).
- **minor (rank 4), recert-1 walk:** the Topics ruler still prints 'Year 5' to 'Year 9' under a 17-year-old's units (`MathsTV.tsx:337`). The pastPathEnd check that clears it on Prepare (`MathsTV.tsx:689`) is not applied there.

## Notes

- Executed through `tools/ts-load.cjs` from scratch scripts (no model, scratch DESK_DATA_DIR): linear battery, top-rung draws, slip lengths, UK money units, area units, the rounded-answer line.
- C2 on the typed path: no false tick found. The photo path (MB2-7) is the open trust risk.
- A step up gives 2 of 6 items in his mock's form. The usual set is still all proper fractions.
