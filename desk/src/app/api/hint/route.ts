/** A hint for the focused item (or the item the phone circled), then the lesson pick behind it. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { hint } from "@/lib/desk/hint";
import { pickLesson } from "@/lib/desk/pick";
import { resolveEnglish } from "@/lib/rules/english";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { askedQ?: string; stage?: 1 | 2; itemIx?: number };
  const s = getSession();
  const page = s.pages[s.pageIx]; if (!page) return NextResponse.json({ error: "no page" }, { status: 400 });
  if (typeof body.itemIx === "number") dispatch({ type: "item", itemIx: body.itemIx });
  const item = page.items[typeof body.itemIx === "number" ? body.itemIx : s.itemIx]; if (!item) return NextResponse.json({ error: "no item" }, { status: 400 });

  if (body.stage === 2 && s.hint && s.hint.key === item.key) {
    const h2 = await hint(page.subject, item.text, { previous: s.hint.hint1?.hint, askedQ: s.hint.askedQ, rule: s.hint.rule });
    dispatch({ type: "hint.set", hint: { ...s.hint, stage: 2, hint2: { hint: h2.hint, next: h2.next }, ms: h2.ms } });
    dispatch({ type: "hint.stage", stage: 2 });
    return NextResponse.json({ stage: 2, ...h2 });
  }
  const rule = page.subject === "english" ? resolveEnglish(item.text) : undefined;
  dispatch({ type: "status", text: "thinking about a hint…" });
  const h1 = await hint(page.subject, item.text, { askedQ: body.askedQ, rule });
  dispatch({ type: "hint.set", hint: { key: item.key, problem: item.text, stage: 1, hint1: { hint: h1.hint, next: h1.next }, hint2: null, askedQ: body.askedQ ?? "", rule, provider: h1.provider, ms: h1.ms } });
  dispatch({ type: "status", text: `hint in ${(h1.ms / 1000).toFixed(1)} s · finding the lesson…` });
  pickLesson(page.subject, item.text).then((l) => { dispatch({ type: "lesson.set", lesson: l }); dispatch({ type: "status", text: l ? `lesson: ${l.title}` : "no lesson covers this one" }); })
    .catch((e) => dispatch({ type: "status", text: `lesson pick failed: ${String(e).slice(0, 100)}` }));
  return NextResponse.json({ stage: 1, ...h1 });
}
