/**
 * The level check's ladder, and the shapes it leaves behind. Pure: safe on the TV, the phone and in tests.
 *
 * The tutor writes and judges each task; this file decides which band comes next and where the
 * learner stands. Same marks in, same band out.
 */
import { slipOf } from "./slip";
import { latched, REUSES_MAX, scheduled, yoursHolds } from "./review";
import { BANDS, type Audience, type Band, type EvidenceMode, type Placement, type PlacementRecord, type PlacementTask, type Plan, type PlanTopic, type SkillId, type TaskKind, type TaskVerdict, type Reuse, type Taught } from "./types";
import { audienceOf, topicText } from "./gate";

export const MAX_TASKS = 5;
export const ABOUT_QUESTIONS = 3;
export const PLAN_SIZE = 6;
export const PLAN_MAX = 8;
export const TAUGHT_CAP = 60;
/** A topic in the learner's own words. The first LT run refused five real requests at 160 characters. */
export const TOPIC_ASK_MAX = 400;
/** The level check's first question: the same for everyone, so it is written here, not generated — no wait, nothing to fail. */
export const firstQuestion = (name: string) => `Hi ${name}! You can answer in English or in your own language. Where do you use English in your life?`;

export const BAND_NAME: Record<Band, string> = { A1: "First words", A2: "Everyday basics", B1: "Getting by", B2: "Comfortable", C1: "Fluent", C2: "Near-native" };
/** What a learner at each band can do, in the learner's words. */
export const BAND_CAN: Record<Band, string> = {
  A1: "You understand and use familiar everyday words and very simple phrases.",
  A2: "You handle short, routine exchanges about familiar things.",
  B1: "You get by in most everyday situations and can give reasons and opinions.",
  B2: "You talk with some ease on a wide range of topics, including less familiar ones.",
  C1: "You express ideas fluently and flexibly, with little searching for words.",
  C2: "You understand almost everything and can express fine shades of meaning.",
};
/** How the tutor pitches its English at each band. Written for the model, never shown. */
export const BAND_TUTOR: Record<Band, string> = {
  A1: "A1: very common words, present simple, one short question at a time, concrete things the learner can see or does every day. Accept single words and gestures of meaning.",
  A2: "A2: short everyday sentences on familiar topics (family, school, shopping, free time), simple past and future with going to, one question at a time.",
  B1: "B1: connected everyday talk, reasons and opinions, past experiences and plans, some less common words made clear by context.",
  B2: "B2: natural pace, less familiar and some abstract topics, follow-up questions, comparisons and hypotheticals, a wider range of vocabulary.",
  C1: "C1: nuanced and idiomatic, implicit meaning, flexible register, complex structures used naturally.",
  C2: "C2: subtle shades of meaning, humour and irony, precise register, anything a well-read speaker would say.",
};

/**
 * What the English itself shows at each band: control and range, not ideas. Written for the judge, never shown.
 * The first scenario runs passed a fluent A2 at B2 because the argument was clear; these are why that stops.
 */
export const BAND_JUDGE: Record<Band, string> = {
  A1: "isolated words and memorised phrases; almost no sentence grammar of their own.",
  A2: "simple sentences that get meaning across, with systematic basic errors: verb forms and agreement ('films is', 'he go'), missing auxiliaries or articles ('I no practice', 'is good for learn'), double comparatives ('more better'). Length, fluency and good ideas do not lift English with these errors above A2.",
  B1: "connected sentences; basic grammar mostly controlled (present and past, auxiliaries, agreement, questions); errors appear in more complex structures; vocabulary enough for familiar topics, strained on abstract ones.",
  B2: "good control: no systematic basic errors, occasional slips that never blur meaning; complex sentences, comparisons and hypotheticals used correctly; range for opinions and less familiar topics.",
  C1: "consistently accurate; complex structures used flexibly; idiomatic, precise vocabulary; register adjusted to the situation.",
  C2: "near-flawless; subtle shades of meaning, precise idiom and register.",
};

export const isBand = (x: unknown): x is Band => BANDS.includes(x as Band);
export const shift = (band: Band, by: number): Band => BANDS[Math.min(BANDS.length - 1, Math.max(0, BANDS.indexOf(band) + by))];
export const easyBand = (band: Band) => BANDS.indexOf(band) <= 1;

/** One band below what the learner told us, so the first task is one they can meet. */
export function startBand(self: Band | null): Band { return self ? shift(self, -1) : "A2"; }

/** Choosing only where a spoken answer may not come; above B1 every task asks the learner to say something. */
export function kindFor(band: Band, before: Array<{ band: Band; kind: TaskKind }>): TaskKind {
  const i = BANDS.indexOf(band);
  const cycle: TaskKind[] = i <= 1 ? ["choose", "listen", "say"] : i === 2 ? ["listen", "say"] : ["say"];
  return cycle[before.filter(t => t.band === band).length % cycle.length];
}

/**
 * The judge says whether the task was done and which band the English shows; this decides pass, partial or fail.
 * Speaking: English at the task's band passes, one below is partial, lower fails. Listening: understanding decides,
 * but an answer without English, or a line read instead of heard above A2, is at most partial.
 */
export function verdictFor(task: { kind: TaskKind; band: Band; revealed?: boolean }, answered: "yes" | "partly" | "no", english: Band | "none"): TaskVerdict {
  if (answered === "no") return "fail";
  if (task.kind === "listen") {
    const capped = english === "none" || (task.revealed && BANDS.indexOf(task.band) > 1);
    return answered === "yes" && !capped ? "pass" : "partial";
  }
  if (english === "none") return "fail";
  const gap = BANDS.indexOf(task.band) - BANDS.indexOf(english);
  const verdict: TaskVerdict = gap <= 0 ? "pass" : gap === 1 ? "partial" : "fail";
  return answered === "partly" && verdict === "pass" ? "partial" : verdict;
}

/**
 * One plain line, written by code, for a task that did not pass: why the verdict is what it is. The judge's note is a
 * free sentence written without the verdict and often rates the ideas, so a "fail" could sit beside praise (LG-54).
 * Empty for a pass, a skip, a choice (its note says which reply fits) and a task stored before the judge's readings were kept.
 */
export function verdictReason(task: { kind: TaskKind; band: Band; verdict: TaskVerdict; answered?: "yes" | "partly" | "no"; english?: Band | "none"; skipped?: boolean }): string {
  const { kind, band, verdict, answered, english } = task;
  if (task.skipped || verdict === "pass" || kind === "choose" || !answered || !english) return "";
  if (answered === "no") return kind === "listen" ? "Linga did not find that you understood the line." : "The answer did not do what the task asked.";
  if (kind === "listen") {
    if (answered === "partly") return "You understood only part of the line.";
    return english === "none" ? "There was no English in this answer." : "You read the line instead of hearing it, so it counts as nearly there.";
  }
  if (english === "none") return "There was no English in this answer.";
  if (BANDS.indexOf(band) > BANDS.indexOf(english)) return `Your English read as ${english} here, and this task was ${band}.`;
  return answered === "partly" ? "The answer was only partly on the task." : "";
}

/**
 * What the ladder reads of one task. `kind` and `response` say how strong a pass is (a mark with no kind reads as a
 * say mark); `skipped` says the learner passed on it. A PlacementTask fits as it stands.
 */
export interface Mark { band: Band; verdict: TaskVerdict; kind?: TaskKind; response?: string; skipped?: boolean; }
/** A skip is no evidence: no count of passes, partials or fails includes it. */
const counted = (marks: Mark[]) => marks.filter(m => !m.skipped);
const count = (marks: Mark[], band: Band, verdict: TaskVerdict) => counted(marks).filter(m => m.band === band && m.verdict === verdict).length;
const wordsIn = (response: string | undefined) => (response ?? "").trim().split(/\s+/).filter(Boolean).length;
/**
 * A weak pass is a choice between two options, or a listening answer of one or two words; every other pass is strong, a
 * spoken one included. Two words, not one, since LG-48: Tomas (A1, age 9) named the monster with "Creeper! Boom.", and
 * that strong B1 pass placed him at B1. Naming the thing shows the line was heard, not that it was followed at that band.
 */
export const weakPass = (m: Mark) => !m.skipped && m.verdict === "pass" && (m.kind === "choose" || (m.kind === "listen" && wordsIn(m.response) <= 2));
const strongPasses = (marks: Mark[], band: Band) => counted(marks).filter(m => m.band === band && m.verdict === "pass" && !weakPass(m)).length;

/** What a confidence rests on; restsLine words each. */
export type Rests = "scattered" | "partials" | "weak" | "skips" | "floor" | "unchecked" | "thin" | "few" | "read" | "lean" | "firm";
/**
 * Strong passes at the placed band that a HIGH confidence needs (with a real fail or partial above, or C2). Two were
 * enough until the 2026-10-14 LT recerts: of the eight placements stored as high across recert-1 and recert-3, six were
 * one band above the true band (Adela B2->C1, Jana C1->C2 twice, Petra A2->B1, Klara A2->B1, Oksana B1->B2), and all eight
 * rested on exactly two strong passes. A third strong pass at the band is the cheapest extra proof the
 * five-task check can ask for.
 */
export const HIGH_STRONG_PASSES = 3;
/** Strong passes at a band below which its evidence is thin: the ladder may then place the learner one band lower. */
export const THIN_STRONG_PASSES = 2;

/**
 * Pass goes up a band, fail goes down, partial stays, a skip goes down (the learner is not asked something harder).
 * A weak pass climbs one band at most and never into a say task by itself. The check stops at five tasks, at two
 * failures on A1 (a skip is not one), at two partials on one band, or once a band holds two passes with two failures
 * above it (or C2 holds two passes). The band is the highest one with more passes than failures; with none, one below
 * the lowest band tried, or the band of two partials. Confidence is high only with two strong passes at the band and
 * a real fail or partial above it (or C2); a band resting on weak passes or skips alone reads low.
 *
 * When the answers disagree (a pass above a lower real fail), a band more than one above the lowest failed band holds
 * only on a strong pass there (LG-48). The ladder cannot tell a lucky pass from an unlucky fail, and every near miss of
 * the 2026-10-14 LT run was one band high, so on disagreement it reads low: Tomas (A1, age 9) failed an A1 choice,
 * then passed an A2 choice and a two-word B1 listen, and was placed B1; he is now A2, still low. A strong say pass
 * above a misclicked 50/50 still holds its band, which is why this is not a flat cap at one band above the fail. The
 * two-word weak pass is the other half: without it "Creeper! Boom." is strong and B1 still holds. Replayed on the ten
 * stored recert-1 placements, no other band or confidence moves.
 *
 * `read` is the band the about-questions read the learner at (check.ts selfBand), or null when there is none. Confidence
 * is never high when the ladder band differs from it (the talk and the tasks disagree), nor when fewer than
 * HIGH_STRONG_PASSES strong passes hold the band. It caps at medium, or low when the band also has fewer than two
 * strong passes.
 *
 * Lean down, never up: when the evidence for the top band is thin (fewer than THIN_STRONG_PASSES strong passes at it,
 * which two partials or a band of weak passes and skips always are) or the read is lower than the band, and the band
 * just below holds a strong pass of its own, the learner is placed at that lower band. A lower band with no strong pass
 * is not evidence, so Ondrej (B1, read A2, A2 held by a choice only) stays at B1. Every miss of the recerts was high, none
 * low: Adela, Jana (twice) and Lukas (twice) land on their true band, Oksana moves a band nearer. Leaned confidence
 * is medium, low when the top band was thin.
 *
 * The A2/B1 boundary leans on less. A2 is mostly held by a choice, a weak pass, so the strong-pass lean never fires
 * there, and every stored A2 learner was placed B1. When the read is below B1, a pass of any kind at A2 is enough: B1
 * leans to A2, low, if B1 is held by its own passes (not by two partials) and something above it was failed or partly
 * done. Replayed on all 23 stored placements (17 recert, six out of sample): exact 14 -> 19, none moved farther, below
 * its true band or to high. Sofie (A2), Klara (A2, three times) and Petra (A2, recert-1), all read A2, land on A2.
 * Ondrej (B1, read A2: an A2 choice, then two partials at B1, nothing above) stays B1, and so does out-of-sample Petra
 * (A2, read B1), whose marks are his shape; Hana (B1, read B1) stays B1. A say partial at B1 alone does not lean: a B1
 * learner read at B1 with two strong B1 listens and a B1 say partial (the S2 check) keeps B1.
 */
export function staircase(start: Band, marks: Mark[], read: Band | null = null): { done: boolean; next: Band; band: Band; confidence: Placement["confidence"]; rests: Rests } {
  const last = marks.at(-1), real = counted(marks);
  let next = last ? shift(last.band, last.skipped || last.verdict === "fail" ? -1 : last.verdict === "pass" ? 1 : 0) : start;
  if (last && weakPass(last) && next !== last.band && kindFor(next, marks as Array<{ band: Band; kind: TaskKind }>) === "say") next = last.band;
  const bracketed = BANDS.some((b, i) => count(marks, b, "pass") >= 2 && (i === BANDS.length - 1 || count(marks, BANDS[i + 1], "fail") >= 2));
  const floored = count(marks, "A1", "fail") >= 2;
  const partialBand = [...BANDS].reverse().find(b => count(marks, b, "partial") >= 2);
  const done = marks.length >= MAX_TASKS || bracketed || floored || !!partialBand;
  // a pass above a failure means the answers disagree with each other
  const scattered = real.some(a => a.verdict === "pass" && real.some(b => b.verdict === "fail" && BANDS.indexOf(b.band) < BANDS.indexOf(a.band)));
  const failedAt = Math.min(...real.filter(m => m.verdict === "fail").map(m => BANDS.indexOf(m.band)));
  const held = BANDS.filter((b, i) => count(marks, b, "pass") > count(marks, b, "fail") && (!scattered || i <= failedAt + 1 || strongPasses(marks, b) > 0));
  const lowest = marks.length ? BANDS[Math.min(...marks.map(m => BANDS.indexOf(m.band)))] : start;
  const top = held.length ? held[held.length - 1] : null;
  const band = partialBand && (!top || BANDS.indexOf(top) < BANDS.indexOf(partialBand)) ? partialBand : top ?? shift(lowest, -1);
  const strong = strongPasses(marks, band);
  const ceiling = band === "C2" || real.some(m => m.verdict !== "pass" && BANDS.indexOf(m.band) > BANDS.indexOf(band));
  let rests: Rests;
  const lowerHeld = band !== "A1" && strongPasses(marks, shift(band, -1)) >= 1;
  const thin = strong < THIN_STRONG_PASSES;
  if (lowerHeld && (thin || (read && BANDS.indexOf(read) < BANDS.indexOf(band)))) {
    return { done, next, band: shift(band, -1), confidence: thin ? "low" : "medium", rests: "lean" };
  }
  if (band === "B1" && band === top && ceiling && count(marks, "A2", "pass") >= 1 && read && BANDS.indexOf(read) < BANDS.indexOf("B1")) {
    return { done, next, band: "A2", confidence: "low", rests: "lean" };
  }
  if (scattered) rests = "scattered";
  else if (partialBand) rests = "partials";
  else if (strong === 0) rests = floored ? "floor" : real.some(m => m.band === band && weakPass(m)) ? "weak" : "skips";
  else if (read && read !== band) rests = "read";
  else if (strong >= HIGH_STRONG_PASSES && ceiling) rests = "firm";
  else if (strong >= 2) rests = ceiling ? "few" : "unchecked";
  else rests = "thin";
  const confidence = rests === "scattered" || rests === "partials" || rests === "weak" || rests === "skips" || (rests === "read" && strong < 2) ? "low" : rests === "firm" ? "high" : "medium";
  return { done, next, band, confidence, rests };
}

/**
 * The band the learner's own English was judged at when they spoke (S2): the HIGHEST band the judge read in the
 * English of a say task they answered (answered "yes" or "partly", not skipped, English a band, not "none").
 * Listening and choosing show understanding, not production, so they never count; a say task answered in another
 * language or off-task gives no band either. null when no say task counts: a shy or choose-only learner has no
 * spoken band, and nothing follows from one. The highest, not the median or the lowest, on purpose: a learner is
 * never pitched below the best English they produced. A say answer typed on the phone counts as the say task it is.
 * Pure; a task stored before the judge's band was kept has no `english`, and counts for nothing.
 */
export function spokenBand(tasks: Array<Pick<PlacementTask, "band" | "kind" | "skipped" | "answered" | "english">>): Band | null {
  const said = spokenTasks(tasks);
  return said.length ? BANDS[Math.max(...said.map(t => BANDS.indexOf(t.english as Band)))] : null;
}
/** The say tasks spokenBand reads: answered, not skipped, with a band for their English. */
export const spokenTasks = <T extends Pick<PlacementTask, "kind" | "skipped" | "answered" | "english">>(tasks: T[]) =>
  tasks.filter(t => t.kind === "say" && !t.skipped && (t.answered === "yes" || t.answered === "partly") && isBand(t.english));

/**
 * The band conversations start at after a placement (S2). The placement's own band, unless a level check found the
 * learner's spoken English lower: then the spoken band, never more than one band below the placement. It lowers only
 * when the learner was asked to speak at the placed band or above and spoke below it (a say task that counts for
 * spokenBand, set at that band or higher), since an easier say task cannot show the higher band. The placement's band
 * and the staircase are never changed by it; a band the learner picked by hand (source "self") is kept as picked.
 */
export function conversationBand(p: Pick<Placement, "band" | "source" | "tasks">): Band {
  if (p.source !== "check") return p.band;
  const spoke = spokenBand(p.tasks), at = BANDS.indexOf(p.band);
  if (!spoke || BANDS.indexOf(spoke) >= at || !spokenTasks(p.tasks).some(t => BANDS.indexOf(t.band) >= at)) return p.band;
  return BANDS[Math.max(BANDS.indexOf(spoke), at - 1)];
}
/** A level in Set up that is one of the placement's bands (its own, or the band conversations start at) keeps the placement as it is. */
export const isPlacementBand = (p: Pick<Placement, "band" | "source" | "tasks">, level: Band) => level === p.band || level === conversationBand(p);
/**
 * The band a plan is pitched at: the learner's level preference when it is one of the placement's bands, else the
 * band conversations start at. (A level picked in Set up that is neither already made the placement the learner's own
 * pick, conversation.ts, so this falls back only for a preference older than the placement.) No placement: the preference.
 */
export function playBand(p: Pick<Placement, "band" | "source" | "tasks"> | null | undefined, level: Band): Band {
  return !p ? level : isPlacementBand(p, level) ? level : conversationBand(p);
}

/**
 * The verdict screen's one line on what a not-high read rests on (PC5): plain words, at most sixteen, no number but a
 * band name. High keeps its own line. Pure: the tasks decide, so a placement stored under older rules reads from
 * what it holds.
 */
export const CONFIDENCE_HIGH = "Your answers agreed with each other.";
export function restsLine(confidence: Placement["confidence"], tasks: Mark[], read: Band | null = null): string {
  if (confidence === "high") return CONFIDENCE_HIGH;
  const ladder = staircase("A2", tasks, read), skipped = tasks.some(t => t.skipped);
  switch (ladder.rests) {
    case "scattered": return "Your answers disagreed with each other, so this is a careful guess.";
    case "partials": return "Some answers only partly showed this level.";
    case "weak": {
      const atBand = tasks.filter(m => m.band === ladder.band && weakPass(m)), choices = atBand.some(m => m.kind === "choose"), words = atBand.some(m => m.kind === "listen");
      const short = atBand.some(m => m.kind === "listen" && wordsIn(m.response) > 1) ? "very short answers" : "one-word answers";
      const what = choices && words ? `answers chosen from two options and ${short}` : choices ? "answers chosen from two options" : short;
      return `This level rests on ${what}${skipped ? " and skipped tasks" : ""}.`;
    }
    case "skips": return "Some tasks were skipped, so this level is a careful guess.";
    case "floor": return "The tasks were too hard, so this is the lowest level.";
    case "unchecked": return skipped ? "A skipped task left the next level up unchecked." : "No task at the next level up was answered.";
    case "read": return "What you said at the start pointed elsewhere, so this is a careful guess.";
    case "lean": return "Linga placed you one level lower than your answers alone, to be safe.";
    case "few": return "Only a few strong answers showed this level, so it may be a little off.";
    case "thin": return "Only one strong answer showed this level, so it may be a little off.";
    default: return "Linga is not sure of this level, so try the check again another day.";
  }
}

// ---- what survives a trip to disk ----
const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const text = (v: unknown, max: number) => typeof v === "string" && v.length <= max;
const SKILLS: SkillId[] = ["contact", "repair", "request", "describe", "narrate", "negotiate", "relate", "resolve"];
const KINDS: TaskKind[] = ["say", "listen", "choose"];
const VERDICTS: TaskVerdict[] = ["pass", "partial", "fail"];
const MODES: EvidenceMode[] = ["speech", "text", "choice"];
const ANSWERS = ["yes", "partly", "no"] as const;

function cleanTask(value: unknown): PlacementTask | null {
  const t = obj(value);
  if (!text(t.id, 100) || !isBand(t.band) || !KINDS.includes(t.kind as TaskKind) || !VERDICTS.includes(t.verdict as TaskVerdict) || !MODES.includes(t.mode as EvidenceMode)) return null;
  if (!text(t.prompt, 400) || !text(t.line, 400) || !text(t.response, 1200) || !text(t.quote, 400) || !text(t.note, 400) || typeof t.at !== "number") return null;
  const options = Array.isArray(t.options) ? t.options.filter((o): o is string => text(o, 200)).slice(0, 2) : [];
  // the judge's readings (S2) are optional: absent on older tasks; a malformed one is dropped, the task kept
  const answered = ANSWERS.includes(t.answered as typeof ANSWERS[number]) ? t.answered as typeof ANSWERS[number] : undefined;
  const english = t.english === "none" || isBand(t.english) ? t.english as Band | "none" : undefined;
  return { id: t.id as string, band: t.band, kind: t.kind as TaskKind, prompt: t.prompt as string, line: t.line as string, options, response: t.response as string, mode: t.mode as EvidenceMode, verdict: t.verdict as TaskVerdict, quote: t.quote as string, note: t.note as string, at: t.at, ...(t.skipped === true ? { skipped: true } : {}), ...(answered ? { answered } : {}), ...(english ? { english } : {}) };
}
export function cleanPlacement(value: unknown): Placement | null {
  const p = obj(value);
  if (!isBand(p.band) || typeof p.at !== "number" || !["low", "medium", "high"].includes(String(p.confidence)) || !["check", "self"].includes(String(p.source))) return null;
  if (!text(p.summary, 400) || !text(p.focus, 400)) return null;
  const tasks = Array.isArray(p.tasks) ? p.tasks.map(cleanTask).filter((t): t is PlacementTask => !!t).slice(0, MAX_TASKS) : [];
  return { at: p.at, band: p.band, selfBand: isBand(p.selfBand) ? p.selfBand : null, confidence: p.confidence as Placement["confidence"], source: p.source as Placement["source"], summary: p.summary as string, focus: p.focus as string, tasks };
}
/**
 * The record of level checks (Family W10). The live `placement` is still overwritten by each check (the screens and
 * prompts read it); every check that completes, and every band picked by hand, is ALSO appended here as a small
 * snapshot: date, band, confidence, source and the check's one-sentence read. No task, no answer. Append-only: a
 * re-check never removes an earlier snapshot; past the cap the oldest drops.
 */
export const PLACEMENTS_CAP = 12;
export const SUMMARY_MAX = 160;
export function placementRecord(p: Pick<Placement, "at" | "band" | "confidence" | "source" | "summary">): PlacementRecord {
  const summary = p.source === "check" ? p.summary.trim().slice(0, SUMMARY_MAX) : "";
  return { at: p.at, band: p.band, confidence: p.confidence, source: p.source, ...(summary ? { summary } : {}) };
}
export function appendPlacement(list: PlacementRecord[] | undefined, p: Pick<Placement, "at" | "band" | "confidence" | "source" | "summary">): PlacementRecord[] {
  return [...(list ?? []), placementRecord(p)].slice(-PLACEMENTS_CAP);
}
/**
 * The record as it survives a trip to disk: a band from BANDS, a confidence and a source from their closed lists, a
 * date that is a finite number (clamped at 0), a summary that is a string (trimmed and cut); anything else drops the
 * entry. A learner file written before W10 has no record and loads with an empty one. Its current `placement`, even a
 * check's, is NOT back-filled as a history entry: the record starts with the first check that completes after W10,
 * so no snapshot is ever made up from a later overwrite.
 */
export function cleanPlacements(value: unknown): PlacementRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => {
    const p = obj(v);
    if (!isBand(p.band) || typeof p.at !== "number" || !Number.isFinite(p.at) || !["low", "medium", "high"].includes(String(p.confidence)) || !["check", "self"].includes(String(p.source))) return [];
    if (p.summary !== undefined && typeof p.summary !== "string") return [];
    const summary = p.source === "check" && typeof p.summary === "string" ? p.summary.trim().slice(0, SUMMARY_MAX) : "";
    return [{ at: Math.max(0, p.at), band: p.band, confidence: p.confidence as Placement["confidence"], source: p.source as Placement["source"], ...(summary ? { summary } : {}) }];
  }).slice(-PLACEMENTS_CAP);
}
export function cleanTopic(value: unknown): PlanTopic | null {
  const t = obj(value), q = obj(t.quiz);
  if (!text(t.id, 100) || !SKILLS.includes(t.skill as SkillId) || !["all", "school", "older", "adult"].includes(String(t.audience))) return null;
  for (const [key, max] of [["title", 70], ["goal", 160], ["why", 160], ["partner", 60], ["premise", 600], ["cue", 160]] as const) if (!text(t[key], max) || !(t[key] as string).trim()) return null;
  if (!text(q.question, 160) || !Array.isArray(q.options) || q.options.length !== 2 || !q.options.every(o => text(o, 160)) || ![0, 1].includes(q.correct as number)) return null;
  // The model's audience is a claim; the topic's own words can raise it, and the never-list refuses it (gate.ts).
  // Here, so a fresh proposal and a plan already stored on disk pass the same gate.
  const audience = audienceOf(topicText(t as Parameters<typeof topicText>[0]), t.audience as Audience);
  if (!audience) return null;
  return { id: t.id as string, title: t.title as string, goal: t.goal as string, why: t.why as string, skill: t.skill as SkillId, audience, partner: t.partner as string, premise: t.premise as string, cue: t.cue as string, quiz: { question: q.question as string, options: [q.options[0] as string, q.options[1] as string], correct: q.correct as number } };
}
/**
 * Does a plan carry the learner's interest? The phone promises "conversations picked for your level and
 * interests"; a plan that only served the goal once had 0 of 6 topics in "travelling and cooking".
 *
 * A word check, simple on purpose: the interest's content words ("travelling and cooking" -> travel, cook)
 * against the words of a topic's title and premise, both cut to a rough stem (travelling = traveller =
 * travels = travel, cooking = cooked = cook, games = gaming). `why` does not count: a line saying "you like
 * cooking" over a meeting scene is not a cooking topic. Limits, known: no synonyms or related words (a trip to
 * Rome is not "travelling", a recipe is not "cooking"), no compounds (cookbook), English words only, and a
 * scene that names the interest in passing counts. The model is told to name the interest, so the rule
 * and the prompt meet on the same words.
 */
const INTEREST_STOP = new Set("a an the and or of in on at to for with about into from my me our their his her its it i we you they is are be being like likes love loves enjoy enjoys enjoying really very much lots lot also too all any some kind kinds sort sorts other others things thing stuff new good fun free time hobby hobbies interest interests interested especially etc english learn learning practise practice talk talking speak speaking people".split(" "));
export function stemWord(word: string): string {
  let w = word.toLowerCase();
  if (w.endsWith("ies") && w.length > 4) w = w.slice(0, -3) + "i";
  else for (const suffix of ["ings", "ing", "ers", "er", "es", "ed", "s"]) {
    if (!w.endsWith(suffix) || w.length - suffix.length < 3 || (suffix === "s" && w.endsWith("ss"))) continue;
    w = w.slice(0, -suffix.length); break;
  }
  if (w.length > 3 && w.endsWith("e")) w = w.slice(0, -1);
  if (w.endsWith("y")) w = w.slice(0, -1) + "i";
  if (w.length > 3 && w.at(-1) === w.at(-2) && !"aeiou".includes(w.at(-1)!)) w = w.slice(0, -1);
  return w;
}
const words = (text: string) => text.toLowerCase().split(/[^a-z]+/).filter(w => w.length >= 3 && !INTEREST_STOP.has(w));
/** The interest's content words as stems; empty when no interest is known, and then nothing is required. */
export function interestWords(interest: string): string[] { return [...new Set(words(interest).map(stemWord))]; }
export function touchesInterest(topic: Pick<PlanTopic, "title" | "premise">, stems: string[]): boolean {
  if (!stems.length) return false;
  const own = new Set(words(`${topic.title} ${topic.premise}`).map(stemWord));
  return stems.some(s => own.has(s));
}
export function cleanPlan(value: unknown): Plan | null {
  const p = obj(value);
  if (!isBand(p.band) || typeof p.at !== "number" || !Array.isArray(p.topics)) return null;
  const topics = p.topics.map(cleanTopic).filter((t): t is PlanTopic => !!t).slice(0, PLAN_MAX);
  return topics.length ? { at: p.at, band: p.band, topics } : null;
}
export function cleanTaught(value: unknown): Taught[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => {
    const m = obj(v);
    if (!["fix", "word"].includes(String(m.kind)) || !text(m.id, 200) || !text(m.said, 240) || !text(m.better, 240) || !text(m.why, 240) || !text(m.turnId, 200) || !text(m.sceneId, 100) || !text(m.title, 100) || typeof m.at !== "number") return [];
    // The review fields (review.ts) are optional; one that is present and malformed drops the item, as any other field would.
    if (m.offered !== undefined && !(Number.isInteger(m.offered) && (m.offered as number) >= 0)) return [];
    if (m.reusedAt !== undefined && !(typeof m.reusedAt === "number" && Number.isFinite(m.reusedAt))) return [];
    if (m.reusedIn !== undefined && !text(m.reusedIn, 200) || m.reusedQuote !== undefined && !text(m.reusedQuote, 240)) return [];
    if (m.slips !== undefined && !(Number.isInteger(m.slips) && (m.slips as number) >= 0)) return [];
    if (m.slipAt !== undefined && !(typeof m.slipAt === "number" && Number.isFinite(m.slipAt))) return [];
    // the schedule (K3): a date, a count, and a history whose every entry is well formed, or the item drops
    for (const k of ["nextDueAt", "offeredAt"]) if (m[k] !== undefined && !(typeof m[k] === "number" && Number.isFinite(m[k]))) return [];
    if (m.misses !== undefined && !(Number.isInteger(m.misses) && (m.misses as number) >= 0)) return [];
    // a hidden line's item (K4): its source from the closed list, its key words short; only a line may have no `said`
    if (m.line !== undefined && !["check", "offer", "quiz"].includes(String(m.line)) || m.key !== undefined && !(text(m.key, 80) && (m.key as string).trim()) || m.said === "" && m.line === undefined) return [];
    if (m.reuses !== undefined && !(Array.isArray(m.reuses) && m.reuses.every(x => { const r = obj(x); return typeof r.at === "number" && Number.isFinite(r.at) && typeof r.conversationId === "string" && r.conversationId.length <= 200 && text(r.quote, 240) && (r.sceneId === undefined || text(r.sceneId, 100)); }))) return [];
    const reuseOf = (x: unknown) => { const r = obj(x); return { at: r.at as number, conversationId: r.conversationId as string, quote: r.quote as string, ...(r.sceneId !== undefined ? { sceneId: r.sceneId as string } : {}) }; };
    const reuses = Array.isArray(m.reuses) ? m.reuses.map(reuseOf).slice(-REUSES_MAX) : undefined;
    // L1, the latch "yours": two well-formed uses and a date, or the item drops; one that does not hold the rule (review.ts
    // yoursHolds) is not trusted and is worked out again from the history, as an item saved before L1 gets one
    const y = obj(m.yours), yUses = Array.isArray(y.uses) ? y.uses : [];
    if (m.yours !== undefined && !(typeof y.at === "number" && Number.isFinite(y.at) && yUses.length === 2 && yUses.every(x => { const r = obj(x); return typeof r.at === "number" && Number.isFinite(r.at) && typeof r.conversationId === "string" && r.conversationId.length <= 200 && text(r.quote, 240) && (r.sceneId === undefined || text(r.sceneId, 100)); }))) return [];
    const yours = m.yours !== undefined ? { at: y.at as number, uses: [reuseOf(yUses[0]), reuseOf(yUses[1])] as [Reuse, Reuse] } : undefined;
    // a fix's self-repair (K2, repair.ts): whether a try held before the fix was shown, and the try
    if (m.selfRepaired !== undefined && typeof m.selfRepaired !== "boolean" || m.tried !== undefined && !text(m.tried, 240)) return [];
    const review = { ...(m.offered !== undefined && { offered: m.offered as number }), ...(m.reusedAt !== undefined && { reusedAt: m.reusedAt as number }), ...(m.reusedIn !== undefined && { reusedIn: m.reusedIn as string }), ...(m.reusedQuote !== undefined && { reusedQuote: m.reusedQuote as string }), ...(m.slips !== undefined && { slips: m.slips as number }), ...(m.slipAt !== undefined && { slipAt: m.slipAt as number }),
      ...(m.nextDueAt !== undefined && { nextDueAt: m.nextDueAt as number }), ...(m.misses !== undefined && { misses: m.misses as number }), ...(m.offeredAt !== undefined && { offeredAt: m.offeredAt as number }), ...(reuses && { reuses }), ...(m.line !== undefined && { line: m.line as Taught["line"] }), ...(m.key !== undefined && { key: m.key as string }), ...(m.selfRepaired !== undefined && { selfRepaired: m.selfRepaired as boolean }), ...(m.tried !== undefined && { tried: m.tried as string }) };
    // a fix's slip keys (K1, slip.ts) are code's, never stored trust: worked out again from its words on every load, so a record saved before them gets them
    const keys = m.kind === "fix" ? slipOf(m.said as string, m.better as string) : null;
    // an item saved before the schedule gets one from its older review fields (review.ts scheduled)
    const item = scheduled({ id: m.id as string, kind: m.kind as Taught["kind"], said: m.said as string, better: m.better as string, why: m.why as string, turnId: m.turnId as string, sceneId: m.sceneId as string, title: m.title as string, at: m.at, ...(keys ?? {}), ...review });
    return [latched(yours && yoursHolds(item, yours) ? { ...item, yours } : item)];
  }).slice(-TAUGHT_CAP);
}
