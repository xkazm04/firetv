/**
 * The Calculus 2 spine: the integration-technique topics of a university Calculus II course as the desk names them -
 * id, the Stewart 9e and OpenStax sections they take, name, strand, a one-sentence blurb, prerequisites, and the practice
 * shapes each topic may use. NOTHING else: no example, no answer, no lesson (Calculus 2 has none, v2 M3b ruling 4).
 *
 * The topic list follows one public, openly licensed syllabus, cited and never quoted: OpenStax Calculus Volume 2, chapter 3
 * (Techniques of Integration), sections 3.1-3.5 and, from M3b-3b, 3.6 (Numerical Integration); from M3b-3c, chapter 5 section 5.1 (Sequences); the Stewart 9e numbers (chapter 7, sections 7.1-7.5 and 7.7; chapter 11, section 11.1) sit beside them.
 * Topic names and blurbs are OUR OWN WORDS. Improper integrals (7.8) are an M3b-3 candidate (approximate integration, 7.7, was built in M3b-3b); volumes, arc length and surface area (6.2, 6.3, 8.1, 8.2) are listed out (docs/MATH-COURSE-PATHS.md section 10).
 *
 * The five technique topics use only the two integral shapes (ruling 2), set and checked by the existing Calculus expression
 * engine; M3b-3b adds the first Calculus 2 shape (approx-integral, rules/calc2.ts) and its topic, and M3b-3c the second (sequence-limit, calc2-sequences). A prerequisite points only at an earlier topic of THIS spine (ruling 3).
 *
 * Client-safe: plain data, no import at all, so a TV screen, the phone and a pipeline may each read it.
 */

/**
 * The practice shapes a Calculus 2 topic may use: the two integral shapes of rules/calc.ts' nine (listed again in
 * tools/maths-paths-test.cjs), or, from M3b-3, an id of rules/calc2.ts CALC2_SHAPES (a type only: this file stays data and
 * pulls in no module at run time; M3b-3b put approx-integral there, M3b-3c sequence-limit).
 */
export type Calc2Shape = "antiderivative" | "definite-integral" | import("../rules/calc2").Calc2SpecShape;

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
  {
    id: "calc2-approx", sections: ["7.7"], openstax: ["3.6"],
    name: "Approximate integration", strand: "Techniques of integration",
    blurb: "When an integral has no closed form, its value is estimated by cutting the interval into equal pieces and combining the function's values with the trapezoid, midpoint or Simpson's rule.",
    prereq: [],
    shapes: ["approx-integral"],
  },
  {
    id: "calc2-sequences", sections: ["11.1"], openstax: ["5.1"],
    name: "Sequences", strand: "Sequences and series",
    blurb: "A sequence is a list of numbers indexed by n, and its limit is the value the terms settle towards, or the sign of the infinity they grow to, as n gets large.",
    prereq: [],
    shapes: ["sequence-limit"],
  },
];
