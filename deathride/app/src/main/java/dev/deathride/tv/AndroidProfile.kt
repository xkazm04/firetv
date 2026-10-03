package dev.deathride.tv

import android.os.Debug
import android.os.Trace
import dev.deathride.game.ProfilePlatform

/** Runtime-stat maps are requested by HTTP, never by the render callback. */
class AndroidProfile : ProfilePlatform {
    override fun cpuNanos() = Debug.threadCpuTimeNanos()
    override fun begin(name: String) = Trace.beginSection(name)
    override fun end() = Trace.endSection()
    override fun runtimeJson(): String = Debug.getRuntimeStats().entries.joinToString(",", "{", "}") {
        "\"${it.key}\":\"${it.value}\""
    }
}
