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
 *   "adult"        any                                                               as if unset (NOT honoured in Phase 1, see below)
 *   unset          true: age >= 18, or no age and type "other" with the adult box    adult
 *                  ticked in prefs
 *   unset          false: age 17 or under (so a 15-17-year-old is family), no age    family
 *                  with type elementary or high-school, type "other" unconfirmed,
 *                  no profile at all
 *
 * An explicit stored "adult" is deliberately not honoured yet: nothing sets it (the reducer drops it from every
 * profile.draft patch, see modeChecked in session/store.ts), no screen reaches Adult, and the Adult build's slice A5
 * adds the gate and the switch that will honour it. Until then the mode is the derived value, so a hand-edited
 * session.json cannot move a 12-year-old into Adult.
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

export function modeOf(p: Profile | undefined, prefs?: EnglishPreferences): Mode {
  if (p?.mode === "family") return "family";
  return isAdult(p, prefs) ? "adult" : "family";
}
