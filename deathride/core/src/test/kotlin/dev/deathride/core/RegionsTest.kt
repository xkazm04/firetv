package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RegionsTest {
    @Test fun allProductionCoursesAndDivisionsHaveExplicitAssignments() {
        assertEquals(listOf("Ash Yards","Cinder Row","Salt Cut","Thin Air","The Crown"),Regions.all.map{it.name})
        assertEquals(Courses.all.map{it.id}.toSet(),Regions.all.flatMap{it.defaultCourses}.toSet())
        assertEquals(Career.cups.map{it.id}.toSet(),Regions.all.map{it.division}.toSet())
        for(c in Courses.all)assertTrue(c.id in c.region.defaultCourses,c.id)
        for(e in Career.events) {
            assertEquals(Career.cups[e.cupIndex].id,e.region.division)
            assertTrue(Courses.all[e.courseIndex].json(e.region).contains("\"region\":\"${e.region.id}\""))
        }
        val reused=Career.events.filter{Courses.all[it.courseIndex].id=="frostline-final"}
        assertEquals(setOf("switchback","crown"),reused.map{it.region.id}.toSet())
        assertEquals("switchback",Courses.all.single{it.id=="runoff"}.region.id)
    }
    @Test fun authoredPalettesAndBudgetsAreNotPlaceholders() {
        assertEquals(0x655C4B,Regions.named("salt").palette.getValue("asphalt"))
        assertEquals(listOf(12,10,12,20,3),Regions.all.map{it.weatherCap})
        assertEquals(16,Regions.all.sumOf{it.variants.size})
        assertEquals(5,Regions.all.map{it.backdrop}.distinct().size)
        assertEquals(setOf("sleet","snow"),Regions.named("switchback").weather.map{it.kind}.toSet())
        for(r in Regions.all) {
            assertTrue(r.props.all{it in RegionDefinition.KEPT_PROPS})
            assertTrue(r.ambience.all{it.startsWith("region.")})
            assertTrue(r.plot.contains(r.boss))
        }
    }
    @Test fun unsafeWeatherAndUnknownPropsFailAtContentLoad() {
        val row=Content.table("region").first()
        for(change in listOf(mapOf("weather" to "ash:25:3:4:12:0.5"),mapOf("grade" to "NaN;1;1"),mapOf("weatherCap" to "11"),mapOf("propBias" to "environment/derelict-crane:1"),mapOf("weather" to "fog:24:3:8:128:0.6")))
            assertThrows(IllegalArgumentException::class.java){RegionDefinition(row+change)}
    }
    @Test fun regionOnlyCourseChangesHaveIdenticalPhysicsAndSaveBytes() {
        val c=Courses.all.first();val inputs=Array(6){InputFrame()}
        val save=ProfileCodec.encode(Profile("region-save"))
        val hashes=Regions.all.map { region ->
            val copy=Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,c.junctions,c.branches,c.raceProfile,region)
            assertArrayEquals(c.x,copy.x);assertArrayEquals(c.width,copy.width)
            val world=TrackDraft.world(copy,0,seed=1122)
            repeat(600){world.step(inputs)}
            world.stateHash()
        }
        assertEquals(1,hashes.distinct().size)
        assertEquals(save,ProfileCodec.encode(ProfileCodec.decode(save,"region-save")))
        assertTrue(save.startsWith("DEATHRIDE_PROFILE 6\n"));assertFalse(save.contains("region="))
    }
}
