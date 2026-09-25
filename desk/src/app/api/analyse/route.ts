/**
 * English: a sentence. Essay: a paragraph and a lens. Both land on the TV as analysis screens. A rewrite: one
 * sentence of the paragraph on the desk, rewritten on the phone and re-judged alone (desk/essay reviseSentence).
 */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { analyseSentence } from "@/lib/desk/english";
import { analyseEssay, reviseSentence } from "@/lib/desk/essay";
import { refused, runJob } from "@/lib/desk/job";
import { revise, rewriteState, type AnalysisType } from "@/lib/rules/essay";

export const dynamic = "force-dynamic";
type Body = { kind: "english"; sentence: string } | { kind: "essay"; text: string; type: AnalysisType } | { kind: "rewrite"; n: number; text: string };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (body.kind === "english") {
    const r = await runJob("analyse", async () => {
      const a = await analyseSentence(body.sentence);
      dispatch({ type: "english.set", analysis: a });
      return a;
    }, { key: "english", start: "reading your sentence…", done: (a) => (a.card.conflict ? "the tense and the time word disagree" : "tense matches the time word") });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  if (body.kind === "rewrite") {
    // the rewrite is checked in code before any run starts: one new sentence, for a sentence the paragraph has
    const a = getSession().essay;
    if (!a?.sentences.length) return NextResponse.json({ error: "There is no paragraph on the desk to rewrite in. Send one from the Essay tab." }, { status: 400 });
    const n = typeof body.n === "number" ? body.n : NaN;
    const ok = revise(a, n, typeof body.text === "string" ? body.text : "");
    if (!ok.ok) return NextResponse.json({ error: ok.error }, { status: 400 });
    const r = await runJob("analyse", async () => {
      const next = await reviseSentence(a, n, body.text);
      // a paragraph read or a reset since the rewrite was asked leaves the desk as it is now
      if (getSession().essay === a) dispatch({ type: "essay.revised", analysis: next, n });
      return next;
    }, {
      key: `sentence:${n}`, start: `reading sentence ${n} again…`,
      done: (x) => (rewriteState(x.verdicts.find((v) => v.n === n)) === "holds" ? `sentence ${n} holds now` : `sentence ${n} still needs the move`),
    });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  const r = await runJob("analyse", async () => {
    dispatch({ type: "essay.type", essayType: body.type });
    const a = await analyseEssay(body.text, body.type, getSession().learner.id);
    dispatch({ type: "essay.set", analysis: a });
    return a;
  }, { key: "essay", start: `reading your paragraph — ${body.type} lens…`, done: (a) => a.summary.slice(0, 120) });
  return r.ok ? NextResponse.json(r.value) : refused(r);
}
