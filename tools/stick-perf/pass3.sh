#!/bin/sh
# tools/stick-perf/pass3.sh <port> <outdir> [scenarios|look]: one measuring hold on the stick against a temp desk on
# 127.0.0.1:<port> (adb reverse), docs/concepts/STICK-PERFORMANCE-2026-10-21.md "Pass 3". Takes the shared stick lock
# (tools/stick-walk/lib.sh), only when the stick is on the operator's desk; points the stick at the temp desk with its
# TV link; warms the landing; runs scenarios.sh (or the look stills); records meminfo and the stills' stats; then puts
# the stick back on 10.0.0.141:3000 with dev.studydesk.stick in focus, removes the tunnel and releases the lock.
# Env: KEY (the temp desk's TV key).
set -u
PORT=$1; OUT=$2; WHAT=${3:-scenarios}; S=10.0.0.139:5555; APP=dev.studydesk.stick
LOCK=/c/Users/kazda/AppData/Local/Temp/firetv-stick.lock; HERE=$(dirname "$0")
export MSYS_NO_PATHCONV=1
mkdir -p "$OUT"
onprod() { adb -s $S logcat -d -s StickKeys | grep " probe " | tail -1 | grep -q "10.0.0.141:3000"; }
restore() {
  adb -s $S shell am start -n $APP/.StickActivity --es url "10.0.0.141:3000" >/dev/null
  adb -s $S reverse --remove tcp:$PORT 2>/dev/null; adb -s $S forward --remove tcp:9222 2>/dev/null
  for i in 1 2 3 4 5 6 7 8 9 10; do sleep 3; onprod && break; done
  adb -s $S logcat -d -s StickKeys | grep " probe " | tail -1 > "$OUT/restore-probe.txt"
  adb -s $S shell dumpsys window | grep -m1 mCurrentFocus >> "$OUT/restore-probe.txt"
  cat "$OUT/restore-probe.txt"
  rm -rf "$LOCK"
}
until mkdir "$LOCK" 2>/dev/null; do sleep 15; done
if ! onprod; then rm -rf "$LOCK"; echo "the stick is not on 10.0.0.141:3000: not taking it"; exit 2; fi
echo "b7f0541d-perf3 $(date -u +%H:%M:%SZ) $WHAT :$PORT" > "$LOCK/owner"
trap restore EXIT
adb -s $S reverse tcp:$PORT tcp:$PORT >/dev/null
adb -s $S shell am start -n $APP/.StickActivity --es url "'http://127.0.0.1:$PORT/tv?key=$KEY'" >/dev/null
sleep 14
k() { adb -s $S shell input keyevent "$1"; sleep "${2:-2}"; }
# the lamp to Math Buddy (the first app), then one round trip so every world has been shown once
k DPAD_LEFT; k DPAD_LEFT; k DPAD_RIGHT 3; k DPAD_RIGHT 3; k DPAD_LEFT 3; k DPAD_LEFT 8
node $HERE/cdp.mjs "window.__ppStills ? window.__ppStills() : null" > "$OUT/stills.json"
adb -s $S shell dumpsys meminfo $APP > "$OUT/meminfo-rest.txt"
if [ "$WHAT" = look ]; then
  for w in maths english essay; do
    node $HERE/cdp.mjs '(()=>{for(const a of document.getAnimations()){if(a.effect?.getComputedTiming().iterations===Infinity)a.currentTime=0;else a.finish();a.pause()}const s=document.createElement("style");s.id="p3f";s.textContent=".pp-fx{visibility:hidden!important}";document.head.append(s);return 1})()' >/dev/null
    sleep 2; adb -s $S exec-out screencap -p > "$OUT/look-$w.png"
    node $HERE/cdp.mjs '(()=>{for(const a of document.getAnimations())a.play();document.getElementById("p3f")?.remove();return 1})()' >/dev/null
    k DPAD_RIGHT 5
  done
  k DPAD_LEFT 3; k DPAD_LEFT 3
else
  sh $HERE/scenarios.sh "$OUT"
  adb -s $S shell dumpsys meminfo $APP > "$OUT/meminfo-end.txt"
fi
