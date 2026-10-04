"""Adversarial checks against the audit process using real measured rows."""
import argparse
import csv
import json
import subprocess
import sys
import tempfile
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
audit = Path(__file__).with_name('audit-abilities.py')
scratch = Path(tempfile.mkdtemp(prefix='audit-check-', dir=args.source.parent))
results = []

def run_case(name, filename, mutate, expected_error=False, expected_finding=None, strict=False):
    with (args.source/filename).open(encoding='utf-8') as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        rows = [row for _, row in zip(range(20), reader)]
    mutate(rows)
    directory = scratch/name
    directory.mkdir()
    with (directory/filename).open('w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader(); writer.writerows(rows)
    run = subprocess.run([sys.executable, str(audit), str(directory)]+(['--strict'] if strict else []), capture_output=True, text=True)
    assert (run.returncode != 0) == expected_error, (name, run.stdout, run.stderr)
    if expected_finding:
        report = json.loads((directory/'audit.json').read_text())
        assert any(expected_finding in f for f in report['findings']), name
    results.append({'case': name, 'pass': True, 'exitCode': run.returncode})

on = 'roster-rookie-equal-technical-on.csv'
off = 'roster-rookie-equal-technical-off.csv'
run_case('valid-raw-rows', on, lambda rows: None)
run_case('wrong-winner', on, lambda rows: rows[0].update(winner='Invented'), expected_error=True)
run_case('duplicate-seed', on, lambda rows: rows[1].update(seed=rows[0]['seed']), expected_error=True)
run_case('repeated-state-alarm', on, lambda rows: [row.update(hash='1') for row in rows], expected_finding='repeated seed outcomes')
run_case('wrong-step-clock', on, lambda rows: rows[0].update(seconds='0'), expected_error=True)
run_case('ability-used-while-off', off, lambda rows: rows[0].update(uses='1|0|0|0|0|0'), expected_error=True)
run_case('incomplete-matrix-not-accepted', on, lambda rows: None, expected_error=True, strict=True)
args.output.write_text(json.dumps(results, indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps(results, indent=2))
