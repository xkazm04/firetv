/**
 * Read a captured page: enumerate its items with positions, never count (lessons §2). Bands are
 * derived from the item centres so the TV can show one problem at a time at legible size.
 */
import { vision } from "../engines/vision";
import type { PageItem, SchoolSystem, Subject } from "../session/store";
import { PATHS, type MathPath } from "../library/paths";
import { SYSTEM_WORDS } from "@/tv/profileRows";

const SCHEMA = {
  type: "object",
  properties: { items: { type: "array", items: { type: "object", properties: {
    number: { type: "integer" }, text: { type: "string" }, y: { type: "number" }, x: { type: "number" } },
    required: ["number", "text", "y", "x"] } } },
  required: ["items"],
};
/** The maths read also takes an optional label for a lettered part ('a)', '3b'); n stays the printed number. */
const MATHS_SCHEMA = {
  ...SCHEMA,
  properties: { items: { ...SCHEMA.properties.items, items: { ...SCHEMA.properties.items.items, properties: { ...SCHEMA.properties.items.items.properties, label: { type: "string" } } } } },
};

/** Who the maths page is for, from the seated learner's profile (the hint and the school rules read the same fields). */
export interface ReadWho { system?: SchoolSystem; path?: MathPath; age?: number; stage?: string }

/**
 * What the maths read is told about the learner, so it writes the sheet the way the learner's school does. Only the maths
 * read carries it: the English and Essay prompts are exactly what they were.
 */
export function mathsContext(who: ReadWho = {}): string {
  const parts: string[] = [];
  if (who.system) {
    const note = who.system === "cz" ? "a decimal comma (3,5), division written with a colon, and tg and cotg for tan and cot"
      : who.system === "de" ? "a decimal comma (3,5) and division written with a colon" : "a decimal point (3.5)";
    parts.push(`The learner is in the ${SYSTEM_WORDS[who.system]} school system, whose notation uses ${note}.`);
  }
  if (who.path) parts.push(`Their course in progress is ${PATHS[who.path].name}.`);
  if (who.age !== undefined) parts.push(`They are ${who.age} years old.`);
  else if (who.stage) parts.push(`Their stage is ${who.stage}.`);
  return (parts.length ? parts.join(" ") + " " : "") +
    "Write each problem as plain one-line notation: lim_(x->a), a/b with brackets round a numerator or denominator of more than one term, no LaTeX. " +
    "Keep the language the page is printed in. For a lettered part give its label too (a), 3b); number stays the printed number.";
}

const WHAT: Record<Subject, string> = {
  maths: "the maths problems, with all symbols and exponents (write exponents with ^, e.g. x^2)",
  english: "the exercise sentences, with their blanks (______) and the word in brackets",
  essay: "each paragraph as one item",
};

export const key = (s: string) => s.toLowerCase().replace(/²/g, "^2").replace(/³/g, "^3").replace(/[−–]/g, "-").replace(/\s+/g, "").replace(/[.:]+$/, "");

/**
 * An item's identity is the page and its printed number, with a suffix for a repeated number - never its text, which two items
 * can share. The normalised text stays on the item as `fingerprint`. Items already in a session keep the key they were stored with.
 */
export const itemKey = (pageId: string, n: number, seen: Map<string, number>, label?: string) => {
  const base = `${pageId}:${n}${label ? `:${label}` : ""}`, again = (seen.get(base) ?? 0) + 1; seen.set(base, again);
  return again > 1 ? `${base}#${again}` : base;
};

/**
 * The order a read page's items keep (HW5). With no printed number repeated on the page it is the printed order, never height
 * alone, so a two-column sheet keeps 1, 2, 3 (the sort is stable, so a tie keeps the model's order). A repeat - a number that
 * comes again with the same label, or again with none; 1a and 1b are not one - means a sheet whose sections restart at 1:
 * walk the items top to bottom by band and left to right inside a band, start a new section at the first item whose number and
 * label the current section already holds, keep the sections in that page order, and print-sort inside each. One band is the
 * band of its first item: the items sorted by cy, an item is in the row when its cy is not below the end of the row's first item's
 * band; on an equal cx the upper item comes first. Two sections side by side in two columns are not split (a known limit).
 */
export function orderItems<T extends { n: number; label?: string; cx: number; cy: number; band: [number, number] }>(items: T[]): T[] {
  const n = (v: number) => (Number.isFinite(v) ? v : Infinity);
  const byPrint = (a: T, b: T) => (n(a.n) === n(b.n) ? (a.label ?? "").localeCompare(b.label ?? "") : n(a.n) < n(b.n) ? -1 : 1);
  const id = (i: T) => `${n(i.n)}|${i.label ?? ""}`;
  if (new Set(items.map(id)).size === items.length) return [...items].sort(byPrint);
  const down = [...items].sort((a, b) => a.cy - b.cy), walk: T[] = [];
  for (let i = 0; i < down.length;) {
    const end = down[i].band[1]; let j = i + 1;
    while (j < down.length && down[j].cy <= end) j++;
    walk.push(...down.slice(i, j).sort((a, b) => a.cx - b.cx || a.cy - b.cy));
    i = j;
  }
  const out: T[] = []; let section: T[] = [], held = new Set<string>();
  const close = () => { out.push(...section.sort(byPrint)); section = []; held = new Set(); };
  for (const it of walk) { if (held.has(id(it))) close(); section.push(it); held.add(id(it)); }
  close();
  return out;
}

export async function readPage(imageBase64: string, subject: Subject, w: number, h: number, pageId = "page", who?: ReadWho) {
  const { json, provider, ms } = await vision<{ items: Array<{ number: number; text: string; y: number; x: number; label?: string }> }>({
    imageBase64,
    prompt: `This is a photo of a printed page. Transcribe every numbered item exactly as printed: ${WHAT[subject]}. ` +
      `For each item give its number, its text, and the position of its centre as fractions of the image (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). ` +
      `Keep the printed numbering. Do not solve anything and do not add items that are not there.` +
      (subject === "maths" ? ` ${mathsContext(who)}` : ""),
    schema: subject === "maths" ? MATHS_SCHEMA : SCHEMA, use: "homework-read",
  });
  const half = subject === "essay" ? 0.09 : 0.045;
  // a position the model gave as a number is a fraction of the page: kept inside it, a pixel count or a wild guess is not trusted past the edge
  const unit = (v: number) => Math.min(1, Math.max(0, v));
  const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const num = (n: number) => (finite(n) ? n : Infinity);
  const at = (v: number, size: number) => Math.min(size, Math.max(0, Math.round(v * size)));
  const items: PageItem[] = orderItems((json.items || []).filter((i) => i && typeof i.text === "string" && finite(i.x) && finite(i.y)).map((i) => {
    const x = unit(i.x), y = unit(i.y), lo = at(y - half, h), hi = at(y + half, h);
    const label = typeof i.label === "string" && i.label.trim() ? i.label.trim() : undefined;
    return { n: i.number, ...(label ? { label } : {}), text: i.text.trim(), cx: at(x, w), cy: at(y, h), band: [Math.min(lo, hi), Math.max(lo, hi)] as [number, number], key: "", fingerprint: key(i.text) };
  }));
  const seen = new Map<string, number>();
  for (const it of items) it.key = itemKey(pageId, it.n, seen, it.label);
  return { items, provider, ms };
}

/**
 * The printed numbers a read left out (HF1). A run is what orderItems treats as one section - a number and label already
 * held start a new run - and a number is missing when it is a whole number between two printed numbers of one run. A lettered
 * part counts once, as its number; a run that starts above 1 has no gap before it (a continuation sheet). Empty means the
 * page is complete; null means unknown (an item with no usable printed number), which is not the same as complete.
 */
export const MISSING_SPAN = 100;
export function missingNumbers(items: Array<{ n: number; label?: string }>): number[] | null {
  if (items.some((i) => !Number.isInteger(i.n) || i.n < 1)) return null;
  const missing: number[] = [];
  let held = new Set<string>(), run = new Set<number>(), unknown = false;
  const close = () => {
    if (run.size && !unknown) {
      const lo = Math.min(...run), hi = Math.max(...run);
      // a printed number is model output: a run spread wider than the ceiling, or a list longer than it, is unknown, never cut short
      if (hi - lo > MISSING_SPAN) unknown = true;
      else for (let k = lo + 1; k < hi; k++) if (!run.has(k)) { missing.push(k); if (missing.length > MISSING_SPAN) { unknown = true; break; } }
    }
    held = new Set(); run = new Set();
  };
  for (const i of items) { const id = `${i.n}|${i.label ?? ""}`; if (held.has(id)) close(); held.add(id); run.add(i.n); }
  close();
  return unknown ? null : missing;
}
