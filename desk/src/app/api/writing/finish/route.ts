/**
 * The last step of a writing episode: the revision in, the finished episode saved to the seated learner's record
 * (lib/writing/save: a 'writing' history line and recordWriting). The episode is rebuilt step by step from the body, so
 * a body that skips a stage is refused. No model.
 *
 * On the TV (TV-WRITING-SCREEN-2026-10-21) the phone answers the TV's `writing` ask with the revision alone: a body with an
 * `askId` goes through the ask door (lib/session/phoneAsk.ts), the prompt, paragraph and note are the TV episode's, and
 * the save goes through the same saveEpisode; the TV shows the saved line (writing.finished).
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { withPhoneAsk } from "@/lib/session/phoneAsk";
import { coached, finished, pick, revised, START } from "@/lib/writing/episode";
import { saveEpisode } from "@/lib/writing/save";

export const dynamic = "force-dynamic";
const NO_BODY = "The desk did not get your paragraph. Send it again.";
/** What a phone is told when the TV's episode is not waiting for a revision. */
const NOT_WAITING_REVISION = "The TV is not waiting for a revision now.";

/** The TV's episode: its paragraph and note, the phone's revision, saved to the learner at the desk. */
function finishOnTv(revision: unknown): Response {
  const s = getSession(), ep = s.writingTv, who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  if (!ep || ep.stage !== "coached" || ep.busy) return NextResponse.json({ error: NOT_WAITING_REVISION }, { status: 409 });
  let step = pick(START, ep.promptId);
  if (step.ok) step = coached(step.episode, ep.draft, ep.note ?? "");
  if (step.ok) step = revised(step.episode, revision);
  // too short, too long or unchanged: the ask stays open for the phone to fix it
  if (!step.ok) return NextResponse.json({ error: step.error }, { status: 400 });
  dispatch({ type: "writing.busy", busy: true, by: who.id });
  try {
    const done = finished(step.episode, Date.now());
    if (!done.ok) return NextResponse.json({ error: done.error }, { status: 400 });
    const saved = saveEpisode(who.id, done.episode);
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 500 });
    dispatch({ type: "writing.finished", revision: done.episode.revision!, saved: saved.detail, by: who.id });
    return NextResponse.json({ episode: done.episode, saved: saved.detail, focus: done.episode.focus, holds: done.episode.holds });
  } finally {
    dispatch({ type: "writing.busy", busy: false, by: who.id });
  }
}

export async function POST(req: Request) {
  // read from a clone: the ask door reads the body again
  const body = (await req.clone().json().catch(() => null)) as { promptId?: unknown; draft?: unknown; note?: unknown; revision?: unknown } | null;
  if (body && typeof body === "object" && "askId" in body) return withPhoneAsk(req, ["writing"], async () => finishOnTv(body.revision));
  if (!body || typeof body !== "object" || typeof body.note !== "string") return NextResponse.json({ error: NO_BODY }, { status: 400 });
  const who = getSession().learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  let step = pick(START, body.promptId);
  if (step.ok) step = coached(step.episode, body.draft, body.note);
  if (step.ok) step = revised(step.episode, body.revision);
  if (step.ok) step = finished(step.episode, Date.now());
  if (!step.ok) return NextResponse.json({ error: step.error }, { status: 400 });
  const saved = saveEpisode(who.id, step.episode);
  if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 500 });
  return NextResponse.json({ episode: step.episode, saved: saved.detail, focus: step.episode.focus, holds: step.episode.holds });
}
