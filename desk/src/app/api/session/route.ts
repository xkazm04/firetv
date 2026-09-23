import { NextResponse } from "next/server";
import { dispatch, getSession, type Event } from "@/lib/session/store";

export const dynamic = "force-dynamic";

/**
 * Events only the desk itself raises, each from the route that did the work (and checked it). A screen that
 * could post one could settle a verdict without verify(), put a forged set or page on the desk, or fake a run.
 * The screens post navigation, focus, picks and the timer; none of them posts these.
 */
const SERVER_ONLY: Partial<Record<Event["type"], string>> = {
  "linga.changed": "Use the English conversation endpoint.",
  "job.start": "Runs are started by the desk.", "job.done": "Runs are finished by the desk.", "job.failed": "Runs are finished by the desk.",
  "practice.set": "Ask for a set on /api/practice.", "practice.marked": "Send the working to /api/mark.",
  "practice.settle": "Explain it on /api/explain.",
  "page.reading": "Send the page to /api/read.", "page.read": "Send the page to /api/read.",
  "hint.set": "Ask for a hint on /api/hint.", "hint.stage": "Ask for a hint on /api/hint.",
  "english.set": "Send the sentence to /api/analyse.", "essay.set": "Send the essay to /api/analyse.",
};

export async function GET() { return NextResponse.json(getSession()); }
export async function POST(req: Request) {
  const e = (await req.json()) as Event;
  const refused = e?.type ? SERVER_ONLY[e.type] : undefined;
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });
  // a lesson picked for a hint is the desk's pick; a lesson chosen on the TV (no key) is the screen's own
  if (e?.type === "lesson.set" && e.key !== undefined) return NextResponse.json({ error: "Ask for a hint on /api/hint." }, { status: 403 });
  return NextResponse.json(dispatch(e));
}
