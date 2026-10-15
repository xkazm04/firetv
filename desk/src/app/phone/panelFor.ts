/**
 * Where the phone should be. The TV derives its screen from the session; the phone derives, from the same
 * session, the panel that does what that screen asks of the phone - and goes there by itself when the TV's
 * screen CHANGES into such a hand-off. A tab the learner picked stays picked while the screen stays the same.
 * Pure; the phone page calls follow() on every session change. Tested by tools/phone-panel-test.cjs, which
 * derives the hand-off screens from the TV source and holds this mapping to them.
 */
import type { Session } from "@/lib/session/store";
import { lingaOwns } from "@/tv/keys";

/** The phone's panels. */
export type PScreen = "join" | "joined" | "capture" | "practice" | "point" | "say" | "paste" | "tonight" | "parent" | "profile" | "linga" | "paper";

type Seen = Pick<Session, "joined" | "screen" | "subject" | "awaiting" | "practice" | "pages" | "pageIx" | "jobs"> & Partial<Pick<Session, "english">>;

/** A hand-off: the panel it wants, and a key that changes only when the TV asks for something new. */
interface Cue { panel: PScreen; key: string }

/** The hand-off the TV's screen makes to the phone, or null where it asks nothing the phone can do. */
function cueFor(s: Seen): Cue | null {
  const sc = s.screen;
  // an unjoined phone is asked for the code - or, on the TV's Profile, for the new learner's name
  if (!s.joined) return sc === "profile" ? { panel: "profile", key: "profile" } : { panel: "join", key: "join" };
  // Linga is one panel that reads its own screens: moving inside Linga is not a new hand-off
  if (lingaOwns(s as Session)) return { panel: "linga", key: "linga" };
  switch (sc) {
    case "joined": return { panel: "joined", key: sc };
    case "profile": return { panel: "profile", key: sc };
    // "Waiting for the Math Buddy page. Snap it on the phone"
    // (an essay is never snapped: Essay Master takes text, so a wait for an essay page sends the phone to the Essay panel)
    case "tonight": return s.awaiting ? { panel: s.awaiting === "essay" ? "paste" : "capture", key: `tonight:${s.awaiting}` } : null;
    // "snap the whole sheet with the phone"
    case "practice": return { panel: "practice", key: sc };
    // "Tell the desk on the phone how you got there": the marked set and its walk are one hand-off
    case "sheet": case "walk": return { panel: "practice", key: "sheet" };
    // "The desk could not read this page. Press Try again on the phone": the capture panel holds that read's Try again, so the camera stays off
    case "page": {
      const p = s.pages[s.pageIx];
      return p && (readFailed(s) || (p.subject === "essay" && s.jobs?.read?.phase === "failed" && s.jobs.read.key === p.id)) ? { panel: p.subject === "essay" ? "paste" : "capture", key: `page:retry:${p.id}` } : null;
    }
    // "Paste, type or dictate one paragraph on the phone" / "Rewrite on my phone"
    case "essaytype": case "forensic": return { panel: "paste", key: sc };
    // "Type the marks of a paper you sat on the phone" (v2 M5b): the recovery list's screen, whose paper is typed on the Paper panel
    case "paper": return { panel: "paper", key: sc };
    // "Say it on the phone": one sentence per slot of the plan, written on the Essay tab
    case "essayplan": return { panel: "paste", key: sc };
    // "Say one sentence on your phone": the sentence screen with nothing to check yet (Linga's Sentence help)
    case "sentence": return s.english ? null : { panel: "say", key: "sentence:empty" };
    // "circle on the phone" (a paused lesson): no phone panel circles a lesson frame, so the phone stays
    default: return null;
  }
}

/** The panel the TV's screen hands off to, or "stay" where it asks nothing of the phone. */
export const panelFor = (s: Seen): PScreen | "stay" => cueFor(s)?.panel ?? "stay";

/** The page on the TV is one whose read failed: the phone brings Try again, not a camera. */
export const readFailed = (s: Pick<Seen, "screen" | "pages" | "pageIx" | "jobs">) => { const p = s.pages[s.pageIx], read = s.jobs?.read; return s.screen === "page" && !!p && p.subject !== "essay" && read?.phase === "failed" && read.key === p.id; };

/** A panel that turns the camera on as it opens. */
const opensCamera = (panel: PScreen, s: Seen) => (panel === "capture" && !readFailed(s)) || (panel === "practice" && s.screen === "practice" && !s.practice?.marked);

/** Where the phone is, who holds it, and whether the learner's hands are on it (typing, a shot held unsent, recording). */
export interface At { panel: PScreen; role: "student" | "parent"; busy: boolean }
/** The key to remember for next time, and the panel to move to (null: stay). */
export interface Step { key: string | null; to: PScreen | null }

/**
 * The phone follows a hand-off once, when it changes (prev: the last key seen; undefined: none yet). A same-screen
 * update is the same key, so a tab the learner picked is left alone. It never moves the Parent role, never takes a
 * panel away from busy hands - that hand-off is then spent, not replayed - and a phone arriving on the join panel
 * never lands in the camera unasked: it gets the confirmation, whose one button is Snap.
 */
export function follow(prev: string | null | undefined, s: Seen, at: At): Step {
  const cue = cueFor(s);
  const key = cue?.key ?? null;
  if (!s.joined) {
    // an unjoined phone can only join, or name a learner
    const to: PScreen | null = cue?.panel === "profile" && key !== prev && at.role === "student" && !at.busy ? "profile"
      : at.panel === "join" || at.panel === "profile" ? null : "join";
    return { key, to: to === at.panel ? null : to };
  }
  let to: PScreen | null = null;
  if (at.panel === "join") to = cue && !opensCamera(cue.panel, s) ? cue.panel : "joined"; // the code is typed and done: arrival
  else if (cue && key !== prev && at.role === "student" && !at.busy) to = cue.panel;
  return { key, to: to === at.panel ? null : to };
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
