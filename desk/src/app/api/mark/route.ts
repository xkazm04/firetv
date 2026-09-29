/** The phone snapped the worked set: mark all of it in one pass, then re-check the marker. */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { markSet } from "@/lib/desk/mark";
import { refused, runJob } from "@/lib/desk/job";

export const dynamic = "force-dynamic";
const NO_PHOTO = "The desk did not get a photo of the set. Snap it again.";
export async function POST(req: Request) {
  // a body that is not the phone's snap is refused in desk words, never an unhandled throw (a 500)
  const body = (await req.json().catch(() => null)) as { image?: unknown; w?: number; h?: number } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: NO_PHOTO }, { status: 400 });
  const image = typeof body.image === "string" ? body.image : "";
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "no practice set" }, { status: 400 });
  const b64 = (image ?? "").replace(/^data:image\/\w+;base64,/, "");
  const r = await runJob("mark", async () => {
    const { items, provider, ms, unsure } = await markSet(b64, practice, who.id);
    // the set is the learner's it was written for: a mark that ends after they left lands on their set, not the next learner's
    dispatch({ type: "practice.marked", items, owner: practice.owner ?? who.id });
    const right = items.filter((i) => i.verdict === "right").length;
    const wrong = items.filter((i) => i.verdict === "wrong").length;
    return { right, wrong, unsure, provider, ms };
  }, { start: "marking the set…", done: ({ right, wrong, unsure }) => `${right} right, ${wrong} to look at${unsure ? `, ${unsure} to talk through` : ""}` });
  if (!r.ok) return refused(r);
  return NextResponse.json(r.value);
}
