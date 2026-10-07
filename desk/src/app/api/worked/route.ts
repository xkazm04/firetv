/**
 * A worked lesson for a school unit (v2 M1, lib/desk/worked.ts): the examples and their answers by code, the idea in the
 * learner's voice when the model's words pass, else the authored idea. Refused before any job starts for a topic with no
 * worked lesson (the linear and Calculus topics keep going straight to practice).
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { teachTopic } from "@/lib/desk/worked";
import { hasWorked } from "@/lib/library/worked";
import { learnerSystem } from "@/lib/rules/school";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { topic?: unknown } | null;
  const topic = body && typeof body === "object" ? body.topic : undefined;
  if (!hasWorked(topic)) return NextResponse.json({ error: "There is no worked lesson for that topic yet." }, { status: 400 });
  const learner = getSession().learner?.id;
  if (!learner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const me = getSession().profiles.find((p) => p.id === learner);
  const r = await runJob("teach", async (run) => {
    const w = await teachTopic(topic, me && me.type !== "other" ? me.age : undefined, learnerSystem(getSession()));
    if (!w.examples.length) throw new Error("no example the desk could answer for itself");
    if (run.current() && getSession().learner?.id === learner) dispatch({ type: "worked.set", worked: w, owner: learner });
    return w;
  }, { key: topic, input: { topic }, start: "writing the lesson…", done: (w) => `${w.title}: ${w.examples.length} worked examples` });
  return r.ok ? NextResponse.json(r.value) : refused(r);
}
