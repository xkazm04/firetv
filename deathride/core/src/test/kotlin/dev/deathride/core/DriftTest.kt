package dev.deathride.core
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*
class DriftTest {
    @Test fun hysteresisRetainsBothHistoriesInsideTheBand() {
        val model=SlipHandling()
        val above=Car(0,Track());val below=Car(1,Track())
        for(c in arrayOf(above,below))CarCatalog.apply(c,1)
        above.drifting=true
        val angle=(Movement.driftEnterRadians+Movement.driftExitRadians)*.5
        // Clamp the fixture's kinematics, not its flag, to witness 120 real fixed steps in the gap.
        repeat(120) {
            for(c in arrayOf(above,below)) {
                c.heading=0.0;c.yaw=0.0;c.vx=22*cos(angle);c.vy=22*sin(angle)
                model.integrate(c,InputFrame(),c.spec,Tuning.STEP_SECONDS)
                val slip=abs(wrapAngle(atan2(c.vy,c.vx)-c.heading))
                assertTrue(slip>Movement.driftExitRadians && slip<Movement.driftEnterRadians)
            }
            assertTrue(above.drifting);assertFalse(below.drifting)
        }
    }
    @Test fun brakingUnloadsLateralGrip() {
        val a=Car(0,Track()); val b=Car(1,Track()); a.vx=20.0; a.vy=8.0; b.vx=20.0; b.vy=8.0
        val model=SlipHandling(); val spec=CarSpec(); model.integrate(a,InputFrame(),spec,1.0/60); model.integrate(b,InputFrame(0.0,0.0,1.0),spec,1.0/60)
        val lateralA=abs(-a.vx*sin(a.heading)+a.vy*cos(a.heading)); val lateralB=abs(-b.vx*sin(b.heading)+b.vy*cos(b.heading))
        assertTrue(lateralB>lateralA,"braking must preserve more lateral momentum")
    }
    @Test fun countersteeringCatchesTheSlide() {
        val model=SlipHandling(); val spec=CarSpec(); val a=Car(0,Track()); a.vx=28.0
        repeat(60){model.integrate(a,InputFrame(1.0,1.0,0.0),spec,1.0/60)}
        val before=abs(wrapAngle(atan2(a.vy,a.vx)-a.heading))
        assertTrue(before>.15)
        repeat(12){model.integrate(a,InputFrame(-.65,.6,0.0),spec,1.0/60)}
        val after=abs(wrapAngle(atan2(a.vy,a.vx)-a.heading))
        assertTrue(after<before,"countersteer before=$before after=$after")
        println("Countersteer: slip ${(before*180/PI)} to ${(after*180/PI)} degrees in 0.2 simulated seconds")
    }
}
