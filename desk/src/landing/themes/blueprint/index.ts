import type { LandingTheme } from "../types";
import { BlueprintLanding } from "./Blueprint";

/**
 * The shortlisted drafting-sheet look (contest A/3, "blueprint"). Kept for the day product splits the landing by age
 * (children vs adolescent); LOCKED OFF meanwhile - the registry (themes/index.ts) does not let anything select it.
 */
export const BLUEPRINT: LandingTheme = { id: "blueprint", label: "Blueprint (contest A/3)", Landing: BlueprintLanding };
