/**
 * One place that answers two questions every tool here has to ask: *which* device am I driving,
 * and *where* do I reach the pen server on it.
 *
 * They are separate questions, and on real hardware they have different answers. The emulator
 * cycle reached the TV through an adb tunnel, so "the device" and "127.0.0.1:8765" were the same
 * thing and nothing had to say so. A Stick on Wi-Fi is `10.0.0.142:5555` to adb and
 * `10.0.0.142:8765` to the pen socket, and deliberately NOT tunnelled — the whole point of
 * testing on hardware is to make the traffic cross real Wi-Fi.
 *
 * Environment:
 *   ADB          path to the adb binary
 *   ADB_SERIAL   device selector, e.g. 10.0.0.142:5555 (empty = adb's only attached device)
 *   TV_HOST      host:port of the pen server, e.g. 10.0.0.142:8765
 *   TV_URL       full base URL; derived from TV_HOST unless set explicitly
 *   TV_RELAY_HOST  how the *device* addresses this machine (see hostAddressForDevice)
 *
 * scripts/dev.ps1 -Device <ip> sets all of these.
 */
import { execFileSync } from 'node:child_process';
import os from 'node:os';

export const ADB_BIN =
  process.env.ADB ?? 'C:/Users/kazda/scoop/apps/android-clt/current/platform-tools/adb.exe';

/** Empty means "whatever adb has attached", which is right when there is exactly one. */
export const ADB_SERIAL = process.env.ADB_SERIAL ?? '';

export const TV_HOST = process.env.TV_HOST ?? '127.0.0.1:8765';
export const TV_BASE = process.env.TV_URL ?? `http://${TV_HOST}`;

/** True when the TV is reached over the loopback tunnel rather than across a real network. */
export const IS_TUNNELLED = /^(127\.0\.0\.1|localhost)\b/.test(TV_HOST);

/**
 * adb, already pointed at the right device. Returns a Buffer, because one caller pulls a PNG
 * through it and decoding that as text corrupts it.
 */
export function makeAdb({ maxBuffer = 1 << 28, timeout } = {}) {
  const selector = ADB_SERIAL ? ['-s', ADB_SERIAL] : [];
  // Capture stderr rather than inheriting it. adb narrates progress there even when it succeeds
  // ("1 file pulled, 0 skipped"), and PowerShell turns any stderr line from a native command into
  // a terminating error under ErrorActionPreference=Stop - so inheriting it fails the dev script
  // on a *successful* pull. Piping keeps it out of the way; execFileSync still throws on a real
  // non-zero exit, with the captured stderr attached to the error.
  return (...a) =>
    execFileSync(ADB_BIN, [...selector, ...a], { maxBuffer, timeout, stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * The address *this machine* has from the device's point of view — needed whenever the TV has to
 * dial back to something we are hosting, as the relay test does.
 *
 * The emulator has a fixed alias for its host (10.0.2.2). A real Stick does not: it has to be
 * given this machine's LAN address, and this machine may have several (Wi-Fi, Ethernet, WSL,
 * Docker, VPN). Pick the interface whose address shares the longest prefix with the device's, so
 * a Hyper-V switch on 172.x never wins over the Wi-Fi adapter the Stick is actually on.
 */
export function hostAddressForDevice(tvHost = TV_HOST) {
  if (process.env.TV_RELAY_HOST) return process.env.TV_RELAY_HOST;
  const deviceIp = tvHost.split(':')[0];
  if (deviceIp === '127.0.0.1' || deviceIp === 'localhost') return '10.0.2.2';

  const candidates = Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n.address);
  if (!candidates.length) {
    throw new Error(`no non-loopback IPv4 address on this machine to offer ${deviceIp}`);
  }

  const octets = (ip) => ip.split('.').map(Number);
  const shared = (a, b) => {
    const [x, y] = [octets(a), octets(b)];
    let n = 0;
    while (n < 4 && x[n] === y[n]) n++;
    return n;
  };
  return candidates.sort((a, b) => shared(b, deviceIp) - shared(a, deviceIp))[0];
}

/** The PIN in the last pairing line MainActivity logged (`transport=... pairing=<url>?pin=NNNN`), or undefined. */
export const pinFromLogcat = (log) => [...log.matchAll(/pairing=\S*[?&]pin=(\d{4})/g)].at(-1)?.[1];

/**
 * The pairing PIN for a tool that pairs as a pen. /health no longer carries it: anything that can reach the port
 * could read it there. Read it where only an authorised adb client can - the pairing line MainActivity logs at
 * launch - or take --pin, the one on the TV's QR card. Exits 2 with a sentence when neither is there. The read is
 * bounded: with no device attached, `adb logcat` waits for one forever instead of failing.
 */
export function pairingPin(args, tag, adb = makeAdb({ timeout: 10_000 })) {
  if (args.pin) return args.pin;
  let log;
  try {
    log = adb('logcat', '-d', '-s', 'Telestrator:I').toString();
  } catch (e) {
    console.error(`[${tag}] cannot read logcat over adb; pass --pin <PIN>.`, e.message);
    process.exit(2);
  }
  const pin = pinFromLogcat(log);
  if (!pin) {
    console.error(`[${tag}] no pairing line in logcat; relaunch the TV app or pass --pin <PIN>`);
    process.exit(2);
  }
  return pin;
}
