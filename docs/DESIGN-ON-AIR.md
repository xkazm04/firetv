# On Air — the Study Desk design philosophy

**Chosen 2026-09-07** from five directions ([prototype/identity/variants.html](../prototype/identity/variants.html)).
Everything below is a rule the screens follow, not a mood board. Since 2026-09-24 it is the shell's language
(landing, pairing, learner, profile, break, recap): the three modules are apps with their own - Linga is
[the Open Door](DESIGN-LINGA.md), Essay Master [Specimen](DESIGN-ESSAY-MASTER.md), Math Buddy [Lamplight](DESIGN-MATH-BUDDY.md).

## The idea in one line

**The screen is a broadcast, not a menu.** A television audience already trusts the grammar of live
graphics — the lower-third, the caption, the clock, the wipe — and that grammar was built for
exactly our conditions: read from three metres, glanced at, never scrolled. Study Desk borrows it
whole. The student is *on air*; the desk is the production behind them.

It is also the only direction with a story that belongs to this project: the telestrator is where
it started, and a telestrator is a broadcast tool.

## Principles

1. **Every element is a graphic with a job.** Nothing is a container. A card that only holds
   something is not allowed; a lower-third that *names* something is. If a box cannot say what it
   is for in three words, remove it.
2. **One band per screen.** The diagonal signal-red band is the identity. It appears once, and its
   placement is the first design decision of every screen — left, right, top rule, divider, or
   absent (then red survives only as a rule and a tag). Two bands is a flag; zero bands twice in a
   row is a spreadsheet.
3. **The hint is the caption; the timer is the clock.** These two are the living elements. The
   caption is the only place body text gets the full 42 px; the clock is the only element allowed
   to be red-on-white.
4. **Condensed caps label, Barlow reads.** Labels, tags, buttons, numbers: Barlow Condensed,
   uppercase, tracked. Anything a person reads as a sentence: Barlow, sentence case, never
   condensed. Mixing them is how the screen sorts *furniture* from *content* at a glance.
5. **Red signals, white speaks, charcoal holds.** Red is for the band, tags, the pressed state and
   the one thing that needs the eye now. White is text and the focused control. Charcoal is
   everything else. A screen with red in more than three places has lost its signal.
6. **Cuts, not fades.** Motion is a wipe, a slide-in from the band's edge, a hard swap. Nothing
   dissolves and nothing floats. Under `prefers-reduced-motion`, everything is a cut.
7. **Focus is a skew and a hard shadow.** The focused control skews −6°, scales 1.04, and casts an
   offset red shadow with no blur. It cannot be missed and it cannot be mistaken for decoration.
8. **No two screens share a layout.** Same tokens, same components, different composition every
   time. A slideshow is what happens when the frame stays still and the words change; this is the
   opposite. The band moves, the grid re-flows, the lower-third changes its role.
9. **The subject gets a channel colour, and only a thin one.** Maths cyan, English amber, essay
   green — for tags, diagram strokes and the small figures. Never a surface, never a headline, and
   never instead of red.
10. **Amazon's constraints are the broadcast's too.** 5% safe zone. Nothing under 28 px. D-pad
    only; the TV never asks for typing. Low density: one job per screen.

## Tokens

```css
--ink:        #14161A;   /* charcoal ground */
--ink-2:      #1A1D22;   /* raised surface (rare) */
--paper:      #F2F3F5;   /* text, focused control */
--mute:       rgba(255,255,255,.62);
--line:       rgba(255,255,255,.14);
--signal:     #E23D28;   /* the band, tags, pressed */
--signal-2:   #B8261A;   /* band gradient end */
--tint:       #FFB4A8;   /* red's readable form on charcoal */
--maths:      #7FD1E8;   /* channel colours: tags and strokes only */
--english:    #F2C14E;
--essay:      #8FD3A1;
--display:    "Barlow Condensed", "Arial Narrow", sans-serif;
--body:       "Barlow", "Helvetica Neue", Arial, sans-serif;
```

## Type scale (1080p)

| role | face | size | case |
|---|---|---|---|
| screen title | Barlow Condensed 800 | 72 | UPPER, .02em |
| problem / headline | Barlow 500 | 52 | sentence |
| caption (the hint) | Barlow 500 | 42, line 1.35 | sentence |
| body | Barlow 400 | 32 | sentence |
| lower-third tag | Barlow Condensed 800 | 34 | UPPER, .06em |
| label / eyebrow | Barlow 600 | 20–22 | UPPER, .18em |
| button | Barlow Condensed 800 | 36 | UPPER, .06em |
| clock | Barlow Condensed 800 | 72, tabular | — |
| small figures | Barlow Condensed 600 | 26–30, tabular | — |

Nothing below 28 px except labels at 20–22 px, which are furniture and never carry meaning alone.

## Components

- **Band** — `clip-path: polygon(...)` in a signal→signal-2 gradient with a 2/6 px scanline
  overlay. Variants: left column (320–560 px wide, cut at 60%), right column, top rule (16 px),
  divider (a diagonal between two halves), bottom wedge. One per screen.
- **Lower-third** — white tag block + charcoal-glass text block with an 8 px red right edge.
  Names the thing on screen: the problem, the recommendation, the rule.
- **Caption** — red chip label above 42 px Barlow text. The hint, the explanation, the verdict.
- **Clock** — 72 px condensed, white; red-on-white only in the break screen.
- **Ticker** — a 64 px strip at the very bottom of the safe zone, condensed caps, dot-separated
  facts (`ITEM 3 OF 10 · READ IN 25 S · CIRCLED FROM THE PHONE`). Facts, never sentences.
- **Rail** — learner in condensed caps, subject list with a white left rule on the active one,
  the clock. Sits on the band when the band is left; on charcoal otherwise.
- **Card row** — horizontal row of 3–4 cards, no fills: a top rule, condensed number, Barlow
  title, a tag. The focused card skews.
- **Head-to-head** — two halves with the band as the diagonal divider. For any "A versus B"
  teaching moment.
- **Production grid** — 120 px faint grid behind everything, always. It is the studio floor.

## Composition rules

- Band placement first, then the rail, then one hero element, then the caption, then the actions.
- Actions sit on the bottom-left of the content column; never more than two.
- The hero is one of: a page band, a lower-third, a head-to-head, a card row, a step line. Not two.
- White space is not empty; it is the studio. Do not fill it.

## What On Air is not

Not a scoreboard (no big-number tiles unless the number *is* the point), not a dashboard (no
sparklines without a question), not a slide (no bullet lists on the TV — the phone can have them),
not neon (one red, no glow). And never a fade.
