import type { Profile, SchoolSystem, Session, StudentType, Subject } from "@/lib/session/store";
import { PATHS, type MathPath } from "@/lib/library/paths";
import { SYSTEM_START, schoolYear } from "@/lib/library/syllabus";
import { adultAllowed, type Mode } from "@/lib/rules/mode";

const ALL: Subject[] = ["maths", "english", "essay"];
/** What the learner at the desk is interested in. No profile row means everything stays on. */
export function onModules(s: Session): Subject[] {
  const me = s.profiles.find((p) => p.id === s.learner?.id);
  return me?.modules ?? ALL;
}

/** The age a school type covers; "other" carries no age. The store uses it to clear an age that no longer fits. */
export const AGE_RANGE: Record<StudentType, [number, number] | null> = { elementary: [6, 14], "high-school": [15, 19], other: null };

/** The school years a school type spans in a system (its ages through the system's start); null for "other", which has no year. */
export function yearRange(type: StudentType, system: SchoolSystem | undefined): [number, number] | null {
  const r = AGE_RANGE[type], start = SYSTEM_START[system ?? "uk"];
  return r ? [r[0] - start + 1, r[1] - start + 1] : null;
}
/** The year a draft reads as: the pick when it holds one, else the age-derived year (undefined with no age). */
export function yearOf(d: Profile | null | undefined): number | undefined {
  if (!d) return undefined;
  return d.year ?? (d.age !== undefined ? schoolYear(d.system ?? "uk", d.age) : undefined);
}

/** The three modules, branded as apps. One blurb each, used wherever a module is described. */
export const BRAND: Record<Subject, string> = { maths: "Math Buddy", english: "Linga", essay: "Essay Master" };
export const MODULE_BLURB: Record<Subject, string> = {
  maths: "Learn and practise maths on your own path, one step at a time. The desk gives you the next step, never the answer.",
  english: "Practise real situations in English. Talk, get one useful coaching note, and try the moment again.",
  essay: "An analyst for written thoughts. See what your paragraph does and what it lacks, never rewritten for you.",
};
/** The school systems the desk can read a learner's progress against; UK when a profile has none. */
export const SYSTEMS: SchoolSystem[] = ["us", "uk", "cz", "de"];
export const DEFAULT_SYSTEM: SchoolSystem = "uk";
export const SYSTEM_WORDS: Record<SchoolSystem, string> = { us: "United States", uk: "United Kingdom", cz: "Czech Republic", de: "Germany" };
export const SYSTEM_BLURB: Record<SchoolSystem, string> = {
  us: "Progress is shown against US grades. 0.5 is a half (decimal point).",
  uk: "Progress is shown against UK years. 0.5 is a half (decimal point).",
  cz: "Progress is shown against Czech ročníky. 0,5 is a half (decimal comma).",
  de: "Progress is shown against German Klassen. 0,5 is a half (decimal comma).",
};
/** The decimal convention each system reads a learner's numbers by, in the words the Save blurb quotes. */
const SYSTEM_DECIMAL: Record<SchoolSystem, string> = { us: "0.5 is a half", uk: "0.5 is a half", cz: "0,5 is a half", de: "0,5 is a half" };
/** The system on a profile, or the default. */
export function systemOf(p: Profile | null | undefined): SchoolSystem { return p?.system ?? DEFAULT_SYSTEM; }

export const TYPES: StudentType[] = ["elementary", "high-school", "other"];
export const TYPE_WORDS: Record<StudentType, string> = { elementary: "Elementary school", "high-school": "High school", other: "Other" };
export const TYPE_BLURB: Record<StudentType, string> = {
  elementary: "About 6 to 14 years old. The desk keeps it simple and careful: short steps, plain words, nothing beyond the sheet.",
  "high-school": "About 15 to 19 years old. Steps that follow the syllabus, and hints that expect some independence.",
  other: "I just wish to learn. Any age; the desk can be more creative and talk more like a peer.",
};

/** One focusable pick on the profile screen. */
export interface Cell { kind: "name" | "type" | "age" | "year" | "mode" | "system" | "interest" | "path" | "save" | "back"; label: string; blurb: string; type?: StudentType; age?: number; year?: number; mode?: Mode; system?: SchoolSystem; sub?: Subject; path?: MathPath }
export interface Row { title: string; cells: Cell[] }

/** The Mode row (slice A5; O1 = 18+): shown only where rules/mode adultAllowed holds, with Family and Adult (18+). */
export const MODE_WORDS: Record<Mode, string> = { family: "Family", adult: "Adult (18+)" };
export const MODE_BLURB: Record<Mode, string> = {
  family: "Guided learning: school syllabus, careful topics, a voice for your age.",
  adult: "For 18 and over. Picking it says you are. Bolder scenes and harder material.",
};
export const ADULT_FLOOR_BLURB = "Adult mode is for 18 and over.";
export function modeCells(d: Pick<Profile, "age" | "type"> | null): Cell[] {
  const open = adultAllowed(d ?? undefined);
  return [
    { kind: "mode", label: MODE_WORDS.family, blurb: open ? MODE_BLURB.family : `${MODE_BLURB.family} ${ADULT_FLOOR_BLURB}`, mode: "family" },
    ...(open ? [{ kind: "mode" as const, label: MODE_WORDS.adult, blurb: MODE_BLURB.adult, mode: "adult" as const }] : []),
  ];
}

/** The Math courses a learner can be on, in the order the profile row shows them: the PATHS keys as declared, the school path first (the default). */
export const COURSES: MathPath[] = Object.keys(PATHS) as MathPath[];
/**
 * The pick rows for a draft: type, age (school types only), mode, school system, interests, the Maths course (only while
 * Maths is on), actions. The TV and the D-pad share this.
 */
/** What Save will keep: the system it saves, named, so a skipped School system row is not a silent default. */
function saveBlurb(d: Profile | null): string {
  const sys = systemOf(d);
  return d?.system
    ? `Saves as ${SYSTEM_WORDS[sys]} (${SYSTEM_DECIMAL[sys]}).`
    : `Saves as ${SYSTEM_WORDS[sys]} (${SYSTEM_DECIMAL[sys]}); pick a school system above to change it.`;
}
/** What the Name cell says: the TV opens the ask, the phone takes the letters. */
export const NAME_BLURB = "Select: the phone asks for the name. Type it there; this screen follows each letter.";
/** The status line Save sets while the draft has no name (TL-8). */
export const NAME_FIRST = "Type the name on the phone first";
export function profileRows(d: Profile | null): Row[] {
  const t = d?.type ?? "high-school", r = AGE_RANGE[t];
  // the name is typed on the phone (TL-8): Select on this cell opens the hand-off
  const rows: Row[] = [{ title: "Name", cells: [{ kind: "name", label: (d?.name ?? "").trim() || "Type it on the phone", blurb: NAME_BLURB }] }];
  rows.push({ title: "Type of student", cells: TYPES.map((x) => ({ kind: "type", label: TYPE_WORDS[x], blurb: TYPE_BLURB[x], type: x })) });
  if (r) rows.push({ title: "Age", cells: Array.from({ length: r[1] - r[0] + 1 }, (_, i) => r[0] + i).map((n) => ({ kind: "age", label: String(n), blurb: "", age: n })) });
  // the Year row (L1-nela-12-MB5-1): the birthday cut-off puts a learner a year either side of the age-derived one, and the
  // profile has no birth date to compute it; the cells are that year and one either side, the lamp rests on the pick or the derived year
  const derived = d?.age !== undefined && r ? schoolYear(d.system ?? "uk", d.age) : undefined;
  if (derived !== undefined) {
    const y = d?.year ?? derived, lo = Math.max(1, Math.min(derived - 1, y)), hi = Math.max(derived + 1, y);
    rows.push({ title: "School year", cells: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => ({ kind: "year", label: String(n), blurb: "The year they are in, if the age puts them a year off.", year: n })) });
  }
  // the Mode row only where there is a choice to make (18+, or "other"): under 18 the mode is Family and the row would
  // only cost the screen its room (the caption ran into Save/Back with it, 2026-10-07 capture)
  if (adultAllowed(d ?? { type: t })) rows.push({ title: "Mode", cells: modeCells(d ?? { type: t }) });
  rows.push({ title: "School system", cells: SYSTEMS.map((x) => ({ kind: "system", label: SYSTEM_WORDS[x], blurb: SYSTEM_BLURB[x], system: x })) });
  rows.push({ title: "Interested in", cells: (["maths", "english", "essay"] as Subject[]).map((m) => ({ kind: "interest", label: BRAND[m], blurb: MODULE_BLURB[m], sub: m })) });
  // an elementary child is on the school path: a university course is not offered there unless the draft already holds one
  if ((d?.modules ?? ALL).includes("maths") && (t !== "elementary" || (d?.mathPath !== undefined && d.mathPath !== "school"))) rows.push({ title: "Maths course", cells: COURSES.map((p) => ({ kind: "path", label: PATHS[p].name, blurb: PATHS[p].blurb, path: p })) });
  rows.push({ title: "", cells: [{ kind: "save", label: "Save", blurb: saveBlurb(d) }, { kind: "back", label: "Back", blurb: "Throw the draft away and go back." }] });
  return rows;
}
/** The cell of a row the lamp lands on when a pick moves on to it: the draft's own value, else the likely one (the middle of the age range, Family, the first course), else the first cell. */
export function likelyIx(row: Row, d: Profile | null): number {
  const first = row.cells[0];
  if (!first) return 0;
  const at = (hit: (c: Cell) => boolean) => Math.max(0, row.cells.findIndex(hit));
  switch (first.kind) {
    case "age": { if (d?.age !== undefined) return at((c) => c.age === d.age); const r = AGE_RANGE[d?.type ?? "high-school"]; return r ? Math.round((r[1] - r[0]) / 2) : 0; }
    case "year": { const y = yearOf(d); return y === undefined ? 0 : at((c) => c.year === y); }
    case "mode": return at((c) => c.mode === (d?.mode ?? "family"));
    case "system": return at((c) => c.system === systemOf(d));
    case "path": return at((c) => c.path === (d?.mathPath ?? "school"));
    case "type": return at((c) => c.type === (d?.type ?? "high-school"));
    default: return 0;
  }
}
export function locate(rows: Row[], f: number): { r: number; c: number } {
  let i = f; for (let r = 0; r < rows.length; r++) { if (i < rows[r].cells.length) return { r, c: i }; i -= rows[r].cells.length; }
  return { r: rows.length - 1, c: 0 };
}
export function flat(rows: Row[], r: number, c: number): number {
  let f = 0; for (let i = 0; i < r; i++) f += rows[i].cells.length; return f + Math.max(0, Math.min(c, rows[r].cells.length - 1));
}
