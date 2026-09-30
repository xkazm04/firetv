/**
 * Essay forensics — the parts that are rules, done before any model is asked.
 *
 * Sentence splitting, length, connectors and a first-pass role guess are all deterministic. The
 * model is asked afterwards to *comment* on a text whose sentences are already numbered and
 * measured, and to return verdicts anchored to sentence numbers — so a highlight can only land on
 * a sentence that exists.
 */
export type Role = "claim" | "evidence" | "link" | "context";
export interface Sentence { n: number; text: string; words: number; connectors: string[]; role: Role; }

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
  const pieces = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?]["'”’)\]]?)\s+(?=[A-Z"“])/).filter(Boolean);
  const parts: string[] = [];
  for (const p of pieces) {
    if (parts.length && ABBREVIATION.test(parts[parts.length - 1])) parts[parts.length - 1] += " " + p;
    else parts.push(p);
  }
  return parts.map((t, i) => {
    const connectors = (t.match(CONNECTORS) || []).map((c) => c.toLowerCase());
    const role: Role = LINK.test(t) ? "link" : EVIDENCE.test(t) ? "evidence" : "claim";
    return { n: i + 1, text: t, words: t.split(/\s+/).length, connectors, role };
  });
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
  const sentences = reading.sentences.map((s, i) => (i === at ? { ...one[0], n: s.n } : s));
  const rebuilt = sentences.map((s) => s.text).join(" ");
  const again = splitSentences(rebuilt);
  if (again.length !== sentences.length || again.some((s, i) => s.text !== sentences[i].text))
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
