# barbora-43 × EM1 · (recert-13)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 row open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | fixed | 5aa1a604 (ancestor of main) moves the x-ray's model paragraph off the phone sample's topic: XRAY (desk/src/essay/EssayTV.tsx:556-559) is now three sentences on octopuses escaping aquarium tanks ("Octopuses escape from aquarium tanks more often than any other animal, and the reason is not strength but shape."), while the phone placeholder is still the tired / sleep sample (desk/src/app/phone/page.tsx:66) and the seeded task is still "Later school starts - first draft" (desk/src/lib/session/store.ts:600). Executed at 0eaf5a97 (scratch /tmp/rc13/ex.cjs outside the repo, renderToStaticMarkup of the real EssayTV, no model): the Xray draw carries "Octopus" and none of sleep / exhausted. tools/essay-rules-test.cjs 166/0 asserts that no content word of five letters or more is shared between the x-ray and the placeholder and that neither sleep, school, student, teen, tired nor exhaust appears in the x-ray. The acceptance (a topic a school would not set, never the phone sample's topic) is met. | 5aa1a604 |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes,… (major) | recurs → L1-barbora-43-EM1-2 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) is still the only way a task enters (:188, :201); the phone's piece call (desk/src/app/phone/page.tsx:319) and paragraph call (:346) send kind, text, type, keep, pieceId, source and format/title, no task; the prompt (desk/src/lib/desk/essay.ts:102-120) has person, task if any and format, no earlier readings or notes. Cites re-mapped through git diff -U0 ee7d6ac7 0eaf5a97 per file; phone/page.tsx:316 -> 319, :343 -> 346. None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
