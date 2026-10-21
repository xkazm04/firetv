#!/bin/sh
# tools/stick-perf/scenarios.sh <outdir>: every measured run, in order, one perf.mjs trace each (docs/concepts/STICK-PERFORMANCE-2026-10-20.md).
# Starts on the landing with Ema seated, a phone joined and the lamp on Math Buddy; each run leaves the desk where the next starts.
P="node $(dirname "$0")/perf.mjs"; O=$1
k() { adb -s 10.0.0.139:5555 shell input keyevent "$1"; sleep "${2:-2}"; }
$P landing-idle $O W:5
$P lamp-right $O K:DPAD_RIGHT W:2 K:DPAD_RIGHT W:2
$P lamp-left $O K:DPAD_LEFT W:2 K:DPAD_LEFT W:2
$P open-maths $O K:DPAD_CENTER W:4
$P maths-idle $O W:5
$P back-maths $O K:BACK W:3
k DPAD_RIGHT 3
$P open-linga $O K:DPAD_CENTER W:4
$P linga-idle $O W:5
$P back-linga $O K:BACK W:3
k DPAD_RIGHT 3
$P open-essay $O K:DPAD_CENTER W:4
$P essay-idle $O W:5
$P back-essay $O K:BACK W:3
k DPAD_LEFT 2; k DPAD_LEFT 3
