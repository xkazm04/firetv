/** English: a sentence. Essay: a paragraph and a lens. Both land on the TV as analysis screens. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { analyseSentence } from "@/lib/desk/english";
import { analyseEssay } from "@/lib/desk/essay";
import { refused, runJob } from "@/lib/desk/job";
import type { AnalysisType } from "@/lib/rules/essay";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json()) as { kind: "english"; sentence: string } | { kind: "essay"; text: string; type: AnalysisType };
  if (body.kind === "english") {
    const r = await runJob("analyse", async () => {
      const a = await analyseSentence(body.sentence);
      dispatch({ type: "english.set", analysis: a });
      return a;
    }, { key: "english", start: "reading your sentence…", done: (a) => (a.card.conflict ? "the tense and the time word disagree" : "tense matches the time word") });
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
