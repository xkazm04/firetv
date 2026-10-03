package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignBalanceTest {
    @Test fun curveRejectsPrizeCliffsAndConflictingFinaleMeaning() {
        assertTrue(CareerCurve.errors().isEmpty())
        fun reject(index: Int,point: CurvePoint,rule: String) {
            val mutant=CareerCurve.all.toMutableList();mutant[index]=point
            assertTrue(CareerCurve.errors(mutant).any{rule in it},rule)
        }
        reject(14,CareerCurve.all[14].copy(rewardScale=1.0),"must not decrease")
        reject(34,CareerCurve.all[34].copy(ratioBasis="lap-field"),"Ratio basis")
        reject(20,CareerCurve.all[20].copy(ratioTarget=.98),"planned dip")
        reject(0,CareerCurve.all[0].copy(fieldTarget=Double.NaN),"economy value")
        reject(3,CareerCurve.all[3].copy(number=99),"event/tier")
        assertTrue(CareerCurve.errors(CareerCurve.all.dropLast(1)).any{"ordered event" in it})
        val p=Profile("finale-reference");p.careerRound=34;p.careerCleared=34
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
        val actual=PowerRating.of(CarCatalog.all[DeathDuel.rigIndex])/RivalEconomy.fieldRating(p)
        assertEquals(CareerCurve.all.last().ratioTarget,actual,.015,"Reference PR describes the supplied rig; it does not assert a win rate")
    }

    @Test fun allFourRebalancedCashChoicesUseExactOnceCappedTransactions() {
        assertEquals(listOf(350,650,1000,1400),Campaign.allies.map{it.money})
        for((i,ally) in Campaign.allies.withIndex())for(nearCap in listOf(false,true)) {
            val p=Profile("payout-$i-$nearCap");p.careerRound=(i+1)*7-1;p.careerCleared=p.careerRound
            Career.settle(p,Economy.start(p),p.careerRound,1,1,0,90.0,true)
            val cap=EconomyRules["creditCap"].toInt();p.credits=if(nearCap)cap-7 else 100
            val before=p.credits;val revision=p.marketRevision
            assertTrue(Campaign.claim(p,"${ally.id}:money",revision).contains("claimed"))
            assertEquals(minOf(cap,before+ally.money),p.credits)
            assertEquals(minOf(cap-before,ally.money),p.campaign.lastGrant)
            val saved=ProfileCodec.encode(p);val loaded=ProfileCodec.decode(saved,p.id)
            assertFalse(Campaign.claim(loaded,"${ally.id}:money",revision).contains("claimed"))
            Campaign.claim(loaded,"${ally.id}:money",loaded.marketRevision)
            assertEquals(saved,ProfileCodec.encode(loaded))
        }
    }
}
