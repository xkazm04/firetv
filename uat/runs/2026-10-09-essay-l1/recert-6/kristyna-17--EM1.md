# kristyna-17 × EM1 ·  (recert-6)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 1 fixed, 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English wo… (major) | recurs → L1-kristyna-17-EM1-1 | cited lines re-found at 46db00cc; api/analyse/route.ts changed since c4893c88 (efdf070d, c72a35ee, f48ff556, e3f70d8b, b9647a00) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM1-2 ES-READ 3/8: no task, kind, mode, history or memory reach the reading (major) | recurs → L1-kristyna-17-EM1-2 | f48ff556 (task, mode), c416b952 (voice scoped), e3f70d8b (kind) landed; the row stays open because the task has no sender and no recurring fault reaches the prompt (suggested acceptance: task when given, the kind, the learner's recurring faults); Narrowed by f48ff556 + c416b952 + e3f70d8b: the reading prompt now carries the profile's mode (an adult writer, never a student), the real age, the kind of writing (for a kept piece or a send that names one) and, when the body names one, a task as data (desk/essay.ts:107-115). It still never sees what the paragraph answers in practice: taskOf reads body.task (analyse/route.ts:48, :150, :168) and no client sends it (the phone's piece call, phone/page.tsx:291, and its paragraph call, :318, post none; the open Essay Master task's name is not read), and the learner's earlier readings and recurring faults are not in the prompt. | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever langu… (minor) | recurs → L1-kristyna-17-EM1-3 | cited lines re-found at 46db00cc; the desk/essay.ts cite (86-96 -> 98-108) sits in changed hunks (the person word, the task line and the format line of the system prompt: f48ff556, e3f70d8b) and was re-read by hand: none of them names a language for the notes | none |
| L1-kristyna-17-EM1-4 The reading prompt calls a 17-year-old 'a 15-year-old' (minor) | fixed | f48ff556 + c416b952: a teen is named by the age the profile holds. essayReadingVoice (rules/voice.ts:97) returns ageWho(age) for any non-young age, "a teenager" with none; the Essay reading, the piece reads and the rewrite reading all use it (desk/essay.ts:163, :181, :217, :252). Executed at 46db00cc (scratch repro.cjs, engine stubbed): essayReadingVoice(17).who = "a 17-year-old", essayReadingVoice(undefined).who = "a teenager"; analyseEssay at age 17 -> the system prompt says "a 17-year-old" and no "15-year-old"; with no age -> "a teenager". voiceOf("essay", 17) is untouched ("a 15-year-old"), so api/hint speaks as it did. Pinned by tools/voice-rules-test.cjs (#3, #6). (f48ff556, c416b952) | f48ff556, c416b952 |
| L1-kristyna-17-EM1-5 stats.links and stats.words are computed for every reading and shown nowhere (minor) | recurs → L1-kristyna-17-EM1-4 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-kristyna-17-EM1-6 The language check lets some Czech through: a paragraph whose shared function… (major) | recurs → L1-kristyna-17-EM1-5 | cited lines re-found at 46db00cc; api/analyse/route.ts changed since c4893c88 (efdf070d, c72a35ee, f48ff556, e3f70d8b, b9647a00) and the cite moved with it (same line content) | none |
| L1-kristyna-17-EM1-7 Nothing says before the first send that Essay Master reads English; on the pl… (minor) | recurs → L1-kristyna-17-EM1-6 | cited lines re-found at 46db00cc; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content); tv/keys.ts changed since c4893c88 (e3f70d8b) but not at the cited lines; api/analyse/route.ts changed since c4893c88 (efdf070d, c72a35ee, f48ff556, e3f70d8b, b9647a00) and the cite moved with it (same line content) | none |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
