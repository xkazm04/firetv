package dev.telestrator.tv

import java.io.File
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * The overlay redraws at ~30 Hz on a Fire TV Stick where GC churn is a measured frame cost, and a
 * JVM test cannot construct an android.graphics.Paint. So the allocation count is read from the
 * source of the draw path (comments stripped): what a frame constructs, and what it re-parses.
 */
class OverlayAllocationTest {

    private val source: String = run {
        val f = listOf("src/main/kotlin", "tv-app/src/main/kotlin")
            .map { File(it, "dev/telestrator/tv/Overlay.kt") }
            .first { it.exists() }
        f.readText()
            .replace(Regex("/\\*.*?\\*/", RegexOption.DOT_MATCHES_ALL), "")
            .replace(Regex("//[^\\n]*"), "")
    }

    /** The text of a top-level function, from its signature to the closing brace in column 0. */
    private fun body(signature: String): String {
        val start = source.indexOf(signature)
        assertTrue(start >= 0, "missing $signature")
        val end = Regex("\\n\\}").find(source, start)!!.range.last
        return source.substring(start, end + 1)
    }

    @Test
    fun `a name tag frame constructs no Paint`() {
        val paints = Regex("Paint\\(").findAll(body("fun DrawScope.drawNameTag")).count()
        assertEquals(0, paints, "Paint constructions per visible tag per frame")
    }

    @Test
    fun `a colour string is parsed once, not once per annotation per frame`() {
        assertTrue(body("fun parseColor").contains("getOrPut"), "parseColor memoizes")
    }
}
