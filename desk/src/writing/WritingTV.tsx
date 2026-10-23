"use client";
/**
 * Writing on the TV (docs/concepts/TV-WRITING-SCREEN-2026-10-21.md), drawn in the On Air shell: the prompt list, then the
 * chosen prompt with its progress, the coaching note once the phone's paragraph is read, and the saved line once the
 * revision is. Nothing typed is shown here: the phone owns the text (the `writing` ask, app/phone/WritingPanel.tsx).
 * The stops are tv/writingScreen.ts's, walked by tv/keys.ts; this file only draws them.
 */
import type { Session } from "@/lib/session/store";
import { promptById } from "@/lib/writing/prompts";
import { stopAt } from "@/tv/keys";
import { phoneActionLabel, writingAskOf, writingDone, writingLine, writingPhase, writingPrompts, writingStops, WRITING_STEPS } from "@/tv/writingScreen";

/** The caption sits on the stage's lower edge, as On Air's other captions do, so the lower half is not left empty (stick walk 2026-10-23); a tall screen (the note) only pushes it down as before. */
const COLUMN = { display: "flex", flexDirection: "column" } as const, CAPTION = { marginTop: "auto", paddingTop: 30 } as const;

const ACTION_WORDS = { another: { k: "Start over", t: "Another prompt", d: "Back to the list. Nothing is saved until the revision is." } } as const;

export function WritingTV({ s }: { s: Session }) {
  const ph = writingPhase(s), stops = writingStops(s), at = stopAt(stops, s.focus);
  if (ph === "list") {
    const prompts = writingPrompts(s), lit = prompts.find((p) => p.id === at);
    return (<>
      <div className="band band-corner" />
      <main className="content-full" data-role="writing-tv" data-phase="list" style={COLUMN}>
        <div className="eyebrow">Writing · one paragraph, one note</div>
        <div className="title">Pick a prompt</div>
        <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.max(2, prompts.length)}, 1fr)`, marginTop: 150 }}>
          {prompts.map((p, i) => (
            <div key={p.id} className="card" data-role="writing-prompt" data-prompt={p.id} data-focused={at === p.id}>
              <div className="k">Prompt {i + 1}</div>
              <div className="t">{p.title}</div>
            </div>
          ))}
        </div>
        <div style={CAPTION}>
          <span className="cap">{lit ? lit.title : "Writing"}</span>
          <div className="cap-text" data-role="writing-caption" aria-live="polite">{lit ? lit.ask : writingLine(s)} Select to pick it. Back goes to Essay Master.</div>
        </div>
      </main>
    </>);
  }
  const ep = s.writingTv!, prompt = promptById(ep.promptId), done = writingDone(s), ask = writingAskOf(s);
  return (<>
    <div className="band band-corner" />
    <main className="content-full" data-role="writing-tv" data-phase={ph} data-asking={ask ? ask.phase : undefined} data-busy={ep.busy || undefined} style={COLUMN}>
      <div className="eyebrow">Writing · {prompt?.title ?? "your prompt"}</div>
      <div className="cap-text" data-role="writing-ask" style={{ maxWidth: 1180, fontSize: 40, lineHeight: 1.3, marginTop: 18 }}>{prompt?.ask}</div>
      <ol data-role="writing-progress" aria-label="Progress" style={{ display: "flex", gap: 28, listStyle: "none", padding: 0, margin: "34px 0 0", fontSize: 30 }}>
        {WRITING_STEPS.map((w, i) => (
          <li key={w} data-done={i < done || undefined} style={{ display: "flex", alignItems: "center", gap: 12, opacity: i < done || i === done ? 1 : 0.55 }}>
            <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 13, border: "3px solid currentColor", background: i < done ? "currentColor" : "transparent" }} />
            {w}{i < done ? <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> (done)</span> : null}
          </li>
        ))}
      </ol>
      {ep.note && (
        <div data-role="writing-note" style={{ marginTop: 38, maxWidth: 1500, borderLeft: "10px solid #c9a8ff", padding: "14px 0 14px 30px" }}>
          <div className="eyebrow">The note</div>
          <div style={{ fontSize: 46, lineHeight: 1.3, marginTop: 8 }}>{ep.note}</div>
        </div>
      )}
      <div className="cards" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 1300, marginTop: 40 }}>
        {stops.map((st) => st === "phone"
          ? <div key={st} className="card" data-role="writing-action" data-action={st} data-focused={at === st}>
              <div className="k">On the phone</div><div className="t">{phoneActionLabel(s)}</div>
              <div className="d">{ask ? (ask.phase === "sent" ? "Sent. The desk has it." : "The phone has it now.") : "Select hands the typing to the phone."}</div>
            </div>
          : <div key={st} className="card" data-role="writing-action" data-action={st} data-focused={at === st}>
              <div className="k">{ACTION_WORDS.another.k}</div><div className="t">{ph === "finished" ? "Write another" : ACTION_WORDS.another.t}</div>
              <div className="d">{ph === "finished" ? "Pick the next prompt." : ACTION_WORDS.another.d}</div>
            </div>)}
      </div>
      <div style={CAPTION}>
        <span className="cap">{ph === "finished" ? "Saved" : ph === "coached" ? "Coached" : "Your turn"}</span>
        <div className="cap-text" data-role="writing-caption" aria-live="polite">{writingLine(s)}</div>
      </div>
    </main>
  </>);
}
