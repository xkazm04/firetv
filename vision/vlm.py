"""
The local vision model, behind one function.

Runs against Ollama on this machine — no network, no cloud account, no per-call cost. See
docs/FRAME-ANALYSIS-LESSONS.md for what this model can and cannot be asked to do; the short
version is that it describes a still frame well, cannot see a process in one, and must never be
asked to count or to do arithmetic.

    from vlm import ask, b64, loads
    out, seconds = ask([b64("page.jpg")], "What is written here?", SCHEMA)
"""
import base64
import json
import os
import sys
import time
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
        res = _post(body, timeout)
    return res["message"]["content"], time.time() - started


def _post(body, timeout):
    req = urllib.request.Request(
        f"{HOST}/api/chat",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req, timeout=timeout))


def b64(path):
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def loads(text):
    """Structured output should already be JSON. Return None rather than raising when it is not."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None
