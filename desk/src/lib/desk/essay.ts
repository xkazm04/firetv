/**
 * Forensic essay analysis. Sentences are split, measured and given a first-pass role in code;
 * the model then observes through the chosen lens (the job a sentence does, the side it takes, the support it gives,
 * a word it leans on) and returns observations anchored to sentence numbers. It never gives a verdict: rules/essay
 * decideVerdicts decides strong, faulty and neutral from those observations and the text, so every highlight lands on
 * a sentence that exists and a mastery verdict is never a prompt's mood.
 */
import { text } from "../engines/text";
import { ANALYSIS_TYPES, contextObservations, decideVerdicts, ISSUE_KINDS, JOBS, numberedLines, observationOk, paragraphCount, paragraphStats, revise, SIDES, splitSentences, SUPPORTS, taught, type AnalysisType, type Sentence } from "../rules/essay";
import { playFor } from "../library/lessons.data";
import { addDigest, addHistory, getLearner, recordWriting, saveLearner } from "../session/learners";
import { voiceOf, withManner } from "../rules/voice";
import type { EssayAnalysis, Verdict } from "../session/store";

type Lens = (typeof ANALYSIS_TYPES)[number];

/**
 * `fix` is optional and carries no length limits here on purpose: a fix that is too long, has no slot or is the
 * sentence rewritten loses the fix (cleanFix), never the whole reading. There is no verdict field: code decides
 * those (rules/essay decideVerdicts). What is observed depends on the lens.
 */
const FIX = { type: "object", properties: { move: { type: "string" }, pattern: { type: "string" } }, required: ["move", "pattern"] };
const OBSERVED: Record<string, Record<string, unknown>> = {
  structure: { job: { type: "string", enum: [...JOBS] } },
  argument: { side: { type: "string", enum: [...SIDES] }, turnsBack: { type: "boolean" } },
  evidence: { support: { type: "string", enum: [...SUPPORTS] } },
  language: { issues: { type: "array", items: { type: "object", properties: { kind: { type: "string", enum: [...ISSUE_KINDS] }, word: { type: "string" } }, required: ["kind", "word"] } } },
};
const OBSERVE: Record<string, string> = {
  structure: "For each sentence, report the job it does: job is claim, evidence, link, context or none.",
  argument: "For each sentence, report the side it takes: side is pushes (for the paragraph's claim), against, wanders or neutral; turnsBack is true when a sentence on the other side turns back to the claim.",
  evidence: "For each sentence, report the support it gives: support is checkable (a number, a source or an example a reader could check), opinion (only asserts) or context.",
  language: "For each sentence, list its issues: each is {kind: vague or repeated, word: the exact word as it is written in the sentence}. Report no issue for a sentence that has none; the desk counts length itself.",
};
const observedOf = (lens: Lens) => OBSERVED[lens.id] ?? OBSERVED.structure;
const schemaFor = (lens: Lens) => ({
  type: "object",
  properties: {
    observations: { type: "array", items: { type: "object", properties: { n: { type: "integer" }, ...observedOf(lens), note: { type: "string" }, fix: FIX }, required: ["n", "note"] } },
    summary: { type: "string" },
  },
  required: ["observations", "summary"],
});

/**
 * The withholding rules of an essay reading, in every voice: a reading comments, it never writes the sentence for the
 * learner, and a fix is a slotted template with none of their words. Both reading prompts below share these.
 */
export const NEVER_REWRITE = "Never rewrite their sentences for them.";
export const PATTERN_RULE =
  "A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts.";

type Voice = ReturnType<typeof voiceOf>;
const lensOf = (type: string): Lens => ANALYSIS_TYPES.find((t) => t.id === type) ?? ANALYSIS_TYPES[0];

/**
 * One model call: observations for `judged` (sentence numbers), read in the context of `sentences`, and the verdicts
 * code decides from them. A paragraph reading passes the same list twice; a piece passes the whole piece and one
 * paragraph's numbers, so the Structure lens can see the thesis while it judges a body paragraph. Anchored by code:
 * an observation for a number outside `judged` is dropped, and the model is never asked for a verdict.
 */
async function judge(sentences: Sentence[], judged: Set<number>, lens: Lens, voice: Voice, focus?: { para: number; of: number }) {
  const stats = paragraphStats(sentences.filter((s) => judged.has(s.n)));
  const numbered = numberedLines(sentences), piece = paragraphCount(sentences) > 1;
  const ns = [...judged].sort((a, b) => a - b);
  const { json, provider } = await text<{ observations: Record<string, unknown>[]; summary: string }>({
    system: withManner(`You are a writing tutor for ${voice.who}. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `Observe each sentence by its number and report only what you see; the desk decides what is done well and what needs fixing. ` +
      `${OBSERVE[lens.id] ?? OBSERVE.structure} ` +
      `Each note is one short sentence a student can act on, no praise-padding. ${NEVER_REWRITE} ` +
      `For a 'faulty' verdict only, add a fix to a sentence you see a problem in: 'move' names the technique in 2 to 6 words (for example "Concede, then turn it back"), ` +
      `and 'pattern' is a sentence frame with the content left as bracketed slots for the student to fill (for example "Although [the other side], [why your claim still holds]."). ` +
      `${PATTERN_RULE} ` +
      `Then one summary sentence. Plain text, to be read aloud.`, voice),
    prompt: `The student's ${piece ? `piece, ${paragraphCount(sentences)} paragraphs,` : "paragraph,"} sentence by sentence:\n${numbered}\n\n` +
      (focus ? `Judge only paragraph ${focus.para + 1} of ${focus.of}: sentences ${ns[0]} to ${ns.at(-1)}, one observation each, in the context of the whole piece. The summary is about that paragraph.\n` : "") +
      `Counts: ${stats.sentences} sentences, ${stats.claims} first-pass claims, ${stats.evidence} evidence, ${stats.connectors} connectors, average ${stats.avgWords} words.`,
    schema: schemaFor(lens), model: "best",
  });
  // A highlight may only land on a sentence number that exists, and only on one this call judges: an observation for
  // any other number, or an `observations` that is not a list at all, is dropped. Which sentences are faulty is
  // decided by code (rules/essay decideVerdicts), which also keeps a fix only on a faulty sentence (cleanFix).
  const seen = (Array.isArray(json?.observations) ? json.observations : []).filter((o) => judged.has(o?.n as number));
  const verdicts = decideVerdicts(lens.id, sentences, judged, seen);
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

/** One observation, for the one sentence a rewrite asks about. */
const reviseSchema = (lens: Lens) => { return { type: "object", properties: { observations: schemaFor(lens).properties.observations }, required: ["observations"] }; };

/**
 * Sentence `n` rewritten by the learner, re-judged alone. rules/essay revise() puts the sentence in place (and
 * refuses what is not one new sentence, before any model call); the model is asked to observe sentence n only - in
 * its paragraph, through the reading's lens, against the move the page taught - and decideVerdicts rules on it,
 * with the other sentences' first-pass roles as context. Every other verdict is kept by code, not asked again.
 * The new verdict remembers the sentence it replaced (`was`, from the first reading).
 * A rewrite is not another reading: no new history line, no new attempt. With `learnerId` the reading's own history
 * line is restated in place (restateReading), so the recap counts the sentences still to fix as the reading now
 * stands, and how many a rewrite fixed.
 */
export async function reviseSentence(reading: EssayAnalysis, n: number, rewrite: string, age?: number, learnerId?: string): Promise<EssayAnalysis> {
  const voice = voiceOf("essay", age);
  const r = revise(reading, n, rewrite);
  if (!r.ok) throw new Error(r.error);
  const next = r.reading;
  const lens = lensOf(reading.type);
  const old = reading.sentences.find((s) => s.n === n)!, before = reading.verdicts.find((v) => v.n === n);
  const play = playFor(reading.type);
  const move = taught(before, { move: play.move, pattern: play.pattern })?.fix;
  const numbered = numberedLines(next.sentences);
  const { json, provider } = await text<{ observations: Record<string, unknown>[] }>({
    system: withManner(`You are a writing tutor for ${voice.who}. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `The student has rewritten one sentence of their paragraph, sentence ${n}. Observe sentence ${n} alone, in the context of the paragraph, and give exactly one observation, for sentence ${n}; report only what you see, the desk decides whether it now does its job. ` +
      `${OBSERVE[lens.id] ?? OBSERVE.structure} Do not observe the other sentences. ` +
      `The note is one short sentence a student can act on, no praise-padding. ${NEVER_REWRITE} ` +
      `For a 'faulty' verdict only, add a fix to a sentence you see a problem in: 'move' names the technique in 2 to 6 words, and 'pattern' is a sentence frame with the content left as bracketed slots. ` +
      `${PATTERN_RULE} Plain text, to be read aloud.`, voice),
    prompt: `The student's paragraph, sentence by sentence, with sentence ${n} as rewritten:\n${numbered}\n\n` +
      `Before the rewrite, sentence ${n} read: "${old.text}"` + (before ? ` (${before.verdict}: ${before.note})` : "") + `.\n` +
      (move ? `The move they were asked to make: ${move.move} (pattern: ${move.pattern}).\n` : "") +
      `Observe sentence ${n} alone.`,
    schema: reviseSchema(lens), model: "best",
  });
  // only the observation for sentence n is read; one that is missing or that the lens cannot read fails the run, so a
  // verdict is never invented. The others come from the first pass, as context for the rule.
  const got = (Array.isArray(json?.observations) ? json.observations : []).find((o) => o?.n === n);
  if (!got || !observationOk(lens.id, got)) throw new Error(`no observation came back for sentence ${n}`);
  const decided = decideVerdicts(lens.id, next.sentences, new Set([n]), [got, ...contextObservations(lens.id, next.sentences, n)]).find((v) => v.n === n);
  if (!decided) throw new Error(`no verdict could be decided for sentence ${n}`);
  const was = before?.was ?? { text: old.text, verdict: before?.verdict ?? "neutral", ...(before?.fix ? { fix: before.fix } : {}) };
  const verdict: Verdict = { ...decided, was };
  const verdicts = next.sentences.flatMap((s) => (s.n === n ? [verdict] : reading.verdicts.filter((v) => v.n === s.n)));
  if (learnerId) try { restateReading(learnerId, lens.name, reading.verdicts, verdicts); } catch {}
  return { ...next, verdicts, provider };
}

const faultyIn = (vs: Pick<Verdict, "verdict">[]) => vs.filter((v) => v.verdict === "faulty").length;
const LINE = /^(\d+) of (\d+) (sentences?) to fix(, \d+ paragraphs)?(, \d+ fixed)?$/;

/**
 * The history line record() wrote for this reading (the learner's last writing line under the lens that states the
 * reading's faulty count before the rewrite) is restated from the verdicts as they now stand: the count still to fix,
 * and ", k fixed" for the sentences a rewrite moved from faulty to strong. It stays one line, one reading.
 */
function restateReading(learnerId: string, label: string, before: Verdict[], after: Verdict[]): void {
  const l = getLearner(learnerId), was = faultyIn(before);
  const at = l.history.findLastIndex((h) => h.kind === "writing" && h.label === label && LINE.exec(h.detail)?.[1] === String(was));
  if (at < 0) return;
  const m = LINE.exec(l.history[at].detail)!;
  const fixed = after.filter((v) => v.was?.verdict === "faulty" && v.verdict !== "faulty").length;
  const detail = `${faultyIn(after)} of ${m[2]} ${m[3]} to fix${m[4] ?? ""}${fixed ? `, ${fixed} fixed` : ""}`;
  if (detail === l.history[at].detail) return;
  saveLearner({ ...l, history: l.history.map((h, i) => (i === at ? { ...h, detail } : h)) });
}
