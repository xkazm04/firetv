/**
 * The learner said how they got there; the desk answers with a step, never the answer. On an item the
 * desk was not sure about, nothing settles (X7, ask d6d87220): the item settles only from an answer the learner enters.
 * On an item already wrong, a slip the explanation names from the topic's vocabulary becomes the item's shown slip.
 */
import { NextResponse } from "next/server";
import { withPhoneAsk } from "@/lib/session/phoneAsk";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { explainItem } from "@/lib/desk/explain";
import { refused, runJob } from "@/lib/desk/job";
import { learnerAge } from "@/lib/rules/voice";
import { learnerSystem } from "@/lib/rules/school";
import { itemName } from "@/lib/rules/calc-word";
import { EXPLAIN_TRANSCRIPT_MAX } from "@/lib/rules/saidValue";
import { ASK } from "@/lib/rules/maths";

export const dynamic = "force-dynamic";

/**
 * The reply when the model's own could not be shown (empty, or it gave the answer away) and explainItem stood the item's
 * own line in for it (lib/desk/explain.ts `own`): that line is the question the card already asks, so stored as the reply
 * the card read "The desk replied" over the opening question again (F18). No number, no answer; English but for cz.
 */
const HEARD_LINE = {
  en: "The desk heard you. Go through your working one step at a time and check each step against the one before it.",
  cz: "Stůl tě slyšel. Projdi svůj postup krok za krokem a každý krok porovnej s tím předchozím.",
};
export function POST(req: Request) { return withPhoneAsk(req, ["explain"], () => post(req)); }
async function post(req: Request) {
  const { transcript, n } = ((await req.json().catch(() => null)) ?? {}) as { transcript?: unknown; n?: number };
  const s = getSession(), who = s.learner;
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  const practice = s.practice;
  if (!practice) return NextResponse.json({ error: "Start a practice set first." }, { status: 400 });
  const item = practice.items[typeof n === "number" ? n : s.walkIx];
  if (!item) return NextResponse.json({ error: "That item is not on the desk any more." }, { status: 400 });
  // nothing to hear, or too much to send, is refused before any model call; a refusal never truncates
  if (typeof transcript !== "string" || !transcript.trim()) return NextResponse.json({ error: "Say or type how you got your answer first." }, { status: 400 });
  if (transcript.length > EXPLAIN_TRANSCRIPT_MAX) return NextResponse.json({ error: `That is longer than ${EXPLAIN_TRANSCRIPT_MAX} characters. Shorten it and send again.` }, { status: 400 });
  // after the model answers, the walk may have moved on: settle only the same item, on the same set, still unsure
  const same = () => {
    const now = getSession().practice;
    const it = now?.items.find((x) => x.n === item.n);
    return !!now && now.owner === practice.owner && now.topic === practice.topic && it?.question === item.question ? it : undefined;
  };
  const r = await runJob("explain", async () => {
    const sys = learnerSystem(s);
    const got = await explainItem(item, transcript, practice.topic, who.id, () => same()?.verdict === "unsure", learnerAge(s), sys, itemName(practice.items, practice.items.indexOf(item)));
    // the item's own line came back as the reply: answer with a line of the desk's, not the opening question again (F18)
    const heard = sys === "cz" ? HEARD_LINE.cz : HEARD_LINE.en;
    const x = got.reply === (item.said ?? ASK(item.n)) ? { ...got, reply: heard, shown: heard } : got;
    // an explanation never settles (X7): only a wrong item takes the slip the explanation named (the reducer keeps its verdict and pen)
    if (same()) dispatch({ type: "practice.settle", n: item.n, reply: x.reply, ...(x.renamed ?? {}) });
    return x;
  }, { key: String(item.n), start: "listening…", done: (x) => x.shown });
  if (!r.ok) return refused(r);
  return NextResponse.json({ reply: r.value.shown, slip: r.value.slip });
}
