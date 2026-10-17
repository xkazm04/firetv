/**
 * The style meter (v2 T1; adult plan A4, retargeted to short messages by owner decision S4: email and chat first). Pure.
 *
 * `styleSheet(texts)` measures how a person writes from their own messages, in code: sentence and message length,
 * openers, connectors, contractions, questions, exclamations, emoji, hedges, greetings and sign-offs, dashes, lowercase
 * starts. Every number is an integer (counts, per-mille rates, word lengths x10), because Twin Card 1.0 forbids
 * non-integers in a part (SPEC section 9: exact canonicalisation, no float formatter).
 *
 * `twinDims(sheet)` maps a sheet onto the card's eight dimensions (`twin-card.style/1`, 1 to 5, SPEC 5.1), honouring
 * the coherence rules. The scale is a summary, not the voice (SPEC 5.1): a card also carries exemplars.
 *
 * `styleDistance(a, b)` compares two sheets (0 = the same, larger = further); the twin probe (tools/twin-probe.cjs)
 * uses it. `copyRun` finds a run of k words copied from one text into another (a twin draft must never lift the
 * person's own sentences).
 *
 * Honest limits: English only; a person's humour and warmth are read from surface marks (emoji, "haha", thanks), which
 * miss dry wit and warmth in plain words. Code can say a draft sits near a person's measures, never that it sounds
 * like them; only people can say that.
 */
export interface StyleSheet {
  messages: number;
  sentences: number;
  /** words per sentence and per message: mean x10, median, 90th percentile */
  wps: { mean10: number; p50: number; p90: number };
  wpm: { mean10: number; p50: number; p90: number };
  /** per-mille rates: per sentence (questions, exclamations, connectors, hedges, dashes, lowercase starts) or per message */
  rates: { question: number; exclaim: number; connector: number; hedge: number; dash: number; lowerStart: number; contraction: number; emoji: number; laugh: number; greeting: number; signoff: number; thanks: number; formalWord: number; slang: number; list: number };
  /** the five most used sentence openers (lowercased first words), with their per-mille share */
  openers: { word: string; permille: number }[];
}

const DIMS = ["formality", "warmth", "humor", "energy", "length", "directness", "expressiveness", "detail"] as const;
export type Dim = (typeof DIMS)[number];
export type Dims = Record<Dim, 1 | 2 | 3 | 4 | 5>;

const CONNECTORS = /\b(because|therefore|however|although|so that|as a result|for example|but|since|whereas|which means|also|then)\b/gi;
const HEDGES = /\b(maybe|perhaps|i think|i guess|i feel like|kind of|sort of|probably|possibly|might|just wondering|if possible|would you mind|not sure)\b/gi;
const CONTRACTION = /\b\w+'(?:s|re|ve|ll|d|m|t)\b|\b(?:can't|won't|don't|isn't|aren't|didn't|doesn't|i'm|it's|that's)\b/gi;
const EMOJI = /\p{Extended_Pictographic}|:\)|:\(|:D|;\)|<3/gu;
const LAUGH = /\b(?:haha+|hehe+|lol|lmao|rofl)\b/gi;
const GREETING = /^(?:hi|hey|hello|dear|good (?:morning|afternoon|evening)|hiya|yo)\b/i;
const SIGNOFF = /\b(?:best(?: regards)?|kind regards|regards|cheers|thanks|thank you|sincerely|all the best|talk soon|speak soon|see you|bye)[,!.]?\s*(?:\n.*)?$/i;
const SIGNOFF_LINE = /^(?:best(?: regards)?|kind regards|warm regards|regards|cheers|thanks|thank you|sincerely|yours(?: sincerely| faithfully)?|all the best|talk soon|speak soon|see you|bye)\b/i;
const THANKS = /\b(?:thanks|thank you|thx|ty|grateful|appreciate)\b/gi;
const FORMAL = /\b(?:regarding|furthermore|moreover|therefore|kindly|sincerely|please find|hereby|accordingly|pursuant|attached|herewith|i would like to|we would like to)\b/gi;
const SLANG = /\b(?:gonna|wanna|gotta|kinda|sorta|yeah|yep|nope|ok|okay|cool|awesome|btw|tbh|imo|omg|u|ur)\b/gi;
const LIST = /^\s*(?:[-*•]|\d+[.)])\s+/m;

const WROTE_LINE = /^\s*(?:On\b.{0,200}\bwrote:|-{2,}\s*Original Message\s*-{2,}|Dne\b.{0,200}napsal\(a\)?:)\s*$/i;
/**
 * Only what the learner wrote: lines that start with ">" (a quoted reply) and everything from an "On ... wrote:" line
 * onward (the quoted thread under a reply) are dropped, so what other people wrote to her is neither measured nor
 * exported (L1-helena-46-EM5-3). A text that is only quotation comes back empty.
 */
export function ownText(text: string): string {
  const keep: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (WROTE_LINE.test(line)) break;
    if (/^\s*>/.test(line)) continue;
    keep.push(line);
  }
  return keep.join("\n").trim();
}
const words = (t: string) => t.match(/[\p{L}\p{N}']+/gu) ?? [];
/** Sentences: split at . ! ? (and line breaks), keeping the end mark; a message with none is one sentence. */
export function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter((s) => words(s).length > 0);
}
/**
 * A message without its frame: a greeting line ("Dear Anna,") at the top and the sign-off with the signature lines
 * under it ("Kind regards," then "Petr") at the bottom are measured by the greeting and signoff rates, not as sentences.
 * Line breaks would make each a sentence of one to three words and drag the medians to "headline" (L1-helena-46-EM5-3).
 * A message that is only a frame keeps it.
 */
export function bodyOf(text: string): string {
  const lines = text.trim().split("\n").map((l) => l.trim());
  if (lines.length > 1 && GREETING.test(lines[0]) && words(lines[0]).length <= 5 && !/[.!?]$/.test(lines[0])) lines.shift();
  for (let i = Math.max(1, lines.length - 3); i < lines.length; i++) {
    if (SIGNOFF_LINE.test(lines[i]) && words(lines[i]).length <= 5) { lines.length = i; break; }
  }
  const body = lines.join("\n");
  return words(body).length ? body : text;
}
/** A text's sentence lengths in words, measured as the sheet's wps is: sentencesOf, then this file's word count. */
export const sentenceWords = (text: string): number[] => sentencesOf(text).map((s) => words(s).length);
const pct = (xs: number[], q: number) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))]; };
const pm = (n: number, d: number) => (d ? Math.round((1000 * n) / d) : 0);
const count = (t: string, re: RegExp) => (t.match(re) ?? []).length;
const stats = (xs: number[]) => ({ mean10: xs.length ? Math.round((10 * xs.reduce((a, b) => a + b, 0)) / xs.length) : 0, p50: pct(xs, 0.5), p90: pct(xs, 0.9) });

export function styleSheet(texts: string[]): StyleSheet {
  const msgs = texts.filter((t) => typeof t === "string").map(ownText).filter((t) => words(t).length > 0);
  const sents = msgs.flatMap((m) => sentencesOf(bodyOf(m)));
  const all = msgs.join("\n");
  const openersCount = new Map<string, number>();
  for (const s of sents) { const w = words(s)[0]?.toLowerCase(); if (w) openersCount.set(w, (openersCount.get(w) ?? 0) + 1); }
  const openers = [...openersCount].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([word, n]) => ({ word, permille: pm(n, sents.length) }));
  const S = sents.length, M = msgs.length, W = words(all).length;
  return {
    messages: M, sentences: S,
    wps: stats(sents.map((s) => words(s).length)), wpm: stats(msgs.map((m) => words(m).length)),
    rates: {
      question: pm(sents.filter((s) => /\?\s*$/.test(s)).length, S), exclaim: pm(sents.filter((s) => /!\s*$/.test(s)).length, S),
      connector: pm(count(all, CONNECTORS), S), hedge: pm(count(all, HEDGES), S), dash: pm(count(all, /\s[-–—]\s|—/g), S),
      lowerStart: pm(sents.filter((s) => /^[a-z]/.test(s)).length, S), contraction: pm(count(all, CONTRACTION), W),
      emoji: pm(count(all, EMOJI), M), laugh: pm(count(all, LAUGH), M), greeting: pm(msgs.filter((m) => GREETING.test(m.trim())).length, M),
      signoff: pm(msgs.filter((m) => SIGNOFF.test(m.trim())).length, M), thanks: pm(count(all, THANKS), M),
      formalWord: pm(count(all, FORMAL), W), slang: pm(count(all, SLANG), W), list: pm(msgs.filter((m) => LIST.test(m)).length, M),
    },
    openers,
  };
}

const band = (v: number, cuts: [number, number, number, number]): 1 | 2 | 3 | 4 | 5 => (v < cuts[0] ? 1 : v < cuts[1] ? 2 : v < cuts[2] ? 3 : v < cuts[3] ? 4 : 5);

/** The eight dimensions (Twin Card 5.1), from a sheet. The cut points are the host's first guess, to tune on real writers. */
export function twinDims(s: StyleSheet): Dims {
  const r = s.rates;
  // formality: formal words up, greetings and sign-offs a little (alone they make a letter formal, never ceremonial); contractions, slang, lowercase starts and emoji down
  const formalScore = r.formalWord * 4 + r.greeting / 40 + r.signoff / 40 - r.contraction * 2 - r.slang * 3 - r.lowerStart / 4 - r.emoji / 5;
  let formality = band(formalScore, [-150, -40, 40, 150]);
  const warmth = band(r.thanks / 3 + r.emoji / 3 + r.greeting / 10 + r.exclaim / 4, [40, 120, 250, 450]);
  let humor = band(r.laugh + r.emoji / 3, [20, 80, 200, 400]);
  const energy = band(r.exclaim + r.emoji / 2, [40, 120, 250, 450]);
  const length = band(s.wpm.p50, [8, 25, 60, 150]);
  // directness runs blunt (1) to indirect (5), as the level words do (SPEC 5.1): more hedging reads more indirect
  const directness = band(r.hedge, [40, 100, 200, 350]);
  let expressiveness = band(r.emoji / 2 + r.exclaim / 2 + r.slang / 2 + r.laugh / 2, [30, 100, 220, 400]);
  const detail = band(s.wps.p50 * 10 + s.rates.connector / 2 + s.rates.list / 2, [80, 140, 220, 320]);
  // the coherence rules (SPEC 5.1): no formality >= 4 with expressiveness >= 4, no humor 5 with formality 5
  if (formality >= 4 && expressiveness >= 4) { if (formalScore > 150) expressiveness = 3; else formality = 3; }
  if (humor === 5 && formality === 5) humor = 4;
  return { formality, warmth, humor, energy, length, directness, expressiveness, detail };
}

/** How far apart two sheets are: a sum of normalised gaps over the measures that carry a voice (0 = the same). Integer. */
export function styleDistance(a: StyleSheet, b: StyleSheet): number {
  const rel = (x: number, y: number) => Math.round((1000 * Math.abs(x - y)) / Math.max(1, Math.abs(x), Math.abs(y)));
  const keys = Object.keys(a.rates) as (keyof StyleSheet["rates"])[];
  const rates = keys.reduce((sum, k) => sum + Math.round(Math.abs(a.rates[k] - b.rates[k]) / 4), 0);
  return rel(a.wps.p50, b.wps.p50) + rel(a.wpm.p50, b.wpm.p50) + rel(a.wps.p90, b.wps.p90) + rates;
}

/** Whether a text sits inside a sheet's measured bands: its message length and sentence length between the writer's own extremes, widened by a quarter. */
export function withinBands(s: StyleSheet, text: string): boolean {
  const one = styleSheet([text]);
  const lo = (x: number) => Math.floor(x * 0.75), hi = (x: number) => Math.ceil(x * 1.25);
  return one.wpm.p50 >= lo(Math.min(s.wpm.p50, s.wpm.p90)) && one.wpm.p50 <= hi(s.wpm.p90) && one.wps.p50 <= hi(s.wps.p90);
}

/** A run of `k` or more words from `source` that appears in `draft` (case and punctuation aside), or null. */
export function copyRun(source: string, draft: string, k = 8): string | null {
  const a = words(source).map((w) => w.toLowerCase()), b = ` ${words(draft).map((w) => w.toLowerCase()).join(" ")} `;
  for (let i = 0; i + k <= a.length; i++) { const run = a.slice(i, i + k).join(" "); if (b.includes(` ${run} `)) return run; }
  return null;
}

export { DIMS };
