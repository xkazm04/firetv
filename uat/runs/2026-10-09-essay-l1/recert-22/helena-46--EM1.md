# helena-46 × EM1 · (recert-22)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 820a115d
- Recertifies: 2026-10-09-essay-l1/recert-21 at 6e50d7c3
- **Verdict now: L1-pass on code (both rows fixed on code; L2 owed).** 2 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-9 A short English line is refused as "not English": 1 of 45 English lines of the blind r4 set (minor) | fixed (not-seen) | The round-5 letter-run profile (desk/src/lib/rules/essayLang.ts, read in paragraphIsEnglish desk/src/lib/rules/essay.ts:305-313) lifts a refusal that rests on Czech alone when the line leans English. tools/essay-heldout-czech-short-r4.json english[15] (sha256 aab59657a72c339de214c8918ffcbc28490326c7d42acb73e74141c37daaeb71) is English; r4 English refused 0 of 45 (1 of 45 on the 6e50d7c3 rule); 0 English refused on every older set and on r5 BLIND. tools/essay-rules-test.cjs:2326 is a failing assertion of 0 (was `en.length<=1`). | d97ec7b9 |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; 4 of 59 blind… (polish) | fixed (not-seen) | The same profile, a character 1-4-gram Czech/English naive-Bayes table trained on the tuning and older held-out sets (never r5), with no word or shape added to a list. The fresh blind set tools/essay-heldout-czech-short-r5.json (committed alone in befc9a06 before the rule) has 60 of 60 Czech refused and 0 of 45 English refused, measured once after the rule was final (57 of 60 and 1 of 45 on the 6e50d7c3 rule). The closure bar of recert-21 (zero blind leaks, 0 English refused) is met. r4 is TUNED now (59 of 59). | d97ec7b9, 820a115d |

## New findings

None.

## Notes

- Evidence check at 820a115d: `git diff -U0 6e50d7c3 820a115d -- desk/src/lib/rules/essay.ts` has the import (:10) and the rule (:281-313); lines after :289 move +22. desk/src/lib/desk/essay.ts is byte-identical to 6e50d7c3. desk/src/app/api/analyse/route.ts moved in place in its Body type only (1aa32287, :19, :21); the refusals at :173 and :201 are unchanged.
- Confound: r5 was written by the same builder session that built the profile, before it opened the rule or any earlier set; a fresh author is the stronger proof. Nothing is resolved-verified: that needs live L2 evidence. No held-out line is printed in this file (counts, an index and a sha256 only).
