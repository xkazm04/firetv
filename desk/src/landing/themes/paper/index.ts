import { createElement } from "react";
import type { LandingTheme } from "../types";

/** Placeholder until the paper port lands. */
export const PAPER: LandingTheme = {
  id: "paper", label: "Paper (contest A/1, Small Worlds)",
  Landing: () => createElement("div", { "data-role": "desk-scene", "data-theme": "paper" }),
};
