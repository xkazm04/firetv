/**
 * Math Buddy's ruler, as numbers: where the Topics and Tonight rulers draw each topic, each strand label, the needle
 * and the SCHOOL tick, and - for a path too long for one box per topic (Calculus 1: 22 topics in six strands) - how
 * far the Topics ruler pans so the focused topic stays under the lamp, and the strand-level bar Tonight draws instead.
 * The three-topic school path comes out exactly as the ruler always drew it (tools/maths-ruler-test.cjs holds the old
 * formulas against this module).
 *
 * Pure: types, and the frontier rule from library/paths.ts (client-safe library data), are all it imports - never the
 * store, the learners file or the filesystem, so the TV and a test may each read it (the tools/tv-keys-test.cjs GUARD
 * pattern).
 */
import { afterLastSecure, type PathTopic } from "@/lib/library/paths";
import type { TopicState } from "@/tv/mathsRows";

/** The ruler's width on the stage: 1920 less the two 96 px safe margins (design/maths-lamplight.css .mb-ruler). */
export const TRACK = 1728;
/** The margin inside each end of the ruler before the first tick and after the last (the 52 px margins, as always). */
export const PAD = 26;
/** Half the ruler: a panning ruler holds the focused topic's centre here, under the lamp. */
export const HALF = TRACK / 2;
/**
 * The narrowest slot a topic takes on the big (Topics) ruler: 288 px, so its box (276) holds a name of up to three
 * lines at 34 px beside its neighbours. A path whose slots would be narrower than this at one box per topic across
 * the ruler pans instead.
 */
export const MIN_SPAN = 288;
/**
 * The focused topic's slot on a panning ruler: wide enough that every Calculus 1 name - the longest is 62 characters,
 * "Derivatives of polynomials, and the product and quotient rules" - is shown whole in at most three lines at
 * 34-44 px (`fitName`), where a 288 px slot would need four or five.
 */
export const FOCUS_SPAN = 640;
/** The sizes the focused name is tried at on a panning ruler, largest first: the big ruler's 44 px down to a 34 px floor. */
export const NAME_SIZES = [44, 42, 40, 38, 36, 34];
/** A strand label sits this far in from its strand's start (as the ruler always set it). */
export const LABEL_INSET = 20;
/** The clear space a strand label keeps before the next strand begins. */
export const LABEL_GAP = 16;
/**
 * A strand label's width per character: 20 px Manrope 800 uppercase at .2em tracking (.mb-strand) - the scout measured
 * "APPLICATIONS OF DERIVATIVES" at ~430 px for 27 characters. Rounded up, so a label the model keeps whole fits.
 */
export const LABEL_CH = 16;
/** Tonight's ruler draws one box per topic up to this many topics; a longer path is drawn as one bar per strand. */
export const STRIP_AFTER = 8;
/** The narrowest bar a strand takes on Tonight's strip, so a one-topic strand is still a bar with a label. */
export const MIN_SEG = 96;
/** The most lines a strand's label takes on Tonight's strip (two fit under the groove, above the bar's foot). */
export const STRIP_LINES = 2;
/** The room a strip bar keeps beside its label: 18 px in from its start and 18 px clear before its end. */
export const STRIP_INSET = 36;
/**
 * A strip label's width per character for WHOLE labels (Family W7 batch 3): the live capture measured "EQUATIONS" at 150 px,
 * 16.7 px a character with the tracking after the last letter, over LABEL_CH's 16 - enough to cut a label that exactly
 * fills its room. 17 keeps a whole label whole.
 */
export const STRIP_CH = 17;

type RulerTopic = Pick<PathTopic, "id" | "strand">;

/** One topic on the ruler: its slot (sx, sw: from tick to tick) and its box inside it (x, w: 6 px in from each tick). */
export interface RulerSlot { id: string; sx: number; sw: number; x: number; w: number; state: TopicState }
/** One strand: where it runs (x, w), and its label - where it starts, the room it has, and the text that fits it. */
export interface RulerStrand { name: string; x: number; w: number; labelX: number; labelW: number; label: string }
export interface RulerModel {
  /** The slot width: (1728 - 52) / N when one box per topic fits, else MIN_SPAN (the focused slot is FOCUS_SPAN). */
  span: number;
  /** The whole track: the ruler's 1728 px, or wider for a path that pans. */
  trackWidth: number;
  /** How far the track is slid left so the focused topic is under the lamp: 0 .. trackWidth - 1728. */
  offset: number;
  pan: boolean;
  /** Whether each edge still has more of the track to show (a chevron there). */
  more: { l: boolean; r: boolean };
  strands: RulerStrand[];
  topics: RulerSlot[];
  /** The last tick: the right end of the last slot. */
  end: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A strand label as the room allows: whole when it fits (`LABEL_CH` a character), else as many characters as leave
 * room for an ellipsis, with no space before it. The strand's full name is always in the Topics lede's kicker.
 */
export function clampLabel(name: string, room: number, ch = LABEL_CH): string {
  if (name.length * ch <= room) return name;
  const n = Math.floor(room / ch) - 1;
  return n > 0 ? `${name.slice(0, n).trimEnd()}…` : "";
}

/** The strands, in path order, over the slots they cover. */
function strandsOver(topics: RulerTopic[], slots: Array<{ sx: number; sw: number }>, inset: number, gap: number): RulerStrand[] {
  const out: RulerStrand[] = [];
  topics.forEach((t, i) => {
    const last = out[out.length - 1];
    if (last && topics[i - 1]?.strand === t.strand) { last.w += slots[i].sw; return; }
    out.push({ name: t.strand, x: slots[i].sx, w: slots[i].sw, labelX: 0, labelW: 0, label: "" });
  });
  for (const g of out) { g.labelX = g.x + inset; g.labelW = Math.max(0, g.w - inset - gap); g.label = clampLabel(g.name, g.labelW); }
  return out;
}

/**
 * The ruler for `topics` (the learner's path, in order) with their `states`, the Topics stop in `focus` (undefined on
 * Tonight), on the big ruler or the small one. One box per topic across the ruler when the slots are at least
 * MIN_SPAN, or always on the small ruler; else (big) the track is wider than the ruler, the focused slot is
 * FOCUS_SPAN wide, and the track is slid by clamp(focusX - 864, 0, trackWidth - 1728) so the focused topic is under
 * the lamp and neither end ever shows a gap.
 */
export function rulerModel(topics: RulerTopic[], states: Record<string, TopicState>, focus: number | undefined, big?: boolean): RulerModel {
  const N = topics.length, room = TRACK - PAD * 2;
  const natural = room / Math.max(1, N);
  const pan = !!big && natural < MIN_SPAN;
  const f = focus === undefined || N === 0 ? undefined : clamp(Math.round(focus), 0, N - 1);
  let slots: Array<{ sx: number; sw: number }>;
  if (!pan) slots = topics.map((_, i) => ({ sx: PAD + i * natural, sw: natural }));
  else { let x = PAD; slots = topics.map((_, i) => { const sw = i === f ? FOCUS_SPAN : MIN_SPAN, s = { sx: x, sw }; x += sw; return s; }); }
  const end = !pan ? PAD + N * natural : (slots[N - 1] ? slots[N - 1].sx + slots[N - 1].sw : PAD);
  const trackWidth = pan ? end + PAD : TRACK;
  const offset = pan && f !== undefined ? clamp(slots[f].sx + slots[f].sw / 2 - HALF, 0, trackWidth - TRACK) : 0;
  return {
    span: pan ? MIN_SPAN : natural,
    trackWidth, offset, pan,
    more: { l: offset > 0, r: pan && offset < trackWidth - TRACK },
    strands: strandsOver(topics, slots, LABEL_INSET, LABEL_GAP),
    topics: topics.map((t, i) => ({ id: t.id, sx: slots[i].sx, sw: slots[i].sw, x: slots[i].sx + 6, w: slots[i].sw - 12, state: states[t.id] ?? "later" })),
    end,
  };
}

/**
 * The learner's needle: at topic `frontier` (`rulerFrontier`), `fill` of the way through it (its estimate; 1 when it
 * is secure). A frontier past the last topic is the end of the ruler.
 */
export function needleX(m: RulerModel, frontier: number, fill: number): number {
  if (!m.pan) return PAD + (frontier + fill) * m.span;
  const t = m.topics[frontier];
  return t ? t.sx + clamp(fill, 0, 1) * t.sw : m.end;
}

/**
 * The topic the learner's needle stands in (an index into `topics`):
 *   - a school path (Family W5b): the first topic not latched secure AFTER the last latched one, else the first topic
 *     (paths.ts `frontierOn`), so a unit placed before topics a learner already secured does not send the needle back
 *     to the start; with the last topic secure, the last topic (the needle then stands at its end, filled);
 *   - a course path: the first topic not latched secure, else the last - as the ruler always drew it.
 */
export function rulerFrontier(topics: Array<Pick<PathTopic, "id">>, isSecure: (id: string) => boolean, school: boolean): number {
  const N = topics.length;
  if (school) return Math.min(N - 1, afterLastSecure(topics.map((t) => t.id), isSecure));
  for (let i = 0; i < N; i++) if (!isSecure(topics[i].id)) return i;
  return N - 1;
}

/**
 * What of the school comparison the ruler draws: the SCHOOL tick whenever the path has a school year for the learner
 * (`exp` from paths.ts `expectedOn`, null on a course or with no age), and the gap line between the needle and the
 * tick only once the learner has a Math placement (owner decision D2, Family Phase 1: a gap drawn from a guessed place
 * makes a new learner look behind). Phase 1 has no Math placement, so no gap line is drawn; its code stays for one.
 */
export function schoolMarks(exp: number | null, placed: boolean): { tick: boolean; gap: boolean } {
  const tick = exp !== null;
  return { tick, gap: tick && placed };
}

/** The SCHOOL tick after `exp` topics (paths.ts `expectedOn`, school paths only), clamped to the ruler. */
export function flagX(m: RulerModel, exp: number): number {
  const N = m.topics.length, e = clamp(exp, 0, N);
  if (!m.pan) return PAD + e * m.span;
  const i = Math.floor(e), t = m.topics[i];
  return t ? t.sx + (e - i) * t.sw : m.end;
}

/** How far in from the ruler window's edge the SCHOOL pill must stand to be shown centred on its tick (its half-width, rounded up). */
export const FLAG_EDGE = 90;

/**
 * Whether the SCHOOL tick at track position `x` is on the stage, and which way its pill turns: on a ruler that does not
 * pan it is always seen and never turned; on a panning ruler (seven school topics since Family W7) it is seen only
 * while x is inside the window (offset .. offset + 1728), and within FLAG_EDGE of the window's right edge its pill sits
 * to the left of the tick ('r'), within FLAG_EDGE of the left edge to the right ('l'), so the window never cuts it.
 */
export function flagOnStage(m: RulerModel, x: number): { seen: boolean; edge: "l" | "r" | null } {
  if (!m.pan) return { seen: true, edge: null };
  const at = x - m.offset;
  if (at < 0 || at > TRACK) return { seen: false, edge: null };
  return { seen: true, edge: at > TRACK - FLAG_EDGE ? "r" : at < FLAG_EDGE ? "l" : null };
}

/**
 * The focused name's size on a panning ruler: the first of NAME_SIZES at which `fits(px)` (the name whole, in at most
 * three lines, no word clipped - measured in the browser), else the 34 px floor. Never under the floor.
 */
export function fitName(fits: (px: number) => boolean, sizes: readonly number[] = NAME_SIZES): number {
  for (const px of sizes) if (fits(px)) return px;
  return sizes[sizes.length - 1];
}

/**
 * A strand label in whole words, greedy, each line within `room` at `ch` a character, in at most `max` lines; null when a
 * word alone is wider than the room or the words need more lines. Never cuts a word.
 */
export function wrapLabel(name: string, room: number, ch = LABEL_CH, max = STRIP_LINES): string[] | null {
  const lines: string[] = [];
  for (const word of name.split(/\s+/).filter(Boolean)) {
    if (word.length * ch > room) return null;
    const last = lines[lines.length - 1];
    if (last !== undefined && (last.length + 1 + word.length) * ch <= room) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines.length <= max ? lines : null;
}

/** The narrowest label room (px) in which `name` wraps whole into at most two lines: its best split's longer line, or its one word. */
export function labelNeed(name: string, ch = LABEL_CH): number {
  const words = name.split(/\s+/).filter(Boolean);
  let best = name.length;
  for (let i = 1; i < words.length; i++) best = Math.min(best, Math.max(words.slice(0, i).join(" ").length, words.slice(i).join(" ").length));
  return best * ch;
}

/**
 * One strand on Tonight's strip: how many topics, how many latched secure, and its bar and label (`lines`, top to bottom;
 * `label` their words); and how many have a latched step-up record (`stretch`, Family W8) and their share, which the
 * strip draws as a second, thinner line under the bar - a length, never a number.
 */
export interface StripSegment { name: string; count: number; secure: number; share: number; stretch: number; stretchShare: number; x: number; w: number; labelX: number; labelW: number; label: string; lines: string[] }
export interface StripModel {
  x0: number;
  width: number;
  segments: StripSegment[];
  /** The learner's needle: the frontier topic's index (N when every topic is secure) and where it stands. */
  needle: { index: number; x: number; at: "start" | "mid" | "end" };
}

/**
 * Tonight's ruler for a long path: one bar per strand across the ruler's 1676 px, as wide as its share of the topics
 * but never under MIN_SEG - nor under the room its label needs to stand whole in at most two lines (`labelNeed`, Family
 * W7 batch 3: a one-topic "Equations" bar had read "Equati…"), whenever every strand's need fits the strip together (else
 * MIN_SEG alone, and a label that does not fit is clamped with an ellipsis as before) - each filled by its share of
 * latched-secure topics, and the learner's needle at the frontier
 * one slot in for each topic of its strand before it. The frontier is, on a course (`school` false), the first topic
 * not secure whose prerequisites all are; on a school path, the first topic not secure after the last secure one
 * (paths.ts `frontierOn`, the same rule as the ruler's `rulerFrontier`). Widths are whole pixels and sum to the strip.
 */
export function stripModel(topics: Array<Pick<PathTopic, "id" | "strand" | "prereq">>, states: Record<string, TopicState>, school = false, stretched: (id: string) => boolean = () => false): StripModel {
  const width = TRACK - PAD * 2;
  const groups: Array<{ name: string; ids: string[] }> = [];
  topics.forEach((t, i) => { const last = groups[groups.length - 1]; if (last && topics[i - 1]?.strand === t.strand) last.ids.push(t.id); else groups.push({ name: t.strand, ids: [t.id] }); });
  // each bar's floor: MIN_SEG, or the room its label needs whole, when all of those fit the strip together
  const needs = groups.map((g) => Math.max(MIN_SEG, Math.ceil(labelNeed(g.name, STRIP_CH)) + STRIP_INSET));
  const floor = needs.reduce((a, b) => a + b, 0) <= width ? needs : groups.map(() => MIN_SEG);
  // proportional widths; a bar under its floor is held at it and the rest share what is left, until none is under
  const fixed = new Set<number>();
  let w: number[] = [];
  for (let guard = 0; guard <= groups.length; guard++) {
    const free = width - [...fixed].reduce((a, i) => a + floor[i], 0), n = groups.reduce((a, g, i) => a + (fixed.has(i) ? 0 : g.ids.length), 0);
    w = groups.map((g, i) => (fixed.has(i) ? floor[i] : (free * g.ids.length) / Math.max(1, n)));
    const under = w.map((_x, i) => i).filter((i) => !fixed.has(i) && w[i] < floor[i]);
    if (!under.length) break;
    under.forEach((i) => fixed.add(i));
  }
  // whole pixels that still sum to the strip: each boundary rounded once
  let cum = 0;
  const bounds = [PAD, ...w.map((x) => { cum += x; return PAD + Math.round(cum); })];
  bounds[bounds.length - 1] = PAD + width;
  const secure = new Set(topics.filter((t) => states[t.id] === "secure").map((t) => t.id));
  const segments: StripSegment[] = groups.map((g, i) => {
    const x = bounds[i], sw = bounds[i + 1] - bounds[i], n = g.ids.filter((id) => secure.has(id)).length, up = g.ids.filter((id) => stretched(id)).length;
    const labelX = x + 18, labelW = Math.max(0, sw - STRIP_INSET);
    const lines = wrapLabel(g.name, labelW, STRIP_CH) ?? [clampLabel(g.name, labelW, STRIP_CH)];
    return { name: g.name, count: g.ids.length, secure: n, share: n / g.ids.length, stretch: up, stretchShare: up / g.ids.length, x, w: sw, labelX, labelW, label: lines.join(" "), lines };
  });
  const fi = school ? afterLastSecure(topics.map((t) => t.id), (id) => secure.has(id)) : topics.findIndex((t) => !secure.has(t.id) && t.prereq.every((p) => secure.has(p)));
  if (fi < 0 || fi >= topics.length) return { x0: PAD, width, segments, needle: { index: topics.length, x: PAD + width, at: "end" } };
  const x = stripAt({ x0: PAD, width, segments }, fi);
  return { x0: PAD, width, segments, needle: { index: fi, x, at: x <= PAD ? "start" : "mid" } };
}

/**
 * Where the strip stands before topic `k` (0..N) of the path: inside the bar of the strand that holds topic k, one slot
 * in for each topic of that strand before it (the needle's rule); the strip's end for k = N or past it. A strand that
 * appears twice on the path (Equations since Family W7 batch 2: one-step before the decimals and percent strand, the
 * other two after it) is two bars, and each bar counts only its own topics.
 */
export function stripAt(m: Pick<StripModel, "x0" | "width" | "segments">, k: number): number {
  let before = 0;
  for (const g of m.segments) {
    if (k < before + g.count) return g.x + (g.w * Math.max(0, k - before)) / g.count;
    before += g.count;
  }
  return m.x0 + m.width;
}

/**
 * The SCHOOL tick on Tonight's strip (Family W7 batch 2: past eight topics the school path's Tonight ruler is the strip,
 * and owner decision D2 keeps the tick on the child's TV): after `exp` topics (paths.ts `expectedOn`), clamped to the
 * strip, and which way its pill turns - inward at either end, within FLAG_EDGE of it, so the ruler never cuts it.
 */
export function stripFlag(m: StripModel, exp: number): { x: number; edge: "l" | "r" | null } {
  const N = m.segments.reduce((a, g) => a + g.count, 0), e = clamp(Math.round(exp), 0, N);
  const x = stripAt(m, e);
  return { x, edge: e >= N || x > TRACK - FLAG_EDGE ? "r" : e <= 0 || x < FLAG_EDGE ? "l" : null };
}
