package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignContentTest {
    @Test fun plotDataCoversEveryEventAndOnlyLegalPromotionAssets() {
        val beats=Content.table("campaign-beats")
        assertEquals(Career.events.map{it.id},beats.map{it.getValue("event")})
        assertEquals(5,beats.map{it.getValue("hub")}.distinct().size)
        val allies=Content.table("campaign-allies")
        assertEquals(listOf("rook","ox","vex","mica"),allies.map{it.getValue("id")})
        for((i,a) in allies.withIndex()) {
            assertEquals(Career.events[(i+1)*7-1].id,a.getValue("event"))
            assertEquals(i+1,CarCatalog.all.single{it.id==a.getValue("car")}.tierRank)
            assertTrue(Parts.all.any{it.id==a.getValue("part")})
            assertTrue(a.number("money")>0)
        }
        assertEquals(5,Content.table("campaign-mechanic").size)
        val rules=Content.table("campaign-rules").associate{it.getValue("key") to it.number("value")}
        assertEquals(2.0,rules.getValue("duelEntrants"))
        assertEquals(0.0,rules.getValue("allyRaceBenefit"))
        assertEquals(0.5,Weapons.all[Weapons.MINE].radiusM)
    }
}
