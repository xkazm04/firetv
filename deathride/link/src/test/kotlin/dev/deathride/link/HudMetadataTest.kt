package dev.deathride.link

import kotlinx.serialization.json.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class HudMetadataTest {
    private fun fields(value: String)=Json.parseToJsonElement("{\"t\":\"hud\"$value}").jsonObject
    @Test fun deltasRefreshChangesPhasesAndPeriodicSnapshots() {
        val metadata=HudMetadata(true)
        fun packet(now: Double,phase: String="race",garage: String="{\"revision\":1}")=
            fields(metadata.json(phase,now,"{}","{}",garage,"{}","{}","{}"))
        assertEquals(7,packet(0.0).size)
        assertEquals(setOf("t"),packet(100.0).keys)
        assertEquals(setOf("t","garage"),packet(200.0,garage="{\"revision\":2}").keys)
        assertEquals(7,packet(300.0,phase="garage").size)
        assertEquals(1,packet(5299.0,phase="garage").size)
        assertEquals(7,packet(5300.0,phase="garage").size)
        assertEquals(3,metadata.fullSnapshots)
    }
    @Test fun legacyClientsStillGetEveryMetadataFieldEveryTime() {
        val metadata=HudMetadata(false)
        repeat(10){assertEquals(7,fields(metadata.json("race",it*100.0,"{}","{}","{}","{}","{}","{}")).size)}
        assertEquals(10,metadata.fullSnapshots)
    }
}
