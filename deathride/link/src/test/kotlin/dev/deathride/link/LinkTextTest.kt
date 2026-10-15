package dev.deathride.link
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class LinkTextTest {
    private val phases=listOf("lobby","garage","career","countdown","race","results")
    @Test fun everyRefusalIsOneShortLineAndSaysItsReason() {
        val all=phases.flatMap { p -> listOf(true,false).flatMap { pin -> listOf(true,false).map { seat -> LinkText.refusal(p,pin,seat) } } }
        for(r in all) { assertTrue(r.message.length<=44,r.message); assertFalse(r.message.contains("error",ignoreCase=true),r.message) }
        assertEquals(LinkText.RACE_ON,LinkText.refusal("race",true,true).code)
        assertEquals(LinkText.RACE_ON,LinkText.refusal("countdown",false,false).code)
        assertEquals(LinkText.BAD_PIN,LinkText.refusal("lobby",false,true).code)
        assertEquals(LinkText.FULL,LinkText.refusal("lobby",true,false).code)
        assertEquals(LinkText.PROFILE_TAKEN,LinkText.refusal("lobby",true,true).code)
    }
    @Test fun refusalsSayTvCodeNeverPin() {
        for(p in phases) for(pin in listOf(true,false)) for(seat in listOf(true,false)) assertFalse(LinkText.refusal(p,pin,seat).message.contains("PIN"))
        assertEquals("Wrong TV code. Check the TV.",LinkText.refusal("lobby",false,true).message)
    }
    @Test fun refusalJsonCarriesCodeAndMessage() {
        val j=kotlinx.serialization.json.Json.parseToJsonElement(LinkText.refusalJson(LinkText.refusal("lobby",false,true))).let{it as kotlinx.serialization.json.JsonObject}
        assertEquals("error",(j["t"] as kotlinx.serialization.json.JsonPrimitive).content)
        assertEquals("BAD_PIN",(j["code"] as kotlinx.serialization.json.JsonPrimitive).content)
    }
    @Test fun linkStatusLinesFitTheTvLobbyLabel() {
        for(s in listOf(LinkText.STARTING,LinkText.READY,LinkText.LOST,LinkText.BLOCKED,LinkText.PORT_BUSY,LinkText.NO_WIFI)) { assertTrue(s.length<=60,s); assertFalse(s.contains("8765"),s) }
        assertNotEquals(LinkText.PORT_BUSY,LinkText.NO_WIFI)
    }
    @Test fun aTokenTheTvForgotIsAResetNotABadCode() {
        val r=LinkText.refusal("lobby",false,true,staleToken=true)
        assertEquals(LinkText.RESET,r.code); assertTrue(r.message.length<=44,r.message); assertTrue(r.message.contains("TV code"))
        assertEquals(LinkText.BAD_PIN,LinkText.refusal("lobby",false,true).code)
        assertEquals(LinkText.RACE_ON,LinkText.refusal("race",false,true,staleToken=true).code)
    }
    @Test fun notNowNamesTheCommandAndTheScreen() {
        assertEquals("""{"t":"notNow","for":"buy","screen":"RACE"}""",LinkText.notNowJson("buy","race"))
    }
    @Test fun screenNamesAreOneWordPerPhase() {
        assertEquals(setOf("LOBBY","GARAGE","CAREER","COUNTDOWN","RACE","RESULTS"),phases.map(LinkText::screen).toSet())
    }
}
