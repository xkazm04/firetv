/**
 * The words under a page whose read failed, by subject and the job's `retry`. Maths and English name the TV's own Select,
 * which asks the read again since TL-13 (tv/keys.ts page, F8); a read the desk will not repeat (`retry === false`) promises
 * no retry and asks for a new photo. An essay page's phone panel is the paste panel, which has no Try again, so its line
 * names what that panel offers.
 */
import type { Subject } from "@/lib/session/store";

export function failedReadLine(subject: Subject, retry?: boolean): string {
  if (subject === "essay") return "The desk could not read this page. Paste or type it on the phone.";
  return retry === false ? "The desk could not read this page. Take a new photo of the page on the phone." : "The desk could not read this page. Select to try again.";
}

/**
 * The words under a page whose read left printed numbers out (HF1). It names up to three and counts the rest, and asks for a
 * new photo, not Try again: the same photo reads the same way. The items that were read stay on the page.
 */
export function missingLine(missing: number[]): string {
  const ask = " Take a new photo of the page on the phone.";
  if (missing.length === 1) return `Number ${missing[0]} was not read.${ask}`;
  const shown = missing.slice(0, 3), more = missing.length - shown.length;
  const names = more > 0 ? `${shown.join(", ")} and ${more} more` : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  return `Numbers ${names} were not read.${ask}`;
}

/**
 * The counts under a page the learner's own working was marked on (MB-B35), as the practice sheet says them: right, to look at,
 * to talk through. Counts only: no answer, no slip.
 */
export function markedLine(items: readonly { verdict?: "right" | "wrong" | "unsure" }[]): string {
  const right = items.filter((i) => i.verdict === "right").length, wrong = items.filter((i) => i.verdict === "wrong").length;
  return `Your sheet: ${right} right, ${wrong} to look at, ${items.length - right - wrong} to talk through.`;
}
