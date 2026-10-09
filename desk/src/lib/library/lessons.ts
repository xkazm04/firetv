/**
 * The syllabus: lessons with concept tags authored to be matched, their transcripts in windows,
 * and — once computed — an embedding per window. Retrieval is "choose from the syllabus":
 * the model picks a lesson id or 'none', then the nearest window inside it is the seek target.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { parseVtt, windows, type Cue } from "./vtt";
import { embed, cosine, EMBED_MODEL } from "../engines/embed";

// Maths lessons are Khan Academy (CC BY-NC-SA); transcripts live in <data>/lessons (local only).
import { LESSONS } from "./lessons.data";
export { LESSONS };
export type { Lesson } from "./lessons.data";

// The same data directory as the session store and the learner records (store.ts, learners.ts).
const DATA = process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const cache = new Map<string, Cue[]>();
let vectors: Map<string, number[][]> | null = null;

export function lessonWindows(id: string): Cue[] {
  if (cache.has(id)) return cache.get(id)!;
  const f = path.join(DATA, "lessons", `${id}.en.vtt`);
  const w = existsSync(f) ? windows(parseVtt(readFileSync(f, "utf8")), WINDOW_SECONDS) : [];
  cache.set(id, w); return w;
}

/** The window size the transcripts are cut at, in seconds; part of what the vector cache is keyed on. */
const WINDOW_SECONDS = 40;
const CACHE_VERSION = 2;
type Cached = { digest: string; vectors: number[][] };

/** What a lesson's vectors were computed from: its windows' text and the window size. */
function digestOf(w: Cue[]): string {
  return createHash("sha256").update(`${WINDOW_SECONDS}\u0000${w.map((x) => x.text).join("\u0000")}`).digest("hex");
}

const wellFormed = (v: unknown, n: number): v is number[][] =>
  Array.isArray(v) && v.length === n && v.every((x) => Array.isArray(x) && x.length > 0 && x.length === (v[0] as unknown[]).length && x.every((c) => typeof c === "number" && Number.isFinite(c)));

/** The entries of the cache file that are still good for this model; a bad, old or foreign file is an empty answer, never a throw. */
function readCache(f: string): Map<string, Cached> {
  const out = new Map<string, Cached>();
  try {
    if (!existsSync(f)) return out;
    const j = JSON.parse(readFileSync(f, "utf8"));
    if (!j || typeof j !== "object" || j.v !== CACHE_VERSION || j.model !== EMBED_MODEL || !j.lessons || typeof j.lessons !== "object") return out;
    for (const [id, e] of Object.entries(j.lessons as Record<string, Cached>))
      if (e && typeof e.digest === "string" && Array.isArray(e.vectors)) out.set(id, e);
  } catch { /* an unreadable cache is rebuilt */ }
  return out;
}

/** The cache file is written to a temp file beside it, then renamed over it, so a crash never leaves half a file. */
function writeCache(f: string, entries: Map<string, Cached>): void {
  const tmp = `${f}.${process.pid}.${Date.now().toString(36)}.tmp`;
  try {
    mkdirSync(DATA, { recursive: true });
    writeFileSync(tmp, JSON.stringify({ v: CACHE_VERSION, model: EMBED_MODEL, lessons: Object.fromEntries(entries) }));
    renameSync(tmp, f);
  } catch { try { rmSync(tmp, { force: true }); } catch {} }
}

let building: Promise<Map<string, number[][]>> | null = null;

async function build(): Promise<Map<string, number[][]>> {
  const f = path.join(DATA, "embeddings.json");
  const old = readCache(f), next = new Map<string, Cached>(), out = new Map<string, number[][]>();
  let changed = false;
  for (const l of LESSONS.filter((l) => l.youtube)) {
    const w = lessonWindows(l.id); if (!w.length) continue;
    const digest = digestOf(w), had = old.get(l.id);
    if (had && had.digest === digest && wellFormed(had.vectors, w.length)) { next.set(l.id, had); out.set(l.id, had.vectors); continue; }
    const { json } = await embed({ texts: w.map((x) => x.text) });
    if (!wellFormed(json, w.length)) throw new Error(`the embedding engine did not answer with ${w.length} usable vector(s) for ${l.id}`);
    next.set(l.id, { digest, vectors: json }); out.set(l.id, json); changed = true;
  }
  if (changed || old.size !== next.size) writeCache(f, next);
  return out;
}

/**
 * Embed every window once; cached to <data>/embeddings.json so a restart does not pay again. Callers that arrive while a
 * build runs share it. The map is published only when every lesson is embedded: a throw anywhere resets the state and
 * caches nothing, so the next call asks the engine again.
 */
export async function ensureVectors(): Promise<Map<string, number[][]>> {
  if (vectors) return vectors;
  if (!building) {
    building = build().then((v) => { vectors = v; return v; }).finally(() => { building = null; });
  }
  return building;
}

/** Nearest window in a lesson to a query — the seek target. */
export async function bestWindow(lessonId: string, query: string): Promise<{ t: number; text: string; score: number } | null> {
  const w = lessonWindows(lessonId); if (!w.length) return null;
  const vecs = (await ensureVectors()).get(lessonId); if (!vecs) return { t: w[0].t, text: w[0].text, score: 0 };
  const [q] = (await embed({ texts: [query] })).json;
  let best = 0, bs = -1;
  vecs.forEach((v, i) => { const s = cosine(q, v); if (s > bs) { bs = s; best = i; } });
  return { t: w[best].t, text: w[best].text, score: bs };
}
