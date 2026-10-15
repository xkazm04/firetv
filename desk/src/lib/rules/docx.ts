/**
 * The text of a .docx (v2 P4; adult plan A7): no dependency. Server-only (node:zlib).
 *
 * A .docx is a zip; the body is word/document.xml. This reads the zip's central directory, finds that one entry by
 * name, inflates it (stored or deflate only), and turns the XML into paragraphs: one per <w:p>, the text of its <w:t>
 * runs, a tab for <w:tab/>, a line break for <w:br/>, the five XML entities decoded. Nothing else of the file is read
 * (no images, no other parts), and nothing is written anywhere.
 *
 * Refused, with a sentence: not a zip, no word/document.xml, an encrypted or unknown compression, an entry larger than
 * DOCX_MAX_XML when inflated (a guard against a zip bomb), and a document with no text.
 */
import { inflateRawSync } from "node:zlib";

export const DOCX_MAX_XML = 5 * 1024 * 1024;
export type DocxResult = { ok: true; text: string } | { ok: false; error: string };
const NOT = "That file does not open as a Word document. Save it again as .docx or .txt and send it.";

function entry(buf: Buffer, name: string): { method: number; data: Buffer; size: number } | null {
  // the end-of-central-directory record: signature 0x06054b50, within the last 64 KB + 22 bytes
  const min = Math.max(0, buf.length - 65557);
  let eocd = -1;
  for (let i = buf.length - 22; i >= min; i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10), cdOff = buf.readUInt32LE(eocd + 16);
  let p = cdOff;
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) return null;
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), local = buf.readUInt32LE(p + 42);
    const fname = buf.toString("utf8", p + 46, p + 46 + nlen);
    if (fname === name) {
      if (flags & 1) throw new Error("encrypted");
      if (local + 30 > buf.length || buf.readUInt32LE(local) !== 0x04034b50) return null;
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      if (start + csize > buf.length) return null;
      return { method, data: buf.subarray(start, start + csize), size: usize };
    }
    p += 46 + nlen + xlen + clen;
  }
  return null;
}

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (_, e: string) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? _);

/** The document's paragraphs, joined by blank lines (rules/essay paragraphsOf reads them back). */
export function docxText(buf: Buffer): DocxResult {
  try {
    if (buf.length < 22 || buf.readUInt32LE(0) !== 0x04034b50) return { ok: false, error: NOT };
    const e = entry(buf, "word/document.xml");
    if (!e) return { ok: false, error: NOT };
    if (e.size > DOCX_MAX_XML) return { ok: false, error: "That document is too big to read. Keep it to a few pages, or save it as .txt." };
    let xml: Buffer;
    if (e.method === 0) xml = e.data;
    else if (e.method === 8) xml = inflateRawSync(e.data, { maxOutputLength: DOCX_MAX_XML });
    else return { ok: false, error: NOT };
    const paras = xml.toString("utf8").split(/<\/w:p>/).map((p) =>
      decode(p.replace(/<w:tab\/>/g, "<w:t>\t</w:t>").replace(/<w:br\/>/g, "<w:t>\n</w:t>").replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, "\u0000$1\u0000").split("\u0000").filter((_, i) => i % 2 === 1).join("")).trim())
      .filter(Boolean);
    return paras.length ? { ok: true, text: paras.join("\n\n") } : { ok: false, error: "That document has no text in it." };
  } catch (err) {
    return { ok: false, error: err instanceof Error && err.message === "encrypted" ? "That document is protected with a password. Save a copy without one." : NOT };
  }
}
