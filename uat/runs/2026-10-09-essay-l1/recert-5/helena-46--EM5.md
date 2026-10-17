# helena-46 × EM5 ·  (recert-5)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head c4893c88
- Recertifies: 2026-10-09-essay-l1/recert-4 at 67581c54
- **Verdict now: L1-fail.** 2 fixed, 8 recur; 8 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first words on the l… (major) | recurs → L1-helena-46-EM5-1 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM5-2 Emails can grow the wrong twin: phone-kept pieces are always 'essay', /drop def… (major) | recurs → L1-helena-46-EM5-2 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content); drop/page.tsx changed since 67581c54 (fb23fe5c, e32f688d) but not at the cited lines | none |
| L1-helena-46-EM5-3 'Never keeps what other people wrote to you' is false: quoted replies and her c… (major) | fixed | fb23fe5c: ownText(text) (rules/style.ts:55-65, WROTE_LINE :49) drops every line that starts with ">" and everything from an "On … wrote:" / "-- Original Message --" / Czech "Dne … napsal(a):" line onward; styleSheet measures only ownText (style.ts:92) and the portrait's exemplars skip a piece with no text of her own and cut only ownText (twin/card.ts:48). The copy now says what happens: /drop (drop/page.tsx:91) "The card carries up to five of your own texts as samples, you review which ones, and quoted replies from other people are left out." and the Workroom (Workroom.tsx:47) "the card carries up to five of your own texts, which you review on your phone, and never the quoted words of other people." Executed at c4893c88 (scratch twin.cjs, outside the repo): a reply "Thanks Ana, Thursday works." + two ">" lines + an "On Mon … Pavel wrote:" line and a quoted line under it -> ownText "Thanks Ana, Thursday works."; a text that is only ">" lines -> ""; the Czech and Original-Message variants -> ""; four kept messages (one all quote) through /api/texts -> the portrait's exemplars are three own texts, none holding "invoice", "Regards", "wrote" or the quoted words, and the downloaded Twin Card JSON holds none of the quoted words. Pinned by tools/twin-rules-test.cjs. (fb23fe5c) | fb23fe5c |
| L1-helena-46-EM5-4 After the first reading, no remote path leads back to the Workroom (major) | recurs → L1-helena-46-EM5-3 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |
| L1-helena-46-EM5-5 A kept piece can be read only from the phone; the PC page cannot ask for a read… (major) | recurs → L1-helena-46-EM5-4 | cited lines re-found at c4893c88; the drop/page.tsx cite (79-102) sits in changed hunks (e32f688d, fb23fe5c) and was re-read by hand: the twin panel at :90-102 is now behind {twin && …} and its copy changed, and the page still has keep, shelf and twin and no way to ask for a reading; on the phone 087c9d13 lets an opened one-paragraph piece be read as a piece through the Analyse button (:737), but the "Read the whole piece" button is still shown only for paras.length > 1 (:732); phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content) | none |
| L1-helena-46-EM5-6 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf… (minor) | recurs → L1-helena-46-EM5-5 | cited lines re-found at c4893c88; drop/page.tsx changed since 67581c54 (fb23fe5c, e32f688d) but not at the cited lines | none |
| L1-helena-46-EM5-7 Leaving a piece out of the exemplars still lets its text shape the dims and cou… (polish) | recurs → L1-helena-46-EM5-6 | cited lines re-found at c4893c88; the card.ts cite (46-48) sits in a changed hunk (fb23fe5c) and was re-read by hand: the dims at :47 are still computed over every piece (styleSheet over each latest text, now through ownText), and the exclusion is still applied only to the exemplars at :48; drop/page.tsx changed since 67581c54 (fb23fe5c, e32f688d) but not at the cited lines | none |
| L1-helena-46-EM5-8 A piece kept from the phone cannot be named, so the Workroom and shelf show its… (major) | recurs → L1-helena-46-EM5-7 | cited lines re-found at c4893c88; phone/page.tsx changed since 67581c54 (fc8a5151, ede841e4, 087c9d13) and the cite moved with it (same line content); drop/page.tsx changed since 67581c54 (fb23fe5c, e32f688d) but not at the cited lines | none |
| L1-helena-46-EM5-9 The Workroom and the twin portrait are served to Family-mode and under-18 profi… (major) | fixed | e32f688d: seated() in /api/twin answers 403 "The twin is for Adult mode (18 and over)." unless modeOf(profile, preferences) is "adult" (api/twin/route.ts:20-26), and GET and POST both call it first, so the portrait, the Workroom open and the exclusion toggle are gated for every role; /drop shows the twin panel only when /api/twin answered (drop/page.tsx:36 setTwin(r.ok ? … : null), :90 {twin && <section data-role="drop-twin">…}). Executed at c4893c88 (scratch twin.cjs): a 13-year-old profile and an 18+ profile with mode family -> GET /api/twin, POST {open:true} and POST {exclude} each 403 for the phone, the tv and no role, and the session screen is not "workroom"; an adult profile -> GET 200 and the card downloads. Pinned by tools/twin-rules-test.cjs. (e32f688d) | e32f688d |
| L1-helena-46-EM5-10 .docx text: table cells become separate paragraphs and a non-breaking hyphen is… (polish) | recurs → L1-helena-46-EM5-8 | cited lines re-found at c4893c88; no commit since 67581c54 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at c4893c88: every cited line was re-mapped through `git diff -U0 67581c54 c4893c88` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
