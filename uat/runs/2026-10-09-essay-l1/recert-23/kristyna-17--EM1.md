# kristyna-17 × EM1 · (recert-23)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 56d93dcb plus the recert-23 change
- Recertifies: 2026-10-09-essay-l1/recert-22 at 820a115d
- **Verdict now: L1-conditional, no row open.** 2 closed by scope. (was L1-conditional, 2 rows open)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word lists, with English advice (major) | closed by scope | Operator ruling 2026-10-20: English only, say so. EssayTV.tsx now shows `ENGLISH_ONLY_STATEMENT` ("Essay Master reads English texts.") on the lens home and the plan caption for every profile; a paragraph read as not English ends its caption on `NOT_ENGLISH_TIE`. A Czech text outside the check is an out-of-scope outcome the desk has named. | recert-23 commit |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever language the model… (minor) | closed by scope | Same ruling and statement: the desk reads English texts, so notes on a Czech text are out of scope. | recert-23 commit |

## New findings

None.

## Notes

- The refusal arm (essayLang.ts char-n-gram profile, recert-22) is unchanged; it now has a stated purpose.
- Pinned by tools/essay-rules-test.cjs (recert-23 tests).
