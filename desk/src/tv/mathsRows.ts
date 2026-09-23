/**
 * Math Buddy's pure rows: what the session alone says is open. Shared by the Tonight screen and
 * the D-pad (tv/keys.ts). Types only from the store - the TV never loads the filesystem.
 */
import type { Screen, Session } from "@/lib/session/store";
import { topic as topicById } from "@/lib/library/syllabus";
import { firstToLook } from "@/tv/sheetRows";

/**
 * Where the continue card leads. Every target is a Screen the D-pad navigates to, at `focus`; "page"
 * also selects the sheet at `pageIx` first. A new target is one more member here and one branch below.
 */
export type ContinueGo = Extract<Screen, "practice" | "sheet" | "page">;

/**
 * The continue card: the one thing already open in Math Buddy, offered before anything new.
 * Read straight off the session - if none of these hold there is nothing to continue and the
 * screen says nothing about it.
 */
export interface Continue { k: string; t: string; d: string; cap: string; go: ContinueGo; pageIx: number; focus: number }
export function continueCard(s: Session): Continue | null {
  const name = s.practice ? topicById(s.practice.topic)?.name ?? s.practice.topic : "";
  if (s.practice && !s.practice.marked) return {
    k: "Still open", t: "Finish the set", d: `${s.practice.items.length} questions on ${name}, not marked yet.`,
    cap: "Your questions are still on paper. Enter puts them back on screen, ready for the photo.",
    go: "practice", pageIx: 0, focus: 0,
  };
  // a marked set is parked on its sheet until it is put away: Enter goes back to the first item to look at
  if (s.practice?.marked) { const n = s.practice.items.length, right = s.practice.items.filter((i) => i.verdict === "right").length; return {
    k: "Marked", t: "Back to the marked set", d: `${name} · ${right} of ${n} right.`,
    cap: right === n ? "All of the marked set came back right. Enter shows it, and six more are one press away."
      : "The marked set is still on the desk. Enter shows it again, on the first one to look at.",
    go: "sheet", pageIx: 0, focus: firstToLook(s.practice.items),
  }; }
  const pi = s.pages.findIndex((p) => p.subject === "maths" && p.items.length > 0);
  if (pi >= 0) { const p = s.pages[pi]; return {
    k: "On the desk", t: "Back to the sheet", d: `${p.title} · ${p.items.length} problems read.`,
    cap: "The sheet you snapped is still on the desk. Enter opens it where you were.",
    go: "page", pageIx: pi, focus: 0,
  }; }
  return null;
}
