"use client";
/**
 * The last screen, when a page throws while it draws (error-handling: crash-capture). It says the desk hit a fault and
 * offers one thing to do; it never shows the error's text (it can carry an answer, and withholding is the product),
 * and it tells the server where it happened so the operator learns of it (/api/fault). On Air: charcoal holds, white
 * speaks, one red rule; nothing under 28 px; the TV never asks for typing - one button, focused.
 */
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const where = typeof location === "undefined" ? "" : location.pathname;
    fetch("/api/fault", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ where, name: error.name, digest: error.digest ?? null }) })
      .catch(() => { /* the desk is down too: the server log has the request failures, and this screen still offers the reload */ });
  }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#14161A", color: "#F2F3F5", display: "grid", placeItems: "center", fontFamily: '"Barlow", "Helvetica Neue", Arial, sans-serif' }}>
        <main style={{ padding: "5vh 5vw", maxWidth: "60ch" }}>
          <div style={{ fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif', fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 28, borderLeft: "8px solid #E23D28", paddingLeft: 16 }}>The desk hit a fault</div>
          <p style={{ fontSize: 32, lineHeight: 1.3, margin: "24px 0 32px" }}>Nothing you saved is lost. Reload to carry on.</p>
          <button autoFocus onClick={() => { reset(); location.reload(); }} style={{ fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif', fontWeight: 800, fontSize: 32, textTransform: "uppercase", padding: "12px 28px", background: "#F2F3F5", color: "#14161A", border: 0, transform: "skewX(-8deg)", boxShadow: "6px 6px 0 #E23D28", cursor: "pointer" }}>Reload</button>
        </main>
      </body>
    </html>
  );
}
