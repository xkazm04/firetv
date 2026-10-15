/**
 * At every start the desk prints the TV's address, key included (the Jupyter-token pattern): the TV browser opens
 * it once and is the TV from then on (src/proxy.ts sets its cookie). The key is minted on the first start into
 * DESK_DATA_DIR/pairing.json (lib/session/pairing.ts).
 *
 * It is also the outermost door (error-handling: crash-capture): a request that throws past its handler, and a
 * promise nobody awaited (the session ticker, a fire-and-forget job), reach the server log with where they happened.
 * Only the error's name, message and digest are written - never a request body, which can carry a learner's answer.
 */
import type { Instrumentation } from "next";

export async function register() {
  // the documented guard: the edge build drops the import, so the key's node: modules stay on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { tvAddress } = await import("./lib/session/pairing");
    console.log(`\n  TV: ${tvAddress()}\n  Open it once on the TV; phones join with the code the TV shows.\n`);
    // once per process: next dev can call register again, and a second listener would log each failure twice
    const g = globalThis as { deskCrashDoor?: boolean };
    if (!g.deskCrashDoor) {
      g.deskCrashDoor = true;
      process.on("unhandledRejection", (e) => console.error(`[crash] unhandled rejection: ${said(e)}`));
      process.on("uncaughtExceptionMonitor", (e, origin) => console.error(`[crash] ${origin}: ${said(e)}`));
    }
  }
}

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const digest = (err as { digest?: string }).digest;
  console.error(`[crash] ${request.method} ${request.path} (${context.routeType} ${context.routePath}): ${said(err)}${digest ? ` digest ${digest}` : ""}`);
};

function said(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}${e.stack ? `\n${e.stack.split("\n").slice(1, 6).join("\n")}` : ""}` : String(e);
}
