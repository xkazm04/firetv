# Essay Workroom: the TV reads a kept piece, read-only, decision record of 2026-10-18

State described: branch `main` at c25f1311. Source files: `desk/src/app/api/analyse/route.ts`, `desk/src/lib/desk/essay.ts`, `desk/src/tv/keys.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/proxy.ts`. Commits: 6009739d (code), f9b7e1fd (design doc). The decision is **not live-verified**: the repo shows a rule test, not a run on a TV. Where the commits show no reason, no alternative or no ruler, this record says "not recorded".

Reconcile: `docs/DESIGN-ESSAY-MASTER.md:195-198` (f9b7e1fd) describes the behaviour (TV role only, looked up on the seated learner's shelf, writes nothing). It gives no constraint, no alternatives and no check with file:line. `docs/BACKLOG.md` has no record of the allowance: its only EM5-3 lines (539, 677) are about the email level words, a different finding that shares the row number. So this file adds the decision record and does not repeat the design doc.

## 1. Constraint that forced the choice

- Before 6009739d a kept piece "could be read only from the phone; the Workroom's piece rows did nothing on OK" (6009739d message). Finding: `recert-6/L1-helena-46-EM5-3`.
- The Workroom is a TV screen. The TV "never shows a sentence of the text: the session carries only what `lib/twin/workroom.ts` builds (titles, counts, marks, level words)" (`docs/DESIGN-ESSAY-MASTER.md:193-194`). So the TV does not hold the text a reading needs.
- A reading ends in records the shelf must not gain a second time: `kind: "piece"` with `keep` makes a piece or a new version (`route.ts:166-181`), and `analysePiece` ends with `record(...)` of the learner's history (`essay.ts:208`).

The need: the TV reads a piece already kept, and cannot change what is kept.

## 2. Decision

`POST /api/analyse` gains a kind `shelf-piece` `{pieceId}`.

- It answers the **TV role only**. Phone, guest, or no role: 403 `"A kept piece is read again from the TV's Workroom."` (`route.ts:33`, `:87`), before anything is looked up.
- The TV sends **only the id**. The desk looks the piece up on the seated learner's shelf (`getPiece(who.id, body.pieceId)`, `route.ts:149`); not there: 400 `"That piece is not on your shelf."` (`route.ts:35`, `:150`), no run.
- It reads the latest version (`piece.versions.at(-1)!.text`, `route.ts:154`) through the same helper as the phone's piece (`readPiece`, `route.ts:59`; the phone's call at `route.ts:184`), under the lens last chosen (`route.ts:153`).
- It is read-only: `reader: { mode, noSave: true }` (`route.ts:154`); `noSave` is declared at `essay.ts:84` and skips `record(...)` at `essay.ts:208`.
- The reply is `{ pieceId, summary }`, never the text (`route.ts:155-156`).
- A report with no paragraph read yet does not open the reading (`untilRead`, `route.ts:69`), so a piece that fails leaves the TV on the Workroom (6009739d message).

The TV key: OK on a piece row sends the id when no analyse job is running (`desk/src/tv/keys.ts:456`); OK on the lenses stop still goes to the lens home (`keys.ts:454`).

## 3. The check

The role is a header the proxy writes: `proxy.ts:33` sets `x-desk-role` from the cookies (`roleOf`, `pairing.ts:192-196`: the TV cookie equal to the desk's TV token gives `tv`, a paired phone gives `phone`, else `guest`). A guest is refused by the proxy before the route for anything not on its open list (`proxy.ts:15`, `:29-31`). The route reads the header with `roleFrom(req)` (`pairing.ts:209-212`), which returns null for a caller that did not come through the proxy; null is refused too (`route.ts:87` tests `!== "tv"`).

The TV cookie is set by opening `/tv?key=<desk key>` (`proxy.ts:19-26`).

## 4. Alternatives that lost

The commits record the choices below; they do not record a debate.

- **Reuse `kind: "piece"`.** Not taken: 6009739d says `shelf-piece` is "separate from kind 'piece' (whose pieceId adds a version)". Reusing it would need the text from the TV and would keep or version the piece (`route.ts:166-181`).
- **Leave the read on the phone.** This was the state before and is the finding being fixed. Why the TV rather than only a phone fix: not recorded beyond the finding.
- **Let any role send `shelf-piece`.** Not taken: 403 for phone, guest and no role (`route.ts:87`). The commit states the rule and gives no reason for the narrower role. A reading of the code, inferred and not recorded: the phone already holds its text and reads through `kind: "piece"`, so the by-id door is for the TV.
- **Let the read record or write the notice.** Not taken: `noSave` (section 2), and a shelf without the notice is refused 428 with the notice line, "only the phone accepts it" (`route.ts:151-152`).

## 5. What stays forbidden to the TV role

Shown by the code and pinned by `tools/essay-piece-test.cjs` (test "EM5-3 (recert-6)", added in 6009739d):

- Sending text: the body carries `pieceId` only; the text is looked up in the desk (`route.ts:149`, `:154`).
- Changing the shelf: no piece, no version. The test asserts the texts directory and `learners.json` are byte-identical before and after a read, and that the piece still has one version.
- Writing the notice: a missing notice gives 428 and is not written (`route.ts:152`).
- Writing a history line, writing step or digest: `noSave` (`essay.ts:84`, `:208`).
- Reading another learner's piece: the lookup is by the seated learner's id (`route.ts:149`).
- Receiving the text: the answer is the id and the summary the TV already shows; the test asserts the key set and that no sentence of the piece is in it.

Not covered by this decision: the route's other kinds (`english`, `essay`, `rewrite`, `piece-again`, `piece`) have no role check in this file, so this allowance neither restricts nor widens the TV's access to them. Whether they should: not recorded.

## 6. Who decided

The repo does not record who ruled this. 6009739d and f9b7e1fd are by the repo author, tagged `recert-6/L1-helena-46-EM5-3`, and cite no ruling; unlike the 2026-10-17 records, no "delegate ruling" comment appears in these files. So: **decided in the build of the recert-6 EM5-3 finding; ruler not recorded.** The owner or the App Master may confirm it.

## 7. Commits

- **6009739d** `feat(essay): OK on a Workroom piece reads it on the TV, read-only (recert-6/L1-helena-46-EM5-3)`. Files: `route.ts`, `EssayTV.tsx`, `Workroom.tsx`, `essay/captions.ts` (the Reading / Not read caption, now shared), `lib/desk/essay.ts`, `tv/keys.ts`, `tools/essay-piece-test.cjs`, `tools/tv-keys-test.cjs`. Pins: `essay-piece-test.cjs` EM5-3 (roles 403, unknown id 400 with no run, three calls for three paragraphs, answer keys, stores byte-identical, a piece whose every paragraph fails leaves the TV on the Workroom); `tv-keys-test.cjs` `workroom 2` (OK on a row sends the id only, a running read sends nothing, lenses, Menu and Back unchanged).
- **f9b7e1fd** `docs(essay): the Workroom reads a kept piece on OK (recert-6/L1-helena-46-EM5-3)`. File: `docs/DESIGN-ESSAY-MASTER.md` (4 lines).
