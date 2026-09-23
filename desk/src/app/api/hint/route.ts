/** A hint for the focused item (or the item the phone circled), then the lesson pick behind it. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { hint } from "@/lib/desk/hint";
import { pickLesson } from "@/lib/desk/pick";
import { BUSY, refused, runJob } from "@/lib/desk/job";
import { resolveEnglish } from "@/lib/rules/english";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { askedQ?: string; stage?: 1 | 2; itemIx?: number };
  const s = getSession();
  const page = s.pages[s.pageIx]; if (!page) return NextResponse.json({ error: "no page" }, { status: 400 });
  const itemIx = typeof body.itemIx === "number" ? body.itemIx : s.itemIx;
  const item = page.items[itemIx]; if (!item) return NextResponse.json({ error: "no item" }, { status: 400 });
  // one hint at a time: each is a model call and counts in the log
  if (getSession().jobs?.hint?.phase === "running") return refused({ status: 409, error: BUSY });
  if (typeof body.itemIx === "number") dispatch({ type: "item", itemIx: body.itemIx });

  const prev = s.hint;
  if (body.stage === 2 && prev && prev.key === item.key) {
    const r = await runJob("hint", async () => {
      const h2 = await hint(page.subject, item.text, { previous: prev.hint1?.hint, askedQ: prev.askedQ, rule: prev.rule });
      dispatch({ type: "hint.set", hint: { ...prev, stage: 2, hint2: { hint: h2.hint, next: h2.next }, ms: h2.ms } });
      dispatch({ type: "hint.stage", stage: 2 });
      return h2;
    }, { key: item.key, input: { itemIx, stage: 2, askedQ: prev.askedQ }, start: "thinking one step further…", done: (h2) => `second hint in ${(h2.ms / 1000).toFixed(1)} s` });
    return r.ok ? NextResponse.json({ stage: 2, ...r.value }) : refused(r);
  }
  const rule = page.subject === "english" ? resolveEnglish(item.text) : undefined;
  const r = await runJob("hint", async () => {
    const h1 = await hint(page.subject, item.text, { askedQ: body.askedQ, rule });
    dispatch({ type: "hint.set", hint: { key: item.key, problem: item.text, stage: 1, hint1: { hint: h1.hint, next: h1.next }, hint2: null, askedQ: body.askedQ ?? "", rule, provider: h1.provider, ms: h1.ms } });
    return h1;
  }, { key: item.key, input: { itemIx, askedQ: body.askedQ ?? "" }, start: "thinking about a hint…", done: (h1) => `hint in ${(h1.ms / 1000).toFixed(1)} s · finding the lesson…` });
  if (!r.ok) return refused(r);
  // the lesson behind the hint, keyed to it: a newer hint's pick replaces this one, and a pick that lands late is dropped
  void runJob("lesson", async (run) => {
    const l = await pickLesson(page.subject, item.text);
    if (run.current()) dispatch({ type: "lesson.set", lesson: l, key: item.key });
    return l;
  }, { key: item.key, supersedes: true, done: (l) => (l ? `lesson: ${l.title}` : "no lesson covers this one") });
  return NextResponse.json({ stage: 1, ...r.value });
}
