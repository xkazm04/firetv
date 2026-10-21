package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/** "Draws but nothing appears": what the engine decoded and dropped is countable afterwards. */
class DroppedMessagesTest {

    private fun accept(e: PenEngine, json: String) = e.accept(decodePenMessage(json), 0)

    @Test
    fun `each drop path bumps its own counter and a drawn shape bumps none`() {
        val e = PenEngine("c")
        accept(e, """{"type":"shape","tool":"arrow","from":[0.5],"to":[0.6,0.5]}""")
        accept(e, """{"type":"shape","tool":"arrow","from":[0.5,0.5],"to":[0.5,0.5]}""")
        accept(e, """{"type":"shape","tool":"spot","from":[0.1,0.1],"to":[0.5,0.5]}""")
        accept(e, """{"type":"pen","phase":"down","pts":[[0.1,0.1,0.5],[0.2]]}""")
        accept(e, """{"type":"pen","phase":"hover","pts":[[0.1,0.1,0.5]]}""")
        accept(e, """{"type":"shape","tool":"arrow","from":[0.1,0.1],"to":[0.5,0.5]}""")

        assertEquals(
            mapOf(
                "shape-short-end" to 1,
                "shape-tap" to 1,
                "shape-unknown-tool" to 1,
                "pen-short-point" to 1,
                "pen-unknown-phase" to 1,
            ),
            e.droppedCounts,
        )
        assertEquals(2, e.annotationCount, "the live stroke and the arrow both exist")
    }

    @Test
    fun `a blank tag and pen input with no stroke open are counted too`() {
        val e = PenEngine("c")
        accept(e, """{"type":"tag","x":0.5,"y":0.5,"label":"   "}""")
        // A move and an up whose down never arrived (or was cut by an undo or a clear mid-stroke).
        accept(e, """{"type":"pen","phase":"move","pts":[[0.1,0.1,0.5],[0.3,0.3,0.5]]}""")
        accept(e, """{"type":"pen","phase":"up","pts":[[0.4,0.4,0.5]]}""")

        assertEquals(mapOf("pen-no-stroke" to 2, "tag-blank-label" to 1), e.droppedCounts)
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `an engine that dropped nothing reports nothing`() {
        val e = PenEngine("c")
        accept(e, """{"type":"shape","tool":"arrow","from":[0.1,0.1],"to":[0.5,0.5]}""")
        assertEquals(emptyMap<String, Int>(), e.droppedCounts)
    }
}
