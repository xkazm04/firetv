/**
 * The twin (v2 T2, T5-lite). For the learner at the desk only, never an id the client sends.
 *
 * GET (phone or PC)   the portrait: per channel the pieces, born or not, the dims in level words, and the exemplar
 *                     candidates with their text and whether each is included (the review step, SPEC 14)
 * GET (TV)            opens the Workroom: the summary is put on the session (titles, counts, marks; never text)
 * POST {open: true}   the same, from a TV key (keys.ts) or the PC page's "Show the Workroom on the TV"
 * POST {exclude: pieceId, on: boolean}   leave a piece out of the exemplars, or put it back (phone or PC)
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";
import { getPiece, listPieces } from "@/lib/session/texts";
import { levelWords, portraitOf, TWIN_BORN } from "@/lib/twin/card";
import { excludedOf, saveTwinState, twinState } from "@/lib/twin/state";
import { workroomOf } from "@/lib/twin/workroom";
import { modeOf } from "@/lib/rules/mode";

export const dynamic = "force-dynamic";
function seated(): { id: string; adult: boolean } | NextResponse {
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const p = s.profiles.find((x) => x.id === who.id);
  return { id: who.id, adult: modeOf(p, s.englishLearning?.preferences ?? undefined) === "adult" };
}

export async function GET(req: Request) {
  const who = seated(); if (who instanceof NextResponse) return who;
  const role = roleFrom(req);
  if (role === "tv") { const w = workroomOf(who.id); dispatch({ type: "workroom.set", workroom: w, open: true }); return NextResponse.json({ pieces: w.pieces.length, born: w.born }); }
  if (role !== null && role !== "phone") return NextResponse.json({ error: "Your twin opens on your phone or PC." }, { status: 403 });
  const excluded = new Set(excludedOf(who.id));
  dispatch({ type: "workroom.set", workroom: workroomOf(who.id) });
  const pieces = listPieces(who.id).map((c) => getPiece(who.id, c.id)).filter((p): p is NonNullable<typeof p> => !!p);
  const portrait = portraitOf(pieces);
  return NextResponse.json({
    adult: who.adult, born: portrait.born, need: TWIN_BORN,
    channels: portrait.channels.map((c) => ({ channel: c.channel, pieces: c.pieces, born: c.born, words: c.dims ? levelWords(c.dims) : [],
      exemplars: c.exemplars.map((e) => ({ ...e, included: !excluded.has(e.pieceId) })) })),
  });
}

export async function POST(req: Request) {
  const who = seated(); if (who instanceof NextResponse) return who;
  const role = roleFrom(req);
  const body = (await req.json().catch(() => null)) as { exclude?: unknown; on?: unknown; open?: unknown } | null;
  // the TV (or the desk itself) opens the Workroom: the summary goes on the session, the screen follows
  if (body?.open === true && (role === "tv" || role === null || role === "phone")) { dispatch({ type: "workroom.set", workroom: workroomOf(who.id), open: true }); return NextResponse.json({ opened: true }); }
  if (role !== null && role !== "phone") return NextResponse.json({ error: "Your twin opens on your phone or PC." }, { status: 403 });
  if (!body || typeof body.exclude !== "string" || typeof body.on !== "boolean") return NextResponse.json({ error: "Say which piece, and whether it stays in." }, { status: 400 });
  if (!getPiece(who.id, body.exclude)) return NextResponse.json({ error: "That piece is not on your shelf." }, { status: 404 });
  const st = twinState(who.id), out = new Set(st.excluded);
  if (body.on) out.add(body.exclude); else out.delete(body.exclude);
  saveTwinState(who.id, { ...st, excluded: [...out] });
  dispatch({ type: "workroom.set", workroom: workroomOf(who.id) });
  return NextResponse.json({ excluded: [...out] });
}
