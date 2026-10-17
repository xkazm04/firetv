# matyas-19 × MB1 · Tonight's sheet, together (recert-1)

- Character: matyas-19 (first-year ČVUT, MA1, Calculus 1 path)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 re-walk, code only, no model
- Head: d4f5042a
- Recertifies: 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional**: the hint guard now holds on his Czech wording, but the job he came for, marking his own sheet, is built on the server and still cannot be reached from the phone or the TV.

## Reachable surface (now)

- Homework door -> page: snap on the phone, and the TV walks the read items. Select asks for a hint (desk/src/tv/keys.ts:391). There is no mark action.
- Read prompt: course, notation, plain one-line notation, printed language (desk/src/lib/desk/read.ts:37-46; route passes system/path/age/stage at desk/src/app/api/read/route.ts:37).
- Hint guard: leaks + leaksCalc on every spec the item reads as (desk/src/lib/desk/hint.ts:107-109; reader desk/src/lib/rules/kinds.ts:41, Czech instruction stripper desk/src/lib/rules/taskText.ts:19).
- Page marking: desk/src/app/api/mark/route.ts:60, :99 (markPageRoute) exists; the only callers of /api/mark are desk/src/app/phone/page.tsx:387 and :406, and neither sends a page id.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB1-1 Czech-worded Calculus item skips the Calculus leak check | fixed | taskText.ts:19 strips "derivaci funkce" and "(neurčitý) integrál"; all the row's examples read as specs, and "The derivative is 2x/(x^2+1).", "The integral is e^(x^2)/2 + C.", "The limit is 3." are refused (executed, cz and no system). "Derivujte f(x) = tg(x^2)" reads only with system cz. | 0a53e75e fix(desk,uat): UAT 2026-10-14 build items … (partial) |
| MB1-2 a step that completes the answer passes | fixed | calc.ts:641 leaksCalc refuses all three pinned lines; the method line still passes (executed) | 66602171 MB-B16 (Calculus): leaksCalc refuses a line naming both factors … |
| MB1-3 his own sheet can be hinted, never marked | **recurs** (major, 9) | The server route now marks a page (route.ts:60, :99), but no client sends `page` (phone/page.tsx:387, :406); with no desk set he still gets "Start a practice set first." (route.ts:62); TV page Select = hint (keys.ts:391) | 200dab86 mark: MB-B35 … (server half only) |
| MB1-4 read prompt lacks course/notation/language | fixed | read.ts:37-46 mathsContext; a LaTeX line that slips through still reads as linear (executed), the case the prompt now heads off | 50fd60a4 MB-B3: the maths read prompt carries … |

## New findings

- MB1-5 (from 2026-10-14) **still holds**, polish: `lim_(n->inf)` reads as linear and "The limit is 3/2." passes the guard; `infinity` and `∞` read (desk/src/lib/rules/calc2.ts:596-597). readQuestion takes no path, so a Calculus 1 page reaches it too.
- No other new defect in scope.

## Notes

- MB1-3 is half done. A one-button "mark this page" on the phone's page screen (send `page` with the working photo) would close it. Until then the 20-30 min checking saving is not served.
- Executed with tools/ts-load.cjs from C:/Users/kazda/AppData/Local/Temp/recert-c258/scratch-matyas-19 (a.cjs, d.cjs).
