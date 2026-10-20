# helena-46 × EM1 · (recert-21)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 6e50d7c3
- Recertifies: 2026-10-09-essay-l1/recert-20 at bf036c94
- **Verdict now: L1-conditional (two rows open: the narrowed refusal residual, accepted, and one new English false positive).** 0 fixed, 1 recur; 2 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; 4 of 59 blind… (polish) | recurs → L1-helena-46-EM1-4 | recert-21 @6e50d7c3: Re-walked at 6e50d7c3 (the local main tip); what the previous walk (at bf036c94) found: paragraphIsEnglish (desk/src/lib/rules/essay.ts:280-291) is the same function. b490c9d0 changed two lines in place (CZECH_SHORT_SHAPE :245 gains four shapes; CZECH_SHORT_WORDS :247 gains three words), so no line moves. Narrowed again, not met. BLIND r4, tools/essay-heldout-czech-short-r4.json: committed alone in 76523b70 (2026-10-20 06:54:04, the only commit that touches the file) before the rule b490c9d0 (06:59:21); whole-file sha256 02a9eb1b1fb3696b420580206ebb881bf1a92dd2e7b111ac198a9c99ed8a3461; pinned inner sha256 3e4861b694fd72fd4e78fe98c652655d2c6aa3f4ec3d37ef047861dcb18bf3f7, recomputed equal. Czech refused 55 of 59 (93.2%) after the rule, 54 of 59 before it (b490c9d0^): 4 leaks, +1 blind line earned by the rule; English refused 1 of 45 both before and after (filed as L1-helena-46-EM1-9). r3 is now TUNED: 60 of 60 (57 of 60 before the rule), English 0 of 45; it is no longer blind evidence. r2 60 of 60, the first held-out 53 of 53 and the tuning set 56 of 56 are TUNED, 0 leaks, English 0 of 44, 0 of 42, 0 of 44. The 4 r4 leaks are not printed (counts only). DECISION (App Master's brief, 2026-10-20): word-list tuning stops after four rounds. Each fresh blind set leaked about 5 percent (r3 3 of 60 = 5.0%; r4 4 of 59 = 6.8%, measured here and above the 5 percent the brief expected), so the residual is accepted and stated and is not chased further with word lists. The row stays open as the accepted residual; a builder does not tune on it again. It reopens for work only on a non-word-list approach (for example a character-n-gram or statistical language identifier, measured on a fresh never-seen blind set pinned before it is built); closure needs zero blind leaks with 0 English refused. | 6e50d7c3 |

## New findings

| Finding | Severity | Resolution | Title |
| --- | --- | --- | --- |
| L1-helena-46-EM1-9 | minor · rank 4 | open | A short English line is refused as "not English": 1 of 45 English lines of the blind r4 set |

**L1-helena-46-EM1-9.** tools/essay-heldout-czech-short-r4.json english[15] (sha256 of the line, UTF-8: aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71) is refused by paragraphIsEnglish at 6e50d7c3 AND was refused before b490c9d0 (b490c9d0^), so the rule neither caused nor cured it: 1 of 45 English lines of the BLIND r4 set (the set's note says it holds Czech-looking English on purpose). The other English sets are clean: r3 0 of 45, r2 0 of 44, the first held-out 0 of 42, the tuning set 0 of 44. The line is identified by file, array index and sha256 only and is deliberately NOT printed: a recert record must not leak held-out text, and index plus hash is enough to reproduce it (read english[15] of that file, hash the string as UTF-8 sha256 to confirm it, call paragraphIsEnglish on it). Not tuned on, per the decision to stop word-list tuning; a fix is a builder step on a non-word-list approach. tools/essay-rules-test.cjs:2324 pins en.length<=1, not 0, so this refusal is allowed to stay green.

## Notes

- Evidence check at 6e50d7c3: every desk/src/lib/rules/essay.ts line was re-read (git diff -U0 bf036c94 6e50d7c3 shows two in-place edits, :245 and :247, so no line moves); desk/src/lib/desk/essay.ts changed in place at :10 and :303 only; desk/src/app/phone/page.tsx is byte-identical to bf036c94. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2. No held-out Czech leak and no held-out English line is printed in this file (counts, an index and a sha256 only).
