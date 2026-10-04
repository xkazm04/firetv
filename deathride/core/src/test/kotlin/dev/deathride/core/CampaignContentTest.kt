package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignContentTest {
    @Test fun qualifierLicencesOpenBeforeTheBossWithoutGivingAwayTheCar() {
        for(round in listOf(6,13,20,27)) {
            val e=Career.events[round];val p=Profile("qualifier-$round");p.careerRound=round;p.careerCleared=round;p.credits=8000
            p.selectedCar=CarCatalog.all.indices.first{CarCatalog.all[it].tierRank==e.cupIndex};p.owned[p.selectedCar]=true
            assertEquals(e.cupIndex+1,e.playerTier)
            val next=CarCatalog.all.indices.first{CarCatalog.all[it].tierRank==e.playerTier}
            p.careerCleared=round-1;assertFalse(Career.unlocked(p,"car",CarCatalog.all[next].id))
            p.careerCleared=round;assertTrue(Career.unlocked(p,"car",CarCatalog.all[next].id));assertFalse(p.owned[next])
            CareerSpending.spend(p,0);assertEquals(e.playerTier,CarCatalog.all[p.selectedCar].tierRank);assertTrue(p.credits<8000)
            assertEquals(round,p.careerRound);assertEquals(0,p.campaign.rewards[round/7])
        }
    }
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
