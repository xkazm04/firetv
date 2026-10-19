/**
 * Where the phone should be. The TV opens a hand-off (the session's `ask`); the phone shows that hand-off's panel and
 * goes there by itself when a NEW ask id arrives - on the same TV screen too, and again after a reopened stream. A tab
 * the learner picked stays picked while the same ask stays open. The few screens that still ask the phone without
 * opening an ask (Linga's, a failed read's Try again) keep the old screen-keyed cue until their slices
 * (TL-12, TL-13) open asks. Pure; the phone page calls follow() on every session change. Tested by
 * tools/phone-panel-test.cjs.
 */
import type { AskKind, Session } from "@/lib/session/store";
import { lingaOwns } from "@/tv/keys";

/** The phone's panels. */
export type PScreen = "join" | "joined" | "capture" | "practice" | "point" | "say" | "paste" | "tonight" | "parent" | "profile" | "linga" | "paper";

type Seen = Pick<Session, "joined" | "screen" | "subject" | "awaiting" | "practice" | "pages" | "pageIx" | "jobs"> & Partial<Pick<Session, "english" | "ask">>;

/** The one panel each kind of hand-off is done on. The camera panels, the typing panels, Linga's three: no kind has two. */
export const ASK_PANEL: Readonly<Record<AskKind, PScreen>> = {
  name: "profile", page: "capture", sheet: "practice", answers: "practice", question: "point", explain: "practice", second: "practice", paper: "paper",
  paragraph: "paste", rewrite: "paste", slot: "paste", sentence: "say", reply: "linga", words: "linga", prefs: "linga", private: "paste",
};

/** A hand-off: the panel it wants, and a key that changes only when the TV asks for something new. */
interface Cue { panel: PScreen; key: string }

/** The hand-off the TV makes to the phone, or null where it asks nothing the phone can do. */
function cueFor(s: Seen): Cue | null {
  const a = s.ask;
  // the open ask first, and keyed on its id: a second ask on the same screen is a new hand-off. A sent ask is the desk's to finish
  if (a) return a.phase === "open" ? { panel: ASK_PANEL[a.kind], key: `ask:${a.id}` } : null;
  // an unjoined phone with nothing else asked is asked for the code
  if (!s.joined) return { panel: "join", key: "join" };
  // Linga is one panel that reads its own screens (TL-12 moves it onto asks)
  if (lingaOwns(s as Session)) return { panel: "linga", key: "linga" };
  const sc = s.screen;
  // "The desk could not read this page. Press Try again on the phone" (TL-13 moves the retry to the TV)
  if (sc === "page") {
    const p = s.pages[s.pageIx];
    return p && (readFailed(s) || (p.subject === "essay" && s.jobs?.read?.phase === "failed" && s.jobs.read.key === p.id)) ? { panel: p.subject === "essay" ? "paste" : "capture", key: `page:retry:${p.id}` } : null;
  }
  return null;
}

/** The panel the TV's screen hands off to, or "stay" where it asks nothing of the phone. */
export const panelFor = (s: Seen): PScreen | "stay" => cueFor(s)?.panel ?? "stay";

/** The page on the TV is one whose read failed: the phone brings Try again, not a camera. */
export const readFailed = (s: Pick<Seen, "screen" | "pages" | "pageIx" | "jobs">) => { const p = s.pages[s.pageIx], read = s.jobs?.read; return s.screen === "page" && !!p && p.subject !== "essay" && read?.phase === "failed" && read.key === p.id; };

/** A panel that turns the camera on as it opens. */
const opensCamera = (panel: PScreen, s: Seen) => (panel === "capture" && !readFailed(s)) || (panel === "practice" && s.ask?.kind === "sheet" && !s.practice?.marked);

/** Where the phone is, who holds it, and whether the learner's hands are on it (typing, a shot held unsent, recording). */
export interface At { panel: PScreen; role: "student" | "parent"; busy: boolean }
/** The key to remember for next time, the panel to move to (null: stay), and the panel a Parent phone is told about (null: none). */
export interface Step { key: string | null; to: PScreen | null; banner: PScreen | null }

/** The Parent phone's banner: what the TV is asking for, in the words of its panel. One tap on it moves the phone. */
export const BANNER: Readonly<Record<PScreen, string>> = {
  join: "The TV is asking for the code. Type it", joined: "", capture: "The TV is asking for a photo. Take it", practice: "The TV is asking for your working. Send it",
  point: "The TV is asking for your question. Type it", say: "The TV is asking for a sentence. Say it", paste: "The TV is asking for your words. Write them",
  tonight: "", parent: "", profile: "The TV is asking for a name. Type it", linga: "The TV is asking for your answer. Say it", paper: "The TV is asking for the marks of a paper. Type them",
};

/** What the phone says on a panel that needs the camera or the microphone when it was served over http (D15; OD6 decides https on the LAN). */
export const HTTP_LIMIT = {
  camera: "This page came over http, so the phone gives no camera here. Type instead where the TV allows it, or use a sample page.",
  voice: "This page came over http, so the phone gives no microphone here. Type your words instead.",
} as const;

/**
 * The phone follows a hand-off once per ask id (prev: the last key seen; undefined: none yet, as on a reopened stream, so
 * the open ask is gone to whatever was seen before). A same-ask update is the same key, so a tab the learner picked is
 * left alone. Busy hands defer the move: the key is NOT spent, so the move comes as soon as the hands are free. The Parent
 * role is never moved and gets the banner instead. A phone arriving on the join panel never lands in the camera unasked:
 * it gets the confirmation, whose one button is Snap.
 */
export function follow(prev: string | null | undefined, s: Seen, at: At): Step {
  const cue = cueFor(s);
  const key = cue?.key ?? null;
  const banner = at.role === "parent" && s.joined && cue && cue.panel !== at.panel ? cue.panel : null;
  if (!s.joined) {
    // an unjoined phone can only join, or name a learner
    const fresh = cue?.panel === "profile" && key !== prev && at.role === "student";
    const to: PScreen | null = fresh && !at.busy ? "profile" : at.panel === "join" || at.panel === "profile" ? null : "join";
    return { key: fresh && at.busy && at.panel !== "profile" ? prev ?? null : key, to: to === at.panel ? null : to, banner: null };
  }
  let to: PScreen | null = null, spent = key;
  if (at.panel === "join") to = cue && !opensCamera(cue.panel, s) ? cue.panel : "joined"; // the code is typed and done: arrival
  else if (cue && key !== prev && at.role === "student") {
    if (!at.busy || cue.panel === at.panel) to = cue.panel;
    else spent = prev ?? null; // busy hands: the move waits, unspent
  } else if (cue && at.role === "parent") spent = prev ?? null; // a Parent phone is told, not moved; the ask stays unspent
  return { key: spent, to: to === at.panel ? null : to, banner };
}

/** How a code reached the join: typed on the panel, or carried by the TV's QR. */
export type JoinHow = "typed" | "qr";
/** The route's own texts (lib/session/pairing.ts WRONG_CODE, TOO_MANY_CODES); that module reads node:crypto, so the phone page cannot import it. */
const WRONG_CODE = "That code is not on the TV.", TOO_MANY_CODES = "Too many wrong codes. Wait five minutes, then type the code again.";
const JOIN_DESK_FAULT = "The desk had a problem and did not join this phone. Type the same code again.";
const LEAVE_DESK_FAULT = "The desk had a problem and did not forget this phone. It is still paired: try again.";

/**
 * What a refused join shows. A quiet join (the QR's) is quiet only about the shake: every refusal says why. status is
 * undefined when no answer came. forget is true for a QR code the TV does not know (the code turns over after each join,
 * and a reset gives the TV a new one); a cooldown or a lost connection says nothing about the code, so it is kept.
 */
export function joinRefusal(r: { status: number | undefined; error: string | undefined; how: JoinHow }): { line: string; shake: boolean; forget: boolean } {
  const shake = r.how === "typed";
  if (r.status === undefined) return { line: "That did not reach the desk.", shake, forget: false };
  // the desk failed (a write it could not make): not a wrong code, so no shake, and the code is kept
  if (r.status >= 500) return { line: r.error ?? JOIN_DESK_FAULT, shake: false, forget: false };
  if (r.error === TOO_MANY_CODES) return { line: TOO_MANY_CODES, shake, forget: false };
  const wrong = r.error === undefined || r.error === WRONG_CODE;
  if (wrong) return { line: WRONG_CODE, shake, forget: r.how === "qr" };
  return { line: r.error!, shake, forget: false };
}

/**
 * The line a refused run leaves on the phone. A body that carries `failure` is a run that failed on the desk: its sentence
 * and any Try again are on the session already, so the phone says nothing more. Any other refusal - whatever its status,
 * a 502 from something that is not a run included - says its own error, or the fallback when it sent none.
 */
export function deskLine(body: { error?: unknown; failure?: unknown } | null | undefined, fallback: string): string {
  if (body?.failure !== undefined) return "";
  return typeof body?.error === "string" && body.error ? body.error : fallback;
}

/**
 * What Forget this desk shows once the desk has answered. The phone is forgotten only for a 2xx answer; no answer or a
 * refusal leaves it paired and says so (the route's own line when it sent one).
 */
export function leaveOutcome(r: { status: number | undefined; error: string | undefined }): { line: string; forgotten: boolean } {
  if (r.status === undefined) return { line: "That did not reach the desk.", forgotten: false };
  if (r.status >= 200 && r.status < 300) return { line: "This phone will ask for the code next time.", forgotten: true };
  return { line: r.error ?? LEAVE_DESK_FAULT, forgotten: false };
}
