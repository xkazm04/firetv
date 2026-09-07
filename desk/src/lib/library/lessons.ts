/**
 * The syllabus: lessons with concept tags authored to be matched, their transcripts in windows,
 * and — once computed — an embedding per window. Retrieval is "choose from the syllabus":
 * the model picks a lesson id or 'none', then the nearest window inside it is the seek target.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseVtt, windows, type Cue } from "./vtt";
import { embed, cosine } from "../engines/embed";

// Maths lessons are Khan Academy (CC BY-NC-SA); transcripts live in desk/data/lessons (local only).
import { LESSONS } from "./lessons.data";
export { LESSONS };
export type { Lesson } from "./lessons.data";

const DATA = path.join(process.cwd(), "data");
const cache = new Map<string, Cue[]>();
let vectors: Map<string, number[][]> | null = null;

export function lessonWindows(id: string): Cue[] {
  if (cache.has(id)) return cache.get(id)!;
  const f = path.join(DATA, "lessons", `${id}.en.vtt`);
  const w = existsSync(f) ? windows(parseVtt(readFileSync(f, "utf8")), 40) : [];
  cache.set(id, w); return w;
}

/** Embed every window once; cached to data/embeddings.json so a restart does not pay again. */
export async function ensureVectors(): Promise<Map<string, number[][]>> {
  if (vectors) return vectors;
  const f = path.join(DATA, "embeddings.json");
  if (existsSync(f)) { vectors = new Map(Object.entries(JSON.parse(readFileSync(f, "utf8")))); return vectors; }
  vectors = new Map();
  for (const l of LESSONS.filter((l) => l.youtube)) {
    const w = lessonWindows(l.id); if (!w.length) continue;
    const { json } = await embed({ texts: w.map((x) => x.text) });
    vectors.set(l.id, json);
  }
  mkdirSync(DATA, { recursive: true });
  writeFileSync(f, JSON.stringify(Object.fromEntries(vectors)));
  return vectors;
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
