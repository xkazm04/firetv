package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class WheelSteerTest {
    private val dt=1f/60f
    private fun settle(from: Float,target: Float,frames: Int): Float { var a=from;repeat(frames){a=WheelSteer.step(a,target,dt)};return a }

    @Test fun targetIsClampedAndScaledBySpeed() {
        assertEquals(WheelSteer.MAX_ANGLE,WheelSteer.target(-1f,0f,0f),1e-6f)
        assertEquals(-WheelSteer.MAX_ANGLE,WheelSteer.target(1f,0f,0f),1e-6f)
        assertEquals(WheelSteer.MAX_ANGLE,WheelSteer.target(-5f,0f,0f),1e-6f)
        val fast=WheelSteer.target(-1f,60f,0f)
        assertTrue(fast<WheelSteer.MAX_ANGLE*.6f && fast>0f)
        assertEquals(0f,WheelSteer.target(0f,30f,0f),1e-6f)
    }
    @Test fun smoothingConvergesAndNeverOvershoots() {
        var a=0f;val target=.5f
        repeat(40){val n=WheelSteer.step(a,target,dt);assertTrue(n>=a && n<=target+1e-6f);a=n}
        assertEquals(target,a,.01f)
    }
    @Test fun followIsFastEnoughToReadAsSteering() {
        // Near-full lock within a quarter of a second (not a lagging crawl).
        assertTrue(settle(0f,.5f,15)>.45f)
    }
    @Test fun reversalSwingsThroughCentreFasterThanAnOrdinaryFollow() {
        val reversing=settle(.5f,-.5f,3)   // crosses zero
        val sameSignRamp=settle(.5f,0f,3)  // plain approach to zero
        assertTrue(reversing<sameSignRamp,"reversal $reversing vs plain $sameSignRamp")
        assertTrue(reversing<0f,"three frames after a sign change the wheel is already past centre: $reversing")
    }
    @Test fun stepIsBoundedByMaxVisualAngleAndIgnoresBadDt() {
        assertEquals(WheelSteer.MAX_ANGLE,WheelSteer.step(WheelSteer.MAX_ANGLE,5f,dt),1e-6f)
        assertEquals(.2f,WheelSteer.step(.2f,.5f,0f),0f)
        assertEquals(.2f,WheelSteer.step(.2f,.5f,Float.NaN),0f)
        assertTrue(WheelSteer.step(0f,5f,10f)<=WheelSteer.MAX_ANGLE)
    }
    @Test fun driftPointsWheelsAlongVelocityWithOppositeLock() {
        // Body slipping 0.4 rad CCW of heading, driver steering slightly the other way: wheels follow the velocity (positive).
        val t=WheelSteer.target(0.2f,30f,.4f)
        assertTrue(t>0f,"drift lock is along velocity: $t")
        val grip=WheelSteer.target(0.2f,30f,.05f)
        assertTrue(grip<0f,"no slip keeps normal steering: $grip")
        // Mirror image.
        assertEquals(-t,WheelSteer.target(-0.2f,30f,-.4f),1e-5f)
        // Low speed ignores slip noise.
        assertEquals(WheelSteer.target(.2f,2f,0f),WheelSteer.target(.2f,2f,.8f),1e-6f)
    }
    @Test fun slipIsWrappedAndZeroWhenStationary() {
        assertEquals(0f,WheelSteer.slip(0.5,0.0,1.0),0f)
        assertEquals(.4f,WheelSteer.slip(10.0*Math.cos(.4+6.0),10.0*Math.sin(.4+6.0),6.0),1e-4f)
    }
    @Test fun rigWreckFreezesRollingAndSettlesToTilt() {
        val rig=WheelRig(2)
        repeat(30){rig.update(0,dt,1f,20.0,0.0,0.0,0.0,false)}
        val tread=rig.tread[0]
        repeat(60){rig.update(0,dt,1f,20.0,0.0,0.0,0.0,true)}
        assertEquals(tread,rig.tread[0],0f)
        assertEquals(WheelSteer.WRECK_TILT,rig.angle[0],.01f)
        assertEquals(0f,rig.braking[0],0f)
    }
}
