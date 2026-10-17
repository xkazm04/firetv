# helena-46 × EM1 ·  (recert-6)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 2 fixed, 4 recur, 1 new; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-1 The kind of writing never reaches the reading, and the Language lens falls ba… (major) | fixed | e3f70d8b: the piece reading carries its format. analysePiece takes the format (desk/essay.ts:178-183, formatOf :153: a kept piece's stored format, else the one the send named, else none) and judge() adds the line "The kind of writing is given beside the sentences: judge the text as that kind of writing ... never by what an essay does (an email is not asked for a thesis or for evidence)" to the system prompt (:107) and the data row "The kind of writing this is" (:114); the route passes body.format (analyse/route.ts:150). The Language lens now teaches through SPLIT, a language move "One idea per sentence" with the frame "Say [the one idea] and stop." (lessons.data.ts:60, playFor :65-67), never "Claim, then evidence, then the link back"; the page labels it "The move · language · One idea per sentence" (EssayTV.tsx:427) and the playbook page does not list it (keys.ts:469 finds the stop by identity). Executed at 46db00cc (scratch repro.cjs, outside the repo, engine stubbed): a three-paragraph email read with format "email" -> all 3 calls carry the kind line and "never by what an essay does"; a kept piece stored as "message" read with "email" -> the stored "message" wins; no format -> no kind line, the essay prompt unchanged; playFor("language") = split, taught(faulty with a fix cleanFix rejects) -> "One idea per sentence"; playFor("structure") is still Paragraph. Pinned by tools/essay-piece-test.cjs ('L1-helena-46-EM1-1') and tools/essay-rules-test.cjs. Edge left as the suggested acceptance allows (the format of a kept piece): a paragraph read on its own, or a piece read with Keep off, still carries no format (filed as new, recert-6/L1-helena-46-EM1-5). (e3f70d8b) | e3f70d8b |
| L1-helena-46-EM1-2 Adult readings are still prompted for 'a 15-year-old' student; mode never rea… (minor) | fixed | f48ff556 + c416b952: the reading prompt names who is writing. essayReadingVoice(age, mode) (rules/voice.ts:97) returns "an adult writer" in Adult mode (ADULT_WRITER :90), the real age ("a 17-year-old") for a teen, "a teenager" with none, and the young band unchanged; the route reads the seated profile's mode (analyse/route.ts:63) and hands { mode, task } to the reading (:150, :168); desk/essay.ts speaks of "a writer" instead of "a student" in Adult mode (personOf :83, the "can act on" and "to fill" lines of judge(), the data row "The writer's paragraph, sentence by sentence"). voiceOf stays byte for byte what api/hint reads (c416b952). Executed at 46db00cc (scratch repro.cjs, engine stubbed): analyseEssay with { mode: "adult" } at age 40 -> the system prompt says "an adult writer", has no "student" anywhere in system or prompt and no "15-year-old"; voiceOf("essay", 17) and voiceOf("essay") are still "a 15-year-old", voiceOf("maths", 17) "a 17-year-old". Pinned by tools/essay-rules-test.cjs and tools/voice-rules-test.cjs. (f48ff556, c416b952) | f48ff556, c416b952 |
| L1-helena-46-EM1-3 Adult mode's lens home, plan, playbook and x-ray speak only to school paragra… (minor) | recurs → L1-helena-46-EM1-1 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines; library/lessons.data.ts changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-helena-46-EM1-4 Four reading fields are computed and never shown (provider, stats.links, stat… (minor) | recurs → L1-helena-46-EM1-2 | cited lines re-found at 46db00cc; desk/essay.ts changed since c4893c88 (c416b952, f48ff556, e3f70d8b) and the cite moved with it (same line content); essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines | none |
| L1-helena-46-EM1-5 The phone refuses a .docx that the PC page accepts (polish) | recurs → L1-helena-46-EM1-3 | cited lines re-found at 46db00cc; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) and the cite moved with it (same line content); drop/page.tsx changed since c4893c88 (b9647a00) but not at the cited lines | none |
| L1-helena-46-EM1-6 A language the desk does not read is refused only when it is clearly Czech; s… (polish) | recurs → L1-helena-46-EM1-4 | cited lines re-found at 46db00cc; api/analyse/route.ts changed since c4893c88 (efdf070d, c72a35ee, f48ff556, e3f70d8b, b9647a00) and the cite moved with it (same line content) | none |

## New findings

| Finding | Severity | Title |
| --- | --- | --- |
| L1-helena-46-EM1-5 | minor · rank 6 | An email read on its own, or a piece read with Keep off, is still judged as an essay: the kind of writing is asked and sent only for a kept piece |

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
