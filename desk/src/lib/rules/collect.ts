/**
 * Collectibles (v2 R1; owner decisions 2026-10-07 V1: D3 reversed, X1 mastery collection, S1 each app's own world).
 * Pure: derived on every read from latches the desk already keeps, never stored, so nothing can be earned twice, by
 * volume, or by anything a model said.
 *
 *   app       object                      earned by (the only source)
 *   maths     a lit lamp (Lamplight)      a topic's usual record latched secure (learners.ts SkillRecord.secure)
 *   maths     a star over the lamp        the topic's step-up record latched secure (SkillRecord.stretch.secure): the extra mile
 *   essay     a pinned specimen           a lens's writing record latched secure
 *   english   a key (Open Door)           a skill "independent" (rules.ts evidenceProgress)
 *   english   a golden key                a skill "transfer": used across episodes and scenes
 *
 * Latches never unset (learners.ts, rules.ts), so a collectible once earned is never lost. No count is ever printed:
 * screens draw the objects, never a number (Family plan rule; D3 reversed only as far as the objects). Adult mode shows
 * progress, not a collection (X2): `collectionShown` is the one switch.
 */
import type { SkillRecord } from "../session/learners";
import type { EnglishLearning } from "../english/types";
import type { Profile } from "../session/store";
import type { EnglishPreferences } from "../english/types";
import { modeOf } from "./mode";

export type CollectApp = "maths" | "essay" | "english";
export type CollectKind = "lamp" | "star" | "specimen" | "key" | "golden-key";
export interface Collectible { app: CollectApp; kind: CollectKind; ref: string; label: string; }

/** Names for what each object stands for; an unknown id is shown as itself, never dropped. */
export interface Names { topic?: (id: string) => string | undefined; lens?: (id: string) => string | undefined; skill?: (id: string) => string | undefined; }

export interface Latches {
  skills?: Record<string, Pick<SkillRecord, "secure" | "lastSeen"> & { stretch?: Pick<NonNullable<SkillRecord["stretch"]>, "secure" | "lastSeen"> }>;
  writing?: Record<string, Pick<SkillRecord, "secure" | "lastSeen">>;
  english?: Pick<EnglishLearning, "achievements">;
}

/** Every collectible the latches hold, per app, oldest first (by the record's last sighting: the shelf grows rightwards). */
export function collectibles(l: Latches, names: Names = {}): Record<CollectApp, Collectible[]> {
  const byAge = <T extends { lastSeen: number }>(o: Record<string, T>) => Object.entries(o).sort((a, b) => a[1].lastSeen - b[1].lastSeen);
  const maths: Collectible[] = [];
  for (const [id, r] of byAge(l.skills ?? {})) {
    if (r.secure === true) maths.push({ app: "maths", kind: "lamp", ref: id, label: names.topic?.(id) ?? id });
    if (r.stretch?.secure === true) maths.push({ app: "maths", kind: "star", ref: id, label: names.topic?.(id) ?? id });
  }
  const essay: Collectible[] = byAge(l.writing ?? {}).filter(([, r]) => r.secure === true)
    .map(([id]) => ({ app: "essay", kind: "specimen", ref: id, label: names.lens?.(id) ?? id }));
  const english: Collectible[] = Object.entries(l.english?.achievements ?? {}).flatMap(([id, a]): Collectible[] =>
    a === "independent" ? [{ app: "english", kind: "key", ref: id, label: names.skill?.(id) ?? id }]
      : a === "transfer" ? [{ app: "english", kind: "golden-key", ref: id, label: names.skill?.(id) ?? id }] : []);
  return { maths, essay, english };
}

/** A collection is a Family thing; an adult sees progress, not objects (X2). */
export function collectionShown(p: Profile | undefined, prefs?: EnglishPreferences): boolean {
  return modeOf(p, prefs) === "family";
}
