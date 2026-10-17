# helena-46 × EM5 · My writing, kept and known (recert-2)

- Character: helena-46 (46, account manager, B2 business English, Adult mode, no age)
- Journey: EM5 My writing, kept and known
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-fail.** The three claimed fixes hold: the curtain breach (EM5-8), the inverted directness (EM5-1) and the email level words (EM5-2) are closed and executed. Ten rows are untouched by any commit and stay open, including the false "never keeps what other people wrote to you" claim (EM5-5), the missing remote path to the Workroom (EM5-6) and the ungated Workroom for non-Adult profiles (EM5-12), so the pair does not pass.

## Reachable surface (now)

- PC page `/drop`: keep a Message / Email / Essay (default Message `desk/src/app/drop/page.tsx:23`), optional title `:81`, shelf, twin panel, "Show the Workroom on the TV". No read action.
- Phone Essay tab: keep through "Read the whole piece on the TV" with 2+ paragraphs (`page.tsx:718`, call `:280`); no format, no title. The analyse route accepts a format (`route.ts:18`, `:115`) but nothing sends it.
- Workroom titles now come only from a typed title, a "# heading", or "Untitled <format> <n>" (`desk/src/lib/session/texts.ts:89-97`).
- Twin dims: `desk/src/lib/rules/style.ts:60-68` bodyOf strips greeting and sign-off frame; directness `:112`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM5-1 Twin directness inverted | **fixed** | `style.ts:112` directness = band(hedge). Executed: blunt set -> 1 "blunt"; hedged set -> 5 "indirect" | 3ad088b2 |
| EM5-2 Level words misread email | **fixed** | `style.ts:60-68`, `:78`, `:105`. Executed: three "Hi Jan ... Best, Helena" emails -> casual; long formal email set -> ceremonial, full, exhaustive and structured | 0b8a4857 |
| EM5-3 Reading a kept email shows sentences on the TV | **recurs** (major) | `EssayTV.tsx:424`, `:257-258`, `:280`, `:490`; by design | - |
| EM5-4 Emails grow the wrong twin | **recurs** (major, narrowed) | route accepts format (`route.ts:115`) but `phone/page.tsx:280` never sends one; `drop/page.tsx:23` default message; shelf shows no format (`EssayShelf.tsx:44`) | - |
| EM5-5 "Never keeps what others wrote" false | **recurs** (major) | `drop/page.tsx:91`, `Workroom.tsx:47`, `card.ts:48`; `style.ts` no quote stripping | - |
| EM5-6 No remote path back to Workroom | **recurs** (major) | `keys.ts:290-292`, `:431-432`, `:459` | - |
| EM5-7 Kept piece read only from phone | **recurs** (major) | `drop/page.tsx:79-102`, `keys.ts:453`, `phone/page.tsx:718` | - |
| EM5-8 Curtain: untitled piece titled from first line | **fixed** | `texts.ts:89-97`. Executed: unpunctuated chat line, greeting with comma, subject-like line, as format undefined/essay/email -> "Untitled essay n" / "Untitled email n"; 0 runs of 5+ words in `workroomOf().pieces[].title` | 390d9408 |
| EM5-9 /drop "Read without keeping", empty shelf text | **recurs** (minor) | `drop/page.tsx:86`, `EssayShelf.tsx:61`, `:44` | - |
| EM5-10 Excluded piece still shapes dims | **recurs** (polish) | `card.ts:46-48`, `drop/page.tsx:96` | - |
| EM5-11 Phone piece cannot be named | **recurs** (major, narrowed) | no title on `phone/page.tsx:280`; `route.ts:115`; now "Untitled essay n" instead of the first line | - |
| EM5-12 Workroom/portrait served to non-Adult | **recurs** (major) | `api/twin/route.ts:20-24`, `:30`, `:33`, `:36-37` | - |
| EM5-13 .docx tables and non-breaking hyphen | **recurs** (polish) | `desk/src/lib/rules/docx.ts:59` | - |

## New findings

None.

## Notes

- Scratch `p.cjs` (via tools/ts-load.cjs, scratch DESK_DATA_DIR) ran styleSheet/twinDims/levelWords on blunt, hedged, casual three-email and long formal sets, and addPiece + workroomOf on unpunctuated first lines. Titles carried no 5-word run of any text.
- A "# heading" first line still becomes the title (by design: the writer typed a heading); not tested as a breach.
- L2's: a business-writing trainer reading the twin's eight words against three real emails; thresholds are still "the host's first guess".
