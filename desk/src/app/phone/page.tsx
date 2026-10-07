"use client";
/**
 * The phone: the instrument. Camera, pen, keyboard, mic. It never renders the big view.
 * Student and Parent are two roles on one page for the prototype.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, call, fmt } from "@/tv/useSession";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { essayFileProblem, essayTooLong, paragraphsOf, pieceProblem } from "@/lib/rules/essay";
import { EssayShelf, TextNotice } from "./EssayShelf";
import { topicIn } from "@/lib/library/paths";
import { BRAND as MODULE } from "@/tv/profileRows";
import type { Event, JobKind, Session, Subject } from "@/lib/session/store";
import { LingaPhone } from "@/english/LingaPhone";
import { follow, type PScreen } from "./panelFor";
import { forensicAt } from "@/tv/keys";
import { counted, recapCaption, recapLine, recapRows, tasksLine } from "@/tv/recapRows";
import { nearestItem } from "@/lib/desk/select";
import { TYPED_ANSWER_MAX } from "@/lib/rules/maths";
import { WEEK_EMPTY, type WeekLine } from "@/lib/rules/week";

const SAMPLES: Array<{ id: Subject; title: string; file: string }> = [
  { id: "maths", title: "Algebra — Exercise 4.2", file: "/samples/maths.jpg" },
  { id: "english", title: "English — Unit 6", file: "/samples/english.jpg" },
  // no essay page: Essay Master takes text (a file or a message on the Essay panel), never a photo of handwriting
];

/** The TV's screens in the user's words, for the phone's status line. */
const TV_WORDS: Partial<Record<Session["screen"], string>> = {
  landing: "the desk", pair: "the pairing code", joined: "the paired screen", tonight: "Math Buddy", learner: "the learners", profile: "the learner's picks",
  units: "the units guide", calendar: "the calendar", page: "the page", hint: "a hint", lesson: "a lesson", sentence: "your sentence",
  headtohead: "head to head", essaytype: "Essay Master", forensic: "your paragraph", playbook: "the playbook", xray: "the x-ray", break: "a break", recap: "the recap",
  topics: "Math Buddy's topics", prepare: "getting ready for school", practice: "the practice set", sheet: "your marked sheet", walk: "a marked item",
  linga: "Linga", "linga-scenes": "English situations", "linga-map": "your learning map", "linga-talk": "your conversation", "linga-coach": "a coaching moment", "linga-recap": "your rehearsal recap", "linga-check": "finding your level", "linga-verdict": "your level", "linga-plan": "your topics", "linga-moment": "a moment in your conversation", "linga-cert": "your certificate", "linga-certs": "your certificates",
};
export default function Phone() {
  const { s, connected, post, reconnect } = useSession();
  /** Linga's panel posts and moves on; only the join reads the answer. */
  const postOnly = useCallback(async (e: Event) => { await post(e); }, [post]);
  const [role, setRole] = useState<"student" | "parent">("student");
  const [screen, setScreen] = useState<PScreen>("join");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState<Subject>("maths");
  const [q, setQ] = useState("");
  const [sentence, setSentence] = useState("I have gone to school yesterday.");
  /**
   * The Essay panel's text: a file or a message split into paragraphs (rules/essay paragraphsOf), and the one the
   * textarea shows. The desk reads ONE paragraph at a time; Next steps to the next. All of it lives in this page's
   * state: a picked file is read here in the browser and never uploaded, stored or kept, and it is gone when the
   * phone page closes. Only the current paragraph goes to the desk, when Analyse is pressed.
   */
  const [paras, setParas] = useState<string[]>(["Many students are tired. Sleep is important. Schools start early. This is bad."]);
  const [pix, setPix] = useState(0);
  /** The paragraphs the desk has already read, by index: after one, Next is the button to press. */
  const [readIx, setReadIx] = useState<number[]>([]);
  /** The panel's own lines: a problem (a file the desk will not take, a paragraph that is too long), and a plain word on how a text was split. */
  const [note, setNote] = useState("");
  const [info, setInfo] = useState("");
  const essay = paras[pix] ?? "";
  const setEssay = (f: (v: string) => string) => setParas((ps) => ps.map((p, i) => (i === pix ? f(p) : p)));
  const [etype, setEtype] = useState("structure");
  /**
   * A whole piece (v2 E1, P3): where the text came from, the shelf id once kept (a new version then goes to the same
   * piece), whether to keep it, the one-time notice's words while it is showing, and a tick that reloads the shelf.
   */
  const [source, setSource] = useState<"file" | "paste" | "message">("message");
  const [pieceId, setPieceId] = useState<string | undefined>(undefined);
  const [keep, setKeep] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [shelfTick, setShelfTick] = useState(0);
  const [pname, setPname] = useState("");
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<MediaStream | null>(null);
  /** The shot lives on the phone until the user says Use this page. Nothing is sent before that. */
  const [shot, setShot] = useState<{ url: string; w: number; h: number; sub: Subject; title: string } | null>(null);
  /** The hand-off, as the phone knows it: nothing sent, in flight, gone, or refused. */
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  /** The TV asked for a module; the picker stays out of the way until the user asks for it. */
  const [picking, setPicking] = useState(false);
  /** What the mic caught, held on the phone until the learner has read it back. Nothing is sent unseen. */
  const [heard, setHeard] = useState("");
  const [holding, setHolding] = useState(false);
  const [micOk, setMicOk] = useState(true);
  /** The desk's answer to "how did you get there", in text — the TV speaks its own line. */
  const [reply, setReply] = useState("");
  /** The ringed item's one typed second go (route /api/second): what is typed. The desk never says on the phone how it went. */
  const [again, setAgain] = useState("");
  /** What the desk noticed tonight, read once on the way out. */
  const [memory, setMemory] = useState<string[] | null>(null);
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
    remembered.current = null;
    history.replaceState(null, "", location.pathname);
    void join(q, true);
  }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the input mirrors the draft; a new draft (or none) resets what is typed here
  useEffect(() => { setPname(s?.draft?.name ?? ""); }, [s?.draft?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // the TV asked for a page: the capture tab follows what it is waiting for
  useEffect(() => { if (s?.awaiting && s.awaiting !== "essay") setSubject(s.awaiting); }, [s?.awaiting]);
  useEffect(() => { if (s?.essayType && role === "student" && screen !== "paste" && s.screen === "essaytype") { setEtype(s.essayType); } }, [s?.essayType, s?.screen, role, screen]);

  // camera on when a screen is asking for a photo: capture, or practice with a set still to mark
  const camWanted = screen === "capture" || (screen === "practice" && !!s?.practice && !s.practice.marked && route === "snap");
  useEffect(() => {
    if (!camWanted) { cam?.getTracks().forEach((t) => t.stop()); setCam(null); return; }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } }).then((st) => { setCam(st); if (video.current) video.current.srcObject = st; }).catch(() => setMsg(screen === "capture" ? "No camera here — use a sample page below." : "No camera here."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camWanted]);
  // the element arrives after the stream does; hand it the stream once it is on the page
  useEffect(() => { if (cam && video.current && video.current.srcObject !== cam) video.current.srcObject = cam; }, [cam, shot]);

  const [bad, setBad] = useState(false);
  /**
   * The desk checks the code (api/session): a match sets this phone's cookie and the stream reopens as a joined
   * phone; a refusal says why. Quiet for a code the phone brought (the QR, a remembered one): no shake for those.
   */
  const join = async (code = pin, quiet = false) => {
    let r: Response | null = null;
    try { r = await post({ type: "join", code }); } catch {}
    if (r?.ok) { setMsg(""); try { localStorage.setItem("desk.pin", code); setHasDesk(true); } catch {} reconnect(); return; }
    if (quiet) return;
    const j = r ? await r.json().catch(() => ({} as { error?: string })) as { error?: string } : {};
    setMsg(r ? j.error ?? "That code is not on the TV." : "That did not reach the desk."); setBad(true); setTimeout(() => setBad(false), 500);
  };
  // four digits join by themselves; Join stays as the fallback tap
  const onPin = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); setPin(d); if (d.length === 4 && s && !s.joined) join(d); };
  // the phone remembers the desk: a code kept from an earlier join lets it in without asking
  const remembered = useRef<string | null>(null);
  /** Whether this phone holds a desk to forget: the Forget link is offered only then. */
  const [hasDesk, setHasDesk] = useState(false);
  useEffect(() => { try { remembered.current = localStorage.getItem("desk.pin"); setHasDesk(!!remembered.current); } catch {} }, []);
  useEffect(() => { if (s && !s.joined && remembered.current) { const code = remembered.current; remembered.current = null; void join(code, true); } }, [s?.joined]); // eslint-disable-line react-hooks/exhaustive-deps
  // the desk forgets this phone too: its cookie goes, and the stream reopens as a guest
  const forget = () => { try { localStorage.removeItem("desk.pin"); } catch {} remembered.current = null; setHasDesk(false); setMsg("This phone will ask for the code next time.");
    void post({ type: "leave" }).then(() => reconnect(), () => {}); };

  // the phone stays where it is: the hand-off is shown, not jumped over
  const send = async (dataUrl: string, w: number, h: number, sub: Subject, title: string) => {
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/read", { image: dataUrl, subject: sub, title, w, h }); const j = await r.json();
      // a run that failed (502) is on the desk with its sentence and a Try again; only a refusal needs the line here
      if (r.ok) { setPhase("sent"); setMsg(""); } else { setPhase("failed"); setMsg(r.status === 502 ? "" : (j.error ?? `The desk could not read it (${r.status}).`)); }
    } catch (e) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  const toJpeg = (src: HTMLVideoElement | HTMLImageElement, sw: number, sh: number) => {
    const w = 1280, h = Math.round((sh / sw) * 1280); const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d")!.drawImage(src, 0, 0, w, h); return { url: c.toDataURL("image/jpeg", 0.85), w, h };
  };
  /** How many pages of this module are already on the desk — a sheet has more than one side. */
  const pagesOf = (sub: Subject) => s?.pages.filter((p) => p.subject === sub).length ?? 0;
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
  useEffect(() => { if (onSentence) setRewrite(onSentence.text); }, [onSentence?.n, onSentence?.text]); // eslint-disable-line react-hooks/exhaustive-deps
  const sendRewrite = async () => { if (!onSentence) return; setBusy(true); setMsg("the desk is reading it…");
    try { const r = await call("/api/analyse", { kind: "rewrite", n: onSentence.n, text: rewrite }); const j = await r.json().catch(() => ({} as { error?: string }));
      setMsg(r.ok ? "on the TV" : (j as { error?: string }).error ?? "failed"); } catch { setMsg("That did not reach the desk."); } finally { setBusy(false); } };
  /** Load a text as a list of paragraphs, the first one showing. */
  const loadParagraphs = (ps: string[], said: string) => { setParas(ps); setPix(0); setReadIx([]); setNote(""); setInfo(said); setMsg(""); };
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
    setSource("file"); setPieceId(undefined);
    loadParagraphs(ps, ps.length > 1 ? `${f.name}: ${ps.length} paragraphs. Read the whole piece, or one paragraph at a time.` : "");
  };
  /** A pasted message with blank lines is split the same way; a paste without any goes in as it always did. */
  const onEssayPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget, pasted = e.clipboardData.getData("text");
    const ps = paragraphsOf(t.value.slice(0, t.selectionStart) + pasted + t.value.slice(t.selectionEnd));
    if (ps.length < 2) return;
    e.preventDefault(); setSource("paste"); setPieceId(undefined); loadParagraphs(ps, `That is ${ps.length} paragraphs. Read the whole piece, or one paragraph at a time.`);
  };
  /** The whole piece to the TV (v2 E1): kept on the shelf first when asked; a 428 means the one-time notice is due. */
  const readPiece = async (keepIt = keep) => {
    const whole = paras.join("\n\n"), problem = pieceProblem(whole);
    if (problem) return setNote(problem);
    setNote(""); setInfo(""); setBusy(true); setMsg("the desk is reading your piece…");
    try {
      const r = await call("/api/analyse", { kind: "piece", text: whole, type: etype, keep: keepIt, pieceId, source });
      const j = await r.json().catch(() => ({} as { error?: string; notice?: boolean; piece?: { pieceId?: string } }));
      if (r.status === 428 && (j as { notice?: boolean }).notice) { setMsg(""); setNotice((j as { error?: string }).error ?? ""); return; }
      if (r.ok) { setMsg("on the TV"); setReadIx(paras.map((_, i) => i)); const id = (j as { piece?: { pieceId?: string } }).piece?.pieceId; if (id) setPieceId(id); setShelfTick((t) => t + 1); }
      else { setMsg(""); setNote((j as { error?: string }).error ?? "The desk could not read that piece. Try again."); }
    } catch { setMsg(""); setNote("That did not reach the desk."); } finally { setBusy(false); }
  };
  const acceptNotice = async () => {
    setNotice(null);
    try { const r = await call("/api/texts", { notice: true }); if (r.ok) return void readPiece(true); } catch {}
    setNote("That did not reach the desk.");
  };
  const openKept = (id: string, text: string) => { const ps = paragraphsOf(text); setPieceId(id); setSource("message"); loadParagraphs(ps.length ? ps : [text], `Opened from your shelf: ${ps.length} paragraph${ps.length === 1 ? "" : "s"}. Change it, then read it again as a new version.`); };
  /** Analyse the paragraph showing. Blank lines typed into it split it first; the desk still reads only the first part. */
  const analyseParagraph = async () => {
    const ps = paragraphsOf(essay); if (!ps.length) return;
    const one = ps[0], tooLong = essayTooLong(one);
    if (tooLong) return setNote(tooLong);
    if (ps.length > 1) { setParas((all) => [...all.slice(0, pix), ...ps, ...all.slice(pix + 1)]); setReadIx([]); }
    setNote(""); setInfo(""); setBusy(true); setMsg("the desk is reading it…");
    try {
      const r = await call("/api/analyse", { kind: "essay", text: one, type: etype });
      if (r.ok) { setMsg("on the TV"); setReadIx((x) => [...x, pix]); }
      else { const j = await r.json().catch(() => ({} as { error?: string })); setMsg(""); setNote((j as { error?: string }).error ?? "The desk could not read that one. Try again."); }
    } catch { setMsg(""); setNote("That did not reach the desk."); } finally { setBusy(false); }
  };
  /** From the sentence rewrite panel, on to the next paragraph: the TV goes back to the lens home, the phone to its paragraph. */
  const nextFromRewrite = () => { goPara(pix + 1); void post({ type: "nav", screen: "essaytype", focus: Math.max(0, ESSAY_TYPES.findIndex((t) => t.id === etype)) }); };
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!page) return; const r = e.currentTarget.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * page.h;
    const best = nearestItem(page.items, y);
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top }); post({ type: "item", itemIx: best }); if (s?.screen !== "page") post({ type: "nav", screen: "page" });
  };
  const ask = async () => { if (!page) return; setBusy(true); setMsg("");
    try { const r = await call("/api/hint", { askedQ: q, itemIx: s?.itemIx }); setQ("");
      if (!r.ok && r.status !== 502) { const j = await r.json().catch(() => ({} as { error?: string })); setMsg(j.error ?? `The desk could not ask (${r.status}).`); } }
    catch (e) { setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); } };
  /** The desk's failed run of this kind that can be asked again in place: it holds what it was asked with. */
  const failed = (kind: JobKind) => { const j = s?.jobs?.[kind]; return j?.phase === "failed" && j.input && j.id !== passed ? j : null; };
  /** A hint that failed for the item the TV is on. */
  const hintAgain = (() => { const h = failed("hint"); return h && page && h.key === page.items[s?.itemIx ?? 0]?.key ? h : null; })();
  /** One press: the desk asks again with what it holds — the same page, the same item and question, the same topic. */
  const retry = async (kind: JobKind) => {
    setBusy(true); setMsg(""); if (kind === "read") setPhase("sending");
    try {
      const r = await call("/api/session/retry", { kind }); const j = await r.json().catch(() => ({} as { error?: string }));
      if (kind === "read") setPhase(r.ok ? "sent" : "failed");
      if (!r.ok && r.status !== 502) setMsg(j.error ?? `The desk could not try again (${r.status}).`);
    } catch (e) { if (kind === "read") setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** A Mic press is listening: the phone does not move away from the field it is filling. */
  const hearing = useRef(false);
  const listen = (into: (t: string) => void) => {
    // Web Speech is not in TypeScript's DOM lib; the shape we use is small enough to declare here.
    type Rec = { lang: string; onresult: (ev: { results: Array<Array<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setMsg("No speech recognition in this browser — type instead."); return null; }
    const r = new SR(); r.lang = "en-US"; r.onresult = (ev) => into(ev.results[0][0].transcript); r.onerror = () => { hearing.current = false; setMsg("did not catch that"); }; r.onend = () => { hearing.current = false; };
    r.start(); hearing.current = true; setMsg("listening…");
    return r; // the caller may hold the button and stop it on release
  };
  // is there a mic path at all on this device? asked once, so the fallback is offered before a failed press
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }; setMicOk(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)); }, []);

  // ---- the practice loop: the worked sheet goes to be marked, the mouth explains one slip ----
  /** The whole worked set, one photo. Same shot/review machinery as capture; a different door. */
  const sendWorking = async () => {
    if (!shot) return;
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/mark", { image: shot.url, w: shot.w, h: shot.h });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (r.ok) setPhase("sent");
      else { setPhase("failed"); setMsg(r.status === 404 ? "The desk cannot mark yet — that part is still being built." : (j.error ?? `The desk could not mark it (${r.status}).`)); }
    } catch (e) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
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
    setBusy(true); setPhase("sending"); setMsg("");
    try {
      const r = await call("/api/mark", { answers: Array.from({ length: n }, (_, i) => typed[i] ?? "") });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (r.ok) setPhase("sent");
      else { setPhase("failed"); setMsg(j.error ?? `The desk could not mark it (${r.status}).`); }
    } catch (e) { setPhase("failed"); setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  // the set came back marked: the sheet has done its job, so the review clears itself
  useEffect(() => { if (screen === "practice" && s?.practice?.marked) { setShot(null); setPhase("idle"); } }, [s?.practice?.marked]); // eslint-disable-line react-hooks/exhaustive-deps
  // a new item on the walk is a new question: last time's transcript and answer do not belong to it
  useEffect(() => { setHeard(""); setReply(""); setAgain(""); }, [s?.walkIx]);

  const rec = useRef<{ stop: () => void } | null>(null);
  const holdStart = () => { setReply(""); setHeard(""); const r = listen((t) => { setHeard(t); setMsg(""); }); if (r) { rec.current = r; setHolding(true); } else setMicOk(false); };
  const holdEnd = () => { if (!holding) return; rec.current?.stop(); rec.current = null; setHolding(false); setMsg(""); };
  const explain = async (transcript: string) => {
    const t = transcript.trim(); if (!t) return;
    setBusy(true); setMsg("");
    try {
      const r = await call("/api/explain", { transcript: t, n: s?.walkIx });
      const j = await r.json().catch(() => ({} as { reply?: string; error?: string }));
      if (r.ok) { setReply(j.reply ?? "The desk heard you."); setHeard(""); }
      else setMsg(r.status === 404 ? "The desk cannot listen back yet — that part is still being built." : (j.error ?? `The desk could not use that (${r.status}).`));
    } catch (e) { setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** One typed second go on the ringed item in hand: the TV draws what it came to; a refusal is the desk's own sentence. */
  const sendSecond = async () => {
    const it = s?.practice?.items[s.walkIx], a = again.trim(); if (!it || !a || busy) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setBusy(true); setMsg("");
    try {
      const r = await call("/api/second", { n: it.n, answer: a });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (r.ok) setAgain(""); else setMsg(j.error ?? `The desk could not take that (${r.status}).`);
    } catch (e) { setMsg(`That did not reach the desk: ${String(e)}`); } finally { setBusy(false); }
  };
  /** Memory is written on the way out — and is never allowed to hold the door shut. */
  const endSession = async () => {
    setBusy(true);
    try { const r = await call("/api/memory", {}); const j = await r.json().catch(() => ({} as { lines?: string[] })); setMemory(r.ok && Array.isArray(j.lines) ? j.lines : []); }
    catch { setMemory([]); }
    finally { setBusy(false); await post({ type: "session.end" }); }
  };

  // The phone follows the TV (panelFor.ts): when the TV's screen changes into a hand-off, the phone moves once to
  // the panel that does it. A same-screen update moves nothing, so a tab the learner picked stays picked; busy hands
  // (typing, a shot held unsent, a recording) are never interrupted; a fresh join lands on the confirmation.
  const seen = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!s) return;
    const el = document.activeElement;
    const typing = el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit"].includes(el.type)) || (el instanceof HTMLElement && el.isContentEditable);
    const held = (screen === "capture" || screen === "practice") && !!shot && phase !== "sent";
    const busyHands = typing || held || holding || hearing.current || !!s.conversation?.capture;
    const step = follow(seen.current, s, { panel: screen, role, busy: busyHands });
    seen.current = step.key;
    if (step.to) setScreen(step.to);
  }, [s, role, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // The nav waits for a joined phone — except Profile, which a first arrival needs before joining.
  const nav = (n: PScreen) => { if (!s?.joined && n !== "profile") return; setScreen(n); };
  return (
    <div className="phone">
      <div className="ptop">
        <div className="who"><button aria-pressed={role === "student"} onClick={() => { setRole("student"); }}>Student</button><button aria-pressed={role === "parent"} onClick={() => { setRole("parent"); setScreen("parent"); }}>Parent</button></div>
        <div className="link">{s?.joined ? <><b>joined</b>{s.learner && <> · {s.learner.name}</>}</> : connected ? "not joined" : "connecting…"}{s && <small>TV · {TV_WORDS[s.screen] ?? s.screen}</small>}</div>
      </div>
      <div className="pbody">
        {screen === "linga" && s && <LingaPhone key={`${s.learner?.id ?? ""}:${s.conversation?.id??"setup"}:${s.check?.id??""}`} s={s} post={postOnly} onSentence={()=>setScreen("say")}/>}
        {screen === "join" && <div className="pscreen"><h3>Join the desk</h3>
          <p>{!s ? "Looking for the TV…" : s.screen === "pair" ? "The TV is showing the code. Type it here." : `The TV is on ${TV_WORDS[s.screen] ?? s.screen}. Ask it for the code, then type it here.`}</p>
          {s && s.screen !== "pair" && <button className="pbtn" data-secondary="true" onClick={() => post({ type: "nav", screen: "pair", from: s.screen })}>Show the code on the TV</button>}
          <div className="field" data-bad={bad}><input inputMode="numeric" placeholder="4-digit code" value={pin} onChange={(e) => onPin(e.target.value)} /><button className="pbtn" data-signal="true" onClick={() => join()}>Join</button></div>
          <p style={{ fontSize: 12 }}>The TV serves this page itself; nothing to install. This phone remembers the desk once it has joined.{hasDesk && <> <button className="plink" onClick={forget}>Forget this desk</button></>}</p>
          <button className="pbtn" data-secondary="true" onClick={() => nav("profile")}>Naming a new learner? Open Profile.</button></div>}

        {screen === "joined" && s && <div className="pscreen"><h3>On the desk</h3>
          {/* a fresh desk has no one at it yet: the phone says so, and offers no snap until someone sits down (the page would be no one's) */}
          {s.learner
            ? <p>Joined as <b>{s.learner.name}</b>. {["landing", "pair", "joined"].includes(s.screen) ? "Open an app on the TV and this phone follows it." : `The TV is on ${TV_WORDS[s.screen] ?? s.screen}.`}</p>
            : <p>Joined. No one is at the desk yet: on the TV, press Down to Choose who and Select to choose who is studying.</p>}
          {s.screen === "profile" || s.draft
            ? <button className="pbtn" data-signal="true" onClick={() => nav("profile")}>Name the new learner</button>
            : s.learner && (s.awaiting === "essay"
              ? <button className="pbtn" data-signal="true" onClick={() => nav("paste")}>Send your paragraph</button>
              : <button className="pbtn" data-signal="true" onClick={() => nav("capture")}>{s.awaiting ? `Snap the ${MODULE[s.awaiting]} page` : "Snap the page"}</button>)}
          <button className="pbtn" data-secondary="true" onClick={() => nav("tonight")}>Set up tonight first</button>
          {s.learner && <p style={{ fontSize: 12 }}>Not {s.learner.name}? On the TV's desk, press Down to Someone else and Select to switch who is at the desk.</p>}</div>}

        {screen === "profile" && <div className="pscreen"><h3>Profile</h3>
          <p>At the desk now: <b>{s?.learner?.name ?? "no one yet"}</b></p>
          {s && (s.draft || s.screen === "profile") ? <>
            <p>The TV takes the picks; type the name here.</p>
            <div className="field"><input placeholder="Name" value={pname} onChange={(e) => { setPname(e.target.value); post({ type: "profile.draft", patch: { name: e.target.value } }); }} /></div>
            <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={!pname.trim()} onClick={() => post({ type: "profile.save" })}>Save</button>
              <button className="pbtn" data-secondary="true" onClick={() => post({ type: "profile.discard" })}>Cancel</button></div>
          </> : <p>Add or edit a learner on the TV; the name is typed here.</p>}</div>}

        {screen === "capture" && (() => {
          const reading = phase === "sending" || (phase === "sent" && !!s?.reading);
          const done = phase === "sent" && !reading;
          const read = page?.items.length ?? 0;
          const n = pagesOf(subject);
          // a read that failed: the page is already on the desk, so it is read again there, not sent twice
          const again = !reading ? failed("read") : null;
          return <div className="pscreen"><h3>Capture a page</h3>
            {s?.awaiting && s.awaiting !== "essay" && !picking
              ? <p><b>{MODULE[s.awaiting]}</b> — the TV is waiting for this page. <button className="plink" onClick={() => setPicking(true)}>change</button></p>
              : <div className="field"><select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}><option value="maths">Math Buddy</option><option value="english">Linga</option></select></div>}
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
                    <label htmlFor={`ans-${it.n}`}><b>{it.n}.</b> {it.question}</label>
                    <input id={`ans-${it.n}`} data-role="typed-answer" ref={(el) => { boxes.current[i] = el; }} type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      enterKeyHint={i < n - 1 ? "next" : "done"} maxLength={TYPED_ANSWER_MAX} value={typed[i] ?? ""} disabled={phase === "sending"}
                      aria-label={`Your answer to question ${it.n}`}
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
              {phase === "sending" ? <><p>Sent. The desk is marking the set…</p><button className="pbtn" disabled>Marking the set…</button></>
                : shot ? <div className="field">
                    <button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={sendWorking} disabled={busy}>Send my working</button>
                    <button className="pbtn" data-secondary="true" onClick={retake}>Retake</button>
                  </div>
                : <button className="pbtn" onClick={snap} disabled={!cam || busy}>{cam ? "Snap the sheet" : "No camera on this device"}</button>}
            </>}
          </div>;

          // marked: the count, and not one verdict. The walk itself belongs to the TV.
          const right = pr.items.filter((i) => i.verdict === "right").length;
          const look = pr.items.length - right;
          const item = s.screen === "walk" ? pr.items[s.walkIx] : undefined;
          // an item the explanation just settled keeps the reply up; the verdict itself is the TV's to show
          const asking = !!item && (item.verdict === "wrong" || item.verdict === "unsure" || !!reply);
          return <div className="pscreen"><h3>Practice</h3>
            <p><b>{right} right.</b> {look ? `${look} to look at.` : "Nothing to look at."}</p>
            <p>{s.screen === "walk" ? "Look at the TV — it is walking the set with you." : "Look at the TV — the whole set is on it. Pick a number there to go through it."}</p>
            {item?.verdict === "wrong" && (item.second
              ? <p data-role="second-sent">Your second go is on the TV.</p>
              : <div className="ptalk" data-role="second-go">
                  <b>Try it again</b>
                  <p>Work it on paper again, then type just your answer. You get one go.</p>
                  <div className="field">
                    <input type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} enterKeyHint="send"
                      maxLength={TYPED_ANSWER_MAX} value={again} disabled={busy} aria-label={`Your second go at question ${item.n}`}
                      onChange={(e) => setAgain(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void sendSecond(); } }} />
                    <button className="pbtn" data-signal="true" onClick={sendSecond} disabled={busy || !again.trim()}>Send</button>
                  </div>
                </div>)}
            {asking && <div className="ptalk">
              <b>How did you get there?</b>
              {reply ? <><p className="said">{reply}</p><p>The TV has it.</p></> : null}
              {heard ? <>
                <p>I heard: “{heard}”</p>
                <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => explain(heard)} disabled={busy}>Send</button>
                  <button className="pbtn" data-secondary="true" onClick={() => { setHeard(""); setReply(""); }}>Try again</button></div>
              </> : micOk ? <>
                <button className="phold" data-holding={holding} onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd} onContextMenu={(e) => e.preventDefault()}>
                  {holding ? "Listening… let go when you are done" : "Tell the desk how you got it"}</button>
                <p style={{ fontSize: 12 }}>Hold the button, say what you did, let go.</p>
              </> : <>
                <p>The microphone is not available in this browser — type it instead.</p>
                <div className="field"><textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="What did you do first?" /></div>
                <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={() => explain(q)} disabled={busy || !q.trim()}>Send</button>
                  <button className="pbtn" data-secondary="true" onClick={() => { setQ(""); setReply(""); }}>Try again</button></div>
              </>}
            </div>}
          </div>;
        })()}

        {screen === "point" && <div className="pscreen"><h3>Point &amp; ask</h3>
          {page ? <>
            <p>Tap a problem on the page, then ask. Item {page.items[s!.itemIx]?.n ?? "—"} is on the TV.</p>
            <div className="mirror" onPointerDown={tap}><img src={page.img} alt="the captured page" />
              {page.items[s!.itemIx] && <div className="band" style={{ top: `${(page.items[s!.itemIx].band[0] / page.h) * 100}%`, height: `${((page.items[s!.itemIx].band[1] - page.items[s!.itemIx].band[0]) / page.h) * 100}%` }} />}
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
          <button className="pbtn" data-signal="true" disabled={busy} onClick={async () => { setBusy(true); setMsg("sending…"); try { const r = await call("/api/analyse", { kind: "english", sentence }); setMsg(r.ok ? "on the TV" : "failed"); } finally { setBusy(false); } }}>Check it on the TV</button></div>}

        {screen === "paste" && onSentence && <div className="pscreen" data-role="essay-rewrite"><h3>Sentence {onSentence.n}</h3><p>Rewrite it in your own words. The desk reads this one sentence again, in its paragraph.</p>
          <div className="field"><textarea value={rewrite} onChange={(e) => setRewrite(e.target.value)} /></div>
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setRewrite(t))}>Dictate</button>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy} onClick={sendRewrite}>Send</button></div>
          {pix + 1 < paras.length && <button className="pbtn" data-secondary="true" data-role="essay-next-from-rewrite" onClick={nextFromRewrite}>Next paragraph ({pix + 2} of {paras.length})</button>}</div>}

        {screen === "paste" && !onSentence && <div className="pscreen" data-role="essay-paragraph"><h3>Your paragraph</h3>
          <p>Send a .txt or .md file, or type, paste or dictate a message. The desk reads a whole piece, or one paragraph at a time. Pick the lens, or pick it on the TV.</p>
          <div className="types" data-compact="true">{ESSAY_TYPES.map((t) => <label key={t.id}><input type="radio" name="etype" checked={etype === t.id} onChange={() => setEtype(t.id)} /><span><b>{t.name}</b></span></label>)}</div>
          <p style={{ fontSize: 14 }}>{ESSAY_TYPES.find((t) => t.id === etype)?.promise}</p>
          <label className="pbtn pfile" data-secondary="true">Choose a file (.txt or .md)<input type="file" accept=".txt,.md,text/plain,text/markdown" data-role="essay-file" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pickFile(f); }} /></label>
          {paras.length > 1 && <div className="pparas" data-role="essay-paras">
            <button className="pbtn" data-secondary="true" aria-label="Previous paragraph" disabled={pix === 0} onClick={() => goPara(pix - 1)}>Previous</button>
            <b aria-live="polite">Paragraph {pix + 1} of {paras.length}</b>
            <button className="pbtn" data-signal={readIx.includes(pix) ? "true" : undefined} data-secondary={readIx.includes(pix) ? undefined : "true"} aria-label="Next paragraph" disabled={pix + 1 >= paras.length} onClick={() => goPara(pix + 1)}>Next</button></div>}
          <div className="field"><textarea aria-label="The paragraph the desk will read" value={essay} onChange={(e) => { const v = e.target.value; setEssay(() => v); }} onPaste={onEssayPaste} /></div>
          {note ? <p role="alert" data-role="essay-note" style={{ color: "#B8261A" }}>{note}</p> : info ? <p data-role="essay-info">{info}</p> : null}
          {notice !== null && <TextNotice text={notice} onAccept={() => void acceptNotice()} onDecline={() => { setNotice(null); setKeep(false); void readPiece(false); }} />}
          {paras.length > 1 && <div className="field" data-role="essay-piece">
            <label className="pkeep"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} data-role="essay-keep" /><span>Keep it on my shelf</span></label>
            <button className="pbtn" data-signal="true" style={{ flex: 1 }} disabled={busy || notice !== null} onClick={() => void readPiece()} data-role="essay-read-piece">Read the whole piece on the TV ({paras.length} paragraphs)</button></div>}
          <div className="field"><button className="pbtn" data-secondary="true" onClick={() => listen((t) => setEssay((v) => (v + " " + t).trim()))}>Dictate</button>
            <button className="pbtn" data-signal={paras.length > 1 ? undefined : "true"} data-secondary={paras.length > 1 ? "true" : undefined} style={{ flex: 1 }} disabled={busy || !essay.trim()} onClick={analyseParagraph}>{paras.length > 1 ? "This paragraph only" : "Analyse on the TV"}</button></div>
          <EssayShelf learnerId={s?.learner?.id} refresh={shelfTick} onOpen={openKept} /></div>}

        {screen === "tonight" && s && <div className="pscreen"><h3>Tonight</h3>
          <div className="tlist">{s.tasks.map((t) => <label key={t.id}><input type="checkbox" checked={t.done} onChange={(e) => post({ type: "task.done", id: t.id, done: e.target.checked })} /><span>{t.name}</span><small>{t.min}m</small></label>)}</div>
          <AddTask onAdd={(name, sub) => post({ type: "task.add", name, sub, min: 10 })} />
          <button className="pbtn" onClick={() => post({ type: s.timer.running ? "timer.pause" : "timer.start" })}>{s.timer.running ? `Pause · ${fmt(s.timer.left)}` : `Start · ${fmt(s.timer.left)}`}</button>
          <button className="pbtn" data-secondary="true" onClick={endSession} disabled={busy}>{busy ? "Closing…" : "End session"}</button>
          {memory && <div className="precap"><b>What the desk noticed</b>
            {memory.length ? <ul>{memory.map((l) => <li key={l}>{l}</li>)}</ul> : <ul><li>Nothing written down tonight.</li></ul>}</div>}</div>}

        {screen === "parent" && s && <div className="pscreen"><h3>Recap</h3>
          {s.screen === "recap" || s.log.problems.length ? (() => {
            // the TV's recap in words: the same tiles (tv/recapRows.ts), a line each, then the TV's caption sentence
            // ...and, on the phone only, tonight's list (the learner's own tasks): no tasks, no line
            const tiles = recapRows(s, Date.now()), mins = Math.round(s.log.minutes), list = tasksLine(s.tasks);
            const tally = [mins > 0 ? counted(mins, "minute") + " on task" : "", s.log.problems.length ? counted(s.log.problems.length, "problem") : "", s.log.hints ? counted(s.log.hints, "hint") : ""].filter(Boolean).join(" · ");
            return <div className="precap" data-role="phone-recap"><b>{s.learner ? `${s.learner.name}, tonight` : "Tonight"}</b>{tally}
              <ul>{tiles.map((t) => <li key={t.app} data-app={t.app}>{recapLine(t)}</li>)}{list && <li data-app="tasks">{list}</li>}</ul>
              <p style={{ margin: "10px 0 0", fontWeight: 600 }}>{recapCaption(tiles)}</p>
              <ul>{s.log.hard.length ? s.log.hard.map((h) => <li key={h}>Needed a second hint: {h}</li>) : <li>Nothing needed a second hint.</li>}</ul></div>;
          })() : <p>Arrives when the session ends.</p>}
          <WeekPage lines={s.learner ? s.week : null} />
          <p style={{ fontSize: 12 }}>The TV shows {TV_WORDS[s.screen] ?? "the desk"}{s.status && Object.values(s.jobs ?? {}).some((j) => j?.phase === "running") ? <> · {s.status}</> : null}.</p></div>}

        <div className="pstatus">{msg}</div>
      </div>
      <div className="pnav">
        {([["capture", "Capture"], ["practice", "Practice"], ["point", "Point & ask"], ["linga", "Linga"], ["say", "Say it"], ["paste", "Essay"], ["tonight", "Tonight"], ["parent", "Recap"], ["profile", "Profile"]] as Array<[PScreen, string]>).map(([id, label]) => <button key={id} aria-pressed={screen === id} disabled={!s?.joined && id !== "profile"} onClick={() => nav(id)}>{label}</button>)}
      </div>
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
