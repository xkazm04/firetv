# Frame analysis with a local vision model — techniques worth keeping

**Date:** 2026-09-07
**Status:** the sports-analytics direction is **closed**. These are the domain-neutral lessons from
it, kept because the next use case still points a vision model at a paused frame.

Everything here was measured on this machine against `qwen3.8:27b` on Ollama (RTX 4090, 24 GB), not
read in a paper. The full sports investigation — synthetic ground-truth scenes, real broadcast
footage, a clip library, a retrieval prototype — lived in `docs/AI-VISION-FINDINGS.md` and
`vision/`, and is preserved in git at **`9db0429`** if the evidence behind any line below is ever
worth re-reading.

---

## 1. What it costs

| Input | Warm latency |
|---|---|
| 1080p, simple scene | **1–3 s** |
| A busy 720p frame (crowd, many small objects), full frame | **19–194 s** ⚠️ |
| The same frame, cropped to the region that matters | **4.8–5.7 s** |

- **First call after idle costs ~25 s** — loading 17 GB into VRAM, once, not per frame. Warm it at
  app start or the first question of a session will feel broken.
- **Scene complexity costs far more than resolution.** A 1080p test pattern answers in 1 s; a
  720p frame full of small objects took up to 194 s and returned nothing usable.
- **Cropping to the region of interest was a ~35× speed-up.** For any "point the camera at a thing"
  product, crop to the thing before asking.
- **Real-time is off the table locally.** 25 fps needs 40 ms/frame. Anything live is sparse-sampled
  or in the cloud. A *paused* frame with a human looking at it is where this technology fits.

## 2. Never ask for a number — ask for a list

Same model, same image: **1/5 correct counting**, **60/60 enumerating**.

"How many X" is one token it has to guess. "List every X" makes it attend to each in turn, and then
you take `len()` yourself. This is free accuracy and applies to every quantity question.

## 3. Good eye, unreliable narrator — so split perception from reasoning

Asked to narrate five frames it invented a detailed event that never happened and missed the one
that did. Asked what was in a *single* frame, it was essentially perfect five times running.

**The pattern that worked:**

```
per frame:   model  →  structured observation (what is here, where)
across time: code   →  differences, changes, events
anything countable or arithmetic: code, never the model
```

Applied to a known sequence, that pipeline produced the exactly-correct event description that the
model's own narration got wrong. **Arithmetic cannot hallucinate.**

## 4. A drawn mark is a working pointer

The strongest positive result, and the most reusable.

Reference is the hard part of visual question answering: "what is *that*" is unanswerable unless
the model and the user agree on "that". Text cannot fix it, and coordinates are not something a
person can express. **Drawing on the image can.**

- Without a circle, asked "which one is in the circle", it answered about a completely different
  object.
- With a ring burned into the pixels: correct, every time.
- On real footage it distinguished two subjects **~50 px apart**.
- It once used a circle that someone *else* had drawn in the source video, unprompted and
  correctly — we had not mentioned a circle existed.

**Mechanically: draw the ring several pixels thick.** A hairline vanishes when the model downscales
the frame, and an invisible pointer is worse than none, because the prompt still asserts one is
there.

## 5. It cannot see a *process* in a still frame — and will say so

Asked what action was occurring in one frame, it correctly declined: *"too blurry and the objects
are too far away… roles cannot be determined from this single frame."* Honest, and right — a
process is an event over time and one frame does not contain it.

Design consequence: never phrase a feature as "what is happening" over a still. Ask what is
*present*.

## 6. Offering the null answer restores honesty — until you show it a menu

This pair matters more than either half.

- **Open question, explicit "none" allowed, evidence demanded** → it correctly answered
  "nothing significant here" with accurate reasoning, at high confidence. Confabulation solved.
- **The same "none" option, but alongside a list of plausible categories** → it picked confidently
  from the list, three times out of three, and never used the escape hatch.

**A closed vocabulary buys accuracy on perception questions and costs honesty on interpretation
questions.** If you must offer categories, expect the model to choose one.

## 7. It cannot bind names in text to things in an image

Given a picture *and* an authoritative text describing that exact moment, and asked to point out
where each named entity was, it produced confident wrong assignments — placing a named subject onto
the wrong object entirely.

This was **not** a perception failure: asked separately to read the labels off the image, it got
every one right. It sees fine; it cannot *bind* text to pixels, and it does not know it cannot.

**So never use an external document as a grounding source.** Its legitimate uses are labels for
scoring, retrieval, and being the answer itself — none of which require the model to align text to
the image.

## 8. A schema that cannot express the answer produces a confident wrong one

An enum constrained to two values when reality had a third made the model report every instance of
the third as one of the two. The output looked exactly like a model error and was a schema error.

Prefer open strings for anything you have not fully enumerated; use enums only where the closed set
is genuinely closed. And re-read §6 before adding one.

## 9. Retrieval: expand the query, but never at a specific instance

For grounding answers in a corpus of human-written text:

- **Lay language does not embed near domain language.** A user's plain-words description of a
  concept scored **0.65** against the correct entry — *below* several rambling near-misses at 0.75.
  Having the model first write the answer it thinks is right, then searching with *that*, put the
  correct entry top at **0.90** from three independent sources. The model is guessing a *word*, not
  reading anything, and a wrong guess costs a retrieval rather than producing a false answer.
- ⚠️ **The same trick aimed at a specific instance is citation laundering.** Asked what was
  happening in a particular frame, the expansion invented a scenario, retrieval confirmed the
  invention at **0.905**, and the answer explained the frame in those terms *with citations*. Every
  component worked correctly; the question was simply never about that concept. **Citations made a
  wrong answer more convincing, not less.**

Route on the question: general → expand; about-this-instance → do not.

**Refuse in two layers.** A similarity floor *and* the model's own refusal. An entirely off-topic
question still scored **0.643** against an unrelated corpus — embeddings of jargon are never that
far apart — so the floor has to sit above the off-topic baseline, and the model's refusal is what
catches what slips through.

## 10. Operational notes

- Structured output via the API's `format` schema is enforced by the runtime, so ask for JSON that
  way rather than begging for it in the prompt. Pair with `temperature: 0`.
- Send `think: false`; retry once without it, because a model with no thinking mode rejects the key.
- Reconfigure stdout to UTF-8 on Windows. The model answers with whatever characters it likes and a
  cp1250 console raises on the first emoji instead of printing it.
- Pipe (do not inherit) stderr from CLI tools you shell out to. `adb` narrates progress on stderr
  even on success, which PowerShell turns into a terminating error.

---

## What survives in `vision/`

Two files, both domain-neutral:

| File | What |
|---|---|
| `vision/vlm.py` | The local model client — one `ask()` over Ollama with structured output, the retry, and the encoding fix. Everything else built on this. |
| `vision/point.py` | §4, as working code: burn a mark into a frame and ask about it, with `--compare` to show the difference the mark makes. |

```bash
python vision/point.py --frame page.jpg --at 0.4,0.6 --ask "What is this?" --compare
```

## Where this points next

For any product where someone points a camera at something and asks about it, the measured shape is:

1. **Crop to the subject** before asking — the single biggest lever on latency (§1).
2. **Let the user mark what they mean** — proven, and cheap for them (§4).
3. **Ask only what is present**, never what is happening (§5).
4. **Do the counting and the arithmetic in code** (§2, §3).
5. **Make "I can't read this" a first-class answer**, and do not hand it a menu (§6).

**Biggest unmeasured risk for anything text-based:** none of this tested OCR of handwriting or
printed pages under room lighting. That is the thing to measure first, before designing around it.
