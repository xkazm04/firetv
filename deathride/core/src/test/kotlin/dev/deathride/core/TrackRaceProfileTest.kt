package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class TrackRaceProfileTest {
    @Test fun changingTheGridInvalidatesCandidateProof() {
        val c=Courses.all.first()
        val moved=Course(c.id,c.name,c.lesson,(c.startFraction+.1)%1,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,c.junctions,c.branches,c.raceProfile)
        assertNotEquals(candidateProofDigest(c,2,3),candidateProofDigest(moved,2,3))
    }
    @Test fun longRoadEnvelopeSurvivesImportAndIsTheActualRuntimeWatchdog() {
        val base=Courses.all.first();val fields=TrackLabCodec.csv(base)+mapOf("id" to base.id,"race" to "laps,tier,budgetSeconds\n3,2,420\n")
        val draft=TrackDraft.course(fields)
        val imported=TrackDraft.course(TrackLabCodec.csv(draft)+("id" to draft.id))
        assertEquals(TrackRaceProfile(3,2,420.0),imported.raceProfile)
        val world=TrackDraft.world(imported,2)
        assertEquals(3,world.raceLaps);assertEquals(420.0,world.raceLimitSeconds)
        assertTrue(world.cars.all{!it.human && it.entered && it.carClass!!.tierRank==2 && it.aiSkill!!.id=="Pro"})
        val censored=qualityTrial(imported,7319,0,limitSeconds=1.0,tier=2,laps=3)
        assertEquals("right-censored-timeout",censored.stoppingReason)
        assertEquals(0,censored.finished);assertTrue(censored.results.all{it["finishSeconds"]==null})
        assertEquals(1.0,censored.configuration["limitSeconds"])
        assertEquals(420.0,TrackDraft.world(imported,2,true).raceLimitSeconds)
    }
    @Test fun malformedEnvelopesCannotSilentlyFallBackToLegacyTiming() {
        val base=Courses.all.first();val fields=TrackLabCodec.csv(base)+("id" to base.id)
        for(row in listOf("0,2,420","3,5,420","3,2,NaN","3,2,119","3.5,2,420","3,2,420\n3,2,420"))
            assertThrows(IllegalArgumentException::class.java){TrackDraft.course(fields+("race" to "laps,tier,budgetSeconds\n$row\n"))}
        assertTrue(Courses.all.all{it.raceProfile==null},"Owner proposals must not silently replace production content")
    }
    @Test fun recoveryChoicesRespectTheActualCarCapsuleAndPickupTrigger() {
        val w=World(combatEnabled=true);val car=w.cars[0]
        CarCatalog.apply(car,CarCatalog.all.indices.maxBy{CarCatalog.all[it].spec().widthM})
        car.x=0.0;car.y=0.0;car.heading=0.0
        val radius=PickupTypes.all.single{it.id=="repair"}.radiusM
        assertTrue(w.combat.inRadius(car,0.0,-3.5,radius) && w.combat.inRadius(car,0.0,3.5,radius),"The first paired layout was actually one overlapping collection zone")
        assertFalse(w.combat.inRadius(car,0.0,-5.2,radius));assertFalse(w.combat.inRadius(car,0.0,5.2,radius))
        car.y=5.2
        assertTrue(w.combat.inRadius(car,0.0,5.2,radius));assertFalse(w.combat.inRadius(car,0.0,-5.2,radius))
    }
    @Test fun shallowSplitCannotLeaveAiSteeringTowardTheOtherPhysicalRibbon() {
        val recipe=java.io.File(TrackQuality.root,"tracks/candidates/recipes/crown-7-b.csv").readText()
        val slot=CandidateAuthor.slots.single{it.id=="crown-7"}
        val course=CandidateAuthor.compose(slot,recipe,"crown-7-b").course
        assertEquals(1,course.branches.size)
        for(rotation in 0..2) {
            val trial=qualityTrial(course,2971+rotation*65537,rotation,limitSeconds=360.0,tier=4,laps=2,combatEnabled=false)
            assertEquals(6,trial.finished,trial.results.toString());assertEquals(0,trial.stuckCount)
        }
    }
}
