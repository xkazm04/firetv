package dev.deathride.game.audio

/** P12: perf-only arms that measure what the game's sound costs on the Stick. Only the debuggable
 * dev.deathride.perf launcher reads the switch (intent extra `audioArm`); every other build plays [FULL].
 * The arms act in [GdxAudioBackend], below the cue service and the audio worker, so the game's cues,
 * voices and handles are the same in every arm; only the platform Sound/Music calls differ.
 * P14: a [silent] arm makes the backend behave exactly as [MUTED]; an arm with an [appTrack] also has the
 * perf launcher hold one Android AudioTrack open that writes zeros from resume to pause (nothing audible).
 * P15: [SILENT_MMAP]'s app stream is an AAudio stream instead (exclusive, low latency), asking for the MMAP route. */
enum class AudioArm(val id: String,val voiceCap: Int,val parameterIntervalNs: Long,val silent: Boolean=false,val appTrack: AppTrack?=null) {
    /** Today's mix: up to eight voices, every parameter change applied. */
    FULL("full",8,0),
    /** No Sound or Music is ever started. Voices keep handles, so the cue service sees the same voices. */
    MUTED("muted",8,0,silent=true),
    /** At most three voices at once; a fourth start is refused, as a ninth is today. */
    CAPPED("capped",3,0),
    /** Voices start and stop as today; setPitch/setPan run at most once per 200 ms per voice (start counts). */
    STILL("still",8,200_000_000L),
    /** P14: as MUTED, plus one silent app stream with SoundPool's attributes and the default performance mode. */
    SILENT_TRACK("silentTrack",8,0,silent=true,appTrack=AppTrack.DEFAULT),
    /** P14: as SILENT_TRACK, but PERFORMANCE_MODE_POWER_SAVING and at least 100 ms of buffer (the deep-buffer route). */
    SILENT_DEEP("silentDeep",8,0,silent=true,appTrack=AppTrack.POWER_SAVING),
    /** P15: as MUTED, plus one silent AAudio stream (exclusive, low latency): the route around the mixer (mmap_no_irq_out). */
    SILENT_MMAP("silentMmap",8,0,silent=true,appTrack=AppTrack.MMAP);
    companion object {
        /** No value is FULL. An unknown value is an error, so a mistyped perf run cannot pass for FULL. */
        fun parse(value: String?)=if(value==null)FULL else entries.firstOrNull{it.id==value}
            ?:throw IllegalArgumentException("audioArm=$value: expected one of ${entries.joinToString{it.id}}")
    }
}

/** P14: how the perf launcher opens its silent app stream. All use libGDX SoundPool's attributes (USAGE_GAME,
 * CONTENT_TYPE_SONIFICATION) and 16-bit stereo PCM. The AudioTrack modes run at the device's native output rate in
 * streaming mode; [minBufferMs] 0 means AudioTrack.getMinBufferSize alone (or, for [MMAP], what AAudio grants). */
enum class AppTrack(val minBufferMs: Int) {
    /** AudioTrack.PERFORMANCE_MODE_NONE (the default) and the minimum buffer. */
    DEFAULT(0),
    /** AudioTrack.PERFORMANCE_MODE_POWER_SAVING and a buffer of at least 100 ms: the documented route to a
     * deep-buffer output where the HAL has one. */
    POWER_SAVING(100),
    /** P15: not an AudioTrack. One NDK AAudio stream, AAUDIO_SHARING_MODE_EXCLUSIVE and
     * AAUDIO_PERFORMANCE_MODE_LOW_LATENCY at 48 kHz, whose data callback writes zeros: the only request that can reach
     * an MMAP (no-IRQ) output, which the AudioFlinger mixer thread does not serve. */
    MMAP(0)
}
