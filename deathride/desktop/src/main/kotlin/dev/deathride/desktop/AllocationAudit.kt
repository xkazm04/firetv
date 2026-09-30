package dev.deathride.desktop

import com.badlogic.gdx.ApplicationListener
import java.lang.management.ManagementFactory

/** Desktop diagnostic only. Includes application render, excludes this audit and network threads. */
class AllocationAudit(private val game: ApplicationListener): ApplicationListener by game {
    private val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
    private var warmup=300
    private var frames=0L
    private var zero=0L
    private var bytes=0L
    private var maxBytes=0L
    init { bean.isThreadAllocatedMemoryEnabled=true }
    override fun render() {
        val thread=Thread.currentThread().id; val before=bean.getThreadAllocatedBytes(thread)
        game.render()
        val allocated=bean.getThreadAllocatedBytes(thread)-before
        if(warmup>0) { warmup--; return }
        frames++; if(allocated==0L)zero++; bytes+=allocated; maxBytes=kotlin.math.max(maxBytes,allocated)
    }
    override fun dispose() {
        println("DeathRide allocationAudit {\"frames\":$frames,\"zeroAllocationFrames\":$zero,\"totalBytes\":$bytes,\"maxBytesInFrame\":$maxBytes,\"includesTransitionsAndDiagnosticScreenshots\":true}")
        game.dispose()
    }
}
