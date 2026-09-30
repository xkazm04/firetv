/**
 * Our own topic spine for school maths: add and subtract fractions, then linear equations.
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
    blurb: "Fractions multiply top by top and bottom by bottom, and dividing by a fraction is multiplying by it turned upside down.",
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
 * How many topics on this path a learner of that age is normally already past.
 * -1 when none of them is: there is nothing behind them yet.
 */
export function expectedIndex(system: SchoolSystem, age: number): number {
  const yr = age - SYSTEM_START[system] + 1;
  const n = SYLLABUS.filter((t) => t.year[system] <= yr).length;
  return n === 0 ? -1 : n;
}
