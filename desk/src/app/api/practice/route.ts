/** Generate a verified practice set on a topic and put it on the desk. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { makeItems } from "@/lib/desk/items";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { topic } = (await req.json().catch(() => ({}))) as { topic?: string };
  if (!topic) return NextResponse.json({ error: "no topic" }, { status: 400 });
  const s = getSession();
  dispatch({ type: "status", text: "writing a practice set…" });
  try {
    const { items, provider, ms, tries } = await makeItems(topic, s.learner.id);
    dispatch({ type: "practice.set", practice: { topic, items, marked: false } });
    dispatch({ type: "status", text: `${items.length} questions ready in ${(ms / 1000).toFixed(0)} s` });
    return NextResponse.json({ items: items.length, tries, provider, ms });
  } catch (e) {
    dispatch({ type: "status", text: `could not write the set: ${String(e).slice(0, 120)}` });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
