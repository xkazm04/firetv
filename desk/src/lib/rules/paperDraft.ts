/**
 * The Paper panel's draft rows kept across a phone reload or a discarded tab (recert-5 L1-owen-17-MB4-1).
 *
 * Pure: strings in, strings out. The page does the localStorage reads and writes (each in try/catch) and calls these to
 * name the key, serialise and parse. Nothing is sent to the desk: the draft lives in the phone's browser only, one key per seated learner.
 */
import { blankRow, isBlank, type DraftRow } from "./paperEntry";

const PREFIX = "desk.paperDraft.";
/** The storage key for one learner's draft; no learner seated means no key, so nothing is kept. */
export const draftKey = (learnerId: string | undefined | null): string | null => (learnerId ? PREFIX + learnerId : null);

/** The stored text for the rows, or null when every row is blank (there is nothing worth keeping). */
export const serialiseDraft = (rows: readonly DraftRow[]): string | null => (rows.every(isBlank) ? null : JSON.stringify({ v: 1, rows }));

const isRow = (r: unknown): r is DraftRow => {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return typeof x.q === "string" && typeof x.marks === "string" && typeof x.outOf === "string" && Array.isArray(x.codes) && x.codes.every((c) => typeof c === "string");
};

/** The rows a stored text holds: null for anything that is not a version-1 draft (malformed, old shape, wrong types); never throws.
 * An empty list restores one blank row. */
export function parseDraft(text: string | null | undefined): DraftRow[] | null {
  if (typeof text !== "string") return null;
  try {
    const o: unknown = JSON.parse(text);
    if (!o || typeof o !== "object") return null;
    const { v, rows } = o as { v?: unknown; rows?: unknown };
    if (v !== 1 || !Array.isArray(rows) || !rows.every(isRow)) return null;
    return rows.length ? rows.map((r) => ({ q: r.q, marks: r.marks, outOf: r.outOf, codes: [...r.codes] })) : [blankRow()];
  } catch { return null; }
}
