/**
 * Linga's collection (v2 R1): a key for every skill used on your own, a golden key when it was used elsewhere too
 * (the "transfer" step). The Open Door's own object, in its plum and honey; never a number. Sits in the footer.
 */
import type { Session } from "@/lib/session/store";
import { collectionOf } from "@/tv/collection";

function Key({ gold }: { gold: boolean }) {
  const c = gold ? "var(--lo-amber)" : "var(--lo-plum-line)";
  return (
    <svg width="51" height="27" viewBox="0 0 34 18" aria-hidden="true">
      <circle cx="8" cy="9" r="6" fill="none" stroke={c} strokeWidth="3" />
      <path d="M14 9 H32 M26 9 v5 M30 9 v4" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function LingaKeys({ s }: { s: Session }) {
  // the home and the map only: in a scene the footer belongs to the scene
  const keys = s.screen === "linga" || s.screen === "linga-map" ? collectionOf(s, "english") : [];
  if (!keys.length) return null;
  const said = keys.map((k) => `${k.label}${k.kind === "golden-key" ? " (used elsewhere)" : ""}`).join(", ");
  return (
    <span className="lo-keys" data-role="linga-collection" role="img" aria-label={`Keys: ${said}`}>
      {keys.map((k) => <span key={k.ref} data-ref={k.ref} data-kind={k.kind}><Key gold={k.kind === "golden-key"} /></span>)}
    </span>
  );
}
