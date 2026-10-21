/**
 * The coaching step of a writing episode: a picked prompt and a drafted paragraph in, one coaching note out (the
 * engine words it, the ghostwriting guard holds it; lib/writing/coach). Nothing is saved here.
 *
 * On the TV (TV-WRITING-SCREEN-2026-10-21) the phone answers the TV's `writing` ask: a body with an `askId` goes through
 * the ask door (lib/session/phoneAsk.ts, which checks the ask's id AND its kind), the prompt is the TV episode's, and the
 * note lands on the session (writing.coached) for the TV to show. A body with no askId is the /writing page, as before.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { withPhoneAsk } from "@/lib/session/phoneAsk";
import { bandOf, learnerAge } from "@/lib/rules/voice";
import { text } from "@/lib/engines/text";
import { coachNote, type AskNote } from "@/lib/writing/coach";
import { coached, draftProblem, pick, START } from "@/lib/writing/episode";
import { promptById } from "@/lib/writing/prompts";

export const dynamic = "force-dynamic";
const NO_BODY = "The desk did not get your paragraph. Send it again.";
/** What a phone is told when the TV's episode is not waiting for a paragraph (it moved on, or was cleared). */
const NOT_WAITING_DRAFT = "The TV is not waiting for a paragraph now.";

/** The TV's episode: the paragraph for the prompt it picked, coached, and the note put on the session. */
async function coachOnTv(draft: unknown): Promise<Response> {
  const s = getSession(), ep = s.writingTv, who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  if (!ep || ep.stage !== "write" || ep.busy) return NextResponse.json({ error: NOT_WAITING_DRAFT }, { status: 409 });
  const prompt = promptById(ep.promptId), problem = draftProblem(draft);
  if (!prompt) return NextResponse.json({ error: NOT_WAITING_DRAFT }, { status: 409 });
  // a paragraph the rules refuse is never sent to the engine, and does not spend the ask: the phone fixes it and sends again
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const text_ = (draft as string).trim();
  dispatch({ type: "writing.busy", busy: true, by: who.id });
  try {
    const { note, source } = await coachNote(text_, bandOf(learnerAge(s)), prompt, text as unknown as AskNote);
    dispatch({ type: "writing.coached", draft: text_, note, by: who.id });
    return NextResponse.json({ episode: getSession().writingTv, source });
  } finally {
    dispatch({ type: "writing.busy", busy: false, by: who.id });
  }
}

export async function POST(req: Request) {
  // read from a clone: the ask door reads the body again
  const body = (await req.clone().json().catch(() => null)) as { promptId?: unknown; draft?: unknown } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: NO_BODY }, { status: 400 });
  if ("askId" in body) return withPhoneAsk(req, ["writing"], () => coachOnTv(body.draft));
  const s = getSession();
  if (!s.learner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const picked = pick(START, body.promptId);
  if (!picked.ok) return NextResponse.json({ error: picked.error }, { status: 400 });
  // validated before any model call: a paragraph the rules refuse is never sent to the engine
  const check = coached(picked.episode, body.draft, "");
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  const band = bandOf(learnerAge(s));
  const { note, source } = await coachNote(check.episode.draft!, band, promptById(body.promptId)!, text as unknown as AskNote);
  const done = coached(picked.episode, body.draft, note);
  if (!done.ok) return NextResponse.json({ error: done.error }, { status: 400 });
  return NextResponse.json({ episode: done.episode, source });
}
