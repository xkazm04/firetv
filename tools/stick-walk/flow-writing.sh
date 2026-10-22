#!/usr/bin/env bash
# Writing on the stick (2026-10-21 17:xx): landing -> Writing -> prompt list -> pick -> phone hand-off -> Back, on the operator's :3000.
# Takes the shared lock only when the stick reads 10.0.0.141:3000 (lib.sh lock), makes no model call and presses no Send, then
# undoes what it changed (episode cleared, phone forgotten) and puts the stick back on :3000. Needs the 4-digit code from the pair screen: CODE=nnnn.
cd "$(dirname "$0")/../.."; . tools/stick-walk/lib.sh
lock writing
k $BACK $BACK; cap wr01-landing
k $RIGHT $RIGHT $RIGHT; cap wr04-writing-lit
k $OK sleep:2; cap wr05-prompt-list
k $DOWN $OK sleep:1; cap wr07-chosen
k $UP $OK sleep:2; cap wr08-handoff-no-phone; k $BACK $BACK        # no phone yet: the TV says so; Back cancels, Back leaves
k $UP $OK sleep:2; cap wr11-pair-screen
[ -n "$CODE" ] && node tools/stick-walk/phone.cjs 360 "$CODE" $DESK $OUT | tail -3
k $BACK $UP $RIGHT $RIGHT $RIGHT $OK sleep:2 $OK sleep:3; cap wr17-handoff-phone-joined
node tools/stick-walk/writing-panel.cjs $DESK $OUT                  # 360 and 414, types, never sends
k $BACK $BACK; cap wr20-back-landing
k $OK sleep:2 $DOWN $OK sleep:2 $BACK; cap wr22-landing-after-clear  # Another prompt clears the episode: "Not started"
k $UP $OK sleep:2 $RIGHT $OK sleep:2; cap wr24-after-forget; k $BACK  # Forget every phone
adb -s $ADB shell am start -n dev.studydesk.stick/.StickActivity --es url "10.0.0.141:3000" >/dev/null; sleep 12
adb -s $ADB logcat -d -s StickKeys | grep " probe " | tail -1 > $OUT/wr-restore-probe.txt
adb -s $ADB shell dumpsys window | grep -m1 mCurrentFocus >> $OUT/wr-restore-probe.txt; cat $OUT/wr-restore-probe.txt
unlock
