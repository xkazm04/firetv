/**
 * Forensic essay analysis. Sentences are split, measured and given a first-pass role in code;
 * the model then judges through the chosen lens and returns verdicts anchored to sentence
 * numbers, so every highlight lands on a sentence that exists.
 */
import { text } from "../engines/text";
import { ANALYSIS_TYPES, cleanFix, numberedLines, paragraphCount, paragraphStats, revise, splitSentences, taught, type AnalysisType, type Sentence } from "../rules/essay";
import { playFor } from "../library/lessons.data";
import { addDigest, addHistory, recordWriting } from "../session/learners";
import { voiceOf, withManner } from "../rules/voice";
import type { EssayAnalysis, Verdict } from "../session/store";

/**
 * `fix` is optional and carries no length limits here on purpose: a verdict whose fix is too long, has no
 * slot or is the sentence rewritten loses the fix (cleanFix), never the whole reading.
 */
const SCHEMA = {
  type: "object",
  properties: {
    verdicts: { type: "array", items: { type: "object", properties: {
      n: { type: "integer" }, verdict: { type: "string", enum: ["strong", "faulty", "neutral"] }, note: { type: "string" },
      fix: { type: "object", properties: { move: { type: "string" }, pattern: { type: "string" } }, required: ["move", "pattern"] } },
      required: ["n", "verdict", "note"] } },
    summary: { type: "string" },
  },
  required: ["verdicts", "summary"],
};

/**
 * The withholding rules of an essay reading, in every voice: a reading comments, it never writes the sentence for the
 * learner, and a fix is a slotted template with none of their words. Both reading prompts below share these.
 */
export const NEVER_REWRITE = "Never rewrite their sentences for them.";
export const PATTERN_RULE =
  "A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts.";

type Lens = (typeof ANALYSIS_TYPES)[number];
type Voice = ReturnType<typeof voiceOf>;
const lensOf = (type: string): Lens => ANALYSIS_TYPES.find((t) => t.id === type) ?? ANALYSIS_TYPES[0];

/**
 * One model call: verdicts for `judged` (sentence numbers), read in the context of `sentences`. A paragraph reading
 * passes the same list twice; a piece passes the whole piece and one paragraph's numbers, so the Structure lens can see
 * the thesis while it judges a body paragraph. Verdicts are anchored by code: a number outside `judged` is dropped.
 */
async function judge(sentences: Sentence[], judged: Set<number>, lens: Lens, voice: Voice, focus?: { para: number; of: number }) {
  const stats = paragraphStats(sentences.filter((s) => judged.has(s.n)));
  const numbered = numberedLines(sentences), piece = paragraphCount(sentences) > 1;
  const ns = [...judged].sort((a, b) => a - b);
  const { json, provider } = await text<{ verdicts: EssayAnalysis["verdicts"]; summary: string }>({
    system: withManner(`You are a writing tutor for ${voice.who}. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `Give one verdict per sentence, by its number: 'strong' for something done well, 'faulty' for a real problem, 'neutral' otherwise. ` +
      `Each note is one short sentence a student can act on, no praise-padding. ${NEVER_REWRITE} ` +
      `For a 'faulty' verdict only, add a fix: 'move' names the technique in 2 to 6 words (for example "Concede, then turn it back"), ` +
      `and 'pattern' is a sentence frame with the content left as bracketed slots for the student to fill (for example "Although [the other side], [why your claim still holds]."). ` +
      `${PATTERN_RULE} ` +
      `Then one summary sentence. Plain text, to be read aloud.`, voice),
    prompt: `The student's ${piece ? `piece, ${paragraphCount(sentences)} paragraphs,` : "paragraph,"} sentence by sentence:\n${numbered}\n\n` +
      (focus ? `Judge only paragraph ${focus.para + 1} of ${focus.of}: sentences ${ns[0]} to ${ns.at(-1)}, one verdict each, in the context of the whole piece. The summary is about that paragraph.\n` : "") +
      `Counts: ${stats.sentences} sentences, ${stats.claims} first-pass claims, ${stats.evidence} evidence, ${stats.connectors} connectors, average ${stats.avgWords} words.`,
    schema: SCHEMA, model: "best",
  });
  // A highlight may only land on a sentence number that exists. Anything else the model returned —
  // a number off either end, or a `verdicts` that is not a list at all — is dropped, not shown.
  // A fix rides only on a faulty verdict, and only as a move plus a slotted pattern (rules/essay cleanFix);
  // anything else loses the fix and keeps the verdict.
  const byN = new Map(sentences.filter((s) => judged.has(s.n)).map((s) => [s.n, s.text]));
  const verdicts = (Array.isArray(json?.verdicts) ? json.verdicts : []).filter((v) => byN.has(v?.n)).map((v) => {
    const { fix, ...rest } = v;
    const clean = rest.verdict === "faulty" ? cleanFix(fix, byN.get(v.n)) : undefined;
    return clean ? { ...rest, fix: clean } : rest;
  });
  return { verdicts, summary: typeof json?.summary === "string" ? json.summary : "", provider };
}

/**
 * The reading happened, so the learner record says so — the same one-line episode Math Buddy writes after a marked
 * set, from counts the reading actually produced, never invented — and the lens's estimate takes it as one attempt.
 * A piece is one reading, however many paragraphs it has. A reading with no sentences in it is neither.
 */
function record(learnerId: string, lens: Lens, sentences: number, faulty: number, paragraphs = 1) {
  if (!sentences) return;
  addHistory(learnerId, {
    at: Date.now(), kind: "writing", label: lens.name,
    detail: `${faulty} of ${sentences} sentence${sentences === 1 ? "" : "s"} to fix${paragraphs > 1 ? `, ${paragraphs} paragraphs` : ""}`,
  });
  recordWriting(learnerId, lens.id, sentences, faulty);
  // the week's digest (Family W9, rules/digest): the lens and the two counts, never a sentence
  addDigest(learnerId, { at: Date.now(), kind: "essay", lens: lens.id, sentences, faulty });
}

/** `age` is the seated profile's; without one the reading speaks as it always has (rules/voice, the teen band). */
export async function analyseEssay(raw: string, type: AnalysisType, learnerId: string, age?: number): Promise<EssayAnalysis> {
  const sentences = splitSentences(raw);
  const stats = paragraphStats(sentences);
  const lens = lensOf(type);
  const { verdicts, summary, provider } = await judge(sentences, new Set(sentences.map((s) => s.n)), lens, voiceOf("essay", age));
  record(learnerId, lens, sentences.length, verdicts.filter((v) => v.verdict === "faulty").length);
  return { text: raw, type, sentences, stats, verdicts, summary, provider };
}

/**
 * A whole piece (v2 E1): one call per paragraph (owner default V2-O5: verdicts stay anchored, a failure loses one
 * paragraph, not the piece), each read with the whole piece as context. `onProgress` gets the reading so far after
 * every paragraph, so the TV's map fills in as they come back. A paragraph that fails is listed in `piece.failed` and
 * the rest still land; only a piece where every paragraph failed fails. Recorded once, as one reading.
 */
export async function analysePiece(raw: string, type: AnalysisType, learnerId: string, age: number | undefined,
  onProgress: (a: EssayAnalysis) => void = () => {}, pieceId?: string): Promise<EssayAnalysis> {
  const sentences = splitSentences(raw), lens = lensOf(type), voice = voiceOf("essay", age);
  const of = paragraphCount(sentences);
  const piece: NonNullable<EssayAnalysis["piece"]> = { paragraphs: of, read: [], failed: [], ...(pieceId ? { pieceId } : {}) };
  let verdicts: Verdict[] = [], provider: string | undefined, lastError: unknown;
  const summaries: string[] = [];
  const now = (): EssayAnalysis => ({ text: raw, type, sentences, stats: paragraphStats(sentences), verdicts, summary: pieceSummary(), provider, piece: { ...piece, read: [...piece.read], failed: [...piece.failed] } });
  const pieceSummary = () => {
    const faulty = verdicts.filter((v) => v.verdict === "faulty").length;
    const first = verdicts.find((v) => v.verdict === "faulty"), at = first ? sentences.find((s) => s.n === first.n)?.para : undefined;
    const head = `${faulty} of ${sentences.length} sentences to fix across ${of} paragraphs.`;
    return at !== undefined && summaries[at] ? `${head} Start with paragraph ${at + 1}: ${summaries[at]}` : head;
  };
  for (let para = 0; para < of; para++) {
    const judged = new Set(sentences.filter((s) => (s.para ?? 0) === para).map((s) => s.n));
    try {
      const r = await judge(sentences, judged, lens, voice, { para, of });
      verdicts = [...verdicts, ...r.verdicts]; summaries[para] = r.summary; provider = r.provider; piece.read.push(para);
    } catch (e) { lastError = e; piece.failed.push(para); }
    onProgress(now());
  }
  if (!piece.read.length) throw lastError ?? new Error("no paragraph of the piece came back");
  record(learnerId, lens, sentences.length, verdicts.filter((v) => v.verdict === "faulty").length, of);
  return now();
}

/** One verdict, for the one sentence a rewrite asks about. */
const VERDICT = SCHEMA.properties.verdicts;
const REVISE_SCHEMA = { type: "object", properties: { verdicts: VERDICT }, required: ["verdicts"] };
const KINDS = new Set(["strong", "faulty", "neutral"]);

/**
 * Sentence `n` rewritten by the learner, re-judged alone. rules/essay revise() puts the sentence in place (and
 * refuses what is not one new sentence, before any model call); the model is asked about sentence n only - in
 * its paragraph, through the reading's lens, against the move the page taught - and every other verdict is kept
 * by code, not asked again. The new verdict remembers the sentence it replaced (`was`, from the first reading).
 * Nothing is written to the learner record: the paragraph was read once, and a rewrite is not another reading.
 */
export async function reviseSentence(reading: EssayAnalysis, n: number, rewrite: string, age?: number): Promise<EssayAnalysis> {
  const voice = voiceOf("essay", age);
  const r = revise(reading, n, rewrite);
  if (!r.ok) throw new Error(r.error);
  const next = r.reading;
  const lens = lensOf(reading.type);
  const old = reading.sentences.find((s) => s.n === n)!, before = reading.verdicts.find((v) => v.n === n);
  const play = playFor(reading.type);
  const move = taught(before, { move: play.move, pattern: play.pattern })?.fix;
  const numbered = numberedLines(next.sentences);
  const { json, provider } = await text<{ verdicts: Verdict[] }>({
    system: withManner(`You are a writing tutor for ${voice.who}. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `The student has rewritten one sentence of their paragraph, sentence ${n}. Judge sentence ${n} alone, in the context of the paragraph, and give exactly one verdict, for sentence ${n}: ` +
      `'strong' if it now does its job, 'faulty' if the problem is still there, 'neutral' otherwise. Do not judge the other sentences. ` +
      `The note is one short sentence a student can act on, no praise-padding. ${NEVER_REWRITE} ` +
      `For a 'faulty' verdict only, add a fix: 'move' names the technique in 2 to 6 words, and 'pattern' is a sentence frame with the content left as bracketed slots. ` +
      `${PATTERN_RULE} Plain text, to be read aloud.`, voice),
    prompt: `The student's paragraph, sentence by sentence, with sentence ${n} as rewritten:\n${numbered}\n\n` +
      `Before the rewrite, sentence ${n} read: "${old.text}"` + (before ? ` (${before.verdict}: ${before.note})` : "") + `.\n` +
      (move ? `The move they were asked to make: ${move.move} (pattern: ${move.pattern}).\n` : "") +
      `Judge sentence ${n} alone.`,
    schema: REVISE_SCHEMA, model: "best",
  });
  // only the verdict for sentence n is read; one that is missing or not a verdict fails the run, it is never invented
  const got = (Array.isArray(json?.verdicts) ? json.verdicts : []).find((v) => v?.n === n);
  if (!got || !KINDS.has(got.verdict) || typeof got.note !== "string") throw new Error(`no verdict came back for sentence ${n}`);
  const fix = got.verdict === "faulty" ? cleanFix(got.fix, next.sentences.find((s) => s.n === n)!.text) : undefined;
  const was = before?.was ?? { text: old.text, verdict: before?.verdict ?? "neutral", ...(before?.fix ? { fix: before.fix } : {}) };
  const verdict: Verdict = { n, verdict: got.verdict, note: got.note, ...(fix ? { fix } : {}), was };
  const verdicts = next.sentences.flatMap((s) => (s.n === n ? [verdict] : reading.verdicts.filter((v) => v.n === s.n)));
  return { ...next, verdicts, provider };
}
