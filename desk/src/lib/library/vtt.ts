/** YouTube captions → de-overlapped, timestamped text (word-level dedupe of rolling captions). */
export interface Cue { t: number; text: string; }

export function parseVtt(raw: string): Cue[] {
  const ts = /^(\d\d):(\d\d):(\d\d)\.(\d\d\d) --> /;
  const cues: Array<[number, string]> = [];
  let cur: number | null = null, buf: string[] = [];
  for (const ln of raw.split(/\r?\n/)) {
    const m = ln.match(ts);
    if (m) { if (cur !== null && buf.length) cues.push([cur, buf.join(" ")]); cur = +m[1] * 3600 + +m[2] * 60 + +m[3]; buf = []; continue; }
    if (/^(WEBVTT|Kind:|Language:|NOTE)/.test(ln) || !ln.trim()) continue;
    const t = ln.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (t) buf.push(t);
  }
  if (cur !== null && buf.length) cues.push([cur, buf.join(" ")]);

  const words: string[] = [], out: Cue[] = [];
  for (const [t, text] of cues) {
    const w = text.split(" ");
    let k = Math.min(words.length, w.length, 40), overlap = 0;
    while (k > 0) { if (words.slice(-k).join(" ") === w.slice(0, k).join(" ")) { overlap = k; break; } k--; }
    const fresh = w.slice(overlap);
    if (fresh.length) { out.push({ t, text: fresh.join(" ") }); words.push(...fresh); }
  }
  return out;
}

export function windows(cues: Cue[], seconds = 40): Cue[] {
  const out: Cue[] = []; let cur: string[] = [], start: number | null = null;
  for (const c of cues) {
    if (start === null) start = c.t;
    if (c.t - start >= seconds && cur.length) { out.push({ t: start, text: cur.join(" ") }); cur = []; start = c.t; }
    cur.push(c.text);
  }
  if (cur.length && start !== null) out.push({ t: start, text: cur.join(" ") });
  return out;
}
