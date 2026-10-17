# helena-46 × EM5 ·  (recert-6)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-fail.** 1 fixed, 7 recur; 7 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first words on the… (major) | recurs → L1-helena-46-EM5-1 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-helena-46-EM5-2 Emails can grow the wrong twin: phone-kept pieces are always 'essay', /drop d… (major) | fixed | b9647a00: a keep names its format. The phone asks before it keeps: with Keep on and no open piece it shows the radio group "What is it?" Message / Email / Essay with nothing preselected (phone/page.tsx:737, state :104) and readPiece refuses "Choose message, email or essay before you keep it." until one is chosen (:287), then sends it (:291, ...(pieceFormat ? { format: pieceFormat } : {})). The routes refuse a new piece with no valid format, 400 FORMAT_NEEDED_LINE, before anything is kept (analyse/route.ts:126, texts/route.ts:63, texts.ts:40-41). /drop starts with no format chosen (drop/page.tsx:23) and Keep waits for one (:87). The shelf, which /drop mounts too, shows each piece's format (EssayShelf.tsx:43, data-role essay-shelf-format). Executed at 46db00cc (scratch repro.cjs, engine stubbed): a phone keep with no format -> 400 "Choose message, email or essay before you keep it.", shelf 0; an invalid format -> 400, shelf 0; format "email" -> 200, one card, format email, title "Untitled email 1", channelOf -> email (the Emails channel). Pinned by tools/essay-piece-test.cjs ('EM5-2'), texts-rules-test.cjs and phone-panel-test.cjs. (b9647a00) | b9647a00 |
| L1-helena-46-EM5-3 After the first reading, no remote path leads back to the Workroom (major) | recurs → L1-helena-46-EM5-2 | cited lines re-found at 46db00cc; tv/keys.ts changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-helena-46-EM5-4 A kept piece can be read only from the phone; the PC page cannot ask for a re… (major) | recurs → L1-helena-46-EM5-3 | cited lines re-found at 46db00cc; tv/keys.ts changed since c4893c88 (e3f70d8b) but not at the cited lines; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content); the drop/page.tsx cite (79-102) sits in changed hunks (b9647a00: the format radios :80 and the Keep button's disabled rule :87) and was re-read by hand: the page still has keep, shelf and twin and no way to ask for a reading; on the phone the "Read the whole piece" button is still shown only for paras.length > 1 (:735) | none |
| L1-helena-46-EM5-5 On /drop the notice's 'Read without keeping' reads nothing, and the empty she… (minor) | recurs → L1-helena-46-EM5-4 | cited lines re-found at 46db00cc; drop/page.tsx changed since c4893c88 (b9647a00) but not at the cited lines; phone/EssayShelf.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content) | none |
| L1-helena-46-EM5-6 Leaving a piece out of the exemplars still lets its text shape the dims and c… (polish) | recurs → L1-helena-46-EM5-5 | cited lines re-found at 46db00cc; drop/page.tsx changed since c4893c88 (b9647a00) but not at the cited lines | none |
| L1-helena-46-EM5-7 A piece kept from the phone cannot be named, so the Workroom and shelf show i… (major) | recurs → L1-helena-46-EM5-6 | cited lines re-found at 46db00cc; session/texts.ts changed since c4893c88 (efdf070d, b9647a00) and the cite moved with it (same line content); drop/page.tsx changed since c4893c88 (b9647a00) but not at the cited lines; phone/page.tsx:291 now spreads the chosen format into the piece call and still sends no title, and analyse/route.ts:130 hands addPiece the text, source and format and no title (a text matching a kept piece now becomes its version, matchPiece :124, which names nothing new); the numbered "Untitled <format> <n>" titles of texts.ts are as they were | none |
| L1-helena-46-EM5-8 .docx text: table cells become separate paragraphs and a non-breaking hyphen… (polish) | recurs → L1-helena-46-EM5-7 | cited lines re-found at 46db00cc; no commit since c4893c88 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
