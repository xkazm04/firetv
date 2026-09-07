# Fallback directions — v2, after market checks

**Date:** 2026-09-07 · written on a fork of the session, as a backup plan if "AI & Sports
Analytics" cannot ship at quality. The main-track fallback (coach's clipboard: human draws, AI
retrieves expert vocabulary) lives with the main track and is not listed here.

**Bar for this list, set by the review of v1:** practical, *repeated* use — not "fun once, then
deleted". The phone + TV pairing has to be *necessary*, not something an HDMI cable to a PC solves.
The Stick stays a thin client: 1.7 GB RAM, already swapping, never runs a model.

**Rejected from v1 and why.** "Ask the screen" and auto-highlights: one-time novelty. Couch Studio:
a second device that does not earn its maintenance, and a cable does most of it. Kept: party games,
pending the market check below.

What still holds from [AI-VISION-FINDINGS.md](AI-VISION-FINDINGS.md): the model is a good
*describer* (reads text, scorebugs, scenes) and a bad *measurer* and *narrator*; a drawn circle
steers it; the phone→TV stack is solid on hardware at p95 21 ms, with a LAN path and a relay path.

---

## 1. Party games, phones as controllers — kept, and the market says drop it

**What is out there.** [Jackbox](https://gamefaqs.gamespot.com/firetv/195101-the-jackbox-party-pack)
is on Fire TV at ~$30 a pack, phones joining via `jackbox.tv` and a room code — that is our
architecture, shipped years ago. [AirConsole](https://www.amazon.com/N-Dream-AG-AirConsole-Multiplayer-Console/dp/B085H7Z1XC)
is on the Amazon Appstore: scan a code, dozens of games, free tier plus $4.99/month. There are
[roundups of ten more](https://playbuzzin.com/articles/best-party-games-for-tv) and
[alternative lists](https://www.weekend.com/post/jackbox-on-fire-tv). The AI-guesses-your-drawing
twist is Google's *Quick, Draw!* from 2016.

**Verdict.** A red ocean with two funded incumbents who have solved exactly our plumbing. Our
only differentiators — lower latency on the LAN path, an AI guesser — are invisible to a player and
already done respectively. **Keep it as a demo layer if useful; do not make it the product.**

---

## 2. Movement coach on the TV — workouts, physio, and your own technique

**Pitch.** The phone is the camera, propped on the coffee table. The TV shows the trainer, the
routine, or the pro's swing; a skeleton of *you* is drawn over it, reps are counted, and the cue
comes when your knee drifts in. Three audiences, one product: home workouts, prescribed physio
exercises, and individual technique (golf swing, free-throw form) — film, play back slow, draw on it.

**Market.** Phone-camera form feedback is a real category —
[Kemtai, Onyx, ScanFit, Firefly](https://www.sensai.fit/blog/best-ai-workout-form-check-apps-2026)
call out "knees moving inward" with the measured angle — but they live on the *phone screen*. The
TV-native versions are hardware: Peloton Guide, Tempo, Mirror, hundreds of dollars. **The wedge is
TV-native with zero hardware, on the TV people already own.**

**Why the two devices are necessary.** The phone has the camera and the TV has the size. A PC does
not stand on the coffee table facing you.

**How it fits the Stick.** Pose estimation runs *on the phone*, in the browser — MediaPipe-class
models are designed for exactly that. The phone sends keypoints, ~33 points at 20–30 Hz, which is
lighter than the pen stream we already carry. The TV draws a skeleton; the overlay renderer is
built and measured. **No VLM in the loop.** Angles and rep counts are arithmetic, which cannot
hallucinate — Finding 2's lesson applied to a body instead of a pitch.

**Reuse.** Pairing, LAN transport, overlay, frame anchoring for the slow-mo playback, the pen
tools for the technique flavour. ~60%.

**New.** In-browser pose on the phone, skeleton overlay on the TV, rep/angle logic, a routine format.

**Risk.** Medium. Pose on a mid-range phone at 20 Hz is proven by the apps above; the unknown is
how good the *cues* have to be before they are useful rather than annoying. Physio is the audience
where a modest cue set is already valuable.

---

## 3. Family board and care display — the TV a relative already has, posted to from anywhere

**Pitch.** Grandmother's Fire TV shows, big and always on: today's photos from the family, a
message read aloud, the medication reminder, who is visiting Thursday. The family posts from their
phones from any city. One button on her remote sends back "I'm fine" — or nothing, and the family
sees that too.

**Market.** [Amazon retired Alexa Together](https://www.besidecare.com/blog/what-to-use-now-that-alexa-together-is-gone/)
(the $19.99/month elder-care subscription with the activity feed and remote help) and replaced it
with an emergency-assist product, leaving the daily-connection half unserved. The nearest things are
dedicated hardware — Skylight-style calendar frames and digital photo frames — bought new, at a few
hundred dollars, for a person who then has *another* screen to learn.

**Why the two devices are necessary.** The posting phone is in another house. This is the one
option where the **relay transport** — built as a hedge and never yet the point — is the product.
The TV dials out; the family meets it at the relay; nothing on the parent's network is configured.

**AI on its strengths.** Describe an incoming photo aloud for low vision ("Emma on the beach,
holding a shell") — scene description, the thing it did best on every clip. Read messages with TTS
(ElevenLabs is keyed in `gravitone-gcloud`; Fire OS has TTS built in). No measuring, no narrating.

**Reuse.** Relay transport, pairing, QR onboarding done once by the visiting child, the TV render
layer. ~50%.

**New.** A feed data model, a phone posting page, a TV feed layout that is legible from a sofa, the
"I'm fine" acknowledgement path, the relay hosted somewhere real.

**Risk.** Low–medium on tech, real on trust: a relay that carries family photos needs to be honest
about where they go. The stub relay was designed dumb — it never learns the PIN — and that design
is now a feature to state out loud.

---

## 4. Study desk — homework and tutoring on the big screen

**Pitch.** The child points the phone at the worksheet; it appears on the TV. The parent, on the
sofa, circles a problem from their own phone: *"explain this one, step by step, don't give the
answer."* The explanation arrives on the TV, spoken. Both of them are looking at the same big page
instead of crowding one phone.

**Market.** Homework-help apps are everywhere *on the phone* (photo → solution). Classroom
whiteboard-on-TV is crowded and, the research is blunt,
[phones are poor pens for it](https://www.1001tvs.com/best-screen-mirroring-apps-teachers-2026/) —
tablets win. So this is **not** a whiteboard product. The wedge is the *shared* view: two people,
one page, one explaining and one learning, which the phone-solver apps structurally cannot do.

**AI on its strengths.** Reading printed text and diagrams is description, and the circle-as-pointer
is proven. The honesty rules (offer the null answer, demand evidence) already exist and matter
here more than anywhere: "I can't read this" beats a confident wrong sum.

**Why the two devices are necessary.** Phone = camera on the desk; TV = the page big enough for two
people to look at; parent's phone = the pointer. A cable gives none of that.

**Reuse.** Circle tool, pairing, thumbnail path, the frame-to-phone mirror. ~65%.

**New.** Camera capture in the PWA, a question box, TTS, a "tutor mode" prompt that withholds
answers.

**Risk.** Medium. Maths OCR from a phone photo under living-room light is the unknown; the
1–3 s answer latency is fine on a page that is not going anywhere.

---

## 5. Reading buddy — the child reads to the TV

**Pitch.** The book's text is on the TV in large type. The phone, on the arm of the sofa, listens.
As the child reads, the words light up; a stumble gets a gentle hint; the hard word gets sounded
out. Parents get the "read 12 minutes, 4 new words" note afterwards.

**Why it is here.** Daily, practical, and every parent of a five-to-eight-year-old does the
underlying thing already. The TV earns its place because reading *together* on a sofa wants big
text at a distance, not a phone held between two heads.

**How it fits the Stick.** Speech recognition runs off the TV — on the phone in-browser for short
utterances, or streamed over the existing socket to the PC/cloud for Whisper-class accuracy. The TV
only highlights words. Deterministic alignment of heard words to known text, no VLM at all.

**Reuse.** Transport, pairing, TV text rendering. ~35% — the lowest here; the audio stack is new.

**New.** Microphone capture in the PWA, ASR, word alignment, a small library of leveled texts (public
domain is plentiful for early readers).

**Risk.** Medium–high, and honestly stated: child speech is the hardest ASR case, and the whole
experience is the accuracy of that one step. It is on the list because the *value* is unarguable,
not because the tech is safe.

---

## How they compare

| | repeated use | phone+TV necessary? | Stick stays thin? | reuse | risk |
|---|---|---|---|---|---|
| 1. Party games | yes | yes | yes | ~90% | low — **but owned by incumbents** |
| 2. Movement coach | daily | yes (camera) | yes — pose on phone | ~60% | medium |
| 3. Family & care board | daily | yes (remote) | yes | ~50% | low–med, trust |
| 4. Study desk | weekly | yes (camera + pointer) | yes | ~65% | medium |
| 5. Reading buddy | daily | yes (mic + big text) | yes | ~35% | med–high |

**Where I would put the bet:** **3** is the only one with a market gap you can point at — Amazon
itself vacated it — and it is the only one where the relay path, already built and tested, is the
whole product rather than a hedge. **2** has the broadest pull and the cleanest "each device does
what it is cheap at" story. **4** is the safest technically and the most on-strength for the model.

**What the three share,** and what none of v1 had: the second device brings a *sensor or a remote
presence* the TV cannot have — a camera, a microphone, a person in another city. That is the test
for whether the pairing is necessary, and it is worth applying to any option that comes after these.
