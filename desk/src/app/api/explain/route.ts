/**
 * The learner said how they got there; the desk answers with a step, never the answer. On an item the
 * desk was not sure about, the value they say they got is substituted (rules/maths) and the item settles.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { explainItem } from "@/lib/desk/explain";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { transcript, n } = (await req.json().catch(() => ({}))) as { transcript?: string; n?: number };
  const s = getSession();
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  const item = practice.items[typeof n === "number" ? n : s.walkIx];
  if (!item) return NextResponse.json({ error: "no item" }, { status: 400 });
  // after the model answers, the walk may have moved on: settle only the same item, on the same set, still unsure
  const same = () => {
    const now = getSession().practice;
    const it = now?.items.find((x) => x.n === item.n);
    return !!now && now.topic === practice.topic && it?.question === item.question ? it : undefined;
  };
  const r = await runJob("explain", async () => {
    const x = await explainItem(item, transcript ?? "", practice.topic, s.learner.id, () => same()?.verdict === "unsure");
    if (same()) dispatch({ type: "practice.settle", n: item.n, reply: x.reply, ...(x.settled ?? {}) });
    return x;
  }, { key: String(item.n), start: "listening…", done: (x) => x.reply });
  if (!r.ok) return refused(r);
  return NextResponse.json({ reply: r.value.reply, slip: r.value.slip, ...(r.value.settled ? { settled: r.value.settled.verdict } : {}) });
}
