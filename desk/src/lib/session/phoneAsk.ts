import { NextResponse } from "next/server";
import { answerAsk, dispatch, getSession, type AskKind } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";

/** What a phone is told when it answers a hand-off the TV is not making now (TL-11). */
export const NOT_ASKING = "The TV is not asking for that now.";

/** The asks a result route answers: a list, or the list for one request's body (analyse answers a sentence, a paragraph or a rewrite by its kind). */
export type AnswersAsks = readonly AskKind[] | ((body: Record<string, unknown>) => readonly AskKind[]);

/**
 * The door of a result route (read, mark, analyse, hint, explain, second) for a phone (TL-11). A phone answers the TV's
 * open ask and nothing else: a request with no askId, one that is not the open ask's id, or the id of an open ask of a
 * kind this route does not answer (`kinds`: a Linga reply is no page) is 409 and touches nothing. With the right id the
 * ask is marked sent once the work begins (the route's run starts: store.ts answerAsk), and a result or a failure of the
 * work closes it. A request the route refuses before any work (a 4xx with no run begun: bad input, busy, no notice yet)
 * does not spend it: the ask stays open for the phone to answer again.
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
  let res: Response | undefined, begun = false;
  try { ({ value: res, begun } = await answerAsk(ask.id, run)); return res; }
  finally {
    // a throw, a result (2xx), a fault (5xx) or any answer once the work began closes it; a refusal before the work leaves it open
    const spent = begun || !res || res.status < 400 || res.status >= 500;
    if (spent && getSession().ask?.id === ask.id) dispatch({ type: "ask.cancel", id: ask.id });
  }
}
