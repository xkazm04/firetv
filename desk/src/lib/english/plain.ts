/**
 * Plain coaching for a beginner (recert-12 LT-viktor-67-J4-5, recert-13 LT-viktor-67-J4-4): at A1-A2 a fix keeps the
 * learner's tense ("You have school?" is never answered with "Did you have school?") and the words around it use no grammar
 * terms. Pure; no model. The prompt asks for it (PLAIN_TASK) and code holds the model to it (conversation.ts momentOutcome).
 */

/** The sentence added to a beginner's moment and coach tasks. */
export const PLAIN_TASK = " This learner is a beginner: keep the tense of the words they said (a present question stays present, never turn it into the past), and in why and note use no grammar words (no verb, subject, noun, tense, past, present, article, plural, grammar), only plain words about what to say.";

const TERMS = /\b(subjects?|verbs?|nouns?|pronouns?|adjectives?|adverbs?|prepositions?|articles?|plurals?|singulars?|tenses?|past|present|future|participles?|auxiliary|clauses?|conjugat\w*|infinitive|gerund|grammar|grammatical|inflect\w*|syntax|word order)\b/i;

/** Whether a note or reason uses a grammar term. */
export const hasGrammarTerm = (text: string): boolean => TERMS.test(text);

const NOT_PAST = new Set(["hundred", "wicked", "naked", "sacred", "kindred"]);
const IRREGULAR = /\b(did|was|were|had|went|ate|saw|made|took|came|got|bought|gave|knew|told|found|said)\b/i;
const pastMarked = (t: string) => IRREGULAR.test(t) || (t.match(/\b\w+[^e\s\W]ed\b/gi) ?? []).some(w => !NOT_PAST.has(w.toLowerCase()));
const futureMarked = (t: string) => /\b(will|going to)\b/i.test(t);

/** A time word that already asks for the past or the future: a fix toward it keeps the learner's meaning ("you arrive yesterday"). */
const PAST_TIME = /\b(yesterday|ago|last (?:night|week|month|year|summer|weekend|time)|earlier|before)\b/i;
const FUTURE_TIME = /\b(tomorrow|next (?:week|month|year|summer|weekend|time)|tonight|later|soon)\b/i;

/** Whether a better form keeps the tense of the words said: it adds no past or future the learner did not use or ask for. */
export const keepsTense = (said: string, better: string): boolean =>
  !(pastMarked(better) && !pastMarked(said) && !PAST_TIME.test(said)) && !(futureMarked(better) && !futureMarked(said) && !FUTURE_TIME.test(said));
