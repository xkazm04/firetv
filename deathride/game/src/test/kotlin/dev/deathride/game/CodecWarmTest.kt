package dev.deathride.game

import dev.deathride.core.Profile
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.concurrent.TimeUnit

/** P13e: the codec warm-up runs on its own thread, on copies, and never changes the profiles it was given. */
class CodecWarmTest {
    @Test fun itRoundTripsCopiesOnItsOwnThreadAndLeavesTheProfilesAlone() {
        val profiles=listOf(Profile("couch-0"),Profile("couch-1").also{it.selectedCar=1})
        val lines=java.util.concurrent.LinkedBlockingQueue<Pair<String,String>>()
        val t=CodecWarm.start(profiles,{lines.add(Thread.currentThread().name to it)},rounds=5)
        t.join(TimeUnit.SECONDS.toMillis(30))
        assertFalse(t.isAlive);assertTrue(t.isDaemon)
        val (thread,line)=lines.single()
        assertEquals("profile-codec-warm",thread)
        assertTrue(line.startsWith("profileCodecWarm calls=10 "),line)
        assertEquals(1,profiles[1].selectedCar)
    }
}
