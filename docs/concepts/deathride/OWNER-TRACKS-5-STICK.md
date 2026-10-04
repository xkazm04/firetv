# Part 5 - Isolated Stick check

2026-10-04. Only dev.deathride.tracks is an authorized application ID. Never install, launch or stop dev.deathride.tv or another agent's package. Scan the current Wi-Fi /24 for TCP port 5555, inspect foreground state read-only, and mark pending when busy.

The host has Wi-Fi address 10.0.0.140/24. The bounded scan examined all 254 hosts in 10.0.0.0/24 at 15:41 UTC and found 10.0.0.139:5555. ADB identified the AFTKM Stick. At 15:43 UTC its resumed package was dev.deathride.perf. Device validation is pending/busy. No package was installed, no activity launched, no other app stopped, and no runtime performance or sofa-readability result is claimed. Starting the local ADB daemon and connecting were the only setup actions.

The required debug APK is built with appId=dev.deathride.tracks and racePort=8774. The final APK package and SHA-256 are retained beside the discovery and foreground evidence. Evidence: deathride/evidence/tracks/owner-part5. A later device run remains necessary when the Stick is free; this is the requested busy fallback, not a device pass. Final build/browser checks and commit are recorded in the session log.

Final local verification: aapt confirms dev.deathride.tracks; SHA-256 d0c52d5949c63ec8c01766b04750f029364c56fde9b44f696f782f9ebe5d1bfe. Required Gradle tasks pass in seven seconds with all 50 up-to-date, retaining 208 core + eight link + 43 game passing tests. Repeated desktop/mobile final atlas/report/sheet, default Lab, retained-candidate review, new-boss owner review/export and region review checks all pass. No device performance claim follows from these local checks. The part-4 Lab server's delayed startup-log flush is retained in this commit as evidence only.
