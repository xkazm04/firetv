package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.util.zip.CRC32

class CampaignDesignV2Test {
    private fun atBoss(act: Int)=Profile("design-boss-$act").also{it.careerRound=(act+1)*7-1;it.careerCleared=it.careerRound}
    private fun signed(body: String)=body+"checksum="+CRC32().apply{update(body.toByteArray(Charsets.UTF_8))}.value.toString(16)+"\n"

    @Test fun ownerPromotionRequiresFirstPlaceAndASurvivingFinish() {
        // Synthetic standings exercise settlement; they are not balance evidence.
        for(act in 0..3) {
            val p=atBoss(act);val round=p.careerRound
            val loss=Career.settle(p,Economy.start(p),round,1,3,0,90.0,true,bossPosition=2)!!
            assertFalse(loss.advanced)
            assertFalse(Career.settle(p,Economy.start(p),round,1,3,0,90.0,true,bossPosition=4)!!.advanced,"Beating the named boss alone was rejected by the owner")
            assertFalse(Career.settle(p,Economy.start(p),round,1,1,0,0.0,true,bossPosition=4)!!.advanced)
            assertFalse(Career.settle(p,Economy.start(p),round,1,1,0,90.0,true,finished=false,bossPosition=4)!!.advanced)
            assertFalse(Career.settle(p,Economy.start(p),round,1,3,0,0.0,true,bossPosition=4)!!.advanced)
            assertFalse(Career.settle(p,Economy.start(p),round,1,3,0,90.0,true,finished=false,bossPosition=4)!!.advanced)
            assertFalse(Career.settle(p,Economy.start(p),round,1,3,0,90.0,true)!!.advanced,"Missing standings retain strict fallback")
            val ticket=Economy.start(p)
            assertTrue(Career.settle(p,ticket,round,1,1,0,90.0,true,bossPosition=4)!!.advanced)
            assertEquals(1,p.campaign.rewards[act]);assertEquals(1,p.lastReceipt!!.position)
            val saved=ProfileCodec.encode(p)
            assertNull(Career.settle(p,ticket,round,1,3,0,90.0,true,bossPosition=4))
            assertEquals(saved,ProfileCodec.encode(p))
        }
        val finale=atBoss(4)
        assertFalse(Career.settle(finale,Economy.start(finale),34,1,2,0,90.0,true,bossPosition=3)!!.advanced)
    }

    @Test fun realGuestGridFindsTheBossByRivalIdentityAndNeverTheGuestSlot() {
        val p=atBoss(1);p.rivalProfiles.forEach{it.credits=8000}
        val w=World(891,track=Track(course=Courses.all[Career.events[p.careerRound].courseIndex]),combatEnabled=true)
        RivalEconomy.apply(p,w,1,guest=true);w.reset()
        val boss=w.cars.single{it.rivalIndex==Career.bossIndex(p.careerRound)}
        assertEquals(2,boss.id)
        boss.position=4;w.cars[1].position=2
        assertEquals(4,Career.bossPosition(w,p.careerRound))
        boss.entered=false
        assertEquals(1,Career.bossPosition(w,p.careerRound))
    }

    @Test fun stolenMoneySurvivesDebtPayoffWalletCapAndRestart() {
        val p=atBoss(1);val s=p.campaign
        // Legitimate ledger after paying the entire principal before exposure.
        s.initial=1200;s.debt=0;s.paid=1600;s.diverted=400;p.credits=8000
        Campaign.promoted(p,13)
        assertEquals(0,s.recovered);assertEquals(400,s.restitutionDue)
        repeat(3){Campaign.prepare(p)}
        assertEquals(400,s.restitutionDue);assertEquals(8000,p.credits)
        val loaded=ProfileCodec.decode(ProfileCodec.encode(p),p.id)
        loaded.credits=7900;Campaign.prepare(loaded)
        assertEquals(8000,loaded.credits);assertEquals(100,loaded.campaign.restitutionPaid);assertEquals(300,loaded.campaign.restitutionDue)
        val exact=ProfileCodec.encode(loaded);Campaign.prepare(loaded);Campaign.promoted(loaded,13)
        assertEquals(exact,ProfileCodec.encode(loaded))
        loaded.credits=7500;Campaign.prepare(loaded)
        assertEquals(7800,loaded.credits);assertEquals(400,loaded.campaign.restitutionPaid);assertEquals(0,loaded.campaign.restitutionDue)
        assertEquals(0,loaded.campaign.debt)
        assertEquals(ProfileCodec.encode(loaded),ProfileCodec.encode(loaded.copy()))
    }

    @Test fun actualV5FixtureKeepsAssetsAndAcquiresOnlyUnreturnedRestitution() {
        val text=javaClass.getResourceAsStream("/legacy/campaign-v5-exposed.sav")!!.bufferedReader().readText()
        assertTrue(text.startsWith("DEATHRIDE_PROFILE 5\n"))
        val fields=text.lines().filter{'=' in it}.associate{it.substringBefore('=') to it.substringAfter('=')}
        val old=fields.getValue("campaign").split(',').map{it.toLong()}
        val p=ProfileCodec.decode(text,fields.getValue("id"))
        assertEquals(fields.getValue("credits").toInt(),p.credits)
        assertEquals(fields.getValue("tiers"),p.tiers.joinToString(","));assertEquals(28,p.careerRound)
        assertEquals(old[1],p.campaign.debt);assertEquals(old[4]-old[5],p.campaign.restitutionDue)
        assertEquals(0,p.campaign.restitutionPaid);assertTrue(p.campaign.rewards.all{it==1})
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
        val body=ProfileCodec.encode(p).substringBefore("checksum=")
        val bad=p.campaign.encode().split(',').toMutableList().also{it[21]=(p.campaign.restitutionDue+1).toString()}.joinToString(",")
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(signed(body.replace("campaign=${p.campaign.encode()}","campaign=$bad")),p.id)}
    }

    @Test fun promotionChoiceNamesTheMissingPeerAndAUsefulFallbackPart() {
        val p=atBoss(0);Campaign.promoted(p,6)
        val named=Campaign.allies[0].car;p.owned[named]=true
        val peer=Campaign.rewardCar(p,0)
        assertNotEquals(named,peer);assertEquals(1,CarCatalog.all[peer].tierRank)
        assertTrue(Campaign.label(p,0,"car").contains(CarCatalog.all[peer].id))
        assertTrue(Campaign.claim(p,"rook:car",p.marketRevision).contains("claimed"));assertTrue(p.owned[peer])
        val q=atBoss(0);Campaign.promoted(q,6)
        q.tiers[q.selectedCar*Parts.all.size+Campaign.allies[0].part]=Parts.all[Campaign.allies[0].part].maxTier
        val part=Campaign.rewardPart(q,0);assertTrue(part>=0);assertNotEquals(Campaign.allies[0].part,part)
        assertTrue(Campaign.label(q,0,"part").contains(Parts.all[part].name))
        val tier=q.tier(q.selectedCar,part)
        assertTrue(Campaign.claim(q,"rook:part",q.marketRevision).contains("claimed"));assertEquals(tier+1,q.tier(q.selectedCar,part))
    }

    @Test fun repeatedLossesNeverChargeEntryOrRemoveTheRoadworthyRetry() {
        for(act in 0..4) {
            val p=atBoss(act);p.credits=0;p.debt=MarketRules["debtCap"].toInt()
            if(act==4)DeathDuel.seize(p)
            repeat(100) {
                val cash=p.credits;val debt=p.campaign.debt
                assertFalse(Career.settle(p,Economy.start(p),p.careerRound,0,6,0,0.0,false,finished=false)!!.advanced)
                assertTrue(p.credits>=cash);assertTrue(p.owned[p.selectedCar])
                assertTrue(p.condition[p.selectedCar]>=MarketRules["roadworthyPercent"])
                assertTrue(p.campaign.debt<=debt+CampaignRules["interestPerEvent"])
                assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
            }
        }
    }

    @Test fun rhythmIsVariedAndThePhysicalClassEnvelopeIsStillShared() {
        assertEquals(35,Career.events.size);assertEquals(367,Career.events.sumOf{it.laps})
        for(act in 0..4) {
            val events=Career.events.filter{it.cupIndex==act}
            assertEquals(listOf("build-up","build-up","build-up","build-up","pressure","qualifier",if(act==4)"finale" else "boss"),events.map{it.phase})
            assertTrue(events[4].laps>events[5].laps)
        }
        assertEquals(10,CarCatalog.statMax);assertEquals(3,CarCatalog.slotsMax)
        assertEquals(0.5,Weapons.all[Weapons.MINE].radiusM)
        assertEquals(.89,CareerCurve.all[6].ratioTarget);assertEquals(.98,CareerCurve.all[20].ratioTarget)
    }
}
