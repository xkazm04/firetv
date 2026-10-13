package dev.telestrator.core

import java.io.File
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * The wire contract read off the phone page itself, not off a list copied into a test.
 *
 * `companion/index.html` is the only pen that ships. Every message type it sends must be one
 * [PenMessage] decodes, every transport command one [TransportPlan] acts on, every shape tool one
 * [PenEngine] draws, and every hold name one [Hold] knows (an unknown name falls back to the
 * default silently, so a drift there would not throw anywhere). The review-mode constants the page
 * copies from [AnnotationTimeline] must be the same numbers.
 */
class CompanionContractTest {

    private val page: String by lazy {
        // Gradle runs a module's tests in the module's own directory.
        val file = listOf(File("../companion/index.html"), File("companion/index.html")).firstOrNull { it.isFile }
        checkNotNull(file) { "companion/index.html not found from ${File(".").absolutePath}" }
        stripComments(file.readText())
    }

    /** Line and block comments out, so prose describing a message is never mistaken for one. */
    private fun stripComments(src: String): String = src
        .replace(Regex("<!--.*?-->", RegexOption.DOT_MATCHES_ALL), "")
        .replace(Regex("/\\*.*?\\*/", RegexOption.DOT_MATCHES_ALL), "")
        .replace(Regex("(^|\\s)//[^\\n]*"), "$1")

    private fun all(pattern: String): Set<String> =
        Regex(pattern).findAll(page).map { it.groupValues[1] }.toSet()

    @OptIn(kotlinx.serialization.ExperimentalSerializationApi::class)
    private val penTypes: Set<String> by lazy {
        val d = PenMessage.serializer().descriptor.getElementDescriptor(1)
        (0 until d.elementsCount).map { d.getElementName(it) }.toSet()
    }

    @Test
    fun `every message type the page sends is one the TV decodes`() {
        val sent = all("""type:\s*'([A-Za-z]+)'""") - setOf("welcome", "state", "doc")
        assertTrue(sent.size >= 10, "found only $sent in the page; the extraction is broken")
        assertEquals(emptySet<String>(), sent - penTypes, "the page sends types the TV cannot decode")
    }

    @Test
    fun `every transport command the page sends is one the plan acts on`() {
        val cmds = all("""cmd:\s*'([a-z+\-]+)'""")
        assertTrue(cmds.size >= 5, "found only $cmds in the page; the extraction is broken")
        val drawn = AnnotationDoc(
            clipId = "c",
            annotations = listOf(Annotation.Arrow("a", 5_000, 11_000, from = listOf(0.1, 0.1), to = listOf(0.5, 0.5))),
        )
        val dead = cmds.filter { cmd ->
            TransportPlan.plan(cmd, value = 1.0, positionMs = 1_000, durationMs = 20_000, doc = drawn).isEmpty()
        }
        assertEquals(emptyList<String>(), dead, "the page sends transport commands the TV ignores")
    }

    @Test
    fun `every shape tool on the page is one the engine draws`() {
        val tools = all("""data-tool="([a-z]+)"""") - setOf("freehand", "tag", "erase")
        assertTrue(tools.isNotEmpty(), "no shape tools found in the page; the extraction is broken")
        val undrawn = tools.filter { tool ->
            val e = PenEngine("c")
            e.accept(PenMessage.Shape(tool, listOf(0.3, 0.3), listOf(0.5, 0.5)), 0)
            e.annotationCount != 1
        }
        assertEquals(emptyList<String>(), undrawn, "the page offers shape tools the TV does not draw")
    }

    @Test
    fun `every pen phase and hold name the page sends means something to the engine`() {
        val phases = all("""flush\('([a-z]+)'\)""")
        assertEquals(setOf("down", "move", "up"), phases, "pen phases in the page")
        val e = PenEngine("c")
        for (phase in listOf("down", "move", "up")) {
            e.accept(PenMessage.Pen(phase = phase, pts = listOf(listOf(0.1 + phase.length / 10.0, 0.2, 0.5))), 0)
        }
        assertEquals(1, e.annotationCount, "down, move, up drew no stroke")

        val holds = all("""sticky\s*\?\s*'([A-Za-z]+)'""")
        assertTrue(holds.isNotEmpty(), "no hold name found in the page; the extraction is broken")
        for (name in holds) {
            assertTrue(
                Hold.entries.any { it.name.equals(name, ignoreCase = true) },
                "hold '$name' is not a Hold; it would silently fall back to ${Hold.Default}",
            )
        }
    }

    @Test
    fun `the review-mode constants the page copies are the timeline's`() {
        fun const(name: String): Long {
            val m = Regex("""\b$name\s*=\s*(\d+)""").find(page)
            checkNotNull(m) { "$name not found in the page" }
            return m.groupValues[1].toLong()
        }
        assertEquals(AnnotationTimeline.MOMENT_SPAN_MS, const("MOMENT_SPAN_MS"))
        assertEquals(AnnotationTimeline.ON_MOMENT_LEAD_MS, const("ON_MOMENT_LEAD_MS"))
    }
}
