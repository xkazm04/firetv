package dev.deathride.game

import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.utils.JsonReader
import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File
import java.security.MessageDigest

class StoryArtTest {
    @Test fun invalidMeterCannotLoadAndTriggerAPartialLayout() {
        val root=FileHandle(File("../assets/story-art"))
        val meter=JsonReader().parse(root.child("catalog.json")).get("assets").first{it.getString("key")=="debt-meter"}
        assertTrue(StoryArt.validInterior(meter,meter.getInt("width"),meter.getInt("height")))
        for(bounds in listOf("null","[0,0,0,1]","[0,0,9999,2]","[1,1,2]","[1,70,3,71]")) {
            val invalid=JsonReader().parse("""{"key":"debt-meter","interior":$bounds}""")
            assertFalse(StoryArt.validInterior(invalid,128,128),bounds)
        }
        assertFalse(StoryArt.validInterior(JsonReader().parse("""{"key":"debt-meter"}"""),128,128))
    }
    @Test fun exactEvidenceAndPixelHashRequiredAndRejectionWins() {
        val bytes="synthetic fixture only".toByteArray()
        val hash=MessageDigest.getInstance("SHA-256").digest(bytes).joinToString(""){"%02x".format(it)}
        fun entry(extra: String="",approved: Boolean=true,technical: Boolean=true)=JsonReader().parse("""
            {"owner_approved":$approved,"technical_eligible":$technical,"owner_evidence":"test fixture, never a real asset approval",
            "file":"test.png","source_sha256":"$hash","sha256":"$hash","approved_source_sha256":"$hash","approved_export_sha256":"$hash"$extra}
        """)
        assertTrue(StoryArt.matches(entry(),bytes))
        assertFalse(StoryArt.matches(entry(),bytes+1))
        assertFalse(StoryArt.eligible(entry(approved=false)))
        assertFalse(StoryArt.eligible(entry(technical=false)))
        for(field in listOf("owner_evidence","approved_source_sha256","approved_export_sha256")) {
            val e=entry();e.remove(field);assertFalse(StoryArt.eligible(e),field)
        }
        val unsafe=entry();unsafe.get("file").set("../test.png");assertFalse(StoryArt.eligible(unsafe))
        assertFalse(StoryArt.eligible(JsonReader().parse("{}")))
    }
    @Test fun shippedCandidatesCannotLoadWithoutOwnerDecision() {
        val root=FileHandle(File("../assets/story-art"))
        val catalog=JsonReader().parse(root.child("catalog.json"))
        val assets=catalog.get("assets").toList()
        assertEquals(16,assets.size)
        assertTrue(assets.all{!it.getBoolean("owner_approved") && !StoryArt.eligible(it)})
        for(e in assets)assertEquals(e.getString("sha256"),MessageDigest.getInstance("SHA-256").digest(root.child(e.getString("file")).readBytes()).joinToString(""){"%02x".format(it)})
    }
    @Test fun panelsFollowEarnedPromotionSeizureAndActualVictory() {
        val p=Profile("story-art-fixture")
        // Synthetic menu state only; do not widen the core progression setter for presentation tests.
        fun round(value: Int){Profile::class.java.getDeclaredField("careerRound").apply{isAccessible=true}.setInt(p,value)}
        assertEquals("debt-contract",StoryArt.panel(p,"career",false))
        assertNull(StoryArt.panel(p,"garage",false))
        for(i in 0..3) {
            p.campaign.rewards.fill(0);p.campaign.rewards[i]=1
            assertEquals("ally-"+Campaign.allies[i].id,StoryArt.panel(p,"career",false))
        }
        p.campaign.rewards.fill(2);round(33)
        assertEquals("rig-reveal",StoryArt.panel(p,"career",false))
        round(34);p.campaign.finale=1;p.campaign.seizedCar=p.selectedCar
        assertEquals("car-seizure",StoryArt.panel(p,"career",false))
        assertEquals("final-duel",StoryArt.panel(p,"countdown",true))
        assertNull(StoryArt.panel(p,"countdown",false))
        assertNull(StoryArt.panel(p,"race",true))
        assertNull(StoryArt.panel(p,"results",true))
        p.campaign.finale=2
        assertEquals("ending",StoryArt.panel(p,"results",true))
        assertNull(StoryArt.panel(p,"results",false))
    }
}
