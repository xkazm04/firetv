/**
 * The words under a page whose read failed, by subject. Maths and English point to Try again on the phone (the capture
 * panel carries it, phone/panelFor.ts readFailed); an essay page's phone panel is the paste panel, which has no Try again,
 * so its line names what that panel offers.
 */
import type { Subject } from "@/lib/session/store";

export function failedReadLine(subject: Subject): string {
  return subject === "essay" ? "The desk could not read this page. Paste or type it on the phone." : "The desk could not read this page. Open Try again on the phone.";
}
