/**
 * The language the phone's speech recogniser listens in: the seated learner's school system decides it. A Czech
 * learner is heard in Czech; everyone else, and a desk with nobody seated, in US English as before. Pure.
 */
import type { Session } from "@/lib/session/store";

export const recogniserLang = (s: Pick<Session, "learner" | "profiles"> | null | undefined): "cs-CZ" | "en-US" =>
  s?.learner && s.profiles?.find((p) => p.id === s.learner?.id)?.system === "cz" ? "cs-CZ" : "en-US";
