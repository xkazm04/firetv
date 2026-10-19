/**
 * The open session streams of the TV and of each listed phone, kept apart from the stream route because a Next route file
 * may export only its handlers and the session route must close a phone's streams when that phone is forgotten.
 * The map is on the global object, so a dev reload keeps it.
 */
import { createHash } from "node:crypto";
import { dispatch } from "./store";

/** Device key (the TV, or a phone cookie's fingerprint) to that device's close functions, in opening order. */
export const devices = () => { const g = globalThis as unknown as { __deskDeviceStreams?: Map<string, (() => void)[]> }; return (g.__deskDeviceStreams ??= new Map()); };
/** A phone cookie's fingerprint: the key its streams are listed under. */
export const phoneKey = (cookie: string | undefined) => createHash("sha256").update(cookie ?? "").digest("hex");
/** Tell the session how many phones have a stream open: the device keys but the TV's (TL-3). */
export const presence = () => dispatch({ type: "phone.presence", live: [...devices().keys()].filter((k) => k !== "tv").length });
/**
 * Close the streams of one phone (its key), or of every phone (no key). The TV's streams and guests' are never touched.
 * Each goes through its own close(), so phone.presence fires and phonesLive drops.
 */
export function closePhoneStreams(key?: string): void {
  for (const k of [...devices().keys()]) {
    if (k === "tv" || (key !== undefined && k !== key)) continue;
    for (const close of [...(devices().get(k) ?? [])]) close();
  }
}
