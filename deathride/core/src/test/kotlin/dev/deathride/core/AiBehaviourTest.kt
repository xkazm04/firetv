package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.lang.management.ManagementFactory

class AiBehaviourTest {
    private val inputs=Array(6){InputFrame()}
    private fun fixture(skill: String="Club",car: String="Line"): World {
        val w=World(912,combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,CarCatalog.all.single{it.id==car});c.aiSkill=AiSkills.all.single{it.id==skill};c.human=true}
        w.reset();repeat(241){w.step(inputs)}
        for(c in w.cars){c.human=false;c.x=1000.0+c.id*100;c.y=1000.0;c.vx=0.0;c.vy=0.0;c.heading=0.0}
        w.ai.reset();return w
    }
    private fun pose(w: World,id: Int,x: Double,y: Double=40.0) { val c=w.cars[id];c.x=x;c.y=y;c.heading=0.0;c.position=id+1 }
    private fun progress(w: World,id: Int,laps: Int) {
        val c=w.cars[id];c.lap.reset(w.track.startM)
        for(n in 0..laps*64+1)c.lap.update(w.track.startM+n*w.track.lengthM/64)
    }
    @Test fun authoredArchetypesAndEveryPersonaComposeRealDrivingChoices() {
        assertEquals(3,AiMode.entries.size)
        for(type in CarCatalog.all) {
            val w=fixture(car=type.id);val c=w.cars[1];val s=w.ai.states[1]
            val t=s.temperament!!
            assertEquals(AiCatalog.temperaments.getValue(type.id),t)
            s.target=0;s.phase=2;s.pressure=1.0;s.targetLane=3.0;s.targetAlong=1.0;s.targetDistance=c.spec.lengthM
            w.combat.lastTarget[1]=0;s.leaseUntil=w.seconds+2
            assertEquals(t.risk,w.ai.risk(c))
            assertTrue(w.ai.lane(c,0.0)>0,type.id)
            if(type.id in listOf("Bastion","Bulwark","Quill","Vandal","Flint"))assertTrue(t.contact>=.6,type.id)
            if(type.id in listOf("Needle","Line","Trail"))assertTrue(t.contact<.2,type.id)
            assertEquals(0.0,w.ai.drift(c,0.1),"Authored grip drivers do not request decorative drift")
        }
        for(r in Career.rivals+DeathDuel.boss) {
            val w=fixture();val c=w.cars[1];c.aiStyle=r;w.ai.reset()
            val t=w.ai.states[1].temperament!!;val base=AiCatalog.temperaments.getValue("Line")
            assertNotEquals(base,t,r.id)
            assertEquals((base.risk+AiCatalog.personas.getValue(r.id).number("laneRisk")).coerceIn(.3,.7),w.ai.risk(c))
            assertEquals(kotlin.math.max(0.0,c.aiSkill!!.cornerMarginMps+t.cornerMargin),w.ai.cornerMargin(c,c.aiSkill!!))
        }
    }
    @Test fun allPlansHaveBoundedHuntersAndNoStartProtectionHunt() {
        for((id,count) in listOf("Rookie" to 0,"Club" to 1,"Pro" to 2,"Champion" to 3)) {
            val w=fixture(id);assertEquals(count,w.ai.states.count{it.hunter},id)
            assertFalse(w.ai.states[0].hunter)
            w.reset()
            for(c in w.cars){progress(w,c.id,3);w.combat.think(c);assertFalse(w.ai.states[c.id].hunting);assertEquals(-1,w.combat.lastTarget[c.id]);assertEquals(0.0,c.aiInput.fire)}
            assertEquals(0,w.combat.shots.sum())
        }
    }
    @Test fun hunterTargetsCurrentLeaderDuoSymmetricallyAndCannotSeeThroughWalls() {
        for(human in listOf(false,true)) {
            val w=fixture();val hunter=w.ai.states.indexOfFirst{it.hunter};val c=w.cars[hunter]
            pose(w,hunter,-30.0);c.position=6;progress(w,hunter,3)
            pose(w,0,-10.0);w.cars[0].human=human;w.cars[0].position=1
            pose(w,2,-20.0);w.cars[2].position=3
            w.combat.think(c);assertEquals(0,w.ai.states[hunter].target);assertTrue(w.ai.states[hunter].hunting)
            assertEquals(AiReason.LEADER,w.ai.states[hunter].reason)
            w.ai.states[hunter].decisionStep=-1;w.cars[0].position=3;w.cars[2].position=2
            w.combat.think(c);assertEquals(2,w.ai.states[hunter].target,"Rank changes invalidate old hunt targets even within commitment")
            w.ai.states[hunter].decisionStep=-1;w.cars[2].y=-40.0
            w.combat.think(c);assertEquals(-1,w.ai.states[hunter].target)
            assertEquals(0,w.ai.states[hunter].visible and (1 shl 2))
            w.ai.states[hunter].decisionStep=-1;w.cars[2].x=100.0;w.cars[2].y=40.0
            w.combat.think(c);assertEquals(-1,w.ai.states[hunter].target)
        }
    }
    @Test fun sharedLeasesCapWeaponsAndOffensiveAbilitiesAndReleaseOnHitDeathAndTimeout() {
        val w=fixture("Rookie","Flint");pose(w,0,0.0)
        for(id in 1..5){pose(w,id,-20.0);w.combat.think(w.cars[id]);w.abilities.think(w.cars[id])}
        assertEquals(2,w.ai.attackers(0));assertEquals(2,w.ai.maximumAttackers)
        assertEquals(2,(1..5).count{w.ai.offensiveAbilityAllowed(w.cars[it],0)})
        assertTrue(w.cars.drop(3).all{it.aiInput.fire==0.0 && it.aiInput.ability==0.0})
        w.combat.damage(0,1.0,1,DamageKind.RIVET)
        assertEquals(-1,w.combat.lastTarget[1]);assertTrue(w.ai.states[1].recoverUntil>w.seconds)
        w.ai.states[1].decisionStep=-1;w.combat.think(w.cars[1]);assertEquals(AiReason.HIT_RECOVERY,w.ai.states[1].reason)
        w.ai.states[3].decisionStep=-1;w.ai.states[3].commitmentUntil=w.seconds;w.combat.think(w.cars[3]);assertEquals(2,w.ai.attackers(0))
        w.ai.states[2].leaseUntil=w.seconds;w.ai.beforeStep();assertEquals(-1,w.combat.lastTarget[2])
        w.cars[0].finishSeconds=w.seconds;w.ai.beforeStep();assertEquals(0,w.ai.attackers(0))
        w.eventType=EventType.ELIMINATION;w.combat.damage(2,1.0,3,DamageKind.RIVET)
        assertEquals(w.ai.states[3].plan!!.recovery*AiControls["duelHitRecoveryScale"],w.ai.states[3].recoverUntil-w.seconds,1e-9)
    }
    @Test fun commitmentRetainsVisibleTargetUntilMarginAndDecisionCadenceAreSatisfied() {
        val w=fixture("Rookie");pose(w,1,-30.0);pose(w,0,-10.0);pose(w,2,-9.0)
        val c=w.cars[1];w.combat.think(c);val s=w.ai.states[1];assertEquals(0,s.target)
        w.cars[2].position=1;w.cars[0].position=6;w.ai.states[1].decisionStep=-1
        w.combat.think(c);assertEquals(0,s.target);assertEquals(AiReason.COMMITTED,s.reason)
        val decisions=s.decisions;w.combat.think(c);assertEquals(decisions,s.decisions)
        s.commitmentUntil=w.seconds;s.decisionStep=-1;s.temperament=s.temperament!!.copy(leader=10.0)
        w.combat.think(c);assertEquals(2,s.target)
        assertTrue(s.commitmentUntil>w.seconds);assertTrue(w.ai.traceCount>=3)
    }
    @Test fun phasesChangePressureAndFinalLapKeepsDrivingCommitment() {
        val w=fixture();w.raceLaps=6;val c=w.cars[1];c.position=5
        w.combat.think(c);assertEquals(0,w.ai.states[1].phase);assertEquals(0.0,w.ai.states[1].pressure)
        progress(w,1,3);w.ai.states[1].decisionStep=-1;w.combat.think(c);assertEquals(1,w.ai.states[1].phase)
        progress(w,1,5);w.ai.states[1].decisionStep=-1;w.combat.think(c);assertEquals(2,w.ai.states[1].phase)
        progress(w,1,6);w.ai.states[1].decisionStep=-1;w.combat.think(c);assertEquals(3,w.ai.states[1].phase)
        assertEquals(1.0,w.ai.states[1].pressure)
        c.position=1;w.ai.states[1].decisionStep=-1;w.combat.think(c);assertEquals(AiCatalog.phases[3].leader,w.ai.states[1].pressure)
    }
    @Test fun allWeaknessRulesSelectFromEffectiveStatsAndVisibleDamage() {
        val w=fixture();val c=w.cars[0];val tier=c.carClass!!.tierRank
        for((i,rule) in AiCatalog.weaknesses.withIndex()) {
            for(j in c.effectiveStats.indices)c.effectiveStats[j]=AiCatalog.peerMeans[tier][j]*2
            c.effectiveStats[rule.stat]=0.0
            assertEquals(i,w.ai.weakness(c,1.0),CarCatalog.statNames[rule.stat])
        }
        c.effectiveStats.fill(100.0);assertEquals(AiTactic.RAM_HAMMER,AiCatalog.weaknesses[w.ai.weakness(c,.05)].tactic)
        val s=w.ai.states[1];s.target=0;s.phase=2;s.pressure=1.0;s.targetLane=3.0;s.targetDistance=3.0;s.targetAlong=-3.0
        w.combat.lastTarget[1]=0;s.leaseUntil=w.seconds+2;s.tactic=AiTactic.BRAKE_CHECK
        assertEquals(AiControls["brakeCheckSpeedFraction"],w.ai.speedFraction(w.cars[1]))
        s.tactic=AiTactic.CORNER_BLOCK;s.corner=true
        assertEquals(AiControls["cornerBlockSpeedFraction"],w.ai.speedFraction(w.cars[1]))
        w.cars[1].aiDuelWait=true
        assertEquals(DeathDuel.waitLaneM,w.ai.lane(w.cars[1],DeathDuel.waitLaneM))
        assertEquals(1.0,w.ai.speedFraction(w.cars[1]))
        w.cars[1].aiDuelWait=false
        for(tactic in listOf(AiTactic.RAM_HAMMER,AiTactic.CORNER_PUSH,AiTactic.RAM_MINES)) {
            s.targetAlong=3.0;s.tactic=tactic;s.temperament=s.temperament!!.copy(contact=.4)
            assertTrue(w.ai.lane(w.cars[1],0.0)>0,tactic.name)
        }
        s.corner=false;s.targetDistance=30.0;s.temperament=s.temperament!!.copy(contact=0.0);s.tactic=AiTactic.NONE
        val ordinary=w.ai.lane(w.cars[1],0.0);s.tactic=AiTactic.STRAIGHT_PRESSURE
        assertTrue(w.ai.lane(w.cars[1],0.0)>ordinary)
        val ranged=fixture("Rookie","Flint");pose(ranged,1,-30.0);pose(ranged,0,-20.0)
        val target=ranged.cars[0];target.effectiveStats.fill(100.0);target.effectiveStats[CarCatalog.statNames.indexOf("slots")]=0.0
        ranged.ai.states[1].role=AiRole.BOSS;ranged.combat.think(ranged.cars[1])
        assertEquals(AiTactic.RANGED_PRESSURE,ranged.ai.states[1].tactic)
        assertEquals(Weapons.HAMMER,ranged.cars[1].aiInput.weapon)
    }
    @Test fun bossHealthHasOneAuthorityResetsIdempotentlyAndSettlesInOriginalUnits() {
        for(round in listOf(6,13,20,27,34))for(difficulty in Career.difficulties.indices) {
            val p=Profile("ai-boss-$round");p.careerRound=round;p.careerCleared=round;p.credits=50000;p.rivalProfiles.forEach{it.credits=50000}
            val w=World(combatEnabled=true);Garage.apply(p,w.cars[0]);RivalEconomy.apply(p,w,difficulty);w.reset()
            val c=w.cars.single{it.rivalIndex==Career.bossIndex(round)}
            assertEquals(AiRole.BOSS,w.ai.states[c.id].role)
            assertTrue(c.aiBossHealthScale>1)
            val hp=w.combat.health(c.id);val base=hp/c.aiBossHealthScale
            assertEquals(base,w.combat.settlementHealth(c.id));w.reset();assertEquals(hp,w.combat.health(c.id))
            assertTrue(w.cars.filter{it!==c}.all{it.aiBossHealthScale==1.0})
            CarCatalog.apply(c,c.carClass!!);assertEquals(base,c.maxHp)
        }
    }
    @Test fun everySignatureHasAnArchetypeAppropriatePositiveAndNegativeDecision() {
        for(type in CarCatalog.all) {
            val w=fixture("Rookie",type.id);val c=w.cars[1];pose(w,1,-30.0);c.vx=16.0
            when(type.ability.kind) {
                AbilityKind.CHARGE,AbilityKind.LANCE,AbilityKind.HARPOON,AbilityKind.SPIKES->pose(w,0,-20.0)
                AbilityKind.PATCH,AbilityKind.GUARD->pose(w,0,-40.0)
                AbilityKind.GRIP->{pose(w,1,55.0);c.surface=Surfaces.offtrack}
                else->Unit
            }
            w.abilities.think(c);assertEquals(1.0,c.aiInput.ability,type.id)
            c.ability.cooldownSeconds=1.0;w.abilities.think(c);assertEquals(0.0,c.aiInput.ability,type.id)
        }
    }
    @Test fun fullStrategyReplaysAndAllocatesZeroBytesWhileActuallyMakingDecisions() {
        fun make()=World(913,track=Track(course=Courses.all[0]),combatEnabled=true).also{w->
            for(c in w.cars){CarCatalog.apply(c,c.id%5);c.aiSkill=AiSkills.all.single{it.id=="Champion"}}
            w.aiBossRival=0;w.cars[1].rivalIndex=0;w.cars[1].aiStyle=Career.rivals.first{it.id=="rook"};w.reset()
        }
        val a=make();val b=make();repeat(2500){a.step(inputs);b.step(inputs)}
        assertEquals(a.stateHash(),b.stateHash());assertTrue(a.ai.traceCount>100);assertTrue(a.ai.maximumAttackers<=2)
        val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean;bean.isThreadAllocatedMemoryEnabled=true
        val id=Thread.currentThread().id
        fun prepare() { a.reset();for(c in a.cars)progress(a,c.id,a.raceLaps) }
        repeat(30){prepare();repeat(600){a.step(inputs)}}
        var bytes=0L;var decisions=0;var hunts=0;var weaknesses=0
        repeat(10){prepare();val before=bean.getThreadAllocatedBytes(id);repeat(600){a.step(inputs)};bytes+=bean.getThreadAllocatedBytes(id)-before;decisions+=a.ai.traceCount;hunts+=a.ai.huntDecisions
            for(n in 0 until minOf(a.ai.traceCount,a.ai.traceCapacity))if(a.ai.trace[n*AiBehaviour.TRACE_STRIDE+11]>=0)weaknesses++
        }
        assertTrue(decisions>1000);assertTrue(hunts>0);assertTrue(weaknesses>0);assertEquals(0L,bytes)
    }
}
