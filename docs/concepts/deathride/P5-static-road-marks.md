# P5 — retain static road geometry on the GPU

Design before implementation. P0 simpleperf identifies ShapeRenderer.rectLine
as 2.36% of total sampled CPU, with TrackScene.drawRoadMarks in its caller path.
The authored kerbs, grid and chevrons are already static descriptors, yet their
perpendicular vectors and six triangle vertices are rebuilt and uploaded every
frame. Retain their exact geometry in one bounded reusable mesh, prepared with
the existing scenery slices. Keep the live road texture, all markings, colors,
layer order and every effect. This adds one draw call and a small fixed vertex
buffer; compare device phase CPU/frame time before retaining it.

Validate the cached geometry against ShapeRenderer pixel output in a hidden
desktop GL check, including oblique and zero-length lines. Preserve procedural
fallbacks and context recreation. Report mesh bytes separately from texture
bytes. Do not reduce texture resolution or effect count in this wave.

## Results

The hidden desktop GL audit draws 1,000 reference ShapeRenderer lines and the
cache through three transforms, including a zero-length line. All 196,608
compared RGBA pixels match exactly. Capacity is 192,000 vertex bytes, with a
matching Java staging array and managed mesh backing; no additional texture.
The buffer is reused between courses and managed through GL context recreation.
A disabled-cache intent remains available for a same-APK comparison.

Two 360-second Stick arms use identical frozen APK
`2868f633d9a6ab87bb0fc9754b396ab911a3cacb3551be473d1828f336297ddd`
with vsync/display scheduling. Immediate versus cached marks: render CPU mean
8.772 ? 7.437 ms, p95 11.215 ? 9.983 ms; cars/effects phase mean
3.313 ? 2.212 ms, p95 4.895 ? 3.587 ms. Mean draw calls 15.57 ? 16.47,
p95/max remain 18. Active texture uploads are zero in both arms. These are
real race samples with differing combat outcomes, not identical replay frames.
The direct pixel test establishes the visual equivalence separately.

Cache arm: all 10,804 inputs per seat accepted, PSS 114.917?141.495 MiB;
active-window p95/max 20.339/46.439 ms. Frame target remains open despite lower
CPU; rare audio monitor/pacing stalls remain separately measured. Retain the
cache for the demonstrated CPU saving, not as a claim that it passes the frame
gate. All 170 tests and APK pass. The first repeated allocation test failure
in build.log was fixed in P4 and the successful rebuilds are retained.
