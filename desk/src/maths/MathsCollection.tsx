/**
 * Math Buddy's collection (v2 R1): a lamp lit for every topic latched secure, a star over it for the extra mile (the
 * step-up latch). Lamplight's own objects, drawn in its amber; never a number. The shelf shows the twelve most recent;
 * older lamps stay earned (lib/rules/collect.ts) and simply sit off the shelf's left end.
 */
import type { Session } from "@/lib/session/store";
import { collectionOf } from "@/tv/collection";

const SHELF = 12;

function Lamp({ star }: { star: boolean }) {
  return (
    <svg width="36" height="48" viewBox="0 0 30 40" aria-hidden="true">
      <circle cx="15" cy="16" r="13" fill="var(--mb-amber)" opacity=".22" />
      <path d="M7 18 L11 6 H19 L23 18 Z" fill="var(--mb-amber)" />
      <rect x="14" y="18" width="2" height="14" fill="var(--mb-amber-lo)" />
      <rect x="8" y="32" width="14" height="3" rx="1.5" fill="var(--mb-amber-lo)" />
      {star && <path d="M15 0.5 l1.6 3.3 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 z" fill="var(--mb-cream)" stroke="var(--mb-amber-2)" strokeWidth=".8" />}
    </svg>
  );
}

export function MathsCollection({ s }: { s: Session }) {
  const items = collectionOf(s, "maths");
  const stars = new Set(items.filter((c) => c.kind === "star").map((c) => c.ref));
  const lamps = items.filter((c) => c.kind === "lamp").slice(-SHELF);
  if (!lamps.length) return null;
  const said = lamps.map((c) => `${c.label}${stars.has(c.ref) ? " (the extra mile)" : ""}`).join(", ");
  return (
    <div className="mb-shelf" data-role="maths-collection" role="img" aria-label={`Lamps lit: ${said}`}>
      {lamps.map((c) => <span key={c.ref} data-ref={c.ref} data-star={stars.has(c.ref)}><Lamp star={stars.has(c.ref)} /></span>)}
    </div>
  );
}
