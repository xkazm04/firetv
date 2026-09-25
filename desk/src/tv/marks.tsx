/**
 * The apps' marks and Essay Master's arrow, drawn wherever an app is named: its own screens (maths/MathsTV.tsx,
 * essay/EssayTV.tsx), the landing's desk (landing/LandingTV.tsx) and the recap's tiles (tv/screens.tsx). A leaf:
 * it imports nothing of the shell or the modules, so each side draws them without importing the other. Linga's
 * mark lives with its design (english/OpenDoor.tsx), which is a leaf already.
 */

/** Essay Master's citron and bone (design/essay-specimen.css). */
export const CIT = "#DCFF4E", BONE = "#EEE9E0";

/** Math Buddy's mark: an equals sign whose lower bar steps forward, on an orange rounded square. */
export function MathsMark() {
  return (
    <div className="mb-mark" data-role="maths-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs><radialGradient id="mb-mark-glow" cx=".28" cy=".22" r="1"><stop offset="0" stopColor="#FFEBC4" /><stop offset=".45" stopColor="#FFC56B" /><stop offset="1" stopColor="#E8891F" /></radialGradient></defs>
        <rect x="1" y="1" width="62" height="62" rx="17" fill="url(#mb-mark-glow)" />
        <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" fill="none" stroke="rgba(255,255,255,.45)" />
        <rect x="11" y="19" width="28" height="8.5" rx="4.25" fill="#1A1D38" />
        <path d="M25.25 34 H41 V41.5 H53 a4.25 4.25 0 0 1 0 8.5 H37 a4.25 4.25 0 0 1 -4.25 -4.25 V42.5 H25.25 a4.25 4.25 0 0 1 0 -8.5 Z" fill="#1A1D38" />
      </svg>
    </div>
  );
}

/** Essay Master's mark: a whole E with the citron caret after it. */
export function EssayBrand() {
  return (
    <header className="em-brand" data-role="essay-mark">
      <svg className="em-mark" viewBox="0 0 64 72" aria-hidden="true"><path fill={BONE} d="M4 6h40v12H17v12h23v12H17v12h27v12H4z" /><rect x="52" y="1" width="8" height="70" fill={CIT} /></svg>
      <div className="em-wm">ESSAY<b>MASTER</b></div>
    </header>
  );
}

/** An arrow the length of a sentence: with the side the paragraph takes, or (against) pointing back at it. */
export function EssayArrow({ len, against, color, h = 28, className }: { len: number; against?: boolean; color: string; h?: number; className?: string }) {
  const y = h / 2, t = 7, head = h * 0.62;
  const d = against
    ? `M${len} ${y - t / 2}H${head}V1L0 ${y}L${head} ${h - 1}V${y + t / 2}H${len}z`
    : `M0 ${y - t / 2}H${len - head}V1L${len} ${y}L${len - head} ${h - 1}V${y + t / 2}H0z`;
  return <svg className={className} width={len} height={h} viewBox={`0 0 ${len} ${h}`} aria-hidden="true"><path d={d} fill={color} /></svg>;
}
