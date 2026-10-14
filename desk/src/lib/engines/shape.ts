/**
 * The shape rule every engine applies to every provider's answer: strip one markdown fence, parse, validate
 * against the caller's schema, or reject with EngineError("shape"). It checks shape only; what an answer
 * means is still decided by the caller and by lib/rules.
 *
 * The validator covers exactly the JSON-schema subset the desk writes: type (object, string, integer, number,
 * boolean, array), properties, required, additionalProperties: false, enum, minimum/maximum, minLength/maxLength
 * (counted in characters), minItems/maxItems, items. Any other keyword is not checked.
 */
import { call, deadlineFor } from "./call";
import { EngineError, type EngineKind, type EngineResult, type JSONSchema, type Provider } from "./types";

// ---- schema builders, shared by the callers that write their schemas inline

/** A plain object, or an empty one for anything else. */
export const object = (x: unknown): Record<string, unknown> => x && typeof x === "object" && !Array.isArray(x) ? x as Record<string, unknown> : {};
export const str = (maxLength: number, minLength = 1) => ({ type: "string", maxLength, minLength });
/** A closed object whose every property is required. */
export const schema = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
/** A trimmed, non-empty string of at most `max` characters, or `fail()` thrown. Characters are counted as validate() counts maxLength, so a string the schema let through is never refused here. */
export function fit(value: unknown, max: number, fail: () => Error): string {
  if (typeof value !== "string" || !value.trim() || [...value].length > max) throw fail();
  return value.trim();
}

// ---- the rule

/** One fence rule for every provider: ```json ... ``` around an answer is dropped. */
export const stripFence = (s: string) => s.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

const kindOf = (v: unknown) => v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v;
const at = (path: string, key: string | number) => typeof key === "number" ? `${path}[${key}]` : path ? `${path}.${key}` : key;
const typeOk = (want: unknown, v: unknown) => {
  const got = kindOf(v);
  return want === undefined || want === got || (want === "number" && got === "integer" && Number.isFinite(v as number));
};

/** One break: where, why in words, and "long" when it is only a string past its maxLength (the one a re-ask may repair). */
export type Break = [path: string, why: string, code?: "long"];
/** Every place `value` breaks `s`, first found first: [path, why, code?]. Empty when it fits. */
export function validate(value: unknown, s: JSONSchema, path = ""): Break[] {
  if (!typeOk(s.type, value)) return [[path, `expected ${s.type}, got ${kindOf(value)}`]];
  if (Array.isArray(s.enum) && !s.enum.includes(value)) return [[path, `${JSON.stringify(value)} is not one of ${s.enum.join("|")}`]];
  const out: Break[] = [];
  if (typeof value === "number") {
    if (typeof s.maximum === "number" && value > s.maximum) out.push([path, `${value} is over the maximum ${s.maximum}`]);
    if (typeof s.minimum === "number" && value < s.minimum) out.push([path, `${value} is under the minimum ${s.minimum}`]);
  }
  if (typeof value === "string") {
    const n = [...value].length;
    if (typeof s.maxLength === "number" && n > s.maxLength) out.push([path, `${n} characters, at most ${s.maxLength}`, "long"]);
    if (typeof s.minLength === "number" && n < s.minLength) out.push([path, `${n} characters, at least ${s.minLength}`]);
  }
  if (Array.isArray(value)) {
    if (typeof s.maxItems === "number" && value.length > s.maxItems) out.push([path, `${value.length} items, at most ${s.maxItems}`]);
    if (typeof s.minItems === "number" && value.length < s.minItems) out.push([path, `${value.length} items, at least ${s.minItems}`]);
    if (s.items && typeof s.items === "object") value.forEach((v, i) => out.push(...validate(v, s.items as JSONSchema, at(path, i))));
  }
  if (kindOf(value) === "object") {
    const o = value as Record<string, unknown>, props = object(s.properties);
    for (const [k, sub] of Object.entries(props)) if (k in o) out.push(...validate(o[k], sub as JSONSchema, at(path, k)));
    if (Array.isArray(s.required)) for (const k of s.required as string[]) if (!(k in o)) out.push([at(path, k), "missing"]);
    if (s.additionalProperties === false) for (const k of Object.keys(o)) if (!(k in props)) out.push([at(path, k), "not in the schema"]);
  }
  return out;
}

/** The rejection for a parsed answer that breaks `s`, naming its first five breaks. */
const outside = (provider: string, broken: Break[]) =>
  new EngineError("shape", provider, `${provider} answered outside the schema: ${broken.slice(0, 5).map(([p, why]) => `${p || "(answer)"} ${why}`).join("; ")}`, broken[0][0]);

/** The raw answer parsed: a string is fence-stripped and parsed, a parsed value is taken as is. */
function parse(raw: unknown, s: JSONSchema | undefined, provider: string): unknown {
  if (typeof raw !== "string") return raw;
  try { return JSON.parse(stripFence(raw)); } catch {
    if (!s) return raw;
    throw new EngineError("shape", provider, `${provider} did not answer with JSON: ${raw.slice(0, 120)}`, "");
  }
}

/**
 * The raw answer as the caller's shape. A string is fence-stripped and parsed; a parsed value is taken as is.
 * With no schema there is no contract: JSON when it parses, the text otherwise.
 */
export function conform<T>(raw: unknown, s: JSONSchema | undefined, provider: string): T {
  const value = parse(raw, s, provider);
  if (!s) return value as T;
  const broken = validate(value, s);
  if (broken.length) throw outside(provider, broken);
  return value as T;
}

/** Breaks that are all strings running past their maxLength: the one kind a re-ask may repair. Read from the code validate() set, never from its wording. */
export const onlyTooLong = (broken: Break[]) => broken.length > 0 && broken.every(([, , code]) => code === "long");

/**
 * `value` with every string over its maxLength cut at a word boundary (the last whole word that fits, trailing
 * punctuation and space dropped). A string with no boundary inside its limit is left alone, so it still fails.
 */
export function cutLong(value: unknown, s: JSONSchema): unknown {
  if (typeof value === "string") {
    const chars = [...value];
    if (typeof s.maxLength !== "number" || chars.length <= s.maxLength) return value;
    const head = chars.slice(0, s.maxLength).join(""), whole = /\s/.test(chars[s.maxLength]);
    const at = whole ? head.length : head.search(/\s\S*$/);
    const cut = (at > 0 ? head.slice(0, at) : "").replace(/[\s,;:\-–—]+$/, "");
    return cut || value;
  }
  if (Array.isArray(value) && s.items && typeof s.items === "object") return value.map(v => cutLong(v, s.items as JSONSchema));
  if (kindOf(value) === "object") {
    const o = value as Record<string, unknown>, props = object(s.properties);
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k in props ? cutLong(v, props[k] as JSONSchema) : v]));
  }
  return value;
}

/**
 * Run one provider and hold its answer to the request's schema: the whole of text() and vision().
 * With `shorten`, an answer broken ONLY by strings over their maxLength is asked for once more with each
 * overrun named; the second answer is held to the same schema, and if it fails too the first rejection
 * stands. No limit moves. If the second answer is still broken ONLY by overlong strings, each is cut at a word
 * boundary (cutLong) rather than failing the learner's screen; any other break, or a run with no boundary, fails.
 */
export async function answer<Req extends { schema?: JSONSchema; accept?: JSONSchema; prompt?: string; shorten?: boolean; timeoutMs?: number; use?: string }, T>(p: Provider<Req, unknown>, req: Req, kind: EngineKind = "text"): Promise<EngineResult<T>> {
  const started = Date.now(), deadline = deadlineFor(kind, p, req);
  const s = req.accept ?? req.schema;
  // the answer is parsed and held to the schema inside call(), so the ledger row says shape when it is (call.ts accept)
  let value: unknown, broken: Break[] = [], name = "";
  let first: EngineError;
  try {
    const { answer: a } = await call(kind, p, req, 1, undefined, (got, provider) => {
      name = provider; value = parse(got.raw, s, provider); broken = s ? validate(value, s) : [];
      if (broken.length) throw outside(provider, broken);
    });
    return { json: value as T, provider: name, ms: Date.now() - started, raw: a.audit };
  } catch (e) {
    if (!(e instanceof EngineError) || e.kind !== "shape" || !broken.length) throw e;
    first = e;
  }
  if (!req.shorten || typeof req.prompt !== "string" || !onlyTooLong(broken)) throw first;
  const named = broken.map(([path, why]) => `${path || "(answer)"} is ${why}`).join("; ");
  console.info(`[engines] ${name} re-asked once to shorten: ${named}`);
  // one deadline across both attempts: the re-ask gets what is left of the first one's, never a fresh one
  const remaining = deadline - (Date.now() - started);
  if (remaining <= 0) throw first;
  try {
    // the second answer, or its word-boundary cut when only lengths still break; anything else is a shape row for try 2
    let kept: unknown;
    const { answer: b, provider: again } = await call(kind, p, { ...req, prompt: `${req.prompt}\n\nYour previous answer was:\n${JSON.stringify(value)}\nIt broke length limits. Shorten: ${named}. Rewrite only those strings within their limits, keep every other field as it was, and return the whole JSON object again.` }, 2, remaining, (got, provider) => {
      const second = parse(got.raw, s, provider), left = s ? validate(second, s) : [];
      kept = second;
      if (left.length && onlyTooLong(left)) { const cut = cutLong(second, s!); if (!validate(cut, s!).length) { kept = cut; return; } }
      if (left.length) throw outside(provider, left);
    });
    return { json: kept as T, provider: again, ms: Date.now() - started, raw: b.audit };
  } catch (e) {
    // a second answer that is still malformed leaves the first, clearer rejection; a re-ask that timed out, exited or
    // could not be reached is that, as the ledger row for try 2 already says - never relabelled as the first's shape
    if (e instanceof EngineError && e.kind !== "shape") throw e;
    throw first;
  }
}
