/**
 * Math Buddy's three faces, self-hosted by next/font (no request to Google at runtime), exactly as the
 * contest winner set them: Fraunces as the variable font with its optical-size and SOFT axes and its italic
 * (the headings, the wordmark's italic "Buddy", and maths as printed on a sheet), Caveat (the learner's hand)
 * and Manrope (the interface). Each is a CSS variable that only the Math Buddy root carries; the stylesheet
 * (design/maths-lamplight.css) builds --mb-serif / --mb-hand / --mb-sans from them with system faces behind.
 * If Google cannot be reached, `next dev` logs it and serves the fallbacks; `next build` needs the fetch once.
 */
import { Caveat, Fraunces, Manrope } from "next/font/google";

const serif = Fraunces({
  subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz", "SOFT"], display: "swap",
  variable: "--maths-face-serif", fallback: ["Georgia", "Times New Roman", "serif"],
});
const hand = Caveat({
  subsets: ["latin", "latin-ext"], display: "swap",
  variable: "--maths-face-hand", fallback: ["Segoe Print", "Bradley Hand", "Comic Sans MS", "cursive"],
});
const sans = Manrope({
  subsets: ["latin", "latin-ext"], display: "swap",
  variable: "--maths-face-sans", fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

/** The classes that declare the three font variables; they go on the Math Buddy root and nowhere else. */
export const MATHS_FONTS = `${serif.variable} ${hand.variable} ${sans.variable}`;
