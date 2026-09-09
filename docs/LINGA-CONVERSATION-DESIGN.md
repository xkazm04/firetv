# Linga: English you can use

Product and customer-experience proposal · 9 September 2026

**Make the television a place to rehearse life in English.** Enter a situation, accomplish something by talking, get one useful coaching note, and replay the moment. A small, stable syllabus gives the tutor direction; the scene, dialogue, support, and next challenge adapt to the learner.

This is a proposed design, not an implemented voice product. The [interactive concept](../prototype/linga-conversations.html) demonstrates five scripted journeys and a printable learning map. It has no microphone, model calls, or persistent assessment. Open it in a browser; the controls outside the TV frame belong to the design review.

## 1. What the existing product gives us

The app already has three identities: Math Buddy, Linga, and Essay Master. Linga currently accepts a sentence through the phone, resolves a limited set of tense/time-marker patterns in code, and asks the model to explain the rule. Its tutor prompt assumes a Czech teenager. It has no conversational session or multidimensional English skill record.

Math supplies a useful precedent: a syllabus with prerequisites, generated practice, a persistent learner record, and narrative memory about helpful teaching approaches. Its numeric answer verifier and binary correctness model do **not** transfer to open conversation. English has multiple valid replies, context-sensitive register, and uncertain speech recognition.

Preserve the [On Air visual system](DESIGN-ON-AIR.md): charcoal, white, one red band, a thin amber English accent, large type, visible D-pad focus, one caption slot. TV stages the situation; the phone captures speech and holds private detail. Existing preferences require a description in the caption when an option receives focus and progress shown visually.

## 2. Duolingo research: borrow the learning structure, develop the experience

Research checked 9 September 2026 using Duolingo's own product and teaching publications. These document features, not universal availability or independently established learning efficacy. Rollouts differ by course and platform; subscription packaging is not a design dependency.

| Observed feature | What it contributes | Linga decision |
|---|---|---|
| A structured path, short interactive lessons, adaptive difficulty and spaced review | Direction and revisiting knowledge | Keep an authored skill spine and short episodes; retrieve earlier skills inside a different situation. [Teaching method](https://blog.duolingo.com/duolingo-teaching-method/) |
| Video Call: unscripted speaking; later updates include beginner captions, push-to-talk, post-call feedback, and more steerable advanced calls | Conversation practice with scaffolding | Make conversation the default entrance. Give the learner time, a visible turn state, and control over support. [2025 product review](https://blog.duolingo.com/product-highlights/) |
| Video Call uses level constraints, a conversation blueprint, generated opening questions, and facts remembered between calls | Personalization still needs deliberate orchestration | Separate lesson planning from the character's next turn. Remember teaching preferences explicitly; avoid retaining personal revelations by default. [AI and Video Call](https://blog.duolingo.com/ai-and-video-call/) |
| Roleplay offers situational exchanges and feedback; humans author scenarios and instructions | Authentic purpose and quality control | Author scenario contracts and success rubrics; generate dialogue and variations within them. [Duolingo Max / Roleplay](https://blog.duolingo.com/duolingo-max/) |
| Adventures uses environments, tasks, contextual clues, and in-world repair; characters also shift formality by situation | Language changes the world and has a social purpose | Let speech reveal clues, negotiate plans, and resolve obstacles. This already exists in Duolingo in some form; our proposed distinction is the full TV session and replay loop. [Adventures](https://blog.duolingo.com/adventures/) |
| Explain My Answer provides contextual grammar/vocabulary feedback and has moved beyond its original paid-only model; the announcement lists supported courses | Accessible explanations at the point of need | Offer a short explanation, a model phrase when helpful, and immediate reuse. Do not assume its announced availability covers every English course. [Explain My Answer](https://blog.duolingo.com/explain-my-answer-now-free/) |
| Rewards and playful learning sit alongside instructional practice | A reason to return | Children collect places visited and goals accomplished. Adults collect situations they can handle. Reward returning and trying again; do not deduct lives for speech errors. [Teaching method](https://blog.duolingo.com/duolingo-teaching-method/) |

**Product hypothesis:** a shared, legible scene plus targeted replay makes spoken practice feel more purposeful and easier to understand from the sofa. This needs validation. Neither TV nor an LLM alone establishes a learning advantage.

## 3. Three entrances, one learning record

After choosing their existing learner profile, the learner sees one recommended situation. Two primary actions: **Start talking** and **Choose a situation**. The existing Menu control opens the learning map and settings.

- **Learn with me:** the default ongoing journey. First visit begins with a supported conversation; subsequent visits retrieve the last useful skill and introduce one next step.
- **Practise for something:** choose a real goal, such as an interview tomorrow. Brief on the phone, rehearse on TV, replay the difficult moment. The tutor can temporarily prioritise this goal without rewriting the whole syllabus.
- **Help with English:** retain sentence/homework support as a secondary entrance inside the situation chooser. Explain the point, then offer a two-turn scene to use it. Reading a homework page alone does not establish spoken competence.

First visit: reuse profile age/type; ask comfort in English, one interest, and today's goal. Let the learner skip interests. Parent setup for younger children can happen on the phone. Ask about surprises only when choosing the first scene, with a sensible age-appropriate default. Microphone setup happens before the character addresses the learner.

Placement is a provisional 3–5 minute conversation: an easy opening, one follow-up, a comprehension opportunity, and a chance to ask or repair. Stop probing if the learner struggles; teach immediately. Say “Let's start here” rather than awarding a CEFR level after four turns. Experienced learners can request a harder scene. Returning learners resume without repeating setup.

## 4. A session the customer can understand

| Moment | TV experience | Phone / tutor behavior |
|---|---|---|
| Tonight | One situation, one goal, a duration estimate | Recommended from goals, evidence, and due review |
| Brief | A map, object, or setting; one caption explaining the task | Optional private role brief and language support |
| First exchange | Partner name and one spoken line in the caption | Beginner gets a useful model phrase before being expected to invent an answer |
| Conversation | The scene changes when the learner achieves something | Learner speaks; the partner responds to the meaning, not merely the target grammar |
| Rescue, when needed | “Take your time”; then one cue or two contrasting choices | Offer repeat → slower/paraphrased line → meaning cue → phrase starter → model-and-retry |
| Coaching pause | One moment selected for improvement | At a natural boundary, name what worked and one thing to try; learner can decline |
| Replay | Return to the same moment with the goal still visible | Retry with less help or change the partner's question; avoid rewarding memorisation as transfer |
| Debrief | A small visual path: tried → with help → on your own → used elsewhere | Private evidence, phrase notes, and next recommendation; distinguish today's example from accumulated progress |
| Next visit | A new setting calls for an earlier skill | Spaced review, not just a continuation of yesterday's story |

Design starting points: 6–8 minutes for younger children, 10–12 for teens, 10–15 for adults; user can end or extend at a natural boundary. Aim for most active practice time in conversation and replay. Quizzes occupy at most a short rescue or contrast moment, not a compulsory block in every episode. These are pilot defaults, not research-derived optimal timings.

### Five example episodes

**Age 8, elementary beginner, games, playful:** “The missing moon rover.” A robot has lost its rover. The learner asks where it is, follows one clue, and describes what they see. “Under the bridge” opens the next part of the map. A two-image choice can help with under/behind, then the child uses the phrase aloud. The robot needs help; it does not ridicule errors. Unlock a new location for solving the task, not for sounding native.

**Age 16, A2-ish, games and friends, playful:** “Your co-op team needs a plan.” Negotiate who builds, who scouts, and what to do when a teammate disagrees. Language: suggestions, reasons, clarification. Communication: disagree without excluding someone. The same skills transfer next time to planning a school event. Avoid treating every teenager as a gamer; music, sport, making things, and travel are equivalent choices.

**Adult beginner, travel, familiar:** “A reservation that isn't there.” Use simple language to state the booking name, ask for help, and clarify a date. Mature context with short sentences and high support. Beginner level never selects childish characters automatically.

**Adult intermediate, work, stretch:** “The interview follow-up.” Explain a project, then answer “What did you personally change?” The coach helps move from vague claims to a specific action and result. Replay with a skeptical but professional follow-up. Use fictional experience if preferred; the tutor should not manufacture credentials for the learner.

**Adult, social goals, chosen intensity:** “A first date with a different opinion” or “The missed deadline.” Practise asking a genuine follow-up, disagreeing warmly, declining respectfully, acknowledging impact, and setting a boundary. Success can mean ending the conversation clearly; it never requires pleasing or persuading the other person.

## 5. Personalisation has independent dimensions

| Dimension | Controls | What it must not imply |
|---|---|---|
| Age / life stage | Eligible themes, reading load, session length, guardian controls | English proficiency or a fixed personality |
| Skill evidence | Vocabulary, grammar, turn length, scaffolding | Emotional tolerance or cultural identity |
| Interests | Setting, examples, optional recurring story | Permanent pigeonholing; offer new interests and “surprise me” |
| Creativity | Familiar / playful / surprising | More complex English or permission for distressing content |
| Social challenge | Supportive / realistic / stretch | How much fantasy appears in the scene |
| Teaching preference | Correct at pauses / help as I go; captions, translation, speaking pace | A learning-style diagnosis |
| Immediate goal | Travel, school, work, relationships, general confidence | Permission to retain sensitive personal details |

“Surprising” means a benign change in circumstance: the robot misunderstands a landmark, the venue is full, the interviewer asks for evidence. It does not mean arbitrary surreal language. Difficulty can increase through less scaffolding, longer turns, less predictable questions, or more nuanced social goals; change one dimension at a time.

Children default to playful, supportive scenes; adults default to familiar, realistic ones. All ages can enjoy play. Date simulations are an explicitly selected adult scenario involving adult characters. Conflict begins with ordinary disagreements; learner can lower intensity, change the scene, or stop at any point. No romance routed into child profiles, humiliating characters, or rewards for coercion.

## 6. A rough syllabus that survives generated content

The backbone is a collection of **communicative abilities**, each with language resources, examples, prerequisites, and evidence requirements. CEFR's attention to interaction, mediation, and phonological competence supports using more than a grammar ladder. These are original product groupings, not official CEFR descriptors or a certified placement scheme. [Council of Europe: descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors), [mediation](https://www.coe.int/en/web/common-european-framework-reference-languages/mediation).

| Chapter / stable family | Can-do goal | Language resources | Example transfer |
|---|---|---|---|
| 1 · Make contact (`contact`) | Greet, introduce, signal a need, take a turn | Formulaic chunks, basic questions, names | Meet a robot → meet a colleague |
| 2 · Understand and repair (`repair`) | Ask to repeat, clarify, confirm meaning | Question words, “Do you mean…?”, paraphrase | Game instructions → station directions |
| 3 · Get something done (`request`) | Request, locate, choose, confirm | Can/could, quantities, place/time words | Find a rover → resolve a booking |
| 4 · Share your world (`describe`) | Describe routines, interests, people, preferences | Present forms, reasons, comparisons | Favourite game → weekend conversation |
| 5 · Tell what happened (`narrate`) | Sequence events and explain a result | Past forms, connectors, relevant aspect | Match recap → interview example |
| 6 · Make a plan (`negotiate`) | Suggest, compare options, agree roles | Future meanings, conditions, suggestions | Team quest → project handover |
| 7 · Connect with people (`relate`) | Follow up, acknowledge, disagree, decline | Register, hedging, turn-taking | New school club → first date (adults) |
| 8 · Handle friction (`resolve`) | Clarify impact, set a boundary, propose next steps | Specific requests, modals, repair and mediation | Team disagreement → missed deadline |

Spiral through these at increasing complexity. Repair starts in chapter 1 and stays available everywhere. An advanced learner can enter at a demanding scenario; prerequisites trigger just-in-time support rather than locking off relevant life goals. Start MVP with repair, request, and negotiate; retain the wider map as a roadmap, with unavailable chapters labelled.

**Printable map:** one A4 page with learner name, date, goal, the eight chapter names, next three recommended abilities, and a short can-do legend. Print from the phone/browser; no printer configuration on TV. The prototype includes a sample print view. Real maps should show recorded evidence and provisional recommendations, never fabricated progress. Optional take-away: two phrases and one real-world practice idea.

## 7. How the tutor adapts without wandering

The LLM proposes the scene, interprets responses, and chooses its wording. Code owns the allowed curriculum IDs, age/theme boundaries, evidence validity, progression policy, and persistence. This preserves the existing decision boundary while allowing richer model judgment than Math's numeric exercises.

1. **Select:** combine an immediate goal, one focus ability, and one due review ability. If the learner picks a different eligible topic, follow them and update the plan.
2. **Plan:** generate a compact episode contract: eligible scenario, role, purpose, language bounds, opening, success opportunities, rescue ladder, and one possible twist. Validate before starting.
3. **Converse:** supply only the relevant contract, recent turns, support state, and approved memory to the next-turn model. The partner listens to what was actually said; it can accept a valid approach outside the expected wording.
4. **Observe:** propose evidence against named rubric criteria, referencing actual turn IDs and quote spans. Code rejects nonexistent quotes, unknown skills, duplicate events, and attempts from a superseded session.
5. **Coach:** pick one high-value improvement at a pause. Interrupt immediately only to repair lost meaning, honour a request, or stop the scene. A grammatically imperfect sentence that achieves its purpose can be successful communication.
6. **Replay:** preserve the intention while changing wording or context. Reduce support only after evidence that the learner can manage it.
7. **Remember:** commit validated skill evidence plus short, editable learning notes. Propose the next session; the learner can override it.

Keep evidence separate for listening, spoken production, interaction/repair, language resources, and register. Pronunciation judgments require an appropriate audio assessment path; a transcript cannot establish accent, intonation, or intelligibility. A selected quiz answer is recognition evidence, not proof of spontaneous speaking. Repeating a supplied model is supported practice.

Use understandable states: **Not tried → With help → On your own → Used elsewhere**. A pilot progression rule could require three eligible independent successes across two sessions, including one unfamiliar setting, before “Used elsewhere.” Treat this threshold as a configurable hypothesis requiring teacher calibration. One good call does not certify mastery. Maintain historical achievements; show fresh review needs separately instead of erasing the learner's past success.

For open-language evaluation, code validation is necessary but insufficient: a model can cite a real sentence and still judge it badly. Calibrate rubrics against teacher-reviewed examples, allow valid variants, and withhold advancement when confidence is insufficient. Do not display numerical confidence as a learner grade. Low-quality audio, conflicting assessments, or corrected transcripts produce “Let's try that again,” not a penalty.

### Concrete adaptation example

An adult says “Give me another time” when rescheduling. The meaning is clear; grammar is acceptable. The partner offers a time, so the conversation succeeds. At the pause, the coach asks whether the learner wants it warmer or more formal, demonstrates “Could we find another time?”, and replays the exchange. The learner then handles a different availability question without the phrase visible. Store requesting evidence and chosen register practice separately. Do not mark the original sentence grammatically wrong or the learner rude.

## 8. Language plus communication style

Coach three separate questions: **Was the message understandable? Was the language effective? Did the phrasing fit the learner's chosen intention and context?** Feedback describes likely effects, with uncertainty, rather than asserting what another person feels.

| Situation | Useful coaching | Inappropriate success condition |
|---|---|---|
| Interview | Specific example, clear ownership, concise result; appropriate formality | Getting hired or sounding like a native speaker |
| Date | Reciprocal questions, warmth, respectful disagreement and boundaries | Winning attraction or overcoming a refusal |
| De-escalation | Acknowledge impact, ask for specifics, state needs, propose a next step | Appeasing the partner or suppressing justified disagreement |

An example replay: “You never listen” → “I wasn't finished. Can I explain my concern?” The coach describes how the second version names an observable problem and makes a request. It does not promise that the other person will calm down. For cultural register, offer alternatives and ask the intended audience; directness is not universally a defect. Pronunciation aims at understandable speech, not accent removal.

Keep adult rehearsals private by default: use fictional names, put detailed notes on the phone, and make TV transcript visibility explicit before starting. A learner may prefer a phone-only rehearsal for a sensitive topic. Characters are transparently fictional practice partners, not continuing romantic relationships.

## 9. TV, phone, and voice contract

**TV:** one scene, one speaker, one caption slot, up to two primary actions. During dialogue the caption contains the current utterance; focus on an action temporarily uses that same slot for its explanation. Menu opens support choices. Word bank and full transcript belong on the phone. Map detail appears one chapter at a time on TV. An optional co-learning session alternates named speakers, with separate evidence; do not infer who spoke from room audio.

**Phone:** tap to start/stop speaking, visible capture state, repeat/clarify controls, optional text alternative, private scene setup, transcript correction, learning notes, printable map. Text participation remains useful but does not count as audio pronunciation evidence. Select a speaker before capture in shared sessions.

**Remote:** arrows move visible focus; Select activates; Back returns or offers resume/end when a scene is active; Play/Pause pauses partner speech and the scene. Menu reveals support/settings. Every focused choice has a caption description. Remote-only mode supports listening and quiz recognition; label its scope honestly and leave spoken goals unassessed. Do not assume access to the Fire TV remote's microphone.

**Turn states:** Ready → Listening → Checking speech → Partner preparing → Partner speaking. No always-listening room microphone in the first slice. Stop TV speech during capture to reduce feedback; provide an explicit “I'm done” action and no punitive response timer. Let the learner interrupt playback to speak. Repeat is exact playback; slower repeats or simpler paraphrases are labelled distinctly.

Design performance target: a visible acknowledgement within 300 ms of a tap and partner audio beginning within roughly 2 seconds of submitting a normal turn. These are unmeasured targets. Current CLI/text and speech engines must be timed together; if they cannot sustain it, show an honest preparing state and evaluate a streaming engine before describing the product as fluid conversation. On failure, retain the learner's turn locally for retry, offer text/choice support, and never invent an unheard reply. Microphone capture on a real phone also requires verifying the browser's secure-context and permission setup.

## 10. Implementation seams and scope

Proposed additions; these are not existing APIs:

| Layer | Extension |
|---|---|
| `desk/src/lib/library/english-syllabus.ts` | Original skill IDs, prerequisites, can-do rubrics, scenario eligibility and reviewed exemplars |
| `desk/src/lib/desk/conversation.ts` | Start, next turn, repair, coaching, replay, debrief; reuse the engine interface |
| `desk/src/lib/rules/english-conversation.ts` | Contract validation, support/evidence rules, age/theme controls and progression |
| `desk/src/lib/session/learners.ts` | Add namespaced English evidence and learning preferences with migration; preserve Math records |
| `desk/src/lib/session/store.ts` | Session/episode/turn IDs, scene state, voice status, active speaker, pending evidence, resume pointer |
| `desk/src/app/api/english/…` | Start / turn / coach / replay / finish; input limits, idempotent turn commits, cancellation, scoped learner identity |
| TV and phone surfaces | Reuse session updates and focus conventions; add a conversation stage and phone capture flow |

Keep learner and persistence imports server-side. Do not feed arbitrary raw transcripts into the existing plain memory field. Store explicit preferences and pedagogical observations, scoped to learner and subject; make them editable/deletable. Save no raw audio by default. Production recording/retention needs an explicit product decision. Reset clears the active session while leaving intentional learner progress intact; delete-profile clears the profile's learning data.

The current tense-marker resolver remains a narrow teaching aid. A marker such as “today” does not uniquely determine tense in every context; it must not become the universal conversation grader. The old “never give the corrected sentence” tutoring prompt also needs a deliberate exception: modelling a usable phrase is often the correct beginner rescue.

**First working slice:** one learner at a time; provisional onboarding; three skill families (repair, request, negotiate); one child adventure, one teen collaboration, and one adult practical scene; genuine phone speech capture and TV audio; one coaching/replay loop; persisted evidence; a simple map; a printable summary; real timeout and recognition-failure handling. Generated dialogue inside authored scene contracts.

**Next:** narration and relationship/friction families, interviews, explicitly selected adult date and de-escalation scenes, finer communication-style controls, due review in unfamiliar settings, and better measured audio feedback. The concept includes these scenes to evaluate the direction before backend implementation.

**Later:** family collaboration, teacher-authored goals, learner-created worlds, richer scene visuals, optional phone-only rehearsal. Avoid building a 3D world, social league, full course library, or pronunciation scoring before the core spoken loop earns its place.

## 11. What would make this design convincing

Primary outcome: can the learner accomplish a comparable communication task in a new scene with less support? Track that separately from session completion, minutes spoken, and return rate.

Pilot with elementary learners and guardians, teens, and adults including beginners. Observe sofa-distance readability, time to first spoken turn, unsolicited help needs, interruptions, recognition repair, replay uptake, and a delayed unfamiliar task. Compare teacher judgments with tutor evidence, especially acceptable alternative answers and register feedback. Investigate disagreement before scaling progression.

Release gates: no spoken-credit from taps or copied model phrases; uncertain audio cannot lower skill state; interruptions do not lose turns; retries do not double-count evidence; one learner's notes cannot enter another's session; age-restricted scenarios cannot be selected for children; generated partner speech stays within the scene and readable caption budget; progress survives a normal reset. Validate noisy-room speech and real device response times before increasing scenario breadth.

The central design question for testing is concrete: **Does replaying one meaningful moment help people speak more independently the next time?**
