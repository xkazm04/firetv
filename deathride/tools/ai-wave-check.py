"""Serial wave gate. Logs failures; never commits or changes approval state."""
from pathlib import Path
import json
import os
import subprocess
import sys
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
os.chdir(root)
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
env = {**os.environ, 'DEATHRIDE_BROWSER_PORT': '8772'}
commands = [
    ['cmd', '/c', str(root/'gradlew.bat'), ':core:test', ':link:test', ':game:test', ':app:assembleDebug', ':desktop:installDist', ':core:reportClasspath'],
    ['python', 'tools/hud-browser-suite.py', str(out/'browser'), 'browser-check', 'combat-check', 'ability-controller-check', 'hud-browser-check', 'campaign-browser-check', 'duel-browser-check'],
]
if (root/'ai/design/index.html').exists():
    commands.append(['node', 'tools/ai-review-check.mjs', str(out/'review-browser')])
for i, command in enumerate(commands):
    with (out/f'check-{i}.log').open('w', encoding='utf-8') as log:
        result = subprocess.run(command, env=env, stdout=log, stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW)
    print(command[0], result.returncode, flush=True)
    if result.returncode:
        sys.exit(result.returncode)
counts = {}
for module in ('core', 'link', 'game'):
    suites = [ET.parse(p).getroot() for p in (root/module/'build/test-results/test').glob('TEST-*.xml')]
    counts[module] = {key: sum(int(s.attrib[key]) for s in suites) for key in ('tests', 'failures', 'errors')}
(out/'passed.json').write_text(json.dumps(dict(commands=commands, counts=counts), indent=2)+'\n')
