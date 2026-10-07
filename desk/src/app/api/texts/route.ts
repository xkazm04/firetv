/**
 * The seated learner's own texts (lib/session/texts.ts; adult plan A6). Phone only: the TV shows a piece map, never a
 * text, so it has no reason to read one, and a guest never gets this far (proxy.ts). Every call acts on the learner
 * at the desk, never on an id the client sends, so one learner can never list or read another's.
 *
 * GET               the shelf: titles, formats and counts, no text
 * GET ?id=          one piece with its versions
 * POST {text, source?, format?, title?}     a new piece
 * POST {id, text, source?}                  a new version of that piece
 * DELETE ?id=       one piece;  DELETE ?all=1  everything this learner kept
 */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";
import { addPiece, addVersion, deleteAll, deletePiece, getPiece, listPieces } from "@/lib/session/texts";

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
  if (id === null) return NextResponse.json({ pieces: listPieces(who.id) });
  const piece = getPiece(who.id, id);
  return piece ? NextResponse.json(piece) : NextResponse.json({ error: "That piece is not on your shelf." }, { status: 404 });
}

export async function POST(req: Request) {
  const who = seated(req); if (who instanceof NextResponse) return who;
  const size = Number(req.headers.get("content-length") ?? NaN);
  if (Number.isFinite(size) && size > TEXTS_BODY_MAX_BYTES) return NextResponse.json({ error: "That text is too long to keep." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > TEXTS_BODY_MAX_BYTES) return NextResponse.json({ error: "That text is too long to keep." }, { status: 413 });
  let body: { id?: unknown; text?: unknown; source?: unknown; format?: unknown; title?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "The desk could not read that." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "The desk could not read that." }, { status: 400 });
  const input = { text: body.text, source: body.source, format: body.format, title: body.title };
  const r = typeof body.id === "string" ? addVersion(who.id, body.id, input) : addPiece(who.id, input);
  return r.ok ? NextResponse.json(r.value) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function DELETE(req: Request) {
  const who = seated(req); if (who instanceof NextResponse) return who;
  const q = new URL(req.url).searchParams;
  if (q.get("all") === "1") return NextResponse.json({ deleted: deleteAll(who.id) });
  const id = q.get("id") ?? "";
  return deletePiece(who.id, id) ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "That piece is not on your shelf." }, { status: 404 });
}
