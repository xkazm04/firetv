# matyas-19 · MB1 · Tonight's sheet, together

cert level L1 (code read and executed on main 4af25199) · verdict **L1-conditional** · Calculus 1 profile (type `other`, Adult available by his own pick)

## The walk

Tonight, two doors: homework and "teach me". Select on the homework door asks for tonight's sheet (it opens only a page snapped today, else it asks for the photo), I snap my MA1 sheet on the phone, the page appears on the TV by itself, Down/Up walks the problems, Select on one asks for a hint. Two presses and the photo. The page prompt now tells the vision model my course, my notation and to write `lim_(x->a)` and fractions in plain brackets, in the language the page is printed in, so the read has a fair chance of giving the desk something it can parse.

A hint comes back in two fields, hint and what to try next, each capped at 25 words in code with one re-ask. Hint 2 is told to go one step further.

## Does the guard catch the answer?

I tried the lines a tutor model might say on my own sheet.

- `Vypočtěte lim x→0 sin(3x)/x` and `Derivujte: y = sin(x^2)`: the desk reads them (the instruction in front is set aside). "The limit is 3." and "The derivative is 2x cos(x^2)." are refused. "Multiply cos(x^2) by 2x." and the "outside, then multiply by 2x" line are refused too. Last week they all passed.
- `Spočtěte derivaci funkce f(x) = ln(x^2+1)`, `Vypočítejte derivaci y = x^2 sin x`, `Najděte neurčitý integrál ∫ x e^(x^2) dx`, `Derivujte f(x) = tg(x^2)`, `Find dy/dx if x^2 + y^2 = 25`: not read. The only check then is the general one, and "The derivative is 2x/(x^2+1)." and "The integral is e^(x^2)/2 + C." walk straight through. The fix handled the commonest verb-led phrasing; my sheet, in a Czech lecturer's wording, uses "derivaci funkce" and "neurčitý integrál" all the time.

## Can it mark my sheet?

No. The page route reads and hints. The marker answers "Start a practice set first." if the set is not one the desk wrote. This was the whole value I came for: ten problems, which did I get wrong and where, instead of WolframAlpha telling me "wrong" with no line. It nudges me on one problem at a time; it does not check any of them.

## Scored criteria

| | | |
|---|---|---|
| C1 BLOCKER no answer in a hint | holds for verb-led Czech or English tasks and the three pinned chain-rule lines; **weak** for noun-phrase Czech tasks (open, recurrence 2) | executed |
| C6 not a school voice | holds | code |
| C7 honest "no lessons" | holds, one line | executed |
| C8 snapped Czech page read as mine | vision; prompt now 5 of 5 on the shared list | L2 |

## Numbers

- presses to first hint: 2 (limit 4). Fixed-line share at 25 words or fewer: 56 of 59 (0.95).
- MB-READ 5/5 (was 2/5). MB-HINT, Calculus path: hint 1 sees the problem and the course (2/8), hint 2 adds the previous hint (3/8), Point & ask adds my question (4/8). No rule card, no age, no working, no recorded slips. Named addition, absent: the sheet's language and my notation reach the hint only for cz and de profiles (he has none set unless he sets one).
- time saved: about 5 to 10 min a sheet from hints on the problems he is stuck on (instead of waiting for the cvičení); about 0 on checking, because it cannot check. Promised 20 to 30. Confidence medium-low.

## In my own words

It is a polite tutor that does not give me the answer, and it got more careful this week: "Multiply by 2x" would have been the whole exercise and now it stops that line. I will say honestly that I did not expect that to be fixed.

But I came for "which of my ten did I get wrong". I snapped the sheet and got a very patient assistant for one problem at a time. For that I could just ask a friend. If it marked the sheet, the way it marks the six it writes itself, I would use it every week and tell the whole year. The checking is built, it is sitting right there, and nobody has connected the page to it.

And the guard still trusts the model's good manners on exactly my wording: "derivaci funkce". That is a sentence I would normally believe, but it is a sentence that is easy to make true.

(New, minor, on the next course: `lim_(n->inf)` is read as nothing, while `lim_(n->infinity)` is.)

## Findings (this pair)

MB1-1 open (recurrence 2, narrowed), MB1-2 fixed, MB1-3 open (recurrence 2, structural), MB1-4 fixed, MB1-5 new (sequence reader and `inf`), strengths MB1-6, MB1-7.
