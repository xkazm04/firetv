/**
 * The phone as a blocker (docs/concepts/PHONE-BLOCKER-PAIRING-2026-10-22.md). Some things on the TV can only be done on the
 * phone: typing or pasting a paragraph, a photo, a spoken answer. When the learner asks for one with no phone live, the TV does
 * not open a hand-off nobody can answer and does not ignore the key: it shows the pairing page for that wish (the session's
 * `pairFor`), and once a phone joins it goes back to the same screen and runs the Select again.
 * Pure: types only from the store, no engine, no Node built-in.
 */
import type { AskKind, Event, PairFor, Session } from "@/lib/session/store";

/** Hand-offs a missing phone does not block: Linga's reply opens by itself, and the remote can pick a phrase to answer it. */
export const PHONE_OPTIONAL: ReadonlySet<AskKind> = new Set<AskKind>(["reply"]);

/** What the phone would do for each hand-off, as the pairing page words it: "To ..., pair a phone". */
export const PAIR_JOB: Record<AskKind, string> = {
  name: "type the name", page: "snap tonight's page", sheet: "snap your sheet", answers: "type your answers", question: "ask in words",
  explain: "explain your working", second: "type your second go", paper: "type your paper marks", paragraph: "paste or say your paragraph",
  rewrite: "rewrite the sentence", slot: "write the sentence for this slot", sentence: "say or type your sentence", reply: "answer",
  words: "type your words", prefs: "set up your preferences", private: "see the words", writing: "type your paragraph",
};

/** No phone is live: the desk counts none with a stream open (store.ts phonesLive). */
export function noPhone(s: Pick<Session, "phonesLive">): boolean { return s.phonesLive === 0; }

/** The hand-off a step wants, when it cannot be answered: the first ask.open among its events while no phone is live. Null otherwise. */
export function blockedAsk(s: Pick<Session, "phonesLive">, events: readonly Event[]): AskKind | null {
  if (!noPhone(s)) return null;
  for (const e of events) if (e.type === "ask.open" && !PHONE_OPTIONAL.has(e.kind)) return e.kind;
  return null;
}

/** The pairing page's words for a wish: the head, the line under it and the way out. `gone`: a phone was paired before and is not here now. */
export function pairWords(pf: Pick<PairFor, "kind" | "gone">): { head: string; sub: string; out: string } {
  const job = PAIR_JOB[pf.kind] ?? "do this";
  return pf.gone
    ? { head: "Your phone is not here", sub: `To ${job}, open Study Desk on your phone again, or scan the code to pair a new one.`, out: "Back: carry on without the phone" }
    : { head: "This needs a phone", sub: `To ${job}, pair your phone: scan the code, or open the address and type it.`, out: "Back: carry on without the phone" };
}
