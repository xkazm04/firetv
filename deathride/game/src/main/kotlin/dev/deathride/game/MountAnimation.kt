package dev.deathride.game

import dev.deathride.core.*
import kotlin.math.PI

/**
 * Where fire events come from. Monotonic counters, so a renderer that skips frames never loses a shot and a reset cannot replay one.
 * Today's implementation [CombatDerivedFireSource] reads the existing combat state; WPN-A's additive snapshot fields (burst bullets
 * remaining, cooldown fraction, overheat fraction, per-weapon fire counter) replace it by implementing this one interface.
 */
interface WeaponFireSource {
    /** Once per rendered frame, before the counters are read. */
    fun update(world: World)
    /** Shots fired by [slot] with [weapon] ([Weapons] index) so far. */
    fun fireCount(slot: Int,weapon: Int): Int
    /** Contact hits landed by [slot]'s spikes so far. */
    fun spikeHitCount(slot: Int): Int
}

/** Fire events from what combat already exposes: a magazine count that drops or a cooldown that jumps up is a shot. */
class CombatDerivedFireSource: WeaponFireSource {
    private val weapons=Weapons.all.size
    private val fired=IntArray(Tuning.CAR_COUNT*weapons)
    private val lastAmmo=IntArray(fired.size){-1}
    private val lastCooldown=DoubleArray(fired.size)
    private val spikeHits=IntArray(Tuning.CAR_COUNT)
    private val lastFlash=DoubleArray(Tuning.CAR_COUNT)
    override fun update(world: World) {
        val combat=world.combat;val cars=world.cars
        for(c in cars) {
            val id=c.id;if(id>=Tuning.CAR_COUNT || !c.entered)continue
            for(w in 0 until weapons) {
                val n=id*weapons+w;val ammo=combat.ammo(id,w);val cooldown=combat.cooldown(id,w)
                if(lastAmmo[n]>=0 && (ammo<lastAmmo[n] || cooldown>lastCooldown[n]+1e-6))fired[n]++
                lastAmmo[n]=ammo;lastCooldown[n]=cooldown
            }
        }
        // Contact spikes: a car that carries them and touches a car whose damage flash just started.
        for(i in cars.indices) {
            val a=cars[i];if(!a.entered || i>=Tuning.CAR_COUNT)continue
            for(j in cars.indices) {
                if(j==i)continue
                val b=cars[j];if(!b.entered || j>=Tuning.CAR_COUNT)continue
                if(a.utilityMask and 1!=0 && combat.damageFlashSeconds[j]>lastFlash[j]+1e-6) {
                    val dx=b.x-a.x;val dy=b.y-a.y;val reach=(a.spec.circleOffsetM+a.spec.circleRadiusM+b.spec.circleOffsetM+b.spec.circleRadiusM)+1.0
                    if(dx*dx+dy*dy<reach*reach)spikeHits[i]++
                }
            }
        }
        for(j in cars.indices)if(j<Tuning.CAR_COUNT)lastFlash[j]=combat.damageFlashSeconds[j]
    }
    override fun fireCount(slot: Int,weapon: Int)=fired[slot*weapons+weapon]
    override fun spikeHitCount(slot: Int)=spikeHits[slot]
}

/**
 * Pure animation curves, all in seconds since the event. 0 means "just fired"; values outside the window are 0.
 * Kept free of GL so timing is unit-tested.
 */
object MountAnim {
    const val IDLE=99f
    /** Whole animation length per kind (recoil / pop / extend). */
    fun duration(kind: MountKind)=when(kind){MountKind.RIVET->.09f;MountKind.HAMMER->.30f;MountKind.SCATTER->.20f;MountKind.MINE->.24f;MountKind.SPIKES->.32f;MountKind.ARMOR->0f}
    /** Muzzle flash length; mine and armour have no flash. */
    fun flashDuration(kind: MountKind)=when(kind){MountKind.RIVET->.055f;MountKind.HAMMER->.13f;MountKind.SCATTER->.09f;MountKind.SPIKES->.12f;else->0f}
    /** Kick-back (or extension for spikes, lift for a mine): jumps to 55% at once so the first frame already moves, peaks at 20% of the window, eases to 0. */
    fun kick(kind: MountKind,age: Float): Float {
        val d=duration(kind);if(age<0f || age>=d || d<=0f)return 0f
        val u=age/d
        if(u<.2f)return .55f+.45f*(u/.2f)
        val v=(u-.2f)/.8f;return 1f-v*v*(3f-2f*v)
    }
    fun flash(kind: MountKind,age: Float): Float {
        val d=flashDuration(kind);if(age<0f || age>=d || d<=0f)return 0f
        return 1f-age/d
    }
    /** Brass casing flight 0..1 for the machine gun; -1 when none is in the air. */
    const val EJECT_SECONDS=.20f
    fun eject(age: Float)=if(age<0f || age>=EJECT_SECONDS)-1f else age/EJECT_SECONDS
    /** The barrel keeps spinning for this long after the last round. */
    const val SPIN_SECONDS=.35f
    const val SPIN_RAD_PER_SECOND=38f
    fun spinning(age: Float)=age in 0f..SPIN_SECONDS
    /** Mine drop: a disc leaves the tray, rising then fading; progress 0..1, -1 when idle. */
    fun pop(age: Float): Float { val d=duration(MountKind.MINE);return if(age<0f || age>=d)-1f else age/d }
}

/** Per-slot, per-kind seconds since the last event, plus the barrel spin phase. Preallocated; nothing here allocates per frame. */
class MountAnimator(private val slots: Int=Tuning.CAR_COUNT) {
    private val kinds=MountKind.all.size
    private val age=FloatArray(slots*kinds){MountAnim.IDLE}
    private val seen=IntArray(slots*kinds)
    private val spin=FloatArray(slots)
    private var primed=false
    fun reset() { age.fill(MountAnim.IDLE);seen.fill(0);spin.fill(0f);primed=false }
    fun age(slot: Int,kind: MountKind)=age[slot*kinds+kind.ordinal]
    fun spin(slot: Int)=spin[slot]
    /** Start an animation by hand (tests, previews). */
    fun trigger(slot: Int,kind: MountKind){age[slot*kinds+kind.ordinal]=0f}
    /** Pin an animation at a given age (previews and strips). */
    fun set(slot: Int,kind: MountKind,seconds: Float){age[slot*kinds+kind.ordinal]=seconds}
    fun advance(dt: Float) {
        if(!(dt>0f))return
        for(i in age.indices)if(age[i]<MountAnim.IDLE)age[i]=if(age[i]+dt>=MountAnim.IDLE)MountAnim.IDLE else age[i]+dt
        for(s in 0 until slots)if(MountAnim.spinning(age[s*kinds+MountKind.RIVET.ordinal]))spin[s]=(spin[s]+MountAnim.SPIN_RAD_PER_SECOND*dt)%(2f*PI.toFloat())
    }
    /** Read the source and age everything by [dt]. The first call only absorbs counters, so a race that begins mid-count shows no phantom volley. */
    fun update(source: WeaponFireSource,dt: Float) {
        advance(dt)
        for(s in 0 until slots)for(k in MountKind.all) {
            val n=if(k==MountKind.SPIKES)source.spikeHitCount(s) else if(k.weapon>=0)source.fireCount(s,k.weapon) else continue
            val i=s*kinds+k.ordinal
            if(primed && n>seen[i])age[i]=0f
            seen[i]=n
        }
        primed=true
    }
}
