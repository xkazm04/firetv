package dev.deathride.tv

import android.os.Debug
import android.os.Trace
import dev.deathride.game.ProfilePlatform
import dev.deathride.game.SchedStat
import java.io.RandomAccessFile

/** Runtime-stat maps are requested by HTTP, never by the render callback.
 *  [schedstat] (P17, the debuggable perf package only): the render thread reads its own /proc schedstat once a frame. */
class AndroidProfile(private val schedstat: Boolean = false) : ProfilePlatform {
    private var file: RandomAccessFile? = null
    private val bytes = ByteArray(64)
    override fun cpuNanos() = Debug.threadCpuTimeNanos()
    override fun begin(name: String) = Trace.beginSection(name)
    override fun end() = Trace.endSection()
    override fun runtimeJson(): String = Debug.getRuntimeStats().entries.joinToString(",", "{", "}") {
        "\"${it.key}\":\"${it.value}\""
    }
    override fun schedNanos(out: LongArray): Boolean {
        if (!schedstat) return false
        // Opened on the first call, which is the render thread's: the path names the calling thread.
        val f = file ?: RandomAccessFile("/proc/self/task/${android.os.Process.myTid()}/schedstat", "r").also { file = it }
        f.seek(0)
        val n = f.read(bytes)
        return n > 0 && SchedStat.parse(bytes, n, out)
    }
}
