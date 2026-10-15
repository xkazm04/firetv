# desk/ architecture review, 2026-10-08 (between batch 5 and batch 6)

Base: `main` at 3fb37baf (batch 5 closed). Read-only: no code changed. Cards: `findings.jsonl` (6, all `open`).
Lanes: `A` = buildable in one session under the rule suites, `B` = big enough to want an A/B worktree wave,
`owner` = the cost is a decision, not code.

Baseline measured on this base, this worktree: `cd desk && npm run test:rules` exits 0. That is 63 suites and
1,055 tests with 0 failed, in 186 s wall. The suites' own `duration_ms` lines add up to 99.7 s.

The question was which few structural problems will cost batches 6-8 most, and which of them should compete with
product work now. Three should go now: two are small, and one is a live privacy bug. The other three should wait for
the slice that first pays for them.

## Ranked

**1. The guest view is a denylist (compete-now, S, data path: the operator should confirm).**
`view()` (`lib/session/pairing.ts:103-119`) copies the whole Session for a guest, then blanks a hand-written list of
fields. `essayPlan` (the learner's own dictated sentences), `worked` and `workroom` were added later and are not on
that list. A phone that has opened `/phone` but not joined therefore receives them today. The guard test
(`tools/desk-pairing-test.cjs:61-62`) checks 6 of about 45 fields, so it stays green.

T4's Sitting and Spot-yourself state and M5's paper entry will leak the same way unless someone remembers the list.
The fix is to invert the guest branch to an allowlist of lobby fields. The test then fills every Session key and
fails on any key outside the allowlist. This is the only finding that is a present-day bug.

**2. test:rules: 63 suites in one `&&` chain, 57 copied loaders (compete-now, M, tools only).**
Of the 186 s a run takes, about 86 s is outside the suites' reported durations. Each process loads TypeScript
(1.3 s) and transpiles again; `school.ts` alone takes 355 ms and is loaded by 39 suites. The chain also stops at the
first red suite. M2b had to revise pins in 11 suites, and every batch log says the suites were green "when run one
by one".

The fix has two parts. A shared `tools/ts-load.cjs` with a transpile cache replaces the copied loaders. A
`tools/run-rules.cjs` runs every suite, prints the table and exits non-zero if any suite failed. Batches 6-8 still
need about 30-40 gate runs, so this pays back first. The runner is the merge gate: prove that it stays red with a
planted failing suite and a planted crash.

**3. The twin measures a sentence two ways (compete-now, as T4's first commit, S).**
T3's `long-run` (`habits.ts:97`) compares `splitSentences` word counts against `styleSheet`'s p90:

| Side | Splits sentences | Counts words |
|---|---|---|
| `splitSentences` (`essay.ts:36`, `:44`) | only before a capital | whitespace tokens |
| `styleSheet` (`style.ts:48-51`) | at every stop and every line break | letters and digits |

So lower-case chat gives one long "sentence" on one side and three short ones on the other. That produces a false
habit. T4's plants and proofs (D6, D7) and T5's exported constraints stand on this comparison.

The area has 4 sentence splitters, 5 word counters and 3 portrait computations. The card export hard-codes
`constraints: []` (`card.ts:110`) and drops the StyleSheet that `openHabits` would need per channel. The fix is one
measurement plus a lower-case chat row in the fixture. Re-run the T3 zero-false-positive gate afterwards.

**4. Linga has two "adult" tests (later; decide now, build before L5; owner).**
Scenes are gated by age: `audienceAllowed` uses `isAdult` (`curriculum.ts:75`). Features are gated by mode:
`modeOf` decides pitch and Cut. So an 18+ profile in Family mode is offered the date scene and is called "an adult"
by the tutor prompt (`conversation.ts:68`), but is refused Cut. `cambridge.ts:101` is a third, age-only copy.

The adult plan said "never build a second mode concept" and noted the gap (`ADULT-MODE-IMPLEMENTATION-PLAN.md:165`).
L5's red-team ("any minor reaching an adult scene") needs one definition to test against. The code is S, but moving
scenes to the mode test changes a Family behaviour, so the owner decides.

**5. A third math path is hard-coded out, and path lengths are literal pins (later: M3a, then M3b; S).**
The string `'calc1'` is tested at 8 sites in 6 files:

- `kinds.ts:62` judges an item as Calculus only on `'calc1'`, so a calc2 item would be marked as linear.
- `store.ts:44` drops any other path on load.
- `profileRows.ts:63` lists the two courses.
- `hint.ts:65`, `:83` and the hint route also test the string.

Path lengths are pinned as literals: 17 pins in 10 suites and 34 lines pinning 22 in 10 suites. M2b touched 21 files
to add two topics. The fix is a `judge`/`kind` field on the PATHS record and lengths read from it, keeping one
explicit pin per path in maths-paths-test.

**6. school.ts: 3,413 lines, about 13 edit regions per unit (later: M5, batch 7; M).**
The probability unit touched about 13 regions between lines 366 and 3346. The file has had 23 commits since
September, and the GCSE coverage is 23 of 86 statements, so more units will come. Batch 6 does not touch this file.
Moving the fifteen existing units before 10-23 would risk their verdicts for no batch-6 gain.

The fix is a `SchoolUnit` contract with a registry that the switches consult first. New units become one module
each. Move Pythagoras and probability first, proved by the gcse-units sweep and the school-* suites. The older
shapes stay where they are.

## Looked at and found sound (do not review again)

- **Session flow:** `tvKey`/`runStep` (`tv/keys.ts:518-546`) are pure, apply events in order and handle failures
  with `onFail`/`onDone`. The phone-follows-TV `panelFor` is pure and tested.
- **Pairing:** roles and cookies (`pairing.ts:1-104`) use HMAC tokens with a timing-safe compare. Only `view()`'s
  guest branch is a problem (card 1).
- **Store:** the answer never leaves the server (`store.ts:160-202`, `shown`/`specShown`). Stale job results are
  dropped by id (`store.ts:529-534`). Results for a learner who has left go to their saved work (`toAway`/`seat`).
  The singleton's load, save and push are sound.
- **Linga:** `turn.ts` (the state table and one refusal function) and `notes.ts` `cleanNotes` are sound. So is
  `gate.ts`: one never-list, which only ever narrows. `pitch.ts` is gated twice, the API route is 9 lines with one
  dispatch, and the store has a single `linga.changed` event. The thinking-off tests pin both behaviour and file
  location.
- **Essay and twin:**
  - `paragraphsOf` is the single paragraph splitter.
  - `splitSentences` numbering runs across paragraphs, and `quoteOf` gives exact slices.
  - `habits.ts` is pure, keeps the band floor and counts each piece once; it is wired to nothing.
  - The card's canonical JSON, hashing and integers-only rule (`card.ts:57-68`) are sound.
  - `texts.ts` has atomic writes, ID checks, caps and delete-all.
  - The TV never gets a sentence of text: `workroomOf` sends titles, counts and level words only.
  - The `workroom.set` owner guard is sound.
- **Math:** `chain.ts` and the M4c kill test (0 of 50 clean chains rung, 50 of 50 slips at their own line) are
  sound. So is the gcse-units sweep, with controls that prove its counts can fail. `PATHS` as a record with
  `school: boolean` is the right seam; callers just bypass it (card 5).
- **Rendering:** the TV's derived rows are already pulled out of MathsTV into `tv/mathsRows.ts`, `sheetRows`,
  `prepareRows` and `rulerRows`.

## Noted, below the cut (for the slice cards, not their own cards)

- **L4:**
  - "replay" is already a turn action (`turn.ts:27`), a phase (`types.ts:140`) and a view action id, on 11 code
    lines. Take Two needs its own name.
  - A finished take accepts only `repeat` (`turn.ts:50`).
  - `start` with `replace` keeps no link to the cut it came from (`conversation.ts:201`).
- **L4 and L6:** `tools/linga-rules-test.cjs:693` pins the files allowed to set `thinking:false`. A new caller file
  fails it, so decide where the call lives in the card.
- **New screens:** a new Screen touches about 10 places in 6 files, including the `Screen` union (`store.ts:31`),
  `keys.ts`, the TV dispatch and the phone. The workroom took 22 files and `worked` 15.
  `app/phone/page.tsx` is one component with 40 `useState` calls and 11 inline panels. T4 and M5 add to both.
- **Events:** the reducer has 51 event variants, and validation is spread across five opt-in lists (`SERVER_ONLY`,
  `guestMay`, `NEEDS_LEARNER`, `REHYDRATE` and one-off sanitisers).
- **Routes:** "nobody seated, 409" is repeated 21 times across 11 route files. T4 should add one `seatedAdult`
  helper first.
- **Twin store:** `twin.json` is written non-atomically (`lib/twin/state.ts:35`). D6's "new
  tools/twin-rules-test.cjs" already exists (192 lines).
- **Plan doc:** `docs/concepts/STUDY-DESK-V2-PLAN.md` carries the M2b slice card twice (lines 231-236 and 238-243).

## Decisions treated as constraints (not findings)

- **Owner rulings:**
  - Batch order and contents, and one slice per run in table order, built locally (plan sections c and e; the
    owner's 2026-10-07 evening ruling).
  - Code decides every mark, with no live model call in a gate. A stub sits at the provider seam (plan sections d
    and f).
  - The custom typesetter over KaTeX (V2-O2). One call per paragraph (V2-O5). Edexcel 1MA1 Foundation (S2,
    V2-O6). SVG collectibles (V2-O4).
- **Safety and privacy:**
  - The curtain: the TV never lists kept texts and the shelf is phone-only (P3).
  - The never-list only gains words (`gate.ts`). Adult means 18+ (V5). L3's loosening applies to confirmed 18+ only,
    and C4 sits behind the red-team.
  - Claims say "mapped to", never "certified" (X5). VERIFIED stays false.
- **Twin:** the twin is earned after 3 pieces (E3). The export is Twin Card 1.0 with email/chat first and 500-char
  exemplars (E2, S4). T2, T3 and T5-lite were built ahead of the T1 live probe, a recorded deviation.
- **Build rules:**
  - New suites are appended at the end of test:rules. Card 2 keeps that order and changes only the runner.
  - Pins are revised openly, with old and new values (the M2b protocol). Card 5 keeps one explicit pin per path for
    that reason.
  - Never touch `desk/data/`.
