/**
 * Speaking practice (v2 L2; owner decisions 2026-10-07 V2, L2, S3): one authored Linga scene per task shape of the A2
 * and B1 Speaking papers for Schools (lib/english/cambridge.ts SPEAKING_PARTS). Practice mode only: the partner is a
 * friendly practice partner, never an examiner; no timing, no marks, no pass or fail. The conversation, its coaching and
 * its evidence are the free scenes' own (conversation.ts): only the task's shape differs.
 *
 * No screen names an exam: every word here is plain ("Speaking practice"), because `claimAllowed()` is false until a
 * person has checked the map against the handbooks (cambridge.ts, HONEST LIMITS). `practice` links each scene to the
 * part it copies, for the coverage report and the tests, never for display.
 *
 * Audience "school": these are for school-age learners (the For Schools papers), the Family first (decision 5).
 * Kept apart from ENGLISH_SCENES so the free scenes, their art and their order stay as they are.
 */
import type { EnglishScene } from "./types";

export const SPEAKING_PRACTICE: EnglishScene[] = [
  { id: "sp-about-you", name: "Speaking practice: about you", goal: "Answer questions about yourself, then give one longer answer.", partner: "Alex · Practice partner", skill: "contact", audience: "school", minutes: "6–8",
    practice: { exam: "a2-key-schools", part: 1 },
    premise: "A practice partner (not an examiner) asks the learner short personal questions one at a time: name, where they live, school, daily life, what they like. After five or six, ask for one longer answer: \"Tell me something about your favourite place.\" Short answers are fine; praise nothing, mark nothing, never time anything.",
    cue: "Try: I live in… I go to… I really like… because…",
    quiz: { question: "Which answer says a little more?", options: ["Football.", "I play football on Saturdays because my friends are in the team."], correct: 1 } },
  { id: "sp-pictures", name: "Speaking practice: pictures on one topic", goal: "Say which things you like and why, and ask your partner.", partner: "Sam · Practice partner", skill: "relate", audience: "school", minutes: "6–8",
    practice: { exam: "a2-key-schools", part: 2 },
    premise: "Describe in words five things on one everyday topic (for example: places to go at the weekend, hobbies, ways to travel), as if pictures were on the table. Learner and partner take turns: say which they like or do not like and why, and ask each other. Then ask one follow-up question on the topic. A partner, not an examiner; no marks, no timing.",
    cue: "Try: I like this one because… Do you like it?",
    quiz: { question: "Which line asks your partner back?", options: ["What about you? Do you like going to the cinema?", "The cinema is on the left."], correct: 0 } },
  { id: "sp-then-and-next", name: "Speaking practice: then and next", goal: "Talk about something that happened and something you plan.", partner: "Robin · Practice partner", skill: "narrate", audience: "school", minutes: "8–10",
    practice: { exam: "b1-preliminary-schools", part: 1 },
    premise: "A practice partner (not an examiner) asks personal questions about daily routine, then the past (\"What did you do last weekend?\", \"Tell me about a trip you remember\") and the future (\"What are you going to do this summer?\"). Ask one follow-up on each answer. No marks, no timing.",
    cue: "Try: Last weekend I… Next summer I'm going to…",
    quiz: { question: "Which answer tells what happened?", options: ["Last Saturday we went to the lake and swam.", "I usually swim on Saturdays."], correct: 0 } },
  { id: "sp-one-photo", name: "Speaking practice: one photograph", goal: "Describe a photograph for about a minute: who, where, what is happening.", partner: "Kai · Practice partner", skill: "describe", audience: "school", minutes: "6–8",
    practice: { exam: "b1-preliminary-schools", part: 2 },
    premise: "A practice partner (not an examiner) describes, in two or three sentences, an everyday photograph (for example: a family cooking together, students on a school trip) and asks the learner to talk about it alone: who is there, where it is, what they are doing, how they feel. Wait for the learner to finish; then one short question. If a word is missing, help them say it another way (\"the thing you cook on\"). No marks, no timing.",
    cue: "Try: In this photo I can see… They are… It looks like…",
    quiz: { question: "Which sentence describes what is happening?", options: ["Two boys are carrying a tent up a hill.", "I went camping once."], correct: 0 } },
  { id: "sp-choose-together", name: "Speaking practice: choose together", goal: "Suggest, compare five options and agree on one with your partner.", partner: "Noa · Practice partner", skill: "negotiate", audience: "school", minutes: "8–10",
    practice: { exam: "b1-preliminary-schools", part: 3 },
    premise: "A situation with five options in words (for example: a class wants a present for a teacher who is leaving: a plant, a book, a photo album, a cake, a mug). Learner and partner talk about each option, make and answer suggestions, compare, and try to agree on the best one. Disagree politely at least once. A partner, not an examiner; no marks, no timing.",
    cue: "Try: What about…? I think … is better because… Shall we choose…?",
    quiz: { question: "Which line makes a suggestion?", options: ["Why don't we give her a plant?", "She is leaving on Friday."], correct: 0 } },
  { id: "sp-what-do-you-think", name: "Speaking practice: what do you think?", goal: "Give opinions and feelings, and ask about your partner's.", partner: "Mia · Practice partner", skill: "relate", audience: "school", minutes: "6–8",
    practice: { exam: "b1-preliminary-schools", part: 4 },
    premise: "Follow-up talk on the topic of the last choice (presents, celebrations, saying goodbye): opinions, preferences, habits, experiences and feelings (\"How do you feel when a friend moves away?\"). A practice partner, not an examiner: ask the learner and invite them to ask back. No marks, no timing.",
    cue: "Try: In my opinion… I feel… What do you think?",
    quiz: { question: "Which answer gives an opinion and a feeling?", options: ["I think small presents are best. I feel happy when someone remembers me.", "Presents are in the shop."], correct: 0 } },
];
