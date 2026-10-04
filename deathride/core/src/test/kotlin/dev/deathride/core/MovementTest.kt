package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import kotlin.math.*

class MovementTest {
    @Test fun massContactsConserveLinearMomentumAndFavorHeavyCar() {
        val w=World(); val a=w.cars[0]; val b=w.cars[1]
        a.spec=a.spec.copy(massKg=600.0,circleOffsetM=0.0); b.spec=b.spec.copy(massKg=1800.0,circleOffsetM=0.0)
        a.x=0.0;a.y=0.0;b.x=2.5;b.y=0.0;a.vx=15.0;b.vx=0.0
        val before=a.spec.massKg*a.vx+b.spec.massKg*b.vx
        w.collide(a,b)
        assertEquals(before,a.spec.massKg*a.vx+b.spec.massKg*b.vx,1e-8)
        assertEquals(3.0,(15-a.vx)/b.vx,1e-10)
        assertTrue(w.ramClosingMps[1]>0)
    }
    @Test fun glancingRetainsTangentButHeadOnLosesSpeed() {
        fun impact(vx: Double,vy: Double): Double {
            val w=World(); val c=w.cars[0];CarCatalog.apply(c,1);c.x=0.0;c.y=52.0;c.heading=0.0;c.vx=vx;c.vy=vy
            w.contain(c);return c.speedMps
        }
        assertTrue(impact(20.0,2.0)>impact(0.0,20.0)*2)
    }
    @Test fun transferDriftSurfaceOrderingAndStaleSafety() {
        val h=SlipHandling(); val c=Car(0,Track());CarCatalog.apply(c,1);c.human=true;c.vx=22.0
        val input=InputFrame(.8,1.0,0.0,1.0)
        repeat(50){h.integrate(c,input,c.spec,Tuning.STEP_SECONDS)}
        assertTrue(c.drifting);assertTrue(c.loadTransfer<0)
        input.set(0.0,0.0,.5);input.handbrake=0.0
        repeat(30){h.integrate(c,input,c.spec,Tuning.STEP_SECONDS)};assertTrue(c.loadTransfer>0)
        repeat(180){h.integrate(c,input,c.spec,Tuning.STEP_SECONDS)};assertFalse(c.drifting)
        fun lateral(surface: Surface): Double {
            val car=Car(0,Track());CarCatalog.apply(car,1);car.surface=surface;car.vx=20.0;car.vy=8.0
            h.integrate(car,InputFrame(),car.spec,Tuning.STEP_SECONDS)
            return abs(-car.vx*sin(car.heading)+car.vy*cos(car.heading))
        }
        assertTrue(lateral(Surfaces.asphalt)<lateral(Surfaces.practice.last()))
        assertTrue(Surfaces.offtrack.dragPerSecond>Surfaces.asphalt.dragPerSecond)
        val m=InputMailbox();val out=InputFrame();m.offer(0,0.0,0.0,0.0,1.0,0.0,1.0)
        m.consume(20.0,out);assertEquals(1.0,out.handbrake);m.consume(300.0,out);assertEquals(0.0,out.handbrake)
    }
    @Test fun everySurfaceCompletesSeededAiRacesDeterministically() {
        val csv=StringBuilder("surface,seed,finished,seconds,hash\n");val input=Array(6){InputFrame()}
        for(surface in Surfaces.all) repeat(3) { seed ->
            val a=World(seed,track=Track(surface=surface));val b=World(seed,track=Track(surface=surface))
            for(w in arrayOf(a,b))for(c in w.cars)CarCatalog.apply(c,c.id%CarCatalog.all.size)
            while(a.seconds<180 && a.finished<6) { a.step(input);b.step(input) }
            csv.append("${surface.id},$seed,${a.finished},${a.seconds},${a.stateHash()}\n")
            assertEquals(a.stateHash(),b.stateHash());assertEquals(6,a.finished,"${surface.id} seed=$seed laps=${a.cars.map { it.lap.laps }}")
        }
        File("build/reports/balance/w3-surfaces.csv").apply { parentFile.mkdirs();writeText(csv.toString()) }
    }
    @Test fun advancedMovementAllocatesNothing() {
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val w=World(track=Track(surface=Surfaces.practice.last())); val input=Array(6){InputFrame(.6,.8,0.0,.5)}
        for(c in w.cars){CarCatalog.apply(c,c.id%5);c.human=true}
        repeat(50000){w.step(input)}
        val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){w.step(input)}
        assertEquals(0L,bean.getThreadAllocatedBytes(id)-before)
    }
}
