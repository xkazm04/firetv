package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*
import java.lang.management.ManagementFactory

class AbilitiesTest {
    private val frames=Array(Tuning.CAR_COUNT){InputFrame()}
    private fun fixture(id: String): World {
        val w=World(913,combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true;c.entered=c.id<3}
        CarCatalog.apply(w.cars[0],CarCatalog.all.indexOfFirst{it.id==id});w.reset()
        repeat(ceil(CombatRules["startProtectionSeconds"]/Tuning.STEP_SECONDS).toInt()+1){w.step(frames)}
        pose(w.cars[0],-35.0,40.0);pose(w.cars[1],-10.0,40.0);pose(w.cars[2],0.0,-40.0)
        return w
    }
    private fun pose(c: Car,x: Double,y: Double) { c.x=x;c.y=y;c.heading=0.0;c.vx=0.0;c.vy=0.0;c.yaw=0.0 }
    private fun tick(w: World,input: Double=0.0) {
        frames[0].ability=input
        for(c in w.cars){c.engineScale=1.0;w.abilities.begin(c,frames[c.id],Tuning.STEP_SECONDS)}
        w.abilities.resolve();frames[0].ability=0.0
    }
    private fun start(w: World) { tick(w,1.0);assertEquals(AbilityPhase.WINDUP,w.cars[0].ability.phase) }
    private fun active(w: World) { start(w);while(w.cars[0].ability.phase==AbilityPhase.WINDUP)tick(w) }

    @Test fun definitionsHaveBudgetedCostsEscapableRegionsAndSurvivableDamage() {
        assertEquals(CarCatalog.all.map{it.id}.toSet(),AbilityCatalog.byCar.keys)
        assertEquals(10,AbilityCatalog.all.map{it.kind}.toSet().size)
        assertEquals(emptyList<String>(),PowerRating.errors())
        val largestRadius=CarCatalog.all.maxOf{it.spec().circleRadiusM}
        for(d in AbilityCatalog.all) {
            assertTrue(d.cooldownSeconds>d.windupSeconds+d.activeSeconds+d.recoverySeconds)
            if(d.ray || d.kind==AbilityKind.PATCH)assertTrue(d.windupSeconds>d.perceptionSeconds+(d.radiusM+largestRadius)/d.escapeSpeedMps,d.id)
            for(car in CarCatalog.all) {
                val hp=CombatRules["maxHp"]*CarLoadouts.forCar(car).hullScale
                assertTrue(d.damage*(1-car.armorReduction)<hp)
                // An already travelling Hammer plus a laid Mine and ram can coincide with an ability.
                val overlap=d.damage+Weapons.all[Weapons.HAMMER].damage+Weapons.all[Weapons.MINE].damage+CombatRules["ramMaxDamage"]
                assertTrue(overlap*(1-car.armorReduction)<hp,"${d.id} overlap against ${car.id}")
            }
        }
        val quill=CarCatalog.all.single{it.id=="Quill"}
        assertEquals(6,quill.stat("mass"));assertTrue(quill.spec().massKg>CarCatalog.all.first().spec().massKg)
    }

    @Test fun protectionCooldownEnergyWeaponLockAndResetHaveActualConsumersForEveryClass() {
        for(type in CarCatalog.all) {
            val w=World(combatEnabled=true);for(c in w.cars)c.human=true
            CarCatalog.apply(w.cars[0],CarCatalog.all.indexOf(type));w.reset();val c=w.cars[0];val d=c.ability.definition!!
            frames[0].ability=1.0
            repeat(60){w.step(frames)}
            assertEquals(0,c.ability.activation);assertEquals(d.energyCapacity,c.ability.energy);assertEquals(0.0,c.ability.cooldownSeconds)
            while(c.ability.activation==0)w.step(frames)
            frames[0].ability=0.0
            assertEquals(d.energyCapacity-d.energyCost,c.ability.energy,1e-8)
            val ammo=w.combat.ammo(0,Weapons.RIVET);assertFalse(w.combat.fire(0,Weapons.RIVET));assertEquals(ammo,w.combat.ammo(0,Weapons.RIVET))
            val until=ceil((d.windupSeconds+d.activeSeconds+d.recoverySeconds)/Tuning.STEP_SECONDS).toInt()+1
            repeat(until){w.step(frames)}
            assertEquals(AbilityPhase.READY,c.ability.phase);assertTrue(c.ability.cooldownSeconds>0)
            frames[0].ability=1.0;w.step(frames);frames[0].ability=0.0;assertEquals(1,c.ability.activation)
            w.reset();assertEquals(d.energyCapacity,c.ability.energy);assertEquals(0,c.ability.activation);assertEquals(0,c.ability.hitMask)
        }
    }

    @Test fun movementSignaturesChangeTheCommonSolverAndExpireWithoutMutatingSpecs() {
        for(id in listOf("Needle","Line","Bastion","Comet","Trail","Quill","Bulwark")) {
            fun run(on: Boolean): Triple<Double,Double,CarSpec> {
                val w=fixture(id);val c=w.cars[0];w.abilities.enabled=on
                                c.vx=if(id=="Comet")c.spec.maxSpeedMps else 15.0
                w.track.surface=if(id=="Trail")Surfaces.practice.first{it.id=="Gravel"} else Surfaces.asphalt
                frames[0].throttle=1.0;frames[0].steer=.15;frames[0].ability=if(on)1.0 else 0.0
                repeat(60){w.step(frames)}
                frames[0].throttle=0.0;frames[0].steer=0.0;frames[0].ability=0.0
                return Triple(c.speedMps,c.yaw,c.spec)
            }
            val off=run(false);val on=run(true)
            assertEquals(off.third,on.third,"No permanent spec mutation")
            assertTrue(abs(off.first-on.first)+abs(off.second-on.second)>1e-5,"$id needs a real movement consumer")
        }
        val w=fixture("Trail");w.cars[0].surface=Surfaces.asphalt;active(w);assertEquals(1.0,w.cars[0].abilityGripScale)
        w.cars[0].surface=Surfaces.practice.first{it.id=="Gravel"};tick(w);assertTrue(w.cars[0].abilityGripScale>1)
        while(w.cars[0].ability.committed)tick(w)
        assertEquals(1.0,w.cars[0].abilityGripScale);assertEquals(1.0,w.cars[0].abilitySpeedScale)
    }

    @Test fun raysFreezeTheirTellCanMissRespectRoadAndDeduplicate() {
        for(id in listOf("Flint","Kestrel")) {
            val w=fixture(id);val s=w.cars[0].ability;val hp=w.combat.health(1)
            start(w);val ex=s.endX;val ey=s.endY
            w.cars[0].heading=PI/2;w.cars[1].y+=12
            while(s.phase==AbilityPhase.WINDUP)tick(w)
            assertEquals(ex,s.endX);assertEquals(ey,s.endY);assertEquals(hp,w.combat.health(1),"Escaping the fixed lane must work")
            val hit=fixture(id);active(hit);val after=hit.combat.health(1)
            assertTrue(after<hit.combat.maxHealth(1));repeat(5){hit.abilities.resolve()};assertEquals(after,hit.combat.health(1));assertEquals(1,hit.combat.abilityHits[0])
            val wall=fixture(id);wall.cars[0].heading=PI/2;pose(wall.cars[1],-35.0,70.0);active(wall)
            assertEquals(wall.combat.maxHealth(1),wall.combat.health(1));assertTrue(wall.cars[0].ability.endY<=52.0)
        }
    }

    @Test fun patchArmsEscapesHitsItsOwnerOnceAndCanHitAgainOnANewActivation() {
        val w=fixture("Vandal");val owner=w.cars[0];start(w)
        val s=owner.ability;val target=w.cars[1];pose(target,s.x,s.y)
        val hp=w.combat.health(1);repeat(10){tick(w)};assertEquals(hp,w.combat.health(1))
        target.y+=20
        while(s.phase==AbilityPhase.WINDUP)tick(w)
        assertEquals(hp,w.combat.health(1))
        pose(target,s.x,s.y);w.abilities.resolve();val after=w.combat.health(1);assertTrue(after<hp)
        pose(owner,s.x,s.y);w.abilities.resolve();assertTrue(w.combat.health(0)<w.combat.maxHealth(0))
        repeat(20){tick(w)};assertEquals(after,w.combat.health(1))
        while(s.committed || s.cooldownSeconds>0 || s.energy<s.definition!!.energyCost)tick(w)
        active(w);pose(target,s.x,s.y);w.abilities.resolve();assertTrue(w.combat.health(1)<after)
    }

    @Test fun frontChargeAndFrontRearSpikesRequireActualDirectionalContact() {
        for(id in listOf("Bastion","Quill"))for(direction in listOf("front","rear","side")) {
            val w=fixture(id);val c=w.cars[0];val o=w.cars[1];active(w)
            val front=c.spec.circleOffsetM+c.spec.circleRadiusM+o.spec.circleOffsetM+o.spec.circleRadiusM-.1
            when(direction) {
                "front"->{pose(o,c.x+front,c.y);c.vx=12.0}
                "rear"->{pose(o,c.x-front,c.y);o.vx=12.0}
                else->{pose(o,c.x,c.y+c.spec.circleRadiusM+o.spec.circleRadiusM-.1);c.vy=12.0}
            }
            w.ramClosingMps.fill(0.0);w.collide(c,o);assertTrue(w.ramClosingMps[1]>0)
            val hp=w.combat.health(1);w.abilities.resolve()
            val expected=direction=="front" || id=="Quill" && direction=="rear"
            assertEquals(expected,w.combat.health(1)<hp,"$id/$direction")
            val after=w.combat.health(1);repeat(10){w.abilities.resolve()};assertEquals(after,w.combat.health(1))
        }
    }

    @Test fun guardReducesOneHpAuthorityAndShockExpiresWithoutStackingOrDisablingSteering() {
        val guard=fixture("Bulwark");active(guard);val c=guard.cars[0];val hp=guard.combat.health(0)
        guard.combat.damage(0,20.0,1,DamageKind.RIVET)
        assertEquals(20*(1-c.armorReduction)*(1-c.ability.definition!!.damageReduction),hp-guard.combat.health(0),1e-9)
        while(c.ability.committed)tick(guard)
        val before=guard.combat.health(0);guard.combat.damage(0,20.0,1,DamageKind.RIVET)
        assertEquals(20*(1-c.armorReduction),before-guard.combat.health(0),1e-9)
        val shock=fixture("Kestrel");active(shock);val target=shock.cars[1];tick(shock)
        assertEquals(shock.cars[0].ability.definition!!.slowScale,target.engineScale)
        assertEquals(1.0,target.abilitySteerScale)
        repeat(120){tick(shock)};assertEquals(1.0,target.engineScale);assertEquals(0.0,target.ability.slowSeconds)
    }

    @Test fun wreckFinishAndAbsentCarsCannotEmitAQueuedAbility() {
        for(state in listOf("wreck","finish","absent")) {
            val w=fixture("Flint");start(w);val hp=w.combat.health(1)
            when(state){"wreck"->w.combat.damage(0,10000.0,1,DamageKind.RIVET);"finish"->w.cars[0].finishSeconds=w.seconds;else->w.cars[0].entered=false}
            repeat(100){tick(w,1.0)}
            assertEquals(hp,w.combat.health(1));assertEquals(AbilityPhase.READY,w.cars[0].ability.phase);assertEquals(1,w.cars[0].ability.activation)
        }
    }

    @Test fun abilityMailboxRejectsNonfiniteAndOldInputsAndClearsStaleReconnect() {
        val box=InputMailbox();val out=InputFrame()
        assertFalse(box.offer(0,0.0,0.0,0.0,0.0,0.0,ability=Double.NaN))
        assertTrue(box.offer(1,0.0,0.0,.4,1.0,0.0,ability=1.0));box.consume(0.0,out);assertEquals(1.0,out.ability)
        assertFalse(box.offer(0,0.0,0.0,0.0,0.0,0.0,ability=1.0))
        box.consume(Tuning.STALE_MS+1,out);assertEquals(0.0,out.ability)
        box.newConnection();box.consume(0.0,out);assertEquals(0.0,out.ability)
    }

    @Test fun aiNeedsLocalVisibleTargetsAndSnapshotKeepsTheActualCommittedRegion() {
        val w=fixture("Flint");val c=w.cars[0];c.aiSkill=AiSkills.all.first{it.id=="Club"}
        w.abilities.think(c);assertEquals(1.0,c.aiInput.ability)
        w.cars[1].y+=15;w.abilities.think(c);assertEquals(0.0,c.aiInput.ability)
        pose(w.cars[1],c.x-20,c.y);w.abilities.think(c);assertEquals(0.0,c.aiInput.ability)
        c.heading=PI/2;pose(w.cars[1],c.x,70.0);w.abilities.think(c);assertEquals(0.0,c.aiInput.ability,"An aligned target beyond a road wall is not visible")
        c.heading=0.0;pose(w.cars[1],-10.0,40.0);start(w)
        w.snapshot.capture(w.cars);val x=w.snapshot.abilityX(0);val end=w.snapshot.abilityEndX(0)
        c.x+=20;c.heading+=1
        assertEquals(x,w.snapshot.abilityX(0));assertEquals(end,w.snapshot.abilityEndX(0));assertEquals(AbilityPhase.WINDUP,w.snapshot.abilityPhase(0))
        while(c.ability.phase==AbilityPhase.WINDUP)tick(w)
        w.previousSnapshot.capture(w.cars);tick(w);w.snapshot.capture(w.cars)
        assertEquals(end,w.snapshot.abilityEndX(0));assertEquals(c.ability.definition,w.snapshot.abilityDefinition(0))
    }

    @Test fun allSignaturesReplayAndAllocateZeroBytesWhileActivating() {
        val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true;val thread=Thread.currentThread().id
        var bytes=0L;val uses=IntArray(10)
        for(group in 0..1) {
            fun make()=World(987+group,combatEnabled=true).also{w->
                for(c in w.cars){CarCatalog.apply(c,(group*5+c.id)%10);c.human=true};w.reset()
            }
            val a=make();val b=make();val input=Array(6){InputFrame(.15,1.0).also{it.ability=1.0}}
            repeat(1500){a.step(input);b.step(input)};assertEquals(a.stateHash(),b.stateHash())
            repeat(20){a.reset();repeat(500){a.step(input)}}
            repeat(20){a.reset();val before=bean.getThreadAllocatedBytes(thread);repeat(500){a.step(input)};bytes+=bean.getThreadAllocatedBytes(thread)-before
                for(c in a.cars)uses[(group*5+c.id)%10]+=c.ability.activation
            }
        }
        assertTrue(uses.all{it>0},"Every class must activate in measured steps")
        assertEquals(0L,bytes,"60 Hz abilities allocate no bytes")
    }
}
