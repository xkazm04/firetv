# Nela, 12 — "Mum, I don't get the fractions again"

module: Math Buddy · journeys: MB1, MB2, MB5

## Background / lived experience

Sixth grade (6. ročník) at a state základní škola in Brno. Maths gets roughly four lessons a week, as it has every year since grade 1 (ref 31). This term it is fractions and decimals. Her teacher sets a worksheet two or three evenings a week and checks it in class the next morning, so a wrong answer costs her a red mark in front of everyone. She mixes up "multiply the bottoms" and "find a common bottom", and loses the decimal comma when she multiplies. English since grade 3, about A2. She reads short English sentences but not paragraphs, and she reads Czech decimals with a comma (0,5). Her mum Radka (`radka-41`) sits beside her on the sofa most evenings and is quietly afraid of the maths herself. Her brother Šimon (14) has přijímačky in the spring.

## Voice

Quick and impatient, Czech first: "To je blbost, já to mám dobře." In English, single words: "fraction… bottom number?" When she is stuck she goes silent and draws on the margin.

## Jobs to be done

- Get tonight's sheet right before class tomorrow, and understand it well enough that the next sheet is not the same fight.
- Be told *where* she went wrong without being given the answer in front of Mum, so it still counts as hers.

## What good looks like

The sheet on the big screen, one problem at a time. A nudge that points at the exact line she got wrong, in words she can read. A tick she believes. Done in the time one episode of her series takes.

## Pet peeves

Long English text. Being told "great job!" when she knows it was wrong. A tick on something the teacher will mark red tomorrow. Waiting while the TV "thinks".

## Motivation (time saved)

- Traditional: about 35–45 min a sheet with Mum. Mum re-learns the method from the textbook or YouTube, they argue about whether 3/4 + 1/6 is 4/10, and nobody checks the answers until the teacher does next morning. Nearly half of Czech children do homework mostly with a parent's help, and parents say they often don't know how (ref 37). A tutor would be about 300–500 CZK an hour (ref 39), which the family pays only for Šimon.
- With Math Buddy: about 20–25 min. Snap the sheet (1 min), work through it with hints on the TV, and use one practice set of six when a topic is shaky.
- Expected: ~15–20 min saved per sheet, two to three sheets a week (~45 min a week), and fewer wrong answers reaching the teacher. These minutes are this file's estimate, not a measurement.

## Senior-quality bar

An experienced Czech lower-secondary maths teacher (učitelka matematiky na 2. stupni) would sign off three things. Every tick and ring on her marked set is right. Every hint points at a real next step for *this* problem without giving the result. The practice questions are what a 6. ročník fractions unit actually sets.

## Scored acceptance criteria

- **C1** BLOCKER: No hint, reply, worked example, or second-go message gives the final answer to a problem she has not yet answered herself. This covers a snapped homework item or a practice item before marking.
- **C2** BLOCKER: No item she got wrong is ticked right on the marked sheet (a "wrong correct" mark).
- **C3** Her Czech decimal comma (0,5) is read as a decimal on a typed or snapped answer, never marked wrong for the comma (cz system).
- **C4** Each line the TV asks her to act on (caption, hint, "what to try next") is short enough to read at A2 English, about 25 words or fewer, or for Mum to translate at a glance.
- **C5** The first hint on an item names one concrete thing on that problem (a number, an operation, a line). A generic "read the question carefully" fails.
- **C6** When the desk cannot decide an item, it says "not sure" and asks how she got there. It never guesses a verdict.
- **C7** From Tonight to her first hint on a snapped sheet takes no more than 4 presses on the remote and one photo.
- **C8** A practice set on a fractions topic uses fractions a 6. ročník would meet: denominators up to about 12, no negative numbers unless the unit has them.

## Surface binding

Profile type `elementary`, age 12, school system `cz`, Maths on, Maths course School maths (the default), Family mode. The Mode row is not shown under 18.

- Route `/tv` through the landing. Select on the Math Buddy object opens the app (`desk/src/tv/keys.ts:286`). Math Buddy is drawn by MathsTV when `mathsOwns` or `paperOwns` holds (`desk/src/app/tv/page.tsx:158`).
- Reachable MATHS_SCREENS (`desk/src/tv/keys.ts:54`):
  - `tonight` with three doors, because she is on a school path (`desk/src/tv/keys.ts:106`, `desk/src/maths/MathsTV.tsx:421`).
  - `topics` (`desk/src/tv/keys.ts:303`).
  - `worked` for a unit with a worked lesson (`desk/src/tv/keys.ts:453`).
  - `practice`, then `sheet` and `walk` (`desk/src/tv/keys.ts:498`).
  - `prepare` (`desk/src/tv/keys.ts:305`).
  - `units` and `calendar` from Tonight's Menu (`desk/src/tv/keys.ts:299`).
- Shared screens while maths is on them (`desk/src/tv/keys.ts:63`, `desk/src/tv/keys.ts:64`): `page` from the homework door (`desk/src/tv/keys.ts:306`), then `hint` (`desk/src/tv/keys.ts:357`) and `lesson`.
- The recap is drawn by the shell, not Math Buddy (`desk/src/app/tv/page.tsx:201`).
- Route `/phone`:
  - `capture`, handed off when Tonight waits for a page (`desk/src/app/phone/panelFor.ts:31`).
  - `practice` for a set and for the sheet or walk (`desk/src/app/phone/panelFor.ts:33`, `desk/src/app/phone/panelFor.ts:35`). It offers the snap or typed route (`desk/src/app/phone/page.tsx:474`), a typed second go (`desk/src/app/phone/page.tsx:527`), and hold-to-explain (`desk/src/app/phone/page.tsx:545`).
  - "Point & ask" (`desk/src/app/phone/page.tsx:558`).
- The young maths voice applies at 13 or under (`desk/src/lib/rules/voice.ts:34`).
- Her answers are read with the cz decimal comma (`desk/src/app/api/mark/route.ts:62`).
- **Unreachable:**
  - Calculus 1 and 2 are offered on her profile row to any type (`desk/src/tv/profileRows.ts:77`), but she would never pick them. A finding about them is not hers.
  - The Paper panel is reachable but is not her job.

## References

`uat/references.md`:
- 31: RVP ZV maths hours.
- 37: Czech homework and parents' help.
- 38: parents' maths anxiety and homework help.
- 39: tutor prices.
- 40: the minutes a teacher spends marking a book.
- 41, 42: answer-giving tools and what they cost learning.
- 1: English from grade 3.

The 6. ročník fractions content is from training data and unverified against her school's ŠVP.
