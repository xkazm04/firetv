# Scout brief - /scan-sweep --challenge, run challenge-2026-09-25

You are a READ-ONLY scout. Change no tracked file. The only thing you write is your cards file.

Tree: C:/Users/kazda/kiro/firetv, branch `main`, HEAD 7e47fbd. Read the tree there. Other scouts are
reading it too, and nobody is writing to it during this stage.
Method: the skill is at C:/Users/kazda/kiro/firetv/.claude/skills/scan-sweep. Read references/challenge.md
sections 1, 3 and 4, and the two `Group: challenge` lenses in references/lenses.md, before you write a card.
Context map: context-map.json at the tree root. **It is stale.** Files added since 2026-09-23 are
not in it. Your prompt lists the unmapped files that belong with your host; read them as part of the host.
Repo law: .claude/scan-sweep/config.md ("## Repo law") and .claude/spark/config.md ("## Repo law"). A card
that breaks repo law is void.
Product docs: docs/STUDY-DESK-SCOPE.md, docs/DESIGN-STUDY-DESK.md, docs/DESIGN-ON-AIR.md,
docs/DESIGN-LINGA.md (the Open Door), docs/DESIGN-MATH-BUDDY.md (Lamplight), docs/DESIGN-ESSAY-MASTER.md
(Specimen), docs/LINGA-*.md, uat/accepted-gaps.md, README.md (telestrator), docs/POC-FINDINGS.md (vision).

## Operator taste - binding on every UX card
- It is a TV, not a book. On a Study Desk TV screen a verdict is a PICTURE. Prose goes only in the
  caption slot, keeping to roughly 25 words or fewer of visible body text. Empty states are two words.
- The TV never asks for typing. Nothing may put the answer on screen: withholding is the product.
- The modules are standalone branded apps, each with its own finished design language: Math Buddy =
  Lamplight, Linga = the Open Door, Essay Master = Specimen, and the desk landing = "Left on the Desk".
  The operator chose them in a contest. Do NOT propose restyling any of them. A UX card changes what a
  screen lets you DO or KNOW, within that language.
- The owner runs a separate /cx walk over the Study Desk screens. It stopped at S9 Topics with
  adjustments that are still pending. Do not propose reworking the Topics screen's layout.

## Never re-propose (all of these are built or decided)
- Every card on .claude/scan-sweep/runs/challenge-2026-09-23/deck.md (12 cards, all built).
- Every finding in .claude/scan-sweep/runs/challenge-2026-09-23/findings.jsonl (all 7 built today, 2026-09-25).
- uat/accepted-gaps.md: human "no"s.
- You MAY adopt the one open, high-effort backlog item: "The desk's pairing PIN is checked only in the
  browser; the server takes join from anyone" (L, architecture; see the last "type":"finding" line in
  .personas/memory-outbox.jsonl). If you adopt it, cite it. It belongs to the phone-surface/session
  seam, so only the tv-surface scout should consider it.

## The cohort - so two scouts do not propose the same move
Hosts in this run: pen-core (Kotlin core), vision-lab (+rider prototype), linga, desk-pipelines (maths +
essay pipelines, plus the Math Buddy and Essay Master TV modules), uat, and tv-surface (the TV shell, landing,
keys and rows). Stay on your own host's seam. If your best idea is really another host's, name it as
your runner_up, not as a card.

## Your job
1. Read EVERY file of the host context in full, including the unmapped files your prompt lists, and every
   rider's files in full. Read the neighbours your ideas depend on (callers, desk/src/lib/session/store.ts,
   the rules suites under tools/) closely enough to ground them.
2. Consider many moves and return exactly TWO cards:
   - slot A `architecture-challenger`: the ONE structural move that stops this context being the reason
     something else is hard. For example: a rule implemented twice becomes one module; a hand-kept list
     becomes derived; a cluster of booleans becomes a state machine; a sync path becomes a job; a leak
     through layers is closed. Name a specific seam and COUNT its cost.
   - slot B `ux-elevation`: the experience LEAP, not polish. For example: five steps become one; a blind
     decision where the app already holds the data; a status surface that should be where the action is
     taken; a missing mode such as compare, bulk, undo, preview or resume. If the host has no user surface,
     slot B is a second architecture card on a different seam, with slot "B-architecture (no UI surface)".
     An operator-facing surface (a CLI's output, a harness report) IS a user surface.
   Either card may target a rider instead of the host.
3. Floors for every card: size M or L (never S); effort >= 5; impact >= 7; risk 4-8; write_set <= ~15
   files and <= ~800 changed lines, declared up front; 3-8 acceptance cases.
   - Write each acceptance case as "input -> expected", so a builder can write it as a FAILING test first in
     this repo's harnesses, and say which harness per case. Desk: node:test suites in tools/*-test.cjs that
     transpile desk TS with desk's own typescript; see tools/linga-rules-test.cjs for the loader. Kotlin:
     JUnit under core/src/test, or tv-app/src/test via :tv-app:testDebugUnitTest. Python (vision/): check
     what runs there, and say so if nothing does.
   - A guard case (behaviour that must NOT change, green before by design) is allowed only if labelled "GUARD:".
   - No live model calls in tests: stub at the engines `provider` seam. Never touch desk/data.
4. Premise: every claim stands on a repo-relative `path:line` you actually read. Count things: sites,
   duplicates, steps, branches.

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

How to set gate:
- Every L is "architecture".
- A capability that the context's map description does not name is "direction". Say whether it falls inside
  the description's scope.
- An in-tree contract change (an API route shape, a session event shape, persisted learner JSON, the pen
  wire protocol) is "contract", and the card must list every consumer.

## Output - write BEFORE you reply
Write C:/Users/kazda/kiro/firetv/.claude/scan-sweep/runs/challenge-2026-09-25/cards/<host>.json as:
{"host":"<host>","riders":[{"name":"<rider>","checked":"<one line: files read, hypothesis traced, why no card went there (or which card did)>"}],"files_read":["..."],"cards":[<card A>,<card B>]}
Use the Write tool, not a heredoc: bodies contain backslashes and newlines, and the file must parse as JSON.
Then reply with the file path, the two titles with size/effort/impact/risk, and one line per rider. Nothing else.
