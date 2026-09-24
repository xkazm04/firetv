/**
 * The desk's own face, self-hosted by next/font (no request to Google at runtime): Figtree, as the winning landing
 * set it for Study Desk itself - the embossed wordmark, the place card, the phone and the caption. The apps' objects
 * keep their own faces (maths/fonts.ts, essay/fonts.ts; Linga is Georgia and Arial). Exposed as a CSS variable that
 * only the landing root carries; design/desk-landing.css builds --dk-house from it with system faces behind.
 */
import { Figtree } from "next/font/google";

const house = Figtree({
  subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"], display: "swap",
  variable: "--desk-face-house", fallback: ["Segoe UI", "system-ui", "Roboto", "sans-serif"],
});

/** The class that declares the font variable; it goes on the landing root and nowhere else. */
export const DESK_FONTS = house.variable;
