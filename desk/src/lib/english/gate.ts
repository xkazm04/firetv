import type { Audience } from "./types";

/**
 * The audience backstop (adult plan A1, its safety half; v2 decisions 2026-10-07 X4). A topic's audience is the model's
 * own label, and a label is only a claim: a romance premise labelled "all" passed `cleanTopic` and reached a
 * 13-year-old (probe, 2026-09-30). Code now reads the topic's words too, and the stricter of the two wins.
 *
 * - `audienceOf(text, label)`: the label, raised to "older" or "adult" when a keyword says so; `null` when the text
 *   hits the never-list, which refuses the topic at every age.
 * - The gate only ever narrows. An over-block ("a bar of chocolate" reads as a bar) costs a scene, never safety.
 * - Limits, known: English words plus a short Czech list; no spaced-out letters (k y s), homoglyphs or other languages; no synonyms beyond the lists; tone, subtle pressure and real people under a
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

/**
 * The first backstop's patterns (local 3ed215b8), kept whole beside the lists above so the merged gate is at least as
 * strict as either on every input: second/third/next dates, bets, and the workplace argue/disagree-with-the-boss
 * scenes the lists above do not name.
 */
const ADULT_PHRASES = /\b(?:dating|date\s+night|(?:first|second|third|next|romantic|blind)\s+dates?|(?:on|for)\s+a\s+date|romance|romantic|flirt\w*|boyfriends?|girlfriends?|kiss(?:es|ed|ing)?|alcohol\w*|beers?|wines?|drunk|drugs?|gambl\w*|casinos?|betting|bets?|sex|sexual\w*)\b/i;
const OLDER_PHRASES = /\b(?:job\s+interviews?|(?:disagreements?|conflicts?)\s+(?:at|with|in)\s+(?:work|a\s+colleague|my\s+boss|the\s+office)|(?:work|workplace|office)\s+(?:disagreements?|conflicts?)|(?:argue|argues|argued|arguing|disagree|disagrees|disagreed)\s+with\s+(?:a|my|the|their)\s+(?:colleague|coworker|co-worker|boss|manager)s?)\b/i;

/** "at the bar" is nightlife; "a bar of chocolate" is not. Kept apart so the one ambiguous word costs less. */
const BAR = /\b(?:at|to|in|into|inside|outside) (?:a|the) bar\b(?! (?:of|chart|graph))|\bbar crawl/i;

/**
 * UD-3: topics the lists above did not name. Each pattern is anchored on whole words, so "cut the cake", "smoke detector"
 * and "weed the garden" stay "all". Read on the text as written and on a folded copy (diacritics off; l33t digits and
 * symbols mapped back inside a word that also holds letters).
 */
const NEVER_MORE = /\b(?:porno\w*|hentai|xxx|kys|overdos(?:e|es|ed|ing)|cut(?:ting|s)? (?:myself|yourself|himself|herself|themselves)|hang(?:ing)? (?:myself|yourself)|slit(?:ting)? (?:my|your) wrists?)\b/i;
const ADULT_MORE = new RegExp(
  String.raw`\b(?:(?:smok(?:e|es|ed|ing)|buy(?:ing)?|sell(?:ing)?|roll(?:ing)?|want|got|get|score|some|bag of|stoned on) (?:some |a bit of |the )?(?:weed|marijuana|hash|hashish)` +
  String.raw`|smok(?:e|es|ed|ing) (?:pot|a joint|joints)|stoned|tequila|shots?(?= (?:at|of|with|in|and))|raves?|ale|lager|brandy|liquor|spliff` +
  // Czech (diacritics folded): pivo/piva/pivu/pivem, vino, vodka, kourit, cigareta, drogy, hulit, opit
  String.raw`|piv(?:o|a|u|em)|vin(?:o|a|u|em)|vodk(?:a|u|y|ou)|kourit|koureni|cigaret(?:a|u|y)|drog(?:a|u|y|ami)|hulit|opit|opily|alkohol\w*)\b`, "i");
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "@": "a", "$": "s", "!": "i" };
const fold = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[A-Za-z0-9@$!]+/g, (w) => (/[A-Za-z]/.test(w) && /[0-9@$!]/.test(w) ? w.replace(/[01345@$!]/g, (c) => LEET[c]) : w));


const RANK: Record<Audience, number> = { all: 0, school: 0, older: 1, adult: 2 };

/** The audience the words alone ask for: "adult", "older", "all"; `null` for the never-list. */
export function keywordAudience(text: string): Audience | null {
  const folded = fold(text);
  if (NEVER.test(text) || NEVER_MORE.test(text) || NEVER.test(folded) || NEVER_MORE.test(folded)) return null;
  if (ADULT.test(text) || ADULT_PHRASES.test(text) || BAR.test(text) || ADULT_MORE.test(text) || ADULT.test(folded) || ADULT_MORE.test(folded)) return "adult";
  return OLDER.test(text) || OLDER_PHRASES.test(text) ? "older" : "all";
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

/** The one line a partner says in place of a reply the gate stopped. Code-written, in scene, and the scene goes on. */
export const REDIRECT_LINE = "Let's keep to our practice here, so tell me more about what you need.";

/**
 * Whether a partner line may reach this learner (LG-20). The premise rule applied to the reply: for a learner who is not
 * an adult, or a desk in Family mode (`adult` false, from `adultContent`), a line on the never-list or the adult list is
 * never shown and never stored; the redirect takes its place. The gate only narrows: an adult learner's line passes as
 * it came, and innuendo and non-English stay on the prompt.
 */
export function partnerLine(reply: string, adult: boolean): string {
  if (adult) return reply;
  const audience = keywordAudience(reply);
  return audience === null || audience === "adult" ? REDIRECT_LINE : reply;
}
