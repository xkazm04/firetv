/**
 * The photo probe's scorer (v2 M5c; the M5 kill row, plan section g): a marked paper as the reader gave it, cleaned by
 * `cleanPaper`, held against the paper's answer key.
 *
 * The kill figure: an item of the key counts as mapped to the right unit when the cleaned read has an item with the
 * key's label whose codes reach the same desk topics as the key's codes AND the same not-on-the-desk statements. Units
 * are found by `recovery()` itself (a one-item paper with a mark lost), so a statement's `touches` on the school path
 * are followed exactly as the recovery list follows them: two different codes that reach the same topics are the same
 * unit, and a gap statement is its own unit. The figure is mapped items / key items over every paper scored; the probe
 * passes at KILL_PERCENT or more (section g).
 *
 * Reported beside it, deciding nothing: labels read (the key's label is on the cleaned read), marks read (marks and out
 * of both exactly the key's), codes read (exactly the key's codes, in any order), the rows cleanPaper dropped, and the
 * read items whose label is not on the key.
 *
 * Pure: types and library data only; no store, no engine, no fs, no model.
 */
import { recovery, type CleanPaper, type PaperItem } from "./recovery";

/** The kill row's bar (plan section g): under this share of items mapped to the right unit, the photo path is not offered. */
export const KILL_PERCENT = 85;

export interface ItemScore { q: string; label: boolean; mapped: boolean; marks: boolean; codes: boolean; }
export interface PaperScore {
  /** Key items, the kill figure's denominator. */
  items: number;
  mapped: number; labels: number; marks: number; codes: number;
  /** Rows of the read that cleanPaper dropped. */
  dropped: number;
  /** Cleaned read items whose label is not on the key. */
  extra: number;
  perItem: ItemScore[];
}
export interface RunScore {
  papers: number; items: number; mapped: number; labels: number; marks: number; codes: number; dropped: number; extra: number;
  /** Whole percents, rounded down, so a figure never reads as passing when it does not. */
  percent: { mapped: number; labels: number; marks: number; codes: number };
  pass: boolean;
  /** The kill figure passes while the marks were read exactly on under KILL_PERCENT of items: a question for the owner. */
  marksQuestion: boolean;
}

/** Two labels are the same question when they differ only in case and spaces, as cleanPaper compares them. */
const sameLabel = (q: string) => q.toLowerCase().replace(/\s+/g, "");

/** The units a list of codes reaches: the school-path topics and the not-on-the-desk statements, as recovery() finds them. */
export function unitsOf(codes: string[]): { topics: string[]; off: string[] } {
  const r = recovery([{ q: "1", marks: 0, outOf: 1, codes }]);
  return { topics: r.topics.map((t) => t.id).sort(), off: r.notOnDesk.map((o) => o.code).sort() };
}
const sameUnits = (a: string[], b: string[]) => {
  const x = unitsOf(a), y = unitsOf(b);
  return (x.topics.length + x.off.length) > 0 && x.topics.join() === y.topics.join() && x.off.join() === y.off.join();
};
const sameSet = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

/** One paper: its key (the raw paper it was rendered from, which survives cleanPaper whole) and the cleaned read. */
export function scorePaper(key: PaperItem[], read: CleanPaper): PaperScore {
  const all = [...read.items, ...read.unmapped];
  const byLabel = new Map(all.map((it) => [sameLabel(it.q), it]));
  const keyLabels = new Set(key.map((k) => sameLabel(k.q)));
  const perItem = key.map((k): ItemScore => {
    const got = byLabel.get(sameLabel(k.q));
    if (!got) return { q: k.q, label: false, mapped: false, marks: false, codes: false };
    return { q: k.q, label: true, mapped: sameUnits(k.codes, got.codes), marks: got.marks === k.marks && got.outOf === k.outOf, codes: sameSet(got.codes, k.codes) };
  });
  const n = (f: keyof Omit<ItemScore, "q">) => perItem.filter((x) => x[f]).length;
  return {
    items: key.length, mapped: n("mapped"), labels: n("label"), marks: n("marks"), codes: n("codes"),
    dropped: read.dropped.length, extra: all.filter((it) => !keyLabels.has(sameLabel(it.q))).length, perItem,
  };
}

/** Whole percent of `part` in `whole`, rounded down; 0 of 0 is 0. */
const pct = (part: number, whole: number) => (whole ? Math.floor((100 * part) / whole) : 0);

/** The run: every paper's counts summed. The pass compares counts, not rounded percents: mapped * 100 >= KILL_PERCENT * items. */
export function scoreRun(scores: PaperScore[]): RunScore {
  const sum = (f: "items" | "mapped" | "labels" | "marks" | "codes" | "dropped" | "extra") => scores.reduce((t, s) => t + s[f], 0);
  const items = sum("items"), mapped = sum("mapped"), labels = sum("labels"), marks = sum("marks"), codes = sum("codes");
  const pass = items > 0 && mapped * 100 >= KILL_PERCENT * items;
  return {
    papers: scores.length, items, mapped, labels, marks, codes, dropped: sum("dropped"), extra: sum("extra"),
    percent: { mapped: pct(mapped, items), labels: pct(labels, items), marks: pct(marks, items), codes: pct(codes, items) },
    pass, marksQuestion: pass && marks * 100 < KILL_PERCENT * items,
  };
}
