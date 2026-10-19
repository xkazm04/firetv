package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class RaceHudCopyTest {
    @Test fun readyIsSilentEverythingElseIsAWord() {
        assertEquals("",TvCopy.quietReady("READY"))
        assertEquals("EMPTY",TvCopy.quietReady("EMPTY"))
        assertEquals("COOLING 2s",TvCopy.quietReady("COOLING 2s"))
        assertEquals("HP 80",TvCopy.hpLine(80))
    }
    @Test fun theStripIsEmptyWhileRacing() {
        assertEquals("",TvCopy.raceStrip(false,false))
        assertEquals("PREPARING CIRCUIT",TvCopy.raceStrip(true,false))
        assertEquals("WRECKED / SPECTATING",TvCopy.raceStrip(false,true))
    }
    @Test fun raceHudKeepsNumbersAndBarsNotSentences() {
        val f=File("src/main/kotlin/dev/deathride/game/RaceGame.kt");if(!f.exists())return
        val s=f.readText();val a=s.indexOf("\"race\" -> {\n                val c=activeDriver()");val b=s.indexOf("\"results\" -> {\n                title(")
        assertTrue(a>0 && b>a)
        val race=s.substring(a,b)
        for(gone in listOf("ENERGY","\"MINE ","\"ARMOUR \${","d.name.uppercase()","world.seconds.toInt()}s","Weapons.all[weapon].id.uppercase()"))assertFalse(race.contains(gone),"race HUD text came back: $gone")
        // text is built in the 10 Hz rebuild: no label call may sit in drawOverlay/drawWorld (per-frame)
        val draw=s.substring(s.indexOf("private fun drawOverlay()"),s.indexOf("private fun previewKey()"))
        assertFalse(draw.contains("label("),"label() belongs to rebuildUi")
    }
    @Test fun pairingStatusShowsNoWifiAndPortBusyNotAPhoneCount() {
        assertEquals("1 / 2 PHONES CONNECTED",TvCopy.pairStatus(true,false,1,"READY"))
        assertEquals("No Wi-Fi",TvCopy.pairStatus(true,true,0,"No Wi-Fi"))
        assertEquals("Port busy",TvCopy.pairStatus(false,false,0,"Port busy"))
    }
    @Test fun hudJsonCarriesTheCoreWeaponState() {
        val f=File("src/main/kotlin/dev/deathride/game/RaceGame.kt");if(!f.exists())return
        val s=f.readText()
        assertTrue(s.contains("append(\",\\\"state\\\":\\\"\").append(c.weaponStatus(id,w))"))
        assertTrue(s.contains("TvCopy.pairStatus(server.running,server.noNetwork"))
    }
}
