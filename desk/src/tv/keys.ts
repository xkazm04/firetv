/**
 * The TV's D-pad, as data. `keyOf` turns a keyboard key into a remote button; `tvKey` turns a
 * button on a session into a Step - the session events to post in order, the calls to fire, and a
 * patch for the TV's own local state - without touching anything. `runStep` is the executor
 * app/tv/page.tsx hands its post/call/setState to. Every screen with focus stops reads its stop
 * list from here, so the screen that draws `data-focused` and the key that moves it share one list.
 * Types only from the store: the TV never loads the filesystem-backed session modules.
 */
import type { Event, Profile, Screen, Session, Subject } from "@/lib/session/store";
import { LESSONS, ESSAY_TYPES, type Lesson } from "@/lib/library/lessons.data";
import { SYLLABUS, type Topic } from "@/lib/library/syllabus";
import { profileRows, locate, flat } from "@/tv/profileRows";
import { continueCard } from "@/tv/mathsRows";

/** The remote's buttons. The keyboard stands in for it on the bench. */
export type Key = "up" | "down" | "left" | "right" | "select" | "back" | "menu" | "play";
const KEYBOARD = new Map<string, Key>([
  ["ArrowUp", "up"], ["ArrowDown", "down"], ["ArrowLeft", "left"], ["ArrowRight", "right"], ["Enter", "select"],
  ["Backspace", "back"], ["Escape", "back"], ["m", "menu"], ["M", "menu"], [" ", "play"],
]);
export function keyOf(k: string): Key | null { return KEYBOARD.get(k) ?? null; }

/** What the TV holds for itself, outside the session: the practice wait, the forensic table, a hint on its way. */
export interface Local { busy: boolean; table: boolean; hintInFlight: boolean }
export const LOCAL: Local = { busy: false, table: false, hintInFlight: false };
/** A POST the key fires after its events. `onFail` is applied on a non-ok answer or a network error, `onDone` on an ok one. */
export interface Call { url: string; body: Record<string, unknown>; onFail?: Partial<Local>; onDone?: Partial<Local> }
export interface Step { events: Event[]; calls: Call[]; local: Partial<Local> }

/** Linga draws and drives its own screens (english/LingaTV.tsx); the TV's map stays out of them. */
export function lingaOwns(s: Session): boolean {
  return s.screen.startsWith("linga") || (s.screen === "tonight" && s.subject === "english");
}

// ---- the stop lists: one per screen, drawn by screens.tsx and walked by tvKey ----
const clampIx = (n: number, f: number) => Math.max(0, Math.min(n - 1, f));
/** The stop the focus is on; a focus past the end is the last stop. */
export function stopAt<T>(stops: readonly T[], f: number): T | undefined { return stops.length ? stops[clampIx(stops.length, f)] : undefined; }

/** Landing: the three modules on one row, the two actions below. */
export const LANDING_MODULES = ["maths", "english", "essay"] as const satisfies readonly Subject[];
export const LANDING_STOPS = [...LANDING_MODULES, "continue", "someone"] as const;
export type LandingStop = (typeof LANDING_STOPS)[number];
const MODULE_HOME: Record<Subject, Screen> = { maths: "tonight", english: "linga", essay: "essaytype" };

/** Math Buddy's home: the thing already open leads, then the two doors. */
export type TonightStop = "continue" | "homework" | "teach";
export function tonightStops(s: Session): TonightStop[] { return continueCard(s) ? ["continue", "homework", "teach"] : ["homework", "teach"]; }

/** Who is at the desk: every profile, then "add a learner". */
export function learnerStops(s: Session): Array<Profile | "add"> { return [...s.profiles, "add"]; }
/** The units of the module on screen; the calendar is Math Buddy's lessons on file. */
export function unitStops(s: Session): Lesson[] { return LESSONS.filter((l) => l.subject === s.subject); }
export function calendarStops(): Lesson[] { return LESSONS.filter((l) => l.subject === "maths"); }
/** The lenses, straight from the library - a 2 x 2 grid. */
export const LENS_STOPS = ESSAY_TYPES;
/** The playbook's four structures - a 2 x 2 grid. */
export const PLAYBOOK_STOPS = ["thesis", "para", "order", "concl"] as const;
export const HINT_STOPS = ["stuck", "lesson"] as const;
export const SENTENCE_STOPS = ["again", "unit"] as const;
export const RECAP_STOPS = ["send", "tonight"] as const;
export const TOPIC_STOPS: readonly Topic[] = SYLLABUS;
/** The walk has one action, on its last item. */
export function walkStops(s: Session): Array<"finish"> { const n = s.practice?.items.length ?? 0; return n && s.walkIx === n - 1 ? ["finish"] : []; }

// ---- the keymap ----
class Out implements Step {
  events: Event[] = []; calls: Call[] = []; local: Partial<Local> = {};
  constructor(private s: Session) {}
  ev(e: Event) { this.events.push(e); }
  nav(screen: Screen, focus = 0, from?: Screen) { this.ev(from ? { type: "nav", screen, focus, from } : { type: "nav", screen, focus }); }
  /** Focus to `to`, only when it moves. */
  focus(to: number) { if (to !== this.s.focus) this.ev({ type: "focus", focus: to }); }
  /** Step `delta` through `n` stops, clamped at both ends. */
  move(n: number, delta: number) { if (n > 0) this.focus(clampIx(n, this.s.focus + delta)); }
  /** Arrow keys over a grid of `n` stops, `cols` wide. */
  grid(k: Key, n: number, cols: number) {
    if (k === "right") this.move(n, 1); if (k === "left") this.move(n, -1);
    if (k === "down") this.move(n, cols); if (k === "up") this.move(n, -cols);
  }
  /** Ask for a hint unless one is already on its way: each one is a model call and counts in the log. */
  hint(local: Local, body: Record<string, unknown>) {
    if (local.hintInFlight) return;
    this.calls.push({ url: "/api/hint", body, onFail: { hintInFlight: false }, onDone: { hintInFlight: false } });
    this.local.hintInFlight = true;
  }
}
type Handler = (s: Session, k: Key, local: Local, o: Out) => void;
const lessonEvent = (l: Lesson, why: string): Event => ({ type: "lesson.set", lesson: { id: l.id, title: l.title, t: 0, text: l.concepts.join(" · "), why, youtube: l.youtube } });

const KEYMAP: Partial<Record<Screen, Handler>> = {
  landing: (s, k, _, o) => {
    const at = stopAt(LANDING_STOPS, s.focus)!;
    if (at === "maths" || at === "english" || at === "essay") {
      if (k === "right") o.move(LANDING_MODULES.length, 1); if (k === "left") o.move(LANDING_MODULES.length, -1);
      if (k === "down") o.focus(LANDING_STOPS.indexOf("continue"));
      if (k === "select") { o.ev({ type: "subject", subject: at }); o.nav(MODULE_HOME[at]); }
    } else {
      if (k === "right") o.focus(LANDING_STOPS.indexOf("someone")); if (k === "left") o.focus(LANDING_STOPS.indexOf("continue"));
      if (k === "up") o.focus(0);
      if (k === "select") { if (at === "continue") o.nav("tonight"); else o.nav("learner", 0, "landing"); }
    }
  },
  pair: (s, k, _, o) => { if (k === "back") o.nav(s.back ?? "landing"); },
  joined: (_, k, __, o) => { if (k === "select" || k === "back") o.nav("tonight"); },
  tonight: (s, k, _, o) => {
    const stops = tonightStops(s), at = stopAt(stops, s.focus);
    if (k === "back") { if (s.awaiting) o.ev({ type: "page.unask" }); else o.nav("landing"); return; }
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "up") o.nav("learner", 0, "tonight");
    if (k === "down" && !s.joined) o.nav("pair", 0, "tonight");
    if (k !== "select") return;
    o.ev({ type: "subject", subject: "maths" });
    const cont = at === "continue" ? continueCard(s) : null;
    if (cont) {
      if (cont.go === "page") { o.ev({ type: "page.select", pageIx: cont.pageIx }); o.nav("page"); }
      else o.nav(cont.go);
    } else if (at === "teach") o.nav("topics");
    else { const pi = s.pages.findIndex((p) => p.subject === "maths");
      if (pi >= 0) { o.ev({ type: "page.select", pageIx: pi }); o.nav("page"); } else o.ev({ type: "page.ask", subject: "maths" }); }
  },
  learner: (s, k, _, o) => {
    const stops = learnerStops(s), at = stopAt(stops, s.focus);
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "back") o.nav(s.back ?? "landing");
    if (k === "select") { if (at && at !== "add") o.ev({ type: "learner.set", id: at.id }); else { o.ev({ type: "profile.draft", patch: {} }); o.nav("profile"); } }
    if (k === "menu" && at && at !== "add") { o.ev({ type: "profile.draft", patch: { id: at.id, name: at.name, type: at.type, age: at.age, system: at.system, modules: at.modules } }); o.nav("profile"); }
  },
  profile: (s, k, _, o) => {
    // rows of picks (type, age when a school type, school system, interests, actions); Up/Down keep the column
    const rows = profileRows(s.draft), at = locate(rows, s.focus), cell = rows[at.r].cells[at.c];
    if (k === "right") o.focus(flat(rows, at.r, at.c + 1)); if (k === "left") o.focus(flat(rows, at.r, at.c - 1));
    if (k === "down" && at.r < rows.length - 1) o.focus(flat(rows, at.r + 1, at.c)); if (k === "up" && at.r > 0) o.focus(flat(rows, at.r - 1, at.c));
    if (k === "select") {
      if (cell.kind === "type" && cell.type) o.ev({ type: "profile.draft", patch: { type: cell.type } });
      else if (cell.kind === "age") o.ev({ type: "profile.draft", patch: { age: cell.age } });
      else if (cell.kind === "system" && cell.system) o.ev({ type: "profile.draft", patch: { system: cell.system } });
      else if (cell.kind === "interest" && cell.sub) { const m = cell.sub, on = s.draft?.modules ?? []; o.ev({ type: "profile.draft", patch: { modules: on.includes(m) ? on.filter((x) => x !== m) : [...on, m] } }); }
      else if (cell.kind === "save") o.ev({ type: "profile.save" }); else o.ev({ type: "profile.discard" });
    }
    if (k === "menu" && !s.joined) o.nav("pair", 0, "profile");
    if (k === "back") o.ev({ type: "profile.discard" });
  },
  units: (s, k, _, o) => {
    const stops = unitStops(s);
    if (k === "down") o.move(stops.length, 1); if (k === "up") o.move(stops.length, -1);
    if (k === "select") { const l = stopAt(stops, s.focus); if (l) { o.ev(lessonEvent(l, `Unit ${l.unit}, chosen by you.`)); o.nav("lesson"); } }
    if (k === "menu") o.nav(s.subject === "maths" ? "calendar" : s.subject === "english" ? "headtohead" : "playbook");
    if (k === "back" || k === "left") o.nav("tonight");
  },
  calendar: (s, k, _, o) => {
    const stops = calendarStops();
    o.grid(k, stops.length, 3);
    if (k === "select") { const l = stopAt(stops, s.focus); if (l) { o.ev(lessonEvent(l, `Unit ${l.unit}.`)); o.nav("lesson"); } }
    if (k === "back") o.nav("units");
  },
  page: (s, k, local, o) => {
    const p = s.pages[s.pageIx]; if (!p) { if (k === "back") o.nav("tonight"); return; }
    if (s.reading) return;
    if (k === "down") o.ev({ type: "item", itemIx: Math.min(p.items.length - 1, s.itemIx + 1) });
    if (k === "up") o.ev({ type: "item", itemIx: Math.max(0, s.itemIx - 1) });
    if (k === "right" && s.pageIx < s.pages.length - 1) o.ev({ type: "page.select", pageIx: s.pageIx + 1 });
    if (k === "left") { if (s.pageIx > 0) o.ev({ type: "page.select", pageIx: s.pageIx - 1 }); else o.nav("tonight"); }
    if (k === "menu") o.ev({ type: "view", view: s.view === "band" ? "overview" : "band" });
    if (k === "select" && p.items[s.itemIx]) o.hint(local, {});
    if (k === "back") o.nav("tonight");
  },
  hint: (s, k, local, o) => {
    const at = stopAt(HINT_STOPS, s.focus);
    if (k === "left") o.move(HINT_STOPS.length, -1); if (k === "right") o.move(HINT_STOPS.length, 1);
    if (k === "select") { if (at === "stuck" && s.hint?.stage === 1) o.hint(local, { stage: 2 }); if (at === "lesson" && s.lesson) o.nav("lesson"); }
    if (k === "back") o.nav("page");
  },
  lesson: (s, k, _, o) => {
    if (k === "play") o.ev({ type: "lesson.pause", paused: !s.lessonPaused });
    if (k === "back") o.nav(s.hint ? "hint" : "units", 1);
    if (k === "menu") o.nav(s.subject === "english" ? "headtohead" : s.subject === "essay" ? "xray" : "calendar");
  },
  sentence: (s, k, _, o) => {
    const at = stopAt(SENTENCE_STOPS, s.focus);
    if (k === "left") o.move(SENTENCE_STOPS.length, -1); if (k === "right") o.move(SENTENCE_STOPS.length, 1);
    if (k === "select" && at === "unit") o.nav("headtohead");
    if (k === "select" && at === "again") o.ev({ type: "status", text: "say or type another sentence on the phone" });
    if (k === "back") o.nav("units");
  },
  headtohead: (s, k, _, o) => { if (k === "back") o.nav(s.english ? "sentence" : "units"); },
  essaytype: (s, k, _, o) => {
    o.grid(k, LENS_STOPS.length, 2);
    if (k === "select") { const t = stopAt(LENS_STOPS, s.focus)!.id; o.ev({ type: "essay.type", essayType: t }); o.ev({ type: "status", text: `${t} lens chosen — paste or dictate the paragraph on the phone` }); }
    if (k === "menu") o.nav("playbook"); if (k === "back") o.nav("tonight");
  },
  forensic: (_, k, local, o) => { if (k === "menu") o.local.table = !local.table; if (k === "select") o.nav("playbook"); if (k === "back") o.nav("essaytype"); },
  playbook: (s, k, _, o) => { o.grid(k, PLAYBOOK_STOPS.length, 2); if (k === "select") o.nav("xray"); if (k === "back") o.nav(s.essay ? "forensic" : "essaytype"); },
  xray: (_, k, __, o) => { if (k === "back") o.nav("playbook"); },
  break: (_, k, __, o) => { if (k === "select") o.ev({ type: "timer.skipbreak" }); },
  topics: (s, k, local, o) => {
    if (k === "right") o.move(TOPIC_STOPS.length, 1); if (k === "left") o.move(TOPIC_STOPS.length, -1);
    // nothing is locked here: Select starts whatever is focused. Menu and Up go home, where the path lives.
    if (k === "up" || k === "menu") o.nav("tonight");
    if (k === "select" && !local.busy) { const t = stopAt(TOPIC_STOPS, s.focus); if (t) {
      o.ev({ type: "topic.open", topic: t.id });
      // the set arrives as practice.set over the session stream; a failed call gives Select back
      o.calls.push({ url: "/api/practice", body: { topic: t.id }, onFail: { busy: false } });
      o.local.busy = true;
    } }
    if (k === "back") o.nav("tonight");
  },
  practice: (_, k, __, o) => { if (k === "back") { o.ev({ type: "practice.clear" }); o.nav("topics"); } },
  walk: (s, k, _, o) => {
    if (k === "right") o.ev({ type: "walk", ix: s.walkIx + 1 });
    if (k === "left") o.ev({ type: "walk", ix: s.walkIx - 1 });
    if (k === "select" && stopAt(walkStops(s), s.focus) === "finish") o.ev({ type: "practice.clear" });
    if (k === "back") o.ev({ type: "practice.clear" });
  },
  recap: (s, k, _, o) => {
    const at = stopAt(RECAP_STOPS, s.focus);
    if (k === "left") o.move(RECAP_STOPS.length, -1); if (k === "right") o.move(RECAP_STOPS.length, 1);
    if (k === "select" && at === "send") o.ev({ type: "status", text: "recap sent to the parent's phone" });
    if ((k === "select" && at === "tonight") || k === "back") o.nav("tonight");
  },
};

/**
 * One button on one session -> what to do. Pure: it reads `s` and `local` and returns the events
 * to post in order, the calls to fire after them, and a patch for `local` to apply at once.
 * Under Linga (lingaOwns) it returns an empty step - LingaTV owns those keys.
 */
export function tvKey(s: Session, key: Key, local: Local = LOCAL): Step {
  const o = new Out(s);
  if (lingaOwns(s)) return { events: [], calls: [], local: {} };
  // Play/Pause is the clock everywhere the clock is on screen; only the lesson keeps it for the video.
  if (key === "play" && s.screen !== "lesson") o.ev({ type: s.timer.running ? "timer.pause" : "timer.start" });
  else KEYMAP[s.screen]?.(s, key, local, o);
  return { events: o.events, calls: o.calls, local: o.local };
}

/** The effects tvKey leaves to its caller. */
export interface Io { post: (e: Event) => Promise<unknown>; call: (url: string, body: unknown) => Promise<{ ok: boolean }>; apply: (patch: Partial<Local>) => void }
/**
 * Run a step: apply its local patch at once (so a second press already sees it), post the events
 * one after another (the store sees them in order), then fire the calls. A call that answers
 * non-ok or throws applies its onFail; an ok one applies its onDone. Events that fail to post
 * cancel the calls and apply every onFail.
 */
export async function runStep(step: Step, io: Io): Promise<void> {
  if (Object.keys(step.local).length) io.apply(step.local);
  try { for (const e of step.events) await io.post(e); }
  catch { for (const c of step.calls) if (c.onFail) io.apply(c.onFail); return; }
  await Promise.all(step.calls.map(async (c) => {
    let ok = false;
    try { ok = (await io.call(c.url, c.body)).ok; } catch { ok = false; }
    const patch = ok ? c.onDone : c.onFail;
    if (patch) io.apply(patch);
  }));
}
