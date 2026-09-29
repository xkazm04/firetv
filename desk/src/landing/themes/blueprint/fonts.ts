/**
 * The blueprint look's faces, self-hosted by next/font (no request to Google at runtime): Jost for the drafting
 * capitals (the giant name, the index, the learner's plate), IBM Plex Sans for the words, IBM Plex Mono for the
 * pairing code and address. Kept apart from landing/fonts.ts so a look that is never drawn never asks for them.
 * The class carries the CSS variables; design/desk-landing-blueprint.css builds --bp-display / --bp-body / --bp-mono
 * from them with system faces behind.
 */
import { IBM_Plex_Mono, IBM_Plex_Sans, Jost } from "next/font/google";

const display = Jost({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500"], display: "swap", variable: "--desk-face-bp-display", fallback: ["Century Gothic", "Segoe UI", "Arial", "sans-serif"] });
const body = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], display: "swap", variable: "--desk-face-bp-body", fallback: ["Segoe UI", "system-ui", "Arial", "sans-serif"] });
const mono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["500"], display: "swap", variable: "--desk-face-bp-mono", fallback: ["Consolas", "Courier New", "monospace"] });

/** The class that declares the font variables; it goes on the blueprint landing root and nowhere else. */
export const BLUEPRINT_FONTS = `${display.variable} ${body.variable} ${mono.variable}`;
