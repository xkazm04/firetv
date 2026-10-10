/**
 * "How did you get there?" on the Practice panel: say it (hold to speak), or type it. Presentational: props only, no
 * fetch and no session. The page keeps the state and the explain() call. What is typed is sent as it is, in any language.
 */
import { EXPLAIN_TRANSCRIPT_MAX } from "@/lib/rules/saidValue";

export type ExplainTalkProps = {
  micOk: boolean; holding: boolean; heard: string; reply: string; busy: boolean;
  typed: string; typing: boolean;
  onHoldStart: () => void; onHoldEnd: () => void;
  onSendHeard: () => void; onTryAgain: () => void;
  onTyped: (text: string) => void; onOpenTyping: () => void; onCloseTyping: () => void;
  onSendTyped: () => void; onClearTyped: () => void;
};

export function ExplainTalk(p: ExplainTalkProps) {
  const typedBox = <>
    <div className="field"><textarea value={p.typed} maxLength={EXPLAIN_TRANSCRIPT_MAX} onChange={(e) => p.onTyped(e.target.value)} placeholder="What did you do first?" aria-label="How did you get there? Type it in your own words" /></div>
    <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={p.onSendTyped} disabled={p.busy || !p.typed.trim()}>Send</button>
      {p.micOk
        ? <button className="pbtn" data-secondary="true" onClick={p.onCloseTyping}>Use the microphone</button>
        : <button className="pbtn" data-secondary="true" onClick={p.onClearTyped}>Try again</button>}</div>
  </>;
  return <div className="ptalk">
    <b>How did you get there?</b>
    {p.reply ? <><p className="said">{p.reply}</p><p>The TV has it.</p></> : null}
    {p.heard ? <>
      <p>I heard: “{p.heard}”</p>
      <div className="field"><button className="pbtn" data-signal="true" style={{ flex: 1 }} onClick={p.onSendHeard} disabled={p.busy}>Send</button>
        <button className="pbtn" data-secondary="true" onClick={p.onTryAgain}>Try again</button></div>
    </> : !p.micOk ? <>
      <p>The microphone is not available in this browser. Type it instead.</p>
      {typedBox}
    </> : p.typing ? typedBox : <>
      <div className="field">
        <button className="phold" data-holding={p.holding} style={{ flex: 1 }} onPointerDown={p.onHoldStart} onPointerUp={p.onHoldEnd} onPointerLeave={p.onHoldEnd} onPointerCancel={p.onHoldEnd} onContextMenu={(e) => e.preventDefault()}>
          {p.holding ? "Listening… let go when you are done" : "Tell the desk how you got it"}</button>
        <button className="pbtn" data-secondary="true" onClick={p.onOpenTyping}>Type it</button></div>
      <p style={{ fontSize: 12 }}>Hold the button, say what you did, let go. Or type it.</p>
    </>}
  </div>;
}
