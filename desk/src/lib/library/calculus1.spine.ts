/**
 * The Calculus 1 spine: the 22 topics of a university Calculus I course as the desk names them - id, the syllabus
 * sessions and Stewart sections they take, name, strand, a one-sentence blurb, prerequisites, and the practice shapes
 * each topic may use. NOTHING else: no example, no answer. The example corpus lives in calculus1.ts, which takes its
 * spine fields from here and only adds examples by id; paths.ts builds the 'calc1' path from here.
 *
 * Topic names and blurbs are OUR OWN WORDS (the editorial stance of syllabus.ts and calculus1.ts); the session order
 * follows the public sample syllabus cited in calculus1.ts, cited and never quoted.
 *
 * Client-safe: plain data, no import at all, so a TV screen, the phone and a pipeline may each read it.
 */

/**
 * A practice shape: the kind of question the Calculus expression engine can set and check for a topic. The nine ids
 * are a CONTRACT with desk/src/lib/rules/calc.ts (and are listed again in tools/maths-paths-test.cjs): a shape added
 * here needs a generator there.
 */
export type CalcShape =
  | "evaluate"
  | "derivative"
  | "derivative-at"
  | "antiderivative"
  | "definite-integral"
  | "limit"
  | "critical-point"
  | "extremum"
  | "newton-step";

export interface CalcSpineTopic {
  id: string;
  /** The syllabus sessions this topic takes. */
  sessions: number[];
  /** Stewart 9e section numbers, as strings ("2.3"); empty where the syllabus names none. */
  sections: string[];
  name: string;
  strand: string;
  /** ONE sentence, our own words, for the caption slot. */
  blurb: string;
  /** Topic ids of this spine, each an earlier topic. */
  prereq: string[];
  /** The practice shapes this topic may use - at least one. */
  shapes: CalcShape[];
}

export const CALC1_SPINE: CalcSpineTopic[] = [
  {
    id: "calc1-functions", sessions: [1], sections: ["1.1", "1.2", "1.3"],
    name: "Functions, and new functions from old", strand: "Functions",
    blurb: "A function gives each input one output, and shifting, stretching and combining known graphs builds new ones.",
    prereq: [],
    shapes: ["evaluate"],
  },
  {
    id: "calc1-trig", sessions: [2], sections: [],
    name: "Trigonometric functions", strand: "Functions",
    blurb: "Sine, cosine and tangent read an angle in radians as a point on the unit circle, and their graphs repeat.",
    prereq: ["calc1-functions"],
    shapes: ["evaluate"],
  },
  {
    id: "calc1-exp-log", sessions: [3], sections: ["1.4", "1.5"],
    name: "Exponentials, inverse functions and logarithms", strand: "Functions",
    blurb: "The logarithm undoes the exponential, so an equation with x in the exponent is solved by taking logs.",
    prereq: ["calc1-functions"],
    shapes: ["evaluate"],
  },
  {
    id: "calc1-limit-idea", sessions: [4], sections: ["2.1", "2.2"],
    name: "The tangent problem and the idea of a limit", strand: "Limits",
    blurb: "Secant slopes over shrinking intervals approach the tangent slope, and that approach is what a limit names.",
    prereq: ["calc1-functions"],
    shapes: ["limit"],
  },
  {
    id: "calc1-limit-laws", sessions: [5], sections: ["2.3"],
    name: "Limit laws and the squeeze theorem", strand: "Limits",
    blurb: "Limits of sums, products and quotients follow from the limits of their parts, and a function trapped between two with the same limit shares it.",
    prereq: ["calc1-limit-idea"],
    shapes: ["limit"],
  },
  {
    id: "calc1-continuity", sessions: [6], sections: ["2.5", "2.6"],
    name: "Continuity and asymptotes", strand: "Limits",
    blurb: "A function is continuous where its graph has no break, and its behaviour far out or near a blow-up shows as asymptotes.",
    prereq: ["calc1-limit-laws"],
    shapes: ["limit"],
  },
  {
    id: "calc1-derivative", sessions: [7], sections: ["2.7", "2.8"],
    name: "The derivative as a limit and as a function", strand: "Derivatives",
    blurb: "The derivative is the limit of difference quotients, and read at every point it becomes a new function.",
    prereq: ["calc1-continuity"],
    shapes: ["derivative", "derivative-at"],
  },
  {
    id: "calc1-rules", sessions: [10], sections: ["3.1", "3.2"],
    name: "Derivatives of polynomials, and the product and quotient rules", strand: "Derivatives",
    blurb: "A power differentiates by bringing its exponent down, and products and quotients have rules built from their parts.",
    prereq: ["calc1-derivative"],
    shapes: ["derivative"],
  },
  {
    id: "calc1-trig-derivatives", sessions: [11], sections: ["3.3"],
    name: "Derivatives of trigonometric functions", strand: "Derivatives",
    blurb: "Sine and cosine differentiate into each other, and the rest of the trig family follows from the quotient rule.",
    prereq: ["calc1-rules", "calc1-trig"],
    shapes: ["derivative"],
  },
  {
    id: "calc1-chain", sessions: [12], sections: ["3.4", "3.5"],
    name: "The chain rule and implicit differentiation", strand: "Derivatives",
    blurb: "The chain rule differentiates a function inside a function, and implicit differentiation applies it to y as a function of x.",
    prereq: ["calc1-rules"],
    shapes: ["derivative"],
  },
  {
    id: "calc1-log-derivative", sessions: [13], sections: ["3.6", "3.7", "3.8"],
    name: "The derivative of the logarithm, and rates in the world", strand: "Derivatives",
    blurb: "The logarithm differentiates to one over x, which opens logarithmic differentiation and models of growth and decay.",
    prereq: ["calc1-chain", "calc1-exp-log"],
    shapes: ["derivative", "derivative-at"],
  },
  {
    id: "calc1-related-rates", sessions: [14], sections: ["3.9", "3.10"],
    name: "Related rates and linear approximation", strand: "Derivatives",
    blurb: "When quantities are tied by an equation their rates are tied too, and a tangent line gives a close value near its point.",
    prereq: ["calc1-chain"],
    shapes: ["derivative-at"],
  },
  {
    id: "calc1-extrema", sessions: [15], sections: ["4.1", "4.2"],
    name: "Maxima, minima and the mean value theorem", strand: "Applications of derivatives",
    blurb: "Extreme values sit at critical numbers or at the ends of an interval, and the mean value theorem promises a tangent parallel to any secant.",
    prereq: ["calc1-rules"],
    shapes: ["critical-point", "extremum"],
  },
  {
    id: "calc1-shape", sessions: [16, 17], sections: ["4.3", "4.4", "4.5"],
    name: "The second derivative, L'Hospital's rule and curve sketching", strand: "Applications of derivatives",
    blurb: "The second derivative shows where a graph bends up or down, L'Hospital's rule settles 0/0 limits, and together they draw the curve.",
    prereq: ["calc1-extrema", "calc1-log-derivative"],
    shapes: ["limit"],
  },
  {
    id: "calc1-optimisation", sessions: [18], sections: ["4.7"],
    name: "Optimisation", strand: "Applications of derivatives",
    blurb: "An optimisation problem becomes one function of one variable, and its best value sits where the derivative is zero or at an end.",
    prereq: ["calc1-shape"],
    shapes: ["extremum"],
  },
  {
    id: "calc1-newton", sessions: [19], sections: ["4.8"],
    name: "Newton's method", strand: "Applications of derivatives",
    blurb: "Newton's method follows tangent lines to where they cross the axis, and each step usually doubles the correct digits.",
    prereq: ["calc1-rules"],
    shapes: ["newton-step"],
  },
  {
    id: "calc1-antiderivatives", sessions: [20], sections: ["4.9"],
    name: "Antiderivatives", strand: "Integrals",
    blurb: "An antiderivative runs differentiation backwards, and any two of them differ by a constant.",
    prereq: ["calc1-log-derivative", "calc1-trig-derivatives"],
    shapes: ["antiderivative"],
  },
  {
    id: "calc1-definite-integral", sessions: [23], sections: ["5.1"],
    name: "The definite integral", strand: "Integrals",
    blurb: "Adding thin rectangles under a curve and letting their width shrink defines the area as a definite integral.",
    prereq: ["calc1-antiderivatives", "calc1-limit-laws"],
    shapes: ["definite-integral"],
  },
  {
    id: "calc1-area-so-far", sessions: [24], sections: ["5.2"],
    name: "The area-so-far function", strand: "Integrals",
    blurb: "Letting the upper limit of an integral move turns the area under a curve into a function of that limit.",
    prereq: ["calc1-definite-integral"],
    shapes: ["definite-integral"],
  },
  {
    id: "calc1-ftc", sessions: [25], sections: ["5.3", "5.4"],
    name: "The fundamental theorem and net change", strand: "Integrals",
    blurb: "The fundamental theorem ties the two halves of calculus together: an area function differentiates back to its integrand, and an antiderivative evaluates a definite integral.",
    prereq: ["calc1-area-so-far"],
    shapes: ["definite-integral"],
  },
  {
    id: "calc1-substitution", sessions: [26], sections: ["5.5"],
    name: "The substitution rule", strand: "Integrals",
    blurb: "Substitution runs the chain rule backwards by naming an inner function u, so the integral becomes one in u.",
    prereq: ["calc1-ftc", "calc1-chain"],
    shapes: ["antiderivative", "definite-integral"],
  },
  {
    id: "calc1-area-average", sessions: [27], sections: ["6.1", "6.5"],
    name: "Areas between curves and average values", strand: "Applications of integrals",
    blurb: "The area between two curves integrates the top minus the bottom, and a function's average value is its integral over the interval's length.",
    prereq: ["calc1-substitution"],
    shapes: ["definite-integral"],
  },
];
