package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class CareerLayoutTest {
    @Test fun theScriptCaptionHidesNoCareerElement() {
        for(e in CareerLayout.elements)assertFalse(CareerLayout.caption.intersects(e),"caption covers element at (${e.x},${e.y},${e.w},${e.h})")
    }
    @Test fun everyElementAndTheCaptionStayInsideThePanel() {
        for(e in CareerLayout.elements+CareerLayout.caption)assertTrue(e.inside(CareerLayout.panel),"outside the career panel: (${e.x},${e.y},${e.w},${e.h})")
    }
    @Test fun elementsDoNotOverlapEachOther() {
        val all=CareerLayout.elements
        for(i in all.indices)for(j in i+1 until all.size)if(i!=0 && j!=0) // the banner is the backdrop the title sits on
            assertFalse(all[i].intersects(all[j]),"elements $i and $j overlap")
    }
    @Test fun careerLinesStayShort() {
        assertEquals("ROUND 3 OF 35",TvCopy.careerRound(3,35))
        assertTrue(TvCopy.careerCourseLine("Foundry Run","Salt Flats",false,3).length<=40)
        assertEquals("FOUNDRY / SALT / DEATH DUEL",TvCopy.careerCourseLine("Foundry","Salt",true,3))
        assertEquals("Line",TvCopy.rivalTag("Line",false,false))
        assertEquals("Line / ALLY",TvCopy.rivalTag("Line",true,true))
    }
    @Test fun careerScreenLeavesStoryObjectiveAndEconomyToThePhone() {
        val f=File("src/main/kotlin/dev/deathride/game/RaceGame.kt");if(!f.exists())return
        val s=f.readText();val start=s.indexOf("\"career\" -> {\n                // A picture");val end=s.indexOf("\"countdown\" -> if(scene.ready) {title(")
        assertTrue(start>0 && end>start)
        val career=s.substring(start,end)
        for(gone in listOf("DeathDuel.story","Career.objective","PowerRating","tier.description","NEXT ","RIVALS / THEIR"))assertFalse(career.contains(gone),"career TV text came back: $gone")
        assertTrue(career.count{it=='\n'}<40)
    }
}
