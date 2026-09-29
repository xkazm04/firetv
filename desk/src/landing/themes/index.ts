/**
 * The registry of landing themes, and the lock on it.
 *
 * Product will later split the look by age - a children's landing and an adolescent one - and decide which theme
 * belongs to which tier. Until it does, the landing has ONE look, "paper", and no way to pick another:
 * THEMES_ENABLED is false, so themeFor() ignores whatever it is asked for and returns paper. There is no route, no
 * query parameter, no setting, no storage key and no UI that names a theme; LandingTV calls themeFor() with nothing.
 * To turn theme choice on, that is a product decision: flip the constant AND give it a real source (the profile's
 * age tier), in the same change - a test (tools/tv-landing-test.cjs) fails while anything else can reach a theme.
 *
 * Bundling note: the blueprint theme stays imported here so it typechecks and is testable, and a bundler cannot
 * prove the flag is never flipped at run time, so its code is still shipped (it is never rendered). Making it
 * tree-shake would mean moving it behind a dynamic import; that is left for the day the flag is turned on.
 */
import type { LandingTheme, ThemeId } from "./types";
import { PAPER } from "./paper";
import { BLUEPRINT } from "./blueprint";

/** Off until product decides the age tiers (children vs adolescent). Do not read this from the environment. */
export const THEMES_ENABLED = false;

export const DEFAULT_THEME: ThemeId = "paper";

/** Every theme that exists. Tests render any of these explicitly; the app goes through themeFor(). */
export const THEMES: Readonly<Record<ThemeId, LandingTheme>> = { paper: PAPER, blueprint: BLUEPRINT };

/** The theme the landing draws. With themes off (today) that is the default whatever is asked. */
export function themeFor(wanted?: ThemeId): LandingTheme {
  return THEMES_ENABLED && wanted ? THEMES[wanted] ?? THEMES[DEFAULT_THEME] : THEMES[DEFAULT_THEME];
}
