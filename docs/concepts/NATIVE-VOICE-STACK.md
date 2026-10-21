# Native voice stack for Fire TV (TO-BE)

Status: design, 2026-10-21. Spark `voice-audio-on-tv`. Standard read: registry `software-engineering/voice-io`
(engine-abstraction, on-device-vs-cloud, bounded-playback-wait, real-time-synthesis-budget).

## AS-IS: what the Study Desk prototype does today

| Direction | Where | Behaviour |
|---|---|---|
| Speaking, Math / Essay / hint / break | `desk/src/app/tv/page.tsx:87-99`, lines from `desk/src/lib/desk/spoken.ts` | `POST /api/speak` -> `engines/voice.ts` (Piper if `PIPER_BIN`+`PIPER_VOICE`, else ElevenLabs, else the browser's `speechSynthesis`). Voice toggle defaults on. |
| Speaking, Linga | `desk/src/english/useEnglishAudio.ts` | Same endpoint, 12 s timeout, slow rate (0.85) only in the browser fallback. |
| Listening | phone: browser Web Speech (`desk/src/app/phone/page.tsx:439`); `engines/listen.ts` (gravitone) only behind the web test bar | The TV never listens. |
| Native `tv-app` | none | No `TextToSpeech`, no `SpeechRecognizer`. The desk is a web page in Silk. |

Not verified live as of this date: `/api/speak` answers 401 to an unpaired caller, and no audible check was made.

## TO-BE decisions (operator, 2026-10-21)

1. **Speech out: Android `TextToSpeech`, on device.** Offline, free, no learner text leaves the box. Rejected: cloud voice with
   a device cache (a second, better voice, but a network dependency and a bill) and Piper in the APK (licence of
   `en_US-lessac-medium` is an open gate, Stick CPU headroom unproven).
2. **Remote mic: `SpeechRecognizer`, on demand.** The learner presses mic on a screen that allows a spoken answer. Rejected:
   phone-only mic and a server transcriber fed by `AudioRecord`.
3. **Prove it on the device first** with the debug probe below, before any rebuild depends on either.

## Contract the native app must keep

- **The spoken line is a pure function of the session** (port of `spokenLine`): hint, sentence explanation, essay summary, walk
  verdict, break, and the Linga partner line. The model explains; the line is chosen in code. Every spoken line is also on
  screen as text (voice-io: audio is never the only copy).
- **One engine seam per direction** (`TtsEngine.speak(text, rate)`, `SttEngine.listen()`), no screen names an engine. Today's
  desk seam is `engines/voice.ts` and `engines/listen.ts`; the native seam mirrors it so a later cloud voice is an adapter.
- **Bounded wait.** A line that has not started within a budget (desk uses 12 s; the probe measures the real figure) is
  dropped to captions, never queued behind. A new line replaces the old one.
- **Capture is on demand with a visible indicator**; no audio is stored; the transcript is editable; typing on the phone stays a
  full alternative (the TV never asks for typing, so the phone carries it).
- **Slow repeat** (rate 0.85) exists on the native path, unlike the desk's cloud path.

## Deviations from the golden path (recorded, not lowered)

- Native voice and desk voice will differ (platform TTS vs ElevenLabs/Piper). The brand voice identity technique
  (`authored-voice-identity`) is not met on the native side by decision 1.
- `SpeechRecognizer` on Fire OS may route audio to a vendor cloud; the on-device default for capture is then not guaranteed.
  The probe records which recogniser answers.

## The probe (debug builds only)

`tv-app/src/debug/.../voiceprobe/VoiceProbeActivity.kt`, launched from the leanback launcher as "Voice probe". It is merged
only into the debug manifest and adds `RECORD_AUDIO` there, so the release manifest is unchanged. It makes no model calls.

Run (operator): `node tools/gradlew.cjs :tv-app:installDebug`, open "Voice probe" on the Stick, press SELECT, speak when it
says LISTENING. If the mic prompt does not appear: `adb shell pm grant dev.telestrator.tv android.permission.RECORD_AUDIO`.
Read the report: `adb pull /sdcard/Android/data/dev.telestrator.tv/files/voice-probe.json` (also logcat tag `VoiceProbe`).

| Key | Meaning | Ship bar |
|---|---|---|
| `ttsReady`, `ttsInitMs` | engine starts, and how long | ready; init well under the bounded wait |
| `engines`, `defaultEngine`, `voices` | what the Stick offers (`q` = quality, `net` = needs network) | an en-US voice without `net=true` |
| `enUsSupport` | `>=0` usable, `-1` data missing, `-2` unsupported | `>=0` |
| `firstAudioMs[12]` | request to first audio; entries 0-5 at rate 1.0, 6-11 at 0.85; `-1` = never started | no `-1`; median under about 1 s |
| `recognizerAvailable`, `recognizerResult`, `recognizerMs`, `recognizerError` | is a recogniser offered to a third-party app, did it hear, how long | available, and a sensible result |

## Results (operator fills in after the Stick run)

Not run yet. If `recognizerAvailable` is false, decision 2 falls back to phone-only mic for the native app and the remote-mic path
is closed; say so here and in the changelog.

## Open

- Does the Fire OS recogniser exist for third-party apps, and is it on device?
- Is the default Stick voice acceptable for a child learning English (Linga)? Needs a human ear, not a number.
