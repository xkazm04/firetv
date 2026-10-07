/**
 * A learner's own texts, kept with their versions (adult plan A6; v2 decisions 2026-10-07 X4, E1, E4). Server only.
 *
 * One file per piece: DESK_DATA_DIR/texts/<learnerId>/<pieceId>.json, holding { id, format, title, versions[] }.
 * Never in learners.json, which is rewritten whole on every write (learners.ts), and never on the shared session: a
 * text is read back only by the learner it belongs to (the route reads the seated learner, never a client's id).
 * `deleteAll` removes the learner's folder, and with it anything later kept beside the pieces (the twin's file, D6).
 *
 * Caps, each with its reason; none is measured, revisit after use (as the essay caps):
 * - a version 100 KB of text: a file of a few pages is far under it (rules/essay ESSAY_FILE_MAX_BYTES, the same figure);
 * - 20 versions a piece: a piece revised over a season, not a log;
 * - 50 pieces a learner: a shelf, not an archive.
 * A cap refuses with a sentence; nothing is cut or dropped silently.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { paragraphsOf } from "../rules/essay";

export const TEXT_VERSION_MAX_CHARS = 100 * 1024;
export const TEXT_VERSIONS_MAX = 20;
export const TEXT_PIECES_MAX = 50;
/** Where a version came from: a file sent from a phone or a PC, a message, or a paste. */
export const TEXT_SOURCES = ["file", "message", "paste"] as const;
export type TextSource = (typeof TEXT_SOURCES)[number];

export interface TextVersion { at: number; source: TextSource; text: string; }
export interface Piece { id: string; format: string; title: string; versions: TextVersion[]; }
/** What a list shows: never the text itself. */
export interface PieceCard { id: string; format: string; title: string; versions: number; paragraphs: number; updated: number; }

export type TextResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };
const fail = (error: string, status = 400): { ok: false; error: string; status: number } => ({ ok: false, error, status });

const DATA = () => process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
/** Ids become path parts, so only plain ids pass: a learner id as the store mints them, a piece id as this file does. */
const LEARNER_ID = /^[A-Za-z0-9_-]{1,64}$/, PIECE_ID = /^t-[a-f0-9]{12}$/;
const FORMAT = /^[a-z][a-z0-9-]{0,23}$/;
const folder = (learnerId: string) => path.join(DATA(), "texts", learnerId);
const fileOf = (learnerId: string, id: string) => path.join(folder(learnerId), `${id}.json`);

function cleanPiece(v: unknown): Piece | null {
  const p = v as Piece;
  if (!p || typeof p !== "object" || !PIECE_ID.test(String(p.id)) || !FORMAT.test(String(p.format)) || typeof p.title !== "string" || !Array.isArray(p.versions)) return null;
  const versions = p.versions.filter((x) => x && typeof x.text === "string" && typeof x.at === "number" && (TEXT_SOURCES as readonly string[]).includes(x.source));
  return versions.length ? { id: p.id, format: p.format, title: p.title, versions } : null;
}
function readPiece(learnerId: string, id: string): Piece | null {
  try { return cleanPiece(JSON.parse(readFileSync(fileOf(learnerId, id), "utf8"))); } catch { return null; }
}
/** Written to a temporary name, then renamed over: a crash mid-write leaves the old version, never half a file. */
function writePiece(learnerId: string, p: Piece): void {
  mkdirSync(folder(learnerId), { recursive: true });
  const to = fileOf(learnerId, p.id), tmp = `${to}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(p));
  renameSync(tmp, to);
}
function ids(learnerId: string): string[] {
  try { return readdirSync(folder(learnerId)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => PIECE_ID.test(id)); } catch { return []; }
}

/** The text a version may hold, or the sentence saying why not. */
function versionProblem(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return "There is no text to keep. Write or send something first.";
  if (text.length > TEXT_VERSION_MAX_CHARS) return `That text is too long to keep. Keep it under ${TEXT_VERSION_MAX_CHARS / 1024} KB.`;
  return null;
}
/**
 * A title when none was given: a "# heading", or a heading-like first line (short, no closing punctuation) above more
 * text. Never the first sentence of a message: titles show on the TV, and a chat line as its title is its text (the
 * curtain; found by the twin suite, v2 batch 4).
 */
function titleOf(text: string, format: string): string {
  const ps = paragraphsOf(text), first = (ps[0] ?? "").trim();
  if (/^#{1,6}\s+\S/.test(first)) return first.replace(/^#{1,6}\s+/, "").slice(0, 80);
  if (ps.length > 1 && first.length <= 80 && !/[.?!,;:…]$/.test(first) && !first.includes("\n")) return first;
  return `Untitled ${format}`;
}

export function listPieces(learnerId: string): PieceCard[] {
  if (!LEARNER_ID.test(learnerId)) return [];
  return ids(learnerId).flatMap((id) => {
    const p = readPiece(learnerId, id); if (!p) return [];
    const last = p.versions.at(-1)!;
    return [{ id: p.id, format: p.format, title: p.title, versions: p.versions.length, paragraphs: paragraphsOf(last.text).length, updated: last.at }];
  }).sort((a, b) => b.updated - a.updated);
}

export function getPiece(learnerId: string, id: string): Piece | null {
  return LEARNER_ID.test(learnerId) && PIECE_ID.test(id) ? readPiece(learnerId, id) : null;
}

export function addPiece(learnerId: string, input: { text: unknown; source?: unknown; format?: unknown; title?: unknown }, now = Date.now()): TextResult<Piece> {
  if (!LEARNER_ID.test(learnerId)) return fail("No learner to keep this for.", 409);
  const problem = versionProblem(input.text); if (problem) return fail(problem);
  if (ids(learnerId).length >= TEXT_PIECES_MAX) return fail(`You keep ${TEXT_PIECES_MAX} pieces already. Delete one to keep another.`);
  const source = (TEXT_SOURCES as readonly unknown[]).includes(input.source) ? (input.source as TextSource) : "paste";
  const format = typeof input.format === "string" && FORMAT.test(input.format) ? input.format : "essay";
  const text = input.text as string;
  const title = typeof input.title === "string" && input.title.trim() ? input.title.trim().slice(0, 80) : titleOf(text, format);
  const piece: Piece = { id: `t-${randomUUID().replace(/-/g, "").slice(0, 12)}`, format, title, versions: [{ at: now, source, text }] };
  writePiece(learnerId, piece);
  return { ok: true, value: piece };
}

export function addVersion(learnerId: string, id: string, input: { text: unknown; source?: unknown }, now = Date.now()): TextResult<Piece> {
  const p = getPiece(learnerId, id); if (!p) return fail("That piece is not on your shelf.", 404);
  const problem = versionProblem(input.text); if (problem) return fail(problem);
  if (p.versions.length >= TEXT_VERSIONS_MAX) return fail(`This piece holds ${TEXT_VERSIONS_MAX} versions. Start a new piece from it.`);
  if (p.versions.at(-1)!.text === input.text) return fail("That is the version you kept last. Change it, then send it.");
  const source = (TEXT_SOURCES as readonly unknown[]).includes(input.source) ? (input.source as TextSource) : "paste";
  const next: Piece = { ...p, versions: [...p.versions, { at: now, source, text: input.text as string }] };
  writePiece(learnerId, next);
  return { ok: true, value: next };
}

export function deletePiece(learnerId: string, id: string): boolean {
  if (!getPiece(learnerId, id)) return false;
  rmSync(fileOf(learnerId, id), { force: true });
  return true;
}

/**
 * The one-time notice (P3): before a learner's first kept piece, the phone says where the text goes. Accepted once per
 * learner, recorded beside their pieces, so delete-all also forgets it and the notice shows again.
 */
export const TEXT_NOTICE = "To read your writing, the desk sends it to its text engine: Claude, through the command line on this computer. Pieces you keep stay on this desk under your name until you delete them.";
const noticeFile = (learnerId: string) => path.join(folder(learnerId), "notice.json");
export function noticed(learnerId: string): boolean { return LEARNER_ID.test(learnerId) && existsSync(noticeFile(learnerId)); }
export function markNoticed(learnerId: string, now = Date.now()): boolean {
  if (!LEARNER_ID.test(learnerId)) return false;
  mkdirSync(folder(learnerId), { recursive: true });
  writeFileSync(noticeFile(learnerId), JSON.stringify({ at: now }));
  return true;
}

/** Everything the learner kept, gone: the folder and all it holds. True when nothing of theirs is left on disk. */
export function deleteAll(learnerId: string): boolean {
  if (!LEARNER_ID.test(learnerId)) return false;
  rmSync(folder(learnerId), { recursive: true, force: true });
  return !existsSync(folder(learnerId));
}
