package dev.deathride.core
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.lang.management.ManagementFactory
import kotlin.math.*

class SoakTest {
    @Test fun finishedHumanDoesNotHandSteeringToAi() {
        val w=World(); val c=w.cars[0]; val input=Array(6){InputFrame()}
        c.human=true; c.finishSeconds=1.0; c.vx=10.0; c.vy=0.0
        input[0].set(0.0,0.0,1.0)
        repeat(6){w.step(input)}
        assertTrue(c.speedMps<8.0,"a claimed car must honor its driver's brake even after a demo finish")
    }

    @Test fun wallRecoveryDoesNotNeedReverseOrTeleport() {
        val w=World(); val c=w.cars[0]; c.x=0.0; c.y=49.5; c.heading=PI/2; c.vx=0.0; c.vy=0.0
        val model=SlipHandling(); val input=InputFrame(1.0,1.0,0.0)
        repeat(300) { model.integrate(c,input,w.spec,1.0/60); w.contain(c) }
        assertTrue(c.speedMps>5.0,"speed ${c.speedMps}"); assertTrue(c.y<47.0,"y ${c.y}")
    }
    @Test fun fifteenSimulatedMinutesStayFiniteAndBounded() {
        val w=World(9); val input=Array(6){InputFrame()}; val p=Projection(); var races=0
        repeat(60*900) {
            w.step(input)
            if(w.finished==6) { races++; w.reset() }
            for(c in w.cars) { assertTrue(c.x.isFinite() && c.vx.isFinite()); w.track.project(c.x,c.y,p); assertTrue(abs(p.distance)<w.track.halfWidthM+.02) }
        }
        assertTrue(races>=10,"completed $races races")
        println("900 simulated seconds, $races full six-car races; not a real-time/device soak")
    }
    @Test fun fixedStepHasNoSteadyStateAllocations() {
        val bean=ManagementFactory.getThreadMXBean() as? com.sun.management.ThreadMXBean ?: return
        if(!bean.isThreadAllocatedMemorySupported)return
        bean.isThreadAllocatedMemoryEnabled=true
        val w=World(4); val input=Array(6){InputFrame()}; repeat(12000){w.step(input)}
        val id=Thread.currentThread().id; val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){w.step(input)}
        val bytes=bean.getThreadAllocatedBytes(id)-before
        println("World.step allocated $bytes bytes over 10,000 warmed steps on this JVM")
        assertTrue(bytes<1024,"hot simulation allocated $bytes bytes")
    }
}
