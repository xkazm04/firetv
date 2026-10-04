# Reduced-retention run during headless work

The same release APK accepted all 54,000 sent inputs with zero rejections. This run still failed the host-throughput gate: four pump delays of 104–174 ms occurred around seconds 68–71 while the headless balance jobs were running. Later input delivery stayed continuous. All ten classes activated. Frame p95/max remained over the original targets; memory and texture limits passed.

The exact harness is in `probe.mjs`. Screenshot readbacks were disabled, and repeated garage/career payloads were omitted from retained metric windows. This did not alter the game or any input-age/frame limit. The final run uses the same APK after headless jobs finish, with the controller process at AboveNormal priority. These are different host conditions, not evidence that one particular change caused a timing difference.
