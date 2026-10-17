# barbora-43 × EM1 ·  (recert-6)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 46db00cc
- Recertifies: 2026-10-09-essay-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's o… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at 46db00cc; essay/EssayTV.tsx changed since c4893c88 (e3f70d8b) but not at the cited lines; phone/page.tsx changed since c4893c88 (c72a35ee, b9647a00) but not at the cited lines | none |
| L1-barbora-43-EM1-2 ES-READ grounding 3/8: the reading never sees the assignment, her earlier rea… (major) | recurs → L1-barbora-43-EM1-2 | f48ff556 (task, mode), c416b952, e3f70d8b (kind) landed; the row stays open because the open task's name (S6) and the lens's last two readings' fault counts (S7) do not reach the prompt; Narrowed by f48ff556 + c416b952 + e3f70d8b: mode, the real age and the kind of writing now reach the prompt, and a task rides as data when the body names one. The open Essay Master task's name (S6) is not read and no client sends a task (analyse/route.ts:48, phone/page.tsx:291, :318), and the lens's last two readings' fault counts (S7) and her notes still do not reach the prompt. | none |
| L1-barbora-43-EM1-3 The Language lens falls back to the Paragraph structure move when the model's… (minor) | fixed | e3f70d8b: the Language lens's fallback is no longer the Paragraph structure move. lessons.data.ts:41 now sends language to "split" and playFor("language") returns SPLIT (:60, :65-67): "One idea per sentence", frame "Say [the one idea] and stop."; taught() (rules/essay.ts:692-697) hands it to a faulty sentence with no usable fix of its own and EssayTV teaching() (:310-314) shows it with the label "The move · language" (:427). Executed at 46db00cc (scratch repro.cjs): taught(faulty, fix {move:"", pattern:""}, playbook = playFor("language")) -> {"move":"One idea per sentence","pattern":"Say [the one idea] and stop."}, own false; playFor("structure") is still "Claim, then evidence, then the link back". Edge: the one fallback is the split move for every Language fault, so a vague word ('bad') without a fix of its own is taught to split, not to name the exact thing; the title's claim (the essay move on a language fault) is closed. (e3f70d8b) | e3f70d8b |

## New findings

None.

## Notes

- Evidence check at 46db00cc: every cited line was re-mapped through `git diff -U0 c4893c88 46db00cc` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo. Model-dependent behaviour stays with L2.
