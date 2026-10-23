/**
 * The Workroom on the TV (v2 T2, Adult mode): the learner's kept pieces and their twin, in Specimen's language. The TV
 * shows titles, counts, marks and level words, never a sentence of the text (the curtain, adult plan A6): the words
 * live on the PC page (/drop) and the phone. Up/Down walk the pieces; OK on one reads it on the TV (recert-6/L1-helena-46-EM5-3),
 * captioned as the lens home captions a piece being read; the one action goes to the lenses.
 */
import type { Session } from "@/lib/session/store";
import { refusalCaption } from "@/lib/rules/essay";
import { stopAt, workroomStops } from "@/tv/keys";
import { NOT_READ_LABEL, READING_LABEL, READING_PIECE } from "./captions";
import { CIT, EssayBrand as Brand } from "@/tv/marks";

const CHANNEL_WORD = { chat: "Messages", email: "Emails", generic: "Essays" } as const;
const FORMAT_WORD: Record<string, string> = { message: "Message", email: "Email", essay: "Essay" };
const MAX_PIPS = 14;

/** The last version's change as pips: kept in bone, changed in citron, added as a plus, removed as a minus. */
function Pips({ d }: { d: { kept: number; changed: number; added: number; removed: number } }) {
  const marks = [...Array(d.changed).fill("c"), ...Array(d.added).fill("a"), ...Array(d.removed).fill("r"), ...Array(d.kept).fill("k")].slice(0, MAX_PIPS);
  return <span className="em-pips" aria-label={`changed ${d.changed}, added ${d.added}, removed ${d.removed}, kept ${d.kept} sentences`}>{marks.map((m, i) => <i key={i} data-m={m} />)}</span>;
}

export function WorkroomScreen({ s, focus }: { s: Session; focus: number }) {
  const w = s.workroom;
  const stops = workroomStops(s), at = stopAt(stops, focus);
  const drop = s.phoneUrl ? s.phoneUrl.replace(/\/phone.*$/, "/drop") : "/drop";
  // a piece read from here: the reading opens on the TV when its first paragraph is back; until then, or if it is not read, the Workroom says so
  const job = s.jobs?.analyse?.key === "essay" ? s.jobs.analyse : undefined;
  const cap = job?.phase === "running" ? { label: READING_LABEL, text: READING_PIECE }
    : job?.phase === "failed" && job.error ? { label: NOT_READ_LABEL, text: job.error } : refusalCaption(s);
  return (<>
    <Brand />
    <div className="em-top"><div className="em-pill" data-role="essay-chip"><span className="em-key">MENU</span><span>Lenses</span></div>
      <div className="em-pill" data-role="essay-chip"><span className="em-av">{s.learner?.name.charAt(0)}</span><span>{s.learner?.name}</span></div></div>
    <section className="em-wr" data-role="essay-workroom">
      <div className="em-lbl">Workroom · your pieces</div>
      {w && w.pieces.length ? (
        <ol className="em-wr-list">{w.pieces.map((p) => (
          <li key={p.id} data-focused={at === p.id} data-format={p.format}>
            <span className="t">{p.title}</span>
            <span className="m"><span className="em-tag">{FORMAT_WORD[p.format] ?? p.format}</span>version {p.versions} · {p.paragraphs} paragraph{p.paragraphs === 1 ? "" : "s"}</span>
            {p.diff && <Pips d={p.diff.sentences} />}
          </li>))}
        </ol>
      ) : <p className="em-wr-empty">Nothing kept yet. On a PC, open <b>{drop}</b>, join with the code <b>{s.pin}</b>, and keep a few of your messages or emails.</p>}
    </section>
    <aside className="em-twin" data-role="essay-twin">
      <div className="em-lbl">Your twin</div>
      {w && w.channels.length ? w.channels.map((c) => (
        <div key={c.channel} className="em-twin-ch" data-born={c.born}>
          <div className="h"><b>{CHANNEL_WORD[c.channel]}</b>{c.born ? <span className="born" style={{ color: CIT }}>Born</span> : <span className="wait">{w.need - c.pieces} more to keep</span>}</div>
          {c.born && <dl>{c.words.map((x) => <div key={x.dim}><dt>{x.dim}</dt><dd>{x.word}</dd></div>)}</dl>}
        </div>
      )) : <p className="em-wr-empty">Your twin is born after {w?.need ?? 3} kept pieces of one kind: messages, emails or essays. It learns how you write; the card carries up to five of your own texts, which you review on the PC page, and never the quoted words of other people.</p>}
      {w?.born && <p className="em-wr-note">Download its card on the PC page: Twin Card 1.0, for any tool that writes in your voice.</p>}
    </aside>
    <div className="em-wr-acts"><div className="em-act" data-focused={at === "lenses"}>The lenses</div></div>
    {cap && <div className="em-caption"><div className="em-cap" key={cap.label + "|" + cap.text}><div className="em-lbl">{cap.label}</div><p>{cap.text}</p></div></div>}
  </>);
}
