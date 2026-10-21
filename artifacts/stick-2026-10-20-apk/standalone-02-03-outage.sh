sleep 3
logcat -c
cmd wifi set-wifi-enabled disabled
sleep 22
screencap -p /sdcard/standalone-02-unreachable.png
cmd wifi set-wifi-enabled enabled
sleep 5
cmd wifi set-wifi-enabled enabled
sleep 35
screencap -p /sdcard/standalone-03-recovered.png
logcat -d -s StickKeys > /sdcard/standalone-outage.log
echo done
