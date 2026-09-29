/**
 * The theme seam of the landing. A theme is a LOOK: it receives the view-model (landing/model.ts) and the zoom the
 * TV is playing, and draws them. It reads no session, owns no key and decides no words - the stops the D-pad walks,
 * what each app has waiting, the honesty rules and the Select hand-off are shared, so two themes can differ in
 * everything the eye sees and in nothing the product does.
 *
 * Hooks every theme keeps (the TV's automation and the tests read them): the root `data-role="desk-scene"` with
 * `data-lit` (the stop the D-pad is on), each app's `data-role="desk-object"` + `data-app` + `data-focused`, the big
 * action `desk-continue`, the second action `desk-place-card`, the phone `desk-phone` (+ `desk-pin`), the caption
 * `desk-caption`, and the zoom `desk-zoom`.
 */
import type { ReactElement } from "react";
import type { LandingStop } from "@/tv/landingRows";
import type { LandingView } from "@/landing/model";

/**
 * Which looks exist. "paper" is the product's landing (the contest winner A/1, "Small Worlds"). "blueprint" is the
 * shortlisted A/3, a drafting-sheet look kept for later; nothing selects it (themes/index.ts).
 */
export type ThemeId = "paper" | "blueprint";

export interface ThemeLandingProps {
  view: LandingView;
  /** Select was pressed on this stop: the theme plays its hand-off (LandingTV waits ZOOM_MS, then the app opens) */
  zoom: LandingStop | null;
  /** the room is being entered: this page load, for this learner (a look may play its arrival) */
  boot: boolean;
}

export interface LandingTheme {
  id: ThemeId;
  /** for people reading the registry, never shown */
  label: string;
  Landing: (props: ThemeLandingProps) => ReactElement;
}
