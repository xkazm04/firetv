---
id: 0002
kind: decision
scope: path:vision/
date: 2026-10-05
supersedes: null
refs: [path:docs/FRAME-ANALYSIS-LESSONS.md, path:docs/USE-CASE-OPTIONS.md]
---

The telestrator's sports-analytics direction (tracking players, measuring from broadcast frames) was
investigated and **closed**. Do not propose reopening it as a feature. **Why:** a local vision model
proved a good describer and a poor measurer, and the advanced graphics on real broadcasts come from
venue sensors, not from anything visible in the picture. What survived is the domain-neutral
technique for asking a model about a paused frame (`vision/`, `docs/FRAME-ANALYSIS-LESSONS.md`).
The follow-on directions were scored in `docs/USE-CASE-OPTIONS.md`. Source: README, "Where the product is going".
