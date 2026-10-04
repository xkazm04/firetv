package dev.deathride.core

import java.io.File
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class OwnerTracksTest {
    @Test fun provisionalBossRetainsThreeLapsTierOneAndItsRegion() {
        val event=Career.events.single{it.id=="scrap-7"}
        val course=Courses.all[event.courseIndex]
        assertEquals("scrap-7-f",course.id)
        val row=Content.table("campaign").single{it["id"]=="scrap-7"}
        assertEquals("3",row["laps"])
        for(id in listOf("scrap-7-d","scrap-7-e","scrap-7-f")) {
            assertTrue(File(TrackQuality.root,"tracks/candidates/drafts/$id.json").exists())
            assertEquals("scrap-7",id.substringBeforeLast('-'))
        }
    }

    @Test fun assignmentsPreserveEveryStableEventAndItsNonLayoutFields() {
        val before=TrackQuality.csv(File(TrackQuality.root,"tracks/excluded/owner-2026-10-04/campaign-before.csv").readText())
        val after=Content.table("campaign")
        assertEquals(before.map{it.getValue("id")},after.map{it.getValue("id")})
        for((old,current) in before.zip(after))assertEquals(old.filterKeys{it !in setOf("course","laps")},current.filterKeys{it !in setOf("course","laps")})
        assertEquals("runoff",after.single{it["id"]=="switchback-4"}["course"])
        assertEquals("6",after.single{it["id"]=="switchback-4"}["laps"])
    }
    @Test fun rejectedAndUnreviewedProposalsAreAbsentAndAllKeepsHavePracticeAccess() {
        val active=TrackQuality.csv(File(TrackQuality.root,"tracks/candidates/manifest.csv").readText()).map{it.getValue("candidate")}.toSet()
        val old=TrackQuality.csv(File(TrackQuality.root,"tracks/excluded/owner-2026-10-04/manifest-before.csv").readText()).map{it.getValue("candidate")}.toSet()
        val ids=Courses.all.map{it.id}.toSet()
        assertTrue((old-active).intersect(ids).isEmpty())
        assertTrue(ids.containsAll(active.filter{!it.startsWith("scrap-7-")}))
        val rows=TrackQuality.csv(File(TrackQuality.root,"tracks/candidates/owner-assignment.csv").readText())
        for(row in rows.filter{it.getValue("status")!="pending-new-layout"}) {
            val event=Career.events.single{it.id==row.getValue("event")}
            assertEquals(row.getValue("course"),Courses.all[event.courseIndex].id)
            for(id in row.getValue("alternate").split(';').filter{it.isNotEmpty()}) {
                assertTrue(id in ids);assertTrue(Career.unlocks.any{it.kind=="track" && it.id==id})
                assertFalse(Career.events.any{Courses.all[it.courseIndex].id==id})
            }
        }
    }
}
