/**
 * Which item a tap on the held page selects: the one whose centre is nearest the tap, on y only; a tie keeps the
 * earlier item, and an empty page answers 0. The centres are the ones the read reported (read.ts), so this rule is
 * only as good as the model's positions. Pure and client-safe: the phone's tap calls it, and the lab bench
 * (tools/lab-bench.cjs) scores a read with it - tapping each item's true centre - so both judge one rule.
 */
export function nearestItem(items: ReadonlyArray<{ cy: number }>, y: number): number {
  let best = 0;
  items.forEach((it, i) => { if (Math.abs(it.cy - y) < Math.abs(items[best].cy - y)) best = i; });
  return best;
}
