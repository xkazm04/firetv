/**
 * Generate a verified practice set on a topic of either Math path and put it on the desk (a Calculus item with its spec).
 * `stretch: true` in the body asks for "a step up" (Family W8): a school unit's set is written one rung harder than the
 * learner's baseline (rules/stretch, from the seated profile's age and system), and every item and the set carry the
 * flag so marking records on the step-up record only. Anything but `true` is a usual set - or `1`, the same ask as a
 * failed run holds it (a job's input keeps strings and numbers only), so "Try again" retries a step up as a step up.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { makeItems } from "@/lib/desk/items";
import { topicIn } from "@/lib/library/paths";
import { MOVED_ON, refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
const START = "writing a practice set…";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { topic?: unknown; stretch?: unknown } | null;
  const topic = body && typeof body === "object" ? body.topic : undefined;
  const stretch = !!body && typeof body === "object" && (body.stretch === true || body.stretch === 1);
  if (!topic || typeof topic !== "string") return NextResponse.json({ error: "Choose a topic first." }, { status: 400 });
  // a topic on neither Math path (library/paths.ts) is not a set the desk can write: refused before any job starts
  if (!topicIn(topic)) return NextResponse.json({ error: "That topic is not one this desk writes a set for." }, { status: 400 });
  const learner = getSession().learner?.id;
  if (!learner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  // the seated profile's school year sets the mix: an age only for a learner at school (as the SCHOOL tick reads it)
  const me = getSession().profiles.find((p) => p.id === learner);
  const who = { age: me && me.type !== "other" ? me.age : undefined, system: me?.system };
  const r = await runJob("practice", async (run) => {
    const made = await makeItems(topic, learner, 6, { ...who, stretch });
    // written for the learner who asked: after a learner change the run is superseded and the set is dropped
    if (!run.current() || getSession().learner?.id !== learner) return null;
    // two rounds and not one question the desk could check: a failed set (job.ts's practice sentence, "Try again."),
    // never an empty paper reported as ready - and the set on the desk stays as it was
    if (!made.items.length) throw new Error(`no verifiable question in ${made.tries} rounds`);
    dispatch({ type: "practice.set", practice: { topic, items: made.items, marked: false, owner: learner, ...(stretch ? { stretch: true as const } : {}) } });
    return made;
  }, { key: topic, input: stretch ? { topic, stretch: 1 } : { topic }, start: START, done: (m) => (m ? `${m.items.length} questions ready in ${(m.ms / 1000).toFixed(0)} s` : "") });
  if (!r.ok) return refused(r);
  if (!r.value) {
    // the superseded run's start line is not left saying the desk is still writing
    if (getSession().status === START) dispatch({ type: "status", text: "" });
    return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  const { items, provider, ms, tries } = r.value;
  return NextResponse.json({ items: items.length, tries, provider, ms });
}
