import { createElement } from "react";
import type { LandingTheme } from "../types";

/** Placeholder until the blueprint port lands: the drafting-sheet look (contest A/3), kept locked (themes/index.ts). */
export const BLUEPRINT: LandingTheme = {
  id: "blueprint", label: "Blueprint (contest A/3)",
  Landing: () => createElement("div", { "data-role": "desk-scene", "data-theme": "blueprint" }),
};
