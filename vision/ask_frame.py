"""
The link between the telestrator and the model: can a drawn circle tell the model WHICH player the
viewer means?

This matters more than it looks. Visual question answering falls over on reference — "why is HE
offside" is unanswerable unless the model and the viewer agree on who "he" is. Text cannot fix it
("the player on the left" is ambiguous with eleven of them), and coordinates are not something a
viewer can speak. But our companion app already draws circles on the frame, and a circle is an
unambiguous pointer that costs the viewer one gesture they were making anyway.

So the question is narrow and testable: does burning the annotation into the pixels change what the
model talks about?

    python vision/ask_frame.py --frame F.jpg --at 0.62,0.58 --ask "What is this player doing?"
    python vision/ask_frame.py --frame F.jpg --at 0.62,0.58 --ask "..." --compare

`--compare` runs the same question with and without the circle, which is the only way to know the
circle did anything.
"""
import argparse
import os
import tempfile

from PIL import Image, ImageDraw

from probe import ask, b64

RING = (255, 212, 0)  # the companion app's default pen colour


def circle(frame, at, radius_frac=0.06):
    """Burn a ring into the frame, exactly as the TV overlay would have drawn it."""
    img = Image.open(frame).convert("RGB")
    w, h = img.size
    cx, cy = at[0] * w, at[1] * h
    r = radius_frac * w
    d = ImageDraw.Draw(img)
    # Thick enough to survive the model's downscaling; a hairline ring vanishes into the resize.
    for i in range(5):
        d.ellipse([cx - r + i, cy - r + i, cx + r - i, cy + r - i], outline=RING)
    out = os.path.join(tempfile.gettempdir(), "marked_" + os.path.basename(frame))
    img.save(out, quality=92)
    return out


def main(a):
    at = tuple(float(x) for x in a.at.split(","))
    marked = circle(a.frame, at, a.radius)
    print(f"marked frame: {marked}\n")

    if a.compare:
        print("WITHOUT the circle — the same question, no pointer")
        out, dt = ask([b64(a.frame)], a.ask)
        print(f"  {dt:.1f}s  {out.strip()[:500]}\n")

    prompt = (
        f"A yellow circle has been drawn on this sports frame by a viewer to point at one player. "
        f"{a.ask} Answer about the player inside the yellow circle only. If nothing is inside the "
        f"circle, say so plainly rather than guessing."
    )
    print("WITH the circle")
    out, dt = ask([b64(marked)], prompt)
    print(f"  {dt:.1f}s  {out.strip()[:700]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--frame", required=True)
    ap.add_argument("--at", required=True, help="circle centre as x,y fractions e.g. 0.62,0.58")
    ap.add_argument("--radius", type=float, default=0.06, help="radius as a fraction of width")
    ap.add_argument("--ask", required=True)
    ap.add_argument("--compare", action="store_true")
    main(ap.parse_args())
