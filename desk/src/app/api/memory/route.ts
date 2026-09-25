/**
 * Write what tonight taught the desk about this learner, into the file that outlives the session.
 *
 * Menu on the TV's landing and the phone's End session both ask for it, and a recap may be opened by accident or
 * opened twice, so the model is asked only when there is something new to write: an evening with no marked item
 * and no hint has nothing to note, and the evening the last written run was asked about (the job's key, on the
 * session) is not written twice. A failed run is asked again; new work since - a hint, a verdict - is new.
 */
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/session/store";
import { writeMemory } from "@/lib/desk/memory";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";

/** Everything the memory prompt is asked with, bar the notes it already holds, as a short key. */
function evening(s: Session, topic: string | undefined): string {
  const items = (s.practice?.items ?? []).map((i) => [i.n, i.question, i.verdict ?? null, i.slip ?? null, i.studentWorking ?? null]);
  return createHash("sha256").update(JSON.stringify([s.learner.id, topic ?? null, items, s.log.hints])).digest("hex").slice(0, 16);
}

export async function POST() {
  const s = getSession();
  const topic = s.practice?.topic ?? s.topic ?? undefined;
  if (!s.practice?.items?.length && !s.log.hints) return NextResponse.json({ lines: [] });
  const key = evening(s, topic), last = s.jobs?.memory;
  if (last?.phase === "done" && last.key === key) return NextResponse.json({ lines: [] });
  const r = await runJob("memory", () => writeMemory(s.learner.id, {
    topic,
    items: s.practice?.items,
    hintsUsed: s.log.hints,
  }), { key });
  if (!r.ok) return refused(r);
  return NextResponse.json({ lines: r.value });
}
