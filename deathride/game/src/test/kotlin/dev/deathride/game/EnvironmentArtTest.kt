package dev.deathride.game

import com.badlogic.gdx.utils.JsonReader
import dev.deathride.core.TrackContent
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class EnvironmentArtTest {
    @Test fun candidatesFailClosedOnMissingOrStaleOwnerEvidence() {
        fun entry(approved: Boolean=true,technical: Boolean=true)=JsonReader().parse("""{
          "review_required":true,"owner_approved":$approved,"technical_eligible":$technical,
          "owner_evidence":"synthetic test fixture only",
          "source_sha256":"${"a".repeat(64)}","export_sha256":"${"b".repeat(64)}",
          "approved_source_sha256":"${"a".repeat(64)}","approved_export_sha256":"${"b".repeat(64)}"}""")
        assertTrue(EnvironmentArt.eligible(entry()))
        assertFalse(EnvironmentArt.eligible(entry(approved=false)))
        assertFalse(EnvironmentArt.eligible(entry(technical=false)))
        for(key in listOf("owner_evidence","source_sha256","export_sha256","approved_source_sha256","approved_export_sha256")) {
            val e=entry();e.remove(key);assertFalse(EnvironmentArt.eligible(e),key)
        }
        val stale=entry();stale.get("export_sha256").set("c".repeat(64));assertFalse(EnvironmentArt.eligible(stale))
        assertTrue(EnvironmentArt.eligible(JsonReader().parse("{}")),"Legacy assets retain previous behavior")
    }
    @Test fun fallbackUsesActualBiomes() {
        assertEquals(TrackContent.themes.map{it.id}.toSet(),EnvironmentArt.fallbackSets.keys)
        assertEquals(5,EnvironmentArt.fallbackSets.values.map{it.toList()}.toSet().size)
        assertFalse(EnvironmentArt.fallbackSets.getValue("alpine").any{it.contains("crate")})
        assertTrue(EnvironmentArt.fallbackSets.getValue("desert").contains("props/soft-dune"))
    }
}
