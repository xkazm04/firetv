/**
 * The Open Door, Linga's own design language (docs/DESIGN-LINGA.md): the pieces every Linga TV screen is built
 * from. LingaTV composes them; the styles are design/linga.css, scoped under .linga-tv.
 */
import type { ReactNode } from "react";
import { PROGRESS_LABEL, PROGRESS_ORDER } from "@/lib/english/curriculum";
import { BAND_NAME } from "@/lib/english/placement";
import { BANDS, type Band, type Progress } from "@/lib/english/types";
import type { ArtKey, Dot } from "@/lib/english/view";
import { ART, isScene } from "./art";

/** Linga's mark: a speech bubble with two lines, and the wordmark in Georgia. */
export function Mark() {
  return <div className="lo-mark" data-role="linga-mark">
    <svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><path d="M10 6h25c14 0 22 10 22 23S49 51 34 51H20L8 59V29C8 14 14 6 30 6" fill="#8b3f50"/><path d="M20 21h23M20 31h16" stroke="#f5e8d7" strokeWidth="5" strokeLinecap="round"/></svg>
    <span>Linga</span>
  </div>;
}

/** The learner chip, top right. On home ↑ switches learner, and the chip says so. */
export function Learner({ name, up }: { name: string; up: boolean }) {
  return <div className="lo-learner" data-role="linga-learner">{name}{up && <svg viewBox="0 0 16 28" aria-hidden="true" focusable="false"><path d="M8 26V4M2 10l6-7 6 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>;
}

/**
 * The arch: a door in a plum frame on a plinth, with the world of this screen behind it. A situation fills it
 * edge to edge; a state of the journey stands on the warm gradient with the brand line over it. The name tag says
 * who is behind the door (on the conversation it is also .linga-speaker).
 */
export function Arch({ art, tag, speaker }: { art: ArtKey; tag?: string; speaker?: boolean }) {
  const { Art, label } = ART[art], scene = isScene(art);
  return <div className={`lo-arch ${scene ? "lo-arch-scene" : "lo-arch-symbol"}`}>
    <div className="lo-arch-shadow"/>
    <div className="lo-door" data-role="linga-art" data-art={art} role="img" aria-label={label}>
      {scene ? <Art/> : <><div className="lo-door-label" aria-hidden="true">A way into English</div><div className="lo-symbol"><Art/></div></>}
    </div>
    {tag && <div className={`lo-tag${speaker ? " linga-speaker" : ""}`} data-role="linga-partner">{tag}</div>}
    <div className="lo-plinth"/>
  </div>;
}

/** The overline over a title. A leading band ("B1 · Getting by") is set as the winner set it: B1 in plum, bolder. */
export function Kicker({ text, band }: { text: string; band?: string }) {
  const m = band ? null : text.match(/^(A1|A2|B1|B2|C1|C2) · (.*)$/);
  const lead = band ?? m?.[1], rest = band ? text : m ? m[2] : text;
  return <div className="lo-kicker linga-kicker" data-role="linga-kicker">{lead && <strong>{lead}</strong>}{rest}</div>;
}

/** The screen's one caption slot: the rule, the caption's own label beside it, then the sentence. */
export function Caption({ tag, text }: { tag: string; text: string }) {
  return <div className="lo-caption linga-caption" data-role="linga-caption">
    <div className="lo-rule"><i/>{tag && <span>{tag}</span>}</div>
    <div aria-live="polite">{text}</div>
  </div>;
}

/** A card holding one sentence in Georgia under an uppercase label: the sentence to take with you, a line said. */
export function SentenceCard({ label, text, role = "linga-sentence", className = "" }: { label: string; text: string; role?: string; className?: string }) {
  return <div className={`lo-card ${className}`} data-role={role}>
    <div className="lo-card-label">{label}</div>
    <div className={`lo-card-text${text.length > 200 ? " lo-xlong" : text.length > 110 ? " lo-long" : text.length > 60 ? " lo-mid" : ""}`}>{text}</div>
  </div>;
}

/** A band and its name as a small data line: the badge and the words. */
export function DataLine({ children }: { children: ReactNode }) { return <div className="lo-data">{children}</div>; }

/** The level as a picture: six steps rising from A1 to C2, the learner's step lit and flagged. */
export function BandSteps({ band }: { band: Band }) {
  const here = BANDS.indexOf(band);
  return <div className="lo-steps linga-ladder" data-role="linga-steps">
    {BANDS.map((b, i) => <div key={b} className="lo-step" data-reached={i <= here} data-here={i === here} style={{ height: `${34 + i * 13}%` }}>
      {i === here && <svg className="lo-flag" viewBox="0 0 60 90" aria-hidden="true" focusable="false"><path d="M10 88V6" stroke="#5d3548" strokeWidth="7" strokeLinecap="round"/><path d="M13 8l42 15-42 15Z" fill="#b65e61"/></svg>}
      <b>{b}</b><small>{BAND_NAME[b]}</small>
    </div>)}
  </div>;
}

/** Speaking progress as stepping stones: four marks on a dashed path, the reached ones filled, the last one warm. */
export function Stones({ progress }: { progress: Progress }) {
  const at = PROGRESS_ORDER.indexOf(progress);
  return <div className="lo-stones linga-track" data-role="linga-track">
    {PROGRESS_ORDER.map((id, i) => <div key={id} data-reached={i <= at} data-here={i === at}><i/>{PROGRESS_LABEL[id]}</div>)}
  </div>;
}

/** The footer's progress marks: done, the current one, the ones still open. Decoration for the tag beside it. */
export function Dots({ dots }: { dots: Dot[] }) {
  return <div className="lo-dots" aria-hidden="true">{dots.map((d, i) => <i key={i} data-dot={d}/>)}</div>;
}

/** The arrow a focused action shows, and the phone badge on an action whose next step is speaking on the phone. */
export const Arrow = () => <svg className="lo-arrow" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><path d="M7 23L23 7M11 7h12v12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const OnYourPhone = () => <svg className="lo-phone" viewBox="0 0 300 44" aria-hidden="true" focusable="false">
  <rect x="7" y="2" width="22" height="39" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M14 7h8M15 35h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18 14v11m-4-7v4m8-4v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  <text x="298" y="30" textAnchor="end" fill="currentColor">ON YOUR PHONE</text>
</svg>;
