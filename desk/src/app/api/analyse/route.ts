/** English: a sentence. Essay: a paragraph and a lens. Both land on the TV as analysis screens. */
import { NextResponse } from "next/server";
import { dispatch, getSession } from "@/lib/session/store";
import { analyseSentence } from "@/lib/desk/english";
import { analyseEssay } from "@/lib/desk/essay";
import type { AnalysisType } from "@/lib/rules/essay";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const body = (await req.json()) as { kind: "english"; sentence: string } | { kind: "essay"; text: string; type: AnalysisType };
  try {
    if (body.kind === "english") {
      dispatch({ type: "status", text: "reading your sentence…" });
      const a = await analyseSentence(body.sentence);
      dispatch({ type: "english.set", analysis: a }); dispatch({ type: "status", text: a.card.conflict ? "the tense and the time word disagree" : "tense matches the time word" });
      return NextResponse.json(a);
    }
    dispatch({ type: "essay.type", essayType: body.type }); dispatch({ type: "status", text: `reading your paragraph — ${body.type} lens…` });
    const a = await analyseEssay(body.text, body.type, getSession().learner.id);
    dispatch({ type: "essay.set", analysis: a }); dispatch({ type: "status", text: a.summary.slice(0, 120) });
    return NextResponse.json(a);
  } catch (e) {
    dispatch({ type: "status", text: `analysis failed: ${String(e).slice(0, 120)}` });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
