# Family mode, Phase 1: the plan (branch family-phase-1, cut from main 4f0fc8e)

Written 2026-09-29 from the code, A/1 "The Family Year", B/1 "The Year Map" and the owner's review
(`.contest/staging/dual-mode/OWNER-REVIEW.md`, the owner's words outrank every summary here). No product code was
changed to write it. Paths are under `desk/src/` unless they start with `tools/` or `docs/`. Baseline: `cd desk && npm test`
was green in this worktree before the plan (exit 0, tsc plus 30 suites, about 500 passing test lines). Curriculum
statements (school years, unit content) are from memory and unchecked; a teacher reads them before release.
"1u" = one authored, tested item: a unit generator with its test rows, a scene, a slip with its code detector, or one
tutor-voice paragraph a person reads. Sizes S/M/L are relative to each other, not measured.

## Owner decisions, 2026-09-29 (these outrank the rest of this file)

| # | Decision | Effect on the plan |
|---|---|---|
| D1 | **Skip the parent lock or confirmation in Phase 1.** | W4 loses the parent code, `household.ts`, `api/mode` and the Parent-tab confirm. It keeps `Profile.mode`, `modeOf(p)` and the audience matrix, with the age default (Family under 18, and for "other" until confirmed). Adult mode is not reachable from any screen in Phase 1, so nothing under 18 can enter it. The gate returns with the Adult build. |
| D2 | Keep the SCHOOL tick, hide the gap line until a placement exists. | As recommended. |
| D3 | The step-up is a picture (second ink line), no number. | As recommended. |
| D4 | Typed evidence counts toward "on your own" and certificates, labelled on the plate. | As recommended. |
| D5 | Extend the `school` path in place, rename it "School maths". | As recommended. |
| D6 | **Start with ages 11-13.** Wider ages come once the modules are validated (a hackathon is part of that). | Phase 1 targets 11-13 only. W2 needs one young voice (11-13) instead of two bands. 6-10 and 14-15 are not promised and not tested. The unit list and year bands are still written for the whole span, but only the years a 11-13-year-old meets are validated. |

## a. What Phase 1 is

1. Family mode becomes real for ages about 10 to 15 on the desk that exists: `Profile.mode` with a parent-code gate (Family is the default under 18), tutor voices that fit the age, three school situations in Linga, Essay Master input by text file or phone message (no scans), and Math Buddy's school path growing from 3 linear-equation topics to 15 (12 number-valued units, fractions to mean, all checked by code).
2. Two Math entrances, as doors: home learner works the ruler (today's "Teach me something"); help in school gets a new "Get ready for school" door that lists units by the learner's own school-year label. A difficulty step-up is drawn as a second ink line on the unit, a picture that latches, never a number.
3. Linga certification: a dry plate issued by code from the evidence, its requirement widened by the topics the learner chose. A Sunday page for the parent, in words, no model.
4. NOT in Phase 1: scan-a-failed-test; the handwriting alternative (intermediate-calculation interface, voice reasoning); Stages 1-2 and the keypad; the Math placement staircase; word problems and story wrap; Linga Listen, Read, Write tracks and doors; Essay plan slots, the Piece record, whole-piece reading, sources, reader's echo, a two-paragraph reading; shelf and Term Evening; witnessed ribbons; sibling evenings; the adult mode itself (only its seam); anything that needs a new kind of truth (sets, figures, ordered lists, constructions).
5. The stance holds: code decides, the model comments, a verdict is a picture, no points, no streaks, no percentages, nothing on the TV needs typing. Section d ("Stance check") states how each new reward is drawn; there is no revision of a rule except the one flagged in D4.

## b. B/1 review (before A/1 builds)

B/1 is better than A/1 in six places (marked BETTER). Both were written from a digest, so each idea is also checked against the code where it matters.

| B/1 idea | Verdict | Reason |
|---|---|---|
| SchoolShape list (compute, fraction, percent, system, roots, mean, chance) and "the engine refuses no-x today, so a flag is needed" | adopt, BETTER | True (`lib/rules/calc.ts:173`). A/1 says "specs on the Calculus machinery" and prices fractions as a new kind of truth; a fraction that is one value compares numerically today (probe: `11/12` and `22/24` are both right). Only sets, lists and figures are new truth. |
| Spine membership rule: a topic enters when at least 3 of 4 systems teach it by the end of stage E | adopt | A cheap authoring rule; stops A/1's 49 cells from being 49 promises. |
| Nine topics "walk only, hatched: practised, not proved" | adopt-later | Honest state for constructions. Needs a new ruler state; no Phase 1 unit needs it. |
| Constructions as a branch topic shown only for some systems | adopt-later | Cheaper than A/1's parent-witnessed ribbon (which needs a parent identity that does not exist, section c). |
| Collections that never decay; "a collection can be counted, the desk never prints the count, the parent sees objects not a tally" | adopt, BETTER | A/1's shelf can "become a score by another name" (its own words). Phase 1 adopts the never-print-the-count rule for the step-up mark and certificates. |
| Summits: a term goal the parent sets, a region not a number | adopt-later | Needs the parent role and a map. Phase 2 with the Sunday page's ask. |
| Year Map as the ruler drawn as a map of the whole year | reject | Conflicts with the owner's two entrances (a whole-year wall is the overwhelm the owner removed) and B/1's own top risk: it makes a behind child feel behind. The existing strand strip (`tv/rulerRows.ts:44`, STRIP_AFTER 8) already carries a long path. |
| Decimal separator: reader takes both, TV prints the system's own | adopt | Same as A/1. Neither exists: `compile("0,5")` is null (`lib/rules/calc-expr.ts:16`); only leak scanning reads a decimal comma (`lib/rules/maths.ts:156`). Built in W5. |
| Tutor voices for 9-11, 11-13, 14-16 as three prompt variants with tests | adopt, BETTER | A/1 names one 12-14 voice and Essay only. The code hard-codes "15-year-old" in four places including Math (`lib/desk/hint.ts:33,35`, `lib/desk/essay.ts:34,92`). W2. |
| Band-fit code check (share of words outside the band list) and "key must be a phrase in the text" | adopt-later | A cleaner code rule than A/1's two-call blind solve. Belongs with Listen and Read (Phase 2). |
| Passport: stamps from evidence rules (skill, kind independent or transfer, scene) | adopt, BETTER | Closer to the owner's "dry certifications" than A/1's doors (an illustrated place opens). W10 builds certificates on this shape; doors are not built. |
| Parent walk-on part in a Linga scene | reject for now | Needs a live second phone role and a parent who speaks English; conflicts with A/1's "the parent needs no expertise". Revisit Phase 3. |
| "Say it, then write it": Linga transcript becomes Essay material | adopt-later | Best cross-module idea. Claim "the transcript exists today" is partly true: turns live in the session and are cleared on a learner change (`lib/session/store.ts:373`); the learner record keeps only counts and quotes. |
| Genre order and claim-map checks shown as a comment, never as ink, until tested | adopt-later | Safer than A/1's "pushes the claim asked twice" drawn as an arrow. Phase 2 Essay. |
| Essay stays English-rule for Czech and German learners; localising is an open question | adopt, BETTER | The splitter needs a capital (`lib/rules/essay.ts:25`), the roles are English words. A/1's "local form as a dress" implies writing the code cannot check. Phase 1 assumes English writing only. |
| Handwriting snap or dictation for a 9-year-old's essay | reject | The owner descoped scans. Family hides the essay snap (W3). |
| Mode per module (`moduleMode`) and `modeOf(profile, module)` | adopt the function shape, reject the storage | Profile-level mode now (A/1, simpler, the owner asked for nothing finer); `modeOf(p)` is the one call site, so per-module can follow. |
| `defaultMode`: type "other" defaults to adult | reject | Today "other" is not adult until confirmed (`lib/english/curriculum.ts:44-46`); a default must not widen that. Default is Family unless age >= 18. |
| First test: 20 worksheets photographed in a living room | adopt, BETTER | It is the truer first gate for any photo-marked unit. Owner-run; W6 is the hedge if it fails. |
| Story wrap, at most one wrapped item per set | adopt-later | Phase 2 word problems. |
| Stage A (6-8) voice and handwriting | reject | A/1 Q1: the owner has not asked for it; Phase 1 audience is about 10-15. |

## c. Reconciliation with the code

Probe means a scratch script run against the real modules on 2026-09-29 (not committed).

| # | A/1 dependency | Verdict | Evidence |
|---|---|---|---|
| 1 | Profile.mode plus gates; `audienceAllowed`/`isAdult` exist; Family = all + school | partly true | `Audience` includes `school` (`lib/english/types.ts:18`) and `cleanTopic` accepts it (`lib/english/placement.ts:131`), but `audienceAllowed` has no school branch: it falls to `true`, so a school scene would show to every adult too (`lib/english/curriculum.ts:48-50`); the plan schema enum omits it (`lib/english/check.ts:31`). `isAdult` is age >= 18, or "other" plus a ticked box (`curriculum.ts:44-46`). No mode concept exists. |
| 2 | "the parent role on the phone that already exists" | false as identity | Parent is a React toggle (`app/phone/page.tsx:36,243`). Server roles are tv, phone, guest (`lib/session/pairing.ts:23`); every joined phone is the same role (cookie = HMAC of the pin, `pairing.ts:59-63`). Any joined phone or the TV can post `profile.draft` with any patch (`lib/session/store.ts:374`; `app/api/session/route.ts` limits only guests). Nothing can verify "a parent". |
| 3 | "Under 18: the parent confirms on their own phone" | false without a new mechanism | Follows from 2. Built as a parent code (W4): a household lock, not an identity; a child who knows it passes. |
| 4 | Mode stored on Profile survives | partly true | Profile lives in `session.json` and `reset` returns `fresh()` (`store.ts:322-343,454`), so mode and any confirmation vanish on reset (safe direction: back to the age default). Editing a profile copies a fixed field list (`tv/keys.ts:242`): a new field is dropped on the next edit-save unless added there. |
| 5 | 12 number-valued units "as specs on the Calculus machinery" | false as stated | All nine shapes need an `f` with x: `wellFormed({shape:"evaluate", f:"3/4+1/6"})` is refused "no x" (`calc.ts:173`, probe). A `0*x+` trick passes but prints "Find f(0) for f(x) = 0*x+3/4+1/6." (probe). The store strips any spec key outside a fixed list (`store.ts:99-112`), so new shape parameters would vanish silently and every item would read "unsure". |
| 6 | The Calculus number check carries over | true | The number tail is reusable: exact vs rounded tolerance (`calc.ts:50-58,396-402`); `11/12` and `22/24` right, `0.9167` unsure (probe). No simplest-form check exists (`22/24` passes); the compiled tree is exposed (`calc-expr.ts` `Expr.node`), so a form check is small. Rounding items are the exception: `2.457` against `2.46` is "unsure", not wrong (`ROUNDED_CLOSE`, `calc.ts:65`), so "round to 2 dp" is not a Phase 1 unit. |
| 7 | "0 model calls to write a set: a generator per unit" | thinner than claimed | No generator exists. A Calculus set is one model call proposing specs (7-14 s, `lib/desk/items.ts:202`) then a code filter (`items.ts:264-276`). Generators are new, seeded, deterministic code: cheaper at run time, authored per unit. |
| 8 | School units can enter through `makeItems`/mark/explain | false today | `makeItems` routes by path, not by spec (`items.ts:98`); any other id gets the linear-equation prompt (`items.ts:43-47`). Marking says "Calculus questions ... expression in x" (`lib/desk/mark.ts:84-92`, dispatch `:109`). `explain` sets `calc = !!item.spec` and speaks to "a first-year university student" (`lib/desk/explain.ts:78,134`). Hints speak to "a 15-year-old" (`hint.ts:33`). A new school id has an empty slip list (`lib/rules/maths.ts:48,60-62`, probe). All five are stance/routing changes keyed to the wrong test. |
| 9 | Number reader takes decimal comma and point by system | false | Probe: `0,5`, `25%`, `25 %`, `1 1/2`, `12 cm`, `3:2`, `1 000` all read as null (so "unsure", never wrong); `1.000` reads as 1 (thousands never guessed by system). A `readNumber(answer, system)` is new (W5). |
| 10 | Hints are leak-checked | false for school items | `leaks` needs an equation in x (`maths.ts:168-176,308-312`); `specFromQuestion` knows only Calculus phrasing (`calc.ts:704-807,833`). Probe: `leaks("Work out 3/4 + 1/6", "the answer is 11/12")` is false. "Help in school" on a fractions sheet has no withholding validator today. W5 adds school readers and leak windows. |
| 11 | `expectedIndex` and the SCHOOL tick need no redesign on a longer list | mostly true | Count of topics whose year <= learner's year (`lib/library/syllabus.ts:75-79`): valid when years never decrease along the list in any system, which `tools/maths-rules-test.cjs:187` already asserts. The ruler pans and the strip takes over past 8 topics (`tv/rulerRows.ts:25,44,133`); 22 Calculus topics prove it. Costs A/1 missed: the needle is the first not-secure topic (`maths/MathsTV.tsx:271`), so 12 topics placed before the linear three move every existing learner's needle to the start; and the tick and gap line are drawn on the child's TV today (`MathsTV.tsx:275-277`), which contradicts A/1's "a year tick is shown to the parent only". Pins that change: `tools/maths-paths-test.cjs:37-41` (3 topics, name "Linear equations"), `maths-rules-test.cjs:216`, `maths-course-test.cjs:135`, `maths-tv-test.cjs:302`. |
| 12 | Sunday page from the recap the phone already shows, no model | partly true | Words exist (`tv/recapRows.ts:101`), but the recap is tonight only (`recapRows.ts:41,44`); history is capped at 20 lines (`lib/session/learners.ts:48`, pinned by `tools/desk-jobs-rules-test.cjs:328`); Linga writes no history line, only `sessions` (30, `lib/english/rules.ts:25`). A week needs a source (W9). |
| 13 | Linga: term check re-runs the ladder | true, thinner | "Find my level again" re-runs `check-start` (`english/LingaPhone.tsx:155,175`), but the result overwrites `placement` (`check.ts:118-123`): growth over terms is unrecorded. Certificates need a history. |
| 14 | Linga: 3-4 school situations with pictures | true | A scene without its own picture borrows the skill's (`lib/english/view.ts:20-24`), so 3 scenes need no art. Own pictures are one SVG each: `teacher` (classroom) and `lost` (school corridor) now have theirs, because the rover and the hotel desk did not fit; `project` still borrows the planning room. |
| 15 | Linga: "text is an equal route" | partly true | Progress counts spoken evidence only (`lib/english/rules.ts:29`); a child who types can never reach "on your own". Decision D4. |
| 16 | Essay: a 12-14 voice, and a two-paragraph piece with no plan | voice true and wider; piece false | "15-year-old" is in four places (section b). `splitSentences` collapses whitespace (`lib/rules/essay.ts:25`), `Sentence` has no paragraph field (`:10`) and `revise` rebuilds with `join(" ")` (`:117`): paragraph breaks are destroyed. A multi-paragraph reading changes the reading core and the forensic screen; it moves to Phase 2. |
| 17 | Essay input by phone; snap exists | true | Paste or dictate textarea (`app/phone/page.tsx:399-403`); the essay snap is the capture subject select (`page.tsx:285`, `lib/desk/read.ts:19`). |
| 18 | Reward states build on "secure and its latch" | true, with a trap | Latch: `lib/session/learners.ts:203-214`. `cleanSkills` whitelists fields (`learners.ts:108-124`): a new field (the step-up) is dropped on read unless added. |
| 19 | Reward can rest on difficulty | false as it stands | `difficulty` on a Calculus item is the model's own 1-5 (`items.ts:171,234-235`), used only to sort (`items.ts:278`). A reward on it would let the model set the reward. Tiers must be computed by code from the spec (generators). |
| 20 | Parent's page in words; age gates in code; ruler groove states | true | `phone/page.tsx:413-425`; `curriculum.ts:48`; `tv/mathsRows.ts:51` ("a description of fact, never of permission"). |

## d. The work, in waves

Every wave lands on the branch with `cd desk && npm test` green; a new suite is appended at the END of the `test:rules` chain
in `desk/package.json`. Sets cost 0 model calls from W5 (today 1). No wave adds a new kind of model call. No live model call
in a gate: stub at the engine `provider` seam. Never touch `desk/data/`; a builder uses `DESK_DATA_DIR` in a temp dir and a
scratch learner id.

### W1. Three school situations in Linga (S)
- Goal: a child meets three family-safe scenes (ask the teacher to repeat; a group project; a lost item at school) among the eight.
- Files: `lib/english/curriculum.ts` (3 `ENGLISH_SCENES` with audience `school`; `audienceAllowed` gains `school` = profile is elementary or high-school and under 18, replaced by `modeOf` in W4; `recommendScene` prefers them for elementary/high-school), `check.ts` `allowedAudiences` and schema enum only if plan topics may be school (not in Phase 1).
- Tests: rows in `tools/linga-rules-test.cjs`: ids unique; quiz shape valid; each scene resolves an art key; elementary and high-school profiles get them, "other" and 18+ do not; conversation route refuses a school scene for "other" (`conversation.ts:141`).
- Acceptance: gate; TV capture of `linga-scenes` for a 12-year-old profile shows the new cards inside the 96/54 safe zone, body type >= 28 px, and none for an "other" profile.
- Calls: none new (about 1 per turn as today). Authoring: 3u plus a teacher's read (premise, cue, quiz each).

### W2. Tutor voice fits the age (S)
- Goal: a 11-year-old is not spoken to as a 15-year-old, in Math hints, Math explanations and Essay readings.
- Files: new `lib/rules/voice.ts` (pure: `voiceOf(subject, age)`, bands <= 11, 12-14, 15+ where 15+ is today's text unchanged); `lib/desk/hint.ts:33-35`, `lib/desk/explain.ts` (school stance), `lib/desk/essay.ts:34,92`; routes `api/hint`, `api/explain`, `api/analyse` pass the seated profile's age (the learner record has no age, so it comes from `s.profiles`).
- Tests: new `tools/voice-rules-test.cjs`: every band keeps the withholding clauses ("never state the final answer", "never rewrite their sentences"), age 12 never yields the string "15-year-old", 15+ equals today's text byte for byte; `calc-hint-test.cjs` stays green (opts.age optional).
- Acceptance: gate; a scratch-engine transcript for ages 10 and 13 read by a person. Tone quality is not test-decidable.
- Calls: 0 extra. Authoring: 4u (two young bands for maths and essay), a teacher reads each.

### W3. Essay input by text file or phone message; no scans (S)
- Goal: a learner sends a `.txt`/`.md` file or a typed/dictated message from the phone; a file with several paragraphs is read one paragraph at a time; Family hides the essay snap.
- Files: `lib/rules/essay.ts` (new pure `paragraphsOf(text)` on blank lines, before `splitSentences`), `app/phone/page.tsx` (file picker filling the textarea, "paragraph 2 of 3, Next"; the capture select `:285` and Tonight's `AddTask` select drop "Essay Master" for capture), `app/api/analyse/route.ts` (length cap).
- Tests: rows in `tools/essay-rules-test.cjs` (paragraph split, one paragraph in gives the same reading as today); `tools/phone-panel-test.cjs` (panel routes).
- Acceptance: gate; phone capture at 390 px: pick a 3-paragraph file, read paragraph 1, step to 2. The TV forensic screen is unchanged, so no TV capture.
- Calls: same as today (1 per reading). Authoring: 0u. Cap value is not measured: set conservatively, revisit after live use.

### W4. The seam: Profile.mode and the parent code (M)
- **Status: BUILT as the seam only, 2026-09-30 (owner decision D1).** Phase 1 has no Adult screen and no way to reach Adult, so a parent lock would guard nothing. Built: `lib/rules/mode.ts` (`Mode`, `modeOf(p, prefs?)`, and `isAdult`, moved there and re-exported from `curriculum.ts`), optional `Profile.mode`, `modeChecked` in `store.ts` (junk dropped on session.json load and from a `profile.draft` patch; a patch may set only "family", never "adult"; `reset` leaves it unset), `mode` in the `tv/keys.ts` edit copy list, and `tools/mode-rules-test.cjs` (240-combination parity of `audienceAllowed` against a frozen copy, the `modeOf` table, the sanitising, edit-save, reset, old session.json). No behaviour changes for any learner: `audienceAllowed` keeps its signature and truth table and is not re-expressed through `modeOf`; an explicit stored "adult" is not honoured (`modeOf` falls back to the derived value). NOT built and moved to the Adult build (slice A5 of `docs/concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md`): the parent code and `household.ts`, `api/mode`, the Mode row on the profile screen, the phone Parent tab confirm, honouring a stored "adult", and the audience matrix by mode. The plan text below is the original W4 and is kept for A5; no TV capture is owed because no screen changed.
- Goal: `mode` exists, defaults from age and type, and the two gates work. Family always allowed. Adult reachable at age >= 15 or type "other"; under 18 it needs the parent code; 18+ (or "other") the learner alone.
- Files: `lib/session/store.ts` (`Profile.mode?: "family"|"adult"` and `modeOf(p)` in a new `lib/rules/mode.ts`; `profile.draft` drops any `mode` in a patch the way `pathChecked` drops a bad `mathPath`, `:34-37,374`); `tv/keys.ts:242` copy list; new server-only `lib/session/household.ts` (parent code as a salted HMAC in `DESK_DATA_DIR/household.json`, pattern of `pairing.ts`); new route `api/mode` (mode change is SERVER_ONLY, like `route.ts`'s list); `tv/profileRows.ts` gets a "Mode" row (Family, Adult; Adult under 18 reads "ask a parent on the phone"); phone Parent tab: set code, confirm; `curriculum.ts` `audienceAllowed(p, prefs, audience, mode)`: Family serves all and school, never adult content, even at 18+; Adult serves all, older, adult (as today) and never school.
- Tests: new `tools/family-mode-test.cjs`: `modeOf` table over (age, type, confirmed); a patch cannot set mode; an edit-save keeps mode; the audience matrix; wrong code refused, timing-safe compare; no code set means Adult is locked under 18; reset returns the age default.
- Acceptance: gate; TV capture of the profile screen with the new row (both states) and a phone capture of the Parent tab. Live check via a second `next dev --webpack` server, pattern of `tools/tv-landing-live.cjs`.
- Calls: 0. Authoring: 0u. Limit stated on the screen text: the code is a household lock, not an identity.

### W5. School number engine, first unit end to end (L)
- Goal: one unit (add and subtract fractions) is written by code, printed, marked from a photo by code, hinted and explained with a leak check, and shown on the ruler. This wave is the risk wave.
- Files: new pure `lib/rules/school.ts`: shapes `compute` (expr, optional `form: "simplest"`), `percent`, `pct-change`, `ratio-share`, `area`, `mean` (covers all 12 units), with `wellFormed`, `question`, leak windows, `specFromQuestion` school readers, a seeded generator interface `gen(seed, tier)`; `readNumber(answer, system)` (decimal comma and point by system, `%`, mixed number, ratio `a:b`, a unit token per unit spec, thousands never guessed); reuse `judgeNumber`'s tolerances by exporting it. Wire: `store.ts:99` SPEC_KEYS gains the new keys (or the store keeps the spec whole for school shapes); `lib/library/syllabus.ts` (new units, bands and years per system, prereqs), `paths.ts` (school path renamed "School maths", blurb); `lib/desk/items.ts` (dispatch on a generator, provider "code", 0 calls); `mark.ts` (prompt by shape family, `readNumber` before `checkAnswer`); `explain.ts`/`hint.ts` (voice from W2, leak check with school specs); `lib/rules/maths.ts` `slipsFor` (a school family list, closed; code-detected slips where a classic wrong method has a closed form, e.g. "added the denominators"); needle rule `MathsTV.tsx:271` becomes "first not-secure after the last secure, else the first"; gap line hidden while no placement exists (D2).
- Tests: new `tools/school-rules-test.cjs` (well-formedness, printing, a spellings table of at least 60 written answers per family with expected right/wrong/unsure, leak windows on hints, `0,5` by system, seeds 1..N produce distinct valid items); new `tools/school-practice-test.cjs` (`makeItems` with the engine stubbed: zero calls, six distinct items, spec survives the store); updates to the pinned files in row 11; a school corpus in the `tools/maths-calculus-test.cjs` typeset ratchet (fractions stack via `typeset.ts:416`).
- Acceptance: gate; the spellings table asserts zero false-right and zero false-wrong (unsure rate is reported, not targeted); TV capture of Topics (panned ruler with 15 topics, focused name whole) and of a fractions practice sheet.
- Calls: set 0 (was 1); mark 1 vision, hint 1-2, explain 1, as today. Authoring: engine (engineering), 1u unit, 2u slips.
- **W5a built, 2026-09-30 (commit `feat(desk): school number core ... (W5a)`), offline only.** New pure `lib/rules/school.ts`: `readNumber(answer, system)` (ambiguity is null), the `compute` shape (`wellFormed`, `question`, `check` on exact bigint rationals, not calc-expr's floats), four code-detected slips (tops-and-bottoms, top-not-scaled, tops-one-bottom, wrong-direction), `leaksSchool` (six rules in the file header), and `gen(seed, tier)` for add and subtract fractions. `calc.ts` is untouched. `tools/school-rules-test.cjs` sits at the end of `test:rules`.
- Tables: 137 spellings (119 on fractions), 0 false-right, 0 false-wrong, 38 unsure (27.7%, a figure of the table's own mix, which loads unsure cases on purpose; nothing measured in the field). 121 reader rows across the four systems. 59 leaking hints all refused and 47 legit hints passed, over 7 specs. Generator seeds 1..200: 143 distinct at tier 1, 180 at tier 2. `npm test` 540 -> 551 passing.
- Conflicts (the strict rule kept, the cost accepted): rule 4 refuses a bare number equal to the summed top even when it is an operand's number ("6 is a multiple of 3" for 1/3 + 1/6; "Step 1" when the answer's top is 1; "Add the tops: 3 and 3" for 3/4 + 3/4). The generator was also found printing its own answer (5/6 - 5/12 = 5/12); such items are now drawn again.
- Fixed after review (`fix(desk): a lone point in cz/de is ambiguous ...`): a lone point before three digits in cz/de (`1.000`, `1.500`, `2.750`) is 1500 by the norm and 1.5 on a calculator, so it now reads null (unsure, never wrong); a point groups thousands only as `1.000.000` or with a decimal comma (`1.000,5`). Found the same way: `1 250/500` is null in every system (a space may group thousands), and the word "pounds" (money or weight) no longer reads as `£`. Tables now 158 spellings (0 false-right, 0 false-wrong, 47 unsure, 29.7%) and 142 reader rows.
- For a person to decide: `1,234` is 1234 in us/uk and 1.234 in cz/de (each system's norm, kept); under `form: "simplest"` an improper fraction in lowest terms is right; a missing unit is not held against the value; `gen` asks for no simplest form; `0.7` for 3/4 is unsure (within one unit of the last place).
- W5b still wires: `store.ts:115` SPEC_KEYS and `PracticeItem.spec` (typed `CalcSpec`, `:96`) so a school spec survives `dispatch`; `items.ts` `makeItems` (`:93`) dispatching the school path to `gen`, provider "code", 0 calls; `mark.ts` (prompt `:84` by shape family, `readNumber` then `check` before any `checkAnswer`); `hint.ts:50` and `explain.ts:154` (school voice, `leaksSchool` beside `leaks`/`leaksCalc`); `rules/maths.ts` slip lookup (`:14,55`) gaining `SCHOOL_SLIPS` as the family list; `syllabus.ts`/`paths.ts` (the unit, the rename deferred per D5); the needle rule at `MathsTV.tsx:271`.

- **W5b built, 2026-09-30, on main in three commits** (`bff8898` path, store and set; `3a3d202` marking, hints, explain; then the ruler commit). `npm test` 551 -> 559 -> 570 -> 576 passing, 33 -> 36 suites (`school-practice`, `school-marking`, `school-ruler`); no live model call in any gate.
- Wired: `frac-add-sub` first on the school path, renamed "School maths" (D5); `store.ts` `specShown` dispatches on `shape` and re-validates a school spec; `makeItems` -> `makeSchoolItems` (3 tier-1 + 3 tier-2 from a fresh seed, provider `code`, 0 tries); `mark.ts` `markSchool` (one vision call, school reading prompt, `check` under the seated learner's system via `learnerSystem`, UK default); `settleSpec` by shape; `SCHOOL_UNIT_SLIPS` in `slipsFor`; school `specFromQuestion`, `leaksSchool` two-strike and `withheldSchool` in `hint.ts`, unit-named stance, no lesson pick; `explainSchool`; needle = first not secure after the last secure (school path only); SCHOOL tick kept, gap line hidden (`schoolMarks`, `mathPlaced` false, D2).
- Captures (`tools/school-fractions-live.cjs`, artifacts/school-fractions/): route code/0; four-topic ruler, tick drawn, no gap line; six stacked-fraction questions, numerals 40.6 px, inside the paper; "School maths, from the first step" and "One of 4 topics secure" with the needle on two-step equations.
- Deviations: the item stores the plain question only (it typesets as stacked fractions; no TeX field); `PracticeItem.tier` (1 or 2) added; a school slip is code's alone (a model pick is ignored, no rename from explain, explain asks no slip); `nextTopic` keeps its prerequisite walk (unused by screens); Calculus needles keep their old rules; the focused name is now fitted on the non-panning big ruler too (419 px slots clipped "Equations with brackets and x on both sides"); `gen`'s `pick` became a function (a JSX-mode suite read `<T>(` as a tag).
- Row 11 assumption: a UK 12-year-old's tick stands after 3 topics (Year 8 by `SYSTEM_START` uk 5), not Year 7.
- W6 needs: `answers[]` on `api/mark` -> `settleSpec(n, spec, answer, undefined, topic, learnerSystem(s))` per item (ready), the phone panel. W7: a generator, `SCHOOL_UNIT_SLIPS`, `specFromQuestion`/`unitOf`/withheld line and years per unit (`stripModel`'s school rule is ready for >8 topics). W8: `recordAttempt` ignores `tier` today; second ink, doors.
- A maths teacher reads: the fractions years (US 5, UK 6, CZ 5, DE 5); tier split; "Work out a/b ± c/d." wording; the four slip lines; the withheld sentence; the 53 task phrasings in `tools/school-marking-test.cjs` test 4 (which are read, which refused).
### W6. Typed answers, no camera (S-M, the hedge)
- Goal: the same set can be answered on the phone in six boxes and marked at once by code, no photo, no vision call. It protects the plan if the living-room photo test fails, and it is the seed the owner's later "intermediate calculations" experiment grows from.
- Files: `app/api/mark/route.ts` (body `answers[]` beside `image`), `lib/desk/mark.ts` (`markTyped`, `settleSpec` per item, same `land`), `app/phone/page.tsx` practice panel.
- Tests: new rows in `tools/calc-marking-test.cjs` style file `tools/school-marking-test.cjs`: typed set marks identically to a read page; an unreadable typed answer is "unsure".
- Acceptance: gate; phone capture of the typed panel; the TV shows the same sheet as after a photo.
- Calls: 0 (saves the vision call). Authoring: 0u. Cut this wave only if the owner's photo test passes and the owner prefers to cut.
- **W6 built, 2026-09-30, on main (`feat(desk): type the answers on the phone ... (W6)`; the task-id flake fix `5c75651` came first).** `npm test` 576 -> 577 (the flake fix) -> 586 passing, 36 suites, no new suite (rows in `school-marking` 10-15 and `phone-panel` 12-14); no live model call in any gate.
- Wired: `POST /api/mark` takes `image` XOR `answers` (12 at most, one per question, 40 characters each, refused in a plain sentence, never cut; `typedAnswersProblem` in rules/maths); `markTyped` (mark.ts) settles each item by `settleSpec` under `learnerSystem`, a spec-less linear item by `settle` only when `rootOf` finds a single root and it is no identity, then the same `land`: same `practice.marked`, history line and record. Provider `code`, 0 ms, the vision and text engines are made to throw in the tests. The phone Practice panel has "Snap the sheet" and "Type my answers" side by side (camera off on the typed route); the phone follows the TV to the sheet as after a photo (same panel, same hand-off key). The TV card reads "The phone is waiting for the sheet or your answers."
- Blank and unreadable: "not sure", no verdict, no attempt, exactly as an empty photographed answer. A typed item has no working and no pen position (wavy underline on the answer line for a wrong one).
- Capture (`tools/school-typed-live.cjs`, artifacts/school-typed/, own server on 3463): phone 390 px, both routes, six boxes, no overflow, boxes 48 px; the sheet and a walk on the TV inside 96/54 with no text under 28 px; right, wrong with its slip, dashed "not sure" for `0,5` (uk), a blank and words. The photo test still decides whether typed is the primary route; nothing here changes that.
- Still needed: W7 (the other units: typed answers already work for any spec shape that `settleSpec` knows), W8 (`tier`), a mixed-number or unit hint on the box (a child may type `1 1/2` or `12 cm`; the reader takes them, the box says nothing), and a touch keyboard with a fraction key if the owner wants one.

### W7. The other eleven units (M, authoring-heavy, three batches, each green)
- Goal: fill the path: equivalent fractions; multiply and divide fractions; fraction of an amount; decimals; decimal-fraction conversion (terminating only); percent of an amount; percentage change; ratio sharing; unit rate and direct proportion; area (rectangle, triangle, composite); mean and range. Batches: fractions (4), decimals and percent (4), ratio, area, mean (3).
- Files: `syllabus.ts`, one generator each in `lib/rules/school.ts` (or `lib/rules/school/*.ts`), slips, a `doIt` line per unit for W9, the unit's year per system (from memory, teacher checks).
- Tests: per unit: generator seeds, tier 1 and 2 produce distinct valid items, spellings rows; the year monotone test (`maths-rules-test.cjs:187`) stays green for all four systems; typeset ratchet rows.
- Acceptance: gate per batch; TV capture of Topics with real progress states after each batch.
- Calls: 0. Authoring: 11u generators, about 6u code-detected slips, 12 year-band lines.

### W8. Two entrances and the step-up (M)
- Goal: Tonight offers three doors: "I have homework" (help in school, during; exists), "Teach me something" (home, the ruler; exists), and "Get ready for school" (help in school, before). The new door lists units by strand with the learner's own year label (`SYS_WORD`, `MathsTV.tsx:245`), nothing else of the path; choosing one asks "The usual" or "A step up" (two cells) and writes a set. Doors, not a profile flag: the same child is both.
- Files: `store.ts` Screen union (`prepare`), `tv/keys.ts` (`tonightStops` `:76`, handler), `maths/MathsTV.tsx` (screen, ruler second-ink), `design/maths-lamplight.css`, `app/phone/page.tsx` TV_WORDS (`:25`); `lib/session/learners.ts` (`SkillRecord.stretch`, `cleanSkills` whitelist `:108-124`, `recordAttempt(..., tier)`); generators take `tier`; baseline tier from age and the unit's year (code), step-up = baseline + 1.
- Tests: `tools/tv-keys-test.cjs` rows (new stops, no typing); new rows for the tier latch (a step-up right answer cannot unset the usual record; a slip at step-up moves only the step-up estimate); tier is computed by code (test forbids reading a model `difficulty`); ruler states.
- Acceptance: gate; TV captures: Tonight with three doors, the Prepare screen, Topics with one unit inked twice; safe zone 96/54, type floor 28 px (20-22 px uppercase labels only), no number anywhere.
- Calls: 0 new. Authoring: 0u (tier rules live in the generators of W7). Doc: `docs/DESIGN-MATH-BUDDY.md` and `docs/STUDY-DESK-SCREENS.md` in the same commit (repo law).

### W9. Sunday page (M)
- Goal: the parent's phone shows the week in words: units finished, one slip by kind, one step-up taken, situations done, one real-world act to try. No model, no number beyond counts of things (as today's recap), never a percent, a sibling, or a transcript.
- Files: new pure `lib/rules/week.ts` (`sundayPage(learner, now)`), `learners.ts` (history cap raised, or a weekly digest line written at `session.end`, chosen after checking the pin at `desk-jobs-rules-test.cjs:328`), a Linga history line at session end (`lib/english/conversation.ts:172`), phone Parent tab section "This week" (`page.tsx:413`).
- Tests: new `tools/week-rules-test.cjs` (a fixed history fixture gives fixed words; privacy invariants copied from B/1: never a transcript, a percentage, a sibling's record); `tv-recap-test.cjs` unchanged.
- Acceptance: gate; phone capture of the Parent tab with a fixture week (no TV change).
- Calls: 0. Authoring: 12u `doIt` lines (one per unit, a person writes them) and 1u template.

### W10. Linga certification and the term check record (M)
- Goal: a dry plate issued by code. Requirement = the band's base skills (an authored table) plus the skills of the topics the learner chose in their plan (`PlanTopic.skill`); issued when every required skill is at least "on your own" and the latest level check is `source: "check"` with medium or high confidence. The plate lists band, the learner's own topic titles, the skills inked, one of their own quoted words per skill (already validated as a substring, `lib/english/rules.ts` `validateObservations`); never a count, score or percent. Latched, append-only.
- Files: `lib/english/types.ts` (`certificates`, `placements` history), `lib/english/rules.ts` (`cleanEnglish` persists both, `:17-26`), new `lib/english/cert.ts` (pure), `check.ts:118-123` (append a placement, do not only overwrite), `lib/english/view.ts` and `LingaTV.tsx` (plate on the recap or map screen), `rules.ts:29` per D4.
- Tests: rows in `tools/linga-rules-test.cjs`: requirement grows with chosen topics; a "self" placement never certifies; a certificate survives the 400-evidence cap because it snapshots; corrupt entries dropped.
- Acceptance: gate; TV capture of the plate (safe zone, >= 28 px body, one caption slot for any sentence). Docs updated in the same commit.
- Calls: 0. Authoring: 4u (base-skill table by band, from CEFR can-do lines already in `placement.ts:22-29`, a teacher reads it) and 1u plate copy.

### Stance check (how each new reward is drawn)
| Thing | Drawn as | Why it holds the stance | Where it bends |
|---|---|---|---|
| Step-up | A second ink line on the unit's groove; the parent page says it in words | A picture, latched, never printed as a count, earned only from code-decided right answers on items whose tier code computed | The owner said "reward points boost". Points would revise rule 3; D3 recommends the picture. |
| Certificate | A dry plate: band, topics, skills, own quoted words | Issued by rules from evidence; never a score; never decays | "Dry" is the owner's word; no game vocabulary. It is the one Linga surface that names a band. |
| Sunday page | Words from records, counts of things done | Same as today's phone recap | Counts appear, as they already do. |
| Parent code | A lock, not a role | Decides nothing about learning | It cannot prove who holds the phone; the screen says so. |
| Baseline | A code rule from age, system and the unit's year | No model sets a reward lever | Unmeasured: set by rule, tuned after live evenings. |

## e. The owner's changes, placed

| Owner change | Placement | Reason |
|---|---|---|
| Math: home learner vs help in school | Phase 1, W8 | Doors on top of W5-W7; nothing new in truth. |
| Math: reward with a difficulty component, code-set baseline, optional step-up | Phase 1, W8 (picture, D3) | Needs code-computed tiers, which generators give and the current model `difficulty` does not (row 19). |
| Math: scan a failed test, explain, prepare a practice set | Phase 2 | Three dependencies: reading a teacher-marked page (vision on marks is untried), mapping an item to a unit (W5's school readers give this), and practice items that code can check (only shapes the engine knows). Phase 1 builds the second and third. |
| Math: intermediate-calculation interface and voice reasoning (experimental) | Phase 2, behind a flag | W6's typed panel is the seed. Spoken reasoning exists only after a photo, in the Walk (`explain.ts`); a photo-free spoken route is new. |
| Math: spine is fine | Kept | The unit list in W7 is the Stage 3-4 cut only. |
| Linga: descope physical writing | Nothing to remove | No Write track was in the first rung, and Linga uses no camera today. Phase 1 has none. |
| Linga: dry certifications; topic choice adjusts requirements | Phase 1, W10 | Built on the evidence rules and `PlanTopic.skill`. |
| Essay: text files or phone messages, no handwriting scans | Phase 1, W3 | Snap hidden in Family; a multi-paragraph file is read paragraph by paragraph. |
| Essay: a two-paragraph reading (A/1 rung 1) | Phase 2 | Row 16: the reading core drops paragraph breaks; needs a `Sentence.para`, a `revise` rebuild and a forensic-screen change. |
| Before shipping, review against B/1 | Done in section b, and re-run at definition of done | |

## f. Risks, the first test, and owner decisions

| Risk | Answer |
|---|---|
| Real-photo marking of a 10-13 year old's answers is untried (both reports' top risk) | W6 typed route; the owner's 20-worksheet photo test (B/1) gates any promise that photo marking works for these units |
| The unit list moves every existing learner's needle to the start (row 11) | Needle rule in W5; D5 |
| A 15-box ruler with a SCHOOL tick and a gap line makes a new learner look far behind | Gap line hidden until a placement exists (D2); the entrance-2 door shows only year labels |
| The store strips unknown spec keys, so a new shape marks every item "unsure" | A test in W5 that a school spec survives `dispatch` |
| Answer spellings the reader cannot read (`0,5`, `25%`, `1 1/2`, units) inflate "unsure" | W5 reader and its table; "unsure" asks, it never marks wrong |
| Year bands and unit order are from memory | A teacher reads the 15 rows; the monotone test is a floor, not a proof |
| The parent code is not an identity | Stated on the screen; D1 |
| Certificates or the step-up read as scores | Never print a count; test forbids digits on the plate and the mark |
| A comma-decimal question breaks the typesetter | Corpus ratchet rows; print by profile system only after the row is green |
| History cap of 20 loses a week (row 12) | W9 decides the digest before writing the page |

The one thing to test first: the answer reader plus the school leak check, offline, in W5 before any screen (about 60 written spellings per unit family and 20 hint lines that leak, run through `checkAnswer` and `leaksSchool`). Pass means zero false-right, zero false-wrong, and every hint that states the answer refused; the unsure count is reported, not targeted. Everything in Math (photo or typed) hangs on this one function. The owner-run photo test comes second and decides whether W6 is the primary route.

Owner decisions still open (max 6):
| # | Question | Recommendation | Built for if unanswered |
|---|---|---|---|
| D1 | How does a parent confirm a switch to Adult under 18? | A parent code set on the phone (a lock, not an identity) | The code; with none set, Adult stays locked under 18 |
| D2 | On the child's TV, keep the SCHOOL tick? | Keep the tick, hide the gap line until a placement exists (Phase 2) | Tick kept, gap line hidden for the 15-unit path |
| D3 | The step-up reward: picture only or a number of points? | Picture only (second ink); a number revises rule 3 and turns a shelf into a score | Picture |
| D4 | Does typed evidence count toward "on your own" and certificates? | Yes; the plate says spoken or written (revises `rules.ts:29`, one test row) | Yes, labelled |
| D5 | Extend the `school` path in place, or add a new path? | Extend in place (ids must stay unique across paths, `maths-paths-test.cjs:38-41`), rename it "School maths", new needle rule | Extend |
| D6 | Is Phase 1 for ages about 10-15, with 6-9 not promised? | Yes (A/1's own "narrower would be cheaper and safer"); Essay writes English only | 10-15 |

## g. Definition of done for Phase 1

- `cd desk && npm test` exits 0 (tsc --noEmit, then every suite in `test:rules`, with the new suites `voice-rules`, `family-mode`, `school-rules`, `school-practice`, `school-marking`, `week-rules` appended at the end) at the tip of the branch and after each wave.
- No live model call in any gate; no file under `desk/data/` touched; the pinned tests of row 11 updated with their reason in the commit.
- For every wave that changes a TV screen (W1, W4, W5, W8, W10): a Playwright capture from `tools/` against a second dev server (`next dev --webpack -p <port>`, own seeded `DESK_DATA_DIR`, `/tv?key=` from `pairing.json`, the pattern of `tools/tv-landing-live.cjs`), at 1920x1080 and 1280x720, asserting the 96/54 px safe zone, no body text under 28 px (20-22 px uppercase labels excepted), one sentence per caption slot, no typing asked of the TV. Screenshots go to `artifacts/` (git-ignored) and are looked at, not only asserted. Phone changes (W3, W6, W9) get a 390 px capture.
- `docs/STUDY-DESK-SCREENS.md` and `docs/DESIGN-MATH-BUDDY.md` updated in the same commit as each screen change.
- The B/1 review (section b) re-read against what was built; anything adopted-later is on the Phase 2 backlog, not dropped.
- Not done until a person has: read the 15 unit rows and three school scenes and the young voices; run the photo test or accepted W6 as the primary route; confirmed D1-D6.
- The branch is merged only by the owner. Nothing in this plan is committed, pushed or merged by the agent that wrote it.
