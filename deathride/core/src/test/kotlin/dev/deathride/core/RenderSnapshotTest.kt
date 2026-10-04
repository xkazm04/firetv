package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class RenderSnapshotTest {
    @Test fun readOnlyCombatSnapshotUsesActualHullAndRetainsPreviousState() {
        val w=World(combatEnabled=true);CarCatalog.apply(w.cars[0],CarCatalog.all.indexOfFirst{it.id=="Quill"});w.reset()
        val s=w.snapshot;assertEquals(1.0,s.healthFraction(0));assertEquals(76.0,w.combat.maxHealth(0))
        assertEquals(w.combat.pickups.size,s.pickupCount)
        for(i in 0 until s.pickupCount){assertEquals(w.combat.pickups[i].x,s.pickupX(i));assertEquals(w.combat.pickups[i].type.id,s.pickupId(i));assertTrue(s.pickupReady(i))}
        val b=w.combat.blasts[0];b.x=12.0;b.y=23.0;b.radiusM=5.0;b.activation=17;b.remainingSeconds=.3
        s.capture(w.cars)
        assertEquals(17,s.blastActivation(0));assertEquals(12.0,s.blastX(0));assertEquals(.3,s.blastRemaining(0))
        b.x=90.0;assertEquals(12.0,s.blastX(0),"the snapshot must not expose mutable pool state")
        val before=s.x(0);w.cars[0].x+=3;assertEquals(before,s.x(0))
        assertTrue(s.entered(0));assertFalse(s.wrecked(0));assertEquals(0.0,s.flash(0))
    }
}
