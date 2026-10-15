package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.ceil

/** The ability word the phone and TV show is player vocabulary, never a phase enum name, and always one short token. */
class AbilityStatusTest {
    private val frames=Array(Tuning.CAR_COUNT){InputFrame()}
    private fun world(): World {
        val w=World(913,combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,1);c.human=true;c.entered=c.id<3}
        w.reset();return w
    }

    @Test fun statusWalksArmingPrimingActiveCoolReady() {
        val w=world()
        assertEquals("ARMING",w.abilities.statusLabel(0))
        repeat(ceil(CombatRules["startProtectionSeconds"]/Tuning.STEP_SECONDS).toInt()+1){w.step(frames)}
        assertEquals("READY",w.abilities.statusLabel(0))
        frames[0].ability=1.0
        val seen=LinkedHashSet<String>()
        var steps=0
        while(steps++<4000){
            w.step(frames);frames[0].ability=0.0
            val label=w.abilities.statusLabel(0)
            seen+=if(label.startsWith("COOL "))"COOL" else label
            if(label=="READY" && "COOL" in seen)break
        }
        assertEquals(listOf("PRIMING","ACTIVE","COOL","READY"),seen.filter{it!="ARMING" && it!="LOW ENERGY"}.toList())
        for(label in seen)assertTrue(label.length<=12,label)
        assertTrue(w.abilities.hudJson(0).contains("\"status\":\""))
    }

    @Test fun statusNeverLeaksPhaseEnumNames() {
        val w=world()
        val raw=AbilityPhase.values().map{it.name}.toSet()-"READY"
        repeat(120){
            frames[0].ability=if(it%7==0)1.0 else 0.0
            w.step(frames)
            assertFalse(w.abilities.statusLabel(0) in raw)
        }
    }

    @Test fun wreckedCarReadsOut() {
        val w=world()
        repeat(ceil(CombatRules["startProtectionSeconds"]/Tuning.STEP_SECONDS).toInt()+1){w.step(frames)}
        w.combat.damage(0,1e6,1,DamageKind.ABILITY)
        w.step(frames)
        assertEquals("OUT",w.abilities.statusLabel(0))
    }
}
