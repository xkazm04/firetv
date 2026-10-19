# kristyna-17 × EM3 · (recert-12)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-2 GET /api/texts returns noticed and notice that no screen reads (minor) | fixed | a3db5db2 (ancestor of HEAD) makes the shelf read the fields: EssayShelf.tsx load() keeps noticed and notice from GET /api/texts (desk/src/app/phone/EssayShelf.tsx:18, :22) and draws the notice line, data-role="essay-shelf-notice", above the list until it is accepted (:42); the route still returns both (desk/src/app/api/texts/route.ts:40). tools/essay-piece-test.cjs 50/0 holds it. The acceptance (the shelf shows the notice line, or the fields are dropped) is met. Not screenshot-verified: L2. | a3db5db2 |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
