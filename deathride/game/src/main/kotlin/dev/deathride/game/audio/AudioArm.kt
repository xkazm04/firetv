package dev.deathride.game.audio

/** P12: perf-only arms that measure what the game's sound costs on the Stick. Only the debuggable
 * dev.deathride.perf launcher reads the switch (intent extra `audioArm`); every other build plays [FULL].
 * The arms act in [GdxAudioBackend], below the cue service and the audio worker, so the game's cues,
 * voices and handles are the same in every arm; only the platform Sound/Music calls differ. */
enum class AudioArm(val voiceCap: Int,val parameterIntervalNs: Long) {
    /** Today's mix: up to eight voices, every parameter change applied. */
    FULL(8,0),
    /** No Sound or Music is ever started. Voices keep handles, so the cue service sees the same voices. */
    MUTED(8,0),
    /** At most three voices at once; a fourth start is refused, as a ninth is today. */
    CAPPED(3,0),
    /** Voices start and stop as today; setPitch/setPan run at most once per 200 ms per voice (start counts). */
    STILL(8,200_000_000L);
    val id get()=name.lowercase()
    companion object {
        /** No value is FULL. An unknown value is an error, so a mistyped perf run cannot pass for FULL. */
        fun parse(value: String?)=if(value==null)FULL else entries.firstOrNull{it.id==value}
            ?:throw IllegalArgumentException("audioArm=$value: expected one of ${entries.joinToString{it.id}}")
    }
}
