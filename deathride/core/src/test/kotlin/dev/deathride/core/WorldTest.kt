package dev.deathride.core
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*

class WorldTest {
    private fun inputs()=Array(6){InputFrame()}
    @Test fun eliteMineEncounterRecoversWithoutStrandingTheRemainingCars() {
        val track=Track(45.0,20.0,10.0)
        val w=World(-1935872170,track=track,combatEnabled=true)
        for(c in w.cars) {
            val name=if(c.id%2==0)"Vandal" else "Quill"
            CarCatalog.apply(c,CarCatalog.all.indexOfFirst{it.id==name})
            c.aiSkill=AiSkills.all.single{it.id==if(name=="Quill")"Champion" else "Rookie"}
        }
        Encounters.apply(w,Career.cups[3].id);w.reset();val input=inputs();var recovering=false
        repeat(18000) {
            if(w.resolved<6)w.step(input)
            if(w.cars.any{it.aiMode==AiMode.RECOVER})recovering=true
        }
        assertTrue(recovering);assertEquals(6,w.resolved)
        println("Recovered all six entrants in ${w.seconds} simulated seconds")
    }
    @Test fun signedSeedsUseTheSameBoundedLaneCycleWithoutIntegerOverflow() {
        val lanes=setOf(-3.4,-1.7,0.0,1.7,3.4)
        for(seed in listOf(Int.MIN_VALUE,-17,-1,0,1,Int.MAX_VALUE)) {
            val world=World(seed)
            assertEquals(lanes,world.cars.take(5).map{it.aiLane}.toSet(),"Every seed visits the five intended lanes")
            val sameRemainder=World(seed.mod(5))
            for(i in world.cars.indices)assertEquals(sameRemainder.cars[i].aiLane,world.cars[i].aiLane,0.0,"Seed sign must not push the whole field to one verge")
        }
    }
    @Test fun deterministicSixtySeconds() {
        val a=World(82); val b=World(82); val input=inputs(); a.cars[0].human=true; b.cars[0].human=true
        repeat(3600) { input[0].set(sin(it*.01)*.5,.8,if(it%600>500) .2 else 0.0); a.step(input); b.step(input); assertEquals(a.stateHash(),b.stateHash()) }
    }
    @Test fun staleFramesHoldSteeringAndDropThrottle() {
        val m=InputMailbox(); val out=InputFrame()
        assertTrue(m.offer(1,0.0,0.0,.7,1.0,.4)); m.consume(249.0,out); assertEquals(1.0,out.throttle)
        assertTrue(m.consume(251.0,out)); assertEquals(.7,out.steer); assertEquals(0.0,out.throttle); assertEquals(0.0,out.brake)
        assertFalse(m.offer(2,0.0,400.0,-1.0,1.0,0.0)); m.consume(401.0,out); assertEquals(.7,out.steer)
        assertFalse(m.offer(1,402.0,402.0,0.0,1.0,0.0)); assertEquals(1,m.outOfOrder)
        assertTrue(m.offer(3,405.0,405.0,.2,.5,0.0)); m.consume(406.0,out); assertEquals(.5,out.throttle)
    }
    @Test fun gapsNonFiniteAndReconnectAreBounded() {
        val m=InputMailbox(); val out=InputFrame(); m.offer(4,10.0,10.0,0.0,1.0,0.0)
        m.offer(7,11.0,11.0,0.0,1.0,0.0); assertEquals(2,m.dropped)
        assertFalse(m.offer(8,12.0,12.0,Double.NaN,1.0,0.0))
        m.newConnection(); m.consume(13.0,out); assertEquals(0.0,out.throttle)
        assertTrue(m.offer(0,14.0,14.0,0.0,1.0,0.0))
    }
    @Test fun lapCountsOnceAndGateSkippingFails() {
        val t=Track(); val l=LapCounter(t.lengthM,t.startM); l.reset(t.startM-2)
        for(i in 0..(t.lengthM+4).toInt()) l.update(t.startM-2+i)
        assertEquals(1,l.laps)
        repeat(20){l.update(t.startM+2)}; assertEquals(1,l.laps)
        val bad=LapCounter(t.lengthM,t.startM); bad.reset(t.startM-2); bad.update(t.startM+1); bad.update(t.startM+t.lengthM*.8); bad.update(t.startM+1)
        assertEquals(0,bad.laps)
    }
    @Test fun wallsContainBothCarCircles() {
        val w=World(); val c=w.cars[0]; c.y=70.0; c.vy=20.0; repeat(3){w.contain(c)}
        val p=Projection()
        for(e in -1..1 step 2) { w.track.project(c.x+cos(c.heading)*w.spec.circleOffsetM*e,c.y+sin(c.heading)*w.spec.circleOffsetM*e,p); assertTrue(abs(p.distance)<=w.track.halfWidthM-w.spec.circleRadiusM+.01) }
        assertTrue(c.vy<0)
    }
    @Test fun collidingCarsSeparate() {
        val w=World(); val a=w.cars[0]; val b=w.cars[1]; a.x=0.0; b.x=2.0; a.y=40.0; b.y=40.0; a.vx=10.0; b.vx=-10.0
        repeat(8){w.collide(a,b)}
        assertTrue(abs(a.x-b.x)>4.0); assertTrue(a.vx<b.vx)
    }
    @Test fun speedCoastBrakingAndTimeBasis() {
        val spec=CarSpec(); val model=SlipHandling(); val c=Car(0,Track()); val f=InputFrame(0.0,1.0,0.0)
        repeat(1800){model.integrate(c,f,spec,1.0/60)}; assertTrue(c.speedMps in 29.8..30.01)
        f.throttle=0.0; repeat(60){model.integrate(c,f,spec,1.0/60)}; assertTrue(c.speedMps<25)
        fun distance(speed: Double): Double { val b=Car(0,Track()); b.vx=speed; val brake=InputFrame(0.0,0.0,1.0); repeat(600){model.integrate(b,brake,spec,1.0/60)}; return b.x }
        assertTrue(distance(25.0)>distance(15.0))
        println("Braking distance: 15 m/s -> ${distance(15.0)} m; 25 m/s -> ${distance(25.0)} m")
        val a=Car(0,Track()); val b=Car(0,Track()); f.throttle=1.0
        repeat(180){model.integrate(a,f,spec,1.0/60)}; repeat(90){model.integrate(b,f,spec,1.0/30)}
        assertEquals(a.speedMps,b.speedMps,.2); assertEquals(a.x,b.x,.8)
        f.steer=1.0; repeat(120){model.integrate(a,f,spec,1.0/60)}
        val slip=abs(wrapAngle(atan2(a.vy,a.vx)-a.heading)); println("Full-lock slip after 2 s: ${slip*180/PI} degrees; coast after 1 s: ${c.speedMps} m/s"); assertTrue(slip in .04..0.8,"slip=$slip")
    }
    @Test fun twentySeededSixCarRacesComplete() {
        var minTime=1e9; var maxTime=0.0
        repeat(20) { seed ->
            val w=World(seed); val input=inputs(); val p=Projection()
            repeat(60*180) {
                if(w.finished<6) w.step(input)
                for(c in w.cars) { assertTrue(c.x.isFinite() && c.y.isFinite()); w.track.project(c.x,c.y,p); assertTrue(abs(p.distance)<w.track.halfWidthM+.01) }
            }
            assertEquals(6,w.finished,"seed $seed, laps ${w.cars.map{it.lap.laps}} positions ${w.cars.map{it.lap.progressM}}")
            assertTrue(w.seconds in 40.0..180.0,"seconds ${w.seconds}")
            minTime=min(minTime,w.seconds); maxTime=max(maxTime,w.seconds)
        }
        println("20 seeds / 120 finishers / six cars / 3 laps; race seconds min=$minTime max=$maxTime")
    }
}
