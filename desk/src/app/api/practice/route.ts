/** Generate a verified practice set on a topic of either Math path and put it on the desk (a Calculus item with its spec). */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { makeItems } from "@/lib/desk/items";
import { topicIn } from "@/lib/library/paths";
import { MOVED_ON, refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
const START = "writing a practice set…";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { topic?: unknown } | null;
  const topic = body && typeof body === "object" ? body.topic : undefined;
  if (!topic || typeof topic !== "string") return NextResponse.json({ error: "no topic" }, { status: 400 });
  // a topic on neither Math path (library/paths.ts) is not a set the desk can write: refused before any job starts
  if (!topicIn(topic)) return NextResponse.json({ error: "no such topic" }, { status: 400 });
  const learner = getSession().learner?.id;
  if (!learner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const r = await runJob("practice", async (run) => {
    const made = await makeItems(topic, learner);
    // written for the learner who asked: after a learner change the run is superseded and the set is dropped
    if (!run.current() || getSession().learner?.id !== learner) return null;
    // two rounds and not one question the desk could check: a failed set (job.ts's practice sentence, "Try again."),
    // never an empty paper reported as ready - and the set on the desk stays as it was
    if (!made.items.length) throw new Error(`no verifiable question in ${made.tries} rounds`);
    dispatch({ type: "practice.set", practice: { topic, items: made.items, marked: false, owner: learner } });
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
