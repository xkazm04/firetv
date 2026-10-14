# helena-46 x EM5 (L1, 2026-10-14, main HEAD 4af25199)

EM5, "My writing, kept and known": keep a few emails from the PC, see them on the TV by title only, get one read, get a twin described in words she recognises, take it away, delete. Walked over current code; every claim below that hinges on a rule or a route was executed (scratchpad a1 to a6, `tools/twin-probe.cjs --stub`).

## Surface model (current code)

| Surface | Where | What she does | Notes |
|---|---|---|---|
| Profile | `tv/profileRows.ts:74`, `rules/mode.ts:344` | picks Mode "Adult (18+)" (type `other` has no age row) | `modeOf` = adult, `isAdultHere` true (executed) |
| TV Workroom | `essay/Workroom.tsx`, `tv/keys.ts:449` | Up/Down the pieces, Right to "The lenses" | session payload = titles, counts, pips, level words (`lib/twin/workroom.ts`); OK on a piece does nothing |
| PC page | `app/drop/page.tsx` | join with the TV code; keep paste / .txt / .md / .docx as Message, Email or Essay; shelf with Open and Delete; "Your twin" with exemplar checkboxes; "Download your Twin Card"; "Show the Workroom on the TV" | no read action; format radio starts on Message |
| Phone | `app/phone/page.tsx:686-715`, `EssayShelf.tsx` | shelf, Open, Delete, "Delete everything I kept" (two presses); keep box only for 2+ paragraphs; no title field | the only door to a reading |
| Routes | `/api/texts` (phone/PC, TV refused), `/api/twin` (GET portrait, POST open/exclude), `/api/twin/card` (Adult, born, phone/PC) | | portrait not mode-gated (EM5-13) |
| Style meter | `lib/rules/style.ts` | `styleSheet` + `twinDims` per channel | directness inverted, email misread (EM5-2/3) |
| Habit detectors | `lib/rules/habits.ts` | none: imported by nothing in `desk/src` | T4 not started: scope, not a defect |
| Twin probe | `tools/twin-probe.cjs --stub` | gate dry run | 4/8, "fail (simulated)" in stub; its dims column shows the directness inversion |

Reachable for her: all of the above. Unreachable by design: the specimen cabinet (Family, `rules/collect.ts:54`).

## Scored criteria

| Id | Result | Evidence |
|---|---|---|
| C1 BLOCKER: the TV never shows a sentence of a kept piece on the Workroom | **FAIL** | untitled emails are titled from their first line: 'Thanks for the call today Peter', 'ok the Rabobank demo moved to thursday at ten', 'Quick update on the Brenntag contract renewal', 'Subject: Brenntag renewal' (EM5-1; the other Workroom fields are clean) |
| C2 lands on the Workroom; "The lenses" reaches the lens home | **PASS, then lost** | holds with nothing on the desk; after a first reading the remote cannot get back (EM5-5) |
| C3 not addressed as a child or a student of 15 | **UNCERTAIN, narrowed** | faulty notes and summary are code's now; strong/neutral notes and fixes are written under "a 15-year-old" (EM1-1) |
| C4 Language lens flags real padding, flagged words are in the sentence | **structurally pass** | `wordIn`; padding agreement is L2's |
| C5 after three kept emails: "Born" + level words; before: how many more | **FAIL on the words, pass on the count** | count and Born work; dims say 'ceremonial', 'indirect', 'headline' for casual two-line emails (EM5-2/3); and only if she chooses Email every time (EM5-8) |
| C6 delete one piece or all, and the Workroom shows it gone | **PASS on the shelf, FAIL on the desk** | shelf and Workroom empty (executed); the read email stays in `session.json` and opens again on Select (EM5-4) |

## Verdict

`L1-fail`. Four blockers are open and unchanged since 2026-10-09: the title curtain (EM5-1), the inverted directness (EM5-2), the email level words (EM5-3), delete-all leaving the text (EM5-4). Nothing in this journey's main findings has been fixed since the first walk (the commits between 12592a71 and HEAD touch the reading, not the twin: `git log 12592a71..HEAD -- desk/src/lib/twin desk/src/lib/rules/style.ts desk/src/lib/session/texts.ts desk/src/app/drop` lists only `de7361f2` (data-dir helper), `87ad8603` (the habit detector's long-run measure, a 2-line change to style.ts) and `ccfc2409` (the code-written essay summary)).

Time saved if it all worked: about 0, confidence low; a loss of 3 to 5 minutes per kept piece until the card is used by another tool and drafts emails she would send as her own (her file marks the number uncertain until that is tried). The probe that would say whether it helps is simulated and, in its stub run, failing.

Grounding: the twin portrait and card are code with no model call: n/a. The reading surface she uses to read a kept piece: ES-READ 2/8.

Wiring (units fixed in the report): `/api/texts` GET 5/8 (format, noticed, notice unwired), `/api/twin` GET 11/12 (`words[].level`), Workroom payload 13/16 (`updated`, `diff.paragraphs`, `words[].level`). Orphan module: `habits.ts` (0 importers; by design).

## Adult gate (sampled out of segment)

A 13-year-old (high-school, 13) and an 18+ profile in Family mode were seated in a scratch desk.

- The card: 403 for both, "The twin card is for Adult mode (18 and over)." Pass.
- Adult cannot be stored under 18: a 15-year-old saved with mode adult has no mode; `{other, 17, adult}` is family; `{other, 40, family}` is family (executed).
- The Workroom and the portrait: **served**. `GET /api/twin` 200 with the exemplar text; `POST {open:true}` 200 and the session goes to `workroom`. The 18+ Family profile gets no adult content, but both reach an Adult screen (EM5-13, owner decision needed).
- On the TV keys the Workroom opens only for `isAdultHere` (`keys.ts:292`); the leak is the route and `/drop`.

## Helena, in her own words

"I will be direct, because that is my job. I asked last time that it not put my client's business on the television. It still does: if I forget to type a title, the title is the first line of my email, in large serif type. 'Quick update on the Brenntag contract renewal.' The desk is my son's. That alone is the end of it for me.

The twin: it describes me as 'ceremonial' and 'indirect', with 'headline' detail. I write 'Hi Anna, the invoice is wrong, please fix it today, best, Helena'. A trainer would laugh. I checked why: it counts 'Best, Helena' as two sentences, and it reads 'no hedges' as 'indirect', the wrong way round against the card's own specification.

The card also promises it never keeps what other people wrote to me. I put a quoted reply from a client in, and the quote came out in the card, word for word. The checkbox list on the PC page is the only thing between that and another tool.

When I deleted everything I kept, the shelf was empty, and the television still opened my last email when I pressed OK on Essay Master. If you tell me it is gone, it has to be gone.

What I did like: the page is plain, it never told me I was a schoolgirl on the PC page, the Twin Card is a file I can read and take away, and the card download actually refuses a child's profile. Fix the title, the delete and the two words, and I will keep three emails and look at what it says."
