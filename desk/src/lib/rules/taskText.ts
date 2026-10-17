/**
 * A printed task as the readers can read it (MB-B2). A worksheet in Czech or English opens with an instruction
 * ('Řeš rovnici', 'Vypočítej:', 'Solve', 'Work out'), writes a product with a middle dot and a quotient of fractions
 * with a colon, and in a comma system a decimal with a comma. Each reader (rules/kinds readQuestion, rules/calc and
 * rules/school specFromQuestion, rules/maths equationOf and expressionOf) first reads the text exactly as it is; only
 * when that reads as nothing is it offered again in these forms, so a text read today is read as it was.
 *
 * Pure: no store, no engine; imports only the diacritics fold, the Czech function names (calc-read) and a type.
 */
import { fold } from "./numberWords";
import { czechNames } from "./calc-read";
import type { SchoolSystem } from "../session/store";
export type { SchoolSystem };

/** A leading instruction in Czech or English, matched on the text with its diacritics folded: 'Řešte rovnici', 'Work out', 'Derivujte:'. */
const INSTRUCTION = new RegExp(
  String.raw`^\s*(?:(?:\d{1,2}[.)]|\(\d{1,2}\)|[a-h]\)|\([a-h]\))\s+)?` +
  String.raw`(res(?:te)?|vypocit(?:ej|ejte)|vypoctete|spoctete|spocti(?:te)?|spocitej(?:te)?|derivuj(?:te)?|urcete|urci|najdete|najdi|secti(?:te)?|odecti(?:te)?|odectete|vynasob(?:te)?|rozdel(?:te)?|vydel(?:te)?|uprav(?:te)?|dopln(?:te)?|zapis(?:te)?|zkrat(?:te)?|preved(?:te)?|solve|calculate|work out|find)\b` +
  String.raw`(?:\s+(?:(?:rovnici|priklad|ulohu|limitu|hodnotu|vyraz|zlomek|chybejici\s+(?:cislo|citatel|jmenovatel)|equation)|(derivaci)(?:\s+funkce)?|(?:neurcity\s+)?integral(?:\s+funkce)?))?\s*:?\s*`,
  "i",
);
const DERIVE = /^deriv/i;
/** The joiner a Czech two-operand verb stands for: 'Sečti 3/4 a 1/6' is 3/4 + 1/6. Only between plain numbers and fractions. */
const VERB_OP: Record<string, string> = { secti: "+", odecti: "-", vynasob: "×", rozdel: "÷" };
const NUMERIC = /^[\d\s/.,()%]+$/;

/** The text without its leading instruction ('Derivujte: y = x^2' keeps its verb, as 'Differentiate y = x^2'); the text itself when it has none. */
export function withoutInstruction(text: string): string {
  const t = text.normalize("NFC"), m = INSTRUCTION.exec(fold(t));
  if (!m || m[0].length === 0) return text;
  const rest = t.slice(m[0].length), verb = m[1].toLowerCase();
  if (DERIVE.test(verb) || m[2]) return `Differentiate ${rest}`;
  const bare = fold(rest.trim()), v = verb === "odectete" ? "odecti" : verb.replace(/te$/, "");
  // 'Odečti 1/6 od 3/4' takes the first from the second: 3/4 - 1/6
  if (v === "odecti") { const j = /^(.+?)\s+od\s+(.+?)\s*\.?$/.exec(bare); if (j && NUMERIC.test(j[1]) && NUMERIC.test(j[2])) return `${j[2]} - ${j[1]}`; }
  // 'Vyděl 3/4 číslem 1/2' is 3/4 ÷ 1/2
  if (v === "vydel") { const j = /^(.+?)\s+(?:cislem|cislo)\s+(.+?)\s*\.?$/.exec(bare); if (j && NUMERIC.test(j[1]) && NUMERIC.test(j[2])) return `${j[1]} ÷ ${j[2]}`; }
  // 'Rozděl 60 v poměru 2:3' is 'Divide 60 in the ratio 2:3'
  if (v === "rozdel") { const j = /^(\d+(?:[.,]\d+)?)\s+v\s+pomeru\s+(\d+\s*:\s*\d+)\s*\.?$/.exec(bare); if (j) return `Divide ${j[1]} in the ratio ${j[2].replace(/\s+/g, "")}`; }
  // 'Uprav 18/24 na základní tvar' and 'Uprav na základní tvar 18/24' are 'Simplify 18/24'
  if (v === "uprav") {
    const j = /^(?:na\s+zakladni\s+tvar\s+(.+?)|(.+?)\s+na\s+zakladni\s+tvar)\s*\.?$/.exec(bare);
    if (j) return `Simplify ${(j[1] ?? j[2]).trim()}`;
  }
  const pair = VERB_OP[v];
  if (pair) { const j = /^(.+?)\s+a\s+(.+?)\s*\.?$/.exec(rest); return j && NUMERIC.test(j[1]) && NUMERIC.test(j[2]) ? `${j[1]} ${pair} ${j[2]}` : rest; }
  if (/^zkrat/.test(verb)) return `Simplify ${rest}`;
  if (/^(?:preved|zapis)/.test(verb)) {
    const c = /^(.+?)\s+(?:na|jako)\s+(desetinn\w*|zlomek|procent\w*|%)/.exec(fold(rest));
    if (c) return `Convert ${rest.slice(0, c[1].length)} to ${/^desetinn/.test(c[2]) ? "a decimal" : /^zlomek/.test(c[2]) ? "a fraction" : "a percentage"}`;
  }
  return rest;
}

/** A comma system writes its decimals with a comma. */
export const commaSystem = (system?: SchoolSystem) => system === "cz" || system === "de";

/**
 * The text with a middle dot read as ×, a colon between two fractions as ÷, and - only where the school system says so
 * - a decimal comma as a point ('0,3' is 0.3) and the Czech function names tg, cotg, arctg, arccotg as tan, cot, arctan and
 * pi/2 - arctan (calc-read czechNames, MB-B36). With no system the comma and the names are left as they were.
 */
export function plainTask(text: string, system?: SchoolSystem): string {
  let t = text.replace(/[·⋅∙]/g, "×")
    // Czech: 'Kolik je 3/4 z 20?' is 'What is 3/4 of 20?'; '20 procent ze 150' and '15 % ze 80' are percentages of an amount
    .replace(/^(\s*)kolik\s+je\s+/i, "$1What is ")
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:%|procent(?:a|o|ech|y)?)(?![\p{L}\d])/giu, "$1%")
    .replace(/(\d+\s*\/\s*\d+|\d+%)\s+(?:z|ze)\s+(?=\d)/gi, "$1 of ").replace(/(\d+\s*\/\s*\d+)\s*:\s*(?=\d+\s*\/\s*\d+)/g, "$1 ÷ ");
  if (commaSystem(system)) t = czechNames(t.replace(/(?<![\d.,])(\d+),(\d+)(?![\d,])/g, "$1.$2"));
  return t;
}

/**
 * Read a task with `read`: as written first, then in its plain forms, then with the leading instruction taken off. The
 * first reading that gives something is the answer; a text read today is therefore read as it was.
 */
export function readTask<T>(text: unknown, system: SchoolSystem | undefined, read: (t: string) => T | null): T | null {
  const own = read(text as string);
  if (own !== null || typeof text !== "string") return own;
  const plain = plainTask(text, system);
  if (plain !== text) { const a = read(plain); if (a !== null) return a; }
  const stripped = withoutInstruction(plain);
  return stripped !== plain ? read(stripped) : null;
}
