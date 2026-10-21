cd "$(dirname "$0")/../.."; . tools/stick-walk/lib.sh
lock math
k $BACK $BACK $BACK; cap m00-landing; sess screen ask
k $LEFT $LEFT $OK; cap m01-tonight
k $OK sleep:2; cap m02-homework-ask; sess screen ask awaiting
for w in 360 414; do node tools/stick-walk/phone-shot.cjs $w $DESK $OUT math-ask | head -2; done
k $BACK; cap m03-ask-cancelled
k $RIGHT $OK sleep:2; cap m04-teach-me
k $BACK sleep:1; cap m05-after-teach-back
k $RIGHT $RIGHT $OK sleep:2; cap m06-prepare
k $BACK sleep:1; cap m07-prepare-back; sess screen ask
unlock
