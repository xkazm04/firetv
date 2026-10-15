# helena-46 x EM1 (L1, 2026-10-14, main HEAD 4af25199)

Journey EM1, "What does my paragraph do?", walked as Helena: profile type `other`, no age, Mode Adult (18+). Finding ids are in `findings.json` beside this file. Scripts and outputs are in the scratchpad (a1 to a6); the key ones are quoted below.

## Walk

1. Landing, Select on Essay Master with nothing on the desk: `openWaiting` sees Adult and asks `/api/twin` to open the Workroom (`desk/src/tv/keys.ts:292`). C2 holds. With a paragraph already on the desk it opens the forensic page instead (`keys.ts:290`), which is EM5-5.
2. "The lenses" (Select at the end of the Workroom list, or Menu) reaches the lens home `essaytype` (`keys.ts:454`). The copy there still says "Paste, type or dictate one paragraph on the phone" and the x-ray is about students arriving at school exhausted (`EssayTV.tsx:150,539`): EM1-4.
3. Phone Essay tab: she pastes one email paragraph, picks Language, presses "Analyse on the TV". `analyseParagraph` posts `kind: "essay"` (`phone/page.tsx:298`). The route refuses over 4000 characters and refuses a Czech paragraph before the run (`route.ts:127-130`); German and Dutch pass (executed). No notice is shown on this path (EM1-9).
4. The reading: the prompt is "writing tutor for a 15-year-old", "a student can act on" (`desk/essay.ts:86,90,95`). The model returns one `issues` list per sentence; code decides the verdicts. Executed on a 3-sentence client paragraph: the 53-word sentence is faulty with the note "This sentence runs to 53 words; split it." and, having no model fix, is taught "Claim, then evidence, then the link back" (EM1-2). The "very good thing" sentence is faulty on "very", note "'very' is doing too little here; say what you mean." A word the model names that is not in the sentence ("basically") leaves the sentence neutral.
5. Rewrite loop: ES-REVISE reads the paragraph, the old verdict and the move taught; the prompt is the same teen voice. Not walked further; the loop is EM2's.

## Scored criteria (applied as in her file)

| Id | Result | Why |
|---|---|---|
| C2 | pass, conditional | lands on the Workroom with nothing on the desk; after a first reading the remote never returns to it (EM5-5) |
| C3 | uncertain, narrowed | faulty notes and the summary are now code's lines, so they never say "student"; the notes on strong and neutral sentences and every fix move/pattern are written under "a 15-year-old" (EM1-1). L2 reads them |
| C4 | structurally pass | a flagged word must be in the sentence (`wordIn`); whether she agrees it is padding is the model's choice, L2's to read |

Not scored here: C1, C5, C6 (EM5).

## Verdict

`L1-conditional`. The job completes structurally (send an email paragraph, see which sentences are long or padded, get a move). Majors: EM1-2 (essay move on an email), the unwarned send (EM1-9, shared root with EM-B9), the false "new version" line (EM1-10). Carried: EM1-1/2/4/5/6 still open; EM1-3 and EM1-7 are fixed (4158321b; 803c6075 for Czech only).

Time saved if it all worked: about 1 minute, confidence low. She trims an email in about 5 minutes by hand; the read costs a phone trip, a 25 s model call (W-run: 27.6 s for a paragraph), and the reading of one forensic page per faulty sentence. For a two-line email it is slower than doing it herself.

Grounding: ES-READ 2/8 (S1 text, S2 lens). S3 kind, S4 age, S5 mode, S6 task, S7 history, S8 memory do not reach the prompt. ES-REVISE 6/7 (R7 age band is absent for a profile with no age).

## Helena, in her own words (designed experience, no browser)

"Fine. Let me say what has improved, because something has. When it tells me a sentence is too long it now says so in one plain line: 'This sentence runs to 53 words; split it.' It no longer tells me my 53-word sentence 'clearly explains the reason', which is what it did last time. And when I put in a Czech paragraph by mistake, it says in one sentence that it reads English. Good.

What has not changed is what I minded most. It still thinks it is talking to a fifteen-year-old student. I know because I read the prompt, and so would anyone who asked the desk what it tells the engine. The sentence it flags, it teaches me 'Claim, then evidence, then the link back'. That is advice for an essay on school uniforms, not for a two-line message to Mr Visser.

And one thing I did not expect: when I send a single paragraph, which is what an email is, nobody tells me my client's text is going to a text engine. The notice appears only when I keep something, and I cannot keep a one-paragraph email from my phone at all. I would like to be told before, not after, thank you.

Would I use it? To see which sentences are long, yes, but I would see that myself in a minute. I will wait until it speaks to me like a grown woman who writes to clients, and until it warns me about where the text goes."
