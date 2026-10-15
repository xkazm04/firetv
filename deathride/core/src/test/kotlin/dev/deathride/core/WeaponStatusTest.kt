package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.ceil

/** One weapon word per weapon, agreeing with the raw over/heat/cooldown fields it is derived from. */
class WeaponStatusTest {
    private val frames=Array(Tuning.CAR_COUNT){InputFrame()}
    private fun world(): World {
        val w=World(913,combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true;c.entered=c.id<3;c.weaponSlots=3}
        w.reset()
        repeat(ceil(CombatRules["startProtectionSeconds"]/Tuning.STEP_SECONDS).toInt()+1){w.step(frames)}
        return w
    }

    @Test fun wordFollowsAmmoLockCooldownAndHeat() {
        val w=world();val c=w.combat
        assertEquals("READY",c.weaponStatus(0,Weapons.RIVET))
        assertTrue(c.fire(0,Weapons.RIVET))
        assertEquals("COOLING",c.weaponStatus(0,Weapons.RIVET))
        val seen=HashSet<String>()
        repeat(900){
            if(c.ammo(0,Weapons.SCATTER)<5)c.setAmmo(0,Weapons.SCATTER,12)
            c.fire(0,Weapons.SCATTER);w.step(frames)
            val word=c.weaponStatus(0,Weapons.SCATTER);seen+=word
            if(c.overheated(0,Weapons.SCATTER))assertEquals("OVERHEATED",word)
            if(word=="HOT")assertTrue(c.heatFraction(0,Weapons.SCATTER)>=0.6)
        }
        assertTrue("OVERHEATED" in seen,seen.toString())
        c.setAmmo(0,Weapons.SCATTER,0)
        assertEquals("EMPTY",c.weaponStatus(0,Weapons.SCATTER))
        assertTrue(seen.all{it in setOf("READY","HOT","COOLING","OVERHEATED")})
    }
}
