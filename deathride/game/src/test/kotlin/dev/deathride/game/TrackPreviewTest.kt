package dev.deathride.game

import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class TrackPreviewTest {
    @Test fun arenaPreviewIsAnEqualTierSixCarRehearsalRatherThanAFictionalSixCarDuel() {
        val preview=TrackPreview.read(File("../tracks/candidates/drafts/crown-7-b.json").readText())
        val world=preview.world()
        assertTrue(preview.arena);assertEquals(EventType.LAPS,world.eventType);assertEquals(6,world.entrantCount)
        assertTrue(world.cars.all{!it.human && it.carClass!!.tierRank==4})
    }
    @Test fun nativePreviewLoadsTheSameCandidateAndSixAiEnvelope() {
        val text=File("../tracks/candidates/drafts/scrap-1-a.json").readText()
        val preview=TrackPreview.read(text);val world=preview.world()
        assertEquals("scrap-1-a",preview.id);assertEquals("R3 scrap-1-a",preview.course.name)
        assertEquals(emptyList<String>(),TrackLinter.errors(preview.course))
        assertEquals(2,world.raceLaps);assertEquals(240.0,world.raceLimitSeconds)
        assertTrue(world.cars.all{it.entered && !it.human && it.carClass!!.tierRank==preview.tier})
        assertTrue(preview.course.width.max()-preview.course.width.min()>2)
        assertTrue(preview.course.spots.count{it.kind=="repair"}>=4)
        assertThrows(IllegalArgumentException::class.java){TrackPreview.read(text.replace("\"id\":\"scrap-1-a\"","\"id\":\"../bad\""))}
    }
}
