/**
 * Which look a TV wait is drawn in. A wait (the stream not yet open, a page being read) has no screen of its own to
 * borrow a theme from, and the On Air shell is the fallback that used to draw it: a learner in Linga or Essay Master
 * saw the grey On Air grid flash in between two module screens. This is the one decision, pure and in code
 * (app/tv/page.tsx and tv/LookWait.tsx only draw what it says):
 *   - the session is not here yet: the look the TV last drew a module in (`remembered`), else neutral;
 *   - the landing is the paper desk; Math Buddy, Linga and Essay Master draw their own screens;
 *   - a shell screen that belongs to a module's subject while it waits takes that module's look, so the wait is
 *     drawn in the module's ground, not On Air's.
 * Nothing here reads an answer: a look is a name, a caption is a fixed line.
 */
import type { Session } from "@/lib/session/store";
import { essayOwns, lingaOwns, mathsOwns, paperOwns } from "@/tv/keys";

export type Look = "paper" | "maths" | "linga" | "essay" | "neutral";
export const LOOKS: readonly Look[] = ["paper", "maths", "linga", "essay", "neutral"];
/** The localStorage key the TV remembers the last module look under. */
export const LOOK_KEY = "desk-look";

/** A stored value is a look or nothing: anything else (a stale or hand-edited key) is neutral. */
export function parseLook(raw: unknown): Look {
  return typeof raw === "string" && (LOOKS as readonly string[]).includes(raw) ? (raw as Look) : "neutral";
}

const OF_SUBJECT = { maths: "maths", english: "linga", essay: "essay" } as const;
const subjectLook = (sub: string | undefined): Look => (sub && sub in OF_SUBJECT ? OF_SUBJECT[sub as keyof typeof OF_SUBJECT] : "neutral");

/**
 * The look the TV is in: whose screen is drawn now. A screen the On Air shell draws (pair, learner, recap, a page of
 * another module's subject...) is "neutral" here unless `lookOfWait` says a wait on it belongs to a module.
 */
export function lookOf(s: Session | null, remembered: Look = "neutral"): Look {
  if (!s) return remembered;
  if (s.screen === "landing") return "paper";
  if (lingaOwns(s)) return "linga";
  if (essayOwns(s)) return "essay";
  if (mathsOwns(s) || paperOwns(s)) return "maths";
  return "neutral";
}

/** What a shell wait says, per look: fixed lines, none of them the page's or the learner's words. */
export const WAIT_LINE: Record<Look, string> = {
  paper: "Opening the desk…", maths: "Opening Math Buddy…", linga: "Opening Linga…", essay: "Opening Essay Master…", neutral: "Opening the desk…",
};
export const READING_LINE = "Reading the page…";

/**
 * A page of another module's subject that the desk is reading, which the On Air shell would draw as its grey page
 * screen: the look of that subject (Linga, Essay Master) so the wait is drawn in it. Null when nothing waits or the module
 * already draws the screen itself (Math Buddy's page screen carries its own reading state).
 */
export function lookOfWait(s: Session | null): Look | null {
  if (!s || !s.reading || s.screen !== "page") return null;
  if (lingaOwns(s) || essayOwns(s) || mathsOwns(s) || paperOwns(s)) return null;
  const look = subjectLook(s.pages[s.pageIx]?.subject ?? s.subject);
  return look === "linga" || look === "essay" ? look : null;
}

/** The look to remember after a session arrived: a module's or the paper desk's; the shell's neutral changes nothing. */
export function lookToRemember(s: Session | null, prior: Look): Look {
  const l = lookOfWait(s) ?? lookOf(s, prior);
  return l === "neutral" ? prior : l;
}
