import { networkInterfaces, type NetworkInterfaceInfo } from "node:os";

type Interfaces = NodeJS.Dict<NetworkInterfaceInfo[]>;

/** An adapter whose name says it is a virtual switch, not the network a phone is on. */
const VIRTUAL = /vethernet|wsl|hyper-v|docker|virtualbox|vmware/i;

/** 0 is the best: the home LAN ranges first, then the other private ones, the VPN's, link-local, then the rest. */
function rank(ip: string): number {
  const [a, b] = ip.split(".").map(Number);
  if (a === 192 && b === 168) return 0;
  if (a === 10) return 1;
  if (a === 172 && b >= 16 && b <= 31) return 2;
  if (a === 100 && b >= 64 && b <= 127) return 3;
  if (a === 169 && b === 254) return 4;
  return 5;
}

/**
 * The host a phone should be sent to: DESK_PHONE_HOST when it is set, else the best non-internal IPv4 address
 * (rank() above; within a rank an adapter that looks virtual comes last, and ties keep the adapter order), else localhost.
 * tools/desk-dev-https.cjs asks for the same answer.
 */
export function lanHost(interfaces?: Interfaces, env: NodeJS.ProcessEnv = process.env): string {
  const forced = env.DESK_PHONE_HOST?.trim();
  if (forced) return forced;
  const found: { ip: string; rank: number; virtual: boolean; at: number }[] = [];
  // read lazily: a forced host above pays no adapter scan
  for (const [name, list] of Object.entries(interfaces ?? networkInterfaces())) {
    for (const n of list ?? []) {
      const family = n?.family as string | number | undefined;
      if (!n || n.internal || (family !== "IPv4" && family !== 4)) continue;
      found.push({ ip: n.address, rank: rank(n.address), virtual: VIRTUAL.test(name), at: found.length });
    }
  }
  found.sort((x, y) => x.rank - y.rank || Number(x.virtual) - Number(y.virtual) || x.at - y.at);
  return found[0]?.ip ?? "localhost";
}
