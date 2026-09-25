import { NextResponse } from "next/server";
import { dispatch, getSession, type Event } from "@/lib/session/store";
import { COOKIE, JOIN_FIRST, NO_CODE, PHONE_COOKIE, WRONG_CODE, guestMay, phoneToken, roleFrom, view } from "@/lib/session/pairing";

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
  "essay.revised": "Send the rewritten sentence to /api/analyse.",
};

/**
 * The session as the caller may see it (lib/session/pairing.ts): the TV all of it, a phone all but the pin, a
 * guest the lobby. The proxy names the caller in x-desk-role; an in-process call has none and gets the session.
 */
export async function GET(req?: Request) { return NextResponse.json(view(getSession(), roleFrom(req))); }
export async function POST(req: Request) {
  const role = roleFrom(req);
  const e = (await req.json()) as Event;
  const refused = e?.type ? SERVER_ONLY[e.type] : undefined;
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });
  // a lesson picked for a hint is the desk's pick; a lesson chosen on the TV (no key) is the screen's own
  if (e?.type === "lesson.set" && e.key !== undefined) return NextResponse.json({ error: "Ask for a hint on /api/hint." }, { status: 403 });
  if (role === "guest" && !guestMay(getSession(), e)) return NextResponse.json({ error: JOIN_FIRST }, { status: 403 });
  // forgetting the desk: this device's phone cookie goes; the desk is untouched
  if (e?.type === "leave") {
    const res = NextResponse.json(view(getSession(), role === null ? null : role === "tv" ? "tv" : "guest"));
    res.cookies.set(PHONE_COOKIE, "", { ...COOKIE, maxAge: 0 });
    return res;
  }
  if (e?.type === "join") {
    // the code is checked here, against the pin on the session; only the TV (and an in-process caller) joins without one
    const pin = getSession().pin;
    if (e.code === undefined && role !== null && role !== "tv" && role !== "phone") return NextResponse.json({ error: NO_CODE }, { status: 403 });
    if (e.code !== undefined && String(e.code) !== pin) return NextResponse.json({ error: WRONG_CODE }, { status: 403 });
    const s = dispatch({ type: "join" });
    if (role === null || role === "tv") return NextResponse.json(view(s, role));
    const res = NextResponse.json(view(s, "phone"));
    res.cookies.set(PHONE_COOKIE, phoneToken(pin), COOKIE);
    return res;
  }
  return NextResponse.json(view(dispatch(e), role));
}
