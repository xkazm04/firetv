# Scout brief - /scan-sweep --challenge, run challenge-2026-09-23

You are a READ-ONLY scout. Change no tracked file. The only thing you write is your cards file.

Tree: C:/Users/kazda/kiro/firetv-challenge (branch scan-sweep/challenge-2026-09-23, base c6a402b). Read the tree there.
Method: the skill is at C:/Users/kazda/kiro/ai-registry/skills/scan-sweep - read references/challenge.md
sections 1, 3, 4 and the two `Group: challenge` lenses in references/lenses.md before writing a card.
Context map: context-map.json at the tree root (your host and riders' file_paths are there).
Repo law: .claude/scan-sweep/config.md and .claude/spark/config.md "## Repo law" - a card that breaks it is void.
Product docs worth reading for your area: docs/STUDY-DESK-SCOPE.md, docs/DESIGN-ON-AIR.md (TV), docs/LINGA-*.md (Linga), uat/accepted-gaps.md (human "no"s - never re-propose), README.md (telestrator).
Operator taste, from memory: on the Study Desk TV a verdict is a picture, prose only in the caption slot; the TV never asks for typing; nothing may put the answer on screen.
Never-re-propose: no backlog digest, no open backlogs, no prior challenge decks exist in this repo. uat/accepted-gaps.md and anything a docs/*PLAN* file marks rejected count as "no".

## Your job
1. Read EVERY file of the host context in full, and every rider's files in full. Read the neighbours your ideas depend on (callers, the session store, the rules suites under tools/) enough to ground them.
2. Consider many moves; return exactly TWO cards:
   - slot A `architecture-challenger`: the ONE structural move that stops this context being the reason something else is hard (rule implemented twice -> one module; hand list -> derived; boolean cluster -> state machine; sync path -> job; leak through layers). A specific seam with its cost COUNTED.
   - slot B `ux-elevation`: the experience LEAP, not polish (five steps -> one; blind decision where the app holds the data; a status surface that should be where the action is taken; a missing mode: compare, bulk, undo, preview, resume). If the host has no user surface, slot B is a second architecture card on a different seam, slot "B-architecture (no UI surface)". An operator-facing surface (a CLI's output, a harness report) IS a user surface.
   Either card may target a rider instead of the host.
3. Floors, every card: size M or L (never S), effort >= 5, impact >= 7, risk 4-8, write_set <= ~15 files and <= ~800 changed lines, declared up front; 3-8 acceptance cases, each "input -> expected", that a builder can write as FAILING tests first in this repo's test harnesses (desk: node:test suites in tools/*-rules-test.cjs that transpile desk TS with desk's own typescript - see tools/linga-rules-test.cjs for the loader; Kotlin: JUnit under core/src/test; say which harness per case). A guard case (behaviour that must NOT change, green before by design) is allowed only if labelled "GUARD:".
   No live model calls in tests: stub at the engines `provider` seam. Never touch desk/data.
4. Premise: every claim stands on a repo-relative `path:line` you actually read. Count things (sites, duplicates, steps, branches).

## Card JSON (one object per card; all fields required)
{"context":"<ctx the card changes>","host":"<your host>","slot":"A|B|B-architecture (no UI surface)","lens":"architecture-challenger|ux-elevation",
 "title":"<= 80 chars","size":"M|L","effort":7,"impact":8,"risk":6,
 "write_set":["repo-relative path", "..."],"new_files":["..."],"shared_surfaces":["desk/package.json if you add a rules suite"],
 "acceptance":["case 1: input -> expected (harness)", "..."],
 "premise":["path:line - fact", "..."],
 "rollback":"how the commit series reverts cleanly",
 "gate":"none|contract|policy-tighten|architecture|direction|irreversible|policy-loosen",
 "runner_up":"the slot's second-best idea, one line",
 "body":"## Summary\n...\n\n## Description\n...\n\n## Flow\n- ...\n\n## Expected impact\n...\n\n## Evaluation\nClaim: ...\nBefore: 0 of N acceptance cases pass (plus any counted figure)\nAfter: N of N\nMethod: gate - acceptance cases written as failing tests first\nResult: better\nGate: <same as gate field>",
 "evidence":"the proof: exact lines / grep output / counts, not prose"}
gate: every L is "architecture"; a capability the context's map description does not name is "direction" (say whether it is inside the map description's scope); in-tree contract changes (API route shape, session event shape, persisted learner JSON) are "contract" and must list every consumer.

## Output - write BEFORE you reply
Write C:/Users/kazda/kiro/firetv-challenge/.claude/scan-sweep/runs/challenge-2026-09-23/cards/<host>.json as:
{"host":"<host>","riders":[{"name":"<rider>","checked":"<one line: files read, hypothesis traced, why no card went there (or which card did)>"}],"files_read":["..."],"cards":[<card A>,<card B>]}
Use the Write tool (not a heredoc) - bodies contain backslashes and newlines; the file must parse as JSON.
Then reply with: the file path, the two titles with size/effort/impact/risk, and one line per rider. Nothing else.
