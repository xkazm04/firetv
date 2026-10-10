"use client";
/**
 * The phone's Paper panel (v2 M5b): the marks of a paper the learner sat, typed in - one row per question: its number as
 * the paper prints it, the marks scored, what it was out of, and the statements it tests, picked from a list that shows
 * each statement's `can` text. The rows go through the desk's own validation (rules/paperEntry -> rules/recovery
 * cleanPaper) as they are typed, so every row the desk would leave out is shown here with its reason, and are then sent
 * through the session door (POST /api/session, `paper.enter`), where the same validation decides what is kept.
 */
import { useState } from "react";
import { blankRow, canOf, choicesMatching, entryOf, isBlank, rawOf, statementChoices, MOST_PICKS, type DraftRow } from "@/lib/rules/paperEntry";
import type { Event } from "@/lib/session/store";


/** The heading and the Send button name whose record the paper goes to: whoever is seated on the TV. */
export const paperHeading = (name?: string) => (name ? `A paper ${name} sat` : "A paper you sat");
export const paperSend = (kept: number, name?: string) => (kept ? `Send ${kept} ${kept === 1 ? "question" : "questions"} to ${name ? `${name}'s record` : "the TV"}` : name ? `Send to ${name}'s record` : "Send to the TV");

/** The codes of each area, whole: an area's count of picks does not shrink with the box. */
const WHOLE = new Map(statementChoices().map((g) => [g.area, g.items.map((c) => c.code)]));

/** One row's picker: the areas, each folded; a box narrows the list by words, and a pick the box hides stays picked. */
function RowPicker({ codes, pick }: { codes: string[]; pick: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const groups = choicesMatching(query);
  const typing = query.trim() !== "";
  return <details className="ppaper-pick">
    <summary>{codes.length ? `Tests: ${codes.map(canOf).filter(Boolean).join("; ")}` : "What does it test? (pick up to " + MOST_PICKS + ")"}</summary>
    <input className="ppaper-find" type="search" aria-label="Find a statement by its words" placeholder="Find by words" value={query} onChange={(x) => setQuery(x.target.value)} />
    {typing && !groups.length && <p className="ppaper-none">No statement has these words.</p>}
    {groups.map((g) => {
      const picked = (WHOLE.get(g.area) ?? []).filter((c) => codes.includes(c)).length;
      return <details key={g.area} className="ppaper-area" open={typing || undefined}>
        <summary>{g.name}{picked ? ` (${picked} picked)` : ""}</summary>
        {g.items.map((c) => <label key={c.code} data-picked={codes.includes(c.code) || undefined}>
          <input type="checkbox" checked={codes.includes(c.code)} onChange={() => pick(c.code)} />
          <span>{c.can}{c.foundation ? "" : " (a harder statement)"}</span></label>)}
      </details>;
    })}
  </details>;
}

export function PaperPanel({ rows, setRows, post, seated, status, kept, name }: {
  rows: DraftRow[]; setRows: (r: DraftRow[]) => void; post: (e: Event) => Promise<Response>; seated: boolean; status: string; kept: boolean; name?: string;
}) {
  const e = entryOf(rows);
  const set = (i: number, patch: Partial<DraftRow>) => setRows(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const pick = (i: number, code: string) => {
    const has = rows[i].codes.includes(code);
    set(i, { codes: has ? rows[i].codes.filter((c) => c !== code) : [...rows[i].codes, code] });
  };
  const typed = rows.filter((r) => !isBlank(r)).length;
  return <div className="pscreen" data-role="phone-paper"><h3>{paperHeading(name)}</h3>
    <p>One row for each question, numbered as the paper numbers it. Pick what the question tests, so the desk can find where the marks went.</p>
    {rows.map((r, i) => <div className="ppaper-row" key={i} data-role="paper-row">
      <div className="field">
        <input aria-label="Question number" placeholder="Question, e.g. 5(b)" value={r.q} maxLength={24} onChange={(x) => set(i, { q: x.target.value })} />
        <input aria-label="Marks scored" placeholder="Scored" inputMode="numeric" value={r.marks} onChange={(x) => set(i, { marks: x.target.value })} />
        <input aria-label="Marks it was out of" placeholder="Out of" inputMode="numeric" value={r.outOf} onChange={(x) => set(i, { outOf: x.target.value })} />
      </div>
      <RowPicker codes={r.codes} pick={(code) => pick(i, code)} />
      {rows.length > 1 && <button className="plink" onClick={() => setRows(rows.filter((_, k) => k !== i))}>Remove this question</button>}
    </div>)}
    <button className="pbtn" data-secondary="true" onClick={() => setRows([...rows, blankRow()])}>Add a question</button>
    {typed > 0 && e.drops.length > 0 && <div className="ppaper-drops" data-role="paper-drops" role="status"><b>Left out</b>
      <ul>{e.drops.map((d) => <li key={d}>{d}</li>)}</ul></div>}
    {e.notes.length > 0 && <div className="ppaper-notes" data-role="paper-notes"><ul>{e.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>}
    {seated
      ? <button className="pbtn" data-signal="true" disabled={e.kept === 0} onClick={() => void post({ type: "paper.enter", rows: rawOf(rows) })} data-role="paper-send">
        {paperSend(e.kept, name)}</button>
      : <p>No one is at the desk yet: choose who on the TV first.</p>}
    {seated && kept && <button className="pbtn" data-secondary="true" onClick={() => void post({ type: "nav", screen: "paper" })} data-role="paper-show">Show the last paper on the TV</button>}
    {status && <p style={{ fontSize: 12 }}>{status}</p>}
  </div>;
}
