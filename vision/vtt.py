"""
YouTube captions → timestamped text, de-overlapped.

YouTube's rolling auto-captions repeat the tail of each cue at the head of the next, so a naive
join has roughly twice the real words. Dedupe at WORD level: for each cue, drop the longest prefix
that matches the end of what we already have. (Algorithm from gravitone-gcloud's parse_vtt.py; the
words-per-minute check is its sanity test — over ~280 wpm means the de-overlap failed, not that
the speaker is fast.)

    from vtt import stamped
    cues = stamped("lesson.en.vtt")   # [{"t": seconds, "text": "..."}]
"""
import io
import re


def _raw_cues(path):
    raw = io.open(path, encoding="utf-8").read()
    ts = re.compile(r"^(\d\d):(\d\d):(\d\d)\.(\d\d\d) --> ")
    out, cur, buf = [], None, []
    for ln in raw.splitlines():
        m = ts.match(ln)
        if m:
            if cur is not None and buf:
                out.append((cur, " ".join(buf)))
            h, mi, s, _ = map(int, m.groups())
            cur, buf = h * 3600 + mi * 60 + s, []
            continue
        if ln.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")) or not ln.strip():
            continue
        t = re.sub(r"<[^>]+>", "", ln).replace("&nbsp;", " ")
        t = re.sub(r"\s+", " ", t).strip()
        if t:
            buf.append(t)
    if cur is not None and buf:
        out.append((cur, " ".join(buf)))
    return out


def stamped(path):
    words, out = [], []
    for t, text in _raw_cues(path):
        w = text.split()
        k = min(len(words), len(w), 40)
        overlap = 0
        while k > 0:
            if words[-k:] == w[:k]:
                overlap = k
                break
            k -= 1
        new = w[overlap:]
        if new:
            out.append({"t": t, "text": " ".join(new)})
            words.extend(new)
    return out


def windows(cues, seconds=40):
    """Group cues into fixed windows — the unit a retrieval hit jumps the video to."""
    out, cur, start = [], [], None
    for c in cues:
        if start is None:
            start = c["t"]
        if c["t"] - start >= seconds and cur:
            out.append({"t": start, "text": " ".join(cur)})
            cur, start = [], c["t"]
        cur.append(c["text"])
    if cur:
        out.append({"t": start, "text": " ".join(cur)})
    return out


def wpm(cues, duration_s):
    return sum(len(c["text"].split()) for c in cues) / max(duration_s, 1) * 60
