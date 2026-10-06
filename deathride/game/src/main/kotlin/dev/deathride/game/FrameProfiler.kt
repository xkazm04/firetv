package dev.deathride.game

import dev.deathride.link.PerfTrace

/** Optional platform counters; the normal build does not call them. */
interface ProfilePlatform {
    fun cpuNanos(): Long
    fun begin(name: String)
    fun end()
    fun runtimeJson(): String
    fun allocatedBytes(): Long = -1
}

/** Preallocated phase sample. Nested world spans are disjoint; outer totals are derived. */
class FrameProfiler(val platform: ProfilePlatform) {
    val trace = PerfTrace(arrayOf("startNs", "intervalMs", "workMs", "cpuMs", "active", "liveCars",
        "requestsMs", "prepareMs", "simulationMs", "audioMs", "telemetryMs", "clearMs",
        "cameraMs", "effectsUpdateMs", "sceneryDrawMs", "carsEffectsMs", "hudMs", "captionMs",
        "drawCalls", "textureBinds", "textureUploads", "effectSlots",
        "requestsBytes", "prepareBytes", "simulationBytes", "audioBytes", "telemetryBytes", "clearBytes",
        "cameraBytes", "effectsUpdateBytes", "sceneryDrawBytes", "carsEffectsBytes", "hudBytes", "captionBytes", "drawIndices"))
    private val row = DoubleArray(trace.columns.size)
    private var start = 0L
    private var cpu = 0L
    private var mark = 0L
    private var section = false
    private var allocated = -1L
    fun begin(nanos: Long, interval: Double) {
        row.fill(0.0); start = nanos; mark = nanos; cpu = platform.cpuNanos()
        row[0] = nanos.toDouble(); row[1] = interval * 1000
        platform.begin("DR.requests"); section = true
        allocated = platform.allocatedBytes()
    }
    fun mark(column: Int, next: String) {
        val bytes = platform.allocatedBytes()
        row[column + 16] = if (allocated < 0) -1.0 else (bytes - allocated).toDouble()
        allocated = bytes
        val now = System.nanoTime(); row[column] += (now - mark) / 1e6; mark = now
        if (section) platform.end()
        platform.begin(next); section = true
    }
    fun finish(active: Boolean, live: Int, draws: Int, binds: Int, uploads: Int, effects: Int, indices: Int = 0) {
        if (section) platform.end()
        section = false
        row[2] = (System.nanoTime() - start) / 1e6
        row[3] = (platform.cpuNanos() - cpu) / 1e6
        row[4] = if (active) 1.0 else 0.0; row[5] = live.toDouble()
        row[18] = draws.toDouble(); row[19] = binds.toDouble()
        row[20] = uploads.toDouble(); row[21] = effects.toDouble(); row[34] = indices.toDouble()
        trace.append(row)
    }
}
