# Eliška, 12 — "Miss says my paragraphs have no evidence"

module: Essay Master · journeys: EM1, EM2

## Background / lived experience

Year 8 at an English-medium international school in Prague that follows the English National Curriculum. Czech at home, English at school since she was six, so her school English is fluent and her spelling good, with Czech traces: a dropped article, "actual" for "current", a comma before "that". Her English and Humanities teachers want PEEL paragraphs (point, evidence, explain, link; ref 19), and her last two homeworks came back with "where is your evidence?" in the margin a week after she wrote them. Her mother Barbora (`barbora-43`) sits beside her on the sofa but cannot judge her English. Has seen classmates paste homework into ChatGPT; thinks it is cheating and also a bit tempting.

## Voice

Quick, a little defensive, half Czech: "ale to je evidence, I said it's healthier!" Types fast on the phone in full sentences with capitals, because school drilled it. Says "wait, why" a lot.

## Jobs to be done

- Hand in a paragraph that will not come back with "where is your evidence?".
- Understand why a sentence is weak in words she could repeat to her teacher, then fix it herself.

## What good looks like

The TV points at the one sentence that is the problem, says why in one plain line, shows the shape of the fix, and lets her write it. Her mother can see it is her own work.

## Pet peeves

Being talked to like a nine-year-old. A tool that "fixes" her sentence so it no longer sounds like her. Red marks everywhere. Waiting a week to find out.

## Motivation (time saved)

- Traditional: about 30 minutes on the sofa with her mother, who reads the paragraph and cannot say whether the evidence counts (ref 23: parents' homework help is measured in hours a week), then the teacher's verdict a week later. A teacher spends about 5-15 minutes marking one essay (ref 20); the return time of a week is her school's, from training data, *unverified*.
- With Essay Master: about 12 minutes for one paragraph (a reading took 27.6 s and a rewrite 23.1 s in the one live run, `uat/runs/2026-10-09-essay-w-run/SUMMARY.md`; the rest is her own writing).
- Expected: about 18 minutes saved per paragraph, and the verdict lands the same evening, while she still remembers what she meant.

## Senior-quality bar

A Key Stage 3 English teacher would agree with which sentences are weak and why, would accept the move as a fair PEEL target (ref 19, ref 21: specific and actionable), and would recognise the final paragraph as Eliška's own work.

## Scored acceptance criteria

- C1 — BLOCKER: no note, move, pattern or summary shown to her (TV or phone) contains a sentence of new content she could copy into her paragraph, or one of her sentences rewritten.
- C2 — For a paragraph whose only unsupported claim is planted, that sentence is the one marked faulty, and the forensic page opens on it.
- C3 — Every note she is shown is one sentence a 12-year-old can act on, with no word she would have to look up (the young voice, `lib/rules/voice.ts:54`).
- C4 — Each faulty sentence shows a move and a pattern with at least one empty [slot]; none is blank.
- C5 — A rewrite she sends of a faulty sentence is judged alone, the other verdicts stay as they were, and the move inks only when the rewrite holds.
- C6 — She can say, from the TV alone, which lens read her paragraph and what it looked for (the lens promise or the caption).
- C7 — The time from Analyse on the TV to the first verdict on screen is under 30 s.

## Surface binding

Profile type `elementary`, age 12, school system `uk`, all three modules on (the default draft, `desk/src/lib/session/store.ts:517`). Family mode: under 18 there is no Mode row (`desk/src/tv/profileRows.ts:74`), so Adult is unreachable. Her readings use the young voice: an age of 13 or less (`desk/src/lib/rules/voice.ts:37`, essay manner at `:54`).

Routes: `/tv` and `/phone`.

- Landing: Essay Master lies on the desk because `essay` is on her profile (`desk/src/tv/landingRows.ts:31`); Select opens the lens home, or the forensic page when her paragraph is on the desk (`desk/src/tv/keys.ts:257`, `:260`); with no one seated it asks who first (`desk/src/tv/keys.ts:286`).
- TV screens (`ESSAY_SCREENS`, `desk/src/tv/keys.ts:45`, drawn by `EssayTV` at `desk/src/app/tv/page.tsx:158`): `essaytype` lens home (`desk/src/essay/EssayTV.tsx:113`), `essayplan` from "Start from the pattern" with nothing read (`desk/src/tv/keys.ts:390`, `desk/src/essay/EssayTV.tsx:189`), `forensic` (`desk/src/essay/EssayTV.tsx:315`), `playbook` by Menu or "Why this matters" (`desk/src/tv/keys.ts:397`, `:440`), `xray` (`desk/src/tv/keys.ts:445`). The specimen cabinet shows only once a lens is Secure, and only in Family mode (`desk/src/essay/EssayCabinet.tsx:12`, `desk/src/lib/rules/collect.ts:53`).
- Phone: the Essay tab (`paste`), reached by the hand-off from `essaytype`, `forensic` and `essayplan` (`desk/src/app/phone/panelFor.ts:42`, `:46`): paragraph panel with lens, file, dictate and Analyse (`desk/src/app/phone/page.tsx:588`), the rewrite panel while the TV is on a sentence (`desk/src/app/phone/page.tsx:576`), the plan slot panel (`desk/src/app/phone/page.tsx:582`), the shelf (`desk/src/app/phone/page.tsx:605`).
- Recap: End session on the phone's Tonight tab (`desk/src/app/phone/page.tsx:611`) shows the TV recap (`desk/src/tv/screens.tsx:303`).

Unreachable for her: `workroom` (Adult only, `desk/src/tv/keys.ts:259`), the PC page's Twin Card (`desk/src/app/drop/page.tsx:100`), photographing a handwritten essay (Essay Master takes text, `desk/src/app/phone/panelFor.ts:30`).

## References

`uat/references.md` 19 (PEEL), 20 (marking time), 21 (specific targets), 22 (feedback that is about the task, not praise), 23 (parent homework time), 27 (Czech pupils and AI homework). The school's week-long return time is training data, *unverified*.
