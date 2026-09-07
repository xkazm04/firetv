# Study Desk — screen inventory for the HTML/CSS prototype

**Date:** 2026-09-07 · the modelling checkpoint after [STUDY-DESK-POC-RESULTS.md](STUDY-DESK-POC-RESULTS.md).
Nothing here is built yet. This is the list to argue with before it is.

**Bar, as agreed:** prototypes reflect the Fire TV app interface, high visual quality, but above all
*working* — every screen wired to the flows that passed the PoCs, D-pad navigable, with the phone
page beside it. Cloud calls are stubbed behind the same interface they will have later (no AWS yet).

---

## 1. The constraints the TV imposes

From Amazon's [design and UX guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html)
and [display and layout](https://developer.amazon.com/docs/fire-tv/display-and-layout.html) docs,
numbers as stated:

| Rule | Value | What it means for us |
|---|---|---|
| Design target | **1920 × 1080**, rendered as 960 × 540 dp at xhdpi | the prototype is a 1920×1080 page; everything in dp × 2 |
| Safe zone | nothing in the **outer 5%** of any edge | 96 px side margins, 54 px top/bottom, hard |
| Body text minimum | **14 sp ≈ 28 px at 1080p** | our body is 32 px; the worksheet's *own* text must be rendered at ≥ 28 px, which is why a page is shown one problem-band at a time, not whole |
| System font | Helvetica Neue Regular | Helvetica Neue / Arial stack; system-native look |
| Input | **D-pad only** — Up/Down/Left/Right/Select/Back/Menu/Play-Pause | every screen is a focus graph; no hover, no scroll wheel, no pointer |
| Focus | must be **unmistakable** at 3 m; Select shows a momentary pressed state | 4 px light ring + 1.06 scale + lift; pressed = 0.97 scale for 120 ms |
| Colour | less saturated; **cool over warm**; TV contrast is higher than a monitor's | deep slate ground, muted blue accent, warm colour reserved for the *hint* and the *timer* so they read as the living things on screen |
| Density | low; horizontal content rows; global nav on the left | one job per screen; the left rail is the session's spine |
| Text entry | system keyboard is painful | the TV never asks for typing — the phone does it |

**The rule that shapes the product most:** *the TV never asks for typing.* Anything that needs a
camera, a keyboard, a microphone or a finger happens on the phone. The TV shows, the phone does.

## 2. Two surfaces, one session

```
TV (Fire OS app, D-pad)                         Phone (PWA served by the TV, no install)
┌──────────────────────────────────┐            ┌──────────────────────┐
│ rail │  the big shared view      │  ws://     │ camera · pen · text  │
│      │  page · hint · lesson     │◀──────────▶│ the student's hands  │
│      │  timer · task board       │  state     │ (and the parent's)   │
└──────────────────────────────────┘            └──────────────────────┘
```

Both already exist in the telestrator: pairing by QR + PIN, the WebSocket, the pen, the frame
thumbnail back to the phone, the state heartbeat. The prototype reuses that contract and changes
what travels over it: a *page* instead of a video frame, a *hint* instead of a stroke document.

## 3. TV screens

Each: what it is for · what is on it · what the D-pad does · what state feeds it.

### T0 · Pair
Shown until a phone connects. QR + 4-digit PIN, centred; one line of instruction. The only screen
with nothing in the rail. *Reuses the pairing card as is.*

### T1 · Tonight
The session's home. Left rail: learner name, subject chips (Maths · Essay · Spanish*), timer.
Content: **tonight's task board** — assignment cards in a horizontal row, each with subject, title,
estimated minutes, done/not. Focus moves along the row; Select opens the task; Menu marks done.
Below the row, one quiet line: *"Point your phone at the page to begin."*
*Feeds:* task list (from the phone, or seeded), timer state, learner profile.

### T2 · Page
The heart. The captured worksheet fills the content area — **one problem band at a time**, so the
printed text lands ≥ 28 px; Up/Down moves between problems (bands) and the current one is the
focused element; Left/Right pages through the multi-page stack. A page strip along the bottom
shows thumbnails of captured pages with the current one highlighted. The rail shows subject, page
n/N, timer, and a "hint" affordance that lights when a problem is focused.
*Feeds:* OCR result (items with numbers and bands), circle from the phone (sets focus to that
item and lights the hint affordance), page stack.
*Reading state:* a 25-second read is real; the band shows the photo immediately, greyed, with a
"reading…" progress line, and items become focusable as they arrive.

### T3 · Hint
Opened from a focused problem (Select, or the phone's circle + ask). The problem sits at the top,
large, exactly as printed; the hint below it in the warm colour, spoken via TTS as it appears.
Two actions in a row: **"Still stuck"** (escalates — hint 2, which must go one step further) and
**"Show me the lesson"** (T4, only if retrieval found one). Back returns to the page with the
hint kept in a side panel so the student can work with it visible.
*Feeds:* hint 1 / hint 2 from the tutor stub; retrieval result (or *"no lesson covers this"*,
which is a first-class state, not an error).

### T4 · Lesson
The video player with the retrieved lesson **already seeked to the segment**; a one-line "why
this" above it (*"Factoring quadratics — chosen because your problem needs to factor x² + 7x +
12"*), concept card on the rail (from the transcript pipeline). Play/Pause, Left/Right skip 10 s,
Back returns to the hint. Pause + circle from the phone = pause-and-ask on the frame.
*Feeds:* lesson id + timestamp + concept card; the frame path for pause-and-ask.

### T5 · Break
The timer's other face. When a work block ends: full-screen, calm, the break countdown, what's
next. Select skips the break; Back does nothing (a break you can't accidentally cancel).
*Feeds:* timer.

### T6 · Recap
End of session. What was covered (problems touched, hints used, lessons watched), time on task,
"where it was hard" (the problems that needed hint 2 — the honest version of the mistake journal,
since answers are not checked). One button: **"Send to parent"** → phone. *Feeds:* session log.

### T3-es · Hint, Spanish variant — *B′ passed; in scope.*
Same screen as T3 with one addition: the **rule card** the resolver produced is shown as a real
object beside the hint — *marker → tense → person*, with the irregularity warning if any — and it
stays on the page panel afterwards. It never shows the ending; it names the row of the student's
chart. This is the whole point of the design and it is what makes the TV version different from a
phone app that just prints *iremos*.

## 4. Phone screens

Deliberately few, deliberately plain — the phone is the instrument.

### P0 · Join — scan, PIN, done. *Exists.*
### P1 · Capture — camera view, "snap page" button, page counter; after a snap, the thumbnail
and "add another page". Also a **"use the camera as a document camera"** toggle that re-snaps
every few seconds while the student writes (the continuous-capture idea from the scope doc).
### P2 · Point & ask — the captured page as a thumbnail (the existing frame mirror), the circle
tool (existing), a one-line question box, a mic button (stubbed: types instead). Sends
`{page, region, question}`.
### P3 · Tonight — add/edit tasks, mark done; the timer's start/pause. The keyboard lives here.
### P4 · Parent — the recap when it arrives; nothing else.

## 5. Flows the prototype must actually run

1. **Cold start:** T0 → phone P0 → T1 (seeded tasks) → P1 snap → T2 shows page, reads, items
   become focusable.
2. **Stuck:** T2 focus problem 3 → Select → T3 hint 1 (TTS) → "Still stuck" → hint 2 → "Show me
   the lesson" → T4 seeked → Back → Back → T2 with hint panel.
3. **Point from the phone:** P2 circle problem 7 + "why is this negative?" → T2 focus jumps to 7
   → T3 with the question shown above the hint.
4. **No lesson:** a problem the library does not cover → T3 shows *"no lesson covers this yet"*
   as a calm state, not a failure.
5. **Timer:** T1 start 25 min → T5 break → back to T2 where it was.
6. **Recap:** end → T6 → "Send to parent" → P4.

## 6. What is stubbed, and how honestly

| Stub | Behaviour | Real thing later |
|---|---|---|
| OCR | the PoC's rendered pages and their known items; a fake 3-second "reading…" | Bedrock vision, ~5 s; local model, 25 s |
| Tutor | the PoC's logged hints for the 12 maths + 4 essay problems, served by problem id | Bedrock text |
| Retrieval | the PoC's syllabus-pick results, incl. the two *none* cases | same code, bigger library |
| TTS | browser `speechSynthesis` | Polly / ElevenLabs |
| Voice in | typed | Transcribe |

Stubbing with *real PoC output* rather than lorem ipsum matters: the screens get judged against
what the model actually says, including its LaTeX and its length.

## 7. Open before building

- **Whole page vs. problem band** on T2: the 28 px rule forces bands for a full worksheet; is a
  zoomed-out whole-page view still wanted as the "overview" state?
- **Rail always visible, or collapses during T2/T4** to give the page the full width?
- **Parent on their own phone (P2 pointing), or is one phone enough for the prototype?**
