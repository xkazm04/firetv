import { NextResponse } from "next/server";
import { dispatch, getSession, type Event } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(getSession()); }
export async function POST(req: Request) {
  const e = (await req.json()) as Event;
  if (e?.type === "linga.changed") return NextResponse.json({ error: "Use the English conversation endpoint." }, { status: 403 });
  return NextResponse.json(dispatch(e));
}
