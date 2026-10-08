/**
 * Typing a paper in (v2 M5b, the phone's Paper panel): the rows as typed become the raw paper `cleanPaper` reads
 * (rules/recovery - the one validation, which never guesses), and what it drops is worded for the learner.
 *
 * Pure: types and library data only. A statement is picked by its `can` text, never by its code alone; no string here
 * names the board or the specification (recovery.ts HONEST LIMITS - the drop reasons are already worded that way).
 */
import { AREAS, STATEMENTS, type Area } from "../library/gcse";
import { cleanPaper, MAX_CODES, type CleanPaper } from "./recovery";

/** One row of the panel as typed: text in the fields, the statements picked by code. */
export interface DraftRow { q: string; marks: string; outOf: string; codes: string[]; }
export const blankRow = (): DraftRow => ({ q: "", marks: "", outOf: "", codes: [] });
/** A row nothing was typed into: it is not part of the paper. */
export const isBlank = (r: DraftRow): boolean => !r.q.trim() && !r.marks.trim() && !r.outOf.trim() && !r.codes.length;

/** A typed number as a number when it is whole; anything else stays the text it was, so cleanPaper drops it rather than guessing. */
const wholeOr = (t: string): number | string => (/^-?\d+$/.test(t.trim()) ? Number(t.trim()) : t);

/** The rows that were typed into, as the raw paper cleanPaper reads. */
export function rawOf(rows: readonly DraftRow[]): { q: string; marks: number | string; outOf: number | string; codes: string[] }[] {
  return rows.filter((r) => !isBlank(r)).map((r) => ({ q: r.q, marks: wholeOr(r.marks), outOf: wholeOr(r.outOf), codes: [...r.codes] }));
}

/** What the panel shows for the rows now: the clean paper, every drop in words, and whether anything can be sent. */
export interface Entry { clean: CleanPaper; drops: string[]; notes: string[]; kept: number; }
export function entryOf(rows: readonly DraftRow[]): Entry {
  const clean = cleanPaper(rawOf(rows));
  const where = (q: string, row: number) => (q ? `Question ${q}` : `Row ${row}`);
  const drops = [
    ...clean.dropped.map((d) => `${where(d.q, d.row)} is left out: ${d.why}`),
    ...clean.droppedCodes.map((d) => `Question ${d.q}: ${d.why}${d.code ? ` (${d.code})` : ""}`),
  ];
  const notes = clean.unmapped.map((u) => `Question ${u.q} names no statement the desk knows, so it counts in the marks but sits on no topic.`);
  return { clean, drops, notes, kept: clean.items.length + clean.unmapped.length };
}

/** The statements to pick from, by area: each with its `can` text. A statement beyond a Foundation paper is flagged, not hidden. */
export interface Choice { code: string; can: string; foundation: boolean; }
export function statementChoices(): { area: Area; name: string; items: Choice[] }[] {
  return (Object.keys(AREAS) as Area[]).map((area) => ({
    area, name: AREAS[area].name,
    items: STATEMENTS.filter((s) => s.area === area).map((s) => ({ code: s.code, can: s.can, foundation: s.foundation })),
  })).filter((g) => g.items.length);
}
/** A picked statement as the panel names it: the `can` text, or "" for a code the list does not hold. */
export const canOf = (code: string): string => STATEMENTS.find((s) => s.code === code)?.can ?? "";
/** The most statements one question may name. */
export const MOST_PICKS = MAX_CODES;
