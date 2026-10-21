# light.py <video.mp4>...: per frame, the share of the stage above the shelf (top 75%) that is light and flat
# (min(R,G,B) > 200: paper cream #f6ecd9 or white). Prints the runs of frames over 0.6 with their start time and length.
import subprocess, sys, os
import numpy as np
W, H = 240, 135
for v in sys.argv[1:]:
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vsync", "0", "-vf", f"setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
    ts = [float(x.split(",")[0]) for x in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "frame=pts_time", "-of", "csv=p=0", v], capture_output=True, text=True).stdout.split()]
    raw = np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W, 3)
    top = raw[:, : int(H * 0.75)]
    light = (top.min(axis=3) > 200).mean(axis=(1, 2))
    white = (raw.min(axis=3) > 235).mean(axis=(1, 2))
    runs, cur = [], None
    for i, s in enumerate(light):
        if s > 0.6:
            if cur is None: cur = [i, i]
            else: cur[1] = i
        elif cur is not None: runs.append(cur); cur = None
    if cur is not None: runs.append(cur)
    end = ts[-1] if ts else 0
    desc = []
    for a, b in runs:
        t0 = ts[a]; t1 = ts[b + 1] if b + 1 < len(ts) else end
        desc.append(f"frames {a}-{b} at {t0:.2f}s for {1000*(t1-t0):.0f} ms (light {light[a:b+1].max():.2f})")
    print(f"{os.path.basename(v)}: {len(raw)} frames; max white {white.max():.3f}; light-flat runs: " + ("; ".join(desc) if desc else "none"))
