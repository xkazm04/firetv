package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import java.util.Random
import java.util.zip.CRC32
import kotlin.math.*

class CareerTest {
    private val neutral=Array(Tuning.CAR_COUNT){InputFrame()}
    @Test fun orderedContentUnlocksCupTargetsAndDuplicateSettlement() {
        val p=Profile("career")
        assertFalse(Career.unlocked(p,"car","Comet"));assertTrue(Career.unlocked(p,"car","Line"))
        p.credits=1000;Garage.buy(p,0,0);assertFalse(Garage.offer(p,0).available);assertTrue(Garage.offer(p,0).reason.contains("Clear round"))
        val idle=Career.settle(p,Economy.start(p),0,0,3,0,100.0,false)!!
        assertFalse(idle.advanced);assertEquals(0,p.careerRound);assertTrue(p.credits>0)
        for(round in Career.events.indices) {
            val event=Career.events[round];assertTrue(Career.unlocked(p,"track",Courses.all[event.courseIndex].id))
            val ticket=Economy.start(p);val result=Career.settle(p,ticket,round,0,1,1,40.0,true)!!
            assertTrue(result.advanced);val cash=p.credits;val next=p.careerRound
            assertNull(Career.settle(p,ticket,round,0,1,1,40.0,true));assertEquals(cash,p.credits);assertEquals(next,p.careerRound)
            if(round==6){assertEquals(3,result.cupGrade);assertEquals(Career.cups[0].bonuses[3],result.bonus);assertEquals(0,p.careerPoints)}
        }
        assertEquals(1,p.careerSeasons);assertEquals(0,p.careerRound);assertEquals(Career.events.size,p.careerCleared)
        assertTrue(p.careerTrophies.all{it==3});assertTrue(Career.unlocks.all{Career.unlocked(p,it.kind,it.id)})
        assertTrue(Career.partUnlocks.all{Career.maximumPartTier(p,it.part)>=it.tier})
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
    }
    @Test fun versionOneMigratesAndImpossibleCareerStateIsRejected() {
        val p=Profile("migration");p.credits=1234;Garage.buy(p,2,0)
        fun sign(body: String)=body+"checksum="+CRC32().apply{update(body.toByteArray(Charsets.UTF_8))}.value.toString(16)+"\n"
        val body=ProfileCodec.encode(p).substringBefore("checksum=")
        val old=sign(body.replace("DEATHRIDE_PROFILE 6","DEATHRIDE_PROFILE 1").lines().filterNot{it.startsWith("career=") || it.startsWith("trophies=") || it.startsWith("market=") || it.startsWith("owned=") || it.startsWith("condition=") || it.startsWith("ash=") || it.startsWith("grudges=") || it.startsWith("rivals=") || it.startsWith("campaign=")}.joinToString("\n"))
        val migrated=ProfileCodec.decode(old,p.id);assertEquals(p.credits,migrated.credits);assertArrayEquals(p.tiers,migrated.tiers);assertEquals(0,migrated.careerRound)
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(sign(body.replace("career=0,0,0,0,0","career=1,0,50,0,9")),p.id)}
    }
    @Test fun tiersChangeDecisionsWithoutChangingPower() {
        val world=World(track=Track(course=Courses.all[0]),combatEnabled=true)
        for(c in world.cars){CarCatalog.apply(c,1);c.human=true}
        world.reset();repeat(300){world.step(neutral)}
        val c=world.cars[1];c.x=0.0;c.y=0.0;c.heading=0.0
        for(i in world.cars.indices)if(i!=1){world.cars[i].x=1000.0+i*20;world.cars[i].y=1000.0}
        world.cars[0].x=-10.0;world.cars[0].y=0.0
        val spec=c.spec;val hp=world.combat.health(1);val ammo=world.combat.ammo(1,Weapons.MINE)
        c.aiSkill=Career.difficulties[0].skill;world.combat.think(c);assertEquals(0.0,c.aiInput.mine)
        c.aiSkill=Career.difficulties[1].skill;world.combat.think(c);assertEquals(1.0,c.aiInput.mine);assertEquals(2,c.aiCombatReason)
        c.aiStyle=Career.rivals[0];world.combat.think(c);assertEquals(0.0,c.aiInput.mine,"Rook's profile never drops mines")
        c.aiStyle=null;val pickup=world.combat.pickups.first{it.type.id=="repair"};pickup.cooldownSeconds=0.0
        c.x=pickup.x-15;c.y=pickup.y;c.heading=0.0;world.combat.damage(c.id,80.0,-1,DamageKind.WALL)
        c.aiSkill=Career.difficulties[1].skill;world.combat.seekRepair(c,0.0);assertEquals(-1,c.aiPickupTarget)
        c.aiSkill=Career.difficulties[2].skill;world.combat.seekRepair(c,0.0);assertTrue(c.aiPickupTarget>=0)
        pickup.cooldownSeconds=1.0;world.combat.seekRepair(c,0.0);assertEquals(-1,c.aiPickupTarget)
        assertEquals(spec,c.spec);assertEquals(ammo,world.combat.ammo(1,Weapons.MINE));assertTrue(hp<=CombatRules["maxHp"])
        for(tier in Career.difficulties.indices){val w=World(combatEnabled=true);Career.prepareRivals(w,tier);w.reset();for(i in 1..5){assertEquals(CarCatalog.all[Career.rivals[i-1].carIndex].spec(),w.cars[i].spec);assertEquals(w.combat.maxHealth(i),w.combat.health(i))}}
    }
    @Test fun campaignCombatReplaysAndAllocatesNothing() {
        fun make()=World(71,track=Track(course=Courses.all[3]),combatEnabled=true).also {w->CarCatalog.apply(w.cars[0],1);Career.prepareRivals(w,2);w.reset()}
        val a=make();val b=make();repeat(6000){a.step(neutral);b.step(neutral)};assertEquals(a.stateHash(),b.stateHash())
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean;bean.isThreadAllocatedMemoryEnabled=true
        repeat(60000){if(it%600==0)a.reset();a.step(neutral)}
        val id=Thread.currentThread().id;var allocated=0L;var shots=0
        repeat(20){a.reset();val before=bean.getThreadAllocatedBytes(id);repeat(500){a.step(neutral)};allocated+=bean.getThreadAllocatedBytes(id)-before;shots+=a.combat.shots.sum()}
        assertTrue(shots>100);assertEquals(0L,allocated)
    }
}
