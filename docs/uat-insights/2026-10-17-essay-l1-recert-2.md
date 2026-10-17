# L1 recertify, round 2, of the Essay Master run 2026-10-09-essay-l1 (2026-10-17)

This was a code-only L1 re-walk of all 10 pairs of `uat/runs/2026-10-09-essay-l1` on main 90e032f2 (`90e032f273eb27cbfbc0ce63394305ee4991a8df`). There was no model call, no vision call and no browser, and nothing under `desk/` or `tools/` changed. The 66 rows open in `recert-1/findings.json` were answered `fixed` or `recurs` with current file:line evidence, one walker per Character (barbora-43, daniel-15, eliska-12, helena-46 in two walkers for EM1 and EM5, kristyna-17). The full tables are in `uat/runs/2026-10-09-essay-l1/recertify-2.md`, the per-pair walks in `recert-2/`, and the stamps in the run's `findings.json` and `recert-1/findings.json`, written by `recertify.cjs writeBack()`. "Fixed" means fixed at L1: the code landed. Nothing is resolved-verified; the 2026-10-16 L2 pass drove the harness learner Sam, not these Characters.

Eleven desk/ commits landed since recert-1 (782afdfb). Six of them touch Essay rows: 3ad088b2, 0b8a4857 and 390d9408 (the twin and the untitled keep), 2bf64f3e (thesis against body evidence), 6b003c59 (PEEL's Explain), ae2544b5 (the playbook frame).

## Counts

| | Blocker | Major | Minor | Polish | Total |
|---|---|---|---|---|---|
| Open before | 3 | 34 | 23 | 6 | 66 |
| Fixed (severity as raised) | 3 | 2 | 0 | 0 | **5** |
| Recur (severity now) | 0 | 32 | 23 | 6 | **61** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 32 | 23 | 6 | **61** |

- Each fixed row names its commit, 5 of 5, and every cited commit is an ancestor of 90e032f2 (checked with `git merge-base --is-ancestor`).
- All three blockers are closed, and they are all in helena-46 EM5. The Essay section of OPEN.md now holds no blocker.
- No recurring row changed severity. Two commits narrowed rows without closing them (below).
- Pair verdicts were 9 conditional and 1 fail at recert-1. Now they are the same: 9 conditional and 1 fail. helena-46 EM5 still fails, with the twin's three blockers closed, because seven majors on how a kept email is read, kept and shown remain.
- No new rows. The walkers checked the rows the new commits touch and found no regression from them; they did not hunt beyond the open rows.
- OPEN.md went from 442 to 432 open (Linga 344, Essay 66 to 61, Math 32 to 27).

## Fixed, with commits

| Row (recert-1 id) | Was | Commit | What the code does now |
|---|---|---|---|
| L1-helena-46-EM5-1 | blocker 27 | 3ad088b2 | Directness is `band(r.hedge, [40, 100, 200, 350])` (`style.ts:112`), so more hedging reads more indirect. Executed on scratch sets: a blunt set reads 1 "blunt", a hedged set 5 "indirect". |
| L1-helena-46-EM5-2 | blocker 18 | 0b8a4857 | `bodyOf` (`style.ts:60-68`) strips the greeting line, the sign-off and signature lines before the medians. Executed: three "Hi Jan … Best," emails read casual; a long formal set reads ceremonial with full length and exhaustive detail. |
| L1-helena-46-EM5-8 | blocker 6 (the curtain, a boundary) | 390d9408 | `titleOf` (`texts.ts:89-97`) returns only a typed `# heading` or "Untitled <format> <n>", never a line of the text; the analyse keep passes the body's format. Executed: unpunctuated chat lines, greeting-with-comma lines and subject-like lines kept as format undefined, essay or email are all titled "Untitled …", and no run of 5+ of their words reaches `workroomOf().pieces[].title`. |
| L1-daniel-15-EM3-1 | major 12 | 2bf64f3e | `bodyProves` (`essay.ts:382`, used at :416 and :433) reads a thesis or conclusion against the body paragraphs' marked evidence. Executed on a 4-paragraph essay: under Evidence and under Structure, with and without a supports chain, the thesis and conclusion are neutral and "Start with" lands in paragraph 3. Bare opinions with no marked evidence anywhere stay faulty (`tools/essay-rules-test.cjs` pins it). |
| L1-eliska-12-EM2-1 | major 12 | ae2544b5 | The Paragraph and Order playbook patterns are one-sentence frames (`lessons.data.ts:51`). Executed: `revise()` with every playbook pattern filled returns ok:true, none refused as "That is 3 sentences"; `planSlots` (`essay.ts:645`) still gives claim, evidence and link. |

## Recurs

61 rows recur. Where a commit touched a row, the walker read the diff and executed it:

- **Narrowed, not closed (6b003c59, L1-eliska-12-EM1-1, major 12).** The new `closesAfterEvidence` (`essay.ts:387-390`, used at :417 and :433) spares an Explain or Link only when it is the paragraph's last sentence. Executed on a four-sentence PEEL (point, 2020 survey, "This shows that walking helps them focus.", "That is why more children should walk."): the Explain is still faulty under Evidence ("No checkable sentence here backs this opinion.") and under Structure whenever the model reads it as opinion or claim and a Link follows. A three-sentence PEEL is now clean. The commit's test pins only the last-sentence case.
- **Narrowed (390d9408).** The analyse route now accepts `body.format` (`route.ts:18, :115`) but the phone page never sends one, so a phone keep is still "essay" and the twin can still grow from the wrong format (L1-helena-46-EM5-4, major 12); phone pieces now read "Untitled essay n", but there is still no way to name them (L1-helena-46-EM5-11, major 9). Two pastes now give "Untitled essay 1" and "Untitled essay 2" instead of one title, but still two shelf cards, not a version (L1-daniel-15-EM3-4).
- **Not reached by ae2544b5.** The playbook change reshaped the patterns only; the Language lens still falls back to the Paragraph move (L1-barbora-43-EM1-4, L1-helena-46-EM1-1), and the ghostwriting backstop still keeps a pattern whose slot holds a whole sentence (L1-daniel-15-EM2-2).
- **Not reached by 390d9408.** A one-paragraph kept email, changed and sent with "Analyse on the TV", still makes no new version though the phone line says it will (L1-helena-46-EM1-7, major 12): the button posts no `keep` and no `pieceId` (`page.tsx:307`, `:722`).
- Everything else is file-unchanged since recert-1, with cites re-found at 90e032f2.

## Top 5 still open, ranked

No blocker is open. The ranking puts the ghostwriting backstop first, because under the rubric a ghostwriting breach is a blocker the moment a count sees a note supply a sentence, then the rows that lose a learner's work.

1. **Strong and neutral notes carry no code guard against a supplied sentence** (L1-barbora-43-EM1-1, L1-eliska-12-EM1-3, with the pattern guard L1-eliska-12-EM1-2 and the ghostwriting backstop L1-daniel-15-EM2-2, all major 9, restated under the same ids in `recert-2/`). `cleanNote` strips a leading label only (`essay.ts:320-323`) and `note = faulty ? check : said` (`essay.ts:443-444`), so a note on a strong or neutral sentence reaches the caption verbatim (`EssayTV.tsx:416-420`). *Fix direction:* run the note and summary through the check the pattern already has: no 4-word run of any learner sentence and no complete new declarative outside a quoted frame; a failing note falls back to the check's own line. Hold it with a rules test, and run the L2 count of how often a note supplies a sentence.
2. **Rewrites never reach the phone's text or the shelf** (L1-daniel-15-EM2-1, restated under the same id in `recert-2/`, major 12). `sendRewrite` sets no paragraphs (`page.tsx:244`); "Read the whole piece again" sends the original (`page.tsx:274-286`) and replaces the reading, and keeping the same text again answers 400 "kept last" (`analyse/route.ts:118`). *Fix direction:* a held rewrite updates the phone's paragraph text, can be kept as a new version, and a re-read never silently discards it.
3. **A paragraph-only evening has no delete** (L1-barbora-43-EM4-1, restated under the same id in `recert-2/`, major 12). Delete-all appears only with a kept piece (`EssayShelf.tsx:44-45`) and the paragraph persists in `session.json` (`store.ts:1130`). *Fix direction:* a delete on the Recap tab that also clears the paragraph on the desk (`s.essay` and the away slots), and a shelf that stays reachable whatever the TV shows.
4. **The Essay box starts with a sample paragraph and a paste fuses into it** (L1-daniel-15-EM3-2, now `recert-2/L1-daniel-15-EM3-1`, major 12; with L1-barbora-43-EM1-5 minor). `FRESH_PARAS` is the initial state (`page.tsx:59, :82`) and a paste at the cursor is joined to it (`page.tsx:269`). *Fix direction:* make the sample a placeholder, not a value, so a paste into the untouched box yields exactly the pasted paragraphs.
5. **PEEL's four-part form is still marked faulty** (L1-eliska-12-EM1-1, restated under the same id in `recert-2/`, major 12; narrowed by 6b003c59). *Fix direction:* extend `closesAfterEvidence` from the closing sentence to any Explain or Link that follows the paragraph's last checkable sentence, or add an `explains` support label, and pin a clean four-sentence PEEL in `tools/essay-rules-test.cjs`.

The next ones are: the twin's readings for kept email (helena-46 EM5, five majors at 9-12: the reading puts every sentence on the TV, phone keeps are always "essay", quoted replies are kept verbatim, no remote path back to the Workroom, a piece can be read only from the phone); the one-paragraph kept email with no new version (L1-helena-46-EM1-7); the whole-piece forensic page that never names the paragraph (L1-daniel-15-EM3-5, L1-kristyna-17-EM3-1); and the reading that never sees the task, kind, mode or history (L1-barbora-43-EM1-3, L1-kristyna-17-EM1-2).

## Method notes

- Rows were answered from the code at 90e032f2. Model-dependent rows were judged on the prompt and the code path, with hand-written model observations in scratch repros outside the repo. Two counts remain owed at L2: how often the model names the supports chain (which decides L1-daniel-15-EM3-1 and L1-eliska-12-EM1-7 in the real flow), and whether a strong or neutral note ever supplies a sentence.
- The walkers' json used `findings.json` ids; a few recert-1 walk tables (barbora-43 EM1-5 and EM4-1, helena-46 EM1) numbered the same rows differently. The stamps and `recurs:` links follow the `findings.json` ids.
- A `# heading` first line still becomes the title (`texts.ts:91`). That is by design (the writer typed it) and was not tested as a curtain breach.
- The ledger needed a second pass. The first `writeBack` run also stamped the new `recert-2` rows, because they were already in the ledger when the chain rows were collected; that was reverted and re-run with the rerun's own rows skipped, as `finishLedger` does. The committed stamps are the second run.
- OPEN.md was regenerated once with `node uat/driver/linga-text.cjs --status`. The Essay section equals the 61 open rows of `recert-2/findings.json`, row for row. The Linga section is **not byte-identical** to the previous OPEN.md: its 344 rows, ids, ranks and order are unchanged, but 218 lines carry a different `product: N of 105 files changed since` figure (for example 12 became 22), because the ledger counts the desk/ files that moved under a Linga row's product stamp and 11 desk/ commits landed in between. Nothing else in the section moved.
- Recert-2 ids are positional within the new folder, so most differ from recert-1's (for example `L1-daniel-15-EM3-1` in recert-2 restates `L1-daniel-15-EM3-2`). Each restatement carries `recurs: <run>/recert-1/<id>`.
