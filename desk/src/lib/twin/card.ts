/**
 * The twin's portrait and its Twin Card 1.0 export (v2 T2 portrait, T5 export pulled forward by the owner, 2026-10-07:
 * "guide how to run the TV app with twin"). Pure, except `sha256`.
 *
 * The twin here is the profile, not a writer: owner decisions E2 (a portable profile is the product), E5 (the twin
 * writes in-app only as proof, later) and S4 (email and chat first). From the learner's kept pieces (lib/session/texts):
 *   - channels by format: "email" pieces -> email, "message" pieces -> chat, anything else -> generic;
 *   - per channel, the style measured by code (rules/style styleSheet, twinDims), origin "learned";
 *   - exemplars: the latest version of the most recent pieces, verbatim, cut at a word boundary to 500 characters
 *     (the renderer's own limit, RENDERER.md), at most 5, only those the learner left included (the review step the
 *     spec asks producers for, SPEC 14);
 *   - quality rules as data, with the spec's per-person allowances: dashes allowed when the person's own exemplars use
 *     clause dashes; a filler opener the person's own exemplars start with is not on the list.
 * Born: a channel with at least TWIN_BORN pieces (E3: earned, three pieces). Integrity: SHA-256 over the RFC 8785
 * canonical form of each part (SPEC 9); every number in a part is an integer.
 */
import { createHash } from "node:crypto";
import { styleSheet, twinDims, type Dims } from "../rules/style";
import type { Piece } from "../session/texts";

export const TWIN_BORN = 3;
export const EXEMPLAR_MAX = 500;
export const EXEMPLARS_PER_CHANNEL = 5;
export type TwinChannel = "email" | "chat" | "generic";
export const channelOf = (format: string): TwinChannel => (format === "email" ? "email" : format === "message" ? "chat" : "generic");

export interface ChannelPortrait { channel: TwinChannel; pieces: number; born: boolean; dims: Dims | null; exemplars: { pieceId: string; text: string }[] }
export interface Portrait { channels: ChannelPortrait[]; born: boolean; pieces: number }

/** A text cut to `max` characters at a word boundary, marked with an ellipsis; unchanged when it fits. */
export function cutAt(text: string, max = EXEMPLAR_MAX): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max - 1), sp = head.lastIndexOf(" ");
  return `${(sp > max / 2 ? head.slice(0, sp) : head).trimEnd()}…`;
}

/** The portrait: per channel, how many pieces, born or not, the measured dims, and the exemplar candidates (newest first). */
export function portraitOf(pieces: Piece[], excluded: ReadonlySet<string> = new Set()): Portrait {
  const latest = (p: Piece) => p.versions[p.versions.length - 1];
  const by = new Map<TwinChannel, Piece[]>();
  for (const p of [...pieces].sort((a, b) => latest(b).at - latest(a).at)) { const c = channelOf(p.format); by.set(c, [...(by.get(c) ?? []), p]); }
  const channels: ChannelPortrait[] = (["chat", "email", "generic"] as TwinChannel[]).filter((c) => by.has(c)).map((c) => {
    const ps = by.get(c)!;
    return {
      channel: c, pieces: ps.length, born: ps.length >= TWIN_BORN,
      dims: ps.length ? twinDims(styleSheet(ps.map((p) => latest(p).text))) : null,
      exemplars: ps.filter((p) => !excluded.has(p.id)).slice(0, EXEMPLARS_PER_CHANNEL).map((p) => ({ pieceId: p.id, text: cutAt(latest(p).text) })),
    };
  });
  return { channels, born: channels.some((c) => c.born), pieces: pieces.length };
}

// ---- RFC 8785 (JSON Canonicalization Scheme) for the values a card holds: strings, integers, booleans, null, arrays, objects

/** Canonical JSON: object keys sorted by UTF-16 code units, no whitespace, strings as JSON.stringify writes them (RFC 8785 3.2.2.2), integers only. */
export function canonical(v: unknown): string {
  if (v === null || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "number") { if (!Number.isInteger(v)) throw new Error("a card part may hold integers only"); return JSON.stringify(v); }
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
  }
  throw new Error(`not JSON: ${typeof v}`);
}
export const sha256 = (s: string) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");

const AVOID = ["delve", "tapestry", "testament", "vibrant", "seamless", "leverage", "elevate", "unlock", "journey", "realm", "crucial", "navigate", "not just x, but y"];
const FILLERS = ["great", "awesome", "perfect", "love that", "nice", "got it", "thanks", "absolutely", "interesting", "cool", "okay"];
const LEVELS: Record<keyof Dims, string[]> = {
  formality: ["intimate", "casual", "consultative", "formal", "ceremonial"], warmth: ["detached", "neutral", "cordial", "warm", "affectionate"],
  humor: ["none", "dry", "light", "playful", "irreverent"], energy: ["matter-of-fact", "calm", "engaged", "upbeat", "exuberant"],
  length: ["one-liner", "brief", "medium", "full", "expansive"], directness: ["blunt", "direct", "balanced", "softened", "indirect"],
  expressiveness: ["none", "rare", "occasional", "frequent", "heavy (emoji, exclamations, slang)"], detail: ["headline", "key points", "explained", "thorough", "exhaustive and structured"],
};
/** The level words of a dims set, for a screen and for a prompt (SPEC 5.1 is normative for them). */
export const levelWords = (d: Dims) => (Object.keys(LEVELS) as (keyof Dims)[]).map((k) => ({ dim: k, level: d[k], word: LEVELS[k][d[k] - 1] }));

export interface CardInput {
  name: string; languages?: string[]; pieces: Piece[]; excluded?: ReadonlySet<string>;
  cardId: string; createdAt: string; exportedAt: string; generator?: { name: string; version: string };
}

/** A Twin Card 1.0 for the learner's twin, or null while no channel is born (the export is earned, E3). */
export function buildCard(input: CardInput): Record<string, unknown> | null {
  const portrait = portraitOf(input.pieces, input.excluded);
  const born = portrait.channels.filter((c) => c.born && c.dims);
  if (!born.length) return null;
  const allEx = born.flatMap((c) => c.exemplars.map((e) => e.text));
  const dash = allEx.some((t) => /\s[-–—]\s|\w—\w/.test(t)) ? "allow" : "avoid";
  const starts = new Set(allEx.map((t) => t.trim().toLowerCase()));
  const fillers = FILLERS.filter((f) => ![...starts].some((s) => s.startsWith(f)));
  const identity = { name: input.name, role: null, bio: null, languages: input.languages ?? ["en"] };
  const voice = {
    scale: "twin-card.style/1",
    default_channel: born.some((c) => c.channel === "generic") ? "generic" : born[0].channel,
    standing_directions: null,
    quality_rules: {
      profile: "studydesk.plain-voice/1",
      register: "Write the way this person writes to people they know: their sentence length, their openers, their level of formality. Say the thing and stop. No praise, no recap of what was just said, no grouping in threes for rhythm.",
      avoid_phrases: AVOID, filler_openers: fillers, dash_policy: dash,
    },
    channels: born.map((c) => ({
      channel: c.channel,
      style: { dims: c.dims, origin: { kind: "learned", preset_id: null } },
      directives: "",
      length_hint: null,
      constraints: [],
      exemplars: c.exemplars.map((e) => ({ text: e.text, source: "sample" })),
      provenance: { derived_by: "studydesk/style.ts", derived_at: input.exportedAt },
    })),
  };
  const evidence = {
    exemplars_per_channel: Object.fromEntries(born.map((c) => [c.channel, c.exemplars.length])),
    coverage_permille: { identity: null, voice: null, knowledge: null, training: null },
    readiness_percent: Math.min(100, Math.round((100 * Math.min(...born.map((c) => c.pieces))) / TWIN_BORN)),
    answers: 0, last_trained_at: null, renderer: "twin-card.render/1",
  };
  return {
    $schema: "https://personas.app/schemas/twin-card/1.0/twin-card.schema.json",
    spec: "twin-card", spec_version: "1.0", card_id: input.cardId,
    created_at: input.createdAt, exported_at: input.exportedAt,
    generator: input.generator ?? { name: "Study Desk", version: "0.2.0" },
    identity, voice, evidence,
    integrity: { alg: "sha256", canonicalization: "rfc8785", parts: { identity: sha256(canonical(identity)), voice: sha256(canonical(voice)), evidence: sha256(canonical(evidence)) } },
  };
}
