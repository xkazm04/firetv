# Adult mode: "Take Two" (the concept)

Written 2026-09-30 on branch `adult-mode-plan` (cut from main 4f0fc8e) as the condensed record of the design the owner
chose. It stands alone: the contest report it condenses ("Take Two", seat B, variant 2 of the reveal round, at
`.contest/arena/dual-mode-reveal/entries/claude-claude-opus-5-5_high-reveal/variant-2/`) lives in a git-ignored folder
and may not survive. The build is planned in [ADULT-MODE-IMPLEMENTATION-PLAN.md](ADULT-MODE-IMPLEMENTATION-PLAN.md),
which also holds the code check (its section c) that corrects several of the report's assumptions.

**Markers.** Every statement carries one: **[today]** is read from the code on main 4f0fc8e (paths under `desk/src/`,
with file:line where it matters); **[proposal]** is the design, not built, not measured; **[framework]** is an outside
idea recalled from memory and unchecked. A figure without [today] is a design count or a hypothesis, never a measurement.
Where the report and the owner's notes disagree, **the owner wins**, and section 8 says where.

## 1. The owner's decision

Verbatim, 2026-09-30 (`.contest/staging/dual-mode/OWNER-REVIEW.md`, "Adult round decision"):

> "Adult theme - winner" B/2 "Take Two" (the report at dual-mode-reveal, opened at #e-journey). "Prepare implementation
> plan in docs/concepts as the execution will take multiple sessions."

The owner gave no reason beyond the pick. The report was open at `#e-journey`, the Twin's journey. The owner's notes
of 2026-09-29 that Take Two answers are these (verbatim, same file; "A/2" and "B/2" there are the round-one Adult
reports, not this one):

- Math: "We should still stick to Calculus topics but rather changing approach of the learning and interface. Combining
  these topics with practical applications can be benefitial, auditing or other use cases one of ways to express. The
  goal is still there to understand topic to pass exam even for adults." and "Disagreed with the proposed interface. A/2
  has better idea to combine practical real tasks which would be better to explain, yet it executed not ideally".
- Math (the Family note, which the Adult design reuses): "Handwriting exchange can be real struggle, having interface to
  do inter calculations and using voice/thoughts to progress can be in some cases suprerior to written exchange, as
  experimental variant".
- Linga: "the hardcoded topics are not what I wished for, and the variant does not unlock the potential of advanced
  roleplaying features we can be creative in. Goal here is not achieving certifications, but creating enjoyable and fun
  experience to motivate into practice with reflecting of mistakes." and "We can use roleplaying mechanisms to create
  very fun situations almost on acting level used in dating, work situations, game/RP situations. This is field we
  should risk more."
- Essay: "we will need file exchange for larger text analysis. Primary mode to analyze user's topic. Secondary out of
  first phase to come up with topics user is interested and then again review after written on PC and downloaded to
  phone for example. Not still sure about concept of four readers. The goal in here is not to pass exam anymore, it
  will be to create engaging writing outputs." and "We can create concept like building digital writing twin - mode
  focused to finetune writing skill first in specific format, and then fix together the twin's creation after specific
  milestones, as a reward system on its own. Twin can be then in later phases ported 'somewhere' to write its own
  content. There may be full package of feature around this one".
- Essay (Family note): "I would limit the scope to exchange text files or messages from phone, rather than scanning
  handwritting."
- From the brief for this plan (the owner's words, condensed by the host): dating scenes are 18+ confirmed and
  non-explicit; no handwriting scans in Essay Master.

Family decisions that constrain Adult (from `firetv-family-p1/docs/FAMILY-PHASE-1-PLAN.md`, owner decisions D1 and D6):
the parent lock is skipped in Family Phase 1, so Adult is reachable from no screen until the Adult build brings the gate
back; Family starts with ages 11-13; the modules are validated at a hackathon before they widen.

## 2. The bet

- [proposal] An adult comes back for evenings that make something and give a second go at the part they fumbled. Every
  module runs one loop: a first take, material that reacts, one place to look again (chosen by code), a second take that
  code can check.
- [proposal] The model supplies what reacts: a job from the world (Math), a company of actors (Linga), a twin that
  writes like the learner (Essay). Code decides where to look and whether the second take held.
- [today] Two second takes already exist: Essay's rewrite of one sentence, re-judged in its paragraph
  (`lib/desk/essay.ts:82-112`), and Linga's coach and replay (`lib/english/conversation.ts:185,208-214`). Math's two-stage
  hint leads to a second attempt (`lib/desk/hint.ts:68-70`). Take Two makes the second take the spine of the evening.

## 3. The stance: what the model is, what code decides, what a validator refuses

| Rule (all [today], `CURRENT-STATE.md` "Rules that hold") | In Take Two | Where it bends |
|---|---|---|
| Code decides, the model comments | [proposal] kept for every verdict about the learner | Linga: the model decides plot (the date says yes, the guard lets you by). A plot event is never evidence and never a mark. |
| The desk never writes the learner's sentence | [proposal] kept for the learner's own piece, line and turn | Essay: the twin writes prose. It is the twin's, in its own colour, never enters the learner's piece, and is refused if it copies a run of the learner's words. |
| A verdict is a picture | [proposal] kept: the step line's ring, the struck note, the twin's rulebook | No rate, nothing out of ten. The code check (plan section i) removes the counts the report still drew ("2 of 3 notes held"). |
| No points, streaks, scoring of speech | [proposal] kept | No pronunciation judgement (declined on purpose today). A missed week is "the desk waited". |
| Socratic, not the answer | [proposal] kept | A stuck learner gets a sister problem: a different job, worked, every line checked by code, never their own answer. |
| TV for looking, phone for doing | [proposal] kept; a PC joins, only to send and receive files | The TV never asks for typing. |
| Age gates content, level never does | [proposal] kept | Adult floor, and 18+ confirmed for romance, nightlife and exporting the twin (section 6). |

The three roles, per module ([proposal] unless marked):

| Module | The model writes | Code decides | A validator refuses |
|---|---|---|---|
| Math | a job's three-line story around code's numbers; the two-stage hint [today]; a sister problem's chain | every number, function and truth of a job; whether the set-up is the job's function; each exam card by `checkAnswer` [today]; the latch [today] | a story with a number code did not make; a hint that leaks [today]; a sister line that does not hold or reuses the learner's numbers |
| Linga | the scene contract from a pitch; cast lines; up to three notes | the audience gate (the stricter of a keyword list and the model's label); the twist, dealt from a deck; when a secret is released; whether Take Two held (a rule, a phrase contained, or English only) | a contract above the profile's audience; a line leaking a secret early; a note whose quote is not the learner's words [today for coach quotes, `conversation.ts:209`] |
| Essay | per-sentence verdicts and a slotted fix [today]; the twin's draft; the twin's smoothing of its own sentences | splitting, stats, connectors [today]; which three spots are hot; the style sheet; whether a draft sits inside the learner's measured bands | a pattern that is a sentence or copies four of the learner's words [today, `lib/rules/essay.ts:65-87`]; a twin draft outside the bands, copying an 8-word run, or stating a statistic or named source |

## 4. Math Buddy: Field Work

**The journey** [proposal]. "When is your exam?" (a date or none). A three-minute first job ("how fast is this cup
cooling?"), answered on the phone, no photo. Later: bring the course (a topic list or past paper as text) and the 22
topics are put in the exam's order; a mock paper is sealed on evening one and re-sat before the exam. The learner may
record "passed" after the real exam, shown as a word, never a mark.

**The unit of study: a job** [proposal]. One 25-minute block (the work clock is 25 minutes [today]). Frames: (1) the job:
a three-line story, a sketch code draws, numbers code chose; the learner guesses first (kept, never judged); (2) set up:
the learner types the function, and code checks it is the job's function at the samples; (3) work it: on paper, or on
the experimental step line (below); (4) the answer in the world, by the engine, with its unit, beside the guess as two
bars; (5) exam cards: two bare specs of the same topic, marked by `checkAnswer` [today], which move the latch [today].

- [today] The spine is 22 Calculus topics in six strands, each with its shapes (`lib/library/calculus1.spine.ts`); an
  item is a spec of nine shapes printed and judged by code (`lib/rules/calc.ts:24-34,417-452`); a set is one model call
  proposing specs, then a code filter (`lib/desk/items.ts:247-280`).
- [proposal] A job is a small template per topic, written by the desk's authors: parameter ranges code draws from, a
  function, the question as one of the nine shapes, a unit, a sketch, story slots the model may fill. About two per topic
  in the report (44); the plan starts with one per topic.
- [proposal] **Beyond**: a harder variant of a job (a constraint, a second rate, a parameter to find), taken by choice and
  drawn as a mark on the course map. It reuses the owner's Family rule that difficulty is the reward lever, without points.
- [proposal] **Sister problem**: stuck twice, the learner may ask for a different job of the same shape, worked line by
  line by the model, every line checked by code, none of its numbers the learner's.
- [proposal] **Bring your course**: a course paper as text; code reads the questions it can into specs, the model
  proposes a topic id for the rest, and what fits no shape is listed "noted, not practised", never guessed.
- [proposal, experimental] **The step line**: working typed one line at a time on the phone, each line tagged with what
  was done (=, d/dx, integrate, at x = a, limit, solve = 0); code checks each line against the one before and rings the
  first that stops holding. **Talk it through**: the learner says the plan aloud; words become method chips from a
  closed list; spoken expressions pass a spoken-maths grammar in code and are confirmed before they count.

**Progress and reward** [proposal]. The course map shows only the learner's own exam topics in its order, latched
secure by today's rule (moves 30% toward each result, secure at 0.85 after four, never unset:
`lib/session/learners.ts:47-52,203-214` [today]). The mock paper, sealed and re-sat, side by side: right, a slip ringed,
not sure, not attempted. No rank, no percentage, no other learner.

**Honest limits.**
- [today] The engine reads one variable, `x`; any other letter is unreadable (`lib/rules/calc-expr.ts:15-29`, probe:
  `20+70e^(-0.1t)` and `2xy` do not compile). Related rates and constraint set-ups with two letters cannot be checked as
  written; a job must alias its one variable to `x` and leave two-letter lines without a verdict.
- [today] Two lines are "the same" when they agree at ten fixed irrational samples (`calc-expr.ts:690-715`): numeric,
  not symbolic. A wrong line could agree at all ten in principle; nothing symbolic is available.
- [today] Nothing checks a line of calculus working: `locate` rings the first broken line of a linear equation only
  (`lib/rules/maths.ts:93,281-295`); a Calculus item has no pen position (`lib/desk/mark.ts:20`).
- [today] A course paper reads poorly: `specFromQuestion` knows 17 phrasings and read 13 of 31 corpus questions, none of
  64 TeX forms (`docs/CALCULUS-1-SYLLABUS.md:139-147`, `docs/MATH-COURSE-PATHS.md:220-228`).
- [proposal] Whether a job carries to the real exam is a hypothesis; the exam card is the measure the desk trusts.

**What the owner changed.** "Stick to Calculus", "the goal is still ... to pass exam", "combining these topics with
practical applications", "interface to do inter calculations and using voice/thoughts ... as experimental variant"
(section 1). Hence the job is only the way in and the exam card the way out; the step line and voice are experiments
(section 8).

## 5. Linga: The Company

**The journey** [proposal]. First minute: "Pitch me a scene", one line in any language, and a character answers in role,
in a voice. First evening: a 12-15 minute scene, then Cut, up to three notes quoting the learner, and Take Two of the
beat that cost them; the scene forks and (often) goes better. First month: scenes from the learner's pitches, or three
a week the director deals from their interests; a cold open is recorded (one genre, first try). Later: an optional
returning cast (a Series), an improv night with friends on the sofa, and the cold open again, fresh, beside the first.

**The unit of study: a scene** [proposal]. About 20 minutes: 12-15 in the scene, 5 in notes and the take. The scene
contract is generated per pitch and validated before a word is spoken; nothing is authored per scene. Genres, not
topics, are the only fixed list, because the audience gate hangs on them:

| Genre (illustrative pitch) | Stretches | Gate |
|---|---|---|
| Workplace drama (a pay rise from a boss who keeps changing the subject) | holding a point, polite pressure | 15+ |
| Mystery (a witness lying about one detail) | questions, tense, noticing a contradiction | 15+ |
| Fantasy and sci-fi RP (talk past the dragon's accountant) | persuasion, conditionals | 15+ |
| Comedy and improv (the wrong party, pretend you belong) | fast repair, small talk | 15+ |
| Everyday, heightened (the neighbour opened your parcel) | complaint, de-escalation | 15+ |
| Romance and dating (a first date where both lied on their profiles) | humour, honesty, turning someone down | 18+ confirmed |
| Nightlife (closing time, a stranger with a story) | register, reading people | 18+ confirmed |

- [proposal] "Acting level" means every character carries an objective, an obstacle, subtext, a tell, a voice and a
  delivery note, and optional secrets released by a code rule (the learner's turn is a question naming a keyword). The
  learner carries a role (themselves or a character), an objective, an optional private secret, Cut at any moment, and
  the help ladder [today, `lib/english/help.ts`].
- [framework] Playing someone else lowers the fear of speaking (drama in language teaching, from memory).
- [proposal] Temperaments: Kind (default, understands generously, as today), Real, and Mischief (opt-in: the cast reacts
  to what was said, not what was meant; the misreading must quote the learner, turns only on meaning, never accent, never
  mocks).
- [proposal] A cast line a validator refuses becomes an in-character pause ("hold that thought"), not an error.
- [today] What exists to build on: pitch in own words, 400 characters (`lib/english/placement.ts:15`,
  `check.ts:315-329`), a model-generated scene contract (`check.ts:137-177`), one partner per scene (`conversation.ts:49`),
  moments (`conversation.ts:77-91`), coach and replay (`conversation.ts:185,193,208-214`), evidence rungs
  (`lib/english/rules.ts:28-34`), gates (`curriculum.ts:44-50`), voice out and speech in.

**Progress and reward** [proposal]. A playbill: one poster per scene, a collection that never decays, the learner's own
quoted slips on it, held notes struck through. A note strip by kind (meaning, form, word, register) drawn as marks. The
cold open, first beside last, in the learner's own words. Rungs and evidence as today; a Take is a rehearsal and never
counts as unsupported evidence ([today] a replay turn is recorded as supported: `conversation.ts:213`).

**Honest limits.**
- [today] A turn is one CLI call, not streamed; measured 4-6 s a Linga turn with thinking off (`lib/engines/text.ts:27-31`).
  Pace is half of acting; streaming is a platform ask, not a promise.
- [today] The audience of a generated topic is the model's own label: a romance premise labelled "all" passes
  `cleanTopic` and is allowed for a 13-year-old (probe; `placement.ts:129-135`, `curriculum.ts:48-50`). The only guards
  are the prompt's request to label honestly (`check.ts:155`) and the tutor's non-adult rule (`conversation.ts:57`).
- [today] The tutor may never flirt explicitly, express attraction or promise a romance, in any scene
  (`conversation.ts:57`). The report's dating genre ("flirting in words", "whether the date says yes") bends that line:
  an owner decision (plan section h).
- [proposal] Meaning and register notes are the coach's reading anchored only by a quote; they are labelled a reading,
  never a rule. Only tense and time markers are a sentence rule today (`lib/rules/english.ts:73`).

**What the owner changed.** "not certification", "enjoyable and fun ... with reflecting of mistakes", no "hardcoded
topics", "almost on acting level used in dating, work situations, game/RP situations", "risk more" (section 1). Hence
pitches instead of a topic list, and Cut, notes and Take Two as the reflection. The Family certification plate never
appears in Adult.

## 6. Essay Master: The Twin

**The journey** [proposal]. First minute: pick a format (newsletter, column, story...) and send one piece you already
have, as a file from a PC or a message or paste on the phone; code draws "this is how you write" (the style sheet).
First evening: the Workroom reads the whole piece, marks up to three hot spots, teaches a move with a slotted pattern;
the learner revises on the PC and sends version 2; the diff inks what held. After three pieces (a milestone, a setting):
the twin is born and writes a piece on a topic the learner gives, in their style, with their open habits. Then Sittings
at milestones, "Spot yourself", and a cold Sitting at the season's end. Later phases: a topic scout (phase 2, the
owner's secondary mode) and porting the twin (phase 3, 18+).

**The unit of study: a piece across evenings, and a Sitting at each milestone** [proposal].
- The Workroom is the primary mode (the owner's): the learner's own text, read whole, in the chosen format, kept with
  versions. It is today's paragraph loop (sentence rules, a lens, verdicts, the fix contract, rewrite in place [today])
  scaled to a piece, plus a piece map, versions, a diff and a format lens (an editorial card of what makes that format
  land).
- The twin is **not a trained model**. Honestly named, it is a prompt-held profile of four parts: a style sheet code
  measures from the learner's pieces (sentence-length rhythm, paragraph shape, connectors, openers, favoured words);
  signature passages the learner picks as "this is me"; open habits (recurring faults in their record); a rulebook of
  moves it has learned. [today] The engine is a headless CLI, one call per job (`lib/engines/text.ts:1-13`); nothing
  in the engine layer can fine-tune a model.
- The honesty lock: the twin learns a move only after the learner has used it in their own piece and the rewrite held.
  Its growth is a picture of the learner's growth; teaching it is the reward.
- A Sitting (25-40 minutes): the twin's draft on the TV in the twin's colour; the learner marks a sentence and names
  the fault in their own move words; code reveals whether a planted, rule-checked habit sits there (else the reader's
  view, labelled a reading); the learner writes the replacement sentence; the twin smooths only its own neighbouring
  sentences; a rule joins the rulebook as "learned" only when also held in one of the learner's own pieces, else
  "pending".
- Spot yourself: three paragraphs on one subject (the learner's, the twin's, the plain model's); which is yours? Code
  knows the answer. It measures the twin, never the learner.
- First read (optional): one blind reader says in 20 words or fewer what the piece wants; the learner marks it matched,
  partly or off. One reader, because the owner is unsure about four.

**Progress and reward** [proposal]. The twin's card: what it learned from the learner, what it still shares with them
("so do you, the card says"). The learner's rhythm, first piece beside latest. The cold Sitting beside the first. A
shelf of shipped pieces by format; the learner marks "shipped". No rate, no rank, no "engaging" score.

**Honest limits.**
- [today] "Holds" is a model reading, not code: `rewriteState` reads the model's new verdict (`lib/rules/essay.ts:125-129`,
  `lib/desk/essay.ts:91-110`). The report's claim that the lock "is code's, not the model's" is thinner: code can
  decide a rule-detectable habit's absence, a sentence's change, a copy-run and provenance; a held rewrite is a model
  reading, as today.
- [today] Only sentence splitting, length, connectors and a first-pass role are rules (`lib/rules/essay.ts:12-37`). A
  "rule-checked habit" (a vague "this", a hedge stack, a repeated opener) needs detectors that do not exist.
- [today] The reading core destroys paragraph breaks (`essay.ts:25`, `:117`; Family plan section c row 16). A whole piece
  cannot be read as a piece until that changes.
- [proposal] Likeness is not decidable by code. Code can say a draft sits inside the learner's measured bands; only
  people (Spot yourself) can say it sounds like them. "Engaging" cannot be proven by anyone on the desk; the desk says
  "held", "found", "matched", never "engaging".
- [proposal] The desk cannot prove who wrote a pasted text. It can detect a run copied from a twin draft into the
  learner's own piece, and then that version proves no rule.

**What the owner changed.** "file exchange for larger text analysis", "Primary mode to analyze user's topic", the
secondary topic mode "out of first phase", "not ... pass exam anymore ... engaging writing outputs", the twin repaired
together "after specific milestones, as a reward system on its own", ported later, no handwriting scans (section 1).

## 7. The seam with Family, and what the platform must add

- [today] There is no mode: `Profile { id, name, type, age?, system?, modules, mathPath? }` (`lib/session/store.ts:32`).
  `isAdult` is age >= 18, or type "other" plus a ticked box; "older" is 15+ or "other" (`curriculum.ts:44-50`).
- [proposal, from Family W4] Mode is a field on the profile, not a door on the landing: `Profile.mode`, one read
  `modeOf(p)`, default Family under 18. Family D1 removed the parent confirmation for Phase 1, so the Adult build brings
  the gate back (plan section d). Going back to Family is always allowed; each mode's store sleeps, never deleted on a
  switch.
- [proposal] Shared between modes: facts about the learner and rules of the engine (a Calculus latch, a Linga band, the
  text store, every validator). Not shared: formats, prompts, stance, rewards.
- [proposal] Gates inside Adult: every Field Work job, the Workroom, the twin and Sittings at the Adult floor; romance,
  nightlife and exporting the twin at 18+ confirmed. Never at any age: explicit sexual content, coercion, graphic
  violence, real people, a character contacting the learner outside a scene, a twin writing a school-essay format.
- Platform asks, each built once ([today] fact, [proposal] ask):
  - File exchange: [today] nothing accepts a file; the phone types, snaps and speaks; any device that types the TV's
    pin is a "phone" (`lib/session/pairing.ts:59-63`), so a PC browser can already join. [proposal] a text-file pick on
    the phone, a drop page on a PC, .docx text, no OCR.
  - A learner text store with versions and deletion: [today] a reading lives only on the session, is sent to every
    screen (`pairing.ts:102-107`) and stays there when another learner sits down (probe; `store.ts:373` clears Linga
    state only). [proposal] per-learner files, delete-all, a TV curtain.
  - Voice input: [today] browser speech needs HTTPS on a real phone and the phone is served on `http://`
    (`store.ts:234-237`, `english/ReplyBox.tsx:35`). [proposal] HTTPS on the LAN.
  - Several cast voices: [today] `/api/speak` passes no voice id (`app/api/speak/route.ts:8`). [proposal] a voice per
    character.
  - Faster turns: [proposal] a streaming or faster engine for cast lines, measured first, the owner's budget.

## 8. Where the report and the owner disagree (the owner wins)

| Topic | The report | The owner | This concept |
|---|---|---|---|
| The step line | the default Math interface, rung 1 | "as experimental variant" | an experiment behind a flag; typed set-up and answer plus paper are the default until a within-learner test decides (owner decision) |
| Adult floor and consent | 15+, a parent confirms under 18 on their own phone | Family D1: no parent lock in Phase 1 | the gate returns with the Adult build; the plan recommends 18+ only for the first release (owner decision) |
| Counts on reward screens | "2 of 3 notes held" on a poster | the product rule: no points, no scores | marks, never printed counts (Family plan's never-print-the-count rule) |
| Dating content | flirting in words; the date may say yes | 18+ confirmed, non-explicit | only after the owner rules on loosening `conversation.ts:57` |

## 9. What the code check changed (details in the plan, section c)

- [today] No calculus line checker exists and none can be symbolic; a numeric chain checker is cheap (probe: under a
  millisecond a line) and catches the report's illustrated slips, but one letter only.
- [today] The twin's honesty lock rests on a model reading ("holds") unless habit detectors are built.
- [today] Linga's audience gate trusts the model's label; a keyword backstop is a present-day safety fix, for Family too.
- [today] A learner's text already outlives their turn at the desk on the shared session; the text store must fix this
  before any adult text arrives.
