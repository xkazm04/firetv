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
    @Test fun pairingIsOneLineAndTheCodeIsCalledTvCode() {
        assertTrue(words(TvCopy.PAIR_LINE)<=10,TvCopy.PAIR_LINE)
        assertFalse(TvCopy.PAIR_LINE.contains("Hold",ignoreCase=true))
        assertEquals("TV CODE",TvCopy.CODE_LABEL)
        val html=phone()
        if(html!=null)assertTrue(html.contains("TV code"),"phone no longer says TV code")
        val src=raceGameSource()
        if(src!=null)assertFalse(src.contains("\"PIN "),"the TV says TV code, not PIN")
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
    @Test fun healthIsCalledHpEverywhereAndWeaponStatesUseThePhonesWords() {
        val src=raceGameSource()
        if(src!=null)assertFalse(src.contains("\"HULL "),"the phone and the footer say HP")
        val theme=File("src/main/kotlin/dev/deathride/game/HudTheme.kt")
        if(theme.exists()) {
            val text=theme.readText()
            assertTrue(text.contains("\"OVERHEATED\"") && text.contains("\"COOLING \${"),"phone words: OVERHEATED, COOLING")
        }
        val html=phone()
        if(html!=null)assertTrue(html.contains("OVERHEATED") && html.contains("COOLING") && html.contains("HP <b"))
    }
    @Test fun seatsAreAlwaysPlayerN() {
        assertEquals("PLAYER 1 / Line / 120 CR",TvCopy.seatLine(0,"Line",120))
        assertEquals("PLAYER 2 / Bulwark / 0 CR",TvCopy.seatLine(1,"Bulwark",0L))
        assertTrue(words(TvCopy.JOIN_LINE)<=5)
        val src=raceGameSource()
        if(src!=null)for(gone in listOf("\"P1 ","\"P2 ","\"P1\"","SECOND DRIVER"))assertFalse(src.contains(gone),"two names for a seat: $gone")
    }
    @Test fun resultsNameTheScreenOnceAndLeadWithWhatWasKept() {
        assertTrue(TvCopy.receiptBanked(240,1900).startsWith("BANKED +240 CR"))
        assertTrue(TvCopy.receiptBreakdown(400,100,60).startsWith("PRIZE 400"))
        val src=raceGameSource()
        if(src!=null)for(gone in listOf("\"THE FINISH\"","\"RACE RESULTS\"","PARTS / PER CAR","DEBT + CAP"))assertFalse(src.contains(gone),"duplicate or jargon title: $gone")
    }
    @Test fun hintsAreKeyThenAction() {
        assertEquals("M / Y  MUTE",TvCopy.soundHint(false))
        assertEquals("M / Y  SOUND ON",TvCopy.soundHint(true))
        assertTrue(TvCopy.soundHint(true).length<=16,"the footer slot is 285 px")
        assertEquals("INSTALL TIER 2 / 300 CR",TvCopy.installLabel(2,300))
        val html=phone()
        if(html!=null) {
            assertTrue(html.contains("INSTALL TIER '+"),"phone install verb changed")
            assertTrue(html.contains("Link lost"),"phone link wording changed")
        }
        val src=raceGameSource()
        if(src!=null)for(gone in listOf("LINK QUIET","SELECT: TIER","SOUND OFF\"","BACK: LOBBY   /"))assertFalse(src.contains(gone),gone)
    }
    @Test fun everyRemoteHintUsesOneForm() {
        for(h in listOf(TvCopy.GARAGE_CAR_HINT,TvCopy.LOBBY_CAREER_HINT,TvCopy.soundHint(true),TvCopy.soundHint(false),TvCopy.CAREER_HINT_REWARD,TvCopy.CAREER_HINT_DIFFICULTY)) {
            assertFalse(h.contains(":") || h.contains(" / ")&&!h.startsWith("L / R")&&!h.startsWith("M / Y"),"mixed hint form: $h")
            assertEquals(h.uppercase(),h)
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
