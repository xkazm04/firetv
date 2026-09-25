# Critic brief - /scan-sweep --challenge, run challenge-2026-09-25

You are the CRITIC: an independent reader. You did not write these cards and you have not seen the
reasoning of the scouts who did. Change no tracked file. The only thing you write is your verdicts file.

Tree: C:/Users/kazda/kiro/firetv (branch main, HEAD 7e47fbd). Verify against it.
Method: C:/Users/kazda/kiro/firetv/.claude/skills/scan-sweep/references/challenge.md sections 1, 4, 5.
Repo law: .claude/scan-sweep/config.md and .claude/spark/config.md "## Repo law". A card whose build
would break repo law is void (e.g. a TV screen that asks for typing, an answer or verb form put on
screen, a decision moved into a prompt, an engine called outside desk/src/lib/engines, product state
kept outside desk/src/lib/session/store.ts, anything that writes desk/data).
Never re-propose any of these (a card that restates one is void):
- uat/accepted-gaps.md, the human "no"s;
- every card on .claude/scan-sweep/runs/challenge-2026-09-23/deck.md, all built;
- every finding in .claude/scan-sweep/runs/challenge-2026-09-23/findings.jsonl, all built 2026-09-25.

A card MAY adopt the open backlog card "The desk's pairing PIN is checked only in the browser; the server takes join from anyone". It is the last "type":"finding" line in .personas/memory-outbox.jsonl.

The operator's taste binds every UX card:
- the TV is not a book: a verdict is a picture, prose goes only in the caption slot (about 25 words or fewer), and empty states are two words;
- the TV never asks for typing, and nothing may put the answer on screen;
- the module design languages (Lamplight, the Open Door, Specimen, "Left on the Desk") are the operator's contest picks, so a restyle is void;
- the Topics screen layout is reserved for the owner's own /cx walk.

The context map (context-map.json) is stale. Files added since 2026-09-23 are not in it, so an unmapped file in a write set is not by itself out of scope.
Also flag every pair of cards across hosts that propose the same move.
Cards: every file in .claude/scan-sweep/runs/challenge-2026-09-25/cards/*.json (12 cards, 2 per host).

## For every card
1. **Re-verify the premise** at every cited path:line on the tree as it is. Open the file; do not
   trust the quote. A premise that is false (the line does not say that, the count is wrong, the
   duplicate is not a duplicate) voids the card - count it as premise_false and say which line.
2. **Check the floors**: size M/L, effort >= 5, impact >= 7, risk 4-8, write_set <= ~15 files and
   <= ~800 lines and plausible for the change described (a write_set that omits a file the change
   obviously needs is a grounding defect), 3-8 acceptance cases, each writable as a failing test
   in the harness it names with no live model call. A card that is really an S is void (re-home).
3. **Check gate honesty**: every L must be `architecture`; a capability the context's map
   description (context-map.json) does not name is `direction`; an in-tree contract must list
   every consumer - grep for them. Irreversible or policy-loosen cards are marked excluded.
4. **Grade 1-5, one sentence each**:
   - ambition - is this the move a principal engineer / principal designer would make here, or a
     big-sounding tidy-up?
   - grounding - does every claim stand on the tree as it is?
   - falsifiability - would the acceptance cases catch a wrong build? (cases that a stub could pass
     trivially, or that test the implementation's own list, score low)
5. **Verdict**: `build`, `revise` (ONE concrete change the coordinator can apply to the card text -
   a case to add, a write_set entry, a gate correction - no second scout round), or `void` (reason).

You never add a card of your own.

## Output - write BEFORE you reply
Write .claude/scan-sweep/runs/challenge-2026-09-25/critic.json with the Write tool:
{"critic_model":"<your model id>","cards":[{"host":"..","slot":"..","title":"..","premise_checked":["path:line - true|false - note"],
 "premise_false":false,"floors_ok":true,"gate_ok":true,"gate_should_be":null,
 "ambition":{"score":4,"why":".."},"grounding":{"score":5,"why":".."},"falsifiability":{"score":4,"why":".."},
 "verdict":"build|revise|void","revise":"<the one change, or null>","void_reason":null,
 "deck_line":"<= 140 chars: why a human should or should not approve it"}],
 "means":{"ambition":0,"grounding":0,"falsifiability":0},
 "overlaps":["<pairs of cards whose write_sets intersect, with the shared paths>"],
 "signature_changes":["<cards that change a signature other cards call>"]}
Then reply with a table: host, slot, title, verdict, A/G/F, and the three means. Nothing else.
