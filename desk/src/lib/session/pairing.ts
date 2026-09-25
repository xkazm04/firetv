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
 * The session as this caller may see it. The TV: all of it, pin included. A phone: all of it but the pin, and
 * joined - this device is. A guest: the lobby - where the TV is, whose desk it is, and the name being typed while
 * the TV is on the profile; nothing of the learner's evening, and no pin. In-process (null): the session itself.
 */
export function view(s: Session, role: Role | null): Session {
  if (role === null) return s;
  if (role === "tv") return { ...s, viewer: "tv" };
  if (role === "phone") return { ...s, pin: "", joined: true, viewer: "phone" };
  return {
    ...s, viewer: "guest", pin: "", joined: false,
    profiles: [], draft: s.screen === "profile" ? s.draft : null, tasks: [], back: undefined,
    pages: [], pageIx: 0, itemIx: 0, reading: false, awaiting: null,
    hint: null, lesson: null, noLesson: false, lessonPaused: false,
    english: null, essay: null, essayType: null, essayAt: null,
    englishLearning: emptyEnglish(), conversation: null, check: null,
    topic: null, practice: null, walkIx: 0, skills: {}, writing: {}, memory: [], history: [], jobs: {},
    status: "", log: { problems: [], hints: 0, hard: [], minutes: 0, started: null },
  };
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
