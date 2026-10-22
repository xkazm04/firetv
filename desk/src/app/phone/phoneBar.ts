/**
 * The phone's bottom bar (TV-led design, section 4, TL-10). Pure: the page asks which items the bar holds for the
 * state it is in. The bar never holds more than three items, and every label is twelve characters or fewer; a longer
 * word belongs in the panel above the bar. Tested by tools/phone-shell-test.cjs.
 */
import type { AskKind } from "@/lib/session/store";

export type BarId = "recap" | "more" | "cancel" | "primary";
export interface BarItem { id: BarId; label: string; disabled?: boolean }

/** The most items the bar holds, and the longest label on one. */
export const BAR_MAX_ITEMS = 3;
export const BAR_MAX_LABEL = 12;

/** The primary button's word for each ask. The ones with two states are in primaryLabel. */
export const PRIMARY: Record<AskKind, string> = {
  name: "Done", page: "Use page", sheet: "Send sheet", answers: "Send", question: "Ask", explain: "Send", second: "Send", paper: "Send",
  paragraph: "Read this", rewrite: "Send", slot: "Send", sentence: "Check", reply: "Send", words: "Send", prefs: "Save", private: "Done", writing: "Send",
};

/**
 * The asks whose panel carries its own submit, where the bar has no hook into it yet (PaperPanel, WritingPanel, and LingaPhone's reply,
 * words and preferences): the bar holds Cancel alone. A primary there could never be pressed, and next to the panel's own
 * Send it read as a second, dead Send (stick pass 2026-10-20).
 */
export const PANEL_SUBMITS: ReadonlySet<AskKind> = new Set<AskKind>(["paper", "reply", "words", "prefs", "writing"]);

/** What changes a primary label while the learner works: a shot still to take, a button held, a piece of several paragraphs. */
export interface PrimaryContext { snap?: boolean; holding?: boolean; paragraphs?: number }

export function primaryLabel(kind: AskKind, ctx: PrimaryContext = {}): string {
  if ((kind === "page" || kind === "sheet") && ctx.snap) return "Snap";
  if (kind === "explain" && ctx.holding) return "Listening";
  if (kind === "paragraph" && (ctx.paragraphs ?? 1) > 1) return "Read all";
  return PRIMARY[kind];
}

export interface BarState {
  joined: boolean;
  /** The open hand-off, or null. */
  ask: { kind: AskKind; phase: "open" | "sent" } | null;
  primary?: PrimaryContext;
  /** The primary has nothing to press yet (nothing typed, no shot). */
  primaryOff?: boolean;
}

/** The items the bar holds, left to right. Not joined: none. */
export function barItems(st: BarState): BarItem[] {
  if (!st.joined) return [];
  if (!st.ask) return [{ id: "recap", label: "Recap" }, { id: "more", label: "More" }];
  if (st.ask.phase === "sent") return [{ id: "primary", label: "Sent", disabled: true }, { id: "more", label: "More" }];
  if (PANEL_SUBMITS.has(st.ask.kind)) return [{ id: "cancel", label: "Cancel" }];
  return [{ id: "cancel", label: "Cancel" }, { id: "primary", label: primaryLabel(st.ask.kind, st.primary), disabled: !!st.primaryOff }];
}

/** The More sheet's rows, in order. Forget is the phone's own and is listed only on a phone. */
export type MoreId = "recap" | "week" | "tonight" | "forget" | "how";
export function moreRows(phone: boolean): Array<{ id: MoreId; label: string }> {
  const rows: Array<{ id: MoreId; label: string }> = [
    { id: "recap", label: "Recap" }, { id: "week", label: "This week" }, { id: "tonight", label: "Tonight's list" },
  ];
  if (phone) rows.push({ id: "forget", label: "Forget this desk" });
  rows.push({ id: "how", label: "How the TV and phone work together" });
  return rows;
}
