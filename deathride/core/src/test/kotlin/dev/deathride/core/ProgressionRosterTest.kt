package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ProgressionRosterTest {
    @Test fun budgetIdentityAndDerivedUpgradeRatingRejectBadContent() {
        assertEquals(emptyList<String>(), PowerRating.errors())
        val car=CarCatalog.all.first()
        val rogue=CarClass(car.values+CarCatalog.statNames.associateWith { if(it=="slots")"3" else "10" })
        assertTrue(PowerRating.errors(CarCatalog.all.map{if(it===car)rogue else it}).any{it.contains("PR outside")})
        val flat=CarCatalog.all.map{CarClass(it.values+CarCatalog.statNames.associateWith{if(it=="slots")"2" else "5"})}
        assertEquals(CarCatalog.all.size,PowerRating.errors(flat).count{it.contains("identity pair")})
        val p=Profile("pr-upgrade");p.selectedCar=0;p.credits=1000
        val before=PowerRating.of(car,p.bonuses())
        assertTrue(Garage.buy(p,0,0).startsWith("Installed"))
        assertTrue(PowerRating.of(car,p.bonuses())>before)
        assertTrue(Garage.json(p,"","").contains("\"powerRating\":${PowerRating.of(car,p.bonuses())}"))
    }

    @Test fun heavyPaysForSpeedWithLaunchSteeringResponseAndBrakingAndCanBeKilled() {
        val heavy=CarCatalog.all.single{it.id=="Bastion"};val light=CarCatalog.all.single{it.id=="Trail"}
        val h=heavy.spec();val l=light.spec()
        assertTrue(h.maxSpeedMps>l.maxSpeedMps && h.massKg>l.massKg)
        assertTrue(h.accelerationMps2<l.accelerationMps2 && h.brakeMps2<l.brakeMps2)
        assertTrue(h.steeringRateRadPerSecond<l.steeringRateRadPerSecond && h.yawResponseSeconds>l.yawResponseSeconds)
        // SI proxy for engine force is mass times acceleration; launch acceleration alone is not engine power.
        assertTrue(h.massKg*h.accelerationMps2>l.massKg*l.accelerationMps2)
        val w=World(combatEnabled=true);val input=Array(6){InputFrame()}
        for(c in w.cars)c.human=true
        CarCatalog.apply(w.cars[0],CarCatalog.all.indexOf(heavy));w.reset()
        while(w.combat.armingSeconds>0)w.step(input)
        val began=w.seconds;var next=w.seconds
        while(!w.combat.wrecked(0) && w.seconds-began<RosterRules["maximumHeavyKillSeconds"]){
            if(w.seconds>=next){w.combat.damage(0,Weapons.all[Weapons.RIVET].burstDamage,1,DamageKind.RIVET);next+=Weapons.all[Weapons.RIVET].cycleSeconds}
            w.step(input)
        }
        assertTrue(w.combat.wrecked(0),"Heavy survives declared continuous Rivet envelope")
        assertEquals(0,w.combat.oneShotKills)
    }
}
