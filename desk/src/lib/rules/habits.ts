/**
 * Habit detectors (Study Desk v2 T3, adult card D5): rules that find a writer's habits, so a planted habit and a proven
 * move are code's, not the model's. The twin plants a habit (D6) and checks it was planted by running its detector; a
 * Sitting (D7) calls a rule proven when the detector no longer fires in the changed paragraph. So every hit names its
 * sentences: { habit, n, para, quote }, `n` the splitSentences numbers (essay.ts, numbering runs on through the piece),
 * `para` the first sentence's paragraph (0 when the text has one), `quote` an exact slice of the text.
 *
 * English only, like style.ts: the word lists below are English, and a text with nothing English to read (under 15% of its
 * words common English function words) returns no hits. The lists are this file's own; style.ts's are private and not imported.
 * Pure: no model, no clock, no store. A detector never throws; a non-string gives no hits.
 *
 * Measured by tools/habits-rules-test.cjs on tools/habits-fixtures.cjs. The gate is zero false positives; a detector that
 * cannot reach it is out of SHIPPED (it stays in this file, and openHabits never sees it).
 */
import { splitSentences, type Sentence } from "./essay";
import type { StyleSheet } from "./style";

export type Habit = "vague-opener" | "hedge-stack" | "repeated-opener" | "long-run" | "filler" | "two-claims";
export interface HabitHit { habit: Habit; n: number[]; para: number; quote: string; }
/** The writer's own band: what styleSheet(theirTexts) measured. Only wps.p90 and the sentence count are read. */
export type Band = Pick<StyleSheet, "sentences"> & { wps: Pick<StyleSheet["wps"], "p90"> };

/** long-run reads nothing from a band measured on fewer sentences than this: a p90 of a handful of sentences is a guess. */
export const MIN_BAND_SENTENCES = 20;

const words = (t: string) => t.match(/[A-Za-z']+/g) ?? [];
const COMMON = new Set(["the", "and", "is", "are", "was", "to", "of", "a", "i", "it", "that", "in", "you", "this", "for", "we", "on", "be", "not", "have", "with", "he", "she", "they", "my", "but", "so", "do", "at", "as", "if", "me", "will", "can"]);
function isEnglish(text: string): boolean {
  const w = words(text).map((x) => x.toLowerCase());
  return w.length > 0 && w.filter((x) => COMMON.has(x)).length / w.length >= 0.15;
}

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
const firstWord = (s: string) => (words(s)[0] ?? "").toLowerCase();

/** A hit's quote: the original text from the start of its first sentence to the end of its last (a sentence's own text has its line breaks folded to spaces). */
function quoteOf(text: string, sentences: Sentence[]): string {
  const find = (s: Sentence, from: number): [number, number] | null => {
    const re = new RegExp(s.text.trim().split(/\s+/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"), "g");
    re.lastIndex = from;
    const m = re.exec(text);
    return m ? [m.index, m.index + m[0].length] : null;
  };
  const a = find(sentences[0], 0);
  const b = sentences.length === 1 ? a : find(sentences[sentences.length - 1], a ? a[1] : 0);
  return a && b ? text.slice(a[0], b[1]) : sentences[0].text;
}
const hit = (habit: Habit, text: string, ss: Sentence[]): HabitHit => ({ habit, n: ss.map((s) => s.n), para: ss[0].para ?? 0, quote: quoteOf(text, ss) });

// ---- (1) vague-opener ----
// Rule: a sentence that opens with "This" or "It" followed by a verb from the lists below, and that follows a sentence which
// ended with . ! or ? (so there is something for it to point back to: "This is Sam from accounts" after a greeting is not
// vague, nor is a text's first sentence). "This" + a noun ("This essay argues") is not vague. "It" + is/was/will (weather,
// time, "it is important that") is not in the list on purpose: only the verbs that refer back are.
const THIS_VERB = /^this\s+(?:is|was|are|were|shows|showed|means|meant|makes|made|leads|led|causes|caused|helps|affects|changes|gives|proves|suggests|tells|matters|has|had|does|did|can|could|will|would|should|must|also)\b/i;
const IT_VERB = /^it\s+(?:shows|showed|means|meant|makes|made|leads|led|causes|caused|helps|affects|changes|gives|proves|proved|suggests|tells|matters|also)\b/i;
function vagueOpener(text: string, ss: Sentence[]): HabitHit[] {
  const out: HabitHit[] = [];
  ss.forEach((s, i) => {
    if (i === 0 || !/[.!?]["'”’)\]]?$/.test(ss[i - 1].text)) return;
    if (THIS_VERB.test(s.text) || IT_VERB.test(s.text)) out.push(hit("vague-opener", text, [s]));
  });
  return out;
}

// ---- (2) hedge-stack ----
// Rule: two or more hedges in one sentence, counting each match of the list (maybe, perhaps, I think, I guess, I feel like,
// I suppose, kind of, sort of, probably, possibly, might, not sure, somewhat). One hedge is a writer being careful.
const HEDGES = /\b(?:maybe|perhaps|i think|i guess|i feel like|i suppose|kind of|sort of|probably|possibly|might|not sure|somewhat)\b/gi;
function hedgeStack(text: string, ss: Sentence[]): HabitHit[] {
  return ss.filter((s) => count(s.text, HEDGES) >= 2).map((s) => hit("hedge-stack", text, [s]));
}

// ---- (3) repeated-opener ----
// Rule: three or more sentences of one paragraph that open with the same first word (lowercased, punctuation off).
// Twice is a pattern of speech; three times is a habit. One hit per repeated word, n = those sentences.
function repeatedOpener(text: string, ss: Sentence[]): HabitHit[] {
  const out: HabitHit[] = [];
  for (const para of new Set(ss.map((s) => s.para ?? 0))) {
    const by = new Map<string, Sentence[]>();
    for (const s of ss.filter((x) => (x.para ?? 0) === para)) { const w = firstWord(s.text); if (w) by.set(w, [...(by.get(w) ?? []), s]); }
    for (const group of by.values()) if (group.length >= 3) out.push(hit("repeated-opener", text, group));
  }
  return out.sort((a, b) => a.n[0] - b.n[0]);
}

// ---- (4) long-run ----
// Rule: two or more neighbouring sentences of one paragraph, each longer than the writer's own 90th-percentile sentence
// (band.wps.p90, in words, as Sentence.words counts them). The band must come from styleSheet over the writer's own texts
// and from at least MIN_BAND_SENTENCES sentences; with no band, a thin one, or a p90 of 0 the detector returns nothing.
function longRun(text: string, ss: Sentence[], band?: Band | null): HabitHit[] {
  if (!band || !(band.sentences >= MIN_BAND_SENTENCES) || !(band.wps?.p90 > 0)) return [];
  const out: HabitHit[] = [];
  let run: Sentence[] = [];
  const flush = () => { if (run.length >= 2) out.push(hit("long-run", text, run)); run = []; };
  for (const s of ss) {
    if (s.words > band.wps.p90 && (!run.length || (run[0].para ?? 0) === (s.para ?? 0))) run.push(s);
    else { flush(); if (s.words > band.wps.p90) run.push(s); }
  }
  flush();
  return out;
}

// ---- (5) filler ----
// Rule: two or more filler words or phrases in one sentence (very, really, actually, basically, literally, just, quite,
// totally, utterly, simply, honestly, definitely, obviously, essentially, truly, in order to, at the end of the day,
// needless to say, to be honest, I mean). One "really" is a voice; a pile of them is padding.
const FILLERS = /\b(?:very|really|actually|basically|literally|just|quite|totally|utterly|simply|honestly|definitely|obviously|essentially|truly|in order to|at the end of the day|needless to say|to be honest|i mean)\b/gi;
function filler(text: string, ss: Sentence[]): HabitHit[] {
  return ss.filter((s) => count(s.text, FILLERS) >= 2).map((s) => hit("filler", text, [s]));
}

// ---- (6) two-claims ----
// Rule: a paragraph with two or more sentences that are claims. The first-pass role (essay.ts) tags every sentence that is
// not a link and not evidence a "claim", context and questions included, so the role alone would flag "We went to the museum.
// The tickets were free." This detector therefore asks more of a sentence: role claim, not a question, and a stance word
// (should, must, ought, better, worse, best, worst, greatest, wrong, bad, unfair, never, always, important, essential,
// unacceptable, useless, a waste). That is a narrowing of the card's "by the first-pass roles", stated here.
const STANCE = /\b(?:should|must|ought|better|worse|best|worst|greatest|wrong|bad|unfair|never|always|important|essential|unacceptable|useless|waste)\b/i;
function twoClaims(text: string, ss: Sentence[]): HabitHit[] {
  const out: HabitHit[] = [];
  for (const para of new Set(ss.map((s) => s.para ?? 0))) {
    const claims = ss.filter((s) => (s.para ?? 0) === para && s.role === "claim" && !/\?["'”’)\]]?$/.test(s.text) && STANCE.test(s.text));
    if (claims.length >= 2) out.push(hit("two-claims", text, claims));
  }
  return out;
}

const ALL: Record<Habit, (text: string, ss: Sentence[], band?: Band | null) => HabitHit[]> = {
  "vague-opener": vagueOpener, "hedge-stack": hedgeStack, "repeated-opener": repeatedOpener, "long-run": longRun, filler, "two-claims": twoClaims,
};
export const HABITS = Object.keys(ALL) as Habit[];

/** The detectors that passed the zero-false-positive gate (tools/habits-rules-test.cjs). Only these are ever acted on. */
export const SHIPPED: readonly Habit[] = ["vague-opener", "hedge-stack", "repeated-opener", "long-run", "filler", "two-claims"];

/** One detector's hits on a text. A non-string or a text with nothing English to read gives []. */
export function detect(habit: Habit, text: string, band?: Band | null): HabitHit[] {
  if (typeof text !== "string" || !isEnglish(text)) return [];
  return ALL[habit](text, splitSentences(text), band);
}

/** Every shipped detector's hits (or those of `only`), in the order of SHIPPED. */
export function detectAll(text: string, band?: Band | null, only: readonly Habit[] = SHIPPED): HabitHit[] {
  return only.flatMap((h) => detect(h, text, band));
}

/** The shipped habits seen in at least two different pieces, each with the ids of the pieces it was seen in (an id counts once). */
export function openHabits(pieces: { id: string; text: string }[], band?: Band | null, shipped: readonly Habit[] = SHIPPED): { habit: Habit; pieces: string[] }[] {
  const out: { habit: Habit; pieces: string[] }[] = [];
  for (const habit of shipped) {
    if (!(habit in ALL)) continue;
    const ids: string[] = [];
    for (const p of pieces) if (!ids.includes(p.id) && detect(habit, p.text, band).length) ids.push(p.id);
    if (ids.length >= 2) out.push({ habit, pieces: ids });
  }
  return out;
}
