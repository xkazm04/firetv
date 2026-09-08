/** The learner said how they got there; the desk answers with a step, never the answer. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { explain } from "@/lib/desk/explain";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { transcript, n } = (await req.json().catch(() => ({}))) as { transcript?: string; n?: number };
  const s = getSession();
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  const item = practice.items[typeof n === "number" ? n : s.walkIx];
  if (!item) return NextResponse.json({ error: "no item" }, { status: 400 });
  dispatch({ type: "status", text: "listening…" });
  try {
    const r = await explain(item.question, transcript ?? "", practice.topic, s.learner.id);
    dispatch({ type: "status", text: r.reply });
    return NextResponse.json({ reply: r.reply, slip: r.slip });
  } catch (e) {
    dispatch({ type: "status", text: `could not follow that: ${String(e).slice(0, 120)}` });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
