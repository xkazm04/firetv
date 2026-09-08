/** The phone snapped a page: show it at once, read it, then publish the items. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { readPage } from "@/lib/desk/read";
import { addHistory } from "@/lib/session/learners";
import type { Subject } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { image, subject, title, w, h } = (await req.json()) as { image: string; subject: Subject; title: string; w: number; h: number };
  const id = `${subject}-${Date.now()}`;
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  dispatch({ type: "page.reading", page: { id, subject, title, img: image, w, h } });
  dispatch({ type: "status", text: "reading the page…" });
  try {
    const { items, provider, ms } = await readPage(b64, subject, w, h);
    // Math Buddy's home says where you left off, so the sheet it just read is recorded — written
    // before the event, because `page.read` is what re-hydrates the record onto the session.
    if (subject === "maths") {
      addHistory(getSession().learner.id, {
        at: Date.now(), kind: "homework", label: title,
        detail: `${items.length} problem${items.length === 1 ? "" : "s"} read`,
      });
    }
    dispatch({ type: "page.read", id, items, readMs: ms, provider });
    dispatch({ type: "status", text: `${items.length} items read in ${(ms / 1000).toFixed(0)} s` });
    return NextResponse.json({ id, items: items.length, ms, provider });
  } catch (e) {
    dispatch({ type: "page.read", id, items: [], readMs: 0, provider: "error" });
    dispatch({ type: "status", text: `could not read the page: ${String(e).slice(0, 120)}` });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
