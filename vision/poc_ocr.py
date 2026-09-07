"""
PoC A — can the model read a worksheet the way a phone would photograph it, and does a circle
select the right problem?

Everything in Study Desk reads from this, so it cannot be "mostly fine" (STUDY-DESK-SCOPE §4). The
kill criterion: equations mangled on more than a few problems per page.

Synthetic first, by agreement: pages are rendered from known text, then degraded the way a phone
photo is — perspective, blur, uneven light, sensor noise, JPEG. That gives a *ceiling*. Real phone
photos dropped in artifacts/vision/desk/photos/ are the real test; `--photos` runs those and prints
what the model read, for judging by eye since there is no ground truth for them.

    python vision/poc_ocr.py             # render, degrade at three levels, read, score
    python vision/poc_ocr.py --photos    # read real photos, print, no scoring
"""
import argparse
import difflib
import glob
import json
import os
import random
import re

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

from point import mark
from vlm import ask, b64, loads

OUT = os.path.join("artifacts", "vision", "desk", "ocr")
W, H = 1654, 2339  # A4 at 200 dpi

# ---- the pages -----------------------------------------------------------------------------
# Superscripts are real typeset characters, as on a printed sheet. Ground truth is ASCII; the
# scorer normalises both sides so ² and ^2 compare equal.
MATH = [
    "Solve for x:  3x − 7 = 11",
    "Solve for x:  2x² − 5x − 3 = 0",
    "Factor completely:  x² + 7x + 12",
    "Solve the system:  2x + y = 7  and  x − y = 2",
    "Simplify:  (3x²y)(4xy³)",
    "Find the slope of the line through (2, 5) and (6, 13)",
    "Solve:  x/4 + 3 = 8",
    "A rectangle has perimeter 34 cm and width 5 cm. Find its length.",
    "Expand:  (x + 4)(x − 3)",
    "Solve for x:  5(x − 2) = 3x + 8",
]
SPANISH = [
    "Ayer yo ______ (comer) paella con mi familia.",
    "Mañana nosotros ______ (ir) al cine.",
    "Cuando era niño, ______ (jugar) al fútbol todos los días.",
    "¿Tú ______ (tener) hermanos?",
    "Ellos ______ (vivir) en Madrid desde 2019.",
    "Si ______ (llover), no saldremos.",
    "Ella ______ (escribir) una carta a su abuela la semana pasada.",
    "Nosotros ______ (querer) aprender español.",
]
ESSAY_TITLE = "Should schools start later in the morning?"
ESSAY = [
    "Many students arrive at school exhausted, and the reason is not laziness but biology. During "
    "adolescence the body's internal clock shifts later, which means a teenager who goes to bed at "
    "eleven is often not sleepy until well after midnight. An early start therefore cuts into sleep "
    "that the brain still needs.",
    "Critics argue that a later start simply pushes everything else later too: sports, part-time "
    "jobs, family dinner. This is a fair concern. However, schools that have moved their start "
    "time by even forty minutes report better attendance and fewer accidents on the drive in, "
    "which suggests the trade is worth making.",
    "The strongest evidence comes from districts that measured results before and after the "
    "change. Grades in first-period classes rose, and visits to the school nurse fell. These are "
    "not dramatic numbers, but they point in the same direction.",
    "In conclusion, starting later is not about letting teenagers sleep in. It is about matching "
    "the school day to how their bodies actually work, and the districts that tried it have not "
    "gone back.",
]


def _font(size, bold=False):
    for name in (("arialbd.ttf" if bold else "arial.ttf"), "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def render(kind):
    """Returns (image, items) where items = [{"n": number, "text": ascii, "y": centre y}]."""
    img = Image.new("RGB", (W, H), (252, 252, 250))
    d = ImageDraw.Draw(img)
    body, head = _font(38), _font(46, bold=True)
    items, y = [], 140
    if kind == "math":
        d.text((120, y), "Algebra — Exercise 4.2", font=head, fill=(20, 20, 20)); y += 110
        d.text((120, y), "Show your working. Answers alone will not receive full marks.",
               font=_font(30), fill=(70, 70, 70)); y += 100
        for i, t in enumerate(MATH, 1):
            label = f"{i}.  {t}"
            d.text((120, y), label, font=body, fill=(15, 15, 15))
            items.append({"n": i, "text": t, "y": y + 22, "x": 120 + d.textlength(label, font=body) / 2}); y += 150
    elif kind == "spanish":
        d.text((120, y), "Español — Unidad 6", font=head, fill=(20, 20, 20)); y += 110
        d.text((120, y), "Completa con la forma correcta del verbo entre paréntesis.",
               font=_font(30), fill=(70, 70, 70)); y += 100
        for i, t in enumerate(SPANISH, 1):
            label = f"{i}.  {t}"
            d.text((120, y), label, font=body, fill=(15, 15, 15))
            items.append({"n": i, "text": t, "y": y + 22, "x": 120 + d.textlength(label, font=body) / 2}); y += 170
    else:
        d.text((120, y), ESSAY_TITLE, font=head, fill=(20, 20, 20)); y += 130
        for i, para in enumerate(ESSAY, 1):
            top = y
            for line in _wrap(para, body, W - 240, d):
                d.text((120, y), line, font=body, fill=(15, 15, 15)); y += 54
            items.append({"n": i, "text": para, "y": (top + y) // 2}); y += 50
    return img, items


def _wrap(text, font, width, d):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=font) <= width:
            cur = trial
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


# ---- degrade like a phone photo --------------------------------------------------------------
LEVELS = {"clean": 0.0, "mild": 0.5, "harsh": 1.0}
PHOTO_W = 1280


def _geometry(img, rnd, amt, fill):
    """The camera's contribution: perspective and tilt. Kept separate so a point can be pushed
    through the identical transform (same seed, same draw order) to learn where it lands."""
    if amt == 0:
        return img
    w, h = img.size
    # Perspective: the phone is never square-on. Pull the corners in by up to ~6% of a side.
    j = lambda: rnd.uniform(0.0, 0.06 * amt)
    quad = (w * j(), h * j(), w * j(), h * (1 - j()), w * (1 - j()), h * (1 - j()), w * (1 - j()), h * j())
    out = img.transform((w, h), Image.QUAD, quad, resample=Image.BICUBIC, fillcolor=fill)
    return out.rotate(rnd.uniform(-2.5, 2.5) * amt, resample=Image.BICUBIC, fillcolor=fill)


def where(level, x, y, seed=1):
    """
    Where does page point (x, y) end up in the degraded photo, in photo pixels?

    The circle test must draw its ring where the item *is in the photo*, because that is what a
    user does — they circle what they see. Run 1 drew rings at the page's pre-warp coordinates,
    which on the harsh page landed between items, and the model correctly said nothing was there.
    That scored as 0/4 and was a harness bug, not a model failure.
    """
    rnd = random.Random(seed)
    dot = Image.new("L", (W, H), 0)
    ImageDraw.Draw(dot).ellipse([x - 8, y - 8, x + 8, y + 8], fill=255)
    moved = _geometry(dot, rnd, LEVELS[level], 0).resize((PHOTO_W, int(PHOTO_W * H / W)), Image.LANCZOS)
    bb = moved.getbbox()
    return ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)


def degrade(img, level, seed=1):
    rnd = random.Random(seed)
    w, h = img.size
    amt = LEVELS[level]
    out = _geometry(img, rnd, amt, (120, 110, 100))
    if amt:
        # Uneven light: a lamp on one side.
        grad = Image.radial_gradient("L").resize((w, h)).transpose(Image.FLIP_LEFT_RIGHT)
        grad = ImageChops.invert(grad).point(lambda v: int(255 - (255 - v) * 0.55 * amt))
        out = ImageChops.multiply(out, Image.merge("RGB", (grad, grad, grad)))
        out = out.filter(ImageFilter.GaussianBlur(radius=1.2 * amt))
        noise = Image.effect_noise((w, h), 18 * amt).convert("RGB")
        out = Image.blend(out, noise, 0.12 * amt)
    # A phone uploads something like this, not the 200 dpi original.
    out = out.resize((PHOTO_W, int(PHOTO_W * h / w)), Image.LANCZOS)
    path = os.path.join(OUT, f"{level}.jpg")
    out.save(path, quality=int(88 - 20 * amt))
    return path


# ---- read and score --------------------------------------------------------------------------
ITEMS_SCHEMA = {
    "type": "object",
    "properties": {"items": {"type": "array", "items": {"type": "object", "properties": {
        "number": {"type": "integer"}, "text": {"type": "string"}},
        "required": ["number", "text"]}}},
    "required": ["items"],
}
TEXT_SCHEMA = {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]}

SUP = str.maketrans({"²": "^2", "³": "^3", "−": "-", "–": "-", "×": "*", "÷": "/"})


def norm(s):
    s = s.translate(SUP).lower()
    s = re.sub(r"\s+", " ", s)
    return s.strip(" .")


def sim(a, b):
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()


def equations_intact(truth, got):
    """The characters a hint depends on: every digit, variable, operator and exponent in order."""
    keep = lambda s: re.sub(r"[^0-9a-z+\-*/=^()]", "", norm(s))
    return keep(truth) == keep(got)


def read_items(path, kind):
    what = {"math": "maths problems", "spanish": "Spanish exercise sentences"}[kind]
    out, dt = ask([b64(path)],
                  f"This is a photo of a printed worksheet. Transcribe every numbered item exactly "
                  f"as printed: the {what}, with all symbols, exponents and blanks. Write exponents "
                  f"with ^ (x^2). Keep the printed numbering. Do not solve anything.",
                  ITEMS_SCHEMA, timeout=900)
    got = loads(out) or {"items": []}
    return {i.get("number"): i.get("text", "") for i in got["items"]}, dt


def read_text(path):
    out, dt = ask([b64(path)], "This is a photo of a printed page. Transcribe the whole text "
                                "exactly, including the title. Do not summarise.", TEXT_SCHEMA, timeout=900)
    return (loads(out) or {}).get("text", ""), dt


def score_page(kind, items, path, level, report):
    if kind == "essay":
        got, dt = read_text(path)
        truth = ESSAY_TITLE + " " + " ".join(ESSAY)
        s = sim(truth, got)
        print(f"  {level:6} {dt:5.1f}s   essay similarity {s:.3f}   ({len(got.split())}/{len(truth.split())} words)")
        report.append({"kind": kind, "level": level, "similarity": round(s, 3), "seconds": round(dt, 1)})
        return
    got, dt = read_items(path, kind)
    sims, intact = [], 0
    for it in items:
        g = got.get(it["n"], "")
        sims.append(sim(it["text"], g))
        intact += equations_intact(it["text"], g) if kind == "math" else (sim(it["text"], g) > 0.9)
    mean = sum(sims) / len(sims)
    print(f"  {level:6} {dt:5.1f}s   found {len(got)}/{len(items)} items   mean similarity {mean:.3f}   "
          f"{'equations intact' if kind == 'math' else 'sentences intact'} {intact}/{len(items)}")
    worst = min(range(len(items)), key=lambda i: sims[i])
    if sims[worst] < 0.9:
        print(f"         worst #{items[worst]['n']}: want «{items[worst]['text']}»")
        print(f"                  got «{got.get(items[worst]['n'], '(missing)')}»")
    report.append({"kind": kind, "level": level, "found": len(got), "of": len(items),
                   "mean_similarity": round(mean, 3), "intact": intact, "seconds": round(dt, 1)})


CIRCLE_SCHEMA = {"type": "object", "properties": {"number": {"type": "integer"}, "text": {"type": "string"}},
                 "required": ["number", "text"]}


def circle_test(kind, items, path, level, report):
    """Does a ring around a problem select that problem? Four rings per page, at the item's centre."""
    img_w, img_h = Image.open(path).size
    hits = 0
    picks = items[:: max(1, len(items) // 4)][:4]
    for it in picks:
        # Ring where the item is in the PHOTO — what a user circling what they see would do.
        px, py = where(level, it["x"], it["y"])
        marked = mark(path, (px / img_w, py / img_h), radius_frac=0.05)
        out, dt = ask([b64(marked)],
                      "A yellow circle has been drawn on this worksheet photo to point at one numbered "
                      "item. Which printed item number is inside the circle, and what does it say? If "
                      "the circle contains no item, answer number 0.", CIRCLE_SCHEMA, timeout=600)
        got = loads(out) or {}
        ok = got.get("number") == it["n"]
        hits += ok
        if not ok:
            print(f"         circle on #{it['n']} → said #{got.get('number')}: «{str(got.get('text',''))[:60]}»")
    print(f"  {level:6}          circle selects the right item {hits}/{len(picks)}")
    report.append({"kind": kind, "level": level, "circle_hits": hits, "of": len(picks)})


def main(a):
    os.makedirs(OUT, exist_ok=True)
    if a.photos:
        for p in sorted(glob.glob(os.path.join("artifacts", "vision", "desk", "photos", "*"))):
            print(f"\n{os.path.basename(p)}")
            got, dt = read_text(p)
            print(f"  {dt:.1f}s\n  " + got[:1500].replace("\n", "\n  "))
        return
    report = []
    if a.circles_only:
        # Re-score just the pointer half, after the placement fix; pages are re-rendered
        # deterministically so nothing else changes.
        for kind in ("math", "spanish"):
            img, items = render(kind)
            print(f"\n{kind.upper()}  circle test")
            for level in ("mild", "harsh"):
                degrade(img, level)
                path = os.path.join(OUT, f"{kind}_{level}.jpg")
                os.replace(os.path.join(OUT, f"{level}.jpg"), path)
                circle_test(kind, items, path, level, report)
        json.dump(report, open(os.path.join(OUT, "report_circles.json"), "w", encoding="utf-8"), indent=1)
        return
    for kind in ("math", "spanish", "essay"):
        img, items = render(kind)
        print(f"\n{kind.upper()}  ({len(items)} items)")
        for level in ("clean", "mild", "harsh"):
            path = degrade(img, level)
            os.replace(path, os.path.join(OUT, f"{kind}_{level}.jpg"))
            path = os.path.join(OUT, f"{kind}_{level}.jpg")
            score_page(kind, items, path, level, report)
            if kind != "essay" and level != "clean":
                circle_test(kind, items, path, level, report)
    json.dump(report, open(os.path.join(OUT, "report.json"), "w", encoding="utf-8"), indent=1)
    print(f"\nreport: {OUT}/report.json   pages: {OUT}/*.jpg")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--photos", action="store_true")
    ap.add_argument("--circles-only", action="store_true", dest="circles_only")
    main(ap.parse_args())
