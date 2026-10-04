# Instrumented visual run

This 900-second run used the same APK as `release-installed.json`. All ten signatures were observed and captured. It failed the input gate with six rejected packets and eleven host pump stalls; the original frame-tail targets also failed. The complete raw record and summary retain those failures.

`probe.mjs` is the exact harness snapshot used. It retained repeated garage/career objects in every sample and performed ADB PNG captures during traffic. The subsequent measurement omits those readbacks and repeated retained objects; game code, input-age limits and frame gates are unchanged. Differences between runs are not proof of a single performance cause.

Recorded screenshot paths refer to the original `release-soak` location. The images were moved together with this raw record into `release-visual-soak`; their basenames are unchanged.
