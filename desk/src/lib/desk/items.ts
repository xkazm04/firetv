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
 * A Calculus set on related rates, optimisation or maxima and minima, asked for with `word` (v2 M3a; the practice route
 * asks so), ends with one word problem in parts that CODE draws from a seed with no model call (rules/calc-word): its parts
 * count toward n, so six is four of the model's single items and two parts. The model is asked exactly as before, and the
 * single items keep their order; the first n - parts are taken. A set with no single item carries no word problem.
 *
 * A set asked for as "a step up" (`stretch`, Family W8) carries `stretch: true` on every item, whichever road wrote it,
 * so marking records its attempts on the step-up record only (lib/session/learners.ts). On a topic with no generator
 * (the three linear topics, Calculus 1) the step up changes nothing about how the set is written: the model road has no
 * tiers, so the set is asked for exactly as usual and only its record differs.
 */
import { text } from "../engines/text";
import { topic } from "../library/syllabus";
import { getLearner, recallLearner, RECALL_UNREAD, type Learner } from "../session/learners";
import { notesPart } from "./memory";
import { assemble, dataList, say } from "../prompt/assemble";
import { slip as slipById, type Slip } from "../rules/maths";
import { degenerate, verify } from "./verify";
import type { PracticeItem, SchoolSystem } from "../session/store";
import { calcWordsOf, pathOfTopic, requirementOfTopic, shapesOfTopic, topicIn } from "../library/paths";
import { kindOfTopic } from "../rules/kinds";
import { CALC_SLIPS, leaksCalc, meetsRequirement, question as printed, wellFormed, type CalcRequirement, type CalcShape, type CalcSpec } from "../rules/calc";
import type { Calc2Spec, Calc2SpecShape } from "../rules/calc2";
import { drawWord, wordItems, wordTemplateFor } from "../rules/calc-word";
import { SCHOOL_UNIT_SLIPS, STATEMENT_FORMS, TOP_SLIP_FORMS, formOf, generatorFor, paperSteer, leaksSchool, question as schoolQuestion, slipShows, storyOf, topFormOf, topGeneratorFor, topSteer, wellFormed as schoolWellFormed, type SchoolSpec } from "../rules/school";
import type { JSONSchema } from "../engines/types";
import { learnerYear, setMix, tierCounts, type Mix, type MixFor } from "../rules/stretch";
import { STATEMENTS } from "../library/gcse";

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

/** The learner's school year as their own system says it, and where that system is, for the learner section. */
const YEAR_IN: Record<SchoolSystem, (y: number) => string> = {
  uk: (y) => `Year ${y} of school in England`, us: (y) => `Grade ${y} of school in the United States`,
  cz: (y) => `${y}. ročník of a Czech school`, de: (y) => `Klasse ${y} of a German school`,
};
const PLACE: Record<SchoolSystem, string> = { uk: "England", us: "the United States", cz: "the Czech Republic", de: "Germany" };

/**
 * The learner section of a set prompt (MB-B40, every model-written set since cycle 13): the learner's age, school year and
 * school system as the seated profile gives them (the practice route reads them; an age only for a learner at school),
 * the year by the desk's own rule (rules/stretch learnerYear). One renderer for the equations and the Calculus prompt,
 * aimed or not. Nothing known, no section - never "unknown" (registry prompt-assembly, layered-composition: absent means
 * absent).
 */
export function learnerBlock(who: MixFor = {}): string {
  const sys = who.system && who.system in PLACE ? who.system : undefined;
  const age = typeof who.age === "number" && Number.isFinite(who.age) ? who.age : undefined;
  const year = sys && age !== undefined ? learnerYear(who) : undefined;
  return age !== undefined && sys && year !== undefined ? `The student is ${age}, in ${YEAR_IN[sys](year)}. Pitch the questions there.\n\n`
    : age !== undefined ? `The student is ${age}. Pitch the questions there.\n\n`
    : sys ? `The student studies in ${PLACE[sys]}.\n\n` : "";
}

/**
 * The aim section of the equations prompt (MB-B40), rendered from data alone: the statements a paper lost (gcse.ts codes,
 * printed in the map's own words - never a code, a question or a mark count). The learner's age and system are the
 * learner section's (learnerBlock), not this one's. No aim, no section, heading included.
 */
export function aimBlock(aim: readonly string[] | undefined): string {
  const said = (aim ?? []).map((c) => STATEMENTS.find((x) => x.code === c)?.can).filter((x): x is string => !!x);
  if (!said.length) return "";
  return `What this set is aimed at: on a school maths paper the student lost marks on ${said.length === 1 ? "this statement" : "these statements"} of what a student can do:\n` +
    said.map((x) => `- ${x}`).join("\n") + "\n" +
    `Write questions that practise exactly this, on this topic. Do not name the statement in a question.\n\n`;
}

/**
 * The equations prompt, assembled in a fixed layer order, each layer rendered on its own and absent when it has nothing
 * to say: the topic, the learner (learnerBlock), the desk's notes, the learner's slips here, the aim (aimBlock), what the
 * set already holds, and the task.
 */
function ask(topicId: string, memory: Pick<Learner, "memory" | "memoryDropped"> | null, slips: string[] | null, want: number, avoid: string[], learner = "", aim = "") {
  const t = topic(topicId);
  const name = t?.name ?? topicId;
  const blurb = t?.blurb ?? "";
  // the slips are read as the desk would say them, never as ids: the model has not seen our vocabulary
  const said = (slips ?? []).map((id) => slipById(id)).filter((x): x is Slip => !!x);
  const known = said.length
    ? `Mistakes this student has actually made on this topic before:\n${said.map((x) => `- ${x.says} (it shows at ${x.points})`).join("\n")}\n` +
      `Include questions where a mistake like these would show itself. Do not flag which ones, do not mention the mistake in the question, and do not make those questions any harder than the rest.\n\n`
    : slips === null ? `${RECALL_UNREAD} Spread the questions evenly across the usual ways this topic goes wrong.\n\n`
    : `The desk has recorded no mistakes for this student on this topic. Spread the questions evenly across the usual ways this topic goes wrong.\n\n`;
  const asked = assemble("practice-linear", {
    system: [say("stance", SYSTEM)],
    prompt: [
      say("topic", `Topic: ${name}\n${blurb}`.trim()),
      say("learner", learner.trim()),
      ...notesPart(memory),
      say("slips", known.trim()),
      say("aim", aim.trim()),
      dataList("avoid", "Do not repeat any of these, which the student already has", avoid),
      say("ask", `Write ${want} practice questions on this topic.\n` +
        `Rules:\n` +
        `- Every question must be solvable by hand in under a minute.\n` +
        `- Vary the shape: different arrangements of the terms, some with negatives, some with the x-term on the right.\n` +
        `- Every answer must be an integer or a simple fraction with a small denominator. No decimals, no surds.\n` +
        `- Order them so they get harder across the set: the first is the gentlest, the last is the hardest.\n` +
        `- State the answer you get for each; it will be checked.`),
    ],
  });
  return text<{ items: Candidate[] }>({ ...asked, schema: SCHEMA, model: "fast", use: "practice" });
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
/**
 * `word` (v2 M3a): a Calculus set on a topic with a shipped word template ends with one code-drawn word problem in parts -
 * true for a fresh seed, a number for that seed (the tests). Absent or false: the set is written as before.
 */
export interface SetAsk extends MixFor { stretch?: boolean; word?: boolean | number;
  /**
   * The statements (gcse.ts codes) a paper lost on this unit, when the set was opened from its recovery row (MB-B40). A
   * model-written equations set takes them into its prompt (aimBlock; the learner's age and system go into every set's prompt, learnerBlock); a code-written
   * unit's draw is steered by them where they pick some of a tier's forms (rules/school paperSteer, makeSchoolItems), else
   * drawn as usual. Absent: as before.
   */
  aim?: readonly string[];
  /**
   * The slips the learner made on this unit's top rung (cycle 18, rules/school topSlipsOf: read by the practice route from
   * the set the session holds). A step up on a code-written unit aims its non-word-problem tier-3 slot(s) at the kinds they
   * happen on (rules/school topSteer, makeSchoolItems); any other set ignores them. Absent: as before.
   */
  topSlips?: readonly string[] }

/**
 * The set, and `aim`: the statements it was written for, only when it was - every one on a model-written equations set (all
 * go into its prompt), on a code-written unit the ones that steered its draw, none on Calculus. The practice route puts
 * exactly these on the set (Practice.aim), so the taped card never names an aim the set did not take. `topAim`: the
 * top-rung slips a step up's tier-3 draw was aimed at, only when the aim changed the draw (Practice.topAim).
 */
export async function makeItems(
  topicId: string,
  learnerId: string,
  n = 6,
  opts: SetAsk = {},
): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number; aim?: string[]; topAim?: string[] }> {
  const stretch = opts.stretch === true;
  // a step up on a road with no tiers is asked for as usual and only marked as a step up (see the file header)
  const flag = (r: { items: PracticeItem[]; provider: string; ms: number; tries: number }) =>
    stretch ? { ...r, items: r.items.map((it) => ({ ...it, stretch: true as const })) } : r;
  const kind = kindOfTopic(topicId);
  if (kind === "calc") return flag(await makeCalcItems(topicId, learnerId, n, opts.word, learnerBlock(opts), opts.system));
  // a school unit's set is aimed at the learner's live slips on it, newest first (the record keeps them newest last)
  // a paper's lost statements, when it opened the set, steer the draw first (MB-B40 cycle 14)
  // a step up's tier-3 slots are aimed at the slips named on the rung the last time (cycle 18); a usual set takes none
  if (kind === "school") return makeSchoolItems(topicId, n, undefined, setMix(topicId, opts, stretch), stretch, [...(getLearner(learnerId).skills[topicId]?.slips ?? [])].reverse(), opts.system, opts.aim ?? [], stretch ? opts.topSlips ?? [] : []);
  const aimed = aimBlock(opts.aim) ? [...(opts.aim ?? [])] : [];
  const made = flag(await makeLinearItems(topicId, learnerId, n, learnerBlock(opts), aimBlock(opts.aim)));
  return aimed.length ? { ...made, aim: aimed } : made;
}

/** A linear-equation set, written by the model and kept only where substitution proves its stated answer. */
async function makeLinearItems(topicId: string, learnerId: string, n: number, learner = "", aim = ""): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
  const me = recallLearner(learnerId);
  const memory = me;
  // the named mistakes this learner has made HERE: the set is written for them, not for the topic
  const slips = me ? me.skills[topicId]?.slips ?? [] : null;
  const items: PracticeItem[] = [];
  let provider = "";
  let ms = 0;
  let tries = 0;

  for (let round = 0; round < 2 && items.length < n; round++) {
    const want = round === 0 ? n + 3 : n - items.length + 3;
    const r = await ask(topicId, memory, slips, want, items.map((i) => i.question), learner, aim);
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

type Param = "at" | "a" | "b" | "side" | "on" | "kind" | "x0" | "steps" | "pieces" | "rule";
/** The parameters each shape takes beyond its function: what its question prints, nothing more. */
const PARAMS: Record<CalcShape | Calc2SpecShape, readonly Param[]> = {
  evaluate: ["at"], derivative: [], "derivative-at": ["at"], antiderivative: [], "definite-integral": ["a", "b"],
  limit: ["at", "side"], "critical-point": ["on"], extremum: ["on", "kind"], "newton-step": ["x0", "steps"], "implicit-derivative": [],
  "approx-integral": ["a", "b", "pieces", "rule"], "sequence-limit": [],
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
  pieces: { type: "integer", minimum: 2, maximum: 10 },
  rule: { type: "string", enum: ["trapezoid", "midpoint", "simpson"] },
};
/** What each shape asks, and what its parameters mean - for the prompt. */
const SHAPE_LINES: Record<CalcShape | Calc2SpecShape, string> = {
  evaluate: "evaluate: f and at - the question is to find f(at).",
  derivative: "derivative: f - the question is to differentiate f.",
  "derivative-at": "derivative-at: f and at - the question is to find f'(at).",
  antiderivative: "antiderivative: f - the question is to find the indefinite integral of f.",
  "definite-integral": "definite-integral: f, a and b - the question is to evaluate the integral of f from a to b; pick bounds where it is not zero.",
  limit: "limit: f, at and side - the question is to find the limit of f as x approaches at (a number, or inf or -inf); side is an empty string for a two-sided limit, + or - for one side of a number; pick one where the limit exists.",
  "critical-point": "critical-point: f and on [lo, hi] - the question is to find the critical point of f on that interval; exactly one turning point of f lies in the interval, well inside it and not near either end.",
  extremum: "extremum: f, on [lo, hi] and kind (max or min) - the question is to find that extreme value of f on the interval; it is reached at a turning point well inside the interval, not near an end.",
  "newton-step": "newton-step: f, x0 and steps (1 or 2) - the question is that many Newton's method steps on f(x) = 0 from x0; pick x0 clearly away from the root so the steps differ visibly.",
  "implicit-derivative": "implicit-derivative: f, an equation in x and y with one = sign, such as x^2 + y^2 = 25 or x*y + y^2 = 7 - the question is to find dy/dx by implicit differentiation; y must sit inside a power or a function (y^2, sin(y), e^y), and the curve must not be a straight line.",
  "approx-integral": "approx-integral: f, a, b, pieces (2 to 10, even for simpson) and rule (trapezoid, midpoint or simpson) - the question is that rule with that many subintervals, given to four decimal places.",
  "sequence-limit": "sequence-limit: f, a function of x that the desk prints with n in place of x. The question is the limit of a_n = f(n) as n grows. Pick one that is defined for every real x >= 1 and that has a limit or grows without bound.",
};

/** The Calculus set's system prompt; the course is named by the topic's own path's record (Calculus 1's text is unchanged). */
const calcSystem = (topicId: string) =>
  `You choose practice questions for a university ${calcWordsOf(pathOfTopic(topicId)).desk} desk, as specs the desk prints and checks itself. ` +
  "Give only the specs as JSON. Never write a question in words, and never work a question out or state what it comes to: the desk does that itself. " +
  "Write every function in x in plain notation on one line: powers with ^ (x^2, x^(1/2)), sqrt(x), e^(2x), sin(x), cos(x), tan(x), ln(x), " +
  "an implicit product written as 3x or 2sin(x), and brackets wherever they are needed. No LaTeX, no markdown, no dollar signs, and no words inside an expression.";

/** The topic's own practice shapes, from its path's record (paths.ts: a topic of a path judged 'calc'; none otherwise). */
const shapesOf = (topicId: string): (CalcShape | Calc2SpecShape)[] => shapesOfTopic(topicId);
/** True when a shape of the topic leaves a field of the shared schema unused (two shapes with different parameters). */
const leavesUnused = (shapes: (CalcShape | Calc2SpecShape)[]) => { const all = new Set(shapes.flatMap((s) => PARAMS[s])); return shapes.some((s) => PARAMS[s].length < all.size); };

/** One schema: the shape restricted to the topic's own list, every parameter typed, a difficulty, and no other field. */
function calcSchema(shapes: (CalcShape | Calc2SpecShape)[], want: number): JSONSchema {
  const props: Record<string, JSONSchema> = { shape: { type: "string", enum: shapes }, f: { type: "string", minLength: 1, maxLength: 80 } };
  for (const k of new Set(shapes.flatMap((s) => PARAMS[s]))) props[k] = PARAM_SCHEMA[k];
  props.difficulty = { type: "integer", minimum: 1, maximum: 5 };
  const item = { type: "object", additionalProperties: false, properties: props, required: Object.keys(props) };
  return { type: "object", additionalProperties: false, properties: { specs: { type: "array", maxItems: want, items: item } }, required: ["specs"] };
}
/** The reply is held only to "a list of objects": one spec off its shape is dropped by code, not the whole round. */
const CALC_ACCEPT: JSONSchema = { type: "object", properties: { specs: { type: "array", items: { type: "object" } } }, required: ["specs"] };

/**
 * The rule line a topic's structural requirement adds to its Calculus prompt (the spine's `requires`, the same field
 * rules/calc meetsRequirement checks): the model is told what code will keep, so fewer specs are thrown away. The check
 * stays code's; this line only asks.
 */
const REQUIREMENT_LINES: Record<CalcRequirement, string> = {
  composition: "- Every function must be a composition: one function inside another, such as sin(x^2), (2x + 1)^3 or e^(3x), with an inside that is neither x nor x plus a number.\n",
};

/**
 * The Calculus prompt, assembled in a fixed layer order, each layer rendered on its own and absent when it has nothing to
 * say: the topic, the learner (learnerBlock), the desk's notes, the learner's slips here, what the set already holds, the
 * task with its shapes, and the rules - the topic's requirement line among them when its definition names one.
 */
function askCalc(topicId: string, shapes: (CalcShape | Calc2SpecShape)[], memory: Pick<Learner, "memory" | "memoryDropped"> | null, slips: string[] | null, want: number, avoid: string[], learner = "", requires?: CalcRequirement) {
  const t = topicIn(topicId);
  // the slips as the desk would say them, never as ids
  const said = (slips ?? []).map((id) => CALC_SLIPS.find((x) => x.id === id)).filter((x): x is (typeof CALC_SLIPS)[number] => !!x);
  const known = said.length
    ? `Mistakes this student has actually made on this topic before:\n${said.map((x) => `- ${x.says} (it shows at ${x.points})`).join("\n")}\n` +
      `Include questions where a mistake like these would show itself. Do not flag which ones, and do not make those questions any harder than the rest.\n\n`
    : slips === null ? `${RECALL_UNREAD} Spread the questions evenly across the usual ways this topic goes wrong.\n\n`
    : `The desk has recorded no mistakes for this student on this topic. Spread the questions evenly across the usual ways this topic goes wrong.\n\n`;
  const asked = assemble("practice-calc", {
    system: [say("stance", calcSystem(topicId))],
    prompt: [
      say("topic", `Topic: ${t?.name ?? topicId}\n${t?.blurb ?? ""}`.trim()),
      say("learner", learner.trim()),
      ...notesPart(memory),
      say("slips", known.trim()),
      dataList("avoid", "Do not repeat any of these, which the student already has", avoid),
      say("ask", `Write ${want} specs for practice questions on this topic, using only these shapes:\n${shapes.map((s) => `- ${SHAPE_LINES[s]}`).join("\n")}\n` +
        `Rules:\n` +
        `- Use small integers and simple fractions (1/2, -3/4) as parameters and coefficients; write a point as a number or a constant such as pi/4, in plain notation.\n` +
        `- Every question must be workable by hand in a few minutes.\n` +
        (requires ? REQUIREMENT_LINES[requires] : "") +
        // an equation in x and y is no function of x: its chain rule is y inside a power or a function (rules/calc meetsRequirement)
        (requires === "composition" && shapes.includes("implicit-derivative") ? "- An implicit-derivative equation meets this with y inside a power or a function (y^2, sin(y), e^y).\n" : "") +
        `- Vary the difficulty and the kind of function, and give each spec a difficulty from 1 (gentlest) to 5 (hardest).\n` +
        (leavesUnused(shapes) ? `- A field the shape does not use is left as an empty string (0 for steps).\n` : "") +
        `- Do not work any question out: give the specs only.`),
    ],
  });
  // thinking off: writing nine short specs is not a reasoning task and the desk checks every one in code. Measured live
  // (tools/calc-model-yield.cjs, 6 topics): on = 62-90 s a call with two engine timeouts, off = 7-14 s and every set made
  return text<{ specs: unknown[] }>({ ...asked, schema: calcSchema(shapes, want), accept: CALC_ACCEPT, model: "fast", thinking: false, use: "practice" });
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
function toSpec(raw: unknown, shapes: (CalcShape | Calc2SpecShape)[]): { spec: CalcSpec | Calc2Spec; difficulty: number } | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (RESULT_KEYS.some((k) => k in r)) return null;
  const shape = r.shape as CalcShape | Calc2SpecShape;
  if (!shapes.includes(shape) || typeof r.f !== "string" || !r.f.trim()) return null;
  const out: Record<string, unknown> = { shape, f: r.f.trim() };
  for (const k of PARAMS[shape]) {
    const v = r[k];
    if (k === "side") { if (v === "+" || v === "-") out.side = v; }
    else if (k === "kind" || k === "steps" || k === "pieces" || k === "rule") out[k] = v;
    else if (k === "on") out.on = Array.isArray(v) ? v.map((x) => point(x)) : v;
    else out[k] = point(v, shape === "limit" && k === "at");
  }
  const d = Number(r.difficulty);
  return { spec: out as unknown as CalcSpec | Calc2Spec, difficulty: Number.isFinite(d) ? Math.min(5, Math.max(1, Math.round(d))) : 3 };
}

const sameKey = (q: string) => q.replace(/\s+/g, "").toLowerCase();

/**
 * A Calculus 1 set: at most n + 3 specs asked for (the topic's own shapes, typed parameters, a difficulty, no result
 * anywhere), each kept only when it is on the topic's list, well formed (rules/calc), meets the topic's structural
 * requirement if it names one (MB-B30: calc1-chain keeps compositions only, rules/calc meetsRequirement), printable,
 * not stating its own result in its question, and not a question already kept; then ordered by difficulty and the
 * expression's length, and the first n taken. A second round asks for what is still missing, naming what is kept. The item is
 * { n, question: the printed question, spec } - the spec carries only what the question prints.
 */
async function makeCalcItems(topicId: string, learnerId: string, n: number, word?: boolean | number, learner = "", system?: SchoolSystem): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
  const me = recallLearner(learnerId);
  const memory = me;
  const slips = me ? me.skills[topicId]?.slips ?? [] : null;
  const shapes = shapesOf(topicId);
  const requires = requirementOfTopic(topicId);
  const kept: { spec: CalcSpec | Calc2Spec; question: string; difficulty: number }[] = [];
  const seen = new Set<string>();
  let provider = "";
  let ms = 0;
  let tries = 0;

  for (let round = 0; round < 2 && kept.length < n; round++) {
    const want = round === 0 ? n + 3 : n - kept.length + 3;
    const r = await askCalc(topicId, shapes, memory, slips, want, kept.map((k) => k.question), learner, requires);
    tries++;
    provider = r.provider;
    ms += r.ms;
    for (const raw of Array.isArray(r.json?.specs) ? r.json.specs : []) {
      const c = toSpec(raw, shapes);
      // wellFormed first: question() is only asked of a spec the desk can read whole
      if (!c || !wellFormed(c.spec).ok) continue;
      // the topic's own structural requirement (MB-B30: a chain-rule function is a composition), dropped like a malformed spec
      if (!meetsRequirement(c.spec, requires)) continue;
      const q = printed(c.spec, system);
      // a question that prints its own result (differentiate e^x) is no question
      if (!q || leaksCalc(c.spec, q.plain)) continue;
      const k = sameKey(q.plain);
      if (seen.has(k)) continue;
      seen.add(k);
      kept.push({ spec: c.spec, question: q.plain, difficulty: c.difficulty });
    }
  }

  const ordered = kept.slice().sort((a, b) => a.difficulty - b.difficulty || a.spec.f.length - b.spec.f.length);
  // the word problem (v2 M3a): drawn by code, the last question of the set, its parts counted toward n
  const template = word === true || typeof word === "number" ? wordTemplateFor(topicId) : undefined;
  const problem = template ? drawWord(template.id, typeof word === "number" ? word : freshSeed()) : null;
  const singles = problem && n - problem.parts.length >= 1 && ordered.length ? n - problem.parts.length : n;
  const items: PracticeItem[] = ordered.slice(0, singles).map((k, ix) => ({ n: ix + 1, question: k.question, spec: k.spec }));
  return { items: problem && singles < n ? [...items, ...wordItems(problem, items.length + 1)] : items, provider, ms, tries };
}

// ------------------------------------------------------------------ school units: written by code, no model call

/**
 * The tiers a set draws, in order, with how many of each (rules/stretch tierCounts): tier 1 and tier 2, and tier 3 on a
 * unit with a top rung (MB-B20) when the rung asks for any. Tiers with none are left out.
 */
function tierPlan(topicId: string, mix: Mix, n: number): [1 | 2 | 3, number][] {
  const { tier1, tier2, tier3 = 0 } = tierCounts(mix, n, !!topGeneratorFor(topicId));
  return ([[1, tier1], [2, tier2], [3, tier3]] as [1 | 2 | 3, number][]).filter(([t, want]) => t !== 3 || want > 0);
}
/** One spec for a seed and a tier: tiers 1 and 2 from the unit's generator, tier 3 from its top rung, each in the learner's money. */
function drawerFor(topicId: string, system?: SchoolSystem): ((seed: number, tier: 1 | 2 | 3) => SchoolSpec | null) | null {
  const make = generatorFor(topicId), top = topGeneratorFor(topicId);
  if (!make) return null;
  return (seed, tier) => (tier === 3 ? (top ? top(seed, system) : null) : make(seed, tier, system));
}

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
 *
 * `aim` (challenge-2026-10-07 math-buddy-A): the learner's live slips on this unit, newest first. With one, at least half
 * the set (three of six) is drawn where an aimed slip SHOWS (rules/school slipShows, pinned to the desk's own check), the
 * hits shared between the tiers, the tier mix and the six distinct questions kept, still no engine call. With no aim (none,
 * an empty list, or ids the unit cannot show) the set is exactly what it was.
 *
 * `paper` (MB-B40 cycle 14): the statements (gcse.ts codes) a marked paper lost on this unit, when the set was opened from
 * its recovery row. Where they pick SOME of a drawn tier's forms (rules/school paperSteer: converting to and from a percent,
 * simplifying a ratio, a triangle's area...) the same aimed draw takes half the set from those forms, and the result's
 * `aim` names the statements whose forms it holds. A paper aim that steers comes before the slips; one that steers nothing
 * (no listed statement, or one that covers its whole unit) leaves the set to the slips or the usual draw, with no `aim`.
 *
 * `system` (MB-B4): the learner's school system. The generator's money is the system's own (Kč in cz, € in de, £ in uk) and
 * each question is printed in the system's writing (a decimal comma in cz and de); none prints the set as it always was.
 *
 * MB-B20: on a unit with a top rung (rules/school TOP_TIER_GENERATORS) a "harder" set holds tier-3 items too (rules/stretch
 * tierCounts with `top`): the rung's own content (mixed numbers on the fractions units, a reverse percentage, two changes
 * or the years on percent change, a rounded side on Pythagoras, two events on probability), and at least one of them a word problem (the last tier-3 slot takes only a story
 * while none is kept). Every other set asks for no tier 3 and is drawn exactly as before.
 *
 * `topSlips` (cycle 18): the slips the learner made on this unit's top rung (rules/school topSlipsOf). Where they pick SOME
 * of the rung's kinds (rules/school topSteer: the amount before a change after "took the percent of the new amount", two
 * draws after "put the first one back", a shorter side after "added the squares for a shorter side"), each tier-3 item
 * of another kind is drawn again from those kinds, as a bare item - all but the set's first word problem, which is kept,
 * so the pair still holds one. Tiers 1 and 2 are drawn exactly as without them (usual, slip-aimed or paper-steered), and
 * the result's `topAim` names the slips whose kinds the redrawn items hold - only when an item was redrawn. None, or slips
 * that pick nothing, and the set is byte for byte what it was.
 */
export function makeSchoolItems(topicId: string, n = 6, seed: number = freshSeed(), mix: Mix = "standard", stretch = false, aim: readonly string[] = [], system?: SchoolSystem, paper: readonly string[] = [], topSlips: readonly string[] = []): { items: PracticeItem[]; provider: string; ms: number; tries: number; aim?: string[]; topAim?: string[] } {
  const made = schoolSet(topicId, n, seed, mix, stretch, aim, system, paper);
  const steer = Array.isArray(topSlips) && topSlips.length ? topSteer(topicId, topSlips) : null;
  const aimed = steer ? aimTop(topicId, made.items, seed, steer, system) : null;
  return aimed ? { ...made, items: aimed.items, topAim: aimed.slips } : made;
}

/**
 * The tier-3 items of a drawn set aimed at a top steer (cycle 18, see makeSchoolItems): the set's first word problem kept,
 * every other tier-3 item of a kind the steer does not name replaced in its place by the next bare item of a named kind
 * from `seed` onward - well formed, printable, not leaking, a question not already in the set. Null when nothing was
 * replaced (no tier 3, every slot already of an aimed kind, or the rung ran dry): the draw did not change.
 */
function aimTop(topicId: string, items: PracticeItem[], seed: number, steer: { forms: string[]; slips: string[] }, system?: SchoolSystem): { items: PracticeItem[]; slips: string[] } | null {
  const top = topGeneratorFor(topicId);
  const t3 = items.map((it, ix) => ({ it, ix })).filter(({ it }) => it.tier === 3);
  const story = t3.find(({ it }) => storyOf(it.spec));
  const open = t3.filter((x) => x !== story && !steer.forms.includes(topFormOf(topicId, x.it.spec) ?? ""));
  if (!top || !open.length) return null;
  const seen = new Set(items.map((it) => sameKey(it.question)));
  const found: { spec: SchoolSpec; question: string; form: string }[] = [];
  for (let k = 0; k < SCHOOL_TRIES && found.length < open.length; k++) {
    const spec = top((seed + k) % 0x100000000, system);
    if (!spec || !schoolWellFormed(spec).ok || storyOf(spec)) continue;
    const form = topFormOf(topicId, spec);
    if (!form || !steer.forms.includes(form)) continue;
    // the leak check reads the question as the desk prints it with no system, as every draw here does (MB-B4)
    const q = schoolQuestion(spec, system);
    if (!q || leaksSchool(spec, schoolQuestion(spec)?.plain)) continue;
    const key = sameKey(q.plain);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ spec, question: q.plain, form });
  }
  if (!found.length) return null;
  const out = items.slice();
  found.forEach((f, i) => { const at = open[i].ix; out[at] = { ...out[at], question: f.question, spec: f.spec }; });
  const forms = found.map((f) => f.form), by = TOP_SLIP_FORMS[topicId];
  return { items: out, slips: steer.slips.filter((s) => by[s].some((x) => forms.includes(x))) };
}

/** The set as drawn before any top steer (cycle 18): paper-steered, slip-aimed or usual, as makeSchoolItems describes. */
function schoolSet(topicId: string, n: number, seed: number, mix: Mix, stretch: boolean, aim: readonly string[], system: SchoolSystem | undefined, paper: readonly string[]): { items: PracticeItem[]; provider: string; ms: number; tries: number; aim?: string[] } {
  const t0 = Date.now();
  // a paper's lost statements (MB-B40 cycle 14) steer the set when they pick some of a drawn tier's forms (rules/school
  // paperSteer); the aimed half is then drawn from those forms, and the set names only the statements it was drawn for
  const steer = paperSteer(topicId, paper, tierPlan(topicId, mix, n).map(([t]) => t));
  if (steer) {
    const hit = (spec: SchoolSpec, tier: 1 | 2 | 3) => tier !== 3 && !!steer.forms[tier]?.includes(formOf(topicId, spec) ?? "");
    const drawn = aimedSchoolDraw(topicId, n, seed, mix, hit, system);
    const forms = drawn.filter((d) => d.hit).map((d) => formOf(topicId, d.spec));
    const led = steer.codes.filter((c) => STATEMENT_FORMS[topicId][c].some((f) => forms.includes(f)));
    if (led.length) return { items: schoolOut(drawn, n, stretch), provider: "code", ms: Date.now() - t0, tries: 0, aim: led };
  }
  const own = Object.prototype.hasOwnProperty.call(SCHOOL_UNIT_SLIPS, topicId) ? SCHOOL_UNIT_SLIPS[topicId] : [];
  const live = (Array.isArray(aim) ? aim : []).filter((id): id is string => typeof id === "string" && own.includes(id));
  if (live.length) {
    const drawn = aimedSchoolDraw(topicId, n, seed, mix, (spec, tier) => tier !== 3 && live.some((id) => slipShows(spec, id)), system);
    return { items: schoolOut(drawn, n, stretch), provider: "code", ms: Date.now() - t0, tries: 0 };
  }
  const draw = drawerFor(topicId, system);
  const kept: { spec: SchoolSpec; question: string; tier: 1 | 2 | 3 }[] = [];
  const seen = new Set<string>();
  for (const [tier, want] of tierPlan(topicId, mix, n)) {
    let got = 0, stories = 0;
    for (let k = 0; draw && k < SCHOOL_TRIES && got < want; k++) {
      const spec = draw((seed + k) % 0x100000000, tier);
      if (!spec || !schoolWellFormed(spec).ok) continue;
      // MB-B20: the last tier-3 slot takes only a word problem while none is kept, so a top-rung pair holds one
      if (tier === 3 && got === want - 1 && stories === 0 && !storyOf(spec)) continue;
      // the leak check reads the question as the desk prints it with no system: a decimal comma or '63 %' split at its comma
      // or space is the question's own number, not its answer (MB-B4), and the numbers printed are the same
      const q = schoolQuestion(spec, system);
      if (!q || leaksSchool(spec, schoolQuestion(spec)?.plain)) continue;
      const key = sameKey(q.plain);
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push({ spec, question: q.plain, tier });
      got++;
      if (storyOf(spec)) stories++;
    }
  }
  return { items: kept.slice(0, n).map((k, ix) => ({ n: ix + 1, question: k.question, spec: k.spec, tier: k.tier, ...(stretch ? { stretch: true as const } : {}) })), provider: "code", ms: Date.now() - t0, tries: 0 };
}

/** A drawn item of an aimed set: its spec, printed question, tier, seed offset, and whether it is one the aim asked for. */
type Drawn = { spec: SchoolSpec; question: string; tier: 1 | 2 | 3; k: number; hit: boolean };
/** The items of a set as the desk carries them, numbered from 1. */
const schoolOut = (kept: { spec: SchoolSpec; question: string; tier: 1 | 2 | 3 }[], n: number, stretch: boolean): PracticeItem[] =>
  kept.slice(0, n).map((k, ix) => ({ n: ix + 1, question: k.question, spec: k.spec, tier: k.tier, ...(stretch ? { stretch: true as const } : {}) }));

/**
 * The aimed set, one draw for both aims: `hit` says which specs the aim asks for - where a live slip SHOWS (the learner's
 * slips) or of a form a paper's lost statement names (rules/school paperSteer); tier 3 is never a hit. Each tier is
 * scanned as makeSchoolItems scans it, the hits kept apart from the rest. Half the set (rounded up) is taken from the
 * hits, alternating the tiers while both have some, then each tier is filled to its mix from its other specs, and from
 * more hits when it has no others. In draw order within a tier.
 */
function aimedSchoolDraw(topicId: string, n: number, seed: number, mix: Mix, isHit: (spec: SchoolSpec, tier: 1 | 2 | 3) => boolean, system?: SchoolSystem): Drawn[] {
  const draw = drawerFor(topicId, system);
  const seen = new Set<string>();
  const pools = tierPlan(topicId, mix, n).map(([tier, want]) => {
    const hits: Drawn[] = [], rest: Drawn[] = [];
    for (let k = 0; draw && k < SCHOOL_TRIES && (hits.length < want || rest.length < want); k++) {
      const spec = draw((seed + k) % 0x100000000, tier);
      if (!spec || !schoolWellFormed(spec).ok) continue;
      // the leak check reads the question as the desk prints it with no system: a decimal comma or '63 %' split at its comma
      // or space is the question's own number, not its answer (MB-B4), and the numbers printed are the same
      const q = schoolQuestion(spec, system);
      if (!q || leaksSchool(spec, schoolQuestion(spec)?.plain)) continue;
      // MB-B20: the aim works on tiers 1 and 2; a tier-3 item is always the rest (a rounded Pythagoras side shows slips, a
      // mixed number none), so its pair keeps the rung's word problem: its last slot takes only a story while none is kept
      const hit = tier !== 3 && isHit(spec, tier);
      if ((hit ? hits : rest).length >= want) continue;
      if (tier === 3 && !hit && rest.length === want - 1 && !rest.some((d) => storyOf(d.spec)) && !storyOf(spec)) continue;
      const key = sameKey(q.plain);
      if (seen.has(key)) continue;
      seen.add(key);
      (hit ? hits : rest).push({ spec, question: q.plain, tier, k, hit });
    }
    return { tier, want, hits, rest, take: 0 };
  });
  let aimed = Math.min(Math.ceil(n / 2), pools.reduce((s, p) => s + Math.min(p.hits.length, p.want), 0));
  while (aimed > 0) {
    let moved = false;
    for (const p of pools) if (aimed > 0 && p.take < Math.min(p.hits.length, p.want)) { p.take++; aimed--; moved = true; }
    if (!moved) break;
  }
  const kept = pools.flatMap((p) => {
    const chosen = p.hits.slice(0, p.take), others = p.rest.slice(0, p.want - chosen.length);
    const more = p.hits.slice(p.take, p.take + p.want - chosen.length - others.length);
    return [...chosen, ...others, ...more].sort((a, b) => a.k - b.k);
  });
  return kept;
}
