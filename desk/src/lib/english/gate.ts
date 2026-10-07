import type { Audience } from "./types";

/**
 * The audience backstop (adult plan A1, its safety half; v2 decisions 2026-10-07 X4). A topic's audience is the model's
 * own label, and a label is only a claim: a romance premise labelled "all" passed `cleanTopic` and reached a
 * 13-year-old (probe, 2026-09-30). Code now reads the topic's words too, and the stricter of the two wins.
 *
 * - `audienceOf(text, label)`: the label, raised to "older" or "adult" when a keyword says so; `null` when the text
 *   hits the never-list, which refuses the topic at every age.
 * - The gate only ever narrows. An over-block ("a bar of chocolate" reads as a bar) costs a scene, never safety.
 * - Limits, known: English words only; no synonyms beyond the lists; tone, subtle pressure and real people under a
 *   made-up name cannot be read by a keyword. Those still rest on the prompt.
 *
 * A PERSON MUST READ THESE LISTS before a release, as with the band tables.
 */

/** Whole words, each with the usual English endings (date -> dates, dating, dated). */
const word = (stems: string[]) => new RegExp(`\\b(?:${stems.join("|")})(?:s|es|d|ed|ing|er|ers|y|ies|ie)?\\b`, "i");

/** Refused at every age: explicit sexual content, sexual violence, self-harm, graphic violence. */
const NEVER = word([
  "porn", "pornograph(?:y|ic)", "nude", "naked", "nsfw", "explicit sex", "sex scene", "have sex", "having sex",
  "rape", "raping", "sexual assault", "molest", "incest", "grooming", "child abuse",
  "suicide", "self[- ]harm", "kill (?:yourself|myself|himself|herself)", "torture", "behead", "gore", "mass shooting",
]);

/** Adults only (18+): romance and dating, alcohol, drugs, gambling, nightlife, tobacco. */
const ADULT = word([
  "(?:on|for|with) a date", "first date", "blind date", "dinner date", "date night", "a date with", "ask (?:him|her|them|someone|somebody) out", "dating", "romance", "romantic", "flirt", "kiss", "crush", "boyfriend", "girlfriend", "love interest",
  "sexy", "sexual", "sex", "seduc", "hook ?up", "one[- ]night stand", "tinder", "honeymoon", "lingerie",
  "alcohol", "alcoholic", "beer", "wine", "vodka", "whisk(?:e)?y", "rum", "gin", "cocktail", "champagne", "booze",
  "drunk", "tipsy", "hangover", "pub", "nightclub", "night ?club", "nightlife", "strip club", "bartender",
  "drug", "cannabis", "marijuana", "cocaine", "ecstasy",
  "gambl", "casino", "betting", "poker", "slot machine",
  "cigarette", "smoking", "smoker", "vape", "vaping", "tobacco",
]);

/** 15 and over: job interviews, money and work trouble, sharp conflict. */
const OLDER = word([
  "job interview", "interview for (?:a|the|this|my|your) (?:job|role|position)", "salary", "pay rise", "get fired",
  "got fired", "layoff", "laid off", "redundan(?:t|cy)", "mortgage", "landlord", "lawsuit", "divorce",
]);

/** "at the bar" is nightlife; "a bar of chocolate" is not. Kept apart so the one ambiguous word costs less. */
const BAR = /\b(?:at|to|in|into|inside|outside) (?:a|the) bar\b(?! (?:of|chart|graph))|\bbar crawl/i;

const RANK: Record<Audience, number> = { all: 0, school: 0, older: 1, adult: 2 };

/** The audience the words alone ask for: "adult", "older", "all"; `null` for the never-list. */
export function keywordAudience(text: string): Audience | null {
  if (NEVER.test(text)) return null;
  if (ADULT.test(text) || BAR.test(text)) return "adult";
  return OLDER.test(text) ? "older" : "all";
}

/**
 * The stricter of the model's label and the words. "school" stays "school" unless the words raise it (a school scene
 * about a date is an adult scene, not a school one). `null` refuses the topic.
 */
export function audienceOf(text: string, label: Audience): Audience | null {
  const words = keywordAudience(text);
  if (words === null) return null;
  return RANK[words] > RANK[label] ? words : label;
}

/** The words of a topic that the gate reads: everything a partner will be told to play, and everything shown. */
export const topicText = (t: { title: string; goal: string; why: string; partner: string; premise: string; cue: string }) =>
  [t.title, t.goal, t.why, t.partner, t.premise, t.cue].join(" \n ");
