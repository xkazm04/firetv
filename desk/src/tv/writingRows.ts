import type { HistoryEntry, SkillRecord } from "@/lib/session/learners";
import { ANALYSIS_TYPES } from "@/lib/rules/essay";

/** Where the learner stands on one Essay Master lens: the measured estimate, and when it was last read. */
export interface LensStanding { id: string; name: string; seen: number; estimate: number; secure: boolean; lastAt: number | null }

/**
 * One standing per lens, in the lens order the TV draws. The measured record carries the estimate
 * and its own last reading; a writing episode on the history counts as a reading too, so a reading
 * made before the lens was measured still says when it happened.
 */
export function lensStandings(history: HistoryEntry[] | undefined, writing: Record<string, SkillRecord> | undefined): LensStanding[] {
  return ANALYSIS_TYPES.map((t) => {
    const r = writing?.[t.id];
    const episodes = (history ?? []).filter((h) => h.kind === "writing" && h.label === t.name).map((h) => h.at);
    const last = Math.max(r?.seen ? r.lastSeen : 0, ...episodes);
    return { id: t.id, name: t.name, seen: r?.seen ?? 0, estimate: r?.estimate ?? 0, secure: r?.secure === true, lastAt: last > 0 ? last : null };
  });
}

/** The ticker's two counts: paragraphs read across every lens, and lenses secure. */
export function writingTotals(standings: LensStanding[], history: HistoryEntry[] | undefined): { read: number; secure: number } {
  const measured = standings.reduce((a, l) => a + l.seen, 0);
  const episodes = (history ?? []).filter((h) => h.kind === "writing").length;
  // the record is uncapped and the history keeps only the last twenty, so the larger one is the truer count
  return { read: Math.max(measured, episodes), secure: standings.filter((l) => l.secure).length };
}
