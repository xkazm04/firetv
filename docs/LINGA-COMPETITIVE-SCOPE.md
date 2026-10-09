# Linga against the conversation apps: what we take, what we decline

Scope decision record · 7 October 2026 · M4 goal 2 of the firetv plan · code read at `main` 28a18d1a

**For whom.** A parent and a child at home on the sofa. The phone is the instrument; the TV is the page they share.
Until the Fire TV hackathon (deadline 23 October) the surface that has to win is the web app in `desk/` on this
computer: the TV page in a browser, a phone paired to it. Anything marked MUST-HAVE has to land by **20 October**.

**How to read it.**

- **Competitor cells** say what the product's own help centre, legal pages or a hands-on review shows. *(claimed)*
  means only marketing says it: the product site, a company blog, a store listing, a press release or an investor
  letter. *(snippet)* means only a search-result excerpt could be read (the page is gone or blocked). Every cell ends
  with its source ids and the date it was checked; the ids resolve in section 5. Nothing was signed up for, paid for
  or installed. The quotes came through a page-reading tool; the ones a verdict rests on were fetched again and
  matched on 7 October.
- **Linga today** is read from the code, not from the design docs, as `desk/` path and line at 28a18d1a.
- **Verdicts** are about what Linga would take from the apps: **MUST-HAVE** by 10-20 (ranked in section 2),
  **LATER**, or **DECLINE**. Where Linga already has the feature, the verdict is DECLINE and says there is nothing
  to take.
- **No latency or quality figure appears without its source.** Linga has exactly one measured turn latency (25 Sep,
  commit f2beafe0). Nobody has timed how long the partner's voice takes to start.

## 0. The decision

None of the five apps puts the conversation on a shared screen. The conversation features of Duolingo, Speak,
Praktika and ELSA run on phones and tablets only, and Buddy.ai, the one built for children, says it "is not available
on laptops, desktops or smart TVs".
That is Linga's lead, and it counts only if four things hold on 20 October:

1. the child can speak from the phone;
2. a parent can trust what reaches the child;
3. the TV shows what was learned;
4. the wait between turns is known, and nothing in it is spent on avoidable taps.

Those are the four must-haves.

What we decline:

- pronunciation scoring;
- streaks, XP and leagues;
- talking over the partner by voice;
- playing back the child's own voice;
- a partner that remembers personal facts;
- a larger library of staff-written scenes.

What we put off:

- streamed speech, which needs spend;
- help in the child's own language, which needs a scope call;
- a parent gate, which the owner left out of Phase 1;
- a child's collection of places visited.

Everything else the apps offer, Linga already has: scenes the child chooses, live replies, a rescue ladder, coaching,
a second take, a level check, review and a certificate.

## 1. Feature by feature

Competitors: **Duolingo** (Video Call with Lily, and Roleplay), **Speak**, **Praktika**, **ELSA Speak**, and
**Buddy.ai**, a voice tutor built for children.

Packaging, for context: Video Call and Roleplay are Duolingo Max features, mobile only [D5 · 2026-10-07]. Duolingo's
Q2 2026 letter says most new Super subscribers now get Video Call too [D15 · 2026-10-07] *(claimed)*.

| Feature | Duolingo | Speak | Praktika | ELSA Speak | Buddy.ai (children) | Linga today | Verdict |
|---|---|---|---|---|---|---|---|
| **Time to the partner's reply; does speech stream** | No published figure. "Real-time, spontaneous chats" *(claimed)*. A reviewer: "Sometimes there are pauses between the time Lily speaks and the words are heard." [D1, D6 · 2026-10-07] | "Character responses now stream in sync with audio for a more natural, low-latency feel." No figure. "As fast or faster than a human partner" *(claimed)*. [S1, S2 · 2026-10-07] | No first-party figure. A vendor case study gives under 300 ms p50 for transcription only *(claimed)*. A reviewer finds replies quicker than most because each is split into two or three short messages. [P6, P3 · 2026-10-07] | No figure. The help centre says speech is processed on ELSA's servers "to provide accurate, real-time feedback" (pronunciation, not replies). [E1 · 2026-10-07] | No figure. The CEO calls Buddy's model "Safe, fast" *(claimed)*. No review measures lag. [B5 · 2026-10-07] | **Not streamed.** One CLI call per turn, read only when the process exits (`desk/src/lib/engines/text.ts:55-67`). With thinking off, a turn's model call took median 4.7 s, max 6.2 s, 0 timeouts in 6 runs on 25 Sep (commit f2beafe0; `desk/src/lib/engines/text.ts:27-31`). The voice starts after that: the TV then asks `/api/speak` for the whole line (`desk/src/english/useEnglishAudio.ts:24-26`), which has never been timed. Budget 90 s (`desk/src/lib/english/conversation.ts:216`). | **MUST-HAVE (MH-4)**: one tap to send a spoken reply, and the wait measured on every turn. Streamed speech: **LATER**, because it needs spend. On the sofa every turn waits, and a child loses the thread in silence. |
| **Interrupting the partner** | No barge-in by the learner found. Push-To-Talk "stops Lily from interrupting mid-sentence" *(claimed)*. [D2 · 2026-10-07] | "Tap or speak anytime to cut in like a real conversation." An interrupted turn loses Replay Audio and Translation. [S1 · 2026-10-07] | A reviewer: "You can't interrupt the AI tutor." The hands-free video-call mode takes turns. [P4, P1 · 2026-10-07] | No evidence found (help centre, blog). A 2023 beta announced "stop and ask the AI" *(claimed)*, not seen since. [E15 · 2026-10-07] | Turn-taking: "wait for Buddy's prompt before giving your answer. He only listens when he puts his ear to the screen." [B1 · 2026-10-07] | Tapping Speak a reply on the phone silences the TV. Capture blocks the spoken line (`desk/src/lib/english/view.ts:227`), and the audio hook cancels playback (`desk/src/english/useEnglishAudio.ts:7,27`). A reply still being prepared can be cancelled, not talked over (`desk/src/lib/english/turn.ts:45-46`). | **DECLINE** voice barge-in. An open microphone in a living room hears the parent and the TV, and a tap already stops the partner. Only Speak has it. |
| **Choosing a scene or roleplay** | Video Call: Lily opens, and "you can talk about anything you want" *(claimed)*. Roleplay: a scenario per character, "ordering a coffee with Lin". Staff write the scenarios *(claimed)*. [D1, D5, D4 · 2026-10-07] | Pick a character, or describe a scenario and get "a relevant background". [S1 · 2026-10-07] | Pick a tutor and a topic *(claimed)*. A reviewer counts about 140 topics and finds custom scenarios "very constrained". [P7, P5 · 2026-10-07] | "Choose from system-suggested dialogue contexts or create your own." [E2 · 2026-10-07] | A parent picks one of three levels, and the content runs in 16 "learning expeditions". No roleplay chosen by the child found. [B1 · 2026-10-07] | Eleven built-in situations, offered by age (`desk/src/lib/english/curriculum.ts:16-50,60-63`). A six-topic plan from the level check, each topic swappable, plus a topic in the learner's own words up to 400 characters (`desk/src/lib/english/check.ts:323-337`, `desk/src/lib/english/placement.ts:15`). | **DECLINE**: nothing to take. The child already picks or says the scene, and a bigger staff-written library adds reading, not talk. |
| **Live partner replies that follow what was said** | Driven by "a robust set of instructions" *(claimed)*. A reviewer: "the character will respond according to what you say". Lily brings up past calls. [D3, D8, D7 · 2026-10-07] | Free-form roleplay. Reviewers: it ends "nearly every response with a question". [S1, S4 · 2026-10-07] | A reviewer: off script, "the AI often guides the conversation back toward the lesson's objective". It remembers some facts across lessons. [P5, P3 · 2026-10-07] | "It's not scripted!" *(claimed)*. A reviewer saw it judge whether a reply fits the situation. [E12, E13 · 2026-10-07] | Replies were "generated offline and human-moderated" (review, Aug 2025). Open chat arrived in Nov 2025 *(claimed)*, inside "a session plan, allowed topics" *(claimed)*. [B6, B7, B5 · 2026-10-07] | Every partner line is generated from the scene contract, the last 18 turns and the reply as sent: "React specifically to the learner's meaning" (`desk/src/lib/english/conversation.ts:62,73,215`). | **DECLINE**: nothing to take. Lily's memory of personal facts is declined for children; Linga keeps teaching notes, not what the child reveals. |
| **In-the-moment help or rescue** | Ask Lily to "repeat herself or slow down", and captions for beginners *(claimed)*. Translations of Lily's lines and Roleplay hints (reviews). [D1, D2, D7, D9 · 2026-10-07] | On-demand hints, Translate on any turn, and a Typing Mode. [S1, S13 · 2026-10-07] | "Study in native language", the tutor's "Speaking speed", and grammar and vocabulary suggestions while practising. [P1 · 2026-10-07] | A light bulb shows suggested responses. Translation on the roleplay screen *(snippet)*. [E3, E4 · 2026-10-07] | Tap Sparky: "He'll give you the answer in English." The app is also available in eight other languages. [B1 · 2026-10-07] | A rescue ladder for each partner line: the line said more simply, what a word means, then a phrase starter; after that the scene's cue and a two-phrase choice (`desk/src/lib/english/help.ts:1-17`, `desk/src/lib/english/conversation.ts:168-184`). The line is always captioned on the TV. All help is in English. A slower voice exists only in the browser fallback (`desk/src/english/useEnglishAudio.ts:19`). | **LATER**: help in the child's own language, which four of the five offer as translation. It needs a home-language field on the learner, a scope call (section 2, after the cut). The parent on the sofa bridges until then. |
| **Coaching or feedback after a turn** | Video Call: "you won't hear her correct your grammar" *(claimed)*; she recasts with "You mean…" (review). Roleplay corrects each turn (review). [D1, D7, D8 · 2026-10-07] | Corrections, with a Retry that "returns you to that turn and opens listening automatically". [S1 · 2026-10-07] | "After each response, you get helpful tips and subtle corrections." A reviewer: "you have to click to see". [P2, P4 · 2026-10-07] | A rewrite, explanation and translation after each response *(snippet)*. Grammar is corrected only when ELSA is "at least 80% confident". [E5, E1 · 2026-10-07] | Repeat until mastered, with "frequent positive reinforcement" *(claimed)*. "The tutor will ask them to repeat them" (editorial). [B9, B10 · 2026-10-07] | Moments: the tutor may stop the scene for one fix, quoting the reply exactly, or for one word. They are spaced and capped, and rarer at A1–A2 (`desk/src/lib/english/conversation.ts:81-95,213`). Pause & coach on request, quoting the reply (`desk/src/lib/english/conversation.ts:230-232`). | **DECLINE**: nothing to take. A correction on every reply would stop the scene being a scene for a child. |
| **Replaying a moment** | Transcripts after a call, "usually, but not always". Lily's messages can be replayed (reviews). [D7, D6, D14 · 2026-10-07] | Replay Audio on each partner turn, and saved lines. A reviewer can listen back to their own messages. [S1, S12, P4 · 2026-10-07] | "You can play your tutor's version next to your own, and Try Again." Lessons are saved as PDFs. [P1 · 2026-10-07] | Replay ELSA's line *(snippet)*. Recordings are "stored so you can review past recordings". [E4, E1 · 2026-10-07] | No evidence found (FAQ, store listings, reviews). Before a parent consents, "Audio recordings are immediately deleted following the generation of each response." [B1, B2 · 2026-10-07] | Repeat audio plays the partner's last line again (`desk/src/lib/english/conversation.ts:167`, `desk/src/lib/english/view.ts:466`). Replay the moment asks a new question that practises the coached change (`desk/src/lib/english/conversation.ts:233-235`, `desk/src/lib/english/view.ts:392`). The transcript is on the phone (`desk/src/english/LingaPhone.tsx:81`). The child is never recorded: the app keeps no raw audio (`desk/src/english/LingaPhone.tsx:50`). | **DECLINE** playback of the child's own voice: it means storing a child's voice, which Linga does not do and Buddy.ai does not do by default. Linga's replay is a second take; Speak's Retry is the nearest. |
| **A recap or debrief** | "Actionable feedback after calls" *(claimed)*. A reviewer gets a transcript of "what you did well and what you could improve on"; another: "Many times they are not helpful." [D2, D7, D6 · 2026-10-07] | Takeaways "based on Free Talk or Roleplay lesson mistakes, shown at the End of Lesson screen". [S3 · 2026-10-07] | Conflicting: feedback "after every conversation" *(claimed)*, against a reviewer's "There is no end‑of‑lesson feedback summary". [P7, P5 · 2026-10-07] | A result in four parts after a roleplay *(snippet)*. "Detailed feedback on your performance" *(claimed)*. [E4, E14 · 2026-10-07] | Parents get an email "the day after every session with details about the new English words and phrases your child has learned". [B1 · 2026-10-07] | The TV recap shows counts, the skill's stepping stones and the next situation. A taught phrase the child used again appears as a before-and-after picture (`desk/src/lib/english/view.ts:393-406`). The evening's fixes and words are listed only on the phone (`desk/src/english/LingaPhone.tsx:232`). The parent's Sunday page names scenes and counts them, never a phrase (`desk/src/lib/rules/week.ts:15-17,193-196`). | **MUST-HAVE (MH-3)**. The TV is the page parent and child share, and it should show one thing learned tonight, as Speak's Takeaways and Buddy.ai's email to parents do. |
| **Pronunciation feedback** | Video Call and Roleplay "do not list a word-by-word pronunciation score" (review). [D14 · 2026-10-07] | A "Pronunciation Coach" appears in the plan table, English only. Phoneme feedback was "working on" in 2024 *(claimed)*. [S6 · 2026-10-07] | "An overall and per-word score". A reviewer: Talkpal's and Praktika's scores are such that "neither is reliable". [P1, P4 · 2026-10-07] | Scored: "Pronunciation: 70%, Intonation: 20%, Fluency: 10%" on scripted speech, and each word coloured. [E1 · 2026-10-07] | No scoring found. Recognition is trained on children's speech *(claimed)*. [B11 · 2026-10-07] | **Absent**, on purpose: "Never infer accent, pronunciation, emotion or personality from a transcript" (`desk/src/lib/english/conversation.ts:58`). | **DECLINE** by 10-20. It needs an audio-scoring engine (a paid API or a new model), reviewers distrust the scores, and the desk does not score speech (accepted gap AG-1). |
| **Placement or level** | An adaptive placement test (2018) *(claimed)*. The Duolingo Score maps to CEFR *(claimed)*. Video Call "needs to be at the appropriate CEFR level" *(claimed)*. [D12, D11, D3 · 2026-10-07] | No placement test found: the learner picks a level (review). The tutor "adapts to your level". [S5, S7 · 2026-10-07] | The learner picks a CEFR level at setup (review). "A0-A1-A2 level prompts" for beginners. [P5, P2 · 2026-10-07] | Choose a level on its recommendation. A 0–100 score mapped to CEFR. [E7, E1 · 2026-10-07] | A parent picks Pre A1, A1 or A2. [B1 · 2026-10-07] | A level check of about seven minutes: three open questions, then up to five tasks on a ladder that code runs, ending in an A1–C2 band with a confidence. A band can also be picked by hand (`desk/src/lib/english/placement.ts:9-10,57-121`, `desk/src/lib/english/check.ts:5,102`). | **DECLINE**: nothing to take. Only Duolingo and ELSA test at all; Linga's check is a conversation, and code decides the band. |
| **Progress, review and certificates** | The Duolingo Score *(claimed)*, and a lesson "to practice your mistakes" (Super). No course certificate found; the paid English Test is a separate product. [D11, D5 · 2026-10-07] | Smart Review, and lessons made from mistakes. The only certificate proves enrolment. [S6, S3, S11 · 2026-10-07] | A list of completed lessons, and review of saved words. No certificate found. [P1, P3 · 2026-10-07] | "A certificate upon finishing each course", which is "not a substitute for official tests". [E8, E1 · 2026-10-07] | A report after every session, and weekly stats *(claimed)*. No certificate found. [B1, B7 · 2026-10-07] | Progress rungs: Not tried → With help → On your own → Used elsewhere (`desk/src/lib/english/rules.ts:46-52`). A taught phrase comes back in a later scene, and code sees whether it is used (`desk/src/lib/english/review.ts:22-77`). A dry certificate issued by code (`desk/src/lib/english/cert.ts:1-22`), and a printable map (`desk/src/app/english/print/page.tsx`). | **DECLINE**: nothing to take. A number like the Duolingo Score breaks the desk's no-score rule, and Linga's review and certificate already match or pass the field. |
| **Child safety and parent controls** | Under-13s get username-only accounts, and their speech is not used for product improvement. Video Call audio "may be shared with AI vendors such as OpenAI and Google". Parents change restrictions by email. No age gate on Video Call found. [D10 · 2026-10-07] | "Not intended for children under the age of 13"; minors only "supervised by a parent". No parental controls found. [S8 · 2026-10-07] | The terms say 18+, the help centre 13+ (conflicting). Recordings are used "to fine tune our AI models". No parental controls found. [P8 · 2026-10-07] | 13+ in the terms, 16+ in the privacy notice. No COPPA statement or parent gate found. [E9 · 2026-10-07] | kidSAFE "+COPPA CERTIFIED" and "SAFE CERTIFIED" seals. Only a verified adult can make an account, behind a "Parental Gate". After consent, transcripts are stored and audio is kept up to 15 years. [B4, B2, B3 · 2026-10-07] | Scenes are gated by age (`desk/src/lib/english/curriculum.ts:60-63`). The partner may not propose or play dating, romance, alcohol, drugs, gambling or sexual content with a non-adult (`desk/src/lib/english/conversation.ts:61`). **Generated topics pass on the model's own audience label alone** (`desk/src/lib/english/check.ts:164,170,339`). No raw audio is kept (`desk/src/english/LingaPhone.tsx:50`), but browser speech may go to the browser's vendor (`desk/src/english/ReplyBox.tsx:64`). No parent lock in Phase 1 (`desk/src/lib/rules/mode.ts:5`). | **MUST-HAVE (MH-2)**: a keyword backstop under the model's label. A parent gate: **LATER** (owner decision D1 left it out of Phase 1). |
| **Two-screen or TV use** | No TV app. The Fire TV listing is Amazon's Silk browser on duolingo.com, and Max features are mobile only. [D13, D5 · 2026-10-07] | Phones and tablets only: "Speak is not available on desktop (PC)." [S9 · 2026-10-07] | Phones and tablets: "a desktop version is not available at the moment". [P9 · 2026-10-07] | Mobile only, and one device per learning session. [E10 · 2026-10-07] | "It is not available on laptops, desktops or smart TVs." [B1 · 2026-10-07] | The TV page and a paired phone share one session, pushed to both (`desk/src/lib/session/pairing.ts:8-10`, `desk/src/tv/useSession.ts:19`). A Desk display serves a PC monitor (`desk/src/app/tv/page.tsx:20-24`). **The phone is served over http** (`desk/src/lib/session/store.ts:302-304`), so its microphone is off over Wi-Fi (`desk/src/english/ReplyBox.tsx:35-36`). | **MUST-HAVE (MH-1)**. This is Linga's lead over all five, and it counts only once the child can speak from the phone. |
| **Rewards or a reason to return** | Calls have "an XP goal" *(claimed)*. Streaks, leagues and gems. [D2, D5 · 2026-10-07] | Streaks with a Streak Freeze, plus XP and weekly Leagues. [S10 · 2026-10-07] | Streaks, and daily speaking challenges (Premium). [P10 · 2026-10-07] | A daily reminder. Points and streaks *(snippet)*. [E11 · 2026-10-07] | Streak-based rewards and collectibles *(claimed)*. Suggested "15-30 minutes sessions three times a week". [B8, B1 · 2026-10-07] | The plan's next topic leads the home screen (`desk/src/lib/english/view.ts:281-285`), and a taught phrase comes back (`desk/src/lib/english/review.ts:22-41`). The certificate never decays and carries no count, score or streak (`desk/src/lib/english/cert.ts:19-22`). | **DECLINE** streaks, XP and leagues (the desk's standing rule, AG-2). **LATER**: a child's collection of places visited (conversation design §2). |

## 2. Must-haves by 20 October, ranked

Four, not five. Builders have 13 days for M4 and M5 together, and the fifth candidate (help in the child's own
language) needs a scope call first. It is listed after the cut.

### MH-1 · The child speaks from the phone · M

- **Gap.** Over Wi-Fi the phone opens `http://<lan-ip>:<port>/phone` (`desk/src/lib/session/store.ts:302-304`).
  Browser speech needs a secure context, so the phone shows "Voice needs HTTPS on a phone" and only typing works
  (`desk/src/english/ReplyBox.tsx:35-36`). All five apps are voice-first on the phone. The Adult plan's code check
  found the same on 30 Sep (finding 7, slice A8); nothing has changed since.
- **Smallest change.** Add an opt-in `DESK_HTTPS=1`:
  - `phoneUrl()` returns `https://`;
  - a `dev:https` script runs `next dev --webpack --experimental-https`, with a key and certificate that name the LAN
    address (`--experimental-https-key` and `--experimental-https-cert`, as the installed Next documents at
    `desk/node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md:72-75,338-354`).

  The pairing QR already reads `phoneUrl`. Recording on the phone and transcribing on the desk (`/api/listen`) is a
  later slice, not part of this change.
- **Files.** `desk/src/lib/session/store.ts` (`phoneUrl`), `desk/package.json` (the script).
- **Acceptance.**
  - Rule: rows in `tools/linga-rules-test.cjs`. After a reset with `DESK_HTTPS=1`, `getSession().phoneUrl` starts
    `https://`; without it, `http://`.
  - Browser step **"phone voice over Wi-Fi"**: on a real phone on the LAN, the Linga Talk panel shows *Speak a reply*
    (not the HTTPS note), and a spoken reply reaches the TV stored with mode `speech`.
- **Spend or scope.** No spend. It needs an operator act: the phone has to trust the certificate, either by
  installing the local CA or by accepting the browser's warning. Whether the warning path turns the microphone on in
  the operator's phone browser is unverified. Whether a real phone is in the 10-20 demo at all is in the questions.

### MH-2 · A child-safe topic gate that does not rest on the model's label · S

- **Gap.** A generated or own-words topic is kept or dropped by the audience the model writes on it
  (`desk/src/lib/english/check.ts:164,170,339`). The 30 Sep code check probed it: a romance premise labelled `all`
  passes for a 13-year-old (`docs/concepts/ADULT-MODE-TAKE-TWO.md`, "Honest limits"; Adult plan finding 4). The
  partner's prompt is the only other guard (`desk/src/lib/english/conversation.ts:61`). The one children's app in the
  field sells on a certified safety seal [B4].
- **Smallest change.** A new pure `desk/src/lib/english/gate.ts` with `audienceOf(text, label)`:
  - it reads a topic's title, goal and premise against keyword lists (adult: dating, romance, flirting, alcohol,
    drugs, gambling, sexual; older: job interview, sharp conflict);
  - the stricter of the keyword result and the model's label wins;
  - `check.ts` applies it in `pick` and again at `plan-agree`.

  This is the gate the Adult plan's slice A1 describes, without its pitch action.
- **Files.** `desk/src/lib/english/gate.ts` (new), `desk/src/lib/english/check.ts`.
- **Acceptance.** Rows in `tools/linga-rules-test.cjs`, run by `npm run test:rules`:
  - a table of at least 40 premises, including the probe's romance-as-`all`, which must come out `adult`;
  - with a stubbed engine answering that topic, a 12-year-old's plan never holds it and an adult's does.
- **Spend or scope.** None.

### MH-3 · The TV recap shows one thing learned tonight · S

- **Gap.** On the shared screen the recap is counts and stepping stones (`desk/src/lib/english/view.ts:393-406`). The
  evening's fixes and words appear only on the phone (`desk/src/english/LingaPhone.tsx:232`). In the 15 Sep LT run,
  all ten Characters met a recap that "count[s] activity without consolidating learning"
  (`uat/runs/2026-09-15-lt/SUMMARY.md`, backlog item 1). The beginners' re-run said it again for Klára and Petra
  (`uat/runs/2026-09-15-lt-recert2-beginners/`). Speak shows Takeaways at the end [S3], and Buddy.ai emails the
  parent the new words and phrases [B1].
- **Smallest change.** In the recap branch of `view.ts`: when no taught phrase came back and the rehearsal holds a
  moment or a coaching change, the hero becomes the comparison picture Linga already draws for the latest one. That is
  "You said" → "Try" (or "In English"), or the coach's before → after, with the counts as its data line.
  `LingaTV.tsx` already draws that hero with a data line (`desk/src/english/LingaTV.tsx:170-173`). No new component,
  no model call.
- **Files.** `desk/src/lib/english/view.ts`.
- **Acceptance.**
  - Rule: rows in `tools/linga-rules-test.cjs`. A finished rehearsal with one fix gives a `lingaView(s).hero` of kind
    `comparison` holding that moment's `said` and `better`. A phrase used again still gives "It came back". A
    rehearsal with neither keeps the stepping stones.
  - Browser step **E7 "recap"** below captures it.
- **Spend or scope.** None.

### MH-4 · From the child's last word to the partner's voice · S

- **Gap.** Speak streams its replies with the audio [S1], and the other four claim real time. In Linga a spoken
  reply goes like this:
  1. the child presses *Stop & review*;
  2. ticks "These are the words I said.";
  3. presses *Send reply* (`desk/src/english/ReplyBox.tsx:59,64-69`);
  4. one model call runs, median 4.7 s and max 6.2 s on 25 Sep (f2beafe0);
  5. the TV asks for the whole line to be synthesised (`desk/src/english/useEnglishAudio.ts:24-26`), a step nobody
     has timed.

  The design's target of about 2 s from send to voice (`docs/LINGA-CONVERSATION-DESIGN.md` §9) has never been
  measured.
- **Smallest change.**
  - **Owner's choice, 2026-10-07:** the tick stays, shown already ticked once the transcript shows, so a spoken
    reply is one tap after Stop. The child can untick it, which disables Send, and editing the words makes it a typed
    reply. This replaces the *Send what I said* button; nothing is sent unseen.
  - The browser run times every turn three ways:
    - send → the partner's line on the TV;
    - the model's own `responseMs` (already in `timings.json`);
    - line → the footer reading "Partner speaking" (`desk/src/english/LingaTV.tsx:82`, set at
      `desk/src/english/useEnglishAudio.ts:20,26`).
- **Files.** `desk/src/english/ReplyBox.tsx`, and outside `desk/`, `tools/linga-ui-test.cjs`.
- **Acceptance.** Browser step **E8 "turn timing"**: `timings.json` holds send → line, `modelMs` and line → voice
  for every turn of the M4 run, and the spoken turn goes with one tap after Stop. The rule that a spoken turn is
  stored as `speech` stays covered by `tools/linga-rules-test.cjs`, unchanged.
- **Spend or scope.** Closing the gap to streamed speech needs a streaming or faster engine, which is spend: the
  Adult plan's open question O7. That decision should follow the figures from E8. The one-tap send also folds a
  deliberate confirmation step into the send button, which is the owner's call.

### After the cut (the first candidate if scope allows)

- **Help in the child's own language.** Duolingo [D7], Speak [S1] and Praktika [P1] translate the partner's line or
  the lesson, and ELSA does on its roleplay screen [E4, snippet]. Buddy.ai has no translation, but its app runs in
  eight other languages [B1].
  - The smallest change would be a fourth rung on the ladder: the partner's line in the learner's home language,
    written in the same model call and never the answer. Files: `types.ts`, `rules.ts`, `conversation.ts`,
    `help.ts`, `view.ts`, `LingaPhone.tsx`. Effort M.
  - It needs a home-language field on the learner, which does not exist. The desk is English-only in Phase 1 (see
    `week.ts:18`).
  - Evidence: in the 15 Sep UAT, Viktor asked twice for Czech and Tomáš (9) got no easier task when confused. Both
    predate the English ladder of 23 Sep, which has not been re-measured.

## 3. M4 goal 1: the end-to-end run (not run here)

A browser run on this computer with the real model, through scene, live partner replies, coaching note, replay and
recap.

### What the run must show

| Step | What it must show |
|---|---|
| **E1 · Seat and pair** | An isolated desk with its own `DESK_DATA_DIR` (never `desk/data`). The TV page at `/tv?key=` in the Desk display, and the phone page paired with the QR's pin. |
| **E2 · Level** | A child profile (age 11, elementary) picks A2 by hand with *I'll pick my level*. A learner with no placement is offered the level check, not a scene (`desk/src/lib/english/view.ts:264-267`). |
| **E3 · Scene** | *Choose a situation* → an all-ages scene (The missing moon rover). The TV shows the partner's name and a generated opening line, and the footer reads "Partner speaking". |
| **E4 · Live partner replies** | Two replies, one typed and one spoken (capture, transcript shown, sent). Each gets a new partner line. A person reads the transcript and marks whether each line answers what was said. If a moment fires (the default coaching preference allows one, `conversation.ts:83`), the run takes it and goes back with *Back to the conversation*. |
| **E5 · Coaching note** | *Pause & coach*. The TV's "You said" is an exact piece of the reply; the server refuses anything else (`desk/src/lib/english/conversation.ts:231`). |
| **E6 · Replay** | *Replay the moment*. A new partner question appears under the tag "Try it again" (`desk/src/lib/english/view.ts:408`). |
| **E7 · Recap** | *Finish*. The TV recap appears, the phone lists the moments, and with MH-3 one learned thing is on the TV. |
| **E8 · Turn timing** | For each action: wall time from click to TV update, and the model's `responseMs`. With MH-4, also line → voice. |
| **E9 · Boundary** | Starting the adults-only scene for this child is refused with 403. The harness already checks this. |

### What today's code and the last measurement predict

- **Five model calls**: the opening, two turns, the coach and the replay, all with thinking off
  (`desk/src/lib/english/conversation.ts:35-37,144,216`).
- **The only measurement** of a turn call is median 4.7 s, max 6.2 s, 0 timeouts in 6 runs (f2beafe0, 25 Sep, a
  scripted booking scene on the CLI's fast model). The opening, coach and replay calls were not timed separately.
  - If they behave like turns, the five calls take about 24–31 s of model time (5 × 4.7 s to 5 × 6.2 s). That is an
    extrapolation, not a measurement.
  - The 9 Sep run, before thinking was switched off, took 17–52 s per operation and hit 60 s timeouts
    (`docs/LINGA-IMPLEMENTATION-PLAN.md`). Figures like those again would mean the switch is not reaching the CLI
    process (`desk/src/lib/engines/text.ts:32-34`).
- **Line → voice has no figure.** Without server audio inside 12 s, the TV falls back to the browser's own voice
  (`desk/src/english/useEnglishAudio.ts:25`).
- **The flow exists end to end on one command surface** (`desk/src/lib/english/conversation.ts:98-239`). The 9 Sep run
  completed it only with retries after timeouts.

### What blocks it

- **B1 · The harness is stale.**
  - `tools/linga-ui-test.cjs` clicks *Start talking* on a fresh learner's home. Since 15 Sep (bf2e0535) that home
    offers *Find my level* and *I'll pick my level* instead (`view.ts:264-267`), so the run stops at its first step.
  - It asserts that one typed reply leaves "repair" Not tried. Since W10 (06b3ea26) a typed reply counts as speech
    does (`desk/src/lib/english/rules.ts:32-38`), so that assertion now depends on what the model observes.
  - It sets coaching to "pauses", which turns moments off (`conversation.ts:83`), so E4's moment never happens.
  - Fix (S, `tools/` only): seat the level with `level-self`, assert progress as D4 has it, and keep moments on.
    This is outside this task's paths.
- **B2 · An isolated server.** In a worktree whose `desk/node_modules` is a junction, `next dev` needs `--webpack`
  and a seeded `DESK_DATA_DIR`, and Playwright comes from `tools/` (`tools/package.json`). These are the operator's
  own notes on this machine, not re-checked here. It is a live-model run, so it is never part of a gate.
- **B3 · The real model.** It needs the `claude` CLI on PATH and signed in (`desk/src/lib/engines/text.ts:24,76-80`).
  That is no new spend on the subscription, but the operator has to allow the live calls.
- **B4 · Audio.** A headless browser cannot hear, so the run records the footer's "Partner speaking" as the voice
  event, or it runs headed.
  - With neither Piper nor ElevenLabs configured, the TV speaks with the browser's voice
    (`desk/src/lib/engines/voice.ts:1-6`).
  - ElevenLabs is a paid API. On 9 Sep the speech endpoint returned MPEG audio, which only the ElevenLabs path
    produces (`desk/src/app/api/speak/route.ts:14-15`).
  - Piper's voice file has an open licence gate before any audio from it ships (`voice.ts:13-15`).
- **B5 · Speech in is simulated.** The harness fakes `SpeechRecognition`. That proves the flow, not a microphone; a
  real microphone on the phone over Wi-Fi waits on MH-1.

### Run of 2026-10-09

Two attempts of `tools/linga-ui-test.cjs` on an isolated desk (empty data directory outside every repo, the claude CLI on the
subscription, no voice). Evidence: `uat/runs/2026-10-09-linga-e-run/`. Attempt 1 stopped at the first page on a harness defect
(the nav to landing was overwritten by the phone's join; fixed, 4ecd22c7). Attempt 2 ran live to the recap and stopped on a
stale selector.

| Step | Verdict |
|---|---|
| E1 Seat and pair | pass |
| E2 Level | pass (A2 seated by hand, 75 ms) |
| E3 Scene | pass for the scene and the opening line; the footer never read "Partner speaking" (headless, no voice) |
| E4 Live replies | pass on lines (one typed, one simulated-spoken, each a new line); no moment fired |
| E5 Coaching note | pass ("You said" is the exact reply) |
| E6 Replay | pass (new question under "Try it again") |
| E7 Recap | the product reached the recap in 99 ms; the harness failed on `.linga-track` (line 135), which the recap no longer renders. The rest of the script (My map, print, Maths and Essay entrances) was not reached |
| E8 Timing | five model calls: modelMs median 9.96 s, max 11.58 s (opening 8.7, turns 11.6 and 10.7, coach 6.3, replay 10.0; 47.2 s in all). About twice the prediction (turn median 4.7 s, max 6.2 s; five calls 24-31 s). No sign of thinking reaching the CLI (no figure near 17-52 s, no timeout). Line to voice: null throughout |
| E9 Boundary | pass (403) |

Blockers: **B1** was the stale harness; it still needed one more fix (the recap selector, not made: two runs only), plus
the join race above. **B2** held (webpack and a seeded directory worked; the operator's notes were right). **B3** held
(the CLI answered, no spend). **B4** held: headless got no voice (`/api/speak` 503 with none configured) and the footer never
said "speaking". **B5** held: recognition was simulated.

Still owed: a real phone's microphone over Wi-Fi, heard audio, the owner's reading of the transcript (the builder's reading is in
the evidence folder), and one more harness run after the recap selector is fixed.

### Run 2 of 2026-10-09

Two more runs of `tools/linga-ui-test.cjs`, same isolated setup. Evidence: `uat/runs/2026-10-09-linga-e-run-2/`. The harness got
four fixes (the recap wait, a spoken line that fits the rover scene and carries a slip, screenshots, and the phone in its own
browser context for the print page). Run 1 of the pair stopped at the print page on that last defect; run 2 went through the recap
and stopped at the Maths entrance. `results.json` was not written (the harness writes it last).

| Step | Verdict |
|---|---|
| E1 Seat and pair, E2 Level, E3 Scene | pass (the footer never read "Partner speaking": headless, no voice) |
| E4 Live replies | pass; **a moment fired** after the spoken reply: a fix, `said` the learner's exact words ("Where you saw the rover last time?" to "Where did you see the rover last time?") |
| E5 Coaching note | pass; the praise rests on a premise the transcript holds (run 1's did not) |
| E6 Replay | pass (it asks the learner to say the line again rather than a new question) |
| E7 Recap | **pass**, drawn with no workaround ("1 spoken . 1 written replies . 1 moment to keep") |
| E8 Timing | modelMs median 13.3 s, max 19.5 s (run 1: 9.96 s and 11.58 s; prediction 4.7 s and 6.2 s); five calls, 68.8 s. The engine passes no effort or thinking flag (haiku, `MAX_THINKING_TOKENS=0`, `text.ts:46-53`) |
| E9 Boundary | pass (one 403) |
| After E7 | My map (8 chapters), the print page (8 rows, a one-page PDF) and mobile width pass; the **Maths entrance fails** (subject stayed `english` after Enter on the landing); the Essay entrance and the page-errors check were not reached. Cause undecided: harness or product |

Observations: the typed and spoken replies left no evidence row (only the picked phrase did), so every ability still reads "not
tried"; the replay line carries a "fuzzy robot voice" excuse that no voice made true.

Still owed: a real phone's microphone over Wi-Fi, heard audio, the owner's reading of both transcripts, and the Maths and Essay
entrances once the key press is explained.

## 4. Declined and deferred, in one place

| | What | Why, for the sofa |
|---|---|---|
| DECLINE | Pronunciation scores (ELSA, Praktika, Speak) | Needs an audio-scoring engine, likely paid. Reviewers distrust the scores. The desk does not score speech (AG-1). |
| DECLINE | Streaks, XP, leagues, gems (all five) | The desk's standing rule (AG-2). The certificate is dry on purpose (`cert.ts:19-22`). |
| DECLINE | Talking over the partner by voice (Speak) | An open microphone in a living room; a tap already silences the TV. |
| DECLINE | Playing back the child's own voice (Speak, Praktika, ELSA) | Means keeping a child's voice. Linga keeps none. |
| DECLINE | A partner who remembers personal facts across sessions (Duolingo, Praktika) | Children's privacy. Linga remembers teaching notes and taught phrases, not what the child reveals. |
| DECLINE | A large staff-written scenario library (Duolingo Roleplay, Praktika) | The child already chooses or says the scene. |
| LATER | Streamed or faster partner speech (Speak) | Spend: a streaming or faster engine, the Adult plan's O7. Decide on the E8 figures. |
| LATER | Help in the child's own language (four of five) | Needs a home-language field: a scope call. |
| LATER | A parent gate (Buddy.ai) | Owner decision D1 left the lock out of Phase 1. The Adult build brings it back. |
| LATER | A child's collection of places visited | In the conversation design (§2), not yet built. Comes after the four must-haves. |

## 5. Sources

All checked on **2026-10-07**, reading only. *Documented* means the product's help centre, legal pages or a hands-on
review. *Claimed* means marketing, a company blog, a store listing, a press release or an investor letter. Reviewer
bias is noted where the reviewer sells or promotes a rival. The date column is the page's own date where it shows one.

| Id | Source | Page date | Kind |
|---|---|---|---|
| D1 | Duolingo blog, Video Call: https://blog.duolingo.com/video-call | 24 Sep 2024 | claimed |
| D2 | Duolingo blog, product highlights: https://blog.duolingo.com/product-highlights/ | 10 Dec 2025 | claimed |
| D3 | Duolingo blog, AI and Video Call: https://blog.duolingo.com/ai-and-video-call/ | n/a | claimed |
| D4 | Duolingo blog, Duolingo Max: https://blog.duolingo.com/duolingo-max | n/a | claimed |
| D5 | Duolingo help centre (Max, Video Call, Roleplay, Super, streaks, leagues), read from https://www.duolingo.com/help/faq?relative_domains=1&ui_language=en | n/a | documented |
| D6 | Review, "Duolingo Max video calls": https://theowlandme.blog/2026/01/10/review-duolingo-max-video-calls/ | Jan 2026 | documented (hands-on) |
| D7 | Review, Duoplanet, Video Call: https://duoplanet.com/duolingo-video-call/ | 4 Oct 2025 | documented (hands-on) |
| D8 | Review, Duoplanet, Duolingo Max: https://duoplanet.com/duolingo-max-review/ | n/a | documented (hands-on) |
| D9 | Review, Duoplanet, Practice Hub: https://duoplanet.com/duolingo-practice-hub/ | Nov 2024 | documented (hands-on) |
| D10 | Duolingo privacy policy: https://www.duolingo.com/privacy | rev. 26 May 2026 | documented |
| D11 | Duolingo blog, Duolingo Score: https://blog.duolingo.com/duolingo-score/ | Oct 2024 | claimed |
| D12 | Duolingo blog, placement test: https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/ | 2018 | claimed |
| D13 | Amazon Appstore listing (Silk wrapper, developed by Amazon): https://www.amazon.com/Duolingo-Learn-Languages-Free/dp/B00F8L2VO4 | n/a | documented |
| D14 | Review, Copycat Café (sells a rival app): https://copycatcafe.com/blog/duolingo-max | 30 Sep 2026 | documented (hands-on, biased) |
| D15 | Duolingo Q2 2026 shareholder letter: https://www.sec.gov/Archives/edgar/data/1562088/000162828026053299/q2fy26duolingo6-30x26share.htm | Aug 2026 | claimed |
| S1 | Speak help, Free Talk & Immersive Roleplay: https://help.speak.com/en/articles/13182402-free-talk-immersive-roleplay | 18 Dec 2025 | documented |
| S2 | Speak blog, live roleplays: https://www.speak.com/blog/live-roleplays | 1 Oct 2024 | claimed |
| S3 | Speak help, Made For You lessons and Takeaways: https://help.speak.com/en/articles/11565779-what-are-made-for-you-custom-lessons | 18 Dec 2025 | documented |
| S4 | Review, LanguaTalk (sells Langua): https://languatalk.com/blog/speak-app-review/ | 19 Feb 2026 | documented (hands-on, biased) |
| S5 | Review, Lingtuitive (promotes Langua): https://lingtuitive.com/blog/speak-review | Sep 2026 | documented (hands-on, biased) |
| S6 | Speak help, Premium vs Premium Plus: https://help.speak.com/en/articles/5358417-what-s-the-difference-between-premium-and-premium-plus | 7 Nov 2025 | documented |
| S7 | Speak help, Speak Tutor: https://help.speak.com/en/articles/11396739-what-is-speak-tutor | n/a | documented |
| S8 | Speak privacy and terms: https://www.speak.com/privacy and https://www.speak.com/terms | privacy "06/05/2026"; terms 7 Dec 2023 | documented |
| S9 | Speak help, devices: https://help.speak.com/en/articles/9334794-what-devices-and-operating-systems-does-the-speak-app-support | n/a | documented |
| S10 | Speak help, streaks and leagues: https://help.speak.com/en/articles/11645358-streak-101-how-streaks-work-how-to-keep-them and https://help.speak.com/en/articles/12554257-what-are-leagues | n/a | documented |
| S11 | Speak help, enrollment certificate: https://help.speak.com/en/articles/5358765-how-can-i-get-my-enrollment-certificate | n/a | documented |
| S12 | Speak help, saving lines: https://help.speak.com/en/articles/7969167-how-can-i-save-lines-and-words | n/a | documented |
| S13 | Speak help, hands-free and typing mode: https://help.speak.com/en/articles/7969186-what-are-hands-free-mode-and-i-can-t-speak-mode | n/a | documented |
| P1 | Praktika help, learning process: https://intercom.help/praktika-ai/en/articles/10707916-learning-process | 30 Jul 2026 | documented |
| P2 | Praktika help, feedback features: https://intercom.help/praktika-ai/en/articles/11684894-feedback-features | 19 Jul 2026 | documented |
| P3 | Review, Lingtuitive, Praktika (promotes Langua): https://lingtuitive.com/blog/praktika-review | 18 Sep 2026 | documented (hands-on, biased) |
| P4 | Review, Lingtuitive, best AI speaking apps (promotes Langua): https://lingtuitive.com/blog/best-ai-speaking-apps | 13 Mar 2026, updated 25 Sep 2026 | documented (hands-on, biased) |
| P5 | Review, LanguaTalk, Praktika (sells Langua): https://languatalk.com/blog/praktika-review/ | 23 Jun 2026 | documented (hands-on, biased) |
| P6 | Baseten case study (vendor): https://www.baseten.co/resources/customers/praktika/ | n/a | claimed |
| P7 | Praktika App Store listing: https://apps.apple.com/us/app/praktika-ai-language-tutor/id1624701477 | n/a | claimed |
| P8 | Praktika age policy, terms and privacy: https://intercom.help/praktika-ai/en/articles/12009630-who-can-use-praktika-is-there-an-age-limit, https://praktika.ai/terms, https://praktika.ai/privacy | terms 10 Aug 2026 | documented |
| P9 | Praktika help, devices: https://intercom.help/praktika-ai/en/articles/12009172-can-i-use-praktika-on-my-phone-tablet-and-laptop | 8 Jul 2026 | documented |
| P10 | Praktika help, streaks and premium: https://intercom.help/praktika-ai/en/articles/12008344-i-suddenly-lost-my-streak-or-progress-in-the-app and https://intercom.help/praktika-ai/en/articles/11684862-pricing-subscription-transparency | n/a | documented |
| E1 | ELSA help, speech analysis FAQ: https://app.pilotpm.ai/help/elsa-speak/s/school/elsa-school-admins-teachers/faq-about-elsas-speech-analysis-technology | 4 Aug 2026 | documented |
| E2 | ELSA FAQ, ELSA AI: https://elsaspeak.com/en/faqs/elsa-ai-feature | n/a | documented |
| E3 | Apple App Store editorial on ELSA roleplays: https://apps.apple.com/ph/iphone/story/id1745623441 | n/a | documented |
| E4 | ELSA help, AI chats and roleplays (page now 404; search excerpt only): https://elsanow.freshdesk.com/en/support/solutions/articles/31000176390-ai-chats-ai-roleplays | n/a | snippet |
| E5 | ELSA help, real-time feedback for AI conversations (page now 404; search excerpt only): https://elsanow.freshdesk.com/en/support/solutions/articles/31000177727-real-time-feedback-for-ai-conversations | n/a | snippet |
| E7 | ELSA help, getting started: https://app.pilotpm.ai/help/elsa-speak/using-elsa/how-to-get-started-with-elsa | n/a | documented |
| E8 | ELSA FAQ, certificate courses: https://elsaspeak.com/en/faqs/certificate-courses/ | n/a | documented |
| E9 | ELSA terms and privacy: https://elsaspeak.com/en/terms/ and https://elsaspeak.com/en/privacy/ | 26 Apr 2022; Mar 2025 | documented |
| E10 | ELSA help, computer or browser, and multiple devices: https://app.pilotpm.ai/help/elsa-speak/using-elsa/can-i-use-elsa-on-a-computer-or-web-browser and https://app.pilotpm.ai/help/elsa-speak/using-elsa/using-elsa-on-multiple-devices | 16 Jul 2026 | documented |
| E11 | ELSA FAQ, daily reminders: https://elsaspeak.com/en/faqs/how-can-i-set-up-daily-learning-reminders | n/a | documented |
| E12 | ELSA blog, global launch of ELSA AI: https://blog.elsaspeak.com/en/announcing-global-launch-elsa-ai/ | 12 Sep 2023 | claimed |
| E13 | Review, FluentU: https://www.fluentu.com/blog/reviews/elsa-speak/ | Jul 2024 | documented (hands-on) |
| E14 | ELSA AI page: https://elsaspeak.com/en/ai/ | n/a | claimed |
| E15 | ELSA blog, voice AI tutor beta: https://blog.elsaspeak.com/en/elsa-voice-ai-tutor-generative-ai/ | 2023 | claimed |
| B1 | Buddy.ai FAQ: https://buddy.ai/en/faq | n/a | documented |
| B2 | Buddy.ai privacy policy: https://buddy.ai/en/privacy | 10 Aug 2026 | documented |
| B3 | Buddy.ai safety policy: https://buddy.ai/en/safety | n/a | documented |
| B4 | kidSAFE member listing: https://kidsafe.com/member/2245 | member since 2024 | documented |
| B5 | Unite.ai, Buddy.ai speech recognition (CEO quoted): https://www.unite.ai/buddy-ai-children-language-learning-speech-recognition/ | 18 May 2026 | claimed |
| B6 | Review, Educational App Store: https://www.educationalappstore.com/app/buddy-ai-early-learning-games | 15 Aug 2025 | documented |
| B7 | Buddy.ai App Store listing and version history: https://apps.apple.com/us/app/buddy-ai-kids-learning-games/id1255783056 | n/a | claimed |
| B8 | Buddy.ai Google Play text, read from a mirror (Play loaded truncated): https://buddy-english-for-kids.apk.dog/ | n/a | claimed |
| B9 | Buddy.ai English for kids page: https://buddy.ai/en/english-for-kids | n/a | claimed |
| B10 | Uptodown editorial: https://buddy-ai-english-for-kids.en.uptodown.com/android | n/a | documented |
| B11 | EdTech Digest on Buddy.ai: https://www.edtechdigest.com/2025/04/23/buddy-ai/ | 23 Apr 2025 | claimed |

Linga's own sources:

- the code at 28a18d1a (paths in the table);
- commit f2beafe0, the 25 Sep thinking-off A/B: 6 runs, turn median 4.7 s, max 6.2 s;
- `docs/LINGA-IMPLEMENTATION-PLAN.md`, the 9 Sep record: 17–52 s operations and 60 s timeouts;
- `docs/concepts/ADULT-MODE-TAKE-TWO.md` and `docs/concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md`: the audience-label
  probe, HTTPS for the phone, O7;
- `uat/runs/2026-09-15-lt/SUMMARY.md` and `uat/accepted-gaps.md`.
