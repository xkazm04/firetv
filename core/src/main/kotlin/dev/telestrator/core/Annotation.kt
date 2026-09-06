package dev.telestrator.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Time-anchored vector annotation document (design doc D6 / section 3.3).
 *
 * All coordinates are normalized to the *video content rectangle* (0..1 x 0..1), never to the
 * screen. That is what makes a document render identically on a 1080p TV, in the phone preview
 * and in a JVM test with no display attached.
 */
@Serializable
data class AnnotationDoc(
    val schemaVersion: String = "1.0",
    val clipId: String,
    val videoAspect: Double = 16.0 / 9.0,
    val annotations: List<Annotation> = emptyList(),
)

@Serializable
data class Style(
    val color: String = "#FFD400",
    val width: Double = 0.006,
    val variant: String? = null,
)

@Serializable
sealed interface Annotation {
    val id: String
    val fromMs: Long
    val toMs: Long
    val style: Style

    @Serializable
    @SerialName("stroke")
    data class Stroke(
        override val id: String,
        override val fromMs: Long,
        override val toMs: Long,
        override val style: Style = Style(),
        /** Each point is [x, y, pressure], all normalized. */
        val points: List<List<Double>> = emptyList(),
    ) : Annotation

    @Serializable
    @SerialName("arrow")
    data class Arrow(
        override val id: String,
        override val fromMs: Long,
        override val toMs: Long,
        override val style: Style = Style(color = "#FFFFFF"),
        val from: List<Double>,
        val to: List<Double>,
    ) : Annotation

    @Serializable
    @SerialName("circle")
    data class Circle(
        override val id: String,
        override val fromMs: Long,
        override val toMs: Long,
        override val style: Style = Style(),
        val center: List<Double>,
        val radius: Double,
    ) : Annotation

    @Serializable
    @SerialName("spotlight")
    data class Spotlight(
        override val id: String,
        override val fromMs: Long,
        override val toMs: Long,
        override val style: Style = Style(),
        val center: List<Double>,
        val radius: Double = 0.06,
    ) : Annotation

    @Serializable
    @SerialName("nameTag")
    data class NameTag(
        override val id: String,
        override val fromMs: Long,
        override val toMs: Long,
        override val style: Style = Style(variant = "broadcast"),
        val anchor: List<Double>,
        val label: String,
    ) : Annotation
}

val AnnotationJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "type"
    prettyPrint = false
}

fun AnnotationDoc.encode(): String = AnnotationJson.encodeToString(AnnotationDoc.serializer(), this)

fun decodeDoc(text: String): AnnotationDoc =
    AnnotationJson.decodeFromString(AnnotationDoc.serializer(), text)
