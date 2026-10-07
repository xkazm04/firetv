/**
 * A keyword backstop under the model's audience label. A generated topic used to be kept or dropped on the label
 * the model wrote on it; a romance premise labelled "all" reached a 13-year-old. The stricter of the words and the
 * label wins. Pure: no I/O, no model call.
 */
import type { Audience } from "./types";

const ADULT = /\b(?:dating|date\s+night|(?:first|second|third|next|romantic|blind)\s+dates?|(?:on|for)\s+a\s+date|romance|romantic|flirt\w*|boyfriends?|girlfriends?|kiss(?:es|ed|ing)?|alcohol\w*|beers?|wines?|drunk|drugs?|gambl\w*|casinos?|betting|bets?|sex|sexual\w*)\b/i;
const OLDER = /\b(?:job\s+interviews?|(?:disagreements?|conflicts?)\s+(?:at|with|in)\s+(?:work|a\s+colleague|my\s+boss|the\s+office)|(?:work|workplace|office)\s+(?:disagreements?|conflicts?)|(?:argue|argues|argued|arguing|disagree|disagrees|disagreed)\s+with\s+(?:a|my|the|their)\s+(?:colleague|coworker|co-worker|boss|manager)s?)\b/i;
const RANK: Record<Audience, number> = { all: 0, school: 0, older: 1, adult: 2 };

/** The audience a topic's words call for, never looser than its label. */
export function audienceOf(text: string, label: Audience): Audience {
  const found: Audience = ADULT.test(text) ? "adult" : OLDER.test(text) ? "older" : "all";
  return RANK[found] > RANK[label] ? found : label;
}
