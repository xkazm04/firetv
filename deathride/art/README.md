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
