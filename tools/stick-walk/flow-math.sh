#!/usr/bin/env bash
# Math Buddy on the stick (2026-10-21): landing -> Math Buddy -> homework ask -> Teach me -> Get ready -> Essay Back-out, on the operator's :3000.
# Landing order is Math Buddy, Linga, Essay Master, Writing (Linga is lit first, so Math is one Left). Makes no model call, never snaps a photo.
# Takes the shared lock only when the stick reads 10.0.0.141:3000 (lib.sh lock). Needs the 4-digit code from the pair screen for the phone panel: CODE=nnnn.
cd "$(dirname "$0")/../.."; . tools/stick-walk/lib.sh
lock math
k $BACK $BACK $BACK; cap m00-landing
k $LEFT $OK sleep:2; cap m01a-math-open
k $OK sleep:2; cap m02a-homework-nophone; k $BACK sleep:1; cap m03a-ask-cancelled
k $RIGHT $OK sleep:2; cap m04-teach-me; k $BACK sleep:1; cap m05-after-teach-back
k $RIGHT $RIGHT $OK sleep:2; cap m06-prepare; k $BACK sleep:1; cap m07-prepare-back
if [ -n "$CODE" ]; then
  k $BACK $UP $OK sleep:2; cap m09-pair-screen
  node tools/stick-walk/phone.cjs 360 "$CODE" $DESK $OUT | tail -3
  k $BACK $LEFT $OK sleep:1; k $OK sleep:2; cap m12-homework-ask-phone; sess screen ask awaiting
  for w in 360 414; do node tools/stick-walk/phone-shot.cjs $w $DESK $OUT math-ask; done
  node tools/stick-walk/phone-shot.cjs 360 $DESK $OUT math-cancelled Cancel | head -3; cap m13-after-phone-cancel
  k $BACK; cap m14-back-after-cancel
fi
k $BACK; cap e00-landing; k $RIGHT $RIGHT $OK sleep:2; cap e02-essay-home
k $DOWN $OK sleep:2; cap e03-essay-ask; k $BACK; cap e04-back1; k $BACK; cap e05-back2   # Back 1 cancels the ask, Back 2 leaves
[ -n "$CODE" ] && { k $UP $OK sleep:2 $RIGHT $OK sleep:2; cap f01-after-forget; k $BACK; }  # Forget every phone
adb -s $ADB shell am start -n dev.studydesk.stick/.StickActivity --es url "10.0.0.141:3000" >/dev/null; sleep 12
adb -s $ADB logcat -d -s StickKeys | grep " probe " | tail -1 > $OUT/m-restore-probe.txt
adb -s $ADB shell dumpsys window | grep -m1 mCurrentFocus >> $OUT/m-restore-probe.txt; cat $OUT/m-restore-probe.txt
unlock
