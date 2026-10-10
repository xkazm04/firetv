/**
 * Recovery from a failed paper (v2 M5a, the pure core M5b's surfaces and M5c's photo path read): a marked Foundation
 * paper, item by item, becomes the desk topics where its marks were lost, in an order the prerequisites allow, and the
 * statements the desk cannot teach yet.
 *
 * A paper is a list of items `{ q, marks, outOf, codes }`: `q` is the label the paper prints ('5(b)'), `marks` what was
 * scored, `outOf` what the item is worth, `codes` statement codes of the map in library/gcse.ts. `cleanPaper` is the one
 * validation and never guesses: an item it cannot read is dropped with a reason, a code it does not know is dropped
 * (never matched to a near one), and an item left with no code it knows is kept apart in `unmapped`, its lost marks
 * still in the paper's total.
 *
 * The paper decides, not the desk (App Master ruling 2, 2026-10-08): no learner record is read here, so a topic the desk
 * calls secure that lost marks on the paper is still in the recovery.
 *
 * HONEST LIMITS (as gcse.ts): the map is unverified, so no string returned here for a screen names the board or the
 * specification while `gcseClaimAllowed()` is false; a label or a code typed with that name in it is not echoed.
 *
 * Pure: types and library data only; no store, no engine, no fs, no model.
 */
import { STATEMENTS, gcseClaimAllowed, type Statement } from "../library/gcse";
import { topicsOf, type PathTopic } from "../library/paths";

/**
 * The caps a Foundation paper allows. Source: the Pearson Edexcel GCSE (9-1) Mathematics (1MA1) specification's
 * assessment overview, Foundation tier: three papers, each 1 hour 30 minutes and 80 marks. UNVERIFIED, as gcse.ts is:
 * from the host's knowledge of the published document, not checked against it by a person.
 *   - PAPER_MARKS: one paper's total, 80.
 *   - MAX_OUT_OF: the most one item (a question, or one part of it) is worth. The host believes no Foundation question or
 *     part is worth more than 5 marks; the cap is 6 so that a low guess never drops a real item.
 *   - MAX_ITEMS: every item is worth at least 1 mark, so a paper of 80 marks has at most 80 items.
 *   - MAX_LABEL: the longest label taken, '12(a)(iii)' and room to spare.
 */
export const PAPER_MARKS = 80;
export const MAX_OUT_OF = 6;
export const MAX_ITEMS = PAPER_MARKS;
export const MAX_LABEL = 12;
/** The most statement codes one item may name; any after the third are reported, not kept. */
export const MAX_CODES = 3;

export interface PaperItem { q: string; marks: number; outOf: number; codes: string[]; }

export type DropReason =
  | "not-an-item" | "no-label" | "label-too-long" | "label-names-the-board"
  | "marks-not-whole" | "out-of-not-whole" | "out-of-under-one" | "out-of-over-cap"
  | "marks-under-zero" | "marks-over-out-of" | "repeated-label" | "too-many-items" | "over-paper-total";
/** A row of the raw paper that is not on the clean paper: `row` counts from 1; `q` is "" when the label cannot be shown. */
export interface Dropped { row: number; q: string; reason: DropReason; why: string; }

export type CodeReason = "not-a-code" | "unknown-code" | "too-many-codes";
/** A code an item named that is not kept; `code` is "" when it cannot be shown. */
export interface DroppedCode { q: string; code: string; reason: CodeReason; why: string; }

export interface CleanPaper {
  /** Items with at least one known code, in paper order. */
  items: PaperItem[];
  /** Items with no known code, in paper order: on no topic, their lost marks in the totals. */
  unmapped: PaperItem[];
  dropped: Dropped[];
  droppedCodes: DroppedCode[];
}

/** A desk topic where marks were lost: the sum over the items behind it, their labels and the codes that led here. */
export interface RecoveryTopic { id: string; name: string; lost: number; items: string[]; codes: string[]; }
/** A statement the desk has no topic for: its `can` text, never linked to a topic; `foundation: false` is flagged, never dropped. */
export interface NotOnDesk { code: string; can: string; lost: number; items: string[]; foundation: boolean; }
export interface Totals { marks: number; outOf: number; lost: number; }
export interface Recovery extends CleanPaper { topics: RecoveryTopic[]; notOnDesk: NotOnDesk[]; totals: Totals; }

const BY_CODE = new Map<string, Statement>(STATEMENTS.map((s) => [s.code, s]));
const SCHOOL: PathTopic[] = topicsOf("school");
const AT = new Map<string, number>(SCHOOL.map((t, i) => [t.id, i]));

const BOARD = /gcse|1ma1|edexcel/i;
/** A typed string as a screen may show it: trimmed, at most `max` characters, not naming the board while the claim is off; else "". */
function shown(x: unknown, max: number): string {
  if (typeof x !== "string") return "";
  const t = x.trim();
  return t && t.length <= max && (gcseClaimAllowed() || !BOARD.test(t)) ? t : "";
}
/** Two labels are the same question when they differ only in case and spaces: '5(b)', '5 (b)', '5(B)'. */
const sameLabel = (q: string) => q.toLowerCase().replace(/\s+/g, "");

const WHY: Record<DropReason, string> = {
  "not-an-item": "This row is not a question.",
  "no-label": "This question has no number.",
  "label-too-long": `A question number is at most ${MAX_LABEL} characters.`,
  "label-names-the-board": "A question number is the number the paper prints, like 5(b).",
  "marks-not-whole": "The marks scored are not a whole number.",
  "out-of-not-whole": "The marks the question is worth are not a whole number.",
  "out-of-under-one": "A question is worth at least 1 mark.",
  "out-of-over-cap": `The desk takes at most ${MAX_OUT_OF} marks for one question. Enter its parts one by one.`,
  "marks-under-zero": "The marks scored cannot be below 0.",
  "marks-over-out-of": "The marks scored are more than the question is worth.",
  "repeated-label": "This question number is already on the paper.",
  "too-many-items": `A paper has at most ${MAX_ITEMS} questions.`,
  "over-paper-total": `The desk takes at most ${PAPER_MARKS} marks for one paper.`,
};
const CODE_WHY: Record<CodeReason, string> = {
  "not-a-code": "This is not a statement code.",
  "unknown-code": "The desk does not know this statement code.",
  "too-many-codes": `A question names at most ${MAX_CODES} statements.`,
};

/**
 * The one validation. Each raw row, in order, is dropped with its reason when: it is not an object; its label is empty,
 * longer than MAX_LABEL, or names the board while the claim is off; `marks` or `outOf` is not an integer; `outOf` is
 * under 1 or over MAX_OUT_OF; `marks` is under 0 or over `outOf`; its label repeats one already kept; it would be item
 * MAX_ITEMS + 1; or it would take the kept items' `outOf` past PAPER_MARKS. Codes: only codes found in STATEMENTS are
 * kept, duplicates collapsed, the first MAX_CODES in the order given; every other code is reported in `droppedCodes`.
 * A kept item with no code left goes to `unmapped`. A raw paper that is not an array is an empty paper.
 */
export function cleanPaper(raw: unknown): CleanPaper {
  const out: CleanPaper = { items: [], unmapped: [], dropped: [], droppedCodes: [] };
  const rows: unknown[] = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  let kept = 0, total = 0;
  rows.forEach((r, i) => {
    const drop = (q: string, reason: DropReason) => { out.dropped.push({ row: i + 1, q, reason, why: WHY[reason] }); };
    if (!r || typeof r !== "object" || Array.isArray(r)) return drop("", "not-an-item");
    const { q: rq, marks, outOf, codes } = r as Record<string, unknown>;
    const label = typeof rq === "string" ? rq.trim() : "";
    const q = shown(label, MAX_LABEL);
    if (!label) return drop("", "no-label");
    if (label.length > MAX_LABEL) return drop("", "label-too-long");
    if (!q) return drop("", "label-names-the-board");
    if (!Number.isInteger(marks)) return drop(q, "marks-not-whole");
    if (!Number.isInteger(outOf)) return drop(q, "out-of-not-whole");
    const m = marks as number, o = outOf as number;
    if (o < 1) return drop(q, "out-of-under-one");
    if (o > MAX_OUT_OF) return drop(q, "out-of-over-cap");
    if (m < 0) return drop(q, "marks-under-zero");
    if (m > o) return drop(q, "marks-over-out-of");
    if (seen.has(sameLabel(q))) return drop(q, "repeated-label");
    if (kept + 1 > MAX_ITEMS) return drop(q, "too-many-items");
    if (total + o > PAPER_MARKS) return drop(q, "over-paper-total");
    seen.add(sameLabel(q)); kept++; total += o;
    const good: string[] = [];
    for (const c of Array.isArray(codes) ? codes : []) {
      const code = typeof c === "string" ? c.trim() : "";
      const not = (reason: CodeReason) => { out.droppedCodes.push({ q, code: shown(code, 8), reason, why: CODE_WHY[reason] }); };
      if (!code) not("not-a-code");
      else if (!BY_CODE.has(code)) not("unknown-code");
      else if (good.includes(code)) continue;
      else if (good.length >= MAX_CODES) not("too-many-codes");
      else good.push(code);
    }
    (good.length ? out.items : out.unmapped).push({ q, marks: m, outOf: o, codes: good });
  });
  return out;
}

/** Every prerequisite of a school topic, followed through (a prerequisite's own prerequisites, and so on). */
function prereqsOf(id: string): Set<string> {
  const all = new Set<string>(), todo = [id];
  while (todo.length) {
    const t = SCHOOL[AT.get(todo.pop()!) ?? -1];
    for (const p of t?.prereq ?? []) if (!all.has(p)) { all.add(p); todo.push(p); }
  }
  return all;
}

/**
 * The recovery of a raw paper (cleaned by `cleanPaper` first, whose result it carries).
 *   - An item's lost marks are outOf - marks; a full-marks item adds nothing anywhere.
 *   - An item's lost marks count IN FULL against every code it names: a question that tests two statements was lost on
 *     both, so the statements' sums may add up to more than the paper lost.
 *   - Each statement leads to the school-path topics its `touches` names. A topic appears once: its `lost` is the sum
 *     over the distinct items behind it (an item reaching one topic through two of its codes counts once there), with
 *     those items' labels in paper order and the codes that led to it.
 *   - Order: most lost marks first, except that a topic never comes before one of its own prerequisites (followed
 *     through) that is also in the list. A prerequisite is pulled forward by the heaviest topic that needs it, so the
 *     largest loss is met as early as its prerequisites allow; ties go by path order.
 *   - A statement that leads to no school-path topic (empty `touches`) is in `notOnDesk`, most lost first, ties in
 *     STATEMENTS order; `foundation: false` is kept and flagged.
 *   - Totals are over every kept item, `unmapped` included.
 */
export function recovery(raw: unknown): Recovery {
  const clean = cleanPaper(raw);
  const all = [...clean.items, ...clean.unmapped];
  const totals: Totals = { marks: 0, outOf: 0, lost: 0 };
  for (const it of all) { totals.marks += it.marks; totals.outOf += it.outOf; totals.lost += it.outOf - it.marks; }

  const topics = new Map<string, RecoveryTopic>(), off = new Map<string, NotOnDesk>();
  const add = (list: string[], x: string) => { if (!list.includes(x)) list.push(x); };
  for (const it of clean.items) {
    const lost = it.outOf - it.marks;
    if (lost <= 0) continue;
    const reached = new Set<string>();
    for (const code of it.codes) {
      const st = BY_CODE.get(code)!;
      const ids = st.touches.filter((id) => AT.has(id));
      if (!ids.length) {
        const o = off.get(code) ?? { code, can: st.can, lost: 0, items: [], foundation: st.foundation };
        o.lost += lost; add(o.items, it.q); off.set(code, o);
        continue;
      }
      for (const id of ids) {
        const t = topics.get(id) ?? { id, name: SCHOOL[AT.get(id)!].name, lost: 0, items: [], codes: [] };
        if (!reached.has(id)) { t.lost += lost; reached.add(id); }
        add(t.items, it.q); add(t.codes, code); topics.set(id, t);
      }
    }
  }

  // The order: a topic is free once every prerequisite of it in the list is placed; of the free ones, the heaviest goes
  // next, where a topic weighs its own lost marks or the most lost by any listed topic that needs it.
  const list = [...topics.values()];
  const before = new Map(list.map((t) => [t.id, [...prereqsOf(t.id)].filter((p) => topics.has(p))]));
  const weight = new Map(list.map((t) => [t.id, Math.max(t.lost, ...list.filter((d) => before.get(d.id)!.includes(t.id)).map((d) => d.lost))]));
  const placed: RecoveryTopic[] = [], done = new Set<string>();
  while (placed.length < list.length) {
    const free = list.filter((t) => !done.has(t.id) && before.get(t.id)!.every((p) => done.has(p)));
    free.sort((a, b) => weight.get(b.id)! - weight.get(a.id)! || b.lost - a.lost || AT.get(a.id)! - AT.get(b.id)!);
    placed.push(free[0]); done.add(free[0].id);
  }

  const order = new Map(STATEMENTS.map((s, i) => [s.code, i]));
  const notOnDesk = [...off.values()].sort((a, b) => b.lost - a.lost || order.get(a.code)! - order.get(b.code)!);
  return { ...clean, topics: placed, notOnDesk, totals };
}
