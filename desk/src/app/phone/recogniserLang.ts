/**
 * The language the phone's speech recogniser listens in: the seated learner's school system decides it. A Czech
 * learner is heard in Czech; everyone else, and a desk with nobody seated, in US English as before. Pure.
 */
import type { Session } from "@/lib/session/store";

const learnerLang = (s: Pick<Session, "learner" | "profiles"> | null | undefined): "cs-CZ" | "en-US" =>
  s?.learner && s.profiles?.find((p) => p.id === s.learner?.id)?.system === "cz" ? "cs-CZ" : "en-US";

/** Essay Master is written and read in English: its panels listen in English whatever the school system. Math and Linga follow the learner. */
export const recogniserLangFor = (tab: string, s: Pick<Session, "learner" | "profiles"> | null | undefined): "cs-CZ" | "en-US" =>
  tab === "essay" ? "en-US" : learnerLang(s);
export const recogniserLang = learnerLang;
