"""Read-only TCP-5555 discovery on an explicitly supplied LAN /24."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from ipaddress import ip_network
from pathlib import Path
import json
import socket
import sys

subnet = ip_network(sys.argv[1], strict=True)
assert subnet.version == 4 and subnet.prefixlen == 24, 'Supply the active LAN /24'
out = Path(sys.argv[2])
assert not out.exists(), 'Keep old scans; choose a new filename'
def probe(address):
    with socket.socket() as sock:
        sock.settimeout(.4)
        return str(address) if sock.connect_ex((str(address),5555)) == 0 else None
with ThreadPoolExecutor(max_workers=48) as pool:
    reachable = [host for host in pool.map(probe,subnet.hosts()) if host]
record = dict(utc=datetime.now(timezone.utc).isoformat(),subnet=str(subnet),hostsScanned=254,port=5555,reachable=reachable)
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
