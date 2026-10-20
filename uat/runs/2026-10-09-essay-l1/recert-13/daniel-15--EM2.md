# daniel-15 × EM2 · (recert-13)

- Character: daniel-15
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 0eaf5a97
- Recertifies: 2026-10-09-essay-l1/recert-12 at ee7d6ac7
- **Verdict now: L1-conditional.** 1 fixed, 1 recur; 1 row open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM2-1 Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learne… (minor) | fixed | eb97cef2 (ancestor of main) makes the Essay panels listen in English: recogniserLangFor(tab, s) returns en-US for tab "essay" and the learner's language otherwise (desk/src/app/phone/recogniserLang.ts:7-11), listen() takes the tab (desk/src/app/phone/page.tsx:410, :416) and the three Essay Dictate buttons (rewrite :828, plan slot :836, paragraph :859) pass "essay"; the Math and Linga Mic buttons pass none and keep cs-CZ for a cz learner. No other recogniser in desk/src/app/phone reads recogniserLang. tools/phone-panel-test.cjs 114/0 executes recogniserLangFor('essay', cz) = en-US and ('maths' / 'english' / '', cz) = cs-CZ and counts the three Essay buttons. The acceptance (on the Essay tab the recogniser listens in English whatever the school system) is met. | eb97cef2 |
| L1-daniel-15-EM2-2 A rewrite of a sentence first ruled neutral as a later unsupported claim is rul… (minor) | recurs → L1-daniel-15-EM2-2 | Re-walked at 0eaf5a97; what the previous walk (at ee7d6ac7) found still holds: a rewrite is judged on its own: desk/src/lib/desk/essay.ts:288 decideVerdicts(lens.id, next.sentences, new Set([n]), ...), and only the first unsupported claim of a paragraph is faulty (desk/src/lib/rules/essay.ts:569 unsupportedSeen, :609), so a claim first ruled neutral as a later one is ruled faulty alone. desk/src/lib/rules/essay.ts changed only at :895 and after (the new seat helpers). None of the eight Essay commits since ee7d6ac7 (5aa1a604, eb97cef2, ca0c905c, 6374a2e6, 012df48f, 16ee1e98, c2dacc69, 31f14444) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at 0eaf5a97: every cited line was re-mapped through `git diff -U0 ee7d6ac7 0eaf5a97` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
