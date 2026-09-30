/**
 * Get ready for school (Family W8), as data: the school units grouped by strand, the learner's own year label for each,
 * the D-pad's stops, where the scroller puts each card and how far it pans, and the screen's sentences. The owner asked
 * for "help in school to prepare before exercise" apart from the home learner's ruler: this door answers "what is school
 * doing now", so nothing of the path is here - no ruler, no Secure / In progress / Not started, no needle, no SCHOOL tick,
 * no gap line - only the units and the learner's own school-year word for each. Select on a unit asks "The usual" or
 * "A step up" (rules/stretch sets how hard each is) and writes the set the way Topics does.
 *
 * Pure: types, and the path data (client-safe library data), are all it imports - never the store or the filesystem.
 */
import type { SchoolSystem, Session } from "@/lib/session/store";
import { PATHS, learnerPath, topicsOf, type PathTopic } from "@/lib/library/paths";

/** A topic's school year as the learner's school system says it. Handed a year, never a topic: a course topic has none. */
export const SYS_WORD: Record<SchoolSystem, (y: NonNullable<PathTopic["year"]>) => string> = {
  us: (y) => `Grade ${y.us}`, uk: (y) => `Year ${y.uk}`, cz: (y) => `${y.cz}. ročník`, de: (y) => `Klasse ${y.de}`,
};

type OnPath = Partial<Pick<Session, "profiles" | "learner">>;

/** One strand of the Prepare list: its name and its units, in path order. */
export interface PrepareGroup { strand: string; units: PathTopic[] }

/**
 * The school units grouped by strand, strands in the order the path first meets them (Fractions, Equations, Decimals and
 * percent, Ratio and rates, Geometry and data) and each strand's units in path order - so the three linear topics are one
 * Equations group, although the path meets one-step equations before the decimals. Empty for a learner on a course path
 * (Calculus 1 has no Get ready for school door).
 */
export function prepareGroups(s: OnPath): PrepareGroup[] {
  const path = learnerPath(s);
  if (!PATHS[path].school) return [];
  const out: PrepareGroup[] = [];
  for (const t of topicsOf(path)) {
    const g = out.find((x) => x.strand === t.strand);
    if (g) g.units.push(t); else out.push({ strand: t.strand, units: [t] });
  }
  return out;
}

/** The Prepare screen's stops, left to right: every unit, strand by strand (the same list the screen draws). */
export function prepareStops(s: OnPath): PathTopic[] {
  return prepareGroups(s).flatMap((g) => g.units);
}

/** The two cells Select on a unit asks between: the usual set, or a step up (rules/stretch). "The usual" is first and lit first. */
export const PREPARE_CHOICES = [
  { id: "usual", t: "The usual", k: "Your level" },
  { id: "stretch", t: "A step up", k: "More of the harder ones" },
] as const;

/** The one sentence under the two cells, for the lit one. */
export function choiceLine(cell: number): string {
  return cell === 1
    ? "Six questions with more of the harder kind, and a secure step up draws a second line on its topic."
    : "Six questions at your usual level, marked by the desk when you snap or type your answers.";
}

/** Tonight's caption on the Get ready for school door. */
export const PREPARE_DOOR = "Pick what school is teaching next and practise it before the lesson.";

// ---------------------------------------------------------------- the scroller: cards under the lamp

/** The scroller's window: the ruler's 1728 px (the safe zone), as Topics. */
export const WINDOW = 1728;
/** A unit card's width, the gap between two cards of a strand, and the gap between two strands. */
export const CARD = 400;
export const CARD_GAP = 24;
export const GROUP_GAP = 72;
/** The room kept at each end of the track, so the focused card's glow is never cut by the window. */
export const EDGE = 40;
/** How far a window edge with more to show fades out (design/maths-lamplight.css .mb-pwin mask): a strand heading keeps clear of it. */
export const FADE = 150;
/** A strand heading's width per character: 20 px Manrope 800 uppercase at .2em tracking (tv/rulerRows STRIP_CH, measured). */
export const HEAD_CH = 17;

export interface PrepareCard { id: string; x: number; w: number; group: number }
/** A strand over its cards (x, w) and where its heading starts (`labelX`): at the strand's start, or kept on the stage past the fade. */
export interface PrepareStrand { strand: string; x: number; w: number; labelX: number }
export interface PrepareModel {
  cards: PrepareCard[];
  strands: PrepareStrand[];
  trackWidth: number;
  /** How far the track is slid left so the focused card is under the lamp: 0 .. trackWidth - WINDOW. */
  offset: number;
  more: { l: boolean; r: boolean };
}

/**
 * Where each card and strand heading goes, and how far the track pans so the focused card's centre sits under the lamp
 * (the window's middle), clamped so neither end shows a gap - the Topics ruler's pan, for cards.
 */
export function prepareModel(groups: PrepareGroup[], focus: number): PrepareModel {
  const cards: PrepareCard[] = [], strands: PrepareStrand[] = [];
  let x = EDGE;
  groups.forEach((g, gi) => {
    if (gi > 0) x += GROUP_GAP - CARD_GAP;
    const x0 = x;
    for (const u of g.units) { cards.push({ id: u.id, x, w: CARD, group: gi }); x += CARD + CARD_GAP; }
    strands.push({ strand: g.strand, x: x0, w: x - CARD_GAP - x0, labelX: x0 });
  });
  const end = cards.length ? cards[cards.length - 1].x + CARD : EDGE;
  const trackWidth = Math.max(WINDOW, end + EDGE);
  const f = cards.length ? Math.max(0, Math.min(cards.length - 1, Math.round(focus))) : 0;
  const c = cards[f];
  const offset = c ? Math.max(0, Math.min(trackWidth - WINDOW, c.x + c.w / 2 - WINDOW / 2)) : 0;
  // a strand that starts off the stage keeps its heading on it, past the left fade, as long as the heading still fits over its cards
  if (offset > 0) for (const s of strands) s.labelX = Math.max(s.x, Math.min(offset + FADE, s.x + s.w - s.strand.length * HEAD_CH));
  return { cards, strands, trackWidth, offset, more: { l: offset > 0, r: offset < trackWidth - WINDOW } };
}
