package dev.deathride.game

import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class MountCatalogTest {
    @Test fun everyClassAndEveryKindHasAnAttachmentOrAnExplicitNone() {
        for(c in CarCatalog.all)for(k in MountKind.all) {
            assertTrue(MountCatalog.declared(c.id,k),"${c.id} ${k.csv} is neither mounted nor an explicit none")
            assertFalse(MountCatalog.attachments(c.id,k).isNotEmpty() && MountCatalog.explicitNone(c.id,k),"${c.id} ${k.csv} is both")
        }
        assertEquals(CarCatalog.all.map{it.id}.sorted(),MountCatalog.classes)
    }
    @Test fun everyShippedWeaponIsMountedOnEveryClass() {
        for(c in CarCatalog.all)for(w in Weapons.all) {
            val k=MountKind.all.single{it.weapon>=0 && Weapons.all[it.weapon]===w}
            assertTrue(MountCatalog.attachments(c.id,k).isNotEmpty(),"${c.id} has no ${w.id} mount")
        }
    }
    @Test fun noMountSpritePointsAtUnapprovedArt() {
        // No owner-approved mount art exists; a sprite column entry would have to be approved at runtime, and none is declared today.
        for(c in CarCatalog.all)for(a in MountCatalog.layered(c.id))assertEquals("",a.sprite,"${c.id} ${a.kind} names a sprite")
    }
    @Test fun layersAreSortedAndMountsStayOnTheBody() {
        for(c in CarCatalog.all) {
            val l=MountCatalog.layered(c.id);assertTrue(l.isNotEmpty())
            for(i in 1 until l.size)assertTrue(l[i-1].layer<=l[i].layer)
            for(a in l){assertTrue(Math.abs(a.x)<=.5f && Math.abs(a.y)<=.55f,"${c.id} ${a.kind} off the body");assertTrue(a.scale in 0.05f..0.25f)}
        }
    }
    @Test fun twinGunsAreMirrored() {
        for(c in CarCatalog.all) {
            val r=MountCatalog.attachments(c.id,MountKind.RIVET);assertEquals(2,r.size)
            assertEquals(r[0].x,r[1].x);assertEquals(r[0].y,-r[1].y)
        }
    }
}

class MountAnimTest {
    @Test fun kickJumpsPeaksAndReturnsWithinTheWindow() {
        for(k in arrayOf(MountKind.RIVET,MountKind.HAMMER,MountKind.SCATTER,MountKind.MINE,MountKind.SPIKES)) {
            val d=MountAnim.duration(k);assertTrue(d in .05f..1f)
            assertTrue(MountAnim.kick(k,0f)>=.55f,"$k moves on the very first frame")
            assertEquals(1f,MountAnim.kick(k,d*.2f),1e-4f)
            var last=1f;var t=d*.2f
            while(t<d){val v=MountAnim.kick(k,t);assertTrue(v<=last+1e-5f);last=v;t+=d/50}
            assertEquals(0f,MountAnim.kick(k,d),0f);assertEquals(0f,MountAnim.kick(k,-1f));assertEquals(0f,MountAnim.kick(k,MountAnim.IDLE))
        }
        assertEquals(0f,MountAnim.kick(MountKind.ARMOR,0f))
    }
    @Test fun recoilFitsInAFewFramesAtSixtyHertz() {
        val frame=1f/60f
        assertTrue(MountAnim.duration(MountKind.RIVET)<=6*frame,"a rivet kick must clear before the next shot at 5 Hz")
        assertTrue(MountAnim.duration(MountKind.RIVET)<Weapons.all[Weapons.RIVET].cooldownSeconds.toFloat())
        assertTrue(MountAnim.duration(MountKind.HAMMER)<Weapons.all[Weapons.HAMMER].cooldownSeconds.toFloat())
    }
    @Test fun flashDecaysLinearlyAndEndsBeforeTheKick() {
        for(k in arrayOf(MountKind.RIVET,MountKind.HAMMER,MountKind.SCATTER,MountKind.SPIKES)) {
            val f=MountAnim.flashDuration(k);assertTrue(f in .03f..MountAnim.duration(k))
            assertEquals(1f,MountAnim.flash(k,0f));assertEquals(.5f,MountAnim.flash(k,f*.5f),1e-5f);assertEquals(0f,MountAnim.flash(k,f))
        }
        assertEquals(0f,MountAnim.flash(MountKind.MINE,0f))
    }
    @Test fun ejectAndPopAndSpinWindows() {
        assertEquals(0f,MountAnim.eject(0f));assertEquals(-1f,MountAnim.eject(MountAnim.EJECT_SECONDS));assertEquals(-1f,MountAnim.eject(MountAnim.IDLE))
        assertEquals(0f,MountAnim.pop(0f));assertEquals(-1f,MountAnim.pop(MountAnim.duration(MountKind.MINE)))
        assertTrue(MountAnim.spinning(.1f));assertFalse(MountAnim.spinning(1f));assertFalse(MountAnim.spinning(MountAnim.IDLE))
    }

    private class Fake: WeaponFireSource {
        val fired=IntArray(Tuning.CAR_COUNT*Weapons.all.size);val hits=IntArray(Tuning.CAR_COUNT)
        override fun update(world: World){}
        override fun fireCount(slot: Int,weapon: Int)=fired[slot*Weapons.all.size+weapon]
        override fun spikeHitCount(slot: Int)=hits[slot]
    }
    @Test fun animatorStartsOnAnIncrementAgesAndNeverReplaysOldCounts() {
        val src=Fake();src.fired[Weapons.HAMMER]=7;val a=MountAnimator()
        a.update(src,1f/60);assertEquals(MountAnim.IDLE,a.age(0,MountKind.HAMMER),"counts already present at the first frame are not a volley")
        src.fired[Weapons.HAMMER]=8;a.update(src,1f/60);assertEquals(0f,a.age(0,MountKind.HAMMER))
        a.update(src,.05f);assertEquals(.05f,a.age(0,MountKind.HAMMER),1e-6f);assertEquals(MountAnim.IDLE,a.age(0,MountKind.RIVET))
        for(i in 0..30)a.update(src,.05f);assertEquals(0f,MountAnim.kick(MountKind.HAMMER,a.age(0,MountKind.HAMMER)),"a finished animation draws nothing")
        src.hits[2]=1;a.update(src,1f/60);assertEquals(0f,a.age(2,MountKind.SPIKES))
    }
    @Test fun rivetBurstKeepsTheBarrelSpinningAndStopsAfterwards() {
        val src=Fake();val a=MountAnimator();a.update(src,.016f)
        src.fired[Weapons.RIVET]=1;a.update(src,.016f);val s0=a.spin(0)
        for(i in 0 until 5){src.fired[Weapons.RIVET]++;a.update(src,.016f)}
        assertTrue(a.spin(0)!=s0)
        for(i in 0 until 40)a.update(src,.016f);val parked=a.spin(0);a.update(src,.016f);assertEquals(parked,a.spin(0))
    }
}

class CombatFireSourceTest {
    private val input=Array(6){InputFrame()}
    private fun arena(mask: Int=0): World {
        val w=World(61,track=Track(1000.0,200.0,100.0),combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true};w.cars[0].utilityMask=mask;w.reset()
        repeat(241){w.step(input)};w.combat.reset()
        for(c in w.cars){c.x=-400+c.id*100.0;c.y=200.0;c.heading=0.0;c.vx=0.0;c.vy=0.0}
        return w
    }
    @Test fun shotsFromCombatBecomeFireEventsPerWeapon() {
        val w=arena();val s=CombatDerivedFireSource();s.update(w)
        assertEquals(0,s.fireCount(0,Weapons.RIVET))
        assertTrue(w.combat.fire(0,Weapons.RIVET));s.update(w);assertTrue(s.fireCount(0,Weapons.RIVET)>=1,"first bullet is an event");assertEquals(0,s.fireCount(1,Weapons.RIVET))
        val first=s.fireCount(0,Weapons.RIVET);s.update(w);assertEquals(first,s.fireCount(0,Weapons.RIVET),"no new bullet, no new event")
        assertTrue(w.combat.fire(0,Weapons.MINE));s.update(w);assertEquals(1,s.fireCount(0,Weapons.MINE))
        repeat(120){w.combat.step(input,Tuning.STEP_SECONDS)};s.update(w);assertEquals(6,s.fireCount(0,Weapons.RIVET),"a burst is six bullet events");assertTrue(w.combat.fire(0,Weapons.RIVET));s.update(w);assertTrue(s.fireCount(0,Weapons.RIVET)>6)
    }
    @Test fun loadoutFollowsTheCarsSlotsAndUtilities() {
        val plain=arena();val spiked=arena(1 shl Consumables.SPIKES)
        val m=MountLoadout.mask(plain.cars[0],plain.combat)
        assertTrue(MountLoadout.has(m,MountKind.RIVET));assertTrue(MountLoadout.has(m,MountKind.MINE));assertFalse(MountLoadout.has(m,MountKind.SPIKES))
        assertEquals(plain.combat.capacity(0,Weapons.HAMMER)>0,MountLoadout.has(m,MountKind.HAMMER))
        assertEquals(plain.combat.capacity(0,Weapons.SCATTER)>0,MountLoadout.has(m,MountKind.SCATTER))
        assertTrue(MountLoadout.has(MountLoadout.mask(spiked.cars[0],spiked.combat),MountKind.SPIKES))
    }
}
