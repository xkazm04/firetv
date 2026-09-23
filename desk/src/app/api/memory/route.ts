/** Write what tonight taught the desk about this learner, into the file that outlives the session. */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/store";
import { writeMemory } from "@/lib/desk/memory";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
export async function POST() {
  const s = getSession();
  const r = await runJob("memory", () => writeMemory(s.learner.id, {
    topic: s.practice?.topic ?? s.topic ?? undefined,
    items: s.practice?.items,
    hintsUsed: s.log.hints,
  }));
  if (!r.ok) return refused(r);
  return NextResponse.json({ lines: r.value });
}
