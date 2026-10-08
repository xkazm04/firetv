/**
 * Read a photo of a marked paper (v2 M5c): the vision engine lists the paper's items in the raw form `cleanPaper`
 * (rules/recovery) takes, `{ q, marks, outOf, codes }`, and nothing more. Per item: the label as printed ('5(b)'), the
 * marks written on it, what it is out of, and up to MAX_CODES statement codes chosen from a list the prompt gives (each
 * statement's code with its can text), by what the question asks.
 *
 * The reader returns the raw rows only. `cleanPaper` decides what stands, never the reader: no row is filtered, fixed or
 * matched here. The model is asked to copy the numbers it sees and never to add, count, total or compare marks (the
 * vision engine must not be asked to count or to do arithmetic, engines/vision.ts). The prompt names no board or
 * specification (gcse.ts HONEST LIMITS).
 *
 * Wired to nothing (App Master ruling 1, 2026-10-08): no route, no event, no phone or TV surface reads it. Typed entry
 * stays the door until tools/paper-probe.cjs, run live on the owner's PC, maps at least 85% of items to the right unit.
 */
import { vision } from "../engines/vision";
import { STATEMENTS } from "../library/gcse";
import { MAX_CODES } from "../rules/recovery";

/** One row as the model gives it: the shape `cleanPaper` takes, unchecked beyond the schema. */
export interface ReadRow { q: string; marks: number; outOf: number; codes: string[]; }

/** The answer's shape. No enum on the codes and no cap on the lists: an unknown code or a fourth code is cleanPaper's to drop, not a failed read. */
export const PAPER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    q: { type: "string" }, marks: { type: "integer" }, outOf: { type: "integer" }, codes: { type: "array", items: { type: "string" } } },
    required: ["q", "marks", "outOf", "codes"] } } },
  required: ["items"],
};

/** What the model is asked to do, without the statement list. It asks for copying and choosing, never for arithmetic on marks. */
export const PAPER_ASK =
  "This is a photo of a marked maths paper. List every question or question part that has a mark written beside it, in the order printed. " +
  "For each one give: q, its label as printed, the question number with its part letter when it has one, like 5 or 5(b); " +
  "marks, the number the marker wrote as scored (in 2/3 it is the 2); " +
  "outOf, the number it is out of (in 2/3 it is the 3, the same as the number printed in brackets beside the question); " +
  `codes, at most ${MAX_CODES} codes from the list below for what the question asks the learner to do, chosen by the question's own words. ` +
  "Copy every number as it is written. Do not solve the questions. Give only questions that are on the page, and only codes from the list.";

/** The statement list the codes are chosen from: one line per statement, its code and its can text. */
export function statementList(): string {
  return STATEMENTS.map((s) => `${s.code}: ${s.can}`).join("\n");
}

/** The whole prompt: the ask, then the list. */
export function paperPrompt(): string {
  return `${PAPER_ASK}\n\nThe list (code: what a learner can do):\n${statementList()}`;
}

/** Read one marked paper. The rows come back as the model gave them; clean them with `cleanPaper` before anything else reads them. */
export async function readPaper(imageBase64: string): Promise<{ rows: ReadRow[]; provider: string; ms: number }> {
  const { json, provider, ms } = await vision<{ items: ReadRow[] }>({ imageBase64, prompt: paperPrompt(), schema: PAPER_SCHEMA });
  return { rows: json.items, provider, ms };
}
