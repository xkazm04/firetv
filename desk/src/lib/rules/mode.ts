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
 * audienceAllowed (english/curriculum.ts) IS now re-expressed through adultContent below (v2 P6, owner V2-O7, 2026-10-08:
 * mode decides). Before, its "adult" row read isAdult, so an 18+ learner who chose Family was still offered the date
 * scene and called "an adult" by the tutor, while modeOf refused the same learner Cut, pitch and Take Two. Profiles
 * with no stored mode keep the frozen truth table (tools/mode-rules-test.cjs, the 240-row parity test).
 */
export type Mode = "family" | "adult";

/**
 * Age 18 or over, or - with no age - type "other" confirmed once: the profile's "Adult (18+)" (owner, 2026-10-07 V2-O3:
 * one confirmation, in the profile, is enough) or, as before, Linga's adult box. Moved here from english/curriculum.ts,
 * which re-exports it, so Linga's age gate (audienceAllowed) reads the profile's confirmation too.
 */
export function isAdult(p: Profile | undefined, prefs: EnglishPreferences | undefined): boolean {
  return p?.age !== undefined ? p.age >= 18 : p?.type === "other" && (p.mode === "adult" || !!prefs?.adultConfirmed);
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

/**
 * The one adult-content and audience decision (v2 P6, owner V2-O7: mode decides). True exactly when modeOf(p, prefs)
 * is "adult". Family mode hides adult content at any age: an 18+ learner who chose Family gets no adult-audience
 * scenes, is not called "an adult" by the tutor prompt, and gets a family-safe level check. isAdult stays the age
 * fact that modeOf and adultAllowed read; no audience or content decision calls isAdult directly.
 */
export function adultContent(p: Profile | undefined, prefs?: EnglishPreferences): boolean {
  return modeOf(p, prefs) === "adult";
}
