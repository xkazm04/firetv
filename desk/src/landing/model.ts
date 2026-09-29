/**
 * The landing's view-model: everything a landing theme draws, read off the session and nothing else. A theme
 * (landing/themes/) is only a look; the data, the stops the D-pad walks (tv/keys.ts, tv/landingRows.ts), the
 * honesty rules and the words are decided here, once, so every theme shows the same truth:
 *
 *  - only the apps on the profile at the desk lie on the shelf, in the desk's order;
 *  - what each app has waiting is the session's (tv/landingRows.ts), never invented; an app with nothing says so;
 *  - the caption is about 25 words for the focused app: a chip for when, one headline, one line under it;
 *  - the art each app draws is a state of its own (steps lit, a level, paragraphs read), taken from that waiting
 *    thing and from nothing else - decoration never names a number the desk does not have.
 *
 * Pure: no React, no DOM, so the node test suite can walk it (tools/tv-landing-test.cjs).
 */
import type { Session, Subject } from "@/lib/session/store";
import { continueStop, deskWaiting, landingAt, landingStops, type LandingStop, type Waiting, type WaitKind } from "@/tv/landingRows";
import { day } from "@/tv/day";

/** How long Select's zoom plays before the app opens (app/tv/page.tsx waits this long; reduced motion does not wait). */
export const ZOOM_MS = 560;

export const APP_NAME: Record<Subject, string> = { maths: "Math Buddy", english: "Linga", essay: "Essay Master" };

/** A state of an app's key art. `fresh`: nothing on the desk for it yet. Numbers are null until the session has them. */
export type ArtState =
  | { app: "maths"; fresh: boolean; n: number | null; m: number }
  | { app: "english"; fresh: boolean; cefr: string | null; resume: boolean; next: boolean }
  | { app: "essay"; fresh: boolean; sent: number | null; paras: number };

export type WhenIcon = "clock" | "sun" | "moon";
/** The caption for one app: a chip for when (a label, never the only carrier of meaning), a headline, one line under it. */
export interface Caption { chip: { icon: WhenIcon; text: string } | null; head: string; sub: string }

export interface AppView {
  id: Subject;
  name: string;
  kind: WaitKind;
  /** the app the CONTINUE tag is on: what the lamp rests on */
  tagged: boolean;
  caption: Caption;
  art: ArtState;
}

export interface LandingView {
  stops: LandingStop[];
  /** the stop the D-pad is on */
  at: LandingStop | undefined;
  apps: AppView[];
  /**
   * The app whose world is showing: the one the D-pad is on, else the last one it was on (the shelf, the actions and
   * the phone are not apps), else the CONTINUE app. Null only on a desk with no app on it.
   */
  world: Subject | null;
  learner: { name: string; initial: string; tone: number } | null;
  /** an unpaired phone lies on the desk as a stop (it carries the address and the code) */
  phone: { paired: boolean; pin: string; url: string };
  /** the caption slot: the app in the light, or the pairing instruction while the D-pad is on the unpaired phone */
  caption: Caption;
  /** the big action: what Select does on the app in the light; and the second: who is at the desk */
  primary: string;
  place: string;
  /** nothing on the profile's apps yet: the same words for whichever theme */
  empty: boolean;
}

const LAST_VERB: Record<Subject, string> = { maths: "Practised", english: "Talked", essay: "Read" };
const lower = (d: string) => (d === "Today" || d === "Yesterday" ? d.toLowerCase() : d);

/** When the waiting thing was, as a short label: "Marked", "Left Wednesday", "Read yesterday", "Next up". */
function chipOf(w: Waiting): Caption["chip"] {
  if (w.kind === "marked") return { icon: "clock", text: "Marked" };
  if (w.kind === "next") return { icon: "moon", text: "Next up" };
  const d = w.at && (w.kind === "last" || w.kind === "resume") ? day(w.at) : null;
  if (!d) return null;
  const text = `${w.kind === "resume" ? "Left" : LAST_VERB[w.app]} ${lower(d)}`;
  return { icon: d === "Today" || d === "Yesterday" ? "clock" : "sun", text };
}

/** The headline and the line under it: what is waiting, then where it stands. Never a made-up progress. */
export function captionOf(w: Waiting): Caption {
  const chip = chipOf(w);
  if (w.app === "maths") {
    if (w.kind === "marked") return { chip, head: `${w.title} · ${w.right} of ${w.of} right`, sub: "The marked set is still on the desk." };
    if (w.kind === "none") return { chip, head: w.empty ?? "Not started", sub: w.line };
    return { chip, head: w.title || "The sheet on the desk", sub: w.line };
  }
  if (w.app === "english") {
    if (w.kind === "none") return { chip, head: w.empty ?? "Not started", sub: w.line };
    const bits = [w.band, w.bandName, w.partner].filter(Boolean) as string[];
    return { chip, head: w.title, sub: [...bits, ...(w.midway ? ["left mid-way"] : [])].join(" · ") || w.line };
  }
  if (w.kind === "none") return { chip, head: w.empty ?? "Nothing read", sub: w.line };
  const lens = w.lensName ? `${w.lensName} lens` : "Last reading";
  return { chip, head: w.line, sub: `${lens} · ${w.read} ${w.read === 1 ? "paragraph" : "paragraphs"} read` };
}

/** The state each app's key art draws, from what is waiting. */
export function artOf(w: Waiting): ArtState {
  const fresh = w.kind === "none";
  if (w.app === "maths") {
    // steps light only for a marked set (right of asked); a set still open or a snapped page has no count yet
    const marked = w.kind === "marked" && w.right != null && w.of != null;
    return { app: "maths", fresh, n: marked ? w.right : null, m: marked ? Math.max(1, Math.min(8, w.of!)) : 6 };
  }
  if (w.app === "english") return { app: "english", fresh, cefr: w.band, resume: w.kind === "resume", next: w.kind === "next" };
  const against = w.rail?.find((a) => a.against)?.n ?? null;
  return { app: "essay", fresh, sent: against != null && against <= 6 ? against : null, paras: Math.max(0, Math.min(5, w.read)) };
}

const TONES = 4;
/** The learner's initial on a disc: a colour by their place in the profiles, so the same person is the same colour. */
function learnerOf(s: Session): LandingView["learner"] {
  if (!s.learner) return null;
  const i = Math.max(0, s.profiles.findIndex((p) => p.id === s.learner?.id));
  return { name: s.learner.name, initial: s.learner.name.trim().charAt(0).toUpperCase() || "?", tone: i % TONES };
}

/** What Select on the app in the light does, in words: "Continue as Ema" with something waiting, "Start as Ema" without. */
export function primaryLabel(name: string | null, kind: WaitKind | null): string {
  if (!name) return "Choose who is studying";
  return kind === "none" ? `Start as ${name}` : `Continue as ${name}`;
}

/**
 * The view for a session. `lastApp` is the app the D-pad was last on (the landing keeps it between renders, so
 * moving down to Someone else does not change the world behind).
 */
export function landingView(s: Session, lastApp: Subject | null = null): LandingView {
  const stops = landingStops(s), at = stops[landingAt(s)];
  const waiting = deskWaiting(s), cont = continueStop(s);
  const apps: AppView[] = waiting.map((w) => ({
    id: w.app, name: APP_NAME[w.app], kind: w.kind, tagged: !!cont?.tagged && cont.app === w.app, caption: captionOf(w), art: artOf(w),
  }));
  const ids = apps.map((a) => a.id);
  const atApp = at && ids.includes(at as Subject) ? (at as Subject) : null;
  const world = atApp ?? (lastApp && ids.includes(lastApp) ? lastApp : cont?.app ?? ids[0] ?? null);
  const learner = learnerOf(s), wApp = apps.find((a) => a.id === world) ?? null;
  const caption: Caption = at === "phone" ? { chip: null, head: "Pair your phone", sub: "Open the address on your phone, then enter the four digits." }
    : wApp ? wApp.caption : { chip: null, head: "No apps yet", sub: "This profile has no apps on it. Select Someone else to change it." };
  return {
    stops, at, apps, world, learner, caption,
    phone: { paired: s.joined, pin: s.pin, url: s.phoneUrl.replace(/^https?:\/\//, "") },
    primary: primaryLabel(learner?.name ?? null, wApp?.kind ?? null),
    place: learner ? "Someone else" : "Choose who",
    empty: apps.length === 0,
  };
}
