package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*
import java.io.File

class FeelTest {
    data class Trace(val turnIn: Double, val yaw: Double, val radius: Double, val slip: Double, val recovery: Double)
    private fun trace(p: FeelProfile, speed: Double, pattern: String): Trace {
        val c=Car(0,Track()); c.human=true; c.feel=p; c.vx=speed
        val h=SlipHandling(); val spec=CarSpec(); val input=InputFrame(0.0,1.0,0.0)
        val yaws=DoubleArray(240); var slip=0.0
        for(i in yaws.indices) {
            input.steer=when(pattern) { "ramp" -> min(1.0,i/120.0); "sine" -> sin(i*Tuning.STEP_SECONDS*PI); "hold" -> .5; else -> 1.0 }
            h.integrate(c,input,spec,Tuning.STEP_SECONDS)
            val v=c.speedMps; c.vx*=speed/v; c.vy*=speed/v
            yaws[i]=abs(c.yaw)
            if(i>=180)slip+=abs(wrapAngle(atan2(c.vy,c.vx)-c.heading))/60
        }
        val yaw=yaws.sliceArray(180..239).average()
        val turn=yaws.indexOfFirst { it>=yaw*.9 }*Tuning.STEP_SECONDS
        input.set(0.0,1.0,0.0); var recovery=-1.0
        repeat(300) { i ->
            h.integrate(c,input,spec,Tuning.STEP_SECONDS)
            if(recovery<0 && abs(c.yaw)<.05)recovery=(i+1)*Tuning.STEP_SECONDS
        }
        return Trace(turn,yaw,speed/yaw,slip*180/PI,recovery)
    }
    @Test fun strictKernelsMatchAcrossTrackAngleRange() {
        for(i in -10000..10000) {
            val a=i*.001
            assertEquals(java.lang.StrictMath.sin(a),StrictTrig.sin(a),2e-15)
            assertEquals(java.lang.StrictMath.cos(a),StrictTrig.cos(a),2e-15)
        }
    }
    @Test fun humanProfilesAllocateNothingAfterWarmup() {
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        for(p in FeelProfiles.all) {
            val w=World(); val input=Array(6){InputFrame(.35,.6,0.0)}
            for(c in w.cars){c.human=true;c.feel=p}
            repeat(50000){w.step(input)}
            val id=Thread.currentThread().id; val before=bean.getThreadAllocatedBytes(id)
            repeat(10000){w.step(input)}
            val bytes=bean.getThreadAllocatedBytes(id)-before
            assertEquals(0L,bytes,"${p.id} allocation bytes")
        }
    }
    @Test fun tracesAndDeclaredBands() {
        val output=StringBuilder("profile,speedMps,pattern,turnInSeconds90,meanYawRadPerSecond,radiusM,slipDegrees,recoverySecondsBelow0.05RadPerSecond\n")
        assertEquals(5,FeelProfiles.all.size)
        for(p in FeelProfiles.all) for(speed in doubleArrayOf(8.0,18.0,28.0)) for(pattern in arrayOf("step","ramp","sine","hold")) {
            val t=trace(p,speed,pattern)
            output.append("${p.id},$speed,$pattern,${t.turnIn},${t.yaw},${t.radius},${t.slip},${t.recovery}\n")
            assertTrue(t.radius.isFinite() && t.yaw>0)
            if(pattern=="step") {
                assertTrue(t.yaw in p.values.number("yawMinRadPerSecond")..p.values.number("yawMaxRadPerSecond"),"${p.id} $speed $t")
                assertTrue(t.turnIn in 0.0..p.values.number("turnInMaxSeconds"),"${p.id} $speed $t")
                assertTrue(t.recovery in 0.0..p.values.number("recoveryMaxSeconds"),"${p.id} $speed $t")
            }
        }
        File("build/reports/balance/w1-steering-traces.csv").apply { parentFile.mkdirs(); writeText(output.toString()) }
    }
    @Test fun shapingAndDeterminismAndImmediatePropulsionRelease() {
        for(p in FeelProfiles.all) {
            assertEquals(0.0,p.shape(p.deadZone*.99)); assertEquals(1.0,p.shape(1.0)); assertEquals(-1.0,p.shape(-1.0))
            val a=World(); val b=World(); val input=Array(6){InputFrame()}
            for(w in arrayOf(a,b)) { w.cars[0].human=true; w.cars[0].feel=p }
            repeat(600) { input[0].set(sin(it*.02),1.0,0.0); a.step(input); b.step(input); assertEquals(a.stateHash(),b.stateHash()) }
            input[0].throttle=0.0; a.step(input); assertEquals(0.0,a.cars[0].filteredThrottle)
            a.reset(); assertEquals(0.0,a.cars[0].filteredSteer)
        }
    }
}
