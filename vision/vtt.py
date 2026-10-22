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
    """The same reading as desk's parseVtt (desk/src/lib/library/vtt.ts): keep the two in step."""
    raw = io.open(path, encoding="utf-8").read()
    # the hours are optional in WebVTT (mm:ss.ttt); YouTube always writes them
    ts = re.compile(r"^(?:(\d+):)?(\d\d):(\d\d)\.(\d\d\d) --> ")
    out, cur, buf = [], None, []
    # a cue identifier is the line just before a timing line, itself the first line after a blank one: it is
    # not caption text. A line YouTube leaves blank-looking inside a cue (" ") is followed by text, never by a timing line.
    # A NOTE, STYLE or REGION block starts after a blank line and runs to the next one: none of it is caption text.
    blank_before, pushed_last, after_blank, in_block = True, False, False, False
    note = re.compile(r"^(NOTE|STYLE|REGION)(\s|$)")
    for ln in raw.splitlines():
        m = None if in_block else ts.match(ln)
        if m:
            if pushed_last and after_blank:
                buf.pop()
            if cur is not None and buf:
                out.append((cur, " ".join(buf)))
            h, mi, s = int(m.group(1) or 0), int(m.group(2)), int(m.group(3))
            cur, buf = h * 3600 + mi * 60 + s, []
            blank_before, pushed_last = False, False
            continue
        if not ln.strip():
            blank_before, pushed_last, in_block = True, False, False
            continue
        if in_block:
            continue
        if blank_before and note.match(ln):
            in_block, pushed_last = True, False
            continue
        if ln.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
            blank_before, pushed_last = False, False
            continue
        t = re.sub(r"<[^>]+>", "", ln).replace("&nbsp;", " ")
        t = re.sub(r"\s+", " ", t).strip()
        if t:
            buf.append(t)
            pushed_last, after_blank = True, blank_before
        else:
            pushed_last = False
        blank_before = False
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
