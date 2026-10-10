/**
 * A hint for the focused item (or the item the phone circled), then the lesson pick behind it. The learner's Math
 * path is read here and handed to hint(); on a path judged 'calc' a maths item has no lesson library to pick from, so
 * the lesson job ends as 'no lesson' without asking the picker (which would offer a school algebra video). The seated
 * profile's age is read here too, for the tutor's voice (rules/voice). A maths task that reads as a school unit with no
 * lesson in the library (rules/kinds kindOfQuestion: add and subtract fractions, Family W5b) ends the same way, so
 * the hint screen says "No lesson for this" instead of offering a linear-equations video.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK, HINT_NOT_COUNTED, hintCounted } from "@/lib/session/store";
import { groundFor, hint } from "@/lib/desk/hint";
import { pickLesson } from "@/lib/desk/pick";
import { BUSY, blocksRun, refused, runJob } from "@/lib/desk/job";
import { resolveEnglish } from "@/lib/rules/english";
import { judgeOf, learnerPath } from "@/lib/library/paths";
import { learnerAge } from "@/lib/rules/voice";
import { kindOfQuestion } from "@/lib/rules/kinds";
import { learnerSystem } from "@/lib/rules/school";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { askedQ?: string; stage?: 1 | 2; itemIx?: number };
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const page = s.pages[s.pageIx]; if (!page) return NextResponse.json({ error: "Photograph a page first." }, { status: 400 });
  const itemIx = typeof body.itemIx === "number" ? body.itemIx : s.itemIx;
  const item = page.items[itemIx]; if (!item) return NextResponse.json({ error: "That item is not on the page." }, { status: 400 });
  // one hint at a time: each is a model call and counts in the log
  if (blocksRun(getSession().jobs?.hint, who.id)) return refused({ status: 409, error: BUSY });
  if (typeof body.itemIx === "number") dispatch({ type: "item", itemIx: body.itemIx });

  const path = learnerPath(s), age = learnerAge(s), system = learnerSystem(s);
  const prev = s.hint;
  // a maths hint is also told the learner's notation, their recorded slips on the task's unit and its worked method (MB-B8)
  const ground = page.subject === "maths" ? groundFor(item.text, { id: who.id, system }) : "";
  if (body.stage === 2 && prev && prev.key === item.key) {
    const r = await runJob("hint", async () => {
      const h2 = await hint(page.subject, item.text, { previous: [prev.hint1?.hint, prev.hint1?.next].filter(Boolean).join(" "), askedQ: prev.askedQ, rule: prev.rule, path, age, ground, system });
      dispatch({ type: "hint.set", hint: { ...prev, stage: 2, hint2: { hint: h2.hint, next: h2.next }, ms: h2.ms, owner: prev.owner ?? who.id } });
      dispatch({ type: "hint.stage", stage: 2, owner: prev.owner ?? who.id });
      return { ...h2, counted: hintCounted() };
    }, { key: item.key, input: { itemIx, stage: 2, askedQ: prev.askedQ }, start: "thinking one step further…", done: (h2) => (h2.counted ? `second hint in ${(h2.ms / 1000).toFixed(1)} s` : HINT_NOT_COUNTED) });
    return r.ok ? NextResponse.json({ stage: 2, ...r.value }) : refused(r);
  }
  const rule = page.subject === "english" ? resolveEnglish(item.text) : undefined;
  const r = await runJob("hint", async () => {
    const h1 = await hint(page.subject, item.text, { askedQ: body.askedQ, rule, path, age, ground, system });
    dispatch({ type: "hint.set", hint: { key: item.key, problem: item.text, stage: 1, hint1: { hint: h1.hint, next: h1.next }, hint2: null, askedQ: body.askedQ ?? "", rule, provider: h1.provider, ms: h1.ms, owner: who.id } });
    return { ...h1, counted: hintCounted() };
  }, { key: item.key, input: { itemIx, askedQ: body.askedQ ?? "" }, start: "thinking about a hint…", done: (h1) => (h1.counted ? `hint in ${(h1.ms / 1000).toFixed(1)} s · finding the lesson…` : HINT_NOT_COUNTED) });
  if (!r.ok) return refused(r);
  // the lesson behind the hint, run for the learner who asked (it speaks only while they are seated, and lands in their away slot after a switch), keyed to it: a newer hint's pick replaces this one
  let myRun = "";
  // a pick that is no longer the latest still lands (or ends the wait) on the hint that holds its key, seated or away, unless the same learner asked again for this item (P13)
  const landed = (l: Awaited<ReturnType<typeof pickLesson>>) => {
    const cur = getSession().jobs?.lesson, held = getSession().hint;
    if (cur && cur.id !== myRun && cur.key === item.key && cur.by === who.id) return;
    if (held?.key === item.key && held.owner !== undefined && held.owner !== who.id) return;
    dispatch({ type: "lesson.set", lesson: l, key: item.key });
  };
  void runJob("lesson", async (run) => {
    myRun = run.id;
    const noLibrary = page.subject === "maths" && (judgeOf(path) === "calc" || kindOfQuestion(item.text, system) === "school");
    const l = noLibrary ? null : await pickLesson(page.subject, item.text, system);
    if (run.current()) dispatch({ type: "lesson.set", lesson: l, key: item.key });
    else landed(l);
    return l;
  }, { key: item.key, supersedes: true, askedBy: who.id, done: (l) => `${r.value.counted ? "" : `${HINT_NOT_COUNTED} · `}${l ? `lesson: ${l.title}` : "no lesson covers this one"}` }).then((p) => { if (!p.ok) landed(null); }); // a pick refused at the start or failed ends the wait for its hint, seated or away
  return NextResponse.json({ stage: 1, ...r.value });
}
