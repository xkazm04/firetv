# Radka, 41 — "I was always bad at maths, and now it's my job to help"

module: Math Buddy · journeys: MB1, MB4, MB5 · external buyer

## Background / lived experience

Team lead in an English-speaking shared-services centre in Brno, with B2 English she uses all day. Mother of Nela (`nela-12`, 6. ročník) and Šimon (14, 9. ročník). She got a 4 in maths at her own maturita, and still feels her stomach drop at a fraction. She knows that helping often when you are anxious about maths can rub off on a child (ref 38), so she tries to sound calm and is not. Šimon sits the CERMAT entrance exam (přijímačky) in April: 70 minutes, 50 points of maths (ref 32). Around a hundred thousand ninth-graders apply each year (ref 33). His school ran a mock in September and he brought home a marked test with "22/50" on it. A přijímačky prep course or a weekly tutor costs 300–600 CZK an hour (ref 39). She is deciding whether the desk replaces that, keeps Nela's evenings calmer, or is one more gadget. She is the one who decides whether the family keeps it.

## Voice

Organised, a little defensive about the maths: "Don't ask me, ask the TV — I'll only confuse you." With the product: "OK, but how do I know it's right? Who checked this?" Switches to Czech with the kids, English with the screen.

## Jobs to be done

- Help Nela with homework without having to be the maths expert, and without the evening ending in tears.
- Find out what Šimon actually lost his mock marks on, and get him practising *that* before April.
- Decide, within two or three evenings, whether this is worth keeping instead of paying for a tutor or a prep course.

## What good looks like

She can sit beside the child and follow what is happening on the TV. She can see that the desk is never just handing over answers. At the end of the evening she gets a recap in plain words that tells her what was done and what is still weak. And she trusts the ticks.

## Pet peeves

Apps that do the homework for the child (she has seen Šimon's classmates photograph the answers, ref 42). Anything that makes her feel stupid. Progress shown as charts with no sentence. Being asked to configure things on a TV with a remote.

## Motivation (time saved)

- Traditional:
  - Nela's homework: about 40 min of her own time each evening it is set. She looks up the method first, then sits through it.
  - Šimon: a tutor at about 500 CZK for 60 min a week plus 20 min driving (ref 39), or a prep course.
  - Going through Šimon's mock paper: she cannot do that herself at all. A tutor would spend most of one 60-min lesson on it.
- With Math Buddy:
  - Nela: about 20 min of her time, beside her, not teaching.
  - The mock: about 15 min to type its marks question by question on the phone, then the recovery list on the TV.
- Expected: ~20 min an evening for Nela (~60 min a week), plus one tutor hour a week for Šimon if the recovery list and practice sets are good enough. If the desk's ticks cannot be trusted, the value is negative and she says so. These minutes are this file's estimate, not a measurement.

## Senior-quality bar

An experienced 2. stupeň maths teacher who prepares pupils for přijímačky would agree with three things. The recovery list names the real weak topics of that mock. The practice it leads to is the right kind. And the evening recap tells a parent the truth.

## Scored acceptance criteria

- **C1** BLOCKER: Across everything she watches in one evening, the desk never shows the final answer to a problem before the child has answered it.
- **C2** BLOCKER: The recovery list never calls a topic secure, or leaves it out, in a way that contradicts the marks she typed. It lists topics in the order of marks lost and states the paper's total correctly.
- **C3** She can type a 16-question entrance-exam mock into the phone's Paper panel in 15 minutes or less. Each question's "what does it test" can be answered from the list offered, or the panel says plainly that a question has no matching statement.
- **C4** Every statement she must pick from is understandable to a non-specialist parent in English. A statement she cannot map to a CERMAT-style task counts against this.
- **C5** The phone's Recap tab, after the session ends, says in sentences what each child did that evening. It covers sets, right counts, hints, and what needed a second hint. A parent can read it in under a minute.
- **C6** Nothing on the TV or phone names an exam board, a grade or a pass prediction that the desk cannot back. The desk does not claim "GCSE", and it does not claim "přijímačky".
- **C7** She can tell, on the screen, whether a tick came from the desk's own check or from a guess. A "not sure" state must exist and be visible.

## Surface binding

No profile of her own. She sits beside a seated child: Nela (`elementary` 12, `cz`) or Šimon (`elementary` 14, `cz`, School maths). Everything she touches is through that child's session.

- Route `/phone`:
  - The Parent role (`desk/src/app/phone/page.tsx:381`). The phone never moves the Parent role on a hand-off (`desk/src/app/phone/panelFor.ts:67`).
  - The Recap tab and This week (`desk/src/app/phone/page.tsx:615`, `desk/src/app/phone/page.tsx:626`).
  - The Paper tab in the panel bar (`desk/src/app/phone/page.tsx:632`), drawn by `PaperPanel` (`desk/src/app/phone/page.tsx:415`). It has one row per question and statement picks from the GCSE list (`desk/src/app/phone/PaperPanel.tsx:33`). Send moves the TV to `paper` (`desk/src/app/phone/PaperPanel.tsx:47`, `desk/src/lib/session/store.ts:598`), and Show the last paper does the same (`desk/src/app/phone/PaperPanel.tsx:50`).
  - End session on the Tonight tab (`desk/src/app/phone/page.tsx:611`).
- Route `/tv`:
  - Everything the child reaches (see `nela-12`).
  - `paper` drawn by MathsTV through `paperOwns` (`desk/src/tv/keys.ts:72`, `desk/src/app/tv/page.tsx:158`, `desk/src/maths/MathsTV.tsx:694`). Back from it goes to Get ready for school (`desk/src/tv/keys.ts:487`).
  - The recap after Menu on the landing ends the evening (`desk/src/tv/keys.ts:273`), drawn by the shell (`desk/src/app/tv/page.tsx:201`).
- **Unreachable:**
  - A photo of the marked mock. The reader exists (`desk/src/lib/desk/paperRead.ts:52`), but nothing in `desk/src` calls `readPaper`, so the marks are typed.
  - Any parent lock or separate parent view. There is no lock, by design (`desk/src/app/phone/page.tsx:642`).
  - A přijímačky or CERMAT statement list. The Paper panel offers only the GCSE Foundation statements (`desk/src/lib/library/gcse.ts:2`).

## References

`uat/references.md`:
- 32, 33: CERMAT exam format and numbers.
- 37, 38: homework help and parents' maths anxiety.
- 39: tutor prices.
- 41, 42: answer-giving apps.
- 44, 45: the GCSE map the Paper panel uses.

Her own maturita grade and job are Character fiction.
