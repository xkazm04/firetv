/**
 * The Calculus 2 spine: the five integration-technique topics of a university Calculus II course as the desk names them -
 * id, the Stewart 9e and OpenStax sections they take, name, strand, a one-sentence blurb, prerequisites, and the practice
 * shapes each topic may use. NOTHING else: no example, no answer, no lesson (Calculus 2 has none, v2 M3b ruling 4).
 *
 * The topic list follows one public, openly licensed syllabus, cited and never quoted: OpenStax Calculus Volume 2, chapter 3
 * (Techniques of Integration), sections 3.1-3.5; the Stewart 9e numbers (chapter 7, sections 7.1-7.5) sit beside them.
 * Topic names and blurbs are OUR OWN WORDS. Improper integrals (7.8) and approximate integration (7.7) are M3b-3's
 * candidates; volumes, arc length and surface area (6.2, 6.3, 8.1, 8.2) are listed out (docs/MATH-COURSE-PATHS.md section 10).
 *
 * Only the two integral shapes are used: no shape is added (ruling 2), so every topic is set and checked by the existing
 * Calculus expression engine. A prerequisite points only at an earlier topic of THIS spine (ruling 3).
 *
 * Client-safe: plain data, no import at all, so a TV screen, the phone and a pipeline may each read it.
 */

/** The two practice shapes of an integration topic: ids of rules/calc.ts' nine, listed again in tools/maths-paths-test.cjs. */
export type Calc2Shape = "antiderivative" | "definite-integral";

export interface Calc2SpineTopic {
  id: string;
  /** Stewart 9e section numbers, as strings ("7.1"). */
  sections: string[];
  /** OpenStax Calculus Volume 2 section numbers, as strings ("3.1"). */
  openstax: string[];
  name: string;
  strand: string;
  /** ONE sentence, our own words, for the caption slot. */
  blurb: string;
  /** Topic ids of this spine, each an earlier topic. */
  prereq: string[];
  /** The practice shapes this topic may use - at least one. */
  shapes: Calc2Shape[];
}

export const CALC2_SPINE: Calc2SpineTopic[] = [
  {
    id: "calc2-parts", sections: ["7.1"], openstax: ["3.1"],
    name: "Integration by parts", strand: "Techniques of integration",
    blurb: "A product that is hard to integrate directly is traded for a simpler integral by choosing which factor to differentiate and which to integrate.",
    prereq: [],
    shapes: ["antiderivative", "definite-integral"],
  },
  {
    id: "calc2-trig-integrals", sections: ["7.2"], openstax: ["3.2"],
    name: "Trigonometric integrals", strand: "Techniques of integration",
    blurb: "Powers and products of sine and cosine are integrated by peeling off a factor, or by an identity that lowers the power.",
    prereq: ["calc2-parts"],
    shapes: ["antiderivative", "definite-integral"],
  },
  {
    id: "calc2-trig-sub", sections: ["7.3"], openstax: ["3.3"],
    name: "Trigonometric substitution", strand: "Techniques of integration",
    blurb: "A square root of a sum or difference of squares is cleared by letting x be a multiple of a sine, tangent or secant.",
    prereq: ["calc2-trig-integrals"],
    shapes: ["antiderivative", "definite-integral"],
  },
  {
    id: "calc2-partial-fractions", sections: ["7.4"], openstax: ["3.4"],
    name: "Partial fractions", strand: "Techniques of integration",
    blurb: "A rational function is split into simpler fractions, one for each factor of its denominator, and each is integrated on its own.",
    prereq: ["calc2-parts"],
    shapes: ["antiderivative", "definite-integral"],
  },
  {
    id: "calc2-strategy", sections: ["7.5"], openstax: ["3.5"],
    name: "Choosing a technique", strand: "Techniques of integration",
    blurb: "Faced with an integral and no label, you read its form and pick substitution, parts, a trig method or partial fractions.",
    prereq: ["calc2-trig-sub", "calc2-partial-fractions"],
    shapes: ["antiderivative", "definite-integral"],
  },
];
