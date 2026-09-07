/**
 * English tenses, decided in code.
 *
 * The PoC's lesson, in one sentence: when the model chose the tense it was wrong one time in
 * three; when a marker table chose it and the model only explained, it was right six times in
 * six. So the marker decides. The card the model sees carries the decision and the reasons and
 * never the form the student must produce.
 */
export type Tense = "past-simple" | "present-perfect" | "present-simple" | "future" | "past-continuous";

export interface RuleCard {
  tense: Tense; name: string; tenseReason: string; marker: string | null;
  person: string; verb: string | null;
  when: string; findIt: string; warning: string | null;
  /** what the student wrote, if it disagrees with the rule */
  conflict: { wrote: string; is: string } | null;
}

const TENSES: Record<Tense, { name: string; when: string; findIt: string }> = {
  "past-simple": { name: "past simple", when: "a finished action at a closed time", findIt: "the past form of the verb — regular verbs add -ed, irregular verbs have their own (go → went)" },
  "present-perfect": { name: "present perfect", when: "time that is still open, or a result still with us", findIt: "have/has + the past participle (go → gone)" },
  "present-simple": { name: "present simple", when: "a fact, a habit, or a rule", findIt: "the base verb; add -s for he/she/it" },
  "future": { name: "future with will", when: "a decision or prediction about later", findIt: "will + the base verb" },
  "past-continuous": { name: "past continuous", when: "an action that was in progress when something else happened", findIt: "was/were + the -ing form" },
};

const MARKERS: Array<[RegExp, Tense]> = [
  [/\b(yesterday|last (week|month|year|night)|ago|in \d{4}|when i was|the other day)\b/i, "past-simple"],
  [/\b(since|for (\d+|many|several|a few) (years?|months?|weeks?|days?)|already|yet|ever|never|just|so far|this (week|year) so far)\b/i, "present-perfect"],
  [/\b(tomorrow|next (week|month|year)|soon|in (a|the) future|tonight)\b/i, "future"],
  [/\b(every (day|week|morning)|always|usually|often|sometimes|on (mondays|sundays))\b/i, "present-simple"],
  [/\b(while|when (the|it|he|she|they) \w+ed)\b/i, "past-continuous"],
];

const TENSE_FORMS: Array<[RegExp, Tense, string]> = [
  [/\b(have|has|'ve|'s) (been|gone|seen|done|lived|eaten|written|had|made|taken|come|got|played|worked|studied|\w+ed|\w+en)\b/i, "present-perfect", "present perfect"],
  [/\b(will|'ll) \w+\b/i, "future", "future with will"],
  [/\b(was|were) \w+ing\b/i, "past-continuous", "past continuous"],
  [/\b(went|saw|did|ate|wrote|had|made|took|came|got|was|were|lived|played|worked|studied|\w{3,}ed)\b/i, "past-simple", "past simple"],
];

export function resolveEnglish(sentence: string): RuleCard {
  const s = sentence.trim();
  let tense: Tense = "present-simple", tenseReason = "no time marker: a fact or a habit", marker: string | null = null;
  for (const [re, t] of MARKERS) { const m = s.match(re); if (m) { tense = t; marker = m[0]; tenseReason = `the time marker “${m[0]}”`; break; } }

  const person = /^\s*i\b/i.test(s) ? "I" : /^\s*(he|she|it)\b/i.test(s) ? "he / she / it" : /^\s*(we|they|you)\b/i.test(s) ? "we / you / they" : "the subject";

  let wrote: { form: string; is: Tense; label: string } | null = null;
  for (const [re, t, label] of TENSE_FORMS) { const m = s.match(re); if (m) { wrote = { form: m[0], is: t, label }; break; } }
  const verb = wrote?.form.split(/\s+/).pop() ?? null;

  const conflict = wrote && wrote.is !== tense ? { wrote: wrote.form, is: wrote.label } : null;
  const warning = tense === "past-simple" && verb && /^(go|gone|went|eat|ate|eaten|see|saw|seen|write|wrote|written|take|took|taken|come|came|do|did|done|have|had|make|made|get|got)$/i.test(verb)
    ? "This verb is irregular — its past form is not made with -ed." : null;

  return { tense, name: TENSES[tense].name, tenseReason, marker, person, verb, when: TENSES[tense].when, findIt: TENSES[tense].findIt, warning, conflict };
}

/** The card as the model is allowed to see it. */
export function cardText(c: RuleCard) {
  return [
    `Tense to use: ${c.name} — because of ${c.tenseReason}.`,
    `Used for: ${c.when}.`,
    `Subject: ${c.person}.`,
    `Where the student finds the form: ${c.findIt}.`,
    c.conflict ? `The student wrote “${c.conflict.wrote}”, which is the ${c.conflict.is}; that disagrees with the marker.` : "The student's tense agrees with the marker.",
    c.warning ?? "",
  ].filter(Boolean).join("\n");
}
