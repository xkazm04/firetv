import type { Audience, Band } from "./types";

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
  const folded = fold(text), hit = (...lists: RegExp[]) => lists.some(re => re.test(text) || re.test(folded));
  // every list is read on the text as written and on the folded copy: a l33t spelling is never laxer than the plain one
  if (hit(NEVER, NEVER_MORE)) return null;
  if (hit(ADULT, ADULT_PHRASES, BAR, ADULT_MORE)) return "adult";
  return hit(OLDER, OLDER_PHRASES) ? "older" : "all";
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
 * it came, and innuendo and non-English stay on the prompt. `hold` (LG-56) holds the line to a beginner's band first
 * (bandLine); for a learner who is not an adult the line as written and the held line must both pass.
 */
export function partnerLine(reply: string, adult: boolean, hold?: BandHoldFor): string {
  const held = hold ? bandLine(reply, hold.band, hold.simpler, hold.answer) : reply;
  if (adult) return held;
  // the line as the model wrote it is judged first: a held line, or its simpler rung, never launders a stopped one
  return [reply, held].some(x => { const audience = keywordAudience(x); return audience === null || audience === "adult"; }) ? REDIRECT_LINE : held;
}

/**
 * LG-56: the band a beginner's partner line is held to (council-lite r2 value-1; LT-tomas-9-J4-1, LT-viktor-67-J3-1,
 * LT-petra-38-J4-1). The prompt asks an A1-A2 partner for short lines, and on the claude engine it still talked above
 * the band in every run. Code now counts what it can count: at most `sentences` sentences, at most `words` words in
 * each, at most one question, and at A1 no question in the past tense. Word frequency is not counted: "the most common
 * words" stays on the prompt.
 */
export const BAND_HOLD: Partial<Record<Band, BandHold>> = { A1: { words: 8, sentences: 2, turn: 8, present: true }, A2: { words: 12, sentences: 2 } };
/**
 * `present` (LG-5, recert-7 LT-viktor-67-J4-5): a question in the past tense ('What did you do at school?') is over the band.
 * `turn` (LG-5, recert-6 LT-tomas-9-J4-3): the whole line's words, so a reaction and a question ('Sleeping is nice! Where
 * does he sleep at night?') is over where each sentence alone fits; a line that answers the learner is not counted (`answer`).
 */
interface BandHold { words: number; sentences: number; turn?: number; present?: boolean }
/**
 * What partnerLine needs to hold a line to a band: the band, and the line's own simpler rung when the model gave one.
 * `answer`: the line answers the learner's own correctness question, or carries the recast of a slip said again, so its
 * statement is the point and the whole-line `turn` budget does not cut it away.
 */
export interface BandHoldFor { band: Band; simpler?: string; answer?: boolean }

const WORDS = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const sentencesOf = (text: string) => text.trim().split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const wordsIn = (text: string) => text.match(WORDS)?.length ?? 0;
const WH = new Set(["what", "where", "when", "who", "why", "how", "which"]);
const PAST_AUX = /\b(?:did|didn['’]t|was|wasn['’]t|were|weren['’]t)\b/i;
/** Irregular past forms code can read: the one list (plain.ts keepsTense reads it too). */
export const PAST_IRREGULAR: ReadonlySet<string> = new Set("went saw ate had made got took came said won ran found gave told thought bought left felt lost met drank swam wrote sang built caught brought began broke chose drove fell flew forgot heard kept knew sat slept spent stood taught threw wore".split(" "));
const NOT_PAST = new Set(["need", "feed", "speed", "bleed", "breed", "seed", "weed", "shed", "hundred", "naked", "wicked", "sacred"]);
const pastVerb = (w: string) => PAST_IRREGULAR.has(w) || (/^[a-z]{2,}ed$/.test(w) && !NOT_PAST.has(w));
/**
 * A question in the past tense, as code can tell it: a did/was/were question anywhere in it, or a wh-question whose verb,
 * in the first three words after the wh-word, is a past form ('What happened?', 'Who won?'). Statements are not read.
 */
export function pastQuestion(sentence: string): boolean {
  if (!sentence.trim().endsWith("?")) return false;
  if (PAST_AUX.test(sentence)) return true;
  const w = (sentence.toLowerCase().match(WORDS) ?? []), at = w.slice(0, 2).findIndex(x => WH.has(x));
  return at >= 0 && w.slice(at + 1, at + 4).some(pastVerb);
}
/**
 * How far a line is over its band: 0 when it fits. Each sentence, word and question past the limit counts one, at A1 each
 * past-tense question, and each word of the whole line past `turn` unless the line is an answer.
 */
function overBand(text: string, hold: BandHold, answer = false): number {
  const s = sentencesOf(text), questions = (text.match(/\?/g) ?? []).length;
  return Math.max(0, s.length - hold.sentences) + Math.max(0, questions - 1) + s.reduce((n, x) => n + Math.max(0, wordsIn(x) - hold.words), 0)
    + (hold.present ? s.filter(pastQuestion).length : 0) + (hold.turn && !answer ? Math.max(0, wordsIn(text) - hold.turn) : 0);
}
/**
 * Whether a line fits `band` as it stands (LG-5 recert-8): what bandLine leaves unchanged. help.ts holds the rescue ladder's
 * rungs and the scene's cue to it, so a cue offered as a reply is never above the band its partner line is held to.
 */
export function fitsBand(text: string, band: Band | undefined): boolean {
  const hold = band && BAND_HOLD[band];
  return !hold || overBand(text, hold) === 0;
}
/**
 * A partner line as a learner at `band` may hear it. B1 and up, or a line that fits: unchanged. Over the band: the line's
 * simpler rung (help.ts) when that fits; else the line cut to its first statement and its last question, in their
 * order, which keeps the reaction and the one question the scene needs, or the question alone when the pair is over the
 * whole-line budget and the question fits; else whichever of the cut and the rung is least over. Code never writes a
 * word of its own here: every kept sentence is the model's.
 */
export function bandLine(reply: string, band: Band, simpler?: string, answer = false): string {
  const hold = BAND_HOLD[band], over = (x: string) => overBand(x, hold!, answer);
  if (!hold || over(reply) === 0) return reply;
  const rung = simpler?.trim() ?? "";
  if (rung && over(rung) === 0) return rung;
  const s = sentencesOf(reply), question = [...s].reverse().find(x => x.endsWith("?")), statement = s.find(x => !x.endsWith("?"));
  const keep = s.filter(x => x === statement || x === question).filter(x => wordsIn(x) <= hold.words);
  const pair = keep.length ? keep.join(" ") : question ?? s[0] ?? reply;
  const cut = over(pair) > 0 && question && over(question) === 0 ? question : pair;
  return rung && over(rung) < over(cut) ? rung : cut;
}
