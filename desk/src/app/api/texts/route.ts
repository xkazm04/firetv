/**
 * The seated learner's own texts (lib/session/texts.ts; adult plan A6). Phone only: the TV shows a piece map, never a
 * text, so it has no reason to read one, and a guest never gets this far (proxy.ts). Every call acts on the learner
 * at the desk, never on an id the client sends, so one learner can never list or read another's.
 *
 * GET               the shelf: titles, formats and counts, no text; and whether the learner has accepted the notice
 * POST {notice: true}                       the one-time notice accepted
 * GET ?id=          one piece with its versions
 * POST {text, source?, format?, title?}     a new piece
 * POST {id, text, source?}                  a new version of that piece
 * POST {docx: base64, ...}                  the same, the text read from a .docx (v2 P4, lib/rules/docx.ts)
 * DELETE ?id=       one piece;  DELETE ?all=1  everything this learner kept
 */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";
import { addPiece, addVersion, deleteAll, deletePiece, getPiece, listPieces, markNoticed, noticed, TEXT_NOTICE } from "@/lib/session/texts";
import { docxText } from "@/lib/rules/docx";
import { dispatch } from "@/lib/session/store";
import { workroomOf } from "@/lib/twin/workroom";

/** After the shelf changes, the Workroom on the TV follows (titles and counts only). */
const refresh = (learnerId: string) => { try { dispatch({ type: "workroom.set", workroom: workroomOf(learnerId) }); } catch { /* the shelf changed; the TV catches up when it next opens the Workroom */ } };

export const dynamic = "force-dynamic";
/** A body larger than this is refused before it is read: twice the largest version (texts.ts), for JSON's escaping. */
const TEXTS_BODY_MAX_BYTES = 200 * 1024;

function seated(req: Request): { id: string } | NextResponse {
  const role = roleFrom(req);
  if (role !== null && role !== "phone") return NextResponse.json({ error: "Your texts open on your phone." }, { status: 403 });
  const who = getSession().learner;
  return who ? { id: who.id } : NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
}

export async function GET(req: Request) {
  const who = seated(req); if (who instanceof NextResponse) return who;
  const id = new URL(req.url).searchParams.get("id");
  if (id === null) return NextResponse.json({ pieces: listPieces(who.id), noticed: noticed(who.id), notice: TEXT_NOTICE });
  const piece = getPiece(who.id, id);
  return piece ? NextResponse.json(piece) : NextResponse.json({ error: "That piece is not on your shelf." }, { status: 404 });
}

export async function POST(req: Request) {
  const who = seated(req); if (who instanceof NextResponse) return who;
  const size = Number(req.headers.get("content-length") ?? NaN);
  if (Number.isFinite(size) && size > TEXTS_BODY_MAX_BYTES) return NextResponse.json({ error: "That text is too long to keep." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > TEXTS_BODY_MAX_BYTES) return NextResponse.json({ error: "That text is too long to keep." }, { status: 413 });
  let body: { id?: unknown; text?: unknown; source?: unknown; format?: unknown; title?: unknown; notice?: unknown; docx?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "The desk could not read that." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "The desk could not read that." }, { status: 400 });
  if (body.notice === true) return NextResponse.json({ noticed: markNoticed(who.id) });
  if (!noticed(who.id)) return NextResponse.json({ error: TEXT_NOTICE, notice: true }, { status: 428 });
  // a .docx sent from the PC page arrives as base64; its text is read here, nothing else of the file is kept
  let text = body.text;
  if (typeof body.docx === "string") {
    const read = docxText(Buffer.from(body.docx, "base64"));
    if (!read.ok) return NextResponse.json({ error: read.error }, { status: 400 });
    text = read.text;
  }
  const input = { text, source: body.docx !== undefined ? "file" : body.source, format: body.format, title: body.title };
  const r = typeof body.id === "string" ? addVersion(who.id, body.id, input) : addPiece(who.id, input);
  if (r.ok) refresh(who.id);
  return r.ok ? NextResponse.json(r.value) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function DELETE(req: Request) {
  const who = seated(req); if (who instanceof NextResponse) return who;
  const q = new URL(req.url).searchParams;
  if (q.get("all") === "1") { const deleted = deleteAll(who.id); refresh(who.id); return NextResponse.json({ deleted }); }
  const id = q.get("id") ?? "";
  if (!deletePiece(who.id, id)) return NextResponse.json({ error: "That piece is not on your shelf." }, { status: 404 });
  refresh(who.id);
  return NextResponse.json({ deleted: true });
}
