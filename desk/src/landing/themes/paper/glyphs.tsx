/**
 * The paper theme's small glyphs: the house mark (nested arches, the innermost one lit), the icons the chrome and the
 * actions use, and the pairing postcard's picture. Drawn with currentColor where a parent sets the ink.
 */
import { paint } from "./shapes";

/** Study Desk's mark: three nested arches over a ground line, the innermost door lit. */
export function HouseMark({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="pp-arc" pathLength={1} d="M5 59V30a27 27 0 0 1 54 0v29" />
      <path className="pp-arc" pathLength={1} d="M14 59V31a18 18 0 0 1 36 0v28" />
      <path className="pp-arc" pathLength={1} d="M23 59V32a9 9 0 0 1 18 0v27" />
      <path className="pp-lit" d="M25 59V32a7 7 0 0 1 14 0v27z" fill="#f1b53f" stroke="none" />
      <path className="pp-arc" pathLength={1} d="M2 60H62" />
    </svg>
  );
}

const svg24 = { viewBox: "0 0 24 24", width: 24, height: 24, "aria-hidden": true } as const;
export const Icon = {
  sun: <svg {...svg24}><circle cx="12" cy="12" r="5" fill="#e9a93a" /><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke="#e9a93a" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  moon: <svg {...svg24}><path d="M19 15.5A8.5 8.5 0 0 1 8.5 5 8.5 8.5 0 1 0 19 15.5z" fill="#5d3a7a" /></svg>,
  clock: <svg {...svg24}><circle cx="12" cy="12" r="9" fill="none" stroke="#2b1d16" strokeWidth="2.4" /><path d="M12 6.5V12l4 2.5" fill="none" stroke="#2b1d16" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  left: <svg {...svg24}><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  right: <svg {...svg24}><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  ok: <svg {...svg24}><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>,
  arrow: <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M6 16h19M17 8l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  swap: <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M5 11h20M20 5l6 6-6 6M27 21H7M12 15l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

/** The phone chip: paired, a lit screen with waves; unpaired, dashed and struck through. */
export function PhoneGlyph({ paired }: { paired: boolean }) {
  return (
    <svg viewBox="0 0 44 56" width="34" height="44" aria-hidden="true">
      <rect x="8" y="3" width="24" height="42" rx="6" fill={paired ? "#2b1d16" : "none"} stroke="#2b1d16" strokeWidth="3.2" strokeDasharray={paired ? undefined : "5 5"} />
      <rect x="12" y="9" width="16" height="26" rx="2" fill={paired ? "#f1b53f" : "none"} />
      <circle cx="20" cy="40" r="2" fill={paired ? "#f6ecd9" : "#2b1d16"} />
      {paired ? <path d="M35 12q6 6 0 12M39 8q10 10 0 20" fill="none" stroke="#3f9a6a" strokeWidth="3" strokeLinecap="round" />
        : <path d="M4 50L36 6" stroke="#d9563a" strokeWidth="3.6" strokeLinecap="round" />}
    </svg>
  );
}

/** The postcard's picture: a phone, a dotted path, the open door of the desk. */
export function PostcardArt() {
  return (
    <svg className="pp-wave" viewBox="0 0 504 150" width="504" height="150" aria-hidden="true">
      <rect x="18" y="14" width="66" height="124" rx="15" fill="#2b1d16" /><rect x="27" y="28" width="48" height="90" rx="7" fill={paint("gYellow")} /><circle cx="51" cy="127" r="4" fill="#f6ecd9" />
      <path d="M40 52h22M40 68h14M40 84h22" stroke="#b8862a" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 44q20 22 0 44M110 34q30 32 0 64" fill="none" stroke="#3f9a6a" strokeWidth="5" strokeLinecap="round" />
      <path className="pp-dashw" d="M132 76C176 14 214 136 262 76S340 16 388 76" fill="none" stroke="var(--deep)" strokeWidth="7" strokeLinecap="round" strokeDasharray="2 15" />
      <rect x="398" y="24" width="96" height="68" rx="11" fill="var(--deep)" /><rect x="407" y="33" width="78" height="50" rx="6" fill="#f6ecd9" /><path d="M420 83V64a19 19 0 0 1 38 0V83z" fill={paint("gDoor")} /><path d="M430 92h58l8 20h-74z" fill="#2b1d16" />
    </svg>
  );
}
