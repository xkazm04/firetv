package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CampaignReuseTest {
    @Test fun onlyAnUnchangedPhysicalPrefixAndInactiveMarrowCanBeReused() {
        val original=mapOf("career-curve.csv" to "event,value\ne1,10\ne2,20\n", "rival-garages.csv" to "id,championPrLimit,other\nrook,9999,x\nmarrow,635,y\n", "physics.csv" to "mass,1\n")
        val allowed=original+mapOf("career-curve.csv" to "event,value\ne1,10\ne2,30\n", "rival-garages.csv" to "id,championPrLimit,other\nrook,9999,x\nmarrow,610,y\n")
        assertTrue(campaignReuseDataErrors(original,allowed,1).isEmpty())
        assertTrue(campaignReuseDataErrors(original,allowed,2).any{"prefix" in it})
        assertTrue(campaignReuseDataErrors(original,allowed,29).any{"active Marrow" in it})
        assertTrue(campaignReuseDataErrors(original,allowed+mapOf("physics.csv" to "mass,2\n"),1).any{"Physical resource" in it})
        assertTrue(campaignReuseDataErrors(original,allowed+mapOf("extra.csv" to "x"),1).any{"Resource set" in it})
        assertTrue(campaignReuseDataErrors(original,allowed+mapOf("rival-garages.csv" to allowed.getValue("rival-garages.csv").replace("rook,9999","rook,600")),1).any{"Active rival" in it})
        assertTrue(campaignReuseDataErrors(original,allowed+mapOf("rival-garages.csv" to allowed.getValue("rival-garages.csv").replace("marrow,610","marrow,-1")),1).any{"Invalid Marrow" in it})
    }
    @Test fun narrowLineReuseRejectsOtherPhysicalChangesAndWrongCeilings() {
        val old=mapOf("class-upgrade-caps.csv" to "id,speed,grip\nLine,8.25,10\nNeedle,10,10\n", "cars/Line.csv" to "unchanged")
        val next=old+mapOf("class-upgrade-caps.csv" to old.getValue("class-upgrade-caps.csv").replace("8.25","8.125"))
        assertTrue(campaignLineReuseDataValid(old,next))
        assertFalse(campaignLineReuseDataValid(old,next+mapOf("cars/Line.csv" to "changed")))
        assertFalse(campaignLineReuseDataValid(old,old))
        assertFalse(campaignLineReuseDataValid(old,next+mapOf("new.csv" to "extra")))
    }
}
