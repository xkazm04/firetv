# daniel-15 × EM2 · Fix it myself (recert-3)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 4 recur; 4 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-daniel-15-EM2-1 Rewrites never reach the phone's text or the shelf; reading the piece again re-… (major) | recurs → L1-daniel-15-EM2-1 | desk/src/app/phone/page.tsx:244 — sendRewrite sets no paragraphs / desk/src/app/phone/page.tsx:274-286 — readPiece sends paras.join (original text) / desk/src/app/api/analyse/route.ts:118 — 'kept last' reads on / desk/src/lib/session/store.ts:781-782 — essay.set replaces the reading / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-daniel-15-EM2-2 Ghostwriting backstop is narrow: a slot may hold a whole sentence, a frame may… (major) | **recurs (narrowed)** → L1-daniel-15-EM2-2 | Narrowed, not fixed. f3b8e4b1 closes the note half (strong and neutral notes pass guardNote, rules/essay.ts:272-283, :484). The pattern half is untouched: cleanFix(raw, s.text) (:231-246) still compares a frame against the faulty sentence only. Executed (scratch e3.cjs): a frame holding a 4-word run of a NEIGHBOUR sentence ("Phones stop students listening [how many]") is kept; a slot that holds a whole sentence ("[Phones stop students listening, so they lose marks in tests].") is kept; a run of the faulty sentence itself is refused. | f3b8e4b1 (partial: the note half) |
| L1-daniel-15-EM2-3 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learne… (minor) | recurs → L1-daniel-15-EM2-3 | desk/src/app/phone/recogniserLang.ts:7-8 — cz -> cs-CZ / desk/src/app/phone/page.tsx:373 — r.lang = recogniserLang(s) / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-daniel-15-EM2-4 A rewrite of a sentence first ruled neutral as a later unsupported claim is rul… (minor) | recurs → L1-daniel-15-EM2-4 | desk/src/lib/rules/essay.ts:473 — only the first unsupported claim is faulty (unsupportedSeen) / desk/src/lib/desk/essay.ts:260 — rewrite judged with judged = {n} / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
