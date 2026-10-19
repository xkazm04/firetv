import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";

/** What a phone is told when it answers a hand-off the TV is not making now (TL-11). */
export const NOT_ASKING = "The TV is not asking for that now.";

/**
 * The door of a result route (read, mark, analyse, hint, explain, second) for a phone (TL-11). A phone answers the TV's
 * open ask and nothing else: a request with no askId, or one that is not the open ask's id, is 409 and touches
 * nothing. With the right id the ask is marked sent as the work begins, and the result - whatever it came to - closes it.
 * The TV and an in-process caller (no role) pass straight through, as before.
 */
export async function withPhoneAsk(req: Request, run: () => Promise<Response>): Promise<Response> {
  if (roleFrom(req) !== "phone") return run();
  const body: unknown = await req.clone().json().catch(() => null);
  const id = body && typeof body === "object" ? (body as { askId?: unknown }).askId : undefined;
  const ask = getSession().ask;
  if (!ask || ask.phase !== "open" || typeof id !== "string" || id !== ask.id) return NextResponse.json({ error: NOT_ASKING }, { status: 409 });
  dispatch({ type: "ask.sent", id: ask.id });
  try { return await run(); }
  finally { if (getSession().ask?.id === ask.id) dispatch({ type: "ask.cancel", id: ask.id }); }
}
