/** Generate a verified practice set on a topic and put it on the desk. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { makeItems } from "@/lib/desk/items";
import { MOVED_ON, refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
const START = "writing a practice set…";
export async function POST(req: Request) {
  const { topic } = (await req.json().catch(() => ({}))) as { topic?: string };
  if (!topic) return NextResponse.json({ error: "no topic" }, { status: 400 });
  const learner = getSession().learner.id;
  const r = await runJob("practice", async (run) => {
    const made = await makeItems(topic, learner);
    // written for the learner who asked: after a learner change the run is superseded and the set is dropped
    if (!run.current() || getSession().learner.id !== learner) return null;
    dispatch({ type: "practice.set", practice: { topic, items: made.items, marked: false } });
    return made;
  }, { key: topic, input: { topic }, start: START, done: (m) => (m ? `${m.items.length} questions ready in ${(m.ms / 1000).toFixed(0)} s` : "") });
  if (!r.ok) return refused(r);
  if (!r.value) {
    // the superseded run's start line is not left saying the desk is still writing
    if (getSession().status === START) dispatch({ type: "status", text: "" });
    return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  const { items, provider, ms, tries } = r.value;
  return NextResponse.json({ items: items.length, tries, provider, ms });
}
