/**
 * The TV's D-pad, as data. `keyOf` turns a keyboard key into a remote button; `tvKey` turns a
 * button on a session into a Step - the session events to post in order, the calls to fire, and a
 * patch for the TV's own local state - without touching anything. `runStep` is the executor
 * app/tv/page.tsx hands its post/call/setState to. Every screen with focus stops reads its stop
 * list from here, so the screen that draws `data-focused` and the key that moves it share one list.
 * Types only from the store: the TV never loads the filesystem-backed session modules.
 */
import { hasWorked } from "@/lib/library/worked";
import { modeOf } from "@/lib/rules/mode";
import { turnState } from "@/lib/english/turn";
import type { Ask, AskKind, EssayAnalysis, Event, JobKind, Profile, Screen, Session, Subject } from "@/lib/session/store";
import { planSlots, planText, rewriteState, rewriteUnruledLine } from "@/lib/rules/essay";
import { LESSONS, ESSAY_TYPES, PLAYBOOK, playFor, type Lesson } from "@/lib/library/lessons.data";
import { SYLLABUS, type Topic } from "@/lib/library/syllabus";
import { PATHS, frontierOn, learnerPath, topicsOf, type MathPath, type PathTopic } from "@/lib/library/paths";
import { lessonStates } from "@/lib/library/watched";
import { profileRows, locate, flat, likelyIx, AGE_RANGE } from "@/tv/profileRows";
import { continueCard, handoffOf, likeUnit, tonightsSheet } from "@/tv/mathsRows";
import { sheetStops, firstToLook, tileOf, toLookAt } from "@/tv/sheetRows";
import { LANDING_REST, essayWaiting, landingApps, landingAt, landingFocus, landingStops, restStop } from "@/tv/landingRows";
import { writingAskOf, writingPhase, writingPrompts, writingStops } from "@/tv/writingScreen";
import { recapStops, ownReading } from "@/tv/recapRows";
import { pastPathEnd, prepareStops } from "@/tv/prepareRows";
import { blockedAsk } from "@/lib/rules/pairBlock";
import { paperStopCount, paperTypeAt, paperView } from "@/tv/paperRows";

/** The remote's buttons. The keyboard stands in for it on the bench. */
export type Key = "up" | "down" | "left" | "right" | "select" | "back" | "menu" | "play";
const KEYBOARD = new Map<string, Key>([
  ["ArrowUp", "up"], ["ArrowDown", "down"], ["ArrowLeft", "left"], ["ArrowRight", "right"], ["Enter", "select"],
  ["Backspace", "back"], ["Escape", "back"], ["m", "menu"], ["M", "menu"], [" ", "play"],
  // the Fire TV remote's own names (TV-led design 5.2): Play/Pause, the menu button, and Back as the browser reports it
  ["MediaPlayPause", "play"], ["ContextMenu", "menu"], ["GoBack", "back"], ["BrowserBack", "back"],
]);
export function keyOf(k: string): Key | null { return KEYBOARD.get(k) ?? null; }

/**
 * What the TV holds for itself, outside the session: the practice wait, the forensic table, a hint on its way, and on
 * Get ready for school the question after Select on a unit (`prepareAsk`: null while the list is walked, else the lit
 * cell - -1 "See how first" (a unit with a worked lesson only), 0 "The usual", 1 "A step up"; tv/prepareRows
 * PREPARE_CHOICES, LESSON_CHOICE). `lessonFrom` says the worked lesson on screen was opened from Get ready for school,
 * so its Back goes there and not to Topics. Absent is null.
 */
export interface Local { busy: boolean; table: boolean; hintInFlight: boolean; prepareAsk?: -1 | 0 | 1 | null; lessonFrom?: "prepare" | null }
export const LOCAL: Local = { busy: false, table: false, hintInFlight: false, prepareAsk: null };
/** A POST the key fires after its events. `onFail` is applied on a non-ok answer or a network error, `onDone` on an ok one. */
export interface Call { url: string; body: Record<string, unknown>; onFail?: Partial<Local>; onDone?: Partial<Local> }
export interface Step { events: Event[]; calls: Call[]; local: Partial<Local> }

/** Essay Master draws its own screens (essay/EssayTV.tsx, the Specimen design); the On Air shell steps aside for them. */
export const ESSAY_SCREENS = ["essaytype", "essayplan", "forensic", "playbook", "xray", "workroom"] as const satisfies readonly Screen[];
export function essayOwns(s: Session): boolean { return (ESSAY_SCREENS as readonly Screen[]).includes(s.screen); }

/** Linga draws and drives its own screens (english/LingaTV.tsx); the TV's map stays out of them. */
export function lingaOwns(s: Session): boolean {
  return s.screen.startsWith("linga") || (s.screen === "tonight" && s.subject === "english");
}

/** Math Buddy's own screens, whatever the subject says: its home and the practice loop, and the calendar of its lessons. */
export const MATHS_SCREENS = ["tonight", "topics", "prepare", "practice", "sheet", "walk", "calendar", "worked"] as const satisfies readonly Screen[];
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

/**
 * The recovery from a paper (v2 M5b) is Math Buddy's, drawn by maths/MathsTV.tsx, but it is not one of `MATHS_SCREENS`
 * (that list is pinned): the TV page asks this beside `mathsOwns`.
 */
export function paperOwns(s: Pick<Session, "screen">): boolean { return s.screen === "paper"; }

/** Is the learner at the desk in Adult mode (rules/mode)? */
export function isAdultHere(s: Pick<Session, "profiles" | "learner" | "englishLearning">): boolean {
  const p = s.profiles.find((x) => x.id === s.learner?.id);
  return modeOf(p, s.englishLearning?.preferences ?? undefined) === "adult";
}
/**
 * The curtain on a kept piece (L1-helena-46-EM5-1): in Adult mode a reading of a piece the learner kept shows marks, verdicts,
 * counts and sentence numbers on the TV, never a sentence or its opening words; the words are on the PC page and the phone.
 * School and Family mode, and a paragraph that was not kept, are drawn as ever.
 */
export function curtainOn(s: Pick<Session, "profiles" | "learner" | "englishLearning" | "essay">): boolean {
  return !!s.essay?.piece?.pieceId && isAdultHere(s);
}
/** The Workroom's stops: each piece, top to bottom, then the one action. */
export function workroomStops(s: Pick<Session, "workroom">): (string)[] { return [...(s.workroom?.pieces ?? []).map((p) => p.id), "lenses"]; }

/** The worked lesson's actions, left to right (v2 M1). */
export const WORKED_STOPS = ["try", "back"] as const;

// ---- the stop lists: one per screen, drawn by the module screens and walked by tvKey ----
const clampIx = (n: number, f: number) => Math.max(0, Math.min(n - 1, f));
/** The stop the focus is on; a focus past the end is the last stop. */
export function stopAt<T>(stops: readonly T[], f: number): T | undefined { return stops.length ? stops[clampIx(stops.length, f)] : undefined; }

/**
 * Landing: the desk (tv/landingRows.ts; landing/themes/ draws it). The apps on the learner's profile lie in a row on
 * the shelf, the unpaired phone above them (top right), "Someone else" (the place) below them (bottom right). The
 * big "Continue as ..." button is not a stop of its own: it names what Select does on the app in the light. The lamp
 * rests on the app with something waiting (focus LANDING_REST), and Select on the place is "someone else".
 */
export { LANDING_MODULES, LANDING_REST, landingStops, landingFocus, landingAt, restStop, type LandingStop } from "@/tv/landingRows";
export const MODULE_HOME: Record<Subject, Screen> = { maths: "tonight", english: "linga", essay: "essaytype" };

/**
 * Math Buddy's home: the thing already open leads, then the doors - I have homework (help in school, during), Teach me
 * something (home: the ruler) and, for a learner on a school path, Get ready for school (help in school, before; Family
 * W8). A learner on a course (Calculus 1) keeps the two doors exactly as before.
 */
export type TonightStop = "continue" | "homework" | "teach" | "prepare";
export function tonightStops(s: Session): TonightStop[] {
  const doors: TonightStop[] = PATHS[learnerPath(s)].school ? ["homework", "teach", "prepare"] : ["homework", "teach"];
  return continueCard(s) ? ["continue", ...doors] : doors;
}

/** Who is at the desk: every profile, then "add a learner". */
export function learnerStops(s: Session): Array<Profile | "add"> { return [...s.profiles, "add"]; }
/**
 * What a switch of learner ends (P4, P4-a): the seated learner's Linga scene, level check and running reading, named.
 * A finished scene is not named, a paused one and a Take Two in progress are. A running reading is the Sentence reading
 * for key english and the Essay Master reading for any other key. One line for the switcher, or null when nothing of
 * those is running or the card is the seated learner's own. `to` is the
 * focused learner's name; the phone, which has no card, passes null and the line says "someone else".
 */
export function switchEndsLine(s: Session, to: Profile | null): string | null {
  if (!s.learner || to?.id === s.learner.id) return null;
  const ends = [s.conversation && turnState(s.conversation) !== "finished" ? "the Linga scene" : "", s.check ? "the level check" : "", s.jobs?.analyse?.phase === "running" ? (s.jobs.analyse.key === "english" ? "the Sentence reading" : "the Essay Master reading") : ""].filter(Boolean);
  if (!ends.length) return null;
  const list = ends.length > 1 ? ends.slice(0, -1).join(", ") + " and " + ends[ends.length - 1] : ends[0];
  return `Switching to ${to ? to.name : "someone else"} ends ${list} for ${s.learner.name}.`;
}
/**
 * A module's lessons on file; a maths lesson only on its own path (a lesson with no path is the school path's).
 * Calculus 1 has no lesson library, so on that path Math Buddy's list is empty and its screens say so.
 */
export function lessonsOn(subject: Subject, path: MathPath, lessons: readonly Lesson[] = LESSONS): Lesson[] {
  return lessons.filter((l) => l.subject === subject && (subject !== "maths" || (l.path ?? "school") === path));
}
/** The units of the module on screen; the calendar is Math Buddy's lessons on file - both the learner's path's. */
export function unitStops(s: Session): Lesson[] { return lessonsOn(s.subject, learnerPath(s)); }
export function calendarStops(s: Session): Lesson[] { return lessonsOn("maths", learnerPath(s)); }
/** Where Units opens from Tonight: on Math Buddy's next lesson to watch (library/watched.ts), else the first. */
export function unitsFocus(s: Session): number { return Math.max(0, lessonStates(calendarStops(s), s.history).indexOf("next")); }
/** Where Tonight's Menu goes, as its one chip names it (maths/MathsTV.tsx Tonight): the lessons on file. */
export const TONIGHT_MENU = "Lessons";
/** The lenses, straight from the library, top to bottom. */
export const LENS_STOPS = ESSAY_TYPES;
/**
 * Essay Master's home: the four lenses, then the last paragraph's card (Right) when a paragraph has been read - or, with
 * nothing read yet, the way to start from the pattern (Down from the last lens): the plan.
 */
export type LensStop = (typeof ESSAY_TYPES)[number] | "last" | "plan" | "write";
/**
 * The last stop is the door to Writing ("Write from a prompt", 2026-10-22: Writing has no landing tile, this is its way in).
 * Adult mode has none: the prompts are the school-age bands' (lib/writing/prompts), none is written for an adult writer.
 */
export function lensStops(s: Session): LensStop[] {
  const head: LensStop[] = s.essay ? [...LENS_STOPS, "last"] : [...LENS_STOPS, "plan"];
  return isAdultHere(s) ? head : [...head, "write"];
}

/** The plan screen's stops, top to bottom: one per slot, then Read it and Back. Select on a slot asks for the sentence on the phone. */
export type PlanStop = "slot" | "read" | "back";
export function planStops(s: Session): PlanStop[] { return [...(s.essayPlan?.slots ?? []).map((): PlanStop => "slot"), "read", "back"]; }
/** The slot the phone writes: the one the caret is on, else the first empty one (the caret is on Read it or Back), else the last. */
export function planAt(s: Session): number {
  const slots = s.essayPlan?.slots ?? [];
  if (s.focus >= 0 && s.focus < slots.length) return s.focus;
  const open = slots.findIndex((x) => !x);
  return open < 0 ? Math.max(0, slots.length - 1) : open;
}
/** What Select on a slot says: the one thing to do next, on the phone. */
export function planStatus(i: number): string { const sl = planSlots(PLAYBOOK.find((p) => p.id === "para") ?? PLAYBOOK[0])[i]; return sl ? `say or type slot ${i + 1}, ${sl.label}, on the phone` : "say or type the sentence on the phone"; }
/** The lens the paragraph on the desk was read through, as a stop; the first lens when there is none. */
export function readingLens(s: Session): number { return Math.max(0, LENS_STOPS.findIndex((t) => t.id === s.essay?.type)); }
/** The playbook's four structures, straight from the library, top to bottom. */
export const PLAYBOOK_STOPS = PLAYBOOK;
/**
 * The forensic page: its actions run Left/Right along the bottom; Up/Down walk the paragraph's sentences
 * instead (the essay.at event), so the page is always about one sentence and one action is focused.
 */
export const FORENSIC_STOPS = ["rewrite", "why", "next", "back"] as const;
/** The forensic page's actions as the learner meets them (TL-7): under the curtain a fifth one, "Show the words on my phone", sits before Back. Off the curtain it does not exist. */
export type ForensicStop = (typeof FORENSIC_STOPS)[number] | "private";
export function forensicStops(s: Pick<Session, "profiles" | "learner" | "englishLearning" | "essay">): readonly ForensicStop[] {
  return curtainOn(s) ? ["rewrite", "why", "next", "private", "back"] : FORENSIC_STOPS;
}
/** The sentence the forensic page is about, as an index: the one walked to, else the first faulty one, else the first. */
export function forensicAt(s: Pick<Session, "essay" | "essayAt">): number {
  const a = s.essay; if (!a?.sentences.length) return 0;
  const chosen = s.essayAt == null ? -1 : a.sentences.findIndex((x) => x.n === s.essayAt);
  if (chosen >= 0) return chosen;
  const faulty = new Set(a.verdicts.filter((v) => v.verdict === "faulty").map((v) => v.n));
  return Math.max(0, a.sentences.findIndex((x) => faulty.has(x.n)));
}
/**
 * Where the forensic page's focus lands when a rewrite of sentence `n` comes back (essay.revised), from `focus`:
 * on Next sentence when the rewrite holds and another sentence is still faulty - this one is done; else it stays.
 * Next sentence then goes to that next faulty sentence (nextFaultyAt), not to sentence n+1.
 */
export function focusAfterRewrite(a: EssayAnalysis, n: number, focus: number): number {
  const more = a.verdicts.some((v) => v.n !== n && v.verdict === "faulty");
  return rewriteState(a.verdicts.find((v) => v.n === n)) === "holds" && more ? FORENSIC_STOPS.indexOf("next") : focus;
}
/** The index Next sentence goes to from index `i`: the next sentence after it, wrapping, whose verdict is faulty and that is not `i`; with no other faulty sentence, the one after (i+1, wrapping). */
export function nextFaultyAt(a: EssayAnalysis, i: number): number {
  const n = a.sentences.length;
  for (let d = 1; d < n; d++) {
    const j = (i + d) % n;
    if (a.verdicts.some((v) => v.n === a.sentences[j].n && v.verdict === "faulty")) return j;
  }
  return (i + 1) % n;
}
/** What Rewrite on my phone puts on the status line; the page inks the move while it is the status. */
export const rewriteStatus = (n: number) => `sentence ${n}: rewrite it in your own words on the phone`;
/** The YouTube IFrame API's postMessage form of Play/Pause: what the lesson screens send the embed when lessonPaused flips. */
export const playerCommand = (paused: boolean): string => JSON.stringify({ event: "command", func: paused ? "pauseVideo" : "playVideo", args: "" });
export const HINT_STOPS = ["stuck", "lesson", "ask"] as const;
/** The practice card's two ways in (TL-6): snap the sheet, or type the answers. Both are hand-offs to the phone. */
export const PRACTICE_STOPS = ["sheet", "answers"] as const;
/** The Page's one stop past the problems (TL-6): Ask in words. The page keeps its lamp on the problem at focus 0. */
export const PAGE_ASK = 1;
export const SENTENCE_STOPS = ["again", "unit"] as const;
/** The recap: one tile per app on the desk, then back to the desk (tv/recapRows.ts). */
export { recapStops, type RecapStop } from "@/tv/recapRows";
/** The school syllabus as a stop list: kept for the existing tests. The Topics screen walks `topicStops(s)`. */
export const TOPIC_STOPS: readonly Topic[] = SYLLABUS;
/** Topics: the stops of the learner's own path (library/paths.ts learnerPath) - the school syllabus, or Calculus 1. */
export function topicStops(s: Pick<Session, "profiles" | "learner">): readonly PathTopic[] { return topicsOf(learnerPath(s)); }
/**
 * Where "Teach me something" opens Topics: on the learner's frontier (paths.ts frontierOn, the same rule as the
 * ruler's needle) - on a school path the first topic not latched secure after the last latched one, on a course the
 * first not latched secure whose prerequisites all are - and on the first stop when nothing is secure or none is left.
 */
export function topicsFocus(s: Pick<Session, "profiles" | "learner" | "skills">): number {
  const path = learnerPath(s), done = Object.values(s.skills ?? {}).filter((r) => r?.secure).map((r) => r.topic);
  const next = done.length ? frontierOn(path, done) : undefined;
  // nothing secure opens on the first topic, where the Tonight ruler's needle stands, for every learner: a learner past the
  // path's end opened on its last topic (Probability), whose own line says most people do equivalent fractions first (stick
  // walk 2026-10-23; revises PE1's Topics half). Get ready for school still opens on the last topic (prepareDoorFocus).
  return next ? Math.max(0, topicsOf(path).findIndex((t) => t.id === next.id)) : 0;
}
/** Where Get ready for school opens: the first unit, or for a learner past the path's end the stop of its last topic. */
function prepareDoorFocus(s: Pick<Session, "profiles" | "learner">): number {
  const last = pastPathEnd(s);
  return last ? Math.max(0, prepareStops(s).findIndex((u) => u.id === last.id)) : 0;
}
/**
 * The walk's actions (TL-6): back to the sheet on the last item, then, on an item that is wrong or unsure and not fixed,
 * Tell the desk how and Type my second go - both hand-offs to the phone, for this item (detail.walkIx).
 */
export type WalkStop = "sheet" | "explain" | "second";
export function walkStops(s: Session): WalkStop[] {
  const p = s.practice, n = p?.items.length ?? 0, it = p?.items[s.walkIx];
  const out: WalkStop[] = n && s.walkIx === n - 1 ? ["sheet"] : [];
  if (p?.marked && it && (it.verdict === "wrong" || it.verdict === "unsure") && toLookAt(it)) out.push("explain", "second");
  return out;
}
/** The hand-offs each Essay Master and Linga screen opens (TL-7): the ask kinds that screen may hold open. */
const ESSAY_HANDOFFS: Partial<Record<Screen, readonly AskKind[]>> = { essaytype: ["paragraph"], essayplan: ["slot"], forensic: ["rewrite", "private"], sentence: ["sentence"] };
/** The job each of those kinds names in the caption. */
const ESSAY_HANDOFF_JOB: Partial<Record<AskKind, string>> = { paragraph: "the paragraph", rewrite: "your rewrite", slot: "the sentence for the slot", sentence: "your sentence", private: "the words, kept private" };
/**
 * The hand-off this Essay Master or sentence screen is waiting on (TL-7): the session's open ask, when it was opened from
 * this screen and is one of the kinds the screen opens (on the forensic page, for the sentence in hand). Null otherwise.
 */
export function essayHandoffOf(s: Pick<Session, "ask" | "screen" | "essay" | "essayAt">): Ask | null {
  const a = s.ask;
  if (!a || a.screen !== s.screen || !ESSAY_HANDOFFS[s.screen]?.includes(a.kind)) return null;
  if (s.screen === "forensic" && s.essay?.sentences.length && a.detail?.n !== s.essay.sentences[forensicAt(s)].n) return null;
  return a;
}
/** The caption while that hand-off is open: what is awaited and the way out, or that no phone is connected. Null with none open. */
export function essayHandoffLine(s: Pick<Session, "ask" | "screen" | "essay" | "essayAt" | "phonesLive">): string | null {
  const a = essayHandoffOf(s);
  if (!a) return null;
  return s.phonesLive === 0 ? "No phone is connected. Back: cancel." : `On the phone: ${ESSAY_HANDOFF_JOB[a.kind] ?? "the job"}. Back cancels.`;
}
/** A hand-off cancelled by the first Back (TL-6): true when this screen had one open and the Back was spent on it. */
function cancelAsk(s: Session, o: Out): boolean {
  const a = handoffOf(s) ?? essayHandoffOf(s);
  if (a) o.ev({ type: "ask.cancel", id: a.id });
  return !!a;
}
/** With a hand-off open and no phone connected, Up goes to the pairing screen (the caption says so). */
function pairUp(s: Session, k: Key, o: Out): boolean {
  if (k !== "up" || s.phonesLive !== 0 || !handoffOf(s)) return false;
  o.nav("pair", 0, s.screen);
  return true;
}

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
   * job). Topics, the sheet's "Six more" and Get ready for school all come here; the set arrives as practice.set over the
   * session stream, and a failed call gives Select back. `stretch` asks for "a step up" (Family W8); `stay` keeps the
   * screen that asked (Get ready for school) instead of opening Topics while the set is written.
   */
  set(local: Local, topic: string, opts: { stretch?: boolean; stay?: boolean } = {}) {
    if (local.busy || running(this.s, "practice")) return;
    this.ev(opts.stay ? { type: "topic.open", topic, stay: true } : { type: "topic.open", topic });
    this.calls.push({ url: "/api/practice", body: opts.stretch ? { topic, stretch: true } : { topic }, onFail: { busy: false } });
    this.local.busy = true;
  }
  /**
   * Ask for a worked lesson (v2 M1) unless one is already being written: the topic opens, the lesson lands on `worked`.
   * `origin` says where it was asked from (Get ready for school); it is kept in Local so the lesson's Back returns there.
   * Asked from Topics (no origin) it clears an origin left over. Local is written only when the value changes.
   */
  teach(local: Local, topic: string, origin?: "prepare") {
    if (local.busy || running(this.s, "teach")) return;
    if (origin && local.lessonFrom !== origin) this.local.lessonFrom = origin;
    else if (!origin && local.lessonFrom) this.local.lessonFrom = null;
    this.ev({ type: "topic.open", topic, stay: true });
    this.calls.push({ url: "/api/worked", body: { topic }, onFail: { busy: false }, onDone: { busy: false } });
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
/** Where a shared screen (a page, the units) goes home to: Essay Master's lenses for essay work, else Tonight (Linga's, under english). */
const homeOf = (s: Session, sub: Subject) => sub === "essay" ? { screen: "essaytype" as Screen, focus: readingLens(s) } : { screen: "tonight" as Screen, focus: 0 };
/**
 * What resuming an app means, once, for the landing's Select, Tonight's continue card and the recap's tile: open what
 * the app has waiting. Math Buddy through its continue card (the marked sheet, the set on paper, the snapped page);
 * Essay Master to the forensic page when the learner's paragraph is on the desk, else the lens home with the lamp on the
 * lens last read; everything else (nothing waiting, Linga, whose home leads with its own Carry on) to the home.
 * The caller says which app is open (the subject event); this only says where.
 */
function openWaiting(s: Session, app: Subject, o: Out) {
  const cont = app === "maths" ? continueCard(s) : null;
  if (cont?.go === "page") { o.ev({ type: "page.select", pageIx: cont.pageIx }); o.nav("page"); }
  else if (cont) o.nav(cont.go, cont.focus);
  else if (app === "essay" && ownReading(s)) { o.ev({ type: "essay.at", n: null }); o.nav("forensic"); }
  // Adult mode opens Essay Master on the Workroom (v2 T2): the desk puts the summary on the TV, never the text
  else if (app === "essay" && isAdultHere(s)) o.calls.push({ url: "/api/twin", body: { open: true } });
  else if (app === "essay") o.nav(MODULE_HOME.essay, Math.max(0, LENS_STOPS.findIndex((t) => t.id === essayWaiting(s).lens)));
  else o.nav(MODULE_HOME[app]);
}
const lessonEvent = (l: Lesson, why: string): Event => ({ type: "lesson.set", lesson: { id: l.id, title: l.title, t: 0, text: l.concepts.join(" · "), why, youtube: l.youtube } });

const KEYMAP: Partial<Record<Screen, Handler>> = {
  // the light moves between the things on the desk: Left/Right along the shelf of apps, Up to an unpaired phone (top right),
  // Down to Someone else (bottom right); Menu ends tonight wherever it is - what the phone's End session does: the recap,
  // and the memory written
  landing: (s, k, _, o) => {
    const stops = landingStops(s), i = landingAt(s), at = stops[i], apps = landingApps(s).length;
    const to = (j: number) => { if (j >= 0 && j !== s.focus) o.ev({ type: "focus", focus: j }); };
    // no one at the desk has no evening to end
    if (k === "menu") { if (s.learner) { o.ev({ type: "session.end" }); o.calls.push({ url: "/api/memory", body: {} }); } return; }
    if (k === "back") { to(restStop(s)); return; }
    if (at === "place") {
      if (k === "up") to(apps ? Math.floor((apps - 1) / 2) : stops.indexOf("phone"));
      if (k === "select") o.nav("learner", 0, "landing");
    } else if (at === "phone") {
      if (k === "down" || k === "left") to(apps ? apps - 1 : stops.indexOf("place"));
      if (k === "select") o.nav("pair", 0, "landing");
    } else if (at) {
      if (k === "right" && i < apps - 1) to(i + 1); if (k === "left" && i > 0) to(i - 1);
      if (k === "up") to(stops.indexOf("phone"));
      if (k === "down") to(stops.indexOf("place"));
      // an app opened at a desk no one has sat down at asks who first: its work is somebody's (store.ts NEEDS_LEARNER)
      if (k === "select") {
        if (!s.learner) { o.nav("learner", 0, "landing"); return; }
        // (dead since 2026-10-22: writingOn is false; Essay Master's lens home is Writing's door now)
        // Writing is no Subject: it opens its own screen, on the episode left there; a finished one starts over at the list
        if (at === "writing") { if (writingPhase(s) === "finished") o.ev({ type: "writing.clear" }); o.nav("writing", 0); return; }
        o.ev({ type: "subject", subject: at }); openWaiting(s, at, o);
      }
    }
  },
  // Writing (TV-WRITING-SCREEN-2026-10-21): the prompt list, then the chosen prompt. Up/Down (and Left/Right) walk the
  // stops; Select picks a prompt, hands the typing to the phone (the writing ask) or goes back to the list; Back cancels
  // an open hand-off first, else leaves for the desk with the lamp on Writing (the episode stays for next time); Menu on
  // the chosen prompt is Another prompt.
  writing: (s, k, _, o) => {
    const stops = writingStops(s), at = stopAt(stops, s.focus), ph = writingPhase(s), ask = writingAskOf(s);
    if (k === "back") { if (ask?.phase === "open") { o.ev({ type: "ask.cancel", id: ask.id }); return; } o.nav("essaytype", Math.max(0, lensStops(s).indexOf("write"))); return; }
    if (k === "up" || k === "left") o.move(stops.length, -1);
    if (k === "down" || k === "right") o.move(stops.length, 1);
    const another = () => { const ix = writingPrompts(s).findIndex((p) => p.id === s.writingTv?.promptId); o.ev({ type: "writing.clear" }); o.focus(Math.max(0, ix)); };
    if (ph === "list") { if (k === "select" && at) { o.ev({ type: "writing.pick", promptId: at }); o.focus(0); } return; }
    // nothing changes under a paragraph the desk is reading or saving
    if (s.writingTv?.busy) return;
    if (k === "menu" && !ask) another();
    if (k !== "select") return;
    if (at === "another") another();
    else if (at === "phone" && !ask) o.ev({ type: "ask.open", kind: "writing" });
  },
  pair: (s, k, _, o) => {
    // paired (TL-3): two buttons under the code - Pair another (stop 0, the code stays up) and Forget every phone (stop 1)
    // up for a wish the phone must answer (pairFor): no forget here, and Back gives the wish up on the screen and lamp it came from.
    // The two stand side by side (screens.tsx pair-actions), so Right and Left walk them; Down and Up still do (stick walk 2026-10-22)
    const pf = s.pairFor;
    if (s.joined && !pf) { if (k === "right" || k === "down") o.focus(1); if (k === "left" || k === "up") o.focus(0); if (k === "select" && s.focus === 1) o.ev({ type: "phones.forget" }); }
    if (k === "back" && pf && !pf.ready) { o.nav(pf.screen, pf.focus); return; }
    if (k === "back") { const to = s.back && s.back !== "pair" ? s.back : "landing"; o.nav(to, to === "landing" ? landingFocus(s, "phone") : 0); }
  },
  // the desk is home: Select or Back rests the lamp there, as choosing a learner does (store.ts learner.set). With no one
  // seated, Select does what the screen says, "choose who is studying": the learner cards (stick pass 2026-10-20)
  joined: (s, k, _, o) => {
    if (k === "select" && !s.learner) { o.nav("learner", 0, "landing"); return; }
    if (k === "select" || k === "back") o.nav("landing", LANDING_REST);
  },
  tonight: (s, k, _, o) => {
    const stops = tonightStops(s), at = stopAt(stops, s.focus);
    if (k === "back") {
      // the first Back puts the photo down (TL-6: ask.cancel beside page.unask); only the next one leaves
      const asked = cancelAsk(s, o);
      if (s.awaiting) o.ev({ type: "page.unask" }); else if (!asked) o.nav("landing", landingFocus(s, "maths"));
      return;
    }
    if (pairUp(s, k, o)) return;
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "up") o.nav("learner", 0, "tonight");
    // Down is the paper you sat (TL-13): pairing lives on the landing, so an unpaired desk meets the same screen.
    // It carries `from`, so the paper's Back comes back here (F10)
    if (k === "down") o.nav("paper", 0, "tonight");
    // Menu is Tonight's one unused button: the lessons on file, the lamp on the next one to watch (tonightDoor names it)
    if (k === "menu") { o.ev({ type: "subject", subject: "maths" }); o.nav("units", unitsFocus(s)); return; }
    if (k !== "select") return;
    o.ev({ type: "subject", subject: "maths" });
    if (at === "continue" && continueCard(s)) openWaiting(s, "maths", o);
    else if (at === "teach") o.nav("topics", topicsFocus(s));
    // Get ready for school opens on its list, the question closed
    else if (at === "prepare") { o.local.prepareAsk = null; o.nav("prepare", prepareDoorFocus(s)); }
    // tonight's sheet opens; anything else (nothing, an older sheet, a failed read) asks for tonight's photo
    else { const sheet = tonightsSheet(s);
      if (sheet) { o.ev({ type: "page.select", pageIx: sheet.ix }); o.nav("page"); } else { o.ev({ type: "page.ask", subject: "maths" }); o.ev({ type: "ask.open", kind: "page", detail: { subject: "maths" } }); } }
  },
  learner: (s, k, _, o) => {
    const stops = learnerStops(s), at = stopAt(stops, s.focus);
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    // Back returns to the screen that opened the switcher; a stale back (a profile, the pair screen) is the desk
    if (k === "back") { if (s.back === "tonight") o.nav("tonight"); else o.nav("landing", landingFocus(s, "place")); }
    if (k === "select") { if (at && at !== "add") o.ev({ type: "learner.set", id: at.id }); else { o.ev({ type: "profile.draft", patch: {} }); o.nav("profile"); o.ev({ type: "ask.open", kind: "name" }); } }
    if (k === "menu" && at && at !== "add") { o.ev({ type: "profile.draft", patch: { id: at.id, name: at.name, type: at.type, age: at.age, system: at.system, modules: at.modules, mathPath: at.mathPath, mode: at.mode } }); o.nav("profile"); }
  },
  profile: (s, k, _, o) => {
    // rows of picks (type, age when a school type, mode, school system, interests, the Maths course when Maths is on, actions); Up/Down keep the column
    const rows = profileRows(s.draft), at = locate(rows, s.focus), cell = rows[at.r].cells[at.c];
    if (k === "right") o.focus(flat(rows, at.r, at.c + 1)); if (k === "left") o.focus(flat(rows, at.r, at.c - 1));
    if (k === "down" && at.r < rows.length - 1) o.focus(flat(rows, at.r + 1, at.c)); if (k === "up" && at.r > 0) o.focus(flat(rows, at.r - 1, at.c));
    // a pick in a one-answer row moves the lamp to the next row's current or likely cell, so one press per row is the norm
    const pick = (patch: Partial<Profile>) => {
      o.ev({ type: "profile.draft", patch });
      const d: Profile = { id: "", name: "", type: "high-school", modules: [], ...s.draft, ...patch };
      const r = AGE_RANGE[d.type]; if (r && d.age !== undefined && (d.age < r[0] || d.age > r[1])) delete d.age;
      // the School year row is a correction most learners skip: the lamp passes it (Up from the next row reaches it)
      const next = profileRows(d); let nr = Math.min(at.r + 1, next.length - 1);
      while (nr < next.length - 1 && next[nr].cells[0].kind === "year" && at.r < nr) nr++;
      o.focus(flat(next, nr, likelyIx(next[nr], d)));
    };
    if (k === "select") {
      if (cell.kind === "name") { if (s.ask?.kind !== "name") o.ev({ type: "ask.open", kind: "name" }); }
      else if (cell.kind === "type" && cell.type) pick({ type: cell.type });
      else if (cell.kind === "age") pick({ age: cell.age });
      else if (cell.kind === "year") pick({ year: cell.year });
      else if (cell.kind === "mode" && cell.mode) pick({ mode: cell.mode });
      else if (cell.kind === "system" && cell.system) pick({ system: cell.system });
      else if (cell.kind === "path" && cell.path) o.ev({ type: "profile.draft", patch: { mathPath: cell.path } });
      else if (cell.kind === "interest" && cell.sub) { const m = cell.sub, on = s.draft?.modules ?? []; o.ev({ type: "profile.draft", patch: { modules: on.includes(m) ? on.filter((x) => x !== m) : [...on, m] } }); }
      else if (cell.kind === "save") o.ev({ type: "profile.save" }); else o.ev({ type: "profile.discard" });
    }
    if (k === "menu" && !s.joined) o.nav("pair", 0, "profile");
    // the first Back puts the name ask down (TL-8); only the next one throws the draft away
    if (k === "back") { if (s.ask?.kind === "name" && s.ask.screen === "profile") o.ev({ type: "ask.cancel", id: s.ask.id }); else o.ev({ type: "profile.discard" }); }
  },
  units: (s, k, _, o) => {
    const stops = unitStops(s);
    if (k === "down") o.move(stops.length, 1); if (k === "up") o.move(stops.length, -1);
    if (k === "select") { const l = stopAt(stops, s.focus); if (l) { o.ev(lessonEvent(l, `Unit ${l.unit}, chosen by you.`)); o.nav("lesson"); } }
    if (k === "menu") o.nav(s.subject === "maths" ? "calendar" : s.subject === "english" ? "headtohead" : "playbook");
    if (k === "back" || k === "left") { const h = homeOf(s, s.subject); o.nav(h.screen, h.focus); }
  },
  calendar: (s, k, _, o) => {
    const stops = calendarStops(s);
    o.grid(k, stops.length, 3);
    if (k === "select") { const l = stopAt(stops, s.focus); if (l) { o.ev(lessonEvent(l, `Unit ${l.unit}.`)); o.nav("lesson"); } }
    if (k === "back") o.nav("units");
  },
  page: (s, k, local, o) => {
    const p = s.pages[s.pageIx], h = homeOf(s, p?.subject ?? s.subject);
    // Back always leaves, a page still being read included (the read lands on the page when it is done)
    // the first Back puts a question down (TL-6); the next one leaves
    if (k === "back") { if (!cancelAsk(s, o)) o.nav(h.screen, h.focus); return; }
    if (!p || s.reading) return;
    if (pairUp(s, k, o)) return;
    // a failed read that may be asked again is asked again from here (TL-13, M3); one the desk will not repeat is not
    const rd = s.jobs?.read?.key === p.id ? s.jobs.read : undefined;
    if (rd?.phase === "failed") { if (k === "select" && rd.retry !== false) o.calls.push({ url: "/api/session/retry", body: { kind: "read" } }); if (k === "select") return; }
    // Ask in words (TL-6), a maths page's one stop past its problems: Down from the last problem, Up back to it
    const askable = p.subject === "maths" && p.items.length > 0;
    if (askable && s.focus === PAGE_ASK) {
      if (k === "up") o.focus(0);
      if (k === "select") o.ev({ type: "ask.open", kind: "question", detail: { n: p.items[s.itemIx]?.n } });
      if (k !== "menu") return;
    }
    if (k === "down" && askable && s.itemIx >= p.items.length - 1) { o.focus(PAGE_ASK); return; }
    if (k === "down") o.ev({ type: "item", itemIx: Math.min(p.items.length - 1, s.itemIx + 1) });
    if (k === "up") o.ev({ type: "item", itemIx: Math.max(0, s.itemIx - 1) });
    if (k === "right" && s.pageIx < s.pages.length - 1) o.ev({ type: "page.select", pageIx: s.pageIx + 1 });
    if (k === "left") { if (s.pageIx > 0) o.ev({ type: "page.select", pageIx: s.pageIx - 1 }); else o.nav(h.screen, h.focus); }
    if (k === "menu") o.ev({ type: "view", view: s.view === "band" ? "overview" : "band" });
    if (k === "select" && p.items[s.itemIx]) o.hint(local, {});
  },
  hint: (s, k, local, o) => {
    const at = stopAt(HINT_STOPS, s.focus);
    if (k === "back") { if (!cancelAsk(s, o)) o.nav("page"); return; }
    if (pairUp(s, k, o)) return;
    if (k === "left") o.move(HINT_STOPS.length, -1); if (k === "right") o.move(HINT_STOPS.length, 1);
    if (k === "select" && at === "ask") { o.ev({ type: "ask.open", kind: "question", detail: { n: s.pages[s.pageIx]?.items[s.itemIx]?.n } }); return; }
    if (k === "select") { if (at === "stuck" && s.hint?.stage === 1) o.hint(local, { stage: 2 }); if (at === "lesson") {
        // a task that reads as a school unit has no lesson in the library: the stop is Six like this, a set on that unit, the hint kept on screen
        const unit = likeUnit(s);
        if (unit) o.set(local, unit, { stay: true }); else if (s.lesson) o.nav("lesson");
      } }
  },
  lesson: (s, k, _, o) => {
    if (k === "play") o.ev({ type: "lesson.pause", paused: !s.lessonPaused });
    if (k === "back") { if (s.hint) o.nav("hint", HINT_STOPS.indexOf("lesson")); else o.nav("units", Math.max(0, unitStops(s).findIndex((l) => l.id === s.lesson?.id))); }
    if (k === "menu") o.nav(s.subject === "english" ? "headtohead" : s.subject === "essay" ? "xray" : "calendar");
  },
  sentence: (s, k, _, o) => {
    // nothing checked yet: Try a sentence is the one stop drawn, so the lamp stays on it (Show me the unit needs a sentence)
    const at = s.english ? stopAt(SENTENCE_STOPS, s.focus) : "again";
    if (s.english && k === "left") o.move(SENTENCE_STOPS.length, -1); if (s.english && k === "right") o.move(SENTENCE_STOPS.length, 1);
    if (k === "select" && at === "unit") o.nav("headtohead");
    if (k === "select" && at === "again") { o.ev({ type: "status", text: "say or type another sentence on the phone" }); o.ev({ type: "ask.open", kind: "sentence" }); }
    if (k === "back") { if (!cancelAsk(s, o)) o.nav("linga"); }
  },
  headtohead: (s, k, _, o) => { if (k === "back") o.nav(s.english ? "sentence" : "units"); },
  // the lenses top to bottom; Right reaches the last paragraph's card, Select there opens its reading
  essaytype: (s, k, _, o) => {
    const stops = lensStops(s), at = stopAt(stops, s.focus);
    const side = stops.includes("plan") ? "plan" : "last"; // the side column's first stop
    if (at === "write") {
      // Writing's door: Up returns to the stop above it; Select opens the Writing screen (a finished episode starts over)
      if (k === "up") o.focus(stops.indexOf(side));
      if (k === "left") o.focus(readingLens(s));
      if (k === "select") { if (writingPhase(s) === "finished") o.ev({ type: "writing.clear" }); o.nav("writing", 0, "essaytype"); }
    } else if (at === "last") {
      if (k === "left") o.focus(readingLens(s));
      if (k === "down" && stops.includes("write")) o.focus(stops.indexOf("write"));
      if (k === "select") { o.ev({ type: "essay.at", n: null }); o.nav("forensic"); }
    } else if (at === "plan") {
      if (k === "up") o.focus(LENS_STOPS.length - 1);
      if (k === "down" && stops.includes("write")) o.focus(stops.indexOf("write"));
      if (k === "select") { const lens = LENS_STOPS.find((t) => t.id === s.essayType) ?? LENS_STOPS[0]; o.ev({ type: "essay.plan", lens: lens.id }); o.nav("essayplan", 0, "essaytype"); }
    } else if (at) {
      if (k === "down" && stops.indexOf(at) === LENS_STOPS.length - 1 && stops.includes("plan")) { o.focus(stops.indexOf("plan")); return; }
      if (k === "down" && stops.indexOf(at) === LENS_STOPS.length - 1 && stops.includes("write")) { o.focus(stops.indexOf("write")); return; }
      if (k === "down") o.move(LENS_STOPS.length, 1); if (k === "up") o.move(LENS_STOPS.length, -1);
      if (k === "right" && stops.includes("last")) o.focus(stops.indexOf("last"));
      if (k === "select" && at) { o.ev({ type: "essay.type", essayType: at.id }); o.ev({ type: "status", text: `${at.id} lens chosen: paste or dictate the paragraph on the phone` }); o.ev({ type: "ask.open", kind: "paragraph" }); }
    }
    if (k === "menu") o.nav("playbook", 0, "essaytype");
    // Adult mode: Back from the lens home returns to the Workroom, so it stays reachable once a reading is on the desk (recert-6/L1-helena-46-EM5-2)
    if (k === "back" && cancelAsk(s, o)) return;
    if (k === "back") { if (isAdultHere(s)) o.calls.push({ url: "/api/twin", body: { open: true } }); else o.nav("landing", landingFocus(s, "essay")); }
  },
  // the Paragraph's slots, written on the phone: Up/Down walk the slots, then Read it and Back; Read it reads only when all three are written
  essayplan: (s, k, _, o) => {
    const plan = s.essayPlan, stops = planStops(s), at = stopAt(stops, s.focus);
    if (k === "back") { if (!cancelAsk(s, o)) o.nav("essaytype", LENS_STOPS.length); return; }
    if (k === "menu") { o.nav("playbook", PLAYBOOK.findIndex((p) => p.id === "para"), "essaytype"); return; }
    // another slot closes this slot's hand-off (TL-7)
    if (k === "down" || k === "up") { const was = essayHandoffOf(s); if (was && was.detail?.i !== Math.max(0, Math.min(stops.length - 1, s.focus + (k === "down" ? 1 : -1)))) o.ev({ type: "ask.cancel", id: was.id }); }
    if (k === "down") o.move(stops.length, 1); if (k === "up") o.move(stops.length, -1);
    if (k !== "select") return;
    if (at === "back") o.nav("essaytype", LENS_STOPS.length);
    if (at === "slot") { o.ev({ type: "status", text: planStatus(s.focus) }); o.ev({ type: "ask.open", kind: "slot", detail: { i: s.focus } }); }
    if (at === "read" && plan && !running(s, "analyse")) {
      const open = plan.slots.findIndex((x) => !x);
      if (open >= 0) o.focus(open); else o.calls.push({ url: "/api/analyse", body: { kind: "essay", text: planText(plan), type: plan.lens } });
    }
  },
  // the Workroom (v2 T2, Adult mode): Up/Down the pieces, OK on one reads it, Right to the actions (the lenses), Back to the desk
  workroom: (s, k, _, o) => {
    const stops = workroomStops(s), at = stopAt(stops, s.focus);
    if (k === "down") o.move(stops.length, 1); if (k === "up") o.move(stops.length, -1);
    if (k === "right" || k === "left") o.focus(at === "lenses" ? 0 : stops.indexOf("lenses"));
    if ((k === "select" && at === "lenses") || k === "menu") o.nav("essaytype", 0);
    // OK on a piece reads its latest version on the TV (recert-6/L1-helena-46-EM5-3); the desk looks the text up, the TV sends only the id
    if (k === "select" && at && at !== "lenses" && !running(s, "analyse")) o.calls.push({ url: "/api/analyse", body: { kind: "shelf-piece", pieceId: at } });
    if (k === "back") o.nav("landing", landingFocus(s, "essay"));
  },
  // one sentence at a time: Up/Down walk the paragraph, Left/Right the actions; Menu is the table, where Up/Down still walk
  forensic: (s, k, local, o) => {
    if (k === "menu") { o.local.table = !local.table; return; }
    if (k === "back") { if (local.table) o.local.table = false; else if (!cancelAsk(s, o)) o.nav("essaytype", readingLens(s)); return; }
    const a = s.essay; if (!a?.sentences.length) return;
    const i = forensicAt(s), n = a.sentences.length, stops = forensicStops(s);
    // another sentence closes the hand-off that names this one (TL-7)
    const go = (j: number) => {
      if (j === i) return;
      o.ev({ type: "essay.at", n: a.sentences[j].n });
      const was = essayHandoffOf(s); if (was) o.ev({ type: "ask.cancel", id: was.id });
    };
    if (k === "down") go(Math.min(n - 1, i + 1)); if (k === "up") go(Math.max(0, i - 1));
    if (local.table) { if (k === "select") o.local.table = false; return; }
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k !== "select") return;
    const at = stopAt(stops, s.focus);
    if (at === "rewrite") {
      const unruled = rewriteUnruledLine(a, a.sentences[i].n);
      o.ev({ type: "status", text: unruled ?? rewriteStatus(a.sentences[i].n) });
      // a sentence the desk did not rule has nothing to rewrite: the line says why and no hand-off opens
      if (!unruled) o.ev({ type: "ask.open", kind: "rewrite", detail: { n: a.sentences[i].n } });
    }
    if (at === "private" && curtainOn(s)) o.ev({ type: "ask.open", kind: "private", detail: { n: a.sentences[i].n } });
    if (at === "why") o.nav("playbook", Math.max(0, PLAYBOOK_STOPS.findIndex((p) => p === playFor(a.type))), "forensic");
    if (at === "next") go(nextFaultyAt(a, i));
    if (at === "back") o.nav("essaytype", readingLens(s));
  },
  // the four structures top to bottom; Back (or Menu) returns to where the playbook was opened from
  playbook: (s, k, _, o) => {
    if (k === "down") o.move(PLAYBOOK_STOPS.length, 1); if (k === "up") o.move(PLAYBOOK_STOPS.length, -1);
    if (k === "select") o.nav("xray", s.focus);
    if (k === "back" || k === "menu") { if (s.back === "forensic" && s.essay) o.nav("forensic", FORENSIC_STOPS.indexOf("why")); else o.nav("essaytype", s.essay ? readingLens(s) : 0); }
  },
  xray: (s, k, __, o) => { if (k === "back" || k === "menu") o.nav("playbook", s.focus); },
  break: (_, k, __, o) => { if (k === "select" || k === "back") o.ev({ type: "timer.skipbreak" }); },
  topics: (s, k, local, o) => {
    const stops = topicStops(s);
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    // nothing is locked here: Select starts whatever is focused. Menu and Up go home, where the path lives.
    if (k === "up" || k === "menu") o.nav("tonight");
    // a school unit with a worked lesson (v2 M1) is taught first; the others go straight to a set, as before
    if (k === "select") { const t = stopAt(stops, s.focus); if (t && hasWorked(t.id)) o.teach(local, t.id); else if (t) o.set(local, t.id); }
    if (k === "back") o.nav("tonight");
  },
  // the worked lesson (v2 M1): two actions, Try six (the usual set on this unit) and Back to the topics - or, when the lesson
  // was opened from Get ready for school (`lessonFrom`), Back to that door on the same unit, the question closed
  worked: (s, k, local, o) => {
    const stops = WORKED_STOPS;
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    const at = stopAt(stops, s.focus);
    if (k === "select" && at === "try" && s.worked) {
      const asked = o.calls.length;
      o.set(local, s.worked.topic);
      if (o.calls.length > asked && local.lessonFrom) o.local.lessonFrom = null;
    }
    if ((k === "select" && at === "back") || k === "back" || k === "up" || k === "menu") {
      if (local.lessonFrom === "prepare") {
        o.local.lessonFrom = null;
        if (typeof local.prepareAsk === "number") o.local.prepareAsk = null;
        o.nav("prepare", Math.max(0, prepareStops(s).findIndex((u) => u.id === s.worked?.topic)));
      } else o.nav("topics");
    }
  },
  // Get ready for school (Family W8): Left/Right walk the units strand by strand; Select asks "The usual" or "A step up"
  // (two cells, "The usual" lit; a unit with a worked lesson has "See how first" before them, lit, and Select on it opens
  // the lesson as Topics does), Left/Right between them, Select writes the set as Topics does - staying here while it is
  // written - and Back closes the question on the same unit. Up, Menu or Back on the list go home, the lamp on this door.
  prepare: (s, k, local, o) => {
    const stops = prepareStops(s), unit = stopAt(stops, s.focus);
    const writing = local.busy || running(s, "practice");
    const ask = local.prepareAsk;
    if (ask === -1 || ask === 0 || ask === 1) {
      if (k === "back") { o.local.prepareAsk = null; return; }
      if (writing || running(s, "teach")) return;
      if (k === "left" && ask > 0) o.local.prepareAsk = 0;
      if (k === "left" && ask === 0 && unit && hasWorked(unit.id)) o.local.prepareAsk = -1;
      if (k === "right" && ask < 1) o.local.prepareAsk = ask === -1 ? 0 : 1;
      if (k === "select" && unit) { if (ask === -1) o.teach(local, unit.id, "prepare"); else o.set(local, unit.id, { stretch: ask === 1, stay: true }); }
      return;
    }
    if (k === "up" || k === "menu" || k === "back") { o.nav("tonight", Math.max(0, tonightStops(s).indexOf("prepare"))); return; }
    if (k === "right") o.move(stops.length, 1); if (k === "left") o.move(stops.length, -1);
    if (k === "select" && unit && !writing && !running(s, "teach")) o.local.prepareAsk = hasWorked(unit.id) ? -1 : 0;
  },
  // the recovery from a paper (v2 M5b), opened from the phone's Paper panel: Up/Down or Left/Right walk the topics.
  // Then the off-desk statements, one walk (Select there does nothing; Back and Menu go to the first unit).
  // Select on a topic opens Get ready for school on that unit with its question open, as Select there would (or just on
  // the unit while a set or lesson is written), carrying the unit as the paper's aim (MB-B40). Back or Menu land on that unit, or the first when the list is empty.
  // Back from a paper Down on Tonight opened (`back`, set by its nav) returns to Tonight instead (F10).
  paper: (s, k, local, o) => {
    // the first Back puts the hand-off down (TL-13); the next one leaves, to where the paper was opened from
    if (k === "back" && cancelAsk(s, o)) return;
    if (k === "back" && s.back === "tonight") { o.nav("tonight", 0); return; }
    if (pairUp(s, k, o)) return;
    const count = paperStopCount(s), n = count + 1;
    if (k === "down" || k === "right") o.move(n, 1); if (k === "up" || k === "left") o.move(n, -1);
    // Type a paper (TL-13), the stop after the rows: the marks are typed on the phone
    if (k === "select" && s.focus >= paperTypeAt(s)) { if (!handoffOf(s)) o.ev({ type: "ask.open", kind: "paper" }); return; }
    const topics = paperView(s).topics, t = s.focus < topics.length ? stopAt(topics, s.focus) : undefined;
    const ix = t ? prepareStops(s).findIndex((u) => u.id === t.id) : -1;
    if (k === "select" && t && ix >= 0) {
      const writing = local.busy || running(s, "practice") || running(s, "teach");
      o.local.prepareAsk = writing ? null : hasWorked(t.id) ? -1 : 0;
      // the unit goes with it as the paper's aim (MB-B40): the set asked for on it is aimed at what this paper lost
      o.ev({ type: "nav", screen: "prepare", focus: ix, aim: t.id });
    }
    if (k === "back" || k === "menu") {
      // an off-desk row has no unit of its own: Back lands on the last topic row of the list it was walked from
      const last = t ?? topics[topics.length - 1];
      const at = last ? prepareStops(s).findIndex((u) => u.id === last.id) : -1;
      o.local.prepareAsk = null; o.nav("prepare", Math.max(0, at));
    }
  },
  // the set on paper is parked, not thrown away: Tonight's continue card puts it back
  // The card's two stops (TL-6) hand the set's marking to the phone: Snap the sheet, Type my answers. Back keeps the set.
  practice: (s, k, _, o) => {
    if (k === "back") { if (!cancelAsk(s, o)) o.nav("tonight"); return; }
    if (pairUp(s, k, o) || !s.practice) return;
    if (k === "left" || k === "up") o.move(PRACTICE_STOPS.length, -1); if (k === "right" || k === "down") o.move(PRACTICE_STOPS.length, 1);
    const at = stopAt(PRACTICE_STOPS, s.focus);
    if (k === "select" && at && !running(s, "mark")) o.ev({ type: "ask.open", kind: at });
  },
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
      // six more of the same kind: a step up asks for a step up again (Family W8)
      if (k === "select" && at === "more") o.set(local, p.topic, p.stretch ? { stretch: true } : {});
      if (k === "select" && at === "away") o.ev({ type: "practice.clear" });
    }
    if (k === "back") o.nav("tonight");
  },
  // one item at a time; leaving it goes back to the sheet at that item, never clears the set
  walk: (s, k, _, o) => {
    const stops = walkStops(s), at = stopAt(stops, s.focus);
    if (k === "back") { if (!cancelAsk(s, o)) o.nav("sheet", s.walkIx); return; }
    if (pairUp(s, k, o)) return;
    // another item closes this item's hand-off (TV-led design 2.2) and starts its lamp over
    if (k === "right" || k === "left") { cancelAsk(s, o); o.ev({ type: "walk", ix: s.walkIx + (k === "right" ? 1 : -1) }); o.focus(0); }
    if (k === "down") o.move(stops.length, 1); if (k === "up") o.move(stops.length, -1);
    if (k !== "select") return;
    if (at === "sheet") o.nav("sheet", s.walkIx);
    else if (at === "explain" || at === "second") o.ev({ type: "ask.open", kind: at, detail: { walkIx: s.walkIx } });
  },
  // tonight as one picture: Left/Right along the tiles, then the desk; Select opens what a tile's app still has on
  // the desk, through the helpers the landing and Tonight use; Back, or the desk, is the landing with the lamp at rest
  recap: (s, k, _, o) => {
    const stops = recapStops(s), at = stopAt(stops, s.focus);
    if (k === "left") o.move(stops.length, -1); if (k === "right") o.move(stops.length, 1);
    if (k === "back" || (k === "select" && (at === "desk" || !at))) { o.ev({ type: "nav", screen: "landing" }); return; }
    if (k !== "select" || !at || at === "desk") return;
    o.ev({ type: "subject", subject: at });
    openWaiting(s, at, o);
  },
};

/**
 * One button on one session -> what to do. Pure: it reads `s` and `local` and returns the events
 * to post in order, the calls to fire after them, and a patch for `local` to apply at once.
 * Under Linga (lingaOwns) it returns an empty step - LingaTV owns those keys.
 */
export function tvKey(s: Session, key: Key, local: Local = LOCAL, opts: { phoneHere?: boolean } = {}): Step {
  const o = new Out(s);
  if (lingaOwns(s)) return { events: [], calls: [], local: {} };
  // Play/Pause is the clock everywhere the clock is on screen; the lesson keeps it for the video, and the landing draws no clock.
  if (key === "play" && s.screen === "landing") return { events: [], calls: [], local: {} };
  if (key === "play" && s.screen !== "lesson") o.ev({ type: s.timer.running ? "timer.pause" : "timer.start" });
  else KEYMAP[s.screen]?.(s, key, local, o);
  // a hand-off no phone can answer is the pairing page for that wish, not an ask nobody sees (rules/pairBlock): the whole step waits for the phone
  const want = opts.phoneHere ? null : blockedAsk(s, o.events);
  if (want) return { events: [{ type: "pair.for", kind: want }], calls: [], local: {} };
  return { events: o.events, calls: o.calls, local: o.local };
}

/**
 * A phone joined for a wish (session.pairFor.ready): the Select that was held runs again, as if a phone had been here. The
 * session is already back on the screen and the lamp it was pressed on. Null when there is nothing to resume.
 */
export function resumeStep(s: Session, local: Local = LOCAL): Step | null {
  const pf = s.pairFor;
  if (!pf?.ready || s.screen !== pf.screen) return null;
  const { pairFor: _p, ...rest } = s;
  const step = tvKey(rest as Session, "select", local, { phoneHere: true });
  return { events: [{ type: "pair.clear" }, ...step.events], calls: step.calls, local: step.local };
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
