# Scout brief - /scan-sweep --challenge, run challenge-2026-10-07 (moonshot, plan M3 / owner goal 2)

You are a READ-ONLY scout. Change no tracked file. The only thing you write is your cards file.

Tree: C:/Users/kazda/.personas/headless-masters/worktrees/firetv/a1c07b31 (branch
autopilot/codebase-architecture-review-a1c07b31, HEAD 27c66e1e = local main). Read the tree THERE. Never
read or write C:/Users/kazda/kiro/firetv except the one read-only file named below. Never open desk/data/
(real learners). Start no dev server, install nothing, call no model endpoint.

Method: the skill lives at C:/Users/kazda/kiro/ai-registry/skills/scan-sweep (read-only). Read
references/challenge.md sections 1, 3 and 4, and the two `Group: challenge` lenses in references/lenses.md,
before you write a card.

## Who must win

A parent and a child at home on the sofa. The phone is the instrument, the TV is the shared page. For now
the surface that must win is the web app desk/ on this computer. Hackathon deadline 2026-10-23: ONE builder
must be able to build each card in ONE run before 2026-10-22.

## The ask: moonshot, not tidy-up

Each card is the structural or experience move that makes THIS module the reason a family opens the app.
A rename, a dedupe with no user consequence, or a polish pass is not a card here.

## Your host is a MODULE, not just the map's file list

context-map.json lists the module's TV files; the module's real surface also includes its phone panel,
its rules under desk/src/lib/rules and desk/src/lib/<module>, its API routes and its pipeline (the
desk-pipelines context). List the real directories (`git ls-files desk | grep -i <module>` and the imports
out of the TV file) and read what is there. Then `git log --oneline -40 -- <host paths>` so you know what
landed recently. Your cards may write into any file that belongs to YOUR module's flow, wherever it lives.

## Repo law (a card that breaks it is void)

.claude/scan-sweep/config.md "## Repo law" and .claude/spark/config.md "## Repo law": On Air for every TV
surface; the TV never asks for typing; decisions stay in code (desk/src/lib/rules/), the model explains,
never decides; engines stay behind desk/src/lib/engines/; the session (desk/src/lib/session/store.ts) is the
only state; withholding is the product (no answer, verb form or rewritten sentence on screen); never touch
desk/data/; no live model call in any test.

## Operator taste - binding on every UX card

- It is a TV, not a book. A verdict on a Study Desk TV screen is a PICTURE. Prose only in the caption slot,
  about 25 words or fewer of visible body text. Empty states are two words.
- The modules are standalone branded apps with finished design languages chosen in a contest: Math Buddy =
  Lamplight, Linga = the Open Door, Essay Master = Specimen, landing = "Left on the Desk". Never propose a
  restyle. A UX card changes what a screen lets you DO or KNOW, within that language.
- Do not rework the Topics screen's layout (reserved for the owner's /cx walk).

## Read first

desk/CLAUDE.md, desk/AGENTS.md; your module's design doc (docs/DESIGN-MATH-BUDDY.md,
docs/DESIGN-LINGA.md, docs/DESIGN-ESSAY-MASTER.md); for Linga also docs/LINGA-COMPETITIVE-SCOPE.md (MH-1..MH-4
are BUILT in 73011e98..27c66e1e; every DECLINE and LATER there stays declined), docs/LINGA-CONVERSATION-DESIGN.md;
for Math also docs/MATH-COURSE-PATHS.md; for all docs/FAMILY-PHASE-1-PLAN.md, docs/STUDY-DESK-SCOPE.md,
docs/DESIGN-ON-AIR.md.

## Never re-propose (built, decided, or already open) - a card restating one is void

- Every card on .claude/scan-sweep/runs/challenge-2026-09-23/deck.md, challenge-2026-09-25/deck.md and
  challenge-2026-10-05/deck.md (36 cards, ALL BUILT). Read cards-final.json of 10-05 for its math-buddy,
  linga and essay content in detail: one typed second go on a ringed item; one item-kind registry for
  marker/explainer/hint; one owner for the Linga phone + one level-check table; certificate shows what it
  still needs and the next scene steers toward it; the essay paragraph sits with its learner.
- Every finding in every findings.jsonl under .claude/scan-sweep/runs/ (read their titles).
- The four "type":"finding" lines in C:/Users/kazda/kiro/firetv/.personas/memory-outbox.jsonl (READ-ONLY;
  grep '"type":"finding"').
- uat/accepted-gaps.md (human "no"s).
- A card MAY adopt an open, high-effort backlog item of your module; cite it. (A "context map omits X" item
  is a doc edit, not a card.)

## The cohort - so two scouts do not propose the same move

Hosts: math-buddy, linga, essay-master. Cross-module moves (one shared "tonight" spine, a shared recap)
belong to whichever module's seam they start from; if your best idea is really another host's, make it your
runner_up, not a card. Hot shared files (desk/src/lib/session/store.ts, desk/src/tv/screens.tsx,
desk/src/tv/keys.ts) serialise waves: prefer a write set that avoids them, and say so when you cannot.

## Your job

1. Read every file of your module in full; read the neighbours your ideas depend on (callers, store.ts,
   the rules suites under tools/) closely enough to ground them.
2. Consider many moves; return exactly TWO cards:
   - slot A `architecture-challenger`: the ONE structural move that unlocks the module's next leap for the
     family (the seam that caps it, a decision hiding in a prompt or a component, a hand list that should be
     derived, a state machine in booleans, a pipeline that should be resumable). Name the seam, COUNT its cost,
     and say what family-visible capability it unlocks.
   - slot B `ux-elevation`: the experience LEAP on the sofa: five steps become one; a blind decision where the
     app already holds the data; a status that should be where the action is taken; a missing mode (compare,
     resume, undo, preview, parent-and-child together).
3. Floors for every card: size M or L (never S); effort >= 5; impact >= 7; risk 4-8; write_set <= ~15 files
   and <= ~800 changed lines, declared up front, EVERY write_set path must exist on HEAD (new files go in
   new_files), and none under desk/data/; 3-8 acceptance cases.
   - Each case is "input -> expected (harness)", writable as a FAILING test first. Allowed harnesses ONLY:
     (a) a node:test suite under tools/ wired into `cd desk && npm run test:rules` (existing suite, or a new
     tools/<name>-test.cjs appended to desk/package.json test:rules - then list desk/package.json in
     shared_surfaces); see tools/linga-rules-test.cjs for how suites transpile desk TS; or (b) the browser
     harness (tools/linga-ui-test.cjs style) ONLY if the case needs no live model call. Prefer (a).
   - A guard case (behaviour that must NOT change, green before by design) is allowed only if labelled
     "GUARD:".
   - No live model calls: stub at the engines `provider` seam.
4. Premise: every claim stands on a repo-relative `path:line` you actually read on THIS tree. Count things:
   sites, duplicates, steps, branches. A premise the critic cannot reproduce voids the card.

## Card JSON (one object per card; all fields required)

{"context":"<module the card changes>","host":"<your host>","slot":"A|B","lens":"architecture-challenger|ux-elevation",
 "title":"<= 80 chars","size":"M|L","effort":7,"impact":8,"risk":6,
 "write_set":["repo-relative path existing on HEAD", "..."],"new_files":["..."],"shared_surfaces":["desk/package.json if you add a rules suite"],
 "acceptance":["case 1: input -> expected (harness)", "..."],
 "premise":["path:line - fact", "..."],
 "rollback":"how the commit series reverts cleanly",
 "gate":"none|contract|policy-tighten|architecture|direction|irreversible|policy-loosen",
 "runner_up":"the slot's second-best idea, one line",
 "body":"## Summary\n...\n\n## Description\n...\n\n## Flow\n- ...\n\n## Expected impact\n...\n\n## Evaluation\nClaim: ...\nBefore: 0 of N acceptance cases pass (plus any counted figure)\nAfter: N of N\nMethod: gate - acceptance cases written as failing tests first\nResult: better\nGate: <same as gate field>",
 "evidence":"the proof: exact lines / grep output / counts, not prose"}

Gate rules: every L is "architecture". A capability the module's context-map description and design doc do
not name is "direction" (say whether it is inside the module's scope). An in-tree contract change (API route
shape, session event shape, persisted learner JSON) is "contract" and the card lists every consumer.

## Output - write BEFORE you reply

Write C:/Users/kazda/.personas/headless-masters/worktrees/firetv/a1c07b31/.claude/scan-sweep/runs/challenge-2026-10-07/cards/<host>.json as:
{"host":"<host>","riders":[],"files_read":["..."],"cards":[<card A>,<card B>]}
Use the Write tool, not a heredoc: bodies contain backslashes and newlines, and the file must parse as JSON.
Verify it parses (`node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'))"`).
Then reply with: the file path, the two titles with size/effort/impact/risk/gate, your model id, and nothing else.
