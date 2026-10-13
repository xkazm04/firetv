package dev.telestrator.tv

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/** The pairing PIN is the only secret between a phone and the TV: its space is the brute-force floor. */
class SessionPinTest {

    private fun pin() = Session(clipId = "test", videoAspect = 16.0 / 9.0).pin

    @Test
    fun `the PIN is six digits with no leading zero, over a space of 900000`() {
        repeat(200) {
            val p = pin()
            assertEquals(6, p.length, "PIN length of $p")
            assertTrue(p.all { it in '0'..'9' } && p[0] != '0', "PIN shape of $p")
        }
    }
}
