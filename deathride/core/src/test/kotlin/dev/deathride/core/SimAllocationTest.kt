package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.lang.management.ManagementFactory

/** The shipped configuration (course, six classed AI cars, combat, abilities, contacts) must stay allocation-free per step, not just the oval. */
class SimAllocationTest {
    @Test fun courseRaceWithCombatAndContactsAllocatesNothingPerStep() {
        val bean=ManagementFactory.getThreadMXBean() as? com.sun.management.ThreadMXBean ?: return
        if(!bean.isThreadAllocatedMemorySupported)return
        bean.isThreadAllocatedMemoryEnabled=true
        for((course,seed) in listOf(Courses.playable[0] to 7,Courses.playable[26] to 8)) {
            val w=World(seed,track=Track(course=course),combatEnabled=true)
            for(i in 0 until 6) { val c=w.cars[i];CarCatalog.apply(c,Career.rivals[i%Career.rivals.size].carIndex);c.aiSkill=AiSkills.all.single{it.id=="Pro"};c.aiStyle=Career.rivals[i%Career.rivals.size] }
            w.reset();val input=Array(6){InputFrame()}
            repeat(9000){w.step(input)}
            val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
            repeat(6000){w.step(input)}
            val bytes=bean.getThreadAllocatedBytes(id)-before
            println("${course.id}: $bytes bytes over 6,000 warmed steps")
            assertTrue(bytes<4096,"${course.id} allocated $bytes bytes")
        }
    }
}
