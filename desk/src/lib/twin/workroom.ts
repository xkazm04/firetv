/**
 * The Workroom as the TV may see it (v2 T2): titles and counts of the learner's pieces, what changed in the last
 * version, and the twin's portrait as level words. Never a sentence of the learner's text (the curtain): the PC page
 * and the phone show the words, the TV shows marks. Server only (reads the text store).
 */
import { getPiece, listPieces } from "../session/texts";
import { versionDiff, type VersionDiff } from "../rules/diff";
import { portraitOf, levelWords, TWIN_BORN, type TwinChannel } from "./card";
import { excludedOf } from "./state";
import type { Dims } from "../rules/style";

export interface WorkroomPiece { id: string; title: string; format: string; versions: number; paragraphs: number; updated: number; diff: VersionDiff | null }
export interface Workroom { owner: string; pieces: WorkroomPiece[]; channels: { channel: TwinChannel; pieces: number; born: boolean; words: { dim: keyof Dims; level: number; word: string }[] }[]; born: boolean; need: number }

/**
 * The last change of a piece, diffed once per version pair. workroomOf runs on every keep and every /api/twin call, and the
 * LCS is quadratic in sentences: at the caps (50 pieces, 100 KB a version) a full re-diff held the server's one thread
 * for ~2.8 s each time. Versions only append (texts.ts), so the piece id, the version count and the last version's time
 * name a pair; the memo is bounded and derived, never state.
 */
const DIFFS = new Map<string, VersionDiff>(), DIFFS_MAX = 500;
function lastDiff(id: string, v: { at: number; text: string }[]): VersionDiff | null {
  if (v.length < 2) return null;
  const before = v[v.length - 2], after = v[v.length - 1], key = `${id}:${v.length}:${after.at}:${before.text.length}:${after.text.length}`;
  let d = DIFFS.get(key);
  if (!d) {
    d = versionDiff(before.text, after.text);
    if (DIFFS.size >= DIFFS_MAX) DIFFS.delete(DIFFS.keys().next().value as string);
    DIFFS.set(key, d);
  }
  return d;
}

export function workroomOf(learnerId: string): Workroom {
  const cards = listPieces(learnerId);
  const full = cards.map((c) => getPiece(learnerId, c.id)).filter((p): p is NonNullable<typeof p> => !!p);
  const portrait = portraitOf(full, new Set(excludedOf(learnerId)));
  return {
    owner: learnerId,
    pieces: cards.map((c) => {
      const p = full.find((x) => x.id === c.id);
      return { ...c, diff: lastDiff(c.id, p?.versions ?? []) };
    }),
    channels: portrait.channels.map((c) => ({ channel: c.channel, pieces: c.pieces, born: c.born, words: c.dims ? levelWords(c.dims) : [] })),
    born: portrait.born, need: TWIN_BORN,
  };
}
