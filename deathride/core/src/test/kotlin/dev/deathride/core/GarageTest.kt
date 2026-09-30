package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.util.Random
import kotlin.math.*

class GarageTest {
    @TempDir lateinit var directory: File
    @Test fun offersChargeOnceStayOnTheirCarAndRejectClassLimits() {
        val p=Profile("test");p.credits=2000
        val first=Garage.offer(p,0);assertTrue(first.available)
        val cash=p.credits;assertTrue(Garage.buy(p,0,first.tier).startsWith("Installed"))
        assertEquals(cash-first.price,p.credits);assertEquals(1,p.tier(p.selectedCar,0))
        assertFalse(Garage.buy(p,0,first.tier).startsWith("Installed"));assertEquals(cash-first.price,p.credits)
        val oldCar=p.selectedCar;p.selectedCar=2;assertEquals(0,p.tier(2,0))
        assertFalse(Garage.buy(p,0,0,expectedCar=oldCar).startsWith("Installed"))
        assertEquals("At class limit",Garage.offer(p,Parts.all.indexOfFirst { it.id=="mounts" }).reason)
        assertEquals("At class limit",Garage.offer(p,Parts.all.indexOfFirst { it.id=="armor" }).reason)
        p.selectedCar=4;assertEquals("At class limit",Garage.offer(p,1).reason)
    }
    @Test fun everyPartChangesItsPromisedPhysicalOrCombatConsumer() {
        val p=Profile("spec");p.credits=8000
        val stock=CarCatalog.all[p.selectedCar].spec()
        for(i in Parts.all.indices)assertTrue(Garage.buy(p,i,0).startsWith("Installed"),Parts.all[i].id)
        val upgraded=CarCatalog.all[p.selectedCar].spec(p.bonuses())
        assertTrue(upgraded.maxSpeedMps>stock.maxSpeedMps);assertTrue(upgraded.accelerationMps2>stock.accelerationMps2)
        assertTrue(upgraded.lateralGripPerSecond>stock.lateralGripPerSecond);assertTrue(upgraded.brakeMps2>stock.brakeMps2)
        assertTrue(upgraded.massKg>stock.massKg)
        fun stopping(spec: CarSpec): Double {
            val c=Car(0,Track());c.spec=spec;c.human=true;c.vx=25.0
            val input=InputFrame(brake=1.0);val handling=SlipHandling()
            repeat(300){handling.integrate(c,input,spec,Tuning.STEP_SECONDS)};return c.x
        }
        assertTrue(stopping(upgraded)<stopping(stock))
        val w=World(combatEnabled=true);Garage.apply(p,w.cars[0]);w.reset()
        assertTrue(w.cars[0].armorReduction>CarCatalog.all[p.selectedCar].armorReduction)
        assertTrue(w.combat.ammo(0,Weapons.HAMMER)>Weapons.all[Weapons.HAMMER].ammo)
        val needle=Profile("needle");needle.selectedCar=0;needle.credits=1000
        assertTrue(Garage.buy(needle,5,0).startsWith("Installed"));Garage.apply(needle,w.cars[0]);w.reset()
        assertEquals(2,w.cars[0].weaponSlots);assertEquals(Weapons.all[Weapons.HAMMER].ammo,w.combat.ammo(0,1))
    }
    @Test fun receiptsAreIdempotentInsuredAndBounded() {
        val p=Profile("broke");p.credits=0
        val ticket=Economy.start(p);val receipt=Economy.settle(p,ticket,6,0,0.0)!!
        assertTrue(receipt.insurance>0);assertTrue(p.credits>0);assertEquals(receipt.gross-receipt.repair,p.credits)
        val credits=p.credits;assertNull(Economy.settle(p,ticket,1,5,100.0));assertEquals(credits,p.credits)
        assertNull(Economy.settle(p,ticket+1,1,0,100.0))
        p.credits=EconomyRules["creditCap"].toInt()-1
        val capped=Economy.settle(p,Economy.start(p),1,5,100.0)!!
        assertEquals(1,capped.banked);assertEquals(EconomyRules["creditCap"].toInt(),p.credits)
    }
    @Test fun saveRoundTripRejectsCorruptionAndRecoversPreviousGoodCopy() {
        val p=Profile("phone_123");p.credits=1000;Garage.buy(p,2,0);Economy.settle(p,Economy.start(p),3,1,40.0)
        val text=ProfileCodec.encode(p);val decoded=ProfileCodec.decode(text,p.id)
        assertEquals(text,ProfileCodec.encode(decoded));assertArrayEquals(p.tiers,decoded.tiers)
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(text.dropLast(7),p.id)}
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(text.replace("credits=","credits=99"),p.id)}
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(text,"another")}
        assertThrows(IllegalArgumentException::class.java){ProfileStore(directory).load("../escape")}
        val store=ProfileStore(directory);store.save(p);val firstCash=p.credits
        Garage.buy(p,0,0);store.save(p)
        File(directory,"${p.id}.sav").writeText("interrupted write")
        val recovered=store.load(p.id);assertEquals("Recovered previous save",recovered.status);assertEquals(firstCash,recovered.profile.credits)
        store.save(recovered.profile);assertTrue(File(directory,"${p.id}.corrupt").exists());assertEquals(firstCash,store.load(p.id).profile.credits)
        File(directory,"${p.id}.sav").writeText("bad");File(directory,"${p.id}.bak").writeText("bad")
        assertThrows(IllegalStateException::class.java){store.load(p.id)}
    }
    @Test fun seededEconomyAndExtremesHaveNoDebtOrUnboundedPower() {
        val model=Content.table("economy-model").associate { it.getValue("key") to it.number("value") }
        val count=model.getValue("careers").toInt();val races=model.getValue("racesPerCareer").toInt()
        data class Outcome(val cash: Double,val tiers: Double,val firstEarnedUpgrade: Double,val net: Double,val insurance: Int,val bankrupt: Int)
        fun simulate(policy: String,reward: Double=1.0,repair: Double=1.0,price: Double=1.0,killChance: Double=model.getValue("killChance"),advantage: Double=model.getValue("upgradeFinishAdvantagePerTier")): Outcome {
            var cash=0.0;var tiers=0.0;var first=0.0;var net=0.0;var insurance=0;var bankrupt=0
            repeat(count) { seed ->
                val random=Random(seed.toLong());val p=Profile("sim");var firstBought=0
                // Starter grant can buy a part at race zero; measure first purchase funded after a result separately.
                p.credits=0
                for(race in 1..races) {
                    val power=p.tiers.sum()*advantage
                    val position=when(policy){"winner"->1;"last-wreck"->6;else->(1+random.nextInt(6)-floor(power).toInt()-if(random.nextDouble()<power%1)1 else 0).coerceIn(1,6)}
                    val kills=if(policy=="last-wreck")0 else if(random.nextDouble()<killChance)1+random.nextInt(3) else 0
                    val hp=if(policy=="last-wreck")0.0 else (CombatRules["maxHp"]-model.getValue("hpLossMean")+(random.nextDouble()*2-1)*model.getValue("hpLossSpread")).coerceIn(0.0,CombatRules["maxHp"])
                    val receipt=Economy.settle(p,Economy.start(p),position,kills,hp,reward,repair)!!
                    net+=receipt.net;if(receipt.insurance>0)insurance++;if(p.credits<0)bankrupt++
                    var best: Offer?=null
                    for(i in Parts.all.indices){val offer=Garage.offer(p,i,price);if(offer.available && (best==null || offer.price<best.price))best=offer}
                    if(best!=null){Garage.buy(p,best.partIndex,best.tier,price);if(firstBought==0)firstBought=race}
                    assertTrue(p.credits in 0..EconomyRules["creditCap"].toInt())
                    for(i in p.tiers.indices)assertTrue(p.tiers[i]<=Parts.all[i%Parts.all.size].maxTier)
                }
                cash+=p.credits;tiers+=p.tiers.sum();first+=if(firstBought==0)races+1 else firstBought
            }
            return Outcome(cash/count,tiers/count,first/count,net/(count*races),insurance,bankrupt)
        }
        val report=StringBuilder("scenario,careers,racesPerCareer,meanFinalCash,meanTiers,firstEarnedUpgradeRace,meanNetPerRace,insuranceClaims,bankrupt\n")
        fun row(name: String,o: Outcome){report.append("$name,$count,$races,${o.cash},${o.tiers},${o.firstEarnedUpgrade},${o.net},${o.insurance},${o.bankrupt}\n");assertEquals(0,o.bankrupt);assertTrue(o.net>0);assertTrue(o.firstEarnedUpgrade<=4)}
        row("baseline",simulate("mixed"));row("winner",simulate("winner"));row("last-wreck",simulate("last-wreck"))
        val sweep=StringBuilder("lever,low,high,basis,cashSwing,netSwing,firstUpgradeSwing\n")
        for(r in Content.table("economy-sweeps")) {
            fun run(v: Double)=when(r.getValue("lever")) {
                "rewardScale"->simulate("mixed",reward=v);"repairScale"->simulate("mixed",repair=v);"priceScale"->simulate("mixed",price=v)
                "killChance"->simulate("mixed",killChance=v);"upgradeAdvantage"->simulate("mixed",advantage=v);else->error("Unknown lever")
            }
            val low=run(r.number("low"));val high=run(r.number("high"))
            row(r.getValue("lever")+"-low",low);row(r.getValue("lever")+"-high",high)
            sweep.append("${r.getValue("lever")},${r.getValue("low")},${r.getValue("high")},${r.getValue("basis")},${high.cash-low.cash},${high.net-low.net},${high.firstEarnedUpgrade-low.firstEarnedUpgrade}\n")
        }
        File("build/reports/balance/w5-economy.csv").apply{parentFile.mkdirs();writeText(report.toString())}
        File("build/reports/balance/w5-tornado.csv").writeText(sweep.toString())
    }
}
