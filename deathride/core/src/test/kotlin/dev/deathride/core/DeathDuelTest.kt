package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.lang.management.ManagementFactory
import java.io.File

class DeathDuelTest {
    private val frames=Array(6){InputFrame()}
    private fun world(seed: Int=701)=World(seed,combatEnabled=true).also{w->
        w.eventType=EventType.ELIMINATION;w.raceLaps=0
        for(c in w.cars){c.entered=c.id<2;c.human=true;CarCatalog.apply(c,DeathDuel.boss.carIndex)}
        w.reset()
    }
    private fun unarm(w: World){while(w.combat.armingSeconds>0)w.step(frames)}
    private fun profile()=Profile("campaign-probe-q2").also{p->
        p.careerRound=34;p.careerCleared=34;p.credits=8000;p.selectedCar=DeathDuel.boss.carIndex;p.owned[p.selectedCar]=true
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
    }
    @Test fun lapCountsAndTimeoutLeaderNeverWinAnElimination() {
        val w=world();val c=w.cars[0]
        // Exercise the real lap gate with four complete ordered circuits, then the world's finish gate.
        for(n in 0..160)c.lap.update(w.track.startM+n*w.track.lengthM/32)
        assertTrue(c.lap.laps>=3);w.step(frames)
        assertEquals(FinishKind.NONE,c.finishKind);assertFalse(Career.qualifies(c,w))
        while(w.seconds<w.raceLimitSeconds)w.step(frames)
        assertTrue(w.duelDraw);assertEquals(0,w.finished);assertFalse(Career.qualifies(c,w))
        val p=profile();DeathDuel.seize(p)
        assertFalse(Career.settle(p,Economy.start(p),34,1,1,0,100.0,false,finished=false)!!.advanced)
        assertEquals(34,p.careerRound);assertEquals(1,p.campaign.finale)
        val draw=world();unarm(draw)
        for(i in 0..1)draw.combat.damage(i,10000.0,1-i,DamageKind.RIVET)
        draw.step(frames);assertTrue(draw.duelDraw);assertEquals(0,draw.finished)
        val win=world();unarm(win);win.combat.damage(1,10000.0,0,DamageKind.RIVET);win.step(frames)
        assertEquals(FinishKind.ELIMINATION,win.cars[0].finishKind);assertTrue(Career.qualifies(win.cars[0],win))
    }
    @Test fun seizureRetryAndRestitutionKeepCollateralAndPackedItemsIntact() {
        val p=profile();val seized=p.selectedCar;p.condition[seized]=73;p.inventory=3
        File("build/reports/campaign/q2-fixture.sav").apply{parentFile.mkdirs();writeText(ProfileCodec.encode(p))}
        File("build/reports/campaign/q2-guest.sav").writeText(ProfileCodec.encode(Profile("campaign-guest-q2").also{it.inventory=3}))
        DeathDuel.seize(p);val revision=p.marketRevision;DeathDuel.seize(p);assertEquals(revision,p.marketRevision)
        assertTrue(DeathDuel.story(p).lines[0].contains(CarCatalog.all[seized].id))
        val reload=ProfileCodec.decode(ProfileCodec.encode(p),p.id)
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(reload));assertEquals(seized,reload.campaign.seizedCar)
        val ticket=Economy.start(p);assertEquals(3,p.inventory);assertEquals(0,p.raceItems)
        val rig=world().cars[0];Garage.apply(p,rig)
        assertEquals("Line",rig.carClass!!.id);assertSame(AbilityCatalog.dispatcher,rig.ability.definition);assertEquals(1.0,rig.startingCondition)
        assertFalse(Garage.offer(p,0).available)
        val before=ProfileCodec.encode(p);Market.transact(p,"trade","Needle",p.marketRevision);assertEquals(before,ProfileCodec.encode(p))
        Career.settle(p,ticket,34,1,2,0,0.0,false,finished=false)
        assertEquals(73,p.condition[seized]);assertEquals(0,p.lastReceipt!!.repair);assertEquals(34,p.careerRound)
        val win=Economy.start(p);Career.settle(p,win,34,1,1,1,50.0,true)
        assertEquals(2,p.campaign.finale);assertEquals(seized,p.selectedCar);assertEquals(73,p.condition[seized]);assertEquals(0,p.campaign.debt)
        val state=ProfileCodec.encode(p);assertNull(Career.settle(p,win,34,1,1,1,50.0,true));assertEquals(state,ProfileCodec.encode(p))
        assertEquals(state,ProfileCodec.encode(ProfileCodec.decode(state,p.id)))
    }
    @Test fun automaticDispatcherPaysEnergyAndUsesOneOrdinaryMinePerTelegraphedActivation() {
        val w=world();val c=w.cars[0];c.vx=10.0
        w.abilities.begin(c,frames[0],Tuning.STEP_SECONDS);assertEquals(0,c.ability.activation)
        c.vx=0.0;unarm(w);w.abilities.begin(c,frames[0],Tuning.STEP_SECONDS);assertEquals(0,c.ability.activation)
        c.vx=10.0;val ammo=w.combat.ammo(0,Weapons.MINE);val d=AbilityCatalog.dispatcher
        w.abilities.begin(c,frames[0],Tuning.STEP_SECONDS)
        assertEquals(AbilityPhase.WINDUP,c.ability.phase);assertEquals(d.energyCapacity-d.energyCost,c.ability.energy,1e-9)
        assertEquals(0,w.combat.shots[Weapons.MINE])
        while(c.ability.phase==AbilityPhase.WINDUP)w.abilities.begin(c,frames[0],Tuning.STEP_SECONDS)
        repeat(10){w.abilities.resolve()}
        assertEquals(1,w.combat.shots[Weapons.MINE]);assertEquals(ammo,w.combat.ammo(0,Weapons.MINE))
        val mine=w.combat.mines.single{it.active};assertEquals(0.0,mine.ageSeconds)
        assertEquals(.5,Weapons.all[Weapons.MINE].radiusM);assertTrue(Weapons.all[Weapons.MINE].armingSeconds>0)
        repeat(100){w.abilities.begin(c,frames[0],Tuning.STEP_SECONDS);w.abilities.resolve()}
        assertEquals(1,c.ability.activation);assertTrue(c.ability.cooldownSeconds>0)
    }
    @Test fun bossPerceptionHasARealRangeAndWallGateWithoutSpecChanges() {
        fun sample(x: Double,y: Double): Car {
            val w=world();val b=w.cars[1];b.human=false;b.aiStyle=DeathDuel.boss;b.aiSkill=Career.difficulties[1].skill
            b.x=-25.0;b.y=40.0;b.heading=0.0;w.cars[0].x=x;w.cars[0].y=y
            val spec=b.spec;repeat(12){w.step(frames)};assertEquals(spec,b.spec);return b
        }
        assertEquals(0,sample(-5.0,40.0).aiDuelTarget)
        assertEquals(-1,sample(110.0,40.0).aiDuelTarget)
        assertEquals(-1,sample(-25.0,-40.0).aiDuelTarget)
    }
    @Test fun realDispatchReplaysAndAllocatesZeroBytesInTheStep() {
        val input=Array(6){InputFrame(.12,1.0)}
        val a=world();val b=world();a.presentationEvents.enabled=true
        repeat(1200){a.step(input);b.step(input)};assertEquals(a.stateHash(),b.stateHash())
        assertTrue(a.presentationEvents.size>0)
        a.reset();assertEquals(0,a.presentationEvents.size)
        assertSame(AbilityCatalog.dispatcher,a.cars[0].ability.definition)
        val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true;val thread=Thread.currentThread().id
        repeat(20){a.reset();repeat(500){a.step(input)}}
        var bytes=0L;var uses=0
        repeat(20){a.reset();val before=bean.getThreadAllocatedBytes(thread);repeat(500){a.step(input)};bytes+=bean.getThreadAllocatedBytes(thread)-before;uses+=a.cars[0].ability.activation}
        assertTrue(uses>0);assertEquals(0L,bytes)
    }
}
