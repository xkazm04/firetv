"use client";
/**
 * The learner's lost thing on the phone (L3, lib/english/lostfound.ts): a picture of it and of where it was lost, and
 * no word that names it, so the English is the learner's own. The phone asks for it (action "lost-picture"); the
 * answer is this request's reply only and never part of the session, which the TV reads too.
 */
import { useEffect, useState } from "react";
import type { LostThing } from "@/lib/english/lostfound";
import { LostThingArt, PlaceMark } from "./art/LostThing";
import { requestId } from "./useEnglish";

export function LostPicture({ learnerId, episodeId, partner }: { learnerId?: string; episodeId: string; partner: string }) {
  const [thing, setThing] = useState<LostThing | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/english", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "lost-picture", learnerId, episodeId, commandId: requestId() }) })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (live) setThing(j?.picture ?? null); })
      .catch(e => console.warn("Linga: the lost thing's picture did not load; the scene goes on without it.", e));
    return () => { live = false; };
  }, [learnerId, episodeId]);
  if (!thing) return null;
  return <div className="linga-lost" data-role="linga-lost-picture">
    <svg viewBox="-100 -175 200 205" width="100%" style={{ maxWidth: 240, display: "block", margin: "0 auto" }} role="img" aria-label="The thing you lost, and where you lost it">
      <circle cx="0" cy="-72" r="98" fill="#f6d0a2"/>
      <LostThingArt thing={thing} x={-8} y={4} s={1.35}/>
      <PlaceMark place={thing.place} x={70} y={2} r={20}/>
    </svg>
    <p className="linga-note">This is what you lost. Tell {partner.split(" · ")[0]} about it in English.</p>
  </div>;
}
