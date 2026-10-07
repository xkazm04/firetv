/**
 * The GCSE map (v2 M2a; owner decisions 2026-10-07 M2, S2, V2-O6): the subject content of Pearson Edexcel GCSE
 * Mathematics (1MA1), Foundation tier, as data, each statement mapped onto the Math topics the desk can already teach.
 * The map says what is touched and what is a gap; M2b adds generators for the gaps, M5 reads a failed paper against it.
 *
 * HONEST LIMITS, read before using this anywhere a learner can see it:
 * - 1MA1 follows the Department for Education's GCSE mathematics subject content (2013), numbered N1-N16, A1-A25,
 *   R1-R16, G1-G25, P1-P9 and S1-S6. The statements below are the host's own short wording of each, from its knowledge
 *   of the published documents, not copied. Each carries `source`; the table is `VERIFIED = false` until a person has
 *   checked every line against the specification named there.
 * - Foundation tier is the content not marked higher-only. `foundation: false` marks the statements the host believes
 *   are wholly higher tier; several Foundation statements have higher-only parts, which `touches` never claims.
 * - "Touched" means a desk topic practises part of a statement. It does not mean the statement is covered, nor that a
 *   learner who is secure on the topic would earn its marks. No screen may print "GCSE" or "1MA1" while
 *   `gcseClaimAllowed()` is false.
 *
 * Client-safe data: no store, no engine.
 */
import { SYLLABUS } from "./syllabus";

export const SPEC = { board: "Pearson Edexcel", code: "1MA1", tier: "Foundation", name: "GCSE (9-1) Mathematics",
  source: "Pearson Edexcel Level 1/Level 2 GCSE (9-1) in Mathematics (1MA1) specification, Foundation tier content; DfE GCSE mathematics subject content (2013)" } as const;
/** Set true only after a person has checked every statement and mapping against the specification in SPEC.source. */
export const VERIFIED = false;

export type Area = "number" | "algebra" | "ratio" | "geometry" | "probability" | "statistics";
export const AREAS: Record<Area, { name: string; prefix: string }> = {
  number: { name: "Number", prefix: "N" }, algebra: { name: "Algebra", prefix: "A" }, ratio: { name: "Ratio, proportion and rates of change", prefix: "R" },
  geometry: { name: "Geometry and measures", prefix: "G" }, probability: { name: "Probability", prefix: "P" }, statistics: { name: "Statistics", prefix: "S" },
};
export interface Statement { code: string; area: Area; can: string; foundation: boolean; touches: string[]; }

const n = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "number", can, foundation, touches });
const a = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "algebra", can, foundation, touches });
const r = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "ratio", can, foundation, touches });
const g = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "geometry", can, foundation, touches });
const p = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "probability", can, foundation, touches });
const s = (code: string, can: string, touches: string[] = [], foundation = true): Statement => ({ code, area: "statistics", can, foundation, touches });

export const STATEMENTS: Statement[] = [
  n("N1", "Order integers, decimals and fractions; use =, ≠, <, >, ≤, ≥", ["frac-equivalent"]),
  n("N2", "Use the four operations with integers, decimals, fractions and mixed numbers, positive and negative", ["frac-add-sub", "frac-mul-div", "dec-arith"]),
  n("N3", "Use inverse operations and the order of operations, with brackets, powers, roots and reciprocals"),
  n("N4", "Primes, factors, multiples, HCF, LCM and prime factorisation"),
  n("N5", "List outcomes systematically"),
  n("N6", "Use positive integer powers and their roots; know squares, cubes and small powers"),
  n("N7", "Calculate with roots and integer indices"),
  n("N8", "Calculate exactly with fractions and multiples of π", ["frac-add-sub", "frac-mul-div"]),
  n("N9", "Calculate with and interpret standard form"),
  n("N10", "Move between terminating decimals and their fractions", ["dec-convert"]),
  n("N11", "Use fractions in ratio problems", ["ratio-share"]),
  n("N12", "Use fractions and percentages as operators", ["frac-of-amount", "pct-of-amount"]),
  n("N13", "Use standard units of measure, including decimal quantities"),
  n("N14", "Estimate answers and check calculations by approximation"),
  n("N15", "Round to decimal places and significant figures; write simple error intervals"),
  n("N16", "Apply and interpret limits of accuracy"),
  a("A1", "Use and interpret algebraic notation", ["linear-one-step"]),
  a("A2", "Substitute values into formulae and expressions"),
  a("A3", "Know the words: expression, equation, formula, identity, inequality, term, factor"),
  a("A4", "Simplify and manipulate expressions: like terms, a term over a bracket, common factors, two binomials, simple quadratics", ["linear-both-sides"]),
  a("A5", "Use standard formulae; rearrange a formula to change the subject"),
  a("A6", "Tell an equation from an identity; show two expressions are equivalent"),
  a("A7", "Read simple expressions as functions with inputs and outputs"),
  a("A8", "Work with coordinates in all four quadrants"),
  a("A9", "Plot straight-line graphs; use y = mx + c; find the line through two points"),
  a("A10", "Find and interpret gradients and intercepts of straight lines"),
  a("A11", "Find roots, intercepts and turning points of quadratics from their graphs"),
  a("A12", "Recognise and sketch linear, quadratic, simple cubic and reciprocal graphs"),
  a("A13", "Sketch translations and reflections of a function", [], false),
  a("A14", "Plot and read graphs in real contexts, including distance-time"),
  a("A15", "Area under a graph and gradient as a rate, from a curve", [], false),
  a("A16", "The equation of a circle and the tangent at a point", [], false),
  a("A17", "Solve linear equations in one unknown, including the unknown on both sides", ["linear-one-step", "linear-two-step", "linear-both-sides"]),
  a("A18", "Solve quadratic equations by factorising"),
  a("A19", "Solve two linear simultaneous equations"),
  a("A20", "Find approximate solutions by iteration", [], false),
  a("A21", "Turn a situation into an expression or equation, solve it and interpret the answer", ["linear-two-step"]),
  a("A22", "Solve linear inequalities and show the solution on a number line"),
  a("A23", "Generate a sequence from a term-to-term or a position-to-term rule"),
  a("A24", "Recognise square, cube, triangular, arithmetic, Fibonacci-type and simple geometric sequences"),
  a("A25", "Find the nth term of a linear sequence"),
  r("R1", "Change between related standard units"),
  r("R2", "Use scale factors, scale diagrams and maps"),
  r("R3", "Write one quantity as a fraction of another"),
  r("R4", "Use ratio notation, including simplest form", ["ratio-share"]),
  r("R5", "Divide a quantity in a ratio; apply ratio to real problems", ["ratio-share"]),
  r("R6", "Write a multiplicative relationship as a ratio or a fraction"),
  r("R7", "Use proportion as equality of ratios", ["unit-rate"]),
  r("R8", "Relate ratios to fractions and to linear functions"),
  r("R9", "Percentages: of a quantity, as a fraction or decimal, change, original value, simple interest", ["dec-convert", "pct-of-amount", "pct-change"]),
  r("R10", "Solve direct and inverse proportion problems", ["unit-rate"]),
  r("R11", "Use compound units: speed, rates of pay, unit pricing, density, pressure", ["unit-rate"]),
  r("R12", "Compare lengths, areas and volumes with ratio; link to similarity"),
  r("R13", "Read equations and graphs of direct and inverse proportion"),
  r("R14", "Read the gradient of a straight-line graph as a rate of change"),
  r("R15", "Rates of change on a curve", [], false),
  r("R16", "Growth and decay, including compound interest"),
  g("G1", "Use the terms and notation of geometry; draw diagrams from a description"),
  g("G2", "Ruler and compass constructions; loci"),
  g("G3", "Angle facts: at a point, on a line, vertically opposite, parallel lines, triangles and polygons"),
  g("G4", "Properties of special triangles and quadrilaterals"),
  g("G5", "Congruence criteria for triangles"),
  g("G6", "Use angle and shape facts to derive results, including Pythagoras' theorem"),
  g("G7", "Rotations, reflections, translations and enlargements"),
  g("G8", "Combinations of transformations", [], false),
  g("G9", "Parts of a circle: radius, chord, diameter, circumference, tangent, arc, sector, segment"),
  g("G10", "Circle theorems", [], false),
  g("G11", "Solve geometry problems on coordinate axes"),
  g("G12", "Faces, edges and vertices of 3D shapes"),
  g("G13", "Plans and elevations of 3D shapes"),
  g("G14", "Standard units of measure for length, area, volume, mass, time and money"),
  g("G15", "Measure lines and angles; maps, scale drawings and bearings"),
  g("G16", "Area of triangles, parallelograms and trapezia; volume of prisms", ["area"]),
  g("G17", "Circles: circumference and area; perimeters, composite areas, surface area and volume of solids", ["area"]),
  g("G18", "Arc lengths and sector areas"),
  g("G19", "Congruence and similarity, including lengths in similar figures"),
  g("G20", "Pythagoras' theorem and sin, cos, tan in right-angled triangles", ["pythagoras"]),
  g("G21", "Exact values of sin, cos and tan for the standard angles"),
  g("G22", "The sine and cosine rules", [], false),
  g("G23", "The area of a triangle as ½ab sin C", [], false),
  g("G24", "Describe translations as column vectors"),
  g("G25", "Add, subtract and scale vectors"),
  p("P1", "Record and analyse outcomes of experiments with tables and frequency trees"),
  p("P2", "Randomness, fairness and expected outcomes"),
  p("P3", "Relative frequency and the 0-1 probability scale", ["probability"]),
  p("P4", "Probabilities of an exhaustive set sum to one; mutually exclusive events", ["probability"]),
  p("P5", "Larger samples tend towards the theoretical probability"),
  p("P6", "Enumerate sets with tables, grids, Venn diagrams and tree diagrams"),
  p("P7", "Sample spaces for single and combined experiments", ["probability"]),
  p("P8", "Probability of independent and dependent combined events"),
  p("P9", "Conditional probability", [], false),
  s("S1", "Infer from a sample, knowing the limits of sampling"),
  s("S2", "Read and draw tables, bar charts, pie charts, pictograms, line charts and time series"),
  s("S3", "Histograms, cumulative frequency and box plots", [], false),
  s("S4", "Compare distributions with averages (mean, median, mode) and spread (range)", ["mean-range"]),
  s("S5", "Apply statistics to describe a population"),
  s("S6", "Scatter graphs, correlation, lines of best fit; correlation is not causation"),
].map((x) => ({ ...x, source: SPEC.source })) as (Statement & { source: string })[];

/** The Foundation statements only. */
export const FOUNDATION = STATEMENTS.filter((x) => x.foundation);

export interface GcseCoverage { total: number; touched: string[]; gaps: string[]; share: number; byArea: Record<Area, { total: number; touched: number }>; topics: Record<string, string[]> }
/** What the desk's topics touch of Foundation, by code. Only topics that exist on a path count. */
export function gcseCoverage(topicIds: readonly string[] = SYLLABUS.map((t) => t.id)): GcseCoverage {
  const have = new Set(topicIds), topics: Record<string, string[]> = {};
  const byArea = Object.fromEntries((Object.keys(AREAS) as Area[]).map((k) => [k, { total: 0, touched: 0 }])) as GcseCoverage["byArea"];
  const touched: string[] = [], gaps: string[] = [];
  for (const st of FOUNDATION) {
    const t = st.touches.filter((id) => have.has(id));
    topics[st.code] = t; byArea[st.area].total++;
    if (t.length) { touched.push(st.code); byArea[st.area].touched++; } else gaps.push(st.code);
  }
  return { total: FOUNDATION.length, touched, gaps, share: FOUNDATION.length ? touched.length / FOUNDATION.length : 0, byArea, topics };
}

/** No "GCSE" or "1MA1" on a screen until a person has verified the map (X5: "mapped to", never "certified"). */
export function gcseClaimAllowed(): boolean { return VERIFIED; }
