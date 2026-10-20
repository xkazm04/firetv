/**
 * The coaching step of a writing episode: a picked prompt and a drafted paragraph in, one coaching note out (the
 * engine words it, the ghostwriting guard holds it; lib/writing/coach). Nothing is saved here.
 */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { bandOf, learnerAge } from "@/lib/rules/voice";
import { text } from "@/lib/engines/text";
import { coachNote, type AskNote } from "@/lib/writing/coach";
import { coached, pick, START } from "@/lib/writing/episode";
import { promptById } from "@/lib/writing/prompts";

export const dynamic = "force-dynamic";
const NO_BODY = "The desk did not get your paragraph. Send it again.";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { promptId?: unknown; draft?: unknown } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: NO_BODY }, { status: 400 });
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
