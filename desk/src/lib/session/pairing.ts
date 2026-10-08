/**
 * Who is asking. The desk has three kinds of caller, and this module is the one place that tells them apart:
 *
 * - the TV: the browser holding the desk's key. The key is minted once into DESK_DATA_DIR/pairing.json and printed
 *   at every start (src/instrumentation.ts) as the TV's address, /tv?key=...; opening it once sets an httpOnly
 *   desk-tv cookie (src/proxy.ts). An address cannot stand in for the key: a client may send its own
 *   x-forwarded-for.
 * - a phone: a device that gave the TV's code to the server. A join with the session's pin sets desk-phone, the
 *   HMAC of the key and that pin. The pin lives on the session only (the session is the only state), so a reset,
 *   which mints a new pin, lapses every phone at once, and the phones ask for the code again.
 * - a guest: anyone else on the network. A guest sees the lobby and may post only what joining needs.
 *
 * The proxy classifies every API request from its cookies and writes the role into x-desk-role; the session
 * routes draw that caller's view(). A request with no x-desk-role never came through the proxy - a test, or
 * retry's in-process call - and keeps the whole session.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSession, type Event, type Session } from "./store";
import { emptyEnglish } from "../english/types";

export type Role = "tv" | "phone" | "guest";
export const ROLE_HEADER = "x-desk-role";
export const TV_COOKIE = "desk-tv";
export const PHONE_COOKIE = "desk-phone";
/** The cookies outlive a browser restart; a phone's lapses anyway when the pin turns over. */
export const COOKIE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 400 };
export const WRONG_CODE = "That code is not on the TV.";
export const NO_CODE = "Type the code the TV shows.";
export const JOIN_FIRST = "Join the desk first: type the code the TV shows.";

const DATA = () => process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const FILE = () => path.join(DATA(), "pairing.json");

/** The desk's key, read once per change of the file (mtime), minted the first time it is asked for. */
let cached: { file: string; mtime: number; key: string } | null = null;
export function tvKey(): string {
  const file = FILE();
  try {
    if (existsSync(file)) {
      const mtime = statSync(file).mtimeMs;
      if (cached && cached.file === file && cached.mtime === mtime) return cached.key;
      const key = JSON.parse(readFileSync(file, "utf8"))?.key;
      if (typeof key === "string" && key.length >= 16) { cached = { file, mtime, key }; return key; }
    }
  } catch {}
  const key = randomBytes(24).toString("base64url");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ key }));
  cached = { file, mtime: statSync(file).mtimeMs, key };
  return key;
}

const sign = (msg: string) => createHmac("sha256", tvKey()).update(msg).digest("base64url");
/** What the TV's cookie holds: the key's signature, so the key itself never rides in a cookie. */
export const tvToken = () => sign("tv");
/** What a phone's cookie holds: the key's signature of the pin on the session now. */
export const phoneToken = (pin = getSession().pin) => sign(pin);
const same = (a: string | undefined, b: string) => { if (!a) return false; const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const isTvKey = (k: string | null | undefined) => same(k ?? undefined, tvKey());
/** A phone cookie is good while the pin it was minted for is still the session's. */
export const isPhone = (c: string | undefined) => { const pin = getSession().pin; return !!pin && same(c, phoneToken(pin)); };

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
    const k = part.slice(0, i).trim(); if (k && !all.has(k)) all.set(k, decodeURIComponent(part.slice(i + 1).trim()));
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
  status: "", log: { problems: [], hints: 0, hard: [], minutes: 0, started: null },
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
