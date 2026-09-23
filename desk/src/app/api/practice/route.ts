/** Generate a verified practice set on a topic and put it on the desk. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { makeItems } from "@/lib/desk/items";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { topic } = (await req.json().catch(() => ({}))) as { topic?: string };
  if (!topic) return NextResponse.json({ error: "no topic" }, { status: 400 });
  const s = getSession();
  const r = await runJob("practice", async () => {
    const made = await makeItems(topic, s.learner.id);
    dispatch({ type: "practice.set", practice: { topic, items: made.items, marked: false } });
    return made;
  }, { key: topic, start: "writing a practice set…", done: ({ items, ms }) => `${items.length} questions ready in ${(ms / 1000).toFixed(0)} s` });
  if (!r.ok) return refused(r);
  const { items, provider, ms, tries } = r.value;
  return NextResponse.json({ items: items.length, tries, provider, ms });
}
