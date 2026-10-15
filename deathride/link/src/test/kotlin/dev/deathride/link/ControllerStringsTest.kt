package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

/** String budgets for the phone page: a picture and one short line per surface, no jargon, no word the page cannot back. */
class ControllerStringsTest {
    private val page: String by lazy {
        val candidates=listOf(File("../controller/index.html"),File("controller/index.html"),File("deathride/controller/index.html"))
        (candidates.firstOrNull { it.isFile } ?: error("controller/index.html not found from ${File(".").absolutePath}")).readText()
    }
    private fun words(text: String)=text.split(Regex("\\s+")).count { it.any(Char::isLetterOrDigit) }
    private fun tagText(id: String): String {
        val m=Regex("id=\"$id\"[^>]*>([^<]*)<").find(page) ?: error("no element $id")
        return m.groupValues[1].trim()
    }

    @Test fun footerLabelsAreOneShortWord() {
        val footer=Regex("<footer>(.*?)</footer>",RegexOption.DOT_MATCHES_ALL).find(page)!!.groupValues[1]
        val labels=Regex("<button[^>]*>([^<]+)</button>").findAll(footer).map { it.groupValues[1] }.toList()
        assertEquals(6,labels.size,"footer buttons: $labels")
        for(label in labels)assertTrue(label.length<=12,"footer label too long: $label")
    }

    @Test fun driveSurfaceHintsStayShort() {
        val line=page.lines().first { it.contains(".hint').textContent=") }
        val literals=Regex("'([^']+)'").findAll(line.substringAfter(".hint').textContent=").substringBefore(";storage")).map { it.groupValues[1] }.toList()
        assertTrue(literals.size>=3)
        for(hint in literals)assertTrue(words(hint)<=7,"hint over 7 words: $hint")
        assertTrue(page.contains("data-phase=\"race\"] .steer .hint{display:none}"),"race hides the hint")
        assertTrue(page.contains("body[data-phase=\"race\"] footer button:not(#leave)"),"race hides the menu buttons")
    }

    @Test fun statusLineDoesNotTellAnAutoDriverToHoldGo() {
        assertTrue(page.contains("layout?.autoThrottle?'Linked':'Linked · hold GO again'"))
        assertTrue(page.contains("layout?.autoThrottle?'TV paused':'TV paused · release GO'"))
    }

    @Test fun pairingScreenIsOneInstruction() {
        assertTrue(words(tagText("pairMessage"))<=6,tagText("pairMessage"))
        val h1=Regex("<form class=\"card\" id=\"pairform\"><h1>([^<]+)</h1>").find(page)!!.groupValues[1]
        assertTrue(words(h1)<=3,h1)
    }

    @Test fun noJargonAbbreviationsOnSheets() {
        assertFalse(Regex("\\bPR\\b").containsMatchIn(page),"PR is unexplained; say Power")
        assertFalse(page.contains(">DRIVE</button>"),"a sheet closer that says DRIVE reads as a start button")
        assertFalse(page.contains("BACK TO LOBBY"),"one name for the lobby")
    }

    @Test fun debtHasOneWordPerThing() {
        assertTrue(page.contains("return 'League debt '+c.debt+' CR · Loans '+c.loanDebt+' CR'"))
        assertFalse(Regex("[Oo]ptional loans").containsMatchIn(page),"loans are Loans")
        assertFalse(page.contains("= '+c.debt+' CR."),"the totals line says League debt, not bare debt")
    }

    @Test fun marketSurfaceIsHullAndCreditsOnly() {
        assertTrue(page.contains(".textContent='Hull '+m.condition+'% / '+g.credits+' CR'"))
        assertTrue(page.contains("id=\"marketDetail\""))
    }

    @Test fun cardDescriptionsOpenOnTap() {
        assertTrue(page.contains("desc.className='more'"))
        assertTrue(page.contains("info.className='more'"))
        assertTrue(page.contains(".offer p.more{display:none"))
    }

    @Test fun allyButtonIsTheLabelAlone() {
        assertFalse(page.contains("' / '+offer.reason"))
    }

    @Test fun spokenMechanicLineIsNotOnTheSurface() {
        assertFalse(page.contains("mechanicLine"))
        assertTrue(page.contains("\$('mechanicTutorial').textContent=g.campaign.tutorial"))
    }

    @Test fun wrongPinClearsAndRefocusesTheInput() {
        assertTrue(page.contains("m.code==='BAD_PIN'"))
        assertTrue(page.contains("\$('pin').value='';\$('pin').focus()"))
    }

    @Test fun phoneRendersTheScreenTheLinkNames() {
        assertTrue(page.contains("const screenName=m.screen||"))
        assertFalse(page.contains("m.phase==='countdown'?'GET READY'"),"the phone must not re-derive the screen from the phase")
    }

    @Test fun raceDoesNotRepeatAmmoInTheHeader() {
        assertFalse(page.contains("c.weaponName.toUpperCase()+' '+c.ammo);"),"the FIRE button already shows the ammo")
    }
}
