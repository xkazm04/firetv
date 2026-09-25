package dev.telestrator.core

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.Locale

class HealthBodyTest {

    private val pin = "4821"

    private fun reading() = HealthReading(
        transport = "lan",
        pin = pin,
        annotations = 3,
        revision = 17,
        t = 12_480,
        durationMs = 20_000,
        paused = true,
        rate = 0.5,
        pens = 1,
        canUndo = true,
        canRedo = false,
        renderP50Ms = 0.4215,
        renderP95Ms = 1.25,
        renderMaxMs = 3.0,
        renderFrames = 120,
    )

    private fun parse(body: String): JsonObject = Json.parseToJsonElement(body).jsonObject

    @Test
    fun `the body is JSON carrying what the harness asserts on`() {
        val h = parse(healthBody(reading()))
        assertEquals("true", h.getValue("ok").jsonPrimitive.content)
        assertEquals("lan", h.getValue("transport").jsonPrimitive.content)
        assertEquals("3", h.getValue("annotations").jsonPrimitive.content)
        assertEquals("12480", h.getValue("t").jsonPrimitive.content)
        assertEquals("true", h.getValue("paused").jsonPrimitive.content)
        assertEquals("1", h.getValue("pens").jsonPrimitive.content)
        assertEquals("1.250", h.getValue("renderP95Ms").jsonPrimitive.content)
        assertEquals("120", h.getValue("renderFrames").jsonPrimitive.content)
    }

    @Test
    fun `a comma-decimal locale does not break the JSON`() {
        val saved = Locale.getDefault()
        try {
            Locale.setDefault(Locale.GERMANY)
            assertEquals("0.422", parse(healthBody(reading())).getValue("renderP50Ms").jsonPrimitive.content)
        } finally {
            Locale.setDefault(saved)
        }
    }
}
