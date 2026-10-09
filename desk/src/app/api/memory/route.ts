/**
 * Write what tonight taught the desk about this learner, into the file that outlives the session.
 *
 * Menu on the TV's landing and the phone's End session both ask for it, and a recap may be opened by accident or
 * opened twice, so the model is asked only when there is something new to write: an evening with no marked item,
 * no hint, no Essay reading and no Linga conversation has nothing to note, and the evening the last written run was
 * asked about (the job's key, on the session) is not written twice. A failed run is asked again; new work since - a
 * hint, a verdict, a reading, a conversation - is new.
 *
 * The answer says which case it is: `asked` false is an evening with no work (nothing was asked), `asked` true with
 * no lines is a model that found nothing new; a failed run answers with the desk's own sentence as `error`.
 */
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/session/store";
import { writeMemory } from "@/lib/desk/memory";
import { refused, runJob } from "@/lib/desk/job";
import { eveningOf, type Evening } from "@/tv/recapRows";

export const dynamic = "force-dynamic";

/** Everything the memory prompt is asked with, bar the notes it already holds, as a short key. */
function evening(s: Session, who: string, topic: string | undefined, tonight: Evening): string {
  const items = (s.practice?.items ?? []).map((i) => [i.n, i.question, i.verdict ?? null, i.slip ?? null, i.studentWorking ?? null]);
  return createHash("sha256").update(JSON.stringify([who, topic ?? null, items, s.log.hints, tonight.essay, tonight.linga])).digest("hex").slice(0, 16);
}

export async function POST() {
  const s = getSession(), who = s.learner;
  // an evening no one sat at teaches the desk nothing about anyone
  if (!who) return NextResponse.json({ lines: [], asked: false });
  const topic = s.practice?.topic ?? s.topic ?? undefined;
  const tonight = eveningOf(s, Date.now());
  if (!s.practice?.items?.length && !s.log.hints && !tonight.essay.length && !tonight.linga.conversations) return NextResponse.json({ lines: [], asked: false });
  const key = evening(s, who.id, topic, tonight), last = s.jobs?.memory;
  if (last?.phase === "done" && last.key === key) return NextResponse.json({ lines: [], asked: true });
  const r = await runJob("memory", () => writeMemory(who.id, {
    topic,
    items: s.practice?.items,
    hintsUsed: s.log.hints,
    essay: tonight.essay,
    linga: tonight.linga,
  }), { key });
  if (!r.ok) return refused(r);
  return NextResponse.json({ lines: r.value, asked: true });
}
