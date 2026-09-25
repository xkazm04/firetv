/**
 * The one gate in front of the desk's API (lib/session/pairing.ts says who is who). Every API request is
 * classified from its cookies - the TV, a phone, or a guest - and the role is written into x-desk-role, over
 * anything the client sent. A guest gets through only to the session's own door: GET /api/session and its stream
 * (the lobby) and POST /api/session (the join, and what joining needs); every other route answers a guest 401, so
 * no pipeline route has to remember to check its caller.
 *
 * /tv?key=<the desk's key> is the TV's address as the desk prints it at start: it sets the desk-tv cookie and
 * sends the browser on to /tv without the key in its address. A wrong key sets nothing.
 */
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, JOIN_FIRST, ROLE_HEADER, TV_COOKIE, isTvKey, roleOf, tvToken } from "@/lib/session/pairing";

/** The lobby's door: what a guest may reach. */
const OPEN: Record<string, string[]> = { "/api/session": ["GET", "POST"], "/api/session/stream": ["GET"] };

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname === "/tv") {
    const key = searchParams.get("key");
    if (key === null) return NextResponse.next();
    if (!isTvKey(key)) return NextResponse.next();
    const to = req.nextUrl.clone(); to.searchParams.delete("key");
    const res = NextResponse.redirect(to);
    res.cookies.set(TV_COOKIE, tvToken(), COOKIE);
    return res;
  }
  const role = roleOf(req.cookies);
  if (role === "guest" && !OPEN[pathname.replace(/\/$/, "")]?.includes(req.method)) {
    return NextResponse.json({ error: JOIN_FIRST }, { status: 401 });
  }
  const headers = new Headers(req.headers);
  headers.set(ROLE_HEADER, role);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/api/:path*", "/tv"] };
