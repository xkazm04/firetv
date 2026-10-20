/**
 * The last step of a writing episode: the revision in, the finished episode saved to the seated learner's record
 * (lib/writing/save: a 'writing' history line and recordWriting). The episode is rebuilt step by step from the body, so
 * a body that skips a stage is refused. No model.
 */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { coached, finished, pick, revised, START } from "@/lib/writing/episode";
import { saveEpisode } from "@/lib/writing/save";

export const dynamic = "force-dynamic";
const NO_BODY = "The desk did not get your paragraph. Send it again.";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { promptId?: unknown; draft?: unknown; note?: unknown; revision?: unknown } | null;
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
  return NextResponse.json({ episode: step.episode, saved: saved.detail });
}
