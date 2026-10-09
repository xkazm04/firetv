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

export async function readPage(imageBase64: string, subject: Subject, w: number, h: number, pageId = "page", who?: ReadWho) {
  const { json, provider, ms } = await vision<{ items: Array<{ number: number; text: string; y: number; x: number; label?: string }> }>({
    imageBase64,
    prompt: `This is a photo of a printed page. Transcribe every numbered item exactly as printed: ${WHAT[subject]}. ` +
      `For each item give its number, its text, and the position of its centre as fractions of the image (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). ` +
      `Keep the printed numbering. Do not solve anything and do not add items that are not there.` +
      (subject === "maths" ? ` ${mathsContext(who)}` : ""),
    schema: subject === "maths" ? MATHS_SCHEMA : SCHEMA,
  });
  const half = subject === "essay" ? 0.09 : 0.045;
  // a position the model gave as a number is a fraction of the page: kept inside it, a pixel count or a wild guess is not trusted past the edge
  const unit = (v: number) => Math.min(1, Math.max(0, v));
  const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const num = (n: number) => (finite(n) ? n : Infinity);
  const at = (v: number, size: number) => Math.min(size, Math.max(0, Math.round(v * size)));
  // printed order, never height alone: a two-column sheet keeps 1, 2, 3 (the sort is stable, so one number keeps the model's order)
  const items: PageItem[] = (json.items || []).filter((i) => i && typeof i.text === "string" && finite(i.x) && finite(i.y)).map((i) => {
    const x = unit(i.x), y = unit(i.y), lo = at(y - half, h), hi = at(y + half, h);
    const label = typeof i.label === "string" && i.label.trim() ? i.label.trim() : undefined;
    return { n: i.number, ...(label ? { label } : {}), text: i.text.trim(), cx: at(x, w), cy: at(y, h), band: [Math.min(lo, hi), Math.max(lo, hi)] as [number, number], key: "", fingerprint: key(i.text) };
  }).sort((a, b) => (num(a.n) === num(b.n) ? (a.label ?? "").localeCompare(b.label ?? "") : num(a.n) < num(b.n) ? -1 : 1));
  const seen = new Map<string, number>();
  for (const it of items) it.key = itemKey(pageId, it.n, seen, it.label);
  return { items, provider, ms };
}
