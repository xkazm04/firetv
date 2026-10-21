#!/usr/bin/env bash
# Shared stick walk helpers. A flow script sources this, calls lock once, then k/cap/phone, then unlock (or exits: trap).
# The stick and the desk's session are shared with other builders: hold the lock for a whole flow (<= ~5 min), not per key.
LOCK=${LOCK:-/c/Users/kazda/AppData/Local/Temp/firetv-stick.lock}
ADB=${ADB:-10.0.0.139:5555}
OUT=${OUT:-artifacts/stick-2026-10-21-walk}
DESK=${DESK:-http://localhost:3000}
export PW=${PW:-C:/Users/kazda/kiro/firetv/tools/node_modules/playwright}
onprod() { adb -s $ADB logcat -d -s StickKeys | grep " probe " | tail -1 | grep -q "10.0.0.141:3000"; }
# take the lock, then check the stick is on the production desk (:3000): the perf builder may point it at its own port (adb reverse). If not, give the lock back and wait.
lock() { until mkdir "$LOCK" 2>/dev/null; do sleep 20; done; if ! onprod; then rm -rf "$LOCK"; sleep 20; lock "$1"; return; fi; echo "be6aa5c7-walk $(date -u +%H:%M:%SZ) $1" > "$LOCK/owner"; trap 'rm -rf "$LOCK"' EXIT; }
unlock() { rm -rf "$LOCK"; trap - EXIT; }
k() { for x in "$@"; do case $x in sleep:*) sleep "${x#sleep:}";; hold:*) adb -s $ADB shell input keyevent --longpress "${x#hold:}"; sleep 1;; *) adb -s $ADB shell input keyevent "KEYCODE_$x"; sleep 1.2;; esac; done; sleep 1.3; }
cap() { adb -s $ADB exec-out screencap -p > "$OUT/$1.png" && echo "cap $1"; }
sess() { node tools/stick-walk/session.cjs $DESK $OUT "$@"; }
UP=DPAD_UP; DOWN=DPAD_DOWN; LEFT=DPAD_LEFT; RIGHT=DPAD_RIGHT; OK=DPAD_CENTER; BACK=BACK; MENU=MENU; PLAY=MEDIA_PLAY_PAUSE
