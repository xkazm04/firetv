package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class TvCopyTest {
    /** Words a viewer reads: separators ("/", "+", ":") and bare numbers do not count. */
    private fun words(s: String)=s.split(Regex("\\s+")).count{ w->w.any{it.isLetter()} }
    private fun phone(): String? {
        for(p in listOf("../controller/index.html","controller/index.html","deathride/controller/index.html")) { val f=File(p);if(f.exists())return f.readText() }
        return null
    }

    @Test fun countdownNeverTellsAnAutoSeatToHoldGo() {
        assertEquals("GET READY",TvCopy.countdownCue(emptyList()))
        assertEquals("GET READY",TvCopy.countdownCue(listOf("Auto","Auto")))
        assertEquals("HOLD GO",TvCopy.countdownCue(listOf("Auto","Classic")))
    }
    @Test fun pairingStepsAreShortAndStepThreeNamesNoControl() {
        val lines=TvCopy.LOBBY_STEPS.lines()
        assertEquals(3,lines.size)
        for(l in lines)assertTrue(words(l)<=6,"step too long: $l")
        assertFalse(TvCopy.LOBBY_STEPS.contains("GO",ignoreCase=false),"Auto layout has no GO to hold")
        assertFalse(TvCopy.LOBBY_STEPS.contains("Hold",ignoreCase=true))
    }
    private fun raceGameSource(): String? {
        for(p in listOf("src/main/kotlin/dev/deathride/game/RaceGame.kt","game/src/main/kotlin/dev/deathride/game/RaceGame.kt","deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt")) { val f=File(p);if(f.exists())return f.readText() }
        return null
    }
    @Test fun lobbyDoesNotRepeatItself() {
        val src=raceGameSource()?:return
        for(gone in listOf("TWO PHONES. ONE CIRCUIT","No app needed","Two phone seats"))assertFalse(src.contains(gone),"slogan came back: $gone")
    }
    @Test fun careerHintsAreCapitalsAndNameDown() {
        for(h in listOf(TvCopy.CAREER_HINT_REWARD,TvCopy.CAREER_HINT_DIFFICULTY)) {
            assertEquals(h.uppercase(),h)
            assertTrue(h.contains("DOWN  RACE") && h.contains("PLAY  GARAGE"))
            assertTrue(h.length<=52,"hint overflows the 677 px footer: $h")
        }
    }
    @Test fun statusLineHasNoSlogan() {
        assertEquals("",TvCopy.statusLine("",true))
        assertEquals("PREPARING CIRCUIT",TvCopy.statusLine("",false))
        assertEquals("SAVE FAILED",TvCopy.statusLine("Save failed",true))
    }
    @Test fun mainButtonUsesThePhonesVerb() {
        val html=phone()
        if(html!=null) {
            assertTrue(html.contains(">${TvCopy.START_RACE}<"),"phone has no ${TvCopy.START_RACE} button")
            assertTrue(html.contains(">${TvCopy.NEXT_ROUND}<"),"phone has no ${TvCopy.NEXT_ROUND} button")
        }
        for(phase in listOf("lobby","results","career"))for(campaign in listOf(false,true))for(pending in listOf(false,true)) {
            val label=TvCopy.mainButton(phase,campaign,pending)
            assertTrue(label.isNotEmpty() && words(label)<=3,"$phase/$campaign: $label")
            assertFalse(label.startsWith("SELECT"),label)
        }
    }
}
