/**
 * The worked lesson for a school unit (v2 M1: "Teach me something" teaches before it practises). Authored here, read by a
 * person: one idea and three method steps per unit, in words only (no digits: every number on a lesson comes from code,
 * lib/desk/worked.ts). The idea is the fallback when the model's own wording is not used; the steps are always shown.
 * A TEACHER MUST READ THIS TABLE, as the curriculum tables.
 */
export interface WorkedMethod { idea: string; steps: [string, string, string] }

export const WORKED_METHODS: Readonly<Record<string, WorkedMethod>> = {
  "frac-equivalent": { idea: "Two fractions are equal when they name the same share. Multiply or divide the top and the bottom by the same number and the share does not change.",
    steps: ["Find what the known bottom was multiplied by", "Do the same to the top", "Check: both fractions name the same share"] },
  "frac-of-amount": { idea: "A fraction of an amount means sharing the amount into equal parts and taking some of them.",
    steps: ["Divide the amount by the bottom number", "Multiply by the top number", "Check: the answer is smaller than the amount"] },
  "frac-add-sub": { idea: "You can only add or take away fractions when the pieces are the same size, so first give them the same bottom number.",
    steps: ["Find a common bottom number", "Rewrite both fractions with it", "Add or take away the tops, then simplify"] },
  "frac-mul-div": { idea: "To multiply fractions, multiply the tops and the bottoms. To divide, flip the second fraction and multiply.",
    steps: ["Dividing? Flip the second fraction and multiply", "Multiply top by top and bottom by bottom", "Simplify the answer"] },
  "dec-arith": { idea: "Decimals line up by place value: tenths under tenths, hundredths under hundredths.",
    steps: ["Line up the decimal points", "Work as with whole numbers", "Put the point back in the answer, in line"] },
  "dec-convert": { idea: "A fraction, a decimal and a percent can name the same amount: percent means out of a hundred.",
    steps: ["Divide the top by the bottom to get a decimal", "Multiply a decimal by a hundred to get a percent", "Write it in the form the question asks for"] },
  "pct-of-amount": { idea: "A percent of an amount is that many hundredths of it.",
    steps: ["Find one percent by dividing by a hundred", "Multiply by the percent asked for", "Check the size: half of the amount is fifty percent"] },
  "pct-change": { idea: "To increase or decrease by a percent, find that percent of the amount, then add it on or take it off.",
    steps: ["Find the percent of the amount", "Increase: add it on. Decrease: take it off", "Check: an increase is bigger than where you started"] },
  "ratio-share": { idea: "A ratio compares parts. Sharing in a ratio means splitting into that many equal parts in total.",
    steps: ["Add the parts of the ratio", "Divide the total by that to find one part", "Multiply one part by each side of the ratio"] },
  "unit-rate": { idea: "A unit rate is how much for one. Once you know one, you can find any number of them.",
    steps: ["Divide to find the amount for one", "Multiply by how many you need", "Check the unit on the answer"] },
  "area": { idea: "Area counts the squares that cover a shape. A triangle covers half the rectangle around it.",
    steps: ["Rectangle: multiply the two sides", "Triangle: base times height, then halve", "Composite: split into rectangles and add"] },
  "mean-range": { idea: "The mean shares the total out equally. The range is the gap between the biggest and the smallest.",
    steps: ["Mean: add all the values", "Divide by how many values there are", "Range: biggest take away smallest"] },
};

/** Is this a unit with a worked lesson (a code-generated school unit)? */
export const hasWorked = (topic: unknown): topic is string =>
  typeof topic === "string" && Object.prototype.hasOwnProperty.call(WORKED_METHODS, topic);
