# helena-46 x EM3, walked as an 18+ type `other` adult (L1, 2026-10-14, main HEAD 4af25199)

EM3 is "The whole essay". The existing Characters for it are Daniel (15) and Kristyna (17); neither is an adult. Walked here in Helena's lens as the out-of-segment case: a four-paragraph client proposal sent as one piece. Finding ids are in `findings.json`.

## Walk

1. Phone, Essay tab. She pastes the proposal. `onEssayPaste` splits on blank lines (`phone/page.tsx:247-253`), so the panel shows "That is 4 paragraphs. Read the whole piece, or one paragraph at a time." and the box "Keep it on my shelf", ticked (`page.tsx:92,695-697`; EM3-1, by design).
2. "Read the whole piece on the TV (4 paragraphs)" posts `kind: "piece"` with `keep: true`. The route checks size, then that at least one paragraph is English, then, because it is keeping, that the learner has accepted the notice (`route.ts:93-101`). First time: 428 and the notice "the desk sends it to its text engine: Claude, through the command line on this computer" with "I understand, keep it" and "Read without keeping". It names the engine; it does not say that the sentences will be on the TV.
3. The piece is kept: `addPiece` with no format and no title (`route.ts:102`), so it is an `essay` titled by `titleOf`. A proposal whose first paragraph is a heading-like line gets that line as its title (EM5-1); otherwise "Untitled essay" (EM5-16: the phone has no title field).
4. The read: one model call per paragraph with the whole piece as context; the piece is ruled once at the end (E2); a paragraph that fails is drawn "not read" and can be sent again (E4-a); a non-English paragraph is named and skipped (E3). These are the EM3 fixes the other walkers asked for, now in code (commits 5cca409b, a34a0333, dd230dc0). The TV opens the forensic page on the first paragraph back, draws every sentence whole (EM5-7), and says "Start with paragraph p, sentence n" from a summary written by code.
5. Afterwards: the shelf lists the piece with title, paragraphs, version, date (never the format, EM5-8). Open loads the latest version; changing it and pressing "Read the whole piece" adds a version (works for 2+ paragraphs; for a one-paragraph piece it does not, EM1-10). Delete one or "Delete everything I kept" empties the shelf and the Workroom, but not the reading on the desk (EM5-4).

## Scored criteria

C1 (curtain) fails when the piece is kept (EM5-1). C2: after the read, the remote does not lead back to the Workroom (EM5-5). C3: same teen prompt for every paragraph (EM1-1). C6: delete works on the shelf; the TV still has the text.

## Verdict

`L1-conditional`. The whole-piece flow is structurally sound for an adult (paragraph-by-paragraph read, failure isolation, limits that refuse with a sentence, a notice, a shelf, delete). It carries the curtain blocker of EM5 the moment she keeps it. No new EM3-only defect beyond the by-design default keep (EM3-1).

Time saved if it all worked: about 2 minutes, confidence low. She would re-read a four-paragraph proposal in about 6 minutes; the read is about 4 model calls of roughly 25 s each, plus the phone trip; she then fixes by hand.

Grounding: ES-READ 2/8, as EM1 (the piece prompt adds the whole piece as context for the Structure lens, which is S1, not a new source).

## Helena, in her own words

"The long-document path is the best part of this. It reads the paragraphs one by one, it tells me when a paragraph did not come back instead of pretending, and it does not rewrite anything for me. That is how a proofreader behaves.

But I tick 'Keep it on my shelf' by default, and the proposal is for a client. The notice tells me where the text goes, which I appreciate, but it does not tell me that every sentence will be on the television while the desk reads, and this is my son's desk. I will untick it every time. Then I would like it to be clear that unticked really means it is not kept: the text of what I read still sits in the desk's session file (EM5-4).

I cannot name the piece from my phone. So three proposals are three lines of 'Untitled essay', or, worse, the first line of the proposal. Please let me give it a name."
