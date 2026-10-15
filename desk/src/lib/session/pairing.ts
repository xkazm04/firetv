/**
 * Who is asking. The desk has three kinds of caller, and this module is the one place that tells them apart:
 *
 * - the TV: the browser holding the desk's key. The key is minted once into DESK_DATA_DIR/pairing.json and printed
 *   at every start (src/instrumentation.ts) as the TV's address, /tv?key=...; opening it once sets an httpOnly
 *   desk-tv cookie (src/proxy.ts). An address cannot stand in for the key: a client may send its own
 *   x-forwarded-for.
 * - a phone: a device that gave the TV's code to the server. A join with the session's pin mints a random token for
 *   that phone (node:crypto) and sets it as desk-phone. pairing.json keeps beside the key each phone's fingerprint (the
 *   SHA-256 of its token, never the token), when it joined and when it was last seen; a cookie is a phone while its
 *   fingerprint is listed. No credential holds the pin.
 * - a guest: anyone else on the network. A guest sees the lobby and may post only what joining needs.
 *
 * The proxy classifies every API request from its cookies and writes the role into x-desk-role; the session
 * routes draw that caller's view(). A request with no x-desk-role never came through the proxy - a test, or
 * retry's in-process call - and keeps the whole session.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSession, type Event, type Session } from "./store";
import { emptyEnglish } from "../english/types";
import { dataDir } from "../dataDir";

export type Role = "tv" | "phone" | "guest";
export const ROLE_HEADER = "x-desk-role";
export const TV_COOKIE = "desk-tv";
export const PHONE_COOKIE = "desk-phone";
/** The cookies outlive a browser restart; a phone's token lives as long as its fingerprint is listed. */
export const COOKIE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 400 };
export const WRONG_CODE = "That code is not on the TV.";
export const NO_CODE = "Type the code the TV shows.";
export const JOIN_FIRST = "Join the desk first: type the code the TV shows.";
export const TOO_MANY_CODES = "Too many wrong codes. Wait five minutes, then type the code again.";
/** What the route answers (500) when pairing.json cannot be written: nothing changed, and the phone is told what to do. */
export const JOIN_NOT_SAVED = "The desk could not save this phone, so nothing changed. Type the same code again.";
export const LEAVE_NOT_SAVED = "The desk could not forget this phone, so it is still paired. Try again.";
export const RESET_NOT_SAVED = "The desk could not forget its phones, so nothing was reset. Try again.";

/**
 * The join's brake. A 4-digit pin has only 9000 values, so a refused join waits before it answers, and a desk-wide
 * budget of wrong codes ends in a cooldown. The pin never turns over on a lockout (that would lapse every joined
 * phone). The count lives in memory on the global object, so a dev reload keeps it and a restart clears it.
 * The TV and an in-process join (role tv, or none) are never delayed or counted by it; the route says who is guarded.
 */
const JOIN_DELAY_MS = 1000, JOIN_BUDGET = 10, JOIN_COOLDOWN_MS = 5 * 60_000;
const joinGuard = () => { const g = globalThis as unknown as { __deskJoin?: { wrong: number; until: number } }; return (g.__deskJoin ??= { wrong: 0, until: 0 }); };
/** Every refused join waits the same time before it answers. DESK_JOIN_DELAY_MS sets it, read at each call (the tests set 0). */
export function joinDelay(): Promise<void> {
  const ms = Number(process.env.DESK_JOIN_DELAY_MS ?? JOIN_DELAY_MS);
  return ms > 0 ? new Promise((done) => setTimeout(done, ms)) : Promise.resolve();
}
/** True while the cooldown runs; when it has ended the count starts again from zero. */
export function joinCooling(): boolean {
  const g = joinGuard();
  if (g.until && Date.now() >= g.until) { g.until = 0; g.wrong = 0; }
  return g.until > 0;
}
/** A join refused for a wrong code: the tenth starts the cooldown. */
export function joinWrongCode(): void {
  const g = joinGuard();
  if (++g.wrong >= JOIN_BUDGET) { g.until = Date.now() + JOIN_COOLDOWN_MS; g.wrong = 0; }
}
/** A join that succeeded: the count is zero. */
export function joinSucceeded(): void { joinGuard().wrong = 0; }

const FILE = () => path.join(dataDir(), "pairing.json");

/** One phone as pairing.json lists it: the SHA-256 of its token (hex), when it joined and when it was last seen (epoch ms). */
interface Phone { fp: string; joined: number; seen: number; saved: number }
/** A phone not seen for this long lapses; the desk lists at most CAP; last seen is written at most once an hour per phone. */
const LAPSE_MS = 30 * 24 * 3600_000, CAP = 8, SEEN_EVERY_MS = 3600_000;
const FP = /^[0-9a-f]{64}$/;
const phoneOk = (p: unknown): p is Omit<Phone, "saved"> => !!p && typeof p === "object" && FP.test((p as Phone).fp) && Number.isFinite((p as Phone).joined) && Number.isFinite((p as Phone).seen);

/**
 * The desk's key and its phones, read once per change of the file (mtime, and size: two writes of one size in one
 * clock tick would otherwise hide each other). The key is minted the first time it is asked for, with no phones.
 */
let cached: { file: string; mtime: number; size: number; key: string; phones: Phone[]; /** minted, and its file could not be written yet */ unsaved?: true } | null = null;
const stamp = (file: string) => { const st = statSync(file); return { mtime: st.mtimeMs, size: st.size }; };
function state() {
  const file = FILE();
  let why = "";
  try {
    // a key minted this run that could not be written stays the desk's key: a new one per request would lock the TV out
    if (cached?.unsaved && cached.file === file && !existsSync(file)) return cached;
    if (existsSync(file)) {
      const at = stamp(file);
      if (cached && cached.file === file && cached.mtime === at.mtime && cached.size === at.size) return cached;
      const j = JSON.parse(readFileSync(file, "utf8"));
      if (typeof j?.key === "string" && j.key.length >= 16) {
        cached = { file, ...at, key: j.key, phones: Array.isArray(j.phones) ? j.phones.filter(phoneOk).map((p: Phone) => ({ fp: p.fp, joined: p.joined, seen: p.seen, saved: p.seen })) : [] };
        return cached;
      }
      why = "it holds no usable key";
    }
  } catch (e) { why = `it could not be read (${e instanceof Error ? e.message : e})`; }
  // an unusable file is renamed beside itself, never written over (store.ts setAside does the same for session.json):
  // its phones are the operator's to recover, and a read that failed for a moment must not erase them
  if (why) {
    const to = `${file}.bad-${Date.now().toString(36)}`;
    let where: string;
    try { renameSync(file, to); where = `put aside as ${path.basename(to)}`; } catch (e) { where = `not put aside (${e instanceof Error ? e.message : e})`; }
    console.error(`desk pairing: ${file} was not used, ${why}; ${where}; a new key was minted, so the TV must open the new address printed at start`);
  }
  mkdirSync(path.dirname(file), { recursive: true });
  cached = { file, mtime: 0, size: 0, key: randomBytes(24).toString("base64url"), phones: [] };
  try { save(cached); }
  catch (e) {
    cached.unsaved = true;
    console.error(`desk pairing: ${file} could not be written (${e instanceof Error ? e.message : e}); the key printed at start holds for this run only, and no phone can join until the desk can write it`);
  }
  return cached;
}
/**
 * Write the key and the next list of phones through a temp file in the same directory and a rename, so a crash leaves
 * the old file or the new one, never half of one. A phone that has lapsed is dropped from what is written. Only when
 * the write has succeeded does the cache take the list and follow the file; a write that throws leaves the cache as it was.
 */
function commit(st: NonNullable<typeof cached>, next: Phone[]): void {
  const phones = next.filter((p) => Date.now() - p.seen <= LAPSE_MS);
  const tmp = `${st.file}.${process.pid}.tmp`;
  try {
    writeFileSync(tmp, JSON.stringify({ key: st.key, phones: phones.map(({ fp, joined, seen }) => ({ fp, joined, seen })) }));
    renameSync(tmp, st.file);
  } catch (e) { try { unlinkSync(tmp); } catch {} throw e; }
  st.phones = phones;
  for (const p of st.phones) p.saved = p.seen;
  Object.assign(st, stamp(st.file));
  delete st.unsaved;
}
const save = (st: NonNullable<typeof cached>) => commit(st, st.phones);
export function tvKey(): string { return state().key; }

const sign = (msg: string) => createHmac("sha256", tvKey()).update(msg).digest("base64url");
/** What the TV's cookie holds: the key's signature, so the key itself never rides in a cookie. */
export const tvToken = () => sign("tv");
const same = (a: string | undefined, b: string) => { if (!a) return false; const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const isTvKey = (k: string | null | undefined) => same(k ?? undefined, tvKey());
const fingerprint = (token: string) => createHash("sha256").update(token).digest();
/** The listed phone this cookie is, or undefined. Every entry is compared, in constant time, so the answer does not say how far a guess got. */
function listed(c: string | undefined): Phone | undefined {
  if (!c) return undefined;
  const fp = fingerprint(c);
  let hit: Phone | undefined;
  for (const p of state().phones) if (timingSafeEqual(Buffer.from(p.fp, "hex"), fp)) hit = p;
  return hit;
}
/**
 * A phone cookie is good while its fingerprint is listed and its phone has been seen in the last 30 days. Being asked
 * about is being seen: the time is kept in memory, and written only when the stored one is an hour old. A write that
 * fails logs one line and is tried again in an hour; the caller is a phone for this request all the same.
 */
export function isPhone(c: string | undefined): boolean {
  const p = listed(c), now = Date.now();
  if (!p || now - p.seen > LAPSE_MS) return false;
  p.seen = now;
  if (now - p.saved >= SEEN_EVERY_MS) {
    try { save(state()); } catch (e) { p.saved = now; console.error(`desk pairing: last seen could not be written to ${state().file} (${e instanceof Error ? e.message : e}); the phone stays a phone`); }
  }
  return true;
}
/**
 * A guarded join with the right code: a new random token for this phone, its fingerprint listed. A phone that
 * joins again (it sends its old cookie) has its entry replaced. The token is returned and never written.
 */
export function mintPhone(old?: string): string {
  const st = state(), token = randomBytes(32).toString("base64url"), now = Date.now(), was = listed(old);
  const next = st.phones.filter((p) => p !== was);
  next.push({ fp: fingerprint(token).toString("hex"), joined: now, seen: now, saved: now });
  // a ninth phone forgets the one seen least recently (the earliest listed, when two were seen together)
  while (next.length > CAP) next.splice(next.reduce((at, p, i) => (p.seen < next[at].seen ? i : at), 0), 1);
  commit(st, next);
  return token;
}
/** Forget this device: its fingerprint goes, so its cookie is dead wherever it was copied. A write that fails throws and changes nothing. */
export function forgetPhone(old: string | undefined): void {
  const st = state(), was = listed(old);
  if (!was) return;
  commit(st, st.phones.filter((p) => p !== was));
}
/** A TV reset: every phone is forgotten. */
export function forgetAllPhones(): void {
  const st = state();
  if (!st.phones.length) return;
  commit(st, []);
}

/** Anything with cookies: a NextRequest's, or a plain Request's Cookie header read by cookiesOf(). */
export interface Jar { get(name: string): { value: string } | undefined }
export function roleOf(jar: Jar): Role {
  if (same(jar.get(TV_COOKIE)?.value, tvToken())) return "tv";
  if (isPhone(jar.get(PHONE_COOKIE)?.value)) return "phone";
  return "guest";
}
export function cookiesOf(req: Request): Jar {
  const all = new Map<string, string>();
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("="); if (i < 0) continue;
    const k = part.slice(0, i).trim(); if (!k || all.has(k)) continue;
    // a value that will not decode is left out, as Next's own parser does (@edge-runtime/cookies parseCookie), so the proxy and the stream agree
    try { all.set(k, decodeURIComponent(part.slice(i + 1).trim())); } catch {}
  }
  return { get: (name) => (all.has(name) ? { value: all.get(name)! } : undefined) };
}

/** The role the proxy wrote, or null for a caller that never came through it (in-process: the whole session). */
export function roleFrom(req?: Request | null): Role | null {
  const r = req?.headers?.get(ROLE_HEADER);
  return r === "tv" || r === "phone" || r === "guest" ? r : null;
}
/**
 * The role on a connection that stays open (the stream), asked again for each message: a phone whose pin has
 * turned over since it connected is a guest from then on. The TV's key does not turn over; a guest who joins
 * opens a new stream.
 */
export function liveRole(req?: Request | null): Role | null {
  const r = roleFrom(req);
  if (r !== "phone") return r;
  return isPhone(cookiesOf(req!).get(PHONE_COOKIE)?.value) ? "phone" : "guest";
}

/**
 * The Session keys a guest may see: the lobby - where the TV is, whose desk it is, and (on the profile screen only)
 * the name being typed. This is the unjoined /phone page's whole read: `screen` and `subject` word the Join panel
 * (page.tsx:377, :382), `learner` and `draft` the Profile panel (:390, :403), `phoneUrl` and `updatedAt` are the
 * lobby's own. `viewer`, `pin` and `joined` are set by view() itself.
 */
export const LOBBY = ["viewer", "pin", "joined", "phoneUrl", "learner", "subject", "screen", "updatedAt", "draft"] as const satisfies readonly (keyof Session)[];
export type LobbyKey = (typeof LOBBY)[number];

/**
 * Every other Session key, at its empty value. The type makes tsc fail when a Session key is in neither LOBBY nor
 * here, so a new field is a guest-blank by decision, never by omission. focus, view and timer are here: the unjoined
 * page reads none of them (its only read of the timer, page.tsx:598, is on the joined Tonight panel).
 */
export const GUEST_BLANK = {
  profiles: [], tasks: [], back: undefined,
  focus: 0, view: "band", timer: { left: 25 * 60, running: false, phase: "work" },
  pages: [], pageIx: 0, itemIx: 0, reading: false, awaiting: null,
  hint: null, lesson: null, noLesson: false, lessonPaused: false, watch: null,
  english: null, essay: null, essayType: null, essayAt: null, essayPlan: undefined,
  englishLearning: emptyEnglish(), conversation: null, check: null,
  topic: null, practice: null, walkIx: 0, worked: undefined, workroom: undefined,
  skills: {}, writing: {}, memory: [], history: [], week: undefined, paper: undefined, jobs: {}, away: undefined,
  status: "", essayRefused: undefined, log: { problems: [], hints: 0, hard: [], minutes: 0, started: null },
} satisfies { [K in Exclude<keyof Session, LobbyKey>]-?: Session[K] };

/**
 * The session as this caller may see it. The TV: all of it, pin included. A phone: all of it but the pin, and
 * joined - this device is. No caller is sent the Math Buddy work of learners not at the desk (`away`). The Sunday page's
 * lines (`week`, Family W9) go to a phone only: the Parent tab is where they are read; the TV and a guest are not sent them.
 * A guest: an allowlist, never a copy - the LOBBY keys (where the TV is, whose desk it is, and the name being typed
 * while the TV is on the profile) and every other key at its GUEST_BLANK value; nothing of the learner's evening, and no pin.
 * In-process (null): the session itself.
 */
export function view(s: Session, role: Role | null): Session {
  if (role === null) return s;
  if (role === "guest") {
    const guest: Session = {
      ...structuredClone(GUEST_BLANK),
      viewer: "guest", pin: "", joined: false,
      phoneUrl: s.phoneUrl, learner: s.learner, subject: s.subject, screen: s.screen, updatedAt: s.updatedAt,
      draft: s.screen === "profile" ? s.draft : null,
    };
    // an absent key is absent (away, week, back, essayPlan, worked, workroom), not sent as undefined
    for (const k of Object.keys(guest) as (keyof Session)[]) if (guest[k] === undefined) delete guest[k];
    return guest;
  }
  // the other learners' Math Buddy work (store.ts MathsSlot) is theirs: no screen is sent it
  const { away: _away, week, ...seen } = s;
  if (role === "tv") return { ...seen, viewer: "tv" };
  return { ...seen, ...(week !== undefined ? { week } : {}), pin: "", joined: true, viewer: "phone" };
}

/**
 * What a guest may post: the join (its code is checked by the route), Show the code on the TV, and the new
 * learner's name while the TV is on the profile - the phone names a learner before it joins. Nothing else.
 */
export function guestMay(s: Session, e: Event): boolean {
  if (e.type === "join" || e.type === "leave") return true;
  if (e.type === "nav") return e.screen === "pair";
  if (e.type === "profile.draft") return s.screen === "profile" && !!e.patch && Object.keys(e.patch).length === 1 && typeof e.patch.name === "string";
  return false;
}

/** The TV's address, as the desk prints it at start. */
export function tvAddress(): string {
  return getSession().phoneUrl.replace(/\/phone$/, "/tv") + "?key=" + encodeURIComponent(tvKey());
}
