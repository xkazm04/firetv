/**
 * Essay Master's two faces, self-hosted by next/font (no request to Google at runtime). Bricolage Grotesque
 * is loaded as the variable font with its optical-size and width axes, because the giant lens words are set
 * at width 75; IBM Plex Mono sets the labels. Each is exposed as a CSS variable that only the Essay Master
 * root carries (essay-specimen.css builds --em-disp / --em-mono from them, with system fallbacks behind).
 * If Google cannot be reached, `next dev` logs it and serves the fallback faces; `next build` needs the fetch
 * once, exactly as the On Air faces in app/layout.tsx do.
 */
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"], axes: ["opsz", "wdth"], display: "swap",
  variable: "--essay-face-display", fallback: ["Arial Narrow", "Segoe UI", "system-ui", "sans-serif"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"], weight: ["500", "600"], display: "swap",
  variable: "--essay-face-mono", fallback: ["Consolas", "Courier New", "monospace"],
});

/** The classes that declare the two font variables; they go on the Essay Master root and nowhere else. */
export const ESSAY_FONTS = `${display.variable} ${mono.variable}`;
