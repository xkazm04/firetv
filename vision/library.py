"""
The clip library: coach-breakdown videos, stored as timestamped transcripts.

Why transcripts and not video. A breakdown channel's commentary is expert analysis already aligned
to the second — "Curry sets a cross screen for Draymond", "now this is screening the screener" —
which is precisely the labelled data this problem is short of, and precisely what the pixels do not
give us. It is also small, text, and ours to keep, where the video is large and rights-encumbered.
So the library stores words by default and fetches frames only when a specific moment is being
studied (`add --frames`).

    python vision/library.py add https://www.youtube.com/watch?v=...
    python vision/library.py add <url> --frames 24,37,52     # also pull those seconds
    python vision/library.py list
    python vision/library.py show <video_id> --around 24     # transcript around a moment

Everything lands in artifacts/vision/library/ , which is gitignored: it is third-party content.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

# Paths are anchored to the repo root, not the working directory: these scripts are run
# from the repo root and from vision/ about equally often.
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, "artifacts", "vision", "library")
INDEX = os.path.join(ROOT, "clips.json")

# --- VTT de-overlap ---------------------------------------------------------
# Ported from gravitone-gcloud's knowledge/templates/*/steps/01-script/corpus/parse_vtt.py, which
# had already solved this: YouTube rolling captions repeat the tail of the previous cue at the head
# of the next, so a line-level dedupe leaves roughly twice the real word count. Dedupe at WORD
# level instead — for each cue, find the longest suffix of what we have that prefixes this cue.
#
# Sanity check the result with words-per-minute. Over ~280 wpm means the de-overlap failed, not
# that the speaker is fast; that rule has caught this going wrong more than once.


def _cues(path):
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
        t = re.sub(r"<[^>]+>", "", ln)
        t = t.replace("[&nbsp;__&nbsp;]", "[bleep]").replace("&nbsp;", " ")
        t = re.sub(r"\s+", " ", t).strip()
        if t:
            buf.append(t)
    if cur is not None and buf:
        out.append((cur, " ".join(buf)))
    return out


def _deoverlap(cues):
    stamped, words = [], []
    for t, text in cues:
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
            stamped.append({"t": t, "text": " ".join(new)})
            words.extend(new)
    return stamped, words


def _yt(args, timeout=300):
    r = subprocess.run(["yt-dlp", *args], capture_output=True, text=True, timeout=timeout)
    return r.stdout.strip(), r.returncode


def _index():
    if os.path.exists(INDEX):
        return json.load(open(INDEX, encoding="utf-8"))
    return {"clips": []}


def _save_index(idx):
    os.makedirs(ROOT, exist_ok=True)
    json.dump(idx, open(INDEX, "w", encoding="utf-8"), indent=2)


def add(url, frame_seconds=None, sport="basketball"):
    fields = "%(id)s\t%(title)s\t%(uploader)s\t%(duration)s\t%(upload_date)s\t%(license)s"
    out, code = _yt(["--skip-download", "--print", fields, url])
    if code or not out:
        raise SystemExit(f"could not read {url}")
    vid, title, uploader, duration, upload_date, license_ = (out.splitlines()[-1].split("\t") + [""] * 6)[:6]

    d = os.path.join(ROOT, vid)
    os.makedirs(d, exist_ok=True)

    _yt(["--skip-download", "--write-auto-sub", "--write-sub", "--sub-lang", "en.*",
         "--sub-format", "vtt", "-o", os.path.join(d, "%(id)s.%(ext)s"), url])
    vtt = next((os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith(".vtt")), None)
    if not vtt:
        raise SystemExit(f"{vid}: no English captions; skipping (a clip with no words teaches nothing)")

    stamped, words = _deoverlap(_cues(vtt))
    secs = max(int(duration or 0), 1)
    wpm = len(words) / secs * 60

    json.dump(stamped, open(os.path.join(d, "transcript.json"), "w", encoding="utf-8"), indent=1)
    io.open(os.path.join(d, "transcript.txt"), "w", encoding="utf-8").write(" ".join(words))

    entry = {
        "id": vid, "title": title, "uploader": uploader, "sport": sport,
        "duration_s": int(duration or 0), "upload_date": upload_date, "license": license_,
        "url": url, "words": len(words), "wpm": round(wpm), "cues": len(stamped),
        "frames": [],
    }

    if frame_seconds:
        entry["frames"] = _pull_frames(url, d, frame_seconds)

    idx = _index()
    idx["clips"] = [c for c in idx["clips"] if c["id"] != vid] + [entry]
    _save_index(idx)

    warn = "  ⚠ de-overlap likely FAILED (>280 wpm)" if wpm > 280 else ""
    print(f"added {vid}  {uploader} — {title[:55]}")
    print(f"  {len(words)} words / {secs}s = {wpm:.0f} wpm{warn}   {len(stamped)} cues")
    if entry["frames"]:
        print(f"  frames: {', '.join(str(f['t']) + 's' for f in entry['frames'])}")
    return entry


def _pull_frames(url, d, seconds):
    """Fetch only the seconds asked for. One download spanning them, then exact-time stills."""
    lo, hi = max(0, min(seconds) - 2), max(seconds) + 3
    video = os.path.join(d, "clip.mp4")
    _, code = _yt(["-f", "bv*[height<=720]+ba/b[height<=720]/b", "--merge-output-format", "mp4",
                   "--download-sections", f"*{lo}-{hi}", "-o", video, url], timeout=900)
    if code or not os.path.exists(video):
        print("  (frame download failed; transcript kept)")
        return []
    fdir = os.path.join(d, "frames")
    os.makedirs(fdir, exist_ok=True)
    got = []
    for t in seconds:
        path = os.path.join(fdir, f"t{t}.jpg")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t - lo), "-i", video,
                        "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "3", path], check=False)
        if os.path.exists(path):
            got.append({"t": t, "file": os.path.relpath(path, ROOT)})
    return got


def show(vid, around=None, window=15):
    d = os.path.join(ROOT, vid)
    stamped = json.load(open(os.path.join(d, "transcript.json"), encoding="utf-8"))
    for c in stamped:
        if around is not None and abs(c["t"] - around) > window:
            continue
        print(f"  [{c['t']//60:02d}:{c['t']%60:02d}] {c['text']}")


def listing():
    idx = _index()
    if not idx["clips"]:
        print("library is empty")
        return
    total = sum(c["words"] for c in idx["clips"])
    print(f"{len(idx['clips'])} clips, {total} words\n")
    for c in sorted(idx["clips"], key=lambda c: c["uploader"]):
        flag = " ⚠" if c["wpm"] > 280 else ""
        print(f"  {c['id']}  {c['sport']:10} {c['uploader'][:22]:22} "
              f"{c['duration_s']:5}s  {c['words']:5}w  {c['wpm']:3}wpm{flag}  {c['title'][:44]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add"); a.add_argument("url"); a.add_argument("--frames"); a.add_argument("--sport", default="basketball")
    sub.add_parser("list")
    sh = sub.add_parser("show"); sh.add_argument("id"); sh.add_argument("--around", type=int); sh.add_argument("--window", type=int, default=15)
    args = ap.parse_args()

    if args.cmd == "add":
        secs = [int(x) for x in args.frames.split(",")] if args.frames else None
        add(args.url, secs, args.sport)
    elif args.cmd == "list":
        listing()
    else:
        show(args.id, args.around, args.window)
