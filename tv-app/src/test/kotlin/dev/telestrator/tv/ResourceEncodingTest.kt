package dev.telestrator.tv

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.CodingErrorAction

/**
 * Every value resource declares UTF-8, and aapt reads it as UTF-8: a byte saved in another code
 * page (an editor's Windows-1252 ellipsis is the usual one) reaches the television as a
 * replacement character. Decoding strictly here is what catches it.
 */
class ResourceEncodingTest {

    private val res = File("src/main/res")

    private fun valueFiles(): List<File> =
        res.walkTopDown().filter { it.isFile && it.extension == "xml" && it.parentFile.name.startsWith("values") }.toList()

    @Test
    fun `the resource tree is where the test looks`() {
        assertTrue(valueFiles().any { it.name == "strings.xml" }, "no values/strings.xml under ${res.absolutePath}")
    }

    @Test
    fun `every value resource is valid UTF-8`() {
        val bad = valueFiles().filter { file ->
            val decoder = Charsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
            try {
                decoder.decode(ByteBuffer.wrap(file.readBytes()))
                false
            } catch (_: CharacterCodingException) {
                true
            }
        }
        assertEquals(emptyList<String>(), bad.map { it.invariantSeparatorsPath })
    }
}
