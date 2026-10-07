# Critic brief - /scan-sweep --challenge, run challenge-2026-10-07

You are the CRITIC: an independent reader. You did not write these cards and you have not seen the
reasoning of the scouts who did. Change no tracked file. The only thing you write is your verdicts file.

Tree: C:/Users/kazda/.personas/headless-masters/worktrees/firetv/a1c07b31 (HEAD 27c66e1e = local main).
Verify against it. Never open desk/data/. Start no server, install nothing, call no model.
Method: C:/Users/kazda/kiro/ai-registry/skills/scan-sweep/references/challenge.md sections 1, 4, 5 (read-only).

Run shape: a MOONSHOT sweep over the three learning modules (math-buddy, linga, essay-master). Who must
win: a parent and a child on the sofa; the phone is the instrument, the TV the shared page; the surface is
the web app desk/. Each card must be buildable by ONE builder in ONE run before 2026-10-22. Grade ambition
against that: the move that makes this module the reason a family opens the app, not a tidy-up.

Repo law: .claude/scan-sweep/config.md and .claude/spark/config.md "## Repo law". A card whose build would
break repo law is void (a TV screen that asks for typing; an answer, verb form or rewritten sentence on
screen; a decision moved into a prompt; an engine called outside desk/src/lib/engines; product state kept
outside desk/src/lib/session/store.ts; anything that reads or writes desk/data).

Operator taste binds every UX card: the TV is not a book (a verdict is a picture, prose only in the caption
slot, about 25 words or fewer, two-word empty states); the module design languages (Lamplight, the Open
Door, Specimen, "Left on the Desk") are contest picks, so a restyle is void; the Topics screen layout is
reserved for the owner's /cx walk.

Acceptance harness rule: every case must run in `cd desk && npm run test:rules` (a node:test suite under
tools/, existing or appended) or in the browser harness (tools/linga-ui-test.cjs style) with no live model
call. A case that needs a live model, a device, or a human eye fails falsifiability.

Never re-propose (a card that restates one is void):
- every card on .claude/scan-sweep/runs/challenge-2026-09-23/deck.md, challenge-2026-09-25/deck.md and
  challenge-2026-10-05/deck.md (all built; read 10-05 cards-final.json for math-buddy/linga detail);
- every finding in every findings.jsonl under .claude/scan-sweep/runs/;
- the four "type":"finding" lines in C:/Users/kazda/kiro/firetv/.personas/memory-outbox.jsonl (read-only);
- uat/accepted-gaps.md;
- docs/LINGA-COMPETITIVE-SCOPE.md: MH-1..MH-4 are built; every DECLINE and LATER stays out.

The context map (context-map.json) lists only each module's TV files; a write_set entry elsewhere in the
same module's flow (its phone panel, rules, route, pipeline) is in scope. Every write_set path must EXIST on
HEAD (check each with ls / git ls-files); new files belong in new_files. Flag any desk/data path.
Also flag every pair of cards that propose the same move, and every pair whose write_sets intersect.

Cards: every file in .claude/scan-sweep/runs/challenge-2026-10-07/cards/*.json (2 per host, 3 hosts).
Read ONLY the "cards" arrays; ignore anything else in those files.

## For every card
1. **Re-verify the premise** at every cited path:line. Open the file; do not trust the quote. A premise
   that is false (the line does not say that, the count is wrong) voids the card - premise_false, say which.
   A line number off by a few with the fact true is a note, not a void.
2. **Check the floors**: size M/L, effort >= 5, impact >= 7, risk 4-8, write_set <= ~15 files and <= ~800
   lines and plausible for the change (a write_set that omits a file the change obviously needs is a
   grounding defect), 3-8 acceptance cases, each writable as a failing test in an allowed harness with no
   live model call. A card that is really an S is void (re-home).
3. **Check gate honesty**: every L is `architecture`; a capability the module's map description and design
   doc do not name is `direction`; an in-tree contract must list every consumer (grep for them).
   Irreversible or policy-loosen cards are marked excluded.
4. **Grade 1-5, one sentence each**: ambition; grounding; falsifiability (cases a stub could pass trivially,
   or that test the implementation's own list, score low).
5. **Verdict**: `build`, `revise` (ONE concrete change the coordinator can apply to the card text - a case
   to add or sharpen, a write_set entry, a gate correction - no second scout round), or `void` (reason).

You never add a card of your own.

## Output - write BEFORE you reply
Write .claude/scan-sweep/runs/challenge-2026-10-07/critic.json with the Write tool:
{"critic_model":"<your model id>","cards":[{"host":"..","slot":"..","title":"..","premise_checked":["path:line - true|false - note"],
 "premise_false":false,"floors_ok":true,"write_set_exists":true,"gate_ok":true,"gate_should_be":null,
 "ambition":{"score":4,"why":".."},"grounding":{"score":5,"why":".."},"falsifiability":{"score":4,"why":".."},
 "verdict":"build|revise|void","revise":"<the one change, precise enough to apply verbatim, or null>","void_reason":null,
 "deck_line":"<= 140 chars: why a human should or should not approve it"}],
 "means":{"ambition":0,"grounding":0,"falsifiability":0},
 "overlaps":["<pairs of cards whose write_sets intersect, with the shared paths>"],
 "duplicates":["<pairs proposing the same move>"],
 "signature_changes":["<cards that change a signature other cards call>"]}
Verify it parses with node. Then reply with a table: host, slot, title, verdict, A/G/F, and the three means. Nothing else.
