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
import { dataDir } from "../dataDir";

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

/** Ids become path parts, so only plain ids pass: a learner id as the store mints them, a piece id as this file does. */
const LEARNER_ID = /^[A-Za-z0-9_-]{1,64}$/, PIECE_ID = /^t-[a-f0-9]{12}$/;
const FORMAT = /^[a-z][a-z0-9-]{0,23}$/;
/** A keep from the phone or /drop must name its format: no format is never read as an essay (recert-5/L1-helena-46-EM5-2). addPiece itself still defaults to essay for callers that predate this. */
export const FORMAT_NEEDED_LINE = "Choose message, email or essay before you keep it.";
export const hasFormat = (f: unknown): boolean => typeof f === "string" && FORMAT.test(f);
const folder = (learnerId: string) => path.join(dataDir(), "texts", learnerId);
const fileOf = (learnerId: string, id: string) => path.join(folder(learnerId), `${id}.json`);

function cleanPiece(v: unknown): Piece | null {
  const p = v as Piece;
  if (!p || typeof p !== "object" || !PIECE_ID.test(String(p.id)) || !FORMAT.test(String(p.format)) || typeof p.title !== "string" || !Array.isArray(p.versions)) return null;
  const versions = p.versions.filter((x) => x && typeof x.text === "string" && typeof x.at === "number" && (TEXT_SOURCES as readonly string[]).includes(x.source));
  return versions.length ? { id: p.id, format: p.format, title: p.title, versions } : null;
}
const whyNot = (e: unknown) => (e instanceof Error ? e.message : String(e));
let told = "";
/** A read failure goes to the server log, once per distinct failure: the shelf is listed on every request. */
function tell(line: string): void { if (line !== told) console.error(line); told = line; }
/**
 * A kept piece, or null. No file is null quietly (a delete can race a list); a file the desk cannot read is null too, but
 * said in the log: it is somebody's writing, and nothing writes over it (addVersion answers 404 for a piece it cannot read).
 */
function readPiece(learnerId: string, id: string): Piece | null {
  let text: string;
  try { text = readFileSync(fileOf(learnerId, id), "utf8"); }
  catch (e) { if ((e as NodeJS.ErrnoException)?.code !== "ENOENT") tell(`desk texts: ${fileOf(learnerId, id)} could not be read, so it is left off the shelf: ${whyNot(e)}`); return null; }
  try {
    const p = cleanPiece(JSON.parse(text));
    if (!p) tell(`desk texts: ${fileOf(learnerId, id)} is not a kept piece, so it is left off the shelf`);
    return p;
  } catch (e) { tell(`desk texts: ${fileOf(learnerId, id)} is not readable JSON, so it is left off the shelf: ${whyNot(e)}`); return null; }
}
/** What the route answers when a piece could not be written: nothing was kept, and sending it again may work. */
export const TEXT_NOT_SAVED = "The desk could not save that just now, so nothing was kept. Send it again.";
/**
 * Written whole to a temporary name, then renamed over: a crash mid-write leaves the old file, never half a file. A write
 * that fails takes its temporary file with it and throws (as learners.ts writeBook and the session's writeSession do).
 */
function writeWhole(learnerId: string, to: string, json: string): void {
  mkdirSync(folder(learnerId), { recursive: true });
  const tmp = `${to}.${process.pid}.tmp`;
  try { writeFileSync(tmp, json); renameSync(tmp, to); }
  catch (e) { try { rmSync(tmp, { force: true }); } catch { /* best effort: the write's own failure is thrown just below */ } throw e; }
}
function writePiece(learnerId: string, p: Piece): void { writeWhole(learnerId, fileOf(learnerId, p.id), JSON.stringify(p)); }
function ids(learnerId: string): string[] {
  try { return readdirSync(folder(learnerId)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => PIECE_ID.test(id)); }
  catch (e) { if ((e as NodeJS.ErrnoException)?.code !== "ENOENT") tell(`desk texts: ${folder(learnerId)} could not be listed, so the shelf shows nothing: ${whyNot(e)}`); return []; }
}

/** The text a version may hold, or the sentence saying why not. */
function versionProblem(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return "There is no text to keep. Write or send something first.";
  if (text.length > TEXT_VERSION_MAX_CHARS) return `That text is too long to keep. Keep it under ${TEXT_VERSION_MAX_CHARS / 1024} KB.`;
  return null;
}
/**
 * A title when none was given: only a "# heading", else "Untitled <format> <n>". Never a line of the text: titles show
 * on the TV, and a first line without closing punctuation is a sentence of the learner's own as often as a heading (the
 * curtain; found by the twin suite, v2 batch 4; L1-helena-46-EM5-1). The ordinal is the next free one for the format.
 */
function titleOf(text: string, format: string, learnerId: string): string {
  const first = (paragraphsOf(text)[0] ?? "").trim();
  if (/^#{1,6}\s+\S/.test(first)) return first.replace(/^#{1,6}\s+/, "").slice(0, 80);
  const used = ids(learnerId).flatMap((id) => { const p = readPiece(learnerId, id); const m = p && p.format === format ? /^Untitled \S+ (\d+)$/.exec(p.title) : null; return m ? [Number(m[1])] : []; });
  return `Untitled ${format} ${Math.max(0, ...used) + 1}`;
}

/** Every piece the learner kept, each file read once, the most recently kept first (the shelf's order). */
export function allPieces(learnerId: string): Piece[] {
  if (!LEARNER_ID.test(learnerId)) return [];
  return ids(learnerId).flatMap((id) => { const p = readPiece(learnerId, id); return p ? [p] : []; })
    .sort((a, b) => b.versions.at(-1)!.at - a.versions.at(-1)!.at);
}

export function listPieces(learnerId: string): PieceCard[] {
  return allPieces(learnerId).map((p) => {
    const last = p.versions.at(-1)!;
    return { id: p.id, format: p.format, title: p.title, versions: p.versions.length, paragraphs: paragraphsOf(last.text).length, updated: last.at };
  });
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
  const title = typeof input.title === "string" && input.title.trim() ? input.title.trim().slice(0, 80) : titleOf(text, format, learnerId);
  const piece: Piece = { id: `t-${randomUUID().replace(/-/g, "").slice(0, 12)}`, format, title, versions: [{ at: now, source, text }] };
  writePiece(learnerId, piece);
  return { ok: true, value: piece };
}

/**
 * The kept piece a text is another version of, or null (recert-5/L1-daniel-15-EM3-1): the same "# heading" title, or more
 * than half of the paragraphs equal to the piece's last version. A question first line is never a title, so it never matches
 * by title. A format that differs is another piece. The most recently kept match wins.
 */
export function matchPiece(learnerId: string, text: string, format?: unknown): string | null {
  if (!LEARNER_ID.test(learnerId) || typeof text !== "string") return null;
  const first = (paragraphsOf(text)[0] ?? "").trim();
  const heading = /^#{1,6}\s+\S/.test(first) ? first.replace(/^#{1,6}\s+/, "").slice(0, 80) : null;
  const mine = paragraphsOf(text).map((x) => x.trim());
  // each piece is read once (allPieces): the list and its last version are the same read
  for (const c of allPieces(learnerId)) {
    if (typeof format === "string" && format && c.format !== format) continue;
    if (heading !== null && c.title === heading) return c.id;
    const last = c.versions.at(-1);
    if (!last) continue;
    const theirs = paragraphsOf(last.text).map((x) => x.trim());
    const shared = theirs.filter((x) => mine.includes(x)).length;
    if (shared * 2 > Math.max(mine.length, theirs.length)) return c.id;
  }
  return null;
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

/**
 * The twin's own file beside the pieces (v2 P4, D6). lib/twin/state.ts decides what it holds and when it is put aside;
 * the write is here, because this module owns the learner's text folder and the session is the only state.
 */
export const twinFileOf = (learnerId: string) => path.join(folder(learnerId), "twin.json");
/** Written whole (writeWhole, as a piece is): a crash mid-write leaves the old state, never half a file, and a failed write no temp file. */
export function writeTwinFile(learnerId: string, json: string): void {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  writeWhole(learnerId, twinFileOf(learnerId), json);
}
/** An unreadable twin file, renamed beside itself and never written over; the new path, or a throw when it could not be moved. */
export function setAsideTwinFile(learnerId: string, now = Date.now()): string {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  const f = twinFileOf(learnerId), to = `${f}.bad-${now.toString(36)}`;
  renameSync(f, to);
  return to;
}

/** Everything the learner kept, gone: the folder and all it holds. True when nothing of theirs is left on disk. */
export function deleteAll(learnerId: string): boolean {
  if (!LEARNER_ID.test(learnerId)) return false;
  rmSync(folder(learnerId), { recursive: true, force: true });
  return !existsSync(folder(learnerId));
}
