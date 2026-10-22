/**
 * The twin's own small state, beside the learner's pieces (DESK_DATA_DIR/texts/<learner>/twin.json): the card's id,
 * kept stable across exports (SPEC 3), when the twin was first made, and the pieces the learner left out of the
 * exemplars (the review step, SPEC 14). It lives in the learner's text folder, so "Delete everything I kept" removes it
 * too (texts.ts deleteAll). This file decides what the state is; the session's texts.ts does the writing (only the
 * session writes, .ai/memory/0018). Server only.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { setAsideTwinFile, twinFileOf, writeTwinFile } from "../session/texts";

export interface TwinState { cardId: string; createdAt: string; excluded: string[] }
const LEARNER_ID = /^[A-Za-z0-9_-]{1,64}$/;
const file = twinFileOf;
const why = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * twin.json as the state it holds: "none" when there is no file (the twin is new), "unread" with the reason when a file
 * is there that the desk cannot read - the learner's left-out pieces and the card's id are in it, so it is never taken
 * for "none" and never written over (learners.ts readBook, pairing.ts and store.ts setAside do the same).
 */
type Read = { state: TwinState } | { none: true } | { unread: string };
function readTwin(learnerId: string): Read {
  let text: string;
  try { text = readFileSync(file(learnerId), "utf8"); }
  catch (e) { return (e as NodeJS.ErrnoException)?.code === "ENOENT" ? { none: true } : { unread: `it could not be read (${why(e)})` }; }
  try {
    const j = JSON.parse(text);
    if (typeof j?.cardId === "string" && typeof j?.createdAt === "string") return { state: { cardId: j.cardId, createdAt: j.createdAt, excluded: Array.isArray(j.excluded) ? j.excluded.filter((x: unknown) => typeof x === "string") : [] } };
    return { unread: "it holds no card id" };
  } catch (e) { return { unread: `it is not readable JSON (${why(e)})` }; }
}
let told = "";
/** Once per distinct failure: the twin is read on every Workroom request. */
function tell(line: string): void { if (line !== told) console.error(line); told = line; }

/** The pieces left out of the exemplars, read without making a state file (a delete-all must leave nothing behind). */
export function excludedOf(learnerId: string): string[] {
  if (!LEARNER_ID.test(learnerId)) return [];
  const r = readTwin(learnerId);
  if ("unread" in r) tell(`desk twin: ${file(learnerId)} was not used, ${r.unread}; no piece is left out until it is read or put aside`);
  return "state" in r ? r.state.excluded : [];
}
export function twinState(learnerId: string, now = new Date()): TwinState {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  const r = readTwin(learnerId);
  if ("state" in r) return r.state;
  const fresh: TwinState = { cardId: randomUUID(), createdAt: now.toISOString().replace(/\.\d{3}Z$/, "Z"), excluded: [] };
  if ("unread" in r) {
    // renamed beside itself, never written over: the old card id and left-out pieces stay the operator's to recover
    const f = file(learnerId);
    let to: string;
    try { to = setAsideTwinFile(learnerId); }
    catch (e) { tell(`desk twin: ${f} was not used, ${r.unread}; not put aside (${why(e)}), so nothing is saved over it`); return fresh; }
    console.error(`desk twin: ${f} was not used, ${r.unread}; put aside as ${path.basename(to)}; a new card id was made`);
  }
  saveTwinState(learnerId, fresh);
  return fresh;
}
/** Written whole through the session's texts.ts (a temporary name, then renamed over): a crash mid-write leaves the old state. */
export function saveTwinState(learnerId: string, st: TwinState): void {
  if (!LEARNER_ID.test(learnerId)) throw new Error("no learner");
  writeTwinFile(learnerId, JSON.stringify(st));
}
