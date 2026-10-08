"""P18: what the perf app allocates, per call site, from ART's own allocation tracker (DDMS chunks over JDWP).

The debuggable perf package (dev.deathride.perf) exposes JDWP through adb. This client speaks only DDM chunks (command set
199): HELO, REAQ (whether tracking is on), REAE (allocation tracking on/off) and REAL (the recent allocation records). Each record is
one allocation: its size, its thread, its class and up to 16 frames of its stack. Tracking is switched on for a short window,
read, and switched off again, so each sample holds every allocation of that window (complete when it holds fewer than ART's
65,535 recent records) and the app runs untracked between samples.

Usage:
  python -I tools/perf-p18-alloc.py sample OUT_DIR [--every 10] [--window 0.5] [--count N] [--start-after S] [--stop-file F]
      samples until --count samples are taken, --stop-file exists or the app exits; writes OUT_DIR/alloc-samples.jsonl.gz
  python -I tools/perf-p18-alloc.py probe OUT_DIR     one sample of 0.5 s, to check that the device serves the chunks

Cost to the device: switching tracking on or off suspends every thread once (ART instruments the allocation entry points);
while it is on, every allocation also walks up to 16 stack frames and stores the record. The cost is measured per run by
comparing the profile rows inside the sample windows with those outside them (perf-p18-audit.py).
"""
import argparse, gzip, json, socket, struct, subprocess, sys, time
from pathlib import Path

DEVICE = '10.0.0.139:5555'
ADB = ['adb', '-P', '5041', '-s', DEVICE]
PACKAGE = 'dev.deathride.perf'
LOCAL_PORT = 8718


def adb(*args, timeout=30):
    return subprocess.check_output([*ADB, *args], timeout=timeout, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))


def chunk_type(s):
    return struct.unpack('>I', s.encode())[0]


def type_name(t):
    return struct.pack('>I', t).decode('latin-1')


class Ddm:
    def __init__(self, port):
        self.s = socket.create_connection(('127.0.0.1', port), timeout=20)
        self.s.sendall(b'JDWP-Handshake')
        got = self._read(14)
        assert got == b'JDWP-Handshake', got
        self.next_id = 1

    def _read(self, n):
        buf = b''
        while len(buf) < n:
            part = self.s.recv(n - len(buf))
            if not part:
                raise ConnectionError('JDWP closed')
            buf += part
        return buf

    def _packet(self):
        head = self._read(11)
        length, pid, flags = struct.unpack('>IIB', head[:9])
        body = self._read(length - 11)
        return pid, flags, head[9:11], body

    def _chunks(self, data):
        out, o = [], 0
        while o + 8 <= len(data):
            t, n = struct.unpack_from('>II', data, o)
            out.append((type_name(t), data[o + 8:o + 8 + n]))
            o += 8 + n
        return out

    def send(self, name, payload=b''):
        """A chunk ART answers with no reply packet (REAE)."""
        pid = self.next_id
        self.next_id += 1
        data = struct.pack('>II', chunk_type(name), len(payload)) + payload
        self.s.sendall(struct.pack('>IIBBB', 11 + len(data), pid, 0, 0xC7, 0x01) + data)

    def request(self, name, payload=b''):
        pid = self.next_id
        self.next_id += 1
        data = struct.pack('>II', chunk_type(name), len(payload)) + payload
        self.s.sendall(struct.pack('>IIBBB', 11 + len(data), pid, 0, 0xC7, 0x01) + data)
        while True:
            rid, flags, rest, body = self._packet()
            if flags & 0x80 and rid == pid:
                err = struct.unpack('>H', rest)[0]
                if err:
                    raise RuntimeError(f'{name}: JDWP error {err}')
                chunks = self._chunks(body)
                for cn, cp in chunks:
                    if cn == 'FAIL':
                        code, n = struct.unpack_from('>II', cp, 0)
                        raise RuntimeError(f'{name}: FAIL {code} {cp[8:8 + 2 * n].decode("utf-16-be", "replace")}')
                return chunks
            # anything else is an event chunk from the VM (APNM, WAIT, ...): not needed here


def parse_real(p):
    """ddmlib's AllocationsParser format: header, entries, then class, method and file string tables."""
    hlen, elen, flen = p[0], p[1], p[2]
    n, str_off, nclass, nmethod, nfile = struct.unpack_from('>HIHHH', p, 3)
    o = str_off
    def table(count):
        nonlocal o
        out = []
        for _ in range(count):
            k = struct.unpack_from('>I', p, o)[0]
            out.append(p[o + 4:o + 4 + 2 * k].decode('utf-16-be', 'replace'))
            o += 4 + 2 * k
        return out
    classes, methods, files = table(nclass), table(nmethod), table(nfile)
    entries, o = [], hlen
    for _ in range(n):
        size, tid, cls, depth = struct.unpack_from('>IHHB', p, o)
        o += elen
        frames = []
        for _ in range(depth):
            c, m, f, line = struct.unpack_from('>HHHh', p, o)
            frames.append((c, m, line))
            o += flen
        entries.append((size, tid, cls, frames))
    return {'classes': classes, 'methods': methods, 'files': files, 'entries': entries}


def tracking(d):
    """REAQ: whether ART's allocation tracker is on (REAE itself gets no reply, so each switch is confirmed by it)."""
    return next(cp for cn, cp in d.request('REAQ') if cn == 'REAQ')[0] == 1


def connect():
    pid = adb('shell', 'pidof', PACKAGE).decode().strip()
    if not pid:
        return None, None
    adb('forward', f'tcp:{LOCAL_PORT}', f'jdwp:{pid}')
    d = Ddm(LOCAL_PORT)
    d.request('HELO', struct.pack('>I', 1))
    if tracking(d):  # a previous client left it on
        d.send('REAE', b'\x00')
        assert not tracking(d)
    return pid, d


def thread_names(pid):
    """Linux tid -> thread name (the records' thread ids are the tids)."""
    out = {}
    for ln in adb('shell', 'ps', '-T', '-p', pid, '-o', 'TID,CMD').decode(errors='replace').splitlines()[1:]:
        parts = ln.split(None, 1)
        if len(parts) == 2 and parts[0].isdigit():
            out[int(parts[0])] = parts[1].strip()
    return out


def device_clock():
    """Device realtime minus host time (s), from one `date` read bracketed by host times; and the bracket's width."""
    t0 = time.time()
    dev = float(adb('shell', 'date', '+%s.%N').decode().strip())
    t1 = time.time()
    return {'offsetSeconds': dev - (t0 + t1) / 2, 'bracketSeconds': t1 - t0}


def sample(d, window):
    t0 = time.time()
    d.send('REAE', b'\x01')
    assert tracking(d), 'tracking did not switch on'
    t1 = time.time()
    time.sleep(window)
    t2 = time.time()
    chunks = d.request('REAL')
    t3 = time.time()
    d.send('REAE', b'\x00')
    assert not tracking(d), 'tracking did not switch off'
    t4 = time.time()
    payload = next(cp for cn, cp in chunks if cn == 'REAL')
    rec = parse_real(payload)
    # On: from the REAE send (t0) until ART served REAL (between t2 and t3); records older than the window cannot exist,
    # because switching tracking off clears ART's records.
    return {'utc': t0, 'enableSeconds': t1 - t0, 'windowSeconds': t2 - t1, 'readSeconds': t3 - t2, 'disableSeconds': t4 - t3,
            'onSeconds': t2 - t0 + (t3 - t2) / 2, 'onUtc': [t0, t2 + (t3 - t2) / 2], 'records': len(rec['entries']),
            'full': len(rec['entries']) >= 65535, 'payloadBytes': len(payload), **rec}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['sample', 'probe'])
    ap.add_argument('out', type=Path)
    ap.add_argument('--every', type=float, default=10.0)
    ap.add_argument('--window', type=float, default=0.5)
    ap.add_argument('--count', type=int, default=1000)
    ap.add_argument('--start-after', type=float, default=0.0)
    ap.add_argument('--stop-file', type=Path, help='stop (between samples) once this file exists')
    a = ap.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    pid, d = connect()
    if d is None:
        sys.exit('perf app not running')
    meta = {'pid': pid, 'mode': a.mode, 'every': a.every, 'window': a.window, 'startedUtc': time.time()}
    if a.mode == 'probe':
        s = sample(d, a.window)
        s['threads'] = thread_names(pid)
        (a.out / 'alloc-probe.json').write_text(json.dumps({**meta, 'sample': {k: v for k, v in s.items() if k != 'entries'},
            'entriesHead': s['entries'][:20]}, indent=1))
        print(json.dumps({k: s[k] for k in ('records', 'full', 'payloadBytes', 'windowSeconds', 'readSeconds', 'enableSeconds', 'disableSeconds')}))
        return
    time.sleep(a.start_after)
    path = a.out / 'alloc-samples.jsonl.gz'
    taken = 0
    with gzip.open(path, 'wt') as f:
        meta['deviceClock'] = min((device_clock() for _ in range(5)), key=lambda c: c['bracketSeconds'])
        f.write(json.dumps({'meta': meta}) + '\n')
        nxt = time.time()
        while taken < a.count and not (a.stop_file and a.stop_file.exists()):
            nxt += a.every
            try:
                s = sample(d, a.window)
                s['threads'] = thread_names(pid)
            except (ConnectionError, OSError, RuntimeError, AssertionError, subprocess.SubprocessError) as e:
                f.write(json.dumps({'stop': repr(e), 'utc': time.time()}) + '\n')
                break
            f.write(json.dumps(s) + '\n')
            f.flush()
            taken += 1
            print(json.dumps({'sample': taken, 'records': s['records'], 'full': s['full'], 'read': round(s['readSeconds'], 3)}), flush=True)
            while time.time() < nxt and not (a.stop_file and a.stop_file.exists()):
                time.sleep(min(0.25, max(0.0, nxt - time.time())))
        try:
            f.write(json.dumps({'end': time.time(), 'deviceClock': min((device_clock() for _ in range(5)), key=lambda c: c['bracketSeconds'])}) + '\n')
        except (OSError, subprocess.SubprocessError) as e:
            f.write(json.dumps({'end': time.time(), 'deviceClockError': repr(e)}) + '\n')
    print(json.dumps({'samples': taken, 'path': str(path)}))


if __name__ == '__main__':
    main()
