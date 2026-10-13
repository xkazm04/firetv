import path from "node:path";

/**
 * Where the desk keeps its files: DESK_DATA_DIR, else data/ under the working directory. Read on every call, never frozen
 * at import, so a test or tool that sets the variable after a module was first required still writes where it said.
 */
export const dataDir = (): string => process.env.DESK_DATA_DIR || path.join(process.cwd(), "data");
