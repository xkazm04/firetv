/**
 * Essay forensics — the parts that are rules, done before any model is asked.
 *
 * Sentence splitting, length, connectors and a first-pass role guess are all deterministic. The
 * model is asked afterwards to *comment* on a text whose sentences are already numbered and
 * measured, and to return verdicts anchored to sentence numbers — so a highlight can only land on
 * a sentence that exists.
 */
export type Role = "claim" | "evidence" | "link" | "context";
/** `para` (0-based) is set only when the text has more than one paragraph; a one-paragraph text reads as it always did. */
export interface Sentence { n: number; text: string; words: number; connectors: string[]; role: Role; para?: number; }

const CONNECTORS = /\b(because|therefore|however|although|which means|so that|as a result|for example|for instance|but|since|whereas|in contrast|this suggests|which suggests)\b/gi;
const EVIDENCE = /\b(\d+%?|per cent|percent|research|study|studies|report(ed|s)?|found|data|measured|according to|for example|for instance)\b/i;
const LINK = /^(therefore|so|this (means|shows|suggests)|as a result|in conclusion|which is why)/i;

/** Short forms whose full stop does not end a sentence, even when a capital follows. */
const ABBREVIATION = /\b(?:Dr|Mr|Mrs|Ms|Prof|St|etc|eg|ie|e\.g|i\.e|vs)\.$/i;

/**
 * A sentence ends at . ! or ? — optionally inside a closing quote or bracket — followed by a
 * capital or an opening quote. A piece that ends on an abbreviation is joined back to the next,
 * because a wrong split renumbers every sentence after it and every highlight is drawn on those numbers.
 */
export function splitSentences(text: string): Sentence[] {
  // Paragraphs first (paragraphsOf: a blank line ends one), so a sentence never runs across a paragraph break.
  // Numbering runs on through the piece, so a highlight still lands by number alone.
  const paras = paragraphsOf(text);
  if (paras.length <= 1) return splitParagraph(text, 0);
  const out: Sentence[] = [];
  paras.forEach((p, para) => { for (const sn of splitParagraph(p, out.length)) out.push({ ...sn, para }); });
  return out;
}
function splitParagraph(text: string, before: number): Sentence[] {
  const pieces = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?]["'”’)\]]?)\s+(?=[A-Z"“])/).filter(Boolean);
  const parts: string[] = [];
  for (const p of pieces) {
    if (parts.length && ABBREVIATION.test(parts[parts.length - 1])) parts[parts.length - 1] += " " + p;
    else parts.push(p);
  }
  return parts.map((t, i) => {
    const connectors = (t.match(CONNECTORS) || []).map((c) => c.toLowerCase());
    const role: Role = LINK.test(t) ? "link" : EVIDENCE.test(t) ? "evidence" : "claim";
    return { n: before + i + 1, text: t, words: t.split(/\s+/).length, connectors, role };
  });
}

/** The text of a set of sentences: one space inside a paragraph, a blank line between paragraphs. */
export function joinSentences(sentences: Pick<Sentence, "text" | "para">[]): string {
  return sentences.map((s, i) => (i === 0 ? "" : s.para !== sentences[i - 1].para ? "\n\n" : " ") + s.text).join("");
}

/** How many paragraphs a reading holds: 1 unless the sentences carry `para`. */
export const paragraphCount = (sentences: Pick<Sentence, "para">[]) => new Set(sentences.map((s) => s.para ?? 0)).size || 1;

/** The numbered lines a reading prompt shows the model; a "Paragraph k" line opens each paragraph of a longer piece. */
export function numberedLines(sentences: Sentence[]): string {
  const many = paragraphCount(sentences) > 1;
  return sentences.map((s, i) => (many && (i === 0 || s.para !== sentences[i - 1].para) ? `${i ? "\n" : ""}Paragraph ${(s.para ?? 0) + 1}:\n` : "") +
    `${s.n}. ${s.text}  [${s.words} words, first-pass role: ${s.role}]`).join("\n");
}

// ---- text in: files and messages, one paragraph at a time ----

/**
 * The paragraphs of a text the learner sent (a .txt or .md file, or a message typed or dictated on the phone),
 * in order. The desk reads ONE paragraph at a time; this only says where one ends and the next begins. The rule is
 * deliberately plain: a blank line (any run of two or more line breaks, CRLF included, a line of only spaces counts
 * as blank) ends a paragraph; the line breaks inside one become single spaces; empties are dropped. A markdown
 * heading line (starts with 1-6 # and a space) is its own item, so a title never fuses with the first paragraph
 * under it; the learner steps past it with Next. Nothing cleverer than that is tried. No blank line means one
 * paragraph, and that one reads exactly as it did before this existed. Never throws; a non-string gives [].
 */
export function paragraphsOf(text: unknown): string[] {
  if (typeof text !== "string") return [];
  const out: string[] = [];
  let cur: string[] = [];
  const flush = () => { if (cur.length) { out.push(cur.join(" ")); cur = []; } };
  for (const raw of text.replace(/\r\n?|\u2028|\u2029/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) flush();
    else if (/^#{1,6}\s+\S/.test(line)) { flush(); out.push(line); }
    else cur.push(line);
  }
  flush();
  return out;
}

/**
 * Two limits on what the phone may send. Neither is measured: they are set conservatively (a file of a few pages
 * is well under 100 KB of plain text; 4000 characters is about 650 words, far past any one paragraph a learner of
 * 11-13 writes) and are to be revisited after live use.
 */
export const ESSAY_FILE_MAX_BYTES = 100 * 1024;
export const ESSAY_PARAGRAPH_MAX_CHARS = 4000;

/** The plain sentence for a paragraph over the cap, or null when it fits. Never truncates: the learner splits it. */
export function essayTooLong(text: unknown): string | null {
  if (typeof text !== "string" || text.length <= ESSAY_PARAGRAPH_MAX_CHARS) return null;
  return `That paragraph is too long to read in one go. Split it in two and send one part at a time (up to ${ESSAY_PARAGRAPH_MAX_CHARS} characters).`;
}

/**
 * A whole piece (v2 E1) is read one call per paragraph, so its size is a count of calls. 30 paragraphs is a long
 * school essay several times over; the cap is not measured (as the caps above) and is to be revisited after use.
 */
export const PIECE_PARAGRAPHS_MAX = 30;
export const PIECE_MAX_CHARS = 100 * 1024;

/** Why a whole piece cannot be read in one go, or null. Each paragraph must fit the paragraph cap; never truncates. */
export function pieceProblem(text: unknown): string | null {
  if (typeof text !== "string" || !text.trim()) return "There is nothing to read. Write or send a piece first.";
  if (text.length > PIECE_MAX_CHARS) return `That piece is too long to read in one go. Keep it under ${PIECE_MAX_CHARS / 1024} KB.`;
  const ps = paragraphsOf(text);
  if (ps.length > PIECE_PARAGRAPHS_MAX) return `That is ${ps.length} paragraphs. The desk reads up to ${PIECE_PARAGRAPHS_MAX} at a time: send it in parts.`;
  const long = ps.findIndex((p) => essayTooLong(p) !== null);
  if (long >= 0) return `Paragraph ${long + 1} is too long to read in one go. Split it in two (up to ${ESSAY_PARAGRAPH_MAX_CHARS} characters each).`;
  return null;
}

/**
 * Whether a file the learner picked can be read as text, checked in the browser before anything is read into the
 * panel (nothing is uploaded or kept). Call it with the file's name, type and size, then again with the text once
 * it is read: a binary file that was renamed .txt shows itself in the text (a NUL, or a run of replacement marks).
 * Returns the desk's plain sentence for the problem, or null when the file is fine. Never throws.
 */
export function essayFileProblem(f: { name?: unknown; type?: unknown; size?: unknown }, text?: string): string | null {
  const name = typeof f?.name === "string" ? f.name.toLowerCase() : "";
  const type = typeof f?.type === "string" ? f.type.toLowerCase() : "";
  const size = typeof f?.size === "number" && Number.isFinite(f.size) ? f.size : -1;
  // a phone often cannot name the type of a .md file (empty, or a generic binary type), so those pass on the name
  const typeOk = type === "" || type.startsWith("text/") || type === "application/octet-stream";
  if (!/\.(txt|md)$/.test(name) || !typeOk) return "The desk reads .txt and .md files. Pick one of those, or type the paragraph here.";
  if (size === 0) return "That file is empty. Pick one with some writing in it.";
  if (size < 0 || size > ESSAY_FILE_MAX_BYTES) return `That file is too big. Keep it under ${ESSAY_FILE_MAX_BYTES / 1024} KB, or send a few paragraphs at a time.`;
  if (text !== undefined) {
    if (text.includes("\u0000") || (text.match(/\uFFFD/g) ?? []).length > 3) return "That does not look like plain text. Save it as a .txt or .md file and pick it again.";
    if (!text.trim()) return "That file is empty. Pick one with some writing in it.";
  }
  return null;
}

export function paragraphStats(sentences: Sentence[]) {
  const words = sentences.reduce((a, s) => a + s.words, 0);
  return {
    sentences: sentences.length, words,
    avgWords: sentences.length ? Math.round((words / sentences.length) * 10) / 10 : 0,
    claims: sentences.filter((s) => s.role === "claim").length,
    evidence: sentences.filter((s) => s.role === "evidence").length,
    links: sentences.filter((s) => s.role === "link").length,
    connectors: sentences.reduce((a, s) => a + s.connectors.length, 0),
  };
}

export const ANALYSIS_TYPES = [
  { id: "structure", name: "Structure", promise: "Which sentence does which job — claim, evidence, link — and what is missing.", lens: "Judge each sentence by its role in the paragraph: is there a claim, is it followed by evidence, is there a link back to the argument?" },
  { id: "argument", name: "Argument", promise: "Does the paragraph take a side, and does every sentence push the same way?", lens: "Judge whether the paragraph argues one thing consistently, and where a sentence weakens, contradicts or wanders from the claim." },
  { id: "evidence", name: "Evidence", promise: "What here is a fact a reader can check, and what is only an opinion.", lens: "Judge each sentence on whether it gives checkable support - a number, a mechanism, an example - or only asserts." },
  { id: "language", name: "Language", promise: "Sentence length, rhythm, connectors, repeated words.", lens: "Judge the writing itself: monotonous sentence length, missing connectors, repetition, vague words like 'bad' or 'important'." },
] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number]["id"];

/**
 * How to rephrase a faulty sentence: the move (a technique, named in 2-6 words) and the pattern (a
 * sentence frame whose content is left as [slots]). Teaching, not ghostwriting - so a "pattern" with no
 * slot, one that is mostly literal words, or one that copies the learner's own sentence is refused.
 */
export interface Fix { move: string; pattern: string; }
const SLOT = /\[[^[\]]{1,60}\]/g;
export const FIX_LIMITS = { moveWords: [2, 6], moveChars: 48, patternChars: 160, literalWords: 10, copiedRun: 4 } as const;
const wordsOf = (t: string) => t.toLowerCase().match(/[a-z0-9']+/g) ?? [];

/** The model's `fix`, cleaned, or undefined when it is not a move and a slotted pattern. Never throws. */
export function cleanFix(raw: unknown, sentence = ""): Fix | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const { move, pattern } = raw as Record<string, unknown>;
  if (typeof move !== "string" || typeof pattern !== "string") return undefined;
  const m = move.replace(/\s+/g, " ").trim(), p = pattern.replace(/\s+/g, " ").trim();
  const n = m.split(" ").filter(Boolean).length;
  if (n < FIX_LIMITS.moveWords[0] || n > FIX_LIMITS.moveWords[1] || m.length > FIX_LIMITS.moveChars || /[[\]]/.test(m)) return undefined;
  if (p.length > FIX_LIMITS.patternChars || !(p.match(SLOT) ?? []).length) return undefined;
  // brackets only as whole slots; the words around the slots are a frame, not a sentence
  const literal = p.replace(SLOT, " ");
  if (/[[\]]/.test(literal)) return undefined;
  const lit = wordsOf(literal);
  if (lit.length > FIX_LIMITS.literalWords) return undefined;
  // a run of the learner's own words in the frame is their sentence rewritten around a slot
  const own = wordsOf(sentence), k = FIX_LIMITS.copiedRun;
  if (own.length >= k) {
    const runs = new Set(own.slice(0, own.length - k + 1).map((_, i) => own.slice(i, i + k).join(" ")));
    for (let i = 0; i + k <= lit.length; i++) if (runs.has(lit.slice(i, i + k).join(" "))) return undefined;
  }
  return { move: m, pattern: p };
}

// ---- the verdicts: the model observes, code rules ----

/** A sentence over this many words is faulty on the Language lens. Counted by code, never asked of the model. */
export const LONG_SENTENCE_WORDS = 35;
/** The connectors that turn a sentence back on what it conceded: the only words that make an Argument turn real. */
const CONTRAST = new Set(["but", "however", "although", "whereas", "in contrast"]);

/** What the model reports about one sentence, per lens. Nothing here is a verdict. */
export const JOBS = ["claim", "evidence", "link", "context", "none"] as const;
export const SIDES = ["pushes", "against", "wanders", "neutral"] as const;
export const SUPPORTS = ["checkable", "opinion", "context"] as const;
export const ISSUE_KINDS = ["vague", "repeated"] as const;
type Obs = Record<string, unknown>;

const oneOf = <T extends string>(set: readonly T[], v: unknown): v is T => typeof v === "string" && (set as readonly string[]).includes(v);
const wordIn = (word: string, sentence: string) => {
  const w = word.trim().toLowerCase();
  return !!w && (sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [] as string[]).includes(w);
};
const validIssues = (o: Obs, text: string) =>
  (Array.isArray(o.issues) ? o.issues : []).filter((i): i is { kind: string; word: string } =>
    !!i && typeof i === "object" && oneOf(ISSUE_KINDS, (i as Obs).kind) && typeof (i as Obs).word === "string" && wordIn((i as Obs).word as string, text));

/** Whether an observation carries this lens's field with a value it knows. A rewrite with none is a failed run, never a verdict. */
export function observationOk(lens: string, o: unknown): boolean {
  if (!o || typeof o !== "object") return false;
  const x = o as Obs;
  switch (lens) {
    case "argument": return oneOf(SIDES, x.side);
    case "evidence": return oneOf(SUPPORTS, x.support);
    case "language": return Array.isArray(x.issues);
    default: return oneOf(JOBS, x.job);
  }
}

/** The line a faulty sentence gets when the model's note is empty: the check that failed, in its own words. */
const CHECKS = {
  unsupported: "This claim has no evidence after it that a reader can check.",
  floating: "This links back to nothing: no evidence comes before it.",
  noTurn: "It takes the other side but never turns back: a turn needs a word like 'but' or 'although'.",
  wanders: "This sentence wanders from the side the paragraph takes.",
  opinion: "This only asserts; nothing here is checkable.",
  long: (words: number) => `This sentence runs to ${words} words; split it.`,
  word: (word: string) => `'${word}' is doing too little here; say what you mean.`,
};

/**
 * The verdicts of a reading, decided here from the model's observations (one per sentence, by number) and the text.
 * The model never says strong or faulty. Only sentences in `judged` get a verdict; an observation for any other
 * number is ignored as a verdict, but still reads as context (a rewrite passes the other sentences' first-pass roles).
 * A sentence gets an entry when it was observed (an observation the lens cannot read is neutral) or when code alone
 * rules it faulty (a Language sentence over LONG_SENTENCE_WORDS). The note is the model's; a faulty sentence with no
 * note gets the failed check's own line. A fix rides only on a faulty sentence, through cleanFix.
 *  structure: a claim with an observed evidence sentence (carrying an EVIDENCE marker) after it, before the next
 *    claim, is strong; the FIRST claim without is faulty, later ones neutral. Evidence with a marker is strong; a link
 *    with such evidence before it is strong, with none it is faulty.
 *  argument: pushes strong, wanders faulty, neutral neutral; against is a turn only when turnsBack is true AND the
 *    sentence holds a contrast connector, then strong, else faulty.
 *  evidence: checkable is strong only with an EVIDENCE marker or a number, else neutral; opinion is faulty unless a
 *    checkable sentence follows it.
 *  language: a vague or repeated word that is really in the sentence is faulty, and so is length over the limit.
 */
export function decideVerdicts(lens: string, sentences: Sentence[], judged: Set<number>, observations: unknown): VerdictLike[] {
  const by = new Map<number, Obs>();
  for (const o of Array.isArray(observations) ? observations : []) {
    const n = (o as Obs | null)?.n;
    if (o && typeof o === "object" && typeof n === "number" && sentences.some((s) => s.n === n) && !by.has(n)) by.set(n, o as Obs);
  }
  const ok = (n: number) => (observationOk(lens, by.get(n)) ? by.get(n)! : null);
  const marked = (s: Sentence) => EVIDENCE.test(s.text);
  const out: VerdictLike[] = [];
  let unsupportedSeen = false;
  sentences.forEach((s, at) => {
    if (!judged.has(s.n)) return;
    const o = by.get(s.n), read = ok(s.n);
    let verdict: VerdictLike["verdict"] = "neutral", check = "";
    if (read) {
      if (lens === "argument") {
        if (read.side === "pushes") verdict = "strong";
        else if (read.side === "wanders") { verdict = "faulty"; check = CHECKS.wanders; }
        else if (read.side === "against") {
          if (read.turnsBack === true && s.connectors.some((c) => CONTRAST.has(c))) verdict = "strong";
          else { verdict = "faulty"; check = CHECKS.noTurn; }
        }
      } else if (lens === "evidence") {
        if (read.support === "checkable") verdict = marked(s) ? "strong" : "neutral";
        else if (read.support === "opinion") {
          const backed = sentences.slice(at + 1).some((t) => ok(t.n)?.support === "checkable" && marked(t));
          if (!backed) { verdict = "faulty"; check = CHECKS.opinion; }
        }
      } else if (lens === "language") {
        const bad = validIssues(read, s.text)[0];
        if (bad) { verdict = "faulty"; check = CHECKS.word(bad.word); }
      } else if (read.job === "claim") {
        const rest = sentences.slice(at + 1), stop = rest.findIndex((t) => ok(t.n)?.job === "claim");
        const supported = (stop < 0 ? rest : rest.slice(0, stop)).some((t) => ok(t.n)?.job === "evidence" && marked(t));
        if (supported) verdict = "strong";
        else if (!unsupportedSeen) { verdict = "faulty"; check = CHECKS.unsupported; unsupportedSeen = true; }
      } else if (read.job === "evidence") verdict = marked(s) ? "strong" : "neutral";
      else if (read.job === "link") {
        if (sentences.slice(0, at).some((t) => ok(t.n)?.job === "evidence" && marked(t))) verdict = "strong";
        else { verdict = "faulty"; check = CHECKS.floating; }
      }
    }
    if (lens === "language" && verdict !== "faulty" && s.words > LONG_SENTENCE_WORDS) { verdict = "faulty"; check = CHECKS.long(s.words); }
    if (!o && verdict === "neutral") return;
    const said = typeof o?.note === "string" ? o.note : "";
    const note = verdict === "faulty" && !said.trim() ? check : said;
    const fix = verdict === "faulty" ? cleanFix(o?.fix, s.text) : undefined;
    out.push({ n: s.n, verdict, note, ...(fix ? { fix } : {}) });
  });
  return out;
}

/** The other sentences of a paragraph as the first pass saw them, for a rewrite to be judged against (rules, not a model). */
export function contextObservations(lens: string, sentences: Sentence[], except: number): Obs[] {
  if (lens !== "structure" && lens !== "evidence") return [];
  return sentences.filter((s) => s.n !== except).flatMap((s): Obs[] =>
    lens === "structure" ? [{ n: s.n, job: s.role }] : s.role === "evidence" ? [{ n: s.n, support: "checkable" }] : []);
}

// ---- rewriting one sentence in place ----

/** A reading as the desk holds it (session/store EssayAnalysis), in the shape these rules need. */
export interface VerdictLike { n: number; verdict: "strong" | "faulty" | "neutral"; note: string; fix?: Fix; was?: Was; }
/** The sentence a rewrite replaced, as the paragraph was first read: its text, its verdict and the fix it was taught. */
export interface Was { text: string; verdict: VerdictLike["verdict"]; fix?: Fix; }
export interface ReadingLike { text: string; type: string; sentences: Sentence[]; stats: Record<string, number>; verdicts: VerdictLike[]; summary: string; provider?: string; }

const norm = (t: string) => t.replace(/\s+/g, " ").trim();

/**
 * Sentence `n` of a reading, rewritten by the learner: one sentence in, one out. The new sentence is split,
 * measured and given its first-pass role by the same rule as a paragraph; the numbering stands, the stats are
 * recounted and the text is rebuilt from the sentences. No verdict is decided here. Refused, in the desk's words
 * and before any model is asked: no such sentence, a blank one, two sentences, the same sentence again (up to
 * case and spacing), and one that would not stay one sentence where it stands in the paragraph.
 */
export function revise<R extends ReadingLike>(reading: R, n: number, text: string): { ok: true; reading: R } | { ok: false; error: string } {
  const at = Number.isInteger(n) ? reading.sentences.findIndex((s) => s.n === n) : -1;
  if (at < 0) return { ok: false, error: Number.isInteger(n) ? `The paragraph on the desk has no sentence ${n}.` : "Say which sentence: its number on the TV." };
  const t = norm(typeof text === "string" ? text : "");
  if (!t) return { ok: false, error: `Write sentence ${n} first, then send it.` };
  const one = splitSentences(t);
  if (one.length !== 1) return { ok: false, error: `That is ${one.length} sentences. Send sentence ${n} as one sentence.` };
  if (t.toLowerCase() === norm(reading.sentences[at].text).toLowerCase()) return { ok: false, error: `That is sentence ${n} as it was. Change it, then send it.` };
  const sentences = reading.sentences.map((s, i) => (i === at ? { ...one[0], n: s.n, ...(s.para !== undefined ? { para: s.para } : {}) } : s));
  const rebuilt = joinSentences(sentences);
  const again = splitSentences(rebuilt);
  if (again.length !== sentences.length || again.some((s, i) => s.text !== sentences[i].text || s.para !== sentences[i].para))
    return { ok: false, error: `In the paragraph that would not stay one sentence. Start it with a capital and end it with a full stop.` };
  return { ok: true, reading: { ...reading, text: rebuilt, sentences, stats: paragraphStats(sentences) } };
}

/** Where a sentence stands after a rewrite: none yet, a rewrite that holds (no longer faulty), or one still faulty. */
export type RewriteState = "none" | "holds" | "still";
export function rewriteState(v: Pick<VerdictLike, "verdict" | "was"> | undefined): RewriteState {
  if (!v?.was) return "none";
  return v.verdict === "faulty" ? "still" : "holds";
}

/**
 * The move a sentence's page teaches: a faulty verdict's own fix, else the lens's playbook move (given); for a
 * rewrite that holds, the move that was taught before it (the one the ink now claims). Null where nothing is taught.
 */
export function taught(v: Pick<VerdictLike, "verdict" | "fix" | "was"> | undefined, playbook: Fix): { fix: Fix; own: boolean } | null {
  const from = v?.verdict === "faulty" ? v.fix : rewriteState(v) === "holds" && v?.was?.verdict === "faulty" ? v.was.fix : null;
  if (from === null) return null;
  const own = cleanFix(from);
  return own ? { fix: own, own: true } : { fix: playbook, own: false };
}

// ---- the plan: a paragraph written from its pattern, one sentence per slot ----

/** One slot of a pattern: its label (the words in the [brackets], as the playbook shows them) and the job its sentence does. */
export interface PlanSlot { label: string; role: Exclude<Role, "context">; }
/** A plan as the desk holds it: the lens it will be read through, and one sentence per slot ("" until written). */
export interface Plan { lens: string; slots: string[]; }

/**
 * The slots of a playbook pattern, in the pattern's order, with the role each one plays. The role is read from the
 * frame words in front of the slot by the same first-pass rule as a sentence's (LINK, then EVIDENCE, else a claim),
 * so a pattern with its slots reordered gives the new order and nothing here is listed by hand.
 */
export function planSlots(play: { pattern: string }): PlanSlot[] {
  const out: PlanSlot[] = [];
  for (const piece of play.pattern.split(/(?<=[.!?])\s+/)) {
    const label = piece.match(/\[([^[\]]+)\]/)?.[1];
    if (!label) continue;
    const frame = piece.replace(/\[[^[\]]+\]/g, " ").trim();
    out.push({ label, role: LINK.test(frame) ? "link" : EVIDENCE.test(frame) ? "evidence" : "claim" });
  }
  return out;
}

/**
 * The learner's sentence for slot `i`, checked by the rules of a one-sentence rewrite (revise): refused, in the desk's
 * words, when blank, over the paragraph cap, still holding a [bracket], more than one sentence, or not a sentence on
 * its own (a capital to begin, a full stop to end), which the joined text needs to split back into its slots. The plan
 * passed in is never changed; an accepted sentence is stored as written, spaces normalised.
 */
export function planFill(plan: Plan, i: number, text: string): { ok: true; plan: Plan } | { ok: false; error: string } {
  if (!Number.isInteger(i) || i < 0 || i >= plan.slots.length) return { ok: false, error: "That slot is not on the plan." };
  const t = norm(typeof text === "string" ? text : "");
  if (!t) return { ok: false, error: `Write slot ${i + 1} first, then send it.` };
  if (/[[\]]/.test(t)) return { ok: false, error: "Leave the [brackets] out. Write the sentence in your own words." };
  const long = essayTooLong(t); if (long) return { ok: false, error: long };
  const one = splitSentences(t);
  if (one.length !== 1) return { ok: false, error: `That is ${one.length} sentences. Send slot ${i + 1} as one sentence.` };
  if (!/^["“]?[A-Z]/.test(t) || !/[.!?]["'”’)]?$/.test(t)) return { ok: false, error: "Start it with a capital and end it with a full stop." };
  return { ok: true, plan: { ...plan, slots: plan.slots.map((x, k) => (k === i ? t : x)) } };
}

/** What a sentence of this role is, said as the comment names it. */
const PLAN_READS: Record<PlanSlot["role"], string> = { claim: "a claim", evidence: "evidence", link: "a link back" };
const PLAN_WANTS: Record<PlanSlot["role"], string> = { claim: "your claim: the side you take", evidence: "your evidence: something a reader can check", link: "your link back: what the evidence shows" };

/**
 * A comment when the sentence in slot `i` reads as another job than the slot's, else null. A comment only: the slot
 * is inked because it is written, never because it fits. A bare sentence cannot open as a link ("This shows" is the
 * pattern's own frame), so a link slot is met by a claim or a link and flagged only for evidence.
 */
export function planFit(slots: PlanSlot[], i: number, text: string): string | null {
  const slot = slots[i], first = splitSentences(norm(text))[0];
  if (!slot || !first || first.role === slot.role) return null;
  if (slot.role === "link" && first.role === "claim") return null;
  return `That reads as ${PLAN_READS[first.role as PlanSlot["role"]].replace(/^a /, "")}. This slot wants ${PLAN_WANTS[slot.role]}.`;
}

/** The learner's sentences, in slot order, joined: never a frame word of the pattern. Splits back into exactly the written slots. */
export function planText(plan: Plan): string { return plan.slots.map(norm).filter(Boolean).join(" "); }
