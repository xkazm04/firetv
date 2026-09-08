import type { Profile, StudentType, Subject } from "@/lib/session/store";

/** The age a school type covers; "other" carries no age. The store uses it to clear an age that no longer fits. */
export const AGE_RANGE: Record<StudentType, [number, number] | null> = { elementary: [6, 14], "high-school": [15, 19], other: null };

/** The three modules, branded as apps. One blurb each, used wherever a module is described. */
export const BRAND: Record<Subject, string> = { maths: "Math Buddy", english: "Linga", essay: "Essay Master" };
export const MODULE_BLURB: Record<Subject, string> = {
  maths: "Learn and practise school maths one step at a time. The desk gives you the next step, never the answer.",
  english: "An assistant for learning English at every level. Say a sentence, see the tense and the word that decided it.",
  essay: "An analyst for written thoughts. See what your paragraph does and what it lacks, never rewritten for you.",
};
export const TYPES: StudentType[] = ["elementary", "high-school", "other"];
export const TYPE_WORDS: Record<StudentType, string> = { elementary: "Elementary school", "high-school": "High school", other: "Other" };
export const TYPE_BLURB: Record<StudentType, string> = {
  elementary: "About 6 to 14 years old. The desk keeps it simple and careful: short steps, plain words, nothing beyond the sheet.",
  "high-school": "About 15 to 19 years old. Steps that follow the syllabus, and hints that expect some independence.",
  other: "I just wish to learn. Any age; the desk can be more creative and talk more like a peer.",
};

/** One focusable pick on the profile screen. */
export interface Cell { kind: "type" | "age" | "interest" | "save" | "back"; label: string; blurb: string; type?: StudentType; age?: number; sub?: Subject }
export interface Row { title: string; cells: Cell[] }

/** The pick rows for a draft: type, age (school types only), interests, actions. The TV and the D-pad share this. */
export function profileRows(d: Profile | null): Row[] {
  const t = d?.type ?? "high-school", r = AGE_RANGE[t];
  const rows: Row[] = [{ title: "Type of student", cells: TYPES.map((x) => ({ kind: "type", label: TYPE_WORDS[x], blurb: TYPE_BLURB[x], type: x })) }];
  if (r) rows.push({ title: "Age", cells: Array.from({ length: r[1] - r[0] + 1 }, (_, i) => r[0] + i).map((n) => ({ kind: "age", label: String(n), blurb: `${n} years old. The desk pitches its words and its examples for a ${n}-year-old.`, age: n })) });
  rows.push({ title: "Interested in", cells: (["maths", "english", "essay"] as Subject[]).map((m) => ({ kind: "interest", label: BRAND[m], blurb: MODULE_BLURB[m], sub: m })) });
  rows.push({ title: "", cells: [{ kind: "save", label: "Save", blurb: "Sit at this desk with these picks." }, { kind: "back", label: "Back", blurb: "Throw the draft away and go back." }] });
  return rows;
}
export function locate(rows: Row[], f: number): { r: number; c: number } {
  let i = f; for (let r = 0; r < rows.length; r++) { if (i < rows[r].cells.length) return { r, c: i }; i -= rows[r].cells.length; }
  return { r: rows.length - 1, c: 0 };
}
export function flat(rows: Row[], r: number, c: number): number {
  let f = 0; for (let i = 0; i < r; i++) f += rows[i].cells.length; return f + Math.max(0, Math.min(c, rows[r].cells.length - 1));
}
