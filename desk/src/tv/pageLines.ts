/**
 * The words under a page whose read failed, by subject. Maths and English point to Try again on the phone (the capture
 * panel carries it, phone/panelFor.ts readFailed); an essay page's phone panel is the paste panel, which has no Try again,
 * so its line names what that panel offers.
 */
import type { Subject } from "@/lib/session/store";

export function failedReadLine(subject: Subject): string {
  return subject === "essay" ? "The desk could not read this page. Paste or type it on the phone." : "The desk could not read this page. Open Try again on the phone.";
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
