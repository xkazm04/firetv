"""
Pointing at something in a frame, by drawing on it.

Reference is the hard part of asking a model about a picture: "what is *that*" is unanswerable
unless the model and the person agree on "that". Text cannot fix it — "the one on the left" is
ambiguous the moment there are three — and coordinates are not something a person can say out loud.
A mark burned into the pixels can, and this is the measured version of that (lessons §4):

  - without a mark, asked which object was "in the circle", the model answered about something
    else entirely
  - with a ring drawn in, correct every time, including two subjects ~50 px apart on real footage
  - it once used a circle a third party had drawn in the source image, unprompted and correctly

Which matters here because the companion app already draws circles. The gesture the user is making
anyway is the grounding.

    python vision/point.py --frame page.jpg --at 0.4,0.6 --ask "What is this?"
    python vision/point.py --frame page.jpg --at 0.4,0.6 --ask "..." --compare

`--compare` asks the same question with and without the mark, which is the only way to see what the
mark bought.
"""
import argparse
import os
import tempfile

from PIL import Image, ImageDraw

from vlm import ask, b64

RING = (255, 212, 0)  # the companion app's default pen colour


def mark(frame, at, radius_frac=0.06, colour=RING):
    """
    Burn a ring into a copy of the frame, the way the TV overlay would have drawn it.

    Thickness is not cosmetic: the model downscales the image before looking at it, and a hairline
    ring disappears in the resize. An invisible pointer is worse than none, because the prompt
    still tells the model one is there.
    """
    img = Image.open(frame).convert("RGB")
    w, h = img.size
    cx, cy = at[0] * w, at[1] * h
    r = radius_frac * w
    d = ImageDraw.Draw(img)
    for i in range(5):
        d.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=colour)
    out = os.path.join(tempfile.gettempdir(), "marked_" + os.path.basename(frame))
    img.save(out, quality=92)
    return out


def ask_about_mark(frame, at, question, radius=0.06):
    """The prompt half of the technique: name the mark, and allow 'nothing is there'."""
    marked = mark(frame, at, radius)
    prompt = (
        f"A yellow circle has been drawn on this image to point at one thing. {question} "
        "Answer about what is inside the yellow circle only. If nothing is inside the circle, say "
        "so plainly rather than guessing."
    )
    return marked, ask([b64(marked)], prompt)


def main(a):
    at = tuple(float(x) for x in a.at.split(","))

    if a.compare:
        print("WITHOUT the mark — same question, no pointer")
        out, dt = ask([b64(a.frame)], a.ask)
        print(f"  {dt:.1f}s  {out.strip()[:500]}\n")

    marked, (out, dt) = ask_about_mark(a.frame, at, a.ask, a.radius)
    print(f"WITH the mark ({marked})")
    print(f"  {dt:.1f}s  {out.strip()[:700]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--frame", required=True)
    ap.add_argument("--at", required=True, help="centre as x,y fractions, e.g. 0.4,0.6")
    ap.add_argument("--radius", type=float, default=0.06, help="radius as a fraction of width")
    ap.add_argument("--ask", required=True)
    ap.add_argument("--compare", action="store_true")
    main(ap.parse_args())
