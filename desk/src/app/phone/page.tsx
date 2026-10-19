"use client";
/**
 * The phone: the instrument. Camera, pen, keyboard, mic. It never renders the big view.
 * The TV leads (TV-led design): a strip, one body, a bar of at most three items. Recap and the rest live under More.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, call as rawCall } from "@/tv/useSession";
import { ESSAY_TYPES, PLAYBOOK } from "@/lib/library/lessons.data";
import { essayFileProblem, essayTooLong, REWRITE_WHILE_READING, paragraphsOf, pieceAgainOffered, pieceBeingRead, pieceProblem, planFill, planFit, planSlots } from "@/lib/rules/essay";
import { EssayShelf, TextNotice } from "./EssayShelf";
import { rewriteStaysLine, writeRewriteBack } from "./rewriteBack";
import { topicIn } from "@/lib/library/paths";
import { BRAND as MODULE } from "@/tv/profileRows";
import type { Event, JobKind, Session, Subject } from "@/lib/session/store";
import { LingaPhone } from "@/english/LingaPhone";
import { barItems, moreRows, type MoreId } from "./phoneBar";
import { BANNER, HTTP_LIMIT, deskLine, follow, joinRefusal, leaveOutcome, type JoinHow, type PScreen } from "./panelFor";
import { forensicAt, planAt, switchEndsLine } from "@/tv/keys";
import { dayOf } from "@/tv/mathsRows";
import { counted, hintedLine, learnerRecaps, recapCaption, recapLine, recapRows, slippedLine, startOfDay, tasksLine, tonightsLog } from "@/tv/recapRows";
import { nearestItem } from "@/lib/desk/select";
import { TYPED_ANSWER_MAX } from "@/lib/rules/maths";
import { markCounts } from "@/lib/rules/marks";
import { itemName, partPlace } from "@/lib/rules/calc-word";
import { PaperPanel } from "./PaperPanel";
import { ExplainTalk } from "./ExplainTalk";
import { recogniserLangFor } from "./recogniserLang";
import { blankRow, type DraftRow } from "@/lib/rules/paperEntry";
import { draftKey, parseDraft, serialiseDraft } from "@/lib/rules/paperDraft";
import { WEEK_EMPTY, type WeekLine } from "@/lib/rules/week";

const SAMPLES: Array<{ id: Subject; title: string; file: string }> = [
  { id: "maths", title: "Algebra — Exercise 4.2", file: "/samples/maths.jpg" },
  { id: "english", title: "English — Unit 6", file: "/samples/english.jpg" },
  // no essay page: Essay Master takes text (a file or a message on the Essay panel), never a photo of handwriting
];

/** The TV's screens in the user's words, for the phone's status line. Every screen has one: a new screen is a type error here, not a raw id on the phone. */
const TV_WORDS: Record<Session["screen"], string> = {
  landing: "the desk", pair: "the pairing code", joined: "the paired screen", tonight: "Math Buddy", learner: "the learners", profile: "the learner's picks",
  units: "the units guide", calendar: "the calendar", page: "the page", hint: "a hint", lesson: "a lesson", sentence: "your sentence",
  headtohead: "head to head", essaytype: "Essay Master", essayplan: "your plan", forensic: "your paragraph", playbook: "the playbook", xray: "the x-ray", break: "a break", recap: "the recap",
  topics: "Math Buddy's topics", prepare: "getting ready for school", paper: "your paper", practice: "the practice set", sheet: "your marked sheet", walk: "a marked item", worked: "a worked lesson", workroom: "the Workroom",
  linga: "Linga", "linga-scenes": "English situations", "linga-map": "your learning map", "linga-talk": "your conversation", "linga-coach": "a coaching moment", "linga-recap": "your rehearsal recap", "linga-check": "finding your level", "linga-verdict": "your level", "linga-plan": "your topics", "linga-moment": "a moment in your conversation", "linga-cert": "your certificate", "linga-certs": "your certificates",
};
/** The desk refuses a name longer than this (PROFILE_NAME_MAX in the session store, which is server-only and cannot be imported here); the input stops at it so the phone shows what the TV keeps. */
const NAME_MAX = 40;
/**
 * Jobs that run one after another: a job starts when the one before it has finished, whether that one worked or not.
 * The name field posts through one, so a slow early post cannot reach the desk after a later one and leave a prefix.
 */
function inOrder() {
  let tail: Promise<unknown> = Promise.resolve();
  return (job: () => Promise<unknown>): Promise<unknown> => {
    const run = tail.then(job);
    // the queue outlives a failed post: the next one still goes, in order; the caller holds `run` and says the failure
    tail = run.catch(() => { /* said by the caller, through run */ });
    return run;
  };
}
/** localStorage: the last QR code the desk refused (a refused code is no secret); the phone does not post it again. */
const REFUSED_QR = "desk.pin.refused";
/** What a fresh page load holds in the Essay and Say panels: a new learner in the seat starts from these. */
/** The Essay box starts empty: one empty paragraph (setEssay maps over it), never a sample a paste could fuse into. */
const FRESH_PARAS = [""];
const ESSAY_PLACEHOLDER = "Many students are tired. Sleep is important. Schools start early. This is bad.";
const FRESH_SENTENCE = "I have gone to school yesterday.";
export default function Phone() {
  const { s, connected, post, reconnect } = useSession();
  /** Linga's panel posts and moves on; only the join reads the answer. */
  const postOnly = useCallback(async (e: Event) => { await post(e); }, [post]);
  /** Every answer names the hand-off it answers (TL-11's routes refuse an answer with no matching ask); with none open it goes as it always did. */
  const askId = s?.ask?.phase === "open" ? s.ask.id : undefined;
  const call = useCallback((url: string, body: unknown) => rawCall(url, askId && body && typeof body === "object" ? { ...body, askId } : body), [askId]);
  /** The Parent role is gone from the page (TL-10): Recap and This week are read-only views under More. follow() still takes a role. */
  const [role] = useState<"student" | "parent">("student");
  /** A view opened from More that has no panel of its own: This week, and how the TV and phone work together. */
  const [view, setView] = useState<"week" | "how" | null>(null);
  /** The panel the phone was on when a view from More opened over it: Back returns there. */
  const beforeView = useRef<PScreen>("joined");
  const [more, setMore] = useState(false);
  const [screen, setScreen] = useState<PScreen>("join");
  /** The Paper panel's rows, kept here so a tab picked and left again does not lose what was typed. */
  const [paperRows, setPaperRows] = useState<DraftRow[]>(() => [blankRow()]);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  /** What the TV asked a photo of: the ask names it (the phone shows a line, not a picker); the old awaiting is the fallback for a TV that has not asked. */
  const subject: Subject = s?.ask?.kind === "page" && s.ask.detail?.subject ? s.ask.detail.subject : s?.awaiting && s.awaiting !== "essay" ? s.awaiting : "maths";
  const [q, setQ] = useState("");
  // the typed way of explaining has its own text: Point & ask keeps q
  const [typedExplain, setTypedExplain] = useState(""), [typing, setTyping] = useState(false);
  const [sentence, setSentence] = useState(FRESH_SENTENCE);
  /**
   * The Essay panel's text: a file or a message split into paragraphs (rules/essay paragraphsOf), and the one the
   * textarea shows. The desk reads ONE paragraph at a time; Next steps to the next. All of it lives in this page's
   * state: a picked file is read here in the browser and never uploaded, stored or kept, and it is gone when the
   * phone page closes. Only the current paragraph goes to the desk, when Analyse is pressed.
   */
  const [paras, setParas] = useState<string[]>(FRESH_PARAS);
  const [pix, setPix] = useState(0);
  /** The paragraphs the desk has already read, by index: after one, Next is the button to press. */
  const [readIx, setReadIx] = useState<number[]>([]);
  const [stranded, setStranded] = useState(0); // rewrites the desk took that this phone could not write into its text
  /** The panel's own lines: a problem (a file the desk will not take, a paragraph that is too long), and a plain word on how a text was split. */
  const [note, setNote] = useState("");
  const [info, setInfo] = useState("");
  const essay = paras[pix] ?? "";
  const setEssay = (f: (v: string) => string) => setParas((ps) => ps.map((p, i) => (i === pix ? f(p) : p)));
  /** The lens is the TV's: the phone reads it and sends it back, and offers no choice of its own. */
  const etype = s?.essayType ?? "structure";
  /**
   * A whole piece (v2 E1, P3): where the text came from, the shelf id once kept (a new version then goes to the same
   * piece), whether to keep it, the one-time notice's words while it is showing, and a tick that reloads the shelf.
   */
  const [source, setSource] = useState<"file" | "paste" | "message">("message");
  const [pieceId, setPieceId] = useState<string | undefined>(undefined);
  const [keep, setKeep] = useState(true);
  /** What the kept piece is; nothing is preselected, so a keep waits for a choice (recert-5/L1-helena-46-EM5-2). */
  const [pieceFormat, setPieceFormat] = useState("");
  /** An optional name for a new kept piece; empty keeps the desk's "Untitled" name (recert-6/L1-helena-46-EM5-6). */
  const [pieceTitle, setPieceTitle] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  /** Which read the one-time notice interrupted: the whole piece (kept on the shelf) or the single paragraph showing. */
  const [noticeFor, setNoticeFor] = useState<"piece" | "paragraph">("piece");
  useEffect(() => { if (notice === null) setNoticeFor("piece"); }, [notice]);
  const [shelfTick, setShelfTick] = useState(0);
  const [pname, setPname] = useState("");
  const [ring, setRing] = useState<{ x: number; y: number; ix: number } | null>(null);
  const [working, setBusy] = useState(false);
  // a dropped link also holds every Send: the post would go into a dead stream
  const busy = working || !connected;
  /** The profile name's posts, in the order typed (inOrder). */
  const [nameQueue] = useState(inOrder);
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<MediaStream | null>(null);
  /** The shot lives on the phone until the user says Use this page. Nothing is sent before that. */
  const [shot, setShot] = useState<{ url: string; w: number; h: number; sub: Subject; title: string } | null>(null);
  /** The hand-off, as the phone knows it: nothing sent, in flight, gone, or refused. */
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  /** The page came over http: the browser gives a phone no camera and no microphone there (D15). Said plainly on the panels that need them. */
  const [insecure, setInsecure] = useState(false);
  useEffect(() => { setInsecure(!window.isSecureContext); }, []);
  /** What the mic caught, held on the phone until the learner has read it back. Nothing is sent unseen. */
  const [heard, setHeard] = useState("");
  const [holding, setHolding] = useState(false);
  const [micOk, setMicOk] = useState(true);
  /** The desk's answer to "how did you get there", in text — the TV speaks its own line. */
  const [reply, setReply] = useState("");
  /** The ringed item's one typed second go (route /api/second): what is typed. The desk never says on the phone how it went. */
  const [again, setAgain] = useState("");
  /**
   * What the desk noticed tonight, read once on the way out: the lines written, whether the model was asked (an evening
   * with no work asks nothing; one written by an earlier ask is not asked again), or the desk's own sentence for a write that failed.
   */
  /** A failed run the learner has stepped past ("Snap a new page"): its Try again is not offered again. */
  const [passed, setPassed] = useState("");
  /**
   * How the worked set is handed in (Family W6): snap the sheet, or type the answers. Typed answers live in this page's
   * state, one box per question, and are sent only when the learner presses Send. A new set starts on the snap route with
   * empty boxes; the camera runs only on the snap route.
   */
  const [route, setRoute] = useState<"snap" | "type">("snap");
  const [typed, setTyped] = useState<string[]>([]);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const openSet = s?.practice && !s.practice.marked ? `${s.practice.topic}:${s.practice.items.map((i) => i.question).join("|")}` : "";
  useEffect(() => { setRoute("snap"); setTyped([]); }, [openSet]);

  // the QR on the TV carries the code: arrive with ?pin= and the phone gives it to the desk, which checks it, then tidies the bar
  useEffect(() => {
    if (!s || s.joined) return;
    const q = new URLSearchParams(location.search).get("pin");
    if (!q) return;
    history.replaceState(null, "", location.pathname);
    // a code the desk refused is not posted again: ten opens of a stale address would trip the desk-wide cooldown
    let refusedBefore = false;
    try { refusedBefore = localStorage.getItem(REFUSED_QR) === q; } catch { /* storage is blocked, so the code is posted */ }
    if (!refusedBefore) void join(q, "qr");
  }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the input mirrors the draft; a new draft (or none) resets what is typed here
  useEffect(() => { setPname(s?.draft?.name ?? ""); }, [s?.draft?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // camera on when a screen is asking for a photo: capture, or practice with a set still to mark
  // (a read that failed and can be asked again offers Try again on this panel, not a camera: the same test as `failed("read")` below)
  const readAgain = s?.jobs?.read?.phase === "failed" && !!s.jobs.read.input && s.jobs.read.retry !== false && s.jobs.read.id !== passed;
  const camWanted = (screen === "capture" && !readAgain) || (screen === "practice" && !!s?.practice && !s.practice.marked && route === "snap");
  useEffect(() => {
    if (!camWanted) { cam?.getTracks().forEach((t) => t.stop()); setCam(null); return; }
    // the grant can come after the panel let the camera go (a tab picked while the browser asked): that stream is
    // stopped at once, and the one in use is stopped when the page goes, so the camera is never left on unasked
    let live = true, got: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } }).then((st) => { if (!live) { st.getTracks().forEach((t) => t.stop()); return; } got = st; setCam(st); if (video.current) video.current.srcObject = st; }).catch(() => { if (live) setMsg(screen === "capture" ? "No camera here — use a sample page below." : "No camera here."); });
    return () => { live = false; got?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camWanted]);
  // the element arrives after the stream does; hand it the stream once it is on the page
  useEffect(() => { if (cam && video.current && video.current.srcObject !== cam) video.current.srcObject = cam; }, [cam, shot]);

  const [bad, setBad] = useState(false);
  const joining = useRef<Promise<void> | null>(null), [joinBusy, setJoinBusy] = useState(false);
  /**
   * The desk checks the code (api/session): a match sets this phone's cookie and the stream reopens as a joined
   * phone; a refusal says why (joinRefusal). Quiet for a code the phone brought (the QR): no shake for that, but the line
   * is shown. The phone keeps no code (the code on the TV turns over after each join), and a listed phone never needs it.
   */
  const join = async (code = pin, how: JoinHow = "typed"): Promise<void> => {
    // one join in flight: a second call (the tap while the four digits auto-join) gets the first one's promise, never a second post
    if (joining.current) return joining.current;
    setJoinBusy(true);
    return await (joining.current = (async () => {
      let r: Response | null = null;
      try { r = await post({ type: "join", code }); } catch { /* r stays null, and joinRefusal says "That did not reach the desk." */ }
      if (r?.ok) { setMsg(""); reconnect(); return; }
      const j = r ? await r.json().catch(() => ({} as { error?: string })) as { error?: string } : {};
      const refusal = joinRefusal({ status: r?.status, error: j.error, how });
      setMsg(refusal.line);
      if (refusal.forget) { try { localStorage.setItem(REFUSED_QR, code); } catch { /* storage is blocked, so the code may be posted again */ } }
      if (refusal.shake) { setBad(true); setTimeout(() => setBad(false), 500); }
    })().finally(() => { joining.current = null; setJoinBusy(false); }));
  };
  // four digits join by themselves; Join stays as the fallback tap
  const onPin = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); setPin(d); if (d.length === 4 && s && !s.joined) join(d); };
  // a code an earlier version stored is cleared on open; the phone keeps none now, and a join never reads one
  useEffect(() => { try { localStorage.removeItem("desk.pin"); } catch { /* storage is blocked, so there is no stored code to clear */ } }, []);
  // the desk forgets this phone: its fingerprint is dropped there and its cookie goes here, and the stream reopens as a guest
  // it says forgotten only once the desk has answered that it is; a refusal or no answer leaves the phone paired
  const forget = async () => {
    let r: Response | null = null;
    try { r = await post({ type: "leave" }); } catch { /* r stays null, and leaveOutcome says "That did not reach the desk." */ }
    const j = r && !r.ok ? await r.json().catch(() => ({} as { error?: string })) as { error?: string } : {};
    const out = leaveOutcome({ status: r?.status, error: j.error });
    setMsg(out.line);
    if (out.forgotten) reconnect();
  };

  // the phone stays where it is: the hand-off is shown, not jumped over
  const send = async (dataUrl: string, w: number, h: number, sub: Subject, title: string) => {
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/read", { image: dataUrl, subject: sub, title, w, h }); const j = await r.json();
      if (moved()) return;
      // a run that failed is on the desk with its sentence and a Try again (its body says failure); only a refusal needs the line here
      if (r.ok) { setPhase("sent"); setMsg(""); } else { setPhase("failed"); setMsg(deskLine(j, `The desk could not read it (${r.status}).`)); }
    } catch (e) { if (!moved()) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } } finally { setBusy(false); }
  };
  const toJpeg = (src: HTMLVideoElement | HTMLImageElement, sw: number, sh: number) => {
    const w = 1280, h = Math.round((sh / sw) * 1280); const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(src, 0, 0, w, h); return { url: c.toDataURL("image/jpeg", 0.85), w, h };
  };
  /** How many pages of this module were snapped tonight — a sheet has more than one side. */
  const pagesOf = (sub: Subject) => { const today = dayOf(Date.now()); return s?.pages.filter((p) => p.subject === sub && p.day === today).length ?? 0; };
  const titleFor = (sub: Subject, base: string) => { const n = pagesOf(sub); return n >= 1 ? `${base} · page ${n + 1}` : base; };
  // a snap is a shot, not a send
  const snap = () => { const v = video.current; if (!v || !v.videoWidth) return setMsg("camera not ready"); const { url, w, h } = toJpeg(v, v.videoWidth, v.videoHeight);
    setMsg(""); setPhase("idle"); setShot({ url, w, h, sub: subject, title: titleFor(subject, SAMPLES.find((x) => x.id === subject)?.title ?? "Page") }); };
  const sample = (x: (typeof SAMPLES)[number]) => { const img = new Image(); img.onload = () => { const { url, w, h } = toJpeg(img, img.naturalWidth, img.naturalHeight);
    setMsg(""); setPhase("idle"); setShot({ url, w, h, sub: x.id, title: titleFor(x.id, x.title) }); }; img.src = x.file; };
  const retake = () => { setShot(null); setPhase("idle"); setMsg(""); };

  const page = s?.pages[s.pageIx];
  // the TV is on one sentence of the paragraph: the Essay tab offers that sentence, the learner's own words, to rewrite
  const onSentence = s?.screen === "forensic" && s.essay?.sentences.length ? s.essay.sentences[forensicAt(s)] : null;
  const [rewrite, setRewrite] = useState("");
  /** The TV holds a reading of the whole piece: a paragraph it already read must not be read alone over it (essay.set would replace the piece). */
  const pieceHeld = !!s?.essay?.piece && paras.length > 1;
  const pieceCovers = (ix: number) => pieceHeld && (s?.essay?.piece?.read ?? []).includes(ix);
  // E2-b: while the piece is still being read a sentence cannot be rewritten
  const rewriting = pieceBeingRead(s?.essay?.piece);
  // the TV is on the plan: the Essay tab writes the slot its caret is on, one sentence, in the learner's own words
  const onPlan = s?.screen === "essayplan" && s.essayPlan ? { i: planAt(s), plan: s.essayPlan, slots: planSlots(PLAYBOOK.find((p) => p.id === "para") ?? PLAYBOOK[0]) } : null;
  const [slotText, setSlotText] = useState("");
  useEffect(() => { if (onPlan) setSlotText(onPlan.plan.slots[onPlan.i] ?? ""); }, [onPlan?.i, onPlan?.plan.slots[onPlan?.i ?? 0]]); // eslint-disable-line react-hooks/exhaustive-deps
  const sendSlot = async () => { if (!onPlan) return; const r = planFill(onPlan.plan, onPlan.i, slotText); if (!r.ok) { setMsg(r.error); return; }
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setBusy(true); setMsg("sending…");
    try { const res = await post({ type: "essay.slot", i: onPlan.i, text: slotText }); if (moved()) return; setMsg(res.ok ? "on the TV" : "That did not reach the desk."); } catch { if (!moved()) setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  useEffect(() => { if (onSentence) setRewrite(onSentence.text); }, [onSentence?.n, onSentence?.text]); // eslint-disable-line react-hooks/exhaustive-deps
  const sendRewrite = async () => { if (!onSentence) return; const who = seat.current.id, moved = () => seat.current.id !== who; setBusy(true); setMsg("the desk is reading it…");
    try { const r = await call("/api/analyse", { kind: "rewrite", n: onSentence.n, text: rewrite }); const j = await r.json().catch(() => ({} as { error?: string }));
      if (moved()) return;
      if (r.ok) { const back = writeRewriteBack(paras, onSentence.text, rewrite); if (back.written) setParas(back.paras); else setStranded((k) => k + 1); setMsg(back.line ? `on the TV. ${back.line}` : "on the TV"); }
      else setMsg((j as { error?: string }).error ?? "failed"); } catch { if (!moved()) setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  /** Load a text as a list of paragraphs, the first one showing. */
  const loadParagraphs = (ps: string[], said: string) => { setParas(ps); setStranded(0); setPix(0); setReadIx([]); setNote(""); setInfo(said); setMsg(""); };
  const goPara = (i: number) => { if (i >= 0 && i < paras.length) { setPix(i); setNote(""); setInfo(""); setMsg(""); } };
  /** A file the learner picked: checked, read here in the browser (no upload), split on blank lines. */
  const pickFile = async (f: File | undefined) => {
    if (!f) return;
    setNote(""); setInfo("");
    const before = essayFileProblem(f);
    if (before) return setNote(before);
    let text = "";
    try { text = await f.text(); } catch { return setNote("The desk could not read that file. Try another one."); }
    const after = essayFileProblem(f, text);
    if (after) return setNote(after);
    const ps = paragraphsOf(text);
    if (!ps.length) return setNote("That file is empty. Pick one with some writing in it.");
    setSource("file"); setPieceId(undefined); setPieceTitle(f.name.replace(/\.[^./\\]*$/, "").trim().slice(0, 80)); // the file name, without its extension, names the piece unless the learner types another
    loadParagraphs(ps, ps.length > 1 ? `${f.name}: ${ps.length} paragraphs. Read the whole piece, or one paragraph at a time.` : "");
  };
  /** A pasted message with blank lines is split the same way; a paste without any goes in as it always did. */
  const onEssayPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget, pasted = e.clipboardData.getData("text");
    const ps = paragraphsOf(t.value.slice(0, t.selectionStart) + pasted + t.value.slice(t.selectionEnd));
    if (ps.length < 2) return;
    e.preventDefault(); setSource("paste"); setPieceId(undefined); setPieceTitle(""); loadParagraphs(ps, `That is ${ps.length} paragraphs. Read the whole piece, or one paragraph at a time.`);
  };
  /** The whole piece to the TV (v2 E1): kept on the shelf first when asked; a 428 means the one-time notice is due. */
  const readPiece = async (keepIt = keep) => {
    const whole = paras.join("\n\n"), problem = pieceProblem(whole);
    if (problem) return setNote(problem);
    if (keepIt && !pieceId && !pieceFormat) return setNote("Choose message, email or essay before you keep it.");
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setNote(""); setInfo(""); setBusy(true); setMsg(stranded ? `${rewriteStaysLine(stranded)} The desk is reading your piece…` : "the desk is reading your piece…");
    try {
      const r = await call("/api/analyse", { kind: "piece", text: whole, type: etype, keep: keepIt, pieceId, source, ...(pieceFormat ? { format: pieceFormat } : {}), ...(keepIt && !pieceId && pieceTitle.trim() ? { title: pieceTitle.trim() } : {}) });
      const j = await r.json().catch(() => ({} as { error?: string; notice?: boolean; piece?: { pieceId?: string } }));
      if (moved()) return;
      if (r.status === 428 && (j as { notice?: boolean }).notice) { setMsg(""); setNotice((j as { error?: string }).error ?? ""); return; }
      // E3, E4: only the paragraphs the desk ruled are marked read; each one it did not rule is named with its line
      const back = (j as { piece?: { read?: number[]; failed: number[]; notEnglish?: number[]; paragraphs: number } }).piece;
      if (r.ok) { setMsg("on the TV"); setStranded(0); setReadIx(back?.read ?? paras.map((_, i) => i)); setInfo([...(back?.failed ?? []).map((k) => [k, `Paragraph ${k + 1} did not come back. Send it again from the phone.`] as const), ...(back?.notEnglish ?? []).map((k) => [k, `Paragraph ${k + 1} is not in English, so the desk did not read it.`] as const)].sort((x, y) => x[0] - y[0]).map((x) => x[1]).join(" ")); const id = (j as { piece?: { pieceId?: string } }).piece?.pieceId; if (id) setPieceId(id); setShelfTick((t) => t + 1); }
      else { setMsg(""); setNote((j as { error?: string }).error ?? "The desk could not read that piece. Try again."); }
    } catch { if (!moved()) { setMsg(""); setNote("That did not reach the desk."); } } finally { setBusy(false); }
  };
  const acceptNotice = async () => {
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setNotice(null);
    // after a switch, readPiece here is the last learner's render: it would post their paragraphs
    try { const r = await call("/api/texts", { notice: true }); if (moved()) return; if (r.ok) return void readPiece(true); } catch { /* said on the next line */ }
    if (!moved()) setNote("That did not reach the desk.");
  };
  const openKept = (id: string, text: string) => { const ps = paragraphsOf(text); setPieceId(id); setSource("message"); loadParagraphs(ps.length ? ps : [text], `Opened from your shelf: ${ps.length} paragraph${ps.length === 1 ? "" : "s"}. Change it, then read it again as a new version.`); };
  /** Analyse the paragraph showing. Blank lines typed into it split it first; the desk still reads only the first part. */
  const analyseParagraph = async () => {
    const ps = paragraphsOf(essay); if (!ps.length) return;
    const one = ps[0], tooLong = essayTooLong(one);
    if (tooLong) return setNote(tooLong);
    if (ps.length > 1) { setParas((all) => [...all.slice(0, pix), ...ps, ...all.slice(pix + 1)]); setReadIx([]); }
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setNote(""); setInfo(""); setBusy(true); setMsg("the desk is reading it…");
    try {
      const r = await call("/api/analyse", { kind: "essay", text: one, type: etype });
      if (moved()) return;
      if (r.ok) { setMsg("on the TV"); setReadIx((x) => [...x, pix]); }
      else {
        const j = await r.json().catch(() => ({} as { error?: string; notice?: boolean })); if (moved()) return; setMsg("");
        // UD-7: the first paragraph read asks the same one-time notice as the piece path; accepting it reads this paragraph
        if (r.status === 428 && (j as { notice?: boolean }).notice) { setNoticeFor("paragraph"); setNotice((j as { error?: string }).error ?? ""); return; }
        setNote((j as { error?: string }).error ?? "The desk could not read that one. Try again.");
      }
    } catch { if (!moved()) { setMsg(""); setNote("That did not reach the desk."); } } finally { setBusy(false); }
  };
  /** The notice that interrupted a single paragraph: accepting it records the notice, then reads the paragraph again. */
  const acceptParagraphNotice = async () => {
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setNotice(null);
    try { const r = await call("/api/texts", { notice: true }); if (moved()) return; if (r.ok) return void analyseParagraph(); } catch { /* said on the next line */ }
    if (!moved()) setNote("That did not reach the desk.");
  };
  /** From the sentence rewrite panel, on to the next paragraph: the phone's own paragraph; the TV stays where it is. */
  const nextFromRewrite = () => {
    // the phone moves to its next paragraph and posts nothing: the TV is not moved from here (TL-11)
    goPara(pix + 1);
  };
  /** E4-a: a piece that is done with a paragraph that did not come back offers to read just those again (the desk checks it in code). */
  const pieceAgain = async () => { const who = seat.current.id, moved = () => seat.current.id !== who; setBusy(true); setMsg("the desk is reading them again…");
    try { const r = await call("/api/analyse", { kind: "piece-again" }); const j = await r.json().catch(() => ({} as { error?: string }));
      if (moved()) return;
      setMsg(r.ok ? "on the TV" : (j as { error?: string }).error ?? "The desk could not read them again. Try again."); } catch { if (!moved()) setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  const againBtn = pieceAgainOffered(s?.essay) && <button className="pbtn" data-secondary="true" data-role="essay-piece-again" disabled={busy} onClick={() => void pieceAgain()}>Read the paragraphs that did not come back</button>;
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!page) return; const r = e.currentTarget.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * page.h;
    const best = nearestItem(page.items, y);
    // the tap picks the item for the next hint only (it travels in the hint request); the TV is not moved (TL-11)
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top, ix: best });
  };
  const ask = async () => { if (!page) return; const who = seat.current.id, moved = () => seat.current.id !== who; setBusy(true); setMsg("");
    try { const r = await call("/api/hint", { askedQ: q, itemIx: ring?.ix ?? s?.itemIx }); if (moved()) return; setQ("");
      if (!r.ok) { const j = await r.json().catch(() => null); if (moved()) return; setMsg(deskLine(j, `The desk could not ask (${r.status}).`)); } }
    catch (e) { if (!moved()) setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); } };
  /** The Say panel's button: the sentence to the TV. */
  const checkSentence = async () => { const who = seat.current.id, moved = () => seat.current.id !== who; setBusy(true); setMsg("sending…");
    try { const r = await call("/api/analyse", { kind: "english", sentence }); if (moved()) return;
      if (r.ok) { setMsg("on the TV"); return; }
      const j = await r.json().catch(() => ({} as { error?: string })); if (moved()) return;
      setMsg((j as { error?: string }).error ?? `The desk could not check that sentence (${r.status}).`); }
    catch { if (!moved()) setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  /** The desk's failed run of this kind that can be asked again in place: it holds what it was asked with. */
  // a failure asking again cannot change (job.retry false: failure.ts) is not offered again; the panel goes back to its own step
  const failed = (kind: JobKind) => { const j = s?.jobs?.[kind]; return j?.phase === "failed" && j.input && j.retry !== false && j.id !== passed ? j : null; };
  /** A hint that failed for the item the TV is on. */
  const hintAgain = (() => { const h = failed("hint"); return h && page && h.key === page.items[s?.itemIx ?? 0]?.key ? h : null; })();
  /** One press: the desk asks again with what it holds — the same page, the same item and question, the same topic. */
  const retry = async (kind: JobKind) => {
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setBusy(true); setMsg(""); if (kind === "read") setPhase("sending");
    try {
      const r = await call("/api/session/retry", { kind }); const j = await r.json().catch(() => null);
      if (moved()) return;
      if (kind === "read") setPhase(r.ok ? "sent" : "failed");
      if (!r.ok) setMsg(deskLine(j, `The desk could not try again (${r.status}).`));
    } catch (e) { if (!moved()) { if (kind === "read") setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } } finally { setBusy(false); }
  };
  /** A Mic press is listening: the phone does not move away from the field it is filling. */
  const hearing = useRef(false);
  const listen = (into: (t: string) => void, tab = "") => {
    // Web Speech is not in TypeScript's DOM lib; the shape we use is small enough to declare here.
    type Rec = { lang: string; onresult: (ev: { results: Array<Array<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setMsg("No speech recognition in this browser — type instead."); return null; }
    const r = new SR(); r.lang = recogniserLangFor(tab, s); r.onresult = (ev) => into(ev.results[0][0].transcript); r.onerror = () => { hearing.current = false; setMsg("did not catch that"); }; r.onend = () => { hearing.current = false; };
    r.start(); hearing.current = true; setMsg("listening…");
    return r; // the caller may hold the button and stop it on release
  };
  // is there a mic path at all on this device? asked once, so the fallback is offered before a failed press
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }; setMicOk(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)); }, []);

  // ---- the practice loop: the worked sheet goes to be marked, the mouth explains one slip ----
  /** The whole worked set, one photo. Same shot/review machinery as capture; a different door. */
  const sendWorking = async () => {
    if (!shot) return;
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/mark", { image: shot.url, w: shot.w, h: shot.h });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (moved()) return;
      if (r.ok) setPhase("sent");
      else { setPhase("failed"); setMsg(r.status === 404 ? "The desk cannot mark yet — that part is still being built." : (j.error ?? `The desk could not mark it (${r.status}).`)); }
    } catch (e) { if (!moved()) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } } finally { setBusy(false); }
  };
  /**
   * The typed answers, one string per question in order (a blank for one left). Code marks them at once on the desk; the
   * phone then follows the TV to the sheet exactly as after a photo (the panel is the same one, now showing the count).
   * The focused box is let go first: a phone with typing hands is never moved (panelFor follow), and this one is done.
   */
  const sendTyped = async () => {
    const n = s?.practice?.items.length ?? 0;
    if (!n || busy) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const who = seat.current.id, moved = () => seat.current.id !== who;
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/mark", { answers: Array.from({ length: n }, (_, i) => typed[i] ?? "") });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (moved()) return;
      if (r.ok) setPhase("sent");
      else { setPhase("failed"); setMsg(j.error ?? `The desk could not mark it (${r.status}).`); }
    } catch (e) { if (!moved()) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } } finally { setBusy(false); }
  };
  // the set came back marked: the sheet has done its job, so the review clears itself
  useEffect(() => { if (screen === "practice" && s?.practice?.marked) { setShot(null); setPhase("idle"); } }, [s?.practice?.marked]); // eslint-disable-line react-hooks/exhaustive-deps
  // a new item on the walk is a new question: last time's transcript and answer do not belong to it
  useEffect(() => { setHeard(""); setReply(""); setAgain(""); setTypedExplain(""); setTyping(false); }, [s?.walkIx]);
  // and a different learner in the seat does not inherit the last one's typed words
  useEffect(() => { setHeard(""); setReply(""); setAgain(""); setTypedExplain(""); setTyping(false); }, [s?.learner?.id]);

  // P17 (i) begin: a different learner seated clears what the last learner worked on, on the phone
  const lastSeated = useRef<string | undefined>(undefined);
  const clearLastLearnersWork = () => {
    setParas(FRESH_PARAS); setPix(0); setReadIx([]); setNote(""); setInfo(""); setSource("message"); setPieceId(undefined); setNotice(null);
    setShot(null); setPhase("idle"); setQ(""); setMsg(""); setPaperRows([blankRow()]); setTyped([]); setSentence(FRESH_SENTENCE); setKeep(true); setRing(null);
  };
  // the first seating after load, and the same learner sitting again after an empty seat, clear nothing
  useEffect(() => {
    const id = s?.learner?.id;
    if (!id) return;
    if (lastSeated.current && lastSeated.current !== id) clearLastLearnersWork();
    lastSeated.current = id;
  }, [s?.learner?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // P17 (i) end

  // the Paper draft survives a reload or a discarded tab: kept in this browser per seated learner, restored when one is seated.
  // Every storage call is guarded, so blocked storage falls back to the blank row silently.
  const keepDraft = (learnerId: string | undefined, rows: DraftRow[]) => {
    const key = draftKey(learnerId);
    if (!key) return;
    try {
      const text = serialiseDraft(rows);
      if (text) localStorage.setItem(key, text); else localStorage.removeItem(key);
    } catch { /* storage is blocked or full, so the draft lives in memory only */ }
  };
  const editPaperRows = (rows: DraftRow[]) => { setPaperRows(rows); keepDraft(s?.learner?.id, rows); };
  useEffect(() => {
    const key = draftKey(s?.learner?.id);
    if (!key) return;
    let rows: DraftRow[] | null = null;
    try { rows = parseDraft(localStorage.getItem(key)); } catch { /* storage is blocked, so the draft starts blank */ }
    if (rows) setPaperRows(rows);
  }, [s?.learner?.id]);

  const rec = useRef<{ stop: () => void } | null>(null);
  const holdStart = () => { setReply(""); setHeard(""); const r = listen((t) => { setHeard(t); setMsg(""); }); if (r) { rec.current = r; setHolding(true); } else setMicOk(false); };
  const holdEnd = () => { if (!holding) return; rec.current?.stop(); rec.current = null; setHolding(false); setMsg(""); };
  // who is seated and which walk item is open now, read after an await (the closure's `s` is the one from send time)
  const seat = useRef({ id: s?.learner?.id, ix: s?.walkIx }); seat.current = { id: s?.learner?.id, ix: s?.walkIx };
  const explain = async (transcript: string) => {
    const t = transcript.trim(); if (!t) return;
    const at = { id: s?.learner?.id, ix: s?.walkIx };
    // a reply that returns after the learner or the walk item changed belongs to neither: it is dropped (busy still clears)
    const moved = () => seat.current.id !== at.id || seat.current.ix !== at.ix;
    setBusy(true); setMsg("");
    try {
      const r = await call("/api/explain", { transcript: t, n: at.ix });
      const j = await r.json().catch(() => ({} as { reply?: string; error?: string }));
      if (moved()) return;
      if (r.ok) { setReply(j.reply ?? "The desk heard you."); setHeard(""); setTypedExplain(""); setTyping(false); }
      else setMsg(r.status === 404 ? "The desk cannot listen back yet — that part is still being built." : (j.error ?? `The desk could not use that (${r.status}).`));
    } catch (e) { if (!moved()) setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** One typed second go on the ringed item in hand: the TV draws what it came to; a refusal is the desk's own sentence. */
  const sendSecond = async () => {
    const it = s?.practice?.items[s.walkIx], a = again.trim(); if (!it || !a || busy) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const at = { id: s?.learner?.id, ix: s?.walkIx };
    // a reply that returns after the learner or the walk item changed belongs to neither: it is dropped (busy still clears)
    const moved = () => seat.current.id !== at.id || seat.current.ix !== at.ix;
    setBusy(true); setMsg("");
    try {
      const r = await call("/api/second", { n: it.n, answer: a });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (moved()) return;
      if (r.ok) setAgain(""); else setMsg(j.error ?? `The desk could not take that (${r.status}).`);
    } catch (e) { if (!moved()) setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };

  // The phone follows the TV (panelFor.ts): when the TV's screen changes into a hand-off, the phone moves once to
  // the panel that does it. A same-screen update moves nothing, so a tab the learner picked stays picked; busy hands
  // (typing, a shot held unsent, a recording) are never interrupted; a fresh join lands on the confirmation.
  const seen = useRef<string | null | undefined>(undefined);
  /** The panel a Parent phone is told the TV is asking for; it is not moved there. */
  const [banner, setBanner] = useState<PScreen | null>(null);
  /** Typing hands change with the focus, not with the session: the deferred move runs as soon as they are free. */
  const [typingNow, setTypingNow] = useState(false);
  useEffect(() => {
    const look = () => { const el = document.activeElement; setTypingNow(el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit"].includes(el.type)) || (el instanceof HTMLElement && el.isContentEditable)); };
    document.addEventListener("focusin", look); document.addEventListener("focusout", look);
    return () => { document.removeEventListener("focusin", look); document.removeEventListener("focusout", look); };
  }, []);
  useEffect(() => {
    if (!s) return;
    const typing = typingNow;
    const held = (screen === "capture" || screen === "practice") && !!shot && phase !== "sent";
    const busyHands = typing || held || holding || hearing.current || !!s.conversation?.capture;
    const step = follow(seen.current, s, { panel: screen, role, busy: busyHands });
    seen.current = step.key;
    setBanner(step.banner);
    if (step.to) setScreen(step.to);
  }, [s, role, screen, typingNow, shot, phase, holding]); // eslint-disable-line react-hooks/exhaustive-deps
  // a stream that dropped and came back goes to the open ask, whatever was seen before (D5)
  useEffect(() => { if (!connected) seen.current = undefined; }, [connected]);

  // The nav waits for a joined phone — except Profile, which a first arrival needs before joining.
  const nav = (n: PScreen) => { if (!s?.joined && n !== "profile") return; setScreen(n); };

  // ---- the shell (TL-10): a strip, one body, a bar of at most three items ----
  const handoff = s?.ask ?? null;
  const asking = !!s?.joined && !!handoff;
  /** Joined, nothing asked: the idle card, or a view the learner opened from More. */
  /** A view opened from More: Recap and Tonight's list are the panels of those names, This week and How are `view`. It covers the body, whatever the TV asks. */
  const peek: "parent" | "tonight" | "week" | "how" | null = !s?.joined ? null : view ?? (["parent", "tonight"].includes(screen) ? (screen as "parent" | "tonight") : null);
  const peeking = !!peek;
  const idle = !!s?.joined && !handoff && !peek;
  /** The panels the phone follows to: the join and name panels before a join, the open hand-off's panel after. */
  const showPanels = (!s?.joined || asking) && !peek;
  // a hand-off opening closes any view opened from More, and a phone that stops being joined drops it
  useEffect(() => {
    if (!handoff && s?.joined) return;
    setView(null); setMore(false);
    setScreen((now) => (now === "parent" || now === "tonight" ? beforeView.current : now));
  }, [handoff?.id, s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // More is a sheet over the page: the system back gesture closes it
  useEffect(() => {
    const back = () => setMore(false);
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const openMore = () => { history.pushState({ pmore: 1 }, ""); setMore(true); };
  const closeMore = () => { if (history.state?.pmore) history.back(); else setMore(false); };
  const pickMore = (id: MoreId) => {
    closeMore();
    if (id === "forget") { void forget(); return; }
    if (id === "recap") openPanel("parent");
    else if (id === "tonight") openPanel("tonight");
    else openView(id);
  };
  const openPanel = (to: "parent" | "tonight") => { if (!peek) beforeView.current = screen; setView(null); setScreen(to); };
  const openView = (to: "week" | "how") => { if (!peek) beforeView.current = screen; setView(to); };
  const closeView = () => { setView(null); setScreen((now) => (now === "parent" || now === "tonight" ? beforeView.current : now)); };
  /** The primary button of an open hand-off: the panel's own submit, and whether there is anything to press yet. */
  const primary = ((): { run: () => void; off: boolean; ctx: { snap?: boolean; holding?: boolean; paragraphs?: number } } => {
    const none = { run: () => {}, off: true, ctx: {} };
    if (!handoff) return none;
    const snapping = !shot;
    // Done only closes the phone's end of the hand-off; Save and Back stay on the TV (TL-8)
    const done = () => void nameQueue(() => post({ type: "ask.cancel", id: handoff.id })).catch(() => setMsg("That did not reach the desk."));
    switch (handoff.kind) {
      case "name": case "prefs": return { run: done, off: !pname.trim() || !s?.draft, ctx: {} };
      case "page": return { run: snapping ? snap : () => send(shot!.url, shot!.w, shot!.h, shot!.sub, shot!.title), off: snapping ? !cam || busy : busy, ctx: { snap: snapping } };
      case "sheet": {
        if (route === "type") return { run: sendTyped, off: busy || !typed.some((x) => x.trim()), ctx: {} };
        return { run: snapping ? snap : sendWorking, off: snapping ? !cam || busy : busy, ctx: { snap: snapping } };
      }
      case "answers": return { run: sendTyped, off: busy || !typed.some((x) => x.trim()), ctx: {} };
      case "question": return { run: ask, off: busy || !!s?.reading || !page, ctx: {} };
      case "explain": {
        const text = typing ? typedExplain : heard;
        return { run: () => void explain(text), off: holding || busy || !text.trim(), ctx: { holding } };
      }
      case "second": return { run: sendSecond, off: busy || !again.trim(), ctx: {} };
      case "paragraph": return { run: paras.length > 1 ? () => void readPiece() : analyseParagraph, off: busy || notice !== null || (paras.length === 1 && !essay.trim()), ctx: { paragraphs: paras.length } };
      case "rewrite": return { run: sendRewrite, off: busy || rewriting || !onSentence, ctx: {} };
      case "slot": return { run: sendSlot, off: busy || !onPlan || !slotText.trim(), ctx: {} };
      case "sentence": return { run: checkSentence, off: busy, ctx: {} };
      case "private": return { run: () => void post({ type: "ask.cancel", id: handoff.id }), off: false, ctx: {} };
      // paper, reply and words are submitted inside their own panels (PaperPanel, LingaPhone): the bar has no hook into them yet (TL-9)
      default: return none;
    }
  })();
  const items = barItems({ joined: !!s?.joined, ask: handoff ? { kind: handoff.kind, phase: handoff.phase } : null, primary: primary.ctx, primaryOff: primary.off });
  const press = (id: (typeof items)[number]["id"]) => {
    if (id === "more") openMore();
    else if (id === "recap") openPanel("parent");
    else if (id === "cancel" && handoff) void post({ type: "ask.cancel", id: handoff.id });
    else if (id === "primary") primary.run();
  };
  return (
    <div className="phone">
      <div className="ptop">
        <span className="dot" data-live={connected ? "true" : "false"} aria-hidden="true" />
        <div className="link">{!connected ? "Lost the desk link. Reconnecting…" : s?.joined ? <>{s.learner ? s.learner.name : "Joined"}{s && <> · TV: {TV_WORDS[s.screen] ?? s.screen}</>}</> : <>Not joined{s && <> · TV: {TV_WORDS[s.screen] ?? s.screen}</>}</>}</div>
      </div>
      <div className="pbody">
        {banner && <button className="pbtn" data-secondary="true" data-role="phone-banner" onClick={() => setScreen(banner)}>{BANNER[banner]}</button>}
        {showPanels && <>
        {screen === "linga" && s && <LingaPhone key={`${s.learner?.id ?? ""}:${s.ask?.id ?? ""}`} s={s} ask={s.ask} post={postOnly}/>}
        {!s?.joined && screen === "join" && <div className="pscreen"><h3>Join the desk</h3>
          <p>{!s ? "Looking for the TV…" : s.screen === "pair" ? "The TV is showing the code. Type it here." : `The TV is on ${TV_WORDS[s.screen] ?? s.screen}. Ask it for the code, then type it here.`}</p>
          {s && s.screen !== "pair" && <button className="pbtn" data-secondary="true" onClick={() => post({ type: "nav", screen: "pair", from: s.screen })}>Show the code on the TV</button>}
          <div className="field" data-bad={bad}><input inputMode="numeric" placeholder="4-digit code" value={pin} disabled={joinBusy} onChange={(e) => onPin(e.target.value)} /><button className="pbtn" data-signal="true" disabled={joinBusy} onClick={() => join()}>Join</button></div>
          <p style={{ fontSize: 12 }}>The TV serves this page itself; nothing to install. The code works once: it changes when a phone joins with it.</p>
          <button className="pbtn" data-secondary="true" onClick={() => nav("profile")}>Naming a new learner? Open Profile.</button></div>}

        </>}

        {/* joined with nothing asked: one card and no buttons. The More sheet sits here with it (Forget this desk is one of its rows). */}
        {idle && <div className="pscreen" data-role="phone-idle" data-screen={screen === "joined" ? "joined" : "idle"}><h3>On the desk</h3>
          <p>Look at the TV. It will ask this phone when it needs a photo, your words or your voice.</p></div>}
        {view === "how" && peeking && <div className="pscreen" data-role="phone-how"><h3>The TV and this phone</h3>
          <p>The TV leads. You choose what to do with its remote, and the TV asks this phone only when it needs a photo, your words or your voice.</p>
          <p>When it asks, the phone shows just that and nothing else. Press Cancel to say no, or the button on the right to send.</p>
          <p>Recap, This week and Tonight's list are here under More whenever you want to read them.</p>
          {s?.learner && <p style={{ fontSize: 12 }}>Not {s.learner.name}? On the TV's desk, press Down to Someone else and Select to switch who is at the desk.{switchEndsLine(s, null) && ` ${switchEndsLine(s, null)}`}</p>}
          <button className="plink" onClick={closeView}>Back</button></div>}
        {more && <div className="pmore" role="presentation" onClick={closeMore}>
          <div className="pmore-sheet" role="dialog" aria-label="More" onClick={(e) => e.stopPropagation()}>
            {moreRows(s?.viewer === "phone").map((r) => r.id === "forget"
              ? s?.viewer === "phone" && <button key={r.id} className="pmore-row" data-row="forget" onClick={() => pickMore("forget")}>Forget this desk</button>
              : <button key={r.id} className="pmore-row" data-row={r.id} onClick={() => pickMore(r.id)}>{r.label}</button>)}
          </div></div>}
        {showPanels && <>
        {screen === "profile" && <div className="pscreen"><h3>Profile</h3>
          <p>At the desk now: <b>{s?.learner?.name ?? "no one yet"}</b></p>
          {s && (s.draft || s.screen === "profile") ? <>
            <p>The TV takes the picks; type the name here, then press Save on the TV.</p>
            <div className="field"><input placeholder="Name" maxLength={NAME_MAX} value={pname} onChange={(e) => { setPname(e.target.value); nameQueue(() => post({ type: "profile.draft", patch: { name: e.target.value } })).catch(() => { /* a lost keystroke: the next one sends the whole name again */ }); }} /></div>
            <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={!pname.trim()} onClick={() => (s.ask?.kind === "name" ? nameQueue(() => post({ type: "ask.cancel", id: s.ask!.id })).catch(() => setMsg("That did not reach the desk.")) : setScreen("joined"))}>Done</button></div>
            <p style={{ fontSize: 12 }}>Save and Back are on the TV.</p>
          </> : <p>Add or edit a learner on the TV; the name is typed here.</p>}</div>}

        {screen === "paper" && <PaperPanel rows={paperRows} setRows={editPaperRows} post={post} seated={!!s?.learner} status={s?.status ?? ""} kept={!!s?.paper} name={s?.learner?.name} system={s?.learner ? s.profiles?.find((p) => p.id === s.learner?.id)?.system : undefined} askId={s?.ask?.kind === "paper" ? askId : undefined} />}

        {screen === "capture" && (() => {
          const reading = phase === "sending" || (phase === "sent" && !!s?.reading);
          const done = phase === "sent" && !reading;
          const read = page?.items.length ?? 0;
          const n = pagesOf(subject);
          // a read that failed: the page is already on the desk, so it is read again there, not sent twice
          const again = !reading ? failed("read") : null;
          return <div className="pscreen"><h3>Capture a page</h3>
            <p data-role="capture-subject">The TV is waiting for a page of <b>{MODULE[subject]}</b>.</p>
            {insecure && <p data-role="http-limit" role="note">{HTTP_LIMIT.camera}</p>}
            {phase === "idle" && !shot && n >= 1 && <p>Page {n + 1} of the {MODULE[subject]} sheet</p>}
            <div className="cam">
              {cam ? <video ref={video} autoPlay playsInline muted /> : !shot && <span>camera</span>}
              {shot && <img src={shot.url} alt="the page you just snapped" />}
              {cam && !shot && <div className="guide"><i /><i /><i /><i /></div>}
            </div>
            {!shot && <p>Fill the frame with the sheet, all four corners inside.</p>}

            {phase === "sending" && <p>Sent. The TV is reading it…</p>}
            {(phase === "sending" || phase === "sent") && <p>{reading ? "Reading the page…" : read ? `Read: ${read} problems` : s?.status || "Read."}</p>}

            {reading ? <button className="pbtn" disabled>Reading…</button>
              : again && (phase === "failed" || !shot) ? <>
                  <p>{again.error}</p>
                  <div className="field">
                    <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => retry("read")} disabled={busy}>Try again</button>
                    <button className="pbtn" data-secondary="true" onClick={() => { setPassed(again.id); retake(); }}>Snap a new page</button>
                  </div>
                </>
              : done ? <div className="field">
                  <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => { setShot(null); setPhase("idle"); setMsg(""); }}>Add another page</button>
                  <button className="pbtn" data-secondary="true" onClick={() => setScreen("point")}>Point &amp; ask</button>
                </div>
              : shot ? <div className="field">
                  <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => send(shot.url, shot.w, shot.h, shot.sub, shot.title)} disabled={busy}>Use this page</button>
                  <button className="pbtn" data-secondary="true" onClick={retake}>Retake</button>
                </div>
              : <>
                  <button className="pbtn" onClick={snap} disabled={!cam || busy}>{cam ? "Snap page" : "No camera on this device"}</button>
                  <p style={{ fontSize: 12 }}>Prototype: send a sample sheet instead</p>
                  <div className="samples">{SAMPLES.map((x) => <button key={x.id} onClick={() => sample(x)} disabled={busy}>{x.title}</button>)}</div>
                </>}
          </div>;
        })()}

        {screen === "practice" && s && (() => {
          const pr = s.practice;
          const unwritten = failed("practice");
          if (!pr) return <div className="pscreen"><h3>Practice</h3>
            {unwritten ? <><p>{unwritten.error}</p>
                <button className="pbtn" data-signal="true" onClick={() => retry("practice")} disabled={busy}>Try again</button></>
              : <p>The practice set starts on the TV — open <b>Teach me something</b> there and pick a topic. Six problems land on the big screen; you work them on paper.</p>}</div>;

          // not marked: the sheet is still on the table. Two ways in: snap all six at once, or type the six answers.
          if (!pr.marked) return <div className="pscreen"><h3>Practice</h3>
            <div className="proute" data-role="practice-route" role="group" aria-label="How to hand in the set">
              <button aria-pressed={route === "snap"} onClick={() => { setRoute("snap"); setMsg(""); }}>Snap the sheet</button>
              <button aria-pressed={route === "type"} onClick={() => { setRoute("type"); setMsg(""); }}>Type my answers</button>
            </div>
            {route === "type" ? (() => {
              const n = pr.items.length, any = typed.some((t) => t.trim());
              return <>
                <p><b>{topicIn(pr.topic)?.name ?? "The set"}</b>. Type your answer to each question. Leave one empty if you skipped it.</p>
                <div className="pasks" data-role="practice-typed">
                  {pr.items.map((it, i) => <div className="pask" key={it.n}>
                    {(() => {
                      // a part of a multi-part question (v2 M3a): the stem once above its first part, then each part's own field
                      const at = partPlace(pr.items, i);
                      if (!at) return <label htmlFor={`ans-${it.n}`}><b>{it.n}.</b> {it.question}</label>;
                      return <>{at.first && <p data-role="typed-stem"><b>{at.q}.</b> {it.stem}</p>}<label htmlFor={`ans-${it.n}`} data-part={at.label}><b>({at.label})</b> {it.question}</label></>;
                    })()}
                    <input id={`ans-${it.n}`} data-role="typed-answer" ref={(el) => { boxes.current[i] = el; }} type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      enterKeyHint={i < n - 1 ? "next" : "done"} maxLength={TYPED_ANSWER_MAX} value={typed[i] ?? ""} disabled={phase === "sending"}
                      aria-label={`Your answer to question ${itemName(pr.items, i)}`}
                      onChange={(e) => setTyped((t) => { const v = Array.from({ length: n }, (_, k) => t[k] ?? ""); v[i] = e.target.value; return v; })}
                      onKeyDown={(e) => { if (e.key !== "Enter") return; e.preventDefault(); if (i < n - 1) boxes.current[i + 1]?.focus(); else e.currentTarget.blur(); }} />
                  </div>)}
                </div>
                {phase === "sending" ? <><p>Sent. The desk is marking the set…</p><button className="pbtn" disabled>Marking the set…</button></>
                  : <button className="pbtn" data-signal="true" onClick={sendTyped} disabled={!any || busy}>Send my answers</button>}
              </>;
            })() : <>
              <p><b>{topicIn(pr.topic)?.name ?? "The set"}</b> — work all {pr.items.length} on paper. When every one is done, snap the whole sheet in one photo.</p>
              <div className="cam">
                {cam ? <video ref={video} autoPlay playsInline muted /> : !shot && <span>camera</span>}
                {shot && <img src={shot.url} alt="the sheet you just snapped" />}
                {cam && !shot && <div className="guide"><i /><i /><i /><i /></div>}
              </div>
              {!shot && <p>Fill the frame with the sheet, all four corners inside.</p>}
              {insecure && !shot && <p data-role="http-limit" role="note">{HTTP_LIMIT.camera}</p>}
              {phase === "sending" ? <><p>Sent. The desk is marking the set…</p><button className="pbtn" disabled>Marking the set…</button></>
                : shot ? <div className="field">
                    <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={sendWorking} disabled={busy}>Send my working</button>
                    <button className="pbtn" data-secondary="true" onClick={retake}>Retake</button>
                  </div>
                : <button className="pbtn" onClick={snap} disabled={!cam || busy}>{cam ? "Snap the sheet" : "No camera on this device"}</button>}
            </>}
          </div>;

          // marked: the count, and not one verdict. The walk itself belongs to the TV.
          // the marks the sheet draws (rules/marks): an item left empty is to look at too, and named apart (MB-B1)
          const { right, skipped } = markCounts(pr.items);
          const look = pr.items.length - right;
          const item = s.screen === "walk" ? pr.items[s.walkIx] : undefined;
          // an item the explanation just settled keeps the reply up; the verdict itself is the TV's to show
          const asking = !!item && (item.verdict === "wrong" || item.verdict === "unsure" || !!reply);
          return <div className="pscreen"><h3>Practice</h3>
            <p><b>{right} right.</b> {look ? `${look} to look at${skipped ? ` (${skipped} skipped)` : ""}.` : "Nothing to look at."}</p>
            <p>{s.screen === "walk" ? "Look at the TV — it is walking the set with you." : "Look at the TV — the whole set is on it. Pick a number there to go through it."}</p>
            {(item?.verdict === "wrong" || item?.verdict === "unsure") && (item.second
              ? <p data-role="second-sent">{item.entered ? "Your typed answer is on the TV." : "Your second go is on the TV."}</p>
              : <div className="ptalk" data-role="second-go">
                  <b>{item.verdict === "unsure" ? "Type your answer" : "Try it again"}</b>
                  <p>{item.verdict === "unsure" ? "Type just the answer you got and the desk will check it. You get one go." : "Work it on paper again, then type just your answer. You get one go."}</p>
                  <div className="field">
                    <input type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint="send"
                      maxLength={TYPED_ANSWER_MAX} value={again} disabled={busy} aria-label={`Your ${item.verdict === "unsure" || item.entered ? "answer" : "second go"} at question ${itemName(pr.items, s.walkIx)}`}
                      onChange={(e) => setAgain(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void sendSecond(); } }} />
                    <button className="pbtn" data-signal="true" onClick={sendSecond} disabled={busy || !again.trim()}>Send</button>
                  </div>
                </div>)}
            {asking && insecure && <p data-role="http-limit" role="note">{HTTP_LIMIT.voice}</p>}
            {asking && <ExplainTalk micOk={micOk} holding={holding} heard={heard} reply={reply} busy={busy} typed={typedExplain} typing={typing}
              onHoldStart={holdStart} onHoldEnd={holdEnd} onSendHeard={() => explain(heard)} onTryAgain={() => { setHeard(""); setReply(""); }}
              onTyped={setTypedExplain} onOpenTyping={() => setTyping(true)} onCloseTyping={() => setTyping(false)}
              onSendTyped={() => explain(typedExplain)} onClearTyped={() => { setTypedExplain(""); setReply(""); }} />}
          </div>;
        })()}

        {screen === "point" && <div className="pscreen"><h3>Point &amp; ask</h3>
          {page ? <>
            <p>Tap a problem on the page, then ask. Item {page.items[ring?.ix ?? s!.itemIx]?.n ?? "—"} is picked.</p>
            <div className="mirror" onPointerDown={tap}><img src={page.img} alt="the captured page" />
              {page.items[ring?.ix ?? s!.itemIx] && <div className="band" style={{ top: `${(page.items[ring?.ix ?? s!.itemIx].band[0] / page.h) * 100}%`, height: `${((page.items[ring?.ix ?? s!.itemIx].band[1] - page.items[ring?.ix ?? s!.itemIx].band[0]) / page.h) * 100}%` }} />}
              {ring && <div className="ring" style={{ left: ring.x, top: ring.y }} />}</div>
            <div className="field"><input placeholder="What do you want to know?" value={q} onChange={(e) => setQ(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => listen(setQ)}>Mic</button></div>
            <div className="presets">{["What do I do first?", "Why is this negative?", "Which rule is this?"].map((p) => <button key={p} onClick={() => setQ(p)}>{p}</button>)}</div>
            {hintAgain && <><p>{hintAgain.error}</p>
              <button className="pbtn" data-signal="true" onClick={() => retry("hint")} disabled={busy}>Try again</button></>}
            <button className="pbtn" data-signal={hintAgain ? undefined : "true"} data-secondary={hintAgain ? "true" : undefined} onClick={ask} disabled={busy || s?.reading}>{s?.reading ? "TV is still reading…" : "Ask the desk"}</button>
          </> : <p>Capture a page first.</p>}</div>}

        {screen === "say" && <div className="pscreen"><h3>Say a sentence</h3><p>English. Speak it or type it; the TV shows what the time word decides.</p>
          <div className="field"><input value={sentence} onChange={(e) => setSentence(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => listen(setSentence)}>Mic</button></div>
          <div className="presets">{["I have gone to school yesterday.", "I lived here since 2019.", "We will visit Prague next week.", "She went to the cinema last night."].map((p) => <button key={p} onClick={() => setSentence(p)}>{p}</button>)}</div>
          <button className="pbtn" data-signal="true" disabled={busy} onClick={checkSentence}>Check it on the TV</button></div>}

        {screen === "paste" && onSentence && <div className="pscreen" data-role="essay-rewrite"><h3>Sentence {onSentence.n}</h3><p>Rewrite it in your own words. The desk reads this one sentence again, in its paragraph.</p>
          {rewriting && <p role="alert" data-role="essay-rewrite-wait">{REWRITE_WHILE_READING}</p>}
          <div className="field"><textarea value={rewrite} onChange={(e) => setRewrite(e.target.value)} /></div>
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setRewrite(t), "essay")}>Dictate</button>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy || rewriting} onClick={sendRewrite}>Send</button></div>
          {againBtn}
          {pix + 1 < paras.length && <button className="pbtn" data-secondary="true" data-role="essay-next-from-rewrite" onClick={nextFromRewrite}>Next paragraph ({pix + 2} of {paras.length})</button>}</div>}

        {screen === "paste" && onPlan && <div className="pscreen" data-role="essay-plan"><h3>Slot {onPlan.i + 1} · {onPlan.slots[onPlan.i]?.label}</h3><p>One sentence, in your own words. It inks on the TV. When all three are written, press OK on Read it.</p>
          <div className="field"><textarea aria-label="Your sentence for this slot" value={slotText} onChange={(e) => setSlotText(e.target.value)} /></div>
          {onPlan.plan.slots[onPlan.i] && planFit(onPlan.slots, onPlan.i, onPlan.plan.slots[onPlan.i]) && <p data-role="essay-plan-fit">{planFit(onPlan.slots, onPlan.i, onPlan.plan.slots[onPlan.i])}</p>}
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setSlotText(t), "essay")}>Dictate</button>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy || !slotText.trim()} onClick={sendSlot}>Send</button></div></div>}

        {screen === "paste" && !onSentence && !onPlan && <div className="pscreen" data-role="essay-paragraph"><h3>Your paragraph</h3>
          <p>Send a .txt or .md file (a .docx goes through the PC page), or type, paste or dictate a message. The desk reads a whole piece, or one paragraph at a time.</p>
          <p data-role="essay-lens">The TV chose the lens: <b>{ESSAY_TYPES.find((t) => t.id === etype)?.name ?? etype}</b>. {ESSAY_TYPES.find((t) => t.id === etype)?.promise}</p>
          {insecure && <p data-role="http-limit" role="note">{HTTP_LIMIT.voice}</p>}
          <label className="pbtn pfile" data-secondary="true">Choose a file (.txt or .md)<input type="file" accept=".txt,.md,text/plain,text/markdown" data-role="essay-file" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pickFile(f); }} /></label>
          {paras.length > 1 && <div className="pparas" data-role="essay-paras">
            <button className="pbtn" data-secondary="true" aria-label="Previous paragraph" disabled={pix === 0} onClick={() => goPara(pix - 1)}>Previous</button>
            <b aria-live="polite">Paragraph {pix + 1} of {paras.length}</b>
            <button className="pbtn" data-signal={readIx.includes(pix) ? "true" : undefined} data-secondary={readIx.includes(pix) ? undefined : "true"} aria-label="Next paragraph" disabled={pix + 1 >= paras.length} onClick={() => goPara(pix + 1)}>Next</button></div>}
          <div className="field"><textarea aria-label="The paragraph the desk will read" placeholder={ESSAY_PLACEHOLDER} value={essay} onChange={(e) => { const v = e.target.value; setEssay(() => v); }} onPaste={onEssayPaste} /></div>
          {note ? <p role="alert" data-role="essay-note" style={{ color: "#B8261A" }}>{note}</p> : info ? <p data-role="essay-info">{info}</p> : null}
          {againBtn}
          {notice !== null && <TextNotice text={notice} mode={noticeFor} onAccept={() => void (noticeFor === "paragraph" ? acceptParagraphNotice() : acceptNotice())} onDecline={() => { setNotice(null); if (noticeFor === "piece") { setKeep(false); void readPiece(false); } }} />}
          {paras.length > 1 && <div className="field" data-role="essay-piece">
            <label className="pkeep"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} data-role="essay-keep" /><span>Keep it on my shelf</span></label>
            {keep && !pieceId && <div className="pkeep" role="radiogroup" aria-label="What is it?" data-role="essay-format">{([["message", "Message"], ["email", "Email"], ["essay", "Essay"]] as const).map(([id, label]) => <label key={id}><input type="radio" name="piece-format" checked={pieceFormat === id} onChange={() => setPieceFormat(id)} data-role={`essay-format-${id}`} /><span>{label}</span></label>)}</div>}
            {keep && !pieceId && <input className="pkeep" type="text" value={pieceTitle} maxLength={80} onChange={(e) => setPieceTitle(e.target.value)} placeholder="Name this piece (optional)" aria-label="Name this piece (optional)" data-role="essay-title" />}
            {stranded > 0 && <p className="pnote" data-role="essay-rewrites-stay" aria-live="polite">{rewriteStaysLine(stranded)}</p>}
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy || notice !== null} onClick={() => void readPiece()} data-role="essay-read-piece">Read the whole piece on the TV ({paras.length} paragraphs)</button></div>}
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setEssay((v) => (v + " " + t).trim()), "essay")}>Dictate</button>
            {!pieceCovers(pix) && <button className="pbtn" data-role="essay-analyse-one" data-signal={paras.length > 1 ? undefined : "true"} data-secondary={paras.length > 1 ? "true" : undefined} style={{ flex: 1 }} disabled={busy || notice !== null || !essay.trim()} onClick={paras.length === 1 && pieceId ? () => void readPiece(true) : analyseParagraph}>{paras.length > 1 ? "This paragraph only" : "Analyse on the TV"}</button>}</div>
          <EssayShelf learnerId={s?.learner?.id} refresh={shelfTick} onOpen={openKept} onGone={(id) => setPieceId((cur) => (id === "all" || cur === id ? undefined : cur))} /></div>}

        </>}

        {peeking && !view && screen === "tonight" && s && <div className="pscreen"><h3>Tonight's list</h3>
          <div className="tlist">{s.tasks.map((t) => <label key={t.id}><input type="checkbox" checked={t.done} onChange={(e) => post({ type: "task.done", id: t.id, done: e.target.checked })} /><span>{t.name}</span><small>{t.min}m</small></label>)}</div>
          <AddTask onAdd={(name, sub) => post({ type: "task.add", name, sub, min: 10 })} />
          <button className="plink" onClick={closeView}>Back</button></div>}

        {peeking && !view && screen === "parent" && s && <div className="pscreen"><h3>Recap</h3>
          {(() => {
            // the TV's recap in words: the same tiles (tv/recapRows.ts), a line each, then the TV's caption sentence
            // ...and, on the phone only, tonight's list (the learner's own tasks): no tasks, no line.
            // It shows whenever tonight has a tile with work, or the evening ended since local midnight - whatever the TV shows.
            const now = Date.now(), blocks = learnerRecaps(s, now), tiles = recapRows(s, now);
            if (!(blocks.length || (s.log.endedAt ?? 0) >= startOfDay(now))) return <p>Arrives when the session ends.</p>;
            const log = tonightsLog(s, now), mins = Math.round(log.minutes), list = tasksLine(s.tasks);
            const tally = [mins > 0 ? counted(mins, "minute") + " on task" : "", log.problems.length ? counted(log.problems.length, "problem") : "", log.hints ? counted(log.hints, "hint") : ""].filter(Boolean).join(" · ");
            // one block per learner with work tonight, headed by their name; the seated learner's carries the tally, the list and the caption
            return <>{blocks.map((b) => { const own = b.id === s.learner?.id; return <div className="precap" data-role="phone-recap" data-learner={b.id} key={b.id}><b>{`${b.name}, tonight`}</b>{own && tally}
              <ul>{b.tiles.map((t) => <li key={t.app} data-app={t.app}>{recapLine(t)}</li>)}{own && list && <li data-app="tasks">{list}</li>}</ul>
              <p style={{ margin: "10px 0 0", fontWeight: 600 }}>{recapCaption(b.tiles)}</p>
              {b.tiles.map((t) => (t.app === "maths" && !t.empty ? <ul key="hinted"><li data-role="phone-hinted">{hintedLine(t)}</li>{slippedLine(t) && <li data-role="phone-slipped">{slippedLine(t)}</li>}</ul> : null))}</div>; })}
              {!blocks.length && <div className="precap" data-role="phone-recap"><b>{s.learner ? `${s.learner.name}, tonight` : "Tonight"}</b>{tally}
                <ul>{tiles.map((t) => <li key={t.app} data-app={t.app}>{recapLine(t)}</li>)}{list && <li data-app="tasks">{list}</li>}</ul>
                <p style={{ margin: "10px 0 0", fontWeight: 600 }}>{recapCaption(tiles)}</p></div>}</>;
          })()}
          <WeekPage lines={s.learner ? s.week : null} />
          <p style={{ fontSize: 12 }}>The TV shows {TV_WORDS[s.screen] ?? "the desk"}{s.status && Object.values(s.jobs ?? {}).some((j) => j?.phase === "running") ? <> · {s.status}</> : null}.</p>
          <button className="plink" onClick={closeView}>Back</button></div>}
        {view === "week" && peeking && s && <div className="pscreen"><h3>This week</h3>
          <WeekPage lines={s.learner ? s.week : null} />
          <button className="plink" onClick={closeView}>Back</button></div>}

        <div className="pstatus" role="status" aria-live="polite">{msg}</div>
      </div>
      {items.length > 0 && <div className="pnav" data-items={items.length}>
        {items.map((it) => <button key={it.id} data-bar={it.id} data-signal={it.id === "primary" ? "true" : undefined} disabled={it.disabled} onClick={() => press(it.id)}>{it.label}</button>)}
      </div>}
    </div>
  );
}

/**
 * The Sunday page (Family W9): the seated learner's past seven days in words, under tonight's recap. The lines are
 * assembled on the server from the learner's own record (rules/week, no model) and are all the phone is sent of it. With
 * no one seated, or nothing done this week, it is two words. The Parent tab is a household convenience, not a locked view:
 * Phase 1 has no parent lock (owner decision D1), so anyone holding the joined phone can read it.
 */
function WeekPage({ lines }: { lines: WeekLine[] | null | undefined }) {
  const shown: WeekLine[] = lines?.length ? lines : [{ section: "week", text: WEEK_EMPTY }];
  return <div className="precap pweek" data-role="phone-week"><b>This week</b>
    {shown.map((l, i) => l.head
      ? <h4 key={i} data-section={l.section}>{l.text}</h4>
      : <p key={i} data-section={l.section} data-line="true">{l.text}</p>)}</div>;
}

/** A name for tonight's list, tagged with its module. Essay stays a choice here: an essay assignment is a task to do, not a page to snap. */
function AddTask({ onAdd }: { onAdd: (name: string, sub: Subject) => void }) {
  const [v, setV] = useState(""); const [sub, setSub] = useState<Subject>("maths");
  return <div className="field"><select value={sub} onChange={(e) => setSub(e.target.value as Subject)}><option value="maths">Math Buddy</option><option value="english">Linga</option><option value="essay">Essay Master</option></select>
    <input placeholder="Add an assignment" value={v} onChange={(e) => setV(e.target.value)} /><button className="pbtn" data-secondary="true" onClick={() => { if (v.trim()) { onAdd(v.trim(), sub); setV(""); } }}>Add</button></div>;
}
