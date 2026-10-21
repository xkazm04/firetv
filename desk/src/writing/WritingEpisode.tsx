"use client";
/**
 * One coached writing episode on a browser page (/writing): pick a prompt, write a paragraph, read one coaching note,
 * revise once, finish. The episode steps are lib/writing/episode; the server routes under /api/writing do the coaching
 * and the saving. The seated learner is whoever sits at the desk.
 */
import { useEffect, useState } from "react";

interface PromptRow { id: string; title: string; ask: string }
type Stage = "start" | "write" | "coached" | "revised" | "finished";

async function post(path: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, data: (await r.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { ok: false, data: { error: "The desk could not be reached. Try again." } };
  }
}

export function WritingEpisode() {
  const [stage, setStage] = useState<Stage>("start");
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [prompt, setPrompt] = useState<PromptRow | null>(null);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [revision, setRevision] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/writing/prompts").then(async (r) => {
      const d = (await r.json().catch(() => ({}))) as { prompts?: PromptRow[]; error?: string };
      if (r.ok && d.prompts) setPrompts(d.prompts); else setError(d.error ?? "The prompts could not be loaded.");
    }).catch(() => setError("The desk could not be reached. Try again."));
  }, []);

  const coach = async () => {
    if (!prompt) return;
    setBusy(true); setError("");
    const r = await post("/api/writing/coach", { promptId: prompt.id, draft });
    setBusy(false);
    if (!r.ok) { setError(String(r.data.error ?? "The note could not be made.")); return; }
    setNote(String((r.data.episode as { note?: string }).note ?? ""));
    setRevision(draft);
    setStage("coached");
  };

  const finish = async () => {
    if (!prompt) return;
    setBusy(true); setError("");
    const r = await post("/api/writing/finish", { promptId: prompt.id, draft, note, revision });
    setBusy(false);
    if (!r.ok) { setError(String(r.data.error ?? "The episode was not saved.")); return; }
    setSaved(String(r.data.saved ?? ""));
    setStage("finished");
  };

  const box = { width: "100%", minHeight: 180, fontSize: 18, padding: 12, boxSizing: "border-box" as const };
  const btn = { fontSize: 18, padding: "10px 20px", marginTop: 12, cursor: "pointer" };
  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5", color: "#111", fontFamily: "var(--body)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Writing</h1>
      {error && <p role="alert" style={{ color: "#a00" }}>{error}</p>}

      {stage === "start" && (
        <section>
          <p>Pick a prompt.</p>
          {prompts.map((p) => (
            <button key={p.id} style={{ ...btn, display: "block" }} onClick={() => { setPrompt(p); setStage("write"); setError(""); }}>{p.title}</button>
          ))}
        </section>
      )}

      {prompt && stage !== "start" && <p><strong>{prompt.title}.</strong> {prompt.ask}</p>}

      {stage === "write" && (
        <section>
          <textarea aria-label="Your paragraph" style={box} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button style={btn} disabled={busy} onClick={coach}>{busy ? "Reading…" : "Get one note"}</button>
        </section>
      )}

      {(stage === "coached" || stage === "revised") && (
        <section>
          <p aria-label="Coaching note" style={{ background: "#eef", padding: 12 }}>{note}</p>
          <p>Revise your paragraph once.</p>
          <textarea aria-label="Your revision" style={box} value={revision} onChange={(e) => { setRevision(e.target.value); setStage("revised"); }} />
          <button style={btn} disabled={busy || stage !== "revised"} onClick={finish}>{busy ? "Saving…" : "Finish"}</button>
        </section>
      )}

      {stage === "finished" && (
        <section>
          <p>Done. Saved to your record: {saved}.</p>
          <button style={btn} onClick={() => { setStage("start"); setPrompt(null); setDraft(""); setNote(""); setRevision(""); setSaved(""); }}>Write another</button>
        </section>
      )}
      </div>
    </main>
  );
}
