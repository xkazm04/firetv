package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class EnduranceTest {
    @Test fun lapTargetIsConsumedWithoutEndingCareerAtThreeLapsAndPracticeStaysShort() {
        val w=World();assertEquals(3,w.raceLaps);assertEquals(180.0,w.raceLimitSeconds)
        w.raceLaps=6;val input=Array(6){InputFrame()}
        while(w.cars[0].lap.laps<3 && w.seconds<w.raceLimitSeconds)w.step(input)
        assertEquals(3,w.cars[0].lap.laps);assertTrue(w.cars[0].finishSeconds<0)
        while(w.cars[0].finishSeconds<0 && w.seconds<w.raceLimitSeconds)w.step(input)
        assertEquals(6,w.cars[0].lap.laps);assertTrue(w.cars[0].finishSeconds>0)
        w.reset();assertEquals(6,w.raceLaps);assertEquals(360.0,w.raceLimitSeconds)
        val p=Profile("format");RivalEconomy.apply(p,w,1);assertEquals(Career.events[0].laps,w.raceLaps)
        assertTrue(Career.json(p,"").contains("\"laps\":${w.raceLaps}"))
    }
    @Test fun promotionFieldsKeepLegalPurchasesAcrossJoinsAndIgnorePlayerPower() {
        for(round in listOf(6,13,20,27)) {
            val p=Profile("promotion-$round");p.careerRound=round;p.careerCleared=round;p.rivalProfiles.forEach{it.credits=8000}
            RivalEconomy.prepare(p);val boss=RivalEconomy.fieldRating(p)
            val cast=RivalEconomy.cast(round)
            for(i in cast){val npc=p.rivalProfiles[i];assertEquals(CareerCurve.all[round].fieldTier,CarCatalog.all[npc.selectedCar].tierRank);assertTrue(npc.owned[npc.selectedCar]);assertTrue(npc.tiers.sum()>0)}
            val cars=cast.map{p.rivalProfiles[it].selectedCar};val parts=cast.map{p.rivalProfiles[it].tiers.copyOf()}
            p.careerRound++;p.careerCleared++;RivalEconomy.prepare(p)
            for((slot,i) in cast.withIndex()){assertEquals(cars[slot],p.rivalProfiles[i].selectedCar);assertTrue(p.rivalProfiles[i].tiers.sum()>=parts[slot].sum())}
            // The Champion cast adds Marrow for Relay, whose fixed finale ceiling is intentionally lower.
            if(round!=27)assertTrue(RivalEconomy.fieldRating(p)>=boss-.001)
        }
        val p=Profile("format-skill");p.careerRound=6;p.careerCleared=6;p.rivalProfiles.forEach{it.credits=8000}
        val a=World(combatEnabled=true);val b=World(combatEnabled=true)
        RivalEconomy.apply(p,a,0);RivalEconomy.apply(p,b,2)
        assertEquals(a.raceLaps,b.raceLaps);assertEquals(a.damageScale,b.damageScale)
        for(i in 1..5){assertEquals(a.cars[i].spec,b.cars[i].spec);assertEquals(a.cars[i].maxHp,b.cars[i].maxHp)}
    }
}
