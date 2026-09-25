/**
 * At every start the desk prints the TV's address, key included (the Jupyter-token pattern): the TV browser opens
 * it once and is the TV from then on (src/proxy.ts sets its cookie). The key is minted on the first start into
 * DESK_DATA_DIR/pairing.json (lib/session/pairing.ts).
 */
export async function register() {
  // the documented guard: the edge build drops the import, so the key's node: modules stay on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { tvAddress } = await import("./lib/session/pairing");
    console.log(`\n  TV: ${tvAddress()}\n  Open it once on the TV; phones join with the code the TV shows.\n`);
  }
}
