# L1 recertify, round 3, of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` on main 00f5db95 (`00f5db956f6c77cdfda09e5a5f477261bd543eda`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 61 rows open in `recert-2/findings.json` were answered `fixed` or `recurs` with current file:line evidence; the three commits that claim an Essay row were each proved by an executed scratch repro outside the repo (`tools/ts-load.cjs`, `decideVerdicts`, `cleanFix`, `guardNote`), not read. The full tables are in `uat/runs/2026-10-09-essay-l1/recertify-3.md`, the per-pair walks in `recert-3/`, and the stamps in the run's `findings.json`, `recert-1/findings.json` and `recert-2/findings.json`. "Fixed" means fixed at L1: the code landed. Where a row also asks for an L2 count of how often the real model supplies a sentence, the L1 part is stamped fixed and the L2 count stays owed.

Three Essay commits landed since recert-2 (90e032f2): f3b8e4b1 (one ghostwriting guard for every note), 2d3526b3 (four-part PEEL), b6f0acb7 (false "holds"). The brief and the commit messages use recert-1 ids in places: b6f0acb7 says L1-eliska-12-EM2-2, which is recert-2's L1-eliska-12-EM2-1.

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 0 | 32 | 23 | 6 | **61** |
| Fixed (severity as raised) | 0 | 4 | 0 | 0 | **4** |
| Recur (severity now) | 0 | 28 | 23 | 6 | **57** |
| New | 0 | 0 | 1 | 0 | **1** |
| Open now | 0 | 28 | 24 | 6 | **58** |

- Each fixed row names its commit, 4 of 4, and every cited commit is an ancestor of 00f5db95.
- One row is **narrowed**, not fixed: L1-daniel-15-EM2-2 (the ghostwriting backstop; the note half closed, the pattern half open).
- No blocker is open; none was fixed this round.
- Pair verdicts are the same as at recert-2: 9 conditional and 1 fail (helena-46 EM5, with seven majors on how a kept email is read, kept and shown).
- One new minor row, found while executing 2d3526b3's repro (below).
- OPEN.md went from 432 to 425 open (Linga 344, Essay 61 to 58, Math 27 to 23).

## Fixed, with commits

| Row (recert-2 id) | Was | Commit | What the code does now |
|---|---|---|---|
| L1-barbora-43-EM1-1 | major 9 | f3b8e4b1 | Every note goes through `guardNote(suppliesSentence)` in `decideVerdicts` (`essay.ts:272-283`, `:484`): a strong or neutral note holding a 4-word run of any learner sentence, or a complete declarative that names nothing of the writing outside a quoted frame, falls back to the check's line or to none. Executed: a "Write: …" copy, "Research by the city council shows walking raises pupils test scores." and "Children who walk to school arrive more awake and learn better." all fall back; "Good: you backed the claim with a number." and a quoted frame pass. **L1 part only; the L2 count of how often the real model hands over a sentence stays owed.** |
| L1-eliska-12-EM1-3 | major 9 | f3b8e4b1 | Same guard; the EssayTV captions draw the guarded note. **L1 part only; the L2 count on a young-voice reading stays owed.** |
| L1-eliska-12-EM1-1 | major 12 | 2d3526b3 | `closesAfterEvidence` (`essay.ts:420-425`) spares an Explain or Link after the paragraph's LAST marked evidence, not only the closing sentence; LINK gained "that is why". Executed on a four-part PEEL, with the model naming the link: Evidence lens neutral, strong, neutral, neutral; Structure lens strong, strong, neutral, strong. An opinion before any evidence stays faulty. One residual is filed as new (a connector-less Explain). |
| L1-eliska-12-EM2-1 | major 9 | b6f0acb7 | A rewrite that is still opinion no longer holds because a neighbour is labelled evidence (`essay.ts:453-457`). Executed: rewrite of "Phones are bad for school." with a context neighbour carrying a 2020 survey and no link back -> faulty "No checkable sentence here backs this opinion."; the same text read whole -> neutral and strong. |

## Narrowed, and the two rows the brief tied to f3b8e4b1

- **L1-daniel-15-EM2-2 (the backstop), narrowed.** f3b8e4b1 says it answers "the note half". Executed: strong and neutral notes are guarded now, but `cleanFix(raw, s.text)` (`essay.ts:231-246`) still compares a frame with the faulty sentence only. A frame holding a 4-word run of a neighbour sentence ("Phones stop students listening [how many]") is kept, and a slot holding a whole sentence ("[Phones stop students listening, so they lose marks in tests].") is kept. Restated as `recert-3/L1-daniel-15-EM2-2`, major 9.
- **L1-eliska-12-EM1-2 (the pattern guard), recurs.** The commit's test comment names it, but the code does not touch `cleanFix` beyond the copied-run helper. Executed: "A survey found that [number] of children walk." and "Research by [source] shows that [claim]." are both kept as the pattern for "Walking also makes children happier than going by car." (restated `recert-3/L1-eliska-12-EM1-1`, major 9). If L2 shows one on screen it is a ghostwriting blocker.

## Recurs

57 rows recur: the narrowed one and 56 unchanged, no commit having touched their cited lines. The Essay commits changed `essay.ts` (the Math commits also moved `store.ts` and `voice.ts`); every cite was re-mapped hunk by hunk. The ones that matter, by pair:

- **daniel-15 EM2 and barbora-43 EM4:** rewrites never reach the phone's text or the shelf (L1-daniel-15-EM2-1, major 12; `phone/page.tsx:244`, `:274-286`, `api/analyse/route.ts:118`, `store.ts:780-781` unchanged); a paragraph-only evening has no delete (L1-barbora-43-EM4-1, major 12; `EssayShelf.tsx:44-45`, `store.ts:1131`).
- **daniel-15 EM3 and barbora-43 EM1 — fix in flight.** The phone Essay box's sample paragraph is still the initial state at 00f5db95 (`FRESH_PARAS`, `phone/page.tsx:59`, `:82`): L1-daniel-15-EM3-1 (a paste fuses into the sample, major 12) and L1-barbora-43-EM1-4 (recert-2's EM1-5: reading the untouched sample files a reading as hers, minor 6) both **recur, fix in flight**. A parallel run makes it a placeholder; it is not on this HEAD, so both stay open until it lands, then re-walk.
- **eliska-12 EM1:** the faulty note is still the adult CHECKS line (`essay.ts:338-349`, `:484`), and the planted-claim fix still depends on the model naming links (`essay.ts:451-461`). **eliska-12 EM2:** kept verdicts go stale, Next sentence steps to n+1.
- **helena-46 EM1 and EM5, kristyna-17 EM1 and EM3:** the kind of writing never reaches the reading, the wrong twin, the Czech language check and English word lists (2d3526b3 added "that is why" to an English list), the forensic page that never names the paragraph.

## New

| Row | Severity | What |
|---|---|---|
| 2026-10-09-essay-l1/recert-3/L1-eliska-12-EM1-6 | minor 6 | An Explain with no connector or linker opener is still marked faulty: `closesAfterEvidence` needs LINK or a connector in EXPLAINS (`essay.ts:420-425`, `:15`, `:294`). Executed, with the model naming the link (backs: 1): "Cleaner air helps pupils concentrate in lessons." -> faulty "No checkable sentence here backs this opinion."; "This means fewer children breathe dirty air …" -> neutral. Whether the model names the link and reads the Explain as opinion is L2. |

## Top 5 still open, ranked

No blocker is open. Ranked by harm to C1 (no ghostwriting), to what the learner keeps, and to the piece list.

1. **The pattern guard and the backstop still admit a new-content sentence** (`recert-3/L1-eliska-12-EM1-1` and `recert-3/L1-daniel-15-EM2-2`, major 9; recert-2's L1-eliska-12-EM1-2). The note half is closed; the frame half keeps "A survey found that [number] …", a whole sentence in a slot and a neighbour's 4-word run. *Fix direction:* give `cleanFix` every learner sentence (`copiesRun` takes a list), refuse a slot of sentence shape and a clause with a subject and a verb in the literal words, and pin Daniel's injection line; then count the real model's frames at L2 (any one on screen is a boundary blocker).
2. **Rewrites never reach the phone's text or the shelf** (`recert-3/L1-daniel-15-EM2-1`, major 12). Reading the piece again re-reads the original paragraphs and wipes the rewrites. *Fix direction:* a holding rewrite writes its sentence back into the phone's paragraphs and the kept piece, or the phone says plainly that rewrites live on the desk only.
3. **A paragraph-only evening has no delete** (`recert-3/L1-barbora-43-EM4-1`, major 12). The paragraph stays in `session.json`; delete-all shows only with a kept piece; the shelf hides while the TV is on a sentence or the plan. *Fix direction:* a "Forget this paragraph" control on the paragraph panel that clears `essay` from the session, and the shelf shown on every screen.
4. **The prefilled sample paragraph** (`recert-3/L1-daniel-15-EM3-1`, major 12, and `recert-3/L1-barbora-43-EM1-4`, minor 6): **fix in flight**, the placeholder change of the parallel run (`FRESH_PARAS`, `phone/page.tsx:59`, `:82`). *Next step:* re-walk both rows when it lands.
5. **The kind of writing never reaches the reading, and a phone-kept piece grows the wrong twin** (`recert-3/L1-helena-46-EM1-1`, `recert-3/L1-helena-46-EM5-2`, major 12): the analyse route accepts a format the phone never sends. *Fix direction:* the phone sends the piece's kind and the reading prompt names it (an adult email is not read as a school paragraph); keep the twin keyed to the kind.

Left the list since recert-2: the note guard (its number 1, L1 part; the frame half stays as number 1 here) and the four-part PEEL (its number 5). Its number 4, the sample paragraph, is still open and fix in flight.

## Method notes

- Rows were answered from the code at 00f5db95, with executed repros outside the repo (`suppliesSentence`, `guardNote`, `decideVerdicts` on a four-part PEEL under both lenses and on a whole-paragraph read against a rewrite, `contextObservations`, `cleanFix` on frames and slots). Model-dependent behaviour (whether the model names links, reads the Explain as opinion, or supplies a sentence in a note) stays with L2; the L2 ghostwriting count is owed on rows L1-barbora-43-EM1-1 and L1-eliska-12-EM1-3 even though their L1 guard is fixed.
- Every cite of recert-2's evidence was re-mapped through `git diff -U0 90e032f2 00f5db95` per file; a cite inside a changed hunk was re-read by hand and re-written (the fixed, narrowed and touched rows).
- The walker was the builder session itself, one pass over all 10 pairs, where recert-2 used one subagent per Character.
- Stamping: as for Math, `writeBack` ran once through the ledger with the rerun's own rows skipped from the start (parent 4 fixed + 46 recurs, recert-1 4 + 57, recert-2 4 + 57); the generator ran once without stamping and once with, recert-2's findings read before any stamp.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Essay section equals the 58 open rows of `recert-3/findings.json`, row for row. The Linga section is **not byte-identical**: its 344 rows, ids, ranks and order are unchanged, but 213 lines carry a different `product: N of 105 files changed since` figure (22 became 27), because desk/ files moved under a Linga row's product stamp. Nothing else in the section moved.
- Ids are renumbered in recert-3 (positional within the folder, the new row last): for example `L1-eliska-12-EM1-1` in recert-3 restates `L1-eliska-12-EM1-2` in recert-2. Each restatement carries `recurs: 2026-10-09-essay-l1/recert-2/<id>`.
