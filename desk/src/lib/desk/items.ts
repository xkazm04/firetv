/**
 * Generate a practice set — and never show an item the desk has not checked itself.
 *
 * The model writes the questions and states the answers. Both are evidence, not truth: an item
 * whose stated answer is wrong poisons the marking, the skill estimate and the next topic. So
 * every candidate goes through `verify` before it is allowed into the set, and a candidate that
 * fails is simply discarded. We ask for n + 3 in the first call so the usual handful of rejects
 * costs nothing; only if the survivors still fall short do we go back for more.
 *
 * A topic on the Calculus 1 path (library/paths.ts) takes the other road: the model writes SPECS - a shape from the
 * topic's own list and its parameters - and never a question in words or its result. Code keeps a spec only when
 * rules/calc says it is well formed, prints the question from it, orders the set easy to hard, and carries the spec
 * on the item so marking can judge with no stored truth (makeCalcItems).
 *
 * A school unit with a generator (rules/school SCHOOL_GENERATORS; Family W5b and W7: every school unit, fractions to mean and range) takes a
 * third road with NO model call at all: code draws the specs from a fresh seed, at the mix of tier-1 and tier-2 items
 * rules/stretch sets for the learner (Family W8: three and three at the standard baseline, four and two when the unit is
 * ahead of the learner's school year, one rung harder for "a step up"), prints each question itself and carries the spec
 * and the tier on the item (makeSchoolItems, provider "code").
 *
 * A set asked for as "a step up" (`stretch`, Family W8) carries `stretch: true` on every item, whichever road wrote it,
 * so marking records its attempts on the step-up record only (lib/session/learners.ts). On a topic with no generator
 * (the three linear topics, Calculus 1) the step up changes nothing about how the set is written: the model road has no
 * tiers, so the set is asked for exactly as usual and only its record differs.
 */
import { text } from "../engines/text";
import { topic } from "../library/syllabus";
import { getLearner } from "../session/learners";
import { slip as slipById, type Slip } from "../rules/maths";
import { degenerate, verify } from "./verify";
import type { PracticeItem } from "../session/store";
import { topicIn } from "../library/paths";
import { kindOfTopic } from "../rules/kinds";
import { CALC1_SPINE } from "../library/calculus1.spine";
import { CALC_SLIPS, leaksCalc, question as printed, wellFormed, type CalcShape, type CalcSpec } from "../rules/calc";
import { generatorFor, leaksSchool, question as schoolQuestion, wellFormed as schoolWellFormed, type SchoolSpec } from "../rules/school";
import type { JSONSchema } from "../engines/types";
import { setMix, tierCounts, type Mix, type MixFor } from "../rules/stretch";

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { question: { type: "string" }, answer: { type: "string" } },
        required: ["question", "answer"],
      },
    },
  },
  required: ["items"],
};

interface Candidate { question: string; answer: string }

const SYSTEM =
  "You write short practice questions for a school maths desk. Plain text only — no LaTeX, no markdown, no dollar signs; " +
  "write powers with ^ (x^2), write multiplication as 3x, and write the equation on one line. " +
  "Each question is a single equation in x. Each answer is the value of x alone, as a plain number " +
  "(for example -4) or a simple fraction (for example 7/2) — no words, no 'x =', no units.";

function ask(topicId: string, memory: string[], slips: string[], want: number, avoid: string[]) {
  const t = topic(topicId);
  const name = t?.name ?? topicId;
  const blurb = t?.blurb ?? "";
  // the slips are read as the desk would say them, never as ids: the model has not seen our vocabulary
  const said = slips.map((id) => slipById(id)).filter((x): x is Slip => !!x);
  const known = said.length
    ? `Mistakes this student has actually made on this topic before:\n${said.map((x) => `- ${x.says} (it shows at ${x.points})`).join("\n")}\n` +
      `Include questions where a mistake like these would show itself. Do not flag which ones, do not mention the mistake in the question, and do not make those questions any harder than the rest.\n\n`
    : `The desk has recorded no mistakes for this student on this topic. Spread the questions evenly across the usual ways this topic goes wrong.\n\n`;
  const prompt =
    `Topic: ${name}\n${blurb}\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    known +
    (avoid.length ? `Do not repeat any of these, which the student already has:\n${avoid.map((q) => `- ${q}`).join("\n")}\n\n` : "") +
    `Write ${want} practice questions on this topic.\n` +
    `Rules:\n` +
    `- Every question must be solvable by hand in under a minute.\n` +
    `- Vary the shape: different arrangements of the terms, some with negatives, some with the x-term on the right.\n` +
    `- Every answer must be an integer or a simple fraction with a small denominator. No decimals, no surds.\n` +
    `- Order them so they get harder across the set: the first is the gentlest, the last is the hardest.\n` +
    `- State the answer you get for each; it will be checked.`;
  return text<{ items: Candidate[] }>({ system: SYSTEM, prompt, schema: SCHEMA, model: "fast" });
}

/** Candidates that survive substitution, deduped against what we already have. */
function keep(cands: Candidate[] | undefined, have: PracticeItem[]): Candidate[] {
  const seen = new Set(have.map((i) => i.question.replace(/\s+/g, "").toLowerCase()));
  const out: Candidate[] = [];
  for (const c of cands ?? []) {
    if (!c || typeof c.question !== "string" || typeof c.answer !== "string") continue;
    const q = c.question.trim();
    const a = c.answer.trim().replace(/^x\s*=\s*/i, "");
    if (!q || !a) continue;
    const k = q.replace(/\s+/g, "").toLowerCase();
    if (seen.has(k)) continue;
    if (!verify(q, a)) continue;          // the one gate: the stated answer must actually satisfy it
    if (degenerate(q)) continue;          // ...and it must be the answer that does: an identity or no-x equation takes any
    seen.add(k);
    out.push({ question: q, answer: a });
  }
  return out;
}

/**
 * What a set is asked for with, beside its topic: whether it is "a step up" (Family W8), and the learner's age and school
 * system as the seated profile gives them (the practice route reads them), from which rules/stretch sets a school unit's
 * mix. All optional: a call without them writes the standard set, as every set was written before W8.
 */
export interface SetAsk extends MixFor { stretch?: boolean }

export async function makeItems(
  topicId: string,
  learnerId: string,
  n = 6,
  opts: SetAsk = {},
): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
  const stretch = opts.stretch === true;
  // a step up on a road with no tiers is asked for as usual and only marked as a step up (see the file header)
  const flag = (r: { items: PracticeItem[]; provider: string; ms: number; tries: number }) =>
    stretch ? { ...r, items: r.items.map((it) => ({ ...it, stretch: true as const })) } : r;
  const kind = kindOfTopic(topicId);
  if (kind === "calc") return flag(await makeCalcItems(topicId, learnerId, n));
  if (kind === "school") return makeSchoolItems(topicId, n, undefined, setMix(topicId, opts, stretch), stretch);
  return flag(await makeLinearItems(topicId, learnerId, n));
}

/** A linear-equation set, written by the model and kept only where substitution proves its stated answer. */
async function makeLinearItems(topicId: string, learnerId: string, n: number): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
  const me = getLearner(learnerId);
  const memory = me.memory;
  // the named mistakes this learner has made HERE: the set is written for them, not for the topic
  const slips = me.skills[topicId]?.slips ?? [];
  const items: PracticeItem[] = [];
  let provider = "";
  let ms = 0;
  let tries = 0;

  for (let round = 0; round < 2 && items.length < n; round++) {
    const want = round === 0 ? n + 3 : n - items.length + 3;
    const r = await ask(topicId, memory, slips, want, items.map((i) => i.question));
    tries++;
    provider = r.provider;
    ms += r.ms;
    for (const c of keep(r.json?.items, items)) {
      if (items.length >= n) break;
      // the stated answer has done its job at the gate; it is not carried onto the desk
      items.push({ n: items.length + 1, question: c.question });
    }
  }

  return { items: items.slice(0, n).map((it, ix) => ({ ...it, n: ix + 1 })), provider, ms, tries };
}

// ------------------------------------------------------------------ Calculus 1: specs, printed and checked by code

type Param = "at" | "a" | "b" | "side" | "on" | "kind" | "x0" | "steps";
/** The parameters each shape takes beyond its function: what its question prints, nothing more. */
const PARAMS: Record<CalcShape, readonly Param[]> = {
  evaluate: ["at"], derivative: [], "derivative-at": ["at"], antiderivative: [], "definite-integral": ["a", "b"],
  limit: ["at", "side"], "critical-point": ["on"], extremum: ["on", "kind"], "newton-step": ["x0", "steps"],
};
/**
 * A point is a string in the plain notation, because it may be a constant (pi/4) or, for a limit, inf - and the
 * engine's schema check reads one type per field. A plain numeral comes back as a number (point()).
 */
const POINT = { type: "string", minLength: 1, maxLength: 24 };
const PARAM_SCHEMA: Record<Param, JSONSchema> = {
  at: POINT, a: POINT, b: POINT, x0: POINT,
  // "" is a two-sided limit
  side: { type: "string", enum: ["", "+", "-"] },
  on: { type: "array", items: POINT, minItems: 2, maxItems: 2 },
  kind: { type: "string", enum: ["max", "min"] },
  steps: { type: "integer" },
};
/** What each shape asks, and what its parameters mean - for the prompt. */
const SHAPE_LINES: Record<CalcShape, string> = {
  evaluate: "evaluate: f and at - the question is to find f(at).",
  derivative: "derivative: f - the question is to differentiate f.",
  "derivative-at": "derivative-at: f and at - the question is to find f'(at).",
  antiderivative: "antiderivative: f - the question is to find the indefinite integral of f.",
  "definite-integral": "definite-integral: f, a and b - the question is to evaluate the integral of f from a to b; pick bounds where it is not zero.",
  limit: "limit: f, at and side - the question is to find the limit of f as x approaches at (a number, or inf or -inf); side is an empty string for a two-sided limit, + or - for one side of a number; pick one where the limit exists.",
  "critical-point": "critical-point: f and on [lo, hi] - the question is to find the critical point of f on that interval; exactly one turning point of f lies in the interval, well inside it and not near either end.",
  extremum: "extremum: f, on [lo, hi] and kind (max or min) - the question is to find that extreme value of f on the interval; it is reached at a turning point well inside the interval, not near an end.",
  "newton-step": "newton-step: f, x0 and steps (1 or 2) - the question is that many Newton's method steps on f(x) = 0 from x0; pick x0 clearly away from the root so the steps differ visibly.",
};

const CALC_SYSTEM =
  "You choose practice questions for a university Calculus 1 desk, as specs the desk prints and checks itself. " +
  "Give only the specs as JSON. Never write a question in words, and never work a question out or state what it comes to: the desk does that itself. " +
  "Write every function in x in plain notation on one line: powers with ^ (x^2, x^(1/2)), sqrt(x), e^(2x), sin(x), cos(x), tan(x), ln(x), " +
  "an implicit product written as 3x or 2sin(x), and brackets wherever they are needed. No LaTeX, no markdown, no dollar signs, and no words inside an expression.";

/** The topic's own practice shapes, from the spine. */
const shapesOf = (topicId: string): CalcShape[] => CALC1_SPINE.find((t) => t.id === topicId)?.shapes.slice() ?? [];
/** True when a shape of the topic leaves a field of the shared schema unused (two shapes with different parameters). */
const leavesUnused = (shapes: CalcShape[]) => { const all = new Set(shapes.flatMap((s) => PARAMS[s])); return shapes.some((s) => PARAMS[s].length < all.size); };

/** One schema: the shape restricted to the topic's own list, every parameter typed, a difficulty, and no other field. */
function calcSchema(shapes: CalcShape[], want: number): JSONSchema {
  const props: Record<string, JSONSchema> = { shape: { type: "string", enum: shapes }, f: { type: "string", minLength: 1, maxLength: 80 } };
  for (const k of new Set(shapes.flatMap((s) => PARAMS[s]))) props[k] = PARAM_SCHEMA[k];
  props.difficulty = { type: "integer", minimum: 1, maximum: 5 };
  const item = { type: "object", additionalProperties: false, properties: props, required: Object.keys(props) };
  return { type: "object", additionalProperties: false, properties: { specs: { type: "array", maxItems: want, items: item } }, required: ["specs"] };
}
/** The reply is held only to "a list of objects": one spec off its shape is dropped by code, not the whole round. */
const CALC_ACCEPT: JSONSchema = { type: "object", properties: { specs: { type: "array", items: { type: "object" } } }, required: ["specs"] };

function askCalc(topicId: string, shapes: CalcShape[], memory: string[], slips: string[], want: number, avoid: string[]) {
  const t = topicIn(topicId);
  // the slips as the desk would say them, never as ids
  const said = slips.map((id) => CALC_SLIPS.find((x) => x.id === id)).filter((x): x is (typeof CALC_SLIPS)[number] => !!x);
  const known = said.length
    ? `Mistakes this student has actually made on this topic before:\n${said.map((x) => `- ${x.says} (it shows at ${x.points})`).join("\n")}\n` +
      `Include questions where a mistake like these would show itself. Do not flag which ones, and do not make those questions any harder than the rest.\n\n`
    : `The desk has recorded no mistakes for this student on this topic. Spread the questions evenly across the usual ways this topic goes wrong.\n\n`;
  const prompt =
    `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}\n\n` +
    (memory.length ? `What the desk has learned about this student:\n${memory.map((m) => `- ${m}`).join("\n")}\n\n` : "") +
    known +
    (avoid.length ? `Do not repeat any of these, which the student already has:\n${avoid.map((q) => `- ${q}`).join("\n")}\n\n` : "") +
    `Write ${want} specs for practice questions on this topic, using only these shapes:\n${shapes.map((s) => `- ${SHAPE_LINES[s]}`).join("\n")}\n` +
    `Rules:\n` +
    `- Use small integers and simple fractions (1/2, -3/4) as parameters and coefficients; write a point as a number or a constant such as pi/4, in plain notation.\n` +
    `- Every question must be workable by hand in a few minutes.\n` +
    `- Vary the difficulty and the kind of function, and give each spec a difficulty from 1 (gentlest) to 5 (hardest).\n` +
    (leavesUnused(shapes) ? `- A field the shape does not use is left as an empty string (0 for steps).\n` : "") +
    `- Do not work any question out: give the specs only.`;
  // thinking off: writing nine short specs is not a reasoning task and the desk checks every one in code. Measured live
  // (tools/calc-model-yield.cjs, 6 topics): on = 62-90 s a call with two engine timeouts, off = 7-14 s and every set made
  return text<{ specs: unknown[] }>({ system: CALC_SYSTEM, prompt, schema: calcSchema(shapes, want), accept: CALC_ACCEPT, model: "fast", thinking: false });
}

/** A point as the spec holds it: a plain numeral as a number, inf / -inf for a limit, a constant as its plain text. */
function point(v: unknown, limit = false): number | string | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  if (limit && /^\+?(inf|infinity|∞)$/i.test(t)) return "inf";
  if (limit && /^[-−](inf|infinity|∞)$/i.test(t)) return "-inf";
  return /^[+-]?\d+(\.\d+)?$/.test(t) ? Number(t) : t;
}

/** Keys that would carry a result: a spec with one is refused whole (rules/calc wellFormed refuses the same). */
const RESULT_KEYS = ["answer", "solution", "truth", "value", "result"];

/** A raw spec from the model as a CalcSpec holding only its shape's parameters, or null when it is off the topic's list. */
function toSpec(raw: unknown, shapes: CalcShape[]): { spec: CalcSpec; difficulty: number } | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (RESULT_KEYS.some((k) => k in r)) return null;
  const shape = r.shape as CalcShape;
  if (!shapes.includes(shape) || typeof r.f !== "string" || !r.f.trim()) return null;
  const out: Record<string, unknown> = { shape, f: r.f.trim() };
  for (const k of PARAMS[shape]) {
    const v = r[k];
    if (k === "side") { if (v === "+" || v === "-") out.side = v; }
    else if (k === "kind" || k === "steps") out[k] = v;
    else if (k === "on") out.on = Array.isArray(v) ? v.map((x) => point(x)) : v;
    else out[k] = point(v, shape === "limit" && k === "at");
  }
  const d = Number(r.difficulty);
  return { spec: out as unknown as CalcSpec, difficulty: Number.isFinite(d) ? Math.min(5, Math.max(1, Math.round(d))) : 3 };
}

const sameKey = (q: string) => q.replace(/\s+/g, "").toLowerCase();

/**
 * A Calculus 1 set: at most n + 3 specs asked for (the topic's own shapes, typed parameters, a difficulty, no result
 * anywhere), each kept only when it is on the topic's list, well formed (rules/calc), printable, not stating its own
 * result in its question, and not a question already kept; then ordered by difficulty and the expression's length,
 * and the first n taken. A second round asks for what is still missing, naming what is kept. The item is
 * { n, question: the printed question, spec } - the spec carries only what the question prints.
 */
async function makeCalcItems(topicId: string, learnerId: string, n: number): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
  const me = getLearner(learnerId);
  const memory = me.memory;
  const slips = me.skills[topicId]?.slips ?? [];
  const shapes = shapesOf(topicId);
  const kept: { spec: CalcSpec; question: string; difficulty: number }[] = [];
  const seen = new Set<string>();
  let provider = "";
  let ms = 0;
  let tries = 0;

  for (let round = 0; round < 2 && kept.length < n; round++) {
    const want = round === 0 ? n + 3 : n - kept.length + 3;
    const r = await askCalc(topicId, shapes, memory, slips, want, kept.map((k) => k.question));
    tries++;
    provider = r.provider;
    ms += r.ms;
    for (const raw of Array.isArray(r.json?.specs) ? r.json.specs : []) {
      const c = toSpec(raw, shapes);
      // wellFormed first: question() is only asked of a spec the desk can read whole
      if (!c || !wellFormed(c.spec).ok) continue;
      const q = printed(c.spec);
      // a question that prints its own result (differentiate e^x) is no question
      if (!q || leaksCalc(c.spec, q.plain)) continue;
      const k = sameKey(q.plain);
      if (seen.has(k)) continue;
      seen.add(k);
      kept.push({ spec: c.spec, question: q.plain, difficulty: c.difficulty });
    }
  }

  const ordered = kept.slice().sort((a, b) => a.difficulty - b.difficulty || a.spec.f.length - b.spec.f.length);
  return { items: ordered.slice(0, n).map((k, ix) => ({ n: ix + 1, question: k.question, spec: k.spec })), provider, ms, tries };
}

// ------------------------------------------------------------------ school units: written by code, no model call

/** The seeds one set may try per tier before it stops: far more than a unit's generator needs for three distinct items. */
const SCHOOL_TRIES = 400;
/** A fresh seed for a set: any whole number the generators take (0 .. 2^32 - 1). */
const freshSeed = () => Math.floor(Math.random() * 0x100000000);

/**
 * A set on a school unit that has a generator, written by CODE with no model call: `mix` (rules/stretch, "standard" by
 * default: the first half rounded up at tier 1 and the rest at tier 2, three and three for six; "easier" four and two;
 * "harder" two and four) drawn from `seed` onward (a fresh seed per set unless one is given, which the tests do). A spec
 * is kept only when rules/school says it is well formed, prints, does not state its own answer in its question
 * (leaksSchool) and is not a question already kept, so the six are distinct. The tier is the one code asked the
 * generator for, never a model's number. Each item is { n, question: the printed question, spec, tier }, and
 * `stretch: true` beside the tier when the set is a step up; provider "code", no tries (no engine call). Fewer than n
 * only if a generator runs dry.
 */
export function makeSchoolItems(topicId: string, n = 6, seed: number = freshSeed(), mix: Mix = "standard", stretch = false): { items: PracticeItem[]; provider: string; ms: number; tries: number } {
  const t0 = Date.now();
  const make = generatorFor(topicId);
  const kept: { spec: SchoolSpec; question: string; tier: 1 | 2 }[] = [];
  const seen = new Set<string>();
  const { tier1, tier2 } = tierCounts(mix, n);
  for (const [tier, want] of [[1, tier1], [2, tier2]] as const) {
    let got = 0;
    for (let k = 0; make && k < SCHOOL_TRIES && got < want; k++) {
      const spec = make((seed + k) % 0x100000000, tier);
      if (!spec || !schoolWellFormed(spec).ok) continue;
      const q = schoolQuestion(spec);
      if (!q || leaksSchool(spec, q.plain)) continue;
      const key = sameKey(q.plain);
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push({ spec, question: q.plain, tier });
      got++;
    }
  }
  return { items: kept.slice(0, n).map((k, ix) => ({ n: ix + 1, question: k.question, spec: k.spec, tier: k.tier, ...(stretch ? { stretch: true as const } : {}) })), provider: "code", ms: Date.now() - t0, tries: 0 };
}
