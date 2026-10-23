import type { NextConfig } from "next";

/**
 * The phone opens this app from another device, and the TV may be opened by IP rather than
 * by name. Next 16 blocks dev-mode requests from any origin it was not told about — silently,
 * and hydration goes with them — so every way this machine can be addressed on the LAN is here.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.0.0.*", "192.168.*.*", "*.local"],
  outputFileTracingRoot: __dirname,
  // the dev build's "N" badge sat over the phone's bottom bar (Recap, Cancel) and the TV's bottom-left corner in every capture and in the demo film
  devIndicators: false,
  // the portable package (tools/package-portable.mjs) builds with DESK_STANDALONE=1: a self-contained server.js with only
  // the node_modules it traces. Without it the build is the usual one, so next start and next dev are unchanged.
  ...(process.env.DESK_STANDALONE === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
