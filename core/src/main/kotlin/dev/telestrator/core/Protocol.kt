package dev.telestrator.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Phone -> TV messages (design doc section 3.4). */
@Serializable
sealed interface PenMessage {

    @Serializable
    @SerialName("hello")
    data class Hello(val pin: String, val clientId: String) : PenMessage

    @Serializable
    @SerialName("pen")
    data class Pen(
        val tool: String = "freehand",
        val phase: String,
        val color: String = "#FFD400",
        /** Batched points: [x, y, pressure, clientTsMs]. */
        val pts: List<List<Double>> = emptyList(),
    ) : PenMessage

    @Serializable
    @SerialName("shape")
    data class Shape(
        val tool: String,
        val from: List<Double>,
        val to: List<Double>,
        val color: String = "#FFFFFF",
    ) : PenMessage

    @Serializable
    @SerialName("transport")
    data class Transport(val cmd: String, val value: Double = 0.0) : PenMessage

    @Serializable
    @SerialName("clear")
    data object Clear : PenMessage

    @Serializable
    @SerialName("undo")
    data object Undo : PenMessage

    /** Latency probe: the TV answers with [TvMessage.Pong] carrying the same id. */
    @Serializable
    @SerialName("ping")
    data class Ping(val id: Long) : PenMessage
}

/** TV -> phone messages. */
@Serializable
sealed interface TvMessage {

    @Serializable
    @SerialName("welcome")
    data class Welcome(val sessionId: String, val videoAspect: Double, val accepted: Boolean) : TvMessage

    @Serializable
    @SerialName("state")
    data class State(val t: Long, val paused: Boolean, val rate: Double, val annotationCount: Int) : TvMessage

    @Serializable
    @SerialName("pong")
    data class Pong(val id: Long) : TvMessage

    @Serializable
    @SerialName("error")
    data class Error(val message: String) : TvMessage
}

val ProtocolJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "type"
}

fun decodePenMessage(text: String): PenMessage =
    ProtocolJson.decodeFromString(PenMessage.serializer(), text)

fun TvMessage.encode(): String = ProtocolJson.encodeToString(TvMessage.serializer(), this)
