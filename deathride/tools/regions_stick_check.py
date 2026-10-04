"""Read-only /24 TCP/5555 discovery and foreground check. Never installs or launches."""
import argparse
import concurrent.futures
import datetime
import ipaddress
import json
from pathlib import Path
import shutil
import socket
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("--subnet", required=True)
parser.add_argument("--output", required=True, type=Path)
args = parser.parse_args()
network = ipaddress.ip_network(args.subnet, strict=True)
assert network.version == 4 and network.prefixlen == 24


def probe(host):
    try:
        with socket.create_connection((str(host), 5555), timeout=.35):
            return f"{host}:5555"
    except OSError:
        return None


with concurrent.futures.ThreadPoolExecutor(max_workers=64) as pool:
    found = sorted(x for x in pool.map(probe, network.hosts()) if x)
adb = shutil.which("adb")
devices = []
for host in found:
    assert adb, "adb must be available for foreground inspection"
    connection = subprocess.run([adb, "connect", host], capture_output=True, text=True, timeout=15)
    activity = subprocess.run([adb, "-s", host, "shell", "dumpsys", "activity", "activities"], capture_output=True, text=True, timeout=15)
    foreground = "\n".join(line.strip() for line in activity.stdout.splitlines() if "ResumedActivity" in line or "mFocusedActivity" in line)
    devices.append(dict(host=host, connect=connection.stdout.strip(), foreground=foreground))
busy = any("dev.deathride." in d["foreground"] for d in devices)
result = dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(), subnet=str(network), port=5555,
              hostsScanned=254, found=found, devices=devices, requestedPackage="dev.deathride.regions",
              status="pending-busy" if busy else "inspect-before-use" if found else "pending-unreachable",
              installed=False, launched=False, stoppedOtherApps=False, frameTimeDeltaMs=None)
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result, indent=2))
