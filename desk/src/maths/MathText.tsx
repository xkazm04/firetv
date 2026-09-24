/**
 * One line of maths, set in a Lamplight voice: `hand` is the learner's working (Caveat, in ink, a drawn minus,
 * drawn ∫ π ≤ ≥ √ where a handwriting face has none), `print` is a question as printed on the sheet (Fraunces,
 * italic variables). Stacked fractions, powers, subscripts and the desk's pen marks inside the line, by kind:
 * a flipped sign is ringed, an extra part struck, a missing part opens a gap with a caret; a mark the data can
 * only place on a line underlines the line. Reads with typeset.ts; if anything in it fails, the raw string is
 * shown in the same voice - never an exception, never a dropped character.
 */
import { Component, Fragment, type ReactNode } from "react";
import { markLine, parseMath, type LineMarkSpec, type MNode } from "./typeset";

export type Voice = "hand" | "print";

/** The ring every teacher draws: one loop, open at the end (the winner's path, on a 200 x 110 box). */
const RING = "M18 30 C 40 6, 150 4, 186 26 C 204 44, 190 90, 120 100 C 60 106, 10 96, 8 62 C 6 44, 16 32, 34 24";
const Mk = ({ cls, d, box = "0 0 200 110", children }: { cls: string; d?: string; box?: string; children?: ReactNode }) => (
  <svg className={`mk ${cls}`} viewBox={box} preserveAspectRatio="none" aria-hidden="true">{d && <path d={d} />}{children}</svg>
);

const GLYPH = {
  int: {
    hand: <svg className="gl int" viewBox="0 0 34 120" aria-hidden="true"><path strokeWidth="6.4" d="M30 12 C 27 4, 19 3, 17.5 14 C 15.8 30, 18.6 70, 16.4 96 C 15.4 110, 9 117, 3.6 109" /></svg>,
    print: <svg className="gl int" viewBox="0 0 34 120" aria-hidden="true"><path strokeWidth="3.6" d="M29 11 C 27 4, 20.5 4.5, 19.4 14 C 17.6 34, 17.4 72, 15.2 98 C 14.2 110, 8 115, 4 109" /><circle cx="29.6" cy="11.4" r="3.4" /><circle cx="4.2" cy="108.6" r="3.4" /></svg>,
  },
  pi: <svg className="gl pi" viewBox="0 0 50 44" aria-hidden="true"><path strokeWidth="7.4" d="M3 12 C 14 8.5, 32 9.5, 47.5 6.5 M16.5 11.5 C 16.8 23, 14.6 33, 8.6 42 M33.5 10.5 C 32.6 22, 33.6 33, 41.6 41" /></svg>,
  le: <svg className="gl le" viewBox="0 0 44 60" aria-hidden="true"><path strokeWidth="5.2" d="M38 6 L7 22.5 L38 37 M7 52 C 17 50, 28 51.5, 39 49.5" /></svg>,
  ge: <svg className="gl le" viewBox="0 0 44 60" aria-hidden="true"><path strokeWidth="5.2" d="M6 6 L37 22.5 L6 37 M5 52 C 15 50, 26 51.5, 37 49.5" /></svg>,
  root: <svg className="gl root" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true"><path strokeWidth="5" d="M2 62 L11 55 L21 96 L38 3" /></svg>,
};

/** The desk's tick, drawn in its orange pen after a line (or a question) that holds. */
export function Tick({ className }: { className?: string }) {
  return <span className={`tick ${className ?? ""}`} data-role="maths-tick"><svg viewBox="0 0 60 50" aria-hidden="true"><path d="M6 27 L22 42 L54 6" /></svg></span>;
}

interface St { prev: string | null }
const OP_BEFORE_UNARY = /^(bin|rel|open|punct|sp|text)$/;

function nodes(list: MNode[], voice: Voice, st: St, key = ""): ReactNode[] {
  return list.map((n, k) => node(n, voice, st, `${key}${k}.`));
}
function node(n: MNode, voice: Voice, st: St, key: string): ReactNode {
  const prev = st.prev;
  let el: ReactNode = null;
  switch (n.t) {
    case "num": el = <span className="mn">{n.v}</span>; break;
    case "var": el = <span className="mi">{n.v}</span>; break;
    case "ord": el = n.v ? <span className="mn">{n.v}</span> : null; break;
    case "bin": {
      const un = !prev || OP_BEFORE_UNARY.test(prev);
      const g = n.v === "−" && voice === "hand" ? <b className="mm" aria-label="minus" /> : n.v;
      el = n.flag
        ? <span className={`mo ${un ? "un" : "bin"} flag`}><span className="err k-sign" data-role="maths-error" data-kind="sign" aria-label="the wrong sign">{g}<Mk cls="wash" d={`${RING} Z`} /><Mk cls="pen ring" d={RING} /></span></span>
        : <span className={`mo ${un ? "un" : "bin"}`}>{g}</span>;
      break;
    }
    case "rel": el = <span className={`mo rel${n.v === "=" ? " eq" : ""}`}>{voice === "hand" && n.v === "≤" ? GLYPH.le : voice === "hand" && n.v === "≥" ? GLYPH.ge : n.v}</span>; break;
    case "open": case "close": el = <span className={`md${n.big ? " big" : ""}`}>{n.v}</span>; break;
    case "punct": el = <span className="mpu">{n.v}</span>; break;
    case "text": el = <span className="mt">{n.v}</span>; break;
    case "int": el = <span className="mint" aria-label="integral">{GLYPH.int[voice]}</span>; break;
    case "fn": el = <span className="mfn">{n.v}</span>; break;
    case "sym": el = n.v === "π" && voice === "hand" ? <span className="mi" aria-label="pi">{GLYPH.pi}</span> : <span className="mi">{n.v}</span>; break;
    case "sp": el = <span className="msp" style={n.w < 0 ? { marginLeft: `${n.w}em` } : { width: `${n.w}em` }} />; break;
    case "frac":
      el = (
        <span className={`mf ${n.small ? "s" : "l"}`} data-role="maths-frac">
          <span className="fnu">{nodes(n.num, voice, { prev: null }, key + "n")}</span>
          <span className="fb" />
          <span className="fde">{nodes(n.den, voice, { prev: null }, key + "d")}</span>
        </span>
      );
      break;
    case "grp": el = <span className="mg">{nodes(n.body, voice, st, key + "g")}</span>; break;
    case "sqrt": el = <span className="msq">{voice === "hand" ? GLYPH.root : <span className="msq-s">√</span>}<span className="msq-b">{nodes(n.body, voice, { prev: null }, key + "r")}</span></span>; break;
  }
  if (n.sup || n.sub) {
    el = (
      <span className="msc">
        {el}
        {n.sub && <span className="sub">{nodes(n.sub, voice, { prev: null }, key + "b")}</span>}
        {n.sup && <span className={`sup${n.t === "close" ? " hi" : ""}`}>{nodes(n.sup, voice, { prev: null }, key + "p")}</span>}
      </span>
    );
  }
  // a group leaves the state where its last node did; anything else is now the node before the next one
  if (n.t !== "grp") st.prev = n.t === "ord" ? "num" : n.t;
  return <Fragment key={key}>{el}</Fragment>;
}

/** The part of a line the pen is about, with its mark drawn over it by kind. */
function marked(line: string, voice: Voice, mark: LineMarkSpec): ReactNode {
  const m = markLine(line, mark);
  const st: St = { prev: null };
  if (m.kind === "line") {
    return (
      <span className="err k-line" data-role="maths-error" data-kind="line" aria-label="look again at this line">
        {nodes(m.nodes, voice, st, "l")}
        <Mk cls="pen wave" box="0 0 200 20" d="M2 10 C 14 2, 22 18, 34 10 S 56 2, 68 10 S 90 18, 102 10 S 124 2, 136 10 S 158 18, 170 10 S 190 4, 198 9" />
      </span>
    );
  }
  const pre = nodes(m.pre, voice, st, "a");
  if (m.kind === "sign") {
    const hasFlag = m.mid.some((n) => n.t === "bin" && n.flag);
    const mid = nodes(m.mid, voice, st, "b");
    return <>{pre}{hasFlag ? mid : <span className="err k-sign" data-role="maths-error" data-kind="sign" aria-label="the wrong sign"><span className="inner">{mid}</span><Mk cls="pen ring" d={RING} /></span>}{nodes(m.post, voice, st, "c")}</>;
  }
  if (m.kind === "extra") {
    return <>{pre}<span className="err k-extra" data-role="maths-error" data-kind="extra" aria-label="this should not be here"><span className="inner">{nodes(m.mid, voice, st, "b")}</span><Mk cls="pen strike" box="0 0 200 100" d="M-8 76 C 60 72, 140 60, 208 48" /></span>{nodes(m.post, voice, st, "c")}</>;
  }
  // missing: a light bracket under the part it belongs next to, then the gap - an empty box and a caret, never the thing itself
  return (
    <>
      {pre}
      <span className="err k-missing" data-role="maths-error" data-kind="missing" aria-label="something is missing next to this">
        <span className="inner">{nodes(m.mid, voice, st, "b")}</span>
        <Mk cls="pen thin under" box="0 0 200 30" d="M3 4 C 2 16, 6 22, 16 22 L 184 21 C 196 21, 198 16, 197 4" />
      </span>
      {nodes(m.trail, voice, st, "t")}
      <span className="slot" data-role="maths-gap" aria-hidden="true">
        <Mk cls="pen dash box" box="0 0 100 50" d="M8 3 C 40 1, 70 4, 94 2 C 99 3, 99 8, 98 14 L 99 38 C 99 46, 95 48, 88 48 L 8 49 C 2 49, 1 45, 2 38 L 1 10 C 2 4, 4 3, 8 3" />
        <Mk cls="pen caret" box="0 0 60 40" d="M8 36 L30 6 L52 35" />
      </span>
      {nodes(m.post, voice, st, "c")}
    </>
  );
}

/** Draws the line; a failure anywhere in it shows the raw string in the same voice instead. */
class Safe extends Component<{ raw: string; voice: Voice; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(prev: { raw: string }) { if (prev.raw !== this.props.raw && this.state.failed) this.setState({ failed: false }); }
  render() { return this.state.failed ? <span className="mt">{this.props.raw}</span> : this.props.children; }
}

export interface MathTextProps {
  text: string;
  voice: Voice;
  /** The desk's mark inside this line: the kind, and the part of the line it is about when the data names one. */
  mark?: LineMarkSpec | null;
  className?: string;
}

export function MathText({ text, voice, mark, className }: MathTextProps) {
  const raw = String(text ?? "");
  let body: ReactNode;
  try { body = mark ? marked(raw, voice, mark) : nodes(parseMath(raw), voice, { prev: null }); }
  catch { body = <span className="mt">{raw}</span>; }
  return (
    <span className={`mx ${voice}${className ? " " + className : ""}`} data-role={voice === "hand" ? "maths-hand" : "maths-print"} aria-label={raw}>
      <Safe raw={raw} voice={voice}>{body}</Safe>
    </span>
  );
}
