/**
 * The phone snapped a page: show it at once, read it, then publish the items.
 * `{ id }` alone reads again a page the desk already holds (POST /api/session/retry after a failed read):
 * the same page id, its image from the session, so a retry never adds a second page.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK, READ_NOT_KEPT, READ_NOT_SAVED, sessionSaved } from "@/lib/session/store";
import { missingNumbers, readPage, type ReadWho } from "@/lib/desk/read";
import { learnerPath } from "@/lib/library/paths";
import { learnerAge } from "@/lib/rules/voice";
import { TYPE_WORDS, systemOf } from "@/tv/profileRows";
import { missingLine } from "@/tv/pageLines";
import { getLearner, saveLearner, withDigest, withHistory } from "@/lib/session/learners";
import { DeskSaid, EMPTY_READ, refused, runJob } from "@/lib/desk/job";
import type { Subject } from "@/lib/session/store";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; image?: string; subject?: Subject; title?: string; w?: number; h?: number };
  const held = body.id ? getSession().pages.find((p) => p.id === body.id) : undefined;
  if (body.id && !held) return NextResponse.json({ error: "That page is no longer on the desk." }, { status: 409 });
  const { img: image, subject, title, w, h } = held ?? { img: body.image ?? "", subject: body.subject ?? "maths", title: body.title ?? "Page", w: body.w ?? 0, h: body.h ?? 0 };
  if (!image) return NextResponse.json({ error: "Photograph a page first." }, { status: 400 });
  if (!["maths", "english", "essay"].includes(subject)) return NextResponse.json({ error: "The desk reads Math Buddy, Linga and Essay Master pages. Pick one of them." }, { status: 400 });
  // a new page needs the size of its photo: every position on it is a fraction of that size
  if (!held && !(Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0)) return NextResponse.json({ error: "The desk could not tell how big that photo is. Snap the page again." }, { status: 400 });
  const id = held?.id ?? `${subject}-${Date.now()}`;
  // the page is the learner's who snapped it: stamped now, and its history line goes to them even if the desk changes hands mid-read
  const owner = held?.owner ?? getSession().learner?.id;
  if (!owner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  // the maths read is told who the sheet is for: the profile of the learner whose page it is
  const profile = getSession().profiles.find((p) => p.id === owner);
  const who: ReadWho | undefined = subject === "maths" && profile ? { system: systemOf(profile), path: learnerPath({ profiles: [profile], learner: { id: owner } }), age: learnerAge({ profiles: [profile], learner: { id: owner } }), stage: TYPE_WORDS[profile.type] } : undefined;
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  const r = await runJob("read", async () => {
    dispatch({ type: "page.reading", page: { id, subject, title, img: image, w, h, owner } });
    const { items, provider, ms } = await readPage(b64, subject, w, h, id, who);
    // a read with no item is not a read: the job fails with the desk's reason, so Try again reads this page again in place
    if (!items.length) throw new DeskSaid(EMPTY_READ);
    // Math Buddy's home says where you left off, so the sheet it just read is recorded — written
    // before the event, because `page.read` is what re-hydrates the record onto the session.
    // The week's digest is told too (MB-B14), for the same owner: the problems read, as a count; the evening's hints are
    // counted onto this entry as they land (session/store.ts, learners.ts addHints). No title, no page id, no problem text.
    // A write that fails keeps the read: the page lands with its items and the job ends done, so no Try again is offered
    // (the same photo would be read, and paid for, again to fail the same way); the status says the page was not saved.
    let saved = true;
    if (subject === "maths") {
      try {
        const at = Date.now();
        // the history line and the digest entry in one save (WD10)
        saveLearner(withDigest(withHistory(getLearner(owner), {
          at, kind: "homework", label: title,
          detail: `${items.length} problem${items.length === 1 ? "" : "s"} read`,
        }), { at, kind: "homework", problems: items.length, hints: 0, second: 0 }));
      } catch (e) { saved = false; console.error("desk read: the page was read but could not be written to the learner file:", e instanceof Error ? e.message : e); }
    }
    // which printed numbers the read left out: the page and the answer carry it, so a partial read is never taken for a whole one
    const missing = missingNumbers(items);
    if (missing?.length) console.warn(`desk read: page ${id} left out printed numbers ${missing.join(", ")}`);
    dispatch({ type: "page.read", id, items, readMs: ms, provider, missing });
    // the page is on the desk, but session.json did not take it (HF4): said apart from the learner file, which wins
    const kept = sessionSaved();
    return { id, items: items.length, ms, provider, missing, saved: saved && kept, learnerSaved: saved };
  }, {
    key: id, input: { id }, start: "reading the page…", done: (x) => !x.saved ? (x.learnerSaved ? READ_NOT_KEPT : READ_NOT_SAVED) : `${x.items} items read in ${(x.ms / 1000).toFixed(0)} s${x.missing?.length ? `. ${missingLine(x.missing)}` : ""}`,
    // the page stays on the desk, empty, so the TV stops saying "reading"
    onFail: () => dispatch({ type: "page.read", id, items: [], readMs: 0, provider: "error" }),
  });
  if (!r.ok) return refused(r);
  return NextResponse.json(r.value);
}
