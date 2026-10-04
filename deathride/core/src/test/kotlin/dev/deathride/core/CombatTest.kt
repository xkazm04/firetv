package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import kotlin.math.*

class CombatTest {
    private val neutral=Array(Tuning.CAR_COUNT){InputFrame()}
    @Test fun startProtectionIsVisibleAndDoesNotSpendAmmunition() {
        val w=World(combatEnabled=true)
        assertEquals(CombatRules["startProtectionSeconds"],w.combat.armingSeconds)
        assertFalse(w.combat.fire(0,Weapons.RIVET))
        w.combat.damage(0,10000.0,1,DamageKind.MINE)
        assertEquals(CombatRules["maxHp"],w.combat.health(0));assertEquals(w.combat.capacity(0,0),w.combat.ammo(0,0))
    }
    private fun arena(): World {
        val w=World(track=Track(1000.0,200.0,100.0),combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true}
        w.reset()
        repeat(ceil(CombatRules["startProtectionSeconds"]/Tuning.STEP_SECONDS).toInt()+1){w.step(neutral)}
        w.combat.reset()
        for(c in w.cars){c.x=-350+c.id*100.0;c.y=200.0;c.heading=0.0}
        return w
    }
    @Test fun armorHasOneAuthorityAndWreckRejectsEveryAction() {
        val w=arena();val c=w.cars[0];CarCatalog.apply(c,2);val combat=w.combat
        combat.damage(0,25.0,1,DamageKind.HAMMER)
        assertEquals(CombatRules["maxHp"]-25*(1-c.armorReduction),combat.health(0),1e-9)
        combat.damage(0,10000.0,1,DamageKind.HAMMER)
        val events=combat.damageEvents[0];assertEquals(LifeState.WRECKED,combat.state(0));assertEquals(1,combat.kills[1])
        assertFalse(combat.fire(0,0));assertFalse(combat.fire(0,1));assertFalse(combat.fire(0,2))
        combat.damage(0,10000.0,1,DamageKind.RIVET);assertEquals(events,combat.damageEvents[0])
        val pickup=combat.pickups.first { it.type.id=="repair" };c.x=pickup.x;c.y=pickup.y
        val progress=c.lap.progressM;val input=Array(6){InputFrame(1.0,1.0).apply{fire=1.0;mine=1.0}}
        repeat(120){w.step(input)}
        assertEquals(0.0,combat.health(0));assertEquals(progress,c.lap.progressM);assertEquals(0.0,c.filteredThrottle)
    }
    @Test fun rayAndSweptProjectileNeverHitShooterAndUseAmmoCooldown() {
        val w=arena();val c=w.combat;w.cars[0].x=0.0;w.cars[1].x=16.0
        val before=c.health(1)
        assertTrue(c.fire(0,Weapons.RIVET));assertFalse(c.fire(0,Weapons.RIVET))
        assertEquals(before-Weapons.all[0].damage*(1-w.cars[1].armorReduction),c.health(1),1e-9)
        assertEquals(c.capacity(0,0)-1,c.ammo(0,0));assertEquals(CombatRules["maxHp"],c.health(0))
        assertTrue(c.fire(0,Weapons.HAMMER));repeat(30){c.step(neutral,Tuning.STEP_SECONDS)}
        assertEquals(before-(Weapons.all[0].damage+Weapons.all[1].damage)*(1-w.cars[1].armorReduction),c.health(1),1e-9)
        assertTrue(c.projectiles.none { it.active });assertEquals(CombatRules["maxHp"],c.health(0))
    }
    @Test fun mineArmsThenHitsEachCarOnceIncludingOwnerAndPoolReuseIsClean() {
        val w=arena();val c=w.combat;val weapon=Weapons.all[Weapons.MINE]
        assertTrue(weapon.armingSeconds>CombatRules["perceptionAllowanceSeconds"]+weapon.radiusM/CombatRules["telegraphReferenceSpeedMps"])
        assertTrue(c.fire(0,Weapons.MINE));val m=c.mines.first { it.active }
        w.cars[0].x=m.x;w.cars[0].y=m.y;w.cars[1].x=m.x;w.cars[1].y=m.y
        repeat((weapon.armingSeconds/Tuning.STEP_SECONDS).toInt()-2){c.step(neutral,Tuning.STEP_SECONDS)}
        assertEquals(CombatRules["maxHp"],c.health(0));assertEquals(CombatRules["maxHp"],c.health(1));assertTrue(m.active)
        repeat(5){c.step(neutral,Tuning.STEP_SECONDS)}
        val hp=c.health(1);assertTrue(hp<CombatRules["maxHp"]);assertEquals(hp,c.health(0));assertFalse(m.active)
        val blast=c.blasts.first{it.remainingSeconds>0};assertEquals(3,blast.hitMask and 3)
        repeat(30){c.step(neutral,Tuning.STEP_SECONDS)};assertEquals(hp,c.health(1));assertEquals(1,c.damageEvents[1])
        c.reset();assertTrue(c.fire(0,Weapons.MINE));assertEquals(0.0,c.mines.first { it.active }.ageSeconds)
        assertTrue(c.blasts.all { it.hitMask==0 && it.remainingSeconds==0.0 })
    }
    @Test fun smallMineTriggersOnlyAtItsDamageBoundaryAndAiUsesThatRadius() {
        val w=arena();val combat=w.combat;val weapon=Weapons.all[Weapons.MINE]
        assertEquals(.5,weapon.radiusM);assertEquals(.5,combat.mineTriggerRadiusM)
        assertTrue(combat.fire(0,Weapons.MINE));val mine=combat.mines.first { it.active }
        val target=w.cars[1];val full=combat.health(1)
        target.x=mine.x;target.y=mine.y+target.spec.circleRadiusM+.75
        repeat(ceil(weapon.armingSeconds/Tuning.STEP_SECONDS).toInt()+1){combat.step(neutral,Tuning.STEP_SECONDS)}
        assertTrue(mine.active,"The former 1.6 m trigger must not spend a mine outside its 0.5 m blast")
        assertEquals(full,combat.health(1))
        target.x=mine.x-10;target.y=mine.y
        val projection=Projection();w.track.project(mine.x,mine.y,projection)
        val lane=projection.distance
        assertEquals(lane-(weapon.radiusM+target.spec.circleRadiusM+CombatRules["aiMineAvoidMarginM"]),combat.avoidMine(target,projection.s,lane),1e-9)
        target.x=mine.x;target.y=mine.y+target.spec.circleRadiusM+.49
        combat.step(neutral,Tuning.STEP_SECONDS)
        assertFalse(mine.active);assertEquals(full-weapon.damage*(1-target.armorReduction),combat.health(1),1e-9)
        assertEquals(.5,combat.blasts.first { it.remainingSeconds>0 }.radiusM)
        repeat(30){combat.step(neutral,Tuning.STEP_SECONDS)}
        assertEquals(1,combat.damageEvents[1]);assertEquals(0,combat.oneShotKills)
    }
    @Test fun pickupsRespectCapsRespawnAndUnavailableMounts() {
        val w=arena();val c=w.combat;CarCatalog.apply(w.cars[0],0);c.reset()
        assertEquals(0,c.ammo(0,Weapons.HAMMER));assertFalse(c.fire(0,Weapons.HAMMER))
        c.damage(0,30.0,-1,DamageKind.WALL)
        val p=c.pickups.first { it.type.id=="repair" };w.cars[0].x=p.x;w.cars[0].y=p.y
        val before=c.health(0);c.step(neutral,Tuning.STEP_SECONDS)
        assertEquals(min(CombatRules["maxHp"],before+p.type.amount),c.health(0));assertEquals(p.type.respawnSeconds,p.cooldownSeconds)
        val repaired=c.health(0);repeat(10){c.step(neutral,Tuning.STEP_SECONDS)};assertEquals(repaired,c.health(0))
        val ammo=c.pickups.first { it.type.id=="ammo" };assertTrue(c.fire(0,0));w.cars[0].x=ammo.x;w.cars[0].y=ammo.y
        c.step(neutral,Tuning.STEP_SECONDS);assertEquals(c.capacity(0,0),c.ammo(0,0));assertEquals(0,c.ammo(0,1))
    }
    @Test fun ramsDeduplicatePerPairAndLastSurvivorWins() {
        val w=arena();val c=w.combat
        w.ramClosingMps[1]=10.0;c.step(neutral,Tuning.STEP_SECONDS);val hp=c.health(0)
        repeat(10){c.step(neutral,Tuning.STEP_SECONDS)};assertEquals(hp,c.health(0))
        for(id in 1..5)c.damage(id,10000.0,0,DamageKind.HAMMER)
        w.ramClosingMps.fill(0.0);w.step(neutral)
        assertEquals(FinishKind.ELIMINATION,w.cars[0].finishKind);assertEquals(1,w.cars[0].position);assertEquals(6,w.resolved)
    }
    @Test fun staleAndReconnectClearAllAttackHolds() {
        val box=InputMailbox();val out=InputFrame()
        assertTrue(box.offer(0,0.0,0.0,.4,1.0,0.0,1.0,1.0,1.0,1))
        box.consume(10.0,out);assertEquals(1.0,out.fire);assertEquals(1.0,out.mine);assertEquals(1,out.weapon)
        box.consume(300.0,out);assertEquals(0.0,out.fire);assertEquals(0.0,out.mine)
        box.newConnection();box.consume(20.0,out);assertEquals(0.0,out.fire);assertEquals(0.0,out.mine)
        assertFalse(box.offer(1,20.0,20.0,0.0,0.0,0.0,fire=Double.NaN))
    }
    @Test fun seededCombatResolvesAllCoursesAndReplayMatches() {
        val report=StringBuilder("track,seed,seconds,finished,wrecks,shots,kills,oneShots,rivetKills,hammerKills,mineKills,ramKills,wallKills,firstWreckSeconds,hash\n")
        // Preserve the legacy mixed-tier 180 s regression; owner courses use their actual tier/profile in candidate proof.
        for(course in Courses.all.filter{it.raceProfile==null})repeat(4) { seed ->
            fun world()=World(seed,track=Track(course=course),combatEnabled=true).also { w->for(c in w.cars)CarCatalog.apply(c,c.id%5);w.reset() }
            val a=world();val b=world()
            while(a.resolved<6 && a.seconds<TrackRules["maxRaceSeconds"]) { a.step(neutral);b.step(neutral) }
            assertEquals(a.stateHash(),b.stateHash());assertEquals(6,a.resolved,"${course.id} seed=$seed")
            assertTrue(a.combat.shots.sum()>0);assertEquals(0,a.combat.oneShotKills)
            report.append("${course.id},$seed,${a.seconds},${a.finished},${a.combat.wreckCount},${a.combat.shots.sum()},${a.combat.kills.sum()},${a.combat.oneShotKills},${a.combat.deaths.joinToString(",")},${a.combat.wreckSeconds.filter { it>=0 }.minOrNull()?:-1.0},${a.stateHash()}\n")
        }
        File("build/reports/balance/w4-combat.csv").apply{parentFile.mkdirs();writeText(report.toString())}
    }
    @Test fun activeCombatAllocatesNothingAcrossRepeatedLiveStarts() {
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val w=World(track=Track(course=Courses.all[4]),combatEnabled=true)
        for(c in w.cars)CarCatalog.apply(c,c.id%5)
        repeat(60000){if(it%600==0)w.reset();w.step(neutral)}
        val id=Thread.currentThread().id;var allocated=0L;var shots=0
        repeat(20) {
            w.reset();val before=bean.getThreadAllocatedBytes(id)
            repeat(500){w.step(neutral)}
            allocated+=bean.getThreadAllocatedBytes(id)-before;shots+=w.combat.shots.sum()
        }
        assertTrue(shots>100,"Allocation audit must actually emit weapons")
        assertEquals(0L,allocated,"10,000 live combat steps; reset is explicitly outside the measured interval")
    }
}
