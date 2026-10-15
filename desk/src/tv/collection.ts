/**
 * The seated learner's collection as a screen reads it (lib/rules/collect.ts, v2 R1): named from the libraries, and
 * empty in Adult mode (X2). One helper so the three apps draw from the same derivation.
 */
import type { Session } from "@/lib/session/store";
import { collectibles, collectionShown, type CollectApp, type Collectible } from "@/lib/rules/collect";
import { topicIn } from "@/lib/library/paths";
import { ANALYSIS_TYPES } from "@/lib/rules/essay";
import { ENGLISH_SKILLS } from "@/lib/english/curriculum";

export function collectionOf(s: Session, app: CollectApp): Collectible[] {
  const me = s.profiles.find((p) => p.id === s.learner?.id);
  if (!s.learner || !collectionShown(me, s.englishLearning?.preferences ?? undefined)) return [];
  return collectibles({ skills: s.skills, writing: s.writing, english: s.englishLearning }, {
    topic: (id) => topicIn(id)?.name,
    lens: (id) => ANALYSIS_TYPES.find((t) => t.id === id)?.name,
    skill: (id) => ENGLISH_SKILLS.find((k) => k.id === id)?.name,
  })[app];
}
