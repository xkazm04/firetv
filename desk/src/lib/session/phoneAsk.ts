import { NextResponse } from "next/server";
import { dispatch, getSession, type AskKind } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";

/** What a phone is told when it answers a hand-off the TV is not making now (TL-11). */
export const NOT_ASKING = "The TV is not asking for that now.";

/** The asks a result route answers: a list, or the list for one request's body (analyse answers a sentence, a paragraph or a rewrite by its kind). */
export type AnswersAsks = readonly AskKind[] | ((body: Record<string, unknown>) => readonly AskKind[]);

/**
 * The door of a result route (read, mark, analyse, hint, explain, second) for a phone (TL-11). A phone answers the TV's
 * open ask and nothing else: a request with no askId, one that is not the open ask's id, or the id of an open ask of a
 * kind this route does not answer (`kinds`: a Linga reply is no page) is 409 and touches nothing. With the right id the
 * ask is marked sent as the work begins, and the result - whatever it came to - closes it.
 * The TV and an in-process caller (no role) pass straight through, as before. `except` names a request the route
 * refuses by its own rule for every phone (analyse: a kept piece is the TV's to read), which keeps its own answer.
 */
export async function withPhoneAsk(req: Request, kinds: AnswersAsks, run: () => Promise<Response>, except?: (body: Record<string, unknown>) => boolean): Promise<Response> {
  if (roleFrom(req) !== "phone") return run();
  const body: unknown = await req.clone().json().catch(() => null);
  const fields = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (except?.(fields)) return run();
  const ask = getSession().ask;
  const answers = typeof kinds === "function" ? kinds(fields) : kinds;
  if (!ask || ask.phase !== "open" || typeof fields.askId !== "string" || fields.askId !== ask.id || !answers.includes(ask.kind)) return NextResponse.json({ error: NOT_ASKING }, { status: 409 });
  dispatch({ type: "ask.sent", id: ask.id });
  try { return await run(); }
  finally { if (getSession().ask?.id === ask.id) dispatch({ type: "ask.cancel", id: ask.id }); }
}
