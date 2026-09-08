/**
 * Generate a practice set — and never show an item the desk has not checked itself.
 *
 * The model writes the questions and states the answers. Both are evidence, not truth: an item
 * whose stated answer is wrong poisons the marking, the skill estimate and the next topic. So
 * every candidate goes through `verify` before it is allowed into the set, and a candidate that
 * fails is simply discarded. We ask for n + 3 in the first call so the usual handful of rejects
 * costs nothing; only if the survivors still fall short do we go back for more.
 */
import { text } from "../engines/text";
import { topic } from "../library/syllabus";
import { getLearner } from "../session/learners";
import { slip as slipById, type Slip } from "../rules/maths";
import { verify } from "./verify";
import type { PracticeItem } from "../session/store";

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
    seen.add(k);
    out.push({ question: q, answer: a });
  }
  return out;
}

export async function makeItems(
  topicId: string,
  learnerId: string,
  n = 6,
): Promise<{ items: PracticeItem[]; provider: string; ms: number; tries: number }> {
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
      items.push({ n: items.length + 1, question: c.question, answer: c.answer });
    }
  }

  return { items: items.slice(0, n).map((it, ix) => ({ ...it, n: ix + 1 })), provider, ms, tries };
}
