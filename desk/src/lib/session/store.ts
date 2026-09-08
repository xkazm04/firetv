/**
 * One session, on the server, pushed to every subscriber as it changes.
 *
 * The phone POSTs events; the TV (and the phone) subscribe over SSE. The reducer is pure; engine
 * work happens in the route handlers and lands as further events. Kept on globalThis so Next's
 * dev reloads do not lose the desk mid-session; persisted as JSON on every change.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { AGE_RANGE } from "@/tv/profileRows";
import path from "node:path";
import type { RuleCard } from "../rules/english";
import type { Sentence } from "../rules/essay";

export type Subject = "maths" | "english" | "essay";
export type Screen = "landing" | "pair" | "joined" | "tonight" | "units" | "calendar" | "page" | "hint" | "lesson" | "sentence" | "headtohead" | "essaytype" | "forensic" | "playbook" | "xray" | "break" | "recap" | "learner" | "profile";

export type StudentType = "elementary" | "high-school" | "other";
export interface Profile { id: string; name: string; type: StudentType; age?: number; modules: Subject[]; }


export interface PageItem { n: number; text: string; cx: number; cy: number; band: [number, number]; key: string; }
export interface Page { id: string; subject: Subject; title: string; img: string; w: number; h: number; items: PageItem[]; readMs?: number; provider?: string; }
export interface Task { id: string; sub: Subject; name: string; min: number; done: boolean; }
export interface Hint { key: string; problem: string; stage: 1 | 2; hint1: { hint: string; next: string } | null; hint2: { hint: string; next: string } | null; askedQ: string; rule?: RuleCard; provider?: string; ms?: number; }
export interface LessonPick { id: string; title: string; t: number; text: string; why: string; youtube?: string; }
export interface EnglishAnalysis { sentence: string; card: RuleCard; explanation: string; provider?: string; }
export interface Verdict { n: number; verdict: "strong" | "faulty" | "neutral"; note: string; }
export interface EssayAnalysis { text: string; type: string; sentences: Sentence[]; stats: Record<string, number>; verdicts: Verdict[]; summary: string; provider?: string; }

export interface Session {
  pin: string; joined: boolean; phoneUrl: string; learner: { id: string; name: string };
  profiles: Profile[]; draft: Profile | null;
  subject: Subject; screen: Screen; focus: number; view: "band" | "overview"; back?: Screen;
  tasks: Task[]; timer: { left: number; running: boolean; phase: "work" | "break"; before?: Screen };
  pages: Page[]; pageIx: number; itemIx: number; reading: boolean;
  /** The desk has asked for a page and is waiting for the phone to snap it. */
  awaiting: Subject | null;
  hint: Hint | null; lesson: LessonPick | null; noLesson: boolean; lessonPaused: boolean;
  english: EnglishAnalysis | null; essay: EssayAnalysis | null; essayType: string | null;
  status: string; log: { problems: string[]; hints: number; hard: string[]; minutes: number; started: number | null };
  updatedAt: number;
}

export type Event =
  | { type: "join" } | { type: "nav"; screen: Screen; focus?: number; from?: Screen } | { type: "focus"; focus: number }
  | { type: "subject"; subject: Subject }
  | { type: "learner.set"; id: string }
  | { type: "profile.draft"; patch: Partial<Profile> } | { type: "profile.save" } | { type: "profile.discard" }
  | { type: "page.reading"; page: Omit<Page, "items"> } | { type: "page.read"; id: string; items: PageItem[]; readMs: number; provider: string }
  | { type: "page.ask"; subject: Subject } | { type: "page.unask" }
  | { type: "page.select"; pageIx: number; itemIx?: number } | { type: "item"; itemIx: number } | { type: "view"; view: "band" | "overview" }
  | { type: "hint.set"; hint: Hint } | { type: "hint.stage"; stage: 1 | 2 }
  | { type: "lesson.set"; lesson: LessonPick | null } | { type: "lesson.pause"; paused: boolean }
  | { type: "english.set"; analysis: EnglishAnalysis } | { type: "essay.type"; essayType: string } | { type: "essay.set"; analysis: EssayAnalysis }
  | { type: "task.add"; name: string; sub: Subject; min: number } | { type: "task.done"; id: string; done: boolean }
  | { type: "timer.start" } | { type: "timer.pause" } | { type: "timer.tick"; seconds: number } | { type: "timer.skipbreak" }
  | { type: "status"; text: string } | { type: "session.end" } | { type: "reset" };

const DATA = path.join(process.cwd(), "data");
const FILE = path.join(DATA, "session.json");

/** Where the phone lives on this network — a fact of the server, so the session carries it. */
function phoneUrl(): string {
  const ip = Object.values(networkInterfaces()).flat().find((n) => n && n.family === "IPv4" && !n.internal)?.address ?? "localhost";
  return `http://${ip}:${process.env.PORT ?? "3000"}/phone`;
}

export function fresh(): Session {
  return {
    pin: String(1000 + Math.floor(Math.random() * 9000)), joined: false, phoneUrl: phoneUrl(), learner: { id: "ema", name: "Ema" },
    profiles: [
      { id: "ema", name: "Ema", type: "high-school", age: 16, modules: ["maths", "english", "essay"] },
      { id: "jakub", name: "Jakub", type: "other", modules: ["english", "essay"] },
    ], draft: null,
    subject: "maths", screen: "landing", focus: 0, view: "band",
    tasks: [
      { id: "t1", sub: "maths", name: "Algebra — Exercise 4.2, all ten", min: 25, done: false },
      { id: "t2", sub: "english", name: "Unit 6 — past simple vs present perfect", min: 15, done: false },
      { id: "t3", sub: "essay", name: "Later school starts — first draft", min: 15, done: false },
    ],
    timer: { left: 25 * 60, running: false, phase: "work" },
    pages: [], pageIx: 0, itemIx: 0, reading: false, awaiting: null,
    hint: null, lesson: null, noLesson: false, lessonPaused: false,
    english: null, essay: null, essayType: null,
    status: "", log: { problems: [], hints: 0, hard: [], minutes: 0, started: null }, updatedAt: Date.now(),
  };
}

export function reduce(s: Session, e: Event): Session {
  const n: Session = { ...s, updatedAt: Date.now() };
  switch (e.type) {
    // a draft in progress owns the screen: joining must not throw the parent off the profile
    case "join": n.joined = true; if (s.screen !== "profile") { n.screen = "joined"; n.focus = 0; } break;
    case "nav": n.screen = e.screen; n.focus = e.focus ?? 0; if (e.from) n.back = e.from; break;
    case "focus": n.focus = e.focus; break;
    case "learner.set": { const p = s.profiles.find((x) => x.id === e.id); if (!p) break; n.learner = { id: p.id, name: p.name }; n.screen = "tonight"; n.focus = 0; break; }
    case "profile.draft": { const d: Profile = { ...(s.draft ?? { id: "p" + Date.now(), name: "", type: "high-school" as StudentType, modules: ["maths", "english", "essay"] as Subject[] }), ...e.patch };
      const r = AGE_RANGE[d.type]; if (!r || (d.age !== undefined && (d.age < r[0] || d.age > r[1]))) delete d.age; n.draft = d; break; }
    case "profile.save": { const d = s.draft; if (!d || !d.name.trim()) break; const has = s.profiles.some((p) => p.id === d.id);
      n.profiles = has ? s.profiles.map((p) => (p.id === d.id ? d : p)) : [...s.profiles, d];
      n.learner = { id: d.id, name: d.name }; n.draft = null; n.screen = "tonight"; n.focus = 0; break; }
    case "profile.discard": n.draft = null; n.screen = "learner"; n.focus = 0; break;
    case "subject": n.subject = e.subject; break;
    case "page.reading": { const ix = s.pages.findIndex((p) => p.id === e.page.id);
      const page: Page = { ...e.page, items: [] }; n.pages = ix >= 0 ? s.pages.map((p, i) => (i === ix ? page : p)) : [...s.pages, page];
      n.pageIx = ix >= 0 ? ix : n.pages.length - 1; n.itemIx = 0; n.reading = true; n.screen = "page"; n.subject = e.page.subject; n.awaiting = null; break; }
    // the desk asks for a page and stays where it is; the phone answers with page.reading
    case "page.ask": n.awaiting = e.subject; n.subject = e.subject; break;
    case "page.unask": n.awaiting = null; break;
    case "page.read": n.pages = s.pages.map((p) => (p.id === e.id ? { ...p, items: e.items, readMs: e.readMs, provider: e.provider } : p)); n.reading = false; break;
    case "page.select": n.pageIx = e.pageIx; n.itemIx = e.itemIx ?? 0; break;
    case "item": n.itemIx = e.itemIx; break;
    case "view": n.view = e.view; break;
    case "hint.set": n.hint = e.hint; n.screen = "hint"; n.focus = 0; n.log = { ...s.log, problems: Array.from(new Set([...s.log.problems, e.hint.key])), hints: s.log.hints + 1 }; break;
    case "hint.stage": if (n.hint) { n.hint = { ...n.hint, stage: e.stage }; if (e.stage === 2) n.log = { ...s.log, hints: s.log.hints + 1, hard: Array.from(new Set([...s.log.hard, n.hint.problem])) }; } break;
    case "lesson.set": n.lesson = e.lesson; n.noLesson = !e.lesson; break;
    case "lesson.pause": n.lessonPaused = e.paused; break;
    case "english.set": n.english = e.analysis; n.screen = "sentence"; n.subject = "english"; n.focus = 0; break;
    case "essay.type": n.essayType = e.essayType; break;
    case "essay.set": n.essay = e.analysis; n.screen = "forensic"; n.subject = "essay"; n.focus = 0; break;
    case "task.add": n.tasks = [...s.tasks, { id: "t" + Date.now(), sub: e.sub, name: e.name, min: e.min, done: false }]; break;
    case "task.done": n.tasks = s.tasks.map((t) => (t.id === e.id ? { ...t, done: e.done } : t)); break;
    case "timer.start": n.timer = { ...s.timer, running: true }; if (!s.log.started) n.log = { ...s.log, started: Date.now() }; break;
    case "timer.pause": n.timer = { ...s.timer, running: false }; break;
    case "timer.tick": { if (!s.timer.running) break; const left = Math.max(0, s.timer.left - e.seconds); const t = { ...s.timer, left };
      if (t.phase === "work") n.log = { ...s.log, minutes: s.log.minutes + e.seconds / 60 };
      if (left === 0) { if (t.phase === "work") { t.phase = "break"; t.left = 5 * 60; t.before = s.screen; n.screen = "break"; } else { t.phase = "work"; t.left = 25 * 60; n.screen = t.before ?? "page"; } }
      n.timer = t; break; }
    case "timer.skipbreak": n.timer = { ...s.timer, phase: "work", left: 25 * 60 }; n.screen = s.timer.before ?? "page"; break;
    case "status": n.status = e.text; break;
    case "session.end": n.timer = { ...s.timer, running: false }; n.screen = "recap"; n.focus = 0; break;
    case "reset": return fresh();
  }
  return n;
}

// ---- the singleton, HMR-proof ----
type Sub = (s: Session) => void;
interface Store { session: Session; subs: Set<Sub>; ticker: NodeJS.Timeout | null; }
const g = globalThis as unknown as { __desk?: Store };
function load(): Session { try { if (existsSync(FILE)) { const j = JSON.parse(readFileSync(FILE, "utf8")); if (Array.isArray(j?.profiles) && j?.learner?.id && j.profiles.every((p: Profile) => p.type in AGE_RANGE)) return { ...fresh(), ...j, reading: false }; } } catch {} return fresh(); }
if (!g.__desk) g.__desk = { session: load(), subs: new Set(), ticker: null };
const store = g.__desk;
if (!store.ticker) store.ticker = setInterval(() => { if (store.session.timer.running) dispatch({ type: "timer.tick", seconds: 1 }); }, 1000);

export function getSession() { return store.session; }
export function dispatch(e: Event): Session {
  store.session = reduce(store.session, e);
  try { mkdirSync(DATA, { recursive: true }); writeFileSync(FILE, JSON.stringify(store.session)); } catch {}
  store.subs.forEach((fn) => { try { fn(store.session); } catch {} });
  return store.session;
}
export function subscribe(fn: Sub) { store.subs.add(fn); return () => store.subs.delete(fn); }
