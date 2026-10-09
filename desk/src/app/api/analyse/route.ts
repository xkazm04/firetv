/**
 * English: a sentence. Essay: a paragraph and a lens. Both land on the TV as analysis screens. A rewrite: one
 * sentence of the paragraph on the desk, rewritten on the phone and re-judged alone (desk/essay reviseSentence).
 */
import { NextResponse } from "next/server";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { analyseSentence } from "@/lib/desk/english";
import { analyseEssay, analysePiece, reviseSentence } from "@/lib/desk/essay";
import { refused, runJob } from "@/lib/desk/job";
import { essayTooLong, paragraphsOf, pieceProblem, revise, rewriteState, type AnalysisType } from "@/lib/rules/essay";
import { addPiece, addVersion, noticed, TEXT_NOTICE } from "@/lib/session/texts";
import { learnerAge } from "@/lib/rules/voice";

export const dynamic = "force-dynamic";
type Body = { kind: "english"; sentence: string } | { kind: "essay"; text: string; type: AnalysisType } | { kind: "rewrite"; n: number; text: string }
  | { kind: "piece"; text: string; type: AnalysisType; keep?: boolean; pieceId?: string; source?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  // a reading is somebody's: with no one at the desk there is no one to read it for
  const who = getSession().learner;
  // the tutor's voice fits the seated profile's age (rules/voice); no age known speaks as it always has
  const age = learnerAge(getSession());
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  if (body.kind === "english") {
    const r = await runJob("analyse", async () => {
      const a = await analyseSentence(body.sentence, age);
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
      const next = await reviseSentence(a, n, body.text, age, who.id);
      // a paragraph read or a reset since the rewrite was asked leaves the desk as it is now
      if (getSession().essay === a) dispatch({ type: "essay.revised", analysis: next, n });
      return next;
    }, {
      key: `sentence:${n}`, start: `reading sentence ${n} again…`,
      done: (x) => (rewriteState(x.verdicts.find((v) => v.n === n)) === "holds" ? `sentence ${n} holds now` : `sentence ${n} still needs the move`),
    });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  if (body.kind === "piece") {
    // a whole piece (v2 E1): checked in code before any run, kept on the learner's shelf when asked (after the
    // one-time notice), then read paragraph by paragraph while the TV fills in
    const problem = pieceProblem(body.text);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    let pieceId: string | undefined;
    if (body.keep) {
      if (!noticed(who.id)) return NextResponse.json({ error: TEXT_NOTICE, notice: true }, { status: 428 });
      const kept = typeof body.pieceId === "string" ? addVersion(who.id, body.pieceId, { text: body.text, source: body.source }) : addPiece(who.id, { text: body.text, source: body.source });
      // the same text kept again is not a failure: the reading goes ahead on the version already kept
      if (kept.ok) pieceId = kept.value.id;
      else if (typeof body.pieceId === "string" && kept.status === 400 && /kept last/.test(kept.error)) pieceId = body.pieceId;
      else return NextResponse.json({ error: kept.error }, { status: kept.status });
    }
    const paragraphs = paragraphsOf(body.text).length;
    let first = true;
    const r = await runJob("analyse", async (run) => {
      dispatch({ type: "essay.type", essayType: body.type, owner: who.id });
      const done = await analysePiece(body.text, body.type, who.id, age, (a) => {
        if (!run.current()) return;
        // the first paragraph back opens the reading; the rest grow it where the learner is
        dispatch(first ? { type: "essay.set", analysis: a, owner: who.id } : { type: "essay.progress", analysis: a, owner: who.id });
        first = false;
      }, pieceId);
      // the piece is recorded once it is all read, after the last paragraph's progress: say so, so the session's history
      // and the Sunday page are read again (store.ts REHYDRATE)
      if (run.current()) dispatch({ type: "essay.progress", analysis: done, owner: who.id });
      return done;
    }, { key: "essay", start: `reading your piece, ${paragraphs} paragraphs — ${body.type} lens…`, done: (a) => a.summary.slice(0, 120) });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  // one paragraph per reading: a longer text is refused with a sentence, never cut down (the cap is in rules/essay,
  // not measured: revisit after live use). The phone splits a file or message into paragraphs before it sends one.
  const tooLong = essayTooLong(body.text);
  if (tooLong) return NextResponse.json({ error: tooLong }, { status: 400 });
  const r = await runJob("analyse", async () => {
    dispatch({ type: "essay.type", essayType: body.type, owner: who.id });
    const a = await analyseEssay(body.text, body.type, who.id, age);
    dispatch({ type: "essay.set", analysis: a, owner: who.id });
    return a;
  }, { key: "essay", start: `reading your paragraph — ${body.type} lens…`, done: (a) => a.summary.slice(0, 120) });
  return r.ok ? NextResponse.json(r.value) : refused(r);
}
