/**
 * The phone sent the worked set: mark all of it in one pass, then re-check the marker. A mark lands only on the set
 * it marked, and only once: a set already marked is refused before any model call, and a mark whose set is no longer
 * on the desk when the model answers (another set landed from Topics, the set was put away) is dropped - MOVED_ON,
 * nothing recorded - as explain drops a reply for an item the walk has left.
 *
 * The set arrives one of two ways, exactly one per request: `image`, a photo of the worked sheet (the vision model
 * reads it, code marks it), or `answers`, the six answers typed on the phone (Family W6: one string per question in
 * item order, a blank for one the child left; code marks them at once, no vision call, no model call). Both land the
 * same way: one `practice.marked` event, one history line, the same sheet on the TV.
 *
 * A learner's own snapped maths page (MB-B35): `page` names a page on the desk and `image` is a photo of their working on it. Only
 * a photo, only a page the seated learner snapped, once. The code judge marks the items the page reads as specs; the rest are not
 * sure. It lands as `page.marked` on the page (the owner's away slot after a switch), with the same guards as a desk set.
 */
import { NextResponse } from "next/server";
import { withPhoneAsk } from "@/lib/session/phoneAsk";
import { dispatch, getSession, NOBODY_AT_DESK, type Page, type Practice } from "@/lib/session/store";
import { markPage, markSet, markTyped, pageSpecs } from "@/lib/desk/mark";
import { MOVED_ON, refused, runJob } from "@/lib/desk/job";
import { readImageProblem, typedAnswersProblem } from "@/lib/rules/maths";
import { markCounts } from "@/lib/rules/marks";
import { learnerSystem } from "@/lib/rules/school";

export const dynamic = "force-dynamic";
const START = "marking the set…";
const NO_PHOTO = "The desk did not get a photo of the set. Snap it again.";
const NEITHER = "The desk got neither a photo of the set nor typed answers. Snap the sheet or type your answers.";
const BOTH = "The desk got a photo and typed answers together. Send one or the other.";
const NO_PAGE = "That page is no longer on the desk.";
const NOT_MATHS = "The desk marks a maths page. Pick a Math Buddy page.";
const NOT_YOURS = "That page is not on your desk. Snap your own page to mark it.";
const PAGE_TYPED = "A snapped page is marked from a photo of the working. Send the photo.";
const NOTHING_READS = "The desk cannot read any problem on that page as maths it can check, so it has nothing to mark.";
const PAGE_ALREADY_MARKED = "This page is already marked.";
const ALREADY_MARKED = "This set is already marked. Ask for a new set to mark another.";

/** The same questions, in the same order, on the same topic, still waiting to be marked. */
/** The page, still on the desk (the seated learner's, or its owner's in the away slot), unmarked, with the same items. */
const samePage = (now: ReturnType<typeof getSession>, owner: string, was: Page) => {
  const p = (now.learner?.id === owner ? now.pages : now.away?.[owner]?.pages)?.find((x) => x.id === was.id);
  return !!p && !p.marked && p.items.length === was.items.length && p.items.every((it, i) => it.key === was.items[i].key && it.text === was.items[i].text);
};
const sameSet = (now: Practice | null | undefined, was: Practice) =>
  !!now && !now.marked && now.topic === was.topic && now.items.length === was.items.length &&
  now.items.every((it, i) => it.n === was.items[i].n && it.question === was.items[i].question);

export function POST(req: Request) { return withPhoneAsk(req, (b) => (b.answers !== undefined ? ["answers"] : ["sheet"]), () => post(req)); }
async function post(req: Request) {
  // a body that is not the phone's snap or answers is refused in desk words, never an unhandled throw (a 500)
  const body = (await req.json().catch(() => null)) as { image?: unknown; answers?: unknown; page?: unknown; w?: number; h?: number } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: NO_PHOTO }, { status: 400 });
  // exactly one way in: a photo or the typed answers
  const hasImage = body.image !== undefined, typed = body.answers !== undefined;
  if (hasImage && typed) return NextResponse.json({ error: BOTH }, { status: 400 });
  if (!hasImage && !typed) return NextResponse.json({ error: NEITHER }, { status: 400 });
  const image = typeof body.image === "string" ? body.image : "";
  // a photo that is not text, or has no data once the data-URL prefix is off, is no photo: no job, no model call
  if (hasImage && !image.replace(/^data:image\/\w+;base64,/, "").trim()) return NextResponse.json({ error: NO_PHOTO }, { status: 400 });
  // a photo over the read's cap is refused here too, before any job or vision call (rules/maths readImageProblem: the one cap for every photo door)
  const heavy = hasImage ? readImageProblem(image) : null;
  if (heavy) return NextResponse.json({ error: heavy }, { status: 400 });
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  if (body.page !== undefined) return markPageRoute(body.page, typed, image, s, who.id);
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "Start a practice set first." }, { status: 400 });
  // marked once: a second mark would record every attempt and the history line again
  if (practice.marked) return NextResponse.json({ error: ALREADY_MARKED }, { status: 409 });
  // typed answers: one string per question, capped, checked before any job starts (a refusal never truncates)
  if (typed) {
    const problem = typedAnswersProblem(body.answers, practice.items.length);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  // the set is the learner's it was written for: a mark that ends after they left lands on their set, not the next learner's
  const owner = practice.owner ?? who.id;
  const same = () => {
    const now = getSession();
    return sameSet(now.learner?.id === owner ? now.practice : now.away?.[owner]?.practice, practice);
  };
  const r = await runJob("mark", async (run) => {
    const still = () => run.current() && same();
    // a school item's answer is read by the seated learner's school system ('0,5' is a half in cz and de)
    const { items, provider, ms, landed } = typed
      ? markTyped(body.answers as string[], practice, who.id, still, learnerSystem(s))
      : await markSet(b64, practice, who.id, still, learnerSystem(s));
    if (!landed || !still()) return null;
    dispatch({ type: "practice.marked", items, owner });
    // the counts the sheet draws (rules/marks): an item left empty is skipped, not one to talk through
    const { right, wrong, unsure, skipped } = markCounts(items);
    return { right, wrong, unsure, skipped, provider, ms };
  }, { start: START, done: (m) => (m ? `${m.right} right, ${m.wrong} to look at${m.unsure ? `, ${m.unsure} to talk through` : ""}${m.skipped ? `, ${m.skipped} skipped` : ""}` : "") });
  if (!r.ok) return refused(r);
  if (!r.value) {
    // the dropped run's start line is not left saying the desk is still marking
    if (getSession().status === START) dispatch({ type: "status", text: "" });
    return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  return NextResponse.json(r.value);
}

/** Mark the learner's own snapped page from a photo of their working: the same guards as a desk set, the same code judge. */
async function markPageRoute(pageId: unknown, typed: boolean, image: string, s: ReturnType<typeof getSession>, who: string) {
  if (typed) return NextResponse.json({ error: PAGE_TYPED }, { status: 400 });
  const page = typeof pageId === "string" ? s.pages.find((p) => p.id === pageId) : undefined;
  if (!page) return NextResponse.json({ error: NO_PAGE }, { status: 409 });
  if (page.subject !== "maths") return NextResponse.json({ error: NOT_MATHS }, { status: 400 });
  // a page is the learner's who snapped it: another learner's page is never marked from this desk seat
  if ((page.owner ?? who) !== who) return NextResponse.json({ error: NOT_YOURS }, { status: 409 });
  if (page.marked) return NextResponse.json({ error: PAGE_ALREADY_MARKED }, { status: 409 });
  // the system the page's items are read by is the seated learner's, as for a set; a page nothing reads has nothing to mark, so no model call
  const system = learnerSystem(s);
  if (!pageSpecs(page, system).size) return NextResponse.json({ error: NOTHING_READS }, { status: 400 });
  const b64 = image.replace(/^data:image\/\w+;base64,/, "");
  const owner = page.owner ?? who;
  const r = await runJob("mark", async (run) => {
    const still = () => run.current() && samePage(getSession(), owner, page);
    const { items, provider, ms, landed } = await markPage(b64, page, owner, still, system);
    if (!landed || !still()) return null;
    dispatch({ type: "page.marked", id: page.id, items });
    // an item the desk could not settle is one to talk through, whether or not an answer was read on it
    const right = items.filter((i) => i.verdict === "right").length, wrong = items.filter((i) => i.verdict === "wrong").length;
    return { right, wrong, unsure: items.length - right - wrong, provider, ms };
  }, { start: START, done: (m) => (m ? `${m.right} right, ${m.wrong} to look at${m.unsure ? `, ${m.unsure} to talk through` : ""}` : "") });
  if (!r.ok) return refused(r);
  if (!r.value) {
    if (getSession().status === START) dispatch({ type: "status", text: "" });
    return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  return NextResponse.json(r.value);
}
