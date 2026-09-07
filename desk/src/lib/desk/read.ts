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

export async function readPage(imageBase64: string, subject: Subject, w: number, h: number) {
  const { json, provider, ms } = await vision<{ items: Array<{ number: number; text: string; y: number; x: number }> }>({
    imageBase64,
    prompt: `This is a photo of a printed page. Transcribe every numbered item exactly as printed: ${WHAT[subject]}. ` +
      `For each item give its number, its text, and the position of its centre as fractions of the image (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). ` +
      `Keep the printed numbering. Do not solve anything and do not add items that are not there.`,
    schema: SCHEMA,
  });
  const half = subject === "essay" ? 0.09 : 0.045;
  const items: PageItem[] = (json.items || []).filter((i) => i && typeof i.text === "string").map((i) => ({
    n: i.number, text: i.text.trim(), cx: Math.round(i.x * w), cy: Math.round(i.y * h),
    band: [Math.max(0, Math.round((i.y - half) * h)), Math.min(h, Math.round((i.y + half) * h))] as [number, number], key: key(i.text),
  })).sort((a, b) => a.cy - b.cy);
  return { items, provider, ms };
}
