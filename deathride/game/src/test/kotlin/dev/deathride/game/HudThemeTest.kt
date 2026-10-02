package dev.deathride.game

import com.badlogic.gdx.utils.JsonReader
import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class HudThemeTest {
    @Test fun everySignatureHasAnIconAndMissingOrExtremeMeterValuesStayBounded() {
        val catalog=JsonReader().parse(File("../assets/phase2-hud/catalog.json").readText())
        val names=catalog.get("assets").map{it.getString("logical_name")}.toSet()
        for(d in AbilityCatalog.all)assertTrue("hud/ability-"+d.id in names,d.id)
        assertEquals(0f,HudTheme.fraction(Double.NaN,100.0))
        assertEquals(0f,HudTheme.fraction(1.0,0.0))
        assertEquals(0f,HudTheme.fraction(-1.0,100.0))
        assertEquals(1f,HudTheme.fraction(110.0,100.0))
        assertEquals(.25f,HudTheme.fraction(25.0,100.0))
        assertTrue(HudTheme.BODY*1.5>=28)
    }
    @Test fun allFourHudFrameOpeningsAreFiniteAndInsideOneUiPage() {
        val ui=JsonReader().parse(File("../assets/phase2-hud/ui.json").readText())
        assertEquals(1,ui.get("pages").size)
        val frames=ui.get("regions").filter{it.getString("id").startsWith("v4-hud-") && it.get("hud_interior_px")?.isNull==false}
        assertEquals(4,frames.size)
        for(r in frames) {
            val b=r.get("hud_interior_px").asIntArray()
            assertEquals(4,b.size)
            assertTrue(b[0]>0 && b[1]>0 && b[2]>b[0] && b[3]>b[1])
            assertTrue(b[2]<r.getInt("width") && b[3]<r.getInt("height"))
        }
    }
}
