/**
 * The Study Desk landing's pure rows: which objects lie on the desk, where the lamp starts, and what each app has
 * waiting for the learner at the desk - read straight off the session, never invented. Shared by the landing
 * (landing/LandingTV.tsx) and the D-pad (tv/keys.ts), so the object drawn lit and the stop the keys walk are one
 * list. Types only from the store: the TV never loads the filesystem-backed session modules.
 */
import type { PracticeItem, Session, Subject } from "@/lib/session/store";
import { topic as topicById } from "@/lib/library/syllabus";
import { lingaView, progressDots, type ArtKey, type Dot, type HomeState } from "@/lib/english/view";
import { BAND_NAME } from "@/lib/english/placement";
import { ESSAY_TYPES } from "@/lib/library/lessons.data";
import { onModules } from "@/tv/profileRows";
import { continueCard } from "@/tv/mathsRows";
import { lensStandings, writingTotals } from "@/tv/writingRows";

/** The three apps, left to right on the desk. A profile shows only the ones it has on, in this order. */
export const LANDING_MODULES = ["maths", "english", "essay"] as const satisfies readonly Subject[];
/**
 * A stop on the desk: an app's object, the place card (whose desk it is: Select hands it to someone else), and the
 * phone while none is paired (Select shows the pairing screen). A paired phone lies on the desk as a status, not a stop.
 */
export type LandingStop = Subject | "place" | "phone";
/**
 * The landing's resting focus. Arriving on the landing without a stop named (a fresh desk, a nav with no focus),
 * the lamp starts on the object with something waiting - the CONTINUE object - rather than on whatever is first.
 */
export const LANDING_REST = -1;

/** The apps on the desk for the learner at it, left to right. */
export function landingModules(s: Session): Subject[] {
  const on = onModules(s);
  return LANDING_MODULES.filter((m) => on.includes(m));
}
/** Every stop: the apps, the place card, then the phone while it is unpaired. */
export function landingStops(s: Session): LandingStop[] {
  return [...landingModules(s), "place", ...(s.joined ? [] : ["phone" as const])];
}
/** The focus index of a stop, or LANDING_REST when it is not on this desk (the lamp then starts where it rests). */
export function landingFocus(s: Session, stop: LandingStop): number {
  const i = landingStops(s).indexOf(stop);
  return i >= 0 ? i : LANDING_REST;
}

// ---- what each app has waiting ----

/** How much the thing waiting asks for, most first: a marked set, something left mid-way, the next step, the last thing done. */
export type WaitKind = "marked" | "resume" | "next" | "last" | "none";
export const WAIT_PRIORITY: Record<WaitKind, number> = { marked: 0, resume: 1, next: 2, last: 3, none: 9 };

/** One line on Math Buddy's sheet: the question as the data has it, the learner's answer if marked, the verdict. */
export interface SheetLine { n: number; question: string; answer?: string; verdict?: PracticeItem["verdict"]; voice: "hand" | "print" }
export interface MathsWaiting {
  app: "maths"; kind: WaitKind; at: number | null;
  /** the sheet's tab and heading: Marked / Still open / On the desk, and the topic or the page's title */
  tab: string; title: string;
  lines: SheetLine[];
  /** a marked set: how many came back right, of how many */
  right: number | null; of: number | null;
  /** the line the caption reads, without its app name */
  line: string;
  /** nothing on the desk: the two words the blank sheet says */
  empty: string | null;
}
export interface LingaWaiting {
  app: "english"; kind: WaitKind; at: number | null; home: HomeState;
  /** the view's own title for home, the scene art behind the arch, and the name tag (who is behind the door) */
  title: string; art: ArtKey; partner: string;
  band: string | null; bandName: string | null;
  /** marks under the card: a conversation's replies and the question waiting, the check's steps, or the plan's topics; null for none */
  dots: Dot[] | null; midway: boolean;
  line: string; empty: string | null;
}
export interface EssayWaiting {
  app: "essay"; kind: WaitKind; at: number | null;
  /** the lens last read, its name, and how far the learner has got with it (the ink before the citron cursor, 0..1) */
  lens: string | null; lensName: string | null; estimate: number;
  /** the paragraph on the desk as arrows, one a sentence; `against` where the reading found it faulty */
  rail: Array<{ n: number; against: boolean }> | null;
  read: number; secure: number;
  /** the lens names still unread, as ghost plates when nothing is read */
  ghosts: string[];
  line: string; empty: string | null;
}
export type Waiting = MathsWaiting | LingaWaiting | EssayWaiting;

const firstSentence = (t: string) => (t.match(/^.*?[.!?](\s|$)/)?.[0] ?? t).trim();
const BLURB_ONE: Record<Subject, string> = {
  maths: "Learn and practise school maths one step at a time.",
  english: "Practise real situations in English.",
  essay: "See what your paragraph does and what it lacks.",
};

export function mathsWaiting(s: Session): MathsWaiting {
  const cont = continueCard(s), p = s.practice;
  const past = (s.history ?? []).filter((h) => h.kind === "homework" || h.kind === "practice").at(-1) ?? null;
  const base = { app: "maths" as const, right: null, of: null, lines: [] as SheetLine[], empty: null as string | null };
  if (cont && cont.go === "sheet" && p) {
    const name = topicById(p.topic)?.name ?? p.topic, right = p.items.filter((i) => i.verdict === "right").length;
    return { ...base, kind: "marked", at: null, tab: cont.k, title: name, right, of: p.items.length,
      lines: p.items.map((i) => ({ n: i.n, question: i.question, answer: i.studentAnswer, verdict: i.verdict ?? "unsure", voice: "hand" })),
      line: `${name} · ${right} of ${p.items.length} right. The marked set is still on the desk.` };
  }
  if (cont && cont.go === "practice" && p) {
    const name = topicById(p.topic)?.name ?? p.topic;
    return { ...base, kind: "resume", at: null, tab: cont.k, title: name,
      lines: p.items.map((i) => ({ n: i.n, question: i.question, voice: "print" })), line: cont.d };
  }
  if (cont && cont.go === "page") {
    const pg = s.pages[cont.pageIx];
    return { ...base, kind: "resume", at: null, tab: cont.k, title: pg?.title ?? "",
      lines: (pg?.items ?? []).map((i) => ({ n: i.n, question: i.text, voice: "print" })), line: cont.d };
  }
  if (past) return { ...base, kind: "last", at: past.at, tab: "", title: past.label, empty: "Nothing open", line: `Last time: ${past.label} · ${past.detail}.` };
  return { ...base, kind: "none", at: null, tab: "", title: "", empty: "Not started", line: BLURB_ONE.maths };
}

const LINGA_KIND: Record<HomeState, WaitKind> = { resume: "resume", "check-part-way": "resume", "next-topic": "next", "no-plan": "next", "plan-done": "last", "no-placement": "none" };
export function lingaWaiting(s: Session): LingaWaiting {
  // Linga's home, as Linga itself would draw it for this learner: a conversation left by someone else is not theirs
  const mine = s.conversation && s.conversation.learnerId === s.learner.id ? s.conversation : null;
  const at: Session = { ...s, screen: "linga", focus: LANDING_REST, conversation: mine };
  const v = lingaView(at), home = v.home ?? "no-placement", l = s.englishLearning;
  const hero = v.hero.kind === "intro" ? v.hero : null;
  const talked = l?.sessions?.length ?? 0;
  const kind: WaitKind = home === "no-placement" && talked ? "last" : LINGA_KIND[home];
  const band = l?.placement?.band ?? null;
  const when = home === "resume" ? mine?.startedAt ?? null : l?.sessions?.at(-1)?.at ?? l?.placement?.at ?? null;
  return {
    app: "english", kind, at: when, home, title: v.title, art: hero?.art ?? "check", partner: hero?.nameTag ?? "",
    band, bandName: band ? BAND_NAME[band] : null,
    // mid-way: one mark per reply given, then the question waiting; otherwise the plan's topics or the check's steps
    dots: home === "resume" && mine ? [...mine.turns.filter((x) => x.role === "learner").slice(-6).map((): Dot => "done"), "current"] : progressDots(at),
    midway: home === "resume" || home === "check-part-way",
    line: home === "no-placement" && !talked ? BLURB_ONE.english : v.baseCaption,
    empty: kind === "none" ? "Not started" : null,
  };
}

export function essayWaiting(s: Session): EssayWaiting {
  const standings = lensStandings(s.history, s.writing), totals = writingTotals(standings, s.history);
  const read = standings.filter((x) => x.lastAt).sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0));
  const last = read[0] ?? null;
  const entry = (s.history ?? []).filter((h) => h.kind === "writing").at(-1) ?? null;
  // the paragraph in the session is this learner's only when their own history holds a reading through its lens
  const a = s.essay, lensOf = (id: string) => ESSAY_TYPES.find((t) => t.id === id)?.name ?? id;
  const own = a && (s.history ?? []).some((h) => h.kind === "writing" && h.label === lensOf(a.type)) ? a : null;
  const faulty = new Set(own?.verdicts.filter((v) => v.verdict === "faulty").map((v) => v.n) ?? []);
  const rail = own?.sentences.length ? own.sentences.map((x) => ({ n: x.n, against: faulty.has(x.n) })) : null;
  if (!last) return { app: "essay", kind: "none", at: null, lens: null, lensName: null, estimate: 0, rail: null, read: 0, secure: 0,
    ghosts: ESSAY_TYPES.slice(0, 3).map((t) => t.name), line: BLURB_ONE.essay, empty: "Nothing read" };
  const lensName = last.name;
  const line = own?.summary ? firstSentence(own.summary) : entry ? `${entry.label} lens · ${entry.detail}.` : `${lensName} lens, last read.`;
  return { app: "essay", kind: "last", at: last.lastAt, lens: last.id, lensName, estimate: Math.max(0, Math.min(1, last.estimate)),
    rail, read: totals.read, secure: totals.secure, ghosts: [], line, empty: null };
}

/** What every app on this desk has waiting, left to right. */
export function deskWaiting(s: Session): Waiting[] {
  return landingModules(s).map((m) => (m === "maths" ? mathsWaiting(s) : m === "english" ? lingaWaiting(s) : essayWaiting(s)));
}

/**
 * The object the lamp starts on - the one carrying the CONTINUE tag: the app whose waiting thing asks most
 * (marked, then resume, then next, then last), the most recent on a tie, the leftmost after that. With nothing
 * waiting anywhere there is no tag and the lamp rests on the first app. Null only when the desk has no app on it.
 */
export function continueStop(s: Session): { app: Subject; tagged: boolean } | null {
  const all = deskWaiting(s);
  if (!all.length) return null;
  const best = [...all].sort((x, y) => WAIT_PRIORITY[x.kind] - WAIT_PRIORITY[y.kind] || (y.at ?? 0) - (x.at ?? 0))[0];
  return best.kind === "none" ? { app: all[0].app, tagged: false } : { app: best.app, tagged: true };
}

/** The stop the lamp is on: the focus index, or at rest the continue object (the place card on a desk with no apps). */
export function landingAt(s: Session): number {
  const stops = landingStops(s);
  if (s.focus >= 0) return Math.min(stops.length - 1, s.focus);
  const c = continueStop(s);
  return c ? stops.indexOf(c.app) : stops.indexOf("place");
}
