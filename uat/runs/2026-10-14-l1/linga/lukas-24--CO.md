# lukas-24 x CO (The Company: pitch, play, Cut, Take Two, ad hoc) - L1

Run 2026-10-14-l1, HEAD 4af25199, code only. Findings: L1-lukas-24-CO-1..7.

## The journey I walked

Lukas is 24, type Other, Adult mode (he picks Adult (18+) on the Mode row or ticks the Set up box), B2, speaks. J1-J3 give him a level, a plan with a first-date topic and a conversation; J5 pushes the boundary in the reply box. This walk is the part they leave out:

1. Phone, Linga start panel (after a scene or on home): `Pitch a scene`. He writes "a first date at a board-game cafe, she is vegetarian and I am not, I freeze when she asks about my job" (under 400 characters).
2. Code gate: not Adult -> 403; empty; cap; never-list -> 400 with no model call; "first date" is raised to adult. One shaping call, then the scene starts (a second call for the opening).
3. He plays 4 to 6 replies by speaking; one moment at most.
4. `Cut` (phone, or the TV talk screen): one fast call, up to three notes, each quoting his own words; the take ends on the recap tape.
5. `Take Two - note 2` on the phone: the partner line before his reply is said again from stored text; he says his line again; the cast answers twice at most; `Back to the notes`.

Reachable for him: all of the above (executed with a stubbed model). Not for him: the Family collection keys (Adult shows progress, not objects).

## Against my criteria

- C2 own-words date topic accepted as adult: pass (keywords place it adult, Adult may practise it).
- C3 BLOCKER non-explicit, graceful redirect: held by the tutor prompt only for the partner's lines (CO-6): the plan's "never-list at every age" is a premise claim; the adult output has no code backstop. Not a failure of the code today, an unmeasured wall.
- C4/C5/C6 are partner and moment quality: not decidable at L1.
- New (mine from this walk): I want to know where it stops, and it never tells me (CO-5).

## What I found, in my own words

I asked "is that allowed here?" and the pitch box shows me a dragon at a bank. Nothing says first dates are fine; nothing says what is never played. If I type something over the line I get "Linga can't play that scene. Try another one." That is the sentence I was afraid of: like the other apps (CO-5).

When Cut gives me notes they are my words, in quotation marks, and I checked: the code drops any quote I did not say, even one with a capital letter changed (CO-1). That is the first time an app has not put words in my mouth. One thing I would have liked it to refuse: a note on the letter "a" (CO-2), but that is the model's choice to make, not the code's.

If my take is good, Cut tells me Linga "could not give notes" and to press again (CO-3). I will think I broke it, then press it three times. This will happen on exactly the dates that went well.

In Take Two the partner repeats a line and then answers me. In the prompt the cast sees its own line twice and my line twice (CO-4); I will only notice if it starts the reply by repeating itself.

## Felt verdict

Would I adopt it? Yes for fifteen minutes before a date, if the first date is allowed and the quotes hold. It is the right shape: I rehearse the thing I fear, and the notes are in my own words. Would I tell a peer? Only after I know where the line is. What the premise promises (a second take that shows what changed) works for tense and word choice and says "Not decided" for register.

## Numbers

- Estimated time saved if it all worked: about 25 min a week against his coach-equivalent (stated 30) - low-medium confidence; two sequential model calls to start the pitch and one per take line are unmeasured latency.
- Senior bar (social-confidence coach): scene realistic and respectful at design level; notes quoted and few; "boundaries in the right place" depends on the unmeasured prompt (CO-6).
- Grounding, PITCH-SHAPE (N=8): 7/8 (earlier pitches/plan titles are not passed as avoid). CUT (N=8): 5/8. TAKE (N=6): 6/6 relevant.
- Verdict: L1-conditional (majors CO-3, CO-4, CO-6).
