/**
 * The second go: a ringed item takes ONE typed answer from the phone (Math Buddy's Walk). Code judges it - the judge marking
 * uses (rules/kinds judgeItem, through lib/desk/mark secondGo), no model - and the route raises the one event only the desk may
 * raise, `practice.second`, which carries a verdict and never the answer typed. The first attempt stays the record: nothing
 * here touches the learner's skills, history or digest. An answer the desk cannot read is refused in a desk sentence and does
 * not spend the go. The reply is `{ ok: true }`: the TV draws what the go came to, the phone says nothing about it.
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { secondGo } from "@/lib/desk/mark";
import { TYPED_ANSWER_MAX, secondProblem } from "@/lib/rules/maths";
import { learnerSystem } from "@/lib/rules/school";

export const dynamic = "force-dynamic";
const NO_BODY = "The desk did not get your answer. Type it again.";
const BLANK = "Type your answer first, then send it.";
const UNREADABLE = "The desk could not read that as an answer. Type just what you got and send it again.";
const NOT_MARKED = "There is no marked set on the desk to go back to.";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { n?: unknown; answer?: unknown } | null;
  if (!body || typeof body !== "object" || typeof body.n !== "number") return NextResponse.json({ error: NO_BODY }, { status: 400 });
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const practice = s.practice;
  if (!practice || !practice.marked) return NextResponse.json({ error: NOT_MARKED }, { status: 409 });
  const item = practice.items.find((it) => it.n === body.n);
  if (!item) return NextResponse.json({ error: "That item is not on the desk any more." }, { status: 400 });
  // one go, on a wrong item only: the rule is the rulebook's (rules/maths secondProblem)
  const problem = secondProblem(item);
  if (problem) return NextResponse.json({ error: problem }, { status: 409 });
  if (typeof body.answer !== "string") return NextResponse.json({ error: NO_BODY }, { status: 400 });
  if (!body.answer.trim()) return NextResponse.json({ error: BLANK }, { status: 400 });
  // a refusal never truncates: past the cap it is sent back to be shortened
  if (body.answer.length > TYPED_ANSWER_MAX) return NextResponse.json({ error: `That answer is longer than ${TYPED_ANSWER_MAX} characters. Shorten it and send again.` }, { status: 400 });
  const verdict = secondGo(item, body.answer, practice.topic, learnerSystem(s));
  if (!verdict) return NextResponse.json({ error: UNREADABLE }, { status: 400 });
  dispatch({ type: "practice.second", n: item.n, verdict });
  return NextResponse.json({ ok: true });
}
