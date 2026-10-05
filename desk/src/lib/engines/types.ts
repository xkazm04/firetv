/**
 * The engine contracts. Each one is a swap: today a local tool, later an AWS service, and the
 * prompts and schemas on the calling side never change. `provider` says which ran.
 *
 * The schema a caller passes is the contract for every provider alike: the engine parses the answer
 * once, validates it once (shape.ts), and either resolves with that shape or rejects with an EngineError.
 * A provider only produces a raw answer; which one runs is the registry's choice (registry.ts).
 */
export type JSONSchema = Record<string, unknown>;

/** `schema` is what the model is asked for; `accept`, when set, is the looser shape the caller holds the answer to (optional parts it checks and drops itself); `shorten` allows one re-ask when the answer only runs strings past their maxLength (shape.ts); `thinking: false` asks the provider to answer without hidden reasoning, for a short call where speed is the product (a provider without that switch ignores it). */
export interface TextRequest { system: string; prompt: string; schema?: JSONSchema; accept?: JSONSchema; model?: "fast" | "best"; timeoutMs?: number; isolated?: boolean; shorten?: boolean; thinking?: boolean; }
export interface VisionRequest { imageBase64: string; prompt: string; schema?: JSONSchema; timeoutMs?: number; }
export interface SpeakRequest { text: string; voice?: string; timeoutMs?: number; }
export interface EmbedRequest { texts: string[]; timeoutMs?: number; }
export interface ListenRequest { audio: Blob; filename: string; timeoutMs?: number; }
export interface Heard { text: string; language?: string; }

export interface EngineResult<T> { json: T; provider: string; ms: number; raw?: string; }

/**
 * What a provider hands back: its raw answer (a string to parse, or an already parsed value), the provider
 * string to report (defaults to the provider's name) and, optionally, an audit excerpt kept as EngineResult.raw.
 */
export interface ProviderAnswer<R> { raw: R; provider?: string; audit?: string; }
/** What the call core hands a provider besides the request: a signal that aborts when the deadline passes (call.ts). A provider that can stop its work (kill a child, abort a fetch) listens; one that cannot is still cut off by the core. */
export interface CallContext { signal: AbortSignal; }
/** `deadlineMs`, when set, is a floor under every deadline for this provider (codex starts an agent session per call). */
export interface Provider<Req, R> { name: string; deadlineMs?: number; run(req: Req, ctx?: CallContext): Promise<ProviderAnswer<R>>; }

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
