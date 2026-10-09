# Backlog — drained UAT findings

The tracked backlog `/uat drain` writes into (homes: `uat/README.md`, *Drain homes*; analysis documents: `docs/uat-insights/<run-id>.md`). One section per module. Every entry has this format:

```
- **<id>** — <one-line title>
  - origin: <run>/<finding-id>, or "<quoted Character voice>" (<character>, <run>)
  - recommendation: build | concept-doc | method-commitment | decline-with-reason (<the reason>)
  - status: open | built <commit> | resolved-verified <recertify ref>
  - ceiling: <what the Character still cannot do once this lands>
```

- **id**: module prefix and a number, never reused (`LG-1`, `EM-B1`, `MB-B1`).
- **origin**: no entry without one; an idea with no finding id and no voice does not enter.
- **recommendation**: a `method-commitment` names its trigger ("every release re-runs journey X"); a `decline-with-reason` keeps its reason here so it cannot return as a fresh idea without new evidence.
- **status**: `built <commit>` is code landed, not done; `resolved-verified` takes a recertify with live evidence against the originating Character.
- **ceiling**: the honest limit that remains, stated before the build, revised by the recertify.

## Linga

## Essay Master

## Math Buddy
