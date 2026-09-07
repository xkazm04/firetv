/** The syllabus, as data — safe for the browser. Server-side retrieval lives in lessons.ts. */
export interface Lesson {
  id: string; subject: "maths" | "english" | "essay"; unit: number; title: string; minutes: number;
  concepts: string[]; youtube?: string; done?: boolean;
}

export const LESSONS: Lesson[] = [
  { id: "jWpiMu5LNdg", subject: "maths", unit: 1, title: "How to solve one-step equations", minutes: 2, concepts: ["one-step equation", "undo an operation", "isolate x"], youtube: "jWpiMu5LNdg", done: true },
  { id: "bAerID24QJ0", subject: "maths", unit: 2, title: "Linear equations 1", minutes: 7, concepts: ["linear equation", "solve for x", "both sides", "distribute"], youtube: "bAerID24QJ0", done: true },
  { id: "qsL_5Y8uWPU", subject: "maths", unit: 3, title: "Number of solutions to linear equations", minutes: 5, concepts: ["number of solutions", "no solution", "infinite solutions"], youtube: "qsL_5Y8uWPU" },
  { id: "D3a8NnpQ2vU", subject: "maths", unit: 4, title: "Factoring quadratics as (x+a)(x+b)", minutes: 7, concepts: ["factor quadratic", "pairs that multiply and add", "x^2 + bx + c"], youtube: "D3a8NnpQ2vU" },
  { id: "u1SAo2GiX8A", subject: "maths", unit: 5, title: "Factoring quadratics by grouping", minutes: 4, concepts: ["factor by grouping", "leading coefficient"], youtube: "u1SAo2GiX8A" },
  { id: "2ZzuZvz33X0", subject: "maths", unit: 6, title: "Solving a quadratic equation by factoring", minutes: 6, concepts: ["quadratic equation", "solve by factoring", "zero product"], youtube: "2ZzuZvz33X0" },
  { id: "uzyd_mIJaoc", subject: "maths", unit: 7, title: "The substitution method", minutes: 5, concepts: ["system of equations", "substitution"], youtube: "uzyd_mIJaoc" },
  { id: "V7H1oUHXPkg", subject: "maths", unit: 8, title: "Solving linear systems by substitution", minutes: 9, concepts: ["system of equations", "substitution", "word problem"], youtube: "V7H1oUHXPkg" },
  { id: "en-5", subject: "english", unit: 5, title: "Past simple — regular and irregular", minutes: 10, concepts: ["past simple", "irregular verbs", "-ed"], done: true },
  { id: "en-6", subject: "english", unit: 6, title: "Past simple vs present perfect", minutes: 12, concepts: ["past simple", "present perfect", "finished time", "open time", "since", "for", "yesterday"] },
  { id: "en-7", subject: "english", unit: 7, title: "Time markers: yesterday, since, for, already", minutes: 8, concepts: ["time markers", "since", "for", "already", "yet"] },
  { id: "en-8", subject: "english", unit: 8, title: "Questions in the past", minutes: 9, concepts: ["did", "questions", "past simple"] },
  { id: "es-1", subject: "essay", unit: 1, title: "Thesis — one sentence that takes a side", minutes: 6, concepts: ["thesis", "claim"] },
  { id: "es-2", subject: "essay", unit: 2, title: "Paragraph — claim, evidence, link", minutes: 8, concepts: ["paragraph", "claim", "evidence", "link"] },
  { id: "es-3", subject: "essay", unit: 3, title: "Order — which argument goes first", minutes: 5, concepts: ["order", "strongest argument"] },
  { id: "es-4", subject: "essay", unit: 4, title: "Conclusion — deliver what the introduction promised", minutes: 5, concepts: ["conclusion"] },
];

export const ESSAY_TYPES = [
  { id: "structure", name: "Structure", promise: "Which sentence does which job — claim, evidence, link — and what is missing." },
  { id: "argument", name: "Argument", promise: "Does the paragraph take a side, and does every sentence push the same way?" },
  { id: "evidence", name: "Evidence", promise: "What here is a fact a reader can check, and what is only an opinion." },
  { id: "language", name: "Language", promise: "Sentence length, rhythm, connectors, repeated words." },
] as const;
