# Study Desk: App Master rulings on the council-lite reviews of 2026-10-09

Council-lite rounds ran on 2026-10-09. For each feature with must-address lines, the App Master ruled how its rework fixes
them and what the rework leaves out. This doc puts those rulings in the repo, so later rework briefs can cite them by id
(for example "M4" or "X1b"). The rulings had lived only in the App Master's journal.

**These are the App Master's rulings, not the owner's.** The owner may overrule any of them. An owner decision in
`docs/concepts/STUDY-DESK-V2-OWNER-DECISIONS-2026-10-07.md` wins over a ruling here. The council never approves; only the
owner does.

Inputs: the council-lite round of each feature (round 1, score and must-address lines quoted verbatim below);
`docs/BACKLOG.md` (ids EM-B, MB-B, LG); the App Master's journal rulings of 2026-10-09.

Status is given per row. A delivered ruling cites its commit. "queued, delivery N" refers to the delivery order at the end
of this doc. "in flight, run X" means a builder is working on it. Code sites were checked on `main`; where a site had moved,
the current line is cited. This doc was updated for round 2 on 2026-10-09 (the first version merged at 7041d11d), for round 3 on 2026-10-10 (round 2 merged at f7f24df5), for round 4 on 2026-10-10 (round 3 merged at a5ff6720), for round 5 on 2026-10-10 (round 4 merged at c28380e2), for round 6 on 2026-10-10 (round 5 merged at d24f824d), for round 7 on 2026-10-10 (round 6 merged at 56431416), for round 8 on 2026-10-10 (round 7 merged at e74340e8), and for round 9 on 2026-10-10 (round 8 merged at 2498060d), and for round 10 on 2026-10-10 (round 9 merged at 4edacb54), and for round 11 on 2026-10-10 (round 10 merged at a5a0eb19), and for round 12 on 2026-10-10 (round 11 merged at 50ee1e31), and for round 13 on 2026-10-11 (round 12 merged at d7987408), and for round 14 on 2026-10-11 (round 13 merged at f2645f41), and for round 15 on 2026-10-11 (round 14 merged at 2365ad92), and for round 16 on 2026-10-11 (round 15 merged at 4193c55e), and for round 17 on 2026-10-11 (round 16 merged at 4ef795f0), and for round 18 on 2026-10-11 (round 17 merged at b2009df1), and for round 19 on 2026-10-11 (round 18 merged at 53dbdd33), and for round 20 on 2026-10-11 (round 19 merged at 4f930cc9), and for round 21 on 2026-10-11 (round 20 merged at afe0501c), and for round 22 on 2026-10-11 (round 21 merged at fe8d218e), and for round 23 on 2026-10-11 (round 22 merged at d93b6eda), and for round 24 on 2026-10-11 (round 23 merged at b95e3836), and for round 25 on 2026-10-11 (round 24 merged at 416e24ba), and for round 26 on 2026-10-11 (round 25 merged at 5773d558), and for round 27 on 2026-10-11 (round 26 merged at 419d8f3f), and for round 28 on 2026-10-11 (round 27 merged at a5a3d2bb). Ids such as run 13cf8526, d2d908e6, f29f363f, eac6191a, 03fa57dd, 18799a66, 57233789, 6d685adf, 12cf4a44, c448db9f, 3922989d, 9fcfac15, 6cf02f5a, c072cd17, d6cc1be4, 9bcde838, ce489ee7, 0f94108c, d6aad5fb, 7a3b0529, f6b73d06, a03b1279, cc346058, 5d52a422, 0a4ec2cd, 3720e29a, 7d7171be, f1df9456, 77dbd15a, 058f9e18, e1fc9eaf, f795a859, 27364288, feedcd76, 8e4ef693, 8704f32e, 56d9271f, af864d93, c916b03c, 036c1dd7, 62a80958, c2a3c969, e8e43454, fa069457 (capture r10), c976c3d8, 908c9d3a, 243b0a17, 38d6db69, e9761c26, 1f8f5ef3 (capture r11), 5ad42cde, a7fb68b4, dab615ba, 1236bd27 (capture r12), 200beb31, 0994cd5c, af69ab78, 73da4bac, 80b15cc1, dff24ac2, 3aa168a3 (capture r13), 1ee1d75f, ffa7f3f0, b4747c7d, 333437c2, 6b308dab, 98ac0359, cf79b2aa, e158c14f (capture r14), a41f6567, 7e1cad00, 7933aa33 (capture r15), 93e16c60, 8ed29bf1, 80fa2642 (capture r16), e7bdaf06, e91b057f (capture r17), 6d379b49, 9c07044c, 36036ff6, 342fac19, 0e2af485, ba253bba, 92e76f24 (capture r18), 529d7b48, ba38f08e, 93d18808, 541b1f74, f699c29c, 4b25dfae (capture r19), d4aeb4f3, 85a2a235, d2f9e78d, 2cb1d267, 5651f179 (capture r20), 1f5206cc, b6742d4b, b878d726 (capture r21), e9ff4caa, 6b9a8cda, 6a780c9a (capture r22), 12db6fd8, 1e81ded3, 3440c2ae (capture r23), ce511120, aa157cdb, f37489af (capture r24), 966009e3, 3743a5da (capture r25), 26d58dd4, 6759b75f (capture r26), f0472b94 (capture r27), 17cab0a5, bea13399 and bf0eec4e name a run, not a commit.

---

## 1. end-of-session-memory-recap

Lite r1: ready, 0.5393. Tier: major.

Must-address:
1. value: The Essay recap counts a sentence the student fixed as still to fix (Barbora C2 fails; observed)
2. value: The memory half never fires for a Linga or Essay evening, and the phone then says 'Nothing written down tonight.'
3. craft: The phone's End session holds the evening open on a model call; the TV path does not

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| M1 | After a rewrite, the Essay count follows the reading's last state. The history keeps ONE line per reading, updated in place. | Must-address 1, EM-B1. `desk/src/lib/desk/essay.ts` `record()` (:93) and `reviseSentence` (:158). | Appending a line per rewrite. That is how the count went stale. | delivered, 1637cff6 |
| M2 | Essay and Linga evenings feed the memory. `/api/memory` asks the model when tonight has any Math, Essay or Linga line. The memory gets one section per app. It holds counts, lenses and the closed vocabularies only, never learner text verbatim. | Must-address 2, EM-B2. `desk/src/app/api/memory/route.ts`. | none recorded | delivered, 77c21600 |
| M3 | The phone's 'What the desk noticed' has four states. The lines, when lines were written. 'Nothing new to note tonight.', when the model was asked and wrote none. 'Nothing worked on tonight.', when there was no work and nothing was asked. The desk's failure sentence, when the write failed. A failure never shows an empty-evening line. | Must-address 2, the phone half. The fixed fallback 'Nothing written down tonight.' is at `desk/src/app/phone/page.tsx:613`. | none recorded | delivered, 4d216118 |
| M4 | The phone's End session posts `session.end` first and then writes the memory, as the TV's Menu does. The memory call runs with thinking off. | Must-address 3. Today `endSession` posts `session.end` in a `finally` after the memory call (`desk/src/app/phone/page.tsx:358`, button at :611). | none recorded | delivered, 52f32cd2 |
| M5 | The evening log belongs to one evening. It is stamped with the server's local day, and the first event of a later day clears it, for every learner slot. | MB-B12. The log lives on the session and on each slot (`desk/src/lib/session/store.ts:308`, :364, :373). | Clearing it on `session.end`. The recap still reads it then. | delivered, 9ee12486 |
| M6 | The caption says 'all of it right' only when at least one item was marked and none is wrong or unsure. Hints-only and Linga-only evenings get their own sentence. | MB-B11. `recapCaption` falls to "all of it right" when nothing is to look at (`desk/src/tv/recapRows.ts:84-88`). | none recorded | delivered, 715ce1ef |
| M7 | The phone's Recap shows whenever tonight has a non-empty tile, or a session ended since local midnight, whatever the TV shows. | EM-B19. The Recap body renders only on `s.screen === 'recap'` or a non-empty `s.log.problems` (`desk/src/app/phone/page.tsx` near :616). | none recorded | delivered, 715744b3 |
| M8 | A whole piece is recapped as a piece. The Sunday line says 'reading' or 'piece' by size. | EM-B20. `record()` runs after the last `essay.progress` (`desk/src/lib/desk/essay.ts:93`). | none recorded | delivered, 8f8241fe |

M1-M8 were delivered by run f6077614. The BACKLOG closures are 65b3bc5f.

Later rounds:
- Lite r2: ready, 0.6371, coverage 0.70, must-address empty. All three r1 lines were closed by reproduction.
- Full r1: ready, 0.5283, coverage 0.90, judged at 7041d11d. Scores: value 0.50, craft 0.45, rivalry 0.60, robustness 0.62, economics unmeasured. Its Report and Approval are with the owner.

Full r1 must-address, verbatim. The council cut the second line itself, so its '...' is kept:
1. craft: The memory contract lives in the prompt only: the write door does not enforce it, and the replay shows violating lines persisted
2. economics is unmeasured: The feature makes a metered call: one headless Claude Code CLI spawn per ended evening that has work (desk/src/lib/desk/memory.ts:67, model 'fast' = haiku...

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| 13a | Enforce the memory contract in code at the write door, `desk/src/lib/desk/memory.ts`. Drop a line that carries the learner's name or a score. Keep at most three lines per evening. Cap each line's length. Keep the call's ms and provider. Each of these gets a rule case. | Full r1 must-address 1 and 2. The replay kept a named line and a score. | Leaving the contract in the prompt. | queued, delivery 13a |

Left out, by ruling:
- value-3: the memory shown to the parent. The full r1 raises it again (the memory never reaches the parent), and it stays ruled out.
- craft-2: memory governance (date, source, review, removal).
- craft-3 and craft-4.
- EM-B36 and MB-B23: delivery 13, split by shape. 13-i (RC1 to RC7) and 13-i-b (RC3-a and RC3-b) are delivered. 13-ii is ruled below (13-ii-a and 13-ii-b).

Delivery 13 rows, ruled at the dispatch of 13-i (run b6742d4b), at the dispatch of 13-i-b (run a2fbef80) and in round 21:

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| RC1 | The essay phone line never sums counts across readings. Each listed count belongs to one reading, given in the order read. Formats: one reading: unchanged, byte for byte ('Essay Master - one reading (Argument): 2 of 5 sentences to fix', pinned at tools/tv-recap-test.cjs:469). Several readings, all under one lens: 'Essay Master - two readings (Evidence): 3 of 5, then 1 of 5 sentences to fix'. Several lenses: drop the parentheses and prefix each count with its lens: 'Essay Master - two readings: Structure 2 of 5, then Evidence 1 of 4 sentences to fix'. More than three readings: list only the last three, the same three the TV tile draws: 'Essay Master - five readings (Evidence), the last three: 3 of 5, then 2 of 5, then 1 of 5 sentences to fix'. With several lenses: 'Essay Master - five readings, the last three: Structure 2 of 5, then ...'. The one-lens form applies only when every reading tonight used that lens. ', F fixed tonight' stays at the end, summed over all of tonight's readings, as today. | EM-B36, EM4-5 | one summed count with the paragraph count named. Rejected because a re-read would still read as more writing. | delivered, 4e209aef (run b6742d4b) |
| RC2 | In toLook, the essay adds only the 'against' of tonight's last reading. That is the last writing line of the history, which a rewrite restates in place (M1). So the same paragraph read twice no longer counts twice ('four to look at together' becomes the last reading's count). Ceiling, accepted and stated in a code comment: when two different paragraphs both have sentences to fix, only the last counts, because the history line holds no text that could tell a re-read from a new paragraph. The tile and the phone line still show every listed reading. | EM4-5, the caption | summing the latest reading per lens. It has the same blind spot and gives a less obvious number. | delivered, 4e209aef (run b6742d4b) |
| RC3 | The TV essay tile keeps drawing the last three readings. When tonight has more than three, the tile adds one small line, exactly 'and N earlier' (N = readings - 3), with data-role 'recap-earlier'. The Math Buddy tile does the same for sets beyond its last three. The phone's maths line is unchanged for sets, because different sets are different work. Put any style it needs in desk/src/design/on-air.css, next to the rc-* rules. | EM-B36 tile | none recorded | delivered, 8eaf85c4 (run b6742d4b); its words "and N earlier" are replaced by RC3-a |
| RC4 | Export a pure railOf(of, against) from recapRows.ts that returns { arrows, back }. screens.tsx draws the essay rail from it, with the turned arrows at the end as today. of <= 12: arrows = of, back = against (unchanged). of > 12: arrows = 12, and back is 0 when against is 0, 12 when against equals of, otherwise round(12 * against / of), clamped to 1 to 11. Pin these cases: (5,2)->(5,2), (12,3)->(12,3), (14,2)->(12,2), (14,14)->(12,12), (30,1)->(12,1), (30,29)->(12,11), (20,0)->(12,0), (0,0)->(0,0). A reading with something to fix always shows citron. A reading with nothing to fix never does. | EM-B36 rail | none recorded | delivered, 8eaf85c4 (run b6742d4b) |
| RC5 | EssayDigest gains 'paragraphs'. record() writes it on every new entry: 1 for a paragraph, and the piece's paragraph count for a piece. That count is the 'paragraphs' argument record() already receives. cleanDigest keeps paragraphs only when it is a whole number from 1 to the entry's sentences. Otherwise it drops the field and keeps the entry. On the Sunday page, an entry with paragraphs is a piece when paragraphs > 1. An entry without the field was written before RC5, and it stays a piece when sentences >= PIECE_SENTENCES, as today. So a 3-paragraph piece of 9 sentences reads 'One piece, ...', not 'One paragraph reading'. The Sunday line adds no words. PAGE_WORDS and the busiest-week pin stay as they are. A re-read of one paragraph is still a reading on the Sunday page. That is the accepted ceiling for EM4-5's Sunday half, because the digest holds no text. | digest value-3, EM4-2 | none recorded | delivered, 2ec91176 (run b6742d4b) |
| RC6 | One lens order everywhere, the order read. A lens is listed where its first reading falls: tonight for the recap, this week for the Sunday page. The recap already follows history order. Confirm that and pin it. week.ts stops mapping ESSAY_TYPES. Instead it lists lenses by their first reading in chronological order (sort by at), and keeps the display names. Change the pin at tools/week-rules-test.cjs:179 ('lenses in the desk's order') to the order read, and give the reason in the test title. | digest value-4, EM-B36 part c | the desk's order everywhere. It cannot follow the recap's per-reading counts. | delivered, 75154729 (run b6742d4b) |
| RC7 | When second > 0, the phone's maths line adds ', k needed a second' after the hints count. Example: 'Math Buddy - 3 hints, 1 needed a second'. Those are the Sunday page's words (week.ts:225). 'Math Buddy - 1 hint' with no second hint stays byte for byte (tv-recap-test.cjs:471). MB-B23's per-learner blocks and its naming of problems are NOT in this run: they are delivery 13-ii. | MB-B23, part 1 only | none recorded | delivered, 4e209aef (run b6742d4b) |
| RC3-a | The Earlier line reads 'N earlier' (for example '2 earlier'). Write it as JSX text beside the number: <div className="rc-earlier" data-role="recap-earlier">{n} earlier</div>. Keep the same component, class, data-role and placement, for essay readings and for maths sets. | Found by the App Master at the settlement of 13-i: the Earlier line was a template literal that case 3 of tools/tv-recap-test.cjs could not count. | raising case 3's cap to 26 to keep 'and N earlier'. Rejected because 25 words is the copy standard for this screen, and the recap is meant to be a picture. '+N'. Rejected because the recap shows no score, and '+2' can read as points. | delivered, 44a4fa85 (run a2fbef80) |
| RC3-b | Case 3 counts every static word the screen can show. A JSX text node that holds an expression counts its static words, with each {...} expression removed. An expression's value is dynamic and is not counted. The lens names are not counted today for the same reason. A string or template literal that is an element's whole child (>{`...`}<, >{"..."}< or >{'...'}<) counts its static words, with each ${...} removed. A '>' that is part of '=>' does not start a text node. So ' i ' from `(_, i) => i < t.second` is no longer counted. The cap stays at 25. Expected count at main after the change: 24. That is 13 static words, minus ' i ', plus 'earlier'; the learner's name 1; the longest caption 8; 'Not tonight' 2. If your count differs, report both counts and the reason. Do not change the cap. Put the scraper in one small function inside the test file. Add a self-test that feeds it these snippets and pins the counts: <div>and {n} earlier</div> counts 2; <div>{`and ${n} earlier`}</div> counts 2; <i>{x}</i> counts 0; (_, i) => i < t.second counts 0; <p>Back to the desk</p> counts 4. | Found by the App Master at the settlement of 13-i: the Earlier line was a template literal that case 3 of tools/tv-recap-test.cjs could not count. | none recorded | delivered, 44a4fa85 (run a2fbef80) |
| RC3-c | The test 13-i RC3 in tools/tv-recap-test.cjs pins the Earlier line with /2 earlier/, and "and 2 earlier" also matches it. Case 3 would still pass at 25 of 25 with "and" back. The pin is tightened to the tile's exact text, or it gains a doesNotMatch on "and N earlier". | Found by the App Master at the settlement of 13-i-b. | a delivery for this pin alone, now. A loose pin with no product defect behind it does not take a slot of its own. | queued, with the next delivery that touches tools/tv-recap-test.cjs |
| 13-ii-a | The recap names no problem. MB-B23's naming of the hinted problems is declined by ruling. Case 3 of tools/tv-recap-test.cjs rules no problem text, question or answer in the recap's rows, and the recap is a picture. MB-B23's own ceiling names this trade. | MB-B23, its naming half. | naming each hinted problem on the tile or on the phone line. | ruled, no change |
| 13-ii-b | The phone's per-learner Recap blocks wait for the owner's answer on ask 276c835a. The phone is sent no away work, because view() in desk/src/lib/session/pairing.ts strips away for every caller (the comment at :238, the strip at :258: `const { away: _away, week, ...seen } = s;`). The blocks need a phone-only field that view() passes, the way it passes week. view() is in the tv-phone-pairing span, and the owner is deciding how the pairing closes. | MB-B23, its per-learner half. An away slot holds a MathsSlot only (desk/src/lib/session/store.ts, the away field at about :310), and the phone reads one session. | sending the away slots to the phone. An away slot holds the other learner's pages and photos, and view() rules that no caller is sent them. | held, until the owner answers 276c835a |

Delivery 13-i and 13-i-b, as delivered (13-i: run b6742d4b, merged at 806b543e; 13-i-b: run a2fbef80, merged at bb03bd08):

- 13-i (run b6742d4b), five commits, reconciled with git cat-file -e and git merge-base --is-ancestor (all five and afe0501c exist and are ancestors of main): 4e209aef (RC1, RC2 and RC7: recapRows.ts and tv-recap-test); 8eaf85c4 (RC3 and RC4: railOf, screens.tsx, on-air.css and tv-recap-test); 2ec91176 (RC5: digest.ts, essay.ts record() only, week.ts and their tests); 75154729 (RC6: week.ts and week-rules-test); 806b543e (the BACKLOG commit: one status note on EM-B36 and one on MB-B23).
- Reconcile result: every row still had its defect on main at afe0501c, at the cited lines.
- Twelve files, +141 -29 (git diff --shortstat afe0501c 806b543e): `desk/src/design/on-air.css` (2), `desk/src/lib/desk/essay.ts` (4), `desk/src/lib/rules/digest.ts` (12), `desk/src/lib/rules/week.ts` (12), `desk/src/tv/recapRows.ts` (33), `desk/src/tv/screens.tsx` (24), `docs/BACKLOG.md` (4), `tools/essay-piece-test.cjs` (2), `tools/essay-rules-test.cjs` (2), `tools/tv-recap-test.cjs` (45), `tools/week-digest-test.cjs` (15) and `tools/week-rules-test.cjs` (15), as lines changed.
- Gate: 75 suites and 1643 tests, 0 failed, at 806b543e. tsc exited 0 for the builder and for the Director at 806b543e.
- 13-i's four questions, each ruled:
  - 1: under RC7, the S77 pin at tools/tv-recap-test.cjs :467 now carries ', 1 needed a second', because that fixture has second = 1. The brief was wrong to say that this pin held unchanged. Accepted.
  - 2: the Earlier line was written as a template literal so that case 3 could not count it. The App Master measured case 3 at 806b543e: 24 of 25. That is 13 static words, one of them ' i ' from the code (_, i) => i < t.second. Add the learner's name 1, the longest caption 8 and 'Not tonight' 2. Ruled as RC3-a and RC3-b, and delivered by 13-i-b. The cap stays at 25.
  - 3: 'paragraphs' joins the essay keys of the privacy whitelist in tools/week-digest-test.cjs test 11. Accepted, because it is a count and never text.
  - 4: RC6 retitled the pin at tools/week-rules-test.cjs :179 to the order read. Accepted.
- 13-i-b (run a2fbef80), two commits, reconciled the same way (both exist and are ancestors of main): 44a4fa85 (RC3-a and RC3-b, the code and the tests) and bb03bd08 (BACKLOG).
- Three files, +23 -6 (git diff --shortstat 806b543e bb03bd08): `desk/src/tv/screens.tsx`, `tools/tv-recap-test.cjs` and `docs/BACKLOG.md`.
- Case 3: 24 of 25 before, when it could not see the line, and 24 of 25 after, with the line counted. The cap stays at 25.
- The self-test '13-i-b' pins five counts (2, 2, 0, 0, 4).
- Gate: 75 suites and 1644 tests, 0 failed. tsc exited 0 for the builder and for the Director at bb03bd08. 0 em dashes added.
- 13-i-b's two notes, ruled:
  - (a) The scraper also drops the tail of a text node after an unclosed '{'. The brief did not spell this out, and the count of 24 needs it. Accepted.
  - (b) The BACKLOG line cites the code commit 44a4fa85, not the BACKLOG commit. Accepted.

Ruled 2026-10-11 (round 21): delivery 13 is split by shape. 13-i and 13-i-b are delivered. 13-ii-a is declined, and 13-ii-b waits for the owner's pairing answer (276c835a). 13a still waits for the owner's recap decision.

## 2. homework-page-reading

Lite r1: ready, 0.56.

Must-address:
1. value: After the first evening, 'I have homework' never asks for tonight's sheet: it opens the oldest maths page on the desk, an empty or failed one included
2. robustness: A read that comes back with zero problems is recorded as a success, so it cannot be retried in place and the only way on is a second page

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HW1 | Rework before the full round. | The process rule below: a high must-address line is reworked first. | none recorded | delivered (run 8c796090, merged 602410d7) |
| HW2 | The door opens a maths page only when one was snapped THIS evening and read with at least one problem. Otherwise it asks for tonight's photo. Older pages are not deleted. | Must-address 1. Pages live on the maths slot (`desk/src/lib/session/store.ts:371`); the read is `readPage` (`desk/src/lib/desk/read.ts:24`). | none recorded | delivered, 3a98790e |
| HW3 | A read with zero problems ends as a failed job with a reason in the desk's words, so Try again works in place on the same page id. The TV's failure line points to Try again, not to a new snap. | Must-address 2. `readPage` (`desk/src/lib/desk/read.ts:24`). | none recorded | delivered, 7e7a0740, with its tsc fix 9d735bd1 |

Implementation notes for the same rework (tasks with no choice in them, not rulings):
- robustness-2: positions are range-checked, items are not sorted by height alone, and a rule case calls `readPage`.
- craft-1, craft-2 and value-2.
- BACKLOG MB-B3, MB-B7 and MB-B43.

The BACKLOG closure is 602410d7.

Rulings at the rework's dispatch:
- (a) MB-B7 leaves the homework rework. It is the practice-paper statement picker (`desk/src/app/phone/PaperPanel.tsx`, `desk/src/lib/rules/recovery.ts`), not the page read. It is its own delivery, 4b.
- (b) craft-1's box, a top and bottom per item in the read schema, is left out. It changes the shared reader for all three subjects, and nothing measures it until vision reads a real page. Lost: building it now.
- (c) craft-6 and robustness-4 are left out as economics. They are the page photos stored as data URLs inside session.json, with no cap.
- (d) A zero-item read is a failure for every subject, not for maths only.

Second round, lite r2: ready, 0.6443, coverage 0.70, judged at 445c7bad. Scores: value 0.56, craft 0.64, robustness 0.82. Rivalry and economics are not judged in lite. Both r1 must-address lines were closed by reproduction. Vision was stubbed throughout, and no read has run with the real model on a real page.

Must-address, verbatim, both high:
1. value: The Tonight screen's first card, Back to the sheet, still opens the OLDEST maths page with problems and says "where you were"
2. craft: The printed-number sort scrambles a sheet whose sections restart their numbering at 1, for maths, English and Essay alike

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HW4 | The Tonight screen's Back to the sheet card is `continueCard` (`desk/src/tv/mathsRows.ts:118`, its `findIndex` at :132). It opens tonight's sheet by the same answer as the door, `tonightsSheet` (:21). It is offered only when that sheet was read with at least one problem. With no such sheet, the card is not offered. Older pages stay on the desk. | Must-address 1 (value-5). | A deliberate resume of an older sheet. It contradicts HW2, and its caption 'where you were' misleads. | delivered, afcb2714 |
| HW5 | The printed-number sort in `readPage` (`desk/src/lib/desk/read.ts:82`) holds only when no printed number repeats on the page. A number that repeats with the same label, or with no label, means the sheet has sections that restart. Then walk the items top to bottom by band, and left to right inside one band. A new section starts at the first item whose number and label are already in the current section. Sections keep that page order. Inside a section, items sort by printed number, and lettered parts by label. A page with no repeat keeps today's sort, so robustness-2's two-column fix stands. The rule is the same for maths, English and Essay. Known limit: two sections side by side in two columns are not split. It is stated for the full round. | Must-address 2 (craft-8). | (a) Reading order alone, which breaks a two-column section. (b) The model's own order, which is unobserved on a real page. (c) A section field in the read schema, which changes the shared reader, the same reason craft-1's box was left out. | delivered, d147fcb8 |
| HW6 | The failed-read line on the English page (`desk/src/tv/screens.tsx:122`, today 'could not read this page' followed by 'snap it again') points to Try again on the phone, as HW3 did for maths. | Lite r2 found r1 value-2 closed for maths and unchanged for English (robustness-7). | none recorded | delivered, b2c8389e |

Delivery 4a is run b5a6629d (a run id, not a commit), merged at b2c8389e. Notes from its code, checked on `main`:
- HW5 is `orderItems` in `desk/src/lib/desk/read.ts` (:71). A band runs from the first item to its band end, read left to right, and on equal x the upper item comes first.
- The robustness-2 repeat pin moved by ruling, OLD one, two, two again, three -> NEW two, three | one, two again (`tools/desk-jobs-rules-test.cjs` :560-562).
- The Essay failed-read line names the paste panel: 'Paste or type it on the phone.' (`desk/src/tv/pageLines.ts:9`, where HW6's line now lives).
- Side-by-side sections are not split. That is a ruled limit.

Left out of delivery 4a, by ruling:
- (a) robustness-6 (med): the failed-read job is session-global, so a second learner inherits a Try again that answers 409. It joins P2 in delivery 7. The one function that clears per-learner desk state on a learner change also clears this job.
  - Delivered by 7a (4fef0a35, run 3720e29a): `switchedFrom` (`desk/src/lib/session/store.ts:539`) deletes the failed jobs on a change of the seated learner, and clears the status when the status is their error.
- (b) value-6 (med): a sheet snapped at 23:50 is not tonight's at 00:10. The evening's day is the same `dayOf` that M5 uses, so a change would be one rule for both. It is stated as a limit for the full round.
- (c) MB-B3's read-rate acceptance on real pages. Only the owner can run real pages, so it is a stated ceiling for the full round, like HL7.
- (d) craft-1 band plausibility, value-3, craft-3 and craft-4 are unchanged and not in this rework.

After 4a merges, a lite r3 (the last lite round) runs, then the full round.

Superseded by the plan change (Process rulings): no lite r3 ran, and the full round followed.

Full r1 (round 2026-10-10-homework-page-reading-r1, judged at 87ec2049): ready 0.485, coverage 1.0. Scores: value 0.50, craft 0.55, rivalry 0.55, robustness 0.55, economics 0.05. The judges are uncalibrated; under a trusted state the outcome would be fail.

Must-address, verbatim, all high:
1. craft: A partial read is indistinguishable from a complete one: no completeness verdict, no check of the printed numbering
2. robustness: A good read is thrown away and reported as an unreadable page when the learner file cannot be written
3. economics: Every read adds its page photo to the session, and nothing ever removes it, so each later event costs more with no ceiling

The medium findings left open:
- craft-2, the read-state seam: A fails, B is read, and going back to A shows reading.
- craft-3, 0..1 centres against the Qwen-VL box scale (uncertain).
- craft-4 and robustness-2, the non-atomic session write and its bare catch (`desk/src/lib/session/store.ts:805`; the ruling said about :801).
- craft-5, the think:false fallback (`desk/src/lib/engines/vision.ts:48`, with the note at :4).

value-3 ('No marks were lost' while marks sit on unmapped questions, `desk/src/tv/paperRows.ts:54` and `desk/src/maths/MathsTV.tsx:716`) joins delivery 4b. value-1 (a read sheet is hinted, never marked) is BACKLOG MB-B35, and it is with the owner as a scope question. The owner holds the homework Approval until a full r2 runs.

4b, as delivered (three commits, run 56d9271f):
- 4b-1 (9875e783; MB-B15, homework full r1 value-3). The paper caption (`paperCaption`, `desk/src/tv/paperRows.ts:52`, its lines :54-57) says 'No marks were lost' only when the paper lost none. So does the TV's list fallback, the pure `paperNone` (`paperRows.ts:64`), which `desk/src/maths/MathsTV.tsx` calls (:717). When marks were lost on questions that name no statement, both name that count instead. The score card and the totals are unchanged.
- 4b-2 (4e779dd2, the MB-B7 wording). The recovery lines (`WHY` in `desk/src/lib/rules/recovery.ts`, :83) state the desk's own limits, never an exam tier. The two lines are `"out-of-over-cap": `The desk takes at most ${MAX_OUT_OF} marks for one question. Enter its parts one by one.`` (:91) and `"over-paper-total": `The desk takes at most ${PAPER_MARKS} marks for one paper.`` (:96). A statement beyond a Foundation paper is flagged 'a harder statement', on the phone (`desk/src/app/phone/PaperPanel.tsx:36`) and on the TV (`MathsTV.tsx:731`). This is a ruled departure from MB-B7. MB-B7 suggests 'harder than this list covers', but a flag on an item inside the list cannot say that the list does not cover it. So the App Master ruled 'a harder statement'.
- 4b-3 (d2276d38, the MB-B7 way in). In the phone's picker, each area is its own collapsed details element. Its summary names the area and its picks. A word box narrows the statements through `choicesMatching` (`desk/src/lib/rules/paperEntry.ts:52`). A hidden pick stays picked and listed, which is pinned by source only.
- The new cases failed on 1245013b and pass after it. The gate: 75 suites, 1374 tests.
- Still open on MB-B7: Czech task-shaped statements, the 'usually tests' list, and naming the units a pick leads to. The picker was not checked in a browser.
- MB-B7's BACKLOG status first cited the deleted branch, not its commits. 1476d461 (4d) fixed that.

Full r2 (round 2026-10-10-homework-page-reading-r2, run 18799a66, a run, not a commit; judged at c28380e2): ready 0.5125 (r1 0.485), coverage 1.0.
- Scores: value 0.50, craft 0.68, rivalry 0.50 (low confidence), robustness 0.55, economics 0.10.
- The judges are uncalibrated, so the 0.70 bar does not apply.
- No read has run with the real vision model on a real page.
- Round 1's three must-address lines did not recur.

Must-address, verbatim, both high:
1. robustness: The session write that keeps every read swallows its error with no log, and the read still reports success
2. economics: missingNumbers loops once per integer between two printed numbers the model returns, with no ceiling, and the result is stored and logged whole

Medium findings left open:
- value-retake-double-counts: after a partial read, the TV's 'take a new photo' adds a second page, so the week's digest counts a 5-problem sheet as 4 + 5 = 9, and the phone says 'Read: 4 problems' with no word of the gap. Unslotted.
- economics-2: the page photos are rewritten whole on every session event, including the timer's once-a-second tick.
- robustness-4: BUSY, a mid-read reset and the think:false fallback have no case.
- value-core-read-unrun: no real photo has been read. This is a stated ceiling, like MB-B3, because only the owner can run real pages.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HF1 | A read carries a completeness verdict built from the printed numbering. `missingNumbers` in `read.ts` (:121) does it. A number is missing when it is a whole number between two printed numbers of one run. Runs follow `orderItems`' sections: a repeated number and label starts a new run. Lettered parts count once. A run that starts above 1 has no gap before it. An item with no usable number makes the verdict unknown (null), which is not the same as complete. The page record, the route's answer, the job's done line and a server log line carry the verdict. The page screen shows `missingLine` (`desk/src/tv/pageLines.ts:16`, used at `desk/src/tv/screens.tsx:123`), which asks for a new photo and offers no Try again. | Full r1 must-address 1. | none recorded | delivered, 1d7998ff |
| HF2 | A learner-file write failure keeps the read. The page lands with its items, the job ends done, the answer is 200 with saved false, the error is logged, and the status says `READ_NOT_SAVED` (`store.ts:499`). `job.ts` is unchanged. | Must-address 2. | Failing the read, which spends another vision call on every Try again. | delivered, f071828d |
| HF3 | A learner holds at most `PAGES_KEPT` = 8 pages (`store.ts:497`). A new page past the cap drops the oldest page whole, items and photo. The page being read is never dropped. A read in place adds nothing, and `pageIx` stays on the page just read. A retry for a dropped page answers 409. Accepted limit: a saved session or away slot that already holds more than 8 pages is trimmed only when that learner next reads a new page. | Must-address 3. | none recorded | delivered, bd69ff49 |
| HF1b | The Math Buddy page screen also says `missingLine`. Maths pages render in `PageScreen` in `desk/src/maths/MathsTV.tsx` (:935-946), not in `desk/src/tv/screens.tsx`. So after HF1 a maths learner sees the missed numbers only in the bench status bar (`desk/src/app/tv/page.tsx:152`), which is not on the stage. The line shows when the page's missing list has numbers. It does not displace the reading, failed-read or hint captions. | Must-address 1 for maths, the feature's main subject. 4e's builder raised it. | Leaving the maths TV to the status bar. | delivered, 72a4aadf (run eac6191a) |
| HF4 | The session write in `desk/src/lib/session/store.ts` (today :805, `try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(store.session)); } catch {}`) publishes `session.json` through a tmp file and `renameSync`, the way `desk/src/lib/session/learners.ts` does at :145-149 (`writeBook`). A failed write is logged with `console.error` when writes start failing, and once more when they work again, so the timer's once-a-second event cannot flood the log. The store keeps whether its last write landed. The read route (`desk/src/app/api/read/route.ts`) checks it after its `page.read` dispatch (:60). When that write failed, the answer is 200 with saved false, and the done line is one authored line: 'That page was read, but the desk could not save it, so it will be gone if the desk restarts.' When the learner file failed too, `READ_NOT_SAVED` (`store.ts:499`) is said, as today. `load()` (`store.ts:686`) logs why a `session.json` that exists was not used (a parse error or a failed shape check) before it returns `fresh()`. | Full r2 must-address 1 (robustness-1), with the `load()` half of robustness-2 and craft-1. The same write is the :805 half of digest full r1 robustness-8, and the write half of learner-profile lite r1 must-address 1. HF4 delivers that half for both features. | A log line only, which keeps the torn write and still reports saved. | delivered, cfa59088 (run c448db9f) |
| HF5 | `missingNumbers` in `desk/src/lib/desk/read.ts` (:121, its loop at :126) gets a ceiling, `MISSING_SPAN` = 100. A run whose highest and lowest printed numbers are more than 100 apart makes the verdict unknown (null). This is checked before that run's loop. A list that would pass 100 numbers makes the verdict unknown too. So the loop runs at most 100 times a run, and the stored and logged list holds at most 100 numbers. The read schema (`read.ts:13`) is unchanged. | Full r2 must-address 2 (economics-1). A printed number is model output, and the schema sets no maximum on it. | (a) A maximum in the read schema, which changes what the model is asked and still trusts it to obey. (b) Cutting the list short, which would store a partial gap as if it were the whole one. | delivered, 2d794e64 (run c448db9f) |
| HF4a | The read answer carries `learnerSaved` beside `saved`. That lets the route tell a failed learner-file write (`READ_NOT_SAVED`, which wins) from a failed session write (`READ_NOT_KEPT`). Accepted as built. | HF4 said `READ_NOT_SAVED` wins. | none recorded | delivered, cfa59088 |
| HF4b | `load()` reports a throw after the parse as 'could not be read'. Accepted as built. | HF4 asked `load()` to log why a saved session was not used. | none recorded | delivered, cfa59088 |
| HF4c | Each commit carries its own tests. The HF4 commit was tested with the HF5 tests stripped. | A commit must stand alone for bisect. | none recorded | ruled, no change |

Full r3 (round 2026-10-10-homework-page-reading-r3, run f6b73d06, judged at a6e92668, a span of 20 files): ready 0.5867, coverage 0.90, uncalibrated. This was the last round.
- Scores: value 0.52 (low confidence), craft 0.58, rivalry 0.55, robustness 0.78, economics unmeasured.
- Must-address, as the round's result stores it (the line is cut short there): 'economics is unmeasured: A read consumes resources beyond the desk process: one (at most two) HTTP calls per page to a local Ollama vision model (GPU time; vision.ts:46-49) and...'
- That line was judged before EC1. EC1b (b4b4ea8f) now labels the read's vision call 'homework-read' (`desk/src/lib/desk/read.ts:97`). No later homework round exists to measure it.
- Medium findings left open, all unslotted:
  - economics-1 and economics-2;
  - value-resnap-double-count;
  - robustness-1: the read's onFail cleanup error is swallowed silently (`desk/src/lib/desk/job.ts:100`, `try { opts.onFail?.(e); } catch {}`);
  - craft-1 to craft-3;
  - rivalry-1 to rivalry-4.
- The homework Approval is the owner's to decide.

HF4 and HF5, as delivered (checked on `main` at 2d794e64):
- `writeSession` publishes through a tmp file and `renameSync`, and removes the tmp file on failure (`desk/src/lib/session/store.ts` :821 and :842).
- `console.error` fires once when writes start failing (:826) and once when they recover (:822).
- `READ_NOT_KEPT` is at `store.ts:501`. The read route chooses between it and `READ_NOT_SAVED` at `desk/src/app/api/read/route.ts:65`.
- `load()` (`store.ts:688`) logs a parse error or a failed shape check, and logs nothing when there is no file.
- `MISSING_SPAN = 100` is at `desk/src/lib/desk/read.ts:121`, with its checks at :130-131.
- The gate at 2d794e64: 73 suites, 1305 tests, wall time 113.8 s.

HF1b, as delivered (checked on `main` at 72a4aadf):
- The Math Buddy PageScreen caption chain is now: reading, failed read, hint running, hint failed, missing numbers, then under the lamp or nothing read (`desk/src/maths/MathsTV.tsx:942-947`; the missing-numbers branch is :946). It mirrors the `pageLine` chain in `desk/src/tv/screens.tsx:123`. The 'HF1b:' test in `tools/desk-jobs-rules-test.cjs` (:720) pins it.
- Accepted limit: while a page's missing list has numbers, the missing line takes the place of the 'is under the lamp' caption (`MathsTV.tsx:947`) for every problem on that page. In the band view the focused problem still shows its OK Hint chip. The homework full r2 may judge it.

Found 2026-10-11 (round 22): BACKLOG MB-B34 (2026-10-09 maths UAT, L1-nela-12-MB1-2: the homework door reopens the first sheet ever snapped) was already fixed on main by HW2 (3a98790e) and HW4 (afcb2714), through tonightsSheet (`desk/src/tv/mathsRows.ts:21`). Delivery 15 set its BACKLOG status to built (7a084ae8).

## 3. hint-lesson-discovery

Lite r1: ready, 0.5814.

Must-address:
1. robustness: One failed embedding call leaves the lesson library's vectors empty for the life of the server, so every later lesson opens at 0:00 and the engine is never asked again

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL1 | Rework before the full round. | The process rule below. | none recorded | delivered, part 1 (445c7bad) |
| HL2 | A school task that reads as neither a fractions unit nor Calculus gets a neutral school-maths stance that names no unit. The voice age stays for vojtech-18, who is declared out of segment. | value-1, MB-B8. `STANCE` in `desk/src/lib/desk/hint.ts:44`, chosen at :63-66. | none recorded | delivered, 0599317f |
| HL3 | `leaksCalc` catches a Calculus answer said in words. | robustness-2. `leaksCalc` (`desk/src/lib/rules/calc.ts:512`), called at `desk/src/lib/desk/explain.ts:224`. | none recorded | delivered, 8a568751 |
| HL4 | `embeddings.json` is written atomically and keyed by model and transcript. A truncated cache is rebuilt, not fatal. | robustness-3 and craft-2. | none recorded | delivered, 331107da |
| HL5 | The picker refuses a lesson id outside the menu it offered. | craft-1. | none recorded | delivered, 2be44253 |
| HL6 | The fractions fallback line is 25 words or fewer. | value-3. | none recorded | delivered, e3661325 |
| HL7 | The thin-evidence ceiling on the window goes into the full round as a stated ceiling. Closing it needs a bench on real transcripts, which only the owner can run: `desk/data/` is off limits to builders. | The `desk/data/` boundary. | none recorded | queued, delivery 3 |

The same rework owns MB-B2, MB-B8, MB-B16 and MB-B33. It also carries X1 (section 5).

Delivery 3 was split into two branches on one lane. Lost: one branch. The reason: MB-B2 changes the shared reader (`readQuestion` also feeds `likeTopic`), and the guard is a different shape from lessons and stance.
- Part 1 (lessons, stance and length) is run c75ab4a7, merged 445c7bad. Its commits: HL4 331107da, HL5 2be44253, HL2 0599317f, HL6 e3661325, the MB-B33 length cap d642c422 and Mic 5a2135b9, the MB-B8 grounding c7460599, and the BACKLOG notes 445c7bad.
- Part 2 (the shared leak guard: X1, X1a, X1b, X1c, HL3, MB-B16, MB-B2) is run a1f30e71, merged at 1c38f546. Its commits: X1 0af79dcd, X1a 9def48b2, X1b 42e666f7, X1c 42e666f7 (no code of its own; its guard case shares the table commit), HL3 8a568751, MB-B16 66602171, MB-B2 119988a1 with its fallback c4d9ef75, and the BACKLOG notes 1c38f546.

HL7 stays queued as a stated ceiling for the full round. A lite r2 follows part 2's merge.

Superseded by the plan change: the hint goes to its full round after 4f, with no lite r2.

Part 2 rulings:

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL8 | (part 2 Q1) ':' between two fractions reads as division on every system. | A ratio's value is the quotient, and the checks compare values. | Restricting it to cz and de now. That is one line in `taskText.plainTask` if a real sheet shows harm. | delivered, 119988a1 |
| HL9 | (Q3) The MB-B2 fallback refuses only a line that states a solution. The half that refuses a number the item's own text lacks stays unbuilt, because the full rule refused 5 of 24 real stages. It is a stated ceiling for the hint full round. | MB-B2. | The full rule. | delivered, c4d9ef75 |
| HL10 | (Q4) The leak check reads Czech 'jedna', 'jedno' and 'jeden' as 1. Accepted as a ceiling, because it only causes a refusal, the safe failure, and only when the answer is 1. | X1b. | none recorded | delivered, 42e666f7 |
| HL11 | Flag for the hint full round: tasks the reader newly reads as school (Czech fraction tasks, '3/4 : 1/2') now end as 'no lesson for this' instead of reaching the lesson picker. No test covers it, and it may be a value regression. 'Solve 3x - 7 = 11.' now takes the linear stance. | HL8 and MB-B2 widened the reader. | none recorded | judged in full r1, no change: value-5 (low) reads the school-unit skip as the more useful bridge, because Six like this takes the lesson's place; rivalry-2 (med) reads the same skip as behind on lesson coverage. Neither is a must-address line. |
| HL12 | (D2 Q3) Finding: `leaksCalc` reads windows of at most six tokens (`WINDOW = 6`, `calc.ts:498`). So a right function answer longer than that, said whole in a hint, is not refused. There are two corpus cases: the 11-token derivative of x^2 e^x sin(x), and (x^2 - 2x - 1)/(x - 1)^2 (7 tokens). fb201a90 pins them as they stand (`tools/calc-hint-test.cjs` :254-258). Decision: widen the window in its own delivery, 4f, before the hint full round. | D2 Q3. | Folding it into D2. | delivered, b3e3335e (run 57233789; the first run, 6d685adf, made no commits) |
| HL12a | The long pass also reads the line as it was before the question's own function is stripped from it, and only when the strip changed the line. It can only add refusals. The strip is `text = text.replace(piecePattern(p.toLowerCase()), " ")` (`desk/src/lib/rules/calc.ts:536`), the raw pass is `if (raw !== text && longRight(tokenize(raw))) return true;` (:607), and `raw` is set at :526. | The first 4f run stopped with no commits, because the strip erased the middle term of the 11-token corpus answer. | Leaving a right answer said in full un-refused. | delivered, b3e3335e |

HL12, as delivered (checked on `main` at b3e3335e):
- `LONG_WINDOW = 24` (`desk/src/lib/rules/calc.ts:500`), beside `WINDOW = 6` (:498).
- The D2-3 long list moved from 2 entries to `[]` (`tools/calc-hint-test.cjs`, `assert.deepEqual(long,[],'the long passes read the longer answers (HL12)')`, in the D2-3 test at :228). The old pin was `assert.deepEqual(long,['derivative x^2 e^x sin(x): 2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)','derivative (x^2 + 1)/(x - 1): (x^2 - 2x - 1)/(x - 1)^2'],'the six-token window, pinned as it stands')`. A new 'HL12:' test pins the refusals and the non-refusals.
- At b3e3335e there were 73 suites and 1297 tests.
- The accepted cost was up to +30% gate wall time. The measured change was none: 148.2 s -> 141.2 s.

Full r1 (round 2026-10-10-hint-lesson-discovery-r1, run 6cf02f5a, judged at d24f824d, a span of 31 files): ready 0.5556, coverage 0.90.
- Scores: value 0.50 (low confidence), craft 0.60, rivalry 0.55 (low confidence), robustness 0.60, economics unmeasured.
- The judges are uncalibrated.
- No real text model ran, and no lesson retrieval ran on the real transcripts. HL7 and HL9 stood as stated ceilings.

Must-address, verbatim:
1. craft: The lesson 'why' line reaches the TV past the leak rule on two input classes the hint guard covers
2. robustness: The lesson pick's 'why' skips the leak check on items the hint path does check, and the TV shows it
3. economics is unmeasured: Metered calls exist, but there are no telemetry rows and no declared price book.

Lines 1 and 2 are one defect, found by two members.

Medium findings left open, all unslotted (current lines checked on `main` at 2d794e64):
- value-1: the leak backstop (`leaks`, `desk/src/lib/rules/maths.ts:230`) misses a mixed-number sum, a Czech percent task, a Czech 'derivative of' task and an implicit dy/dx.
- craft-5: an answer written as arithmetic that evaluates to it passes, such as 'x = 2·3' (the same `leaks`, `maths.ts:230`).
- value-2: maturita shapes out of segment get no code leak check (the HL9 ceiling).
- value-3: the hint is not told which language to write in (`hint()`, `desk/src/lib/desk/hint.ts:141`).
- craft-2: nomic-embed-text is called without its search_query and search_document prefixes (`desk/src/lib/engines/embed.ts:14`; the calls are `desk/src/lib/library/lessons.ts:75` and :100).
- craft-3: the window seek has no relevance floor, and an embedder outage loses the chosen lesson (`bestWindow`, `lessons.ts:96`, its embed call at :100).
- craft-4: stage 2's 'one step further' is enforced only by the prompt (`hint.ts:163-164`).
- robustness-2: three errors are dropped with no log. One of them is the re-ask catch in `hint.ts` (:177).
- economics-2: a text call is capped only by its 90 s deadline (`DEADLINE_MS.text = 90000`, `desk/src/lib/engines/call.ts:14`).
- economics-3: `askedQ` has no length cap on the phone (`desk/src/app/phone/page.tsx:271`) or on the server (`desk/src/app/api/hint/route.ts:22`).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| HL13 | The lesson's why passes the same leak check as every hint line. `pickLesson` takes the learner's school system, and the hint route passes the system it already holds (the call is `desk/src/app/api/hint/route.ts:55`; `pickLesson` is `desk/src/lib/desk/pick.ts:24`). `checkedWhy` (`desk/src/lib/desk/pick.ts:18`, its gate at :19) drops its gate on `equationOf` or `expressionOf`. For every maths item it asks the predicate the hint uses: `leaksLine` in `desk/src/lib/desk/hint.ts` (:105-107). That is `leaks(problem, line, system)`, `leaksCalc` on the calc spec and on each part, and `leaksSchool` on the school spec, with the specs from `readQuestion(problem, system)`. Both paths call that one function, not a copy, so they cannot drift apart again. The built replacement line is checked by the same predicate, and the generic line stays the last resort. English and essay are unchanged. | Full r1 must-address 1 and 2 (craft-1, robustness-1). Stubbed probes got these whys back verbatim: 'The answer is 19.' on 'Sara has some sweets. She gives away 7 and has 12 left. How many did she start with?'; 'Chosen because x = 10 here.' on a cz learner's 'Řeš rovnici: 0,5x + 2 = 7'; 'The answer is 6.' on 'Find the derivative of f(x) = x^2 at x = 3.', for a learner on a school path. The TV shows the why (`desk/src/maths/MathsTV.tsx:1052` and :1064, and `desk/src/tv/screens.tsx:199`). The one suite case on it is `tools/withhold-rules-test.cjs` case 14 (:208), and it uses equation items only. | (a) Adding readers to `checkedWhy`'s own gate. That keeps a second predicate that can drift from the hint's. (b) Never showing the model's why, and always showing the built line. That drops a sentence that is safe on most items. | delivered, ed13a024 (run c072cd17) |

- Must-address 3 is the gap EC1 closes. It gets no hint-only rework. EC1 counts the hint's text calls (up to two per stage) and the lesson pick's call.

HL13, as delivered (checked on `main` at ed13a024):
- `leaksLine` and `Specs` in `hint.ts` (:105, :102) only gained `export`.
- `checkedWhy` in `pick.ts` has no `equationOf` or `expressionOf` gate left. It reads `readQuestion(problem, system)` and calls `leaksLine` on the why and on the built line.
- The hint route passes `system` (`desk/src/app/api/hint/route.ts:55`).
- `tools/withhold-rules-test.cjs` case 14 is unchanged, and case 16 was added.
- 73 suites, 1314 tests.
- All three leaking probes now get the built line.
- Noted, not fixed: the route proof uses the cz probe. If `leaksLine` flags 'x = 10' even without the system, that assertion does not prove the system is passed. The source diff does prove it.

Full r2 (round 2026-10-10-hint-lesson-discovery-r2, run 77dbd15a, finished by resume run 058f9e18). It was judged at e74340e8 on a span of 34 files: full r1's 31 plus `desk/src/lib/engines/meter.ts`, `desk/src/lib/engines/prices.ts` and `tools/econ-rules-test.cjs`. Drift: changed. Result: ready 0.6035, coverage 1.00, uncalibrated.
- Scores: value 0.47, craft 0.60, rivalry 0.60 (low confidence), robustness 0.75, economics 0.80.
- Must-address: none. The council ran `tsc --noEmit`, and it exited 0.
- Medium findings left open, all unslotted:
  - robustness-1: two catches drop their error silently. One is the `embeddings.json` cache write (`desk/src/lib/library/lessons.ts`, :62).
  - robustness-6: a spanned suite holds a 50 ms wall-clock bound that flakes under load.
  - craft-1: the hint and lesson-pick prompts take untrusted text with no fence.
  - craft-2: `askedQ` is neither type-checked nor capped at the route.
  - craft-3: nomic-embed-text is called without its `search_document:` and `search_query:` prefixes.
  - craft-4: two predicates decide 'is this Calculus'.
  - rivalry-2 with value-2: the 8-video library reaches almost none of the declared characters' items.
  - rivalry-3 with value-3: on an item no reader parses, a line can state the answer without 'answer' or 'x =' and pass. That includes the lesson why. This is stated ceiling 2 (`desk/src/lib/rules/maths.ts`, :246-262).
- The hint Approval is the owner's to decide.

Noted, unslotted: the hint's own leak re-ask (`hint.ts:177`) is metered as try 1, not try 2. A fix would edit `hint.ts`, which is in the hint span, so it waits until hint full r2 has run. Hint full r2 has run, so the hint span no longer holds it back. It stays unslotted.

Ruled 2026-10-11 (round 23):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| GR1 | On Get ready for school, a unit with a worked lesson (hasWorked) asks three cells: 'See how first' (prepareAsk -1, lit when the question opens, k line 'A worked lesson'), 'The usual' (0) and 'A step up' (1). Select on the first opens the unit's worked lesson exactly as Topics does (o.teach, the same /api/worked call). The TV keeps the lesson's origin in Local lessonFrom, so the lesson's Back stop, Back, Up and Menu return to Get ready for school on the same unit, with the question closed. Try six writes the usual set as before. A unit with no worked lesson keeps its two cells. The origin is kept on the TV, not in the session. | MB-B39 (L1-owen-17-MB2-8). Topics teaches first, but Get ready for school wrote the set straight away, so a learner sent there from the paper never met the lesson. | 'The usual' stays lit with the lesson beside it, rejected because a learner on a remote presses the lit cell. A lesson offered only on the road from the paper, rejected because the door does not know how it was reached, and a door that changes with the route follows a rule the learner cannot see. | delivered, 5a45e935 (run 1e81ded3, carrying 050e3253 of held run 12db6fd8); BACKLOG 0e3fa4fb |
| GR1-a | school-ruler 'W8 2' runs its two-cell block on the first prepare unit with no worked lesson, found with PR.prepareStops and hasWorked, not hard-coded (today index 4, linear-one-step). It adds a drawn block on the first unit with a lesson (today index 2, frac-add-sub). For ask -1, 0 and 1 that block asserts: 3 cells in the order lesson, usual, stretch; one thing lit, and the right one; the unit held under the question; the choiceLine; no digit on the question; and for -1, the t and k text of LESSON_CHOICE. | Delivery 16 was held on that test (about :291). It counted 2 mb-cell2 cells on focus 2, a unit with a lesson, which now rightly draws 3. The test was outside 16's paths. | Only moving the block, rejected because then nothing checks how the lesson cell is drawn (tv-keys-test checks only the keys). Only changing the count to 3, rejected because then nothing checks the two-cell question that 3 of the 17 units still ask. | delivered, 19b254ae (run 1e81ded3) |

GR1 delivers BACKLOG MB-B39 from the 2026-10-09 maths UAT, not a council finding. It is recorded here because it opens the worked lesson. GR1-a is the App Master's ruling, not the owner's.

Delivery 16 and 16a, as delivered (16: run 12db6fd8, held; 16a: run 1e81ded3, merged at 0e3fa4fb):

- 16 (run 12db6fd8) made 050e3253 (the code and the tv-keys tests) and 37b764ce (BACKLOG) on d93b6eda.
- The merge gate held 16 on school-ruler W8 2 alone: 74 of 75 suites, 1646 of 1647 tests, tsc exit 0.
- Its branch is superseded and not merged. Its held ask 1428ba2c is moot, and the owner discards it.
- 16a (run 1e81ded3) merged by fast-forward at 0e3fa4fb, in three commits. 5a45e935 is git cherry-pick -x of 050e3253 (4 files, +139 -36: keys.ts, prepareRows.ts, MathsTV.tsx, tools/tv-keys-test.cjs). 19b254ae is GR1-a (tools/school-ruler-test.cjs, +19 -2). 0e3fa4fb is BACKLOG: MB-B39 built, citing 5a45e935.
- 37b764ce was not carried, because it cited 050e3253, which is not on main.
- Reconciled with git cat-file -e and git merge-base --is-ancestor: d93b6eda, 5a45e935, 19b254ae and 0e3fa4fb exist and are ancestors of main. 050e3253 and 37b764ce exist and are not. The message of 5a45e935 says 'cherry picked from commit 050e3253...'.
- Six files, +159 -39 (git diff --shortstat d93b6eda 0e3fa4fb).
- Cites checked on main at 0e3fa4fb, none moved: LESSON_CHOICE at `desk/src/tv/prepareRows.ts:53` and choicesFor at `:56`. Local with lessonFrom at `desk/src/tv/keys.ts:41`. The teach helper's origin write at `keys.ts:246-247`. The worked handler's return to prepare at `keys.ts:492-493`. MathsTV Prepare draws choicesFor(hasWorked(at.id)) at `desk/src/maths/MathsTV.tsx:650`. The tv-keys test 'GR1: Get ready for school offers the worked lesson first (MB-B39)' at `tools/tv-keys-test.cjs:622`. The school-ruler test 'W8 2' at `tools/school-ruler-test.cjs:269`.
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1647 tests, 0 failed. tsc --noEmit --incremental false exited 0 in desk/ at 0e3fa4fb (the App Master's check; the merge gate skips typecheck and lint on this repo). 0 em dashes added.

Ruled 2026-10-11 (round 25):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| RP1 | On the paper's recovery list, Select on the lit topic opens Get ready for school on that topic's unit, at the unit's index in prepareStops. The question opens as Select on that unit would open it there. That is prepareAsk -1 (See how first, lit) when the unit has a worked lesson (hasWorked), and 0 (The usual) when it has none. While a set is written or a lesson runs (local.busy, or a practice or teach job running), Select goes to the unit with the question closed (prepareAsk null). With no topics, Select does nothing. Back and Menu close the question and land on the lit topic's unit. When the list is empty, they land on the first unit. Up, Down, Left and Right do not change, and Get ready for school's own keys do not change. No learner-facing text is added. A set is 2 presses from the list (Select, Select). It is 3 when the unit has a worked lesson (Select, Right, Select). Both are within the 3 or fewer that MB-B9 asks (C5). | MB-B9 (L1-owen-17-MB4-3, L1-radka-41-MB4-3, L1-vojtech-18-MB4-4). The paper handler only moved focus. Select did nothing. Back and Menu went to Get ready for school at focus 0 (Equivalent fractions). So the first topic's set was 7 presses away for Radka, 16 for Vojtěch and 5 to 17 for Owen. | Select writing the usual set straight from the list. It was rejected because it skips A step up and GR1's worked lesson first. Opening Topics on the unit was also rejected, because the list belongs to Get ready for school, which is where Back already went. | delivered, b3581eb2 (run 966009e3); BACKLOG b5892acc |

RP1 delivers BACKLOG MB-B9 from the 2026-10-09 maths UAT, not a council finding. It is recorded here beside GR1, because its Select opens GR1's question, with See how first lit on a unit that has a worked lesson. RP1 is the App Master's ruling, not the owner's. Ceiling, from MB-B9: the set that follows is the generic unit set unless MB-B40 is built.

Delivery 18, as delivered (run 966009e3, merged at b5892acc):

- 18 (run 966009e3) merged by fast-forward at b5892acc in two commits. It had no hold and no rebase. b3581eb2 is the code, the test and the two docs (4 files, +63 -6). b5892acc is BACKLOG: MB-B9 built, citing b3581eb2 (1 file, +1 -1).
- Reconciled with git cat-file -e and git merge-base --is-ancestor: 416e24ba, b3581eb2 and b5892acc exist and are ancestors of main.
- Five files, +64 -7 (git diff --shortstat 416e24ba b5892acc). By git diff --numstat: desk/src/tv/keys.ts 13/4, tools/maths-tv-test.cjs 47/0, docs/DESIGN-MATH-BUDDY.md 2/1, docs/STUDY-DESK-SCREENS.md 1/1, docs/BACKLOG.md 1/1.
- Cites checked on main at b5892acc: the paper handler's comment at `desk/src/tv/keys.ts:520-522` and the handler at `:523`. Prepare's own Select at `keys.ts:518`. The RP1 test at `tools/maths-tv-test.cjs:916`, straight after 'paper 8' at `:903`. The D-pad line at `docs/DESIGN-MATH-BUDDY.md:384`. The paper row at `docs/STUDY-DESK-SCREENS.md:167`. MB-B9's status at `docs/BACKLOG.md:438`, citing b3581eb2. The worked handler's Back to Get ready for school has not moved: its `if (local.lessonFrom === "prepare")` is at `keys.ts:492`, as at 416e24ba, and its nav to prepare is at `:495`. `:491` is the Back-keys condition. The brief's `:492-493` left out the nav (corrected in round 26).
- The paper that the test found: Q1 on N1 (0 of 2) and Q2 on A1 (0 of 5). N1 touches frac-equivalent (`desk/src/lib/library/gcse.ts:41`), which has a worked lesson (`desk/src/lib/library/worked.ts:10`). A1 touches linear-one-step (`gcse.ts:57`), which has no entry in worked.ts. So the test covers both of RP1's cells.
- The check before dispatch, by the round 23 and round 24 rules: only maths-tv-test 'paper 8' drives the paper keys, and it asserts the screen only. RP1 adds no learner-facing text, so it crosses no word or length bound in desk/src/lib/rules.
- The RP1 test was red on base: Select at focus 0 gave no events, where a nav was expected (18's report). It is green on main.
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1649 tests, 0 failed. tsc --noEmit --incremental false exited 0 in desk/ at b5892acc (18's builder and the settlement check; the merge gate skips typecheck and lint on this repo). 0 em dashes added.

Ruled 2026-10-11 (round 26):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| RP2 | On a paper's recovery list, a question's lost marks are shared in whole marks across the places its codes reach. The places come from the question's known codes, in its order. Each code leads to the school-path topics its statement's touches lists, in that order. A code that leads to no path topic is its own place, a Not on the desk row. A place reached twice counts once, at its first place. With L lost marks and n places, each place gets floor(L / n), and the first L mod n places get one more. A place whose total is 0 is left out before the order is computed. A place's items and codes come only from questions that gave it at least 1 mark. So the topic rows, the Not on the desk rows and the lost marks of questions with no statement add up to the paper's lost marks. The order rule does not change, and it runs on the shared totals. reachOf(codes) is exported from recovery.ts, and unitsOf in paperScore.ts reads it, so the photo path's kill figure gives the same answers. The caption does not change when the first row has the most lost. Otherwise it reads 'Start with <first>, the base for <biggest>, where most marks went.' Here <biggest> is the earliest row with the most lost whose prerequisites, followed through, include the first row's topic. Every caption is 25 words or fewer. | MB-B5 (L1-owen-17-MB4-1, L1-radka-41-MB4-2, L1-vojtech-18-MB4-2). recovery() counted a question's lost marks in full against every topic its statements touch. An N2 question at 0 of 4 gave three rows of 4 marks lost, 12 for 4. Owen's 14 rows summed to 44 for 24 marks lost, and Radka's to 30 for 28. Her words: 'when a total doesn't add up I stop trusting the whole report'. | Keep counting in full, which was rejected because the rows add up to more than the paper lost. Fractional shares such as '1 1/3 marks lost', which are exact but put a fraction on every TV row. The whole loss on one primary topic, which keeps whole marks, but the desk cannot tell which of a statement's topics a question tested. | delivered in part, ee949056 (run 26d58dd4); BACKLOG dbe87f99. MB-B5 part 2 is open. |

RP2 delivers part 1 of BACKLOG MB-B5 from the 2026-10-09 maths UAT, not a council finding. It is recorded here beside RP1, because both change the paper's recovery screen. RP2 is the App Master's ruling, not the owner's. Ceiling, from MB-B5: sharing a loss is an allocation rule, and any rule is arguable; the sum is exact, the split is a judgement. Still open in MB-B5: A4 expression questions on an equations unit, G17 volume touching area and G20 on Pythagoras, Owen's mock in 8 rows or fewer, and a statement beyond its topic listed as such.

Delivery 19, as delivered (run 26d58dd4, merged at dbe87f99):

- 19 (run 26d58dd4) merged by fast-forward at dbe87f99 in two commits. It had no hold and no rebase. ee949056 is the code, the tests and the design doc (6 files, +158 -41). dbe87f99 is BACKLOG: MB-B5 partly built, citing ee949056 (1 file, +1 -1).
- Reconciled with git cat-file -e and git merge-base --is-ancestor: 5773d558, ee949056 and dbe87f99 exist and are ancestors of main.
- Seven files, +159 -42 (git diff --shortstat 5773d558 dbe87f99). By git diff --numstat: desk/src/lib/rules/recovery.ts 48/20, desk/src/lib/rules/paperScore.ts 5/5, desk/src/tv/paperRows.ts 26/0, tools/recovery-rules-test.cjs 48/13, tools/maths-tv-test.cjs 23/2, docs/DESIGN-MATH-BUDDY.md 8/1, docs/BACKLOG.md 1/1. tools/paper-probe-test.cjs was a declared guard path and is not in the diff.
- Cites checked on main at dbe87f99: in `desk/src/lib/rules/recovery.ts`, the private prereqsOf at `:153`, destinations at `:166`, the exported reachOf at `:187`, recovery at `:207`, and the sharing line (`const dests = destinations(...)`) at `:218`. unitsOf at `desk/src/lib/rules/paperScore.ts:47`, which reads reachOf. In `desk/src/tv/paperRows.ts`, a second prereqsOf at `:54`, paperBiggest at `:67`, paperCaption at `:76` and the two-name caption at `:85`. In `tools/recovery-rules-test.cjs`, the rewritten two-codes test at `:88`, 'two statements on one topic' at `:100`, the existing prerequisite sweep at `:127-135` and the RP2 test at `:191`. In `tools/maths-tv-test.cjs`, 'paper 2' at `:800` and the RP2 caption test at `:894`. The RP2 lines at `docs/DESIGN-MATH-BUDDY.md:382-388`, under 'A paper you sat' at `:371`. MB-B5's status at `docs/BACKLOG.md:416`, citing ee949056. No cite had moved.
- The check before dispatch, by the round 23 and round 24 rules: in tools/, only recovery-rules-test, maths-tv-test (paper 1 to 8, RP1) and paper-probe-test (through unitsOf) read recovery numbers or the paper caption. No word or length bound in desk/src/lib/rules reads the paper caption.
- The older tests moved to shared values. The two-codes test: 5(b) at 1 of 4 on N10 and G20 now gives dec-convert 2 and pythagoras 1, and 7 at 0 of 2 on N3 and N4 gives 1 each. 'Two statements on one topic': an N12 item at 1 of 3 gives 1 to each of its two topics. The chain case: its N12 item was raised from 0 of 3 to 0 of 6, so pct-of-amount still carries 3. The notOnDesk test: A13 is now 2, after P8 4 and N3 3. The Foundation sweep: one lost mark for each topic a statement reaches. maths-tv-test 'paper 2': pct-of-amount 2, from 5(b), 7, with '2 marks lost'.
- The RP2 test was red on base at (a). There, the N2 item at 0 of 4 gave 4 on each of its three topics, summing to 12, where 2, 1 and 1 were expected (19's report). It is green on main. Its sweep (c) is a new seeded sweep: seed 7, 400 papers, 1 to 3 codes drawn from every statement, gap codes included. It is not the existing prerequisite sweep at `:127-135`, which draws 2 codes from touching statements only. It is wider, so it is accepted. On 19's own re-run of a seed-7 sweep, the largest paper (9 lost) had rows summing to 12 on base and 9 after.
- Found, not fixed: `paperRows.ts:54` carries its own prereqsOf, a second copy of the private one at `recovery.ts:153`. It is left for the lean lane.
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1651 tests, 0 failed (base 1649; RP2 adds 2 tests). tsc --noEmit --incremental false exited 0 in desk/ at dbe87f99 (19's builder and the settlement check; the merge gate skips typecheck and lint on this repo). paper-probe-test passed with no assertion changed. 0 em dashes added.

Ruled 2026-10-11 (round 27):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| RP3 | On a paper's recovery screen, every statement the desk has no topic for is walked by name. The D-pad is one walk: the topic rows in recovery() order, then the off-desk statements in notOnDesk order, clamped over all stops (paperStopCount). While the lamp is on a statement, the left column shows the off-desk page (maths-paper-offrows) in place of the topic rows, and the title reads 'Not on the desk yet'. The page shows five 104 px rows around the lamp. Each row has its number in the off-desk list, the can text whole in at most two lines, the lost marks, and 'From 1, 3' under them. A flagged statement's line reads 'From 2 · a harder statement'. On a statement, Select does nothing, and Back and Menu go to Get ready for school on the first unit. notOnDesk puts the most lost first. Among equal losses, a Foundation statement comes before a flagged one, and then STATEMENTS order decides. The score card adds 'N of M lost marks are not on the desk yet.'. It has a 1-of-M form, and 'The one lost mark is not on the desk yet.' when the paper lost one mark. The Not on the desk yet card gives a count, 'k statements the desk has no topic for, after the topics.', and lists no statement. PAPER_OFF is removed. The name is 26 px in 732 px of room: the 1100 px column less 4 of border, 48 of padding, the 56 px number column, 40 of gaps and a 220 px column for the lost marks and From line (OFF_NAME_PX, OFF_NAME_ROOM and OFF_CH in paperRows.ts). | MB-B13 (L1-owen-17-MB4-2, L1-vojtech-18-MB4-3, L1-owen-17-MB4-4). The card showed 3 off-desk statements, then 'and 10 more', and the D-pad walked the topic rows only. So 10 of Owen's 13 off-desk statements were named nowhere: 20 marks, quadratics and rearranging among them. Nothing said how many of the lost marks were off the desk. 74 of the 97 statements have no desk topic. notOnDesk broke equal losses by STATEMENTS order alone, so A15, a flagged statement, sat above A19, simultaneous equations at Foundation, when both lost 4. Owen's words: "And the stuff I actually need, simultaneous equations and quadratics, is in a little box on the side, and two of them are just 'and 10 more'. More what?" | A longer list in the side card. It lost because the side column is 572 px wide and a real Foundation paper has 13 or more off-desk statements. The off-desk statements mixed into the topic rows by lost marks. That lost because Select has no unit to open on them, and recovery()'s order rule would no longer hold for the list. Names clipped to one line. That lost because the can text is what the statement means, and a clipped one names nothing. | delivered, 1faea42d (run bf0eec4e); BACKLOG 61333b84; test fixes 2b0da162 and f7d59677. |

RP3 delivers BACKLOG MB-B13 from the 2026-10-09 maths UAT, not a council finding. It is recorded beside RP1 and RP2, because all three change the paper's recovery screen. RP3 is the App Master's ruling, not the owner's. Ceiling, from MB-B13: naming what the desk cannot practise does not practise it; the learner still needs a tutor for those. Known trade-offs: with the lamp on a topic, the statements are counted, not named; the caption does not change on the off-desk page.

Delivery 20, as delivered (run bf0eec4e, merged at f7d59677):

- 20 (run bf0eec4e) merged by fast-forward at f7d59677 in four commits, where its brief asked for two. It had no hold and no rebase. 1faea42d is the code, the tests and the two design docs (9 files, +197 -24). 61333b84 is BACKLOG: MB-B13 built, citing 1faea42d (1 file, +1 -1). 2b0da162 and f7d59677 each change one line of tools/maths-tv-test.cjs (+1 -1).
- Reconciled with git cat-file -e and git merge-base --is-ancestor: 419d8f3f, 1faea42d, 61333b84, 2b0da162 and f7d59677 exist and are ancestors of main.
- Ten files, +198 -25 (git diff --shortstat 419d8f3f f7d59677). By git diff --numstat: desk/src/design/maths-lamplight.css 7/0, desk/src/lib/rules/recovery.ts 3/3, desk/src/maths/MathsTV.tsx 26/8, desk/src/tv/keys.ts 4/3, desk/src/tv/paperRows.ts 30/1, docs/BACKLOG.md 1/1, docs/DESIGN-MATH-BUDDY.md 18/5, docs/STUDY-DESK-SCREENS.md 1/1, tools/maths-tv-test.cjs 101/3, tools/recovery-rules-test.cjs 7/0. desk/src/lib/rules/paperScore.ts and tools/paper-probe-test.cjs were declared guard paths and are not in the diff.
- Cites checked on main at f7d59677: in `desk/src/lib/rules/recovery.ts`, the notOnDesk doc comment at `:203-204`, recovery at `:207` and the notOnDesk sort at `:246`. In `desk/src/tv/paperRows.ts`, paperTopicCount at `:38`, paperStopCount at `:41`, OFF_NAME_PX, OFF_NAME_ROOM and OFF_CH at `:48-50`, offCountLine at `:56`, offSummary at `:64` and the second prereqsOf at `:83` (round 26 cited it at `:54`, which was right at dbe87f99). In `desk/src/tv/keys.ts`, the paper handler's comment at `:520-523`, the handler at `:524`, paperStopCount at `:525`, the topic-only lookup at `:527` and Back and Menu at `:534`. In `desk/src/maths/MathsTV.tsx`, PAPER_ROWS at `:686`, offAt at `:698`, onOff at `:699`, the title at `:704`, maths-paper-offrows at `:708`, maths-paper-offcount at `:747` and offSummary on the off card at `:752`. git grep PAPER_OFF finds nothing in desk/src. In `desk/src/design/maths-lamplight.css`, the RP3 comment and the .mb-poffrow rules at `:694-699` and .mb-pscore .off at `:708`. In `tools/recovery-rules-test.cjs`, the RP3 test at `:138` and the unchanged notOnDesk test at `:145`. In `tools/maths-tv-test.cjs`, paper 4 at `:826`, paper 6 at `:881`, paper 7 at `:917`, paper 8 at `:926`, RP1 at `:939`, rp3Paper at `:989` and RP3 a to f at `:997`, `:1015`, `:1036`, `:1048`, `:1067` and `:1076`. The paper row at `docs/STUDY-DESK-SCREENS.md:167`. MB-B13 at `docs/BACKLOG.md:457` and its status at `:460`, citing 1faea42d. In `docs/DESIGN-MATH-BUDDY.md`, 'A paper you sat' at `:371`. Three cites in that file are a line off the brief: the Right bullet starts at `:379`, the RP3 bullet at `:385` and the D-pad bullet at `:402`. The line numbers are cited as they are on main.
- The check before dispatch, by the round 23 and round 24 rules: in tools/, only maths-tv-test (paper 1 to 8, RP1 and the RP2 caption) and recovery-rules-test read notOnDesk, the off card or the paper keys. paper-probe-test reads unitsOf, which sorts its sets, so the new order does not reach it. tv-keys-test does not drive the paper screen.
- The pins that moved on purpose. Paper 4 now finds the can text on the off-desk page, drawn at focus topics.length. It keeps the apart check, 'a harder statement' and the no-'Foundation' check, and it adds 'no topic row on the off-desk page'. Paper 6 also sweeps the off-desk page of each paper that has off-desk statements. Paper 7, paper 8, RP1 and the notOnDesk test at recovery-rules-test `:145` have no assertion changed. In maths-tv-test, git removes only 3 lines, all in paper 4.
- Red on base, from 20's report and its session log: the recovery RP3 test gave A15 then A19, and RP3 a to e and the changed paper 4 failed. All are green on main. The RP3 f history, as git shows it: at 1faea42d the check read !t.includes('2014'), which looks for the digits 2014 and not for the dash. 2b0da162 made it a literal em dash. f7d59677 spells it String.fromCharCode(8212). Net: RP3 f checks for U+2014, and the added lines carry none.
- Found, not fixed: paperTopicCount (`paperRows.ts:38`) is now read by nothing in desk/ or tools/, and the ruling kept it only if something still read it. It is left for the lean lane, with the second prereqsOf at `:83`. Not seen in a browser: 20 drew no screen. It asked for a screenshot of a flagged row, whose From line wraps to two lines in the 220 px column.
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1658 tests, 0 failed (base 1651, the round 26 figure; 20 did not re-run base; RP3 adds 7 tests: 1 in recovery-rules-test and 6 in maths-tv-test). tsc --noEmit --incremental false exited 0 in desk/ at f7d59677 (20's builder and the settlement check; the merge gate skips typecheck and lint on this repo). 0 em dashes added.

Ruled 2026-10-11 (round 28):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PE1 | The rule applies only to a learner past the end of the school path. That means: on the school path, with an age on the profile, and with expectedOn(path, sys, age) equal to the path's length (pastPathEnd). With no topic secure, Topics opens on the path's last topic. With any topic secure, the frontier rule stands, and with every topic secure the focus is still 0. Get ready for school opens Prepare on the last topic's stop, whatever is secure. The line 'This path ends at <SYS_WORD of the last topic's year>; your year is past it.' replaces PREPARE_DOOR as the Get ready for school caption on Tonight. It is also a second `<p>` (maths-prepare-ends) in the Prepare lede. A prepare card prints no year word for this learner. The Topics ruler's year labels do not change. No board, exam or maturita is named. | MB-B19, from the 2026-10-09 maths UAT (L1-vojtech-18-MB2-4 and MB2-5, major; L1-owen-17-MB4-7, minor). With nothing secure, Topics and Prepare opened on the first step. The door caption said 'Pick what school is teaching next'. A 17-year-old's cards read Year 5 to Year 9. | The backlog's general rule, which opens Topics at min(expectedIndex, last) for every learner with nothing secure. It stays open, because for a younger learner it would contradict Tonight's title 'School maths, from the first step'. Also rejected: the card word 'foundations'. No year word says less and claims nothing. | delivered in part, 29cdfd86 (run 17cab0a5); BACKLOG 9fae8244, whose cite is corrected to 29cdfd86 by commit 2 of capture r28. |

PE1 is the App Master's ruling, not the owner's. Ceiling, from MB-B19: the line states the ceiling and does not move it. A maturita path is the owner's scope question.

Delivery 21, as delivered (run 17cab0a5, merged at 9fae8244):

- 21 (run 17cab0a5) merged at 9fae8244 in two commits. 29cdfd86 is the code and the tests. 9fae8244 is BACKLOG: MB-B19 built, citing 362bf7a3 (corrected by capture r28). 362bf7a3 and 821ac590 are the run's own commits before the merge gate rebased it onto 2e9504b4, which it did because Lean L3 merged first. They exist but are not ancestors of main.
- Reconciled with git cat-file -e and git merge-base --is-ancestor: 2e9504b4, bc611df3, 29cdfd86 and 9fae8244 exist and are ancestors of main.
- Seven files (git diff --numstat 2e9504b4 9fae8244): desk/src/maths/MathsTV.tsx 5/3, desk/src/tv/keys.ts 11/3, desk/src/tv/prepareRows.ts 24/1, docs/BACKLOG.md 1/1, tools/maths-course-test.cjs 1/1, tools/maths-tv-test.cjs 12/0, tools/tv-keys-test.cjs 51/2.
- Cites checked on main at 9fae8244: in `desk/src/tv/prepareRows.ts`, pastPathEnd at `:80` and pathEndsLine at `:91`. In `desk/src/tv/keys.ts`, topicsFocus at `:204`, prepareDoorFocus at `:213`, and the prepare door's nav at `:336` (the teach door's nav is at `:334`). In `desk/src/maths/MathsTV.tsx`, doorCaption at `:429` (its prepare line at `:431`), the maths-prepare-ends `<p>` at `:661`, and the prepare card's year line at `:673`, hidden when `past` is set (`past` is set at `:634`). In `tools/tv-keys-test.cjs`, the MB-B19 section from `:774`, with tests 1 to 3 at `:778`, `:797` and `:810`, and 'case 1' at `:30` (its age-12 note at `:39`). In `tools/maths-tv-test.cjs`, 'MB-B19 4' at `:1125`. In `tools/maths-course-test.cjs`, test 4 at `:105`, with the age-12 line at `:113`. MB-B19's status at `docs/BACKLOG.md:494`.
- The check before dispatch named four suites: school-ruler-test, maths-tv-test, tv-keys-test and calc-course-test. It missed maths-course-test test 4.
- Red on base: the four new tests (tv-keys-test MB-B19 1 to 3 and maths-tv-test MB-B19 4) were red on base. They are green on main.
- Q1. Fixtures were moved to age 12, with assertions and messages unchanged: tv-keys-test 'case 1' (a local age-12 session) and maths-course-test test 4. SCHOOL_P is high-school, age 16, which is past the path's end in uk. Accepted. maths-course-test.cjs was outside 21's declared paths. The merge gate checks the gates and dirty files, not declared paths, so it did not refuse the edit. It is accepted at settlement because it is the fixture move the brief allowed, and the builder listed it. The miss was in the App Master's path list. Test 4 reaches topicsFocus through tvKey on Tonight's teach stop (the teach helper, about `:107`), not by name.
- Q2. The new one-sentence check is /^[A-Z][^!?]*\.$/ and not PREPARE_DOOR's pattern, because the cz '9. ročník' contains a full stop. Accepted.
- Found, not fixed (read-only check): `docs/STUDY-DESK-SCREENS.md:163` still gives the Get ready for school caption as 'Pick what school is teaching next and practise it before the lesson.' with no path-ends case. `docs/STUDY-DESK-SCREENS.md:165` says each Prepare card has the learner's year word and that the lede is the lit unit's strand and blurb. `docs/DESIGN-MATH-BUDDY.md:197` says the year word sits below each card, and `:294` says each card has the learner's year word. PE1 changed all four for a learner past the path's end. The two files were not edited, as the brief said.
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1662 tests, 0 failed (base 1658, plus 4 new tests that were red on base). tsc --noEmit exited 0 for the builder and for the Director at 9fae8244. 0 em dashes added.

Lean L3, as delivered (run bea13399, merged at 2e9504b4):

- bc611df3 deletes paperTopicCount and its doc comment, and exports prereqsOf from recovery.ts. paperRows.ts imports it in place of its own SCHOOL and prereqsOf. By git diff --numstat a5a3d2bb 2e9504b4: recovery.ts 1/1 and paperRows.ts 1/16, plus the lean ledger files.
- 2e9504b4 is the ledger: NOTE.md 3/0, findings.jsonl 2/0, and open-backlogs.jsonl 1/1.
- L3 closes the two found-not-fixed items that rounds 26 and 27 left for the lean lane.
- Gate: 1658 tests, unchanged. tsc exited 0 for the builder and for the Director at 2e9504b4. 0 em dashes added.
- Its question, ruled: the duplicate prereqsOf row uses kind unused-local with tool duplication, because the ledger has no duplication kind. Accepted. No new kind.

## 4. Marking false ticks and false rings (practice-generation-marking)

Status of the work, checked on `main`:
- Delivery 4 (run c2f1a530, merged b5cd169e): MB-B26 e4dc93f5, MB-B27 ebdddf7c, MB-B28 9c777d5d, BACKLOG b5cd169e.
  - The linear battery judged 12,350 answers, with 0 false rings and 0 false ticks.
  - Pins moved by ruling: 'x^3 - 4ln(x) + C' for 3x^2 - 4/x, right -> not sure. The calc2-path partial-fractions answers, ln(x) -> ln|x|, and 'ln(x) - ln(x+1) + C' is now not sure. calc1-frozen.json: specs 163 -> 166, calls 3690 -> 3756, and one row right -> not sure.
- Lite r2 (2026-10-09-practice-generation-marking-lite-r2, at b2c8389e): ready 0.656, coverage 0.70. Scores: value 0.62, craft 0.72, robustness 0.62 (was 0.82). Must-address, verbatim:
  1. robustness: False ring: the right derivative of ln(1-x) is marked wrong (also ln(2-x), ln(4-x^2))
  2. robustness: False ring: a right 2-place rounding of a halfway limit or integral (0.38 for 3/8) is marked wrong
  Both were already present at b8558e80, the head the full r1 judged. So the full r1 ready does not describe the marking, and the owner was told to hold the marking Approval.
- D2 (run 7f0915e5, merged c62de4fb): D2-1 5a55d9e7, D2-2 f4a56e98, D2-3 fb201a90, D2-4 c62de4fb. 73 suites, 1285 tests. Moved pins, OLD -> NEW:
  - CHECKS x^2 on [0,1], '0.3': wrong -> not sure;
  - (1+1/x)^x, '2.7': wrong -> right;
  - MB-B28 '2.7 for e': wrong -> right;
  - calc2 (1+1/n)^n, '2.7': wrong -> right;
  - the chain fixture 'ln(x) + C' for 1/x: true -> null;
  - two calc1-frozen rows moved the same way.
- Full r2 (round 2026-10-10-practice-generation-marking-r2, run 13cf8526, judged at c62de4fb): ready 0.6433, coverage 0.90. Scores: value 0.58, craft 0.72, rivalry 0.60 (low confidence), robustness 0.70 (0.85 in r1). Economics is unmeasured. The judges are uncalibrated. Must-address, verbatim:
  1. robustness: A photo the vision engine reads as zero items is landed as a marked set, recorded, and locked against a re-snap
  2. economics is unmeasured: Metered calls exist, but there are no telemetry rows and no declared price book.
- Its other findings, and where each one went:
  - robustness-2 (no route case for a failed vision call): delivered by D3-3.
  - robustness-3, low (an empty or non-string image): delivered by D3-2.
  - value-unsure-says-different: an unsure item still tells the learner 'I got something different' (`desk/src/lib/rules/kinds.ts:163`, `desk/src/lib/rules/maths.ts:93`, `desk/src/maths/MathsTV.tsx:808-811`; the said line is built at :811). Delivered by 4d-1, 83bbe368 (run af864d93).
  - value-calc-gaps: there is no implicit differentiation shape, and the 40-character typed cap refuses a correct 45-character answer. The cap half is delivered by MK14 (6cbe3bd4, round 22). The implicit differentiation half stays unslotted, for the owner to weigh.
  - craft-1: the linear photo prompt still asks the reader to solve and judge while it copies. Unslotted.
- The owner holds the marking Approval until marking r3, which runs after EC1.
- Full r3 (round 2026-10-10-practice-generation-marking-r3, run cc346058) was judged at f06984ef on a span of 36 files. Drift: changed. Result: ready 0.6885, coverage 1.00, no must-address line, no hard failure. This was the last round.
- Scores: value 0.62, craft 0.74 (low confidence), rivalry 0.60, robustness 0.85, economics 0.70.
- Medium findings:
  - robustness-1: when a read has a duplicate item, the order decides the verdict (`desk/src/lib/desk/mark.ts`, :206; `desk/src/lib/rules/kinds.ts`, :151-152).
  - economics-1: a practice run dropped by a learner change still spends its second round.
  - economics-2: the mark route passes a photo of any size to vision.
  - economics-3: photo marking has no measured row.
  - value-1: every unsure item says 'I got something different'.
  - value-2: Calculus gaps.
  - value-3: the TV never names the typed route.
  - value-4: no MB4 recovery row leads to its practice set (`desk/src/tv/keys.ts`, :484-488).
  - craft-1: there are five decimal-comma readers, and two of them disagree.
  - craft-2: `use` is an optional free string.
  - rivalry-2 and rivalry-3.
- value-1 is the same item as value-unsure-says-different. Delivered by 4d-1, 83bbe368 (run af864d93). The rest are unslotted.
- The marking Approval is the owner's to decide.
- D3. Run d2d908e6 was held on one stale pin, at `tools/maths-rules-test.cjs:101-102`. Resolution run f29f363f added D3-5 and fast-forwarded, and it merged at f9f8276b. The commits:
  - D3-1 0b8b61fc, with its tsc fix fc113ec3;
  - D3-2 95ceb422;
  - D3-3 95d7e462;
  - D3-4 efdcdd54;
  - D3-5 f9f8276b.
  At f9f8276b: 73 suites, 1295 tests. Moved pins, OLD -> NEW:
  - `tools/maths-rules-test.cjs` (:102-104 now): the empty read resolves with 6 unsure -> it rejects EMPTY_MARK, with skill undefined, history length 0 and digest length 0;
  - calc marking tests 4 and 5 in `tools/calc-marking-test.cjs` (:203, :254 and :265): the student's answer is now '?' instead of '', which keeps their unsure purpose.

These are the App Master's rulings, not the owner's.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| MK1 | (MB-B27) An answer undefined where the truth is defined reads not sure, with a domain line in the desk's words, never wrong. The check runs one way only, so 1/x for the derivative of ln x is never refused. | Items state no domain, and on x > 0 the answer is correct. | Wrong, which would be a false ring. | delivered, ebdddf7c |
| MK2 | (MB-B28) A decimal for a limit or a definite integral is right only as the exact value correctly rounded at its own written precision, and only inside today's tolerance. calc2 `judgeLimit` takes the same rule. `ROUNDED_CLOSE` and the leak checks are unchanged. | MB-B28. | none recorded | superseded by MK5 (its tolerance clause). Delivered, 9c777d5d |
| MK3 | `chain.ts:94` is left alone in delivery 4, because it draws a pen, not a tick. | Delivery 4 scope. | none recorded | superseded by MK8 |
| MK4 | (DQ1) '2,718' in a Calculus answer reads not sure today (unreadable), which is a safe failure. The decimal comma is wanted only for an answer that is one number alone (a limit, a definite integral, an evaluation, a derivative at a point), with one comma between digits. It is never read inside an expression, where a comma separates arguments or points. | A decimal comma is a school habit in cz and de. | none recorded | delivered, 0a7c2dd5 (run 12cf4a44); the judge half is 2b1085d8 |
| MK4a | The judge reads that comma only for a learner whose school system uses a decimal comma, cz or de. This is `commaSystem` in `desk/src/lib/rules/taskText.ts` (:32), the rule school marking already applies to a typed answer (`tools/school-marking-test.cjs` :425). For us, uk and no system, the answer stays not sure, because in us and uk '2,718' is two thousand seven hundred and eighteen. | MK4 named no system. | Reading the comma for every learner. | delivered, 0a7c2dd5 (run 12cf4a44); the judge half is 2b1085d8 |
| MK4b | The leak checks stay at least as strict as the judge (the D2-3 rule, `tools/calc-hint-test.cjs` :228). A hint or explanation line that states a number answer with a decimal comma ('The limit is 2,72.') is refused for every learner, with no system needed. An added pass sends the comma-read line through the whole check once. It can only add refusals. | MK4a widens what the judge reads. | none recorded | delivered, 0a7c2dd5 (run 12cf4a44); the leak half is a2421d81 |
| MK5 | (R1a) A correct rounding of a limit or a definite integral at its own written decimals is never wrong. It is right with two or more significant figures (2.7 for e, 0.38 for 3/8, 3.0 for 3). It is not sure with fewer (0.3 for 1/3, 0.0 for 1/32). A decimal that is not a correct rounding keeps the old path: not sure inside `ROUNDED_CLOSE`, wrong outside it. One function in `calc-read.ts` decides it for both judges. D2 Q1, ruled: R1a holds literally, so a one-figure correct rounding reads not sure even inside the old window (0.4 for 0.4012). No corpus case has it. | Lite r2 must-address 2. | The old 5e-3 window running ahead of `roundsTo`. | delivered, 5a55d9e7 |
| MK6 | The judge uses one-direction defined-ness and compares only where both sides are defined. An answer defined where the truth is not is no gap. An answer undefined where the truth is defined stays MK1's not sure. So the right derivatives of ln(1-x), ln(2-x) and ln(4-x^2) are right. -ln(1-x)+C for 1/(1-x) and ln(x-2)+C for 1/(x-2) read not sure. D2 Q2, ruled: a negated answer that differs only in defined-ness now carries the 'sign' slip, and the verdict stays wrong. | Lite r2 must-address 1. | The two-way skip in `pairs()`. | delivered, f4a56e98 |
| MK7 | Accepted ceiling: ln(x+4)+C for 1/(x+4) reads right, because its gap lies outside every sample (`SAMPLES` spans about -3.32 to 4.80). `SAMPLES` is not widened. | The sample set is fixed (`desk/src/lib/rules/calc-expr.ts:704`). | Widening `SAMPLES`. | pinned as a named limit in D2: f4a56e98, `tools/calc-rules-test.cjs` :483-484 |
| MK8 | `chain.ts` takes the one-way rule. A working line that is undefined where the line before it is defined is not a clean step (null, not true). The function is `oneWay` (`desk/src/lib/rules/chain.ts:95`). The line `chain.ts:94` that MK3 named has moved. | MK3 left the pen alone in delivery 4. | none recorded | delivered, c62de4fb |
| MK9 | (DQ2) '1/abs(x)' for the derivative of ln x reads right, because it agrees with 1/x wherever ln x is defined. | The one-way rule (MK6). | none recorded | ruled, no change (no test pins it; none found in `tools/` or `desk/src`) |
| MK10 | (D2 Q4) The unsure reasons reach the learner. Today `settleSpec` in `maths.ts` (:155) drops every unsure reason (it returns null at :158 and :163), so MK1's domain line and the rounded line never reach the screen, which they were meant to. The lite r2's medium findings go with it: the /api/mark vision-failure test and the empty-image refusal. | MK1 and MK5 promised the lines. | none recorded | delivered, 83bbe368 (4d-1, run af864d93). Its /api/mark vision-failure test and its empty-image refusal were delivered by D3 (95d7e462, 95ceb422). |
| MK11 | (D3-1) A photo read with no non-blank answer to any question of the set is a failed mark. That covers no items, numbers outside the set, and every answer blank. `mark.ts` throws `DeskSaid(EMPTY_MARK)` (`desk/src/lib/desk/mark.ts:206`, the message at :211) and the route answers 502. Nothing is recorded: no history line, no digest entry, no attempt. The set stays open, so the next snap marks. Accepted limit: one non-blank matched answer still lands the set, because marking has no completeness check for a partial photo read. Pinned by `tools/calc-marking-test.cjs:368` and `tools/school-marking-test.cjs:1057`. | Full r2 must-address 1. | Landing an empty set as marked. | delivered, 0b8b61fc (tsc fix fc113ec3). Its old pin moved in f9f8276b. |
| MK12 | A candidate, from D3's answer. Finding: a typed set whose every answer is blank lands today, with a history line and a digest entry but no attempt. The phone disables Send until a box has text (`tools/phone-panel-test.cjs:289-290`), so only a raw API body can reach it. Decision: a candidate only, to refuse it 400 before the job. | none (a finding from D3, not a council line) | none recorded | delivered, 9a97c509 (4d-2, run af864d93) |
| EC1 | An economics instrument. Per-use rows carry the provider, ms, tries, the CLI envelope's usage, and failed runs. A price book is declared: the claude CLI on the subscription, and Ollama local. A measured sample is committed in the tree. It is measured live only outside any gate, and only through the claude CLI. | Full r2 must-address 2 (economics unmeasured). The homework full r1 also scored economics 0.05. | none recorded | delivered, 0ddf3c43 (run d6cc1be4) |
| MK4c | `calc2.ts` keeps its own two-line `commaSystem` copy and does not import the one in `taskText`. | `calc2-seam-test` pins calc2's imports. calc2 already rewrites `calc.ts` lines at the same seam. The MK4 parity asserts on the SEQ and AP specs catch drift. | Importing `commaSystem`, which moves the seam pin. | delivered, 0a7c2dd5 |
| EC1a | `tools/run-rules.cjs` gives each suite its own `DESK_USAGE_FILE` in a fresh temp dir, unless one is already set. Stub-engine rows then stay out of `desk/data`. | `meter.ts` falls back to `<cwd>/data/usage.jsonl` when neither `DESK_USAGE_FILE` nor `DESK_DATA_DIR` is set. The runner starts every suite with cwd `desk/`. In the main checkout, `desk/data` holds real learners. Against the unchanged runner, a gate run wrote 81 rows, all kind vision and all with no use. Case (i) in `tools/harness-rules-test.cjs` failed before the fix and passes after it. | none recorded | delivered, 90d957a9 (run 9bcde838) |
| EC1b | Labels on the remaining engine calls: 'homework-read' (`desk/src/lib/desk/read.ts:97`), 'paper-read' (`desk/src/lib/desk/paperRead.ts:53`), the three 'explain' calls (`desk/src/lib/desk/explain.ts:76`, :118 and :166), 'memory' (`desk/src/lib/desk/memory.ts:67`), 'worked-idea' (`desk/src/lib/desk/worked.ts:46`), 'english-sentence' (`desk/src/lib/desk/english.ts:33`), 'linga-check' (`desk/src/lib/english/check.ts:75`) and 'speak' (`desk/src/app/api/speak/route.ts:13`). Case i pins five of them behaviourally, and case i2 pins the rest by source. | An unlabelled call writes rows with use null, which are unattributed (`docs/economics/EC1-SAMPLE-2026-10-10.md`). | An ALS {use, job} scope in `job.ts`, which labels by context, not at each call site. It was not built. | delivered, b4b4ea8f (run ce489ee7) |
| EC1c | The seven Essay Master and Linga text calls are labelled: 'essay-read' (`desk/src/lib/desk/essay.ts:78`) and 'essay-revise' (`essay.ts:183`); 'linga-take' (`desk/src/lib/english/conversation.ts:155`), 'linga-pitch' (:214), 'linga-opening' (:235) and 'linga-cut' (:289); and on the turn call (:328) `use:action==="coach"?"linga-coach":action==="replay"?"linga-replay":"linga-turn"`. Case j in `tools/econ-rules-test.cjs` pins each label. It also pins that, in each file, the count of `await text<` equals the count of `use:` (2 in essay.ts, 5 in conversation.ts), so a new unlabelled call fails. | The same as EC1b. Digest full r3 spans essay.ts and conversation.ts, so EC1c had to merge first. | none recorded | delivered, 8583b29b (run 7a3b0529) |
| EC1c-a | Case j keeps source pins only. No ledger-row assertion through a stub provider is required for `analyseEssay` or `reviseSentence`. | Case a already proves that a use label reaches its row for any text call. Case i2 pins explain, the Linga check and speak by source in the same way. | A stub-provider row assertion. It was not attempted, and not shown to be impossible. | ruled, no change |
| EC1d | A candidate only. Two kinds of engine call still write rows with use null. Both need an `engines/` change. (1) The speech-to-text route (`desk/src/app/api/listen/route.ts:12`). `listen()` in `desk/src/lib/engines/listen.ts` (:63) takes only `timeoutMs`, so its `call()` (:64) passes no use. (2) The four live probes in `desk/src/lib/engines/health.ts` (:94-99). They run only on `GET /api/smoke?live=1`. | none (the App Master found them after EC1c) | none recorded | unslotted |
| MK10-a | (4d-1) An unsure item never says 'I got something different'. It says why the desk is not sure, in the engine's own fixed sentence: `NOT_SURE(n, why)` in `maths.ts` (:96), or `NOT_SURE(n)` with 'How did you get there?' when there is no reason. A blank answer says `BLANK(n)` (:98), for every kind. The two builders read: `export const NOT_SURE = (n: number, why?: string) => `The desk is not sure about number ${n}. ${why || "How did you get there?"}`;` and `export const BLANK = (n: number) => `Number ${n} has no answer yet.`;`. `judgeSpec` (:167) returns either the settled verdict or the unsure reason. `settleSpec` (:161) wraps it and keeps its null contract and its pins, so `explain.ts` and `judgeItem` behave as before. `judgeSet`'s unsure line comes from `unsureLine` (`desk/src/lib/rules/kinds.ts:149`). `ASK` stays only on a wrong item with no known slip. The line carries no value, no answer the learner wrote and no model text. | MK10, and value-unsure-says-different (marking full r2). That is the same item as marking full r3 value-1 and as the line half of BACKLOG MB-B1. | none recorded | delivered, 83bbe368 (run af864d93) |

EC1, as delivered:
- Four commits: fdbafce1, 1362af76, 03d2a076 and 0ddf3c43.
- `desk/src/lib/engines/call.ts` writes one row on success (:41) and one on failure (:45).
- `meter.ts` and `prices.ts` are new.
- An unreported token class and an unpriced `marginalUsd` are null, not 0, and no row holds prompt text.
- The sample (`docs/economics/EC1-SAMPLE-2026-10-10.md`): 13 claude CLI calls on haiku, 0 failures, notional total 0.0122 USD. The per-use split is in that doc.
- The gate after EC1: 74 suites, 1323 tests. After EC1c: 74 suites, 1331 tests.

MK4, MK4a, MK4b and MK4c were delivered by run 12cf4a44 in three commits: 2b1085d8 (the judge reads the comma for cz and de), a2421d81 (the leak checks) and 0a7c2dd5 (the calc2 seam). All three are on `main`.

Noted, not fixed: the middle commit a2421d81 alone fails `calc2-seam-test`, so a bisect that lands on it reads red.

Round 4 ruled the economics instrument as E1. Essay section 6 already holds E1, so from round 5 on it is EC1. Its decision is unchanged.

The economics lines of marking full r2 and hint full r1 are the same gap, and EC1 closes both.

EC1 merged at 0ddf3c43, and EC1a to EC1c finished the labels on 2026-10-10. Marking full r3 carries the sample in its economics pack.

4d, as delivered (run af864d93):
- Three commits: 83bbe368 (4d-1), 9a97c509 (4d-2) and 1476d461. The last is BACKLOG only: MB-B1 partly built, the MB-B25 note, and MB-B7 citing its commits. The brief asked for two commits, with the BACKLOG edit in the last one. The BACKLOG edit came as its own commit instead. Ruled harmless, with no rework.
- 4d-2 (MK12): `typedAnswersProblem` in `maths.ts` (:112) refuses a typed set whose every answer is empty, before the job runs. Its sentence is 'Every answer is empty. Type at least one and send again.' (:117). The mark route (`desk/src/app/api/mark/route.ts:50-51`) answers 400 with that sentence as the error. The whitespace pin in `tools/school-marking-test.cjs` moved: the all-spaces set now goes in the test 10 table as a refusal that writes no history line, and test 12's whitespace case sends 'abc' with the blank.
- The gate: 75 suites, 1377 tests.
- Question 1, ruled: the own-line checks accept any 'The desk is not sure about number N. ' prefix. Accepted, because the MK10 (b) cases pin the exact reasons.
- Question 2, ruled: on an all-blank send, the phone already shows the route's sentence (`setMsg(j.error ?? ...)` in `desk/src/app/phone/page.tsx:331`). Disabling Send there would be a nicety, and it is not slotted.
- Accepted limit: a set marked before 4d keeps its stored line.
- Still open on MB-B1: a blank as its own counted 'skipped' state, and a why on a wrong item with no slip. Still open on MB-B25: the names that `readNumber` strips.

Ruled 2026-10-11 (round 21):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| MK13 | One shared pattern ignores the name before an answer, and both reading sites in desk/src/lib/rules/school.ts use it: readInner and writtenFraction. It ignores exactly one of these: a single letter, in either case, then "=" (x is one case of it); "P(", then 1 to 20 characters with no "(", ")" or "=", then ")" and "="; "answer" or "ans", then ":" or "="; a bare "=". A two-letter name, a segment name, a name with a digit, two names, and an equation left as the answer all stay unsure. Ceiling, stated in the code: the check compares values, not names, so a wrong name with the right value is right. | MB-B25 (L1-vojtech-18-MB2-2): "c = 34 mm", "c = 34", "b = 40 cm", "P = 3/13" and "P(A) = 3/13" read as unsure. The prefix is the regex at school.ts:240, and again at :1630. If the two sites read the name differently, "c = 9/12" could read as 3/4 while its written fraction is lost. | segment names (AB =, \|AB\| =): not observed in the UAT, and an unsure is never wrong. Checking the name against the question: a school spec names no unknown. | delivered, 69f9bc52 (run e9ff4caa); BACKLOG 5773c964 |

MK13 changes what readNumber reads while the marking Approval is with the owner, and the owner is told. The said-line half of MB-B25 was built by 83bbe368 (4d-1).

Ruled 2026-10-11 (round 22):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| MK13-a | readPair keeps its own prefix pattern, which ignores only "answer" or "ans" with ":" or "=", or a bare "=". Each side of a pair goes to readNumber, which strips a name through ANSWER_NAME. So "c = 24:36" and "a = 24 and b = 36" are read side by side. A test pin for a named pair is added with the next delivery that touches tools/school-rules-test.cjs. | Delivery 14's question 1: a third copy of the name pattern, in readPair in desk/src/lib/rules/school.ts. The prefix is at school.ts:1534 and the two readNumber calls at :1539 (delivery 14 saw the prefix at :1528 on its base). | readPair sharing ANSWER_NAME. Not needed, because each side already reaches readNumber, which strips the name. | ruled, no code change; the named-pair pin is queued |
| MK14 | One cap of 120 characters for every typed answer. TYPED_ANSWER_MAX becomes 120. It stays the one number that the mark route, the second-go route and the phone's boxes read. An answer longer than the cap is refused in a plain sentence, as today. It is never cut. Why 120: a quotient-rule derivative printed plainly fits in it, and 120 is the BACKLOG's own figure. It stays under the calc reader's MAX_LENGTH of 200. A school answer longer than MAX_ANSWER (60) still reads as null, so it is unsure, never wrong. So the change can take a right answer whole, and it cannot tick a wrong one. Ceiling, accepted: the box can now hold pasted working. The check still reads one expression, so pasted working comes back unsure. The phone's character count (the second half of MB-B32) is not built here. desk/src/app/phone/page.tsx is in the tv-phone-pairing span, and the owner is deciding how the pairing closes (ask 276c835a). At 120, the box's maxLength cuts only a paste that is longer than 120. | MB-B32 (L1-matyas-19-MB3-4): a right quotient-rule derivative of 45 characters was cut at 40 and came back unsure. It is also the cap half of the marking full r2 finding value-calc-gaps. | A cap per set: 120 on sets whose items carry a Calculus spec, and 40 elsewhere. Rejected: the phone's box would need to know each item's kind, and a box with two possible limits follows a rule the learner cannot see. No cap. Rejected: the cap limits what the route takes and stores. | delivered in part, 6cbe3bd4 (run 6b9a8cda); BACKLOG 7a084ae8. The phone's character count, the second half of MB-B32, is held until the owner answers 276c835a, because desk/src/app/phone/page.tsx is in the tv-phone-pairing span. |

MK14 changes what the mark route and the second go accept while the marking Approval is with the owner, and the owner is told. It took the cap half of value-calc-gaps by the App Master's ruling at dispatch. That finding had been unslotted for the owner to weigh.

Delivery 14 and 15, as delivered (14: run e9ff4caa, merged at 5773c964; 15: run 6b9a8cda, merged at 7a084ae8):

- 14 (run e9ff4caa), two commits, reconciled with git cat-file -e and git merge-base --is-ancestor (69f9bc52, 5773c964 and fe8d218e exist and are ancestors of main; 888bb46d and 84407fd7 are not): 69f9bc52 (MK13, the code and the test) and 5773c964 (BACKLOG). The run committed them as 888bb46d and 84407fd7, and they were rebased onto fe8d218e because capture r21 merged first.
- Three files, +25 -4 (git diff --shortstat fe8d218e 5773c964): `desk/src/lib/rules/school.ts` (12), `docs/BACKLOG.md` (2) and `tools/school-rules-test.cjs` (15).
- ANSWER_NAME is `desk/src/lib/rules/school.ts:241`. The two sites that use it are readInner (`:246`) and writtenFraction (`:1636`).
- The new test 'MK13: a right answer written with its name is read (MB-B25)' is in tools/school-rules-test.cjs. It was red on base at its first positive read ('c = 34 mm' read as null).
- The spelling batteries, before and after: PYTH 81 rows and PROB 133 rows, 0 false-right, 0 false-wrong.
- Gate: 75 suites and 1645 tests, 0 failed. tsc exited 0 for the builder and for the Director at 5773c964. 0 em dashes added.
- 14's four questions, each ruled:
  - 1: the third copy of the name pattern is readPair's prefix. Ruled as MK13-a.
  - 2: the reconcile was clean at bb03bd08. The only difference was the extra site. Accepted.
  - 3: the new cases are in one new test, so the batteries' row counts did not change. Accepted.
  - 4: on base, the one test stops at its first failed assert, so its cases were not run one by one. They are red on base by construction. Accepted.
- 15 (run 6b9a8cda), two commits, reconciled the same way (6cbe3bd4 and 7a084ae8 exist and are ancestors of main): 6cbe3bd4 (MK14, the code and the tests) and 7a084ae8 (BACKLOG). The run's commits have the same SHAs, so it was not rebased.
- Five files, +20 -10 (git diff --shortstat 5773c964 7a084ae8): `desk/src/lib/rules/maths.ts`, `docs/BACKLOG.md`, `tools/calc-rules-test.cjs`, `tools/phone-panel-test.cjs` and `tools/school-marking-test.cjs`.
- Reconcile: main had 'export const TYPED_ANSWER_MAX = 40;' as briefed. It now reads 120 (`desk/src/lib/rules/maths.ts:106`).
- What reads the const: typedAnswersProblem for the mark route (`maths.ts:119-120`), the second go (`desk/src/app/api/second/route.ts:36`) and the phone's two answer boxes (`desk/src/app/phone/page.tsx:570` and `:612`).
- The pins that moved: tools/phone-panel-test.cjs (the const reads 120) and tools/school-marking-test.cjs (121 characters are refused, and 120 are kept whole). tools/maths-second-test.cjs reads the const and did not change.
- The new test 'MK14: a long right answer is taken whole (MB-B32)' is in tools/calc-rules-test.cjs. On base, its 45-and-120 assert and its 121 refusal message were red. checkAnswer's verdict on the 45-character quotient-rule answer was already right.
- The BACKLOG commit: MB-B32 built in part. MB-B25 built (83bbe368 and 69f9bc52), with its note's 888bb46d corrected to 69f9bc52. MB-B34 built (HW2 3a98790e, HW4 afcb2714).
- Gate: 75 suites and 1646 tests, 0 failed. tsc exited 0 for the builder and for the Director at 7a084ae8. 0 em dashes added.
- 15's two notes, ruled:
  - (a) A 120-character answer of digits, sent through the mark route, still reads as unsure, because of the school reader's MAX_ANSWER of 60. This is as ruled. Accepted.
  - (b) The phone's character count stays open until the owner answers 276c835a. Accepted.

Ruled 2026-10-11 (round 23):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| TN1 | The Calculus 1 topic calc1-area-so-far is named 'The integral with a variable upper limit'. Its id, blurb, sessions, sections, prereq and shapes do not change, so no learner record moves. The name reaches the model on the set request's first line ('Topic: <name>', askCalc, `desk/src/lib/desk/items.ts:239`). So the calc1-area-so-far row of tools/calc-sets-frozen.json moves on purpose. Only that row's 'Topic: ' text is edited by hand, to the new name, and nothing else in the file changes. tools/calc-sets-frozen-gen.cjs is not run, because its header says never to regenerate the file to make a row green. The 'frozen sets' test in tools/calc2-approx-test.cjs then proves, byte for byte, that no other request moved. docs/CALCULUS-1-SYLLABUS.md row :43 takes the new name. A test pins the id and the new name. | MB-B41 (L1-matyas-19-MB3-10). Topics shows 'The area-so-far function' (`desk/src/lib/library/calculus1.spine.ts:174`), the American course word that the Character names as a pet peeve. The BACKLOG asks for course-neutral words. | Regenerating the frozen file, rejected because it would hide any other request that moved. A display name kept apart from the name the model reads, rejected because one topic would have two names. 'The area function', rejected because it is still a course word, not the plain description the BACKLOG asks for. | delivered, 5899d6a9 (run aa157cdb, carrying e327aa04 of held run ce511120); BACKLOG aead4fac |

TN1 changes the words of one set request while the marking Approval is with the owner, and the owner is told. Ceiling, accepted: a neutral name may be less friendly to a first-year, and the blurb keeps the plain words.

Ruled 2026-10-11 (round 24):

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| TN1-a | The Sunday page names calc1-area-so-far 'Integral with a variable limit'. This is one entry in SUNDAY_NAMES (`desk/src/lib/rules/week.ts:88`), just before calc1-ftc. The name has 5 words, so the longest unit line ('<name>: 10 of 12 right, 10 not sure, last set.') is exactly 14 words, the LINE_WORDS bound (`week.ts:39`). It has no digit, dash, full stop, abbreviation or initialism, and it differs from the library name. The library name, the id and the blurb stay as TN1 ruled. tools/week-rules-test.cjs is not edited, because W9-lines works out the closed set itself. | Delivery 17 was held on two tests in tools/week-rules-test.cjs: test 6 'privacy and the stance' (`:192`) and 'W9-lines: SUNDAY_NAMES is closed' (`:255`). TN1's name has 7 words, so the unit line had 16, over LINE_WORDS 14. W9-lines requires SUNDAY_NAMES to hold exactly the library topics whose longest unit line would pass 14. The test was outside 17's paths. | Raising LINE_WORDS, rejected because W9-lines pins it at 14. A shorter library name, rejected because it would reopen TN1's ruled name. 'The integral with a moving upper limit', rejected because it has 7 words, so the line is 16 again. | delivered, 0b90ce11 (run aa157cdb) |

TN1-a is the App Master's ruling, not the owner's. A Sunday name is the parent page's existing closed table, which W9-lines checks and where 11 calc1 topics already had one. It is not the separate display name that TN1 rejected. That one was about the Topics screen and the name the model reads, and both still use the library name.

Delivery 17 and 17a, as delivered (17: run ce511120, held; 17a: run aa157cdb, merged at aead4fac):

- 17 (run ce511120) made e327aa04 and e68bf901 on b95e3836. e327aa04 is the rename (calculus1.spine.ts, calc-sets-frozen.json, maths-paths-test.cjs and CALCULUS-1-SYLLABUS.md). e68bf901 is BACKLOG.
- The merge gate held 17 on tools/week-rules-test.cjs alone, on two tests: 74 of 75 suites, 1646 of 1648 tests, tsc exit 0.
- Its branch is superseded and not merged. Its held ask 6be89b66 is moot, and the owner discards it.
- 17a (run aa157cdb) merged by fast-forward at aead4fac, in three commits. 5899d6a9 is git cherry-pick -x of e327aa04 (4 files, +13 -3). 0b90ce11 is TN1-a (week.ts, +1). aead4fac is BACKLOG: MB-B41 built, citing 5899d6a9 (1 file, +1 -1).
- e68bf901 was not carried, because it cited e327aa04, which is not on main. This applies the round 23 process ruling on resolution runs.
- Reconciled with git cat-file -e and git merge-base --is-ancestor: b95e3836, 5899d6a9, 0b90ce11 and aead4fac exist and are ancestors of main. e327aa04 and e68bf901 exist and are not. The message of 5899d6a9 says 'cherry picked from commit e327aa04...'.
- Six files, +15 -4 (git diff --shortstat b95e3836 aead4fac).
- Cites checked on main at aead4fac, none moved: the topic name at `desk/src/lib/library/calculus1.spine.ts:174`. LINE_WORDS = 14 at `desk/src/lib/rules/week.ts:39`, SUNDAY_NAMES at `:76` and the calc1-area-so-far entry at `:88`. In tools/week-rules-test.cjs, test 6 at `:192`, ALL_TOPICS at `:254` and W9-lines at `:255`. The TN1 test at `tools/maths-paths-test.cjs:353`. The frozen row at `tools/calc-sets-frozen.json:976`. The syllabus row at `docs/CALCULUS-1-SYLLABUS.md:43`. MB-B41's status at `docs/BACKLOG.md:620`. askCalc's 'Topic: ' line at `desk/src/lib/desk/items.ts:239`. SUNDAY_NAMES holds 12 calc1 keys (11 before 0b90ce11).
- The frozen-sets test in tools/calc2-approx-test.cjs passed after the rename, so no other set request moved (17a's report).
- Gate: node tools/worktree-preflight.cjs and npm run test:rules in desk/ gave 75 suites and 1648 tests, 0 failed. tsc --noEmit --incremental false exited 0 in desk/ at aead4fac (17a's builder and the settlement check; the merge gate skips typecheck and lint on this repo). 0 em dashes added.

## 5. student-working-explanation

Lite r1: ready, 0.5821, coverage 0.70. Tier: major, because it changes a recorded verdict from a model's transcription, on
Math Buddy's marking path.

Must-address:
1. value: The youngest Czech character cannot reach the feature in a language she can use; there is no typed path while a recogniser exists
2. robustness: The explain reply is guarded only by leak checks with reproduced holes; a reply that completes the answer in another form is shown

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| X1 | The leak gap is fixed once, in the hint rework. The explain reply is checked by the same three functions, `leaks`, `leaksCalc` and `leaksSchool`, and the council found the gap is exactly MB-B16's. The hint rework adds tests through `explainItem`, with the model stubbed. | Must-address 2, MB-B16. `desk/src/lib/desk/explain.ts:224`. | An explain-only guard. It would be a second copy of the same check. | delivered, 0af79dcd |
| X1a | On a Pythagoras item, a line that puts the item's squared total under a root is a leak, even when it does not state the root. Examples: 'the square root of 1156', 'the root of 1156', the root sign before 1156, Czech 'odmocnina z 1156'. The squared total on its own stays legitimate. | `tools/school-rules-test.cjs` `PYTH_LEGIT` (:1626) pins 'The sum of the squares is 100.' (:1628). | MB-B16's recommendation to refuse the squared total itself. It reverses a pinned design choice and leaves a second hint nothing to say on a Pythagoras item. | delivered, 9def48b2 |
| X1b | The leak checks read number words as figures before they compare. The words come from one closed table under `desk/src/lib/rules/`. English and Czech cardinals from zero to twenty, and the tens to a hundred. Fraction words from half to twentieths: Czech polovina to dvacetina, with and without diacritics, singular and plural. 'Pravdepodobnost je tri trinactiny.' on a 3/13 item is a leak. | Must-address 2. The leak checks work on figures today (`leaksSchool`, `desk/src/lib/rules/school.ts`). | Telling the model to write figures only. The guard has to hold whatever the model writes. | delivered, 42e666f7 |
| X1c | Settling from words is not widened. 'three quarters' and 'tri ctvrtiny' still settle nothing, which is the safe failure. | Marking path safety. | none recorded | delivered, 42e666f7 (no code of its own) |
| X2 | A 'Type it' control is always beside the hold-to-speak button. Today the textarea appears only when there is no recogniser. The recogniser language follows the learner's school system: cs-CZ for cz. | Must-address 1, MB-B18. `desk/src/app/phone/page.tsx:288` (`r.lang = "en-US"`) and :544-556 (textarea at :550). :288 is also MB-B33's line; whichever rework lands first sets it. | none recorded | delivered: the recogniser language in 5a2135b9 (MB-B33); the Type it control in 632287e6 (5b, run e8e43454) |
| X3 | When an explain settles an unsure item, the phone's reply and the TV's item line name the value the desk took from the learner's words, e.g. 'The desk heard 11/12.'. It is the learner's own value, so it is not a leak. When nothing settles, no value is named. | Must-address 1, second half. | none recorded | delivered, 732b8747 (5a, salvage run 62a80958) |
| X4 | The explain prompt also gets the learner's written answer, the transcribed working, and the slip and line the desk found. This comes only after X1 holds. | MB-B10. `desk/src/lib/desk/explain.ts` prompt build (about :100-127). X1 is MB-B10's own ceiling. | none recorded | delivered, 1dfcfdae (5a, salvage run 62a80958) |
| X2-a | (5b) The 'How did you get there?' block is a presentational component, `ExplainTalk` (`desk/src/app/phone/ExplainTalk.tsx`), that takes props only. With a recogniser and nothing heard, a 'Type it' button sits beside the hold button. It opens a labelled textarea, a Send button (disabled while the text is blank) and 'Use the microphone'. Without a recogniser, the textarea shows as before. The typed explanation has its own state (`typedExplain`, `desk/src/app/phone/page.tsx:55`), not Point & ask's q. It clears on a new walk item (:337), when a reply arrives (:350), and when the seated learner changes (:339). What is typed is sent as it is, in any language. The component is rendered at `page.tsx:556`. | Lite r1 must-address 1, and BACKLOG MB-B18. | The shared q state, which the no-recogniser textarea used before. | delivered, 632287e6 (run e8e43454) |
| X4-a | (5a, the builder's X4 choices, accepted) The working block goes into the prompt only when the learner wrote working. A line is named only together with the working. The slip sentence is the topic list's full 'says' text. An item with none of these sends the same prompt as before, byte for byte. | X4 named the inputs, not their shape. | none recorded | delivered, 1dfcfdae (salvage run 62a80958) |
| X5 | Before any settle, code checks the model's value against what the learner said. `saidIn(value, transcript)` (`desk/src/lib/rules/saidValue.ts:34`) folds the transcript to figures through the closed tables: `figuresOfCzech`, and the new `figuresOfEnglish` (`numberWords.ts:94`). Every digit run of the value must be among the transcript's runs. A decimal's two sides are separate runs. 'squared' or 'na druhou' adds a 2, and 'cubed' or 'na treti' adds a 3 (`saidValue.ts:41-42`). A function name in the value must be heard through one alias of its group in the closed table `FUNCTION_ALIASES` (:15; sin, cos, tan, ln or log, sqrt, e or exp, pi). A leading minus must be heard (:54). A value with no digit and no name is heard only when its whole text is in the transcript, so it fails closed when spoken. `explainItem` sets no verdict unless `saidIn` holds (`desk/src/lib/desk/explain.ts:260`): no settle, no learner record and no 'The desk heard'. The reply still shows, and the prompts are unchanged byte for byte. The X1c line in the `numberWords.ts` header (:10) is revised: a gate that can only refuse a settle may read the table. X1c stands: words never settle on their own. | Full r1 must-address 1 and 2. | none recorded | delivered, 473f4f17 and b29e67b1 (run 38d6db69) |
| X5-a | The explain route refuses a transcript that is not a string, is blank, or is longer than `EXPLAIN_TRANSCRIPT_MAX` (1000 characters, `saidValue.ts:12`). It answers 400, before any model call (`desk/src/app/api/explain/route.ts:26`). The textarea in `ExplainTalk.tsx` carries the same maxLength (:18). | Full r1 craft-2, robustness-5 (R16), economics-2 and economics-3. | none recorded | delivered, c4bd192d (run 38d6db69) |
| X5b | A function name is heard only as a whole word. `edge()` in `saidValue.ts` built its alias pattern from a template literal, and there the backslash before p{L} is dropped. So the lookarounds excluded only the characters p, {, L and }. The fix escapes the backslash (`saidValue.ts:27`). | The App Master found it when X5 settled. At c4bd192d, `saidIn` returned true for ('nevim','e^x'), ('no idea, I guessed','e^x + C'), ('I picked the answer from the list','pi') and ('I stand by it','tan x + C'). | none recorded | delivered, 9f6f38d0 (run e9761c26) |
| X5b-a | An area unit is heard when the learner says it. The exponent 2 of cm2 or m2 (also cm^2 and m²) leaves the digit runs that must be heard (`saidValue.ts:45`). The area must be said instead, in one of these ways: a heard 2 (the digit, ², 'squared' or 'na druhou'); 'square' or 'sq' before a word that starts with 'centimet' or 'met', or before 'cm' or 'm'; a folded Czech word that starts with 'ctverecn' (:49). 'square' never adds a 2 to the heard digits. W7c 9 in `tools/school-marking-test.cjs` (:1120-1121) is back to its original transcript, 'twenty-eight square centimetres'. | X5's question 3. 'twenty-eight square centimetres' failed closed on '28 cm2', and X5 had changed that fixture to 'centimetres squared'. | X5's proposal to make 'square' an exponent word that adds a 2. Then 'I took the square root' would ground a 2. | delivered, 0a5a5296 (run e9761c26) |
| X6 | `saidIn` (`desk/src/lib/rules/saidValue.ts:34`) hears a value only as the learner's own answer, in the order it was said. (a) Order. The value's digit runs must be consecutive runs of the folded transcript, in the same order. 'squared', 'cubed', 'na druhou' and 'na treti' count as a figure at the place where they are said. (b) Anchor. Those runs begin at the first figure after the last answer cue in the transcript. When the transcript has no answer cue, its runs must be exactly the value's runs. The cues are a closed table of English and Czech phrases in `saidValue.ts`, beside `FUNCTION_ALIASES` (:15), for example 'I got', 'the answer is', 'that is' and 'vyslo mi'. Bare 'is', 'equals' and '=' are not cues, because a learner who reads the question aloud says them. (c) Letters. Each single letter of the value that is not part of a function name (x, C) must be heard as a whole word. The gate can still only refuse a settle. Every row that X5 and X5b hear is still heard. | Full r2 must-address 1 and 2 (craft-1 and robustness-1). Replay R2c is ('I took five sixths and one quarter and then I got lost', 1/6). robustness-1's probes are ('I got eleven twelfths', 12/11), ('two x plus three equals eleven, I got five', 3) and ('three quarters plus one sixth, I am not sure', 3/6). Part (c) takes known limit (i), ('I am not sure, maybe e', e^x). | craft-1's own proposal, a contiguous figure match alone. It still hears 3 in 'two x plus three equals eleven, I got five'. | delivered, 025d06c3 (run af69ab78, cherry-picked unchanged from held run 0994cd5c) |
| X6-a | An item that stays unsure because its value was not heard gets one fixed line after the reply. In English, the line is X5's proposed sentence: 'The desk did not hear a final answer in that. Say or type what you got, for example: I got ...'. A learner whose school system is cz gets it in Czech. This takes known limit (iv). | X6 refuses more explanations than X5 did, so the learner needs to be told how to be heard. | none recorded | delivered, 92c8bbd1 and db28d070 (run af69ab78) |

X1 rode the hint rework (delivery 3, part 2, merged at 1c38f546). X2-X4 were delivery 5, in two parts. 5a covered X3 (732b8747) and X4 (1dfcfdae). Run 036c1dd7 was released by a usage limit with one commit, 7ef725bf. Salvage run 62a80958 cherry-picked that commit, added its fail-before evidence, fixed the maths-tv suite header and a missed calc-course pin, and then built X4. 5b was X2's Type it (632287e6, with BACKLOG at af73ca72, run e8e43454). X2's language half was already on main (5a2135b9).

The 5b gate: 75 suites, 1405 tests. In 5b, cases (a) to (d) of 'X2 Type it' were red on 7955c66d because ExplainTalk.tsx did not exist, and case (e) was red because page.tsx did not render it. While a recogniser existed, the old page offered no typed path.

A candidate for the full r1 to judge: `explainSchool`'s own format example names 11/12 (`desk/src/lib/desk/explain.ts:136`), which is the right answer of a 3/4 + 1/6 item. Because of it, 5a moved its test 11 fixture to 1/2 + 1/3. The reply's leak check still guards.

Next, ruled 2026-10-10 (round 10): under the plan change, this lite-ready major takes its full r1 after its rework, with no lite r2. The full r1 follows delivery 7d-2, because P12 (section 7) is a switch leak in this feature's own phone panel.

Full r1 (round 2026-10-10-student-working-explanation-r1, run 908c9d3a):
- It was judged at f5a854c0 on a span of 12 files: `desk/src/app/api/explain/route.ts`, `desk/src/app/phone/ExplainTalk.tsx`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/recogniserLang.ts`, `desk/src/lib/desk/explain.ts`, `desk/src/lib/rules/numberWords.ts`, `desk/src/lib/rules/voice.ts`, `desk/src/tv/mathsRows.ts`, `tools/maths-tv-test.cjs`, `tools/phone-panel-test.cjs`, `tools/school-marking-test.cjs` and `tools/voice-rules-test.cjs`.
- Result: ready 0.50, coverage 1.00, round 1 of 3. The judges are uncalibrated.
- Must-address, verbatim:
  1. 'craft: the verdict rides on a model-written value that code never grounds in what the learner said' (craft-1, high).
  2. 'robustness: A model-supplied value settles an unsure item right and writes the learner record with no check that the learner said it' (robustness-1, high).
  Both lines name one defect, and value-2 (med) names it too. In replay R2, no number was said, the stub value was 7/12, the item settled right and the record went from 2 to 3. In replay R18, the learner said 'I got five', the value was 4, and the item settled right.
- A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is X5 and X5b.
- Other findings, med unless marked:
  - robustness-2, craft-6 and value-7: explainLine shows a running job of the learner who left (P14);
  - robustness-3: a late reply on the phone (P15);
  - robustness-4, craft-4 and value-4: a verdict word or praise in a reply passes unchecked (R6);
  - craft-2 and economics-2: no cap on the transcript (X5-a);
  - robustness-5 and economics-3: an empty transcript still makes a model call and returns 200, R16 (X5-a);
  - value-3: nothing tells the model which language to reply in for a Czech learner;
  - craft-9 (low): the 'The desk heard' prefix is English;
  - craft-3: an open response schema;
  - craft-5: hold-to-speak over a recogniser that ends on its own;
  - economics-1: the cost of an explanation has never been measured.
- No member raised the 11/12 candidate (the explainSchool format example in `explain.ts`). X5 keeps it, because the gate defuses it: 11/12 settles only when the learner said 11 and 12.

X5 and X5b, as delivered:
- X5 (run 38d6db69): three commits (473f4f17, b29e67b1 and c4bd192d) and 12 files.
  - On base 1bbf359c, R2, the R2 route case, R18 and the five route refusals failed. The 1000-character control was green.
  - Eight fixtures changed their transcript only, never an assertion: `tools/maths-tv-test.cjs:950`, `tools/school-stretch-test.cjs:287` and :291, `tools/calc-course-test.cjs:312`, `tools/maths-rules-test.cjs` case 12 (:418 and :422), `tools/week-digest-test.cjs:407` (WD9) and `tools/school-marking-test.cjs` W7c 9 (the fixture is at :1120-1121 on main, back to its original transcript after X5b).
  - The gate: 75 suites, 1430 tests.
  - Its rule (v) report: all 22 calc topics pass 'I got ' plus the right answer.
- X5b (run e9761c26): two commits and three files.
  - On base c4bd192d:
    - the 8 whole-word rows that must be false were all true;
    - the 6 controls were already right;
    - of the area rows that must be true, four were false, and 'centimetres squared' and '28 cm2' were already true;
    - the 4 area rows that must be false were already right.
  - No suite relied on the broken boundary.
  - The gate: 75 suites, 1432 tests.
  - The App Master ran tsc --noEmit at 0a5a5296: exit 0.
- Known limits, unslotted:
  (i) A value whose only grounding is a function name is heard on that name alone. 'I am not sure, maybe e' grounds e^x, and 'sin(x) + x cos(x)' is heard from 'sine x plus x cosine x' with no figure to anchor it. The letters of a value (x, C) are not checked, because a spoken-letter fold was ruled out of X5.
  (ii) '+∞' (calc1-continuity) fails closed when spoken as 'infinity', which is the safe failure.
  (iii) Any heard 2 grounds an area unit.
  (iv) X5's proposed not-heard sentence is not built: 'The desk did not hear a final answer in that. Say or type what you got, for example: I got ...'.
  Round 12: X6 (c) takes limit (i), and X6-a takes limit (iv). Limits (ii) and (iii) stay unslotted.

Next, ruled 2026-10-10 (round 11): the full r2 follows 7d-4 (P16, section 7), because `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs` are in this span. The r2 span adds `desk/src/lib/rules/saidValue.ts`. Full councils still run one at a time.

Full r2 (round 2026-10-10-student-working-explanation-r2, run a7fb68b4):
- What was judged: 44cbbca1, a span of 14 files (r1's 12 plus `desk/src/lib/rules/saidValue.ts` and `tools/school-rules-test.cjs`). The App Master derived the span.
- The result: ready 0.5575, coverage 1.00, round 2 of 3. The judges are uncalibrated. There was no hard failure and no floor hit. Scores, with the delta against r1: value 0.50 (+0.05), craft 0.57 (+0.02), rivalry 0.55 (+0.05), robustness 0.70 (+0.15), economics 0.50 (+0.05).
- The gates: the merge gate record of run 5ad42cde was cited (75 suites, 1438 tests, 0 failed). The council's own tsc run exited 0. Lint is unmeasured.
- The evidence: L1 plus 29 stubbed replays. No real voice and no real model reply have been observed.
- r1's two lines: closed as worded. A value with no ground in the transcript no longer settles anything. Replays R2 (no number said, stub 7/12), R18 ('I got five', stub 4), R18c ('I got three', stub -3) and R20b (Calculus 'I am stuck', stub 6x + 2) do not settle. Controls R1, R2b, R18b, R20, R21 and R21b settle when the value is said.
- The must-address lines, verbatim:
  1. craft: The grounding gate checks the value's digits as an unordered set, so a value pieced together from numbers the learner said settles and is recorded
  2. robustness: saidIn grounds a model-written value on its digits as a set, so a value assembled from numbers the learner said but did not give as their answer settles the item and writes the learner...
  robustness-1's full title (`verdict-robustness.json`): 'saidIn grounds a model-written value on its digits as a set, so a value assembled from numbers the learner said but did not give as their answer settles the item and writes the learner record'.
- The defect: both lines name one defect in `desk/src/lib/rules/saidValue.ts`. The value's digit runs are checked as an unordered set (the transcript's runs at :40, the value's runs at :48, the membership test at :50). Replay R2c: 'I took five sixths and one quarter and then I got lost' with stub value 1/6 settled wrong, with slip top-not-scaled, and the record went from 8 to 9. robustness-1's pure probes of `saidIn` returned true for ('I got eleven twelfths', 12/11), ('two x plus three equals eleven, I got five', 3) and ('three quarters plus one sixth, I am not sure', 3/6).
- The line: A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is X6 and X6-a.
- The findings below the must-address, one line each:
  - a reply that says the answer is right, or praises, passes unchecked (R6): robustness-2 (med), value-2 (med), craft-2 (med), rivalry-2 (low);
  - the reply language for a Czech learner, and the English fixed lines: value-1 (med), craft-8 (low);
  - the economics findings: economics-1 (med, no measured row for an explanation), economics-2 (med, the most expensive call shape), economics-3 to economics-6 (low);
  - craft-3 (med, the forgeable prompt fence), craft-4 (med, hand-concatenated prompt families), craft-5 (med, Chrome's server recogniser by default), craft-6 (med, the value is read back after the commit) and craft-7 (med, `n` means two things);
  - rivalry-1 (med): behind Khan Academy Explain Your Thinking, because each explain send is one stateless turn;
  - robustness-3 (med): the gate was cited, not run.
- Correction: the App Master's r2 brief said that a second try is another model call. It is not: `sendSecond` posts to /api/second, which code judges with no model call (economics-3). Only re-sending an explanation makes another explain call.
- The value member proposed three branches (czech-learner-explains, spoken-calculus-expression, blank-item-explained). They are unmeasured, and no `.personas/council/state.json` declares them.
- Correction (round 13): the r2 brief named the four known limits and told the council to judge each on the evidence, only not to seed them into a pack. Round 12 said they were kept out of every pack, which was wrong.

Next, ruled 2026-10-10 (round 12): X6 and X6-a are one delivery after 7d-5 (P17, section 7), because the delivery lane carries one branch at a time and 7d-5 was ruled first. The full r3, the last full round, follows its merge. Full councils still run one at a time.

X6 and X6-a, as delivered (three commits, run af69ab78):
- Held run 0994cd5c (status partial). Its gate was red only on `tools/calc-marking-test.cjs` test 4, which asserted the bare reply on an unsure item where X6-a now adds `NOT_HEARD_LINE`. That file was outside the run's declared paths. It was a paths miss in the App Master's brief, not a flake.
- Fix run af69ab78. 025d06c3 and 92c8bbd1 are 0994cd5c's 458f4112 and 34dcddbf, with equal git patch-ids (3e12ea2c0be6 and ce92a0a5f65c). db28d070 adds the line to calc-marking test 4's assertions, plus one import. On main the import is at `tools/calc-marking-test.cjs:27`, and the two assertions are at :252 (the route reply and `items[3].reply`) and :261 (the 'no idea' reply). Each now expects `M.NOT_SURE(...)+' '+NOT_HEARD_LINE.en`.
- Refinements ruled at dispatch:
  - 'got' is a whole-word cue;
  - (c) checks only the letters x, y, z, t, n and C, never unit letters;
  - an area unit's 2 or 'squared' belongs to the unit.
  Kept at settlement: a leading 'x =' in a value needs no spoken x. This was the builder's own judgement.
- The builder's report-only answers, from the run results:
  - 'I got five, that is it' is refused, because the last cue has no figure after it;
  - 'the derivative of x squared is 2x' is refused, because it has no cue and more figures than the value;
  - Czech letter names ('iks', 'ce') are not heard as letters;
  - two fixtures changed 'the first one gets...' to 'I got...': `tools/school-rules-test.cjs` (:1970) and `tools/school-marking-test.cjs` (W7c 9, :1114).
- The gate: 75 suites, 1472 tests. The merge gate skipped typecheck, and the App Master ran tsc at db28d070: exit 0.

Full r3 (round 2026-10-10-student-working-explanation-r3, run dff24ac2), the last full round:
- What was judged: db28d070, a span of 16 files (r2's 14 plus `tools/maths-rules-test.cjs` and `tools/calc-marking-test.cjs`). The App Master derived the span.
- The result: ready 0.5805, coverage 1.00, round 3 of 3. The judges are uncalibrated. There was no hard failure and no floor hit. Scores, with the delta against r2: value 0.55 (+0.05), craft 0.55 (-0.02), rivalry 0.60 (+0.05), robustness 0.72 (+0.02), economics 0.50 (0.00).
- The gates: the merge gate record of run af69ab78 was cited (75 suites, 1472 tests, 0 failed). The council's own tsc run exited 0. Lint is unmeasured.
- The evidence: L1 plus 44 stubbed replays. No real voice and no real model reply have been observed.
- r2's two lines: the mechanism is closed, and the defect is open. Replays A1 to A5 are refused. A6, A7 and A8 settle wrong and write the record. Their transcripts: A6 'I got stuck on five sixths' and A7 'that is five sixths take away a quarter and I do not know' (both quoted in the report); A8 'three x squared plus two x' on a Calculus item (`Differentiate f(x) = 3x^2 + 2x.`), with stub value `3x^2 + 2x` (the report names A8 only as a Calculus function read aloud; the transcript is in the round's `evidence/replays/README.md`).
- The must-address line, verbatim from result.json: 'craft: A model-written value enters the learner record on a lexical figure match, with no quoted span and no confirmation'.
- Craft files it as high (craft-1), and robustness files it as med (robustness-1). Craft's direction: derive the value from an exactly aligned quoted span of the learner's words, or ask for a one-tap confirm on the phone before a settle.
- The not-heard line: replays C1 (cz) and I3 (en) show it, with nothing settled and the record unchanged. A wrong item gets no line (C3).
- The findings below the must-address, one line each:
  - robustness-1 (med): `saidIn` fails open when figures follow an answer cue but are not the answer, or when a read-aloud expression is the whole transcript, and no test row covers it;
  - value-false-settle (med): an unsure item can still be settled wrong on numbers that were not the learner's answer;
  - value-worst-branch (med): a learner who narrates the working first is not heard on the first send;
  - value-verdict-words (med): a reply that praises or judges is not caught in code (D4);
  - value-cz-reply-language (med): the model is never told which language to reply in for a Czech 12-year-old, and the desk's own lines around the reply are English (craft-2 med, C4, D2);
  - craft-3 (med): the never-a-verdict rule lives only in the prompt; craft-4 (low): the guillemet fence can be closed by the learner's text; craft-5 (low): the late-reply guard is a hand-copied closure; craft-6 (low): no test names the false admissions in craft-1; craft-7 and craft-8 (low);
  - rivalry-1 (med): one stateless turn where the rivals hold a conversation; rivalry-2 (med): Mathspace grades every line of working in code; rivalry-3 and rivalry-4 (low);
  - economics-1 (med): no measured price for an explanation; economics-2 (med): the reply has no length cap; economics-7 (med): the usage ledger cannot show what a failed explanation spent; economics-3 to economics-6, economics-8 and economics-9 (low);
  - robustness-2 to robustness-5 (low).
- The value member proposed five branches (`cz-young-voice` 0.50, `working-first-narration` 0.40, `en-teen` 0.60, `calc1-university` 0.50 and `parent-beside`, unmeasured). They are unmeasured, and no `.personas/council/state.json` declares them.
- This was the last full round. A fourth is refused, so the high line goes to the owner as a decision beside the Approval, not to a rework round.

Next, ruled 2026-10-11 (round 13): the owner decides craft-1 beside the r3 Approval. The App Master asked the owner to choose between a confirm on the phone before a settle, never settling from an explanation, and accepting it as a known limit. No rework is slotted until he answers.

## 6. essay-paragraph-analysis

Lite r1: ready, 0.5179. Tier: major (key goal 5).

Must-address:
1. value: Under Structure, a planted unsupported claim before the evidence is passed and the wrong sentence is marked
2. value: A whole piece is ruled paragraph by paragraph: every intro thesis and conclusion link comes back faulty, and 'Start with paragraph k' points at it
3. value: Out-of-segment text (Czech) is read with full confidence: the desk never says it reads English before it rules
4. robustness: A paragraph of a piece that fails to come back is never said on the TV

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| E1 | Under Structure, an evidence observation names the claim it backs (`supports: n`). Code checks that n is a claim, and rules a claim strong only on evidence that names it. With no link the verdict is neutral, never strong by position. | Must-address 1. `desk/src/lib/rules/essay.ts`: the claim branch (:297-302) takes any marked evidence after the claim, up to the next claim, as support. | Position as the only link. | delivered, 0a148283 and aa1e46d9 (run 93e16c60) |
| E2 | A piece is ruled once, over the observations of all its paragraphs, after they all come back. The per-paragraph model calls stay. 'Start with paragraph k' shows only after that ruling. Case 9 of `tools/essay-piece-test.cjs` (:99) changes openly, with the reason. | Must-address 2. Case 9 pins "Structure runs per judged paragraph". | none recorded | delivered, da4379a8 (run 93e16c60) |
| E3 | Before any verdict or count, code (no model) decides whether a paragraph is English. A paragraph that is not is said to be so plainly, on the TV and on the phone, and is not ruled (W6 R4). In the same branch, the splitter and the plan accept a sentence that opens with a capital outside A-Z. | Must-address 3. | none recorded | delivered, 803c6075 and 5cca409b (run e7bdaf06) |
| E4 | A failed paragraph is drawn as 'not read', with a way to send it again, never as pending. Its sentences leave the summary's count, and the summary names it. | Must-address 4. | none recorded | delivered, dd230dc0, a34a0333 and b0f4b718 (run e7bdaf06) |
| E1-a | The Structure observation gains an optional integer `supports`. It counts on a sentence observed as evidence, and on a sentence observed as a claim that backs an earlier claim (a body paragraph's point backing the thesis). Code accepts n only when n is another sentence of the reading that the model observed as a claim. Anything else is no link. A claim is strong when a marked evidence observation names it, or when a claim that is strong that way names it (one level). A claim that nothing names is neutral when an evidence observation between it and the next claim carries no accepted link, because code cannot tell what that evidence backs. Otherwise it is unsupported, and the first unsupported claim is faulty, as now. The evidence and link rules are unchanged. | Must-address 1. E1 as the App Master reads it, ruled at the dispatch of 6a. | none recorded | delivered, 0a148283 and aa1e46d9 (run 93e16c60) |
| E1-b | A verdict keeps the link its observation carried (`supports` on Verdict and VerdictLike, set only for an accepted link). A Structure rewrite is ruled against the kept links: contextObservations returns each sentence's kept link with its job. | E1. A rewrite is ruled on regex roles (contextObservations), so without the kept link a rewritten claim could never be strong. Lite r1 value-4 names the same seam. | none recorded | delivered, 0a148283 and aa1e46d9 (run 93e16c60) |
| E2-a | analysePiece keeps each paragraph's observations. It calls decideVerdicts once, after the last paragraph, over every paragraph that came back, with the whole piece as context. While the piece is being read, its progress has no verdicts and its summary names no paragraph to start with, and the TV draws every paragraph of it as pending. The one-paragraph path and record() keep their shape. | Must-address 2. E2, ruled at the dispatch of 6a. | none recorded | delivered, da4379a8 (run 93e16c60) |
| E1-c | A thesis that no later claim names stays unsupported. It is faulty when it is the first unsupported claim, as before E1. E1-a's wording stands. The essay full r1 judges it on the evidence. | 6a's report-only answer 1. When the body claims name the thesis, it is strong. When none does, it is faulty, because no unlinked evidence sits between it and the next claim. | a thesis neutral whenever a later claim exists | ruled 2026-10-11, no build |
| EM-B21 | The splitter splits before any Unicode uppercase letter or an opening „. The plan's capital check accepts the same opening. The abbreviation join is unchanged. | E3's second sentence. Also kristyna-17 R3 and R6 (uat/runs/2026-10-09-essay-l1/kristyna-17--EM1.md) and lite r1 robustness-4. | none recorded | delivered, 775cb383 (run e7bdaf06) |
| E3-a | One pure rule decides, with no model, whether a paragraph reads as English. It says not English only when it can tell: at least 6 words, a share of common English function words under a floor, and a Czech signal over a floor (words with Czech diacritics, or common Czech function words). Anything else is English, a short paragraph included. The line is one constant: 'Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.' One paragraph is refused with that line before any run, as an over-long one is. A piece whose every paragraph is not English is refused the same way. Otherwise a paragraph that is not English gets no model call and no verdict, and is listed in piece.notEnglish. EM-B4's notice on the Essay tab, the lens home and Dictate is not built here. EM-B22 stays declined. | Must-address 3. E3 as the App Master reads it, ruled at the dispatch of 6b. | none recorded | delivered, 803c6075 and 5cca409b (run e7bdaf06) |
| E4-a | One pure rule gives a piece paragraph's state: pending while the piece is still being read, then read, not read (failed) or not English. The TV map and rail draw that state. On the forensic page, a sentence of a paragraph that was not ruled shows 'Not read' and that paragraph's line, never 'Neutral'. A failed paragraph's line is 'Paragraph k did not come back. Send it again from the phone.' The summary's head counts only the sentences of ruled paragraphs, and names each paragraph that was not ruled, with its line. The history line counts the same. To send it again, the phone offers 'Read the paragraphs that did not come back' on a piece that is done and has a failed paragraph. Only the failed paragraphs are asked again. The observations of the read paragraphs, kept on the piece, are reused. The piece is ruled once, and the reading's history line is restated in place, as a rewrite restates it. This is refused before any run while the piece is being read, when nothing failed, and once a sentence of the piece has been rewritten. | Must-address 4. E4, ruled at the dispatch of 6b. | reading the whole piece again, which asks every paragraph again and writes a second history line | delivered, dd230dc0, a34a0333 and b0f4b718 (run e7bdaf06) |
| E2-b | While a piece is being read, a rewrite is refused before any run with 'The desk is still reading your piece. Rewrite a sentence once every paragraph is read.' The phone's rewrite panel says so and disables Send. The piece's summary counts nothing and reads 'Reading paragraph k of N.' The phone marks as read only the paragraphs the reply lists as read. | 6a's report-only answer 3 and its second deviation. During the read, the phone offers a rewrite against a reading with no verdicts, and the summary opens '0 of N sentences to fix'. | none recorded | delivered, 5cca409b and b0f4b718 (run e7bdaf06) |
| E3-b | When the desk refuses a reading before any run, the TV says the refusal's line, whichever door sent it. The plan's Read it is the door that says nothing today. | 6b's report-only answer 3. The plan's Read it (`desk/src/tv/keys.ts:427`, the kind essay call) posts with no onFail. `runStep` (`desk/src/tv/keys.ts:565`) reads only the ok flag (:571). The route refuses before runJob, so nothing reaches the TV. E3 says the line is said on the TV and on the phone. | none recorded | delivered, 4a2fbbc9 (run 9c07044c) |
| E4-b | A sentence of a paragraph the desk did not rule has no rewrite. The route refuses its rewrite with 400 before any run, with that paragraph's line. On such a sentence, the TV's Rewrite door puts the same line on the status line instead of the rewrite prompt. | 6b's report-only answer 2 and question 1. The Rewrite door posts `rewriteStatus(n)` without checking the paragraph (`desk/src/tv/keys.ts:450`, `rewriteStatus` at :188), and the route's rewrite would give that sentence its first verdict. E3 and E4 say such a paragraph is not ruled. | a rewrite that rules the sentence alone | delivered, b2779744 (run 9c07044c) |
| E4-c | The rail draws a paragraph that was not ruled from a rule on data-state in `desk/src/design/essay-specimen.css`, not from an inline opacity. | 6b's question 4. That file styles only data-pending (:134), so 6b dimmed the rows inline (`desk/src/essay/EssayTV.tsx:366`). | none recorded | delivered, 3b97c46d (run 9c07044c) |
| E3-b-a | The route says the line, not keys.ts. In analyse/route.ts, when a reading is refused before any run with a line for the learner, the route also dispatches { type: 'status', text: <that same line> } before it answers. The TV's status line then shows it, whichever door posted the reading. This is the line the plan screen already uses for planStatus. These refusals, and only these: essayTooLong and NOT_ENGLISH_LINE on a kind essay reading; pieceProblem and NOT_ENGLISH_LINE on a kind piece reading. The answer itself does not change, neither its status nor its body. These refusals dispatch nothing: 409 NOBODY_AT_DESK, 428 TEXT_NOTICE (the phone's one-time notice), a refusal from keeping the text (addPiece or addVersion), and the rewrite and piece-again refusals. If it helps, put the dispatch and the answer in one small helper in the route. Give it a name that does not clash with refused from @/lib/desk/job. E3-b changes nothing in keys.ts, runStep, Io or desk/src/app/tv/page.tsx. | E3-b, ruled at the dispatch of 6c | an onFail in keys.ts. runStep reads only the ok flag, so an onFail carries no line. Carrying one would change Io and the TV page, and the TV page is in the pairing span that is under review. | delivered, 4a2fbbc9 (run 9c07044c) |
| E4-b-a | Add one pure rule to desk/src/lib/rules/essay.ts, for example rewriteUnruledLine(reading, n). When unruledCaption gives a caption for the paragraph of sentence n, the rule returns that caption's text. It returns null for a ruled paragraph, for a reading with no piece, and for an n the reading does not have. The route's rewrite branch checks the rule after the E2-b check and before revise(). When the rule gives a line, the route answers 400 { error: line }. There is no run, no job and no model call, and the reading is unchanged. The forensic Rewrite door in keys.ts uses the rule on the sentence at forensicAt. When it gives a line, the door posts { type: 'status', text: line }. Otherwise it posts rewriteStatus(n), as today. Next sentence still walks every sentence. The phone (desk/src/app/phone/page.tsx) does not change. It shows the route's line through its existing error path. Say in result.json where. | E4-b, ruled at the dispatch of 6c | none recorded | delivered, b2779744 (run 9c07044c) |
| E4-c-a | In essay-specimen.css, next to the data-pending rule, add a rule on the rail row for data-state not-read and not-english, with opacity .4 (the value drawn today). Remove the inline style from the rail row at EssayTV.tsx:366, and remove the variable that only fed it. Nothing else in EssayTV.tsx changes, and the map's g (about :263) stays as it is. | E4-c, ruled at the dispatch of 6c | none recorded | delivered, 3b97c46d (run 9c07044c) |
| E3-c | E3-c. On the Essay Master home (screen essaytype) and on the plan (screen essayplan), the stage's caption slot says a refusal line the desk gave before any run, with the label 'Not read'. These are E3-b's lines: NOT_ENGLISH_LINE, the line essayTooLong gives, and each line pieceProblem can give. Once the session's status changes, the caption goes back to what it says today. | 6c's report-only answer 1 (the status line is drawn only in the bench bar, which fullscreen hides) and its question 2. | drawing the bench's status line on the stage for every app | delivered, 706588fe (run 36036ff6) |
| E3-c-a | In desk/src/lib/rules/essay.ts, add one pure rule: refusalCaption(status: unknown): { label: string; text: string } \| null. It returns { label: 'Not read', text: status } when status is exactly one of those lines. Otherwise it returns null. The rule recognises the lines from the module's own sources. Lift each line that essayTooLong and pieceProblem return into a named constant or builder beside them, and have both the function and the rule use it. Do not change one character of any line. No other file matches on this English text. In EssayTV.tsx, add one branch to each of two caption chains: EssayType's chain (const cap, about :143): right after the failed-job branch (:144), before at === 'plan'. EssayPlan's chain (const cap, about :210): right after the failed-job branch (:211), before here >= 0. Each branch is refusalCaption(s.status). A running job still wins, because its branch comes first. Nothing else in EssayTV.tsx changes. The caption slot and its CSS already exist (essay-specimen.css:119-124), so add no CSS. | E3-c, ruled at the dispatch of 6d | none recorded | delivered, 706588fe (run 36036ff6) |
| E5 | The Evidence lens rules an opinion by a link the model names, not by its position. In desk/src/lib/desk/essay.ts, OBSERVED.evidence (:26) adds backs: { type: 'integer' }. OBSERVE.evidence (:32) adds this one sentence: 'For a checkable sentence that backs an opinion in the same paragraph, add backs: the number of that opinion.' In desk/src/lib/rules/essay.ts decideVerdicts, the evidence branch (:353-358) replaces the positional rule at :356 with rules (a) to (e). They are decided per paragraph (s.para). A single paragraph is one paragraph. (a) Code accepts backs: n only when all of these hold: the observation's support is checkable; n is an integer; n is not the sentence itself; n is in the same paragraph; and the model observed n as opinion. Anything else is no link. (b) An opinion is backed when a marked checkable sentence names it through an accepted link. Marked means the EVIDENCE marker, as today. A backed opinion is neutral, as a backed opinion is today. (c) Take a paragraph where at least one marked checkable sentence carries an accepted link, and an opinion nothing names. It is neutral when a marked checkable sentence between it and the next opinion carries no accepted link, because code cannot tell what that evidence backs. Otherwise it is unbacked. The FIRST unbacked opinion among the judged sentences of the paragraph is faulty, with a new check line, CHECKS.unbacked: 'No checkable sentence here backs this opinion.' Later unbacked opinions are neutral. This mirrors the Structure rule at :363-368. (d) A paragraph with a marked checkable sentence but no accepted link at all: code cannot tell what the evidence backs, so every opinion is neutral. (e) A paragraph with no marked checkable sentence: every opinion is faulty with CHECKS.opinion, as today. Checkable and context sentences keep today's rule (:354). An accepted link rides on the verdict as supports, the same field Structure uses (:380). A rewrite keeps the link. On the Evidence lens, contextObservations (:474-480) returns a sentence whose verdict kept a supports link as { n, support: 'checkable', backs: <that link> }, whatever its first-pass role. Other sentences come back as today. Update the decideVerdicts header comment (:315-316) to state (a) to (e). | Full r1 must-address 1 (value-1). | naming the model's field supports on Evidence too, because the lens already has support, and two names one letter apart read as one to a model; every unbacked opinion faulty, because it marks the closing link a paragraph is meant to end on; the position rule with a shorter window, because it is still positional | delivered, 8bb84552 (run 541b1f74) |
| E6 | Under a verdict that code decided, the words are code's. In decideVerdicts (:376-378), a faulty verdict's note is always the failed check's line. The model's note is not kept on a faulty verdict. Strong and neutral verdicts keep the model's note, as today. Every faulty path already sets check. Add a test that fails if a faulty verdict has no check line. The check line is now always the caption, so it must name what code found. CHECKS.word speaks of a vague word. A repeated word gets its own line, CHECKS.repeated(word): ''<word>' is used again here; say it once or find another word.' Add a new pure helper to rules/essay.ts: summaryLine(a), for a reading (sentences, verdicts, summary, piece). A piece keeps its summary unchanged. It already leads with code's count. One paragraph with at least one sentence leads with code's count, in the history line's words: 'N of M sentences to fix.' ('sentence' when M is 1). The model's summary follows when it is not empty. A reading with no sentences returns its summary unchanged. In desk/src/essay/EssayTV.tsx, the 'Last verdict' caption (:149) draws summaryLine(a), not a.summary. desk/src/lib/desk/spoken.ts (:13) speaks summaryLine on forensic. The stored summary does not change, so the route's status line and the stored reading stay as they are. The forensic caption at EssayTV.tsx:416 needs no change. It draws the note, which on a faulty verdict is now code's. | Full r1 must-address 3 (craft-2). | a second model call after ruling, to narrate the verdict, because it costs one more call per reading and per paragraph of a piece, and the prose is still the model's; the model's note kept as secondary text under 'Look again · the problem', because praise would still sit beside the problem | delivered, 4158321b and 03f16e2a (run 541b1f74) |
| E7 | A reading that leaves a judged sentence unanswered fails and records nothing. Today the rewrite door already works this way (desk/essay.ts:234-235). In desk/src/lib/rules/essay.ts, add a pure exported helper unanswered(lens, judged, observations): number[]. It returns the judged sentence numbers, in ascending order, that have no readable observation. It reads observations the way decideVerdicts builds its by map (rules/essay.ts:331-335): the FIRST observation with a numeric n wins for that n. A number is unanswered when that first observation is missing or fails observationOk(lens, o). An observation for a number outside judged does not count. In desk/src/lib/desk/essay.ts judge() (:62-87), right after seen is built (:84), compute the unanswered numbers for lens.id and judged. If any are unanswered: log one server line with console.error that names the lens and the sentence numbers, never sentence text, a note or the summary; then throw new DeskSaid(NOT_EVERY_SENTENCE), importing DeskSaid from './job', as desk/mark.ts:38 does. Export NOT_EVERY_SENTENCE from desk/essay.ts: 'The desk did not get a reading of every sentence, so it counted nothing. Send it again.' Write a one-line JSDoc above it, as EMPTY_MARK has at desk/mark.ts:210-211. Consequences, all from paths that exist today: a one-paragraph reading fails through runJob, its status line is NOT_EVERY_SENTENCE, and record() is never reached; a paragraph of a piece goes to piece.failed through the catch at :153, and the piece is recorded with only the paragraphs that were ruled; a send-again paragraph stays failed through the catch at :183. Do not change those catches. The request must make full coverage reachable: in schemaFor (:36-43), each lens marks its own deciding field required beside n and note (structure job, argument side, evidence support, language issues), while supports, turnsBack, backs and fix stay optional, and reviseSchema reuses this and gets it too, which is intended; OBSERVE.language (:33) replaces 'Report no issue for a sentence that has none' with 'For a sentence with no issue, give issues: []'; the judge system prompt gains one sentence: 'Give one observation for every sentence you are asked to judge.' Do not change the 'For a faulty verdict only' wording (craft-3), which is a later row. Keep the request text that tools/econ-rules-test.cjs:186-187 asserts byte for byte: 'schema: schemaFor(lens), model: "best", use: "essay-read",' closing the call, and the same for essay-revise. | Full r1 must-address 2 (craft-1). | a fractional floor, because a missing sentence would still count as clean; ruling the answered sentences and marking the rest not read, because it adds a sentence state that no screen draws | delivered, a374b1f2 (run f699c29c) |
| E8 | A failed save after a rewrite or a send-again is logged and said. It does not fail the rewrite or the send-again. Export two lines from desk/essay.ts: REWRITE_NOT_SAVED: 'That rewrite was read, but the desk could not write it to the learner file, so the history still shows the old count.' and PIECE_AGAIN_NOT_SAVED: 'Those paragraphs were read, but the desk could not write them to the learner file, so the history still shows the old count.' reviseSentence and analysePieceAgain each gain one optional last parameter, notSaved?: (line: string) => void. Existing callers stay valid. The catch at :241 (restateReading) and the catch at :192 (restatePiece) each become a catch that does two things: it logs one console.error line naming which door (a rewrite or a send-again) and the first line of the error's message, cut to 120 characters, as job.ts:89 does, never learner text; and it calls notSaved with LEARNER_UNREAD_RUN (from ../session/store) when the error is a LearnersUnread (from ../session/learners), otherwise with that door's line. restateReading or restatePiece returning early because no history line matched is not a failure. It gets no log and no line. In desk/src/app/api/analyse/route.ts, the rewrite branch (:52-60) and the piece-again branch (:68-73) each keep a local notSaved line, set through the callback. Each done status becomes: notSaved when it is set, otherwise today's status. The run still succeeds: 200, the verdicts on the desk, the same response body, no Try again. This mirrors SETTLE_NOT_SAVED in desk/src/app/api/explain/route.ts:36-43. Change nothing else in the route. | Full r1 must-address 4 (robustness-1). | failing the rewrite on a failed save, because the learner would pay for the same model call again, and it would fail the same way | delivered, 74f1ab6f (run f699c29c) |
| E9 | Code writes the essay summary, using only the verdicts it decided. The model is no longer asked for a summary. In desk/src/lib/rules/essay.ts, summaryLine(a) (:441-450) becomes the single source of every essay summary. It reads only a.sentences, a.verdicts and a.piece. It never reads a.summary. Its parameter type is widened as needed: sentences carry para, and piece is a PieceLike. One paragraph: the head is 'N of M sentences to fix.', today's words. When N is 1 or more, add ' Start with sentence n: <note>', where n is the first faulty sentence in sentence order and note is that verdict's note, which is code's check line (rules/essay.ts:418). When that note is empty, add ' Start with sentence n.' When N is 0, the head stands alone. A piece that is still being read (pieceBeingRead) returns pieceReadingLine(piece). This is E2-b and does not change. Any other piece starts with today's head and unruledLines (desk/essay.ts:165 and :212). When a faulty verdict exists, add ' Start with paragraph p, sentence n: <note>' for the first faulty sentence in sentence order, numbered as the TV numbers it. A piece that is not ruled yet has no verdicts and keeps the head alone, as today. No sentences: ''. Its JSDoc is rewritten to say all of this. In desk/src/lib/desk/essay.ts, judge() no longer asks for a summary. In the system text, 'Then one summary sentence. ' is deleted and 'Plain text, to be read aloud.' stays. In the focus prompt, 'The summary is about that paragraph.' is deleted. summary is dropped from schemaFor's properties and from its required list, and from judge's return value and its text<> type. analyseEssay, analysePiece (pieceSummary and now()), analysePieceAgain and reviseSentence each set the summary of the reading they return to summaryLine(that reading). The EssayAnalysis.summary field stays, because store.ts is not edited. It now holds code's line. The summaries arrays and the kept-summary regex at :196 are deleted. After this change nothing parses a summary. The request text that tools/econ-rules-test.cjs:186-187 asserts byte for byte is kept. The 'For a faulty verdict only' wording and PATTERN_RULE are not changed. That is craft-3, a later row. In desk/src/tv/landingRows.ts:148, when the seated learner's own reading has sentences, the essay line is firstSentence(summaryLine(own)). Otherwise today's history and lens fallbacks stay. It never reads own.summary. In desk/src/lib/rules/voice.ts:58, the essay manner drops 'the summary is one plain sentence too'. The sentence about notes stays. Nothing else in that file changes. desk/src/app/api/analyse/route.ts reads a.summary for its done statuses (:76, :109, :123). After E9 that field holds code's line, so no route change is expected. The route changes only if a test proves it must. desk/src/lib/desk/spoken.ts and desk/src/essay/EssayTV.tsx already call summaryLine and are not edited. An older stored session can hold model prose in its summary. Every surface now reads summaryLine, so that prose never shows. | Full r2 must-address 1 (craft-2). | A narration pass given the decided verdicts: it adds one best-model call to every reading, and economics is already the lowest dimension at 0.45. Keeping the model's line, shown only after the count: r2's FV-structure replay shows this still contradicts the verdicts: '2 of 2 sentences to fix. Excellent work, ...'. | delivered, ccfc2409 and 7f1ebd5c (run 2cb1d267, cherry-picked from 52152c3a and 4a716e85 of run d2f9e78d) |
| E9-a | A reading with no sentences speaks nothing, and nothing reads a.summary. In tools/part-names-test.cjs test 2, the one forensic assertion is replaced by two. A reading with sentences and verdicts speaks code's summary line and not the model's prose. A reading with no sentences speaks an empty string. | Run d2f9e78d was held on tools/part-names-test.cjs:54, outside its paths. Ruled at the dispatch of 6h. | a reading with no sentences keeps a.summary, because an older stored session can still hold model prose in that field, and reading it would reopen craft-2 | delivered, e4ef2e93 (run 2cb1d267) |

Ruled 2026-10-11 (round 15): delivery 6 is split by shape. 6a rules the reading (E1, E1-a, E1-b, E2 and E2-a). 6b draws a paragraph that is not ruled, on the TV and on the phone (E3 with EM-B21, and E4). The essay full r1 follows 6b, with no lite r2, by the plan change.

Delivery 6a, as delivered (three commits, run 93e16c60, merged at da4379a8):

- Commits: 0a148283 (E1, E1-a, E1-b); aa1e46d9, which spells the pinned em dash of the two essay prompts in `tools/voice-rules-test.cjs` as an escape, because 0a148283 had added it literally; da4379a8 (E2, E2-a, case 9). Reconciled with git cat-file -e and git merge-base --is-ancestor: 0a148283, aa1e46d9, da4379a8 and 4193c55e all exist and are ancestors of main. The run's own commits (2f05a554, 6bcc5c58, 9cd5182b) are the same work before the merge.
- Seven files, +186 -34: `desk/src/essay/EssayTV.tsx`, `desk/src/lib/desk/essay.ts`, `desk/src/lib/rules/essay.ts`, `desk/src/lib/session/store.ts`, `tools/essay-piece-test.cjs`, `tools/essay-rules-test.cjs` and `tools/voice-rules-test.cjs`.
- `tools/essay-ui-test.cjs` was declared and not touched. It is a live-model script, not a rules suite. The pending pin lives in `tools/essay-piece-test.cjs` through paragraphPending() (`desk/src/lib/rules/essay.ts:338`), which EssayTV calls twice (`desk/src/essay/EssayTV.tsx:257` and `:362`). Ruled: the live script is not changed.
- As built, on main: decideVerdicts (`desk/src/lib/rules/essay.ts:270`) accepts a link through linkOf (:279). The neutral exception counts marked evidence only (:316), because unmarked evidence never made a claim strong. This is the App Master's reading of E1-a, accepted. judge returns its observations unruled when given a focus (`desk/src/lib/desk/essay.ts:62`, :85). analysePiece rules once, at the last paragraph (`desk/src/lib/desk/essay.ts:147`).
- Fail-before (result.json redOnBase). In `tools/essay-rules-test.cjs`, red on base: 'E1-a supports 3 / supports 1', 'E1-a no link: 1 neutral, 2 strong, 3 faulty', 'E1-a refused links' (its context-sentence assertion only), 'E1-a strong-claim naming, no chains', 'E1-b verdict keeps accepted link', and 'E1-b rewrite against kept links (contextObservations)'. Guards that passed on base: 'E1-a three bare claims', and the loop over itself, outside and non-integer supports in 'E1-a refused links'. 'E1-b reviseSentence wired through reading.verdicts' was written after the wiring, so its red is the contextObservations case. In `tools/essay-piece-test.cjs`, red on base: case 9 (changed), 'E2 section A piece', 'E2 progress has no verdicts / Start with', 'E2 failed paragraph', and 'E2 paragraphPending + EssayTV uses it'.
- Changed assertions: essay-master-A case 1 (b) gained `supports:1`, and case 9 changed openly (four bare claims give 1 faulty, 2/3/4 neutral, and the record reads '1 of 4 sentences to fix, 2 paragraphs'). `tools/voice-rules-test.cjs` changed only for the new Structure sentence.
- Gate: 75 suites and 1529 tests (1517 on the base); tsc exited 0 for the builder, and for the Director at da4379a8; the econ and kpi pins are green and unedited; 0 em dashes added.
- Report-only answer 1: with all three body claims naming the thesis it is strong; with none naming it, it is faulty ('This claim has no evidence after it that a reader can check.') and every other sentence is strong; with one naming it, it is strong. Ruled as E1-c.
- Report-only answer 2: no reader outside the essay files uses `supports`. Others read only n, verdict and was (`desk/src/app/api/analyse/route.ts:47`, `desk/src/tv/keys.ts:176`, :184, :185, `desk/src/tv/landingRows.ts:143`). It shows only in the session snapshot JSON.
- Report-only answer 3: `desk/src/app/phone/page.tsx` draws no verdicts or 'Start with' for a piece, but the phone offers a rewrite panel (onSentence :204, panel :630, send :215-216) during the read. Ruled as E2-b.

Ruled 2026-10-11 (round 16): 6b carries EM-B21, E3 with E3-a, E4 with E4-a, and E2-b. The essay full r1 follows 6b.

Delivery 6b, as delivered (six commits, run e7bdaf06, merged at b0f4b718):

- Commits: 775cb383 (EM-B21); 803c6075 (E3, E3-a); dd230dc0 (E4, E4-a, the drawing and the counts, and 6a's pending assertion changed openly); a34a0333 (E4-a, send it again); 5cca409b (E2-b, with a paragraph that is not English decided up front); b0f4b718, a follow-up. `tools/phone-panel-test.cjs` cuts sendRewrite and readPiece out of `desk/src/app/phone/page.tsx` and runs them with a fixed list of names. So the send-it-again block moved, and readPiece names the unruled paragraphs inline. The builder changed the source, not that suite. Reconciled with git cat-file -e and git merge-base --is-ancestor: 775cb383, 803c6075, dd230dc0, a34a0333, 5cca409b, b0f4b718 and 4ef795f0 all exist and are ancestors of main. The run's own commits (6e76683c, 0b13082d, 73e64cc3, 8a8ce6f7, 109fe65e and b250eea3) exist but are not ancestors of main: they are the same work before the rebase onto 4ef795f0.
- Eight files, +444 -31 (git diff --stat 4ef795f0 main): `desk/src/app/api/analyse/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/essay/EssayTV.tsx`, `desk/src/lib/desk/essay.ts`, `desk/src/lib/rules/essay.ts`, `desk/src/lib/session/store.ts`, `tools/essay-piece-test.cjs` and `tools/essay-rules-test.cjs`. In store.ts only the EssayAnalysis interface changed: piece gains notEnglish and observed.
- As built, on main: splitParagraph splits before any `\p{Lu}`, `"`, `“` or `„` (`desk/src/lib/rules/essay.ts:35`), and planFill's opening check accepts the same (:546). paragraphIsEnglish (:148) uses ENGLISH_MIN_WORDS 6 (:143), ENGLISH_FLOOR 0.15 (:144) and CZECH_FLOOR 0.25 (:145). NOT_ENGLISH_LINE (:124) is 'Essay Master reads English writing. This paragraph is not in English, so the desk did not read it.' pieceBeingRead (:373), pieceReadingLine (:378) and REWRITE_WHILE_READING (:384) say a piece is being read. paragraphState (:391) and unruledCaption (:406) give the state and the caption. pieceAgainOffered (:412) and pieceAgainProblem (:421) rule send it again. The piece-again branch of `desk/src/app/api/analyse/route.ts` starts at :54, and analysePieceAgain is `desk/src/lib/desk/essay.ts:170`.
- The floors (report-only answer 1): the Czech texts read an English share of at most 0.08 and a Czech signal of at least 0.38. The 21 English paragraphs of the two suites read a lowest English share of 0.11, which is under the English floor, and a highest Czech signal of 0.10. The two floors act together. They are set on a small corpus and are not tested on real learner writing.
- Fail-before (result.json acceptance_red_first). In `tools/essay-rules-test.cjs`, red on base: the EM-B21 splitSentences case (2 where 4 expected), the EM-B21 planFill case, 'E4-a paragraphState, unruledCaption, ruledSentences/unruledLines' and the E2-b case for pieceBeingRead, pieceReadingLine and REWRITE_WHILE_READING (each a TypeError, the function missing). In `tools/essay-piece-test.cjs`, red on base: E3 kind essay with R7 (502 where 400 expected), E3 piece of R4 and R7 only (502), E3 English/R7/English (3 calls where 2 expected), E4 failed paragraph 2, E4-a piece-again after paragraph 2 failed (502 where 200 expected) and its fails-again case, E4-a four refusals (502 where 400), E4-a phone button, E2-b Reading paragraph k of N, E2-b rewrite while being read (502 where 400) and E2-b phone reads reply piece.read. Guards that passed on base: 'E3 all-English piece has no notEnglish', and the E3-a corpus loop. The E3-a rule cases (R4, R7, R4 without diacritics, Zizek/Emile, a two-word paragraph, odd input) were written after the rule, because the floors had to be set on the corpus, so they never ran red. On the base the function did not exist. The App Master accepted this.
- Changed assertions: the two in `tools/essay-piece-test.cjs`, both in the test 'E2: the TV draws every paragraph ... pending'. The assertion that a failed paragraph stays pending (paragraphPending(P([0,2],[1]),1) true) now asserts false. The count of paragraphPending( in EssayTV.tsx (2) is now a count of paragraphState( (2). The reason of both is E4: a failed paragraph is drawn as not read, never pending, once the piece is done.
- Gate: 75 suites and 1550 tests (1529 at da4379a8); tsc exited 0 for the builder, and for the Director at b0f4b718 (the merge gate has no typecheck command); the econ and kpi pins are green and unedited; 0 em dashes added.
- Report-only answer 1: the floors above. Answer 2: the TV's Next sentence walks to every sentence, including those of a paragraph that was not ruled, and the Rewrite door posts only the status text, so a rewrite of such a sentence would get its first verdict. Ruled as E4-b. Answer 3: the plan's Read it, refused with the English line, shows nothing on the TV, because the call result is discarded. Ruled as E3-b. Answer 4: outside the essay files, EssayAnalysis.summary is read by the job's done line in `desk/src/app/api/analyse/route.ts` (a.summary.slice(0, 120)) and by `desk/src/lib/desk/spoken.ts:13`, so the TV now speaks 'Reading paragraph k of N.' during a read. The digest and the recap read counts from history, not from the summary.
- Questions and how each was ruled. Question 1 (rewrite on an unruled sentence): ruled as E4-b. Question 2 (Read it shows nothing): ruled as E3-b. Question 3 (the phone-panel suite's fixed list of names): noted. Question 4 (the inline opacity): ruled as E4-c. Question 5 (an older piece with no observed list refuses with the fourth line): accepted as built, for the full r1 to judge. Question 6 ('Start with paragraph k' is recovered from the old summary after piece-again): accepted as built, for the full r1 to judge. Question 7 (the learner switch and a running piece): left with the owner's ask 28b44148.

Ruled 2026-10-11 (round 17): 6c carries E3-b, E4-b and E4-c. 8c runs first on the delivery lane, so that 6c can run beside the pairing full r3, whose span holds none of 6c's files. The essay full r1 follows 6c, because a known gap in E3 and E4 on the TV would cost it a round.

Delivery 6c, as delivered (three commits, run 9c07044c, merged at 3b97c46d):

- Commits: 4a2fbbc9 (E3-b, E3-b-a); b2779744 (E4-b, E4-b-a); 3b97c46d (E4-c, E4-c-a). Reconciled with git cat-file -e and git merge-base --is-ancestor: 4a2fbbc9, b2779744, 3b97c46d and dc511a47 all exist and are ancestors of main. The run's own commits are the same SHAs, so run 9c07044c did not rebase.
- Eight files, +130 -10 (git diff --shortstat dc511a47 3b97c46d): `desk/src/app/api/analyse/route.ts`, `desk/src/design/essay-specimen.css`, `desk/src/essay/EssayTV.tsx`, `desk/src/lib/rules/essay.ts`, `desk/src/tv/keys.ts`, `tools/essay-piece-test.cjs`, `tools/essay-rules-test.cjs` and `tools/tv-keys-test.cjs`.
- As built, on main:
  - The route helper is refusedWithLine (`desk/src/app/api/analyse/route.ts:20`). It dispatches { type: "status", text: error } and answers 400 with { error }. Its four call sites are :80 (pieceProblem), :82 (NOT_ENGLISH_LINE on a piece), :112 (essayTooLong) and :114 (NOT_ENGLISH_LINE on a paragraph). The 409, the 428, a refusal from keeping the text, and the rewrite and piece-again refusals do not call it.
  - rewriteUnruledLine (`desk/src/lib/rules/essay.ts:432`) gives unruledCaption's text for the sentence's paragraph, else null. The route checks it at `route.ts:48-49`, after the E2-b check (:45) and before revise (:50), and answers 400 with the line. The forensic Rewrite door (`desk/src/tv/keys.ts:450`) posts it as the status, else rewriteStatus.
  - The rule is `.essay-tv .em-r[data-state="not-read"], .essay-tv .em-r[data-state="not-english"] { opacity: .4; }` at `desk/src/design/essay-specimen.css:137`. It sits after `.em-r.cur` (:135), so the current row stays dimmed as the inline opacity drew it. The rail row (`desk/src/essay/EssayTV.tsx:370`) has no inline style. The map's own `out` (:265) stays.
- Fail-before (result.json acceptance.red_before), with a stubbed engine, a temp DESK_DATA_DIR and engine calls counted:
  - E3-b: three route cases red on base ('before' !== the line, for the Czech paragraph, essayTooLong, and the Czech-only piece with the pieceProblem piece). The 409 and 428 case passed before, so it is a guard.
  - E4-b: the route case red (a rewrite in a failed or not-English paragraph did not answer with the line; it went on to revise), the rules case red (rewriteUnruledLine is not a function) and the tv-keys case red (Rewrite posted rewriteStatus). Guards that passed before: a rewrite in a ruled paragraph still runs (1 engine call), and REWRITE_WHILE_READING still comes first.
  - E4-c: the rules case red on base (no data-state rule in the css, an inline opacity present). It was added with the fix in the third commit.
- The one changed assertion: in `tools/essay-rules-test.cjs`, the test 'the analyse route asks essayTooLong before it starts a run...' matched /status: 400/ after essayTooLong(body.text). It now matches /refusedWithLine\(tooLong\)/ and checks that the helper answers status: 400. The reason is that the refusal now goes through refusedWithLine. The reason is a comment in the test.
- Gate: 75 suites and 1580 tests (1570 at dc511a47); tsc exited 0 for the builder, the Director and the App Master at 3b97c46d; the econ and kpi pins green and unedited; node tools/worktree-preflight.cjs printed nothing; 0 em dashes added.
- Report-only answer 1: the status span (`desk/src/app/tv/page.tsx:152`) sits in the bench bar, which fullscreen hides (`desk/src/app/globals.css:14`); the voice speaks only spokenLine (`desk/src/lib/desk/spoken.ts:10-20`), never the status; useCommit (`desk/src/essay/EssayTV.tsx:120`, :292) reacts only to a lens chosen line.
- Report-only answer 2: the phone's rewrite panel offers the sentence the TV is on (onSentence, `desk/src/app/phone/page.tsx:205`) with no unruled check, and only pieceBeingRead disables it (:208); sendRewrite (:218-221) shows the route's line through its existing error path, so the phone did not change.
- Report-only answer 3: a refusal made while another reading runs replaces the running job's start line on the status, the running reading keeps going, and its done line sets the status again.
- Report-only answer 4: the doors that post a kind essay or kind piece reading are the TV's plan Read it (`desk/src/tv/keys.ts:427`), the phone (`desk/src/app/phone/page.tsx:254` kind piece, :281 kind essay) and `tools/essay-file-live.cjs:190`; the drop page and the other live tools post neither.
- Rulings and questions:
  - Answer 1: the TV draws the status line only in the bench bar, which fullscreen hides, and spoken.ts never speaks it. Ruled as E3-c for the Essay Master stage. Across the TV, every app's status line is bench-only in fullscreen. That predates this work, and it is not slotted, because each app draws its own stage.
  - Answer 2 (the phone's rewrite panel offers a sentence of a paragraph that was not ruled, and the route refuses it with the line): not slotted, for the essay full r1 to judge.
  - Answer 3: accepted. Answer 4: noted.
  - Question 1 (the E4-c rule sits after .em-r.cur): accepted as built, because it keeps today's picture. Question 2: ruled as E3-c. Question 3 (line endings): noted, because the diff is clean.

Delivery 6d, as delivered (one commit, run 36036ff6, merged at 706588fe):

- Commit: 706588fe (E3-c, E3-c-a). Reconciled with git cat-file -e and git merge-base --is-ancestor: 706588fe and 3b97c46d exist and are ancestors of main. The run's own commit is the same SHA, so run 36036ff6 did not rebase.
- Three files, +77 -6 (git diff --shortstat 3b97c46d 706588fe): `desk/src/essay/EssayTV.tsx`, `desk/src/lib/rules/essay.ts` and `tools/essay-rules-test.cjs`.
- As built, on main:
  - refusalCaption (`desk/src/lib/rules/essay.ts:135`) returns { label: "Not read", text: status } when the status is exactly one of the refusal lines, else null.
  - The lifted constants and builders, each with its text unchanged: PARAGRAPH_TOO_LONG_LINE (:102), PIECE_EMPTY_LINE (:121), PIECE_TOO_LONG_LINE (:122), pieceParagraphsLine (:123) and pieceParagraphLongLine (:124). essayTooLong (:98) and pieceProblem (:112) use them, and so does the rule.
  - The byte-for-byte guard is 'E3-c guard: the refusal lines are byte for byte what they were at 3b97c46d' (`tools/essay-rules-test.cjs:1257`). It holds the texts as literals.
  - One branch in each caption chain, `refused ? refused`: EssayType (`desk/src/essay/EssayTV.tsx:147`) and EssayPlan (:215). Each sits right after the failed-job branch, so a running job still wins.
- Red first: the refusalCaption rule case (TypeError: ER.refusalCaption is not a function) and the render case (AssertionError: EssayType, caption was not 'Not read'). The byte-for-byte guard passed before. The render uses react-dom/server with next/font stubbed as in tools/tv-recap-test.cjs.
- Gate: 75 suites and 1583 tests (1580 at 3b97c46d); tsc exited 0 for the builder, the Director and the App Master at 706588fe; node tools/worktree-preflight.cjs printed nothing; 0 em dashes added; no changed assertion.
- Report-only answer 1: the status is replaced by the next essay key that posts one: a lens choice (`desk/src/tv/keys.ts:411`), a slot focus on essayplan (:424), the Rewrite door (:450), or any later status dispatch. A D-pad move on essaytype posts none.
- Report-only answer 2: the essay keymaps post the lens chosen line (:411), planStatus (:424) and rewriteUnruledLine or rewriteStatus (:450). After E3-c the stage draws none of them; it draws only the refusal lines.
- Report-only answer 3: not investigated. The refusal reaches the TV only as the status in the bench bar, and those screens have no caption branch for it.
- Rulings: answer 1 (the caption stays until the session's status changes, and a D-pad move on essaytype posts none) is accepted as built, for the essay full r1 to judge. Answer 2 is noted. Answer 3 (the forensic, playbook, xray and workroom screens draw no refusal from a phone door) was not investigated, and it goes to the full r1 as a known limit.

Ruled 2026-10-11 (round 18): 6d (E3-c) ran after 6c. The essay full r1 runs after 6d, on Opus with all five members. Its known limits: 6c's answer 2; the status line that is bench-only on the TV; no phone-door refusal on the forensic, playbook, xray and workroom screens; the caption that stays (6d's answer 1); the E3-a floors, set on a small corpus; E1-c; 6b's questions 5 and 6; a learner switch during a read (ask 28b44148); and EM-B4's notice, not built.

Full r1 (run 93d18808, head e6d6af46): ready 0.4785, coverage 1.0, round 1 of 3:
- What was judged: the first full round, with no lite r2 by the plan change. A 16-file span (receipt.spanned_paths in result.json, derived by the App Master), five blind members on Opus, uncalibrated judges, and 29 replays that drive the real route, store, rules, keymap and TV components with a stubbed engine. No run has read real learner writing under these rules, and EM3 has never run live. Every claim about real writing stands at proof `claimed`. No hard failure. Lines of code in this block are the report's, at e6d6af46.
- The dimensions, one line each:
  - value 0.42 (low confidence, floor 0.40, advisory);
  - craft 0.52;
  - rivalry 0.45 (low confidence);
  - robustness 0.55 (floor 0.50, binding);
  - economics 0.50.
- The must-address lines, verbatim from result.json:
  - 'value: The Evidence lens cannot mark the youngest learner's central case: an unsupported claim is excused by any checkable sentence anywhere after it'
  - 'craft: No answer-coverage gate: a reading the model left unanswered is recorded as a clean attempt on the learner's estimate'
  - 'craft: The caption under code's verdict label is model prose written blind of that verdict (narrate-dont-rescore inverted)'
  - 'robustness: two empty catches swallow a failed learner-file write after a rewrite or a send-again'
- Lite r1's four lines at this head, one line each:
  - 1 (the Structure line): open, narrowed. Position no longer decides the link on Structure; the claim the evidence names decides it (replays A1 and A2 are right for the observations given). It still fails when the model names no link (replay A3: the thesis is faulty and the planted claim is neutral, value-7), and the Evidence lens is still positional (value-1);
  - 2 (the piece ruled paragraph by paragraph): closed for the mechanism. The piece is ruled once (B1 and B2: thesis and conclusion links strong, '0 of 10 sentences to fix across 5 paragraphs.'). B3, where no body claim names the thesis, still marks it faulty, which is known limit (vi);
  - 3 (Czech read with full confidence): partly closed, open on Czech typed without diacritics (C3: read and ruled, 1 call) and on a Czech paragraph under six words (C4). Closed with diacritics (C1, F1: refused at 0 calls, said on phone and TV) and for a mixed piece (C2);
  - 4 (a paragraph that fails to come back is never said on the TV): closed (D1, D7: 'Not read' caption, struck rail row, summary, spoken line and phone). The residual is value-8: the lens-home door says 'Nothing to fix' and the history line gives no word that a paragraph was not read.
- The findings below the must-address, by id, severity and title (verdict files):
  - value: value-time-saved (low) Time saved per declared character: estimated at L1, nothing measured, and the reading quality behind every saving is unproven on real writing; value-2 (med) On Structure, a one-sentence rewrite of an unsupported claim cannot hold while it stays a claim, and adding the evidence sentence is refused; value-3 (med) Czech without diacritics, or under six words, is ruled under English rules with no word about language; value-4 (med) An Adult with no age is read as a 15-year-old; value-5 (med) A whole piece shows no verdict until its last paragraph is back, and a pending sentence is captioned 'Nothing flagged'; value-6 (med) The 'never writes it for her' promise on notes and summaries rests on a prompt line; only the fix pattern is checked by code; value-7 (med) Which sentence is marked depends on the model naming what each evidence sentence backs; when it does not, the thesis is marked and the planted claim goes neutral; value-8 (low) A piece with a paragraph that did not come back says 'Nothing to fix' on the lens home door and in the history line; value-worst-branch (low) Worst branch: eliska-12 on the Evidence lens with an unrelated claim before her evidence; value-ceiling (low) What the proof ceiling means for this score.
  - craft: craft-3 (med) The prompt still contracts for a verdict the model no longer gives; craft-4 (med) The lens's one deciding field is optional in the request schema, and an unreadable observation is silently neutral; craft-5 (med) Data recovered by parsing display strings: the piece summary and the history line; craft-6 (med) No extraction counters and no integrity record of observation against ruling; craft-7 (low) The guardband is uneven across lenses: Argument rules strong and faulty on the model's word alone; craft-8 (low) Infinite TV animations with no reduced-motion branch; craft-9 (low) Request body cast, not validated, at the route edge (cross-reference: robustness); craft-10 (low) lead: observe-then-rule with categorical observations is a backbone shape the guardbands subject does not describe; craft-11 (low) How this was judged: the mechanical half carried no information.
  - rivalry: rivalry-1 (med) Behind Khan Academy Writing Coach (2025-02-27 update) on reading a whole essay: the desk gives no essay-level verdict; rivalry-2 (low) Ahead on one point: the desk enforces 'do not write it for them' in code; the pinned rivals describe it as policy or apply it only to their own prompts; rivalry-3 (low) Behind Khan on asking about a highlight, and behind Quill on feedback that sharpens with each try; rivalry-4 (low) Market brief written fresh this run from search summaries only.
  - robustness: robustness-2 (med) a paragraph that fails inside a piece loses its cause: no log line and no reason for the learner; robustness-3 (med) a one-paragraph reading with blank or non-string text is not refused before the run; robustness-4 (med) the engine-failure doors of a reading have no case in the span's own suites; robustness-5 (low) the request body is decoded with no guard; checked against the unbounded_foreign_decode bar and not met; robustness-6 (low) hard-failure checks: two not_applicable, one not met; robustness-7 (low) gate coverage: the declared gate is the merge gate's record, lint is undeclared; robustness-8 (low) a refusal on four TV screens reaches only the bench bar; a pending sentence is captioned Neutral.
  - economics: economics-1 (med) No essay call has ever been measured: the repo's EC1 sample holds no essay call; economics-2 (med) A run the desk has dropped keeps calling the model: the piece loop never checks that its run is still current; economics-3 (med) A piece's input grows with the square of its length, capped on raw text but not on the prompt the code builds; economics-4 (med) Per-call output is bounded only by the 90 s deadline, on the larger model with hidden thinking left on; economics-5 (low) The codex path is unpriced.
- The answer on each known limit, one line each (report.md section 8):
  - (i) confirmed as stated (D2): the phone's rewrite panel offers a sentence of an unruled paragraph, and the route refuses it at 0 calls with the paragraph's line. No member raised it above low;
  - (ii) confirmed: the status line is drawn only in the bench bar (`desk/src/app/tv/page.tsx:152`), which fullscreen hides (`desk/src/app/globals.css:14`), and spokenLine speaks the summary on forensic only. Filed as robustness-8, low;
  - (iii) confirmed (F2): a Czech paragraph refused while the TV is on forensic, playbook, xray or workroom is drawn on none of them, at 0 calls. On essayplan it is drawn;
  - (iv) confirmed (F2): after a refusal on essaytype, a D-pad Down posts only a focus event and the 'Not read' caption stays. A Select on a lens posts a new status and replaces it;
  - (v) confirmed, and it reaches the learner: the floors pass Czech typed without diacritics (C3) and a four-word Czech paragraph (C4), and a dense English paragraph passes at an English share of 0.24 (C5). Nothing is tested on real learner writing. Filed as value-3, med;
  - (vi) confirmed (B3): with no body claim naming it, the thesis is the first unsupported claim, it is faulty, and 'Start with paragraph 1' points at it. Value-7 says the result depends on the model supplying `supports`;
  - (vii) confirmed, with a wording defect (D8): for an older piece with no kept observations, send-again is refused at 0 calls with 'A sentence of the piece was rewritten, so reading some paragraphs again would undo it. Read the whole piece again.', which names a cause that did not happen. No member filed it;
  - (viii) confirmed as fragile (craft-5): analysePieceAgain recovers the 'Start with' summary by regex over the learner-facing summary, and the restatements parse the history line's display text. The recovered-summary branch was not driven;
  - (ix) with the owner (ask 28b44148), and the council found it reaches a reading (economics-2, by inspection): after a learner switch or reset the piece loop keeps calling the model and writes the reading to the learner who left. No replay drove a switch mid-piece;
  - (x) confirmed, not built: the paragraph panel and the lens home say nothing about English, so a learner learns it only from a refusal after sending (C1). With diacritics that refusal costs 0 calls. Without diacritics none comes (C3).

Ruled 2026-10-11 (round 19): by the process ruling, the four high lines are reworked before the owner decides the Approval, and the Approval is held. The rework is split by shape: 6e carries E5 (value-1) and E6 (craft-2), then 6f carries E7 (craft-1) and E8 (robustness-1). The full r2 follows 6f, on Opus with all five members, and its replays drive the Evidence lens, because the r1 replays drove only Structure.

Delivery 6e, as delivered (three commits, run 541b1f74, merged at 03f16e2a):

- Commits: 8bb84552 (E5); 4158321b (E6); 03f16e2a, a comment fix that follows E6 (a faulty sentence's note is the check line), with no row of its own. Reconciled with git cat-file -e and git merge-base --is-ancestor: 8bb84552, 4158321b, 03f16e2a and e415579f all exist and are ancestors of main. The run's own commits are the same SHAs, so run 541b1f74 did not rebase.
- Five files, +182 -22 (git diff --shortstat e415579f 03f16e2a): `desk/src/essay/EssayTV.tsx`, `desk/src/lib/desk/essay.ts`, `desk/src/lib/desk/spoken.ts`, `desk/src/lib/rules/essay.ts` and `tools/essay-rules-test.cjs`.
- As built, on main:
  - The Evidence rule is in decideVerdicts (`desk/src/lib/rules/essay.ts:343`). backsOf (:359) accepts a link under rule (a). `backed` and `unbackedSeen` are declared at :365: `backed` holds the opinions a marked checkable sentence names, and `unbackedSeen` holds the paragraphs whose first unbacked opinion is already faulty. The opinion branch is :389-398: rule (e) at :391, rules (b) and (d) at :392, rule (c) at :393-396. An accepted link rides on the verdict as supports (:420).
  - CHECKS.unbacked (:300) and CHECKS.repeated (:303, used at :401). A faulty verdict's note is its check line (:418).
  - contextObservations (:527) returns a kept link as backs on the Evidence lens (:529-531). The request asks for backs in `desk/src/lib/desk/essay.ts` (:29 for the field, :35 for the sentence).
  - summaryLine (`desk/src/lib/rules/essay.ts:445`) has two callers: the 'Last verdict' caption (`desk/src/essay/EssayTV.tsx:149`, imported at :12) and the forensic spoken line (`desk/src/lib/desk/spoken.ts:14`, imported at :9).
- Fail-before (result.json). In `tools/essay-rules-test.cjs`, red on base: E5-1, E5-2, E5-4, E5-5, E5-6, E5 (c), both E6-1 cases, E6-3 and E6-4. Guards that passed on base: E5-3 and E6-2.
- Changed assertions, all in `tools/essay-rules-test.cjs`, each only because of E5 or E6:
  - three now expect the wanders line as a faulty note: 'a faulty verdict keeps a valid fix, trimmed', 'a fix without a [slot] is dropped' and 'a malformed fix never reaches the screen';
  - 'rewrite case 4' now expects CHECKS.opinion;
  - 'E1-b' no longer passes Structure verdicts to the Evidence lens, because a kept supports link now comes back as backs.
- Gate: 75 suites and 1616 tests (1604 at e415579f); tsc exited 0 for the builder, and for the Director at 03f16e2a; `tools/part-names-test.cjs` is unchanged and green.
- Report-only answer 1: the only site that draws a faulty note is the forensic caption in `desk/src/essay/EssayTV.tsx` (:409 reads the note, :416 draws it under 'Look again · the problem'), and it now shows code's line. The revise prompt in `desk/src/lib/desk/essay.ts` (:249) feeds the old note back: `(${before.verdict}: ${before.note})`. The stored model summary is still drawn in `desk/src/tv/landingRows.ts` (:148) and is cut to 120 characters in the analyse route (`desk/src/app/api/analyse/route.ts:76`, :109 and :123).
- Report-only answer 2: Structure needs the E5 (d) rule, narrowly (value-7). With no link named, a claim followed by marked evidence is neutral, but a claim with no evidence between it and the next claim is still the first faulty claim, even when marked evidence sits further on. unsupportedSeen (`desk/src/lib/rules/essay.ts:374`, set at :408) is one flag for the whole piece, not per paragraph.
- Report-only answer 3: 'faulty' contracts remain in three prompts the model reads (craft-3): PATTERN_RULE (`desk/src/lib/desk/essay.ts:53-54`, which ends 'No fix on strong or neutral verdicts.'), the judge prompt (:89, 'For a 'faulty' verdict only, add a fix to a sentence you see a problem in...') and the revise prompt (:246, with the old verdict at :249).
- Rulings: answer 1's landing row is not slotted, for the full r2 to judge. Answer 2: value-7 is not slotted, for the full r2; the one Structure flag per piece is accepted as built, because Structure reads the whole piece. Answer 3: craft-3 is not slotted, for the full r2. A 6g takes value-7, craft-3, the rest of craft-4, value-8 and the landing row only if the full r2 names them.

Delivery 6f, as delivered (two commits, run f699c29c, merged at 74f1ab6f):

- Commits: a374b1f2 (E7); 74f1ab6f (E8). Reconciled with git cat-file -e and git merge-base --is-ancestor: a374b1f2, 74f1ab6f and 03f16e2a all exist and are ancestors of main. The run's own commits are the same SHAs, so run f699c29c did not rebase.
- Seven files, +273 -37 (git diff --shortstat 03f16e2a 74f1ab6f): `desk/src/app/api/analyse/route.ts`, `desk/src/lib/desk/essay.ts`, `desk/src/lib/rules/essay.ts`, `tools/essay-piece-test.cjs`, `tools/essay-rules-test.cjs`, `tools/voice-rules-test.cjs` and `tools/week-digest-test.cjs`. `tools/econ-rules-test.cjs` was declared and needed no change.
- As built, on main:
  - unanswered() (`desk/src/lib/rules/essay.ts:284`) takes the first observation with a numeric n and tests it with observationOk.
  - The check in judge() is `desk/src/lib/desk/essay.ts:102-105`: one console.error line that names the lens and the sentence numbers, then DeskSaid. NOT_EVERY_SENTENCE is :57. The language prompt line is :36 and the judge sentence is :87.
  - DECIDING (:25) and the required field in schemaFor (:42).
  - REWRITE_NOT_SAVED (:59), PIECE_AGAIN_NOT_SAVED (:61) and restateFailed (:64-67).
  - The notSaved parameters are on analysePieceAgain (:192) and reviseSentence (:231). The two catches that call restateFailed are :214 and :263.
  - The route's two branches keep a local notSaved: the rewrite branch (`desk/src/app/api/analyse/route.ts:52-61`) and the piece-again branch (:70-76).
  - restateReading (`desk/src/lib/desk/essay.ts:275`) and restatePiece (:287) now read the book through readLearner (:276 and :288).
- Fail-before (result.json). Red on base: E7-1, E7-2, E7-3 and E7-7 in `tools/essay-rules-test.cjs`; E7-4 and E7-5 in `tools/essay-piece-test.cjs`; E8-1 and E8-2 in `tools/essay-rules-test.cjs`; E8-3 in `tools/essay-piece-test.cjs`. Guards that passed on base: E7-6, E8-4 and E8-5. Base also fails six other `tools/essay-rules-test.cjs` tests, because the changed assertions below now expect the failure.
- Changed assertions (a partial answer used to count as clean and now expects the failure), by name:
  - in `tools/essay-rules-test.cjs`, 'verdicts the model malformed never reach the screen, and never throw' now sends them as observations and expects a reject with NOT_EVERY_SENTENCE and no other throw;
  - the junk-answer loop and the unknown-value loop of essay-master-A case 8 now expect a reject with NOT_EVERY_SENTENCE;
  - the 'fix is optional' schema assertion now expects required ['n','note','side'] for the argument lens;
  - Language case 3, 'exactly at the limit', now counts faulty verdicts only, and its long-sentence answer is now issues: [] for sentence 1;
  - in `tools/voice-rules-test.cjs`, the byte-pinned TODAY['essay.reading'] gains the new judge sentence. essay.revise and every other prompt are unchanged.
- Changed fixtures, assertions kept:
  - in `tools/essay-rules-test.cjs`, asObservations fills a neutral observation for every judged sentence that a verdicts-style stub did not name, and its analyseEssay wrapper drops those filler verdicts, so every old verdict assertion stands;
  - in `tools/essay-piece-test.cjs`, 'one-paragraph reading is unchanged' answers sentence 2 too, and E4B_OBS gains { n: 9, job: 'context' }, because the last paragraph has sentences 8 and 9;
  - in `tools/week-digest-test.cjs`, :158 and :444 answer sentences 1 and 3 as context (faulty stays 1), M8 answers every sentence as context through the paragraph range in the prompt (the test only matches \d+ of 15), and :281 answers sentence 2 with issues: []; :194 needed none;
  - in `tools/voice-rules-test.cjs`, the stubs answer sentences 1 to 3.
- Gate: 75 suites and 1630 tests (1616 at 03f16e2a); tsc exited 0 for the builder, and for the Director at 74f1ab6f; 0 em dashes added.
- Report-only answer 1 (robustness-2): both paragraph catches stay silent except for the E7 case. The analysePiece catch (`desk/src/lib/desk/essay.ts:175`) keeps lastError and logs nothing. The analysePieceAgain catch (:205) keeps nothing and logs nothing. The silent kinds are every EngineError kind from the text engine call (shape, timeout, exit, unreachable) and any plain error from judge. The job-level line (`desk/src/lib/desk/job.ts:112`) fires only when a whole run fails, never for one lost paragraph and never for a send-again.
- Report-only answer 2 (the rest of craft-4): additionalProperties: false on the observation object would break about seven fixtures by reading (six legacy-verdict stubs in `tools/essay-rules-test.cjs` and `tools/week-digest-test.cjs` :194), but none would fail today, because those suites replace engine.text wholesale and `tools/voice-rules-test.cjs`, the one suite that validates through useProvider, sends no extra keys. Folding enum case before oneOf (`desk/src/lib/rules/essay.ts:259`) breaks no fixture: the unreadable-value fixtures use 'boss', 'sideways', 'vibes', 'many' and 'great'.
- Report-only answer 3 (value-8): a piece with a failed paragraph says 'Nothing to fix' at `desk/src/essay/EssayTV.tsx:286` (the lens home door, shown whenever no faulty sentence is found, with no check of piece.failed or notEnglish) and, as 'Read through; nothing to fix.', at `desk/src/tv/recapRows.ts:99`. `desk/src/essay/EssayTV.tsx:431` is the per-sentence card for a strong verdict and is not about the piece. The history line never says it.
- Rulings: answer 1 (robustness-2: a paragraph that fails inside a piece or a send-again keeps no server line, except the E7 case) is not slotted, for the full r2. Answer 2 (the rest of craft-4) is not slotted, for the full r2. Answer 3 (value-8: 'Nothing to fix' in EssayTV.tsx and recapRows.ts on a piece with a paragraph that did not come back) is not slotted, for the full r2.
- Questions and how each was ruled. Question 1 (the restatements read through readLearner): accepted, because readLearner reads an unknown learner as blank and throws only on an unreadable file, as WD14 ruled. Question 2 (the Language request requires issues): accepted as ruled at the dispatch, for the full r2 to judge. Question 3: as answer 3.

Next, ruled 2026-10-11 (round 19): the essay full r2 runs after 6f, on Opus with all five members, round 2 of 3. Its known limits are full r1's (i) to (x), none changed by 6e or 6f, and these: value-7 with 6e's answer 2; craft-3; the rest of craft-4; value-8; robustness-2; the landing row's stored summary; and the Language request that requires issues. The owner's Approval stays held until the r2 reports.

Full r2 (run 85a2a235, head 74f1ab6f): ready 0.588, coverage 1.0, round 2 of 3:
- What was judged: a 17-file span (receipt.spanned_paths in result.json, derived by the App Master), five blind members on Opus, uncalibrated judges, and 51 in-process replays with a scripted engine. No run has read real learner writing under these rules, and EM3 (a whole piece) has never run live. No hard failure. Lines of code in this block are the report's, at 74f1ab6f.
- The dimensions, one line each, with the delta against r1:
  - value 0.55 (low confidence, floor 0.40, advisory), +0.13;
  - craft 0.60, +0.08;
  - rivalry 0.60 (low confidence), +0.15;
  - robustness 0.72 (floor 0.50, binding), +0.17;
  - economics 0.45, -0.05.
- The must-address line, verbatim from result.json:
  - 'craft: The model's summary is written blind of the code's verdicts and reaches screens that contradict them, one of them with no count beside it'
- r1's four lines at this head, one line each (report.md section 1):
  - 1 (value, the Evidence lens): closed where the model names the link, open where it names none. With no link named every opinion is neutral and nothing is marked (EV3). Two new edges: an example with no marker word or number is not counted as evidence (EV9), and a mislinked model decides which opinion is marked (EV2 with off-topic research);
  - 2 (craft, no answer-coverage gate): closed. A paragraph answered 2 of 3, with none, or with a number outside it fails 502 and records nothing; in a piece it becomes a failed paragraph and send-again reads it;
  - 3 (craft, the caption under code's verdict label): closed on the forensic caption, and the same defect moved to the summary. It is this round's one must-address line. Strong and neutral sentences still keep a model note written blind of their label (craft-3);
  - 4 (robustness, two empty catches on a failed learner-file write): closed as stated. The desk answers 200, logs one line and sets the status line, which only the TV's bench bar draws.
- The findings below the must-address, by id, severity and title (verdict files):
  - value: value-time-saved (low) Time saved per declared character (L1 plus the Director's replays; no live run at this head); value-1 (med) Evidence lens: an example with no marker word does not count, so the opinion it backs is told 'nothing here is checkable'; value-2 (med) The desk's landing row shows the model's summary alone, written blind of code's verdicts, so it can praise a paragraph code ruled all faulty; value-3 (med) Kristyna: the desk says it reads English before it rules for her ordinary Czech, but not for Czech typed without diacritics or under 6 words; value-4 (low) Evidence lens on a whole piece: the thesis and conclusion are ruled 'only asserts' and the summary says to start with paragraph 1; value-5 (low) Helena, an adult with no age, is described to the model as 'a 15-year-old'; value-6 (low) One code-fixed faulty note uses words a 12-year-old may have to look up; value-7 (low) Worst branch found: no scenario is declared; the weakest in-segment branch is a young learner whose evidence is an unmarked example; value-8 (low) Cross-reference (craft/robustness): a Czech refusal is not drawn on the TV stage while a reading is on the forensic, playbook, xray or workroom screens.
  - craft: craft-1 (low) The mechanical half carried no information: both governing pairs are unknown; craft-3 (med) The prompt asks for a fix 'for a faulty verdict only' from a model that is told it gives no verdicts; notes on strong and neutral sentences are also written blind; craft-4 (med) Machine state is recovered by parsing display text; craft-5 (med) The request schema is hand-written, open and unbounded, beside builders and a length repair the repo already has; craft-6 (med) Extraction outcomes are not counted: the usage ledger records a reading that failed at the schema door or the coverage gate as ok; craft-7 (med) On the Argument lens the model's label is the verdict, with no deterministic check; craft-8 (low) No bounded re-ask: one unreadable observation fails the whole reading; craft-9 (low) The forensic page shows the regex's first-pass role as the sentence's job, while the Structure verdict used the model's observed job; craft-10 (low) The observer is shown the heuristic's role on every line it is asked to judge; craft-11 (low) Cross-reference (robustness): the route body is cast, not validated; craft-12 (low) lead: categorical observations ruled by code are a zero-band variant that judgment-guardbands does not name, and it brings a narration rule the subject should state.
  - rivalry: rivalry-1 (med) Behind Quill on judging evidence: a plain example with no marker word counts as no evidence; rivalry-2 (med) Which opinion the evidence backs is the model's call; code checks the link's shape, not whether it fits; rivalry-3 (low) Ahead on free writing at sentence level, a scope Quill says it does not reach; rivalry-4 (low) An unfinished reading: the desk is ahead of what rivals document, and they document almost nothing; rivalry-5 (low) Cross-reference to value: the model's praise is shown and spoken beside a faulty count; rivalry-6 (low) Quill is ahead on a revision loop per sentence and on teacher review.
  - robustness: robustness-1 (med) A first reading whose learner-file save fails is told as 'could not read that through' while the TV shows the reading; untested; robustness-2 (med) A paragraph's engine failure inside a piece leaves no line in the server log; robustness-3 (med) POST /api/analyse parses its body with no catch; a malformed or null body throws out of the handler; untested; robustness-4 (low) A blank paragraph on the essay branch is read: one model call and an empty reading replaces the desk's; robustness-5 (med) Repository: the declared gate has a timing bound reported as flaky under load, outside the span; robustness-6 (low) Gate record is cited, not raw; lint is undeclared; robustness-7 (low) Hard-failure checks: two not applicable, the third not met.
  - economics: economics-1 (med) The repo's only measured sample has no essay call, so no essay figure is measured; economics-2 (low) Per-use cost: calls counted by execution, tokens and seconds estimated; economics-3 (low) A refusal before any run costs no call; economics-4 (low) What a reading writes to the learner file, and that every store it touches is capped; economics-5 (med) A piece's input grows with the square of its size: every paragraph call carries the whole piece; economics-6 (med) Essay calls run on the best model with hidden reasoning on, the CLI structured-output path, and no output cap; economics-7 (med) A run left behind by a learner switch keeps spending, and the same learner can start another beside it; economics-8 (low) The bounds that hold: no retry, no re-ask, one call per paragraph, a deadline on each; economics-9 (low) Money: the price book says 0 marginal USD per claude-cli call; the notional figure is unmeasured and codex is unpriced.
- The answer on each known limit, one line each (report.md section 9):
  - (i) holds: the route refuses a sentence of an unruled paragraph with 400 'Paragraph 2 did not come back. Send it again from the phone.' and makes 0 calls (PA6b). No member filed it;
  - (ii) holds, and carries more: the E8 not-saved lines are drawn only in the bench bar (LF1, LF2), which fullscreen hides (`desk/src/app/globals.css:14`), and the phone says 'on the TV';
  - (iii) holds: a Czech paragraph sent while the TV is on forensic, playbook, xray or workroom is refused at 0 calls and drawn on none of them; essayplan draws it (RF2; value-8);
  - (iv) holds: Down on essaytype emits only a focus event and the 'Not read' caption stays (RF2);
  - (v) holds, and value files it med (value-3): CZ2 (Czech signal 0.11) is read and ruled 2 of 3, and CZ4 and CZ5 (four words) are ruled 1 of 1. A second ASCII sample with more function words is refused (CZ3, signal 0.25), so the edge depends on the words;
  - (vi) holds: STP3 marks sentence 1 'This claim has no evidence after it ...' and starts with paragraph 1; one naming claim makes it strong (STP2);
  - (vii) holds: 400 'A sentence of the piece was rewritten, so reading some paragraphs again would undo it. ...' at 0 calls (RF3);
  - (viii) holds; craft files it med (craft-4, display-vs-machine-channels);
  - (ix) holds: the piece finished, 3 calls, recorded to eliska while ema is seated (RF4); economics-7 adds that the same learner can start a second run beside it. With the owner (ask 28b44148);
  - (x) holds: the phone's Essay panel says nothing about English before the first send (value-3, `desk/src/app/phone/page.tsx:657`);
  - (xi) holds (ST3). The Evidence lens does the opposite in the same case: nothing is marked (EV3);
  - (xii) holds; craft files it med (craft-3);
  - (xiii) holds: a capitalised job fails the whole reading at the schema door (PA3a, 502). craft-5 med;
  - (xiv) holds: the lens home door says 'Nothing to fix', and the recap says '0 of 3 sentences to fix' (PA6);
  - (xv) holds; robustness files it med (robustness-2);
  - (xvi) holds, and it is this round's must-address line (craft-2; value-2);
  - (xvii) holds: a missing issues on one clean sentence fails the whole reading, 502, and records nothing (PA5). craft-8 (low) notes there is no bounded re-ask;
  - new this round and above low, not in the list: robustness-1 (a first reading whose save fails is told as an engine failure, and for a piece the desk already shows the ruled reading), robustness-3 (a malformed body throws out of POST /api/analyse with no desk line), craft-6 (the usage ledger records schema and coverage failures as ok), craft-7 (on Argument the model's label is the verdict with no code check) and economics-6 (best model, thinking not zeroed, no output cap).

Ruled 2026-10-11 (round 20): by the process ruling, the one high line (craft-2) is reworked before the owner decides the Approval, and the Approval stays held. E9 carries it. 6g built it and was held on one assertion outside its paths. 6h carried 6g's two commits to main by cherry-pick, with that assertion ruled as E9-a.

Delivery 6g and 6h, as delivered (E9: run d2f9e78d held, run 2cb1d267 merged at e4ef2e93):

- 6g (run d2f9e78d, held): two commits on branch autopilot/accepted-idea-delivery-d2f9e78d, 52152c3a (the code) and 4a716e85 (the tests), cut from 87ca33c5. Reconciled with git cat-file -e: both exist. They are not on main by design, because the merge gate held the run. Gate: 75 suites, 1635 tests, 1 failed (part-names test 2); tsc exited 0. The merge gate held it because tools/part-names-test.cjs test 2, at :54, asserted that spokenLine of a forensic reading with only summary 'In short.' was 'In short.'. Under E9 that reading has no sentences and speaks ''. The file is outside 6g's paths, and the builder stopped as told.
- 6h (run 2cb1d267, merged at e4ef2e93): three commits, reconciled with git cat-file -e and git merge-base --is-ancestor (all three exist and are ancestors of main): ccfc2409 (E9, the code), cherry-picked from 52152c3a; 7f1ebd5c (E9, the tests), cherry-picked from 4a716e85; e4ef2e93 (E9-a, part-names test 2), a new commit. Both picks applied cleanly. After 6h, branch autopilot/accepted-idea-delivery-d2f9e78d is moot, and its merge-held ask goes to the owner as Discard.
- Nine files, +114 -55 (git diff --shortstat 87ca33c5 e4ef2e93): `desk/src/lib/desk/essay.ts` (46 lines changed), `desk/src/lib/rules/essay.ts` (29), `desk/src/lib/rules/voice.ts` (2), `desk/src/tv/landingRows.ts` (3), `tools/essay-piece-test.cjs` (22), `tools/essay-rules-test.cjs` (53), `tools/essay-seat-test.cjs` (7), `tools/part-names-test.cjs` (5) and `tools/voice-rules-test.cjs` (2). `desk/src/app/api/analyse/route.ts` and `tools/econ-rules-test.cjs` were declared for 6g and needed no change.
- As built, on main:
  - summaryLine is in `desk/src/lib/rules/essay.ts` (:449). It returns '' for a reading with no sentences, and pieceReadingLine for a piece still being read.
  - judge()'s system text ends 'Plain text, to be read aloud.' (`desk/src/lib/desk/essay.ts:91`), with no summary sentence. schemaFor (:39) has observations only, and `required: ["observations"]`.
  - The four callers set the summary from summaryLine: analyseEssay (:135-136), analysePiece (pieceSummary, :158-159), analysePieceAgain (:201-203) and reviseSentence (:252).
  - The landing row's essay line is `own?.sentences.length ? firstSentence(summaryLine(own)) : ...` (`desk/src/tv/landingRows.ts:149`).
  - The essay manner in `desk/src/lib/rules/voice.ts` (:54-60) no longer says the summary is one plain sentence.
- Red on base (result.json of run d2f9e78d, base 87ca33c5), and the guards: E9-1, E9-2, E9-3, E9-4 and E9-7 were red on base and are green after. E9-5 is rewrite case 3, strengthened. E9-6 is a guard that stays green: the E2-b 'Reading paragraph k of N.' line and the unruled lines are asserted in E6-3 (changed by E9) and in the E3 and E4 cases, which are unchanged. Where: E9-1, E9-3 and E9-7 in `tools/essay-rules-test.cjs`, E9-4 in `tools/essay-piece-test.cjs`, and E9-2 in `tools/essay-seat-test.cjs`, beside case 7.
- Changed assertions, by name, each with its reason:
  - `tools/essay-piece-test.cjs` :81 and :114 (the piece cases): they expected the stub's paragraph summary after 'Start with paragraph k:'. They now expect 'Start with paragraph 2, sentence 4: ' and 'Start with paragraph 1, sentence 1: ', and assert that the stub's text is absent, because the model's summary is no longer read.
  - `tools/voice-rules-test.cjs`, the byte-pinned TODAY['essay.reading']: it loses 'Then one summary sentence.'.
  - `tools/essay-rules-test.cjs` :163 (a verdict can only land on a sentence number that exists): the summary was 'A clear paragraph.' and is now code's '1 of 3 sentences to fix. Start with sentence 3: ' and the note.
  - `tools/essay-rules-test.cjs` :526 (rewrite case 3): the summary after a rewrite was the old one, and is now exactly '0 of 3 sentences to fix.', the same as summaryLine, because it is restated from the verdicts.
  - `tools/essay-rules-test.cjs` :803 and :807 (seat case 6): Ema's summary was the stub's 'Ema's reading.' and is now a match on '1 of 3 sentences to fix. Start with sentence 2: '.
  - `tools/essay-rules-test.cjs` E6-3 (:1402, renamed 'E6-3 (changed by E9)'): summaryLine kept the model's summary after the count and for a piece. It now returns code's line from the verdicts alone. Its :1412-1413 now rule that a reading with no sentences gives ''.
  - `tools/essay-rules-test.cjs` :1420 (the forensic spoken line): it expected '1 of 2 sentences to fix. Fine.' and now expects '1 of 2 sentences to fix. Start with sentence 1: x'.
  - `tools/part-names-test.cjs` test 2 (:54-57, E9-a): the single assertion that a summary-only reading speaks 'In short.' is replaced by two. A reading with sentences and verdicts speaks '1 of 2 sentences to fix. Start with sentence 1: Name the claim first.' and not 'In short.'. A reading with no sentences speaks '' (message 'no sentences: nothing, as essay-rules rules for E9').
  - Fixtures: stubs keep answering a summary, since an extra field does no harm.
- Gate: 75 suites and 1635 tests, 0 failed, at e4ef2e93 (1630 at 87ca33c5). tsc exited 0 for the builder and the Director at e4ef2e93. 0 em dashes added.
- 6g's report-only answers 1 to 3, one line each:
  - 1: with E9 in, the strong and neutral notes under 'Well done' and 'Neutral' in `desk/src/essay/EssayTV.tsx` (:417 and :418, read from v.note at :409) are still the model's, written blind of the label. Nothing else on the TV, the spoken line or the landing card shows model prose. The phone's PaperPanel notes (`desk/src/app/phone/PaperPanel.tsx:66`) are maths paper notes, not essay;
  - 2: for a piece, the route cuts the done status at 120 characters (`desk/src/app/api/analyse/route.ts:76`, :109 and :123). The head alone is 46 characters, and each unruled line is 60 to 61. A 30-paragraph piece with 29 unruled paragraphs and one ruled faulty sentence reaches about 1,918 characters, and 30 unruled lines alone reach 1,850;
  - 3: the output tokens E9 saves are unmeasured, because `tools/econ-rules-test.cjs` checks only the ledger shape and the byte-for-byte request text, and no fixture estimates the output of an essay-read call.
- Rulings:
  - answer 1: under a strong or neutral verdict, EssayTV.tsx still draws the model's note, at :417 and :418. This is craft-3 territory, a later row. It is not slotted, and the essay full r3 judges it;
  - answer 2: the route cuts the done status at 120 characters (route.ts :76, :109 and :123), and for a piece the cut falls inside the Start-with line or before it. It predates E9, and the stored summary is whole. Recorded, not fixed, for the essay full r3 to judge;
  - answer 3: the output tokens E9 saves are unmeasured. They go to the r3 economics member.

Next, ruled 2026-10-11 (round 20): the essay full r3 runs after 6h, on Opus with all five members, as round 3 of 3, the last. Its span is r2's 17 files plus `desk/src/tv/landingRows.ts`, `tools/essay-seat-test.cjs` and `tools/part-names-test.cjs`, 20 in all. Its known limits are r2's (i) to (xvii), with (viii) and (xvi) restated for E9, plus r2's findings above low and 6g's answers 1 to 3. The owner's Approval stays held until r3 reports.

Full r3 (run 1f5206cc, head e4ef2e93): ready 0.604, coverage 1.0, round 3 of 3, the last:
- What was judged: a 20-file span (r2's 17 plus `desk/src/tv/landingRows.ts`, `tools/essay-seat-test.cjs` and `tools/part-names-test.cjs`, derived by the App Master), five blind members on Opus, uncalibrated judges (trust state uncalibrated), L1 only, and 36 in-process replays with stubbed engines. The gate is the merge gate's: run 2cb1d267 passed `cd desk && npm run test:rules` at e4ef2e93 (75 suites, 1635 tests, 0 failed), and tsc exited 0. Lint is unmeasured. No hard failure (`write_outside_door` and `credential_outside_vault` not applicable, `unbounded_foreign_decode` checked and not met). No dev server, no `desk/data/`, no model call.
- The dimensions, one line each, with the delta against r2 (report.md section 1):
  - value 0.55 (med confidence, floor 0.40, advisory in report.md section 3 and false in result.json), 0.00;
  - craft 0.68 (med confidence, no floor), +0.08;
  - rivalry 0.60 (low confidence, no floor), 0.00;
  - robustness 0.66 (med confidence, floor 0.50, binding in report.md section 3 and false in result.json), -0.06;
  - economics 0.50 (med confidence, no floor), +0.05.
  - overall 0.604 against r2's 0.588, +0.016. No floor was hit.
- The must-address: none (must_address is empty in result.json).
- r2's must-address line (craft-2) at this head, closed (report.md section 1): 'craft: The model's summary is written blind of the code's verdicts and reaches screens that contradict them, one of them with no count beside it'. The replays show code's text on every surface and the model's summary on none, and the landing row now reads '1 of 4 sentences to fix.'. It is not covered for the model's own note under strong, neutral and rewrite-holds captions (craft-2, rivalry-2), the 120-character cut of the done status, and the older stored summary that still rides in the session payload.
- The findings, by dimension, with id, severity and title (verdict files):
  - value: value-time-saved (low) Time saved per declared character; value-worst-branch (med) Worst branch: the youngest learner's well-formed PEEL paragraph can be told its Explain sentence is the problem; value-peel-explain (med) A correct PEEL paragraph's Explain sentence is ruled faulty whenever the model observes it as an opinion or a claim; value-czech-pass (med) Czech typed without diacritics, or dense in English-looking function words, is read as English and given a confident verdict; value-title-line (low) A whole piece pasted with a plain title line can name the title as the place to start; value-piece-first-verdicts (low) A piece shows no verdicts until its last paragraph is read; value-young-words (low) The code-written notes are the same for every age; value-model-notes-unscreened (low) Cross-reference: strong, neutral and 'it holds' captions show the model's note unscreened; value-helena-voice (low) Cross-reference: an adult with no age is addressed in the prompt as 'a 15-year-old'.
  - craft: craft-1 (low) The mechanical half carried no information; craft-2 (med) Under a verdict code decided, strong, neutral and rewrite-holds captions still show model prose written blind of that verdict; craft-3 (med) Machine state recovered by parsing display strings, three places in the span; craft-4 (low) The reading prompts still tell the model to gate its fix on a 'faulty' verdict it is told it does not decide; craft-5 (low) No integrity record of what the model observed against what code ruled; craft-6 (low) Status line cuts the code-composed summary mid-word at 120 characters; craft-7 (low) Dead import left by the E9 refactor, and no lint gate to catch it; craft-8 (low) Cross-reference: the English rule's comment claims diacritic-free Czech reads the same, the replay shows it does not; craft-9 (low) Lead: code-as-judge with the model as a typed feature extractor; craft-10 (low) Outside read: current structured-output practice, compared and found met.
  - rivalry: rivalry-1 (low) Narrow lead: the overall line is written by code from code-ruled sentence verdicts; rivalry-2 (med) The agreement guarantee stops at the overall line: strong and neutral sentence captions are still the model's own prose; rivalry-3 (med) Behind Quill Reading for Evidence on what counts as evidence; rivalry-4 (med) Behind Khan Academy Writing Coach on breadth of the reading; rivalry-5 (low) Parity on the rewrite loop; rivalry-6 (low) Pins are read dates and one rival page was unreadable.
  - robustness: robustness-1 (med) A paragraph of a piece that fails is caught and its error dropped: a schema rejection leaves no trace anywhere; robustness-2 (med) A first reading whose learner-file save fails reports 'could not read that through' while a piece's full ruled reading stays on the TV; untested; robustness-3 (med) A malformed request body throws out of POST /api/analyse before any desk door; no test; robustness-4 (low) Body fields are not type-checked; robustness-5 (low) An empty or blank paragraph POSTed directly spends a model call and leaves an empty status line; robustness-6 (low) The usage ledger records a schema-rejected answer as ok:true; robustness-7 (low) Lint unmeasured and typecheck not a declared gate; robustness-8 (low) A refusal sent while a reading is on the desk is drawn only on the lens home; robustness-9 (low) Hard-fail checks: two not applicable, one checked and not met.
  - economics: economics-1 (low) Per-use cost, as call counts, request sizes and estimates; economics-2 (low) Output tokens the model no longer writes: about 20 to 40 per read call (estimate); economics-3 (med) Worst-case piece is bounded but about 190 times a typical one: the whole piece rides in every paragraph call; economics-4 (med) The output side has no declared cap; the per-call deadline is the only bound; economics-5 (med) The usage ledger books schema-rejected and partial answers as ok:true; economics-6 (low) No telemetry of the current code is readable; economics-7 (low) Fan-out, retries and storage are bounded; one concurrency gap is bounded by learner switches; economics-8 (low) Pack note: code comments carry rework labels.
- The answer on each known limit, one line each (report.md section 8):
  - (i) stands: the route refuses with that paragraph's own line (400, 0 calls); the phone's rewrite panel does not check paragraph state;
  - (ii) stands for speech (spoken.ts); the fullscreen bench bar was not re-checked;
  - (iii) stands: forensic, playbook, xray and workroom draw no refusal; essaytype does;
  - (iv) stands by code (`refusalCaption(s.status)`); the D-pad case was not re-replayed;
  - (v) stands: Czech without diacritics, and Czech under six words, are read as English with a confident verdict; value adds Czech dense in 'by, to, do, a' (value-czech-pass);
  - (vi) stands: a thesis that no claim names is the first unsupported claim, so it is faulty;
  - (vii) stands: an older piece with no `observed` list is refused with 'A sentence of the piece was rewritten...' although nothing was rewritten;
  - (viii) the kept-summary regex is gone; display text is still parsed in restateReading and restatePiece, in refusalCaption and at route.ts:92 /kept last/ (craft-3);
  - (ix) stands: after a learner switch the piece keeps calling (5 calls) and writes the reading to the learner who left; with the owner;
  - (x) not built: no English-only notice before sending;
  - (xi) stands: Structure marks the thesis and leaves the planted claim neutral, and Evidence marks nothing in the same case;
  - (xii) stands (craft-4);
  - (xiii) stands: extra keys are accepted (200), and `side: "Pushes"` fails the whole reading (502);
  - (xiv) stands on the lens home door (EssayTV.tsx:286): the recap says '0 of 8 sentences to fix' and does not name the unread paragraph;
  - (xv) stands (robustness-1);
  - (xvi) no surface reads it; the field still rides in the session payload;
  - (xvii) stands: Language with `issues` left off one sentence fails the whole reading (502);
  - (xviii) stands: an example with no number or marker word is neutral, and the opinion it backs is faulty;
  - (xix) stands (robustness-2, robustness-3);
  - (xx) stands: the ledger books schema and coverage failures as ok, Argument's `side` is the verdict with no code check, and the calls use the best model with thinking not zeroed and no output cap (economics-3, -4, -5);
  - (xxi) stands: the model's note shows under 'Well done', 'Neutral' and 'Rewrite · it holds' (craft-2);
  - (xxii) stands: the cut falls mid-word, and in a 30-paragraph piece with three failed paragraphs it drops 'Start with' (325 characters cut to 120); the stored summary is whole;
  - (xxiii) unmeasured; estimated at about 20 to 40 output tokens per read call (economics-2).
- Not measured (report.md section 9): real model behaviour under the current prompts, tokens and seconds at this head (the usage ledger is under `desk/data/`), lint, and craft's mechanical half.

Ruled 2026-10-11 (round 21): the essay lane ends here. Full r3 left no high line, and a fourth full round is refused. The owner decides the held Approval on r3's ready. Its findings go to the unslotted list.

## 7. learner-profile-multi-learner-switching

Lite r1: FAIL, 0.40, coverage 0.15. Robustness was 0.40, under its 0.50 floor, so value and craft are unmeasured. Tier:
major, because it is the data path between learners.

Must-address, verbatim as stored. The third line is cut short at its source; the '...' is kept.
1. robustness: session.json holds every profile, is written without temp+rename, and its write error is swallowed; a half-written or junk-typed file silently resets the desk to the two demo profiles
2. robustness: profile.save does not clear what learner.set clears: a new profile saved from a seated learner's desk inherits that learner's level check, sentence reading, worked lesson and Workroom
3. robustness: english.set carries no owner and the analyse job is one slot per kind: a Sentence reading that lands after a switch is written onto the seated learner's desk, and the new learner's own...

HF4 (delivery 4h) delivers the write half of must-address 1: tmp and rename, a logged write failure, and a logged load() fallback. The reset to fresh itself, and must-address 2 and 3, stay with delivery 7. HF4's own commit is cfa59088. 2d794e64 is HF5, the tip of delivery 4h.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| P1 | `session.json` is written through a temp file plus rename, as `learners.ts` does. A failed write is logged and shown as status, never swallowed. `load()` validates each profile: a bad profile is dropped and logged, and the rest are kept. An unparseable file is moved aside (`session.json.bad-<stamp>`), logged, and said in a status line. `profile.draft` and `profile.save` check type against `AGE_RANGE`, and the other fields too. They refuse a bad patch in plain words. | Must-address 1. The write is a bare `writeFileSync` inside `try {} catch {}` (`desk/src/lib/session/store.ts:745`). `load()` (:658) falls back to `fresh()` on any error. The temp-plus-rename model is `desk/src/lib/session/learners.ts` (rename imported at :8). `AGE_RANGE` is `desk/src/tv/profileRows.ts:13`. | none recorded | delivered: the write half in cfa59088 (HF4); the load, draft and save halves in 4fef0a35 (7a, run 3720e29a) |
| P2 | One function clears the per-learner desk state on any change of the seated learner, and both `learner.set` and `profile.save` call it. An edit of the seated profile keeps the running conversation. | Must-address 2. `learner.set` (`store.ts:516`) clears state; `profile.save` (:520) does not. | none recorded | delivered, 4fef0a35 (run 3720e29a); its follow-up P2-a in 60d9398c (run f1df9456) |
| P3 | `english.set` carries an owner, as `essay.set` does. One for a learner who is not seated is dropped and logged. The analyse job slot is keyed per learner. | Must-address 3. `english.set` has no owner (`store.ts:561`); `essay.set` checks `e.owner` (:566). | none recorded | delivered, 4fef0a35 (run 3720e29a): the owner half as written; the per-learner slot as P3-a, which supersedes that clause |
| P4 | While a Linga scene or a level check is running, the switcher says in one line that switching ends it. | Switching ends them today. | none recorded | delivered, 3a0a70f8 (7b, run 27364288); corrected by P4-b, f0524369 (7c, run 8704f32e) |
| P5 | Profile ids are checked unique on draft and save. A patch naming another learner's id is refused. | Must-address 1 family (data path between learners). | none recorded | delivered as P5-a, 4fef0a35 (run 3720e29a) |
| P6 | `reset` joins `SERVER_ONLY`. Profile removal and the demo pair are NOT in this rework: removal deletes a child's data and needs its own design after the full round. | `SERVER_ONLY` (`desk/src/app/api/session/route.ts:12`) does not list `reset` today. | Building removal now. | delivered as P6-a, 4fef0a35 (run 3720e29a); P6-a supersedes the SERVER_ONLY clause |
| P7 | An unreadable `learners.json` reaches the learner as one plain desk sentence, not 'Try again'. | `learners.ts` reports it only through `tell` (:120-129). | none recorded | delivered: the switch half in e4b33fb9 (WD14a, run 0a4ec2cd); the rest in 3ad55a23 (P7-a) and 21a3e500 (P7-b), run 27364288 |
| P1-a | (7a question 3) `load()` drops a profile that is not an object, and a profile whose name is not text. Both are within P1. | 7a's question 3. | none recorded | delivered, 4fef0a35 |
| P2-a | (7a question 1) A switch can happen while a practice run is running. The practice line then builds jobs from the new state, so the failed runs and the running analyse run that `switchedFrom` deleted stay deleted (`desk/src/lib/session/store.ts:708`). | The line rebuilt jobs from `s.jobs`, the state before the switch. That reopened homework robustness-6 and the 409 half of must-address 3. Two of 7a2's three new cases failed on the unchanged line. The third case is a control. | Folding the fix into 7b. 7b's files were in the hint full r2 span, and this fix touched only `store.ts` and the suite. | delivered, 60d9398c (run f1df9456) |
| P3-a | A switch supersedes the running analyse job, as it does a practice run. That meets the per-learner analyse slot. `desk/src/lib/desk/job.ts` is untouched. | Lite r1 must-address 3 asks that the new learner's own request is not refused. Superseding does that with a store-only change, and 7a was store-side. | A per-learner job slot keyed in `job.ts`. | delivered, 4fef0a35 |
| P5-a | With a draft open, another id is refused. With no draft open, an existing id starts an edit from that profile. A desk-made id gets a suffix when it is taken. A phone's id patch is answered 403 (`desk/src/app/api/session/route.ts:43`). | P5. | none recorded | delivered, 4fef0a35 |
| P6-a | `reset` does NOT join `SERVER_ONLY`, because the TV bench's Reset session button posts it (`desk/src/app/tv/page.tsx:148`). A phone's reset is answered 403 instead (`desk/src/app/api/session/route.ts:42`). | P6 as written would break the TV's Reset session button. | P6 as written. | delivered, 4fef0a35 |
| P4-a | P4's line also names a running Sentence reading. A switch drops it (lite r2 robustness-5), and nobody tells the learner who left (lite r2 value-1). | Lite r2 value-1 is the worst-character finding. A parent who switches in the middle of a scene or a reading loses that work, and nothing says so. | Keeping the Sentence reading in the away slot. That is not ruled, and the full round may raise it again. | delivered, 3a0a70f8 (run 27364288); widened by P4-b, f0524369 (7c, run 8704f32e) |
| P7-a | This is the rest of P7. When learners.json cannot be read, two places say one plain desk sentence, never 'Try again', because a retry cannot succeed while the file is unreadable. They are the startup reads in `store.ts` (:795, :800 and :804; they were at about :703-712 before 7a) and the in-run failure sentence in `desk/src/lib/desk/job.ts` (`jobError`, :71). | Lite r2 robustness-7: marking and hint saves still say 'Try again'. WD14a closed the switch half. | none recorded | delivered, 3ad55a23 (run 27364288) |
| P8 | When a switch drops a running run, it also clears that run's start status. A case pins this, and it fails before the fix. | Lite r2 robustness-6. After a switch drops a running analyse or practice run, the new learner's status still reads 'reading your sentence…' or 'writing your set…' with nothing running. No case covers it. | none recorded | delivered, be3ac14d (run 27364288) |
| P7-b | The hint-save half of P7-a. `addHints` reads through `readLearner` (`desk/src/lib/session/learners.ts:420`, the read at :421). On an unreadable learners.json it throws into the store's count write, so the hint door says `HINT_NOT_COUNTED` and answers counted false. An absent or empty file still reads as an empty book. A day with no sheet still answers counted true, as WD12's pin in `tools/week-digest-test.cjs` holds. `desk/src/app/api/hint/route.ts` is unchanged. | Digest full r3 robustness-1 (med). `addHints` read through `getLearner`, which reads an unreadable file as an empty book, so the door answered counted:true while nothing was counted. | none recorded | delivered, 21a3e500 (run 27364288); its byte check corrected by P7-c, 1245013b (7c, run 8704f32e) |
| P4-b | `switchEndsLine` (`desk/src/tv/keys.ts:120`) names the Linga scene only while `turnState` (`desk/src/lib/english/turn.ts:34`) does not read it as finished. A finished scene is not named. A finished scene with a Take Two running is named. A running analyse run whose key is not 'english' is named as 'the Essay Master reading'. | P4 says the line shows only while something is running. At 3a0a70f8 any kept conversation is named, so after a finished scene the switcher still says a switch ends it. A switch also drops a running Essay Master reading, because `switchedFrom` (`store.ts:541`) deletes a running analyse run whatever its key, and P4-a's constraint covers any reading. 7b's question 4 raised the second half. | 7b's reading, which names any kept conversation and leaves the Essay Master reading unnamed. | delivered, f0524369 (7c, run 8704f32e) |
| P7-c | P7-b's case checks that learners.json still holds its truncated bytes after the hint, before the case restores the file. | At 21a3e500 the case restores the whole file in finally and then compares the file with the bytes it restored, so that check cannot fail. | none recorded | delivered, 1245013b (7c, run 8704f32e) |
| P9 | (7d) `runJob` (`desk/src/lib/desk/job.ts`) writes its done line and its failure line only while the run is current and the learner who started it is still seated. It records that learner at the start (`asker` and `seated`, :88-89; the writes are at :97 and :107). `switchedFrom` (`desk/src/lib/session/store.ts:541`) also clears a surviving run's start line while the status still reads that line (:548). `job.done`, `job.failed`, `onFail`, and the routing of a late result to the away slot are unchanged. | Full r1 must-address 1, verbatim: 'robustness: A run that outlives a switch writes its status line onto the next learner's desk (observed, untested)'. `switchedFrom` dropped only failed runs and a running analyse or practice run. So a running read, hint, lesson, mark or explain survived a switch and wrote its line on the next learner's desk. | none recorded | delivered, 7955c66d (run c2a3c969) |
| P10 | (7d-2) The hint route starts its lesson run only while the learner who asked for the hint is still seated. A hint that outlives a switch starts no lesson pick, so no lesson.set and no done line land on the next learner. | P9's residual, found by its builder and checked by the App Master. `desk/src/app/api/hint/route.ts` (:53-58) starts the lesson run after the hint returns, so the lesson run starts with the next learner seated. 'no lesson covers this one' is the second line of the full r1's own replay. P9's case (c) does not assert it. | Sending the lesson to the away slot of the learner who left, although nobody asked to see it. | superseded by P10-a, c50e69cc (7d-2, run c976c3d8) |
| P11 | (7f) Two findings from P9's report-only questions, both confirmed by the App Master. (i) A failure that lands after a switch leaves the job failed with the old learner's input (`store.ts:641-642`). `switchedFrom` drops failed jobs only at the moment of the switch (:546), so the next learner's Try again re-asks that input (`desk/src/app/api/session/retry/route.ts`, :28 and :35). (ii) A run that survives a switch stays running, so the next learner's request of the same kind is refused with 409 until that run ends (`job.ts:86`, and the hint route's own check). 7d-2 fixes both, and their shape is ruled when 7d-2 is dispatched. | The same family as P9 and full r1 must-address 1. Nothing of the learner who left reaches the next learner. | none recorded | delivered, 5632c7d3 (7d-2, run c976c3d8); its shape is P11-a |
| P12 | (7g) On the phone, a change of the seated learner also clears the explain panel's heard, reply and again (the second-try text), as a new walk item already does. | 5b's report-only answer, checked by the App Master. `desk/src/app/phone/page.tsx` clears heard, reply and again only on `s?.walkIx` (:337). The learner effect (:339) clears only the typed text. A switch restores the next learner's own walkIx (`store.ts:449`; 0 without a practice). So on the same index, the transcript of the learner who left stays on screen, and Send posts it for the next learner. | none recorded | delivered, f5a854c0 (7d-2, run c976c3d8) |
| P10-a | (7d-2) A hint's lesson pick runs with the learner who asked as its learner: `runJob` takes an `askedBy` option (`desk/src/lib/desk/job.ts:38`, read at :93), and the hint route passes `who.id` (`desk/src/app/api/hint/route.ts:68`). Its done line is gated on that learner. The pick lands in that learner's away slot when they are not seated. It never replaces the seated learner's pick: inside `runJob`, a superseding run whose asker is not seated is refused with 409 while the seated learner's run of that kind is running (`job.ts:95-96`). | P10 as written starts no pick after a switch, and no pick leaves the hint stuck on 'Finding the lesson…' (`desk/src/tv/screens.tsx:184`). | P10 as written. | delivered, c50e69cc (run c976c3d8) |
| P11-a | (7d-2, the shape of P11) A Job records who asked: `by`, set by `job.start` (`desk/src/lib/session/store.ts:343`; `runJob` passes it at `job.ts:100`). One exported function in `job.ts`, `blocksRun` (:83), decides whether a running job blocks a new one. It blocks only when it belongs to the seated learner or has no `by`. `runJob` (:94) and the hint route (`hint/route.ts:29`) both call it. The `job.failed` reducer deletes the record when `by` is not seated (`store.ts:643`), so the next learner gets no Try again on the input of the learner who left. The retry route answers MOVED_ON when the failed job's `by` is not seated (`desk/src/app/api/session/retry/route.ts:30`). Accepted beyond the ruled shape: the start status line is written only while the asker is seated, following P9. | P11 (i) and (ii). | none recorded | delivered, 5632c7d3 (run c976c3d8) |
| P13 | (7d-3) A hint's wait for its lesson ends when its pick ends without a lesson.set. It ends in the slot that holds that hint by its key, seated or away. The fix lives in the hint route, and the reducer is unchanged. `landed()` (`hint/route.ts:55`) sends the keyed lesson.set when the pick is no longer current, and a pick that does not end ok lands null (:68). There are three paths: (a) refused at start, by P10-a's refusal; (b) failed after the switch; (c) superseded by another learner's pick. Here the asker's own pick lands in the asker's away slot (the builder's choice, accepted). Guards: a re-ask by the same learner on the same key, and a seated hint with the same key but another owner. | 7d-2's report-only answer, confirmed by the App Master: a learner could come back to a stage-1 hint stuck on 'Finding the lesson…'. The App Master found path (c) at dispatch. | none recorded | delivered, 1aa3d4e8 (run 243b0a17) |
| P14 | (7d-3) `markLine` (`desk/src/tv/mathsRows.ts:284`) and `explainLine` (:300) do not show a running job whose `by` is set and is not the seated learner (`theirs()`, :268). `JobsOf` carries the learner. `MathsTV.tsx` is unchanged. | 7d-2's report-only answer, confirmed: after a switch, the next learner saw 'Marking...' or the explain line until the leaver's run ended. The student-working full r1 found it too (robustness-2, craft-6, value-7). | none recorded | delivered, 12cb1bf6 (run 243b0a17) |
| P15 | (7d-3) The phone's `explain()` drops a reply or an error that returns after the seated learner or the walk item changed. A seat ref is read after the await (`desk/src/app/phone/page.tsx:345`, `moved()` at :350), and busy still clears. The explain route is unchanged. | Student-working full r1 robustness-3. | none recorded | delivered, 1bbf359c (run 243b0a17) |
| P16 | (7d-4) `sendSecond`, the phone's typed second try (`desk/src/app/phone/page.tsx:361`), drops a result or an error that returns after the learner or the walk item changed, by P15's mechanism. | 7d-3's report-only answer 3, confirmed: a late error from `sendSecond` sets msg on the next learner's panel. | none recorded | delivered, 44cbbca1 (run 5ad42cde) |
| P17 | (i) (7d-5) On the phone, a switch to a different learner resets the last learner's work to its load values. A switch is the seated id becoming a defined id other than the last one seen. The reset covers paras, pix, readIx, note, info, source, pieceId, notice, shot, phase, q, msg, paperRows, typed, sentence and memory. A to none and back to A resets nothing. (ii) These handlers drop a reply or an error that returns after the seated learner changed, by P15's mechanism: send, sendSlot, sendRewrite, readPiece, acceptNotice, analyseParagraph, ask, retry, sendWorking, sendTyped, and the Say panel's 'Check it on the TV' button. After a switch, acceptNotice does not call readPiece. endSession is deliberate and unchanged. | 7d-4's report-only answer, which the App Master confirmed at 44cbbca1. After a switch, the next learner saw the last learner's essay. A read of that essay posted it to the new learner's shelf, or was refused with 'That piece is not on your shelf.' (`desk/src/app/api/texts/route.ts:41`; the brief named texts.ts, and this route file holds the text). paperRows, typed, sentence and memory were added at dispatch. | none recorded | delivered, 0edd8b13 (i) and 61d87bfc (ii) (run 200beb31) |
| P17-a | On a switch to a different learner, `clearLastLearnersWork` (`desk/src/app/phone/page.tsx:364`) also sets keep back to true and ring to null, their load values. A P17 (i) case covers it. | The App Master read page.tsx's useState list at 61d87bfc and found that P17 (i) left these two out: `keep` is at :82 and `ring` at :86. It was kept out of P18, because page.tsx and tools/phone-panel-test.cjs were in the student-working-explanation full r3 span. | none recorded | delivered, 5f9a8c67 (run 1ee1d75f) |
| P18 | In `load()` (`desk/src/lib/session/store.ts`, :748): a repair that throws goes through `setAside`: the file is kept as session.json.bad-*, the desk starts with SESSION_UNREAD, and one log line names the repair's error. A saved log that is not an object is repaired to the empty evening log, with one line. `awayShown` drops a slot that is not an object, and gives a pages or tasks field that is not a list the empty list, with one line each. | Full r2 must-address (robustness-2), and its two more shapes, log: null and an away slot with pages: null. | Fixing the data where it throws, in the reducer. | delivered, 84832dfa (run 80b15cc1) |
| P18-a | (i) A session.json that `readFileSync` cannot read goes through `setAside`. (ii) A session.json the desk could not use and could not put aside is never overwritten: each later write tries the aside again, and writes only once it lands. (iii) In a log that is an object, each wrong field is repaired to `fresh()`'s value. (iv) An away slot's log is repaired the same way. | P18's report-only answers 1 and 2, which the App Master confirmed at 84832dfa. `log: {}` and an away slot with `log: null` make every dispatch throw in `stamped` (`store.ts:570-571`), through `loggedIn` (:556), which reads `l.problems.length` and `x.log`. | `setAside` on a read failure alone. When the rename fails too, the next save still overwrites the file. | delivered, 34f7b4bf (run 1ee1d75f) |

Delivery 7 was split into 7a, 7a2 and 7b, on one lane. Lost: one branch. The reasons: P4's files (`desk/src/app/phone/page.tsx` and `desk/src/tv/keys.ts`) were in the hint full r2 span, and 7a had to merge before digest full r3, whose span holds `store.ts`.

7a, as delivered (one commit, 4fef0a35):
- Five files: `desk/src/lib/session/store.ts`, `desk/src/app/api/session/route.ts`, `desk/src/app/api/analyse/route.ts`, `desk/package.json` and the new `tools/learner-switch-test.cjs`.
- `SESSION_UNREAD` (`store.ts:511`) and the refusal sentences (:512-520) are in `store.ts`.
- `learner.set` (`store.ts:589`) and `profile.save` (:603) both call `switchedFrom`.
- Saving the seated learner's own profile keeps the conversation.
- An `english.set` for a learner who is not seated is dropped and logged (`store.ts:644`), and the analyse route passes `owner: who.id` (`desk/src/app/api/analyse/route.ts:28`).
- The merge gate: 75 suites and 1356 tests at 4fef0a35, and 1359 at 60d9398c after 7a2.

7a's suite order (7a question 2): `tools/learner-switch-test.cjs` runs second to last, because `tools/harness-rules-test.cjs` asserts that it is itself the last entry (`tools/harness-rules-test.cjs:93-97`; the list ends at `desk/package.json:91-92`). Ruled, no change.

Lite r2 (round 2026-10-10-learner-profile-multi-learner-switching-lite-r2, run e1fc9eaf) was judged at 60d9398c on a span of 14 files. Drift against lite r1: changed. Result: ready 0.7036, coverage 0.70, uncalibrated.
- Scores: robustness 0.80, value 0.70 (low confidence), craft 0.65 (low confidence). Rivalry and economics are not judged in lite.
- Must-address: none.
- The council answered each lite r1 line with a reproduction on a temp `DESK_DATA_DIR`, and each line is closed. Line 1: a truncated session.json, a junk one, one with a single bad profile, and a blocked write. Line 2: a new profile saved from a seated learner's desk. Line 3: learner A's Sentence reading landing after B sat down.

Lite r2 mediums:
- In 7b: robustness-5 and value-1 (P4-a), robustness-7 (P7-a), robustness-6 (P8).
- Unslotted:
  - robustness-2: a single bad profile is dropped with only a log line, and the next write erases it;
  - robustness-3: a set-aside roster has no way back;
  - robustness-8 with value-2: no way to remove a profile, and the demo pair is on every fresh desk (the part P6 ruled out);
  - craft-2: `store.ts` carries persistence, load repair and the switching rules inline;
  - craft-4: several refusals reach the learner only through one shared status line;
  - robustness-10: three cases in `tools/learner-switch-test.cjs` would also pass on lite r1's code.

Next, ruled 2026-10-10: 7b lands before the learner-profile full r1. 7b waits for digest full r3 to settle, because `desk/src/app/phone/page.tsx` and `store.ts` are in that span. The full r1 has to wait for digest r3 anyway, because one Opus council runs at a time. Under the plan change no lite r3 runs: 7b reworks the mediums of a lite-ready major, and the full r1 follows its merge.

7b, as delivered (four commits, run 27364288):
- Eight files: `desk/src/app/phone/page.tsx`, `desk/src/lib/desk/job.ts`, `desk/src/lib/session/learners.ts`, `desk/src/lib/session/store.ts`, `desk/src/tv/keys.ts`, `desk/src/tv/screens.tsx`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`.
- P8 (be3ac14d): a Job keeps the status text it set at its start (`Job.start`, `desk/src/lib/session/store.ts:228`). `switchedFrom` (`store.ts:546`) and the practice line (`store.ts:710`) clear the status only while it still reads that text.
- P7-a (3ad55a23): `learners.ts` exports `LearnersUnread` (:157), which `writeLearner` (:162), `readLearner` (:288) and `saveEnglish` (:299) throw. `jobError` (`desk/src/lib/desk/job.ts:72`) recognises it by type (:74) and says `LEARNER_UNREAD_RUN` (`store.ts:509`): 'The learner file could not be read just now, so this was not saved.' The startup reads go through `readLearner` (`store.ts:802-810`), set `LEARNER_UNREAD` once, and show no paper.
- P7-b (21a3e500): as its row says.
- P4 with P4-a (3a0a70f8): the pure `switchEndsLine` in `keys.ts`, shown in the TV Learner caption (`desk/src/tv/screens.tsx:406`) and in the phone's 'Not X?' line (`desk/src/app/phone/page.tsx:418`).
- The merge gate: 75 suites, 1370 tests, all green.

7b's questions, ruled:
1. P8's constraint quotes the practice start status as 'writing your set…'. The code says 'writing a practice set…' (`desk/src/app/api/practice/route.ts:19`). The cases use the real texts. Ruled, no change.
2. The bare catch over `settleOwners` could never fire, because `settleOwners` swallows its own `historyOf` errors. The startup notes an unreadable file through a wrapper around `readLearner`. Accepted as built.
3. `LEARNER_UNREAD_RUN` is the one new sentence, because `LEARNER_UNREAD` says progress is 'not shown', which is wrong for a save. Accepted as built.
4. A running Essay Master reading is dropped by a switch but was not named, because P4-a listed only the Sentence reading. Ruled as P4-b.
5. No screenshot of the TV or the phone was taken, because no dev server was allowed. Noted.

The App Master's check of 7b against its brief: one commit per ruling. The P8, P7-a and P7-b cases were shown failing on 2498060d and passing after, and P4's function did not exist there. `desk/src/app/api/hint/route.ts`, `desk/src/maths/` and `desk/src/lib/rules/` are unchanged. `jobError` matches by type, not by text. WD12's no-sheet pin is unchanged. No em dash was added. Two gaps: P4-b and P7-c.

Next, ruled 2026-10-10 (round 9): delivery 7c (P4-b and P7-c) lands before the learner-profile full r1, because `keys.ts` and `tools/learner-switch-test.cjs` are in that span. The full r1 follows its merge. 4b may run beside the full r1, because its files are outside that span.

7c, as delivered (two commits, run 8704f32e):
- f0524369 (P4-b) and 1245013b (P7-c), rebased from adbd89cc and bf5f2584. Those two are objects in the repo, and neither is an ancestor of `main`.
- Three files: `desk/src/tv/keys.ts`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`.
- `turnState` is imported into `keys.ts`, with no new predicate.
- The old 'essay gives null' assertion was changed and named.
- The P4 essay case and the P4-b case failed on 17ffb8a7.
- The P7-c byte check comes before the restore.
- The gate: 75 suites, 1371 tests.

Full r1 (round 2026-10-10-learner-profile-multi-learner-switching-r1, run c916b03c):
- It was judged at 1245013b on a span of 17 files: lite r2's 14, plus `job.ts`, `tools/learner-switch-test.cjs` and `tools/week-digest-test.cjs`. `turn.ts` was read as a dependency.
- Result: ready 0.5585, coverage 1.00. The judges are uncalibrated.
- Must-address, verbatim: 'robustness: A run that outlives a switch writes its status line onto the next learner's desk (observed, untested)'. Ruled as P9. P10 and P11 were found after it.
- Other findings, all unslotted:
  - value: a switch ends a Linga scene, a level check and a running Essay Master reading. The switcher warns about it, but the work is not kept.
  - value and rivalry: the demo learners Ema and Jakub are seeded on every fresh or reset desk, and they cannot be removed.
  - economics-2: a dropped reading is not stopped. It spends its calls and still writes the leaving learner's history.
  - rivalry-1: there is no grown-up gate on making or editing profiles. This is recorded as owner decision D1.
  - craft-1: the switch has four owners and no field-by-field rule, and the field awaiting already leaks across a switch. Candidate 7e.
- Evidence ceiling: no L2 run has put two learners at one desk. Rivalry has low confidence.
- Method incident (economics-5): the economics member's temp cleanup deleted %TEMP%/council-econ-hpr, a directory it had not created. No tracked file and nothing in `desk/data/` was touched. It is with the owner.
- The Report and the Approval reached the owner on 2026-10-10. The Approval is the owner's to decide.

7d, as delivered (one commit, 7955c66d, run c2a3c969):
- Three files: `desk/src/lib/desk/job.ts`, `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs`.
- Cases (a) to (e), where case (c) goes through the real hint route.
- On 1dfcfdae, cases (a), (b), (c) and the (d) start-text case failed, and the (d) left-alone case and the (e) controls were green.
- No pin moved.
- The gate: 75 suites, 1399 tests.

Next, ruled 2026-10-10 (round 10): delivery 7d-2 (P10, P11 and P12) lands before the learner-profile full r2, because the r2 would meet P10 again in its own replay and spend round 2 of 3. The full r2 follows 7d-2's merge. Full councils still run one at a time.

7d-2, as delivered (three commits, run c976c3d8):
- Commits: 5632c7d3 (P11), c50e69cc (P10-a) and f5a854c0 (P12).
- Seven files: `desk/src/app/api/hint/route.ts`, `desk/src/app/api/session/retry/route.ts`, `desk/src/lib/desk/job.ts`, `desk/src/lib/session/store.ts`, `desk/src/app/phone/page.tsx`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs`.
- Seven new cases. The six that are not controls failed on base a5a0eb19, and the P11 control was green there.
- One pin moved, robustness-1 (b): a failed job is now removed after a switch. `tools/desk-jobs-rules-test.cjs` is unchanged.
- The gate: 75 suites, 1412 tests.

7d-3, as delivered (three commits, run 243b0a17):
- Commits: 12cb1bf6 (P14), 1aa3d4e8 (P13) and 1bbf359c (P15).
- Six files: `desk/src/tv/mathsRows.ts`, `desk/src/app/api/hint/route.ts`, `desk/src/app/phone/page.tsx`, `tools/maths-tv-test.cjs`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs`. `store.ts` and `job.ts` are unchanged.
- On base f5a854c0, the P14 case and P13 (a), (b) and (c) failed, and the controls were green. P15's case failed only structurally, because its cut point did not exist there.
- No pin moved. The gate: 75 suites, 1425 tests.
- Its report-only answers, ruled:
  1. memory: a late run of the learner who left writes that learner's own file (`addMemory(learnerId)`, `desk/src/lib/session/learners.ts:373`). teach: a late lesson is dropped (`desk/src/app/api/worked/route.ts:24`, `run.current()` and seated). Both are safe, and no row is added. This closes the memory and teach audit that 7d-2 left open.
  2. Item keys are unique across learners by construction: a page id is the subject plus `Date.now()` (`desk/src/app/api/read/route.ts:27`), and a page has one owner. So P13's guard is safe.
  3. The late sendSecond error is ruled as P16.
  4. P13 (c)'s landing choice is recorded in P13.

Next, ruled 2026-10-10 (round 11): 7d-4 (P16) lands before the learner-profile full r2, because `page.tsx` is in its span. Then the two full r2s, this feature's and student-working-explanation's, one full council at a time.

7d-4, as delivered (one commit, run 5ad42cde):
- Commit 44cbbca1 (337300e8, rebased onto 50ee1e31). It is an ancestor of main.
- Two files: `desk/src/app/phone/page.tsx` (+5/-1; `sendSecond` is at :361) and `tools/phone-panel-test.cjs` (+47).
- The test 'P16 sendSecond()' has five sub-cases. Fail-before on 0a5a5296: (a) green, (b) red, (c) red, (d) red, (e) green.
- The P15 test is unchanged.
- The gate: 75 suites, 1438 tests.
- The merge gate skipped typecheck, and the App Master ran tsc at 44cbbca1: exit 0.
- Its report-only answer is ruled as P17.

Next, ruled 2026-10-10 (round 12): 7d-5 (P17) lands before the learner-profile full r2, because `page.tsx` and `tools/phone-panel-test.cjs` are in its span. The full r2 follows its merge.

7d-5, as delivered (two commits, run 200beb31):
- Commits: 0edd8b13 (P17 i) and 61d87bfc (P17 ii), rebased from a40f78c6 and 15615652. Those two are objects in the repo. Both new commits are ancestors of main.
- Two files: `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs`.
- The test file has 0 removed lines (+116/-0 across the two commits), so P15 and P16 are unchanged.
- Fail-before on f05bd322 (16 red of 70 in phone-panel-test): P17 (i) is a structural red, because the '// P17 (i) begin' marker does not exist there. P17 (ii) is a behavioural red for the switch case of ten handlers (send, sendSlot, sendRewrite, readPiece, acceptNotice, analyseParagraph, ask, retry, sendWorking and sendTyped), and for the readPiece 428 and ok-piece case and the acceptNotice-no-readPiece case. The Say button's two cases are structural reds, because the named handler did not exist. The control cases of the other ten handlers are green before and after.
- The gate: 75 suites, 1470 tests (base 1438).
- The App Master's tsc at 61d87bfc: exit 0.
- Its report-only answer on useState ownership is ruled as P17-a (keep and ring).

Full r2 (round 2026-10-10-learner-profile-multi-learner-switching-r2, run 73da4bac):
- What was judged: 61d87bfc, a span of 21 files (r1's 17 plus `desk/src/app/api/hint/route.ts`, `desk/src/tv/mathsRows.ts`, `tools/maths-tv-test.cjs` and `tools/phone-panel-test.cjs`). The App Master derived the span.
- The result: ready 0.5625, coverage 1.00, round 2 of 3, with uncalibrated judges. Scores, with the delta against r1: value 0.60 (+0.03), craft 0.57 (-0.05), rivalry 0.55 (0.00), robustness 0.60 (+0.05), economics 0.40 (0.00).
- r1's must-address is closed. The stubbed replay (`replay/switch-status.cjs`) records each status event with the learner seated when it was written. Across five switch scenarios no status line landed on the next learner's desk. The report lists A4 (a hint finished after the switch), C2 (a hint failed after the switch), D3 (a reading ended after the switch) and E3 (a page read landed after the switch).
- The must-address line, verbatim from result.json, where it is stored truncated: 'robustness: A session.json that passes the two-field shape check but fails the repair is not put aside: the desk starts fresh, says nothing, and the next event overwrites the file, losing the...'. robustness-2's full title (`verdict-robustness.json`): 'A session.json that passes the two-field shape check but fails the repair is not put aside: the desk starts fresh, says nothing, and the next event overwrites the file, losing the TV-made profiles and every away slot'.
- The defect: in `load()` (`desk/src/lib/session/store.ts`), the shape check at :755 looks only at profiles and learner. Anything else wrong reached the repair's catch, which logged and returned `fresh()` with no `setAside`, so there was no SESSION_UNREAD and no session.json.bad-*. The replay (pages: 'x') ended with only the demo profiles, and one focus event later session.json on disk held neither child and no away slot. The same root has two more shapes: log: null and an away slot with pages: null.
- The line: A full round with a high line is reworked before the owner decides its Approval, so there is no Approval yet. The rework is P18.
- The findings below the must-address, one line each:
  - robustness-3 (med) with value-5 (low): a failure that outlives a switch is told only to the server log;
  - robustness-4 (med): a whole-piece reading that finishes after a switch is lost with no log line;
  - robustness-1 (low, r1's line closed), robustness-5 (low, gates), robustness-6 (low, two empty catches in store.ts), robustness-7 (low, two routes with no body cap) and robustness-8 (low, hard-fail checks);
  - value-1 (med): a practice set being written when the child is moved off the desk is dropped, and the switcher does not warn;
  - value-2 (med): the demo learners cannot be removed; value-3 (low), value-4 (low), value-6 (low);
  - craft-1 to craft-5 (med): four mechanisms for one rule, an enumerated eviction list, a hand-kept setter list on the phone, one job slot per kind with a `by` patch, and tests that slice production source; craft-6 to craft-8 (low);
  - economics-1 (med): a switch does not stop a stranded reading; economics-2 (med): a switch lifts the one-run-per-kind guard; economics-4 (med): away slots have no declared maximum and the whole session is rewritten on every event; economics-6 (med): no measured cost; economics-3 and economics-5 (low);
  - rivalry-1 (med): behind all three rivals on removing a profile; rivalry-2 (med): a switch ends the leaving learner's Linga scene, level check and reading; rivalry-3 to rivalry-5 (low).
- Ruled 2026-10-10: value-1, robustness-3, robustness-4, economics-4 and craft-5 are not slotted before the full r3, which judges them on the evidence. The r3 brief asks for a targeted replay of whether a dropped Essay piece still writes the leaving learner's history.
- The value member proposed five branches (two-children-interleaved, switch-mid-run, sibling-linga-mid-scene, parent-reads-both-children and fresh-desk-demo-learners). They are unmeasured, and no state.json declares them.

P18, as delivered (one commit, run 80b15cc1):
- 84832dfa: `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs` (+40/-4).
- R2-a, R2-b and R2-c were red before and are green after: pages: 'x', log: null, and an away slot with pages: null and tasks: 'x'.
- pages: 'x' makes the repair throw, as the reviewer said (`settleOwners` calls `.every` on it).
- The old P1 cases are unchanged and green, including 'a bad profile alone'.
- The gate: 75 suites, 1475 tests. tsc at 84832dfa: exit 0.
- Its report-only answers:
  1. A read failure in `load()` (`store.ts:751`) returns `fresh()` without `setAside` or SESSION_UNREAD, and the next save overwrites the unread file. Ruled as P18-a (i) and (ii).
  2. A log that is an object but has a field of the wrong type still loads silently. Ruled as P18-a (iii) and (iv), with the confirmed `log: {}` and `log: null` shapes.
  3. The empty catches: `store.ts:816` (the startup settle), :426 (`historyOf`), :911 and :946 (subscriber callbacks), :928 (`logWatched`) and :963 (tmp `rmSync`). Which two r2 robustness-6 meant is not stated. Stays unslotted.

Next, ruled 2026-10-11 (round 13): the pre-r3 rework (P17-a and P18-a, one delivery, two commits) lands before the learner-profile full r3, the last full round, because `desk/src/app/phone/page.tsx`, `tools/phone-panel-test.cjs`, `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs` are in its span. The full r3 follows its merge.

The pre-r3 rework, as delivered (two commits, run 1ee1d75f):
- Both commits are ancestors of `main` (checked with `git cat-file -e` and `git merge-base --is-ancestor`).
- 5f9a8c67 changes `desk/src/app/phone/page.tsx` and `tools/phone-panel-test.cjs`, +4/-3. 34f7b4bf changes `desk/src/lib/session/store.ts` and `tools/learner-switch-test.cjs`, +98/-5.
- The `store.ts` hunks are the Store type (aside), `load()` (:748), the new `keptLog` (:783) and `badLogFields` (:769), `setAside` (:794), `awayShown` (:823), the store init, and the aside guard at the top of `writeSession` (:987). No reducer changed.
- Fail-before was observed. On the old `page.tsx`, 'A to B' and 'A to none to B' were red. On the old `store.ts`, R3-a to R3-d were red. All were green after.
- The gate: 75 suites, 1480 tests. tsc exited 0.
- Its report-only answers, ruled:
  1. An `essayPlan.slots` that is not a list throws. It throws in `emptyOf` (`desk/src/lib/session/store.ts:376`), and on `essay.plan` (:666) and `essay.slot` (:669, which calls `planFill`). No test exercised it. Ruled as known limit (viii). It was named to the full r3 and is not slotted.
  2. No route reads `session.json` outside `load()` and `writeSession`. Only two comments name the file (`rules/mode.ts:24` and `session/learners.ts:5`). Accepted.

Full r3 (round 2026-10-11-learner-profile-multi-learner-switching-r3, run 333437c2), the last full round:
- What was judged: head f2645f41 and a span of 21 files, from its receipt.json. The App Master derived the span (r2's 21 files, unchanged). Four span files differ from r2: `store.ts`, `phone/page.tsx`, `tools/learner-switch-test.cjs` and `tools/phone-panel-test.cjs` (+141/-11). Nothing carried forward.
- The result: ready 0.5525, coverage 1.00, round 3 of 3, with uncalibrated judges. Scores, with the delta against r2: value 0.60 (0.00), craft 0.58 (+0.01), rivalry 0.45 (-0.10), robustness 0.65 (+0.05), economics 0.40 (0.00). No hard failure.
- r2's must-address line is closed (robustness-1, low). The replays are in `replay-aside.md`:
  - Scenario 1: a file with `pages: 5` is renamed `session.json.bad-*` with the same bytes, the desk starts with SESSION_UNREAD, and one log line names the repair failure.
  - Scenario 2: the rename is made to fail, and session.json is not written over until the rename lands.
  - Scenario 3: an unreadable session.json is put aside the same way.
  - Cases R2-a, R3-a and R3-b pass. One residual is recorded, not as a reopening: nothing reads an aside file back, and SESSION_UNREAD does not say where the old file went.
- The Essay answer. Simon's three-paragraph piece was being read when Nela was seated, and the reading was let finish. The route answers 200 with "3 of 6 sentences to fix across 3 paragraphs". The finished reading still writes the leaving learner's history in learners.json: a history line `writing: Structure: 3 of 6 sentences to fix, 3 paragraphs`, a writing-skill step for `structure` (seen 1), and one digest entry `{kind: essay, lens: structure, sentences: 6, faulty: 3}`. Nela's record is unchanged. When Simon is seated again, his desk shows paragraph 1 of 3 and "1 of 6 sentences to fix". Nothing says the reading was cut. So the desk shows 1 of 6 while his record and the parent's digest count 3 of 6. No case in the four span suites covers this path.
- The must-address line, verbatim from result.json, where it is stored truncated: 'robustness: A whole-piece Essay reading that outlives a switch leaves the leaving learner's away slot frozen at its first paragraph while their record says the reading finished; the failure path...'. robustness-2's full title (`verdict-robustness.json`): 'A whole-piece Essay reading that outlives a switch leaves the leaving learner's away slot frozen at its first paragraph while their record says the reading finished; the failure path has no case'.
- The findings below the must-address, one line each:
  - robustness-3 (med): a watched lesson whose history line cannot be written is swallowed with no log line and no status; robustness-4 (low): two routes parse the request body with no catch (`session/route.ts` and `analyse/route.ts`); robustness-7 (low): an essayPlan whose slots is not a list has no case; robustness-1 (low, r2's line closed), robustness-5 (low, hard-fail checks), robustness-6 (low, gate record) and robustness-8 (low, a cross-reference to economics);
  - value-1 (med): the same Essay reading as the must-address; value-2 (med): a sibling's turn ends a Linga scene or a part-way level check, with no Carry on afterwards; value-3 to value-6 (low), and value-time-saved (low);
  - craft-1 (med): the phone resets on a switch from a hand-kept list of 18 setters, and some per-learner state is outside it; craft-2 (med): EssayShelf refetches on a learner change with no stale-response guard; craft-3 (med): a switch drops a run's events instead of cancelling its work; craft-4 to craft-8 (low);
  - economics-1 (med): a dropped piece reading keeps calling the engine, at most 29 calls for a 30-paragraph piece; economics-2 (med): a switch cycle lifts the one-run-per-kind guard on analyse; economics-3 (med): every event rewrites the whole session.json, with no limit on away slots; economics-4 to economics-6 (low);
  - rivalry-1 (med): behind all three named rivals on guarding the switch, the profile edit and the Adult gate; rivalry-2 (med): behind Khan Academy Kids on deleting one learner; rivalry-3 to rivalry-6 (low).
- Four members reach the Essay reading from their own questions (robustness-2 high, value-1, economics-1 and craft-3 med, rivalry-5 low). Only robustness's class, an untested failure path, makes it must-address.
- Value is measured at confidence low. No L2 run has put two learners at one desk.
- This was the last full round. A fourth is refused, so the high line goes to the owner as a decision beside the Approval.

Next, ruled 2026-10-11 (round 14): the owner decides robustness-2 beside the r3 Approval (ask 28b44148). The options are to finish the reading into the away slot, to stop it at the switch, or to accept it as a known limit. No rework is slotted until he answers.

## 8. tv-phone-pairing

Lite r1: ready, 0.5036. Security-sensitive. A full round follows a clean lite r2.

Superseded (round 14): by the plan change of 2026-10-10 in the Process rulings, a lite-ready major goes straight to its full round after its rework. The pairing full r1 followed delivery 8 with no lite r2.

Must-address:
1. value: The QR and the printed addresses point at the host's first network adapter, which on the measured host is not the Wi-Fi
2. craft: A 4-digit code with no failure delay and no attempt budget: any device on the network becomes a phone in seconds

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PR1 | `phoneUrl` and the printed `/tv?key=` address prefer a private LAN IPv4 (192.168/16, 10/8, 172.16/12) over CGNAT 100.64/10 (Tailscale) and link-local. An explicit env override is kept. | Must-address 1. `phoneUrl()` takes the first non-internal IPv4 (`desk/src/lib/session/store.ts:349-352`); `desk/src/app/page.tsx:6` does the same; the key address is built at `desk/src/lib/session/pairing.ts:163`. | none recorded | delivered, 1c32a230, with a type cast at 04d6d002 (run b4747c7d) |
| PR2 | Keep 4 digits, because viktor-67 types badly and the QR carries the pin. Add a fixed delay on every refused join, and a desk-wide budget of failed joins with a cooldown. Never rotate the pin on lockout: that would lapse every joined phone. | Must-address 2. `desk/src/lib/session/pairing.ts`. | A longer code, and rotating the pin on lockout. | delivered, d5a94eff (run b4747c7d) |
| PR3 | A malformed or null POST `/api/session` body gets a 400 (R10). A failed read of `pairing.json` or `session.json` logs one line. | `desk/src/app/api/session/route.ts`. | none recorded | delivered, ae2469bd (run b4747c7d). Its session.json half was already on main (HF4, P18 and P18-a), so nothing was built for it |
| PR1-a | `DESK_PHONE_HOST` wins when it is set and not blank. Otherwise the non-internal IPv4 addresses rank 192.168/16, then 10/8, 172.16/12, CGNAT 100.64/10, link-local, and any other. Within a rank, an adapter named like vEthernet, WSL, Hyper-V, Docker, VirtualBox or VMware comes last, and ties keep adapter order. With no candidate, the answer is localhost. `phoneUrl()` (`desk/src/lib/session/store.ts:351`), `desk/src/app/page.tsx:6` and `tools/desk-dev-https.cjs` all use `lanHost()` (`desk/src/lib/session/lan.ts:24`). | A refinement of PR1, ruled at the dispatch of delivery 8. | none recorded | delivered, 1c32a230 (run b4747c7d) |
| PR2-a | Each refused guarded join waits `DESK_JOIN_DELAY_MS`, 1000 ms by default. Ten wrong codes start a five-minute, desk-wide cooldown. During the cooldown, any guarded join that carries a code is refused with `TOO_MANY_CODES` ('Too many wrong codes. Wait five minutes, then type the code again.', `desk/src/lib/session/pairing.ts:32`). The pin never rotates. The TV and an in-process join are never delayed, counted or held. The count lives in memory, so a restart clears it, and any successful join sets it to zero. | PR2's numbers, ruled at dispatch. | none recorded | delivered, d5a94eff (run b4747c7d) |
| PR4 | `cookiesOf()` never throws. It treats a value it cannot decode the way Next's own parser does, so the proxy and the stream read one Cookie header the same way. The stream draws each message outside the catch that guards the enqueue. A throw while drawing writes one log line and closes the stream. `cancel()` and a failed enqueue also clear the ping. | Full r1 must-address 5 (robustness-1). | none recorded | delivered, 33b91924 (run a41f6567) |
| PR5 | A quiet join is quiet only about the shake. For every refusal, one pure function in `desk/src/app/phone/panelFor.ts` decides the line to show, whether to shake (typed codes only), and whether to forget the stored code. A remembered code refused as not on the TV is forgotten, and the Join panel says 'The TV has a new code. Type the code the TV shows.' A cooldown refusal shows the route's text and keeps the stored code. The server's count does not change, so a phone counts at most once per reset. | Full r1 must-address 6 (robustness-2). | Not counting a former pin on the server, which needs a store of past pins. | delivered, 86df5492 (run a41f6567) |
| PR6 | At most 8 guest streams are open at once, desk-wide, and a ninth closes the oldest guest stream. TV, phone and in-process streams are not counted, and the cap never closes them. Each stream has a high-water mark of 32 messages. A stream whose reader stopped reading is closed and unsubscribed instead of queueing. | Full r1 must-address 7 (economics-1). | Refusing a ninth guest, which would let one device hold the lobby shut. | delivered, bc7b7730 (run a41f6567) |
| PR7 | The pin is drawn with `randomInt` from `node:crypto`, not with `Math.random` (`store.ts` `fresh()`). | Known limit (v) of the full r1. Craft did not judge it, because the round exited early. It is one line, in a security path inside the span. | Leaving it for the full r2 to judge. | delivered, b206d6c5 (run a41f6567) |
| PR8 | A phone's credential is its own. A join with the right code mints a random token for that phone with node:crypto, and the desk-phone cookie carries it. Beside the key, pairing.json keeps each phone's fingerprint (a hash of its token, never the token), when it joined and when it was last seen. A cookie is a phone while its fingerprint is listed. No credential holds the pin. A cookie of the old shape, the HMAC of the key and the pin, is no longer a phone. The TV's key and its address do not change. | Full r2 must-address 1 (craft-2, high). Every phone held the HMAC of the key and the pin (`phoneToken`, `desk/src/lib/session/pairing.ts:90`; `isPhone`, :94), one shared, unbound, non-expiring token. | Keeping the shared cookie and taking craft-2 to the owner as known limit (vi). | delivered, f2dc5262 (run 6d379b49) |
| PR9 | A phone not seen for 30 days lapses. The desk lists at most 8 phones, and a join over the cap forgets the phone seen least recently. 'Forget this desk' (the leave event) drops this phone's fingerprint, so its cookie is dead wherever it was copied. A TV reset forgets every phone, as today. Last seen is written at most once an hour per phone. pairing.json is written through a temp file and a rename. | craft-2 (no expiry, and no per-phone revoke short of a full reset). Also craft-11 (low): pairing.json is written in place. | none recorded | delivered, 3f42f564 (run 6d379b49) |
| PR10 | The code on the TV turns over after each phone joins with it, so a code that was seen stops working once it is used. A listed phone never needs the code, so the phone stops remembering it. A code that a phone stored before is cleared on its next open. PR5's remembered-code half is superseded; its typed and QR halves stand. | craft-2 (the display code is also a long-lived secret). Also the r2 stale-code answer: ten stale phones, or three stale phones plus seven typos, trip the cooldown. | A longer code, and a code that turns over on a timer. | delivered, dc511a47 (run 6d379b49) |
| PR8-a | A join with the right code from a phone or a guest mints a token of 32 random bytes (node:crypto, base64url), which the desk-phone cookie carries. pairing.json keeps a list, `phones`, beside `key`. Each entry is `{ fp, joined, seen }`. fp is the SHA-256 of the token. joined and seen are epoch milliseconds. A cookie is a phone while its fingerprint is listed and has not lapsed, compared in constant time. `phoneToken` is removed. A listed phone that joins with no code stays a phone with its own cookie: no new token, and the code does not turn over. One that joins with the right code gets a new token, which replaces its entry. The TV's join and an in-process join set no cookie and change no list. | PR8, ruled at the dispatch of 8c | none recorded | delivered, f2dc5262 (run 6d379b49) |
| PR9-a | The lapse is 30 days since seen. At most 8 phones are listed, and a join that would list a ninth drops the phone seen least recently. seen is written to the file only when the stored value is an hour old or more. A failed write logs one line, and the caller stays a phone. A leave that carries a listed cookie drops that fingerprint. A reset the route accepts empties the list. Every write of pairing.json, including the key's first write, goes to a temp file and is renamed over it. | PR9, ruled at the dispatch of 8c | none recorded | delivered, 3f42f564 (run 6d379b49) |
| PR10-a | After a join with the right code from a phone or a guest, the route dispatches a new server-only event, `pin.turn`. The store then gives the session a new pin, drawn as `fresh()` draws it and never equal to the pin just used. The phone no longer stores the code. It removes a stored `desk.pin` on open, and never joins with a stored code. The Forget link is offered while the device is a phone. `JoinHow` loses 'remembered', and `joinRefusal` its row. The typed and QR rows stand. The cooldown is unchanged. A used code typed again is a wrong code, and it counts. | PR10, ruled at the dispatch of 8c | none recorded | delivered, dc511a47 (run 6d379b49) |
| PR11 | PR11. A pairing write that fails changes nothing, and the phone says what happened. Forget this desk says the phone is forgotten only after the desk answers that it is. A right code whose phone cannot be saved leaves the pin, the joined flag and the wrong-code count as they were. The phone is told the desk failed, not that the code was wrong. A TV reset that cannot forget the phones resets nothing. | Full r3, robustness-1 (Forget this desk swallows a failed leave and has already told the user it worked) and robustness-2 (A right-code join that fails on the server is shown as a wrong code, after the pin, the joined flag and the wrong-code count were already changed), with robustness-3 (An unwritable pairing.json leaves memory and file disagreeing on leave and on a TV reset) as their server half. | forgetting in memory first and putting the file right on the next read | delivered, 80a4447a (run 0e2af485) |
| PR11-a | (1) pairing.ts: a write of the phone list builds the next list, writes it through save's temp file and rename, and only then puts it in memory. mintPhone, forgetPhone and forgetAllPhones all go this way. When the write throws, the cached list is exactly what it was, and the throw reaches the caller. The lapse filter still applies to what is written and kept. isPhone's last-seen write and the first key mint stay as they are. (2) pairing.ts, beside WRONG_CODE (:30), three exported lines: JOIN_NOT_SAVED = 'The desk could not save this phone, so nothing changed. Type the same code again.'; LEAVE_NOT_SAVED = 'The desk could not forget this phone, so it is still paired. Try again.'; RESET_NOT_SAVED = 'The desk could not forget its phones, so nothing was reset. Try again.'; (3) route.ts, join: a join that mints (a guarded join with the right code) calls mintPhone first. If it throws, log one console.error line naming pairing.json and the error, in the shape of isPhone's line. Answer 500 with { error: JOIN_NOT_SAVED } and no Set-Cookie. joinSucceeded, the join dispatch and pin.turn do not run. If the mint succeeds, the rest runs in today's order and the cookie carries the minted token. The TV join, the in-process join and a listed phone's join with no code are unchanged. (4) route.ts, leave: forgetPhone in a try. On a throw: one console.error line, a 500 answer { error: LEAVE_NOT_SAVED }, and the cookie is not cleared. On success, as today. (5) route.ts, reset: forgetAllPhones in a try. On a throw: one console.error line, a 500 answer { error: RESET_NOT_SAVED }, and dispatch(reset) does not run. (6) panelFor.ts, joinRefusal: an answer of 500 or above never shakes and never forgets the code. It shows its error. When it has none, it shows JOIN_DESK_FAULT = 'The desk had a problem and did not join this phone. Type the same code again.' Every other row stays as it is. (7) panelFor.ts, a new pure rule: leaveOutcome(r: { status: number \| undefined; error: string \| undefined }): { line: string; forgotten: boolean }. A status from 200 to 299 gives { line: 'This phone will ask for the code next time.', forgotten: true }. No answer (status undefined) gives 'That did not reach the desk.', the text joinRefusal already uses, with forgotten false. Any other answer gives its error. When it has none, it gives LEAVE_DESK_FAULT = 'The desk had a problem and did not forget this phone. It is still paired: try again.' Forgotten is false. (8) page.tsx, forget(): it sets no line before the answer. It posts leave, reads the status and, when the answer is not ok, the JSON error. It hands them to leaveOutcome and shows its line. It calls reconnect() only when forgotten is true. A rejected post is the no-answer row. No empty handler is left in forget(). | PR11, ruled at the dispatch of PR11 | none recorded | delivered, 80a4447a (run 0e2af485) |
| PR12 | PR12. The TV, and each listed phone, keep at most 4 session streams open at once. A fifth lets the oldest stream of that device go. It reopens by itself, the way the guest cap works. A copied phone cookie shares its phone's 4. Guests and in-process streams are unchanged. | Full r3, economics-1 (The session stream's fan-out has no ceiling for TV and phone streams: per-dispatch cost grows with how many streams a credentialed client opens). | one desk-wide cap on all TV and phone streams, because one phone could then push out the TV's stream; refusing the newest stream instead of letting the oldest go, because the newest is the page the person is looking at | delivered, e6d6af46 (run ba253bba) |
| PR12-a | All in stream/route.ts. (1) Add DEVICE_STREAMS = 4 beside GUEST_STREAMS, with a doc comment in the shape of GUEST_STREAMS'. The GUEST_STREAMS comment says 'The TV, a phone and an in-process stream are not counted'. Rewrite it so it is true: in-process streams are not counted, and the TV and phones have their own cap. (2) Add a second list on the global object, beside guests(): globalThis.__deskDeviceStreams. It is a Map from a device key to that device's close functions, in opening order. The key is 'tv' for a stream whose roleFrom(req) is tv. For a phone, the key is the fingerprint of its desk-phone cookie: the sha256 hex of (cookiesOf(req).get(PHONE_COOKIE)?.value ?? ''), using node:crypto createHash the way pairing.ts fingerprint() does. No raw token is kept as a key. Export nothing new from pairing.ts; it is outside your paths. (3) In start(): for a tv or phone stream, while its key's list holds 4 or more, call the oldest's close (list.shift()!()). Then push this stream's own close. The guest branch at :33 stays as it is. (4) release() also takes the stream's close out of its device list. When that list is empty, it deletes the key, so the map does not grow as phones come and go. (5) The role is read once, when the stream opens, as the guest branch does today. A stream does not move between lists when liveRole later draws it as a guest. | PR12, ruled at the dispatch of PR12 | none recorded | delivered, e6d6af46 (run ba253bba) |

Left for a later round, by ruling (round 14): expiry and per-phone revoke, a per-device token, and the desk-wide `joined`. Reopened in part (round 15): PR8 to PR10 take the per-device token, expiry and per-phone forgetting. A list of phones on the TV and the desk-wide `joined` stay left.

Delivery 8, as delivered (four commits, run b4747c7d):
- Commits: 1c32a230 (PR1), d5a94eff (PR2), ae2469bd (PR3) and 04d6d002 (a type cast on `lan.ts`, +1/-1). All four are ancestors of `main`.
- Seven files: `desk/src/lib/session/lan.ts` (new), `desk/src/lib/session/store.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/app/page.tsx`, `desk/src/app/api/session/route.ts`, `tools/desk-pairing-test.cjs` and `tools/desk-dev-https.cjs`.
- Fail-before was observed. The 14 new cases were written first and run on 4aa3601f, and all were red except one guard (TV and in-process joins are never counted), which passed before.
- In a cooldown the right code is refused, the pin is unchanged, an earlier phone is still a phone, and the TV and an in-process join get in. The cases are at `tools/desk-pairing-test.cjs:306` (ten wrong codes, then the right code refused with the line, and joined after the cooldown), :320 (the lockout leaves the pin; the TV at :327 and an in-process join at :328 join during it) and :330 (the TV and in-process joins are never counted).
- The gate: 75 suites, 1498 tests. tsc exited 0 at 04d6d002 for the builder, the Director and the App Master. The first tsc run had printed `src/lib/session/lan.ts(31,53): error TS2367`, which the cast fixed.
- Report-only, ruled:
  1. The pin is drawn by `Math.random` (`desk/src/lib/session/store.ts:464`) and compared with `!==` (`desk/src/app/api/session/route.ts:61`). Neither was built. Ruled as PR7 for the draw.
  2. The phone shows the route's error text (`desk/src/app/phone/page.tsx:160`). The cooldown line and WRONG_CODE or NO_CODE appear verbatim. A 1 s wait has no spinner.
- The App Master's reading: `joinSucceeded()` (`desk/src/lib/session/pairing.ts:59`) zeroes the count on every successful join, including the TV's and an in-process one. The phone's quiet rejoin with a remembered code is a guarded join, so a stale code counts toward the budget.

Full r1 (round 2026-10-11-tv-phone-pairing-r1, run cf79b2aa):
- What was judged: 04d6d002 and a span of 17 files: lite r1's 14 plus `desk/src/lib/session/lan.ts`, `desk/src/app/page.tsx` and `tools/desk-dev-https.cjs`. The App Master derived the span.
- The result: fail, overall 0.28, coverage 0.25, round 1 of 3, with uncalibrated judges.
  - Robustness scored 0.40, under its 0.50 mechanical floor, which binds at every trust state. So the round exited early, and value, craft and rivalry are unmeasured.
  - Economics scored 0.10. There was no hard failure.
  - The gates: the merge gate record of run b4747c7d was cited (75 suites, 1498 tests), the council's tsc exited 0, and lint is unmeasured.
- The seven must-address lines, verbatim from result.json:
  1. 'robustness scored 0.4 below its floor of 0.5'
  2. 'value is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  3. 'craft is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  4. 'rivalry is unmeasured: The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state), so this judged member was not run (council SKILL.md...'
  5. 'robustness: The session stream's catch {} swallows a throw from liveRole/view: a joined phone carrying one malformed foreign cookie gets a stream that never sends a message, and nothing is logged'
  6. 'robustness: A quiet join refusal is dropped on the phone and the refused remembered code is kept, so stale phones after a reset fill the desk-wide budget and lock out the correct code with no...'
  7. 'economics: A guest can open lobby streams without limit, and every dispatch, a join included, fans out to all of them with no ceiling and no backpressure'
  - Item 6 is stored truncated. robustness-2's full title (`verdict-robustness.json`): 'A quiet join refusal is dropped on the phone and the refused remembered code is kept, so stale phones after a reset fill the desk-wide budget and lock out the correct code with no reason shown'.
  - Items 5 to 7 are robustness-1, robustness-2 and economics-1, all high. Items 2 to 4 are the rows the early exit left unjudged.
  - Item 5, executed in-process: a clean cookie jar got its first message (1349 bytes); with `; other=%E0` added, no message arrived and nothing was logged. `cookiesOf()` decodes with no guard, and the proxy uses Next's tolerant parser.
  - Item 7, run once in-process: with 2000 guest streams, median dispatch went from 0.54 ms to 30.5 ms.
- Lite r1's two lines are both closed at this head.
  - Line 1 (the QR and the printed addresses): closed by replay RA. On the measured host (Tailscale 100.100.134.107, Wi-Fi 2 10.0.0.140, vEthernet (WSL) 172.25.208.1) every surface gives 10.0.0.140.
  - Line 2 (a 4-digit code with no failure delay and no attempt budget): closed as worded, by replay RB. Each refusal waits 1000 ms. 10 codes are checked in the first 5 minutes and 120 in 60 minutes, so finding the pin takes 37.5 h on average and 75 h at worst. A correct guess during the cooldown is refused (403). 200 guesses fired at once: 10 were checked and 190 refused.
  - What still lets a guesser past the budget: when another device's correct join falls between bursts of nine, the count resets. 45 codes were checked in 45 s with no cooldown.
- The remembered-code replay: after a TV reset, ten reopenings of /phone with the old code start the cooldown, and the parent's right code is then refused ('Too many wrong codes. Wait five minutes, then type the code again.'). The phone shows nothing for the quiet refusal, and the stale code stays in localStorage. A phone that joined before a lockout is still a phone (replay RD): the pin is unchanged, and it works as before.
- Known limits (i) to (viii), from report.md section 9:
  - (i) The budget is desk-wide: one device's ten wrong codes, or the family's own stale reopenings, lock every new phone out for five minutes. The TV and already-joined phones are untouched.
  - (ii) The budget lives in memory, so a restart clears it and keeps the pin. Confirmed in code, not replayed, not judged.
  - (iii) Any successful join zeroes the count, including TV and in-process joins (`route.ts:65`). Replayed: nine wrong codes, then a family join, five times over, checked 45 codes in 45 s.
  - (iv) About 120 codes an hour, measured. Not judged.
  - (v) The pin comes from `Math.random` and is compared with `!==` (`store.ts:464`, `route.ts:61`). Not judged. Ruled as PR7.
  - (vi) Expiry, per-phone revoke, a per-device token and the desk-wide `joined` are left for a later round, by ruling. Not judged.
  - (vii) A refused join waits a second, and the phone shows no sign that it is waiting (economics-2).
  - (viii) `tools/desk-dev-https.cjs` loads `lan.ts` through ts-load, and only `--address` has been run. The certificate and next-dev path is unmeasured.
- The findings below the must-address, one line each:
  - robustness-3 (med): several declared or reachable failure paths have no case in the suites; robustness-4 (low): gate composition; robustness-5 (low): `drop/page.tsx` `join()` has no catch around its fetch; robustness-6 (low): `lanHost()` calls `os.networkInterfaces()` unguarded at store module load; robustness-7 (low): per-refusal timers with no concurrency cap; robustness-8 (low): hard-fail checks, none present;
  - economics-2 (med): a refused join holds one 1 s timer and the open request, with no cap on how many are held; economics-3 (med): the client reopens its stream every 1.5 s on error with no attempt cap and no backoff; economics-4 to economics-7 (low).
- Unmeasured, and why: the rivalry member made no web lookups, and craft did not read the device-pairing registry subject. No L2 run: nobody has paired a physical phone, scanned the QR with a camera or paired a second phone.
- A full fail is reworked. The rework is 8b (PR4 to PR7). Full r2 runs all five members after it merges.

Next, ruled 2026-10-11 (round 14): 8b goes first on the delivery lane, ahead of delivery 6. A full fail on a security-sensitive feature that every journey starts with is reworked before new work, and 8b is small. Items 1 to 4 close only when full r2 runs every member; 8b does not answer them. The other findings and known limits are not slotted, and full r2 judges them on the evidence.

Delivery 8b, as delivered (six commits, run a41f6567, merged at 99bcc80e):
- Commits: 33b91924 (PR4), 86df5492 (PR5), bc7b7730 (PR6), b206d6c5 (PR7, with the robustness-3 (a) and (d) pins), and edc5b2bd and 99bcc80e. The last two spell the PR5 em dash check as an escape: edc5b2bd left the class broken and 99bcc80e fixed it. All six, and 63043881, are ancestors of `main` (git cat-file -e and git merge-base --is-ancestor, checked).
- Seven files, +207 -15: `desk/src/app/api/session/stream/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/panelFor.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/lib/session/store.ts` (the pin line and its `randomInt` import only, :9 and :465), `tools/desk-pairing-test.cjs` and `tools/phone-panel-test.cjs`.
- Fail-before was observed: PR4 had 3 red cases, PR5 had 7, PR6 had 3, and PR7 was red on the Math.random check. Guards that passed before:
  - the PR5 route-text check;
  - PR7's range half;
  - robustness-3 (a): 200 concurrent wrong joins, 10 checked and 190 refused;
  - robustness-3 (d): a TV join during the cooldown joins.
- The gate: 75 suites, 1515 tests, 0 failed. tsc exited 0 at 99bcc80e for the builder, the Director and the App Master.
- Report-only, confirmed from that run's result.json and cited on main:
  - Next leaves out an undecodable cookie value and keeps the last of a duplicated name, while `cookiesOf` (`pairing.ts:103`) keeps the first;
  - `cookiesOf` is called only by `liveRole` (`pairing.ts:127`), and `liveRole` only by the stream (`stream/route.ts:37`);
  - the `tvKey` mint (`pairing.ts:79-83`) is outside its try;
  - `drop/page.tsx` opens no stream (it has no EventSource), and the only `EventSource` among the pages is in `desk/src/tv/useSession.ts:19`;
  - there is one stream per TV page and one per phone page.
- Known limits named to full r2 besides (i) to (viii), from the r2 report section 8:
  - (ix) `tvKey` mints outside its try: with an unwritable data dir the proxy throws on every reopen and a right-code join throws, and the phone reopens every 1.5 s (robustness-5, low);
  - (x) a duplicated cookie name: `desk-phone=bad; desk-phone=<good>` gives proxy phone and stream guest; the divergence only downgrades (robustness-2, med; craft-7, low);
  - (xi) the refusal line shows in the shared status bar (`page.tsx:688`), not in the Join panel; no member scored it;
  - (xii) `panelFor.ts` carries copies of the route texts; the copies match and `phone-panel-test.cjs:709` checks them (craft-9, low, suggests 429 with Retry-After);
  - (xiii) a status with no error text reads as a wrong code: a 500 with no JSON forgets a right remembered code (robustness-3, med; robustness-7 and value-7, low);
  - (xiv) eviction churn with more than eight guests: 8 guests make 0 reopens in 60 s, 9 make 40, 20 make 469, 50 make 1639 (economics-5 and craft-12, low).

Full r2 (round 2026-10-11-tv-phone-pairing-r2, run 8ed29bf1):
- What was judged: head 99bcc80e and the 17-file span from started.json. The App Master derived the span. Drift: changed.
- The result: ready 0.5155, coverage 1.00, round 2 of 3, uncalibrated judges, no hard failure. Scores: value 0.50, craft 0.45 and rivalry 0.50, all first measured; robustness 0.62 (0.40 at r1); economics 0.60 (0.10).
- Full r1's lines 5 to 7 at this head:
  - line 5 (robustness-1): closed, replay RF_stream_faults. A malformed foreign cookie no longer silences a phone stream, and a throw while drawing logs one line and ends the stream.
  - line 6 (robustness-2): closed as written, replay RC_remembered_code. Residual: the desk-wide cooldown can still be tripped by the family (10 stale phones, or 3 stale plus 7 typos), and neither a TV join nor a reset lifts it.
  - line 7 (economics-1): closed for guest streams, replay RG_fan_out. Residual: joined-phone and TV streams are uncapped. With 2000 phone streams, the median dispatch is 84.9 ms.
- The stale-code answer (director-answers.json): a stale phone counts once per reset. Ten stale phones alone, or three stale phones plus seven typed mistakes, trip the cooldown. A TV join and a TV reset do not lift it. Each phone shows 'The TV has a new code. Type the code the TV shows.' on its first open after the reset. A right remembered code during the cooldown gets the cooldown line, is not counted and is kept. Server replayed, phone display claimed.
- The must-address line, verbatim from result.json: 'craft: the phone credential is the display code: one shared, unbound, non-expiring token for every phone'. Craft-2 (high): `phoneToken` is the HMAC of the key and the pin, set as desk-phone for 400 days, so every joined phone holds the same cookie, with no per-device record, no cap, no list and no expiry. Revocation is all-or-nothing, 'Forget this desk' revokes nothing, and the 4-digit display code is also a long-lived secret.
- The findings below the must-address, one line each (verdict files):
  - value: value-1 (med) plain http under the documented start; value-2 (med) the TV setup runs through a server terminal; value-3 (med) a child's typos can lock the household out for five minutes; value-time-saved and value-4 to value-8 (low);
  - craft: craft-3 (med) authorization fails open when the role header is absent; craft-4 (med) one desk-wide join brake; craft-5 (med) secrets ride in query strings; craft-6 (med) a phone's writes are a denylist over an unvalidated cast; craft-1 and craft-7 to craft-13 (low);
  - rivalry: rivalry-1 (med) parity on QR plus short code; rivalry-2 (med) the TV never shows which phones are joined; rivalry-3 (med) behind YouTube on TV-side revocation; rivalry-4 to rivalry-7 (low);
  - robustness: robustness-1 (med) stale remembered codes can lock the family out; robustness-2 (med) proxy and stream disagree on a duplicated cookie name; robustness-3 (med) a server fault on a remembered or QR join reads as a wrong code; robustness-4 (med) 'Forget this desk' swallows a failed leave; robustness-5 to robustness-12 (low);
  - economics: economics-1 (med) no ceiling on joined-phone or TV streams; economics-2 (med) no ceiling on refused joins; economics-3 (med) guest-postable events dispatch with no brake; economics-4 to economics-6 (low).

Next, ruled 2026-10-11 (round 15): by the process ruling, a second full round that comes back ready with a high line is held. The owner's Approval waits, rework 8c (PR8 to PR10) runs, and full r3, the last round, follows. Craft-2 overlaps known limit (vi), which round 14 left for a later round. Full r2 made it the round's only high line, so the deferral is reopened as far as craft-2 reaches. 8c runs after 6b on the delivery lane. The other r2 findings and limits are not slotted, and r3 judges them on the evidence.

Ruled 2026-10-11 (round 17): 8c carries PR8 with PR8-a, PR9 with PR9-a, and PR10 with PR10-a. Full r3, the last round, follows it.

Delivery 8c, as delivered (three commits, run 6d379b49, merged at dc511a47):

- Commits: f2dc5262 (PR8, PR8-a); 3f42f564 (PR9, PR9-a); dc511a47 (PR10, PR10-a). Reconciled with git cat-file -e and git merge-base --is-ancestor: f2dc5262, 3f42f564, dc511a47 and b2009df1 all exist and are ancestors of main. The run's own commits (39f399b4, 6d81d6aa and 7d593338) exist but are not ancestors of main: they are the same work before the rebase onto b2009df1.
- Seven files, +330 -80 (git diff --shortstat b2009df1 dc511a47): `desk/src/app/api/session/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/panelFor.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/lib/session/store.ts`, `tools/desk-pairing-test.cjs` and `tools/phone-panel-test.cjs`.
- As built, on main:
  - save() (`desk/src/lib/session/pairing.ts:119`) writes key and phones, each { fp, joined, seen }, with fp the SHA-256 in lowercase hex (fingerprint :127, mintPhone :154) and the token never written. PR11 later moved the write itself into commit() (:108).
  - In `desk/src/lib/session/store.ts` only the pin.turn event (:346), drawPin (:465) and its case (:593) changed.
- Fail-before (result.json questions, RED RUNS), each case written first and run on its commit's base:
  - PR8 on b0f4b718: case 2 red (the changed HMAC assertion), 'two guests join' red, 'old shape cookie is a guest' red, 'still a phone after the pin turns over' red, 'listed phone posts join with no code' red (a Set-Cookie was sent), 'joins with the right code gets a new token that replaces its entry' red. Guard that passed before: the TV's join and an in-process join set no cookie and change neither the list nor the pin.
  - PR9 on 39f399b4: all seven red ('31 days is a guest', 'nine phones', 'leave drops the fingerprint', 'reset empties the list', 'last seen', 'temp file and rename', 'failed seen write').
  - PR10 on 6d81d6aa: three red in desk-pairing ('the pin turned', pin.turn answered not-403 for role tv, the never-equal loop) and five red in phone-panel (no remembered join in panelFor.ts, join() neither stores nor forgets a code, no write of the code, the JoinHow pattern, the Forget link depends on the viewer being a phone). Guard that was green: a TV join, an in-process join and a listed phone's code-less join leave the pin as it was.
- Changed assertions, each with a one-line reason in its test:
  - desk-pairing: case 2 (the HMAC cookie is now notEqual, and the key file's keys are now key and phones), case 4 (the phone cookie comes from a real join), cases 5 and 6 (the phone cookie comes from a join, and the lapse is a TV reset post) for PR8 and PR9; the QR guard (the second join with the same code is 403), case 7 (each join reads the pin on the session at that time), the PR2 cooldown test, the PR2 lockout test, and the PR7 pin-line check (it moved to the drawPin helper) for PR10.
  - phone-panel: PR5's 'remembered code the TV does not know is forgotten' was replaced by a PR10 case, because PR10 supersedes the remembered-code half; the three PR5 loops now cover typed and qr; and the PR5 page.tsx join() check now asserts that join() has no desk.pin and that the file has no remembered join.
- Gate: 75 suites and 1570 tests (1550 at b0f4b718); tsc exited 0 for the builder, and for the App Master at dc511a47; the econ and kpi pins green and unedited; node tools/worktree-preflight.cjs printed nothing; 0 em dashes added.
- Report-only answer 1: isPhone (`desk/src/lib/session/pairing.ts:141`) is called by roleOf and liveRole. roleOf's caller is `desk/src/proxy.ts`, and liveRole's caller is `desk/src/app/api/session/stream/route.ts`, once per message. Next 16.3.4 runs proxy.ts on the Node.js runtime, so node:fs is there. Every state() call re-stats the file and reloads on a change of mtime or size.
- Report-only answer 2: 8 active phones cost between 1 and 8 pairing.json writes an hour, typically 1 to 2, because one write stamps the others. An open stream calls liveRole on every message, so a phone with a tab open counts as seen and cannot lapse while open.
- Report-only answer 3: a phone that joined before 8c holds the old HMAC cookie, which is a guest. Its first open shows the Join panel and it removes its stored desk.pin. It types the code or scans the QR once. The TV re-renders the new code from the session, with no TV file changed.
- Report-only answer 4: the live tools that join with a code (essay-file, linga-cert, maths-calculus, school-typed, school-units, school-units2, school-units3, sunday-page and tv-landing) read the current pin and open /phone?pin= once per desk. None joins twice with one pin by reading.
- The builder's choices, each accepted as built:
  - (a) the read of pairing.json is cached on its mtime and size;
  - (b) fp is lowercase hex;
  - (c) a failed seen write is tried again in an hour, while a failed mint, forget or forget-all throws and the route answers 500;
  - (d) a listed phone's join with no code sets the wrong-code count to zero (known limit iii);
  - (e) joinRefusal's forget field is no longer read;
  - (f) the join panel's line is 'The code works once: it changes when a phone joins with it.' (`desk/src/app/phone/page.tsx:469`), and Forget this desk is on 'On the desk' (:472, :484);
  - (g) only the route's reset empties the list.

Seen and not slotted, and given to full r3 as known limits (ix) and (xx): pin.turn is dispatched before mintPhone, so a failed mint leaves the code turned; two comments in pairing.ts still describe a phone bound to the pin.

Checked on main in round 18: PR11 closed the first of these. The route now mints first (`desk/src/app/api/session/route.ts:71-76`) and dispatches pin.turn last (:83). The comments still hold: `desk/src/lib/session/pairing.ts:41-42` ('that would lapse every joined phone') and :200-201 ('a phone whose pin has turned over since it connected is a guest'), and the same claim in `desk/src/app/api/session/stream/route.ts:3-4`. They are not slotted.

Full r3 (round 2026-10-11-tv-phone-pairing-r3, run 342fac19), the last full round:
- What was judged: head dc511a47 and a 17-file span (receipt.spanned_paths in result.json, derived by the App Master). Round 3 of 3, uncalibrated judges.
- The result: fail 0.28 at coverage 0.25, no hard failure. Robustness 0.40 sits below its binding floor of 0.50, so the round exited early and value, craft and rivalry were not run. Economics 0.10. Against round 2: robustness 0.62, economics 0.60, and value 0.50, craft 0.45 and rivalry 0.50 unmeasured.
- Full r2's line 1 (craft-2: the phone credential is the display code: one shared, unbound, non-expiring token for every phone): closed on the replays at dc511a47. The craft member did not re-judge it, because the round exited early. The replays:
  - shared (R1): two guests who join in turn get two different 43-character tokens, and neither equals the HMAC of the key and either pin;
  - the display code (R1b): a cookie of the old shape is a guest through the proxy (401 at /api/hint), the stream and GET, and a listed phone stays a phone after the pin turns;
  - stored (R1): pairing.json holds key and phones [{fp, joined, seen}], neither token appears in its bytes, and both fingerprints do;
  - unbound (R1c, R1d): a copied cookie works until a leave, then it is a guest on its next request and on the open stream's next message, and a TV reset empties the list;
  - non-expiring (R3): silent 29 days is a phone, silent 31 days is a guest, nine phones keep eight, and a phone seen every 29 days has no absolute lifetime (the cookie's maxAge is 400 days);
  - residual: revocation can fail or be undone on an unwritable pairing.json (robustness-1 to robustness-3).
- The must-address lines, verbatim from result.json:
  - 'robustness scored 0.4 below its floor of 0.5'
  - 'value is unmeasured: The round exited early on the robustness floor: robustness measured 0.40 against its binding mechanical floor of 0.50, so this judged member was not run...'
  - 'craft is unmeasured: The round exited early on the robustness floor: robustness measured 0.40 against its binding mechanical floor of 0.50, so this judged member was not run...'
  - 'rivalry is unmeasured: The round exited early on the robustness floor: robustness measured 0.40 against its binding mechanical floor of 0.50, so this judged member was not run...'
  - 'robustness: Forget this desk swallows a failed leave and has already told the user it worked'
  - 'robustness: A right-code join that fails on the server is shown as a wrong code, after the pin, the joined flag and the wrong-code count were already changed'
  - 'economics: The session stream's fan-out has no ceiling for TV and phone streams: per-dispatch cost grows with how many streams a credentialed client opens'
- The findings below the must-address, one line each (verdict files):
  - value, craft and rivalry: none, they did not run;
  - robustness: robustness-3 (med) An unwritable pairing.json leaves memory and file disagreeing on leave and on a TV reset; robustness-4 (med) A duplicated desk-phone cookie name splits the proxy from the stream and makes a leave answer 200 without forgetting; robustness-5 (med) Two join posts in flight from one phone leave a joined phone showing 'That code is not on the TV.' and count a wrong code; robustness-6 (med) The desk-wide wrong-code cooldown is a lockout any guest can renew, and the TV cannot lift it; robustness-7 (low) Two module instances can resurrect an evicted phone when a write keeps the file's size and mtime; robustness-8 (low) A restart drops an unsaved last seen, so the cap can evict the most recently used phone; robustness-9 (low) A first key mint that cannot be written throws through every request with no pairing log line; robustness-10 (low) dispatch swallows a subscriber's throw with an empty catch; robustness-11 (low) Only one gate is declared; typecheck was Director-run and lint is unmeasured; the test gate is a cited merge-gate record; robustness-12 (low) Hard-fail checks: two not_applicable, one checked and clear;
  - economics: economics-2 (med) The client's stream reconnect retries forever at a fixed 1.5 s with no attempt cap and no backoff; economics-3 (low) Refused joins are held 1 s each with no ceiling on how many are held at once; each one's cost is constant; economics-4 (low) No metered call, no telemetry, no price book: the cost is local I/O and CPU, measured only in-process; economics-5 (low) A child who mistypes ten times waits 320 s before the right code works (cost in time, cross-reference to value).
- The stale-code answer (director-answers.json): after a TV reset, three family phones that reopen ten times each post nothing, so the server counts 0 codes and the cooldown does not trip. The exception is a phone whose address still carries ?pin=<old code> (a bookmark, a home-screen icon or a re-scan of an old photo of the QR): it posts on every open, and eleven opens counted ten wrong codes and tripped the desk-wide cooldown. A double post of the right code (four digits auto-join plus a Join tap) counts one wrong code and shows the joined phone 'That code is not on the TV.' Server replayed, phone display claimed.
- The first open of a phone from before 8c (pre_head_phone_first_open): the phone is a guest, desk.pin is removed, nothing is posted, and it shows the Join panel with an empty field. It types the code or scans the QR once (claimed).
- The known limits, from director-answers.json:
  - (i) holds (replayed): after ten wrong codes a new phone with the right code, a TV join and a TV reset all answer the cooldown text, and a phone joined before stays a phone. Filed as robustness-6;
  - (ii) holds (replayed): a restart clears the cooldown and a new phone joins at once;
  - (iii) holds (replayed): from nine wrong codes, a TV code-less join, an in-process join and a listed phone's code-less join each set the count to zero, and a guest cannot do any of them;
  - (iv) holds (replayed): a guest guessing for one simulated hour got 3600 answers and 120 codes checked against the pin, 0.0133 of 9000 per hour. The pin turns only on a guarded right-code join;
  - (v) holds by inspection (the comparison is `desk/src/app/api/session/route.ts:67` on main): no timing signal was found and no finding was filed;
  - (vi) out of scope by ruling, not judged;
  - (vii) holds (replayed, robustness-5): two right-code posts in flight give 200 then 403, one wrong code is counted, and the joined phone shows 'That code is not on the TV.';
  - (viii) holds: only --address was run, with DESK_FAKE_INTERFACES set, exit 0, 10.0.0.140. The certificate and dev-server modes were not run;
  - (ix) holds and is worse than stated (replayed; robustness-2, robustness-3, robustness-9): a right-code join answers 500 with no cookie, the code has turned, the wrong-code count went 3 to 0, the joined flag is true and the phone is not listed. A leave answers 500 while this instance already treats the phone as a guest. A TV reset answers 500 and the session is not reset, yet this instance forgets every phone;
  - (x) holds (replayed, robustness-4): with the listed cookie first and a junk one after it, the proxy says guest and the stream says phone; with the junk one first, the proxy says phone, the stream says guest, and a leave answers 200, clears the cookie and leaves the fingerprint listed;
  - (xi) holds by inspection: join() hands the refusal to the shared status line, not to the Join panel. No member scored it;
  - (xii) holds: the panel's copies match the route's two texts, and joinRefusal still returns forget, which the page does not read;
  - (xiii) holds (replayed): a 500 or 502 with no error text reads 'That code is not on the TV.' for typed and QR alike. Robustness-2 is this limit meeting limit (ix);
  - (xiv) not re-measured: the guest cap (8) and the 1.5 s reopen did not change. Economics filed the reopen loop (economics-2) and the larger gap, economics-1;
  - (xv) holds (replayed, robustness-7, robustness-8): a second instance can resurrect an evicted phone when a write keeps the size and mtime, and a reload drops an unsaved last seen;
  - (xvi) holds (replayed): a phone seen every 29 days never lapses. Eight phones with open streams for one simulated hour caused 1 pairing.json write and 3600 session.json writes;
  - (xvii) holds by inspection: reset is fresh() and touches no pairing state, and the only reset dispatch in desk/src is the TV bench button, posted through the route;
  - (xviii) holds (replayed): an old-shape cookie is a guest through the proxy, the stream and GET, and the phone shows the Join panel with an empty field on its first open (claimed);
  - (xix) holds and is now high (robustness-1): the line is set before the post, a rejected post is swallowed, and r.ok is not read;
  - (xx) holds, and there is a third: three comments (pairing.ts:36-38, pairing.ts:195-197 and desk/src/app/api/session/stream/route.ts:2-4 at dc511a47) say the pin binds a phone. None of the three is true at this head. No member scored them.

Next, ruled 2026-10-11 (round 18): by the process ruling, a full round that exits early on a mechanical floor is reworked on the lines that carry a finding. Full r3 is reworked, split by shape. PR11 takes robustness-1 and robustness-2, with robustness-3 as their server half. PR12 takes economics-1. Not slotted: robustness-4 to robustness-9, and economics-2 to economics-5. There is no round 4. The owner decides how the pairing reaches his decision (ask 276c835a): a lite r2 after PR11 and PR12 (the App Master's lean), one full round 4 as his exception, or a decision on the record. The Approval stays held.

Delivery PR11, as delivered (one commit, run 0e2af485, merged at 80a4447a):

- Commit: 80a4447a (PR11, PR11-a). Reconciled with git cat-file -e and git merge-base --is-ancestor: 80a4447a and 706588fe exist and are ancestors of main. The run's own commit is the same SHA, so run 0e2af485 did not rebase.
- Six files, +159 -23 (git diff --shortstat 706588fe 80a4447a): `desk/src/app/api/session/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/panelFor.ts`, `desk/src/lib/session/pairing.ts`, `tools/desk-pairing-test.cjs` and `tools/phone-panel-test.cjs`.
- As built, on main:
  - commit() (`desk/src/lib/session/pairing.ts:108`) writes the next list through the temp file and a rename, then puts it in memory. mintPhone (:154), forgetPhone (:164) and forgetAllPhones (:170) go through it. The three lines are at :35-37.
  - The mint comes first, in a guarded join with the right code (`desk/src/app/api/session/route.ts:71-76`). Leave (:53-55) and reset (:89-91) are in try blocks. Each failure writes one console.error line through notSaved (:28) and answers 500 with its line.
  - The 5xx row of joinRefusal is `desk/src/app/phone/panelFor.ts:105`, leaveOutcome is :116, and forget() is `desk/src/app/phone/page.tsx:169-176`.
- Red first: 8 cases and no guard-only case. In desk-pairing: the line exports, join, leave, reset, and 'throw leaves memory equal to the file' (on base mintPhone threw but dropped the phone from memory). In phone-panel: joinRefusal 500 and 502, leaveOutcome (not a function), and the forget() source pin. The existing 403, no-answer and 'Boom.' rows passed unchanged. No existing assertion changed.
- Gate: 75 suites and 1591 tests (1583 at 706588fe); tsc exited 0 for the builder and the Director; econ and kpi green and unedited; node tools/worktree-preflight.cjs printed nothing; 0 em dashes added.
- Report-only answer 1: the TV's Reset session button (`desk/src/app/tv/page.tsx:148`) posts reset and drops the answer, and nothing on the TV reads it, so RESET_NOT_SAVED reaches no one.
- Report-only answer 2: nothing else calls mintPhone, forgetPhone or forgetAllPhones. They are used only in pairing.ts, the session route and tools/desk-pairing-test.cjs.
- Report-only answer 3: when dispatch or pin.turn throws after a mint has succeeded, the route answers Next's 500 with no cookie, and the phone is listed in pairing.json as an orphan entry until the 30-day lapse or the cap. No rollback was built.
- Rulings: answer 1 (the TV's Reset on the bench bar, the only caller of reset, drops the answer, so RESET_NOT_SAVED reaches no one) is accepted and not slotted, because it is bench-only, nothing changes, and the server logs it. Answer 2: there are no other callers. Answer 3 (when dispatch or pin.turn throws after a mint, an orphan entry is left) is accepted and not slotted, because writeSession catches and dispatch is not expected to throw.

Delivery PR12, as delivered (one commit, run ba253bba, merged at e6d6af46):

- Commit: e6d6af46 (PR12, PR12-a). Reconciled with git cat-file -e and git merge-base --is-ancestor: e6d6af46 and 80a4447a exist and are ancestors of main. The run's own commit is the same SHA, so run ba253bba did not rebase.
- Two files, +115 -5 (git diff --shortstat 80a4447a e6d6af46): `desk/src/app/api/session/stream/route.ts` and `tools/desk-pairing-test.cjs`.
- As built, on main, in `desk/src/app/api/session/stream/route.ts`: DEVICE_STREAMS (:23), devices() on globalThis.__deskDeviceStreams (:28), deviceKey (:29-30; 'tv', or the sha256 hex of the desk-phone cookie value), the device branch in start() (:51) and the device part of release() (:48). The guest branch (:50) is unchanged.
- Red first, in the PR12 block after PR6 of `tools/desk-pairing-test.cjs`: the five cases were red on base (five streams on one phone cookie: 5 !== 4; a copied cookie: 5 !== 4; two phones: 9 !== 8; five TV streams: 9 !== 8; 2000 streams on one cookie: 2000 !== 4). Two guards passed before: five in-process streams, and cancelling everything leaves the set and the map as they were. The three PR6 cases stayed green with no edit. No changed assertion.
- The figures (result.json figures; not asserted): 2000 streams opened on one cookie in about 230 ms, with 4 left open. 21 push() calls: median 0.17 ms, max 0.2 to 0.28 ms across runs. The council's replay uncapped: 83 to 108 ms, against 0.60 ms with no streams.
- Gate: 75 suites and 1598 tests (1591 at 80a4447a); tsc exited 0 for the builder and the Director at e6d6af46; maths-rules and econ-rules green and unedited; node tools/worktree-preflight.cjs printed nothing; 0 em dashes added.
- Report-only answer 1: with five TV pages open, the fifth lets the oldest go, its EventSource errors and reopens after 1.5 s (`desk/src/tv/useSession.ts:22`), and that reopen lets the then-oldest go. The pages take turns being let go, one reopen every 1.5 s. The same is true today for a ninth guest.
- Report-only answer 2: a phone stream that is open when its phone is forgotten draws the guest view from its next message. Its close stays in its device list, so it counts toward that cookie's 4 and not toward the guest cap, until it ends.
- Rulings and questions:
  - Answer 1: with five TV pages open, or nine guests, the pages take turns being let go, one reopen every 1.5 s. Accepted as a known limit under economics-2, not slotted. A TV page opens one stream (useSession in desk/src/app/tv/page.tsx), and the print page desk/src/app/english/print/page.tsx opens one more, so a desk with one TV does not reach it.
  - Answer 2: a phone stream that is open when its phone is forgotten draws the guest view from its next message. It keeps its place in its device list until it ends, so it counts toward that cookie's 4, not toward the guest cap. Accepted as a known limit, not slotted, because it shows only what a guest sees and the cap bounds it.
  - Questions 1 (slot economics-2 next) and 2 (close a forgotten phone's streams): not slotted. The pairing's next step is the owner's (ask 276c835a).

## 9. linga-placement-check, with cefr-certificate-issuance

Placement lite r1: ready, 0.6329. CEFR lite r1: ready, 0.5964. One rework (featureSlug `linga-placement-check`), then a
lite r2 of both.

Must-address:
- placement (1) value: Placement confidence reads 'high' from skips, guesses and one-keyword passes
- CEFR (1) value: The band a certificate names rests on one check that reads high from a guess and a skip, and no evidence corroborates it

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| PC1 | A mark carries its kind and its strength. A skip is recorded as skipped: no evidence, never a fail. A two-option choose pass and a one-keyword listen pass are weak. A spoken say pass is strong. | Placement (1). `desk/src/lib/english/placement.ts` (say tasks at :79-81 per LG-18). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC2 | High confidence needs at least two strong passes at the band, plus a fail or partial above it that is not a skip (or the band is the top one). Skips never count. A band that rests only on weak passes or skips reads low. | Placement (1). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC3 | Two partials at one band end the check at that band, at low confidence. This answers LG-18. | LG-18 (`docs/BACKLOG.md:111`). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC4 | A weak pass climbs one rung at most, and never into a say task by itself. | Placement (1). | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC5 | Whenever confidence is not high, the verdict screen says in one line what the band rests on. | Placement (1). | none recorded | delivered, ac266efc (run ffa7f3f0) |
| PC6 | The certificate consumes only high confidence under the new rules. It also needs at least one piece of the learner's own evidence at the band, dated after the check. This closes CEFR craft-1 (R10). | CEFR (1). | none recorded | delivered, 4aa3601f (run ffa7f3f0), with LG-10 marked built in docs/BACKLOG.md |
| PC1-a | A skip is stored with `skipped: true` beside verdict 'fail'. It still moves the ladder down, and no count includes it. A choose pass and a one-word listen pass are weak; every other pass is strong. A mark with no kind reads as a say mark. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC2-a | Two real A1 fails and no pass read medium (the rests floor). | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC3-a | The band of two partials stays that band. These are PC3's words, and lite r1 value-2 named dropping below it as the defect. Confidence is low, so no certificate issues. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC4-a | After a weak pass, the next task holds the band when the next band's task would be a say task. | Ruled at the dispatch and the settlement of delivery 9. | none recorded | delivered, 05192cff (run ffa7f3f0) |
| PC6-a | 'At the band' is not built, because evidence carries no band. Any piece of the learner's own evidence after the check corroborates. CEFR craft-1's band half stays open. | The builder's report-only answer, accepted. | none recorded | delivered as reported, 4aa3601f (run ffa7f3f0) |
| PC6-b | `certGap` sets `needsNew` only when it has no blocker and no open skill. That is exactly when `issue()` waits only for a piece after the check. One case pins a high check with nothing after it and open skills, which gets no `needsNew`. | CEFR lite r2 robustness-2 and craft-3, where 24 of 288 built records disagree. `desk/src/lib/english/cert.ts:174` sets `needsNew` whenever `corroborated(...)` is false, without looking at `open`. | One function that returns a certificate or a gap (craft-3's shape), which is a larger change. | delivered, 63043881 (run 7e1cad00) |

This rework is serial with the Linga rework (delivery 11), because they share files.

Delivery 9, as delivered (three commits, run ffa7f3f0):
- Commits: 05192cff (PC1 to PC4, +92/-20), ac266efc (PC5, +22/-4) and 4aa3601f (PC6, +37/-15). All three are ancestors of `main`.
- Nine files, all declared: `desk/src/lib/english/placement.ts`, `check.ts`, `types.ts`, `view.ts` and `cert.ts`, `desk/src/english/LingaPhone.tsx`, `tools/linga-rules-test.cjs`, `tools/cert-rules-test.cjs` and `docs/BACKLOG.md`. Nothing in `session/`, `tv/`, `app/` or `rules/`, and `BAND_NAME` is untouched.
- Fail-before was argued from the source, not run. The App Master confirmed it in the old source.
- The CEFR lite r2 ran cert 23 on f2645f41's `cert.ts`: four assertions fail there ('medium issues nothing', 'medium blocker low', 'high with all evidence older issues nothing' and 'certGap names needsNew'), and three pass as guards.
- The changed expectations each name PC6 or PC2: cert 4 (the step-down fixture, medium to high), cert 11 (a completing check now issues nothing), cert 16 to 18, 20 and 22 (the fixture default, medium to high), and the linga-rules ladder test (`climb('A1', fail)` now reads medium).
- The `view.ts` caption for the 'low' blocker was reworded from 'a mixed read' to 'not firm enough', because it now also stands for medium.
- The gate: 75 suites, 1483 tests. tsc exited 0.
- Its report-only answers, ruled:
  1. Stored confidence is read by `cert.ts` `certBand`, by `view.ts` and `LingaPhone.tsx` (through `restsLine`, which re-derives the reason from the stored tasks), and by `PlacementRecord`. An old stored 'high' from skips still meets `certBand`. A re-read would need a migration decision, and the placements record keeps no tasks. Not built, not slotted.
  2. 'At the band' is not built, because evidence carries no band. Ruled as PC6-a.
  3. PC3 says two partials end the check at that band. The builder places the band at the partial band unless a held band is higher. Ruled as PC3-a.
  4. Two real A1 fails and no pass read medium. Ruled as PC2-a.
  5. `Mark` and `staircase` now return a `rests` field (additive).

Placement lite r2 (round 2026-10-11-linga-placement-check-lite-r2, run 6b308dab):
- The result: lite-ready 0.7186 (r1 0.6329), coverage 0.70, must-address empty, round 2 of 3, judged at 4aa3601f. Scores, with the delta against r1: value 0.67 (+0.12), craft 0.74 (+0.06), robustness 0.78 (+0.06). Rivalry and economics are not judged in lite. The judges are uncalibrated. The App Master derived the span (r1's seven files plus `view.ts`).
- r1's line ('value: Placement confidence reads 'high' from skips, guesses and one-keyword passes') is closed, by reproduction:
  - viktor-67, two skipped A1 tasks: A1, low, and the check is not done (r1: high). Line: "Some tasks were skipped, so this level is a careful guess."
  - tomas-9, a guessed A2 choose pass, a one-word A2 listen pass and a skipped B1 say: A2, low (r1: high).
  - The stored task carries `skipped: true` beside verdict 'fail', and the flag survives the trip to disk. The summary prompt carries `verdict: "skipped"`.
- r1's mediums:
  - value-2, repeated partials drop the band: better. Five A2 partials read A2 low (r1: A1 medium).
  - value-3, upward lean from guessed tasks: better, not closed. Walking tomas-9 through the ladder still ends at B1 low with a B1 say task in task 3 or 4. LG-14 stays open.
  - value-4, the verdict screen does not say how much the band rests on: closed.
  - craft-1, the mark type throws away strength: closed.
  - craft-2, a skip is stored as a spoken fail: better. The verdict stays 'fail' beside the flag.
  - robustness-1, no case for the skip path: better. The pure ladder and every `restsLine` shape are pinned; `check.ts:311`, the summary prompt and both screens' lines have no case.
- The answers on known limits:
  - (i) A placement stored before 05192cff keeps its stored confidence. Confirmed (value-5, low).
  - (ii) Two partials at one band place the learner at that band. Confirmed as a real lean (value-2, med): A2 pass twice then B1 partial twice reads B1 low, where r1's code read A2 medium.
  - (iii) Two real A1 fails and no pass read medium. Better.
  - (iv) A skipped task's stored verdict stays 'fail'. Holds; no reader was found that calls it a fail.
- What the old code (f2645f41) does with the new cases: the PC5 test fails whole, because `restsLine` does not exist. In the PC1 to PC4 test, seven assertions pass on the old code by design (the floor band, a skip stepping B1 to A2, two say passes under a say fail reading high, a longer listen pass climbing to B2, a weak A2 choose pass climbing to B1, and `cleanPlacement` writing no flag when skipped is false). The rest fail there.
- The new findings: value-6 (med): an all-skipped check stores an A1 placement, sets the level and asks the model for what the learner "showed"; craft-3 (med): `restsLine` re-derives the reason from the tasks while the badge uses the stored confidence; robustness-1 (med): no case reaches `check.ts:311`; value-7 (low): the verdict line is not always plain for a 9-year-old; value-8 (low); craft-4 to craft-7 (low); robustness-2 to robustness-4 (low).

CEFR lite r2 (round 2026-10-11-cefr-certificate-issuance-lite-r2, run 98ac0359):
- The result: lite-ready 0.6464 (r1 0.5964), coverage 0.70, must-address empty, round 2 of 3, judged at 04d6d002 on the App Master's 13 files, unchanged from r1. Scores, with the delta against r1: value 0.55 (+0.10), craft 0.70 (+0.02), robustness 0.75 (0.00). The judges are uncalibrated.
- r1's line ('value: The band a certificate names rests on one check that reads high from a guess and a skip, and no evidence corroborates it') is closed, by R9, R10 and the check drive:
  - R9: tomas-9's marks read A2 low, `certBand` is null, and `issue()` issues nothing.
  - R10: a high B2 check completing from replies all older than it issues nothing, and `certGap` shows `needsNew: true`. One typed reply dated after the check issues. A medium check with that reply issues nothing.
  - The `check.ts` drive: a B1 high read leaves certificates at 0 at completion; an all-skipped check reads A1 low.
- r1's mediums:

| r1 finding | now |
|---|---|
| robustness-1, a digit from a topic title | unchanged |
| robustness-2, the gate cited, not observed | better (four span suites and tsc run) |
| value-2, the next scene ignores open skills with no plan | unchanged |
| value-3, no journey or run reaches a certificate | unchanged |
| craft-1, evidence carries no level | unchanged |
| craft-2, BASE_SKILLS unread, the plate silent about it | unchanged |

- The answers on known limits:
  - (i) 'At the band' is not built. The weakest B2 that issues is a high B2 check with all seven B2 skills shown only by later replies and one typed 'Hi.' (medium, value-1).
  - (ii) An old stored 'high' from two plain-fail skips still meets `certBand`; only the corroboration rule stands between it and a plate (medium, value-3).
  - (iii) A held certificate survives a later medium check. Consistent with 'kept for good' (low, value-7).
  - (iv) 'low' also stands for medium. The one text it drives is accurate for both (low, value-7).
  - (v) No screen reads `needsNew`. The TV reads 'Linga issues it when you next finish a conversation.', and the phone shows nothing (medium, value-4).
- The regressions:
  - What held: a high A2 check with every skill shown after it issues; issuing twice is idempotent; the certificate survives 400 newer pieces; self, low and medium never certify.
  - `certGap` and `issue()` do not agree on `needsNew`: 24 of 288 built records set it while 3 to 5 skills are open (robustness-2, craft-3). The reverse never occurred. Ruled as PC6-b.
  - cert 23 on f2645f41's `cert.ts`: four assertions fail and three pass as guards (craft-6).
  - The changed expectations (cert 4, 11, 16 to 18, 20 and 22) are sound. Cert 11 loses its only positive path through a check's completion (craft-5).
- The findings: value-1 to value-5 (med); craft-1 to craft-3 (med); robustness-1 (med, the digit) and robustness-2 (med, `needsNew`); value-6 to value-8 (low); craft-4 to craft-9 (low); robustness-3 to robustness-6 (low). robustness-3: a finished level check cannot issue with the real clock, and the one path that does is a future-dated record.

Next, ruled 2026-10-11 (round 14): neither feature is on the full-round list, so both lanes end at lite-ready. PC6-b is slotted as delivery 9b, because it is a defect in a field that just merged. The other mediums of both lite r2 rounds are not slotted.

Delivery 9b, as delivered (one commit, run 7e1cad00):
- 63043881 changes `desk/src/lib/english/cert.ts`, +3 -2. `certGap` computes `open` first and sets `needsNew` only when `open` is empty and `corroborated(...)` is false (`cert.ts:175`), and the `CertGap.needsNew` comment (:157-158) is reworded.
- It also changes `tools/cert-rules-test.cjs`, +29: cert 24 (:515) and cert 25 (:524).
- Fail-before was observed. On the base, cert 24 was red (needsNew true, expected undefined), and cert 25 was red with 28 disagreements of 288. The council counted 24 with its own record builder; the suite's helpers and a B2 plus describe plan give 28. After the fix there are 0. cert 23 (:335) passes unedited.
- The gate: 75 suites, 1517 tests. tsc exited 0 for the builder, and for the Director at 63043881.
- Report-only, confirmed:
  - `needsNew` is read nowhere outside `cert.ts` (:158 the field, :175 where it is set) and the tests;
  - `tools/linga-cert-live.cjs` asserts on `certGap(l).open` (:72), which this fix does not change;
  - `tools/uat-recertify-test.cjs` references neither.

## 10. weekly-digest-for-parents

Lite r1 (2026-10-09-weekly-digest-for-parents-lite-r1): ready 0.633. Scores: robustness 0.78, value 0.52, craft 0.68. Tier: major, because parents rely on what it writes into learners.json and read it as fact.

Must-address, verbatim:
1. value: A homework week and a typed paper read 'Nothing this week.' (MB-B14 / radka-41-MB5-2, nela-12-MB5-3): still in the tree

D1 delivered the rows below (run e395e83f, merged 87ec2049).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD1 | A homework sheet writes a count-only digest entry beside the history line: kind 'homework' with problems, hints and second, and no title, page id or text. Hints are counted at the store's dispatch boundary onto the hint owner's homework entry of the same local day. A hint never writes an entry of its own (`DIGEST_CAP` is 60, `desk/src/lib/rules/digest.ts:46`). | Must-address 1. | none recorded | delivered, 18789175, with the pin fix 6910c64b |
| WD2 | A typed paper writes a count-only entry (kind 'paper', with questions) in `addPaper`'s own save. No marks and no score. | Must-address 1. | none recorded | delivered, 18789175 |
| WD3 | (MB5-8) The unit line names the last set's not-sure count when it is above 0. | MB5-8. | none recorded | delivered, f47b8b41 |
| WD4 | `LINE_WORDS` stays 14 (`desk/src/lib/rules/week.ts:39`) and `PAGE_WORDS` stays 90. A long unit name gets an authored short Sunday name. A long profile name is said by its first word. A last rung drops only the hint counts. The busiest week is 88 words, pinned, and a DST week is pinned. | The Sunday page has a fixed word budget. | Raising `LINE_WORDS`. | delivered, 79cf246c and 5d65293e |
| WD5 | A week refresh that throws is logged, and the page says one authored line. It is never null, which the phone draws as 'Nothing this week.', and never the previous learner's lines. | Lite r1 robustness-1. | none recorded | delivered, 87ec2049 |
| WD6 | (D1 Q1, DQ3) A hint on a page read on an earlier evening, or on a day with no sheet read, writes nothing. Accepted as a limit. | D1 Q1. | none recorded | unslotted |
| WD7 | (D1 Q2) A successful re-read writes a second entry. Accepted, because today a re-read only follows a failed read, which writes neither. | D1 Q2. | none recorded | ruled, no change |
| WD8 | (D1 Q3) A two-stage problem counts 2 hints and 1 'needed a second'. Confirmed. | D1 Q3. | none recorded | delivered, 18789175 |

Left out, by ruling:
- value-3 and EM4-2/EM4-5 joined delivery 6. Moved to delivery 13 (round 15): EM4-5 is EM-B36's re-read count, and EM4-2's missing paragraph count belongs to the Sunday line, so they sit with EM-B36 and the lens order. Delivery 6 carries only the essay's own must-address lines.
- value-4 and the EM-B36 lens order join delivery 13.
- The DST and midnight-refresh limits stay open (craft-6).

Next: the full round, under the plan change.

Full r1 (round 2026-10-10-weekly-digest-for-parents-r1, run 03fa57dd, a run, not a commit; judged at f9f8276b): fail 0.40, coverage 0.17.
- The round exited early on the robustness mechanical floor (0.40 < 0.50, binding at every trust state).
- So value, craft and rivalry are unmeasured, and economics was not applicable.

Must-address, verbatim:
1. robustness scored 0.4 below its floor of 0.5
2. value is unmeasured: The round exited early on the robustness mechanical floor (robustness 0.40 < 0.50, binding at every trust state), so this judged member was not run.
3. The same line for craft.
4. The same line for rivalry.
5. robustness: A failed settle restate of the digest entry is swallowed with no log and no status (store.ts:797)

Its other findings (current lines checked on `main` at b3e3335e):
- robustness-2: mark.ts, essay.ts and conversation.ts save in separate steps with addDigest last. A mark Try again doubles attempts (4 -> 8) and history, and a conversation retry never writes the english entry.
- robustness-3: 5 of 11 failure paths have no case. They are the hint count write, addDigest throwing in mark, in essay record and in conversation finish, and the settle restate.
- robustness-4, low: `store.ts:796` is logged only.
- robustness-8, low: the empty catches at `store.ts:802` and :805.
- economics-2: each digest write re-reads learners.json twice.

D4 rulings (run 3922989d). Run 9fcfac15 merged D4 to `main` while this round was written, so every site below is cited on `main` at a6e92668. The lines of `store.ts` that D4 moved are given as they were at 2d794e64 and as they are now.

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD9 | A failed settle restate (`store.ts` :799 at 2d794e64, :811 now) is logged with `console.error` once per settle event. The store keeps whether the last restate landed. `settleSaved()` reads it. `SETTLE_NOT_SAVED` says: 'That answer was settled, but the desk could not write it to the learner file, so tonight's record and the week still show the old count.' The explain route stays 200 with reply, slip and settled, and gains saved. Its done line is `SETTLE_NOT_SAVED` when the restate failed. | Full r1 must-address 5 (robustness-1). | A log line only. | delivered, 4c89e7c9 (run 3922989d), merged by run 9fcfac15 |
| WD10 | `learners.ts` gets the pure appliers `withAttempt`, `withWriting`, `withHistory` and `withDigest`. Mark land, essay record, Linga `endTake` and the homework read route each apply their changes to one learner and write it with one `saveLearner`. A failed save writes nothing, and a Try again writes each record once. | robustness-2. A mark Try again doubled attempts (4 -> 8), and a conversation retry never wrote its english entry. | An idempotent digest key, which leaves the doubled attempts and history. | delivered, ccd841f4 (run 3922989d), merged by run 9fcfac15 |
| WD10a | The Writing KPI (`tools/kpi-measure.cjs`, `writingPersisted`) counts two shapes: `addHistory(<id>, { kind: 'writing' })`; and `withHistory(<learner>, { kind: 'writing' })`, when `essay.ts` also calls `saveLearner(`. | WD10 moved essay record to one save, and the KPI saw only `addHistory`. Its pin at `tools/essay-rules-test.cjs` :422-423 failed, so the merge gate held run 3922989d. | Keeping `addHistory` in `essay.ts` so that the old regex matched. That brings the separate save back. | delivered, a6e92668 (run 9fcfac15) |
| WD11 | A case for each of the five uncovered failure paths, in `tools/week-digest-test.cjs`. | robustness-3. | none recorded | delivered, bccfac78 (run 3922989d), merged by run 9fcfac15 |
| WD12 | The status half of robustness-4. The hint count write (`store.ts` :798 at 2d794e64, :807 now) is logged only. Its failure is to be said through the hint route's done lines (`desk/src/app/api/hint/route.ts` :42 and :50, the same before and after D4; the line is ruled at its dispatch). It was not built in D4, because the hint full r1 was judging that route. | robustness-4. | none recorded | delivered, f06984ef (run 0f94108c) |
| WD13 | The rehydrate catch (`store.ts` :804 at 2d794e64; `tellRehydrate` is defined at :784 and called at :821 now) logs with `console.error` and the reason, once per distinct failure, never once per event. Accepted limit: `rehydrateTold` is a module-level `let` (`store.ts:782`), not on `g.__desk`. A dev reload resets it, so the failure logs once more. | The :802 half of robustness-8. | none recorded | delivered, bccfac78 (run 3922989d), merged by run 9fcfac15 |
| WD13a | A candidate only. A failed rehydrate after `learner.set` keeps the previous learner's skills and history on the session. It is nearly unreachable, because `getLearner` swallows an unreadable file. | none (a finding from D4's builder) | none recorded | delivered with WD14a, e4b33fb9 (run 0a4ec2cd): on an unreadable file, a switched learner gets blank records, never the previous learner's |

WD12, as ruled at its dispatch and delivered:
- `HINT_NOT_COUNTED` (`desk/src/lib/session/store.ts:505`) reads 'Here is the hint, but the desk could not count it in the learner file, so the week will not show it.'
- The store resets `counted` on `hint.set` (:809) and sets it false when the count throws (:810). `hintCounted()` (:853) reports it.
- The stage 1 and stage 2 done lines say it. The lesson done line is prefixed with it when stage 1's count failed.
- The hint answer gains `counted`.
- `job.ts` is untouched.
- WD6 is pinned as counted true.
- 74 suites, 1329 tests.

D4 (run 3922989d) built WD9, WD10, WD11 and WD13 in three commits: 4c89e7c9, ccd841f4 and bccfac78. They were held on the branch autopilot/accepted-idea-delivery-3922989d, and all three are on `main` now (checked with `git merge-base --is-ancestor`).
- The merge gate held it on one pin, the WD10a one.
- The same gate run showed `tools/calc-rules-test.cjs` red. Its tests 8 and 9 assert a 50 ms bound. On the held tip, with `DESK_TS_CACHE=0`, the suite ran 17 of 17 green (slowest 29.23 ms). D4 touches no calc file, so it was ruled a timing flake under load.
- Resolution run 9fcfac15 fast-forwarded the three commits unchanged and added the WD10a commit a6e92668, the D3 pattern. `main` is at a6e92668.
- Full r2 (round 2026-10-10-weekly-digest-for-parents-r2, run a03b1279, judged at 0ddf3c43, a span of 17 files: full r1's 16 plus `desk/src/app/api/explain/route.ts`): ready 0.5694, coverage 1.00, uncalibrated.
  - Scores: value 0.50, craft 0.66, rivalry 0.50, robustness 0.65, economics unmeasured.
  - Must-address, verbatim: 'robustness: An unreadable learners.json shows the parent "Nothing this week."; the declared WEEK_UNREAD line is never reached'
  - The line is high, so by the process ruling the owner's Approval waits for its rework (WD14) and for full r3, the last round.
  - Medium left open, unslotted: robustness-2, the bare catches at `desk/src/lib/desk/essay.ts:194` and `desk/src/lib/session/store.ts` (:706, :710 and :817).

| id | decision | constraint | alternative that lost | status |
|---|---|---|---|---|
| WD14 | `readLearner` (`desk/src/lib/session/learners.ts:283`) throws only when `readBook` returns null. `weekOf` (`store.ts:766`) reads through it. An unreadable learners.json therefore gives `WEEK_UNREAD` (`desk/src/lib/rules/week.ts:37`, 'The week could not be read just now.') instead of 'Nothing this week.'. An absent file still reads as empty, and that is pinned. `readBook` also returns null for invalid JSON and for a value that is not a book, so both of those give `WEEK_UNREAD` too. `weekRead`, its log text and W9-refresh are unchanged. learners.json stays byte-identical after the unreadable refresh. Case 'W9-unread (WD14)' in `tools/week-rules-test.cjs` pins it, on a file truncated by five bytes. | Digest full r2 must-address 1. `readAll` turned an unreadable book into an empty one. | none recorded | delivered, 0d44b28d (run d6aad5fb) |
| WD14a | A candidate only, not ruled. The rehydrate in `dispatch()` (`store.ts:818-825`, its `getLearner` at :821) still reads through `getLearner`. After an unreadable learners.json, a learner's skills, history and memory therefore show empty. It is the failure WD14 fixed for the week, on another reader. It is related to WD13a. | none (the App Master found it while ruling WD14) | none recorded | delivered, e4b33fb9 (run 0a4ec2cd) |

Noted: a blank file reads as empty in the code (`readBook`, `learners.ts:124`), but no case pins it. `weekOf`'s only caller is `weekRead` (`store.ts:777`; the call is at :778).

WD14a, as ruled at its dispatch and delivered (checked on `main` at 60d9398c):
- The rehydrate in `dispatch()` reads through `readLearner` (`desk/src/lib/session/store.ts:915`).
- On a throw, the same learner keeps what it held.
- On a throw after a switch, the new learner gets `blank(id)` fields, paper null and `LEARNER_UNREAD` (`store.ts:507`, 'The learner file could not be read just now, so this learner's progress is not shown.'). The set is at :923.
- A successful rehydrate clears that exact status (:916).
- `blank` gained `export` (`desk/src/lib/session/learners.ts:164`).
- `readLearner`'s text is now 'learners.json could not be read' (`learners.ts:285`), and no pin quoted the old text.
- WD13's stub moved to `readLearner`, and its assertions are unchanged.
- Three files changed: `store.ts`, `learners.ts` and `tools/week-digest-test.cjs`.
- 74 suites, 1332 tests.

The owner holds the digest Approval until full r3 (round 3 of 3, the last). Full r3 runs after hint full r2 on the review lane. Its span holds essay.ts and conversation.ts, so it waited for EC1c, which has merged.

Full r3 (round 2026-10-10-weekly-digest-for-parents-r3, run f795a859) was judged at 60d9398c on a span of 18 files. Drift: changed. Result: ready 0.6311, coverage 1.00, no must-address line, no hard failure. This was the last round.
- Scores: robustness 0.80 (0.65 at r2), value 0.56 (0.50), craft 0.72 (0.66), rivalry 0.50 (unchanged). Economics has no score in the result.
- Medium findings:
  - robustness-1: an unreadable learners.json made the hint door answer counted:true while nothing was counted, because `addHints` read through `getLearner`. Ruled as P7-b, delivered 21a3e500.
  - craft-1: the learners.json atomic write skips fsync, and a zero-length file reads as an empty book that the next save writes over.
  - craft-2: write outcomes travel through module-global 'last write landed' flags instead of a return value.
  - value-1: a homework-only week names no topic and no weakness, only volume.
  - value-2: the page covers only the seated learner. A two-child parent reaches the sibling's week only through a learner switch on the TV.
  - rivalry-1: the week is pulled from the paired phone, never pushed.
  - All but robustness-1 are unslotted.
- The value member measured two scenarios: homework-only-week-cz (0.45) and two-child-household (0.40). Declaring them for later rounds is the owner's call. Neither is declared.
- The digest Approval is the owner's to decide.

## Process rulings

- Every feature passes council-lite.
- A lite-ready feature whose must-address has a high line is reworked before any full round.
- Every rework is followed by a lite r2. A major then gets the full round.
- The council never approves; only the owner does.
- The full round follows for: end-of-session-memory-recap, homework-page-reading, hint-lesson-discovery, tv-phone-pairing, essay-paragraph-analysis, learner-profile-multi-learner-switching and student-working-explanation.
- A harness, environment or measurement item with no product claim is declined in its run's doc only, with no BACKLOG entry.
- Reworks run one at a time, on one delivery lane, so two never edit the same files.
- A mode has three lite rounds. A fourth is refused as stalled, and the owner decides instead.
- Plan change, 2026-10-10: a lite-ready major goes straight to its full round after its rework, with no further lite round. It supersedes the lite r2 and lite r3 steps above for majors. A lite-fail feature still gets its next lite round.
- A full round with a high must-address line is reworked before the owner decides its Approval. Then a full r2 runs.
- A ready whose high line is one defect found by two members gets one rework. Hint full r1: craft-1 and robustness-1, delivered as HL13.
- A second full round that comes back ready with a high must-address line is held the same way. The owner's Approval waits, the rework runs, and the next full round follows. Homework: full r2 ready with two high lines, then 4h, then full r3, the last round.
- One charter is one run. Deliveries run one at a time, and so do council reviews. The second slot takes a review beside a delivery, or another charter.
- A review never runs beside a delivery that edits a file in its span. The marking span holds MathsTV.tsx, rules/calc*.ts, maths.ts and mark.ts, so 4f, 4c and 4d never run beside marking r3.
- A held delivery is resolved by a resolution run on its own branch. It keeps the held commits unchanged and adds only what the hold needs (D3: run d2d908e6, resolved by run f29f363f at f9f8276b; D4: run 3922989d, resolution run 9fcfac15).
- Exception, 2026-10-10: EC1c ran beside marking full r3, although `tools/econ-rules-test.cjs` is in the r3 span. It was found after dispatch and ruled no collision. A review reads its own worktree at its receipt head, and r3 is the last round, so no later round measures drift against that file.
- Amended, 2026-10-10: two reviews may run at once on different features, one lite and one full (the learner-profile lite r2 ran beside digest full r3). Full councils still run one at a time.
- A run released by a usage limit (2026-10-10, released at 07:34Z and 07:51Z):
  - A delivery with no commit is re-dispatched from scratch, and its builder does not read the old worktree (7a2: run 7d7171be, then run f1df9456).
  - A review whose record is complete and valid is finished by a resume run, but only when its span is unchanged since its receipt. The resume copies the round directory and re-validates the result and every verdict. It must find drift none. Then it only renders report.html and writes the vault (hint full r2: run 77dbd15a, resumed by run 058f9e18).
  - Otherwise the round runs again.
- A lite-ready major can get a rework of its mediums, ruled before its full round. That rework takes no lite round, and the full round follows its merge (learner-profile 7b).
- A delivery that comes before a full round is checked against its brief before the round runs. A gap found there is ruled and delivered first, with no lite round (learner-profile: 7b, then 7c).
- A static-analysis sweep runs beside a delivery only on files outside that delivery's paths. A finding in a delivery's file is filed open for a later pass, not edited (the unused Clock in `desk/src/tv/screens.tsx`).
- A builder's report-only answer that the App Master confirms in the code is ruled as a row and slotted, like a council finding (P11 from 7d, P12 from 5b).
- A delivery released by a usage limit with commits on its branch is finished by a salvage run. The salvage run cherry-picks those commits, verifies them, adds what is missing and builds the rest. The old branch is superseded once the salvage merges (5a: run 036c1dd7, salvaged by run 62a80958).
- Corrected 2026-10-10 (round 10): the plan change applies to student-working-explanation. It is a lite-ready major, so its full r1 follows its rework with no lite r2. From wake 59 to wake 62, the App Master's journal named a lite r2 by mistake.
- A settlement that finds a defect in code that just merged rules a follow-up delivery before the feature's next review (X5b after X5).
- When the merge gate skips typecheck, the App Master runs tsc --noEmit at the merge commit himself before the settlement is recorded (7d-3, X5, X5b).
- A high line left after a feature's last full round goes to the owner as a decision beside the Approval. A fourth full round is refused (student-working-explanation full r3, craft-1).
- A delivery's declared paths include every test that asserts the text it changes. X6 was held on `tools/calc-marking-test.cjs` test 4, which was outside its paths.
- Review runs write their run line to `.ai/skill-runs.local.jsonl`, which git ignores, and never to `.ai/consults.jsonl`, which this repo tracks. There is no gitignore change.
- A council vault lost with its review worktree is scaffolded fresh by the next round, which says so.
- A full round that exits early on a mechanical floor is reworked on the must-address lines that carry a finding. Its unmeasured rows close only when the next full round runs every member (tv-phone-pairing full r1).
- A lite-ready feature that is not on the full-round list ends its lane at lite-ready. A medium found in code that just merged may still get a small follow-up delivery (PC6-b).
- A ruling that left a finding for a later round does not shield it. When a later full round makes it a high line, it is reworked like any other, and the deferral is reopened only as far as the line reaches (tv-phone-pairing full r2, craft-2, as 8c).
- A delivery whose rows are of two shapes is split by shape, one run each, in the lane's order (essay: 6a rules the reading, 6b draws what was not ruled).
- A merged delivery's BACKLOG line cites its own code commit. When two runs merge close together, the second one is rebased, and the SHA it cites for itself goes stale. At settlement, the App Master checks every SHA that a merged BACKLOG line cites with git merge-base --is-ancestor <sha> main. A stale one is fixed in the next BACKLOG commit (MB-B25 cited 888bb46d, delivery 14's pre-rebase SHA; delivery 15 fixed it to 69f9bc52 at 7a084ae8).
- A resolution run that carries a held delivery's code by git cherry-pick -x does not carry the held BACKLOG commit, because that commit cites a SHA that does not reach main. It writes the BACKLOG line again, citing the cherry-picked SHA (16a: 050e3253 carried as 5a45e935, 37b764ce dropped, 0e3fa4fb cites 5a45e935). This amends the rule that a resolution run keeps the held commits unchanged.
- Before a delivery is dispatched, the App Master greps tools/ for every test or frozen file that draws, counts or stores what the change alters (markup classes, strings, set requests), and puts them in the delivery's paths. Delivery 16 was held on tools/school-ruler-test.cjs W8 2, which counts mb-cell2 cells and was not in its paths. For the same reason, TN1's paths include tools/calc-sets-frozen.json. This widens the X6 rule.
- The check before a delivery goes beyond text greps. A change to a library topic name, or to any text that a suite iterates over in full, is also checked against every word or length bound in desk/src/lib/rules. For example, LINE_WORDS 14 in week.ts allows a topic name of at most 5 words unless the topic has a Sunday name. The round 23 grep missed tools/week-rules-test.cjs. That suite reaches every name through ALL_TOPICS (`:254`) and a word bound, not through the id or the literal string, and delivery 17 was held on it. This widens the round 23 rule.
- Round 28 widens the round 23 and round 24 rule again. The check before a delivery also covers every suite that drives the key or screen whose handler the change alters, not only the suites that name the function. maths-course-test test 4 reached topicsFocus through tvKey on Tonight's teach stop, and the check before delivery 21 missed it.
- An edit outside a delivery's declared paths is judged at settlement, because the merge gate does not check declared paths. It is accepted when it is a change the brief allowed and the builder listed it in the result's questions (21: one fixture age in maths-course-test test 4). Otherwise the next delivery that touches the file reverts it, and the settlement records it.

## Delivery order

1. memory-recap: done.
2. homework: done, 602410d7.
3. hint, carrying X1: done (part 1 445c7bad, part 2 1c38f546).
4. marking false ticks: done, b5cd169e.
4a. homework HW4-HW6: done, b2c8389e.
D1. digest MB-B14: done, 87ec2049.
D2. marking false rings: done, c62de4fb.
4e. homework HF1-HF3: done, bd69ff49.
D3. marking empty read MK11, plus robustness-2 and robustness-3: done, f9f8276b.
4g. HF1b: done, 72a4aadf.
4f. HL12, the leaksCalc window: done, b3e3335e (run 57233789).
4c. MK4 with MK4a and MK4b, and MK4c: done, 0a7c2dd5 (run 12cf4a44).
4h. homework HF4 and HF5: done, 2d794e64 (run c448db9f).
D4. the digest full r1 rework, WD9-WD13: done, a6e92668 (run 3922989d, held on the WD10a pin; resolution run 9fcfac15 merged it).
HL13. the hint full r1 rework: done, ed13a024 (run c072cd17).
EC1. the economics instrument: done, 0ddf3c43 (run d6cc1be4).
EC1a. the rules runner's usage file: done, 90d957a9 (run 9bcde838).
EC1b. the remaining labels: done, b4b4ea8f (run ce489ee7).
WD12. the status of the hint count write: done, f06984ef (run 0f94108c).
D5. the digest full r2 rework, WD14: done, 0d44b28d (run d6aad5fb).
EC1c. the Essay Master and Linga labels: done, 8583b29b (run 7a3b0529).
WD14a. the rehydrate reads through readLearner, with WD13a: done, e4b33fb9 (run 0a4ec2cd).
L1. the first lean sweep of desk/ (ledger lean-2026-10-10-desk): done, 17ffb8a7 (run feedcd76). Five of the seven TS6133 findings were removed, one commit each. Open: read.ts num (a probable missed use, not ruled), screens.tsx Clock (done at 4db57efe, run dab615ba, ledger f05bd322), calculus1.ts and habits.ts (no desk/src importer, test-only), and 560 unused exports, counted and not judged.
L2. the lean follow-up on ledger lean-2026-10-10-desk: done, 8d625e92 (L2-1), 53fca526 (L2-2) and 87ca33c5 (the ledger, with L2-3) (run d4aeb4f3).
L3. the lean pass on paperRows (paperTopicCount and the second prereqsOf): done, bc611df3 and 2e9504b4 (run bea13399).
- L2-1: read.ts num is deleted (8d625e92). It was left unused when HW5 moved the sort into orderItems, so behaviour is unchanged. tsc with noUnusedLocals and noUnusedParameters prints nothing, and plain tsc exits 0.
- L2-2: the unused-export matcher's word boundary was a backspace, so the rule that an export tools/ names as a word is spared never fired (53fca526). With a real boundary, the corrected run lists 283 exports. Before: 560 unused-export rows. After: 274 of the old 560 are still listed and stay open, 286 are declined as named in tools/, and 0 are descoped. 9 exports appear only in the corrected run (ExplainTalkProps, Seen, weakPass, Rests, CONFIDENCE_HIGH, PieceLike, ParagraphState, unsureLine, FUNCTION_ALIASES). They appeared after 2498060d and were not added as rows.
- L2-3: calculus1.ts and habits.ts are ruled intentional (87ca33c5, the ledger commit). calculus1.ts is the Calculus 1 corpus that the calc-*-test.cjs suites read. habits.ts holds the T3 habit detectors, measured by tools/habits-rules-test.cjs, and its callers, the twin's D6 and the Sitting D7, are not built yet.
- Counts in findings.jsonl, before and after: built 6 to 7, intentional 3 to 5, open 563 to 274, declined 0 to 286, descoped 0 to 0. The backlog row counts the intentional rows inside open, as before: open 566 to 279 (274 + 5), total 572 = 7 + 286 + 279.
4b. MB-B7 wording and way in, plus homework value-3 (MB-B15): done, d2276d38 (run 56d9271f).
4d. MK10 with value-unsure-says-different (marking full r3 value-1), plus MK12: done, 1476d461 (run af864d93).
5. explain, X2-X4: done. 5a (X3, X4): 1dfcfdae (salvage run 62a80958, after run 036c1dd7 was released). 5b (X2's Type it): af73ca72 (run e8e43454). X2's language half: 5a2135b9. 5c, the full r1 rework: X5 (X5, X5-a) done, c4bd192d (run 38d6db69); X5b (X5b, X5b-a) done, 0a5a5296 (run e9761c26).
5d, the full r2 rework (X6 and X6-a): done, 025d06c3, 92c8bbd1 and db28d070 (run af69ab78, after held run 0994cd5c).
6. essay. 6a (E1, E1-a, E1-b, E2 and E2-a): done, 0a148283, aa1e46d9 and da4379a8 (run 93e16c60). 6b (EM-B21, E3 with E3-a, E4 with E4-a, and E2-b): done, 775cb383, 803c6075, dd230dc0, a34a0333, 5cca409b and b0f4b718 (run e7bdaf06). 6c (E3-b, E4-b and E4-c): done, 4a2fbbc9, b2779744 and 3b97c46d (run 9c07044c). 6d (E3-c): done, 706588fe (run 36036ff6). 6e (E5 and E6): done, 8bb84552, 4158321b and 03f16e2a (run 541b1f74). 6f (E7 and E8): done, a374b1f2 and 74f1ab6f (run f699c29c). 6g (E9): held on part-names test 2, outside its paths (run d2f9e78d). 6h (E9 and E9-a): done, ccfc2409, 7f1ebd5c and e4ef2e93 (run 2cb1d267). Digest value-3 with EM4-2/EM4-5 moved to 13 (round 15).
7. learner-profile, plus homework robustness-6. 7a: done, 4fef0a35 (run 3720e29a). 7a2: done, 60d9398c (run f1df9456). 7b (P4 with P4-a, P7-a, P7-b and P8): done, 3a0a70f8 (run 27364288). 7c (P4-b and P7-c): done, 1245013b (run 8704f32e). 7d (P9): done, 7955c66d (run c2a3c969). 7d-2 (P10-a, P11-a and P12): done, f5a854c0 (run c976c3d8). 7d-3 (P13, P14 and P15): done, 1bbf359c (run 243b0a17). 7d-4 (P16): done, 44cbbca1 (run 5ad42cde). 7d-5 (P17): done, 0edd8b13 and 61d87bfc (run 200beb31). P18: done, 84832dfa (run 80b15cc1). The pre-r3 rework (P17-a, P18-a): done, 5f9a8c67 and 34f7b4bf (run 1ee1d75f).
8. pairing PR1 to PR3: done, 1c32a230, d5a94eff, ae2469bd and 04d6d002 (run b4747c7d). 8b, the full r1 rework (PR4 to PR7): done, 33b91924, 86df5492, bc7b7730, b206d6c5, edc5b2bd and 99bcc80e (run a41f6567). 8c, the full r2 rework (PR8 to PR10): done, f2dc5262, 3f42f564 and dc511a47 (run 6d379b49). The full r3 rework: PR11 done, 80a4447a (run 0e2af485); PR12 done, e6d6af46 (run ba253bba).
9. CEFR with placement, PC1 to PC6: done, 05192cff, ac266efc and 4aa3601f (run ffa7f3f0). 9b (PC6-b): done, 63043881 (run 7e1cad00).
10. the W7 overlay: done. W7 (W7-1 to W7-6, with W7-7 report only): 4f83a734, 76049d28, 77a27121, 1c235292 and a11e33d0 (run 529d7b48). W7c (W7c-1, with W7c-2 report only): e415579f (run ba38f08e).
11. Linga with LG-25, after the owner's Approval.
12. the claude-era Linga LT run.
13. the recap follow-up, split by shape (round 21). 13-i (RC1 to RC7): done, 4e209aef, 8eaf85c4, 2ec91176, 75154729 and 806b543e (run b6742d4b). 13-i-b (RC3-a and RC3-b): done, 44a4fa85 and bb03bd08 (run a2fbef80). 13-ii: 13-ii-a is declined by ruling, and 13-ii-b is held until the owner answers 276c835a. RC3-c is queued with the next delivery that touches tools/tv-recap-test.cjs.
13a. the recap write-door contract: unchanged (queued; it goes next on the lane when the owner decides the recap Approval, and does not wait for learner-profile).
14. MK13 (MB-B25), the names that readNumber strips: done, 69f9bc52 and 5773c964 (run e9ff4caa). MK13-a's named-pair pin is queued with the next delivery that touches tools/school-rules-test.cjs.
15. MK14 (MB-B32), one cap of 120 for every typed answer: done in part, 6cbe3bd4 and 7a084ae8 (run 6b9a8cda). The phone's character count is held until the owner answers 276c835a.
16. GR1 (MB-B39), Get ready for school offers the worked lesson first: done, 5a45e935, 19b254ae and 0e3fa4fb (run 1e81ded3, after held run 12db6fd8). GR1-a ruled the school-ruler test.
17. TN1 (MB-B41), the area-so-far topic named in course-neutral words: done, 5899d6a9, 0b90ce11 and aead4fac (run aa157cdb, after held run ce511120). TN1-a gave the topic a Sunday name.
18. RP1 (MB-B9), a paper's recovery row leads to its practice: done, b3581eb2 and b5892acc (run 966009e3).
19. RP2 (MB-B5 part 1), a paper's recovery rows add up to the paper: done in part, ee949056 and dbe87f99 (run 26d58dd4). Part 2, the library map rows, is open.
20. RP3 (MB-B13), every off-desk statement walked by name after the topics: done, 1faea42d and 61333b84, with test fixes 2b0da162 and f7d59677 (run bf0eec4e).
21. PE1 (MB-B19), a learner past the end of the school path: done in part, 29cdfd86 and 9fae8244 (run 17cab0a5). The first focus for a younger learner with nothing secure is open.

Ruled 2026-10-11 (round 14): the lane runs 8b, then 6, then 9b. Ruled 2026-10-11 (round 15): 9b ran before 6, beside the pairing full r2, because 6's phone half needs desk/src/app/phone/page.tsx, a file in that round's span. The lane now runs 6a, 6b, then 8c. Ruled 2026-10-11 (round 17): the lane runs 8c, then 6c. Ruled 2026-10-11 (round 18): the lane ran 8c, 6c, 6d, PR11 and PR12, one branch at a time.

Ruled 2026-10-11 (round 19): line 12 is no longer gated by W3 overlay proposal (a), which W7-7 found moot, with one caveat: the Character may press Let Linga pick. Line 12 stays after 11, because it should measure the reworked Linga. Line 13 waits for the essay lane to settle, because it may reach files in the essay full r2 span.

Ruled 2026-10-11 (round 20): the lane ran L2 beside the essay full r2, then 6g, then 6h, one branch at a time. Line 13 still waits for the essay lane to settle.

Ruled 2026-10-11 (round 21): the lane ran 13-i, then 13-i-b, one branch at a time, after the essay full r3 settled the essay lane. Delivery 14 runs next, beside capture r21, which edits only this doc.

Ruled 2026-10-11 (round 22): the lane ran 14, then 15, one branch at a time. Capture r21 ran beside 14 and merged first, so 14 was rebased. 15 ran alone and was not rebased.

Ruled 2026-10-11 (round 23): the lane ran 16, then 16a, one branch at a time. 16 was held on tools/school-ruler-test.cjs W8 2, outside its paths. 16a carried 16's code commit by cherry-pick, with the GR1-a test ruling. 17 runs next.

Ruled 2026-10-11 (round 24): the lane ran 17, then 17a, one branch at a time. 17 was held on tools/week-rules-test.cjs, outside its paths. 17a carried 17's code commit by cherry-pick, with the TN1-a Sunday name.

Ruled 2026-10-11 (round 25): the lane ran 18 alone, one branch, with no hold and no rebase.

Ruled 2026-10-11 (round 26): the lane ran 19 alone, one branch, with no hold and no rebase.

Ruled 2026-10-11 (round 27): the lane ran 20 alone, one branch, with no hold and no rebase. 20 made four commits where its brief asked for two; the last two are one-line test fixes.

Ruled 2026-10-11 (round 28): the lane ran 21 beside Lean L3, on disjoint declared paths. L3 merged first, so 21 was rebased onto 2e9504b4.

Delivery W7 and W7c, as delivered:

- W7 (run 529d7b48, merged at a11e33d0), five commits: 4f83a734 (W7-1); 76049d28 (W7-2); 77a27121 (W7-3); 1c235292 (W7-4 and W7-5 together, where the brief asked for two commits); a11e33d0 (W7-6). W7-7 is report only. Reconciled with git cat-file -e and git merge-base --is-ancestor: all five and 53dbdd33 exist and are ancestors of main. The run's own commits are the same SHAs, so run 529d7b48 did not rebase.
- W7's files: 7 files, +149 -32 (git diff --shortstat 53dbdd33 a11e33d0): `uat/driver/ledger.cjs`, `uat/driver/product.cjs`, `uat/driver/linga-text.cjs`, `uat/rubric.md`, `tools/uat-ledger-test.cjs`, `tools/uat-verdict-test.cjs` and `tools/uat-recertify-test.cjs`.
- W7c (run ba38f08e, merged at e415579f), one commit: e415579f (W7c-1; W7c-2 is report only). It exists and is an ancestor of main, and the run's own commit is the same SHA, so run ba38f08e did not rebase. 3 files, +52 -10 (git diff --shortstat a11e33d0 e415579f): `uat/driver/ledger.cjs`, `uat/driver/product.cjs` and `tools/uat-ledger-test.cjs`.
- Red on base: W7-1, W7-2, W7-6 and W7c-1. W7-3 is red only through a temporary OPEN.md in `uat/runs/` (base throws ENOTDIR), which the test removes in a finally block.
- The changed fixture: W7-2's 'product case 6' uses hex blob names, because the ls-tree parser skips names that are not hex, and the old rule read them as changed.
- The changed assertion: W7-2's test now expects oneSided to be ['desk/src/gone.ts'], and the OPEN.md suffix reads '1 paths held by one side only'. The files put this change in W7c (e415579f), not in W7 itself: after W7c, `new.ts` is the load set only, so a stamped run is not compared over it.
- Gate: 75 suites and 1603 tests after W7 (1598 before), and 1604 after W7c. Tests 8 and 9 of `tools/calc-rules-test.cjs` did not flake. No typecheck or lint command is configured.
- Rulings:
  - W7-2: a path that only one side holds does not age a row. It is counted apart.
  - W7c: a stamped run (source run.json) is compared over its own stamp's files. A stamped file that is missing now is one-sided. A git-sourced run keeps the Linga load set. This answers W7's question 2, that module-only files never aged an Essay or Math row.
  - W7-1's answer: a ledger recertify filters by the Linga cast (the top level of uat/characters/), so Essay Master and Math Buddy rows are never planned. This matches OPEN.md's text (an L1 re-walk through /uat). No action.
  - W7's question 1: productBetween reads 'same' on differences that are only one-sided. Accepted, because it follows W7-2.
  - W7c-2: the Essay row barbora EM1-1 (L1-barbora-43-EM1-1) went from 6 changed of 9 compared (100 one-sided) to 13 changed of 26 (0 one-sided). The Math row matyas MB1-1 (L1-matyas-19-MB1-1) went from 18 changed of 26 (88 one-sided) to 35 changed of 48 (0 one-sided). All 355 rows stay aged (Linga 189, Essay 77, Math 89). productBetween needs no change, because it compares stamp against stamp.

Unslotted: EM-B11, WD6, marking value-calc-gaps (its implicit differentiation half; MK14 took the cap half), marking craft-1, homework value-retake-double-counts, and these hint full r1 mediums: value-1, craft-5, value-3, craft-2, craft-3, craft-4, robustness-2, economics-2 and economics-3. Also these:
- the homework full r3 mediums (economics-1, economics-2, value-resnap-double-count, robustness-1, craft-1 to craft-3, rivalry-1 to rivalry-4);
- digest full r2 robustness-2;
- the digest full r3 mediums other than robustness-1: craft-1, craft-2, value-1, value-2 and rivalry-1;
- EC1d;
- the learner-profile full r1 findings below its must-address (section 7), with craft-1 as candidate 7e;
- the student-working-explanation full r1 findings not delivered, the full r2 findings below its must-address, and the X5 and X5b known limits (ii) and (iii) (section 5); (i) and (iv) are taken by X6 and X6-a; the 11/12 example is kept by X5;
- the student-working-explanation full r3 findings below its must-address (section 5);
- the learner-profile full r2 findings below its must-address (section 7);
- P18's report-only answer 3, the empty catches (section 7);
- the hint re-ask try count;
- the hint full r2 mediums;
- the marking full r3 mediums other than value-1;
- the learner-profile lite r2 mediums that are not in 7b: robustness-2, robustness-3, robustness-8 with value-2, craft-2, craft-4 and robustness-10.
- the learner-profile full r3 findings below its must-address (section 7);
- the tv-phone-pairing full r1 findings below its must-address, and its known limits (section 8);
- the tv-phone-pairing full r2 findings below its must-address, and its known limits (i) to (xiv) other than what PR8 to PR10 take (section 8);
- the tv-phone-pairing full r3 findings below its must-address, PR11's report-only answers 1 and 3, and PR12's report-only answers 1 and 2 (section 8);
- the placement lite r2 mediums (section 9);
- the CEFR lite r2 mediums other than PC6-b's (section 9).
- 6c's report-only answer 2, and 6d's report-only answers 1 and 3: judged by the essay full r1 as its known limits (i), (iv) and (iii), and carried to the full r2 (section 6).
- W7b: prior[] in plain LT runs, L2 findings.json and run.json, the essay-ui Tonight capture, linga-ui per-step results, the env.md Linga L2 recipe, and W3 overlay proposals (b) to (g).
- the essay full r1 findings below its must-address, and 6e's and 6f's report-only answers, for the essay full r2 to judge (section 6).
- the essay full r2 findings below its must-address, and 6g's report-only answers 1 to 3, for the essay full r3 to judge (section 6).
- the essay full r3 findings, none above medium, for the owner beside the essay Approval (section 6).
- the L2 ledger's 9 exports new since 2498060d, not added as rows.

Review lane, in order:
- marking full r2: done, ready 0.6433 (run 13cf8526);
- digest full r1: done, fail 0.40 (run 03fa57dd);
- homework full r2: done, ready 0.5125 (run 18799a66);
- hint full r1: done, ready 0.5556 (run 6cf02f5a);
- homework full r3: done, ready 0.5867 (run f6b73d06), the last round;
- digest full r2: done, ready 0.5694 (run a03b1279), one high line, reworked as WD14;
- marking r3: done, ready 0.6885 (run cc346058), the last round;
- hint full r2: done, ready 0.6035 (run 77dbd15a, finished by resume run 058f9e18);
- digest full r3: done, ready 0.6311 (run f795a859), the last round;
- learner-profile lite r2: done, ready 0.7036 (run e1fc9eaf);
- learner-profile full r1: done, ready 0.5585 (run c916b03c), one high line, reworked as 7d and 7d-2;
- student-working-explanation full r1: done, ready 0.50 (run 908c9d3a), two high lines naming one defect, reworked as X5 and X5b;
- student-working-explanation full r2: done, ready 0.5575 (run a7fb68b4), two high lines naming one defect, reworked as X6 and X6-a;
- learner-profile full r2: done, ready 0.5625 (run 73da4bac), one high line, reworked as P18;
- student-working-explanation full r3: done, ready 0.5805 (run dff24ac2), the last round, one high line (craft-1), with the owner as a decision;
- learner-profile full r3: done, ready 0.5525 (run 333437c2), the last round, one high line (robustness-2), with the owner as a decision;
- tv-phone-pairing full r1: done, fail 0.28 at coverage 0.25 (run cf79b2aa), on the robustness floor, reworked as 8b;
- placement lite r2: done, ready 0.7186 (run 6b308dab);
- CEFR lite r2: done, ready 0.6464 (run 98ac0359);
- tv-phone-pairing full r2: done, ready 0.5155 (run 8ed29bf1), one high line (craft-2), reworked as 8c;
- tv-phone-pairing full r3: done, fail 0.28 at coverage 0.25 (run 342fac19), the last round, on the robustness floor, reworked as PR11 and PR12; how the pairing closes is with the owner (ask 276c835a);
- essay-paragraph-analysis full r1: done, ready 0.4785 (run 93d18808), four high lines, reworked as 6e and 6f; the owner's Approval is held;
- essay-paragraph-analysis full r2: done, ready 0.588 (run 85a2a235), one high line (craft-2), reworked as E9 (6h); the owner's Approval is held;
- essay-paragraph-analysis full r3: done, ready 0.604 (run 1f5206cc), the last round, must-address empty; the owner decides the held Approval.

## Open contradictions

None open after round 28. P8's quoted start text is ruled as 7b question 1, so it is not open.

Supersessions that are resolved, not open: MK2 by MK5, MK3 by MK8, the lite r2 and r3 steps by the plan change, P3's per-learner slot by P3-a, P6's SERVER_ONLY clause by P6-a, P10 by P10-a, X1c's line in the numberWords.ts header by X5, PR5's remembered-code half by PR10 (delivered, dc511a47), and PR6's uncounted TV and phone streams by PR12 (delivered, e6d6af46).

## Resolved contradictions

1. **MB-B28's BACKLOG text against MK5.**
   - Ruling MK5 (delivered, 5a55d9e7): a correct rounding with two or more significant figures is right, so '2.7 for e' is right, and D2 moved the pins that way.
   - `docs/BACKLOG.md` MB-B28 recommended that any other decimal within `ROUNDED_CLOSE` reads 'not sure', and its status note (9c777d5d) predated D2.
   - Resolved by D3-4 (efdcdd54). It added a status note to MB-B28 (`docs/BACKLOG.md:547`) saying that MK5 (5a55d9e7) and D2 (f4a56e98, c62de4fb) supersede that recommendation in part. A reader of BACKLOG alone now sees that 2.7 for e is right.
2. **Hint voice for vojtech-18 (HL2 against MB-B8).**
   - Ruling HL2: the voice age stays ("a 15-year-old") for vojtech-18, who is declared out of segment.
   - `docs/BACKLOG.md` MB-B8: the teen voice names the learner's age or stage (16-19, "a secondary-school student preparing for a school-leaving exam") instead of "15". The code today speaks to "a 15-year-old" through `TEEN.maths` (`desk/src/lib/rules/voice.ts:69`).
   - Ruling: `desk/src/lib/rules/voice.ts` is untouched, and the teen voice stays 'a 15-year-old' for vojtech-18 and every other teen. The teen table is shared with Essay and pinned byte for byte in `tools/voice-rules-test.cjs`, so the age change lands once, for both apps, with EM-B11. Refinement of HL2: a task that `equationOf` or `expressionOf` reads keeps today's stance byte for byte. Only a task no reader reads gets the neutral stance. Delivered: 0599317f, with the BACKLOG note at 445c7bad.
3. **Squared total on Pythagoras (X1a against MB-B16).**
   - Ruling X1a: the squared total on its own stays legitimate; only the squared total under a root is a leak.
   - `docs/BACKLOG.md` MB-B16: "for a Pythagoras spec the leak profile also refuses the squared answer (1156)", and its tests pin lines such as "c squared is 1156." as leaks. The test pin `tools/school-rules-test.cjs:1628` keeps 'The sum of the squares is 100.' legitimate.
   - Ruling: on a Pythagoras item, take the value the root is taken of: x^2+y^2 for the longest side, x^2-y^2 for a shorter side. Stated on its own, that value stays legitimate: 'c squared is 1156.', 'The sum of the squares is 100.' and '36 + 64 = 100' pass. A line leaks when it puts the value under a root ('the square root of 1156', '√1156', 'odmocnina z 1156'). It also leaks when it states the value with a root instruction in the same line ('c² = 16² + 30² = 1156, teď odmocni.'). 'Then take the square root of the total.' stays legitimate. MB-B16's text that refuses the squared total itself is superseded. Delivered: part 2, run a1f30e71, merged at 1c38f546 (X1a 9def48b2, MB-B16 66602171, with the BACKLOG note at 1c38f546).
