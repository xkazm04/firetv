/** The learner said how they got there; the desk answers with a step, never the answer. */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/store";
import { explain } from "@/lib/desk/explain";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { transcript, n } = (await req.json().catch(() => ({}))) as { transcript?: string; n?: number };
  const s = getSession();
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  const item = practice.items[typeof n === "number" ? n : s.walkIx];
  if (!item) return NextResponse.json({ error: "no item" }, { status: 400 });
  const r = await runJob("explain", () => explain(item.question, transcript ?? "", practice.topic, s.learner.id),
    { key: String(item.n), start: "listening…", done: (x) => x.reply });
  if (!r.ok) return refused(r);
  return NextResponse.json({ reply: r.value.reply, slip: r.value.slip });
}
