# Reproducible art workspace

Run commands from the repository root. Install `deathride/tools/art/requirements.txt` in a dedicated Python environment if the installed packages differ. Generation uses the logged-in Grok CLI, and image grading uses local Ollama only.

```
python deathride/tools/art/gen.py --mode dry-run
python deathride/tools/art/gen.py --mode proof --batch p1-cars
# Inspect the generated proof and contact sheet before recording the concrete finding:
python deathride/tools/art/gen.py --mode approve-proof --batch p1-cars --review-note "<inspection finding>"
python deathride/tools/art/gen.py --mode run --batch p1-cars
# Repeat proof/review for p1-tiles. Once both proofs are bound to these briefs:
python deathride/tools/art/gen.py
python -m unittest discover -s deathride/tools/art -p "test_*.py"
```

The final command regenerates all ten current P1 assets (`briefs/p1-current.csv`) or verifies and reuses the existing outputs, without more spend. Proof approval is agent inspection of batch direction, **not owner acceptance**. Changing a brief or style invalidates its proof. Used IDs cannot change; issue a new revision. Generation failures and uncertain outcomes require explicit diagnosis and a new revision, never a blind resume retry.

`GROK_MAX_PARALLEL_IMAGES` bounds workers (default and ceiling four); each dispatch reserves one image under a filesystem lock. `usage.json` is the weekly conservative reservation counter. `history.jsonl` holds every dispatch/result, full prompts, hashes and origin. Interrupted reservations remain spent. Never remove a stop latch or increase `budget.json` automatically. A stale lock requires inspection of its recorded process ID before recovery. No videos are allowed.

Raw images, CLI transcripts, processed candidates and PNG owner contact sheets are local, git-ignored products. Versioned briefs and compact evidence permit reconstruction. Only accepted atlas pages plus sidecars belong in `deathride/assets`; a review candidate must not be renamed accepted. Runtime integration belongs to I1 and retains the procedural fallback.

For the supported local Python dependency set, use `deathride/.art-venv/Scripts/python.exe` (create with `python -m venv deathride/.art-venv`, then install the requirements). P2 commands:

```
python deathride/tools/art/process.py
python deathride/tools/art/calibrate.py
python deathride/tools/art/grade.py --input deathride/art/calibration/diagnostic-input.json --batch calibration
python deathride/tools/art/calibrate.py --report
python deathride/tools/art/report.py --batch p1-cars --semantic-batch calibration --family-batch p1-cars
```

Use the environment's Python in place of `python`. Grading uses both local models sequentially and caches exact image/prompt/schema/model-digest inputs. See `ACCEPTANCE.md` for the measured diagnostic failures and pending human calibration. `report.py` refuses stale pixel-gate reports. The driver enforces the attempt cap across revision IDs as well as within one ID.

P4 delivery: open `review.html` for owner sheets, actual material repeats, per-class references and effect previews. Read `DELIVERY.md` for the catalog, alpha/pivot convention, content aliases and integration limits. `selections.json` is executing-agent technical selection only; all owner approvals remain false. `reports/p4-delivery-audit.json` reconciles every reservation and final source hash. Accepted bundle `deathride/assets/phase2-v1` is immutable and contains enough data for validation without ignored raw images.

```
python deathride/tools/art/validate_bundle.py
python deathride/tools/art/review_index.py
python deathride/tools/art/audit_delivery.py
```

For a replacement bundle, rebuild current candidates through `process.py`, `p4_catalog.py` and `grade.py --input deathride/art/reports/p4-world-candidates-deterministic.json --batch p4-world-final`, inspect source and actual exported pixels, then update hash-bound selections. Local remedies have separate recipes (`wrap_tiles.py`, `recover_gravel.py`, `recover_ice.py`); effect extraction is in `animation.py`. `atlas.py --draft` builds and validates a temporary bundle, while `atlas.py` refuses to overwrite an existing accepted version. Mint a new bundle version for changes. One-time `p4_*repairs.py`, `p4_final_additions.py` and `recover_false_quota.py` scripts are preserved history, not resume commands.

The original `grok-4.7` metadata names the CLI orchestration model, not a disclosed image-engine version. Seeds are unknown. The single false stop caused by a token count of 429 is audited separately; actual HTTP/status/error 429 and quota messages still latch the first-error stop. No actual quota error occurred in this execution.
