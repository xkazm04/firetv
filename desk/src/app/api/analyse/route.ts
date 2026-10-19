/**
 * English: a sentence. Essay: a paragraph and a lens. Both land on the TV as analysis screens. A rewrite: one
 * sentence of the paragraph on the desk, rewritten on the phone and re-judged alone (desk/essay reviseSentence).
 */
import { NextResponse } from "next/server";
import { withPhoneAsk } from "@/lib/session/phoneAsk";
import { dispatch, getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { analyseSentence } from "@/lib/desk/english";
import { analyseEssay, analysePiece, analysePieceAgain, reviseSentence, type ReadingFor } from "@/lib/desk/essay";
import { BUSY, blocksRun, refused, runJob, type JobRun } from "@/lib/desk/job";
import { ANALYSIS_TYPES, essayTooLong, NOT_ENGLISH_LINE, paragraphIsEnglish, paragraphsOf, pieceAgainProblem, pieceBeingRead, pieceProblem, revise, REWRITE_WHILE_READING, rewriteUnruledLine, rewriteState, type AnalysisType } from "@/lib/rules/essay";
import { addPiece, addVersion, FORMAT_NEEDED_LINE, getPiece, hasFormat, matchPiece, noticed, TEXT_NOTICE } from "@/lib/session/texts";
import { roleFrom } from "@/lib/session/pairing";
import { learnerAge } from "@/lib/rules/voice";
import { modeOf } from "@/lib/rules/mode";
import { sentenceProblem } from "@/lib/rules/english";

export const dynamic = "force-dynamic";
type Body = { kind: "english"; sentence: string } | { kind: "essay"; text: string; type: AnalysisType; task?: string } | { kind: "rewrite"; n: number; text: string }
  | { kind: "piece-again" } | { kind: "shelf-piece"; pieceId: string }
  | { kind: "piece"; text: string; type: AnalysisType; keep?: boolean; pieceId?: string; source?: string; format?: string; title?: string; task?: string };

/** E3-b: a reading refused before any run with a line for the learner says the line on the TV's status line too, whichever door sent it. */
/** A refusal said before any run: on the session as the status, and as an essay refusal when it is one (the essay screens caption it). */
function refusedWithLine(error: string, essay = true) {
  dispatch({ type: "status", text: error, essayRefused: essay });
  return NextResponse.json({ error }, { status: 400 });
}

/** The kinds of reading this route answers; a body naming none of them is not a reading. */
const KINDS: ReadonlyArray<Body["kind"]> = ["english", "essay", "rewrite", "piece-again", "piece", "shelf-piece"];
const NOT_A_READING = "The desk did not get anything to read. Send it again from the phone.";
/** A kept piece is read again from the TV's Workroom only (recert-6/L1-helena-46-EM5-3): the phone and the PC read through kind 'piece'. */
const SHELF_PIECE_TV_ONLY = "A kept piece is read again from the TV's Workroom.";
/** The Workroom named a piece that is not on the seated learner's shelf (deleted since, or never theirs): nothing is read. */
const SHELF_PIECE_GONE = "That piece is not on your shelf.";
const blank = (t: unknown) => typeof t !== "string" || !t.trim();

/**
 * Whether a reading still belongs to its owner (LP-R2): it is the latest analyse run, or a switch ended its job - the owner
 * is away or sat back down, someone is seated, and no other reading has taken the job. A reading the owner replaced with a
 * newer one (the job is another run's), or a reset desk (nobody seated), is dropped.
 */
function readingStands(run: JobRun, owner: string): boolean {
  if (run.current()) return true;
  const seated = getSession().learner?.id, job = getSession().jobs?.analyse;
  if (seated === undefined) return false;
  return job === undefined || job.by !== owner;
}

/** The longest task the reading carries; the rest is cut, never refused. */
const TASK_MAX = 400;
/** The task the paragraph answers, when the send names one: a plain trimmed string, or nothing. */
const taskOf = (t: unknown): string | undefined => (typeof t === "string" && t.trim() ? t.trim().slice(0, TASK_MAX) : undefined);

/**
 * A whole piece read paragraph by paragraph while the TV fills in: the one run the phone's piece and the Workroom's kept
 * piece share. The first paragraph back opens the reading (essay.set), the rest grow it (essay.progress).
 */
function readPiece(who: { id: string }, text: string, type: AnalysisType, age: number | undefined, o: { pieceId?: string; format?: string; reader: ReadingFor; untilRead?: boolean }) {
  const paragraphs = paragraphsOf(text).length;
  let first = true;
  return runJob("analyse", async (run) => {
    // LP-R2: a switch ends the job (store.ts switchedFrom) but not the reading: it keeps going into the leaving learner's
    // away slot (every event here carries owner), and on to the owner's desk if they sit back down. A reading the learner replaced, or a reset desk, still drops.
    const goes = () => readingStands(run, who.id);
    dispatch({ type: "essay.type", essayType: type, owner: who.id });
    const done = await analysePiece(text, type, who.id, age, (a) => {
      if (!goes()) return;
      // `untilRead` (the Workroom's read): a report with no paragraph read yet does not open it, so a piece that fails leaves the TV on the Workroom
      if (first && o.untilRead && !a.piece?.read.length) return;
      // the first paragraph back opens the reading; the rest grow it where the learner is
      dispatch(first ? { type: "essay.set", analysis: a, owner: who.id } : { type: "essay.progress", analysis: a, owner: who.id });
      first = false;
    }, o.pieceId, o.format, o.reader);
    // the piece is recorded once it is all read, after the last paragraph's progress: say so, so the session's history
    // and the Sunday page are read again (store.ts REHYDRATE)
    if (goes()) dispatch({ type: "essay.progress", analysis: done, owner: who.id });
    return done;
  }, { key: "essay", start: `reading your piece, ${paragraphs} paragraphs — ${type} lens…`, done: (a) => a.summary.slice(0, 120) });
}

export function POST(req: Request) { return withPhoneAsk(req, () => post(req), (b) => b.kind === "shelf-piece"); }
async function post(req: Request) {
  // a body that is not one of the readings is refused in desk words before any run: never a 500, never a failed job
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body !== "object" || !KINDS.includes(body.kind)) return NextResponse.json({ error: NOT_A_READING }, { status: 400 });
  // the TV's read of a kept piece is the TV's alone: any other role, or none, is refused before anything is looked up
  if (body.kind === "shelf-piece" && roleFrom(req) !== "tv") return NextResponse.json({ error: SHELF_PIECE_TV_ONLY }, { status: 403 });
  if ((body.kind === "english" && blank(body.sentence)) || (body.kind === "essay" && blank(body.text))) return NextResponse.json({ error: NOT_A_READING }, { status: 400 });
  const sentenceLong = body.kind === "english" ? sentenceProblem(body.sentence) : null;
  if (sentenceLong) return refusedWithLine(sentenceLong, false);
  // a reading is somebody's: with no one at the desk there is no one to read it for
  const who = getSession().learner;
  // the tutor's voice fits the seated profile's age (rules/voice); no age known speaks as it always has
  const age = learnerAge(getSession());
  // and the profile's mode: an Adult-mode reading names an adult writer, never a student (rules/voice)
  const seated = getSession();
  const mode = modeOf(seated.profiles?.find((p) => p.id === seated.learner?.id), seated.englishLearning?.preferences ?? undefined);
  if (!who) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  if (body.kind === "english") {
    const r = await runJob("analyse", async () => {
      const a = await analyseSentence(body.sentence, age);
      dispatch({ type: "english.set", analysis: a, owner: who.id });
      return a;
    }, { key: "english", start: "reading your sentence…", done: (a) => (a.card.conflict ? "the tense and the time word disagree" : "tense matches the time word") });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  if (body.kind === "rewrite") {
    // the rewrite is checked in code before any run starts: one new sentence, for a sentence the paragraph has
    const a = getSession().essay;
    if (!a?.sentences.length) return NextResponse.json({ error: "There is no paragraph on the desk to rewrite in. Send one from the Essay tab." }, { status: 400 });
    // E2-b: a piece still being read has no verdicts to rewrite against
    if (pieceBeingRead(a.piece)) return NextResponse.json({ error: REWRITE_WHILE_READING }, { status: 400 });
    const n = typeof body.n === "number" ? body.n : NaN;
    // E4-b: a sentence of a paragraph the desk did not rule has no rewrite; the paragraph's own line, before any run
    const unruled = rewriteUnruledLine(a, n);
    if (unruled) return NextResponse.json({ error: unruled }, { status: 400 });
    const ok = revise(a, n, typeof body.text === "string" ? body.text : "");
    if (!ok.ok) return NextResponse.json({ error: ok.error }, { status: 400 });
    // a rewrite that was read but whose history line did not save still succeeds, and says so (as SETTLE_NOT_SAVED does)
    let notSaved: string | undefined;
    const r = await runJob("analyse", async () => {
      const next = await reviseSentence(a, n, body.text, age, who.id, (line) => { notSaved = line; }, { mode });
      // a paragraph read or a reset since the rewrite was asked leaves the desk as it is now
      if (getSession().essay === a) dispatch({ type: "essay.revised", analysis: next, n });
      return next;
    }, {
      key: `sentence:${n}`, start: `reading sentence ${n} again…`,
      done: (x) => notSaved ?? (rewriteState(x.verdicts.find((v) => v.n === n)) === "holds" ? `sentence ${n} holds now` : `sentence ${n} still needs the move`),
    });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  if (body.kind === "piece-again") {
    // E4-a: the paragraphs of the piece on the desk that did not come back, read once more; checked in code before any run
    const a = getSession().essay;
    const problem = pieceAgainProblem(a);
    if (problem || !a) return NextResponse.json({ error: problem }, { status: 400 });
    let notSaved: string | undefined;
    const r = await runJob("analyse", async (run) => {
      const done = await analysePieceAgain(a, who.id, age, (line) => { notSaved = line; }, { mode });
      // one report, when the piece is ruled; a reading replaced since leaves the desk as it is now
      if (readingStands(run, who.id) && getSession().essay === a) dispatch({ type: "essay.progress", analysis: done, owner: who.id });
      return done;
    }, { key: "essay", start: "reading the paragraphs that did not come back…", done: (x) => notSaved ?? x.summary.slice(0, 120) });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  if (body.kind === "shelf-piece") {
    // a kept piece read again from the TV's Workroom (recert-6/L1-helena-46-EM5-3): its latest version, looked up here for
    // the seated learner only, read as the phone's piece is. It writes nothing: no piece, no version, no notice, no record.
    const piece = typeof body.pieceId === "string" ? getPiece(who.id, body.pieceId) : null;
    if (!piece) return refusedWithLine(SHELF_PIECE_GONE);
    // a shelf without the notice (cleared since) is not read: only the phone accepts it
    if (!noticed(who.id)) return NextResponse.json({ error: TEXT_NOTICE, notice: true }, { status: 428 });
    const type = (ANALYSIS_TYPES.find((t) => t.id === getSession().essayType) ?? ANALYSIS_TYPES[0]).id;
    const r = await readPiece(who, piece.versions.at(-1)!.text, type, age, { pieceId: piece.id, reader: { mode, noSave: true }, untilRead: true });
    // the answer names the piece and the summary the TV already shows, never its text
    return r.ok ? NextResponse.json({ pieceId: piece.id, summary: r.value.summary }) : refused(r);
  }
  if (body.kind === "piece") {
    // a whole piece (v2 E1): checked in code before any run, kept on the learner's shelf when asked (after the
    // one-time notice), then read paragraph by paragraph while the TV fills in
    const problem = pieceProblem(body.text);
    if (problem) return refusedWithLine(problem);
    // E3: a piece with no paragraph in English is said so before anything is kept or read
    if (!paragraphsOf(body.text).some(paragraphIsEnglish)) return refusedWithLine(NOT_ENGLISH_LINE);
    let pieceId: string | undefined;
    if (body.keep) {
      // a pieceId that is no longer on the shelf (deleted since the phone opened it) is no pieceId: a new piece (L1-daniel-15-EM3-6)
      const named = typeof body.pieceId === "string" && getPiece(who.id, body.pieceId) ? body.pieceId : undefined;
      // a text that is another version of a kept piece goes to that piece, not to a second card (L1-daniel-15-EM3-1)
      const target = named ?? (typeof body.text === "string" ? matchPiece(who.id, body.text, body.format) ?? undefined : undefined);
      // a new piece needs a chosen format (a new version of a kept piece keeps the piece's own): refused before anything is kept
      if (!target && !hasFormat(body.format)) return NextResponse.json({ error: FORMAT_NEEDED_LINE }, { status: 400 });
      // a reading already running refuses this one: refused before the piece is kept, so a refused send leaves no piece on the shelf
      if (blocksRun(getSession().jobs?.analyse, who.id)) return refused({ status: 409, error: BUSY });
      if (!noticed(who.id)) return NextResponse.json({ error: TEXT_NOTICE, notice: true }, { status: 428 });
      let kept = target ? addVersion(who.id, target, { text: body.text, source: body.source }) : addPiece(who.id, { text: body.text, source: body.source, format: body.format, title: body.title });
      // the same text kept again is not a failure: the reading goes ahead on the version already kept
      if (!kept.ok && target && kept.status === 400 && /kept last/.test(kept.error)) { pieceId = target; kept = { ok: true, value: getPiece(who.id, target)! }; }
      // a guessed match that cannot take a version (full) is a new piece, if the phone named a format; one the learner named is told
      else if (!kept.ok && target && !named && hasFormat(body.format)) kept = addPiece(who.id, { text: body.text, source: body.source, format: body.format, title: body.title });
      if (kept.ok) pieceId = kept.value.id;
      else return NextResponse.json({ error: kept.error }, { status: kept.status });
    }
    const r = await readPiece(who, body.text, body.type, age, { pieceId, format: body.format, reader: { mode, task: taskOf(body.task) } });
    return r.ok ? NextResponse.json(r.value) : refused(r);
  }
  // one paragraph per reading: a longer text is refused with a sentence, never cut down (the cap is in rules/essay,
  // not measured: revisit after live use). The phone splits a file or message into paragraphs before it sends one.
  const tooLong = essayTooLong(body.text);
  if (tooLong) return refusedWithLine(tooLong);
  // E3: code decides whether the paragraph is English before any run, and says so plainly when it is not
  if (!paragraphIsEnglish(body.text)) return refusedWithLine(NOT_ENGLISH_LINE);
  // UD-7: the first paragraph read asks the same one-time notice as keep, before any run
  if (!noticed(who.id)) return NextResponse.json({ error: TEXT_NOTICE, notice: true }, { status: 428 });
  const r = await runJob("analyse", async () => {
    dispatch({ type: "essay.type", essayType: body.type, owner: who.id });
    const a = await analyseEssay(body.text, body.type, who.id, age, { mode, task: taskOf(body.task) });
    dispatch({ type: "essay.set", analysis: a, owner: who.id });
    return a;
  }, { key: "essay", start: `reading your paragraph — ${body.type} lens…`, done: (a) => a.summary.slice(0, 120) });
  return r.ok ? NextResponse.json(r.value) : refused(r);
}
