package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignClassLimitsTest {
    private fun funded(index: Int)=Profile("limits-$index",false).also{p->p.credits=8000;p.careerCleared=34;p.selectedCar=index;p.owned.fill(false);p.owned[index]=true}

    @Test fun legalShopsPreserveClassWeaknessesInsideTheGlobalEnvelope() {
        for((index,type) in CarCatalog.all.withIndex()) {
            val p=funded(index);CareerSpending.upgrade(p,Parts.all.sumOf{it.maxTier})
            assertTrue(Parts.all.indices.none{Garage.offer(p,it).available})
            for(stat in CarCatalog.statNames)assertTrue(type.stat(stat,p.bonuses())<=type.upgradeLimits.getValue(stat))
            assertTrue(type.upgradeLimits.values.all{it<=10})
            assertEquals(3.0,type.upgradeLimits.getValue("slots"))
            val expected=when(type.id){"Line"->"speed" to 8.25;"Bastion"->"grip" to 9.0;"Quill","Kestrel"->"speed" to 9.5;else->null}
            if(expected!=null)assertEquals(expected.second,type.stat(expected.first,p.bonuses()),0.0)
            val w=World(482);Garage.apply(p,w.cars[0]);assertEquals(type.spec(p.bonuses()),w.cars[0].spec)
            assertTrue(p.credits>=0)
        }
        assertEquals(10,CarCatalog.statMax)
    }

    @Test fun fractionalHeadroomIsDisplayedPricedAndInstalledWithoutRoundingThePhysicalResult() {
        val index=CarCatalog.all.indexOfFirst{it.id=="Quill"};val p=funded(index)
        val engine=Parts.all.indexOfFirst{it.id=="engine"};val speed=CarCatalog.statNames.indexOf("speed")
        repeat(2){assertTrue(Garage.buy(p,engine,it).startsWith("Installed"))}
        val offer=Garage.offer(p,engine);assertTrue(offer.available)
        assertEquals(9.0,offer.before[speed]);assertEquals(9.5,offer.after[speed])
        val rating=PowerRating.of(CarCatalog.all[index],p.bonuses());val cash=p.credits
        assertTrue(Garage.buy(p,engine,2).startsWith("Installed"));assertEquals(cash-offer.price,p.credits)
        val type=CarCatalog.all[index]
        assertEquals(39.0,type.spec(p.bonuses()).maxSpeedMps,0.0)
        assertTrue(PowerRating.of(type,p.bonuses())>rating)
        assertTrue(type.json(p.bonuses()).contains("\"speed\":9.5"))
        assertFalse(Garage.offer(p,engine).available)
    }

    @Test fun savedInstalledPartsStayOwnedAndBothPlayerAndRivalDeriveTheSharedLimits() {
        val text=javaClass.getResourceAsStream("/legacy/campaign-v5-exposed.sav")!!.bufferedReader().readText()
        val id=text.lineSequence().first{it.startsWith("id=")}.substringAfter('=')
        val p=ProfileCodec.decode(text,id);val tiers=p.tiers.copyOf();val owned=p.owned.copyOf()
        val loaded=ProfileCodec.decode(ProfileCodec.encode(p),id)
        assertArrayEquals(tiers,loaded.tiers);assertArrayEquals(owned,loaded.owned)
        for(profile in arrayOf(loaded,*loaded.rivalProfiles))for((index,type) in CarCatalog.all.withIndex())
            for(stat in CarCatalog.statNames)assertTrue(type.stat(stat,profile.bonuses(index))<=type.upgradeLimits.getValue(stat))
        assertEquals(ProfileCodec.encode(loaded),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(loaded),id)))
    }
    @Test fun fixedMissionRigKeepsItsDeclaredBodyAndDoesNotBecomeAnOwnedUpgrade() {
        val owned=CarCatalog.all[DeathDuel.rigIndex]
        assertEquals(5.5,owned.stat("speed"));assertEquals(3.0,owned.stat("handling"))
        val p=funded(DeathDuel.rigIndex);p.careerRound=34
        DeathDuel.seize(p)
        val car=World().cars[0];Garage.apply(p,car)
        assertEquals(32.0,car.spec.maxSpeedMps);assertEquals(8.6,car.spec.accelerationMps2,1e-9)
        assertEquals(1.48,car.spec.steeringRateRadPerSecond,1e-9)
        assertEquals(332.099982802,DeathDuel.rigRating,1e-8)
        assertTrue(DeathDuel.carJson(p).contains("\"speed\":6.0"))
        assertTrue(DeathDuel.carJson(p).contains("dispatcher"))
        assertFalse(Garage.offer(p,0).available)
        assertEquals(owned.id,DeathDuel.rigClass.id)
        assertFalse(CarCatalog.all.contains(DeathDuel.rigClass))
    }

}
