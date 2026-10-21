#!/bin/sh
# rec.sh <name> <secs> <outdir> -- <steps>: screenrecords the stick (960x540) while it runs the steps, then pulls the mp4.
# Steps: K:<keyevent> (a remote key), W:<seconds>, U:<url> (hand the running app a link), C:<url> (force-stop, cold start on the link).
export MSYS_NO_PATHCONV=1
S=10.0.0.139:5555
name=$1; secs=$2; out=$3; shift 4
adb -s $S shell "rm -f /sdcard/wf-$name.mp4"
adb -s $S shell screenrecord --time-limit $secs --size 960x540 --bit-rate 8000000 /sdcard/wf-$name.mp4 &
rp=$!
sleep 1.5
for a in "$@"; do
  case $a in
    K:*) adb -s $S shell input keyevent ${a#K:} ;;
    W:*) sleep ${a#W:} ;;
    U:*) adb -s $S shell am start -n dev.studydesk.stick/.StickActivity --es url "'${a#U:}'" >/dev/null ;;
    C:*) adb -s $S shell am force-stop dev.studydesk.stick; adb -s $S shell am start -n dev.studydesk.stick/.StickActivity --es url "'${a#C:}'" >/dev/null ;;
  esac
done
wait $rp
sleep 1
adb -s $S pull /sdcard/wf-$name.mp4 "$out/$name.mp4" >/dev/null && echo "pulled $out/$name.mp4"
