/** Write what tonight taught the desk about this learner, into the file that outlives the session. */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/store";
import { writeMemory } from "@/lib/desk/memory";

export const dynamic = "force-dynamic";
export async function POST() {
  const s = getSession();
  try {
    const lines = await writeMemory(s.learner.id, {
      topic: s.practice?.topic ?? s.topic ?? undefined,
      items: s.practice?.items,
      hintsUsed: s.log.hints,
    });
    return NextResponse.json({ lines });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
