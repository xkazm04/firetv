# vojtech-18 · MB4 · Where did the marks go?

cert level L1 (code read and executed on main 4af25199) · verdict **L1-conditional** · profile high-school 18 cz, Adult by default (Math Buddy reads no mode)

## The walk

On the phone, Paper tab: a row per question with a number, Scored, Out of, and up to three statement picks. An empty Scored or Out of box now says what to type. Each area folds with its pick count and a box finds a statement by its words. The statements are still the GCSE Foundation list in UK wording (about 100), with beyond-Foundation ones flagged "a harder statement".

I typed a 7-row mock in the shape of a maturita test: a cylinder volume (G17), a trigonometry question (G20), an ordering question (N1), an expression (A4), an equations question (A17), one fully answered (N2) and one with no statement.

TV `paper`:

- Totals: 8 of 26 marks, 18 lost. No board or grade is named anywhere.
- The topics add up: topics 13 + off-desk 3 + no statement 2 = 18 lost. Last time they added to more than the paper.
- "3 of 18 lost marks are not on the desk yet." (the card says it; last time I had to guess). The off-desk statements are walked by name after the topics.
- Select on a topic row opens Get ready for school on that unit with its question; Back and Menu land on the unit I came from, not on Equivalent fractions.
- A paper where every lost mark sits on a question with no statement no longer says "No marks were lost": it says how many were lost and to pick what each tests.

But the first line still reads: **"Start with Area of rectangles, triangles and composite shapes."** That is my cylinder-volume question, 4 of 4 marks lost, mapped through G17 ("… surface area and volume of solids") to the area unit. A 7. ročník unit as where the marks went for an 18-year-old is what I wrote last time, and it is unchanged. My trigonometry question lands on Pythagoras, my ordering question on equivalent fractions.

The row's statement (the one that sent me there) is still never shown, so I cannot see why. The 31 typed rows live only in the phone page's memory: a reload loses them.

## Scored criteria

| | | |
|---|---|---|
| C4 unmatched question counted as not on the desk | holds: "N marks were lost on questions that name no statement" and the off-desk card | executed |
| C5 weakest area first, in the order of marks lost, no school unit as where the marks went unless the marks say so | **partial**: the list adds up and is ordered; a partial statement still leads it with a school unit | executed |
| C3 no claim to cover the maturita | holds | code |

## Numbers

- recovery fidelity: total equals the typed marks (8 of 26), lost 18 = rows sum; off-desk counted 3 of 18; nothing dropped silently. Pass.
- presses from the first recovery row to a set on that topic: 2 to 3 per the backlog (RP1), keys.ts:534-543 read, not executed. Last time 16.
- time saved: about 15 min to type and read versus 30 to 40 min marking the published key and never learning why; 10 to 20 min saved, honest ceiling that the list may point at the wrong unit. Confidence medium-low.

## In my own words

Now I can do the thing I came for: type the mock, see my total, see how much of it is off the desk, and press OK on a row to practise. Last time OK did nothing and I got sent to fractions. That is a big difference.

I still do not trust the first line. If the first thing it says is "area of rectangles" for a cylinder, I do not know which of the other lines I should believe. The number at the top is right. The order underneath is arguable, and it should say when a statement reaches past the unit it points to.

## Findings (this pair)

MB4-1, 3, 4 fixed; MB4-2 open (recurrence 2, narrowed: adds up now, partial links still lead), MB4-5 open (picker wording), MB4-6 open (statement behind a row unshown); MB4-7 strength.
