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

export function workroomOf(learnerId: string): Workroom {
  const cards = listPieces(learnerId);
  const full = cards.map((c) => getPiece(learnerId, c.id)).filter((p): p is NonNullable<typeof p> => !!p);
  const portrait = portraitOf(full, new Set(excludedOf(learnerId)));
  return {
    owner: learnerId,
    pieces: cards.map((c) => {
      const p = full.find((x) => x.id === c.id), v = p?.versions ?? [];
      return { ...c, diff: v.length >= 2 ? versionDiff(v[v.length - 2].text, v[v.length - 1].text) : null };
    }),
    channels: portrait.channels.map((c) => ({ channel: c.channel, pieces: c.pieces, born: c.born, words: c.dims ? levelWords(c.dims) : [] })),
    born: portrait.born, need: TWIN_BORN,
  };
}
