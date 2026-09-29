/**
 * The landing's faces, self-hosted by next/font (no request to Google at runtime). The default look ("paper", the
 * contest winner A/1) sets its paper-cut names and headings in Fraunces (a variable serif with an optical-size axis,
 * so the huge title and the 40px wordmark each get their own cut), its words in DM Sans, and the pairing code and
 * address in DM Mono. Each is exposed as a CSS variable that only the landing root carries; design/desk-landing.css
 * builds --pp-serif / --pp-sans / --pp-mono from them with system faces behind. Another look brings its own faces
 * (themes/blueprint/fonts.ts) so a theme that is never drawn never asks for them.
 */
import { DM_Mono, DM_Sans, Fraunces } from "next/font/google";

const serif = Fraunces({ subsets: ["latin", "latin-ext"], axes: ["opsz"], display: "swap", variable: "--desk-face-serif", fallback: ["Georgia", "Times New Roman", "serif"] });
const sans = DM_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], display: "swap", variable: "--desk-face-sans", fallback: ["Segoe UI", "system-ui", "Arial", "sans-serif"] });
const mono = DM_Mono({ subsets: ["latin", "latin-ext"], weight: ["500"], display: "swap", variable: "--desk-face-mono", fallback: ["Consolas", "Courier New", "monospace"] });

/** The class that declares the font variables; it goes on the landing root and nowhere else. */
export const DESK_FONTS = `${serif.variable} ${sans.variable} ${mono.variable}`;
