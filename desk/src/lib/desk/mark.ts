/**
 * Mark one photo of the whole worked set — then re-check the marker.
 *
 * The vision model reads the handwriting and offers a verdict. That is evidence, not the mark. `verify` is the
 * truth: it substitutes the model's own solution into the question, and the student's answer too.
 * When the desk can check, it decides: if the model's own solution holds (the model can solve the item, so its
 * read of the page is trusted) and the student's answer substitutes cleanly (it reads as a number and the
 * question evaluates, so it plainly holds or plainly fails), the substitution is the verdict, and a model verdict
 * that disagrees with it is overruled. When the desk cannot check, it says nothing — it asks ("not sure"): the
 * model's solution does not hold, or the student's answer is missing or does not read as a number. The model
 * reports no confidence in its read, so an answer that does not parse is the only doubtful-read signal there is.
 * A wrong guess in front of a child costs more than a question does; so does a question about an item the
 * arithmetic has already settled. (S50: this replaces "when they disagree the desk does not pick a winner".)
 *
 * A Calculus item (one with a `spec`, rules/calc) is marked by CODE alone. For a set that carries specs the model is
 * asked only to READ the page - the final answer as plain text, the working line by line, a slip id from the topic's
 * list - never to solve and never for a verdict; a verdict or a solution it volunteers is never read. The verdict is
 * checkAnswer(spec, studentAnswer) (rules/maths settleSpec): right, wrong, or unsure when the answer cannot be read or
 * compared - ASK, and no attempt. The slip is code's own (sign, lost-constant, forgot-chain) where it names one, else the model's
 * pick from the topic's vocabulary, only on a wrong item. A Calculus item has no pen position (locate reads linear lines).
 *
 * A school item (a `spec` of a school shape, rules/school; Family W5b and W7: every school unit, fractions to mean and range) is marked by CODE
 * the same way, with its own reading prompt: the model is asked for the child's final answer and working exactly as
 * written - a fraction, a mixed number, a decimal with its comma or point - never an expression in x, never a verdict,
 * a solution or a slip. The verdict is rules/school check(spec, studentAnswer, system), `system` being the seated
 * learner's school system (the route reads it; UK when none): unsure asks and records nothing. The slip is the one
 * code detects from the spec's operands, from the unit's closed list. Still one vision call per sheet.
 *
 * An item of a set asked for as "a step up" (`stretch`, Family W8) is marked exactly as any other; only its attempt goes to
 * the learner's step-up record instead of the usual one (land -> recordAttempt). The history line is the same line.
 *
 * The decision itself - which kind an item is and whether the answer is right - is rules/kinds (judgeItem, judgeSet), shared
 * with the typed path: this file is the model's half (three reading prompts and schemas) and the one place a set lands.
 *
 * Nothing here ever puts the answer on screen, and no `said` line carries a value.
 */
import { vision } from "../engines/vision";
import { notationLine } from "./read";
import { DeskSaid } from "./job";
import { NOT_SURE, rightLine, slipVocabulary, type Settled } from "../rules/maths";
import { DEFAULT_SCHOOL_SYSTEM, unitOf } from "../rules/school";
import { judgeItem, judgeSet, kindOfSheet, readQuestion, unsureLine, type JudgeCtx, type Judged, type Read } from "../rules/kinds";
import { getLearner, saveLearner, withAttempt, withDigest, withHistory } from "../session/learners";
import { mathsEntry } from "../rules/digest";
import { calcTopics, shapesOfTopic, topicIn } from "../library/paths";
import { partPlace } from "../rules/calc-word";
import type { Page, Practice, PracticeItem, SchoolSystem } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          studentAnswer: { type: "string" },
          studentWorking: { type: "string" },
          verdict: { type: "string", enum: ["right", "wrong"] },
          solution: { type: "string" },
          slip: { type: "string" },
        },
        required: ["n", "studentAnswer", "studentWorking", "verdict", "solution", "slip"],
      },
    },
  },
  required: ["items"],
};

/** A Calculus page, read: what is written, and a slip pick. No verdict and no solution is asked for. */
const CALC_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          studentAnswer: { type: "string" },
          studentWorking: { type: "string" },
          slip: { type: "string" },
        },
        required: ["n", "studentAnswer", "studentWorking", "slip"],
      },
    },
  },
  required: ["items"],
};

/**
 * The sheet as the Calculus reading prompt lists it: "n. question" per item, as always. A multi-part question (v2 M3a,
 * rules/calc-word) shows its stem once, then each part by its own item number and its letter, and the prompt says how a
 * part is reported: by that number. A set with no parts is listed, and asked, exactly as before.
 */
function calcSheet(items: readonly PracticeItem[]): { sheet: string; parts: string } {
  const lines: string[] = [], asked: string[] = [];
  items.forEach((it, i) => {
    const at = partPlace(items, i);
    if (!at) { lines.push(`${it.n}. ${it.question}`); return; }
    if (at.first) lines.push(`Question ${at.q}, in parts: ${it.stem}`);
    lines.push(`${it.n}. Part (${at.label}) of question ${at.q}: ${it.question}`);
    asked.push(`part (${at.label}) of question ${at.q} as item ${it.n}`);
  });
  const parts = asked.length
    ? `Some questions are in parts, which the student labels (a), (b) and so on. Report each part as its own item, by the item number listed before it: ${asked.join(", ")}.\n`
    : "";
  return { sheet: lines.join("\n"), parts };
}

function calcPrompt(practice: Practice, vocab: string, system: SchoolSystem): string {
  const { sheet, parts } = calcSheet(practice.items);
  return `This is a photo of a student's handwritten working on these ${practice.items.length} Calculus ${parts ? "items" : "questions"}:\n${sheet}\n\n` +
    parts +
    `${notationLine(system)}\n` +
    `Read the page. For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final answer the student wrote, as plain text: an expression in x using ^ for powers, sqrt(), e^, ln, sin, cos and so on, ` +
    `or a number or a fraction. Include +C if they wrote it. Copy what they wrote; empty string if they wrote no final answer.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n` +
    `- slip: if you can see a mistake in their working, its id from this list, or the word "unclear" if you cannot tell or see none:\n${vocab}\n\n` +
    `Do not solve the questions and do not judge the answers - only read what is on the page. ` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/** A school page, read: what is written and nothing else. No slip is asked for: a school slip is detected by code. */
const SCHOOL_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          studentAnswer: { type: "string" },
          studentWorking: { type: "string" },
        },
        required: ["n", "studentAnswer", "studentWorking"],
      },
    },
  },
  required: ["items"],
};

/** The reading prompt for a school sheet: the child's working and final answer as written, never an expression in x. */
export function schoolPrompt(practice: Practice, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): string {
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");
  return `This is a photo of a student's handwritten working on these ${practice.items.length} school maths questions:\n${sheet}\n\n` +
    `${notationLine(system)}\n` +
    `Read the page. For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final answer the student wrote, copied exactly as written: a whole number, a fraction such as 5/12, ` +
    `a mixed number such as 1 5/12, a decimal with the comma or point they used, or a percentage with its % sign such as 37.5%, ` +
    `with any currency sign or unit they wrote beside it (€7.15, 45 kg); a ratio with its colon such as 2:3, or two amounts ` +
    `as they wrote them such as 24 and 36. Do not simplify, convert or correct it. ` +
    `Empty string if they wrote no final answer.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n\n` +
    `Do not solve the questions and do not judge the answers - only read what is on the page. ` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/** The linear reading prompt: the model's own value of x is asked for, as the trust gate in rules/kinds judgeItem needs it. */
function linearPrompt(practice: Practice, vocab: string, system: SchoolSystem): string {
  const sheet = practice.items.map((i) => `${i.n}. ${i.question}`).join("\n");
  return `This is a photo of a student's handwritten working on these ${practice.items.length} equations:\n${sheet}\n\n` +
    `${notationLine(system)}\n` +
    `For each numbered item, report:\n` +
    `- n: the item number.\n` +
    `- studentAnswer: the final value of x the student wrote, copied exactly as the student wrote it: with their decimal comma or point, a fraction or a mixed number, not converted or simplified. Empty string if they wrote none.\n` +
    `- studentWorking: their working transcribed exactly as written, one step per line (a newline between steps), or an empty string if there is none.\n` +
    `- verdict: "right" if you believe their final value is correct, "wrong" otherwise.\n` +
    `- solution: YOUR OWN value of x for that equation, worked out yourself, as a plain number or simple fraction.\n` +
    `- slip: the id of the mistake you think they made, chosen from this list, or the word "unclear" if you cannot tell:\n${vocab}\n\n` +
    `Plain text only, no LaTeX. Report every item, in order. Do not invent items that are not on the page.`;
}

/**
 * `stillSame` is asked after the model answers, as explainItem asks `stillUnsure`: is this set still the one on the
 * desk, unmarked? When it is not (another set landed, the desk was reset), the verdicts are returned with
 * `landed: false` and nothing reaches the learner record - no attempt, no history line.
 *
 * The sheet is READ by one prompt, chosen by the kinds on it (rules/kinds kindOfSheet: school, then Calculus, else linear),
 * and JUDGED item by item by each item's own kind (rules/kinds judgeSet): a mixed sheet is marked as its typed answers are.
 */
export async function markSet(
  imageBase64: string,
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean = () => true,
  /** The seated learner's school system, for reading a school item's answer (rules/school readNumber). UK when not given. */
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): Promise<MarkResult> {
  const { reads, provider, ms } = await readSheet(imageBase64, practice, slipVocabulary(practice.topic), system);
  return markReads(practice, learnerId, stillSame, reads, { topic: practice.topic, system }, { provider, ms });
}

/**
 * One vision call reads a sheet: by the kinds on it (rules/kinds kindOfSheet), with `vocab` the slip list a Calculus or a
 * linear reading offers. Only what each reader asks for is kept - never a verdict, a solution only from the linear reading -
 * and a page with no answer to any of its questions is the failed mark MK11 names (EMPTY_MARK). Shared by a desk set and a page.
 */
async function readSheet(imageBase64: string, practice: Practice, vocab: string, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): Promise<{ reads: Read[]; provider: string; ms: number }> {
  const kind = kindOfSheet(practice.items);
  const reading = kind === "school" ? { prompt: schoolPrompt(practice, system), schema: SCHOOL_SCHEMA }
    : kind === "calc" ? { prompt: calcPrompt(practice, vocab, system), schema: CALC_SCHEMA }
    : { prompt: linearPrompt(practice, vocab, system), schema: SCHEMA };
  const { json, provider, ms } = await vision<{ items: Read[] }>({ imageBase64, ...reading, use: "mark" });

  // only what each reader asks for is read: never a verdict, and a solution only from the linear reading (the trust gate)
  const reads = (Array.isArray(json?.items) ? json.items : []).filter((m) => m && typeof m.n === "number").map((m): Read => ({
    n: m.n, studentAnswer: m.studentAnswer, studentWorking: m.studentWorking,
    ...(kind !== "school" ? { slip: m.slip } : {}),
    ...(kind === "linear" ? { solution: typeof m.solution === "string" ? m.solution : "" } : {}),
  }));
  // MK11: a page the desk could not read is a failed mark, never a marked set. Empty = no read matches a question of the
  // set with a non-blank answer. One such answer lands the set as before (no completeness check for a partial read).
  const asked = new Set(practice.items.map((i) => i.n));
  if (!reads.some((r) => typeof r.n === "number" && asked.has(r.n) && typeof r.studentAnswer === "string" && r.studentAnswer.trim() !== "")) throw new DeskSaid(EMPTY_MARK);
  return { reads, provider, ms };
}

/** A photo read that found no answer to any question of the set: the mark fails with this and nothing is recorded. */
export const EMPTY_MARK = "The desk could not find your answers on that photo. Snap the whole sheet again.";

/**
 * A set answered by typing (Family W6): the phone sends one string per question, in item order, and CODE marks each one
 * at once - no photo, no vision call, no model call of any kind (a test makes the vision and text engines throw). The
 * verdicts are the ones a photographed sheet's transcribed strings would get, because they come from the same judge
 * (rules/kinds judgeItem), item by item, whatever mix of kinds the set carries:
 *   - an item with a `spec` (school or Calculus) is settled by `settleSpec`, `system` being the seated learner's (the route
 *     reads it): a school answer by rules/school check, a Calculus one by checkAnswer, the slip being code's own where it
 *     names one, never a model's pick;
 *   - an item WITHOUT a spec (a linear equation the model wrote) is settled by `settle`, the substitution rule marking
 *     uses, from the typed value ("x = 4" and "4" are the same value; a value in x is not accepted). A photographed
 *     linear item needs the model's own solution to hold before its read of the page is trusted; a typed one has no model
 *     to trust, so the desk asks the same of the equation itself: it must be one the desk can solve in code (a single
 *     linear root, `rootOf`) and not an identity, else it is "not sure", never a guess.
 * A BLANK answer is unsure - "not sure", no verdict, never wrong, no attempt - exactly as the photo path treats an
 * answer the model read as empty. Junk that does not read is unsure the same way. The typed string is the item's
 * `studentAnswer`; there is no working and no pen position (`slipAt` is never set, so the sheet draws the answer line,
 * as it does for any item with an answer and no located slip).
 * Then the SAME `land`: one attempt per settled item, one history line, only while the set is still the one on the desk.
 */
export function markTyped(
  answers: readonly string[],
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean = () => true,
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): MarkResult {
  // what was typed, on one line: a stray newline or run of spaces is the keyboard's, not the child's
  const reads = practice.items.map((item, i): Read => ({ n: item.n, studentAnswer: typeof answers[i] === "string" ? oneLine(answers[i]) : "" }));
  return markReads(practice, learnerId, stillSame, reads, { topic: practice.topic, system, typed: true }, { provider: "code", ms: 0 });
}

/**
 * The ONE typed second go of a ringed item (route /api/second): the typed answer judged by the same judge marking uses
 * (rules/kinds judgeItem), in code and with no model, to a verdict - or null when the answer cannot be read (blank, or not
 * a value the desk can compare), so the go is not spent. Records nothing: a second go is practice, not evidence.
 */
export function secondGo(item: PracticeItem, answer: string, topic: string, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): "right" | "wrong" | null {
  return judgeItem(item, { studentAnswer: oneLine(answer) }, { topic, system })?.verdict ?? null;
}

/**
 * The answer an unsure item is entered with (the X7 door, route /api/second), judged by the same code judge with no model: the
 * whole settled verdict (verdict, slip, line, pen), or null when the answer cannot be read, so the go is not spent. It records
 * nothing itself; the route settles the item with it.
 */
export function enteredGo(item: PracticeItem, answer: string, topic: string, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): Settled | null {
  return judgeItem(item, { studentAnswer: oneLine(answer) }, { topic, system });
}

/** What was typed, on one line: a control character (a newline, a tab) or a run of spaces is the keyboard's, not the child's. */
const oneLine = (t: string) => Array.from(t, (c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? " " : c)).join("").split(" ").filter(Boolean).join(" ");

/** The one way a set is marked: its reads judged item by item (rules/kinds), then landed once. */
function markReads(practice: Practice, learnerId: string, stillSame: () => boolean, reads: readonly Read[], ctx: JudgeCtx & { typed?: boolean }, run: { provider: string; ms: number }): MarkResult {
  return land(practice, learnerId, stillSame, judgeSet(practice, reads, ctx), run);
}

/** What a marked set comes back as: the items, which engine read it and how long, how many it asked about, and whether it reached the record. */
export type MarkResult = { items: PracticeItem[]; provider: string; ms: number; unsure: number; landed: boolean };

/** Record a marked set once, and only while it is still the set on the desk. */
function land(
  practice: Practice,
  learnerId: string,
  stillSame: () => boolean,
  judged: Judged,
  run: { provider: string; ms: number },
): MarkResult {
  const { items, attempts, unsure } = judged;
  // 9 - the desk has moved on while the model read the page: the verdicts are not this set's to record
  if (!stillSame()) return { items, ...run, unsure, landed: false };

  // only settled items reach the record, each once, and only for the set still on the desk
  // a step-up item's attempt goes to the step-up record only (learners.ts recordAttempt, Family W8)
  // WD10: the attempts, the history line and the digest entry are applied to one learner and written in ONE save, so a failed
  // save writes none of them and a Try again records each once.
  let l = getLearner(learnerId);
  for (const a of attempts) l = withAttempt(l, practice.topic, a.right, a.slip, { stretch: a.stretch, tier: a.tier, shows: a.shows });
  // what happened, in one line the home screen can read back: never invented, always these counts
  // (rules/maths; a later settle restates the same line from the same verdicts - session/store). The label is the
  // topic's name on whichever path it belongs to (topicIn), as session/store's restate reads it.
  l = withHistory(l, {
    at: Date.now(), kind: "practice",
    label: topicIn(practice.topic)?.name ?? practice.topic,
    detail: rightLine(items),
  });
  // ...and the week's digest (Family W9, rules/digest): one entry for this set - counts, the unit, the step-up flag and
  // the most frequent code-detected slip - never a question or an answer. An explanation that settles an item later
  // restates it in place (session/store restateMarked), as it restates the history line.
  l = withDigest(l, mathsEntry(practice.topic, items, practice.stretch === true || items.some((i) => i.stretch === true), Date.now()));
  saveLearner(l);

  return { items, ...run, unsure, landed: true };
}

/**
 * A learner's own snapped maths page, marked (MB-B35, ask e78baa5a). Each page item is read into a spec by rules/kinds
 * readQuestion (a single Calculus or school spec); the one that reads is judged by the same code judge a desk set uses
 * (judgeItem), the learner's school system and all. An item that does not read - no spec, or a multi-part question, which a
 * page does not split into parts - is "not sure": never wrong, and no answer is shown or said. One vision call reads the
 * working of the items that read; nothing else is sent. The page's own items are never changed.
 *
 * It lands once, on the page's owner (`stillSame` false lands nothing): one history line that says it was their own sheet,
 * and no attempt - a page names no topic, so it adds no evidence to a skill. The verdicts are returned in page order.
 */
export const OWN_SHEET = "own sheet: ";
/** The history line for a marked page: every item the desk did not settle is "not sure" (an item it could not read is not one the learner skipped). */
const notSure = (items: readonly PracticeItem[]) => items.filter((i) => i.verdict !== "right" && i.verdict !== "wrong").length;
const pageLine = (items: readonly PracticeItem[]) => `${items.filter((i) => i.verdict === "right").length} of ${items.length} right${notSure(items) ? `, ${notSure(items)} not sure` : ""}`;
const NL = String.fromCharCode(10);

/** The spec each page item reads as, with the topic its slips come from: only the items that read have an entry. */
export function pageSpecs(page: Page, system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM): Map<number, { spec: unknown; topic: string }> {
  const out = new Map<number, { spec: unknown; topic: string }>();
  for (const it of page.items) {
    const q = readQuestion(it.text, system);
    if (q.calc) out.set(it.n, { spec: q.calc, topic: calcTopics().find((t) => (shapesOfTopic(t.id) as string[]).includes((q.calc as { shape: string }).shape))?.id ?? "" });
    else if (q.school) out.set(it.n, { spec: q.school, topic: unitOf(q.school) ?? "" });
  }
  return out;
}

export async function markPage(
  imageBase64: string,
  page: Page,
  learnerId: string,
  stillSame: () => boolean = () => true,
  system: SchoolSystem = DEFAULT_SCHOOL_SYSTEM,
): Promise<MarkResult> {
  const specs = pageSpecs(page, system);
  const readable = page.items.filter((i) => specs.has(i.n)).map((i): PracticeItem => ({ n: i.n, question: i.text, spec: specs.get(i.n)!.spec as PracticeItem["spec"] }));
  // the slips a reading may offer: the lists of the topics these items sit on
  const vocab = Array.from(new Set(readable.flatMap((i) => slipVocabulary(specs.get(i.n)!.topic).split(NL)).filter(Boolean))).join(NL);
  const { reads, provider, ms } = await readSheet(imageBase64, { topic: "", items: readable, marked: false }, vocab, system);
  const readFor = new Map(reads.map((r) => [r.n, r]));
  const items = page.items.map((it): PracticeItem => {
    const at = specs.get(it.n), read: Read = readFor.get(it.n) ?? {};
    const studentAnswer = typeof read.studentAnswer === "string" ? read.studentAnswer.trim() : "", studentWorking = typeof read.studentWorking === "string" ? read.studentWorking.trim() : "";
    const s = at ? judgeItem({ n: it.n, question: it.text, spec: at.spec }, read, { topic: at.topic, system }) : null;
    if (!s) {
      return at ? { n: it.n, question: it.text, studentAnswer, studentWorking, verdict: "unsure", said: unsureLine({ n: it.n, spec: at.spec }, read, { topic: at.topic, system }) }
        : { n: it.n, question: it.text, verdict: "unsure", said: NOT_SURE(it.n) };
    }
    return { n: it.n, question: it.text, studentAnswer, studentWorking, verdict: s.verdict, slip: s.slip, said: s.said, ...(s.slipAt ? { slipAt: s.slipAt } : {}) };
  });
  if (!stillSame()) return { items, provider, ms, unsure: notSure(items), landed: false };
  // one write: the learner's history line (their own sheet), nothing in a skill
  saveLearner(withHistory(getLearner(learnerId), { at: Date.now(), kind: "homework", label: page.title, detail: OWN_SHEET + pageLine(items) }));
  return { items, provider, ms, unsure: notSure(items), landed: true };
}
