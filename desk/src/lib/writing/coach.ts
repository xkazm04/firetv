/**
 * The one coaching note. Code reads the paragraph with the Essay rules (splitSentences, paragraphStats) and picks the
 * focus; a model, through the engine the caller hands in, words the note; the ghostwriting guard (rules/essay
 * guardNote) turns any note that would hand over a sentence into the code's own line. Never a model sentence for the
 * learner to copy.
 */
import { guardNote, LONG_SENTENCE_WORDS, paragraphStats, splitSentences } from "@/lib/rules/essay";
import type { Band } from "@/lib/rules/voice";
import type { WritingPrompt } from "./prompts";

export type Focus = "claim" | "evidence" | "link" | "length";
/** The shape of text() in lib/engines/text.ts, narrowed to what this needs. */
export type AskNote = (req: { system: string; prompt: string; schema: object; model: "fast" | "best"; use: string; thinking?: boolean }) => Promise<{ json: { note?: unknown } }>;

/** The one thing to work on, decided by code from the paragraph's own counts. */
export function focusOf(draft: string): Focus {
  const ss = splitSentences(draft), st = paragraphStats(ss);
  if (ss.some((s) => s.words > LONG_SENTENCE_WORDS)) return "length";
  if (st.claims > 0 && st.evidence === 0) return "evidence";
  if (st.claims === 0) return "claim";
  if (st.links === 0) return "link";
  return "evidence";
}

const LINES: Record<Band, Record<Focus, string>> = {
  young: {
    claim: "Say clearly what you think in one sentence, then build on it.",
    evidence: "You say what you think, but nothing shows a reader it is true. Add a fact or a real example they could check.",
    link: "Your ideas sit side by side. Add a word like 'because' or 'so' to join your example back to what you think.",
    length: `One sentence is over ${LONG_SENTENCE_WORDS} words long. Cut it into two.`,
  },
  teen: {
    claim: "State your position in one clear sentence, then build the paragraph on it.",
    evidence: "Your claim has nothing a reader can check after it. Add a specific fact, figure or example.",
    link: "Your evidence does not point back to your claim. Add a sentence that says what the evidence shows.",
    length: `One sentence runs past ${LONG_SENTENCE_WORDS} words. Split it.`,
  },
};

export const codeNote = (draft: string, band: Band): string => LINES[band][focusOf(draft)];

/**
 * The one short note COACH_SYSTEM asks for, held in code: at most this many sentences, and no longer than twice the code's
 * own longest line. A note past either is not the note asked for, and on the TV (46 px, WritingTV) it would run past the
 * screen, so the code's line is shown instead.
 */
export const NOTE_MAX_SENTENCES = 2;
export const NOTE_MAX_CHARS = 240;

const SCHEMA = { type: "object", properties: { note: { type: "string", maxLength: NOTE_MAX_CHARS } }, required: ["note"], additionalProperties: false };

export const COACH_SYSTEM =
  "You coach a student's one paragraph. Reply with ONE short note (at most two sentences) about the single thing named as the focus. " +
  "Speak about the writing, to the student ('your claim', 'this sentence'). Never write a sentence they could put in the paragraph, never quote a model answer, never rewrite their words. A question is welcome.";

/** The note shown: the engine's, when it is a plain note that hands over no sentence; else the code's line. Never throws on a failed call. */
export async function coachNote(draft: string, band: Band, prompt: WritingPrompt, ask: AskNote): Promise<{ note: string; source: "model" | "code" }> {
  const fallback = codeNote(draft, band);
  try {
    const r = await ask({
      system: COACH_SYSTEM, schema: SCHEMA, model: "fast", use: "writing-coach",
      prompt: `Student band: ${band}. Task: ${prompt.ask}\nFocus: ${focusOf(draft)} (${fallback})\n\nParagraph:\n${draft}`,
    });
    const said = typeof r.json?.note === "string" ? r.json.note.trim() : "";
    if (!said || said.length > NOTE_MAX_CHARS || splitSentences(said).length > NOTE_MAX_SENTENCES) return { note: fallback, source: "code" };
    const guarded = guardNote(said, splitSentences(draft).map((s) => s.text), "");
    return guarded ? { note: guarded, source: "model" } : { note: fallback, source: "code" };
  } catch {
    return { note: fallback, source: "code" };
  }
}
