package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.util.zip.CRC32
import java.io.File

class CommerceTest {
    @Test fun contentHasEightAttackOrUtilityChoicesWithCompleteConsumers() {
        assertEquals(4,Weapons.all.size);assertEquals(4,Consumables.all.size)
        assertEquals(CarCatalog.all.map{it.id}.toSet(),CarLoadouts.all.keys)
        assertTrue(CarLoadouts.forCar(CarCatalog.all[0]).hullScale<CarLoadouts.forCar(CarCatalog.all[2]).hullScale)
        assertEquals(3,CarLoadouts.all.getValue("Quill").utilitySlots)
        assertTrue(Courses.all.all{c->c.spots.any{it.kind=="cash"}})
        assertTrue(Contracts.all.all{it.course=="any" || Courses.all.any{c->c.id==it.course}})
        assertEquals(1.0,Encounters.damage.getValue("practice"));assertTrue(Encounters.damage.values.all{it in .01..1.0})
    }
    @Test fun marketIsAtomicOnRejectAndCannotMintMoneyOrSellTheLastCar() {
        val p=Profile("market");p.credits=4000;p.careerCleared=Career.events.size
        val before=ProfileCodec.encode(p)
        assertTrue(Market.transact(p,"trade","Bastion",99).startsWith("Offer changed"));assertEquals(before,ProfileCodec.encode(p))
        val cash=p.credits;val original=p.selectedCar;val resale=Market.tradeValue(p)
        assertTrue(Market.transact(p,"trade","Bastion",p.marketRevision).startsWith("Purchased"))
        assertEquals(cash+resale-CarCatalog.all[2].priceCredits,p.credits);assertFalse(p.owned[original]);assertTrue(p.owned[2]);assertEquals(1,p.owned.count{it})
        val after=ProfileCodec.encode(p);assertEquals("Car already owned",Market.transact(p,"buy","Bastion",p.marketRevision));assertEquals(after,ProfileCodec.encode(p))
        assertTrue(Market.tradeValue(p)<CarCatalog.all[2].priceCredits)
        val broke=Profile("broke");broke.credits=0;val saved=ProfileCodec.encode(broke)
        assertEquals("Earn more credits",Market.transact(broke,"trade","Needle",0));assertEquals(saved,ProfileCodec.encode(broke))
    }
    @Test fun loanRepaymentInsuranceAndManualRepairCannotCreateADeadEnd() {
        val p=Profile("borrower");p.credits=0
        assertTrue(Market.transact(p,"loan","",0).startsWith("Loan received"));assertEquals(300,p.credits);assertEquals(330,p.debt)
        assertTrue(Market.transact(p,"loan","",0).startsWith("Offer changed"));assertEquals(330,p.debt)
        p.credits=0;val oldDebt=p.debt;val r=Economy.settle(p,Economy.start(p),6,0,0.0)!!
        assertTrue(p.credits>=MarketRules["minimumTakeHome"]);assertTrue(p.debt<=oldDebt);assertEquals(r.net-r.banked,p.lastDebtPayment)
        assertEquals(100,p.condition[p.selectedCar])
        Market.transact(p,"service","manual",p.marketRevision)
        Economy.settle(p,Economy.start(p),6,0,0.0);assertEquals(50,p.condition[p.selectedCar])
        val before=p.credits;Market.transact(p,"repair","",p.marketRevision);assertEquals(70,p.condition[p.selectedCar]);assertEquals(before-20,p.credits)
        Market.transact(p,"service","auto",p.marketRevision);assertEquals(70,p.condition[p.selectedCar],"Toggling insurance must not heal for free")
        Economy.settle(p,Economy.start(p),6,0,0.0);assertEquals(100,p.condition[p.selectedCar])
    }
    @Test fun itemsArePaidBoundedConsumedAtStartAndSurviveReload() {
        val p=Profile("items");p.credits=1000
        Market.transact(p,"item","turbo",p.marketRevision);assertEquals(1 shl Consumables.TURBO,p.inventory)
        val before=p.credits;assertEquals("Utility slots full",Market.transact(p,"item","fuel",p.marketRevision));assertEquals(before,p.credits)
        Economy.start(p);assertEquals(0,p.inventory);assertEquals(2,p.raceItems)
        val loaded=ProfileCodec.decode(ProfileCodec.encode(p),p.id);assertEquals(p.raceItems,loaded.raceItems)
        val w=World(combatEnabled=true);Garage.apply(loaded,w.cars[0]);w.reset();assertEquals(Consumables.all[1].duration,w.cars[0].turboRemaining)
        Economy.settle(p,p.startedRaces,4,0,90.0);assertEquals(0,p.raceItems)
        Economy.start(p);assertEquals(0,p.raceItems)
    }
    @Test fun contractsBonusesCashAndResultsPayOnlyOnce() {
        val p=Profile("contract");p.credits=0
        Market.transact(p,"contract","delivery",p.marketRevision)
        val t=Economy.start(p);val r=Economy.settle(p,t,1,0,100.0,cash=20,course="foundry",clean=true,finished=true)!!
        assertEquals(-1,p.contract);assertEquals(1,p.contractWins);assertEquals(88,p.lastBonus)
        val after=ProfileCodec.encode(p);assertNull(Economy.settle(p,t,1,0,100.0,cash=20,course="foundry"));assertEquals(after,ProfileCodec.encode(p));assertTrue(r.gross>r.net-1)
        assertThrows(IllegalArgumentException::class.java){Economy.settle(p,Economy.start(p),1,0,100.0,cash=61)}
    }
    @Test fun versionTwoMigratesOwnershipPartsAndConditionWithoutAddingDebt() {
        val p=Profile("legacy-market");p.credits=1500;p.selectedCar=4;p.careerCleared=6;Garage.buy(p,0,0)
        val body=ProfileCodec.encode(p).substringBefore("checksum=").replace("DEATHRIDE_PROFILE 3","DEATHRIDE_PROFILE 2").lines().filterNot{it.startsWith("market=") || it.startsWith("owned=") || it.startsWith("condition=")}.joinToString("\n")
        val old=body+"checksum="+CRC32().apply{update(body.toByteArray())}.value.toString(16)+"\n"
        val migrated=ProfileCodec.decode(old,p.id)
        assertEquals(p.credits,migrated.credits);assertArrayEquals(p.tiers,migrated.tiers);assertTrue(migrated.owned[4]);assertTrue(migrated.condition.all{it==100});assertEquals(0,migrated.debt)
        assertEquals(ProfileCodec.encode(migrated),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(migrated),p.id)))
    }
    @Test fun twoThousandEconomicPathsAndTornadoKeepInsuredIncomePositive() {
        val report=StringBuilder("scenario,careers,firstEngineMean,firstClubMean,minimumCash,bankrupt,meanDebtPaid\n")
        for((name,reward,repair) in listOf(Triple("baseline",1.0,1.0),Triple("reward-low",.8,1.0),Triple("reward-high",1.2,1.0),Triple("repair-low",1.0,.7),Triple("repair-high",1.0,1.3),Triple("last-wreck",1.0,1.0),Triple("borrower",1.0,1.0))) {
            var firstPart=0L;var firstCar=0L;var minimum=Int.MAX_VALUE;var bankrupt=0;var debtPaid=0L
            repeat(2000){seed->
                val random=java.util.Random(seed.toLong());val p=Profile("economic-model");p.credits=0;p.careerCleared=Career.events.size
                if(name=="borrower")Market.transact(p,"loan","",p.marketRevision)
                var boughtPart=0;var boughtCar=0
                for(race in 1..24) {
                    val pos=if(name=="last-wreck")6 else 2+random.nextInt(4);val hp=if(name=="last-wreck")0.0 else 70+random.nextDouble()*30
                    Economy.settle(p,Economy.start(p),pos,0,hp,reward,repair);debtPaid+=p.lastDebtPayment
                    if(boughtPart==0 && Garage.offer(p,0).available){Garage.buy(p,0,0);boughtPart=race}
                    if(boughtPart>0 && boughtCar==0 && p.credits+Market.tradeValue(p)>=CarCatalog.all[4].priceCredits){Market.transact(p,"trade","Trail",p.marketRevision);boughtCar=race}
                    minimum=minOf(minimum,p.credits);if(p.credits<0 || p.owned.none{it})bankrupt++
                }
                firstPart+=if(boughtPart==0)25 else boughtPart;firstCar+=if(boughtCar==0)25 else boughtCar
            }
            assertEquals(0,bankrupt)
            if(name=="baseline"){assertTrue(firstPart/2000.0 in 2.0..3.0);assertTrue(firstCar/2000.0 in 7.0..9.0)}
            report.append("$name,2000,${firstPart/2000.0},${firstCar/2000.0},$minimum,$bankrupt,${debtPaid/2000.0}\n")
        }
        File("build/reports/content/c3-economy.csv").apply{parentFile.mkdirs();writeText(report.toString())}
    }
}
