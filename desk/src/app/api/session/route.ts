import { NextResponse } from "next/server";
import { answerAsk, badPost, dispatch, getSession, type Event } from "@/lib/session/store";
import { NOT_ASKING } from "@/lib/session/phoneAsk";
import { COOKIE, JOIN_FIRST, JOIN_NOT_SAVED, LEAVE_NOT_SAVED, NO_CODE, RESET_NOT_SAVED, PHONE_COOKIE, TOO_MANY_CODES, WRONG_CODE, guestMay, joinClear, joinCooling, joinDelay, joinSucceeded, joinWrongCode, cookiesOf, forgetAllPhones, forgetPhone, mintPhone, roleFrom, view } from "@/lib/session/pairing";
import { closePhoneStreams, phoneKey } from "@/lib/session/streams";

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
  "practice.settle": "Explain it on /api/explain.", "practice.second": "Type your second go on /api/second.",
  "page.reading": "Send the page to /api/read.", "page.read": "Send the page to /api/read.",
  "hint.set": "Ask for a hint on /api/hint.", "hint.stage": "Ask for a hint on /api/hint.",
  "english.set": "Send the sentence to /api/analyse.", "essay.set": "Send the essay to /api/analyse.",
  "essay.revised": "Send the rewritten sentence to /api/analyse.",
  // v2: a whole piece's later paragraphs, a worked lesson and the Workroom are written by the desk alone
  "essay.progress": "Send the piece to /api/analyse.", "worked.set": "Ask for a lesson on /api/worked.", "workroom.set": "Open the Workroom on /api/twin.",
  "lesson.watched": "A lesson is marked watched by the desk, as it plays.",
  "pin.turn": "The code turns over when a phone joins with it.",
  "phone.presence": "The desk counts the phones that are here.",
  "ask.sent": "The desk marks a hand-off answered when the answer arrives.",
};

/**
 * The events a phone may not post (TL-11); every other refusal and allowance is as it was. Seating a learner, leaving the
 * profile, opening a topic and clearing a set move the TV too (lite r3): they are the TV's. A typed paper is the phone's
 * answer to the TV's paper ask, below; task.* (OD4 b), profile.draft and profile.save (OD1 b) stay the phone's.
 */
const PHONE_NEVER = new Set<string>(["nav", "focus", "subject", "item", "page.select", "walk", "essay.at", "timer.start", "timer.pause", "timer.tick", "timer.skipbreak", "session.end",
  "learner.set", "profile.discard", "topic.open", "practice.clear", "writing.pick", "writing.clear"]);

/** One line for a pairing write that failed, in the shape of pairing.ts's last-seen line; the caller answers 500 and changes nothing. */
const notSaved = (what: string, e: unknown) => console.error(`desk pairing: ${what} could not be written to pairing.json (${e instanceof Error ? e.message : e}); nothing was changed`);

/**
 * The session as the caller may see it (lib/session/pairing.ts): the TV all of it, a phone all but the pin, a
 * guest the lobby. The proxy names the caller in x-desk-role; an in-process call has none and gets the session.
 */
// Two signatures: the one Next's generated route types check (a Request) and the in-process one (none, the whole session).
export async function GET(): Promise<Response>;
export async function GET(req: Request): Promise<Response>;
export async function GET(req?: Request) { return NextResponse.json(view(getSession(), roleFrom(req))); }
export async function POST(req: Request) {
  const role = roleFrom(req);
  // a body that is not JSON, or not an object, is a bad request before anything else is asked of it
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "The desk could not read that request." }, { status: 400 });
  const e = body as Event;
  // phones.forget is the TV's own act (TL-2): forget every phone, keep the session. It is no reducer event, so it is answered here, before the door
  if ((e as { type?: unknown }).type === "phones.forget") {
    if (role === "phone" || role === "guest") return NextResponse.json({ error: "Only the TV can forget every phone." }, { status: 403 });
    try { forgetAllPhones(); }
    catch (err) { notSaved("a forget of every phone", err); return NextResponse.json({ error: RESET_NOT_SAVED }, { status: 500 }); }
    joinClear();
    closePhoneStreams();
    return NextResponse.json(view(getSession(), role));
  }
  const refused = e?.type ? SERVER_ONLY[e.type] : undefined;
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });
  // a lesson picked for a hint is the desk's pick; a lesson chosen on the TV (no key) is the screen's own
  if (e?.type === "lesson.set" && e.key !== undefined) return NextResponse.json({ error: "Ask for a hint on /api/hint." }, { status: 403 });
  // the TV's own acts: wiping the desk, and starting an edit of a profile that is already made (a patch that names an id)
  if (role === "phone" && e?.type === "ask.open") return NextResponse.json({ error: "Only the TV can ask the phone for something." }, { status: 403 });
  // the phone answers the TV's asks and does not move it (TL-11): navigation, focus, picks, the walk, the clock and the end of the session are the TV's. Tonight's list (task.*) stays the phone's (OD4)
  if (role === "phone" && typeof e?.type === "string" && PHONE_NEVER.has(e.type)) return NextResponse.json({ error: "Only the TV moves the desk." }, { status: 403 });
  // a phone's typed paper answers the TV's open paper ask, by its id, or it changes nothing (as the result routes' door, lib/session/phoneAsk.ts)
  if (role === "phone" && e?.type === "paper.enter") {
    const ask = getSession().ask;
    if (!ask || ask.phase !== "open" || ask.kind !== "paper" || typeof e.askId !== "string" || e.askId !== ask.id) return NextResponse.json({ error: NOT_ASKING }, { status: 409 });
  }
  if (role === "phone" && e?.type === "reset") return NextResponse.json({ error: "Only the TV can reset the desk." }, { status: 403 });
  if (role === "phone" && e?.type === "profile.draft" && e.patch && typeof e.patch === "object" && Object.hasOwn(e.patch, "id")) return NextResponse.json({ error: "Only the TV can start editing a profile." }, { status: 403 });
  if (role === "guest" && !guestMay(getSession(), e)) return NextResponse.json({ error: JOIN_FIRST }, { status: 403 });
  // one door for every field a screen or phone posts: a request the reducer was not built for never reaches it
  const bad = badPost(e);
  if (bad) return NextResponse.json({ error: bad }, { status: 400 });
  // a cancel of a hand-off that is not open now changes nothing
  if (e?.type === "ask.cancel" && getSession().ask?.id !== e.id) return NextResponse.json({ error: "The TV is not asking for that now." }, { status: 409 });
  // forgetting the desk: this device's phone cookie goes; the desk is untouched
  if (e?.type === "leave") {
    const own = cookiesOf(req).get(PHONE_COOKIE)?.value;
    try { forgetPhone(own); }
    catch (err) { notSaved("a leave", err); return NextResponse.json({ error: LEAVE_NOT_SAVED }, { status: 500 }); }
    if (own !== undefined) closePhoneStreams(phoneKey(own));
    const res = NextResponse.json(view(getSession(), role === null ? null : role === "tv" ? "tv" : "guest"));
    res.cookies.set(PHONE_COOKIE, "", { ...COOKIE, maxAge: 0 });
    return res;
  }
  if (e?.type === "join") {
    // the code is checked here, against the pin on the session; only the TV (and an in-process caller) joins without one
    const pin = getSession().pin;
    // every refusal waits the same delay; a wrong code counts toward the desk's budget (pairing.ts); the TV and an in-process join are never held
    const guarded = role !== null && role !== "tv";
    if (e.code === undefined && role !== null && role !== "tv" && role !== "phone") { await joinDelay(); return NextResponse.json({ error: NO_CODE }, { status: 403 }); }
    // a listed phone that sends a code that is no longer current (its own first join turned the pin) is answered as the phone it is: no count, no token, no cookie
    if (role === "phone" && e.code !== undefined && String(e.code) !== pin) return NextResponse.json(view(getSession(), "phone"));
    if (e.code !== undefined && guarded && joinCooling()) { await joinDelay(); return NextResponse.json({ error: TOO_MANY_CODES }, { status: 403 }); }
    if (e.code !== undefined && String(e.code) !== pin) {
      if (guarded) { joinWrongCode(); await joinDelay(); }
      return NextResponse.json({ error: WRONG_CODE }, { status: 403 });
    }
    // the right code mints this phone's own token (a phone that joins again has its entry replaced); it is saved before anything else changes
    let token: string | null = null;
    if (guarded && e.code !== undefined) {
      try { token = mintPhone(cookiesOf(req).get(PHONE_COOKIE)?.value); }
      catch (err) { notSaved("a join", err); return NextResponse.json({ error: JOIN_NOT_SAVED }, { status: 500 }); }
    }
    // a join from the TV with no code also lifts the lockout, so the TV need not unpair everyone to do it
    if (e.code === undefined && (role === null || role === "tv")) joinClear();
    joinSucceeded();
    const s = dispatch({ type: "join" });
    if (role === null || role === "tv") return NextResponse.json(view(s, role));
    // a listed phone that sends no code is answered as the phone it is: no new token, no cookie
    if (token === null) return NextResponse.json(view(s, "phone"));
    // the code that was just used stops working: a new one is on the TV
    dispatch({ type: "pin.turn" });
    const res = NextResponse.json(view(s, "phone"));
    res.cookies.set(PHONE_COOKIE, token, COOKIE);
    return res;
  }
  // a reset that got this far is the TV's (or in-process): a new session, and every phone is forgotten
  if (e?.type === "reset") {
    try { forgetAllPhones(); }
    catch (err) { notSaved("a reset", err); return NextResponse.json({ error: RESET_NOT_SAVED }, { status: 500 }); }
    joinClear();
    closePhoneStreams();
  }
  // the paper is sent as the desk goes to write it, and closed by what that came to; a paper with no row left keeps the ask open to fix
  if (role === "phone" && e.type === "paper.enter") {
    const id = getSession().ask?.id ?? "";
    const { begun } = await answerAsk(id, async () => dispatch(e));
    if (begun && getSession().ask?.id === id) dispatch({ type: "ask.cancel", id });
    return NextResponse.json(view(getSession(), role));
  }
  return NextResponse.json(view(dispatch(e), role));
}
