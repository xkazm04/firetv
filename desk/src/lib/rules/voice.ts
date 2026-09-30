/**
 * The tutor's voice fits the learner's age - Family mode, Phase 1 (docs/FAMILY-PHASE-1-PLAN.md, W2).
 *
 * Pure: no session, no model, no clock. Two bands:
 *
 *   young  an age is known and it is 13 or less. This is the 11-13 target of the plan (decision D6). Ages under 11
 *          fall in this band too, but nothing here has been written, tested or promised for them: the young voice is
 *          validated for 11-13 only, and a person still has to read it aloud and judge the tone.
 *   teen   every other case, and the ones the desk has always spoken to: 14 and over, and an age that is not known.
 *          The voice is EXACTLY today's text - `who` is the words the prompt has always carried, `manner` is "" - so a
 *          learner of 14+ (or of no stated age) gets byte-for-byte the prompt that shipped before this file existed.
 *
 * A voice is a wrapper around the rules, never a copy of them. `who` replaces the phrase that names the learner in a
 * prompt's first line; `manner` is one paragraph that is appended after the whole prompt. The withholding clauses
 * ("never state the final answer", "never rewrite their sentences", the leak and pattern rules) stay in the engine
 * files, once each, and are shared by both bands; a manner only says HOW to sound, and says outright that the rules
 * above it still hold. So a band cannot loosen a rule, and the two cannot drift apart.
 *
 * The caller reads the age from the seated profile (`Profile.age`; the learner record has none), and passes it as an
 * optional argument: every call that passes nothing is a teen call.
 */
export type VoiceSubject = "maths" | "essay" | "english";
export type Band = "young" | "teen";

export interface Voice {
  band: Band;
  /** The words that name the learner in the prompt's opening line: "a 15-year-old" (maths, essay), "a Czech teenager" (english) today. */
  who: string;
  /** One paragraph on how to sound, appended after the prompt. "" for the teen band: nothing is added. */
  manner: string;
}

/** The oldest age the young voice speaks to. */
export const YOUNG_MAX_AGE = 13;

/** young for a known age of 13 or less, teen for everything else - 14 and over, and an unknown age. */
export function bandOf(age?: number | null): Band {
  return typeof age === "number" && Number.isFinite(age) && age <= YOUNG_MAX_AGE ? "young" : "teen";
}

/** What every young manner opens and closes with: the rules above are not touched by it. */
const OPEN = "How to sound for this learner, who is a child of about 12 (this changes your tone and your words only; every rule above still holds, exactly as written). ";
const SHORT = "Use short sentences and everyday words; if a maths or grammar word cannot be avoided, use it once and say in plain words what it means. ";
const KIND = "Be kind and steady, never patronising: no baby talk, no piled-up exclamation marks, no talking down.";

const YOUNG: Record<VoiceSubject, { who: string; manner: string }> = {
  maths: {
    who: "a learner aged 11 to 13",
    manner: OPEN + SHORT +
      "One idea in each hint or reply, and keep it to two short sentences where you can. Be concrete: point at one thing on their paper. " +
      "Nudge with a question or a first move; never state the final answer or any number or step that would give it away. " +
      "Encourage by being specific about the step, never by a verdict or praise the rules above do not allow. " + KIND + " Still Socratic: they find the step, you do not.",
  },
  essay: {
    who: "a learner aged 11 to 13",
    manner: OPEN + SHORT +
      "Comment on what the sentence does in the paragraph - its move - one idea at a time, and never rewrite or improve their sentences for them. " +
      "Each note is one plain sentence a child can act on; the summary is one plain sentence too. " +
      "Name a move in everyday words. Be kind about what works only when it is true. " + KIND,
  },
  english: {
    who: "a Czech learner aged 11 to 13",
    manner: OPEN + SHORT +
      "Their English is still growing, so choose the simplest words you can and keep to the length above. Name the time word and the tense it asks for, then let them find the form; never write it for them. " + KIND,
  },
};

const TEEN: Record<VoiceSubject, string> = {
  maths: "a 15-year-old",
  essay: "a 15-year-old",
  english: "a Czech teenager",
};

/** The voice for `subject` at `age`. Same input, same output. */
export function voiceOf(subject: VoiceSubject, age?: number | null): Voice {
  if (bandOf(age) === "young") return { band: "young", ...YOUNG[subject] };
  return { band: "teen", who: TEEN[subject], manner: "" };
}

/** A prompt with the voice's manner after it; the prompt itself, untouched, when the manner is empty. */
export const withManner = (system: string, voice: Voice): string => (voice.manner ? `${system}\n\n${voice.manner}` : system);

/** The age of the learner at the desk, from their profile; undefined when nobody is seated, there is no profile, or it has no age. */
export function learnerAge(s: { profiles?: { id: string; age?: number }[]; learner?: { id: string } | null }): number | undefined {
  const id = s.learner?.id;
  const age = id ? s.profiles?.find((p) => p.id === id)?.age : undefined;
  return typeof age === "number" && Number.isFinite(age) ? age : undefined;
}
