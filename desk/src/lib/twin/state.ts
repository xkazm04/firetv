/**
 * The twin's own small state, beside the learner's pieces (DESK_DATA_DIR/texts/<learner>/twin.json): the card's id,
 * kept stable across exports (SPEC 3), when the twin was first made, and the pieces the learner left out of the
 * exemplars (the review step, SPEC 14). It lives in the learner's text folder, so "Delete everything I kept" removes it
 * too (texts.ts deleteAll). Server only.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface TwinState { cardId: string; createdAt: string; excluded: string[] }
const DATA = () => process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
const LEARNER_ID = /^[A-Za-z0-9_-]{1,64}$/;
const file = (learnerId: string) => path.join(DATA(), "texts", learnerId, "twin.json");

/** The pieces left out of the exemplars, read without making a state file (a delete-all must leave nothing behind). */
export function excludedOf(learnerId: string): string[] {
  if (!LEARNER_ID.test(learnerId)) return [];
  try { const j = JSON.parse(readFileSync(file(learnerId), "utf8")); return Array.isArray(j?.excluded) ? j.excluded.filter((x: unknown) => typeof x === "string") : []; } catch { return []; }
}
export function twinState(learnerId: string, now = new Date()): TwinState {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  try {
    const j = JSON.parse(readFileSync(file(learnerId), "utf8"));
    if (typeof j?.cardId === "string" && typeof j?.createdAt === "string") return { cardId: j.cardId, createdAt: j.createdAt, excluded: Array.isArray(j.excluded) ? j.excluded.filter((x: unknown) => typeof x === "string") : [] };
  } catch { /* none yet */ }
  const fresh: TwinState = { cardId: randomUUID(), createdAt: now.toISOString().replace(/\.\d{3}Z$/, "Z"), excluded: [] };
  saveTwinState(learnerId, fresh);
  return fresh;
}
export function saveTwinState(learnerId: string, st: TwinState): void {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  const f = file(learnerId);
  if (!existsSync(path.dirname(f))) mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(st));
}
