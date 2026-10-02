package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*
import java.io.File

class DriftLabTest {
    @Test fun importedTuningValidatesTheFinalPairAndRejectsInvalidDataAtomically() {
        val p=DriftParameters.defaults.copy()
        // This valid pair would fail if the fade start were checked against the old default end.
        p.setAll(linkedMapOf("assistFadeStartRadians" to 1.2,"spinSlipRadians" to 1.5))
        assertEquals(1.2,p["assistFadeStartRadians"]);assertEquals(1.5,p["spinSlipRadians"])
        assertThrows(IllegalArgumentException::class.java){p.setAll(mapOf("peakSlipRadians" to .3,"spinSlipRadians" to .9))}
        assertEquals(DriftParameters.defaults["peakSlipRadians"],p["peakSlipRadians"])
        assertEquals(1.5,p["spinSlipRadians"])
        assertThrows(IllegalArgumentException::class.java){p.setAll(mapOf("peakSlipRadians" to Double.NaN))}
    }
    private fun index(id: String)=CarCatalog.all.indexOfFirst{it.id==id}
    private fun run(id: String,exercise: DriftExercise,speed: Double=22.0,hold: Double?=null,spec: CarSpec?=null)=DriftExperiment(index(id),exercise,speed,holdSeconds=hold,specOverride=spec).also{it.run()}

    @Test fun heavyRotatesLaterAndAnEqualAngleSlideHasMoreMomentumAndLongerRecovery() {
        val needle=run("Needle",DriftExercise.EARLY_CATCH);val heavy=run("Bastion",DriftExercise.HANDBRAKE);val dragster=run("Comet",DriftExercise.HANDBRAKE)
        assertTrue(heavy.rotationSeconds>needle.rotationSeconds*1.3)
        assertTrue(dragster.rotationSeconds>needle.rotationSeconds)
        val a=run("Needle",DriftExercise.EQUAL_CATCH);val b=run("Bastion",DriftExercise.EQUAL_CATCH)
        assertTrue(b.recoverySeconds>a.recoverySeconds*1.2,"equal-angle heavy ${b.recoverySeconds} vs light ${a.recoverySeconds}")
        assertTrue(b.car.spec.massKg*b.speedAfterOneSecondMps>a.car.spec.massKg*a.speedAfterOneSecondMps*2)
        val coastA=run("Needle",DriftExercise.EQUAL_COAST);val coastB=run("Bastion",DriftExercise.EQUAL_COAST)
        assertTrue(coastB.recoverySeconds>coastA.recoverySeconds*1.3)
    }
    @Test fun timingIsASkillAndEveryClassHasARecoverableUsefulSlide() {
        val rows=StringBuilder("class,selectedHoldSeconds,peakSlipDeg,retainedAtRelease,recoverySeconds,exitSpeedMps,firstObservedSpinHoldSeconds\n")
        val firstSpins=HashMap<String,Double>()
        for(type in CarCatalog.all) {
            var caught: DriftExperiment?=null;var firstSpin=Double.NaN
            for(n in 1..30) {
                val e=run(type.id,DriftExercise.HANDBRAKE,hold=n*.1)
                if(caught==null && e.releaseSlipRadians>=Movement.driftEnterRadians && e.peakSlipRadians<DriftParameters.defaults["assistFadeStartRadians"] && e.car.spinEvents==0 && e.recoverySeconds.isFinite())caught=e
                if(firstSpin.isNaN() && e.car.spinEvents>0)firstSpin=e.releaseSeconds
            }
            assertNotNull(caught,"${type.id} needs a useful recoverable drift input window")
            val e=caught!!
            assertTrue(e.retainedAtRelease>.55,"${type.id} kills too much entry speed")
            val equal=run(type.id,DriftExercise.EQUAL_CATCH)
            assertTrue(equal.recoverySeconds.isFinite() && equal.recoverySeconds<3 && equal.car.spinEvents==0,type.id)
            rows.append("${type.id},${e.releaseSeconds},${e.peakSlipRadians*180/PI},${e.retainedAtRelease},${e.recoverySeconds},${e.exitSpeedMps},$firstSpin\n")
            firstSpins[type.id]=firstSpin
        }
        assertTrue(firstSpins.getValue("Needle")<firstSpins.getValue("Bastion"))
        val early=run("Needle",DriftExercise.EARLY_CATCH);val late=run("Needle",DriftExercise.LATE_CATCH)
        assertEquals(0,early.car.spinEvents);assertTrue(late.car.spinEvents>0)
        assertTrue(late.exitSpeedMps<early.exitSpeedMps*.7,"A missed catch must cost actual exit speed")
        File("build/reports/drift-lab/class-witnesses.csv").apply{parentFile.mkdirs();writeText(rows.toString())}
    }
    @Test fun sizeAndInertiaPerturbationsChangeRotationWithoutRetuningStats() {
        val base=CarCatalog.all[index("Line")].spec();val g=base.driftGeometry!!
        val larger=base.copy(circleRadiusM=base.circleRadiusM*1.3,circleOffsetM=base.circleOffsetM*1.3,driftGeometry=g.copy(wheelbaseM=g.wheelbaseM*1.3,trackM=g.trackM*1.3,cgHeightM=g.cgHeightM*1.3))
        val inertia=base.copy(driftGeometry=g.copy(inertiaScale=1.8))
        val a=run("Line",DriftExercise.HANDBRAKE,spec=base)
        val b=run("Line",DriftExercise.HANDBRAKE,spec=larger)
        val c=run("Line",DriftExercise.HANDBRAKE,spec=inertia)
        assertTrue(b.rotationSeconds>a.rotationSeconds)
        assertTrue(c.rotationSeconds>a.rotationSeconds)
        assertEquals(base.massKg,larger.massKg);assertEquals(base.steeringRateRadPerSecond,larger.steeringRateRadPerSecond)
    }
    @Test fun aSpinHittingTheWallLosesSpeedAndHullInTheNormalWorldStep() {
        val w=World(combatEnabled=true);val inputs=Array(6){InputFrame()}
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true};w.reset()
        repeat(300){w.step(inputs)}
        val c=w.cars[0];c.x=0.0;c.y=29.0;c.vx=20.0;c.vy=-15.0;c.heading=.8;c.yaw=1.4
        val beforeSpeed=c.speedMps;val beforeHealth=w.combat.health(0)
        w.step(inputs)
        assertTrue(c.spunOut);assertTrue(c.wallImpactMps>5);assertTrue(c.speedMps<beforeSpeed)
        assertTrue(w.combat.health(0)<beforeHealth)
        assertEquals(0.0,c.driftQuality)
        assertEquals(wrapAngle(atan2(c.vy,c.vx)-c.heading),w.snapshot.slipRadians(0),1e-10)
    }
    @Test fun fullDriftExperimentReplaysAndAllocatesNothingWhileInputsVary() {
        val a=DriftExperiment(index("Needle"),DriftExercise.LATE_CATCH,22.0)
        val b=DriftExperiment(index("Needle"),DriftExercise.LATE_CATCH,22.0)
        repeat(480){a.step();b.step();assertEquals(a.car.x.toBits(),b.car.x.toBits());assertEquals(a.car.yaw.toBits(),b.car.yaw.toBits());assertEquals(a.car.driftQuality.toBits(),b.car.driftQuality.toBits())}
        assertTrue(a.car.spinEvents>0)
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean;bean.isThreadAllocatedMemoryEnabled=true
        // Warm the complete moving experiment, including every class and release/spin branch.
        // Advancing one finished experiment warms only its parked tail, not this measured workload.
        repeat(3) {
            val warm=Array(100){DriftExperiment(it%CarCatalog.all.size,DriftExercise.LATE_CATCH,22.0)}
            for(e in warm)repeat(480){e.step()}
        }
        val fresh=Array(100){DriftExperiment(it%CarCatalog.all.size,DriftExercise.LATE_CATCH,22.0)}
        val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
        for(e in fresh)repeat(480){e.step()}
        val allocated=bean.getThreadAllocatedBytes(id)-before
        assertEquals(0L,allocated)
    }
    @Test fun allFiveProfilesStillDriveAtOrdinaryGripInputsAndBaselineDeltasAreExplicit() {
        val csv=StringBuilder("class,profile,model,meanYawRadPerSecond,meanSlipDeg,headingAt300ms\n")
        val model=SlipHandling();val input=InputFrame(.25,.3,0.0)
        for(i in CarCatalog.all.indices)for(profile in FeelProfiles.all)for(legacy in listOf(false,true)) {
            val c=Car(0,Track());CarCatalog.apply(c,i);c.human=true;c.feel=profile;c.vx=18.0
            if(legacy)c.spec=c.spec.copy(driftGeometry=null)
            var yaw=0.0;var slip=0.0;var early=0.0
            repeat(180){t->
                val speed=c.speedMps;if(speed>0){c.vx*=18/speed;c.vy*=18/speed}
                model.integrate(c,input,c.spec,Tuning.STEP_SECONDS)
                if(t==17)early=c.heading
                if(t>=120){yaw+=abs(c.yaw);slip+=abs(wrapAngle(atan2(c.vy,c.vx)-c.heading))}
                assertFalse(c.spunOut,"${c.carClass!!.id}/${profile.id} spins under a quarter input")
            }
            assertTrue(yaw>0)
            csv.append("${c.carClass!!.id},${profile.id},${if(legacy)"W3" else "D3"},${yaw/60},${slip/60*180/PI},$early\n")
        }
        File("build/reports/drift-lab/grip-profile-comparison.csv").apply{parentFile.mkdirs();writeText(csv.toString())}
    }
}
