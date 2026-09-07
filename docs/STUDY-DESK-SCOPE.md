# Study Desk — core scope, subjects, and the feasibility PoCs that come first

**Date:** 2026-09-07 · the direction chosen on the fork, after [USE-CASE-OPTIONS.md](USE-CASE-OPTIONS.md) v2.

**Process agreed.** Accepted features with *uncertain* feasibility get a separate, discardable PoC
first. Only what survives goes into product modelling, which is done as HTML/CSS prototypes that
reflect the Fire TV app interface — high visual quality, but above all a *working* interface.

---

## 1. Why a TV at all, when the phone apps are this good

The market check is unambiguous. [Photomath](https://www.bestaitools.com/tool/photomath/) (Google)
and [Gauth](https://pasqualepillitteri.it/en/news/1281/gauth-ai-review-bytedance-homework-app)
(ByteDance) point a camera at a problem and return worked steps in a second or two;
[Gauth's OCR hit 99% on printed textbook problems](https://aitoolsbakery.com/blog/photomath-vs-gauth/),
covers maths, physics, chemistry, biology and languages, and escalates to a live human tutor. **For
capture → solve, the phone wins outright and we should not compete there.**

So the three accepted capture features must earn the TV a different way. What the TV adds, and the
phone structurally cannot:

| The TV adds | Why the phone cannot |
|---|---|
| **Two people, one page.** Parent explaining and child learning look at the same thing, from the sofa, without crowding a 6-inch screen | A phone is a one-person device; the parent leaning over is the failure mode |
| **The phone becomes a document camera, not a viewer.** It stays on the desk pointed at the page; capture is continuous, the page updates as the student writes | The phone-app model is snap → look at phone → put down pen. The screen you read from is the camera you hold |
| **Distance from the distraction.** The phone is the instrument, the TV is the work; the notifications are not on the surface being studied | The homework app lives next to everything else |
| **Size for what needs it.** A geometry diagram, an essay's structure, a Spanish text with its corrections — legible from a metre away, with room to annotate | A phone shows one problem; an essay page is a scroll |
| **A stance the phone apps do not take.** Socratic: hints that withhold the answer, inside a syllabus. Photomath's product *is* the answer | The market rewards the fastest answer on a phone. A desk session rewards the slower one |

The honest corollary: **for a solo student wanting the answer, the phone is better and always will
be.** The product is for the *session* — co-learning, a syllabus, a habit — not the snap.

---

## 2. Core scope (accepted)

| Theme | In scope |
|---|---|
| **Capture** | Snap-to-TV · Circle-to-ask pointer · Multi-page session |
| **Tutoring** | Socratic mode · Voice tutor |
| **Video** | Pause-and-ask on edu video · Concept cards from transcripts · "Watch the bit that explains this" |
| **Focus** | Session timer on the TV · Tonight's task board |
| **Progress** | Parent recap · Mistake journal · Syllabus & next practice · Learner profiles |

Not in scope, and why: *Show my attempt* and *Check my work* (handwriting → correctness is the
highest-risk chain, and a confident wrong check is worse than none); *Explain it three ways* (nice,
not core); *Comprehension checkpoints* and *Flashcards* (later, once session memory exists);
*Stuck detector* (cheap, but not now).

**A dependency to name:** the *Mistake journal* was accepted while *Check my work* was not. So it
rests on the questions asked and the hints needed, not on answers checked — "asked for a hint on
negatives three sessions running" rather than "got negatives wrong". That is a weaker signal and
should be labelled as such in the product.

---

## 3. Three subjects, chosen to stress different things

| Subject | Why this one | What it stresses |
|---|---|---|
| **Maths, high school** | The subject students most need help with — and the one the phone apps own | Socratic discipline against a solver that gives the answer instantly; equation OCR |
| **Spanish** | Aim: Duolingo-quality practice, plus the TV's room for *visual feedback* on the answer | Voice in and out; showing a correction *on* the sentence rather than beside it |
| **Essay writing** | A larger text broken down analytically, AI-enhanced, on a screen big enough to see its structure | Reading a full page; structure over facts; the one subject where size is the feature |

Each PoC below runs against all three where it applies.

---

## 4. Feasibility PoCs — run first, discard what fails

| PoC | The question | Pass looks like | Subjects |
|---|---|---|---|
| **A. Worksheet OCR** | A phone photo of a page under living-room light → the right text, the right equations, and the circled region → the right problem | Printed maths transcribed with equations intact; essay page read fully; circle selects the intended item | all three |
| **B. Socratic hint quality** | Does the model give a *correct*, *useful* hint that *withholds* the answer? | On problems with known solutions: hint is right, answer not leaked, hint moves the student forward | maths first; Spanish (grammar hint); essay (structure hint) |
| **C. Problem → video segment** | From a circled problem, find the segment of a library lesson that teaches it | The retrieved segment actually explains the concept, judged by hand on a set of problem/lesson pairs | maths first |

Not run as a PoC, by decision: the voice loop (Transcribe → model → Polly). Treated as known
technology; its latency gets measured inside the prototype instead.

**Method.** All three can start local — the vision model reads, the text model hints, retrieval is
over transcripts already in the library format. Real phone photos of real pages are the one input
that cannot be synthesised honestly: a rendered worksheet with fake blur is a ceiling, not a test.

**Kill criteria, stated up front.** A fails if equations come back mangled on more than a few
problems per page — everything reads from OCR, so it cannot be "mostly fine". B fails if the model
leaks the answer or gives a wrong hint on more than one in ten. C fails if hand judgement says the
segment is off-topic more often than on.

---

## 5. After the PoCs

Product modelling as HTML/CSS prototypes in the Fire TV interface idiom: the 10-foot UI, D-pad
focus, the phone page beside it. Visual quality high, but the bar is that it *works* — every screen
wired to the flows that survived §4.
