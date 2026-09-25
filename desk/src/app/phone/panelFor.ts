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
export type PScreen = "join" | "joined" | "capture" | "practice" | "point" | "say" | "paste" | "tonight" | "parent" | "profile" | "linga";

type Seen = Pick<Session, "joined" | "screen" | "subject" | "awaiting" | "practice" | "pages" | "pageIx" | "jobs">;

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
    case "tonight": return s.awaiting ? { panel: "capture", key: `tonight:${s.awaiting}` } : null;
    // "snap the whole sheet with the phone"
    case "practice": return { panel: "practice", key: sc };
    // "Tell the desk on the phone how you got there": the marked set and its walk are one hand-off
    case "sheet": case "walk": return { panel: "practice", key: "sheet" };
    // "The desk could not read this page. Snap it again on the phone"
    case "page": {
      const p = s.pages[s.pageIx], read = s.jobs?.read;
      return p && read?.phase === "failed" && read.key === p.id ? { panel: "capture", key: `page:unread:${p.id}` } : null;
    }
    // "Paste, type or dictate one paragraph on the phone" / "Rewrite on my phone"
    case "essaytype": case "forensic": return { panel: "paste", key: sc };
    // "circle on the phone" (a paused lesson): no phone panel circles a lesson frame, so the phone stays
    default: return null;
  }
}

/** The panel the TV's screen hands off to, or "stay" where it asks nothing of the phone. */
export const panelFor = (s: Seen): PScreen | "stay" => cueFor(s)?.panel ?? "stay";

/** A panel that turns the camera on as it opens. */
const opensCamera = (panel: PScreen, s: Seen) => panel === "capture" || (panel === "practice" && s.screen === "practice" && !s.practice?.marked);

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
