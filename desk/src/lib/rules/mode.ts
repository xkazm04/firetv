import type { Profile } from "../session/store";
import type { EnglishPreferences } from "../english/types";

/**
 * The desk's two modes, as a seam (Family mode, Phase 1, W4; owner decision D1: no parent lock in Phase 1).
 * Pure: type-only imports, so the store, the rules and the tests can all load it without a cycle.
 *
 * modeOf(profile, prefs?) - which mode a learner is in:
 *
 *   profile.mode   isAdult(profile, prefs)                                            modeOf
 *   ------------   ------------------------------------------------------------      ------
 *   "family"       any                                                               family   (Family is always allowed, at any age)
 *   "adult"        adultAllowed(profile): age >= 18, or no age and type "other"       adult    (v2, slice A5, owner O1 = 18+)
 *   "adult"        not allowed (under 18, or a school type with no age)              as if unset
 *   unset          true: age >= 18, or no age and type "other" with the adult box    adult
 *                  ticked in prefs
 *   unset          false: age 17 or under (so a 15-17-year-old is family), no age    family
 *                  with type elementary or high-school, type "other" unconfirmed,
 *                  no profile at all
 *
 * The Adult gate (slice A5; v2 decisions 2026-10-07 V5, answering O1 with 18+). The profile screen's Mode row offers
 * Adult only where adultAllowed holds; for type "other" (no age row) choosing "Adult (18+)" is the learner's own
 * confirmation, as the Linga adult box is. A stored "adult" is honoured only while the gate holds, so a hand-edited
 * session.json cannot move a 12-year-old into Adult, and a draft whose age drops under 18 loses it (session/store.ts).
 * Family is always allowed, at any age.
 *
 * audienceAllowed (english/curriculum.ts) is NOT re-expressed through this: its truth table is pinned by
 * tools/mode-rules-test.cjs against a frozen copy, and an explicit mode "family" on an adult would change its
 * "adult" answer. modeOf sits beside it.
 */
export type Mode = "family" | "adult";

/** Age 18 or over, or - with no age - type "other" and the adult box ticked. Moved here from english/curriculum.ts, which re-exports it. */
export function isAdult(p: Profile | undefined, prefs: EnglishPreferences | undefined): boolean {
  return p?.age !== undefined ? p.age >= 18 : p?.type === "other" && !!prefs?.adultConfirmed;
}

/** May this profile be put in Adult mode? 18 or over, or - with no age - type "other" (the Mode row is the confirmation). */
export function adultAllowed(p: Pick<Profile, "age" | "type"> | undefined): boolean {
  return p?.age !== undefined ? p.age >= 18 : p?.type === "other";
}

export function modeOf(p: Profile | undefined, prefs?: EnglishPreferences): Mode {
  if (p?.mode === "family") return "family";
  if (p?.mode === "adult" && adultAllowed(p)) return "adult";
  return isAdult(p, prefs) ? "adult" : "family";
}
