"""Bounded /24 ADB discovery. Does not connect to or modify discovered devices."""
import argparse
import concurrent.futures
from datetime import datetime, timezone
import ipaddress
import json
import socket
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("subnet", help="LAN /24, e.g. 10.0.0.0/24")
parser.add_argument("--output", type=Path)
args = parser.parse_args()
network = ipaddress.ip_network(args.subnet, strict=True)
if network.version != 4 or network.prefixlen != 24:
    parser.error("Only an explicit IPv4 /24 is supported")


def scan(address):
    try:
        with socket.create_connection((str(address), 5555), timeout=0.5):
            return str(address)
    except OSError:
        return None


with concurrent.futures.ThreadPoolExecutor(max_workers=64) as pool:
    reachable = [address for address in pool.map(scan, network.hosts()) if address]
result = json.dumps({"utc": datetime.now(timezone.utc).isoformat(),
                     "subnet": str(network), "hostsScanned": network.num_addresses - 2,
                     "port": 5555, "reachable": reachable}, indent=2)
if args.output:
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(result + "\n", encoding="utf-8")
print(result)
