/**
 * Our own topic spine for school maths: fractions, linear equations, decimals and percent, ratio and rates, geometry and
 * data.
 *
 * The bands below (US grade, UK year, Czech ročník, German Klasse) are OUR OWN EDITORIAL
 * JUDGEMENT, informed by reading public curriculum outlines and then written from scratch.
 * No curriculum text is copied into this repo, and none is quoted. Germany sets its
 * curriculum per Bundesland, so those bands are given as a range and say so.
 *
 * The topics are deliberately the intersection: what the US, UK, Czech and German systems all
 * teach at roughly the same stage of school maths. Nothing nation-specific. The list is in the
 * order a learner meets the topics, and each system's year never goes down along it
 * (tools/maths-rules-test.cjs holds that): expectedIndex counts on it.
 *
 * The fractions units come first: they are met before linear equations. "Add and subtract
 * fractions" came with Family W5b; "Equivalent fractions", "A fraction of an amount" and "Multiply
 * and divide fractions" with W7 batch 1, in the order equivalent, of an amount, add and subtract,
 * multiply and divide. Their bands and years were written FROM MEMORY and are unchecked; a maths
 * teacher reads them before release. Where a system's usual year for a unit would sit after the
 * year of a topic below it, the unit takes the earliest defensible year that keeps the list from
 * going down (the comment on the unit says so): the linear topics' years are not moved. None has a
 * lessonId: the lesson library has no fractions lesson, so every screen that looks one up finds
 * none and says so (the existing "No lesson for this" state).
 *
 * W7 batch 2 adds the "Decimals and percent" strand (add, subtract and multiply decimals; fractions, decimals and
 * percent; a percent of an amount; percent increase and decrease) after one-step equations: the eleven topics keep every
 * system's years from going down, and where a system's usual year disagrees the comment on the unit says which way it
 * was moved and why. None has a lessonId either.
 *
 * W7 batch 3 adds the last four units as two strands, "Ratio and rates" (ratio and sharing; unit rates and direct
 * proportion) and "Geometry and data" (area; mean and range), after percent increase and decrease and before two-step
 * equations: fifteen topics. Between percent change (US 7 / UK 8 / CZ 7 / DE 6) and two-step equations (7 / 8 / 7 / 6)
 * every system's year is fixed, so all four take US 7, UK 8, CZ 7, DE 6 - the one place where the strands stay whole
 * bars (earlier, mean and range would come before the decimals it needs; after two-step equations the Equations strand
 * would split again and no year would be earlier). Each unit's comment says where that is later or earlier than usual.
 */
import type { SchoolSystem } from "@/lib/session/store";

export interface Topic {
  id: string;               // stable kebab id
  name: string;             // display name
  strand: string;           // e.g. "Equations"
  blurb: string;            // ONE sentence: what this topic is, for the caption slot
  bands: { us: string; uk: string; cz: string; de: string };
  /** the school year that topic is normally met in, per system — the bands above as one number */
  year: { us: number; uk: number; cz: number; de: number };
  prereq: string[];         // topic ids
  lessonId?: string;        // an id from LESSONS in lessons.data.ts
}

export const SYLLABUS: Topic[] = [
  {
    id: "frac-equivalent",
    name: "Equivalent fractions",
    strand: "Fractions",
    blurb: "Multiplying or dividing the top and the bottom by the same number gives an equal fraction, which is how you fill in a missing number or simplify to lowest terms.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 4 (equivalence), UK Year 5
    // (simplifying by common factors is often Year 6 there). CZ and DE: rozšiřování a krácení / Erweitern und Kürzen is
    // often taught a year later (6. ročník, Klasse 6), but add and subtract fractions sits at CZ 5 and DE 5 after it,
    // so the earliest defensible year that keeps the list from going down is used: CZ 5, DE 5.
    bands: { us: "Grade 4", uk: "Year 5", cz: "5. ročník", de: "Klasse 5 (varies by Bundesland)" },
    year: { us: 4, uk: 5, cz: 5, de: 5 },
    prereq: [],
  },
  {
    id: "frac-of-amount",
    name: "A fraction of an amount",
    strand: "Fractions",
    blurb: "To find a fraction of an amount you divide by the bottom to get a single part, then multiply by the top to take that many parts.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 5 (a fraction times a whole
    // number), UK Year 5 (often met in Year 4 as fractions of a quantity; Year 5 keeps it after equivalent fractions),
    // CZ 5. ročník (zlomek z čísla), DE Klasse 5 (Bruchteile von Größen, often Klasse 6; kept at 5 like the unit before).
    bands: { us: "Grade 5", uk: "Year 5", cz: "5. ročník", de: "Klasse 5 (varies by Bundesland)" },
    year: { us: 5, uk: 5, cz: 5, de: 5 },
    prereq: [],
  },
  {
    id: "frac-add-sub",
    name: "Add and subtract fractions",
    strand: "Fractions",
    blurb: "Two fractions need the same bottom before they can be combined, so you rewrite each over a common one and then add or take away the tops.",
    // from memory, unchecked: a maths teacher reads these four before release
    bands: { us: "Grade 5", uk: "Year 6", cz: "5. ročník", de: "Klasse 5 (varies by Bundesland)" },
    year: { us: 5, uk: 6, cz: 5, de: 5 },
    // W7: rewriting over a common bottom IS equivalent fractions
    prereq: ["frac-equivalent"],
  },
  {
    id: "frac-mul-div",
    name: "Multiply and divide fractions",
    strand: "Fractions",
    // one sentence, one main clause (W7 batch 3: the old wording read as two sentences joined by "and")
    blurb: "Fractions are multiplied top by top and bottom by bottom, which is also how you divide once the fraction you divide by is turned upside down.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 6 (dividing a fraction by a
    // fraction; multiplying is Grade 5), UK Year 7 (Year 6 multiplies and divides by a whole number). CZ: násobení a
    // dělení zlomků is usually 7. ročník, and DE: Multiplizieren und Dividieren von Brüchen usually Klasse 6, but
    // one-step equations stay at CZ 6 and DE 5 after it, so the earliest defensible year that keeps the list from
    // going down is used: CZ 6, DE 5.
    bands: { us: "Grade 6", uk: "Year 7", cz: "6. ročník", de: "Klasse 5–6 (varies by Bundesland)" },
    year: { us: 6, uk: 7, cz: 6, de: 5 },
    // simplifying a product needs equal fractions; adding them first is not needed
    prereq: ["frac-equivalent"],
  },
  {
    id: "linear-one-step",
    name: "One-step equations",
    strand: "Equations",
    blurb: "One operation stands between x and its value, so you undo that one operation on both sides.",
    bands: { us: "Grade 6", uk: "Year 7", cz: "6. ročník", de: "Klasse 5–6 (varies by Bundesland)" },
    year: { us: 6, uk: 7, cz: 6, de: 5 },
    prereq: [],
    lessonId: "jWpiMu5LNdg",
  },
  // W7 batch 2, "Decimals and percent": placed after one-step equations and before two-step equations, the one place
  // where all four systems' years fit (one-step US 6 / UK 7 / CZ 6 / DE 5 before, two-step 7 / 8 / 7 / 6 after). Before
  // one-step they would sit at DE Klasse 5, which no German percent unit is; after two-step at UK Year 8 or more, which
  // is late for decimals. So the Equations strand is split: one-step, then this strand, then the other two.
  {
    id: "dec-arith",
    name: "Add, subtract and multiply decimals",
    strand: "Decimals and percent",
    blurb: "Decimals are added and taken away with their points lined up, and multiplied as whole numbers before the point goes back in by counting the places.",
    // from memory, unchecked: a maths teacher reads these four before release. US: adding and multiplying to hundredths is
    // Grade 5, fluency with the column methods Grade 6 (kept at 6: one-step equations before it are US 6). UK: adding
    // decimals is Year 5, a decimal times a decimal Year 7 (KS3); the unit multiplies, so Year 7 (also held by one-step at
    // UK 7). CZ: desetinná čísla, 6. ročník. DE: Dezimalzahlen, Klasse 6 (Klasse 5 in some Länder).
    bands: { us: "Grade 6", uk: "Year 7", cz: "6. ročník", de: "Klasse 6 (varies by Bundesland)" },
    year: { us: 6, uk: 7, cz: 6, de: 6 },
    prereq: [],
  },
  {
    id: "dec-convert",
    name: "Fractions, decimals and percent",
    strand: "Decimals and percent",
    blurb: "A fraction, a decimal and a percentage can name the same number, and you move between them by dividing the top by the bottom or by counting hundredths.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 6 (percent as a rate per hundred;
    // terminating decimal expansions are Grade 7). UK: fraction, decimal and percentage equivalents are Year 6, but the
    // unit sits after one-step equations at UK 7, so Year 7 (KS3 revisits them) - later than usual. CZ: zlomky and
    // procenta, 7. ročník. DE: Dezimalbrüche are Klasse 6, Prozente usually Klasse 7; two-step equations after it are DE 6,
    // so Klasse 6 - the percent half earlier than usual.
    bands: { us: "Grade 6", uk: "Year 7", cz: "7. ročník", de: "Klasse 6 (varies by Bundesland)" },
    year: { us: 6, uk: 7, cz: 7, de: 6 },
    // writing over a hundred and simplifying is equivalent fractions
    prereq: ["frac-equivalent"],
  },
  {
    id: "pct-of-amount",
    name: "A percent of an amount",
    strand: "Decimals and percent",
    blurb: "A percentage of an amount is that many hundredths of it, which you find by building up from ten percent or by multiplying by the percentage as a decimal.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 6 (percent of a quantity). UK: Year
    // 6 in the national curriculum; after one-step equations at UK 7 it is Year 7 - later than usual. CZ: procenta, 7.
    // ročník. DE: Prozentrechnung is usually Klasse 7; held by two-step equations at DE 6 after it, so Klasse 6 - a year
    // earlier than usual.
    bands: { us: "Grade 6", uk: "Year 7", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    year: { us: 6, uk: 7, cz: 7, de: 6 },
    // a percent is first a number of hundredths: the conversion comes first
    prereq: ["dec-convert"],
  },
  {
    id: "pct-change",
    name: "Percent increase and decrease",
    strand: "Decimals and percent",
    blurb: "To increase or decrease an amount by a percentage you find that percentage of the amount and then add it on or take it off.",
    // from memory, unchecked: a maths teacher reads these four before release. US Grade 7 (percent increase and decrease).
    // UK Year 8 (some schemes teach it in Year 7). CZ: procenta, 7. ročník. DE: usually Klasse 7; held by two-step
    // equations at DE 6 after it, so Klasse 6 - a year earlier than usual.
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    // the change is a percent of the amount
    prereq: ["pct-of-amount"],
  },
  // W7 batch 3, "Ratio and rates" and "Geometry and data": after the percent units, before two-step equations, where every
  // system's year is fixed at US 7 / UK 8 / CZ 7 / DE 6 (the file header says why this is the one place for them)
  {
    id: "ratio-share",
    name: "Ratio and sharing",
    strand: "Ratio and rates",
    blurb: "A ratio compares amounts in equal parts, which you simplify by dividing both numbers by the same number and share out by first finding the size of a single part.",
    // from memory, unchecked: a maths teacher reads these four before release. US: ratio reasoning is Grade 6; held at 7 by
    // percent change (US 7) before it - a year later than usual. UK: unequal sharing is met in Year 6, dividing in a ratio
    // is KS3 (Year 7-8 schemes); held at 8 by percent change (UK 8). CZ: poměr, 7. ročník. DE: Verhältnisse and dividing in a
    // ratio usually Klasse 7; two-step equations after it are DE 6, so Klasse 6 - a year earlier than usual.
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    // simplifying a ratio and scaling it are equivalent fractions' method
    prereq: ["frac-equivalent"],
  },
  {
    id: "unit-rate",
    name: "Unit rates and direct proportion",
    strand: "Ratio and rates",
    blurb: "When two amounts grow in step, you find the value for a single one first and then multiply up to the number you need.",
    // from memory, unchecked: a maths teacher reads these four before release. US: unit rates are Grade 6, proportional
    // relationships Grade 7: Grade 7. UK: direct proportion and the unitary method, Year 8 (KS3). CZ: přímá úměrnost and
    // trojčlenka, 7. ročník. DE: proportionale Zuordnungen and der Dreisatz usually Klasse 7; held by two-step equations at
    // DE 6 after it, so Klasse 6 - a year earlier than usual.
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    // finding a single part is ratio's first step; a price to the cent divides a decimal
    prereq: ["ratio-share", "dec-arith"],
  },
  {
    id: "area",
    name: "Area of rectangles, triangles and composite shapes",
    strand: "Geometry and data",
    blurb: "The area of a shape is the space inside it, found as length times width for a rectangle, half of base times height for a triangle and the sum of the parts for a shape made of rectangles.",
    // from memory, unchecked: a maths teacher reads these four before release. US: triangles and composite figures are
    // Grade 6 (rectangles earlier); held at 7 by percent change - a year later than usual. UK: the area of a triangle is
    // Year 6 and rectilinear shapes Year 5-6; held at 8 by percent change (UK 8) - two years later than usual, though KS3
    // revisits both. CZ: obsah trojúhelníku, 7. ročník. DE: the rectangle is Klasse 5, the triangle often Klasse 7; held
    // at 6 by two-step equations - the triangle a year earlier than usual.
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    // whole and half sides only, so no decimals unit is needed
    prereq: [],
  },
  {
    id: "mean-range",
    name: "Mean and range",
    strand: "Geometry and data",
    blurb: "A list of numbers is summed up by its mean, the total shared equally among them, and by its range, the gap from the smallest to the largest.",
    // from memory, unchecked: a maths teacher reads these four before release. US: the mean and measures of spread are
    // Grade 6; held at 7 by percent change - a year later than usual. UK: the mean is Year 6, the range KS3 (Year 7); held
    // at 8 by percent change - later than usual. CZ: aritmetický průměr is met in 6. ročník with decimals; 7. ročník here,
    // a year later. DE: Mittelwert and Spannweite Klasse 5-6: Klasse 6.
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    // a mean that is not whole is a decimal, added and divided
    prereq: ["dec-arith"],
  },
  {
    id: "linear-two-step",
    name: "Two-step equations",
    strand: "Equations",
    blurb: "Two operations wrap x, so you undo them in the reverse order they were applied.",
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    year: { us: 7, uk: 8, cz: 7, de: 6 },
    prereq: ["linear-one-step"],
    lessonId: "bAerID24QJ0",
  },
  {
    id: "linear-both-sides",
    name: "Equations with brackets and x on both sides",
    strand: "Equations",
    blurb: "Brackets come off first, then the x-terms are gathered on one side before the equation is undone.",
    bands: { us: "Grade 8", uk: "Year 9", cz: "8. ročník", de: "Klasse 7–8 (varies by Bundesland)" },
    year: { us: 8, uk: 9, cz: 8, de: 7 },
    prereq: ["linear-two-step"],
    lessonId: "bAerID24QJ0",
  },
];

export function topic(id: string): Topic | undefined {
  return SYLLABUS.find((t) => t.id === id);
}

/** First topic whose prereqs are all secure and which is not itself secure. */
export function nextTopic(secure: string[]): Topic | undefined {
  return SYLLABUS.find((t) => !secure.includes(t.id) && t.prereq.every((p) => secure.includes(p)));
}

/** The age at which year 1 of each system begins. Our own reading, like the bands above. */
export const SYSTEM_START: Record<SchoolSystem, number> = { us: 6, uk: 5, cz: 6, de: 6 };

/**
 * The school year a learner of that age is in, in that system's own numbering (a UK 12-year-old is in Year 8, a US one in
 * Grade 7): age - SYSTEM_START + 1. Our own reading, like SYSTEM_START; it ignores the birthday cut-off.
 */
export function schoolYear(system: SchoolSystem, age: number): number {
  return age - SYSTEM_START[system] + 1;
}

/**
 * How many topics on this path a learner of that age is normally already past.
 * -1 when none of them is: there is nothing behind them yet.
 */
export function expectedIndex(system: SchoolSystem, age: number): number {
  const yr = schoolYear(system, age);
  const n = SYLLABUS.filter((t) => t.year[system] <= yr).length;
  return n === 0 ? -1 : n;
}
