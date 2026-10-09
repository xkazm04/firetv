/**
 * Read a captured page: enumerate its items with positions, never count (lessons §2). Bands are
 * derived from the item centres so the TV can show one problem at a time at legible size.
 */
import { vision } from "../engines/vision";
import type { PageItem, Subject } from "../session/store";

const SCHEMA = {
  type: "object",
  properties: { items: { type: "array", items: { type: "object", properties: {
    number: { type: "integer" }, text: { type: "string" }, y: { type: "number" }, x: { type: "number" } },
    required: ["number", "text", "y", "x"] } } },
  required: ["items"],
};

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
export const itemKey = (pageId: string, n: number, seen: Map<string, number>) => {
  const base = `${pageId}:${n}`, again = (seen.get(base) ?? 0) + 1; seen.set(base, again);
  return again > 1 ? `${base}#${again}` : base;
};

export async function readPage(imageBase64: string, subject: Subject, w: number, h: number, pageId = "page") {
  const { json, provider, ms } = await vision<{ items: Array<{ number: number; text: string; y: number; x: number }> }>({
    imageBase64,
    prompt: `This is a photo of a printed page. Transcribe every numbered item exactly as printed: ${WHAT[subject]}. ` +
      `For each item give its number, its text, and the position of its centre as fractions of the image (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). ` +
      `Keep the printed numbering. Do not solve anything and do not add items that are not there.`,
    schema: SCHEMA,
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
    return { n: i.number, text: i.text.trim(), cx: at(x, w), cy: at(y, h), band: [Math.min(lo, hi), Math.max(lo, hi)] as [number, number], key: "", fingerprint: key(i.text) };
  }).sort((a, b) => (num(a.n) === num(b.n) ? 0 : num(a.n) < num(b.n) ? -1 : 1));
  const seen = new Map<string, number>();
  for (const it of items) it.key = itemKey(pageId, it.n, seen);
  return { items, provider, ms };
}
