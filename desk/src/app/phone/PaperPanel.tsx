"use client";
/**
 * The phone's Paper panel (v2 M5b): the marks of a paper the learner sat, typed in - one row per question: its number as
 * the paper prints it, the marks scored, what it was out of, and the statements it tests, picked from a list that shows
 * each statement's `can` text. The rows go through the desk's own validation (rules/paperEntry -> rules/recovery
 * cleanPaper) as they are typed, so every row the desk would leave out is shown here with its reason, and are then sent
 * through the session door (POST /api/session, `paper.enter`), where the same validation decides what is kept.
 */
import { blankRow, canOf, entryOf, isBlank, rawOf, statementChoices, MOST_PICKS, type DraftRow } from "@/lib/rules/paperEntry";
import type { Event } from "@/lib/session/store";

const CHOICES = statementChoices();

export function PaperPanel({ rows, setRows, post, seated, status, kept }: {
  rows: DraftRow[]; setRows: (r: DraftRow[]) => void; post: (e: Event) => Promise<Response>; seated: boolean; status: string; kept: boolean;
}) {
  const e = entryOf(rows);
  const set = (i: number, patch: Partial<DraftRow>) => setRows(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const pick = (i: number, code: string) => {
    const has = rows[i].codes.includes(code);
    set(i, { codes: has ? rows[i].codes.filter((c) => c !== code) : [...rows[i].codes, code] });
  };
  const typed = rows.filter((r) => !isBlank(r)).length;
  return <div className="pscreen" data-role="phone-paper"><h3>A paper you sat</h3>
    <p>One row for each question, numbered as the paper numbers it. Pick what the question tests, so the desk can find where the marks went.</p>
    {rows.map((r, i) => <div className="ppaper-row" key={i} data-role="paper-row">
      <div className="field">
        <input aria-label="Question number" placeholder="Question, e.g. 5(b)" value={r.q} maxLength={24} onChange={(x) => set(i, { q: x.target.value })} />
        <input aria-label="Marks scored" placeholder="Scored" inputMode="numeric" value={r.marks} onChange={(x) => set(i, { marks: x.target.value })} />
        <input aria-label="Marks it was out of" placeholder="Out of" inputMode="numeric" value={r.outOf} onChange={(x) => set(i, { outOf: x.target.value })} />
      </div>
      <details className="ppaper-pick">
        <summary>{r.codes.length ? `Tests: ${r.codes.map(canOf).filter(Boolean).join("; ")}` : "What does it test? (pick up to " + MOST_PICKS + ")"}</summary>
        {CHOICES.map((g) => <fieldset key={g.area}><legend>{g.name}</legend>
          {g.items.map((c) => <label key={c.code} data-picked={r.codes.includes(c.code) || undefined}>
            <input type="checkbox" checked={r.codes.includes(c.code)} onChange={() => pick(i, c.code)} />
            <span>{c.can}{c.foundation ? "" : " (beyond a Foundation paper)"}</span></label>)}
        </fieldset>)}
      </details>
      {rows.length > 1 && <button className="plink" onClick={() => setRows(rows.filter((_, k) => k !== i))}>Remove this question</button>}
    </div>)}
    <button className="pbtn" data-secondary="true" onClick={() => setRows([...rows, blankRow()])}>Add a question</button>
    {typed > 0 && e.drops.length > 0 && <div className="ppaper-drops" data-role="paper-drops" role="status"><b>Left out</b>
      <ul>{e.drops.map((d) => <li key={d}>{d}</li>)}</ul></div>}
    {e.notes.length > 0 && <div className="ppaper-notes" data-role="paper-notes"><ul>{e.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>}
    {seated
      ? <button className="pbtn" data-signal="true" disabled={e.kept === 0} onClick={() => void post({ type: "paper.enter", rows: rawOf(rows) })} data-role="paper-send">
        {e.kept ? `Send ${e.kept} ${e.kept === 1 ? "question" : "questions"} to the TV` : "Send to the TV"}</button>
      : <p>No one is at the desk yet: choose who on the TV first.</p>}
    {seated && kept && <button className="pbtn" data-secondary="true" onClick={() => void post({ type: "nav", screen: "paper" })} data-role="paper-show">Show the last paper on the TV</button>}
    {status && <p style={{ fontSize: 12 }}>{status}</p>}
  </div>;
}
