package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.abs

class RacePacingTest {
    @Test fun practiceUsesTimeDerivedLapsAndRetainsTheExistingWatchdog() {
        val counts=mutableSetOf<Int>()
        for(course in Courses.all) {
            val w=World(track=Track(course=course))
            assertEquals(course.raceProfile?.laps?:RacePacing.practiceLaps(course.id,course.pool.minTier),w.raceLaps)
            assertEquals(course.raceProfile?.budgetSeconds?:180.0,w.raceLimitSeconds)
            assertTrue(w.raceLaps in 2..3);counts.add(w.raceLaps)
        }
        assertEquals(setOf(2,3),counts)
    }
    @Test fun stableEventsHaveMeasuredDerivedLapsAndOwnerTimeEnvelopes() {
        assertEquals(listOf("scrap","foundry","salt","switchback","crown").flatMap{cup->(1..7).map{"$cup-$it"}},Career.events.map{it.id})
        assertEquals(Career.events.map{it.id}.toSet(),RacePacing.targets.keys)
        assertEquals(Courses.all.size*5,RacePacing.courses.size)
        for((i,e) in Career.events.withIndex()) {
            val course=Courses.all[e.courseIndex]
            val reference=RacePacing.reference(course.id,e.playerTier)
            assertEquals(course.lengthM,reference.lengthM,.01)
            assertEquals(RacePacing.laps(e.id,course.id,e.playerTier),e.laps)
            if(e.elimination){assertEquals(0,e.laps);continue}
            val seconds=e.laps*reference.lapSeconds
            assertTrue(abs(seconds-RacePacing.targets.getValue(e.id))<=reference.lapSeconds*.5+.01,"${e.id}: six laps cannot meet its target")
            if(i%7==0)assertTrue(seconds in 120.0..180.0,"${e.id}: $seconds")
            if(i%7==6)assertTrue(seconds in 240.0..360.0,"${e.id}: $seconds")
        }
    }
    @Test fun finalRoadsAddDistanceCornersSurfaceDecisionsAndPhysicalScenery() {
        for((base,id) in listOf("slagway" to "slagway-final","foundry" to "foundry-final","mirage" to "mirage-final","frostline" to "frostline-final")) {
            val course=Courses.all.single{it.id==id};val original=Courses.all.single{it.id==base}
            val measure=RacePacing.reference(id,course.pool.minTier)
            assertTrue(course.lengthM>original.lengthM*1.3)
            assertTrue(course.nodes.size>original.nodes.size)
            assertTrue(measure.turnChanges>=4 && measure.surfaceChanges>=4,id)
            assertTrue(course.obstacles.any{it.definition.effect!=ObstacleEffect.NONE})
            assertEquals(emptyList<String>(),TrackLinter.errors(course))
            assertEquals(13.0,course.width.min())
        }
    }
    @Test fun independentLapEditAndInvalidLowerBoundCannotSilentlyShip() {
        val row=Content.table("campaign").first()
        assertThrows(IllegalArgumentException::class.java){CareerEvent(row+("laps" to "1"))}
        val changed=if(row.getValue("laps")=="6")"5" else "6"
        assertThrows(IllegalArgumentException::class.java){CareerEvent(row+("laps" to changed))}
    }
}
