# L1 recertify, round 15, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 7 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 0e6a63c6 (`0e6a63c6ca01a5a0d8a828ea1a84b2d4aca2bfc3`, local main), after the three commits that landed since 67e0a3a6 (11ea02f7, the recert-14 commit, changed nothing under desk/ or tools/): aec861ad (L1-helena-46-EM1-1), ce4be516 (the whole-piece gap recert-14 logged under L1-daniel-15-EM3-1) and 0e6a63c6 (L1-daniel-15-EM3-2). No model call of any kind (no claude CLI, no API, no judge model), no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran under the OS temp directory, outside the repo (`rc15/pure.cjs`, `render.cjs`, `sweep.cjs`, `phone.cjs`, `remap.cjs`, loaded through `tools/ts-load.cjs`). The stamps went through `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap, and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-14) | 0 | 5 | 5 | 1 | **11** |
| Fixed | 0 | 0 | 1 | 0 | **1** |
| Recur (severity now) | 0 | 5 | 4 | 1 | **10** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 5 | 4 | 1 | **10** |

OPEN.md Essay 11 -> 10; total open 243 -> 242 (Math 6 -> 6: no Math round was run, see the Math paragraph; Linga 226 -> 226). The Linga section of OPEN.md is byte for byte unchanged: sha256 of the text from "# Linga" up to "# Essay Master" is `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` after (equal).

## Reconcile: the commits the rows name

All three are ancestors of main (`git merge-base --is-ancestor aec861ad main`, `ce4be516 main`, `0e6a63c6 main`: each true).

| Commit | Row | Result |
| --- | --- | --- |
| aec861ad | L1-helena-46-EM1-1 | **fixed**: the plan heading, the lens-home label and the read counter say message in Adult mode; every other mode keeps paragraph |
| ce4be516 | recert-14 gap under L1-daniel-15-EM3-1 (not a row) | **checked, no stamp**: one pieceRead() block, rendered under all three panels, only for more than one paragraph |
| 0e6a63c6 | L1-daniel-15-EM3-2 | **narrowed, still open**: the route fallback and the TV header both hold; the phone never sends the title line, so the shipped path reaches neither |

`git diff -U0 11ea02f7 main` touches desk/src/app/api/analyse/route.ts (taskFor :56, calls :190, :203), desk/src/app/phone/page.tsx (pieceRead :288-295 and three call sites), desk/src/essay/EssayTV.tsx (:164, :194, :235, :355, :438), desk/src/lib/rules/essay.ts (forensicTitle :134-135, which moves every later line by 3) and three test files.

## Rows now fixed

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-helena-46-EM1-1` Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs | minor | **aec861ad** | **Half 1, Adult mode.** The plan screen's heading is `adultSay("Your paragraph, one sentence at a time", adult)` (desk/src/essay/EssayTV.tsx:235, `adult` from `adultSeat(s)` :219), the lens home's empty-state label `adultSay("First paragraph", adult)` (:194, `adult` :149) and the read counter `adultSay("paragraph", adult)` (:164); `adultSay` is desk/src/lib/rules/essay.ts:923. Rendered (renderToStaticMarkup of the real EssayType and EssayPlan, no model): "2 messages read", "First message", "Your message, one sentence at a time". The recert-14 sweep over 27 renders (every lens stop at home, wait and fail, the plan screen in four states, every playbook and x-ray stop) finds no "paragraph" for an adult profile. **Half 2, every other mode.** A family profile and a profile with no mode both render "2 paragraphs read", "First paragraph", "Your paragraph, one sentence at a time", and the family sweep still says paragraph where it did at 67e0a3a6. tools/essay-rules-test.cjs 169/0. The rendered TV is L2. |

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-daniel-15-EM3-2` A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the prompt as a task | 0e6a63c6 | The title never leaves the phone. The route half holds (desk/src/app/api/analyse/route.ts:56 `taskFor`, used at :190 and :203) and the header half holds (EssayTV.tsx:355 `forensicTitle(a)`, drawn at :438, rules/essay.ts:135). But `paragraphsOf` keeps the title line out (rules/essay.ts:86-88) and the phone sends only what it returns: `readPiece` posts `paras.join` (desk/src/app/phone/page.tsx:333, call :339) and `analyseParagraph` posts `ps[0]` (:359, call :366), with `paras` and `ps` from `paragraphsOf` at :319, :327 and :359. |

### The fallback, executed (pure function, outside the repo)

The route's own `taskOf` and `taskFor` lines were read out of route.ts:54-56 and run with the real `titleOf` (rules/essay.ts:132), through `tools/ts-load.cjs`. Exact output:

```
title line, no task         => titleOf: "Why sleep matters" | taskFor: "Why sleep matters"        | forensicTitle: "Why sleep matters"
title line + task           => titleOf: "Why sleep matters" | taskFor: "Write about school hours"  | forensicTitle: "Why sleep matters"
neither (no title, no task) => titleOf: null                | taskFor: undefined                    | forensicTitle: null
blank task + title          => titleOf: "Why sleep matters" | taskFor: "Why sleep matters"        | forensicTitle: "Why sleep matters"
forensicTitle(null): null
```

The route's task choice is not exported, so it was run from its source lines, not imported. The forensic page, rendered (`Forensic`, renderToStaticMarkup): a reading whose text starts with the title line draws `<div class="em-lbl" data-role="essay-title">Title · Why sleep matters</div>`; a reading without one draws none.

### What the phone sends, executed

```
paragraphsOf(titled piece) = ["Many students are tired in the morning. Schools start too early.","Sleep helps memory. Tired pupils forget more."]
phone readPiece sends text = paras.join("\n\n") -> two paragraphs, no title line | titleOf of that = null
paragraph path: analyseParagraph sends ps[0] = "Many students are tired in the morning. Schools start too early." | titleOf = null
```

So only a client that posts raw text with its title line reaches the fallback (tools/essay-piece-test.cjs does, 52/0); the phone does not. The brief asked for both named halves, and both hold; the row is narrowed rather than fixed because its acceptance ("passed to the reading prompt as the task", "shown as such") is not met on the product's own path. If the App Master reads the acceptance as the two route/TV halves alone, the stamp is a one-line change to `uat/runs/2026-10-09-essay-l1/recert-15/findings.json` and the parent findings (see the question in the result file).

## The ce4be516 gap (recert-14, under L1-daniel-15-EM3-1)

`pieceRead()` (desk/src/app/phone/page.tsx:288-295) is one block, defined once and returned only when `paras.length > 1` (:289). It holds Keep (:290), the message / email / essay radios (:291), the title box, the stranded-rewrites line and the button `essay-read-piece` (:294; the same `readPiece()` call and the same `disabled={busy || notice !== null}` rule as before). Render sites:

| Panel | data-role | Site |
| --- | --- | --- |
| sentence rewrite | `essay-rewrite` (:845) | `{pieceRead()}` at :850 |
| plan | `essay-plan` (:852) | `{pieceRead()}` at :856 |
| paragraph | `essay-paragraph` (:858) | `{pieceRead()}` at :869 |

tools/phone-panel-test.cjs pins the three sites, the single button definition and the `paras.length > 1` guard (116/0, the new case included). Source-read, not screenshot-verified (L2).

## Language check

`paragraphIsEnglish` (desk/src/lib/rules/essay.ts:264-271, the old :261-268) is unchanged since ffa91a49. Hashes of the 51-line window, taken exactly as recert-14 took them (`sed -n` of the lines, sha256): ffa91a49 lines 225-275 `1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1`; 11ea02f7 lines 225-275 the same; 0e6a63c6 lines 228-278 the same (the window sits 3 lines lower since forensicTitle was added at :134-135, so today's literal lines 225-275 hash differently, which is the shift and not a change; the diff touches the file at :134-136, :285, :323, :348, :559 and from :900 on, none in the check). No new probe was taken; `recert-12/heldout.json` stays the latest language measure: plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32, short plain-letter Czech 4 of 6.

## Math: why recert-11 was not run

`git diff 11ea02f7..main` touches desk/src/app/phone/page.tsx, which two open Math rows cite (L1-matyas-19-MB1-1: :406, :424, :425, :441; L1-radka-41-MB5-2: :757-768, :866-877, :881). Every hunk of that diff is inside the Essay panels: old line 286 (nine lines inserted, new :287-295, the pieceRead definition) and three call-site hunks, old :841 (new :850, rewrite panel), old :847 (new :856, plan panel) and old :860-865 (six lines replaced by one, new :869, the paragraph panel). No cited line is inside a hunk; each was re-mapped by the hunks (+9 between :287 and :859, +4 after :865) and compared with the old line, and all ten are byte for byte equal: 406 -> 415, 424 -> 433, 425 -> 434, 441 -> 450, 460 -> 469, 757 -> 766, 768 -> 777, 866 -> 870, 877 -> 881, 881 -> 885. The other three changed desk files (analyse/route.ts, EssayTV.tsx, rules/essay.ts) are cited by no open Math row (they cite rules/school.ts, calc.ts, worked.ts, items.ts, gcse.ts, api/mark/route.ts and tv/keys.ts, none touched). So Math recert-11 was not run and OPEN.md's Math section (6 open) is as recert-10 left it.

## Suites run as read-only evidence at 0e6a63c6

tools/essay-rules-test.cjs 169/0, tools/essay-piece-test.cjs 52/0, tools/phone-panel-test.cjs 116/0, plus tools/tv-recap-test.cjs 62/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0. Run from the repo, nothing installed.

## Open rows, ranked by how cheaply each could close before 10-23

Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23. "Builder alone" means no ruling, teacher or vision path is needed to land the code.

| # | Row | Effort | Files | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-daniel-15-EM3-2` (major, rank 9) | S | desk/src/app/phone/page.tsx:319, :327, :333, :359-366, tools/phone-panel-test.cjs | builder alone (a no-ruling fix) | Keep the title line the learner typed or pasted and send it: read it with `titleOf` on the raw box text before `paragraphsOf` drops it, and post it as `task` (or prepend it to `text`) on the piece and paragraph calls; a phone-panel test pins that a titled paste reaches `/api/analyse` with its title. The route and the header are in. |
| 2 | `L1-kristyna-17-EM1-3` (minor, rank 6) | S | desk/src/lib/desk/essay.ts:102-112 (prompt), desk/src/lib/rules/essay.ts:462, :475 (CHECKS lines) | **operator ruling** (which language the notes use: the learner's, or always English), then a builder | One language line in the reading prompt, once the ruling names the language. Still needs: the ruling, then a prompt test; whether the model obeys is L2. |
| 3 | `L1-daniel-15-EM2-2` (minor, rank 4) | M | desk/src/lib/rules/essay.ts:572, :612, desk/src/lib/desk/essay.ts:288 | builder alone (a no-ruling fix) | A rewrite of a claim first ruled neutral as a later unsupported claim is not ruled faulty on that ground alone: judge it with its paragraph's other sentences, not as `Set([n])` on its own. Still needs: the rule change and fixtures for the neutral-then-faulty case; no ruling. |
| 4 | `L1-eliska-12-EM2-1` (minor, rank 6) | M | desk/src/lib/desk/essay.ts:255, :288-292 | builder alone (a no-ruling fix) | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line. |
| 5 | `L1-helena-46-EM1-5` (minor, rank 6) | M | desk/src/app/phone/page.tsx:366 (paragraph call), :289-291 (radios, gated on Keep and more than one paragraph), desk/src/lib/desk/essay.ts:159-163, desk/src/app/api/analyse/route.ts:19 | builder alone (a no-ruling fix) | The phone asks message / email / essay before any read, also for one paragraph, and the body carries `format` on kind essay; `analyseEssay` takes it. Still needs: the radios shown without Keep and a format field on the essay body (route.ts:19), plus the test; the only product choice is to ask before every read or only on a doubt, which a builder can settle. |
| 6 | `L1-helena-46-EM1-4` (polish, rank 2) | M | desk/src/lib/rules/essay.ts:268 (under-6-words arm) | by design in part (the lax arm is deliberate); an **operator ruling** to accept it, or a builder with a held-out set | Tighten the under-6-words arm for short plain-letter Czech (2 of 6 pass) without refusing short English; a short-English held-out set comes first. |
| 7 | `L1-kristyna-17-EM1-1` (major, rank 9) | M-L | desk/src/lib/rules/essay.ts:14, :16, :415, :428, :583 | builder for the refusal arm; the language-aware rules are an **operator ruling** | Close the short plain-Czech gap and pin a 50+ held-out Czech corpus in tools/; the other arm is language-aware verdict rules (L). |
| 8 | `L1-kristyna-17-EM1-2` (major, rank 9) | M-L | desk/src/app/phone/page.tsx:339, :366, desk/src/app/api/analyse/route.ts:54-56, :190, :203, desk/src/lib/desk/essay.ts:102-120 | builder alone for the task half; **L2** to judge the reading | A client sends the task and the learner's recurring faults reach the prompt. Row 1 moves the title half of the task. Closes together with row 9. |
| 9 | `L1-barbora-43-EM1-2` (major, rank 9) | M-L | same files as row 8 | as row 8 | Same gap (S6 task name, S7 fault counts). |
| 10 | `L1-eliska-12-EM1-4` (major, rank 9) | M-L | desk/src/lib/desk/essay.ts:33-35, desk/src/lib/rules/essay.ts:561-579 | builder, but only **L2** (a model reading) shows it holds | Require supports / backs for evidence-job and checkable sentences, or refuse a reading that names none. |

Waiting on an operator ruling: row 2 (language of the notes), the language-aware arm of row 7, the lax arm of row 6 if it is to stay. Waiting on a teacher: none. Waiting on the vision path: none. Waiting on L2 to confirm: rows 8, 9, 10. A builder could close alone before 10-23: rows 1, 3, 4, 5 and the refusal arm of row 7; the cheapest cut is row 1 (one phone file and a test, closing a major).
