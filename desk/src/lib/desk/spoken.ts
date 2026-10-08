/**
 * What the TV voice says for a session: the hint, the sentence's explanation, the essay's summary, the walk's verdict line,
 * the break. Pure, so a rule test can call it; the TV page speaks what it returns. On the walk a part is called by its paper
 * name ('Number 5(b) is right.'), as the card names it (v2 M3a-2); the stored line is not changed, and a single item's line
 * is spoken as stored.
 */
import type { Session } from "../session/store";
import { deskLine } from "../rules/calc-word";

export function spokenLine(s: Session): string | undefined {
  if (s.screen === "hint") return s.hint?.stage === 2 ? s.hint.hint2?.hint : s.hint?.hint1?.hint;
  if (s.screen === "sentence") return s.english?.explanation;
  if (s.screen === "forensic") return s.essay?.summary;
  if (s.screen === "walk") {
    const items = s.practice?.items, said = items?.[s.walkIx]?.said;
    return items && said ? deskLine(items, s.walkIx, said) : said;
  }
  if (s.screen === "break") return "Time for a break.";
  return "";
}
