/** YouTube captions → de-overlapped, timestamped text (word-level dedupe of rolling captions). */
export interface Cue { t: number; text: string; }

export function parseVtt(raw: string): Cue[] {
  // the hours are optional in WebVTT (mm:ss.ttt); YouTube always writes them
  const ts = /^(?:(\d+):)?(\d\d):(\d\d)\.(\d\d\d) --> /;
  const cues: Array<[number, string]> = [];
  let cur: number | null = null, buf: string[] = [];
  // a cue identifier is the line just before a timing line, itself the first line after a blank one: it is not caption
  // text. A line YouTube leaves blank-looking inside a cue (" ") is followed by text, never by a timing line.
  // a NOTE, STYLE or REGION block starts after a blank line and runs to the next one: none of it is caption text
  let blankBefore = true, pushedLast = false, afterBlank = false, inBlock = false;
  for (const ln of raw.split(/\r?\n/)) {
    const m = inBlock ? null : ln.match(ts);
    if (m) {
      if (pushedLast && afterBlank) buf.pop();
      if (cur !== null && buf.length) cues.push([cur, buf.join(" ")]);
      cur = +(m[1] ?? 0) * 3600 + +m[2] * 60 + +m[3]; buf = []; blankBefore = false; pushedLast = false; continue;
    }
    if (!ln.trim()) { blankBefore = true; pushedLast = false; inBlock = false; continue; }
    if (inBlock) continue;
    if (blankBefore && /^(NOTE|STYLE|REGION)(\s|$)/.test(ln)) { inBlock = true; pushedLast = false; continue; }
    if (/^(WEBVTT|Kind:|Language:|NOTE)/.test(ln)) { blankBefore = false; pushedLast = false; continue; }
    const t = ln.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (t) { buf.push(t); pushedLast = true; afterBlank = blankBefore; } else pushedLast = false;
    blankBefore = false;
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
