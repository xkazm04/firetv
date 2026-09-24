/**
 * The Open Door palette, as the winning entry drew it: warm cream ground, plum and wine for the solid shapes,
 * peach and amber for light, one muted green for leaves. Every illustration takes its colours from here, so a
 * scene never invents a hue the rest of Linga does not use.
 */
import { useId } from "react";

export const P = {
  // plum, darkest to lightest
  ink: "#332d39", plum900: "#432d43", plum800: "#493247", plum700: "#503648", plum600: "#5b3b4b",
  plum500: "#60394e", plum400: "#693c4c", frame: "#6a3946", plum300: "#6d4252", plinth: "#5d3548",
  // wine and rose
  wine: "#803b51", wine2: "#8c5360", rose900: "#a34f60", rose700: "#ad5a61", rose600: "#b65e61",
  rose500: "#b96d69", rose400: "#ba6b65", brick: "#bb675b",
  // peach and amber
  peach700: "#d89475", peach600: "#e4a27c", peach500: "#e6ad87", peach400: "#f1c293", peach300: "#f5c395",
  peach200: "#f6d0a2", amber: "#d89367", honey: "#f4cd95",
  // cream
  cream: "#fff0ca", cream2: "#fff2d2", cream3: "#fff3dc", paper: "#f9dfb1", collar: "#fbdeba",
  // leaves
  leaf: "#6c7560", stem: "#4d5c55",
} as const;

/** Skin: face, ear and neck shade, and the line of the nose. */
export const SKIN = {
  light: ["#f1c3a4", "#e3a88d", "#c48877"],
  warm: ["#e9ad92", "#db9d83", "#ba7c71"],
  tan: ["#c98a6c", "#b87a5e", "#9a5e4c"],
  deep: ["#8f5a45", "#7d4c3a", "#5e3528"],
} as const;
export type Skin = keyof typeof SKIN;

/** Hair: the front, the back that frames the face, and the one highlight stroke. */
export const HAIR = {
  plum: ["#503648", "#5b3b4b", "#6e4955"],
  dark: ["#30242f", "#3b2c39", "#574355"],
  auburn: ["#8c4a3c", "#7a3f35", "#a8604b"],
  amber: ["#b8703f", "#a5633a", "#d08f5c"],
} as const;
export type HairTone = keyof typeof HAIR;

/** A gradient or filter id unique to this drawing, so two scenes on one screen never share a `url(#…)`. */
export function useUid(): string { return "a" + useId().replace(/[^A-Za-z0-9_-]/g, ""); }
