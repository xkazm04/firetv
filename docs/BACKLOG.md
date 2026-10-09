# Backlog — drained UAT findings

The tracked backlog `/uat drain` writes into (homes: `uat/README.md`, *Drain homes*; analysis documents: `docs/uat-insights/<run-id>.md`). One section per module. Every entry has this format:

```
- **<id>** — <one-line title>
  - origin: <run>/<finding-id>, or "<quoted Character voice>" (<character>, <run>)
  - recommendation: build | concept-doc | method-commitment | decline-with-reason (<the reason>)
  - status: open | built <commit> | resolved-verified <recertify ref>
  - ceiling: <what the Character still cannot do once this lands>
```

- **id**: module prefix and a number, never reused (`LG-1`, `EM-B1`, `MB-B1`).
- **origin**: no entry without one; an idea with no finding id and no voice does not enter.
- **recommendation**: a `method-commitment` names its trigger ("every release re-runs journey X"); a `decline-with-reason` keeps its reason here so it cannot return as a fresh idea without new evidence.
- **status**: `built <commit>` is code landed, not done; `resolved-verified` takes a recertify with live evidence against the originating Character.
- **ceiling**: the honest limit that remains, stated before the build, revised by the recertify.

## Linga

Drained from the five 2026-09-15 LT runs (codex played and judged them; analysis in `docs/uat-insights/2026-09-15-*.md`). Paths are under `desk/src/`, checked against main b8558e80. A root cause marked *hypothesis* was not verified against the run's stored artifacts.

- **LG-1** — Swaps forget what the learner turned down
  - origin: 2026-09-15-lt/LT-oksana-34-J2-1, 2026-09-15-lt/LT-ondrej-16-J2-2, 2026-09-15-lt-recert/LT-ondrej-16-J2-2, 2026-09-15-lt-recert2-goal/LT-ondrej-16-J2-4; "I swapped photos and got cake, swapped cake and got photos. How many times do I have to say no?" (ondrej-16, 2026-09-15-lt-recert)
  - recommendation: build — the swap's `avoid` holds only the current titles (`lib/english/check.ts:192`) and a swapped-out topic is forgotten (`check.ts:220`). Keep the rejected titles and premises on the plan and send them; let Swap take a few words of "instead" (`english/LingaPhone.tsx:159`). That this causes the recycling is a hypothesis
  - status: open
  - ceiling: a swap can still return a near-synonym of a rejected subject; code compares titles, not meaning
- **LG-2** — The partner keeps a scene going but not toward its goal
  - origin: 2026-09-15-lt/LT-oksana-34-J1-3, 2026-09-15-lt/LT-ondrej-16-J1-2, 2026-09-15-lt-recert/LT-adela-17-J3-2, 2026-09-15-lt-recert/LT-lukas-24-J3-3, 2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-2
  - recommendation: build (hypothesis: missions postdate the run; measure on a claude-CLI LT run first) — the step task only judges whether a reply reached `currentStep` (`lib/english/conversation.ts:323`); nothing steers back or wraps up after the mission (`conversation.ts:89-90`, `:307`). When the step has not moved for N partner turns, ask for one move toward it; when the mission is done, offer to close
  - status: open
  - ceiling: steering stays prompt-held; a partner can still follow a tangent too far
- **LG-3** — "The plan is not fully visible before agreeing"
  - origin: 2026-09-15-lt/LT-viktor-67-J2-1, 2026-09-15-lt/LT-martin-45-J2-2, 2026-09-15-lt/LT-tomas-9-J2-3, 2026-09-15-lt-recert/LT-martin-45-J2-3, 2026-09-15-lt-recert/LT-viktor-67-J2-3, 2026-09-15-lt-recert2-goal/LT-klara-13-J2-3, 2026-09-15-lt-recert2-goal/LT-petra-38-J2-4, 2026-09-15-lt-recert2-goal/LT-tomas-9-J2-2, 2026-09-15-lt-recert2-goal/LT-viktor-67-J2-1
  - recommendation: decline-with-reason (driver artefact: the judge read each screen cut to 900 characters until f3542b5a, and the stored screens hold every topic. The TV and phone draw every topic: `english/LingaTV.tsx:110`, `english/LingaPhone.tsx:159`. Returns only with live L2 evidence of a missing topic)
  - status: open
  - ceiling: the TV card shows the title and skill; the reason is the focused card's caption only (`lib/english/view.ts:529`)
- **LG-4** — No unsupported retry of what was coached
  - origin: 2026-09-15-lt/LT-tomas-9-J4-1, 2026-09-15-lt/LT-viktor-67-J4-2, 2026-09-15-lt-recert/LT-tomas-9-J4-4, 2026-09-15-lt-recert2-beginners/LT-petra-38-J4-3; "Then let me try by myself! It stopped after three answers. I did not get that try." (tomas-9, 2026-09-15-lt)
  - recommendation: concept-doc — `docs/LINGA-CONVERSATION-DESIGN.md`, *Open questions (09-15 drain)*. Replay asks a new question (`lib/english/conversation.ts:325`) and is supported (`:347`). Take Two re-asks the same line in Adult mode only (`lib/english/turn.ts:94`) and records nothing
  - status: open
  - ceiling: one retry in the same scene shows reuse, not retention
- **LG-5** — Beginner partner language runs above band and does not ease after "nevím"
  - origin: 2026-09-15-lt/LT-tomas-9-J3-1, 2026-09-15-lt/LT-viktor-67-J3-1, 2026-09-15-lt/LT-klara-13-J3-1, 2026-09-15-lt-recert/LT-tomas-9-J3-1, 2026-09-15-lt-recert2-beginners/LT-tomas-9-J4-3, 2026-09-15-lt-recert2-beginners/LT-viktor-67-J4-4; "I said nevím and he said almost the same thing again." (tomas-9, 2026-09-15-lt)
  - recommendation: build — pitch is prompt text only (`lib/english/conversation.ts:72`), and adaptation reads the stored record, not this turn (`conversation.ts:87`). Code reads the last reply for signs of not understanding (another language, "nevím", "don't understand", help twice) and asks for one short question with a one-word answer next; a length cap on A1–A2 partner lines is checked in code. That prompt-only pitch is the cause is a hypothesis (judge-rated on codex)
  - status: open
  - ceiling: vocabulary fit stays the model's judgement; a length cap does not make a rare word easy
- **LG-6** — Planning screens assume an adult reader of English
  - origin: 2026-09-15-lt/LT-tomas-9-J2-2, 2026-09-15-lt/LT-viktor-67-J2-2, 2026-09-15-lt-recert/LT-tomas-9-J2-2, 2026-09-15-lt-recert2-goal/LT-tomas-9-J2-1; "Mum would need to help me read." (tomas-9, 2026-09-15-lt-recert2-goal)
  - recommendation: build — the goal question (`lib/english/view.ts:361`), the fixed English skill labels (`lib/english/curriculum.ts:8-17`) and the phone's card text (`english/LingaPhone.tsx:156-159`) have no band or language variant. At A1–A2: no skill label, a short goal question, the why in the learner's language
  - status: open
  - ceiling: a nine-year-old still has to read the titles, or have them read aloud
- **LG-7** — "What does X mean?" asked in Czech is answered in more English
  - origin: 2026-09-15-lt/LT-viktor-67-J3-2, 2026-09-15-lt-recert/LT-viktor-67-J3-2, 2026-09-15-lt-recert2-beginners/LT-viktor-67-J3-1; "Please give me the Czech word sooner" (viktor-67, 2026-09-15-lt)
  - recommendation: build — help's meaning step explains in English only (`lib/english/conversation.ts:79`); the only other-language path is the capped word moment (`conversation.ts:322`). When the learner asks in another language what a word means, the next line or help step gives the word in that language, then the English again
  - status: open
  - ceiling: rests on the model's Czech; a wrong gloss is taught with confidence
- **LG-8** — The verdict's summary and next focus never see the learner's answers
  - origin: 2026-09-15-lt/LT-martin-45-J1-1, 2026-09-15-lt/LT-klara-13-J1-2, 2026-09-15-lt/LT-adela-17-J1-4, 2026-09-15-lt/LT-viktor-67-J1-1, 2026-09-15-lt-j1b/LT-lukas-24-J1-1, 2026-09-15-lt-j1b/LT-petra-38-J1-2; "Show me the repeated mistakes and explain how they separate my English from C1." (martin-45, 2026-09-15-lt)
  - recommendation: build — the summary step gets each task's band, kind, verdict and note, never the answer (`lib/english/check.ts:123`), and only the focus length is checked (`check.ts:124`). Pass the quoted answers; the focus quotes one answer and gives one better sentence, the quote code-checked against the answers
  - status: open
  - ceiling: a grounded verdict still does not earn acceptance from a learner who rates himself higher; accuracy and acceptance stay separate
- **LG-9** — The first conversation after agreeing is the model's first card, not the learner's priority
  - origin: 2026-09-15-lt/LT-petra-38-J2-2, 2026-09-15-lt/LT-tomas-9-J3-2, 2026-09-15-lt-recert/LT-lukas-24-J2-4, 2026-09-15-lt-recert/LT-tomas-9-J2-3; "After agreeing, I got a museum exercise first. That isn't what I need fifteen minutes before a date." (lukas-24, 2026-09-15-lt-recert)
  - recommendation: build — next is the first unstarted topic in plan order (`lib/english/curriculum.ts:118`), and own-words additions are appended last (`lib/english/check.ts:220`). An own-words topic leads, or the learner picks the first topic on agree (`lib/english/view.ts:369`)
  - status: open
  - ceiling: a learner who adds nothing still meets the model's order
- **LG-10** — Placement confidence counts a skip as evidence
  - origin: 2026-09-15-lt/LT-viktor-67-J1-3 (verified: two skipped A1 tasks, `confidence: "high"` in the stored placement), 2026-09-15-lt/LT-jana-29-J1-1, 2026-09-15-lt-j1b/LT-petra-38-J1-1, 2026-09-15-lt-j1b/LT-tomas-9-J1-3
  - recommendation: build — a skip settles as a fail (`lib/english/check.ts:311`); two A1 fails set `floored`, which reads "high" (`lib/english/placement.ts:96`, `:104`); partials never touch confidence. A floor reached by skips reads "low", and repeated partials cap at "medium". A certificate needs medium or high (`lib/english/cert.ts:69`), so this now gates certificates
  - status: open
  - ceiling: a lucky guess on a choose task still reads as a pass
- **LG-11** — Shaping an own-words topic can drop the details the learner named
  - origin: 2026-09-15-lt/LT-jana-29-J2-2, 2026-09-15-lt/LT-oksana-34-J2-3, 2026-09-15-lt-recert/LT-lukas-24-J2-3, 2026-09-15-lt-recert/LT-tomas-9-J2-4; "the bit about ending a date politely seems to have disappeared" (lukas-24, 2026-09-15-lt-recert)
  - recommendation: build (hypothesis: the shaping call drops clauses; prompts were not stored) — shaping is prompt-held (`lib/english/check.ts:164`) and exempt from the word check (`check.ts:189-190`). Keep and show the learner's own words on the topic; check that their content words reach the title or premise
  - status: open
  - ceiling: a detail can survive in the premise and still not come up in the scene
- **LG-12** — "Try it again" stays on screen after the retry
  - origin: 2026-09-15-lt/LT-adela-17-J4-6, 2026-09-15-lt-recert/LT-viktor-67-J4-4, 2026-09-15-lt-recert/LT-adela-17-J4-5, 2026-09-15-lt-recert/LT-petra-38-J4-2
  - recommendation: build — `phase:"replay"` is set (`lib/english/conversation.ts:347`) and never reset, and the tag follows it (`lib/english/view.ts:470`). Clear it after the first replay turn
  - status: open
  - ceiling: clearing the tag says nothing about whether the retry worked (LG-4)
- **LG-13** — The situation list is one fixed order for everyone
  - origin: 2026-09-15-lt/LT-petra-38-J4-4, 2026-09-15-lt/LT-tomas-9-J4-4, 2026-09-15-lt/LT-jana-29-J1-4, 2026-09-15-lt-recert/LT-petra-38-J4-3; "I want more hotel situations near the top." (petra-38, 2026-09-15-lt-recert)
  - recommendation: build — authored scenes come in a fixed order filtered by age only (`lib/english/curriculum.ts:89`), and the browser opens at index 0 (`lib/english/view.ts:75`). Order them by the learner's goal and interest words after the plan topics
  - status: open
  - ceiling: ordering cannot create a scene the library lacks (no hospitality work scene exists)
- **LG-14** — The level check addresses an A1 child or pensioner in adult English
  - origin: 2026-09-15-lt/LT-viktor-67-J1-2, 2026-09-15-lt-j1b/LT-tomas-9-J1-1
  - recommendation: build — instructions are not shortened by band (`lib/english/check.ts:44`, `:52-54`), captions are fixed English (`lib/english/view.ts:347`), and *Show the words* reveals English only (`view.ts:346`). At A1, ask the task question in the learner's language and keep captions to a few words (the measurement question is LG-18)
  - status: open
  - ceiling: a child who cannot yet read relies on the TV voice
- **LG-15** — A learner who makes no mistakes leaves with nothing new
  - origin: 2026-09-15-lt/LT-jana-29-J3-1, 2026-09-15-lt/LT-lukas-24-J3-1, 2026-09-15-lt-recert/LT-jana-29-J3-1, 2026-09-15-lt-recert/LT-lukas-24-J3-2; "Give me one register distinction or a sharper alternative I wouldn't have reached myself." (jana-29, 2026-09-15-lt)
  - recommendation: concept-doc — `docs/LINGA-CONVERSATION-DESIGN.md`, *Open questions (09-15 drain)*. Moments serve errors and other-language words (`lib/english/conversation.ts:322`), and Cut rules out valid alternatives (`conversation.ts:131`)
  - status: open
  - ceiling: an enrichment line can be right and still be no use to the learner
- **LG-16** — A turn's learning evidence is decided by provenance, not substance
  - origin: 2026-09-15-lt-recert/LT-tomas-9-J4-7, 2026-09-15-lt/LT-adela-17-J4-7, ceiling of 2026-09-15-lt/LT-viktor-67-J4-1
  - recommendation: build — `validateObservations` keeps a quote found in the reply that passes word-pattern `creditOf` (`lib/english/rules.ts:69`, `lib/english/credit.ts:35-46`) and drops the rest silently (`rules.ts:67-69`); the turn schema is loose (`lib/english/conversation.ts:42`)
  - owner: linga-conversation-turn council rework
  - status: open
  - ceiling: a substance check is still a model reading the quote; code can bound it, not prove it
- **LG-17** — Partner pitch below band for B1+ learners
  - origin: 2026-09-15-lt-recert/LT-martin-45-J3-2, 2026-09-15-lt/LT-lukas-24-J1-2; "ordering a sandwich does not prepare me for my US director" (martin-45, 2026-09-15-lt-recert)
  - recommendation: method-commitment — the next Linga LT run reports below-band pitch per Character for every B1+ learner; a build enters only if it repeats. Trigger: the next `linga-text.cjs` run or ledger `--recertify`
  - status: open
  - ceiling: a judged pitch is one model reading another's English
- **LG-18** — Say-task credit and the ladder: opposing errors
  - origin: 2026-09-15-lt/LT-martin-45-J1-2, 2026-09-15-lt-j1b/LT-ondrej-16-J1-1, against 2026-09-15-lt-j1b/LT-oksana-34-J1-1 and `2026-09-15-lt/VERIFY.md` (three near placements, all one band above; three C1 partials held the band)
  - recommendation: concept-doc — `docs/LINGA-PLACEMENT-DESIGN.md`, *Open questions (09-15 drain)*. Say tasks are model-judged and code-mapped (`lib/english/placement.ts:79-81`), and a partial holds the band with no repeated-partial rule (`placement.ts:94`)
  - status: open
  - ceiling: four exact and three near placements are a codex sample; the claude engine was never measured
- **LG-19** — The learner's role in a scene is left to the model
  - origin: 2026-09-15-lt/LT-petra-38-J1-2, 2026-09-15-lt/LT-petra-38-J1-3, 2026-09-15-lt-recert2-beginners/LT-petra-38-J4-1, 2026-09-15-lt-recert2-beginners/LT-petra-38-J3-1; "Instead, I was the tired guest and Mia did my job." (petra-38, 2026-09-15-lt-recert2-beginners)
  - recommendation: build — a topic carries partner and premise but no learner role (`lib/english/check.ts:35`, `:165`); the prompt says only `You play ${scene.partner}` (`lib/english/conversation.ts:69`). The authored booking scene seats the learner as the customer, with "a guardian present" for children (`lib/english/curriculum.ts:35-37`). Put a learner role on the topic and scene contract and in the prompt
  - status: open
  - ceiling: a role line is prompt-held; the model can still drift into the learner's job
- **LG-20** — Minor boundary on partner replies is prompt text only
  - origin: 2026-09-15-lt/LT-ondrej-16-J5-1 (VERIFY-confirmed breach; fixed at LT, ceiling "Prompt-held, not code-enforced"); "apparently dating was fine after one request, so the limits weren't consistent" (ondrej-16, 2026-09-15-lt)
  - recommendation: build — the rule is a prompt sentence (`lib/english/conversation.ts:77`); the keyword gate never runs on partner replies (`lib/english/gate.ts:11-12`). A code check of the reply for a minor, keeping the in-scene redirect, with a model-level test
  - owner: linga-conversation-turn council rework
  - status: open
  - ceiling: a keyword check catches named topics, not innuendo
- **LG-21** — The date partner's refusal is one repeated line
  - origin: 2026-09-15-lt-recert/LT-lukas-24-J5-2, 2026-09-15-lt/LT-lukas-24-J3-3; "Hearing that three times felt mechanical. I want to practise showing interest respectfully" (lukas-24, 2026-09-15-lt-recert)
  - recommendation: concept-doc — `docs/LINGA-CONVERSATION-DESIGN.md`, *Open questions (09-15 drain)*. Trades against LG-20: the date premise (`lib/english/curriculum.ts:57`) and "never flirt explicitly … Decline warmly" (`lib/english/conversation.ts:77`)
  - status: open
  - ceiling: any line drawn here is prompt-held
- **LG-22** — Closed-on-main rows stay open until a claude-CLI recertify answers them
  - origin: the 50 rows marked closed-on-main in the five accounting tables, such as 2026-09-15-lt/LT-tomas-9-J4-2 and 2026-09-15-lt/LT-tomas-9-J3-3
  - recommendation: method-commitment — no drain stamps a row resolved from a code reading; the rows stay `open`, so the ledger's `--recertify` re-asks each one on the claude CLI. Trigger: the next `node uat/driver/linga-text.cjs --recertify`
  - status: open
  - ceiling: a claude-CLI recertify is still LT, not L2

## Essay Master

## Math Buddy
