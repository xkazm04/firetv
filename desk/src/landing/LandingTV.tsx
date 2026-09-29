"use client";
/**
 * The Study Desk landing (docs/DESIGN-STUDY-DESK.md): the first screen of the TV app, whose desk it is and which of the
 * three apps to open. This file is the seam between the product and a LOOK. It reads the session once into the
 * view-model (landing/model.ts), keeps the two pieces of state that outlive a render - whether the room is being
 * entered, and the app the D-pad was last on - and hands both to the theme (landing/themes/). The keys are not here:
 * they are tv/keys.ts, the stops and what each app has waiting are tv/landingRows.ts, and app/tv/page.tsx owns the
 * Select hand-off (it plays the zoom, waits ZOOM_MS, then runs the step). The look is "paper" today (themes/index.ts).
 */
import { useEffect, useRef, useState } from "react";
import type { Session, Subject } from "@/lib/session/store";
import type { LandingStop } from "@/tv/landingRows";
import { landingView } from "@/landing/model";
import { themeFor } from "@/landing/themes";

export { ZOOM_MS } from "@/landing/model";

/** Whose desk the room was last entered for, this page load: the arrival plays only when someone sits down. */
let litFor: string | null = null;

export function LandingTV({ s, zoom }: { s: Session; zoom: LandingStop | null }) {
  const who = s.learner?.id ?? "";
  const [boot] = useState(() => litFor !== who);
  useEffect(() => { litFor = who; }, [who]);
  const last = useRef<Subject | null>(null);
  const view = landingView(s, last.current);
  const at = view.at;
  useEffect(() => { if (at === "maths" || at === "english" || at === "essay") last.current = at; }, [at]);
  // an app Selected before anyone sat down opens the switcher: the hand-off says so, on the second action
  const stop = zoom && !s.learner && zoom !== "phone" ? "place" : zoom;
  const Theme = themeFor();
  return <Theme.Landing view={view} zoom={stop} boot={boot} />;
}
