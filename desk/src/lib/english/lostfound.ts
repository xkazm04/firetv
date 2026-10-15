/**
 * The lost-property table (L3, pool P14): spoken English changes the scene. A pilot inside ONE scene, "The lost
 * jacket" (curriculum.ts id "lost"); every other scene is untouched.
 *
 * At scene start code lays out a small seeded shelf: five things (jackets, bottles, bags) that differ by kind, colour,
 * size, pattern and the place each was found. One of them is the learner's, and which one is the hidden fact. It stays
 * here, in server memory, like help.ts's unrevealed rungs and check.ts's answer keys: it never reaches the session,
 * which every screen reads. The session holds only the public task (LostTask): the shelf, what is put aside, what a
 * name label showed was someone else's, and what was found. The phone draws the learner's thing from lostPicture, a
 * reply to the phone's own request, never from the session.
 *
 * The learner's reply is read by a bounded parser over a small reviewed vocabulary (VOCAB, with a few accepted
 * alternatives for each word): negation ("not the red one", "it isn't big") and abstention, so a hedge ("maybe"), an
 * "or", or two values that cannot both hold change nothing. Wording it does not know changes nothing either. An
 * accepted description keeps exactly the things that match it. Code alone finds the item: when one thing is left on
 * the table and it is the learner's. The partner, in the turn's one model call, only phrases what code decided, from
 * the public facts lostFacts gives it; nothing in the model's answer is read here, so a model claim never changes the
 * task. Finding it is task completion only: it writes no evidence and earns no skill credit.
 *
 * Pure: no React, no filesystem, no model. A target lost to a restart stands the task down (lostTurn returns null),
 * as a ladder lost to a restart gives way to the scene's cue.
 */

export const LOST_SCENE = "lost";
export const LOST_KINDS = ["jacket", "bottle", "bag"] as const;
export const LOST_COLOURS = ["red", "blue", "green", "yellow"] as const;
export const LOST_SIZES = ["big", "small"] as const;
export const LOST_PATTERNS = ["plain", "stripes", "stars"] as const;
export const LOST_PLACES = ["gym", "playground", "classroom", "canteen"] as const;
export type LostKind = typeof LOST_KINDS[number];
export type LostColour = typeof LOST_COLOURS[number];
export type LostSize = typeof LOST_SIZES[number];
export type LostPattern = typeof LOST_PATTERNS[number];
export type LostPlace = typeof LOST_PLACES[number];
export type LostDim = "kind" | "colour" | "size" | "pattern" | "place";
export const LOST_VALUES: Record<LostDim, readonly string[]> = { kind: LOST_KINDS, colour: LOST_COLOURS, size: LOST_SIZES, pattern: LOST_PATTERNS, place: LOST_PLACES };

/** A thing on the lost-property shelf, as the picture draws it. */
export interface LostThing { kind: LostKind; colour: LostColour; size: LostSize; pattern: LostPattern; place: LostPlace; }
export interface LostItem extends LostThing { id: string; }
/** What code made of the last reply (or "start" before one). */
export type LostOutcome = "start" | "narrowed" | "same" | "again" | "none" | "unclear" | "unknown" | "not-yours" | "found" | "done";
/**
 * The public half of the task, on the conversation: every screen may read it. It never says which thing is the
 * learner's until code found it.
 */
export interface LostTask {
  /** the shelf, in its order on the table */
  items: LostItem[];
  /** put aside: not on the table now (includes `checked`) */
  out: string[];
  /** one thing was left, and its name label said someone else's: out for good */
  checked: string[];
  /** set by code only, when one thing was left and it was the learner's */
  found: string | null;
  last: { outcome: LostOutcome; heard: string };
  /** what the partner asks about next: the attribute that splits the table best, null when nothing is left to ask */
  askAbout: LostDim | null;
}

// ---- the shelf

/** mulberry32: a small seeded generator, so a seed always lays out the same shelf. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const otherThan = <T,>(r: () => number, xs: readonly T[], not: T): T => pick(r, xs.filter(x => x !== not));
const same = (a: LostThing, b: LostThing) => (Object.keys(LOST_VALUES) as LostDim[]).every(d => a[d] === b[d]);
const freshThing = (r: () => number, kind: LostKind): LostThing => ({ kind, colour: pick(r, LOST_COLOURS), size: pick(r, LOST_SIZES), pattern: pick(r, LOST_PATTERNS), place: pick(r, LOST_PLACES) });

/**
 * The shelf a seed lays out: five things, three of the learner's kind and two of other kinds, and which one is the
 * learner's. The three of a kind are one thing, the same with another colour, and the same with one more difference
 * (size, pattern or place); one of the other kinds shares the colour, so neither kind nor colour alone finds it. The
 * learner's is any of the three, so the shelf's shape does not point at it. The variant is the learner's kind.
 */
export function shelfOf(seed: number): { items: LostItem[]; target: string } {
  const r = rng(seed), kind = pick(r, LOST_KINDS), base = freshThing(r, kind);
  const recoloured: LostThing = { ...base, colour: otherThan(r, LOST_COLOURS, base.colour) };
  const dim = pick(r, ["size", "pattern", "place"] as const);
  const changed: LostThing = { ...base, [dim]: otherThan(r, LOST_VALUES[dim], base[dim]) } as LostThing;
  const others = LOST_KINDS.filter(k => k !== kind);
  const sameColour: LostThing = { ...freshThing(r, pick(r, others)), colour: base.colour };
  let any = freshThing(r, pick(r, others));
  if (same(any, sameColour)) any = { ...any, colour: otherThan(r, LOST_COLOURS, any.colour) };
  const mine = Math.floor(r() * 3), things = [base, recoloured, changed, sameColour, any];
  // shuffle, keeping track of the learner's
  const order = things.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const items = order.map((k, i) => ({ id: "abcde"[i], ...things[k] }));
  return { items, target: items[order.indexOf(mine)].id };
}

/** The task as it starts: built from the shelf's public items alone, so it cannot carry the hidden fact. */
export function publicTask(items: LostItem[]): LostTask {
  return { items, out: [], checked: [], found: null, last: { outcome: "start", heard: "" }, askAbout: askAbout(items) };
}
export const onTable = (t: LostTask): LostItem[] => t.items.filter(x => !t.out.includes(x.id));

/** The attribute whose values split these things into the most groups; colour first on a tie (the easiest to say). */
const ASK_ORDER: LostDim[] = ["colour", "kind", "size", "pattern", "place"];
export function askAbout(items: LostItem[]): LostDim | null {
  if (items.length < 2) return null;
  let best: LostDim | null = null, most = 1;
  for (const d of ASK_ORDER) { const n = new Set(items.map(x => x[d])).size; if (n > most) { best = d; most = n; } }
  return best;
}

// ---- the parser

/**
 * The reviewed vocabulary: each phrase, the attribute it names and the value. Two-word phrases are read first, so "no
 * pattern" is plain and "water bottle" one bottle. Anything not here is wording the parser does not know.
 */
export const VOCAB: ReadonlyArray<readonly [string, LostDim, string]> = [
  ["jacket", "kind", "jacket"], ["coat", "kind", "jacket"], ["hoodie", "kind", "jacket"],
  ["bottle", "kind", "bottle"], ["water bottle", "kind", "bottle"], ["flask", "kind", "bottle"],
  ["bag", "kind", "bag"], ["school bag", "kind", "bag"], ["schoolbag", "kind", "bag"], ["backpack", "kind", "bag"], ["rucksack", "kind", "bag"],
  ["red", "colour", "red"], ["blue", "colour", "blue"], ["navy", "colour", "blue"], ["green", "colour", "green"], ["yellow", "colour", "yellow"],
  ["big", "size", "big"], ["large", "size", "big"], ["huge", "size", "big"], ["small", "size", "small"], ["little", "size", "small"], ["tiny", "size", "small"],
  ["plain", "pattern", "plain"], ["no pattern", "pattern", "plain"], ["stripes", "pattern", "stripes"], ["stripe", "pattern", "stripes"], ["striped", "pattern", "stripes"], ["stripy", "pattern", "stripes"], ["stars", "pattern", "stars"], ["star", "pattern", "stars"], ["starry", "pattern", "stars"],
  ["gym", "place", "gym"], ["sports hall", "place", "gym"], ["pe", "place", "gym"],
  ["playground", "place", "playground"], ["outside", "place", "playground"], ["yard", "place", "playground"],
  ["classroom", "place", "classroom"], ["class", "place", "classroom"],
  ["canteen", "place", "canteen"], ["dining hall", "place", "canteen"], ["lunch room", "place", "canteen"], ["lunchroom", "place", "canteen"], ["cafeteria", "place", "canteen"], ["lunch", "place", "canteen"],
];
const LEXICON = new Map(VOCAB.map(([w, d, v]) => [w, [d, v] as const]));
const NEGATORS = new Set(["not", "no", "without", "never"]);
/** A clause with one of these is unsure: dropped when it names nothing, and the whole reply abstains when it does. */
const HEDGES = [/\bmaybe\b/, /\bperhaps\b/, /\bprobably\b/, /\bnot sure\b/, /\bdo not know\b/, /\bdo not remember\b/, /\bi guess\b/, /\bor something\b/, /\bkind of\b/, /\bsort of\b/, /\ba (little )?bit\b/];

type Pair = readonly [LostDim, string];
export interface Description { is: Partial<Record<LostDim, string>>; not: Pair[][]; }
export type Reading =
  | { kind: "description"; d: Description; heard: string }
  | { kind: "unknown" }
  | { kind: "abstain"; why: "unsure" | "two-choices" | "contradiction" };

function normal(reply: string): string {
  return reply.toLowerCase().replace(/[’‘`]/g, "'")
    .replace(/\bcan't\b/g, "can not").replace(/\bwon't\b/g, "will not").replace(/n't\b/g, " not")
    .replace(/\bit's\b/g, "it is").replace(/\bthat's\b/g, "that is").replace(/\bi'm\b/g, "i am").replace(/'s\b/g, "").replace(/'/g, "");
}

/**
 * Read one reply. A negator ("not", "no", "without", "never") opens a scope that takes the attribute words after it
 * until "one", a new "it is" / "it has" / "it was" / "mine is", or the end of the clause; one scope is one excluded
 * combination, so "not the big red one" rules out the big red ones, not every big one and every red one. Clauses end
 * at . , ; : ! ? and "but". A clause that opens with "no" is an answer word, not a negator.
 */
export function readReply(reply: string): Reading {
  const is = new Map<LostDim, Set<string>>(), not: Pair[][] = [];
  let anything = false;
  for (const clause of normal(reply).split(/[.,;:!?]+|\bbut\b/)) {
    const w = clause.split(/[^a-z]+/).filter(Boolean);
    const named = (() => { for (let i = 0; i < w.length; i++) if (LEXICON.has(w[i]) || LEXICON.has(`${w[i]} ${w[i + 1]}`)) return true; return false; })();
    if (HEDGES.some(h => h.test(w.join(" ")))) { if (named) return { kind: "abstain", why: "unsure" }; continue; }
    if (w.includes("or") && named) return { kind: "abstain", why: "two-choices" };
    let scope: Pair[] | null = null;
    const close = () => { if (scope?.length) not.push(scope); scope = null; };
    for (let i = 0; i < w.length;) {
      const two = LEXICON.get(`${w[i]} ${w[i + 1]}`), hit = two ?? LEXICON.get(w[i]), len = two ? 2 : 1;
      if (hit) {
        anything = true;
        if (scope) {
          // one ruled-out thing per scope: a second value of the same attribute, or a word after its kind word ("not the
          // bag with stars"), could belong to it or to the next phrase, so the reply abstains
          const open = scope as Pair[];
          if (open.some(([dim]) => dim === hit[0] || dim === "kind")) return { kind: "abstain", why: "two-choices" };
          open.push(hit);
        }
        else { const s = is.get(hit[0]) ?? new Set<string>(); s.add(hit[1]); is.set(hit[0], s); }
        i += len; continue;
      }
      if ((w[i] === "it" && ["is", "has", "was"].includes(w[i + 1])) || (w[i] === "mine" && w[i + 1] === "is")) { close(); i += 2; continue; }
      if (w[i] === "its") { close(); i++; continue; }
      // a clause that opens with "no" is an answer ("No, the blue one" said without its comma): a word after it could be
      // what is meant or what is denied, so "no blue" abstains; "no it is blue" and "no the blue one" read on
      if (w[i] === "no" && i === 0) {
        if (LEXICON.has(w[1] ?? "") || LEXICON.has(`${w[1]} ${w[2]}`)) return { kind: "abstain", why: "two-choices" };
        i++; continue;
      }
      if (NEGATORS.has(w[i])) { close(); scope = []; i++; continue; }
      if (w[i] === "one" || w[i] === "ones") close();
      i++;
    }
    close();
  }
  if (!anything) return { kind: "unknown" };
  const d: Description = { is: {}, not };
  for (const [dim, values] of is) { if (values.size > 1) return { kind: "abstain", why: "contradiction" }; d.is[dim] = [...values][0]; }
  // "it is red, not red": a ruled-out combination that the positive words already say
  if (not.some(g => g.every(([dim, v]) => d.is[dim] === v))) return { kind: "abstain", why: "contradiction" };
  const heard = [...(Object.entries(d.is) as Array<[LostDim, string]>).map(([, v]) => v), ...not.map(g => `not ${g.map(([, v]) => v).join(" ")}`)].join(", ");
  return { kind: "description", d, heard };
}

/** Whether a thing fits a description: every named value, and none of the ruled-out combinations. */
export function matches(item: LostThing, d: Description): boolean {
  return (Object.entries(d.is) as Array<[LostDim, string]>).every(([dim, v]) => item[dim] === v) && d.not.every(g => !g.every(([dim, v]) => item[dim] === v));
}

/**
 * The task after one reply, decided in code. An abstention or unknown wording changes nothing but `last` and `askAbout`.
 * A description keeps exactly the things on the table that match it; when none on the table does but some on the shelf
 * do (the learner said it differently, or corrected themselves), the shelf is looked at again with it; when nothing on
 * the shelf matches, nothing changes. When one thing is left, its name label decides: the learner's is found, anyone
 * else's is put away for good and the rest come back. Once found, the task does not change again.
 */
export function settle(task: LostTask, reply: string, target: string): LostTask {
  if (task.found) return { ...task, last: { outcome: "done", heard: "" }, askAbout: null };
  const table = onTable(task), read = readReply(reply);
  if (read.kind !== "description") return { ...task, last: { outcome: read.kind === "unknown" ? "unknown" : "unclear", heard: "" }, askAbout: askAbout(table) };
  const left = table.filter(x => matches(x, read.d));
  const shelf = task.items.filter(x => !task.checked.includes(x.id)), again = shelf.filter(x => matches(x, read.d));
  const keep = left.length ? left : again, heard = read.heard;
  if (!keep.length) return { ...task, last: { outcome: "none", heard }, askAbout: askAbout(table) };
  const out = task.items.filter(x => !keep.includes(x)).map(x => x.id);
  if (keep.length === 1) {
    if (keep[0].id === target) return { ...task, out, found: target, last: { outcome: "found", heard }, askAbout: null };
    const checked = [...task.checked, keep[0].id], back = task.items.filter(x => !checked.includes(x.id));
    return { ...task, out: checked, checked, last: { outcome: "not-yours", heard }, askAbout: askAbout(back) };
  }
  return { ...task, out, last: { outcome: !left.length ? "again" : left.length === table.length ? "same" : "narrowed", heard }, askAbout: askAbout(keep) };
}

// ---- the hidden half, in server memory only

const LOST_CAP = 100;
const g = globalThis as unknown as { __lingaLost?: Map<string, string> };
const targets = g.__lingaLost ??= new Map<string, string>();

/** A new task for a scene that has one: the shelf laid out, the learner's thing held here. `{}` for every other scene. */
export function lostStart(sceneId: string, conversationId: string, seed = Math.floor(Math.random() * 0x7fffffff)): { lost?: LostTask } {
  if (sceneId !== LOST_SCENE) return {};
  const shelf = shelfOf(seed);
  targets.set(conversationId, shelf.target);
  while (targets.size > LOST_CAP) targets.delete(targets.keys().next().value!);
  return { lost: publicTask(shelf.items) };
}

/**
 * The task after this reply: undefined for a conversation with no task, null when its hidden half was lost to a
 * restart (the task stands down and the scene goes on as a plain conversation).
 */
export function lostTurn(c: { id: string; lost?: LostTask | null }, reply: string): LostTask | null | undefined {
  if (!c.lost) return undefined;
  const target = targets.get(c.id);
  return target ? settle(c.lost, reply, target) : null;
}

/**
 * The learner's thing, for the phone to draw: the reply to the phone's own request, never part of the session. Null
 * when the conversation has no task or the task stood down.
 */
export function lostPicture(c: { id: string; lost?: LostTask | null }): LostThing | null {
  const item = c.lost && c.lost.items.find(x => x.id === targets.get(c.id));
  return item ? { kind: item.kind, colour: item.colour, size: item.size, pattern: item.pattern, place: item.place } : null;
}

// ---- what the partner may say

const PLACE_WORDS: Record<LostPlace, string> = { gym: "in the gym", playground: "on the playground", classroom: "in a classroom", canteen: "in the canteen" };
/** A thing as words, for the partner and the LT driver: "a big blue bottle with stars, found in the gym". */
export function describe(x: LostThing): string {
  return `a ${x.size} ${x.colour} ${x.kind}${x.pattern === "plain" ? "" : ` with ${x.pattern}`}, found ${PLACE_WORDS[x.place]}`;
}
const OUTCOME_WORDS: Record<LostOutcome, string> = {
  start: "The learner has not described anything yet.",
  narrowed: "Code put aside the things that do not match what the learner said.",
  same: "What the learner said fits everything still on the table.",
  again: "Nothing on the table fitted, so code looked at the whole shelf again with what the learner said.",
  none: "Nothing on the shelf is like that. The table is as it was.",
  unclear: "Code could not tell what the learner meant (unsure, two choices, or two things that cannot both be true). The table is as it was.",
  unknown: "The reply described nothing code could use. The table is as it was.",
  "not-yours": "One thing was left. You looked at the name label inside: it belongs to someone else. It is put away and the rest are back on the table.",
  found: "One thing was left and its name label says it is the learner's. It is found: hand it over.",
  done: "The learner's thing is already found.",
};
const ASK_WORDS: Record<LostDim, string> = { colour: "its colour", kind: "what kind of thing it is", size: "its size", pattern: "its pattern", place: "where it was lost" };
const LOST_RULE = "Code runs the lost-property table; you only say what it decided. Mention or hold up only things in onTheTable. Never guess which thing is the learner's, and never say it is found unless found is set. When askAbout is set, end with one short question about it.";

/** The public facts the partner is given, in the input JSON beside the scene: never which thing is the learner's. */
export function lostFacts(t: LostTask) {
  const found = t.found ? t.items.find(x => x.id === t.found) : undefined;
  return {
    rule: LOST_RULE,
    onTheTable: found ? [] : onTable(t).map(describe),
    putAside: t.items.filter(x => t.out.includes(x.id) && x.id !== t.found).map(describe),
    heard: t.last.heard || null,
    outcome: OUTCOME_WORDS[t.last.outcome],
    askAbout: t.askAbout ? ASK_WORDS[t.askAbout] : null,
    found: found ? describe(found) : null,
  };
}

/** The table in one line of words, for a reader who cannot see the screen (view.ts viewText). */
export function lostLine(t: LostTask): string {
  const found = t.found ? t.items.find(x => x.id === t.found) : undefined;
  if (found) return `Lost property: found and hung on the hook: ${describe(found)}.`;
  const aside = t.items.filter(x => t.out.includes(x.id));
  return `Lost property on the table: ${onTable(t).map(describe).join("; ")}.${aside.length ? ` Put aside, greyed: ${aside.map(describe).join("; ")}.` : ""}`;
}
