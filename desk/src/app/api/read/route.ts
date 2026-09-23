/**
 * The phone snapped a page: show it at once, read it, then publish the items.
 * `{ id }` alone reads again a page the desk already holds (POST /api/session/retry after a failed read):
 * the same page id, its image from the session, so a retry never adds a second page.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { readPage } from "@/lib/desk/read";
import { addHistory } from "@/lib/session/learners";
import { refused, runJob } from "@/lib/desk/job";
import type { Subject } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; image?: string; subject?: Subject; title?: string; w?: number; h?: number };
  const held = body.id ? getSession().pages.find((p) => p.id === body.id) : undefined;
  if (body.id && !held) return NextResponse.json({ error: "That page is no longer on the desk." }, { status: 409 });
  const { img: image, subject, title, w, h } = held ?? { img: body.image ?? "", subject: body.subject ?? "maths", title: body.title ?? "Page", w: body.w ?? 0, h: body.h ?? 0 };
  if (!image) return NextResponse.json({ error: "no page" }, { status: 400 });
  const id = held?.id ?? `${subject}-${Date.now()}`;
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  const r = await runJob("read", async () => {
    dispatch({ type: "page.reading", page: { id, subject, title, img: image, w, h } });
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
    return { id, items: items.length, ms, provider };
  }, {
    key: id, input: { id }, start: "reading the page…", done: (x) => `${x.items} items read in ${(x.ms / 1000).toFixed(0)} s`,
    // the page stays on the desk, empty, so the TV stops saying "reading"
    onFail: () => dispatch({ type: "page.read", id, items: [], readMs: 0, provider: "error" }),
  });
  if (!r.ok) return refused(r);
  return NextResponse.json(r.value);
}
