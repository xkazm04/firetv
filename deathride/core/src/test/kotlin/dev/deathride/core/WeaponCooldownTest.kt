package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.ceil

/** Burst, cooldown and heat rules of weapons.csv; AI cars use the same Combat so they are held to the same rules. */
class WeaponCooldownTest {
    private val dt=Tuning.STEP_SECONDS
    private val rivet=Weapons.all[Weapons.RIVET];private val scatter=Weapons.all[Weapons.SCATTER]
    private fun arena(gap: Double=16.0): World {
        val w=World(track=Track(1000.0,200.0,100.0),combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,2);c.human=true}
        w.reset()
        val idle=Array(Tuning.CAR_COUNT){InputFrame()}
        repeat(ceil(CombatRules.startProtectionSeconds/dt).toInt()+1){w.step(idle)}
        w.combat.reset()
        for(c in w.cars){c.x=-350+c.id*100.0;c.y=200.0;c.heading=0.0}
        w.cars[1].x=w.cars[0].x+gap
        return w
    }
    private fun hold(weapon: Int,fire: Double=1.0)=Array(Tuning.CAR_COUNT){InputFrame()}.also{it[0].fire=fire;it[0].weapon=weapon}
    private fun tick(w: World,input: Array<InputFrame>,seconds: Double){repeat(ceil(seconds/dt).toInt()){w.combat.step(input,dt)}}

    @Test fun oneClickFiresAWholeBurstAndThenCoolsDownEvenWhenReleased() {
        val w=arena();val c=w.combat
        assertTrue(c.fire(0,Weapons.RIVET))
        assertEquals(rivet.burstRounds-1,c.burstRemaining(0,Weapons.RIVET))
        assertFalse(c.fire(0,Weapons.RIVET),"a burst in flight cannot be restarted")
        val released=hold(Weapons.RIVET,0.0)
        tick(w,released,rivet.burstIntervalSeconds*rivet.burstRounds+0.05)
        assertEquals(rivet.burstRounds,c.fireCount(0,Weapons.RIVET));assertEquals(0,c.burstRemaining(0,Weapons.RIVET))
        assertEquals(c.capacity(0,0)-rivet.burstRounds,c.ammo(0,0),"ammo counts bullets")
        assertTrue(c.cooldown(0,Weapons.RIVET)>0.8 && c.cooldownFraction(0,Weapons.RIVET)>0.6)
        assertFalse(c.fire(0,Weapons.RIVET),"weapon cooldown follows the last bullet")
        tick(w,released,rivet.cooldownSeconds)
        assertEquals(0.0,c.cooldownFraction(0,Weapons.RIVET));assertTrue(c.fire(0,Weapons.RIVET))
    }
    @Test fun heldFireRepeatsBurstsAtTheCooldownRateNeverAStream() {
        val w=arena();val c=w.combat;val input=hold(Weapons.RIVET)
        tick(w,input,3.0*rivet.cycleSeconds-0.05)
        assertEquals(3*rivet.burstRounds,c.fireCount(0,Weapons.RIVET))
        // Bullets only exist inside bursts: between a burst's last bullet and the next first bullet at least the weapon cooldown passes.
        val w2=arena();val times=ArrayList<Double>();var seen=0
        repeat(((4*rivet.cycleSeconds)/dt).toInt()){w2.combat.step(input,dt);val n=w2.combat.fireCount(0,Weapons.RIVET);while(seen<n){times.add(it*dt);seen++}}
        for(i in 1 until times.size){val gap=times[i]-times[i-1];assertTrue(gap<=rivet.burstIntervalSeconds+2*dt || gap>=rivet.cooldownSeconds-2*dt,"gap $gap")}
    }
    @Test fun burstIsTruncatedByRemainingAmmunitionAndCancelledByWreck() {
        val w=arena();val c=w.combat;c.setAmmo(0,Weapons.RIVET,2)
        assertTrue(c.fire(0,Weapons.RIVET));tick(w,hold(Weapons.RIVET,0.0),1.0)
        assertEquals(2,c.fireCount(0,Weapons.RIVET));assertEquals(0,c.ammo(0,Weapons.RIVET));assertEquals(0,c.burstRemaining(0,Weapons.RIVET))
        val w2=arena();assertTrue(w2.combat.fire(0,Weapons.RIVET));assertTrue(w2.combat.burstRemaining(0,Weapons.RIVET)>0)
        w2.combat.damage(0,10000.0,1,DamageKind.RIVET)
        assertEquals(0,w2.combat.burstRemaining(0,Weapons.RIVET));tick(w2,hold(Weapons.RIVET,0.0),1.0);assertEquals(1,w2.combat.fireCount(0,Weapons.RIVET))
    }
    @Test fun sustainedFireOverheatsLocksOutAndRecoversBelowTheResumeLevel() {
        val w=arena();val c=w.combat;val input=hold(Weapons.RIVET)
        var locked=false;var peak=0.0;var lockStart=0.0;var lockEnd=-1.0;var t=0.0
        for(i in 0 until (40.0/dt).toInt()){
            c.step(input,dt);t+=dt;peak=maxOf(peak,c.heatFraction(0,Weapons.RIVET))
            if(!locked && c.overheated(0,Weapons.RIVET)){locked=true;lockStart=t;assertFalse(c.fire(0,Weapons.RIVET));assertEquals(1.0,c.heatFraction(0,Weapons.RIVET),1e-9)}
            if(locked && lockEnd<0 && !c.overheated(0,Weapons.RIVET)){lockEnd=t}
        }
        assertTrue(locked,"held FIRE must reach an overheat lockout");assertTrue(lockEnd>lockStart);assertTrue(peak<=1.0+1e-9)
        val expected=(1.0-rivet.overheatResumeFraction)/rivet.overheatCoolPerSecond
        assertEquals(expected,lockEnd-lockStart,0.35,"lockout length follows overheatCoolPerSecond")
        assertTrue(lockStart>3*rivet.cycleSeconds,"not an instant lockout")
    }
    @Test fun scatterOverheatsToo_hammerAndMineOnlyUseTheirCooldown() {
        val w=arena(8.0);val c=w.combat;val input=hold(Weapons.SCATTER)
        var locked=false;repeat((12.0/dt).toInt()){c.step(input,dt);if(c.overheated(0,Weapons.SCATTER))locked=true}
        assertTrue(locked,"held Scatter fire overheats before its 12 rounds are gone")
        assertFalse(Weapons.all[Weapons.HAMMER].overheats);assertFalse(Weapons.all[Weapons.MINE].overheats)
        assertEquals(0.0,c.heatFraction(0,Weapons.HAMMER))
    }
    @Test fun swappingKeepsEachWeaponsOwnCooldownAndHeat() {
        val w=arena(10.0);val c=w.combat
        assertTrue(c.fire(0,Weapons.RIVET));tick(w,hold(Weapons.RIVET,0.0),0.5)
        val rivetCd=c.cooldown(0,Weapons.RIVET);assertTrue(rivetCd>0)
        assertTrue(c.fire(0,Weapons.SCATTER),"another weapon is ready while Rivet cools")
        tick(w,hold(Weapons.RIVET,0.0),0.3)
        assertEquals(rivetCd-0.3,c.cooldown(0,Weapons.RIVET),2*dt,"Rivet cooldown kept counting regardless of selection")
        assertTrue(c.cooldown(0,Weapons.SCATTER)>0.5);assertTrue(c.heatFraction(0,Weapons.SCATTER)>0.0)
        assertFalse(c.fire(0,Weapons.RIVET))
    }
    @Test fun fireCounterIsMonotonicAndSnapshotExposesWeaponState() {
        val w=arena();val c=w.combat;val input=hold(Weapons.RIVET);var last=0
        for(i in 0 until (6.0/dt).toInt()){c.step(input,dt);val n=c.fireCount(0,Weapons.RIVET);assertTrue(n>=last);last=n}
        assertEquals(c.shots[Weapons.RIVET],last)
        w.step(Array(Tuning.CAR_COUNT){InputFrame()})
        val s=w.snapshot
        assertEquals(c.fireCount(0,Weapons.RIVET),s.weaponFireCount(0,Weapons.RIVET))
        assertEquals(c.heatFraction(0,Weapons.RIVET),s.weaponHeat(0,Weapons.RIVET),1e-12)
        assertEquals(c.overheated(0,Weapons.RIVET),s.weaponOverheated(0,Weapons.RIVET))
        assertEquals(c.cooldownFraction(0,Weapons.RIVET),s.weaponCooldownFraction(0,Weapons.RIVET),1e-12)
        assertEquals(c.burstRemaining(0,Weapons.RIVET),s.weaponBurstRemaining(0,Weapons.RIVET))
        assertEquals(0,s.weaponFireCount(1,Weapons.RIVET))
    }
    @Test fun aiCarsFollowTheSameBurstRulesAndStillFight() {
        val idle=Array(Tuning.CAR_COUNT){InputFrame()};var rivetShots=0;var damage=0.0;var wrecks=0
        for(seed in 0 until 12) {
            val w=BalanceScenarios.all.first().world(seed)
            val lastCount=IntArray(Tuning.CAR_COUNT);val lastTime=DoubleArray(Tuning.CAR_COUNT){-99.0};val bursts=IntArray(Tuning.CAR_COUNT)
            while(w.resolved<Tuning.CAR_COUNT && w.seconds<TrackRules["maxRaceSeconds"]) {
                w.step(idle)
                for(c in w.cars){
                    val n=w.combat.fireCount(c.id,Weapons.RIVET)
                    if(n>lastCount[c.id]){
                        val gap=w.seconds-lastTime[c.id]
                        assertTrue(gap<=rivet.burstIntervalSeconds+3*dt || gap>=rivet.cooldownSeconds-3*dt,"AI Rivet gap $gap")
                        lastCount[c.id]=n;lastTime[c.id]=w.seconds
                    }
                    assertTrue(w.combat.heatFraction(c.id,Weapons.RIVET)<=1.0+1e-9)
                    if(w.combat.overheated(c.id,Weapons.RIVET))assertEquals(0,w.combat.burstRemaining(c.id,Weapons.SCATTER))
                }
            }
            rivetShots+=w.combat.shots[Weapons.RIVET];damage+=w.combat.damageByKind[DamageKind.RIVET.ordinal];wrecks+=w.combat.wreckCount
            assertEquals(0,w.combat.oneShotKills)
        }
        assertTrue(rivetShots>200,"AI uses Rivet: $rivetShots bullets");assertTrue(damage>30.0,"AI Rivet bullets land: $damage");assertTrue(wrecks>=6,"AI fights to wrecks: $wrecks")
    }
    @Test fun burstAndHeatStateIsPartOfTheDeterministicHash() {
        val a=arena();val b=arena();val input=hold(Weapons.RIVET)
        tick(a,input,0.4);tick(b,input,0.4)
        assertEquals(a.combat.appendHash(0),b.combat.appendHash(0))
        tick(b,input,0.1);assertNotEquals(a.combat.appendHash(0),b.combat.appendHash(0))
    }
}
