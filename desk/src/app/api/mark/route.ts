/**
 * The phone snapped the worked set: mark all of it in one pass, then re-check the marker. A mark lands only on the set
 * it marked, and only once: a set already marked is refused before any model call, and a mark whose set is no longer
 * on the desk when the model answers (another set landed from Topics, the set was put away) is dropped - MOVED_ON,
 * nothing recorded - as explain drops a reply for an item the walk has left.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK, type Practice } from "@/lib/session/store";
import { markSet } from "@/lib/desk/mark";
import { MOVED_ON, refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
const START = "marking the set…";
const NO_PHOTO = "The desk did not get a photo of the set. Snap it again.";
const ALREADY_MARKED = "This set is already marked. Ask for a new set to mark another.";

/** The same questions, in the same order, on the same topic, still waiting to be marked. */
const sameSet = (now: Practice | null | undefined, was: Practice) =>
  !!now && !now.marked && now.topic === was.topic && now.items.length === was.items.length &&
  now.items.every((it, i) => it.n === was.items[i].n && it.question === was.items[i].question);

export async function POST(req: Request) {
  // a body that is not the phone's snap is refused in desk words, never an unhandled throw (a 500)
  const body = (await req.json().catch(() => null)) as { image?: unknown; w?: number; h?: number } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: NO_PHOTO }, { status: 400 });
  const image = typeof body.image === "string" ? body.image : "";
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  // marked once: a second mark would record every attempt and the history line again
  if (practice.marked) return NextResponse.json({ error: ALREADY_MARKED }, { status: 409 });
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  // the set is the learner's it was written for: a mark that ends after they left lands on their set, not the next learner's
  const owner = practice.owner ?? who.id;
  const same = () => {
    const now = getSession();
    return sameSet(now.learner?.id === owner ? now.practice : now.away?.[owner]?.practice, practice);
  };
  const r = await runJob("mark", async (run) => {
    const still = () => run.current() && same();
    const { items, provider, ms, unsure, landed } = await markSet(b64, practice, who.id, still);
    if (!landed || !still()) return null;
    dispatch({ type: "practice.marked", items, owner });
    const right = items.filter((i) => i.verdict === "right").length;
    const wrong = items.filter((i) => i.verdict === "wrong").length;
    return { right, wrong, unsure, provider, ms };
  }, { start: START, done: (m) => (m ? `${m.right} right, ${m.wrong} to look at${m.unsure ? `, ${m.unsure} to talk through` : ""}` : "") });
  if (!r.ok) return refused(r);
  if (!r.value) {
    // the dropped run's start line is not left saying the desk is still marking
    if (getSession().status === START) dispatch({ type: "status", text: "" });
    return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  return NextResponse.json(r.value);
}
