package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

/** Ability names sit on a phone button beside a status word: short, and never the same word as another thing. */
class AbilityNameBudgetTest {
    @Test fun abilityNamesFitTheButtonAndAreNotAnotherThingsName() {
        val other=(CarCatalog.all.map{it.id}+Weapons.all.map{it.id}+Consumables.all.map{it.name}).map{it.lowercase()}.toSet()
        for(d in AbilityCatalog.all+AbilityCatalog.dispatcher) {
            assertTrue(d.name.length<=15,"${d.id}: '${d.name}' over 15 chars")
            assertFalse(d.name.lowercase() in other,"${d.id}: '${d.name}' is also another thing's name")
        }
        assertEquals(AbilityCatalog.all.size+1,(AbilityCatalog.all+AbilityCatalog.dispatcher).map{it.name.lowercase()}.toSet().size)
    }
}
