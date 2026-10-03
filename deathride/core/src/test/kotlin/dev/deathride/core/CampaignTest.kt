package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.util.zip.CRC32

class CampaignTest {
    @Test fun browserFixtureUsesActualPromotionSettlements() {
        val p=Profile("campaign-probe-q1")
        repeat(28){round->Career.settle(p,Economy.start(p),round,1,1,0,90.0,true)}
        p.credits=200 // Explicit funded menu fixture, not an earned playthrough.
        p.rivalProfiles.forEach{it.credits=8000}
        RivalEconomy.prepare(p) // Exercise the same menu gate as the browser, including legal NPC purchases.
        assertTrue(p.campaign.rewards.all{it==1});assertEquals(28,p.careerRound)
        java.io.File("build/reports/campaign/q1-fixture.sav").apply{parentFile.mkdirs();writeText(ProfileCodec.encode(p))}
    }
    private fun boss(index: Int): Profile = Profile("boss-$index").also{p->
        p.careerRound=(index+1)*7-1;p.careerCleared=p.careerRound
        Career.settle(p,Economy.start(p),p.careerRound,1,1,0,90.0,true)
    }
    @Test fun leagueReceiptConservesMoneyAndNeverSpendsTheProtectedIncomeTwice() {
        val p=Profile("league");p.debt=1000
        for(position in 1..6) {
            val cash=p.credits;val debt=p.campaign.debt;val ticket=Economy.start(p)
            Career.settle(p,ticket,0,0,position,0,0.0,false)
            val s=p.campaign;val r=p.lastReceipt!!
            assertEquals(r.net,r.banked+p.lastDebtPayment+s.lastPayment.toInt())
            assertTrue(p.credits-cash>=minOf(r.net,MarketRules["minimumTakeHome"].toInt()))
            assertEquals(s.lastPayment,s.lastCredited+s.lastDiverted)
            assertEquals(s.initial+s.interest-s.paid+s.diverted-s.recovered-s.voided,s.debt)
            val state=ProfileCodec.encode(p);assertNull(Career.settle(p,ticket,0,0,position,0,0.0,false));assertEquals(state,ProfileCodec.encode(p))
            assertTrue(s.debt<=debt+CampaignRules["interestPerEvent"].toLong())
        }
        assertEquals(CampaignRules["interestPerEvent"].toLong(),p.campaign.interest)
        val before=p.campaign.encode();repeat(3){Campaign.prepare(p)};assertEquals(before,p.campaign.encode())
        Economy.settle(p,Economy.start(p),1,0,100.0);assertEquals(before,p.campaign.encode(),"Practice does not charge league debt")
    }
    @Test fun eachRewardUsesRealOwnershipOrPartCapsAndSurvivesRestartWithoutDuplication() {
        for(choice in Campaign.choices) {
            val p=boss(0);assertEquals(1,p.campaign.rewards[0])
            val loaded=ProfileCodec.decode(ProfileCodec.encode(p),p.id);val revision=loaded.marketRevision
            val money=loaded.credits;val part=loaded.tier(loaded.selectedCar,Campaign.allies[0].part)
            assertTrue(Campaign.claim(loaded,"rook:$choice",revision).contains("claimed"))
            when(choice) {
                "money"->assertEquals(money+Campaign.allies[0].money,loaded.credits)
                "car"->assertTrue(loaded.owned[Campaign.allies[0].car])
                else->assertEquals(part+1,loaded.tier(loaded.selectedCar,Campaign.allies[0].part))
            }
            val state=ProfileCodec.encode(loaded)
            Campaign.claim(loaded,"rook:$choice",revision);Campaign.claim(loaded,"rook:money",loaded.marketRevision)
            assertEquals(state,ProfileCodec.encode(loaded));assertEquals(state,ProfileCodec.encode(loaded.copy()))
        }
        val p=boss(0);p.credits=8000;p.owned[Campaign.allies[0].car]=true
        assertTrue(Campaign.claim(p,"rook:money",p.marketRevision).contains("full"))
        assertTrue(Campaign.claim(p,"rook:car",p.marketRevision).contains("owned"));assertEquals(1,p.campaign.rewards[0])
    }
    @Test fun losingBossCannotPromoteAndOxRecoversTheStolenMoneyExactlyOnce() {
        val p=Profile("exposure");p.careerRound=6;p.careerCleared=6
        val loss=Career.settle(p,Economy.start(p),6,1,2,0,80.0,true)!!
        assertFalse(loss.advanced);assertEquals(6,p.careerRound);assertEquals(0,p.campaign.rewards[0])
        assertTrue(p.lastReceipt!!.banked>0)
        p.careerRound=13;p.careerCleared=13
        Career.settle(p,Economy.start(p),13,1,1,0,80.0,true)
        assertTrue(p.campaign.exposed);assertTrue(p.campaign.recovered>0)
        val recovered=p.campaign.recovered;val interest=p.campaign.interest
        Campaign.promoted(p,13);Campaign.prepare(p,14)
        assertEquals(recovered,p.campaign.recovered);assertEquals(interest,p.campaign.interest)
        Campaign.payment(p,200,0);assertEquals(0,p.campaign.lastDiverted)
        assertEquals(p.campaign.initial+p.campaign.interest-p.campaign.paid+p.campaign.diverted-p.campaign.recovered,p.campaign.debt)
        p.grudges[Career.rivals.indexOfFirst{it.id=="ox"}]=1
        assertEquals(Campaign.allies[1].grudgeLine,Campaign.taunt(p,"ox"))
    }
    @Test fun versionFourKeepsEveryOldAssetAndAddsNeitherDebtNorRetroactiveGrants() {
        val p=boss(1);p.credits=712;p.debt=93
        fun sign(body: String)=body+"checksum="+CRC32().apply{update(body.toByteArray())}.value.toString(16)+"\n"
        val body=ProfileCodec.encode(p).substringBefore("checksum=")
        val legacy=body.replace("DEATHRIDE_PROFILE 5","DEATHRIDE_PROFILE 4").lines().filterNot{it.startsWith("campaign=")}.joinToString("\n")
        val migrated=ProfileCodec.decode(sign(legacy),p.id)
        assertEquals(p.credits,migrated.credits);assertEquals(p.debt,migrated.debt);assertArrayEquals(p.tiers,migrated.tiers);assertArrayEquals(p.owned,migrated.owned)
        assertEquals(0,migrated.campaign.debt);assertEquals(5,migrated.campaign.rewards[0]);assertEquals(5,migrated.campaign.rewards[1]);assertEquals(-1,Campaign.pending(migrated))
        val bad=body.replace("campaign=${p.campaign.encode()}","campaign=1,2,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,-1,0,0")
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(sign(bad),p.id)}
    }
}
