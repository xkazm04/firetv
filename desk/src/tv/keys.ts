/**
 * The TV's D-pad, as data. `keyOf` turns a keyboard key into a remote button; `tvKey` turns a
 * button on a session into a Step - the session events to post in order, the calls to fire, and a
 * patch for the TV's own local state - without touching anything. `runStep` is the executor
 * app/tv/page.tsx hands its post/call/setState to. Every screen with focus stops reads its stop
 * list from here, so the screen that draws `data-focused` and the key that moves it share one list.
 * Types only from the store: the TV never loads the filesystem-backed session modules.
 */
import type { Event, JobKind, Profile, Screen, Session, Subject } from "@/lib/session/store";
import { LESSONS, ESSAY_TYPES, PLAYBOOK, playFor, type Lesson } from "@/lib/library/lessons.data";
import { SYLLABUS, type Topic } from "@/lib/library/syllabus";
import { profileRows, locate, flat } from "@/tv/profileRows";
import { continueCard } from "@/tv/mathsRows";
import { sheetStops, firstToLook, tileOf } from "@/tv/sheetRows";
import { landingAt, landingFocus, landingModules, landingStops, continueStop } from "@/tv/landingRows";

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

/** Essay Master draws its own screens (essay/EssayTV.tsx, the Specimen design); the On Air shell steps aside for them. */
export const ESSAY_SCREENS = ["essaytype", "forensic", "playbook", "xray"] as const satisfies readonly Screen[];
export function essayOwns(s: Session): boolean { return (ESSAY_SCREENS as readonly Screen[]).includes(s.screen); }

/** Linga draws and drives its own screens (english/LingaTV.tsx); the TV's map stays out of them. */
export function lingaOwns(s: Session): boolean {
  return s.screen.startsWith("linga") || (s.screen === "tonight" && s.subject === "english");
}

/** Math Buddy's own screens, whatever the subject says: its home and the practice loop, and the calendar of its lessons. */
export const MATHS_SCREENS = ["tonight", "topics", "practice", "sheet", "walk", "calendar"] as const satisfies readonly Screen[];
/**
 * Math Buddy draws its screens (maths/MathsTV.tsx, the Lamplight design): its own, and the screens it shares
 * with the other modules while maths is what is on them - a maths page and its hint, the maths units and lesson.
 * Linga's Tonight stays Linga's. The keymap is the same either way; only who draws the screen changes.
 */
export function mathsOwns(s: Session): boolean {
  if (lingaOwns(s)) return false;
  if ((MATHS_SCREENS as readonly Screen[]).includes(s.screen)) return true;
  if (s.screen === "page" || s.screen === "hint") return (s.pages[s.pageIx]?.subject ?? s.subject) === "maths";
  if (s.screen === "units" || s.screen === "lesson") return s.subject === "maths";
  return false;
}

// ---- the stop lists: one per screen, drawn by the module screens and walked by tvKey ----
const clampIx = (n: number, f: number) => Math.max(0, Math.min(n - 1, f));
/** The stop the focus is on; a focus past the end is the last stop. */
export function stopAt<T>(stops: readonly T[], f: number): T | undefined { return stops.length ? stops[clampIx(stops.length, f)] : undefined; }

/**
 * Landing: the desk (tv/landingRows.ts). The apps on the learner's profile lie in a row, the place card above
 * them, the unpaired phone below right. There is no Continue button: the lamp rests on the app with something
 * waiting (focus LANDING_REST), and Select on the place card is "someone else".
 */
export { LANDING_MODULES, LANDING_REST, landingStops, landingFocus, landingAt, type LandingStop } from "@/tv/landingRows";
export const MODULE_HOME: Record<Subject, Screen> = { maths: "tonight", english: "linga", essay: "essaytype" };

/** Math Buddy's home: the thing already open leads, then the two doors. */
export type TonightStop = "continue" | "homework" | "teach";
export function tonightStops(s: Session): TonightStop[] { return continueCard(s) ? ["continue", "homework", "teach"] : ["homework", "teach"]; }

/** Who is at the desk: every profile, then "add a learner". */
export function learnerStops(s: Session): Array<Profile | "add"> { return [...s.profiles, "add"]; }
/** The units of the module on screen; the calendar is Math Buddy's lessons on file. */
export function unitStops(s: Session): Lesson[] { return LESSONS.filter((l) => l.subject === s.subject); }
export function calendarStops(): Lesson[] { return LESSONS.filter((l) => l.subject === "maths"); }
/** The lenses, straight from the library, top to bottom. */
export const LENS_STOPS = ESSAY_TYPES;
/** Essay Master's home: the four lenses, then the last paragraph's card (Right) when a paragraph has been read. */
export type LensStop = (typeof ESSAY_TYPES)[number] | "last";
export function lensStops(s: Session): LensStop[] { return s.essay ? [...LENS_STOPS, "last"] : [...LENS_STOPS]; }
/** The lens the paragraph on the desk was read through, as a stop; the first lens when there is none. */
export function readingLens(s: Session): number { return Math.max(0, LENS_STOPS.findIndex((t) => t.id === s.essay?.type)); }
/** The playbook's four structures, straight from the library, top to bottom. */
export const PLAYBOOK_STOPS = PLAYBOOK;
/**
 * The forensic page: its actions run Left/Right along the bottom; Up/Down walk the paragraph's sentences
 * instead (the essay.at event), so the page is always about one sentence and one action is focused.
 */
export const FORENSIC_STOPS = ["rewrite", "why", "next", "back"] as const;
/** The sentence the forensic page is about, as an index: the one walked to, else the first faulty one, else the first. */
export function forensicAt(s: Session): number {
  const a = s.essay; if (!a?.sentences.length) return 0;
  const chosen = s.essayAt == null ? -1 : a.sentences.findIndex((x) => x.n === s.essayAt);
  if (chosen >= 0) return chosen;
  const faulty = new Set(a.verdicts.filter((v) => v.verdict === "faulty").map((v) => v.n));
  return Math.max(0, a.sentences.findIndex((x) => faulty.has(x.n)));
}
/** What Rewrite on my phone puts on the status line; the page inks the move while it is the status. */
export const rewriteStatus = (n: number) => `sentence ${n}: rewrite it in your own words on the phone's Essay tab, then analyse again`;
export const HINT_STOPS = ["stuck", "lesson"] as const;
export const SENTENCE_STOPS = ["again", "unit"] as const;
export const RECAP_STOPS = ["send", "tonight"] as const;
export const TOPIC_STOPS: readonly Topic[] = SYLLABUS;
/** The walk has one action, on its last item: back to the sheet. */
export function walkStops(s: Session): Array<"sheet"> { const n = s.practice?.items.length ?? 0; return n && s.walkIx === n - 1 ? ["sheet"] : []; }

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
  /**
   * Ask for a practice set on a topic, unless one is already being written (here, or as a running
   * job). Topics and the sheet's "Six more" both come here; the set arrives as practice.set over the
   * session stream, and a failed call gives Select back.
   */
  set(local: Local, topic: string) {
    if (local.busy || running(this.s, "practice")) return;
    this.ev({ type: "topic.open", topic });
    this.calls.push({ url: "/api/practice", body: { topic }, onFail: { busy: false } });
    this.local.busy = true;
  }
  /** Ask for a hint unless one is already on its way (here, or as a running job): each one is a model call and counts in the log. */
  hint(local: Local, body: Record<string, unknown>) {
    if (local.hintInFlight || running(this.s, "hint")) return;
    this.calls.push({ url: "/api/hint", body, onFail: { hintInFlight: false }, onDone: { hintInFlight: false } });
    this.local.hintInFlight = true;
  }
}
type Handler = (s: Session, k: Key, local: Local, o: Out) => void;
/** A pipeline of this kind is under way on the desk (store.ts `jobs`), whoever asked for it. */
export function running(s: Session, kind: JobKind): boolean { return s.jobs?.[kind]?.phase === "running"; }
/** The practice set for this topic failed: the Topics caption says so, and Select asks again. */
export function practiceFailed(s: Session, topicId: string | undefined): string | null {
  const j = s.jobs?.practice;
  return j?.phase === "failed" && j.key === topicId ? j.error ?? null : null;
}
const lessonEvent = (l: Lesson, why: string): Event => ({ type: "lesson.set", lesson: { id: l.id, title: l.title, t: 0, text: l.concepts.join(" · "), why, youtube: l.youtube } });

const KEYMAP: Partial<Record<Screen, Handler>> = {
  // the lamp moves between the objects on the desk: Left/Right along the apps, Up to the place card, Down to an unpaired phone
  landing: (s, k, _, o) => {
    const stops = landingStops(s), i = landingAt(s), at = stops[i], apps = landingModules(s).length;
    const to = (j: number) => { if (j >= 0 && j !== s.focus) o.ev({ type: "focus", focus: j }); };
    if (k === "back") { const c = continueStop(s); to(c ? stops.indexOf(c.app) : stops.indexOf("place")); return; }
    if (at === "place") {
      if (k === "down" && apps) to(Math.floor((apps - 1) / 2));
      if (k === "select") o.nav("learner", 0, "landing");
    } else if (at === "phone") {
      if (k === "up" || k === "left") to(apps ? apps - 1 : stops.indexOf("place"));
      if (k === "select") o.nav("pair", 0, "landing");
    } else if (at) {
      if (k === "right" && i < apps - 1) to(i + 1); if (k === "left" && i > 0) to(i - 1);
      if (k === "up") to(stops.indexOf("place"));
      if (k === "down") to(stops.indexOf("phone"));
      if (k === "select") { o.ev({ type: "subject", subject: at }); o.nav(MODULE_HOME[at]); }
    }
  },
  pair: (s, k, _, o) => { if (k === "back") { const to = s.back ?? "landing"; o.nav(to, to === "landing" ? landingFocus(s, "phone") : 0); } },
  joined: (_, k, __, o) => { if (k === "select" || k === "back") o.nav("tonight"); },
  tonight: (s, k, _, o) => {
    const stops = tonightStops(s), at = stopAt(stops, s.focus);
    if (k === "back") { if (s.awaiting) o.ev({ type: "page.unask" }); else o.nav("landing", landingFocus(s, "maths")); return; }
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "up") o.nav("learner", 0, "tonight");
    if (k === "down" && !s.joined) o.nav("pair", 0, "tonight");
    if (k !== "select") return;
    o.ev({ type: "subject", subject: "maths" });
    const cont = at === "continue" ? continueCard(s) : null;
    if (cont) {
      if (cont.go === "page") { o.ev({ type: "page.select", pageIx: cont.pageIx }); o.nav("page"); }
      else o.nav(cont.go, cont.focus);
    } else if (at === "teach") o.nav("topics");
    else { const pi = s.pages.findIndex((p) => p.subject === "maths");
      if (pi >= 0) { o.ev({ type: "page.select", pageIx: pi }); o.nav("page"); } else o.ev({ type: "page.ask", subject: "maths" }); }
  },
  learner: (s, k, _, o) => {
    const stops = learnerStops(s), at = stopAt(stops, s.focus);
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "back") { const to = s.back ?? "landing"; o.nav(to, to === "landing" ? landingFocus(s, "place") : 0); }
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
  // the lenses top to bottom; Right reaches the last paragraph's card, Select there opens its reading
  essaytype: (s, k, _, o) => {
    const stops = lensStops(s), at = stopAt(stops, s.focus);
    if (at === "last") {
      if (k === "left") o.focus(readingLens(s));
      if (k === "select") { o.ev({ type: "essay.at", n: null }); o.nav("forensic"); }
    } else {
      if (k === "down") o.move(LENS_STOPS.length, 1); if (k === "up") o.move(LENS_STOPS.length, -1);
      if (k === "right" && stops.includes("last")) o.focus(stops.indexOf("last"));
      if (k === "select" && at) { o.ev({ type: "essay.type", essayType: at.id }); o.ev({ type: "status", text: `${at.id} lens chosen — paste or dictate the paragraph on the phone` }); }
    }
    if (k === "menu") o.nav("playbook", 0, "essaytype");
    if (k === "back") o.nav("landing", landingFocus(s, "essay"));
  },
  // one sentence at a time: Up/Down walk the paragraph, Left/Right the actions; Menu is the table, where Up/Down still walk
  forensic: (s, k, local, o) => {
    if (k === "menu") { o.local.table = !local.table; return; }
    if (k === "back") { if (local.table) o.local.table = false; else o.nav("essaytype", readingLens(s)); return; }
    const a = s.essay; if (!a?.sentences.length) return;
    const i = forensicAt(s), n = a.sentences.length;
    const go = (j: number) => { if (j !== i) o.ev({ type: "essay.at", n: a.sentences[j].n }); };
    if (k === "down") go(Math.min(n - 1, i + 1)); if (k === "up") go(Math.max(0, i - 1));
    if (local.table) { if (k === "select") o.local.table = false; return; }
    if (k === "right") o.move(FORENSIC_STOPS.length, 1); if (k === "left") o.move(FORENSIC_STOPS.length, -1);
    if (k !== "select") return;
    const at = stopAt(FORENSIC_STOPS, s.focus);
    if (at === "rewrite") o.ev({ type: "status", text: rewriteStatus(a.sentences[i].n) });
    if (at === "why") o.nav("playbook", PLAYBOOK_STOPS.indexOf(playFor(a.type)), "forensic");
    if (at === "next") go((i + 1) % n);
    if (at === "back") o.nav("essaytype", readingLens(s));
  },
  // the four structures top to bottom; Back (or Menu) returns to where the playbook was opened from
  playbook: (s, k, _, o) => {
    if (k === "down") o.move(PLAYBOOK_STOPS.length, 1); if (k === "up") o.move(PLAYBOOK_STOPS.length, -1);
    if (k === "select") o.nav("xray", s.focus);
    if (k === "back" || k === "menu") { if (s.back === "forensic" && s.essay) o.nav("forensic", FORENSIC_STOPS.indexOf("why")); else o.nav("essaytype", s.essay ? readingLens(s) : 0); }
  },
  xray: (s, k, __, o) => { if (k === "back" || k === "menu") o.nav("playbook", s.focus); },
  break: (_, k, __, o) => { if (k === "select") o.ev({ type: "timer.skipbreak" }); },
  topics: (s, k, local, o) => {
    if (k === "right") o.move(TOPIC_STOPS.length, 1); if (k === "left") o.move(TOPIC_STOPS.length, -1);
    // nothing is locked here: Select starts whatever is focused. Menu and Up go home, where the path lives.
    if (k === "up" || k === "menu") o.nav("tonight");
    if (k === "select") { const t = stopAt(TOPIC_STOPS, s.focus); if (t) o.set(local, t.id); }
    if (k === "back") o.nav("tonight");
  },
  // the set on paper is parked, not thrown away: Tonight's continue card puts it back
  practice: (_, k, __, o) => { if (k === "back") o.nav("tonight"); },
  // the marked set as one picture: the tiles on one row, the two actions below
  sheet: (s, k, local, o) => {
    const p = s.practice; if (!p) { if (k === "back") o.nav("tonight"); return; }
    const stops = sheetStops(p), at = stopAt(stops, s.focus), tile = tileOf(at), n = p.items.length;
    if (tile !== null) {
      if (k === "right") o.move(n, 1); if (k === "left") o.move(n, -1);
      if (k === "down") o.focus(stops.indexOf("more"));
      if (k === "select") { o.ev({ type: "walk", ix: tile }); o.nav("walk"); }
    } else {
      if (k === "right") o.focus(stops.indexOf("away")); if (k === "left") o.focus(stops.indexOf("more"));
      if (k === "up") o.focus(Math.min(firstToLook(p.items), n - 1));
      if (k === "select" && at === "more") o.set(local, p.topic);
      if (k === "select" && at === "away") o.ev({ type: "practice.clear" });
    }
    if (k === "back") o.nav("tonight");
  },
  // one item at a time; leaving it goes back to the sheet at that item, never clears the set
  walk: (s, k, _, o) => {
    if (k === "right") o.ev({ type: "walk", ix: s.walkIx + 1 });
    if (k === "left") o.ev({ type: "walk", ix: s.walkIx - 1 });
    if ((k === "select" && stopAt(walkStops(s), s.focus) === "sheet") || k === "back") o.nav("sheet", s.walkIx);
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
