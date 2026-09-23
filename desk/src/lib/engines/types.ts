/**
 * The engine contracts. Each one is a swap: today a local tool, later an AWS service, and the
 * prompts and schemas on the calling side never change. `provider` says which ran.
 *
 * The schema a caller passes is the contract for every provider alike: the engine parses the answer
 * once, validates it once (shape.ts), and either resolves with that shape or rejects with an EngineError.
 * A provider only produces a raw answer; which one runs is the registry's choice (registry.ts).
 */
export type JSONSchema = Record<string, unknown>;

export interface TextRequest { system: string; prompt: string; schema?: JSONSchema; model?: "fast" | "best"; timeoutMs?: number; isolated?: boolean; }
export interface VisionRequest { imageBase64: string; prompt: string; schema?: JSONSchema; }
export interface SpeakRequest { text: string; voice?: string; }
export interface EmbedRequest { texts: string[]; }
export interface ListenRequest { audio: Blob; filename: string; }
export interface Heard { text: string; language?: string; }

export interface EngineResult<T> { json: T; provider: string; ms: number; raw?: string; }

/**
 * What a provider hands back: its raw answer (a string to parse, or an already parsed value), the provider
 * string to report (defaults to the provider's name) and, optionally, an audit excerpt kept as EngineResult.raw.
 */
export interface ProviderAnswer<R> { raw: R; provider?: string; audit?: string; }
export interface Provider<Req, R> { name: string; run(req: Req): Promise<ProviderAnswer<R>>; }

export interface Providers {
  text: Provider<TextRequest, unknown>;
  vision: Provider<VisionRequest, unknown>;
  embed: Provider<EmbedRequest, unknown>;
  speak: Provider<SpeakRequest, Buffer>;
  listen: Provider<ListenRequest, Heard>;
}
export type EngineKind = keyof Providers;

/**
 * Why an engine call failed. shape: the answer does not match the caller's schema (`path` names the first
 * field, "" for the whole answer); timeout: no answer in time; exit: the provider ran and failed (a non-zero
 * exit or an error status); unreachable: the provider could not be started or reached, or none is configured.
 */
export type EngineErrorKind = "shape" | "timeout" | "exit" | "unreachable";
export class EngineError extends Error {
  constructor(public kind: EngineErrorKind, public provider: string, message: string, public path?: string) {
    super(message);
    this.name = "EngineError";
  }
}
