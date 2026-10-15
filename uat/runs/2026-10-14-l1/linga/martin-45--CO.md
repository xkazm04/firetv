# martin-45 x CO (The Company: pitch a meeting, Cut, Take Two, ad hoc) - L1

Run 2026-10-14-l1, HEAD 4af25199, code only. Findings: L1-martin-45-CO-1..6.

## The journey I walked

Martin is 45, Other, Adult, B1 who says C1, speaks. J1-J3 place him and give him workplace topics. This walk is what he would actually use before the call with the new US director:

1. `Pitch a scene`: "weekly call, the new US director grills me on why the supplier delivery was late; I have to disagree without sounding rude". Keyword gate: workplace conflict is "older", allowed; no model call on a refusal.
2. He plays three or four replies by speech. His speech has the fossilised forms: "we was discussing about the delay", "this solution is more better", "I am in this company since 2015", "he don't agree".
3. `Cut`: up to three notes quoting him; `Take Two` on each; the recap shows a struck quote if code decided it held, "Not decided" if code could not.

Executed with a stubbed model and the real validators (scratchpad/take-exec.cjs).

## Against my criteria

- C3 a note targets one of my recurring errors: pass in the executed flow (we was discussing; more better; since). It depends on the model proposing them, and on the quote being exactly what the speech recogniser wrote.
- C4 every correction right, none corrects something already correct: not decidable here; the Cut call never sees the partner's questions (CO-3), the one thing that tells a correct short answer from a wrong one.
- C5 workplace topics: pass; one pitch does it.
- C6 short accurate answer to "why is it wrong": Take Two and Cut notes are one sentence each (160 characters), the only explanation I get. The coach in-scene is separate.

## What I found, in my own words

The pitch is the right door: my meeting, not a hotel (CO-4 strength). The notes are in my words and the code throws away any quote that is not (executed: a made-up "he doesn't agree" is gone, the three real ones stay). That impresses me.

Then I tried to prove it to myself with Take Two and the app told me "Not decided" on "we was discussing about the delay" even after I said "we were discussing the delay" (CO-1). It cannot decide without a time word, and my error has none. The "since 2015" one is labelled "A reading": honest, but it is my headline mistake and the app has no rule for it. "He don't agree", "discuss about", "more better" have no rule. The only error the struck-through quote worked on was a word swap (more better -> much better) and a sentence where I repeated the phrase it showed me. I can get the strike by echoing the card (CO-2). So if I trust the strike, it flatters me; if I do not trust it, I do not need it. I hate being flattered.

## Felt verdict

Would I adopt it? For the pitch and the notes, yes. For the "did it hold?" mark, not yet, and I would say so to the manager who pays. I would tell a peer: "pitch the call, read the three lines, ignore the strike for now." What is missing for my job: rules for my five errors; the notes to be compared with what the partner asked (CO-3); and one place where a Take Two counts, since nothing in it reaches my map or certificate (ceiling on the strength row).

## Numbers

- Estimated time saved if it all worked: about 60 min a week against his 90-min school lesson (stated 75) - low confidence: the strike is unreliable on his error types, and he stops if the verdict looks arbitrary.
- Senior bar (business English trainer): notes correct and quoted: plausible; trainer would reject "Not decided" on his main errors as a Take Two outcome.
- Grounding: PITCH-SHAPE 7/8, CUT 5/8, TAKE 6/6 relevant (definitions in the appendix of martin-45--CO.md).
- Verdict: L1-conditional (majors CO-1, CO-2, CO-3).

## Appendix: wiring audit, grounding denominators, executed checks, scope notes

Wiring (unit: exports or fields declared vs distinct importers under desk/src outside the declaring file; tests and tools excluded):
- lib/english/cambridge.ts: 12 exports, 0 importers (tools use 4); VERIFIED=false, claimAllowed() has no caller. By design while the claim is off (klara SP-4).
- Adult surfaces: pitch box, own tag, cut button, note pins, take-two, take-end, held/open/undecided mark, "A reading" label: 8 of 8 reach a screen. Dead stored fields: Cut.at, Take.at (CO-5).
- No dead flag found; view.ts refused() takes no mode but is never asked for cut or take-two.

Grounding denominators (defined here for these surfaces; a source counts only if it enters that call's prompt or schema):
- SP-TURN, N=8: scene premise, band, interest, goal, preferences, transcript, due taught item, recent evidence of the focus skill. Reaching 8/8 (conversation.ts:88-96).
- PITCH-SHAPE, N=8: premise typed, band and guide, goal, interest, teaching notes, placement focus, mode and audience limits, titles to avoid. Reaching 7/8: avoid is [] (check.ts:178).
- CUT, N=8: learner lines, partner lines, scene premise, scene goal, level, preferences, moments already shown, learner history. Reaching 5/8 (conversation.ts:294).
- TAKE TWO, N=6: transcript to the fork, new line, premise, band, the take's earlier lines, learner record. Reaching 6/6; the noted slip is withheld by design. The duplicate lines are CO-4.

Executed checks (scratch scripts in the session scratchpad, no repo edit, no desk/data): notes-exec.cjs (cleanNotes on 17 inputs), rule-exec.cjs (tense rule on Martin's errors, heldOf), take-exec.cjs and take-exec2.cjs (full stubbed flow: zero notes -> 502; three notes, made-up quote dropped; Take Two held null/true/true; transcript to the model shows the fork line twice), flow-exec.cjs, gate-exec.cjs, scenes-exec.cjs.

The three claims in the brief: (1) notes quoted from the learner's own lines: true at the substring level (executed), not as "a quote worth showing" (lukas CO-2); on speech the quote is the recognised text (L2). (2) never-list at every age: true for pitch premises and every topic's words, with recall holes (ondrej GATE-2); false for an adult's partner lines (lukas CO-6). (3) Family-mode 18+ gets no adult content: true for scenes, pitch, Cut, Take Two, the date scene; one leak via the taught-phrase bring-back (ondrej GATE-4).

Scope notes: L5 and L6 are not started (plan rows 26, 28), so output-side never-list work and Key/PET images are not defects. Self-declaration at the Mode row is the owner's ruling (V2-O3, D1); GATE-1 is the silent age erasure. Take Two writing nothing to the record is the L4 ruling. Accepted gaps AG-1..AG-5 not re-raised. The consult line for the registry was not written (.ai/consults.jsonl is tracked here; I reverted my one append). No registry lead filed.

L2 handoff, highest value first (all need the claude CLI tutor on the subscription, thinking off, none runs keyless): (1) play sp-about-you as an elementary 13-year-old and count requests for name, town, school; (2) LT J5 with the GATE-2 asks and the GATE-5 injection through plan-add; (3) TV: the profile retype and the 14 presses; (4) ten Cut calls on clean takes; (5) a live speech Cut and Take Two.
