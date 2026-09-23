/**
 * The one place that decides which provider answers for an engine. Each engine module registers its
 * providers and the rule that chooses among them (text: DESK_TEXT_ENGINE picks codex, else claude-cli;
 * speak: piper when configured, else elevenlabs; listen: elevenlabs when STT_URL points at it, else
 * gravitone; vision and embed: ollama). A test swaps any engine the same way:
 *
 *   useProvider("text", { name: "stub", run: async (req) => ({ raw: '{"hint":"Look at x"}' }) });
 *   ...
 *   resetProviders();
 *
 * The engine functions (text, vision, embed, speak, listen) still own parsing and the schema check, so a
 * stub is held to the caller's schema exactly as a real provider is.
 */
import { EngineError, type EngineKind, type Providers } from "./types";

type Any = Providers[EngineKind];
const registered: { [K in EngineKind]?: { providers: Map<string, Providers[K]>; choose: () => string } } = {};
const overrides: { [K in EngineKind]?: Providers[K] } = {};

/** Called once by each engine module: its providers, and the rule that names the one to use now. */
export function register<K extends EngineKind>(kind: K, providers: Providers[K][], choose: () => string): void {
  (registered as Record<K, { providers: Map<string, Providers[K]>; choose: () => string }>)[kind] = { providers: new Map(providers.map((p) => [p.name, p])), choose };
}

/** Put `impl` in front of the registered providers for this kind, until resetProviders(). */
export function useProvider<K extends EngineKind>(kind: K, impl: Providers[K]): void {
  (overrides as Record<K, Providers[K]>)[kind] = impl;
}

/** Drop the overrides, for one kind or for all. */
export function resetProviders(kind?: EngineKind): void {
  for (const k of kind ? [kind] : (Object.keys(overrides) as EngineKind[])) delete overrides[k];
}

/** The name of the provider a call would use now. Starts nothing. */
export function activeProvider(kind: EngineKind): string {
  const o = overrides[kind] as Any | undefined;
  if (o) return o.name;
  const r = registered[kind];
  if (!r) throw new EngineError("unreachable", kind, `No ${kind} engine is registered.`);
  return r.choose();
}

/** The provider a call uses now. */
export function provider<K extends EngineKind>(kind: K): Providers[K] {
  const o = overrides[kind];
  if (o) return o as Providers[K];
  const name = activeProvider(kind), p = (registered[kind]?.providers as Map<string, Providers[K]> | undefined)?.get(name);
  if (!p) throw new EngineError("unreachable", name, `The ${kind} engine has no provider named ${name}.`);
  return p;
}
