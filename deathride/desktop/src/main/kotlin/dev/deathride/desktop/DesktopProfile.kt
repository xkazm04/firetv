package dev.deathride.desktop

import dev.deathride.game.ProfilePlatform
import java.lang.management.ManagementFactory

class DesktopProfile : ProfilePlatform {
    private val bean = ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
    init { bean.isThreadAllocatedMemoryEnabled = true; bean.isThreadCpuTimeEnabled = true }
    override fun cpuNanos() = bean.currentThreadCpuTime
    override fun allocatedBytes() = bean.getThreadAllocatedBytes(Thread.currentThread().id)
    override fun begin(name: String) {}
    override fun end() {}
    override fun runtimeJson() = "{\"allocationSource\":\"ThreadMXBean, desktop only\"}"
}
