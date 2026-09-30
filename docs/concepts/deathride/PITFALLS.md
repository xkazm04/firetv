# Death Ride pitfalls

- 2026-09-30 W1: `adb am start` can report success while the Stick display is asleep and libGDX has not opened its listener. Send WAKEUP (224), confirm `dumpsys power` Awake/ON, then launch. Keep-screen-on prevents sleeping after the activity is active; it does not wake an already sleeping device.
- 2026-09-30 W1: Java 22 StrictMath FdLibm sin/cos/pow allocate temporary arrays in some compiled paths. JFR pinned double-array allocations to these functions (274 MB / 10,000 baseline steps). Small-angle polynomial trig plus exp/log powers avoids that runtime dependency; accuracy checked over 20,001 angles and every preset checked for zero allocation after warmup. Do not weaken the allocation gate to hide the runtime cost.
