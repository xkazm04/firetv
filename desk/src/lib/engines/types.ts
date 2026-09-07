/**
 * The engine contracts. Each one is a swap: today a local tool, later an AWS service, and the
 * prompts and schemas on the calling side never change. `provider` says which ran.
 */
export type JSONSchema = Record<string, unknown>;

export interface TextRequest { system: string; prompt: string; schema?: JSONSchema; model?: "fast" | "best"; }
export interface VisionRequest { imageBase64: string; prompt: string; schema?: JSONSchema; }
export interface SpeakRequest { text: string; voice?: string; }
export interface EmbedRequest { texts: string[]; }

export interface EngineResult<T> { json: T; provider: string; ms: number; raw?: string; }
