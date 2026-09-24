# The Open Door: Linga's design language

**Chosen 2026-09-24** in the Linga landing contest (round 2, entry C, variant 2), in the owner's words:
*"Artstyle with large potential to illustrate lessons and different topics."* It won on its topic page, where
an arch opens onto a fully illustrated hotel lobby with Robin the receptionist. That illustration style is what
the product bought, and everything below exists to protect it. Linga is now its own app. Its TV screens use the
Open Door; the rest of Study Desk (Math Buddy, the landing, pairing) stays [On Air](DESIGN-ON-AIR.md).

## The idea in one line

**A conversation is a place you step into.** Every Linga screen is a doorway: an arch on a plinth with the
situation behind it, and beside it the few words you need to walk in. The arch shows a different world on each
screen; the way in always looks the same.

## Principles

1. **The picture carries the lesson.** Each of the eight situations has its own illustrated place with its
   partner facing the learner. A plan topic without a picture of its own borrows the one that practises the
   same skill. If an illustration looks generic, fix the illustration; don't add words.
2. **One arch per screen, on the left.** The right side holds the words: overline, Georgia title, the rule, the
   caption, what the screen holds (a sentence card, choices, stepping stones), then the actions. When a screen
   needs the width (the level ladder, the row of topic doors, the menu), the arch gives way to that picture,
   which then stands on the same plinth or uses the same door shape.
3. **Georgia speaks, Arial works.** Titles, sentences to say and anything a partner says are Georgia. Labels,
   captions, buttons and the footer are Arial. A sentence you might say out loud is always Georgia.
4. **Warm ground, plum ink, peach light.** Cream is the room, plum is what you can touch (frame, focus, badge),
   and wine marks labels and the rule. Peach and amber are light: the glow behind a figure, and the current
   step or dot.
5. **Focus is a filled door.** The focused action fills with dark plum and cream text, slides 13 px (8 px in a
   grid) and gets a soft plum ring and shadow. Exactly one control looks like that. When nothing is focused yet
   (a conversation or the level check opens that way), the first action shows a heavier outline instead: that
   is what Enter will run.
6. **One caption slot.** The caption sits under a 120 px rule with its own label beside it (YOUR TURN,
   PREPARING, TRY AGAIN). It is the only place explanatory sentences go, about 25–40 words of body text per
   screen. A verdict is a picture: the steps, the stones, the star-burst.
7. **Quiet motion.** Actions ease over .18 s and nothing else moves. Under `prefers-reduced-motion`, nothing
   moves at all.
8. **Ten-foot law.** 1920 × 1080 stage, 5% safe zone, nothing under 28 px except 20–22 px uppercase labels that
   never carry meaning alone. D-pad only. The phone is where you type and speak.

## Tokens

```css
--lo-ground: #eee9dd;  --lo-ground-glow: #fbf4e6;  /* radial glow at 23% 53%, then #f5eee1 → #e5dccd */
--lo-ink: #261f29;                                  /* titles */
--lo-plum: #41273d;                                 /* the focused action */
--lo-plum-ink: #372532;  --lo-plum-line: #6b4953;   /* actions at rest */
--lo-plum-deep: #493147;                            /* badge, name tag text, footer place */
--lo-frame: #6a3946;  --lo-plinth: #5d3548;  --lo-plinth-lip: #ad766c;  --lo-shadow: #6e283c;
--lo-mark: #8b3f50;                                 /* the speech-bubble mark */
--lo-overline: #a64d4d;  --lo-label: #9c4d55;  --lo-rule: #bb675b;  --lo-quote: #b45d61;  --lo-dot: #913e4c;
--lo-amber: #d89367;  --lo-glow: #f6d0a2;  --lo-arch-fill: #d89475;
--lo-cream: #fff8e8;  --lo-card: #fff9ec;  --lo-card-line: #d6c5af;  --lo-tag: #fff3dc;
--lo-caption: #5a5051;  --lo-data: #423238;  --lo-sentence: #3f2a3c;  --lo-muted: #775f5d;  --lo-line: #bcaca1;
--lo-serif: Georgia, "Times New Roman", serif;
--lo-sans: Arial, Helvetica, sans-serif;
```

The illustration palette is `desk/src/english/art/palette.ts`: plums `#432d43`–`#6d4252`, wine and rose
`#803b51`–`#bb675b`, peach and amber `#d89475`–`#f6d0a2`, creams `#f9dfb1`–`#fff3dc`, one leaf green `#6c7560`,
four skin tones and four hair tones.

## Type scale (1080p)

| role | face | size | notes |
|---|---|---|---|
| wordmark | Georgia bold | 45 | −2 px tracking, beside the 59 px mark |
| title | Georgia 400 | 78 (82 on home) | −2.7 px, line 1.08; 66 then 56 as it gets longer |
| sentence card, partner line | Georgia | 41 | 38, 33, 30 as the line gets longer |
| choice, quoted "you said" | Georgia | 34–40 | |
| caption | Arial | 32 (33 on home) | line 1.3, `#5a5051` |
| action | Arial 800 | 31 (primary 34) | sentence case |
| name tag, data line, footer | Arial 700–800 | 28–29 | footer uppercase, 1 px tracking |
| overline, card label, rule label | Arial 900 | 22 | uppercase, 3–4 px tracking; a leading band is 28 px plum |

## Components

- **Arch**: 773 × 756 door, radius 390 px across the top, 19 px `--lo-frame` border, an inner 12 px cream ring,
  a blurred wine shadow, on a 25 px plinth with a 15 px lip. It comes in two versions. *Situation*: the picture
  fills the door edge to edge and a cream name tag sits bottom-left. *State*: the warm gradient `#c78069 →
  #ffdaa4`, a ring of light, a wine hill, the line A WAY INTO ENGLISH, a 510 × 440 symbol, and the tag as cream
  text beside a lit dot. `data-role="linga-art"`.
- **Name tag**: who is behind the door (`Robin · Receptionist`), or a state of the journey in two or three
  words (`Your first step`). On the conversation it is also `.linga-speaker`. `data-role="linga-partner"`.
- **Sentence card**: cream card, 2 px line, a Georgia quote mark hanging off its corner, a 22 px label (A
  SENTENCE TO TAKE WITH YOU, ROBIN SAYS, LINGA ASKS, TRY) over one Georgia sentence. `data-role="linga-sentence"`
  (or `linga-said` for a line someone says).
- **Actions**: 87–91 px tall, 12 px radius, 2 px plum outline. The first one is the primary (larger), and one
  whose next step is speaking carries an ON YOUR PHONE badge. Two actions stack; three form the topic page's
  grid (primary across, two below); a choice is a row of equal buttons. `data-role="linga-primary"` and
  `"linga-secondary"`.
- **Caption slot**: the rule, its label, one sentence. `data-role="linga-caption"`.
- **Band steps**: six steps rising A1 → C2 on a plinth. Reached steps are plum, the learner's is amber with a
  flag and a glow, and the rest are pale.
- **Stepping stones**: four marks on a dashed path for speaking progress; the reached ones are plum and the
  current one amber.
- **Topic doors**: one small arch per topic with its situation's picture, a Georgia title and the skill as a
  label. The topic being swapped lifts and turns amber, and the others dim.
- **Footer**: a 2 px rule, then where you are, the progress dots, what is happening now (TV SHOWS · PHONE
  SPEAKS, PHONE MICROPHONE ACTIVE), Menu and Repeat audio.
- **Mark**: the plum speech bubble with two cream lines, then "Linga" in Georgia. `data-role="linga-mark"`.

## Illustration grammar

Every picture is flat inline SVG in `desk/src/english/art/`. A picture has no outlines: shapes are filled.
Strokes appear only as drawn lines (a pen, a lamp cord, a dashed route). A soft blurred circle sits behind
whatever should glow.

- A **situation** is 735 × 718 and fills the arch. It is built from the hotel's own parts (`Room.tsx`): a wall
  gradient from wine to peach, a floor curving up to meet it, a counter or table across the front, a lamp, a
  plant. The partner (`Person.tsx`, Robin's construction with the face centred on 0,0) faces the learner from
  the middle, with the head near y 300. Hair, skin, clothes, glasses and mouth vary; the construction doesn't.
  Put what matters inside x 90–645, y 110–630, because the arch clips the top corners and the name tag covers
  the bottom-left.
- **Tell the story with one prop.** The hotel's missing ledger line is a dashed rose outline, and the handover's
  missing page uses the same outline. The rover's hiding place is a question over a boulder. The café has two
  different drinks for two different tastes.
- A **state** is 510 × 440: one big soft circle, one symbol (a door standing open, a path of doors, a corrected
  bubble, the star-burst) and a wine hill.
- The café scene is friendly: no hearts, candles or roses.

## Composition rules

- Arch at x 109, words at x 1012 (1000 on home), actions anchored to 139 px above the bottom, footer at 58 px.
- Top to bottom: overline, title (or the card someone speaks in), rule and caption, what the screen holds,
  actions.
- The ladder, the topic doors and the menu use the full width, with the title block top-left.
- Empty states are two words and a picture: while Linga picks topics, the doors stand empty and dashed.

## What the Open Door is not

It isn't On Air: no charcoal, no red diagonal band, no condensed caps, no skew, no production grid. It isn't a
storybook either: text never sits on the picture except the name tag, and the picture never becomes a
background. It isn't a dashboard: no tiles, no numbers without a picture. It isn't a slide: the arch changes
the world on every screen, but the door stays where it is.
