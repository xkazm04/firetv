/** The phone snapped a page: show it at once, read it, then publish the items. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { readPage } from "@/lib/desk/read";
import { addHistory } from "@/lib/session/learners";
import { refused, runJob } from "@/lib/desk/job";
import type { Subject } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { image, subject, title, w, h } = (await req.json()) as { image: string; subject: Subject; title: string; w: number; h: number };
  const id = `${subject}-${Date.now()}`;
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
    key: id, start: "reading the page…", done: (x) => `${x.items} items read in ${(x.ms / 1000).toFixed(0)} s`,
    // the page stays on the desk, empty, so the TV stops saying "reading"
    onFail: () => dispatch({ type: "page.read", id, items: [], readMs: 0, provider: "error" }),
  });
  if (!r.ok) return refused(r);
  return NextResponse.json(r.value);
}
