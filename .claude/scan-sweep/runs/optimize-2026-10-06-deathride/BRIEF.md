# /scan-sweep --optimize, Death Ride (deathride/), 2026-10-06

Contexts (disjoint write sets): R render hot path (game/ except RaceGame HUD text), S sim+startup (core/), L link+controller (link/, controller/), B build+assets+APK (app/, assets/, gradle, tools).
Known baseline: Stick frame p95 ~20-22 ms vs 16.7 target, worst 37-55 ms; PSS 107-140 MiB; startup was minutes until the lazy candidates fix (Tracks.kt, 54a66fcf); APK 73 MB. Owner ruling N3: keep the full feature package, do NOT cut effects or lower render scale; optimise cost per effect.
Every claim needs a figure (before/after). Rungs: gate > probe > experiment > simulation. Instruments that exist: desktop `--smoke --audit`, `--soak`, FrameProfiler, allocation audits, evidence/perf/*, :core:test benchmarks.
