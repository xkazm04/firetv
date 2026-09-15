import { NextResponse } from "next/server";
import { dispatch, getSession, type Event } from "@/lib/session/store";

/** Events only a server route may dispatch, and where a client goes instead. */
const SERVER_ONLY: Record<string, string> = {
  "linga.changed": "Use the English conversation endpoint.",
  "practice.set": "Use POST /api/practice: a set is generated and verified on the server.",
  "practice.marked": "Use POST /api/mark: a set is marked on the server.",
};

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(getSession()); }
export async function POST(req: Request) {
  const e = (await req.json()) as Event;
  const refused = typeof e?.type === "string" && Object.hasOwn(SERVER_ONLY, e.type) ? SERVER_ONLY[e.type] : undefined;
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });
  return NextResponse.json(dispatch(e));
}
