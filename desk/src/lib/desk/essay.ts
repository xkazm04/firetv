/**
 * Forensic essay analysis. Sentences are split, measured and given a first-pass role in code;
 * the model then judges through the chosen lens and returns verdicts anchored to sentence
 * numbers, so every highlight lands on a sentence that exists.
 */
import { text } from "../engines/text";
import { ANALYSIS_TYPES, cleanFix, paragraphStats, revise, splitSentences, taught, type AnalysisType } from "../rules/essay";
import { playFor } from "../library/lessons.data";
import { addHistory, recordWriting } from "../session/learners";
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

export async function analyseEssay(raw: string, type: AnalysisType, learnerId: string): Promise<EssayAnalysis> {
  const sentences = splitSentences(raw);
  const stats = paragraphStats(sentences);
  const lens = ANALYSIS_TYPES.find((t) => t.id === type) ?? ANALYSIS_TYPES[0];
  const numbered = sentences.map((s) => `${s.n}. ${s.text}  [${s.words} words, first-pass role: ${s.role}]`).join("\n");
  const { json, provider } = await text<{ verdicts: EssayAnalysis["verdicts"]; summary: string }>({
    system: `You are a writing tutor for a 15-year-old. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `Give one verdict per sentence, by its number: 'strong' for something done well, 'faulty' for a real problem, 'neutral' otherwise. ` +
      `Each note is one short sentence a student can act on, no praise-padding. Never rewrite their sentences for them. ` +
      `For a 'faulty' verdict only, add a fix: 'move' names the technique in 2 to 6 words (for example "Concede, then turn it back"), ` +
      `and 'pattern' is a sentence frame with the content left as bracketed slots for the student to fill (for example "Although [the other side], [why your claim still holds]."). ` +
      `A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts. ` +
      `Then one summary sentence. Plain text, to be read aloud.`,
    prompt: `The student's paragraph, sentence by sentence:\n${numbered}\n\nCounts: ${stats.sentences} sentences, ${stats.claims} first-pass claims, ${stats.evidence} evidence, ${stats.connectors} connectors, average ${stats.avgWords} words.`,
    schema: SCHEMA, model: "best",
  });
  // A highlight may only land on a sentence number that exists. Anything else the model returned —
  // a number off either end, or a `verdicts` that is not a list at all — is dropped, not shown.
  // A fix rides only on a faulty verdict, and only as a move plus a slotted pattern (rules/essay cleanFix);
  // anything else loses the fix and keeps the verdict.
  const byN = new Map(sentences.map((s) => [s.n, s.text]));
  const verdicts = (Array.isArray(json?.verdicts) ? json.verdicts : []).filter((v) => byN.has(v?.n)).map((v) => {
    const { fix, ...rest } = v;
    const clean = rest.verdict === "faulty" ? cleanFix(fix, byN.get(v.n)) : undefined;
    return clean ? { ...rest, fix: clean } : rest;
  });

  // The reading happened, so the learner record says so — the same one-line episode Math Buddy
  // writes after a marked set, from counts the reading actually produced, never invented — and
  // the lens's estimate takes it as one attempt. A paragraph with no sentences in it is neither.
  if (sentences.length) {
    const faulty = verdicts.filter((v) => v.verdict === "faulty").length;
    addHistory(learnerId, {
      at: Date.now(), kind: "writing", label: lens.name,
      detail: `${faulty} of ${sentences.length} sentence${sentences.length === 1 ? "" : "s"} to fix`,
    });
    recordWriting(learnerId, lens.id, sentences.length, faulty);
  }

  return { text: raw, type, sentences, stats, verdicts, summary: json.summary, provider };
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
export async function reviseSentence(reading: EssayAnalysis, n: number, rewrite: string): Promise<EssayAnalysis> {
  const r = revise(reading, n, rewrite);
  if (!r.ok) throw new Error(r.error);
  const next = r.reading;
  const lens = ANALYSIS_TYPES.find((t) => t.id === reading.type) ?? ANALYSIS_TYPES[0];
  const old = reading.sentences.find((s) => s.n === n)!, before = reading.verdicts.find((v) => v.n === n);
  const play = playFor(reading.type);
  const move = taught(before, { move: play.move, pattern: play.pattern })?.fix;
  const numbered = next.sentences.map((s) => `${s.n}. ${s.text}  [${s.words} words, first-pass role: ${s.role}]`).join("\n");
  const { json, provider } = await text<{ verdicts: Verdict[] }>({
    system: `You are a writing tutor for a 15-year-old. Lens for this reading: ${lens.name} — ${lens.lens} ` +
      `The student has rewritten one sentence of their paragraph, sentence ${n}. Judge sentence ${n} alone, in the context of the paragraph, and give exactly one verdict, for sentence ${n}: ` +
      `'strong' if it now does its job, 'faulty' if the problem is still there, 'neutral' otherwise. Do not judge the other sentences. ` +
      `The note is one short sentence a student can act on, no praise-padding. Never rewrite their sentences for them. ` +
      `For a 'faulty' verdict only, add a fix: 'move' names the technique in 2 to 6 words, and 'pattern' is a sentence frame with the content left as bracketed slots. ` +
      `A pattern is a template, never their sentence rewritten: none of their words, at least one [slot], at most ten words outside the slots. No fix on strong or neutral verdicts. Plain text, to be read aloud.`,
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
