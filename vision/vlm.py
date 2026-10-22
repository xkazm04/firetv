"""
The local vision model, behind one function.

Runs against Ollama on this machine — no network, no cloud account, no per-call cost. See
docs/FRAME-ANALYSIS-LESSONS.md for what this model can and cannot be asked to do; the short
version is that it describes a still frame well, cannot see a process in one, and must never be
asked to count or to do arithmetic.

    from vlm import ask, b64, loads
    out, seconds = ask([b64("page.jpg")], "What is written here?", SCHEMA)

What the lab needs: Python 3, Ollama with the model pulled (`ollama pull qwen3.8:27b`), and Pillow for
point.py and poc_ocr.py (`pip install pillow` - the import is `PIL`, the package is not). Everything
else is the standard library. Run the scripts from the repo root (`python vision/poc_ocr.py`).
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

# The model answers with whatever characters it likes, and a Windows console defaults to cp1250,
# which raises on the first emoji rather than printing it. Anything that prints model output wants
# this, so it lives here.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
MODEL = os.environ.get("OLLAMA_VISION_MODEL", "qwen3.8:27b")


def ask(images, prompt, schema=None, timeout=600):
    """
    One question. `images` is a list of base64 strings (may be empty for a text-only call).

    Pass `schema` — a JSON Schema — whenever the answer will be parsed. Ollama enforces it in the
    decoder, so it is a guarantee rather than a request, and it removes a whole class of "the model
    wrapped its JSON in prose" failures. But read §6 and §8 of the lessons first: a schema whose
    enum cannot express the real answer produces a confident wrong one that reads exactly like a
    model error, and a list of categories will get one picked whether or not it applies.
    """
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt, "images": images}],
        "stream": False,
        "options": {"temperature": 0, "num_ctx": 16384},
    }
    if schema:
        body["format"] = schema

    started = time.time()
    try:
        res = _post({**body, "think": False}, timeout)
    except urllib.error.HTTPError:
        # A model with no thinking mode rejects the key outright. One retry without it; anything
        # else is a real error and should surface.
        res = _post(body, timeout, final=True)
    return res["message"]["content"], time.time() - started


def _post(body, timeout, final=False):
    """One POST to /api/chat. The final attempt's failure is said the way desk's engine says it (host, model, the
    command to run - desk/src/lib/engines/vision.ts ollamaProbe), with Ollama's own reply kept, not a bare traceback."""
    req = urllib.request.Request(
        f"{HOST}/api/chat",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        return json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        if not final:
            raise
        said = e.read().decode("utf-8", "replace")[:300]
        hint = f": run `ollama pull {MODEL}`" if e.code == 404 else ""
        raise RuntimeError(f"ollama at {HOST} answered {e.code} for {MODEL}{hint}. It said: {said}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"ollama is not reachable at {HOST} ({e.reason}): start it with `ollama serve`, "
                           f"or point OLLAMA_HOST at it.") from None
    except TimeoutError:
        # Connected, then no answer in time: urllib wraps a timeout while sending, not while waiting for the
        # reply. Not retried - the same request would wait as long again. A cold load of a large model is slow.
        raise RuntimeError(f"ollama at {HOST} gave no answer for {MODEL} within {timeout} s: check `ollama ps` "
                           f"(a cold load of a large model takes minutes), or pass a longer timeout.") from None


def b64(path):
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def loads(text):
    """Structured output should already be JSON. Return None rather than raising when it is not."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None
