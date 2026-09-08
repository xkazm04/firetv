/**
 * Our own topic spine for linear equations.
 *
 * The bands below (US grade, UK year, Czech ročník, German Klasse) are OUR OWN EDITORIAL
 * JUDGEMENT, informed by reading public curriculum outlines and then written from scratch.
 * No curriculum text is copied into this repo, and none is quoted. Germany sets its
 * curriculum per Bundesland, so those bands are given as a range and say so.
 *
 * The three topics are deliberately the intersection: what the US, UK, Czech and German
 * systems all teach at roughly the same stage of school algebra. Nothing nation-specific.
 */
export interface Topic {
  id: string;               // stable kebab id
  name: string;             // display name
  strand: string;           // e.g. "Equations"
  blurb: string;            // ONE sentence: what this topic is, for the caption slot
  bands: { us: string; uk: string; cz: string; de: string };
  prereq: string[];         // topic ids
  lessonId?: string;        // an id from LESSONS in lessons.data.ts
}

export const SYLLABUS: Topic[] = [
  {
    id: "linear-one-step",
    name: "One-step equations",
    strand: "Equations",
    blurb: "One operation stands between x and its value, so you undo that one operation on both sides.",
    bands: { us: "Grade 6", uk: "Year 7", cz: "6. ročník", de: "Klasse 5–6 (varies by Bundesland)" },
    prereq: [],
    lessonId: "jWpiMu5LNdg",
  },
  {
    id: "linear-two-step",
    name: "Two-step equations",
    strand: "Equations",
    blurb: "Two operations wrap x, so you undo them in the reverse order they were applied.",
    bands: { us: "Grade 7", uk: "Year 8", cz: "7. ročník", de: "Klasse 6–7 (varies by Bundesland)" },
    prereq: ["linear-one-step"],
    lessonId: "bAerID24QJ0",
  },
  {
    id: "linear-both-sides",
    name: "Equations with brackets and x on both sides",
    strand: "Equations",
    blurb: "Brackets come off first, then the x-terms are gathered on one side before the equation is undone.",
    bands: { us: "Grade 8", uk: "Year 9", cz: "8. ročník", de: "Klasse 7–8 (varies by Bundesland)" },
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
