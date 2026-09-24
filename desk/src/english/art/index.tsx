/**
 * Linga's illustration library: one picture per situation, one per state of the journey, and the words a screen
 * reader says for each. Pick by the view's ArtKey (lib/english/view.ts); never by a scene's title.
 */
import type { ArtKey, SceneArt } from "@/lib/english/view";
import { SCENE_ART } from "@/lib/english/view";
import { Booking } from "./Booking";
import { Cafe } from "./Cafe";
import { Handover } from "./Handover";
import { Interview } from "./Interview";
import { Meet } from "./Meet";
import { Rover } from "./Rover";
import { Check, Coach, Done, Plan, Start } from "./States";
import { Team } from "./Team";
import { Weekend } from "./Weekend";

export const ART: Record<ArtKey, { Art: () => React.JSX.Element; label: string }> = {
  meet: { Art: Meet, label: "A club evening: Jamie waves hello, a name sticker on, bunting overhead" },
  weekend: { Art: Weekend, label: "A park at the weekend: Casey plays guitar on a bench under a kite" },
  rover: { Art: Rover, label: "On the moon: Pip the robot guide points the way to a rover hidden behind a boulder" },
  team: { Art: Team, label: "A planning room: Sam points at a mission route on the whiteboard" },
  booking: { Art: Booking, label: "Hotel reception: Robin searches a reservation ledger while a guest waits with a suitcase" },
  interview: { Art: Interview, label: "An office: Jordan reads a page across the interview desk" },
  date: { Art: Cafe, label: "A café table: Taylor holds a cup of tea, a glass of juice on the other side" },
  conflict: { Art: Handover, label: "A project desk: Morgan explains, a date circled on the calendar and a page missing from the folder" },
  check: { Art: Check, label: "An open door with light across two steps" },
  plan: { Art: Plan, label: "A path of doors, the nearest one open" },
  coach: { Art: Coach, label: "A speech bubble with one part marked, and a better one with a check" },
  done: { Art: Done, label: "A star-burst with a check" },
  start: { Art: Start, label: "A page with a way in" },
};

export function isScene(art: ArtKey): art is SceneArt { return (SCENE_ART as readonly string[]).includes(art); }
