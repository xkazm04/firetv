package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*

class DriftModelTest {
    @Test fun entryAndCatchWitnessesForEveryClass() {
        val report=StringBuilder("class,scenario,peakSlipDeg,retainedAtRelease,recoverySeconds,spins,exitSpeedMps\n")
        val model=SlipHandling()
        for(i in CarCatalog.all.indices)for(scenario in 0..3) {
            val c=Car(0,Track());CarCatalog.apply(c,i);c.human=true;c.feel=FeelProfiles.default;c.vx=22.0
            val input=InputFrame();var peak=0.0;var retained=0.0;var recovery=-1.0
            repeat(480){t->
                input.steer=if(t<60).8 else if(t<120 && scenario!=3)(-c.slipRadians*1.6-c.yaw*.10).coerceIn(-1.0,1.0) else 0.0
                input.throttle=if(t<60).6 else .25
                input.handbrake=if(t<60 && scenario!=0)1.0 else 0.0
                if(scenario==2 && t in 60..120){input.steer=.8;input.handbrake=1.0}
                model.integrate(c,input,c.spec,Tuning.STEP_SECONDS)
                peak=max(peak,abs(c.slipRadians))
                if(t==59)retained=c.speedMps/22
                if(t>=60 && recovery<0 && abs(c.slipRadians)<Movement.driftExitRadians && abs(c.yaw)<DriftParameters.defaults["recoveredYawRadPerSecond"] && !c.spunOut)recovery=(t-59)*Tuning.STEP_SECONDS
            }
            report.append("${c.carClass!!.id},$scenario,${peak*180/PI},$retained,$recovery,${c.spinEvents},${c.speedMps}\n")
            assertTrue(c.speedMps.isFinite())
        }
        java.io.File("build/reports/drift/d2-entries.csv").apply{parentFile.mkdirs();writeText(report.toString())}
        println(report)
    }
    @Test fun axleCirclesAndContinuousCurveHaveRealConsumers() {
        val p=DriftParameters.defaults
        assertEquals(0.0,DriftDynamics.curve(0.0,p))
        assertEquals(1.0,DriftDynamics.curve(p["peakSlipRadians"],p),1e-12)
        assertTrue(DriftDynamics.curve(1.0,p)<DriftDynamics.curve(.3,p))
        val model=SlipHandling();val input=InputFrame(.8,1.0,0.0,0.0)
        for(index in CarCatalog.all.indices) {
            val c=Car(0,Track());CarCatalog.apply(c,index);c.vx=22.0
            repeat(300) { step ->
                input.brake=if(step in 80..140).7 else 0.0;input.handbrake=if(step in 160..190)1.0 else 0.0
                model.integrate(c,input,c.spec,Tuning.STEP_SECONDS)
                assertTrue(c.frontForceX*c.frontForceX+c.frontForceY*c.frontForceY<=c.frontCapacity*c.frontCapacity+1e-6)
                assertTrue(c.rearForceX*c.rearForceX+c.rearForceY*c.rearForceY<=c.rearCapacity*c.rearCapacity+1e-6)
                assertTrue(c.x.isFinite() && c.yaw.isFinite() && c.driftQuality in 0.0..1.0)
            }
        }
    }
    @Test fun scaledGeometryAndUpgradedMassChangeInertiaWithoutDuplicateShapeNumbers() {
        for(type in CarCatalog.all) {
            val s=type.spec();val shape=CarShapes.forId(type.id)
            assertEquals(shape.lengthM,s.lengthM,1e-10);assertEquals(shape.widthM,s.widthM,1e-10)
            assertEquals(s.massKg*(shape.lengthM*shape.lengthM+shape.widthM*shape.widthM)/12,s.yawInertiaKgM2,1e-8)
            assertEquals(s.yawInertiaKgM2*2,s.copy(massKg=s.massKg*2).yawInertiaKgM2,1e-8)
        }
        val h=CarCatalog.all.first{it.id=="Bastion"}.spec();val l=CarCatalog.all.first{it.id=="Needle"}.spec()
        assertTrue(h.yawInertiaKgM2>l.yawInertiaKgM2*5)
        assertTrue(DriftDynamics.gripScale(h,DriftParameters.defaults)<DriftDynamics.gripScale(l,DriftParameters.defaults))
    }
    @Test fun unpoweredSlideDissipatesEnergyAndHeavierLoadRetainsMoreMomentum() {
        val model=SlipHandling();val a=Car(0,Track());val b=Car(1,Track())
        for(c in arrayOf(a,b)){CarCatalog.apply(c,1);c.vx=22.0;c.heading=-.6;c.yaw=-.7}
        b.spec=b.spec.copy(massKg=b.spec.massKg*2)
        var previousA=a.speedMps;var previousB=b.speedMps
        repeat(30) {
            for(c in arrayOf(a,b))model.integrate(c,InputFrame(),c.spec,Tuning.STEP_SECONDS)
            assertTrue(a.speedMps<=previousA+1e-9);assertTrue(b.speedMps<=previousB+1e-9)
            previousA=a.speedMps;previousB=b.speedMps
        }
        println("Same geometry and input; mass-only slide 0.5s: ${a.speedMps} vs ${b.speedMps} m/s")
        assertTrue(b.speedMps>a.speedMps)
        assertTrue(b.spec.massKg*b.speedMps>a.spec.massKg*a.speedMps)
    }
    @Test fun qualityUsesRetentionDurationAndSmoothnessAndSnapshotIsCoherent() {
        val c=Car(0,Track());CarCatalog.apply(c,1);c.vx=22.0;c.heading=-.55
        val p=DriftParameters.defaults
        repeat(90){DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)}
        assertTrue(c.driftQuality>.3 && c.driftHeldSeconds>1)
        val before=c.driftQuality;c.vx=11.0
        DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)
        assertTrue(c.driftQuality<before*.6)
        val steady=c.countersteerSmoothness
        repeat(30){c.filteredSteer=if(it%2==0)1.0 else -1.0;DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)}
        assertTrue(c.countersteerSmoothness<steady*.5)
        val cars=Array(6){if(it==0)c else Car(it,Track())};val snap=Snapshot();snap.capture(cars)
        assertEquals(c.slipRadians,snap.slipRadians(0));assertEquals(c.driftQuality,snap.driftQuality(0))
        c.driftQuality=0.0;assertTrue(snap.driftQuality(0)>0)
    }
    @Test fun reverseMomentumIsNotDeletedAndBrakingDoesNotCreateReverse() {
        val model=SlipHandling();val c=Car(0,Track());CarCatalog.apply(c,1);c.vx=-18.0
        model.integrate(c,InputFrame(),c.spec,Tuning.STEP_SECONDS)
        assertTrue(c.vx< -17,"A spin's reverse momentum must survive")
        c.vx=.01;c.vy=0.0;c.yaw=0.0;c.heading=0.0
        repeat(180){model.integrate(c,InputFrame(0.0,0.0,1.0),c.spec,Tuning.STEP_SECONDS)}
        assertTrue(c.vx>=0 && c.speedMps<.01)
    }
    @Test fun aSpinIsReportedUntilSettledAndResetClearsIt() {
        val c=Car(0,Track());CarCatalog.apply(c,0);c.vx=20.0;c.heading=-1.3;c.yaw=-1.0
        val p=DriftParameters.defaults
        DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)
        assertTrue(c.spunOut);assertEquals(1,c.spinEvents);assertEquals(0.0,c.driftQuality)
        c.heading=0.0;c.yaw=0.0
        repeat(10){DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)}
        assertTrue(c.spunOut)
        repeat(60){DriftDynamics.updateSignals(c,InputFrame(),Tuning.STEP_SECONDS,p)}
        assertFalse(c.spunOut)
        DriftDynamics.reset(c);assertEquals(0,c.spinEvents);assertEquals(0.0,c.slipRadians)
    }
    @Test fun activeDriftAndSpinAllocateZeroAndReplay() {
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val model=SlipHandling();val input=InputFrame(.9,.65,0.0,1.0)
        val cars=Array(CarCatalog.all.size){i->Car(i,Track()).also{CarCatalog.apply(it,i);it.human=true;it.feel=FeelProfiles.default}}
        fun step(t: Int) {
            for(c in cars) {
                // Repeated fresh entries prevent a parked/finished fixture from faking hot-path coverage.
                if(t%240==0){c.vx=26.0;c.vy=0.0;c.heading=0.0;c.yaw=0.0}
                input.handbrake=if(t%240<100)1.0 else 0.0
                input.steer=if(t%240<100).9 else -.65
                model.integrate(c,input,c.spec,Tuning.STEP_SECONDS)
            }
        }
        repeat(40000){step(it)}
        val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){step(it)}
        val allocated=bean.getThreadAllocatedBytes(id)-before
        assertEquals(0L,allocated)
        val a=Car(0,Track());val b=Car(0,Track());CarCatalog.apply(a,0);CarCatalog.apply(b,0);a.vx=26.0;b.vx=26.0
        repeat(1200){t->input.steer=if(t%240<100).9 else -.65;for(c in arrayOf(a,b))model.integrate(c,input,c.spec,Tuning.STEP_SECONDS)}
        assertEquals(a.x.toBits(),b.x.toBits());assertEquals(a.heading.toBits(),b.heading.toBits());assertEquals(a.driftQuality.toBits(),b.driftQuality.toBits())
    }
}
