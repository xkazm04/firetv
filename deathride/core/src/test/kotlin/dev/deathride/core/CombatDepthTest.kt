package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CombatDepthTest {
    private val input=Array(6){InputFrame()}
    private fun arena(mask: Int=0): World {
        val w=World(61,track=Track(1000.0,200.0,100.0),combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true};w.cars[0].utilityMask=mask;w.reset()
        repeat(241){w.step(input)};w.combat.reset()
        for(c in w.cars){c.x=-400+c.id*100.0;c.y=200.0;c.heading=0.0;c.vx=0.0;c.vy=0.0}
        return w
    }
    @Test fun scatterDeduplicatesBodyCirclesAndRaysAndCostsAmmo() {
        val w=arena();w.cars[1].x=w.cars[0].x+16
        val before=w.combat.health(1);assertTrue(w.combat.fire(0,Weapons.SCATTER))
        assertEquals(before-Weapons.all[3].damage*(1-w.cars[1].armorReduction),w.combat.health(1),1e-9)
        assertEquals(1,w.combat.damageEvents[1]);assertEquals(1,w.combat.hits[DamageKind.SCATTER.ordinal]);assertEquals(w.combat.capacity(0,3)-1,w.combat.ammo(0,3))
        assertFalse(w.combat.fire(0,3));assertEquals(w.combat.maxHealth(0),w.combat.health(0))
        val mailbox=InputMailbox();assertTrue(mailbox.offer(1,0.0,0.0,0.0,1.0,0.0,weapon=3));assertFalse(mailbox.offer(2,0.0,0.0,0.0,1.0,0.0,weapon=2))
    }
    @Test fun spikesUseTheRamCooldownAndSabotageIsDeclaredAndNonCumulative() {
        val normal=arena();val spikes=arena(1 shl Consumables.SPIKES)
        for(w in arrayOf(normal,spikes)){w.ramClosingMps[1]=10.0;w.combat.step(input,Tuning.STEP_SECONDS)}
        assertEquals(normal.combat.damageTaken[1]*Consumables.all[0].magnitude,spikes.combat.damageTaken[1],1e-9)
        assertEquals(normal.combat.damageTaken[0],spikes.combat.damageTaken[0]);val hp=spikes.combat.health(1)
        repeat(10){spikes.combat.step(input,Tuning.STEP_SECONDS)};assertEquals(hp,spikes.combat.health(1))
        val sabotage=arena(1 shl Consumables.SABOTAGE);assertEquals(1,sabotage.combat.sabotageTarget[0]);val reduced=sabotage.combat.ammo(1,0)
        assertTrue(reduced<sabotage.combat.capacity(1,0));sabotage.combat.reset();assertEquals(reduced,sabotage.combat.ammo(1,0))
    }
    @Test fun reservesChangeAccelerationWithoutRaisingTheSpeedCap() {
        fun run(mask: Int): Pair<Double,Double> {
            val w=arena(mask);input[0].throttle=1.0
            var top=0.0;repeat(180){w.step(input);top=maxOf(top,w.cars[0].speedMps)}
            input[0].throttle=0.0;assertTrue(top<=w.cars[0].spec.maxSpeedMps+1e-9)
            if(mask and 2!=0)assertTrue(w.cars[0].turboRemaining<Consumables.all[1].duration)
            if(mask and 4!=0)assertTrue(w.cars[0].fuelRemaining<Consumables.all[2].duration)
            return w.cars[0].x to top
        }
        val normal=run(0);assertTrue(run(2).first>normal.first+2);assertTrue(run(4).first>normal.first+1)
    }
    @Test fun cashPickupIsBoundedAndHullRepairUsesTheClassMaximum() {
        val w=World(track=Track(course=Courses.all[0]),combatEnabled=true);for(c in w.cars){CarCatalog.apply(c,0);c.human=true};w.reset();repeat(241){w.step(input)}
        val c=w.cars[0];val cash=w.combat.pickups.first{it.type.id=="cash"};c.x=cash.x;c.y=cash.y
        repeat(10){cash.cooldownSeconds=0.0;w.combat.step(input,Tuning.STEP_SECONDS)}
        assertEquals(MarketRules["raceCashCap"].toInt(),w.combat.cashCollected[0])
        w.combat.damage(0,20.0,-1,DamageKind.WALL);val repair=w.combat.pickups.first{it.type.id=="repair"};c.x=repair.x;c.y=repair.y
        w.combat.step(input,Tuning.STEP_SECONDS);assertEquals(c.maxHp,w.combat.health(0));assertTrue(c.maxHp<100)
    }
    @Test fun fullLoadoutReplaysAndNewStepPathsAllocateNothing() {
        fun make()=World(709,track=Track(course=Courses.all[5]),combatEnabled=true).also{w->
            for(c in w.cars){CarCatalog.apply(c,6);c.utilityMask=15;c.aiSkill=Career.difficulties[1].skill};Encounters.apply(w,"scrap");w.reset()
        }
        val a=make();val b=make();repeat(5000){a.step(input);b.step(input)};assertEquals(a.stateHash(),b.stateHash())
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean;bean.isThreadAllocatedMemoryEnabled=true
        val w=make();repeat(60000){w.cars[0].turboRemaining=4.0;w.cars[0].fuelRemaining=30.0;w.step(input)}
        val thread=Thread.currentThread().threadId();val before=bean.getThreadAllocatedBytes(thread)
        repeat(10000){w.cars[0].turboRemaining=4.0;w.cars[0].fuelRemaining=30.0;w.step(input)}
        assertEquals(0L,bean.getThreadAllocatedBytes(thread)-before)
    }
}
