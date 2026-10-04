package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class PresentationEventsTest {
    @Test fun actualBoundaryContactsCarryTheRenderedMaterialOncePerStep(){
        for((courseId,expected) in listOf("foundry" to PresentationKind.BARRIER_CONTACT,"switchback" to PresentationKind.WALL_CONTACT)){
            val course=Courses.all.first{it.id==courseId};val w=World(track=Track(course=course),combatEnabled=true)
            for(c in w.cars)c.human=true
            val c=w.cars[0];val point=TrackPoint()
            w.track.sample(w.track.startM,course.widthAt(w.track.startM)+1,point)
            c.x=point.x;c.y=point.y;c.heading=point.heading
            c.vx=-kotlin.math.sin(point.heading)*15;c.vy=kotlin.math.cos(point.heading)*15
            w.presentationEvents.enabled=true;w.step(Array(Tuning.CAR_COUNT){InputFrame()})
            var contacts=0
            while(true){val e=w.presentationEvents.poll()?:break;if(e.actor==0 && e.kind==expected)contacts++}
            assertEquals(1,contacts,courseId)
        }
    }
    @Test fun boundedRingKeepsNewestEventsAndNeverReusesAnIdentityAcrossReset(){
        val events=PresentationEvents(2)
        events.emit(PresentationKind.FIRE,0,x=0.0,y=0.0,seconds=0.0);assertNull(events.poll())
        events.enabled=true
        repeat(3){events.emit(PresentationKind.FIRE,it,x=0.0,y=0.0,seconds=it.toDouble())}
        assertEquals(1,events.dropped);assertEquals(1,events.poll()!!.actor)
        val previous=events.poll()!!.serial;assertNull(events.poll());events.clear()
        events.emit(PresentationKind.FIRE,0,x=0.0,y=0.0,seconds=0.0);assertTrue(events.poll()!!.serial>previous)
    }
    @Test fun eventObservationCannotChangeSimulation(){
        val silent=World(927,combatEnabled=true);val observed=World(927,combatEnabled=true)
        observed.presentationEvents.enabled=true
        val input=Array(Tuning.CAR_COUNT){InputFrame()}
        repeat(1800){silent.step(input);observed.step(input);assertEquals(silent.stateHash(),observed.stateHash())}
        assertTrue(observed.presentationEvents.size>0);assertTrue(observed.presentationEvents.dropped>0)
    }
    @Test fun onlySuccessfulShotsEmitAndMineArmingAndWreckAreEdges(){
        val world=World(combatEnabled=true)
        for(c in world.cars)c.human=true
        val input=Array(Tuning.CAR_COUNT){InputFrame()}
        while(world.combat.armingSeconds>0)world.step(input)
        world.presentationEvents.enabled=true
        assertTrue(world.combat.fire(0,Weapons.RIVET));assertFalse(world.combat.fire(0,Weapons.RIVET))
        var fires=0
        while(true){val e=world.presentationEvents.poll()?:break;if(e.kind==PresentationKind.FIRE)fires++}
        assertEquals(1,fires)
        val mine=world.combat.mines[0];mine.active=true;mine.owner=0;mine.x=10000.0;mine.y=10000.0
        mine.ageSeconds=Weapons.all[Weapons.MINE].armingSeconds-.005
        world.step(input);world.step(input)
        var arms=0
        while(true){val e=world.presentationEvents.poll()?:break;if(e.kind==PresentationKind.MINE_ARM)arms++}
        assertEquals(1,arms)
        world.combat.damage(0,10000.0,1,DamageKind.HAMMER);world.combat.damage(0,10000.0,1,DamageKind.HAMMER)
        var wrecks=0
        while(true){val e=world.presentationEvents.poll()?:break;if(e.kind==PresentationKind.WRECK)wrecks++}
        assertEquals(1,wrecks)
        world.reset();assertNull(world.presentationEvents.poll())
    }
}
