import type { NextConfig } from "next";

/**
 * The phone opens this app from another device, and the TV may be opened by IP rather than
 * by name. Next 16 blocks dev-mode requests from any origin it was not told about — silently,
 * and hydration goes with them — so every way this machine can be addressed on the LAN is here.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.0.0.*", "192.168.*.*", "*.local"],
  outputFileTracingRoot: __dirname,
  // the browser check's own server builds apart, so it runs beside a `next dev` already holding .next/dev
  ...(process.env.DESK_NEXT_DIST_DIR ? { distDir: process.env.DESK_NEXT_DIST_DIR } : {}),
};

export default nextConfig;
