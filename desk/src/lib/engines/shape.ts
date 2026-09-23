/**
 * The shape rule every engine applies to every provider's answer: strip one markdown fence, parse, validate
 * against the caller's schema, or reject with EngineError("shape"). It checks shape only; what an answer
 * means is still decided by the caller and by lib/rules.
 *
 * The validator covers exactly the JSON-schema subset the desk writes: type (object, string, integer, number,
 * boolean, array), properties, required, additionalProperties: false, enum, minLength/maxLength (counted in
 * characters), minItems/maxItems, items. Any other keyword is not checked.
 */
import { EngineError, type EngineResult, type JSONSchema, type Provider } from "./types";

// ---- schema builders, shared by the callers that write their schemas inline

/** A plain object, or an empty one for anything else. */
export const object = (x: unknown): Record<string, unknown> => x && typeof x === "object" && !Array.isArray(x) ? x as Record<string, unknown> : {};
export const str = (maxLength: number, minLength = 1) => ({ type: "string", maxLength, minLength });
/** A closed object whose every property is required. */
export const schema = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
/** A trimmed, non-empty string of at most `max` characters, or `fail()` thrown. */
export function fit(value: unknown, max: number, fail: () => Error): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw fail();
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

/** Every place `value` breaks `s`, first found first: [path, why]. Empty when it fits. */
export function validate(value: unknown, s: JSONSchema, path = ""): Array<[string, string]> {
  if (!typeOk(s.type, value)) return [[path, `expected ${s.type}, got ${kindOf(value)}`]];
  if (Array.isArray(s.enum) && !s.enum.includes(value)) return [[path, `${JSON.stringify(value)} is not one of ${s.enum.join("|")}`]];
  const out: Array<[string, string]> = [];
  if (typeof value === "string") {
    const n = [...value].length;
    if (typeof s.maxLength === "number" && n > s.maxLength) out.push([path, `${n} characters, at most ${s.maxLength}`]);
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

/**
 * The raw answer as the caller's shape. A string is fence-stripped and parsed; a parsed value is taken as is.
 * With no schema there is no contract: JSON when it parses, the text otherwise.
 */
export function conform<T>(raw: unknown, s: JSONSchema | undefined, provider: string): T {
  let value = raw;
  if (typeof raw === "string") {
    try { value = JSON.parse(stripFence(raw)); } catch {
      if (!s) return raw as T;
      throw new EngineError("shape", provider, `${provider} did not answer with JSON: ${raw.slice(0, 120)}`, "");
    }
  }
  if (!s) return value as T;
  const broken = validate(value, s);
  if (broken.length) throw new EngineError("shape", provider, `${provider} answered outside the schema: ${broken.slice(0, 5).map(([p, why]) => `${p || "(answer)"} ${why}`).join("; ")}`, broken[0][0]);
  return value as T;
}

/** Run one provider and hold its answer to the request's schema: the whole of text() and vision(). */
export async function answer<Req extends { schema?: JSONSchema; accept?: JSONSchema }, T>(p: Provider<Req, unknown>, req: Req): Promise<EngineResult<T>> {
  const started = Date.now();
  const a = await p.run(req);
  const name = a.provider ?? p.name;
  return { json: conform<T>(a.raw, req.accept ?? req.schema, name), provider: name, ms: Date.now() - started, raw: a.audit };
}
