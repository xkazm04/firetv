/** The phone snapped the worked set: mark all of it in one pass, then re-check the marker. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { markSet } from "@/lib/desk/mark";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { image } = (await req.json()) as { image: string; w: number; h: number };
  const s = getSession();
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  const b64 = (image ?? "").replace(/^data:image\/\w+;base64,/, "");
  dispatch({ type: "status", text: "marking the set…" });
  try {
    const { items, provider, ms, unsure } = await markSet(b64, practice, s.learner.id);
    dispatch({ type: "practice.marked", items });
    const right = items.filter((i) => i.verdict === "right").length;
    const wrong = items.filter((i) => i.verdict === "wrong").length;
    dispatch({ type: "status", text: `${right} right, ${wrong} to look at${unsure ? `, ${unsure} to talk through` : ""}` });
    return NextResponse.json({ right, wrong, unsure, provider, ms });
  } catch (e) {
    dispatch({ type: "status", text: `could not mark the set: ${String(e).slice(0, 120)}` });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
