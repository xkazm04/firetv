/**
 * A Calculus 1 baseline: the topic spine of a university Calculus I course, and an example corpus per topic in the
 * two forms Math Buddy's pipeline carries maths in - the plain text our prompts ask the models to write (`^` for
 * powers, `sqrt(x)`, no LaTeX; a working as its lines joined by newline, the way the reader transcribes them) and the
 * TeX the reader may fall back to.
 *
 * The session order follows a public sample syllabus (cited in `source`: Columbia's Calculus I, 28 sessions, on
 * Stewart's Calculus: Early Transcendentals, 9th edition) - cited, never quoted. Topic names, blurbs and every
 * example are OUR OWN WORDS and our own mathematics; no syllabus or textbook text is copied, and no example is a real
 * learner's work. The same editorial stance as syllabus.ts.
 *
 * The spine itself - each topic's id, sessions, sections, name, strand, blurb, prerequisites and practice shapes -
 * lives in calculus1.spine.ts, and paths.ts reads it there as the 'calc1' path beside the school path (SYLLABUS,
 * which stays the school-year list: its year bands and expectedIndex have no place for a university course). A
 * learner on that path is served by the path's own wiring (docs/MATH-COURSE-PATHS.md), never by this file. This file
 * takes each topic's spine fields from CALC1_SPINE and only ADDS its examples, by topic id; the example corpus is a
 * FIXTURE for tests and docs (tools/maths-calculus-test.cjs, tools/maths-calculus-live.cjs, the calc-*-test.cjs
 * suites, docs/CALCULUS-1-SYLLABUS.md), not wired into lessons, practice or a screen.
 *
 * Each example DECLARES what the reader does with it today - `render` for the plain form, `renderTex` for the TeX
 * form, `check` for what verify.ts can read - and the offline test asserts the declaration against what it observes,
 * so a typesetter change in either direction forces the baseline to be re-declared. Client-safe: no Node module.
 */
import { CALC1_SPINE, type CalcSpineTopic } from "./calculus1.spine";

export type CalcKind = "question" | "working" | "caption" | "page";
/** What the reader does with one form: sets it, sets it with a named flaw, or breaks the screen's contract. */
export type RenderStatus = "renders" | `degrades:${string}` | `breaks:${string}`;
export interface CalcExample {
  id: string;
  kind: CalcKind;
  /** The form our prompts ask the models for: plain text, ^ for powers, sqrt(x), no LaTeX. */
  plain: string;
  /** The TeX the reader may be handed for the same thing. A caption is prose and has none. */
  tex?: string;
  /** A question's final value - never shown in a caption beside it (the withholding rule). */
  answer?: string;
  note?: string;
  /** Declared: the plain form, as the offline test observes it. */
  render: RenderStatus;
  /** Declared: the TeX form, when there is one. */
  renderTex?: RenderStatus;
  /** Declared: 'code' when verify.ts can read (and, for a question, confirm) it; 'none' otherwise. */
  check: "code" | "none";
}
/** A spine topic (id, sessions, sections, name, strand, blurb, prereq - see calculus1.spine.ts) with its examples. */
export interface CalcTopic extends Omit<CalcSpineTopic, "shapes"> {
  examples: CalcExample[];
}

const lines = (...xs: string[]) => xs.join("\n");
const t = String.raw;

/** Each spine topic's examples, keyed by its id in CALC1_SPINE. */
const EXAMPLES: Record<string, CalcExample[]> = {
  "calc1-functions": [
    { id: "c01-q1", kind: "question", plain: "If f(x) = x^2 + 1 and g(x) = sqrt(x - 3), find (f∘g)(x).", tex: t`\text{If } f(x) = x^2 + 1 \text{ and } g(x) = \sqrt{x - 3}, \text{ find } (f \circ g)(x).`, answer: "x - 2", render: "degrades:too-wide", renderTex: "degrades:circ-as-degree,too-wide", check: "none" },
    { id: "c01-w1", kind: "working", plain: lines("f(g(x)) = (sqrt(x - 3))^2 + 1", "= x - 3 + 1", "= x - 2"), tex: lines(t`f(g(x)) = \left(\sqrt{x - 3}\right)^2 + 1`, t`= x - 3 + 1`, t`= x - 2`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c01-c1", kind: "caption", plain: "Put g(x) in wherever f has an x, then simplify what comes out.", render: "renders", check: "none" },
    { id: "c01-p1", kind: "page", plain: "7. Sketch y = |x - 2| - 1 from the graph of y = |x|.", tex: t`\text{7. Sketch } y = \lvert x - 2 \rvert - 1 \text{ from the graph of } y = \lvert x \rvert.`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c01-p2", kind: "page", plain: "f(x) = x^2 + 1 is defined for every real x: its domain is (-infinity, infinity).", tex: t`f(x) = x^2 + 1, \quad x \in \mathbb{R}`, note: "the TeX form uses a command the reader does not know", render: "renders", renderTex: "degrades:unknown-tex", check: "none" },
  ],
  "calc1-trig": [
    { id: "c02-q1", kind: "question", plain: "Solve 2sin(theta) - 1 = 0 for 0 <= theta < 2pi.", tex: t`\text{Solve } 2\sin\theta - 1 = 0 \text{ for } 0 \le \theta < 2\pi.`, answer: "pi/6, 5pi/6", render: "renders", renderTex: "renders", check: "none" },
    { id: "c02-w1", kind: "working", plain: lines("sin(theta) = 1/2", "theta = pi/6  or  theta = 5pi/6"), tex: lines(t`\sin\theta = \frac{1}{2}`, t`\theta = \frac{\pi}{6} \quad\text{or}\quad \theta = \frac{5\pi}{6}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c02-c1", kind: "caption", plain: "Sine is the height on the unit circle: look for the two angles in one turn where the height is one half.", render: "renders", check: "none" },
    { id: "c02-p1", kind: "page", plain: "sin^2(x) + cos^2(x) = 1,   tan(x) = sin(x)/cos(x)", tex: t`\sin^2 x + \cos^2 x = 1, \qquad \tan x = \frac{\sin x}{\cos x}`, render: "degrades:slash", renderTex: "renders", check: "none" },
  ],
  "calc1-exp-log": [
    { id: "c03-q1", kind: "question", plain: "Solve e^(2x) = 7.", tex: t`\text{Solve } e^{2x} = 7.`, answer: "ln(7)/2", render: "renders", renderTex: "renders", check: "none" },
    { id: "c03-w1", kind: "working", plain: lines("2x = ln(7)", "x = ln(7)/2"), tex: lines(t`2x = \ln 7`, t`x = \frac{\ln 7}{2}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c03-q2", kind: "question", plain: "Evaluate log_2(8) + log_3(1/9).", tex: t`\text{Evaluate } \log_2 8 + \log_3 \frac{1}{9}.`, answer: "1", render: "renders", renderTex: "renders", check: "none" },
    { id: "c03-c1", kind: "caption", plain: "Take the natural log of both sides; ln undoes e.", render: "renders", check: "none" },
    { id: "c03-p1", kind: "page", plain: "Find the inverse of f(x) = (2x + 1)/(x - 3).", tex: t`\text{Find the inverse of } f(x) = \frac{2x + 1}{x - 3}.`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-limit-idea": [
    { id: "c04-q1", kind: "question", plain: "Find lim_(x->2) (x^2 - 4)/(x - 2).", tex: t`\text{Find } \lim_{x \to 2} \frac{x^2 - 4}{x - 2}.`, answer: "4", render: "renders", renderTex: "renders", check: "none" },
    { id: "c04-w1", kind: "working", plain: lines("(x^2 - 4)/(x - 2) = (x - 2)(x + 2)/(x - 2)", "= x + 2 for x != 2", "lim_(x->2) (x + 2) = 4"), tex: lines(t`\frac{x^2 - 4}{x - 2} = \frac{(x - 2)(x + 2)}{x - 2}`, t`= x + 2 \text{ for } x \ne 2`, t`\lim_{x \to 2} (x + 2) = 4`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c04-c1", kind: "caption", plain: "Factor the top; the factor that makes 0/0 cancels, and then x can be set to 2.", render: "renders", check: "none" },
    { id: "c04-p1", kind: "page", plain: "lim_(x->0+) 1/x = infinity,   lim_(x->0-) 1/x = -infinity", tex: t`\lim_{x \to 0^+} \frac{1}{x} = \infty, \qquad \lim_{x \to 0^-} \frac{1}{x} = -\infty`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c04-p2", kind: "page", plain: "The secant slope from 2 to 2 + h is m = (f(2 + h) - f(2))/h.", tex: t`\text{The secant slope from 2 to } 2 + h \text{ is } m = \frac{f(2 + h) - f(2)}{h}.`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-limit-laws": [
    { id: "c05-q1", kind: "question", plain: "Find lim_(x->0) x^2 sin(1/x).", tex: t`\text{Find } \lim_{x \to 0} x^2 \sin\frac{1}{x}.`, answer: "0", render: "renders", renderTex: "renders", check: "none" },
    { id: "c05-w1", kind: "working", plain: lines("-1 <= sin(1/x) <= 1", "-x^2 <= x^2 sin(1/x) <= x^2", "lim_(x->0) (-x^2) = 0 = lim_(x->0) x^2"), tex: lines(t`-1 \le \sin\frac{1}{x} \le 1`, t`-x^2 \le x^2 \sin\frac{1}{x} \le x^2`, t`\lim_{x \to 0} (-x^2) = 0 = \lim_{x \to 0} x^2`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c05-q2", kind: "question", plain: "Find lim_(x->3) (sqrt(x + 1) - 2)/(x - 3).", tex: t`\text{Find } \lim_{x \to 3} \frac{\sqrt{x + 1} - 2}{x - 3}.`, answer: "1/4", render: "renders", renderTex: "renders", check: "none" },
    { id: "c05-q3", kind: "question", plain: "Find lim_(x->0) (1/(x + 1) - 1)/x.", tex: t`\text{Find } \lim_{x \to 0} \frac{\frac{1}{x + 1} - 1}{x}.`, answer: "-1", note: "a nested fraction", render: "renders", renderTex: "renders", check: "none" },
    { id: "c05-c1", kind: "caption", plain: "Sine never leaves the band from minus one to one, so multiply that band by x^2 and squeeze.", render: "renders", check: "none" },
    { id: "c05-p1", kind: "page", plain: "lim_(x->0) sin(x)/x = 1", tex: t`\lim_{x \to 0} \frac{\sin x}{x} = 1`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c05-p2", kind: "page", plain: "0 < |x - a| < delta implies |f(x) - L| < epsilon", tex: t`0 < \lvert x - a \rvert < \delta \implies \lvert f(x) - L \rvert < \varepsilon`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-continuity": [
    { id: "c06-q1", kind: "question", plain: "Find c so that f is continuous: f(x) = { cx + 1 if x < 2;  x^2 - c if x >= 2 }", tex: t`\text{Find } c \text{ so that } f(x) = \begin{cases} cx + 1 & x < 2 \\ x^2 - c & x \ge 2 \end{cases} \text{ is continuous.}`, answer: "c = 1", render: "degrades:too-wide", renderTex: "degrades:cases-one-line,too-wide", check: "none" },
    { id: "c06-w1", kind: "working", plain: lines("2c + 1 = 4 - c", "3c = 3", "c = 1"), tex: lines(t`2c + 1 = 4 - c`, t`3c = 3`, t`c = 1`), note: "linear, but in c: verify.ts reads only x", render: "renders", renderTex: "renders", check: "none" },
    { id: "c06-c1", kind: "caption", plain: "Both pieces must meet at x = 2: set the left piece's value there equal to the right piece's.", render: "renders", check: "none" },
    { id: "c06-p1", kind: "page", plain: "lim_(x->infinity) (3x^2 - x)/(2x^2 + 5) = 3/2", tex: t`\lim_{x \to \infty} \frac{3x^2 - x}{2x^2 + 5} = \frac{3}{2}`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c06-p2", kind: "page", plain: "y = (x + 1)/(x - 3) has domain (-infinity, 3) ∪ (3, infinity), a vertical asymptote x = 3 and a horizontal asymptote y = 1.", tex: t`y = \frac{x + 1}{x - 3}: \quad x \ne 3, \quad \text{asymptotes } x = 3,\ y = 1`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c06-p3", kind: "page", plain: "f(x) = x^3 - x - 1 has f(1) = -1 < 0 < 5 = f(2), so it has a root in [1, 2].", tex: t`f(1) = -1 < 0 < 5 = f(2) \implies \text{a root in } [1, 2]`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-derivative": [
    { id: "c07-q1", kind: "question", plain: "Use the definition to find f'(x) for f(x) = x^2 + 3x.", tex: t`\text{Use the definition to find } f'(x) \text{ for } f(x) = x^2 + 3x.`, answer: "2x + 3", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c07-w1", kind: "working", plain: lines("f'(x) = lim_(h->0) ((x + h)^2 + 3(x + h) - x^2 - 3x)/h", "= lim_(h->0) (2xh + h^2 + 3h)/h", "= lim_(h->0) (2x + h + 3)", "= 2x + 3"), tex: lines(t`f'(x) = \lim_{h \to 0} \frac{(x + h)^2 + 3(x + h) - x^2 - 3x}{h}`, t`= \lim_{h \to 0} \frac{2xh + h^2 + 3h}{h}`, t`= \lim_{h \to 0} (2x + h + 3)`, t`= 2x + 3`), render: "degrades:too-tall", renderTex: "degrades:too-tall", check: "none" },
    { id: "c07-c1", kind: "caption", plain: "Expand (x + h)^2, cancel every term without an h, then divide what is left by h.", render: "renders", check: "none" },
    { id: "c07-p1", kind: "page", plain: "f'(a) = lim_(h->0) (f(a + h) - f(a))/h", tex: t`f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c07-p2", kind: "page", plain: "dy/dx = f'(x),   d^2y/dx^2 = f''(x)", tex: t`\frac{dy}{dx} = f'(x), \qquad \frac{d^2y}{dx^2} = f''(x)`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-rules": [
    { id: "c08-q1", kind: "question", plain: "Differentiate y = (x^2 + 1)/(x - 1).", tex: t`\text{Differentiate } y = \frac{x^2 + 1}{x - 1}.`, answer: "(x^2 - 2x - 1)/(x - 1)^2", render: "renders", renderTex: "renders", check: "none" },
    { id: "c08-w1", kind: "working", plain: lines("y' = (2x(x - 1) - (x^2 + 1)(1))/(x - 1)^2", "= (2x^2 - 2x - x^2 - 1)/(x - 1)^2", "= (x^2 - 2x - 1)/(x - 1)^2"), tex: lines(t`y' = \frac{2x(x - 1) - (x^2 + 1)(1)}{(x - 1)^2}`, t`= \frac{2x^2 - 2x - x^2 - 1}{(x - 1)^2}`, t`= \frac{x^2 - 2x - 1}{(x - 1)^2}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c08-c1", kind: "caption", plain: "Bottom times the derivative of the top, minus top times the derivative of the bottom, all over the bottom squared.", render: "renders", check: "none" },
    { id: "c08-p1", kind: "page", plain: "d/dx x^n = n x^(n-1),   d/dx x^(-1/2) = -1/2 x^(-3/2)", tex: t`\frac{d}{dx} x^n = n x^{n-1}, \qquad \frac{d}{dx} x^{-1/2} = -\frac{1}{2} x^{-3/2}`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-trig-derivatives": [
    { id: "c09-q1", kind: "question", plain: "Differentiate f(x) = x^2 e^x sin(x).", tex: t`\text{Differentiate } f(x) = x^2 e^x \sin x.`, answer: "2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)", render: "renders", renderTex: "renders", check: "none" },
    { id: "c09-w1", kind: "working", plain: "d/dx [x^2 e^x sin(x)] = 2x e^x sin(x) + x^2 e^x sin(x) + x^2 e^x cos(x)", tex: t`\frac{d}{dx}\left[x^2 e^x \sin x\right] = 2x e^x \sin x + x^2 e^x \sin x + x^2 e^x \cos x`, note: "one working line over 60 characters", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c09-q2", kind: "question", plain: "Find lim_(theta->0) (1 - cos(theta))/theta.", tex: t`\text{Find } \lim_{\theta \to 0} \frac{1 - \cos\theta}{\theta}.`, answer: "0", render: "renders", renderTex: "renders", check: "none" },
    { id: "c09-c1", kind: "caption", plain: "Treat it as three factors: differentiate one at a time and keep the other two as they are.", render: "renders", check: "none" },
    { id: "c09-p1", kind: "page", plain: "d/dx sec(x) = sec(x) tan(x),   d/dx tan(x) = sec^2(x)", tex: t`\frac{d}{dx}\sec x = \sec x \tan x, \qquad \frac{d}{dx}\tan x = \sec^2 x`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-chain": [
    { id: "c10-q1", kind: "question", plain: "Find dy/dx if x^2 + y^2 = 25.", tex: t`\text{Find } \frac{dy}{dx} \text{ if } x^2 + y^2 = 25.`, answer: "-x/y", render: "renders", renderTex: "renders", check: "none" },
    { id: "c10-w1", kind: "working", plain: lines("2x + 2y dy/dx = 0", "dy/dx = -x/y"), tex: lines(t`2x + 2y\frac{dy}{dx} = 0`, t`\frac{dy}{dx} = -\frac{x}{y}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c10-q2", kind: "question", plain: "Differentiate y = cbrt(1 + x^2).", tex: t`\text{Differentiate } y = \sqrt[3]{1 + x^2}.`, answer: "2x/(3(1 + x^2)^(2/3))", render: "renders", renderTex: "renders", check: "none" },
    { id: "c10-c1", kind: "caption", plain: "Differentiate both sides with respect to x; every y-term picks up a factor of dy/dx.", render: "renders", check: "none" },
    { id: "c10-p1", kind: "page", plain: "d/dx sin(x^3) = 3x^2 cos(x^3),   d/dx e^(2x) = 2e^(2x)", tex: t`\frac{d}{dx}\sin(x^3) = 3x^2\cos(x^3), \qquad \frac{d}{dx}e^{2x} = 2e^{2x}`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-log-derivative": [
    { id: "c11-q1", kind: "question", plain: "Differentiate y = ln(x)/x.", tex: t`\text{Differentiate } y = \frac{\ln x}{x}.`, answer: "(1 - ln(x))/x^2", render: "renders", renderTex: "renders", check: "none" },
    { id: "c11-w1", kind: "working", plain: lines("y' = ((1/x)(x) - ln(x)(1))/x^2", "= (1 - ln(x))/x^2"), tex: lines(t`y' = \frac{\frac{1}{x}\cdot x - \ln x \cdot 1}{x^2}`, t`= \frac{1 - \ln x}{x^2}`), render: "degrades:too-tall", renderTex: "degrades:too-tall", check: "none" },
    { id: "c11-q2", kind: "question", plain: "Differentiate y = x^x for x > 0.", tex: t`\text{Differentiate } y = x^x \text{ for } x > 0.`, answer: "x^x (ln(x) + 1)", render: "renders", renderTex: "renders", check: "none" },
    { id: "c11-c1", kind: "caption", plain: "Use the quotient rule with ln x on top; its derivative is one over x.", render: "renders", check: "none" },
    { id: "c11-p1", kind: "page", plain: "A(t) = 100e^(-0.05t) decays with half-life ln(2)/0.05 ≈ 13.9", tex: t`A(t) = 100e^{-0.05t}, \quad t_{1/2} = \frac{\ln 2}{0.05} \approx 13.9`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-related-rates": [
    { id: "c12-q1", kind: "question", plain: "Air fills a sphere at 100 cm^3/s. How fast is r growing when r = 5 cm?", tex: t`\frac{dV}{dt} = 100\ \text{cm}^3/\text{s}. \text{ Find } \frac{dr}{dt} \text{ when } r = 5\ \text{cm}.`, answer: "1/π", render: "degrades:too-wide", renderTex: "renders", check: "none" },
    { id: "c12-w1", kind: "working", plain: lines("V = (4/3) pi r^3", "dV/dt = 4 pi r^2 dr/dt", "100 = 4 pi (25) dr/dt", "dr/dt = 1/pi"), tex: lines(t`V = \frac{4}{3}\pi r^3`, t`\frac{dV}{dt} = 4\pi r^2 \frac{dr}{dt}`, t`100 = 4\pi (25) \frac{dr}{dt}`, t`\frac{dr}{dt} = \frac{1}{\pi}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c12-c1", kind: "caption", plain: "Write the volume in terms of r, differentiate both sides in t, then put in the moment's numbers.", render: "renders", check: "none" },
    { id: "c12-p1", kind: "page", plain: "sqrt(4.1) ≈ 2 + (1/4)(0.1) = 2.025", tex: t`\sqrt{4.1} \approx 2 + \frac{1}{4}(0.1) = 2.025`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-extrema": [
    { id: "c13-q1", kind: "question", plain: "Find the absolute maximum and minimum of f(x) = x^3 - 12x on [-3, 5].", tex: t`\text{Find the absolute extremes of } f(x) = x^3 - 12x \text{ on } [-3, 5].`, answer: "max 65, min -16", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c13-w1", kind: "working", plain: lines("f'(x) = 3x^2 - 12 = 0", "x = -2  or  x = 2", "f(-3) = 9,  f(-2) = 16,  f(2) = -16,  f(5) = 65"), tex: lines(t`f'(x) = 3x^2 - 12 = 0`, t`x = -2 \quad\text{or}\quad x = 2`, t`f(-3) = 9,\ f(-2) = 16,\ f(2) = -16,\ f(5) = 65`), render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c13-q2", kind: "question", plain: "3x^2 - 12 = 0", tex: t`3x^2 - 12 = 0`, answer: "2", note: "the critical-number equation a working reaches: the one shape here verify.ts can substitute into", render: "renders", renderTex: "renders", check: "code" },
    { id: "c13-c1", kind: "caption", plain: "Check the critical numbers and both ends of the interval; the largest value wins.", render: "renders", check: "none" },
    { id: "c13-p1", kind: "page", plain: "f(b) - f(a) = f'(c)(b - a) for some c in (a, b)", tex: t`f(b) - f(a) = f'(c)\,(b - a) \text{ for some } c \in (a, b)`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-shape": [
    { id: "c14-q1", kind: "question", plain: "Find lim_(x->0) (e^x - 1 - x)/x^2.", tex: t`\text{Find } \lim_{x \to 0} \frac{e^x - 1 - x}{x^2}.`, answer: "1/2", render: "renders", renderTex: "renders", check: "none" },
    { id: "c14-w1", kind: "working", plain: lines("lim_(x->0) (e^x - 1 - x)/x^2 = lim_(x->0) (e^x - 1)/(2x)", "= lim_(x->0) e^x/2 = 1/2"), tex: lines(t`\lim_{x \to 0} \frac{e^x - 1 - x}{x^2} = \lim_{x \to 0} \frac{e^x - 1}{2x}`, t`= \lim_{x \to 0} \frac{e^x}{2} = \frac{1}{2}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c14-q2", kind: "question", plain: "Find the x-values of the inflection points of f(x) = x^4 - 6x^2.", tex: t`\text{Find the } x\text{-values of the inflection points of } f(x) = x^4 - 6x^2.`, answer: "-1, 1", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c14-c1", kind: "caption", plain: "Top and bottom both go to zero, so differentiate each separately; you may need to do it twice.", render: "renders", check: "none" },
    { id: "c14-p1", kind: "page", plain: "f''(x) > 0: concave up;  f''(x) < 0: concave down", tex: t`f''(x) > 0 \Rightarrow \text{concave up}; \quad f''(x) < 0 \Rightarrow \text{concave down}`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-optimisation": [
    { id: "c15-q1", kind: "question", plain: "A rectangle has perimeter 40 m. Find the sides that give the largest area.", tex: t`\text{A rectangle has perimeter } 40\ \text{m}. \text{ Maximise its area.}`, answer: "10 m by 10 m", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c15-w1", kind: "working", plain: lines("A(x) = x(20 - x) = 20x - x^2", "A'(x) = 20 - 2x = 0", "x = 10,  A''(x) = -2 < 0"), tex: lines(t`A(x) = x(20 - x) = 20x - x^2`, t`A'(x) = 20 - 2x = 0`, t`x = 10, \quad A''(x) = -2 < 0`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c15-q2", kind: "question", plain: "20 - 2x = 0", tex: t`20 - 2x = 0`, answer: "10", note: "the stationary-point equation: verify.ts can substitute into it", render: "renders", renderTex: "renders", check: "code" },
    { id: "c15-c1", kind: "caption", plain: "Use the perimeter to write one side in terms of the other, so the area depends on one variable only.", render: "renders", check: "none" },
    { id: "c15-p1", kind: "page", plain: "Open box from a 12 by 12 sheet: V(x) = x(12 - 2x)^2,  0 < x < 6", tex: t`V(x) = x(12 - 2x)^2, \quad 0 < x < 6`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-newton": [
    { id: "c16-q1", kind: "question", plain: "Use Newton's method on x^2 - 2 = 0 with x_1 = 1 to find x_3.", tex: t`\text{Use Newton's method on } x^2 - 2 = 0 \text{ with } x_1 = 1 \text{ to find } x_3.`, answer: "17/12", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c16-w1", kind: "working", plain: lines("x_(n+1) = x_n - (x_n^2 - 2)/(2x_n)", "x_2 = 1 - (1 - 2)/2 = 3/2", "x_3 = 3/2 - (9/4 - 2)/3 = 17/12"), tex: lines(t`x_{n+1} = x_n - \frac{x_n^2 - 2}{2x_n}`, t`x_2 = 1 - \frac{1 - 2}{2} = \frac{3}{2}`, t`x_3 = \frac{3}{2} - \frac{\frac{9}{4} - 2}{3} = \frac{17}{12}`), render: "degrades:too-tall", renderTex: "degrades:too-tall", check: "none" },
    { id: "c16-c1", kind: "caption", plain: "Start at x_1, follow the tangent to where it crosses the axis, and use that crossing as the next guess.", render: "renders", check: "none" },
    { id: "c16-p1", kind: "page", plain: "x_4 = 577/408 ≈ 1.4142157", tex: t`x_4 = \frac{577}{408} \approx 1.4142157`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-antiderivatives": [
    { id: "c17-q1", kind: "question", plain: "Find f if f'(x) = 3x^2 - 4/x and f(1) = 2, for x > 0.", tex: t`f'(x) = 3x^2 - \frac{4}{x},\ f(1) = 2,\ x > 0: \text{ find } f.`, answer: "x^3 - 4ln(x) + 1", render: "degrades:too-wide", renderTex: "renders", check: "none" },
    { id: "c17-w1", kind: "working", plain: lines("f(x) = x^3 - 4 ln(x) + C", "f(1) = 1 - 0 + C = 2", "C = 1"), tex: lines(t`f(x) = x^3 - 4\ln x + C`, t`f(1) = 1 - 0 + C = 2`, t`C = 1`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c17-c1", kind: "caption", plain: "Undo each term's derivative on its own, then use f(1) to pin down the constant.", render: "renders", check: "none" },
    { id: "c17-p1", kind: "page", plain: "int x^(-1/2) dx = 2 sqrt(x) + C,   int sec^2(x) dx = tan(x) + C", tex: t`\int x^{-1/2}\,dx = 2\sqrt{x} + C, \qquad \int \sec^2 x\,dx = \tan x + C`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-definite-integral": [
    { id: "c18-q1", kind: "question", plain: "Write the right-endpoint sum for int_0^2 x^2 dx with n rectangles and find its limit.", tex: t`\text{Find } \lim_{n \to \infty} R_n \text{ for } \int_0^2 x^2\,dx.`, answer: "8/3", render: "degrades:too-wide", renderTex: "renders", check: "none" },
    { id: "c18-w1", kind: "working", plain: lines("R_n = sum_(i=1)^n (2i/n)^2 (2/n)", "= (8/n^3) sum_(i=1)^n i^2", "= (8/n^3) n(n + 1)(2n + 1)/6", "lim_(n->infinity) R_n = 8/3"), tex: lines(t`R_n = \sum_{i=1}^{n} \left(\frac{2i}{n}\right)^2 \frac{2}{n}`, t`= \frac{8}{n^3}\sum_{i=1}^{n} i^2`, t`= \frac{8}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6}`, t`\lim_{n \to \infty} R_n = \frac{8}{3}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c18-c1", kind: "caption", plain: "Each rectangle is 2/n wide, and its height is the curve at the right end of its strip.", render: "renders", check: "none" },
    { id: "c18-p1", kind: "page", plain: "sum_(i=1)^n i = n(n + 1)/2; for n = 10^40 that is 50000000000000000000000000000000000000005000000000000000000000000000000000000000", tex: t`\sum_{i=1}^{n} i = \frac{n(n + 1)}{2}; \text{ for } n = 10^{40}: 50000000000000000000000000000000000000005000000000000000000000000000000000000000`, note: "an 80-digit token", render: "degrades:too-wide", renderTex: "degrades:too-wide", check: "none" },
    { id: "c18-p2", kind: "page", plain: "Σ_(i=1)^n f(c_i) Δx", tex: t`\sum_{i=1}^{n} f(c_i)\,\Delta x`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-area-so-far": [
    { id: "c19-q1", kind: "question", plain: "Let g(x) = int_0^x (t^2 + 1) dt. Find g(3).", tex: t`\text{Let } g(x) = \int_0^x (t^2 + 1)\,dt. \text{ Find } g(3).`, answer: "12", render: "renders", renderTex: "renders", check: "none" },
    { id: "c19-w1", kind: "working", plain: lines("g(x) = [t^3/3 + t]_0^x = x^3/3 + x", "g(3) = 9 + 3 = 12"), tex: lines(t`g(x) = \left[\frac{t^3}{3} + t\right]_0^x = \frac{x^3}{3} + x`, t`g(3) = 9 + 3 = 12`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c19-c1", kind: "caption", plain: "Think of g as the area collected from 0 up to x; sketch that strip and add it up.", render: "renders", check: "none" },
    { id: "c19-p1", kind: "page", plain: "int_a^b f(x) dx = -int_b^a f(x) dx,   int_a^a f(x) dx = 0", tex: t`\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx, \qquad \int_a^a f(x)\,dx = 0`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c19-p2", kind: "page", plain: "int_(-1)^2 |x| dx = 1/2 + 2 = 5/2", tex: t`\int_{-1}^{2} \lvert x \rvert\,dx = \frac{1}{2} + 2 = \frac{5}{2}`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-ftc": [
    { id: "c20-q1", kind: "question", plain: "Evaluate int_1^4 (2x + 1/sqrt(x)) dx.", tex: t`\text{Evaluate } \int_1^4 \left(2x + \frac{1}{\sqrt{x}}\right)dx.`, answer: "17", render: "renders", renderTex: "renders", check: "none" },
    { id: "c20-w1", kind: "working", plain: lines("int_1^4 (2x + x^(-1/2)) dx = [x^2 + 2 sqrt(x)]_1^4", "= (16 + 4) - (1 + 2) = 17"), tex: lines(t`\int_1^4 \left(2x + x^{-1/2}\right)dx = \left[x^2 + 2\sqrt{x}\right]_1^4`, t`= (16 + 4) - (1 + 2) = 17`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c20-c1", kind: "caption", plain: "Find an antiderivative of each term, then subtract its value at the lower limit from its value at the upper.", render: "renders", check: "none" },
    { id: "c20-p1", kind: "page", plain: "d/dx int_0^(x^2) cos(t) dt = 2x cos(x^2)", tex: t`\frac{d}{dx}\int_0^{x^2} \cos t\,dt = 2x\cos(x^2)`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c20-p2", kind: "page", plain: "v(t) = t^2 - 4 on [0, 3]: displacement = int_0^3 (t^2 - 4) dt = -3", tex: t`\int_0^3 (t^2 - 4)\,dt = \left[\frac{t^3}{3} - 4t\right]_0^3 = -3`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-substitution": [
    { id: "c21-q1", kind: "question", plain: "Evaluate int_0^1 2x (x^2 + 1)^3 dx.", tex: t`\text{Evaluate } \int_0^1 2x\,(x^2 + 1)^3\,dx.`, answer: "15/4", render: "renders", renderTex: "renders", check: "none" },
    { id: "c21-w1", kind: "working", plain: lines("u = x^2 + 1,  du = 2x dx", "int_1^2 u^3 du = [u^4/4]_1^2", "= 16/4 - 1/4 = 15/4"), tex: lines(t`u = x^2 + 1, \quad du = 2x\,dx`, t`\int_1^2 u^3\,du = \left[\frac{u^4}{4}\right]_1^2`, t`= \frac{16}{4} - \frac{1}{4} = \frac{15}{4}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c21-c1", kind: "caption", plain: "Let u be the inside of the bracket; the 2x outside is exactly du, and the limits change with u.", render: "renders", check: "none" },
    { id: "c21-p1", kind: "page", plain: "int sin(x) cos(x) dx = sin^2(x)/2 + C", tex: t`\int \sin x \cos x\,dx = \frac{\sin^2 x}{2} + C`, render: "renders", renderTex: "renders", check: "none" },
    { id: "c21-p2", kind: "page", plain: "int x/sqrt(1 - x^2) dx = -sqrt(1 - x^2) + C", tex: t`\int \frac{x}{\sqrt{1 - x^2}}\,dx = -\sqrt{1 - x^2} + C`, render: "renders", renderTex: "renders", check: "none" },
  ],
  "calc1-area-average": [
    { id: "c22-q1", kind: "question", plain: "Find the area between y = x and y = x^2.", tex: t`\text{Find the area between } y = x \text{ and } y = x^2.`, answer: "1/6", render: "renders", renderTex: "renders", check: "none" },
    { id: "c22-w1", kind: "working", plain: lines("x = x^2 gives x = 0 or x = 1", "A = int_0^1 (x - x^2) dx", "= [x^2/2 - x^3/3]_0^1 = 1/6"), tex: lines(t`x = x^2 \implies x = 0 \text{ or } x = 1`, t`A = \int_0^1 (x - x^2)\,dx`, t`= \left[\frac{x^2}{2} - \frac{x^3}{3}\right]_0^1 = \frac{1}{6}`), render: "renders", renderTex: "renders", check: "none" },
    { id: "c22-c1", kind: "caption", plain: "Find where the curves cross, then integrate the upper curve minus the lower between those crossings.", render: "renders", check: "none" },
    { id: "c22-p1", kind: "page", plain: "f_avg = (1/(b - a)) int_a^b f(x) dx", tex: t`f_{\text{avg}} = \frac{1}{b - a}\int_a^b f(x)\,dx`, note: "a subscript word typed without brackets", render: "degrades:script-one-letter", renderTex: "renders", check: "none" },
    { id: "c22-p2", kind: "page", plain: "The average of sin(x) on [0, pi] is 2/pi.", tex: t`\frac{1}{\pi}\int_0^{\pi} \sin x\,dx = \frac{2}{\pi}`, render: "renders", renderTex: "renders", check: "none" },
  ],
};

export const CALCULUS_1 = {
  source: {
    name: "Columbia University, Department of Mathematics - Calculus I sample syllabus",
    url: "https://www.math.columbia.edu/programs-math/undergraduate-program/calculus-classes/calculus-i/calculus-1-sample-syllabus",
    textbook: "James Stewart, Calculus: Early Transcendentals, 9th edition",
  },
  topics: CALC1_SPINE.map(({ shapes: _shapes, ...spine }): CalcTopic => ({ ...spine, examples: EXAMPLES[spine.id] ?? [] })),
  /** The syllabus's review and midterm sessions: no topic of their own. */
  nonTopicSessions: [8, 9, 21, 22, 28],
};
