/**
 * The twin's Twin Card 1.0, as a download (v2 T5-lite; docs/standards/twin-card/1.0). Phone or PC only; Adult mode
 * only (the plan: export at 18+ confirmed); only once a channel is born (three pieces, E3). Built from the learner's
 * kept pieces and their review choices (lib/twin/card.ts); identity and voice are never sealed (SPEC 11).
 */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";
import { getPiece, listPieces } from "@/lib/session/texts";
import { buildCard, TWIN_BORN } from "@/lib/twin/card";
import { twinState } from "@/lib/twin/state";
import { modeOf } from "@/lib/rules/mode";

export const dynamic = "force-dynamic";
const slug = (name: string) => name.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "twin";

export async function GET(req: Request) {
  const role = roleFrom(req);
  if (role !== null && role !== "phone") return NextResponse.json({ error: "The card is downloaded on your phone or PC." }, { status: 403 });
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const p = s.profiles.find((x) => x.id === who.id);
  if (modeOf(p, s.englishLearning?.preferences ?? undefined) !== "adult") return NextResponse.json({ error: "The twin card is for Adult mode (18 and over)." }, { status: 403 });
  const st = twinState(who.id);
  const pieces = listPieces(who.id).map((c) => getPiece(who.id, c.id)).filter((x): x is NonNullable<typeof x> => !!x);
  const card = buildCard({ name: who.name, pieces, excluded: new Set(st.excluded), cardId: st.cardId, createdAt: st.createdAt, exportedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z") });
  if (!card) return NextResponse.json({ error: `Your twin is born after ${TWIN_BORN} kept messages or emails in one kind. Keep a few more.` }, { status: 409 });
  return new NextResponse(JSON.stringify(card, null, 2), { headers: { "content-type": "application/vnd.twin-card+json", "content-disposition": `attachment; filename="${slug(who.name)}.twin.json"` } });
}
