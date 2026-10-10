/**
 * A printed task as the readers can read it (MB-B2). A worksheet in Czech or English opens with an instruction
 * ('Řeš rovnici', 'Vypočítej:', 'Solve', 'Work out'), writes a product with a middle dot and a quotient of fractions
 * with a colon, and in a comma system a decimal with a comma. Each reader (rules/kinds readQuestion, rules/calc and
 * rules/school specFromQuestion, rules/maths equationOf and expressionOf) first reads the text exactly as it is; only
 * when that reads as nothing is it offered again in these forms, so a text read today is read as it was.
 *
 * Pure: no store, no engine; imports only the diacritics fold and a type.
 */
import { fold } from "./numberWords";
import type { SchoolSystem } from "../session/store";
export type { SchoolSystem };

/** A leading instruction in Czech or English, matched on the text with its diacritics folded: 'Řešte rovnici', 'Work out', 'Derivujte:'. */
const INSTRUCTION = new RegExp(
  String.raw`^\s*(?:(?:\d{1,2}[.)]|\(\d{1,2}\)|[a-h]\)|\([a-h]\))\s+)?` +
  String.raw`(res(?:te)?|vypocit(?:ej|ejte)|vypoctete|spoctete|spocti(?:te)?|spocitej(?:te)?|derivuj(?:te)?|urcete|urci|najdete|najdi|solve|calculate|work out|find)\b` +
  String.raw`(?:\s+(?:rovnici|priklad|ulohu|limitu|derivaci|hodnotu|vyraz|equation))?\s*:?\s*`,
  "i",
);
const DERIVE = /^deriv/i;

/** The text without its leading instruction ('Derivujte: y = x^2' keeps its verb, as 'Differentiate y = x^2'); the text itself when it has none. */
export function withoutInstruction(text: string): string {
  const t = text.normalize("NFC"), m = INSTRUCTION.exec(fold(t));
  if (!m || m[0].length === 0) return text;
  const rest = t.slice(m[0].length);
  return DERIVE.test(m[1]) ? `Differentiate ${rest}` : rest;
}

/** A comma system writes its decimals with a comma. */
export const commaSystem = (system?: SchoolSystem) => system === "cz" || system === "de";

/**
 * The text with a middle dot read as ×, a colon between two fractions as ÷, and - only where the school system says so
 * - a decimal comma as a point ('0,3' is 0.3). With no system the comma is left as it was.
 */
export function plainTask(text: string, system?: SchoolSystem): string {
  let t = text.replace(/[·⋅∙]/g, "×").replace(/(\d+\s*\/\s*\d+)\s*:\s*(?=\d+\s*\/\s*\d+)/g, "$1 ÷ ");
  if (commaSystem(system)) t = t.replace(/(?<![\d.,])(\d+),(\d+)(?![\d,])/g, "$1.$2");
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
