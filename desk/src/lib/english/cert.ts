/**
 * Linga certification (Family W10): a dry plate, issued by code from the evidence. Pure: safe on the TV, the phone
 * and in tests.
 *
 * The owner's words: "Having dry certifications as reward system would sound great. Then the topic choice would adjust
 * the certification requirements." So a certificate names a band, and it is issued only when:
 *   1. the LATEST entry of the record of checks (`placements`) is a level check (source "check", never a band picked by
 *      hand) with medium or high confidence; that entry's band is the band certified;
 *   2. every required skill is at least "on your own" (rules.ts evidenceProgress, typed evidence counting per D4), where
 *      required = the band's base skills (BASE_SKILLS) plus the skill of every topic the learner agreed in their plan;
 *   3. every required skill has at least one of the learner's own words to show: the quote of an unsupported,
 *      successful, spoken or typed piece of evidence for that skill, checked again here (quoteOk);
 *   4. no certificate already stands for that band with that same set of required skills.
 * The model writes nothing here. It never issues and never words a certificate: a stored quote is the learner's own
 * text, held to be a substring of their reply when it was stored (rules.ts validateObservations) and again here when
 * the reply is still at hand.
 *
 * A certificate is a snapshot: it keeps the band, the topic titles, and per skill the mode and one quote, so it
 * survives the evidence cap (400). It is append-only and latched: never edited, never removed by a later check or a
 * lower band, and it never decays. Past CERT_CAP the oldest drops, as every record here is capped.
 * Nothing on it is a count, a score, a percent or a streak, and it carries no digit a screen would print except the
 * band's own (a date is kept as a number and printed as a month word on the plate).
 */
import type { Profile } from "../session/store";
import { ENGLISH_SKILLS, PROGRESS_ORDER, recommendScene } from "./curriculum";
import { BAND_NAME, isBand } from "./placement";
import { COUNTING_MODES, evidenceProgress } from "./rules";
import { type Band, type Certificate, type CertSkill, type EnglishEvidence, type EnglishLearning, type EnglishScene, type SkillId } from "./types";

/**
 * The skills a learner at each band shows on their own to hold that band's certificate. AUTHORED, from the CEFR
 * can-do line the desk already shows for the band (placement.ts BAND_CAN) and the eight skill goals (curriculum.ts
 * ENGLISH_SKILLS). Each band keeps the one below and adds what its can-do line newly asks. A TEACHER MUST READ THIS
 * TABLE before it is promised to anyone (Family Phase 1: nobody has yet).
 */
export const BASE_SKILLS: Record<Band, SkillId[]> = {
  // A1 "You understand and use familiar everyday words and very simple phrases.": greet and take a turn (contact),
  //    ask someone to repeat (repair), ask for a thing (request)
  A1: ["contact", "repair", "request"],
  // A2 "You handle short, routine exchanges about familiar things.": talk about your interests and say why (describe)
  A2: ["contact", "repair", "request", "describe"],
  // B1 "You get by in most everyday situations and can give reasons and opinions.": tell what happened, with an action
  //    and its result (narrate); suggest options and agree a plan (negotiate)
  B1: ["contact", "repair", "request", "describe", "narrate", "negotiate"],
  // B2 "You talk with some ease on a wide range of topics, including less familiar ones.": follow up, disagree
  //    respectfully, decline (relate)
  B2: ["contact", "repair", "request", "describe", "narrate", "negotiate", "relate"],
  // C1 "You express ideas fluently and flexibly, with little searching for words.": name an impact, set a boundary,
  //    agree next steps (resolve); every skill from here
  C1: ["contact", "repair", "request", "describe", "narrate", "negotiate", "relate", "resolve"],
  // C2 "You understand almost everything and can express fine shades of meaning.": nothing new to show, every skill
  C2: ["contact", "repair", "request", "describe", "narrate", "negotiate", "relate", "resolve"],
};

export const CERT_CAP = 12;
/** the ids of certificates already opened; bounded by the certificates they point at */
export const SEEN_CAP = 24;
export const QUOTE_MAX = 240;
/** a plan topic's title as cleanTopic keeps it */
export const TITLE_MAX = 70;
/** a plan holds at most eight topics (placement.ts PLAN_MAX); the plate names at most six */
export const TOPICS_KEPT = 8, PLATE_TOPICS = 6;
const SKILL_IDS = ENGLISH_SKILLS.map(s => s.id);
const order = (skills: Iterable<SkillId>) => { const set = new Set(skills); return SKILL_IDS.filter(id => set.has(id)); };

/** The band a certificate may name now: the latest entry of the record, when it is a check with medium or high confidence. */
export function certBand(l: EnglishLearning): Band | null {
  const last = (l.placements ?? []).at(-1);
  return last && last.source === "check" && (last.confidence === "medium" || last.confidence === "high") && isBand(last.band) ? last.band : null;
}

/**
 * What must be shown: the band's base skills, widened by the skill of every topic the learner agreed in their plan
 * (a swapped-in or own-words topic counts by its skill, like any other). Never more than the eight skills.
 * With no band given, the band a certificate may name now; with none, the base of the latest band in the record.
 */
export function requirementFor(l: EnglishLearning, band: Band | null = certBand(l)): SkillId[] {
  const b = band ?? (l.placements ?? []).at(-1)?.band ?? l.placement?.band ?? null;
  if (!b || !isBand(b)) return [];
  return order([...BASE_SKILLS[b], ...(l.plan?.topics ?? []).map(t => t.skill).filter(s => SKILL_IDS.includes(s))]);
}

/**
 * The learner's own words, checked again at issue time: a trimmed, non-empty line of at most QUOTE_MAX characters with
 * a letter in it and no control character, and, when the reply it came from is at hand (`words`, the finishing
 * conversation's replies by turn id), a substring of that reply exactly as sent. A quote from an earlier conversation
 * was held to that rule when it was stored (validateObservations); its reply is no longer kept, so it cannot be held
 * to it twice.
 */
export function quoteOk(e: Pick<EnglishEvidence, "quote" | "turnId">, words: Record<string, string> = {}): boolean {
  const q = e.quote;
  if (typeof q !== "string" || !q.trim() || q.length > QUOTE_MAX || !/\p{L}/u.test(q) || /[\u0000-\u001f\u007f]/.test(q)) return false;
  const reply = words[e.turnId];
  return reply === undefined || reply.includes(q);
}
const hasDigit = (text: string) => /\d/.test(text);

/** Latched progress: the higher of what the record holds and what the evidence shows now. Nothing decays. */
function progressOf(l: EnglishLearning, skill: SkillId) {
  const held = l.achievements?.[skill] ?? "not-tried", now = evidenceProgress(l.evidence ?? [], skill);
  return PROGRESS_ORDER[Math.max(PROGRESS_ORDER.indexOf(held), PROGRESS_ORDER.indexOf(now))];
}
/**
 * The one quote a skill shows: the most recent of the learner's own replies that counts on its own (unsupported,
 * successful, spoken or typed) with a quote that holds; one without a digit first, so the plate carries no digit
 * but the band's.
 */
function evidenceFor(l: EnglishLearning, skill: SkillId, words: Record<string, string>): EnglishEvidence | null {
  const own = (l.evidence ?? []).filter(e => e.skill === skill && e.success && !e.supported && COUNTING_MODES.includes(e.mode) && quoteOk(e, words)).sort((a, b) => b.at - a.at);
  return own.find(e => !hasDigit(e.quote)) ?? own[0] ?? null;
}
const sameSet = (a: SkillId[], b: SkillId[]) => a.length === b.length && order(a).every((x, i) => x === order(b)[i]);

/** A new certificate when one is earned now, else null. Pure: the same record, time and replies give the same answer. */
export function issue(l: EnglishLearning, now: number, words: Record<string, string> = {}): Certificate | null {
  const band = certBand(l), check = (l.placements ?? []).at(-1);
  if (!band || !check) return null;
  const required = requirementFor(l, band);
  if (!required.length) return null;
  if ((l.certificates ?? []).some(c => c.band === band && sameSet(c.skills.map(s => s.skill), required))) return null;
  const skills: CertSkill[] = [];
  for (const skill of required) {
    const p = progressOf(l, skill);
    if (p !== "independent" && p !== "transfer") return null;
    const e = evidenceFor(l, skill, words);
    if (!e) return null;
    skills.push({ skill, mode: e.mode === "speech" ? "spoken" : "written", quote: e.quote.trim(), at: e.at });
  }
  const topics = (l.plan?.topics ?? []).map(t => t.title.trim().slice(0, TITLE_MAX)).filter(Boolean).slice(0, TOPICS_KEPT);
  return { id: `cert-${band}-${now.toString(36)}`, at: now, band, topics, skills, checkAt: check.at };
}
/** The record with a certificate appended when one is earned now; the same record, untouched, when not. */
export function withCertificate(l: EnglishLearning, now: number, words: Record<string, string> = {}): { learning: EnglishLearning; cert: Certificate | null } {
  const cert = issue(l, now, words);
  return cert ? { learning: { ...l, certificates: [...(l.certificates ?? []), cert].slice(-CERT_CAP) }, cert } : { learning: l, cert: null };
}

// ---- what a certificate still needs (linga-B): derived at read time, stored nowhere
/** Why no certificate can be issued on this record: a band picked by hand, a check read with low confidence, or no check at all. */
export type CertBlocker = "self" | "low" | "no-check";
export interface CertGap {
  /** the band the record names now (the latest entry's), null with no record of a check */
  band: Band | null;
  blocker: CertBlocker | null;
  /** required skills already shown on the learner's own, in the order of the eight */
  shown: SkillId[];
  /** required skills still to show; empty when a blocker stands or the certificate for this band and requirement is already held */
  open: SkillId[];
}
/**
 * What the certificate still needs, from the record, the plan and the evidence: the same rules issue() holds a
 * certificate to, read without issuing. A blocker leaves nothing to fill (the learner cannot earn a slot toward a
 * certificate that cannot be issued), a held certificate leaves nothing open. A skill counts as shown only when issue()
 * could take its quote, so a shown skill is never one the plate could not print.
 */
export function certGap(l: EnglishLearning): CertGap {
  const last = (l.placements ?? []).at(-1), band = last && isBand(last.band) ? last.band : null;
  if (!last) return { band, blocker: "no-check", shown: [], open: [] };
  if (last.source !== "check") return { band, blocker: "self", shown: [], open: [] };
  if (!certBand(l)) return { band, blocker: "low", shown: [], open: [] };
  const required = requirementFor(l, band);
  if ((l.certificates ?? []).some(c => c.band === band && sameSet(c.skills.map(s => s.skill), required))) return { band, blocker: null, shown: required, open: [] };
  const shown = required.filter(skill => { const p = progressOf(l, skill); return (p === "independent" || p === "transfer") && !!evidenceFor(l, skill, {}); });
  return { band, blocker: null, shown, open: required.filter(s => !shown.includes(s)) };
}
/** The shown skills of a gap, named, with how each was shown (the mode of the evidence the plate would print). */
export function shownSkills(l: EnglishLearning, gap: CertGap = certGap(l)): Array<{ skill: SkillId; name: string; mode: CertSkill["mode"] }> {
  return gap.shown.flatMap(skill => { const e = evidenceFor(l, skill, {}); return e ? [{ skill, name: skillName(skill), mode: e.mode === "speech" ? "spoken" as const : "written" as const }] : []; });
}
/**
 * The next scene with the certificate in mind: curriculum.ts recommendScene, given the skills the certificate still
 * needs. It lives here because cert.ts reads curriculum.ts and a call back would be a cycle. Every caller that picks
 * the learner's next scene (home, the phone, the print page, a start with no scene named) asks this one.
 */
export function recommendFor(p: Profile | undefined, l: EnglishLearning): EnglishScene { return recommendScene(p, l, certGap(l).open); }

/** The newest certificate not yet opened, if any: home offers it once, as its first door. */
export function unseenCertificate(l: EnglishLearning): Certificate | null {
  const last = (l.certificates ?? []).at(-1);
  return last && !(l.seenIds ?? []).includes(last.id) ? last : null;
}
/** Opening a certificate marks it seen in a list of its own: the certificate itself is never edited. */
export function markSeen(l: EnglishLearning, id: string): EnglishLearning {
  const seen = l.seenIds ?? [];
  return seen.includes(id) ? l : { ...l, seenIds: [...seen, id].slice(-SEEN_CAP) };
}

// ---- what survives a trip to disk
const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
function cleanSkill(value: unknown): CertSkill | null {
  const s = obj(value);
  if (!SKILL_IDS.includes(s.skill as SkillId) || !["spoken", "written"].includes(String(s.mode)) || typeof s.quote !== "string" || !finite(s.at)) return null;
  const quote = s.quote.trim().slice(0, QUOTE_MAX);
  return quote && /\p{L}/u.test(quote) && !/[\u0000-\u001f\u007f]/.test(quote) ? { skill: s.skill as SkillId, mode: s.mode as CertSkill["mode"], quote, at: Math.max(0, s.at) } : null;
}
/**
 * A strict whitelist: an id, a band from BANDS, finite dates (clamped at 0), topic titles trimmed and cut, skills from
 * the eight with a mode from the closed list and a quote trimmed and cut, one entry per skill. A certificate with no
 * valid skill, or any other malformed field, is dropped whole; unknown fields never survive. A learner file written
 * before W10 has none and loads with an empty list.
 */
export function cleanCertificates(value: unknown): Certificate[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap(v => {
    const c = obj(v);
    if (typeof c.id !== "string" || !c.id.trim() || c.id.length > 100 || ids.has(c.id) || !isBand(c.band) || !finite(c.at) || !finite(c.checkAt) || !Array.isArray(c.topics) || !Array.isArray(c.skills)) return [];
    if (!c.topics.every(t => typeof t === "string")) return [];
    const topics = (c.topics as string[]).map(t => t.trim().slice(0, TITLE_MAX)).filter(Boolean).slice(0, TOPICS_KEPT);
    const skills = c.skills.map(cleanSkill);
    if (!skills.length || skills.some(s => !s)) return [];
    const kept = (skills as CertSkill[]).filter((s, i, all) => all.findIndex(x => x.skill === s.skill) === i);
    ids.add(c.id);
    return [{ id: c.id, at: Math.max(0, c.at), band: c.band, topics, skills: order(kept.map(s => s.skill)).map(id => kept.find(s => s.skill === id)!), checkAt: Math.max(0, c.checkAt) }];
  }).slice(-CERT_CAP);
}
/** Seen ids: strings pointing at a certificate that is still kept. */
export function cleanSeen(value: unknown, certificates: Certificate[]): string[] {
  if (!Array.isArray(value)) return [];
  const kept = new Set(certificates.map(c => c.id));
  return [...new Set(value.filter((x): x is string => typeof x === "string" && kept.has(x)))].slice(-SEEN_CAP);
}

// ---- the plate, in words: the TV plate (view.ts) and the phone's My map read the same lines
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** The month a certificate was issued in, as a word: the plate carries no digit but the band's. */
export const monthOf = (at: number) => MONTHS[new Date(at).getMonth()];
/** A date in words for the list of certificates, where two in one month must be told apart: "12 October". */
export const dayMonth = (at: number) => `${new Date(at).getDate()} ${monthOf(at)}`;
const skillName = (id: SkillId) => ENGLISH_SKILLS.find(s => s.id === id)?.name ?? id;

export interface Plate {
  title: string; band: Band;
  /** the topics the learner chose, as they titled them, at most six */
  topics: string[];
  skills: Array<{ skill: SkillId; name: string; mode: CertSkill["mode"] }>;
  /** one of the learner's own lines: the most recent without a digit, under the skill it shows */
  quote: { skill: SkillId; name: string; text: string } | null;
  issued: string;
  /** how the skills were shown: "said and wrote", "said" or "wrote" */
  how: string;
  /** the one sentence for the caption slot */
  caption: string;
}
export function plateOf(c: Certificate): Plate {
  const spoken = c.skills.some(s => s.mode === "spoken"), written = c.skills.some(s => s.mode === "written");
  const how = spoken && written ? "said and wrote" : spoken ? "said" : "wrote";
  const q = [...c.skills].filter(s => !hasDigit(s.quote)).sort((a, b) => b.at - a.at)[0] ?? null;
  return {
    title: `${c.band} ${BAND_NAME[c.band]}`, band: c.band,
    topics: c.topics.slice(0, PLATE_TOPICS),
    skills: c.skills.map(s => ({ skill: s.skill, name: skillName(s.skill), mode: s.mode })),
    quote: q ? { skill: q.skill, name: skillName(q.skill), text: q.quote } : null,
    issued: `Issued in ${monthOf(c.at)}`, how,
    caption: `Issued from what you ${how}, not from an exam.`,
  };
}
/** The certificate as the phone's My map says it: band, topics, skills with spoken or written, the one quote. No count. */
export function certWords(c: Certificate): string[] {
  const p = plateOf(c);
  return [
    `Certificate · ${p.title}`,
    `${p.issued} by Linga, from what you ${p.how}, not from an exam.`,
    ...(p.topics.length ? [`Your topics: ${p.topics.join(", ")}.`] : []),
    `Shown on your own: ${p.skills.map(s => `${s.name} (${s.mode})`).join(", ")}.`,
    ...(p.quote ? [`In your own words, ${p.quote.name}: “${p.quote.text}”`] : []),
  ];
}
